import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Plus, Trash2, Users, Save, X, Camera } from 'lucide-react';
import ReligionCombobox from './ReligionCombobox';

export default function BulkPathfinderForm({ picklists, onCancel, onSuccess }) {
    const defaultReligionId = picklists?.religions?.find(r => r.name === 'SDA')?.id || '';
    const defaultClassId = picklists?.classes?.[0]?.id || '';

    const createEmptyRow = () => ({
        id: crypto.randomUUID(),
        name: '',
        age: '',
        gender: 'Male',
        class_id: defaultClassId,
        residence: '',
        religion_id: defaultReligionId,
        boarding_status: 'day',
    });

    const { data, setData, post, processing, errors } = useForm({
        pathfinders: [createEmptyRow(), createEmptyRow(), createEmptyRow()],
    });

    const addRow = () => {
        if (data.pathfinders.length >= 20) {
            alert('Maximum 20 pathfinders can be added at once.');
            return;
        }
        setData('pathfinders', [...data.pathfinders, createEmptyRow()]);
    };

    const removeRow = (id) => {
        if (data.pathfinders.length <= 1) return;
        setData('pathfinders', data.pathfinders.filter(p => p.id !== id));
    };

    const updateRow = (id, field, value) => {
        setData('pathfinders', data.pathfinders.map(p => 
            p.id === id ? { ...p, [field]: value } : p
        ));
    };

    const handleImageUpload = (id, e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const previewUrl = URL.createObjectURL(file);
        setData('pathfinders', data.pathfinders.map(p => 
            p.id === id ? { ...p, avatar: file, avatarPreview: previewUrl } : p
        ));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Filter out completely empty rows before submitting
        const validPathfinders = data.pathfinders.filter(p => p.name.trim() !== '');
        
        if (validPathfinders.length === 0) {
            alert('Please fill out at least one pathfinder.');
            return;
        }

        // Use Inertia router or just the form helper, but update the data just before posting
        // To be safe, we post with the filtered list
        post(route('pathfinders.bulk_store'), {
            data: { pathfinders: validPathfinders },
            onSuccess: () => {
                if (onSuccess) onSuccess();
            }
        });
    };

    // Calculate errors safely since Inertia error bags for arrays are dot-notated (e.g., pathfinders.0.name)
    const getError = (index, field) => errors[`pathfinders.${index}.${field}`];

    return (
        <div className="panel__body p-0">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-surface-800">
                <div>
                    <h3 className="flex items-center gap-2 text-lg text-white m-0">
                        <Users size={18} className="text-gold-400" /> Bulk Register Pathfinders
                    </h3>
                    <p className="text-xs text-muted m-0 mt-1">Add up to 20 pathfinders at once. Empty rows will be ignored.</p>
                </div>
                <div className="flex gap-2">
                    <button type="button" className="btn btn--secondary" onClick={onCancel} disabled={processing}>
                        <X size={14} /> Cancel
                    </button>
                    <button type="button" className="btn btn--primary" onClick={handleSubmit} disabled={processing}>
                        <Save size={14} /> {processing ? 'Saving...' : 'Save All'}
                    </button>
                </div>
            </div>

            <div className="p-6 bg-surface-900/50">
                <div className="flex flex-col gap-6">
                    {data.pathfinders.map((row, index) => (
                        <div key={row.id} className="relative bg-surface-800 rounded-3xl border border-white/5 p-6 flex flex-col md:flex-row gap-6 hover:border-gold-500/20 transition-colors">
                            <button 
                                type="button"
                                className="absolute top-4 right-4 p-2 text-muted hover:text-danger hover:bg-danger/10 rounded-full transition-colors"
                                onClick={() => removeRow(row.id)}
                                disabled={data.pathfinders.length <= 1}
                            >
                                <Trash2 size={16} />
                            </button>

                            <div style={{ width: '180px', flexShrink: 0 }} className="flex flex-col gap-4">
                                <label className="aspect-square bg-surface-900 border-2 border-dashed border-white/10 rounded-2xl flex items-center justify-center relative overflow-hidden group cursor-pointer hover:border-gold-500/50 transition-colors">
                                    {row.avatarPreview ? (
                                        <img src={row.avatarPreview} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-center text-muted group-hover:text-gold-400 transition-colors flex flex-col items-center justify-center p-4">
                                            <Camera size={28} className="mb-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                                            <span className="text-[10px] uppercase font-black tracking-widest leading-tight">Upload<br/>Photo</span>
                                        </div>
                                    )}
                                    <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(row.id, e)} />
                                </label>
                                
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Full Name *</label>
                                    <input 
                                        className={`h-input w-full ${getError(index, 'name') ? 'border-danger' : ''}`}
                                        value={row.name}
                                        onChange={(e) => updateRow(row.id, 'name', e.target.value)}
                                        placeholder="E.g. Jane Doe"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 content-start pt-1">
                                <div className="sm:col-span-2 md:col-span-3 flex items-center justify-between border-b border-white/5 pb-2 mb-2">
                                    <span className="text-xs font-black uppercase tracking-widest text-gold-500">Pathfinder #{index + 1}</span>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Age *</label>
                                    <input 
                                        type="number"
                                        className={`h-input w-full ${getError(index, 'age') ? 'border-danger' : ''}`}
                                        value={row.age}
                                        onChange={(e) => updateRow(row.id, 'age', e.target.value)}
                                        placeholder="Age"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Gender *</label>
                                    <select 
                                        className="h-input w-full"
                                        value={row.gender}
                                        onChange={(e) => updateRow(row.id, 'gender', e.target.value)}
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Class *</label>
                                    <select 
                                        className={`h-input w-full ${getError(index, 'class_id') ? 'border-danger' : ''}`}
                                        value={row.class_id}
                                        onChange={(e) => updateRow(row.id, 'class_id', e.target.value)}
                                    >
                                        <option value="">Select...</option>
                                        {picklists?.classes?.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Section *</label>
                                    <select 
                                        className="h-input w-full"
                                        value={row.boarding_status}
                                        onChange={(e) => updateRow(row.id, 'boarding_status', e.target.value)}
                                    >
                                        <option value="day">Day</option>
                                        <option value="boarding">Boarding</option>
                                    </select>
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Residence *</label>
                                    <input 
                                        className={`h-input w-full ${getError(index, 'residence') ? 'border-danger' : ''}`}
                                        value={row.residence}
                                        onChange={(e) => updateRow(row.id, 'residence', e.target.value)}
                                        placeholder="Where do they live?"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                {Object.keys(errors).length > 0 && (
                    <div className="mt-4 p-3 bg-danger-500/10 border border-danger-500/20 text-danger-400 text-sm rounded-lg">
                        Please correct the errors in the highlighted rows. Required fields are missing or invalid.
                    </div>
                )}
                
                <div className="mt-4 flex justify-between">
                    <button 
                        type="button" 
                        className="btn btn--secondary btn--sm" 
                        onClick={addRow}
                        disabled={data.pathfinders.length >= 20}
                    >
                        <Plus size={14} /> Add Row
                    </button>
                    <span className="text-xs text-muted">{data.pathfinders.length} / 20 rows</span>
                </div>
            </div>
        </div>
    );
}
