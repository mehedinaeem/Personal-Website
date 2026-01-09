/**
 * Not Found Page (404)
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiHome, HiArrowLeft } from 'react-icons/hi';
import { Button } from '../../components/ui';

const NotFoundPage = () => {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-md"
            >
                {/* 404 */}
                <h1 className="text-8xl md:text-9xl font-bold gradient-text mb-4">
                    404
                </h1>

                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                    Page Not Found
                </h2>

                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    Oops! The page you're looking for doesn't exist or has been moved.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                        to="/"
                        icon={HiHome}
                    >
                        Go Home
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => window.history.back()}
                        icon={HiArrowLeft}
                    >
                        Go Back
                    </Button>
                </div>
            </motion.div>
        </div>
    );
};

export default NotFoundPage;
