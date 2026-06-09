import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Plus, Trash2, Users, Save, X, Camera } from 'lucide-react';
import ReligionCombobox from './ReligionCombobox';

export default function BulkMasterGuideForm({ picklists, onCancel, onSuccess }) {
    const defaultReligionId = picklists?.religions?.find(r => r.name === 'SDA')?.id || '';

    const createEmptyRow = () => ({
        id: crypto.randomUUID(),
        name: '',
        phone: '',
        gender: 'Male',
        role: 'MGT', // Only MG or MGT allowed in bulk
        religion_id: defaultReligionId,
    });

    const { data, setData, post, processing, errors } = useForm({
        master_guides: [createEmptyRow(), createEmptyRow()],
    });

    const addRow = () => {
        if (data.master_guides.length >= 10) {
            alert('Maximum 10 Master Guides can be added at once.');
            return;
        }
        setData('master_guides', [...data.master_guides, createEmptyRow()]);
    };

    const removeRow = (id) => {
        if (data.master_guides.length <= 1) return;
        setData('master_guides', data.master_guides.filter(p => p.id !== id));
    };

    const updateRow = (id, field, value) => {
        setData('master_guides', data.master_guides.map(p => 
            p.id === id ? { ...p, [field]: value } : p
        ));
    };

    const handleImageUpload = (id, e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const previewUrl = URL.createObjectURL(file);
        setData('master_guides', data.master_guides.map(p => 
            p.id === id ? { ...p, avatar: file, avatarPreview: previewUrl } : p
        ));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const validRecords = data.master_guides.filter(p => p.name.trim() !== '');
        
        if (validRecords.length === 0) {
            alert('Please fill out at least one master guide.');
            return;
        }

        post(route('master_guides.bulk_store'), {
            data: { master_guides: validRecords },
            onSuccess: () => {
                if (onSuccess) onSuccess();
            }
        });
    };

    const getError = (index, field) => errors[`master_guides.${index}.${field}`];

    return (
        <div className="panel__body p-0">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-surface-800">
                <div>
                    <h3 className="flex items-center gap-2 text-lg text-white m-0">
                        <Users size={18} className="text-success" /> Bulk Register Master Guides
                    </h3>
                    <p className="text-xs text-muted m-0 mt-1">Add up to 10 Master Guides / MGiTs at once. Empty rows will be ignored.</p>
                </div>
                <div className="flex gap-2">
                    <button type="button" className="btn btn--secondary" onClick={onCancel} disabled={processing}>
                        <X size={14} /> Cancel
                    </button>
                    <button type="button" className="btn btn--primary bg-success border-success" onClick={handleSubmit} disabled={processing}>
                        <Save size={14} /> {processing ? 'Saving...' : 'Save All'}
                    </button>
                </div>
            </div>

            <div className="p-6 bg-surface-900/50">
                <div className="flex flex-col gap-6">
                    {data.master_guides.map((row, index) => (
                        <div key={row.id} className="relative bg-surface-800 rounded-3xl border border-white/5 p-6 flex flex-col md:flex-row gap-6 hover:border-gold-500/20 transition-colors">
                            <button 
                                type="button"
                                className="absolute top-4 right-4 p-2 text-muted hover:text-danger hover:bg-danger/10 rounded-full transition-colors"
                                onClick={() => removeRow(row.id)}
                                disabled={data.master_guides.length <= 1}
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
                                        placeholder="E.g. John Doe"
                                    />
                                </div>
                            </div>

                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 content-start pt-1">
                                <div className="sm:col-span-2 flex items-center justify-between border-b border-white/5 pb-2 mb-2">
                                    <span className="text-xs font-black uppercase tracking-widest text-gold-500">Record #{index + 1}</span>
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
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Investiture Status *</label>
                                    <select
                                        className={`h-input w-full ${getError(index, 'role') ? 'border-danger' : ''}`}
                                        value={row.role}
                                        onChange={(e) => updateRow(row.id, 'role', e.target.value)}
                                    >
                                        <option value="MGT">Master Guide in Training (MGT)</option>
                                        <option value="MG">Master Guide (Invested)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Religion *</label>
                                    <ReligionCombobox 
                                        value={row.religion_id} 
                                        onChange={(val) => updateRow(row.id, 'religion_id', val)}
                                        religions={picklists?.religions || []}
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
                        disabled={data.master_guides.length >= 10}
                    >
                        <Plus size={14} /> Add Row
                    </button>
                    <span className="text-xs text-muted">{data.master_guides.length} / 10 rows</span>
                </div>
            </div>
        </div>
    );
}
