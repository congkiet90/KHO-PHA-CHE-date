import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2, RefreshCw, BarChart3, AlertTriangle, ArrowRight, RotateCcw, Download, AlertOctagon } from 'lucide-react';

const BlindCheckResult = ({ API_URL, session, showStatus, onApply, onRecheck }) => {
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState(null);
    const [applying, setApplying] = useState(false);
    const [rechecking, setRechecking] = useState(false);

    useEffect(() => {
        if (session?.sessionId) {
            loadResult();
        }
    }, [session]);

    const loadResult = async () => {
        setLoading(true);
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                body: JSON.stringify({ loai: 'GetBlindCheckResult', sessionId: session.sessionId })
            });
            const data = await res.json();
            if (data.status === 'success') {
                setResult(data);
            }
        } catch (err) {
            showStatus('error', 'Lỗi tải kết quả');
        }
        setLoading(false);
    };

    const handleApply = async () => {
        if (!confirm('Áp dụng kết quả khớp vào kho chính? Chỉ các mục có số liệu giống nhau sẽ được cập nhật.')) {
            return;
        }

        setApplying(true);
        try {
            const itemsToApply = result.matches.map(m => ({
                sku: m.sku,
                name: m.name,
                hsd: m.hsd,
                qty: m.qty1
            }));

            const res = await fetch(API_URL, {
                method: 'POST',
                body: JSON.stringify({
                    loai: 'ApplyBlindResult',
                    sessionId: session.sessionId,
                    items: itemsToApply
                })
            });
            const data = await res.json();
            if (data.status === 'success') {
                showStatus('success', `Đã áp dụng ${itemsToApply.length} mục vào kho chính`);
                if (onApply) onApply();
            }
        } catch (err) {
            showStatus('error', 'Lỗi áp dụng kết quả');
        }
        setApplying(false);
    };

    // Feature 2: Re-check mismatched items
    const handleRecheck = async () => {
        if (!confirm('Reset phiên để kiểm lại các mục sai lệch? 2 users sẽ cần kiểm lại.')) {
            return;
        }

        setRechecking(true);
        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                body: JSON.stringify({
                    loai: 'RecheckMismatched',
                    sessionId: session.sessionId,
                    mismatches: result.mismatches.map(m => ({ sku: m.sku, name: m.name, hsd: m.hsd }))
                })
            });
            const data = await res.json();
            if (data.status === 'success') {
                showStatus('success', 'Đã reset phiên. 2 users có thể kiểm lại các mục sai lệch.');
                if (onRecheck) onRecheck();
            }
        } catch (err) {
            showStatus('error', 'Lỗi reset phiên');
        }
        setRechecking(false);
    };

    // Feature 3: Export to Excel
    const handleExport = async () => {
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

        // Sheet 2: Matches
        if (result.matches.length > 0) {
            const matchHeaders = ['SKU', 'Tên Sản Phẩm', 'HSD', 'Số Lượng'];
            const matchData = [matchHeaders, ...result.matches.map(m => [
                m.sku, m.name, m.hsd, m.qty1
            ])];
            const matchSheet = XLSX.utils.aoa_to_sheet(matchData);
            XLSX.utils.book_append_sheet(wb, matchSheet, 'Mục Khớp');
        }

        // Sheet 3: Mismatches
        if (result.mismatches.length > 0) {
            const mismatchHeaders = ['SKU', 'Tên Sản Phẩm', 'HSD', 'User 1', 'User 2', 'Chênh Lệch'];
            const mismatchData = [mismatchHeaders, ...result.mismatches.map(m => [
                m.sku, m.name, m.hsd,
                m.qty1 !== null ? m.qty1 : 'Không có',
                m.qty2 !== null ? m.qty2 : 'Không có',
                (m.qty1 !== null && m.qty2 !== null) ? Math.abs(m.qty1 - m.qty2) : '?'
            ])];
            const mismatchSheet = XLSX.utils.aoa_to_sheet(mismatchData);
            XLSX.utils.book_append_sheet(wb, mismatchSheet, 'Mục Sai Lệch');
        }

        // Sheet 4: Unchecked (Items in System but not Checked)
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
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-stone-400" size={32} />
            </div>
        );
    }

    if (!result) {
        return (
            <div className="py-20 text-center bg-white rounded-[24px] border border-dashed border-stone-200">
                <p className="text-stone-500">Không có dữ liệu kết quả</p>
            </div>
        );
    }

    const matchCount = result.matches.length;
    const mismatchCount = result.mismatches.length;
    const total = matchCount + mismatchCount;
    const matchPercent = total > 0 ? Math.round((matchCount / total) * 100) : 0;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-black flex items-center gap-3 tracking-tight">
                        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
                            <BarChart3 size={24} />
                        </div>
                        Kết Quả So Sánh
                    </h2>
                    <p className="text-sm text-stone-500 mt-1 font-medium ml-15">
                        Phiên đối soát #{session.sessionId.slice(-6)}
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleExport}
                        className="px-5 py-3 bg-white border border-stone-200 text-stone-800 rounded-2xl text-sm font-bold hover:bg-stone-50 transition-all flex items-center gap-2 shadow-sm active:scale-95"
                    >
                        <Download size={18} /> Xuất Excel
                    </button>
                    <button
                        onClick={loadResult}
                        className="p-3 bg-white border border-black/10 text-stone-600 rounded-2xl hover:bg-stone-50 transition-all shadow-sm active:rotate-180 duration-500"
                    >
                        <RefreshCw size={20} />
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                <div className={`rounded-[32px] p-6 shadow-sm border transition-all ${matchPercent === 100 ? 'bg-black text-white border-black ring-4 ring-black/5' : 'bg-white border-black/5'}`}>
                    <p className={`text-xs font-bold uppercase tracking-widest ${matchPercent === 100 ? 'text-white/60' : 'text-stone-400'}`}>Tỷ lệ khớp</p>
                    <p className="text-4xl font-black mt-2 tracking-tighter">{matchPercent}%</p>
                </div>

                <div className="bg-emerald-50 border border-emerald-100 rounded-[32px] p-6">
                    <div className="flex items-center gap-2 text-emerald-600">
                        <CheckCircle size={18} strokeWidth={2.5} />
                        <span className="text-xs font-bold uppercase tracking-widest">Khớp</span>
                    </div>
                    <p className="text-4xl font-black text-emerald-700 mt-2 tracking-tighter">{matchCount}</p>
                </div>

                <div className="bg-rose-50 border border-rose-100 rounded-[32px] p-6">
                    <div className="flex items-center gap-2 text-rose-600">
                        <XCircle size={18} strokeWidth={2.5} />
                        <span className="text-xs font-bold uppercase tracking-widest">Sai lệch</span>
                    </div>
                    <p className="text-4xl font-black text-rose-700 mt-2 tracking-tighter">{mismatchCount}</p>
                </div>

                <div className="bg-amber-50 border border-amber-100 rounded-[32px] p-6">
                    <div className="flex items-center gap-2 text-amber-600">
                        <AlertOctagon size={18} strokeWidth={2.5} />
                        <span className="text-xs font-bold uppercase tracking-widest">Chưa kiểm</span>
                    </div>
                    <p className="text-4xl font-black text-amber-700 mt-2 tracking-tighter">{result.unchecked ? result.unchecked.length : 0}</p>
                </div>
            </div>

            {/* Unchecked Items Table (Warning) */}
            {result.unchecked && result.unchecked.length > 0 && (
                <div className="bg-white rounded-[32px] shadow-sm border border-amber-200 overflow-hidden">
                    <div className="p-5 bg-amber-50/50 border-b border-amber-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <AlertOctagon size={20} className="text-amber-600" />
                            <h3 className="font-bold text-amber-900">Mã hàng bỏ sót ({result.unchecked.length})</h3>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-amber-50/30 text-[11px] font-bold uppercase tracking-widest text-amber-700 border-b border-amber-100">
                                <tr>
                                    <th className="px-6 py-4">Sản phẩm</th>
                                    <th className="px-6 py-4 text-center">HSD</th>
                                    <th className="px-6 py-4 text-center">Tồn Hệ Thống</th>
                                    <th className="px-6 py-4 text-center">Trạng Thái</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-amber-100">
                                {result.unchecked.map((u, idx) => (
                                    <tr key={idx} className="hover:bg-amber-50/40 transition-colors">
                                        <td className="px-6 py-5">
                                            <p className="font-bold text-black">{u.name}</p>
                                            <p className="text-xs text-stone-400 font-mono mt-0.5">{u.sku}</p>
                                        </td>
                                        <td className="px-6 py-5 text-center text-sm font-medium">
                                            {u.hsd ? new Date(u.hsd).toLocaleDateString('vi-VN') : '—'}
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className="font-black text-stone-800 text-lg">{u.systemQty}</span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-xl text-[10px] font-black tracking-widest">
                                                CHƯA KIỂM
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Mismatches Table */}
            {mismatchCount > 0 && (
                <div className="bg-white rounded-[32px] shadow-sm border border-rose-200 overflow-hidden">
                    <div className="p-5 bg-rose-50/50 border-b border-rose-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <AlertTriangle size={20} className="text-rose-600" />
                            <h3 className="font-bold text-rose-900">Danh sách sai lệch ({mismatchCount})</h3>
                        </div>
                        <button
                            onClick={handleRecheck}
                            disabled={rechecking}
                            className="px-5 py-2.5 bg-rose-600 text-white rounded-2xl text-sm font-bold hover:bg-rose-700 transition-all flex items-center gap-2 shadow-lg shadow-rose-600/20 active:scale-95"
                        >
                            {rechecking ? <Loader2 className="animate-spin" size={16} /> : <RotateCcw size={16} />}
                            Yêu cầu kiểm lại
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-rose-50/30 text-[11px] font-bold uppercase tracking-widest text-rose-700 border-b border-rose-100">
                                <tr>
                                    <th className="px-6 py-4">Sản phẩm</th>
                                    <th className="px-6 py-4 text-center">HSD</th>
                                    <th className="px-6 py-4 text-center">User 1</th>
                                    <th className="px-6 py-4 text-center">User 2</th>
                                    <th className="px-6 py-4 text-center">Chênh lệch</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-rose-100">
                                {result.mismatches.map((m, idx) => (
                                    <tr key={idx} className="hover:bg-rose-50/40 transition-colors">
                                        <td className="px-6 py-5">
                                            <p className="font-bold text-black">{m.name}</p>
                                            <p className="text-xs text-stone-400 font-mono mt-0.5">{m.sku}</p>
                                        </td>
                                        <td className="px-6 py-5 text-center text-sm font-medium">
                                            {m.hsd ? new Date(m.hsd).toLocaleDateString('vi-VN') : '—'}
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={`text-xl font-black ${m.qty1 === null ? 'text-stone-300' : 'text-blue-500'}`}>
                                                {m.qty1 === null ? '—' : m.qty1}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={`text-xl font-black ${m.qty2 === null ? 'text-stone-300' : 'text-orange-500'}`}>
                                                {m.qty2 === null ? '—' : m.qty2}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <div className="inline-flex items-center justify-center w-10 h-10 bg-rose-100 text-rose-700 rounded-full text-sm font-black">
                                                {m.qty1 !== null && m.qty2 !== null ? Math.abs(m.qty1 - m.qty2) : '?'}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Matches Table */}
            {matchCount > 0 && (
                <div className="bg-white rounded-[32px] shadow-sm border border-emerald-200 overflow-hidden">
                    <div className="p-5 bg-emerald-50/50 border-b border-emerald-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CheckCircle size={20} className="text-emerald-600" />
                            <h3 className="font-bold text-emerald-900">Dữ liệu khớp ({matchCount})</h3>
                        </div>
                        {session.result !== 'applied' && (
                            <button
                                onClick={handleApply}
                                disabled={applying}
                                className="px-5 py-2.5 bg-emerald-600 text-white rounded-2xl text-sm font-bold hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95"
                            >
                                {applying ? <Loader2 className="animate-spin" size={16} /> : <ArrowRight size={16} />}
                                Áp dụng vào kho chính
                            </button>
                        )}
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-emerald-50/30 text-[11px] font-bold uppercase tracking-widest text-emerald-700 border-b border-emerald-100">
                                <tr>
                                    <th className="px-6 py-4">Sản phẩm</th>
                                    <th className="px-6 py-4 text-center">HSD</th>
                                    <th className="px-6 py-4 text-center">Số lượng</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-emerald-100">
                                {result.matches.map((m, idx) => (
                                    <tr key={idx} className="hover:bg-emerald-50/40 transition-colors">
                                        <td className="px-6 py-5">
                                            <p className="font-bold text-black">{m.name}</p>
                                            <p className="text-xs text-stone-400 font-mono mt-0.5">{m.sku}</p>
                                        </td>
                                        <td className="px-6 py-5 text-center text-sm font-medium">
                                            {m.hsd ? new Date(m.hsd).toLocaleDateString('vi-VN') : '—'}
                                        </td>
                                        <td className="px-6 py-5 text-center font-black text-emerald-700 text-xl">
                                            {m.qty1}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BlindCheckResult;

