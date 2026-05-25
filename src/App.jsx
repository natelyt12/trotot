import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

import Header from './components/layout/Header.jsx';
import Footer from './components/layout/Footer.jsx';
import BottomNav from './components/layout/BottomNav.jsx';
import HomePage from './pages/HomePage.jsx';
import RoomDetailPage from './pages/RoomDetailPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import PublicProfilePage from './pages/PublicProfilePage.jsx';
import { mapSupabaseRoom } from './utils/roomMapper.js';
import { FavoritesProvider } from './context/FavoritesContext';
import { useModal } from './context/ModalContext.jsx';
import { NotificationProvider } from './context/NotificationContext';
import ToastContainer from './components/common/ToastContainer.jsx';
import { RoomFilterProvider } from './context/RoomFilterContext.jsx';
import LocationWizardModal from './components/search/LocationWizardModal.jsx';
import MobileFilterModal from './components/rooms/MobileFilterModal.jsx';

const PAGES_WITHOUT_LAYOUT = ['login', 'register'];

/**
 * ScrollLock - Quản lý khóa cuộn mà không làm biến mất thanh cuộn (tránh layout shift)
 */
function ScrollLock({ isActive }) {
    if (!isActive) return null;
    return (
        <style>{`
            html { 
                overflow: hidden !important; 
            }
        `}</style>
    );
}

/**
 * Standalone router helper to generate paths consistently
 */
const getRouteUrl = (page, data) => {
    if (page === 'home') return '/';
    if (page === 'room-detail') return data?.slug ? `/rooms/${data.slug}` : '/';
    if (page === 'public-profile') return `/user/${data?.userId || data?.publicProfileUserId}`;
    return `/${page}`;
};

