import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import RecruiterNavbar from '../components/RecruiterNavbar';
import { Skeleton, SkeletonStatCard, SkeletonCard } from '../components/Skeleton';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState('');
    const [activities, setActivities] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/user')
            .then(response => {
                setUserName(response.data.name || '');
            });

        api.get('/dashboard')
            .then(response => {
                setStats(response.data);
                setLoading(false);
            })
            .catch(() => { setLoading(false); });

        api.get('/activities').then(r => setActivities(r.data)).catch(() => {});
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
            <RecruiterNavbar activePage="dashboard" />

            {/* Page Content */}
            <div className="max-w-7xl mx-auto px-8 py-8">

                {loading ? (
                    <div>
                        <div className="grid grid-cols-4 gap-4 mt-8">
                            {[...Array(4)].map((_, i) => <SkeletonStatCard key={i} />)}
                        </div>
                        <div className="mt-8 space-y-3">
                            {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
                        </div>
                    </div>
                ) : !stats ? (
                    <div className="mt-8 bg-white rounded-2xl border border-gray-200 py-16 text-center">
                        <p className="text-sm text-gray-400">Failed to load dashboard. Please refresh.</p>
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

                        {/* Extra stats row */}
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                                    <span className="text-xs uppercase tracking-widest text-gray-400 font-semibold">This Week</span>
                                </div>
                                <div className="text-3xl font-extrabold text-gray-900 mt-2">{stats.this_week ?? 0}</div>
                                {stats.weekly_delta !== undefined && (
                                    <div className={`text-xs mt-1 font-medium ${stats.weekly_delta >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                        {stats.weekly_delta >= 0 ? '+' : ''}{stats.weekly_delta}% vs last week
                                    </div>
                                )}
                            </div>
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-violet-500" />
                                    <span className="text-xs uppercase tracking-widest text-gray-400 font-semibold">Conversion Rate</span>
                                </div>
                                <div className="text-3xl font-extrabold text-gray-900 mt-2">{stats.conversion_rate ?? 0}%</div>
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

                                {/* 14-Day Trend */}
                                {stats?.trend && stats.trend.length > 0 && (
                                    <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-6">
                                        <h2 className="text-sm font-bold text-gray-900 mb-4">Applications — Last 14 Days</h2>
                                        <ResponsiveContainer width="100%" height={120}>
                                            <LineChart data={stats.trend}>
                                                <XAxis
                                                    dataKey="date"
                                                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                                                    tickFormatter={d => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                    interval={3}
                                                />
                                                <YAxis hide allowDecimals={false} />
                                                <Tooltip
                                                    formatter={(v) => [v, 'Applications']}
                                                    labelFormatter={(l) => new Date(l).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                />
                                                <Line type="monotone" dataKey="count" stroke="#0a0a0a" strokeWidth={2} dot={false} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}

                                {/* Activity Feed */}
                                <div className="mt-8">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
                                    </div>
                                    {activities.length === 0 ? (
                                        <div className="bg-white rounded-2xl border border-gray-200 py-10 text-center">
                                            <p className="text-sm text-gray-400">No activity yet. Applications and status changes will appear here.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {activities.map(act => (
                                                <div key={act.id} className="bg-white rounded-xl border border-gray-200 px-4 py-3 flex items-center justify-between">
                                                    <span className="text-sm text-gray-700">{act.description}</span>
                                                    <span className="text-xs text-gray-400 shrink-0 ml-4">
                                                        {new Date(act.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
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
