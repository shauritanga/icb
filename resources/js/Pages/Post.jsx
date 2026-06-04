import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { ChevronRight, Home as HomeIcon } from 'lucide-react';
import Layout from '../Components/Layout';

export default function Post({ post, settings = {}, locale = 'en' }) {
    const images = post.images?.length ? post.images : post.image ? [post.image] : [];
    const [activeIdx, setActiveIdx] = useState(0);
    const activeImage = images[activeIdx] ?? null;

    return (
        <Layout settings={settings} locale={locale}>
            {/* Hero */}
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
                    {post.published_at && (
                        <span className="inline-block text-gold-400 font-extrabold uppercase text-[0.78rem] tracking-[0.08em]">
                            {post.published_at}
                        </span>
                    )}
                    <h1 className="max-w-[840px] mt-3 mb-4 text-[clamp(2rem,4vw,3.8rem)] leading-[1.05] font-extrabold">
                        {post.title}
                    </h1>
                    {post.excerpt && (
                        <p className="max-w-[680px] text-blue-100 text-[clamp(1rem,1.6vw,1.15rem)] leading-[1.75]">
                            {post.excerpt}
                        </p>
                    )}
                </div>
            </section>

            {/* Body */}
            <section className="py-[clamp(54px,7vw,88px)]">
                <div className="max-w-[740px] mx-auto px-4">

                    {/* Image gallery */}
                    {activeImage && (
                        <div className="mb-8 bg-white rounded-xl border border-border-light shadow-card overflow-hidden">
                            <img
                                key={activeIdx}
                                src={activeImage}
                                alt={post.title}
                                className="w-full max-h-[480px] object-cover"
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

                    <article
                        className="prose prose-slate text-slate-700 leading-[1.8] [&_h2]:text-navy-800 [&_h2]:font-extrabold [&_h3]:text-navy-700 [&_h3]:font-bold [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mt-1 [&_a]:text-navy-600 [&_a]:underline [&_a:hover]:text-navy-800"
                        dangerouslySetInnerHTML={{ __html: post.body }}
                    />
                </div>
            </section>
        </Layout>
    );
}
