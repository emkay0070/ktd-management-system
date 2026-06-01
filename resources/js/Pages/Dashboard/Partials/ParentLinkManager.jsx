import { useForm } from '@inertiajs/react';
import { UserCheck, UserX, Link2, Users, Check, X, ShieldCheck } from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function ParentLinkManager({ requests = [], parents = [], pathfinders = [], readonly = false }) {
    const { post: postApprove, processing: processingApprove } = useForm();
    const { post: postReject, processing: processingReject } = useForm();
    const { data: linkData, setData: setLinkData, post: postManual, processing: processingManual, reset: resetManual } = useForm({
        user_id: '',
        pathfinder_id: '',
    });

    const handleApprove = (id) => {
        postApprove(route('parent_links.approve', id));
    };

    const handleReject = (id) => {
        postReject(route('parent_links.reject', id));
    };

    const handleManualLink = (e) => {
        e.preventDefault();
        postManual(route('parent_links.store'), {
            onSuccess: () => resetManual(),
        });
    };

    return (
        <div className="space-y-6">
            {/* Pending Requests */}
            <div className="panel">
                <div className="panel__header">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-burgundy-900/50 rounded-lg text-burgundy-400">
                            <Link2 size={20} />
                        </div>
                        <div>
                            <h3>Link Requests</h3>
                            <p>Verify and approve parent-child link requests</p>
                        </div>
                    </div>
                </div>
                <div className="panel__body p-0">
                    <div className="table-responsive">
                        <table className="h-table">
                            <thead>
                                <tr>
                                    <th>Parent Name</th>
                                    <th>Requested Child</th>
                                    <th>Match Type</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="py-8 text-center text-gray-500 italic">
                                            No pending link requests
                                        </td>
                                    </tr>
                                ) : (
                                    requests.map((request) => (
                                        <tr key={request.id}>
                                            <td className="cell-primary">{request.user.name}</td>
                                            <td>{request.pathfinder.name}</td>
                                            <td>
                                                <span className="badge badge--info">System Match</span>
                                            </td>
                                            <td className="text-right">
                                                {!readonly && (
                                                    <div className="flex justify-end gap-2">
                                                        <button 
                                                            onClick={() => handleApprove(request.id)}
                                                            disabled={processingApprove}
                                                            className="btn btn--sm btn--primary"
                                                        >
                                                            <Check size={14} className="mr-1" /> Approve
                                                        </button>
                                                        <button 
                                                            onClick={() => handleReject(request.id)}
                                                            disabled={processingReject}
                                                            className="btn btn--sm btn--secondary"
                                                        >
                                                            <X size={14} className="mr-1" /> Reject
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Manual Link Tool */}
                <div className="panel h-full">
                    <div className="panel__header">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gold-900/50 rounded-lg text-gold-400">
                                <ShieldCheck size={20} />
                            </div>
                            <div>
                                <h3>Manual Association</h3>
                                <p>Force link a parent to a pathfinder record</p>
                            </div>
                        </div>
                    </div>
                    <div className="panel__body">
                        <form onSubmit={handleManualLink} className="space-y-4">
                            <div className="form-group">
                                <label>Select Parent Account</label>
                                <select 
                                    className="h-select mt-1"
                                    value={linkData.user_id}
                                    onChange={e => setLinkData('user_id', e.target.value)}
                                    required
                                    disabled={readonly}
                                >
                                    <option value="">-- Choose Account --</option>
                                    {parents.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} ({p.email})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Select Pathfinder Profile</label>
                                <select 
                                    className="h-select mt-1"
                                    value={linkData.pathfinder_id}
                                    onChange={e => setLinkData('pathfinder_id', e.target.value)}
                                    required
                                    disabled={readonly}
                                >
                                    <option value="">-- Choose Profile --</option>
                                    {pathfinders.map(pf => (
                                        <option key={pf.id} value={pf.id}>{pf.name}</option>
                                    ))}
                                </select>
                            </div>
                            {!readonly && (
                                <PrimaryButton className="w-full" disabled={processingManual}>
                                    <Link2 size={16} className="mr-2" /> Connect Accounts
                                </PrimaryButton>
                            )}
                        </form>
                    </div>
                </div>

                {/* Parent Roster */}
                <div className="panel h-full">
                    <div className="panel__header">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-burgundy-900/50 rounded-lg text-burgundy-400">
                                <Users size={20} />
                            </div>
                            <div>
                                <h3>Registered Parents</h3>
                                <p>Active parent accounts in this club</p>
                            </div>
                        </div>
                    </div>
                    <div className="panel__body p-0">
                        <div className="table-responsive">
                            <table className="h-table">
                                <thead>
                                    <tr>
                                        <th>Parent</th>
                                        <th>Children</th>
                                        <th>Role</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {parents.length === 0 ? (
                                        <tr>
                                            <td colSpan="3" className="py-8 text-center text-gray-500 italic">No parent accounts linked</td>
                                        </tr>
                                    ) : (
                                        parents.map(parent => (
                                            <tr key={parent.id}>
                                                <td>
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-burgundy-900/50 flex items-center justify-center text-[10px] border border-white/5 overflow-hidden">
                                                            {parent.avatar_url ? (
                                                                <img src={parent.avatar_url} className="h-full w-full object-cover" />
                                                            ) : (
                                                                parent.name.substring(0, 1)
                                                            )}
                                                        </div>
                                                        <div className="cell-primary">{parent.name}</div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="flex flex-wrap gap-1">
                                                        {parent.children?.map(child => (
                                                            <span key={child.id} className="badge badge--success">{child.name}</span>
                                                        )) || <span className="text-gray-500 italic text-[11px]">No children linked</span>}
                                                    </div>
                                                </td>
                                                <td className="text-[11px] font-bold text-gray-500 uppercase tracking-widest italic">
                                                    {parent.parent_profile?.club_role || 'No specific role'}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
