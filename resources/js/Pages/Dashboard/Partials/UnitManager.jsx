import { useState, useMemo, useEffect } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Plus, Shield, Save, Users, ChevronLeft, Trash2, UserMinus } from 'lucide-react';

export default function UnitManager({ units, picklists, readonly }) {
    const [view, setView] = useState('list'); // 'list' or 'manage'
    const [selectedUnitId, setSelectedUnitId] = useState(null);

    const unitForm = useForm({ name: '', gender: 'boys' });

    function submitUnit(e) {
        e.preventDefault();
        unitForm.post(route('units.store'), {
            preserveScroll: true,
            onSuccess: () => unitForm.reset(),
        });
    }

    const selectedUnit = useMemo(
        () => (units ?? []).find((u) => String(u.id) === String(selectedUnitId)) ?? null,
        [units, selectedUnitId],
    );

    const [unitRoles, setUnitRoles] = useState({ captain_id: '', scribe_id: '', counselor_id: '' });
    const [unitMemberPick, setUnitMemberPick] = useState('');

    useEffect(() => {
        if (!selectedUnit) return;
        setUnitRoles({
            captain_id: selectedUnit.roles?.captain?.id ?? '',
            scribe_id: selectedUnit.roles?.scribe?.id ?? '',
            counselor_id: selectedUnit.roles?.counselor?.id ?? '',
        });
        setUnitMemberPick('');
    }, [selectedUnitId, units]); // eslint-disable-line react-hooks/exhaustive-deps

    function asIntOrNull(value) {
        if (value === '' || value === undefined || value === null) return null;
        const n = Number(value);
        return Number.isFinite(n) ? n : null;
    }

    function addUnitMember() {
        if (!selectedUnit || !unitMemberPick) return;
        router.post(
            route('units.members.store', selectedUnit.id),
            { pathfinder_id: asIntOrNull(unitMemberPick) },
            { preserveScroll: true }
        );
        setUnitMemberPick('');
    }

    function saveUnitRoles() {
        if (!selectedUnit) return;
        router.put(
            route('units.roles.update', selectedUnit.id),
            {
                captain_id: asIntOrNull(unitRoles.captain_id),
                scribe_id: asIntOrNull(unitRoles.scribe_id),
                counselor_id: asIntOrNull(unitRoles.counselor_id),
            },
            { preserveScroll: true }
        );
    }

    return (
        <div className="flex flex-col gap-6">
            {view === 'list' && (
                <div className="panel">
                    <div className="panel__header">
                        <div>
                            <h3>Club Units</h3>
                            <p>Gender-based membership structure</p>
                        </div>
                        {!readonly && (
                            <form onSubmit={submitUnit} className="p-4 lg:p-0 flex flex-col sm:flex-row gap-2 items-stretch sm:items-center bg-white/5 lg:bg-transparent rounded-lg lg:rounded-none">
                                <input className="h-input" placeholder="Unit name" value={unitForm.data.name} onChange={(e) => unitForm.setData('name', e.target.value)} required />
                                <select className="h-input" value={unitForm.data.gender} onChange={(e) => unitForm.setData('gender', e.target.value)}>
                                    <option value="boys">Boys</option>
                                    <option value="girls">Girls</option>
                                </select>
                                <button type="submit" className="btn btn--primary btn--sm shrink-0" disabled={unitForm.processing}>
                                    <Plus size={14} /> Add Unit
                                </button>
                            </form>
                        )}
                    </div>
                    <div className="panel__body p-0">
                        <div className="table-responsive">
                            <table className="h-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: 40 }}></th>
                                        <th>Unit Name</th>
                                        <th>Type</th>
                                        <th>Members</th>
                                        <th style={{ width: 120 }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(units ?? []).map((u) => (
                                        <tr key={u.id}>
                                            <td>
                                                <div className={`p-2 rounded-lg inline-flex ${
                                                    u.gender === 'boys' ? 'bg-blue-500/15 text-blue-400' : 'bg-pink-400/15 text-pink-400'
                                                }`}>
                                                    <Shield size={16} />
                                                </div>
                                            </td>
                                            <td className="cell-primary">
                                                <div className="font-bold">{u.name}</div>
                                            </td>
                                            <td>
                                                <span className={`badge ${u.gender === 'boys' ? 'badge--info' : 'badge--gold'}`}>
                                                    {u.gender}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="font-bold text-white">{u.member_count}</span>
                                                <span className="text-muted text-xs ml-1">members</span>
                                            </td>
                                            <td>
                                                <div className="flex gap-2 items-center">
                                                    <button
                                                        className="btn btn--primary btn--sm"
                                                        onClick={() => { setSelectedUnitId(u.id); setView('manage'); }}
                                                    >
                                                        <Users size={13} /> Manage
                                                    </button>
                                                    {!readonly && (
                                                        <button
                                                            className="p-2 text-danger hover:bg-danger/10 rounded-lg transition-colors"
                                                            onClick={() => { if (confirm('Delete unit?')) router.delete(route('units.destroy', u.id)); }}
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {(units ?? []).length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="text-center text-muted py-12">
                                                <Shield size={28} className="mx-auto mb-3 opacity-20" />
                                                <p className="font-bold">No units created yet</p>
                                                <p className="text-xs mt-1">Use the form above to add your first unit.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {view === 'manage' && selectedUnit && (
                <div className="flex flex-col gap-6">
                    <button className="btn btn--secondary btn--sm self-start flex gap-2 items-center" onClick={() => setView('list')}>
                        <ChevronLeft size={14} /> Back to Units
                    </button>
                    
                    <div className="panel">
                        <div className="panel__header">
                            <div>
                                <div className="flex items-center gap-3">
                                    <h3>{selectedUnit.name}</h3>
                                    <span className="badge badge--neutral">{selectedUnit.gender}</span>
                                </div>
                                <p>
                                    {selectedUnit.member_count} members{' '}
                                    {selectedUnit.member_status === 'below_minimum' && <span className="text-danger text-xs">(Below minimum 6)</span>}
                                    {selectedUnit.member_status === 'above_recommended' && <span className="text-warning text-xs">(Above recommended 8)</span>}
                                </p>
                            </div>
                            {!readonly && (
                                <div className="flex gap-2">
                                    <button className="btn btn--primary btn--sm" onClick={saveUnitRoles}>
                                        <Save size={14} /> Save Changes
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="panel__body p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                                {/* LEFT: Leadership Controls */}
                                <div className="flex flex-col gap-5">
                                    <div className="form-section-title">Unit Leadership</div>
                                    <div className="form-grid-2">
                                        <div className="form-group">
                                            <label>Captain</label>
                                            <select
                                                className="h-input"
                                                value={unitRoles.captain_id}
                                                disabled={readonly}
                                                onChange={(e) => setUnitRoles((s) => ({ ...s, captain_id: e.target.value }))}
                                            >
                                                <option value="">Unassigned</option>
                                                {(selectedUnit.members ?? []).map((m) => (
                                                    <option key={m.id} value={m.id}>{m.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Scribe</label>
                                            <select
                                                className="h-input"
                                                value={unitRoles.scribe_id}
                                                disabled={readonly}
                                                onChange={(e) => setUnitRoles((s) => ({ ...s, scribe_id: e.target.value }))}
                                            >
                                                <option value="">Unassigned</option>
                                                {(selectedUnit.members ?? []).map((m) => (
                                                    <option key={m.id} value={m.id}>{m.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Assigned Counselor (Master Guide)</label>
                                        <select
                                            className="h-input"
                                            value={unitRoles.counselor_id}
                                            disabled={readonly}
                                            onChange={(e) => setUnitRoles((s) => ({ ...s, counselor_id: e.target.value }))}
                                        >
                                            <option value="">Unassigned</option>
                                            {(picklists?.master_guides ?? []).map((mg) => (
                                                <option key={mg.id} value={mg.id}>{mg.full_name} ({mg.role})</option>
                                            ))}
                                        </select>
                                    </div>

                                    {!readonly && (
                                        <>
                                            <div className="form-section-title mt-2">Add Member</div>
                                            <div className="flex gap-2 items-center">
                                                <select
                                                    className="h-input flex-grow"
                                                    value={unitMemberPick}
                                                    onChange={(e) => setUnitMemberPick(e.target.value)}
                                                >
                                                    <option value="">Select Pathfinder to add...</option>
                                                    {(picklists?.pathfinders ?? [])
                                                        .filter((p) => (selectedUnit.gender === 'boys' ? p.gender === 'Male' : p.gender === 'Female'))
                                                        .filter(p => !(selectedUnit.members ?? []).some(m => m.id === p.id))
                                                        .map((p) => (
                                                            <option key={p.id} value={p.id}>{p.name}</option>
                                                        ))}
                                                </select>
                                                <button
                                                    type="button"
                                                    className="btn btn--secondary btn--sm whitespace-nowrap"
                                                    disabled={!unitMemberPick}
                                                    onClick={addUnitMember}
                                                >
                                                    <Plus size={14} /> Add
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* RIGHT: Unit Roster — own panel */}
                                <div
                                    className="rounded-xl flex flex-col"
                                    style={{ background: 'var(--clr-surface-900)', border: '1px solid var(--clr-border)' }}
                                >
                                    <div
                                        className="px-5 py-3 flex items-center justify-between"
                                        style={{ borderBottom: '1px solid var(--clr-border)' }}
                                    >
                                        <div className="text-xs font-bold uppercase tracking-widest opacity-60">Unit Roster</div>
                                        <span className="badge badge--neutral">{(selectedUnit.members ?? []).length} members</span>
                                    </div>
                                    <div className="p-3 flex flex-col gap-2 flex-1">
                                        {(selectedUnit.members ?? []).map((m) => {
                                            const isCapt = String(m.id) === String(unitRoles.captain_id);
                                            const isScribe = String(m.id) === String(unitRoles.scribe_id);
                                            return (
                                                <div
                                                    key={m.id}
                                                    className={`flex items-center justify-between p-3 rounded-xl border transition-all group ${
                                                        isCapt
                                                            ? 'bg-blue-900/20 border-l-4 border-l-blue-400 border-white/5'
                                                            : isScribe
                                                            ? 'bg-gold-900/20 border-l-4 border-l-gold-400 border-white/5'
                                                            : 'bg-white/5 border-white/5 hover:bg-white/10'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-9 w-9 rounded-full bg-surface-700 border border-white/10 flex items-center justify-center text-[11px] font-bold text-muted overflow-hidden shrink-0">
                                                            {m.avatar_path ? (
                                                                <img src={m.avatar_url} alt="" className="w-full h-full object-cover" />
                                                            ) : m.name[0]}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-sm text-white">{m.name}</div>
                                                            <div className="flex gap-1 mt-0.5">
                                                                {isCapt && <span className="badge badge--info text-[9px] py-0 px-1.5 uppercase">Captain</span>}
                                                                {isScribe && <span className="badge badge--gold text-[9px] py-0 px-1.5 uppercase">Scribe</span>}
                                                                {!isCapt && !isScribe && <span className="text-[10px] text-muted">{m.class?.name ?? 'Member'}</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {!readonly && (
                                                        <button
                                                            type="button"
                                                            className="opacity-0 group-hover:opacity-100 p-2 hover:bg-danger/15 text-danger rounded-lg transition-all"
                                                            title="Remove from unit"
                                                            onClick={() => { if (confirm('Remove from unit?')) router.delete(route('units.members.destroy', { unit: selectedUnit.id, pathfinder: m.id }), { preserveScroll: true }); }}
                                                        >
                                                            <UserMinus size={15} />
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                        {(selectedUnit.members ?? []).length === 0 && (
                                            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-muted">
                                                <Users size={28} className="mb-3 opacity-20" />
                                                <p className="text-sm">No members in this unit yet.</p>
                                                <p className="text-xs mt-1 opacity-60">Use "Add Member" on the left.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
