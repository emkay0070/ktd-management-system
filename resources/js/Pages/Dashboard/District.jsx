import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Map, Users, Shield, BookOpen, Layers, Calendar, Trophy, Megaphone, ClipboardCheck, Activity, Tent } from 'lucide-react';
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

export default function District({ auth, district, churches, committee, events, tasks, roster, resources, bulletins, appraisals, registrations, analytics, leaderboard, treasury, section, invite_links }) {
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
                <header className="page-header relative overflow-hidden p-8 rounded-2xl mb-8 bg-surface-800 border border-white/5">
                    {/* Decorative map elements */}
                    <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
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

                <div className="tabs flex gap-2 border-b border-white/10 mb-8 overflow-x-auto no-scrollbar">
                    <Link 
                        href={route('dashboard', 'overview')}
                        className={`tab-item ${isClubs ? 'tab-item--active' : ''}`}
                    >
                        <Shield size={16} /> Clubs
                    </Link>
                    
                    {!isTreasuryOnly && (
                        <>
                            <Link 
                                href={route('dashboard', 'committee')}
                                className={`tab-item ${isCommittee ? 'tab-item--active' : ''}`}
                            >
                                <Users size={16} /> Committee
                            </Link>
                            <Link 
                                href={route('dashboard', 'roster')}
                                className={`tab-item ${isRoster ? 'tab-item--active' : ''}`}
                            >
                                <Users size={16} /> Registry
                            </Link>
                        </>
                    )}

                    <Link 
                        href={route('dashboard', 'camp_registrations')}
                        className={`tab-item ${isRegistration ? 'tab-item--active' : ''}`}
                    >
                        <Tent size={16} /> Treasury
                    </Link>

                    <Link 
                        href={route('dashboard', 'events')}
                        className={`tab-item ${isEvents ? 'tab-item--active' : ''}`}
                    >
                        <Calendar size={16} /> Events
                    </Link>

                    {!isTreasuryOnly && (
                        <>
                            <Link 
                                href={route('dashboard', 'missions')}
                                className={`tab-item ${isTasks ? 'tab-item--active' : ''}`}
                            >
                                <Trophy size={16} /> Missions
                            </Link>
                            <Link 
                                href={route('dashboard', 'appraisals')}
                                className={`tab-item ${isAppraisals ? 'tab-item--active' : ''}`}
                            >
                                <ClipboardCheck size={16} /> Appraisals
                            </Link>
                            <Link 
                                href={route('dashboard', 'pulse')}
                                className={`tab-item ${isPulse ? 'tab-item--active' : ''}`}
                            >
                                <Activity size={16} /> Pulse
                            </Link>
                        </>
                    )}

                    <Link 
                        href={route('dashboard', 'bulletins')}
                        className={`tab-item ${isBulletins ? 'tab-item--active' : ''}`}
                    >
                        <Megaphone size={16} /> Bulletins
                    </Link>
                </div>

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
