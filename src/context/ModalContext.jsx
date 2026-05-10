import React, { createContext, useContext, useState, useCallback } from 'react';
import GlobalModal from '../components/common/GlobalModal';

const ModalContext = createContext(null);

export const ModalProvider = ({ children }) => {
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info', // 'info', 'success', 'error', 'warning'
        onConfirm: null,
        confirmText: 'Đóng',
        cancelText: null,
    });

    /**
     * showModal - Hiển thị thông báo thay thế alert/confirm
     * @param {Object} config - { title, message, type, onConfirm, confirmText, cancelText }
     */
    const showModal = useCallback((config) => {
        setModalConfig({
            isOpen: true,
            title: config.title || 'Thông báo',
            message: config.message || '',
            type: config.type || 'info',
            onConfirm: config.onConfirm || null,
            confirmText: config.confirmText || 'Đóng',
            cancelText: config.cancelText || null,
        });
    }, []);

    const closeModal = useCallback(() => {
        setModalConfig(prev => ({ ...prev, isOpen: false }));
    }, []);

    return (
        <ModalContext.Provider value={{ showModal, closeModal }}>
            {children}
            <GlobalModal config={modalConfig} onClose={closeModal} />
        </ModalContext.Provider>
    );
};

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
};
