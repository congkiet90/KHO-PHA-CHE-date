import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Calendar, X, Check } from 'lucide-react';

// Haptic feedback helper
const triggerHaptic = () => {
    if (navigator.vibrate) {
        navigator.vibrate(5); // Very light vibration (5ms)
    }
};

// iOS-style wheel picker component
const WheelColumn = ({ items, value, onChange, label }) => {
    const containerRef = useRef(null);
    const lastValueRef = useRef(value);
    const itemHeight = 44;
    const visibleItems = 5;
    const centerOffset = Math.floor(visibleItems / 2) * itemHeight;

    const selectedIndex = items.findIndex(item => item.value === value);

    useEffect(() => {
        if (containerRef.current && selectedIndex >= 0) {
            containerRef.current.scrollTop = selectedIndex * itemHeight;
        }
    }, []);

    const handleScroll = useCallback(() => {
        if (!containerRef.current) return;
        const scrollTop = containerRef.current.scrollTop;
        const newIndex = Math.round(scrollTop / itemHeight);
        const clampedIndex = Math.max(0, Math.min(newIndex, items.length - 1));

        if (items[clampedIndex] && items[clampedIndex].value !== lastValueRef.current) {
            lastValueRef.current = items[clampedIndex].value;
            triggerHaptic(); // Vibrate on each number change
            onChange(items[clampedIndex].value);
        }
    }, [items, onChange]);

    const scrollToIndex = (index) => {
        if (containerRef.current) {
            triggerHaptic();
            containerRef.current.scrollTo({
                top: index * itemHeight,
                behavior: 'smooth'
            });
        }
    };

    // Prevent page scroll when touching this area
    const handleTouchStart = (e) => {
        e.stopPropagation();
    };

    return (
        <div className="flex-1 relative touch-pan-y" onTouchStart={handleTouchStart}>
            <div className="text-center text-xs font-semibold text-stone-400 mb-2 uppercase tracking-wider">
                {label}
            </div>
            <div className="relative h-[220px] overflow-hidden">
                {/* Selection highlight - behind everything */}
                <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-[44px] bg-stone-100 rounded-xl" style={{ zIndex: 1 }} />

                {/* Scrollable list - above highlight, full width touch area */}
                <div
                    ref={containerRef}
                    onScroll={handleScroll}
                    className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide relative overscroll-contain"
                    style={{
                        scrollSnapType: 'y mandatory',
                        paddingTop: centerOffset,
                        paddingBottom: centerOffset,
                        zIndex: 2,
                        WebkitOverflowScrolling: 'touch'
                    }}
                >
                    {items.map((item, index) => {
                        const isSelected = item.value === value;
                        return (
                            <div
                                key={item.value}
                                onClick={() => scrollToIndex(index)}
                                className={`h-[44px] flex items-center justify-center cursor-pointer transition-all duration-200 snap-center select-none ${isSelected
                                    ? 'text-black font-bold text-xl'
                                    : 'text-stone-400 text-lg'
                                    }`}
                                style={{ scrollSnapAlign: 'center' }}
                            >
                                {item.label}
                            </div>
                        );
                    })}
                </div>

                {/* Gradient overlays - on top */}
                <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white to-transparent pointer-events-none" style={{ zIndex: 3 }} />
                <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none" style={{ zIndex: 3 }} />
            </div>
        </div>
    );
};

const DateWheelPicker = ({ value, onChange, placeholder = "Chọn ngày" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [tempDate, setTempDate] = useState({ day: 1, month: 1, year: 2025 });

    // Parse current value
    useEffect(() => {
        if (value) {
            const date = new Date(value);
            if (!isNaN(date.getTime())) {
                setTempDate({
                    day: date.getDate(),
                    month: date.getMonth() + 1,
                    year: date.getFullYear()
                });
            }
        } else {
            // Default to today
            const today = new Date();
            setTempDate({
                day: today.getDate(),
                month: today.getMonth() + 1,
                year: today.getFullYear()
            });
        }
    }, [value, isOpen]);

    // Generate options
    const days = Array.from({ length: 31 }, (_, i) => ({
        value: i + 1,
        label: String(i + 1).padStart(2, '0')
    }));

    const months = [
        { value: 1, label: 'Th1' },
        { value: 2, label: 'Th2' },
        { value: 3, label: 'Th3' },
        { value: 4, label: 'Th4' },
        { value: 5, label: 'Th5' },
        { value: 6, label: 'Th6' },
        { value: 7, label: 'Th7' },
        { value: 8, label: 'Th8' },
        { value: 9, label: 'Th9' },
        { value: 10, label: 'Th10' },
        { value: 11, label: 'Th11' },
        { value: 12, label: 'Th12' }
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => ({
        value: currentYear + i - 2,
        label: String(currentYear + i - 2)
    }));

    const handleConfirm = () => {
        // Validate day for month
        const maxDay = new Date(tempDate.year, tempDate.month, 0).getDate();
        const validDay = Math.min(tempDate.day, maxDay);

        const dateStr = `${tempDate.year}-${String(tempDate.month).padStart(2, '0')}-${String(validDay).padStart(2, '0')}`;
        onChange(dateStr);
        setIsOpen(false);
    };

    const formatDisplay = () => {
        if (!value) return placeholder;
        const date = new Date(value);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-left flex items-center justify-between gap-2 hover:bg-stone-100 transition-colors"
            >
                <span className={value ? 'text-black font-medium' : 'text-stone-400'}>
                    {formatDisplay()}
                </span>
                <Calendar size={18} className="text-stone-400" />
            </button>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Picker Panel */}
                    <div className="relative bg-white rounded-t-[28px] md:rounded-[28px] w-full md:max-w-sm shadow-2xl animate-in slide-in-from-bottom duration-300">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-stone-100">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 -m-2 text-stone-400 hover:text-stone-600"
                            >
                                <X size={20} />
                            </button>
                            <h3 className="font-bold text-black">Chọn Ngày HSD</h3>
                            <button
                                onClick={handleConfirm}
                                className="p-2 -m-2 text-blue-600 hover:text-blue-700"
                            >
                                <Check size={20} strokeWidth={2.5} />
                            </button>
                        </div>

                        {/* Wheel Pickers */}
                        <div className="flex gap-2 p-4">
                            <WheelColumn
                                items={days}
                                value={tempDate.day}
                                onChange={(day) => setTempDate(prev => ({ ...prev, day }))}
                                label="Ngày"
                            />
                            <WheelColumn
                                items={months}
                                value={tempDate.month}
                                onChange={(month) => setTempDate(prev => ({ ...prev, month }))}
                                label="Tháng"
                            />
                            <WheelColumn
                                items={years}
                                value={tempDate.year}
                                onChange={(year) => setTempDate(prev => ({ ...prev, year }))}
                                label="Năm"
                            />
                        </div>

                        {/* Confirm Button */}
                        <div className="p-4 pt-0">
                            <button
                                onClick={handleConfirm}
                                className="w-full py-4 bg-black text-white font-bold rounded-2xl hover:bg-stone-800 transition-colors"
                            >
                                Xác nhận
                            </button>
                        </div>

                        {/* Safe area for iPhone */}
                        <div className="h-6 md:hidden" />
                    </div>
                </div>
            )}

            {/* Hide scrollbar style */}
            <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </>
    );
};

export default DateWheelPicker;
