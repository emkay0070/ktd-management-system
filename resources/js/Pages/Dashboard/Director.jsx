import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { AlertTriangle, Tent, Users, GraduationCap } from 'lucide-react';

// Sub-components
import DirectorOverview from './Partials/DirectorOverview';
import PathfinderManager from './Partials/PathfinderManager';
import MasterGuideManager from './Partials/MasterGuideManager';
import UnitManager from './Partials/UnitManager';
import AttendanceManager from './Partials/AttendanceManager';
import LeadershipManager from './Partials/LeadershipManager';
import OperationsManager from './Partials/OperationsManager';
import ClubTasksManager from './Partials/ClubTasksManager';
import ClubResourcesView from './Partials/ClubResourcesView';
import RegistrationPortal from './Partials/RegistrationPortal';
import ParentLinkManager from './Partials/ParentLinkManager';

export default function Director({ club, registrations = [], district_events = [], district_tasks = [], district_resources = [], district_bulletins = [], parent_link_requests = [], parents = [], section = 'overview', readonly = false }) {
    const { flash } = usePage().props;

    if (!club) {
        return (
            <AuthenticatedLayout header="Club Command Center" breadcrumb="Director → Unassigned">
                <Head title="Club Command Center" />
                <div className="panel">
                    <div className="panel__header">
                        <div>
                            <h3>No church assigned</h3>
                            <p>Ask the District Admin to assign your account to a church/club.</p>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    const {
        church,
        overview,
        classes,
        units,
        master_guides,
        mg_training,
        committees,
        derived_pathfinder_committee,
        operations,
        picklists,
        pathfinders,
    } = club;

    const renderSection = () => {
        switch (section) {
            case 'overview':
                return <DirectorOverview overview={overview} units={units} district_events={district_events} />;
            case 'pathfinders':
                return <PathfinderManager pathfinders={pathfinders} units={units} picklists={picklists} readonly={readonly} />;
            case 'units':
                return <UnitManager units={units} picklists={picklists} readonly={readonly} />;
            case 'leaders':
                return <MasterGuideManager master_guides={master_guides} mg_training={mg_training} picklists={picklists} readonly={readonly} committees={committees} classes={classes} derived_pathfinder_committee={derived_pathfinder_committee} />;
            case 'attendance':
                return <AttendanceManager club={club} readonly={readonly} />;
            case 'leadership':
                return <LeadershipManager classes={classes} committees={committees} derived_pathfinder_committee={derived_pathfinder_committee} picklists={picklists} readonly={readonly} />;
            case 'operations':
                return <OperationsManager church={church} operations={operations} picklists={picklists} readonly={readonly} />;
            case 'missions':
                return <ClubTasksManager tasks={district_tasks} readonly={readonly} />;
            case 'resources':
                return <ClubResourcesView resources={district_resources} />;
            case 'camp_portal':
                return <RegistrationPortal pathfinders={pathfinders} registrations={registrations} district_events={district_events} />;
            case 'parents':
                return <ParentLinkManager requests={parent_link_requests} parents={parents} pathfinders={pathfinders} readonly={readonly} />;
            default:
                return <DirectorOverview overview={overview} units={units} district_events={district_events} />;
        }
    };

    const sectionTitleMap = {
        overview: 'Dashboard Overview',
        pathfinders: 'Pathfinder Management',
        units: 'Unit Management',
        leaders: 'Master Guides & Training',
        attendance: 'Attendance Tracking',
        leadership: 'Club Leadership',
        operations: 'Operations & Settings',
        parents: 'Parent Accounts & Links',
    };

    return (
        <AuthenticatedLayout
            header={sectionTitleMap[section] || 'Club Command Center'}
            breadcrumb={`${readonly ? 'District Admin' : 'Director'} → ${church.name}`}
        >
            <Head title={`${sectionTitleMap[section] || 'Dashboard'} — EmPFC`} />

            {flash?.message && (
                <div className="alert alert--success" style={{ marginBottom: '16px' }}>
                    {flash.message}
                </div>
            )}

            {readonly && (
                <div className="alert alert--warning" style={{ marginBottom: '16px' }}>
                    <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span>This view is read-only for District Admin.</span>
                </div>
            )}

            <div className="layout-content">
                {section === 'overview' && (
                    <header className="page-header relative overflow-hidden p-8 rounded-2xl mb-8 bg-surface-800 border border-white/5" style={{ background: 'linear-gradient(135deg, var(--clr-blue-700), var(--clr-blue-900))' }}>
                        {/* Decorative field elements */}
                        <div className="absolute right-0 top-0 opacity-5 pointer-events-none" style={{ transform: 'translate(20%, -20%)' }}>
                            <Tent size={400} />
                        </div>
                    
                        <div className="relative z-10 flex flex-wrap justify-between items-center gap-6">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-2xl border border-white/20" style={{ background: 'linear-gradient(135deg, var(--clr-blue-400), var(--clr-blue-600))' }}>
                                    <Tent size={40} className="text-white" />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-black text-white leading-tight tracking-tight uppercase">{church.name}</h1>
                                    <p className="text-xs font-black uppercase tracking-[0.3em] mt-1" style={{ color: 'var(--clr-cyan-400)' }}>Local Club Operations</p>
                                </div>
                            </div>

                            <div className="flex gap-8 items-center bg-white/5 p-6 rounded-2xl border border-white/5 backdrop-blur-sm">
                                <div className="text-right">
                                    <div className="text-3xl font-black text-white">{overview?.total_pathfinders ?? 0}</div>
                                    <div className="text-[10px] text-blue-200 font-black uppercase tracking-widest mt-1">Pathfinders</div>
                                </div>
                                <div className="h-10 w-px bg-white/10"></div>
                                <div className="text-right">
                                    <div className="text-3xl font-black" style={{ color: 'var(--clr-cyan-400)' }}>{overview?.master_guides?.total ?? 0}</div>
                                    <div className="text-[10px] text-blue-200 font-black uppercase tracking-widest mt-1">Staff & Guides</div>
                                </div>
                            </div>
                        </div>
                    </header>
                )}

                <div className="dashboard-container">
                    {renderSection()}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
