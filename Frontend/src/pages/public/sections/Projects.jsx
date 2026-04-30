/**
 * Projects Section
 * Filterable project grid with modal details
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiExternalLink, HiCode, HiX } from 'react-icons/hi';
import { FaGithub } from 'react-icons/fa';
import { SectionWrapper, Button, Badge, Modal } from '../../../components';

const categories = [
    'All',
    'Smart Agriculture',
    'AI Safety',
    'Remote Sensing',
    'Edge AI',
    'Sustainability',
    'Computer Vision',
    'NLP',
    'Smart Infrastructure',
];

const projects = [
    {
        id: 1,
        title: 'Solar-Powered IoT-Based Smart Farming Model (SPISFM)',
        description: 'An IoT-based smart farming system using real-time sensor data, solar-powered automation, mobile monitoring, and AI-based crop health detection.',
        longDescription: 'Conference: IEEE International Conference on Sustainable Technology and Engineering (i-COSTE 2025). Publisher: IEEE. Indexing: IEEE Xplore, Scopus indexed. Status: Accepted and Presented. DOI: 10.1109/i-COSTE68047.2025.11467551. An IoT-based smart farming system that uses real-time soil and environmental sensor data to automate irrigation, monitor field conditions through a mobile application, and support AI-based crop health detection. The system integrates solar-powered automation and reduced water usage by around 30-40% while maintaining nearly 95% uptime.',
        image: '/assets/certifications/spisfm-icoste-2025-certificate.webp',
        category: 'Smart Agriculture',
        technologies: ['Research', 'IoT', 'Smart Agriculture', 'IEEE', 'Accepted'],
        liveUrl: 'https://doi.org/10.1109/i-COSTE68047.2025.11467551',
        liveLabel: 'View DOI',
        githubUrl: null,
        featured: true,
    },
    {
        id: 2,
        title: 'IoT-AI Safety Assistance System for Emergency Response',
        description: 'An IoT and AI-based emergency response support system focused on safety assistance, intelligent monitoring, and rapid response scenarios.',
        longDescription: 'Conference: 13th International BILTEK Congress. Publisher: Liberty Academic / BILTEK Proceedings. Indexing: Google Scholar. ISBN: 979-8-89695-302-9. Status: Presented. An IoT and AI-based emergency response support system focused on safety assistance, intelligent monitoring, and rapid response scenarios.',
        image: '/assets/certifications/iot-ai-safety-biltek-certificate.webp',
        category: 'AI Safety',
        technologies: ['Research', 'IoT', 'AI Safety', 'Emergency Response', 'Presented'],
        liveUrl: null,
        githubUrl: null,
        featured: false,
    },
    {
        id: 3,
        title: 'Intelligent Solar-Based Agricultural Automation System',
        description: 'A solar-powered agricultural automation model designed to improve irrigation, monitoring, and sustainable farming operations.',
        longDescription: 'Conference: MEETCON-WORK International Congress. Publisher: International Academic Proceedings. Indexing: Google Scholar. ISBN: 979-8-89695-268-8. Status: Presented. A solar-powered agricultural automation model designed to improve irrigation, monitoring, and sustainable farming operations.',
        image: '/assets/certifications/intelligent-solar-agri-automation-certificate.webp',
        category: 'Smart Agriculture',
        technologies: ['Research', 'Smart Agriculture', 'Automation', 'Solar Power', 'Presented'],
        liveUrl: null,
        githubUrl: null,
        featured: false,
    },
    {
        id: 4,
        title: 'Deep Learning-Based Tree Canopy Detection for Afforestation',
        description: 'A deep learning-assisted project using satellite imagery, NDVI analysis, GIS processing, and U-Net segmentation to support afforestation planning.',
        longDescription: 'Conference: MEETCON-WORK International Congress. Publisher: International Academic Proceedings. Indexing: Google Scholar possible. ISBN: 979-8-89695-268-8. A deep learning-assisted project using satellite imagery, NDVI analysis, GIS-based spatial processing, and U-Net-based segmentation to detect tree canopy and support afforestation planning.',
        image: '/assets/certifications/tree-canopy-afforestation-certificate.webp',
        category: 'Remote Sensing',
        technologies: ['Research', 'Deep Learning', 'Remote Sensing', 'NDVI', 'U-Net'],
        liveUrl: null,
        githubUrl: null,
        featured: false,
    },
    {
        id: 5,
        title: 'ML-Based Flood Impact Detection on Cropland',
        description: 'A machine learning and satellite imagery-based project for detecting flood-affected cropland and estimating agricultural damage severity.',
        longDescription: 'Conference: Cukurova Agriculture & Veterinary Congress 2026. Publisher: Liberty Academic Publishers. Indexing: Google Scholar. ISBN: 979-8-89695-370-8. A machine learning and satellite imagery-based project for detecting flood-affected cropland and estimating agricultural damage severity using pre- and post-flood image analysis.',
        image: '/assets/certifications/flood-impact-cropland-certificate.webp',
        category: 'Remote Sensing',
        technologies: ['Research', 'Machine Learning', 'Remote Sensing', 'Cropland', 'Flood Impact'],
        liveUrl: null,
        githubUrl: null,
        featured: false,
    },
    {
        id: 6,
        title: 'LUMO - Lightweight Unified Multilingual Orchestrator',
        description: 'A fully offline multilingual voice assistant running on Raspberry Pi 5 with local speech recognition, a quantized LLM, and offline text-to-speech.',
        longDescription: 'Conference: ICEFront 2026. Status: Under Review. A fully offline multilingual voice assistant running on Raspberry Pi 5. It integrates local speech recognition, a quantized lightweight LLM, and offline text-to-speech, strengthening privacy-preserving edge AI and IoT deployment.',
        image: '/assets/projects/lumo-edge-ai.webp',
        category: 'Edge AI',
        technologies: ['Research', 'Edge AI', 'Offline Voice Assistant', 'Raspberry Pi 5', 'Under Review'],
        liveUrl: null,
        githubUrl: null,
        featured: true,
    },
    {
        id: 7,
        title: 'ML-Based Prediction of Restaurant Food Waste',
        description: 'A machine learning project that predicts daily restaurant food waste using operational, weather, holiday, and event-based features.',
        longDescription: 'Conference: ICEFront 2026. Status: Under Review. A machine learning project that predicts daily restaurant food waste using operational data, weather information, holidays, and event-based features. The dataset contains around 77,980 samples and 27 features, with Random Forest performing best among the tested models.',
        image: '/assets/projects/food-waste-ml.webp',
        category: 'Sustainability',
        technologies: ['Research', 'Machine Learning', 'Sustainability', 'Random Forest', 'Under Review'],
        liveUrl: null,
        githubUrl: null,
        featured: false,
    },
    {
        id: 8,
        title: 'Banana Disease Detection Using AI and Computer Vision',
        description: 'A CNN-based disease detection project focused on banana disease identification using single and bunch banana image datasets.',
        longDescription: 'A CNN-based disease detection project focused on banana disease identification using single and bunch banana image datasets to support agricultural quality assessment.',
        image: '/assets/projects/banana-disease-ai.webp',
        category: 'Computer Vision',
        technologies: ['Work in Progress', 'AI', 'Computer Vision', 'CNN', 'Agriculture'],
        liveUrl: null,
        githubUrl: null,
        featured: false,
    },
    {
        id: 9,
        title: "NLP Analysis of Kazi Nazrul Islam's Poetry",
        description: "A Bengali NLP project applying sentiment analysis and topic analysis to Kazi Nazrul Islam's poetry.",
        longDescription: "A Bengali NLP project applying sentiment analysis and topic analysis to Kazi Nazrul Islam's poetry, contributing to low-resource language research.",
        image: '/assets/projects/nazrul-poetry-nlp.webp',
        category: 'NLP',
        technologies: ['Work in Progress', 'NLP', 'Bengali Language Research', 'Sentiment Analysis', 'Topic Analysis'],
        liveUrl: null,
        githubUrl: null,
        featured: false,
    },
    {
        id: 10,
        title: 'Smart Campus and Smart Transport',
        description: 'An IoT and app-based system for smart campus and transport services with monitoring, real-time information access, and app-based interaction.',
        longDescription: 'An IoT and app-based system for smart campus and transport services, focused on smart monitoring, real-time information access, app-based interaction, and more efficient movement in campus or urban environments.',
        image: '/assets/projects/smart-campus-transport.webp',
        category: 'Smart Infrastructure',
        technologies: ['IoT', 'App', 'Smart Infrastructure', 'Real-Time Information', 'Smart Monitoring'],
        liveUrl: 'https://smart-campus-smart-transport.onrender.com/',
        liveLabel: 'Live App',
        githubUrl: 'https://github.com/mehedinaeem/Smart-Campus-Smart-Transport',
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
            {(project.liveUrl || project.githubUrl) && (
                <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {project.liveUrl && (
                        <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-3 rounded-full bg-white/90 hover:bg-white transition-colors"
                            aria-label={project.liveLabel || 'Open project link'}
                        >
                            <HiExternalLink className="w-5 h-5 text-gray-900" />
                        </a>
                    )}
                    {project.githubUrl && (
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
                    )}
                </div>
            )}

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
            title="Research and Projects"
            subtitle="Real research, prototypes, and intelligent systems"
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
                                <h4 className="font-medium mb-2">Details:</h4>
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
                            {(selectedProject.liveUrl || selectedProject.githubUrl) && (
                                <div className="flex gap-3 pt-4">
                                    {selectedProject.liveUrl && (
                                        <Button
                                            href={selectedProject.liveUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            icon={HiExternalLink}
                                        >
                                            {selectedProject.liveLabel || 'Open Link'}
                                        </Button>
                                    )}
                                    {selectedProject.githubUrl && (
                                        <Button
                                            variant="secondary"
                                            href={selectedProject.githubUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            icon={FaGithub}
                                        >
                                            View Code
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </SectionWrapper>
    );
};

export default Projects;
