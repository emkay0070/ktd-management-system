import React, { useState, useMemo } from 'react';
import { router, useForm } from '@inertiajs/react';
import { 
    GraduationCap, AlertCircle, BookOpen, UserCheck, Activity, Users, 
    Send, CheckCircle2, Search, Filter, ClipboardList, ShieldCheck, 
    Edit2, X, Check, Trash2, User, Clock, Plus, Trophy, FileText, Download, Share2,
    File, HardDrive, UploadCloud, Megaphone, Calendar
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';

export default function DistrictCurriculumManager({ 
    curriculum_stats = [], 
    investiture_candidates = [], 
    curriculum_standards = [], 
    honour_analytics = {}, 
    district_resources = [],
    district_bulletins = [],
    district_events = [],
    growth_pulse = [],
    readonly, 
    auth 
}) {
    const userRoles = auth.user.role_names || [];
    const isCoordinator = userRoles.includes('district_curriculum_coordinator');
    const isDirector = userRoles.includes('district_director') || userRoles.includes('super_admin');

    const [activeTab, setActiveTab] = useState('overview');
    const [search, setSearch] = useState('');
    const [showStandardForm, setShowStandardForm] = useState(false);
    const [editingStandard, setEditingStandard] = useState(null);
    const [showResourceUpload, setShowResourceUpload] = useState(false);
    const [showBulletinForm, setShowBulletinForm] = useState(false);
    const [editingBulletin, setEditingBulletin] = useState(null);
    const [showEventForm, setShowEventForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null); // For Detailed View

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

    const bulletinForm = useForm({
        title: '',
        content: '',
        level: 'Info',
        message_type: 'bulletin',
        department: 'Curriculum',
        target_audience: 'All',
        requires_acknowledgement: false,
    });

    const eventForm = useForm({
        name: '',
        type: 'Training',
        start_date: '',
        end_date: '',
        location: '',
        description: '',
        registration_fee: 0,
        message_type: 'official_event',
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

    const handleApproveStandard = (id) => {
        if (confirm('Approve this standard? It will be ready for the coordinator to publish.')) {
            router.post(route('curriculum.standards.approve', id), {}, { preserveScroll: true });
        }
    };

    const handleApproveResource = (id) => {
        if (confirm('Approve this resource?')) {
            router.post(route('district_resources.approve', id), {}, { preserveScroll: true });
        }
    };

    const handleApproveBulletin = (id) => {
        if (confirm('Approve this bulletin?')) {
            router.post(route('district_bulletins.approve', id), {}, { preserveScroll: true });
        }
    };

    const handleApproveEvent = (id) => {
        if (confirm('Approve this district event?')) {
            router.post(route('district_events.approve', id), {}, { preserveScroll: true });
        }
    };

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

    const handleSaveStandard = (e) => {
        e.preventDefault();
        const url = editingStandard 
            ? route('curriculum.standards.update', editingStandard.id)
            : route('curriculum.standards.store');
        
        standardForm.post(url, {
            onSuccess: () => {
                setShowStandardForm(false);
                setEditingStandard(null);
                standardForm.reset();
            }
        });
    };

    const handleSaveBulletin = (e) => {
        e.preventDefault();
        bulletinForm.post(route('district_bulletins.store'), {
            onSuccess: () => {
                setShowBulletinForm(false);
                setEditingBulletin(null);
                bulletinForm.reset();
            }
        });
    };

    const handleSaveEvent = (e) => {
        e.preventDefault();
        eventForm.post(route('district_events.store'), {
            onSuccess: () => {
                setShowEventForm(false);
                setEditingEvent(null);
                eventForm.reset();
            }
        });
    };

    const handleRequestApproval = (id, type) => {
        let routeName = '';
        if (type === 'standard') routeName = 'curriculum.standards.request_approval';
        else if (type === 'resource') routeName = 'district_resources.request_approval';
        else if (type === 'bulletin') routeName = 'district_bulletins.request_approval';
        else if (type === 'event') routeName = 'district_events.request_approval';

        if (confirm('Submit this for District Director approval?')) {
            router.post(route(routeName, id), {}, { preserveScroll: true });
        }
    };

    const handlePublish = (id, type) => {
        let routeName = '';
        if (type === 'standard') routeName = 'curriculum.standards.publish';
        else if (type === 'resource') routeName = 'district_resources.publish';
        else if (type === 'bulletin') routeName = 'district_bulletins.publish';
        else if (type === 'event') routeName = 'district_events.publish';

        if (confirm('Publish this to the entire district?')) {
            router.post(route(routeName, id), {}, { preserveScroll: true });
        }
    };

    const handleDeleteResource = (id) => {
        if (confirm('Remove this resource from the district library?')) {
            router.delete(route('district_resources.destroy', id), { preserveScroll: true });
        }
    };

    return (
        <div className="space-y-8">
            {/* 1. TOP NAVIGATION ROW - Sticky Command Center */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-surface-800 p-2 rounded-[2rem] border border-white/5 sticky top-0 z-40 backdrop-blur-md bg-surface-800/80">
                <div className="flex flex-wrap gap-1">
                    {[
                        { id: 'overview', label: 'Overview', icon: Activity },
                        { id: 'classes', label: 'Classes', icon: BookOpen },
                        { id: 'honours', label: 'Honours', icon: Trophy },
                        { id: 'pipeline', label: 'Pipeline', icon: Send, count: investiture_candidates.filter(c => c.status === 'pending_review' || c.status === 'recommended').length },
                        { id: 'standards', label: 'Standards', icon: ShieldCheck },
                        { id: 'resources', label: 'Resources', icon: HardDrive },
                        { id: 'bulletins', label: 'Bulletins', icon: Megaphone },
                        { id: 'events', label: 'Events', icon: Calendar }
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

            {/* 2. ACTIVE TAB CONTENT - Single Viewport */}
            <div className="min-h-[500px]">
                {activeTab === 'overview' && (
                    <div className="space-y-8 fade-in">
                        {/* KPI CARDS - Only visible on Overview */}
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

                        {/* ANALYTICS ROW */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            {/* Growth Pulse - New Line Chart */}
                            <div className="lg:col-span-8 bg-surface-800 p-8 rounded-[2.5rem] border border-white/5">
                                <div className="flex justify-between items-center mb-8">
                                    <h4 className="text-white font-black uppercase tracking-widest text-xs flex items-center gap-2">
                                        <Activity size={16} className="text-gold-500" />
                                        District Growth Pulse
                                    </h4>
                                    <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Last 12 Months</div>
                                </div>
                                <div className="h-72 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={growth_pulse}>
                                            <defs>
                                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                            <XAxis dataKey="label" stroke="#4b5563" fontSize={10} axisLine={false} tickLine={false} />
                                            <YAxis stroke="#4b5563" fontSize={10} axisLine={false} tickLine={false} />
                                            <Tooltip 
                                                contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold' }}
                                                itemStyle={{ color: '#fff' }}
                                            />
                                            <Area type="monotone" dataKey="value" stroke="#eab308" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Class Distribution Chart */}
                            <div className="lg:col-span-4 bg-surface-800 p-8 rounded-[2.5rem] border border-white/5">
                                <h4 className="text-white font-black uppercase tracking-widest text-xs mb-8 flex items-center gap-2">
                                    <BookOpen size={16} className="text-gold-500" />
                                    Class Enrollment
                                </h4>
                                <div className="h-72 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={classDistributionData}
                                                innerRadius={60}
                                                outerRadius={85}
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
                                <div className="flex flex-wrap justify-center gap-2 mt-4">
                                    {classDistributionData.map(c => (
                                        <div key={c.name} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/5">
                                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.color }}></div>
                                            <span className="text-[8px] font-black text-gray-500 uppercase">{c.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Club Comparison Chart */}
                            <div className="bg-surface-800 p-8 rounded-[2.5rem] border border-white/5">
                                <h4 className="text-white font-black uppercase tracking-widest text-xs mb-8 flex items-center gap-2">
                                    <Trophy size={16} className="text-gold-500" />
                                    Club Performance & Scale
                                </h4>
                                <div className="h-72 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={clubComparisonData.slice(0, 8)}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                            <XAxis dataKey="name" stroke="#4b5563" fontSize={10} axisLine={false} tickLine={false} />
                                            <YAxis stroke="#4b5563" fontSize={10} axisLine={false} tickLine={false} />
                                            <Tooltip 
                                                cursor={{ fill: '#ffffff05' }}
                                                contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '16px', fontSize: '12px' }}
                                            />
                                            <Bar dataKey="Total" fill="#eab308" radius={[6, 6, 0, 0]} barSize={24} />
                                            <Bar dataKey="Health" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={24} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex justify-center gap-6 mt-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded bg-gold-500"></div>
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Enrollment</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded bg-burgundy-500"></div>
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Compliance %</span>
                                    </div>
                                </div>
                            </div>

                            {/* Strategic Alerts */}
                            <div className="bg-surface-800 p-8 rounded-[2.5rem] border border-white/5">
                                <h4 className="text-white font-black uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
                                    <AlertCircle size={16} className="text-burgundy-500" />
                                    Department Action Items
                                </h4>
                                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {curriculum_stats.filter(c => c.health_score < 60).map((club, i) => (
                                        <div key={i} className="p-6 rounded-[2rem] bg-burgundy-500/5 border border-burgundy-500/10 flex items-center justify-between group hover:bg-burgundy-500/10 transition-all">
                                            <div>
                                                <div className="text-sm font-black text-white mb-1">{club.church.name.replace('SDA Church ', '')}</div>
                                                <div className="text-[10px] text-burgundy-400 font-black uppercase tracking-tighter">Immediate Intervention Needed</div>
                                            </div>
                                            <div className="text-2xl font-black text-burgundy-500">{club.health_score}%</div>
                                        </div>
                                    ))}
                                    {investiture_candidates.filter(c => c.status === 'pending_review').length > 0 && (
                                        <div className="p-6 rounded-[2rem] bg-gold-500/5 border border-gold-500/10 flex items-center justify-between group hover:bg-gold-500/10 transition-all">
                                            <div>
                                                <div className="text-sm font-black text-white mb-1">Investiture Backlog</div>
                                                <div className="text-[10px] text-gold-400 font-black uppercase tracking-tighter">{investiture_candidates.filter(c => c.status === 'pending_review').length} Candidates Waiting</div>
                                            </div>
                                            <Send size={20} className="text-gold-500" />
                                        </div>
                                    )}
                                    {curriculum_stats.filter(c => c.health_score >= 60).length === curriculum_stats.length && (
                                        <div className="py-20 text-center flex flex-col items-center">
                                            <CheckCircle2 size={48} className="text-success-500/20 mb-4" />
                                            <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">No Critical Alerts</p>
                                        </div>
                                    )}
                                </div>
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

                {activeTab === 'bulletins' && (
                    <div className="space-y-6 fade-in">
                        <div className="bg-surface-800 p-8 rounded-[2.5rem] border border-white/5 flex flex-wrap justify-between items-center gap-4">
                            <div>
                                <h4 className="text-white font-black uppercase tracking-widest text-xs">District Communications</h4>
                                <p className="text-xs text-gray-500 mt-1">Broadcast important curriculum updates to all clubs.</p>
                            </div>
                            <button 
                                onClick={() => setShowBulletinForm(!showBulletinForm)}
                                className="bg-gold-500 hover:bg-gold-600 text-black font-black px-8 py-4 rounded-2xl flex items-center gap-2 transition-all shadow-lg shadow-gold-500/20"
                            >
                                <Megaphone size={20} />
                                New Bulletin
                            </button>
                        </div>

                        {showBulletinForm && (
                            <div className="bg-surface-800 p-8 rounded-[2.5rem] border border-gold-500/20 slide-in">
                                <form onSubmit={handleSaveBulletin} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Bulletin Title</label>
                                            <input className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-gold-500 outline-none" value={bulletinForm.data.title} onChange={e => bulletinForm.setData('title', e.target.value)} required />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Priority Level</label>
                                            <select className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-gold-500 outline-none" value={bulletinForm.data.level} onChange={e => bulletinForm.setData('level', e.target.value)}>
                                                <option value="Info">Info</option>
                                                <option value="Warning">Warning</option>
                                                <option value="Urgent">Urgent</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Message Content</label>
                                        <textarea className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-gold-500 outline-none h-48" value={bulletinForm.data.content} onChange={e => bulletinForm.setData('content', e.target.value)} required />
                                    </div>
                                    <div className="flex justify-end gap-3">
                                        <button type="button" onClick={() => setShowBulletinForm(false)} className="px-6 py-3 rounded-2xl font-bold text-gray-400 hover:text-white transition-all">Cancel</button>
                                        <button type="submit" className="bg-gold-500 text-black font-black px-8 py-3 rounded-2xl shadow-lg shadow-gold-500/20">
                                            Save as Draft
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {district_bulletins.map(bulletin => (
                                <div key={bulletin.id} className="bg-surface-800 p-8 rounded-[2.5rem] border border-white/5 group hover:border-gold-500/30 transition-all relative overflow-hidden flex flex-col">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={`p-4 rounded-3xl ${
                                            bulletin.level === 'Urgent' ? 'bg-burgundy-500/10 text-burgundy-400' : 
                                            bulletin.level === 'Warning' ? 'bg-gold-500/10 text-gold-400' : 
                                            'bg-info-400/10 text-info-400'
                                        }`}>
                                            <Megaphone size={28} />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                                                bulletin.workflow_status === 'published' ? 'bg-success-500/10 text-success-400' : 
                                                bulletin.workflow_status === 'pending_approval' ? 'bg-gold-500/10 text-gold-400' : 
                                                'bg-white/5 text-gray-500'
                                            }`}>
                                                {bulletin.workflow_status?.replace('_', ' ') || 'draft'}
                                            </span>
                                        </div>
                                    </div>
                                    <h5 className="text-white font-black text-xl mb-2 line-clamp-1">{bulletin.title}</h5>
                                    <p className="text-sm text-gray-400 line-clamp-2 mb-6 flex-grow">{bulletin.content}</p>
                                    
                                    <button 
                                         onClick={() => setSelectedItem({ type: 'bulletin', data: bulletin })}
                                         className="w-full py-4 bg-white/5 hover:bg-white/10 transition-all rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest"
                                     >
                                         <Search size={14} />
                                         Review Details
                                     </button>

                                     <div className="flex gap-2 mt-3">
                                         {isDirector && bulletin.workflow_status === 'pending_approval' && (
                                             <button 
                                                 onClick={() => handleApproveBulletin(bulletin.id)}
                                                 className="flex-1 py-3 bg-success-500 hover:bg-success-600 text-black font-black rounded-xl text-[10px] uppercase tracking-widest"
                                             >
                                                 Approve
                                             </button>
                                         )}
                                         {isCoordinator && bulletin.workflow_status === 'draft' && (
                                             <button 
                                                 onClick={() => handleRequestApproval(bulletin.id, 'bulletin')}
                                                 className="flex-1 py-3 bg-gold-500 hover:bg-gold-600 text-black font-black rounded-xl text-[10px] uppercase tracking-widest"
                                             >
                                                 Request
                                             </button>
                                         )}
                                         {isCoordinator && bulletin.workflow_status === 'approved' && (
                                             <button 
                                                 onClick={() => handlePublish(bulletin.id, 'bulletin')}
                                                 className="flex-1 py-3 bg-success-500 hover:bg-success-600 text-black font-black rounded-xl text-[10px] uppercase tracking-widest"
                                             >
                                                 Publish
                                             </button>
                                         )}
                                     </div>
                                 </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'events' && (
                    <div className="space-y-6 fade-in">
                        <div className="bg-surface-800 p-8 rounded-[2.5rem] border border-white/5 flex flex-wrap justify-between items-center gap-4">
                            <div>
                                <h4 className="text-white font-black uppercase tracking-widest text-xs">District Events & Training</h4>
                                <p className="text-xs text-gray-500 mt-1">Schedule and manage official district-wide programs.</p>
                            </div>
                            <button 
                                onClick={() => setShowEventForm(!showEventForm)}
                                className="bg-gold-500 hover:bg-gold-600 text-black font-black px-8 py-4 rounded-2xl flex items-center gap-2 transition-all shadow-lg shadow-gold-500/20"
                            >
                                <Calendar size={20} />
                                New Event
                            </button>
                        </div>

                        {showEventForm && (
                            <div className="bg-surface-800 p-8 rounded-[2.5rem] border border-gold-500/20 slide-in">
                                <form onSubmit={handleSaveEvent} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Event Name</label>
                                            <input className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-gold-500 outline-none" value={eventForm.data.name} onChange={e => eventForm.setData('name', e.target.value)} required />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Event Type</label>
                                            <select className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-gold-500 outline-none" value={eventForm.data.type} onChange={e => eventForm.setData('type', e.target.value)}>
                                                <option value="Training">Training</option>
                                                <option value="Camporee">Camporee</option>
                                                <option value="Rally">Rally</option>
                                                <option value="Workshop">Workshop</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Start Date</label>
                                            <input type="date" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-gold-500 outline-none" value={eventForm.data.start_date} onChange={e => eventForm.setData('start_date', e.target.value)} required />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">End Date</label>
                                            <input type="date" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-gold-500 outline-none" value={eventForm.data.end_date} onChange={e => eventForm.setData('end_date', e.target.value)} required />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Location</label>
                                            <input className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-gold-500 outline-none" value={eventForm.data.location} onChange={e => eventForm.setData('location', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Registration Fee</label>
                                            <input type="number" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-gold-500 outline-none" value={eventForm.data.registration_fee} onChange={e => eventForm.setData('registration_fee', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Description</label>
                                        <textarea className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-gold-500 outline-none h-32" value={eventForm.data.description} onChange={e => eventForm.setData('description', e.target.value)} />
                                    </div>
                                    <div className="flex justify-end gap-3">
                                        <button type="button" onClick={() => setShowEventForm(false)} className="px-6 py-3 rounded-2xl font-bold text-gray-400 hover:text-white transition-all">Cancel</button>
                                        <button type="submit" className="bg-gold-500 text-black font-black px-8 py-3 rounded-2xl shadow-lg shadow-gold-500/20">
                                            Save as Draft
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {district_events.map(event => (
                                <div key={event.id} className="bg-surface-800 p-8 rounded-[2.5rem] border border-white/5 group hover:border-gold-500/30 transition-all relative overflow-hidden flex flex-col">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="p-4 rounded-3xl bg-white/5 text-gold-500">
                                            <Calendar size={28} />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                                                event.workflow_status === 'published' ? 'bg-success-500/10 text-success-400' : 
                                                event.workflow_status === 'pending_approval' ? 'bg-gold-500/10 text-gold-400' : 
                                                'bg-white/5 text-gray-500'
                                            }`}>
                                                {event.workflow_status?.replace('_', ' ') || 'draft'}
                                            </span>
                                        </div>
                                    </div>
                                    <h5 className="text-white font-black text-xl mb-2 line-clamp-1">{event.name}</h5>
                                    <div className="flex items-center gap-3 text-[10px] text-gray-500 font-black uppercase tracking-widest mb-6">
                                        <span>{event.type}</span>
                                        <span className="w-1 h-1 rounded-full bg-white/10"></span>
                                        <span>{new Date(event.start_date).toLocaleDateString()}</span>
                                    </div>
                                    
                                    <button 
                                         onClick={() => setSelectedItem({ type: 'event', data: event })}
                                         className="w-full py-4 bg-white/5 hover:bg-white/10 transition-all rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest"
                                     >
                                         <Search size={14} />
                                         Event Details
                                     </button>

                                     <div className="flex gap-2 mt-3">
                                         {isDirector && event.workflow_status === 'pending_approval' && (
                                             <button 
                                                 onClick={() => handleApproveEvent(event.id)}
                                                 className="flex-1 py-3 bg-success-500 hover:bg-success-600 text-black font-black rounded-xl text-[10px] uppercase tracking-widest"
                                             >
                                                 Approve
                                             </button>
                                         )}
                                         {isCoordinator && event.workflow_status === 'draft' && (
                                             <button 
                                                 onClick={() => handleRequestApproval(event.id, 'event')}
                                                 className="flex-1 py-3 bg-gold-500 hover:bg-gold-600 text-black font-black rounded-xl text-[10px] uppercase tracking-widest"
                                             >
                                                 Request
                                             </button>
                                         )}
                                         {isCoordinator && event.workflow_status === 'approved' && (
                                             <button 
                                                 onClick={() => handlePublish(event.id, 'event')}
                                                 className="flex-1 py-3 bg-success-500 hover:bg-success-600 text-black font-black rounded-xl text-[10px] uppercase tracking-widest"
                                             >
                                                 Publish
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
                                            {resourceForm.processing ? 'Uploading...' : 'Submit for Approval'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Resource Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {district_resources.map(res => (
                                <div key={res.id} className="bg-surface-800 p-8 rounded-[2.5rem] border border-white/5 group hover:border-gold-500/30 transition-all relative overflow-hidden flex flex-col">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="p-4 rounded-3xl bg-white/5 text-gold-500 group-hover:scale-110 transition-transform">
                                            <FileText size={28} />
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                                                    res.workflow_status === 'published' ? 'bg-success-500/10 text-success-400' : 
                                                    res.workflow_status === 'pending_approval' ? 'bg-gold-500/10 text-gold-400' : 
                                                    'bg-white/5 text-gray-500'
                                                }`}>
                                                    {res.workflow_status?.replace('_', ' ') || 'draft'}
                                                </span>
                                                <span className="text-[10px] font-black uppercase bg-white/5 px-3 py-1 rounded-full text-gray-500 tracking-widest">{res.file_type}</span>
                                            </div>
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

                                    <div className="space-y-3 mt-auto">
                                        <button 
                                            onClick={() => setSelectedItem({ type: 'resource', data: res })}
                                            className="w-full py-4 bg-white/5 hover:bg-white/10 transition-all rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest"
                                        >
                                            <HardDrive size={14} />
                                            View Details
                                        </button>

                                        {isDirector && res.workflow_status === 'pending_approval' && (
                                            <button 
                                                onClick={() => handleApproveResource(res.id)}
                                                className="w-full py-3 bg-success-500 hover:bg-success-600 text-black font-black rounded-xl text-[10px] uppercase tracking-widest"
                                            >
                                                Approve Workspace
                                            </button>
                                        )}

                                        {isCoordinator && res.workflow_status === 'draft' && (
                                            <button 
                                                onClick={() => handleRequestApproval(res.id, 'resource')}
                                                className="w-full py-3 bg-gold-500 hover:bg-gold-600 text-black font-black rounded-xl text-[10px] uppercase tracking-widest"
                                            >
                                                Request Approval
                                            </button>
                                        )}

                                        {isCoordinator && res.workflow_status === 'approved' && (
                                            <button 
                                                onClick={() => handlePublish(res.id, 'resource')}
                                                className="w-full py-3 bg-success-500 hover:bg-success-600 text-black font-black rounded-xl text-[10px] uppercase tracking-widest"
                                            >
                                                Publish Now
                                            </button>
                                        )}

                                        {res.workflow_status === 'published' && (
                                            <a 
                                                href={`/storage/${res.file_path}`} 
                                                target="_blank" 
                                                className="w-full py-4 bg-gold-500 text-black font-black transition-all rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest"
                                            >
                                                <Download size={14} />
                                                Download File
                                            </a>
                                        )}
                                    </div>
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

                {/* Other tabs follow same pattern... */}
                {activeTab === 'honours' && (
                    <div className="space-y-6 fade-in">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

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
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'standards' && (
                    <div className="space-y-6 fade-in">
                        <div className="flex justify-between items-center bg-surface-800 p-8 rounded-[2.5rem] border border-white/5">
                            <div>
                                <h4 className="text-white font-black uppercase tracking-widest text-xs">District Governance Standards</h4>
                                <p className="text-xs text-gray-500 mt-1">Define and publish official curriculum guidelines for all clubs.</p>
                            </div>
                            {(isCoordinator || isDirector) && (
                                <button 
                                    onClick={() => {
                                        setEditingStandard(null);
                                        standardForm.reset();
                                        setShowStandardForm(true);
                                    }} 
                                    className="bg-gold-500 hover:bg-gold-600 text-black font-black px-8 py-4 rounded-2xl flex items-center gap-2 transition-all shadow-lg shadow-gold-500/20"
                                >
                                    <Plus size={20} />
                                    New Standard
                                </button>
                            )}
                        </div>

                        {showStandardForm && (
                            <div className="bg-surface-800 p-8 rounded-[2.5rem] border border-gold-500/20 slide-in">
                                <form onSubmit={handleSaveStandard} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Standard Title</label>
                                            <input className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-gold-500 outline-none" value={standardForm.data.title} onChange={e => standardForm.setData('title', e.target.value)} required />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Target Department</label>
                                            <select className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-gold-500 outline-none" value={standardForm.data.department} onChange={e => standardForm.setData('department', e.target.value)}>
                                                <option value="Pathfinders">Pathfinders</option>
                                                <option value="Adventurers">Adventurers</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Detailed Guidelines (Markdown Supported)</label>
                                        <textarea className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:border-gold-500 outline-none h-48" value={standardForm.data.content} onChange={e => standardForm.setData('content', e.target.value)} required />
                                    </div>
                                    <div className="flex justify-end gap-3">
                                        <button type="button" onClick={() => setShowStandardForm(false)} className="px-6 py-3 rounded-2xl font-bold text-gray-400 hover:text-white transition-all">Cancel</button>
                                        <button type="submit" className="bg-gold-500 text-black font-black px-8 py-3 rounded-2xl shadow-lg shadow-gold-500/20">
                                            {editingStandard ? 'Update Standard' : 'Submit for Approval'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {curriculum_standards.map(standard => (
                                <div key={standard.id} className="bg-surface-800 p-8 rounded-[2.5rem] border border-white/5 group hover:border-gold-500/30 transition-all relative overflow-hidden flex flex-col">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-[8px] font-black uppercase bg-gold-500/10 text-gold-500 px-2 py-0.5 rounded-full">{standard.department}</span>
                                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                                                    standard.workflow_status === 'published' ? 'bg-success-500/10 text-success-400' : 
                                                    standard.workflow_status === 'pending_approval' ? 'bg-gold-500/10 text-gold-400' : 
                                                    'bg-white/5 text-gray-500'
                                                }`}>
                                                    {standard.workflow_status.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <h5 className="text-white font-black text-xl line-clamp-1">{standard.title}</h5>
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
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
                                                className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-white"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button onClick={() => router.delete(route('curriculum.standards.destroy', standard.id))} className="p-2 rounded-xl bg-white/5 text-burgundy-400 hover:bg-burgundy-500 hover:text-white">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <p className="text-sm text-gray-400 line-clamp-3 mb-6 flex-grow">{standard.content}</p>
                                    
                                    <div className="flex flex-col gap-4 mt-auto">
                                        <button 
                                            onClick={() => setSelectedItem({ type: 'standard', data: standard })}
                                            className="w-full py-4 bg-white/5 hover:bg-white/10 transition-all rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest"
                                        >
                                            <BookOpen size={14} />
                                            Open in Review Workspace
                                        </button>

                                        <div className="flex gap-2">
                                            {isDirector && standard.workflow_status === 'pending_approval' && (
                                                <button 
                                                    onClick={() => handleApproveStandard(standard.id)}
                                                    className="flex-1 py-3 bg-success-500 hover:bg-success-600 text-black font-black rounded-xl text-[10px] uppercase tracking-widest"
                                                >
                                                    Approve Workspace
                                                </button>
                                            )}
                                            {isCoordinator && standard.workflow_status === 'draft' && (
                                                <button 
                                                    onClick={() => handleRequestApproval(standard.id, 'standard')}
                                                    className="flex-1 py-3 bg-gold-500 hover:bg-gold-600 text-black font-black rounded-xl text-[10px] uppercase tracking-widest"
                                                >
                                                    Request Approval
                                                </button>
                                            )}
                                            {isCoordinator && standard.workflow_status === 'approved' && (
                                                <button 
                                                    onClick={() => handlePublish(standard.id, 'standard')}
                                                    className="flex-1 py-3 bg-success-500 hover:bg-success-600 text-black font-black rounded-xl text-[10px] uppercase tracking-widest"
                                                >
                                                    Publish Now
                                                </button>
                                            )}
                                            {standard.workflow_status === 'published' && (
                                                <div className="flex-1 py-3 bg-white/5 text-gray-500 font-black rounded-xl text-[10px] uppercase tracking-widest text-center">
                                                    Official Policy
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* 4. DETAILED REVIEW WORKSPACE (MODAL) */}
            {selectedItem && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedItem(null)}></div>
                    
                    <div className="relative w-full max-w-5xl h-full bg-surface-900 border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col slide-in">
                        {/* Workspace Header */}
                        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-gold-500/10 text-gold-500">
                                    {selectedItem.type === 'standard' ? <ShieldCheck size={24} /> : <HardDrive size={24} />}
                                </div>
                                <div>
                                    <h3 className="text-white font-black text-xl uppercase tracking-widest">{selectedItem.data.title || selectedItem.data.name}</h3>
                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">
                                        Reviewing {selectedItem.type} &bull; Created by {selectedItem.data.creator?.name || selectedItem.data.uploader?.name || selectedItem.data.author?.name || 'District Coordinator'}
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedItem(null)}
                                className="p-4 rounded-2xl bg-white/5 text-gray-400 hover:text-white hover:bg-burgundy-500/20 hover:text-burgundy-400 transition-all"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Workspace Body - Word-like Content Area */}
                        <div className="flex-1 overflow-y-auto p-12 bg-surface-800 custom-scrollbar">
                            <div className="max-w-3xl mx-auto bg-white p-12 md:p-20 rounded-xl shadow-2xl text-black min-h-full">
                                {selectedItem.type === 'standard' || selectedItem.type === 'bulletin' ? (
                                    <div className="prose prose-slate max-w-none">
                                        <div className="flex justify-between items-start mb-8 border-b-2 border-gold-500 pb-4">
                                            <h1 className="text-3xl font-black uppercase tracking-tighter m-0">{selectedItem.data.title}</h1>
                                            <div className="text-right">
                                                <div className="text-[10px] font-black uppercase text-gray-400">
                                                    {selectedItem.type === 'standard' ? 'Department' : 'Level'}
                                                </div>
                                                <div className="text-sm font-bold text-gold-600">
                                                    {selectedItem.data.department || selectedItem.data.level}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="whitespace-pre-wrap leading-relaxed text-lg">
                                            {selectedItem.data.content}
                                        </div>
                                        <div className="mt-20 pt-8 border-t border-gray-100 flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            <div>Authorized District Communication</div>
                                            <div>Ref: KTD-{selectedItem.type.toUpperCase()}-{selectedItem.data.id}</div>
                                        </div>
                                    </div>
                                ) : selectedItem.type === 'event' ? (
                                    <div className="prose prose-slate max-w-none">
                                        <div className="flex justify-between items-start mb-8 border-b-2 border-gold-500 pb-4">
                                            <h1 className="text-3xl font-black uppercase tracking-tighter m-0">{selectedItem.data.name}</h1>
                                            <div className="text-right">
                                                <div className="text-[10px] font-black uppercase text-gray-400">Event Type</div>
                                                <div className="text-sm font-bold text-gold-600">{selectedItem.data.type}</div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-8 mb-12">
                                            <div>
                                                <div className="text-[10px] font-black uppercase text-gray-400 mb-1">When</div>
                                                <div className="text-lg font-black">{new Date(selectedItem.data.start_date).toLocaleDateString()}</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black uppercase text-gray-400 mb-1">Where</div>
                                                <div className="text-lg font-black">{selectedItem.data.location || 'TBA'}</div>
                                            </div>
                                        </div>
                                        <div className="whitespace-pre-wrap leading-relaxed text-lg">
                                            {selectedItem.data.description || 'No detailed description available for this event.'}
                                        </div>
                                        <div className="mt-20 pt-8 border-t border-gray-100 flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            <div>Official District Program</div>
                                            <div>Ref: KTD-EVT-{selectedItem.data.id}</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center text-center py-20">
                                        <div className="w-32 h-32 rounded-[2.5rem] bg-gray-50 flex items-center justify-center text-gold-500 mb-8 shadow-inner">
                                            <FileText size={64} />
                                        </div>
                                        <h2 className="text-3xl font-black text-gray-900 mb-4">{selectedItem.data.title}</h2>
                                        <p className="text-gray-500 max-w-md mb-12 text-lg">{selectedItem.data.description || 'No detailed description provided for this resource.'}</p>
                                        
                                        <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-12">
                                            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                                <div className="text-[10px] font-black text-gray-400 uppercase mb-1">Format</div>
                                                <div className="text-lg font-black text-gray-900">{selectedItem.data.file_type}</div>
                                            </div>
                                            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                                                <div className="text-[10px] font-black text-gray-400 uppercase mb-1">Size</div>
                                                <div className="text-lg font-black text-gray-900">{selectedItem.data.file_size}</div>
                                            </div>
                                        </div>

                                        {selectedItem.data.workflow_status === 'published' ? (
                                            <a 
                                                href={`/storage/${selectedItem.data.file_path}`} 
                                                target="_blank"
                                                className="bg-gold-500 text-black font-black px-12 py-6 rounded-2xl shadow-xl shadow-gold-500/20 hover:scale-105 transition-all uppercase tracking-widest text-sm flex items-center gap-3"
                                            >
                                                <Download size={20} />
                                                Download Official Copy
                                            </a>
                                        ) : (
                                            <div className="p-6 rounded-2xl bg-gold-500/10 border border-gold-500/20 text-gold-600 font-bold">
                                                This resource is currently in review and cannot be downloaded.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Workspace Footer - Approval Actions */}
                        <div className="p-8 border-t border-white/5 bg-white/[0.01] flex justify-between items-center">
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${
                                        selectedItem.data.workflow_status === 'published' ? 'bg-success-500' : 'bg-gold-500'
                                    }`}></div>
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                                        Status: {selectedItem.data.workflow_status?.replace('_', ' ') || 'draft'}
                                    </span>
                                </div>
                                {selectedItem.data.approved_at && (
                                    <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                                        Approved on {new Date(selectedItem.data.approved_at).toLocaleDateString()}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3">
                                {isDirector && selectedItem.data.workflow_status === 'pending_approval' && (
                                    <>
                                        <button className="px-8 py-4 rounded-2xl bg-burgundy-500/10 text-burgundy-400 font-black text-xs uppercase tracking-widest hover:bg-burgundy-500 hover:text-white transition-all">
                                            Request Changes
                                        </button>
                                        <button 
                                            onClick={() => {
                                                if (selectedItem.type === 'standard') handleApproveStandard(selectedItem.data.id);
                                                else if (selectedItem.type === 'resource') handleApproveResource(selectedItem.data.id);
                                                else if (selectedItem.type === 'bulletin') handleApproveBulletin(selectedItem.data.id);
                                                else if (selectedItem.type === 'event') handleApproveEvent(selectedItem.data.id);
                                                setSelectedItem(null);
                                            }}
                                            className="px-8 py-4 rounded-2xl bg-success-500 text-black font-black text-xs uppercase tracking-widest hover:bg-success-600 transition-all shadow-lg shadow-success-500/20"
                                        >
                                            Approve Workspace
                                        </button>
                                    </>
                                )}
                                {isCoordinator && selectedItem.data.workflow_status === 'draft' && (
                                    <button 
                                        onClick={() => {
                                            handleRequestApproval(selectedItem.data.id, selectedItem.type);
                                            setSelectedItem(null);
                                        }}
                                        className="px-8 py-4 rounded-2xl bg-gold-500 text-black font-black text-xs uppercase tracking-widest hover:bg-gold-600 transition-all shadow-lg shadow-gold-500/20"
                                    >
                                        Submit for Approval
                                    </button>
                                )}
                                {isCoordinator && selectedItem.data.workflow_status === 'approved' && (
                                    <button 
                                        onClick={() => {
                                            handlePublish(selectedItem.data.id, selectedItem.type);
                                            setSelectedItem(null);
                                        }}
                                        className="px-8 py-4 rounded-2xl bg-success-500 text-black font-black text-xs uppercase tracking-widest hover:bg-success-600 transition-all shadow-lg shadow-success-500/20"
                                    >
                                        Publish to District
                                    </button>
                                )}
                                <button 
                                    onClick={() => setSelectedItem(null)}
                                    className="px-8 py-4 rounded-2xl bg-white/5 text-gray-400 font-black text-xs uppercase tracking-widest hover:text-white transition-all"
                                >
                                    Close Workspace
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
