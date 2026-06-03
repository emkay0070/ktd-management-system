import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { Bell, X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';

export default function ToastNotification() {
    const { flash } = usePage().props;
    const [toast, setToast] = useState(null);
    const [minimized, setMinimized] = useState(false);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Find which flash message exists
        let newToast = null;
        if (flash?.warning) newToast = { type: 'warning', message: flash.warning };
        else if (flash?.error) newToast = { type: 'error', message: flash.error };
        else if (flash?.success) newToast = { type: 'success', message: flash.success };
        else if (flash?.info) newToast = { type: 'info', message: flash.info };
        else if (flash?.message) newToast = { type: 'info', message: flash.message };

        if (newToast) {
            setToast(newToast);
            setVisible(true);
            setMinimized(false);
        }
    }, [flash]);

    useEffect(() => {
        if (!visible) return;

        // Auto-minimize after 5 seconds
        const minimizeTimer = setTimeout(() => {
            setMinimized(true);
        }, 5000);

        // Auto-dismiss completely after 60 seconds
        const dismissTimer = setTimeout(() => {
            setVisible(false);
        }, 60000);

        return () => {
            clearTimeout(minimizeTimer);
            clearTimeout(dismissTimer);
        };
    }, [toast, visible]);

    if (!visible || !toast) return null;

    const styles = {
        warning: 'bg-surface-800 border-l-4 border-l-amber-500 text-[var(--clr-text-primary)] border-t border-r border-b border-white/5',
        success: 'bg-surface-800 border-l-4 border-l-green-500 text-[var(--clr-text-primary)] border-t border-r border-b border-white/5',
        error: 'bg-surface-800 border-l-4 border-l-red-500 text-[var(--clr-text-primary)] border-t border-r border-b border-white/5',
        info: 'bg-surface-800 border-l-4 border-l-blue-500 text-[var(--clr-text-primary)] border-t border-r border-b border-white/5',
    };

    const iconColors = {
        warning: 'text-amber-500',
        success: 'text-green-500',
        error: 'text-red-500',
        info: 'text-blue-500',
    };

    const IconConfig = {
        warning: AlertTriangle,
        success: CheckCircle,
        error: AlertCircle,
        info: Info,
    };

    const Icon = IconConfig[toast.type] || Bell;

    if (minimized) {
        return (
            <div className="fixed bottom-6 right-6 z-50 flex items-center justify-center cursor-pointer" onClick={() => setMinimized(false)}>
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${iconColors[toast.type].replace('text-', 'bg-')}`}></span>
                <div className={`relative flex items-center justify-center w-12 h-12 rounded-full shadow-lg ${styles[toast.type]}`}>
                    <Icon size={20} className={iconColors[toast.type]} />
                </div>
            </div>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-2 fade-in duration-300">
            <div className={`flex items-start gap-3 p-4 rounded-xl shadow-2xl min-w-[320px] max-w-sm ${styles[toast.type]}`}>
                <div className={`shrink-0 mt-0.5 ${iconColors[toast.type]}`}>
                    <Icon size={20} />
                </div>
                <div className="flex-1 text-sm font-medium leading-relaxed pr-2">
                    {toast.message}
                </div>
                <button 
                    onClick={() => setVisible(false)}
                    className="shrink-0 text-[var(--clr-text-muted)] hover:text-[var(--clr-text-primary)] transition-colors"
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    );
}
