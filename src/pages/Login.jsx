import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, ArrowRight, Lock, User } from 'lucide-react';

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await onLogin(username, password);
        } catch (err) {
            setError(err.message || 'Đăng nhập thất bại');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-['Inter',system-ui,sans-serif]">
            {/* Background Decoration */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-30%] left-[-20%] w-[60%] h-[60%] bg-emerald-500/10 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-30%] right-[-20%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[150px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-md bg-slate-800/80 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-black/30 border border-slate-700/50 p-8 md:p-10 relative z-10"
            >
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
                        className="mx-auto mb-5"
                    >
                        <img src="/logo.png" alt="Logo" className="w-20 h-20 rounded-2xl object-cover shadow-xl mx-auto" />
                    </motion.div>
                    <h1 className="text-2xl font-bold text-white tracking-tight mb-2">hehehe</h1>
                    <p className="text-slate-400 font-medium text-sm">Đăng nhập để tiếp tục</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">Tài khoản</label>
                        <div className="relative group">
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:bg-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium outline-none"
                                placeholder="Username"
                                autoFocus
                            />
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={20} />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">Mật khẩu</label>
                        <div className="relative group">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:bg-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium outline-none"
                                placeholder="••••••••"
                            />
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" size={20} />
                        </div>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-center"
                        >
                            <p className="text-sm font-medium text-red-400">{error}</p>
                        </motion.div>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={isLoading || !username || !password}
                        className="w-full py-4 bg-emerald-500 text-white rounded-xl text-base font-bold shadow-xl shadow-emerald-500/25 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 mt-6"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
                            <>
                                <span>Đăng nhập</span>
                                <ArrowRight size={18} />
                            </>
                        )}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
};

export default Login;
