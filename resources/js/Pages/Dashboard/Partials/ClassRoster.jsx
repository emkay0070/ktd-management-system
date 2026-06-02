import React, { useState } from 'react';
import { Users, CheckCircle2, ChevronRight, X, User as UserIcon } from 'lucide-react';
import { useForm } from '@inertiajs/react';

export default function ClassRoster({ roster = [], curriculum = [] }) {
    const [selectedPathfinder, setSelectedPathfinder] = useState(null);
    const { post, processing } = useForm({});

    const handleSignOff = (pathfinderId, requirementId) => {
        post(route('curriculum.signoff', { pathfinder: pathfinderId, requirement: requirementId }), {
            preserveScroll: true,
            onSuccess: () => {
                // Handle success
            }
        });
    };

    if (roster.length === 0) {
        return (
            <div className="p-12 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                <Users size={32} className="mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400 font-medium">No pathfinders are currently assigned to this class.</p>
            </div>
        );
    }

    if (selectedPathfinder) {
        const p = selectedPathfinder;
        const progressIds = (p.progress || []).map(pr => pr.requirement_id);

        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-burgundy-900/50 border border-burgundy-500/30 flex items-center justify-center overflow-hidden">
                            {p.avatar_url ? (
                                <img src={p.avatar_url} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                                <UserIcon size={18} className="text-burgundy-400" />
                            )}
                        </div>
                        <div>
                            <h4 className="font-bold text-white leading-tight">{p.name}</h4>
                            <p className="text-sm text-gray-400">{p.unitMembership?.unit?.name || 'No Unit'}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setSelectedPathfinder(null)}
                        className="px-4 py-2 text-sm font-semibold rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors flex items-center gap-2"
                    >
                        <X size={16} /> Close Profile
                    </button>
                </div>

                <div className="space-y-6">
                    {curriculum.length === 0 ? (
                        <p className="text-gray-500 text-sm">No curriculum requirements found for this class.</p>
                    ) : (
                        curriculum.reduce((acc, req) => {
                            const cat = acc.find(c => c.category === req.category);
                            if (cat) cat.items.push(req);
                            else acc.push({ category: req.category, items: [req] });
                            return acc;
                        }, []).map(group => (
                            <div key={group.category} className="space-y-3">
                                <h5 className="text-sm font-bold text-gold-400 uppercase tracking-wider">{group.category}</h5>
                                <div className="space-y-2">
                                    {group.items.map(req => {
                                        const isCompleted = progressIds.includes(req.id);
                                        return (
                                            <div key={req.id} className="flex items-start justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                                                <div>
                                                    <p className="font-semibold text-white text-sm">{req.title}</p>
                                                    <p className="text-xs text-gray-400 mt-1">{req.description}</p>
                                                </div>
                                                <button
                                                    onClick={() => !isCompleted && handleSignOff(p.id, req.id)}
                                                    disabled={isCompleted || processing}
                                                    className={`shrink-0 ml-4 p-2 rounded-lg transition-colors flex items-center gap-2 text-xs font-semibold ${
                                                        isCompleted 
                                                        ? 'bg-success/20 text-success cursor-default' 
                                                        : 'bg-burgundy-600 hover:bg-burgundy-500 text-white'
                                                    }`}
                                                >
                                                    {isCompleted ? (
                                                        <><CheckCircle2 size={16} /> Signed Off</>
                                                    ) : (
                                                        'Sign Off'
                                                    )}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {roster.map(pathfinder => {
                const totalReqs = curriculum.length;
                const completedReqs = (pathfinder.progress || []).length;
                const progressPct = totalReqs > 0 ? Math.round((completedReqs / totalReqs) * 100) : 0;

                return (
                    <div 
                        key={pathfinder.id}
                        onClick={() => setSelectedPathfinder(pathfinder)}
                        className="group flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-burgundy-500/50 hover:bg-white/10 transition-all cursor-pointer"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-burgundy-900/50 border border-burgundy-500/30 flex items-center justify-center overflow-hidden">
                                {pathfinder.avatar_url ? (
                                    <img src={pathfinder.avatar_url} alt={pathfinder.name} className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon size={18} className="text-burgundy-400" />
                                )}
                            </div>
                            <div>
                                <h4 className="font-bold text-white group-hover:text-gold-400 transition-colors">{pathfinder.name}</h4>
                                <p className="text-xs text-gray-400">{pathfinder.unitMembership?.unit?.name || 'No Unit'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="text-right hidden sm:block">
                                <div className="flex items-center gap-2 justify-end mb-1">
                                    <span className="text-xs font-bold text-white">{progressPct}%</span>
                                    <span className="text-xs text-gray-500">completed</span>
                                </div>
                                <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-gold-500 rounded-full" style={{ width: `${progressPct}%` }}></div>
                                </div>
                            </div>
                            <ChevronRight size={18} className="text-gray-600 group-hover:text-white transition-colors" />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
