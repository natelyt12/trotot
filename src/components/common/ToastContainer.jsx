import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../../context/NotificationContext';
import AppIcon from '../common/AppIcon';

const ToastItem = ({ id, message, type, duration, onRemove }) => {
    useEffect(() => {
        if (duration) {
            const timer = setTimeout(() => {
                onRemove(id);
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [id, duration, onRemove]);

    const styles = {
        success: 'bg-emerald-500 text-white border-emerald-600',
        error: 'bg-rose-500 text-white border-rose-600',
        info: 'bg-white text-stone-800 border-stone-200 shadow-xl'
    };

    const icons = {
        success: <AppIcon name="check" size={18} strokeWidth={3} />,
        error: <AppIcon name="x" size={18} strokeWidth={3} />,
        info: <AppIcon name="info" size={18} strokeWidth={3} />
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl border min-w-[280px] max-w-md shadow-2xl ${styles[type] || styles.info}`}
        >
            <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${type === 'info' ? 'bg-stone-100 text-stone-500' : 'bg-white/20 text-white'}`}>
                {icons[type]}
            </div>
            <p className="text-[0.95rem] font-bold leading-snug">{message}</p>
            <button
                onClick={() => onRemove(id)}
                className="ml-auto bg-transparent border-none p-1 cursor-pointer opacity-50 hover:opacity-100 transition-opacity"
            >
                <AppIcon name="x" size={14} />
            </button>
        </motion.div>
    );
};

export default function ToastContainer() {
    const { notifications, removeNotification } = useNotification();

    return (
        <div className="fixed bottom-6 right-6 z-10 flex flex-col gap-3 items-end pointer-events-none">
            <AnimatePresence mode="popLayout">
                {notifications.map((n) => (
                    <div key={n.id} className="pointer-events-auto">
                        <ToastItem {...n} onRemove={removeNotification} />
                    </div>
                ))}
            </AnimatePresence>
        </div>
    );
}
