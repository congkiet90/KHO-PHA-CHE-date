import React from 'react';
import { LayoutGrid, Loader2, Save, X, Box } from 'lucide-react';

const Inventory = ({ inventorySummary, isSyncing, fetchData, handleExport, setShowResetConfirm, handleDelete }) => {


    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-black flex items-center gap-2 tracking-tight">
                        <LayoutGrid size={24} className="text-black" /> Tồn Kho Chi Tiết
                    </h2>
                    <p className="text-sm text-stone-500 mt-1 font-medium">Quản lý và theo dõi lô hàng</p>
                </div>
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    {/* Refresh Button */}
                    <button onClick={fetchData} className="p-2.5 bg-white border border-black/10 text-stone-600 rounded-xl hover:bg-stone-50 transition-colors shadow-sm">
                        <Loader2 size={18} className={isSyncing ? "animate-spin" : ""} />
                    </button>

                    {/* Export Button */}
                    <button onClick={handleExport} className="flex-1 md:flex-none px-4 py-2.5 bg-black text-white rounded-xl text-sm font-semibold hover:bg-stone-800 transition-colors shadow-lg shadow-black/20 flex items-center justify-center gap-2">
                        <Save size={16} /> Xuất Excel
                    </button>

                    {/* Reset Button */}
                    <button onClick={() => setShowResetConfirm(true)} className="flex-1 md:flex-none px-4 py-2.5 bg-white border border-red-200 text-red-500 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors shadow-sm">
                        Dọn Kho
                    </button>
                </div>
            </div>



            {inventorySummary.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-[24px] border border-dashed border-stone-200">
                    <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Box className="text-stone-300" size={32} />
                    </div>
                    <p className="text-stone-500 font-medium">Chưa có dữ liệu kho</p>
                    <p className="text-xs text-stone-400 mt-1">Hãy nhập hàng hoặc đồng bộ dữ liệu</p>
                </div>
            ) : (
                <div className="bg-white rounded-[24px] shadow-sm border border-black/5 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-[#F5F5F7] text-[11px] font-bold uppercase tracking-wider text-stone-500 border-b border-black/5">
                                <tr>
                                    <th className="px-6 py-4 pl-8">Sản Phẩm</th>
                                    <th className="px-6 py-4 text-center">Hạn Dùng</th>
                                    <th className="px-6 py-4 text-center">Số Lượng</th>
                                    <th className="px-6 py-4 text-center">Trạng Thái</th>
                                    <th className="px-6 py-4 text-center"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-black/5">
                                {inventorySummary.map((item, idx) => (
                                    <React.Fragment key={idx}>
                                        {Object.entries(item.batches).sort().map(([date, qty], bIdx) => {
                                            let statusText = "OK";
                                            let statusClass = "bg-stone-100 text-stone-600 border-stone-200";

                                            if (date !== "Không có Date") {
                                                const d = new Date(date);
                                                const today = new Date();
                                                const diff = Math.ceil((d - today) / 86400000);

                                                if (diff < 0) { statusText = "HẾT HẠN"; statusClass = "bg-red-100 text-red-700 border-red-200 font-bold"; }
                                                else if (diff < 30) { statusText = "1 Tháng"; statusClass = "bg-amber-100 text-amber-700 border-amber-200 font-bold"; }
                                                else if (diff < 60) { statusText = "2 Tháng"; statusClass = "bg-orange-50 text-orange-600 border-orange-100"; }
                                                else if (diff < 90) { statusText = "3 Tháng"; statusClass = "bg-yellow-50 text-yellow-600 border-yellow-100"; }
                                                else { statusClass = "bg-emerald-50 text-emerald-700 border-emerald-100"; }
                                            }

                                            return (
                                                <tr key={`${idx}-${bIdx}`} className="hover:bg-stone-50 transition-colors group">
                                                    <td className="px-6 py-4 pl-8 font-medium text-black">
                                                        {item.name}
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-[11px] text-stone-400 font-normal font-mono tracking-wide">{item.sku}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center whitespace-nowrap text-sm text-stone-600 font-variant-numeric tabular-nums">
                                                        {date === "Không có Date" ? <span className="text-stone-300">-</span> : new Date(date).toLocaleDateString('vi-VN')}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="font-semibold text-black">{qty}</span>
                                                        <span className="text-xs text-stone-400 ml-1 font-normal lowercase">{item.unit}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wide border ${statusClass}`}>
                                                            {statusText}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button
                                                            onClick={() => {
                                                                if (confirm(`Xóa lô hàng:\n${item.name}\nHSD: ${date}?`)) {
                                                                    handleDelete(item.sku, date);
                                                                }
                                                            }}
                                                            className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </React.Fragment>
                                ))}
                            </tbody>
                            <tfoot className="bg-white border-t border-black/5">
                                <tr>
                                    <td colSpan="2" className="px-6 py-5 text-right text-xs font-bold uppercase tracking-wider text-stone-400">Tổng tồn kho:</td>
                                    <td className="px-6 py-5 text-center text-xl font-bold text-black tracking-tight">
                                        {inventorySummary.reduce((acc, item) => acc + item.totalQty, 0)}
                                    </td>
                                    <td colSpan="2"></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;
