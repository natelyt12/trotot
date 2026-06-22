import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SearchTrigger from "../search/SearchTrigger.jsx";
import { useRoomFilterContext } from "../../context/RoomFilterContext.jsx";
import AppIcon from "../common/AppIcon.jsx";
import { useModal } from "../../context/ModalContext.jsx";
import { signOut } from "../../services/authService.js";
import NotificationDropdown from "./NotificationDropdown.jsx";

export default function Header({ currentPage, navigate, user, onSearchClick }) {
    const { filters, getLocationDisplayText } = useRoomFilterContext();
    const { showModal } = useModal();

    const handleLogout = () => {
        showModal({
            title: "Xác nhận đăng xuất",
            message: "Bạn có chắc chắn muốn đăng xuất khỏi tài khoản không?",
            type: "warning",
            confirmText: "Đăng xuất",
            cancelText: "Hủy",
            onConfirm: async () => {
                await signOut();
                navigate("home");
            },
        });
    };
    const searchDisplayText = getLocationDisplayText();
    const isSearchFilled = filters.city || filters.university;
    const [mobileOpen, setMobileOpen] = useState(false);
    const [showSearch, setShowSearch] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const isHome = currentPage === "home";
            const isMobile = window.innerWidth < 768; // md breakpoint

            if (!isHome || isMobile) {
                setShowSearch(false);
            } else {
                // Trên PC: Cuộn > 400px ở trang chủ mới hiện
                setShowSearch(window.scrollY > 400);
            }
        };

        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });
        window.addEventListener("resize", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleScroll);
        };
    }, [currentPage]);

    const navLinks = [
        { label: "Tìm phòng", page: "home" },
        { label: "Diễn đàn", page: "forum" },
        { label: "Dịch vụ chuyển trọ", page: "shipping-service" },
    ];

    const handleNavLinkClick = (link) => {
        if (link.page === "shipping-service") {
            if (!user) navigate("login");
            else navigate("shipping-service");
        } else {
            navigate(link.page);
        }
    };

    const roleLabel = (role) => {
        if (role === "admin") return "Quản trị viên";
        if (role === "landlord") return "Bên cho thuê";
        return "Người thuê";
    };

    return (
        <header className="fixed z-100 top-0 left-0 right-0 bg-white border-b border-amber-200">
            {/* Main bar */}
            <nav className="flex flex-col md:flex-row w-full px-4 md:px-6">
                {/* Top Row (Mobile) / Full Row (Desktop) */}
                <div className="flex items-center justify-between w-full h-14 md:h-16">
                    {/* LEFT: Logo & Nav Links */}
                    <div className="flex items-center justify-start gap-8">
                        {/* Logo */}
                        <button onClick={() => navigate("home")} className="flex items-center gap-2 bg-transparent border-none cursor-pointer p-0 shrink-0">
                            <img src="/logo.png" alt="Trọ Tốt Logo" className="w-8 h-8 object-contain rounded-md" />
                            <span className="flex items-baseline">
                                <span className="font-bold text-[1.25rem] text-stone-900 tracking-tight font-heading">Trọ</span>
                                <span className="text-amber-500 text-[1.45rem] font-medium ml-0.5 font-script">Tốt</span>
                            </span>
                        </button>

                        {/* Desktop Nav Links */}
                        <div className="hidden lg:flex items-center gap-3">
                            {user ? (
                                user.user_metadata?.role === "landlord" || user.user_metadata?.role === "admin" ? (
                                    <>
                                        <button
                                            onClick={() => navigate("dashboard", { tab: "post_room", isCreating: true })}
                                            className="bg-amber-500 hover:bg-amber-600 text-white font-normal text-xs pl-1.5 pr-3.5 py-1.5 rounded-full border-none shadow-xs cursor-pointer transition-all flex items-center gap-1.5 group shrink-0"
                                        >
                                            <div className="w-6 h-6 rounded-full bg-amber-400 group-hover:bg-amber-500 transition-colors flex items-center justify-center shrink-0">
                                                <AppIcon name="plus" size={14} strokeWidth={2.5} />
                                            </div>
                                            <span>Đăng tin phòng trọ</span>
                                        </button>
                                        <button
                                            onClick={() => navigate("forum", { openCreateModal: true })}
                                            className="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/60 font-normal text-xs pl-1.5 pr-3.5 py-1.5 rounded-full cursor-pointer transition-all flex items-center gap-1.5 group shrink-0"
                                        >
                                            <div className="w-6 h-6 rounded-full bg-amber-100 group-hover:bg-amber-200 transition-colors flex items-center justify-center shrink-0">
                                                <AppIcon name="messages" size={14} />
                                            </div>
                                            <span>Đăng tin diễn đàn</span>
                                        </button>
                                        <div className="h-4 w-px bg-stone-200 mx-1" />
                                        <button
                                            onClick={() => navigate("home")}
                                            className={`border-none px-3 py-1.5 rounded-lg cursor-pointer text-sm font-normal transition-colors bg-transparent ${
                                                currentPage === "home" ? "text-amber-600" : "text-stone-600 hover:text-stone-900"
                                            }`}
                                        >
                                            Tìm phòng
                                        </button>
                                        <button
                                            onClick={() => navigate("forum")}
                                            className={`border-none px-3 py-1.5 rounded-lg cursor-pointer text-sm font-normal transition-colors bg-transparent ${
                                                currentPage === "forum" ? "text-amber-600" : "text-stone-600 hover:text-stone-900"
                                            }`}
                                        >
                                            Diễn đàn
                                        </button>
                                        <button
                                            onClick={() => navigate("shipping-service")}
                                            className={`border-none px-3 py-1.5 rounded-lg cursor-pointer text-sm font-normal transition-colors bg-transparent ${
                                                currentPage === "shipping-service" ? "text-amber-600" : "text-stone-600 hover:text-stone-900"
                                            }`}
                                        >
                                            Dịch vụ chuyển trọ
                                        </button>
                                        <button
                                            onClick={() => navigate("dashboard")}
                                            className={`border-none px-3 py-1.5 rounded-lg cursor-pointer text-sm font-normal transition-colors bg-transparent ${
                                                currentPage === "dashboard" ? "text-amber-600" : "text-stone-600 hover:text-stone-900"
                                            }`}
                                        >
                                            Quản lý
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => navigate("forum", { openCreateModal: true })}
                                            className="bg-amber-500 hover:bg-amber-600 text-white font-normal text-xs pl-1.5 pr-3.5 py-1.5 rounded-full border-none shadow-xs cursor-pointer transition-all flex items-center gap-1.5 group shrink-0"
                                        >
                                            <div className="w-6 h-6 rounded-full bg-amber-400 group-hover:bg-amber-500 transition-colors flex items-center justify-center shrink-0">
                                                <AppIcon name="messages" size={14} />
                                            </div>
                                            <span>Đăng tin diễn đàn</span>
                                        </button>
                                        <div className="h-4 w-px bg-stone-200 mx-1" />
                                        <button
                                            onClick={() => navigate("home")}
                                            className={`border-none px-3 py-1.5 rounded-lg cursor-pointer text-sm font-normal transition-colors bg-transparent ${
                                                currentPage === "home" ? "text-amber-600" : "text-stone-600 hover:text-stone-900"
                                            }`}
                                        >
                                            Tìm phòng
                                        </button>
                                        <button
                                            onClick={() => navigate("forum")}
                                            className={`border-none px-3 py-1.5 rounded-lg cursor-pointer text-sm font-normal transition-colors bg-transparent ${
                                                currentPage === "forum" ? "text-amber-600" : "text-stone-600 hover:text-stone-900"
                                            }`}
                                        >
                                            Diễn đàn
                                        </button>
                                        <button
                                            onClick={() => navigate("shipping-service")}
                                            className={`border-none px-3 py-1.5 rounded-lg cursor-pointer text-sm font-normal transition-colors bg-transparent ${
                                                currentPage === "shipping-service" ? "text-amber-600" : "text-stone-600 hover:text-stone-900"
                                            }`}
                                        >
                                            Dịch vụ chuyển trọ
                                        </button>
                                        <button
                                            onClick={() => navigate("my-room")}
                                            className={`border-none px-3 py-1.5 rounded-lg cursor-pointer text-sm font-normal transition-colors bg-transparent ${
                                                currentPage === "my-room" ? "text-amber-600" : "text-stone-600 hover:text-stone-900"
                                            }`}
                                        >
                                            Phòng trọ của tôi
                                        </button>
                                    </>
                                )
                            ) : (
                                <>
                                    <button
                                        onClick={() => navigate("login")}
                                        className="bg-amber-500 hover:bg-amber-600 text-white font-normal text-xs pl-1.5 pr-3.5 py-1.5 rounded-full border-none shadow-xs cursor-pointer transition-all flex items-center gap-1.5 group shrink-0"
                                    >
                                        <div className="w-6 h-6 rounded-full bg-amber-400 group-hover:bg-amber-500 transition-colors flex items-center justify-center shrink-0">
                                            <AppIcon name="plus" size={14} strokeWidth={2.5} />
                                        </div>
                                        <span>Đăng tin phòng trọ</span>
                                    </button>
                                    <button
                                        onClick={() => navigate("login")}
                                        className="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/60 font-normal text-xs pl-1.5 pr-3.5 py-1.5 rounded-full cursor-pointer transition-all flex items-center gap-1.5 group shrink-0"
                                    >
                                        <div className="w-6 h-6 rounded-full bg-amber-100 group-hover:bg-amber-200 transition-colors flex items-center justify-center shrink-0">
                                            <AppIcon name="messages" size={14} />
                                        </div>
                                        <span>Đăng tin diễn đàn</span>
                                    </button>
                                    <div className="h-4 w-px bg-stone-200 mx-1" />
                                    <button
                                        onClick={() => navigate("home")}
                                        className={`border-none px-3 py-1.5 rounded-lg cursor-pointer text-sm font-normal transition-colors bg-transparent ${
                                            currentPage === "home" ? "text-amber-600" : "text-stone-600 hover:text-stone-900"
                                        }`}
                                    >
                                        Tìm phòng
                                    </button>
                                    <button
                                        onClick={() => navigate("forum")}
                                        className={`border-none px-3 py-1.5 rounded-lg cursor-pointer text-sm font-normal transition-colors bg-transparent ${
                                            currentPage === "forum" ? "text-amber-600" : "text-stone-600 hover:text-stone-900"
                                        }`}
                                    >
                                        Diễn đàn
                                    </button>
                                    <button
                                        onClick={() => navigate("shipping-service")}
                                        className={`border-none px-3 py-1.5 rounded-lg cursor-pointer text-sm font-normal transition-colors bg-transparent ${
                                            currentPage === "shipping-service" ? "text-amber-600" : "text-stone-600 hover:text-stone-900"
                                        }`}
                                    >
                                        Dịch vụ chuyển trọ
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* RIGHT Area: Search (Conditional) + Auth */}
                    <div className="flex items-center justify-end gap-2 md:gap-4 shrink-0">
                        {/* Desktop Search - Appears on scroll */}
                        <AnimatePresence>
                            {showSearch && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                    className="hidden md:block w-72 lg:w-80"
                                >
                                    <SearchTrigger
                                        displayText={searchDisplayText}
                                        onClick={onSearchClick}
                                        isFilled={isSearchFilled}
                                        isNavbar={true}
                                        showButton={false}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="h-6 w-px bg-stone-100 hidden md:block" />

                        {user && <NotificationDropdown navigate={navigate} user={user} />}

                        {user ? (
                            <div className="relative group flex items-center">
                                <button className="flex items-center gap-2 md:gap-3 bg-transparent border-none py-1.5 px-3 rounded-lg cursor-pointer hover:bg-stone-50 transition-colors z-10">
                                    <div className="text-right">
                                        <div className="text-sm font-normal text-stone-900 leading-tight truncate max-w-[120px]">
                                            {user.user_metadata?.full_name || "Người dùng"}
                                        </div>
                                        <div className="text-[10px] uppercase tracking-tighter text-stone-500 font-normal">
                                            {roleLabel(user.user_metadata?.role)}
                                        </div>
                                    </div>
                                    <div
                                        className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-amber-500 text-white font-normal flex items-center justify-center overflow-hidden shrink-0 shadow-sm border border-white"
                                        style={
                                            user.user_metadata?.avatar_url
                                                ? { backgroundImage: `url(${user.user_metadata.avatar_url})`, backgroundSize: "cover" }
                                                : {}
                                        }
                                    >
                                        {!user.user_metadata?.avatar_url && (user.user_metadata?.full_name || "U").charAt(0).toUpperCase()}
                                    </div>
                                </button>

                                {/* Dropdown menu for Desktop */}
                                <div className="absolute right-0 top-full pt-2 w-64 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50">
                                    <div className="bg-white border border-stone-200 rounded-2xl shadow-lg p-3 space-y-2">
                                        {/* Yellow Action Buttons at the top */}
                                        <div className="flex flex-col gap-1.5">
                                            {(user.user_metadata?.role === "landlord" || user.user_metadata?.role === "admin") && (
                                                <button
                                                    onClick={() => navigate("dashboard", { tab: "post_room", isCreating: true })}
                                                    className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-normal text-xs py-2.5 px-3.5 rounded-lg border-none cursor-pointer transition-colors shadow-sm"
                                                >
                                                    <AppIcon name="plus" size={14} />
                                                    <span>Đăng tin phòng trọ</span>
                                                </button>
                                            )}
                                            <button
                                                onClick={() => navigate("forum", { openCreateModal: true })}
                                                className="w-full flex items-center justify-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/60 font-normal text-xs py-2.5 px-3.5 rounded-lg cursor-pointer transition-colors shadow-sm"
                                            >
                                                <AppIcon name="messages" size={14} />
                                                <span>Đăng tin diễn đàn</span>
                                            </button>
                                        </div>

                                        <div className="h-px bg-stone-100 my-1" />

                                        {/* Standard Links */}
                                        <div className="space-y-0.5">
                                            <button
                                                onClick={() => navigate("public-profile", { userId: user.id })}
                                                className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-left text-sm font-normal text-stone-700 hover:bg-stone-50 hover:text-stone-900 cursor-pointer border-none bg-transparent"
                                            >
                                                <AppIcon name="user" size={16} />
                                                <span>Xem trang cá nhân</span>
                                            </button>
                                            <button
                                                onClick={() => navigate("profile")}
                                                className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-left text-sm font-normal text-stone-700 hover:bg-stone-50 hover:text-stone-900 cursor-pointer border-none bg-transparent"
                                            >
                                                <AppIcon name="settings" size={16} />
                                                <span>Cài đặt tài khoản</span>
                                            </button>
                                            {user && user.user_metadata?.role === "tenant" && (
                                                <button
                                                    onClick={() => navigate("my-room")}
                                                    className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-left text-sm font-normal text-stone-700 hover:bg-stone-50 hover:text-stone-900 cursor-pointer border-none bg-transparent"
                                                >
                                                    <AppIcon name="home" size={16} />
                                                    <span>Phòng trọ của tôi</span>
                                                </button>
                                            )}
                                            {(user.user_metadata?.role === "landlord" || user.user_metadata?.role === "admin") && (
                                                <button
                                                    onClick={() => navigate("dashboard")}
                                                    className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-left text-sm font-normal text-stone-700 hover:bg-stone-50 hover:text-stone-900 cursor-pointer border-none bg-transparent"
                                                >
                                                    <AppIcon name="check-square" size={16} />
                                                    <span>Quản lý</span>
                                                </button>
                                            )}

                                            {user && user.user_metadata?.role === "admin" && (
                                                <button
                                                    onClick={() => navigate("admin")}
                                                    className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-left text-sm font-normal text-stone-700 hover:bg-stone-50 hover:text-stone-900 cursor-pointer border-none bg-transparent"
                                                >
                                                    <AppIcon name="settings" size={16} />
                                                    <span>Trang quản trị</span>
                                                </button>
                                            )}
                                        </div>

                                        <div className="h-px bg-stone-100 my-1" />

                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-left text-sm font-normal text-red-600 hover:bg-red-50 cursor-pointer border-none bg-transparent"
                                        >
                                            <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                                <polyline points="16 17 21 12 16 7" />
                                                <line x1="21" y1="12" x2="9" y2="12" />
                                            </svg>
                                            <span>Đăng xuất</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => navigate("login")}
                                    className="hidden md:flex items-center justify-center bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-normal h-10 px-5 rounded-full cursor-pointer border-none transition-colors"
                                >
                                    Đăng nhập
                                </button>
                                <button
                                    onClick={() => navigate("register")}
                                    className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-normal h-10 px-5 rounded-full cursor-pointer border-none transition-colors"
                                >
                                    Đăng ký
                                </button>
                            </div>
                        )}

                        {/* Hamburger Button (Mobile) */}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="p-2 hover:bg-stone-100 rounded-full transition-colors cursor-pointer border-none bg-transparent md:hidden text-stone-700 flex items-center justify-center"
                            aria-label="Toggle menu"
                        >
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                {mobileOpen ? (
                                    <>
                                        <line x1="18" y1="6" x2="6" y2="18"></line>
                                        <line x1="6" y1="6" x2="18" y2="18"></line>
                                    </>
                                ) : (
                                    <>
                                        <line x1="3" y1="12" x2="21" y2="12"></line>
                                        <line x1="3" y1="6" x2="21" y2="6"></line>
                                        <line x1="3" y1="18" x2="21" y2="18"></line>
                                    </>
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Search Bar removed to clean up mobile UI and rely on bottom nav filter */}
            </nav>

            {/* Mobile dropdown menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="bg-white border-b border-stone-200 p-4 md:hidden overflow-hidden"
                    >
                        {/* User card / auth */}
                        <div className="mb-3">
                            {user ? (
                                <button
                                    onClick={() => {
                                        navigate("profile");
                                        setMobileOpen(false);
                                    }}
                                    className="w-full bg-stone-50 border border-stone-200 p-3.5 rounded-lg flex items-center justify-between cursor-pointer text-left hover:bg-amber-50 hover:border-amber-200 transition-colors duration-200"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white font-normal text-base overflow-hidden shrink-0">
                                            {user.user_metadata?.avatar_url ? (
                                                <img src={user.user_metadata.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                (user.user_metadata?.full_name || "U").charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-stone-900">{user.user_metadata?.full_name || "Người dùng"}</div>
                                            <div className="text-xs text-stone-500">{roleLabel(user.user_metadata?.role)}</div>
                                        </div>
                                    </div>
                                    <svg
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="text-stone-400"
                                    >
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                </button>
                            ) : (
                                <button
                                    onClick={() => {
                                        navigate("login");
                                        setMobileOpen(false);
                                    }}
                                    className="w-full bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium py-3.5 rounded-full cursor-pointer border-none transition-colors duration-200"
                                >
                                    Đăng nhập
                                </button>
                            )}
                        </div>

                        {user && (
                            <div className="flex flex-col gap-2 my-3 border-b border-stone-100 pb-3">
                                {(user.user_metadata?.role === "landlord" || user.user_metadata?.role === "admin") && (
                                    <button
                                        onClick={() => {
                                            navigate("dashboard", { tab: "post_room", isCreating: true });
                                            setMobileOpen(false);
                                        }}
                                        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-normal py-3 text-center text-xs rounded-lg border-none cursor-pointer shadow-sm transition-colors"
                                    >
                                        Đăng tin phòng trọ
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        navigate("forum", { openCreateModal: true });
                                        setMobileOpen(false);
                                    }}
                                    className="w-full flex items-center justify-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/60 font-normal py-3 text-xs rounded-lg cursor-pointer shadow-sm transition-colors"
                                >
                                    Đăng tin diễn đàn
                                </button>
                            </div>
                        )}
                        {user && (user.user_metadata?.role === "landlord" || user.user_metadata?.role === "admin") && (
                            <button
                                onClick={() => {
                                    navigate("dashboard");
                                    setMobileOpen(false);
                                }}
                                className="block w-full text-left bg-transparent border-none py-3 px-1 text-stone-600 text-sm font-normal cursor-pointer border-b border-stone-100 hover:text-amber-600 transition-colors duration-200"
                            >
                                Quản lý
                            </button>
                        )}

                        {user && user.user_metadata?.role === "tenant" && (
                            <button
                                onClick={() => {
                                    navigate("my-room");
                                    setMobileOpen(false);
                                }}
                                className="block w-full text-left bg-transparent border-none py-3 px-1 text-stone-600 text-sm font-normal cursor-pointer border-b border-stone-100 hover:text-amber-600 transition-colors duration-200"
                            >
                                Phòng trọ của tôi
                            </button>
                        )}
                        {navLinks.map((link) => (
                            <button
                                key={link.page}
                                onClick={() => {
                                    handleNavLinkClick(link);
                                    setMobileOpen(false);
                                }}
                                className="block w-full text-left bg-transparent border-none py-3 px-1 text-stone-600 text-sm font-normal cursor-pointer border-b border-stone-100 last:border-b-0 hover:text-amber-600 transition-colors duration-200"
                            >
                                {link.label}
                            </button>
                        ))}
                        {user && user.user_metadata?.role === "admin" && (
                            <button
                                onClick={() => {
                                    navigate("admin");
                                    setMobileOpen(false);
                                }}
                                className="block w-full text-left bg-transparent border-none py-3 px-1 text-stone-600 text-sm font-normal cursor-pointer border-t border-stone-100 hover:text-stone-900 transition-colors duration-200"
                            >
                                Trang quản trị
                            </button>
                        )}
                        {user && (
                            <button
                                onClick={() => {
                                    handleLogout();
                                    setMobileOpen(false);
                                }}
                                className="block w-full text-left bg-transparent border-none py-3 px-1 text-red-600 text-sm font-normal cursor-pointer border-t border-stone-100 hover:text-red-700 transition-colors duration-200"
                            >
                                Đăng xuất
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
