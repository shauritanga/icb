import { Link } from '@inertiajs/react';
import { ArrowRight, CalendarDays, MapPin } from 'lucide-react';
import Layout from '../Components/Layout';
import { PageHero, Pagination } from '../Components/UI';
import { useT } from '../hooks/useT';

function EventCard({ event, delay }) {
    return (
        <Link
            href={event.url}
            className="group bg-white border border-border-light rounded-lg shadow-card overflow-hidden transition-[box-shadow,transform] duration-[220ms] hover:-translate-y-1 hover:shadow-card-lg reveal flex flex-col"
            style={{ transitionDelay: `${delay}s` }}
        >
            {event.image ? (
                <div className="overflow-hidden h-48">
                    <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                </div>
            ) : (
                <div className="h-48 bg-gradient-to-br from-brand-sky to-white flex items-center justify-center">
                    <CalendarDays size={40} className="text-navy-400" />
                </div>
            )}
            <div className="p-5 flex flex-col flex-1">
                {event.event_date && (
                    <span className="inline-flex items-center gap-1.5 text-[0.78rem] font-extrabold uppercase tracking-[0.08em] text-[#bb7d00] mb-3">
                        <CalendarDays size={13} />
                        {event.event_date}
                    </span>
                )}
                <h2 className="mb-2 text-navy-800 font-extrabold text-[1.08rem] leading-[1.25] group-hover:text-navy-600 transition-colors">
                    {event.title}
                </h2>
                {event.location && (
                    <span className="inline-flex items-center gap-1.5 text-slate-500 text-sm mt-auto pt-3">
                        <MapPin size={13} className="shrink-0" />
                        {event.location}
                    </span>
                )}
            </div>
        </Link>
    );
}

export default function Events({ events = { data: [], links: [] }, settings = {}, locale = 'en' }) {
    const t = useT();
    return (
        <Layout settings={settings} locale={locale}>
            <PageHero eyebrow={t.events_eyebrow ?? 'Bureau events'} title={t.events_title ?? 'Events & Workshops'}>
                {t.events_description ?? 'Workshops, training sessions, and public engagements hosted by DIT Institute Consultancy Bureau.'}
            </PageHero>

            <section className="py-[clamp(54px,7vw,88px)] bg-brand-muted bg-dot-pattern">
                <div className="max-w-[1180px] mx-auto px-4">
                    {events.data.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[18px] mb-10">
                                {events.data.map((event, i) => (
                                    <EventCard key={event.slug} event={event} delay={i * 0.07} />
                                ))}
                            </div>
                            <Pagination links={events.links} />
                        </>
                    ) : (
                        <div className="reveal grid min-h-[220px] place-items-center rounded-lg border border-dashed border-border-light bg-white p-8 text-center">
                            <div className="max-w-[520px]">
                                <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-brand-sky text-navy-600">
                                    <CalendarDays size={23} />
                                </span>
                                <h3 className="text-[1.2rem] font-extrabold text-navy-800">{t.events_empty_title ?? 'No events scheduled'}</h3>
                                <p className="mt-2 text-slate-500 leading-[1.65]">
                                    {t.events_empty_body ?? 'Events and workshops will appear here once they are published.'}
                                </p>
                                <Link href="/news" className="inline-flex items-center gap-1.5 mt-5 font-bold text-navy-600 hover:text-navy-800 transition-colors">
                                    {t.events_view_news ?? 'View news & updates'} <ArrowRight size={15} />
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </Layout>
    );
}
