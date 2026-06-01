import React, { useMemo } from 'react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    BarChart, Bar, Cell, PieChart, Pie, Legend 
} from 'recharts';
import { TrendingUp, PieChart as PieIcon, Activity, Zap, GraduationCap, Award, Download, FileText, ChevronRight, Share2 } from 'lucide-react';

export default function DistrictPulseView({ analytics }) {
    const { growth = [], composition = [], activity = [] } = analytics;

    const totalRegistrations = useMemo(() => growth.reduce((sum, d) => sum + d.value, 0), [growth]);
    
    // Sort composition for better visualization
    const sortedComposition = useMemo(() => {
        return [...composition].sort((a,b) => b.count - a.count);
    }, [composition]);

    const topClass = sortedComposition[0];

    // Chart Palette (EmPFC Burgundy/Gold variants)
    const COLORS = ['#521214', '#D4A017', '#801A1D', '#F2C14E', '#B18E3F', '#400D0F'];

    const fadeInUp = "animate-in fade-in slide-in-from-bottom-4 duration-700";

    const exportToCSV = () => {
        const headers = "Month,Registrations\n";
        const rows = growth.map(d => `${d.label},${d.value}`).join("\n");
        const blob = new Blob([headers + rows], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `District_Growth_${new Date().getFullYear()}.csv`;
        a.click();
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-surface-900 border border-gold-500/50 p-4 rounded-xl shadow-2xl backdrop-blur-md">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gold-400 mb-1">{label}</div>
                    <div className="text-xl font-black text-white flex items-center gap-2">
                        {payload[0].value} <span className="text-xs font-normal opacity-60">Registrations</span>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-8">
            {/* Analytics Header Stats */}
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${fadeInUp}`}>
                <div className="stat-card stat-card--gold overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-gold-500/10 rounded-full blur-2xl" />
                    <div className="stat-icon stat-icon--gold"><TrendingUp size={22} /></div>
                    <div className="stat-value text-white">+{totalRegistrations}</div>
                    <div className="stat-label uppercase tracking-widest text-[10px] font-black text-gray-500">12M Growth Pulse</div>
                    <div className="stat-sub text-[9px] text-gold-400/80 mt-2">Annual recruitment momentum</div>
                </div>
                <div className="stat-card stat-card--gray overflow-hidden group border border-white/10 bg-white/[0.02]">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
                    <div className="stat-icon bg-white/5 text-gray-400"><GraduationCap size={22} /></div>
                    <div className="stat-value text-white">{topClass?.count ?? 0}</div>
                    <div className="stat-label uppercase tracking-widest text-[10px] font-black text-gray-500">Largest Class: {topClass?.name ?? '—'}</div>
                    <div className="stat-sub text-[9px] text-gray-500 mt-2">Dominant certification level</div>
                </div>
                <div className="stat-card stat-card--burgundy overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-burgundy-500/10 rounded-full blur-2xl" />
                    <div className="stat-icon stat-icon--burgundy"><Zap size={22} /></div>
                    <div className="stat-value text-white">{activity.length}</div>
                    <div className="stat-label uppercase tracking-widest text-[10px] font-black text-gray-500">Active Node Cycles</div>
                    <div className="stat-sub text-[9px] text-burgundy-400/80 mt-2">Submission frequency (Last 90d)</div>
                </div>
            </div>

            <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8 ${fadeInUp}`} style={{ animationDelay: '100ms' }}>
                {/* Growth Pulse Chart */}
                <div className="lg:col-span-2 panel h-[500px] flex flex-col group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Activity size={120} className="text-gold-500/5 rotate-12" />
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gold-500/10 rounded-2xl text-gold-400">
                                <Activity size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white leading-tight">Enlistment Velocity</h3>
                                <p className="text-xs text-gray-500">Monthly registration flux across the district network</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                             <button className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 transition-all">
                                <Share2 size={16} />
                            </button>
                            <button className="btn btn--outline btn--sm border-gold-500/20 hover:border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-burgundy-900 font-black uppercase tracking-widest py-3 px-6" onClick={exportToCSV}>
                                <Download size={14} className="mr-2" /> Export CSV
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex-1 w-full relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={growth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--clr-gold-500)" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="var(--clr-gold-500)" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                                <XAxis 
                                    dataKey="label" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 700 }}
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} 
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--clr-gold-500)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                                <Area 
                                    type="monotone" 
                                    dataKey="value" 
                                    stroke="var(--clr-gold-500)" 
                                    strokeWidth={4}
                                    fillOpacity={1} 
                                    fill="url(#colorValue)" 
                                    animationDuration={2000}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Class Composition */}
                <div className="panel flex flex-col group h-[500px]">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="p-3 bg-burgundy-500/10 rounded-2xl text-burgundy-400">
                            <PieIcon size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white">Cohort Mix</h3>
                            <p className="text-xs text-gray-500">Class composition breakdown</p>
                        </div>
                    </div>

                    <div className="flex-1 relative min-h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={sortedComposition}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={95}
                                    paddingAngle={8}
                                    dataKey="count"
                                    animationBegin={200}
                                    animationDuration={2000}
                                >
                                    {sortedComposition.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.5)" strokeWidth={4} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ background: '#0a0a0c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
                                    itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 700 }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Top Cohort</span>
                            <span className="text-2xl font-black text-white">{topClass?.count ?? 0}</span>
                        </div>
                    </div>

                    <div className="space-y-3 mt-8">
                        {sortedComposition.slice(0, 4).map((cls, i) => (
                            <div key={i} className="flex items-center justify-between group/item">
                                <div className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full shadow-lg" style={{ background: COLORS[i % COLORS.length] }} />
                                    <span className="text-xs font-bold text-gray-400 group-hover/item:text-white transition-colors uppercase tracking-tight">{cls.name}</span>
                                </div>
                                <span className="text-xs font-black text-white">{cls.count}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/5">
                        <div className="p-4 rounded-xl bg-gold-500/5 border border-gold-500/10 relative overflow-hidden group-hover:bg-gold-500/10 transition-all duration-500">
                            <div className="flex items-center gap-2 text-gold-500 mb-2">
                                <Award size={16} />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Live Pulse Intelligence</span>
                            </div>
                            <p className="text-[11px] text-gray-400 leading-relaxed italic m-0">
                                Strategic Focus: Data indicates <b>{topClass?.name}</b> is your primary growth engine. We suggest increasing {topClass?.name} fairs to capitalize on this momentum.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

