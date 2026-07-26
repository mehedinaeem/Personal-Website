import { HiExternalLink } from 'react-icons/hi';
import { SectionWrapper } from '../../../components';
import { achievements } from '../../../data/achievements';

const Achievements = () => (
  <SectionWrapper id="achievements" title="Selected Achievements" subtitle="Research recognition, technical leadership, and competition outcomes">
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {achievements.map((item) => (
        <article className="card p-6" key={item.title}>
          <p className="text-xs font-bold uppercase tracking-wider text-primary-600">{item.category}</p>
          <h3 className="mt-3 text-lg font-bold">{item.title}</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{item.issuer} · {item.year}</p>
          {item.evidence && <a className="mt-5 inline-block text-sm font-semibold text-primary-600" href={item.evidence} target="_blank" rel="noreferrer">View evidence <HiExternalLink className="inline" /></a>}
        </article>
      ))}
    </div>
  </SectionWrapper>
);
export default Achievements;
