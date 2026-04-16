import { useState } from 'react';
import axios from 'axios';

function Register() {
    const [companyName, setCompanyName] = useState('');
    const [domain, setDomain] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [focused, setFocused] = useState('');

    const urlParams = new URLSearchParams(window.location.search);
    const inviteToken = urlParams.get('token');

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post('http://localhost:8000/api/register', {
                company_name: companyName,
                domain,
                name,
                email,
                password,
                password_confirmation: passwordConfirmation,
                invite_token: inviteToken,
            });

            localStorage.setItem('token', response.data.token);
            window.location.href = '/job-offers';
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex w-full max-w-6xl">

            {/* ─── Left Column — Branding ─── */}
            <div className="w-1/2 relative overflow-hidden">
                {/* Background image */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-[55%_center]"
                    style={{ backgroundImage: "url('register.jpg')", backgroundPosition: "52% center"}}
                />

                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-10 z-10">
                    <p className="text-sm font-bold text-white/60 tracking-widest uppercase mb-4">KANDID</p>
                    <h1 className="text-4xl font-extrabold text-white leading-tight">
                        Precision Hiring for Modern Teams.
                    </h1>
                    <p className="text-sm text-white/50 mt-4 leading-relaxed max-w-md">
                        Join the editorial-grade recruitment platform designed for high-growth organizations who value talent as art.
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mt-8">
                        <div className="bg-white/15 backdrop-blur-md border border-white/10 rounded-xl px-5 py-3">
                            <div className="text-2xl font-extrabold text-white">40%</div>
                            <div className="text-[10px] text-white/50 uppercase tracking-widest mt-1">Faster Sourcing</div>
                        </div>
                        <div className="bg-white/15 backdrop-blur-md border border-white/10 rounded-xl px-5 py-3">
                            <div className="text-2xl font-extrabold text-white">12k+</div>
                            <div className="text-[10px] text-white/50 uppercase tracking-widest mt-1">Top Tier Candidates</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─── Right Column — Form ─── */}
            <div className="w-1/2 flex items-center justify-center px-16 py-12">
                <div className="max-w-md w-full">

                    {/* Header */}
                    <h2 className="text-3xl font-extrabold text-gray-900">{inviteToken ? 'Join your team' : 'Create your account'}</h2>
                    <p className="text-sm text-gray-400 mt-2 mb-8">
                        {inviteToken ? "You've been invited to join a team on KANDID." : 'Start your journey with the KANDID recruitment platform.'}
                    </p>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                            <span className="text-red-600 text-sm">{error}</span>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleRegister} className="space-y-5">

                        {/* Row 1 — Company Name + Domain */}
                        {!inviteToken && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[11px] uppercase tracking-widest text-gray-400 font-semibold mb-2">
                                    Company Name
                                </label>
                                <div className="relative">
                                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M3 21h18" />
                                        <path d="M5 21V7l8-4v18" />
                                        <path d="M19 21V11l-6-4" />
                                        <path d="M9 9v.01M9 12v.01M9 15v.01M9 18v.01" />
                                    </svg>
                                    <input
                                        type="text"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        placeholder="Acme Corp"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pl-11 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[11px] uppercase tracking-widest text-gray-400 font-semibold mb-2">
                                    Domain (optional)
                                </label>
                                <div className="relative">
                                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10" />
                                        <ellipse cx="12" cy="12" rx="4" ry="10" />
                                        <path d="M2 12h20" />
                                    </svg>
                                    <input
                                        type="text"
                                        value={domain}
                                        onChange={(e) => setDomain(e.target.value)}
                                        placeholder="acme.com"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pl-11 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300"
                                    />
                                </div>
                            </div>
                        </div>
                        )}

                        {/* Row 2 — Full Name */}
                        <div>
                            <label className="block text-[11px] uppercase tracking-widest text-gray-400 font-semibold mb-2">
                                Full Name
                            </label>
                            <div className="relative">
                                <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="John Doe"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pl-11 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300"
                                />
                            </div>
                        </div>

                        {/* Row 3 — Work Email */}
                        <div>
                            <label className="block text-[11px] uppercase tracking-widest text-gray-400 font-semibold mb-2">
                                Work Email
                            </label>
                            <div className="relative">
                                <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="4" width="20" height="16" rx="3" />
                                    <path d="M2 7l10 6 10-6" />
                                </svg>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="john@company.com"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pl-11 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300"
                                />
                            </div>
                        </div>

                        {/* Row 4 — Password + Confirm */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[11px] uppercase tracking-widest text-gray-400 font-semibold mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="3" />
                                        <path d="M7 11V7a5 5 0 0110 0v4" />
                                    </svg>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pl-11 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[11px] uppercase tracking-widest text-gray-400 font-semibold mb-2">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    </svg>
                                    <input
                                        type="password"
                                        value={passwordConfirmation}
                                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pl-11 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors mt-6 disabled:opacity-50"
                        >
                            {loading ? 'Creating account...' : 'Create account'}
                        </button>


                    </form>

                    {/* Bottom link */}
                    <div className="text-center mt-6">
                        <span className="text-sm text-gray-400">Already have an account? </span>
                        <span
                            onClick={() => window.location.href = '/login'}
                            className="text-sm font-bold text-black hover:underline cursor-pointer"
                        >
                            Sign in
                        </span>
                    </div>
                </div>
            </div>

            </div>
        </div>
    );
}

export default Register;
