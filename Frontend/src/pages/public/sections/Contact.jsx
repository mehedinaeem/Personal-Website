/**
 * Contact Section
 * Contact form with validation and reCAPTCHA
 */

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import ReCAPTCHA from 'react-google-recaptcha';
import toast from 'react-hot-toast';
import {
    HiMail,
    HiPhone,
    HiLocationMarker,
    HiPaperAirplane
} from 'react-icons/hi';
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';
import { SectionWrapper, Button, Input, Textarea } from '../../../components';
import { useForm, validators } from '../../../hooks';
import { contactApi } from '../../../api';
import config from '../../../config';

const contactInfo = [
    {
        icon: HiMail,
        label: 'Email',
        value: 'hello@example.com',
        href: 'mailto:hello@example.com',
    },
    {
        icon: HiPhone,
        label: 'Phone',
        value: '+880 1XXX-XXXXXX',
        href: 'tel:+8801XXXXXXXXX',
    },
    {
        icon: HiLocationMarker,
        label: 'Location',
        value: 'Dhaka, Bangladesh',
        href: null,
    },
];

const socialLinks = [
    { icon: FaGithub, href: '#', label: 'GitHub' },
    { icon: FaLinkedin, href: '#', label: 'LinkedIn' },
    { icon: FaTwitter, href: '#', label: 'Twitter' },
];

const Contact = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const recaptchaRef = useRef(null);

    const {
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        reset,
    } = useForm(
        {
            name: '',
            email: '',
            subject: '',
            message: '',
        },
        {
            name: [validators.required('Please enter your name')],
            email: [
                validators.required('Please enter your email'),
                validators.email('Please enter a valid email'),
            ],
            subject: [validators.required('Please enter a subject')],
            message: [
                validators.required('Please enter your message'),
                validators.minLength(10, 'Message must be at least 10 characters'),
            ],
        }
    );

    const onSubmit = async (formData) => {
        setIsSubmitting(true);

        try {
            // Get reCAPTCHA token
            const captchaToken = recaptchaRef.current?.getValue();

            if (config.recaptcha.siteKey && !captchaToken) {
                toast.error('Please complete the reCAPTCHA');
                return;
            }

            await contactApi.sendMessage({
                ...formData,
                captcha_token: captchaToken,
            });

            toast.success('Message sent successfully! I\'ll get back to you soon.');
            reset();
            recaptchaRef.current?.reset();
        } catch (error) {
            toast.error(error.displayMessage || 'Failed to send message. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SectionWrapper
            id="contact"
            title="Get in Touch"
            subtitle="Have a project in mind? Let's talk!"
        >
            <div className="grid lg:grid-cols-2 gap-12">
                {/* Contact Info */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <h3 className="heading-4 mb-6">Contact Information</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                        Feel free to reach out to me for any inquiries, collaborations,
                        or just to say hello. I'm always open to discussing new projects
                        and opportunities.
                    </p>

                    {/* Contact details */}
                    <div className="space-y-4 mb-8">
                        {contactInfo.map((item) => (
                            <div
                                key={item.label}
                                className="flex items-center gap-4"
                            >
                                <div className="p-3 rounded-xl bg-primary-100 dark:bg-primary-900/30">
                                    <item.icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {item.label}
                                    </p>
                                    {item.href ? (
                                        <a
                                            href={item.href}
                                            className="font-medium text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                        >
                                            {item.value}
                                        </a>
                                    ) : (
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {item.value}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Social links */}
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            Follow me on social media
                        </p>
                        <div className="flex gap-3">
                            {socialLinks.map((social) => (
                                <motion.a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    whileHover={{ scale: 1.1, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="p-3 rounded-xl bg-white dark:bg-dark-100 shadow-md hover:shadow-lg transition-shadow"
                                    aria-label={social.label}
                                >
                                    <social.icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                </motion.a>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Contact Form */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="card p-6 md:p-8">
                        <h3 className="heading-4 mb-6">Send me a message</h3>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <Input
                                    label="Name"
                                    name="name"
                                    placeholder="Your name"
                                    value={values.name}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.name}
                                    touched={touched.name}
                                    required
                                />
                                <Input
                                    label="Email"
                                    name="email"
                                    type="email"
                                    placeholder="your@email.com"
                                    value={values.email}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    error={errors.email}
                                    touched={touched.email}
                                    required
                                />
                            </div>

                            <Input
                                label="Subject"
                                name="subject"
                                placeholder="What's this about?"
                                value={values.subject}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={errors.subject}
                                touched={touched.subject}
                                required
                            />

                            <Textarea
                                label="Message"
                                name="message"
                                placeholder="Your message..."
                                rows={5}
                                value={values.message}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={errors.message}
                                touched={touched.message}
                                required
                            />

                            {/* reCAPTCHA */}
                            {config.recaptcha.siteKey && (
                                <div className="flex justify-center">
                                    <ReCAPTCHA
                                        ref={recaptchaRef}
                                        sitekey={config.recaptcha.siteKey}
                                        theme="light"
                                    />
                                </div>
                            )}

                            <Button
                                type="submit"
                                isLoading={isSubmitting}
                                icon={HiPaperAirplane}
                                className="w-full"
                            >
                                Send Message
                            </Button>
                        </form>
                    </div>
                </motion.div>
            </div>
        </SectionWrapper>
    );
};

export default Contact;
