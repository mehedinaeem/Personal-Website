/**
 * Home Page
 * Main public landing page with all sections
 */

import { Helmet } from 'react-helmet-async';
import {
    Hero,
    About,
    Skills,
    Projects,
    Achievements,
    Blog,
    Contact,
} from './sections';
import config from '../../config';

const HomePage = () => {
    return (
        <>
            <Helmet>
                {/* <title>{config.app.name} | {config.app.author}</title> */}
                <meta
                    name="description"
                    content="Full-stack developer passionate about creating beautiful, functional, and user-friendly web applications."
                />
                <meta name="keywords" content="portfolio, web developer, full-stack, react, python, django" />
            </Helmet>

            <Hero />
            <About />
            <Skills />
            <Projects />
            <Achievements />
            <Blog />
            <Contact />
        </>
    );
};

export default HomePage;
