import { Shield, MapPin, Users, Award, ExternalLink, Plus, Building, X } from 'lucide-react';
import { Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';

export default function ClubsDirectory({ churches, readonly }) {
    const [isAdding, setIsAdding] = useState(false);
    
    const { data, setData, post, processing, reset, errors } = useForm({
        name: '',
        location: '',
        is_school: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('district_churches.store'), {
            onSuccess: () => {
                setIsAdding(false);
                reset();
            }
        });
    };
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h3 className="form-section-title mb-1">Clubs Directory</h3>
                    <p className="text-xs text-muted">Manage and oversee all local clubs within your jurisdiction.</p>
                </div>
                {!readonly && (
                    <button 
                        onClick={() => setIsAdding(true)}
                        className="btn btn--primary btn--sm"
                    >
                        <Plus size={16} className="mr-2" /> Register New Club
                    </button>
                )}
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
                        {!readonly && (
                            <button 
                                onClick={() => setIsAdding(true)}
                                className="mt-4 text-xs font-bold text-gold-400 hover:text-gold-300"
                            >
                                Register the first club →
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Add Club Modal */}
            {isAdding && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 fade-in">
                    <div className="bg-surface-800 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold-500 to-burgundy-500"></div>
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gold-500/10 text-gold-400 rounded-lg">
                                    <Building size={20} />
                                </div>
                                <h3 className="text-lg font-black text-white m-0 leading-none">Register Club</h3>
                            </div>
                            <button 
                                onClick={() => setIsAdding(false)}
                                className="text-gray-500 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <form onSubmit={submit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Club / Church Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-surface-900 border border-white/10 rounded-xl text-white px-4 py-3 focus:border-gold-500 outline-none transition-colors"
                                    placeholder="e.g. Kireka Central"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                />
                                {errors.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}
                            </div>
                            
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Location / Physical Address</label>
                                <input
                                    type="text"
                                    className="w-full bg-surface-900 border border-white/10 rounded-xl text-white px-4 py-3 focus:border-gold-500 outline-none transition-colors"
                                    placeholder="e.g. Kireka Hill, Next to Station"
                                    value={data.location}
                                    onChange={e => setData('location', e.target.value)}
                                />
                                {errors.location && <div className="text-red-500 text-xs mt-1">{errors.location}</div>}
                            </div>

                            <label className="flex items-center gap-3 p-4 border border-white/10 rounded-xl cursor-pointer hover:bg-white/5 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={data.is_school}
                                    onChange={e => setData('is_school', e.target.checked)}
                                    className="w-4 h-4 rounded text-gold-500 bg-surface-900 border-white/20 focus:ring-gold-500"
                                />
                                <div>
                                    <div className="text-sm font-bold text-white">School-Based Club</div>
                                    <div className="text-xs text-gray-500">Check this if the club is based in a school rather than a local church.</div>
                                </div>
                            </label>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsAdding(false)}
                                    className="flex-1 py-3 px-4 rounded-xl text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <PrimaryButton 
                                    className="flex-1 justify-center py-3"
                                    disabled={processing}
                                >
                                    {processing ? 'Registering...' : 'Register Club'}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
