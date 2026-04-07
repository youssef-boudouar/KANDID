import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import RecruiterNavbar from '../components/RecruiterNavbar';

function CreateJob() {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('draft');
    const [error, setError] = useState('');

    const handleSubmit = () => {
        api.post('/job-offers', { title, description, status })
            .then(() => {
                navigate('/job-offers');
            })
            .catch(() => {
                setError('Failed to create job offer. Make sure all fields are filled.');
            });
    };

    const statuses = ['draft', 'active', 'archived'];

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <RecruiterNavbar activePage="job-offers" />

            {/* Content Area */}
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

                {/* Header Row */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-900">Create Job Offer</h1>
                        <p className="text-gray-400 text-sm mt-2">Define the role and start attracting top-tier talent.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {statuses.map((s) => (
                            <button
                                key={s}
                                onClick={() => setStatus(s)}
                                className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-colors cursor-pointer ${
                                    status === s
                                        ? 'bg-amber-400 text-white shadow-sm'
                                        : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'
                                }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Form Card */}
                <div className="mt-10 bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">

                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
                            <span className="text-red-600 text-sm">{error}</span>
                        </div>
                    )}

                    {/* Job Title */}
                    <div>
                        <label className="text-[11px] uppercase tracking-widest text-gray-400 font-semibold mb-3 block">
                            Job Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Senior Principal Designer"
                            className="w-full text-2xl font-light text-gray-900 placeholder-gray-300 bg-transparent border-b border-gray-200 pb-3 outline-none focus:border-gray-900 transition-colors"
                        />
                    </div>

                    {/* Job Description */}
                    <div className="mt-8">
                        <label className="text-[11px] uppercase tracking-widest text-gray-400 font-semibold mb-3 block">
                            Job Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Start typing the core responsibilities and requirements..."
                            className="w-full h-64 p-5 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-700 placeholder-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300"
                        />
                    </div>

                    {/* Footer */}
                    <div className="mt-10 pt-6 border-t border-gray-100 flex items-center justify-between">
                        <button
                            onClick={() => navigate('/job-offers')}
                            className="text-sm font-medium text-gray-400 hover:text-black transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="px-8 py-3 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors"
                        >
                            Create Job Offer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CreateJob;
