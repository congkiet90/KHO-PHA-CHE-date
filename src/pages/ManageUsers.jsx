import React, { useState, useEffect } from 'react';
import { Loader2, Trash2, UserPlus, Shield, User } from 'lucide-react';

const ManageUsers = ({ isSyncing, API_URL, showStatus, currentUser }) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    // Form State
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [fullname, setFullname] = useState('');
    const [role, setRole] = useState('staff');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ loai: "GetUsers" })
            });
            const data = await response.json();
            setUsers(data);
        } catch (err) {
            showStatus('error', 'Lỗi tải danh sách users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreateUser = async (e) => {
        e.preventDefault();
        if (!username || !password || !fullname) return;

        setIsSubmitting(true);
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({
                    loai: "CreateUser",
                    username, password, fullname, role,
                    requestorRole: currentUser?.role
                })
            });
            const res = await response.json();
            if (res.status === 'success') {
                showStatus('success', 'Đã tạo tài khoản thành công');
                setUsername(''); setPassword(''); setFullname('');
                fetchUsers();
            } else {
                showStatus('error', res.message || 'Lỗi khi tạo user');
            }
        } catch (err) {
            showStatus('error', 'Lỗi kết nối');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteUser = async (uName, uRole) => {
        // Strict Frontend Check
        if (currentUser?.role !== 'admin' && uRole === 'admin') {
            showStatus('error', 'Bạn không có quyền xóa Admin');
            return;
        }

        if (!confirm(`Xóa tài khoản ${uName}?`)) return;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({
                    loai: "DeleteUser",
                    username: uName,
                    requestorRole: currentUser?.role
                })
            });
            const res = await response.json();
            if (res.status === 'success') {
                showStatus('success', 'Đã xóa tài khoản');
                fetchUsers();
            } else {
                showStatus('error', res.message || 'Lỗi khi xóa');
            }
        } catch (err) {
            showStatus('error', 'Lỗi kết nối');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-bold text-black flex items-center gap-2 tracking-tight">
                    <UserPlus size={24} className="text-black" /> Quản Lý Nhân Sự
                </h2>
                <p className="text-sm text-stone-500 mt-1 font-medium">Thêm hoặc xóa sự truy cập vào hệ thống</p>
                {currentUser?.role === 'manager' && (
                    <p className="text-xs text-orange-500 font-bold mt-1">* Giới hạn quyền: Chỉ tạo/xóa tài khoản Manager và Staff.</p>
                )}
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Form Creation */}
                <div className="md:col-span-1">
                    <div className="bg-white p-6 rounded-[24px] shadow-lg shadow-black/5 border border-stone-100 sticky top-4">
                        <h3 className="font-bold text-lg mb-4 text-black">Tạo Tài Khoản Mới</h3>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold uppercase text-stone-400 ml-1">Tên Đăng Nhập</label>
                                <input
                                    value={username} onChange={e => setUsername(e.target.value)}
                                    className="w-full p-3 bg-stone-50 rounded-xl border-none focus:ring-2 focus:ring-black/10 outline-none font-medium text-black placeholder:text-stone-300"
                                    placeholder="vd: staff01"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-stone-400 ml-1">Mật Khẩu</label>
                                <input
                                    value={password} onChange={e => setPassword(e.target.value)}
                                    type="text"
                                    className="w-full p-3 bg-stone-50 rounded-xl border-none focus:ring-2 focus:ring-black/10 outline-none font-medium text-black placeholder:text-stone-300"
                                    placeholder="Mật khẩu"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-stone-400 ml-1">Họ và Tên</label>
                                <input
                                    value={fullname} onChange={e => setFullname(e.target.value)}
                                    className="w-full p-3 bg-stone-50 rounded-xl border-none focus:ring-2 focus:ring-black/10 outline-none font-medium text-black placeholder:text-stone-300"
                                    placeholder="vd: Nguyễn Văn A"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-stone-400 ml-1">Quyền Hạn</label>
                                <select
                                    value={role} onChange={e => setRole(e.target.value)}
                                    className="w-full p-3 bg-stone-50 rounded-xl border-none focus:ring-2 focus:ring-black/10 outline-none font-medium text-black"
                                >
                                    <option value="staff">Nhân Viên (Staff)</option>
                                    <option value="manager">Quản Lý (Manager)</option>
                                    {currentUser?.role === 'admin' && (
                                        <option value="admin">Quản Trị Viên (Admin)</option>
                                    )}
                                </select>
                            </div>

                            <button
                                disabled={isSubmitting || !username || !password}
                                className="w-full py-3 bg-black text-white font-bold rounded-xl shadow-lg shadow-black/20 hover:bg-stone-800 disabled:opacity-50 transition-all"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : 'Tạo Tài Khoản'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* User List */}
                <div className="md:col-span-2">
                    <div className="bg-white rounded-[24px] shadow-sm border border-black/5 overflow-hidden">
                        {loading ? (
                            <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-stone-300" size={32} /></div>
                        ) : (
                            <table className="w-full text-left">
                                <thead className="bg-[#F5F5F7] text-[11px] font-bold uppercase tracking-wider text-stone-500 border-b border-black/5">
                                    <tr>
                                        <th className="px-6 py-4">Nhân Sự</th>
                                        <th className="px-6 py-4">Username</th>
                                        <th className="px-6 py-4">Quyền</th>
                                        <th className="px-6 py-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-black/5">
                                    {users.map((u, i) => (
                                        <tr key={i} className="hover:bg-stone-50 transition-colors group">
                                            <td className="px-6 py-4 font-bold text-black">{u.fullname}</td>
                                            <td className="px-6 py-4 text-stone-600 font-mono text-sm">{u.username}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-lg text-xs font-bold uppercase ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                                    u.role === 'manager' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-stone-100 text-stone-600'
                                                    }`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {/* Only show delete button if permission allows */
                                                    (
                                                        // You cannot delete yourself (simple check usually, but username might vary, assuming 'admin' is special)
                                                        // Admin can delete anyone (except 'admin' username typically?) - let backend handle specific 'admin' user protection if needed
                                                        // Logic: If I am NOT Admin, I CANNOT delete Admin.
                                                        !(currentUser?.role !== 'admin' && u.role === 'admin')
                                                    ) && (
                                                        <button
                                                            onClick={() => handleDeleteUser(u.username, u.role)}
                                                            className="p-2 text-stone-300 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                                                            title="Xóa user"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                            </td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && <tr className="text-center p-8 text-stone-400"><td colSpan={4}>Chưa có dữ liệu</td></tr>}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageUsers;
