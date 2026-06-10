import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { ArrowLeft, CalendarDays, ExternalLink, MapPin } from 'lucide-react';
import Layout from '../Components/Layout';
import { PageHero } from '../Components/UI';
import { useT } from '../hooks/useT';

function MetaRow({ icon: Icon, label, value, href }) {
    if (!value) return null;
    return (
        <div className="flex items-start gap-3 py-3.5 border-b border-border-light last:border-0">
            <div className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-md bg-brand-sky flex items-center justify-center">
                <Icon size={13} className="text-navy-600" />
            </div>
            <div className="min-w-0">
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.09em] text-slate-400 mb-0.5">{label}</p>
                {href ? (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-navy-600 font-semibold text-[0.88rem] hover:underline">
                        {value} <ExternalLink size={11} />
                    </a>
                ) : (
                    <p className="text-navy-800 font-semibold text-[0.88rem] leading-snug">{value}</p>
                )}
            </div>
        </div>
    );
}

export default function Event({ event, settings = {}, locale = 'en' }) {
    const images = event.images?.length ? event.images : event.image ? [event.image] : [];
    const [activeIdx, setActiveIdx] = useState(0);
    const activeImage = images[activeIdx] ?? null;
    const t = useT();

    return (
        <Layout settings={settings} locale={locale}>
            <PageHero eyebrow={t.event_eyebrow ?? 'Bureau events'} title={event.title}>
                {event.event_date}
            </PageHero>

            <section className="py-[clamp(32px,5vw,56px)] bg-[#f5f8fc]">
                <div className="max-w-[1180px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 lg:gap-8 items-start">

                    {/* Left column */}
                    <div className="flex flex-col gap-5">
                        {activeImage && (
                            <div className="bg-white rounded-xl border border-border-light shadow-card overflow-hidden">
                                <img
                                    key={activeIdx}
                                    src={activeImage}
                                    alt={event.title}
                                    className="w-full max-h-[440px] object-cover"
                                />
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
                                                <img src={img} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {event.description && (
                            <div className="bg-white rounded-xl border border-border-light shadow-card overflow-hidden">
                                <div className="px-6 py-4 border-b border-border-light">
                                    <h2 className="text-navy-800 text-[0.95rem] font-extrabold tracking-tight uppercase">{t.event_about ?? 'About this event'}</h2>
                                </div>
                                <div
                                    className="px-6 py-6 prose prose-slate max-w-none text-slate-700 leading-[1.82] text-[0.95rem]
                                        [&_h2]:text-navy-800 [&_h2]:font-extrabold [&_h3]:text-navy-700 [&_h3]:font-bold
                                        [&_p]:mb-4 [&_p:last-child]:mb-0
                                        [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mt-1
                                        [&_a]:text-navy-600 [&_a]:underline [&_a:hover]:text-navy-800"
                                    dangerouslySetInnerHTML={{ __html: event.description }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Right sidebar */}
                    <aside className="sticky top-[96px] flex flex-col gap-4">
                        <div className="bg-white rounded-xl border border-border-light shadow-card overflow-hidden">
                            <div className="px-5 py-3.5 bg-navy-800">
                                <h3 className="text-white font-extrabold text-[0.72rem] uppercase tracking-[0.1em]">{t.event_details_header ?? 'Event Details'}</h3>
                            </div>
                            <div className="px-5">
                                <MetaRow icon={CalendarDays} label={t.event_date_time ?? 'Date & Time'}     value={event.event_date} />
                                {event.event_end_date && event.event_end_date !== event.event_date && (
                                    <MetaRow icon={CalendarDays} label={t.event_ends ?? 'Ends'}         value={event.event_end_date} />
                                )}
                                <MetaRow icon={MapPin}      label={t.event_location ?? 'Location'}      value={event.location} />
                            </div>
                        </div>

                        {event.registration_link && (
                            <a
                                href={event.registration_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-gold-400 hover:bg-gold-500 text-navy-900 font-extrabold transition-colors text-sm"
                            >
                                {t.event_register ?? 'Register for this event'} <ExternalLink size={14} />
                            </a>
                        )}

                        <Link
                            href="/events"
                            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border border-border-light bg-white hover:bg-brand-sky text-navy-700 font-bold transition-colors text-sm"
                        >
                            <ArrowLeft size={14} />
                            {t.event_all ?? 'All Events'}
                        </Link>
                    </aside>
                </div>
            </section>
        </Layout>
    );
}
