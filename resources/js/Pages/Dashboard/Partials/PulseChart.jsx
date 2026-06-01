import React from 'react';

export default function PulseChart({ data = [], height = 200, color = 'var(--clr-gold-500)' }) {
    if (data.length === 0) return null;

    const maxVal = Math.max(...data.map(d => d.value), 1);
    const width = 1000;
    const padding = 40;
    
    // Calculate points
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * (width - 2 * padding) + padding;
        const y = height - ((d.value / maxVal) * (height - 2 * padding) + padding);
        return { x, y, label: d.label, value: d.value };
    });

    // Create Path
    const linePath = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

    return (
        <div style={{ width: '100%', position: 'relative' }}>
            <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', overflow: 'visible' }}>
                <defs>
                    <linearGradient id="pulseGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.2 }} />
                        <stop offset="100%" style={{ stopColor: color, stopOpacity: 0 }} />
                    </linearGradient>
                </defs>

                {/* Grid Lines */}
                {[0, 0.25, 0.5, 0.75, 1].map(v => (
                    <line 
                        key={v}
                        x1={padding} 
                        y1={height - (v * (height - 2 * padding) + padding)} 
                        x2={width - padding} 
                        y2={height - (v * (height - 2 * padding) + padding)} 
                        stroke="rgba(255,255,255,0.05)" 
                        strokeWidth="1"
                    />
                ))}

                {/* Area */}
                <path d={areaPath} fill="url(#pulseGradient)" />
                
                {/* Line */}
                <path d={linePath} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                {/* Points */}
                {points.map((p, i) => (
                    <g key={i}>
                        <circle cx={p.x} cy={p.y} r="4" fill="#121212" stroke={color} strokeWidth="2" />
                        <text x={p.x} y={height - 5} textAnchor="middle" style={{ fontSize: '14px', fill: 'var(--clr-text-muted)', fontWeight: 600 }}>{p.label}</text>
                        {p.value > 0 && (
                            <text x={p.x} y={p.y - 12} textAnchor="middle" style={{ fontSize: '14px', fill: '#fff', fontWeight: 900 }}>{p.value}</text>
                        )}
                    </g>
                ))}
            </svg>
        </div>
    );
}
