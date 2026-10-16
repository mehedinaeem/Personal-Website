#!/usr/bin/env python3
"""Build the static portfolio from content/portfolio.json. Python standard library only."""
from pathlib import Path
from html import escape
import json, re

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / 'website'
DATA = json.loads((ROOT / 'content/portfolio.json').read_text())

def e(value):
    return escape(str(value if value is not None else ''), quote=True)

def arrow():
    return '<span aria-hidden="true">↗</span>'

def anchor(url, label, css='', download=False):
    external = str(url).startswith('https://')
    attrs = ' target="_blank" rel="noopener noreferrer"' if external else ''
    attrs += ' download' if download else ''
    return f'<a class="{e(css)}" href="{e(url)}"{attrs}>{e(label)} {arrow() if external else ""}</a>'

def image(info, css='', eager=False):
    return f'<img src="{e(info["src"])}" alt="{e(info["alt"])}" class="{e(css)}" loading="{"eager" if eager else "lazy"}" decoding="async">'

def chips(values):
    return '<div class="chips">'+''.join(f'<span>{e(v)}</span>' for v in values)+'</div>'

def gallery_button(kind, id, text='View photos', css='text-button'):
    return f'<button class="{e(css)}" data-gallery="{e(kind)}" data-id="{e(id)}">{e(text)} <span aria-hidden="true">↗</span></button>'

def authors(names):
    out=[]
    for name in names:
        text=e(name)
        out.append(f'<strong>{text}</strong>' if 'Mehedi' in name and 'Naeem' in name else text)
    return ', '.join(out)

def publication(item, index):
    kind=item['type'];status=item['status'];label={'conference':'Conference paper','journal':'Journal manuscript','abstract':'Abstract / presentation'}[kind]
    title=item['title'];summary=item.get('displaySummary',item.get('summary',''))
    links=''.join(anchor(l['url'],l['label'],'inline-link') for l in item.get('links',[]))
    if item.get('certificate'):links+=anchor(item['certificate'],'Certificate','inline-link')
    if kind=='conference':links+=f'<button class="inline-link" data-cite="{e(item["id"])}">BibTeX</button>'
    keywords=' '.join([title,item['venue'],str(item.get('year') or ''),*item.get('authors',[])])
    return f'''<article class="research-item" data-research-type="{e(kind)}" data-preprint="{str(bool(item.get('arxiv'))).lower()}" data-search="{e(keywords.lower())}" {'hidden' if kind!='conference' else ''}>
      <div class="paper-number">{index:02d}</div><div class="paper-content">
      <div class="paper-topline"><span class="category-label">{e(label)}{(' · '+str(item['year'])) if item.get('year') else ''}</span><span class="status status-{e(item['statusKey'])}">{e(status)}</span></div>
      <h3>{e(title)}</h3>{('<p class="authors">'+authors(item['authors'])+'</p>') if item.get('authors') else ''}
      <p class="venue">{e(item['venue'])}</p><p class="paper-summary">{e(summary)}</p>
      <div class="paper-links">{links}</div></div></article>'''

def project(item, index):
    cover_info=item.get('cover') or (item['images'][0] if item.get('images') else None)
    if cover_info is None:raise ValueError('Every selected project needs an image: '+item['id'])
    cover=image(cover_info)
    return f'''<article class="project-card" data-project-category="{e(item['category'])}">
      <button class="project-cover named-cover" data-project="{e(item['id'])}" aria-label="Read about {e(item['title'])}">{cover}<span class="cover-arrow" aria-hidden="true">↗</span></button>
      <div class="project-body"><div class="project-meta"><span>{e(item['category'])}</span><span>{index:02d}</span></div><h3><button data-project="{e(item['id'])}">{e(item['title'])}</button></h3><p>{e(item['summary'])}</p>{chips(item['technologies'][:4])}<div class="project-footer"><button class="text-button" data-project="{e(item['id'])}">Project details <span aria-hidden="true">↗</span></button>{anchor(item['github'],'GitHub','muted-link')}</div></div></article>'''

