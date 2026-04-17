import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function PublicJobApply() {
    const { id } = useParams();
    const navigate = useNavigate();
    const resumeRef = useRef(null);

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [fileName, setFileName] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        axios.get(`http://localhost:8000/api/public/jobs/${id}`)
            .then((response) => {
                setJob(response.data);
                setLoading(false);
            });
    }, []);

    const handleFileChange = (e) => {
        setFileName(e.target.files[0].name);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const formData = new FormData();

        formData.append('first_name', firstName);
        formData.append('last_name', lastName);
        formData.append('email', email);
        formData.append('phone', phone);
        formData.append('resume', resumeRef.current.files[0]);

        axios.post(`http://localhost:8000/api/public/jobs/${id}/apply`, formData)
        .then(() => {
            setSubmitted(true);
        })
        .catch(()=>{
            setError('Failed to submit application');
        });
    };

    // Success
    if (submitted) {
        return (
            <div className="min-h-screen bg-[#f9fafb] relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-50/40 rounded-full blur-3xl pointer-events-none" />

                <div className="relative max-w-md mx-auto px-6 min-h-screen flex flex-col items-center justify-center text-center">
                    <span className="text-lg font-extrabold tracking-tight text-[#0a0a0a] inline-flex items-center gap-1 mb-12">
                        KANDID
                    </span>

                    <div className="w-20 h-20 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center mb-8">
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 6L9 17l-5-5" />
                        </svg>
                    </div>

                    <h1 className="text-2xl font-bold text-[#0a0a0a]">Application Submitted!</h1>
                    <p className="text-sm text-[#6b7280] mt-3 leading-relaxed max-w-sm">
                        Thank you for applying. The hiring team will review your application and get back to you.
                    </p>

                    <button
                        onClick={() => navigate('/jobs')}
                        className="mt-10 inline-flex items-center gap-2 px-6 py-3 bg-[#0a0a0a] text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors"
                    >
                        Browse More Jobs
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </button>

                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f9fafb]">

            {/* ─── Navbar ─── */}
            <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
                <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
                    <span
                        className="text-lg font-extrabold tracking-tight text-[#0a0a0a] cursor-pointer select-none"
                        onClick={() => navigate('/jobs')}
                    >
                        KANDID
                    </span>

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

            {/* ─── Back link ─── */}
            <div className="max-w-5xl mx-auto px-6 pt-6">
                <button
                    onClick={() => navigate('/jobs')}
                    className="text-sm text-gray-400 hover:text-[#0a0a0a] inline-flex items-center gap-1.5 transition-colors font-medium"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Back to all jobs
                </button>
            </div>

            {/* ─── Main content ─── */}
            <div className="max-w-5xl mx-auto px-6 py-8">

                {/* Loading state */}
                {loading ? (
                    <p>Loading...</p>

                    /* Error state (no job found) */
                ) : !job ? (
                    <div className="max-w-md mx-auto py-20 text-center">
                        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.5" strokeLinecap="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-[#0a0a0a]">Job not found</h3>
                        <p className="text-sm text-[#6b7280] mt-2">{error || 'This position may no longer be available.'}</p>
                        <button
                            onClick={() => navigate('/jobs')}
                            className="mt-6 px-5 py-2.5 bg-[#0a0a0a] text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors"
                        >
                            Browse All Jobs
                        </button>
                    </div>

                    /* Job loaded — show details + form */
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                        {/* ─── Left: Job details ─── */}
                        <div className="lg:col-span-2">

                            {/* Company */}
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-[#0a0a0a] text-white font-bold flex items-center justify-center text-lg">
                                    {(job.company?.name || 'U').charAt(0).toUpperCase()}
                                </div>
                                <span className="text-xs font-semibold text-[#6b7280] uppercase tracking-wider">
                                    {job.company?.name || 'Unknown'}
                                </span>
                            </div>

                            {/* Title */}
                            <h1 className="text-3xl md:text-4xl font-extrabold text-[#0a0a0a] mt-4 leading-[1.1] tracking-tight">
                                {job.title}
                            </h1>

                            {/* Pills */}
                            <div className="flex items-center gap-2 mt-5 flex-wrap">
                                <span className="bg-gray-100 text-gray-600 text-[10px] uppercase tracking-wide font-medium px-2.5 py-0.5 rounded-full">
                                    Posted {new Date(job.created_at).toLocaleDateString()}
                                </span>
                                {job.tags && job.tags.length > 0 && job.tags.map((tag) => (
                                    <span
                                        key={tag.id}
                                        className="text-[10px] uppercase tracking-wide font-semibold px-2.5 py-0.5 rounded-full"
                                        style={{
                                            backgroundColor: tag.color ? `${tag.color}15` : 'rgb(239 246 255)',
                                            color: tag.color || '#2563eb',
                                        }}
                                    >
                                        {tag.name}
                                    </span>
                                ))}
                            </div>

                            {/* Divider */}
                            <div className="border-t border-gray-100 my-8" />

                            {/* About this role */}
                            <h2 className="text-lg font-bold text-[#0a0a0a] mb-4">About this role</h2>
                            <p className="text-sm text-[#6b7280] leading-relaxed whitespace-pre-wrap">
                                {job.description}
                            </p>
                        </div>

                        {/* ─── Right: Sticky apply form ─── */}
                        <div id="apply" className="lg:col-span-1">
                            <div className="sticky top-20">
                                <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-lg shadow-gray-200/50">

                                    <h3 className="text-lg font-bold text-[#0a0a0a] mb-1">
                                        Apply for this position
                                    </h3>
                                    <p className="text-xs text-gray-400 mb-6">Take the first step toward your next career milestone.</p>

                                    {/* Error message */}
                                    {error && (
                                        <div className="mb-4 px-3 py-2 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600">
                                            {error}
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit} className="space-y-4">

                                        {/* Name row */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-semibold text-[#6b7280] mb-1.5 uppercase tracking-wider">First Name</label>
                                                <input
                                                    type="text"
                                                    value={firstName}
                                                    onChange={(e) => setFirstName(e.target.value)}
                                                    placeholder="Jane"
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm placeholder-gray-300 focus:outline-none focus:bg-white focus:border-gray-400 focus:ring-4 focus:ring-gray-100 transition-all"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-[#6b7280] mb-1.5 uppercase tracking-wider">Last Name</label>
                                                <input
                                                    type="text"
                                                    value={lastName}
                                                    onChange={(e) => setLastName(e.target.value)}
                                                    placeholder="Doe"
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm placeholder-gray-300 focus:outline-none focus:bg-white focus:border-gray-400 focus:ring-4 focus:ring-gray-100 transition-all"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <label className="block text-xs font-semibold text-[#6b7280] mb-1.5 uppercase tracking-wider">Email Address</label>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="jane@example.com"
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm placeholder-gray-300 focus:outline-none focus:bg-white focus:border-gray-400 focus:ring-4 focus:ring-gray-100 transition-all"
                                                required
                                            />
                                        </div>

                                        {/* Phone */}
                                        <div>
                                            <label className="block text-xs font-semibold text-[#6b7280] mb-1.5 uppercase tracking-wider">Phone Number</label>
                                            <input
                                                type="tel"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                placeholder="+1 (555) 000-0000"
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm placeholder-gray-300 focus:outline-none focus:bg-white focus:border-gray-400 focus:ring-4 focus:ring-gray-100 transition-all"
                                            />
                                        </div>

                                        {/* Resume upload */}
                                        <div>
                                            <label className="block text-xs font-semibold text-[#6b7280] mb-1.5 uppercase tracking-wider">Resume / CV</label>
                                            <div
                                                onClick={() => resumeRef.current?.click()}
                                                className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-gray-400 hover:bg-gray-50/50 transition-colors cursor-pointer"
                                            >
                                                {fileName ? (
                                                    <>
                                                        <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-50 flex items-center justify-center mb-2">
                                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                                <polyline points="14 2 14 8 20 8" />
                                                            </svg>
                                                        </div>
                                                        <p className="text-xs font-semibold text-[#0a0a0a] truncate">{fileName}</p>
                                                        <p className="text-[10px] text-gray-400 mt-1">Click to replace</p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="w-10 h-10 mx-auto rounded-xl bg-gray-100 flex items-center justify-center mb-2">
                                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                                <polyline points="17 8 12 3 7 8" />
                                                                <line x1="12" y1="3" x2="12" y2="15" />
                                                            </svg>
                                                        </div>
                                                        <p className="text-xs font-medium text-[#6b7280]">
                                                            Drop your PDF here or click to browse
                                                        </p>
                                                        <p className="text-[10px] text-gray-300 mt-1">PDF only, max 2MB</p>
                                                    </>
                                                )}
                                                <input
                                                    ref={resumeRef}
                                                    type="file"
                                                    accept=".pdf"
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                />
                                            </div>
                                        </div>

                                        {/* Submit */}
                                        <button
                                            type="submit"
                                            className="w-full py-4 bg-[#0a0a0a] text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors mt-2 flex items-center justify-center gap-2"
                                        >
                                            Submit Application
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                                <path d="M5 12h14M12 5l7 7-7 7" />
                                            </svg>
                                        </button>


                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ─── Footer ─── */}
            <footer className="border-t border-gray-100 mt-12">
                <p className="text-sm text-gray-300 py-8 text-center font-medium">
                    Powered by <span className="font-extrabold text-gray-400">KANDID</span>
                </p>
            </footer>
        </div>
    );
}

export default PublicJobApply;
