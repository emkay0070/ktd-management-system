import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { AlertTriangle } from 'lucide-react';

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

            <div className="dashboard-container">
                {renderSection()}
            </div>
        </AuthenticatedLayout>
    );
}
