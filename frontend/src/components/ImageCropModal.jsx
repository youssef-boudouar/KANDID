import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';

function getRadianAngle(degrees) {
    return (degrees * Math.PI) / 180;
}

function rotatedBoxSize(width, height, rotation) {
    const rad = getRadianAngle(rotation);
    return {
        width:  Math.abs(Math.cos(rad) * width) + Math.abs(Math.sin(rad) * height),
        height: Math.abs(Math.sin(rad) * width) + Math.abs(Math.cos(rad) * height),
    };
}

async function getCroppedBlob(imageSrc, pixelCrop, rotation = 0) {
    const image = await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = imageSrc;
    });

    const rad = getRadianAngle(rotation);
    const { width: boxWidth, height: boxHeight } = rotatedBoxSize(image.width, image.height, rotation);

    const rotateCanvas = document.createElement('canvas');
    rotateCanvas.width  = boxWidth;
    rotateCanvas.height = boxHeight;
    const rotateCtx = rotateCanvas.getContext('2d');

    rotateCtx.translate(boxWidth / 2, boxHeight / 2);
    rotateCtx.rotate(rad);
    rotateCtx.translate(-image.width / 2, -image.height / 2);
    rotateCtx.drawImage(image, 0, 0);

    const canvas = document.createElement('canvas');
    canvas.width  = pixelCrop.width;
    canvas.height = pixelCrop.height;
    const ctx = canvas.getContext('2d');

    ctx.drawImage(
        rotateCanvas,
        pixelCrop.x, pixelCrop.y,
        pixelCrop.width, pixelCrop.height,
        0, 0,
        pixelCrop.width, pixelCrop.height,
    );

    return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.92));
}

const iconCls = "w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-black transition-colors disabled:opacity-30 disabled:hover:bg-gray-100 disabled:hover:text-gray-500";

function ImageCropModal({ src, onConfirm, onCancel, shape = 'round' }) {
    const [crop, setCrop]               = useState({ x: 0, y: 0 });
    const [zoom, setZoom]               = useState(1);
    const [rotation, setRotation]       = useState(0);
    const [croppedArea, setCroppedArea] = useState(null);
    const [loading, setLoading]         = useState(false);

    const onCropComplete = useCallback((_, pixels) => setCroppedArea(pixels), []);

    const isDefault = crop.x === 0 && crop.y === 0 && zoom === 1 && rotation === 0;

    const reset = () => {
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setRotation(0);
    };

    const handleConfirm = async () => {
        if (!croppedArea) return;
        setLoading(true);
        try {
            const blob = await getCroppedBlob(src, croppedArea, rotation);
            onConfirm(blob);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">

                {/* Header */}
                <div className="px-7 pt-6 pb-5 flex items-center justify-between">
                    <div>
                        <p className="text-[15px] font-bold text-gray-900 tracking-tight">Adjust your photo</p>
                        <p className="text-xs text-gray-400 mt-1">Drag to reposition · Scroll or pinch to zoom</p>
                    </div>
                    <button onClick={onCancel} className={iconCls}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>

                {/* Crop area */}
                <div className="relative mx-7 rounded-2xl overflow-hidden bg-black" style={{ height: 360 }}>
                    <Cropper
                        image={src}
                        crop={crop}
                        zoom={zoom}
                        rotation={rotation}
                        aspect={1}
                        cropShape={shape}
                        showGrid={true}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onRotationChange={setRotation}
                        onCropComplete={onCropComplete}
                        style={{
                            containerStyle: { borderRadius: 0 },
                            cropAreaStyle: { border: '1.5px solid rgba(255,255,255,0.85)', boxShadow: '0 0 0 9999px rgba(0,0,0,0.65)' },
                        }}
                    />
                </div>

                {/* Controls */}
                <div className="px-7 pt-5 pb-1 flex flex-col gap-3.5">
                    {/* Zoom */}
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold w-14 shrink-0">Zoom</span>
                        <button
                            onClick={() => setZoom(z => Math.max(1, +(z - 0.1).toFixed(2)))}
                            disabled={zoom <= 1}
                            className={`${iconCls} text-lg font-medium leading-none`}
                        >−</button>
                        <input
                            type="range"
                            min={1}
                            max={3}
                            step={0.01}
                            value={zoom}
                            onChange={e => setZoom(Number(e.target.value))}
                            className="flex-1 accent-black h-1 rounded-full"
                        />
                        <button
                            onClick={() => setZoom(z => Math.min(3, +(z + 0.1).toFixed(2)))}
                            disabled={zoom >= 3}
                            className={`${iconCls} text-lg font-medium leading-none`}
                        >+</button>
                    </div>

                    {/* Rotation */}
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold w-14 shrink-0">Rotate</span>
                        <button onClick={() => setRotation(r => r - 90)} className={iconCls} title="Rotate left 90°">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M2.5 2v6h6"/><path d="M2.66 15.57a10 10 0 1 0 .57-8.38L2.5 8"/>
                            </svg>
                        </button>
                        <input
                            type="range"
                            min={-180}
                            max={180}
                            step={1}
                            value={rotation}
                            onChange={e => setRotation(Number(e.target.value))}
                            className="flex-1 accent-black h-1 rounded-full"
                        />
                        <button onClick={() => setRotation(r => r + 90)} className={iconCls} title="Rotate right 90°">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21.5 2v6h-6"/><path d="M21.34 15.57a10 10 0 1 1-.57-8.38L21.5 8"/>
                            </svg>
                        </button>
                    </div>

                    <button
                        onClick={reset}
                        disabled={isDefault}
                        className="self-start text-xs font-semibold text-gray-400 hover:text-black disabled:opacity-0 flex items-center gap-1.5 transition-all -mt-0.5 mb-1"
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>
                        </svg>
                        Reset adjustments
                    </button>
                </div>

                {/* Actions */}
                <div className="px-7 py-6 flex items-center gap-3">
                    <button onClick={onCancel} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={loading}
                        className="flex-1 py-2.5 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Uploading…
                            </>
                        ) : 'Apply & Upload'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ImageCropModal;
