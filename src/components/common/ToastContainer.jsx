import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotification } from "../../context/NotificationContext";
import AppIcon from "../common/AppIcon";

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
        success: "bg-white text-stone-900 border-stone-200/80 shadow-green-500/5",
        error: "bg-white text-stone-900 border-stone-200/80 shadow-red-500/5",
        info: "bg-white text-stone-900 border-stone-200/80 shadow-blue-500/5",
    };

    const iconBg = {
        success: "bg-green-50 text-green-600 border border-green-100",
        error: "bg-red-50 text-red-600 border border-red-100",
        info: "bg-blue-50 text-blue-600 border border-blue-100",
    };

    const icons = {
        success: <AppIcon name="check" size={14} strokeWidth={3} />,
        error: <AppIcon name="x" size={14} strokeWidth={3} />,
        info: <AppIcon name="info" size={14} strokeWidth={3} />,
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 80, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 80, scale: 0.95, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className={`flex items-center gap-3.5 p-4 rounded-2xl border w-full md:w-[360px] shadow-2xl pointer-events-auto ${styles[type] || styles.info}`}
        >
            <div className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${iconBg[type]}`}>
                {icons[type]}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold leading-tight text-stone-800">{message}</p>
            </div>
            <button
                onClick={() => onRemove(id)}
                className="shrink-0 bg-transparent border-none p-1 cursor-pointer text-stone-400 hover:text-stone-700 transition-colors"
            >
                <AppIcon name="x" size={14} strokeWidth={2.5} />
            </button>
        </motion.div>
    );
};

export default function ToastContainer() {
    const { notifications, removeNotification } = useNotification();

    return (
        <div className="fixed bottom-24 left-4 right-4 md:bottom-6 md:right-6 md:left-auto md:transform-none z-[9999] flex flex-col gap-2.5 items-center md:items-end pointer-events-none w-[calc(100%-2rem)] md:w-auto">
            <AnimatePresence mode="popLayout">
                {notifications.map((n) => (
                    <div key={n.id} className="w-full md:w-auto">
                        <ToastItem {...n} onRemove={removeNotification} />
                    </div>
                ))}
            </AnimatePresence>
        </div>
    );
}
