/**
 * Blog Section
 * Recent blog posts preview
 */

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HiClock, HiArrowRight, HiBookOpen } from 'react-icons/hi';
import { SectionWrapper, Button, Badge } from '../../../components';

const blogPosts = [
    {
        id: 1,
        title: 'Building Scalable React Applications with Modern Patterns',
        excerpt: 'Learn how to structure your React apps for scalability using modern patterns like compound components, render props, and hooks.',
        image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&h=400&fit=crop',
        category: 'React',
        slug: 'scalable-react-applications',
        readTime: '8 min read',
        date: '2024-01-15',
    },
    {
        id: 2,
        title: 'Authentication Best Practices with JWT and Refresh Tokens',
        excerpt: 'A comprehensive guide to implementing secure authentication in your web applications using JWT and refresh token rotation.',
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop',
        category: 'Security',
        slug: 'jwt-authentication-best-practices',
        readTime: '12 min read',
        date: '2024-01-10',
    },
    {
        id: 3,
        title: 'Optimizing Django REST Framework for Production',
        excerpt: 'Tips and techniques for making your Django REST API faster and more reliable in production environments.',
        image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop',
        category: 'Backend',
        slug: 'optimizing-django-rest-framework',
        readTime: '10 min read',
        date: '2024-01-05',
    },
];

const categoryColors = {
    React: 'badge-primary',
    Security: 'badge-warning',
    Backend: 'badge-success',
    Frontend: 'badge-secondary',
    DevOps: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
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
                <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <span className="flex items-center gap-1">
                    <HiClock className="w-4 h-4" />
                    {post.readTime}
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
            <Link
                to={`/blog/${post.slug}`}
                className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-medium text-sm group/link"
            >
                Read More
                <HiArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
            </Link>
        </div>
    </motion.article>
);

const Blog = () => {
    return (
        <SectionWrapper
            id="blog"
            title="Latest Articles"
            subtitle="Thoughts, tutorials, and insights"
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
                    to="/blog"
                    variant="outline"
                    icon={HiBookOpen}
                >
                    View All Articles
                </Button>
            </div>
        </SectionWrapper>
    );
};

export default Blog;
