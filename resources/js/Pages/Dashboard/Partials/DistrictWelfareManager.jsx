import React, { useState, useMemo } from 'react';
import { useForm, router } from '@inertiajs/react';
import { 
    Heart, Users, Calendar, Award, AlertTriangle, ClipboardList, BarChart3, 
    Plus, Search, Filter, Clock, User, Home, TrendingDown, UserMinus, 
    Gift, GraduationCap, PartyPopper, LifeBuoy, CheckCircle2, MoreVertical,
    MessageSquare, Activity, ShieldAlert
} from 'lucide-react';
import DistrictAppraisalManager from './DistrictAppraisalManager';

export default function DistrictWelfareManager({ 
    welfare_cases = [], 
    social_events = [], 
    retention_metrics = {}, 
    churches = [],
    appraisals = [],
    readonly, 
    auth 
}) {
    const [activeTab, setActiveTab] = useState('overview');
    const [search, setSearch] = useState('');

    const userRoles = auth?.user?.role_names || [];
    const isCoordinator = userRoles.includes('district_welfare_coordinator');
    const isDirector = userRoles.includes('district_director') || userRoles.includes('super_admin');

    const caseForm = useForm({
        church_id: '',
        beneficiary_name: '',
        category: 'Illness',
        description: '',
        status: 'open'
    });

    const eventForm = useForm({
        title: '',
        description: '',
        event_date: '',
        category: 'Fellowship',
        budget: 0
    });

    const categories = ['Illness', 'Bereavement', 'Financial', 'Emergency', 'Social Support', 'Other'];
    const eventCategories = ['Fellowship', 'Sports', 'Retreat', 'Team Building', 'Family Day', 'Community Service'];

    const stats = useMemo(() => {
        return {
            openCases: welfare_cases.filter(c => c.status === 'open' || c.status === 'review').length,
            upcomingEvents: social_events.filter(e => new Date(e.event_date) > new Date()).length,
            inactiveMembers: retention_metrics.inactive_members?.length || 0,
            avgEngagement: 85, // Placeholder for now
        };
    }, [welfare_cases, social_events, retention_metrics]);

    const handleCreateCase = (e) => {
        e.preventDefault();
        caseForm.post(route('welfare.cases.store'), {
            onSuccess: () => {
                caseForm.reset();
                // Close modal if we had one
            }
        });
    };

    const handleUpdateCaseStatus = (id, status) => {
        router.put(route('welfare.cases.update', id), { status }, { preserveScroll: true });
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Header Panel */}
            <div className="panel p-0 overflow-hidden">
                <div className="p-6 border-b border-white/5 bg-white/[0.01]">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h3 className="flex items-center gap-2">
                                <Heart className="text-burgundy-500" size={24} />
                                Welfare & Social Command Centre
                            </h3>
                            <p className="text-sm text-gray-500">Managing member wellbeing, retention, and social unity across the district.</p>
                        </div>
                        <div className="flex bg-white/5 p-1 rounded-xl flex-wrap">
                            {[
                                { id: 'overview', icon: Activity, label: 'Overview' },
                                { id: 'cases', icon: Heart, label: 'Welfare Cases' },
                                { id: 'engagement', icon: TrendingDown, label: 'Retention' },
                                { id: 'events', icon: Calendar, label: 'Socials' },
                                { id: 'recognition', icon: Award, label: 'Recognition' },
                                { id: 'crisis', icon: ShieldAlert, label: 'Crisis' },
                                { id: 'appraisals', icon: MessageSquare, label: 'Appraisals' },
                            ].map(tab => (
                                <button 
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)} 
                                    className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-gold-500 text-black shadow-lg shadow-gold-500/20' : 'text-gray-400 hover:text-white'}`}
                                >
                                    <tab.icon size={14} /> {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {activeTab === 'overview' && (
                    <div className="p-6 space-y-8 fade-in">
                        {/* Summary Widgets */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-surface-800 border border-white/5 p-4 rounded-2xl group hover:border-burgundy-500/30 transition-all">
                                <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Active Cases</div>
                                <div className="text-3xl font-black text-white flex items-center gap-2">
                                    {stats.openCases}
                                    {stats.openCases > 0 && <span className="w-2 h-2 rounded-full bg-burgundy-500 animate-pulse"></span>}
                                </div>
                                <div className="text-[10px] text-burgundy-400 font-bold mt-2 uppercase tracking-tighter">Needs immediate attention</div>
                            </div>
                            <div className="bg-surface-800 border border-white/5 p-4 rounded-2xl group hover:border-gold-500/30 transition-all">
                                <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Upcoming Socials</div>
                                <div className="text-3xl font-black text-white">{stats.upcomingEvents}</div>
                                <div className="text-[10px] text-gold-500 font-bold mt-2 uppercase tracking-tighter">District unity activities</div>
                            </div>
                            <div className="bg-surface-800 border border-white/5 p-4 rounded-2xl group hover:border-info-500/30 transition-all">
                                <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Inactive Members</div>
                                <div className="text-3xl font-black text-white">{stats.inactiveMembers}</div>
                                <div className="text-[10px] text-info-400 font-bold mt-2 uppercase tracking-tighter">At risk of dropping out</div>
                            </div>
                            <div className="bg-surface-800 border border-white/5 p-4 rounded-2xl group hover:border-success-500/30 transition-all">
                                <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Engagement Score</div>
                                <div className="text-3xl font-black text-success-400">{stats.avgEngagement}%</div>
                                <div className="text-[10px] text-success-500/60 font-bold mt-2 uppercase tracking-tighter">District wellbeing health</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Urgent Welfare Alerts */}
                            <div className="panel bg-white/[0.01] border-white/5">
                                <div className="p-4 border-b border-white/5 flex justify-between items-center">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                        <AlertTriangle size={14} className="text-burgundy-500" />
                                        Urgent Welfare Alerts
                                    </h4>
                                    <button onClick={() => setActiveTab('cases')} className="text-[10px] text-gold-500 font-bold uppercase hover:underline">View All</button>
                                </div>
                                <div className="p-4 space-y-4">
                                    {welfare_cases.filter(c => c.status === 'open').slice(0, 3).map(c => (
                                        <div key={c.id} className="flex gap-4 p-3 rounded-xl bg-white/5 border border-white/5">
                                            <div className="w-10 h-10 rounded-lg bg-burgundy-500/10 text-burgundy-400 flex items-center justify-center shrink-0">
                                                <Heart size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <span className="text-[10px] font-black uppercase text-burgundy-400">{c.category}</span>
                                                    <span className="text-[9px] text-gray-500">{new Date(c.created_at).toLocaleDateString()}</span>
                                                </div>
                                                <div className="text-sm font-bold text-white mb-1">{c.beneficiary_name || c.beneficiary?.name}</div>
                                                <div className="text-xs text-gray-500 line-clamp-1">{c.description}</div>
                                            </div>
                                        </div>
                                    ))}
                                    {welfare_cases.filter(c => c.status === 'open').length === 0 && (
                                        <div className="py-8 text-center text-gray-600 text-xs italic">No urgent welfare alerts.</div>
                                    )}
                                </div>
                            </div>

                            {/* Upcoming Fellowship */}
                            <div className="panel bg-white/[0.01] border-white/5">
                                <div className="p-4 border-b border-white/5 flex justify-between items-center">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                        <Calendar size={14} className="text-gold-500" />
                                        Social Calendar
                                    </h4>
                                    <button onClick={() => setActiveTab('events')} className="text-[10px] text-gold-500 font-bold uppercase hover:underline">Manage Events</button>
                                </div>
                                <div className="p-4 space-y-4">
                                    {social_events.filter(e => new Date(e.event_date) > new Date()).slice(0, 3).map(e => (
                                        <div key={e.id} className="flex gap-4 p-3 rounded-xl bg-white/5 border border-white/5">
                                            <div className="w-10 h-10 rounded-lg bg-gold-500/10 text-gold-500 flex items-center justify-center shrink-0">
                                                <PartyPopper size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <span className="text-[10px] font-black uppercase text-gold-400">{e.category}</span>
                                                    <span className="text-[9px] text-gray-500">{new Date(e.event_date).toLocaleDateString()}</span>
                                                </div>
                                                <div className="text-sm font-bold text-white mb-1">{e.title}</div>
                                                <div className="text-xs text-gray-500 line-clamp-1">{e.description}</div>
                                            </div>
                                        </div>
                                    ))}
                                    {social_events.filter(e => new Date(e.event_date) > new Date()).length === 0 && (
                                        <div className="py-8 text-center text-gray-600 text-xs italic">No upcoming social events planned.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'cases' && (
                    <div className="p-6 fade-in space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h4 className="text-white font-bold">Welfare Case Management</h4>
                                <p className="text-xs text-gray-500">Track and coordinate support for members facing life challenges.</p>
                            </div>
                            {!readonly && (
                                <button className="btn btn--primary btn--sm" onClick={() => {/* Show Case Modal */}}>
                                    <Plus size={16} className="mr-2" /> Open New Case
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {welfare_cases.map(c => (
                                <div key={c.id} className={`panel p-5 bg-surface-800 border border-white/5 group hover:border-burgundy-500/20 transition-all ${c.status === 'closed' ? 'opacity-60' : ''}`}>
                                    <div className="flex flex-col md:flex-row justify-between gap-6">
                                        <div className="flex gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                                                c.status === 'open' ? 'bg-burgundy-500/20 text-burgundy-400' :
                                                c.status === 'review' ? 'bg-gold-500/20 text-gold-400' :
                                                'bg-success-500/20 text-success-400'
                                            }`}>
                                                <Heart size={24} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-white/5 text-gray-400">{c.category}</span>
                                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                                                        c.status === 'open' ? 'bg-burgundy-500/10 text-burgundy-400' :
                                                        c.status === 'review' ? 'bg-gold-500/10 text-gold-400' :
                                                        'bg-success-500/10 text-success-400'
                                                    }`}>
                                                        {c.status.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                <h4 className="text-white font-bold text-lg leading-tight">{c.beneficiary_name || c.beneficiary?.name}</h4>
                                                <div className="text-[10px] text-gray-500 uppercase font-black flex items-center gap-2 mt-1">
                                                    <Home size={10} /> {c.church?.name || 'District Direct'} • 
                                                    <User size={10} /> Created by {c.creator?.name}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex-1 max-w-md">
                                            <p className="text-xs text-gray-400 leading-relaxed italic">"{c.description}"</p>
                                            {c.support_provided && (
                                                <div className="mt-3 pt-3 border-t border-white/5">
                                                    <div className="text-[9px] font-black uppercase text-success-400 mb-1">Support Provided:</div>
                                                    <p className="text-xs text-gray-500">{c.support_provided}</p>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col justify-between items-end gap-4">
                                            <div className="flex gap-2">
                                                {!readonly && (
                                                    <>
                                                        {c.status === 'open' && (
                                                            <button onClick={() => handleUpdateCaseStatus(c.id, 'review')} className="btn btn--sm btn--ghost text-gold-400">Under Review</button>
                                                        )}
                                                        {c.status === 'review' && (
                                                            <button onClick={() => handleUpdateCaseStatus(c.id, 'assisted')} className="btn btn--sm btn--ghost text-success-400">Mark Assisted</button>
                                                        )}
                                                        {c.status !== 'closed' && (
                                                            <button onClick={() => handleUpdateCaseStatus(c.id, 'closed')} className="btn btn--sm btn--ghost text-gray-500">Close Case</button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                            <div className="text-[9px] text-gray-600 font-black uppercase tracking-widest">
                                                Last updated {new Date(c.updated_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {welfare_cases.length === 0 && (
                                <div className="p-20 text-center bg-white/[0.01] rounded-2xl border border-dashed border-white/5">
                                    <LifeBuoy size={48} className="mx-auto mb-4 opacity-10" />
                                    <h4 className="text-gray-500 font-bold uppercase tracking-widest">No welfare cases</h4>
                                    <p className="text-xs text-gray-600">The Social & Welfare Coordinator can track support needs here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'engagement' && (
                    <div className="p-6 fade-in space-y-6">
                        <div>
                            <h4 className="text-white font-bold">Retention & Engagement Audit</h4>
                            <p className="text-xs text-gray-500">Identifying members at risk of dropping out and clubs needing stability support.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Inactive Members List */}
                            <div className="panel bg-white/[0.01] border-white/5">
                                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-burgundy-500/5">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-burgundy-400 flex items-center gap-2">
                                        <UserMinus size={14} />
                                        Inactive Members (30+ Days)
                                    </h4>
                                    <span className="badge badge--burgundy badge--sm">{retention_metrics.inactive_members?.length || 0}</span>
                                </div>
                                <div className="table-responsive">
                                    <table className="h-table h-table--sm">
                                        <thead>
                                            <tr>
                                                <th>Member</th>
                                                <th>Club</th>
                                                <th className="text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {retention_metrics.inactive_members?.map(m => (
                                                <tr key={m.id}>
                                                    <td className="cell-primary font-bold">
                                                        <div className="text-white">{m.name}</div>
                                                        <div className="text-[9px] text-gray-500 uppercase">{m.gender} • {m.age}yrs</div>
                                                    </td>
                                                    <td><div className="text-[10px] text-gray-400 uppercase font-black">{m.church?.name}</div></td>
                                                    <td className="text-right">
                                                        <button className="btn btn--xs btn--ghost text-gold-500">Assign Follow-up</button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {(!retention_metrics.inactive_members || retention_metrics.inactive_members.length === 0) && (
                                                <tr>
                                                    <td colSpan="3" className="text-center py-8 text-gray-600 italic text-xs">No inactive members flagged.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Declining Clubs Widget */}
                            <div className="panel bg-white/[0.01] border-white/5">
                                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-orange-500/5">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-orange-400 flex items-center gap-2">
                                        <TrendingDown size={14} />
                                        Clubs with Declining Attendance
                                    </h4>
                                    <span className="badge badge--orange badge--sm">{retention_metrics.declining_clubs?.length || 0}</span>
                                </div>
                                <div className="table-responsive">
                                    <table className="h-table h-table--sm">
                                        <thead>
                                            <tr>
                                                <th>Club</th>
                                                <th>Trend</th>
                                                <th className="text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {retention_metrics.declining_clubs?.map(c => (
                                                <tr key={c.id}>
                                                    <td className="cell-primary font-bold">
                                                        <div className="text-white">{c.name}</div>
                                                        <div className="text-[9px] text-gray-500 uppercase">District Member</div>
                                                    </td>
                                                    <td>
                                                        <div className="flex flex-col">
                                                            <div className="text-[10px] text-danger-400 font-bold flex items-center gap-1">
                                                                <TrendingDown size={10} /> -{c.decline}%
                                                            </div>
                                                            <div className="text-[8px] text-gray-600 uppercase font-black">
                                                                {c.prev_30}% → {c.last_30}%
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="text-right">
                                                        <button className="btn btn--xs btn--ghost text-gold-500">Stability Review</button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {(!retention_metrics.declining_clubs || retention_metrics.declining_clubs.length === 0) && (
                                                <tr>
                                                    <td colSpan="3" className="text-center py-8 text-gray-600 italic text-xs">No clubs showing significant decline.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'events' && (
                    <div className="p-6 fade-in space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h4 className="text-white font-bold">Social Events & Fellowship</h4>
                                <p className="text-xs text-gray-500">Coordinating district-wide sports, retreats, and team-building gatherings.</p>
                            </div>
                            {!readonly && (
                                <button className="btn btn--primary btn--sm">
                                    <Plus size={16} className="mr-2" /> Plan Social Event
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {social_events.map(event => (
                                <div key={event.id} className="panel p-0 overflow-hidden border border-white/5 group hover:border-gold-500/30 transition-all">
                                    <div className="p-5 bg-white/[0.02] border-b border-white/5">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-gold-500/10 text-gold-500">{event.category}</span>
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                                                event.status === 'completed' ? 'bg-success-500/10 text-success-400' : 'bg-white/5 text-gray-400'
                                            }`}>{event.status}</span>
                                        </div>
                                        <h4 className="text-white font-bold text-lg">{event.title}</h4>
                                        <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-1">
                                            <Clock size={12} /> {new Date(event.event_date).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <p className="text-xs text-gray-400 line-clamp-2 h-8 mb-4">{event.description || 'No description provided.'}</p>
                                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black text-gray-600 uppercase">Budget</span>
                                                <span className="text-[11px] font-bold text-white">UGX {parseFloat(event.budget).toLocaleString()}</span>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-[9px] font-black text-gray-600 uppercase">Attendance</span>
                                                <span className="text-[11px] font-bold text-info-400">{event.attendance_count || 0} Members</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'recognition' && (
                    <div className="p-20 text-center fade-in bg-white/[0.01]">
                        <Award size={48} className="mx-auto mb-4 text-gold-500 animate-bounce" />
                        <h4 className="text-white font-bold uppercase tracking-widest">Recognition Centre</h4>
                        <p className="text-xs text-gray-500 max-w-sm mx-auto mt-2">
                            Coming Soon: Celebrate birthdays, service anniversaries, and leadership milestones across the district.
                        </p>
                        <div className="mt-8 grid grid-cols-3 gap-4 max-w-xl mx-auto opacity-20 grayscale">
                            <div className="panel p-4 flex flex-col items-center gap-2">
                                <Gift size={24} />
                                <span className="text-[8px] font-black uppercase">Birthdays</span>
                            </div>
                            <div className="panel p-4 flex flex-col items-center gap-2">
                                <GraduationCap size={24} />
                                <span className="text-[8px] font-black uppercase">Graduations</span>
                            </div>
                            <div className="panel p-4 flex flex-col items-center gap-2">
                                <PartyPopper size={24} />
                                <span className="text-[8px] font-black uppercase">Milestones</span>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'crisis' && (
                    <div className="p-20 text-center fade-in bg-burgundy-950/10">
                        <ShieldAlert size={48} className="mx-auto mb-4 text-burgundy-500 animate-pulse" />
                        <h4 className="text-burgundy-400 font-bold uppercase tracking-widest">Emergency Response Tracker</h4>
                        <p className="text-xs text-gray-500 max-w-sm mx-auto mt-2">
                            Coming Soon: A rapid response tool to coordinate support during district-wide emergencies or major member crises.
                        </p>
                    </div>
                )}

                {activeTab === 'appraisals' && (
                    <div className="p-6 fade-in">
                        <DistrictAppraisalManager 
                            churches={churches} 
                            appraisals={appraisals} 
                            readonly={readonly} 
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
