import { Head, Link, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Shield, MapPin, UserCheck, ArrowRight, LogIn, UserPlus } from 'lucide-react';

export default function AcceptInvite({ invite, is_logged_in, user }) {
    const { post, processing } = useForm({});

    const handleAccept = (e) => {
        e.preventDefault();
        post(invite.post_url);
    };

    return (
        <GuestLayout>
            <Head title={`Invitation: ${invite.role_display}`} />

            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-burgundy-500/10 text-burgundy-500 mb-4">
                    <Shield size={32} />
                </div>
                <h1 className="text-2xl font-black text-white mb-2">You've Been Invited!</h1>
                <p className="text-sm text-gray-400 max-w-sm mx-auto">
                    You have been invited to serve as the <strong className="text-white">{invite.role_display}</strong> for <strong className="text-white">{invite.scope_name}</strong>.
                </p>
            </div>

            <div className="bg-surface-800 border border-white/10 rounded-2xl p-6 mb-8">
                <div className="space-y-4">
                    <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-white/5 text-gray-400">
                            <Shield size={18} />
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Role</div>
                            <div className="font-bold text-white">{invite.role_display}</div>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="p-2 rounded-lg bg-white/5 text-gray-400">
                            <MapPin size={18} />
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Organization</div>
                            <div className="font-bold text-white">{invite.scope_name}</div>
                        </div>
                    </div>
                </div>
            </div>

            {is_logged_in ? (
                <form onSubmit={handleAccept} className="space-y-6">
                    <div className="p-4 bg-burgundy-500/10 border border-burgundy-500/20 rounded-xl flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-burgundy-500/20 flex items-center justify-center text-burgundy-400">
                            <UserCheck size={20} />
                        </div>
                        <div>
                            <div className="text-xs text-burgundy-400/80 font-bold uppercase tracking-wider">Logged in as</div>
                            <div className="font-bold text-white">{user.name}</div>
                            <div className="text-xs text-gray-400">{user.email}</div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="btn w-full justify-center bg-burgundy-600 hover:bg-burgundy-500 text-white border-0 py-3 rounded-xl font-bold"
                    >
                        {processing ? 'Accepting...' : 'Accept Invitation'}
                        <ArrowRight size={18} className="ml-2" />
                    </button>
                    
                    <div className="text-center">
                        <Link href={route('logout')} method="post" as="button" className="text-xs text-gray-500 hover:text-white transition-colors">
                            Not you? Log out
                        </Link>
                    </div>
                </form>
            ) : (
                <div className="space-y-4">
                    <p className="text-sm text-center text-gray-400 mb-6">
                        To accept this invitation, please log in or create a new account.
                    </p>
                    <Link
                        href={route('login', { intended: invite.post_url })}
                        className="btn w-full justify-center bg-surface-700 hover:bg-surface-600 text-white border border-white/10 py-3 rounded-xl font-bold"
                    >
                        <LogIn size={18} className="mr-2" /> Log In to Existing Account
                    </Link>
                    <Link
                        href={route('register', { intent: 'district', role: invite.role_name, district_id: invite.scope_type === 'App\\Models\\District' ? invite.scope_id : null })}
                        className="btn w-full justify-center bg-burgundy-600 hover:bg-burgundy-500 text-white border-0 py-3 rounded-xl font-bold"
                    >
                        <UserPlus size={18} className="mr-2" /> Create New Account
                    </Link>
                </div>
            )}
        </GuestLayout>
    );
}
