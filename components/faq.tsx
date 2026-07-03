'use client';

import React, { useState } from 'react';

const faqData = [
  {
    question: "Who can join?",
    answer: "Anyone with a passion for building, regardless of age. Whether you're a seasoned backend dev, a UI/UX designer, or a curious beginner, there's a place for you."
  },
  {
    question: "Is it free?",
    answer: "Yes! Participation is completely free and open to developers across India."
  },
  {
    question: "What do I need?",
    answer: "A stable internet connection, your development environment of choice, and a passion for building the future."
  },
  {
    question: "Can I form a team beforehand?",
    answer: "Yes! Teams can be up to 4 people. If You prefer solo that's completely acceptable."
  }
];

export default function Faq() {
  // By default keep all FAQs open
  const [openItems, setOpenItems] = useState<number[]>(faqData.map((_, i) => i));

  const toggleItem = (index: number) => {
    if (openItems.includes(index)) {
      setOpenItems(openItems.filter((i) => i !== index));
    } else {
      setOpenItems([...openItems, index]);
    }
  };

  return (
    <section id="faq" className="relative w-full bg-[#0b101e] text-white py-24 overflow-hidden font-sans border-t border-[#1f2937]">
      
      {/* Grid Background Pattern */}
      <div 
        className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #ffffff 1px, transparent 1px),
            linear-gradient(to bottom, #ffffff 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        {/* Title */}
        <div className="flex items-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold tracking-wide">
            Arc FAQ
          </h2>
        </div>

        {/* Top Divider */}
        <div className="w-full h-[1px] bg-[#2a3241] mb-12" />

        {/* FAQ Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16">
          {faqData.map((item, index) => {
            const isOpen = openItems.includes(index);
            return (
              <div 
                key={index} 
                className={`flex flex-col py-8 ${
                  index < 2 ? 'border-b border-[#2a3241] md:pb-12' : 'md:pt-12'
                } ${index >= 2 && index < 3 ? 'border-b border-[#2a3241] pb-12 md:border-b-0 md:pb-8' : ''}`}
              >
                {/* Question Toggle Button */}
                <button 
                  onClick={() => toggleItem(index)}
                  className="text-lg md:text-[22px] font-mono text-white mb-4 flex items-start leading-tight text-left focus:outline-none group"
                >
                  <span className={`mr-3 inline-block transition-transform duration-300 ${isOpen ? 'rotate-90 text-emerald-400' : 'text-white group-hover:text-emerald-400'}`}>
                    {`>`}
                  </span>
                  <span className="group-hover:text-gray-300 transition-colors">{item.question}</span>
                </button>
                
                {/* Answer */}
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="text-[#9ca3af] leading-relaxed text-[15px] md:text-[16px] pl-7 pb-2">
                    {item.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
