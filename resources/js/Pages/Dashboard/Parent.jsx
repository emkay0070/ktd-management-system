import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Users, Link2, Calendar, Heart, GraduationCap, Shield, ChevronRight, Clock } from 'lucide-react';

export default function ParentDashboard({ profile, children = [], requests = [] }) {
    return (
        <AuthenticatedLayout 
            header="Parent Dashboard" 
            breadcrumb="Parent → Family Overview"
        >
            <Head title="Family Dashboard — EmPFC" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="stat-card stat-card--burgundy text-white">
                    <div className="stat-icon stat-icon--burgundy">
                        <Users size={20} />
                    </div>
                    <div className="stat-value">{children.length}</div>
                    <div className="stat-label uppercase tracking-widest text-[10px]">Linked Pathfinders</div>
                </div>

                <div className="stat-card stat-card--gold">
                    <div className="stat-icon stat-icon--gold">
                        <Link2 size={20} />
                    </div>
                    <div className="stat-value">{requests.length}</div>
                    <div className="stat-label uppercase tracking-widest text-[10px]">Pending Links</div>
                </div>

                <div className="stat-card stat-card--info">
                    <div className="stat-icon stat-icon--info">
                        <Calendar size={20} />
                    </div>
                    <div className="stat-value">Active</div>
                    <div className="stat-label uppercase tracking-widest text-[10px]">Club Participation</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Children List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="panel">
                        <div className="panel__header">
                            <div>
                                <h3>Your Registered Children</h3>
                                <p>Manage profiles and view activity for linked pathfinders</p>
                            </div>
                        </div>
                        <div className="panel__body">
                            {children.length === 0 ? (
                                <div className="text-center py-12 bg-white/5 rounded-xl border border-dashed border-white/10">
                                    <Users size={32} className="mx-auto text-gray-600 mb-4" />
                                    <p className="text-gray-400 font-medium">No children linked to your account yet.</p>
                                    <p className="text-[11px] text-gray-500 mt-1 uppercase tracking-widest font-bold">Director approval required for automatic links</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {children.map(child => (
                                        <div key={child.id} className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-burgundy-500/30 transition-all group">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-full bg-burgundy-900/40 flex items-center justify-center text-burgundy-400 border border-burgundy-500/20 overflow-hidden font-black text-xl">
                                                        {child.avatar_url ? (
                                                            <img src={child.avatar_url} className="h-full w-full object-cover" />
                                                        ) : (
                                                            child.name.substring(0, 1)
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white group-hover:text-burgundy-400 transition-colors">{child.name}</div>
                                                        <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold font-mono tracking-tighter">ID: {String(child.id).padStart(5, '0')}</div>
                                                    </div>
                                                </div>
                                                <span className="badge badge--success">Enrolled</span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/5">
                                                <div className="flex items-center gap-2 text-gray-400">
                                                    <GraduationCap size={14} className="text-gold-500" />
                                                    <span className="text-[11px] font-bold uppercase tracking-tight truncate">
                                                        {child.assigned_class?.name || 'No Class'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-400">
                                                    <Shield size={14} className="text-burgundy-400" />
                                                    <span className="text-[11px] font-bold uppercase tracking-tight truncate">
                                                        {child.unit?.name || 'No Unit'}
                                                    </span>
                                                </div>
                                            </div>

                                            <button className="w-full mt-4 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-bold text-gray-300 uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                                                View Records <ChevronRight size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Link Requests & Summary */}
                <div className="space-y-6">
                    <div className="panel bg-burgundy-900/10 border-burgundy-500/20">
                        <div className="panel__header border-burgundy-500/10">
                            <div>
                                <h3 className="text-burgundy-400 uppercase tracking-widest font-black text-xs">Pending Links</h3>
                                <p className="text-[11px] text-burgundy-900/60 uppercase font-black">Waiting for Director approval</p>
                            </div>
                        </div>
                        <div className="panel__body">
                            {requests.length === 0 ? (
                                <p className="text-xs text-gray-500 italic">No pending link requests found.</p>
                            ) : (
                                <div className="space-y-3">
                                    {requests.map(request => (
                                        <div key={request.id} className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-burgundy-500/20 flex items-center justify-center text-burgundy-400">
                                                    <Clock size={16} />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-white">{request.pathfinder.name}</div>
                                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest">Automatic Match</div>
                                                </div>
                                            </div>
                                            <div className="px-2 py-1 bg-gold-400/10 text-gold-400 rounded text-[9px] font-bold uppercase tracking-widest animate-pulse">
                                                Pending
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="panel">
                        <div className="panel__header">
                            <div>
                                <h3>Family Medical Consent</h3>
                                <p>Mandatory for all district events</p>
                            </div>
                        </div>
                        <div className="panel__body">
                            <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/20 text-orange-400 flex items-start gap-3">
                                <Heart size={18} className="flex-shrink-0 mt-1" />
                                <div>
                                    <div className="font-bold text-sm">Action Required</div>
                                    <div className="text-[11px] opacity-80 mt-1 leading-relaxed">
                                        Please ensure medical forms are signed for each child for the upcoming Camporee season.
                                    </div>
                                    <button className="mt-2 text-[10px] font-black uppercase underline tracking-widest hover:text-white transition-all">Update Medical Forms</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
