import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Plus, UserPlus, Users, Trash2, ShieldCheck, Briefcase } from 'lucide-react';

export default function LeadershipManager({ classes, committees, derived_pathfinder_committee, picklists, readonly }) {
    const [activeTab, setActiveTab] = useState('executive'); // 'executive' or 'staff'

    const classLeaderForm = useForm({
        class_id: picklists?.classes?.[0]?.id ?? '',
        master_guide_id: picklists?.master_guides?.[0]?.id ?? '',
        role: 'instructor',
    });

    const committeeForm = useForm({
        committee_type: 'executive',
        role: '',
        member_type: 'master_guide',
        member_id: picklists?.master_guides?.[0]?.id ?? '',
    });

    function submitClassLeader(e) {
        e.preventDefault();
        router.post(
            route('classes.leaders.store', classLeaderForm.data.class_id),
            {
                master_guide_id: classLeaderForm.data.master_guide_id,
                role: classLeaderForm.data.role,
            },
            { 
                preserveScroll: true, 
                onSuccess: () => classLeaderForm.reset('master_guide_id', 'role') 
            }
        );
    }

    function submitCommitteeMember(e) {
        e.preventDefault();
        router.post(
            route('committees.members.store', committeeForm.data.committee_type),
            {
                role: committeeForm.data.role,
                member_type: committeeForm.data.member_type,
                member_id: committeeForm.data.member_id,
            },
            { preserveScroll: true, onSuccess: () => committeeForm.reset('role') }
        );
    }

    function removeCommitteeMember(id) {
        if (confirm('Remove this member from the committee?')) {
            router.delete(route('committees.members.destroy', id), {
                preserveScroll: true,
            });
        }
    }

    const executiveMembers = committees?.executive ?? [];
    const disciplinaryMembers = committees?.disciplinary ?? []; 
    const socialMembers = committees?.social ?? [];
    
    // Combining Staff specific committees if needed, or just showing the derived pathfinder committee
    const staffMembers = derived_pathfinder_committee ?? [];

    return (
        <div className="flex flex-col gap-8">
            {/* Class Staff Assignments */}
            <div className="panel">
                <div className="panel__header flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <Briefcase className="text-muted" size={18} />
                            <h3>Class Staff Assignments</h3>
                        </div>
                        <p>Assign Master Guides and instructors to Pathfinder classes</p>
                    </div>
                </div>

                {!readonly && (
                    <div className="panel__body border-b border-white/5 bg-white/[0.01]">
                        <form onSubmit={submitClassLeader}>
                            <div className="form-grid-3 items-end">
                                <div className="form-group mb-0">
                                    <label>Pathfinder Class</label>
                                    <select className="h-input" value={classLeaderForm.data.class_id} onChange={(e) => classLeaderForm.setData('class_id', e.target.value)}>
                                        {(picklists?.classes ?? []).map((c) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group mb-0">
                                    <label>Staff Member</label>
                                    <select className="h-input" value={classLeaderForm.data.master_guide_id} onChange={(e) => classLeaderForm.setData('master_guide_id', e.target.value)}>
                                        {(picklists?.master_guides ?? []).map((mg) => (
                                            <option key={mg.id} value={mg.id}>{mg.full_name} ({mg.role})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group mb-0 flex gap-2 items-end">
                                    <div className="flex-grow">
                                        <label>Role</label>
                                        <select className="h-input" value={classLeaderForm.data.role} onChange={(e) => classLeaderForm.setData('role', e.target.value)}>
                                            <option value="counselor">Counselor</option>
                                            <option value="instructor">Instructor</option>
                                        </select>
                                    </div>
                                    <button type="submit" className="btn btn--primary btn--sm" disabled={classLeaderForm.processing}>
                                        <Plus size={16} /> Assign
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                )}

                <div className="panel__body p-0">
                    <div className="table-responsive">
                        <table className="h-table">
                            <thead>
                                <tr>
                                    <th>Class</th>
                                    <th>Pathfinder Count</th>
                                    <th>Master Guide(s)</th>
                                    <th>Counselor(s)</th>
                                    <th>Instructor(s)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(classes ?? []).map((c) => (
                                    <tr key={c.id}>
                                        <td className="cell-primary font-bold">{c.name}</td>
                                        <td>{c.pathfinder_count}</td>
                                        <td>{(c.leaders?.master_guide ?? []).map((x) => x.full_name).join(', ') || <span className="text-muted">—</span>}</td>
                                        <td>{(c.leaders?.counselor ?? []).map((x) => x.full_name).join(', ') || <span className="text-muted">—</span>}</td>
                                        <td>{(c.leaders?.instructor ?? []).map((x) => x.full_name).join(', ') || <span className="text-muted">—</span>}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Committee Management */}
            <div className="panel overflow-hidden">
                <div className="panel__header border-b border-white/5 flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="text-gold-400" size={20} />
                            <h3>Leadership Committees</h3>
                        </div>
                        <p>Executive and specialized staff groups</p>
                    </div>
                </div>

                {!readonly && (
                    <div className="panel__body bg-white/[0.01] border-b border-white/5">
                        <form onSubmit={submitCommitteeMember}>
                            <div className="form-grid-3 items-end">
                                <div className="form-group mb-0">
                                    <label>Add to Committee</label>
                                    <select className="h-input" value={committeeForm.data.committee_type} onChange={(e) => committeeForm.setData('committee_type', e.target.value)}>
                                        <option value="executive">Executive Committee</option>
                                        <option value="disciplinary">Disciplinary Committee</option>
                                        <option value="social">Social/Planning Committee</option>
                                    </select>
                                </div>
                                <div className="form-group mb-0">
                                    <label>Detailed Role</label>
                                    <input className="h-input" placeholder="e.g. Secretary, Deputy" value={committeeForm.data.role} onChange={(e) => committeeForm.setData('role', e.target.value)} required />
                                </div>
                                <div className="form-group mb-0 flex gap-2 items-end">
                                    <div className="flex-grow">
                                        <label>Staff Member</label>
                                        <select className="h-input" value={committeeForm.data.member_id} onChange={(e) => committeeForm.setData('member_id', e.target.value)}>
                                            {(picklists?.master_guides ?? []).map((mg) => (
                                                <option key={mg.id} value={mg.id}>{mg.full_name} ({mg.role})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <button type="submit" className="btn btn--primary btn--sm" disabled={committeeForm.processing}>
                                        <UserPlus size={16} /> Add
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                )}

                {/* Visual Tabbing */}
                <div className="flex gap-4 p-4 bg-white/[0.02] border-b border-white/5">
                    <button 
                        className={`btn btn--sm transition-all ${activeTab === 'executive' ? 'btn--primary' : 'btn--ghost'}`}
                        onClick={() => setActiveTab('executive')}
                    >
                        Executive Committee
                    </button>
                    <button 
                        className={`btn btn--sm transition-all ${activeTab === 'staff' ? 'btn--primary' : 'btn--ghost'}`}
                        onClick={() => setActiveTab('staff')}
                    >
                        Staff Committee
                    </button>
                </div>

                <div className="panel__body">
                    {activeTab === 'executive' ? (
                        <div className="flex flex-col gap-8">
                            <div>
                                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-burgundy-400 mb-6 opacity-70">Official Board & Executive</div>
                                <div className="flex flex-col gap-3 w-full">
                                    {executiveMembers.map((m) => (
                                        <div key={m.id} className="relative group p-4 bg-white/[0.03] border-l-4 border-l-burgundy-500 rounded-xl hover:bg-white/[0.06] transition-all flex items-center">
                                            <div className="h-12 w-12 rounded-full bg-burgundy-900/40 border border-burgundy-500/20 flex items-center justify-center text-burgundy-400 font-bold overflow-hidden shrink-0 mr-8 shadow-lg shadow-black/20">
                                                {m.member?.avatar_url ? (
                                                    <img src={m.member.avatar_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-base">{(m.member?.full_name ?? m.member?.name ?? '?')[0]}</span>
                                                )}
                                            </div>
                                            
                                            <div className="flex-1 flex items-center justify-between pr-8">
                                                <div className="font-bold text-sm text-white">{m.member?.full_name ?? m.member?.name}</div>
                                                <div className="text-[10px] uppercase font-bold text-gold-500/80 tracking-widest">{m.role}</div>
                                            </div>

                                            {!readonly && (
                                                <button 
                                                    className="text-danger p-2 hover:bg-danger/10 rounded-lg transition-all" 
                                                    onClick={() => removeCommitteeMember(m.id)}
                                                    title="Remove Member"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    {executiveMembers.length === 0 && <div className="text-muted text-sm italic py-4">No executive members added yet.</div>}
                                </div>
                            </div>
                            
                            {/* Minor committees show under executive breadcrumb */}
                            {(disciplinaryMembers.length > 0 || socialMembers.length > 0) && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-white/5">
                                    <div>
                                        <div className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 opacity-50">Disciplinary Committee</div>
                                        <div className="flex flex-col gap-2">
                                            {disciplinaryMembers.map(m => (
                                                <div key={m.id} className="flex justify-between items-center p-2 rounded bg-white/5 border border-white/5 text-sm">
                                                    <span>{m.member?.full_name ?? m.member?.name}</span>
                                                    <span className="text-xs text-muted">{m.role}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 opacity-50">Social Committee</div>
                                        <div className="flex flex-col gap-2">
                                            {socialMembers.map(m => (
                                                <div key={m.id} className="flex justify-between items-center p-2 rounded bg-white/5 border border-white/5 text-sm">
                                                    <span>{m.member?.full_name ?? m.member?.name}</span>
                                                    <span className="text-xs text-muted">{m.role}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div>
                            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-400 mb-4 opacity-70">Derived Pathfinder Staff Committee</div>
                            <div className="flex flex-col gap-3 w-full">
                                {staffMembers.map((m, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3.5 bg-white/[0.03] border-l-4 border-l-gold-500/60 rounded-xl hover:bg-white/[0.06] transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="h-11 w-11 rounded-full bg-gold-900/40 border border-gold-400/20 flex items-center justify-center text-gold-400 font-bold shrink-0 overflow-hidden">
                                                {m.member?.avatar_url ? (
                                                    <img src={m.member.avatar_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-xs">{(m.member?.name ?? '?')[0]}</span>
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm leading-tight text-white">{m.member?.name}</div>
                                                <div className="text-[10px] uppercase font-bold text-muted tracking-widest mt-0.5">{m.unit} — <span className="text-gold-400">{m.role}</span></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {staffMembers.length === 0 && <div className="text-muted text-sm italic py-4">No unit leaders assigned yet.</div>}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
