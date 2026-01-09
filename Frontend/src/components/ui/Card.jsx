/**
 * Card Component
 * Reusable card with hover effects
 */

import { motion } from 'framer-motion';

const Card = ({
    children,
    className = '',
    hover = true,
    onClick,
    ...props
}) => {
    return (
        <motion.div
            className={`bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 transition-all duration-300 hover:shadow-xl hover:border-sky-200 dark:hover:border-sky-800 p-6 ${className}`}
            onClick={onClick}
            whileHover={hover ? { y: -4, scale: 1.01 } : {}}
            transition={{ duration: 0.2 }}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export const CardHeader = ({ children, className = '' }) => (
    <div className={`mb-4 ${className}`}>{children}</div>
);

export const CardTitle = ({ children, className = '' }) => (
    <h3 className={`text-xl md:text-2xl font-semibold ${className}`}>{children}</h3>
);

export const CardDescription = ({ children, className = '' }) => (
    <p className={`text-gray-600 dark:text-gray-400 ${className}`}>{children}</p>
);

export const CardContent = ({ children, className = '' }) => (
    <div className={className}>{children}</div>
);

export const CardFooter = ({ children, className = '' }) => (
    <div className={`mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 ${className}`}>
        {children}
    </div>
);

export default Card;
