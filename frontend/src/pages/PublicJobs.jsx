import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import PublicNavbar from "../components/PublicNavbar";

const STORAGE_URL = (import.meta.env.VITE_API_URL || "http://localhost:8000/api").replace(/\/api$/, "");

function logoSrc(logo) {
    return logo ? `${STORAGE_URL}/storage/${logo}` : "/default company logo.png";
}

function isNew(dateStr) {
    return (Date.now() - new Date(dateStr).getTime()) < 7 * 24 * 60 * 60 * 1000;
}

function relDate(dateStr) {
    const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
}

export default function PublicJobs() {
    const navigate = useNavigate();
    const [jobs, setJobs]       = useState([]);
    const [search, setSearch]   = useState("");
    const [loading, setLoading] = useState(true);
    const [meta, setMeta]       = useState(null);
    const [page, setPage]       = useState(1);
    const [activeTag, setActiveTag] = useState("All");
    const [saved, setSaved]     = useState(() => {
        try { return JSON.parse(localStorage.getItem("kandid_saved") || "[]"); } catch { return []; }
    });
    const searchRef = useRef(null); // kept for clear-button focus

    useEffect(() => {
        setLoading(true);
        api.get(`/public/jobs?page=${page}`)
            .then(r => { setJobs(r.data.data); setMeta(r.data); setLoading(false); })
            .catch(() => setLoading(false));
    }, [page]);

    useEffect(() => { setPage(1); }, [search, activeTag]);

    const toggleSave = (e, id) => {
        e.stopPropagation();
        setSaved(prev => {
            const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
            localStorage.setItem("kandid_saved", JSON.stringify(next));
            return next;
        });
    };

    // Collect all unique tags across loaded jobs
    const allTags = ["All", ...Array.from(new Set(jobs.flatMap(j => (j.tags || []).map(t => t.name))))];

    const filtered = jobs.filter(job => {
        const matchSearch = job.title.toLowerCase().includes(search.toLowerCase()) ||
            (job.company?.name || "").toLowerCase().includes(search.toLowerCase());
        const matchTag = activeTag === "All" || (job.tags || []).some(t => t.name === activeTag);
        return matchSearch && matchTag;
    });

    const totalJobs = meta?.total ?? filtered.length;
    const companies = new Set(jobs.map(j => j.company?.name)).size;

    return (
        <div className="min-h-screen bg-[#f8f9fa]">
            <PublicNavbar />

            {/* ── Hero ──────────────────────────────────────────────── */}
            <section className="bg-[#f9fafb]">
                <div className="max-w-3xl mx-auto px-6 pt-8 pb-6 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-[#0a0a0a] leading-tight tracking-tight">
                        Find Your Next Role
                    </h1>
                    <p className="text-base text-[#6b7280] mt-4 max-w-lg mx-auto leading-relaxed">
                        Browse our curated list of high-impact opportunities at the world's most innovative companies.
                    </p>

                    <div className="max-w-xl mx-auto mt-6">
                        <div className="flex items-center border border-gray-200 rounded-full bg-white overflow-hidden shadow-sm focus-within:border-gray-300 focus-within:shadow-md transition-all">
                            <div className="pl-5 pr-2 shrink-0">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                                </svg>
                            </div>
                            <input
                                ref={searchRef}
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search by job title"
                                className="flex-1 py-3 px-2 pr-5 text-sm text-[#0a0a0a] placeholder-gray-400 bg-transparent focus:outline-none"
                            />
                            {search && (
                                <button onClick={() => setSearch("")} className="pr-4 text-gray-400 hover:text-gray-600 transition-colors">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ── Tag filters ── */}
                    <div className="flex items-center justify-center gap-2 flex-wrap mt-4">
                        {allTags.map(tag => (
                            <button key={tag} onClick={() => setActiveTag(tag)}
                                className={`shrink-0 px-4 py-1.5 rounded-full text-[12px] font-semibold transition-all ${
                                    activeTag === tag
                                        ? "bg-[#0a0a0a] text-white"
                                        : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                                }`}>
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Jobs grid ─────────────────────────────────────────── */}
            <section className="max-w-5xl mx-auto px-6 py-10">

                {/* Results header */}
                <div className="flex items-center justify-between mb-6">
                    <p className="text-[13px] text-gray-400 font-medium">
                        {loading ? "Loading…" : `${filtered.length} result${filtered.length !== 1 ? "s" : ""}${activeTag !== "All" ? ` in ${activeTag}` : ""}${search ? ` for "${search}"` : ""}`}
                    </p>
                    {saved.length > 0 && (
                        <button onClick={() => setActiveTag("saved")}
                            className="text-[12px] font-semibold text-indigo-500 hover:text-indigo-700 flex items-center gap-1.5 transition-colors">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
                            {saved.length} saved
                        </button>
                    )}
                </div>

                {loading ? (
                    /* Skeleton */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-gray-100" />
                                    <div className="flex-1">
                                        <div className="h-3 bg-gray-100 rounded w-24 mb-2" />
                                        <div className="h-4 bg-gray-100 rounded w-40" />
                                    </div>
                                </div>
                                <div className="h-3 bg-gray-100 rounded w-full mb-2" />
                                <div className="h-3 bg-gray-100 rounded w-3/4" />
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 py-24 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round">
                                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-[#0a0a0a]">No positions found</h3>
                        <p className="text-sm text-gray-400 mt-2 max-w-xs mx-auto">
                            {search ? "Try different keywords or clear your search." : "Check back soon — new roles are added regularly."}
                        </p>
                        {(search || activeTag !== "All") && (
                            <button onClick={() => { setSearch(""); setActiveTag("All"); }}
                                className="mt-5 px-5 py-2 bg-[#0a0a0a] text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors">
                                Clear filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filtered.map(job => (
                            <div key={job.id} onClick={() => navigate(`/jobs/${job.id}`)}
                                className="group bg-white rounded-2xl border border-gray-100 p-6 cursor-pointer hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100/80 hover:-translate-y-0.5 transition-all duration-200 flex flex-col">

                                {/* Top row */}
                                <div className="flex items-start justify-between gap-3 mb-4">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={logoSrc(job.company?.logo)}
                                            alt={job.company?.name}
                                            className="w-12 h-12 rounded-xl object-cover border border-gray-100 shrink-0"
                                            onError={e => { e.currentTarget.src = "/default company logo.png"; }}
                                        />
                                        <div>
                                            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider leading-none mb-1">
                                                {job.company?.name || "Unknown"}
                                            </p>
                                            <h3 className="text-[15px] font-bold text-[#0a0a0a] leading-snug">
                                                {job.title}
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Save button */}
                                    <button onClick={e => toggleSave(e, job.id)}
                                        className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                                            saved.includes(job.id)
                                                ? "bg-indigo-50 text-indigo-500"
                                                : "bg-gray-50 text-gray-300 hover:text-gray-500 hover:bg-gray-100"
                                        }`}>
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill={saved.includes(job.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                            <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>
                                        </svg>
                                    </button>
                                </div>

                                {/* Description */}
                                <p className="text-[13px] text-gray-400 leading-relaxed line-clamp-2 flex-1">
                                    {job.description}
                                </p>

                                {/* Tags */}
                                {job.tags?.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-4">
                                        {job.tags.slice(0, 4).map(tag => (
                                            <span key={tag.id}
                                                className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-gray-50 text-gray-500 border border-gray-100">
                                                {tag.name}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Footer row */}
                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                                    <div className="flex items-center gap-3">
                                        {isNew(job.created_at) && (
                                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600">
                                                New
                                            </span>
                                        )}
                                        <span className="text-[11px] text-gray-400 font-medium">
                                            {relDate(job.created_at)}
                                        </span>
                                        {job.applications_count > 0 && (
                                            <span className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                                                    <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
                                                </svg>
                                                {job.applications_count} applicants
                                            </span>
                                        )}
                                    </div>

                                    <span className="text-[12px] font-bold text-indigo-500 group-hover:text-indigo-700 flex items-center gap-1 transition-colors">
                                        Apply
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M5 12h14M12 5l7 7-7 7"/>
                                        </svg>
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {meta && meta.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-10">
                        <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold bg-white border border-gray-200 text-gray-600 disabled:opacity-30 hover:border-gray-300 hover:bg-gray-50 transition-all">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
                            Previous
                        </button>
                        <div className="flex items-center gap-1">
                            {[...Array(meta.last_page)].map((_, i) => (
                                <button key={i} onClick={() => setPage(i + 1)}
                                    className={`w-9 h-9 rounded-xl text-[13px] font-bold transition-all ${
                                        page === i + 1
                                            ? "bg-[#0a0a0a] text-white"
                                            : "bg-white border border-gray-200 text-gray-500 hover:border-gray-300"
                                    }`}>
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setPage(p => p + 1)} disabled={page === meta.last_page}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold bg-white border border-gray-200 text-gray-600 disabled:opacity-30 hover:border-gray-300 hover:bg-gray-50 transition-all">
                            Next
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
                        </button>
                    </div>
                )}
            </section>

            {/* ── Footer ────────────────────────────────────────────── */}
            <footer className="border-t border-gray-100 mt-10">
                <div className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="Kandid" className="h-6 w-auto opacity-60" />
                    </div>
                    <p className="text-[12px] text-gray-300 font-medium">
                        © 2026 Kandid · All rights reserved
                    </p>
                </div>
            </footer>
        </div>
    );
}
