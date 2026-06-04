import { useState, useMemo } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Megaphone, Plus, Trash2, Clock, Info, AlertTriangle, Zap, Eye, EyeOff, User, Target, Filter, Search, LayoutGrid, List, MessageSquare } from 'lucide-react';

export default function DistrictBulletinManager({ bulletins = [], canEdit = false, canPublish = false, canDelete = false, auth }) {
    const [view, setView] = useState('list'); // list, create, stats
    const [selectedBulletin, setSelectedBulletin] = useState(null);
    const [search, setSearch] = useState('');
    const [deptFilter, setDeptFilter] = useState('All');
    const [audienceFilter, setAudienceFilter] = useState('All');

    const userRoles = auth?.user?.role_names || [];
    const isDirector = userRoles.includes('district_director') || userRoles.includes('super_admin');

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        content: '',
        level: 'Info',
        message_type: 'bulletin',
        department: 'General',
        target_audience: 'All',
        requires_acknowledgement: false,
        expires_at: '',
    });

    const levelColors = {
        Info: 'text-gold-500 border-gold-500/20 bg-gold-500/5',
        Warning: 'text-orange-500 border-orange-500/20 bg-orange-500/5',
        Urgent: 'text-burgundy-500 border-burgundy-500/20 bg-burgundy-500/5',
    };

    const departments = ['General', 'Curriculum', 'Master Guides', 'Music', 'PBE', 'Welfare', 'Programs', 'Communication'];
    const audiences = ['All', 'Directors', 'Leaders'];

    const filteredBulletins = useMemo(() => {
        return bulletins.filter(b => {
            const matchesSearch = b.title.toLowerCase().includes(search.toLowerCase()) || 
                                 b.content.toLowerCase().includes(search.toLowerCase());
            const matchesDept = deptFilter === 'All' || b.department === deptFilter;
            const matchesAudience = audienceFilter === 'All' || b.target_audience === audienceFilter;
            
            // If user is not Director/Admin, they shouldn't see pending_approval drafts unless they wrote them
            const canSeeDraft = isDirector || b.author_id === auth?.user?.id;
            const isVisible = b.workflow_status === 'published' || canSeeDraft;

            return matchesSearch && matchesDept && matchesAudience && isVisible;
        });
    }, [bulletins, search, deptFilter, audienceFilter, isDirector, auth]);

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

    const handleApprove = (id) => {
        if (confirm('Approve and publish this directive?')) {
            router.post(route('district_bulletins.approve', id));
        }
    };

    const handleAcknowledge = (id) => {
        router.post(route('district_bulletins.acknowledge', id), {}, { preserveScroll: true });
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this bulletin?')) {
            router.delete(route('district_bulletins.destroy', id));
        }
    };

    const hasAcknowledged = (bulletin) => {
        return bulletin.acknowledgements?.some(a => a.user_id === auth?.user?.id);
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-white flex items-center gap-2">
                        <Megaphone className="text-gold-400" size={24} />
                        District Bulletin Command
                    </h3>
                    <p className="text-xs text-gray-500">Draft, target, and publish official announcements to local clubs.</p>
                </div>
                {view === 'list' && (
                    <div className="flex gap-2">
                        {canEdit && (
                            <button className="btn btn--primary btn--sm" onClick={() => setView('create')}>
                                <Plus size={16} className="mr-2" /> New Bulletin Draft
                            </button>
                        )}
                    </div>
                )}
                {(view === 'create' || view === 'stats') && (
                    <button className="btn btn--secondary btn--sm" onClick={() => { setView('list'); setSelectedBulletin(null); }}>
                        Back to Bulletins
                    </button>
                )}
            </div>

            {view === 'create' ? (
                <div className="panel slide-in overflow-hidden">
                    <div className="p-6 border-b border-white/5 bg-white/[0.01]">
                        <h4 className="text-white font-bold">Compose Bulletin</h4>
                        <p className="text-xs text-gray-500">Target your message to specific departments and audiences.</p>
                    </div>
                    <form onSubmit={handleCreate} className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="form-group md:col-span-1">
                                <label>Subject / Title</label>
                                <input className="h-input" value={data.title} onChange={e => setData('title', e.target.value)} required placeholder="e.g. Mandatory Uniform Inspection" />
                                {errors.title && <div className="field-error">{errors.title}</div>}
                            </div>
                            <div className="form-group">
                                <label>Urgency Level</label>
                                <select className="h-select" value={data.level} onChange={e => setData('level', e.target.value)}>
                                    <option value="Info">Info (Gold)</option>
                                    <option value="Warning">Warning (Orange)</option>
                                    <option value="Urgent">Urgent (Burgundy)</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Message Type</label>
                                <select className="h-select" value={data.message_type} onChange={e => setData('message_type', e.target.value)}>
                                    <option value="bulletin">General Bulletin</option>
                                    <option value="directive">Official Directive</option>
                                    <option value="reminder">Reminder</option>
                                    <option value="event_update">Event Update</option>
                                    <option value="engagement_post">Engagement Post</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="form-group">
                                <label>Department</label>
                                <select className="h-select" value={data.department} onChange={e => setData('department', e.target.value)}>
                                    {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Target Audience</label>
                                <select className="h-select" value={data.target_audience} onChange={e => setData('target_audience', e.target.value)}>
                                    {audiences.map(aud => <option key={aud} value={aud}>{aud}</option>)}
                                </select>
                            </div>
                            <div className="form-group flex flex-col justify-end pb-3">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input 
                                        type="checkbox" 
                                        className="h-checkbox"
                                        checked={data.requires_acknowledgement}
                                        onChange={e => setData('requires_acknowledgement', e.target.checked)}
                                    />
                                    <span className="text-xs font-bold text-gray-400 group-hover:text-white transition-colors">Require Acknowledgement</span>
                                </label>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Content</label>
                            <textarea className="h-textarea" value={data.content} onChange={e => setData('content', e.target.value)} required rows={4} placeholder="Type your message here..." />
                            {errors.content && <div className="field-error">{errors.content}</div>}
                        </div>

                        <div className="form-group">
                            <label>Expiration Date (Optional)</label>
                            <input type="datetime-local" className="h-input" value={data.expires_at} onChange={e => setData('expires_at', e.target.value)} />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                            <button type="button" className="btn btn--ghost" onClick={() => setView('list')}>Cancel</button>
                            <button type="submit" className="btn btn--primary" disabled={processing}>
                                {processing ? 'Saving...' : 'Save Bulletin Draft'}
                            </button>
                        </div>
                    </form>
                </div>
            ) : view === 'stats' && selectedBulletin ? (
                <div className="panel slide-in overflow-hidden">
                    <div className="p-6 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
                        <div>
                            <h4 className="text-white font-bold">Acknowledgement Audit: {selectedBulletin.title}</h4>
                            <p className="text-xs text-gray-500">Track which clubs and leaders have confirmed receipt of this bulletin.</p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-black text-gold-400">{selectedBulletin.acknowledgements?.length || 0}</div>
                            <div className="text-[10px] text-gray-500 uppercase font-black">Total Receipts</div>
                        </div>
                    </div>
                    <div className="table-responsive">
                        <table className="h-table">
                            <thead>
                                <tr>
                                    <th>Leader / Official</th>
                                    <th>Club / Church</th>
                                    <th>Date Acknowledged</th>
                                    <th className="text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedBulletin.acknowledgements?.map(ack => (
                                    <tr key={ack.id}>
                                        <td className="cell-primary font-bold">{ack.user?.name}</td>
                                        <td>{ack.church?.name}</td>
                                        <td>{new Date(ack.acknowledged_at).toLocaleString()}</td>
                                        <td className="text-right">
                                            <span className="badge badge--sm badge--green">CONFIRMED</span>
                                        </td>
                                    </tr>
                                ))}
                                {(!selectedBulletin.acknowledgements || selectedBulletin.acknowledgements.length === 0) && (
                                    <tr>
                                        <td colSpan="4" className="text-center py-12 text-gray-600">No acknowledgements recorded yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Filters & Search */}
                    <div className="panel p-4 flex flex-wrap items-center justify-between gap-4 bg-white/[0.01]">
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
                                <input 
                                    type="text" 
                                    placeholder="Search bulletins..." 
                                    className="h-input pl-10 h-9 text-xs w-48 md:w-64"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg">
                                <Filter size={12} className="ml-2 text-gray-500" />
                                <select className="bg-transparent border-none text-[10px] font-bold uppercase tracking-widest text-gray-400 focus:ring-0 cursor-pointer" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
                                    <option value="All">All Departments</option>
                                    {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                                </select>
                                <div className="w-px h-4 bg-white/10"></div>
                                <select className="bg-transparent border-none text-[10px] font-bold uppercase tracking-widest text-gray-400 focus:ring-0 cursor-pointer" value={audienceFilter} onChange={e => setAudienceFilter(e.target.value)}>
                                    <option value="All">All Audiences</option>
                                    {audiences.map(aud => <option key={aud} value={aud}>{aud}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        {filteredBulletins.map(bulletin => (
                            <div key={bulletin.id} className={`panel p-0 overflow-hidden border border-white/5 group hover:border-white/10 transition-all ${bulletin.workflow_status !== 'published' ? 'opacity-70 bg-white/[0.02]' : ''}`}>
                                <div className="p-6 flex justify-between items-start gap-6">
                                    <div className="flex gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                                            bulletin.level === 'Urgent' ? 'bg-burgundy-500/10 text-burgundy-400 border-burgundy-500/20' : 
                                            bulletin.level === 'Warning' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 
                                            'bg-gold-500/10 text-gold-400 border-gold-500/20'
                                        }`}>
                                            {bulletin.level === 'Urgent' ? <AlertTriangle size={20} /> : <Megaphone size={20} />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                                                    bulletin.level === 'Urgent' ? 'bg-burgundy-500/20 text-burgundy-400' : 
                                                    bulletin.level === 'Warning' ? 'bg-orange-500/20 text-orange-400' : 
                                                    'bg-gold-500/10 text-gold-400'
                                                }`}>
                                                    {bulletin.level}
                                                </span>
                                                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-white/5 text-gray-500">
                                                    {bulletin.department}
                                                </span>
                                                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-info-500/10 text-info-400">
                                                    TO: {bulletin.target_audience}
                                                </span>
                                                {bulletin.workflow_status === 'pending_approval' && (
                                                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-burgundy-500 text-white animate-pulse">PENDING APPROVAL</span>
                                                )}
                                                {bulletin.workflow_status === 'draft' && (
                                                    <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-white/10 text-white">DRAFT</span>
                                                )}
                                            </div>
                                            <h4 className="text-white font-bold text-lg mb-1">{bulletin.title}</h4>
                                            <p className="text-sm text-gray-400 leading-relaxed mb-4">{bulletin.content}</p>
                                            
                                            <div className="flex items-center gap-4 text-[10px] text-gray-600 uppercase font-black">
                                                <div className="flex items-center gap-1">
                                                    <User size={12} /> {bulletin.author?.name || 'District Office'}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock size={12} /> {new Date(bulletin.created_at).toLocaleDateString()}
                                                </div>
                                                {bulletin.expires_at && (
                                                    <div className="flex items-center gap-1 text-burgundy-400/60">
                                                        <Clock size={12} /> Expires {new Date(bulletin.expires_at).toLocaleDateString()}
                                                    </div>
                                                )}
                                                {bulletin.requires_acknowledgement && (
                                                    <div className="flex items-center gap-1 text-gold-500">
                                                        <CheckCircle2 size={12} /> Requires Receipt
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {isDirector && bulletin.workflow_status === 'pending_approval' && (
                                            <button 
                                                onClick={() => handleApprove(bulletin.id)}
                                                className="btn btn--sm btn--primary"
                                            >
                                                <ShieldCheck size={14} className="mr-1" /> Approve Directive
                                            </button>
                                        )}
                                        {bulletin.workflow_status === 'published' && bulletin.requires_acknowledgement && (
                                            <>
                                                {hasAcknowledged(bulletin) ? (
                                                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-success-500/10 text-success-400 text-[10px] font-black uppercase tracking-widest">
                                                        <Check size={14} /> Acknowledged
                                                    </div>
                                                ) : (
                                                    <button 
                                                        onClick={() => handleAcknowledge(bulletin.id)}
                                                        className="btn btn--sm btn--gold"
                                                    >
                                                        <Send size={14} className="mr-1" /> Acknowledge Receipt
                                                    </button>
                                                )}
                                                {(isDirector || bulletin.author_id === auth?.user?.id) && (
                                                    <button 
                                                        onClick={() => { setSelectedBulletin(bulletin); setView('stats'); }}
                                                        className="p-2 text-info-400 hover:bg-info-500/10 bg-info-500/5 rounded-lg transition-all"
                                                        title="View Acknowledgements"
                                                    >
                                                        <Users size={16} />
                                                    </button>
                                                )}
                                            </>
                                        )}
                                        {canPublish && bulletin.workflow_status !== 'pending_approval' && (
                                            <button 
                                                onClick={() => toggleStatus(bulletin.id)}
                                                className={`p-2 rounded-lg transition-all ${bulletin.workflow_status === 'published' ? 'text-gray-500 hover:text-white bg-white/5' : 'text-success-400 hover:bg-success-500/10 bg-success-500/5'}`}
                                                title={bulletin.workflow_status === 'published' ? 'Move to Draft' : 'Publish Bulletin'}
                                            >
                                                {bulletin.workflow_status === 'published' ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        )}
                                        {canDelete && (
                                            <button 
                                                onClick={() => handleDelete(bulletin.id)}
                                                className="p-2 text-danger-400 hover:bg-danger-500/10 bg-danger-500/5 rounded-lg transition-all"
                                                title="Delete Bulletin"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {filteredBulletins.length === 0 && (
                            <div className="panel p-20 text-center bg-white/[0.01] rounded-2xl border border-dashed border-white/5">
                                <MessageSquare size={48} className="mx-auto mb-4 opacity-10" />
                                <h4 className="text-gray-500 font-bold uppercase tracking-widest">No matching bulletins</h4>
                                <p className="text-xs text-gray-600">Try adjusting your filters or search terms.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
