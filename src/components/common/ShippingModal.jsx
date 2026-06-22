import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AppIcon from './AppIcon';
import { useNotification } from '../../context/NotificationContext';

const SHIPPING_PROVIDERS = [
    { id: 'ahamove', name: 'Ahamove', logo: 'https://placehold.co/100x40/FF5A00/FFF?text=Ahamove' },
    { id: 'lalamove', name: 'Lalamove', logo: 'https://placehold.co/100x40/F16522/FFF?text=Lalamove' },
    { id: 'ghtk', name: 'Giao Hàng Tiết Kiệm', logo: 'https://placehold.co/100x40/009140/FFF?text=GHTK' },
    { id: 'viettel', name: 'Viettel Post', logo: 'https://placehold.co/100x40/EE0033/FFF?text=Viettel' },
];

export default function ShippingModal({ isOpen, onSuccess, onClose, skipText = "Tự vận chuyển (Bỏ qua)" }) {
    const { addNotification } = useNotification();
    const [selectedId, setSelectedId] = useState('');
    const [loading, setLoading] = useState(false);

    const selectedProvider = SHIPPING_PROVIDERS.find(p => p.id === selectedId);

    const handleConfirm = () => {
        if (!selectedProvider) return;
        setLoading(true);
        addNotification(`Đã thông báo cho đơn vị vận chuyển ${selectedProvider.name}`, "info");
        
        setTimeout(() => {
            addNotification("Đơn vị vận chuyển đã nhận yêu cầu thành công", "success");
            setLoading(false);
            onSuccess(selectedProvider);
            setSelectedId(''); // Reset state for next time
        }, 3000);
    };

    const handleSkip = () => {
        onSuccess(null); // Return null indicates skipped
        setSelectedId(''); // Reset state
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-stone-900/60"
                    onClick={onClose}
                />
                
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
                >
                    <div className="p-6 border-b border-stone-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                                <AppIcon name="home" size={20} />
                            </div>
                            <h3 className="text-lg font-semibold text-stone-900">Chọn đơn vị vận chuyển</h3>
                        </div>
                        {onClose && (
                            <button 
                                onClick={onClose}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors border-none bg-transparent cursor-pointer"
                            >
                                <AppIcon name="x" size={20} />
                            </button>
                        )}
                    </div>

                    <div className="p-6">
                        <p className="text-stone-500 text-sm mb-4">
                            Bạn có muốn thuê đơn vị vận chuyển bên thứ ba để hỗ trợ chuyển đồ không? Vui lòng chọn bên dưới.
                        </p>

                        {/* Provider List */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-stone-700 mb-3">Đơn vị vận chuyển</label>
                            <div className="grid grid-cols-2 gap-3">
                                {SHIPPING_PROVIDERS.map((provider) => (
                                    <button
                                        key={provider.id}
                                        type="button"
                                        onClick={() => setSelectedId(provider.id)}
                                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                                            selectedId === provider.id 
                                                ? 'border-amber-500 bg-amber-50/50 shadow-sm' 
                                                : 'border-stone-100 hover:border-amber-200 hover:bg-stone-50 bg-white'
                                        }`}
                                    >
                                        <div className="h-10 w-full flex items-center justify-center mb-2">
                                            <img src={provider.logo} alt={provider.name} className="max-h-full max-w-full object-contain" />
                                        </div>
                                        <span className={`text-xs font-medium text-center ${selectedId === provider.id ? 'text-amber-700' : 'text-stone-600'}`}>
                                            {provider.name}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 mt-6">
                            <button
                                onClick={handleConfirm}
                                disabled={!selectedId || loading}
                                className="w-full py-3.5 rounded-xl font-medium text-sm bg-amber-500 text-white cursor-pointer hover:bg-amber-600 transition-colors border-none shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <span>Xác nhận chọn</span>
                                )}
                            </button>
                            <button
                                onClick={handleSkip}
                                disabled={loading}
                                className="w-full py-3.5 rounded-xl font-medium text-sm bg-stone-100 text-stone-600 cursor-pointer hover:bg-stone-200 transition-colors border-none disabled:opacity-50"
                            >
                                {skipText}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
