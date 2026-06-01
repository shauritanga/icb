import { Link } from '@inertiajs/react';
import { ChevronRight, Home as HomeIcon } from 'lucide-react';
import Layout from '../Components/Layout';

export default function Post({ post, settings = {}, locale = 'en' }) {
    return (
        <Layout settings={settings} locale={locale}>
            <section className="bg-navy-700 bg-engineering-structure text-white py-[clamp(52px,8vw,86px)]">
                <div className="max-w-[1180px] mx-auto px-4">
                    <nav className="mb-8 flex items-center gap-2 overflow-hidden text-sm text-blue-100" aria-label="Breadcrumb">
                        <Link className="inline-flex items-center gap-1.5 font-bold text-gold-400 transition-colors hover:text-white" href="/">
                            <HomeIcon size={15} />
                            Home
                        </Link>
                        <ChevronRight className="shrink-0 text-blue-200/60" size={15} />
                        <Link className="font-bold text-gold-400 transition-colors hover:text-white" href="/news">News & Events</Link>
                        <ChevronRight className="shrink-0 text-blue-200/60" size={15} />
                        <span className="truncate text-blue-100" aria-current="page">{post.title}</span>
                    </nav>
                    {post.published_at && <span className="inline-block text-gold-400 font-extrabold uppercase text-[0.78rem] tracking-[0.08em]">{post.published_at}</span>}
                    <h1 className="max-w-[840px] mt-3 mb-4 text-[clamp(2rem,4vw,3.8rem)] leading-[1.05] font-extrabold">{post.title}</h1>
                    {post.excerpt && <p className="max-w-[680px] text-blue-100 text-[clamp(1rem,1.6vw,1.15rem)] leading-[1.75]">{post.excerpt}</p>}
                </div>
            </section>
            <section className="py-[clamp(54px,7vw,88px)]">
                <div className="max-w-[740px] mx-auto px-4">
                    {post.image && <img className="mb-8 w-full rounded-lg border border-border-light object-cover shadow-card" src={post.image} alt="" />}
                    <article
                        className="prose prose-slate text-slate-700 leading-[1.8] [&_h2]:text-navy-800 [&_h2]:font-extrabold [&_h3]:text-navy-700 [&_h3]:font-bold [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mt-1 [&_a]:text-navy-600 [&_a]:underline [&_a:hover]:text-navy-800"
                        dangerouslySetInnerHTML={{ __html: post.body }}
                    />
                </div>
            </section>
        </Layout>
    );
}
