/**
 * Navbar Component
 * Responsive navigation with dark mode toggle and mobile menu
 */

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMenu, HiX, HiMoon, HiSun } from 'react-icons/hi';
import { useTheme } from '../../context';
import { useScrollPosition, useScrollTo, useActiveSection } from '../../hooks';

const navLinks = [
    { name: 'Home', href: 'hero' },
    { name: 'About', href: 'about' },
    { name: 'Skills', href: 'skills' },
    { name: 'Projects', href: 'projects' },
    { name: 'Achievements', href: 'achievements' },
    { name: 'Blog', href: 'blog' },
    { name: 'Contact', href: 'contact' },
];

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { isDark, toggleTheme } = useTheme();
    const { scrollPosition, scrollDirection } = useScrollPosition();
    const scrollTo = useScrollTo();
    const location = useLocation();
    const activeSection = useActiveSection(navLinks.map((link) => link.href));

    const isScrolled = scrollPosition > 50;
    const isHidden = scrollDirection === 'down' && scrollPosition > 200;
    const isHomePage = location.pathname === '/';

    // Close mobile menu on route change
    useEffect(() => {
        setIsOpen(false);
    }, [location]);

    const handleNavClick = (href) => {
        if (isHomePage) {
            scrollTo(href);
        } else {
            // Navigate to home page with hash
            window.location.href = `/#${href}`;
        }
        setIsOpen(false);
    };

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: isHidden ? -100 : 0 }}
                transition={{ duration: 0.3 }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                        ? 'glass shadow-lg py-3'
                        : 'bg-transparent py-5'
                    }`}
            >
                <div className="section-container">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Link
                            to="/"
                            className="text-2xl font-bold font-display gradient-text"
                        >
                            Portfolio
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-1">
                            {navLinks.map((link) => (
                                <button
                                    key={link.href}
                                    onClick={() => handleNavClick(link.href)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${isHomePage && activeSection === link.href
                                            ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-dark-100'
                                        }`}
                                >
                                    {link.name}
                                </button>
                            ))}
                        </div>

                        {/* Right side */}
                        <div className="flex items-center gap-2">
                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-100 transition-colors"
                                aria-label="Toggle theme"
                            >
                                {isDark ? (
                                    <HiSun className="w-5 h-5 text-yellow-500" />
                                ) : (
                                    <HiMoon className="w-5 h-5 text-gray-600" />
                                )}
                            </button>

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-100 transition-colors"
                                aria-label="Toggle menu"
                            >
                                {isOpen ? (
                                    <HiX className="w-6 h-6" />
                                ) : (
                                    <HiMenu className="w-6 h-6" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-[72px] left-0 right-0 z-40 md:hidden glass shadow-lg"
                    >
                        <div className="section-container py-4">
                            <div className="flex flex-col gap-2">
                                {navLinks.map((link) => (
                                    <button
                                        key={link.href}
                                        onClick={() => handleNavClick(link.href)}
                                        className={`px-4 py-3 rounded-lg text-left font-medium transition-all ${isHomePage && activeSection === link.href
                                                ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20'
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-100'
                                            }`}
                                    >
                                        {link.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
