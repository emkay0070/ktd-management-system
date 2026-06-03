import { useEffect, useState } from 'react';
import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    Check, ChevronRight, ChevronLeft, UserCircle, Users, Shield, GraduationCap, 
    Building, MapPin, Globe, Layers, Map, Church, ArrowRight, Eye, EyeOff, Sparkles 
} from 'lucide-react';
import axios from 'axios';

// ── Step Indicator ──────────────────────────────────────────────────────────
function StepIndicator({ steps, current }) {
    return (
        <div className="step-indicator">
            {steps.map((label, i) => (
                <div key={i} className="step-indicator__item">
                    <div className={`step-indicator__number ${
                        i < current ? 'step-indicator__number--done' :
                        i === current ? 'step-indicator__number--active' :
                        'step-indicator__number--upcoming'
                    }`}>
                        {i < current ? <Check size={16} strokeWidth={3} /> : i + 1}
                    </div>
                    {i < steps.length - 1 && (
                        <div className={`step-indicator__line ${i < current ? 'step-indicator__line--done' : 'step-indicator__line--pending'}`} />
                    )}
                </div>
            ))}
        </div>
    );
}

// ── Hierarchy Card ──────────────────────────────────────────────────────────
function HierarchyCard({ item, selected, onClick, icon: Icon }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`hierarchy-card ${selected ? 'hierarchy-card--selected' : ''}`}
        >
            <div className="hierarchy-card__inner">
                <div className="hierarchy-card__icon">
                    <Icon size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="hierarchy-card__name">{item.name}</div>
                    {item.location && (
                        <div className="hierarchy-card__location">{item.location}</div>
                    )}
                </div>
                {selected && (
                    <div className="hierarchy-card__check">
                        <Check size={12} strokeWidth={3} />
                    </div>
                )}
            </div>
        </button>
    );
}

// ── Summary Item (left panel & mobile) ──────────────────────────────────────
function SummaryItem({ icon: Icon, label, value }) {
    return (
        <div className="onboard-summary-item">
            <div className="onboard-summary-item__icon"><Icon size={16} /></div>
            <div>
                <div className="onboard-summary-item__label">{label}</div>
                <div className="onboard-summary-item__value">{value}</div>
            </div>
            <div className="onboard-summary-item__check"><Check size={14} /></div>
        </div>
    );
}

