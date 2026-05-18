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
        success: "bg-green-50 text-green-700 border-green-100",
        error: "bg-red-50 text-red-700 border-red-100",
        info: "bg-blue-50 text-blue-700 border-blue-100",
    };

    const icons = {
        success: <AppIcon name="check" size={14} strokeWidth={3} />,
        error: <AppIcon name="x" size={14} strokeWidth={3} />,
        info: <AppIcon name="info" size={14} strokeWidth={3} />,
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border min-w-[280px] max-w-sm shadow-lg ${styles[type] || styles.info}`}
        >
            <div
                className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${type === "success" ? "bg-green-100" : type === "error" ? "bg-red-100" : "bg-blue-100"}`}
            >
                {icons[type]}
            </div>
            <p className="text-sm font-medium leading-snug">{message}</p>
            <button
                onClick={() => onRemove(id)}
                className={`ml-auto bg-transparent border-none p-1 cursor-pointer opacity-50 hover:opacity-100 transition-opacity ${type === "success" ? "text-green-700" : type === "error" ? "text-red-700" : "text-blue-700"}`}
            >
                <AppIcon name="x" size={12} />
            </button>
        </motion.div>
    );
};

export default function ToastContainer() {
    const { notifications, removeNotification } = useNotification();

    return (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 md:bottom-6 md:right-6 md:left-auto md:translate-x-0 z-[200] flex flex-col gap-2 items-center md:items-end pointer-events-none">
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
