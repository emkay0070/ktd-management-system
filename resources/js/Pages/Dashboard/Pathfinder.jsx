import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Trophy, GraduationCap, Shield, Megaphone, CheckCircle2, Star, BookOpen, Clock } from 'lucide-react';
import CurriculumChecklist from './Partials/CurriculumChecklist';

export default function PathfinderDashboard({ profile, announcements = [], curriculum = [] }) {
    return (
        <AuthenticatedLayout 
            header="Pathfinder Dashboard" 
            breadcrumb="Pathfinder → My Journey"
        >
            <Head title="Pathfinder Dashboard — EmPFC" />

            {!profile ? (
                <div className="flex items-center justify-center py-20 bg-burgundy-900/10 border border-burgundy-500/10 rounded-3xl text-center">
                    <div className="max-w-md px-6">
                        <GraduationCap size={48} className="mx-auto text-gray-600 mb-6" />
                        <h2 className="text-xl font-black text-white mb-3">Profile Link Required</h2>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6">Your user account is not yet linked to an official Pathfinder record. Please ask your Club Director to link your account to your Pathfinder profile.</p>
                        <div className="p-3 bg-white/5 rounded-xl text-[11px] font-bold text-gray-500 uppercase tracking-widest border border-white/5">
                            Status: Waiting for Association
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Hero Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="stat-card stat-card--burgundy">
                            <div className="stat-icon stat-icon--burgundy">
                                <GraduationCap size={20} />
                            </div>
                            <div className="stat-value">{profile.assigned_class?.name || 'Unassigned'}</div>
                            <div className="stat-label uppercase tracking-widest text-[10px]">Current Class</div>
                        </div>

                        <div className="stat-card stat-card--gold">
                            <div className="stat-icon stat-icon--gold">
                                <Shield size={20} />
                            </div>
                            <div className="stat-value">{profile.unit?.name || 'No Unit'}</div>
                            <div className="stat-label uppercase tracking-widest text-[10px]">Assigned Unit</div>
                        </div>

                        <div className="stat-card stat-card--success">
                            <div className="stat-icon stat-icon--success">
                                <Trophy size={20} />
                            </div>
                            <div className="stat-value">{profile.registrations?.length || 0}</div>
                            <div className="stat-label uppercase tracking-widest text-[10px]">District Events</div>
                        </div>

                        <div className="stat-card stat-card--info">
                            <div className="stat-icon stat-icon--info">
                                <CheckCircle2 size={20} />
                            </div>
                            <div className="stat-value">{profile.is_inducted ? 'Yes' : 'No'}</div>
                            <div className="stat-label uppercase tracking-widest text-[10px]">Inducted Status</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left: Progress & Tasks */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="panel overflow-hidden">
                                <div className="panel__header">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-burgundy-900/50 rounded-lg text-burgundy-400">
                                            <Star size={20} />
                                        </div>
                                        <div>
                                            <h3>My Class Journey</h3>
                                            <p>Track your requirements for {profile.assigned_class?.name || 'Class'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="panel__body p-6">
                                    <CurriculumChecklist 
                                        curriculum={curriculum} 
                                        progress={profile.progress || []} 
                                    />
                                </div>
                            </div>

                            <div className="panel">
                                <div className="panel__header">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gold-900/50 rounded-lg text-gold-400">
                                            <Trophy size={20} />
                                        </div>
                                        <div>
                                            <h3>My Events</h3>
                                            <p>Personal registrations for camporees & fairs</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="panel__body p-0">
                                    <div className="table-responsive">
                                        <table className="h-table">
                                            <thead>
                                                <tr>
                                                    <th>Event Name</th>
                                                    <th>Date</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {profile.registrations?.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="3" className="py-8 text-center text-gray-500 italic">No event registrations found</td>
                                                    </tr>
                                                ) : (
                                                    profile.registrations.map(reg => (
                                                        <tr key={reg.id}>
                                                            <td className="cell-primary font-bold">{reg.event?.name}</td>
                                                            <td className="text-xs uppercase font-bold text-gray-500">{reg.event?.start_date}</td>
                                                            <td>
                                                                <span className={`badge badge--${reg.status === 'approved' ? 'success' : 'warning'}`}>
                                                                    {reg.status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Bulletins & Club Info */}
                        <div className="space-y-6">
                            <div className="panel bg-burgundy-900/10 border-burgundy-500/20">
                                <div className="panel__header border-burgundy-500/10">
                                    <div className="flex items-center gap-2">
                                        <Megaphone size={16} className="text-burgundy-400" />
                                        <h3 className="text-burgundy-400 uppercase tracking-widest font-black text-xs">Official Alerts</h3>
                                    </div>
                                </div>
                                <div className="panel__body">
                                    {announcements.length === 0 ? (
                                        <p className="text-xs text-gray-500 italic">No new announcements from the District.</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {announcements.map(item => (
                                                <div key={item.id} className="p-4 bg-white/5 rounded-xl border border-white/10">
                                                    <div className="font-bold text-white text-sm mb-1">{item.title}</div>
                                                    <div className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">{item.content}</div>
                                                    <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-widest font-black text-burgundy-400/60">
                                                        <span className="flex items-center gap-1"><Clock size={10} /> {new Date(item.created_at).toLocaleDateString()}</span>
                                                        <button className="hover:text-white transition-colors">Read Full</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="panel">
                                <div className="panel__header">
                                    <h3>My Church Club</h3>
                                </div>
                                <div className="panel__body">
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4">
                                        <div className="p-3 bg-burgundy-500 rounded-xl text-white">
                                            <Shield size={20} />
                                        </div>
                                        <div>
                                            <div className="font-bold text-white uppercase tracking-tight text-sm">
                                                {profile.church?.name || 'Local Club'}
                                            </div>
                                            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Central District</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
