import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Plus, Trash2, Users, Save, X } from 'lucide-react';
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

            <div className="p-6 overflow-x-auto">
                <table className="h-table w-full">
                    <thead>
                        <tr>
                            <th style={{ width: '40px' }}>#</th>
                            <th style={{ minWidth: '200px' }}>Full Name *</th>
                            <th style={{ width: '150px' }}>Phone *</th>
                            <th style={{ width: '120px' }}>Gender</th>
                            <th style={{ width: '120px' }}>Role</th>
                            <th style={{ width: '50px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.master_guides.map((row, index) => (
                            <tr key={row.id}>
                                <td className="text-muted text-xs font-bold text-center">{index + 1}</td>
                                <td>
                                    <input 
                                        className={`h-input w-full ${getError(index, 'name') ? 'border-danger' : ''}`}
                                        value={row.name}
                                        onChange={(e) => updateRow(row.id, 'name', e.target.value)}
                                        placeholder="Full Name"
                                    />
                                </td>
                                <td>
                                    <input 
                                        className={`h-input w-full ${getError(index, 'phone') ? 'border-danger' : ''}`}
                                        value={row.phone}
                                        onChange={(e) => updateRow(row.id, 'phone', e.target.value)}
                                        placeholder="Phone Number"
                                    />
                                </td>
                                <td>
                                    <select 
                                        className="h-input w-full"
                                        value={row.gender}
                                        onChange={(e) => updateRow(row.id, 'gender', e.target.value)}
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </td>
                                <td>
                                    <select 
                                        className={`h-input w-full ${getError(index, 'role') ? 'border-danger' : ''}`}
                                        value={row.role}
                                        onChange={(e) => updateRow(row.id, 'role', e.target.value)}
                                    >
                                        <option value="MGT">MGiT</option>
                                        <option value="MG">Master Guide</option>
                                    </select>
                                </td>
                                <td>
                                    <button 
                                        type="button"
                                        className="p-1.5 text-muted hover:text-danger hover:bg-danger/10 rounded transition-colors"
                                        onClick={() => removeRow(row.id)}
                                        disabled={data.master_guides.length <= 1}
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
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
