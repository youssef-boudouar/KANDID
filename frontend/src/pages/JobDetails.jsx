import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import RecruiterNavbar from '../components/RecruiterNavbar';
import { useToast, ToastContainer } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import DOMPurify from 'dompurify';
import '../components/RichTextEditor.css';

const STATUS_CFG = {
    active:   { label: 'Active',   dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', bar: 'bg-emerald-500' },
    draft:    { label: 'Draft',    dot: 'bg-gray-400',    badge: 'bg-gray-100 text-gray-600 border-gray-200',          bar: 'bg-gray-300'   },
    archived: { label: 'Archived', dot: 'bg-orange-400',  badge: 'bg-orange-50 text-orange-700 border-orange-200',     bar: 'bg-orange-400' },
};

const AVATAR_COLORS = ['bg-blue-500','bg-violet-500','bg-emerald-500','bg-amber-500','bg-rose-500','bg-cyan-600','bg-pink-500','bg-indigo-500'];

function avatarColor(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
    return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function initials(name) {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function parseActivity(desc) {
    const verbs = ['added', 'moved', 'updated', 'changed', 'deleted', 'created', 'archived', 'hired', 'rejected', 'invited'];
    for (const v of verbs) {
        const i = desc.indexOf(` ${v} `);
        if (i > 0) return { actor: desc.slice(0, i), action: desc.slice(i + 1) };
    }
    return { actor: '', action: desc };
}

function relTime(dateStr) {
    const d = Math.floor((Date.now() - new Date(dateStr)) / 86400000);
    if (d === 0) return 'Today';
    if (d === 1) return 'Yesterday';
    if (d < 7)  return `${d}d ago`;
    if (d < 30) return `${Math.floor(d / 7)}w ago`;
    return `${Math.floor(d / 30)}mo ago`;
}

function fmt(d) {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function JobDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob]                 = useState(null);
    const [error, setError]             = useState('');
    const [loading, setLoading]         = useState(true);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [activeTab, setActiveTab]     = useState('overview');
    const [activities, setActivities]   = useState([]);
    const { toasts, show: showToast }   = useToast();

    useEffect(() => {
        api.get(`/job-offers/${id}`).then(r => { setJob(r.data); setLoading(false); })
            .catch(() => { setError('Failed to load job offer'); setLoading(false); });
        api.get('/activities').then(r => setActivities(r.data)).catch(() => {});
    }, []);

    const confirmDelete = () => {
        setConfirmOpen(false);
        api.delete(`/job-offers/${id}`)
            .then(() => { showToast('Job offer deleted'); navigate('/job-offers'); })
            .catch(() => showToast('Failed to delete job offer', 'error'));
    };

    if (loading) return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
            <span className="text-gray-400 text-sm">Loading...</span>
        </div>
    );

    if (!job) return null;

    const cfg        = STATUS_CFG[job.status] || STATUS_CFG.draft;
    const isActive   = job.status === 'active';
    const isDraft    = job.status === 'draft';
    const isArchived = job.status === 'archived';
    const total      = job.applications_count || 0;
    const p          = job.pipeline || {};
    const inProgress = (p.screening||0) + (p.interview||0) + (p.technical||0);
    const pct        = n => total > 0 ? `${(n / total) * 100}%` : '0%';

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <ToastContainer toasts={toasts} />
            <RecruiterNavbar activePage="job-offers" />

            <div className="max-w-4xl mx-auto px-8 py-10">

                {/* Back */}
                <button onClick={() => navigate('/job-offers')}
                    className="flex items-center gap-2 text-xs font-bold tracking-widest text-gray-400 hover:text-black transition-colors uppercase cursor-pointer mb-8">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                    Back to Job List
                </button>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6 text-red-600 text-sm">{error}</div>
                )}

                {/* ── Hero Card ─────────────────────────────────── */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-2">
                    <div className={`h-1 w-full ${cfg.bar}`} />

                    <div className="px-8 pt-7 pb-0">
                        {/* Badges + actions */}
                        <div className="flex items-center justify-between gap-6">
                            <div className="flex items-center flex-wrap gap-2">
                                <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${cfg.badge}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                    {cfg.label}
                                </span>
                                {job.tags?.map(tag => (
                                    <span key={tag.id} className="px-2.5 py-1 rounded-full text-[11px] font-bold border"
                                        style={{ backgroundColor: `${tag.color}18`, color: tag.color, borderColor: `${tag.color}35` }}>
                                        {tag.name}
                                    </span>
                                ))}
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                {isActive && (
                                    <button onClick={() => navigate(`/job-offers/${id}/pipeline`)}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-black transition-colors">
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="3" width="5" height="18" rx="1"/><rect x="10" y="8" width="5" height="13" rx="1"/><rect x="17" y="5" width="5" height="16" rx="1"/>
                                        </svg>
                                        View Pipeline
                                    </button>
                                )}
                                <button onClick={() => navigate(`/job-offers/${id}/edit`)}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:border-gray-400 hover:text-gray-900 transition-colors">
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                    </svg>
                                    Edit
                                </button>
                            </div>
                        </div>

                        {/* Title + meta */}
                        <div className="mt-4">
                            <h1 className="text-[2rem] font-extrabold text-gray-900 leading-tight tracking-tight">{job.title}</h1>
                            <div className="flex items-center gap-2.5 mt-3 text-[11px] text-gray-400 font-medium">
                                <span>Posted {fmt(job.created_at)}</span>
                                <span className="w-1 h-1 rounded-full bg-gray-300" />
                                <span>Updated {fmt(job.updated_at)}</span>
                                {total > 0 && <>
                                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                                    <span className="font-semibold text-gray-600">{total} applicant{total !== 1 ? 's' : ''}</span>
                                </>}
                            </div>
                        </div>

                        {/* Stats strip */}
                        <div className="grid grid-cols-5 gap-px bg-gray-100 mt-7 -mx-8 border-t border-gray-100">
                            {[
                                { label: 'Total',     value: total,          color: 'text-gray-900'   },
                                { label: 'Screening', value: p.screening||0, color: 'text-blue-600'   },
                                { label: 'Interview', value: p.interview||0, color: 'text-violet-600' },
                                { label: 'Technical', value: p.technical||0, color: 'text-amber-600'  },
                                { label: 'Hired',     value: p.hired||0,     color: 'text-emerald-600'},
                            ].map(s => (
                                <div key={s.label} className="bg-white py-5 flex flex-col items-center gap-1">
                                    <span className={`text-xl font-extrabold ${s.color}`}>{s.value}</span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{s.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Tabs ──────────────────────────────────────── */}
                <div className="flex border-b border-gray-200 mb-6 mt-8">
                    {['overview', 'activity'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`px-5 py-3 text-sm font-semibold capitalize border-b-2 -mb-px transition-all ${
                                activeTab === tab ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'
                            }`}>
                            {tab}
                        </button>
                    ))}
                </div>

                {/* ── Overview ──────────────────────────────────── */}
                {activeTab === 'overview' && (
                    <div className="space-y-4">
                        <div className="bg-white rounded-2xl border border-gray-100 p-8">
                            <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-5">Description</p>
                            {job.description
                                ? <div className="prose-job" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(job.description) }} />
                                : <p className="text-sm text-gray-400 italic">No description provided.</p>}
                        </div>

                        {isActive && (
                            <div className="bg-gray-900 rounded-2xl p-6 flex items-center justify-between gap-6">
                                <div>
                                    <p className="text-white font-bold text-sm">Manage Candidates</p>
                                    <p className="text-gray-400 text-xs mt-1">
                                        {total > 0
                                            ? `${inProgress} candidate${inProgress !== 1 ? 's' : ''} actively in pipeline · ${p.hired||0} hired`
                                            : 'No applications yet — share this job to start receiving candidates'}
                                    </p>
                                </div>
                                <button onClick={() => navigate(`/job-offers/${id}/pipeline`)}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-900 rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors shrink-0">
                                    Open Pipeline
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                        <path d="M5 12h14M12 5l7 7-7 7"/>
                                    </svg>
                                </button>
                            </div>
                        )}

                        {isDraft && (
                            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-amber-800">This job is a draft</p>
                                    <p className="text-xs text-amber-600 mt-0.5">Set status to <strong>Active</strong> in the editor to publish.</p>
                                </div>
                                <button onClick={() => navigate(`/job-offers/${id}/edit`)}
                                    className="px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-bold hover:bg-amber-600 transition-colors shrink-0">
                                    Edit Draft
                                </button>
                            </div>
                        )}

                        {isArchived && (
                            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 flex items-center gap-4">
                                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2.5" strokeLinecap="round">
                                        <polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/>
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-orange-800">This job is archived</p>
                                    <p className="text-xs text-orange-600 mt-0.5">No longer accepting applications. Edit to restore it.</p>
                                </div>
                                <button onClick={() => navigate(`/job-offers/${id}/edit`)}
                                    className="px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold hover:bg-orange-600 transition-colors shrink-0">
                                    Edit
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Activity ──────────────────────────────────── */}
                {activeTab === 'activity' && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-7">
                        {activities.length === 0 ? (
                            <div className="py-14 text-center">
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round">
                                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                                    </svg>
                                </div>
                                <p className="text-sm font-semibold text-gray-500">No activity yet</p>
                                <p className="text-xs text-gray-400 mt-1">Candidate actions will appear here.</p>
                            </div>
                        ) : (
                            <div className="relative">
                                <div className="absolute left-4 top-6 bottom-6 w-px bg-gray-100" />
                                <div className="space-y-0">
                                    {activities.map(act => {
                                        const { actor, action } = parseActivity(act.description);
                                        const bg = actor ? avatarColor(actor) : 'bg-gray-400';
                                        return (
                                            <div key={act.id} className="flex items-start gap-4 py-3.5">
                                                <div className={`w-8 h-8 rounded-full ${bg} flex items-center justify-center text-white text-[10px] font-bold shrink-0 z-10 ring-2 ring-white`}>
                                                    {actor ? initials(actor) : '?'}
                                                </div>
                                                <div className="flex-1 min-w-0 pt-1.5">
                                                    <p className="text-[13px] text-gray-700 leading-snug">
                                                        {actor && <span className="font-semibold text-gray-900">{actor} </span>}
                                                        <span>{action}</span>
                                                    </p>
                                                </div>
                                                <div className="text-right shrink-0 pt-1.5">
                                                    <p className="text-[11px] font-semibold text-gray-400">{relTime(act.created_at)}</p>
                                                    <p className="text-[10px] text-gray-300 mt-0.5">
                                                        {new Date(act.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Danger Zone ───────────────────────────────── */}
                <div className="mt-12 rounded-2xl border border-red-100 overflow-hidden">
                    <div className="bg-red-50 px-6 py-3 border-b border-red-100">
                        <h3 className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Danger Zone</h3>
                    </div>
                    <div className="bg-white px-6 py-5 flex items-center justify-between gap-6">
                        <div>
                            <p className="text-sm font-semibold text-gray-900">Delete this job offer</p>
                            <p className="text-xs text-gray-400 mt-0.5">Permanently removes all associated applications. Cannot be undone.</p>
                        </div>
                        <button onClick={() => setConfirmOpen(true)}
                            className="shrink-0 px-5 py-2.5 border border-red-200 text-red-500 rounded-xl text-sm font-semibold hover:bg-red-50 hover:border-red-300 transition-colors">
                            Delete
                        </button>
                    </div>
                </div>
            </div>

            <ConfirmDialog
                open={confirmOpen}
                title="Delete Job Offer"
                message="This will permanently delete the job offer and all associated applications. This cannot be undone."
                onConfirm={confirmDelete}
                onCancel={() => setConfirmOpen(false)}
                confirmLabel="Delete"
                danger
            />
        </div>
    );
}
