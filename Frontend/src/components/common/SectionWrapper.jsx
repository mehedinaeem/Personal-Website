/**
 * Section Wrapper Component
 * Animated section with title and scroll reveal
 */

import { motion } from 'framer-motion';
import { useInView } from '../../hooks';

const SectionWrapper = ({
    id,
    title,
    subtitle,
    children,
    className = '',
    dark = false,
}) => {
    const { ref, isInView } = useInView({ threshold: 0.1 });

    return (
        <section
            id={id}
            className={`section-padding ${dark ? 'bg-gray-50 dark:bg-dark-200' : ''
                } ${className}`}
            ref={ref}
        >
            <div className="section-container">
                {(title || subtitle) && (
                    <motion.div
                        className="section-title"
                        initial={{ opacity: 0, y: 20 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5 }}
                    >
                        {title && (
                            <h2 className="text-balance">
                                <span className="gradient-text">{title}</span>
                            </h2>
                        )}
                        {subtitle && <p>{subtitle}</p>}
                    </motion.div>
                )}

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    {children}
                </motion.div>
            </div>
        </section>
    );
};

export default SectionWrapper;
