import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { 
    ChevronLeft, Save, User, Camera, Shield, 
    Briefcase, GraduationCap, Award, MapPin 
} from 'lucide-react';
import ReligionCombobox from '../Dashboard/Partials/ReligionCombobox';

export default function Edit({ leader, picklists }) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        full_name: leader.full_name || '',
        role: leader.role || 'MG',
        assigned_class_id: leader.assigned_class_id || '',
        religion_id: leader.religion_id || '',
        other_religion: leader.other_religion || '',
        residence: leader.residence || '',
        occupation_status: leader.occupation_status || 'working',
        insured_yearly: leader.insured_yearly || false,
        actively_teaching: leader.actively_teaching || true,
        responsibility: leader.responsibility || '',
        other_church_responsibility: leader.other_church_responsibility || '',
        avatar: null,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('master_guides.update', leader.id), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout
            header={`Editing: ${leader.full_name}`}
            breadcrumb={
                <div className="flex items-center gap-2 text-xs">
                    <Link href={route('dashboard', 'leaders')} className="hover:text-gold-400">Leaders</Link>
                    <span className="opacity-30">/</span>
                    <Link href={route('master_guides.show', leader.id)} className="hover:text-gold-400">Bio</Link>
                    <span className="opacity-30">/</span>
                    <span>Edit Profile</span>
                </div>
            }
        >
            <Head title={`Edit ${leader.full_name}`} />

            <form onSubmit={submit} className="flex flex-col gap-6 max-w-6xl mx-auto pb-12">
                <div className="flex justify-between items-center">
                    <Link 
                        href={route('master_guides.show', leader.id)} 
                        className="btn btn--secondary btn--sm"
                    >
                        <ChevronLeft size={16} /> Cancel Edits
                    </Link>
                    <button 
                        type="submit" 
                        className="btn btn--primary"
                        disabled={processing}
                    >
                        <Save size={16} /> {processing ? 'Saving...' : 'Update Leader Record'}
                    </button>
                </div>

                <div className="form-grid-side-by-side">
                    {/* Left Column: Profile & Personal */}
                    <div className="flex flex-col gap-6">
                        <div className="panel p-6">
                            <h3 className="form-section-title">Official Leader Identity</h3>
                            
                            {/* Avatar Section */}
                            <div className="flex flex-col md:flex-row items-start gap-8 mb-8">
                                <div 
                                    className="shrink-0 rounded-full bg-surface-700 border-2 border-dashed border-burgundy-500/30 flex flex-col items-center justify-center text-muted overflow-hidden relative group transition-all hover:border-burgundy-400/60 shadow-2xl"
                                    style={{ width: '250px', height: '250px' }}
                                >
                                    {(data.avatar || leader.avatar_path) ? (
                                        <img 
                                            src={data.avatar ? URL.createObjectURL(data.avatar) : leader.avatar_url} 
                                            className="w-full h-full object-cover" 
                                            alt="Preview" 
                                        />
                                    ) : (
                                        <>
                                            <Camera size={40} className="text-burgundy-400/30" />
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
                                    <label className="block text-xs font-black uppercase mb-2 text-burgundy-400 tracking-[0.1em]">Professional Headshot</label>
                                    <p className="text-xs text-muted mb-4 leading-relaxed max-w-sm">Upload a high-resolution portrait. Images will be used in official reports, ID cards, and session roll-calls.</p>
                                    <div className="flex gap-2 items-center">
                                        <button 
                                            type="button" 
                                            className="btn btn--secondary btn--sm" 
                                            onClick={() => document.getElementById('leader-avatar-input').click()}
                                        >
                                            Select Image
                                        </button>
                                        {data.avatar && <span className="text-xs text-burgundy-400/70 font-bold truncate max-w-[150px]">{data.avatar.name}</span>}
                                    </div>
                                    <input 
                                        id="leader-avatar-input"
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
                                    className="h-input" 
                                    value={data.full_name} 
                                    onChange={e => setData('full_name', e.target.value)} 
                                    required 
                                />
                                {errors.full_name && <span className="text-xs text-danger">{errors.full_name}</span>}
                            </div>

                            <div className="form-grid-2">
                                <div className="form-group">
                                    <label>Leadership Level</label>
                                    <select className="h-input" value={data.role} onChange={e => setData('role', e.target.value)}>
                                        <option value="MG">Master Guide (MG)</option>
                                        <option value="MGT">Master Guide in Training (MGT)</option>
                                        <option value="PLA">PLA</option>
                                        <option value="APLA">APLA</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Employment Status</label>
                                    <select className="h-input" value={data.occupation_status} onChange={e => setData('occupation_status', e.target.value)}>
                                        <option value="working">Formally Working</option>
                                        <option value="schooling">Student/Researcher</option>
                                        <option value="unemployed">Self Employed / Other</option>
                                    </select>
                                </div>
                            </div>

                            <ReligionCombobox 
                                religions={picklists.religions}
                                value={data.religion_id}
                                onChange={val => setData('religion_id', val)}
                            />

                            <div className="form-group">
                                <label>Physical Residence</label>
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

                        <div className="panel p-6 border-l-4 border-gold-500">
                            <h3 className="form-section-title flex items-center gap-2">
                                <GraduationCap size={18} className="text-gold-400" /> 
                                Instructional Status
                            </h3>
                            <div className="h-checkbox-group bg-gold-400/5 p-4 rounded-xl border border-gold-400/10">
                                <input 
                                    id="leader-teaching" 
                                    type="checkbox" 
                                    className="h-checkbox h-checkbox--gold" 
                                    checked={data.actively_teaching} 
                                    onChange={e => setData('actively_teaching', e.target.checked)} 
                                />
                                <label className="checkbox-label" htmlFor="leader-teaching">
                                    Actively Teaching this Year
                                    <span className="text-[10px]">Leader is assigned to a class curriculum</span>
                                </label>
                            </div>
                            <div className="form-group mt-4">
                                <label>Assigned Pathfinder Class</label>
                                <select className="h-input" value={data.assigned_class_id} onChange={e => setData('assigned_class_id', e.target.value)}>
                                    <option value="">Administrative / Staff Only</option>
                                    {picklists.classes.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Responsibilities */}
                    <div className="flex flex-col gap-6">
                        <div className="panel p-6">
                            <h3 className="form-section-title flex items-center gap-2">
                                <Shield size={18} className="text-burgundy-400" />
                                Command & Responsibility
                            </h3>
                            <div className="form-group">
                                <label>Primary Pathfinder Responsibilities</label>
                                <textarea 
                                    className="h-input" 
                                    rows={4} 
                                    placeholder="e.g. Deputy Director for Juniors, Drill Sergeant Major..."
                                    value={data.responsibility}
                                    onChange={e => setData('responsibility', e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label>Other Church Commitments</label>
                                <textarea 
                                    className="h-input" 
                                    rows={3} 
                                    placeholder="e.g. Head Elder, Sabbath School Supt..."
                                    value={data.other_church_responsibility}
                                    onChange={e => setData('other_church_responsibility', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="panel p-6">
                            <h3 className="form-section-title flex items-center gap-2">
                                <Award size={18} className="text-gold-400" />
                                Administrative Status
                            </h3>
                            <div className="h-checkbox-group bg-white/[0.02] p-4 rounded-xl border border-white/5">
                                <input 
                                    id="leader-insured" 
                                    type="checkbox" 
                                    className="h-checkbox" 
                                    checked={data.insured_yearly} 
                                    onChange={e => setData('insured_yearly', e.target.checked)} 
                                />
                                <label className="checkbox-label" htmlFor="leader-insured">
                                    Insurance Paid for current session
                                    <span className="text-[10px]">Mandatory for all field activities</span>
                                </label>
                            </div>
                            
                            <div className="mt-8 p-4 bg-gold-400/5 rounded-xl border border-gold-400/10">
                                <div className="flex gap-3">
                                    <div className="p-2 h-10 w-10 bg-gold-400/20 rounded-lg flex items-center justify-center text-gold-400">
                                        <Briefcase size={20} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold opacity-80">Employment Validation</div>
                                        <p className="text-[10px] text-muted leading-tight mt-1">
                                            Role and occupation data helps conference level planning for specialized training sessions.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
