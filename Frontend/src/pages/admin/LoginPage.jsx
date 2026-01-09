/**
 * Admin Login Page
 */

import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { HiMail, HiLockClosed, HiArrowLeft } from 'react-icons/hi';
import { useAuth } from '../../context';
import { Button, Input } from '../../components/ui';
import { useForm, validators } from '../../hooks';

const LoginPage = () => {
    const [error, setError] = useState('');
    const { login, isLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/admin';

    const {
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
    } = useForm(
        {
            email: '',
            password: '',
        },
        {
            email: [
                validators.required('Email is required'),
                validators.email('Please enter a valid email'),
            ],
            password: [
                validators.required('Password is required'),
                validators.minLength(6, 'Password must be at least 6 characters'),
            ],
        }
    );

    const onSubmit = async (formData) => {
        setError('');
        const result = await login(formData.email, formData.password);

        if (result.success) {
            navigate(from, { replace: true });
        } else {
            setError(result.error);
        }
    };

    return (
        <>
            <Helmet>
                <title>Admin Login | Portfolio</title>
            </Helmet>

            <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-dark-300">
                {/* Background */}
                <div className="absolute inset-0 -z-10">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-500/10 rounded-full blur-3xl" />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md"
                >
                    {/* Back link */}
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-8 transition-colors"
                    >
                        <HiArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>

                    {/* Login Card */}
                    <div className="card p-8">
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold font-display gradient-text mb-2">
                                Admin Login
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Sign in to manage your portfolio
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <Input
                                label="Email"
                                name="email"
                                type="email"
                                placeholder="admin@example.com"
                                value={values.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={errors.email}
                                touched={touched.email}
                                icon={HiMail}
                                required
                            />

                            <Input
                                label="Password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                value={values.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={errors.password}
                                touched={touched.password}
                                icon={HiLockClosed}
                                required
                            />

                            <Button
                                type="submit"
                                isLoading={isLoading}
                                className="w-full"
                            >
                                Sign In
                            </Button>
                        </form>
                    </div>
                </motion.div>
            </div>
        </>
    );
};

export default LoginPage;
