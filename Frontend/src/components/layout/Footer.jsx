/**
 * Footer Component
 * Site footer with social links and quick navigation
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    HiMail,
    HiLocationMarker,
    HiHeart
} from 'react-icons/hi';
import {
    FaGithub,
    FaLinkedin,
    FaTwitter,
    FaInstagram
} from 'react-icons/fa';
import { useScrollTo } from '../../hooks';

const Footer = () => {
    const scrollTo = useScrollTo();
    const currentYear = new Date().getFullYear();

    const quickLinks = [
        { name: 'Home', href: 'hero' },
        { name: 'About', href: 'about' },
        { name: 'Projects', href: 'projects' },
        { name: 'Blog', href: 'blog' },
        { name: 'Contact', href: 'contact' },
    ];

    const socialLinks = [
        { name: 'GitHub', icon: FaGithub, href: '#' },
        { name: 'LinkedIn', icon: FaLinkedin, href: '#' },
        { name: 'Twitter', icon: FaTwitter, href: '#' },
        { name: 'Instagram', icon: FaInstagram, href: '#' },
    ];

    return (
        <footer className="bg-gray-50 dark:bg-dark-200 border-t border-gray-200 dark:border-gray-800">
            <div className="section-container py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                    {/* Brand */}
                    <div className="lg:col-span-2">
                        <Link
                            to="/"
                            className="text-2xl font-bold font-display gradient-text inline-block mb-4"
                        >
                            Portfolio
                        </Link>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                            Full-stack developer passionate about creating beautiful,
                            functional, and user-friendly web applications.
                        </p>
                        <div className="flex gap-3">
                            {socialLinks.map((social) => (
                                <motion.a
                                    key={social.name}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    whileHover={{ scale: 1.1, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="p-3 rounded-xl bg-white dark:bg-dark-100 shadow-md hover:shadow-lg transition-shadow"
                                    aria-label={social.name}
                                >
                                    <social.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                </motion.a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                            Quick Links
                        </h3>
                        <ul className="space-y-3">
                            {quickLinks.map((link) => (
                                <li key={link.href}>
                                    <button
                                        onClick={() => scrollTo(link.href)}
                                        className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                    >
                                        {link.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                            Get in Touch
                        </h3>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                <HiMail className="w-5 h-5 text-primary-500" />
                                <a
                                    href="mailto:hello@example.com"
                                    className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                >
                                    hello@example.com
                                </a>
                            </li>
                            <li className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                <HiLocationMarker className="w-5 h-5 text-primary-500" />
                                <span>Dhaka, Bangladesh</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-gray-600 dark:text-gray-400 text-sm flex items-center gap-1">
                            © {currentYear} Portfolio. Made with
                            <HiHeart className="w-4 h-4 text-red-500" />
                            in Bangladesh
                        </p>
                        <div className="flex gap-6 text-sm text-gray-600 dark:text-gray-400">
                            <Link
                                to="/privacy"
                                className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                            >
                                Privacy Policy
                            </Link>
                            <Link
                                to="/terms"
                                className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                            >
                                Terms of Service
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
