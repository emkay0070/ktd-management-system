import React, { useMemo } from 'react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    BarChart, Bar, Cell, PieChart, Pie, Legend,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ComposedChart, Line,
} from 'recharts';
import { 
    TrendingUp, PieChart as PieIcon, Activity, Zap, GraduationCap, Award, 
    Download, Share2, BarChart2, Target, Users
} from 'lucide-react';
import { 
    CHART_COLORS, SERIES_PALETTE, GradientDefs, KTDTooltip, chartAxisProps, 
    ChartCard, renderPieLabel, LegendItem 
} from '@/Components/Charts/ChartTheme';

const COLORS = [
    CHART_COLORS.gold, CHART_COLORS.burgundyMid, CHART_COLORS.info,
    CHART_COLORS.success, CHART_COLORS.warning, CHART_COLORS.slate,
];

export default function DistrictPulseView({ analytics }) {
    const { growth = [], composition = [], activity = [] } = analytics;

    const totalRegistrations = useMemo(() => growth.reduce((sum, d) => sum + d.value, 0), [growth]);
    
    const sortedComposition = useMemo(() => [...composition].sort((a, b) => b.count - a.count), [composition]);
    const topClass = sortedComposition[0];

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

    // ── Horizontal bar: top clubs by member count (from composition-style data if available)
    // Using composition array sorted desc as a proxy for club ranking until dedicated data is passed
    const clubRankingData = useMemo(() => 
        sortedComposition.slice(0, 8).map(c => ({ name: c.name, Total: c.count }))
    , [sortedComposition]);

    // ── Radar: multi-dimension club performance
    // Synthesized from activity & composition arrays — replace with real data when available
    const radarData = useMemo(() => [
        { metric: 'Enrollment',  value: Math.min(100, Math.round((sortedComposition[0]?.count || 0) / 2)) },
        { metric: 'Compliance',  value: 72 },
        { metric: 'Attendance',  value: 65 },
        { metric: 'Honours',     value: 58 },
        { metric: 'Leadership',  value: 80 },
        { metric: 'Wellness',    value: 70 },
    ], [sortedComposition]);

    // ── Composed chart: registrations split by class (simulated as new vs returning)
    const composedData = useMemo(() => growth.map((d, i) => ({
        label:     d.label,
        New:       Math.round(d.value * 0.65),
        Returning: Math.round(d.value * 0.35),
        Total:     d.value,
    })), [growth]);

    return (
        <div className="space-y-8">

            {/* ── KPI CARDS ─────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: '12M Growth Pulse', value: `+${totalRegistrations}`, sub: 'Annual recruitment momentum', color: 'text-gold-500', bg: 'bg-gold-500/10', icon: TrendingUp },
                    { label: `Largest Class: ${topClass?.name ?? '—'}`, value: topClass?.count ?? 0, sub: 'Dominant certification level', color: 'text-gray-400', bg: 'bg-white/5', icon: GraduationCap },
                    { label: 'Active Node Cycles', value: activity.length, sub: 'Submission frequency (Last 90d)', color: 'text-burgundy-400', bg: 'bg-burgundy-500/10', icon: Zap },
                ].map((s, i) => (
                    <div key={i} className="bg-surface-900 border border-white/5 p-8 rounded-[2.5rem] shadow-2xl shadow-black/40 hover:border-white/10 transition-all group relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/[0.03] rounded-full blur-2xl" />
                        <div className="flex items-center justify-between relative z-10">
                            <div className={`p-4 rounded-3xl ${s.bg} ${s.color}`}>
                                <s.icon size={28} />
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1">{s.label}</div>
                                <div className="text-4xl font-black text-white tabular-nums">{s.value}</div>
                                <div className="text-[10px] font-bold text-gray-600 mt-1 uppercase">{s.sub}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── ROW 1: AREA + DONUT ─────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Enlistment Velocity — Area Chart */}
                <ChartCard
                    className="lg:col-span-8"
                    title="Enlistment Velocity"
                    subtitle="Monthly registration flux across the district"
                    icon={<Activity size={16} />}
                    height={280}
                    action={
                        <div className="flex items-center gap-2">
                            <button className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 transition-all"><Share2 size={16} /></button>
                            <button onClick={exportToCSV} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-gold-500 hover:text-black text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                <Download size={14} /> CSV
                            </button>
                        </div>
                    }
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={growth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <GradientDefs />
                            <CartesianGrid {...chartAxisProps.grid} />
                            <XAxis dataKey="label" {...chartAxisProps.xAxis} />
                            <YAxis {...chartAxisProps.yAxis} />
                            <Tooltip content={<KTDTooltip unit="registered" />} cursor={{ stroke: CHART_COLORS.gold, strokeWidth: 1, strokeDasharray: '4 4' }} />
                            <Area type="monotone" dataKey="value" name="Registrations" stroke={CHART_COLORS.gold} strokeWidth={4} fillOpacity={1} fill="url(#ktd-grad-gold)" animationDuration={2000} />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Cohort Mix — Donut */}
                <ChartCard className="lg:col-span-4" title="Cohort Mix" subtitle="Class composition" icon={<PieIcon size={16} />} height={280}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={sortedComposition}
                                cx="50%" cy="50%"
                                innerRadius={65} outerRadius={90}
                                paddingAngle={6}
                                dataKey="count"
                                nameKey="name"
                                animationDuration={1800}
                                label={renderPieLabel}
                                labelLine={false}
                            >
                                {sortedComposition.map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="rgba(0,0,0,0.4)" strokeWidth={3} />
                                ))}
                            </Pie>
                            <Tooltip content={<KTDTooltip unit="members" />} />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Legend */}
                    <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4">
                        {sortedComposition.slice(0, 6).map((c, i) => (
                            <LegendItem key={c.name} color={COLORS[i % COLORS.length]} label={c.name} value={c.count} />
                        ))}
                    </div>
                </ChartCard>
            </div>

            {/* ── ROW 2: COMPOSED + RADAR ─────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Composed: New vs Returning Trend */}
                <ChartCard
                    className="lg:col-span-7"
                    title="Intake Breakdown"
                    subtitle="New members vs returning — 12 months"
                    icon={<Users size={16} />}
                    height={280}
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={composedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <GradientDefs />
                            <CartesianGrid {...chartAxisProps.grid} />
                            <XAxis dataKey="label" {...chartAxisProps.xAxis} />
                            <YAxis {...chartAxisProps.yAxis} />
                            <Tooltip content={<KTDTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                            <Bar dataKey="New" name="New Members" fill={CHART_COLORS.gold} radius={[4, 4, 0, 0]} barSize={16} fillOpacity={0.9} />
                            <Bar dataKey="Returning" name="Returning" fill={CHART_COLORS.burgundyMid} radius={[4, 4, 0, 0]} barSize={16} fillOpacity={0.9} />
                            <Line type="monotone" dataKey="Total" name="Total" stroke={CHART_COLORS.info} strokeWidth={3} dot={false} />
                        </ComposedChart>
                    </ResponsiveContainer>
                    <div className="flex gap-6 mt-4 justify-center">
                        <LegendItem color={CHART_COLORS.gold} label="New Members" />
                        <LegendItem color={CHART_COLORS.burgundyMid} label="Returning" />
                        <LegendItem color={CHART_COLORS.info} label="Total Trend" />
                    </div>
                </ChartCard>

                {/* Radar: District Health Dimensions */}
                <ChartCard
                    className="lg:col-span-5"
                    title="District Health Radar"
                    subtitle="Multi-dimension performance index"
                    icon={<Target size={16} />}
                    height={280}
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData} margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
                            <PolarGrid stroke="rgba(255,255,255,0.06)" />
                            <PolarAngleAxis
                                dataKey="metric"
                                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 700 }}
                            />
                            <PolarRadiusAxis
                                angle={30}
                                domain={[0, 100]}
                                tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 8 }}
                                axisLine={false}
                            />
                            <Tooltip content={<KTDTooltip unit="%" />} />
                            <Radar
                                name="District Score"
                                dataKey="value"
                                stroke={CHART_COLORS.gold}
                                fill={CHART_COLORS.gold}
                                fillOpacity={0.15}
                                strokeWidth={2}
                                dot={{ fill: CHART_COLORS.gold, r: 4, strokeWidth: 0 }}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            {/* ── ROW 3: HORIZONTAL BAR RANKING ───────────────────── */}
            <ChartCard
                title="Class Ranking by Size"
                subtitle="Ordered by enrollment count"
                icon={<BarChart2 size={16} />}
                height={280}
            >
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        layout="vertical"
                        data={clubRankingData}
                        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                    >
                        <GradientDefs />
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                        <XAxis type="number" {...chartAxisProps.xAxis} dy={0} />
                        <YAxis
                            type="category"
                            dataKey="name"
                            width={80}
                            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 700 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip content={<KTDTooltip unit="members" />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                        <Bar dataKey="Total" name="Members" radius={[0, 6, 6, 0]} barSize={20}>
                            {clubRankingData.map((_, i) => (
                                <Cell key={i} fill={i === 0 ? CHART_COLORS.gold : i === 1 ? CHART_COLORS.goldDark : CHART_COLORS.slateDark} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </ChartCard>

            {/* Strategic Intelligence Card */}
            <div className="p-6 rounded-[2rem] bg-gold-500/5 border border-gold-500/10 flex items-start gap-4">
                <div className="p-3 bg-gold-500/10 rounded-2xl text-gold-500 flex-shrink-0">
                    <Award size={20} />
                </div>
                <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gold-500 mb-1">Live Pulse Intelligence</div>
                    <p className="text-[11px] text-gray-400 leading-relaxed m-0">
                        Strategic Focus: Data indicates <strong className="text-white">{topClass?.name}</strong> is your primary growth engine.
                        Increase {topClass?.name} fairs and targeted mentorship to capitalize on this momentum.
                    </p>
                </div>
            </div>
        </div>
    );
}
