import { useState, useMemo } from 'react';
import { Search, Filter, Calendar, Mail, Shield, User, ChevronRight, X, Lock } from 'lucide-react';

export default function GlobalUserManager({ users = [] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                user.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRole = roleFilter === '' || user.roles.some(r => r.name === roleFilter);
            const matchesStatus = statusFilter === '' || user.status === statusFilter;
            
            let matchesDate = true;
            if (dateFilter) {
                const userDate = new Date(user.created_at).toISOString().split('T')[0];
                matchesDate = userDate === dateFilter;
            }

            return matchesSearch && matchesRole && matchesStatus && matchesDate;
        });
    }, [users, searchTerm, roleFilter, statusFilter, dateFilter]);

    // Unique roles for filter
    const allRoles = useMemo(() => {
        const roles = new Set();
        users.forEach(u => u.roles.forEach(r => roles.add(JSON.stringify({name: r.name, display_name: r.display_name}))));
        return Array.from(roles).map(r => JSON.parse(r)).sort((a, b) => a.display_name.localeCompare(b.display_name));
    }, [users]);

    return (
        <div className="space-y-6 fade-in">
            {/* Control Bar */}
            <div className="panel p-4 flex flex-wrap gap-4 items-center bg-surface-800/50">
                <div className="relative flex-1 min-w-[300px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by name or email..." 
                        className="h-input w-full pl-12"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="flex gap-2 shrink-0">
                    <select 
                        className="h-input text-xs font-bold uppercase tracking-wider"
                        value={roleFilter}
                        onChange={e => setRoleFilter(e.target.value)}
                    >
                        <option value="">All Roles</option>
                        {allRoles.map(role => (
                            <option key={role.name} value={role.name}>{role.display_name}</option>
                        ))}
                    </select>

                    <select 
                        className="h-input text-xs font-bold uppercase tracking-wider"
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="pending_onboarding">Pending</option>
                    </select>

                    <div className="relative">
                        <input 
                            type="date" 
                            className="h-input text-xs font-bold uppercase tracking-wider pl-10"
                            value={dateFilter}
                            onChange={e => setDateFilter(e.target.value)}
                        />
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
                        {dateFilter && (
                            <button 
                                onClick={() => setDateFilter('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="panel p-0 overflow-hidden">
                <div className="table-responsive">
                    <table className="h-table">
                        <thead>
                            <tr>
                                <th className="pl-6">User Identity</th>
                                <th>Primary Location</th>
                                <th>Active Roles</th>
                                <th>Registration Date</th>
                                <th>Security</th>
                                <th className="pr-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                                    <td className="pl-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-burgundy-900/40 border border-burgundy-500/20 flex items-center justify-center text-burgundy-400 font-bold shrink-0">
                                                {user.name[0]}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white text-sm">{user.name}</div>
                                                <div className="text-xs text-muted flex items-center gap-1.5 mt-0.5">
                                                    <Mail size={12} />
                                                    {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="text-xs">
                                            <div className="font-bold text-gray-300">{user.church}</div>
                                            <div className="text-[10px] text-muted uppercase tracking-widest mt-0.5">{user.district}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex flex-wrap gap-1.5">
                                            {user.roles.map((role, idx) => (
                                                <span 
                                                    key={idx} 
                                                    className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${
                                                        role.status === 'active' 
                                                            ? 'bg-gold-500/10 text-gold-500 border-gold-500/20' 
                                                            : 'bg-white/5 text-muted border-white/10'
                                                    }`}
                                                >
                                                    {role.display_name}
                                                </span>
                                            ))}
                                            {user.roles.length === 0 && <span className="text-muted text-[10px] italic">No roles</span>}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="text-xs text-gray-400 font-medium">
                                            {new Date(user.created_at).toLocaleDateString('en-GB', { 
                                                day: '2-digit', 
                                                month: 'short', 
                                                year: 'numeric' 
                                            })}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-success-500/70">
                                            <Lock size={12} />
                                            {user.password_status}
                                        </div>
                                    </td>
                                    <td className="pr-6 text-right">
                                        <button className="action-btn">
                                            <ChevronRight size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center text-muted italic">
                                        No users found matching your search criteria.
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
