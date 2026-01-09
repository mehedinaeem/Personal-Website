/**
 * Hero Section
 * Animated hero with typing effect and CTAs
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiDownload, HiMail, HiArrowDown } from 'react-icons/hi';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { Button } from '../../../components';
import { useScrollTo } from '../../../hooks';

const roles = [
    'Software Engineer',
    'Researcher',
    'Problem Solver',
    'Tech Explorer',
];

const Hero = () => {
    const [roleIndex, setRoleIndex] = useState(0);
    const [displayText, setDisplayText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const scrollTo = useScrollTo();

    // Typing effect
    useEffect(() => {
        const currentRole = roles[roleIndex];
        const timeout = setTimeout(() => {
            if (!isDeleting) {
                if (displayText.length < currentRole.length) {
                    setDisplayText(currentRole.slice(0, displayText.length + 1));
                } else {
                    setTimeout(() => setIsDeleting(true), 1500);
                }
            } else {
                if (displayText.length > 0) {
                    setDisplayText(displayText.slice(0, -1));
                } else {
                    setIsDeleting(false);
                    setRoleIndex((prev) => (prev + 1) % roles.length);
                }
            }
        }, isDeleting ? 50 : 100);

        return () => clearTimeout(timeout);
    }, [displayText, isDeleting, roleIndex]);

    return (
        <section
            id="hero"
            className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32 md:pt-35"
        >
            {/* Background Effects */}
            <div className="absolute inset-0 -z-10">
                {/* Gradient orbs */}
                <motion.div
                    className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl"
                    animate={{
                        x: [0, 50, 0],
                        y: [0, 30, 0],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
                <motion.div
                    className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl"
                    animate={{
                        x: [0, -50, 0],
                        y: [0, -30, 0],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />

                {/* Grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
            </div>

            <div className="section-container text-center">
                {/* Greeting */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-6"
                >
                    <span className="inline-block px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium">
                        👋 Welcome to my world!
                    </span>
                </motion.div>

                {/* Name */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="heading-1 mb-4"
                >
                    Hi, I'm{' '}
                    <span className="gradient-text">Md Mehedi Hasan Naeem</span>
                </motion.h1>

                {/* Role with typing effect */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-8 h-8"
                >
                    <span>{displayText}</span>
                    <span className="animate-pulse">|</span>
                </motion.div>

                {/* Description */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10"
                >
                    I build exceptional digital experiences that are fast, accessible,
                    and designed with modern best practices. Let's create something amazing together.
                </motion.p>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="flex justify-center items-center gap-5 mb-12"
                >
                    <Button
                        onClick={() => scrollTo('contact')}
                        icon={HiMail}
                    >
                        Get in Touch
                    </Button>
                    <Button
                        variant="secondary"
                        icon={HiDownload}
                    >
                        Download CV
                    </Button>
                </motion.div>

                {/* Social Links */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="flex justify-center gap-4"
                >
                    <a
                        href="https://github.com/mehedinaeem"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-xl bg-white dark:bg-dark-100 shadow-lg hover:shadow-xl transition-shadow hover:-translate-y-1 duration-300"
                        aria-label="GitHub"
                    >
                        <FaGithub className="w-6 h-6" />
                    </a>
                    <a
                        href="https://linkedin.com/in/mehedinaeem"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-xl bg-white dark:bg-dark-100 shadow-lg hover:shadow-xl transition-shadow hover:-translate-y-1 duration-300"
                        aria-label="LinkedIn"
                    >
                        <FaLinkedin className="w-6 h-6 text-blue-600" />
                    </a>
                </motion.div>
            </div>

            {/* Scroll indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2"
            >
                <motion.button
                    onClick={() => scrollTo('about')}
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="p-2 rounded-full bg-white/50 dark:bg-dark-100/50 backdrop-blur-sm"
                    aria-label="Scroll to about section"
                >
                    <HiArrowDown className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </motion.button>
            </motion.div>
        </section>
    );
};

export default Hero;
