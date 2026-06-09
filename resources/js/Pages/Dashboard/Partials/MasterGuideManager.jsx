import { useState } from 'react';
import { useForm, router, Link } from '@inertiajs/react';
import { Plus, GraduationCap, Shield, UserPlus, Search, User, Edit2, Eye, LayoutGrid, Trash2, Users, AlertTriangle } from 'lucide-react';
import ReligionCombobox from './ReligionCombobox';
import LeadershipManager from './LeadershipManager';
import BulkMasterGuideForm from './BulkMasterGuideForm';
import InputError from '@/Components/InputError';

export default function MasterGuideManager({ master_guides, mg_training, picklists, readonly, committees, classes, derived_pathfinder_committee }) {
    const [view, setView] = useState('list'); // 'list', 'register', 'bulk_register'
    const [activeTab, setActiveTab] = useState('invested'); // 'invested' or 'training'
    const [searchQuery, setSearchQuery] = useState('');

    const defaultReligionId =
        picklists?.religions?.find((item) => item.name === 'SDA')?.id ??
        picklists?.religions?.[0]?.id ??
        '';

    const mgForm = useForm({
        full_name: '',
        role: 'MG',
        investiture_status: 'certified',
        master_guide_level: 'MG',
        training_started_at: '',
        training_completed_at: '',
        investiture_date: '',
        is_active_in_club: true,
        can_serve_as_staff: true,
        assigned_class_id: '',
        religion_id: defaultReligionId,
        other_religion: '',
        residence: '',
        occupation_status: 'working',
        insured_yearly: false,
        actively_teaching: true,
        responsibility: '',
        other_church_responsibility: '',
        avatar: null, // For file upload
    });

    function submitMasterGuide(e) {
        e.preventDefault();
        // Since we have a file upload, we MUST use a standard form submit or router.post with multipart
        router.post(route('master_guides.store'), {
            ...mgForm.data,
            _method: 'POST', // standard for store
        }, { 
            forceFormData: true,
            onSuccess: () => {
                mgForm.reset();
                setView('list');
            } 
        });
    }

    const filteredMGs = (master_guides ?? []).filter(mg => 
        mg.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const certifiedMGs = filteredMGs.filter(mg => mg.investiture_status === 'certified');
    const trainingMGs = filteredMGs.filter(mg => mg.investiture_status === 'in_training');
    const legacyMGs = filteredMGs.filter(mg => !mg.investiture_status || mg.investiture_status === 'unknown');
    const unassignedMGs = filteredMGs.filter(mg => mg.status === 'unassigned');

    return (
        <div className="flex flex-col gap-6">
            {view === 'list' ? (
                <div className="flex flex-col gap-6">
                    {/* Standalone Search & Action Control Center */}
                    <div className="panel p-6 lg:p-10" style={{ background: 'rgba(24, 24, 31, 1)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 lg:gap-8">
                            <div className="flex items-center gap-5">
                                <div className="h-12 w-12 lg:h-14 lg:w-14 rounded-full bg-burgundy-900 flex items-center justify-center text-burgundy-400 border border-burgundy-500/30 shrink-0">
                                    <Shield size={28} />
                                </div>
                                <div>
                                    <h3 className="m-0 text-xl lg:text-2xl font-bold text-white">Leader Command Center</h3>
                                    <p className="m-0 text-[10px] lg:text-xs text-muted font-semibold uppercase tracking-widest opacity-60">Master Guide & MGT Administration</p>
                                </div>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center w-full lg:w-[550px]">
                                <div className="relative flex-1">
                                    <div className="absolute right-4 inset-y-0 flex items-center pointer-events-none">
                                        <Search size={18} className="text-gold-400" style={{ opacity: 0.5 }} />
                                    </div>
                                    <input 
                                        className="h-input pr-12 w-full" 
                                        style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
                                        placeholder="Search by name..." 
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                {!readonly && (
                                    <div className="flex gap-2">
                                        <button className="btn btn--secondary whitespace-nowrap" onClick={() => setView('bulk_register')}>
                                            <Users size={16} className="mr-1" /> Bulk Add
                                        </button>
                                        <button className="btn btn--primary px-8 whitespace-nowrap" onClick={() => setView('register')}>
                                            <Plus size={20} className="mr-2" /> Register
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-1 border-b border-white/5 mb-6 overflow-x-auto">
                        <button 
                            className={`px-6 py-4 font-bold text-xs tracking-widest uppercase transition-all whitespace-nowrap ${activeTab === 'invested' ? 'text-success border-b-2 border-success bg-success/5' : 'text-muted hover:text-white hover:bg-white/5'}`}
                            onClick={() => setActiveTab('invested')}
                        >
                            🟢 Certified Master Guides
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'invested' ? 'bg-success/20 text-success-300' : 'bg-white/10'}`}>{certifiedMGs.length}</span>
                        </button>
                        <button 
                            className={`px-6 py-4 font-bold text-xs tracking-widest uppercase transition-all whitespace-nowrap ${activeTab === 'training' ? 'text-gold-400 border-b-2 border-gold-500 bg-gold-500/5' : 'text-muted hover:text-white hover:bg-white/5'}`}
                            onClick={() => setActiveTab('training')}
                        >
                            🟡 In Training (MGT)
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'training' ? 'bg-gold-500/20 text-gold-300' : 'bg-white/10'}`}>{trainingMGs.length}</span>
                        </button>
                        <button 
                            className={`px-6 py-4 font-bold text-xs tracking-widest uppercase transition-all whitespace-nowrap ${activeTab === 'legacy' ? 'text-muted border-b-2 border-white/20 bg-white/5' : 'text-muted hover:text-white hover:bg-white/5'}`}
                            onClick={() => setActiveTab('legacy')}
                        >
                            ⚪ Unclassified / Legacy
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'legacy' ? 'bg-white/20 text-white' : 'bg-white/10'}`}>{legacyMGs.length}</span>
                        </button>
                        <button 
                            className={`px-6 py-4 font-bold text-xs tracking-widest uppercase transition-all whitespace-nowrap ${activeTab === 'unassigned' ? 'text-blue-400 border-b-2 border-blue-500 bg-blue-500/5' : 'text-muted hover:text-white hover:bg-white/5'}`}
                            onClick={() => setActiveTab('unassigned')}
                        >
                            Available MG/MGT
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'unassigned' ? 'bg-blue-500/20 text-blue-300' : 'bg-white/10'}`}>{unassignedMGs.length}</span>
                        </button>
                        <button 
                            className={`px-6 py-4 font-bold text-xs tracking-widest uppercase transition-all whitespace-nowrap ${activeTab === 'leadership' ? 'text-blue-400 border-b-2 border-blue-500 bg-blue-500/5' : 'text-muted hover:text-white hover:bg-white/5'}`}
                            onClick={() => setActiveTab('leadership')}
                        >
                            Leadership Staff
                        </button>
                    </div>

                    <div>
                        {activeTab === 'invested' && (
                            <div className="panel p-0 bg-success-900/[0.01] border-success-500/5 hover:border-success-500/10 transition-colors">
                                <div className="table-responsive">
                                    <table className="h-table">
                                        <thead>
                                            <tr>
                                                <th style={{ paddingLeft: '1.5rem' }}>Leader Name</th>
                                                <th>Primary Responsibility</th>
                                                <th>Level</th>
                                                <th>Assigned Class</th>
                                                <th>Status</th>
                                                <th style={{ width: 100 }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {certifiedMGs.map(mg => (
                                                <tr key={mg.id}>
                                                    <td className="cell-primary" style={{ minWidth: 250, paddingLeft: '1.5rem' }}>
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-10 w-10 bg-surface-700 border border-success-500/30 text-success-400 flex items-center justify-center rounded-full shrink-0 font-bold overflow-hidden shadow-sm">
                                                                {mg.avatar_url ? (
                                                                    <img src={mg.avatar_url} alt="" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <span className="text-xs">{mg.full_name[0]}</span>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="font-extrabold text-sm text-gray-100 truncate">{mg.full_name}</div>
                                                                <div className="text-[9px] text-success-500/60 uppercase tracking-widest font-black mt-0.5">Certified Master Guide</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-success-500 shadow-[0_0_5px_rgba(var(--clr-success-500-rgb),0.5)]"></div>
                                                            <span className="text-[10px] font-black text-success-400 uppercase tracking-widest">{mg.responsibility || 'Club Leader'}</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className="text-[10px] font-bold text-muted uppercase tracking-widest">{mg.master_guide_level || mg.role}</span>
                                                    </td>
                                                    <td>
                                                        <span className="text-[10px] text-muted font-bold uppercase tracking-widest">{mg.assigned_class?.name ?? 'Admin Staff'}</span>
                                                    </td>
                                                    <td>
                                                        <div className={`badge ${mg.insured_yearly ? 'badge--success' : 'badge--danger'}`}>
                                                            {mg.insured_yearly ? 'Insured' : 'Not Insured'}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="flex gap-2">
                                                            <Link href={route('master_guides.show', mg.id)} className="action-btn" title="View Bio">
                                                                <Eye size={16} />
                                                            </Link>
                                                            {!readonly && (
                                                                <Link href={route('master_guides.edit', mg.id)} className="action-btn" title="Edit Record">
                                                                    <Edit2 size={16} />
                                                                </Link>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {certifiedMGs.length === 0 && (
                                                <tr>
                                                    <td colSpan={6} className="py-12 text-center text-[10px] text-muted/30 font-bold uppercase tracking-widest italic">
                                                        No Certified Master Guides recorded
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'training' && (
                            <div className="panel p-0 bg-gold-900/[0.01] border-gold-500/5 hover:border-gold-500/10 transition-colors">
                                <div className="table-responsive">
                                    <table className="h-table">
                                        <thead>
                                            <tr>
                                                <th style={{ paddingLeft: '1.5rem' }}>Candidate</th>
                                                <th>Training Role</th>
                                                <th>Status</th>
                                                <th style={{ width: 100 }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {trainingMGs.map(mg => (
                                                <tr key={mg.id}>
                                                    <td className="cell-primary" style={{ minWidth: 250, paddingLeft: '1.5rem' }}>
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-10 w-10 bg-gold-900/30 border border-gold-500/10 text-gold-400 flex items-center justify-center rounded-full shrink-0 font-bold overflow-hidden">
                                                                {mg.avatar_url ? (
                                                                    <img src={mg.avatar_url} alt="" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <span className="text-xs">{mg.full_name[0]}</span>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-sm text-gray-200">{mg.full_name}</div>
                                                                <div className="text-[9px] text-gold-500/60 uppercase tracking-[0.15em] font-black mt-0.5">MGT Candidate</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className="text-[10px] font-bold text-muted uppercase tracking-widest">{mg.master_guide_level || mg.role}</span>
                                                    </td>
                                                    <td>
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-7 w-7 rounded flex items-center justify-center text-gold-500/40 bg-white/[0.02]">
                                                                <GraduationCap size={14} />
                                                            </div>
                                                            <div className="text-[9px] font-black uppercase tracking-widest text-gold-400/50 italic leading-none">In Training</div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="flex gap-2">
                                                            <Link href={route('master_guides.show', mg.id)} className="action-btn action-btn--gold" title="View Bio">
                                                                <Eye size={16} />
                                                            </Link>
                                                            {!readonly && (
                                                                <Link href={route('master_guides.edit', mg.id)} className="action-btn action-btn--gold" title="Edit Record">
                                                                    <Edit2 size={16} />
                                                                </Link>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {trainingMGs.length === 0 && (
                                                <tr>
                                                    <td colSpan={4} className="py-16 text-center opacity-40">
                                                        <GraduationCap size={32} className="mb-3 text-gold-400 mx-auto" strokeWidth={1} />
                                                        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-gold-400">Queue Empty</div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'legacy' && (
                            <div className="panel p-0 bg-white/[0.01] border-white/5 hover:border-white/10 transition-colors">
                                <div className="table-responsive">
                                    <table className="h-table">
                                        <thead>
                                            <tr>
                                                <th style={{ paddingLeft: '1.5rem' }}>Leader Name</th>
                                                <th>Investiture</th>
                                                <th>Status</th>
                                                <th style={{ width: 100 }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {legacyMGs.map(mg => (
                                                <tr key={mg.id}>
                                                    <td className="cell-primary" style={{ minWidth: 250, paddingLeft: '1.5rem' }}>
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-10 w-10 bg-surface-700 border border-white/10 text-muted flex items-center justify-center rounded-full shrink-0 font-bold overflow-hidden">
                                                                {mg.avatar_url ? (
                                                                    <img src={mg.avatar_url} alt="" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <span className="text-xs">{mg.full_name[0]}</span>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-sm text-gray-200">{mg.full_name}</div>
                                                                <div className="text-[9px] text-muted uppercase tracking-[0.15em] font-black mt-0.5">Legacy Record</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className="text-[10px] font-bold text-muted uppercase tracking-widest">{mg.role}</span>
                                                    </td>
                                                    <td>
                                                        <div className="flex items-center gap-2">
                                                            <AlertTriangle size={14} className="text-warning" />
                                                            <span className="text-[9px] font-black uppercase tracking-widest text-warning italic leading-none">Requires Review</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="flex gap-2">
                                                            {!readonly && (
                                                                <Link href={route('master_guides.edit', mg.id)} className="action-btn" title="Review & Update">
                                                                    <Edit2 size={16} />
                                                                </Link>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {legacyMGs.length === 0 && (
                                                <tr>
                                                    <td colSpan={4} className="py-16 text-center opacity-40">
                                                        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-muted">All records classified</div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'unassigned' && (
                            <div className="panel p-0 bg-blue-900/[0.01] border-blue-500/5 hover:border-blue-500/10 transition-colors">
                                <div className="table-responsive">
                                    <table className="h-table">
                                        <thead>
                                            <tr>
                                                <th style={{ paddingLeft: '1.5rem' }}>Member Name</th>
                                                <th>Investiture</th>
                                                <th>Status</th>
                                                <th style={{ width: 100 }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {unassignedMGs.map(mg => (
                                                <tr key={mg.id}>
                                                    <td className="cell-primary" style={{ minWidth: 250, paddingLeft: '1.5rem' }}>
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-10 w-10 bg-blue-900/30 border border-blue-500/10 text-blue-400 flex items-center justify-center rounded-full shrink-0 font-bold overflow-hidden">
                                                                {mg.avatar_url ? (
                                                                    <img src={mg.avatar_url} alt="" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <span className="text-xs">{mg.full_name[0]}</span>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-sm text-gray-200">{mg.full_name}</div>
                                                                <div className="text-[9px] text-blue-500/60 uppercase tracking-[0.15em] font-black mt-0.5">Available for Assignment</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className="text-[10px] font-bold text-muted uppercase tracking-widest">{mg.role}</span>
                                                    </td>
                                                    <td>
                                                        <div className="badge badge--info">Unassigned</div>
                                                    </td>
                                                    <td>
                                                        <div className="flex gap-2">
                                                            {!readonly && (
                                                                <Link href={route('master_guides.edit', mg.id)} className="action-btn action-btn--info" title="Assign to Staff">
                                                                    <UserPlus size={16} />
                                                                </Link>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {unassignedMGs.length === 0 && (
                                                <tr>
                                                    <td colSpan={4} className="py-16 text-center opacity-40">
                                                        <Users size={32} className="mb-3 text-blue-400 mx-auto" strokeWidth={1} />
                                                        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400">No unassigned members</div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'leadership' && (
                            <LeadershipManager 
                                classes={classes} 
                                committees={committees} 
                                derived_pathfinder_committee={derived_pathfinder_committee} 
                                picklists={picklists} 
                                readonly={readonly} 
                            />
                        )}
                    </div>
                </div>
            ) : view === 'bulk_register' ? (
                <BulkMasterGuideForm 
                    picklists={picklists}
                    onCancel={() => setView('list')}
                    onSuccess={() => setView('list')}
                />
            ) : (
                <div className="panel">
                    <div className="panel__header border-b border-white/5">
                        <div>
                            <h3>Register New Leader</h3>
                            <p>Add a Master Guide or MGT candidate to your club</p>
                        </div>
                        <button className="btn btn--secondary btn--sm" onClick={() => setView('list')}>Cancel</button>
                    </div>
                    <div className="panel__body">
                        <form onSubmit={submitMasterGuide}>
                            <div className="form-grid-side-by-side">
                                <div className="flex flex-col gap-4">
                                    <div className="form-section-title">Leader Profile</div>
                                    
                                    <div className="flex flex-col items-center gap-6 mb-8 p-8 rounded-2xl bg-white/[0.03] border border-white/5">
                                        <div 
                                            className="rounded-full bg-surface-700 border-2 border-dashed border-burgundy-500/30 flex flex-col items-center justify-center text-muted overflow-hidden relative group cursor-pointer hover:border-burgundy-400/60 transition-all shadow-2xl"
                                            style={{ width: '250px', height: '250px' }}
                                            onClick={() => document.getElementById('leader-avatar').click()}
                                        >
                                            {mgForm.data.avatar ? (
                                                <img 
                                                    src={URL.createObjectURL(mgForm.data.avatar)} 
                                                    className="w-full h-full object-cover" 
                                                    alt="Preview" 
                                                />
                                            ) : (
                                                <div className="flex flex-col items-center gap-2">
                                                    <User size={48} className="opacity-30" />
                                                    <span className="text-[11px] uppercase font-black tracking-[0.2em] opacity-40">Leader Headshot</span>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                                <span className="text-xs font-bold text-white uppercase tracking-[0.2em]">Select Photo</span>
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-xs font-black uppercase tracking-[0.2em] text-burgundy-400 mb-2">Leader Image</div>
                                            <p className="text-xs text-muted mb-4 leading-relaxed max-w-[320px] mx-auto">Upload a professional headshot for the club directory and ID profiles.</p>
                                            <div className="flex gap-2 justify-center items-center">
                                                <button 
                                                    type="button" 
                                                    className="btn btn--secondary btn--sm px-6" 
                                                    onClick={() => document.getElementById('leader-avatar').click()}
                                                >
                                                    Select Portrait
                                                </button>
                                                {mgForm.data.avatar && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-burgundy-400 font-bold truncate max-w-[150px]">{mgForm.data.avatar.name}</span>
                                                        <button type="button" className="text-danger/60 hover:text-danger" onClick={() => mgForm.setData('avatar', null)}>
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            <input 
                                                id="leader-avatar"
                                                type="file" 
                                                className="hidden" 
                                                onChange={e => mgForm.setData('avatar', e.target.files[0])}
                                                accept="image/*"
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Full Name</label>
                                        <input className="h-input" value={mgForm.data.full_name} onChange={e => mgForm.setData('full_name', e.target.value)} required />
                                        <InputError message={mgForm.errors.full_name} />
                                    </div>
                                    
                                    <div className="form-grid-2">
                                        <div className="form-group">
                                            <label>Investiture Status</label>
                                            <select className="h-input" value={mgForm.data.investiture_status} onChange={e => mgForm.setData('investiture_status', e.target.value)}>
                                                <option value="certified">Certified / Invested</option>
                                                <option value="in_training">In Training (MGT)</option>
                                                <option value="not_applicable">Not Applicable</option>
                                                <option value="unknown">Unknown</option>
                                            </select>
                                            <InputError message={mgForm.errors.investiture_status} />
                                        </div>
                                        <div className="form-group">
                                            <label>Master Guide Level</label>
                                            <select className="h-input" value={mgForm.data.master_guide_level} onChange={e => mgForm.setData('master_guide_level', e.target.value)}>
                                                <option value="MGT">MGT (Candidate)</option>
                                                <option value="MG">Master Guide</option>
                                                <option value="MG+">Master Guide+</option>
                                                <option value="Instructor-Certified MG">Instructor-Certified MG</option>
                                            </select>
                                            <InputError message={mgForm.errors.master_guide_level} />
                                        </div>
                                    </div>

                                    <div className="form-grid-3">
                                        <div className="form-group">
                                            <label>Training Started</label>
                                            <input type="date" className="h-input" value={mgForm.data.training_started_at} onChange={e => mgForm.setData('training_started_at', e.target.value)} />
                                            <InputError message={mgForm.errors.training_started_at} />
                                        </div>
                                        <div className="form-group">
                                            <label>Training Finished</label>
                                            <input type="date" className="h-input" value={mgForm.data.training_completed_at} onChange={e => mgForm.setData('training_completed_at', e.target.value)} />
                                            <InputError message={mgForm.errors.training_completed_at} />
                                        </div>
                                        <div className="form-group">
                                            <label>Investiture Date</label>
                                            <input type="date" className="h-input" value={mgForm.data.investiture_date} onChange={e => mgForm.setData('investiture_date', e.target.value)} />
                                            <InputError message={mgForm.errors.investiture_date} />
                                        </div>
                                    </div>
                                    
                                    <div className="form-grid-2">
                                        <div className="form-group">
                                            <label>Legacy Role (Compatibility)</label>
                                            <select className="h-input" value={mgForm.data.role} onChange={e => mgForm.setData('role', e.target.value)}>
                                                <option value="MG">Master Guide (Invested)</option>
                                                <option value="MGT">Master Guide in Training (MGT)</option>
                                            </select>
                                            <InputError message={mgForm.errors.role} />
                                        </div>
                                        <div className="form-group">
                                            <label>Occupation</label>
                                            <select className="h-input" value={mgForm.data.occupation_status} onChange={e => mgForm.setData('occupation_status', e.target.value)}>
                                                <option value="working">Working</option>
                                                <option value="schooling">Schooling</option>
                                                <option value="unemployed">Unemployed</option>
                                            </select>
                                            <InputError message={mgForm.errors.occupation_status} />
                                        </div>
                                    </div>
                                    
                                    <ReligionCombobox 
                                        religions={picklists?.religions ?? []}
                                        value={mgForm.data.religion_id}
                                        onChange={val => mgForm.setData('religion_id', val)}
                                    />
                                    <InputError message={mgForm.errors.religion_id} />

                                    <div className="form-group">
                                        <label>Residence</label>
                                        <input className="h-input" value={mgForm.data.residence} onChange={e => mgForm.setData('residence', e.target.value)} />
                                        <InputError message={mgForm.errors.residence} />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <div className="form-section-title">Assignments & Responsibilities</div>
                                    <div className="form-group">
                                        <label>Primary Club Responsibility</label>
                                        <input className="h-input" placeholder="e.g. Deputy Director, Drill Instructor" value={mgForm.data.responsibility} onChange={e => mgForm.setData('responsibility', e.target.value)} />
                                        <InputError message={mgForm.errors.responsibility} />
                                    </div>
                                    <div className="form-group">
                                        <label>Other Church Responsibilities</label>
                                        <textarea className="h-input" rows={2} placeholder="e.g. Deacon, Youth Leader" value={mgForm.data.other_church_responsibility} onChange={e => mgForm.setData('other_church_responsibility', e.target.value)} />
                                        <InputError message={mgForm.errors.other_church_responsibility} />
                                    </div>
                                    <div className="form-group">
                                        <label>Assigned Class</label>
                                        <select className="h-input" value={mgForm.data.assigned_class_id} onChange={e => mgForm.setData('assigned_class_id', e.target.value)}>
                                            <option value="">No specific class assignment</option>
                                            {(picklists?.classes ?? []).map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                        <InputError message={mgForm.errors.assigned_class_id} />
                                    </div>
                                    <div className="h-checkbox-group bg-white/5 p-4 rounded-lg">
                                        <input id="mg-insured" type="checkbox" className="h-checkbox" checked={mgForm.data.insured_yearly} onChange={e => mgForm.setData('insured_yearly', e.target.checked)} />
                                        <label className="checkbox-label" htmlFor="mg-insured">
                                            Insured for current year?
                                            <span className="text-xs">Required for active leadership and outings.</span>
                                        </label>
                                    </div>

                                    <div className="form-grid-2 gap-4">
                                        <div className="h-checkbox-group bg-white/5 p-4 rounded-lg">
                                            <input id="mg-active-club" type="checkbox" className="h-checkbox" checked={mgForm.data.is_active_in_club} onChange={e => mgForm.setData('is_active_in_club', e.target.checked)} />
                                            <label className="checkbox-label" htmlFor="mg-active-club">
                                                Active in Club?
                                                <span className="text-xs">Currently serving this year.</span>
                                            </label>
                                        </div>
                                        <div className="h-checkbox-group bg-white/5 p-4 rounded-lg">
                                            <input id="mg-can-serve" type="checkbox" className="h-checkbox" checked={mgForm.data.can_serve_as_staff} onChange={e => mgForm.setData('can_serve_as_staff', e.target.checked)} />
                                            <label className="checkbox-label" htmlFor="mg-can-serve">
                                                Can Serve as Staff?
                                                <span className="text-xs">Eligible for appointment.</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-white/10">
                                <button type="button" className="btn btn--secondary" onClick={() => setView('list')}>Cancel</button>
                                <button type="submit" className="btn btn--primary" disabled={mgForm.processing}>
                                    <UserPlus size={16} />
                                    {mgForm.processing ? 'Saving...' : 'Register Leader'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
