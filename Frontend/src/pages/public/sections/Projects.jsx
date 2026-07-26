import { Link } from 'react-router-dom';
import { SectionWrapper } from '../../../components';
import { projects } from '../../../data/projects';

const Projects = () => (
  <SectionWrapper id="projects" title="Featured Projects" subtitle="Selected systems spanning AI, edge computing, IoT, and research software">
    <div className="grid gap-7 lg:grid-cols-3">
      {projects.filter((project) => project.featured).map((project) => (
        <article key={project.slug} className="card overflow-hidden flex flex-col">
          <img src={project.image} alt={project.imageAlt} width="800" height="450" loading="lazy" decoding="async" className="aspect-video w-full object-cover" />
          <div className="flex flex-1 flex-col p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-primary-600">{project.category}</p>
            <h3 className="mt-2 text-xl font-bold"><Link to={`/projects/${project.slug}`}>{project.title}</Link></h3>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">{project.problem}</p>
            <p className="mt-4 text-sm"><strong>My role:</strong> {project.contribution}</p>
            <p className="mt-2 text-sm"><strong>Result:</strong> {project.results}</p>
            <ul className="mt-4 flex flex-wrap gap-2">{project.technologies.slice(0, 4).map((tech) => <li className="rounded-md bg-gray-100 px-2 py-1 text-xs dark:bg-gray-800" key={tech}>{tech}</li>)}</ul>
            <div className="mt-auto pt-6 flex flex-wrap gap-4 text-sm font-semibold">
              <Link className="text-primary-600" to={`/projects/${project.slug}`}>Case study →</Link>
              {project.github && <a href={project.github} target="_blank" rel="noreferrer">GitHub ↗</a>}
              {project.demo && <a href={project.demo} target="_blank" rel="noreferrer">Live demo ↗</a>}
            </div>
          </div>
        </article>
      ))}
    </div>
    <div className="mt-8"><Link className="btn btn-secondary" to="/projects">Browse all projects</Link></div>
  </SectionWrapper>
);
export default Projects;
