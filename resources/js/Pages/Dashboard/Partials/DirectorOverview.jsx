import { Users, Shield, GraduationCap, CalendarClock, Tag, Clock, MapPin, Megaphone, AlertTriangle, Info, TrendingUp, ChevronRight } from 'lucide-react';
import { useMemo } from 'react';

export default function DirectorOverview({ overview, units, district_events = [], district_bulletins = [] }) {
    const classTotalsText = useMemo(() => {
        const totals = overview?.class_totals ?? [];
        return totals.map((t) => `${t.name}: ${t.count}`).join(' • ');
    }, [overview]);

    // Animation variation
    const fadeInUp = "animate-in fade-in slide-in-from-bottom-4 duration-700";

    return (
        <div className="space-y-8">
            {/* District Bulletins (High Priority) */}
            {district_bulletins && district_bulletins.length > 0 && (
                <div className={`space-y-3 ${fadeInUp}`}>
                    {district_bulletins.map(bulletin => (
                        <div key={bulletin.id} className="relative overflow-hidden group">
                            <div className={`flex flex-col sm:flex-row gap-5 p-5 sm:p-6 rounded-2xl border transition-all duration-500 ${
                                bulletin.level === 'Urgent' 
                                    ? 'bg-burgundy-900/40 border-burgundy-500/30' 
                                    : 'bg-gold-900/10 border-gold-500/20'
                            }`}>
                                {/* Gradient Ambient Pulse */}
                                {bulletin.level === 'Urgent' && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-burgundy-500/5 to-transparent animate-pulse pointer-events-none" />
                                )}
                                
                                <div className={`p-3 rounded-2xl self-start ${
                                    bulletin.level === 'Urgent' ? 'bg-burgundy-500/20 text-burgundy-400' : 'bg-gold-500/20 text-gold-400'
                                }`}>
                                    {bulletin.level === 'Urgent' ? <AlertTriangle size={24} className="animate-pulse" /> : <Info size={24} />}
                                </div>
                                
                                <div className="flex-1 relative z-10">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded-full ${
                                            bulletin.level === 'Urgent' ? 'bg-burgundy-500/20 text-burgundy-400' : 'bg-gold-500/20 text-gold-400'
                                        }`}>
                                            {bulletin.level} District Alert
                                        </span>
                                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-1">
                                            <Clock size={10} /> Just Now
                                        </span>
                                    </div>
                                    <h4 className="text-lg font-black text-white mb-2 leading-tight group-hover:text-gold-400 transition-colors">{bulletin.title}</h4>
                                    <p className="text-sm text-gray-400 leading-relaxed max-w-2xl">{bulletin.content}</p>
                                </div>

                                <button className="self-center px-4 py-2 bg-white/5 hover:bg-white/10 text-xs font-black uppercase tracking-widest text-white rounded-xl border border-white/5 transition-all">
                                    Acknowledge
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className={`grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 ${fadeInUp}`} style={{ animationDelay: '100ms' }}>
                <div className="stat-card stat-card--burgundy overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-burgundy-500/10 rounded-full blur-2xl group-hover:bg-burgundy-500/20 transition-all duration-500" />
                    <div className="stat-icon stat-icon--burgundy"><Users size={22} /></div>
                    <div className="stat-value text-white">{overview?.total_pathfinders ?? 0}</div>
                    <div className="stat-label uppercase tracking-[0.1em] text-[10px] font-black text-gray-500">Pathfinders</div>
                    <div className="stat-sub font-mono text-[9px] text-burgundy-400/80 mt-2 truncate">{classTotalsText || 'No enrollment data'}</div>
                </div>

                <div className="stat-card stat-card--gray overflow-hidden group border border-white/10 bg-white/[0.02]">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all duration-500" />
                    <div className="stat-icon bg-white/5 text-gray-400"><TrendingUp size={22} /></div>
                    <div className="stat-value text-white">
                        {overview?.boarding_stats?.boarding ?? 0} <span className="text-gray-500">/</span> {overview?.boarding_stats?.day ?? 0}
                    </div>
                    <div className="stat-label uppercase tracking-[0.1em] text-[10px] font-black text-gray-500">Boarding Balance</div>
                    <div className="stat-sub text-[9px] text-gray-500 mt-2">Active School Season Log</div>
                </div>

                <div className="stat-card stat-card--gold overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-gold-500/10 rounded-full blur-2xl group-hover:bg-gold-500/20 transition-all duration-500" />
                    <div className="stat-icon stat-icon--gold"><Shield size={22} /></div>
                    <div className="stat-value text-white">{overview?.master_guides?.total ?? 0}</div>
                    <div className="stat-label uppercase tracking-[0.1em] text-[10px] font-black text-gray-500">Master Guides</div>
                    <div className="stat-sub text-[9px] text-gold-400/80 mt-2">{overview?.master_guides?.mg ?? 0} Invested • {overview?.master_guides?.mgt ?? 0} In-Training</div>
                </div>

                <div className="stat-card stat-card--success overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-all duration-500" />
                    <div className="stat-icon stat-icon--success"><GraduationCap size={22} /></div>
                    <div className="stat-value text-white">
                        {overview?.latest_attendance?.present ?? 0} 
                        <span className="text-gray-600 text-sm ml-2 font-normal">/ {overview?.latest_attendance?.total ?? 0}</span>
                    </div>
                    <div className="stat-label uppercase tracking-[0.1em] text-[10px] font-black text-gray-500">Record of Attendance</div>
                    <div className="stat-sub text-[9px] text-green-400/80 mt-2 truncate">
                        {overview?.latest_attendance 
                            ? `${overview.latest_attendance.date} Pulse`
                            : 'Pending first log session'}
                    </div>
                </div>
            </div>

            {district_events && district_events.length > 0 && (
                <div className={`space-y-6 ${fadeInUp}`} style={{ animationDelay: '200ms' }}>
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gold-500\/10 rounded-xl text-gold-500">
                                <CalendarClock size={20} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white">District Assemblies</h3>
                                <p className="text-xs text-gray-500">Mandatory gatherings and competitive events</p>
                            </div>
                        </div>
                        <button className="text-[10px] font-black uppercase tracking-widest text-gold-500 hover:text-white transition-colors">
                            View Calendar
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {district_events.map(event => (
                            <div key={event.id} className="panel p-0 overflow-hidden group border-white/5 hover:border-gold-500 transition-all duration-700">
                                <div className="relative min-h-[120px] p-6 flex flex-col justify-end bg-surface-900 border-b border-white/5">
                                    {/* Glass Overlay Effect */}
                                    <div className="absolute inset-0 bg-gold-500\/5 group-hover:bg-gold-500\/10 transition-all" />
                                    
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 text-gold-400 mb-2">
                                            <Tag size={12} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">{event.type}</span>
                                        </div>
                                        <h4 className="text-xl font-black text-white leading-tight">{event.name}</h4>
                                    </div>
                                </div>
                                
                                <div className="p-6 space-y-4">
                                    <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 h-9">
                                        {event.description || 'Join the wider district community for this specialized session.'}
                                    </p>
 
                                    <div className="space-y-2 border-t border-white/5 pt-4">
                                        <div className="flex items-center gap-3 text-xs text-white font-bold">
                                            <Clock size={14} className="text-burgundy-400" />
                                            {new Date(event.start_date).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-3 text-[11px] text-gray-500 font-medium">
                                            <MapPin size={14} />
                                            {event.location || 'Location Centralized TBA'}
                                        </div>
                                    </div>
 
                                    <button className="w-full py-3 bg-white/5 hover:bg-gold-500 text-white hover:text-black text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-white/5">
                                        Mission Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
