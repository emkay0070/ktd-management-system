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
        warning: 'bg-amber-500 border-amber-600 text-white',
        success: 'bg-green-500 border-green-600 text-white',
        error: 'bg-red-500 border-red-600 text-white',
        info: 'bg-blue-500 border-blue-600 text-white',
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
            <div className="fixed top-6 right-6 z-50 flex items-center justify-center cursor-pointer" onClick={() => setMinimized(false)}>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-amber-400"></span>
                <div className={`relative flex items-center justify-center w-12 h-12 rounded-full shadow-lg ${styles[toast.type]}`}>
                    <Icon size={20} />
                </div>
            </div>
        );
    }

    return (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
            <div className={`flex items-start gap-3 p-4 rounded-xl shadow-2xl border min-w-[320px] max-w-sm ${styles[toast.type]}`}>
                <div className="shrink-0 mt-0.5">
                    <Icon size={20} />
                </div>
                <div className="flex-1 text-sm font-medium leading-relaxed pr-2">
                    {toast.message}
                </div>
                <button 
                    onClick={() => setVisible(false)}
                    className="shrink-0 text-white/70 hover:text-white transition-colors"
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    );
}
