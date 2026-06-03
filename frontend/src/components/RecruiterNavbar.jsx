import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const STORAGE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/api$/, '');

function NavLink({ icon, label, active, onClick }) {
    return (
        <button onClick={onClick}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-[13px] font-semibold transition-all ${
                active
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
            }`}>
            {icon}
            {label}
        </button>
    );
}

function RecruiterNavbar({ activePage }) {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [userName, setUserName]           = useState('');
    const [companyName, setCompanyName]     = useState('');
    const [showInvite, setShowInvite]       = useState(false);
    const [inviteEmail, setInviteEmail]     = useState('');
    const [inviteStatus, setInviteStatus]   = useState('');
    const [showUserMenu, setShowUserMenu]   = useState(false);
    const [userPhoto, setUserPhoto]         = useState(null);
    const [isCompanyOwner, setIsCompanyOwner] = useState(false);
    const userMenuRef = useRef(null);

    useEffect(() => {
        api.get('/user').then(res => {
            setUserName(res.data.name || '');
            setCompanyName(res.data.company?.name || '');
            setUserPhoto(res.data.profile_photo || null);
            api.get('/company').then(c => setIsCompanyOwner(c.data.is_owner)).catch(() => {});
        }).catch(() => {});
    }, []);

    const photoUrl = userPhoto ? `${STORAGE_URL}/storage/${userPhoto}` : null;

    const sendInvite = () => {
        if (!inviteEmail) return;
        api.post('/team/invite', { email: inviteEmail })
            .then(() => {
                setInviteStatus('success');
                setInviteEmail('');
                setTimeout(() => { setShowInvite(false); setInviteStatus(''); }, 1500);
            })
            .catch(() => setInviteStatus('error'));
    };

    return (
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-30">
            <div className="max-w-7xl mx-auto px-6 h-14.5 flex items-center gap-4">

                {/* ── Logo ── */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <img
                        src="/logo.png"
                        alt="Kandid"
                        className="h-8 w-auto object-contain select-none cursor-pointer shrink-0"
                        onClick={() => navigate('/dashboard')}
                    />
                </div>

                {/* ── Nav Links ── */}
                <div className="flex items-center gap-1">
                    <NavLink
                        active={activePage === 'dashboard'}
                        onClick={() => navigate('/dashboard')}
                        label="Dashboard"
                        icon={
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                                <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                            </svg>
                        }
                    />
                    <NavLink
                        active={activePage === 'job-offers' || activePage === 'pipeline'}
                        onClick={() => navigate('/job-offers')}
                        label="Job Offers"
                        icon={
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="7" width="20" height="14" rx="2"/>
                                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                            </svg>
                        }
                    />
                </div>

                {/* ── Right Side ── */}
                <div className="flex items-center gap-1.5 flex-1 justify-end">

                    {/* Invite */}
                    <div className="relative">
                        {showInvite && <div className="fixed inset-0 z-40" onClick={() => setShowInvite(false)} />}

                        <button
                            onClick={() => { setShowInvite(!showInvite); setInviteStatus(''); setShowUserMenu(false); }}
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border text-[13px] font-semibold transition-all ${
                                showInvite
                                    ? 'bg-gray-900 text-white border-gray-900'
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400 hover:text-gray-900'
                            }`}
                        >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                                <circle cx="9" cy="7" r="4"/>
                                <line x1="19" y1="8" x2="19" y2="14"/>
                                <line x1="22" y1="11" x2="16" y2="11"/>
                            </svg>
                            Invite
                        </button>

                        {showInvite && (
                            <div className="absolute right-0 top-11 z-50 w-80 bg-white rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-100 overflow-hidden">
                                <div className="px-5 pt-5 pb-4 border-b border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center shrink-0">
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                                                <circle cx="9" cy="7" r="4"/>
                                                <line x1="19" y1="8" x2="19" y2="14"/>
                                                <line x1="22" y1="11" x2="16" y2="11"/>
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">Invite a teammate</p>
                                            <p className="text-xs text-gray-400 mt-0.5">They'll join your {companyName} workspace</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="px-5 py-4">
                                    {inviteStatus === 'success' ? (
                                        <div className="flex flex-col items-center py-4 text-center">
                                            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M20 6L9 17l-5-5"/>
                                                </svg>
                                            </div>
                                            <p className="text-sm font-semibold text-gray-900">Invitation sent!</p>
                                            <p className="text-xs text-gray-400 mt-1">They'll receive an email shortly.</p>
                                        </div>
                                    ) : (
                                        <>
                                            <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Work Email</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="email"
                                                    value={inviteEmail}
                                                    onChange={(e) => setInviteEmail(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && sendInvite()}
                                                    placeholder="colleague@company.com"
                                                    autoFocus
                                                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-black/5 transition-all"
                                                />
                                                <button onClick={sendInvite} disabled={!inviteEmail.trim()}
                                                    className="px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-black disabled:opacity-40 transition-all shrink-0">
                                                    Send
                                                </button>
                                            </div>
                                            {inviteStatus === 'error' && (
                                                <p className="text-xs text-red-500 mt-2">Failed to send. Please try again.</p>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="w-px h-5 bg-gray-200 mx-1" />

                    {/* User menu */}
                    <div className="relative" ref={userMenuRef}>
                        {showUserMenu && <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />}

                        <button
                            onClick={() => { setShowUserMenu(!showUserMenu); setShowInvite(false); }}
                            className="flex items-center gap-2.5 pl-1 pr-2.5 py-1 rounded-xl hover:bg-gray-100 transition-colors group"
                        >
                            {/* Avatar */}
                            <div className="relative shrink-0">
                                <img
                                    src={photoUrl || '/no profile pic.jpg'}
                                    alt=""
                                    className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-sm"
                                />
                                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
                            </div>

                            <div className="text-left hidden sm:block">
                                <p className="text-[13px] font-semibold text-gray-900 leading-none">{userName}</p>
                                <p className="text-[11px] text-gray-400 mt-0.5 leading-none">{companyName}</p>
                            </div>

                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                                className={`text-gray-400 group-hover:text-gray-600 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`}>
                                <path d="M6 9l6 6 6-6"/>
                            </svg>
                        </button>

                        {showUserMenu && (
                            <div className="absolute right-0 top-12 z-50 w-64 bg-white rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-100 overflow-hidden">

                                {/* Header */}
                                <div className="px-4 py-4 bg-gray-50 border-b border-gray-100 flex items-center gap-3">
                                    <div className="relative shrink-0">
                                        <img src={photoUrl || '/no profile pic.jpg'} alt=""
                                            className="w-10 h-10 rounded-xl object-cover" />
                                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-gray-900 truncate">{userName}</p>
                                        <p className="text-[11px] text-gray-500 truncate">{companyName}</p>
                                    </div>
                                </div>

                                {/* Links */}
                                <div className="px-2 py-2 space-y-0.5">
                                    <button onClick={() => { setShowUserMenu(false); navigate('/profile'); }}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-gray-700 hover:bg-gray-50 transition-colors font-medium">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                            <circle cx="12" cy="7" r="4"/>
                                        </svg>
                                        My Profile
                                    </button>

                                    {isCompanyOwner && (
                                        <button onClick={() => { setShowUserMenu(false); navigate('/company-profile'); }}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-gray-700 hover:bg-gray-50 transition-colors font-medium">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                                                <polyline points="9 22 9 12 15 12 15 22"/>
                                            </svg>
                                            Company Profile
                                        </button>
                                    )}
                                </div>

                                {/* Sign out */}
                                <div className="px-2 pb-2 border-t border-gray-100 pt-1.5">
                                    <button onClick={() => { logout(); navigate('/login'); }}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors font-medium">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                                            <polyline points="16 17 21 12 16 7"/>
                                            <line x1="21" y1="12" x2="9" y2="12"/>
                                        </svg>
                                        Sign out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default RecruiterNavbar;
