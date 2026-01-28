import React from 'react';
import { LayoutGrid, Plus, History, Box, LogOut, ShieldCheck, UserCircle, Users, Package, Key, Search } from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = ({ currentView, setView, user, onLogout, onChangePasswordClick }) => {
    const menuItems = [
        { id: 'dashboard', icon: LayoutGrid, label: 'Tổng Quan' },
        { id: 'scan', icon: Plus, label: 'Nhập / Xuất' },
        { id: 'summary', icon: Box, label: 'Kho Chi Tiết' },
        { id: 'history', icon: History, label: 'Lịch Sử' },
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 hidden md:flex flex-col z-50">
            {/* Header */}
            <div className="p-6 pb-4">
                <div className="flex items-center gap-3">
                    <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-xl object-cover" />
                    <div>
                        <h1 className="font-bold text-lg text-white tracking-tight leading-none">Kho Pha Chế</h1>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">Quản lý tồn kho</p>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="px-4 mb-2">
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm..."
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-slate-300 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                    />
                </div>
            </div>

            {/* Menu */}
            <div className="px-3 py-4 flex-1 overflow-y-auto">
                <p className="px-3 text-[10px] font-semibold uppercase text-slate-500 mb-2 tracking-wider">Menu</p>
                <div className="space-y-1">
                    {menuItems.map((item) => {
                        const isActive = currentView === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setView(item.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive
                                    ? 'bg-emerald-500 text-white'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                <item.icon size={18} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-emerald-400'} />
                                <span className="text-sm font-medium">{item.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Management Section */}
                {(user?.role === 'admin' || user?.role === 'manager') && (
                    <div className="mt-6">
                        <p className="px-3 text-[10px] font-semibold uppercase text-slate-500 mb-2 tracking-wider">Quản Trị</p>
                        <div className="space-y-1">
                            <button
                                onClick={() => setView('manage-products')}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${currentView === 'manage-products'
                                    ? 'bg-emerald-500 text-white'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                <Package size={18} className={currentView === 'manage-products' ? 'text-white' : 'text-slate-500 group-hover:text-emerald-400'} />
                                <span className="text-sm font-medium">Sản Phẩm</span>
                            </button>

                            <button
                                onClick={() => setView('manage-users')}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${currentView === 'manage-users'
                                    ? 'bg-emerald-500 text-white'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                <Users size={18} className={currentView === 'manage-users' ? 'text-white' : 'text-slate-500 group-hover:text-emerald-400'} />
                                <span className="text-sm font-medium">Nhân Sự</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* User Footer */}
            <div className="p-4 border-t border-slate-800">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
                        <UserCircle size={22} className="text-slate-400" />
                    </div>
                    <div className="overflow-hidden flex-1">
                        <div className="font-medium text-sm text-white truncate">{user?.name}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                            {user?.role === 'admin' && <ShieldCheck size={10} className="text-emerald-400" />}
                            {user?.role === 'admin' ? 'Admin' : user?.role === 'manager' ? 'Manager' : 'Staff'}
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={onChangePasswordClick}
                        className="flex-1 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-medium text-slate-400 hover:bg-slate-700 hover:text-white transition-colors flex items-center justify-center gap-1.5"
                        title="Đổi mật khẩu"
                    >
                        <Key size={14} />
                    </button>
                    <button
                        onClick={onLogout}
                        className="flex-[2] py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-medium text-slate-400 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-colors flex items-center justify-center gap-1.5"
                    >
                        <LogOut size={14} /> Đăng Xuất
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
