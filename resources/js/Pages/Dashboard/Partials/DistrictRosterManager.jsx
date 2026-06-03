import { useState, useMemo } from 'react';
import { Users, Search, Filter, Shield, UserCheck, UserX, MapPin, GraduationCap } from 'lucide-react';

export default function DistrictRosterManager({ roster = [] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    const filteredRoster = useMemo(() => {
        return roster.filter(mg => {
            const matchesSearch = mg.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                               mg.church?.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRole = roleFilter === 'all' || mg.role === roleFilter;
            return matchesSearch && matchesRole;
        });
    }, [roster, searchTerm, roleFilter]);

    const stats = useMemo(() => {
        return {
            total: roster.length,
            mg: roster.filter(m => m.role === 'MG').length,
            mgt: roster.filter(m => m.role === 'MGT' || m.role === 'MGiT').length,
            insured: roster.filter(m => m.insured_yearly).length
        };
    }, [roster]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Macro Stats */}
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div className="stat-card stat-card--gray">
                    <div className="stat-icon"><Users size={20} /></div>
                    <div className="stat-value">{stats.total}</div>
                    <div className="stat-label">Total Personnel</div>
                </div>
                <div className="stat-card stat-card--gold">
                    <div className="stat-icon stat-icon--gold"><Shield size={20} /></div>
                    <div className="stat-value">{stats.mg}</div>
                    <div className="stat-label">Invested MGs</div>
                </div>
                <div className="stat-card stat-card--burgundy">
                    <div className="stat-icon stat-icon--burgundy"><GraduationCap size={20} /></div>
                    <div className="stat-value">{stats.mgt}</div>
                    <div className="stat-label">MGs in Training</div>
                </div>
                <div className="stat-card stat-card--success">
                    <div className="stat-icon stat-icon--success"><UserCheck size={20} /></div>
                    <div className="stat-value">{stats.insured}</div>
                    <div className="stat-label">Insured This Year</div>
                </div>
            </div>

            {/* Filters */}
            <div className="panel" style={{ padding: '16px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flexGrow: 1 }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                    <input 
                        type="text" 
                        className="h-input" 
                        placeholder="Search by name or club..." 
                        style={{ paddingLeft: '40px' }}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Filter size={18} style={{ opacity: 0.4 }} />
                    <select className="h-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ width: '160px' }}>
                        <option value="all">All Roles</option>
                        <option value="MG">Master Guide</option>
                        <option value="MGiT">MG in Training</option>
                        <option value="MGT">MGT</option>
                    </select>
                </div>
            </div>

            {/* Roster Table */}
            <div className="panel p-0">
                <div className="table-responsive">
                <table className="h-table">
                    <thead>
                        <tr>
                            <th style={{ paddingLeft: '24px' }}>Name & Role</th>
                            <th>Local Club</th>
                            <th>Assigned Class</th>
                            <th>Insurance</th>
                            <th>Activity</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRoster.map(mg => (
                            <tr key={mg.id}>
                                <td style={{ paddingLeft: '24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ 
                                            width: '36px', height: '36px', borderRadius: '8px', 
                                            background: mg.role === 'MG' ? 'var(--clr-gold-500)' : 'var(--clr-burgundy-500)',
                                            color: mg.role === 'MG' ? '#000' : '#fff',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '11px'
                                        }}>
                                            {mg.role}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 800, color: 'var(--clr-text-primary)' }}>{mg.full_name}</div>
                                            <div style={{ fontSize: '10px', color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                {mg.responsibility || 'Club Member'}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--clr-text-secondary)' }}>
                                        <MapPin size={14} />
                                        {mg.church?.name}
                                    </div>
                                </td>
                                <td>{mg.assigned_class?.name || 'Unassigned'}</td>
                                <td>
                                    {mg.insured_yearly ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--clr-success-400)', fontSize: '12px', fontWeight: 700 }}>
                                            <UserCheck size={14} /> ACTIVE
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--clr-burgundy-400)', fontSize: '12px', fontWeight: 700 }}>
                                            <UserX size={14} /> EXPIRED
                                        </div>
                                    )}
                                </td>
                                <td>
                                    <span className={`badge ${mg.actively_teaching ? 'badge--success' : 'badge--neutral'}`}>
                                        {mg.actively_teaching ? 'Teaching' : 'Active'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {filteredRoster.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ padding: '60px', textAlign: 'center', opacity: 0.5 }}>
                                    <Search size={32} style={{ marginBottom: '12px', opacity: 0.3 }} />
                                    <div style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase' }}>No Personnel Found</div>
                                    <p style={{ fontSize: '12px' }}>Try adjusting your search filters.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                </div>
            </div>
        </div>
    );
}
