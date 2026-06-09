import React, { useState } from 'react';
import { useForm, Link } from '@inertiajs/react';
import { Check, X, Shield, Users, Link2, Church, ChevronDown, ChevronUp, Clock, AlertCircle } from 'lucide-react';

function VerifyRoleAction({ user }) {
    const { post, processing } = useForm({});
    return (
        <div className="flex items-center gap-2">
            <button 
                disabled={processing} 
                onClick={() => post(route('verification.roles.approve', user.id))} 
                className="btn btn--sm bg-green-600/20 text-green-400 border border-green-600/30 hover:bg-green-600/40 disabled:opacity-50 transition-all"
            >
                <Check size={13} className="mr-1" /> Approve
            </button>
            <button 
                disabled={processing} 
                onClick={() => post(route('verification.roles.reject', user.id))} 
                className="btn btn--sm bg-danger-500/10 text-danger-400 border border-danger-500/20 hover:bg-danger-500/20 disabled:opacity-50 transition-all"
            >
                <X size={13} className="mr-1" /> Reject
            </button>
        </div>
    );
}

function VerifyChurchAction({ church }) {
    const { post, processing } = useForm({});
    return (
        <div className="flex items-center gap-2">
            <button 
                disabled={processing} 
                onClick={() => post(route('verification.churches.approve', church.id))} 
                className="btn btn--sm bg-green-600/20 text-green-400 border border-green-600/30 hover:bg-green-600/40 disabled:opacity-50 transition-all"
            >
                <Check size={13} className="mr-1" /> Approve
            </button>
            <button 
                disabled={processing} 
                onClick={() => post(route('verification.churches.reject', church.id))} 
                className="btn btn--sm bg-danger-500/10 text-danger-400 border border-danger-500/20 hover:bg-danger-500/20 disabled:opacity-50 transition-all"
            >
                <X size={13} className="mr-1" /> Reject
            </button>
        </div>
    );
}

function VerifyParentLinkAction({ request }) {
    const { post, processing } = useForm({});
    return (
        <div className="flex items-center gap-2">
            <button 
                disabled={processing} 
                onClick={() => post(route('parent_links.approve', request.id))} 
                className="btn btn--sm bg-green-600/20 text-green-400 border border-green-600/30 hover:bg-green-600/40 disabled:opacity-50 transition-all"
            >
                <Check size={13} className="mr-1" /> Approve
            </button>
            <button 
                disabled={processing} 
                onClick={() => post(route('parent_links.reject', request.id))} 
                className="btn btn--sm bg-danger-500/10 text-danger-400 border border-danger-500/20 hover:bg-danger-500/20 disabled:opacity-50 transition-all"
            >
                <X size={13} className="mr-1" /> Reject
            </button>
        </div>
    );
}

export default function ApprovalCenter({ 
    pending_approvals = [], 
    pending_churches = [], 
    parent_link_requests = [],
    level = 'club' // 'club', 'district', 'super'
}) {
    const [expanded, setExpanded] = useState(true);
    const totalCount = pending_approvals.length + pending_churches.length + parent_link_requests.length;

    if (totalCount === 0) return null;

    return (
        <div className="space-y-4 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className={`p-1 rounded-[2rem] border transition-all duration-500 ${
                totalCount > 5 ? 'bg-burgundy-950/20 border-burgundy-500/30' : 'bg-surface-900/40 border-white/10'
            }`}>
                <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${
                            totalCount > 5 ? 'bg-burgundy-500/20 text-burgundy-400' : 'bg-gold-500/20 text-gold-400'
                        }`}>
                            <Shield size={24} className={totalCount > 5 ? 'animate-pulse' : ''} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white leading-tight">Verification Center</h3>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                                {totalCount} Pending Action{totalCount !== 1 ? 's' : ''} • Needs Review
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setExpanded(!expanded)}
                        className="p-2 hover:bg-white/5 rounded-xl transition-colors text-gray-400"
                    >
                        {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                </div>

                {expanded && (
                    <div className="px-2 pb-2 space-y-2">
                        {/* Pending Church Applications (District/Super Level) */}
                        {pending_churches.length > 0 && (
                            <div className="space-y-1">
                                <div className="px-4 py-2 text-[10px] font-black text-warning-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Church size={12} /> New Club Applications
                                </div>
                                {pending_churches.map(church => (
                                    <div key={church.id} className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 hover:bg-white/[0.05] transition-all">
                                        <div className="flex items-center gap-4 w-full sm:w-auto">
                                            <div className="h-10 w-10 bg-warning-500/10 text-warning-400 rounded-xl flex items-center justify-center shrink-0">
                                                <Church size={20} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-white text-sm">{church.name}</div>
                                                <div className="text-[10px] text-gray-500 uppercase tracking-widest">{church.location ?? 'Location Pending'}</div>
                                            </div>
                                        </div>
                                        <VerifyChurchAction church={church} />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pending Leader Credentials (All Levels) */}
                        {pending_approvals.length > 0 && (
                            <div className="space-y-1">
                                <div className="px-4 py-2 text-[10px] font-black text-info-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Users size={12} /> Leader Credentials
                                </div>
                                {pending_approvals.map(user => (
                                    <div key={user.id} className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 hover:bg-white/[0.05] transition-all">
                                        <div className="flex items-center gap-4 w-full sm:w-auto">
                                            <div className="h-10 w-10 bg-info-500/10 text-info-400 rounded-xl flex items-center justify-center shrink-0 font-bold">
                                                {user.name[0]}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white text-sm">
                                                    {user.name}
                                                    {level !== 'club' && user.church && (
                                                        <span className="ml-2 text-[10px] text-burgundy-400 font-black uppercase tracking-widest">
                                                            {user.church.name}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[10px] text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                                    <Clock size={10} /> 
                                                    {user.roles?.filter(r => r.pivot?.status === 'pending').map(r => r.display_name ?? r.name).join(', ')}
                                                </div>
                                            </div>
                                        </div>
                                        <VerifyRoleAction user={user} />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pending Parent Link Requests (Club Level) */}
                        {parent_link_requests.length > 0 && (
                            <div className="space-y-1">
                                <div className="px-4 py-2 text-[10px] font-black text-burgundy-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Link2 size={12} /> Parent-Child Links
                                </div>
                                {parent_link_requests.map(request => (
                                    <div key={request.id} className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 hover:bg-white/[0.05] transition-all">
                                        <div className="flex items-center gap-4 w-full sm:w-auto">
                                            <div className="h-10 w-10 bg-burgundy-500/10 text-burgundy-400 rounded-xl flex items-center justify-center shrink-0">
                                                <Link2 size={20} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-white text-sm">
                                                    {request.user.name} → {request.pathfinder.name}
                                                </div>
                                                <div className="text-[10px] text-gray-500 uppercase tracking-widest">Family Relationship Verification</div>
                                            </div>
                                        </div>
                                        <VerifyParentLinkAction request={request} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