export default function App() {
    const [currentPage, setCurrentPage] = useState('home');
    const [pageData, setPageData] = useState(null);
    const [isClosing, setIsClosing] = useState(false);
    const [user, setUser] = useState(null);
    const [authLoaded, setAuthLoaded] = useState(false);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [showMobileFilter, setShowMobileFilter] = useState(false);
    const { showModal } = useModal();

    const navigate = (page, data = null) => {
        // Auth Check for Protected Routes
        if (['profile', 'dashboard'].includes(page) && !user) {
            navigate('login');
            return;
        }

        if (page === 'admin') {
            if (!user) {
                navigate('login');
                return;
            }
            if (user.user_metadata?.role !== 'admin') {
                showModal({
                    title: "Từ chối truy cập",
                    message: "Bạn không có quyền quản trị viên để truy cập trang này.",
                    type: "error"
                });
                return;
            }
        }

        // Draft Check for Room Detail
        if (page === 'room-detail' && data?.status === 'draft') {
            showModal({
                title: "Thông báo",
                message: "Phòng không tồn tại, có vẻ chủ bài đăng đã gỡ công khai hoặc phòng đã có người thuê",
                type: "warning"
            });
            return;
        }

        // Xác định trang đích cụ thể
        let targetPage = page;
        let targetData = data;

        if (page === 'back') {
            targetPage = pageData?.fromProfile ? 'profile' : 'home';
            targetData = null;
        }

        if (currentPage === 'room-detail' && targetPage !== 'room-detail') {
            const isTargetAlreadyMounted = (targetPage === 'public-profile' && pageData?.fromPublicProfile) || 
                                         (targetPage === 'profile' && pageData?.fromProfile);
            
            if ((targetPage === 'public-profile' || ['profile', 'dashboard', 'admin'].includes(targetPage)) && !isTargetAlreadyMounted) {
                setCurrentPage(targetPage);
                setPageData(targetData);
                window.scrollTo({ top: 0, behavior: 'instant' });
                window.history.pushState(null, '', getRouteUrl(targetPage, targetData));
            } else {
                setIsClosing(true);
                setTimeout(() => {
                    setIsClosing(false);
                    setCurrentPage(targetPage);
                    setPageData(targetData);
                    if (targetPage !== 'home' && !isTargetAlreadyMounted) {
                        window.scrollTo({ top: 0, behavior: 'instant' });
                    }
                    window.history.pushState(null, '', getRouteUrl(targetPage, targetData));
                }, 250);
            }
            return;
        }

        if (targetPage !== 'room-detail') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        window.history.pushState(null, '', getRouteUrl(targetPage, targetData));
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
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setAuthLoaded(true);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Authentication Protection for /profile, /dashboard, and /admin
    useEffect(() => {
        if (authLoaded) {
            if (['profile', 'dashboard'].includes(currentPage) && !user) {
                navigate('login');
            } else if (currentPage === 'admin') {
                if (!user) {
                    navigate('login');
                } else if (user.user_metadata?.role !== 'admin') {
                    showModal({
                        title: "Từ chối truy cập",
                        message: "Bạn không có quyền quản trị viên để truy cập trang này.",
                        type: "error"
                    });
                    navigate('home');
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
                    setCurrentPage('home');
                    setPageData(null);
                    return;
                }

                if (['login', 'register', 'profile', 'dashboard', 'admin'].includes(path)) {
                    setCurrentPage(path);
                    setPageData(null);
                    return;
                }

                if (path.startsWith('user/')) {
                    const userId = path.slice(5); // 'user/'.length === 5
                    setCurrentPage('public-profile');
                    setPageData({ userId });
                    return;
                }

                if (path.startsWith('rooms/')) {
                    const slug = path.slice(6); // 'rooms/'.length === 6
                    try {
                        const { data: room, error } = await supabase
                            .from('rooms_view')
                            .select('*, profiles(*)')
                            .eq('slug', slug)
                            .single();

                        if (room && !error) {
                            if (room.status === 'draft') {
                                showModal({
                                    title: "Thông báo",
                                    message: "Phòng không tồn tại, có vẻ chủ bài đăng đã gỡ công khai hoặc phòng đã có người thuê",
                                    type: "warning"
                                });
                                setCurrentPage('home');
                                window.history.pushState(null, '', '/');
                            } else {
                                const mappedRoom = mapSupabaseRoom(room);
                                setCurrentPage('room-detail');
                                setPageData(mappedRoom);
                            }
                        } else {
                            setCurrentPage('home');
                            setPageData(null);
                            window.history.pushState(null, '', '/');
                        }
                    } catch (err) {
                        console.error('Error fetching room by slug:', err);
                        setCurrentPage('home');
                        setPageData(null);
                        window.history.pushState(null, '', '/');
                    }
                    return;
                }

                // Giả định đó là một old room slug (không có tiền tố "rooms/") và không phải các path khác
                // Chúng ta sẽ fetch và redirect sang /rooms/{slug}
                try {
                    const { data: room, error } = await supabase
                        .from('rooms_view')
                        .select('*, profiles(*)')
                        .eq('slug', path)
                        .single();

                    if (room && !error) {
                        if (room.status === 'draft') {
                            showModal({
                                title: "Thông báo",
                                message: "Phòng không tồn tại, có vẻ chủ bài đăng đã gỡ công khai hoặc phòng đã có người thuê",
                                type: "warning"
                            });
                            setCurrentPage('home');
                            window.history.pushState(null, '', '/');
                        } else {
                            const mappedRoom = mapSupabaseRoom(room);
                            window.history.replaceState(null, '', `/rooms/${room.slug}`);
                            setCurrentPage('room-detail');
                            setPageData(mappedRoom);
                        }
                    } else {
                        setCurrentPage('home');
                        setPageData(null);
                        window.history.pushState(null, '', '/');
                    }
                } catch (err) {
                    console.error('Error fetching room by slug:', err);
                    setCurrentPage('home');
                    setPageData(null);
                    window.history.pushState(null, '', '/');
                }
            };

            // Tải trang hoặc bấm Back/Forward: Chạy trực tiếp tức thì không qua cửa trượt
            await performSwap();
        };

        handleLocationChange();

        // Lắng nghe sự kiện nút Back/Forward trình duyệt
        const onPopState = () => handleLocationChange();
        window.addEventListener('popstate', onPopState);
        return () => window.removeEventListener('popstate', onPopState);
    }, []);

    const showLayout = !PAGES_WITHOUT_LAYOUT.includes(currentPage);

    // Determine if modal should be in the DOM
    const shouldShowModal = currentPage === 'room-detail' || isClosing;


    return (
        <NotificationProvider>
            <FavoritesProvider user={user}>
                <RoomFilterProvider>
                    {showLayout && (
                        <Header
                            currentPage={currentPage}
                            navigate={navigate}
                            user={user}
                            onSearchClick={() => setIsLocationModalOpen(true)}
                        />
                    )}

                    {/* Guided Search Modal - Global */}
                    <LocationWizardModal
                        isOpen={isLocationModalOpen}
                        onClose={() => setIsLocationModalOpen(false)}
                    />


                    <main>
                        {/* Base Layer: HomePage remains mounted to preserve scroll/filters */}
                        <div className={(showLayout && !['profile', 'dashboard', 'admin', 'public-profile'].includes(currentPage) && !(currentPage === 'room-detail' && (pageData?.fromProfile || pageData?.fromPublicProfile))) ? 'block' : 'hidden'}>
                            <HomePage
                                navigate={navigate}
                                user={user}
                                onSearchClick={() => setIsLocationModalOpen(true)}
                                currentPage={currentPage}
                            />
                        </div>

                        {/* Profile Layer */}
                        <div className={(currentPage === 'profile' || (currentPage === 'room-detail' && pageData?.fromProfile)) ? 'block' : 'hidden'}>
                            <ProfilePage user={user} navigate={navigate} initialData={pageData} />
                        </div>

                        {/* Public Profile Layer */}
                        <div className={(currentPage === 'public-profile' || (currentPage === 'room-detail' && pageData?.fromPublicProfile)) ? 'block' : 'hidden'}>
                            <PublicProfilePage userId={pageData?.publicProfileUserId || pageData?.userId} navigate={navigate} />
                        </div>

                        {/* Dashboard Layer */}
                        <div className={currentPage === 'dashboard' ? 'block' : 'hidden'}>
                            <DashboardPage user={user} navigate={navigate} initialData={pageData} />
                        </div>

                        {/* Admin Layer */}
                        <div className={currentPage === 'admin' ? 'block' : 'hidden'}>
                            <AdminPage user={user} navigate={navigate} />
                        </div>

                        {/* Overlay Layer: Room Detail as a popup */}
                        {shouldShowModal && (
                            <div
                                className={`fixed inset-0 z-50 overflow-y-auto ${isClosing ? 'pointer-events-none animate-modal-out' : 'pointer-events-auto animate-modal-up'}`}
                            >
                                {currentPage === 'room-detail' && <RoomDetailPage room={pageData} navigate={navigate} user={user} isClosing={isClosing} />}
                            </div>
                        )}

                        {currentPage === 'login' && <LoginPage navigate={navigate} />}
                        {currentPage === 'register' && <RegisterPage navigate={navigate} initialData={pageData} />}
                    </main>

                    {showLayout && <Footer navigate={navigate} />}
                    {showLayout && (
                        <BottomNav
                            currentPage={currentPage}
                            navigate={navigate}
                            user={user}
                            onFilterClick={() => setShowMobileFilter(true)}
                        />
                    )}

                    {/* Global Mobile Filter Modal */}
                    <MobileFilterModal
                        isOpen={showMobileFilter}
                        onClose={() => setShowMobileFilter(false)}
                    />

                    {/* Scroll lock handler */}
                    <ScrollLock isActive={shouldShowModal} />

                    {/* Global Toast Container */}
                    <ToastContainer />
                </RoomFilterProvider>
            </FavoritesProvider>
        </NotificationProvider>
    );
}
