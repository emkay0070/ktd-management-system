import { useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Tent, ArrowRight, ShieldCheck, Map, Users, GraduationCap, Star, Shield } from 'lucide-react';
import '@/../css/app.scss';

export default function Welcome({ auth }) {
    // Force dark mode for the landing page aesthetic
    useEffect(() => {
        document.body.setAttribute('data-theme', 'dark');
        return () => {
            const savedTheme = localStorage.getItem('app_theme') || 'dark';
            document.body.setAttribute('data-theme', savedTheme);
        };
    }, []);

    return (
        <div className="min-h-screen flex flex-col selection:bg-burgundy-500/30 selection:text-white" style={{ backgroundColor: '#0a0a0c', color: '#f0efff' }}>
            <Head title="EmPFC - Pathfinder Central" />

            {/* Top Navigation */}
            <header className="flex items-center justify-between px-8 py-6 border-b border-white/5 backdrop-blur-md sticky top-0 z-50" style={{ backgroundColor: 'rgba(10, 10, 12, 0.8)' }}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-burgundy-600 to-burgundy-800 flex items-center justify-center shadow-[0_0_20px_rgba(155,34,38,0.4)] text-gold-400 border border-white/10">
                        <Tent size={22} />
                    </div>
                    <div>
                        <div className="text-lg font-black text-white leading-none tracking-tight">EmPFC</div>
                        <div className="text-[10px] font-bold tracking-widest uppercase" style={{ color: '#e8ba3a' }}>COMMAND CENTER</div>
                    </div>
                </div>

                <nav className="flex items-center gap-2">
                    {auth.user ? (
                        <Link href={route('dashboard')} className="btn btn--primary">
                            Access Portal <ArrowRight size={16} />
                        </Link>
                    ) : (
                        <>
                            <Link href={route('login')} className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-white transition-colors">
                                Staff Login
                            </Link>
                            <Link href={route('register')} className="btn btn--primary">
                                Join the Platform
                            </Link>
                        </>
                    )}
                </nav>
            </header>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col relative overflow-hidden">
                
                {/* Dynamic Background Elements */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-radial-gradient from-burgundy-900/10 to-transparent pointer-events-none z-0"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-burgundy-600/5 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold-500/5 rounded-full blur-[100px]"></div>

                <section className="relative z-10 pt-20 pb-20 px-8 flex flex-col items-center text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-burgundy-500/10 border border-burgundy-500/20 text-burgundy-400 text-[11px] font-black uppercase tracking-widest mb-8 animate-fade-in">
                        <ShieldCheck size={14} /> Official District Administration
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-[1.05] tracking-tight max-w-4xl animate-slide-up">
                        The Central <span className="text-transparent bg-clip-text bg-gradient-to-r from-burgundy-400 to-gold-400">Pathfinder</span> & Leadership Portal
                    </h1>
                    
                    <p className="text-lg md:text-xl mb-12 max-w-2xl leading-relaxed font-medium" style={{ color: '#a8a8c8' }}>
                        Unified management for the SDA Pathfinder movement. From club directors to parents, co-ordinate the mission with precision.
                    </p>

                    {!auth.user && (
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-delayed" style={{ width: '100%', maxWidth: '448px' }}>
                            <Link href={route('register')} className="btn btn--primary btn--lg w-full" style={{ justifyContent: 'center' }}>
                                Get Started Today <ArrowRight size={18} className="ml-2" />
                            </Link>
                            <Link href={route('login')} className="btn btn--secondary btn--lg w-full" style={{ justifyContent: 'center' }}>
                                Sign In
                            </Link>
                        </div>
                    )}
                </section>

                {/* Membership Ecosystem Row */}
                <section className="relative z-10 w-full max-w-6xl mx-auto px-8 py-20 border-t border-white/5">
                    <div className="text-center mb-16">
                        <h2 className="text-sm font-black text-burgundy-500 uppercase tracking-[0.2em] mb-3">The Ecosystem</h2>
                        <h3 className="text-3xl font-bold text-white uppercase tracking-tight">Built for Everyone</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { role: 'Directors', icon: Shield, desc: 'Manage your local church club, rosters, and unit leadership.' },
                            { role: 'Master Guides', icon: GraduationCap, desc: 'Track training, curriculum progress, and leadership badges.' },
                            { role: 'Pathfinders', icon: Star, desc: 'Access your records, class assignments, and district certifications.' },
                            { role: 'Parents', icon: Users, desc: 'One-click family linking to track your children across the district.' }
                        ].map((feat, i) => (
                            <div key={feat.role} className="group p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-all duration-300">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all" style={{ backgroundColor: 'rgba(59, 10, 10, 0.5)', color: '#d46b70' }}>
                                    <feat.icon size={24} />
                                </div>
                                <h4 className="text-lg font-bold text-white mb-3 uppercase tracking-tight">{feat.role}</h4>
                                <p className="text-sm leading-relaxed font-medium" style={{ color: '#6b6b88' }}>
                                    {feat.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
            
            <footer className="px-8 py-10 flex flex-col md:flex-row justify-between items-center bg-black/40 border-t border-white/5 backdrop-blur-xl">
                <div className="flex items-center gap-2 mb-4 md:mb-0">
                    <div className="w-6 h-6 rounded bg-burgundy-600 flex items-center justify-center text-[10px] font-bold text-white">E</div>
                    <div className="text-xs font-bold text-white tracking-widest uppercase opacity-60">EmPFC District Command</div>
                </div>
                <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                    &copy; {new Date().getFullYear()} Secured by Helanthus Architecture.
                </div>
            </footer>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes slide-up {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-slide-up { animation: slide-up 0.8s cubic-bezier(0.19, 1, 0.22, 1) forwards; }
                .animate-fade-in { animation: fade-in 0.6s ease forwards; }
                .animate-fade-in-delayed { animation: fade-in 0.6s ease 0.3s forwards; opacity: 0; }
                .bg-radial-gradient { background: radial-gradient(circle, var(--tw-content)); }
                .from-burgundy-900\\/10 { --tw-content: rgba(59,10,10,0.15) 0%, rgba(10,10,12,0) 70%; }
            `}} />
        </div>
    );
}
