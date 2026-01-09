/**
 * Navbar Component
 * Professional responsive navigation with enhanced glassmorphism and decorative elements
 */

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMenu, HiX, HiMoon, HiSun, HiSparkles } from 'react-icons/hi';
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
                animate={{
                    y: isHidden ? -150 : 0,
                }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'py-3' : 'py-5'
                    }`}
            >
                {/* Multi-layer glassmorphism background */}
                <div className="absolute inset-0 overflow-hidden">
                    {/* Main glass layer */}
                    <div
                        className={`absolute inset-0 transition-all duration-500 ${isScrolled
                                ? 'bg-white/80 dark:bg-slate-900/85 backdrop-blur-3xl'
                                : 'bg-transparent'
                            }`}
                    />

                    {/* Gradient overlay for depth */}
                    {isScrolled && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/5 dark:to-slate-900/5"
                        />
                    )}

                    {/* Border with gradient */}
                    <div
                        className={`absolute bottom-0 left-0 right-0 h-px transition-all duration-500 ${isScrolled
                                ? 'bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-700/50 opacity-100'
                                : 'opacity-0'
                            }`}
                    />

                    {/* Shadow layer */}
                    {isScrolled && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.3)]"
                        />
                    )}
                </div>

                <div className="relative section-container">
                    <div className="flex items-center justify-between">
                        {/* Enhanced Logo with glow effect */}
                        <Link
                            to="/"
                            className="relative group"
                        >
                            <motion.div
                                className="relative"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {/* Glow effect */}
                                <div className="absolute -inset-2 bg-gradient-to-r from-sky-500/20 via-violet-500/20 to-fuchsia-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className="relative flex items-center gap-2.5">
                                    {/* Icon decoration */}
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-br from-sky-500 to-violet-600 rounded-lg blur-md opacity-70" />
                                        <div className="relative bg-gradient-to-br from-sky-500 to-violet-600 p-1.5 rounded-lg">
                                            <HiSparkles className="w-4 h-4 text-white" />
                                        </div>
                                    </div>

                                    {/* Logo text */}
                                    <span className="text-2xl font-bold bg-gradient-to-r from-sky-600 via-violet-600 to-fuchsia-600 dark:from-sky-400 dark:via-violet-400 dark:to-fuchsia-400 bg-clip-text text-transparent font-display tracking-tight">
                                        Portfolio
                                    </span>
                                </div>

                                {/* Animated underline */}
                                <motion.span
                                    className="absolute -bottom-1.5 left-0 h-0.5 bg-gradient-to-r from-sky-500 via-violet-500 to-fuchsia-500 rounded-full"
                                    initial={{ width: 0 }}
                                    whileHover={{ width: '100%' }}
                                    transition={{ duration: 0.3, ease: 'easeOut' }}
                                />
                            </motion.div>
                        </Link>

                        {/* Desktop Navigation - Enhanced pill design */}
                        <div className="hidden lg:flex items-center absolute left-1/2 -translate-x-1/2">
                            <div className={`relative flex items-center gap-1 px-2 py-2 rounded-2xl transition-all duration-500 ${isScrolled
                                    ? 'bg-gray-50/80 dark:bg-slate-800/80 backdrop-blur-xl border border-gray-200/60 dark:border-gray-700/60 shadow-lg shadow-black/5 dark:shadow-black/20'
                                    : 'bg-white/60 dark:bg-slate-800/60 backdrop-blur-2xl border border-white/40 dark:border-gray-700/40'
                                }`}>
                                {/* Inner glow effect */}
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/60 to-transparent dark:from-white/5 dark:to-transparent pointer-events-none" />

                                {navLinks.map((link) => (
                                    <button
                                        key={link.href}
                                        onClick={() => handleNavClick(link.href)}
                                        className="relative group"
                                    >
                                        {/* Active pill background with enhanced shadow */}
                                        {isHomePage && activeSection === link.href && (
                                            <motion.div
                                                layoutId="navPill"
                                                className="absolute inset-0 bg-gradient-to-br from-sky-500 via-violet-500 to-violet-600 rounded-xl shadow-[0_4px_16px_-2px_rgba(14,165,233,0.4)] dark:shadow-[0_4px_20px_-2px_rgba(14,165,233,0.6)]"
                                                transition={{
                                                    type: 'spring',
                                                    stiffness: 400,
                                                    damping: 30
                                                }}
                                            />
                                        )}

                                        {/* Hover background */}
                                        {!(isHomePage && activeSection === link.href) && (
                                            <motion.div
                                                className="absolute inset-0 bg-white/70 dark:bg-slate-700/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                            />
                                        )}

                                        <span className={`relative z-10 block px-4 py-2 text-sm font-semibold tracking-wide transition-all duration-200 ${isHomePage && activeSection === link.href
                                                ? 'text-white'
                                                : 'text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white'
                                            }`}>
                                            {link.name}
                                        </span>

                                        {/* Active indicator dot */}
                                        {isHomePage && activeSection === link.href && (
                                            <motion.div
                                                layoutId="navDot"
                                                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white shadow-sm"
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ duration: 0.2 }}
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Right side with enhanced styling */}
                        <div className="flex items-center gap-3">
                            {/* Theme Toggle with gradient border */}
                            <motion.button
                                onClick={toggleTheme}
                                className="relative group"
                                aria-label="Toggle theme"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {/* Gradient border */}
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-500 to-violet-500 rounded-full opacity-0 group-hover:opacity-100 blur transition-opacity duration-300" />

                                {/* Button container */}
                                <div className={`relative p-3 rounded-full transition-all duration-300 ${isScrolled
                                        ? 'bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-gray-700'
                                        : 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/60 dark:border-gray-700/60'
                                    }`}>
                                    <div className="relative w-5 h-5">
                                        {/* Moon icon */}
                                        <motion.div
                                            initial={false}
                                            animate={{
                                                rotate: isDark ? 180 : 0,
                                                opacity: isDark ? 0 : 1,
                                                scale: isDark ? 0.5 : 1
                                            }}
                                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                                            className="absolute inset-0"
                                        >
                                            <HiMoon className="w-5 h-5 text-gray-700 group-hover:text-sky-600 transition-colors" />
                                        </motion.div>

                                        {/* Sun icon */}
                                        <motion.div
                                            initial={false}
                                            animate={{
                                                rotate: isDark ? 0 : -180,
                                                opacity: isDark ? 1 : 0,
                                                scale: isDark ? 1 : 0.5
                                            }}
                                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                                            className="absolute inset-0"
                                        >
                                            <HiSun className="w-5 h-5 text-yellow-500 group-hover:text-yellow-600 transition-colors" />
                                        </motion.div>
                                    </div>
                                </div>
                            </motion.button>

                            {/* Decorative divider (desktop only) */}
                            <div className="hidden lg:block w-px h-8 bg-gradient-to-b from-transparent via-gray-300 to-transparent dark:via-gray-600" />

                            {/* CTA Button (desktop only) */}
                            <Link
                                to="/admin/login"
                                className="hidden lg:block"
                            >
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="relative group"
                                >
                                    {/* Glow effect */}
                                    <div className="absolute -inset-1 bg-gradient-to-r from-sky-500 to-violet-500 rounded-xl blur-lg opacity-30 group-hover:opacity-60 transition-opacity duration-300" />

                                    <div className="relative px-5 py-2.5 bg-gradient-to-r from-sky-500 to-violet-600 rounded-xl text-white font-semibold text-sm shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 transition-shadow duration-300">
                                        <span className="flex items-center gap-2">
                                            <span>Get Started</span>
                                            <motion.span
                                                animate={{ x: [0, 4, 0] }}
                                                transition={{
                                                    duration: 1.5,
                                                    repeat: Infinity,
                                                    ease: 'easeInOut'
                                                }}
                                            >
                                                →
                                            </motion.span>
                                        </span>
                                    </div>
                                </motion.div>
                            </Link>

                            {/* Mobile Menu Button with enhanced styling */}
                            <motion.button
                                onClick={() => setIsOpen(!isOpen)}
                                className={`lg:hidden relative group p-3 rounded-full transition-all duration-300 ${isScrolled
                                        ? 'bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-gray-700'
                                        : 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/60 dark:border-gray-700/60'
                                    }`}
                                aria-label="Toggle menu"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {/* Gradient border on hover */}
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-500 to-violet-500 rounded-full opacity-0 group-hover:opacity-100 blur transition-opacity duration-300" />

                                <motion.div
                                    animate={{ rotate: isOpen ? 90 : 0 }}
                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                    className="relative w-5 h-5"
                                >
                                    <AnimatePresence mode="wait">
                                        {isOpen ? (
                                            <motion.div
                                                key="close"
                                                initial={{ rotate: -90, opacity: 0 }}
                                                animate={{ rotate: 0, opacity: 1 }}
                                                exit={{ rotate: 90, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <HiX className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="menu"
                                                initial={{ rotate: -90, opacity: 0 }}
                                                animate={{ rotate: 0, opacity: 1 }}
                                                exit={{ rotate: 90, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <HiMenu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            </motion.button>
                        </div>
                    </div>
                </div>
            </motion.nav>

            {/* Enhanced Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Enhanced Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-md z-40 lg:hidden"
                        />

                        {/* Enhanced Menu Panel */}
                        <motion.div
                            initial={{ opacity: 0, x: -320 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -320 }}
                            transition={{
                                type: 'spring',
                                stiffness: 300,
                                damping: 30,
                                mass: 0.8
                            }}
                            className="fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] z-50 lg:hidden bg-white dark:bg-slate-900 shadow-2xl flex flex-col overflow-hidden"
                        >
                            {/* Decorative gradient overlay */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 via-violet-500 to-fuchsia-500" />

                            {/* Enhanced Header */}
                            <div className="relative px-6 py-6 border-b border-gray-200 dark:border-gray-700/50 bg-gradient-to-b from-gray-50/50 to-transparent dark:from-slate-800/50">
                                <div className="flex items-center justify-between">
                                    <Link
                                        to="/"
                                        onClick={() => setIsOpen(false)}
                                        className="relative group"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            {/* Icon */}
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-gradient-to-br from-sky-500 to-violet-600 rounded-lg blur-sm opacity-70" />
                                                <div className="relative bg-gradient-to-br from-sky-500 to-violet-600 p-1.5 rounded-lg">
                                                    <HiSparkles className="w-4 h-4 text-white" />
                                                </div>
                                            </div>

                                            <span className="text-xl font-bold bg-gradient-to-r from-sky-600 via-violet-600 to-fuchsia-600 dark:from-sky-400 dark:via-violet-400 dark:to-fuchsia-400 bg-clip-text text-transparent font-display">
                                                Portfolio
                                            </span>
                                        </div>
                                    </Link>

                                    <div className="flex items-center gap-2">
                                        {/* Theme Toggle */}
                                        <motion.button
                                            onClick={toggleTheme}
                                            className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                                            aria-label="Toggle theme"
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <AnimatePresence mode="wait">
                                                {isDark ? (
                                                    <motion.div
                                                        key="sun"
                                                        initial={{ rotate: -180, opacity: 0 }}
                                                        animate={{ rotate: 0, opacity: 1 }}
                                                        exit={{ rotate: 180, opacity: 0 }}
                                                        transition={{ duration: 0.3 }}
                                                    >
                                                        <HiSun className="w-5 h-5 text-yellow-500" />
                                                    </motion.div>
                                                ) : (
                                                    <motion.div
                                                        key="moon"
                                                        initial={{ rotate: -180, opacity: 0 }}
                                                        animate={{ rotate: 0, opacity: 1 }}
                                                        exit={{ rotate: 180, opacity: 0 }}
                                                        transition={{ duration: 0.3 }}
                                                    >
                                                        <HiMoon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </motion.button>

                                        {/* Close Button */}
                                        <motion.button
                                            onClick={() => setIsOpen(false)}
                                            className="p-2.5 rounded-xl border-2 border-sky-500/50 hover:border-sky-500 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-all duration-200"
                                            aria-label="Close menu"
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <HiX className="w-5 h-5 text-sky-500" />
                                        </motion.button>
                                    </div>
                                </div>
                            </div>

                            {/* Enhanced Menu Items */}
                            <nav className="flex-1 overflow-y-auto p-5">
                                <div className="space-y-1.5">
                                    {navLinks.map((link, index) => (
                                        <motion.button
                                            key={link.href}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{
                                                delay: index * 0.05,
                                                type: 'spring',
                                                stiffness: 300,
                                                damping: 25
                                            }}
                                            onClick={() => handleNavClick(link.href)}
                                            className={`relative w-full text-left px-5 py-4 rounded-xl font-semibold transition-all duration-200 group ${isHomePage && activeSection === link.href
                                                    ? 'bg-gradient-to-r from-sky-500 to-violet-500 text-white shadow-lg shadow-sky-500/25'
                                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:pl-7'
                                                }`}
                                        >
                                            {/* Active indicator */}
                                            {isHomePage && activeSection === link.href && (
                                                <motion.div
                                                    layoutId="mobilePill"
                                                    className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-full"
                                                />
                                            )}

                                            <span className="flex items-center justify-between">
                                                <span>{link.name}</span>
                                                {isHomePage && activeSection === link.href && (
                                                    <motion.span
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        className="text-white/80"
                                                    >
                                                        ✓
                                                    </motion.span>
                                                )}
                                            </span>
                                        </motion.button>
                                    ))}
                                </div>
                            </nav>

                            {/* Enhanced Bottom CTA */}
                            <div className="p-5 border-t border-gray-200 dark:border-gray-700/50 bg-gradient-to-t from-gray-50/50 to-transparent dark:from-slate-800/50">
                                <Link
                                    to="/admin/login"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="relative group"
                                    >
                                        {/* Glow effect */}
                                        <div className="absolute -inset-1 bg-gradient-to-r from-sky-500 to-violet-500 rounded-xl blur-lg opacity-30 group-hover:opacity-60 transition-opacity duration-300" />

                                        <div className="relative w-full text-center px-6 py-4 bg-gradient-to-r from-sky-500 to-violet-600 text-white font-bold rounded-xl shadow-xl shadow-sky-500/30 hover:shadow-sky-500/50 transition-all duration-300">
                                            <span className="flex items-center justify-center gap-2">
                                                <span>Get Started</span>
                                                <motion.span
                                                    animate={{ x: [0, 4, 0] }}
                                                    transition={{
                                                        duration: 1.5,
                                                        repeat: Infinity,
                                                        ease: 'easeInOut'
                                                    }}
                                                >
                                                    →
                                                </motion.span>
                                            </span>
                                        </div>
                                    </motion.div>
                                </Link>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
