import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Gallery, Section } from './components';

export default function ExperienceTimeline({ entries }) {
  const [expanded, setExpanded] = useState(null);
  const reducedMotion = useReducedMotion();
  // Compare only established start-date precision; do not infer months for years.
  const ordered = [...entries].sort((a, b) => (b.start || '').localeCompare(a.start || ''));

  return <Section id="experience" eyebrow="03 / People & purpose" title="Where I contribute.">
    <div className="pf-experience-timeline">
      {ordered.map((entry, index) => {
        const open = expanded === entry.id;
        const buttonId = `experience-${entry.id}`;
        const panelId = `${buttonId}-details`;
        const title = entry.role.includes(entry.organization) ? entry.role : `${entry.role} — ${entry.organization}`;
        return <motion.article key={entry.id} className={`pf-experience-entry ${open ? 'is-open' : ''}`}
          initial={reducedMotion ? false : { opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: reducedMotion ? 0 : 0.22, delay: reducedMotion ? 0 : Math.min(index * 0.025, 0.12) }}>
          <h3 className="pf-experience-heading"><button type="button" id={buttonId}
            className="pf-experience-toggle" aria-expanded={open} aria-controls={panelId}
            onClick={() => setExpanded(open ? null : entry.id)}>
            <span className="pf-experience-title">{title}</span>
            <span className="pf-experience-date">{entry.period}</span>
            <span className="pf-experience-indicator" aria-hidden="true">+</span>
          </button></h3>
          <div id={panelId} role="region" aria-labelledby={buttonId} aria-hidden={!open}
            inert={!open} className="pf-experience-panel">
            <div className="pf-experience-panel-clip"><div className="pf-experience-details">
              <p className="pf-venue">{entry.organization}</p>
              <p>{entry.summary}</p>
              {entry.details?.length > 0 && <ul>{entry.details.map(detail => <li key={detail}>{detail}</li>)}</ul>}
              {entry.image && <Gallery images={[entry.image]} />}
              {entry.url && <a href={entry.url} target="_blank" rel="noreferrer">Visit organization ↗</a>}
            </div></div>
          </div>
        </motion.article>;
      })}
    </div>
  </Section>;
}
