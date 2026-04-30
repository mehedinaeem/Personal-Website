/**
 * Admin Profile Page
 * Manage personal profile information
 */

import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import {
    HiUser,
    HiMail,
    HiPhone,
    HiLocationMarker,
    HiPhotograph,
    HiDocumentText,
    HiSave,
} from 'react-icons/hi';
import { FaGithub, FaLinkedin, FaTwitter, FaGlobe } from 'react-icons/fa';
import { Button, Input, Textarea, LoadingOverlay } from '../../components/ui';
import { useApi, useForm } from '../../hooks';
import { profileApi } from '../../api';

const ProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const imageInputRef = useRef(null);
    const resumeInputRef = useRef(null);

    const { isLoading, execute: fetchProfile } = useApi(profileApi.get);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        const result = await fetchProfile();
        if (result.success) {
            setProfile(result.data);
            // Populate form with profile data
            Object.keys(result.data).forEach((key) => {
                if (values.hasOwnProperty(key)) {
                    setValue(key, result.data[key] || '');
                }
            });
        }
    };

    const {
        values,
        handleChange,
        handleBlur,
        handleSubmit,
        setValue,
    } = useForm({
        name: '',
        title: '',
        bio: '',
        email: '',
        phone: '',
        location: '',
        github_url: '',
        linkedin_url: '',
        twitter_url: '',
        website_url: '',
    });

    const onSubmit = async (formData) => {
        setIsSaving(true);
        try {
            const updated = await profileApi.update(formData);
            setProfile(updated);
            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error(error.displayMessage || 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        try {
            const updated = await profileApi.uploadImage(file);
            setProfile(updated);
            toast.success('Profile image updated');
        } catch (error) {
            toast.error(error.displayMessage || 'Failed to upload image');
        }
    };

    const handleResumeUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.includes('pdf')) {
            toast.error('Please select a PDF file');
            return;
        }

        try {
            const updated = await profileApi.uploadResume(file);
            setProfile(updated);
            toast.success('Resume updated');
        } catch (error) {
            toast.error(error.displayMessage || 'Failed to upload resume');
        }
    };

    if (isLoading) {
        return <LoadingOverlay />;
    }

    return (
        <>
            <Helmet>
                <title>Profile | Admin</title>
            </Helmet>

            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Profile
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Manage your personal information displayed on the website
                    </p>
                </div>

                {/* Profile Image & Resume Section */}
                <div className="card p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                        Media
                    </h2>
                    <div className="flex flex-wrap gap-8">
                        {/* Profile Image */}
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 dark:bg-dark-100">
                                    {profile?.image ? (
                                        <img
                                            src={profile.image}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <HiUser className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => imageInputRef.current?.click()}
                                    className="absolute -bottom-2 -right-2 p-2 bg-primary-500 text-white rounded-full shadow-lg hover:bg-primary-600 transition-colors"
                                >
                                    <HiPhotograph className="w-4 h-4" />
                                </button>
                                <input
                                    ref={imageInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">Profile Photo</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    JPG, PNG or GIF. Max 2MB.
                                </p>
                            </div>
                        </div>

                        {/* Resume */}
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-xl bg-gray-100 dark:bg-dark-100 flex items-center justify-center">
                                    <HiDocumentText className={`w-12 h-12 ${profile?.resume ? 'text-primary-500' : 'text-gray-300 dark:text-gray-600'}`} />
                                </div>
                                <button
                                    onClick={() => resumeInputRef.current?.click()}
                                    className="absolute -bottom-2 -right-2 p-2 bg-primary-500 text-white rounded-full shadow-lg hover:bg-primary-600 transition-colors"
                                >
                                    <HiDocumentText className="w-4 h-4" />
                                </button>
                                <input
                                    ref={resumeInputRef}
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleResumeUpload}
                                    className="hidden"
                                />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">Resume</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {profile?.resume ? (
                                        <a
                                            href={profile.resume}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary-500 hover:text-primary-600"
                                        >
                                            View current resume
                                        </a>
                                    ) : (
                                        'PDF format only'
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Basic Info */}
                    <div className="card p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                            Basic Information
                        </h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <Input
                                label="Full Name"
                                name="name"
                                value={values.name}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                icon={HiUser}
                            />
                            <Input
                                label="Title / Tagline"
                                name="title"
                                placeholder="e.g., Full Stack Developer"
                                value={values.title}
                                onChange={handleChange}
                                onBlur={handleBlur}
                            />
                        </div>
                        <div className="mt-4">
                            <Textarea
                                label="Bio"
                                name="bio"
                                placeholder="Tell visitors about yourself..."
                                value={values.bio}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                rows={5}
                            />
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="card p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                            Contact Information
                        </h2>
                        <div className="grid sm:grid-cols-3 gap-4">
                            <Input
                                label="Email"
                                name="email"
                                type="email"
                                value={values.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                icon={HiMail}
                            />
                            <Input
                                label="Phone"
                                name="phone"
                                value={values.phone}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                icon={HiPhone}
                            />
                            <Input
                                label="Location"
                                name="location"
                                placeholder="e.g., Dhaka, Bangladesh"
                                value={values.location}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                icon={HiLocationMarker}
                            />
                        </div>
                    </div>

                    {/* Social Links */}
                    <div className="card p-6">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                            Social Links
                        </h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <Input
                                label="GitHub"
                                name="github_url"
                                type="url"
                                placeholder="https://github.com/username"
                                value={values.github_url}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                icon={FaGithub}
                            />
                            <Input
                                label="LinkedIn"
                                name="linkedin_url"
                                type="url"
                                placeholder="https://linkedin.com/in/username"
                                value={values.linkedin_url}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                icon={FaLinkedin}
                            />
                            <Input
                                label="Twitter"
                                name="twitter_url"
                                type="url"
                                placeholder="https://twitter.com/username"
                                value={values.twitter_url}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                icon={FaTwitter}
                            />
                            <Input
                                label="Website"
                                name="website_url"
                                type="url"
                                placeholder="https://yourwebsite.com"
                                value={values.website_url}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                icon={FaGlobe}
                            />
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end">
                        <Button type="submit" icon={HiSave} disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default ProfilePage;
