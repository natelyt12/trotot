import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RoomFilters from './RoomFilters.jsx';
import AppIcon from '../common/AppIcon.jsx';

/**
 * MobileFilterModal - iOS style slide-up modal
 * Simple slide up/down with no drag, expoOut easing, and no blur on backdrop.
 */
export default function MobileFilterModal({
    isOpen,
    onClose,
    filters,
    updateFilter,
    resetFilters,
    toggleAmenity,
    activeFilterCount,
    highlightedField,
    refetch
}) {
    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-150 flex items-end justify-center">
                    {/* Backdrop - No blur, just dark */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 bg-stone-900/60"
                        onClick={onClose}
                    />

                    {/* Modal Content (Bottom Sheet) - No drag, expoOut easing */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.6 }}
                        className="relative w-full max-w-2xl bg-stone-50 rounded-t-2xl shadow-2xl flex flex-col overflow-hidden"
                        style={{ maxHeight: '92vh' }}
                    >
                        {/* Drag Handle Bar (Visual only now) */}
                        <div className="flex justify-center py-4 shrink-0">
                            <div className="w-12 h-1.5 bg-stone-300 rounded-full" />
                        </div>

                        {/* Header */}
                        <div className="px-6 pb-4 flex justify-between items-center border-b border-stone-200 shrink-0">
                            <div>
                                <h2 className="text-xl font-extrabold text-stone-900 m-0 font-heading">Bộ lọc tìm kiếm</h2>
                                <p className="text-stone-500 text-xs font-medium m-0 mt-0.5">Tùy chỉnh để tìm phòng phù hợp nhất</p>
                            </div>
                            <div className="flex items-center gap-4">
                                {activeFilterCount > 0 && (
                                    <button
                                        onClick={resetFilters}
                                        className="bg-transparent border-none text-amber-600 text-sm font-semibold cursor-pointer hover:text-amber-700 transition-colors duration-200"
                                    >
                                        Xóa tất cả
                                    </button>
                                )}
                                <button
                                    onClick={onClose}
                                    className="w-10 h-10 bg-white border border-stone-200 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-600 transition-all cursor-pointer"
                                >
                                    <AppIcon name="close" size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Filter Content */}
                        <div className="flex-1 overflow-y-auto p-6 pb-32 scrollbar-hide">
                            <RoomFilters
                                filters={filters}
                                updateFilter={updateFilter}
                                resetFilters={resetFilters}
                                toggleAmenity={toggleAmenity}
                                activeFilterCount={activeFilterCount}
                                highlightedField={highlightedField}
                                isMobileMode={true}
                                refetch={refetch}
                            />
                        </div>

                        {/* Footer Action */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-center bg-linear-to-t from-stone-50 via-stone-50 to-transparent pointer-events-none">
                            <button
                                onClick={onClose}
                                className="px-8 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-full font-bold transition-all pointer-events-auto cursor-pointer border-none"
                            >
                                Xem kết quả ({activeFilterCount > 0 ? `Đã chọn ${activeFilterCount}` : 'Tất cả'})
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
