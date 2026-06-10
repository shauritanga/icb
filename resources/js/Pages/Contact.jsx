import { FileText, Mail, MapPin, Phone } from 'lucide-react';
import Layout from '../Components/Layout';
import { PageHero } from '../Components/UI';
import { useT } from '../hooks/useT';

export default function Contact({ documents = [], settings = {}, locale = 'en' }) {
    const t = useT();
    return (
        <Layout settings={settings} locale={locale}>
            <PageHero eyebrow={t.contact_eyebrow ?? 'Contact'} title={t.contact_title ?? 'Work with DIT Institute Consultancy Bureau'}>
                {t.contact_description ?? 'Reach the bureau for consulting, training, technical audits, project design, and supervision enquiries.'}
            </PageHero>
            <section className="py-[clamp(54px,7vw,88px)]">
                <div className="max-w-[1180px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8 items-start">
                    <aside className="bg-brand-muted border border-border-light rounded-lg p-6 space-y-5">
                        {[
                            [MapPin, t.contact_address ?? 'Address', settings.address],
                            [Phone, t.contact_phone ?? 'Phone', settings.phone],
                            [Mail, t.contact_email ?? 'Email', settings.email],
                        ].map(([Icon, label, value]) => (
                            <div key={label} className="flex items-start gap-3">
                                <span className="shrink-0 mt-0.5 text-navy-600"><Icon size={18} /></span>
                                <div>
                                    <strong className="block text-navy-800 font-bold text-[0.82rem] uppercase tracking-[0.06em] mb-0.5">{label}</strong>
                                    <span className="text-slate-600 text-[0.95rem] leading-[1.6]">{value}</span>
                                </div>
                            </div>
                        ))}
                    </aside>
                    <div className="bg-white border border-border-light rounded-lg shadow-card p-6">
                        <h2 className="mb-4 text-navy-800 font-extrabold text-[1.2rem]">{t.contact_documents ?? 'Documents'}</h2>
                        {documents.length ? (
                            <div className="space-y-2">
                                {documents.map((document) => (
                                    <a
                                        className="flex items-center gap-3 p-3 rounded-md border border-border-light text-navy-600 font-semibold text-[0.95rem] transition-[background,color] duration-150 hover:bg-brand-sky hover:text-navy-800"
                                        href={document.url}
                                        key={document.title}
                                    >
                                        <FileText size={18} className="shrink-0 text-slate-400" />
                                        <span>{document.title}</span>
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-500">{t.contact_no_documents ?? 'No public documents have been uploaded yet.'}</p>
                        )}
                    </div>
                </div>
            </section>
        </Layout>
    );
}
