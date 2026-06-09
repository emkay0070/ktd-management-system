import { useState, useMemo } from 'react';
import { Users, Search, Filter, Shield, UserCheck, UserX, MapPin, GraduationCap, Star, User } from 'lucide-react';

export default function DistrictRosterManager({ roster = { pathfinders: [], master_guides: [], mgt: [] } }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('pathfinders'); // pathfinders, master_guides, mgt

    const currentRoster = roster[activeTab] || [];

    const filteredRoster = useMemo(() => {
        return currentRoster.filter(person => {
            const matchesSearch = (person.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                               (person.church || '').toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSearch;
        });
    }, [currentRoster, searchTerm]);

    const stats = useMemo(() => {
        return {
            pathfinders: roster.pathfinders?.length || 0,
            mg: roster.master_guides?.length || 0,
            mgt: roster.mgt?.length || 0,
        };
    }, [roster]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Macro Stats */}
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div 
                    className={`stat-card cursor-pointer transition-all ${activeTab === 'pathfinders' ? 'stat-card--active border-2 border-gold-500' : 'stat-card--gray'}`}
                    onClick={() => setActiveTab('pathfinders')}
                >
                    <div className="stat-icon"><Users size={20} /></div>
                    <div className="stat-value">{stats.pathfinders}</div>
                    <div className="stat-label">Pathfinders</div>
                </div>
                <div 
                    className={`stat-card cursor-pointer transition-all ${activeTab === 'master_guides' ? 'stat-card--active border-2 border-gold-500' : 'stat-card--gold'}`}
                    onClick={() => setActiveTab('master_guides')}
                >
                    <div className="stat-icon stat-icon--gold"><Shield size={20} /></div>
                    <div className="stat-value">{stats.mg}</div>
                    <div className="stat-label">Invested MGs</div>
                </div>
                <div 
                    className={`stat-card cursor-pointer transition-all ${activeTab === 'mgt' ? 'stat-card--active border-2 border-gold-500' : 'stat-card--burgundy'}`}
                    onClick={() => setActiveTab('mgt')}
                >
                    <div className="stat-icon stat-icon--burgundy"><GraduationCap size={20} /></div>
                    <div className="stat-value">{stats.mgt}</div>
                    <div className="stat-label">MGs in Training</div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-4 p-1 bg-surface-800/50 rounded-xl border border-white/5 w-fit">
                <button 
                    onClick={() => setActiveTab('pathfinders')}
                    className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'pathfinders' ? 'bg-gold-500 text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                    <Users size={14} /> Pathfinders
                </button>
                <button 
                    onClick={() => setActiveTab('master_guides')}
                    className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'master_guides' ? 'bg-gold-500 text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                    <Shield size={14} /> Master Guides
                </button>
                <button 
                    onClick={() => setActiveTab('mgt')}
                    className={`px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'mgt' ? 'bg-gold-500 text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                    <GraduationCap size={14} /> MGTs
                </button>
            </div>

            {/* Filters */}
            <div className="panel" style={{ padding: '16px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flexGrow: 1 }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                    <input 
                        type="text" 
                        className="h-input" 
                        placeholder={`Search ${activeTab.replace('_', ' ')} by name or club...`} 
                        style={{ paddingLeft: '40px' }}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Roster Table */}
            <div className="panel p-0">
                <div className="table-responsive">
                <table className="h-table">
                    <thead>
                        {activeTab === 'pathfinders' ? (
                            <tr>
                                <th style={{ paddingLeft: '24px' }}>Pathfinder Name</th>
                                <th>Local Club</th>
                                <th>Current Class</th>
                                <th>Gender</th>
                                <th>Age</th>
                                <th>Status</th>
                            </tr>
                        ) : (
                            <tr>
                                <th style={{ paddingLeft: '24px' }}>Name & Role</th>
                                <th>Local Club</th>
                                <th>Assigned Class</th>
                                <th>Insurance</th>
                                <th>Activity</th>
                            </tr>
                        )}
                    </thead>
                    <tbody>
                        {filteredRoster.map(person => (
                            <tr key={`${activeTab}-${person.id}`}>
                                <td style={{ paddingLeft: '24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ 
                                            width: '36px', height: '36px', borderRadius: '8px', 
                                            background: activeTab === 'pathfinders' ? 'var(--clr-primary-500)' : (activeTab === 'master_guides' ? 'var(--clr-gold-500)' : 'var(--clr-burgundy-500)'),
                                            color: (activeTab === 'pathfinders' || activeTab === 'master_guides') ? '#000' : '#fff',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '11px'
                                        }}>
                                            {activeTab === 'pathfinders' ? <User size={16} /> : (activeTab === 'master_guides' ? 'MG' : 'MGT')}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 800, color: 'var(--clr-text-primary)' }}>{person.name}</div>
                                            <div style={{ fontSize: '10px', color: 'var(--clr-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                {person.responsibility || (activeTab === 'pathfinders' ? 'Pathfinder' : 'Club Staff')}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--clr-text-secondary)' }}>
                                        <MapPin size={14} />
                                        {person.church}
                                    </div>
                                </td>
                                <td>{person.class || 'Unassigned'}</td>
                                {activeTab === 'pathfinders' ? (
                                    <>
                                        <td>{person.gender}</td>
                                        <td>{person.age} yrs</td>
                                        <td>
                                            <span className="badge badge--success">Active</span>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td>
                                            {person.insured ? (
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
                                            <span className={`badge ${person.teaching ? 'badge--success' : 'badge--neutral'}`}>
                                                {person.teaching ? 'Teaching' : 'Active'}
                                            </span>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                        {filteredRoster.length === 0 && (
                            <tr>
                                <td colSpan={6} style={{ padding: '60px', textAlign: 'center', opacity: 0.5 }}>
                                    <Search size={32} style={{ marginBottom: '12px', opacity: 0.3 }} />
                                    <div style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase' }}>No personnel found</div>
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

