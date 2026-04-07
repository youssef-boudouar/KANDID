import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

function RecruiterNavbar({ activePage }) {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [showInvite, setShowInvite] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteStatus, setInviteStatus] = useState('');

    useEffect(() => {
        api.get('/user').then((res) => {
            setUserName(res.data.name || '');
            setCompanyName(res.data.company?.name || '');
        });
    }, []);

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

    const navItem = (label, page, path) => {
        const active = activePage === page;
        return (
            <span
                onClick={() => navigate(path)}
                className={`cursor-pointer transition-colors text-sm font-medium ${
                    active
                        ? 'text-black font-bold border-b-2 border-black pb-1'
                        : 'text-gray-500 hover:text-black'
                }`}
            >
                {label}
            </span>
        );
    };

    return (
        <nav className="bg-white border-b border-gray-200 px-8 py-4 shadow-sm">
            <div className="flex items-center max-w-7xl mx-auto">
                {/* Logo */}
                <div className="flex-1 flex items-center">
                    <img
                        src="/kandid_logo.png"
                        alt="Kandid"
                        className="h-8 w-auto object-contain select-none cursor-pointer"
                        onClick={() => navigate('/dashboard')}
                    />
                </div>

                {/* Nav Links */}
                <div className="flex-1 flex items-center justify-center gap-6">
                    {navItem('Dashboard', 'dashboard', '/dashboard')}
                    {navItem('Job Offers', 'job-offers', '/job-offers')}
                    {activePage === 'pipeline' && navItem('Pipeline', 'pipeline', '#')}
                </div>

                {/* Right side */}
                <div className="flex-1 flex items-center justify-end gap-3">
                    <span className="text-sm font-semibold text-gray-700">{companyName}</span>
                    <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center text-white text-sm font-bold shadow-md select-none">
                        {userName.charAt(0).toUpperCase()}
                    </div>

                    {/* Invite dropdown */}
                    <div className="relative">
                        {showInvite && (
                            <div className="fixed inset-0 z-40" onClick={() => setShowInvite(false)} />
                        )}
                        <button
                            onClick={() => setShowInvite(!showInvite)}
                            className="text-xs text-gray-500 hover:text-black transition-colors font-medium"
                        >
                            + Invite
                        </button>
                        {showInvite && (
                            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-xl shadow-lg p-4 w-72 z-50">
                                <p className="text-sm font-bold text-gray-900 mb-3">Invite Team Member</p>
                                <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && sendInvite()}
                                    placeholder="colleague@company.com"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 mb-3"
                                />
                                {inviteStatus === 'success' && (
                                    <p className="text-xs text-emerald-600 mb-2">Invitation sent!</p>
                                )}
                                {inviteStatus === 'error' && (
                                    <p className="text-xs text-red-500 mb-2">Failed to send invitation.</p>
                                )}
                                <button
                                    onClick={sendInvite}
                                    className="w-full py-2 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors"
                                >
                                    Send Invite
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Logout */}
                    <button
                        onClick={() => { localStorage.removeItem('token'); navigate('/login'); }}
                        className="text-xs text-gray-400 hover:text-red-500 transition-colors font-medium ml-2"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
}

export default RecruiterNavbar;
