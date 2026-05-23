import { motion, AnimatePresence } from 'framer-motion';

/**
 * PageTransition - Cửa trượt tự động màu trắng khi chuyển giữa các trang
 * hiển thị logo Trọ Tốt và spinner màu vàng accent.
 */
export default function PageTransition({ stage, isTransitioning }) {
    if (!isTransitioning) return null;

    // Định nghĩa chuyển động với expo-out cho hiệu ứng đóng và ease-in-out cho hiệu ứng mở
    const leftDoorVariants = {
        closed: {
            x: 0,
            transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } // expo-out (easeOutExpo)
        },
        open: {
            x: "-100%",
            transition: { duration: 0.7, ease: "easeInOut" } // ease-in-out
        }
    };

    const rightDoorVariants = {
        closed: {
            x: 0,
            transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } // expo-out (easeOutExpo)
        },
        open: {
            x: "100%",
            transition: { duration: 0.7, ease: "easeInOut" } // ease-in-out
        }
    };

    // Cửa đóng khi ở trạng thái 'closing' hoặc 'closed'
    const isDoorClosed = stage === 'closing' || stage === 'closed';

    // Chỉ hiển thị chữ Trọ Tốt và Spinner khi hai cánh cửa đã khép kín hoàn toàn
    const contentVisible = stage === 'closed';

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
            {/* Cửa Trái */}
            <motion.div
                className="fixed left-0 top-0 bottom-0 w-[50vw] bg-white pointer-events-auto"
                initial="open"
                animate={isDoorClosed ? "closed" : "open"}
                variants={leftDoorVariants}
            />

            {/* Cửa Phải */}
            <motion.div
                className="fixed right-0 top-0 bottom-0 w-[50vw] bg-white pointer-events-auto"
                initial="open"
                animate={isDoorClosed ? "closed" : "open"}
                variants={rightDoorVariants}
            />

            {/* Nội dung trung tâm: Chỉ giữ nguyên chữ Trọ Tốt & Spinner */}
            <AnimatePresence>
                {contentVisible && (
                    <motion.div
                        className="fixed inset-0 flex flex-col items-center justify-center gap-6 z-[10000] pointer-events-none"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                    >
                        {/* Logo & Text Trọ Tốt (không đổ bóng) */}
                        <div className="flex flex-col items-center gap-3">
                            <img
                                src="/logo.png"
                                alt="Logo Trọ Tốt"
                                className="w-16 h-16 object-contain rounded-xl"
                            />
                            <span className="flex items-baseline select-none">
                                <span
                                    className="font-bold text-[2.2rem] text-stone-900 tracking-tight"
                                    style={{ fontFamily: 'var(--font-heading)' }}
                                >
                                    Trọ
                                </span>
                                <span
                                    className="text-amber-500 text-[2.7rem] font-bold ml-1"
                                    style={{ fontFamily: 'var(--font-script)' }}
                                >
                                    Tốt
                                </span>
                            </span>
                        </div>

                        {/* Spinner quay tròn linear màu vàng accent */}
                        <motion.div
                            className="w-10 h-10 border-[3.5px] border-stone-100 border-t-amber-500 rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{
                                repeat: Infinity,
                                duration: 0.7,
                                ease: "linear"
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
