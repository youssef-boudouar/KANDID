import api from "../api/axios";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import RecruiterNavbar from "../components/RecruiterNavbar";
import { useToast, ToastContainer } from "../components/Toast";
import ConfirmDialog from "../components/ConfirmDialog";
import Avatar from "../components/Avatar";

const STORAGE_URL = import.meta.env.VITE_API_URL.replace(/\/api$/, "");

function KanbanBoard() {
    const status = ["screening", "interview", "technical", "hired", "rejected"];

    const [applications, setApplications] = useState([]);
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [jobTitle, setJobTitle] = useState("");
    const [jobStatus, setJobStatus] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedApp, setSelectedApp] = useState(null);
    const [notes, setNotes] = useState([]);
    const [newNote, setNewNote] = useState("");
    const [currentUserId, setCurrentUserId] = useState(null);
    const navigate = useNavigate();
    const { toasts, show: showToast } = useToast();

    useEffect(() => {
        api.get(`/job-offers/${id}`).then((response) => {
            setJobTitle(response.data.title);
            setJobStatus(response.data.status);
        });
        api.get(`/job-offers/${id}/applications`)
            .then((response) => {
                setApplications(response.data);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });

        api.get("/user").then((response) => {
            setCurrentUserId(response.data.id); // check note ownership
        });
    }, []);

    const getByStatus = (status) => {
        // takes status and return only apps that match the status/search
        const results = [];

        for (let i = 0; i < applications.length; i++) {
            const fullName =
                applications[i].candidate.first_name +
                " " +
                applications[i].candidate.last_name;
            const emailMatch = (applications[i].candidate.email || "")
                .toLowerCase()
                .includes(searchQuery.toLowerCase());
            const nameMatch = fullName
                .toLowerCase()
                .includes(searchQuery.toLowerCase());

            if (
                applications[i].status === status &&
                (nameMatch || emailMatch)
            ) {
                results.push(applications[i]);
            }
        }

        return results;
    };

    const onDragEnd = (result) => {
        if (!result.destination) return;
        const { source, destination, draggableId } = result;
        if (
            source.droppableId === destination.droppableId &&
            source.index === destination.index
        )
            return;

        const draggedId = parseInt(draggableId);

        const sourceColApps = applications
            .filter((a) => a.status === source.droppableId)
            .sort((a, b) => a.kanban_order - b.kanban_order);

        const [moved] = sourceColApps.splice(source.index, 1);

        let allUpdates;

        if (source.droppableId === destination.droppableId) {
            // Same column reorder
            sourceColApps.splice(destination.index, 0, moved);
            allUpdates = sourceColApps.map((app, i) => ({
                id: app.id,
                status: app.status,
                kanban_order: i,
            }));
        } else {
            // Cross-column move
            const destColApps = applications
                .filter(
                    (a) =>
                        a.status === destination.droppableId &&
                        a.id !== draggedId,
                )
                .sort((a, b) => a.kanban_order - b.kanban_order);

            const movedWithNewStatus = {
                ...moved,
                status: destination.droppableId,
            };
            destColApps.splice(destination.index, 0, movedWithNewStatus);

            const srcUpdates = sourceColApps.map((app, i) => ({
                id: app.id,
                status: app.status,
                kanban_order: i,
            }));
            const dstUpdates = destColApps.map((app, i) => ({
                id: app.id,
                status: destination.droppableId,
                kanban_order: i,
            }));
            allUpdates = [...srcUpdates, ...dstUpdates];
        }

        // Optimistic UI update
        setApplications((prev) =>
            prev.map((a) => {
                const u = allUpdates.find((u) => u.id === a.id);
                return u
                    ? { ...a, status: u.status, kanban_order: u.kanban_order }
                    : a;
            }),
        );

        // Persist to backend, rollback on error
        api.put("/applications/reorder", { applications: allUpdates }).catch(
            () => {
                api.get(`/job-offers/${id}/applications`).then((r) =>
                    setApplications(r.data),
                );
            },
        );
    };

    const openPanel = (app) => {
        setSelectedApp(app);
        setNewNote(""); // Clear note input
        api.get(`/applications/${app.id}/notes`).then((response) => {
            setNotes(response.data);
        });
    };

    const closePanel = () => {
        setSelectedApp(null);
        setNotes([]);
        setNewNote("");
    };

    const addNote = () => {
        if (!newNote.trim()) return;
        api.post(`/applications/${selectedApp.id}/notes`, { content: newNote })
            .then((response) => {
                setNotes([response.data, ...notes]); //add new note to top of the list
                setNewNote("");
                showToast("Note added successfully");
            })
            .catch(() => {
                showToast("Failed to add note", "error");
            });
    };

    const deleteNote = (noteId) => {
        api.delete(`/notes/${noteId}`)
            .then(() => {
                setNotes(notes.filter((note) => note.id !== noteId));
                showToast("Note deleted successfully");
            })
            .catch(() => {
                showToast("Failed to delete note", "error");
            });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <p className="text-sm text-gray-400">Loading pipeline...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 overflow-hidden">
            <ToastContainer toasts={toasts} />
            <RecruiterNavbar activePage="pipeline" />

            {/* ─── Header ─── */}
            <div className="px-8 pt-6 pb-4">
                <div
                    onClick={() => navigate("/job-offers")}
                    className="text-sm text-gray-400 hover:text-black cursor-pointer mb-3 inline-flex items-center gap-1.5 transition-colors duration-200"
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
                    Back to Job Offers
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <h1 className="text-2xl font-bold text-gray-900">
                            {jobTitle}
                        </h1>
                        {jobStatus && (
                            <span
                                className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ml-3 ${jobStatus === "active" ? "bg-emerald-100 text-emerald-700" : jobStatus === "draft" ? "bg-gray-200 text-gray-600" : jobStatus === "archived" ? "bg-orange-100 text-orange-700" : "bg-gray-200 text-gray-600"}`}
                            >
                                {jobStatus}
                            </span>
                        )}
                        <span className="text-sm text-gray-400 font-medium ml-4">
                            · {applications.length} candidates
                        </span>
                    </div>
                    <div className="relative">
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <path d="M21 21l-4.35-4.35" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search candidates"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-64 pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5"
                        />
                    </div>
                </div>
            </div>

            {/* ─── Kanban Board ─── */}
            <div className="px-8 pb-8">
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="flex gap-4 items-start">
                        {status.map((s) => {
                            const colCfg = {
                                screening: {
                                    label: "Screening",
                                    accent:
                                        s === "screening" ? "bg-blue-500" : "",
                                    icon: (
                                        <svg
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <circle cx="11" cy="11" r="8" />
                                            <path d="M21 21l-4.35-4.35" />
                                        </svg>
                                    ),
                                },
                                interview: {
                                    label: "Interview",
                                    icon: (
                                        <svg
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                        </svg>
                                    ),
                                },
                                technical: {
                                    label: "Technical",
                                    icon: (
                                        <span className="text-[11px] font-bold text-gray-700 font-mono tracking-tight">
                                            &lt;/&gt;
                                        </span>
                                    ),
                                },
                                hired: {
                                    label: "Hired",
                                    icon: (
                                        <svg
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M20 6L9 17l-5-5" />
                                        </svg>
                                    ),
                                },
                                rejected: {
                                    label: "Rejected",
                                    icon: (
                                        <svg
                                            width="14"
                                            height="14"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <circle cx="12" cy="12" r="10" />
                                            <line
                                                x1="15"
                                                y1="9"
                                                x2="9"
                                                y2="15"
                                            />
                                            <line
                                                x1="9"
                                                y1="9"
                                                x2="15"
                                                y2="15"
                                            />
                                        </svg>
                                    ),
                                },
                            };
                            const col = colCfg[s];
                            const accentColor =
                                s === "screening"
                                    ? "bg-blue-500"
                                    : s === "interview"
                                      ? "bg-purple-500"
                                      : s === "technical"
                                        ? "bg-amber-500"
                                        : s === "hired"
                                          ? "bg-emerald-500"
                                          : "bg-red-900";
                            const count = getByStatus(s).length;
                            return (
                                <div
                                    key={s}
                                    className="flex-1 min-w-0 bg-white rounded-2xl overflow-hidden flex flex-col shadow-sm border border-gray-100"
                                >
                                    {/* Top accent line */}
                                    <div
                                        className={`h-0.75 w-full ${accentColor}`}
                                    />

                                    {/* Column header */}
                                    <div className="px-4 pt-4 pb-3.5 flex items-center justify-between border-b border-gray-50">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-7 h-7 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-700 shadow-sm">
                                                {col.icon}
                                            </div>
                                            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-600">
                                                {col.label}
                                            </span>
                                        </div>
                                        <span
                                            className={`min-w-5.5 h-5.5 px-1.5 text-[10px] font-bold rounded-full flex items-center justify-center ${count > 0 ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-400"}`}
                                        >
                                            {count}
                                        </span>
                                    </div>

                                    {/* Column body */}
                                    <Droppable droppableId={s}>
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.droppableProps}
                                                className="p-3 pt-4 flex-1 bg-gray-50"
                                            >
                                                {getByStatus(s).length ===
                                                    0 && (
                                                    <div className="flex flex-col items-center justify-center py-12 opacity-40">
                                                        <svg
                                                            width="28"
                                                            height="28"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="1.5"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            className="text-gray-400"
                                                        >
                                                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                                            <circle
                                                                cx="9"
                                                                cy="7"
                                                                r="4"
                                                            />
                                                            <line
                                                                x1="19"
                                                                y1="8"
                                                                x2="19"
                                                                y2="14"
                                                            />
                                                            <line
                                                                x1="22"
                                                                y1="11"
                                                                x2="16"
                                                                y2="11"
                                                            />
                                                        </svg>
                                                        <p className="text-xs text-gray-400 mt-3">
                                                            No candidates
                                                        </p>
                                                    </div>
                                                )}
                                                {getByStatus(s).map(
                                                    (app, index) => {
                                                        const appliedDate =
                                                            app.created_at
                                                                ? new Date(
                                                                      app.created_at,
                                                                  ).toLocaleDateString(
                                                                      "en-US",
                                                                      {
                                                                          month: "short",
                                                                          day: "numeric",
                                                                          year: "numeric",
                                                                      },
                                                                  )
                                                                : null;

                                                        return (
                                                            <Draggable
                                                                draggableId={String(
                                                                    app.id,
                                                                )}
                                                                index={index}
                                                                key={app.id}
                                                                isDragDisabled={
                                                                    searchQuery.trim() !==
                                                                    ""
                                                                }
                                                            >
                                                                {(provided) => (
                                                                    <div
                                                                        ref={
                                                                            provided.innerRef
                                                                        }
                                                                        {...provided.draggableProps}
                                                                        {...provided.dragHandleProps}
                                                                        className="group bg-white rounded-2xl border border-gray-100 shadow-sm mb-2.5 hover:shadow-lg hover:border-gray-200 hover:-translate-y-0.5 transition-all duration-200 cursor-grab active:cursor-grabbing"
                                                                    >
                                                                        <div className="p-4">
                                                                            {/* Avatar + name row */}
                                                                            <div className="flex items-center gap-3">
                                                                                <Avatar
                                                                                    name={`${app.candidate?.first_name} ${app.candidate?.last_name}`}
                                                                                    size={
                                                                                        40
                                                                                    }
                                                                                    rounded="rounded-xl"
                                                                                    colors={[
                                                                                        s ===
                                                                                        "screening"
                                                                                            ? "#3b82f6"
                                                                                            : s ===
                                                                                                "interview"
                                                                                              ? "#8b5cf6"
                                                                                              : s ===
                                                                                                  "technical"
                                                                                                ? "#f59e0b"
                                                                                                : s ===
                                                                                                    "hired"
                                                                                                  ? "#10b981"
                                                                                                  : "#dc2626",
                                                                                    ]}
                                                                                />

                                                                                {/* Name + email */}
                                                                                <div className="flex-1 min-w-0">
                                                                                    <p className="text-sm font-bold text-gray-900 truncate leading-snug">
                                                                                        {
                                                                                            app
                                                                                                .candidate
                                                                                                ?.first_name
                                                                                        }{" "}
                                                                                        {
                                                                                            app
                                                                                                .candidate
                                                                                                ?.last_name
                                                                                        }
                                                                                    </p>
                                                                                    <p className="text-[11px] text-gray-400 truncate mt-0.5">
                                                                                        {
                                                                                            app
                                                                                                .candidate
                                                                                                ?.email
                                                                                        }
                                                                                    </p>
                                                                                </div>
                                                                            </div>

                                                                            {/* Footer row */}
                                                                            <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-gray-50">
                                                                                {appliedDate && (
                                                                                    <span className="text-[10px] text-gray-400 font-medium">
                                                                                        {
                                                                                            appliedDate
                                                                                        }
                                                                                    </span>
                                                                                )}
                                                                                {/* View button — on hover */}
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={(
                                                                                        e,
                                                                                    ) => {
                                                                                        e.stopPropagation();
                                                                                        openPanel(
                                                                                            app,
                                                                                        );
                                                                                    }}
                                                                                    className="ml-auto flex items-center gap-1 text-[10px] font-semibold text-gray-300 hover:text-gray-700 opacity-0 group-hover:opacity-100 transition-all duration-150"
                                                                                >
                                                                                    View
                                                                                    <svg
                                                                                        width="10"
                                                                                        height="10"
                                                                                        viewBox="0 0 24 24"
                                                                                        fill="none"
                                                                                        stroke="currentColor"
                                                                                        strokeWidth="2.5"
                                                                                        strokeLinecap="round"
                                                                                        strokeLinejoin="round"
                                                                                    >
                                                                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                                                                    </svg>
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </Draggable>
                                                        );
                                                    },
                                                )}
                                                {provided.placeholder}
                                            </div>
                                        )}
                                    </Droppable>
                                </div>
                            );
                        })}
                    </div>
                </DragDropContext>
            </div>

            {/* ─── Candidate Detail Side Panel ─── */}
            {selectedApp &&
                (() => {
                    const sc = {
                        screening: {
                            grad: "from-blue-500 to-blue-700",
                            badge: "bg-blue-100 text-blue-700",
                            dot: "bg-blue-500",
                        },
                        interview: {
                            grad: "from-purple-500 to-purple-700",
                            badge: "bg-purple-100 text-purple-700",
                            dot: "bg-purple-500",
                        },
                        technical: {
                            grad: "from-amber-500 to-amber-700",
                            badge: "bg-amber-100 text-amber-700",
                            dot: "bg-amber-500",
                        },
                        hired: {
                            grad: "from-emerald-500 to-emerald-700",
                            badge: "bg-emerald-100 text-emerald-700",
                            dot: "bg-emerald-500",
                        },
                        rejected: {
                            grad: "from-red-400 to-red-600",
                            badge: "bg-red-100 text-red-600",
                            dot: "bg-red-400",
                        },
                    };
                    const c = sc[selectedApp.status] || sc.screening;
                    const appliedDate = selectedApp.created_at
                        ? new Date(selectedApp.created_at).toLocaleDateString(
                              "en-US",
                              {
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                              },
                          )
                        : null;

                    return (
                        <div className="fixed inset-0 z-50 flex justify-end">
                            <div
                                className="fixed inset-0 bg-black/30"
                                onClick={closePanel}
                            />
                            <div className="relative w-full max-w-lg bg-white shadow-2xl border-l border-gray-100 flex flex-col overflow-hidden">
                                {/* Header */}
                                <div className="shrink-0 bg-white border-b border-gray-100 px-7 py-4 flex items-center justify-between">
                                    <span className="text-sm font-bold text-gray-900 uppercase tracking-widest">
                                        Candidate
                                    </span>
                                    <button
                                        type="button"
                                        onClick={closePanel}
                                        className="w-8 h-8 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
                                    >
                                        <svg
                                            width="15"
                                            height="15"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <line
                                                x1="18"
                                                y1="6"
                                                x2="6"
                                                y2="18"
                                            />
                                            <line
                                                x1="6"
                                                y1="6"
                                                x2="18"
                                                y2="18"
                                            />
                                        </svg>
                                    </button>
                                </div>

                                {/* Scrollable body */}
                                <div className="flex-1 overflow-y-auto">
                                    {/* Profile hero */}
                                    <div className="px-7 pt-10 pb-8 flex flex-col items-center text-center border-b border-gray-100">
                                        <h2 className="text-[28px] font-black text-[#0a0a0a] leading-tight tracking-tight">
                                            {selectedApp.candidate?.first_name}{" "}
                                            {selectedApp.candidate?.last_name}
                                        </h2>
                                        <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
                                            <a
                                                href={`mailto:${selectedApp.candidate?.email}`}
                                                className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-full text-xs text-gray-600 font-medium border border-gray-200 shadow-sm hover:shadow transition-shadow"
                                            >
                                                <svg
                                                    width="11"
                                                    height="11"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
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
                                                {selectedApp.candidate?.email}
                                            </a>
                                            {selectedApp.candidate?.phone && (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white rounded-full text-xs text-gray-600 font-medium border border-gray-200 shadow-sm">
                                                    <svg
                                                        width="11"
                                                        height="11"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                                                    </svg>
                                                    {
                                                        selectedApp.candidate
                                                            .phone
                                                    }
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-center gap-3 mt-5">
                                            <span
                                                className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full ${c.badge}`}
                                            >
                                                <span
                                                    className={`w-1.5 h-1.5 rounded-full ${c.dot}`}
                                                />
                                                {selectedApp.status
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    selectedApp.status.slice(1)}
                                            </span>
                                            {appliedDate && (
                                                <span className="text-[11px] text-gray-400 font-medium">
                                                    Applied {appliedDate}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Resume */}
                                    {selectedApp.candidate?.resume_path && (
                                        <section className="mx-6 mt-6">
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-2 px-1">
                                                Documents
                                            </p>
                                            <a
                                                href={`${STORAGE_URL}/storage/${selectedApp.candidate.resume_path}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-3.5 bg-gray-50 border border-gray-200 hover:border-gray-300 hover:bg-white rounded-2xl transition-all group shadow-sm"
                                            >
                                                <div className="w-10 h-10 bg-white rounded-xl border border-gray-200 flex items-center justify-center shadow-sm shrink-0">
                                                    <svg
                                                        width="15"
                                                        height="15"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="#7c3aed"
                                                        strokeWidth="2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    >
                                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                        <polyline points="14 2 14 8 20 8" />
                                                        <line
                                                            x1="16"
                                                            y1="13"
                                                            x2="8"
                                                            y2="13"
                                                        />
                                                        <line
                                                            x1="16"
                                                            y1="17"
                                                            x2="8"
                                                            y2="17"
                                                        />
                                                    </svg>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        Resume.pdf
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-0.5">
                                                        Click to open
                                                    </p>
                                                </div>
                                                <svg
                                                    width="14"
                                                    height="14"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="#9ca3af"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="group-hover:stroke-gray-500 shrink-0 transition-colors"
                                                >
                                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                    <polyline points="7 10 12 15 17 10" />
                                                    <line
                                                        x1="12"
                                                        y1="15"
                                                        x2="12"
                                                        y2="3"
                                                    />
                                                </svg>
                                            </a>
                                        </section>
                                    )}

                                    {/* Notes */}
                                    <section className="mx-6 mt-6 mb-6">
                                        <div className="flex items-center justify-between mb-3 px-1">
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
                                                Notes
                                            </p>
                                            {notes.length > 0 && (
                                                <span className="text-[10px] font-bold bg-gray-900 text-white px-2 py-0.5 rounded-full">
                                                    {notes.length}
                                                </span>
                                            )}
                                        </div>

                                        {/* Add note */}
                                        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 shadow-sm">
                                            <textarea
                                                value={newNote}
                                                onChange={(e) =>
                                                    setNewNote(e.target.value)
                                                }
                                                onKeyDown={(e) => {
                                                    if (
                                                        e.key === "Enter" &&
                                                        e.metaKey
                                                    )
                                                        addNote();
                                                }}
                                                placeholder="Write a note about this candidate..."
                                                className="w-full bg-transparent text-sm text-gray-700 placeholder-gray-400 resize-none focus:outline-none h-16 leading-relaxed"
                                            />
                                            <div className="flex items-center justify-between pt-3 border-t border-gray-200 mt-1">
                                                <span className="text-[10px] text-gray-400">
                                                    ⌘ + Enter to submit
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={addNote}
                                                    className="px-4 py-1.5 bg-black text-white text-xs font-semibold rounded-xl hover:bg-gray-800 transition-colors"
                                                >
                                                    Add Note
                                                </button>
                                            </div>
                                        </div>

                                        {/* Notes list */}
                                        <div className="mt-3 space-y-2">
                                            {notes.length === 0 ? (
                                                <div className="flex flex-col items-center py-8 text-center bg-white border border-dashed border-gray-200 rounded-2xl">
                                                    <p className="text-sm font-medium text-gray-400">
                                                        No notes yet
                                                    </p>
                                                    <p className="text-xs text-gray-300 mt-0.5">
                                                        Your team's notes will
                                                        appear here
                                                    </p>
                                                </div>
                                            ) : (
                                                notes.map((note) => (
                                                    <div
                                                        key={note.id}
                                                        className="group bg-white border border-gray-100 hover:border-gray-200 rounded-2xl p-4 transition-colors shadow-sm"
                                                    >
                                                        <div className="flex items-center justify-between gap-2 mb-2.5">
                                                            <div className="flex items-center gap-2 min-w-0">
                                                                {note.user
                                                                    ?.profile_photo ? (
                                                                    <img
                                                                        src={`${STORAGE_URL}/storage/${note.user.profile_photo}`}
                                                                        alt=""
                                                                        className="w-6 h-6 rounded-full object-cover shrink-0"
                                                                    />
                                                                ) : (
                                                                    <Avatar
                                                                        name={
                                                                            note
                                                                                .user
                                                                                ?.name ||
                                                                            "Unknown"
                                                                        }
                                                                        size={
                                                                            24
                                                                        }
                                                                        rounded="rounded-full"
                                                                    />
                                                                )}
                                                                <span className="text-xs font-semibold text-gray-800 truncate">
                                                                    {note.user
                                                                        ?.name ||
                                                                        "Former recruiter"}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center gap-2 shrink-0">
                                                                <span className="text-[10px] text-gray-400">
                                                                    {new Date(
                                                                        note.created_at,
                                                                    ).toLocaleDateString(
                                                                        "en-US",
                                                                        {
                                                                            month: "short",
                                                                            day: "numeric",
                                                                            year: "numeric",
                                                                        },
                                                                    )}
                                                                </span>
                                                                {note.user
                                                                    ?.id ===
                                                                    currentUserId && (
                                                                    <button
                                                                        onClick={() =>
                                                                            deleteNote(
                                                                                note.id,
                                                                            )
                                                                        }
                                                                        className="text-[10px] text-red-400 hover:text-red-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-gray-600 leading-relaxed">
                                                            {note.content}
                                                        </p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </div>
                    );
                })()}
        </div>
    );
}

export default KanbanBoard;
