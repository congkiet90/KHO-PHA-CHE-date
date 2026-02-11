import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { getDeepInsights } from '../services/GeminiService';
import { motion } from 'framer-motion';

const AIInsights = ({ inventorySummary }) => {
    const [insights, setInsights] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchInsights = async () => {
        if (!inventorySummary || inventorySummary.length === 0 || loading) return;
        setLoading(true);
        const result = await getDeepInsights(inventorySummary);
        setInsights(result);
        setLoading(false);
    };

    // Removed automatic fetch to save quota
    // useEffect(() => {
    //     fetchInsights();
    // }, [inventorySummary]);

    return (
        <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-[32px] border border-indigo-100 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Sparkles size={20} className="text-indigo-500 animate-pulse" />
                    Nhận Xét Từ Thủ Kho AI
                </h3>
                <button
                    onClick={fetchInsights}
                    disabled={loading}
                    className="p-2 hover:bg-white rounded-full transition-colors text-slate-400 hover:text-indigo-500"
                >
                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                </button>
            </div>

            <div className="min-h-[100px] text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-3">
                        <Loader2 className="animate-spin text-indigo-500" />
                        <span className="text-xs font-medium text-slate-400">AI đang phân tích dữ liệu...</span>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        {insights || "Chưa có phân tích nào. Nhấn làm mới để bắt đầu."}
                    </motion.div>
                )}
            </div>

            {/* Decorative element */}
            <div className="absolute -right-4 -bottom-4 opacity-[0.05] pointer-events-none">
                <Sparkles size={120} />
            </div>
        </div>
    );
};

export default AIInsights;
