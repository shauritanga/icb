import { Link } from '@inertiajs/react';
import Layout from '../Components/Layout';
import { ImageBlock, PageHero, Pagination } from '../Components/UI';

export default function Projects({ projects = { data: [], links: [] }, settings = {}, locale = 'en' }) {
    return (
        <Layout settings={settings} locale={locale}>
            <PageHero eyebrow="Selected assignments" title="Projects and investigations">
                Representative consultancy assignments from geotechnical investigation and detailed design to tender documentation and supervision.
            </PageHero>
            <section className="py-[clamp(54px,7vw,88px)] bg-brand-muted bg-dot-pattern">
                <div className="max-w-[1180px] mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[18px]">
                        {projects.data.map((project, i) => (
                            <Link
                                className="bg-white border border-border-light rounded-lg shadow-card overflow-hidden transition-[box-shadow,transform] duration-[220ms] hover:-translate-y-1 hover:shadow-card-lg group reveal"
                                href={project.url}
                                key={project.slug}
                                style={{ transitionDelay: `${i * 0.07}s` }}
                            >
                                <div className="overflow-hidden">
                                    <ImageBlock src={project.image} label={project.title} />
                                </div>
                                <div className="p-[18px]">
                                    <h2 className="mb-2 text-navy-800 font-extrabold text-[1.1rem] leading-[1.25]">{project.title}</h2>
                                    <p className="text-slate-500 leading-[1.65] text-sm">{project.client_name}</p>
                                    <span className="block text-slate-400 text-[0.85rem] mt-1">{project.status}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                    <Pagination links={projects.links} />
                </div>
            </section>
        </Layout>
    );
}
