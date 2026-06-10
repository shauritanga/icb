import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { useT } from '../hooks/useT';

export function PageHero({ eyebrow, title, children }) {
    return (
        <section className="bg-navy-700 bg-engineering-structure text-white py-[clamp(52px,8vw,86px)]">
            <div className="max-w-[1180px] mx-auto px-4">
                {eyebrow && <span className="inline-block text-gold-400 font-extrabold uppercase text-[0.78rem] tracking-[0.08em]">{eyebrow}</span>}
                <h1 className="max-w-[840px] mt-3 mb-4 text-[clamp(2rem,4vw,3.8rem)] leading-[1.05] font-extrabold">{title}</h1>
                {children && <p className="max-w-[680px] text-blue-100 text-[clamp(1rem,1.6vw,1.15rem)] leading-[1.75]">{children}</p>}
            </div>
        </section>
    );
}

export function SectionHead({ eyebrow, title, href, action }) {
    const t = useT();
    const label = action ?? (t.view_all ?? 'View all');
    return (
        <div className="max-w-[1180px] mx-auto px-4 flex items-end justify-between gap-5 mb-6">
            <div>
                {eyebrow && <span className="inline-block text-[#bb7d00] font-extrabold uppercase text-[0.78rem] tracking-[0.08em]">{eyebrow}</span>}
                <h2 className="mt-1.5 text-navy-800 text-[clamp(1.75rem,3vw,2.7rem)] leading-[1.08] font-extrabold">{title}</h2>
            </div>
            {href && (
                <Link href={href} className="inline-flex items-center gap-1.5 text-navy-600 font-extrabold whitespace-nowrap transition-[gap,color] duration-[180ms] hover:gap-2.5 hover:text-navy-700">
                    {label} <ArrowRight size={16} />
                </Link>
            )}
        </div>
    );
}

export function ImageBlock({ src, label }) {
    if (src) {
        return <img className="w-full aspect-video object-cover transition-transform duration-[400ms]" src={src} alt={label} />;
    }
    return (
        <div className="w-full aspect-video bg-gradient-to-br from-[#d9eaf8] to-white grid place-items-center p-5 text-navy-800 font-black text-center">
            <span>{label}</span>
        </div>
    );
}

export function Pagination({ links = [] }) {
    if (!links.length) return null;

    const pageLabel = (label) => label
        .replace(/&laquo;/g, '<<')
        .replace(/&raquo;/g, '>>')
        .replace(/<[^>]*>/g, '')
        .trim();

    return (
        <div className="flex flex-wrap gap-2 mt-7">
            {links.map((link, index) => (
                link.url
                    ? <Link
                        key={index}
                        className={`min-w-[38px] min-h-[38px] inline-grid place-items-center px-[11px] py-2 border rounded-md transition-[background,color,border-color] duration-150 ${link.active ? 'bg-navy-600 text-white border-navy-600' : 'bg-white border-slate-300 hover:bg-brand-sky hover:text-navy-600 hover:border-sky-200'}`}
                        href={link.url}
                      >
                        {pageLabel(link.label)}
                    </Link>
                    : <span
                        key={index}
                        className="min-w-[38px] min-h-[38px] inline-grid place-items-center px-[11px] py-2 border border-slate-200 bg-white rounded-md text-slate-400"
                      >
                        {pageLabel(link.label)}
                    </span>
            ))}
        </div>
    );
}
