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




/*
 * App – Client-side router using useState
 * To migrate to react-router: replace navigate() calls with useNavigate()
 * and wrap routes in <Routes><Route> components.
 *
 * Pages that don't show Header/Footer: login, register
 */

const PAGES_WITHOUT_LAYOUT = ['login', 'register'];

export default function App() {
    const [currentPage, setCurrentPage] = useState('home');
    const [pageData, setPageData] = useState(null); // e.g. selected room
    const [isClosing, setIsClosing] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Check current session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);


    const navigate = (page, data = null) => {
        // Exit animation logic for modal (Room Detail or Profile)
        if ((currentPage === 'room-detail' || currentPage === 'profile') && page === 'home') {
            setIsClosing(true);
            setTimeout(() => {
                setIsClosing(false);
                setCurrentPage('home');
                setPageData(null);
                // Update URL back to home
                window.history.pushState(null, '', '/');
            }, 400); // Match animation duration
            return;
        }


        // Only scroll to top for "major" page changes (login, register, home)
        // but NOT when we are just opening/closing the Room Detail or Profile modal overlay.
        if (!['room-detail', 'profile'].includes(page) && !['room-detail', 'profile'].includes(currentPage)) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // --- SLUG ROUTING LOGIC ---
        if (page === 'room-detail' && data?.slug) {
            window.history.pushState(null, '', `/${data.slug}`);
        } else if (page === 'home') {
            window.history.pushState(null, '', '/');
        } else if (['login', 'register', 'profile'].includes(page)) {
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

            if (['login', 'register', 'profile'].includes(path)) {
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
                    // If we have profile data, use it to override the mock contact info
                    const profile = Array.isArray(room.profiles) ? room.profiles[0] : room.profiles;
                    const ownerContact = profile ? {
                        name: profile.full_name || room.media_contact.contact.name,
                        phone: profile.phone || room.media_contact.contact.phone,
                        role: profile.role || room.media_contact.contact.role,
                        avatar: profile.avatar_url || room.media_contact.contact.avatar
                    } : room.media_contact.contact;

                    // Reconstruct the nested structure as expected by RoomDetailPage
                    const mappedRoom = {
                        ...room,
                        basic_info: {
                            title: room.title,
                            room_type: room.room_type,
                            price_monthly: room.price_monthly,
                            area_sqm: room.area_sqm,
                            city: room.city,
                            district: room.district,
                            ward: room.ward,
                            address: room.address
                        },
                        media_contact: {
                            ...room.media_contact,
                            contact: ownerContact
                        },
                        metadata: {
                            is_verified: room.is_verified,
                            status: room.status,
                            total_views: room.total_views,
                            total_favorites: room.total_favorites,
                            created_at: room.created_at,
                            updated_at: room.updated_at
                        }
                    };
                    setCurrentPage('room-detail');
                    setPageData(mappedRoom);
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
    const shouldShowModal = currentPage === 'room-detail' || currentPage === 'profile' || isClosing;


    return (
        <>
            {showLayout && (
                <Header 
                    currentPage={currentPage} 
                    navigate={navigate} 
                    user={user} 
                />
            )}


            <main>
                {/* Base Layer: HomePage remains mounted to preserve scroll/filters */}
                <div className={showLayout ? 'block' : 'hidden'}>
                    <HomePage navigate={navigate} />
                </div>

                {/* Overlay Layer: Room Detail / Profile as a popup */}
                {shouldShowModal && (
                    <div
                        className={`fixed inset-0 z-9 overflow-y-auto ${isClosing ? 'pointer-events-none' : 'pointer-events-auto'}`}
                        style={{
                            animation: isClosing
                                ? 'modalFadeOut 0.3s ease-out forwards'
                                : 'modalSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards'
                        }}
                    >
                        {currentPage === 'room-detail' && <RoomDetailPage room={pageData} navigate={navigate} user={user} isClosing={isClosing} />}
                        {currentPage === 'profile' && <ProfilePage user={user} navigate={navigate} isClosing={isClosing} />}
                    </div>
                )}

                {currentPage === 'login' && <LoginPage navigate={navigate} />}
                {currentPage === 'register' && <RegisterPage navigate={navigate} />}
            </main>

            {showLayout && <Footer navigate={navigate} />}
            {showLayout && <BottomNav currentPage={currentPage} navigate={navigate} user={user} />}

            <style>{`
                @keyframes modalSlideUp {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes modalFadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
                /* Lock body scroll when modal is open */
                ${shouldShowModal ? 'body { overflow: hidden; }' : ''}
            `}</style>
        </>
    );
}
