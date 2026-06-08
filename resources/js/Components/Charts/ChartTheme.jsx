/**
 * KTD Management System — Shared Chart Theme
 * ============================================
 * Central configuration for all Recharts visualizations across the system.
 * Import from this file to keep colors, tooltips, and styles consistent.
 *
 * Usage:
 *   import { CHART_COLORS, KTDTooltip, GradientDefs, chartAxisProps, RADIAN } from '@/Components/Charts/ChartTheme';
 */

import React from 'react';

// ─────────────────────────────────────────────────────────
// COLOR PALETTE
// ─────────────────────────────────────────────────────────

export const CHART_COLORS = {
    gold:      '#eab308',
    goldLight: '#fde68a',
    goldDark:  '#a16207',
    burgundy:  '#7f1d1d',
    burgundyMid: '#991b1b',
    burgundyLight: '#fca5a5',
    info:      '#38bdf8',
    success:   '#4ade80',
    warning:   '#fb923c',
    slate:     '#94a3b8',
    slateLight:'#cbd5e1',
    slateDark: '#475569',
    white10:   'rgba(255,255,255,0.10)',
    white5:    'rgba(255,255,255,0.05)',
    white3:    'rgba(255,255,255,0.03)',
};

// Ordered series palette for multi-series charts
export const SERIES_PALETTE = [
    CHART_COLORS.gold,
    CHART_COLORS.burgundyMid,
    CHART_COLORS.info,
    CHART_COLORS.success,
    CHART_COLORS.warning,
    CHART_COLORS.slate,
    CHART_COLORS.goldDark,
    CHART_COLORS.burgundyLight,
];

// Pathfinder class colors (canonical)
export const CLASS_COLORS = {
    Friend:    '#94a3b8',
    Companion: '#60a5fa',
    Explorer:  '#4ade80',
    Ranger:    '#facc15',
    Voyager:   '#fb923c',
    Guide:     '#f87171',
};

// Welfare case category colors
export const WELFARE_COLORS = {
    Illness:          '#f87171',
    Bereavement:      '#7f1d1d',
    Financial:        '#fbbf24',
    Emergency:        '#ef4444',
    'Social Support': '#60a5fa',
    Other:            '#94a3b8',
};


// ─────────────────────────────────────────────────────────
// GRADIENT DEFINITIONS (SVG <defs> for AreaCharts)
// ─────────────────────────────────────────────────────────

/**
 * Renders a set of named SVG gradient defs.
 * Include once inside any <BarChart> / <AreaChart> etc.
 *
 * Usage: <GradientDefs />
 */
export function GradientDefs() {
    return (
        <defs>
            <linearGradient id="ktd-grad-gold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={CHART_COLORS.gold}    stopOpacity={0.35} />
                <stop offset="95%" stopColor={CHART_COLORS.gold}    stopOpacity={0}    />
            </linearGradient>
            <linearGradient id="ktd-grad-burgundy" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={CHART_COLORS.burgundyMid} stopOpacity={0.35} />
                <stop offset="95%" stopColor={CHART_COLORS.burgundyMid} stopOpacity={0}    />
            </linearGradient>
            <linearGradient id="ktd-grad-info" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={CHART_COLORS.info}    stopOpacity={0.35} />
                <stop offset="95%" stopColor={CHART_COLORS.info}    stopOpacity={0}    />
            </linearGradient>
            <linearGradient id="ktd-grad-success" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={CHART_COLORS.success} stopOpacity={0.35} />
                <stop offset="95%" stopColor={CHART_COLORS.success} stopOpacity={0}    />
            </linearGradient>
            {/* Horizontal variant for bar backgrounds */}
            <linearGradient id="ktd-grad-gold-h" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%"   stopColor={CHART_COLORS.gold}    stopOpacity={0.8}  />
                <stop offset="100%" stopColor={CHART_COLORS.goldDark} stopOpacity={1}   />
            </linearGradient>
            <linearGradient id="ktd-grad-burgundy-h" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%"   stopColor={CHART_COLORS.burgundyMid} stopOpacity={0.8} />
                <stop offset="100%" stopColor={CHART_COLORS.burgundy}    stopOpacity={1}   />
            </linearGradient>
        </defs>
    );
}


// ─────────────────────────────────────────────────────────
// SHARED TOOLTIP COMPONENT
// ─────────────────────────────────────────────────────────

/**
 * Drop-in styled tooltip for any Recharts chart.
 *
 * Usage: <Tooltip content={<KTDTooltip />} />
 *        <Tooltip content={<KTDTooltip unit="members" />} />
 */
export function KTDTooltip({ active, payload, label, unit = '' }) {
    if (!active || !payload || !payload.length) return null;
    return (
        <div style={{
            background:   '#0c0c0e',
            border:       '1px solid rgba(234,179,8,0.25)',
            borderRadius: '16px',
            padding:      '12px 16px',
            boxShadow:    '0 20px 40px rgba(0,0,0,0.6)',
            backdropFilter: 'blur(12px)',
            minWidth:     '140px',
        }}>
            {label && (
                <div style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: CHART_COLORS.gold, marginBottom: 6 }}>
                    {label}
                </div>
            )}
            {payload.map((entry, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: i < payload.length - 1 ? 4 : 0 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: entry.color || entry.fill || CHART_COLORS.gold, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 700, flex: 1 }}>
                        {entry.name}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 900, color: '#fff' }}>
                        {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
                        {unit ? ` ${unit}` : ''}
                    </span>
                </div>
            ))}
        </div>
    );
}

