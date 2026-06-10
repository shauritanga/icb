import {
    Building2,
    ClipboardList,
    DraftingCompass,
    HardHat,
    Monitor,
    Settings2,
    Zap,
} from 'lucide-react';
import Layout from '../Components/Layout';
import { PageHero } from '../Components/UI';
import { useT } from '../hooks/useT';

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

export default function Services({ services = [], settings = {}, locale = 'en' }) {
    const plainText = (html = '') => html.replace(/<[^>]*>/g, '').trim();
    const t = useT();

    return (
        <Layout settings={settings} locale={locale}>
            <PageHero eyebrow={t.services_eyebrow ?? 'Consultancy services'} title={t.services_title ?? 'Integrated professional services'}>
                {t.services_description ?? 'Engineering, design, project management, ICT, laboratory, and environmental services delivered by DIT ICB specialists.'}
            </PageHero>
            <section className="py-[clamp(54px,7vw,88px)]">
                <div className="max-w-[1180px] mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[18px]">
                    {services.map((service, i) => (
                        <article
                            className="bg-white border border-border-light rounded-lg shadow-card p-6 transition-[box-shadow,transform] duration-[220ms] hover:-translate-y-1 hover:shadow-card-lg reveal"
                            key={service.title}
                            style={{ transitionDelay: `${i * 0.08}s` }}
                        >
                            <span className="w-[46px] h-[46px] grid place-items-center bg-brand-sky text-navy-600 rounded-md mb-4">
                                <ServiceIcon name={service.icon} />
                            </span>
                            <h2 className="mb-2.5 text-navy-800 font-extrabold text-[1.15rem] leading-[1.2]">{service.title}</h2>
                            <p className="text-slate-500 leading-[1.65] mb-3">{service.summary}</p>
                            {plainText(service.body) && plainText(service.body) !== service.summary.trim() && (
                                <div
                                    className="prose text-slate-600 text-[0.95rem] leading-[1.7] [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mt-2 [&_li]:mt-1"
                                    dangerouslySetInnerHTML={{ __html: service.body }}
                                />
                            )}
                        </article>
                    ))}
                </div>
            </section>
        </Layout>
    );
}
