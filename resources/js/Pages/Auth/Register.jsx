import { useEffect, useState, useMemo } from 'react';
import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Search, Plus, Check, ChevronRight, UserCircle, Users, Shield, GraduationCap, ArrowLeft } from 'lucide-react';

export default function Register({ churches = [], intent = null }) {
    const [churchSearch, setChurchSearch] = useState('');
    const [showChurchDropdown, setShowChurchDropdown] = useState(false);

    // Map intent to database role names
    const roleMapping = {
        'pathfinder': 'pathfinder',
        'parent': 'parent',
        'leader': 'director',
        'district': 'district_official'
    };

    const dbRole = intent ? (roleMapping[intent] || 'observer') : 'observer';

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: dbRole,
        church_id: '',
        new_church_name: '',
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

    // Selection View if no intent is provided
    if (!intent) {
        const intentOptions = [
            { id: 'pathfinder', label: 'I\'m joining a club', icon: UserCircle, desc: 'Find your club, track classes, and manage your pathfinder journey.', color: 'text-burgundy-400' },
            { id: 'parent', label: 'I\'m registering my child', icon: Users, desc: 'Track your children, view events, and manage club payments.', color: 'text-blue-400' },
            { id: 'leader', label: 'I\'m managing a club', icon: Shield, desc: 'Manage members, track attendance, and run camp registrations.', color: 'text-gold-400' },
            { id: 'district', label: 'I\'m a district/conference officer', icon: GraduationCap, desc: 'Monitor clubs, view reports, and approve leadership requests.', color: 'text-purple-400' },
        ];

        return (
            <GuestLayout>
                <Head title="Join EmPFC" />
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-black text-white mb-3">Join the Platform</h1>
                    <p className="text-sm text-gray-400 max-w-md mx-auto">Select how you will be using EmPFC to get a tailored onboarding experience.</p>
                </div>

                <div className="space-y-4">
                    {intentOptions.map((opt) => (
                        <Link
                            key={opt.id}
                            href={route('register', { intent: opt.id })}
                            className="flex items-start gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-left group"
                        >
                            <div className={`p-3 rounded-xl bg-white/5 ${opt.color} group-hover:scale-110 transition-transform`}>
                                <opt.icon size={24} />
                            </div>
                            <div className="flex-1 pt-1">
                                <div className="font-bold text-white text-lg tracking-tight mb-1">{opt.label}</div>
                                <div className="text-xs text-gray-400 leading-relaxed">{opt.desc}</div>
                            </div>
                            <div className="pt-2 text-gray-600 group-hover:text-white transition-colors">
                                <ChevronRight size={20} />
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="mt-8 text-center">
                    <Link href={route('login')} className="text-xs font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest">
                        Already have an account? Sign In
                    </Link>
                </div>
            </GuestLayout>
        );
    }

    // Specific Intent Configs
    const intentConfig = {
        pathfinder: {
            title: 'Club Member Registration',
            subtitle: 'Create your account to start your journey.',
            benefits: ['Find your club', 'Choose age group', 'Track classes'],
        },
        parent: {
            title: 'Parent / Guardian Account',
            subtitle: 'Create an account to manage your family.',
            benefits: ['Track your children', 'Receive announcements', 'Manage payments'],
        },
        leader: {
            title: 'Club Leader Registration',
            subtitle: 'Request management access for your club.',
            benefits: ['Manage members', 'Track attendance', 'Generate reports'],
        },
        district: {
            title: 'District / Conference Registration',
            subtitle: 'Register for higher-level oversight.',
            benefits: ['Monitor clubs', 'Track membership', 'View district reports'],
        }
    };

    const currentConfig = intentConfig[intent] || intentConfig.pathfinder;

    return (
        <GuestLayout>
            <Head title={`Register - ${currentConfig.title}`} />

            <div className="mb-6">
                <Link href={route('register')} className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest mb-6">
                    <ArrowLeft size={14} /> Back to options
                </Link>
                <h1 className="text-2xl font-black text-white mb-2">{currentConfig.title}</h1>
                <p className="text-sm text-gray-400">{currentConfig.subtitle}</p>
            </div>

            {/* Value Proposition Box */}
            <div className="mb-8 p-4 bg-burgundy-500/10 border border-burgundy-500/20 rounded-2xl">
                <div className="text-[10px] font-black uppercase tracking-widest text-burgundy-400 mb-3">What you can do:</div>
                <ul className="space-y-2">
                    {currentConfig.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                            <Check size={14} className="text-burgundy-500" /> {benefit}
                        </li>
                    ))}
                </ul>
            </div>

            <form onSubmit={submit} className="space-y-6">
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

                {/* Church Search (Always needed for linking) */}
                <div className="relative space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">
                        {intent === 'district' ? 'Primary Church / District Base' : 'Local Church / Club'}
                    </label>
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
                            <Check size={14} strokeWidth={3} /> Verified: {churchSearch}
                        </div>
                    )}
                    {data.new_church_name && (
                        <div className="mt-3 p-3 bg-burgundy-500\/10 border border-burgundy-500\/20 rounded-xl flex items-center gap-2 text-[10px] font-black text-burgundy-400 uppercase tracking-widest">
                            <Plus size={14} strokeWidth={3} /> Requesting: {data.new_church_name}
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
                        className="w-full py-5 bg-gradient-to-r from-burgundy-600 to-burgundy-700 hover:from-burgundy-500 hover:to-burgundy-600 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-2xl transition-all border border-white/5 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {processing ? 'Processing...' : 'Complete Registration'} <ChevronRight size={16} />
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}
