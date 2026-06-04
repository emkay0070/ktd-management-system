import { useState, useMemo } from 'react';
import { router } from '@inertiajs/react';
import { 
    ShieldCheck, Search, Filter, CheckCircle, Clock, User, Church, 
    Tent, AlertCircle, TrendingUp, DollarSign, PieChart, Printer,
    ArrowRight, ChevronRight, Download, FileText, CheckCircle2,
    Calendar, History, Zap, ArrowUpCircle
} from 'lucide-react';

export default function DistrictRegistrationManager({ registrations = [], district_events = [], treasury = [] }) {
    const [activeTab, setActiveTab] = useState('pulse');
    const [selectedEventId, setSelectedEventId] = useState(() => {
        return district_events.length > 0 ? district_events[0].id.toString() : '';
    });
    const [searchTerm, setSearchTerm] = useState('');

    // --- Data Processing ---
    
    const currentTreasury = useMemo(() => {
        return treasury.find(t => t.event_id.toString() === selectedEventId);
    }, [treasury, selectedEventId]);

    const filteredRegistrations = useMemo(() => {
        return registrations.filter(r => {
            const matchesEvent = selectedEventId ? r.district_event_id.toString() === selectedEventId : true;
            const matchesSearch = r.pathfinder?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 r.church?.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesEvent && matchesSearch;
        });
    }, [registrations, selectedEventId, searchTerm]);

    const verificationHistory = useMemo(() => {
        return registrations
            .filter(r => r.status === 'approved' && r.district_event_id.toString() === selectedEventId)
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
            .slice(0, 5);
    }, [registrations, selectedEventId]);

    const debtClubs = useMemo(() => {
        if (!currentTreasury) return [];
        return currentTreasury.by_church
            .filter(c => c.balance > 0)
            .sort((a, b) => b.balance - a.balance);
    }, [currentTreasury]);

    const pendingQueue = useMemo(() => {
        return registrations
            .filter(r => r.status === 'pending' && r.district_event_id.toString() === selectedEventId)
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }, [registrations, selectedEventId]);

    const eventStats = useMemo(() => {
        if (!currentTreasury) return null;
        const total = currentTreasury.total_registrations;
        const collected = currentTreasury.total_collected;
        const expected = currentTreasury.total_expected;
        const progress = expected > 0 ? (collected / expected) * 100 : 0;

        return {
            total,
            collected,
            expected,
            progress,
            remaining: expected - collected
        };
    }, [currentTreasury]);

    const handleApprove = (id) => {
        if (confirm('Mark this registration as verified and fully paid?')) {
            router.post(route('registrations.approve', id));
        }
    };

    const handlePrint = () => {
        window.print();
    };

    // --- Render Helpers ---

    const renderPulse = () => (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                <div className="panel" style={{ borderLeft: '4px solid var(--clr-gold-500)', background: 'linear-gradient(135deg, rgba(212, 160, 23, 0.05), transparent)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '10px', fontWeight: 900, color: 'var(--clr-gold-500)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Expected Collections</div>
                            <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--clr-text-primary)', marginTop: '4px' }}>
                                UGX {eventStats?.expected?.toLocaleString() ?? 0}
                            </div>
                        </div>
                        <TrendingUp size={32} style={{ opacity: 0.2, color: 'var(--clr-gold-500)' }} />
                    </div>
                    <div style={{ marginTop: '16px', height: '4px', background: 'var(--clr-surface-600)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${eventStats?.progress ?? 0}%`, background: 'var(--clr-gold-500)', transition: 'width 1s ease' }}></div>
                    </div>
                </div>

                <div className="panel" style={{ borderLeft: '4px solid var(--clr-success)', background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.05), transparent)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '10px', fontWeight: 900, color: 'var(--clr-success)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Actual Collections</div>
                            <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--clr-text-primary)', marginTop: '4px' }}>
                                UGX {eventStats?.collected?.toLocaleString() ?? 0}
                            </div>
                        </div>
                        <DollarSign size={32} style={{ opacity: 0.2, color: 'var(--clr-success)' }} />
                    </div>
                    <div style={{ marginTop: '16px', fontSize: '10px', color: 'var(--clr-text-secondary)', fontWeight: 700 }}>
                        {eventStats?.total ?? 0} Pathfinders Registered
                    </div>
                </div>

                <div className="panel" style={{ borderLeft: '4px solid var(--clr-info)', background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.05), transparent)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '10px', fontWeight: 900, color: 'var(--clr-info)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Outstanding Balance</div>
                            <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--clr-text-primary)', marginTop: '4px' }}>
                                UGX {eventStats?.remaining?.toLocaleString() ?? 0}
                            </div>
                        </div>
                        <PieChart size={32} style={{ opacity: 0.2, color: 'var(--clr-info)' }} />
                    </div>
                    <div style={{ marginTop: '16px', fontSize: '10px', color: 'var(--clr-text-secondary)', fontWeight: 700 }}>
                        {debtClubs.length} Clubs with pending payments
                    </div>
                </div>
            </div>

            <div className="panel">
                <div className="panel__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h4 style={{ margin: 0 }}>Enrollment Pulse</h4>
                        <p className="text-xs text-muted">A summary of the current district mobilization.</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--clr-text-muted)' }}>
                        <Tent size={14} /> Total Enrollments: <b style={{ color: 'var(--clr-text-primary)' }}>{eventStats?.total}</b>
                    </div>
                </div>
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ flex: 1, height: '12px', background: 'var(--clr-surface-600)', borderRadius: '6px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `100%`, background: 'var(--clr-gold-500)', opacity: 0.1 }}></div>
                        </div>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--clr-text-secondary)', lineHeight: 1.6 }}>
                        The district has reached <b>{eventStats?.total} registrations</b> for this event. 
                        The average fee collection per head is <b>UGX {(eventStats?.collected / (eventStats?.total || 1)).toLocaleString()}</b>.
                    </p>
                </div>
            </div>
        </div>
    );

    const renderActionCenter = () => (
        <div className="fade-in grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="panel">
                    <div className="panel__header" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Zap size={18} className="text-gold-400" />
                        <div>
                            <h4 style={{ margin: 0 }}>Priority Verification Tray</h4>
                            <p className="text-xs text-muted">Review and verify the most recent club payment claims.</p>
                        </div>
                    </div>
                    <div className="p-0">
                        {pendingQueue.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {pendingQueue.slice(0, 5).map(reg => (
                                    <div key={reg.id} style={{ padding: '16px 24px', borderBottom: '1px solid var(--clr-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(212, 160, 23, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--clr-gold-500)' }}>
                                                <User size={16} />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '13px', fontWeight: 800 }}>{reg.pathfinder?.name}</div>
                                                <div style={{ fontSize: '10px', color: 'var(--clr-text-muted)' }}>{reg.church?.name}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '13px', fontWeight: 900, color: 'var(--clr-success)' }}>UGX {parseFloat(reg.amount_paid).toLocaleString()}</div>
                                                <div style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--clr-text-muted)', fontWeight: 700 }}>Claimed amount</div>
                                            </div>
                                            <button 
                                                onClick={() => handleApprove(reg.id)}
                                                className="btn btn--primary btn--sm"
                                                style={{ padding: '6px 12px', fontSize: '11px', borderRadius: '6px' }}
                                            >
                                                Verify Fund
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ padding: '40px', textAlign: 'center', opacity: 0.5 }}>
                                <CheckCircle2 size={32} className="mx-auto mb-2 text-success" />
                                <p style={{ fontSize: '12px', fontWeight: 700 }}>All pending claims verified!</p>
                            </div>
                        )}
                    </div>
                    {pendingQueue.length > 5 && (
                        <div style={{ padding: '12px', textAlign: 'center', borderTop: '1px solid var(--clr-border)' }}>
                            <button onClick={() => setActiveTab('queue')} style={{ background: 'none', border: 'none', color: 'var(--clr-gold-500)', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>
                                View all {pendingQueue.length} pending registrations <ChevronRight size={12} className="inline ml-1" />
                            </button>
                        </div>
                    )}
                </div>

                <div className="panel">
                    <div className="panel__header" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <History size={18} className="text-muted" />
                        <div>
                            <h4 style={{ margin: 0 }}>Recent Reconciliation History</h4>
                            <p className="text-xs text-muted">Last 5 registrations you verified as fully paid.</p>
                        </div>
                    </div>
                    <div className="p-0">
                        {verificationHistory.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {verificationHistory.map(reg => (
                                    <div key={reg.id} style={{ padding: '12px 24px', borderBottom: '1px solid var(--clr-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.8 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                                            <ShieldCheck size={14} className="text-gold-400" />
                                            <span style={{ fontWeight: 600 }}>{reg.pathfinder?.name}</span>
                                            <span style={{ color: 'var(--clr-text-muted)', fontSize: '10px' }}>({reg.church?.name})</span>
                                        </div>
                                        <div style={{ fontSize: '11px', fontWeight: 700 }}>
                                            UGX {parseFloat(reg.amount_paid).toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ padding: '24px', textAlign: 'center', opacity: 0.4, fontStyle: 'italic', fontSize: '12px' }}>
                                No recent history.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="panel" style={{ background: debtClubs.length > 0 ? 'rgba(184, 50, 50, 0.03)' : 'transparent', borderColor: debtClubs.length > 0 ? 'rgba(184, 50, 50, 0.1)' : 'var(--clr-border)' }}>
                    <div className="panel__header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <AlertCircle size={16} className={debtClubs.length > 0 ? "text-danger" : "text-success"} />
                        <h5 style={{ margin: 0 }}>Critical Attention</h5>
                    </div>
                    <div className="p-4" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {debtClubs.length > 0 ? (
                            <>
                                <p style={{ fontSize: '11px', color: 'var(--clr-text-secondary)', marginBottom: '8px' }}>The following clubs have the highest outstanding balances:</p>
                                {debtClubs.slice(0, 4).map(church => (
                                    <div key={church.church_id} style={{ padding: '10px', background: 'var(--clr-surface-600)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontSize: '12px', fontWeight: 800 }}>{church.church_name}</div>
                                            <div style={{ fontSize: '10px', color: 'var(--clr-burgundy-400)', fontWeight: 700 }}>UGX {church.balance.toLocaleString()} Owed</div>
                                        </div>
                                        <ArrowUpCircle size={14} className="text-danger opacity-50" />
                                    </div>
                                ))}
                            </>
                        ) : (
                            <div style={{ padding: '20px', textAlign: 'center' }}>
                                <CheckCircle size={24} className="mx-auto mb-2 text-success opacity-50" />
                                <p style={{ fontSize: '11px', fontWeight: 600 }}>Zero debt across all active clubs!</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="panel" style={{ background: 'var(--clr-surface-600)', padding: '20px', borderRadius: '16px', textAlign: 'center' }}>
                    <Download size={32} className="mx-auto mb-3 text-gold-500 opacity-50" />
                    <h5 style={{ margin: 0 }}>Treasury Preferences</h5>
                    <p style={{ fontSize: '11px', color: 'var(--clr-text-muted)', marginTop: '8px' }}>Your account is optimized for high-velocity reconciliation.</p>
                    <button 
                        className="btn btn--secondary btn--sm w-full mt-4"
                        onClick={handlePrint}
                        style={{ width: '100%', justifyContent: 'center' }}
                    >
                        <Printer size={14} className="mr-2" /> Export Audit Log
                    </button>
                </div>
            </div>
        </div>
    );

    const renderAccountability = () => (
        <div className="fade-in">
            <div className="panel p-0">
                <div className="table-responsive">
                <table className="h-table">
                    <thead>
                        <tr>
                            <th style={{ paddingLeft: '24px' }}>Church Club</th>
                            <th>Registrations</th>
                            <th>Target Fees</th>
                            <th>Collections</th>
                            <th style={{ textAlign: 'right', paddingRight: '24px' }}>Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentTreasury?.by_church.map(church => (
                            <tr key={church.church_id}>
                                <td style={{ paddingLeft: '24px' }}>
                                    <div style={{ fontWeight: 800 }}>{church.church_name}</div>
                                    <div style={{ fontSize: '10px', color: 'var(--clr-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        {church.approved_count} Verified / {church.registration_count} Total
                                    </div>
                                </td>
                                <td>
                                    <span className="badge badge--neutral">{church.registration_count} Users</span>
                                </td>
                                <td style={{ fontSize: '13px', fontWeight: 600 }}>UGX {church.expected_revenue.toLocaleString()}</td>
                                <td style={{ fontSize: '13px', fontWeight: 800, color: 'var(--clr-success)' }}>UGX {church.collected_revenue.toLocaleString()}</td>
                                <td style={{ textAlign: 'right', paddingRight: '24px' }}>
                                    <div style={{ fontSize: '14px', fontWeight: 900, color: church.balance > 0 ? 'var(--clr-burgundy-400)' : 'var(--clr-success)' }}>
                                        {church.balance > 0 ? `UGX ${church.balance.toLocaleString()}` : 'PAID'}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            </div>
        </div>
    );

    const renderQueue = () => (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="panel" style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--clr-text-muted)' }} />
                    <input 
                        type="text" 
                        className="h-input" 
                        style={{ paddingLeft: '40px' }} 
                        placeholder="Search by pathfinder or club..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="panel p-0">
                <div className="table-responsive">
                <table className="h-table">
                    <thead>
                        <tr>
                            <th style={{ paddingLeft: '24px' }}>Pathfinder & Club</th>
                            <th>Recorded Amount</th>
                            <th>Verification Status</th>
                            <th style={{ textAlign: 'right', paddingRight: '24px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRegistrations.map(reg => (
                            <tr key={reg.id}>
                                <td style={{ paddingLeft: '24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--clr-surface-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--clr-gold-400)', fontWeight: 900 }}>
                                            {reg.pathfinder?.name[0]}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 800, color: 'var(--clr-text-primary)' }}>{reg.pathfinder?.name}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--clr-text-muted)' }}>{reg.church?.name}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ fontSize: '13px', fontWeight: 900, color: 'var(--clr-text-primary)' }}>
                                        UGX {parseFloat(reg.amount_paid).toLocaleString()}
                                    </div>
                                    {reg.notes && <div style={{ fontSize: '10px', color: 'var(--clr-text-muted)', fontStyle: 'italic' }}>"{reg.notes}"</div>}
                                </td>
                                <td>
                                    {reg.status === 'approved' ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--clr-gold-400)', fontSize: '11px', fontWeight: 900 }}>
                                            <ShieldCheck size={16} /> VERIFIED
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--clr-text-muted)', fontSize: '11px', fontWeight: 700 }}>
                                            <Clock size={16} /> PENDING
                                        </div>
                                    )}
                                </td>
                                <td style={{ textAlign: 'right', paddingRight: '24px' }}>
                                    {reg.status !== 'approved' && (
                                        <button 
                                            onClick={() => handleApprove(reg.id)}
                                            className="btn btn--primary btn--sm"
                                            style={{ padding: '6px 12px', fontSize: '11px' }}
                                        >
                                            <CheckCircle size={14} className="mr-2" /> Verify
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end flex-wrap gap-6">
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--clr-gold-500)', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
                        <Zap size={12} fill="currentColor" /> Financial Command Center
                    </div>
                    <h3 style={{ margin: 0, color: 'var(--clr-text-primary)' }}>District Treasury & Collections</h3>
                    <p style={{ fontSize: '12px', color: 'var(--clr-text-muted)' }}>Financial oversight and event registration verification center.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <select 
                        className="h-select" 
                        style={{ maxWidth: '250px' }}
                        value={selectedEventId}
                        onChange={e => setSelectedEventId(e.target.value)}
                    >
                        {district_events.map(e => (
                            <option key={e.id} value={e.id}>{e.name}</option>
                        ))}
                    </select>
                    <button className="btn btn--secondary btn--sm" onClick={handlePrint}>
                        <Printer size={16} className="mr-2" /> Print Statement
                    </button>
                </div>
            </div>

            {/* Treasury Tabs */}
            <div className="flex flex-wrap gap-4 lg:gap-6 border-b border-white/10 overflow-x-auto pb-px">
                <button 
                    onClick={() => setActiveTab('pulse')}
                    className={`tab ${activeTab === 'pulse' ? 'active' : ''}`}
                    style={{ 
                        padding: '12px 0px', 
                        background: 'none', 
                        border: 'none', 
                        color: activeTab === 'pulse' ? 'var(--clr-gold-500)' : 'var(--clr-text-muted)',
                        borderBottom: `2px solid ${activeTab === 'pulse' ? 'var(--clr-gold-500)' : 'transparent'}`,
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <TrendingUp size={16} /> Financial Pulse
                </button>
                <button 
                    onClick={() => setActiveTab('center')}
                    className={`tab ${activeTab === 'center' ? 'active' : ''}`}
                    style={{ 
                        padding: '12px 0px', 
                        background: 'none', 
                        border: 'none', 
                        color: activeTab === 'center' ? 'var(--clr-gold-500)' : 'var(--clr-text-muted)',
                        borderBottom: `2px solid ${activeTab === 'center' ? 'var(--clr-gold-500)' : 'transparent'}`,
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <Zap size={16} /> Action Center
                </button>
                <button 
                    onClick={() => setActiveTab('accountability')}
                    className={`tab ${activeTab === 'accountability' ? 'active' : ''}`}
                    style={{ 
                        padding: '12px 0px', 
                        background: 'none', 
                        border: 'none', 
                        color: activeTab === 'accountability' ? 'var(--clr-gold-500)' : 'var(--clr-text-muted)',
                        borderBottom: `2px solid ${activeTab === 'accountability' ? 'var(--clr-gold-500)' : 'transparent'}`,
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <Church size={16} /> Club Accountability
                </button>
                <button 
                    onClick={() => setActiveTab('queue')}
                    className={`tab ${activeTab === 'queue' ? 'active' : ''}`}
                    style={{ 
                        padding: '12px 0px', 
                        background: 'none', 
                        border: 'none', 
                        color: activeTab === 'queue' ? 'var(--clr-gold-500)' : 'var(--clr-text-muted)',
                        borderBottom: `2px solid ${activeTab === 'queue' ? 'var(--clr-gold-500)' : 'transparent'}`,
                        fontWeight: 700,
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <ShieldCheck size={16} /> Verification Queue
                </button>
            </div>

            {/* Tab Content */}
            <div style={{ flex: 1 }}>
                {activeTab === 'pulse' && renderPulse()}
                {activeTab === 'center' && renderActionCenter()}
                {activeTab === 'accountability' && renderAccountability()}
                {activeTab === 'queue' && renderQueue()}
            </div>

            {/* Print Only Styles */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    .topbar, .sidebar, .tabs, .btn, .h-select, .search-bar, header.page-header { display: none !important; }
                    .layout-content { padding: 0 !important; margin: 0 !important; }
                    .panel { border: 1px solid #ccc !important; box-shadow: none !important; margin-bottom: 20px !important; }
                    body { background: white !important; color: black !important; }
                    .tab-content { display: block !important; }
                    .fade-in { animation: none !important; opacity: 1 !important; }
                }
            `}} />
        </div>
    );
}
