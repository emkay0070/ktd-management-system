import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    Shield, GraduationCap, Users, UserCircle, ChevronRight, ChevronLeft, 
    Check, UserCheck, Clock, Building, ArrowRight, Sparkles,
    Globe, Layers, Map, MapPin, Church
} from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';
import { useState, useEffect } from 'react';
import axios from 'axios';

// ── Hierarchy Card ──────────────────────────────────────────────────────────
function HierarchyCard({ item, selected, onClick, icon: Icon }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`
                group relative p-5 rounded-2xl border text-left transition-all duration-200 overflow-hidden
                ${selected 
                    ? 'bg-burgundy-900/30 border-burgundy-500/50 ring-2 ring-burgundy-500/30 shadow-lg shadow-burgundy-500/10' 
                    : 'bg-[var(--clr-surface-800)] border-[var(--clr-border)] hover:bg-[var(--clr-surface-700)] hover:border-[var(--clr-border-strong)]'
                }
            `}
        >
            <div className="flex items-center gap-3">
                <div className={`
                    p-2.5 rounded-xl transition-all
                    ${selected ? 'bg-burgundy-500/20 text-burgundy-400' : 'bg-[var(--clr-surface-600)] text-[var(--clr-text-secondary)] group-hover:text-[var(--clr-text-primary)]'}
                `}>
                    <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className={`font-bold text-sm truncate transition-colors ${selected ? 'text-[var(--clr-text-primary)]' : 'text-[var(--clr-text-secondary)] group-hover:text-[var(--clr-text-primary)]'}`}>
                        {item.name}
                    </div>
                    {item.location && (
                        <div className="text-[10px] text-[var(--clr-text-muted)] uppercase tracking-widest mt-0.5 truncate">{item.location}</div>
                    )}
                </div>
                {selected && (
                    <div className="p-1 bg-burgundy-500 rounded-lg text-white shrink-0">
                        <Check size={12} strokeWidth={3} />
                    </div>
                )}
            </div>
        </button>
    );
}
export default function SetupWizard({ user, roles = [], state = {} }) {
    const { pending_roles = [], active_roles = [], has_church = false, has_linked_child = false } = state;
    
    // Determine the current logical "Step" based on the state engine
    const getActiveStep = () => {
        const allRoles = [...pending_roles, ...active_roles];
        if (allRoles.length === 0) return 'SELECT_ROLE';
        
        const activeNonObserverRoles = active_roles.filter(r => r !== 'observer');
        if (pending_roles.length > 0 && activeNonObserverRoles.length === 0) return 'AWAITING_APPROVAL';
        
        if (allRoles.includes('parent') && !has_linked_child) return 'LINK_CHILD';
        
        const districtRoles = ['district_official', 'district_director', 'district_treasurer', 'district_secretary', 'district_committee'];
        const hasDistrictRole = allRoles.some(r => districtRoles.includes(r));
        if (!has_church && !hasDistrictRole) return 'JOIN_CLUB';
        
        return 'FINISH';
    };

    const currentStep = getActiveStep();
    const { data, setData, post, processing } = useForm({
        intent: '',
        union_id: '',
        conference_id: '',
        zone_id: '',
        district_id: '',
        church_id: '',
        new_church_name: '',
        child_name: '',
    });

    const [hierarchy, setHierarchy] = useState({
        unions: [],
        conferences: [],
        zones: [],
        districts: [],
        churches: []
    });
    const [isCreatingClub, setIsCreatingClub] = useState(false);

    useEffect(() => {
        if (currentStep === 'JOIN_CLUB') {
            axios.get(route('hierarchy.unions')).then(res => setHierarchy(h => ({ ...h, unions: res.data })));
        }
    }, [currentStep]);

    useEffect(() => {
        if (data.union_id) {
            axios.get(route('hierarchy.conferences', { union_id: data.union_id }))
                 .then(res => setHierarchy(h => ({ ...h, conferences: res.data })));
        }
    }, [data.union_id]);

    useEffect(() => {
        if (data.conference_id) {
            axios.get(route('hierarchy.zones', { conference_id: data.conference_id }))
                 .then(res => setHierarchy(h => ({ ...h, zones: res.data })));
        }
    }, [data.conference_id]);

    useEffect(() => {
        if (data.zone_id) {
            axios.get(route('hierarchy.districts', { zone_id: data.zone_id, conference_id: data.conference_id }))
                 .then(res => setHierarchy(h => ({ ...h, districts: res.data })));
        }
    }, [data.zone_id]);

    useEffect(() => {
        if (data.district_id) {
            axios.get(route('churches.search', { district_id: data.district_id }))
                 .then(res => setHierarchy(h => ({ ...h, churches: res.data })));
        }
    }, [data.district_id]);

    const activateAndGo = (e) => {
        e.preventDefault();
        post(route('onboarding.store'));
    };

    const submitIntent = (e) => {
        e.preventDefault();
        post(route('onboarding.store'));
    };

    return (
        <GuestLayout>
            <Head title="Account Setup — EmPFC" />

            <div className="max-w-2xl mx-auto py-12 px-6">
                <div className="text-center mb-10">
                    <div className="inline-flex p-4 rounded-3xl bg-burgundy-500/10 text-burgundy-500 mb-6">
                        <UserCheck size={32} />
                    </div>
                    <h1 className="text-3xl font-black text-[var(--clr-text-primary)] mb-3">Welcome, {user.name}</h1>
                </div>

                <div className="space-y-8">
                    {/* STEP 1: ROLE SELECTION */}
                    {currentStep === 'SELECT_ROLE' && (
                        <div className="space-y-6 fade-in">
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-black text-white mb-2">Role & Intent</h2>
                                <p className="text-sm text-gray-400">Choose how you wish to engage with the platform.</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                                {roles.filter(r => r.name !== 'observer').map((role) => (
                                    <button
                                        key={role.id}
                                        type="button"
                                        onClick={() => setData('intent', role.name)}
                                        className={`group relative p-6 rounded-2xl border transition-all text-center ${
                                            data.intent === role.name 
                                                ? 'bg-burgundy-900/30 border-burgundy-500/50 ring-2 ring-burgundy-500/30 shadow-lg' 
                                                : 'bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.06] hover:border-white/20'
                                        }`}
                                    >
                                        <div className="font-bold text-white text-sm mb-1">{role.display_name}</div>
                                        <div className="text-[10px] text-gray-500 leading-relaxed">{role.description || 'Join the district in this capacity'}</div>
                                        {data.intent === role.name && (
                                            <div className="absolute top-3 right-3 p-1 bg-burgundy-500 rounded-full text-white">
                                                <Check size={12} strokeWidth={3} />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>

                            <PrimaryButton className="w-full py-5 text-base mt-4" onClick={submitIntent} disabled={processing || !data.intent}>
                                Continue Setup <ArrowRight size={18} className="ml-2" />
                            </PrimaryButton>
                        </div>
                    )}

                    {/* STEP: AWAITING APPROVAL */}
                    {currentStep === 'AWAITING_APPROVAL' && (
                        <div className="panel p-8 text-center space-y-6 fade-in">
                            <div className="w-16 h-16 bg-gold-500/10 text-gold-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
                                <Clock size={32} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-white">Pending Verification</h3>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    Your application for <span className="text-gold-500 font-bold uppercase tracking-wider">{pending_roles[0].replace('_', ' ')}</span> is being reviewed by District Leadership.
                                </p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-xs text-left text-gray-500 leading-relaxed">
                                <Users size={14} className="mb-2 text-gold-500" />
                                Credentials for high-level roles require administrative background checks for district security. This usually takes 24-48 hours.
                            </div>
                            <Link href={route('dashboard')} className="btn btn--secondary btn--full">
                                Refresh Status
                            </Link>
                        </div>
                    )}

                    {/* STEP: LINK CHILD (FOR PARENTS) */}
                    {currentStep === 'LINK_CHILD' && (
                        <div className="space-y-6 fade-in">
                            <div className="p-5 bg-burgundy-900/20 border border-burgundy-500/30 rounded-2xl flex items-start gap-4">
                                <Users className="text-burgundy-400 mt-1" />
                                <div>
                                    <h4 className="font-bold text-white">Link your Pathfinder</h4>
                                    <p className="text-xs text-gray-400">To see stats, we need to know which child you are managing.</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Child's Registered Name</label>
                                <input 
                                    className="w-full bg-white/5 border-white/10 rounded-xl text-white px-4 py-3"
                                    placeholder="e.g. John Doe"
                                    value={data.child_name}
                                    onChange={e => setData('child_name', e.target.value)}
                                />
                            </div>
                            <PrimaryButton className="w-full py-5" disabled={!data.child_name}>
                                Request Family Link <ArrowRight size={18} className="ml-2" />
                            </PrimaryButton>
                            <button className="w-full text-xs text-gray-500 hover:text-white transition-colors" onClick={() => post(route('dashboard'))}>
                                Skip for now — Explore only
                            </button>
                        </div>
                    )}

                    {/* STEP: JOIN CLUB */}
                    {currentStep === 'JOIN_CLUB' && (
                        <div className="space-y-6 fade-in">
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-black text-[var(--clr-text-primary)] mb-2">Select Your Organization</h2>
                                <p className="text-sm text-[var(--clr-text-secondary)]">Follow the hierarchy to find your local church or club.</p>
                            </div>
                            
                            <div className="md:grid md:grid-cols-3 md:gap-6 items-start text-left">
                                {/* Completed Hierarchy Summary Bar */}
                                <div className="md:col-span-1 mb-6 md:mb-0">
                                    {(data.union_id || data.conference_id || data.zone_id) && (
                                        <div className="flex flex-col gap-2 p-4 bg-[var(--clr-surface-800)] border border-[var(--clr-border)] rounded-2xl">
                                            {data.union_id && (
                                                <div className="flex items-center justify-between group">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-1.5 rounded-lg bg-burgundy-500/20 text-burgundy-400"><Globe size={14}/></div>
                                                        <span className="text-sm font-bold text-[var(--clr-text-primary)]">{hierarchy.unions.find(u => u.id == data.union_id)?.name}</span>
                                                    </div>
                                                    <button type="button" onClick={() => setData(d => ({...d, union_id: '', conference_id: '', zone_id: '', district_id: '', church_id: ''}))} className="text-xs text-burgundy-400 opacity-0 group-hover:opacity-100 transition-opacity">Change</button>
                                                    <Check size={16} className="text-green-500 group-hover:hidden" />
                                                </div>
                                            )}
                                            {data.conference_id && (
                                                <div className="flex items-center justify-between group">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-1.5 rounded-lg bg-burgundy-500/20 text-burgundy-400"><Layers size={14}/></div>
                                                        <span className="text-sm font-bold text-[var(--clr-text-primary)]">{hierarchy.conferences.find(c => c.id == data.conference_id)?.name}</span>
                                                    </div>
                                                    <button type="button" onClick={() => setData(d => ({...d, conference_id: '', zone_id: '', district_id: '', church_id: ''}))} className="text-xs text-burgundy-400 opacity-0 group-hover:opacity-100 transition-opacity">Change</button>
                                                    <Check size={16} className="text-green-500 group-hover:hidden" />
                                                </div>
                                            )}
                                            {data.zone_id && (
                                                <div className="flex items-center justify-between group">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-1.5 rounded-lg bg-burgundy-500/20 text-burgundy-400"><Map size={14}/></div>
                                                        <span className="text-sm font-bold text-[var(--clr-text-primary)]">{hierarchy.zones.find(z => z.id == data.zone_id)?.name}</span>
                                                    </div>
                                                    <button type="button" onClick={() => setData(d => ({...d, zone_id: '', district_id: '', church_id: ''}))} className="text-xs text-burgundy-400 opacity-0 group-hover:opacity-100 transition-opacity">Change</button>
                                                    <Check size={16} className="text-green-500 group-hover:hidden" />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Active Selection Grids */}
                                <div className={(data.union_id || data.conference_id || data.zone_id) ? "md:col-span-2" : "md:col-span-3"}>
                                    {!data.union_id ? (
                                        <div className="fade-in">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-[var(--clr-text-muted)] mb-3 flex items-center gap-2">
                                                <Globe size={12} /> Select Union
                                            </div>
                                            <div className="grid grid-cols-1 gap-2">
                                                {hierarchy.unions.map(u => (
                                                    <HierarchyCard
                                                        key={u.id} item={u} icon={Globe}
                                                        selected={data.union_id == u.id}
                                                        onClick={() => setData(d => ({ ...d, union_id: u.id, conference_id: '', zone_id: '', district_id: '', church_id: '' }))}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    ) : !data.conference_id ? (
                                        <div className="fade-in">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-[var(--clr-text-muted)] mb-3 flex items-center gap-2">
                                                <Layers size={12} /> Select Conference / Field
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                                                {hierarchy.conferences.map(c => (
                                                    <HierarchyCard
                                                        key={c.id} item={c} icon={Layers}
                                                        selected={data.conference_id == c.id}
                                                        onClick={() => setData(d => ({ ...d, conference_id: c.id, zone_id: '', district_id: '', church_id: '' }))}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    ) : !data.zone_id ? (
                                        <div className="fade-in">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-[var(--clr-text-muted)] mb-3 flex items-center gap-2">
                                                <Map size={12} /> Select Zone
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                {hierarchy.zones.map(z => (
                                                    <HierarchyCard
                                                        key={z.id} item={z} icon={Map}
                                                        selected={data.zone_id == z.id}
                                                        onClick={() => setData(d => ({ ...d, zone_id: z.id, district_id: '', church_id: '' }))}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="fade-in">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-[var(--clr-text-muted)] mb-3 flex items-center gap-2">
                                                <MapPin size={12} /> Select District
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                                                {hierarchy.districts.map(d => (
                                                    <HierarchyCard
                                                        key={d.id} item={d} icon={MapPin}
                                                        selected={data.district_id == d.id}
                                                        onClick={() => setData(d => ({ ...d, district_id: d.id, church_id: '' }))}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Church / Club */}
                                    {data.district_id && !isCreatingClub && (
                                        <div className="fade-in pt-4 border-t border-[var(--clr-border)] mt-6">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-[var(--clr-text-muted)] mb-3 flex items-center gap-2">
                                                <Church size={12} /> Local Church / Club
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                {hierarchy.churches.map(c => (
                                                    <HierarchyCard
                                                        key={c.id} item={c} icon={Church}
                                                        selected={data.church_id == c.id}
                                                        onClick={() => { setData('church_id', c.id); setData('new_church_name', ''); }}
                                                    />
                                                ))}
                                            </div>

                                            {hierarchy.churches.length === 0 && (
                                                <div className="text-center py-8 text-[var(--clr-text-muted)]">
                                                    <Building size={32} className="mx-auto mb-2 opacity-30" />
                                                    <p className="text-sm">No churches registered here yet.</p>
                                                    {pending_roles.includes('director') && (
                                                        <button type="button" onClick={() => setIsCreatingClub(true)} className="mt-2 text-xs font-bold text-burgundy-400 hover:text-burgundy-300">
                                                            Register the first one →
                                                        </button>
                                                    )}
                                                </div>
                                            )}

                                            {pending_roles.includes('director') && hierarchy.churches.length > 0 && (
                                                <div className="mt-4 text-center">
                                                    <button type="button" onClick={() => setIsCreatingClub(true)} className="text-xs font-bold text-burgundy-400 hover:text-burgundy-300">
                                                        Can't find it? Register a new Club →
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Create New Club (Director only) */}
                                    {data.district_id && isCreatingClub && pending_roles.includes('director') && (
                                        <div className="fade-in mt-6 p-6 bg-burgundy-900/10 border border-burgundy-500/30 rounded-2xl relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                                                <Building size={80} className="text-burgundy-500" />
                                            </div>
                                            <label className="text-[10px] font-black uppercase tracking-widest text-burgundy-400">New Church / Club Name</label>
                                            <input 
                                                className="w-full bg-[var(--clr-surface-900)] border border-[var(--clr-border)] rounded-xl text-[var(--clr-text-primary)] px-5 py-4 mt-2 outline-none focus:border-burgundy-500 text-base"
                                                placeholder="e.g. Kireka Central"
                                                value={data.new_church_name}
                                                onChange={e => setData('new_church_name', e.target.value)}
                                                autoFocus
                                            />
                                            <div className="mt-4 flex items-center justify-between relative z-10">
                                                <div className="text-xs text-[var(--clr-text-muted)] max-w-[200px] leading-relaxed">Submits to district for verification.</div>
                                                <button type="button" onClick={() => { setIsCreatingClub(false); setData('new_church_name', ''); }} className="text-xs font-bold text-[var(--clr-text-muted)] hover:text-[var(--clr-text-primary)] transition-colors">
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <PrimaryButton 
                                className="w-full py-5" 
                                onClick={submitIntent}
                                disabled={!data.district_id || (!data.church_id && !data.new_church_name) || processing}
                            >
                                Continue <ArrowRight size={18} className="ml-2" />
                            </PrimaryButton>
                        </div>
                    )}

                    {/* STEP: FINISH */}
                    {currentStep === 'FINISH' && (
                        <div className="text-center space-y-6 fade-in">
                            <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto">
                                <Check size={32} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-white">Setup Complete!</h3>
                                <p className="text-sm text-gray-400">Your profile is now tailored to your involvement in the district.</p>
                            </div>
                            <form onSubmit={activateAndGo}>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="btn btn--primary btn--full py-5 text-base disabled:opacity-50"
                                >
                                    {processing ? 'Loading...' : 'Go to Dashboard'}
                                </button>
                            </form>
                        </div>
                    )}

                    <div className="text-center">
                        <Link href={route('logout')} method="post" as="button" className="text-[10px] uppercase font-black tracking-widest text-gray-600 hover:text-white transition-colors">
                            Logout & Re-start
                        </Link>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
