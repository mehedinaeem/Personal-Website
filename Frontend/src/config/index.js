/**
 * Application configuration
 * All environment variables and app-wide settings
 */

const config = {
    // API Configuration
    api: {
        baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
        timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
    },

    // reCAPTCHA Configuration
    recaptcha: {
        siteKey: import.meta.env.VITE_RECAPTCHA_SITE_KEY || '',
    },

    // Cloudinary Configuration
    cloudinary: {
        cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '',
    },

    // App Configuration
    app: {
        name: import.meta.env.VITE_APP_NAME || 'Portfolio',
        author: import.meta.env.VITE_APP_AUTHOR || 'Developer',
    },

    // Feature Flags
    features: {
        enableBlog: true,
        enableContact: true,
        enableDarkMode: true,
    },

    // Social Links (can be overridden by backend)
    socials: {
        github: '',
        linkedin: '',
        twitter: '',
        email: '',
    },
};

export default config;
