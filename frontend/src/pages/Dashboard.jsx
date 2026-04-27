import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [companyName, setCompanyName] = useState('');
    const [userName, setUserName] = useState('');
    const [showInvite, setShowInvite] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        axios.get('http://localhost:8000/api/user', { headers })
            .then(response => {
                setUserName(response.data.name);
                setCompanyName(response.data.company?.name || '');
            })
            .catch(() => { setLoading(false); });

        axios.get('http://localhost:8000/api/dashboard', { headers })
            .then(response => {
                setStats(response.data);
                setLoading(false);
            })
            .catch(() => { setLoading(false); });
    }, []);

    const getBarColor = (status) => {
        if (status === 'screening') return 'bg-blue-500';
        if (status === 'interview') return 'bg-purple-500';
        if (status === 'technical') return 'bg-amber-500';
        if (status === 'hired') return 'bg-emerald-500';
        if (status === 'rejected') return 'bg-red-500';
        return 'bg-gray-400';
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC]">

            {/* Top Navigation */}
            <nav className="bg-white border-b border-gray-200 px-8 py-4 shadow-sm">
                <div className="flex items-center max-w-7xl mx-auto">
                    <div className="flex-1 flex items-center">
                        <img
                            src="/kandid_logo.png"
                            alt="Kandid"
                            className="h-8 w-auto object-contain select-none"
                        />
                    </div>
                    <div className="flex-1 flex items-center justify-center gap-6 text-sm font-medium text-gray-500">
                        <span className="cursor-pointer text-black font-bold border-b-2 border-black pb-1">Dashboard</span>
                        <span onClick={() => navigate('/job-offers')} className="cursor-pointer hover:text-black transition-colors">Job Offers</span>
                    </div>
                    <div className="flex-1 flex items-center justify-end gap-3">
                        <span className="text-sm font-semibold text-gray-700">{companyName}</span>
                        <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center text-white text-sm font-bold shadow-md">
                            {userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="relative">
                            {showInvite && <div className="fixed inset-0 z-40" onClick={() => setShowInvite(false)} />}
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
                                        placeholder="colleague@company.com"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 mb-3"
                                    />
                                    <button
                                        onClick={() => {
                                            if (!inviteEmail) return;
                                            const token = localStorage.getItem('token');
                                            axios.post('http://localhost:8000/api/team/invite', {
                                                email: inviteEmail,
                                            }, {
                                                headers: { Authorization: `Bearer ${token}` }
                                            }).then(() => {
                                                alert('Invitation sent!');
                                                setInviteEmail('');
                                                setShowInvite(false);
                                            }).catch(() => {
                                                alert('Failed to send invitation');
                                            });
                                        }}
                                        className="w-full py-2 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors"
                                    >
                                        Send Invite
                                    </button>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => {
                                localStorage.removeItem('token');
                                navigate('/login');
                            }}
                            className="text-xs text-gray-400 hover:text-red-500 transition-colors font-medium ml-2"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            {/* Page Content */}
            <div className="max-w-7xl mx-auto px-8 py-8">

                {loading ? (
                    <div className="flex items-center justify-center py-32">
                        <span className="text-gray-400 text-sm">Loading...</span>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {userName}</h1>
                            <p className="text-sm text-gray-400 mt-1">Here's what's happening with your recruitment pipeline.</p>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-4 gap-4 mt-8">
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500" />
                                    <span className="text-xs uppercase tracking-widest text-gray-400 font-semibold">Active Jobs</span>
                                </div>
                                <div className="text-3xl font-extrabold text-gray-900 mt-2">{stats.active_jobs}</div>
                            </div>
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                                    <span className="text-xs uppercase tracking-widest text-gray-400 font-semibold">Total Applications</span>
                                </div>
                                <div className="text-3xl font-extrabold text-gray-900 mt-2">{stats.total_applications}</div>
                            </div>
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                                    <span className="text-xs uppercase tracking-widest text-gray-400 font-semibold">Total Jobs</span>
                                </div>
                                <div className="text-3xl font-extrabold text-gray-900 mt-2">{stats.total_jobs}</div>
                            </div>
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                    <span className="text-xs uppercase tracking-widest text-gray-400 font-semibold">Hired</span>
                                </div>
                                <div className="text-3xl font-extrabold text-gray-900 mt-2">{stats.hired_count}</div>
                            </div>
                        </div>

                        {stats.total_applications === 0 ? (
                            <div className="mt-8 bg-white rounded-2xl border border-gray-200 py-16 text-center">
                                <h3 className="text-lg font-bold text-gray-900">No applications yet</h3>
                                <p className="text-sm text-gray-400 mt-2">Applications will appear here once candidates start applying.</p>
                            </div>
                        ) : (
                            <>
                                {/* Pipeline Overview */}
                                <div className="mt-8 bg-white rounded-2xl border border-gray-200 p-6">
                                    <h2 className="text-lg font-bold text-gray-900 mb-5">Pipeline Overview</h2>
                                    {stats.pipeline.map((item) => (
                                        <div key={item.status} className="flex items-center gap-4 mb-3">
                                            <div className="w-24 text-sm font-medium text-gray-600 capitalize">{item.status}</div>
                                            <div
                                                className={`h-8 rounded-lg min-w-[40px] ${getBarColor(item.status)}`}
                                                style={{ width: `${(item.count / stats.total_applications) * 100}%` }}
                                            />
                                            <div className="text-sm font-bold text-gray-700">{item.count}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Recent Applications */}
                                <div className="mt-8">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-lg font-bold text-gray-900">Recent Applications</h2>
                                        <span
                                            onClick={() => navigate('/job-offers')}
                                            className="text-sm text-gray-400 hover:text-black cursor-pointer"
                                        >
                                            View Pipeline →
                                        </span>
                                    </div>
                                    {stats.recent_applications.map((app) => (
                                        <div key={app.id} className="bg-white rounded-xl border border-gray-200 p-4 mb-3 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center">
                                                    {(app.candidate?.first_name?.[0] || '').toUpperCase()}{(app.candidate?.last_name?.[0] || '').toUpperCase()}
                                                </div>
                                                <span className="text-sm font-semibold text-gray-900">
                                                    {app.candidate?.first_name} {app.candidate?.last_name}
                                                </span>
                                                <span className="text-gray-300 mx-2">→</span>
                                                <span className="text-sm text-gray-500">{app.job_offer?.title}</span>
                                            </div>
                                            <span className="text-xs text-gray-400">
                                                {new Date(app.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
