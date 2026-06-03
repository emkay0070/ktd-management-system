import { Link } from '@inertiajs/react';
import { Tent, Moon, Sun, ChevronLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import ToastNotification from '@/Components/ToastNotification';


export default function GuestLayout({ 
    children, 
    leftPanel = null, 
    backHref = null, 
    backLabel = 'Back',
    stepInfo = null,  // e.g. { current: 1, total: 3 }
}) {
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            return document.documentElement.getAttribute('data-theme') || 'light';
        }
        return 'light';
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return (
        <div className="onboard-shell">
            <ToastNotification />
            {/* ── Top Bar ──────────────────────────────── */}
            <header className="onboard-topbar">
                <Link href="/" className="onboard-logo">
                    <Tent size={28} />
                    <span>EmPFC</span>
                </Link>
                <div className="onboard-topbar__right">
                    {backHref && (
                        <Link href={backHref} className="onboard-topbar__back">
                            <ChevronLeft size={14} /> {backLabel}
                        </Link>
                    )}
                    {stepInfo && (
                        <div className="onboard-topbar__step">
                            Step {stepInfo.current} of {stepInfo.total}
                        </div>
                    )}
                    <button onClick={toggleTheme} className="onboard-topbar__toggle" title="Toggle Theme">
                        {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                    </button>
                </div>
            </header>

            {/* ── Body ─────────────────────────────────── */}
            <div className={`onboard-body ${leftPanel ? 'onboard-body--split' : ''}`}>
                {/* Left Panel (desktop only when present) */}
                {leftPanel && (
                    <aside className="onboard-sidebar">
                        <div className="onboard-sidebar__inner">
                            {leftPanel}
                        </div>
                    </aside>
                )}

                {/* Main Content */}
                <main className="onboard-main">
                    <div className="onboard-card">
                        {children}
                    </div>
                </main>
            </div>

            {/* ── Footer ───────────────────────────────── */}
            <footer className="onboard-footer">
                <span>© {new Date().getFullYear()} EmPFC. All rights reserved.</span>
            </footer>
        </div>
    );
}
