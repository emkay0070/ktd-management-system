import React, { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { 
    GraduationCap, AlertCircle, BookOpen, UserCheck, Activity, Users, 
    Send, CheckCircle2, Search, Filter, ClipboardList, ShieldCheck, 
    Edit2, X, Check, Trash2, User, Clock, Plus, Trophy 
} from 'lucide-react';

export default function DistrictCurriculumManager({ curriculum_stats = [], investiture_candidates = [], curriculum_standards = [], honour_analytics = {}, readonly, auth }) {
    const userRoles = auth.user.role_names || [];
    const isCoordinator = userRoles.includes('district_curriculum_coordinator');
    const isDirector = userRoles.includes('district_director') || userRoles.includes('super_admin');

    // Focus-Based Default Tab Logic
    const getDefaultTab = () => {
        if (isDirector && investiture_candidates.some(c => c.status === 'recommended')) return 'pipeline';
        if (isCoordinator && investiture_candidates.some(c => c.status === 'pending_review')) return 'pipeline';
        return 'classes';
    };

    const [activeTab, setActiveTab] = useState(getDefaultTab());
    const [search, setSearch] = useState('');
    const [showStandardForm, setShowStandardForm] = useState(false);
    const [editingStandard, setEditingStandard] = useState(null);

    const standardForm = useForm({
        title: '',
        content: '',
        department: 'Pathfinders',
    });

    const handleSaveStandard = (e) => {
        e.preventDefault();
        if (editingStandard) {
            standardForm.put(route('curriculum.standards.update', editingStandard.id), {
                onSuccess: () => {
                    setShowStandardForm(false);
                    setEditingStandard(null);
                    standardForm.reset();
                }
            });
        } else {
            standardForm.post(route('curriculum.standards.store'), {
                onSuccess: () => {
                    setShowStandardForm(false);
                    standardForm.reset();
                }
            });
        }
    };

    const handleDeleteStandard = (id) => {
        if (confirm('Delete this standard? This cannot be undone.')) {
            router.delete(route('curriculum.standards.destroy', id));
        }
    };

    const handleToggleStandard = (id) => {
        router.post(route('curriculum.standards.toggle', id));
    };

    const calculateTotal = (stats) => {
        return stats.Friend + stats.Companion + stats.Explorer + stats.Ranger + stats.Voyager + stats.Guide;
    };

    const districtTotals = curriculum_stats.reduce((acc, curr) => {
        return {
            Friend: acc.Friend + curr.stats.Friend,
            Companion: acc.Companion + curr.stats.Companion,
            Explorer: acc.Explorer + curr.stats.Explorer,
            Ranger: acc.Ranger + curr.stats.Ranger,
            Voyager: acc.Voyager + curr.stats.Voyager,
            Guide: acc.Guide + curr.stats.Guide,
            Ready: acc.Ready + curr.stats.Ready,
            Total: acc.Total + calculateTotal(curr.stats),
            Honours: acc.Honours + (curr.honours_earned || 0),
            Clubs: acc.Clubs + 1
        };
    }, { Friend: 0, Companion: 0, Explorer: 0, Ranger: 0, Voyager: 0, Guide: 0, Ready: 0, Total: 0, Honours: 0, Clubs: 0 });

    const handleRecommend = (id) => {
        const notes = prompt('Add recommendation notes (optional):');
        router.post(route('curriculum.assignments.recommend', id), { notes }, { preserveScroll: true });
    };

    const handleApprove = (id) => {
        if (confirm('Approve this Pathfinder for investiture?')) {
            router.post(route('curriculum.assignments.approve', id), {}, { preserveScroll: true });
        }
    };

    const handleInvested = (id) => {
        if (confirm('Mark this Pathfinder as officially invested?')) {
            router.post(route('curriculum.assignments.invested', id), {}, { preserveScroll: true });
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Header & Tabs */}
            <div className="panel p-0 overflow-hidden">
                <div className="p-6 border-b border-white/5 bg-white/[0.01]">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h3 className="flex items-center gap-2">
                                <GraduationCap className="text-gold-400" size={24} />
                                Pathfinder Curriculum Commander
                            </h3>
                            <p className="text-sm text-gray-500">Ministry-accurate tracking of Pathfinder learning and leadership development.</p>
                        </div>
                        <div className="flex bg-white/5 p-1 rounded-xl flex-wrap">
                            <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'overview' ? 'bg-gold-500 text-black shadow-lg shadow-gold-500/20' : 'text-gray-400 hover:text-white'}`}>
                                <Activity size={14} className="inline mr-2" /> Overview
                            </button>
                            <button onClick={() => setActiveTab('classes')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'classes' ? 'bg-gold-500 text-black shadow-lg shadow-gold-500/20' : 'text-gray-400 hover:text-white'}`}>
                                <BookOpen size={14} className="inline mr-2" /> Classes
                            </button>
                            <button onClick={() => setActiveTab('honours')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'honours' ? 'bg-gold-500 text-black shadow-lg shadow-gold-500/20' : 'text-gray-400 hover:text-white'}`}>
                                <Trophy size={14} className="inline mr-2" /> Honours
                            </button>
                            <button onClick={() => setActiveTab('pipeline')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'pipeline' ? 'bg-gold-500 text-black shadow-lg shadow-gold-500/20' : 'text-gray-400 hover:text-white'} relative`}>
                                <Send size={14} className={`inline mr-2 ${(isDirector && investiture_candidates.some(c => c.status === 'recommended')) || (isCoordinator && investiture_candidates.some(c => c.status === 'pending_review')) ? 'animate-pulse text-burgundy-500' : ''}`} /> Pipeline
                                {investiture_candidates.filter(c => c.status === 'pending_review' || c.status === 'recommended').length > 0 && (
                                    <span className={`absolute -top-1 -right-1 w-4 h-4 text-[8px] flex items-center justify-center rounded-full text-white font-black border-2 border-surface-900 ${
                                        (isDirector && investiture_candidates.some(c => c.status === 'recommended')) || (isCoordinator && investiture_candidates.some(c => c.status === 'pending_review'))
                                        ? 'bg-burgundy-500 animate-bounce'
                                        : 'bg-gray-600'
                                    }`}>
                                        {investiture_candidates.filter(c => c.status === 'pending_review' || c.status === 'recommended').length}
                                    </span>
                                )}
                            </button>
                            <button onClick={() => setActiveTab('standards')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'standards' ? 'bg-gold-500 text-black shadow-lg shadow-gold-500/20' : 'text-gray-400 hover:text-white'}`}>
                                <ShieldCheck size={14} className="inline mr-2" /> Standards
                            </button>
                        </div>
                    </div>
                </div>

                {activeTab === 'overview' && (
                    <div className="p-6 space-y-8 fade-in">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-surface-800 border border-white/5 p-4 rounded-2xl">
                                <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Total Pathfinders</div>
                                <div className="text-3xl font-black text-white">{districtTotals.Total}</div>
                                <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-2">
                                    <Users size={12} className="text-gold-500" />
                                    <span>Across {districtTotals.Clubs} active clubs</span>
                                </div>
                            </div>
                            <div className="bg-surface-800 border border-white/5 p-4 rounded-2xl">
                                <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Honours Earned</div>
                                <div className="text-3xl font-black text-white">{honour_analytics.total_earned || 0}</div>
                                <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-2">
                                    <Trophy size={12} className="text-info-400" />
                                    <span>This year district-wide</span>
                                </div>
                            </div>
                            <div className="bg-surface-800 border border-white/5 p-4 rounded-2xl">
                                <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Investiture Ready</div>
                                <div className="text-3xl font-black text-white">{districtTotals.Ready}</div>
                                <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-2">
                                    <GraduationCap size={12} className="text-success-400" />
                                    <span>Pending final review</span>
                                </div>
                            </div>
                            <div className="bg-surface-800 border border-white/5 p-4 rounded-2xl">
                                <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Curriculum Health</div>
                                <div className="text-3xl font-black text-gold-400">
                                    {curriculum_stats.length > 0 ? Math.round(curriculum_stats.reduce((acc, c) => acc + c.health_score, 0) / curriculum_stats.length) : 0}%
                                </div>
                                <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-2">
                                    <Activity size={12} className="text-gold-500" />
                                    <span>District-wide average</span>
                                </div>
                            </div>
                        </div>

                        {/* Top Honours & Alerts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="panel p-6 bg-surface-800/50">
                                <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                                    <Trophy size={18} className="text-gold-500" />
                                    Top Honours in District
                                </h4>
                                <div className="space-y-4">
                                    {honour_analytics.top_honours?.map((honour, i) => (
                                        <div key={i} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-500 font-black text-xs">#{i+1}</div>
                                                <span className="text-sm text-gray-300">{honour.name}</span>
                                            </div>
                                            <span className="text-xs font-black text-white bg-white/5 px-2 py-1 rounded">{honour.count} Pathfinders</span>
                                        </div>
                                    ))}
                                    {(!honour_analytics.top_honours || honour_analytics.top_honours.length === 0) && (
                                        <p className="text-center py-8 text-gray-600 text-xs uppercase tracking-widest">No honour data reported yet</p>
                                    )}
                                </div>
                            </div>

                            <div className="panel p-6 bg-surface-800/50">
                                <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                                    <AlertCircle size={18} className="text-danger-500" />
                                    Compliance Alerts
                                </h4>
                                <div className="space-y-3">
                                    {curriculum_stats.filter(c => c.health_score < 50).map((club, i) => (
                                        <div key={i} className="p-3 rounded-xl bg-danger-500/10 border border-danger-500/20 flex items-center justify-between">
                                            <div className="text-sm font-bold text-danger-400">{club.church.name}</div>
                                            <div className="text-[10px] text-danger-400/70 uppercase font-black">Critically Low Health ({club.health_score}%)</div>
                                        </div>
                                    ))}
                                    {investiture_candidates.filter(c => c.status === 'pending_review').length > 10 && (
                                        <div className="p-3 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-between">
                                            <div className="text-sm font-bold text-gold-400">High Review Volume</div>
                                            <div className="text-[10px] text-gold-400/70 uppercase font-black">{investiture_candidates.filter(c => c.status === 'pending_review').length} Pending Reviews</div>
                                        </div>
                                    )}
                                    {curriculum_stats.filter(c => c.instructors.active_instructors === 0).map((club, i) => (
                                        <div key={i} className="p-3 rounded-xl bg-warning-500/10 border border-warning-500/20 flex items-center justify-between">
                                            <div className="text-sm font-bold text-warning-400">{club.church.name}</div>
                                            <div className="text-[10px] text-warning-400/70 uppercase font-black">No Active Instructors</div>
                                        </div>
                                    ))}
                                    {curriculum_stats.filter(c => c.health_score >= 50 && c.instructors.active_instructors > 0).length === curriculum_stats.length && investiture_candidates.filter(c => c.status === 'pending_review').length <= 10 && (
                                        <div className="text-center py-12">
                                            <CheckCircle2 size={32} className="mx-auto text-success-500 opacity-20 mb-2" />
                                            <p className="text-xs text-gray-600 uppercase tracking-widest">District operating within standards</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'classes' && (
                    <div className="p-6 fade-in space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h4 className="text-white font-bold">District Class Distribution</h4>
                                <p className="text-xs text-gray-500">Monitor Pathfinder progress from Friend to Guide across all clubs.</p>
                            </div>
                        </div>

                        <div className="table-responsive">
                            <table className="h-table">
                                <thead>
                                    <tr>
                                        <th>Club Name</th>
                                        <th className="text-center">Health</th>
                                        <th>Class Distribution</th>
                                        <th className="text-center">Ready</th>
                                        <th className="text-center">Honours</th>
                                        <th className="text-center">Instructors</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {curriculum_stats.map((row, idx) => (
                                        <tr key={idx}>
                                            <td className="font-bold text-white">{row.church.name}</td>
                                            <td className="text-center">
                                                <div className={`text-sm font-black px-2 py-1 rounded-lg ${row.health_score >= 80 ? 'bg-success-500/10 text-success-400' : row.health_score >= 50 ? 'bg-gold-500/10 text-gold-400' : 'bg-danger-500/10 text-danger-400'}`}>
                                                    {row.health_score}%
                                                </div>
                                            </td>
                                            <td>
                                                <div className="flex gap-1 h-2 w-48 bg-white/5 rounded-full overflow-hidden">
                                                    <div className="bg-gray-400" style={{ width: `${(row.stats.Friend/calculateTotal(row.stats))*100}%` }} title={`Friend: ${row.stats.Friend}`}></div>
                                                    <div className="bg-blue-400" style={{ width: `${(row.stats.Companion/calculateTotal(row.stats))*100}%` }} title={`Companion: ${row.stats.Companion}`}></div>
                                                    <div className="bg-green-400" style={{ width: `${(row.stats.Explorer/calculateTotal(row.stats))*100}%` }} title={`Explorer: ${row.stats.Explorer}`}></div>
                                                    <div className="bg-yellow-400" style={{ width: `${(row.stats.Ranger/calculateTotal(row.stats))*100}%` }} title={`Ranger: ${row.stats.Ranger}`}></div>
                                                    <div className="bg-orange-400" style={{ width: `${(row.stats.Voyager/calculateTotal(row.stats))*100}%` }} title={`Voyager: ${row.stats.Voyager}`}></div>
                                                    <div className="bg-red-400" style={{ width: `${(row.stats.Guide/calculateTotal(row.stats))*100}%` }} title={`Guide: ${row.stats.Guide}`}></div>
                                                </div>
                                                <div className="flex justify-between text-[8px] text-gray-500 mt-1 uppercase font-black">
                                                    <span>F:{row.stats.Friend}</span>
                                                    <span>C:{row.stats.Companion}</span>
                                                    <span>E:{row.stats.Explorer}</span>
                                                    <span>R:{row.stats.Ranger}</span>
                                                    <span>V:{row.stats.Voyager}</span>
                                                    <span>G:{row.stats.Guide}</span>
                                                </div>
                                            </td>
                                            <td className="text-center font-black text-success-400">{row.stats.Ready}</td>
                                            <td className="text-center font-bold text-info-400">{row.honours_earned || 0}</td>
                                            <td className="text-center">
                                                <div className="text-xs font-bold text-white">{row.instructors.active_instructors}</div>
                                                <div className="text-[8px] text-gray-500 uppercase">Active MGs</div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'honours' && (
                    <div className="p-6 fade-in space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h4 className="text-white font-bold">Honours Registry</h4>
                                <p className="text-xs text-gray-500">Monitor skill-based training and honour completion across the district.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2">
                                <div className="table-responsive">
                                    <table className="h-table">
                                        <thead>
                                            <tr>
                                                <th>Club Name</th>
                                                <th className="text-center">Total Honours</th>
                                                <th>Most Popular Category</th>
                                                <th className="text-right">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {curriculum_stats.map((row, idx) => (
                                                <tr key={idx}>
                                                    <td className="font-bold text-white">{row.church.name}</td>
                                                    <td className="text-center font-black text-gold-400 text-lg">{row.honours_earned || 0}</td>
                                                    <td>
                                                        <span className="text-[10px] font-black uppercase bg-white/5 px-2 py-1 rounded text-gray-400">Nature Study</span>
                                                    </td>
                                                    <td className="text-right">
                                                        <button className="btn btn--ghost btn--xs">View Details</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="panel p-6 bg-surface-800">
                                    <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">Honour Categories Distribution</h5>
                                    <div className="space-y-4">
                                        {[
                                            { label: 'Nature Study', pct: 45, color: 'bg-green-500' },
                                            { label: 'Vocational', pct: 25, color: 'bg-blue-500' },
                                            { label: 'Spiritual Growth', pct: 20, color: 'bg-gold-500' },
                                            { label: 'Outdoor Ind.', pct: 10, color: 'bg-orange-500' }
                                        ].map((cat, i) => (
                                            <div key={i} className="space-y-1">
                                                <div className="flex justify-between text-[10px] font-bold">
                                                    <span className="text-gray-400">{cat.label}</span>
                                                    <span className="text-white">{cat.pct}%</span>
                                                </div>
                                                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                                    <div className={`h-full ${cat.color}`} style={{ width: `${cat.pct}%` }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <button className="btn btn--primary btn--full py-4 text-xs font-black uppercase tracking-widest">
                                    <Plus size={14} className="mr-2" /> Schedule District Honour Class
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'pipeline' && (
                    <div className="p-0 fade-in">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center">
                            <div>
                                <h4 className="text-white font-bold">Investiture Approval Pipeline</h4>
                                <p className="text-xs text-gray-500">Coordinate recommendations and final approvals for investiture candidates.</p>
                            </div>
                            <div className="flex gap-2">
                                <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest font-black mr-4">
                                    <div className="w-2 h-2 rounded-full bg-burgundy-500"></div> Pending Review
                                    <div className="w-2 h-2 rounded-full bg-gold-500 ml-2"></div> Recommended
                                    <div className="w-2 h-2 rounded-full bg-success-500 ml-2"></div> Approved
                                </div>
                            </div>
                        </div>

                        <div className="table-responsive">
                            <table className="h-table">
                                <thead>
                                    <tr>
                                        <th>Pathfinder</th>
                                        <th>Club & Class</th>
                                        <th>Status</th>
                                        <th>Validation Workflow</th>
                                        <th className="text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {investiture_candidates.map(candidate => (
                                        <tr key={candidate.id}>
                                            <td className="cell-primary font-bold">
                                                <div className="text-white">{candidate.pathfinder.name}</div>
                                                <div className="text-[10px] text-gray-500 uppercase">{candidate.pathfinder.gender}</div>
                                            </td>
                                            <td>
                                                <div className="text-sm font-bold text-gray-300">{candidate.church.name}</div>
                                                <div className="text-[10px] text-gold-500 uppercase font-black">{candidate.class.name}</div>
                                            </td>
                                            <td>
                                                <span className={`badge badge--sm ${
                                                    candidate.status === 'pending_review' ? 'badge--neutral' : 
                                                    candidate.status === 'recommended' ? 'badge--gold' : 
                                                    'badge--green'
                                                }`}>
                                                    {candidate.status.replace('_', ' ').toUpperCase()}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${candidate.status !== 'pending_review' ? 'bg-success-500/20 border-success-500/50 text-success-400' : 'bg-white/5 border-white/10 text-gray-600'}`}>
                                                        <ClipboardList size={12} />
                                                    </div>
                                                    <div className="h-px w-4 bg-white/10"></div>
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${candidate.status === 'recommended' || candidate.status === 'approved' ? 'bg-gold-500/20 border-gold-500/50 text-gold-400' : 'bg-white/5 border-white/10 text-gray-600'}`}>
                                                        <Send size={12} />
                                                    </div>
                                                    <div className="h-px w-4 bg-white/10"></div>
                                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${candidate.status === 'approved' ? 'bg-success-500/20 border-success-500/50 text-success-400' : 'bg-white/5 border-white/10 text-gray-600'}`}>
                                                        <ShieldCheck size={12} />
                                                    </div>
                                                </div>
                                                {candidate.recommended_by && (
                                                    <div className="text-[9px] text-gray-500 mt-1">Recommended by {candidate.recommended_by} on {candidate.recommended_at}</div>
                                                )}
                                            </td>
                                            <td className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    {isCoordinator && candidate.status === 'pending_review' && (
                                                        <button onClick={() => handleRecommend(candidate.id)} className="btn btn--sm btn--primary">
                                                            <Send size={14} className="mr-1" /> Recommend
                                                        </button>
                                                    )}
                                                    {isDirector && candidate.status === 'recommended' && (
                                                        <button onClick={() => handleApprove(candidate.id)} className="btn btn--sm btn--success">
                                                            <ShieldCheck size={14} className="mr-1" /> Approve
                                                        </button>
                                                    )}
                                                    {candidate.status === 'approved' && (
                                                        <button onClick={() => handleInvested(candidate.id)} className="btn btn--sm btn--gold">
                                                            <GraduationCap size={14} className="mr-1" /> Mark Invested
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {investiture_candidates.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="text-center py-12 text-gray-600">
                                                <div className="flex flex-col items-center">
                                                    <Send size={32} className="mb-2 opacity-20" />
                                                    <p className="font-medium">No candidates in the investiture pipeline.</p>
                                                    <p className="text-[10px] uppercase tracking-widest mt-1">Clubs must mark pathfinders as "Ready for Review" first.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'standards' && (
                    <div className="p-6 fade-in space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h4 className="text-white font-bold">Curriculum Delivery Standards</h4>
                                <p className="text-xs text-gray-500">Official guidelines and teaching standards defined by the District.</p>
                            </div>
                            {(isCoordinator || isDirector) && (
                                <button 
                                    onClick={() => {
                                        setEditingStandard(null);
                                        standardForm.reset();
                                        setShowStandardForm(true);
                                    }} 
                                    className="btn btn--primary btn--sm"
                                >
                                    <Plus size={14} className="mr-2" /> Define Standard
                                </button>
                            )}
                        </div>

                        {showStandardForm && (
                            <div className="panel p-6 bg-white/[0.02] border border-gold-500/20 slide-in">
                                <form onSubmit={handleSaveStandard} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="form-group">
                                            <label>Standard Title</label>
                                            <input className="h-input" value={standardForm.data.title} onChange={e => standardForm.setData('title', e.target.value)} required />
                                        </div>
                                        <div className="form-group">
                                            <label>Target Department</label>
                                            <select className="h-select" value={standardForm.data.department} onChange={e => standardForm.setData('department', e.target.value)}>
                                                <option value="Pathfinders">Pathfinders</option>
                                                <option value="Adventurers">Adventurers</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Detailed Guidelines (Markdown Supported)</label>
                                        <textarea className="h-textarea" rows={6} value={standardForm.data.content} onChange={e => standardForm.setData('content', e.target.value)} required placeholder="Define teaching expectations, honor delivery rules, or class structure..." />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <button type="button" onClick={() => setShowStandardForm(false)} className="btn btn--ghost btn--sm">Cancel</button>
                                        <button type="submit" disabled={standardForm.processing} className="btn btn--primary btn--sm">
                                            {editingStandard ? 'Update Standard' : 'Create Draft'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-4">
                            {curriculum_standards.map(standard => (
                                <div key={standard.id} className="panel p-6 bg-surface-800 border border-white/5 group hover:border-white/10 transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-gold-500/10 text-gold-500">{standard.department}</span>
                                                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${standard.workflow_status === 'published' ? 'bg-success-500/10 text-success-400' : 'bg-white/5 text-gray-500'}`}>
                                                    {standard.workflow_status}
                                                </span>
                                            </div>
                                            <h4 className="text-white font-bold text-lg">{standard.title}</h4>
                                        </div>
                                        {(isCoordinator || isDirector) && (
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => {
                                                        setEditingStandard(standard);
                                                        standardForm.setData({
                                                            title: standard.title,
                                                            content: standard.content,
                                                            department: standard.department
                                                        });
                                                        setShowStandardForm(true);
                                                    }} 
                                                    className="btn btn--sm btn--ghost p-2"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button onClick={() => handleToggleStandard(standard.id)} className={`btn btn--sm btn--ghost p-2 ${standard.workflow_status === 'published' ? 'text-warning-400' : 'text-success-400'}`}>
                                                    {standard.workflow_status === 'published' ? <X size={14} /> : <Check size={14} />}
                                                </button>
                                                <button onClick={() => handleDeleteStandard(standard.id)} className="btn btn--sm btn--ghost p-2 text-danger-400">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <div className="prose prose-invert max-w-none text-sm text-gray-400 whitespace-pre-wrap mb-4">
                                        {standard.content}
                                    </div>
                                    <div className="flex items-center gap-4 pt-4 border-t border-white/5 text-[10px] text-gray-600 uppercase font-black">
                                        <div className="flex items-center gap-1">
                                            <User size={12} /> Defined by {standard.creator?.name}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock size={12} /> Last updated {new Date(standard.updated_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {curriculum_standards.length === 0 && (
                                <div className="p-20 text-center bg-white/[0.01] rounded-2xl border border-dashed border-white/5">
                                    <ClipboardList size={48} className="mx-auto mb-4 opacity-10" />
                                    <h4 className="text-gray-500 font-bold uppercase tracking-widest">No standards defined</h4>
                                    <p className="text-xs text-gray-600">The Curriculum Coordinator can define guidelines for the district here.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
