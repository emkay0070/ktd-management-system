import React from 'react';
import { GraduationCap, AlertCircle, BookOpen, UserCheck, Activity } from 'lucide-react';

export default function DistrictCurriculumManager({ curriculum_stats, readonly }) {
    
    const calculateTotal = (stats) => {
        return stats.Friend + stats.Companion + stats.Explorer + stats.Ranger + stats.Voyager + stats.Guide;
    };

    const districtTotals = curriculum_stats.reduce((acc, curr) => {
        return {
            Friend: acc.Friend + curr.stats.Friend,
            Companion: acc.Companion + curr.stats.Companion,
            Explorer: acc.Explorer + curr.stats.Explorer,
            Ranger: acc.Ranger + curr.stats.Ranger,
            Voyager: acc.Voyager + curr.stats.Voyager,
            Guide: acc.Guide + curr.stats.Guide,
            Ready: acc.Ready + curr.stats.Ready,
            Total: acc.Total + calculateTotal(curr.stats)
        };
    }, { Friend: 0, Companion: 0, Explorer: 0, Ranger: 0, Voyager: 0, Guide: 0, Ready: 0, Total: 0 });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="panel slide-in">
                <div className="panel__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h3>Curriculum Department</h3>
                        <p>Monitor class progress, investiture readiness, and training statistics across the district.</p>
                    </div>
                    {!readonly && (
                        <button className="btn btn--primary btn--sm">
                            Generate Curriculum Report
                        </button>
                    )}
                </div>

                <div className="panel__body">
                    {/* District Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-surface-800 border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                            <BookOpen className="text-gold-400 mb-2" size={24} />
                            <div className="text-2xl font-black text-white">{districtTotals.Total}</div>
                            <div className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">In Classes</div>
                        </div>
                        <div className="bg-surface-800 border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                            <Activity className="text-info-400 mb-2" size={24} />
                            <div className="text-2xl font-black text-white">{curriculum_stats.length}</div>
                            <div className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Reporting Clubs</div>
                        </div>
                        <div className="bg-surface-800 border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                            <UserCheck className="text-burgundy-400 mb-2" size={24} />
                            <div className="text-2xl font-black text-white">0</div>
                            <div className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Certified Instructors</div>
                        </div>
                        <div className="bg-surface-800 border border-success-500/30 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                            <GraduationCap className="text-success-400 mb-2" size={24} />
                            <div className="text-2xl font-black text-success-400">{districtTotals.Ready}</div>
                            <div className="text-xs text-success-500/70 font-bold uppercase tracking-widest mt-1">Ready for Investiture</div>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Club</th>
                                    <th>Friend</th>
                                    <th>Companion</th>
                                    <th>Explorer</th>
                                    <th>Ranger</th>
                                    <th>Voyager</th>
                                    <th>Guide</th>
                                    <th>Total Active</th>
                                    <th>Ready for Investiture</th>
                                </tr>
                            </thead>
                            <tbody>
                                {curriculum_stats.map((row, idx) => (
                                    <tr key={idx}>
                                        <td className="font-bold text-white">{row.church.name}</td>
                                        <td>{row.stats.Friend > 0 ? row.stats.Friend : <span className="text-gray-600">-</span>}</td>
                                        <td>{row.stats.Companion > 0 ? row.stats.Companion : <span className="text-gray-600">-</span>}</td>
                                        <td>{row.stats.Explorer > 0 ? row.stats.Explorer : <span className="text-gray-600">-</span>}</td>
                                        <td>{row.stats.Ranger > 0 ? row.stats.Ranger : <span className="text-gray-600">-</span>}</td>
                                        <td>{row.stats.Voyager > 0 ? row.stats.Voyager : <span className="text-gray-600">-</span>}</td>
                                        <td>{row.stats.Guide > 0 ? row.stats.Guide : <span className="text-gray-600">-</span>}</td>
                                        <td className="font-bold text-gray-300">{calculateTotal(row.stats)}</td>
                                        <td className="font-bold text-success-400">{row.stats.Ready > 0 ? row.stats.Ready : <span className="text-gray-600">-</span>}</td>
                                    </tr>
                                ))}
                                {curriculum_stats.length === 0 && (
                                    <tr>
                                        <td colSpan="9" className="text-center py-8 text-gray-500">
                                            <div className="flex flex-col items-center justify-center">
                                                <AlertCircle size={32} className="mb-2 opacity-50" />
                                                <p>No club curriculum data found.</p>
                                            </div>
                                        </td>
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