def role(item):
    return f'''<article class="role"><div class="role-period">{e(item.get('period') or '')}</div><div><h3>{e(item['role'])}</h3><p class="role-org">{e(item['organization'])}</p><p>{e(item['summary'])}</p>{('<ul>'+''.join('<li>'+e(v)+'</li>' for v in item.get('details',[]))+'</ul>') if item.get('details') else ''}{anchor(item['url'],'Organization','inline-link') if item.get('url') else ''}</div></article>'''

def award(item):
    cover_info=item.get('cover') or item['images'][0]
    photo_count=len(item.get('images',[]))
    return f'''<article class="award-card">
      <div class="award-media">{image(cover_info)}</div>
      <div class="award-card-copy"><span class="award-year">{e(item.get('year') or 'Recognition')}</span>
      <h3><button class="award-card-trigger" data-gallery="awards" data-id="{e(item['id'])}">{e(item['title'])}<span class="sr-only"> — view award details</span></button></h3>
      <p class="award-card-issuer">{e(item['issuer'])}</p><p>{e(item['summary'])}</p>
      <div class="award-card-footer"><span>{photo_count} {'image' if photo_count==1 else 'images'} <span aria-hidden="true">↗</span></span>{anchor(item['document'],'Certificate','inline-link') if item.get('document') else ''}</div>
      </div></article>'''

def certificate(item):
    return f'''<article class="certificate-card"><button class="certificate-image" data-gallery="certifications" data-id="{e(item['id'])}" aria-label="View {e(item['title'])} certificate">{image(item['image'])}</button><div class="certificate-body"><span class="category-label">{e(item.get('date') or 'Participation')}</span><h3>{e(item['title'])}</h3><p>{e(item['issuer'])}</p><div class="paper-links">{anchor(item['document'],'Certificate','inline-link') if item.get('document') else gallery_button('certifications',item['id'],'View certificate','inline-link')}{anchor(item['verificationUrl'],'Verify','inline-link') if item.get('verificationUrl') else ''}</div></div></article>'''

def conference(item):
    return f'''<article class="conference-card"><span class="category-label">{e(item.get('date') or 'Research presentation')}</span><h3>{e(item['name'])}</h3><p class="conference-location">{e(item['location'])}</p><p class="conference-work">{e(item['work'])}</p>{gallery_button('conferences',item['id'],'Photos & certificate')}</article>'''

def sport(item):
    cover=item['images'][1] if item['id']=='cricket' else item['images'][0]
    return f'''<article class="sport-card"><button class="sport-image" data-gallery="sports" data-id="{e(item['id'])}" aria-label="View {e(item['event'])} photos">{image(cover)}</button><div class="sport-copy"><span class="category-label">{e(item['year'])}</span><h3>{e(item['title'])}</h3><p class="sport-event">{e(item['event'])}</p><p>{e(item.get('displaySummary',item['summary']))}</p>{gallery_button('sports',item['id'],'View photos')}</div></article>'''

def bibtex(item):
    published=item['statusKey']=='published'
    fields={'title':item['title'],'author':' and '.join(item['authors']),'year':str(item['year'])}
    if published:
        fields['booktitle']=item['venue'];fields['doi']=item['doi'];fields['url']='https://doi.org/'+item['doi']
    else:
        fields['note']=item['status']+'; '+item['venue']
        if item.get('arxiv'):fields['eprint']=item['arxiv'];fields['archivePrefix']='arXiv';fields['url']='https://arxiv.org/abs/'+item['arxiv']
    # Not-yet-published conference work remains @unpublished, including accepted papers.
    return '@'+('inproceedings' if published else 'unpublished')+'{'+item['citationKey']+',\n'+',\n'.join('  '+k+' = {'+v.replace('–','--')+'}' for k,v in fields.items())+'\n}\n'

def strip_private(value):
    if isinstance(value,list):return [strip_private(v) for v in value]
    if isinstance(value,dict):return {k:strip_private(v) for k,v in value.items() if k not in {'ownerNotes','ownerNote','authorNote','editorialRules','sources'}}
    return value

