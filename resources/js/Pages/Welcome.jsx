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
            <header className="flex items-center justify-between border-b border-white/5 z-50 transition-all duration-300" style={{ padding: '1.5rem 2rem', backgroundColor: 'rgba(5, 5, 5, 0.7)', position: 'sticky', top: 0, backdropFilter: 'blur(12px)' }}>
                <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center border border-white/10" style={{ width: '48px', height: '48px', borderRadius: '1rem', background: 'linear-gradient(to bottom right, var(--clr-burgundy-500), var(--clr-burgundy-900))', boxShadow: '0 0 30px rgba(155,34,38,0.3)', color: 'var(--clr-gold-400)' }}>
                        <Tent size={24} />
                    </div>
                    <div>
                        <div className="text-xl font-black text-white leading-none tracking-tight">EmPFC</div>
                        <div className="text-[10px] font-bold tracking-widest uppercase mt-1" style={{ color: '#e8ba3a' }}>COMMAND CENTER</div>
                    </div>
                </div>

                <nav className="flex items-center gap-6">
                    {auth.user ? (
                        <Link href={route('dashboard')} className="group flex items-center justify-center gap-2 rounded-full font-bold text-sm transition-all text-white" style={{ padding: '10px 24px', backgroundColor: 'var(--clr-burgundy-600)', boxShadow: '0 0 20px rgba(155,34,38,0.2)' }}>
                            Access Portal <ArrowRight size={16} />
                        </Link>
                    ) : (
                        <Link href={route('login')} className="group flex items-center gap-2 text-sm font-bold text-gray-400 transition-colors" style={{ padding: '8px' }}>
                            <Shield size={16} style={{ color: 'var(--clr-burgundy-500)' }} /> Sign In
                        </Link>
                    )}
                </nav>
            </header>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col relative overflow-hidden">
                
                {/* Dynamic Background Elements */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 opacity-40" style={{ overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%, -50%)', width: '800px', height: '800px', backgroundColor: 'rgba(155,34,38,0.2)', borderRadius: '50%', filter: 'blur(120px)' }}></div>
                    <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '600px', height: '600px', backgroundColor: 'rgba(212,160,23,0.1)', borderRadius: '50%', filter: 'blur(150px)' }}></div>
                    <div style={{ position: 'absolute', top: '40%', left: '10%', width: '400px', height: '400px', backgroundColor: 'rgba(59,130,246,0.05)', borderRadius: '50%', filter: 'blur(120px)' }}></div>
                </div>

                <section className="relative z-10 flex flex-col items-center text-center" style={{ padding: '6rem 2rem 5rem 2rem' }}>
                    <div className="inline-flex items-center gap-2 border border-white/5 font-black uppercase tracking-widest mb-10 animate-fade-in transition-colors cursor-default" style={{ padding: '6px 16px', borderRadius: '9999px', backgroundColor: 'rgba(30, 30, 42, 0.8)', backdropFilter: 'blur(12px)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', color: '#d1d5db', fontSize: '10px' }}>
                        <Activity size={14} style={{ color: 'var(--clr-burgundy-500)' }} /> District Administration Platform
                    </div>
                    
                    <h1 className="text-white mb-8 leading-none tracking-tight animate-slide-up" style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', fontWeight: 900, maxWidth: '64rem' }}>
                        The Central <span className="text-gradient">Pathfinder</span> Portal
                    </h1>
                    
                    <p className="text-lg mb-14 max-w-4xl leading-relaxed font-medium opacity-80" style={{ color: '#a8a8c8', fontSize: 'clamp(1.125rem, 2vw, 1.5rem)' }}>
                        Unified management for the SDA Pathfinder movement. From club directors to parents, coordinate the mission with absolute precision.
                    </p>

                    {!auth.user && (
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-delayed w-full">
                            <Link href={route('register')} className="btn-join">
                                <span style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    Join the Platform <ArrowRight size={18} />
                                </span>
                            </Link>
                        </div>
                    )}
                </section>

                {/* Membership Ecosystem Row */}
                <section className="relative z-10 w-full mx-auto border-t border-white/5" style={{ maxWidth: '80rem', padding: '6rem 2rem', background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.5))' }}>
                    <div className="text-center mb-16" style={{ marginBottom: '5rem' }}>
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--clr-burgundy-500)' }}>The Ecosystem</h2>
                        <h3 className="text-white tracking-tight" style={{ fontSize: 'clamp(2.25rem, 4vw, 3rem)', fontWeight: 700 }}>Built for Everyone</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { role: 'Directors', icon: Shield, desc: 'Manage your local church club, rosters, and unit leadership seamlessly.' },
                            { role: 'Master Guides', icon: GraduationCap, desc: 'Track training, curriculum progress, and district leadership badges.' },
                            { role: 'Pathfinders', icon: Star, desc: 'Access your secure records, class assignments, and district certifications.' },
                            { role: 'Parents', icon: Users, desc: 'One-click family linking to track your children across the district.' }
                        ].map((feat, i) => (
                            <div key={feat.role} className="feature-card">
                                <div className="feature-card-glow"></div>
                                <div className="relative z-10">
                                    <div className="feature-icon-wrapper">
                                        <feat.icon size={26} strokeWidth={1.5} />
                                    </div>
                                    <h4 className="text-xl font-bold text-white tracking-tight" style={{ marginBottom: '1rem' }}>{feat.role}</h4>
                                    <p className="text-sm leading-relaxed font-medium" style={{ color: '#8b8b98' }}>
                                        {feat.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
            
            <footer className="flex flex-col md:flex-row justify-between items-center border-t border-white/5 relative z-10" style={{ padding: '2rem', backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)' }}>
                <div className="flex items-center gap-3 mb-6 md:mb-0">
                    <div className="flex items-center justify-center text-xs font-black border" style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(155,34,38,0.2)', color: 'var(--clr-burgundy-400)', borderColor: 'rgba(155,34,38,0.2)' }}>E</div>
                    <div className="text-xs font-bold tracking-widest uppercase" style={{ color: '#9ca3af' }}>EmPFC Command Center</div>
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

                .btn-join { display: inline-flex; align-items: center; justify-content: center; padding: 16px 32px; background-color: #ffffff; color: #000000; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; border-radius: 9999px; transition: all 0.3s ease; text-align: center; width: 100%; max-width: 320px; }
                @media (min-width: 640px) { .btn-join { width: auto; max-width: none; } }
                .btn-join:hover { transform: scale(1.05); box-shadow: 0 0 40px rgba(255, 255, 255, 0.2); }
                .btn-join svg { transition: transform 0.3s ease; }
                .btn-join:hover svg { transform: translateX(4px); }

                .text-gradient { background-image: linear-gradient(to bottom right, var(--clr-burgundy-400), var(--clr-burgundy-500), var(--clr-gold-400)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

                .feature-card { position: relative; padding: 32px; border-radius: 24px; background-color: rgba(26, 26, 36, 0.4); border: 1px solid rgba(255, 255, 255, 0.05); backdrop-filter: blur(8px); transition: all 0.5s ease; cursor: pointer; }
                .feature-card:hover { background-color: rgba(30, 30, 42, 0.8); border-color: rgba(255, 255, 255, 0.1); transform: translateY(-8px); box-shadow: 0 20px 40px -15px rgba(0,0,0,0.5); }
                .feature-card-glow { position: absolute; inset: 0; background: linear-gradient(to bottom right, rgba(155, 34, 38, 0.05), transparent); border-radius: 24px; opacity: 0; transition: opacity 0.5s ease; }
                .feature-card:hover .feature-card-glow { opacity: 1; }
                
                .feature-icon-wrapper { width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin-bottom: 32px; transition: all 0.5s ease; background-color: rgba(255, 255, 255, 0.03); color: #d46b70; position: relative; z-index: 10; }
                .feature-card:hover .feature-icon-wrapper { transform: scale(1.1); background-color: rgba(155, 34, 38, 0.2); }
            `}} />
        </div>
    );
}
