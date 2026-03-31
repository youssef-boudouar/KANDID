import { useState, useEffect } from 'react';
import axios from 'axios';

function JobOffers() {
    const [jobs, setJobs] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        const token = localStorage.getItem('token');

        axios.get('http://localhost:8000/api/job-offers', {
            headers: { Authorization: `Bearer ${token}` }
        }).then(response => {
            setJobs(response.data);
        });
    }, []);

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusStyle = (status) => {
        if (status === 'active') return 'bg-emerald-100 text-emerald-700';
        if (status === 'draft') return 'bg-gray-100 text-gray-600';
        if (status === 'archived') return 'bg-orange-100 text-orange-700';
        return 'bg-gray-100 text-gray-600';
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC]">

            {/* Top Navigation */}
            <nav className="bg-white border-b border-gray-200 px-8 py-4 shadow-sm">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center gap-10">
                        <span className="text-xl font-extrabold tracking-tight text-gray-900">
                            KAND<span className="text-black">ID</span>
                        </span>
                        <div className="flex items-center gap-6 text-sm font-medium text-gray-500">
                            <span className="cursor-pointer hover:text-black transition-colors">Dashboard</span>
                            <span className="cursor-pointer text-black font-bold border-b-2 border-black pb-1">Job Offers</span>
                            <span className="cursor-pointer hover:text-black transition-colors">Applications</span>
                            <span className="cursor-pointer hover:text-black transition-colors">Candidates</span>
                            <span className="cursor-pointer hover:text-black transition-colors">Settings</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-700">COMPANY NAME</span>
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
                            A
                        </div>
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
                    <button className="bg-black text-white px-5 py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors flex items-center gap-2">
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
                            placeholder="Search job titles, departments or locations..."
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
                    <button className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M4 6h16M7 12h10M10 18h4"/>
                        </svg>
                    </button>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredJobs.map(job => (
                            <div key={job.id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300 group cursor-pointer">

                                {/* Card Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${getStatusStyle(job.status)}`}>
                                        {job.status}
                                    </span>
                                    <button className="text-gray-300 hover:text-gray-500 transition-colors opacity-0 group-hover:opacity-100">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                            <circle cx="12" cy="6" r="1.5"/>
                                            <circle cx="12" cy="12" r="1.5"/>
                                            <circle cx="12" cy="18" r="1.5"/>
                                        </svg>
                                    </button>
                                </div>

                                {/* Title & Description */}
                                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-black transition-colors">
                                    {job.title}
                                </h3>
                                <p className="text-gray-500 text-sm leading-relaxed mb-5 line-clamp-2">
                                    {job.description}
                                </p>

                                {/* Stats */}
                                <div className="flex items-center gap-6 mb-5 text-xs">
                                    <div>
                                        <span className="text-gray-400 uppercase tracking-wider">Applications</span>
                                        <p className="text-gray-900 font-bold text-lg mt-0.5">—</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 uppercase tracking-wider">Posted</span>
                                        <p className="text-gray-600 font-medium text-sm mt-0.5">
                                            {new Date(job.created_at).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="border-t border-gray-100 pt-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                                                R
                                            </div>
                                            <span className="text-sm text-gray-600 font-medium">Recruiter</span>
                                        </div>
                                        <svg className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                            <path d="M5 12h14M12 5l7 7-7 7"/>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default JobOffers;
