import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import RecruiterNavbar from '../components/RecruiterNavbar';

function JobDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/job-offers/${id}`).then(response => {
            setJob(response.data);
            setLoading(false);
        }).catch(() => {
            setError('Failed to load job offer');
            setLoading(false);
        });
    }, []);

    const handleDelete = () => {
        if (!window.confirm('Are you sure you want to delete this job offer?')) return; // cancel
        api.delete(`/job-offers/${id}`).then(() => {
            navigate('/job-offers');
        }).catch(() => {
            setError('Failed to delete job offer');
        });
    };

    const getStatusBadge = (status) => {
        if (status === 'active') return 'bg-emerald-500 text-white';
        if (status === 'archived') return 'bg-orange-400 text-white';
        return 'bg-gray-200 text-gray-600';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
                <span className="text-gray-400 text-sm">Loading...</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <RecruiterNavbar activePage="job-offers" />

            {/* Content */}
            <div className="max-w-3xl mx-auto px-8 py-10">

                {/* Back Link */}
                <button
                    onClick={() => navigate('/job-offers')}
                    className="flex items-center gap-2 text-xs font-bold tracking-widest text-gray-400 hover:text-black transition-colors uppercase cursor-pointer mb-6"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                    Back to Job List
                </button>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
                        <span className="text-red-600 text-sm">{error}</span>
                    </div>
                )}

                {job && (
                    <>
                        {/* Header Row */}
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-4xl font-extrabold text-gray-900">{job.title}</h1>
                                <span className={`inline-block mt-3 px-4 py-1.5 rounded-full text-xs font-bold uppercase ${getStatusBadge(job.status)}`}>
                                    {job.status}
                                </span>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => navigate(`/job-offers/${id}/pipeline`)}
                                    className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:from-blue-600 hover:to-purple-700 transition-all flex items-center gap-2"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="3" width="5" height="18" rx="1" />
                                        <rect x="10" y="8" width="5" height="13" rx="1" />
                                        <rect x="17" y="5" width="5" height="16" rx="1" />
                                    </svg>
                                    View Pipeline
                                </button>
                                <button
                                    onClick={() => navigate(`/job-offers/${id}/edit`)}
                                    className="px-5 py-2.5 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="px-5 py-2.5 bg-white border border-red-200 text-red-500 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>

                        {/* Details Card */}
                        <div className="mt-8 bg-white border border-gray-200 rounded-2xl p-8">
                            <label className="text-[11px] uppercase tracking-widest text-gray-400 font-semibold mb-4 block">
                                Description
                            </label>
                            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                                {job.description}
                            </p>
                        </div>

                        {/* Info Grid */}
                        <div className="mt-8 grid grid-cols-3 gap-6">
                            <div className="bg-gray-50 rounded-xl p-5">
                                <label className="text-[11px] uppercase tracking-widest text-gray-400 font-semibold block mb-2">
                                    Applications
                                </label>
                                <span className="text-2xl font-extrabold text-gray-900">{job.applications_count || 0}</span>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-5">
                                <label className="text-[11px] uppercase tracking-widest text-gray-400 font-semibold block mb-2">
                                    Posted
                                </label>
                                <span className="text-sm font-semibold text-gray-700">
                                    {new Date(job.created_at).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </span>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-5">
                                <label className="text-[11px] uppercase tracking-widest text-gray-400 font-semibold block mb-2">
                                    Status
                                </label>
                                <span className="text-sm font-semibold text-gray-700">
                                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                                </span>
                            </div>
                        </div>

                        {/* Danger Zone */}
                        <div className="mt-8 bg-red-50 border border-red-100 rounded-2xl p-6">
                            <h3 className="text-sm font-bold text-red-600">Danger Zone</h3>
                            <p className="text-xs text-red-400 mt-1">Deleting this job offer will remove all associated applications and data.</p>
                            <button
                                onClick={handleDelete}
                                className="mt-4 px-5 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors"
                            >
                                Delete Job Offer
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default JobDetails;