/**
 * Tooltip that shows a percentage value.
 */
export function KTDPercentTooltip({ active, payload, label }) {
    if (!active || !payload || !payload.length) return null;
    return (
        <div style={{
            background:   '#0c0c0e',
            border:       '1px solid rgba(234,179,8,0.25)',
            borderRadius: '16px',
            padding:      '12px 16px',
            boxShadow:    '0 20px 40px rgba(0,0,0,0.6)',
        }}>
            {label && (
                <div style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: CHART_COLORS.gold, marginBottom: 6 }}>
                    {label}
                </div>
            )}
            {payload.map((entry, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: entry.color || CHART_COLORS.gold }} />
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 700, flex: 1 }}>{entry.name}</span>
                    <span style={{ fontSize: 13, fontWeight: 900, color: '#fff' }}>{entry.value}%</span>
                </div>
            ))}
        </div>
    );
}


// ─────────────────────────────────────────────────────────
// SHARED AXIS PROPS
// ─────────────────────────────────────────────────────────

export const chartAxisProps = {
    xAxis: {
        axisLine:  false,
        tickLine:  false,
        tick:      { fill: 'rgba(255,255,255,0.35)', fontSize: 10, fontWeight: 700 },
        dy:        8,
    },
    yAxis: {
        axisLine:  false,
        tickLine:  false,
        tick:      { fill: 'rgba(255,255,255,0.35)', fontSize: 10 },
        width:     32,
    },
    grid: {
        strokeDasharray: '3 3',
        stroke:          'rgba(255,255,255,0.04)',
        vertical:        false,
    },
};


// ─────────────────────────────────────────────────────────
// CHART CARD WRAPPER
// ─────────────────────────────────────────────────────────

/**
 * Standard chart panel shell used across dashboards.
 *
 * Usage:
 *   <ChartCard title="Enlistment Velocity" icon={<Activity size={16}/>} subtitle="Last 12 months" height={320}>
 *     <ResponsiveContainer>...</ResponsiveContainer>
 *   </ChartCard>
 */
export function ChartCard({ title, subtitle, icon, action, height = 300, children, className = '' }) {
    return (
        <div className={`bg-surface-800 border border-white/5 rounded-[2.5rem] p-8 flex flex-col ${className}`}>
            <div className="flex justify-between items-start mb-6 flex-shrink-0">
                <div className="flex items-center gap-3">
                    {icon && (
                        <div className="p-2.5 rounded-2xl bg-gold-500/10 text-gold-500">
                            {icon}
                        </div>
                    )}
                    <div>
                        <div className="text-white font-black text-sm uppercase tracking-widest leading-tight">{title}</div>
                        {subtitle && <div className="text-[10px] text-gray-500 font-bold mt-0.5 uppercase tracking-widest">{subtitle}</div>}
                    </div>
                </div>
                {action && <div className="flex-shrink-0">{action}</div>}
            </div>
            <div style={{ height, flex: '1 1 auto', minHeight: 0 }}>
                {children}
            </div>
        </div>
    );
}


// ─────────────────────────────────────────────────────────
// CUSTOM LABEL for Pie/Donut charts
// ─────────────────────────────────────────────────────────

export const RADIAN = Math.PI / 180;

/**
 * Inline percentage label on Pie slices.
 * Usage: <Pie label={renderPieLabel} ... />
 */
export function renderPieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
    if (percent < 0.05) return null; // skip tiny slices
    const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
        <text x={x} y={y} fill="rgba(255,255,255,0.9)" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={900}>
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
}


// ─────────────────────────────────────────────────────────
// SPARKLINE MINI CHART (inline club cards)
// ─────────────────────────────────────────────────────────

import { AreaChart, Area, ResponsiveContainer } from 'recharts';

/**
 * Tiny inline sparkline for club cards.
 *
 * Usage: <Sparkline data={[{v:10},{v:12},{v:9}]} color="#eab308" height={40} />
 */
export function Sparkline({ data = [], dataKey = 'v', color = CHART_COLORS.gold, height = 40 }) {
    if (!data || data.length < 2) {
        return <div style={{ height }} className="opacity-20 flex items-center justify-center text-[9px] text-gray-600 font-black uppercase tracking-widest">No data</div>;
    }
    const gradId = `spark-grad-${Math.random().toString(36).slice(2,7)}`;
    return (
        <div style={{ height, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                    <defs>
                        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor={color} stopOpacity={0.4} />
                            <stop offset="95%" stopColor={color} stopOpacity={0}   />
                        </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fill={`url(#${gradId})`} dot={false} animationDuration={1000} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}


// ─────────────────────────────────────────────────────────
// LEGEND ITEM (reusable inline legend dot + label)
// ─────────────────────────────────────────────────────────

export function LegendItem({ color, label, value }) {
    return (
        <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
            {value !== undefined && (
                <span className="text-[10px] font-black text-white ml-auto">{value}</span>
            )}
        </div>
    );
}
