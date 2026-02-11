import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { AlertTriangle, TrendingUp, Package, Clock, Box } from 'lucide-react';
// import AIInsights from '../components/AIInsights';

const Dashboard = ({ inventorySummary }) => {
    // --- Data Analysis ---
    const totalItems = inventorySummary.length;
    const totalStock = inventorySummary.reduce((acc, item) => acc + item.totalQty, 0);

    // Calculate expired/near-expired
    let expiredCount = 0;
    let nearExpiredCount = 0;
    let safeCount = 0;

    inventorySummary.forEach(item => {
        Object.entries(item.batches).forEach(([date, qty]) => {
            if (date !== "Không có Date") {
                const d = new Date(date);
                const today = new Date();
                const diff = Math.ceil((d - today) / 86400000);
                if (diff < 0) expiredCount++;
                else if (diff < 30) nearExpiredCount++;
                else safeCount++;
            } else {
                safeCount++;
            }
        });
    });

    const pieData = [
        { name: 'An toàn', value: safeCount, color: '#10b981' }, // Green
        { name: 'Sắp hết hạn', value: nearExpiredCount, color: '#f59e0b' }, // Amber
        { name: 'Hết hạn', value: expiredCount, color: '#ef4444' }, // Red
    ].filter(d => d.value > 0);

    // Top 5 items quantity
    const barData = [...inventorySummary]
        .sort((a, b) => b.totalQty - a.totalQty)
        .slice(0, 5)
        .map(item => ({
            name: item.name.length > 15 ? item.name.substring(0, 15) + '...' : item.name,
            soluong: item.totalQty
        }));

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Tổng Quan Kho</h2>
                    <p className="text-slate-500 text-sm">Cập nhật thời gian thực</p>
                </div>
            </div>

            {/* AI Insights Section gỡ bỏ theo yêu cầu */}
            {/* <AIInsights inventorySummary={inventorySummary} /> */}

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                <div className="bg-white p-6 rounded-[24px] shadow-sm border border-black/5 flex flex-col justify-between h-32 md:h-40 relative overflow-hidden group">
                    <div className="absolute right-[-10px] top-[-10px] opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                        <Package size={100} />
                    </div>
                    <div className="flex items-center gap-2 text-stone-500">
                        <Package size={18} />
                        <span className="text-xs font-semibold uppercase tracking-wide">Tổng tồn</span>
                    </div>
                    <div>
                        <div className="text-3xl md:text-4xl font-bold text-black tracking-tight">{totalStock}</div>
                        <div className="text-sm text-stone-400 mt-1 font-medium">Đơn vị sản phẩm</div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[24px] shadow-sm border border-black/5 flex flex-col justify-between h-32 md:h-40 relative overflow-hidden group">
                    <div className="absolute right-[-10px] top-[-10px] opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                        <Box size={100} />
                    </div>
                    <div className="flex items-center gap-2 text-stone-500">
                        <Box size={18} />
                        <span className="text-xs font-semibold uppercase tracking-wide">Mã hàng</span>
                    </div>
                    <div>
                        <div className="text-3xl md:text-4xl font-bold text-black tracking-tight">{totalItems}</div>
                        <div className="text-sm text-stone-400 mt-1 font-medium">SKU đang quản lý</div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[24px] shadow-sm border border-black/5 flex flex-col justify-between h-32 md:h-40 relative overflow-hidden group">
                    {/* Amber Accent for Warning */}
                    <div className="absolute top-0 right-0 w-2 h-2 m-4 rounded-full bg-amber-400"></div>
                    <div className="flex items-center gap-2 text-stone-500">
                        <Clock size={18} />
                        <span className="text-xs font-semibold uppercase tracking-wide">Sắp hết hạn</span>
                    </div>
                    <div>
                        <div className="text-3xl md:text-4xl font-bold text-black tracking-tight">{nearExpiredCount}</div>
                        <div className="text-sm text-amber-600 mt-1 font-bold">Cần kiểm tra</div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[24px] shadow-sm border border-black/5 flex flex-col justify-between h-32 md:h-40 relative overflow-hidden group">
                    {/* Red Accent for Danger */}
                    <div className="absolute top-0 right-0 w-2 h-2 m-4 rounded-full bg-red-500"></div>
                    <div className="flex items-center gap-2 text-stone-500">
                        <AlertTriangle size={18} />
                        <span className="text-xs font-semibold uppercase tracking-wide">Hết hạn</span>
                    </div>
                    <div>
                        <div className="text-3xl md:text-4xl font-bold text-black tracking-tight">{expiredCount}</div>
                        <div className="text-sm text-red-500 mt-1 font-bold">Huỷ gấp</div>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pie Chart */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <TrendingUp size={18} className="text-blue-500" /> Tình trạng Hạn Sử Dụng
                    </h3>
                    <div className="h-[256px] w-full min-w-0">
                        {pieData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">
                                Không có dữ liệu để hiển thị
                            </div>
                        )}
                    </div>
                </div>

                {/* Bar Chart */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <Package size={18} className="text-purple-500" /> Top Tồn Kho
                    </h3>
                    <div className="h-[256px] w-full min-w-0">
                        {barData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barData} layout="vertical">
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                                    <Tooltip cursor={{ fill: 'transparent' }} />
                                    <Bar dataKey="soluong" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">
                                Không có dữ liệu
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Warning List */}
            {nearExpiredCount > 0 && (
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                    <h4 className="flex items-center gap-2 text-amber-800 font-semibold mb-2">
                        <AlertTriangle size={18} /> Cảnh báo cần xử lý gấp
                    </h4>
                    <div className="space-y-2">
                        <p className="text-sm text-amber-700">
                            Có <span className="font-bold">{nearExpiredCount}</span> lô hàng sắp hết hạn trong 30 ngày và <span className="font-bold">{expiredCount}</span> lô đã hết hạn. Vui lòng kiểm tra tab "Kho Hàng".
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};



export default Dashboard;
