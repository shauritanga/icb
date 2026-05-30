import Layout from '../Components/Layout';
import { PageHero } from '../Components/UI';

export default function Project({ project, settings = {}, locale = 'en' }) {
    return (
        <Layout settings={settings} locale={locale}>
            <PageHero eyebrow="Project" title={project.title}>{project.client_name}</PageHero>
            <section className="py-[clamp(54px,7vw,88px)]">
                <div className="max-w-[1180px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10 items-start">
                    <article
                        className="prose prose-slate max-w-none text-slate-700 leading-[1.75] [&_h2]:text-navy-800 [&_h2]:font-extrabold [&_h3]:text-navy-700 [&_h3]:font-bold [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mt-1"
                        dangerouslySetInnerHTML={{ __html: project.description }}
                    />
                    <aside className="bg-brand-muted border border-border-light rounded-lg p-6 space-y-4 sticky top-[96px]">
                        {[
                            ['Client', project.client_name],
                            ['Contract value', project.contract_value],
                            ['Period', project.project_period],
                            ['Status', project.status],
                        ].map(([label, value]) => (
                            <div key={label} className="flex flex-col gap-0.5">
                                <strong className="text-navy-800 font-bold text-[0.82rem] uppercase tracking-[0.06em]">{label}</strong>
                                <span className="text-slate-600 text-[0.95rem]">{value || 'Not specified'}</span>
                            </div>
                        ))}
                    </aside>
                </div>
            </section>
        </Layout>
    );
}
