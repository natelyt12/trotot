import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AMENITIES, ROOM_TYPES } from "../../constants/constants.js";
import AppIcon from "../common/AppIcon.jsx";

export default function HeroCarousel({ rooms, onRoomClick, onActiveChange }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        if (!rooms || rooms.length === 0) return;
        const activeRoom = rooms[((activeIndex % rooms.length) + rooms.length) % rooms.length];
        onActiveChange(activeRoom);
    }, [activeIndex, rooms, onActiveChange]);

    useEffect(() => {
        if (!rooms || rooms.length === 0) return;
        if (isHovered) return;

        const interval = setInterval(() => {
            setActiveIndex((prev) => prev + 1);
        }, 3000);

        return () => clearInterval(interval);
    }, [rooms, isHovered]);

    if (!rooms || rooms.length === 0) return null;

    const visibleItems = [];
    for (let i = activeIndex - 2; i <= activeIndex + 2; i++) {
        const roomIndex = ((i % rooms.length) + rooms.length) % rooms.length;
        visibleItems.push({ absoluteIndex: i, room: rooms[roomIndex] });
    }

    return (
        <div
            className="relative w-full max-w-lg h-[800px] flex items-center justify-end overflow-visible"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <AnimatePresence>
                {visibleItems.map((item) => {
                    const relativeOffset = item.absoluteIndex - activeIndex;
                    const isActive = relativeOffset === 0;

                    const yOffset = relativeOffset * 172; // Card height (160px) + gap (12px)
                    // Flat arc effect: no scale changes or 3D overlaps, only horizontal xOffset
                    const xOffset = Math.abs(relativeOffset) * 30;
                    const scale = 1;
                    const opacity = isActive ? 1 : 0.6 - Math.abs(relativeOffset) * 0.15;
                    const zIndex = 10 - Math.abs(relativeOffset);

                    const { basic_info, media_contact, room_features } = item.room;

                    return (
                        <motion.div
                            key={item.absoluteIndex}
                            initial={{ opacity: 0, x: xOffset + 40, y: yOffset + 172 }}
                            animate={{ opacity, scale, x: xOffset, y: yOffset }}
                            exit={{ opacity: 0, x: xOffset + 40, y: yOffset - 172 }}
                            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            className={`absolute right-0 w-[480px] h-[160px] rounded-2xl cursor-pointer bg-white shadow-2xl overflow-hidden flex items-center p-3 gap-4
                                ${isActive ? "border-2 border-amber-400 ring-4 ring-amber-400/20 bg-white" : "border border-stone-200/50 bg-white/90"}
                            `}
                            style={{ zIndex }}
                            onClick={() => onRoomClick(item.room)}
                        >
                            <img
                                src={media_contact?.images?.[0]?.url || "https://placehold.co/400x300"}
                                alt={basic_info?.title}
                                className="w-[136px] h-[136px] object-cover rounded-xl shrink-0 shadow-inner"
                            />
                            <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-1">
                                <div>
                                    <div className="flex justify-between items-start gap-1">
                                        <h4 className="text-base font-medium text-stone-800 truncate flex-1">{basic_info?.title}</h4>
                                        <span className="text-sm font-semibold text-amber-600 shrink-0">{basic_info?.price_monthly?.toLocaleString()}đ</span>
                                    </div>
                                    <p className="text-xs text-stone-500 truncate mt-0.5">
                                        {basic_info?.district}, {basic_info?.city}
                                    </p>
                                </div>
                                {/* Badges */}
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[0.7rem] font-medium text-stone-600 bg-stone-50 border border-stone-200">
                                        {ROOM_TYPES[basic_info?.room_type] || "Phòng"}
                                    </span>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.7rem] font-medium text-amber-700 bg-amber-50 border border-amber-200">
                                        <AppIcon name="area" size={11} />
                                        {basic_info?.area_sqm} m²
                                    </span>
                                </div>

                                {/* Bottom Row: Amenities & Details Button */}
                                <div className="flex items-center justify-between gap-2 w-full">
                                    <div className="flex items-center gap-1 text-stone-400">
                                        {room_features?.amenities?.slice(0, 4).map((key) => (
                                            <div
                                                key={key}
                                                title={AMENITIES[key]?.label}
                                                className="w-6 h-6 rounded-full bg-stone-50 border border-stone-100 flex items-center justify-center"
                                            >
                                                <AppIcon name={key} size={12} />
                                            </div>
                                        ))}
                                    </div>

                                    {isActive && (
                                        <button className="flex items-center gap-1.5 py-1.5 pl-1.5 pr-3 bg-amber-500 hover:bg-amber-600 text-white rounded-full transition-colors border-none cursor-pointer shrink-0 group">
                                            <div className="w-5 h-5 rounded-full bg-amber-400 group-hover:bg-amber-500 transition-colors flex items-center justify-center shrink-0">
                                                <AppIcon name="chevronRight" size={10} strokeWidth={2.5} />
                                            </div>
                                            <span className="text-[11px] font-medium">Xem chi tiết</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
}
