/**
 * Button Component
 * Reusable button with variants and loading state
 */

import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Button = forwardRef(({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled = false,
    icon: Icon,
    iconPosition = 'left',
    className = '',
    onClick,
    type = 'button',
    to,
    href,
    ...props
}, ref) => {
    // Base styles
    const baseStyles = 'inline-flex items-center justify-center gap-2.5 font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg cursor-pointer';

    // Size styles with responsive design (smaller on mobile)
    const sizeStyles = {
        sm: 'px-4 py-2 text-xs sm:px-6 sm:py-2.5 sm:text-sm',
        md: 'px-6 py-2.5 text-sm sm:px-8 sm:py-3 md:px-10 md:py-3.5 md:text-base',
        lg: 'px-8 py-3 text-base sm:px-10 sm:py-3.5 md:px-12 md:py-4',
    };

    // Variant styles
    const variantStyles = {
        primary: 'bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-lg shadow-sky-500/30 hover:shadow-xl hover:shadow-sky-500/40 hover:from-sky-600 hover:to-sky-700 focus:ring-sky-500',
        secondary: 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-slate-700 focus:ring-gray-500',
        outline: 'border-2 border-sky-500 text-sky-600 dark:text-sky-400 hover:bg-sky-500 hover:text-white focus:ring-sky-500 bg-transparent',
        ghost: 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-gray-100 bg-transparent',
        danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
    };

    const classes = `${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variantStyles[variant] || variantStyles.primary} ${className}`;

    const content = (
        <>
            {isLoading ? (
                <>
                    <svg
                        className="animate-spin h-5 w-5"
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
                    <span>Loading...</span>
                </>
            ) : (
                <>
                    {Icon && iconPosition === 'left' && <Icon className="w-5 h-5" />}
                    {children}
                    {Icon && iconPosition === 'right' && <Icon className="w-5 h-5" />}
                </>
            )}
        </>
    );

    // Render as Link (react-router)
    if (to) {
        return (
            <Link ref={ref} to={to} className={classes} {...props}>
                {content}
            </Link>
        );
    }

    // Render as anchor (external link)
    if (href) {
        return (
            <a ref={ref} href={href} className={classes} {...props}>
                {content}
            </a>
        );
    }

    // Render as button
    return (
        <motion.button
            ref={ref}
            type={type}
            disabled={disabled || isLoading}
            onClick={onClick}
            className={classes}
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            {...props}
        >
            {content}
        </motion.button>
    );
});

Button.displayName = 'Button';

export default Button;
