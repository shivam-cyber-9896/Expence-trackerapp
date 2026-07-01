import React from 'react';

/**
 * Premium reusable SVG logo component representing growth, finance, and security.
 * Uses a corporate blue to cyan linear gradient.
 */
export const Logo = ({ size = 24, style = {} }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
    >
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
      <path 
        d="M16 2L4 7V15C4 21.6 9 27.8 16 30C23 27.8 28 21.6 28 15V7L16 2Z" 
        fill="url(#logo-grad)" 
      />
      <path 
        d="M16 6L24 9.5V15C24 19.8 20.6 24.3 16 26V6Z" 
        fill="#ffffff" 
        fillOpacity="0.2" 
      />
      {/* Finance / Growth bars inside the shield */}
      <rect x="11" y="15" width="2.5" height="6" rx="1" fill="#ffffff" />
      <rect x="15.5" y="11" width="2.5" height="10" rx="1" fill="#ffffff" />
      <rect x="20" y="7" width="2.5" height="14" rx="1" fill="#ffffff" />
    </svg>
  );
};

export default Logo;
