/**
 * Admin Dashboard Layout
 * Sidebar navigation and main content area
 */

import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiHome,
    HiCollection,
    HiLightBulb,
    HiDocument,
    HiAcademicCap,
    HiMail,
    HiUser,
    HiLogout,
    HiMenu,
    HiX,
    HiMoon,
    HiSun,
} from 'react-icons/hi';
import { useAuth, useTheme } from '../../context';

const navItems = [
    { name: 'Dashboard', path: '/admin', icon: HiHome },
    { name: 'Projects', path: '/admin/projects', icon: HiCollection },
    { name: 'Skills', path: '/admin/skills', icon: HiLightBulb },
    { name: 'Blog', path: '/admin/blog', icon: HiDocument },
    { name: 'Achievements', path: '/admin/achievements', icon: HiAcademicCap },
    { name: 'Messages', path: '/admin/messages', icon: HiMail },
    { name: 'Profile', path: '/admin/profile', icon: HiUser },
];

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/admin/login');
    };

    const NavLink = ({ item }) => {
        const isActive = location.pathname === item.path;

        return (
            <Link
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                        ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-100'
                    }`}
            >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
            </Link>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-300">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-dark-200 shadow-xl transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                        <Link to="/admin" className="text-xl font-bold font-display gradient-text">
                            Portfolio Admin
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                        {navItems.map((item) => (
                            <NavLink key={item.path} item={item} />
                        ))}
                    </nav>

                    {/* User */}
                    <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold">
                                {user?.name?.charAt(0) || 'A'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 dark:text-white truncate">
                                    {user?.name || 'Admin'}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                    {user?.email || 'admin@example.com'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                            <HiLogout className="w-5 h-5" />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Top bar */}
                <header className="sticky top-0 z-30 bg-white/80 dark:bg-dark-200/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between px-4 md:px-6 py-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-100"
                            aria-label="Open menu"
                        >
                            <HiMenu className="w-6 h-6" />
                        </button>

                        <div className="flex-1" />

                        <div className="flex items-center gap-2">
                            {/* Theme toggle */}
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

                            {/* View site */}
                            <Link
                                to="/"
                                target="_blank"
                                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-100 transition-colors"
                            >
                                View Site
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="p-4 md:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
