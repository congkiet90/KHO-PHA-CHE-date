import React, { useState, useEffect, useMemo, lazy, Suspense, Component } from 'react';
import ReactDOM from 'react-dom/client';

import { CheckCircle2, AlertCircle, Loader2, Lock, Sparkles, LayoutGrid, Plus, Box, User, LogOut, Key, X, Menu, Users, Package, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import ImportExport from './pages/ImportExport';
import ManageUsers from './pages/ManageUsers';
import ManageProducts from './pages/ManageProducts';
import BlindCheck from './pages/BlindCheck';
import BlindCheckResult from './pages/BlindCheckResult';
import BlindCheckAdmin from './pages/BlindCheckAdmin';
import { validateWarehouseAction } from './services/GeminiService';

const VirtualManager = lazy(() => import('./components/VirtualManager'));

// --- CONFIG ---
const API_URL = "https://script.google.com/macros/s/AKfycbxbF8SZAU1Gg60KpsVp4cnlpKbQCzLV7JwCJhEJBYlNRsIyiv-Bs7E7w0aLH_wPVWIW/exec";

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
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [blindSession, setBlindSession] = useState(null);

    // --- AI MONITOR STATE ---
    const [aiFeedback, setAiFeedback] = useState(null);
    const [isAiValidating, setIsAiValidating] = useState(false);

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
                body: JSON.stringify({ loai: "GetProducts" }),
                credentials: 'omit'
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
                body: JSON.stringify({ loai: "GetData" }),
                credentials: 'omit'
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
            body: JSON.stringify({ loai: "Login", username, password }),
            credentials: 'omit'
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
                }),
                credentials: 'omit'
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

            // AI MONITOR: Validate the action
            setIsAiValidating(true);
            const feedback = await validateWarehouseAction(
                isAdjustment ? 'Điều chỉnh/Kiểm kê' : 'Nhập hàng',
                newEntry,
                inventorySummary
            );
            if (feedback) setAiFeedback({ type: 'info', message: feedback });
            setIsAiValidating(false);

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

            // AI MONITOR: Validate deletion
            setIsAiValidating(true);
            const feedback = await validateWarehouseAction(
                'Xóa lô hàng',
                { sku: itemSku, hsd: itemDate },
                inventorySummary
            );
            if (feedback) setAiFeedback({ type: 'warning', message: feedback });
            setIsAiValidating(false);

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



        XLSX.writeFile(wb, `Kho_Export_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    // Filter Logic for ImportExport
    useEffect(() => {
        if (searchTerm.trim() === '') { setFilteredProducts([]); return; }
        const filtered = availableProducts.filter(p =>
            p && p.name && p.sku && (String(p.name).toLowerCase().includes(searchTerm.toLowerCase()) || String(p.sku).includes(searchTerm))
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
                            <h1 className="font-bold text-lg text-black tracking-tight leading-none">hehehe</h1>
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
                            aiFeedback={aiFeedback} setAiFeedback={setAiFeedback}
                            isAiValidating={isAiValidating}
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

                    {view === 'blind-check' && (
                        <BlindCheck
                            API_URL={API_URL}
                            products={availableProducts}
                            username={user.username}
                            showStatus={showStatus}
                            aiFeedback={aiFeedback}
                            setAiFeedback={setAiFeedback}
                            isAiValidating={isAiValidating}
                            setIsAiValidating={setIsAiValidating}
                            inventorySummary={inventorySummary}
                        />
                    )}

                    {view === 'blind-check-admin' && (
                        <BlindCheckAdmin
                            API_URL={API_URL}
                            showStatus={showStatus}
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

            {/* AI Chat Assistant */}
            <Suspense fallback={null}>
                <VirtualManager inventoryContext={inventorySummary} />
            </Suspense>

            {/* Mobile Bottom Nav */}
            <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-2xl border border-white/20 rounded-full shadow-2xl shadow-black/10 px-6 py-4 flex items-center gap-6 z-50">
                <button onClick={() => setView('dashboard')} className={`transition-colors ${view === 'dashboard' ? 'text-black' : 'text-stone-400'}`}><LayoutGrid size={24} strokeWidth={2.5} /></button>
                <button onClick={() => setView('summary')} className={`transition-colors ${view === 'summary' ? 'text-black' : 'text-stone-400'}`}><Box size={24} strokeWidth={2.5} /></button>
                <button onClick={() => setView('scan')} className={`p-4 rounded-full -mt-12 border-[6px] border-[#F5F5F7] shadow-xl ${view === 'scan' ? 'bg-black text-white' : 'bg-stone-800 text-white'}`}><Plus size={28} /></button>
                <button onClick={() => setView('history')} className={`transition-colors ${view === 'history' ? 'text-black' : 'text-stone-400'}`}><History size={24} strokeWidth={2.5} /></button>
                <button onClick={() => setShowMobileMenu(!showMobileMenu)} className={`transition-colors ${showMobileMenu ? 'text-black' : 'text-stone-400'}`}><Menu size={24} strokeWidth={2.5} /></button>
            </nav>

            {/* Mobile Menu Dropdown */}
            <AnimatePresence>
                {showMobileMenu && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="md:hidden fixed bottom-28 right-4 bg-white rounded-2xl shadow-2xl shadow-black/20 border border-black/5 p-2 z-50 min-w-[180px]"
                    >
                        {(user?.role === 'admin' || user?.role === 'manager') && (
                            <>
                                <button
                                    onClick={() => { setView('manage-products'); setShowMobileMenu(false); }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left ${view === 'manage-products' ? 'bg-emerald-50 text-emerald-700' : 'text-stone-600 hover:bg-stone-50'}`}
                                >
                                    <Package size={18} />
                                    <span className="text-sm font-medium">Sản Phẩm</span>
                                </button>
                                <button
                                    onClick={() => { setView('manage-users'); setShowMobileMenu(false); }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left ${view === 'manage-users' ? 'bg-emerald-50 text-emerald-700' : 'text-stone-600 hover:bg-stone-50'}`}
                                >
                                    <Users size={18} />
                                    <span className="text-sm font-medium">Nhân Sự</span>
                                </button>
                                <button
                                    onClick={() => { setView('blind-check-admin'); setShowMobileMenu(false); }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left ${view === 'blind-check-admin' ? 'bg-emerald-50 text-emerald-700' : 'text-stone-600 hover:bg-stone-50'}`}
                                >
                                    <Users size={18} />
                                    <span className="text-sm font-medium">QL Kiểm Kho Mù</span>
                                </button>
                                <div className="border-t border-stone-100 my-1"></div>
                            </>
                        )}
                        <button
                            onClick={() => { setView('blind-check'); setShowMobileMenu(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left ${view === 'blind-check' ? 'bg-blue-50 text-blue-700' : 'text-stone-600 hover:bg-stone-50'}`}
                        >
                            <Box size={18} />
                            <span className="text-sm font-medium">Kiểm Kho Mù</span>
                        </button>
                        <div className="border-t border-stone-100 my-1"></div>
                        <button
                            onClick={() => { setShowChangePassModal(true); setShowMobileMenu(false); }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-stone-600 hover:bg-stone-50"
                        >
                            <Key size={18} />
                            <span className="text-sm font-medium">Đổi Mật Khẩu</span>
                        </button>
                        <button
                            onClick={() => { handleLogout(); setShowMobileMenu(false); }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-red-500 hover:bg-red-50"
                        >
                            <LogOut size={18} />
                            <span className="text-sm font-medium">Đăng Xuất</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

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

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-10 text-red-600">
                    <h1 className="text-2xl font-bold mb-4">Đã xảy ra lỗi hệ thống</h1>
                    <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm text-black">
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </pre>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Tải lại trang
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <ErrorBoundary>
        <App />
    </ErrorBoundary>
);