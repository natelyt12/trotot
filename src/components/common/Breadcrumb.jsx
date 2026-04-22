import React from 'react';

/* ============================================
   Breadcrumb Component
   - Props:
     - paths: Array of { label: string, page?: string }
     - navigate: navigation function
   ============================================ */
export default function Breadcrumb({ paths, navigate }) {
    return (
        <nav
            className="flex items-center gap-3 mb-6 overflow-x-auto whitespace-nowrap pb-1 no-scrollbar"
        >
            {/* Back Button */}
            <button
                onClick={() => navigate('home')}
                className="flex items-center gap-2 bg-white border border-stone-200 rounded-md px-3 py-1 cursor-pointer text-stone-600 text-[0.85rem] font-semibold shadow-sm transition-all duration-200 shrink-0 hover:border-amber-600 hover:text-amber-600"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                <span>Quay lại</span>
            </button>

            <div className="flex items-center gap-2 text-stone-400 text-[0.85rem] font-medium">
                {paths.map((path, index) => (
                    <React.Fragment key={index}>
                        {index > 0 && <span>/</span>}
                        {path.page ? (
                            <button
                                onClick={() => navigate(path.page)}
                                className="bg-transparent border-none p-0 text-stone-500 cursor-pointer font-medium text-[0.85rem] transition-colors duration-200 hover:text-stone-900"
                            >
                                {path.label}
                            </button>
                        ) : (
                            <span className="text-stone-900 font-semibold">{path.label}</span>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </nav>
    );
}
