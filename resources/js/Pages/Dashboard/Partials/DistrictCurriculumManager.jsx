import React, { useState, useMemo } from 'react';
import { router, useForm } from '@inertiajs/react';
import { 
    GraduationCap, AlertCircle, BookOpen, UserCheck, Activity, Users, 
    Send, CheckCircle2, Search, Filter, ClipboardList, ShieldCheck, 
    Edit2, X, Check, Trash2, User, Clock, Plus, Trophy, FileText, Download, Share2,
    File, HardDrive, UploadCloud
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, Bar as ReBar
} from 'recharts';

export default function DistrictCurriculumManager({ 
    curriculum_stats = [], 
    investiture_candidates = [], 
    curriculum_standards = [], 
    honour_analytics = {}, 
    district_resources = [],
    readonly, 
    auth 
}) {
    const userRoles = auth.user.role_names || [];
    const isCoordinator = userRoles.includes('district_curriculum_coordinator');
    const isDirector = userRoles.includes('district_director') || userRoles.includes('super_admin');

    const [activeTab, setActiveTab] = useState('overview');
    const [showStandardForm, setShowStandardForm] = useState(false);
    const [editingStandard, setEditingStandard] = useState(null);
    const [showResourceUpload, setShowResourceUpload] = useState(false);

    // COLORS FOR CHARTS
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

    const resourceForm = useForm({
        title: '',
        description: '',
        category: 'Curriculum',
        department: 'Pathfinders',
        file: null,
    });

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

    // CHART DATA
    const classDistributionData = [
        { name: 'Friend', value: districtTotals.Friend, color: CHART_COLORS.Friend },
        { name: 'Companion', value: districtTotals.Companion, color: CHART_COLORS.Companion },
        { name: 'Explorer', value: districtTotals.Explorer, color: CHART_COLORS.Explorer },
        { name: 'Ranger', value: districtTotals.Ranger, color: CHART_COLORS.Ranger },
        { name: 'Voyager', value: districtTotals.Voyager, color: CHART_COLORS.Voyager },
        { name: 'Guide', value: districtTotals.Guide, color: CHART_COLORS.Guide },
    ].filter(d => d.value > 0);

    const clubComparisonData = curriculum_stats.map(c => ({
        name: c.church.name.replace('SDA Church ', '').substring(0, 10),
        Total: calculateTotal(c.stats),
        Health: c.health_score,
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

    const handleResourceSubmit = (e) => {
        e.preventDefault();
        resourceForm.post(route('district_resources.store'), {
            onSuccess: () => {
                setShowResourceUpload(false);
                resourceForm.reset();
            }
        });
    };

    const handleDeleteResource = (id) => {
        if (confirm('Remove this resource from the district library?')) {
            router.delete(route('district_resources.destroy', id), { preserveScroll: true });
        }
    };

    return (
        <div className="space-y-8">
            {/* 1. TOP NAVIGATION ROW - Above KPI Cards */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-surface-800 p-2 rounded-[2rem] border border-white/5 sticky top-0 z-40 backdrop-blur-md bg-surface-800/80">
                <div className="flex flex-wrap gap-1">
                    {[
                        { id: 'overview', label: 'Overview', icon: Activity },
                        { id: 'classes', label: 'Classes', icon: BookOpen },
                        { id: 'honours', label: 'Honours', icon: Trophy },
                        { id: 'pipeline', label: 'Pipeline', icon: Send, count: investiture_candidates.filter(c => c.status === 'pending_review' || c.status === 'recommended').length },
                        { id: 'standards', label: 'Standards', icon: ShieldCheck },
                        { id: 'resources', label: 'Resources', icon: HardDrive }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-2xl transition-all font-black text-xs uppercase tracking-widest ${
                                activeTab === tab.id 
                                ? 'bg-gold-500 text-black shadow-lg shadow-gold-500/20' 
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                            {tab.count > 0 && (
                                <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? 'bg-black/20' : 'bg-gold-500 text-black'}`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
                
                <div className="flex gap-2 pr-2">
                    <a 
                        href={route('curriculum.exports.pdf')} 
                        target="_blank"
                        className="p-3 rounded-xl bg-white/5 text-gray-400 hover:text-white transition-all" 
                        title="Export PDF Report"
                    >
                        <Download size={18} />
                    </a>
                    <a 
                        href={route('curriculum.exports.docx')} 
                        className="p-3 rounded-xl bg-white/5 text-gray-400 hover:text-white transition-all" 
                        title="Export Word Document"
                    >
                        <FileText size={18} />
                    </a>
                    <button className="p-3 rounded-xl bg-white/5 text-gray-400 hover:text-white transition-all" title="Share District Link">
                        <Share2 size={18} />
                    </button>
                </div>
            </div>

            {/* 2. KPI CARDS - Standalone Elevation */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Pathfinders', value: districtTotals.Total, icon: Users, color: 'text-gold-500', bg: 'bg-gold-500/10', sub: `${districtTotals.Clubs} Active Clubs` },
                    { label: 'Honours', value: honour_analytics.total_earned || 0, icon: Trophy, color: 'text-info-400', bg: 'bg-info-400/10', sub: 'District Wide' },
                    { label: 'Pipeline', value: districtTotals.Ready, icon: Send, color: 'text-success-400', bg: 'bg-success-400/10', sub: 'Awaiting Review' },
                    { label: 'Compliance', value: `${curriculum_stats.length > 0 ? Math.round(curriculum_stats.reduce((acc, c) => acc + c.health_score, 0) / curriculum_stats.length) : 0}%`, icon: Activity, color: 'text-burgundy-400', bg: 'bg-burgundy-400/10', sub: 'District Health' }
                ].map((stat, i) => (
                    <div key={i} className="bg-surface-900 border border-white/5 p-8 rounded-[2.5rem] shadow-2xl shadow-black/40 hover:border-white/10 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] rounded-full -translate-y-16 translate-x-16"></div>
                        <div className="flex items-center justify-between relative z-10">
                            <div className={`p-4 rounded-3xl ${stat.bg} ${stat.color}`}>
                                <stat.icon size={28} />
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1">{stat.label}</div>
                                <div className="text-4xl font-black text-white tabular-nums">{stat.value}</div>
                                <div className="text-[10px] font-bold text-gray-600 mt-1 uppercase">{stat.sub}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* 3. ACTIVE TAB CONTENT - Single Viewport */}
            <div className="min-h-[500px]">
                {activeTab === 'overview' && (
                    <div className="space-y-6 fade-in">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Class Distribution Chart */}
                            <div className="bg-surface-800 p-8 rounded-[2.5rem] border border-white/5">
                                <h4 className="text-white font-black uppercase tracking-widest text-xs mb-8 flex items-center gap-2">
                                    <BookOpen size={16} className="text-gold-500" />
                                    Class Enrollment Distribution
                                </h4>
                                <div className="h-72 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={classDistributionData}
                                                innerRadius={70}
                                                outerRadius={90}
                                                paddingAngle={8}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {classDistributionData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip 
                                                contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold' }}
                                                itemStyle={{ color: '#fff' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="grid grid-cols-3 gap-4 mt-6">
                                    {classDistributionData.map(c => (
                                        <div key={c.name} className="flex items-center gap-2 p-2 rounded-xl bg-white/5">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }}></div>
                                            <span className="text-[10px] font-black text-gray-400 uppercase">{c.name}: {c.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Club Comparison Chart */}
                            <div className="bg-surface-800 p-8 rounded-[2.5rem] border border-white/5">
                                <h4 className="text-white font-black uppercase tracking-widest text-xs mb-8 flex items-center gap-2">
                                    <Activity size={16} className="text-gold-500" />
                                    Top Clubs Performance
                                </h4>
                                <div className="h-72 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={clubComparisonData.slice(0, 6)}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                            <XAxis dataKey="name" stroke="#4b5563" fontSize={10} axisLine={false} tickLine={false} />
                                            <YAxis stroke="#4b5563" fontSize={10} axisLine={false} tickLine={false} />
                                            <Tooltip 
                                                cursor={{ fill: '#ffffff05' }}
                                                contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '16px', fontSize: '12px' }}
                                            />
                                            <ReBar dataKey="Total" fill="#eab308" radius={[6, 6, 0, 0]} barSize={24} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <p className="text-[10px] text-gray-500 uppercase font-black text-center mt-4 tracking-widest">Total Pathfinder Enrollment per Club</p>
                            </div>
                        </div>

                        {/* Alerts Grid */}
                        <div className="bg-surface-800 p-8 rounded-[2.5rem] border border-white/5">
                            <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
                                <AlertCircle size={16} className="text-burgundy-500" />
                                Strategic Intervention Alerts
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {curriculum_stats.filter(c => c.health_score < 60).map((club, i) => (
                                    <div key={i} className="p-6 rounded-[2rem] bg-burgundy-500/5 border border-burgundy-500/10 flex items-center justify-between group hover:bg-burgundy-500/10 transition-all">
                                        <div>
                                            <div className="text-sm font-black text-white mb-1">{club.church.name.substring(0, 20)}</div>
                                            <div className="text-[10px] text-burgundy-400 font-black uppercase tracking-tighter">Low Compliance</div>
                                        </div>
                                        <div className="text-2xl font-black text-burgundy-500">{club.health_score}%</div>
                                    </div>
                                ))}
                                {investiture_candidates.filter(c => c.status === 'pending_review').length > 0 && (
                                    <div className="p-6 rounded-[2rem] bg-gold-500/5 border border-gold-500/10 flex items-center justify-between group hover:bg-gold-500/10 transition-all">
                                        <div>
                                            <div className="text-sm font-black text-white mb-1">Pipeline Backlog</div>
                                            <div className="text-[10px] text-gold-400 font-black uppercase tracking-tighter">Awaiting Action</div>
                                        </div>
                                        <div className="text-2xl font-black text-gold-500">{investiture_candidates.filter(c => c.status === 'pending_review').length}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'classes' && (
                    <div className="bg-surface-800 rounded-[2.5rem] border border-white/5 overflow-hidden fade-in">
                        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                            <h4 className="text-white font-black uppercase tracking-widest text-xs">District Class Tracker</h4>
                        </div>
                        <div className="p-4">
                            <table className="w-full text-left border-separate border-spacing-y-3">
                                <thead>
                                    <tr className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] px-4">
                                        <th className="pb-2 pl-6">Club Name</th>
                                        <th className="pb-2 text-center">Compliance</th>
                                        <th className="pb-2">Progression</th>
                                        <th className="pb-2 text-center">Ready</th>
                                        <th className="pb-2 text-center">Instructors</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {curriculum_stats.map((row, idx) => (
                                        <tr key={idx} className="bg-white/[0.02] hover:bg-white/[0.04] transition-all">
                                            <td className="py-6 pl-6 rounded-l-[2rem]">
                                                <div className="font-black text-white text-sm uppercase">{row.church.name.replace('SDA Church ', '')}</div>
                                                <div className="text-[10px] text-gray-600 font-bold uppercase mt-1">{calculateTotal(row.stats)} Members</div>
                                            </td>
                                            <td className="py-6 text-center">
                                                <div className={`inline-block px-4 py-1.5 rounded-xl text-[10px] font-black ${
                                                    row.health_score >= 80 ? 'bg-success-500/10 text-success-400' : 
                                                    row.health_score >= 50 ? 'bg-gold-500/10 text-gold-400' : 
                                                    'bg-burgundy-500/10 text-burgundy-400'
                                                }`}>
                                                    {row.health_score}%
                                                </div>
                                            </td>
                                            <td className="py-6">
                                                <div className="flex gap-1 h-2.5 w-56 bg-white/5 rounded-full overflow-hidden">
                                                    <div className="bg-gray-400" style={{ width: `${(row.stats.Friend/calculateTotal(row.stats))*100}%` }}></div>
                                                    <div className="bg-blue-400" style={{ width: `${(row.stats.Companion/calculateTotal(row.stats))*100}%` }}></div>
                                                    <div className="bg-green-400" style={{ width: `${(row.stats.Explorer/calculateTotal(row.stats))*100}%` }}></div>
                                                    <div className="bg-yellow-400" style={{ width: `${(row.stats.Ranger/calculateTotal(row.stats))*100}%` }}></div>
                                                    <div className="bg-orange-400" style={{ width: `${(row.stats.Voyager/calculateTotal(row.stats))*100}%` }}></div>
                                                    <div className="bg-red-400" style={{ width: `${(row.stats.Guide/calculateTotal(row.stats))*100}%` }}></div>
                                                </div>
                                                <div className="flex justify-between text-[8px] text-gray-500 mt-2 font-black uppercase tracking-widest">
                                                    <span>F:{row.stats.Friend}</span>
                                                    <span>C:{row.stats.Companion}</span>
                                                    <span>E:{row.stats.Explorer}</span>
                                                    <span>R:{row.stats.Ranger}</span>
                                                    <span>V:{row.stats.Voyager}</span>
                                                    <span>G:{row.stats.Guide}</span>
                                                </div>
                                            </td>
                                            <td className="py-6 text-center">
                                                <div className="text-xl font-black text-success-400">{row.stats.Ready}</div>
                                            </td>
                                            <td className="py-6 pr-6 text-center rounded-r-[2rem]">
                                                <div className="text-white font-black">{row.instructors.active_instructors}</div>
                                                <div className="text-[8px] text-gray-600 uppercase font-black">Staff</div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'pipeline' && (
                    <div className="bg-surface-800 rounded-[2.5rem] border border-white/5 overflow-hidden fade-in">
                        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                            <h4 className="text-white font-black uppercase tracking-widest text-xs">Investiture Pipeline Workflow</h4>
                        </div>
                        <div className="p-6 space-y-4">
                            {investiture_candidates.map(candidate => (
                                <div key={candidate.id} className="bg-white/[0.02] p-8 rounded-[2rem] border border-white/5 flex flex-col lg:flex-row justify-between items-center gap-8 group hover:bg-white/[0.04] transition-all">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-[1.5rem] bg-gold-500/10 flex items-center justify-center text-gold-500">
                                            <User size={32} />
                                        </div>
                                        <div>
                                            <div className="text-white font-black text-xl mb-1">{candidate.pathfinder.name}</div>
                                            <div className="flex items-center gap-3 text-[10px] text-gray-500 uppercase font-black tracking-widest">
                                                <span className="text-gold-500">{candidate.class.name}</span>
                                                <span className="w-1.5 h-1.5 rounded-full bg-white/10"></span>
                                                <span>{candidate.church.name}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center">
                                        <div className="flex items-center gap-3">
                                            {[
                                                { id: 'pending_review', icon: ClipboardList },
                                                { id: 'recommended', icon: Send },
                                                { id: 'approved', icon: ShieldCheck }
                                            ].map((step, i, arr) => {
                                                const isCompleted = candidate.status === step.id || (i < arr.findIndex(s => s.id === candidate.status));
                                                const isActive = candidate.status === step.id;
                                                return (
                                                    <React.Fragment key={step.id}>
                                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${
                                                            isCompleted ? 'bg-success-500 text-black' : 
                                                            isActive ? 'bg-gold-500 text-black animate-pulse' : 
                                                            'bg-white/5 text-gray-700'
                                                        }`}>
                                                            <step.icon size={18} />
                                                        </div>
                                                        {i < arr.length - 1 && <div className={`w-12 h-1 rounded-full ${isCompleted ? 'bg-success-500' : 'bg-white/5'}`}></div>}
                                                    </React.Fragment>
                                                );
                                            })}
                                        </div>
                                        <span className="text-[9px] font-black uppercase text-gray-600 mt-3 tracking-[0.2em]">{candidate.status.replace('_', ' ')}</span>
                                    </div>

                                    <div className="flex gap-2">
                                        {isCoordinator && candidate.status === 'pending_review' && (
                                            <button onClick={() => handleAction(candidate.id, 'recommend')} className="bg-gold-500 hover:bg-gold-600 text-black font-black text-xs px-8 py-4 rounded-2xl transition-all">
                                                Recommend
                                            </button>
                                        )}
                                        {isDirector && candidate.status === 'recommended' && (
                                            <button onClick={() => handleAction(candidate.id, 'approve')} className="bg-success-500 hover:bg-success-600 text-black font-black text-xs px-8 py-4 rounded-2xl transition-all">
                                                Approve
                                            </button>
                                        )}
                                        {candidate.status === 'approved' && (
                                            <button onClick={() => handleAction(candidate.id, 'invested')} className="bg-gold-500 hover:bg-gold-600 text-black font-black text-xs px-8 py-4 rounded-2xl transition-all">
                                                Mark Invested
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'resources' && (
                    <div className="space-y-6 fade-in">
                        {/* Resource Toolbar */}
                        <div className="bg-surface-800 p-8 rounded-[2.5rem] border border-white/5 flex flex-wrap justify-between items-center gap-4">
                            <div>
                                <h4 className="text-white font-black uppercase tracking-widest text-xs">District Resource Hub</h4>
                                <p className="text-xs text-gray-500 mt-1">Official teaching kits and curriculum materials.</p>
                            </div>
                            <button 
                                onClick={() => setShowResourceUpload(!showResourceUpload)}
                                className="bg-gold-500 hover:bg-gold-600 text-black font-black px-8 py-4 rounded-2xl flex items-center gap-2 transition-all shadow-lg shadow-gold-500/20"
                            >
                                <UploadCloud size={20} />
                                Upload Resource
                            </button>
                        </div>

                        {/* Upload Form */}
                        {showResourceUpload && (
                            <div className="bg-surface-800 p-8 rounded-[2.5rem] border border-gold-500/20 slide-in">
                                <form onSubmit={handleResourceSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Resource Title</label>
                                            <input className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-gold-500 outline-none" value={resourceForm.data.title} onChange={e => resourceForm.setData('title', e.target.value)} required />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Category</label>
                                            <select className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-gold-500 outline-none" value={resourceForm.data.category} onChange={e => resourceForm.setData('category', e.target.value)}>
                                                <option value="Curriculum">Curriculum</option>
                                                <option value="Teaching Kit">Teaching Kit</option>
                                                <option value="Honour Material">Honour Material</option>
                                                <option value="Admin Document">Admin Document</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Select File (PDF, DOCX, ZIP)</label>
                                        <input type="file" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white file:bg-gold-500 file:border-none file:px-4 file:py-1 file:rounded-lg file:mr-4 file:font-black file:text-[10px] file:uppercase" onChange={e => resourceForm.setData('file', e.target.files[0])} required />
                                    </div>
                                    <div className="flex justify-end gap-3">
                                        <button type="button" onClick={() => setShowResourceUpload(false)} className="px-6 py-3 rounded-2xl font-bold text-gray-400 hover:text-white transition-all">Cancel</button>
                                        <button type="submit" disabled={resourceForm.processing} className="bg-gold-500 text-black font-black px-8 py-3 rounded-2xl shadow-lg shadow-gold-500/20">
                                            {resourceForm.processing ? 'Uploading...' : 'Publish to District'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Resource Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {district_resources.map(res => (
                                <div key={res.id} className="bg-surface-800 p-8 rounded-[2.5rem] border border-white/5 group hover:border-gold-500/30 transition-all relative overflow-hidden">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="p-4 rounded-3xl bg-white/5 text-gold-500 group-hover:scale-110 transition-transform">
                                            <FileText size={28} />
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className="text-[10px] font-black uppercase bg-white/5 px-3 py-1 rounded-full text-gray-500 tracking-widest">{res.file_type}</span>
                                            {(isCoordinator || isDirector || res.uploaded_by === auth.user.id) && (
                                                <button 
                                                    onClick={() => handleDeleteResource(res.id)}
                                                    className="p-1.5 rounded-lg bg-burgundy-500/10 text-burgundy-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-burgundy-500 hover:text-white"
                                                    title="Delete Resource"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <h5 className="text-white font-black text-lg mb-2 line-clamp-1">{res.title}</h5>
                                    <div className="flex items-center gap-3 text-[10px] text-gray-500 font-black uppercase tracking-widest mb-6">
                                        <span>{res.category}</span>
                                        <span className="w-1 h-1 rounded-full bg-white/10"></span>
                                        <span>{res.file_size}</span>
                                    </div>
                                    <a 
                                        href={`/storage/${res.file_path}`} 
                                        target="_blank" 
                                        className="w-full py-4 bg-white/5 hover:bg-gold-500 hover:text-black transition-all rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest"
                                    >
                                        <Download size={14} />
                                        Download File
                                    </a>
                                </div>
                            ))}
                            {district_resources.length === 0 && (
                                <div className="lg:col-span-3 py-20 text-center flex flex-col items-center">
                                    <HardDrive size={48} className="text-white/5 mb-4" />
                                    <h4 className="text-gray-500 font-bold uppercase tracking-widest">Library Empty</h4>
                                    <p className="text-[10px] text-gray-600 uppercase font-black mt-1">No district resources have been uploaded yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Other tabs follow same pattern of standalone rendering... */}
                {activeTab === 'honours' && (
                    <div className="space-y-6 fade-in">
                        {/* Honours Statistics & Global Registry */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Global Honours Registry */}
                            <div className="lg:col-span-2 bg-surface-800 rounded-[2.5rem] border border-white/5 overflow-hidden">
                                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                                    <div>
                                        <h4 className="text-white font-black uppercase tracking-widest text-xs">Official Honours Registry</h4>
                                        <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold">Standardized SDA Pathfinder Skills</p>
                                    </div>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={12} />
                                        <input 
                                            type="text" 
                                            placeholder="Search honours..." 
                                            className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:border-gold-500 outline-none w-48"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="p-4 max-h-[600px] overflow-y-auto custom-scrollbar">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {honour_analytics.all_honours?.filter(h => h.name.toLowerCase().includes(search.toLowerCase())).map(honour => (
                                            <div key={honour.id} className="bg-white/[0.02] p-4 rounded-2xl border border-white/5 hover:border-gold-500/30 transition-all group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-gold-500/5 flex items-center justify-center text-gold-500 group-hover:scale-110 transition-transform">
                                                        <Trophy size={20} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-black text-white truncate">{honour.name}</div>
                                                        <div className="flex items-center gap-2 text-[8px] font-black uppercase text-gray-500 tracking-tighter">
                                                            <span className="text-gold-500">{honour.category}</span>
                                                            <span className="w-1 h-1 rounded-full bg-white/10"></span>
                                                            <span>Level {honour.level}</span>
                                                        </div>
                                                    </div>
                                                    <button className="p-2 rounded-lg bg-white/5 text-gray-500 hover:text-white transition-all">
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Recent Achievements & Category Breakdown */}
                            <div className="space-y-6">
                                <div className="bg-surface-800 p-8 rounded-[2.5rem] border border-white/5">
                                    <h4 className="text-white font-black uppercase tracking-widest text-[10px] mb-6 flex items-center gap-2">
                                        <Clock size={14} className="text-gold-500" />
                                        Recent District Achievements
                                    </h4>
                                    <div className="space-y-4">
                                        {honour_analytics.recent_completions?.map((item, i) => (
                                            <div key={i} className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
                                                <div className="w-8 h-8 rounded-lg bg-success-500/10 flex items-center justify-center text-success-500 shrink-0">
                                                    <Check size={14} />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-[11px] font-black text-white truncate">{item.pathfinder_name}</div>
                                                    <div className="text-[9px] text-gray-500 font-bold uppercase truncate">{item.honour_name}</div>
                                                    <div className="text-[8px] text-gold-500/50 font-black uppercase mt-1">{item.church_name}</div>
                                                </div>
                                            </div>
                                        ))}
                                        {(!honour_analytics.recent_completions || honour_analytics.recent_completions.length === 0) && (
                                            <div className="py-12 text-center">
                                                <Trophy size={32} className="text-white/5 mx-auto mb-2" />
                                                <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">No recent data</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-surface-800 p-8 rounded-[2.5rem] border border-white/5">
                                    <h4 className="text-white font-black uppercase tracking-widest text-[10px] mb-6 flex items-center gap-2">
                                        <Filter size={14} className="text-gold-500" />
                                        Club Honour Rankings
                                    </h4>
                                    <div className="space-y-4">
                                        {curriculum_stats.sort((a,b) => b.honours_earned - a.honours_earned).slice(0, 5).map((club, i) => (
                                            <div key={i} className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] font-black text-gray-600">#{i+1}</span>
                                                    <span className="text-xs font-bold text-gray-300">{club.church.name.replace('SDA Church ', '')}</span>
                                                </div>
                                                <span className="text-[10px] font-black text-gold-500 bg-gold-500/10 px-2 py-0.5 rounded-full">{club.honours_earned || 0}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'standards' && (
                    <div className="bg-surface-800 rounded-[2.5rem] border border-white/5 p-12 text-center fade-in">
                        <ShieldCheck size={48} className="text-white/5 mx-auto mb-6" />
                        <h4 className="text-white font-black text-xl uppercase tracking-widest">District Governance Standards</h4>
                        <p className="text-gray-500 mt-2 max-w-sm mx-auto">Define and publish official curriculum guidelines for all clubs.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
