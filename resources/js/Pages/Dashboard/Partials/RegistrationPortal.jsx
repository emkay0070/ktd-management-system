import { useState, useMemo } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Tent, Users, CheckCircle, Search, CreditCard, Clock, XCircle, AlertCircle, Plus, Info } from 'lucide-react';

export default function RegistrationPortal({ pathfinders = [], registrations = [], district_events = [] }) {
    const [selectedEventId, setSelectedEventId] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [paymentModal, setPaymentModal] = useState(null); // { registration_id, amount, notes }

    const selectedEvent = useMemo(() => 
        district_events.find(e => e.id.toString() === selectedEventId), 
    [district_events, selectedEventId]);

    const { data, setData, post, processing, reset } = useForm({
        district_event_id: '',
        pathfinder_ids: [],
    });

    const filteredPathfinders = useMemo(() => {
        return pathfinders.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !registrations.some(r => r.pathfinder_id === p.id && r.district_event_id.toString() === selectedEventId)
        );
    }, [pathfinders, searchTerm, registrations, selectedEventId]);

    const currentRegistrations = useMemo(() => {
        return registrations.filter(r => r.district_event_id.toString() === selectedEventId);
    }, [registrations, selectedEventId]);

    const handleBulkRegister = (e) => {
        e.preventDefault();
        if (data.pathfinder_ids.length === 0) return;
        
        post(route('registrations.bulk'), {
            onSuccess: () => {
                reset('pathfinder_ids');
            }
        });
    };

    const togglePathfinder = (id) => {
        const ids = [...data.pathfinder_ids];
        if (ids.includes(id)) {
            setData('pathfinder_ids', ids.filter(i => i !== id));
        } else {
            setData('pathfinder_ids', [...ids, id]);
        }
    };

    const handleUpdatePayment = (e) => {
        e.preventDefault();
        router.patch(route('registrations.payment', paymentModal.id), {
            amount: paymentModal.amount_paid,
            notes: paymentModal.notes
        }, {
            onSuccess: () => setPaymentModal(null)
        });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Event Selection */}
            <div className="panel" style={{ padding: 'var(--sp-6)', background: 'linear-gradient(135deg, rgba(82, 18, 20, 0.4), rgba(20, 20, 25, 0.4))' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ padding: '12px', background: 'var(--clr-gold-500)', borderRadius: '12px', color: '#000' }}>
                        <Tent size={24} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ margin: 0, color: 'var(--clr-text-primary)' }}>Select District Event</h3>
                        <p style={{ fontSize: '12px', color: 'var(--clr-text-muted)' }}>Choose the camp or competition you want to register for.</p>
                    </div>
                    <select 
                        className="h-select" 
                        style={{ maxWidth: '300px' }}
                        value={selectedEventId}
                        onChange={e => {
                            setSelectedEventId(e.target.value);
                            setData('district_event_id', e.target.value);
                        }}
                    >
                        <option value="">-- Select Event --</option>
                        {district_events.map(e => (
                            <option key={e.id} value={e.id}>{e.name} ({new Date(e.start_date).toLocaleDateString()})</option>
                        ))}
                    </select>
                </div>
            </div>

            {!selectedEventId ? (
                <div className="panel" style={{ textAlign: 'center', padding: '80px', opacity: 0.5 }}>
                    <Info size={48} className="mx-auto mb-4 opacity-20" />
                    <h3>Select an event above to begin registration</h3>
                    <p>Current active camps and training sessions will appear in the dropdown.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-8">
                    {/* Bulk Enrollment */}
                    <div className="panel slide-in" style={{ padding: 'var(--sp-6)', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ marginBottom: '24px' }}>
                            <h3 style={{ margin: '0 0 4px 0', color: 'var(--clr-text-primary)' }}>New Enrolments</h3>
                            <p style={{ fontSize: '12px', color: 'var(--clr-text-muted)' }}>Select Pathfinders to add to the <b>{selectedEvent?.name}</b>.</p>
                        </div>

                        <div className="search-bar mb-4">
                            <Search size={16} />
                            <input 
                                type="text" 
                                placeholder="Search pathfinders..." 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div style={{ flex: 1, maxHeight: '400px', overflowY: 'auto', marginBottom: '16px' }}>
                            {filteredPathfinders.map(p => (
                                <div 
                                    key={p.id} 
                                    onClick={() => togglePathfinder(p.id)}
                                    style={{ 
                                        padding: '12px', 
                                        borderRadius: '8px', 
                                        marginBottom: '8px', 
                                        background: data.pathfinder_ids.includes(p.id) ? 'rgba(212, 160, 23, 0.1)' : 'var(--clr-surface-700)',
                                        border: data.pathfinder_ids.includes(p.id) ? '1px solid var(--clr-gold-500)' : '1px solid var(--clr-border)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{ 
                                        width: '20px', 
                                        height: '20px', 
                                        borderRadius: '4px', 
                                        border: '2px solid var(--clr-gold-500)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: data.pathfinder_ids.includes(p.id) ? 'var(--clr-gold-500)' : 'transparent'
                                    }}>
                                        {data.pathfinder_ids.includes(p.id) && <CheckCircle size={14} style={{ color: '#000' }} />}
                                    </div>
                                    <div style={{ fontWeight: 600, color: data.pathfinder_ids.includes(p.id) ? 'var(--clr-text-primary)' : 'var(--clr-text-secondary)' }}>{p.name}</div>
                                </div>
                            ))}
                            {filteredPathfinders.length === 0 && (
                                <p style={{ textAlign: 'center', padding: '40px', fontSize: '13px', color: 'var(--clr-text-muted)' }}>No more Pathfinders available to register.</p>
                            )}
                        </div>

                        <button 
                            className="btn btn--primary w-full" 
                            disabled={data.pathfinder_ids.length === 0 || processing}
                            onClick={handleBulkRegister}
                        >
                            <Plus size={16} className="mr-2" /> Register {data.pathfinder_ids.length} Selected
                        </button>
                    </div>

                    {/* Registration Status */}
                    <div className="panel slide-in" style={{ padding: 'var(--sp-6)' }}>
                        <div style={{ marginBottom: '24px' }}>
                            <h3 style={{ margin: '0 0 4px 0', color: 'var(--clr-text-primary)' }}>Registration List ({currentRegistrations.length})</h3>
                            <p style={{ fontSize: '12px', color: 'var(--clr-text-muted)' }}>Manage payments and statuses for {selectedEvent?.name}.</p>
                        </div>

                        <div className="table-responsive">
                            <table className="h-table">
                                <thead>
                                    <tr>
                                        <th>Pathfinder</th>
                                        <th>Paid So Far</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentRegistrations.map(reg => (
                                        <tr key={reg.id}>
                                            <td>
                                                <div style={{ fontWeight: 700, color: 'var(--clr-text-primary)' }}>{reg.pathfinder?.name}</div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span className="badge badge--neutral">UGX {reg.amount_paid.toLocaleString()}</span>
                                                    <button onClick={() => setPaymentModal(reg)} className="icon-btn" title="Add Payment">
                                                        <CreditCard size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                            <td>
                                                {reg.status === 'approved' ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--clr-gold-400)', fontSize: '12px', fontWeight: 800 }}>
                                                        <CheckCircle size={14} /> APPROVED
                                                    </div>
                                                ) : (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--clr-text-muted)', fontSize: '12px', fontWeight: 700 }}>
                                                        <Clock size={14} /> PENDING
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <button onClick={() => router.delete(route('registrations.destroy', reg.id))} className="icon-btn" style={{ color: 'var(--clr-burgundy-400)' }}>
                                                    <XCircle size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {currentRegistrations.length === 0 && (
                                        <tr>
                                            <td colSpan={4} style={{ padding: '60px', textAlign: 'center', opacity: 0.3 }}>
                                                <AlertCircle size={40} className="mx-auto mb-4" />
                                                <p>No registrations found for this event yet.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {paymentModal && (
                <div className="modal-overlay" onClick={() => setPaymentModal(null)}>
                    <div className="modal-content" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <div style={{ padding: '10px', background: 'rgba(212, 160, 23, 0.1)', borderRadius: '10px', color: 'var(--clr-gold-500)' }}>
                                <CreditCard size={20} />
                            </div>
                            <h3 style={{ margin: 0 }}>Record Local Payment</h3>
                        </div>
                        <p style={{ fontSize: '13px', color: 'var(--clr-text-secondary)', marginBottom: '20px' }}>
                            Update the amount paid locally by <b>{paymentModal.pathfinder?.name}</b>. Approval will be granted by the District Treasurer.
                        </p>
                        <form onSubmit={handleUpdatePayment} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div className="form-group">
                                <label>Amount Paid (UGX)</label>
                                <input 
                                    type="number" 
                                    className="h-input" 
                                    value={paymentModal.amount_paid} 
                                    onChange={e => setPaymentModal({...paymentModal, amount_paid: e.target.value})} 
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label>Payment Notes (Optional)</label>
                                <textarea 
                                    className="h-textarea" 
                                    value={paymentModal.notes} 
                                    onChange={e => setPaymentModal({...paymentModal, notes: e.target.value})}
                                    placeholder="e.g. Paid cash at club meeting"
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                                <button type="button" className="btn btn--secondary" onClick={() => setPaymentModal(null)}>Cancel</button>
                                <button type="submit" className="btn btn--primary">Update Payment</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
