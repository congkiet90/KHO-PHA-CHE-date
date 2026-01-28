import React, { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { CheckCircle2, AlertCircle, Loader2, Lock, Sparkles, LayoutGrid, Plus, Box, User, LogOut, Key, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import ImportExport from './pages/ImportExport';
import ManageUsers from './pages/ManageUsers';
import ManageProducts from './pages/ManageProducts';

// --- CONFIG ---
const API_URL = "https://script.google.com/macros/s/AKfycbyAZHsrSMjBJs_KvsrP-5-7YiHtke2BT8usL656VZjc2RNrCow8FGLaMJtjeAxnQ7J8/exec";

// --- STORAGE HELPERS (Safari-safe) ---
// In-memory fallback storage for when localStorage is unavailable
const memoryStorage = {};

// Cache the storage availability check (only run once at startup)
const storageAvailable = (() => {
    try {
        const testKey = '__storage_test__';
        localStorage.setItem(testKey, testKey);
        localStorage.removeItem(testKey);
        return true;
    } catch (e) {
        // Safari Private Mode, storage quota exceeded, or cookies blocked
        console.warn('localStorage not available, using memory fallback');
        return false;
    }
})();

const safeGetItem = (key) => {
    if (storageAvailable) {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            return memoryStorage[key] || null;
        }
    }
    return memoryStorage[key] || null;
};

const safeSetItem = (key, value) => {
    memoryStorage[key] = value;
    if (storageAvailable) {
        try {
            localStorage.setItem(key, value);
        } catch (e) { /* ignore */ }
    }
};

const safeRemoveItem = (key) => {
    delete memoryStorage[key];
    if (storageAvailable) {
        try {
            localStorage.removeItem(key);
        } catch (e) { /* ignore */ }
    }
};

function App() {
    // --- AUTHENTICATION STATE ---
    const [user, setUser] = useState(() => {
        try { return JSON.parse(safeGetItem('currentUser')); } catch { return null; }
    });

    const [view, setView] = useState('dashboard');
    const [showChangePassModal, setShowChangePassModal] = useState(false);

    // --- APP DATA ---
    const [availableProducts, setAvailableProducts] = useState([]); // Dynamic Product List
    const [sku, setSku] = useState('');
    const [name, setName] = useState('');
    const [unit, setUnit] = useState('');
    const [quantity, setQuantity] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [isAdjustment, setIsAdjustment] = useState(false);

    // Logs & Data
    const [logs, setLogs] = useState(() => {
        try {
            const savedLogs = safeGetItem('inventory_logs');
            return savedLogs ? JSON.parse(savedLogs) : [];
        } catch (e) { return []; }
    });

    const [status, setStatus] = useState(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filteredProducts, setFilteredProducts] = useState([]);

    useEffect(() => {
        safeSetItem('inventory_logs', JSON.stringify(logs));
    }, [logs]);

    // Data Fetching: Products
    const fetchProducts = async () => {
        if (!user) return;
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ loai: "GetProducts" })
            });
            const data = await response.json();
            setAvailableProducts(data);
        } catch (err) {
            console.error("Failed to fetch products", err);
        }
    };

    // Data Fetching: Inventory Logs
    const fetchData = async () => {
        if (!user) return; // Only fetch if logged in
        setIsSyncing(true);
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ loai: "GetData" })
            });
            if (!response.ok) throw new Error("Network response was not ok");
            const data = await response.json();

            const mappedLogs = data.map((item, index) => ({
                id: `sync-${index}-${Date.now()}`,
                sku: item.sku, ten_san_pham: item.name, don_vi: "",
                so_luong: item.qty, hsd: item.date, loai: 'KiemKe',
                thoi_gian: new Date().toLocaleString('vi-VN')
            }));

            setLogs(mappedLogs);
            // After data sync, also refresh product list to be sure
            fetchProducts();
            showStatus('success', 'Đã cập nhật dữ liệu mới nhất');
        } catch (err) {
            console.error(err);
            showStatus('error', `Lỗi kết nối: ${err.message}`);
        } finally {
            setIsSyncing(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchData();
            fetchProducts();
            const interval = setInterval(() => {
                fetchData();
            }, 300000);
            return () => clearInterval(interval);
        }
    }, [user]);

    // Helper: Identify Category
    const identifyCategory = (sku, name) => {
        // First try to find in availableProducts
        const product = availableProducts.find(p => String(p.sku) === String(sku));
        if (product && product.category) return product.category;

        // Fallback to name-based logic if product not found (old logs?)
        if (!name) return 'bar';
        const n = name.toLowerCase();
        if (n.includes('cà phê') || n.includes('g7') || n.includes('legend') ||
            n.includes('hộp quà') || n.includes('bình giữ nhiệt') || n.includes('ly sứ') ||
            n.includes('bút') || n.includes('sách') || n.includes('túi vải') || n.includes('phin')) {
            return 'retail';
        }
        return 'bar';
    };

    // Summary calculation
    const inventorySummary = useMemo(() => {
        const summary = {};
        logs.forEach(log => {
            const productSku = String(log.sku).trim();
            let normalizedDate = "Không có Date";
            if (log.hsd && log.hsd !== "Không có Date") {
                normalizedDate = String(log.hsd).trim().substring(0, 10);
            }

            if (!summary[productSku]) {
                // Find unit from product list if possible
                const prod = availableProducts.find(p => String(p.sku) === productSku);

                summary[productSku] = {
                    sku: productSku,
                    name: log.ten_san_pham,
                    unit: prod ? prod.unit : (log.don_vi || ""),
                    category: identifyCategory(productSku, log.ten_san_pham),
                    totalQty: 0, batches: {}
                };
            }

            const qty = Number(log.so_luong) || 0;
            if (log.loai === 'KiemKe') {
                summary[productSku].batches[normalizedDate] = qty;
            } else {
                summary[productSku].batches[normalizedDate] = (summary[productSku].batches[normalizedDate] || 0) + qty;
            }
        });

        // Final map
        return Object.values(summary).map(item => {
            const total = Object.values(item.batches).reduce((sum, val) => sum + val, 0);
            return { ...item, totalQty: total, name: item.name || 'Unknown Item' };
        }).sort((a, b) => (a.name || '').toString().localeCompare((b.name || '').toString()));
    }, [logs, availableProducts]);


    // Handlers
    const showStatus = (type, message) => {
        setStatus({ type, message });
        setTimeout(() => setStatus(null), 3000);
    };

    // --- AUTH ACTIONS ---
    const handleLogin = async (username, password) => {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ loai: "Login", username, password })
        });
        const data = await response.json();

        if (data.status === 'success') {
            const userData = { username: username, role: data.role, name: data.name };
            setUser(userData);
            safeSetItem('currentUser', JSON.stringify(userData));
            showStatus('success', `Chào mừng trở lại, ${data.name}!`);
        } else {
            throw new Error(data.message);
        }
    };

    const handleLogout = () => {
        if (confirm("Bạn có chắc muốn đăng xuất?")) {
            setUser(null);
            safeRemoveItem('currentUser');
            setLogs([]); // Clear sensitive data
            setView('dashboard');
        }
    };

    // --- CHANGE PASSWORD ---
    const [cpOld, setCpOld] = useState('');
    const [cpNew, setCpNew] = useState('');
    const [cpConfirm, setCpConfirm] = useState('');
    const [cpLoading, setCpLoading] = useState(false);

    const handleSubmitChangePass = async (e) => {
        e.preventDefault();
        if (!cpOld || !cpNew || !cpConfirm) return;
        if (cpNew !== cpConfirm) {
            showStatus('error', 'Mật khẩu mới không trùng khớp'); return;
        }

        setCpLoading(true);
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({
                    loai: "ChangePassword",
                    username: user.username,
                    oldPassword: cpOld,
                    newPassword: cpNew
                })
            });
            const res = await response.json();
            if (res.status === 'success') {
                showStatus('success', 'Đổi mật khẩu thành công');
                setCpOld(''); setCpNew(''); setCpConfirm('');
                setShowChangePassModal(false);
            } else {
                showStatus('error', res.message || 'Lỗi đổi mật khẩu');
            }
        } catch (err) {
            showStatus('error', 'Lỗi kết nối');
        } finally {
            setCpLoading(false);
        }
    };

    const handleSave = async () => {
        if (!sku || !quantity || !expiryDate) {
            showStatus('error', 'Vui lòng nhập đầy đủ thông tin'); return;
        }
        const newEntry = {
            thoi_gian: new Date().toLocaleString('vi-VN'),
            sku: String(sku).trim(), ten_san_pham: name, don_vi: unit,
            so_luong: Number(quantity), hsd: expiryDate, loai: isAdjustment ? 'KiemKe' : 'NhapHang'
        };
        setIsSyncing(true);
        try {
            await fetch(API_URL, {
                method: 'POST', mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(newEntry)
            });
            setLogs(prev => [{ id: Date.now(), ...newEntry }, ...prev]);
            showStatus('success', 'Đã lưu giao dịch');
            setQuantity(''); setExpiryDate('');
        } catch (err) { showStatus('error', 'Lỗi kết nối'); } finally { setIsSyncing(false); }
    };

    const handleDelete = async (itemSku, itemDate) => {
        setIsSyncing(true);
        try {
            await fetch(API_URL, {
                method: 'POST', mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ loai: "XoaMuc", sku: itemSku, hsd: itemDate })
            });
            setLogs(prev => prev.filter(log => !(String(log.sku) === String(itemSku) && String(log.hsd).includes(itemDate))));
            showStatus('success', 'Đã xóa lô hàng');
            setTimeout(fetchData, 2000);
        } catch (err) { showStatus('error', 'Lỗi khi xóa'); } finally { setIsSyncing(false); }
    };

    const handleReset = async () => {
        setIsSyncing(true);
        try {
            await fetch(API_URL, {
                method: 'POST', mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ loai: "ResetKho" })
            });
            setLogs([]); showStatus('success', 'Đã reset kho hoàn toàn');
            setShowResetConfirm(false);
        } catch (err) { showStatus('error', 'Lỗi hệ thống'); } finally { setIsSyncing(false); }
    };

    const handleExport = async () => {
        const XLSX = await import('xlsx');
        const wb = XLSX.utils.book_new();

        // Helper function to create sheet data with merges
        const createSheetData = (items) => {
            const wsData = [["SKU", "Tên", "HSD", "SL", "Đơn Vị", "Tổng Tồn"]];
            const merges = [];
            let currentRow = 1;

            items.forEach(item => {
                const batchEntries = Object.entries(item.batches).sort();
                const batchCount = batchEntries.length;
                const startRow = currentRow;

                batchEntries.forEach(([date, qty], idx) => {
                    if (idx === 0) {
                        wsData.push([item.sku, item.name, date, qty, item.unit, item.totalQty]);
                    } else {
                        wsData.push(["", "", date, qty, "", ""]);
                    }
                    currentRow++;
                });

                if (batchCount > 1) {
                    merges.push({ s: { r: startRow, c: 0 }, e: { r: startRow + batchCount - 1, c: 0 } });
                    merges.push({ s: { r: startRow, c: 1 }, e: { r: startRow + batchCount - 1, c: 1 } });
                    merges.push({ s: { r: startRow, c: 4 }, e: { r: startRow + batchCount - 1, c: 4 } });
                    merges.push({ s: { r: startRow, c: 5 }, e: { r: startRow + batchCount - 1, c: 5 } });
                }
            });

            const ws = XLSX.utils.aoa_to_sheet(wsData);
            ws['!merges'] = merges;
            return ws;
        };

        // Sheet 1: All items
        const wsAll = createSheetData(inventorySummary);
        XLSX.utils.book_append_sheet(wb, wsAll, "Tất Cả");

        // Sheet 2: Bar / Pha Chế
        const barItems = inventorySummary.filter(item => item.category === 'bar');
        if (barItems.length > 0) {
            const wsBar = createSheetData(barItems);
            XLSX.utils.book_append_sheet(wb, wsBar, "Pha Chế");
        }

        // Sheet 3: Retail / Bán Lẻ
        const retailItems = inventorySummary.filter(item => item.category === 'retail');
        if (retailItems.length > 0) {
            const wsRetail = createSheetData(retailItems);
            XLSX.utils.book_append_sheet(wb, wsRetail, "Bán Lẻ");
        }

        XLSX.writeFile(wb, `Kho_Export_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    // Filter Logic for ImportExport
    useEffect(() => {
        if (searchTerm.trim() === '') { setFilteredProducts([]); return; }
        const filtered = availableProducts.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) || String(p.sku).includes(searchTerm)
        ).slice(0, 15);
        setFilteredProducts(filtered);
    }, [searchTerm, availableProducts]);

    const selectProduct = (p) => {
        setSku(p.sku); setName(p.name); setUnit(p.unit);
        setSearchTerm(p.name); setShowSuggestions(false);
    };

    // --- RENDER ---
    if (!user) {
        return <Login onLogin={handleLogin} />;
    }

    return (
        <div className="flex min-h-screen bg-[#F5F5F7] font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif] text-slate-900 selection:bg-black/10 selection:text-black">
            {/* Sidebar (Desktop) */}
            <Sidebar
                currentView={view}
                setView={setView}
                user={user}
                onLogout={handleLogout}
                onChangePasswordClick={() => setShowChangePassModal(true)}
            />

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-4 md:p-8 pb-32 md:pb-8 max-w-7xl mx-auto w-full transition-all duration-300">
                {/* Header Mobile */}
                <div className="md:hidden flex items-center justify-between mb-6 pt-2">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-xl object-cover shadow-lg shadow-black/10" />
                        <div>
                            <h1 className="font-bold text-lg text-black tracking-tight leading-none">Kho Pha Chế</h1>
                            <p className="text-xs text-stone-500 font-medium">Xin chào, {String(user?.name || 'User').split(' ').pop()}</p>
                        </div>
                    </div>
                    {isSyncing ? <Loader2 size={20} className="animate-spin text-stone-400" /> : (
                        <button onClick={handleLogout} className="p-2 bg-white border border-stone-200 rounded-full text-stone-400">
                            <LogOut size={16} />
                        </button>
                    )}
                </div>

                {/* Status Toast */}
                <AnimatePresence>
                    {status && (
                        <motion.div
                            initial={{ opacity: 0, y: -20, x: 20 }}
                            animate={{ opacity: 1, y: 0, x: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className={`fixed top-6 right-6 z-[60] pl-4 pr-6 py-4 rounded-xl shadow-2xl shadow-black/10 border flex items-center gap-3 backdrop-blur-xl ${status.type === 'success' ? 'bg-white/80 border-black/5 text-emerald-700' : 'bg-white/80 border-red-100 text-red-600'
                                }`}
                        >
                            {status.type === 'success' ? <CheckCircle2 size={20} className="text-emerald-500" /> : <AlertCircle size={20} />}
                            <span className="font-bold text-sm tracking-wide">{status.message}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* View Render */}
                <div className="space-y-6">
                    {view === 'dashboard' && <Dashboard inventorySummary={inventorySummary} />}

                    {view === 'scan' && (
                        <ImportExport
                            isAdjustment={isAdjustment} setIsAdjustment={setIsAdjustment}
                            searchTerm={searchTerm} setSearchTerm={setSearchTerm}
                            showSuggestions={showSuggestions} setShowSuggestions={setShowSuggestions}
                            filteredProducts={filteredProducts} selectProduct={selectProduct}
                            name={name} sku={sku} unit={unit}
                            quantity={quantity} setQuantity={setQuantity}
                            expiryDate={expiryDate} setExpiryDate={setExpiryDate}
                            handleSave={handleSave} isSyncing={isSyncing}
                            setSku={setSku} setName={setName}
                        />
                    )}

                    {view === 'summary' && (
                        <Inventory
                            inventorySummary={inventorySummary}
                            isSyncing={isSyncing}
                            fetchData={fetchData}
                            handleExport={handleExport}
                            setShowResetConfirm={setShowResetConfirm}
                            handleDelete={handleDelete}
                        />
                    )}

                    {view === 'manage-products' && (
                        <ManageProducts API_URL={API_URL} showStatus={showStatus} />
                    )}

                    {view === 'manage-users' && (
                        <ManageUsers
                            API_URL={API_URL}
                            showStatus={showStatus}
                            isSyncing={isSyncing}
                            currentUser={user}
                        />
                    )}

                    {view === 'history' && (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            <h2 className="text-3xl font-bold text-black tracking-tight">Lịch Sử Giao Dịch</h2>
                            <div className="space-y-3">
                                {logs.map(log => (
                                    <div key={log.id} className="bg-white p-5 rounded-[20px] shadow-sm border border-black/5 flex items-center justify-between hover:scale-[1.01] transition-transform">
                                        <div>
                                            <div className="font-bold text-black text-base">{log.ten_san_pham}</div>
                                            <div className="text-xs text-stone-400 mt-1 font-medium">{log.thoi_gian}</div>
                                        </div>
                                        <div className={`px-4 py-2 rounded-xl text-sm font-bold ${log.loai === 'KiemKe' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                                            {log.loai === 'KiemKe' ? 'Kiểm' : '+'} {log.so_luong}
                                        </div>
                                    </div>
                                ))}
                                {logs.length === 0 && <p className="text-stone-400 text-center py-10">Chưa có lịch sử giao dịch</p>}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Mobile Bottom Nav */}
            <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-2xl border border-white/20 rounded-full shadow-2xl shadow-black/10 px-8 py-4 flex items-center gap-8 z-50">
                <button onClick={() => setView('dashboard')} className={`transition-colors ${view === 'dashboard' ? 'text-black' : 'text-stone-400'}`}><LayoutGrid size={24} strokeWidth={2.5} /></button>
                <button onClick={() => setView('scan')} className={`p-4 rounded-full -mt-12 border-[6px] border-[#F5F5F7] shadow-xl ${view === 'scan' ? 'bg-black text-white' : 'bg-stone-800 text-white'}`}><Plus size={28} /></button>
                <button onClick={() => setView('summary')} className={`transition-colors ${view === 'summary' ? 'text-black' : 'text-stone-400'}`}><Box size={24} strokeWidth={2.5} /></button>
            </nav>

            {/* Change Password Modal */}
            {showChangePassModal && (
                <div className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-md flex items-center justify-center p-6">
                    <div className="bg-white rounded-[32px] w-full max-w-sm p-8 shadow-2xl shadow-black/10 relative">
                        <button onClick={() => setShowChangePassModal(false)} className="absolute top-4 right-4 p-2 hover:bg-stone-50 rounded-full"><X size={20} className="text-stone-400" /></button>

                        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4"><Key size={32} /></div>
                        <h3 className="text-xl font-bold mb-6 text-center text-black">Đổi Mật Khẩu</h3>

                        <form onSubmit={handleSubmitChangePass} className="space-y-4">
                            <input value={cpOld} onChange={e => setCpOld(e.target.value)} type="password" placeholder="Mật khẩu cũ" className="w-full p-3 bg-stone-50 rounded-xl" />
                            <input value={cpNew} onChange={e => setCpNew(e.target.value)} type="password" placeholder="Mật khẩu mới" className="w-full p-3 bg-stone-50 rounded-xl" />
                            <input value={cpConfirm} onChange={e => setCpConfirm(e.target.value)} type="password" placeholder="Nhập lại mật khẩu mới" className="w-full p-3 bg-stone-50 rounded-xl" />

                            <button disabled={cpLoading || !cpOld || !cpNew} className="w-full py-3 bg-black text-white font-bold rounded-xl shadow-lg hover:opacity-90 disabled:opacity-50">
                                {cpLoading ? <Loader2 className="animate-spin mx-auto" /> : "Xác Nhận"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Reset Modal */}
            {showResetConfirm && (
                <div className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-md flex items-center justify-center p-6">
                    <div className="bg-white rounded-[32px] w-full max-w-sm p-8 text-center shadow-2xl shadow-black/10">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6"><Lock size={32} /></div>
                        <h3 className="text-xl font-bold mb-2 text-black">Xác nhận Dọn Kho</h3>
                        <p className="text-stone-500 mb-8 text-sm leading-relaxed">Hành động này sẽ xóa toàn bộ dữ liệu tồn kho. Bạn có chắc chắn không?</p>

                        <div className="flex gap-3">
                            <button onClick={() => setShowResetConfirm(false)} className="flex-1 py-4 text-stone-600 font-bold hover:bg-stone-50 rounded-2xl transition-colors">Hủy</button>
                            <button onClick={handleReset} className="flex-1 py-4 bg-red-500 text-white font-bold rounded-2xl shadow-xl shadow-red-500/30 hover:bg-red-600 transition-colors">Xóa Ngay</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);