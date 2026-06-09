import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { 
    LayoutDashboard, 
    GraduationCap, 
    Users, 
    Shield, 
    BookOpen, 
    ClipboardCheck, 
    Trophy, 
    Calendar,
    FileText,
    Star,
    CheckCircle2,
    Clock,
    Library
} from 'lucide-react';
import InstructorWorkspace from './Partials/InstructorWorkspace';
import OversightModule from './Partials/OversightModule';
import PersonalGrowth from './Partials/PersonalGrowth';
import CounselorModule from './Partials/CounselorModule';

export default function LeadershipDashboard({ 
    section, 
    personal, 
    modules, 
    district, 
    church 
}) {
    const [activeTab, setActiveTab] = useState('overview');

    const hasInstructor = !!modules.instructor;
    const hasCounselor = !!modules.counselor;
    const hasOversight = !!modules.oversight;

    return (
        <AuthenticatedLayout 
            header="Leadership Portal" 
            breadcrumb={`Leadership → ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
        >
            <Head title="Leadership Dashboard — EmPFC" />

            <div className="space-y-8">
                {/* Unified Header */}
                <div className="panel bg-gradient-to-br from-burgundy-900/40 via-surface-800 to-surface-800 border-burgundy-500/20">
                    <div className="panel__body flex flex-col md:flex-row items-center gap-8 p-8">
                        <div className="relative">
                            <div className="h-24 w-24 rounded-2xl bg-burgundy-500 flex items-center justify-center text-white border-4 border-white/5 shadow-2xl relative z-10 font-black text-4xl">
                                {personal.profile?.avatar_url ? (
                                    <img src={personal.profile.avatar_url} className="h-full w-full object-cover" />
                                ) : (
                                    personal.profile?.full_name?.substring(0, 1) || '?'
                                )}
                            </div>
                            {personal.is_mg && (
                                <div className="absolute -bottom-2 -right-2 bg-gold-500 text-burgundy-900 p-1.5 rounded-lg shadow-xl z-20">
                                    <Star size={16} fill="currentColor" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl font-black text-white mb-1 uppercase tracking-tight">
                                {personal.profile?.full_name || 'Ministry Leader'}
                            </h1>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3">
                                <div className="flex items-center gap-2 text-gold-400 font-bold uppercase tracking-widest text-[11px]">
                                    <GraduationCap size={16} /> 
                                    {personal.is_mg ? 'Invested Master Guide' : personal.is_mgt ? 'Master Guide in Training' : 'Club Staff'}
                                </div>
                                <div className="h-1 w-1 bg-white/20 rounded-full hidden md:block"></div>
                                <div className="flex items-center gap-2 text-gray-500 font-bold uppercase tracking-widest text-[11px]">
                                    <Users size={16} /> {church?.name || 'Local Club'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="px-8 pb-0 border-t border-white/5 flex flex-wrap gap-1">
                        <TabButton 
                            active={activeTab === 'overview'} 
                            onClick={() => setActiveTab('overview')}
                            icon={<LayoutDashboard size={18} />}
                            label="Overview"
                        />
                        {hasInstructor && (
                            <TabButton 
                                active={activeTab === 'instructor'} 
                                onClick={() => setActiveTab('instructor')}
                                icon={<GraduationCap size={18} />}
                                label="My Class"
                            />
                        )}
                        {hasCounselor && (
                            <TabButton 
                                active={activeTab === 'counselor'} 
                                onClick={() => setActiveTab('counselor')}
                                icon={<Users size={18} />}
                                label="My Unit"
                            />
                        )}
                        {hasOversight && (
                            <TabButton 
                                active={activeTab === 'oversight'} 
                                onClick={() => setActiveTab('oversight')}
                                icon={<Shield size={18} />}
                                label="Oversight"
                            />
                        )}
                        <TabButton 
                            active={activeTab === 'growth'} 
                            onClick={() => setActiveTab('growth')}
                            icon={<BookOpen size={18} />}
                            label="My Growth"
                        />
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-3">
                        {activeTab === 'overview' && (
                            <OverviewModule 
                                personal={personal} 
                                modules={modules} 
                                district={district} 
                            />
                        )}
                        {activeTab === 'instructor' && hasInstructor && (
                            <InstructorWorkspace data={modules.instructor} />
                        )}
                        {activeTab === 'counselor' && hasCounselor && (
                            <CounselorModule data={modules.counselor} />
                        )}
                        {activeTab === 'oversight' && hasOversight && (
                            <OversightModule data={modules.oversight} />
                        )}
                        {activeTab === 'growth' && (
                            <PersonalGrowth data={personal} />
                        )}
                    </div>

                    {/* Sidebar - Always visible District Context */}
                    <div className="space-y-6">
                        <div className="panel bg-burgundy-900/10 border-burgundy-500/20">
                            <div className="panel__header border-burgundy-500/10">
                                <div className="flex items-center gap-2">
                                    <Calendar size={16} className="text-burgundy-400" />
                                    <h3 className="text-burgundy-400 uppercase tracking-widest font-black text-xs">District Updates</h3>
                                </div>
                            </div>
                            <div className="panel__body p-4 space-y-4">
                                {district.bulletins?.length > 0 ? (
                                    district.bulletins.slice(0, 3).map(bulletin => (
                                        <div key={bulletin.id} className="p-3 bg-white/5 rounded-xl border border-white/5">
                                            <div className="font-bold text-white text-[11px] uppercase mb-1">{bulletin.title}</div>
                                            <div className="text-[10px] text-gray-500 line-clamp-2">{bulletin.content}</div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-[10px] text-gray-500 italic">No recent bulletins</p>
                                )}
                            </div>
                        </div>

                        <div className="panel">
                            <div className="panel__header">
                                <div className="flex items-center gap-2">
                                    <Trophy size={16} className="text-gold-500" />
                                    <h3 className="uppercase tracking-widest font-black text-xs">Upcoming Events</h3>
                                </div>
                            </div>
                            <div className="panel__body p-4 space-y-3">
                                {district.events?.length > 0 ? (
                                    district.events.slice(0, 3).map(event => (
                                        <div key={event.id} className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-white/5 border border-white/5 flex flex-col items-center justify-center text-center">
                                                <div className="text-[10px] font-black text-gold-500 leading-none">
                                                    {new Date(event.start_date).toLocaleString('default', { month: 'short' }).toUpperCase()}
                                                </div>
                                                <div className="text-sm font-black text-white leading-none">
                                                    {new Date(event.start_date).getDate()}
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-[11px] font-bold text-white uppercase truncate">{event.title}</div>
                                                <div className="text-[10px] text-gray-500 uppercase tracking-widest">{event.location}</div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-[10px] text-gray-500 italic">No upcoming events</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function TabButton({ active, onClick, icon, label }) {
    return (
        <button
            onClick={onClick}
            className={`
                flex items-center gap-2 px-6 py-4 text-xs font-black uppercase tracking-widest transition-all border-b-2
                ${active 
                    ? 'text-white border-burgundy-500 bg-white/5' 
                    : 'text-gray-500 border-transparent hover:text-gray-300 hover:bg-white/5'
                }
            `}
        >
            {icon}
            {label}
        </button>
    );
}

function OverviewModule({ personal, modules, district }) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    icon={<Library className="text-burgundy-400" />}
                    value={personal.profile?.assigned_class?.name || 'None'}
                    label="Assigned Class"
                    color="burgundy"
                />
                <StatCard 
                    icon={<BookOpen className="text-gold-400" />}
                    value={personal.trainings?.length || 0}
                    label="Specialties Earned"
                    color="gold"
                />
                <StatCard 
                    icon={<ClipboardCheck className="text-success" />}
                    value={personal.profile?.actively_teaching ? 'Active' : 'Inactive'}
                    label="Teaching Status"
                    color="success"
                />
            </div>

            {/* Recent Activity / Next Steps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="panel">
                    <div className="panel__header">
                        <div className="flex items-center gap-3">
                            <Clock size={20} className="text-info" />
                            <h3>Recent Assignments</h3>
                        </div>
                    </div>
                    <div className="panel__body p-6">
                        {modules.instructor && (
                            <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 mb-4">
                                <div className="p-3 bg-burgundy-900/50 rounded-xl text-burgundy-400">
                                    <GraduationCap size={20} />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Teaching</div>
                                    <div className="text-sm font-bold text-white uppercase">{modules.instructor.class?.name} Class</div>
                                    <div className="text-[11px] text-gray-400 mt-1">{modules.instructor.roster?.length || 0} Pathfinders assigned</div>
                                </div>
                            </div>
                        )}
                        {modules.counselor && (
                            <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                                <div className="p-3 bg-blue-900/50 rounded-xl text-blue-400">
                                    <Users size={20} />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Counseling</div>
                                    <div className="text-sm font-bold text-white uppercase">Unit: {modules.counselor.unit?.name}</div>
                                    <div className="text-[11px] text-gray-400 mt-1">{modules.counselor.pathfinders?.length || 0} Pathfinders in unit</div>
                                </div>
                            </div>
                        )}
                        {!modules.instructor && !modules.counselor && (
                            <div className="py-12 text-center">
                                <Users size={40} className="mx-auto text-gray-600 mb-4 opacity-20" />
                                <p className="text-sm text-gray-500 italic">No active club assignments found.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="panel">
                    <div className="panel__header">
                        <div className="flex items-center gap-3">
                            <Star size={20} className="text-gold-500" />
                            <h3>Ministry Milestones</h3>
                        </div>
                    </div>
                    <div className="panel__body p-6 space-y-4">
                        <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${personal.is_mg ? 'bg-gold-500/10 text-gold-500' : 'bg-white/5 text-gray-600'}`}>
                                    <CheckCircle2 size={18} />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-white uppercase">Master Guide Investiture</div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest">Core Qualification</div>
                                </div>
                            </div>
                            {personal.is_mg && <span className="badge badge--gold">Verified</span>}
                        </div>
                        <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between opacity-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/5 text-gray-600 rounded-lg">
                                    <CheckCircle2 size={18} />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-white uppercase">Advanced Staff Training</div>
                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest">Next Milestone</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, value, label, color }) {
    const colorClasses = {
        burgundy: 'stat-card--burgundy',
        gold: 'stat-card--gold',
        success: 'stat-card--success',
        info: 'stat-card--info',
    };

    return (
        <div className={`stat-card ${colorClasses[color] || ''}`}>
            <div className={`stat-icon ${colorClasses[color]?.replace('card', 'icon') || ''}`}>
                {icon}
            </div>
            <div className="stat-value">{value}</div>
            <div className="stat-label uppercase tracking-widest text-[10px]">{label}</div>
        </div>
    );
}
