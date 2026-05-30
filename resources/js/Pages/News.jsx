import { Link } from '@inertiajs/react';
import Layout from '../Components/Layout';
import { PageHero, Pagination } from '../Components/UI';

export default function News({ posts = { data: [], links: [] }, settings = {}, locale = 'en' }) {
    return (
        <Layout settings={settings} locale={locale}>
            <PageHero eyebrow="Updates" title="News and announcements" />
            <section className="py-[clamp(54px,7vw,88px)]">
                <div className="max-w-[1180px] mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[18px]">
                        {posts.data.map((post, i) => (
                            <Link
                                className="bg-white border border-border-light rounded-lg shadow-card p-6 transition-[box-shadow,transform] duration-[220ms] hover:-translate-y-1 hover:shadow-card-lg reveal"
                                href={post.url}
                                key={post.slug}
                                style={{ transitionDelay: `${i * 0.08}s` }}
                            >
                                <span className="inline-block text-[#bb7d00] font-extrabold uppercase text-[0.78rem] tracking-[0.08em] mb-2">{post.published_at}</span>
                                <h2 className="mb-2.5 text-navy-800 font-extrabold text-[1.1rem] leading-[1.25]">{post.title}</h2>
                                <p className="text-slate-500 leading-[1.65] text-sm">{post.excerpt}</p>
                            </Link>
                        ))}
                    </div>
                    <Pagination links={posts.links} />
                </div>
            </section>
        </Layout>
    );
}
