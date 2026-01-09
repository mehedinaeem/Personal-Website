/**
 * Navbar Component
 * Professional responsive navigation with glassmorphism
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
            window.location.href = `/#${href}`;
        }
        setIsOpen(false);
    };

    return (
        <>
            <motion.nav
                initial={{ y: -150 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.3 }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
                    ? 'py-8'
                    : 'py-12'
                    }`}
            >
                {/* Background with glassmorphism */}
                <div
                    className={`absolute inset-0 transition-all duration-500 ${isScrolled
                        ? 'bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl shadow-[0_2px_30px_-10px_rgba(0,0,0,0.1)] border-b border-white/20 dark:border-gray-800/50'
                        : 'bg-transparent'
                        }`}
                />

                <div className="relative section-container">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        {/* Logo */}
                        <Link
                            to="/"
                            className="relative group"
                        >
                            <span className="text-2xl font-bold bg-gradient-to-r from-sky-500 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
                                Portfolio
                            </span>
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-sky-500 to-violet-500 transition-all duration-300 group-hover:w-full" />
                        </Link>

                        {/* Desktop Navigation - Centered pill */}
                        <div className="hidden lg:flex items-center">
                            <div className="flex items-center gap-4 rounded-lg p-4">
                                {navLinks.map((link) => (
                                    <button
                                        key={link.href}
                                        onClick={() => handleNavClick(link.href)}
                                        className={`relative min-w-[60px] text-center px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${isHomePage && activeSection === link.href
                                            ? 'text-white'
                                            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
                                            }`}
                                    >
                                        {/* Active pill background */}
                                        {isHomePage && activeSection === link.href && (
                                            <motion.div
                                                layoutId="navPill"
                                                className="absolute inset-0 bg-gradient-to-r from-sky-500 to-violet-500 rounded-lg shadow-md shadow-sky-500/20"
                                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                            />
                                        )}
                                        <span className="relative z-10">{link.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Right side */}
                        <div className="flex items-center gap-4">
                            {/* Theme Toggle */}
                            <motion.button
                                onClick={toggleTheme}
                                className="relative p-4 rounded-full bg-gray-100/80 dark:bg-slate-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:border-sky-300 dark:hover:border-sky-700 transition-all duration-300 group"
                                aria-label="Toggle theme"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <div className="relative w-6 h-6">
                                    <motion.div
                                        initial={false}
                                        animate={{
                                            rotate: isDark ? 180 : 0,
                                            opacity: isDark ? 0 : 1
                                        }}
                                        className="absolute inset-0"
                                    >
                                        <HiMoon className="w-6 h-6 text-gray-600 group-hover:text-sky-600 transition-colors" />
                                    </motion.div>
                                    <motion.div
                                        initial={false}
                                        animate={{
                                            rotate: isDark ? 0 : -180,
                                            opacity: isDark ? 1 : 0
                                        }}
                                        className="absolute inset-0"
                                    >
                                        <HiSun className="w-6 h-6 text-yellow-500" />
                                    </motion.div>
                                </div>
                            </motion.button>

                            {/* Mobile Menu Button */}
                            <motion.button
                                onClick={() => setIsOpen(!isOpen)}
                                className="lg:hidden p-4 rounded-full bg-gray-100/80 dark:bg-slate-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 transition-colors"
                                aria-label="Toggle menu"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <motion.div
                                    animate={{ rotate: isOpen ? 90 : 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {isOpen ? (
                                        <HiX className="w-6 h-6" />
                                    ) : (
                                        <HiMenu className="w-6 h-6" />
                                    )}
                                </motion.div>
                            </motion.button>
                        </div>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
                        />

                        {/* Menu Panel */}
                        <motion.div
                            initial={{ opacity: 0, x: -300 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -300 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] z-50 lg:hidden bg-white dark:bg-slate-900 shadow-2xl"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-6 border-b border-gray-200 dark:border-gray-800">
                                <Link
                                    to="/"
                                    onClick={() => setIsOpen(false)}
                                    className="text-xl font-bold bg-gradient-to-r from-sky-500 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent"
                                >
                                    Portfolio
                                </Link>

                                {/* Theme Toggle */}
                                <motion.button
                                    onClick={toggleTheme}
                                    className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                                    aria-label="Toggle theme"
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {isDark ? (
                                        <HiSun className="w-5 h-5 text-yellow-500" />
                                    ) : (
                                        <HiMoon className="w-5 h-5 text-gray-600" />
                                    )}
                                </motion.button>
                            </div>

                            {/* Menu Items */}
                            <nav className="flex flex-col p-4">
                                {navLinks.map((link, index) => (
                                    <motion.button
                                        key={link.href}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => handleNavClick(link.href)}
                                        className={`relative flex items-center pl-5 pr-4 py-3 mb-1 rounded-lg text-left font-medium transition-all duration-200 group ${isHomePage && activeSection === link.href
                                            ? 'bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                                            }`}
                                    >
                                        {/* Left accent bar for active state */}
                                        {isHomePage && activeSection === link.href && (
                                            <motion.div
                                                layoutId="mobileActiveBar"
                                                className="absolute left-0 top-1 bottom-1 w-1 bg-gradient-to-b from-sky-500 to-violet-500 rounded-r-full"
                                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                            />
                                        )}
                                        <span className={`relative ${isHomePage && activeSection === link.href ? 'font-semibold' : ''}`}>
                                            {link.name}
                                        </span>
                                    </motion.button>
                                ))}
                            </nav>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
