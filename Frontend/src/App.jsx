/**
 * Main Application Component
 * Sets up routing and global providers
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, ThemeProvider } from './context';
import { ErrorBoundary, ProtectedRoute, MainLayout } from './components';
import {
  HomePage,
  NotFoundPage,
  LoginPage,
  AdminLayout,
  DashboardPage,
  ProjectsPage,
  ApplicationsPage,
} from './pages';

const App = () => {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <AuthProvider>
          <ErrorBoundary>
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route element={<MainLayout />}>
                  <Route path="/" element={<HomePage />} />
                </Route>

                {/* Admin Routes */}
                <Route path="/admin/login" element={<LoginPage />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<DashboardPage />} />
                  <Route path="applications" element={<ApplicationsPage />} />
                  <Route path="projects" element={<ProjectsPage />} />
                  {/* Add more admin routes as needed */}
                  <Route path="skills" element={<DashboardPage />} />
                  <Route path="blog" element={<DashboardPage />} />
                  <Route path="achievements" element={<DashboardPage />} />
                  <Route path="messages" element={<DashboardPage />} />
                  <Route path="profile" element={<DashboardPage />} />
                </Route>

                {/* 404 */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </BrowserRouter>

            {/* Toast Notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#fff',
                  color: '#333',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                  borderRadius: '12px',
                  padding: '16px',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </ErrorBoundary>
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
};

export default App;
