import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import RecruiterNavbar from '../components/RecruiterNavbar';
import ImageCropModal from '../components/ImageCropModal';
import { useToast, ToastContainer } from '../components/Toast';

const STORAGE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/api$/, '');

function Profile() {
    const photoRef = useRef(null);
    const { toasts, show: showToast } = useToast();

    const [user, setUser]                     = useState(null);
    const [name, setName]                     = useState('');
    const [originalName, setOriginalName]     = useState('');
    const [editingName, setEditingName]       = useState(false);
    const [loading, setLoading]               = useState(true);
    const [saving, setSaving]                 = useState(false);
    const [uploading, setUploading]           = useState(false);
    const [cropSrc, setCropSrc]               = useState(null);

    useEffect(() => {
        api.get('/profile').then(r => {
            setUser(r.data);
            setName(r.data.name || '');
            setOriginalName(r.data.name || '');
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    const photoUrl = user?.profile_photo ? `${STORAGE_URL}/storage/${user.profile_photo}` : null;

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
        form.append('photo', blob, 'photo.jpg');
        api.post('/profile/photo', form)
            .then(r => { setUser(prev => ({ ...prev, profile_photo: r.data.profile_photo })); showToast('Photo updated'); })
            .catch(() => showToast('Failed to upload', 'error'))
            .finally(() => setUploading(false));
    };

    const removePhoto = () => {
        api.delete('/profile/photo').then(() => {
            setUser(prev => ({ ...prev, profile_photo: null }));
            showToast('Photo removed');
        }).catch(() => showToast('Failed to remove', 'error'));
    };

    const saveProfile = () => {
        setSaving(true);
        api.patch('/profile', { name }).then(r => {
            setUser(r.data);
            setOriginalName(r.data.name || '');
            setEditingName(false);
            showToast('Saved');
        }).catch(() => showToast('Failed to save', 'error'))
          .finally(() => setSaving(false));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC]">
                <RecruiterNavbar activePage="" />
                <div className="flex items-center justify-center h-[80vh]">
                    <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <ToastContainer toasts={toasts} />
            <RecruiterNavbar activePage="" />

            <div className="max-w-4xl mx-auto px-8 py-10">
                <div className="mb-7">
                    <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                    <p className="text-sm text-gray-400 mt-1">Manage your personal info and profile photo.</p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 p-12">
                    <div className="flex gap-16">

                        {/* Left — photo */}
                        <div className="flex flex-col items-center gap-5 shrink-0">
                            <div className="relative">
                                <img
                                    src={photoUrl || '/no profile pic.jpg'}
                                    alt=""
                                    className="w-36 h-36 rounded-full object-cover ring-4 ring-gray-100 shadow-xl"
                                />
                                {uploading && (
                                    <div className="absolute inset-0 bg-white/80 rounded-2xl flex items-center justify-center">
                                        <div className="w-5 h-5 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => photoRef.current?.click()}
                                disabled={uploading}
                                className="px-5 py-2.5 bg-black text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 w-full text-center"
                            >
                                {photoUrl ? 'Change photo' : 'Upload photo'}
                            </button>
                            {photoUrl && (
                                <button onClick={removePhoto} className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors">
                                    Remove
                                </button>
                            )}
                            <input ref={photoRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileSelect} className="hidden" />
                        </div>

                        {/* Divider */}
                        <div className="w-px bg-gray-100 shrink-0" />

                        {/* Right — info */}
                        <div className="flex-1 flex flex-col gap-5">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-[11px] uppercase tracking-widest text-gray-400 font-semibold">Full Name</label>
                                    {!editingName && (
                                        <button
                                            onClick={() => setEditingName(true)}
                                            className="text-xs font-semibold text-gray-500 hover:text-black transition-colors flex items-center gap-1"
                                        >
                                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                            </svg>
                                            Edit
                                        </button>
                                    )}
                                </div>
                                {editingName ? (
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        autoFocus
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') saveProfile();
                                            if (e.key === 'Escape') { setName(originalName); setEditingName(false); }
                                        }}
                                        className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition-all"
                                    />
                                ) : (
                                    <p className="px-4 py-3 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-xl">{name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-[11px] uppercase tracking-widest text-gray-400 font-semibold mb-2">Email Address</label>
                                <input type="email" value={user?.email || ''} disabled className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-500 cursor-not-allowed" />
                            </div>

                            <div>
                                <label className="block text-[11px] uppercase tracking-widest text-gray-400 font-semibold mb-2">Company</label>
                                <input type="text" value={user?.company?.name || ''} disabled className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-500 cursor-not-allowed" />
                            </div>

                            {editingName && (
                                <div className="flex items-center justify-end gap-3">
                                    <button
                                        onClick={() => { setName(originalName); setEditingName(false); }}
                                        className="text-sm text-gray-400 hover:text-black font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={saveProfile}
                                        disabled={saving}
                                        className="px-6 py-2.5 bg-black text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
                                    >
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
                    shape="round"
                    onConfirm={handleCropConfirm}
                    onCancel={() => setCropSrc(null)}
                />
            )}
        </div>
    );
}

export default Profile;
