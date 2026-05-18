import React from 'react';
import { TbAlertCircle, TbCheck, TbInfoCircle, TbAlertTriangle } from 'react-icons/tb';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * GlobalModal - Modern modal component for global alerts/confirmations
 * Styled with iOS-style slide-up animation, no blur on backdrop.
 */
export default function GlobalModal({ config, onClose }) {
    const { isOpen, title, message, type, onConfirm, confirmText, cancelText } = config;

    const getIcon = () => {
        const iconSize = 32;
        switch (type) {
            case 'success': return <TbCheck size={iconSize} className="text-green-500" />;
            case 'error': return <TbAlertCircle size={iconSize} className="text-red-500" />;
            case 'warning': return <TbAlertTriangle size={iconSize} className="text-amber-500" />;
            default: return <TbInfoCircle size={iconSize} className="text-blue-500" />;
        }
    };

    const getTypeColor = () => {
        switch (type) {
            case 'success': return 'bg-green-50';
            case 'error': return 'bg-red-50';
            case 'warning': return 'bg-amber-50';
            default: return 'bg-blue-50';
        }
    };

    const handleConfirm = () => {
        if (onConfirm) onConfirm();
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center">
                    {/* Backdrop - No blur, just dark */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 bg-stone-900/60"
                        onClick={onClose}
                    />

                    {/* Modal Content - Slide up with expoOut */}
                    <motion.div
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.6 }}
                        className="relative w-full max-w-[360px] bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col overflow-hidden mt-auto sm:mt-0"
                    >
                        {/* Drag Handle Bar (Visual only on mobile) */}
                        <div className="flex justify-center py-3 shrink-0 sm:hidden">
                            <div className="w-12 h-1.5 bg-stone-300 rounded-full" />
                        </div>

                        <div className="p-8">
                            {/* Icon Header */}
                            <div className="flex justify-center mb-5">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${getTypeColor()}`}>
                                    {getIcon()}
                                </div>
                            </div>

                            <div className="text-center">
                                <h3 className="text-xl font-extrabold text-stone-900 mb-2 font-heading">
                                    {title}
                                </h3>
                                <p className="text-stone-500 text-[0.9rem] leading-relaxed mb-8 px-2 font-medium whitespace-pre-wrap">
                                    {message}
                                </p>
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={handleConfirm}
                                    className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all cursor-pointer border-none shadow-lg shadow-amber-500/20 ${
                                        type === 'error' ? 'bg-red-500 hover:bg-red-600' : 'bg-amber-500 hover:bg-amber-600'
                                    } text-white`}
                                >
                                    {confirmText}
                                </button>
                                
                                {cancelText && (
                                    <button
                                        onClick={onClose}
                                        className="w-full py-3.5 rounded-xl font-bold text-sm text-stone-600 bg-stone-50 hover:bg-stone-100 transition-all cursor-pointer border-none"
                                    >
                                        {cancelText}
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
