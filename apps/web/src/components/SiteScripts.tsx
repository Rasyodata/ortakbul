'use client';
import { useEffect } from 'react';
import { useSiteSettings } from '@/lib/siteSettings';

// Panelden girilen <head>/<body> scriptlerini (Google Search Console doğrulama,
// Analytics/Ads, özel JS/meta) sayfaya enjekte eder. innerHTML script çalıştırmadığı
// için script elemanları gerçek olarak yeniden oluşturulur.
function inject(html: string | undefined, target: HTMLElement, key: string) {
  if (!html || document.getElementById('site-inject-' + key)) return;
  const marker = document.createElement('meta');
  marker.id = 'site-inject-' + key;
  target.appendChild(marker);
  const wrap = document.createElement('div');
  wrap.innerHTML = html;
  Array.from(wrap.childNodes).forEach((node) => {
    if ((node as HTMLElement).tagName === 'SCRIPT') {
      const src = node as HTMLScriptElement;
      const el = document.createElement('script');
      Array.from(src.attributes).forEach((a) => el.setAttribute(a.name, a.value));
      el.text = src.textContent || '';
      target.appendChild(el);
    } else {
      target.appendChild(node);
    }
  });
}

export default function SiteScripts() {
  const s = useSiteSettings();
  useEffect(() => {
    if (!s) return;
    inject(s.headScripts, document.head, 'head');
    inject(s.bodyScripts, document.body, 'body');
  }, [s]);
  return null;
}
