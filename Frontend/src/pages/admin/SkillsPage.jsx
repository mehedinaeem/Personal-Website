/**
 * Admin Skills Management Page
 * CRUD operations for skills
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import {
    HiPlus,
    HiPencil,
    HiTrash,
    HiLightBulb,
} from 'react-icons/hi';
import { Button, Modal, Input, Badge, LoadingOverlay } from '../../components/ui';
import { useApi, useForm, validators } from '../../hooks';
import { skillsApi } from '../../api';

const SkillsPage = () => {
    const [skills, setSkills] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSkill, setEditingSkill] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const { isLoading, execute: fetchSkills } = useApi(skillsApi.getAll);

    useEffect(() => {
        loadSkills();
        loadCategories();
    }, []);

    const loadSkills = async () => {
        const result = await fetchSkills();
        if (result.success) {
            setSkills(result.data.results || result.data || []);
        }
    };

    const loadCategories = async () => {
        try {
            const data = await skillsApi.getCategories();
            setCategories(data || []);
        } catch (error) {
            console.error('Failed to load categories:', error);
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
            name: '',
            category: 'other',
            proficiency: 50,
            icon: '',
            order: 0,
        },
        {
            name: [validators.required('Name is required')],
        }
    );

    const openModal = (skill = null) => {
        if (skill) {
            setEditingSkill(skill);
            Object.keys(values).forEach((key) => {
                setValue(key, skill[key] || (key === 'proficiency' ? 50 : key === 'order' ? 0 : ''));
            });
        } else {
            setEditingSkill(null);
            reset();
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingSkill(null);
        reset();
    };

    const onSubmit = async (formData) => {
        try {
            if (editingSkill) {
                await skillsApi.update(editingSkill.id, formData);
                toast.success('Skill updated successfully');
            } else {
                await skillsApi.create(formData);
                toast.success('Skill created successfully');
            }
            closeModal();
            loadSkills();
        } catch (error) {
            toast.error(error.displayMessage || 'Failed to save skill');
        }
    };

    const handleDelete = async (id) => {
        try {
            await skillsApi.delete(id);
            toast.success('Skill deleted successfully');
            setDeleteConfirm(null);
            loadSkills();
        } catch (error) {
            toast.error(error.displayMessage || 'Failed to delete skill');
        }
    };

    // Group skills by category
    const groupedSkills = skills.reduce((acc, skill) => {
        const cat = skill.category || 'other';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(skill);
        return acc;
    }, {});

    const getCategoryLabel = (value) => {
        const cat = categories.find(c => c.value === value);
        return cat?.label || value;
    };

    const getCategoryColor = (category) => {
        const colors = {
            frontend: 'bg-blue-500',
            backend: 'bg-green-500',
            database: 'bg-purple-500',
            devops: 'bg-orange-500',
            tools: 'bg-pink-500',
            other: 'bg-gray-500',
        };
        return colors[category] || colors.other;
    };

    return (
        <>
            <Helmet>
                <title>Skills | Admin</title>
            </Helmet>

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Skills
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Manage your technical skills
                        </p>
                    </div>
                    <Button onClick={() => openModal()} icon={HiPlus}>
                        Add Skill
                    </Button>
                </div>

                {/* Skills by Category */}
                <div className="relative">
                    {isLoading && <LoadingOverlay />}

                    {Object.entries(groupedSkills).map(([category, categorySkills]) => (
                        <div key={category} className="mb-8">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className={`w-3 h-3 rounded-full ${getCategoryColor(category)}`}></span>
                                {getCategoryLabel(category)}
                                <Badge variant="secondary">{categorySkills.length}</Badge>
                            </h2>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {categorySkills.map((skill, index) => (
                                    <motion.div
                                        key={skill.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="card p-4"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                {skill.icon ? (
                                                    <span className="text-xl">{skill.icon}</span>
                                                ) : (
                                                    <HiLightBulb className="w-5 h-5 text-yellow-500" />
                                                )}
                                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                                    {skill.name}
                                                </h3>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => openModal(skill)}
                                                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-100 transition-colors"
                                                    aria-label="Edit"
                                                >
                                                    <HiPencil className="w-4 h-4 text-gray-500" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm(skill)}
                                                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                    aria-label="Delete"
                                                >
                                                    <HiTrash className="w-4 h-4 text-red-500" />
                                                </button>
                                            </div>
                                        </div>
                                        {/* Proficiency Bar */}
                                        <div className="mt-2">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-500 dark:text-gray-400">Proficiency</span>
                                                <span className="text-gray-700 dark:text-gray-300">{skill.proficiency}%</span>
                                            </div>
                                            <div className="h-2 bg-gray-200 dark:bg-dark-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${getCategoryColor(skill.category)} rounded-full`}
                                                    style={{ width: `${skill.proficiency}%` }}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {skills.length === 0 && !isLoading && (
                        <div className="text-center py-12">
                            <HiLightBulb className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">No skills yet</p>
                            <Button onClick={() => openModal()} className="mt-4" icon={HiPlus}>
                                Add Your First Skill
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingSkill ? 'Edit Skill' : 'Add Skill'}
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                        label="Name"
                        name="name"
                        value={values.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.name}
                        touched={touched.name}
                        required
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Category
                            </label>
                            <select
                                name="category"
                                value={values.category}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                                {categories.map((cat) => (
                                    <option key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <Input
                            label="Order"
                            name="order"
                            type="number"
                            min="0"
                            value={values.order}
                            onChange={handleChange}
                            onBlur={handleBlur}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Proficiency: {values.proficiency}%
                        </label>
                        <input
                            type="range"
                            name="proficiency"
                            min="0"
                            max="100"
                            value={values.proficiency}
                            onChange={handleChange}
                            className="w-full"
                        />
                    </div>

                    <Input
                        label="Icon (emoji or class)"
                        name="icon"
                        placeholder="⚛️ or icon class"
                        value={values.icon}
                        onChange={handleChange}
                        onBlur={handleBlur}
                    />

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="secondary" onClick={closeModal} type="button">
                            Cancel
                        </Button>
                        <Button type="submit">
                            {editingSkill ? 'Update' : 'Create'} Skill
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation */}
            <Modal
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                title="Delete Skill"
                size="sm"
            >
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Are you sure you want to delete "{deleteConfirm?.name}"? This action cannot be undone.
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

export default SkillsPage;
