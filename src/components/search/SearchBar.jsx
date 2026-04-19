import { useState, useRef, useEffect } from 'react';
import { getAvailableCities } from '../../data/rooms.js';

/* SearchBar Component – Hero search with city autocomplete suggestions */
export default function SearchBar({ onSearch, initialValue = '' }) {
  const [query, setQuery] = useState(initialValue);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const cities = getAvailableCities();
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);



  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch && onSearch(query.trim());
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (value) => {
    setQuery(value);
    onSearch && onSearch(value);
    setShowSuggestions(false);
  };

  const filteredSuggestions = query.trim().length > 0
    ? cities.filter((c) => c.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: '#fff',
            border: '2px solid',
            borderColor: showSuggestions ? '#d97706' : '#e7e5e4',
            borderRadius: '1rem',
            boxShadow: showSuggestions
              ? '0 0 0 4px rgba(217,119,6,0.12), 0 4px 24px rgba(0,0,0,0.1)'
              : '0 4px 24px rgba(0,0,0,0.08)',
            transition: 'all 0.2s ease',
            overflow: 'hidden',
          }}
        >
          {/* Search icon */}
          <div style={{ padding: '0 0 0 1.25rem', color: '#a8a29e', flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            id="hero-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Tìm theo tên, địa chỉ, thành phố..."
            aria-label="Tìm kiếm phòng trọ"
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              padding: '1rem 0.75rem',
              fontSize: '1rem',
              fontFamily: 'Inter, sans-serif',
              color: '#1c1917',
              background: 'transparent',
            }}
          />

          {/* Clear button */}
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(''); onSearch && onSearch(''); inputRef.current?.focus(); }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem',
                color: '#a8a29e',
                display: 'flex',
                alignItems: 'center',
                transition: 'color 0.2s',
              }}
              aria-label="Xóa tìm kiếm"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Search button */}
          <button
            type="submit"
            className="btn-primary"
            style={{ 
              borderRadius: '0.625rem', 
              margin: '0.375rem', 
              flexShrink: 0,
              padding: '0.5rem 0.825rem',
              minWidth: '44px',
              height: 'calc(100% - 0.75rem)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <span className="hidden-mobile">Tìm kiếm</span>
          </button>
        </div>
      </form>

      {/* Suggestions dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 0.5rem)',
            left: 0,
            right: 0,
            background: '#fff',
            border: '1px solid #e7e5e4',
            borderRadius: '0.875rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            zIndex: 50,
            overflow: 'hidden',
            animation: 'slideDown 0.2s ease',
          }}
        >
          {/* City matches */}
          <ul style={{ listStyle: 'none', padding: '0.5rem 0', margin: 0 }}>
            {filteredSuggestions.map((city) => (
              <li key={city}>
                <button
                  type="button"
                  onClick={() => handleSuggestionClick(city)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.625rem',
                    width: '100%',
                    padding: '0.625rem 1rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    color: '#1c1917',
                    fontFamily: 'Inter, sans-serif',
                    transition: 'background 0.15s',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#fffbeb'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {city}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
