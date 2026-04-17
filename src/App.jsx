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

  const navigate = (page, data = null) => {
    setCurrentPage(page);
    setPageData(data);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const showLayout = !PAGES_WITHOUT_LAYOUT.includes(currentPage);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage navigate={navigate} />;
      case 'room-detail':
        return <RoomDetailPage room={pageData} navigate={navigate} />;
      case 'login':
        return <LoginPage navigate={navigate} />;
      case 'register':
        return <RegisterPage navigate={navigate} />;
      default:
        // Fallback: 404-style back to home
        return (
          <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', paddingTop: '80px' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 700, color: '#1c1917' }}>
              Trang không tồn tại
            </h2>
            <button className="btn-primary" onClick={() => navigate('home')}>
              Về trang chủ
            </button>
          </div>
        );
    }
  };

  return (
    <>
      {showLayout && (
        <Header currentPage={currentPage} navigate={navigate} />
      )}

      <main>
        {renderPage()}
      </main>

      {showLayout && <Footer navigate={navigate} />}
    </>
  );
}
