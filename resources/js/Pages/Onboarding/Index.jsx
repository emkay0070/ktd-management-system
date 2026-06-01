import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import { Shield, Users, Star, GraduationCap, Clock, ChevronRight } from 'lucide-react';

export default function OnboardingIndex({ role, church_status, church_name }) {
    const { data, setData, post, processing, errors } = useForm({
        dob: '',
        gender: 'Male',
        current_class: 'Friend',
        children_names: '',
        investiture_year: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('onboarding.store'));
    };

    const renderRoleContent = () => {
        if (role === 'pathfinder') {
            return (
                <div className="space-y-5">
                    <div className="flex items-center gap-3 mb-6 p-4 bg-burgundy-500/10 border border-burgundy-500/20 rounded-xl">
                        <Star className="text-burgundy-400" />
                        <div>
                            <h3 className="text-sm font-bold text-white">Pathfinder Setup</h3>
                            <p className="text-xs text-gray-400">Complete your profile to get placed in the right class.</p>
                        </div>
                    </div>
                    
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Date of Birth</label>
                        <input
                            type="date"
                            value={data.dob}
                            onChange={e => setData('dob', e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-burgundy-500 outline-none"
                            required
                        />
                        <InputError message={errors.dob} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Gender</label>
                            <select
                                value={data.gender}
                                onChange={e => setData('gender', e.target.value)}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-burgundy-500 outline-none appearance-none"
                            >
                                <option value="Male" className="bg-surface-900 text-white">Male</option>
                                <option value="Female" className="bg-surface-900 text-white">Female</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Current Class</label>
                            <select
                                value={data.current_class}
                                onChange={e => setData('current_class', e.target.value)}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-burgundy-500 outline-none appearance-none"
                            >
                                {['Friend', 'Companion', 'Explorer', 'Ranger', 'Voyager', 'Guide'].map(c => (
                                    <option key={c} value={c} className="bg-surface-900 text-white">{c}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            );
        }

        if (role === 'parent') {
            return (
                <div className="space-y-5">
                    <div className="flex items-center gap-3 mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                        <Users className="text-blue-400" />
                        <div>
                            <h3 className="text-sm font-bold text-white">Parent Setup</h3>
                            <p className="text-xs text-gray-400">You can link your children later from the dashboard.</p>
                        </div>
                    </div>
                    
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Notes (Optional)</label>
                        <textarea
                            value={data.children_names}
                            onChange={e => setData('children_names', e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-burgundy-500 outline-none min-h-[100px]"
                            placeholder="Names of children to link..."
                        />
                    </div>
                </div>
            );
        }

        if (role === 'master_guide') {
            return (
                <div className="space-y-5">
                    <div className="flex items-center gap-3 mb-6 p-4 bg-gold-500/10 border border-gold-500/20 rounded-xl">
                        <GraduationCap className="text-gold-400" />
                        <div>
                            <h3 className="text-sm font-bold text-white">Master Guide Profile</h3>
                            <p className="text-xs text-gray-400">Complete your leadership profile.</p>
                        </div>
                    </div>
                    
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Year of Investiture (Optional)</label>
                        <input
                            type="number"
                            value={data.investiture_year}
                            onChange={e => setData('investiture_year', e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-burgundy-500 outline-none"
                            placeholder="e.g. 2018"
                        />
                    </div>
                </div>
            );
        }

        if (role === 'director' || role === 'district_official') {
            const roleDisplay = role === 'director' ? 'Club Leader' : 'District Official';
            
            return (
                <div className="space-y-5">
                    <div className="flex flex-col items-center justify-center text-center p-8 bg-white/5 border border-white/10 rounded-2xl">
                        <div className="h-16 w-16 bg-burgundy-500/20 rounded-full flex items-center justify-center mb-4">
                            <Clock className="text-burgundy-400" size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Pending Verification</h3>
                        <p className="text-sm text-gray-400 max-w-sm">
                            Your account has been created successfully. Because you selected a leadership role ({roleDisplay}), an administrator must verify and approve your status before you gain full access to the management features.
                        </p>
                        {church_status === 'pending_verification' && (
                            <div className="mt-4 p-3 bg-gold-500/10 border border-gold-500/20 rounded-xl text-xs text-gold-400 text-left">
                                <strong>Note:</strong> The church you registered ({church_name}) is also pending verification by the district.
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return (
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl text-center">
                <p className="text-gray-400">You are all set! Proceed to your dashboard.</p>
            </div>
        );
    };

    return (
        <GuestLayout>
            <Head title="Complete Profile" />

            <div className="mb-8">
                <h1 className="text-2xl font-black text-white mb-2">Almost There!</h1>
                <p className="text-sm text-gray-400">Complete your profile to get started.</p>
            </div>

            <form onSubmit={submit} className="space-y-6">
                {renderRoleContent()}

                <button 
                    type="submit"
                    disabled={processing}
                    className="w-full py-4 bg-burgundy-500 hover:bg-burgundy-400 text-white font-black uppercase tracking-[0.2em] text-xs rounded-xl shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {processing ? 'Processing...' : 'Complete Setup'} <ChevronRight size={16} />
                </button>
            </form>
        </GuestLayout>
    );
}
