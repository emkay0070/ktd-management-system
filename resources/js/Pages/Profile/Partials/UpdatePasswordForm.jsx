import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { useRef } from 'react';
import { KeyRound, ShieldCheck } from 'lucide-react';

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }
                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <header className="mb-6 flex items-start gap-4">
                <div className="p-3 rounded-xl bg-gold-400/10 border border-gold-400/20">
                    <KeyRound size={22} className="text-gold-400" />
                </div>
                <div>
                    <h3 className="text-xl font-semibold mb-1">Update Password</h3>
                    <p className="text-sm text-muted">Ensure your account is using a long, random password to stay secure.</p>
                </div>
            </header>

            <form onSubmit={updatePassword} className="flex flex-col gap-5">
                <div className="form-group">
                    <label htmlFor="current_password">Current Password</label>
                    <input
                        id="current_password"
                        ref={currentPasswordInput}
                        value={data.current_password}
                        onChange={(e) => setData('current_password', e.target.value)}
                        type="password"
                        className={`h-input ${errors.current_password ? 'border-danger' : ''}`}
                        autoComplete="current-password"
                    />
                    {errors.current_password && (
                        <div className="text-danger text-xs mt-1">{errors.current_password}</div>
                    )}
                </div>

                <div className="form-grid-2">
                    <div className="form-group">
                        <label htmlFor="password">New Password</label>
                        <input
                            id="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            type="password"
                            className={`h-input ${errors.password ? 'border-danger' : ''}`}
                            autoComplete="new-password"
                        />
                        {errors.password && (
                            <div className="text-danger text-xs mt-1">{errors.password}</div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password_confirmation">Confirm Password</label>
                        <input
                            id="password_confirmation"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            type="password"
                            className={`h-input ${errors.password_confirmation ? 'border-danger' : ''}`}
                            autoComplete="new-password"
                        />
                        {errors.password_confirmation && (
                            <div className="text-danger text-xs mt-1">{errors.password_confirmation}</div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                    <button type="submit" className="btn btn--primary" disabled={processing}>
                        <ShieldCheck size={16} />
                        {processing ? 'Updating...' : 'Update Password'}
                    </button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-success font-bold">Password updated.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
