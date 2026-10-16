#!/usr/bin/env python3
"""Validate content integrity and local references without a server or browser."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse, unquote
from collections import Counter
import hashlib, json, re, sys

ROOT=Path(__file__).resolve().parents[1]
SITE=ROOT/'website'
errors=[]
checks=[]

def require(condition,message):
    if not condition:errors.append(message)

class Document(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids=[];self.refs=[];self.images=[];self.dialogIds=[];self.tags=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs);self.tags.append((tag,a))
        if a.get('id'):self.ids.append(a['id'])
        for key in ['href','src']:
            if a.get(key):self.refs.append((tag,key,a[key]))
        if tag=='img':self.images.append(a)

def walk(value):
    if isinstance(value,dict):
        for k,v in value.items():
            if isinstance(v,str):yield k,v
            else:yield from walk(v)
    elif isinstance(value,list):
        for item in value:yield from walk(item)

def main():
    data=json.loads((ROOT/'content/portfolio.json').read_text())
    manifest=json.loads((ROOT/'content/asset-manifest.json').read_text())
    inventory=json.loads((ROOT/'content/original-file-inventory.json').read_text())
    html=(SITE/'index.html').read_text()
    document=Document();document.feed(html)
    duplicates=[k for k,v in Counter(document.ids).items() if v>1]
    require(not duplicates,'Duplicate HTML IDs: '+str(duplicates))
    ids=set(document.ids)
    require(len([1 for t,a in document.tags if t=='h1'])==1,'Expected exactly one H1.')
    require(all(a.get('alt','').strip() for a in document.images),'Every content image must have descriptive alt text.')
    for tag,key,reference in document.refs:
        if reference.startswith('#'):
            require(reference[1:] in ids,'Missing section target: '+reference)
        elif not urlparse(reference).scheme:
            path=SITE/unquote(reference.split('#')[0].split('?')[0])
            require(path.is_file() and path.stat().st_size>0,'Missing or empty HTML file reference: '+reference)
        if tag=='a' and reference.startswith('https://'):
            attrs=next((a for t,a in document.tags if t=='a' and a.get('href')==reference),{})
            if attrs.get('target')=='_blank':require('noopener' in attrs.get('rel',''),'Missing noopener: '+reference)
    checks.append(f'HTML structure: unique IDs, one H1, {len(document.images)} described images, section targets, and local references.')

    for key,value in walk(data):
        if value.startswith('assets/'):
            path=SITE/value
            require(path.is_file() and path.stat().st_size>0,'Missing or empty structured-content asset: '+value)
        if key in {'url','github','sourceUrl','verificationUrl'}:
            require(value.startswith(('https://','assets/')),'Unsupported URL scheme: '+value)
        require(not re.search(r'ADD (?:AUTHORS|DATE|PROJECT|INDIVIDUAL|MEASURABLE)',value),'Placeholder in source content: '+value)
    require(not re.search(r'@@[A-Z_]+@@',html),'Unresolved HTML template token.')
    for item in manifest:
        for key in ['websitePath','documentPath']:
            if item.get(key):
                path=SITE/item[key]
                require(path.is_file() and path.stat().st_size>0,'Missing or empty manifest website asset: '+item[key])
        if item.get('sourceFile'):require((ROOT/item['sourceFile']).is_file(),'Missing manifest source file: '+item['sourceFile'])
    checks.append(f'Structured content and {len(manifest)} asset mappings resolve to local files.')

    require(len(inventory)==20,'Expected all 20 original uploaded files.')
    for entry in inventory:
        path=ROOT/entry['path']
        require(path.is_file(),'Missing original upload: '+entry['filename'])
        if path.is_file():require(hashlib.sha256(path.read_bytes()).hexdigest()==entry['sha256'],'Changed original upload: '+entry['filename'])
    checks.append('All 20 original upload hashes match the preserved source bytes.')

    papers=data['publications'];metrics=data['metrics']
    actual={'conferencePapers':len(papers),'firstAuthorConferencePapers':sum(bool(p['firstAuthor']) for p in papers),'publishedInIEEEXplore':sum(p['statusKey']=='published' for p in papers),'presentedPublicationInProgress':sum(p['statusKey']=='presented' for p in papers),'acceptedAwaitingPresentation':sum(p['statusKey']=='accepted' for p in papers),'journalUnderReview':len(data['journalManuscripts']),'publicPreprints':sum(bool(p.get('arxiv')) for p in papers)}
    require(actual==metrics,'Research metrics disagree with record statuses.')
    require((actual['conferencePapers'],actual['publishedInIEEEXplore'],actual['presentedPublicationInProgress'],actual['acceptedAwaitingPresentation'])==(7,1,2,4),'Source snapshot research status totals changed unexpectedly.')
    require(len({p['title'].lower() for p in papers})==len(papers),'Duplicate conference-paper title.')
    require(len({p['id'] for p in papers})==len(papers),'Duplicate publication ID.')
    require(len(data['abstractPresentations'])==4,'Expected four separate certificate-backed abstract/presentation records.')
    require(len(data['projects'])==12,'Expected twelve selected projects.')
    for project in data['projects']:
        cover=project.get('cover')
        require(bool(cover and cover.get('src')),'Missing project cover: '+project['id'])
        require(bool(project.get('images')),'Missing project gallery image: '+project['id'])
        if cover:
            require(cover.get('containsProjectName') is True,'Project name must be present in the cover: '+project['id'])
            require(cover.get('sourceType') in {'image_gen','website_screenshot'},'Unclear project cover provenance: '+project['id'])
    rendered_covers=[a for t,a in document.tags if t=='button' and 'named-cover' in a.get('class','').split()]
    require(len(rendered_covers)==12,'Expected a real image cover on all twelve project cards.')
    checks.append('All 12 project cards use named image assets with recorded provenance.')
    for name in ['publications','journalManuscripts','abstractPresentations','projects','experience','awards','certifications','conferences','sports']:
        require(len({x['id'] for x in data[name]})==len(data[name]),'Duplicate ID within '+name)
    require(next(x for x in data['sports'] if x['id']=='run')['distanceKm']==7.5,'Running distance correction missing.')
    require(next(x for x in data['sports'] if x['id']=='run')['timeMinutes']==35,'Running time correction missing.')
    require('Captain' in next(x for x in data['sports'] if x['id']=='cricket')['title'],'CSE Fest captain correction missing.')
    require(next(x for x in data['experience'] if x['id']=='programming-hero')['durationMonths']==5,'Programming Hero duration correction missing.')
    checks.append('Research counts, distinct entries, selected projects, and user corrections are consistent.')

    javascript=(SITE/'content.js').read_text()
    public=json.loads(javascript.removeprefix('window.PORTFOLIO = ').strip().removesuffix(';'))
    require('ownerNotes' not in public and 'editorialRules' not in public,'Owner notes leaked into public data.')
    require(not (SITE/'Research_assistant.pdf').exists(),'RA letter unexpectedly at public root.')
    require(not any(p.name in {'Research_assistant.pdf','standford.pdf'} for p in SITE.rglob('*')),'Owner evidence unexpectedly inside website/.')
    require('22102024' not in javascript and '10830' not in javascript,'Student identifiers leaked into public source data.')
    require(not re.search(r'\bfetch\s*\(|XMLHttpRequest|apiKey', (SITE/'app.js').read_text()),'Unexpected runtime network dependency.')
    require('target="_blank"' not in html or 'noopener' in html,'External link policy missing.')
    for tag,attrs in document.tags:
        if tag=='script' and attrs.get('src'):require(not urlparse(attrs['src']).scheme,'External runtime script dependency.')
    checks.append('Public/private directory boundary and dependency-free frontend source checked.')

    try:
        from PIL import Image
        image_count=0
        for path in (SITE/'assets').rglob('*'):
            if path.suffix.lower() in {'.webp','.png','.jpg','.jpeg'}:
                try:
                    with Image.open(path) as im:im.verify()
                    image_count+=1
                except Exception as ex:errors.append('Unreadable image '+str(path.relative_to(SITE))+': '+str(ex))
        checks.append(f'Pillow image decoding checks: {image_count} images passed.')
    except ImportError:
        checks.append('Optional Pillow image decoding skipped; Pillow is not installed.')

    report={'result':'passed' if not errors else 'failed','scope':'Static integrity and source validation; not browser visual or interaction QA.','checks':checks,'errors':errors,'counts':{'originalUploads':len(inventory),'projects':len(data['projects']),'roles':len(data['experience']),'researchRecords':len(papers)+len(data['journalManuscripts'])+len(data['abstractPresentations'])},'metrics':actual}
    (ROOT/'docs/validation-report.json').write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps(report,indent=2))
    return 1 if errors else 0

if __name__=='__main__':sys.exit(main())
