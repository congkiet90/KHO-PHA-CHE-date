import { Search, X, Loader2, Plus, Calendar, DownloadCloud, ClipboardCheck, Scan, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DateWheelPicker from '../components/DateWheelPicker';

const AIScanner = React.lazy(() => import('../components/AIScanner'));

const ImportExport = ({
    isAdjustment, setIsAdjustment,
    searchTerm, setSearchTerm,
    showSuggestions, setShowSuggestions,
    filteredProducts, selectProduct,
    name, sku, unit,
    quantity, setQuantity,
    expiryDate, setExpiryDate,
    handleSave, isSyncing,
    setSku, setName,
    aiFeedback, setAiFeedback,
    isAiValidating
}) => {
    const [showScanner, setShowScanner] = React.useState(false);

    const handleScanSuccess = (data) => {
        if (data.name) setSearchTerm(data.name);
        if (data.sku) setSku(data.sku);
        if (data.expiryDate) setExpiryDate(data.expiryDate);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
            {showScanner && (
                <React.Suspense fallback={<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>}>
                    <AIScanner
                        onScanSuccess={handleScanSuccess}
                        onClose={() => setShowScanner(false)}
                    />
                </React.Suspense>
            )}
            {/* AI Real-time Feedback Toast */}
            <AnimatePresence>
                {aiFeedback && (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`p-4 rounded-2xl border flex items-start gap-3 shadow-xl ${aiFeedback.type === 'warning'
                            ? 'bg-amber-50 border-amber-200 text-amber-800'
                            : 'bg-indigo-50 border-indigo-200 text-indigo-800'
                            }`}
                    >
                        <div className="mt-0.5">
                            <Sparkles size={18} className={aiFeedback.type === 'warning' ? 'text-amber-500' : 'text-indigo-500'} />
                        </div>
                        <div className="flex-1 text-sm font-medium leading-relaxed">
                            <span className="font-bold block mb-1">
                                {aiFeedback.type === 'warning' ? 'Cảnh báo từ Thủ Kho AI' : 'Ghi chú từ Thủ Kho AI'}
                            </span>
                            {aiFeedback.message}
                        </div>
                        <button onClick={() => setAiFeedback(null)} className="p-1 hover:bg-black/5 rounded-lg transition-colors">
                            <X size={16} className="opacity-40" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* AI Validating Indicator */}
            {isAiValidating && (
                <div className="flex items-center gap-2 text-indigo-500 text-xs font-bold animate-pulse px-2">
                    <Loader2 size={12} className="animate-spin" />
                    Thủ kho đang kiểm tra giao dịch...
                </div>
            )}
            {/* Header */}
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-black tracking-tight">Nhập Xuất Kho</h2>
                <p className="text-stone-500 font-medium">Ghi nhận giao dịch hàng hóa</p>
            </div>

            {/* iOS Segmented Control */}
            <div className="flex bg-stone-200/50 p-1 rounded-2xl relative">
                <button
                    onClick={() => setIsAdjustment(false)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all relative z-10 ${!isAdjustment ? 'text-black' : 'text-stone-500 hover:text-black'}`}
                >
                    <DownloadCloud size={18} /> Nhập Hàng Mới
                </button>
                <button
                    onClick={() => setIsAdjustment(true)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all relative z-10 ${isAdjustment ? 'text-black' : 'text-stone-500 hover:text-black'}`}
                >
                    <ClipboardCheck size={18} /> Kiểm Kê / Điều Chỉnh
                </button>

                {/* Sliding Background */}
                <motion.div
                    layoutId="segmentBg"
                    className="absolute top-1 bottom-1 bg-white rounded-xl shadow-sm border border-black/5"
                    initial={false}
                    animate={{
                        left: !isAdjustment ? '4px' : '50%',
                        width: 'calc(50% - 4px)'
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
            </div>

            {/* Main Form Card */}
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-black/5 space-y-6">

                {/* Search Input */}
                <div className="space-y-2 relative z-20">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-500 ml-1">Tên Sản Phẩm / Mã SKU</label>
                    <div className="relative">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setShowSuggestions(true);
                            }}
                            onFocus={() => setShowSuggestions(true)}
                            placeholder="Gõ tên hoặc mã SKU..."
                            className="w-full pl-12 pr-28 py-4 bg-[#F5F5F7] border border-transparent rounded-2xl text-black placeholder:text-stone-400 focus:bg-white focus:border-stone-300 focus:ring-4 focus:ring-stone-100 transition-all text-lg font-medium outline-none"
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />

                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            {searchTerm && (
                                <button
                                    onClick={() => { setSearchTerm(''); setSku(''); setName(''); }}
                                    className="p-1.5 rounded-full hover:bg-black/5 text-stone-400 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            )}
                            <button
                                onClick={() => setShowScanner(true)}
                                className="flex items-center gap-2 px-3 py-2 bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all text-xs font-bold"
                            >
                                <Scan size={16} />
                                Quét AI
                            </button>
                        </div>

                        {/* Suggestions Dropdown */}
                        {showSuggestions && filteredProducts.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-black/5 overflow-hidden z-50 max-h-60 overflow-y-auto">
                                {filteredProducts.map((p, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => selectProduct(p)}
                                        className="px-5 py-3 hover:bg-stone-50 cursor-pointer border-b border-black/5 last:border-0 flex justify-between items-center group"
                                    >
                                        <div>
                                            <div className="font-semibold text-black">{p.name}</div>
                                            <div className="text-xs text-stone-400 font-mono mt-0.5">{p.sku}</div>
                                        </div>
                                        <div className="text-xs font-bold text-stone-300 bg-stone-100 px-2 py-1 rounded-md">{p.unit}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Selected Item Display */}
                {name && (
                    <div className="bg-stone-50 rounded-2xl p-4 flex items-center justify-between border border-stone-100 animate-in fade-in slide-in-from-top-2">
                        <div className="flex-1 min-w-0 pr-4">
                            <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Đã chọn</div>
                            <div className="text-base font-bold text-black truncate">{name}</div>
                        </div>
                        <div className="bg-white px-3 py-1.5 rounded-lg border border-black/5 shadow-sm">
                            <span className="text-xs font-mono font-bold text-stone-600">{sku}</span>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Quantity Input */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-stone-500 ml-1">Số Lượng</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                className="w-full pl-4 pr-16 py-4 bg-[#F5F5F7] border border-transparent rounded-2xl text-black placeholder:text-stone-400 focus:bg-white focus:border-stone-300 focus:ring-4 focus:ring-stone-100 transition-all text-lg font-medium outline-none text-center"
                                placeholder="0"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-xs uppercase bg-white px-2 py-1 rounded-md shadow-sm border border-black/5">{unit || 'ĐV'}</div>
                        </div>
                    </div>

                    {/* Expiry Date Input */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-stone-500 ml-1">Hạn Sử Dụng</label>
                        <DateWheelPicker
                            value={expiryDate}
                            onChange={setExpiryDate}
                            placeholder="Chọn ngày HSD"
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    onClick={handleSave}
                    disabled={isSyncing}
                    className="w-full py-4 bg-black text-white rounded-2xl text-lg font-bold shadow-xl shadow-black/20 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSyncing ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                    {isAdjustment ? 'Cập Nhật Tồn Kho' : 'Xác Nhận Nhập Kho'}
                </button>
            </div>

            <p className="text-center text-stone-400 text-xs font-medium">
                Kiểm tra kỹ thông tin trước khi lưu.
            </p>
        </div>
    );
};

export default ImportExport;
