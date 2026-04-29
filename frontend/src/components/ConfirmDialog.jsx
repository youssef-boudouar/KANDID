function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmLabel = 'Confirm', danger = false }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-6 w-full max-w-sm mx-4">
                <h3 className="text-sm font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 mb-6">{message}</p>
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors ${
                            danger ? 'bg-red-500 hover:bg-red-600' : 'bg-black hover:bg-gray-800'
                        }`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmDialog;
