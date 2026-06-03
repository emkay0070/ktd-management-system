import { useState, useEffect, useCallback } from 'react';
import { usePage } from '@inertiajs/react';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';

const TOAST_CONFIGS = {
    success: {
        icon: CheckCircle,
        bg: 'var(--clr-success)',
        bgSoft: 'rgba(34, 197, 94, 0.12)',
        border: 'rgba(34, 197, 94, 0.35)',
        label: 'Success',
    },
    warning: {
        icon: AlertTriangle,
        bg: 'var(--clr-warning)',
        bgSoft: 'rgba(245, 158, 11, 0.12)',
        border: 'rgba(245, 158, 11, 0.35)',
        label: 'Warning',
    },
    error: {
        icon: AlertCircle,
        bg: 'var(--clr-danger)',
        bgSoft: 'rgba(239, 68, 68, 0.12)',
        border: 'rgba(239, 68, 68, 0.35)',
        label: 'Error',
    },
    info: {
        icon: Info,
        bg: 'var(--clr-info)',
        bgSoft: 'rgba(59, 130, 246, 0.12)',
        border: 'rgba(59, 130, 246, 0.35)',
        label: 'Info',
    },
};

export default function ToastNotification() {
    const { flash } = usePage().props;
    const [toasts, setToasts] = useState([]);

    // Resolve the flash type
    const resolveFlash = useCallback(() => {
        if (!flash) return null;
        if (flash.error)   return { type: 'error',   message: flash.error };
        if (flash.warning) return { type: 'warning', message: flash.warning };
        if (flash.success) return { type: 'success', message: flash.success };
        if (flash.info)    return { type: 'info',    message: flash.info };
        if (flash.message) return { type: 'success', message: flash.message };
        return null;
    }, [flash]);

    useEffect(() => {
        const resolved = resolveFlash();
        if (!resolved) return;

        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { ...resolved, id }]);

        // Auto-dismiss after 6 seconds
        const timer = setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 6000);

        return () => clearTimeout(timer);
    }, [flash]);

    const dismiss = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    if (toasts.length === 0) return null;

    return (
        <div
            style={{
                position: 'fixed',
                bottom: '24px',
                right: '24px',
                zIndex: 99999,
                display: 'flex',
                flexDirection: 'column-reverse',
                gap: '10px',
                pointerEvents: 'none',
                maxWidth: '400px',
                width: '100%',
            }}
        >
            {toasts.map((toast) => {
                const config = TOAST_CONFIGS[toast.type] || TOAST_CONFIGS.info;
                const Icon = config.icon;

                return (
                    <div
                        key={toast.id}
                        style={{
                            pointerEvents: 'auto',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '12px',
                            padding: '14px 16px',
                            borderRadius: '12px',
                            background: 'var(--clr-surface-800)',
                            border: `1px solid ${config.border}`,
                            borderLeft: `4px solid ${config.bg}`,
                            boxShadow: '0 12px 40px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.2)',
                            animation: 'toastSlideIn 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
                            minWidth: '300px',
                        }}
                    >
                        {/* Icon */}
                        <div
                            style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                background: config.bgSoft,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                            }}
                        >
                            <Icon size={16} style={{ color: config.bg }} />
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                                style={{
                                    fontSize: '10px',
                                    fontWeight: 800,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    color: config.bg,
                                    marginBottom: '3px',
                                }}
                            >
                                {config.label}
                            </div>
                            <div
                                style={{
                                    fontSize: '13px',
                                    fontWeight: 500,
                                    lineHeight: 1.5,
                                    color: 'var(--clr-text-primary)',
                                    wordBreak: 'break-word',
                                }}
                            >
                                {toast.message}
                            </div>
                        </div>

                        {/* Dismiss */}
                        <button
                            onClick={() => dismiss(toast.id)}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--clr-text-muted)',
                                padding: '4px',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                transition: 'color 0.15s ease, background 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = 'var(--clr-text-primary)';
                                e.currentTarget.style.background = 'var(--clr-surface-700)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = 'var(--clr-text-muted)';
                                e.currentTarget.style.background = 'none';
                            }}
                        >
                            <X size={16} />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
