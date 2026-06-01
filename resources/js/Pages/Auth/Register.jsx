import { useEffect, useState, useMemo } from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Shield, GraduationCap, Users, UserCircle, Search, Plus, Check, ChevronRight, Image as ImageIcon } from 'lucide-react';

export default function Register({ churches = [] }) {
    const [step, setStep] = useState(1);
    const [churchSearch, setChurchSearch] = useState('');
    const [showChurchDropdown, setShowChurchDropdown] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'director', // Default
        church_id: '',
        new_church_name: '',
        is_master_guide: false,
        club_role: '',
        avatar: null,
    });

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    const filteredChurches = useMemo(() => {
        if (!churchSearch) return [];
        return churches.filter(c => 
            c.name.toLowerCase().includes(churchSearch.toLowerCase()) || 
            c.location?.toLowerCase().includes(churchSearch.toLowerCase())
        );
    }, [churchSearch, churches]);

    const handleSelectChurch = (church) => {
        setData('church_id', church.id);
        setData('new_church_name', '');
        setChurchSearch(church.name);
        setShowChurchDropdown(false);
    };

    const handleAddNewChurch = () => {
        setData('church_id', '');
        setData('new_church_name', churchSearch);
        setShowChurchDropdown(false);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('register'));
    };

    const roles = [
        { id: 'pathfinder', label: 'I am a Pathfinder', icon: UserCircle, desc: 'Joining a local club' },
        { id: 'parent', label: 'I am a Parent/Guardian', icon: Users, desc: 'Managing children' },
        { id: 'director', label: 'I am a Club Leader', icon: Shield, desc: 'Director or Master Guide' },
        { id: 'district_official', label: 'District/Conference official', icon: GraduationCap, desc: 'Higher level oversight' },
        { id: 'observer', label: 'I’m just exploring / Other', icon: Search, desc: 'Not listed above' },
    ];

    return (
        <GuestLayout>
            <Head title="Join EmPFC" />

            <div className="mb-8">
                <h1 className="text-2xl font-black text-white mb-2">Join the Platform</h1>
                <p className="text-sm text-gray-400">Step {step} of 2: {step === 1 ? 'Select your purpose' : 'Account details'}</p>
                <div className="flex gap-2 mt-4">
                    <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-burgundy-500' : 'bg-white/10'}`}></div>
                    <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-burgundy-500' : 'bg-white/10'}`}></div>
                </div>
            </div>

            <form onSubmit={submit} className="mt-8">
                {step === 1 && (
                    <div className="space-y-4">
                        <div className="flex flex-col gap-3">
                            {roles.map((role) => (
                                <button
                                    key={role.id}
                                    type="button"
                                    onClick={() => setData('role', role.id)}
                                    className={`flex items-center gap-4 p-5 rounded-2xl border transition-all text-left ${
                                        data.role === role.id 
                                            ? 'bg-burgundy-500\/10 border-burgundy-500 shadow-xl' 
                                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                                    }`}
                                >
                                    <div className={`p-3 rounded-xl ${data.role === role.id ? 'bg-burgundy-500 text-white' : 'bg-white/10 text-gray-500'}`}>
                                        <role.icon size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-white text-sm tracking-tight">{role.label}</div>
                                        <div className="text-[11px] text-gray-500 font-medium">{role.desc}</div>
                                    </div>
                                    {data.role === role.id && (
                                        <div className="h-6 w-6 bg-burgundy-500 rounded-full flex items-center justify-center text-white scale-110">
                                            <Check size={14} strokeWidth={4} />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>

                        <button 
                            type="button" 
                            className="w-full mt-6 py-4 bg-burgundy-500 hover:bg-burgundy-400 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-xl transition-all flex items-center justify-center gap-2"
                            onClick={() => setStep(2)}
                        >
                            Continue <ChevronRight size={16} />
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6">
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Full Name</label>
                                <input
                                    id="name"
                                    value={data.name}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-burgundy-500 focus:bg-white/10 transition-all outline-none"
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Enter full name"
                                    required
                                />
                                <InputError message={errors.name} className="mt-1" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Email Address</label>
                                <input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-burgundy-500 focus:bg-white/10 transition-all outline-none"
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="your@email.com"
                                    required
                                />
                                <InputError message={errors.email} className="mt-1" />
                            </div>
                        </div>

                        {/* Church Search */}
                        <div className="relative space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Local Church / Club</label>
                            <div className="relative">
                                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                                <input
                                    value={churchSearch}
                                    placeholder="Search your church or region..."
                                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-burgundy-500 focus:bg-white/10 transition-all outline-none"
                                    onChange={(e) => {
                                        setChurchSearch(e.target.value);
                                        setShowChurchDropdown(true);
                                    }}
                                />
                            </div>
                            
                            {showChurchDropdown && (churchSearch.length > 0) && (
                                <div className="absolute z-50 w-full mt-2 bg-surface-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">
                                    <div className="max-h-60 overflow-y-auto">
                                        {filteredChurches.map(church => (
                                            <button
                                                key={church.id}
                                                type="button"
                                                className="w-full px-5 py-4 text-left hover:bg-white/5 border-b border-white/5 transition-colors flex justify-between items-center group"
                                                onClick={() => handleSelectChurch(church)}
                                            >
                                                <div>
                                                    <div className="text-sm font-bold text-white group-hover:text-gold-500 transition-colors">{church.name}</div>
                                                    <div className="text-[10px] text-gray-600 uppercase font-black tracking-widest mt-0.5">{church.location || 'Uganda, Central'}</div>
                                                </div>
                                                <ChevronRight size={14} className="text-gray-700" />
                                            </button>
                                        ))}
                                    </div>
                                    
                                    <button
                                        type="button"
                                        className="w-full px-5 py-4 text-left bg-burgundy-500\/10 hover:bg-burgundy-500\/20 transition-all flex items-center gap-4"
                                        onClick={handleAddNewChurch}
                                    >
                                        <div className="h-8 w-8 bg-burgundy-500 rounded-lg flex items-center justify-center text-white">
                                            <Plus size={16} />
                                        </div>
                                        <div>
                                            <div className="text-sm font-black text-burgundy-400">Can't find "{churchSearch}"?</div>
                                            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Request registration for this club</div>
                                        </div>
                                    </button>
                                </div>
                            )}

                            {data.church_id && (
                                <div className="mt-3 p-3 bg-white/10 border border-white/20 rounded-xl flex items-center gap-2 text-[10px] font-black text-white uppercase tracking-widest">
                                    <Check size={14} strokeWidth={3} /> Verified Club: {churchSearch}
                                </div>
                            )}
                            {data.new_church_name && (
                                <div className="mt-3 p-3 bg-burgundy-500\/10 border border-burgundy-500\/20 rounded-xl flex items-center gap-2 text-[10px] font-black text-burgundy-400 uppercase tracking-widest">
                                    <Plus size={14} strokeWidth={3} /> Registration Requested: {data.new_church_name}
                                </div>
                            )}
                            <InputError message={errors.church_id} className="mt-1" />
                        </div>

                        {/* Password */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Create Password</label>
                                <input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-burgundy-500 transition-all outline-none"
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                />
                                <InputError message={errors.password} className="mt-1" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Confirm Secret</label>
                                <input
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:border-burgundy-500 transition-all outline-none"
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="pt-6 border-t border-white/5 space-y-5">
                            <div className="flex items-center justify-between">
                                <button 
                                    type="button" 
                                    onClick={() => setStep(1)}
                                    className="text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-white transition-colors"
                                >
                                    ← Back to Selection
                                </button>

                                <Link
                                    href={route('login')}
                                    className="text-[10px] font-black uppercase tracking-widest text-gold-500 hover:text-white transition-colors"
                                >
                                    Already a member?
                                </Link>
                            </div>

                            <button 
                                type="submit"
                                disabled={processing}
                                className="w-full py-5 bg-gradient-to-r from-burgundy-600 to-burgundy-700 hover:from-burgundy-500 hover:to-burgundy-600 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-2xl transition-all border border-white/5 disabled:opacity-50"
                            >
                                {processing ? 'Initializing Profile...' : 'Complete Secure Registration'}
                            </button>
                        </div>
                    </div>
                )}
            </form>

        </GuestLayout>
    );
}
