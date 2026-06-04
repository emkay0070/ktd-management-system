import { useState } from 'react';
import { useForm, router, Link } from '@inertiajs/react';
import { Calendar, Plus, MapPin, Clock, Share2, Trash2, Tag, CalendarClock } from 'lucide-react';

export default function DistrictEventsManager({ events, canEdit = false, canPublish = false, canDelete = false }) {
    const [view, setView] = useState('grid');
    
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        type: 'Camporee',
        description: '',
        start_date: '',
        end_date: '',
        location: '',
        registration_fee: 0,
        message_type: 'official_event',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('district_events.store'), {
            onSuccess: () => {
                reset();
                setView('grid');
            }
        });
    };

    const handleDelete = (event) => {
        if (confirm(`Are you sure you want to delete ${event.name}? This will remove it from all local club dashboards.`)) {
            router.delete(route('district_events.destroy', event.id));
        }
    };

    const handleTogglePublish = (event) => {
        const action = event.workflow_status === 'published' ? 'hide this from' : 'broadcast this to';
        if (confirm(`Are you sure you want to ${action} all local clubs?`)) {
            router.post(route('district_events.toggle_publish', event.id));
        }
    };

    const getStatusBadge = (status) => {
        switch(status) {
            case 'Ongoing': return 'badge--success';
            case 'Completed': return 'badge--neutral';
            case 'Cancelled': return 'badge--danger';
            default: return 'badge--info';
        }
    };
    
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h3 className="form-section-title mb-1">Global Event Scheduling</h3>
                    <p className="text-xs text-muted">Create district-wide events and broadcast them to local clubs.</p>
                </div>
                {canEdit && view === 'grid' && (
                    <button 
                        className="btn btn--primary btn--sm" 
                        onClick={() => setView('form')}
                    >
                        <Plus size={16} className="mr-2" /> Schedule Event
                    </button>
                )}
                {canEdit && view === 'form' && (
                    <button 
                        className="btn btn--secondary btn--sm" 
                        onClick={() => setView('grid')}
                    >
                        Cancel
                    </button>
                )}
            </div>

            {view === 'grid' ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                    {events.map(event => (
                        <div key={event.id} className="panel p-0 relative overflow-hidden flex flex-col" style={{ display: 'flex', flexDirection: 'column' }}>
                            <div className="p-5 border-b border-white/5" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div className="flex gap-2">
                                        <div className={`badge ${getStatusBadge(event.operational_status)}`}>{event.operational_status}</div>
                                        {event.workflow_status === 'draft' && <span className="badge badge--neutral">DRAFT</span>}
                                        {event.workflow_status === 'published' && <span className="badge badge--green">PUBLISHED</span>}
                                    </div>
                                    <div className="flex gap-2">
                                        {canPublish && (
                                            <button 
                                                onClick={() => handleTogglePublish(event)}
                                                className={`action-btn p-1.5 rounded transition-colors ${event.workflow_status === 'published' ? 'text-gold-400 bg-gold-400/10 hover:bg-gold-400/20' : 'text-muted hover:text-white hover:bg-white/10'}`} 
                                                title={event.workflow_status === 'published' ? "Unpublish (Hide from local clubs)" : "Broadcast to local clubs"}
                                            >
                                                <Share2 size={16} />
                                            </button>
                                        )}
                                        {canDelete && (
                                            <button 
                                                onClick={() => handleDelete(event)}
                                                className="action-btn p-1.5 rounded text-danger/50 hover:text-danger hover:bg-danger/10" 
                                                title="Delete Event"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                
                                <div>
                                    <h4 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--clr-text-primary)', margin: 0, lineHeight: 1.2 }}>{event.name}</h4>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--clr-text-muted)' }}>
                                            <Tag size={12} className="text-gold-400/50" />
                                            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{event.type}</span>
                                        </div>
                                        <div style={{ fontSize: '11px', fontWeight: 900, color: 'var(--clr-gold-400)' }}>
                                            UGX {parseFloat(event.registration_fee).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-5" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ fontSize: '13px', color: 'var(--clr-text-secondary)', lineHeight: 1.6 }}>
                                    {event.description || <span style={{ fontStyle: 'italic', opacity: 0.5 }}>No description provided.</span>}
                                </div>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: 'var(--clr-text-primary)' }}>
                                        <Clock size={14} className="text-burgundy-400" />
                                        <span style={{ fontWeight: 600 }}>{new Date(event.start_date).toLocaleDateString()} — {new Date(event.end_date).toLocaleDateString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: 'var(--clr-text-muted)' }}>
                                        <MapPin size={14} className="opacity-50" />
                                        <span>{event.location || 'Location TBA'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {events.length === 0 && (
                        <div style={{ gridColumn: '1 / -1', padding: '80px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', opacity: 0.4, background: 'rgba(0,0,0,0.1)', borderRadius: '16px', border: '1px dashed rgba(255,255,255,0.05)' }}>
                            <CalendarClock size={48} className="mb-4 text-gold-400" strokeWidth={1} />
                            <div style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--clr-text-primary)', letterSpacing: '0.2em' }}>No Events Scheduled</div>
                            <p style={{ fontSize: '12px', marginTop: '8px', maxWidth: '300px' }}>Your district calendar is empty. Schedule events here to push them to local club directors.</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="panel slide-in">
                    <div className="panel__header">
                        <div>
                            <h3>Schedule District Event</h3>
                            <p>All newly created events are private by default until you broadcast them.</p>
                        </div>
                    </div>
                    <form onSubmit={handleSubmit} className="panel__body">
                        <div className="form-grid-2">
                            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                                <label>Event Title</label>
                                <input 
                                    type="text" 
                                    className="h-input" 
                                    value={data.name} 
                                    onChange={e => setData('name', e.target.value)} 
                                    placeholder="e.g. Annual Kireka Master Guide Camporee"
                                    required 
                                />
                                {errors.name && <div className="field-error">{errors.name}</div>}
                            </div>
                            
                            <div className="form-group">
                                <label>Event Category</label>
                                <select 
                                    className="h-select" 
                                    value={data.type} 
                                    onChange={e => setData('type', e.target.value)}
                                >
                                    <option value="Camporee">Camporee</option>
                                    <option value="Fair">Fair / Rally</option>
                                    <option value="Seminar">Seminar / Training</option>
                                    <option value="Induction">Induction Ceremony</option>
                                    <option value="Investiture">Investiture Ceremony</option>
                                    <option value="General">General Assembly</option>
                                </select>
                                {errors.type && <div className="field-error">{errors.type}</div>}
                            </div>

                            <div className="form-group">
                                <label>Message Type</label>
                                <select 
                                    className="h-select" 
                                    value={data.message_type} 
                                    onChange={e => setData('message_type', e.target.value)}
                                >
                                    <option value="official_event">Official District Event</option>
                                    <option value="training_seminar">Training Seminar</option>
                                    <option value="general_assembly">General Assembly</option>
                                </select>
                                {errors.message_type && <div className="field-error">{errors.message_type}</div>}
                            </div>
                            
                            <div className="form-group">
                                <label>Venue Location</label>
                                <input 
                                    type="text" 
                                    className="h-input" 
                                    value={data.location} 
                                    onChange={e => setData('location', e.target.value)} 
                                    placeholder="e.g. Kaazi Camping Grounds"
                                />
                                {errors.location && <div className="field-error">{errors.location}</div>}
                            </div>
                            
                            <div className="form-group">
                                <label>Start Date</label>
                                <input 
                                    type="date" 
                                    className="h-input" 
                                    value={data.start_date} 
                                    onChange={e => setData('start_date', e.target.value)} 
                                    required 
                                />
                                {errors.start_date && <div className="field-error">{errors.start_date}</div>}
                            </div>
                            
                            <div className="form-group">
                                <label>End Date</label>
                                <input 
                                    type="date" 
                                    className="h-input" 
                                    value={data.end_date} 
                                    onChange={e => setData('end_date', e.target.value)} 
                                    required 
                                />
                                {errors.end_date && <div className="field-error">{errors.end_date}</div>}
                            </div>
                        </div>

                        <div className="form-group mt-4">
                            <label>Registration Fee (per Pathfinder)</label>
                            <div style={{ position: 'relative' }}>
                                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '12px', fontWeight: 700, color: 'var(--clr-gold-500)' }}>UGX</span>
                                <input 
                                    type="number" 
                                    className="h-input" 
                                    style={{ paddingLeft: '48px' }}
                                    value={data.registration_fee} 
                                    onChange={e => setData('registration_fee', e.target.value)} 
                                    required 
                                    min="0"
                                />
                            </div>
                            {errors.registration_fee && <div className="field-error">{errors.registration_fee}</div>}
                        </div>
                        
                        <div className="form-group mt-4">
                            <label>Event Briefing / Description</label>
                            <textarea 
                                className="h-textarea" 
                                value={data.description} 
                                onChange={e => setData('description', e.target.value)} 
                                placeholder="Details going out to all Club Directors..."
                                rows={4}
                            />
                            {errors.description && <div className="field-error">{errors.description}</div>}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                            <button type="submit" className="btn btn--primary" disabled={processing}>
                                {processing ? 'Scheduling...' : 'Save Draft Event'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
