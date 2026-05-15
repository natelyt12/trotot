import React from 'react';
import AppIcon from '../common/AppIcon.jsx';

/**
 * SearchTrigger - Flat, simple search bar component
 * Base design is for the Homepage (large).
 * Use isNavbar=true for a compact version in the header.
 */
export default function SearchTrigger({
    displayText,
    onClick,
    isFilled,
    isNavbar = false,
    showButton = true
}) {
    // Navbar version is more compact (dẹp hơn)
    const containerPadding = isNavbar ? 'p-1 px-1.5' : 'p-1.5 px-1.5';
    const iconSize = isNavbar ? 16 : 22;
    const circleSize = isNavbar ? 'w-8 h-8' : 'w-11 h-11';
    const textSize = isNavbar ? 'text-sm' : 'text-base';
    const labelSize = isNavbar ? 'text-[0.55rem]' : 'text-[0.65rem]';

    return (
        <button
            onClick={onClick}
            className={`flex items-center justify-between transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 w-full bg-stone-100 hover:bg-stone-200 border-none rounded-full cursor-pointer ${containerPadding}`}
        >
            <div className="flex items-center gap-3 overflow-hidden min-w-0 flex-1">
                {/* Solid White Circle Icon */}
                <div
                    className={`${circleSize} rounded-full bg-white flex items-center justify-center shrink-0 text-amber-600 transition-colors shadow-sm`}
                >
                    <AppIcon name="search" size={iconSize} />
                </div>

                <div className="flex flex-col items-start truncate text-left min-w-0 flex-1">
                    <span className={`${labelSize} font-bold text-stone-400 uppercase tracking-widest mb-0`}>
                        Khu vực tìm kiếm
                    </span>
                    <span className={`${textSize} font-bold truncate w-full ${isFilled ? 'text-stone-900' : 'text-stone-400'}`}>
                        {displayText}
                    </span>
                </div>
            </div>

            {showButton && !isNavbar && (
                <div className="bg-amber-500 text-white px-7 py-3 rounded-full font-bold text-sm transition-colors duration-200 shrink-0 hover:bg-amber-600">
                    Tìm ngay
                </div>
            )}
        </button>
    );
}
