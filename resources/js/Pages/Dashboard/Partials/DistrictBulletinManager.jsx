import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Megaphone, Plus, Trash2, Clock, Info, AlertTriangle, Zap, Eye, EyeOff } from 'lucide-react';

export default function DistrictBulletinManager({ bulletins = [] }) {
    const [view, setView] = useState('list'); // list, create

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        content: '',
        level: 'Info',
        expires_at: '',
    });

    const levelColors = {
        Info: 'var(--clr-gold-500)',
        Warning: 'var(--orange-500)',
        Urgent: 'var(--clr-burgundy-500)',
    };

    const handleCreate = (e) => {
        e.preventDefault();
        post(route('district_bulletins.store'), {
            onSuccess: () => {
                reset();
                setView('list');
            }
        });
    };

    const toggleStatus = (id) => {
        router.post(route('district_bulletins.toggle', id));
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this bulletin?')) {
            router.delete(route('district_bulletins.destroy', id));
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h3 style={{ margin: 0, color: '#fff' }}>Official District Bulletins</h3>
                    <p style={{ fontSize: '12px', color: 'var(--clr-text-muted)' }}>Send priority announcements to all local club directors.</p>
                </div>
                {view === 'list' && (
                    <button className="btn btn--primary btn--sm" onClick={() => setView('create')}>
                        <Plus size={16} className="mr-2" /> New Bulletin
                    </button>
                )}
            </div>
            
            <div style={{ height: '12px' }}></div>

            {view === 'create' ? (
                <div className="panel slide-in">
                    <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <h3>Compose Bulletin</h3>
                        <div className="form-grid-2">
                            <div className="form-group">
                                <label>Subject / Title</label>
                                <input className="h-input" value={data.title} onChange={e => setData('title', e.target.value)} required placeholder="e.g. Mandatory Uniform Inspection Date" />
                            </div>
                            <div className="form-group">
                                <label>Urgency Level</label>
                                <select className="h-select" value={data.level} onChange={e => setData('level', e.target.value)}>
                                    <option value="Info">Info (Gold)</option>
                                    <option value="Warning">Warning (Orange)</option>
                                    <option value="Urgent">Urgent (Burgundy)</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Content</label>
                            <textarea className="h-textarea" value={data.content} onChange={e => setData('content', e.target.value)} required rows={4} placeholder="Type your message here..." />
                        </div>
                        <div className="form-group">
                            <label>Expiration Date (Hide automatically after this date)</label>
                            <input type="datetime-local" className="h-input" value={data.expires_at} onChange={e => setData('expires_at', e.target.value)} />
                        </div>

                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                            <button type="button" className="btn btn--secondary" onClick={() => setView('list')}>Cancel</button>
                            <button type="submit" className="btn btn--primary" disabled={processing}>
                                <Zap size={16} className="mr-2" /> Broadcast to All Clubs
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {bulletins.map(bulletin => (
                        <div key={bulletin.id} className="panel" style={{ padding: 'var(--sp-8)', borderLeft: `4px solid ${levelColors[bulletin.level]}`, opacity: bulletin.is_active ? 1 : 0.6 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <div style={{ color: levelColors[bulletin.level], marginTop: '2px' }}>
                                        {bulletin.level === 'Urgent' ? <AlertTriangle size={20} /> : <Megaphone size={20} />}
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                            <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: levelColors[bulletin.level] }}>{bulletin.level}</span>
                                            {!bulletin.is_active && <span className="badge badge--neutral">INACTIVE</span>}
                                        </div>
                                        <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#fff' }}>{bulletin.title}</h4>
                                        <p style={{ fontSize: '13px', color: 'var(--clr-text-secondary)', lineHeight: 1.5 }}>{bulletin.content}</p>
                                        
                                        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '16px', fontSize: '11px', color: 'var(--clr-text-muted)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Clock size={14} /> Posted {new Date(bulletin.created_at).toLocaleDateString()}
                                            </div>
                                            {bulletin.expires_at && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    Expires {new Date(bulletin.expires_at).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={() => toggleStatus(bulletin.id)} className="icon-btn" title={bulletin.is_active ? "Hide Bulletin" : "Show Bulletin"}>
                                        {bulletin.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                    <button onClick={() => handleDelete(bulletin.id)} className="icon-btn" style={{ color: 'var(--clr-burgundy-400)' }}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {bulletins.length === 0 && (
                        <div style={{ padding: '60px', textAlign: 'center', opacity: 0.3 }}>
                            <Megaphone size={40} className="mx-auto mb-4" />
                            <p>No bulletins recorded. Start communicating with the district officially.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
