import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({ password: '' });

    const confirmUserDeletion = () => setConfirmingUserDeletion(true);

    const deleteUser = (e) => {
        e.preventDefault();
        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        clearErrors();
        reset();
    };

    return (
        <section className={className}>
            <header className="mb-6 flex items-start gap-4">
                <div className="p-3 rounded-xl bg-danger/10 border border-danger/20">
                    <Trash2 size={22} className="text-danger" />
                </div>
                <div>
                    <h3 className="text-xl font-semibold mb-1 text-danger">Delete Account</h3>
                    <p className="text-sm text-muted">
                        Once your account is deleted, all of its resources and data will be permanently removed. This action cannot be undone.
                    </p>
                </div>
            </header>

            <button
                className="btn btn--sm"
                style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}
                onClick={confirmUserDeletion}
            >
                <Trash2 size={14} /> Delete Account
            </button>

            {/* Inline Confirmation Dialog */}
            {confirmingUserDeletion && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="panel w-full max-w-md mx-4 shadow-2xl">
                        <div className="panel__header">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-danger/10">
                                    <AlertTriangle size={18} className="text-danger" />
                                </div>
                                <div>
                                    <h4 className="font-bold">Confirm Account Deletion</h4>
                                    <p className="text-xs text-muted">This action is permanent and irreversible</p>
                                </div>
                            </div>
                            <button onClick={closeModal} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                <X size={16} className="text-muted" />
                            </button>
                        </div>
                        <form onSubmit={deleteUser} className="panel__body flex flex-col gap-5">
                            <p className="text-sm text-muted leading-relaxed">
                                Please enter your password to confirm you would like to permanently delete your account and all associated data.
                            </p>

                            <div className="form-group">
                                <label htmlFor="confirm_password">Your Password</label>
                                <input
                                    id="confirm_password"
                                    type="password"
                                    ref={passwordInput}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className={`h-input ${errors.password ? 'border-danger' : ''}`}
                                    placeholder="Enter your password to confirm"
                                    autoFocus
                                />
                                {errors.password && (
                                    <div className="text-danger text-xs mt-1">{errors.password}</div>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pt-2 border-t border-white/5">
                                <button type="button" className="btn btn--secondary btn--sm" onClick={closeModal}>
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn--sm"
                                    style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.4)' }}
                                    disabled={processing}
                                >
                                    <Trash2 size={14} />
                                    {processing ? 'Deleting...' : 'Delete Permanently'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
}
