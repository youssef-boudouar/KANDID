import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import RecruiterNavbar from '../components/RecruiterNavbar';
import { SkeletonCard } from '../components/Skeleton';

function JobOffers() {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [companyName, setCompanyName] = useState('');
    const [companyLogo, setCompanyLogo] = useState(null);
    const [loading, setLoading] = useState(true);
    const searchRef = useRef(null);

    const STORAGE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/api$/, '');

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
                e.preventDefault();
                searchRef.current?.focus();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    useEffect(() => {
        api.get('/job-offers').then(response => {
            setJobs(response.data);
            setLoading(false);
        }).catch(() => { setLoading(false); });

        api.get('/company').then(response => {
            setCompanyName(response.data.name || '');
            setCompanyLogo(response.data.logo || null);
        });
    }, []);

    const filteredJobs = jobs
        .filter(job => {
            const matchesSearch = job.title.toLowerCase().includes(search.toLowerCase()) ||
                job.description?.toLowerCase().includes(search.toLowerCase());
            const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
            return matchesSearch && matchesStatus;
        })
        .sort((a, b) => {
            if (sortBy === 'newest')        return new Date(b.created_at) - new Date(a.created_at);
            if (sortBy === 'oldest')        return new Date(a.created_at) - new Date(b.created_at);
            if (sortBy === 'most-applied')  return (b.applications_count||0) - (a.applications_count||0);
            if (sortBy === 'az')            return a.title.localeCompare(b.title);
            if (sortBy === 'za')            return b.title.localeCompare(a.title);
            return 0;
        });

    const hasActiveFilters = search || statusFilter !== 'all' || sortBy !== 'newest';
    const clearFilters = () => { setSearch(''); setStatusFilter('all'); setSortBy('newest'); };

    const getStatusStyle = (status) => {
        if (status === 'active') return { bar: 'bg-emerald-500', dot: 'bg-emerald-500', text: 'text-emerald-600' };
        if (status === 'draft') return { bar: 'bg-gray-300', dot: 'bg-gray-400', text: 'text-gray-500' };
        if (status === 'archived') return { bar: 'bg-orange-400', dot: 'bg-orange-400', text: 'text-orange-500' };
        return { bar: 'bg-gray-300', dot: 'bg-gray-400', text: 'text-gray-500' };
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <RecruiterNavbar activePage="job-offers" />

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
                <div className="mb-8 space-y-3">

                    {/* Row 1: search + sort */}
                    <div className="flex items-center gap-3">
                        {/* Search */}
                        <div className="flex-1 relative group">
                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-700 transition-colors pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                            </svg>
                            <input
                                type="text"
                                placeholder="Search by title or description…"
                                ref={searchRef}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-11 pr-28 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-900/5 transition-all shadow-sm"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                {search && (
                                    <button onClick={() => setSearch('')}
                                        className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition-colors">
                                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                                            <path d="M18 6L6 18M6 6l12 12"/>
                                        </svg>
                                    </button>
                                )}
                                {!search && (
                                    <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-[10px] font-mono text-gray-400 select-none">
                                        /
                                    </kbd>
                                )}
                            </div>
                        </div>

                        {/* Sort */}
                        <div className="relative shrink-0">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="appearance-none pl-4 pr-9 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 font-medium focus:outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-900/5 cursor-pointer shadow-sm transition-all"
                            >
                                <option value="newest">Newest first</option>
                                <option value="oldest">Oldest first</option>
                                <option value="most-applied">Most applicants</option>
                                <option value="az">A → Z</option>
                                <option value="za">Z → A</option>
                            </select>
                            <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <path d="M6 9l6 6 6-6"/>
                            </svg>
                        </div>
                    </div>

                    {/* Row 2: status pills + results */}
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            {[
                                { value: 'all',      label: 'All',      dot: null },
                                { value: 'active',   label: 'Active',   dot: 'bg-emerald-500' },
                                { value: 'draft',    label: 'Draft',    dot: 'bg-gray-400' },
                                { value: 'archived', label: 'Archived', dot: 'bg-orange-400' },
                            ].map(s => (
                                <button key={s.value} onClick={() => setStatusFilter(s.value)}
                                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                                        statusFilter === s.value
                                            ? 'bg-gray-900 text-white border-gray-900'
                                            : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-700'
                                    }`}>
                                    {s.dot && <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />}
                                    {s.label}
                                </button>
                            ))}

                            {hasActiveFilters && (
                                <button onClick={clearFilters}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-400 hover:text-gray-700 border border-dashed border-gray-200 hover:border-gray-400 transition-all">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                        <path d="M18 6L6 18M6 6l12 12"/>
                                    </svg>
                                    Clear filters
                                </button>
                            )}
                        </div>

                        <span className="text-xs text-gray-400 font-medium shrink-0">
                            {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} found
                        </span>
                    </div>
                </div>

                {/* Job Cards Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : filteredJobs.length === 0 ? (
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
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {filteredJobs.map(job => {
                            const postedDate = new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                            const initials = companyName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                            const isActive   = job.status === 'active';
                            const isDraft    = job.status === 'draft';
                            const isArchived = job.status === 'archived';
                            const total      = job.applications_count || 0;
                            const pipeline   = job.pipeline || {};
                            const pct        = (n) => total > 0 ? (n / total) * 100 : 0;

                            // Relative time
                            const daysAgo = Math.floor((Date.now() - new Date(job.updated_at || job.created_at)) / 86400000);
                            const timeLabel = daysAgo === 0 ? 'Today' : daysAgo === 1 ? '1 day ago' : daysAgo < 7 ? `${daysAgo} days ago` : daysAgo < 30 ? `${Math.floor(daysAgo/7)}w ago` : `${Math.floor(daysAgo/30)}mo ago`;

                            return (
                            <div
                                key={job.id}
                                onClick={() => navigate(`/job-offers/${job.id}`)}
                                className="group bg-white rounded-2xl border border-gray-200 cursor-pointer hover:border-gray-400 hover:shadow-xl hover:shadow-gray-200/80 transition-all duration-300 flex flex-col overflow-hidden"
                            >
                                {/* Top accent */}
                                <div className={`h-1 w-full shrink-0 ${isActive ? 'bg-emerald-500' : isDraft ? 'bg-gray-300' : 'bg-orange-400'}`} />

                                {/* Card body */}
                                <div className="p-5 flex-1 flex flex-col gap-4">

                                    {/* Header row — logo + title + status */}
                                    <div className="flex items-start gap-3.5">
                                        {/* Logo */}
                                        <img
                                            src={companyLogo ? `${STORAGE_URL}/storage/${companyLogo}` : '/default company logo.png'}
                                            alt=""
                                            className="w-11 h-11 rounded-full object-cover shrink-0 border border-gray-100 shadow-sm scale-110"
                                        />

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h3 className="text-[15px] font-extrabold text-gray-900 leading-snug tracking-tight line-clamp-2">
                                                    {job.title}
                                                </h3>
                                                <span className={`shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                                                    isActive   ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                    isDraft    ? 'bg-gray-100 text-gray-600 border-gray-200' :
                                                                 'bg-orange-50 text-orange-700 border-orange-200'
                                                }`}>
                                                    {isActive ? '● Active' : isDraft ? 'Draft' : 'Archived'}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-gray-400 mt-0.5 font-medium">{companyName}</p>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p className="text-[13px] text-gray-500 leading-relaxed line-clamp-2">
                                        {job.description}
                                    </p>

                                    {/* Stats */}
                                    <div className="flex items-center gap-4">
                                        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-600">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                            </svg>
                                            {total > 0 ? `${total} Application${total !== 1 ? 's' : ''}` : 'No applicants yet'}
                                        </span>
                                        <span className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400">
                                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                                            </svg>
                                            {timeLabel}
                                        </span>
                                    </div>

                                    {/* Tags */}
                                    {job.tags && job.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5">
                                            {job.tags.map(tag => (
                                                <span key={tag.id} className="px-2 py-0.5 rounded-md text-[10px] font-bold"
                                                    style={{ backgroundColor: `${tag.color}15`, color: tag.color }}>
                                                    {tag.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Pipeline section */}
                                    {isActive && (
                                        <div className="mt-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Pipeline Status</span>
                                                {total > 0 && (
                                                    <span className="text-[10px] font-bold text-gray-500">
                                                        {Math.round(pct(pipeline.hired || 0))}% hired
                                                    </span>
                                                )}
                                            </div>
                                            {total > 0 ? (
                                                <>
                                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden flex gap-0.5">
                                                        {pipeline.screening > 0  && <div style={{width:`${pct(pipeline.screening)}%`}}  className="bg-blue-400 h-full rounded-full" />}
                                                        {pipeline.interview  > 0  && <div style={{width:`${pct(pipeline.interview)}%`}}  className="bg-purple-400 h-full rounded-full" />}
                                                        {pipeline.technical  > 0  && <div style={{width:`${pct(pipeline.technical)}%`}}  className="bg-amber-400 h-full rounded-full" />}
                                                        {pipeline.hired      > 0  && <div style={{width:`${pct(pipeline.hired)}%`}}      className="bg-emerald-500 h-full rounded-full" />}
                                                        {pipeline.rejected   > 0  && <div style={{width:`${pct(pipeline.rejected)}%`}}   className="bg-red-400 h-full rounded-full" />}
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-2">
                                                        {pipeline.screening > 0  && <span className="flex items-center gap-1 text-[10px] text-gray-500"><span className="w-2 h-2 rounded-full bg-blue-400 shrink-0"/>{pipeline.screening} Screening</span>}
                                                        {pipeline.interview  > 0 && <span className="flex items-center gap-1 text-[10px] text-gray-500"><span className="w-2 h-2 rounded-full bg-purple-400 shrink-0"/>{pipeline.interview} Interview</span>}
                                                        {pipeline.hired      > 0 && <span className="flex items-center gap-1 text-[10px] text-gray-500"><span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"/>{pipeline.hired} Hired</span>}
                                                    </div>
                                                </>
                                            ) : (
                                                <p className="text-[11px] text-gray-400 italic">No applications yet — share this job to start receiving candidates</p>
                                            )}
                                        </div>
                                    )}

                                    {isDraft && (
                                        <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-400">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                            </svg>
                                            Private draft — not visible to candidates
                                        </div>
                                    )}

                                    {isArchived && (
                                        <div className="mt-1">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Historical Data</span>
                                                <span className="text-[10px] font-bold text-gray-500">{pipeline.hired || 0} Hired</span>
                                            </div>
                                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden flex gap-0.5">
                                                {total > 0 && pipeline.hired > 0 && <div style={{width:`${pct(pipeline.hired)}%`}} className="bg-emerald-400 h-full rounded-full" />}
                                                {total > 0 && pipeline.rejected > 0 && <div style={{width:`${pct(pipeline.rejected)}%`}} className="bg-red-300 h-full rounded-full" />}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Footer CTA */}
                                <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                                    <span className="text-[11px] font-medium text-gray-400">{postedDate}</span>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); navigate(isActive ? `/job-offers/${job.id}/pipeline` : isArchived ? `/job-offers/${job.id}` : `/job-offers/${job.id}/edit`); }}
                                        className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl transition-all ${
                                            isActive ? 'bg-gray-900 text-white hover:bg-black' :
                                                       'bg-white border border-gray-200 text-gray-700 hover:border-gray-400'
                                        }`}
                                    >
                                        {isActive ? 'View Pipeline' : isDraft ? 'Edit Draft' : 'View History'}
                                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M5 12h14M12 5l7 7-7 7"/>
                                        </svg>
                                    </button>
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
