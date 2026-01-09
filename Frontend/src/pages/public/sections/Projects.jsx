/**
 * Projects Section
 * Filterable project grid with modal details
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiExternalLink, HiCode, HiX } from 'react-icons/hi';
import { FaGithub } from 'react-icons/fa';
import { SectionWrapper, Button, Badge, Modal } from '../../../components';

const categories = ['All', 'Web App', 'Mobile', 'Backend', 'AI/ML'];

const projects = [
    {
        id: 1,
        title: 'E-Commerce Platform',
        description: 'A full-featured e-commerce platform with payment integration, inventory management, and analytics dashboard.',
        longDescription: 'Built a comprehensive e-commerce solution featuring user authentication, product catalog, shopping cart, Stripe payment integration, order management, and admin dashboard. Implemented real-time inventory tracking and sales analytics.',
        image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop',
        category: 'Web App',
        technologies: ['React', 'Node.js', 'MongoDB', 'Stripe', 'Redux'],
        liveUrl: '#',
        githubUrl: '#',
        featured: true,
    },
    {
        id: 2,
        title: 'Task Management App',
        description: 'Collaborative project management tool with real-time updates and team features.',
        longDescription: 'A Trello-like project management application with drag-and-drop functionality, real-time collaboration using WebSockets, team workspaces, and deadline tracking with notifications.',
        image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&h=400&fit=crop',
        category: 'Web App',
        technologies: ['Next.js', 'PostgreSQL', 'Prisma', 'Socket.io'],
        liveUrl: '#',
        githubUrl: '#',
        featured: true,
    },
    {
        id: 3,
        title: 'Fitness Tracker',
        description: 'Cross-platform mobile app for tracking workouts, nutrition, and health metrics.',
        longDescription: 'A comprehensive fitness application with workout logging, meal planning, progress tracking, and integration with health devices. Features include customizable workout plans and social sharing.',
        image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&h=400&fit=crop',
        category: 'Mobile',
        technologies: ['React Native', 'Firebase', 'HealthKit', 'Charts'],
        liveUrl: '#',
        githubUrl: '#',
        featured: false,
    },
    {
        id: 4,
        title: 'AI Content Generator',
        description: 'AI-powered tool for generating marketing copy, blog posts, and social media content.',
        longDescription: 'Leveraging OpenAI GPT models to create various types of content. Features include tone customization, multiple output formats, content templates, and history management.',
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop',
        category: 'AI/ML',
        technologies: ['Python', 'FastAPI', 'OpenAI', 'React'],
        liveUrl: '#',
        githubUrl: '#',
        featured: true,
    },
    {
        id: 5,
        title: 'API Gateway Service',
        description: 'Microservices API gateway with rate limiting, authentication, and monitoring.',
        longDescription: 'A production-ready API gateway supporting multiple authentication methods, rate limiting, request transformation, load balancing, and comprehensive logging with metrics dashboard.',
        image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=400&fit=crop',
        category: 'Backend',
        technologies: ['Go', 'Redis', 'Docker', 'Prometheus'],
        liveUrl: '#',
        githubUrl: '#',
        featured: false,
    },
    {
        id: 6,
        title: 'Social Media Dashboard',
        description: 'Analytics dashboard for managing multiple social media accounts.',
        longDescription: 'Centralized dashboard for social media management with scheduled posting, engagement analytics, audience insights, and cross-platform content calendar.',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop',
        category: 'Web App',
        technologies: ['Vue.js', 'Django', 'PostgreSQL', 'Charts.js'],
        liveUrl: '#',
        githubUrl: '#',
        featured: false,
    },
];

const ProjectCard = ({ project, onClick }) => (
    <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        className="card overflow-hidden group cursor-pointer"
        onClick={() => onClick(project)}
    >
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
            <img
                src={project.image}
                alt={project.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Overlay buttons */}
            <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-3 rounded-full bg-white/90 hover:bg-white transition-colors"
                    aria-label="Live demo"
                >
                    <HiExternalLink className="w-5 h-5 text-gray-900" />
                </a>
                <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-3 rounded-full bg-white/90 hover:bg-white transition-colors"
                    aria-label="GitHub"
                >
                    <FaGithub className="w-5 h-5 text-gray-900" />
                </a>
            </div>

            {/* Featured badge */}
            {project.featured && (
                <div className="absolute top-4 left-4">
                    <Badge variant="primary">Featured</Badge>
                </div>
            )}
        </div>

        {/* Content */}
        <div className="p-6">
            <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{project.category}</Badge>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {project.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                {project.description}
            </p>

            {/* Tech stack */}
            <div className="mt-4 flex flex-wrap gap-2">
                {project.technologies.slice(0, 3).map((tech) => (
                    <span
                        key={tech}
                        className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-dark-200 text-gray-600 dark:text-gray-400"
                    >
                        {tech}
                    </span>
                ))}
                {project.technologies.length > 3 && (
                    <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-dark-200 text-gray-600 dark:text-gray-400">
                        +{project.technologies.length - 3} more
                    </span>
                )}
            </div>
        </div>
    </motion.div>
);

const Projects = () => {
    const [activeCategory, setActiveCategory] = useState('All');
    const [selectedProject, setSelectedProject] = useState(null);

    const filteredProjects = activeCategory === 'All'
        ? projects
        : projects.filter((p) => p.category === activeCategory);

    return (
        <SectionWrapper
            id="projects"
            title="My Projects"
            subtitle="Some of the things I've built"
            dark
        >
            {/* Filter */}
            <div className="flex flex-wrap justify-center gap-2 mb-10">
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === category
                            ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                            : 'bg-white dark:bg-dark-100 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-200'
                            }`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* Projects Grid */}
            <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {filteredProjects.map((project) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            onClick={setSelectedProject}
                        />
                    ))}
                </AnimatePresence>
            </motion.div>

            {/* Project Modal */}
            <Modal
                isOpen={!!selectedProject}
                onClose={() => setSelectedProject(null)}
                title={selectedProject?.title}
                size="lg"
            >
                {selectedProject && (
                    <div>
                        <img
                            src={selectedProject.image}
                            alt={selectedProject.title}
                            className="w-full h-64 object-cover rounded-xl mb-6"
                        />
                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                                <Badge>{selectedProject.category}</Badge>
                                {selectedProject.featured && <Badge variant="primary">Featured</Badge>}
                            </div>
                            <p className="text-gray-600 dark:text-gray-400">
                                {selectedProject.longDescription}
                            </p>
                            <div>
                                <h4 className="font-medium mb-2">Technologies Used:</h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedProject.technologies.map((tech) => (
                                        <span
                                            key={tech}
                                            className="px-3 py-1 rounded-full bg-gray-100 dark:bg-dark-200 text-sm"
                                        >
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button
                                    as="a"
                                    href={selectedProject.liveUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    icon={HiExternalLink}
                                >
                                    Live Demo
                                </Button>
                                <Button
                                    variant="secondary"
                                    as="a"
                                    href={selectedProject.githubUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    icon={FaGithub}
                                >
                                    View Code
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </SectionWrapper>
    );
};

export default Projects;
