import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function EditJob() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('draft');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [companyName, setCompanyName] = useState('');
    const [userName, setUserName] = useState('');
    const [showInvite, setShowInvite] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        axios.get(`http://localhost:8000/api/job-offers/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(response => {
            setTitle(response.data.title);
            setDescription(response.data.description);
            setStatus(response.data.status);
            setLoading(false);
        }).catch(() => {
            setError('Failed to load job offer');
            setLoading(false);
        });

        axios.get('http://localhost:8000/api/user', {
            headers: { Authorization: `Bearer ${token}` }
        }).then(response => {
            setUserName(response.data.name);
            setCompanyName(response.data.company?.name || '');
        });
    }, []);

    const handleSubmit = () => {
        const token = localStorage.getItem('token');
        axios.put(`http://localhost:8000/api/job-offers/${id}`, {
            title, description, status
        }, { headers: { Authorization: `Bearer ${token}` } })
        .then(() => {
            navigate('/job-offers');
        })
        .catch(() => {
            setError('Failed to update job offer');
        });
    };

    const statuses = ['draft', 'active', 'archived'];

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
                <span className="text-gray-400 text-sm">Loading...</span>
            </div>
        );
    }

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
                            <span className="cursor-pointer text-black font-bold border-b-2 border-black pb-1">Job Offers</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-700">{companyName}</span>
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
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
                                            const token = localStorage.getItem('token');
                                            axios.post('http://localhost:8000/api/team/invite', {
                                                email: inviteEmail,
                                            }, {
                                                headers: { Authorization: `Bearer ${token}` }
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
                                window.location.href = '/login';
                            }}
                            className="text-xs text-gray-400 hover:text-red-500 transition-colors font-medium ml-2"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

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
                        <h1 className="text-4xl font-extrabold text-gray-900">Edit Job Offer</h1>
                        <p className="text-gray-400 text-sm mt-2">Update the details of your job listing.</p>
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
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EditJob;
