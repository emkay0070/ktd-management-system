import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { GraduationCap, BookOpen, Trophy, ClipboardCheck, Star, Users, Calendar, MapPin, CheckCircle2 } from 'lucide-react';
import ClassRoster from './Partials/ClassRoster';

export default function MasterGuideDashboard({ profile, tasks = [], roster = [], curriculum = [] }) {
    return (
        <AuthenticatedLayout 
            header="Master Guide Portal" 
            breadcrumb="Leadership → MG Workspace"
        >
            <Head title="Master Guide Dashboard — EmPFC" />

            {!profile ? (
                <div className="flex items-center justify-center py-20 bg-burgundy-900/10 border border-burgundy-500/10 rounded-3xl text-center">
                    <div className="max-w-md px-6">
                        <Star size={48} className="mx-auto text-gray-600 mb-6" />
                        <h2 className="text-xl font-black text-white mb-3">MG Association Required</h2>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6">Your account is not yet linked to an official Master Guide profile. Please ask your Club Director to link your account to your Master Guide record.</p>
                        <div className="p-3 bg-white/5 rounded-xl text-[11px] font-bold text-gray-500 uppercase tracking-widest border border-white/5">
                            Status: Leadership Credentials Pending
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* MG Header Info */}
                    <div className="panel bg-gradient-to-br from-burgundy-900/40 via-surface-800 to-surface-800 border-burgundy-500/20">
                        <div className="panel__body flex flex-col md:flex-row items-center gap-8 p-8">
                            <div className="relative">
                                <div className="h-24 w-24 rounded-2xl bg-burgundy-500 flex items-center justify-center text-white border-4 border-white/5 shadow-2xl relative z-10 font-black text-4xl">
                                    {profile.avatar_url ? (
                                        <img src={profile.avatar_url} className="h-full w-full object-cover" />
                                    ) : (
                                        profile.full_name?.substring(0, 1)
                                    )}
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-gold-500 text-burgundy-900 p-1.5 rounded-lg shadow-xl z-20">
                                    <Star size={16} fill="currentColor" />
                                </div>
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h1 className="text-3xl font-black text-white mb-1 uppercase tracking-tight">{profile.full_name}</h1>
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3">
                                    <div className="flex items-center gap-2 text-gold-400 font-bold uppercase tracking-widest text-[11px]">
                                        <GraduationCap size={16} /> {profile.role || 'Invested Master Guide'}
                                    </div>
                                    <div className="h-1 w-1 bg-white/20 rounded-full hidden md:block"></div>
                                    <div className="flex items-center gap-2 text-gray-500 font-bold uppercase tracking-widest text-[11px]">
                                        <MapPin size={16} /> {profile.church?.name || 'Local Club'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="stat-card stat-card--burgundy">
                            <div className="stat-icon stat-icon--burgundy">
                                <Users size={20} />
                            </div>
                            <div className="stat-value">{profile.assigned_class?.name || 'General'}</div>
                            <div className="stat-label uppercase tracking-widest text-[10px]">Teaching Class</div>
                        </div>

                        <div className="stat-card stat-card--gold">
                            <div className="stat-icon stat-icon--gold">
                                <BookOpen size={20} />
                            </div>
                            <div className="stat-value">{profile.trainings?.length || 0}</div>
                            <div className="stat-label uppercase tracking-widest text-[10px]">Specialties Logged</div>
                        </div>

                        <div className="stat-card stat-card--success">
                            <div className="stat-icon stat-icon--success">
                                <CheckCircle2 size={20} />
                            </div>
                            <div className="stat-value">{profile.actively_teaching ? 'True' : 'False'}</div>
                            <div className="stat-label uppercase tracking-widest text-[10px]">Active Service</div>
                        </div>

                        <div className="stat-card stat-card--info">
                            <div className="stat-icon stat-icon--info">
                                <ClipboardCheck size={20} />
                            </div>
                            <div className="stat-value">{profile.insured_yearly ? 'Yes' : 'No'}</div>
                            <div className="stat-label uppercase tracking-widest text-[10px]">Insurance status</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Class Workspace */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="panel">
                                <div className="panel__header">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-burgundy-900/50 rounded-lg text-burgundy-400">
                                            <GraduationCap size={20} />
                                        </div>
                                        <div>
                                            <h3>{profile.assigned_class?.name || 'Class'} Workspace</h3>
                                            <p>Manage curriculum and student progress</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="panel__body p-6">
                                    <ClassRoster roster={roster} curriculum={curriculum} />
                                </div>
                            </div>

                            <div className="panel">
                                <div className="panel__header">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gold-900/50 rounded-lg text-gold-400">
                                            <ClipboardCheck size={20} />
                                        </div>
                                        <div>
                                            <h3>Training & Skills</h3>
                                            <p>Your leadership specialty tracking</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="panel__body p-0">
                                    <div className="table-responsive">
                                        <table className="h-table">
                                            <thead>
                                                <tr>
                                                    <th>Training Type</th>
                                                    <th>Specialty</th>
                                                    <th>Score</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {profile.trainings?.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="3" className="py-8 text-center text-gray-500 italic">No training sessions logged</td>
                                                    </tr>
                                                ) : (
                                                    profile.trainings.map(t => (
                                                        <tr key={t.id}>
                                                            <td className="cell-primary font-bold">{t.training_type}</td>
                                                            <td className="text-xs uppercase font-bold text-gray-400">{t.specialty_name}</td>
                                                            <td>
                                                                <span className="badge badge--gold">{t.score || 'P'}</span>
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

                        {/* District Tasks & Side Stats */}
                        <div className="space-y-6">
                            <div className="panel bg-burgundy-900/10 border-burgundy-500/20">
                                <div className="panel__header border-burgundy-500/10">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} className="text-burgundy-400" />
                                        <h3 className="text-burgundy-400 uppercase tracking-widest font-black text-xs">District Competitions</h3>
                                    </div>
                                </div>
                                <div className="panel__body">
                                    {tasks.length === 0 ? (
                                        <p className="text-xs text-gray-500 italic">No active district tasks found.</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {tasks.map(task => (
                                                <div key={task.id} className="p-4 bg-white/5 rounded-xl border border-white/10 group hover:border-burgundy-500/30 transition-all">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="font-bold text-white text-sm group-hover:text-burgundy-400 transition-colors uppercase tracking-tight">{task.title}</div>
                                                        <Trophy size={14} className="text-gold-500" />
                                                    </div>
                                                    <div className="text-[10px] text-gray-400 font-medium">Deadline: {task.deadline}</div>
                                                    <div className="mt-3 flex items-center justify-between text-[11px] font-black uppercase tracking-widest text-burgundy-400/60">
                                                        <span>{task.points || 0} Points</span>
                                                        <button className="hover:text-white transition-colors">Details</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="panel">
                                <div className="panel__header">
                                    <h3>Leadership Responsibility</h3>
                                </div>
                                <div className="panel__body">
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                        <div className="text-[10px] text-gray-500 uppercase tracking-widest font-black mb-2">Primary Rule</div>
                                        <div className="font-bold text-white uppercase text-sm mb-4">
                                            {profile.responsibility || 'Club Instructor'}
                                        </div>
                                        <div className="p-3 bg-burgundy-500/10 border border-burgundy-500/20 rounded-xl text-burgundy-400 flex items-center gap-2 text-xs font-bold leading-tight">
                                            <Shield size={16} className="flex-shrink-0" />
                                            Active leadership participation verified.
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
