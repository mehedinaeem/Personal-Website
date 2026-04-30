/**
 * Skills Section
 * Categorized skill cards with progress indicators
 */

import { motion } from 'framer-motion';
import {
    HiCode,
    HiDatabase,
    HiDeviceMobile,
    HiServer,
    HiCloud,
    HiCog
} from 'react-icons/hi';
import { SectionWrapper } from '../../../components';

const skillCategories = [
    {
        name: 'Programming and Development',
        icon: HiCode,
        color: 'from-blue-500 to-cyan-500',
        skills: [
            { name: 'C', level: 90 },
            { name: 'C++', level: 90 },
            { name: 'Python', level: 88 },
            { name: 'Java', level: 78 },
            { name: 'JavaScript', level: 82 },
            { name: 'R', level: 72 },
            { name: 'Django', level: 82 },
            { name: 'React', level: 82 },
        ],
    },
    {
        name: 'Web and Frontend',
        icon: HiServer,
        color: 'from-green-500 to-emerald-500',
        skills: [
            { name: 'HTML', level: 90 },
            { name: 'CSS', level: 88 },
            { name: 'Bootstrap', level: 82 },
            { name: 'Tailwind', level: 84 },
        ],
    },
    {
        name: 'AI and ML',
        icon: HiDatabase,
        color: 'from-purple-500 to-pink-500',
        skills: [
            { name: 'Deep Learning', level: 84 },
            { name: 'NLP', level: 82 },
            { name: 'Computer Vision', level: 84 },
            { name: 'Intel oneAPI', level: 78 },
            { name: 'OpenVINO', level: 76 },
            { name: 'GenAI', level: 80 },
            { name: 'TensorFlow', level: 82 },
        ],
    },
    {
        name: 'DevOps',
        icon: HiCloud,
        color: 'from-orange-500 to-red-500',
        skills: [
            { name: 'Git', level: 90 },
            { name: 'Docker', level: 78 },
            { name: 'CI/CD', level: 76 },
            { name: 'Agile', level: 82 },
            { name: 'Notion', level: 86 },
            { name: 'Microsoft 365', level: 86 },
        ],
    },
    {
        name: 'Others',
        icon: HiDeviceMobile,
        color: 'from-teal-500 to-cyan-500',
        skills: [
            { name: 'IoT Integration', level: 86 },
            { name: 'Embedded Systems', level: 82 },
            { name: 'Database Management', level: 80 },
            { name: 'Raspberry Pi', level: 84 },
        ],
    },
    {
        name: 'Soft Skills',
        icon: HiCog,
        color: 'from-yellow-500 to-orange-500',
        skills: [
            { name: 'Leadership', level: 92 },
            { name: 'Event Management', level: 90 },
            { name: 'Public Speaking', level: 86 },
            { name: 'Mentoring', level: 88 },
            { name: 'Team Coordination', level: 90 },
        ],
    },
];

const SkillCard = ({ category, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
        className="card p-6 group"
    >
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${category.color}`}>
                <category.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {category.name}
            </h3>
        </div>

        {/* Skills */}
        <div className="space-y-4">
            {category.skills.map((skill) => (
                <div key={skill.name}>
                    <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {skill.name}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            {skill.level}%
                        </span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-dark-200 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${skill.level}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className={`h-full rounded-full bg-gradient-to-r ${category.color}`}
                        />
                    </div>
                </div>
            ))}
        </div>
    </motion.div>
);

const Skills = () => {
    return (
        <SectionWrapper
            id="skills"
            title="My Skills"
            subtitle="Technologies and tools I work with"
        >
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {skillCategories.map((category, index) => (
                    <SkillCard key={category.name} category={category} index={index} />
                ))}
            </div>
        </SectionWrapper>
    );
};

export default Skills;
