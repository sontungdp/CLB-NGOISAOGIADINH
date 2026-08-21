import React from 'react';

interface ClubLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;
  className?: string;
  showText?: boolean;
  textClassName?: string;
  subText?: string;
}

export const ClubLogo: React.FC<ClubLogoProps> = ({
  size = 'md',
  className = '',
  showText = false,
  textClassName = '',
  subText = 'HỆ THỐNG 2 CHI NHÁNH BÌNH THẠNH',
}) => {
  // Determine pixel size
  let dimension = 40;
  if (typeof size === 'number') {
    dimension = size;
  } else {
    switch (size) {
      case 'xs':
        dimension = 24;
        break;
      case 'sm':
        dimension = 32;
        break;
      case 'md':
        dimension = 42;
        break;
      case 'lg':
        dimension = 56;
        break;
      case 'xl':
        dimension = 72;
        break;
      case '2xl':
        dimension = 96;
        break;
    }
  }

  // Exact vector reproduction of the CLB NGÔI SAO GIA ĐỊNH official logo
  // Red square (#881519), yellow 5-point star contour (#FEE101), stylized boxing glove GSD in white (#FFF), 3-leaf yellow emblem (#FEE101)
  const svgBadge = (
    <svg
      width={dimension}
      height={dimension}
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 rounded-xl shadow-md ${className}`}
      style={{ minWidth: dimension, minHeight: dimension }}
    >
      {/* Dark Crimson Red Background */}
      <rect width="500" height="500" rx="36" fill="#881519" />

      {/* Outer subtle rim */}
      <rect x="6" y="6" width="488" height="488" rx="30" stroke="#FFDF00" strokeWidth="3" strokeOpacity="0.4" fill="none" />

      {/* 5-Pointed Star Outline (Yellow #FEE101) */}
      {/* Peak: (250, 16), Right: (490, 190), Bottom-Right: (400, 480), Bottom-Left: (100, 480), Left: (10, 190) */}
      <path
        d="M 250 24 
           L 302 186 
           L 472 186 
           L 335 285 
           L 387 448 
           L 250 348 
           L 113 448 
           L 165 285 
           L 28 186 
           L 198 186 Z"
        fill="#881519"
        stroke="#FEE101"
        strokeWidth="15"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Stylized Fist / Boxing Glove Emblem ("GSD") in bold white contour */}
      <g id="gsd-glove-monogram">
        {/* Main Boxing Glove Contour (Left Knuckle & Fist wrap) */}
        <path
          d="M 125 258 
             C 125 228, 150 212, 190 212 
             L 260 212 
             C 278 212, 284 224, 284 242 
             C 284 268, 270 286, 252 292
             C 230 300, 206 292, 196 288
             C 192 286, 190 292, 194 296
             C 208 308, 222 308, 244 308
             L 264 308
             C 282 308, 288 318, 288 334
             L 288 344
             L 214 344
             C 192 344, 184 332, 184 322
             C 184 316, 190 310, 198 310
             C 204 310, 208 304, 204 298
             C 198 290, 178 296, 160 302
             C 134 310, 125 292, 125 258 Z"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="15"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Right "D" / Glove Cuff Block */}
        <path
          d="M 298 212
             L 345 212
             C 372 212, 385 230, 385 272
             C 385 316, 372 344, 345 344
             L 298 344 Z"
          fill="#881519"
          stroke="#FFFFFF"
          strokeWidth="15"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* The "S" interlock bridge inside the glove */}
        <path
          d="M 216 308
             L 252 308
             C 264 308, 268 314, 268 325
             C 268 332, 262 336, 250 336
             L 220 336"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="12"
          strokeLinecap="round"
        />

        {/* 3-Petal Yellow Fan / Trefoil Symbol in the upper joint */}
        <g id="trefoil-emblem" fill="#FEE101" stroke="#881519" strokeWidth="2">
          {/* Top Petal */}
          <path d="M 235 255 C 235 240, 245 220, 250 220 C 255 220, 265 240, 265 255 C 265 264, 258 268, 250 268 C 242 268, 235 264, 235 255 Z" />
          {/* Bottom Left Petal */}
          <path d="M 244 262 C 234 260, 206 256, 206 262 C 206 268, 222 284, 232 284 C 240 284, 246 276, 244 262 Z" />
          {/* Bottom Right Petal */}
          <path d="M 256 262 C 266 260, 294 256, 294 262 C 294 268, 278 284, 268 284 C 260 284, 254 276, 256 262 Z" />
          {/* Center Core dot */}
          <circle cx="250" cy="260" r="5" fill="#881519" />
        </g>
      </g>
    </svg>
  );

  if (!showText) {
    return svgBadge;
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {svgBadge}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`font-black tracking-tight text-white uppercase font-sans ${textClassName || 'text-base'}`}>
            CLB NGÔI SAO GIA ĐỊNH
          </span>
        </div>
        {subText && (
          <p className="text-[11px] text-slate-400 font-medium">
            {subText}
          </p>
        )}
      </div>
    </div>
  );
};
