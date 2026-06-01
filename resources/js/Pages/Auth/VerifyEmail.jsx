import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Mail, ChevronRight, RefreshCw } from 'lucide-react';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Verify Email" />

            <div className="mb-8">
                <div className="inline-flex p-4 rounded-2xl bg-burgundy-500/10 text-burgundy-400 mb-6">
                    <Mail size={28} />
                </div>
                <h1 className="text-2xl font-black text-white mb-2">Verify your email</h1>
                <p className="text-sm text-gray-400 leading-relaxed">
                    Thanks for signing up! Before getting started, please verify your email address by clicking the link we sent you.
                </p>
            </div>

            {status === 'verification-link-sent' && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <p className="text-sm font-bold text-green-400">
                        A new verification link has been sent to your email address.
                    </p>
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-4 bg-burgundy-500 hover:bg-burgundy-400 text-white font-black uppercase tracking-[0.2em] text-xs rounded-xl shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {processing ? (
                        <><RefreshCw size={15} className="animate-spin" /> Sending...</>
                    ) : (
                        <><ChevronRight size={15} /> Resend Verification Email</>
                    )}
                </button>

                <div className="text-center">
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-white transition-colors"
                    >
                        Log out &amp; use a different account
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}

