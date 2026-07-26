import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { projectCategories, projects } from '../../data/projects';

const ProjectsPage = () => {
  const [category, setCategory] = useState('All');
  const visible = category === 'All' ? projects : projects.filter((item) => item.category === category);
  return (
    <div className="section-container pb-24 pt-32">
      <Helmet><title>Projects | Md Mehedi Hasan Naeem</title><meta name="description" content="AI, machine learning, IoT, embedded systems, and software projects by Md Mehedi Hasan Naeem." /><link rel="canonical" href="https://mehedinaeem.dev/projects" /></Helmet>
      <h1 className="heading-1">Projects</h1>
      <p className="mt-4 max-w-2xl text-gray-600 dark:text-gray-300">Technical case studies with clear problems, methods, contributions, results, and limitations.</p>
      <div className="my-8 flex flex-wrap gap-2" aria-label="Filter projects">
        {projectCategories.map((item) => <button key={item} onClick={() => setCategory(item)} aria-pressed={category === item} className={`rounded-full px-4 py-2 text-sm font-semibold ${category === item ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>{item}</button>)}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {visible.map((project) => (
          <article className="card overflow-hidden" key={project.slug}>
            <img src={project.image} alt={project.imageAlt} width="800" height="450" loading="lazy" decoding="async" className="aspect-video w-full object-cover" />
            <div className="p-6"><p className="text-xs font-bold uppercase text-primary-600">{project.category} · {project.status}</p><h2 className="mt-2 text-2xl font-bold"><Link to={`/projects/${project.slug}`}>{project.title}</Link></h2><p className="mt-3 text-gray-600 dark:text-gray-300">{project.problem}</p><Link className="mt-5 inline-block font-semibold text-primary-600" to={`/projects/${project.slug}`}>Read case study →</Link></div>
          </article>
        ))}
      </div>
    </div>
  );
};
export default ProjectsPage;
