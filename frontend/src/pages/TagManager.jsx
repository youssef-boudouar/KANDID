import { useState, useEffect } from 'react';
import api from '../api/axios';

function TagManager({ onClose }) {
    const [tags, setTags] = useState([]);
    const [name, setName] = useState('');
    const [color, setColor] = useState('#6366f1');
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/tags').then(r => setTags(r.data)).catch(() => {});
    }, []);

    const createTag = () => {
        if (!name.trim()) return;
        setError('');
        api.post('/tags', { name: name.trim(), color })
            .then(r => { setTags(prev => [...prev, r.data]); setName(''); })
            .catch(err => setError(err.response?.data?.message || 'Failed to create tag'));
    };

    const deleteTag = (id) => {
        api.delete(`/tags/${id}`)
            .then(() => setTags(prev => prev.filter(t => t.id !== id)))
            .catch(() => {});
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
             onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6 w-full max-w-sm mx-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold text-gray-900">Manage Tags</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-black text-xs font-medium">Close</button>
                </div>
                <div className="flex gap-2 mb-3">
                    <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && createTag()}
                        placeholder="Tag name"
                        maxLength={30}
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                    />
                    <input
                        type="color"
                        value={color}
                        onChange={e => setColor(e.target.value)}
                        className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-0.5 shrink-0"
                    />
                    <button
                        onClick={createTag}
                        className="px-3 py-2 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors shrink-0"
                    >
                        Add
                    </button>
                </div>
                {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {tags.length === 0 && (
                        <p className="text-xs text-gray-400 text-center py-4">No tags yet. Create one above.</p>
                    )}
                    {tags.map(tag => (
                        <div key={tag.id} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: tag.color }} />
                                <span className="text-sm font-medium text-gray-700">{tag.name}</span>
                            </div>
                            <button
                                onClick={() => deleteTag(tag.id)}
                                className="text-xs text-red-400 hover:text-red-600 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default TagManager;
