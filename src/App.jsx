import { useState } from 'react';
import Header from './components/layout/Header.jsx';
import Footer from './components/layout/Footer.jsx';
import HomePage from './pages/HomePage.jsx';
import RoomDetailPage from './pages/RoomDetailPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';

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

    const navigate = (page, data = null) => {
        // Exit animation logic for modal
        if (currentPage === 'room-detail' && page === 'home') {
            setIsClosing(true);
            setTimeout(() => {
                setIsClosing(false);
                setCurrentPage('home');
                setPageData(null);
            }, 400); // Match animation duration
            return;
        }

        // Only scroll to top for "major" page changes (login, register, home)
        // but NOT when we are just opening/closing the Room Detail modal overlay.
        if (page !== 'room-detail' && currentPage !== 'room-detail') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        setCurrentPage(page);
        setPageData(data);
    };

    const showLayout = !PAGES_WITHOUT_LAYOUT.includes(currentPage);

    // Determine if modal should be in the DOM
    const shouldShowModal = currentPage === 'room-detail' || isClosing;

    return (
        <>
            {showLayout && (
                <Header currentPage={currentPage} navigate={navigate} />
            )}

            <main>
                {/* Base Layer: HomePage remains mounted to preserve scroll/filters */}
                <div style={{ display: showLayout ? 'block' : 'none' }}>
                    <HomePage navigate={navigate} />
                </div>

                {/* Overlay Layer: Room Detail as a full-screen popup */}
                {shouldShowModal && (
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 9, // Below header (which is 10)
                            background: '#fafaf9',
                            overflowY: 'auto',
                            animation: isClosing
                                ? 'modalFadeOut 0.3s ease-out forwards'
                                : 'modalSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards'
                        }}
                    >
                        <RoomDetailPage room={pageData} navigate={navigate} />
                    </div>
                )}

                {currentPage === 'login' && <LoginPage navigate={navigate} />}
                {currentPage === 'register' && <RegisterPage navigate={navigate} />}
            </main>

            {showLayout && <Footer navigate={navigate} />}

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
