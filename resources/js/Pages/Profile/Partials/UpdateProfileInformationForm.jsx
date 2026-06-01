import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;

    const { data, setData, post, errors, processing, recentlySuccessful } =
        useForm({
            _method: 'PATCH',
            name: user.name,
            email: user.email,
            avatar: null,
        });

    const submit = (e) => {
        e.preventDefault();

        post(route('profile.update'), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <section className={className}>
            <header className="mb-6">
                <h3 className="text-xl font-semibold mb-1">Profile Information</h3>
                <p className="text-sm text-muted">Update your account's profile information and email address.</p>
            </header>

            <form onSubmit={submit} className="flex flex-col gap-6">
                {/* Avatar Section mirroring Leader/Edit.jsx */}
                <div className="flex gap-8 items-start mb-8">
                    <div className="h-[250px] w-[250px] shrink-0 rounded-full bg-surface-700 border-2 border-dashed border-white/20 flex flex-col items-center justify-center text-muted overflow-hidden relative group transition-all hover:border-gold-400/50 shadow-xl">
                        {(data.avatar || user.avatar_path) ? (
                            <img 
                                src={data.avatar ? URL.createObjectURL(data.avatar) : user.avatar_url} 
                                alt="Profile Preview" 
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center opacity-30">
                                <svg className="h-10 w-10 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="text-xs font-bold uppercase tracking-widest">Upload Profile</span>
                            </div>
                        )}
                        <input 
                            type="file" 
                            className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                            onChange={e => setData('avatar', e.target.files[0])}
                            accept="image/*"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                            <span className="text-xs font-bold text-white uppercase tracking-widest">Change Photo</span>
                        </div>
                    </div>
                    <div className="flex-1 self-center">
                        <label className="block text-xs font-bold uppercase mb-2 text-gold-400 opacity-70">Profile Picture</label>
                        <p className="text-xs text-muted mb-4 leading-relaxed max-w-sm">This is your main system identity photo.</p>
                        {errors.avatar && <div className="text-danger text-xs font-bold">{errors.avatar}</div>}
                    </div>
                </div>

                <div className="form-group">
                    <label>Name</label>
                    <input
                        className={`h-input ${errors.name ? 'border-danger' : ''}`}
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        autoComplete="name"
                    />
                    {errors.name && <div className="text-danger text-xs mt-1">{errors.name}</div>}
                </div>

                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        className={`h-input ${errors.email ? 'border-danger' : ''}`}
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />
                    {errors.email && <div className="text-danger text-xs mt-1">{errors.email}</div>}
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="p-4 bg-warning/10 border border-warning/20 rounded-xl">
                        <p className="text-sm text-warning-400">
                            Your email address is unverified.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="font-bold underline ml-2 hover:text-warning"
                            >
                                Click here to re-send the verification email.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-success">
                                A new verification link has been sent to your email address.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                    <button type="submit" className="btn btn--primary" disabled={processing}>
                        <svg className="mr-2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                            <polyline points="17 21 17 13 7 13 7 21"></polyline>
                            <polyline points="7 3 7 8 15 8"></polyline>
                        </svg>
                        {processing ? 'Saving...' : 'Save Profile'}
                    </button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-success font-bold">Saved successfully.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
