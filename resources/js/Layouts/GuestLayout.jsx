import { Link } from '@inertiajs/react';
import { Tent } from 'lucide-react';

export default function GuestLayout({ children }) {
    return (
        <div className="auth-layout">
            <div className="auth-layout__logo">
                <Link href="/" className="logo-icon">
                    <Tent size={32} />
                </Link>
            </div>

            <div className="auth-layout__card">
                {children}
            </div>
        </div>
    );
}
