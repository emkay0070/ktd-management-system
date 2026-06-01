import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { 
    User, Mail, Phone, MapPin, Calendar, Heart, Shield, 
    ChevronLeft, Edit2, FileText, CheckCircle2, AlertCircle 
} from 'lucide-react';

export default function Details({ pathfinder }) {
    return (
        <AuthenticatedLayout
            header={pathfinder.name}
            breadcrumb={
                <div className="flex items-center gap-2 text-xs">
                    <Link href={route('dashboard', 'pathfinders')} className="hover:text-gold-400">Pathfinders</Link>
                    <span className="opacity-30">/</span>
                    <span>Candidate Bio</span>
                </div>
            }
        >
            <Head title={`${pathfinder.name} - Profile`} />

            <div className="flex flex-col gap-6 max-w-5xl mx-auto">
                {/* Top Action Bar */}
                <div className="flex justify-between items-center">
                    <Link 
                        href={route('dashboard', 'pathfinders')} 
                        className="btn btn--secondary btn--sm"
                    >
                        <ChevronLeft size={16} /> Back to Dashboard
                    </Link>
                    <Link 
                        href={route('pathfinders.edit', pathfinder.id)} 
                        className="btn btn--primary btn--sm"
                    >
                        <Edit2 size={16} /> Edit Profile
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Col: Profile Card & Quick Stats */}
                    <div className="lg:col-span-1 flex flex-col gap-6">
                        <div className="panel overflow-hidden">
                            <div className="h-32 bg-gradient-to-br from-burgundy-900 to-burgundy-600 relative">
                                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                                    <div className="h-28 w-28 rounded-3xl border-4 border-surface-800 shadow-2xl overflow-hidden bg-surface-700 flex items-center justify-center text-burgundy-400">
                                        {pathfinder.avatar_path ? (
                                            <img src={pathfinder.avatar_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={48} />
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="pt-16 pb-8 px-6 text-center">
                                <h2 className="text-xl font-bold mb-1">{pathfinder.name}</h2>
                                <p className="text-muted text-sm flex items-center justify-center gap-2">
                                    <Shield size={14} className="text-gold-400" />
                                    {pathfinder.class_assignment?.pathfinder_class?.name ?? 'No Class Assigned'}
                                </p>
                                <div className="mt-6 flex flex-wrap justify-center gap-2">
                                    <span className={`badge ${pathfinder.boarding_status === 'boarding' ? 'badge--info' : 'badge--neutral'}`}>
                                        {pathfinder.boarding_status === 'boarding' ? 'Boarder' : 'Day Scholar'}
                                    </span>
                                    {pathfinder.is_inducted && <span className="badge badge--success">Inducted</span>}
                                    {pathfinder.insured_yearly && <span className="badge badge--gold">Insured</span>}
                                </div>
                            </div>
                        </div>

                        <div className="panel p-6">
                            <h4 className="text-xs font-bold uppercase tracking-widest opacity-50 mb-6">Quick Contacts</h4>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/5 rounded-lg text-gold-400"><User size={16} /></div>
                                    <div>
                                        <div className="text-[10px] text-muted uppercase">Guardian</div>
                                        <div className="text-sm font-medium">{pathfinder.guardian_name || 'N/A'}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/5 rounded-lg text-gold-400"><Phone size={16} /></div>
                                    <div>
                                        <div className="text-[10px] text-muted uppercase">Phone</div>
                                        <div className="text-sm font-medium">{pathfinder.guardian_phone || pathfinder.phone || 'N/A'}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/5 rounded-lg text-gold-400"><MapPin size={16} /></div>
                                    <div>
                                        <div className="text-[10px] text-muted uppercase">Residence</div>
                                        <div className="text-sm font-medium">{pathfinder.residence || 'N/A'}</div>
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
                                    <FileText size={18} className="text-gold-400" />
                                    Detailed Information
                                </h3>
                            </div>
                            <div className="panel__body">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <div className="text-xs font-bold uppercase text-gold-400 tracking-widest mb-3 flex items-center gap-2">
                                            <Heart size={14} /> Family Information
                                        </div>
                                        <div className="flex flex-col gap-0 bg-white/5 rounded-xl border border-white/5 overflow-hidden">
                                            <div className="flex justify-between items-center p-4 border-b border-white/5 bg-white/[0.02]">
                                                <span className="text-xs text-muted uppercase tracking-wider">Father</span>
                                                <span className="text-sm font-bold text-gray-200">{pathfinder.father_name || '-'}</span>
                                            </div>
                                            <div className="flex justify-between items-center p-4 bg-white/[0.01]">
                                                <span className="text-xs text-muted uppercase tracking-wider">Mother</span>
                                                <span className="text-sm font-bold text-gray-200">{pathfinder.mother_name || '-'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold uppercase text-burgundy-300 tracking-widest mb-3 flex items-center gap-2">
                                            <User size={14} /> Demographics
                                        </div>
                                        <div className="flex flex-col gap-0 bg-white/5 rounded-xl border border-white/5 overflow-hidden">
                                            <div className="flex justify-between items-center p-4 border-b border-white/5 bg-white/[0.02]">
                                                <span className="text-xs text-muted uppercase tracking-wider">Age / Gender</span>
                                                <span className="text-sm font-bold text-gray-200">{pathfinder.age}y / {pathfinder.gender}</span>
                                            </div>
                                            <div className="flex justify-between items-center p-4 bg-white/[0.01]">
                                                <span className="text-xs text-muted uppercase tracking-wider">Religion</span>
                                                <span className="text-sm font-bold text-gold-400">{pathfinder.religion?.name ?? pathfinder.other_religion}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold uppercase text-blue-300 tracking-widest mb-3 flex items-center gap-2">
                                            <Shield size={14} /> Club Status
                                        </div>
                                        <div className="flex flex-col gap-0 bg-white/5 rounded-xl border border-white/5 overflow-hidden">
                                            <div className="flex justify-between items-center p-4 border-b border-white/5 bg-white/[0.02]">
                                                <span className="text-xs text-muted uppercase tracking-wider">Unit Membership</span>
                                                <span className="text-sm font-bold text-gray-200">{pathfinder.unit_membership?.unit?.name ?? 'None'}</span>
                                            </div>
                                            <div className="flex justify-between items-center p-4 bg-white/[0.01]">
                                                <span className="text-xs text-muted uppercase tracking-wider">School Class</span>
                                                <span className="text-sm font-bold text-gray-200">{pathfinder.school_class || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold uppercase text-danger/70 tracking-widest mb-3 flex items-center gap-2">
                                            <AlertCircle size={14} /> Health & Safety
                                        </div>
                                        <div className="flex flex-col gap-0 bg-white/5 rounded-xl border border-white/5 overflow-hidden">
                                            <div className="flex justify-between items-center p-4 border-b border-white/5 bg-white/[0.02]">
                                                <span className="text-xs text-muted uppercase tracking-wider">Medical Alert</span>
                                                <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded ${pathfinder.medical_conditions ? 'bg-danger/20 text-danger' : 'bg-success/20 text-success'}`}>
                                                    {pathfinder.medical_conditions ? 'Active Alert' : 'Cleared'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center p-4 bg-white/[0.01]">
                                                <span className="text-xs text-muted uppercase tracking-wider">Consent Form</span>
                                                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded bg-success/20 text-success">
                                                    Signed Active
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {pathfinder.medical_conditions && (
                                    <div className="mt-8 p-4 bg-danger/5 border border-danger/10 rounded-xl text-sm flex gap-3">
                                        <AlertCircle size={18} className="text-danger flex-shrink-0" />
                                        <div>
                                            <div className="font-bold text-danger mb-1 uppercase text-[10px] tracking-widest">Medical Notes</div>
                                            <div className="text-muted-foreground">{pathfinder.medical_conditions}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Activity / Timeline Placeholder */}
                        <div className="panel">
                            <div className="panel__header border-b border-white/5">
                                <h3 className="flex items-center gap-2 text-sm font-bold opacity-70">
                                    <Calendar size={16} /> Membership Timeline
                                </h3>
                            </div>
                            <div className="panel__body py-8 flex flex-col items-center justify-center text-center opacity-30">
                                <div className="w-1 px-1 bg-white/5 h-12 mb-4"></div>
                                <div className="text-xs">Timeline history feature coming soon</div>
                                <p className="text-[10px] max-w-[200px] mt-1">This will track promotions, honors, and induction milestones.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
