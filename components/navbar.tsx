// components/Navbar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const handleScrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setIsOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      window.history.pushState(null, '', `#${id}`);
    } else {
      window.location.href = `/#${id}`;
    }
  };

  return (
    <nav className="bg-black text-white px-4 md:px-14 lg:px-32 py-5 flex items-center justify-between font-sans relative z-50">
      {/* Brand Logo & Name */}
      <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
        <Image 
          src="/arcadium.png" 
          alt="Arcadium Logo" 
          width={40} 
          height={40} 
          className="object-contain"
          priority
        />
        <span className="font-bold text-xl tracking-wider">Arcadium</span>
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-8 font-semibold text-[16px] tracking-wide">
        <a href="#timeline" onClick={(e) => handleScrollToSection(e, 'timeline')} className="cursor-pointer hover:text-emerald-400 transition-colors">
          Timeline
        </a>
        <Link href="https://discord.gg/QaGCGb3Z2" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400">Discord</Link>
        <Link href="#faq" onClick={(e) => handleScrollToSection(e, 'faq')} className="hover:text-emerald-400">FAQ</Link>
        {/* Divider */}
        <span className="text-white opacity-20 text-xl font-light select-none">|</span>

        {/* Register Button */}
        <Link 
          href="/register" 
          className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold px-5 py-2 rounded-full transition-all duration-200 transform hover:scale-105"
        >
          Register
        </Link>
      </div>

      {/* Mobile Menu Button */}
      <button 
        className="md:hidden text-white focus:outline-none z-50"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Mobile Sidebar Overlay */}
      <div className={`fixed inset-0 bg-black z-40 flex flex-col justify-start pt-28 px-8 transition-transform duration-300 ease-in-out md:hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col gap-6 text-2xl font-bold tracking-wide">
          <a href="#timeline" onClick={(e) => handleScrollToSection(e, 'timeline')} className="cursor-pointer hover:text-emerald-400">Timeline</a>
          <Link href="https://discord.gg/QaGCGb3Z2" target="_blank" onClick={() => setIsOpen(false)} className="hover:text-emerald-400">Discord</Link>
          <a href="#faq" onClick={(e) => handleScrollToSection(e, 'faq')} className="cursor-pointer hover:text-emerald-400">FAQ</a>
          
          <hr className="border-neutral-800 my-4" />

          <Link 
            href="/register" 
            onClick={() => setIsOpen(false)} 
            className="bg-emerald-500 text-black text-center font-bold py-3 rounded-full hover:bg-emerald-600 transition-colors"
          >
            Register
          </Link>
        </div>
      </div>
    </nav>
  );
}