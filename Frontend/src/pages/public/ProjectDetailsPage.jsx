import { Helmet } from 'react-helmet-async';
import { Link, Navigate, useParams } from 'react-router-dom';
import { getProject } from '../../data/projects';

const Row = ({ title, children }) => <section className="border-t border-gray-200 py-7 dark:border-gray-800"><h2 className="text-xl font-bold">{title}</h2><div className="mt-3 leading-relaxed text-gray-600 dark:text-gray-300">{children}</div></section>;
const ProjectDetailsPage = () => {
  const { slug } = useParams();
  const project = getProject(slug);
  if (!project) return <Navigate to="/404" replace />;
  const url = `https://mehedinaeem.dev/projects/${project.slug}`;
  return (
    <article className="section-container max-w-5xl pb-24 pt-32">
      <Helmet><title>{project.title} | Projects</title><meta name="description" content={project.problem} /><link rel="canonical" href={url} /><meta property="og:title" content={project.title} /><meta property="og:description" content={project.problem} /><meta property="og:url" content={url} /></Helmet>
      <nav aria-label="Breadcrumb" className="mb-7 text-sm"><Link to="/">Home</Link> / <Link to="/projects">Projects</Link> / <span aria-current="page">{project.title}</span></nav>
      <p className="font-bold uppercase tracking-wider text-primary-600">{project.category} · {project.status}</p><h1 className="heading-1 mt-3">{project.title}</h1>
      <img src={project.image} alt={project.imageAlt} width="1200" height="675" className="mt-8 aspect-video w-full rounded-2xl object-cover" />
      <Row title="Project overview">{project.approach}</Row><Row title="Problem">{project.problem}</Row>
      <Row title="Objectives"><ul className="list-disc pl-5">{project.objectives.map((item) => <li key={item}>{item}</li>)}</ul></Row>
      <Row title="System architecture"><p>{project.architecture}</p></Row><Row title="Methodology"><p>{project.methodology}</p></Row>
      <Row title="Dataset or hardware"><p>{project.datasetHardware}</p></Row>
      <Row title="Technologies"><ul className="flex flex-wrap gap-2">{project.technologies.map((item) => <li className="rounded bg-gray-100 px-3 py-1 dark:bg-gray-800" key={item}>{item}</li>)}</ul></Row>
      <Row title="Results"><p>{project.results}</p></Row><Row title="My contribution"><p>{project.contribution}</p></Row>
      <Row title="Limitations"><p>{project.limitations}</p></Row><Row title="Future work"><p>{project.futureWork}</p></Row>
      <Row title="Project links"><div className="flex flex-wrap gap-4">{project.github && <a href={project.github} target="_blank" rel="noreferrer">GitHub ↗</a>}{project.demo && <a href={project.demo} target="_blank" rel="noreferrer">Live demo ↗</a>}{project.paper && <a href={project.paper}>Paper ↗</a>}{!project.github && !project.demo && !project.paper && <span>Links will be added when publicly available.</span>}</div></Row>
    </article>
  );
};
export default ProjectDetailsPage;
