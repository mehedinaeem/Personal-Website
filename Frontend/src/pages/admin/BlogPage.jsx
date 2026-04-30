/**
 * Admin Blog Management Page
 * CRUD operations for blog posts
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import {
    HiPlus,
    HiPencil,
    HiTrash,
    HiDocument,
    HiEye,
    HiEyeOff,
    HiExternalLink,
} from 'react-icons/hi';
import { Button, Modal, Input, Textarea, Badge, LoadingOverlay } from '../../components/ui';
import { useApi, useForm, validators } from '../../hooks';
import { blogsApi } from '../../api';

const BlogPage = () => {
    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const { isLoading, execute: fetchPosts } = useApi(blogsApi.getAll);

    useEffect(() => {
        loadPosts();
        loadCategories();
    }, []);

    const loadPosts = async () => {
        const result = await fetchPosts();
        if (result.success) {
            setPosts(result.data.results || result.data || []);
        }
    };

    const loadCategories = async () => {
        try {
            const data = await blogsApi.getCategories();
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
            title: '',
            content: '',
            category_id: '',
            status: 'draft',
        },
        {
            title: [validators.required('Title is required')],
            content: [validators.required('Content is required')],
        }
    );

    const openModal = (post = null) => {
        if (post) {
            setEditingPost(post);
            setValue('title', post.title || '');
            setValue('content', post.content || '');
            setValue('category_id', post.category?.id || '');
            setValue('status', post.status || 'draft');
        } else {
            setEditingPost(null);
            reset();
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingPost(null);
        reset();
    };

    const onSubmit = async (formData) => {
        const data = {
            ...formData,
            category_id: formData.category_id || null,
        };

        try {
            if (editingPost) {
                await blogsApi.update(editingPost.id, data);
                toast.success('Post updated successfully');
            } else {
                await blogsApi.create(data);
                toast.success('Post created successfully');
            }
            closeModal();
            loadPosts();
        } catch (error) {
            toast.error(error.displayMessage || 'Failed to save post');
        }
    };

    const handlePublish = async (post) => {
        try {
            if (post.status === 'published') {
                await blogsApi.unpublish(post.id);
                toast.success('Post unpublished');
            } else {
                await blogsApi.publish(post.id);
                toast.success('Post published');
            }
            loadPosts();
        } catch (error) {
            toast.error(error.displayMessage || 'Failed to update post status');
        }
    };

    const handleDelete = async (id) => {
        try {
            await blogsApi.delete(id);
            toast.success('Post deleted successfully');
            setDeleteConfirm(null);
            loadPosts();
        } catch (error) {
            toast.error(error.displayMessage || 'Failed to delete post');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <>
            <Helmet>
                <title>Blog | Admin</title>
            </Helmet>

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Blog Posts
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Manage your blog content
                        </p>
                    </div>
                    <Button onClick={() => openModal()} icon={HiPlus}>
                        New Post
                    </Button>
                </div>

                {/* Posts Table */}
                <div className="relative">
                    {isLoading && <LoadingOverlay />}

                    <div className="card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-dark-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                            Title
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                            Category
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                            Date
                                        </th>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {posts.map((post, index) => (
                                        <motion.tr
                                            key={post.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="hover:bg-gray-50 dark:hover:bg-dark-100"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-dark-100 flex items-center justify-center">
                                                        {post.thumbnail ? (
                                                            <img
                                                                src={post.thumbnail}
                                                                alt=""
                                                                className="w-full h-full object-cover rounded-lg"
                                                            />
                                                        ) : (
                                                            <HiDocument className="w-5 h-5 text-gray-400" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            {post.title}
                                                        </p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                                            {post.slug}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {post.category ? (
                                                    <Badge variant="secondary">{post.category.name}</Badge>
                                                ) : (
                                                    <span className="text-gray-400">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge
                                                    variant={post.status === 'published' ? 'success' : 'warning'}
                                                >
                                                    {post.status}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                {formatDate(post.published_at || post.created_at)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handlePublish(post)}
                                                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-100 transition-colors"
                                                        title={post.status === 'published' ? 'Unpublish' : 'Publish'}
                                                    >
                                                        {post.status === 'published' ? (
                                                            <HiEyeOff className="w-4 h-4 text-gray-500" />
                                                        ) : (
                                                            <HiEye className="w-4 h-4 text-green-500" />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => openModal(post)}
                                                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-100 transition-colors"
                                                    >
                                                        <HiPencil className="w-4 h-4 text-gray-500" />
                                                    </button>
                                                    {post.status === 'published' && (
                                                        <a
                                                            href={`/blog/${post.slug}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-100 transition-colors"
                                                        >
                                                            <HiExternalLink className="w-4 h-4 text-gray-500" />
                                                        </a>
                                                    )}
                                                    <button
                                                        onClick={() => setDeleteConfirm(post)}
                                                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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

                        {posts.length === 0 && !isLoading && (
                            <div className="text-center py-12">
                                <HiDocument className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                                <p className="text-gray-500 dark:text-gray-400">No blog posts yet</p>
                                <Button onClick={() => openModal()} className="mt-4" icon={HiPlus}>
                                    Write Your First Post
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingPost ? 'Edit Post' : 'New Post'}
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
                                Category
                            </label>
                            <select
                                name="category_id"
                                value={values.category_id}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                                <option value="">No category</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Status
                            </label>
                            <select
                                name="status"
                                value={values.status}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                            </select>
                        </div>
                    </div>

                    <Textarea
                        label="Content"
                        name="content"
                        value={values.content}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={errors.content}
                        touched={touched.content}
                        rows={12}
                        required
                    />

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="secondary" onClick={closeModal} type="button">
                            Cancel
                        </Button>
                        <Button type="submit">
                            {editingPost ? 'Update' : 'Create'} Post
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation */}
            <Modal
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                title="Delete Post"
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

export default BlogPage;
