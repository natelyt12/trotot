import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SearchTrigger from "../search/SearchTrigger.jsx";
import { PROVINCE } from "../../constants/province.js";
import HeroCarousel from "./HeroCarousel.jsx";

export default function HeroSection({ user, onSearchClick, filters, getLocationDisplayText, rooms, onRoomClick }) {
    const [activeRoom, setActiveRoom] = useState(null);

    const stats = [
        { value: `300+`, label: "Phòng đăng ký" },
        { value: `${PROVINCE.length}`, label: "Thành phố" },
        { value: "500+", label: "Chủ trọ tin cậy" },
        { value: "4.8★", label: "Đánh giá trung bình" },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    const carouselRooms = rooms && rooms.length > 0 ? rooms.slice(0, 10) : [];

    return (
        <section className={`${user ? "hidden md:flex" : "flex"} flex-col h-screen relative overflow-hidden bg-stone-900`}>
            {/* Background Image for Right Column (Desktop/LG Only) */}
            <AnimatePresence mode="wait">
                {activeRoom && (
                    <motion.div
                        key={activeRoom.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                        className="absolute top-0 right-0 w-full lg:w-[50%] h-full hidden lg:block z-0"
                    >
                        <img
                            src={activeRoom.media_contact?.images?.[0]?.url || "https://placehold.co/800x600"}
                            alt="Background preview"
                            className="w-full h-full object-cover object-right"
                            style={{
                                WebkitMaskImage: "radial-gradient(circle at 100% 50%, black 20%, transparent 75%)",
                                maskImage: "radial-gradient(circle at 100% 50%, black 20%, transparent 75%)",
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Red Box: Navbar Placeholder with height matching header (excludes it from vertical centering calculation) */}
            <div className="h-14 md:h-16 shrink-0 w-full" />

            {/* Ambient organic glows (blur filters) */}
            <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-amber-500/12 via-orange-600/6 to-transparent rounded-full pointer-events-none blur-[150px] z-0" />
            <div className="absolute bottom-[-15%] left-[15%] w-[500px] h-[500px] bg-gradient-to-tr from-amber-600/8 via-transparent to-transparent rounded-full pointer-events-none blur-[130px] z-0" />
            <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-l from-amber-500/6 via-orange-500/3 to-transparent rounded-full pointer-events-none blur-[160px] z-0" />

            {/* Orange Box: Main content wrapper - takes up remaining viewport height and centers content */}
            <div className="flex-1 flex items-center justify-center relative z-10 w-full">
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-[50%_50%] gap-10 items-center">
                        
                        {/* LEFT COLUMN - Centered on Mobile, Aligned Left on Desktop */}
                        <div className="text-center lg:text-left w-full">
                            {/* Badge */}
                            <motion.div
                                variants={itemVariants}
                                className="inline-flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/25 rounded-full px-3 py-1 mb-6"
                            >
                                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                                <span className="text-amber-300 text-xs font-semibold">Nền tảng tìm trọ #1 Việt Nam</span>
                            </motion.div>

                            <motion.h1
                                variants={itemVariants}
                                className="text-[clamp(2.35rem,5vw,3.75rem)] font-extrabold text-white! leading-[1.1] mb-5 tracking-tight lg:max-w-[560px] mx-auto lg:mx-0"
                                style={{ fontFamily: "var(--font-heading)" }}
                            >
                                Tìm phòng{" "}
                                <span className="text-amber-400 px-1 md:px-2" style={{ fontFamily: "var(--font-script)", fontSize: "1.65em" }}>
                                    ưng ý
                                </span>{" "}
                                trong vài phút
                            </motion.h1>

                            <motion.p
                                variants={itemVariants}
                                className="text-stone-300 text-base md:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 mb-8 md:mb-10 font-medium text-center lg:text-left"
                            >
                                Hàng nghìn phòng được xác thực tại Hà Nội, TP. Hồ Chí Minh và khắp cả nước. Miễn phí tìm kiếm, không phí trung gian.
                            </motion.p>

                            {/* Guided Search */}
                            <motion.div variants={itemVariants} className="block max-w-lg mx-auto lg:mx-0 mt-6">
                                <SearchTrigger
                                    displayText={getLocationDisplayText()}
                                    onClick={onSearchClick}
                                    isFilled={filters.city || filters.university}
                                    isNavbar={false}
                                />
                            </motion.div>

                            {/* Stats bar */}
                            <motion.div
                                variants={itemVariants}
                                className="grid grid-cols-2 md:grid-cols-4 bg-stone-800/60 backdrop-blur-md border border-stone-700/50 rounded-xl overflow-hidden max-w-2xl mx-auto lg:mx-0 mt-12"
                            >
                                {stats.map((stat, idx) => (
                                    <div
                                        key={stat.label}
                                        className={`p-4 md:p-5 text-center border-stone-700/50 
                                            ${idx % 2 === 0 ? "border-r" : ""} 
                                            ${idx < 2 ? "border-b" : ""} 
                                            md:border-b-0 md:border-r md:last:border-r-0`}
                                    >
                                        <div
                                            className="font-extrabold text-[1.4rem] md:text-[1.6rem] text-amber-400 leading-none"
                                            style={{ fontFamily: "var(--font-heading)" }}
                                        >
                                            {stat.value}
                                        </div>
                                        <div className="text-[11px] md:text-xs text-stone-300 mt-1.5 font-medium">{stat.label}</div>
                                    </div>
                                ))}
                            </motion.div>
                        </div>

                        {/* RIGHT COLUMN - Carousel aligned to the right of the layout container */}
                        <div className="hidden lg:flex h-[800px] items-center justify-end relative z-20">
                            <HeroCarousel rooms={carouselRooms} onRoomClick={onRoomClick} onActiveChange={setActiveRoom} />
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
