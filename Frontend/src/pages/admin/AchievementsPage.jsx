/**
 * Admin Achievements Management Page
 * CRUD operations for achievements/awards/certifications
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import {
    HiPlus,
    HiPencil,
    HiTrash,
    HiAcademicCap,
    HiExternalLink,
    HiBadgeCheck,
    HiDocumentText,
    HiStar,
} from 'react-icons/hi';
import { Button, Modal, Input, Textarea, Badge, LoadingOverlay } from '../../components/ui';
import { useApi, useForm, validators } from '../../hooks';
import { achievementsApi } from '../../api';

const typeIcons = {
    award: HiStar,
    certification: HiBadgeCheck,
    publication: HiDocumentText,
    other: HiAcademicCap,
};

const typeColors = {
    award: 'bg-yellow-500',
    certification: 'bg-green-500',
    publication: 'bg-blue-500',
    other: 'bg-gray-500',
};

const AchievementsPage = () => {
    const [achievements, setAchievements] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAchievement, setEditingAchievement] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const { isLoading, execute: fetchAchievements } = useApi(achievementsApi.getAll);

    useEffect(() => {
        loadAchievements();
    }, []);

    const loadAchievements = async () => {
        const result = await fetchAchievements();
        if (result.success) {
            setAchievements(result.data.results || result.data || []);
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
            type: 'other',
            date: '',
            issuer: '',
            url: '',
            order: 0,
        },
        {
            title: [validators.required('Title is required')],
        }
    );

    const openModal = (achievement = null) => {
        if (achievement) {
            setEditingAchievement(achievement);
            Object.keys(values).forEach((key) => {
                if (key === 'date' && achievement[key]) {
                    setValue(key, achievement[key].split('T')[0]);
                } else {
                    setValue(key, achievement[key] || (key === 'order' ? 0 : ''));
                }
            });
        } else {
            setEditingAchievement(null);
            reset();
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingAchievement(null);
        reset();
    };

    const onSubmit = async (formData) => {
        const data = {
            ...formData,
            date: formData.date || null,
        };

        try {
            if (editingAchievement) {
                await achievementsApi.update(editingAchievement.id, data);
                toast.success('Achievement updated successfully');
            } else {
                await achievementsApi.create(data);
                toast.success('Achievement created successfully');
            }
            closeModal();
            loadAchievements();
        } catch (error) {
            toast.error(error.displayMessage || 'Failed to save achievement');
        }
    };

    const handleDelete = async (id) => {
        try {
            await achievementsApi.delete(id);
            toast.success('Achievement deleted successfully');
            setDeleteConfirm(null);
            loadAchievements();
        } catch (error) {
            toast.error(error.displayMessage || 'Failed to delete achievement');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
        });
    };

    return (
        <>
            <Helmet>
                <title>Achievements | Admin</title>
            </Helmet>

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Achievements
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Manage your awards, certifications, and publications
                        </p>
                    </div>
                    <Button onClick={() => openModal()} icon={HiPlus}>
                        Add Achievement
                    </Button>
                </div>

                {/* Achievements Grid */}
                <div className="relative">
                    {isLoading && <LoadingOverlay />}

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {achievements.map((achievement, index) => {
                            const IconComponent = typeIcons[achievement.type] || HiAcademicCap;
                            const colorClass = typeColors[achievement.type] || typeColors.other;

                            return (
                                <motion.div
                                    key={achievement.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="card p-6"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-xl ${colorClass} flex items-center justify-center flex-shrink-0`}>
                                            <IconComponent className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                                                    {achievement.title}
                                                </h3>
                                                <Badge variant="secondary" className="flex-shrink-0">
                                                    {achievement.type_display || achievement.type}
                                                </Badge>
                                            </div>
                                            {achievement.issuer && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                    {achievement.issuer}
                                                </p>
                                            )}
                                            {achievement.date && (
                                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                                    {formatDate(achievement.date)}
                                                </p>
                                            )}
                                            {achievement.description && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                                                    {achievement.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                        <button
                                            onClick={() => openModal(achievement)}
                                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-100 transition-colors"
                                            aria-label="Edit"
                                        >
                                            <HiPencil className="w-4 h-4 text-gray-500" />
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirm(achievement)}
                                            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                            aria-label="Delete"
                                        >
                                            <HiTrash className="w-4 h-4 text-red-500" />
                                        </button>
                                        {achievement.url && (
                                            <a
                                                href={achievement.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-100 transition-colors ml-auto"
                                                aria-label="View"
                                            >
                                                <HiExternalLink className="w-4 h-4 text-gray-500" />
                                            </a>
                                        )}
                                        {achievement.certificate && (
                                            <a
                                                href={achievement.certificate}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-primary-500 hover:text-primary-600"
                                            >
                                                View Certificate
                                            </a>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {achievements.length === 0 && !isLoading && (
                        <div className="text-center py-12">
                            <HiAcademicCap className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">No achievements yet</p>
                            <Button onClick={() => openModal()} className="mt-4" icon={HiPlus}>
                                Add Your First Achievement
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingAchievement ? 'Edit Achievement' : 'Add Achievement'}
                size="lg"
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Type
                            </label>
                            <select
                                name="type"
                                value={values.type}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                                <option value="award">Award</option>
                                <option value="certification">Certification</option>
                                <option value="publication">Publication</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <Input
                            label="Date"
                            name="date"
                            type="date"
                            value={values.date}
                            onChange={handleChange}
                            onBlur={handleBlur}
                        />
                    </div>

                    <Input
                        label="Issuer / Organization"
                        name="issuer"
                        placeholder="e.g., Google, AWS, IEEE"
                        value={values.issuer}
                        onChange={handleChange}
                        onBlur={handleBlur}
                    />

                    <Textarea
                        label="Description"
                        name="description"
                        value={values.description}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        rows={3}
                    />

                    <div className="grid sm:grid-cols-2 gap-4">
                        <Input
                            label="URL (optional)"
                            name="url"
                            type="url"
                            placeholder="https://..."
                            value={values.url}
                            onChange={handleChange}
                            onBlur={handleBlur}
                        />
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

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="secondary" onClick={closeModal} type="button">
                            Cancel
                        </Button>
                        <Button type="submit">
                            {editingAchievement ? 'Update' : 'Create'} Achievement
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation */}
            <Modal
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                title="Delete Achievement"
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

export default AchievementsPage;
