/**
 * Admin Dashboard Page
 * Overview statistics and quick actions
 */

import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
    HiCollection,
    HiLightBulb,
    HiDocument,
    HiAcademicCap,
    HiMail,
    HiEye,
    HiPlus,
} from 'react-icons/hi';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui';

const stats = [
    { name: 'Projects', value: 12, icon: HiCollection, color: 'from-blue-500 to-cyan-500', path: '/admin/projects' },
    { name: 'Skills', value: 24, icon: HiLightBulb, color: 'from-yellow-500 to-orange-500', path: '/admin/skills' },
    { name: 'Blog Posts', value: 8, icon: HiDocument, color: 'from-purple-500 to-pink-500', path: '/admin/blog' },
    { name: 'Achievements', value: 6, icon: HiAcademicCap, color: 'from-green-500 to-emerald-500', path: '/admin/achievements' },
    { name: 'Messages', value: 15, icon: HiMail, color: 'from-red-500 to-rose-500', path: '/admin/messages' },
];

const quickActions = [
    { name: 'Add Project', icon: HiPlus, path: '/admin/projects/new', color: 'btn-primary' },
    { name: 'Write Blog Post', icon: HiDocument, path: '/admin/blog/new', color: 'btn-secondary' },
    { name: 'View Messages', icon: HiMail, path: '/admin/messages', color: 'btn-secondary' },
    { name: 'View Site', icon: HiEye, path: '/', external: true, color: 'btn-secondary' },
];

const recentActivity = [
    { type: 'project', action: 'Updated', title: 'E-Commerce Platform', time: '2 hours ago' },
    { type: 'blog', action: 'Published', title: 'React Best Practices', time: '5 hours ago' },
    { type: 'message', action: 'New', title: 'from John Doe', time: '1 day ago' },
    { type: 'achievement', action: 'Added', title: 'AWS Certification', time: '2 days ago' },
];

const DashboardPage = () => {
    return (
        <>
            <Helmet>
                <title>Dashboard | Admin</title>
            </Helmet>

            <div className="space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Dashboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Welcome back! Here's an overview of your portfolio.
                    </p>
                </div>

                {/* Stats */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link
                                to={stat.path}
                                className="card p-6 block hover:border-primary-300 dark:hover:border-primary-700"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                                        <stat.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {stat.value}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {stat.name}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Quick Actions */}
                    <div className="lg:col-span-1">
                        <div className="card p-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Quick Actions
                            </h2>
                            <div className="space-y-3">
                                {quickActions.map((action) => (
                                    <Link
                                        key={action.name}
                                        to={action.path}
                                        target={action.external ? '_blank' : undefined}
                                        className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all ${action.color === 'btn-primary'
                                                ? 'bg-primary-500 text-white hover:bg-primary-600'
                                                : 'bg-gray-100 dark:bg-dark-100 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-200'
                                            }`}
                                    >
                                        <action.icon className="w-5 h-5" />
                                        {action.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="lg:col-span-2">
                        <div className="card p-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Recent Activity
                            </h2>
                            <div className="space-y-4">
                                {recentActivity.map((activity, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-dark-100"
                                    >
                                        <div className={`w-2 h-2 rounded-full ${activity.type === 'project' ? 'bg-blue-500' :
                                                activity.type === 'blog' ? 'bg-purple-500' :
                                                    activity.type === 'message' ? 'bg-red-500' :
                                                        'bg-green-500'
                                            }`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 dark:text-white truncate">
                                                {activity.action}: {activity.title}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {activity.time}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DashboardPage;
