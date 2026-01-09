/**
 * Achievements Section
 * Certifications and awards display
 */

import { motion } from 'framer-motion';
import { HiAcademicCap, HiStar, HiBadgeCheck, HiExternalLink } from 'react-icons/hi';
import { SectionWrapper } from '../../../components';

const achievements = [
    {
        id: 1,
        title: 'AWS Certified Solutions Architect',
        issuer: 'Amazon Web Services',
        date: '2024',
        type: 'certification',
        image: 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=200&h=150&fit=crop',
        url: '#',
    },
    {
        id: 2,
        title: 'Meta Front-End Developer Certificate',
        issuer: 'Meta (Coursera)',
        date: '2023',
        type: 'certification',
        image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200&h=150&fit=crop',
        url: '#',
    },
    {
        id: 3,
        title: 'Google Cloud Professional',
        issuer: 'Google',
        date: '2023',
        type: 'certification',
        image: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=200&h=150&fit=crop',
        url: '#',
    },
    {
        id: 4,
        title: 'Best Innovative Project Award',
        issuer: 'TechFest 2024',
        date: '2024',
        type: 'award',
        description: 'Won first place for developing an AI-powered accessibility tool',
    },
    {
        id: 5,
        title: 'Open Source Contributor',
        issuer: 'GitHub',
        date: '2023',
        type: 'award',
        description: '500+ contributions to open source projects',
    },
    {
        id: 6,
        title: 'Hackathon Champion',
        issuer: 'DevHack 2023',
        date: '2023',
        type: 'award',
        description: '1st place among 200+ participants',
    },
];

const typeIcons = {
    certification: HiAcademicCap,
    award: HiBadgeCheck,
};

const typeColors = {
    certification: 'from-blue-500 to-cyan-500',
    award: 'from-yellow-500 to-orange-500',
};

const AchievementCard = ({ achievement, index }) => {
    const Icon = typeIcons[achievement.type];
    const color = typeColors[achievement.type];

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="card p-6 flex gap-4"
        >
            {achievement.image ? (
                <img
                    src={achievement.image}
                    alt={achievement.title}
                    className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                />
            ) : (
                <div className={`w-20 h-20 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-8 h-8 text-white" />
                </div>
            )}

            <div className="flex-grow min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                            {achievement.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {achievement.issuer} • {achievement.date}
                        </p>
                    </div>
                    {achievement.url && (
                        <a
                            href={achievement.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-200 transition-colors flex-shrink-0"
                            aria-label="View certificate"
                        >
                            <HiExternalLink className="w-4 h-4 text-gray-400" />
                        </a>
                    )}
                </div>
                {achievement.description && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {achievement.description}
                    </p>
                )}
            </div>
        </motion.div>
    );
};

const Achievements = () => {
    const certifications = achievements.filter((a) => a.type === 'certification');
    const awards = achievements.filter((a) => a.type === 'award');

    return (
        <SectionWrapper
            id="achievements"
            title="Achievements"
            subtitle="Certifications, awards, and recognition"
        >
            <div className="grid lg:grid-cols-2 gap-12">
                {/* Certifications */}
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                            <HiAcademicCap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Certifications
                        </h3>
                    </div>
                    <div className="space-y-4">
                        {certifications.map((achievement, index) => (
                            <AchievementCard key={achievement.id} achievement={achievement} index={index} />
                        ))}
                    </div>
                </div>

                {/* Awards */}
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                            <HiBadgeCheck className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Awards & Recognition
                        </h3>
                    </div>
                    <div className="space-y-4">
                        {awards.map((achievement, index) => (
                            <AchievementCard key={achievement.id} achievement={achievement} index={index} />
                        ))}
                    </div>
                </div>
            </div>
        </SectionWrapper>
    );
};

export default Achievements;
