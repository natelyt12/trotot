import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AppIcon from "./AppIcon";

/**
 * BaseModal - A unified modal wrapper using framer-motion
 * Handles backdrop, animations, and common layout
 */
export default function BaseModal({ isOpen, onClose, children, title, showClose = true, maxWidth = "max-w-md", fullHeightMobile = true }) {
    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-200 flex items-center justify-center p-0 sm:p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className={`relative w-full ${maxWidth} bg-white 
                            ${fullHeightMobile ? "h-[92vh] sm:h-auto" : "h-auto"} 
                            sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col 
                            mt-auto sm:mt-0`}
                    >
                        {/* Header if title exists */}
                        {(title || showClose) && (
                            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 shrink-0">
                                {title ? <h3 className="text-lg font-bold text-stone-900 font-heading">{title}</h3> : <div />}

                                {showClose && (
                                    <button
                                        onClick={onClose}
                                        className="p-2 hover:bg-stone-100 rounded-full transition-colors cursor-pointer border-none text-stone-400 hover:text-stone-900"
                                    >
                                        <AppIcon name="close" size={20} />
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto">{children}</div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
