'use client';

import React, { useState, useEffect } from 'react';

// Initial data moved to database

export default function Timeline({ initialTimelineData }: { initialTimelineData: any[] }) {
  const [timelineData, setTimelineData] = useState(initialTimelineData);
  const [desktopProgress, setDesktopProgress] = useState(0);
  const [mobileProgress, setMobileProgress] = useState<number[]>([0, 0, 0, 0]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Simulating live time passing. In reality this is just new Date()
    const now = new Date();

    let activeIndex = -1;
    for (let i = initialTimelineData.length - 1; i >= 0; i--) {
      if (now >= initialTimelineData[i].date) {
        activeIndex = i;
        break;
      }
    }

    const updatedData = initialTimelineData.map((item, index) => {
      // Ensure date is a Date object (if it came from JSON serialization)
      const dateObj = new Date(item.date);
      if (index < activeIndex) return { ...item, date: dateObj, status: 'completed' };
      if (index === activeIndex) return { ...item, date: dateObj, status: 'active' };
      return { ...item, date: dateObj, status: 'upcoming' };
    });

    setTimelineData(updatedData);

    let currentDesktopProgress = 0;
    const newMobileProgress = [0, 0, 0, 0];

    if (activeIndex === -1) {
      currentDesktopProgress = 0;
    } else if (activeIndex === initialTimelineData.length - 1) {
      currentDesktopProgress = 100;
      newMobileProgress.fill(100);
    } else {
      const startNode = initialTimelineData[activeIndex];
      const endNode = initialTimelineData[activeIndex + 1];
      const startTime = new Date(startNode.date).getTime();
      const endTime = new Date(endNode.date).getTime();
      const timePassed = now.getTime() - startTime;
      const totalTime = endTime - startTime;
      const ratio = Math.max(0, Math.min(1, timePassed / totalTime));

      const nodePercentage = 100 / initialTimelineData.length;
      currentDesktopProgress = (activeIndex * nodePercentage) + (ratio * nodePercentage);

      for (let i = 0; i < activeIndex; i++) newMobileProgress[i] = 100;
      newMobileProgress[activeIndex] = ratio * 100;
    }

    // Add a slight delay for the animation to look nice when mounting
    setTimeout(() => {
      setDesktopProgress(currentDesktopProgress);
      setMobileProgress(newMobileProgress);
    }, 100);

  }, []);

  return (
    <section id="timeline" className="min-h-screen relative w-full bg-[#0b101e] text-white py-24 overflow-hidden font-sans">

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
        <h2 className="text-4xl md:text-5xl font-bold tracking-wide mb-20 flex items-center">
          TIMELINE
          <span className="w-8 h-1 bg-white ml-2 translate-y-2 inline-block"></span>
        </h2>

        {/* Timeline Container */}
        <div className="relative w-full">
          {/* Main Horizontal Line (hidden on mobile, shown on md and up) */}
          <div className="hidden md:block absolute top-[11px] left-0 right-0 h-[1px] bg-[#374151]">
            {/* Desktop Progress Fill */}
            <div
              className="h-full bg-[#22d3ee] transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(34,211,238,0.5)]"
              style={{ width: mounted ? `${desktopProgress}%` : '0%' }}
            />
          </div>

          {/* Timeline Nodes */}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-4 relative">
            {timelineData.map((item, index) => (
              <div key={item.id} className="relative pt-[40px] md:pt-[50px] group">

                {/* Connector line for mobile (vertical) */}
                {index !== timelineData.length - 1 && (
                  <div className="absolute top-[24px] left-[11px] bottom-[-48px] w-[1px] bg-[#374151] md:hidden">
                    {/* Mobile Progress Fill */}
                    <div
                      className="w-full bg-[#22d3ee] transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                      style={{ height: mounted ? `${mobileProgress[index]}%` : '0%' }}
                    />
                  </div>
                )}

                {/* Circle Indicator */}
                <div
                  className={`
                    absolute left-0 top-0 w-[24px] h-[24px] rounded-full flex items-center justify-center bg-[#0b101e] z-10 transition-colors duration-500
                    ${item.status === 'upcoming' ? 'border-2 border-[#4b5563]' : ''}
                    ${item.status === 'completed' ? 'border-[2px] border-[#22d3ee]' : ''}
                    ${item.status === 'active' ? 'bg-[#22d3ee] shadow-[0_0_15px_rgba(34,211,238,0.8)] border-[2px] border-[#22d3ee]' : ''}
                  `}
                >
                  {/* Inner dot for completed */}
                  {item.status === 'completed' && (
                    <div className="w-[8px] h-[8px] bg-[#22d3ee] rounded-full" />
                  )}
                </div>

                {/* Content */}
                <div className="ml-10 md:ml-0 pr-4">
                  <p className="text-[#d5b3e5] font-mono text-sm md:text-base mb-2">{item.dateStr}</p>
                  <h3 className="text-xl font-bold text-white mb-2 tracking-wide">{item.title}</h3>
                  <p className="text-[#9ca3af] text-sm leading-relaxed md:max-w-[250px]">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
