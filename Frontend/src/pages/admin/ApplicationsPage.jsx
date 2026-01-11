/**
 * Admin Applications Management Page
 * CRUD operations for application tracker
 */

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import {
    HiPlus,
    HiPencil,
    HiTrash,
    HiFilter,
    HiSortDescending,
    HiCalendar,
    HiOfficeBuilding,
    HiClipboardList,
    HiRefresh,
} from 'react-icons/hi';
import { Button, Modal, Input, Textarea, Badge, LoadingOverlay } from '../../components/ui';
import { useApi, useForm, validators } from '../../hooks';
import { applicationsApi } from '../../api';

// Category options
const CATEGORY_OPTIONS = [
    { value: 'job', label: 'Job' },
    { value: 'scholarship', label: 'Scholarship' },
    { value: 'internship', label: 'Internship' },
    { value: 'exam', label: 'Exam' },
    { value: 'others', label: 'Others' },
];

// Status options with colors
const STATUS_OPTIONS = [
    { value: 'pending', label: 'Pending', variant: 'warning' },
    { value: 'applied', label: 'Applied', variant: 'info' },
    { value: 'selected', label: 'Selected', variant: 'success' },
    { value: 'rejected', label: 'Rejected', variant: 'danger' },
];

// Get status badge variant
const getStatusVariant = (status) => {
    const option = STATUS_OPTIONS.find((opt) => opt.value === status);
    return option?.variant || 'secondary';
};

// Get category badge variant
const getCategoryVariant = (category) => {
    const variants = {
        job: 'primary',
        scholarship: 'secondary',
        internship: 'info',
        exam: 'warning',
        others: 'secondary',
    };
    return variants[category] || 'secondary';
};

// Format date for display
const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

// Format date for input
const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
};

