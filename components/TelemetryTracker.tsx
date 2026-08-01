'use client';

import { useEffect, useRef } from 'react';

export default function TelemetryTracker() {
  const telemetryData = useRef({
    maxScrollDepth: 0,
    timeOnPageSeconds: 0,
    calculatorInteractions: 0,
    sectionsViewed: new Set<string>(),
  });

  useEffect(() => {
    const startTime = Date.now();

    // 1. Scroll Depth Tracker
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentDepth = Math.round((window.scrollY / totalHeight) * 100);
        if (currentDepth > telemetryData.current.maxScrollDepth) {
          telemetryData.current.maxScrollDepth = currentDepth;
        }
      }
    };

    // 2. Intersection Observer for Section Engagement
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target.id) {
            telemetryData.current.sectionsViewed.add(entry.target.id);
          }
        });
      },
      { threshold: 0.3 }
    );

    document.querySelectorAll('section[id]').forEach((section) => {
      observer.observe(section);
    });

    window.addEventListener('scroll', handleScroll, { passive: true });

    // 3. Flush Telemetry on Page Unload or Tab Blur
    const syncTelemetry = () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      telemetryData.current.timeOnPageSeconds = timeSpent;

      const payload = JSON.stringify({
        sessionId: sessionStorage.getItem('inclusy_session_id') || 'anon-' + startTime,
        scrollDepth: telemetryData.current.maxScrollDepth,
        timeOnPage: timeSpent,
        sections: Array.from(telemetryData.current.sectionsViewed),
      });

      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/telemetry', payload);
      }
    };

    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') syncTelemetry();
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  return null; // Silent background component
}
