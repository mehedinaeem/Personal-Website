/**
 * Input Component
 * Form input with label, error state, and icons
 */

import { forwardRef } from 'react';

const Input = forwardRef(({
    label,
    name,
    type = 'text',
    placeholder,
    value,
    onChange,
    onBlur,
    error,
    touched,
    icon: Icon,
    className = '',
    required = false,
    disabled = false,
    ...props
}, ref) => {
    const showError = error && touched;

    const inputClasses = `w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${Icon ? 'pl-10' : ''
        } ${showError
            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
            : 'border-gray-200 dark:border-gray-700'
        }`;

    return (
        <div className={`mb-4 ${className}`}>
            {label && (
                <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Icon className="w-5 h-5" />
                    </div>
                )}
                <input
                    ref={ref}
                    id={name}
                    name={name}
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    disabled={disabled}
                    className={inputClasses}
                    {...props}
                />
            </div>
            {showError && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
