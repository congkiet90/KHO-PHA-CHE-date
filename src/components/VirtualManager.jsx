import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, Loader2, Minus, Maximize2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { askVirtualManager } from '../services/GeminiService';

const VirtualManager = ({ inventoryContext }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([
        { role: 'bot', text: 'Chào bạn! Tôi là Thủ Kho AI. Tôi đang trực chiến, bạn muốn kiểm tra hay hỏi gì về kho không?' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsLoading(true);

        const reply = await askVirtualManager(userMsg, inventoryContext);

        setMessages(prev => [...prev, { role: 'bot', text: reply }]);
        setIsLoading(false);
    };

    return (
        <div className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-[100]">
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0 }}
                        onClick={() => setIsOpen(true)}
                        className="w-14 h-14 bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95 group"
                    >
                        <Sparkles size={24} className="group-hover:animate-pulse" />
                    </motion.button>
                )}

                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            height: isMinimized ? 64 : 500
                        }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="bg-white rounded-[32px] shadow-2xl border border-black/5 w-[350px] overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Bot size={20} className="text-indigo-400" />
                                <span className="font-bold text-sm tracking-tight">Thủ Kho AI Trực Chiến</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <button onClick={() => setIsMinimized(!isMinimized)} className="p-1 hover:bg-white/10 rounded-lg">
                                    {isMinimized ? <Maximize2 size={16} /> : <Minus size={16} />}
                                </button>
                                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-lg">
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        {!isMinimized && (
                            <>
                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                                    {messages.map((msg, i) => (
                                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} `}>
                                            <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                                ? 'bg-black text-white rounded-br-none'
                                                : 'bg-white text-slate-700 border border-black/5 rounded-bl-none shadow-sm'
                                                }`}>
                                                {msg.text}
                                            </div>
                                        </div>
                                    ))}
                                    {isLoading && (
                                        <div className="flex justify-start italic text-slate-400 text-xs">
                                            <Loader2 size={12} className="animate-spin mr-1" /> AI đang soạn câu trả lời...
                                        </div>
                                    )}
                                    <div ref={chatEndRef} />
                                </div>

                                {/* Input */}
                                <form onSubmit={handleSend} className="p-4 border-t border-black/5 flex gap-2">
                                    <input
                                        value={input}
                                        onChange={e => setInput(e.target.value)}
                                        placeholder="Hỏi AI về kho hàng..."
                                        className="flex-1 border-none bg-slate-100 rounded-xl px-4 py-2 text-sm focus:ring-0"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!input.trim() || isLoading}
                                        className="bg-black text-white p-2 rounded-xl disabled:opacity-50"
                                    >
                                        <Send size={18} />
                                    </button>
                                </form>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default VirtualManager;
