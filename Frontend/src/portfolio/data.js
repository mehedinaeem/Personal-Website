import content from './content.json';
export default content;
export const researchGroups = {
  conference: content.publications,
  journal: content.journalManuscripts,
  preprints: content.publications.filter(p => p.arxiv),
  abstracts: content.abstractPresentations,
};
export function bibtex(p) {
  if (!p.citationKey) return '';
  const fields = { title: p.title, author: p.authors.join(' and '), year: p.year,
    ...(p.doi ? { booktitle: p.venue, doi: p.doi } : { note: `${p.status}; ${p.venue}` }),
    ...(p.arxiv ? { eprint: p.arxiv, archivePrefix: 'arXiv' } : {}) };
  return `@${p.doi ? 'inproceedings' : 'unpublished'}{${p.citationKey},\n${Object.entries(fields).map(([k,v]) => `  ${k} = {${v}}`).join(',\n')}\n}`;
}
export function downloadCitation(p) {
  const url = URL.createObjectURL(new Blob([bibtex(p)], { type: 'text/plain' }));
  const a = document.createElement('a'); a.href = url; a.download = `${p.citationKey}.bib`; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
