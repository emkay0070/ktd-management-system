import React, { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    LayoutDashboard, Users, Church, ClipboardList,
    LogOut, Bell, Settings, ChevronRight, ChevronDown, Star, Tent, GraduationCap, Shield, Calendar, Trophy, BookOpen, Megaphone, ClipboardCheck, Activity, Sun, Moon,
    Menu, X, MapPin
} from 'lucide-react';
import ToastNotification from '@/Components/ToastNotification';


function NavItem({ href, icon: Icon, label, active = false, isCollapsed = false, isSidebarVisible = true, isMobileOpen = false }) {
    const showLabel = isSidebarVisible || isMobileOpen;
    return (
        <Link
            href={href}
            className={`sidebar__link${active ? ' sidebar__link--active' : ''}`}
            title={isCollapsed && !showLabel ? label : ''}
        >
            <Icon size={18} style={{ flexShrink: 0 }} />
            {showLabel && <span>{label}</span>}
        </Link>
    );
}

export default function AuthenticatedLayout({ header, breadcrumb, children }) {
    const { auth, banners = [] } = usePage().props;
    const user = auth.user;
    
    const roleNames = user.role_names || [];
    const hasRole = (r) => roleNames.includes(r);
    const hasAnyRole = (rs) => rs.some(r => roleNames.includes(r));

    const isSuperAdmin = hasRole('super_admin');
    const isDistrictLeader = hasAnyRole(['district_director', 'district_committee', 'district_treasurer', 'district_secretary', 'district_official', 'district_curriculum_coordinator', 'district_communication_coordinator', 'district_music_coordinator', 'district_welfare_coordinator', 'district_pbe_coordinator', 'district_programs_coordinator']);
    const isDirector = hasRole('director');
    const isMG = hasRole('master_guide');
    const isPathfinder = hasRole('pathfinder');
    const isParent = hasRole('parent');

    const initials = user.name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    function handleLogout(e) {
        e.preventDefault();
        router.post(route('logout'));
    }

    // Role Label for Footer
    const getRoleLabel = () => {
        if (isSuperAdmin) return 'System Admin';
        const labels = [];
        if (isDistrictLeader) labels.push('District Executive');
        if (isDirector) labels.push('Club Director');
        if (isMG) labels.push('Master Guide');
        if (isPathfinder) labels.push('Pathfinder');
        if (isParent) labels.push('Parent');
        return labels.length > 0 ? labels.join(' & ') : 'Member';
    };

    // --- UI States & Theme ---
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidebar_collapsed');
        return saved !== null ? JSON.parse(saved) : true;
    });
    const [isHovered, setIsHovered] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [theme, setTheme] = useState(() => localStorage.getItem('app_theme') || 'dark');

    const isSidebarVisible = !isCollapsed || isHovered;
    const isMobileOpen = isMobileMenuOpen;

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('app_theme', theme);
    }, [theme]);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [usePage().url]);

    const toggleSidebar = () => {
        const next = !isCollapsed;
        setIsCollapsed(next);
        localStorage.setItem('sidebar_collapsed', JSON.stringify(next));
    };

    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

    // Determine Role Theme
    const roleTheme = isDistrictLeader ? 'district' : 'local';

    return (
        <div className={`app-shell ${isCollapsed ? 'app-shell--collapsed' : ''} ${isMobileMenuOpen ? 'app-shell--mobile-open' : ''}`} data-role-theme={roleTheme}>
            <ToastNotification />
            {/* Mobile Backdrop */}
            {isMobileMenuOpen && (
                <div 
                    className="sidebar-backdrop" 
                    onClick={() => setIsMobileMenuOpen(false)} 
                />
            )}

            {/* ── Sidebar ── */}
            <aside 
                className={`sidebar ${isCollapsed ? 'sidebar--collapsed' : ''} ${isHovered ? 'sidebar--hover' : ''} ${isMobileMenuOpen ? 'sidebar--mobile-open' : ''}`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Logo */}
                <div className="sidebar__logo">
                    <div className="logo-icon">
                        {isDistrictLeader ? <Shield size={20} /> : <Tent size={20} />}
                    </div>
                    {(isSidebarVisible || isMobileOpen) && (
                        <div className="logo-text">
                            <span className="logo-title">{isDistrictLeader ? 'DISTRICT HQ' : 'LOCAL CLUB'}</span>
                            <span className="logo-sub">{isDistrictLeader ? 'COMMAND CENTRE' : 'OPERATIONS'}</span>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="sidebar__nav">
                    {!isCollapsed && isHovered && <div className="sidebar__hover-indicator" />}
                    
                    {(isSidebarVisible || isMobileOpen) && <span className="sidebar__section-label">Overview</span>}
                    <NavItem
                        href={route('dashboard', 'overview')}
                        icon={LayoutDashboard}
                        label={isDistrictLeader ? "District Command" : "Dashboard"}
                        isCollapsed={isCollapsed}
                        isSidebarVisible={isSidebarVisible}
                        isMobileOpen={isMobileOpen}
                        active={route().current('dashboard', { section: 'overview' }) || (route().current('dashboard') && !route().params.section)}
                    />

                    {isDistrictLeader && (
                        <>
                            {(isSidebarVisible || isMobileOpen) && <span className="sidebar__section-label" style={{ marginTop: '12px' }}>District Headquarters</span>}
                            
                            {/* Level 1 & Directors */}
                            {(hasAnyRole(['district_director', 'district_secretary', 'super_admin'])) && (
                                <>
                                    <NavItem
                                        href={route('dashboard', 'clubs')}
                                        icon={Church}
                                        label="Clubs Directory"
                                        isCollapsed={isCollapsed}
                                        isSidebarVisible={isSidebarVisible}
                                        isMobileOpen={isMobileOpen}
                                        active={route().current('dashboard', { section: 'clubs' })}
                                    />
                                    <NavItem
                                        href={route('dashboard', 'committee')}
                                        icon={Users}
                                        label="Executive Committee"
                                        isCollapsed={isCollapsed}
                                        isSidebarVisible={isSidebarVisible}
                                        isMobileOpen={isMobileOpen}
                                        active={route().current('dashboard', { section: 'committee' })}
                                    />
                                </>
                            )}

                            {/* Departments (Level 1 & Coordinators) */}
                            {(hasAnyRole(['district_director', 'district_secretary', 'super_admin', 'district_programs_coordinator'])) && (
                                <NavItem
                                    href={route('dashboard', 'events')}
                                    icon={Calendar}
                                    label="Programs Dept"
                                    isCollapsed={isCollapsed}
                                    isSidebarVisible={isSidebarVisible}
                                    isMobileOpen={isMobileOpen}
                                    active={route().current('dashboard', { section: 'events' })}
                                />
                            )}
                            
                            {(hasAnyRole(['district_director', 'district_secretary', 'super_admin', 'district_curriculum_coordinator'])) && (
                                <NavItem
                                    href={route('dashboard', 'curriculum')}
                                    icon={GraduationCap}
                                    label="Curriculum Dept"
                                    isCollapsed={isCollapsed}
                                    isSidebarVisible={isSidebarVisible}
                                    isMobileOpen={isMobileOpen}
                                    active={route().current('dashboard', { section: 'curriculum' })}
                                />
                            )}
                            
                            {(hasAnyRole(['district_director', 'district_secretary', 'super_admin', 'district_communication_coordinator'])) && (
                                <NavItem
                                    href={route('dashboard', 'bulletins')}
                                    icon={Megaphone}
                                    label="Communication Dept"
                                    isCollapsed={isCollapsed}
                                    isSidebarVisible={isSidebarVisible}
                                    isMobileOpen={isMobileOpen}
                                    active={route().current('dashboard', { section: 'bulletins' })}
                                />
                            )}

                            <NavItem
                                href={route('dashboard', 'missions')}
                                icon={Trophy}
                                label="District Missions"
                                isCollapsed={isCollapsed}
                                isSidebarVisible={isSidebarVisible}
                                isMobileOpen={isMobileOpen}
                                active={route().current('dashboard', { section: 'missions' })}
                            />
                            
                            <NavItem
                                href={route('dashboard', 'roster')}
                                icon={Users}
                                label="Global Roster"
                                isCollapsed={isCollapsed}
                                isSidebarVisible={isSidebarVisible}
                                isMobileOpen={isMobileOpen}
                                active={route().current('dashboard', { section: 'roster' })}
                            />
                            
                            <NavItem
                                href={route('dashboard', 'resources')}
                                icon={BookOpen}
                                label="Shared Resources"
                                isCollapsed={isCollapsed}
                                isSidebarVisible={isSidebarVisible}
                                isMobileOpen={isMobileOpen}
                                active={route().current('dashboard', { section: 'resources' })}
                            />
                            
                            {(hasAnyRole(['district_director', 'district_secretary', 'super_admin'])) && (
                                <>
                                    <NavItem
                                        href={route('dashboard', 'appraisals')}
                                        icon={ClipboardCheck}
                                        label="Appraisals"
                                        isCollapsed={isCollapsed}
                                        isSidebarVisible={isSidebarVisible}
                                        isMobileOpen={isMobileOpen}
                                        active={route().current('dashboard', { section: 'appraisals' })}
                                    />
                                    <NavItem
                                        href={route('dashboard', 'pulse')}
                                        icon={Activity}
                                        label="District Pulse"
                                        isCollapsed={isCollapsed}
                                        isSidebarVisible={isSidebarVisible}
                                        isMobileOpen={isMobileOpen}
                                        active={route().current('dashboard', { section: 'pulse' })}
                                    />
                                    <NavItem
                                        href={route('dashboard', 'camp_registrations')}
                                        icon={Tent}
                                        label="Treasury & Regs"
                                        isCollapsed={isCollapsed}
                                        isSidebarVisible={isSidebarVisible}
                                        isMobileOpen={isMobileOpen}
                                        active={route().current('dashboard', { section: 'camp_registrations' })}
                                    />
                                </>
                            )}
                        </>
                    )}

                    {isSuperAdmin && (
                        <>
                            {(isSidebarVisible || isMobileOpen) && <span className="sidebar__section-label" style={{ marginTop: '12px' }}>Management</span>}
                            <NavItem
                                href={route('dashboard', 'overview')}
                                icon={Church}
                                label="Churches & Clubs"
                                isCollapsed={isCollapsed}
                                isSidebarVisible={isSidebarVisible}
                                isMobileOpen={isMobileOpen}
                                active={route().current('dashboard', { section: 'overview' }) || (route().current('dashboard') && !route().params.section)}
                            />
                            <NavItem
                                href={route('dashboard', 'directors')}
                                icon={MapPin}
                                label="District Directors"
                                isCollapsed={isCollapsed}
                                isSidebarVisible={isSidebarVisible}
                                isMobileOpen={isMobileOpen}
                                active={route().current('dashboard', { section: 'directors' })}
                            />
                            <NavItem
                                href={route('dashboard', 'pathfinders')}
                                icon={Users}
                                label="All Pathfinders"
                                isCollapsed={isCollapsed}
                                isSidebarVisible={isSidebarVisible}
                                isMobileOpen={isMobileOpen}
                                active={route().current('dashboard', { section: 'pathfinders' })}
                            />
                            <NavItem
                                href={route('dashboard', 'registrations')}
                                icon={ClipboardList}
                                label="Registrations"
                                isCollapsed={isCollapsed}
                                isSidebarVisible={isSidebarVisible}
                                isMobileOpen={isMobileOpen}
                                active={route().current('dashboard', { section: 'registrations' })}
                            />
                        </>
                    )}

                    {!isSuperAdmin && !isDistrictLeader && (
                        <>
                            {(isSidebarVisible || isMobileOpen) && <span className="sidebar__section-label" style={{ marginTop: '12px' }}>Local Club</span>}
                            <NavItem
                                href={route('dashboard', 'pathfinders')}
                                icon={Users}
                                label="Pathfinders"
                                isCollapsed={isCollapsed}
                                isSidebarVisible={isSidebarVisible}
                                isMobileOpen={isMobileOpen}
                                active={route().current('dashboard', { section: 'pathfinders' }) || route().current('dashboard', { section: 'units' })}
                            />
                            <NavItem
                                href={route('dashboard', 'leaders')}
                                icon={GraduationCap}
                                label="Staff & Guides"
                                isCollapsed={isCollapsed}
                                isSidebarVisible={isSidebarVisible}
                                isMobileOpen={isMobileOpen}
                                active={route().current('dashboard', { section: 'leaders' }) || route().current('dashboard', { section: 'leadership' })}
                            />
                            <NavItem
                                href={route('dashboard', 'attendance')}
                                icon={ClipboardList}
                                label="Attendance"
                                isCollapsed={isCollapsed}
                                isSidebarVisible={isSidebarVisible}
                                isMobileOpen={isMobileOpen}
                                active={route().current('dashboard', { section: 'attendance' })}
                            />
                            <NavItem
                                href={route('dashboard', 'missions')}
                                icon={Trophy}
                                label="District Missions"
                                isCollapsed={isCollapsed}
                                isSidebarVisible={isSidebarVisible}
                                isMobileOpen={isMobileOpen}
                                active={route().current('dashboard', { section: 'missions' })}
                            />
                            <NavItem
                                href={route('dashboard', 'resources')}
                                icon={BookOpen}
                                label="Resource Library"
                                isCollapsed={isCollapsed}
                                isSidebarVisible={isSidebarVisible}
                                isMobileOpen={isMobileOpen}
                                active={route().current('dashboard', { section: 'resources' })}
                            />
                            <NavItem
                                href={route('dashboard', 'events')}
                                icon={Calendar}
                                label="District Events"
                                isCollapsed={isCollapsed}
                                isSidebarVisible={isSidebarVisible}
                                isMobileOpen={isMobileOpen}
                                active={route().current('dashboard', { section: 'events' })}
                            />
                            <NavItem
                                href={route('dashboard', 'bulletins')}
                                icon={Megaphone}
                                label="Bulletins"
                                isCollapsed={isCollapsed}
                                isSidebarVisible={isSidebarVisible}
                                isMobileOpen={isMobileOpen}
                                active={route().current('dashboard', { section: 'bulletins' })}
                            />
                            <NavItem
                                href={route('dashboard', 'camp_portal')}
                                icon={Tent}
                                label="Camp Portal"
                                isCollapsed={isCollapsed}
                                isSidebarVisible={isSidebarVisible}
                                isMobileOpen={isMobileOpen}
                                active={route().current('dashboard', { section: 'camp_portal' })}
                            />
                            <NavItem
                                href={route('dashboard', 'parents')}
                                icon={Users}
                                label="Parents & Linking"
                                isCollapsed={isCollapsed}
                                isSidebarVisible={isSidebarVisible}
                                isMobileOpen={isMobileOpen}
                                active={route().current('dashboard', { section: 'parents' })}
                            />
                        </>
                    )}

                    {!isSuperAdmin && !isDistrictLeader && (
                        <NavItem
                            href={route('dashboard', 'operations')}
                            icon={Settings}
                            label="Club Settings"
                            isCollapsed={isCollapsed}
                            isSidebarVisible={isSidebarVisible}
                            isMobileOpen={isMobileOpen}
                            active={route().current('dashboard', { section: 'operations' })}
                        />
                    )}
                    <NavItem
                        href={route('profile.edit')}
                        icon={Settings}
                        label="Profile"
                        isCollapsed={isCollapsed}
                        isSidebarVisible={isSidebarVisible}
                        isMobileOpen={isMobileOpen}
                    />
                </nav>

                {/* User Footer */}
                <div className="sidebar__footer">
                    <div className={`user-card ${!(isSidebarVisible || isMobileOpen) ? 'user-card--collapsed' : ''}`}>
                        <div className="avatar">
                            {user.avatar_path ? (
                                <img src={user.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                initials
                            )}
                        </div>
                        {(isSidebarVisible || isMobileOpen) && (
                            <div className="user-info">
                                <div className="user-name">{user.name}</div>
                                <div className="user-role">
                                    {getRoleLabel()}
                                </div>
                            </div>
                        )}
                        {(isSidebarVisible || isMobileOpen) && (
                            <button className="logout-btn" onClick={handleLogout} title="Logout">
                                <LogOut size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </aside>

            {/* ── Main Area ── */}
            <div className="main-content">
                {/* Top Bar */}
                <div className="topbar">
                    <div className="flex items-center gap-4">
                        {/* Mobile Menu Toggle */}
                        <button 
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                            className="mobile-toggle-btn"
                        >
                            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>

                        <button 
                            onClick={toggleSidebar} 
                            className="sidebar-toggle-btn"
                        >
                            {isCollapsed ? <ChevronRight size={18} /> : <div className="rotate-180"><ChevronRight size={18} /></div>}
                        </button>
                        <div className="topbar__title min-w-0">
                            <h1 className="truncate">{header ?? 'Dashboard'}</h1>
                            {breadcrumb && <div className="breadcrumb truncate">{breadcrumb}</div>}
                        </div>
                    </div>
                    <div className="topbar__actions flex items-center gap-3">
                        {/* Role Context Switcher */}
                        {roleNames.length > 1 && (
                            <div className="relative group">
                                <button className="flex items-center gap-3 px-4 py-2 bg-surface-800 border border-white/5 rounded-xl text-sm font-bold hover:border-gold-500/30 transition-all shadow-xl group/btn">
                                    <div className="p-1.5 bg-burgundy-500 bg-opacity-10 rounded-lg text-burgundy-400 group-hover/btn:bg-opacity-20 transition-all">
                                        <Shield size={14} />
                                    </div>
                                    <div className="hidden sm:flex flex-col items-start leading-none pr-1">
                                        <span className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--clr-text-muted)' }}>Perspective</span>
                                        <span className="capitalize text-xs tracking-tight" style={{ color: 'var(--clr-text-primary)' }}>{auth.user?.active_context?.replace('_', ' ')}</span>
                                    </div>
                                    <div className="transition-transform group-hover:rotate-180" style={{ color: 'var(--clr-text-muted)' }}>
                                        <ChevronDown size={14} />
                                    </div>
                                </button>
                                
                                <div className="absolute right-0 top-full mt-3 w-56 bg-surface-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden opacity-0 invisible scale-95 group-hover:opacity-100 group-hover:visible group-hover:scale-100 transition-all z-50 p-1 backdrop-blur-xl">
                                    <div className="px-4 py-3 border-b border-white/5 mb-1 bg-white/5">
                                        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--clr-text-muted)' }}>Available Channels</span>
                                    </div>
                                    {roleNames.map(role => (
                                        <button
                                            key={role}
                                            onClick={() => router.post(route('role.switch_context'), { context: role })}
                                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm capitalize transition-all rounded-xl ${
                                                auth.user?.active_context === role 
                                                    ? 'font-black bg-white/5 text-gold-500' 
                                                    : 'hover:bg-white/5'
                                            }`}
                                            style={{ color: auth.user?.active_context === role ? 'var(--clr-gold-500)' : 'var(--clr-text-secondary)' }}
                                        >
                                            <div className={`p-1.5 rounded-lg ${auth.user?.active_context === role ? 'bg-gold-500 bg-opacity-10' : 'bg-white/5'}`}>
                                                {role === 'super_admin' && <Star size={14} />}
                                                {role === 'director' && <Shield size={14} />}
                                                {role === 'master_guide' && <GraduationCap size={14} />}
                                                {role === 'pathfinder' && <Tent size={14} />}
                                                {role === 'parent' && <Users size={14} />}
                                                {role === 'district_official' && <Star size={14} />}
                                                {!['super_admin', 'director', 'master_guide', 'pathfinder', 'parent', 'district_official'].includes(role) && <Activity size={14} />}
                                            </div>
                                            {role.replace('_', ' ')}
                                            {auth.user?.active_context === role && (
                                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-2 ml-2">
                            <button className="icon-btn" onClick={toggleTheme} title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}>
                                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                            </button>
                            <button className="icon-btn" title="Notifications">
                                <Bell size={18} />
                            </button>
                            <button className="icon-btn" title="Settings">
                                <Settings size={18} />
                            </button>
                        </div>
                    </div>

                </div>

                {/* Page Body */}
                <div className="page-content relative">
                    {/* Global Pending State Banners */}
                    {banners && banners.length > 0 && (
                        <div className="mb-6 space-y-3">
                            {banners.map((banner, idx) => (
                                <div key={idx} className={`alert alert--${banner.type} flex flex-wrap items-center justify-between gap-4 shadow-sm border border-[var(--clr-${banner.type}-500)]/20`}>
                                    <div className="flex items-center gap-3 text-sm font-medium">
                                        <Activity size={18} className={`text-${banner.type}-500`} />
                                        <span>{banner.message}</span>
                                    </div>
                                    {banner.action && (
                                        <Link href={banner.action.url} className={`btn btn--white btn--sm shrink-0`}>
                                            {banner.action.label}
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {children}
                </div>
            </div>
        </div>
    );
}
