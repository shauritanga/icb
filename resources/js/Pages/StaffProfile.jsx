import { Link } from '@inertiajs/react';
import { ArrowLeft, Award, Briefcase, GraduationCap, UserRound } from 'lucide-react';
import Layout from '../Components/Layout';
import { PageHero } from '../Components/UI';
import { useT } from '../hooks/useT';

function DetailRow({ icon: Icon, label, value }) {
    if (!value) return null;
    return (
        <div className="flex items-start gap-3 py-3.5 border-b border-border-light last:border-0">
            <div className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-md bg-brand-sky flex items-center justify-center">
                <Icon size={13} className="text-navy-600" />
            </div>
            <div className="min-w-0">
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.09em] text-slate-400 mb-0.5">{label}</p>
                <p className="text-navy-800 font-semibold text-[0.88rem] leading-snug">{value}</p>
            </div>
        </div>
    );
}

export default function StaffProfile({ member, settings = {}, locale = 'en' }) {
    const t = useT();
    return (
        <Layout settings={settings} locale={locale}>

            <PageHero eyebrow={t.staff_eyebrow ?? 'Bureau team'} title={member.name}>
                {member.position}
            </PageHero>

            <section className="py-[clamp(32px,5vw,56px)] bg-[#f5f8fc]">
                <div className="max-w-[1180px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 lg:gap-8 items-start">

                    {/* ── Left column ── */}
                    <div className="flex flex-col gap-5">

                        {/* Photo */}
                        <div className="bg-white rounded-xl border border-border-light shadow-card overflow-hidden">
                            {member.photo ? (
                                <img
                                    src={member.photo}
                                    alt={member.name}
                                    className="w-full max-h-[480px] object-cover object-top"
                                />
                            ) : (
                                <div className="w-full aspect-[4/3] bg-gradient-to-br from-brand-sky to-white grid place-items-center text-navy-300">
                                    <UserRound size={80} strokeWidth={1} />
                                </div>
                            )}
                        </div>

                        {/* Experience / biography */}
                        {member.experience && (
                            <div className="bg-white rounded-xl border border-border-light shadow-card overflow-hidden">
                                <div className="px-6 py-4 border-b border-border-light">
                                    <h2 className="text-navy-800 text-[0.95rem] font-extrabold tracking-tight uppercase">{t.staff_experience ?? 'Professional Experience'}</h2>
                                </div>
                                <p className="px-6 py-6 text-slate-700 leading-[1.82] text-[0.95rem]">
                                    {member.experience}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* ── Right sidebar ── */}
                    <aside className="sticky top-[96px] flex flex-col gap-4">

                        {/* Profile details */}
                        <div className="bg-white rounded-xl border border-border-light shadow-card overflow-hidden">
                            <div className="px-5 py-3.5 bg-navy-800">
                                <h3 className="text-white font-extrabold text-[0.72rem] uppercase tracking-[0.1em]">{t.staff_profile_header ?? 'Profile Details'}</h3>
                            </div>
                            <div className="px-5">
                                <DetailRow icon={Briefcase}     label={t.staff_position ?? 'Position'}      value={member.position} />
                                <DetailRow icon={Award}         label={t.staff_profession ?? 'Profession'}    value={member.profession} />
                                <DetailRow icon={GraduationCap} label={t.staff_qualification ?? 'Qualification'} value={member.qualification} />
                            </div>
                        </div>

                        {/* Back link */}
                        <Link
                            href="/staff"
                            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border border-border-light bg-white hover:bg-brand-sky text-navy-700 font-bold transition-colors text-sm"
                        >
                            <ArrowLeft size={14} />
                            {t.staff_all ?? 'All Team Members'}
                        </Link>
                    </aside>

                </div>
            </section>

        </Layout>
    );
}
