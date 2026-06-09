import { useState, useEffect, useRef } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import { Shield, Users, Star, GraduationCap, Clock, ChevronRight, RefreshCw, LogOut, Tent, CheckCircle } from 'lucide-react';

export default function OnboardingIndex({ role, church_status, church_name }) {
    const { data, setData, post, processing, errors } = useForm({
        dob: '',
        gender: 'Male',
        current_class: 'Friend',
        children_names: '',
        investiture_year: '',
        mg_status: 'MGT', // Default to Master Guide in Training
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('onboarding.store'));
    };

    // ── Auto-polling for approval status ───────────────────────────────────
    const [approved, setApproved] = useState(false);
    const [polling, setPolling] = useState(false);
    const intervalRef = useRef(null);

    useEffect(() => {
        const isDistrictRole = [
            'district_official', 'district_director', 'district_treasurer', 'district_secretary', 
            'district_committee', 'district_curriculum_coordinator', 'district_masterguide_coordinator', 
            'district_communication_coordinator', 'district_music_coordinator', 'district_welfare_coordinator', 
            'district_pbe_coordinator', 'district_programs_coordinator'
        ].includes(role);
        if (!isDistrictRole && role !== 'director') return;

        const checkStatus = async () => {
            try {
                setPolling(true);
                const res = await fetch('/api/onboarding/status', {
                    headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                    credentials: 'same-origin',
                });
                if (!res.ok) return;
                const data = await res.json();
                if (data.approved) {
                    setApproved(true);
                    clearInterval(intervalRef.current);
                    // Auto-redirect after a brief celebration
                    setTimeout(() => router.visit(route('dashboard')), 2500);
                }
            } catch (e) {
                // Silently fail — network hiccups shouldn't break the UI
            } finally {
                setPolling(false);
            }
        };

        // Check immediately on mount, then every 10 seconds
        checkStatus();
        intervalRef.current = setInterval(checkStatus, 10000);

        return () => clearInterval(intervalRef.current);
    }, [role]);

    // ── Approved state — celebration screen ──────────────────────────────────
    if (approved) {
        const isDistrict = [
            'district_official', 'district_director', 'district_treasurer', 'district_secretary', 
            'district_committee', 'district_curriculum_coordinator', 'district_masterguide_coordinator', 
            'district_communication_coordinator', 'district_music_coordinator', 'district_welfare_coordinator', 
            'district_pbe_coordinator', 'district_programs_coordinator'
        ].includes(role);
        return (
            <GuestLayout>
                <Head title="Approved! — EmPFC" />
                <div className="waiting-room" style={{ borderTop: `4px solid ${isDistrict ? 'var(--clr-gold-500)' : 'var(--clr-blue-500)'}`, textAlign: 'center' }}>
                    <div className="waiting-room__icon" style={{ background: isDistrict ? 'var(--clr-gold-500)' : 'var(--clr-blue-500)', color: 'white', animation: 'pulse 1.5s ease infinite' }}>
                        <CheckCircle size={32} />
                    </div>
                    <h2 className="waiting-room__title" style={{ color: isDistrict ? 'var(--clr-gold-500)' : 'var(--clr-blue-500)' }}>You've Been Approved!</h2>
                    <p className="waiting-room__desc">
                        Your <strong>{isDistrict ? 'District Official' : 'Club Director'}</strong> role has been verified.
                        Redirecting you to your dashboard…
                    </p>
                    <div style={{ marginTop: '1.5rem' }}>
                        <Link href={route('dashboard')} className="waiting-room__refresh" style={{ background: isDistrict ? 'var(--clr-gold-500)' : 'var(--clr-blue-500)', color: 'white', fontWeight: 700 }}>
                            Go to Dashboard Now →
                        </Link>
                    </div>
                </div>
                <style dangerouslySetInnerHTML={{ __html: `@keyframes pulse { 0%,100% { transform:scale(1); } 50% { transform:scale(1.1); } }` }} />
            </GuestLayout>
        );
    }

    // ── Waiting Room for leadership roles ────────────────────────────────────
    if ([
        'district_official', 'district_director', 'district_treasurer', 'district_secretary', 
        'district_committee', 'district_curriculum_coordinator', 'district_masterguide_coordinator', 
        'district_communication_coordinator', 'district_music_coordinator', 'district_welfare_coordinator', 
        'district_pbe_coordinator', 'district_programs_coordinator'
    ].includes(role)) {
        return (
            <GuestLayout>
                <Head title="Pending Verification — EmPFC" />
                <div className="waiting-room" style={{ borderTop: '4px solid var(--clr-burgundy-500)' }}>
                    <div className="waiting-room__icon" style={{ background: 'var(--clr-burgundy-500)', color: 'white' }}>
                        <Shield size={32} />
                    </div>
                    <h2 className="waiting-room__title">District Headquarters</h2>
                    <p className="waiting-room__desc">
                        Your application for <span className="waiting-room__role" style={{ color: 'var(--clr-gold-500)' }}>District Official</span> is being reviewed by Conference Leadership.
                    </p>

                    {church_status === 'pending_verification' && (
                        <div className="waiting-room__note">
                            <strong style={{ color: 'var(--clr-gold-500)' }}>Note:</strong> The church you registered (<em>{church_name}</em>) is also pending verification by the district.
                        </div>
                    )}

                    <div className="waiting-room__note" style={{ background: 'rgba(212, 160, 23, 0.05)', border: '1px solid rgba(212, 160, 23, 0.2)' }}>
                        <Users size={14} style={{ marginBottom: 8, color: 'var(--clr-gold-500)' }} />
                        Credentials for high-level roles require administrative background checks for district security. This usually takes 24–48 hours.
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1.5rem' }}>
                        <button onClick={() => router.visit(route('dashboard'))} className="waiting-room__refresh" style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'white', border: 'none', cursor: 'pointer' }}>
                            <RefreshCw size={14} className={polling ? 'animate-spin' : ''} /> {polling ? 'Checking…' : 'Refresh Status'}
                        </button>
                        <Link href={route('logout')} method="post" as="button" className="waiting-room__refresh" style={{ color: 'var(--clr-text-muted)' }}>
                            <LogOut size={14} /> Logout
                        </Link>
                    </div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--clr-text-muted)', marginTop: '1rem', opacity: 0.6 }}>
                        Auto-checking every 10 seconds — you'll be redirected automatically once approved.
                    </p>
                </div>
            </GuestLayout>
        );
    }

    if (role === 'director') {
        return (
            <GuestLayout>
                <Head title="Pending Verification — EmPFC" />
                <div className="waiting-room" style={{ borderTop: '4px solid var(--clr-blue-500)' }}>
                    <div className="waiting-room__icon" style={{ background: 'var(--clr-blue-500)', color: 'white' }}>
                        <Tent size={32} />
                    </div>
                    <h2 className="waiting-room__title">Club Operations</h2>
                    <p className="waiting-room__desc">
                        Your application for <span className="waiting-room__role" style={{ color: 'var(--clr-cyan-400)' }}>Club Director</span> is being reviewed by District Leadership.
                    </p>

                    {church_status === 'pending_verification' && (
                        <div className="waiting-room__note">
                            <strong style={{ color: 'var(--clr-cyan-400)' }}>Note:</strong> The church you registered (<em>{church_name}</em>) is also pending verification.
                        </div>
                    )}

                    <div className="waiting-room__note" style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                        <Clock size={14} style={{ marginBottom: 8, color: 'var(--clr-blue-400)' }} />
                        Club leadership roles are verified by your District Director to ensure accurate local club assignments.
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1.5rem' }}>
                        <button onClick={() => router.visit(route('dashboard'))} className="waiting-room__refresh" style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'white', border: 'none', cursor: 'pointer' }}>
                            <RefreshCw size={14} className={polling ? 'animate-spin' : ''} /> {polling ? 'Checking…' : 'Refresh Status'}
                        </button>
                        <Link href={route('logout')} method="post" as="button" className="waiting-room__refresh" style={{ color: 'var(--clr-text-muted)' }}>
                            <LogOut size={14} /> Logout
                        </Link>
                    </div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--clr-text-muted)', marginTop: '1rem', opacity: 0.6 }}>
                        Auto-checking every 10 seconds — you'll be redirected automatically once approved.
                    </p>
                </div>
            </GuestLayout>
        );
    }

    // ── Role-specific onboarding forms ───────────────────────────────────────
    const renderRoleContent = () => {
        if (role === 'pathfinder') {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: 'rgba(155,34,38,0.06)', border: '1px solid rgba(155,34,38,0.12)', borderRadius: 12 }}>
                        <Star style={{ color: 'var(--clr-burgundy-400)' }} />
                        <div>
                            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--clr-text-primary)' }}>Pathfinder Setup</h3>
                            <p style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>Complete your profile to get placed in the right class.</p>
                        </div>
                    </div>

                    <div>
                        <label className="onboard-label">Date of Birth</label>
                        <input
                            type="date"
                            value={data.dob}
                            onChange={e => setData('dob', e.target.value)}
                            className="onboard-input"
                            required
                        />
                        <InputError message={errors.dob} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label className="onboard-label">Gender</label>
                            <select
                                value={data.gender}
                                onChange={e => setData('gender', e.target.value)}
                                className="onboard-input"
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                        <div>
                            <label className="onboard-label">Current Class</label>
                            <select
                                value={data.current_class}
                                onChange={e => setData('current_class', e.target.value)}
                                className="onboard-input"
                            >
                                {['Friend', 'Companion', 'Explorer', 'Ranger', 'Voyager', 'Guide'].map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            );
        }

        if (role === 'parent') {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.12)', borderRadius: 12 }}>
                        <Users style={{ color: 'var(--clr-info)' }} />
                        <div>
                            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--clr-text-primary)' }}>Parent Setup</h3>
                            <p style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>You can link your children later from the dashboard.</p>
                        </div>
                    </div>

                    <div>
                        <label className="onboard-label">Notes (Optional)</label>
                        <textarea
                            value={data.children_names}
                            onChange={e => setData('children_names', e.target.value)}
                            className="onboard-input"
                            style={{ minHeight: 100, resize: 'vertical' }}
                            placeholder="Names of children to link..."
                        />
                    </div>
                </div>
            );
        }

        if (role === 'master_guide') {
            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: 'rgba(212,160,23,0.06)', border: '1px solid rgba(212,160,23,0.12)', borderRadius: 12 }}>
                        <GraduationCap style={{ color: 'var(--clr-gold-400)' }} />
                        <div>
                            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--clr-text-primary)' }}>Master Guide Profile</h3>
                            <p style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>Complete your leadership profile.</p>
                        </div>
                    </div>

                    <div>
                        <label className="onboard-label">Investiture Status</label>
                        <select
                            value={data.mg_status}
                            onChange={e => setData('mg_status', e.target.value)}
                            className="onboard-input"
                        >
                            <option value="MGT">Master Guide in Training (MGT)</option>
                            <option value="MG">Invested Master Guide (MG)</option>
                        </select>
                    </div>

                    {data.mg_status === 'MG' && (
                        <div>
                            <label className="onboard-label">Year of Investiture (Optional)</label>
                            <input
                                type="number"
                                value={data.investiture_year}
                                onChange={e => setData('investiture_year', e.target.value)}
                                className="onboard-input"
                                placeholder="e.g. 2018"
                            />
                        </div>
                    )}
                </div>
            );
        }

        // Fallback
        return (
            <div style={{ padding: '1.5rem', background: 'var(--clr-surface-700)', border: '1px solid var(--clr-border)', borderRadius: 16, textAlign: 'center' }}>
                <p style={{ color: 'var(--clr-text-muted)' }}>You are all set! Proceed to your dashboard.</p>
            </div>
        );
    };

    return (
        <GuestLayout>
            <Head title="Complete Profile — EmPFC" />

            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--clr-text-primary)', marginBottom: '0.5rem' }}>Almost There!</h1>
                <p style={{ fontSize: '0.875rem', color: 'var(--clr-text-secondary)' }}>Complete your profile to get started.</p>
            </div>

            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {renderRoleContent()}

                <button 
                    type="submit"
                    disabled={processing}
                    className="onboard-cta"
                >
                    {processing ? 'Processing...' : 'Complete Setup'} <ChevronRight size={16} />
                </button>
            </form>
        </GuestLayout>
    );
}
