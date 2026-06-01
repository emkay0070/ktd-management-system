import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { LogIn } from 'lucide-react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Staff Login" />

            {/* Title Block */}
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">Log in to the District Command Center</p>

            {status && (
                <div className="alert alert--success mb-4 text-center">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                        id="email"
                        type="email"
                        className="h-input"
                        autoComplete="username"
                        autoFocus
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />
                    {errors.email && <span className="field-error">{errors.email}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        className="h-input"
                        autoComplete="current-password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />
                    {errors.password && <span className="field-error">{errors.password}</span>}
                </div>

                <div className="h-checkbox-group mt-4 text-sm">
                    <input
                        id="remember"
                        type="checkbox"
                        className="h-checkbox"
                        checked={data.remember}
                        onChange={(e) => setData('remember', e.target.checked)}
                    />
                    <label htmlFor="remember" className="checkbox-label" style={{ marginTop: '0px' }}>
                        Remember me
                    </label>
                </div>

                <div className="auth-layout__footer">
                    {canResetPassword ? (
                        <Link href={route('password.request')} className="auth-link">
                            Forgot password?
                        </Link>
                    ) : (
                        <span></span>
                    )}

                    <button
                        type="submit"
                        className="btn btn--primary"
                        disabled={processing}
                    >
                        <LogIn size={16} />
                        {processing ? 'Logging in...' : 'Access Portal'}
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}