def build():
    p=DATA['profile'];m=DATA['metrics'];ed=DATA['education'][0]
    biblio='\n'.join(bibtex(x) for x in DATA['publications'])
    (ROOT/'content/publications.bib').write_text(biblio)
    (SITE/'assets/documents/publications.bib').write_text(biblio)
    public=strip_private(DATA)
    public.pop('ownerNotes',None);public.pop('editorialRules',None)
    for item in public['publications']:item['bibtex']=bibtex(item)
    # Plain deferred scripts work from file:// without a web server or runtime fetch.
    (SITE/'content.js').write_text('window.PORTFOLIO = '+json.dumps(public,ensure_ascii=False,indent=2).replace('</','<\\/')+';\n')
    all_research=DATA['publications']+DATA['journalManuscripts']+DATA['abstractPresentations']
    tokens={
     'NAME':e(p['name']),'EMAIL':e(p['email']),'LOCATION':e(p['location']),'INTRO':e(p['intro']),'CV':e(p['cv']),
     'PORTRAIT':image(p['portrait'],'portrait',True),
     'SOCIALS':''.join(anchor(x['url'],x['label'],'social-link') for x in p['socials']),
     'HERO_SOCIALS':''.join(anchor(x['url'],x['label'],'hero-social') for x in p['socials'][:4]),
     'ABOUT':''.join('<p>'+e(t)+'</p>' for t in p['about']),
     'INTERESTS':chips(p['interests']),
     'DEGREE':e(ed['degree']),'UNIVERSITY':e(ed['university']),'EDUCATION_PERIOD':e(ed['period']),'EXPECTED_COMPLETION':e(ed['expectedCompletion']),
     'COURSEWORK':chips(ed['coursework']),
     'RESEARCH':''.join(publication(x,i+1) for i,x in enumerate(all_research)),
     'PAPER_COUNT':str(m['conferencePapers']),'PREPRINT_COUNT':str(m['publicPreprints']),'JOURNAL_COUNT':str(m['journalUnderReview']),'ABSTRACT_COUNT':str(len(DATA['abstractPresentations'])),
     'FIRST_AUTHOR_COUNT':str(m['firstAuthorConferencePapers']),
     'PROJECTS':''.join(project(x,i+1) for i,x in enumerate(DATA['projects'])),
     'PROJECT_FILTERS':''.join(f'<button data-project-filter="{e(x)}" aria-pressed="false">{e(x)}</button>' for x in dict.fromkeys(x['category'] for x in DATA['projects'])),
     'ROLES':''.join(role(x) for x in DATA['experience'][:4]),
     'MORE_ROLES':''.join(role(x) for x in DATA['experience'][4:] if x['id']!='programming-hero'),
     'AWARDS':''.join(award(x) for x in DATA['awards']),
     'CERTIFICATES':''.join(certificate(x) for x in DATA['certifications']),
     'CONFERENCES':''.join(conference(x) for x in DATA['conferences'][1:]),
     'COMPAS_LINK_PLACEHOLDER':anchor('https://arxiv.org/abs/2609.30692','Read the preprint','inline-link')+anchor('assets/documents/compas-lumo-presentation.jpeg','Presentation certificate','inline-link'),
     'SPORTS':''.join(sport(x) for x in DATA['sports']),
     'SKILLS':''.join(f'<div class="skill-group"><h3>{e(g["category"])}</h3>{chips(g["items"])}</div>' for g in DATA['skills']),
     'ACTIVITIES':''.join(f'<div class="activity"><h3>{e(a["title"])}</h3><p>{e(a.get("displayDetail",a["detail"]))}</p></div>' for a in DATA['activities']),
    }
    source=(ROOT/'scripts/index.template.html').read_text()
    for key,value in tokens.items():source=source.replace('@@'+key+'@@',value)
    if re.search(r'@@[A-Z_]+@@',source):raise RuntimeError('Unresolved template tokens')
    (SITE/'index.html').write_text(source)
    print('Built website/index.html, website/content.js, and bibliography files.')

if __name__=='__main__':build()
