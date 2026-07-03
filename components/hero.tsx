// components/Hero.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const tomorrowTranslations = ["tomorrow", "कल", "ನಾಳೆ", "श्वः"];

export default function Hero() {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % tomorrowTranslations.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative bg-[#2d46b9] text-[#1ed760] min-h-[calc(100vh-80px)] w-full flex flex-col justify-center items-center text-center overflow-hidden font-sans px-4 select-none">
      
      {/* Background Shapes Container */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Right Large Green Circle */}
        <div className="absolute right-[-20vw] top-[5vh] w-[40vw] h-[40vw] md:right-[-15vw] md:top-[5vh] md:w-[35vw] md:h-[35vw] bg-[#1ed760] rounded-full" />

        {/* Bottom-Left Green Circle */}
        <div className="absolute left-[-35vw] bottom-[-30vw] w-[70vw] h-[70vw] md:left-[-15vw] md:bottom-[-15vw] md:w-[40vw] md:h-[40vw] bg-[#1ed760] rounded-full" />
        
        {/* Bottom-Left Dark Blue Circle (Overlaps Green) */}
        <div className="absolute left-[-45vw] bottom-[-45vw] w-[80vw] h-[80vw] md:left-[-25vw] md:bottom-[-25vw] md:w-[45vw] md:h-[45vw] bg-[#223388] rounded-full" />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center mt-[-40px]">
        
        {/* Two-Line Title Block */}
        <h1 className="text-[32px] sm:text-[60px] md:text-[90px] lg:text-[90px] font-black tracking-[-0.04em] leading-[0.95] text-center min-h-[2em]">
          Build today,<br />
          Shape <span className="inline-block min-w-[200px] text-left transition-all duration-300">{tomorrowTranslations[wordIndex]}</span>
        </h1>

        {/* Action Button */}
        <Link 
          href="/register" 
          className="mt-8 md:mt-10 bg-[#1ed760] hover:bg-[#1fef6c] text-[#2d46b9] font-bold text-[14px] tracking-[0.1em] px-12 py-4 rounded-full uppercase transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md block text-center"
        >
          Register
        </Link>
      </div>

    </section>
  );
}