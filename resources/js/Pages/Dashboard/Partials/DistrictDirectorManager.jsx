import { useState } from 'react';
import { useForm, router, Link } from '@inertiajs/react';
import { MapPin, Shield, Plus, X, Search, User, Trash2, Mail } from 'lucide-react';
import ToastNotification from '@/Components/ToastNotification';

export default function DistrictDirectorManager({ districts, eligible_users, conferences, unassigned_directors }) {
    const [view, setView] = useState('list'); // 'list', 'create_district'
    const [searchQuery, setSearchQuery] = useState('');
    const [assigningDistrict, setAssigningDistrict] = useState(null); // district ID if modal open

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        conference_id: conferences[0]?.id || '',
        zone_id: null,
    });

    const assignForm = useForm({
        user_id: '',
    });
    
    const unassignedForm = useForm({
        district_id: '',
    });

    const filteredDistricts = districts.filter(d => 
        d.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    function handleCreateDistrict(e) {
        e.preventDefault();
        post(route('admin.districts.store'), {
            onSuccess: () => {
                reset();
                setView('list');
            }
        });
    }

    function handleAssignDirector(e, districtId) {
        e.preventDefault();
        assignForm.post(route('admin.district-directors.assign', { district: districtId }), {
            onSuccess: () => {
                setAssigningDistrict(null);
                assignForm.reset();
            }
        });
    }

    function handleRemoveDirector(userId) {
        if (confirm("Are you sure you want to remove this user as District Director?")) {
            router.delete(route('admin.district-directors.remove', userId));
        }
    }
    
    function handleAssignUnassignedDirector(e, userId) {
        e.preventDefault();
        unassignedForm.post(route('admin.district-directors.assign-unassigned', userId), {
            onSuccess: () => {
                unassignedForm.reset();
            }
        });
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="panel p-6 lg:p-10" style={{ background: 'rgba(24, 24, 31, 1)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 lg:gap-8">
                    <div className="flex items-center gap-5">
                        <div className="h-12 w-12 lg:h-14 lg:w-14 rounded-full bg-surface-700 flex items-center justify-center text-white border border-white/10 shrink-0">
                            <MapPin size={28} />
                        </div>
                        <div>
                            <h3 className="m-0 text-xl lg:text-2xl font-bold text-white">District Directors</h3>
                            <p className="m-0 text-[10px] lg:text-xs text-muted font-semibold uppercase tracking-widest opacity-60">
                                Oversee and manage districts across all conferences
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center w-full lg:w-[450px]">
                        <div className="relative flex-1">
                            <div className="absolute right-4 inset-y-0 flex items-center pointer-events-none">
                                <Search size={18} className="text-muted opacity-50" />
                            </div>
                            <input 
                                className="h-input pr-12 w-full" 
                                style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
                                placeholder="Search districts..." 
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button className="btn btn--primary whitespace-nowrap" onClick={() => setView('create_district')}>
                            <Plus size={16} /> New District
                        </button>
                    </div>
                </div>
            </div>
            
            {unassigned_directors.length > 0 && (
                <div className="panel p-6 border-warning-500/30">
                    <div className="flex items-center gap-2 mb-4">
                        <Shield className="text-warning-500" size={20} />
                        <h4 className="text-white font-bold">Unassigned District Directors</h4>
                    </div>
                    <p className="text-sm text-gray-400 mb-4">The following users have the District Director role but are not assigned to a specific district. Assign them to a district below.</p>
                    
                    <div className="space-y-4">
                        {unassigned_directors.map(ud => (
                            <div key={ud.id} className="flex items-center justify-between p-4 bg-surface-900 border border-white/5 rounded-lg">
                                <div>
                                    <div className="font-bold text-white">{ud.name}</div>
                                    <div className="text-xs text-muted">{ud.email}</div>
                                </div>
                                <form onSubmit={(e) => handleAssignUnassignedDirector(e, ud.id)} className="flex items-center gap-2">
                                    <select 
                                        className="h-input w-64" 
                                        required 
                                        value={unassignedForm.district_id}
                                        onChange={e => unassignedForm.setData('district_id', e.target.value)}
                                    >
                                        <option value="">Select District to assign...</option>
                                        {districts.map(d => (
                                            <option key={d.id} value={d.id}>{d.name} ({d.conference})</option>
                                        ))}
                                    </select>
                                    <button 
                                        type="submit" 
                                        className="btn btn--sm btn--primary"
                                        disabled={!unassignedForm.district_id || unassignedForm.processing}
                                    >
                                        Assign
                                    </button>
                                </form>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {view === 'create_district' && (
                <div className="panel">
                    <div className="panel__header">
                        <div>
                            <h3>Create New District</h3>
                            <p>Add a new district to a conference.</p>
                        </div>
                        <button className="btn btn--secondary btn--sm" onClick={() => setView('list')}>Cancel</button>
                    </div>
                    <div className="panel__body max-w-2xl">
                        <form onSubmit={handleCreateDistrict}>
                            <div className="form-group">
                                <label>District Name</label>
                                <input 
                                    className="h-input" 
                                    value={data.name} 
                                    onChange={e => setData('name', e.target.value)} 
                                    required 
                                    placeholder="e.g. Central Kampala District"
                                />
                                {errors.name && <div className="text-danger text-xs mt-1">{errors.name}</div>}
                            </div>
                            
                            <div className="form-group">
                                <label>Conference</label>
                                <select 
                                    className="h-input" 
                                    value={data.conference_id} 
                                    onChange={e => setData('conference_id', e.target.value)} 
                                    required
                                >
                                    {conferences.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                {errors.conference_id && <div className="text-danger text-xs mt-1">{errors.conference_id}</div>}
                            </div>
                            
                            <div className="flex justify-end gap-3 mt-6">
                                <button type="submit" className="btn btn--primary" disabled={processing}>
                                    {processing ? 'Creating...' : 'Create District'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredDistricts.map(district => (
                    <div key={district.id} className="panel p-0 flex flex-col h-full border-t-[3px]" style={{ borderTopColor: district.director ? 'var(--clr-success)' : 'var(--clr-warning)' }}>
                        <div className="p-5 flex-1">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="font-bold text-lg text-white mb-1">{district.name}</h4>
                                    <div className="text-[10px] text-muted font-bold uppercase tracking-widest">{district.conference}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-medium text-gray-300"><span className="text-white font-bold">{district.churches_count}</span> Churches</div>
                                    <div className="text-xs font-medium text-gray-300"><span className="text-white font-bold">{district.total_pathfinders}</span> Pathfinders</div>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-white/5">
                                <h5 className="text-[10px] text-muted font-bold uppercase tracking-widest mb-3">District Director</h5>
                                
                                {district.director ? (
                                    <div className="flex items-center justify-between bg-surface-900 border border-white/5 p-3 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-surface-700 rounded-full flex items-center justify-center text-white border border-white/10 shrink-0 overflow-hidden">
                                                {district.director.avatar_url ? (
                                                    <img src={district.director.avatar_url} className="w-full h-full object-cover" />
                                                ) : (
                                                    <User size={20} className="opacity-50" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm text-white">{district.director.name}</div>
                                                <div className="text-xs text-muted truncate max-w-[150px]">{district.director.email}</div>
                                            </div>
                                        </div>
                                        <button 
                                            className="p-2 text-danger/60 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                                            onClick={() => handleRemoveDirector(district.director.id)}
                                            title="Remove Director"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    assigningDistrict === district.id ? (
                                        <form onSubmit={(e) => handleAssignDirector(e, district.id)} className="bg-surface-900 border border-white/5 p-3 rounded-xl">
                                            <label className="text-xs text-muted mb-2 block">Select existing user:</label>
                                            <div className="flex gap-2">
                                                <select 
                                                    className="h-input flex-1 text-sm" 
                                                    value={assignForm.data.user_id} 
                                                    onChange={e => assignForm.setData('user_id', e.target.value)}
                                                    required
                                                >
                                                    <option value="">Select User...</option>
                                                    {eligible_users.map(u => (
                                                        <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                                                    ))}
                                                </select>
                                                <button type="submit" className="btn btn--sm btn--primary" disabled={assignForm.processing}>
                                                    Assign
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                                                <div className="text-xs text-muted">Or invite a new user?</div>
                                                <Link 
                                                    href={route('invites.show', { role: 'district_director', scope_type: 'App\\Models\\District', scope_id: district.id })} 
                                                    className="btn btn--sm btn--secondary"
                                                >
                                                    <Mail size={14} className="mr-1" /> Get Invite Link
                                                </Link>
                                            </div>
                                            <button 
                                                type="button" 
                                                className="text-xs text-muted hover:text-white mt-3 block w-full text-center"
                                                onClick={() => setAssigningDistrict(null)}
                                            >
                                                Cancel
                                            </button>
                                        </form>
                                    ) : (
                                        <div className="flex items-center justify-between bg-warning-500/10 border border-warning-500/20 p-3 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 bg-warning-500/20 rounded-full flex items-center justify-center text-warning-500 border border-warning-500/20 shrink-0">
                                                    <Shield size={20} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-sm text-warning-400">Vacant</div>
                                                    <div className="text-xs text-warning-500/70">No director assigned</div>
                                                </div>
                                            </div>
                                            <button 
                                                className="btn btn--sm bg-warning-500 hover:bg-warning-400 text-black font-bold"
                                                onClick={() => setAssigningDistrict(district.id)}
                                            >
                                                Assign
                                            </button>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                
                {filteredDistricts.length === 0 && (
                    <div className="col-span-full py-12 text-center text-muted">
                        No districts found.
                    </div>
                )}
            </div>
        </div>
    );
}
