import { useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Tent, ArrowRight, ShieldCheck, Users, GraduationCap, Star, Shield, Activity } from 'lucide-react';
import '@/../css/app.scss';

export default function Welcome({ auth }) {
    // Force dark mode for the landing page aesthetic
    useEffect(() => {
        document.body.setAttribute('data-theme', 'dark');
        document.documentElement.style.backgroundColor = '#050505';
        document.body.style.backgroundColor = '#050505';
        return () => {
            const savedTheme = localStorage.getItem('app_theme') || 'dark';
            document.body.setAttribute('data-theme', savedTheme);
            document.documentElement.style.backgroundColor = '';
            document.body.style.backgroundColor = '';
        };
    }, []);

    return (
        <div className="min-h-[100dvh] flex flex-col selection:bg-burgundy-500/30 selection:text-white" style={{ backgroundColor: '#050505', color: '#f0efff' }}>
            <Head title="EmPFC - Pathfinder Central" />

            {/* Top Navigation */}
            <header className="flex items-center justify-between px-6 py-4 md:px-12 md:py-6 border-b border-white/5 backdrop-blur-xl sticky top-0 z-50 transition-all duration-300" style={{ backgroundColor: 'rgba(5, 5, 5, 0.7)' }}>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-burgundy-500 to-burgundy-900 flex items-center justify-center shadow-[0_0_30px_rgba(155,34,38,0.3)] text-gold-400 border border-white/10">
                        <Tent size={24} />
                    </div>
                    <div>
                        <div className="text-xl font-black text-white leading-none tracking-tight">EmPFC</div>
                        <div className="text-[10px] font-bold tracking-widest uppercase mt-1" style={{ color: '#e8ba3a' }}>COMMAND CENTER</div>
                    </div>
                </div>

                <nav className="flex items-center gap-6">
                    {auth.user ? (
                        <Link href={route('dashboard')} className="group flex items-center gap-2 px-6 py-2.5 rounded-full bg-burgundy-600 hover:bg-burgundy-500 text-white font-bold text-sm transition-all shadow-[0_0_20px_rgba(155,34,38,0.2)] hover:shadow-[0_0_30px_rgba(155,34,38,0.4)]">
                            Access Portal <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    ) : (
                        <Link href={route('login')} className="group flex items-center gap-2 px-2 py-2 text-sm font-bold text-gray-400 hover:text-white transition-colors">
                            <Shield size={16} className="text-burgundy-500 group-hover:text-burgundy-400 transition-colors" /> Sign In
                        </Link>
                    )}
                </nav>
            </header>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col relative overflow-hidden">
                
                {/* Dynamic Background Elements */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100vw] h-[100vh] pointer-events-none z-0 opacity-40">
                    <div className="absolute top-[20%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-burgundy-600/20 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] bg-gold-500/10 rounded-full blur-[150px]"></div>
                    <div className="absolute top-[40%] left-[10%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px]"></div>
                </div>

                <section className="relative z-10 pt-24 pb-20 px-6 md:px-12 flex flex-col items-center text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-800/80 border border-white/5 backdrop-blur-md shadow-xl text-gray-300 text-[10px] font-black uppercase tracking-widest mb-10 animate-fade-in hover:border-burgundy-500/30 transition-colors cursor-default">
                        <Activity size={14} className="text-burgundy-500" /> District Administration Platform
                    </div>
                    
                    <h1 className="text-6xl md:text-8xl font-black text-white mb-8 leading-[1.05] tracking-tighter max-w-5xl animate-slide-up drop-shadow-2xl">
                        The Central <span className="text-transparent bg-clip-text bg-gradient-to-br from-burgundy-400 via-burgundy-500 to-gold-400">Pathfinder</span> Portal
                    </h1>
                    
                    <p className="text-lg md:text-2xl mb-14 max-w-3xl leading-relaxed font-medium opacity-80" style={{ color: '#a8a8c8' }}>
                        Unified management for the SDA Pathfinder movement. From club directors to parents, coordinate the mission with absolute precision.
                    </p>

                    {!auth.user && (
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-delayed w-full">
                            <Link href={route('register')} className="group relative px-10 py-5 bg-white text-black font-black text-sm uppercase tracking-widest rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] w-full sm:w-auto text-center flex items-center justify-center">
                                <span className="relative z-10 flex items-center gap-3">
                                    Join the Platform <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </span>
                            </Link>
                        </div>
                    )}
                </section>

                {/* Membership Ecosystem Row */}
                <section className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 py-24 border-t border-white/5 bg-gradient-to-b from-transparent to-black/50">
                    <div className="text-center mb-20">
                        <h2 className="text-xs font-black text-burgundy-500 uppercase tracking-[0.3em] mb-4">The Ecosystem</h2>
                        <h3 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Built for Everyone</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { role: 'Directors', icon: Shield, desc: 'Manage your local church club, rosters, and unit leadership seamlessly.' },
                            { role: 'Master Guides', icon: GraduationCap, desc: 'Track training, curriculum progress, and district leadership badges.' },
                            { role: 'Pathfinders', icon: Star, desc: 'Access your secure records, class assignments, and district certifications.' },
                            { role: 'Parents', icon: Users, desc: 'One-click family linking to track your children across the district.' }
                        ].map((feat, i) => (
                            <div key={feat.role} className="group relative p-8 rounded-3xl bg-surface-900/40 border border-white/5 backdrop-blur-sm hover:bg-surface-800/80 hover:border-white/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]">
                                <div className="absolute inset-0 bg-gradient-to-br from-burgundy-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="relative z-10">
                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8 transition-all duration-500 group-hover:scale-110 group-hover:bg-burgundy-500/20" style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', color: '#d46b70' }}>
                                        <feat.icon size={26} strokeWidth={1.5} />
                                    </div>
                                    <h4 className="text-xl font-bold text-white mb-4 tracking-tight">{feat.role}</h4>
                                    <p className="text-sm leading-relaxed font-medium" style={{ color: '#8b8b98' }}>
                                        {feat.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
            
            <footer className="px-6 md:px-12 py-8 flex flex-col md:flex-row justify-between items-center bg-black/60 border-t border-white/5 backdrop-blur-xl relative z-10">
                <div className="flex items-center gap-3 mb-6 md:mb-0">
                    <div className="w-8 h-8 rounded-lg bg-burgundy-900/50 flex items-center justify-center text-xs font-black text-burgundy-400 border border-burgundy-500/20">E</div>
                    <div className="text-xs font-bold text-gray-400 tracking-widest uppercase">EmPFC Command Center</div>
                </div>
                <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
                    &copy; {new Date().getFullYear()} Secured by Helanthus Architecture.
                </div>
            </footer>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes slide-up {
                    from { transform: translateY(40px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-slide-up { animation: slide-up 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .animate-fade-in { animation: fade-in 0.8s ease forwards; }
                .animate-fade-in-delayed { animation: fade-in 0.8s ease 0.4s forwards; opacity: 0; }
            `}} />
        </div>
    );
}
