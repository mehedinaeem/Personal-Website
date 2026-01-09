/**
 * Textarea Component
 * Form textarea with label and error state
 */

import { forwardRef } from 'react';

const Textarea = forwardRef(({
    label,
    name,
    placeholder,
    value,
    onChange,
    onBlur,
    error,
    touched,
    rows = 4,
    className = '',
    required = false,
    disabled = false,
    ...props
}, ref) => {
    const showError = error && touched;

    const textareaClasses = `w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 resize-none ${showError
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
            <textarea
                ref={ref}
                id={name}
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                rows={rows}
                disabled={disabled}
                className={textareaClasses}
                {...props}
            />
            {showError && (
                <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
        </div>
    );
});

Textarea.displayName = 'Textarea';

export default Textarea;
