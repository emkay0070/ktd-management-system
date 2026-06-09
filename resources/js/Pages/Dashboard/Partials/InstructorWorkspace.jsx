import { useState } from 'react';
import { 
    Users, 
    BookOpen, 
    CheckCircle2, 
    AlertCircle, 
    Search,
    Filter,
    ClipboardCheck,
    FileText,
    ChevronRight,
    Library,
    ArrowRight,
    GraduationCap
} from 'lucide-react';
import { router } from '@inertiajs/react';

export default function InstructorWorkspace({ data }) {
    const { class: pathfinderClass, roster, curriculum, resources } = data;
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPathfinders, setSelectedPathfinders] = useState([]);
    const [selectedRequirement, setSelectedRequirement] = useState(null);

    const filteredRoster = roster.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const togglePathfinderSelection = (id) => {
        setSelectedPathfinders(prev => 
            prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
        );
    };

    const handleBatchSignOff = () => {
        if (!selectedRequirement || selectedPathfinders.length === 0) return;

        if (confirm(`Sign off "${selectedRequirement.title}" for ${selectedPathfinders.length} Pathfinders?`)) {
            router.post(route('curriculum.batch-signoff'), {
                pathfinder_ids: selectedPathfinders,
                requirement_id: selectedRequirement.id
            }, {
                onSuccess: () => {
                    setSelectedPathfinders([]);
                    setSelectedRequirement(null);
                }
            });
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Info */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                        <GraduationCap size={28} className="text-burgundy-400" />
                        {pathfinderClass?.name} Class Workspace
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Manage your students and track their progress through the curriculum.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="btn btn--burgundy flex items-center gap-2">
                        <FileText size={18} />
                        Submit Monthly Report
                    </button>
                </div>
            </div>

            {/* Quick Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Total Students</div>
                    <div className="text-2xl font-black text-white">{roster.length}</div>
                </div>
                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Ready for Review</div>
                    <div className="text-2xl font-black text-gold-500">
                        {roster.filter(p => p.classAssignment?.investiture_status === 'pending_review').length}
                    </div>
                </div>
                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Average Progress</div>
                    <div className="text-2xl font-black text-success">
                        {Math.round(roster.reduce((acc, p) => acc + (p.progress?.length || 0), 0) / (roster.length * curriculum.length || 1) * 100)}%
                    </div>
                </div>
                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Unverified Tasks</div>
                    <div className="text-2xl font-black text-info">
                        {roster.filter(p => p.classAssignment?.investiture_status === 'not_ready').length}
                    </div>
                </div>
            </div>

            {/* Batch Sign-Off Tool */}
            <div className="panel border-gold-500/20 bg-gold-500/5">
                <div className="panel__header border-gold-500/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gold-500/20 rounded-lg text-gold-500">
                            <ClipboardCheck size={20} />
                        </div>
                        <div>
                            <h3 className="text-gold-500">Rapid Sign-Off Tool</h3>
                            <p className="text-gold-500/60">Select multiple pathfinders to verify a requirement at once.</p>
                        </div>
                    </div>
                </div>
                <div className="panel__body p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">1. Select Requirement</label>
                            <select 
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-gold-500/50 outline-none transition-all"
                                value={selectedRequirement?.id || ''}
                                onChange={(e) => setSelectedRequirement(curriculum.find(r => r.id === parseInt(e.target.value)))}
                            >
                                <option value="" className="bg-surface-900">Choose a requirement...</option>
                                {curriculum.map(req => (
                                    <option key={req.id} value={req.id} className="bg-surface-900">
                                        [{req.category}] {req.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-[2]">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">2. Selected Pathfinders ({selectedPathfinders.length})</label>
                            <div className="flex flex-wrap gap-2">
                                {selectedPathfinders.length === 0 ? (
                                    <div className="text-xs text-gray-500 italic py-3">Click on names in the roster below to select them.</div>
                                ) : (
                                    selectedPathfinders.map(id => {
                                        const p = roster.find(r => r.id === id);
                                        return (
                                            <div key={id} className="flex items-center gap-2 px-3 py-1.5 bg-gold-500/20 border border-gold-500/30 rounded-full text-[10px] font-black text-gold-500 uppercase">
                                                {p?.name}
                                                <button onClick={() => togglePathfinderSelection(id)} className="hover:text-white">×</button>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                        <div className="flex items-end">
                            <button 
                                disabled={!selectedRequirement || selectedPathfinders.length === 0}
                                onClick={handleBatchSignOff}
                                className={`
                                    btn w-full md:w-auto flex items-center justify-center gap-2 py-3 px-8
                                    ${!selectedRequirement || selectedPathfinders.length === 0 ? 'bg-gray-600 cursor-not-allowed' : 'btn--gold'}
                                `}
                            >
                                <CheckCircle2 size={18} />
                                Verify for Selected
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Class Roster & Progress Board */}
            <div className="panel">
                <div className="panel__header flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Users size={20} className="text-burgundy-400" />
                        <h3>Class Progress Board</h3>
                    </div>
                    <div className="relative w-full md:w-64">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input 
                            type="text"
                            placeholder="Search students..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-2.5 text-xs text-white focus:border-burgundy-500/50 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="panel__body p-0">
                    <div className="table-responsive">
                        <table className="h-table">
                            <thead>
                                <tr>
                                    <th className="w-12">
                                        <div className="flex items-center justify-center">
                                            <input 
                                                type="checkbox" 
                                                className="rounded border-white/10 bg-white/5 text-gold-500" 
                                                onChange={(e) => {
                                                    if (e.target.checked) setSelectedPathfinders(filteredRoster.map(p => p.id));
                                                    else setSelectedPathfinders([]);
                                                }}
                                                checked={selectedPathfinders.length === filteredRoster.length && filteredRoster.length > 0}
                                            />
                                        </div>
                                    </th>
                                    <th>Pathfinder Name</th>
                                    <th>Unit</th>
                                    <th>Progress</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRoster.map(p => {
                                    const progressCount = p.progress?.length || 0;
                                    const totalCount = curriculum.length || 1;
                                    const percentage = Math.round((progressCount / totalCount) * 100);
                                    
                                    return (
                                        <tr key={p.id} className={selectedPathfinders.includes(p.id) ? 'bg-gold-500/5' : ''}>
                                            <td>
                                                <div className="flex items-center justify-center">
                                                    <input 
                                                        type="checkbox" 
                                                        className="rounded border-white/10 bg-white/5 text-gold-500"
                                                        checked={selectedPathfinders.includes(p.id)}
                                                        onChange={() => togglePathfinderSelection(p.id)}
                                                    />
                                                </div>
                                            </td>
                                            <td className="cell-primary font-bold">{p.name}</td>
                                            <td className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                                                {p.unit_membership?.unit?.name || 'Unassigned'}
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-3 w-48">
                                                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                        <div 
                                                            className={`h-full transition-all duration-500 ${percentage > 80 ? 'bg-success' : percentage > 40 ? 'bg-gold-500' : 'bg-burgundy-500'}`}
                                                            style={{ width: `${percentage}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-[10px] font-black text-white w-8">{percentage}%</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge ${
                                                    p.classAssignment?.investiture_status === 'approved' ? 'badge--success' : 
                                                    p.classAssignment?.investiture_status === 'pending_review' ? 'badge--info' : 
                                                    'badge--warning'
                                                }`}>
                                                    {p.classAssignment?.investiture_status?.replace('_', ' ') || 'In Progress'}
                                                </span>
                                            </td>
                                            <td>
                                                <button className="p-2 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-all">
                                                    <ArrowRight size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {filteredRoster.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="py-12 text-center text-gray-500 italic">No pathfinders found in this class.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Resource Hub */}
            <div className="panel">
                <div className="panel__header">
                    <div className="flex items-center gap-3">
                        <Library size={20} className="text-info" />
                        <h3>Curriculum Resources</h3>
                    </div>
                </div>
                <div className="panel__body p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {resources.length > 0 ? (
                            resources.map(res => (
                                <a 
                                    key={res.id} 
                                    href={res.file_path ? `/storage/${res.file_path}` : '#'} 
                                    target="_blank"
                                    className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-info/30 hover:bg-info/5 transition-all group"
                                >
                                    <div className="p-3 bg-info/10 rounded-xl text-info group-hover:scale-110 transition-transform">
                                        <FileText size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-xs font-bold text-white uppercase truncate">{res.title}</div>
                                        <div className="text-[10px] text-gray-500 uppercase tracking-widest">{res.category || 'General Resource'}</div>
                                    </div>
                                    <ChevronRight size={16} className="text-gray-600" />
                                </a>
                            ))
                        ) : (
                            <div className="col-span-full py-8 text-center text-gray-500 italic text-sm">No curriculum resources uploaded for this district yet.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}


