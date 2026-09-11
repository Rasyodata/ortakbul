'use client';
import { useEffect, useRef, useState } from 'react';

// 0'dan hedef değere yumuşak sayan animasyonlu sayaç.
// Görünür alana girince başlar (IntersectionObserver).
export default function CountUp({
  value, duration = 1400, format,
}: { value: number; duration?: number; format?: (n: number) => string }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (!value) return;
    const el = ref.current;
    const animate = () => {
      if (ran.current) { setN(value); return; }
      ran.current = true;
      const start = performance.now();
      const tick = (t: number) => {
        const p = Math.min(1, (t - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
        setN(value * eased);
        if (p < 1) requestAnimationFrame(tick);
        else setN(value);
      };
      requestAnimationFrame(tick);
    };
    if (!el || typeof IntersectionObserver === 'undefined') { animate(); return; }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { animate(); io.disconnect(); }
    }, { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, [value, duration]);

  return <span ref={ref}>{format ? format(n) : Math.round(n).toLocaleString('tr-TR')}</span>;
}
