import { useState} from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        api.post("/login", {
                email: email,
                password: password,
            })
            .then((response) => {
                login(response.data.token, response.data.user);
                if (response.data.user.role === "admin") {
                    navigate('/admin');
                } else {
                    navigate('/dashboard');
                }
            })
            .catch((err) => {
                setError("Invalid email or password");
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden w-full max-w-lg px-16 py-12">
                <div className="max-w-md w-full mx-auto">
                    <h2 className="text-3xl font-extrabold text-gray-900">
                        Welcome back
                    </h2>
                    <p className="text-sm text-gray-400 mt-2 mb-8">
                        Sign in to your KANDID recruitment dashboard.
                    </p>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
                            <span className="text-red-600 text-sm">
                                {error}
                            </span>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-[11px] uppercase tracking-widest text-gray-400 font-semibold mb-2">
                                Work Email
                            </label>
                            <div className="relative">
                                <svg
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <rect
                                        x="2"
                                        y="4"
                                        width="20"
                                        height="16"
                                        rx="3"
                                    />
                                    <path d="M2 7l10 6 10-6" />
                                </svg>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="john@company.com"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pl-11 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] uppercase tracking-widest text-gray-400 font-semibold mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <svg
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <rect
                                        x="3"
                                        y="11"
                                        width="18"
                                        height="11"
                                        rx="3"
                                    />
                                    <path d="M7 11V7a5 5 0 0110 0v4" />
                                </svg>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    placeholder="Enter your password"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pl-11 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors mt-6 disabled:opacity-50"
                        >
                            {loading ? "Signing in..." : "Sign in"}
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate('/jobs')}
                            className="w-full py-4 bg-white border-2 border-gray-200 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors mt-3"
                        >
                            Browse Jobs as Guest
                        </button>
                    </form>

                    <div className="text-center mt-6">
                        <span className="text-sm text-gray-400">
                            Don&apos;t have an account?{" "}
                        </span>
                        <span
                            onClick={() => navigate('/register')}
                            className="text-sm font-bold text-black hover:underline cursor-pointer"
                        >
                            Register your company
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
