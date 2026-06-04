import { Link } from '@inertiajs/react';
import { UserRound } from 'lucide-react';
import Layout from '../Components/Layout';
import { PageHero } from '../Components/UI';

export default function Staff({ staff = [], settings = {}, locale = 'en' }) {
    return (
        <Layout settings={settings} locale={locale}>
            <PageHero eyebrow="Bureau team" title="Key professionals">
                Experienced engineering, ICT, architectural, environmental, and quantity surveying professionals.
            </PageHero>
            <section className="py-[clamp(54px,7vw,88px)] bg-brand-muted bg-dot-pattern">
                <div className="max-w-[1180px] mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
                    {staff.map((member, i) => (
                        <Link
                            key={member.id ?? member.name}
                            href={member.url}
                            className="group bg-white border border-border-light rounded-lg shadow-card overflow-hidden transition-[box-shadow,transform] duration-[220ms] hover:-translate-y-1 hover:shadow-card-lg reveal block"
                            style={{ transitionDelay: `${i * 0.07}s` }}
                        >
                            <div className="overflow-hidden">
                                {member.photo
                                    ? <img className="w-full aspect-[4/3] object-cover transition-transform duration-[400ms] group-hover:scale-[1.04]" src={member.photo} alt={member.name} />
                                    : <div className="w-full aspect-[4/3] bg-gradient-to-br from-brand-sky to-white grid place-items-center text-navy-400"><UserRound size={48} /></div>
                                }
                            </div>
                            <div className="p-5">
                                <h2 className="mb-1 text-navy-800 font-extrabold text-[1.05rem] leading-[1.25] group-hover:text-navy-600 transition-colors">{member.name}</h2>
                                <p className="text-slate-600 font-semibold text-sm">{member.position}</p>
                                {member.profession && <span className="block text-slate-500 text-[0.85rem] mt-1">{member.profession}</span>}
                                {member.qualification && <span className="block text-slate-400 text-[0.82rem] mt-0.5">{member.qualification}</span>}
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </Layout>
    );
}
