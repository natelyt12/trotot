import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RoomFilters from './RoomFilters.jsx';
import AppIcon from '../common/AppIcon.jsx';

/**
 * MobileFilterModal - iOS style slide-up modal with Framer Motion gestures
 */
export default function MobileFilterModal({
    isOpen,
    onClose,
    filters,
    updateFilter,
    resetFilters,
    toggleAmenity,
    activeFilterCount,
    highlightedField
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
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal Content (Bottom Sheet) */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        drag="y"
                        dragConstraints={{ top: 0 }}
                        dragElastic={0.2}
                        onDragEnd={(e, info) => {
                            if (info.offset.y > 150) {
                                onClose();
                            }
                        }}
                        className="relative w-full max-w-2xl bg-stone-50 rounded-t-2xl shadow-2xl flex flex-col overflow-hidden"
                        style={{ maxHeight: '92vh' }}
                    >
                        {/* Drag Handle Bar */}
                        <div className="flex justify-center py-4 shrink-0 cursor-grab active:cursor-grabbing">
                            <div className="w-12 h-1.5 bg-stone-300 rounded-full" />
                        </div>

                        {/* Header */}
                        <div className="px-6 pb-4 flex justify-between items-center border-b border-stone-200 shrink-0">
                            <div>
                                <h2 className="text-xl font-extrabold text-stone-900 m-0 font-heading">Bộ lọc tìm kiếm</h2>
                                <p className="text-stone-500 text-xs font-medium m-0 mt-0.5">Tùy chỉnh để tìm phòng phù hợp nhất</p>
                            </div>
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={onClose}
                                className="w-10 h-10 bg-white border border-stone-200 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-600 transition-all cursor-pointer"
                            >
                                <AppIcon name="close" size={20} />
                            </motion.button>
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
                            />
                        </div>

                        {/* Footer Action */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 bg-linear-to-t from-stone-50 via-stone-50 to-transparent pointer-events-none">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onClose}
                                className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold shadow-lg shadow-amber-500/30 transition-all pointer-events-auto cursor-pointer"
                            >
                                Xem kết quả ({activeFilterCount > 0 ? `Đã chọn ${activeFilterCount}` : 'Tất cả'})
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
