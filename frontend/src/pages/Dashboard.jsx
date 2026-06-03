import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import RecruiterNavbar from '../components/RecruiterNavbar';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip,
    ResponsiveContainer, CartesianGrid,
    PieChart, Pie, Cell,
} from 'recharts';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function greeting() {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
}

function relTime(d) {
    const s = Math.floor((Date.now() - new Date(d)) / 1000);
    if (s < 60)   return 'just now';
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    const days = Math.floor(s / 86400);
    if (days === 1) return 'Yesterday';
    if (days < 7)  return `${days}d ago`;
    return `${Math.floor(days / 7)}w ago`;
}

function dayLabel(dateStr) {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function groupByDay(items) {
    const groups = [];
    let lastLabel = null;
    for (const item of items) {
        const label = dayLabel(item.created_at);
        if (label !== lastLabel) { groups.push({ label, items: [] }); lastLabel = label; }
        groups[groups.length - 1].items.push(item);
    }
    return groups;
}

function parseActivity(desc = '') {
    const verbs = ['added', 'moved', 'updated', 'changed', 'deleted', 'created',
                   'archived', 'hired', 'rejected', 'invited', 'applied'];
    for (const v of verbs) {
        const i = desc.indexOf(` ${v} `);
        if (i > 0) return { actor: desc.slice(0, i), action: desc.slice(i + 1) };
    }
    return { actor: '', action: desc };
}

const AVATAR_COLORS = ['#6366f1','#8b5cf6','#10b981','#f59e0b','#f43f5e','#0ea5e9'];
function avatarColor(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
    return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}
function initials(name = '') {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

// ─── Stage config (ordered) ───────────────────────────────────────────────────

const STAGES = [
    { key: 'screening', label: 'Screening', color: '#6366f1' },
    { key: 'interview',  label: 'Interview',  color: '#8b5cf6' },
    { key: 'technical',  label: 'Technical',  color: '#f59e0b' },
    { key: 'hired',      label: 'Hired',      color: '#10b981' },
];
const REJECTED_COLOR = '#f43f5e';

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Bone({ className }) {
    return <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />;
}
function LoadingSkeleton() {
    return (
        <div className="max-w-7xl mx-auto px-8 py-8 space-y-4">
            <div className="flex justify-between"><div className="space-y-2"><Bone className="h-3 w-28" /><Bone className="h-7 w-52" /></div><Bone className="h-9 w-24 rounded-xl" /></div>
            <div className="grid grid-cols-3 gap-4"><Bone className="col-span-2 h-40" /><Bone className="h-40" /></div>
            <div className="grid grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <Bone key={i} className="h-28" />)}</div>
            <div className="grid grid-cols-3 gap-4"><Bone className="col-span-2 h-64" /><Bone className="h-64" /></div>
            <div className="grid grid-cols-3 gap-4"><Bone className="h-72" /><Bone className="col-span-2 h-72" /></div>
        </div>
    );
}

// ─── Chart tooltip ────────────────────────────────────────────────────────────

function ChartTip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-gray-100 shadow-xl rounded-xl px-4 py-2.5">
            <p className="text-[10px] font-semibold text-gray-400 mb-1">
                {new Date(label).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>
            <p className="text-[15px] font-bold text-gray-900 tabular-nums">
                {payload[0].value} <span className="text-[11px] font-normal text-gray-400">applications</span>
            </p>
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Dashboard() {
    const navigate = useNavigate();
    const [stats, setStats]           = useState(null);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading]       = useState(true);
    const [userName, setUserName]     = useState('');

    useEffect(() => {
        api.get('/user').then(r => setUserName(r.data.name || '')).catch(() => {});
        Promise.all([api.get('/dashboard'), api.get('/activities')])
            .then(([d, a]) => { setStats(d.data); setActivities(a.data || []); })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    return (
        <div className="min-h-screen bg-[#F7F9FC]">
            <RecruiterNavbar activePage="dashboard" />
            {loading     ? <LoadingSkeleton /> :
             !stats      ? <div className="max-w-7xl mx-auto px-8 py-24 text-center text-sm text-gray-400">Failed to load. Please refresh.</div> :
             <Content stats={stats} activities={activities} firstName={userName.split(' ')[0]} today={today} navigate={navigate} />}
        </div>
    );
}

// ─── Content ──────────────────────────────────────────────────────────────────

function Content({ stats, activities, firstName, today, navigate }) {
    const [range, setRange] = useState(14);

    const total    = stats.total_applications || 0;
    const pipeline = (stats.pipeline || []).map(item => {
        const cfg = STAGES.find(s => s.key === item.status) || { label: item.status, color: item.status === 'rejected' ? REJECTED_COLOR : '#9ca3af' };
        return { ...item, label: cfg.label, color: cfg.color, pct: total > 0 ? Math.round((item.count / total) * 100) : 0 };
    });

    const donutData = pipeline.filter(p => p.count > 0);

    const trendSlice    = (stats.trend || []).slice(-range);
    const periodTotal   = trendSlice.reduce((s, d) => s + d.count, 0);
    const topJobs       = stats.top_jobs || [];
    const maxApps       = topJobs[0]?.applications_count || 1;
    const actGroups     = groupByDay(activities.slice(0, 10));
    const sparkData     = (stats.trend || []).slice(-7);
    const sparkHasData  = sparkData.some(d => d.count > 0);
    const inPipeline    = ['screening', 'interview', 'technical'].reduce((s, k) =>
        s + (pipeline.find(p => p.key === k)?.count ?? 0), 0);
    const avgPerJob     = stats.active_jobs > 0 ? Math.round(total / stats.active_jobs) : 0;

    return (
        <div className="max-w-7xl mx-auto px-8 py-8 space-y-4">

            {/* ── Header ── */}
            <div className="flex items-end justify-between pb-1">
                <div>
                    <p className="text-[11px] text-gray-400 font-medium tracking-wide">{today}</p>
                    <h1 className="text-[22px] font-bold text-[#0a0a0a] mt-1 tracking-tight">
                        {greeting()}{firstName ? `, ${firstName}` : ''} 👋
                    </h1>
                </div>
                <button onClick={() => navigate('/job-offers/create')}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0f172a] text-white rounded-xl text-[13px] font-semibold hover:bg-black transition-colors">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                    New Job
                </button>
            </div>

            {/* ── Row 1: Hero + Hired ── */}
            <div className="grid grid-cols-3 gap-4">

                {/* Hero card — white */}
                <div className="col-span-2 bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
                    <div className="p-7 flex items-start justify-between gap-6">
                        <div className="flex-1">
                            <p className="text-[10px] font-semibold text-gray-400 tracking-[0.12em] uppercase">Total Applications</p>
                            <p className="text-[80px] font-black text-[#0a0a0a] tabular-nums tracking-tight leading-none mt-1">{total.toLocaleString()}</p>
                            <div className="flex items-center gap-3 mt-4">
                                {stats.weekly_delta !== undefined && (
                                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg tabular-nums ${
                                        stats.weekly_delta >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                                    }`}>
                                        {stats.weekly_delta >= 0 ? '↑' : '↓'} {Math.abs(stats.weekly_delta)}% vs last week
                                    </span>
                                )}
                                <span className="text-[11px] text-gray-400 font-medium tabular-nums">{stats.this_week ?? 0} this week</span>
                            </div>
                        </div>

                        {/* 7-day bars */}
                        <div className="shrink-0 self-end pb-1">
                            <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider mb-3">Last 7 days</p>
                            <div className="flex items-end gap-1.5" style={{ height: '48px' }}>
                                {sparkData.map((d, i) => {
                                    const maxVal = Math.max(...sparkData.map(x => x.count), 1);
                                    const barH = sparkHasData ? Math.max(4, Math.round((d.count / maxVal) * 40)) : 4;
                                    return (
                                        <div key={i} className="flex flex-col justify-end" style={{ height: '40px', width: '18px' }}>
                                            <div className="w-full rounded-sm transition-all duration-500"
                                                style={{ height: `${barH}px`, backgroundColor: d.count > 0 ? '#6366f1' : '#e5e7eb' }} />
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1.5">
                                {sparkData.map((d, i) => (
                                    <p key={i} className="text-center text-[8px] text-gray-400 font-medium" style={{ width: '18px' }}>
                                        {new Date(d.date).toLocaleDateString('en-US', { weekday: 'narrow' })}
                                    </p>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hired + Conversion split card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <p className="text-[10px] font-semibold text-gray-400 uppercase" style={{ letterSpacing: '0.08em' }}>Hired</p>
                        </div>
                        <p className="text-[44px] font-black text-[#0a0a0a] tabular-nums tracking-tight leading-none">{(stats.hired_count ?? 0).toLocaleString()}</p>
                        <p className="text-[11px] text-gray-400 mt-2">candidates placed</p>
                    </div>
                    <div className="mt-5 pt-5 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] font-semibold text-gray-400 uppercase" style={{ letterSpacing: '0.08em' }}>Conversion rate</p>
                            <p className="text-[13px] font-bold text-[#0a0a0a] tabular-nums">{stats.conversion_rate ?? 0}%</p>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-400 rounded-full transition-all duration-700"
                                style={{ width: `${Math.min(100, stats.conversion_rate ?? 0)}%` }} />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1.5">applications → hired</p>
                    </div>
                </div>
            </div>

            {/* ── Row 2: four metric cards ── */}
            <div className="grid grid-cols-4 gap-4">
                <MetricCard label="Active Jobs"    value={stats.active_jobs ?? 0}                  sub={`of ${stats.total_jobs ?? 0} total postings`} accent="#6366f1" />
                <MetricCard label="In Pipeline"    value={inPipeline}                              sub="candidates being evaluated"                   accent="#8b5cf6" />
                <MetricCard label="Avg per Job"    value={avgPerJob}                               sub="applications per active job"                  accent="#f59e0b" />
                <MetricCard label="This Week"      value={(stats.this_week ?? 0).toLocaleString()} sub="new applications"                             accent="#0ea5e9" delta={stats.weekly_delta} />
            </div>

            {/* ── Row 3: Area chart + Donut ── */}
            <div className="grid grid-cols-3 gap-4">

                {/* Area chart */}
                <div className="col-span-2 bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-6">
                    <div className="flex items-start justify-between mb-5">
                        <div>
                            <h2 className="text-[13px] font-semibold text-[#0a0a0a] tracking-tight">Applications over time</h2>
                            <p className="text-[11px] text-gray-400 mt-0.5 tabular-nums">
                                <span className="text-gray-700 font-semibold">{periodTotal.toLocaleString()}</span> in the last {range} days
                            </p>
                        </div>
                        <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                            {[7, 14, 30].map(r => (
                                <button key={r} onClick={() => setRange(r)}
                                    className={`px-3 py-1 rounded-md text-[12px] font-semibold transition-all ${
                                        range === r ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                    }`}>
                                    {r}D
                                </button>
                            ))}
                        </div>
                    </div>
                    {trendSlice.length > 0 ? (
                        <ResponsiveContainer width="100%" height={190}>
                            <AreaChart data={trendSlice} margin={{ top: 5, right: 4, bottom: 0, left: -20 }}>
                                <defs>
                                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%"   stopColor="#6366f1" stopOpacity={0.15} />
                                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="date" axisLine={false} tickLine={false}
                                    tick={{ fontSize: 10, fill: '#9ca3af', fontWeight: 500 }}
                                    tickFormatter={d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    interval={range === 7 ? 1 : range === 14 ? 3 : 6}
                                />
                                <YAxis allowDecimals={false} axisLine={false} tickLine={false}
                                    tick={{ fontSize: 10, fill: '#9ca3af' }} />
                                <Tooltip content={<ChartTip />} />
                                <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2.5}
                                    fill="url(#areaGrad)" dot={false}
                                    activeDot={{ r: 4, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-48 flex items-center justify-center text-sm text-gray-400">No data yet</div>
                    )}
                </div>

                {/* Donut with center label */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-6 flex flex-col">
                    <h2 className="text-[13px] font-semibold text-[#0a0a0a] tracking-tight">Pipeline</h2>
                    <p className="text-[11px] text-gray-400 mt-0.5 mb-4">{total.toLocaleString()} candidates total</p>
                    {donutData.length > 0 && total > 0 ? (
                        <>
                            <div className="relative">
                                <ResponsiveContainer width="100%" height={150}>
                                    <PieChart>
                                        <Pie data={donutData} dataKey="count" cx="50%" cy="50%"
                                            innerRadius={46} outerRadius={64} strokeWidth={2} stroke="#fff">
                                            {donutData.map((e, i) => <Cell key={i} fill={e.color} />)}
                                        </Pie>
                                        <Tooltip formatter={(v, n) => [`${v}`, n]} />
                                    </PieChart>
                                </ResponsiveContainer>
                                {/* Center label overlay */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="text-center">
                                        <p className="text-xl font-bold text-gray-900 tabular-nums leading-none">{total.toLocaleString()}</p>
                                        <p className="text-[9px] text-gray-400 font-medium mt-1 uppercase tracking-wide">total</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1.5 mt-3">
                                {donutData.map(item => (
                                    <div key={item.status} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                                            <span className="text-[11px] text-gray-600 font-medium">{item.label}</span>
                                        </div>
                                        <div className="flex items-center gap-2 tabular-nums">
                                            <span className="text-[11px] font-semibold text-gray-900">{item.count}</span>
                                            <span className="text-[10px] text-gray-400 w-6 text-right">{item.pct}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-sm text-gray-400">No applications yet</div>
                    )}
                </div>
            </div>

            {/* ── Row 4: Top jobs ── */}
            <div className="grid grid-cols-3 gap-4">

                {/* Top jobs */}
                <div className="col-span-3 bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-[13px] font-semibold text-[#0a0a0a] tracking-tight">Top Performing Jobs</h2>
                        <button onClick={() => navigate('/job-offers')}
                            className="text-[12px] font-medium text-gray-400 hover:text-gray-700 transition-colors">
                            View all →
                        </button>
                    </div>
                    {topJobs.length === 0 ? (
                        <div className="py-10 text-center text-sm text-gray-400">No jobs yet</div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {topJobs.map((job, i) => (
                                <div key={job.id} onClick={() => navigate(`/job-offers/${job.id}`)}
                                    className="flex items-center gap-5 py-4 first:pt-0 last:pb-0 cursor-pointer group hover:bg-gray-50 -mx-6 px-6 transition-colors">
                                    <span className="text-[12px] font-bold text-gray-300 w-4 text-center shrink-0 tabular-nums group-hover:text-gray-400 transition-colors">
                                        {i + 1}
                                    </span>
                                    <div className="flex-1 min-w-0 flex items-center gap-3">
                                        <p className="text-[14px] font-semibold text-[#0a0a0a] truncate">{job.title}</p>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                                            job.status === 'active' ? 'bg-emerald-50 text-emerald-700' :
                                            job.status === 'draft'  ? 'bg-gray-100 text-gray-500' :
                                                                      'bg-orange-50 text-orange-700'
                                        }`}>{job.status}</span>
                                    </div>
                                    <div className="w-40 h-1.5 bg-gray-100 rounded-full overflow-hidden shrink-0">
                                        <div className="h-full bg-indigo-400 rounded-full transition-all duration-700"
                                            style={{ width: `${maxApps > 0 ? Math.round((job.applications_count / maxApps) * 100) : 0}%` }} />
                                    </div>
                                    <div className="w-28 text-right shrink-0">
                                        <span className="text-[15px] font-black text-[#0a0a0a] tabular-nums">{job.applications_count}</span>
                                        <span className="text-[11px] text-gray-400 ml-1.5">applicants</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Row 5: Activity ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-6">
                <h2 className="text-[13px] font-semibold text-[#0a0a0a] tracking-tight mb-5">Recent Activity</h2>
                {activities.length === 0 ? (
                    <div className="py-8 text-center text-sm text-gray-400">No activity recorded yet.</div>
                ) : (
                    <div className="space-y-5">
                        {actGroups.map(group => (
                            <div key={group.label}>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-[10px] font-bold text-gray-400 shrink-0 uppercase" style={{ letterSpacing: '0.1em' }}>
                                        {group.label}
                                    </span>
                                    <div className="flex-1 h-px bg-gray-100" />
                                </div>
                                <div className="space-y-0.5">
                                    {group.items.map(act => {
                                        const { actor, action } = parseActivity(act.description);
                                        const color = actor ? avatarColor(actor) : '#9ca3af';
                                        return (
                                            <div key={act.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors -mx-3">
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                                                    style={{ backgroundColor: color }}>
                                                    {actor ? initials(actor) : '?'}
                                                </div>
                                                <p className="flex-1 text-[13px] leading-snug min-w-0">
                                                    {actor && <span className="font-semibold text-[#0a0a0a]">{actor}</span>}
                                                    {actor && ' '}
                                                    <span className="text-gray-500">{action}</span>
                                                </p>
                                                <span className="text-[11px] text-gray-400 font-medium shrink-0 tabular-nums">{relTime(act.created_at)}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}

// ─── Metric card ─────────────────────────────────────────────────────────────

function MetricCard({ label, value, sub, accent, delta }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.05)] p-6
            hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(0,0,0,0.07)] transition-all duration-200 cursor-default">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: accent }} />
                    <p className="text-[10px] font-semibold text-gray-400 uppercase" style={{ letterSpacing: '0.08em' }}>{label}</p>
                </div>
                {delta !== undefined && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md tabular-nums ${
                        delta >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                    }`}>
                        {delta >= 0 ? '+' : ''}{delta}%
                    </span>
                )}
            </div>
            <p className="text-[42px] font-black text-[#0a0a0a] tabular-nums tracking-tight leading-none">{value}</p>
            {sub && <p className="text-[11px] text-gray-400 mt-2.5">{sub}</p>}
        </div>
    );
}
