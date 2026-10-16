import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { HiMenu, HiX, HiMoon, HiSun, HiSparkles } from 'react-icons/hi';
import { useTheme } from '../context';
import './navbar.css';

const links = [
  ['home', 'Home'], ['about', 'About'],
  ['research', 'Research'], ['projects', 'Projects'], ['experience', 'Experience'],
  ['awards', 'Achievements'], ['skills', 'Skills'], ['contact', 'Contact'],
];

export default function PortfolioNavbar() {
  const { isDark, toggleTheme } = useTheme();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);
  const header = useRef(null);
  const menuButton = useRef(null);

  useEffect(() => {
    setOpen(false);
    if (pathname !== '/') {
      setActive(pathname.startsWith('/research') ? 'research' : pathname.startsWith('/projects') ? 'projects' : null);
      return;
    }
    let frame;
    const update = () => {
      const threshold = header.current.getBoundingClientRect().height + 100;
      const sections = links.map(([id]) => document.getElementById(id)).filter(Boolean)
        .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) {
        setActive(sections.at(-1)?.id || null);
        return;
      }
      const passed = sections.filter(section => section.getBoundingClientRect().top <= threshold);
      setActive((passed.at(-1) || sections[0])?.id || null);
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    const observer = new ResizeObserver(schedule);
    const main = document.getElementById('main-content');
    if (main) observer.observe(main);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const escape = event => {
      if (event.key === 'Escape') { setOpen(false); menuButton.current?.focus(); }
    };
    const outside = event => { if (!header.current.contains(event.target)) setOpen(false); };
    const desktop = window.matchMedia('(min-width: 1220px)');
    const closeOnDesktop = event => { if (event.matches) setOpen(false); };
    document.addEventListener('keydown', escape);
    document.addEventListener('pointerdown', outside);
    desktop.addEventListener('change', closeOnDesktop);
    return () => {
      document.removeEventListener('keydown', escape);
      document.removeEventListener('pointerdown', outside);
      desktop.removeEventListener('change', closeOnDesktop);
    };
  }, [open]);

  function navigate(event, id) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    setOpen(false);
    if (pathname === '/') requestAnimationFrame(() => {
      const target = document.getElementById(id);
      if (target) { target.tabIndex = -1; target.focus({ preventScroll: true }); }
    });
  }
  const href = id => pathname === '/' ? `#${id}` : `/#${id}`;
  const research = <a className="nw-research" href={href('research')} onClick={event => navigate(event, 'research')}>View Research <span aria-hidden="true">→</span></a>;

  return <header ref={header} className="nw-header">
    <div className="nw-container">
      <a className="nw-brand" href={href('home')} onClick={event => navigate(event, 'home')}>
        <span className="nw-brand-icon" aria-hidden="true"><HiSparkles /></span><span className="nw-brand-text">Naeem’s World</span>
      </a>
      <div className={`nw-navigation ${open ? 'is-open' : ''}`} id="portfolio-navigation">
        <nav className="nw-capsule" aria-label="Main navigation">
          {links.map(([id, label]) => <a key={id} href={href(id)} aria-current={active === id ? 'location' : undefined} onClick={event => navigate(event, id)}>{label}</a>)}
        </nav>
        <div className="nw-mobile-research">{research}</div>
      </div>
      <div className="nw-controls">
        <button type="button" className="nw-theme" onClick={toggleTheme} aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}>
          {isDark ? <HiSun aria-hidden="true" /> : <HiMoon aria-hidden="true" />}
        </button>
        <span className="nw-divider" aria-hidden="true" />
        <div className="nw-desktop-research">{research}</div>
        <button ref={menuButton} type="button" className="nw-menu" aria-expanded={open} aria-controls="portfolio-navigation" aria-label={open ? 'Close navigation menu' : 'Open navigation menu'} onClick={() => setOpen(value => !value)}>
          {open ? <HiX aria-hidden="true" /> : <HiMenu aria-hidden="true" />}
        </button>
      </div>
    </div>
  </header>;
}
