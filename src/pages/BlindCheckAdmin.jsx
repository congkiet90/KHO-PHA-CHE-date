import React, { useState, useEffect } from 'react';
import { Users, Plus, Loader2, Clock, CheckCircle, XCircle, ArrowRight, RefreshCw, Trash2, Eye, Download, AlertTriangle } from 'lucide-react';
import BlindCheckResult from './BlindCheckResult';

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
            <div className="bg-white rounded-[24px] shadow-sm border border-black/5 overflow-hidden">
                {sessions.length === 0 ? (
                    <div className="py-20 text-center">
                        <Users size={48} className="mx-auto text-stone-200 mb-4" />
                        <p className="text-stone-500 font-medium">Chưa có phiên kiểm kho mù nào</p>
                        <p className="text-xs text-stone-400 mt-1">Nhấn "Tạo phiên mới" để bắt đầu</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#F5F5F7] text-[11px] font-bold uppercase tracking-wider text-stone-500 border-b border-black/5">
                                <tr>
                                    <th className="px-4 py-4">Phiên</th>
                                    <th className="px-4 py-4">User 1</th>
                                    <th className="px-4 py-4">User 2</th>
                                    <th className="px-4 py-4 text-center">Kết quả</th>
                                    <th className="px-4 py-4 text-center">Ngày tạo</th>
                                    <th className="px-4 py-4 text-center">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-black/5">
                                {sessions.slice().reverse().map((s, idx) => {
                                    const bothDone = s.status1 === 'done' && s.status2 === 'done';
                                    return (
                                        <tr key={idx} className="hover:bg-stone-50 transition-colors">
                                            <td className="px-4 py-4">
                                                <span className="font-mono text-sm text-stone-600">#{s.sessionId.slice(-6)}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-black">{s.user1}</span>
                                                    {getStatusBadge(s.status1)}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-black">{s.user2}</span>
                                                    {getStatusBadge(s.status2)}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                {getResultBadge(s.result)}
                                            </td>
                                            <td className="px-4 py-4 text-center text-sm text-stone-500">
                                                {s.createdAt}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    {bothDone && (
                                                        <>
                                                            <button
                                                                onClick={() => setViewingSession(s)}
                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                title="Xem kết quả"
                                                            >
                                                                <Eye size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleExportExcel(s)}
                                                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                                title="Xuất Excel"
                                                            >
                                                                <Download size={18} />
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteSession(s)}
                                                        disabled={deleting === s.sessionId}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
