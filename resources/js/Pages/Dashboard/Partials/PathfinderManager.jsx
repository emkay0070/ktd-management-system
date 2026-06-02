import { useState, useMemo } from 'react';
import { Plus, UserPlus, Search, Filter, Download, ExternalLink, Eye, Edit2, Trash2, Shield } from 'lucide-react';
import { useForm, router, Link } from '@inertiajs/react';
import ReligionCombobox from './ReligionCombobox';
import UnitManager from './UnitManager';

export default function PathfinderManager({ pathfinders, units, picklists, readonly }) {
    const [view, setView] = useState('list'); // 'list', 'register', or 'units'
    const [searchQuery, setSearchQuery] = useState('');
    const [genderFilter, setGenderFilter] = useState('');
    const [classFilter, setClassFilter] = useState('');

    const defaultReligionId =
        picklists?.religions?.find((item) => item.name === 'SDA')?.id ??
        picklists?.religions?.[0]?.id ??
        '';

    const { data, setData, post, processing, reset, errors } = useForm({
        name: '',
        father_name: '',
        mother_name: '',
        age: '',
        gender: 'Male',
        guardian_name: '',
        guardian_phone: '',
        religion_id: defaultReligionId,
        other_religion: '',
        residence: '',
        school_class: '',
        boarding_status: 'day',
        is_inducted: false,
        insured_yearly: false,
        medical_conditions: '',
        consent: false,
        class_id: picklists?.classes?.[0]?.id ?? '',
        unit_id: '',
        avatar: null,
    });

    const filteredPathfinders = useMemo(() => {
        return (pathfinders ?? []).filter((p) => {
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.guardian_name?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesGender = genderFilter === '' || p.gender === genderFilter;
            const matchesClass = classFilter === '' || String(p.assigned_class?.id) === String(classFilter);
            return matchesSearch && matchesGender && matchesClass;
        });
    }, [pathfinders, searchQuery, genderFilter, classFilter]);

    function handleSubmit(e) {
        e.preventDefault();
        post(route('pathfinders.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setView('list');
            },
        });
    }

    function exportToCSV() {
        const headers = ['Name', 'Gender', 'Age', 'Class', 'Unit', 'Guardian', 'Phone', 'Status'];
        const rows = filteredPathfinders.map(p => [
            p.name,
            p.gender,
            p.age,
            p.assigned_class?.name || 'Unassigned',
            p.unit?.name || 'Unassigned',
            p.guardian_name || '-',
            p.guardian_phone || '-',
            p.boarding_status
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `pathfinders_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <div className="panel">
            <div className="panel__header">
                <div>
                    <h3>Pathfinders Directory</h3>
                    <p>Membership records, units, and registration</p>
                </div>
                <div className="flex gap-2">
                    {view === 'list' && (
                        <>
                            <button className="btn btn--secondary btn--sm" onClick={() => setView('units')}>
                                <Shield size={14} /> Manage Units
                            </button>
                            <button className="btn btn--secondary btn--sm" onClick={exportToCSV}>
                                <Download size={14} /> Export CSV
                            </button>
                            {!readonly && (
                                <button className="btn btn--primary btn--sm" onClick={() => setView('register')}>
                                    <Plus size={14} /> Register New
                                </button>
                            )}
                        </>
                    )}
                    {(view === 'register' || view === 'units') && (
                        <button className="btn btn--secondary btn--sm" onClick={() => setView('list')}>
                            Back to List
                        </button>
                    )}
                </div>
            </div>

            {view === 'list' && (
                <div className="panel__body" style={{ padding: 0 }}>
                    <div className="p-4 border-b border-white/5 flex flex-wrap gap-4 items-center bg-white/[0.02]">
                        {/* Gold-accented wide search bar */}
                        <div className="relative" style={{ flex: '1 1 300px' }}>
                            <div className="absolute right-4 inset-y-0 flex items-center pointer-events-none">
                                <Search size={16} className="text-gold-400 opacity-60" />
                            </div>
                            <input
                                className="h-input pr-12 w-full"
                                placeholder="Search by name or guardian..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                        {/* Compact filters */}
                        <div className="flex gap-2 shrink-0">
                            <select className="h-input w-[140px]" value={genderFilter} onChange={e => setGenderFilter(e.target.value)}>
                                <option value="">All Genders</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                            <select className="h-input w-[160px]" value={classFilter} onChange={e => setClassFilter(e.target.value)}>
                                <option value="">All Classes</option>
                                {(picklists?.classes ?? []).map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="h-table">
                            <thead>
                                <tr>
                                    <th style={{ minWidth: 200 }}>Name</th>
                                    <th className="hidden md:table-cell">Gender</th>
                                    <th className="hidden md:table-cell">Age</th>
                                    <th className="hidden md:table-cell">Section</th>
                                    <th>Class</th>
                                    <th className="hidden sm:table-cell">Unit</th>
                                    <th className="hidden lg:table-cell">Inducted</th>
                                    <th className="hidden lg:table-cell">Insured</th>
                                    <th style={{ width: 90 }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPathfinders.map((p) => (
                                    <tr key={p.id}>
                                        <td className="cell-primary" style={{ minWidth: 200 }}>
                                            <div className="flex items-center gap-4" style={{ minWidth: 180 }}>
                                                <div className="h-10 w-10 rounded-full bg-surface-700 border border-gold-400/30 flex items-center justify-center text-[12px] font-bold overflow-hidden shrink-0 shadow-[0_0_10px_rgba(212,160,23,0.1)]">
                                                    {p.avatar_path ? (
                                                        <img src={p.avatar_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-gold-400 opacity-60">{p.name[0]}</span>
                                                    )}
                                                </div>
                                                <div style={{ minWidth: 0 }}>
                                                    <div className="font-bold text-sm truncate">{p.name}</div>
                                                    <div className="text-muted text-xs mt-0.5 truncate">
                                                        {p.guardian_name ? p.guardian_name : <span className="italic opacity-40">No guardian</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="hidden md:table-cell">{p.gender}</td>
                                        <td className="hidden md:table-cell">{p.age}</td>
                                        <td className="hidden md:table-cell">
                                            <span className={`badge ${p.boarding_status === 'boarding' ? 'badge--info' : 'badge--neutral'}`}>
                                                {p.boarding_status === 'boarding' ? 'Boarder' : 'Day'}
                                            </span>
                                        </td>
                                        <td>{p.assigned_class?.name ?? '-'}</td>
                                        <td className="hidden sm:table-cell">{p.unit?.name ?? '-'}</td>
                                        <td className="hidden lg:table-cell">{p.is_inducted ? <span className="badge badge--success text-[10px]">Yes</span> : <span className="badge badge--warning text-[10px]">No</span>}</td>
                                        <td className="hidden lg:table-cell">{p.insured_yearly ? <span className="badge badge--success text-[10px]">Yes</span> : <span className="badge badge--warning text-[10px]">No</span>}</td>
                                        <td style={{ width: 90 }}>
                                            <div className="flex gap-2">
                                                <Link
                                                    href={route('pathfinders.show', p.id)}
                                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye size={17} className="text-muted hover:text-white transition-colors" />
                                                </Link>
                                                {!readonly && (
                                                    <Link
                                                        href={route('pathfinders.edit', p.id)}
                                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                                        title="Edit Pathfinder"
                                                    >
                                                        <Edit2 size={17} className="text-muted hover:text-white transition-colors" />
                                                    </Link>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredPathfinders.length === 0 && (
                                    <tr>
                                        <td colSpan={10} className="text-muted text-center py-10">
                                            No pathfinders match your filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {view === 'units' && (
                <div className="panel__body p-0 border-t border-white/5">
                    <UnitManager units={units} picklists={picklists} readonly={readonly} embedded={true} />
                </div>
            )}

            {view === 'register' && !readonly && (
                <div className="panel__body">
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid-side-by-side">
                            {/* Left Column: Personal Information */}
                            <div className="flex flex-col gap-5">
                                <div className="form-section-title">Personal Information</div>

                                {/* PF Avatar Upload */}
                                <div className="flex flex-col items-center gap-6 p-8 rounded-2xl bg-white/[0.03] border border-white/5 mb-4">
                                    <div 
                                        className="rounded-full bg-surface-700 border-2 border-dashed border-gold-400/30 flex items-center justify-center relative overflow-hidden group shrink-0 shadow-2xl transition-all hover:border-gold-400/60"
                                        style={{ width: '250px', height: '250px' }}
                                        onClick={() => document.getElementById('pf-avatar-input').click()}
                                    >
                                        {data.avatar ? (
                                            <img src={URL.createObjectURL(data.avatar)} className="w-full h-full object-cover" alt="Preview" />
                                        ) : (
                                            <div className="text-center">
                                                <Plus size={48} className="text-gold-400 opacity-30 mx-auto mb-2" />
                                                <span className="text-xs text-muted font-black uppercase tracking-[0.2em] block">Add Pathfinder Image</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                            <span className="text-xs font-bold text-white uppercase tracking-widest">Select Photo</span>
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <h4 className="text-base font-black text-gold-400 uppercase tracking-widest mb-2">Member Portrait</h4>
                                        <p className="text-xs text-muted leading-relaxed max-w-xs mx-auto mb-4">Select a clear, professional headshot. This image will be used for the official club register and digital identification.</p>
                                        <div className="flex justify-center gap-3">
                                            <button 
                                                type="button" 
                                                className="btn btn--secondary btn--sm px-6" 
                                                onClick={() => document.getElementById('pf-avatar-input').click()}
                                            >
                                                Choose File
                                            </button>
                                            {data.avatar && (
                                                <div className="flex items-center gap-2 group">
                                                    <span className="text-xs text-gold-400 font-bold truncate max-w-[150px]">{data.avatar.name}</span>
                                                    <button type="button" className="text-danger/60 hover:text-danger" onClick={() => setData('avatar', null)}>
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <input id="pf-avatar-input" type="file" className="hidden" onChange={e => setData('avatar', e.target.files[0])} accept="image/*" />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input className="h-input" value={data.name} onChange={e => setData('name', e.target.value)} required />
                                    {errors.name && <div className="text-danger text-xs mt-1">{errors.name}</div>}
                                </div>
                                <div className="form-grid-2">
                                    <div className="form-group">
                                        <label>Age</label>
                                        <input type="number" className="h-input" value={data.age} onChange={e => setData('age', e.target.value)} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Gender</label>
                                        <select className="h-input" value={data.gender} onChange={e => setData('gender', e.target.value)}>
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                        </select>
                                    </div>
                                </div>

                                <ReligionCombobox
                                    religions={picklists?.religions ?? []}
                                    value={data.religion_id}
                                    onChange={val => setData('religion_id', val)}
                                />

                                <div className="form-group">
                                    <label>Residence</label>
                                    <input className="h-input" placeholder="District/Villia/Zone" value={data.residence} onChange={e => setData('residence', e.target.value)} required />
                                </div>

                                <div className="form-section-title mt-4">Parent / Guardian</div>
                                <div className="form-grid-2">
                                    <div className="form-group">
                                        <label>Father's Name <span className="text-muted font-normal">(Optional)</span></label>
                                        <input className="h-input" value={data.father_name} onChange={e => setData('father_name', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>Mother's Name <span className="text-muted font-normal">(Optional)</span></label>
                                        <input className="h-input" value={data.mother_name} onChange={e => setData('mother_name', e.target.value)} />
                                    </div>
                                </div>
                                <div className="form-grid-2">
                                    <div className="form-group">
                                        <label>Guardian Name <span className="text-muted font-normal">(if not parent)</span></label>
                                        <input className="h-input" value={data.guardian_name} onChange={e => setData('guardian_name', e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>Parent / Guardian Phone</label>
                                        <input className="h-input" value={data.guardian_phone} onChange={e => setData('guardian_phone', e.target.value)} />
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Club & School Details */}
                            <div className="flex flex-col gap-4">
                                <div className="form-section-title">Club & School Details</div>
                                <div className="form-grid-2">
                                    <div className="form-group">
                                        <label>Pathfinder Class</label>
                                        <select className="h-input" value={data.class_id} onChange={e => setData('class_id', e.target.value)} required>
                                            {(picklists?.classes ?? []).map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>School Class (e.g. P5, S2)</label>
                                        <input className="h-input" value={data.school_class} onChange={e => setData('school_class', e.target.value)} required />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Section (Day/Boarding)</label>
                                    <select className="h-input" value={data.boarding_status} onChange={e => setData('boarding_status', e.target.value)}>
                                        <option value="day">Day Scholar</option>
                                        <option value="boarding">Boarder / In-section</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Unit Assignment</label>
                                    <select className="h-input" value={data.unit_id} onChange={e => setData('unit_id', e.target.value)}>
                                        <option value="">Unassigned</option>
                                        {(picklists?.units ?? [])
                                            .filter(u => u.gender.toLowerCase().includes(data.gender === 'Male' ? 'boy' : 'girl'))
                                            .map(u => (
                                                <option key={u.id} value={u.id}>{u.name} ({u.gender})</option>
                                            ))}
                                    </select>
                                </div>

                                <div className="form-grid-2">
                                    <div className="form-group">
                                        <label>Inducted into class?</label>
                                        <select className="h-input" value={data.is_inducted ? '1' : '0'} onChange={e => setData('is_inducted', e.target.value === '1')}>
                                            <option value="1">Yes</option>
                                            <option value="0">No</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Insured (yearly)?</label>
                                        <select className="h-input" value={data.insured_yearly ? '1' : '0'} onChange={e => setData('insured_yearly', e.target.value === '1')}>
                                            <option value="1">Yes</option>
                                            <option value="0">No</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Medical conditions (optional)</label>
                                    <textarea className="h-input" rows={3} value={data.medical_conditions} onChange={e => setData('medical_conditions', e.target.value)} />
                                </div>

                                <div className="h-checkbox-group bg-white/5 p-4 rounded-lg">
                                    <input id="consent" type="checkbox" className="h-checkbox" checked={data.consent} onChange={e => setData('consent', e.target.checked)} required />
                                    <label className="checkbox-label" htmlFor="consent">
                                        Parental Consent
                                        <span className="text-xs">Guardian consent for participation and emergency medical care.</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-white/10">
                            <button type="button" className="btn btn--secondary" onClick={() => setView('list')}>Cancel</button>
                            <button type="submit" className="btn btn--primary" disabled={processing || !data.consent}>
                                <UserPlus size={16} />
                                {processing ? 'Registering...' : 'Register Pathfinder'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}


