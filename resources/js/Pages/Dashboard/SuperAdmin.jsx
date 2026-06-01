import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { AlertTriangle, Check, Church, Layers, Shield, Users, Stethoscope, ChevronDown, ChevronUp, ChevronRight, X } from 'lucide-react';
import { useState } from 'react';

function VerifyChurchAction({ church }) {
    const { post, processing } = useForm({});
    return (
        <div className="flex items-center gap-2">
            <button
                disabled={processing}
                onClick={() => post(route('verification.churches.approve', church.id))}
                className="btn btn--sm bg-green-600/20 text-green-400 border border-green-600/30 hover:bg-green-600/40 disabled:opacity-50"
            >
                <Check size={13} className="mr-1" /> Approve
            </button>
            <button
                disabled={processing}
                onClick={() => post(route('verification.churches.reject', church.id))}
                className="btn btn--sm bg-danger-500/10 text-danger-400 border border-danger-500/20 hover:bg-danger-500/20 disabled:opacity-50"
            >
                <X size={13} className="mr-1" /> Reject
            </button>
        </div>
    );
}

function VerifyRoleAction({ user }) {
    const { post, processing } = useForm({});
    return (
        <div className="flex items-center gap-2">
            <button
                disabled={processing}
                onClick={() => post(route('verification.roles.approve', user.id))}
                className="btn btn--sm bg-green-600/20 text-green-400 border border-green-600/30 hover:bg-green-600/40 disabled:opacity-50"
            >
                <Check size={13} className="mr-1" /> Approve
            </button>
            <button
                disabled={processing}
                onClick={() => post(route('verification.roles.reject', user.id))}
                className="btn btn--sm bg-danger-500/10 text-danger-400 border border-danger-500/20 hover:bg-danger-500/20 disabled:opacity-50"
            >
                <X size={13} className="mr-1" /> Reject
            </button>
        </div>
    );
}

