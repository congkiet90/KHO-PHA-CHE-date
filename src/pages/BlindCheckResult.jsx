import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2, RefreshCw, BarChart3, AlertTriangle, ArrowRight, RotateCcw, Download } from 'lucide-react';

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
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-black flex items-center gap-2 tracking-tight">
                        <BarChart3 size={24} className="text-purple-600" /> Kết Quả So Sánh
                    </h2>
                    <p className="text-sm text-stone-500 mt-1 font-medium">
                        Phiên #{session.sessionId.slice(-6)}
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleExport}
                        className="px-4 py-2.5 bg-white border border-stone-200 text-stone-700 rounded-xl text-sm font-semibold hover:bg-stone-50 transition-colors flex items-center gap-2"
                    >
                        <Download size={16} /> Xuất Excel
                    </button>
                    <button
                        onClick={loadResult}
                        className="p-2.5 bg-white border border-black/10 text-stone-600 rounded-xl hover:bg-stone-50 transition-colors shadow-sm"
                    >
                        <RefreshCw size={18} />
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`rounded-2xl p-5 ${matchPercent === 100 ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white' : 'bg-white border border-stone-200'}`}>
                    <p className={`text-sm font-medium ${matchPercent === 100 ? 'text-emerald-100' : 'text-stone-500'}`}>Tỷ lệ khớp</p>
                    <p className={`text-3xl font-bold mt-1 ${matchPercent === 100 ? 'text-white' : 'text-black'}`}>{matchPercent}%</p>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
                    <div className="flex items-center gap-2">
                        <CheckCircle size={18} className="text-emerald-600" />
                        <p className="text-sm font-medium text-emerald-700">Khớp</p>
                    </div>
                    <p className="text-3xl font-bold text-emerald-700 mt-1">{matchCount}</p>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
                    <div className="flex items-center gap-2">
                        <XCircle size={18} className="text-red-600" />
                        <p className="text-sm font-medium text-red-700">Sai lệch</p>
                    </div>
                    <p className="text-3xl font-bold text-red-700 mt-1">{mismatchCount}</p>
                </div>
            </div>

            {/* Mismatches Table */}
            {mismatchCount > 0 && (
                <div className="bg-white rounded-[24px] shadow-sm border border-red-200 overflow-hidden">
                    <div className="p-4 bg-red-50 border-b border-red-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <AlertTriangle size={18} className="text-red-600" />
                            <h3 className="font-bold text-red-800">Các mục sai lệch ({mismatchCount})</h3>
                        </div>
                        <button
                            onClick={handleRecheck}
                            disabled={rechecking}
                            className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors flex items-center gap-2 shadow-lg shadow-red-600/20"
                        >
                            {rechecking ? <Loader2 className="animate-spin" size={16} /> : <RotateCcw size={16} />}
                            Kiểm lại
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-red-50/50 text-xs font-bold uppercase text-red-700 border-b border-red-100">
                                <tr>
                                    <th className="px-6 py-3">Sản phẩm</th>
                                    <th className="px-6 py-3 text-center">HSD</th>
                                    <th className="px-6 py-3 text-center">User 1</th>
                                    <th className="px-6 py-3 text-center">User 2</th>
                                    <th className="px-6 py-3 text-center">Chênh lệch</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-red-100">
                                {result.mismatches.map((m, idx) => (
                                    <tr key={idx} className="hover:bg-red-50/50">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-black">{m.name}</p>
                                            <p className="text-xs text-stone-400 font-mono">{m.sku}</p>
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm">
                                            {m.hsd ? new Date(m.hsd).toLocaleDateString('vi-VN') : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`font-bold ${m.qty1 === null ? 'text-stone-300' : 'text-blue-600'}`}>
                                                {m.qty1 === null ? 'Không có' : m.qty1}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`font-bold ${m.qty2 === null ? 'text-stone-300' : 'text-orange-600'}`}>
                                                {m.qty2 === null ? 'Không có' : m.qty2}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                                                {m.qty1 !== null && m.qty2 !== null ? Math.abs(m.qty1 - m.qty2) : '?'}
                                            </span>
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
                <div className="bg-white rounded-[24px] shadow-sm border border-emerald-200 overflow-hidden">
                    <div className="p-4 bg-emerald-50 border-b border-emerald-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CheckCircle size={18} className="text-emerald-600" />
                            <h3 className="font-bold text-emerald-800">Các mục khớp ({matchCount})</h3>
                        </div>
                        {session.result !== 'applied' && (
                            <button
                                onClick={handleApply}
                                disabled={applying}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-lg shadow-emerald-600/20"
                            >
                                {applying ? <Loader2 className="animate-spin" size={16} /> : <ArrowRight size={16} />}
                                Áp dụng vào kho
                            </button>
                        )}
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-emerald-50/50 text-xs font-bold uppercase text-emerald-700 border-b border-emerald-100">
                                <tr>
                                    <th className="px-6 py-3">Sản phẩm</th>
                                    <th className="px-6 py-3 text-center">HSD</th>
                                    <th className="px-6 py-3 text-center">Số lượng</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-emerald-100">
                                {result.matches.map((m, idx) => (
                                    <tr key={idx} className="hover:bg-emerald-50/50">
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-black">{m.name}</p>
                                            <p className="text-xs text-stone-400 font-mono">{m.sku}</p>
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm">
                                            {m.hsd ? new Date(m.hsd).toLocaleDateString('vi-VN') : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="font-bold text-emerald-700">{m.qty1}</span>
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

