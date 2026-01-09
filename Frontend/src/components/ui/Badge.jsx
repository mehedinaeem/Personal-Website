/**
 * Badge Component
 * Status badges and tags
 */

const Badge = ({ children, variant = 'primary', className = '' }) => {
    const variants = {
        primary: 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300',
        secondary: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
        success: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
        warning: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
        danger: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
        info: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    };

    return (
        <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${variants[variant] || variants.primary} ${className}`}>
            {children}
        </span>
    );
};

export default Badge;
