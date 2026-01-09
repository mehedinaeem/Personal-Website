/**
 * Protected Route Component
 * Redirects unauthenticated users to login
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context';
import { PageLoader } from '../ui';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return <PageLoader />;
    }

    if (!isAuthenticated) {
        // Redirect to login, but save the intended destination
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;
