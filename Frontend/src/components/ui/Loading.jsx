/**
 * Loading Components
 * Spinner, skeleton, and loading overlay
 */

import { motion } from 'framer-motion';

// Spinner
export const Spinner = ({ size = 'md', className = '' }) => {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16',
    };

    return (
        <div className={`${sizes[size]} ${className}`}>
            <svg
                className="animate-spin text-primary-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
            >
                <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                />
                <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
            </svg>
        </div>
    );
};

// Skeleton
export const Skeleton = ({ className = '', variant = 'text' }) => {
    const variants = {
        text: 'h-4 rounded',
        title: 'h-8 w-3/4 rounded',
        avatar: 'w-12 h-12 rounded-full',
        thumbnail: 'w-full h-48 rounded-xl',
        card: 'w-full h-64 rounded-xl',
    };

    return (
        <div className={`skeleton ${variants[variant]} ${className}`} />
    );
};

// Full page loading
export const PageLoader = () => (
    <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-dark-300 z-50">
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
        >
            <Spinner size="xl" className="mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </motion.div>
    </div>
);

// Content loader overlay
export const LoadingOverlay = ({ message = 'Loading...' }) => (
    <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-dark-300/80 backdrop-blur-sm rounded-xl z-10">
        <div className="text-center">
            <Spinner size="lg" className="mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
        </div>
    </div>
);

// Skeleton card
export const SkeletonCard = () => (
    <div className="card p-6 space-y-4">
        <Skeleton variant="thumbnail" />
        <Skeleton variant="title" />
        <Skeleton variant="text" />
        <Skeleton variant="text" className="w-2/3" />
    </div>
);

export default Spinner;
