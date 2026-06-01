import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Shield, Plus, Mail, Check, AlertTriangle, Users, Trash2 } from 'lucide-react';

export default function DistrictCommitteeManager({ committee, readonly }) {
    const [view, setView] = useState('list');
    
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('district_committee.store'), {
            onSuccess: () => {
                reset();
                setView('list');
            }
        });
    };

    const handleDelete = (member) => {
        if (confirm(`Are you sure you want to remove ${member.name} from the District Committee?`)) {
            router.delete(route('district_committee.destroy', member.id));
        }
    };
    
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h3 className="form-section-title mb-1">District Executive Committee</h3>
                    <p className="text-xs text-muted">Manage the leaders overseeing the entire district.</p>
                </div>
                {!readonly && view === 'list' && (
                    <button 
                        className="btn btn--primary btn--sm" 
                        onClick={() => setView('form')}
                    >
                        <Plus size={16} className="mr-2" /> Add Committee Member
                    </button>
                )}
                {!readonly && view === 'form' && (
                    <button 
                        className="btn btn--secondary btn--sm" 
                        onClick={() => setView('list')}
                    >
                        Cancel
                    </button>
                )}
            </div>

            {view === 'list' ? (
                <div className="panel p-0" style={{ background: 'rgba(255,255,255,0.01)', borderColor: 'rgba(255,255,255,0.05)' }}>
                    <div className="table-responsive">
                        <table className="h-table">
                            <thead>
                                <tr>
                                    <th style={{ paddingLeft: '1.5rem' }}>Executive Officer</th>
                                    <th>Role</th>
                                    <th>Contact Information</th>
                                    <th style={{ width: 100 }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {committee.map(member => (
                                    <tr key={member.id}>
                                        <td className="cell-primary" style={{ minWidth: 250, paddingLeft: '1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                <div style={{ width: '40px', height: '40px', background: 'var(--clr-surface-700)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', flexShrink: 0, fontWeight: 700, overflow: 'hidden' }}>
                                                    {member.avatar_url ? (
                                                        <img src={member.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <span style={{ fontSize: '12px', opacity: 0.6 }}>{member.name[0]}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 800, fontSize: '14px', color: '#f3f4f6' }}>{member.name}</div>
                                                    <div style={{ fontSize: '9px', color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '4px' }}>District Official</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: member.role === 'district_director' ? 'var(--clr-gold-500)' : 'var(--clr-burgundy-500)', boxShadow: member.role === 'district_director' ? '0 0 5px rgba(212,160,23,0.5)' : '0 0 5px rgba(155,34,38,0.5)' }}></div>
                                                <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: member.role === 'district_director' ? 'var(--clr-gold-400)' : 'var(--clr-burgundy-400)' }}>
                                                    {member.role === 'district_director' ? 'District Director' : 'Committee Member'}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--clr-text-muted)' }}>
                                                <Mail size={12} style={{ opacity: 0.5 }} />
                                                {member.email}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                {!readonly && member.role !== 'district_director' && (
                                                    <button 
                                                        onClick={() => handleDelete(member)}
                                                        className="action-btn text-danger/50 hover:text-danger hover:bg-danger/10" 
                                                        title="Remove Member"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {committee.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="py-16 text-center opacity-40">
                                            <Users size={32} className="mb-3 text-white mx-auto opacity-50" strokeWidth={1} />
                                            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white">No Committee Members</div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="panel slide-in">
                    <div className="panel__header">
                        <div>
                            <h3>Add Executive Member</h3>
                            <p>Register a new member to the District Committee.</p>
                        </div>
                    </div>
                    <form onSubmit={handleSubmit} className="panel__body">
                        <div className="form-grid-2">
                            <div className="form-group">
                                <label>Full Name</label>
                                <input 
                                    type="text" 
                                    className="h-input" 
                                    value={data.name} 
                                    onChange={e => setData('name', e.target.value)} 
                                    placeholder="e.g. Jane Doe"
                                    required 
                                />
                                {errors.name && <div className="field-error">{errors.name}</div>}
                            </div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input 
                                    type="email" 
                                    className="h-input" 
                                    value={data.email} 
                                    onChange={e => setData('email', e.target.value)} 
                                    placeholder="e.g. jane.doe@district.org"
                                    required 
                                />
                                {errors.email && <div className="field-error">{errors.email}</div>}
                            </div>
                            <div className="form-group">
                                <label>Temporary Password</label>
                                <input 
                                    type="password" 
                                    className="h-input" 
                                    value={data.password} 
                                    onChange={e => setData('password', e.target.value)} 
                                    required 
                                    minLength={8}
                                />
                                <div className="field-hint">Must be at least 8 characters.</div>
                                {errors.password && <div className="field-error">{errors.password}</div>}
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                            <button type="submit" className="btn btn--primary" disabled={processing}>
                                {processing ? 'Registering...' : 'Register Official'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