// ── Awaiting Placeholder ────────────────────────────────────────────────────
function AwaitingPlaceholder({ icon: Icon, text }) {
    return (
        <div className="onboard-awaiting">
            <div className="onboard-awaiting__icon"><Icon size={24} /></div>
            <div className="onboard-awaiting__text">{text}</div>
        </div>
    );
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function Register({ intent = null }) {
    const [step, setStep] = useState(0);
    const [showPassword, setShowPassword] = useState(false);

    const roleMapping = {
        'pathfinder': 'pathfinder',
        'parent': 'parent',
        'leader': 'director',
        'district': 'district_official'
    };

    const queryParams = new URLSearchParams(window.location.search);
    const intentRole = queryParams.get('role');
    const intentDistrictId = queryParams.get('district_id');

    const dbRole = intentRole ? intentRole : (intent ? (roleMapping[intent] || 'observer') : 'observer');

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: dbRole,
        union_id: '',
        conference_id: '',
        zone_id: '',
        district_id: intentDistrictId || '',
        church_id: '',
        new_church_name: '',
    });

    const [hierarchy, setHierarchy] = useState({
        unions: [],
        conferences: [],
        zones: [],
        districts: [],
        churches: []
    });
    const [isCreatingClub, setIsCreatingClub] = useState(false);

    useEffect(() => { return () => reset('password', 'password_confirmation'); }, []);

    useEffect(() => {
        if (intent) {
            axios.get(route('hierarchy.unions')).then(res => setHierarchy(h => ({ ...h, unions: res.data })));
        }
    }, [intent]);

    useEffect(() => {
        if (data.union_id) {
            setHierarchy(h => ({ ...h, conferences: [], zones: [], districts: [], churches: [] }));
            axios.get(route('hierarchy.conferences', { union_id: data.union_id }))
                 .then(res => setHierarchy(h => ({ ...h, conferences: res.data })));
        }
    }, [data.union_id]);

    useEffect(() => {
        if (data.conference_id) {
            setHierarchy(h => ({ ...h, zones: [], districts: [], churches: [] }));
            axios.get(route('hierarchy.zones', { conference_id: data.conference_id }))
                 .then(res => setHierarchy(h => ({ ...h, zones: res.data })));
        }
    }, [data.conference_id]);

    useEffect(() => {
        if (data.zone_id) {
            setHierarchy(h => ({ ...h, districts: [], churches: [] }));
            axios.get(route('hierarchy.districts', { zone_id: data.zone_id, conference_id: data.conference_id }))
                 .then(res => setHierarchy(h => ({ ...h, districts: res.data })));
        }
    }, [data.zone_id]);

    useEffect(() => {
        if (data.district_id) {
            setHierarchy(h => ({ ...h, churches: [] }));
            axios.get(route('churches.search', { district_id: data.district_id }))
                 .then(res => setHierarchy(h => ({ ...h, churches: res.data })));
        }
    }, [data.district_id]);

    useEffect(() => {
        if (intentDistrictId && step === 0) {
            setStep(1); // Skip straight to church selection (or account if district intent)
        }
    }, [intentDistrictId]);

    const submit = (e) => {
        e.preventDefault();
        console.log('🚀 SUBMITTING REGISTRATION', { data, errors });
        post(route('register'), {
            onSuccess: () => {
                console.log('✅ Registration successful — redirecting...');
            },
            onError: (errs) => {
                console.log('❌ Registration ERRORS:', errs);
                // If there are errors on account fields, jump to step 2
                if (errs.name || errs.email || errs.password) {
                    setStep(2);
                } else if (errs.church_id || errs.new_church_name) {
                    setStep(1);
                } else {
                    setStep(0);
                }
            },
        });
    };

    // Auto-jump to step with errors
    useEffect(() => {
        if (errors.name || errors.email || errors.password) {
            setStep(2);
        }
    }, [errors]);

    // ── Intent Selection (No Intent Yet) ────────────────────────────────────
    if (!intent) {
        const intentOptions = [
            { id: 'pathfinder', label: 'Pathfinder', desc: 'Join a club, track classes & honours', icon: UserCircle },
            { id: 'parent', label: 'Parent / Guardian', desc: 'Monitor your child\'s progress', icon: Users },
            { id: 'leader', label: 'Club Director', desc: 'Manage a local church club', icon: Shield },
            { id: 'district', label: 'District Officer', desc: 'Oversee clubs in your district', icon: GraduationCap },
        ];

        return (
            <GuestLayout>
                <Head title="Join EmPFC" />
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div className="onboard-summary-item__icon" style={{ width: 56, height: 56, borderRadius: 16, margin: '0 auto 1.25rem' }}>
                        <Sparkles size={26} />
                    </div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 900, color: 'var(--clr-text-primary)', marginBottom: '0.5rem' }}>Join the Platform</h1>
                    <p style={{ fontSize: '0.875rem', color: 'var(--clr-text-secondary)', maxWidth: 360, margin: '0 auto' }}>How will you be using EmPFC? This helps us tailor your experience.</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                    {intentOptions.map((opt) => (
                        <Link
                            key={opt.id}
                            href={route('register', { intent: opt.id })}
                            className="hierarchy-card"
                            style={{ textAlign: 'center', padding: '1.5rem 1rem' }}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                                <div className="onboard-summary-item__icon" style={{ width: 44, height: 44, borderRadius: 12 }}>
                                    <opt.icon size={20} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--clr-text-primary)', marginBottom: 4 }}>{opt.label}</div>
                                    <div style={{ fontSize: 10, color: 'var(--clr-text-muted)', lineHeight: 1.5 }}>{opt.desc}</div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <Link href={route('login')} style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--clr-text-muted)' }}>
                        Already have an account? <span style={{ color: 'var(--clr-burgundy-500)' }}>Sign In</span>
                    </Link>
                </div>
            </GuestLayout>
        );
    }

    // ── Multi-Step Wizard ────────────────────────────────────────────────────
    const stepLabels = ['Organization', 'Local Church', 'Account'];
    const totalSteps = stepLabels.length;

    const canAdvance = () => {
        if (step === 0) return !!data.district_id;
        if (step === 1) return !!(data.church_id || data.new_church_name);
        return true;
    };

    const next = () => { if (canAdvance() && step < totalSteps - 1) setStep(s => s + 1); };
    const prev = () => { if (step > 0) setStep(s => s - 1); };

    // ── Build sidebar content ────────────────────────────────────────────────
    const summaryItems = [];
    if (data.union_id) summaryItems.push({ icon: Globe, label: 'Union', value: hierarchy.unions.find(u => u.id == data.union_id)?.name });
    if (data.conference_id) summaryItems.push({ icon: Layers, label: 'Conference / Field', value: hierarchy.conferences.find(c => c.id == data.conference_id)?.name });
    if (data.zone_id) summaryItems.push({ icon: Map, label: 'Zone', value: hierarchy.zones.find(z => z.id == data.zone_id)?.name });
    if (data.district_id) summaryItems.push({ icon: MapPin, label: 'District', value: hierarchy.districts.find(d => d.id == data.district_id)?.name });
    if (data.church_id) summaryItems.push({ icon: Church, label: 'Church', value: hierarchy.churches.find(c => c.id == data.church_id)?.name });
    if (data.new_church_name) summaryItems.push({ icon: Building, label: 'New Church', value: data.new_church_name });

    // What's next to be selected?
    const awaitingLabel = !data.union_id ? 'Awaiting Union Selection'
        : !data.conference_id ? 'Awaiting Field Selection'
        : !data.zone_id ? 'Awaiting Zone Selection'
        : !data.district_id ? 'Awaiting District Selection'
        : step === 1 && !data.church_id && !data.new_church_name ? 'Awaiting Church Selection'
        : null;
    const awaitingIcon = !data.union_id ? Globe
        : !data.conference_id ? Layers
        : !data.zone_id ? Map
        : !data.district_id ? MapPin
        : Church;

    // Build the descriptive quote for the sidebar
    const sidebarQuote = data.union_id && !data.conference_id
        ? `Selecting your field ensures all administrative records and reporting structures are correctly aligned with the ${hierarchy.unions.find(u => u.id == data.union_id)?.name} hierarchy.`
        : data.conference_id && !data.zone_id
        ? `Zones help organize districts within ${hierarchy.conferences.find(c => c.id == data.conference_id)?.name} for better coordination.`
        : data.zone_id && !data.district_id
        ? `Districts are the primary operational unit for Pathfinder activities in ${hierarchy.zones.find(z => z.id == data.zone_id)?.name}.`
        : step === 1
        ? `Your local church is the hub for all Pathfinder activities, events, and record-keeping.`
        : step === 2
        ? `Create your account credentials to finalize your registration.`
        : `Navigate the hierarchy to find your specific location within the organization.`;

    const leftPanel = (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div className="onboard-section-label">Organization Structure</div>

            {summaryItems.map((item, i) => (
                <SummaryItem key={i} icon={item.icon} label={item.label} value={item.value} />
            ))}

            {awaitingLabel && step < 2 && (
                <AwaitingPlaceholder icon={awaitingIcon} text={awaitingLabel} />
            )}

            {summaryItems.length > 0 && (
                <>
                    <hr style={{ border: 'none', borderTop: '1px solid var(--clr-border)', margin: '0.75rem 0' }} />
                    <p style={{ fontSize: '0.8125rem', color: 'var(--clr-text-muted)', lineHeight: 1.7, fontStyle: 'italic' }}>
                        "{sidebarQuote}"
                    </p>
                </>
            )}
        </div>
    );

    // ── Determine the current selection section label and active data ────────
    const getSelectionUI = () => {
        if (!data.union_id) {
            return {
                sectionIcon: Globe,
                sectionLabel: 'Select Union',
                items: hierarchy.unions,
                itemIcon: Globe,
                columns: 1,
                onSelect: (u) => setData(d => ({ ...d, union_id: u.id, conference_id: '', zone_id: '', district_id: '', church_id: '' })),
                selectedId: data.union_id,
            };
        }
        if (!data.conference_id) {
            return {
                sectionIcon: Layers,
                sectionLabel: 'Select Conference / Field',
                items: hierarchy.conferences,
                itemIcon: Layers,
                columns: 2,
                onSelect: (c) => setData(d => ({ ...d, conference_id: c.id, zone_id: '', district_id: '', church_id: '' })),
                selectedId: data.conference_id,
            };
        }
        if (!data.zone_id) {
            return {
                sectionIcon: Map,
                sectionLabel: 'Select Zone',
                items: hierarchy.zones,
                itemIcon: Map,
                columns: 2,
                onSelect: (z) => setData(d => ({ ...d, zone_id: z.id, district_id: '', church_id: '' })),
                selectedId: data.zone_id,
            };
        }
        return {
            sectionIcon: MapPin,
            sectionLabel: 'Select District',
            items: hierarchy.districts,
            itemIcon: MapPin,
            columns: 2,
            onSelect: (d) => setData(prev => ({ ...prev, district_id: d.id, church_id: '' })),
            selectedId: data.district_id,
        };
    };

    return (
        <GuestLayout
            leftPanel={leftPanel}
            backHref={route('register')}
            backLabel="Back"
            stepInfo={{ current: step + 1, total: totalSteps }}
        >
            <Head title="Register — EmPFC" />

            <StepIndicator steps={stepLabels} current={step} />

            <form onSubmit={submit}>
                {/* ── STEP 0: Organization Hierarchy ─────────────────────── */}
                {step === 0 && (() => {
                    const sel = getSelectionUI();
                    return (
                        <div className="onboard-fade-in">
                            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--clr-text-primary)', marginBottom: '0.5rem' }}>Select Your Organization</h2>
                                <p style={{ fontSize: '0.875rem', color: 'var(--clr-text-secondary)' }}>Navigate the hierarchy to find your specific location within the union's mission fields.</p>
                            </div>

                            {/* Mobile inline summary */}
                            {summaryItems.length > 0 && (
                                <div className="scope-summary-mobile">
                                    <div className="onboard-section-label">
                                        <Globe size={12} /> Selected Scope
                                    </div>
                                    {summaryItems.map((item, i) => (
                                        <SummaryItem key={i} icon={item.icon} label={item.label} value={item.value} />
                                    ))}
                                </div>
                            )}

                            <div className="onboard-section-label">
                                <sel.sectionIcon size={14} /> {sel.sectionLabel}
                            </div>

                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: sel.columns === 2 ? 'repeat(2, 1fr)' : '1fr', 
                                gap: '0.625rem',
                                maxHeight: 360,
                                overflowY: 'auto',
                                paddingRight: 4,
                            }}>
                                {sel.items.map(item => (
                                    <HierarchyCard
                                        key={item.id}
                                        item={item}
                                        icon={sel.itemIcon}
                                        selected={sel.selectedId == item.id}
                                        onClick={() => sel.onSelect(item)}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })()}

                {/* ── STEP 1: Local Church / Club ────────────────────────── */}
                {step === 1 && (
                    <div className="onboard-fade-in">
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--clr-text-primary)', marginBottom: '0.5rem' }}>Select Your Local Church</h2>
                            <p style={{ fontSize: '0.875rem', color: 'var(--clr-text-secondary)' }}>Pick your home church or school club from the list below.</p>
                        </div>

                        {!isCreatingClub ? (
                            <>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.625rem' }}>
                                    {hierarchy.churches.map(c => (
                                        <HierarchyCard
                                            key={c.id}
                                            item={c}
                                            icon={Church}
                                            selected={data.church_id == c.id}
                                            onClick={() => { setData('church_id', c.id); setData('new_church_name', ''); }}
                                        />
                                    ))}
                                </div>

                                {hierarchy.churches.length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--clr-text-muted)' }}>
                                        <Building size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.3 }} />
                                        <p style={{ fontSize: '0.875rem' }}>No churches registered in this district yet.</p>
                                        {intent === 'leader' && (
                                            <button type="button" onClick={() => setIsCreatingClub(true)} style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: 'var(--clr-burgundy-400)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>
                                                Register the first one →
                                            </button>
                                        )}
                                    </div>
                                )}

                                {intent === 'leader' && hierarchy.churches.length > 0 && (
                                    <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--clr-border)', textAlign: 'center', marginTop: '1rem' }}>
                                        <button type="button" onClick={() => setIsCreatingClub(true)} style={{ fontSize: '0.75rem', color: 'var(--clr-burgundy-400)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>
                                            Can't find your club? Register it now →
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="onboard-fade-in" style={{ padding: '1.5rem', background: 'rgba(155,34,38,0.05)', border: '1px solid rgba(155,34,38,0.15)', borderRadius: 16, position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: 0, right: 0, padding: '1.5rem', opacity: 0.05, pointerEvents: 'none' }}>
                                    <Building size={80} style={{ color: 'var(--clr-burgundy-500)' }} />
                                </div>
                                <div className="onboard-section-label" style={{ color: 'var(--clr-burgundy-500)' }}>Register New Church / Club</div>
                                <input 
                                    className="onboard-input"
                                    placeholder="e.g. SDA Church Kireka Central"
                                    value={data.new_church_name}
                                    onChange={e => { setData('new_church_name', e.target.value); setData('church_id', ''); }}
                                    autoFocus
                                />
                                <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 10 }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)', maxWidth: 280, lineHeight: 1.5 }}>This will submit the church/school to the district for verification.</div>
                                    <button type="button" onClick={() => { setIsCreatingClub(false); setData('new_church_name', ''); }} style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--clr-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                        <InputError message={errors.church_id} />
                        <InputError message={errors.new_church_name} />
                    </div>
                )}

                {/* ── STEP 2: Account Details ────────────────────────────── */}
                {step === 2 && (
                    <div className="onboard-fade-in">
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--clr-text-primary)', marginBottom: '0.5rem' }}>Create Your Account</h2>
                            <p style={{ fontSize: '0.875rem', color: 'var(--clr-text-secondary)' }}>Almost done! Set up your credentials to get started.</p>
                        </div>

                        {/* Summary Breadcrumb */}
                        <div style={{ padding: '0.75rem 1rem', background: 'var(--clr-surface-700)', border: '1px solid var(--clr-border)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--clr-text-muted)', overflowX: 'auto', marginBottom: '1.5rem' }}>
                            <span style={{ color: 'var(--clr-burgundy-500)', whiteSpace: 'nowrap' }}>{hierarchy.unions.find(u => u.id == data.union_id)?.name || '...'}</span>
                            <ChevronRight size={10} style={{ flexShrink: 0 }} />
                            <span style={{ whiteSpace: 'nowrap' }}>{hierarchy.conferences.find(c => c.id == data.conference_id)?.name || '...'}</span>
                            <ChevronRight size={10} style={{ flexShrink: 0 }} />
                            <span style={{ whiteSpace: 'nowrap' }}>{hierarchy.zones.find(z => z.id == data.zone_id)?.name || '...'}</span>
                            <ChevronRight size={10} style={{ flexShrink: 0 }} />
                            <span style={{ color: 'var(--clr-text-primary)', whiteSpace: 'nowrap' }}>
                                {data.new_church_name || hierarchy.churches.find(c => c.id == data.church_id)?.name || '...'}
                            </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label className="onboard-label">Full Name</label>
                                <input
                                    id="name"
                                    value={data.name}
                                    className="onboard-input"
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Enter full name"
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>
                            <div>
                                <label className="onboard-label">Email Address</label>
                                <input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    className="onboard-input"
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="your@email.com"
                                    required
                                />
                                <InputError message={errors.email} />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                            <div>
                                <label className="onboard-label">Create Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        className="onboard-input"
                                        style={{ paddingRight: '3rem' }}
                                        onChange={(e) => setData('password', e.target.value)}
                                        required
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--clr-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                <InputError message={errors.password} />
                            </div>
                            <div>
                                <label className="onboard-label">Confirm Password</label>
                                <input
                                    id="password_confirmation"
                                    type={showPassword ? 'text' : 'password'}
                                    value={data.password_confirmation}
                                    className="onboard-input"
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Navigation ─────────────────────────────────────────── */}
                <div style={{ marginTop: '2rem', display: 'flex', gap: '0.75rem' }}>
                    {step > 0 && (
                        <button
                            type="button"
                            onClick={prev}
                            style={{ padding: '0.875rem 1.25rem', borderRadius: 12, border: '1px solid var(--clr-border)', color: 'var(--clr-text-secondary)', background: 'var(--clr-surface-800)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', transition: 'all 200ms' }}
                        >
                            <ChevronLeft size={16} /> Back
                        </button>
                    )}

                    {step < totalSteps - 1 ? (
                        <button
                            type="button"
                            onClick={next}
                            disabled={!canAdvance()}
                            className="onboard-cta"
                            style={{ marginTop: 0 }}
                        >
                            Continue to Next Step <ArrowRight size={16} />
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={processing || !data.name || !data.email || !data.password}
                            className="onboard-cta"
                            style={{ marginTop: 0 }}
                        >
                            {processing ? 'Creating...' : 'Complete Registration'} <Sparkles size={16} />
                        </button>
                    )}
                </div>

                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    <Link href={route('login')} style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--clr-text-muted)' }}>
                        Already have an account? <span style={{ color: 'var(--clr-burgundy-500)' }}>Sign In</span>
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
