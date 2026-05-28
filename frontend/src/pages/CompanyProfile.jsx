import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import RecruiterNavbar from '../components/RecruiterNavbar';
import ImageCropModal from '../components/ImageCropModal';
import { useToast, ToastContainer } from '../components/Toast';

const STORAGE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/api$/, '');

function CompanyProfile() {
    const logoRef = useRef(null);
    const { toasts, show: showToast } = useToast();

    const [company, setCompany]           = useState(null);
    const [name, setName]                 = useState('');
    const [description, setDescription]   = useState('');
    const [website, setWebsite]           = useState('');
    const [originalName, setOriginalName] = useState('');
    const [originalDesc, setOriginalDesc] = useState('');
    const [originalWeb, setOriginalWeb]   = useState('');
    const [editingName, setEditingName]   = useState(false);
    const [editingDesc, setEditingDesc]   = useState(false);
    const [editingWeb, setEditingWeb]     = useState(false);
    const [loading, setLoading]           = useState(true);
    const [saving, setSaving]             = useState(false);
    const [uploading, setUploading]       = useState(false);
    const [cropSrc, setCropSrc]           = useState(null);

    const [isOwner, setIsOwner] = useState(false);

    useEffect(() => {
        api.get('/company').then(r => {
            setCompany(r.data);
            setIsOwner(r.data.is_owner || false);
            setName(r.data.name || '');
            setDescription(r.data.description || '');
            setWebsite(r.data.website || '');
            setOriginalName(r.data.name || '');
            setOriginalDesc(r.data.description || '');
            setOriginalWeb(r.data.website || '');
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const logoUrl = company?.logo ? `${STORAGE_URL}/storage/${company.logo}` : null;

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        e.target.value = '';
        const reader = new FileReader();
        reader.onload = () => setCropSrc(reader.result);
        reader.readAsDataURL(file);
    };

    const handleCropConfirm = (blob) => {
        setCropSrc(null);
        setUploading(true);
        const form = new FormData();
        form.append('logo', blob, 'logo.jpg');
        api.post('/company/logo', form)
            .then(r => { setCompany(prev => ({ ...prev, logo: r.data.logo })); showToast('Logo updated'); })
            .catch(() => showToast('Failed to upload logo', 'error'))
            .finally(() => setUploading(false));
    };

    const removeLogo = () => {
        api.delete('/company/logo').then(() => {
            setCompany(prev => ({ ...prev, logo: null }));
            showToast('Logo removed');
        }).catch(() => showToast('Failed to remove logo', 'error'));
    };

    const hasChanges = name !== originalName || description !== originalDesc || website !== originalWeb;

    const saveProfile = () => {
        setSaving(true);
        api.patch('/company', { name, description: description || null, website: website || null })
            .then(r => {
                setCompany(r.data);
                setOriginalName(r.data.name || '');
                setOriginalDesc(r.data.description || '');
                setOriginalWeb(r.data.website || '');
                setEditingName(false);
                setEditingDesc(false);
                setEditingWeb(false);
                showToast('Company profile saved');
            })
            .catch(() => showToast('Failed to save', 'error'))
            .finally(() => setSaving(false));
    };

    if (loading) return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <RecruiterNavbar activePage="" />
            <div className="flex items-center justify-center h-[80vh]">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
            </div>
        </div>
    );

    if (!isOwner) return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <RecruiterNavbar activePage="" />
            <div className="flex flex-col items-center justify-center h-[80vh] text-center">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-5">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                </div>
                <h2 className="text-lg font-bold text-gray-900">Access Restricted</h2>
                <p className="text-sm text-gray-400 mt-2 max-w-xs">Only the person who created this company account can manage the company profile.</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <ToastContainer toasts={toasts} />
            <RecruiterNavbar activePage="" />

            <div className="max-w-4xl mx-auto px-8 py-10">
                <div className="mb-7">
                    <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
                    <p className="text-sm text-gray-400 mt-1">Your company info appears on all job listings.</p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-12">
                    <div className="flex gap-16">

                        {/* Left — logo */}
                        <div className="flex flex-col items-center gap-5 shrink-0">
                            <div className="relative">
                                <img
                                    src={logoUrl || '/default company logo.png'}
                                    alt=""
                                    className="w-36 h-36 rounded-2xl object-cover ring-4 ring-gray-100 shadow-xl"
                                />
                                {uploading && (
                                    <div className="absolute inset-0 bg-white/80 rounded-2xl flex items-center justify-center">
                                        <div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => logoRef.current?.click()}
                                disabled={uploading}
                                className="px-5 py-2.5 bg-black text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 w-full text-center"
                            >
                                {logoUrl ? 'Change logo' : 'Upload logo'}
                            </button>
                            {logoUrl && (
                                <button onClick={removeLogo} className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors">
                                    Remove
                                </button>
                            )}
                            <input ref={logoRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileSelect} className="hidden" />
                        </div>

                        {/* Divider */}
                        <div className="w-px bg-gray-100 shrink-0" />

                        {/* Right — info */}
                        <div className="flex-1 flex flex-col gap-5">

                            {/* Company Name */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-[11px] uppercase tracking-widest text-gray-400 font-semibold">Company Name</label>
                                    {!editingName && (
                                        <button onClick={() => setEditingName(true)}
                                            className="text-xs font-semibold text-gray-500 hover:text-black transition-colors flex items-center gap-1">
                                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                            </svg>
                                            Edit
                                        </button>
                                    )}
                                </div>
                                {editingName ? (
                                    <input type="text" value={name} onChange={e => setName(e.target.value)} autoFocus
                                        onKeyDown={e => e.key === 'Escape' && (setName(originalName), setEditingName(false))}
                                        className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition-all" />
                                ) : (
                                    <p className="px-4 py-3 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl">{name}</p>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-[11px] uppercase tracking-widest text-gray-400 font-semibold">About the Company</label>
                                    {!editingDesc && (
                                        <button onClick={() => setEditingDesc(true)}
                                            className="text-xs font-semibold text-gray-500 hover:text-black transition-colors flex items-center gap-1">
                                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                            </svg>
                                            Edit
                                        </button>
                                    )}
                                </div>
                                {editingDesc ? (
                                    <textarea value={description} onChange={e => setDescription(e.target.value)} autoFocus rows={3}
                                        placeholder="A short description of your company..."
                                        onKeyDown={e => e.key === 'Escape' && (setDescription(originalDesc), setEditingDesc(false))}
                                        className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 resize-none transition-all" />
                                ) : (
                                    <p className={`px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl min-h-20 ${description ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                                        {description || 'No description yet'}
                                    </p>
                                )}
                            </div>

                            {/* Website */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-[11px] uppercase tracking-widest text-gray-400 font-semibold">Website</label>
                                    {!editingWeb && (
                                        <button onClick={() => setEditingWeb(true)}
                                            className="text-xs font-semibold text-gray-500 hover:text-black transition-colors flex items-center gap-1">
                                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                            </svg>
                                            Edit
                                        </button>
                                    )}
                                </div>
                                {editingWeb ? (
                                    <input type="url" value={website} onChange={e => setWebsite(e.target.value)} autoFocus
                                        placeholder="https://yourcompany.com"
                                        onKeyDown={e => e.key === 'Escape' && (setWebsite(originalWeb), setEditingWeb(false))}
                                        className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition-all" />
                                ) : (
                                    <p className={`px-4 py-3 text-sm bg-gray-50 border border-gray-200 rounded-xl ${website ? 'text-blue-600' : 'text-gray-400 italic'}`}>
                                        {website || 'No website yet'}
                                    </p>
                                )}
                            </div>

                            {/* Save / Cancel */}
                            {hasChanges && (
                                <div className="flex items-center justify-end gap-3 pt-2">
                                    <button
                                        onClick={() => {
                                            setName(originalName); setDescription(originalDesc); setWebsite(originalWeb);
                                            setEditingName(false); setEditingDesc(false); setEditingWeb(false);
                                        }}
                                        className="text-sm text-gray-400 hover:text-black font-medium transition-colors"
                                    >Cancel</button>
                                    <button onClick={saveProfile} disabled={saving}
                                        className="px-6 py-2.5 bg-black text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50">
                                        {saving ? 'Saving…' : 'Save changes'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {cropSrc && (
                <ImageCropModal
                    src={cropSrc}
                    shape="rect"
                    onConfirm={handleCropConfirm}
                    onCancel={() => setCropSrc(null)}
                />
            )}
        </div>
    );
}

export default CompanyProfile;
