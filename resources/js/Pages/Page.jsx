import Layout from '../Components/Layout';
import { PageHero } from '../Components/UI';

export default function Page({ page, settings = {}, locale = 'en' }) {
    return (
        <Layout settings={settings} locale={locale}>
            <PageHero eyebrow="DIT ICB" title={page.title}>{page.excerpt}</PageHero>
            <section className="py-[clamp(54px,7vw,88px)]">
                <article
                    className="max-w-[740px] mx-auto px-4 prose prose-slate text-slate-700 leading-[1.8] [&_h2]:text-navy-800 [&_h2]:font-extrabold [&_h3]:text-navy-700 [&_h3]:font-bold [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mt-1 [&_a]:text-navy-600 [&_a]:underline [&_a:hover]:text-navy-800"
                    dangerouslySetInnerHTML={{ __html: page.body }}
                />
            </section>
        </Layout>
    );
}
