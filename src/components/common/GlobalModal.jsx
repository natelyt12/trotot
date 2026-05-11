import React, { useEffect, useState } from 'react';
import { TbAlertCircle, TbCheck, TbInfoCircle, TbAlertTriangle } from 'react-icons/tb';

/**
 * GlobalModal - Modern modal component for global alerts/confirmations
 */
export default function GlobalModal({ config, onClose }) {
    const { isOpen, title, message, type, onConfirm, confirmText, cancelText } = config;
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsAnimating(true);
        } else {
            // Delay unmounting to allow animation to finish
            const timer = setTimeout(() => setIsAnimating(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isOpen && !isAnimating) return null;

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
        <div 
            className={`fixed inset-0 z-100 flex items-center justify-center p-4 transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        >
            {/* Scroll lock while alert is open */}
            {isOpen && (
                <style>{`html { overflow: hidden !important; }`}</style>
            )}
            
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
                onClick={cancelText ? onClose : handleConfirm}
            />

            {/* Modal Content */}
            <div 
                className={`relative w-full max-w-[320px] bg-white rounded-3xl border border-stone-100 overflow-hidden ${isOpen ? 'animate-modal-pop' : 'opacity-0 scale-95'}`}
            >
                <div className="p-6">
                    {/* Icon Header */}
                    <div className="flex justify-center mb-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${getTypeColor()}`}>
                            {getIcon()}
                        </div>
                    </div>

                    <div className="text-center">
                        <h3 className="text-lg font-bold text-stone-900 mb-1.5 font-heading">
                            {title}
                        </h3>
                        <p className="text-stone-500 text-[0.85rem] leading-relaxed mb-6 px-2">
                            {message}
                        </p>
                    </div>

                    <div className="flex flex-col gap-2">
                        <button
                            onClick={handleConfirm}
                            className={`w-full py-3 rounded-full font-bold text-sm transition-all active:scale-95 cursor-pointer border-none ${
                                type === 'error' ? 'bg-red-500 hover:bg-red-600' : 'bg-amber-500 hover:bg-amber-600'
                            } text-white`}
                        >
                            {confirmText}
                        </button>
                        
                        {cancelText && (
                            <button
                                onClick={onClose}
                                className="w-full py-3 rounded-full font-bold text-sm text-stone-600 bg-stone-100 hover:bg-stone-200 transition-all cursor-pointer border-none"
                            >
                                {cancelText}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
