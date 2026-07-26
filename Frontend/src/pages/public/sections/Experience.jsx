import { SectionWrapper } from '../../../components';
import { experiences } from '../../../data/experience';

const Experience = () => (
  <SectionWrapper id="experience" title="Experience and Leadership" subtitle="Research, technical community, and professional contributions" dark>
    <ol className="relative border-l border-gray-200 dark:border-gray-700">
      {experiences.map((item) => (
        <li className="mb-10 ml-7" key={`${item.position}-${item.organization}`}>
          <span className="absolute -left-2 mt-2 h-4 w-4 rounded-full bg-primary-500 ring-4 ring-white dark:ring-dark-200" />
          <article className="card p-6">
            <p className="text-sm font-semibold text-primary-600">{item.startDate} — {item.endDate}</p>
            <h3 className="mt-1 text-xl font-bold">{item.position}</h3>
            <p className="text-gray-600 dark:text-gray-300"><a href={item.organizationUrl} target="_blank" rel="noreferrer">{item.organization}</a> · {item.location}</p>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-gray-600 dark:text-gray-300">{item.responsibilities.map((value) => <li key={value}>{value}</li>)}</ul>
            {item.outcomes.map((value) => <p className="mt-3 text-sm" key={value}><strong>Outcome:</strong> {value}</p>)}
          </article>
        </li>
      ))}
    </ol>
  </SectionWrapper>
);
export default Experience;
