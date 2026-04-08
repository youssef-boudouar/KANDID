import { useNavigate } from 'react-router-dom';

function PublicNavbar() {
    const navigate = useNavigate();
    return (
        <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
            <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
                <img
                    src="/kandid_logo.png"
                    alt="Kandid"
                    className="h-7 w-auto object-contain cursor-pointer select-none"
                    onClick={() => navigate('/jobs')}
                />
                <div className="hidden md:flex items-center gap-8 text-sm text-gray-500 font-medium">
                    <a href="/jobs" className="text-[#0a0a0a] font-semibold border-b-2 border-[#0a0a0a] pb-0.5">
                        Browse Jobs
                    </a>
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
    );
}

export default PublicNavbar;
