import React, { useState, useEffect } from 'react';
import { Users, Plus, Loader2, Clock, CheckCircle, XCircle, ArrowRight, RefreshCw, Trash2, Eye, Download, AlertTriangle, ShieldCheck, Activity, Globe, Brain } from 'lucide-react';
import BlindCheckResult from './BlindCheckResult';
import { testGeminiConnection } from '../services/GeminiService';

const BlindCheckAdmin = ({ API_URL, showStatus }) => {
    const [sessions, setSessions] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [user1, setUser1] = useState('');
    const [user2, setUser2] = useState('');
    const [viewingSession, setViewingSession] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [showDiagnostics, setShowDiagnostics] = useState(false);
    const [diagLoading, setDiagLoading] = useState(false);
    const [diagResults, setDiagResults] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Load sessions
            const sessRes = await fetch(API_URL, {
                method: 'POST',
                body: JSON.stringify({ loai: 'GetAllBlindSessions' })
            });
            const sessData = await sessRes.json();
            setSessions(sessData);

            // Load users
            const userRes = await fetch(API_URL, {
                method: 'POST',
                body: JSON.stringify({ loai: 'GetUsers' })
            });
            const userData = await userRes.json();
            setUsers(userData); // Show all users
        } catch (err) {
            showStatus('error', 'Lỗi tải dữ liệu');
        }
        setLoading(false);
    };

    const handleCreate = async () => {
        if (!user1 || !user2) {
            showStatus('error', 'Vui lòng chọn 2 user');
            return;
        }
        if (user1 === user2) {
            showStatus('error', '2 user phải khác nhau');
            return;
        }

        setCreating(true);
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                body: JSON.stringify({ loai: 'CreateBlindSession', user1, user2 })
            });
            const data = await res.json();
            if (data.status === 'success') {
                showStatus('success', 'Đã tạo phiên kiểm kho mù');
                setShowCreate(false);
                setUser1('');
                setUser2('');
                loadData();
            }
        } catch (err) {
            showStatus('error', 'Lỗi tạo phiên');
        }
        setCreating(false);
    };

    const runDiagnostics = async () => {
        setDiagLoading(true);
        setDiagResults(null);
        const results = { backend: { status: 'testing' }, ai: { status: 'testing' } };
        setDiagResults({ ...results });

        // 1. Test Backend
        try {
            const start = Date.now();
            const res = await fetch(API_URL, {
                method: 'POST',
                body: JSON.stringify({ loai: 'GetProducts' }) // Simple lightweight call
            });
            const data = await res.json();
            results.backend = {
                status: 'ok',
                latency: Date.now() - start,
                message: `Kết nối OK. Nhận được ${data.length} sản phẩm.`
            };
        } catch (err) {
            results.backend = {
                status: 'error',
                message: `Lỗi: ${err.message}. Kiểm tra URL hoặc CORS.`
            };
        }
        setDiagResults({ ...results });

        // 2. Test AI
        try {
            const aiRes = await testGeminiConnection();
            results.ai = {
                status: aiRes.status === 'ok' ? 'ok' : 'error',
                message: aiRes.message,
                technical: aiRes.technical
            };
        } catch (err) {
            results.ai = { status: 'error', message: err.message };
        }
        setDiagResults({ ...results });
        setDiagLoading(false);
    };

    const handleDeleteSession = async (session) => {
        if (!confirm(`Xóa phiên #${session.sessionId.slice(-6)}? Tất cả dữ liệu kiểm kho của phiên này sẽ bị xóa vĩnh viễn.`)) {
            return;
        }

        setDeleting(session.sessionId);
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                body: JSON.stringify({ loai: 'DeleteBlindSession', sessionId: session.sessionId })
            });
            const data = await res.json();
            if (data.status === 'success') {
                showStatus('success', 'Đã xóa phiên kiểm kho');
                loadData();
            }
        } catch (err) {
            showStatus('error', 'Lỗi xóa phiên');
        }
        setDeleting(null);
    };

    const handleExportExcel = async (session) => {
        try {
            // Fetch result first
            const res = await fetch(API_URL, {
                method: 'POST',
                body: JSON.stringify({ loai: 'GetBlindCheckResult', sessionId: session.sessionId })
            });
            const result = await res.json();

            if (result.status !== 'success') {
                showStatus('error', 'Lỗi tải dữ liệu');
                return;
            }

            const XLSX = await import('xlsx');
            const wb = XLSX.utils.book_new();

            // Sheet 1: Summary
            const summaryData = [
                ['BÁO CÁO KIỂM TRA CHÉO KIỂM MÙ'],
                [],
                ['Phiên kiểm tra:', '#' + session.sessionId.slice(-6)],
                ['User 1:', session.user1],
                ['User 2:', session.user2],
                ['Ngày tạo:', session.createdAt],
                [],
                ['THỐNG KÊ'],
                ['Tổng mục:', result.matches.length + result.mismatches.length],
                ['Số mục khớp:', result.matches.length],
                ['Số mục sai lệch:', result.mismatches.length],
                ['Tỷ lệ khớp:', Math.round((result.matches.length / (result.matches.length + result.mismatches.length)) * 100) + '%']
            ];
            const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
            XLSX.utils.book_append_sheet(wb, summarySheet, 'Tổng Quan');

            // Sheet 2: All Data (combined view like Excel)
            if (result.matches.length > 0 || result.mismatches.length > 0) {
                const allData = [['SKU', 'Tên Sản Phẩm', 'HSD', 'User 1', 'User 2', 'Trạng Thái', 'Chênh Lệch']];

                // Add matches
                result.matches.forEach(m => {
                    allData.push([m.sku, m.name, m.hsd, m.qty1, m.qty1, '✓ Khớp', 0]);
                });

                // Add mismatches
                result.mismatches.forEach(m => {
                    allData.push([
                        m.sku, m.name, m.hsd,
                        m.qty1 !== null ? m.qty1 : 'Không có',
                        m.qty2 !== null ? m.qty2 : 'Không có',
                        '✗ Sai lệch',
                        (m.qty1 !== null && m.qty2 !== null) ? Math.abs(m.qty1 - m.qty2) : '?'
                    ]);
                });

                const allSheet = XLSX.utils.aoa_to_sheet(allData);
                XLSX.utils.book_append_sheet(wb, allSheet, 'Toàn Bộ');
            }

            // Sheet 3: Matches only
            if (result.matches.length > 0) {
                const matchData = [['SKU', 'Tên Sản Phẩm', 'HSD', 'Số Lượng'],
                ...result.matches.map(m => [m.sku, m.name, m.hsd, m.qty1])];
                const matchSheet = XLSX.utils.aoa_to_sheet(matchData);
                XLSX.utils.book_append_sheet(wb, matchSheet, 'Mục Khớp');
            }

            // Sheet 4: Mismatches only  
            if (result.mismatches.length > 0) {
                const mismatchData = [['SKU', 'Tên Sản Phẩm', 'HSD', 'User 1', 'User 2', 'Chênh Lệch'],
                ...result.mismatches.map(m => [
                    m.sku, m.name, m.hsd,
                    m.qty1 !== null ? m.qty1 : 'Không có',
                    m.qty2 !== null ? m.qty2 : 'Không có',
                    (m.qty1 !== null && m.qty2 !== null) ? Math.abs(m.qty1 - m.qty2) : '?'
                ])];
                const mismatchSheet = XLSX.utils.aoa_to_sheet(mismatchData);
                XLSX.utils.book_append_sheet(wb, mismatchSheet, 'Mục Sai Lệch');
            }

            // Sheet 5: Unchecked (Items in System but not Checked)
            if (result.unchecked && result.unchecked.length > 0) {
                const uncheckedHeaders = ['SKU', 'Tên Sản Phẩm', 'HSD', 'Tồn Hệ Thống', 'Trạng Thái'];
                const uncheckedData = [uncheckedHeaders, ...result.unchecked.map(u => [
                    u.sku, u.name, u.hsd, u.systemQty, 'BỎ SÓT?'
                ])];
                const uncheckedSheet = XLSX.utils.aoa_to_sheet(uncheckedData);
                XLSX.utils.book_append_sheet(wb, uncheckedSheet, 'Chưa Kiểm');
            }

            XLSX.writeFile(wb, `KiemKhoMu_${session.sessionId.slice(-6)}_${new Date().toISOString().slice(0, 10)}.xlsx`);
            showStatus('success', 'Đã xuất báo cáo Excel');
        } catch (err) {
            showStatus('error', 'Lỗi xuất Excel');
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'done':
                return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Xong</span>;
            case 'pending':
                return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">Đang kiểm</span>;
            default:
                return <span className="px-2 py-1 bg-stone-100 text-stone-600 rounded-full text-xs font-semibold">{status}</span>;
        }
    };

    const getResultBadge = (result) => {
        switch (result) {
            case 'match':
                return (
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold flex items-center gap-1">
                        <CheckCircle size={12} /> Khớp 100%
                    </span>
                );
            case 'mismatch':
                return (
                    <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold flex items-center gap-1">
                        <XCircle size={12} /> Có sai lệch
                    </span>
                );
            case 'applied':
                return (
                    <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold flex items-center gap-1">
                        <ArrowRight size={12} /> Đã áp dụng
                    </span>
                );
            default:
                return (
                    <span className="px-2.5 py-1 bg-stone-100 text-stone-500 rounded-full text-xs font-semibold flex items-center gap-1">
                        <Clock size={12} /> Chờ kiểm
                    </span>
                );
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-stone-400" size={32} />
            </div>
        );
    }

    // Show results view
    if (viewingSession) {
        return (
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setViewingSession(null)}
                        className="px-4 py-2 bg-stone-100 text-stone-600 rounded-xl font-semibold hover:bg-stone-200 transition-colors"
                    >
                        ← Quay lại
                    </button>
                    <h2 className="text-xl font-bold text-black">
                        Kết quả phiên #{viewingSession.sessionId.slice(-6)}
                    </h2>
                </div>
                <BlindCheckResult
                    API_URL={API_URL}
                    session={viewingSession}
                    showStatus={showStatus}
                    onApply={() => {
                        loadData();
                        setViewingSession(null);
                    }}
                    onRecheck={() => {
                        loadData();
                        setViewingSession(null);
                    }}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-black flex items-center gap-2 tracking-tight">
                        <Users size={24} className="text-indigo-600" /> Quản Lý Kiểm Kho Mù
                    </h2>
                    <p className="text-sm text-stone-500 mt-1 font-medium">Tạo và theo dõi các phiên kiểm tra chéo</p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setShowDiagnostics(!showDiagnostics)}
                        className={`p-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 ${showDiagnostics ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' : 'bg-white border border-black/10 text-stone-600 hover:bg-stone-50'}`}
                        title="Kiểm tra hệ thống"
                    >
                        <ShieldCheck size={18} />
                        <span className="text-xs font-bold uppercase tracking-wider hidden md:block">Kiểm tra</span>
                    </button>
                    <button
                        onClick={loadData}
                        className="p-2.5 bg-white border border-black/10 text-stone-600 rounded-xl hover:bg-stone-50 transition-colors shadow-sm"
                    >
                        <RefreshCw size={18} />
                    </button>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20 flex items-center gap-2"
                    >
                        <Plus size={18} /> Tạo phiên mới
                    </button>
                </div>
            </div>

            {/* Diagnostics Panel */}
            {showDiagnostics && (
                <div className="bg-slate-900 rounded-[32px] p-6 text-white shadow-2xl border border-white/5 animate-in slide-in-from-top duration-300">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                                <Activity size={20} className="text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Chẩn đoán hệ thống</h3>
                                <p className="text-xs text-slate-400">Kiểm tra kết nối tới các dịch vụ API</p>
                            </div>
                        </div>
                        <button
                            onClick={runDiagnostics}
                            disabled={diagLoading}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                        >
                            {diagLoading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                            {diagResults ? 'Chạy lại' : 'Bắt đầu kiểm tra'}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Backend Test */}
                        <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Globe size={18} className="text-blue-400" />
                                    <span className="font-bold text-sm">Google Apps Script</span>
                                </div>
                                {diagResults?.backend.status === 'ok' && <CheckCircle size={16} className="text-emerald-400" />}
                                {diagResults?.backend.status === 'error' && <XCircle size={16} className="text-rose-400" />}
                                {diagResults?.backend.status === 'testing' && <Loader2 size={16} className="text-blue-400 animate-spin" />}
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed min-h-[40px]">
                                {diagResults ? diagResults.backend.message : 'Chưa kiểm tra kết nối cơ sở dữ liệu.'}
                            </p>
                            {diagResults?.backend.latency && (
                                <div className="mt-3 text-[10px] font-mono text-slate-500">
                                    Độ trễ: {diagResults.backend.latency}ms
                                </div>
                            )}
                        </div>

                        {/* AI Test */}
                        <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Brain size={18} className="text-purple-400" />
                                    <span className="font-bold text-sm">Gemini AI Engine</span>
                                </div>
                                {diagResults?.ai.status === 'ok' && <CheckCircle size={16} className="text-emerald-400" />}
                                {diagResults?.ai.status === 'error' && <XCircle size={16} className="text-rose-400" />}
                                {diagResults?.ai.status === 'testing' && <Loader2 size={16} className="text-purple-400 animate-spin" />}
                            </div>
                            <p className="text-xs text-slate-400 leading-relaxed min-h-[40px]">
                                {diagResults ? diagResults.ai.message : 'Chưa kiểm tra kết nối trí tuệ nhân tạo.'}
                            </p>
                            {diagResults?.ai.technical && (
                                <div className="mt-3 text-[10px] font-mono text-rose-300/60 break-all bg-black/20 p-2 rounded-lg">
                                    {diagResults.ai.technical}
                                </div>
                            )}
                        </div>
                    </div>

                    {!diagResults && !diagLoading && (
                        <div className="mt-6 p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 flex items-start gap-3">
                            <AlertTriangle size={18} className="text-indigo-400 shrink-0" />
                            <p className="text-xs text-indigo-200/80 leading-relaxed">
                                <b>Lưu ý:</b> Công cụ này sẽ thực hiện các truy vấn thực tế. Đảm bảo bạn đã cấu hình API Key trong file .env hoặc trên Dashboard Vercel.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Create Modal */}
            {showCreate && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                        <h3 className="text-lg font-bold text-black mb-4">Tạo phiên kiểm kho mù</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-stone-600 mb-1.5">User 1</label>
                                <select
                                    value={user1}
                                    onChange={(e) => setUser1(e.target.value)}
                                    className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Chọn user...</option>
                                    {users.map(u => (
                                        <option key={u.username} value={u.username}>{u.fullname} ({u.username})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-600 mb-1.5">User 2</label>
                                <select
                                    value={user2}
                                    onChange={(e) => setUser2(e.target.value)}
                                    className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Chọn user...</option>
                                    {users.map(u => (
                                        <option key={u.username} value={u.username}>{u.fullname} ({u.username})</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowCreate(false)}
                                className="flex-1 py-3 bg-stone-100 text-stone-600 rounded-xl font-semibold hover:bg-stone-200 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={creating}
                                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                            >
                                {creating ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                                Tạo
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sessions Table */}
            <div className="bg-white rounded-[32px] shadow-sm border border-black/5 overflow-hidden">
                <div className="p-6 border-b border-black/5 flex justify-between items-center bg-stone-50/50">
                    <h3 className="font-bold text-black flex items-center gap-2">
                        <Clock size={18} className="text-stone-400" /> Lịch sử phiên kiểm kho
                    </h3>
                    <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">{sessions.length} phiên</span>
                </div>

                {sessions.length === 0 ? (
                    <div className="py-24 text-center">
                        <div className="w-20 h-20 bg-stone-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <Users size={40} className="text-stone-200" />
                        </div>
                        <p className="text-stone-800 font-bold">Chưa có phiên kiểm kho mù nào</p>
                        <p className="text-sm text-stone-400 mt-1 max-w-[240px] mx-auto">Nhấn "Tạo phiên mới" để bắt đầu kiểm tra chéo tồn kho</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white text-[11px] font-bold uppercase tracking-widest text-stone-400 border-b border-black/5">
                                <tr>
                                    <th className="px-6 py-4">ID Phiên</th>
                                    <th className="px-6 py-4">Nhân sự tham gia</th>
                                    <th className="px-6 py-4 text-center">Trạng thái</th>
                                    <th className="px-6 py-4 text-center">Thời gian</th>
                                    <th className="px-6 py-4 text-right">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-black/5">
                                {sessions.slice().reverse().map((s, idx) => {
                                    const bothDone = s.status1 === 'done' && s.status2 === 'done';
                                    const isApplied = s.result === 'applied';

                                    return (
                                        <tr key={idx} className={`group hover:bg-stone-50/80 transition-all ${isApplied ? 'opacity-80' : ''}`}>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-[10px] font-bold ${isApplied ? 'bg-blue-50 text-blue-500' : 'bg-stone-100 text-stone-500'}`}>
                                                        #{s.sessionId.slice(-3)}
                                                    </div>
                                                    <span className="font-mono text-sm text-stone-400">...{s.sessionId.slice(-6)}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-bold text-black">{s.user1}</span>
                                                        {getStatusBadge(s.status1)}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-bold text-black">{s.user2}</span>
                                                        {getStatusBadge(s.status2)}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <div className="flex justify-center">
                                                    {getResultBadge(s.result)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-center text-xs font-medium text-stone-500">
                                                {s.createdAt}
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {bothDone && (
                                                        <>
                                                            <button
                                                                onClick={() => setViewingSession(s)}
                                                                className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                                                                title="Xem chi tiết & So sánh"
                                                            >
                                                                <Eye size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleExportExcel(s)}
                                                                className="p-2.5 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                                                                title="Tải báo cáo Excel"
                                                            >
                                                                <Download size={18} />
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteSession(s)}
                                                        disabled={deleting === s.sessionId}
                                                        className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                                                        title="Xóa phiên"
                                                    >
                                                        {deleting === s.sessionId ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlindCheckAdmin;
