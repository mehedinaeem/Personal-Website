/**
 * Achievements Section
 * Certifications and awards display
 */

import { motion } from 'framer-motion';
import { HiAcademicCap, HiBadgeCheck, HiExternalLink } from 'react-icons/hi';
import { SectionWrapper } from '../../../components';

const achievements = [
    {
        id: 1,
        title: 'Certificate - Solar-Powered IoT-Based Smart Farming Model, IEEE i-COSTE 2025',
        issuer: 'IEEE i-COSTE 2025',
        date: '2025',
        type: 'certification',
        image: '/assets/certifications/spisfm-icoste-2025-certificate.webp',
        alt: 'Certificate for Solar-Powered IoT-Based Smart Farming Model presented at IEEE i-COSTE 2025',
        url: 'https://drive.google.com/file/d/1S3A8eUI6K8fzvCCWbq9v2EhU9BB2QPa8/view?usp=sharing',
    },
    {
        id: 2,
        title: 'Certificate - IoT-AI Safety Assistance System for Emergency Response, BILTEK Congress',
        issuer: 'International BILTEK Congress',
        date: '2025',
        type: 'certification',
        image: '/assets/certifications/iot-ai-safety-biltek-certificate.webp',
        alt: 'Certificate for IoT-AI Safety Assistance System for Emergency Response presented at the International BILTEK Congress',
        url: 'https://drive.google.com/file/d/1Y2OZi8HFb_l_16ufRb2AVsO-HkR8tHfZ/view?usp=sharing',
    },
    {
        id: 3,
        title: 'Certificate - Intelligent Solar-Based Agricultural Automation System, MEETCON-WORK',
        issuer: 'MEETCON-WORK International Congress',
        date: '2025',
        type: 'certification',
        image: '/assets/certifications/intelligent-solar-agri-automation-certificate.webp',
        alt: 'Certificate for Intelligent Solar-Based Agricultural Automation System presented at MEETCON-WORK International Congress',
        url: 'https://drive.google.com/file/d/1DrLT6gPxQA6WrMDJU9fvwAmeGt-91a7f/view?usp=sharing',
    },
    {
        id: 4,
        title: 'Certificate - Deep Learning-Based Tree Canopy Detection for Afforestation, MEETCON-WORK',
        issuer: 'MEETCON-WORK International Congress',
        date: '2025',
        type: 'certification',
        image: '/assets/certifications/tree-canopy-afforestation-certificate.webp',
        alt: 'Certificate for Deep Learning-Based Tree Canopy Detection for Afforestation presented at MEETCON-WORK International Congress',
        url: 'https://drive.google.com/file/d/1NKpe19gSlsyD5YAuHpRJZ03BEFoqXsqZ/view?usp=sharing',
    },
    {
        id: 5,
        title: 'Certificate - ML-Based Flood Impact Detection on Cropland',
        issuer: 'Cukurova Agriculture & Veterinary Congress',
        date: '2026',
        type: 'certification',
        image: '/assets/certifications/flood-impact-cropland-certificate.webp',
        alt: 'Certificate for ML-Based Flood Impact Detection on Cropland',
        url: 'https://drive.google.com/file/d/1yhLCJdHEmUqbsbwI4VlFtL8lP8rqVHg4/view?usp=sharing',
    },
    {
        id: 6,
        title: 'Verification - Intel Student Ambassador',
        issuer: 'Intel Corporation',
        date: '2025',
        type: 'certification',
        image: '/assets/certifications/intel-student-ambassador-proof.webp',
        alt: 'Verification document for Intel Student Ambassador role',
        url: 'https://drive.google.com/file/d/1Oy4l1vCgN0IOLpsc-pbFY_7nwJtA-PJw/view?usp=sharing',
    },
    {
        id: 7,
        title: 'ALP Leadership Program',
        issuer: 'Harvard University',
        date: '2024',
        type: 'certification',
        image: '/assets/certifications/alp-leadership-program-certificate.webp',
        alt: 'Certificate for ALP Leadership Program organized by Harvard University',
        description: 'Successfully completed the ALP Leadership Program organized by Harvard University.',
    },
    {
        id: 8,
        title: '1st Runner Up, TechMind Hackathon',
        issuer: 'Mid-Day Programming Club',
        date: '2025',
        type: 'award',
        description: '1st Runner Up, TechMind Hackathon organized by Mid-Day Programming Club.',
    },
    {
        id: 9,
        title: 'Top 10, Innovatex Hackathon',
        issuer: 'BUBT IT Club',
        date: '2025',
        type: 'award',
        description: 'Top 10 among 200 teams, Innovatex Hackathon organized by BUBT IT Club.',
    },
    {
        id: 10,
        title: 'Certified Research Presenter, IEEE i-COSTE 2025',
        issuer: 'IEEE i-COSTE',
        date: '2025',
        type: 'award',
        description: 'Certified to present research at 11th IEEE i-COSTE 2025.',
    },
    {
        id: 11,
        title: 'Certified Research Presenter, BILTEK Congress',
        issuer: 'International BILTEK Congress',
        date: '2025',
        type: 'award',
        description: 'Certified to present research at 13th International BILTEK Congress.',
    },
    {
        id: 12,
        title: 'Certified Research Presenter, MEETCON-WORK',
        issuer: 'MEETCON-WORK International Congress',
        date: '2025',
        type: 'award',
        description: 'Certified to present research at MEETCON-WORK International Food, Agriculture & Veterinary Sciences Congress.',
    },
    {
        id: 13,
        title: 'NASA Space Apps Challenge',
        issuer: 'NASA Space Apps',
        date: '2024-2025',
        type: 'award',
        description: 'Participated in NASA Space Apps Challenge 2024 and 2025.',
    },
    {
        id: 14,
        title: 'Hult Prize Program',
        issuer: 'Hult Prize',
        date: '2023-2024',
        type: 'award',
        description: 'Participated in Hult Prize Program 2023 and 2024.',
    },
    {
        id: 15,
        title: 'Government Scholarships',
        issuer: 'Bangladesh',
        date: 'PSC and JSC',
        type: 'award',
        description: 'Awarded government scholarships at PSC and JSC levels in Bangladesh.',
    },
    {
        id: 16,
        title: 'Sports Awards',
        issuer: 'Marathon, Cricket, and Football',
        date: 'Recognition',
        type: 'award',
        description: 'Received awards in Marathon, Cricket, and Football.',
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
                    alt={achievement.alt || achievement.title}
                    loading="lazy"
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
                            {achievement.issuer} - {achievement.date}
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
