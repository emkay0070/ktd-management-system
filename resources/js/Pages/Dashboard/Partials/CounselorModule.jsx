import { Users, CheckCircle2, AlertCircle, MessageSquare, Shield } from 'lucide-react';

export default function CounselorModule({ data }) {
    const { unit, pathfinders } = data;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                        <Users size={28} className="text-blue-400" />
                        Unit: {unit?.name || 'Assigned Unit'}
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Manage attendance and pastoral care for your unit members.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Unit Members</div>
                    <div className="text-2xl font-black text-white">{pathfinders?.length || 0}</div>
                </div>
                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Attendance (Avg)</div>
                    <div className="text-2xl font-black text-success">92%</div>
                </div>
                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Medical Flags</div>
                    <div className="text-2xl font-black text-burgundy-500">
                        {pathfinders?.filter(p => p.medical_conditions).length || 0}
                    </div>
                </div>
                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Dues Paid</div>
                    <div className="text-2xl font-black text-info">85%</div>
                </div>
            </div>

            <div className="panel">
                <div className="panel__header">
                    <div className="flex items-center gap-3">
                        <Users size={20} className="text-blue-400" />
                        <h3>Unit Roster</h3>
                    </div>
                </div>
                <div className="panel__body p-0">
                    <div className="table-responsive">
                        <table className="h-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Age/Gender</th>
                                    <th>Contact</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pathfinders?.length > 0 ? (
                                    pathfinders.map(p => (
                                        <tr key={p.id}>
                                            <td className="cell-primary font-bold">{p.name}</td>
                                            <td className="text-xs text-gray-400 uppercase font-bold">
                                                {p.age}y / {p.gender}
                                            </td>
                                            <td>
                                                <button className="p-2 hover:bg-white/5 rounded-lg text-blue-400 transition-all">
                                                    <MessageSquare size={16} />
                                                </button>
                                            </td>
                                            <td>
                                                <button className="text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-white transition-colors">Details</button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="py-8 text-center text-gray-500 italic">No pathfinders assigned to this unit</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
