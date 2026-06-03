import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Map, Users, Shield, BookOpen, Layers, Calendar, Trophy, Megaphone, ClipboardCheck, Activity, Tent, Check, X, ChevronDown, ChevronUp, Church } from 'lucide-react';
import { useState } from 'react';

function VerifyChurchAction({ church }) {
    const { post, processing } = useForm({});
    return (
        <div className="flex items-center gap-2">
            <button disabled={processing} onClick={() => post(route('verification.churches.approve', church.id))} className="btn btn--sm bg-green-600/20 text-green-400 border border-green-600/30 hover:bg-green-600/40 disabled:opacity-50">
                <Check size={13} className="mr-1" /> Approve
            </button>
            <button disabled={processing} onClick={() => post(route('verification.churches.reject', church.id))} className="btn btn--sm bg-danger-500/10 text-danger-400 border border-danger-500/20 hover:bg-danger-500/20 disabled:opacity-50">
                <X size={13} className="mr-1" /> Reject
            </button>
        </div>
    );
}

function VerifyRoleAction({ user }) {
    const { post, processing } = useForm({});
    return (
        <div className="flex items-center gap-2">
            <button disabled={processing} onClick={() => post(route('verification.roles.approve', user.id))} className="btn btn--sm bg-green-600/20 text-green-400 border border-green-600/30 hover:bg-green-600/40 disabled:opacity-50">
                <Check size={13} className="mr-1" /> Approve
            </button>
            <button disabled={processing} onClick={() => post(route('verification.roles.reject', user.id))} className="btn btn--sm bg-danger-500/10 text-danger-400 border border-danger-500/20 hover:bg-danger-500/20 disabled:opacity-50">
                <X size={13} className="mr-1" /> Reject
            </button>
        </div>
    );
}

import ClubsDirectory from './Partials/ClubsDirectory';
import DistrictCommitteeManager from './Partials/DistrictCommitteeManager';
import DistrictEventsManager from './Partials/DistrictEventsManager';
import DistrictTasksManager from './Partials/DistrictTasksManager';
import DistrictRosterManager from './Partials/DistrictRosterManager';
import DistrictResourceManager from './Partials/DistrictResourceManager';
import DistrictBulletinManager from './Partials/DistrictBulletinManager';
import DistrictAppraisalManager from './Partials/DistrictAppraisalManager';
import DistrictPulseView from './Partials/DistrictPulseView';
import DistrictRegistrationManager from './Partials/DistrictRegistrationManager';

