import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";

import Header from "./components/layout/Header.jsx";
import Footer from "./components/layout/Footer.jsx";
import BottomNav from "./components/layout/BottomNav.jsx";
import HomePage from "./pages/HomePage.jsx";
import RoomDetailPage from "./pages/RoomDetailPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import PublicProfilePage from "./pages/PublicProfilePage.jsx";
import MyRoomPage from "./pages/MyRoomPage.jsx";
import ForumPage from "./pages/ForumPage.jsx";
import { mapSupabaseRoom } from "./utils/roomMapper.js";
import { FavoritesProvider } from "./context/FavoritesContext";
import { useModal } from "./context/ModalContext.jsx";
import { NotificationProvider } from "./context/NotificationContext";
import ToastContainer from "./components/common/ToastContainer.jsx";
import { RoomFilterProvider } from "./context/RoomFilterContext.jsx";
import LocationWizardModal from "./components/search/LocationWizardModal.jsx";
import MobileFilterModal from "./components/rooms/MobileFilterModal.jsx";

const PAGES_WITHOUT_LAYOUT = ["login", "register"];



/**
 * Standalone router helper to generate paths consistently
 */
const getRouteUrl = (page, data) => {
    if (page === "home") return "/";
    if (page === "room-detail") return data?.slug ? `/rooms/${data.slug}` : "/";
    if (page === "public-profile") return `/user/${data?.userId || data?.publicProfileUserId}`;
    if (page === "forum") return "/forum";
    return `/${page}`;
};

