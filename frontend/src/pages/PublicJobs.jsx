import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

function PublicJobs() {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/public/jobs')
            .then((response) => {
                setJobs(response.data);
                setLoading(false);
            });
    }, []);

    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#f9fafb]">

            {/* ─── Navbar ─── */}
            <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
                <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
                    <img
                        src="/kandid_logo.png"
                        alt="Kandid"
                        className="h-7 w-auto object-contain cursor-pointer select-none"
                        onClick={() => navigate('/jobs')}
                    />

                    <div className="hidden md:flex items-center gap-8 text-sm text-gray-500 font-medium">
                        <a href="/jobs" className="text-[#0a0a0a] font-semibold border-b-2 border-[#0a0a0a] pb-0.5">Browse Jobs</a>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/login')}
                            className="hidden md:inline-block text-sm text-gray-500 hover:text-[#0a0a0a] transition-colors font-medium"
                        >
                            For Recruiters
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="bg-[#0a0a0a] text-white rounded-full px-4 py-1.5 text-sm font-semibold hover:bg-gray-800 transition-colors"
                        >
                            Sign In
                        </button>
                    </div>
                </div>
            </nav>

            {/* ─── Hero Section ─── */}
            <section className="bg-[#f9fafb]">
                <div className="max-w-3xl mx-auto px-6 pt-16 pb-14 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-[#0a0a0a] leading-[1.1] tracking-tight">
                        Find Your Next Role
                    </h1>
                    <p className="text-base text-[#6b7280] mt-4 max-w-lg mx-auto leading-relaxed">
                        Browse our curated list of high-impact opportunities at the world's most innovative companies.
                    </p>

                    {/* Search bar */}
                    <div className="max-w-xl mx-auto mt-8">
                        <div className="flex items-center border border-gray-200 rounded-full bg-white overflow-hidden shadow-sm focus-within:border-gray-300 focus-within:shadow-md transition-all">
                            <div className="pl-5 pr-2 flex-shrink-0">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8" />
                                    <path d="M21 21l-4.35-4.35" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by job title"
                                className="flex-1 py-3 px-2 pr-5 text-sm text-[#0a0a0a] placeholder-gray-400 bg-transparent focus:outline-none"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Job Listing Section ─── */}
            <section className="max-w-3xl mx-auto px-6 py-12">

                {/* Section header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-[#0a0a0a]">Open Positions</h2>
                        {!loading && (
                            <span className="bg-gray-100 text-gray-500 text-[11px] font-semibold uppercase tracking-wider rounded-full px-3 py-1">
                                {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} available
                            </span>
                        )}
                    </div>
                </div>

                {/* Loading */}
                {loading ? (
                    <p className="text-center text-gray-400 py-20">Loading...</p>

                    /* Empty state */
                ) : filteredJobs.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
                        <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round">
                                <circle cx="11" cy="11" r="8" />
                                <path d="M21 21l-4.35-4.35" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-[#0a0a0a]">
                            {search.length > 0 ? 'No positions match your search' : 'No open positions right now'}
                        </h3>
                        <p className="text-sm text-[#6b7280] mt-2 max-w-xs mx-auto">
                            {search.length > 0
                                ? 'Try different keywords or clear your search to see all jobs.'
                                : 'Check back soon — new opportunities are added regularly.'}
                        </p>
                    </div>

                    /* Job rows */
                ) : (
                    <div className="border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-100">
                        {filteredJobs.map((job) => (
                            <div
                                key={job.id}
                                onClick={() => navigate(`/jobs/${job.id}`)}
                                className="bg-white px-6 py-6 flex items-start gap-4 cursor-pointer hover:bg-[#f9fafb] transition-colors duration-150 group"
                            >
                                {/* Avatar */}
                                <div className="w-11 h-11 rounded-full bg-[#0a0a0a] text-white font-bold flex items-center justify-center flex-shrink-0 text-base">
                                    {(job.company?.name || 'U').charAt(0)}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base font-bold text-[#0a0a0a]">
                                        {job.title}
                                    </h3>
                                    <p className="text-sm text-[#6b7280] mt-0.5">{job.company?.name || 'Unknown'}</p>
                                    <p className="text-sm text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                                        {job.description}
                                    </p>

                                    {/* Tags */}
                                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                                        <span className="bg-gray-100 text-gray-600 text-[10px] uppercase tracking-wide font-medium px-2.5 py-0.5 rounded-full">
                                            {new Date(job.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                {/* Arrow */}
                                <div className="flex-shrink-0 self-center text-gray-300 group-hover:text-gray-500 transition-colors">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9 18l6-6-6-6" />
                                    </svg>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* ─── Footer ─── */}
            <footer className="border-t border-gray-100">
                <p className="text-sm text-gray-300 py-8 text-center font-medium">
                    <span className="inline-flex items-center gap-1.5 text-gray-400">
                        Powered by
                        <img
                            src="/kandid_logo.png"
                            alt="Kandid"
                            className="h-4 w-auto object-contain opacity-50 select-none"
                        />
                    </span>
                </p>
            </footer>
        </div>
    );
}

export default PublicJobs;
