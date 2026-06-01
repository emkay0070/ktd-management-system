import { useForm, router } from '@inertiajs/react';
import { Save, Plus, Trash2, Settings, Layers } from 'lucide-react';

export default function OperationsManager({ church, operations, picklists, readonly }) {
    const operationsForm = useForm({
        weekly_meeting_frequency: operations?.weekly_meeting_frequency ?? 1,
        departments: operations?.departments ?? [],
    });

    function saveOperations(e) {
        e.preventDefault();
        router.put(route('club.operations.update'), operationsForm.data, { 
            preserveScroll: true 
        });
    }

    function asIntOrNull(value) {
        if (value === '' || value === undefined || value === null) return null;
        const n = Number(value);
        return Number.isFinite(n) ? n : null;
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="panel">
                <div className="panel__header">
                    <div>
                        <div className="flex items-center gap-2">
                            <Settings className="text-muted" size={18} />
                            <h3>Club Settings & Operations</h3>
                        </div>
                        <p>Configure club frequency and department assignments for {church?.name}</p>
                    </div>
                </div>
                <div className="panel__body">
                    <form onSubmit={saveOperations}>
                        <div className="form-grid-3 items-end mb-8">
                            <div className="form-group">
                                <label>Weekly meeting frequency</label>
                                <input
                                    type="number"
                                    className="h-input"
                                    min="0"
                                    max="14"
                                    disabled={readonly}
                                    value={operationsForm.data.weekly_meeting_frequency}
                                    onChange={(e) => operationsForm.setData('weekly_meeting_frequency', Number(e.target.value))}
                                />
                                <p className="text-[10px] text-muted mt-1">Number of times the club meets in a full week.</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
                            <div className="flex items-center gap-2 font-bold text-burgundy-400">
                                <Layers size={18} />
                                <span>Club Departments</span>
                            </div>
                            {!readonly && (
                                <button
                                    type="button"
                                    className="btn btn--secondary btn--sm"
                                    onClick={() => operationsForm.setData('departments', [...(operationsForm.data.departments ?? []), { name: '', responsible_master_guide_id: null, notes: '' }])}
                                >
                                    <Plus size={14} /> Add Department
                                </button>
                            )}
                        </div>

                        <div className="flex flex-col gap-3">
                            {(operationsForm.data.departments ?? []).map((d, idx) => (
                                <div key={idx} className="flex gap-3 items-start p-4 rounded-lg bg-white/5 border border-white/5">
                                    <div className="form-group flex-1">
                                        <label className="text-xs uppercase tracking-wider opacity-50 mb-1">Department</label>
                                        <input
                                            className="h-input"
                                            disabled={readonly}
                                            value={d.name ?? ''}
                                            onChange={(e) => {
                                                const next = [...(operationsForm.data.departments ?? [])];
                                                next[idx] = { ...next[idx], name: e.target.value };
                                                operationsForm.setData('departments', next);
                                            }}
                                            placeholder="e.g. Drill, Camping, Worship"
                                        />
                                    </div>
                                    <div className="form-group flex-1">
                                        <label className="text-xs uppercase tracking-wider opacity-50 mb-1">Responsible Leader</label>
                                        <select
                                            className="h-input"
                                            disabled={readonly}
                                            value={d.responsible_master_guide_id ?? ''}
                                            onChange={(e) => {
                                                const next = [...(operationsForm.data.departments ?? [])];
                                                next[idx] = { ...next[idx], responsible_master_guide_id: asIntOrNull(e.target.value) };
                                                operationsForm.setData('departments', next);
                                            }}
                                        >
                                            <option value="">Unassigned</option>
                                            {(picklists?.master_guides ?? []).map((mg) => (
                                                <option key={mg.id} value={mg.id}>{mg.full_name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group flex-[1.5]">
                                        <label className="text-xs uppercase tracking-wider opacity-50 mb-1">Notes / Scope</label>
                                        <input
                                            className="h-input"
                                            disabled={readonly}
                                            value={d.notes ?? ''}
                                            onChange={(e) => {
                                                const next = [...(operationsForm.data.departments ?? [])];
                                                next[idx] = { ...next[idx], notes: e.target.value };
                                                operationsForm.setData('departments', next);
                                            }}
                                            placeholder="Goals or specific tasks..."
                                        />
                                    </div>
                                    {!readonly && (
                                        <button 
                                            type="button" 
                                            className="btn btn--ghost mt-6 text-danger hover:bg-danger/10"
                                            onClick={() => {
                                                const next = operationsForm.data.departments.filter((_, i) => i !== idx);
                                                operationsForm.setData('departments', next);
                                            }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {(operationsForm.data.departments ?? []).length === 0 && (
                                <div className="text-center py-10 text-muted border border-dashed border-white/10 rounded-lg">
                                    No custom departments defined. Add one to assign leadership roles.
                                </div>
                            )}
                        </div>

                        {!readonly && (
                            <div className="flex justify-end mt-8 pt-6 border-t border-white/10">
                                <button className="btn btn--primary" disabled={operationsForm.processing}>
                                    <Save size={16} /> Save Operations
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
