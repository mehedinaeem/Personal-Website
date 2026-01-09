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
        name: 'Frontend',
        icon: HiCode,
        color: 'from-blue-500 to-cyan-500',
        skills: [
            { name: 'React', level: 95 },
            { name: 'TypeScript', level: 90 },
            { name: 'Next.js', level: 85 },
            { name: 'Tailwind CSS', level: 95 },
            { name: 'Framer Motion', level: 80 },
        ],
    },
    {
        name: 'Backend',
        icon: HiServer,
        color: 'from-green-500 to-emerald-500',
        skills: [
            { name: 'Node.js', level: 90 },
            { name: 'Python', level: 85 },
            { name: 'Django', level: 85 },
            { name: 'Express', level: 88 },
            { name: 'GraphQL', level: 75 },
        ],
    },
    {
        name: 'Database',
        icon: HiDatabase,
        color: 'from-purple-500 to-pink-500',
        skills: [
            { name: 'PostgreSQL', level: 88 },
            { name: 'MongoDB', level: 85 },
            { name: 'Redis', level: 75 },
            { name: 'Supabase', level: 80 },
            { name: 'Prisma', level: 82 },
        ],
    },
    {
        name: 'DevOps',
        icon: HiCloud,
        color: 'from-orange-500 to-red-500',
        skills: [
            { name: 'Docker', level: 85 },
            { name: 'AWS', level: 75 },
            { name: 'CI/CD', level: 80 },
            { name: 'Linux', level: 82 },
            { name: 'Nginx', level: 78 },
        ],
    },
    {
        name: 'Mobile',
        icon: HiDeviceMobile,
        color: 'from-teal-500 to-cyan-500',
        skills: [
            { name: 'React Native', level: 80 },
            { name: 'Flutter', level: 65 },
            { name: 'Expo', level: 78 },
        ],
    },
    {
        name: 'Tools',
        icon: HiCog,
        color: 'from-yellow-500 to-orange-500',
        skills: [
            { name: 'Git', level: 95 },
            { name: 'VS Code', level: 95 },
            { name: 'Figma', level: 70 },
            { name: 'Postman', level: 88 },
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
