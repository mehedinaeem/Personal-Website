import { Link } from 'react-router-dom';
import { HiExternalLink } from 'react-icons/hi';
import { SectionWrapper } from '../../../components';
import { publications } from '../../../data/publications';

const statusStyle = { Published: 'bg-green-100 text-green-800', Presented: 'bg-blue-100 text-blue-800', 'Under review': 'bg-amber-100 text-amber-800' };
const Research = () => (
  <SectionWrapper id="research" title="Research and Publications" subtitle="Peer-reviewed, presented, and ongoing work in intelligent systems" dark>
    <div className="space-y-5">
      {publications.slice(0, 4).map((item) => (
        <article key={item.slug} className="card p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${statusStyle[item.status] || 'bg-gray-100 text-gray-800'}`}>{item.status}</span>
              <h3 className="mt-3 text-xl md:text-2xl font-bold"><Link to={`/research/${item.slug}`} className="hover:text-primary-600">{item.title}</Link></h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{item.venue} · {item.year}</p>
              <p className="mt-4 text-gray-600 dark:text-gray-300">{item.summary}</p>
              <ul className="mt-4 flex flex-wrap gap-2">{item.keywords.map((word) => <li key={word} className="rounded-md bg-gray-100 px-2.5 py-1 text-xs dark:bg-gray-800">{word}</li>)}</ul>
            </div>
            <div className="flex gap-3">
              <Link className="font-semibold text-primary-600" to={`/research/${item.slug}`}>Details</Link>
              {item.doi && <a className="font-semibold text-primary-600" href={item.doi} target="_blank" rel="noreferrer">DOI <HiExternalLink className="inline" /></a>}
            </div>
          </div>
        </article>
      ))}
    </div>
    <div className="mt-8"><Link className="btn btn-secondary" to="/research">View all research</Link></div>
  </SectionWrapper>
);
export default Research;
