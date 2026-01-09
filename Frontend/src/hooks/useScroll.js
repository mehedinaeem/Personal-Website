/**
 * Custom hook for scroll-based animations and detection
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export const useScrollPosition = () => {
    const [scrollPosition, setScrollPosition] = useState(0);
    const [scrollDirection, setScrollDirection] = useState('up');
    const lastScrollRef = useRef(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScroll = window.scrollY;
            setScrollDirection(currentScroll > lastScrollRef.current ? 'down' : 'up');
            lastScrollRef.current = currentScroll;
            setScrollPosition(currentScroll);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return { scrollPosition, scrollDirection };
};

export const useInView = (options = {}) => {
    const {
        threshold = 0.1,
        rootMargin = '0px',
        triggerOnce = true,
    } = options;

    const [isInView, setIsInView] = useState(false);
    const [hasAnimated, setHasAnimated] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    setHasAnimated(true);
                    if (triggerOnce) {
                        observer.unobserve(element);
                    }
                } else if (!triggerOnce) {
                    setIsInView(false);
                }
            },
            { threshold, rootMargin }
        );

        observer.observe(element);
        return () => observer.disconnect();
    }, [threshold, rootMargin, triggerOnce]);

    return { ref, isInView, hasAnimated };
};

export const useActiveSection = (sectionIds) => {
    const [activeSection, setActiveSection] = useState(sectionIds[0]);

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY + 100;

            for (const id of sectionIds) {
                const element = document.getElementById(id);
                if (element) {
                    const { offsetTop, offsetHeight } = element;
                    if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                        setActiveSection(id);
                        break;
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Check initial position

        return () => window.removeEventListener('scroll', handleScroll);
    }, [sectionIds]);

    return activeSection;
};

export const useScrollTo = () => {
    const scrollTo = useCallback((elementId, offset = 80) => {
        const element = document.getElementById(elementId);
        if (element) {
            const top = element.offsetTop - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    }, []);

    return scrollTo;
};

export default useScrollPosition;
