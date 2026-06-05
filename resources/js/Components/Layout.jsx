import { Link, usePage } from '@inertiajs/react';
import { Mail, Menu, Phone, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const nav = [
    ['About', '/about'],
    ['Services', '/services'],
    ['Projects', '/projects'],
    ['Staff', '/staff'],
    ['News', '/news'],
    ['Events', '/events'],
    ['Contact', '/contact'],
];

export default function Layout({ children, settings = {}, locale = 'en' }) {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const mainRef = useRef(null);
    const { url } = usePage();
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
                        {nav.map(([label, href]) => {
                            const active = isActive(href);

                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={`desktop-nav-link relative whitespace-nowrap transition-colors duration-[180ms] hover:text-navy-600 ${active ? 'text-navy-600 after:!w-full' : ''}`}
                                    aria-current={active ? 'page' : undefined}
                                >
                                    {label}
                                </Link>
                            );
                        })}
                        <a
                            className="px-[14px] py-2.5 bg-gold-400 text-navy-900 rounded-md font-extrabold transition-[background,transform] duration-[180ms] hover:bg-gold-500 hover:-translate-y-px"
                            href="/admin" target="_blank" rel="noreferrer"
                        >Admin</a>
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
                    {nav.map(([label, href]) => {
                        const active = isActive(href);

                        return (
                            <Link
                                key={href}
                                href={href}
                                onClick={() => setOpen(false)}
                                className={`px-3 py-3 rounded-md font-semibold transition-colors ${active ? 'bg-brand-sky text-navy-700' : 'hover:bg-blue-50'}`}
                                aria-current={active ? 'page' : undefined}
                            >
                                {label}
                            </Link>
                        );
                    })}
                    <a href="/admin" target="_blank" rel="noreferrer" className="px-3 py-3 rounded-md font-semibold hover:bg-blue-50 transition-colors">Admin</a>
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
                        <p className="text-[#b8cbe0] leading-[1.65]">Professional consulting and training bureau delivering engineering, ICT, environmental, and project advisory services.</p>
                        {/* Social links — only rendered when set in CMS Settings */}
                        {(settings.facebook || settings.twitter || settings.linkedin || settings.youtube) && (
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
                                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M4 4l16 16M4 20L20 4"/><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                                    </a>
                                )}
                                {settings.linkedin && (
                                    <a href={settings.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"
                                        className="w-8 h-8 rounded-md bg-white/10 hover:bg-gold-400 hover:text-navy-900 flex items-center justify-center text-blue-200 transition-colors">
                                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                                    </a>
                                )}
                                {settings.youtube && (
                                    <a href={settings.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube"
                                        className="w-8 h-8 rounded-md bg-white/10 hover:bg-gold-400 hover:text-navy-900 flex items-center justify-center text-blue-200 transition-colors">
                                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.97C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon fill="#fff" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className="text-white font-bold mb-3">Contact</h3>
                        <p className="text-[#b8cbe0] leading-[1.65]">{settings.address}</p>
                        <p className="text-[#b8cbe0] leading-[1.65]">{settings.phone}</p>
                        <p className="text-[#b8cbe0] leading-[1.65]">{settings.email}</p>
                    </div>
                    <div>
                        <h3 className="text-white font-bold mb-3">Quick links</h3>
                        <Link href="/services" className="block text-blue-200 my-2 transition-colors duration-150 hover:text-gold-400">Services</Link>
                        <Link href="/projects" className="block text-blue-200 my-2 transition-colors duration-150 hover:text-gold-400">Projects</Link>
                        <Link href="/events" className="block text-blue-200 my-2 transition-colors duration-150 hover:text-gold-400">Events</Link>
                        <Link href="/contact" className="block text-blue-200 my-2 transition-colors duration-150 hover:text-gold-400">Contact</Link>
                    </div>
                </div>
                <div className="max-w-[1180px] mx-auto px-4 mt-8 pt-6 border-t border-white/10 text-[0.8rem] text-[#6b8aad]">
                    © {new Date().getFullYear()} DIT Institute Consultancy Bureau. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
