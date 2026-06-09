import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Map, Users, Shield, BookOpen, Layers, Calendar, Trophy, Megaphone, ClipboardCheck, Activity, Tent, Check, X, ChevronDown, ChevronUp, Church } from 'lucide-react';
import { useState } from 'react';

import ClubsDirectory from './Partials/ClubsDirectory';
import ApprovalCenter from './Partials/ApprovalCenter';
import DistrictCommitteeManager from './Partials/DistrictCommitteeManager';
import DistrictEventsManager from './Partials/DistrictEventsManager';
import DistrictTasksManager from './Partials/DistrictTasksManager';
import DistrictRosterManager from './Partials/DistrictRosterManager';
import DistrictResourceManager from './Partials/DistrictResourceManager';
import DistrictBulletinManager from './Partials/DistrictBulletinManager';
import DistrictWelfareManager from './Partials/DistrictWelfareManager';
import DistrictPulseView from './Partials/DistrictPulseView';
import DistrictRegistrationManager from './Partials/DistrictRegistrationManager';
import DistrictCurriculumManager from './Partials/DistrictCurriculumManager';
import MasterGuideManager from './Partials/MasterGuideManager';

export default function District({ 
    auth, 
    district = {}, 
    churches = [], 
    committee = [], 
    events = [], 
    tasks = [], 
    roster = [], 
    resources = [], 
    bulletins = [], 
    appraisals = [], 
    registrations = [], 
    analytics = {}, 
    leaderboard = [], 
    treasury = [], 
    section = 'overview', 
    invite_links = {}, 
    pending_churches = [], 
    pending_approvals = [], 
    permissions = {}, 
    curriculum_stats = [], 
    investiture_candidates = [], 
    curriculum_standards = [], 
    welfare_cases = [], 
    social_events = [], 
    retention_metrics = { inactive_members: [], declining_clubs: [] } 
}) {
    const userRoleNames = auth.user.role_names || [];
    const hasRole = (r) => userRoleNames.includes(r);
    
    const isClubs = section === 'clubs' || section === 'overview';
    const isCommittee = section === 'committee';
    const isEvents = section === 'events';
    const isTasks = section === 'missions';
    const isRoster = section === 'roster';
    const isResources = section === 'resources';
    const isBulletins = section === 'bulletins';
    const isWelfare = section === 'welfare' || section === 'appraisals';
    const isPulse = section === 'pulse';
    const isRegistration = section === 'camp_registrations';
    const isCurriculum = section === 'curriculum';
    const isMasterGuide = section === 'masterguide';

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

                {section === 'overview' && (
                    <div className="space-y-6 mb-10">
                        <ApprovalCenter 
                            pending_approvals={pending_approvals} 
                            pending_churches={pending_churches} 
                            level="district"
                        />
                    </div>
                )}

                <div className="page-content bg-transparent shadow-none border-none p-0">
                    {isClubs && <ClubsDirectory churches={churches} readonly={!permissions?.view_all} />}
                    {isCommittee && <DistrictCommitteeManager committee={committee} invite_links={invite_links} readonly={!permissions?.view_all} />}
                    {isEvents && <DistrictEventsManager events={events} canEdit={permissions?.edit_programs} canPublish={permissions?.publish_programs} canDelete={permissions?.delete_programs} />}
                    {isTasks && <DistrictTasksManager tasks={tasks} leaderboard={leaderboard} canEdit={permissions?.edit_programs} canPublish={permissions?.publish_programs} canDelete={permissions?.delete_programs} />}
                    {isRoster && <DistrictRosterManager roster={roster} />}
                    {isResources && <DistrictResourceManager resources={resources} readonly={!permissions?.view_all} />}
                    {isBulletins && <DistrictBulletinManager bulletins={bulletins} canEdit={permissions?.edit_communication} canPublish={permissions?.publish_communication} canDelete={permissions?.delete_communication} auth={auth} />}
                    {isWelfare && <DistrictWelfareManager 
                        churches={churches} 
                        appraisals={appraisals} 
                        welfare_cases={welfare_cases} 
                        social_events={social_events} 
                        retention_metrics={retention_metrics} 
                        readonly={!permissions?.edit_welfare} 
                        auth={auth} 
                    />}
                    {isPulse && <DistrictPulseView analytics={analytics} />}
                    {isRegistration && <DistrictRegistrationManager registrations={registrations} district_events={events} treasury={treasury} readonly={!permissions?.edit_programs} />}
                    {isCurriculum && <DistrictCurriculumManager 
                        curriculum_stats={curriculum_stats} 
                        investiture_candidates={investiture_candidates} 
                        curriculum_standards={curriculum_standards} 
                        district_resources={resources}
                        district_bulletins={bulletins}
                        district_events={events}
                        readonly={!permissions?.edit_curriculum} 
                        auth={auth} 
                    />}
                    {isMasterGuide && <MasterGuideManager master_guides={roster} readonly={!permissions?.edit_masterguide} />}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
