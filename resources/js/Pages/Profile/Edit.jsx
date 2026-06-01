import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { User, Shield, Trash2 } from 'lucide-react';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout>
            <Head title="My Profile" />

            <div className="page-header">
                <div>
                    <h1 className="page-title">My Profile</h1>
                    <p className="page-subtitle">Manage your account information, security, and preferences</p>
                </div>
            </div>

            <div className="flex flex-col gap-6 max-w-3xl">

                {/* Profile Information */}
                <div className="panel">
                    <div className="panel__header">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-burgundy-900/40 border border-burgundy-500/20">
                                <User size={18} className="text-burgundy-400" />
                            </div>
                            <div>
                                <h3 className="font-bold">Profile Information</h3>
                                <p className="text-[11px] text-muted">Update your name, email, and avatar</p>
                            </div>
                        </div>
                    </div>
                    <div className="panel__body">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                        />
                    </div>
                </div>

                {/* Password */}
                <div className="panel">
                    <div className="panel__header">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-gold-500/10 border border-gold-400/20">
                                <Shield size={18} className="text-gold-400" />
                            </div>
                            <div>
                                <h3 className="font-bold">Security</h3>
                                <p className="text-[11px] text-muted">Change your account password</p>
                            </div>
                        </div>
                    </div>
                    <div className="panel__body">
                        <UpdatePasswordForm />
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="panel" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
                    <div className="panel__header" style={{ borderColor: 'rgba(239,68,68,0.15)' }}>
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-danger/10 border border-danger/20">
                                <Trash2 size={18} className="text-danger" />
                            </div>
                            <div>
                                <h3 className="font-bold text-danger">Danger Zone</h3>
                                <p className="text-[11px] text-muted">Permanently delete your account</p>
                            </div>
                        </div>
                    </div>
                    <div className="panel__body">
                        <DeleteUserForm />
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
