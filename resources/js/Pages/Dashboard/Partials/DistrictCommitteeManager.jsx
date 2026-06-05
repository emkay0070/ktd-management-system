import { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Shield, Plus, Mail, Check, AlertTriangle, Users, Trash2, Copy, Link as LinkIcon } from 'lucide-react';

export default function DistrictCommitteeManager({ committee, invite_links, readonly }) {
    const [view, setView] = useState('list');
    const [copiedLink, setCopiedLink] = useState(null);

    const handleCopy = (role, link) => {
        navigator.clipboard.writeText(link);
        setCopiedLink(role);
        setTimeout(() => setCopiedLink(null), 2000);
    };



    const handleDelete = (member) => {
        if (confirm(`Are you sure you want to remove ${member.name} from the District Committee?`)) {
            router.delete(route('district_committee.destroy', member.id));
        }
    };

    const formatRoleName = (role) => {
        if (!role) return 'Committee Member';
        if (role === 'district_director') return 'District Director';
        if (role === 'district_secretary') return 'District Secretary';
        if (role === 'district_treasurer') return 'District Treasurer';
        if (role === 'district_curriculum_coordinator') return 'Curriculum Coordinator';
        if (role === 'district_masterguide_coordinator') return 'Master Guide Coordinator';
        if (role === 'district_communication_coordinator') return 'Communication Coordinator';
        if (role === 'district_music_coordinator') return 'Music Coordinator';
        if (role === 'district_welfare_coordinator') return 'Welfare Coordinator';
        if (role === 'district_pbe_coordinator') return 'PBE Coordinator';
        if (role === 'district_programs_coordinator') return 'Programs Coordinator';
        return 'Committee Member';
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
                        <LinkIcon size={16} className="mr-2" /> Invite Member
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
                                                <div style={{ width: '40px', height: '40px', background: 'var(--clr-surface-700)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--clr-text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', flexShrink: 0, fontWeight: 700, overflow: 'hidden' }}>
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
                                                    {formatRoleName(member.roles ? member.roles[0] : member.role)}
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
                            <h3>Invite Executive Member</h3>
                            <p>Generate secure invitation links for your district committee. When they accept, they will automatically be assigned their role in your district.</p>
                        </div>
                    </div>
                    <div className="panel__body">
                        <div className="grid grid-cols-1 gap-4">
                            {[
                                { id: 'secretary', name: 'District Secretary', link: invite_links?.secretary },
                                { id: 'treasurer', name: 'District Treasurer', link: invite_links?.treasurer },
                                { id: 'curriculum', name: 'Curriculum Coordinator', link: invite_links?.curriculum },
                                { id: 'masterguide', name: 'Master Guide Coordinator', link: invite_links?.masterguide },
                                { id: 'communication', name: 'Communication Coordinator', link: invite_links?.communication },
                                { id: 'music', name: 'Music Coordinator', link: invite_links?.music },
                                { id: 'welfare', name: 'Welfare Coordinator', link: invite_links?.welfare },
                                { id: 'pbe', name: 'PBE Coordinator', link: invite_links?.pbe },
                                { id: 'programs', name: 'Programs Coordinator', link: invite_links?.programs },
                                { id: 'committee', name: 'General Committee Member', link: invite_links?.committee },
                            ].map(role => (
                                <div key={role.id} className="flex items-center justify-between p-4 bg-surface-800 border border-white/10 rounded-xl">
                                    <div>
                                        <div className="font-bold text-white mb-1">{role.name}</div>
                                        <div className="text-xs text-gray-500 font-mono break-all max-w-md truncate">{role.link}</div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleCopy(role.id, role.link)}
                                        className={`btn btn--sm flex-shrink-0 ml-4 ${copiedLink === role.id ? 'bg-green-600/20 text-green-400 border-green-600/30' : 'btn--outline'}`}
                                    >
                                        {copiedLink === role.id ? (
                                            <><Check size={14} className="mr-2" /> Copied!</>
                                        ) : (
                                            <><Copy size={14} className="mr-2" /> Copy Link</>
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
