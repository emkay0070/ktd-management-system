import React, { useState, useMemo } from 'react';
import { router, useForm } from '@inertiajs/react';
import { 
    GraduationCap, AlertCircle, BookOpen, UserCheck, Activity, Users, 
    Send, CheckCircle2, Search, Filter, ClipboardList, ShieldCheck, 
    Edit2, X, Check, Trash2, User, Clock, Plus, Trophy, FileText, Download, Share2
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';

export default function DistrictCurriculumManager({ curriculum_stats = [], investiture_candidates = [], curriculum_standards = [], honour_analytics = {}, readonly, auth }) {
    const userRoles = auth.user.role_names || [];
    const isCoordinator = userRoles.includes('district_curriculum_coordinator');
    const isDirector = userRoles.includes('district_director') || userRoles.includes('super_admin');

    const [activeTab, setActiveTab] = useState('overview');
    const [search, setSearch] = useState('');
    const [showStandardForm, setShowStandardForm] = useState(false);
    const [editingStandard, setEditingStandard] = useState(null);

    // COLORS FOR CHARTS
    const COLORS = ['#94a3b8', '#60a5fa', '#4ade80', '#facc15', '#fb923c', '#f87171'];
    const CHART_COLORS = {
        Friend: '#94a3b8',
        Companion: '#60a5fa',
        Explorer: '#4ade80',
        Ranger: '#facc15',
        Voyager: '#fb923c',
        Guide: '#f87171'
    };

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

    const calculateTotal = (stats) => {
        return stats.Friend + stats.Companion + stats.Explorer + stats.Ranger + stats.Voyager + stats.Guide;
    };

    const districtTotals = useMemo(() => {
        return curriculum_stats.reduce((acc, curr) => ({
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
        }), { Friend: 0, Companion: 0, Explorer: 0, Ranger: 0, Voyager: 0, Guide: 0, Ready: 0, Total: 0, Honours: 0, Clubs: 0 });
    }, [curriculum_stats]);

    // CHART DATA PREP
    const classDistributionData = [
        { name: 'Friend', value: districtTotals.Friend, color: CHART_COLORS.Friend },
        { name: 'Companion', value: districtTotals.Companion, color: CHART_COLORS.Companion },
        { name: 'Explorer', value: districtTotals.Explorer, color: CHART_COLORS.Explorer },
        { name: 'Ranger', value: districtTotals.Ranger, color: CHART_COLORS.Ranger },
        { name: 'Voyager', value: districtTotals.Voyager, color: CHART_COLORS.Voyager },
        { name: 'Guide', value: districtTotals.Guide, color: CHART_COLORS.Guide },
    ];

    const clubComparisonData = curriculum_stats.map(c => ({
        name: c.church.name.replace('SDA Church ', ''),
        Total: calculateTotal(c.stats),
        Health: c.health_score,
        Honours: c.honours_earned || 0
    })).sort((a, b) => b.Total - a.Total);

    const handleAction = (id, type) => {
        let routeName = '';
        let data = {};
        let confirmMsg = '';

        if (type === 'recommend') {
            const notes = prompt('Add recommendation notes (optional):');
            routeName = 'curriculum.assignments.recommend';
            data = { notes };
        } else if (type === 'approve') {
            routeName = 'curriculum.assignments.approve';
            confirmMsg = 'Approve this Pathfinder for investiture?';
        } else if (type === 'invested') {
            routeName = 'curriculum.assignments.invested';
            confirmMsg = 'Mark this Pathfinder as officially invested?';
        }

        if (!confirmMsg || confirm(confirmMsg)) {
            router.post(route(routeName, id), data, { preserveScroll: true });
        }
    };

    return (
        <div className="space-y-6">
            {/* 1. TOP STATS CARDS - Elevated & Standalone */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Pathfinders', value: districtTotals.Total, icon: Users, color: 'text-gold-500', bg: 'bg-gold-500/10', sub: `Across ${districtTotals.Clubs} Clubs` },
                    { label: 'Honours Earned', value: honour_analytics.total_earned || 0, icon: Trophy, color: 'text-info-400', bg: 'bg-info-400/10', sub: 'Year to Date' },
                    { label: 'Investiture Pipeline', value: districtTotals.Ready, icon: Send, color: 'text-success-400', bg: 'bg-success-400/10', sub: 'Candidates in Review' },
                    { label: 'District Health', value: `${curriculum_stats.length > 0 ? Math.round(curriculum_stats.reduce((acc, c) => acc + c.health_score, 0) / curriculum_stats.length) : 0}%`, icon: Activity, color: 'text-burgundy-400', bg: 'bg-burgundy-400/10', sub: 'Compliance Score' }
                ].map((stat, i) => (
                    <div key={i} className="bg-surface-900 border border-white/5 p-6 rounded-[2rem] shadow-xl shadow-black/20 hover:border-white/10 transition-all group">
                        <div className="flex items-start justify-between">
                            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                <stat.icon size={24} />
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1">{stat.label}</div>
                                <div className="text-4xl font-black text-white tabular-nums">{stat.value}</div>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-40"></span>
                            {stat.sub}
                        </div>
                    </div>
                ))}
            </div>

            {/* 2. MAIN WORKSPACE CONTAINER */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* SIDEBAR NAVIGATION */}
                <div className="lg:col-span-3 flex flex-col gap-2">
                    {[
                        { id: 'overview', label: 'Command Overview', icon: Activity },
                        { id: 'classes', label: 'Class Distribution', icon: BookOpen },
                        { id: 'honours', label: 'Honour Registry', icon: Trophy },
                        { id: 'pipeline', label: 'Investiture Pipeline', icon: Send, count: investiture_candidates.filter(c => c.status === 'pending_review' || c.status === 'recommended').length },
                        { id: 'standards', label: 'District Standards', icon: ShieldCheck },
                        { id: 'resources', label: 'Resource Workspace', icon: FileText }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center justify-between p-4 rounded-2xl transition-all font-bold text-sm ${
                                activeTab === tab.id 
                                ? 'bg-gold-500 text-black shadow-lg shadow-gold-500/20' 
                                : 'bg-surface-800 text-gray-400 hover:bg-surface-700 hover:text-white'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <tab.icon size={18} />
                                {tab.label}
                            </div>
                            {tab.count > 0 && (
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${activeTab === tab.id ? 'bg-black/20' : 'bg-gold-500/10 text-gold-500'}`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}

                    <div className="mt-6 p-6 rounded-[2rem] bg-burgundy-900/20 border border-burgundy-500/10">
                        <h5 className="text-burgundy-400 text-[10px] font-black uppercase tracking-widest mb-4">Export Reports</h5>
                        <div className="grid grid-cols-3 gap-2">
                            <button className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all flex flex-col items-center gap-1" title="Export PDF">
                                <Download size={14} />
                                <span className="text-[8px] font-black">PDF</span>
                            </button>
                            <button className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all flex flex-col items-center gap-1" title="Export Excel">
                                <FileText size={14} />
                                <span className="text-[8px] font-black">CSV</span>
                            </button>
                            <button className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all flex flex-col items-center gap-1" title="Share District Link">
                                <Share2 size={14} />
                                <span className="text-[8px] font-black">SHARE</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* MAIN CONTENT AREA */}
                <div className="lg:col-span-9 space-y-6">
                    
                    {activeTab === 'overview' && (
                        <div className="space-y-6 fade-in">
                            {/* ANALYTICS ROW */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-surface-800 p-6 rounded-[2rem] border border-white/5">
                                    <h4 className="text-white font-bold mb-6 flex items-center gap-2">
                                        <BookOpen size={18} className="text-gold-500" />
                                        Pathfinder Class Breakdown
                                    </h4>
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={classDistributionData}
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {classDistributionData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip 
                                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', fontSize: '12px' }}
                                                    itemStyle={{ color: '#fff' }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 mt-4">
                                        {classDistributionData.map(c => (
                                            <div key={c.name} className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }}></div>
                                                <span className="text-[10px] font-bold text-gray-500 uppercase">{c.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-surface-800 p-6 rounded-[2rem] border border-white/5">
                                    <h4 className="text-white font-bold mb-6 flex items-center gap-2">
                                        <Activity size={18} className="text-gold-500" />
                                        Club Health vs Enrollment
                                    </h4>
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={clubComparisonData.slice(0, 5)}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                                <XAxis dataKey="name" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                                                <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                                                <Tooltip 
                                                    cursor={{ fill: '#ffffff05' }}
                                                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', fontSize: '12px' }}
                                                />
                                                <Bar dataKey="Total" fill="#eab308" radius={[4, 4, 0, 0]} barSize={20} />
                                                <Bar dataKey="Health" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="flex justify-center gap-4 mt-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-gold-500"></div>
                                            <span className="text-[10px] font-bold text-gray-500 uppercase">Pathfinders</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-burgundy-500"></div>
                                            <span className="text-[10px] font-bold text-gray-500 uppercase">Health %</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* COMPLIANCE ALERTS SECTION */}
                            <div className="bg-surface-800 p-8 rounded-[2rem] border border-white/5">
                                <h4 className="text-white font-bold mb-6 flex items-center gap-2">
                                    <AlertCircle size={18} className="text-burgundy-500" />
                                    Strategic Compliance Alerts
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {curriculum_stats.filter(c => c.health_score < 60).map((club, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-burgundy-500/5 border border-burgundy-500/10">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-burgundy-500/10 flex items-center justify-center text-burgundy-500">
                                                    <ShieldCheck size={18} />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-white">{club.church.name}</div>
                                                    <div className="text-[10px] text-burgundy-400 font-black uppercase">Intervention Required</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xl font-black text-burgundy-500">{club.health_score}%</div>
                                                <div className="text-[8px] text-gray-500 uppercase font-black">Compliance</div>
                                            </div>
                                        </div>
                                    ))}
                                    {investiture_candidates.filter(c => c.status === 'pending_review').length > 5 && (
                                        <div className="flex items-center justify-between p-4 rounded-2xl bg-gold-500/5 border border-gold-500/10">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center text-gold-500">
                                                    <Clock size={18} />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-white">Investiture Backlog</div>
                                                    <div className="text-[10px] text-gold-400 font-black uppercase">Coordinator Action Needed</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xl font-black text-gold-500">{investiture_candidates.filter(c => c.status === 'pending_review').length}</div>
                                                <div className="text-[8px] text-gray-500 uppercase font-black">Pending</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'classes' && (
                        <div className="bg-surface-800 rounded-[2rem] border border-white/5 overflow-hidden fade-in">
                            <div className="p-8 border-b border-white/5">
                                <h4 className="text-white font-bold">District Class Distribution</h4>
                                <p className="text-xs text-gray-500 mt-1">Real-time enrollment tracking across all curriculum levels.</p>
                            </div>
                            <div className="table-responsive p-4">
                                <table className="w-full text-left border-separate border-spacing-y-2">
                                    <thead>
                                        <tr className="text-[10px] text-gray-500 font-black uppercase tracking-widest px-4">
                                            <th className="pb-4 pl-4">Club Name</th>
                                            <th className="pb-4 text-center">Health</th>
                                            <th className="pb-4">Class Distribution</th>
                                            <th className="pb-4 text-center">Ready</th>
                                            <th className="pb-4 text-center">Staffing</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {curriculum_stats.map((row, idx) => (
                                            <tr key={idx} className="bg-white/[0.02] hover:bg-white/[0.04] transition-all group">
                                                <td className="py-4 pl-4 rounded-l-2xl">
                                                    <div className="font-bold text-white text-sm">{row.church.name.replace('SDA Church ', '')}</div>
                                                    <div className="text-[10px] text-gray-500 uppercase">{calculateTotal(row.stats)} Members</div>
                                                </td>
                                                <td className="py-4 text-center">
                                                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-black ${
                                                        row.health_score >= 80 ? 'bg-success-500/10 text-success-400' : 
                                                        row.health_score >= 50 ? 'bg-gold-500/10 text-gold-400' : 
                                                        'bg-burgundy-500/10 text-burgundy-400'
                                                    }`}>
                                                        {row.health_score}%
                                                    </div>
                                                </td>
                                                <td className="py-4">
                                                    <div className="flex gap-1 h-2 w-48 bg-white/5 rounded-full overflow-hidden">
                                                        <div className="bg-gray-400" style={{ width: `${(row.stats.Friend/calculateTotal(row.stats))*100}%` }} title="Friend"></div>
                                                        <div className="bg-blue-400" style={{ width: `${(row.stats.Companion/calculateTotal(row.stats))*100}%` }} title="Companion"></div>
                                                        <div className="bg-green-400" style={{ width: `${(row.stats.Explorer/calculateTotal(row.stats))*100}%` }} title="Explorer"></div>
                                                        <div className="bg-yellow-400" style={{ width: `${(row.stats.Ranger/calculateTotal(row.stats))*100}%` }} title="Ranger"></div>
                                                        <div className="bg-orange-400" style={{ width: `${(row.stats.Voyager/calculateTotal(row.stats))*100}%` }} title="Voyager"></div>
                                                        <div className="bg-red-400" style={{ width: `${(row.stats.Guide/calculateTotal(row.stats))*100}%` }} title="Guide"></div>
                                                    </div>
                                                    <div className="flex justify-between text-[8px] text-gray-500 mt-2 font-black uppercase">
                                                        <span>F:{row.stats.Friend}</span>
                                                        <span>C:{row.stats.Companion}</span>
                                                        <span>E:{row.stats.Explorer}</span>
                                                        <span>R:{row.stats.Ranger}</span>
                                                        <span>V:{row.stats.Voyager}</span>
                                                        <span>G:{row.stats.Guide}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 text-center">
                                                    <div className="text-lg font-black text-success-400 tabular-nums">{row.stats.Ready}</div>
                                                </td>
                                                <td className="py-4 pr-4 text-center rounded-r-2xl">
                                                    <div className="text-white font-bold">{row.instructors.active_instructors}</div>
                                                    <div className="text-[8px] text-gray-500 uppercase font-black">Instructors</div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'pipeline' && (
                        <div className="bg-surface-800 rounded-[2rem] border border-white/5 overflow-hidden fade-in">
                            <div className="p-8 border-b border-white/5 flex justify-between items-center">
                                <div>
                                    <h4 className="text-white font-bold">Investiture Approval Pipeline</h4>
                                    <p className="text-xs text-gray-500 mt-1">Verification and recommendation workflow for candidates.</p>
                                </div>
                            </div>
                            <div className="p-4 space-y-3">
                                {investiture_candidates.map(candidate => (
                                    <div key={candidate.id} className="bg-white/[0.02] p-6 rounded-3xl border border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gold-500/10 flex items-center justify-center text-gold-500">
                                                <User size={24} />
                                            </div>
                                            <div>
                                                <div className="text-white font-bold text-lg">{candidate.pathfinder.name}</div>
                                                <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase font-black tracking-widest">
                                                    <span>{candidate.church.name}</span>
                                                    <span className="w-1 h-1 rounded-full bg-gray-700"></span>
                                                    <span className="text-gold-500">{candidate.class.name}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-center">
                                            <div className="flex items-center gap-2">
                                                {[
                                                    { id: 'pending_review', label: 'Review', icon: ClipboardList },
                                                    { id: 'recommended', label: 'Recommend', icon: Send },
                                                    { id: 'approved', label: 'Approve', icon: ShieldCheck }
                                                ].map((step, i, arr) => {
                                                    const isCompleted = candidate.status === step.id || (i < arr.findIndex(s => s.id === candidate.status));
                                                    const isActive = candidate.status === step.id;
                                                    return (
                                                        <React.Fragment key={step.id}>
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                                                isCompleted ? 'bg-success-500 text-black shadow-lg shadow-success-500/20' : 
                                                                isActive ? 'bg-gold-500 text-black animate-pulse' : 
                                                                'bg-white/5 text-gray-600'
                                                            }`} title={step.label}>
                                                                <step.icon size={14} />
                                                            </div>
                                                            {i < arr.length - 1 && <div className={`w-8 h-0.5 ${isCompleted ? 'bg-success-500' : 'bg-white/5'}`}></div>}
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </div>
                                            <span className="text-[8px] font-black uppercase text-gray-500 mt-2 tracking-widest">{candidate.status.replace('_', ' ')}</span>
                                        </div>

                                        <div className="flex gap-2">
                                            {isCoordinator && candidate.status === 'pending_review' && (
                                                <button onClick={() => handleAction(candidate.id, 'recommend')} className="btn bg-gold-500 hover:bg-gold-600 text-black font-black text-xs px-6 py-3 rounded-xl shadow-lg shadow-gold-500/20">
                                                    Recommend
                                                </button>
                                            )}
                                            {isDirector && candidate.status === 'recommended' && (
                                                <button onClick={() => handleAction(candidate.id, 'approve')} className="btn bg-success-500 hover:bg-success-600 text-black font-black text-xs px-6 py-3 rounded-xl shadow-lg shadow-success-500/20">
                                                    Approve
                                                </button>
                                            )}
                                            {candidate.status === 'approved' && (
                                                <button onClick={() => handleAction(candidate.id, 'invested')} className="btn bg-gold-500 hover:bg-gold-600 text-black font-black text-xs px-6 py-3 rounded-xl shadow-lg shadow-gold-500/20">
                                                    Invested
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {investiture_candidates.length === 0 && (
                                    <div className="py-20 text-center flex flex-col items-center">
                                        <Send size={48} className="text-white/5 mb-4" />
                                        <h4 className="text-gray-500 font-bold uppercase tracking-widest">Pipeline Empty</h4>
                                        <p className="text-[10px] text-gray-600 uppercase font-black mt-1">Clubs must submit candidates for review</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'standards' && (
                        <div className="space-y-6 fade-in">
                            <div className="flex justify-between items-center bg-surface-800 p-8 rounded-[2rem] border border-white/5">
                                <div>
                                    <h4 className="text-white font-bold text-xl">District Standards</h4>
                                    <p className="text-xs text-gray-500 mt-1">Official curriculum and compliance guidelines for the district.</p>
                                </div>
                                <button onClick={() => setShowStandardForm(true)} className="btn bg-gold-500 hover:bg-gold-600 text-black font-black px-6 py-3 rounded-2xl flex items-center gap-2 transition-all shadow-lg shadow-gold-500/20">
                                    <Plus size={18} /> New Standard
                                </button>
                            </div>

                            {showStandardForm && (
                                <div className="bg-surface-800 p-8 rounded-[2rem] border border-gold-500/20 slide-in">
                                    <form onSubmit={handleSaveStandard} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Standard Title</label>
                                                <input className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-gold-500 outline-none transition-all" value={standardForm.data.title} onChange={e => standardForm.setData('title', e.target.value)} required />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Target Department</label>
                                                <select className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-gold-500 outline-none transition-all" value={standardForm.data.department} onChange={e => standardForm.setData('department', e.target.value)}>
                                                    <option value="Pathfinders">Pathfinders</option>
                                                    <option value="Adventurers">Adventurers</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Detailed Guidelines</label>
                                            <textarea className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-gold-500 outline-none transition-all h-48" value={standardForm.data.content} onChange={e => standardForm.setData('content', e.target.value)} required />
                                        </div>
                                        <div className="flex justify-end gap-3">
                                            <button type="button" onClick={() => setShowStandardForm(false)} className="px-6 py-3 rounded-2xl font-bold text-gray-400 hover:text-white transition-all">Cancel</button>
                                            <button type="submit" className="bg-gold-500 text-black font-black px-8 py-3 rounded-2xl shadow-lg shadow-gold-500/20">Save Standard</button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-4">
                                {curriculum_standards.map(standard => (
                                    <div key={standard.id} className="bg-surface-800 p-8 rounded-[2rem] border border-white/5 group hover:border-white/10 transition-all relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform"></div>
                                        <div className="flex justify-between items-start relative z-10">
                                            <div>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className="text-[8px] font-black uppercase bg-gold-500/10 text-gold-500 px-2 py-0.5 rounded-full">{standard.department}</span>
                                                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${standard.workflow_status === 'published' ? 'bg-success-500/10 text-success-400' : 'bg-white/5 text-gray-500'}`}>{standard.workflow_status}</span>
                                                </div>
                                                <h4 className="text-xl font-black text-white">{standard.title}</h4>
                                                <p className="text-sm text-gray-400 mt-4 leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all">{standard.content}</p>
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"><Edit2 size={16} /></button>
                                                <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-danger-400"><Trash2 size={16} /></button>
                                            </div>
                                        </div>
                                        <div className="mt-8 pt-6 border-t border-white/5 flex items-center gap-6 text-[10px] font-black uppercase text-gray-500 tracking-widest relative z-10">
                                            <div className="flex items-center gap-2"><User size={14} className="text-gold-500" /> {standard.creator?.name}</div>
                                            <div className="flex items-center gap-2"><Clock size={14} className="text-gold-500" /> {new Date(standard.updated_at).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'resources' && (
                        <div className="bg-surface-800 p-20 rounded-[2rem] border border-white/5 text-center fade-in">
                            <div className="w-20 h-20 bg-gold-500/10 text-gold-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                                <FileText size={32} />
                            </div>
                            <h4 className="text-white font-black text-2xl">Resource Workspace</h4>
                            <p className="text-gray-500 mt-2 max-w-sm mx-auto font-medium">This is where all curriculum materials, teaching kits, and instructor resources will be managed.</p>
                            <button className="mt-8 btn bg-gold-500 text-black font-black px-8 py-4 rounded-2xl shadow-lg shadow-gold-500/20">
                                Launch Resource Hub
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
