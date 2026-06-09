import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { 
    User, Mail, Phone, MapPin, Calendar, Heart, Shield, 
    ChevronLeft, Edit2, FileText, CheckCircle2, Award, 
    Briefcase, GraduationCap 
} from 'lucide-react';

export default function Details({ leader }) {
    // Determine level badge
    const isMGT = leader.role === 'MGT';

    return (
        <AuthenticatedLayout
            header={leader.full_name}
            breadcrumb={
                <div className="flex items-center gap-2 text-xs">
                    <Link href={route('dashboard', 'leaders')} className="hover:text-gold-400">Leaders</Link>
                    <span className="opacity-30">/</span>
                    <span>Leader Bio</span>
                </div>
            }
        >
            <Head title={`${leader.full_name} - Leader Bio`} />

            <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-12">
                {/* Top Action Bar */}
                <div className="flex justify-between items-center">
                    <Link 
                        href={route('dashboard', 'leaders')} 
                        className="btn btn--secondary btn--sm"
                    >
                        <ChevronLeft size={16} /> Back to Dashboard
                    </Link>
                    <Link 
                        href={route('master_guides.edit', leader.id)} 
                        className="btn btn--primary btn--sm"
                    >
                        <Edit2 size={16} /> Edit Profile
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Col: Profile Card & Quick Stats */}
                    <div className="lg:col-span-1 flex flex-col gap-6">
                        <div className="panel overflow-hidden">
                            <div className="h-32 bg-gradient-to-br from-gold-900 to-gold-600 relative">
                                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                                    <div className="h-28 w-28 rounded-3xl border-4 border-surface-800 shadow-2xl overflow-hidden bg-surface-700 flex items-center justify-center text-gold-400">
                                        {leader.avatar_path ? (
                                            <img src={leader.avatar_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={48} />
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="pt-16 pb-8 px-6 text-center">
                                <h2 className="text-xl font-bold mb-1">{leader.full_name}</h2>
                                <p className="text-muted text-sm flex items-center justify-center gap-2">
                                    {isMGT ? <GraduationCap size={14} className="text-gold-400" /> : <Award size={14} className="text-gold-400" />}
                                    {isMGT ? 'Master Guide in Training' : 'Invested Master Guide'}
                                </p>
                                <div className="mt-6 flex flex-wrap justify-center gap-2">
                                    <span className={`badge ${isMGT ? 'badge--gold' : 'badge--info'}`}>
                                        Level: {leader.role}
                                    </span>
                                    {leader.actively_teaching && <span className="badge badge--success">Actively Teaching</span>}
                                    {leader.insured_yearly && <span className="badge badge--neutral">Insured</span>}
                                </div>
                            </div>
                        </div>

                        <div className="panel p-6">
                            <h4 className="text-xs font-bold uppercase tracking-widest opacity-50 mb-6">Staff Connectivity</h4>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/5 rounded-lg text-gold-400"><Briefcase size={16} /></div>
                                    <div>
                                        <div className="text-[10px] text-muted uppercase">Occupation</div>
                                        <div className="text-sm font-medium capitalize">{leader.occupation_status || 'N/A'}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/5 rounded-lg text-gold-400"><MapPin size={16} /></div>
                                    <div>
                                        <div className="text-[10px] text-muted uppercase">Residence</div>
                                        <div className="text-sm font-medium">{leader.residence || 'N/A'}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/5 rounded-lg text-gold-400"><Shield size={16} /></div>
                                    <div>
                                        <div className="text-[10px] text-muted uppercase">Assigned Class</div>
                                        <div className="text-sm font-medium">{leader.assigned_class?.name || 'Administrative/Unaliased'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Col: Details & Stats */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <div className="panel">
                            <div className="panel__header border-b border-white/5">
                                <h3 className="flex items-center gap-2">
                                    <Award size={18} className="text-gold-400" />
                                    Leadership Profile
                                </h3>
                            </div>
                            <div className="panel__body">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <div className="text-xs font-bold uppercase text-gold-400 tracking-widest mb-3 flex items-center gap-2">
                                            <Briefcase size={14} /> Primary Club Responsibility
                                        </div>
                                        <div className="p-5 bg-gold-400/5 rounded-xl border border-gold-400/20 shadow-inner">
                                            <p className="text-sm leading-relaxed text-gray-200 font-medium">
                                                {leader.responsibility || 'No detailed responsibility defined.'}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs font-bold uppercase text-burgundy-300 tracking-widest mb-3 flex items-center gap-2">
                                            <Shield size={14} /> Church Governance
                                        </div>
                                        <div className="flex flex-col gap-0 bg-white/5 rounded-xl border border-white/5 overflow-hidden">
                                            <div className="flex justify-between items-center p-4">
                                                <span className="text-xs text-muted uppercase tracking-wider">Other Roles</span>
                                                <span className="text-sm font-bold text-right max-w-[60%] text-gray-200">
                                                    {leader.other_church_responsibility || 'Club Specific Staff'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs font-bold uppercase text-blue-300 tracking-widest mb-3 flex items-center gap-2">
                                            <Heart size={14} /> Personal & Faith
                                        </div>
                                        <div className="flex flex-col gap-0 bg-white/5 rounded-xl border border-white/5 overflow-hidden">
                                            <div className="flex justify-between items-center p-4 border-b border-white/5 bg-white/[0.02]">
                                                <span className="text-xs text-muted uppercase tracking-wider">Religion</span>
                                                <span className="text-sm font-bold text-gold-400">
                                                    {leader.religion?.name ?? leader.other_religion}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center p-4 bg-white/[0.01]">
                                                <span className="text-xs text-muted uppercase tracking-wider">Teaching Status</span>
                                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md ${leader.actively_teaching ? 'bg-success/20 text-success' : 'bg-white/10 text-muted'}`}>
                                                    {leader.actively_teaching ? 'Active Instructor' : 'Administrative'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* MGT Training Context (Conditional) */}
                        {isMGT && (
                            <div className="panel bg-gold-400/5 border-gold-400/20">
                                <div className="panel__header border-b border-gold-400/10">
                                    <h3 className="flex items-center gap-2 text-gold-400">
                                        <GraduationCap size={18} /> Training Progress
                                    </h3>
                                </div>
                                <div className="panel__body py-8 text-center">
                                    <p className="text-sm text-gold-400/70 mb-4 italic"> This candidate is currently undergoing Master Guide training.</p>
                                    <div className="flex justify-center gap-12">
                                        <div>
                                            <div className="text-[10px] uppercase opacity-50 mb-1">Weeks Active</div>
                                            <div className="text-2xl font-bold">12</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] uppercase opacity-50 mb-1">Requirement Logs</div>
                                            <div className="text-2xl font-bold">4/28</div>
                                        </div>
                                    </div>
                                    <button className="btn btn--primary btn--sm mt-8">View Training Log</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
