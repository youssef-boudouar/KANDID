import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

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
    const [newNote, setNewNote] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [userName, setUserName] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        axios
            .get(`http://localhost:8000/api/job-offers/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((response) => {
                setJobTitle(response.data.title);
                setJobStatus(response.data.status);
            });
        axios
            .get(`http://localhost:8000/api/job-offers/${id}/applications`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((response) => {
                setApplications(response.data);
                setLoading(false);
            });

        axios.get('http://localhost:8000/api/user', {
            headers: { Authorization: `Bearer ${token}` }
        }).then(response => {
            setUserName(response.data.name);
            setCompanyName(response.data.company?.name || '');
        });
    }, []);

    const getByStatus = (status) => {  // takes status and return only apps that match the status + search
        const results = [];

        for (let i = 0; i < applications.length; i++) {

            const fullName = applications[i].candidate.first_name + " " + applications[i].candidate.last_name;

            if ( applications[i].status === status && fullName.toLowerCase().includes(searchQuery.toLowerCase()) )
            {
                results.push(applications[i]);
            }
        }

        return results;
    };

    const onDragEnd = (result) => {
        if (!result.destination) return; // dropped out of droppable zones

        if ( // dropped to the same original place
            result.source.droppableId === result.destination.droppableId &&
            result.source.index === result.destination.index
        )
            return;

        const updatedApplications = applications.map((app) => {
            if (app.id === parseInt(result.draggableId)) { // checking which card was dragged
                app.status = result.destination.droppableId;
                app.kanban_order = result.destination.index;
            }
            return app;
        });

        setApplications(updatedApplications);

        // update the column && index of the dragged item on backend
        const token = localStorage.getItem("token");
        axios.put(
            `http://localhost:8000/api/applications/${result.draggableId}/move`,
            {
                status: result.destination.droppableId,
                kanban_order: result.destination.index,
            },
            {
                headers: { Authorization: `Bearer ${token}` },
            },
        );
    };

    const openPanel = (app) => {
        setSelectedApp(app);
        setNewNote(''); // Clear note input
        const token = localStorage.getItem('token');
        axios.get(`http://localhost:8000/api/applications/${app.id}/notes`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(response => {
            setNotes(response.data);
        });
    };

    const closePanel = () => {
        setSelectedApp(null);
        setNotes([]);
        setNewNote('');
    };

    const addNote = () => {
        if (!newNote.trim()) return;
        const token = localStorage.getItem('token');
        axios.post(`http://localhost:8000/api/applications/${selectedApp.id}/notes`, {
            content: newNote,
        }, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(response => {
            setNotes([response.data, ...notes]);
            setNewNote('');
        });
    };

    const deleteNote = (noteId) => {
        const token = localStorage.getItem('token');
        axios.delete(`http://localhost:8000/api/notes/${noteId}`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(() => {
            setNotes(notes.filter(note => note.id !== noteId));
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
            {/* ─── Navbar ─── */}
            <nav className="bg-white border-b border-gray-200 px-8 py-4 shadow-sm">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center gap-10">
                        <span
                            className="text-xl font-extrabold tracking-tight text-gray-900 cursor-pointer"
                            onClick={() => navigate("/job-offers")}
                        >
                            KAND<span className="text-black">ID</span>
                        </span>
                        <div className="flex items-center gap-6 text-sm font-medium text-gray-500">
                            <span className="cursor-pointer hover:text-black transition-colors">
                                Dashboard
                            </span>
                            <span
                                onClick={() => navigate("/job-offers")}
                                className="cursor-pointer hover:text-black transition-colors"
                            >
                                Job Offers
                            </span>
                            <span className="cursor-pointer text-black font-bold border-b-2 border-black pb-1">
                                Pipeline
                            </span>
                            <span className="cursor-pointer hover:text-black transition-colors">
                                Candidates
                            </span>
                            <span className="cursor-pointer hover:text-black transition-colors">
                                Settings
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-700">
                            {companyName}
                        </span>
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
                            {userName.charAt(0).toUpperCase()}
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
                            placeholder="Search candidates..."
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
                        {status.map((s) => (
                            <div
                                key={s}
                                className="flex-1 min-w-0 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col"
                            >
                                {/* Color accent bar */}
                                <div
                                    className={`h-[3px] w-full ${s === "screening" ? "bg-blue-500" : s === "interview" ? "bg-purple-500" : s === "technical" ? "bg-amber-500" : s === "hired" ? "bg-emerald-500" : "bg-red-500"}`}
                                />

                                {/* Column header */}
                                <div className="bg-white px-4 py-3.5 border-b border-gray-100 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`w-2 h-2 rounded-full ${s === "screening" ? "bg-blue-500" : s === "interview" ? "bg-purple-500" : s === "technical" ? "bg-amber-500" : s === "hired" ? "bg-emerald-500" : "bg-red-500"}`}
                                        />
                                        <span className="text-[11px] font-bold uppercase tracking-widest text-gray-600">
                                            {s === "screening" ? "Screening" : s === "interview" ? "Interview" : s === "technical" ? "Technical" : s === "hired" ? "Hired" : "Rejected"}
                                        </span>
                                    </div>
                                    <span className="min-w-[22px] h-[22px] bg-gray-100 text-gray-500 text-[10px] font-bold rounded-full flex items-center justify-center">
                                        {getByStatus(s).length}
                                    </span>
                                </div>

                                {/* Column body */}
                                <Droppable droppableId={s}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={`p-3 flex-1 transition-colors duration-200 ${
                                                snapshot.isDraggingOver
                                                    ? "bg-blue-50/30"
                                                    : "bg-gray-50/50"
                                            }`}
                                        >
                                            {getByStatus(s).length === 0 && (
                                                <div className="flex flex-col items-center justify-center py-12 opacity-40">
                                                    <svg
                                                        width="32"
                                                        height="32"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="1.5"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        className="text-gray-300"
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
                                                    const daysAgo =
                                                        app.created_at
                                                            ? Math.floor(
                                                                  (new Date() -
                                                                      new Date(
                                                                          app.created_at,
                                                                      )) /
                                                                      (1000 *
                                                                          60 *
                                                                          60 *
                                                                          24),
                                                              )
                                                            : null;
                                                    const daysLabel =
                                                        daysAgo === null
                                                            ? "Applied"
                                                            : daysAgo === 0
                                                              ? "Applied today"
                                                              : daysAgo === 1
                                                                ? "Applied yesterday"
                                                                : `Applied ${daysAgo} days ago`;

                                                    return (
                                                        <Draggable
                                                            draggableId={String(
                                                                app.id,
                                                            )}
                                                            index={index}
                                                            key={app.id}
                                                        >
                                                            {(
                                                                provided,
                                                                snapshot,
                                                            ) => (
                                                                <div
                                                                    ref={
                                                                        provided.innerRef
                                                                    }
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                    className={`group bg-white rounded-xl p-4 border border-gray-200 shadow-sm mb-3 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-grab active:cursor-grabbing ${
                                                                        snapshot.isDragging
                                                                            ? "shadow-xl"
                                                                            : ""
                                                                    }`}
                                                                >
                                                                    {/* Card top */}
                                                                    <div className="flex items-start gap-3">
                                                                        <div
                                                                            className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${app.status === "screening" ? "bg-gradient-to-br from-blue-400 to-blue-600" : app.status === "interview" ? "bg-gradient-to-br from-purple-400 to-purple-600" : app.status === "technical" ? "bg-gradient-to-br from-amber-400 to-amber-600" : app.status === "hired" ? "bg-gradient-to-br from-emerald-400 to-emerald-600" : app.status === "rejected" ? "bg-gradient-to-br from-red-400 to-red-600" : s === "screening" ? "bg-gradient-to-br from-blue-400 to-blue-600" : s === "interview" ? "bg-gradient-to-br from-purple-400 to-purple-600" : s === "technical" ? "bg-gradient-to-br from-amber-400 to-amber-600" : s === "hired" ? "bg-gradient-to-br from-emerald-400 to-emerald-600" : "bg-gradient-to-br from-red-400 to-red-600"}`}
                                                                        >
                                                                            {app.candidate?.first_name?.[0]?.toUpperCase() ||
                                                                                ""}
                                                                            {app.candidate?.last_name?.[0]?.toUpperCase() ||
                                                                                ""}
                                                                        </div>
                                                                        <div className="flex flex-col min-w-0 flex-1">
                                                                            <span className="text-sm font-bold text-gray-900 truncate">
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
                                                                            </span>
                                                                            <span className="text-[11px] text-gray-400 truncate">
                                                                                {
                                                                                    app
                                                                                        .candidate
                                                                                        ?.email
                                                                                }
                                                                            </span>
                                                                            {app
                                                                                .candidate
                                                                                ?.phone && (
                                                                                <span className="text-[11px] text-gray-300 flex items-center gap-1 mt-0.5">
                                                                                    <svg
                                                                                        width="12"
                                                                                        height="12"
                                                                                        viewBox="0 0 24 24"
                                                                                        fill="none"
                                                                                        stroke="currentColor"
                                                                                        strokeWidth="2"
                                                                                        strokeLinecap="round"
                                                                                        strokeLinejoin="round"
                                                                                    >
                                                                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                                                                    </svg>
                                                                                    {
                                                                                        app
                                                                                            .candidate
                                                                                            .phone
                                                                                    }
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex items-center gap-1 shrink-0">
                                                                            {app
                                                                                .candidate
                                                                                ?.resume_path && (
                                                                                <span
                                                                                    title="Resume uploaded"
                                                                                    className="text-gray-300 hover:text-gray-500 transition-colors"
                                                                                >
                                                                                    <svg
                                                                                        width="16"
                                                                                        height="16"
                                                                                        viewBox="0 0 24 24"
                                                                                        fill="none"
                                                                                        stroke="currentColor"
                                                                                        strokeWidth="1.5"
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
                                                                                        <polyline points="10 9 9 9 8 9" />
                                                                                    </svg>
                                                                                </span>
                                                                            )}
                                                                            {/* Grip icon */}
                                                                            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300">
                                                                                <svg
                                                                                    width="12"
                                                                                    height="12"
                                                                                    viewBox="0 0 12 12"
                                                                                    fill="currentColor"
                                                                                >
                                                                                    <circle
                                                                                        cx="4"
                                                                                        cy="2"
                                                                                        r="1.2"
                                                                                    />
                                                                                    <circle
                                                                                        cx="8"
                                                                                        cy="2"
                                                                                        r="1.2"
                                                                                    />
                                                                                    <circle
                                                                                        cx="4"
                                                                                        cy="6"
                                                                                        r="1.2"
                                                                                    />
                                                                                    <circle
                                                                                        cx="8"
                                                                                        cy="6"
                                                                                        r="1.2"
                                                                                    />
                                                                                    <circle
                                                                                        cx="4"
                                                                                        cy="10"
                                                                                        r="1.2"
                                                                                    />
                                                                                    <circle
                                                                                        cx="8"
                                                                                        cy="10"
                                                                                        r="1.2"
                                                                                    />
                                                                                </svg>
                                                                            </span>
                                                                        </div>
                                                                    </div>

                                                                    {/* Card bottom */}
                                                                    <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                                                                        <span className="text-[10px] text-gray-300 font-medium inline-flex items-center gap-1">
                                                                            <svg
                                                                                width="10"
                                                                                height="10"
                                                                                viewBox="0 0 24 24"
                                                                                fill="none"
                                                                                stroke="currentColor"
                                                                                strokeWidth="2"
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                            >
                                                                                <rect
                                                                                    x="3"
                                                                                    y="4"
                                                                                    width="18"
                                                                                    height="18"
                                                                                    rx="2"
                                                                                    ry="2"
                                                                                />
                                                                                <line
                                                                                    x1="16"
                                                                                    y1="2"
                                                                                    x2="16"
                                                                                    y2="6"
                                                                                />
                                                                                <line
                                                                                    x1="8"
                                                                                    y1="2"
                                                                                    x2="8"
                                                                                    y2="6"
                                                                                />
                                                                                <line
                                                                                    x1="3"
                                                                                    y1="10"
                                                                                    x2="21"
                                                                                    y2="10"
                                                                                />
                                                                            </svg>
                                                                            {
                                                                                daysLabel
                                                                            }
                                                                        </span>
                                                                        <div className="flex items-center gap-2">
                                                                            <span
                                                                                className={`text-[9px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${app.status === "screening" ? "bg-blue-50 text-blue-600" : app.status === "interview" ? "bg-purple-50 text-purple-600" : app.status === "technical" ? "bg-amber-50 text-amber-600" : app.status === "hired" ? "bg-emerald-50 text-emerald-600" : app.status === "rejected" ? "bg-red-50 text-red-600" : s === "screening" ? "bg-blue-50 text-blue-600" : s === "interview" ? "bg-purple-50 text-purple-600" : s === "technical" ? "bg-amber-50 text-amber-600" : s === "hired" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}
                                                                            >
                                                                                {app.status === "screening" ? "Screening" : app.status === "interview" ? "Interview" : app.status === "technical" ? "Technical" : app.status === "hired" ? "Hired" : app.status === "rejected" ? "Rejected" : s === "screening" ? "Screening" : s === "interview" ? "Interview" : s === "technical" ? "Technical" : s === "hired" ? "Hired" : "Rejected"}
                                                                            </span>
                                                                            <button
                                                                                type="button"
                                                                                onClick={(e) => { e.stopPropagation(); openPanel(app); }}
                                                                                className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                                                                            >
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
                                                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                                                    <circle cx="12" cy="12" r="3" />
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
                        ))}
                    </div>
                </DragDropContext>
            </div>

            {/* ─── Candidate Detail Side Panel ─── */}
            {selectedApp && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div
                        className="fixed inset-0 bg-black/20"
                        onClick={closePanel}
                    />
                    <div className="relative w-full max-w-md bg-white shadow-2xl border-l border-gray-200 overflow-y-auto">
                        {/* Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
                            <span className="text-lg font-bold text-gray-900">
                                Candidate Details
                            </span>
                            <button
                                type="button"
                                onClick={closePanel}
                                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center"
                            >
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        {/* Candidate Info */}
                        <div className="px-6 py-6">
                            <div
                                className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg ${selectedApp.status === "screening" ? "bg-gradient-to-br from-blue-400 to-blue-600" : selectedApp.status === "interview" ? "bg-gradient-to-br from-purple-400 to-purple-600" : selectedApp.status === "technical" ? "bg-gradient-to-br from-amber-400 to-amber-600" : selectedApp.status === "hired" ? "bg-gradient-to-br from-emerald-400 to-emerald-600" : "bg-gradient-to-br from-red-400 to-red-600"}`}
                            >
                                {selectedApp.candidate?.first_name?.[0]?.toUpperCase() || ""}
                                {selectedApp.candidate?.last_name?.[0]?.toUpperCase() || ""}
                            </div>
                            <div className="text-xl font-bold text-gray-900 mt-4">
                                {selectedApp.candidate?.first_name} {selectedApp.candidate?.last_name}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                                {selectedApp.candidate?.email}
                            </div>
                            {selectedApp.candidate?.phone && (
                                <div className="text-sm text-gray-400 mt-0.5">
                                    {selectedApp.candidate.phone}
                                </div>
                            )}
                            <div className="mt-3">
                                <span
                                    className={`text-[9px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${selectedApp.status === "screening" ? "bg-blue-50 text-blue-600" : selectedApp.status === "interview" ? "bg-purple-50 text-purple-600" : selectedApp.status === "technical" ? "bg-amber-50 text-amber-600" : selectedApp.status === "hired" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}
                                >
                                    {selectedApp.status === "screening" ? "Screening" : selectedApp.status === "interview" ? "Interview" : selectedApp.status === "technical" ? "Technical" : selectedApp.status === "hired" ? "Hired" : "Rejected"}
                                </span>
                            </div>
                            {selectedApp.candidate?.resume_path && (
                                <a
                                    href={`http://localhost:8000/storage/${selectedApp.candidate.resume_path}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-3 inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
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
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                        <polyline points="7 10 12 15 17 10" />
                                        <line x1="12" y1="15" x2="12" y2="3" />
                                    </svg>
                                    Download Resume
                                </a>
                            )}
                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-100 mx-6" />

                        {/* Notes Section */}
                        <div className="px-6 py-6">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm font-bold text-gray-900">
                                    Notes
                                </span>
                                <span className="text-xs text-gray-400">
                                    {notes.length} notes
                                </span>
                            </div>

                            {/* Add note */}
                            <div className="mb-6">
                                <textarea
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    placeholder="Add a note about this candidate..."
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 h-20"
                                />
                                <button
                                    type="button"
                                    onClick={addNote}
                                    className="mt-2 px-4 py-2 bg-black text-white text-xs font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                                >
                                    Add Note
                                </button>
                            </div>

                            {/* Notes list */}
                            {notes.length === 0 ? (
                                <div className="text-sm text-gray-300 text-center py-8">
                                    No notes yet. Be the first to add one.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {notes.map((note) => (
                                        <div
                                            key={note.id}
                                            className="group bg-gray-50 rounded-xl p-4"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-semibold text-gray-700">
                                                    {note.user?.name || "Recruiter"}
                                                </span>
                                                <span className="text-[10px] text-gray-300">
                                                    {new Date(note.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-600 mt-2 leading-relaxed">
                                                {note.content}
                                            </div>
                                            <div
                                                onClick={() => deleteNote(note.id)}
                                                className="mt-2 text-[10px] text-red-400 hover:text-red-600 cursor-pointer opacity-0 group-hover:opacity-100"
                                            >
                                                Delete
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default KanbanBoard;
