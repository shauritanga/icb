import { useEffect, useState } from 'react';
import { Link } from '@inertiajs/react';
import { useT } from '../hooks/useT';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowRight,
    Award,
    Building2,
    CalendarDays,
    ClipboardCheck,
    ClipboardList,
    DraftingCompass,
    HardHat,
    Images,
    MapPin,
    Monitor,
    Newspaper,
    Settings2,
    UsersRound,
    Zap,
} from 'lucide-react';
import { CircularTestimonials } from '@/Components/ui/circular-testimonials';
import Layout from '../Components/Layout';
import { ImageBlock, SectionHead } from '../Components/UI';

const btn = {
    primary: 'inline-flex min-h-[46px] items-center justify-center px-[18px] py-3 rounded-md font-extrabold bg-gold-400 text-navy-900 transition-all duration-[180ms] hover:-translate-y-0.5 hover:bg-gold-500 hover:shadow-[0_6px_18px_rgba(248,193,44,0.4)] active:translate-y-0',
    secondary: 'inline-flex min-h-[46px] items-center justify-center px-[18px] py-3 rounded-md font-extrabold bg-white text-navy-600 border border-border-light transition-all duration-[180ms] hover:-translate-y-0.5 hover:bg-brand-sky hover:border-sky-200 active:translate-y-0',
};

const eyebrow = 'inline-block text-[#bb7d00] font-extrabold uppercase text-[0.78rem] tracking-[0.08em]';
const eyebrowLight = 'inline-block text-gold-400 font-extrabold uppercase text-[0.78rem] tracking-[0.08em]';
const card = 'bg-white border border-border-light rounded-lg shadow-card p-6 transition-[box-shadow,transform] duration-[220ms] hover:-translate-y-1 hover:shadow-card-lg reveal';

const leadershipFallbackImages = [
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1200&h=1500&fit=crop&crop=faces,entropy&auto=format&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1200&h=1500&fit=crop&crop=faces,entropy&auto=format&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1200&h=1500&fit=crop&crop=faces,entropy&auto=format&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=1200&h=1500&fit=crop&crop=faces,entropy&auto=format&q=80',
];

function leadershipQuote(member) {
    const details = [member.profession, member.qualification, member.experience].filter(Boolean).join(' / ');

    if (details) {
        return `${details}. ${member.name} contributes multidisciplinary leadership to engineering consultancy, project delivery, supervision, and institutional advisory work.`;
    }

    return `${member.name} contributes professional leadership to the bureau's consultancy, training, and project advisory services.`;
}

const ICON_MAP = {
    Building2,
    ClipboardList,
    DraftingCompass,
    HardHat,
    Monitor,
    Settings2,
    Zap,
};

function ServiceIcon({ name, size = 22 }) {
    const Icon = ICON_MAP[name] ?? DraftingCompass;
    return <Icon size={size} />;
}

// Fallback when no news is published
function StaticHeroPanel() {
    const t = useT();
    return (
        <div className="grid gap-3.5">
            <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <Award className="shrink-0 mt-0.5 text-gold-400" size={20} />
                <div>
                    <strong className="block text-white font-bold">{t.erp_registered ?? 'ERB Registered'}</strong>
                    <span className="text-blue-200 text-sm">{t.erp_number ?? 'Registration No. 057'}</span>
                </div>
            </div>
            <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <ClipboardCheck className="shrink-0 mt-0.5 text-gold-400" size={20} />
                <div>
                    <strong className="block text-white font-bold">{t.erp_established ?? 'Established'}</strong>
                    <span className="text-blue-200 text-sm">{t.erp_established_date ?? 'December 2012'}</span>
                </div>
            </div>
            <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <UsersRound className="shrink-0 mt-0.5 text-gold-400" size={20} />
                <div>
                    <strong className="block text-white font-bold">{t.erp_core_teams ?? 'Core teams'}</strong>
                    <span className="text-blue-200 text-sm">{t.erp_core_teams_desc ?? 'Engineers, technologists, architects, ICT experts, and quantity surveyors'}</span>
                </div>
            </div>
        </div>
    );
}

