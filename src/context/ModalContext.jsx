/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GlobalModal from "../components/common/GlobalModal";

const ModalContext = createContext(null);

export const ModalProvider = ({ children }) => {
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: "",
        message: "",
        type: "info", // 'info', 'success', 'error', 'warning'
        onConfirm: null,
        onCancel: null,
        confirmText: "Đóng",
        cancelText: null,
    });

    const [progressConfig, setProgressConfig] = useState({
        active: false,
        percent: 0,
        message: "",
    });

    /**
     * showModal - Hiển thị thông báo thay thế alert/confirm
     * @param {Object} config - { title, message, type, onConfirm, onCancel, confirmText, cancelText }
     */
    const showModal = useCallback((config) => {
        setModalConfig({
            isOpen: true,
            title: config.title || "Thông báo",
            message: config.message || "",
            type: config.type || "info",
            onConfirm: config.onConfirm || null,
            onCancel: config.onCancel || null,
            confirmText: config.confirmText || "Đóng",
            cancelText: config.cancelText || null,
        });
    }, []);

    const closeModal = useCallback(() => {
        setModalConfig((prev) => ({ ...prev, isOpen: false }));
    }, []);

    /**
     * Progress Modal Controls
     */
    const showProgress = useCallback((message, percent = 0) => {
        setProgressConfig({
            active: true,
            percent,
            message,
        });
    }, []);

    const updateProgress = useCallback((percent, message) => {
        setProgressConfig((prev) => ({
            ...prev,
            percent,
            message: message !== undefined ? message : prev.message,
        }));
    }, []);

    const hideProgress = useCallback(() => {
        setProgressConfig({
            active: false,
            percent: 0,
            message: "",
        });
    }, []);

    return (
        <ModalContext.Provider value={{ showModal, closeModal, showProgress, updateProgress, hideProgress }}>
            {children}
            <GlobalModal config={modalConfig} onClose={closeModal} />

            {/* Global premium circular progress overlay */}
            <AnimatePresence>
                {progressConfig.active && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm flex flex-col items-center text-center space-y-4 border border-stone-100"
                        >
                            {/* Animated Loading Ring */}
                            <div className="relative w-16 h-16 flex items-center justify-center">
                                <div className="absolute inset-0 rounded-full border-4 border-stone-100" />
                                <svg className="absolute w-full h-full transform -rotate-90">
                                    <circle
                                        cx="32"
                                        cy="32"
                                        r="28"
                                        className="stroke-amber-500 fill-none"
                                        strokeWidth="4"
                                        strokeDasharray={`${2 * Math.PI * 28}`}
                                        strokeDashoffset={`${2 * Math.PI * 28 * (1 - progressConfig.percent / 100)}`}
                                        strokeLinecap="round"
                                        style={{ transition: "stroke-dashoffset 0.3s ease-in-out" }}
                                    />
                                </svg>
                                <span className="text-sm font-bold text-stone-800">{progressConfig.percent}%</span>
                            </div>

                            <div className="space-y-1 w-full">
                                <h4 className="font-medium text-stone-950 text-sm">Đang xử lý dữ liệu</h4>
                                <p className="text-xs text-stone-500 font-normal h-4 overflow-hidden truncate">
                                    {progressConfig.message}
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </ModalContext.Provider>
    );
};

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error("useModal must be used within a ModalProvider");
    }
    return context;
};
