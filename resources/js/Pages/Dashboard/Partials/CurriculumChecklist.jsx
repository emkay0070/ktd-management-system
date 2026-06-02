import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

export default function CurriculumChecklist({ curriculum = [], progress = [] }) {
    if (curriculum.length === 0) {
        return (
            <div className="p-8 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                <p className="text-gray-400 font-medium">No curriculum requirements found for your class.</p>
            </div>
        );
    }

    const progressIds = progress.map(p => p.requirement_id);

    const grouped = curriculum.reduce((acc, req) => {
        const cat = acc.find(c => c.category === req.category);
        if (cat) cat.items.push(req);
        else acc.push({ category: req.category, items: [req] });
        return acc;
    }, []);

    const totalReqs = curriculum.length;
    const completedReqs = progress.length;
    const progressPct = totalReqs > 0 ? Math.round((completedReqs / totalReqs) * 100) : 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h4 className="text-white font-bold text-lg">Overall Progress</h4>
                    <p className="text-sm text-gray-400">{completedReqs} of {totalReqs} requirements completed</p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-black text-gold-400">{progressPct}%</div>
                </div>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-8">
                <div className="h-full bg-gold-500 rounded-full transition-all duration-1000" style={{ width: `${progressPct}%` }}></div>
            </div>

            <div className="space-y-6">
                {grouped.map(group => {
                    const groupCompleted = group.items.filter(req => progressIds.includes(req.id)).length;
                    return (
                        <div key={group.category} className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h5 className="text-sm font-bold text-gold-400 uppercase tracking-wider">{group.category}</h5>
                                <span className="text-xs text-gray-500 font-mono">{groupCompleted}/{group.items.length}</span>
                            </div>
                            <div className="space-y-2">
                                {group.items.map(req => {
                                    const isCompleted = progressIds.includes(req.id);
                                    return (
                                        <div 
                                            key={req.id} 
                                            className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                                                isCompleted 
                                                ? 'bg-success/10 border-success/30' 
                                                : 'bg-white/5 border-white/10 hover:border-white/20'
                                            }`}
                                        >
                                            <div className="shrink-0 mt-0.5">
                                                {isCompleted ? (
                                                    <CheckCircle2 size={18} className="text-success" />
                                                ) : (
                                                    <Circle size={18} className="text-gray-500" />
                                                )}
                                            </div>
                                            <div>
                                                <p className={`font-medium text-sm ${isCompleted ? 'text-white' : 'text-gray-300'}`}>
                                                    {req.title}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">{req.description}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
