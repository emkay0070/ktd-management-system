import { useState } from 'react';
import { useForm, router, Link } from '@inertiajs/react';
import { Plus, GraduationCap, Shield, UserPlus, Search, User, Edit2, Eye, LayoutGrid, Trash2 } from 'lucide-react';
import ReligionCombobox from './ReligionCombobox';

export default function MasterGuideManager({ master_guides, mg_training, picklists, readonly }) {
    const [view, setView] = useState('list'); // 'list' or 'register'
    const [activeTab, setActiveTab] = useState('invested'); // 'invested' or 'training'
    const [searchQuery, setSearchQuery] = useState('');

    const defaultReligionId =
        picklists?.religions?.find((item) => item.name === 'SDA')?.id ??
        picklists?.religions?.[0]?.id ??
        '';

    const mgForm = useForm({
        full_name: '',
        role: 'MG',
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

    // MGTs are leaders with role MGT (renamed from MGiT)
    const mgtCandidates = filteredMGs.filter(mg => mg.role === 'MGT' || mg.role === 'MGiT');
    const fullMGs = filteredMGs.filter(mg => mg.role === 'MG');

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
                                    <button className="btn btn--primary px-8 whitespace-nowrap" onClick={() => setView('register')}>
                                        <Plus size={20} className="mr-2" /> Register
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-1 border-b border-white/5 mb-6">
                        <button 
                            className={`px-6 py-4 font-bold text-xs tracking-widest uppercase transition-all ${activeTab === 'invested' ? 'text-burgundy-400 border-b-2 border-burgundy-500 bg-burgundy-500/5' : 'text-muted hover:text-white hover:bg-white/5'}`}
                            onClick={() => setActiveTab('invested')}
                        >
                            Invested Master Guides
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'invested' ? 'bg-burgundy-500/20 text-burgundy-300' : 'bg-white/10'}`}>{fullMGs.length}</span>
                        </button>
                        <button 
                            className={`px-6 py-4 font-bold text-xs tracking-widest uppercase transition-all ${activeTab === 'training' ? 'text-gold-400 border-b-2 border-gold-500 bg-gold-500/5' : 'text-muted hover:text-white hover:bg-white/5'}`}
                            onClick={() => setActiveTab('training')}
                        >
                            MGT Training Tracker
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'training' ? 'bg-gold-500/20 text-gold-300' : 'bg-white/10'}`}>{mgtCandidates.length}</span>
                        </button>
                    </div>

                    <div>
                        {activeTab === 'invested' && (
                            <div className="panel p-0 bg-burgundy-900/[0.01] border-burgundy-500/5 hover:border-burgundy-500/10 transition-colors">
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
                                            {fullMGs.map(mg => (
                                                <tr key={mg.id}>
                                                    <td className="cell-primary" style={{ minWidth: 250, paddingLeft: '1.5rem' }}>
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-10 w-10 bg-surface-700 border border-burgundy-500/30 text-burgundy-400 flex items-center justify-center rounded-full shrink-0 font-bold overflow-hidden shadow-sm">
                                                                {mg.avatar_url ? (
                                                                    <img src={mg.avatar_url} alt="" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <span className="text-xs">{mg.full_name[0]}</span>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="font-extrabold text-sm text-gray-100 truncate">{mg.full_name}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-burgundy-500 shadow-[0_0_5px_rgba(var(--clr-burgundy-500-rgb),0.5)]"></div>
                                                            <span className="text-[10px] font-black text-burgundy-400 uppercase tracking-widest">{mg.responsibility || 'Club Leader'}</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className="text-[10px] font-bold text-muted uppercase tracking-widest">{mg.role}</span>
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
                                            {fullMGs.length === 0 && (
                                                <tr>
                                                    <td colSpan={6} className="py-12 text-center text-[10px] text-muted/30 font-bold uppercase tracking-widest italic">
                                                        No Invested Master Guides recorded
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
                                            {mgtCandidates.map(mg => (
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
                                                        <span className="text-[10px] font-bold text-muted uppercase tracking-widest">{mg.role}</span>
                                                    </td>
                                                    <td>
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-7 w-7 rounded flex items-center justify-center text-gold-500/40 bg-white/[0.02]">
                                                                <GraduationCap size={14} />
                                                            </div>
                                                            <div className="text-[9px] font-black uppercase tracking-widest text-gold-400/50 italic leading-none">Not Initialized</div>
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
                                            {mgtCandidates.length === 0 && (
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
                    </div>
                </div>
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
                                    </div>
                                    
                                    <div className="form-grid-2">
                                        <div className="form-group">
                                            <label>Leadership Role</label>
                                            <select className="h-input" value={mgForm.data.role} onChange={e => mgForm.setData('role', e.target.value)}>
                                                <option value="MG">Master Guide (MG)</option>
                                                <option value="MGT">Master Guide in Training (MGT)</option>
                                                <option value="PLA">PLA</option>
                                                <option value="APLA">APLA</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Occupation</label>
                                            <select className="h-input" value={mgForm.data.occupation_status} onChange={e => mgForm.setData('occupation_status', e.target.value)}>
                                                <option value="working">Working</option>
                                                <option value="schooling">Schooling</option>
                                                <option value="unemployed">Unemployed</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <ReligionCombobox 
                                        religions={picklists?.religions ?? []}
                                        value={mgForm.data.religion_id}
                                        onChange={val => mgForm.setData('religion_id', val)}
                                    />

                                    <div className="form-group">
                                        <label>Residence</label>
                                        <input className="h-input" value={mgForm.data.residence} onChange={e => mgForm.setData('residence', e.target.value)} />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <div className="form-section-title">Assignments & Responsibilities</div>
                                    <div className="form-group">
                                        <label>Primary Club Responsibility</label>
                                        <input className="h-input" placeholder="e.g. Deputy Director, Drill Instructor" value={mgForm.data.responsibility} onChange={e => mgForm.setData('responsibility', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>Other Church Responsibilities</label>
                                        <textarea className="h-input" rows={2} placeholder="e.g. Deacon, Youth Leader" value={mgForm.data.other_church_responsibility} onChange={e => mgForm.setData('other_church_responsibility', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>Assigned Class</label>
                                        <select className="h-input" value={mgForm.data.assigned_class_id} onChange={e => mgForm.setData('assigned_class_id', e.target.value)}>
                                            <option value="">No specific class assignment</option>
                                            {(picklists?.classes ?? []).map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="h-checkbox-group bg-white/5 p-4 rounded-lg">
                                        <input id="mg-insured" type="checkbox" className="h-checkbox" checked={mgForm.data.insured_yearly} onChange={e => mgForm.setData('insured_yearly', e.target.checked)} />
                                        <label className="checkbox-label" htmlFor="mg-insured">
                                            Insured for current year?
                                            <span className="text-xs">Required for active leadership and outings.</span>
                                        </label>
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
