import { useCallback, useEffect, useRef, useState } from 'react';

export function useToast() {
    const [toasts, setToasts] = useState([]);
    const timers = useRef({});

    const show = useCallback((message, type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        timers.current[id] = setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
            delete timers.current[id];
        }, 3500);
    }, []);

    useEffect(() => {
        return () => Object.values(timers.current).forEach(clearTimeout);
    }, []);

    return { toasts, show };
}

export function ToastContainer({ toasts }) {
    return (
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    className={`px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white max-w-xs transition-all duration-300 ${
                        toast.type === 'error' ? 'bg-red-500' : 'bg-gray-900'
                    }`}
                >
                    {toast.message}
                </div>
            ))}
        </div>
    );
}