const ApplicationsPage = () => {
    const [applications, setApplications] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingApplication, setEditingApplication] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [filters, setFilters] = useState({ category: '', status: '' });
    const [sortOrder, setSortOrder] = useState('deadline');

    const { isLoading, execute: fetchApplications } = useApi(applicationsApi.getAll);

    // Fetch applications on mount and when filters change
    useEffect(() => {
        loadApplications();
    }, []);

    const loadApplications = async () => {
        const params = {};
        if (filters.category) params.category = filters.category;
        if (filters.status) params.status = filters.status;
        params.ordering = sortOrder;

        const result = await fetchApplications(params);
        if (result.success) {
            setApplications(result.data.results || result.data || []);
        }
    };

    // Apply filters and sorting
    const filteredApplications = useMemo(() => {
        let result = [...applications];

        // Apply filters
        if (filters.category) {
            result = result.filter((app) => app.category === filters.category);
        }
        if (filters.status) {
            result = result.filter((app) => app.status === filters.status);
        }

        // Apply sorting
        result.sort((a, b) => {
            if (sortOrder === 'deadline') {
                return new Date(a.deadline) - new Date(b.deadline);
            } else if (sortOrder === '-deadline') {
                return new Date(b.deadline) - new Date(a.deadline);
            } else if (sortOrder === '-created_at') {
                return new Date(b.created_at) - new Date(a.created_at);
            }
            return 0;
        });

        return result;
    }, [applications, filters, sortOrder]);

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
            organization: '',
            category: 'job',
            deadline: '',
            result_date: '',
            status: 'pending',
            notes: '',
        },
        {
            title: [validators.required('Title is required')],
            organization: [validators.required('Organization is required')],
            deadline: [validators.required('Deadline is required')],
        }
    );

    const openModal = (application = null) => {
        if (application) {
            setEditingApplication(application);
            setValue('title', application.title || '');
            setValue('organization', application.organization || '');
            setValue('category', application.category || 'job');
            setValue('deadline', formatDateForInput(application.deadline) || '');
            setValue('result_date', formatDateForInput(application.result_date) || '');
            setValue('status', application.status || 'pending');
            setValue('notes', application.notes || '');
        } else {
            setEditingApplication(null);
            reset();
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingApplication(null);
        reset();
    };

    const onSubmit = async (formData) => {
        const data = {
            ...formData,
            result_date: formData.result_date || null,
        };

        try {
            if (editingApplication) {
                await applicationsApi.update(editingApplication.id, data);
                toast.success('Application updated successfully');
            } else {
                await applicationsApi.create(data);
                toast.success('Application created successfully');
            }
            closeModal();
            loadApplications();
        } catch (error) {
            toast.error(error.displayMessage || 'Failed to save application');
        }
    };

    const handleDelete = async (id) => {
        try {
            await applicationsApi.delete(id);
            toast.success('Application deleted successfully');
            setDeleteConfirm(null);
            loadApplications();
        } catch (error) {
            toast.error(error.displayMessage || 'Failed to delete application');
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({ category: '', status: '' });
    };

    return (
        <>
            <Helmet>
                <title>Applications | Admin</title>
            </Helmet>

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Application Tracker
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Track your job, scholarship, and internship applications
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={loadApplications} icon={HiRefresh}>
                            Refresh
                        </Button>
                        <Button onClick={() => openModal()} icon={HiPlus}>
                            Add Application
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-4 p-4 bg-white dark:bg-dark-200 rounded-xl shadow-sm">
                    <div className="flex items-center gap-2">
                        <HiFilter className="w-5 h-5 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters:</span>
                    </div>

                    <select
                        value={filters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="px-3 py-2 bg-gray-100 dark:bg-dark-100 border-0 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="">All Categories</option>
                        {CATEGORY_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>

                    <select
                        value={filters.status}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="px-3 py-2 bg-gray-100 dark:bg-dark-100 border-0 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="">All Statuses</option>
                        {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>

                    <div className="flex items-center gap-2 ml-auto">
                        <HiSortDescending className="w-5 h-5 text-gray-500" />
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="px-3 py-2 bg-gray-100 dark:bg-dark-100 border-0 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="deadline">Nearest Deadline</option>
                            <option value="-deadline">Farthest Deadline</option>
                            <option value="-created_at">Recently Added</option>
                        </select>
                    </div>

                    {(filters.category || filters.status) && (
                        <button
                            onClick={clearFilters}
                            className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
                        >
                            Clear filters
                        </button>
                    )}
                </div>

                {/* Applications Table */}
                <div className="relative bg-white dark:bg-dark-200 rounded-xl shadow-sm overflow-hidden">
                    {isLoading && <LoadingOverlay />}

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-dark-100">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                        Application
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                        Deadline
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                        Result Date
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {filteredApplications.map((app, index) => (
                                    <motion.tr
                                        key={app.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="hover:bg-gray-50 dark:hover:bg-dark-100 transition-colors"
                                    >
                                        <td className="px-4 py-4">
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white flex-shrink-0">
                                                    <HiClipboardList className="w-5 h-5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-gray-900 dark:text-white truncate max-w-xs">
                                                        {app.title}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                        <HiOfficeBuilding className="w-3 h-3" />
                                                        {app.organization}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <Badge variant={getCategoryVariant(app.category)}>
                                                {app.category_display || app.category}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2">
                                                <HiCalendar className="w-4 h-4 text-gray-400" />
                                                <span className={`text-sm ${app.days_until_deadline <= 0
                                                        ? 'text-red-600 dark:text-red-400 font-semibold'
                                                        : app.days_until_deadline <= 3
                                                            ? 'text-yellow-600 dark:text-yellow-400 font-medium'
                                                            : 'text-gray-600 dark:text-gray-400'
                                                    }`}>
                                                    {formatDate(app.deadline)}
                                                    {app.days_until_deadline !== undefined && (
                                                        <span className="ml-1 text-xs">
                                                            ({app.days_until_deadline <= 0
                                                                ? 'Passed'
                                                                : `${app.days_until_deadline}d left`})
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <Badge variant={getStatusVariant(app.status)}>
                                                {app.status_display || app.status}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                                            {formatDate(app.result_date)}
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openModal(app)}
                                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-100 transition-colors"
                                                    aria-label="Edit"
                                                >
                                                    <HiPencil className="w-4 h-4 text-gray-500" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm(app)}
                                                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                    aria-label="Delete"
                                                >
                                                    <HiTrash className="w-4 h-4 text-red-500" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredApplications.length === 0 && !isLoading && (
                        <div className="text-center py-12">
                            <HiClipboardList className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">
                                {applications.length === 0
                                    ? 'No applications yet'
                                    : 'No applications match your filters'}
                            </p>
                            {applications.length === 0 && (
                                <Button onClick={() => openModal()} className="mt-4" icon={HiPlus}>
                                    Add Your First Application
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {/* Stats Summary */}
                {applications.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {STATUS_OPTIONS.map((status) => {
                            const count = applications.filter((app) => app.status === status.value).length;
                            return (
                                <div
                                    key={status.value}
                                    className="p-4 bg-white dark:bg-dark-200 rounded-xl shadow-sm"
                                >
                                    <Badge variant={status.variant} className="mb-2">
                                        {status.label}
                                    </Badge>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {count}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingApplication ? 'Edit Application' : 'Add Application'}
                size="lg"
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <Input
                            label="Title"
                            name="title"
                            placeholder="Software Engineer at Google"
                            value={values.title}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.title}
                            touched={touched.title}
                            required
                        />
                        <Input
                            label="Organization"
                            name="organization"
                            placeholder="Google, Microsoft, etc."
                            value={values.organization}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.organization}
                            touched={touched.organization}
                            required
                        />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Category <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="category"
                                value={values.category}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-gray-100 dark:bg-dark-100 border-0 rounded-xl focus:ring-2 focus:ring-primary-500"
                            >
                                {CATEGORY_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Status <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="status"
                                value={values.status}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-gray-100 dark:bg-dark-100 border-0 rounded-xl focus:ring-2 focus:ring-primary-500"
                            >
                                {STATUS_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <Input
                            label="Deadline"
                            name="deadline"
                            type="date"
                            value={values.deadline}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={errors.deadline}
                            touched={touched.deadline}
                            required
                        />
                        <Input
                            label="Result Date (Optional)"
                            name="result_date"
                            type="date"
                            value={values.result_date}
                            onChange={handleChange}
                            onBlur={handleBlur}
                        />
                    </div>

                    <Textarea
                        label="Notes (Optional)"
                        name="notes"
                        placeholder="Add any notes about this application..."
                        value={values.notes}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        rows={3}
                    />

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="secondary" onClick={closeModal} type="button">
                            Cancel
                        </Button>
                        <Button type="submit">
                            {editingApplication ? 'Update' : 'Create'} Application
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation */}
            <Modal
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                title="Delete Application"
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

export default ApplicationsPage;
