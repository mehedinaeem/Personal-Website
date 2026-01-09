/**
 * Error Boundary Component
 * Catches React errors and displays fallback UI
 */

import { Component } from 'react';
import { HiExclamationCircle, HiRefresh } from 'react-icons/hi';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center p-4">
                    <div className="text-center max-w-md">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                            <HiExclamationCircle className="w-10 h-10 text-red-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                            Oops! Something went wrong
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            We're sorry, but something unexpected happened. Please try refreshing the page.
                        </p>
                        <button
                            onClick={this.handleRetry}
                            className="btn-primary"
                        >
                            <HiRefresh className="w-5 h-5" />
                            Refresh Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
