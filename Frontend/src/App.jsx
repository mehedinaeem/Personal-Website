/**
 * Main Application Component
 * Sets up routing and global providers
 */

import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, ThemeProvider } from './context';
import { ErrorBoundary, ProtectedRoute, MainLayout } from './components';

const HomePage = lazy(() => import('./pages/public/HomePage'));
const NotFoundPage = lazy(() => import('./pages/public/NotFoundPage'));
const PublicProjectsPage = lazy(() => import('./pages/public/ProjectsPage'));
const ProjectDetailsPage = lazy(() => import('./pages/public/ProjectDetailsPage'));
const ResearchPage = lazy(() => import('./pages/public/ResearchPage'));
const PublicationDetailsPage = lazy(() => import('./pages/public/PublicationDetailsPage'));
const PrivacyPage = lazy(() => import('./pages/public/PrivacyPage'));
const LoginPage = lazy(() => import('./pages/admin/LoginPage'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'));
const ProjectsPage = lazy(() => import('./pages/admin/ProjectsPage'));
const ApplicationsPage = lazy(() => import('./pages/admin/ApplicationsPage'));
const SkillsPage = lazy(() => import('./pages/admin/SkillsPage'));
const BlogPage = lazy(() => import('./pages/admin/BlogPage'));
const AchievementsPage = lazy(() => import('./pages/admin/AchievementsPage'));
const MessagesPage = lazy(() => import('./pages/admin/MessagesPage'));
const ProfilePage = lazy(() => import('./pages/admin/ProfilePage'));
const TasksPage = lazy(() => import('./pages/admin/TasksPage'));
const TaskFormPage = lazy(() => import('./pages/admin/TaskFormPage'));
const TaskDetailsPage = lazy(() => import('./pages/admin/TaskDetailsPage'));
const DailyReviewPage = lazy(() => import('./pages/admin/DailyReviewPage'));
const GoalsPage = lazy(() => import('./pages/admin/PlanningPages').then((module) => ({ default: module.GoalsPage })));
const GoalEditorPage = lazy(() => import('./pages/admin/PlanningPages').then((module) => ({ default: module.GoalEditorPage })));
const ProgressPage = lazy(() => import('./pages/admin/PlanningPages').then((module) => ({ default: module.ProgressPage })));
const ActivitiesPage = lazy(() => import('./pages/admin/PlanningPages').then((module) => ({ default: module.ActivitiesPage })));
const LearningPage = lazy(() => import('./pages/admin/PlanningPages').then((module) => ({ default: module.LearningPage })));
const TravelPage = lazy(() => import('./pages/admin/PlanningPages').then((module) => ({ default: module.TravelPage })));
const OpportunitiesPage = lazy(() => import('./pages/admin/OpportunityPages').then((module) => ({ default: module.OpportunitiesPage })));
const OpportunityFormPage = lazy(() => import('./pages/admin/OpportunityPages').then((module) => ({ default: module.OpportunityFormPage })));
const OpportunityDetailsPage = lazy(() => import('./pages/admin/OpportunityPages').then((module) => ({ default: module.OpportunityDetailsPage })));
const ApplicationDetailsPage = lazy(() => import('./pages/admin/OpportunityPages').then((module) => ({ default: module.ApplicationDetailsPage })));
const CapturePage = lazy(() => import('./pages/admin/CapturePage'));

const App = () => {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <AuthProvider>
          <ErrorBoundary>
            <BrowserRouter>
              <Suspense fallback={<div className="min-h-screen grid place-items-center" role="status">Loading…</div>}>
              <Routes>
                {/* Public Routes */}
                <Route element={<MainLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/projects" element={<PublicProjectsPage />} />
                  <Route path="/projects/:slug" element={<ProjectDetailsPage />} />
                  <Route path="/research" element={<ResearchPage />} />
                  <Route path="/research/:slug" element={<PublicationDetailsPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
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
                  <Route path="applications/follow-up" element={<ApplicationsPage filter="follow-up" />} />
                  <Route path="applications/stage/:stage" element={<ApplicationsPage />} />
                  <Route path="applications/:id" element={<ApplicationDetailsPage />} />
                  <Route path="opportunities" element={<OpportunitiesPage />} />
                  <Route path="opportunities/new" element={<OpportunityFormPage />} />
                  <Route path="opportunities/upcoming" element={<OpportunitiesPage view="upcoming" />} />
                  <Route path="opportunities/:id" element={<OpportunityDetailsPage />} />
                  <Route path="opportunities/:id/edit" element={<OpportunityFormPage />} />
                  <Route path="capture" element={<CapturePage />} />
                  <Route path="capture/:id" element={<CapturePage />} />
                  <Route path="projects" element={<ProjectsPage />} />
                  <Route path="skills" element={<SkillsPage />} />
                  <Route path="blog" element={<BlogPage />} />
                  <Route path="achievements" element={<AchievementsPage />} />
                  <Route path="messages" element={<MessagesPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="today" element={<TasksPage view="today" />} />
                  <Route path="tasks" element={<TasksPage />} />
                  <Route path="tasks/new" element={<TaskFormPage />} />
                  <Route path="tasks/:id" element={<TaskDetailsPage />} />
                  <Route path="tasks/:id/edit" element={<TaskFormPage />} />
                  <Route path="tasks/:id/logs" element={<TaskDetailsPage logsOnly />} />
                  <Route path="daily-review" element={<DailyReviewPage />} />
                  <Route path="goals" element={<GoalsPage />} />
                  <Route path="goals/new" element={<GoalEditorPage />} />
                  <Route path="goals/:id" element={<GoalEditorPage />} />
                  <Route path="progress" element={<ProgressPage />} />
                  <Route path="progress/daily" element={<ProgressPage period="daily" />} />
                  <Route path="progress/monthly" element={<ProgressPage period="monthly" />} />
                  <Route path="progress/yearly" element={<ProgressPage period="yearly" />} />
                  <Route path="activities" element={<ActivitiesPage />} />
                  <Route path="activities/new" element={<ActivitiesPage createOnly />} />
                  <Route path="learning" element={<LearningPage />} />
                  <Route path="learning/:id" element={<LearningPage />} />
                  <Route path="travel" element={<TravelPage />} />
                  <Route path="travel/new" element={<TravelPage createOnly />} />
                  <Route path="travel/:id" element={<TravelPage />} />
                </Route>

                {/* 404 */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
              </Suspense>
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
