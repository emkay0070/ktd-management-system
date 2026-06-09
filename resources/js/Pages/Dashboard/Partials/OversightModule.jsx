import { Shield, Users, CheckCircle2, Clock, MessageSquare, Link as LinkIcon } from 'lucide-react';
import LivePresence from './LivePresence';

export default function OversightModule({ data, auth }) {
    const { club, pending_approvals, parent_requests, club_channel_id } = data;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                        <Shield size={28} className="text-burgundy-400" />
                        Club Oversight
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Management and approvals for the entire local club.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="panel">
                        <div className="panel__header">
                            <div className="flex items-center gap-3">
                                <Clock size={20} className="text-gold-500" />
                                <h3>Pending Staff Approvals</h3>
                            </div>
                        </div>
                        <div className="panel__body p-0">
                            <div className="table-responsive">
                                <table className="h-table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Role Requested</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pending_approvals?.length > 0 ? (
                                            pending_approvals.map(user => (
                                                <tr key={user.id}>
                                                    <td className="cell-primary font-bold">{user.name}</td>
                                                    <td>
                                                        <span className="badge badge--info">{user.roles?.[0]?.display_name}</span>
                                                    </td>
                                                    <td>
                                                        <button className="text-xs font-black text-burgundy-400 uppercase tracking-widest hover:text-white transition-colors">Review</button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="3" className="py-8 text-center text-gray-500 italic">No pending staff approvals</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="panel">
                        <div className="panel__header">
                            <div className="flex items-center gap-3">
                                <LinkIcon size={20} className="text-blue-400" />
                                <h3>Parent Link Requests</h3>
                            </div>
                        </div>
                        <div className="panel__body p-0">
                            <div className="table-responsive">
                                <table className="h-table">
                                    <thead>
                                        <tr>
                                            <th>Parent</th>
                                            <th>Pathfinder</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {parent_requests?.length > 0 ? (
                                            parent_requests.map(req => (
                                                <tr key={req.id}>
                                                    <td className="cell-primary font-bold">{req.user?.name}</td>
                                                    <td className="text-xs text-gray-400 uppercase font-bold">{req.pathfinder?.name}</td>
                                                    <td>
                                                        <button className="text-xs font-black text-success uppercase tracking-widest hover:text-white transition-colors">Approve</button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="3" className="py-8 text-center text-gray-500 italic">No pending link requests</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <LivePresence channelId={club_channel_id} auth={auth} />
                    
                    {/* Club Stats Mini Card */}
                    <div className="panel bg-gradient-to-br from-burgundy-900/20 to-surface-800 border-burgundy-500/20">
                        <div className="panel__header">
                            <h3 className="text-burgundy-400 text-[10px] font-black uppercase tracking-widest">Club Summary</h3>
                        </div>
                        <div className="panel__body space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500 uppercase font-black">Pathfinders</span>
                                <span className="text-sm font-bold text-white">{club?.total_pathfinders || 0}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500 uppercase font-black">Master Guides</span>
                                <span className="text-sm font-bold text-white">{club?.master_guides?.total || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
