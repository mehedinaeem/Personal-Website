/**
 * Admin Projects Management Page
 * CRUD operations for projects
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import {
    HiPlus,
    HiPencil,
    HiTrash,
    HiPhotograph,
    HiExternalLink,
} from 'react-icons/hi';
import { FaGithub } from 'react-icons/fa';
import { Button, Modal, Input, Textarea, Badge, LoadingOverlay } from '../../components/ui';
import { useApi, useForm, validators } from '../../hooks';
import { projectsApi } from '../../api';

const ProjectsPage = () => {
    const [projects, setProjects] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const { isLoading, execute: fetchProjects } = useApi(projectsApi.getAll);

    // Fetch projects on mount
    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        const result = await fetchProjects();
        if (result.success) {
            setProjects(result.data.results || result.data || []);
        }
    };

    const {
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        setValue,
        reset,
    } = useForm(
        {
            title: '',
            description: '',
            long_description: '',
            category: '',
            technologies: '',
            live_url: '',
            github_url: '',
            featured: false,
        },
        {
            title: [validators.required('Title is required')],
            description: [validators.required('Description is required')],
            category: [validators.required('Category is required')],
        }
    );

    const openModal = (project = null) => {
        if (project) {
            setEditingProject(project);
            Object.keys(values).forEach((key) => {
                if (key === 'technologies') {
                    setValue(key, project.technologies?.join(', ') || '');
                } else {
                    setValue(key, project[key] || '');
                }
            });
        } else {
            setEditingProject(null);
            reset();
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingProject(null);
        reset();
    };

    const onSubmit = async (formData) => {
        const data = {
            ...formData,
            technologies: formData.technologies.split(',').map((t) => t.trim()).filter(Boolean),
        };

        try {
            if (editingProject) {
                await projectsApi.update(editingProject.id, data);
                toast.success('Project updated successfully');
            } else {
                await projectsApi.create(data);
                toast.success('Project created successfully');
            }
            closeModal();
            loadProjects();
        } catch (error) {
            toast.error(error.displayMessage || 'Failed to save project');
        }
    };

    const handleDelete = async (id) => {
        try {
            await projectsApi.delete(id);
            toast.success('Project deleted successfully');
            setDeleteConfirm(null);
            loadProjects();
        } catch (error) {
            toast.error(error.displayMessage || 'Failed to delete project');
        }
    };

    return (
        <>
            <Helmet>
                <title>Projects | Admin</title>
            </Helmet>

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Projects
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Manage your portfolio projects
                        </p>
                    </div>
                    <Button onClick={() => openModal()} icon={HiPlus}>
                        Add Project
                    </Button>
                </div>

                {/* Projects Grid */}
                <div className="relative">
                    {isLoading && <LoadingOverlay />}

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project, index) => (
                            <motion.div
                                key={project.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="card overflow-hidden"
                            >
                                {/* Image */}
                                <div className="h-40 bg-gray-100 dark:bg-dark-100 relative">
                                    {project.image ? (
                                        <img
                                            src={project.image}
                                            alt={project.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <HiPhotograph className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                                        </div>
                                    )}
                                    {project.featured && (
                                        <div className="absolute top-2 left-2">
                                            <Badge variant="primary">Featured</Badge>
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                                            {project.title}
                                        </h3>
                                        <Badge variant="secondary">{project.category}</Badge>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                                        {project.description}
                                    </p>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => openModal(project)}
                                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-100 transition-colors"
                                            aria-label="Edit"
                                        >
                                            <HiPencil className="w-4 h-4 text-gray-500" />
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirm(project)}
                                            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                            aria-label="Delete"
                                        >
                                            <HiTrash className="w-4 h-4 text-red-500" />
                                        </button>
                                        {project.live_url && (
                                            <a
                                                href={project.live_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-100 transition-colors"
                                                aria-label="Live"
                                            >
                                                <HiExternalLink className="w-4 h-4 text-gray-500" />
                                            </a>
                                        )}
                                        {project.github_url && (
                                            <a
                                                href={project.github_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-100 transition-colors"
                                                aria-label="GitHub"
                                            >
                                                <FaGithub className="w-4 h-4 text-gray-500" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {projects.length === 0 && !isLoading && (
                        <div className="text-center py-12">
                            <HiPhotograph className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">No projects yet</p>
                            <Button onClick={() => openModal()} className="mt-4" icon={HiPlus}>
                                Add Your First Project
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingProject ? 'Edit Project' : 'Add Project'}
                size="lg"
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <Input
                            label="Title"
                            name="title"
                            value={values.title}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.title}
                            touched={touched.title}
                            required
                        />
                        <Input
                            label="Category"
                            name="category"
                            placeholder="Web App, Mobile, etc."
                            value={values.category}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.category}
                            touched={touched.category}
                            required
                        />
                    </div>

                    <Textarea
                        label="Short Description"
                        name="description"
                        value={values.description}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.description}
                        touched={touched.description}
                        rows={2}
                        required
                    />

                    <Textarea
                        label="Long Description"
                        name="long_description"
                        value={values.long_description}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        rows={4}
                    />

                    <Input
                        label="Technologies (comma-separated)"
                        name="technologies"
                        placeholder="React, Node.js, MongoDB"
                        value={values.technologies}
                        onChange={handleChange}
                        onBlur={handleBlur}
                    />

                    <div className="grid sm:grid-cols-2 gap-4">
                        <Input
                            label="Live URL"
                            name="live_url"
                            type="url"
                            placeholder="https://..."
                            value={values.live_url}
                            onChange={handleChange}
                            onBlur={handleBlur}
                        />
                        <Input
                            label="GitHub URL"
                            name="github_url"
                            type="url"
                            placeholder="https://github.com/..."
                            value={values.github_url}
                            onChange={handleChange}
                            onBlur={handleBlur}
                        />
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            name="featured"
                            checked={values.featured}
                            onChange={handleChange}
                            className="w-5 h-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                        />
                        <span className="text-gray-700 dark:text-gray-300">Featured project</span>
                    </label>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="secondary" onClick={closeModal} type="button">
                            Cancel
                        </Button>
                        <Button type="submit">
                            {editingProject ? 'Update' : 'Create'} Project
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation */}
            <Modal
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                title="Delete Project"
                size="sm"
            >
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Are you sure you want to delete "{deleteConfirm?.title}"? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                    <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={() => handleDelete(deleteConfirm?.id)}>
                        Delete
                    </Button>
                </div>
            </Modal>
        </>
    );
};

export default ProjectsPage;
