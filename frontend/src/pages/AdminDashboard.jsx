import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [companies, setCompanies] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        api.get("/admin/stats")
            .then((response) => {
                setStats(response.data);
            });

        api.get("/admin/companies")
            .then((response) => {
                setCompanies(response.data);
            });

        api.get("/admin/users")
            .then((response) => {
                setUsers(response.data);
                setLoading(false);
            });
    }, []);

    const deleteCompany = (id) => {
        if (!window.confirm("Delete this company and all its data?")) return;
        api
            .delete(`/admin/companies/${id}`)
            .then(() => {
                setCompanies(companies.filter((c) => c.id !== id));
            });
    };

    const deleteUser = (id) => {
        if (!window.confirm("Delete this user?")) return;
        api
            .delete(`/admin/users/${id}`)
            .then(() => {
                setUsers(users.filter((u) => u.id !== id));
            });
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Admin Navigation */}
            <nav className="bg-white border-b border-gray-200 px-8 py-4 shadow-sm">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center">
                        <span className="text-xl font-extrabold tracking-tight text-gray-900">
                            KAND<span className="text-black">ID</span>
                        </span>
                    </div>
                    <button
                        onClick={() => {
                            localStorage.removeItem("token");
                            navigate('/login');
                        }}
                        className="text-xs text-gray-400 hover:text-red-500 transition-colors font-medium"
                    >
                        Logout
                    </button>
                </div>
            </nav>

            {/* Page Content */}
            <div className="max-w-7xl mx-auto px-8 py-8">
                {loading ? (
                    <div className="flex items-center justify-center py-32">
                        <span className="text-gray-400 text-sm">
                            Loading...
                        </span>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Platform Overview
                            </h1>
                            <p className="text-sm text-gray-400 mt-1">
                                Manage all companies and users on KANDID.
                            </p>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-4 gap-4 mt-8">
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                                    <span className="text-xs uppercase tracking-widest text-gray-400 font-semibold">
                                        Companies
                                    </span>
                                </div>
                                <div className="text-3xl font-extrabold text-gray-900 mt-2">
                                    {stats?.total_companies ?? 0}
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                                    <span className="text-xs uppercase tracking-widest text-gray-400 font-semibold">
                                        Users
                                    </span>
                                </div>
                                <div className="text-3xl font-extrabold text-gray-900 mt-2">
                                    {stats?.total_users ?? 0}
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                                    <span className="text-xs uppercase tracking-widest text-gray-400 font-semibold">
                                        Job Offers
                                    </span>
                                </div>
                                <div className="text-3xl font-extrabold text-gray-900 mt-2">
                                    {stats?.total_jobs ?? 0}
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                    <span className="text-xs uppercase tracking-widest text-gray-400 font-semibold">
                                        Applications
                                    </span>
                                </div>
                                <div className="text-3xl font-extrabold text-gray-900 mt-2">
                                    {stats?.total_applications ?? 0}
                                </div>
                            </div>
                        </div>

                        {/* Companies Table */}
                        <div className="mt-10">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">
                                All Companies
                            </h2>
                            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                                <div className="grid grid-cols-5 gap-4 bg-gray-50 text-[11px] uppercase tracking-widest text-gray-400 font-semibold px-6 py-3">
                                    <div>Company Name</div>
                                    <div>Users</div>
                                    <div>Job Offers</div>
                                    <div>Created</div>
                                    <div className="text-right">Actions</div>
                                </div>
                                {companies.map((company) => (
                                    <div
                                        key={company.id}
                                        className="grid grid-cols-5 gap-4 border-t border-gray-100 px-6 py-4 items-center"
                                    >
                                        <div className="text-sm font-semibold text-gray-900">
                                            {company.name}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {company.users_count}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {company.job_offers_count}
                                        </div>
                                        <div className="text-sm text-gray-400">
                                            {new Date(
                                                company.created_at,
                                            ).toLocaleDateString()}
                                        </div>
                                        <div className="text-right">
                                            <span
                                                onClick={() =>
                                                    deleteCompany(company.id)
                                                }
                                                className="text-xs text-red-400 hover:text-red-600 cursor-pointer"
                                            >
                                                Delete
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Users Table */}
                        <div className="mt-10">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">
                                All Users
                            </h2>
                            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                                <div className="grid grid-cols-4 gap-4 bg-gray-50 text-[11px] uppercase tracking-widest text-gray-400 font-semibold px-6 py-3">
                                    <div>Name</div>
                                    <div>Email</div>
                                    <div>Company</div>
                                    <div className="text-right">Actions</div>
                                </div>
                                {users
                                    .filter((user) => user.role !== "admin")
                                    .map((user) => (
                                        <div
                                            key={user.id}
                                            className="grid grid-cols-4 gap-4 border-t border-gray-100 px-6 py-4 items-center"
                                        >
                                            <div className="text-sm font-semibold text-gray-900">
                                                {user.name}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {user.email}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {user.company?.name || "N/A"}
                                            </div>
                                            <div className="text-right">
                                                <span
                                                    onClick={() =>
                                                        deleteUser(user.id)
                                                    }
                                                    className="text-xs text-red-400 hover:text-red-600 cursor-pointer"
                                                >
                                                    Delete
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default AdminDashboard;
