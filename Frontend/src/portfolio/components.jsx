import { useEffect, useId, useRef, useState } from 'react';
import { bibtex, downloadCitation } from './data';

export function Links({ items = [] }) {
  return <div className="pf-links">{items.map(l => <a key={l.url} href={l.url} target={/^https?:/.test(l.url) ? "_blank" : undefined} rel="noreferrer">{l.label} <span aria-hidden="true">↗</span></a>)}</div>;
}
export function Section({ id, eyebrow, title, children }) {
  return <section id={id} className="pf-section"><div className="pf-section-heading"><p className="pf-eyebrow">{eyebrow}</p><h2>{title}</h2></div>{children}</section>;
}
export function Dialog({ title, children, onClose }) {
  const ref = useRef(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement;
    dialog.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = overflow; previous?.focus(); };
  }, []);
  return <dialog ref={ref} className="pf-dialog" aria-labelledby={titleId} onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) onClose(); }}><div className="pf-dialog-head"><h2 id={titleId}>{title}</h2><button autoFocus onClick={onClose} aria-label="Close dialog">✕</button></div>{children}</dialog>;
}
export function Gallery({ images = [] }) {
  const [selected, setSelected] = useState(0);
  const [large, setLarge] = useState(false);
  if (!images.length) return null;
  const step = delta => setSelected(index => (index + delta + images.length) % images.length);
  const viewer = <div className="pf-viewer" tabIndex={0} onKeyDown={e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); step(e.key === 'ArrowLeft' ? -1 : 1); } }}>
    <figure><img className="pf-full-image" src={images[selected].src} alt={images[selected].alt} /><figcaption>{images[selected].caption || images[selected].alt}</figcaption></figure>
    <div className="pf-gallery-controls">{images.length > 1 && <button onClick={() => step(-1)} aria-label="Previous image">←</button>}<span aria-live="polite">{selected + 1} / {images.length}</span>{images.length > 1 && <button onClick={() => step(1)} aria-label="Next image">→</button>}{!large && <button onClick={() => setLarge(true)}>Enlarge image</button>}</div>
  </div>;
  return large ? <Dialog title="Image gallery" onClose={() => setLarge(false)}>{viewer}</Dialog> : viewer;
}
export function PaperReading({ paper: p }) {
  return <div className="pf-reading"><p className="pf-tag">{p.status}</p><p className="pf-authors">{p.authors?.join(', ')}</p><p className="pf-venue">{p.venue}{p.year && ` · ${p.year}`}</p><h3>{p.abstract ? 'Abstract' : 'Research summary'}</h3><p>{p.abstract || p.displaySummary || p.summary}</p>{p.abstractSource && <Links items={[{label:'Abstract source · arXiv',url:p.abstractSource}]} />}{!p.abstract && <p className="pf-note">The original abstract has not been established; this is a summary of the research record.</p>}{p.fullPaper ? <div className="pf-actions"><a className="pf-primary" href={p.fullPaper} target="_blank" rel="noreferrer">Read full paper ↗</a></div> : <p className="pf-note">A public full-paper link is not currently available.</p>}<Links items={p.links} />{p.certificate && <a href={p.certificate} target="_blank" rel="noreferrer">Presentation certificate ↗</a>}</div>;
}
export function ResearchCard({ paper: p }) {
  const [citation, setCitation] = useState(false);
  const [reading, setReading] = useState(false);
  const [message, setMessage] = useState('');
  async function copy() {
    try { await navigator.clipboard.writeText(bibtex(p)); setMessage('BibTeX copied.'); }
    catch { setMessage('Copy is unavailable. Select the citation below or download it.'); }
  }
  return <article className="pf-paper"><div className="pf-paper-meta"><span className={`pf-tag ${p.statusKey}`}>{p.status}</span><span>{p.year}</span></div><h3><button className="pf-card-trigger" onClick={() => setReading(true)}>{p.title}<span className="pf-card-arrow" aria-hidden="true">↗</span></button></h3>{p.titleType && <p className="pf-note">Descriptive topic; formal manuscript title not supplied.</p>}{p.authors?.length > 0 && <p className="pf-authors">{p.authors.join(', ')}</p>}<p className="pf-venue">{p.venue}</p><span className="pf-read-label">Read abstract & details ↗</span>{p.fullPaper && <a className="pf-secondary-action" href={p.fullPaper} target="_blank" rel="noreferrer">Read full paper ↗</a>}{reading && <Dialog title={p.title} onClose={() => setReading(false)}><PaperReading paper={p} /></Dialog>}{p.certificate && <a href={p.certificate}>Presentation certificate ↗</a>}{p.citationKey && <button className="pf-text-button" onClick={() => setCitation(true)}>BibTeX ↗</button>}{citation && <Dialog title="Citation" onClose={() => { setCitation(false); setMessage(''); }}><pre>{bibtex(p)}</pre><div className="pf-actions"><button onClick={copy}>Copy BibTeX</button><button onClick={() => downloadCitation(p)}>Download .bib</button></div><p role="status">{message}</p></Dialog>}</article>;
}
export function ProjectCard({ project: p }) {
  const [open, setOpen] = useState(false);
  return <article className="pf-card pf-project">{(p.cover || p.images?.[0]) ? <img className="pf-project-image" src={(p.cover || p.images[0]).src} alt={(p.cover || p.images[0]).alt} loading="lazy" /> : <div className="pf-project-placeholder" aria-hidden="true">{'</>'}</div>}<div className="pf-card-body"><p className="pf-eyebrow">{p.category}</p><h3><button className="pf-card-trigger" onClick={() => setOpen(true)}>{p.title}<span className="pf-card-arrow" aria-hidden="true">↗</span></button></h3><p>{p.summary}</p><div className="pf-tags">{p.technologies.map(t => <span key={t}>{t}</span>)}</div><span className="pf-read-label">Explore project ↗</span><Links items={p.links?.length ? p.links : p.github ? [{label:"GitHub",url:p.github}] : []} /></div>{open && <Dialog title={p.title} onClose={() => setOpen(false)}><p className="pf-tag">{p.status}</p>{['problem','approach','scope','limitations'].map(k => p[k] && <div className="pf-detail" key={k}><h3>{k === 'limitations' ? 'Current limitations' : k}</h3><p>{p[k]}</p></div>)}{p.details?.map(t => <p key={t}>{t}</p>)}<div className="pf-tags">{p.technologies.map(t => <span key={t}>{t}</span>)}</div><Links items={p.links?.length ? p.links : [{ label: 'GitHub', url: p.github }]} /><Gallery images={p.images} /></Dialog>}</article>;
}
export function EvidenceCard({ item: i }) {
  const [open, setOpen] = useState(false);
  const images = i.images || (i.image ? [i.image] : []);
  const links = [...(i.document || i.certificate ? [{label:'Original document',url:i.document || i.certificate}] : []), ...(i.verificationUrl ? [{label:'Verify credential',url:i.verificationUrl}] : [])];
  return <article className="pf-card pf-evidence">{(i.cover || images[0]) && <img className={`pf-evidence-image ${i.cover ? "pf-award-cover" : ""}`} src={(i.cover || images[0]).src} alt={(i.cover || images[0]).alt} loading="lazy" />}<div className="pf-card-body"><p className="pf-eyebrow">{i.date || i.year || i.role}</p><h3><button className="pf-card-trigger" onClick={() => setOpen(true)}>{i.title || i.name}<span className="pf-card-arrow" aria-hidden="true">↗</span></button></h3><p className="pf-venue">{i.issuer || i.event || i.fullName}</p><p>{i.displaySummary || i.summary}</p><Links items={links} /></div>{open && <Dialog title={i.title || i.name} onClose={() => setOpen(false)}><p>{i.date || i.year}</p><p>{i.issuer || i.event || i.fullName}</p>{i.location && <p>{i.location}</p>}{i.work && <p>{i.work}{i.paperId && ` · Paper ${i.paperId}`}</p>}<p>{i.displaySummary || i.summary}</p><Gallery images={images} /><Links items={links} /></Dialog>}</article>;
}
