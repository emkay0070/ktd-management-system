import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Search, Compass, ShieldCheck, Mail, Clock, ArrowRight, Info } from 'lucide-react';

export default function Observer({ user, bulletins = [] }) {
    return (
        <AuthenticatedLayout 
            header="Gateway Portal" 
            breadcrumb="Discovery → Member Home"
        >
            <Head title="Observer Portal — EmPFC" />

            <div className="max-w-5xl mx-auto space-y-10 py-8">
                {/* Hero Greeting */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-black text-white tracking-tight uppercase">Welcome, {user.name}</h1>
                    <p className="text-[#a8a8c8] text-lg max-w-2xl mx-auto">
                        Your account is active. While your specific role credentials are being verified by a Club Director, you can explore the district bulletins and resources below.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Main Feed */}
                    <div className="md:col-span-2 space-y-6">
                        <section className="panel p-0 overflow-hidden">
                            <div className="panel__header border-b border-white/5 px-6 py-5 flex items-center gap-3">
                                <div className="p-2 bg-burgundy-900/50 rounded-lg text-burgundy-400">
                                    <Compass size={20} />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-base uppercase tracking-tight">District News Feed</h3>
                                    <p className="text-xs text-gray-500">Public updates from Kampala District</p>
                                </div>
                            </div>
                            <div className="panel__body p-6">
                                {bulletins.length === 0 ? (
                                    <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
                                        <Mail size={32} className="mx-auto text-gray-700 mb-4" />
                                        <p className="text-gray-500 font-medium">No bulletins published today.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {bulletins.map(item => (
                                            <div key={item.id} className="group relative pl-6 border-l-2 border-burgundy-500/30 hover:border-burgundy-500 transition-all">
                                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-burgundy-400 mb-2">
                                                    <Clock size={12} /> {new Date(item.created_at).toLocaleDateString()}
                                                </div>
                                                <h4 className="text-lg font-bold text-white mb-2 group-hover:text-burgundy-400 transition-colors">{item.title}</h4>
                                                <p className="text-sm text-[#6b6b88] leading-relaxed line-clamp-2 mb-4">{item.content}</p>
                                                <button className="text-xs font-bold text-gold-400 flex items-center gap-1 hover:gap-2 transition-all uppercase tracking-widest">
                                                    Read Full Bulletin <ArrowRight size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar: Status & CTA */}
                    <div className="space-y-6">
                        <div className="panel bg-gradient-to-br from-burgundy-900/20 to-surface-800 border-burgundy-500/20">
                            <div className="panel__header">
                                <h3 className="text-burgundy-400 text-xs font-black uppercase tracking-widest">Involvement Status</h3>
                            </div>
                            <div className="panel__body space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-full border-4 border-burgundy-500/20 flex items-center justify-center text-burgundy-500">
                                            <ShieldCheck size={24} />
                                        </div>
                                        <div className="absolute inset-0 rounded-full border-t-4 border-burgundy-500 animate-spin"></div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white">Pending Approval</div>
                                        <div className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Role Verification in progress</div>
                                    </div>
                                </div>

                                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-[11px] leading-relaxed text-[#a8a8c8]">
                                    <Info size={14} className="mb-2 text-burgundy-400" />
                                    Your request to join as a leader or parent has been sent to your local Club Director. You will receive a notification once approved.
                                </div>

                                <Link href={route('profile.edit')} className="btn btn--secondary btn--full">
                                    Complete Profile Setup
                                </Link>
                            </div>
                        </div>

                        <div className="panel border-white/5">
                            <div className="panel__header">
                                <h3 className="text-gray-500 text-xs font-black uppercase tracking-widest">Discovery</h3>
                            </div>
                            <div className="panel__body p-0">
                                <button className="w-full flex items-center justify-between p-4 px-6 hover:bg-white/5 transition-colors border-b border-white/5 group">
                                    <span className="text-sm font-bold text-white uppercase tracking-tight">Find a Club</span>
                                    <Search size={16} className="text-gray-600 group-hover:text-white transition-colors" />
                                </button>
                                <button className="w-full flex items-center justify-between p-4 px-6 hover:bg-white/5 transition-colors group">
                                    <span className="text-sm font-bold text-white uppercase tracking-tight">Upcoming Events</span>
                                    <Compass size={16} className="text-gray-600 group-hover:text-white transition-colors" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
