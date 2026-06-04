import { Megaphone, AlertTriangle, Info, Clock, FolderOpen } from 'lucide-react';

export default function ClubBulletinsView({ bulletins = [] }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '8px', background: 'rgba(212,160,23,0.1)', borderRadius: '10px', color: 'var(--clr-gold-400)' }}>
                    <Megaphone size={24} />
                </div>
                <div>
                    <h3 style={{ margin: 0, color: 'var(--clr-text-primary)' }}>Official Bulletins</h3>
                    <p style={{ fontSize: '12px', color: 'var(--clr-text-muted)' }}>Announcements and directives issued by the District Executive.</p>
                </div>
            </div>

            {bulletins.length === 0 ? (
                <div style={{ padding: '60px', textAlign: 'center', opacity: 0.3 }}>
                    <FolderOpen size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
                    <h3 style={{ color: 'var(--clr-text-primary)' }}>No Bulletins</h3>
                    <p style={{ color: 'var(--clr-text-muted)' }}>No official bulletins have been published yet.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {bulletins.map(bulletin => (
                        <div
                            key={bulletin.id}
                            className="panel"
                            style={{
                                padding: '24px',
                                borderLeft: `3px solid ${bulletin.level === 'Urgent' ? 'var(--clr-burgundy-500)' : 'var(--clr-gold-500)'}`,
                                background: bulletin.level === 'Urgent'
                                    ? 'linear-gradient(to right, rgba(128, 0, 32, 0.08), transparent)'
                                    : 'linear-gradient(to right, rgba(212, 160, 23, 0.05), transparent)',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                <div style={{
                                    padding: '10px',
                                    borderRadius: '14px',
                                    flexShrink: 0,
                                    background: bulletin.level === 'Urgent' ? 'rgba(128,0,32,0.15)' : 'rgba(212,160,23,0.1)',
                                    color: bulletin.level === 'Urgent' ? 'var(--clr-burgundy-400)' : 'var(--clr-gold-400)',
                                }}>
                                    {bulletin.level === 'Urgent' ? <AlertTriangle size={22} /> : <Info size={22} />}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                                        <span style={{
                                            fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em',
                                            padding: '2px 8px', borderRadius: '999px',
                                            background: bulletin.level === 'Urgent' ? 'rgba(128,0,32,0.2)' : 'rgba(212,160,23,0.15)',
                                            color: bulletin.level === 'Urgent' ? 'var(--clr-burgundy-400)' : 'var(--clr-gold-400)',
                                        }}>
                                            {bulletin.level || 'General'}
                                        </span>
                                        <span style={{ fontSize: '10px', color: 'var(--clr-text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Clock size={10} />
                                            {bulletin.created_at ? new Date(bulletin.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently'}
                                        </span>
                                    </div>
                                    <h4 style={{ margin: '0 0 8px', color: 'var(--clr-text-primary)', fontSize: '16px', fontWeight: 900 }}>
                                        {bulletin.title}
                                    </h4>
                                    <p style={{ fontSize: '13px', color: 'var(--clr-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                                        {bulletin.content}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
