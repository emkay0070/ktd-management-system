import React, { useMemo, useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import {
    Users, ClipboardCheck, Trash2, CheckSquare, Square,
    Search, X, Pencil, ChevronRight, UserX, UserCheck,
} from 'lucide-react';

const ACTIVITY_TYPES = [
    'Weekly Meeting',
    'Sabbath Club',
    'Drill Session',
    'Camp/Outing',
    'Committee Meeting',
];

function todayIso() {
    return new Date().toISOString().split('T')[0];
}

function buildDefaultPresentIds(pathfinders = [], masterGuides = []) {
    return {
        present_pathfinder_ids: pathfinders.map((p) => p.id),
        present_master_guide_ids: masterGuides.map((mg) => mg.id),
    };
}

function buildPresentIdsFromSession(session, pathfinders = [], masterGuides = []) {
    if (!session?.records?.length) {
        return buildDefaultPresentIds(pathfinders, masterGuides);
    }

    return {
        present_pathfinder_ids: session.records
            .filter((r) => r.member_type === 'pathfinder' && r.is_present && r.pathfinder_id)
            .map((r) => r.pathfinder_id),
        present_master_guide_ids: session.records
            .filter((r) => r.member_type === 'master_guide' && r.is_present && r.master_guide_id)
            .map((r) => r.master_guide_id),
    };
}

export default function AttendanceManager({ club, readonly }) {
    const { picklists, pathfinders = [], master_guides: masterGuides = [] } = club;
    const { attendance_sessions: attendanceSessions = [] } = picklists;

    const [takingAttendance, setTakingAttendance] = useState(false);
    const [editingSessionId, setEditingSessionId] = useState(null);
    const [selectedSessionId, setSelectedSessionId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [unitFilter, setUnitFilter] = useState('all');
    const [classFilter, setClassFilter] = useState('all');

    const { data, setData, put, processing, reset, errors } = useForm({
        date: todayIso(),
        type: ACTIVITY_TYPES[0],
        description: '',
        present_pathfinder_ids: [],
        present_master_guide_ids: [],
        force: false,
    });

    const selectedSession = useMemo(
        () => attendanceSessions.find((s) => s.id === selectedSessionId) ?? null,
        [attendanceSessions, selectedSessionId],
    );

    const unitOptions = useMemo(() => {
        const units = new Map();
        pathfinders.forEach((p) => {
            if (p.unit?.id) {
                units.set(p.unit.id, p.unit.name);
            }
        });
        return Array.from(units, ([id, name]) => ({ id, name }));
    }, [pathfinders]);

    const classOptions = useMemo(() => {
        const classes = new Map();
        pathfinders.forEach((p) => {
            if (p.assigned_class?.id) {
                classes.set(p.assigned_class.id, p.assigned_class.name);
            }
        });
        return Array.from(classes, ([id, name]) => ({ id, name }));
    }, [pathfinders]);

    const filteredPathfinders = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return pathfinders.filter((p) => {
            if (unitFilter !== 'all' && String(p.unit?.id) !== String(unitFilter)) return false;
            if (classFilter !== 'all' && String(p.assigned_class?.id) !== String(classFilter)) return false;
            if (!q) return true;
            return (
                p.name?.toLowerCase().includes(q)
                || p.assigned_class?.name?.toLowerCase().includes(q)
                || p.unit?.name?.toLowerCase().includes(q)
            );
        });
    }, [pathfinders, searchQuery, unitFilter, classFilter]);

    const filteredMasterGuides = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return masterGuides;
        return masterGuides.filter((mg) =>
            mg.full_name?.toLowerCase().includes(q)
            || mg.role?.toLowerCase().includes(q)
            || mg.assigned_class?.name?.toLowerCase().includes(q),
        );
    }, [masterGuides, searchQuery]);

    const totalRoster = pathfinders.length + masterGuides.length;
    const presentCount = data.present_pathfinder_ids.length + data.present_master_guide_ids.length;
    const absentCount = Math.max(0, totalRoster - presentCount);
    const presentPercent = totalRoster > 0 ? Math.round((presentCount / totalRoster) * 100) : 0;

    const isPathfinderPresent = (id) => data.present_pathfinder_ids.includes(id);
    const isMasterGuidePresent = (id) => data.present_master_guide_ids.includes(id);

    const openNewSession = () => {
        const defaults = buildDefaultPresentIds(pathfinders, masterGuides);
        reset();
        setData({
            date: todayIso(),
            type: ACTIVITY_TYPES[0],
            description: '',
            ...defaults,
            force: false,
        });
        setEditingSessionId(null);
        setSelectedSessionId(null);
        setSearchQuery('');
        setUnitFilter('all');
        setClassFilter('all');
        setTakingAttendance(true);
    };

    const openEditSession = (session) => {
        const presentIds = buildPresentIdsFromSession(session, pathfinders, masterGuides);
        reset();
        setData({
            date: session.date,
            type: session.type,
            description: session.description ?? '',
            ...presentIds,
            force: false,
        });
        setEditingSessionId(session.id);
        setSelectedSessionId(null);
        setSearchQuery('');
        setUnitFilter('all');
        setClassFilter('all');
        setTakingAttendance(true);
    };

    const closeRollCall = () => {
        setTakingAttendance(false);
        setEditingSessionId(null);
        reset();
    };

    const togglePathfinder = (id) => {
        if (readonly) return;
        const next = isPathfinderPresent(id)
            ? data.present_pathfinder_ids.filter((x) => x !== id)
            : [...data.present_pathfinder_ids, id];
        setData('present_pathfinder_ids', next);
    };

    const toggleMasterGuide = (id) => {
        if (readonly) return;
        const next = isMasterGuidePresent(id)
            ? data.present_master_guide_ids.filter((x) => x !== id)
            : [...data.present_master_guide_ids, id];
        setData('present_master_guide_ids', next);
    };

    const markAllPathfinders = (present) => {
        if (readonly) return;
        setData(
            'present_pathfinder_ids',
            present ? pathfinders.map((p) => p.id) : [],
        );
    };

    const markAllMasterGuides = (present) => {
        if (readonly) return;
        setData(
            'present_master_guide_ids',
            present ? masterGuides.map((mg) => mg.id) : [],
        );
    };

    const markAllPresent = () => {
        if (readonly) return;
        setData(buildDefaultPresentIds(pathfinders, masterGuides));
    };

    const markAllAbsent = () => {
        if (readonly) return;
        setData({
            present_pathfinder_ids: [],
            present_master_guide_ids: [],
        });
    };

    const copyFromLastSession = () => {
        const last = attendanceSessions[0];
        if (!last) return;
        const presentIds = buildPresentIdsFromSession(last, pathfinders, masterGuides);
        setData((prev) => ({ ...prev, ...presentIds }));
    };

    const findDuplicateSession = () =>
        attendanceSessions.find(
            (s) => s.date === data.date && s.type === data.type && s.id !== editingSessionId,
        );

    const submitAttendance = (e, shouldForce = false) => {
        e?.preventDefault?.();

        const duplicate = findDuplicateSession();
        if (!editingSessionId && duplicate && !shouldForce) {
            const replace = confirm(
                `A "${data.type}" session already exists for ${data.date}. Replace it with this roll call?`,
            );
            if (!replace) return;
            return submitAttendance(null, true);
        }

        const options = {
            preserveScroll: true,
            onSuccess: () => closeRollCall(),
        };

        if (editingSessionId) {
            put(route('attendance.update', editingSessionId), options);
        } else {
            router.post(route('attendance.store'), {
                date: data.date,
                type: data.type,
                description: data.description,
                present_pathfinder_ids: data.present_pathfinder_ids,
                present_master_guide_ids: data.present_master_guide_ids,
                force: shouldForce,
            }, options);
        }
    };

    const deleteSession = (id) => {
        if (confirm('Delete this attendance session? This cannot be undone.')) {
            router.delete(route('attendance.destroy', id), {
                preserveScroll: true,
                onSuccess: () => {
                    if (selectedSessionId === id) setSelectedSessionId(null);
                },
            });
        }
    };

    const percentBadgeClass = (percent) => {
        if (percent >= 80) return 'badge--success';
        if (percent >= 60) return 'badge--warning';
        return 'badge--danger';
    };

    if (takingAttendance) {
        return (
            <div className="flex flex-col gap-6">
                <div className="panel">
                    <div className="panel__body bg-burgundy-900/10 border-b border-burgundy-500/10">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                            <div>
                                <h3 className="m-0 text-lg font-black text-white">
                                    {editingSessionId ? 'Edit Roll Call' : 'Take Attendance'}
                                </h3>
                                <p className="text-xs text-muted m-0 mt-1">
                                    Everyone starts present — tap to mark absent
                                </p>
                            </div>
                            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                                <div className="text-right">
                                    <div className="text-xl font-black text-success">{presentCount}</div>
                                    <div className="text-[10px] uppercase tracking-widest text-muted">Present</div>
                                </div>
                                <div className="h-8 w-px bg-white/10" />
                                <div className="text-right">
                                    <div className="text-xl font-black text-danger">{absentCount}</div>
                                    <div className="text-[10px] uppercase tracking-widest text-muted">Absent</div>
                                </div>
                                <div className="h-8 w-px bg-white/10" />
                                <div className="text-right">
                                    <div className="text-xl font-black text-gold-400">{presentPercent}%</div>
                                    <div className="text-[10px] uppercase tracking-widest text-muted">Rate</div>
                                </div>
                            </div>
                        </div>

                        <div className="form-grid-3 items-end">
                            <div className="form-group mb-0">
                                <label>Meeting Date</label>
                                <input
                                    type="date"
                                    className="h-input"
                                    value={data.date}
                                    onChange={(e) => setData('date', e.target.value)}
                                />
                                {errors.date && <p className="text-danger text-xs mt-1">{errors.date}</p>}
                            </div>
                            <div className="form-group mb-0">
                                <label>Activity Type</label>
                                <select
                                    className="h-input"
                                    value={data.type}
                                    onChange={(e) => setData('type', e.target.value)}
                                >
                                    {ACTIVITY_TYPES.map((type) => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                                {errors.type && <p className="text-danger text-xs mt-1">{errors.type}</p>}
                            </div>
                            <div className="flex gap-2">
                                <button type="button" className="btn btn--secondary flex-1" onClick={closeRollCall}>
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn--primary flex-1"
                                    onClick={submitAttendance}
                                    disabled={processing}
                                >
                                    {processing ? 'Saving…' : editingSessionId ? 'Update Roll Call' : 'Save Roll Call'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="panel">
                    <div className="panel__body flex flex-wrap gap-3 items-center">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                            <input
                                type="text"
                                className="h-input pl-9"
                                placeholder="Search by name, class, or unit…"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <select
                            className="h-input w-auto min-w-[140px]"
                            value={unitFilter}
                            onChange={(e) => setUnitFilter(e.target.value)}
                        >
                            <option value="all">All Units</option>
                            {unitOptions.map((u) => (
                                <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                        </select>
                        <select
                            className="h-input w-auto min-w-[140px]"
                            value={classFilter}
                            onChange={(e) => setClassFilter(e.target.value)}
                        >
                            <option value="all">All Classes</option>
                            {classOptions.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        <button type="button" className="btn btn--ghost btn--sm" onClick={markAllPresent}>
                            <UserCheck size={14} className="mr-1" /> All Present
                        </button>
                        <button type="button" className="btn btn--ghost btn--sm" onClick={markAllAbsent}>
                            <UserX size={14} className="mr-1" /> All Absent
                        </button>
                        {attendanceSessions.length > 0 && (
                            <button type="button" className="btn btn--ghost btn--sm" onClick={copyFromLastSession}>
                                Copy Last Session
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <RollCallPanel
                        title="Pathfinders"
                        iconColor="text-gold-400"
                        presentColor="text-burgundy-400"
                        highlightClass="bg-burgundy-500/[0.08]"
                        hoverClass="hover:bg-burgundy-900/5"
                        people={filteredPathfinders}
                        isPresent={isPathfinderPresent}
                        onToggle={togglePathfinder}
                        onMarkAllPresent={() => markAllPathfinders(true)}
                        onMarkAllAbsent={() => markAllPathfinders(false)}
                        getName={(p) => p.name}
                        getSubtitle={(p) => `${p.assigned_class?.name ?? 'Unassigned'}${p.unit?.name ? ` · ${p.unit.name}` : ''}`}
                        getInitial={(p) => p.name?.[0]}
                        avatarUrl={(p) => p.avatar_url}
                    />

                    <RollCallPanel
                        title="Leaders & Staff"
                        iconColor="text-burgundy-400"
                        presentColor="text-gold-400"
                        highlightClass="bg-gold-400/10"
                        hoverClass="hover:bg-gold-400/5"
                        people={filteredMasterGuides}
                        isPresent={isMasterGuidePresent}
                        onToggle={toggleMasterGuide}
                        onMarkAllPresent={() => markAllMasterGuides(true)}
                        onMarkAllAbsent={() => markAllMasterGuides(false)}
                        getName={(mg) => mg.full_name}
                        getSubtitle={(mg) => `${mg.role} — ${mg.assigned_class?.name ?? 'Admin'}`}
                        getInitial={(mg) => mg.full_name?.[0]}
                        avatarUrl={() => null}
                        avatarClass="bg-gold-900/20 border-gold-400/10 text-gold-400"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className={selectedSession ? 'lg:col-span-2' : 'lg:col-span-3'}>
                    <div className="panel">
                        <div className="panel__header">
                            <div className="flex justify-between items-center w-full gap-4 flex-wrap">
                                <div>
                                    <h3>Attendance History</h3>
                                    <p>Tap a session to view details · {attendanceSessions.length} recorded</p>
                                </div>
                                {!readonly && (
                                    <button className="btn btn--primary" onClick={openNewSession}>
                                        <ClipboardCheck size={18} /> Take Attendance
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="panel__body p-0">
                            <div className="table-responsive">
                                <table className="h-table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Type</th>
                                            <th>Present</th>
                                            <th>Absent</th>
                                            <th>Rate</th>
                                            <th className="text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {attendanceSessions.map((session) => (
                                            <tr
                                                key={session.id}
                                                className={`cursor-pointer transition-colors ${selectedSessionId === session.id ? 'bg-white/5' : 'hover:bg-white/[0.02]'}`}
                                                onClick={() => setSelectedSessionId(session.id)}
                                            >
                                                <td className="font-bold text-sm">{session.date}</td>
                                                <td>
                                                    <span className="badge badge--info !py-0.5 !px-2 !text-[10px]">
                                                        {session.type}
                                                    </span>
                                                </td>
                                                <td className="text-success font-bold text-sm">{session.present_count}</td>
                                                <td className="text-danger font-bold text-sm">{session.absent_count}</td>
                                                <td>
                                                    <span className={`badge ${percentBadgeClass(session.percent)} !py-0.5 !px-2 !text-[10px]`}>
                                                        {session.percent}%
                                                    </span>
                                                </td>
                                                <td className="text-right" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex items-center justify-end gap-1">
                                                        {!readonly && (
                                                            <>
                                                                <button
                                                                    onClick={() => openEditSession(session)}
                                                                    className="text-muted p-2 hover:bg-white/10 hover:text-white rounded-lg transition-colors"
                                                                    title="Edit Session"
                                                                >
                                                                    <Pencil size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={() => deleteSession(session.id)}
                                                                    className="text-danger/60 p-2 hover:bg-danger/10 hover:text-danger rounded-lg transition-colors"
                                                                    title="Delete Session"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </>
                                                        )}
                                                        <ChevronRight size={16} className="text-muted ml-1" />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {attendanceSessions.length === 0 && (
                                            <tr>
                                                <td colSpan="6" className="text-center py-12 text-muted italic">
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

                {selectedSession && (
                    <div className="panel h-fit">
                        <div className="panel__header">
                            <div className="flex justify-between items-start w-full">
                                <div>
                                    <h3 className="m-0">Session Detail</h3>
                                    <p className="m-0 mt-1 text-xs text-muted">
                                        {selectedSession.date} · {selectedSession.type}
                                    </p>
                                </div>
                                <button
                                    className="p-2 text-muted hover:text-white rounded-lg hover:bg-white/10"
                                    onClick={() => setSelectedSessionId(null)}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                        <div className="panel__body space-y-4">
                            <div className="grid grid-cols-3 gap-2">
                                <div className="text-center p-3 rounded-xl bg-success/10 border border-success/20">
                                    <div className="text-lg font-black text-success">{selectedSession.present_count}</div>
                                    <div className="text-[10px] uppercase tracking-widest text-muted">Present</div>
                                </div>
                                <div className="text-center p-3 rounded-xl bg-danger/10 border border-danger/20">
                                    <div className="text-lg font-black text-danger">{selectedSession.absent_count}</div>
                                    <div className="text-[10px] uppercase tracking-widest text-muted">Absent</div>
                                </div>
                                <div className="text-center p-3 rounded-xl bg-gold-400/10 border border-gold-400/20">
                                    <div className="text-lg font-black text-gold-400">{selectedSession.percent}%</div>
                                    <div className="text-[10px] uppercase tracking-widest text-muted">Rate</div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-black uppercase tracking-widest text-success mb-2">Present</h4>
                                <div className="space-y-1 max-h-40 overflow-y-auto">
                                    {selectedSession.records.filter((r) => r.is_present).map((r) => (
                                        <div key={r.id} className="text-sm text-gray-200 px-2 py-1 rounded bg-white/[0.03]">
                                            {r.name}
                                        </div>
                                    ))}
                                    {selectedSession.records.filter((r) => r.is_present).length === 0 && (
                                        <p className="text-xs text-muted italic">No one marked present.</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-xs font-black uppercase tracking-widest text-danger mb-2">Absent</h4>
                                <div className="space-y-1 max-h-40 overflow-y-auto">
                                    {selectedSession.records.filter((r) => !r.is_present).map((r) => (
                                        <div key={r.id} className="text-sm text-gray-400 px-2 py-1 rounded bg-white/[0.03]">
                                            {r.name}
                                        </div>
                                    ))}
                                    {selectedSession.records.filter((r) => !r.is_present).length === 0 && (
                                        <p className="text-xs text-muted italic">Perfect attendance!</p>
                                    )}
                                </div>
                            </div>

                            {!readonly && (
                                <button
                                    className="btn btn--secondary w-full"
                                    onClick={() => openEditSession(selectedSession)}
                                >
                                    <Pencil size={16} className="mr-2" /> Edit This Session
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function RollCallPanel({
    title,
    iconColor,
    presentColor,
    highlightClass,
    hoverClass,
    people,
    isPresent,
    onToggle,
    onMarkAllPresent,
    onMarkAllAbsent,
    getName,
    getSubtitle,
    getInitial,
    avatarUrl,
    avatarClass = 'bg-white/5 border-white/5',
}) {
    return (
        <div className="panel">
            <div className="panel__header py-3 bg-white/5 border-b border-white/5">
                <div className="flex justify-between items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                        <Users size={16} className={iconColor} />
                        <h4 className="m-0 font-bold text-sm">{title} ({people.length})</h4>
                    </div>
                    <div className="flex gap-1">
                        <button type="button" className="btn btn--ghost btn--sm text-xs" onClick={onMarkAllPresent}>
                            <CheckSquare size={14} className="mr-1" /> All
                        </button>
                        <button type="button" className="btn btn--ghost btn--sm text-xs" onClick={onMarkAllAbsent}>
                            <Square size={14} className="mr-1" /> None
                        </button>
                    </div>
                </div>
            </div>
            <div className="panel__body p-0 max-h-[500px] overflow-y-auto">
                {people.length === 0 ? (
                    <p className="text-center py-10 text-muted italic text-sm">No members match your filters.</p>
                ) : (
                    <div className="divide-y divide-white/5">
                        {people.map((person) => {
                            const present = isPresent(person.id);
                            return (
                                <div
                                    key={person.id}
                                    className={`flex items-center justify-between p-3.5 cursor-pointer transition-all border-b border-white/[0.03] last:border-0 ${hoverClass} ${present ? highlightClass : 'opacity-70'}`}
                                    onClick={() => onToggle(person.id)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`h-10 w-10 border rounded-full overflow-hidden shrink-0 flex items-center justify-center font-bold text-xs ${avatarClass}`}>
                                            {avatarUrl(person) ? (
                                                <img src={avatarUrl(person)} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="opacity-60">{getInitial(person)}</span>
                                            )}
                                        </div>
                                        <div>
                                            <div className={`font-bold text-sm transition-colors ${present ? presentColor : 'text-gray-100'}`}>
                                                {getName(person)}
                                            </div>
                                            <div className="text-[10px] text-muted font-medium uppercase tracking-wider">
                                                {getSubtitle(person)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`transition-all transform ${present ? 'scale-110' : 'opacity-30 scale-100'}`}>
                                        {present ? (
                                            <CheckSquare size={20} className="text-success shadow-sm" />
                                        ) : (
                                            <Square size={20} className="text-danger" />
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
