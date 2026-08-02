/**
 * Application configuration
 * All environment variables and app-wide settings
 */

const config = {
    // API Configuration
    api: {
        baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
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
        name: import.meta.env.VITE_APP_NAME || 'Md Mehedi Hasan Naeem Portfolio',
        author: import.meta.env.VITE_APP_AUTHOR || 'Md Mehedi Hasan Naeem',
    },

    // Feature Flags
    features: {
        enableBlog: true,
        enableContact: true,
        enableDarkMode: true,
    },

    // Social Links (can be overridden by backend)
    socials: {
        github: 'https://github.com/mehedinaeem',
        linkedin: 'https://www.linkedin.com/in/mehedinaeem/',
        twitter: 'https://x.com/mehedinaeem000',
        facebook: 'https://www.facebook.com/mehedinaeem00',
        email: 'mailto:mehedinaeem00@gmail.com',
    },
};

export default config;
