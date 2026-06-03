import { CalendarClock, MapPin, Clock, Tag, FolderOpen, Share2 } from 'lucide-react';

export default function ClubEventsView({ events = [] }) {
    const upcoming = events.filter(e => new Date(e.start_date) >= new Date());
    const past = events.filter(e => new Date(e.start_date) < new Date());

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            
            {/* Local Club Calendar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', color: 'var(--clr-text-primary)' }}>
                            <CalendarClock size={24} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, color: 'var(--clr-text-primary)' }}>Local Club Calendar</h3>
                            <p style={{ fontSize: '12px', color: 'var(--clr-text-muted)' }}>Manage club meetings, local campouts, and local master guide training events.</p>
                        </div>
                    </div>
                    <button className="btn btn--burgundy font-bold shadow-lg shadow-burgundy-900/50">
                        + Create Meeting
                    </button>
                </div>
                <div style={{ padding: '60px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '16px', background: 'rgba(255,255,255,0.01)' }}>
                    <p style={{ color: 'var(--clr-text-muted)' }}>No local meetings scheduled.</p>
                </div>
            </div>

            <hr style={{ borderColor: 'rgba(255,255,255,0.05)' }} />

            {/* District Events (Read-Only) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ padding: '8px', background: 'rgba(212,160,23,0.1)', borderRadius: '10px', color: 'var(--clr-gold-400)' }}>
                        <Tag size={24} />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, color: 'var(--clr-text-primary)' }}>District Assemblies</h3>
                        <p style={{ fontSize: '12px', color: 'var(--clr-text-muted)' }}>Camporees, assemblies, and special gatherings announced by your District (Read Only).</p>
                    </div>
                </div>

                {events.length === 0 ? (
                <div style={{ padding: '60px', textAlign: 'center', opacity: 0.3 }}>
                    <FolderOpen size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
                    <h3 style={{ color: 'var(--clr-text-primary)' }}>No Events Yet</h3>
                    <p style={{ color: 'var(--clr-text-muted)' }}>The District has not published any events yet.</p>
                </div>
            ) : (
                <>
                    {upcoming.length > 0 && (
                        <div>
                            <h4 style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--clr-gold-400)', marginBottom: '16px' }}>
                                Upcoming ({upcoming.length})
                            </h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                                {upcoming.map(event => (
                                    <EventCard key={event.id} event={event} />
                                ))}
                            </div>
                        </div>
                    )}

                    {past.length > 0 && (
                        <div>
                            <h4 style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--clr-text-muted)', marginBottom: '16px' }}>
                                Past Events ({past.length})
                            </h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px', opacity: 0.5 }}>
                                {past.map(event => (
                                    <EventCard key={event.id} event={event} />
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
            </div>
        </div>
    );
}

function EventCard({ event }) {
    return (
        <div className="panel" style={{ borderLeft: '3px solid var(--clr-gold-500)', padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px 20px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <Tag size={12} style={{ color: 'var(--clr-gold-400)' }} />
                    <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--clr-gold-400)' }}>
                        {event.type || 'Event'}
                    </span>
                </div>
                <h4 style={{ margin: '0 0 8px', color: 'var(--clr-text-primary)', fontSize: '16px', fontWeight: 900 }}>{event.name}</h4>
                <p style={{ fontSize: '13px', color: 'var(--clr-text-secondary)', marginBottom: '16px', minHeight: '36px' }}>
                    {event.description || 'District gathering — details to follow.'}
                </p>
            </div>
            <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 700, color: 'var(--clr-text-primary)' }}>
                        <Clock size={14} style={{ color: 'var(--clr-burgundy-400)' }} />
                        {new Date(event.start_date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--clr-text-muted)' }}>
                        <MapPin size={14} />
                        {event.location || 'Location TBA'}
                    </div>
                </div>
                
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <button className="btn btn--white btn--sm" style={{ flex: 1, fontWeight: 900, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        View Details
                    </button>
                    <button className="btn btn--outline btn--sm" style={{ padding: '0 12px' }} title="Share with Club">
                        <Share2 size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}