export default function SuperAdmin({ churches = [], pending_churches = [], pending_approvals = [], medical_alerts = [] }) {
    const { auth } = usePage().props;
    const [showMedicalDetails, setShowMedicalDetails] = useState(false);
    const [showChurchQueue, setShowChurchQueue] = useState(false);
    const [showRoleQueue, setShowRoleQueue] = useState(false);

    const totalPathfinders = churches.reduce((s, c) => s + (c.total ?? 0), 0);
    const totalMedical = medical_alerts.length;
    const totalMasterGuides = churches.reduce((s, c) => s + (c.master_guides ?? 0), 0);
    const totalMGiT = churches.reduce((s, c) => s + (c.mgit ?? 0), 0);
    const totalUnits = churches.reduce((s, c) => s + (c.units ?? 0), 0);
    const activeChurches = churches.filter((c) => c.status === 'active').length;

    const actionCount = pending_churches.length + pending_approvals.length;

    return (
        <AuthenticatedLayout header="District Command Centre" breadcrumb="Super Admin → Overview">
            <Head title="District Dashboard" />

            <div className="space-y-6 mb-8">
                {actionCount > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pending_churches.length > 0 && (
                            <div className="space-y-2">
                                <div className="alert alert--warning flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Church size={18} className="text-warning-500" />
                                        <span><strong>{pending_churches.length} New Church Application{pending_churches.length > 1 ? 's' : ''}</strong> waiting for verification.</span>
                                    </div>
                                    <button
                                        onClick={() => setShowChurchQueue(v => !v)}
                                        className="btn btn--white btn--sm font-bold flex items-center gap-1"
                                    >
                                        {showChurchQueue ? 'Hide' : 'Verify Now'}
                                        {showChurchQueue ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                                    </button>
                                </div>
                                {showChurchQueue && (
                                    <div className="bg-surface-800 border border-warning-500/20 rounded-2xl overflow-hidden fade-in divide-y divide-white/5">
                                        {pending_churches.map(church => (
                                            <div key={church.id} className="flex items-center justify-between px-5 py-3">
                                                <div>
                                                    <div className="font-bold text-white text-sm">{church.name}</div>
                                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest">{church.location ?? 'No location'}</div>
                                                </div>
                                                <VerifyChurchAction church={church} />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        {pending_approvals.length > 0 && (
                            <div className="space-y-2">
                                <div className="alert alert--info flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Shield size={18} className="text-info-500" />
                                        <span><strong>{pending_approvals.length} Leader Credential{pending_approvals.length > 1 ? 's' : ''}</strong> waiting for approval.</span>
                                    </div>
                                    <button
                                        onClick={() => setShowRoleQueue(v => !v)}
                                        className="btn btn--white btn--sm font-bold flex items-center gap-1"
                                    >
                                        {showRoleQueue ? 'Hide' : 'Review'}
                                        {showRoleQueue ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                                    </button>
                                </div>
                                {showRoleQueue && (
                                    <div className="bg-surface-800 border border-info-500/20 rounded-2xl overflow-hidden fade-in divide-y divide-white/5">
                                        {pending_approvals.map(user => (
                                            <div key={user.id} className="flex items-center justify-between px-5 py-3">
                                                <div>
                                                    <div className="font-bold text-white text-sm">{user.name}</div>
                                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest">
                                                        {user.roles?.filter(r => r.pivot?.status === 'pending').map(r => r.display_name ?? r.name).join(', ')}
                                                    </div>
                                                </div>
                                                <VerifyRoleAction user={user} />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {totalMedical > 0 && (
                    <div className="space-y-3">
                        <div 
                            className={`alert alert--danger cursor-pointer flex items-center justify-between transition-all ${showMedicalDetails ? 'rounded-b-none border-b-0' : ''}`}
                            onClick={() => setShowMedicalDetails(!showMedicalDetails)}
                        >
                            <div className="flex items-center gap-3">
                                <AlertTriangle size={18} className="text-danger-500" />
                                <span>
                                    <strong>{totalMedical} High-Priority Medical Flag{totalMedical > 1 ? 's' : ''}</strong> detected in recent registrations.
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-danger-500/10 px-2 py-1 rounded">
                                {showMedicalDetails ? 'Hide Details' : 'View Details'}
                                {showMedicalDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </div>
                        </div>

                        {showMedicalDetails && (
                            <div className="bg-surface-800 border border-danger-500/20 border-t-0 rounded-b-2xl overflow-hidden fade-in">
                                <div className="p-4 space-y-3">
                                    {medical_alerts.map(alert => (
                                        <div key={alert.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-danger-500/10 text-danger-500 rounded-lg">
                                                    <Stethoscope size={18} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white leading-tight">{alert.name}</div>
                                                    <div className="text-[10px] text-gray-500 uppercase font-black">{alert.church?.name}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-medium text-danger-400 capitalize">{alert.medical_conditions}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="stats-grid">
                <div className="stat-card stat-card--burgundy transition-transform hover:scale-[1.02] cursor-pointer">
                    <div className="stat-icon stat-icon--burgundy"><Church size={22} /></div>
                    <div className="stat-value">{churches.length}</div>
                    <div className="stat-label">Churches / Clubs</div>
                    <div className="stat-sub">{activeChurches} active</div>
                </div>

                <div className="stat-card stat-card--gold transition-transform hover:scale-[1.02] cursor-pointer">
                    <div className="stat-icon stat-icon--gold"><Users size={22} /></div>
                    <div className="stat-value">{totalPathfinders}</div>
                    <div className="stat-label">Total Pathfinders</div>
                    <div className="stat-sub">All clubs</div>
                </div>

                <div className="stat-card stat-card--success transition-transform hover:scale-[1.02] cursor-pointer">
                    <div className="stat-icon stat-icon--success"><Shield size={22} /></div>
                    <div className="stat-value">{totalMasterGuides}</div>
                    <div className="stat-label">Master Guides</div>
                    <div className="stat-sub">{totalMGiT} MGiT</div>
                </div>

                <div className="stat-card stat-card--info transition-transform hover:scale-[1.02] cursor-pointer">
                    <div className="stat-icon stat-icon--info"><Layers size={22} /></div>
                    <div className="stat-value">{totalUnits}</div>
                    <div className="stat-label">Units</div>
                    <div className="stat-sub">{totalMedical} clinical flags</div>
                </div>
            </div>

            <div className="panel transition-all">
                <div className="panel__header">
                    <div>
                        <h3 className="flex items-center gap-2">
                            All Clubs 
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2 py-0.5 px-2 bg-white/5 rounded">Live Pulse</span>
                        </h3>
                        <p className="text-xs text-gray-500">Read-only view into each club’s command center</p>
                    </div>
                    <span className="badge badge--neutral">{churches.length} churches</span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table className="h-table">
                        <thead>
                            <tr>
                                <th>Church</th>
                                <th>Pathfinders</th>
                                <th>Units</th>
                                <th>Master Guides</th>
                                <th>MGiT</th>
                                <th>Clinical Alerts</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {churches.map((church) => (
                                <tr key={church.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td>
                                        <div className="church-meta">
                                            <span className="church-name font-bold text-white">{church.name}</span>
                                            <span className="church-district text-[10px] text-gray-500 uppercase tracking-wider">{church.location ?? '—'}</span>
                                        </div>
                                    </td>
                                    <td><span className="cell-primary font-black text-gold-500">{church.total ?? 0}</span></td>
                                    <td>{church.units ?? 0}</td>
                                    <td>{church.master_guides ?? 0}</td>
                                    <td>{church.mgit ?? 0}</td>
                                    <td>
                                        {church.medical > 0 ? (
                                            <span className="badge badge--warning font-bold">
                                                <AlertTriangle size={11} className="mr-1" />
                                                {church.medical}
                                            </span>
                                        ) : (
                                            <span className="badge badge--success text-[10px] uppercase font-black tracking-widest">Clear</span>
                                        )}
                                    </td>
                                    <td>
                                        {church.status === 'active' ? (
                                            <span className="badge badge--success text-[10px] uppercase font-black">Active</span>
                                        ) : (
                                            <span className="badge badge--warning text-[10px] uppercase font-black">Pending</span>
                                        )}
                                    </td>
                                    <td>
                                        <Link className="btn btn--outline btn--sm group" href={route('clubs.show', church.id)}>
                                            Explore <ChevronRight size={14} className="ml-1 group-hover:translate-x-0.5 transition-transform" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
