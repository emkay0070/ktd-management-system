import { Shield, MapPin, Users, Award, ExternalLink } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function ClubsDirectory({ churches, readonly }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h3 className="form-section-title mb-1">Clubs Directory</h3>
                    <p className="text-xs text-muted">Manage and oversee all local clubs within your jurisdiction.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {churches.map(church => (
                    <div key={church.id} className="panel p-0 relative overflow-hidden group hover:border-gold-500/30 transition-all cursor-default" style={{ display: 'flex', flexDirection: 'column' }}>
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        
                        <div className="p-6 pb-5 border-b border-white/5" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                            <div className="h-12 w-12 rounded-xl bg-surface-700 border border-gold-400/20 text-gold-400 flex items-center justify-center shrink-0 shadow-lg shadow-black/50" style={{ width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Shield size={24} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0, paddingTop: '4px' }}>
                                <h4 className="text-lg font-black text-white truncate m-0 leading-tight group-hover:text-gold-400 transition-colors" style={{ margin: 0 }}>{church.name}</h4>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', color: 'var(--clr-text-muted)' }}>
                                    <MapPin size={12} className="text-gold-400/50" />
                                    <span className="text-[11px] font-bold uppercase tracking-widest truncate">{church.location || 'Location Not Set'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                                <div className="bg-black/20 rounded-lg p-3 text-center border border-white/[0.02]">
                                    <div className="text-xl font-black text-white">{church.total}</div>
                                    <div className="text-[9px] uppercase tracking-widest text-muted mt-1 font-bold">Members</div>
                                </div>
                                <div className="bg-black/20 rounded-lg p-3 text-center border border-white/[0.02]">
                                    <div className="text-xl font-black text-burgundy-400">{church.master_guides}</div>
                                    <div className="text-[9px] uppercase tracking-widest text-muted mt-1 font-bold">Leaders</div>
                                </div>
                                <div className="bg-black/20 rounded-lg p-3 text-center border border-white/[0.02]">
                                    <div className="text-xl font-black text-gold-400">{church.mgt}</div>
                                    <div className="text-[9px] uppercase tracking-widest text-muted mt-1 font-bold">MGTs</div>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '8px' }}>
                                <div className={`badge ${church.status === 'active' ? 'badge--success' : 'badge--warning'}`}>
                                    {church.status === 'active' ? 'Active Club' : 'Action Required'}
                                </div>
                                
                                <Link 
                                    href={route('clubs.show', church.id)}
                                    className="text-[10px] font-black uppercase tracking-[0.2em] text-gold-400 hover:text-gold-300 transition-colors py-2 px-3 rounded-lg hover:bg-gold-500/10"
                                    style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}
                                >
                                    Enter Club <ExternalLink size={14} />
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}

                {churches.length === 0 && (
                    <div style={{ gridColumn: '1 / -1', padding: '80px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', opacity: 0.4, background: 'rgba(0,0,0,0.1)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.05)' }}>
                        <MapPin size={48} className="mb-4 text-gold-400" strokeWidth={1} />
                        <div className="text-xs font-black uppercase tracking-[0.2em]">No Churches Linked</div>
                        <p className="text-xs mt-2 max-w-sm">No local clubs have been assigned to this district yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
