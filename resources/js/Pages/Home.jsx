import { useEffect, useState } from 'react';
import { Link } from '@inertiajs/react';
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

// Original 3 static info cards — shown as fallback when no news is published
function StaticHeroPanel() {
    return (
        <div className="grid gap-3.5">
            <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <Award className="shrink-0 mt-0.5 text-gold-400" size={20} />
                <div>
                    <strong className="block text-white font-bold">ERB Registered</strong>
                    <span className="text-blue-200 text-sm">Registration No. 057</span>
                </div>
            </div>
            <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <ClipboardCheck className="shrink-0 mt-0.5 text-gold-400" size={20} />
                <div>
                    <strong className="block text-white font-bold">Established</strong>
                    <span className="text-blue-200 text-sm">December 2012</span>
                </div>
            </div>
            <div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <UsersRound className="shrink-0 mt-0.5 text-gold-400" size={20} />
                <div>
                    <strong className="block text-white font-bold">Core teams</strong>
                    <span className="text-blue-200 text-sm">Engineers, technologists, architects, ICT experts, and quantity surveyors</span>
                </div>
            </div>
        </div>
    );
}

// Animated news carousel — cycles through the latest bureau news in the hero panel
function HeroNewsPanel({ news }) {
    const [current, setCurrent] = useState(0);
    const [paused, setPaused] = useState(false);

    // Auto-advance via setTimeout so manual navigation always resets the timer cleanly
    useEffect(() => {
        if (paused || news.length <= 1) return;
        const t = setTimeout(() => setCurrent(c => (c + 1) % news.length), 5000);
        return () => clearTimeout(t);
    }, [current, paused, news.length]);

    if (!news.length) return <StaticHeroPanel />;

    const post = news[current];

    return (
        <div
            className="relative rounded-2xl overflow-hidden bg-white/10 backdrop-blur-sm border border-white/[0.12]"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            {/* Header: label + dot navigation */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3">
                <span className="text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-gold-400">
                    Latest News
                </span>
                {news.length > 1 && (
                    <div className="flex items-center gap-1.5">
                        {news.map((_, i) => (
                            <button
                                key={i}
                                type="button"
                                onClick={() => { setCurrent(i); }}
                                aria-label={`Go to news item ${i + 1}`}
                                className={`rounded-full transition-all duration-300 border-0 cursor-pointer ${
                                    i === current
                                        ? 'w-5 h-[5px] bg-gold-400'
                                        : 'w-[5px] h-[5px] bg-white/25 hover:bg-white/55'
                                }`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Animated content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={current}
                    initial={{ opacity: 0, x: 28, scale: 0.97 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -28, scale: 0.97 }}
                    transition={{ duration: 0.32, ease: [0.25, 0.1, 0.25, 1] }}
                    className="px-5 pb-6"
                >
                    {/* Featured image */}
                    {post.image && (
                        <div className="rounded-xl overflow-hidden mb-4 border border-white/10">
                            <img
                                src={post.image}
                                alt=""
                                className="w-full h-36 object-cover"
                            />
                        </div>
                    )}

                    {/* Date */}
                    <span className="block text-blue-200/60 text-[0.7rem] font-semibold tracking-wide mb-1">
                        {post.published_at || 'Bureau update'}
                    </span>

                    {/* Headline */}
                    <h3 className="text-white font-extrabold text-[1.05rem] leading-[1.3] line-clamp-2 mb-2.5">
                        {post.title}
                    </h3>

                    {/* Excerpt */}
                    {post.excerpt && (
                        <p className="text-blue-200/75 text-[0.88rem] leading-[1.6] line-clamp-2 mb-4">
                            {post.excerpt}
                        </p>
                    )}

                    {/* CTA */}
                    <Link
                        href={post.url}
                        className="group inline-flex items-center gap-1.5 text-gold-400 font-extrabold text-sm transition-[gap] duration-200 hover:gap-3"
                    >
                        Read update
                        <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                    </Link>
                </motion.div>
            </AnimatePresence>

            {/* Auto-advance progress bar — resets on each slide change */}
            {news.length > 1 && (
                <motion.div
                    key={`pb-${current}-${paused}`}
                    className="absolute bottom-0 left-0 h-[2px] bg-gold-400/60"
                    initial={{ width: '0%' }}
                    animate={{ width: paused ? undefined : '100%' }}
                    transition={{ duration: 5, ease: 'linear' }}
                />
            )}
        </div>
    );
}

export default function Home({ services = [], projects = [], staff = [], news = [], gallery = [], events = [], settings = {}, locale = 'en' }) {
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
                        <span className={eyebrowLight}>Professional Consulting and Training Bureau</span>
                        <h1 className="max-w-[840px] mt-3 mb-4 text-[clamp(2.2rem,5vw,4.7rem)] leading-[0.98] font-extrabold">Engineering consultancy shaped by DIT expertise.</h1>
                        <p className="max-w-[720px] text-blue-100 text-[clamp(1rem,1.6vw,1.2rem)] leading-[1.75]">DIT Institute Consultancy Bureau provides feasibility studies, project audits, engineering design, supervision, ICT services, laboratory technology, and environmental advisory services across Tanzania.</p>
                        <div className="flex items-center gap-3 flex-wrap mt-7">
                            <Link href="/services" className={btn.primary}>Explore services</Link>
                            <Link href="/contact" className={btn.secondary}>Contact bureau</Link>
                        </div>
                    </div>
                    <HeroNewsPanel news={news} />
                </div>
            </section>

            {/* Services */}
            <section className="py-[clamp(54px,7vw,88px)]">
                <SectionHead eyebrow="What we do" title="Consultancy services" href="/services" />
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
                <SectionHead eyebrow="Track record" title="Featured projects" href="/projects" action="View projects" />
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
                <SectionHead eyebrow="News & Events" title="Latest bureau updates" href="/news" action="View all updates" />
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
                                            {news[0].published_at || 'Latest update'}
                                        </div>
                                        <h3 className="max-w-[680px] text-[clamp(1.6rem,3vw,2.35rem)] font-extrabold leading-[1.05] text-white">{news[0].title}</h3>
                                        {news[0].excerpt && <p className="mt-4 max-w-[620px] text-blue-100 leading-[1.75]">{news[0].excerpt}</p>}
                                    </div>
                                    <span className="mt-8 inline-flex items-center gap-2 font-extrabold text-gold-400 transition-[gap] duration-200 group-hover:gap-3">
                                        Read update <ArrowRight size={18} />
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
                                                    {post.published_at || 'Update'}
                                                </span>
                                                <h3 className="text-[1.12rem] font-extrabold leading-[1.22] text-navy-800">{post.title}</h3>
                                                {post.excerpt && <p className="mt-2 line-clamp-2 text-sm leading-[1.65] text-slate-500">{post.excerpt}</p>}
                                            </div>
                                            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-extrabold text-navy-600 transition-[gap,color] duration-200 group-hover:gap-2.5 group-hover:text-navy-700">
                                                Details <ArrowRight size={15} />
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                                {news.length === 1 && (
                                    <div className="reveal grid min-h-[146px] place-items-center rounded-lg border border-dashed border-border-light bg-brand-muted p-6 text-center">
                                        <div>
                                            <Newspaper className="mx-auto mb-3 text-navy-600" size={24} />
                                            <p className="font-bold text-navy-800">More bureau updates will appear here as they are published.</p>
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
                                <h3 className="text-[1.2rem] font-extrabold text-navy-800">No updates published yet</h3>
                                <p className="mt-2 text-slate-500 leading-[1.65]">News, announcements, and event notices will appear here once they are published by the bureau.</p>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Upcoming Events */}
            {events.length > 0 && (
                <section className="py-[clamp(54px,7vw,88px)] bg-brand-muted bg-dot-pattern">
                    <SectionHead eyebrow="What's on" title="Upcoming events" href="/events" action="View all events" />
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
                    <SectionHead eyebrow="Photo gallery" title="Bureau in action" />
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
                        <span className={eyebrow}>Leadership</span>
                        <h2 className="mt-2 text-[clamp(1.75rem,3vw,2.7rem)] font-extrabold leading-[1.08] text-navy-800">Experienced multidisciplinary professionals</h2>
                        <p className="mt-3 text-slate-500 leading-[1.75]">The bureau brings together engineers, architects, ICT experts, environmental specialists and quantity surveyors with decades of field exposure.</p>
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
                        <span className={eyebrowLight}>Start a conversation</span>
                        <h2 className="mt-1.5 text-white text-[clamp(1.75rem,3vw,2.7rem)] leading-[1.08] font-extrabold">Need engineering consultancy support?</h2>
                        <p className="text-blue-200 leading-[1.65] mt-2">{settings.address}</p>
                    </div>
                    <Link className={btn.primary} href="/contact">Get in touch</Link>
                </div>
            </section>
        </Layout>
    );
}
