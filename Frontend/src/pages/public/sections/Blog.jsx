/**
 * Blog Section
 * Recent blog posts preview
 */

import { motion } from 'framer-motion';
import { HiClock, HiArrowRight, HiDownload } from 'react-icons/hi';
import { SectionWrapper, Button, Badge } from '../../../components';

const blogPosts = [
    {
        id: 1,
        title: 'Founder and CEO, Amader Online School',
        excerpt: 'Creating educational content for students across various subjects.',
        image: '/assets/portfolio-preview.webp',
        category: 'Experience',
        organization: 'Amader Online School',
        period: 'Founder and CEO',
        url: 'https://www.youtube.com/@amader_online_school',
        linkLabel: 'Open YouTube',
    },
    {
        id: 2,
        title: 'Programming Trainer, Mid-Day Programming, JKKNIU',
        excerpt: 'Conducted programming sessions for juniors, focusing on problem-solving and programming fundamentals.',
        image: '/assets/projects/smart-campus-transport.webp',
        category: 'Experience',
        organization: 'Mid-Day Programming, JKKNIU',
        period: 'Programming Trainer',
    },
    {
        id: 3,
        title: 'Class Representative, JKKNIU',
        excerpt: 'Served as class representative for 1.5+ years, managing communication between students and the department.',
        image: '/assets/projects/food-waste-ml.webp',
        category: 'Experience',
        organization: 'JKKNIU',
        period: 'Class Representative',
    },
    {
        id: 4,
        title: 'Intel Student Ambassador, Intel Corporation',
        excerpt: 'Promoting Intel technologies including oneAPI and AI tools, and organizing technical workshops for the university community.',
        image: '/assets/certifications/intel-student-ambassador-proof.webp',
        category: 'Leadership',
        organization: 'Intel Corporation',
        period: 'Student Ambassador',
    },
    {
        id: 5,
        title: 'Vice President, JKKNIU Research Society',
        excerpt: 'Coordinating research and community initiatives.',
        image: '/assets/projects/lumo-edge-ai.webp',
        category: 'Leadership',
        organization: 'JKKNIU Research Society',
        period: 'Vice President',
    },
    {
        id: 6,
        title: 'Senior Vice President, JKKNIU MUN Club',
        excerpt: 'Managing events, training delegates, and supporting organizational activities.',
        image: '/assets/certifications/hyd-participant-certificate.webp',
        category: 'Leadership',
        organization: 'JKKNIU MUN Club',
        period: 'Senior Vice President',
    },
    {
        id: 7,
        title: 'President, Dewpara Brothers Sporting Club',
        excerpt: 'Leading club operations and coordinating sports/community activities.',
        image: '/assets/portfolio-preview.webp',
        category: 'Leadership',
        organization: 'Dewpara Brothers Sporting Club',
        period: 'President',
    },
    {
        id: 8,
        title: 'Event Organization & Volunteering',
        excerpt: 'Organized and coordinated workshops, seminars, campus programs, and community events.',
        image: '/assets/portfolio-preview.webp',
        category: 'Leadership',
        organization: 'Campus and community events',
        period: 'Organizer and Volunteer',
    },
];

const categoryColors = {
    Experience: 'badge-primary',
    Leadership: 'badge-success',
};

const BlogCard = ({ post, index }) => (
    <motion.article
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
        className="card overflow-hidden group"
    >
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
            <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute top-4 left-4">
                <span className={`badge ${categoryColors[post.category] || 'badge-secondary'}`}>
                    {post.category}
                </span>
            </div>
        </div>

        {/* Content */}
        <div className="p-6">
            {/* Meta */}
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                <span>{post.period}</span>
                <span className="flex items-center gap-1">
                    <HiClock className="w-4 h-4" />
                    {post.organization}
                </span>
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {post.title}
            </h3>

            {/* Excerpt */}
            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">
                {post.excerpt}
            </p>

            {/* Read more */}
            {post.url && (
                <a
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-medium text-sm group/link"
                >
                    {post.linkLabel || 'Open Link'}
                    <HiArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
                </a>
            )}
        </div>
    </motion.article>
);

const Blog = () => {
    return (
        <SectionWrapper
            id="experience"
            title="Experience and Leadership"
            subtitle="Roles, training, and community initiatives"
            dark
        >
            {/* Blog Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {blogPosts.map((post, index) => (
                    <BlogCard key={post.id} post={post} index={index} />
                ))}
            </div>

            {/* View All CTA */}
            <div className="text-center">
                <Button
                    href="/assets/Md_Mehedi_Hasan_Naeem_CV.pdf"
                    variant="outline"
                    icon={HiDownload}
                    download
                >
                    Download CV
                </Button>
            </div>
        </SectionWrapper>
    );
};

export default Blog;