// Stack config per depth level: front → back
// No scaling — back cards are same size, just pushed down so their bottom edge peeks below
const CARD_STACK = [
    { y: 0,  rotate: 0,  zIndex: 30, bgOpacity: 0.13 }, // front
    { y: 20, rotate: 2,  zIndex: 20, bgOpacity: 0.08 }, // second — 20px peek below front
    { y: 36, rotate: -1, zIndex: 10, bgOpacity: 0.05 }, // back   — 36px peek below front
];

// Stacked-card animated news panel
function HeroNewsPanel({ news }) {
    const [current, setCurrent] = useState(0);
    const [paused, setPaused] = useState(false);
    const n = news.length;
    const stackCount = Math.min(n, 3);
    const tr = useT();

    useEffect(() => {
        if (paused || n <= 1) return;
        const t = setTimeout(() => setCurrent(c => (c + 1) % n), 5000);
        return () => clearTimeout(t);
    }, [current, paused, n]);

    if (!n) return <StaticHeroPanel />;

    return (
        <div
            // paddingBottom makes room for back cards peeking below front card
            style={{ paddingBottom: stackCount > 2 ? 42 : stackCount > 1 ? 26 : 0 }}
            className="relative"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            {/*
              Invisible spacer — same structure as front card, invisible, in normal flow.
              This sets the container height so absolutely-positioned cards have a reference.
            */}
            <div className="invisible pointer-events-none rounded-2xl border border-transparent overflow-hidden" aria-hidden>
                <div className="flex items-center justify-between px-5 pt-4 pb-3">
                    <span className="text-[0.68rem]">{tr.home_latest_news ?? 'Latest News'}</span>
                    <div className="flex gap-1.5">{news.map((_, i) => <span key={i} className="w-[5px] h-[5px] rounded-full" />)}</div>
                </div>
                <div className="px-5 pb-6">
                    {news[current].image && <div className="w-full h-36 rounded-xl mb-4" />}
                    <span className="block text-[0.7rem] mb-1">&nbsp;</span>
                    <p className="text-[1.05rem] leading-[1.3] mb-2.5 line-clamp-2">{news[current].title}</p>
                    {news[current].excerpt && <p className="text-[0.88rem] leading-[1.6] mb-4 line-clamp-2">{news[current].excerpt}</p>}
                    <span className="text-sm">{tr.home_bureau_update ?? 'Read update'}</span>
                </div>
            </div>

            {/*
              All news cards, absolutely stacked.
              key=newsIdx so React keeps the same DOM node for each news item —
              framer-motion then smoothly animates it between stack positions.
            */}
            {news.map((post, newsIdx) => {
                // stackPos: 0=front, 1=middle, 2=back, ≥3=hidden
                const stackPos = (newsIdx - current + n) % n;
                const cfg = CARD_STACK[Math.min(stackPos, 2)];
                const hidden = stackPos >= stackCount;
                const isFront = stackPos === 0;

                return (
                    <motion.div
                        key={newsIdx}
                        animate={{
                            y:       hidden ? 48 : cfg.y,
                            rotate:  hidden ? 0  : cfg.rotate,
                            opacity: hidden ? 0  : 1,
                        }}
                        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                        style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0,
                            zIndex: hidden ? 0 : cfg.zIndex,
                        }}
                        className={`rounded-2xl backdrop-blur-sm border border-white/[0.12] overflow-hidden${isFront ? ' shadow-[0_8px_32px_rgba(0,0,0,0.35)]' : ''}`}
                    >
                        {/* Background tint — each depth level has distinct opacity */}
                        <div
                            className="absolute inset-0 pointer-events-none"
                            style={{ background: `rgba(255,255,255,${cfg.bgOpacity})` }}
                        />

                        {/* Header — same structure on ALL cards so heights match; dots invisible on back cards */}
                        <div className="relative flex items-center justify-between px-5 pt-4 pb-3">
                            <span className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-gold-400">
                                {tr.home_latest_news ?? 'Latest News'}
                            </span>
                            {n > 1 && (
                                <div className={`flex items-center gap-1.5 ${!isFront ? 'invisible' : ''}`}>
                                    {news.map((_, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={isFront ? () => setCurrent(i) : undefined}
                                            aria-label={`News item ${i + 1}`}
                                            className={`rounded-full border-0 cursor-pointer transition-all duration-300 ${
                                                i === current
                                                    ? 'w-5 h-[5px] bg-gold-400'
                                                    : 'w-[5px] h-[5px] bg-white/25 hover:bg-white/55'
                                            }`}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/*
                          Content — IDENTICAL structure on every card so all cards have the same height.
                          Back cards get a dimming wrapper; only the front card has pointer events.
                        */}
                        <div className={`relative px-5 pb-6 ${!isFront ? 'pointer-events-none select-none' : ''}`}>
                            {/* Dim overlay for back cards */}
                            {!isFront && (
                                <div className="absolute inset-0 bg-navy-800/40 z-10 rounded-b-xl" />
                            )}

                            {isFront ? (
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={current}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.28 }}
                                    >
                                        {post.image && (
                                            <div className="rounded-xl overflow-hidden mb-4 border border-white/10">
                                                <img src={post.image} alt="" className="w-full h-36 object-cover" />
                                            </div>
                                        )}
                                        <span className="block text-blue-200/60 text-[0.7rem] font-semibold tracking-wide mb-1">
                                            {post.published_at || (tr.home_bureau_update ?? 'Bureau update')}
                                        </span>
                                        <h3 className="text-white font-extrabold text-[1.05rem] leading-[1.3] line-clamp-2 mb-2.5">
                                            {post.title}
                                        </h3>
                                        {post.excerpt && (
                                            <p className="text-blue-200/75 text-[0.88rem] leading-[1.6] line-clamp-2 mb-4">
                                                {post.excerpt}
                                            </p>
                                        )}
                                        <Link
                                            href={post.url}
                                            className="group inline-flex items-center gap-1.5 text-gold-400 font-extrabold text-sm transition-[gap] duration-200 hover:gap-3"
                                        >
                                            {tr.home_bureau_update ?? 'Read update'}
                                            <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                                        </Link>
                                    </motion.div>
                                </AnimatePresence>
                            ) : (
                                /* Same layout as front card — keeps card height identical so y-offset peeks work */
                                <div>
                                    {post.image && (
                                        <div className="rounded-xl overflow-hidden mb-4 border border-white/10">
                                            <img src={post.image} alt="" className="w-full h-36 object-cover" />
                                        </div>
                                    )}
                                    <span className="block text-blue-200/60 text-[0.7rem] font-semibold tracking-wide mb-1">
                                        {post.published_at || (tr.home_bureau_update ?? 'Bureau update')}
                                    </span>
                                    <h3 className="text-white font-extrabold text-[1.05rem] leading-[1.3] line-clamp-2 mb-2.5">
                                        {post.title}
                                    </h3>
                                    {post.excerpt && (
                                        <p className="text-blue-200/75 text-[0.88rem] leading-[1.6] line-clamp-2 mb-4">
                                            {post.excerpt}
                                        </p>
                                    )}
                                    <span className="inline-flex items-center gap-1.5 text-gold-400 font-extrabold text-sm">
                                        {tr.home_bureau_update ?? 'Read update'} <ArrowRight size={14} />
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Gold progress bar — only on front */}
                        {isFront && n > 1 && (
                            <motion.div
                                key={`pb-${current}`}
                                className="absolute bottom-0 left-0 h-[2px] bg-gold-400/70"
                                initial={{ width: '0%' }}
                                animate={{ width: paused ? undefined : '100%' }}
                                transition={{ duration: 5, ease: 'linear' }}
                            />
                        )}
                    </motion.div>
                );
            })}
        </div>
    );
}

export default function Home({ services = [], projects = [], staff = [], news = [], gallery = [], events = [], settings = {}, locale = 'en' }) {
    const t = useT();
    const leadershipTestimonials = staff.map((member, index) => ({
        quote: leadershipQuote(member),
        name: member.name,
        designation: member.position,
        src: member.photo || leadershipFallbackImages[index % leadershipFallbackImages.length],
    }));

    return (
        <Layout settings={settings} locale={locale}>
            {/* Hero */}
            <section className="bg-navy-700 bg-engineering-structure text-white py-[clamp(56px,8vw,96px)]">
                <div className="max-w-[1180px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-[clamp(28px,5vw,64px)] items-center">
                    <div className="hero-copy">
                        <span className={eyebrowLight}>{t.hero_eyebrow ?? 'Professional Consulting and Training Bureau'}</span>
                        <h1 className="max-w-[840px] mt-3 mb-4 text-[clamp(2.2rem,5vw,4.7rem)] leading-[0.98] font-extrabold">{t.hero_title ?? 'Engineering consultancy shaped by DIT expertise.'}</h1>
                        <p className="max-w-[720px] text-blue-100 text-[clamp(1rem,1.6vw,1.2rem)] leading-[1.75]">{t.hero_description ?? 'DIT Institute Consultancy Bureau provides feasibility studies, project audits, engineering design, supervision, ICT services, laboratory technology, and environmental advisory services across Tanzania.'}</p>
                        <div className="flex items-center gap-3 flex-wrap mt-7">
                            <Link href="/services" className={btn.primary}>{t.hero_explore_services ?? 'Explore services'}</Link>
                            <Link href="/contact" className={btn.secondary}>{t.hero_contact_bureau ?? 'Contact bureau'}</Link>
                        </div>
                    </div>
                    <HeroNewsPanel news={news} />
                </div>
            </section>

            {/* Services */}
            <section className="py-[clamp(54px,7vw,88px)]">
                <SectionHead eyebrow={t.home_services_eyebrow ?? 'What we do'} title={t.home_services_title ?? 'Consultancy services'} href="/services" />
                <div className="max-w-[1180px] mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-[18px]">
                    {services.map((service, i) => (
                        <article className={card} key={service.title} style={{ transitionDelay: `${i * 0.08}s` }}>
                            <span className="w-[46px] h-[46px] grid place-items-center bg-brand-sky text-navy-600 rounded-md mb-4">
                                <ServiceIcon name={service.icon} />
                            </span>
                            <h3 className="mb-2.5 text-navy-800 font-extrabold text-[1.2rem] leading-[1.2]">{service.title}</h3>
                            <p className="text-slate-500 leading-[1.65]">{service.summary}</p>
                        </article>
                    ))}
                </div>
            </section>

            {/* Projects */}
            <section className="py-[clamp(54px,7vw,88px)] bg-brand-muted bg-dot-pattern">
                <SectionHead eyebrow={t.home_projects_eyebrow ?? 'Track record'} title={t.home_projects_title ?? 'Featured projects'} href="/projects" action={t.home_projects_action ?? 'View projects'} />
                <div className="max-w-[1180px] mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-[18px]">
                    {projects.map((project, i) => (
                        <Link
                            className="bg-white border border-border-light rounded-lg shadow-card overflow-hidden transition-[box-shadow,transform] duration-[220ms] hover:-translate-y-1 hover:shadow-card-lg group reveal"
                            href={project.url}
                            key={project.slug}
                            style={{ transitionDelay: `${i * 0.08}s` }}
                        >
                            <div className="overflow-hidden">
                                <ImageBlock src={project.image} label={project.title} />
                            </div>
                            <div className="p-[18px]">
                                <h3 className="mb-2.5 text-navy-800 font-extrabold text-[1.2rem] leading-[1.2]">{project.title}</h3>
                                <p className="text-slate-500 leading-[1.65]">{project.client_name}</p>
                                <span className="block text-slate-400 text-[0.92rem] mt-1">{project.status}</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* News & Events */}
            <section className="py-[clamp(54px,7vw,88px)] bg-white">
                <SectionHead eyebrow={t.home_news_eyebrow ?? 'News & Events'} title={t.home_news_title ?? 'Latest bureau updates'} href="/news" action={t.home_news_action ?? 'View all updates'} />
                <div className="max-w-[1180px] mx-auto px-4">
                    {news.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-[18px] items-stretch">
                            <Link
                                className="group reveal relative overflow-hidden rounded-lg border border-border-light bg-navy-900 p-[clamp(22px,4vw,34px)] text-white shadow-card transition-[box-shadow,transform] duration-[220ms] hover:-translate-y-1 hover:shadow-card-lg"
                                href={news[0].url}
                            >
                                {news[0].image && (
                                    <img
                                        className="absolute inset-0 h-full w-full object-cover opacity-28 transition-transform duration-500 group-hover:scale-105"
                                        src={news[0].image}
                                        alt=""
                                    />
                                )}
                                <div className="absolute inset-0 bg-hero-mesh opacity-80" />
                                <div className="relative z-10 flex min-h-[310px] flex-col justify-between">
                                    <div>
                                        <span className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-md bg-gold-400 text-navy-900">
                                            <Newspaper size={23} />
                                        </span>
                                        <div className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-blue-100">
                                            <CalendarDays size={16} />
                                            {news[0].published_at || (t.home_latest_update ?? 'Latest update')}
                                        </div>
                                        <h3 className="max-w-[680px] text-[clamp(1.6rem,3vw,2.35rem)] font-extrabold leading-[1.05] text-white">{news[0].title}</h3>
                                        {news[0].excerpt && <p className="mt-4 max-w-[620px] text-blue-100 leading-[1.75]">{news[0].excerpt}</p>}
                                    </div>
                                    <span className="mt-8 inline-flex items-center gap-2 font-extrabold text-gold-400 transition-[gap] duration-200 group-hover:gap-3">
                                        {t.home_bureau_update ?? 'Read update'} <ArrowRight size={18} />
                                    </span>
                                </div>
                            </Link>

                            <div className="grid gap-[18px]">
                                {news.slice(1, 3).map((post, i) => (
                                    <Link
                                        className="group reveal grid min-h-[168px] grid-cols-[112px_1fr] overflow-hidden rounded-lg border border-border-light bg-white shadow-card transition-[box-shadow,transform] duration-[220ms] hover:-translate-y-1 hover:shadow-card-lg max-sm:grid-cols-1"
                                        href={post.url}
                                        key={post.slug}
                                        style={{ transitionDelay: `${(i + 1) * 0.08}s` }}
                                    >
                                        <div className="min-h-[168px] bg-brand-muted max-sm:min-h-[160px]">
                                            {post.image ? (
                                                <img className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" src={post.image} alt="" />
                                            ) : (
                                                <div className="grid h-full place-items-center text-navy-600">
                                                    <Newspaper size={24} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col justify-between p-6">
                                            <div>
                                                <span className="mb-3 inline-flex items-center gap-2 text-[#bb7d00] text-[0.78rem] font-extrabold uppercase tracking-[0.08em]">
                                                    <CalendarDays size={14} />
                                                    {post.published_at || (t.home_news_update ?? 'Update')}
                                                </span>
                                                <h3 className="text-[1.12rem] font-extrabold leading-[1.22] text-navy-800">{post.title}</h3>
                                                {post.excerpt && <p className="mt-2 line-clamp-2 text-sm leading-[1.65] text-slate-500">{post.excerpt}</p>}
                                            </div>
                                            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-extrabold text-navy-600 transition-[gap,color] duration-200 group-hover:gap-2.5 group-hover:text-navy-700">
                                                {t.home_news_details ?? 'Details'} <ArrowRight size={15} />
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                                {news.length === 1 && (
                                    <div className="reveal grid min-h-[146px] place-items-center rounded-lg border border-dashed border-border-light bg-brand-muted p-6 text-center">
                                        <div>
                                            <Newspaper className="mx-auto mb-3 text-navy-600" size={24} />
                                            <p className="font-bold text-navy-800">{t.home_news_more ?? 'More bureau updates will appear here as they are published.'}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="reveal grid min-h-[220px] place-items-center rounded-lg border border-dashed border-border-light bg-brand-muted p-8 text-center">
                            <div className="max-w-[520px]">
                                <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-white text-navy-600 shadow-card">
                                    <Newspaper size={23} />
                                </span>
                                <h3 className="text-[1.2rem] font-extrabold text-navy-800">{t.home_news_empty_title ?? 'No updates published yet'}</h3>
                                <p className="mt-2 text-slate-500 leading-[1.65]">{t.home_news_empty_body ?? 'News, announcements, and event notices will appear here once they are published by the bureau.'}</p>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Upcoming Events */}
            {events.length > 0 && (
                <section className="py-[clamp(54px,7vw,88px)] bg-brand-muted bg-dot-pattern">
                    <SectionHead eyebrow={t.home_events_eyebrow ?? "What's on"} title={t.home_events_title ?? 'Upcoming events'} href="/events" action={t.home_events_action ?? 'View all events'} />
                    <div className="max-w-[1180px] mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
                        {events.map((event, i) => (
                            <Link
                                key={event.slug}
                                href={event.url}
                                className="group bg-white border border-border-light rounded-lg shadow-card overflow-hidden transition-[box-shadow,transform] duration-[220ms] hover:-translate-y-1 hover:shadow-card-lg reveal"
                                style={{ transitionDelay: `${i * 0.07}s` }}
                            >
                                {event.image ? (
                                    <div className="overflow-hidden h-40">
                                        <img src={event.image} alt={event.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                    </div>
                                ) : (
                                    <div className="h-40 bg-gradient-to-br from-brand-sky to-white flex items-center justify-center">
                                        <CalendarDays size={32} className="text-navy-400" />
                                    </div>
                                )}
                                <div className="p-5">
                                    {event.event_date && (
                                        <span className="inline-flex items-center gap-1.5 text-[0.78rem] font-extrabold uppercase tracking-[0.08em] text-[#bb7d00] mb-2">
                                            <CalendarDays size={12} /> {event.event_date}
                                        </span>
                                    )}
                                    <h3 className="text-navy-800 font-extrabold text-[1.05rem] leading-[1.25] group-hover:text-navy-600 transition-colors">{event.title}</h3>
                                    {event.location && (
                                        <span className="inline-flex items-center gap-1.5 text-slate-500 text-sm mt-2">
                                            <MapPin size={12} className="shrink-0" />{event.location}
                                        </span>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Gallery */}
            {gallery.length > 0 && (
                <section className="py-[clamp(54px,7vw,88px)] bg-white">
                    <SectionHead eyebrow={t.home_gallery_eyebrow ?? 'Photo gallery'} title={t.home_gallery_title ?? 'Bureau in action'} />
                    <div className="max-w-[1180px] mx-auto px-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                        {gallery.map((item, i) => (
                            <div
                                key={i}
                                className="group relative overflow-hidden rounded-lg border border-border-light shadow-card reveal"
                                style={{ transitionDelay: `${i * 0.05}s` }}
                            >
                                <img
                                    src={item.image}
                                    alt={item.title || ''}
                                    className="w-full aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                {item.caption && (
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-900/80 to-transparent px-4 py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                        <p className="text-white text-sm font-semibold leading-snug">{item.caption}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Leadership */}
            <section className="overflow-hidden bg-white py-[clamp(54px,7vw,88px)]">
                <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-8 px-4 reveal">
                    <div className="max-w-[680px]">
                        <span className={eyebrow}>{t.home_leadership_eyebrow ?? 'Leadership'}</span>
                        <h2 className="mt-2 text-[clamp(1.75rem,3vw,2.7rem)] font-extrabold leading-[1.08] text-navy-800">{t.home_leadership_title ?? 'Experienced multidisciplinary professionals'}</h2>
                        <p className="mt-3 text-slate-500 leading-[1.75]">{t.home_leadership_description ?? 'The bureau brings together engineers, architects, ICT experts, environmental specialists and quantity surveyors with decades of field exposure.'}</p>
                    </div>

                    <CircularTestimonials
                        testimonials={leadershipTestimonials}
                        autoplay={true}
                        colors={{
                            name: '#0d2545',
                            designation: '#64748b',
                            testimony: '#334155',
                            arrowBackground: '#0d2545',
                            arrowForeground: '#f8fafc',
                            arrowHoverBackground: '#f8c12c',
                        }}
                        fontSizes={{
                            name: '28px',
                            designation: '16px',
                            quote: '18px',
                        }}
                    />
                </div>
            </section>

            {/* Contact CTA */}
            <section className="py-[clamp(54px,7vw,88px)] bg-navy-700 bg-diagonal-pattern text-white">
                <div className="max-w-[1180px] mx-auto px-4 grid grid-cols-1 md:grid-cols-[1fr_auto] items-center gap-[clamp(20px,5vw,56px)]">
                    <div>
                        <span className={eyebrowLight}>{t.home_cta_eyebrow ?? 'Start a conversation'}</span>
                        <h2 className="mt-1.5 text-white text-[clamp(1.75rem,3vw,2.7rem)] leading-[1.08] font-extrabold">{t.home_cta_title ?? 'Need engineering consultancy support?'}</h2>
                        <p className="text-blue-200 leading-[1.65] mt-2">{settings.address}</p>
                    </div>
                    <Link className={btn.primary} href="/contact">{t.home_cta_button ?? 'Get in touch'}</Link>
                </div>
            </section>
        </Layout>
    );
}
