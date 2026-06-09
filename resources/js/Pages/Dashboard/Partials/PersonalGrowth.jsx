import { BookOpen, Star, CheckCircle2, Clock, Award, FileText } from 'lucide-react';

export default function PersonalGrowth({ data }) {
    const { profile, is_mg, is_mgt, trainings, credentials } = data;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                        <BookOpen size={28} className="text-gold-400" />
                        My Personal Development
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Track your progress toward Master Guide investiture and beyond.</p>
                </div>
            </div>

            {/* MGT Progress Tracker (If applicable) */}
            {is_mgt && (
                <div className="panel border-gold-500/20 bg-gold-500/5">
                    <div className="panel__header border-gold-500/10">
                        <div className="flex items-center gap-3">
                            <Star size={20} className="text-gold-500" />
                            <h3 className="text-gold-500">Master Guide Curriculum Progress</h3>
                        </div>
                    </div>
                    <div className="panel__body p-6">
                        <div className="mb-8">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-xs font-black text-gold-500 uppercase tracking-widest">Overall Completion</span>
                                <span className="text-2xl font-black text-white">62%</span>
                            </div>
                            <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                <div className="h-full bg-gold-500 w-[62%] transition-all duration-1000"></div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ProgressItem label="Spiritual Discovery" status="completed" />
                            <ProgressItem label="Child Development" status="completed" />
                            <ProgressItem label="Leadership Development" status="completed" />
                            <ProgressItem label="Skills Development" status="in_progress" />
                            <ProgressItem label="Outdoor Living" status="pending" />
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Credential Wallet */}
                <div className="panel">
                    <div className="panel__header">
                        <div className="flex items-center gap-3">
                            <Award size={20} className="text-burgundy-400" />
                            <h3>Credential Wallet</h3>
                        </div>
                    </div>
                    <div className="panel__body p-6 space-y-4">
                        {credentials?.length > 0 ? (
                            credentials.map(cred => (
                                <div key={cred.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-burgundy-500/10 text-burgundy-400 rounded-lg">
                                            <Award size={18} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white uppercase">{cred.credential_type.replace('_', ' ')}</div>
                                            <div className="text-[10px] text-gray-500 uppercase tracking-widest">Issued: {cred.issued_at}</div>
                                        </div>
                                    </div>
                                    <span className="badge badge--success">Active</span>
                                </div>
                            ))
                        ) : (
                            <div className="py-8 text-center text-gray-500 italic text-sm">No digital credentials found.</div>
                        )}
                    </div>
                </div>

                {/* Service Log */}
                <div className="panel">
                    <div className="panel__header">
                        <div className="flex items-center gap-3">
                            <Clock size={20} className="text-info" />
                            <h3>Service Log</h3>
                        </div>
                    </div>
                    <div className="panel__body p-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                                <span className="text-xs font-bold text-gray-400 uppercase">Teaching Hours</span>
                                <span className="text-sm font-black text-white">48h</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                                <span className="text-xs font-bold text-gray-400 uppercase">Community Service</span>
                                <span className="text-sm font-black text-white">12h</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                                <span className="text-xs font-bold text-gray-400 uppercase">Leadership Sessions</span>
                                <span className="text-sm font-black text-white">8h</span>
                            </div>
                            <button className="btn w-full py-2.5 text-[10px] font-black uppercase tracking-widest border border-white/10 hover:bg-white/5 transition-all">
                                Log New Activity
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ProgressItem({ label, status }) {
    const statusConfig = {
        completed: { icon: <CheckCircle2 size={16} className="text-success" />, text: 'Completed', color: 'text-success' },
        in_progress: { icon: <Clock size={16} className="text-gold-500" />, text: 'In Progress', color: 'text-gold-500' },
        pending: { icon: <Clock size={16} className="text-gray-600" />, text: 'Pending', color: 'text-gray-500' },
    };

    const config = statusConfig[status];

    return (
        <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase">{label}</span>
            <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black uppercase tracking-widest ${config.color}`}>{config.text}</span>
                {config.icon}
            </div>
        </div>
    );
}
