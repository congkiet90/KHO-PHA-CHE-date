import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, Loader2, RotateCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { scanProductImage } from '../services/GeminiService';

const AIScanner = ({ onScanSuccess, onClose }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, []);

    const startCamera = async () => {
        setError(null);
        try {
            const s = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            setStream(s);
            if (videoRef.current) {
                videoRef.current.srcObject = s;
            }
        } catch (err) {
            setError("Không thể truy cập Camera. Vui lòng cấp quyền.");
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    };

    const captureAndScan = async () => {
        if (!videoRef.current || isScanning) return;

        setIsScanning(true);
        setError(null);

        const video = videoRef.current;
        const canvas = canvasRef.current;

        // Calculate scaled dimensions (Max 1920px - Full HD for better OCR)
        let width = video.videoWidth;
        let height = video.videoHeight;
        const MAX_SIZE = 1920;

        if (width > height) {
            if (width > MAX_SIZE) {
                height = Math.round(height * (MAX_SIZE / width));
                width = MAX_SIZE;
            }
        } else {
            if (height > MAX_SIZE) {
                width = Math.round(width * (MAX_SIZE / height));
                height = MAX_SIZE;
            }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, width, height);

        // High quality for WiFi (0.9)
        const base64 = canvas.toDataURL('image/jpeg', 0.9);

        const result = await scanProductImage(base64);

        if (result.error) {
            setError(result.error);
            setIsScanning(false);
        } else {
            // Haptic feedback for mobile
            if (navigator.vibrate) navigator.vibrate(50);
            onScanSuccess(result);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black z-[200] flex flex-col items-center justify-center p-4">
            <div className="relative w-full max-w-md aspect-[3/4] bg-stone-900 rounded-[32px] overflow-hidden shadow-2xl border border-white/10">
                {/* Camera Feed */}
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                />

                {/* Scan Overlay Frame */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-64 h-64 border-2 border-indigo-400/50 rounded-3xl relative">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-indigo-500 rounded-tl-xl"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-indigo-500 rounded-tr-xl"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-indigo-500 rounded-bl-xl"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-indigo-500 rounded-br-xl"></div>

                        {/* Scanning Line Animation */}
                        {isScanning && (
                            <motion.div
                                animate={{ top: ['0%', '100%', '0%'] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                className="absolute left-0 right-0 h-0.5 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)]"
                            />
                        )}
                    </div>
                </div>

                {/* Status/Error Messages */}
                <AnimatePresence>
                    {(error || isScanning) && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute bottom-10 left-6 right-6 p-4 rounded-2xl bg-black/60 backdrop-blur-md text-white text-sm font-medium text-center border border-white/10"
                        >
                            {isScanning ? (
                                <div className="flex items-center justify-center gap-2">
                                    <Loader2 className="animate-spin" size={16} />
                                    AI đang phân tích hình ảnh...
                                </div>
                            ) : (
                                <div className="text-rose-400">{error}</div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Controls */}
            <div className="mt-8 flex items-center gap-6">
                <button
                    onClick={startCamera}
                    className="w-12 h-12 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                    <RotateCw size={20} />
                </button>

                <button
                    onClick={captureAndScan}
                    disabled={isScanning}
                    className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl active:scale-90 transition-transform disabled:opacity-50"
                >
                    <div className="w-16 h-16 border-4 border-stone-200 rounded-full flex items-center justify-center">
                        <div className="w-12 h-12 bg-black rounded-full"></div>
                    </div>
                </button>

                <div className="w-12"></div> {/* Spacer */}
            </div>

            <p className="text-white/40 text-xs font-medium mt-6 text-center max-w-[200px]">
                Căn chỉnh nhãn chai hoặc mã vạch vào khung hình để quét
            </p>

            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};

export default AIScanner;
