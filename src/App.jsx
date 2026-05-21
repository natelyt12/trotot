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

export default function App() {
    const [currentPage, setCurrentPage] = useState('home');
    const [pageData, setPageData] = useState(null);
    const [isClosing, setIsClosing] = useState(false);
    const [user, setUser] = useState(null);
    const [authLoaded, setAuthLoaded] = useState(false);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [showMobileFilter, setShowMobileFilter] = useState(false);
    const { showModal } = useModal();

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

    // Authentication Protection for /profile and /dashboard
    useEffect(() => {
        if (authLoaded && ['profile', 'dashboard'].includes(currentPage) && !user) {
            navigate('login');
        }
    }, [authLoaded, user, currentPage]);


    const navigate = (page, data = null) => {
        // Auth Check for Protected Routes
        if (['profile', 'dashboard'].includes(page) && !user) {
            navigate('login');
            return;
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

        // Exit animation logic for modal (Room Detail)
        if (currentPage === 'room-detail' && page !== 'room-detail') {
            setIsClosing(true);

            // Determine where we actually want to go
            let targetPage = page;
            let targetData = data;

            if (page === 'back') {
                targetPage = pageData?.fromProfile ? 'profile' : 'home';
                targetData = null;
            }

            setTimeout(() => {
                setIsClosing(false);
                setCurrentPage(targetPage);
                setPageData(targetData);

                // Scroll to top when moving to a new major page from a modal
                if (targetPage !== 'home') {
                    window.scrollTo({ top: 0, behavior: 'instant' });
                }

                // Update URL
                const url = targetPage === 'home' ? '/' : `/${targetPage}`;
                window.history.pushState(null, '', url);
            }, 250); // Match animation duration
            return;
        }


        // Only scroll to top for "major" page changes (login, register, home, profile)
        // but NOT when we are just opening/closing the Room Detail modal overlay.
        if (page !== 'room-detail') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // --- SLUG ROUTING LOGIC ---
        if (page === 'room-detail' && data?.slug) {
            window.history.pushState(null, '', `/${data.slug}`);
        } else if (page === 'home') {
            window.history.pushState(null, '', '/');
        } else if (['login', 'register', 'profile', 'dashboard'].includes(page)) {
            window.history.pushState(null, '', `/${page}`);
        }

        setCurrentPage(page);
        setPageData(data);
    };

    // Handle initial URL and Back/Forward buttons
    useEffect(() => {
        const handleLocationChange = async () => {
            const path = window.location.pathname.slice(1); // Remove leading /

            if (!path) {
                setCurrentPage('home');
                setPageData(null);
                return;
            }

            if (['login', 'register', 'profile', 'dashboard'].includes(path)) {
                setCurrentPage(path);
                return;
            }

            // Assume it's a room slug
            try {
                // Fetch room along with its owner profile
                const { data: room, error } = await supabase
                    .from('rooms')
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
                        setCurrentPage('room-detail');
                        setPageData(mappedRoom);
                    }
                } else {
                    // Fallback to home if slug not found
                    setCurrentPage('home');
                }
            } catch (err) {
                console.error('Error fetching room by slug:', err);
                setCurrentPage('home');
            }
        };

        handleLocationChange();

        // Listen for back/forward buttons
        window.addEventListener('popstate', handleLocationChange);
        return () => window.removeEventListener('popstate', handleLocationChange);
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
                        <div className={(showLayout && !['profile', 'dashboard'].includes(currentPage) && !(currentPage === 'room-detail' && pageData?.fromProfile)) ? 'block' : 'hidden'}>
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

                        {/* Dashboard Layer */}
                        <div className={currentPage === 'dashboard' ? 'block' : 'hidden'}>
                            <DashboardPage user={user} navigate={navigate} initialData={pageData} />
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
