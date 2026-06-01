import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { 
    ChevronLeft, Save, User, Camera, Shield, 
    Calendar, Heart, MapPin, School 
} from 'lucide-react';
import ReligionCombobox from '../Dashboard/Partials/ReligionCombobox';

export default function Edit({ pathfinder, picklists }) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT', // standard Laravel method spoofing for file uploads with PUT
        name: pathfinder.name || '',
        father_name: pathfinder.father_name || '',
        mother_name: pathfinder.mother_name || '',
        age: pathfinder.age || '',
        gender: pathfinder.gender || 'Male',
        guardian_name: pathfinder.guardian_name || '',
        guardian_phone: pathfinder.guardian_phone || '',
        religion_id: pathfinder.religion_id || '',
        other_religion: pathfinder.other_religion || '',
        residence: pathfinder.residence || '',
        school_class: pathfinder.school_class || '',
        boarding_status: pathfinder.boarding_status || 'day',
        is_inducted: pathfinder.is_inducted || false,
        insured_yearly: pathfinder.insured_yearly || false,
        medical_conditions: pathfinder.medical_conditions || '',
        consent: pathfinder.consent || true,
        class_id: pathfinder.class_assignment?.class_id || picklists.classes?.[0]?.id || '',
        unit_id: pathfinder.unit_membership?.unit_id || '',
        avatar: null,
    });

    const submit = (e) => {
        e.preventDefault();
        // Since we have a file upload, we use POST with _method: PUT
        post(route('pathfinders.update', pathfinder.id), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={`Editing: ${pathfinder.name}`}
            breadcrumb={
                <div className="flex items-center gap-2 text-xs">
                    <Link href={route('dashboard', 'pathfinders')} className="hover:text-gold-400">Pathfinders</Link>
                    <span className="opacity-30">/</span>
                    <Link href={route('pathfinders.show', pathfinder.id)} className="hover:text-gold-400">Bio</Link>
                    <span className="opacity-30">/</span>
                    <span>Edit Profile</span>
                </div>
            }
        >
            <Head title={`Edit ${pathfinder.name}`} />

            <form onSubmit={submit} className="flex flex-col gap-6 max-w-6xl mx-auto pb-12">
                <div className="flex justify-between items-center">
                    <Link 
                        href={route('pathfinders.show', pathfinder.id)} 
                        className="btn btn--secondary btn--sm"
                    >
                        <ChevronLeft size={16} /> Cancel Edits
                    </Link>
                    <button 
                        type="submit" 
                        className="btn btn--primary"
                        disabled={processing}
                    >
                        <Save size={16} /> {processing ? 'Saving...' : 'Update Records'}
                    </button>
                </div>

                <div className="form-grid-side-by-side">
                    {/* Left Column: Personal info & Avatar */}
                    <div className="flex flex-col gap-6">
                        <div className="panel p-6">
                            <h3 className="form-section-title">Core Identity</h3>
                            
                            {/* Avatar Upload Section */}
                            <div className="flex flex-col md:flex-row items-start gap-8 mb-8">
                                <div 
                                    className="shrink-0 rounded-full bg-surface-700 border-2 border-dashed border-gold-400/30 flex flex-col items-center justify-center text-muted overflow-hidden relative group transition-all hover:border-gold-400/60 shadow-2xl"
                                    style={{ width: '250px', height: '250px' }}
                                >
                                    {(data.avatar || pathfinder.avatar_path) ? (
                                        <img 
                                            src={data.avatar ? URL.createObjectURL(data.avatar) : pathfinder.avatar_url} 
                                            className="w-full h-full object-cover" 
                                            alt="Preview" 
                                        />
                                    ) : (
                                        <>
                                            <Camera size={40} className="opacity-30" />
                                            <span className="text-[10px] mt-3 font-bold uppercase tracking-[0.2em] opacity-40">Add Photo</span>
                                        </>
                                    )}
                                    <input 
                                        type="file" 
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                                        onChange={e => setData('avatar', e.target.files[0])}
                                        accept="image/*"
                                    />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                        <span className="text-xs font-bold text-white uppercase tracking-widest">Change</span>
                                    </div>
                                </div>
                                <div className="flex-1 self-center">
                                    <label className="block text-xs font-black uppercase mb-2 text-gold-400 tracking-[0.1em]">Pathfinder Portrait</label>
                                    <p className="text-xs text-muted mb-4 leading-relaxed max-w-sm">Update the official club records. Please use a clear, front-facing headshot.</p>
                                    <div className="flex gap-2 items-center">
                                        <button 
                                            type="button" 
                                            className="btn btn--secondary btn--sm" 
                                            onClick={() => document.getElementById('pathfinder-avatar-input').click()}
                                        >
                                            Select New Image
                                        </button>
                                        {data.avatar && <span className="text-xs text-gold-400/70 font-bold truncate max-w-[150px]">{data.avatar.name}</span>}
                                    </div>
                                    <input 
                                        id="pathfinder-avatar-input"
                                        type="file" 
                                        className="hidden" 
                                        onChange={e => setData('avatar', e.target.files[0])}
                                        accept="image/*"
                                    />
                                    {errors.avatar && <div className="text-danger text-[10px] mt-1 font-bold">{errors.avatar}</div>}
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Full Legal Name</label>
                                <input 
                                    className={`h-input ${errors.name ? 'border-danger' : ''}`} 
                                    value={data.name} 
                                    onChange={e => setData('name', e.target.value)} 
                                    required 
                                />
                                {errors.name && <span className="text-xs text-danger">{errors.name}</span>}
                            </div>

                            <div className="form-grid-2">
                                <div className="form-group">
                                    <label>Current Age</label>
                                    <input 
                                        type="number" 
                                        className="h-input" 
                                        value={data.age} 
                                        onChange={e => setData('age', e.target.value)} 
                                    />
                                    {errors.age && <span className="text-xs text-danger">{errors.age}</span>}
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
                                religions={picklists.religions}
                                value={data.religion_id}
                                onChange={val => setData('religion_id', val)}
                            />

                            <div className="form-group">
                                <label>Physical Residence (Church/District)</label>
                                <div className="relative">
                                    <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                                    <input 
                                        className="h-input pl-10" 
                                        value={data.residence} 
                                        onChange={e => setData('residence', e.target.value)} 
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="panel p-6 border-l-4 border-burgundy-500">
                            <h3 className="form-section-title flex items-center gap-2">
                                <Heart size={18} className="text-burgundy-400" /> 
                                Medical & Safety
                            </h3>
                            <div className="form-group">
                                <label>Health/Medical Conditions</label>
                                <textarea 
                                    className="h-input" 
                                    rows={4} 
                                    placeholder="List any allergies, medication, or chronic conditions..."
                                    value={data.medical_conditions}
                                    onChange={e => setData('medical_conditions', e.target.value)}
                                />
                                <p className="text-[10px] text-muted mt-2 italic">This information is only visible to directors and health officers during camps.</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Family, School & Club Status */}
                    <div className="flex flex-col gap-6">
                        <div className="panel p-6">
                            <h3 className="form-section-title">Family & Emergency</h3>
                            <div className="form-grid-2">
                                <div className="form-group">
                                    <label>Father's Name</label>
                                    <input className="h-input" value={data.father_name} onChange={e => setData('father_name', e.target.value)} />
                                </div>
                                <div className="form-group">
                                    <label>Mother's Name</label>
                                    <input className="h-input" value={data.mother_name} onChange={e => setData('mother_name', e.target.value)} />
                                </div>
                            </div>
                            <div className="form-grid-2">
                                <div className="form-group">
                                    <label>Primary Guardian</label>
                                    <input className="h-input" value={data.guardian_name} onChange={e => setData('guardian_name', e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label>Emergency Contact No.</label>
                                    <input className="h-input" value={data.guardian_phone} onChange={e => setData('guardian_phone', e.target.value)} required />
                                </div>
                            </div>
                        </div>

                        <div className="panel p-6">
                            <h3 className="form-section-title flex items-center gap-2">
                                <Shield size={18} className="text-gold-400" />
                                Club & Education
                            </h3>
                            
                            <div className="form-grid-2">
                                <div className="form-group">
                                    <label>Assigned Class</label>
                                    <select className="h-input" value={data.class_id} onChange={e => setData('class_id', e.target.value)}>
                                        {picklists.classes.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Assigned Unit</label>
                                    <select className="h-input" value={data.unit_id} onChange={e => setData('unit_id', e.target.value)}>
                                        <option value="">No Active Unit</option>
                                        {picklists.units.map(u => (
                                            <option key={u.id} value={u.id}>{u.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-grid-2">
                                <div className="form-group">
                                    <label>School Grade/Class</label>
                                    <div className="relative">
                                        <School size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                                        <input 
                                            className="h-input pl-10" 
                                            placeholder="e.g. Primary 6, Form 2"
                                            value={data.school_class} 
                                            onChange={e => setData('school_class', e.target.value)} 
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Boarding Status</label>
                                    <select className="h-input" value={data.boarding_status} onChange={e => setData('boarding_status', e.target.value)}>
                                        <option value="day">Day Scholar</option>
                                        <option value="boarding">Boarder</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 mt-4 bg-white/[0.02] p-4 rounded-xl border border-white/5">
                                <div className="h-checkbox-group">
                                    <input 
                                        id="edit-inducted" 
                                        type="checkbox" 
                                        className="h-checkbox" 
                                        checked={data.is_inducted} 
                                        onChange={e => setData('is_inducted', e.target.checked)} 
                                    />
                                    <label className="checkbox-label" htmlFor="edit-inducted">
                                        Officially Inducted
                                        <span className="text-[10px]">Has participated in a formal induction ceremony</span>
                                    </label>
                                </div>
                                <div className="h-checkbox-group">
                                    <input 
                                        id="edit-insured" 
                                        type="checkbox" 
                                        className="h-checkbox" 
                                        checked={data.insured_yearly} 
                                        onChange={e => setData('insured_yearly', e.target.checked)} 
                                    />
                                    <label className="checkbox-label" htmlFor="edit-insured">
                                        Yearly Insurance Paid
                                        <span className="text-[10px]">Required for conference camp attendance</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
