import { Link } from '@inertiajs/react';
import { Mail, Menu, Phone, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const nav = [
    ['About', '/about'],
    ['Services', '/services'],
    ['Projects', '/projects'],
    ['Staff', '/staff'],
    ['News', '/news'],
    ['Contact', '/contact'],
];

export default function Layout({ children, settings = {}, locale = 'en' }) {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const mainRef = useRef(null);

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
                    <span className="ml-auto flex items-center gap-1">
                        <a
                            className={`px-2 py-0.5 rounded-full text-blue-200 transition-colors duration-150 hover:text-white ${locale === 'en' ? 'bg-gold-400 !text-navy-900 font-bold' : ''}`}
                            href={langHref('en')}
                        >EN</a>
                        <a
                            className={`px-2 py-0.5 rounded-full text-blue-200 transition-colors duration-150 hover:text-white ${locale === 'sw' ? 'bg-gold-400 !text-navy-900 font-bold' : ''}`}
                            href={langHref('sw')}
                        >SW</a>
                    </span>
                </div>
            </div>

            {/* Header */}
            <header className={`sticky top-0 z-20 bg-white/95 border-b border-border-light backdrop-blur-md transition-shadow duration-[250ms] ${scrolled ? 'shadow-[0_2px_20px_rgba(14,49,90,0.12)] border-transparent' : ''}`}>
                <div className="max-w-[1180px] mx-auto px-4 min-h-[78px] flex items-center justify-between gap-5">
                    <Link href="/" className="inline-flex items-center gap-3 min-w-0">
                        <img className="w-[54px] h-[54px] object-contain shrink-0" src="/logo.png" alt="DIT ICB logo" />
                        <span>
                            <strong className="block text-[clamp(0.98rem,2vw,1.12rem)] leading-[1.15]">Institute Consultancy Bureau</strong>
                            <small className="block text-[0.82rem] text-slate-500 mt-0.5 max-md:hidden">Dar es Salaam Institute of Technology</small>
                        </span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-[18px] text-[#233244] font-semibold text-[0.94rem]">
                        {nav.map(([label, href]) => (
                            <Link key={href} href={href} className="desktop-nav-link relative whitespace-nowrap transition-colors duration-[180ms] hover:text-navy-600">{label}</Link>
                        ))}
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
                    {nav.map(([label, href]) => (
                        <Link key={href} href={href} onClick={() => setOpen(false)} className="px-3 py-3 rounded-md font-semibold hover:bg-blue-50 transition-colors">{label}</Link>
                    ))}
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
                        <Link href="/contact" className="block text-blue-200 my-2 transition-colors duration-150 hover:text-gold-400">Contact</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
