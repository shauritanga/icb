import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Building2, Calendar, CircleDot, DollarSign } from 'lucide-react';
import Layout from '../Components/Layout';
import { PageHero } from '../Components/UI';
import { useT } from '../hooks/useT';

const STATUS_CONFIG = {
    ongoing:   { dot: 'bg-blue-500',  pill: 'bg-blue-50  text-blue-800  border-blue-200'  },
    completed: { dot: 'bg-green-500', pill: 'bg-green-50 text-green-800 border-green-200' },
    planned:   { dot: 'bg-amber-400', pill: 'bg-amber-50 text-amber-800 border-amber-200' },
};

function StatusBadge({ status, label }) {
    if (!status) return null;
    const cfg = STATUS_CONFIG[status?.toLowerCase()] ?? { dot: 'bg-slate-400', pill: 'bg-slate-100 text-slate-700 border-slate-200' };
    return (
        <span className={`inline-flex items-center gap-1.5 border font-bold uppercase tracking-[0.07em] text-[0.7rem] px-2.5 py-1 rounded-full ${cfg.pill}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {label ?? status}
        </span>
    );
}

function MetaRow({ icon: Icon, label, value }) {
    if (!value) return null;
    return (
        <div className="flex items-start gap-3 py-3.5 border-b border-border-light last:border-0">
            <div className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-md bg-brand-sky flex items-center justify-center">
                <Icon size={13} className="text-navy-600" />
            </div>
            <div className="min-w-0">
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.09em] text-slate-400 mb-0.5">{label}</p>
                <p className="text-navy-800 font-semibold text-[0.88rem] leading-snug">{value}</p>
            </div>
        </div>
    );
}

export default function Project({ project, settings = {}, locale = 'en' }) {
    const images = project.images?.length
        ? project.images
        : project.image ? [project.image] : [];
    const [activeIdx, setActiveIdx] = useState(0);
    const activeImage = images[activeIdx] ?? null;
    const t = useT();

    return (
        <Layout settings={settings} locale={locale}>
            {/* ── Standard hero ───────────────────────────── */}
            <PageHero eyebrow={t.project_eyebrow ?? 'Project'} title={project.title}>
                {project.client_name}
            </PageHero>

            {/* ── Two-column body ─────────────────────────── */}
            <section className="py-[clamp(32px,5vw,56px)] bg-[#f5f8fc]">
                <div className="max-w-[1180px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 lg:gap-8 items-start">

                    {/* ── Left column ─── */}
                    <div className="flex flex-col gap-5">

                        {/* Large image */}
                        {activeImage && (
                            <div className="bg-white rounded-xl border border-border-light shadow-card overflow-hidden">
                                <img
                                    key={activeIdx}
                                    src={activeImage}
                                    alt={project.title}
                                    className="w-full h-[320px] md:h-[440px] object-cover"
                                />

                                {/* Thumbnail strip */}
                                {images.length > 1 && (
                                    <div className="flex gap-2 p-3 border-t border-border-light overflow-x-auto">
                                        {images.map((img, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => setActiveIdx(idx)}
                                                className={`flex-shrink-0 w-20 h-14 rounded-md overflow-hidden border-2 transition-all duration-150 ${
                                                    idx === activeIdx
                                                        ? 'border-navy-600 ring-2 ring-navy-600/20'
                                                        : 'border-transparent opacity-60 hover:opacity-90 hover:border-slate-300'
                                                }`}
                                            >
                                                <img
                                                    src={img}
                                                    alt={`View ${idx + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Description */}
                        <div className="bg-white rounded-xl border border-border-light shadow-card overflow-hidden">
                            <div className="px-6 py-4 border-b border-border-light">
                                <h2 className="text-navy-800 text-[0.95rem] font-extrabold tracking-tight uppercase">{t.project_overview ?? 'Project Overview'}</h2>
                            </div>
                            <div
                                className="px-6 py-6 prose prose-slate max-w-none text-slate-700 leading-[1.82] text-[0.95rem]
                                    [&_h2]:text-navy-800 [&_h2]:font-extrabold [&_h2]:text-[1.1rem] [&_h2]:mt-6 [&_h2]:mb-2
                                    [&_h3]:text-navy-700 [&_h3]:font-bold [&_h3]:mt-5 [&_h3]:mb-1.5
                                    [&_p]:mb-4 [&_p:last-child]:mb-0
                                    [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mt-1.5
                                    [&_a]:text-navy-600 [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-navy-800
                                    [&_strong]:text-navy-800 [&_strong]:font-bold"
                                dangerouslySetInnerHTML={{ __html: project.description }}
                            />
                        </div>
                    </div>

                    {/* ── Right sidebar ─── */}
                    <aside className="sticky top-[96px] flex flex-col gap-4">

                        {/* Details card */}
                        <div className="bg-white rounded-xl border border-border-light shadow-card overflow-hidden">
                            <div className="px-5 py-3.5 bg-navy-800">
                                <h3 className="text-white font-extrabold text-[0.72rem] uppercase tracking-[0.1em]">{t.project_details_header ?? 'Project Details'}</h3>
                            </div>
                            <div className="px-5">
                                <MetaRow icon={Building2}  label={t.project_client ?? 'Client'}         value={project.client_name} />
                                <MetaRow icon={DollarSign} label={t.project_contract_value ?? 'Contract Value'} value={project.contract_value} />
                                <MetaRow icon={Calendar}   label={t.project_period ?? 'Project Period'} value={project.project_period} />
                                {project.status && (
                                    <div className="flex items-start gap-3 py-3.5">
                                        <div className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-md bg-brand-sky flex items-center justify-center">
                                            <CircleDot size={13} className="text-navy-600" />
                                        </div>
                                        <div>
                                            <p className="text-[0.65rem] font-bold uppercase tracking-[0.09em] text-slate-400 mb-1.5">{t.project_status ?? 'Status'}</p>
                                            <StatusBadge status={project.status} label={t[`status_${project.status}`] ?? project.status} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Image counter */}
                        {images.length > 1 && (
                            <div className="bg-white rounded-xl border border-border-light shadow-card px-5 py-3.5 flex items-center justify-between">
                                <span className="text-[0.75rem] font-bold text-slate-500 uppercase tracking-wider">{t.project_gallery ?? 'Gallery'}</span>
                                <span className="text-[0.75rem] font-extrabold text-navy-700 bg-brand-sky px-2 py-0.5 rounded-full">
                                    {activeIdx + 1} / {images.length}
                                </span>
                            </div>
                        )}

                        {/* Back link */}
                        <Link
                            href="/projects"
                            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border border-border-light bg-white hover:bg-brand-sky text-navy-700 font-bold transition-colors text-sm"
                        >
                            <ArrowLeft size={14} />
                            {t.projects_all ?? 'All Projects'}
                        </Link>
                    </aside>

                </div>
            </section>

        </Layout>
    );
}