export default function District({ auth, district, churches, committee, events, tasks, roster, resources, bulletins, appraisals, registrations, analytics, leaderboard, treasury, section, invite_links, pending_churches = [], pending_approvals = [] }) {
    const [showChurchQueue, setShowChurchQueue] = useState(false);
    const [showRoleQueue, setShowRoleQueue] = useState(false);
    const actionCount = pending_churches.length + pending_approvals.length;
    
    const userRoleNames = auth.user.role_names || [];
    const hasRole = (r) => userRoleNames.includes(r);
    
    const isClubs = section === 'clubs' || section === 'overview';
    const isCommittee = section === 'committee';
    const isEvents = section === 'events';
    const isTasks = section === 'missions';
    const isRoster = section === 'roster';
    const isResources = section === 'resources';
    const isBulletins = section === 'bulletins';
    const isAppraisals = section === 'appraisals';
    const isPulse = section === 'pulse';
    const isRegistration = section === 'camp_registrations';

    const totalPathfinders = churches.reduce((sum, c) => sum + (c.total ?? 0), 0);
    const totalMGs = churches.reduce((sum, c) => sum + (c.master_guides ?? 0), 0);
    const activeClubs = churches.filter(c => c.status === 'active').length;

    const isTreasuryOnly = hasRole('district_treasurer') && !hasRole('district_director') && !hasRole('super_admin');

    return (
        <AuthenticatedLayout header="District Command Centre" breadcrumb={`${district.name} → Home`}>
            <Head title={`District: ${district.name}`} />

            <div className="layout-content">
                {isClubs && (
                    <header className="page-header relative overflow-hidden p-8 rounded-2xl mb-8 bg-surface-800 border border-white/5">
                        {/* Decorative map elements */}
                        <div className="absolute right-0 top-0 opacity-5 pointer-events-none">
                            <Map size={400} />
                        </div>
                    
                    <div className="relative z-10 flex flex-wrap justify-between items-center gap-6">
                        <div className="flex items-center gap-6">
                            <div className="bg-gradient-to-br from-gold-500 to-gold-600 w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-2xl border border-gold-400/40">
                                <Layers size={40} className="text-black" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black text-white leading-tight tracking-tight uppercase">{district.name}</h1>
                                <p className="text-xs font-black uppercase tracking-[0.3em] text-gold-500/80 mt-1">{district.conference}</p>
                            </div>
                        </div>

                        <div className="flex gap-8 items-center bg-white/5 p-6 rounded-2xl border border-white/5">
                            <div className="text-right">
                                <div className="text-3xl font-black text-white">{activeClubs} <span className="text-lg text-gray-500 font-medium">/ {churches.length}</span></div>
                                <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Clubs</div>
                            </div>
                            <div className="h-10 w-px bg-white/10"></div>
                            <div className="text-right">
                                <div className="text-3xl font-black text-gold-500">{totalPathfinders}</div>
                                <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Members</div>
                            </div>
                            <div className="h-10 w-px bg-white/10"></div>
                            <div className="text-right">
                                <div className="text-3xl font-black text-burgundy-400">{totalMGs}</div>
                                <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Leaders</div>
                            </div>
                        </div>
                    </div>
                    </header>
                )}

                {isClubs && actionCount > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        {pending_churches.length > 0 && (
                            <div className="space-y-2">
                                <div className="alert alert--warning flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Church size={18} className="text-warning-500" />
                                        <span><strong>{pending_churches.length} New Church Application{pending_churches.length > 1 ? 's' : ''}</strong> waiting for verification.</span>
                                    </div>
                                    <button onClick={() => setShowChurchQueue(v => !v)} className="btn btn--white btn--sm font-bold flex items-center gap-1">
                                        {showChurchQueue ? 'Hide' : 'Verify Now'}
                                        {showChurchQueue ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                                    </button>
                                </div>
                                {showChurchQueue && (
                                    <div className="bg-surface-800 border border-warning-500/20 rounded-2xl overflow-hidden fade-in divide-y divide-white/5">
                                        {pending_churches.map(church => (
                                            <div key={church.id} className="flex items-center justify-between px-5 py-3">
                                                <div>
                                                    <div className="font-bold text-white text-sm">{church.name}</div>
                                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest">{church.location ?? 'No location'}</div>
                                                </div>
                                                <VerifyChurchAction church={church} />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        {pending_approvals.length > 0 && (
                            <div className="space-y-2">
                                <div className="alert alert--info flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Shield size={18} className="text-info-500" />
                                        <span><strong>{pending_approvals.length} Leader Credential{pending_approvals.length > 1 ? 's' : ''}</strong> waiting for approval.</span>
                                    </div>
                                    <button onClick={() => setShowRoleQueue(v => !v)} className="btn btn--white btn--sm font-bold flex items-center gap-1">
                                        {showRoleQueue ? 'Hide' : 'Review'}
                                        {showRoleQueue ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                                    </button>
                                </div>
                                {showRoleQueue && (
                                    <div className="bg-surface-800 border border-info-500/20 rounded-2xl overflow-hidden fade-in divide-y divide-white/5">
                                        {pending_approvals.map(user => (
                                            <div key={user.id} className="flex items-center justify-between px-5 py-3">
                                                <div>
                                                    <div className="font-bold text-white text-sm">
                                                        {user.name}
                                                        {user.district && <span className="ml-2 text-xs text-gold-500 font-normal">({user.district.name})</span>}
                                                        {user.church && <span className="ml-2 text-xs text-burgundy-400 font-normal">({user.church.name})</span>}
                                                    </div>
                                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest">
                                                        {user.roles?.filter(r => r.pivot?.status === 'pending').map(r => r.display_name ?? r.name).join(', ')}
                                                    </div>
                                                </div>
                                                <VerifyRoleAction user={user} />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                <div className="page-content bg-transparent shadow-none border-none p-0">
                    {isClubs && <ClubsDirectory churches={churches} readonly={!hasRole('district_director')} />}
                    {isCommittee && <DistrictCommitteeManager committee={committee} invite_links={invite_links} readonly={!hasRole('district_director')} />}
                    {isEvents && <DistrictEventsManager events={events} readonly={!hasRole('district_director')} />}
                    {isTasks && <DistrictTasksManager tasks={tasks} leaderboard={leaderboard} readonly={!hasRole('district_director')} />}
                    {isRoster && <DistrictRosterManager roster={roster} />}
                    {isResources && <DistrictResourceManager resources={resources} readonly={!hasRole('district_director')} />}
                    {isBulletins && <DistrictBulletinManager bulletins={bulletins} />}
                    {isAppraisals && <DistrictAppraisalManager churches={churches} appraisals={appraisals} />}
                    {isPulse && <DistrictPulseView analytics={analytics} />}
                    {isRegistration && <DistrictRegistrationManager registrations={registrations} district_events={events} treasury={treasury} />}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
