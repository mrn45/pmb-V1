import React from "react";

/**
 * Rub el Hizb (8-pointed Islamic Star) SVG component
 */
export function RubElHizb({ className = "w-6 h-6 text-accent", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2L14.83 4.83L19.17 3.5L19.17 7.83L22 10.67L19.17 13.5L19.17 17.83L14.83 16.5L12 19.33L9.17 16.5L4.83 17.83L4.83 13.5L2 10.67L4.83 7.83L4.83 3.5L9.17 4.83L12 2Z" />
      <circle cx="12" cy="12" r="3.5" className="text-white" fill="currentColor" />
      <circle cx="12" cy="12" r="2" fill="none" className="text-accent" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

/**
 * Islamic Divider with Star in the center and elegant gold gradient lines
 */
export function IslamicDivider({ className = "my-6" }: { className?: string }) {
  return (
    <div className={`islamic-divider-container ${className}`}>
      <div className="islamic-divider-line" />
      <div className="mx-4 flex items-center gap-1.5 text-accent animate-pulse">
        <span className="text-[10px] opacity-60">✦</span>
        <RubElHizb className="w-5 h-5" />
        <span className="text-[10px] opacity-60">✦</span>
      </div>
      <div className="islamic-divider-line" />
    </div>
  );
}

/**
 * Islamic gold corners to be placed inside an relative element
 */
export function IslamicCorners() {
  return (
    <>
      <div className="islamic-corner-tl" />
      <div className="islamic-corner-tr" />
      <div className="islamic-corner-bl" />
      <div className="islamic-corner-br" />
    </>
  );
}

/**
 * Elegant "Bismillah" arabic calligraphic styled text with a gold glow
 */
export function BismillahCalligraphy({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center text-center my-4 ${className}`}>
      <div 
        className="font-cairo text-2xl sm:text-3xl text-accent font-semibold tracking-wide select-none filter drop-shadow-[0_2px_4px_rgba(212,175,55,0.2)]"
        title="Bismillahirrahmanirrahim"
        dir="rtl"
      >
        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
      </div>
      <p className="text-[10px] uppercase tracking-widest text-slate-400 mt-1.5 font-sans font-medium">
        Dengan Menyebut Nama Allah Yang Maha Pengasih Lagi Maha Penyayang
      </p>
    </div>
  );
}

/**
 * Islamic Geometric Arch Top Ornament
 */
export function IslamicArchOrnament({ className = "w-full" }: { className?: string }) {
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <svg 
        viewBox="0 0 100 20" 
        className="w-48 text-accent opacity-50" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="1.5"
      >
        <path d="M 10,20 C 30,20 40,5 50,5 C 60,5 70,20 90,20" strokeLinecap="round" />
        <circle cx="50" cy="5" r="1.5" fill="currentColor" />
        <circle cx="30" cy="16" r="1" fill="currentColor" />
        <circle cx="70" cy="16" r="1" fill="currentColor" />
      </svg>
    </div>
  );
}
