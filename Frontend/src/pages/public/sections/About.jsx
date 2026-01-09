/**
 * About Section
 * Profile info with image and bio
 */

import { motion } from 'framer-motion';
import { HiDownload, HiMail, HiLocationMarker, HiBriefcase } from 'react-icons/hi';
import { SectionWrapper } from '../../../components';
import { Button } from '../../../components';

const About = () => {
    const stats = [
        { label: 'Years Experience', value: '5+' },
        { label: 'Projects Completed', value: '50+' },
        { label: 'Happy Clients', value: '30+' },
        { label: 'Technologies', value: '20+' },
    ];

    return (
        <SectionWrapper
            id="about"
            title="About Me"
            subtitle="Get to know me better"
            dark
        >
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                {/* Image */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="relative"
                >
                    <div className="relative w-full max-w-md mx-auto">
                        {/* Background decoration */}
                        <div className="absolute -inset-4 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl opacity-20 blur-2xl" />

                        {/* Image container */}
                        <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl">
                            <img
                                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop"
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                        </div>

                        {/* Floating card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="absolute -bottom-6 -right-6 glass-strong p-4 rounded-xl shadow-xl"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                                    <HiBriefcase className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Currently</p>
                                    <p className="font-semibold text-gray-900 dark:text-white">Open to Work</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Content */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <h3 className="heading-3 mb-4">
                        Passionate Developer Creating{' '}
                        <span className="gradient-text">Digital Excellence</span>
                    </h3>

                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        I'm a full-stack developer with 5+ years of experience building
                        web applications. I specialize in React, Node.js, and Python,
                        with a focus on creating scalable and user-friendly solutions.
                    </p>

                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        When I'm not coding, you'll find me exploring new technologies,
                        contributing to open-source projects, or sharing knowledge through
                        blog posts and tech talks.
                    </p>

                    {/* Info */}
                    <div className="grid sm:grid-cols-2 gap-4 mb-8">
                        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                            <HiMail className="w-5 h-5 text-primary-500" />
                            <span>hello@example.com</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                            <HiLocationMarker className="w-5 h-5 text-primary-500" />
                            <span>Dhaka, Bangladesh</span>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                        {stats.map((stat) => (
                            <div
                                key={stat.label}
                                className="text-center p-4 rounded-xl bg-white dark:bg-dark-100 shadow-md"
                            >
                                <p className="text-2xl font-bold gradient-text">{stat.value}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* CTA */}
                    <Button icon={HiDownload}>
                        Download Resume
                    </Button>
                </motion.div>
            </div>
        </SectionWrapper>
    );
};

export default About;
