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

const HomePage = () => {
    return (
        <>
            <Helmet>
                <title>Md Mehedi Hasan Naeem | AI, IoT and Intelligent Systems Portfolio</title>
                <meta
                    name="description"
                    content="Portfolio of Md Mehedi Hasan Naeem, a CSE student and researcher building AI, IoT, smart agriculture, edge AI, and intelligent systems projects."
                />
                <meta name="keywords" content="Md Mehedi Hasan Naeem, AI, IoT, smart agriculture, edge AI, intelligent systems, CSE student, researcher" />
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
