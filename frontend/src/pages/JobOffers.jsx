import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

function JobOffers() {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [companyName, setCompanyName] = useState('');
    const [userName, setUserName] = useState('');
    const [showInvite, setShowInvite] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');

    useEffect(() => {
        api.get('/job-offers').then(response => {
            setJobs(response.data);
        });

        api.get('/user').then(response => {
            setUserName(response.data.name);
            setCompanyName(response.data.company?.name || '');
        });
    }, []);

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusStyle = (status) => {
        if (status === 'active') return { bar: 'bg-emerald-500', dot: 'bg-emerald-500', text: 'text-emerald-600' };
        if (status === 'draft') return { bar: 'bg-gray-300', dot: 'bg-gray-400', text: 'text-gray-500' };
        if (status === 'archived') return { bar: 'bg-orange-400', dot: 'bg-orange-400', text: 'text-orange-500' };
        return { bar: 'bg-gray-300', dot: 'bg-gray-400', text: 'text-gray-500' };
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC]">

            {/* Top Navigation */}
            <nav className="bg-white border-b border-gray-200 px-8 py-4 shadow-sm">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <img
                        src="/kandid_logo.png"
                        alt="Kandid"
                        className="h-8 w-auto object-contain select-none"
                    />
                    <div className="flex items-center gap-6 text-sm font-medium text-gray-500">
                        <span onClick={() => navigate('/dashboard')} className="cursor-pointer hover:text-black transition-colors">Dashboard</span>
                        <span className="cursor-pointer text-black font-bold border-b-2 border-black pb-1">Job Offers</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-700">{companyName}</span>
                        <div className="w-9 h-9 rounded-full  bg-black flex items-center justify-center text-white text-sm font-bold shadow-md">
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
                                            api.post('/team/invite', {
                                                email: inviteEmail,
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

                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900">Job Offers</h1>
                        <p className="text-gray-500 mt-1">Manage your active recruitment pipelines and internal talent needs.</p>
                    </div>
                    <button onClick={() => navigate('/job-offers/create')} className="bg-black text-white px-5 py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M12 5v14M5 12h14"/>
                        </svg>
                        Create New Job
                    </button>
                </div>

                {/* Search & Filter */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="flex-1 relative">
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <circle cx="11" cy="11" r="8"/>
                            <path d="M21 21l-4.35-4.35"/>
                        </svg>
                        <input
                            type="text"
                            placeholder="Search job titles"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 transition-all"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-black/5 cursor-pointer"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="draft">Draft</option>
                        <option value="archived">Archived</option>
                    </select>
                </div>

                {/* Job Cards Grid */}
                {filteredJobs.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded-2xl py-20 text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round">
                                <rect x="3" y="3" width="18" height="18" rx="3"/>
                                <path d="M9 12h6M12 9v6"/>
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">No job offers found?</h3>
                        <p className="text-gray-500 text-sm max-w-sm mx-auto mb-5">
                            Try adjusting your filters or search terms to find what you're looking for, or create a brand new vacancy to start hiring.
                        </p>
                        <button
                            onClick={() => { setSearch(''); setStatusFilter('all'); }}
                            className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            Clear All Filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredJobs.map(job => {
                            const status = getStatusStyle(job.status);
                            return (
                            <div key={job.id} onClick={() => navigate(`/job-offers/${job.id}`)} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-gray-200/60 hover:-translate-y-1 hover:border-gray-200 transition-all duration-500 ease-out cursor-pointer group">

                                {/* Accent Bar */}
                                <div className={`h-[3px] w-full ${status.bar}`} />

                                {/* Card Body */}
                                <div className="p-6">

                                    {/* Row 1 — Status */}
                                    <div className="flex justify-between items-center">
                                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${status.text}`}>
                                            <span className={`w-2 h-2 rounded-full ${status.dot}`} />
                                            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                                        </span>
                                    </div>

                                    {/* Row 2 — Title */}
                                    <h3 className="mt-4 text-lg font-bold text-gray-900 group-hover:text-black">
                                        {job.title}
                                    </h3>

                                    {/* Row 3 — Description */}
                                    <p className="mt-2 text-[13px] text-gray-400 leading-relaxed line-clamp-2">
                                        {job.description}
                                    </p>

                                    {/* Row 4 — Info Pills */}
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <span className="px-2.5 py-1 bg-gray-50 rounded-lg text-[11px] font-medium text-gray-500 flex items-center gap-1.5">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                                <circle cx="9" cy="7" r="4"/>
                                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                            </svg>
                                            {job.applications_count || 0} Applications
                                        </span>
                                        <span className="px-2.5 py-1 bg-gray-50 rounded-lg text-[11px] font-medium text-gray-500 flex items-center gap-1.5">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                                <line x1="16" y1="2" x2="16" y2="6"/>
                                                <line x1="8" y1="2" x2="8" y2="6"/>
                                                <line x1="3" y1="10" x2="21" y2="10"/>
                                            </svg>
                                            {new Date(job.created_at).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>

                                    {/* Divider */}
                                    <div className="mt-5 border-t border-gray-50" />

                                    {/* Row 5 — Footer */}
                                    <div className="pt-4 flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                                {companyName.charAt(0)}
                                            </div>
                                            <span className="text-sm font-semibold text-gray-700">{companyName}</span>
                                        </div>
                                        <span className="text-xs font-medium text-gray-400 group-hover:text-black flex items-center gap-1 transition-all">
                                            View details
                                            <svg className="group-hover:translate-x-0.5 transition-transform duration-300" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                                <path d="M5 12h14M12 5l7 7-7 7"/>
                                            </svg>
                                        </span>
                                    </div>
                                </div>
                            </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default JobOffers;
