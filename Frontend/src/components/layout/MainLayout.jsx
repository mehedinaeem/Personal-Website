/**
 * Main Layout Component
 * Wrapper for public pages with navbar and footer
 */

import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const MainLayout = () => {
    return (
        <div className="min-h-screen flex flex-col overflow-x-hidden">
            <a href="#main-content" className="skip-link">Skip to main content</a>
            <Navbar />
            <main id="main-content" className="flex-grow overflow-x-hidden">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default MainLayout;