export default function App() {
    const [currentPage, setCurrentPage] = useState("home");
    const [pageData, setPageData] = useState(null);
    const [user, setUser] = useState(null);
    const [authLoaded, setAuthLoaded] = useState(false);
    const [initializing, setInitializing] = useState(true); // Block render until initial URL is resolved
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [showMobileFilter, setShowMobileFilter] = useState(false);
    const { showModal } = useModal();

    const navigate = (page, data = null) => {
        // Auth Check for Protected Routes
        if (["profile", "dashboard", "my-room"].includes(page) && !user) {
            navigate("login");
            return;
        }

        if (page === "admin") {
            if (!user) {
                navigate("login");
                return;
            }
            if (user.user_metadata?.role !== "admin") {
                showModal({
                    title: "Từ chối truy cập",
                    message: "Bạn không có quyền quản trị viên để truy cập trang này.",
                    type: "error",
                });
                return;
            }
        }

        // Draft Check for Room Detail
        if (page === "room-detail" && data?.status === "draft") {
            showModal({
                title: "Thông báo",
                message: "Phòng không tồn tại, có vẻ chủ bài đăng đã gỡ công khai hoặc phòng đã có người thuê",
                type: "warning",
            });
            return;
        }

        // Room detail: always open in a new tab
        if (page === "room-detail") {
            const url = getRouteUrl("room-detail", data);
            if (url && url !== "/") {
                window.open(url, "_blank", "noopener,noreferrer");
            }
            return;
        }

        let targetPage = page;
        let targetData = data;

        window.scrollTo({ top: 0, behavior: "smooth" });
        window.history.pushState(null, "", getRouteUrl(targetPage, targetData));
        setCurrentPage(targetPage);
        setPageData(targetData);
    };

    useEffect(() => {
        // Check current session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setAuthLoaded(true);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setAuthLoaded(true);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Authentication Protection for protected routes
    useEffect(() => {
        if (authLoaded) {
            const role = user?.user_metadata?.role;
            if (["profile", "dashboard", "my-room", "admin"].includes(currentPage)) {
                if (!user) {
                    navigate("login");
                    return;
                }

                if (currentPage === "admin" && role !== "admin") {
                    showModal({
                        title: "Từ chối truy cập",
                        message: "Bạn không có quyền quản trị viên để truy cập trang này.",
                        type: "error",
                    });
                    navigate("home");
                } else if (currentPage === "my-room" && role !== "tenant" && role !== "admin") {
                    showModal({
                        title: "Từ chối truy cập",
                        message: "Chỉ người thuê phòng mới có quyền truy cập trang này.",
                        type: "error",
                    });
                    navigate("home");
                } else if (currentPage === "dashboard" && role !== "landlord" && role !== "admin") {
                    showModal({
                        title: "Từ chối truy cập",
                        message: "Chỉ chủ nhà mới có quyền truy cập trang này.",
                        type: "error",
                    });
                    navigate("home");
                }
            }
        }
    }, [authLoaded, user, currentPage, showModal]);

    // Xử lý tải URL ban đầu và các nút Back/Forward của trình duyệt
    useEffect(() => {
        const handleLocationChange = async () => {
            const path = window.location.pathname.slice(1); // Loại bỏ dấu gạch chéo đầu tiên

            const performSwap = async () => {
                if (!path) {
                    setCurrentPage("home");
                    setPageData(null);
                    return;
                }

                if (["login", "register", "profile", "dashboard", "admin", "my-room", "forum"].includes(path)) {
                    setCurrentPage(path);
                    setPageData(null);
                    return;
                }

                if (path.startsWith("user/")) {
                    const userId = path.slice(5); // 'user/'.length === 5
                    setCurrentPage("public-profile");
                    setPageData({ userId });
                    return;
                }

                if (path.startsWith("rooms/")) {
                    const slug = path.slice(6); // 'rooms/'.length === 6
                    try {
                        const { data: room, error } = await supabase.from("rooms_view").select("*, profiles(*)").eq("slug", slug).single();

                        if (room && !error) {
                            if (room.status === "draft") {
                                showModal({
                                    title: "Thông báo",
                                    message: "Phòng không tồn tại, có vẻ chủ bài đăng đã gỡ công khai hoặc phòng đã có người thuê",
                                    type: "warning",
                                });
                                setCurrentPage("home");
                                window.history.pushState(null, "", "/");
                            } else {
                                const mappedRoom = mapSupabaseRoom(room);
                                setCurrentPage("room-detail");
                                setPageData(mappedRoom);
                            }
                        } else {
                            setCurrentPage("home");
                            setPageData(null);
                            window.history.pushState(null, "", "/");
                        }
                    } catch (err) {
                        console.error("Error fetching room by slug:", err);
                        setCurrentPage("home");
                        setPageData(null);
                        window.history.pushState(null, "", "/");
                    }
                    return;
                }

                // Giả định đó là một old room slug (không có tiền tố "rooms/") và không phải các path khác
                // Chúng ta sẽ fetch và redirect sang /rooms/{slug}
                try {
                    const { data: room, error } = await supabase.from("rooms_view").select("*, profiles(*)").eq("slug", path).single();

                    if (room && !error) {
                        if (room.status === "draft") {
                            showModal({
                                title: "Thông báo",
                                message: "Phòng không tồn tại, có vẻ chủ bài đăng đã gỡ công khai hoặc phòng đã có người thuê",
                                type: "warning",
                            });
                            setCurrentPage("home");
                            window.history.pushState(null, "", "/");
                        } else {
                            const mappedRoom = mapSupabaseRoom(room);
                            window.history.replaceState(null, "", `/rooms/${room.slug}`);
                            setCurrentPage("room-detail");
                            setPageData(mappedRoom);
                        }
                    } else {
                        setCurrentPage("home");
                        setPageData(null);
                        window.history.pushState(null, "", "/");
                    }
                } catch (err) {
                    console.error("Error fetching room by slug:", err);
                    setCurrentPage("home");
                    setPageData(null);
                    window.history.pushState(null, "", "/");
                }
            };

            // Tải trang hoặc bấm Back/Forward: Chạy trực tiếp tức thì không qua cửa trượt
            await performSwap();
        };

        handleLocationChange().finally(() => setInitializing(false));

        // Lắng nghe sự kiện nút Back/Forward trình duyệt
        const onPopState = () => handleLocationChange();
        window.addEventListener("popstate", onPopState);
        return () => window.removeEventListener("popstate", onPopState);
    }, []);

    // Full-screen spinner shown only during initial URL resolution
    if (initializing) {
        return (
            <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center gap-4">
                <div className="relative">
                    <div className="w-14 h-14 rounded-full border-4 border-stone-200 border-t-amber-500 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full bg-amber-500/20 animate-pulse" />
                    </div>
                </div>
                <p className="text-stone-400 text-sm font-semibold tracking-wide">Đang tải...</p>
            </div>
        );
    }

    const showLayout = !PAGES_WITHOUT_LAYOUT.includes(currentPage);

    return (
        <NotificationProvider>
            <FavoritesProvider user={user}>
                <RoomFilterProvider>
                    {showLayout && <Header currentPage={currentPage} navigate={navigate} user={user} onSearchClick={() => setIsLocationModalOpen(true)} />}

                    {/* Guided Search Modal - Global */}
                    <LocationWizardModal isOpen={isLocationModalOpen} onClose={() => setIsLocationModalOpen(false)} />

                    <main>
                        {/* Base Layer: HomePage remains mounted to preserve scroll/filters */}
                        <div
                            className={
                                showLayout &&
                                !["profile", "dashboard", "admin", "public-profile", "my-room", "forum", "room-detail"].includes(currentPage)
                                    ? "block"
                                    : "hidden"
                            }
                        >
                            <HomePage navigate={navigate} user={user} onSearchClick={() => setIsLocationModalOpen(true)} currentPage={currentPage} />
                        </div>

                        {/* Profile Layer */}
                        <div className={currentPage === "profile" ? "block" : "hidden"}>
                            <ProfilePage user={user} navigate={navigate} initialData={pageData} currentPage={currentPage} />
                        </div>

                        {/* Public Profile Layer */}
                        <div className={currentPage === "public-profile" ? "block" : "hidden"}>
                            <PublicProfilePage
                                userId={pageData?.publicProfileUserId || pageData?.userId}
                                user={user}
                                navigate={navigate}
                                ownerPanel={pageData?.ownerPanel || null}
                            />
                        </div>

                        {/* Forum Layer */}
                        <div className={currentPage === "forum" ? "block" : "hidden"}>
                            <ForumPage
                                user={user}
                                navigate={navigate}
                                preAttachRoom={pageData?.preAttachRoom || null}
                                openCreateModal={pageData?.openCreateModal || false}
                                editPost={pageData?.editPost || null}
                                initialActiveTab={pageData?.activeTab || null}
                            />
                        </div>

                        {/* Dashboard Layer */}
                        <div className={currentPage === "dashboard" ? "block" : "hidden"}>
                            <DashboardPage user={user} navigate={navigate} initialData={pageData} routerPage={currentPage} />
                        </div>

                        {/* Admin Layer */}
                        <div className={currentPage === "admin" ? "block" : "hidden"}>
                            <AdminPage user={user} navigate={navigate} />
                        </div>

                        {/* My Room Layer */}
                        <div className={currentPage === "my-room" ? "block" : "hidden"}>
                            <MyRoomPage user={user} navigate={navigate} />
                        </div>


                        {/* Room Detail: Full page (only when accessing /rooms/slug directly) */}
                        {currentPage === "room-detail" && (
                            <RoomDetailPage room={pageData} navigate={navigate} user={user} />
                        )}

                        {currentPage === "login" && <LoginPage navigate={navigate} />}
                        {currentPage === "register" && <RegisterPage navigate={navigate} initialData={pageData} />}
                    </main>

                    {showLayout && <Footer navigate={navigate} />}
                    {showLayout && <BottomNav currentPage={currentPage} navigate={navigate} user={user} onFilterClick={() => setShowMobileFilter(true)} />}

                    {/* Global Mobile Filter Modal */}
                    <MobileFilterModal isOpen={showMobileFilter} onClose={() => setShowMobileFilter(false)} />

                    {/* Global Toast Container */}
                    <ToastContainer />
                </RoomFilterProvider>
            </FavoritesProvider>
        </NotificationProvider>
    );
}
