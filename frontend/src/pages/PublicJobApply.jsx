import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import PublicNavbar from "../components/PublicNavbar";
import DOMPurify from "dompurify";
import "../components/RichTextEditor.css";

const STORAGE_URL = (
    import.meta.env.VITE_API_URL || "http://localhost:8000/api"
).replace(/\/api$/, "");

function logoSrc(logo) {
    return logo
        ? `${STORAGE_URL}/storage/${logo}`
        : "/default company logo.png";
}

function Field({ label, hint, children }) {
    return (
        <div>
            <div className="flex items-baseline justify-between mb-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.08em]">
                    {label}
                </label>
                {hint && (
                    <span className="text-[11px] text-gray-300">{hint}</span>
                )}
            </div>
            {children}
        </div>
    );
}

const inputCls =
    "w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-[14px] text-[#0a0a0a] placeholder-gray-300 focus:outline-none focus:border-gray-400 focus:ring-4 focus:ring-black/[0.04] transition-all";

export default function PublicJobApply() {
    const { id } = useParams();
    const navigate = useNavigate();
    const resumeRef = useRef(null);
    const formRef = useRef(null);

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [sex, setSex] = useState("");
    const [fileName, setFileName] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        api.get(`/public/jobs/${id}`).then((r) => {
            setJob(r.data);
            setLoading(false);
        });
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!resumeRef.current?.files[0]) {
            setError("Please attach your resume.");
            return;
        }
        setSubmitting(true);
        setError("");
        const fd = new FormData();
        fd.append("first_name", firstName);
        fd.append("last_name", lastName);
        fd.append("email", email);
        fd.append("phone", phone);
        if (sex) fd.append("sex", sex);
        fd.append("resume", resumeRef.current.files[0]);
        api.post(`/public/jobs/${id}/apply`, fd)
            .then(() => setSubmitted(true))
            .catch((err) => {
                setError(
                    err.response?.data?.message ||
                        "Failed to submit. Please try again.",
                );
                setSubmitting(false);
            });
    };

    // ── Success ────────────────────────────────────────────────────────
    if (submitted) {
        return (
            <div className="min-h-screen bg-[#f9fafb] flex flex-col items-center justify-center px-6">
                <div className="w-full max-w-md text-center">
                    <div className="w-16 h-16 rounded-2xl bg-[#0a0a0a] flex items-center justify-center mx-auto mb-8">
                        <svg
                            width="28"
                            height="28"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M20 6L9 17l-5-5" />
                        </svg>
                    </div>
                    <h1 className="text-[28px] font-black text-[#0a0a0a] tracking-tight">
                        Application sent.
                    </h1>
                    <p className="text-[14px] text-gray-400 mt-3 leading-relaxed max-w-sm mx-auto">
                        The team at{" "}
                        <span className="text-gray-600 font-medium">
                            {job?.company?.name}
                        </span>{" "}
                        will review your profile and reach out if there's a fit.
                    </p>
                    <div className="h-px bg-gray-100 my-8" />
                    <button
                        onClick={() => navigate("/jobs")}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#0a0a0a] text-white text-[13px] font-bold rounded-xl hover:bg-gray-800 transition-colors"
                    >
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                        >
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        Back to all jobs
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f9fafb]">
            <PublicNavbar />

            {loading ? (
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
                </div>
            ) : !job ? (
                <div className="max-w-md mx-auto py-32 text-center px-6">
                    <h3 className="text-lg font-bold text-[#0a0a0a]">
                        Position unavailable
                    </h3>
                    <p className="text-sm text-gray-400 mt-2">
                        This job may have been filled or removed.
                    </p>
                    <button
                        onClick={() => navigate("/jobs")}
                        className="mt-6 px-5 py-2.5 bg-[#0a0a0a] text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors"
                    >
                        Browse open roles
                    </button>
                </div>
            ) : (
                <>
                    <div className="max-w-5xl mx-auto px-6 py-12">
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
                            {/* ── Left: Job details ────────────────────── */}
                            <div className="lg:col-span-3">
                                {/* Company identity */}
                                <div className="flex items-center gap-3 mb-6">
                                    <img
                                        src={logoSrc(job.company?.logo)}
                                        alt={job.company?.name}
                                        onError={(e) => {
                                            e.currentTarget.src =
                                                "/default company logo.png";
                                        }}
                                        className="w-12 h-12 rounded-xl object-cover border-2 border-gray-200 shadow-sm"
                                    />
                                    <span className="text-[13px] font-semibold text-gray-400 tracking-wide">
                                        {job.company?.name || "Unknown"}
                                    </span>
                                </div>

                                {/* Title */}
                                <h1 className="text-[38px] font-black text-[#0a0a0a] leading-none tracking-tight">
                                    {job.title}
                                </h1>

                                {/* Meta row */}
                                <div className="flex items-center gap-2 flex-wrap mt-5">
                                    <span className="text-[11px] font-semibold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                                        Posted{" "}
                                        {new Date(
                                            job.created_at,
                                        ).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </span>
                                    {(job.tags || []).map((tag) => (
                                        <span
                                            key={tag.id}
                                            className="text-[11px] font-semibold px-3 py-1 rounded-full"
                                            style={{
                                                backgroundColor: tag.color
                                                    ? `${tag.color}18`
                                                    : "#eff6ff",
                                                color: tag.color || "#2563eb",
                                            }}
                                        >
                                            {tag.name}
                                        </span>
                                    ))}
                                </div>

                                {/* Divider */}
                                <div className="h-px bg-gray-100 my-10" />

                                {/* Description */}
                                <h2 className="text-[13px] font-bold text-gray-400 uppercase tracking-[0.1em] mb-5">
                                    About this role
                                </h2>
                                <div
                                    className="prose-job text-[15px] leading-relaxed text-gray-600"
                                    dangerouslySetInnerHTML={{
                                        __html: DOMPurify.sanitize(
                                            job.description,
                                        ),
                                    }}
                                />
                            </div>

                            {/* ── Right: Sticky form ───────────────────── */}
                            <div className="lg:col-span-2" ref={formRef}>
                                <div className="sticky top-6">
                                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                        {/* Form header */}
                                        <div className="px-7 pt-7 pb-6 border-b border-gray-100">
                                            <h3 className="text-[17px] font-black text-[#0a0a0a] tracking-tight">
                                                Apply for this position
                                            </h3>
                                            <p className="text-[13px] text-gray-400 mt-1">
                                                All fields required unless
                                                marked optional.
                                            </p>
                                        </div>

                                        <form
                                            onSubmit={handleSubmit}
                                            className="px-7 py-6 space-y-5"
                                        >
                                            {error && (
                                                <div className="flex items-start gap-2.5 px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
                                                    <svg
                                                        width="14"
                                                        height="14"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="#dc2626"
                                                        strokeWidth="2.5"
                                                        strokeLinecap="round"
                                                        className="mt-0.5 shrink-0"
                                                    >
                                                        <circle
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                        />
                                                        <line
                                                            x1="12"
                                                            y1="8"
                                                            x2="12"
                                                            y2="12"
                                                        />
                                                        <line
                                                            x1="12"
                                                            y1="16"
                                                            x2="12.01"
                                                            y2="16"
                                                        />
                                                    </svg>
                                                    <p className="text-[12px] text-red-600 font-medium">
                                                        {error}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Name */}
                                            <div className="grid grid-cols-2 gap-3">
                                                <Field label="First name">
                                                    <input
                                                        type="text"
                                                        value={firstName}
                                                        onChange={(e) =>
                                                            setFirstName(
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="Youssef"
                                                        className={inputCls}
                                                        required
                                                    />
                                                </Field>
                                                <Field label="Last name">
                                                    <input
                                                        type="text"
                                                        value={lastName}
                                                        onChange={(e) =>
                                                            setLastName(
                                                                e.target.value,
                                                            )
                                                        }
                                                        placeholder="Boudouar"
                                                        className={inputCls}
                                                        required
                                                    />
                                                </Field>
                                            </div>

                                            {/* Email */}
                                            <Field label="Email address">
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) =>
                                                        setEmail(e.target.value)
                                                    }
                                                    placeholder="youssefboudouar@example.com"
                                                    className={inputCls}
                                                    required
                                                />
                                            </Field>

                                            {/* Phone */}
                                            <Field label="Phone number">
                                                <input
                                                    type="tel"
                                                    value={phone}
                                                    onChange={(e) =>
                                                        setPhone(e.target.value)
                                                    }
                                                    placeholder="+212 600000000"
                                                    className={inputCls}
                                                    required
                                                />
                                            </Field>

                                            {/* Resume */}
                                            <Field
                                                label="Resume"
                                                hint="PDF only"
                                            >
                                                <div
                                                    onClick={() =>
                                                        resumeRef.current?.click()
                                                    }
                                                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                                                        fileName
                                                            ? "border-gray-300 bg-gray-50"
                                                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                                                    }`}
                                                >
                                                    {fileName ? (
                                                        <div className="flex items-center justify-center gap-3">
                                                            <div className="w-9 h-9 rounded-lg bg-[#0a0a0a] flex items-center justify-center shrink-0">
                                                                <svg
                                                                    width="14"
                                                                    height="14"
                                                                    viewBox="0 0 24 24"
                                                                    fill="none"
                                                                    stroke="white"
                                                                    strokeWidth="2.5"
                                                                    strokeLinecap="round"
                                                                >
                                                                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                                                                    <polyline points="14 2 14 8 20 8" />
                                                                </svg>
                                                            </div>
                                                            <div className="text-left min-w-0">
                                                                <p className="text-[13px] font-semibold text-[#0a0a0a] truncate">
                                                                    {fileName}
                                                                </p>
                                                                <p className="text-[11px] text-gray-400">
                                                                    Click to
                                                                    replace
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="w-10 h-10 mx-auto rounded-xl bg-gray-100 flex items-center justify-center mb-3">
                                                                <svg
                                                                    width="17"
                                                                    height="17"
                                                                    viewBox="0 0 24 24"
                                                                    fill="none"
                                                                    stroke="#9ca3af"
                                                                    strokeWidth="2"
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                >
                                                                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                                                                    <polyline points="17 8 12 3 7 8" />
                                                                    <line
                                                                        x1="12"
                                                                        y1="3"
                                                                        x2="12"
                                                                        y2="15"
                                                                    />
                                                                </svg>
                                                            </div>
                                                            <p className="text-[13px] font-semibold text-gray-500">
                                                                Drop your resume
                                                                here
                                                            </p>
                                                            <p className="text-[11px] text-gray-300 mt-1">
                                                                or click to
                                                                browse · PDF
                                                                only
                                                            </p>
                                                        </>
                                                    )}
                                                    <input
                                                        ref={resumeRef}
                                                        type="file"
                                                        accept=".pdf"
                                                        onChange={(e) =>
                                                            setFileName(
                                                                e.target
                                                                    .files[0]
                                                                    ?.name ||
                                                                    "",
                                                            )
                                                        }
                                                        className="hidden"
                                                    />
                                                </div>
                                            </Field>

                                            {/* Submit */}
                                            <button
                                                type="submit"
                                                disabled={submitting}
                                                className="w-full py-3.5 bg-[#0a0a0a] text-white rounded-xl text-[14px] font-bold hover:bg-gray-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                            >
                                                {submitting ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        Submitting…
                                                    </>
                                                ) : (
                                                    <>
                                                        Submit Application
                                                        <svg
                                                            width="14"
                                                            height="14"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2.5"
                                                            strokeLinecap="round"
                                                        >
                                                            <path d="M5 12h14M12 5l7 7-7 7" />
                                                        </svg>
                                                    </>
                                                )}
                                            </button>

                                            <p className="text-center text-[11px] text-gray-300 pb-1">
                                                Your information is kept private
                                                and only shared with{" "}
                                                {job.company?.name}.
                                            </p>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Footer ─────────────────────────────────────── */}
                    <footer className="border-t border-gray-100 mt-4">
                        <div className="max-w-5xl mx-auto px-6 py-7 flex items-center justify-between">
                            <img
                                src="/logo.png"
                                alt="Kandid"
                                className="h-5 w-auto opacity-40"
                            />
                            <p className="text-[12px] text-gray-300">
                                © 2026 Kandid · All rights reserved
                            </p>
                        </div>
                    </footer>
                </>
            )}
        </div>
    );
}
