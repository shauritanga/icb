import { Link, usePage } from '@inertiajs/react';
import { Mail, Menu, Phone, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useT } from '../hooks/useT';

const navKeys = [
    ['nav_about',    'About',    '/about'],
    ['nav_services', 'Services', '/services'],
    ['nav_projects', 'Projects', '/projects'],
    ['nav_staff',    'Staff',    '/staff'],
    ['nav_news',     'News',     '/news'],
    ['nav_events',   'Events',   '/events'],
    ['nav_contact',  'Contact',  '/contact'],
];

export default function Layout({ children, settings = {}, locale = 'en' }) {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const mainRef = useRef(null);
    const { url } = usePage();
    const t = useT();
    const currentPath = (url || '/').split('?')[0].replace(/\/$/, '') || '/';

    const isActive = (href) => {
        const path = href.replace(/\/$/, '') || '/';
        return currentPath === path || (path !== '/' && currentPath.startsWith(`${path}/`));
    };

    const langHref = (lang) => {
        const url = new URL(window.location.href);
        url.searchParams.set('lang', lang);
        return `${url.pathname}${url.search}`;
    };

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        const obs = new IntersectionObserver(
            (entries) => entries.forEach(e => {
                if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
            }),
            { threshold: 0.08 }
        );
        document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
        return () => obs.disconnect();
    }, [children]);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-950">
            {/* Top bar */}
            <div className="bg-navy-700 text-blue-100 text-[0.875rem]">
                <div className="max-w-[1180px] mx-auto px-4 min-h-10 flex items-center justify-between gap-4 flex-wrap">
                    <span className="inline-flex items-center gap-1.5"><Mail size={13} /> {settings.email}</span>
                    <span className="inline-flex items-center gap-1.5"><Phone size={13} /> {settings.phone}</span>
                    <span className="ml-auto flex items-center gap-1.5">
                        <a
                            href={langHref('en')}
                            title="English"
                            className={`transition-opacity duration-150 ${locale === 'en' ? 'opacity-100 ring-1 ring-gold-400 p-0.5' : 'opacity-40 hover:opacity-75'}`}
                        >
                            <img src="https://flagcdn.com/w40/gb.png" alt="English" className="w-5 h-3 object-cover block" />
                        </a>
                        <a
                            href={langHref('sw')}
                            title="Kiswahili"
                            className={`transition-opacity duration-150 ${locale === 'sw' ? 'opacity-100 ring-1 ring-gold-400 p-0.5' : 'opacity-40 hover:opacity-75'}`}
                        >
                            <img src="https://flagcdn.com/w40/tz.png" alt="Kiswahili" className="w-5 h-3 object-cover block" />
                        </a>
                    </span>
                </div>
            </div>

            {/* Header */}
            <header className={`sticky top-0 z-50 bg-white/95 border-b border-border-light backdrop-blur-md transition-shadow duration-[250ms] ${scrolled ? 'shadow-[0_2px_20px_rgba(14,49,90,0.12)] border-transparent' : ''}`}>
                <div className="max-w-[1180px] mx-auto px-4 min-h-[78px] flex items-center justify-between gap-5">
                    <Link href="/" className="inline-flex items-center gap-3 min-w-0">
                        <img className="w-[54px] h-[54px] object-contain shrink-0" src="/logo.png" alt="DIT ICB logo" />
                        <span>
                            <strong className="block text-[clamp(0.98rem,2vw,1.12rem)] leading-[1.15]">Institute Consultancy Bureau</strong>
                            <small className="block text-[0.82rem] text-slate-500 mt-0.5 max-md:hidden">Dar es Salaam Institute of Technology</small>
                        </span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-[18px] text-[#233244] font-semibold text-[0.94rem]">
                        {navKeys.map(([key, fallback, href]) => {
                            const active = isActive(href);

                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={`desktop-nav-link relative whitespace-nowrap transition-colors duration-[180ms] hover:text-navy-600 ${active ? 'text-navy-600 after:!w-full' : ''}`}
                                    aria-current={active ? 'page' : undefined}
                                >
                                    {t[key] ?? fallback}
                                </Link>
                            );
                        })}
                        <a
                            className="px-[14px] py-2.5 bg-gold-400 text-navy-900 rounded-md font-extrabold transition-[background,transform] duration-[180ms] hover:bg-gold-500 hover:-translate-y-px"
                            href="/admin" target="_blank" rel="noreferrer"
                        >{t.nav_admin ?? 'Admin'}</a>
                    </nav>

                    <button
                        className="md:hidden w-11 h-11 border border-slate-300 rounded-md bg-white grid place-items-center"
                        type="button"
                        onClick={() => setOpen(!open)}
                        aria-label="Toggle menu"
                    >
                        {open ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>

                {/* Mobile nav */}
                <nav className={`mobile-nav${open ? ' open' : ''}`}>
                    {navKeys.map(([key, fallback, href]) => {
                        const active = isActive(href);

                        return (
                            <Link
                                key={href}
                                href={href}
                                onClick={() => setOpen(false)}
                                className={`px-3 py-3 rounded-md font-semibold transition-colors ${active ? 'bg-brand-sky text-navy-700' : 'hover:bg-blue-50'}`}
                                aria-current={active ? 'page' : undefined}
                            >
                                {t[key] ?? fallback}
                            </Link>
                        );
                    })}
                    <a href="/admin" target="_blank" rel="noreferrer" className="px-3 py-3 rounded-md font-semibold hover:bg-blue-50 transition-colors">{t.nav_admin ?? 'Admin'}</a>
                </nav>
            </header>

            <main ref={mainRef}>{children}</main>

            {/* Footer */}
            <footer className="bg-navy-950 bg-diagonal-pattern text-blue-100 py-10">
                <div className="max-w-[1180px] mx-auto px-4 grid grid-cols-1 md:grid-cols-[1.3fr_1fr_0.8fr] gap-7">
                    <div>
                        <div className="flex items-center gap-2.5 text-white text-[1.3rem] font-black mb-3">
                            <img src="/logo.png" alt="DIT ICB logo" className="w-9 h-9 object-contain bg-white rounded-md p-0.5" />
                            DIT ICB
                        </div>
                        <p className="text-[#b8cbe0] leading-[1.65]">{t.footer_description ?? 'Professional consulting and training bureau delivering engineering, ICT, environmental, and project advisory services.'}</p>
                        {/* Social links — only rendered when set in CMS Settings */}
                        {(settings.facebook || settings.twitter || settings.linkedin || settings.instagram || settings.youtube) && (
                            <div className="flex items-center gap-3 mt-4">
                                {settings.facebook && (
                                    <a href={settings.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                                        className="w-8 h-8 rounded-md bg-white/10 hover:bg-gold-400 hover:text-navy-900 flex items-center justify-center text-blue-200 transition-colors">
                                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                                    </a>
                                )}
                                {settings.twitter && (
                                    <a href={settings.twitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter / X"
                                        className="w-8 h-8 rounded-md bg-white/10 hover:bg-gold-400 hover:text-navy-900 flex items-center justify-center text-blue-200 transition-colors">
                                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                                    </a>
                                )}
                                {settings.linkedin && (
                                    <a href={settings.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"
                                        className="w-8 h-8 rounded-md bg-white/10 hover:bg-gold-400 hover:text-navy-900 flex items-center justify-center text-blue-200 transition-colors">
                                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                                    </a>
                                )}
                                {settings.instagram && (
                                    <a href={settings.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                                        className="w-8 h-8 rounded-md bg-white/10 hover:bg-gold-400 hover:text-navy-900 flex items-center justify-center text-blue-200 transition-colors">
                                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
                                    </a>
                                )}
                                {settings.youtube && (
                                    <a href={settings.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube"
                                        className="w-8 h-8 rounded-md bg-white/10 hover:bg-gold-400 hover:text-navy-900 flex items-center justify-center text-blue-200 transition-colors">
                                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507 0-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg>
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className="text-white font-bold mb-3">{t.footer_contact ?? 'Contact'}</h3>
                        <p className="text-[#b8cbe0] leading-[1.65]">{settings.address}</p>
                        <p className="text-[#b8cbe0] leading-[1.65]">{settings.phone}</p>
                        <p className="text-[#b8cbe0] leading-[1.65]">{settings.email}</p>
                    </div>
                    <div>
                        <h3 className="text-white font-bold mb-3">{t.footer_quick_links ?? 'Quick links'}</h3>
                        <Link href="/services" className="block text-blue-200 my-2 transition-colors duration-150 hover:text-gold-400">{t.nav_services ?? 'Services'}</Link>
                        <Link href="/projects" className="block text-blue-200 my-2 transition-colors duration-150 hover:text-gold-400">{t.nav_projects ?? 'Projects'}</Link>
                        <Link href="/events" className="block text-blue-200 my-2 transition-colors duration-150 hover:text-gold-400">{t.nav_events ?? 'Events'}</Link>
                        <Link href="/contact" className="block text-blue-200 my-2 transition-colors duration-150 hover:text-gold-400">{t.nav_contact ?? 'Contact'}</Link>
                    </div>
                </div>
                <div className="max-w-[1180px] mx-auto px-4 mt-8 pt-6 border-t border-white/10 text-[0.8rem] text-[#6b8aad]">
                    © {new Date().getFullYear()} {t.footer_copyright ?? 'DIT Institute Consultancy Bureau. All rights reserved.'}
                </div>
            </footer>
        </div>
    );
}
