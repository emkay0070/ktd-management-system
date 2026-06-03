import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Plus, Trash2, Users, Save, X } from 'lucide-react';
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

            <div className="p-6 overflow-x-auto">
                <table className="h-table w-full">
                    <thead>
                        <tr>
                            <th style={{ width: '40px' }}>#</th>
                            <th style={{ minWidth: '200px' }}>Full Name *</th>
                            <th style={{ width: '80px' }}>Age *</th>
                            <th style={{ width: '120px' }}>Gender</th>
                            <th style={{ width: '150px' }}>Class *</th>
                            <th style={{ minWidth: '150px' }}>Residence *</th>
                            <th style={{ width: '120px' }}>Section</th>
                            <th style={{ width: '50px' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.pathfinders.map((row, index) => (
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
                                        type="number"
                                        className={`h-input w-full ${getError(index, 'age') ? 'border-danger' : ''}`}
                                        value={row.age}
                                        onChange={(e) => updateRow(row.id, 'age', e.target.value)}
                                        placeholder="Age"
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
                                        className={`h-input w-full ${getError(index, 'class_id') ? 'border-danger' : ''}`}
                                        value={row.class_id}
                                        onChange={(e) => updateRow(row.id, 'class_id', e.target.value)}
                                    >
                                        <option value="">Select...</option>
                                        {picklists?.classes?.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </td>
                                <td>
                                    <input 
                                        className={`h-input w-full ${getError(index, 'residence') ? 'border-danger' : ''}`}
                                        value={row.residence}
                                        onChange={(e) => updateRow(row.id, 'residence', e.target.value)}
                                        placeholder="Residence"
                                    />
                                </td>
                                <td>
                                    <select 
                                        className="h-input w-full"
                                        value={row.boarding_status}
                                        onChange={(e) => updateRow(row.id, 'boarding_status', e.target.value)}
                                    >
                                        <option value="day">Day</option>
                                        <option value="boarding">Boarding</option>
                                    </select>
                                </td>
                                <td>
                                    <button 
                                        type="button"
                                        className="p-1.5 text-muted hover:text-danger hover:bg-danger/10 rounded transition-colors"
                                        onClick={() => removeRow(row.id)}
                                        disabled={data.pathfinders.length <= 1}
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
