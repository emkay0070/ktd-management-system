import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Shield, GraduationCap, Users, UserCircle, ChevronRight, Check, UserCheck, Clock, Building, Search, ArrowRight } from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';
import { useState, useEffect } from 'react';

export default function SetupWizard({ user, roles = [], state = {} }) {
    const { pending_roles = [], active_roles = [], has_church = false, has_linked_child = false } = state;
    
    // Determine the current logical "Step" based on the state engine
    const getActiveStep = () => {
        const allRoles = [...pending_roles, ...active_roles];
        if (allRoles.length === 0) return 'SELECT_ROLE';
        
        if (pending_roles.length > 0 && active_roles.length === 0) return 'AWAITING_APPROVAL';
        
        if (allRoles.includes('parent') && !has_linked_child) return 'LINK_CHILD';
        
        if (!has_church && !allRoles.includes('district_official')) return 'JOIN_CLUB';
        
        return 'FINISH';
    };

    const currentStep = getActiveStep();
    const { data, setData, post, processing } = useForm({
        intent: '',
        church_id: '',
        child_name: '',
    });

    const activateAndGo = (e) => {
        e.preventDefault();
        post(route('onboarding.store'));
    };

    const submitIntent = (e) => {
        e.preventDefault();
        post(route('dashboard')); // The service handles the status changes
    };

    return (
        <GuestLayout>
            <Head title="Account Setup — EmPFC" />

            <div className="max-w-md mx-auto py-12 px-6">
                <div className="text-center mb-10">
                    <div className="inline-flex p-4 rounded-3xl bg-burgundy-500/10 text-burgundy-500 mb-6">
                        <UserCheck size={32} />
                    </div>
                    <h1 className="text-3xl font-black text-white mb-3">Welcome, {user.name}</h1>
                </div>

                <div className="space-y-8">
                    {/* STEP 1: ROLE SELECTION */}
                    {currentStep === 'SELECT_ROLE' && (
                        <div className="space-y-6 fade-in">
                            <div>
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-burgundy-400 mb-2">Step 1: Role Intent</div>
                                <p className="text-sm text-gray-400">Choose how you wish to engage with the platform.</p>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-3">
                                {roles.filter(r => r.name !== 'observer').map((role) => (
                                    <button
                                        key={role.id}
                                        type="button"
                                        onClick={() => setData('intent', role.name)}
                                        className={`flex items-center gap-4 p-5 rounded-2xl border transition-all text-left ${
                                            data.intent === role.name 
                                                ? 'bg-burgundy-900/30 border-burgundy-500/50 ring-1 ring-burgundy-500' 
                                                : 'bg-white/5 border-white/10 hover:bg-white/10'
                                        }`}
                                    >
                                        <div className="flex-1">
                                            <div className="font-bold text-white text-base">{role.display_name}</div>
                                            <div className="text-xs text-gray-500">{role.description || 'Join the district in this capacity'}</div>
                                        </div>
                                        {data.intent === role.name && <div className="p-1 bg-burgundy-500 rounded-full text-white"><Check size={14} /></div>}
                                    </button>
                                ))}
                            </div>

                            <PrimaryButton className="w-full py-5 text-base" onClick={submitIntent} disabled={processing || !data.intent}>
                                Continue Setup <ChevronRight size={18} className="ml-2" />
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
                        <div className="space-y-6 fade-in text-center">
                            <div className="w-16 h-16 bg-burgundy-500/10 text-burgundy-500 rounded-full flex items-center justify-center mx-auto">
                                <Building size={32} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-white">Find Your Club</h3>
                                <p className="text-sm text-gray-400">Join a local church club to access activities and reports.</p>
                            </div>
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                <input 
                                    className="w-full bg-white/5 border-white/10 rounded-xl text-white pl-12 pr-4 py-4"
                                    placeholder="Search for your church..."
                                />
                            </div>
                            <PrimaryButton className="w-full py-5">
                                Search Clubs <Search size={18} className="ml-2" />
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
