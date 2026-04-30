/**
 * Admin Messages Page
 * View and manage contact form submissions
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import {
    HiMail,
    HiMailOpen,
    HiTrash,
    HiEye,
    HiCheck,
} from 'react-icons/hi';
import { Button, Modal, Badge, LoadingOverlay } from '../../components/ui';
import { useApi } from '../../hooks';
import { contactApi } from '../../api';

const MessagesPage = () => {
    const [messages, setMessages] = useState([]);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [filter, setFilter] = useState('all'); // all, unread, read

    const { isLoading, execute: fetchMessages } = useApi(contactApi.getMessages);

    useEffect(() => {
        loadMessages();
    }, []);

    const loadMessages = async () => {
        const result = await fetchMessages();
        if (result.success) {
            setMessages(result.data.results || result.data || []);
        }
    };

    const handleMarkAsRead = async (message) => {
        if (message.is_read) return;

        try {
            await contactApi.markAsRead(message.id);
            loadMessages();
        } catch (error) {
            toast.error(error.displayMessage || 'Failed to mark as read');
        }
    };

    const handleDelete = async (id) => {
        try {
            await contactApi.delete(id);
            toast.success('Message deleted successfully');
            setDeleteConfirm(null);
            setSelectedMessage(null);
            loadMessages();
        } catch (error) {
            toast.error(error.displayMessage || 'Failed to delete message');
        }
    };

    const openMessage = (message) => {
        setSelectedMessage(message);
        if (!message.is_read) {
            handleMarkAsRead(message);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        } else if (days === 1) {
            return 'Yesterday';
        } else if (days < 7) {
            return `${days} days ago`;
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
    };

    const filteredMessages = messages.filter((msg) => {
        if (filter === 'unread') return !msg.is_read;
        if (filter === 'read') return msg.is_read;
        return true;
    });

    const unreadCount = messages.filter((m) => !m.is_read).length;

    return (
        <>
            <Helmet>
                <title>Messages | Admin</title>
            </Helmet>

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Messages
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Contact form submissions
                            {unreadCount > 0 && (
                                <Badge variant="primary" className="ml-2">
                                    {unreadCount} unread
                                </Badge>
                            )}
                        </p>
                    </div>

                    {/* Filter */}
                    <div className="flex items-center gap-2">
                        {['all', 'unread', 'read'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f
                                        ? 'bg-primary-500 text-white'
                                        : 'bg-gray-100 dark:bg-dark-100 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-200'
                                    }`}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Messages List */}
                <div className="relative">
                    {isLoading && <LoadingOverlay />}

                    <div className="card divide-y divide-gray-100 dark:divide-gray-800">
                        {filteredMessages.map((message, index) => (
                            <motion.div
                                key={message.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => openMessage(message)}
                                className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-dark-100 ${!message.is_read ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''
                                    }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${message.is_read
                                            ? 'bg-gray-100 dark:bg-dark-100'
                                            : 'bg-primary-100 dark:bg-primary-900/30'
                                        }`}>
                                        {message.is_read ? (
                                            <HiMailOpen className="w-5 h-5 text-gray-400" />
                                        ) : (
                                            <HiMail className="w-5 h-5 text-primary-500" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className={`font-medium ${message.is_read
                                                        ? 'text-gray-700 dark:text-gray-300'
                                                        : 'text-gray-900 dark:text-white'
                                                    }`}>
                                                    {message.name}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {message.email}
                                                </p>
                                            </div>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                                                {formatDate(message.created_at)}
                                            </span>
                                        </div>
                                        <p className={`mt-1 ${message.is_read
                                                ? 'text-gray-600 dark:text-gray-400'
                                                : 'text-gray-900 dark:text-white font-medium'
                                            }`}>
                                            {message.subject}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                                            {message.message}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDeleteConfirm(message);
                                            }}
                                            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                            aria-label="Delete"
                                        >
                                            <HiTrash className="w-4 h-4 text-red-500" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {filteredMessages.length === 0 && !isLoading && (
                            <div className="text-center py-12">
                                <HiMail className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                                <p className="text-gray-500 dark:text-gray-400">
                                    {filter === 'unread' ? 'No unread messages' :
                                        filter === 'read' ? 'No read messages' :
                                            'No messages yet'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* View Message Modal */}
            <Modal
                isOpen={!!selectedMessage}
                onClose={() => setSelectedMessage(null)}
                title={selectedMessage?.subject || 'Message'}
                size="lg"
            >
                {selectedMessage && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold text-lg">
                                    {selectedMessage.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">
                                        {selectedMessage.name}
                                    </p>
                                    <a
                                        href={`mailto:${selectedMessage.email}`}
                                        className="text-sm text-primary-500 hover:text-primary-600"
                                    >
                                        {selectedMessage.email}
                                    </a>
                                </div>
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                {new Date(selectedMessage.created_at).toLocaleString()}
                            </div>
                        </div>

                        <div className="prose dark:prose-invert max-w-none">
                            <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                                {selectedMessage.message}
                            </p>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-2">
                                {selectedMessage.is_read && (
                                    <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                                        <HiCheck className="w-4 h-4" />
                                        Read
                                    </span>
                                )}
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    variant="danger"
                                    onClick={() => {
                                        setDeleteConfirm(selectedMessage);
                                    }}
                                >
                                    Delete
                                </Button>
                                <a href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}>
                                    <Button>Reply</Button>
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Delete Confirmation */}
            <Modal
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                title="Delete Message"
                size="sm"
            >
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Are you sure you want to delete this message from "{deleteConfirm?.name}"? This action cannot be undone.
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

export default MessagesPage;
