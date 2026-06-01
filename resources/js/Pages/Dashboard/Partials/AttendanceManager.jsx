import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Calendar, Users, ClipboardCheck, Trash2, CheckSquare, Square } from 'lucide-react';

export default function AttendanceManager({ club, readonly }) {
    const { picklists, pathfinders, master_guides } = club;
    const { attendance_sessions } = picklists; // Corrected mapping

    const [takingAttendance, setTakingAttendance] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedType, setSelectedType] = useState('Weekly Meeting');

    // Attendance form
    const { data, setData, post, processing, reset } = useForm({
        date: selectedDate,
        type: selectedType,
        present_ids: [], // combined IDs
    });

    const isPresent = (id) => data.present_ids.includes(id);

    const togglePresence = (id) => {
        if (readonly) return;
        const next = isPresent(id) 
            ? data.present_ids.filter(x => x !== id)
            : [...data.present_ids, id];
        setData('present_ids', next);
    };

    const toggleAll = (type) => {
        if (readonly) return;
        const people = type === 'pathfinder' ? pathfinders : master_guides;
        const ids = people.map(p => p.id);
        const allAlreadySelected = ids.every(id => data.present_ids.includes(id));

        if (allAlreadySelected) {
            setData('present_ids', data.present_ids.filter(id => !ids.includes(id)));
        } else {
            const currentOtherIds = data.present_ids.filter(id => !ids.includes(id));
            setData('present_ids', [...currentOtherIds, ...ids]);
        }
    };

    const submitAttendance = (e) => {
        e.preventDefault();
        post(route('attendance.store'), {
            onSuccess: () => {
                setTakingAttendance(false);
                reset();
            }
        });
    };

    const deleteSession = (id) => {
        if (confirm('Delete this attendance record?')) {
            router.delete(route('attendance.destroy', id), { preserveScroll: true });
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {!takingAttendance ? (
                <div className="flex flex-col gap-6">
                    <div className="panel">
                        <div className="panel__header">
                            <div className="flex justify-between items-center w-full">
                                <div>
                                    <h3>Attendance History</h3>
                                    <p>View and manage previous roll calls</p>
                                </div>
                                {!readonly && (
                                    <button 
                                        className="btn btn--primary"
                                        onClick={() => setTakingAttendance(true)}
                                    >
                                        <ClipboardCheck size={18} /> Take Attendance
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="panel__body">
                            <div className="table-responsive">
                                <table className="h-table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Type</th>
                                            <th>Status</th>
                                            <th className="text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(attendance_sessions ?? []).map((s) => (
                                            <tr key={s.id}>
                                                <td className="font-bold text-sm">{s.date}</td>
                                                <td><span className="badge badge--info !py-0.5 !px-2 !text-[10px]">{s.type}</span></td>
                                                <td>
                                                    <div className="text-[11px] text-muted flex items-center gap-1.5">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-success shadow-[0_0_8px_rgba(var(--clr-success-rgb),0.5)]"></div>
                                                        Session Logged
                                                    </div>
                                                </td>
                                                <td className="text-right">
                                                    {!readonly && (
                                                        <button 
                                                            onClick={() => deleteSession(s.id)}
                                                            className="text-danger/60 p-2 hover:bg-danger/10 hover:text-danger rounded-lg transition-colors"
                                                            title="Delete Session"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {(attendance_sessions ?? []).length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="text-center py-12 text-muted italic">
                                                    No attendance sessions recorded yet.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-6">
                    {/* Attendance Header */}
                    <div className="panel">
                        <div className="panel__body bg-burgundy-900/10 border-b border-burgundy-500/10">
                            <div className="form-grid-3 items-end">
                                <div className="form-group mb-0">
                                    <label>Meeting Date</label>
                                    <input 
                                        type="date" 
                                        className="h-input" 
                                        value={data.date} 
                                        onChange={e => setData('date', e.target.value)} 
                                    />
                                </div>
                                <div className="form-group mb-0">
                                    <label>Activity Type</label>
                                    <select 
                                        className="h-input" 
                                        value={data.type} 
                                        onChange={e => setData('type', e.target.value)}
                                    >
                                        <option>Weekly Meeting</option>
                                        <option>Sabbath Club</option>
                                        <option>Drill Session</option>
                                        <option>Camp/Outing</option>
                                        <option>Committee Meeting</option>
                                    </select>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        className="btn btn--secondary flex-1"
                                        onClick={() => setTakingAttendance(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        className="btn btn--primary flex-1"
                                        onClick={submitAttendance}
                                        disabled={processing}
                                    >
                                        Save Roll Call
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Roll Call Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Pathfinders List */}
                        <div className="panel">
                            <div className="panel__header py-3 bg-white/5 border-b border-white/5">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <Users size={16} className="text-gold-400" />
                                        <h4 className="m-0 font-bold text-sm">Pathfinders</h4>
                                    </div>
                                    <button 
                                        className="btn btn--ghost btn--sm text-xs"
                                        onClick={() => toggleAll('pathfinder')}
                                    >
                                        <CheckSquare size={14} className="mr-1" /> Mark All
                                    </button>
                                </div>
                            </div>
                            <div className="panel__body p-0 max-h-[500px] overflow-y-auto">
                                <div className="divide-y divide-white/5">
                                    {(pathfinders ?? []).map(p => (
                                        <div 
                                            key={p.id} 
                                            className={`flex items-center justify-between p-3.5 cursor-pointer transition-all border-b border-white/[0.03] last:border-0 hover:bg-burgundy-900/5 ${isPresent(p.id) ? 'bg-burgundy-500/[0.08]' : ''}`}
                                            onClick={() => togglePresence(p.id)}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 bg-white/5 border border-white/5 rounded-full overflow-hidden shrink-0 flex items-center justify-center font-bold text-xs">
                                                    {p.avatar_url ? (
                                                        <img src={p.avatar_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="opacity-40">{p.name[0]}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className={`font-bold text-sm transition-colors ${isPresent(p.id) ? 'text-burgundy-400' : 'text-gray-100'}`}>{p.name}</div>
                                                    <div className="text-[10px] text-muted font-medium uppercase tracking-wider">{p.assigned_class?.name ?? 'Headquarters'}</div>
                                                </div>
                                            </div>
                                            <div className={`transition-all transform ${isPresent(p.id) ? 'scale-110' : 'opacity-20 scale-100'}`}>
                                                {isPresent(p.id) ? (
                                                    <CheckSquare size={20} className="text-burgundy-500 shadow-sm" />
                                                ) : (
                                                    <Square size={20} className="text-muted" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Leaders List */}
                        <div className="panel">
                            <div className="panel__header py-3 bg-white/5 border-b border-white/5">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <Users size={16} className="text-burgundy-400" />
                                        <h4 className="m-0 font-bold text-sm">Leaders & Staff</h4>
                                    </div>
                                    <button 
                                        className="btn btn--ghost btn--sm text-xs"
                                        onClick={() => toggleAll('leader')}
                                    >
                                        <CheckSquare size={14} className="mr-1" /> Mark All
                                    </button>
                                </div>
                            </div>
                            <div className="panel__body p-0 max-h-[500px] overflow-y-auto">
                                <div className="divide-y divide-white/5">
                                    {(master_guides ?? []).map(mg => (
                                        <div 
                                            key={mg.id} 
                                            className={`flex items-center justify-between p-3.5 cursor-pointer transition-all border-b border-white/[0.03] last:border-0 hover:bg-gold-400/5 ${isPresent(mg.id) ? 'bg-gold-400/10' : ''}`}
                                            onClick={() => togglePresence(mg.id)}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 bg-gold-900/20 border border-gold-400/10 rounded-full overflow-hidden shrink-0 flex items-center justify-center font-bold text-xs">
                                                    {mg.avatar_url ? (
                                                        <img src={mg.avatar_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-gold-400 opacity-60">{mg.full_name[0]}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className={`font-bold text-sm transition-colors ${isPresent(mg.id) ? 'text-gold-400' : 'text-gray-100'}`}>{mg.full_name}</div>
                                                    <div className="text-[10px] text-muted font-medium uppercase tracking-wider">{mg.role} — {mg.assigned_class?.name ?? 'Admin'}</div>
                                                </div>
                                            </div>
                                            <div className={`transition-all transform ${isPresent(mg.id) ? 'scale-110' : 'opacity-20 scale-100'}`}>
                                                {isPresent(mg.id) ? (
                                                    <CheckSquare size={20} className="text-gold-500 shadow-sm" />
                                                ) : (
                                                    <Square size={20} className="text-muted" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
