import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Eye, EyeOff, Search, Save, CheckCircle, Loader2, Package, Calendar, Hash, AlertCircle, Trash2, X, ToggleLeft, ToggleRight, Sparkles, Scan } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DateWheelPicker from '../components/DateWheelPicker';
import { validateWarehouseAction } from '../services/GeminiService';

const AIScanner = lazy(() => import('../components/AIScanner'));

const BlindCheck = ({
    API_URL, products = [], username, showStatus = () => { },
    aiFeedback, setAiFeedback, isAiValidating, setIsAiValidating, inventorySummary
}) => {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [entries, setEntries] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [hsd, setHsd] = useState('');
    const [quantity, setQuantity] = useState('');
    const [saving, setSaving] = useState(false);
    const [marking, setMarking] = useState(false);
    const [useHsd, setUseHsd] = useState(true); // Toggle for HSD
    const [deleting, setDeleting] = useState(null); // Track which item is being deleted
    const [showScanner, setShowScanner] = useState(false);

    const handleScanSuccess = (data) => {
        if (data.name) setSearchTerm(data.name);
        if (data.expiryDate) setHsd(data.expiryDate);
        if (data.sku) {
            // Try to find matching product by SKU
            const match = products.find(p => String(p.sku) === String(data.sku));
            if (match) {
                setSelectedProduct(match);
                setSearchTerm('');
            }
        }
    };

    // Load session on mount
    useEffect(() => {
        loadSession();
    }, []);

    const loadSession = async () => {
        setLoading(true);
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                body: JSON.stringify({ loai: 'GetBlindSession', username })
            });
            const data = await res.json();
            if (data.status === 'success') {
                setSession(data);
                loadMyEntries(data.sessionId, data.userSlot);
            } else {
                setSession(null);
            }
        } catch (err) {
            showStatus('error', 'Lỗi kết nối server');
        }
        setLoading(false);
    };

    const loadMyEntries = async (sessionId, slot) => {
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                body: JSON.stringify({ loai: 'GetMyBlindEntries', sessionId, slot })
            });
            const data = await res.json();
            setEntries(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSaveEntry = async () => {
        if (!selectedProduct || !quantity) {
            showStatus('error', 'Vui lòng nhập đầy đủ thông tin');
            return;
        }
        if (useHsd && !hsd) {
            showStatus('error', 'Vui lòng chọn HSD');
            return;
        }

        const hsdValue = useHsd ? hsd : 'N/A';

        setSaving(true);
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                body: JSON.stringify({
                    loai: 'SaveBlindCheck',
                    sessionId: session.sessionId,
                    slot: session.userSlot,
                    sku: selectedProduct.sku,
                    name: selectedProduct.name,
                    hsd: hsdValue,
                    quantity: Number(quantity),
                    username
                })
            });
            const data = await res.json();
            if (data.status === 'success') {
                showStatus('success', 'Đã lưu thành công');
                loadMyEntries(session.sessionId, session.userSlot);
                setSelectedProduct(null);
                setHsd('');
                setQuantity('');
                setQuantity('');
                setSearchTerm('');
            }
        } catch (err) {
            showStatus('error', 'Lỗi lưu dữ liệu');
        }
        setSaving(false);
    };

    const handleDeleteEntry = async (entry) => {
        if (!confirm(`Xóa ${entry.name}?`)) return;

        setDeleting(entry.sku + entry.hsd);
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                body: JSON.stringify({
                    loai: 'DeleteBlindEntry',
                    sessionId: session.sessionId,
                    slot: session.userSlot,
                    sku: entry.sku,
                    hsd: entry.hsd
                })
            });
            const data = await res.json();
            if (data.status === 'success') {
                showStatus('success', 'Đã xóa thành công');
                loadMyEntries(session.sessionId, session.userSlot);
            }
        } catch (err) {
            showStatus('error', 'Lỗi xóa dữ liệu');
        }
        setDeleting(null);
    };

    const handleMarkDone = async () => {
        if (entries.length === 0) {
            showStatus('error', 'Chưa có dữ liệu kiểm kho');
            return;
        }

        if (!confirm('Bạn đã kiểm tra xong tất cả sản phẩm? Sau khi xác nhận sẽ không thể sửa đổi.')) {
            return;
        }

        setMarking(true);
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                body: JSON.stringify({
                    loai: 'MarkBlindDone',
                    sessionId: session.sessionId,
                    slot: session.userSlot
                })
            });
            const data = await res.json();
            if (data.status === 'success') {
                showStatus('success', 'Đã đánh dấu hoàn tất');
                loadSession();
            }
        } catch (err) {
            showStatus('error', 'Lỗi đánh dấu hoàn tất');
        }
        setMarking(false);
    };

    const filteredProducts = (products || []).filter(p =>
        p && p.name && p.sku &&
        (String(p.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
            String(p.sku).includes(searchTerm))
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-stone-400" size={32} />
            </div>
        );
    }

    if (!session) {
        return (
            <div className="py-20 text-center bg-white rounded-[24px] border border-dashed border-stone-200">
                <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <EyeOff className="text-stone-300" size={32} />
                </div>
                <p className="text-stone-500 font-medium">Bạn chưa được phân công phiên kiểm kho mù</p>
                <p className="text-xs text-stone-400 mt-1">Liên hệ Admin để tạo phiên kiểm kho mới</p>
            </div>
        );
    }

    const isDone = session.myStatus === 'done';
    const bothDone = session.myStatus === 'done' && session.otherStatus === 'done';

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* AI feedback gỡ bỏ theo yêu cầu */}

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-black flex items-center gap-2 tracking-tight">
                        <EyeOff size={24} className="text-blue-600" /> Kiểm Kho Mù
                    </h2>
                    <p className="text-sm text-stone-500 mt-1 font-medium">
                        Phiên #{session.sessionId.slice(-6)} • Bạn là User {session.userSlot}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${session.myStatus === 'done'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-amber-100 text-amber-700'
                        }`}>
                        Bạn: {session.myStatus === 'done' ? 'Đã xong' : 'Đang kiểm'}
                    </div>
                    <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${session.otherStatus === 'done'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-stone-100 text-stone-600'
                        }`}>
                        User khác: {session.otherStatus === 'done' ? 'Đã xong' : 'Đang kiểm'}
                    </div>
                </div>
            </div>

            {/* Result available */}
            {bothDone && (
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center gap-3">
                        <CheckCircle size={28} />
                        <div>
                            <p className="font-bold text-lg">Cả 2 đã hoàn tất kiểm kho!</p>
                            <p className="text-emerald-100 text-sm">
                                Kết quả: {session.result === 'match' ? 'Khớp 100%' : 'Có sai lệch'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Input Form - only show if not done */}
            {!isDone && (
                <div className="bg-white rounded-[24px] shadow-sm border border-black/5 p-6">
                    <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                        <Package size={20} /> Nhập Kiểm Kho
                    </h3>

                    {showScanner && (
                        <Suspense fallback={<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>}>
                            <AIScanner
                                onScanSuccess={handleScanSuccess}
                                onClose={() => setShowScanner(false)}
                            />
                        </Suspense>
                    )}

                    {/* Product Search */}
                    <div className="space-y-4">
                        <div className="relative flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Tìm sản phẩm theo tên hoặc SKU..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <button
                                onClick={() => setShowScanner(true)}
                                className="px-4 py-3 bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 text-sm font-bold shrink-0"
                            >
                                <Scan size={18} />
                                Quét AI
                            </button>
                        </div>

                        {/* Product dropdown */}
                        {searchTerm && !selectedProduct && (
                            <div className="max-h-48 overflow-y-auto border border-stone-200 rounded-xl divide-y divide-stone-100">
                                {filteredProducts.slice(0, 10).map(p => (
                                    <button
                                        key={String(p.sku)}
                                        onClick={() => {
                                            setSelectedProduct(p);
                                            setSearchTerm('');
                                        }}
                                        className="w-full p-3 text-left hover:bg-stone-50 transition-colors"
                                    >
                                        <p className="font-medium text-black">{p.name}</p>
                                        <p className="text-xs text-stone-400 font-mono">{p.sku} • {p.unit}</p>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Selected product */}
                        {selectedProduct && (
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-blue-900">{selectedProduct.name}</p>
                                        <p className="text-sm text-blue-600 font-mono">{selectedProduct.sku}</p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedProduct(null)}
                                        className="text-blue-400 hover:text-blue-600"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* HSD Toggle & Input */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-stone-600 flex items-center gap-1">
                                    <Calendar size={14} /> Hạn sử dụng
                                </label>
                                <button
                                    onClick={() => setUseHsd(!useHsd)}
                                    className={`flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${useHsd ? 'bg-blue-100 text-blue-700' : 'bg-stone-100 text-stone-500'}`}
                                >
                                    {useHsd ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                                    {useHsd ? 'Bật' : 'Tắt'}
                                </button>
                            </div>
                            {useHsd && (
                                <DateWheelPicker
                                    value={hsd}
                                    onChange={setHsd}
                                    placeholder="Chọn HSD"
                                />
                            )}
                        </div>

                        {/* Quantity */}
                        <div>
                            <label className="block text-sm font-medium text-stone-600 mb-1.5 flex items-center gap-1">
                                <Hash size={14} /> Số lượng
                            </label>
                            <input
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                placeholder="0"
                                min="0"
                                className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-bold text-center"
                            />
                        </div>

                        {/* Save button */}
                        <button
                            onClick={handleSaveEntry}
                            disabled={saving || !selectedProduct}
                            className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                        >
                            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            Lưu
                        </button>
                    </div>
                </div>
            )}

            {/* Entries List */}
            <div className="bg-white rounded-[24px] shadow-sm border border-black/5 overflow-hidden">
                <div className="p-4 border-b border-stone-100 flex justify-between items-center">
                    <h3 className="font-bold text-black">Đã kiểm: {entries.length} mục</h3>
                    {!isDone && entries.length > 0 && (
                        <button
                            onClick={handleMarkDone}
                            disabled={marking}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-2"
                        >
                            {marking ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                            Hoàn tất kiểm kho
                        </button>
                    )}
                </div>

                {entries.length === 0 ? (
                    <div className="py-12 text-center text-stone-400">
                        <AlertCircle size={32} className="mx-auto mb-2 opacity-50" />
                        <p>Chưa có dữ liệu kiểm kho</p>
                    </div>
                ) : (
                    <div className="divide-y divide-stone-100">
                        {entries.map((e, idx) => (
                            <div key={idx} className="p-4 hover:bg-stone-50 transition-colors">
                                <div className="flex justify-between items-center">
                                    <div className="flex-1">
                                        <p className="font-medium text-black">{e.name}</p>
                                        <p className="text-xs text-stone-400 font-mono">{e.sku}</p>
                                    </div>
                                    <div className="text-right mr-4">
                                        <p className="font-bold text-black">{e.quantity}</p>
                                        <p className="text-xs text-stone-400">
                                            {e.hsd === 'N/A' ? 'Không HSD' : `HSD: ${new Date(e.hsd).toLocaleDateString('vi-VN')}`}
                                        </p>
                                    </div>
                                    {!isDone && (
                                        <button
                                            onClick={() => handleDeleteEntry(e)}
                                            disabled={deleting === e.sku + e.hsd}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            {deleting === e.sku + e.hsd ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlindCheck;
