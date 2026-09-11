'use client';
import { useEffect, useState } from 'react';
import { api } from './api';

export interface Announcement {
  enabled: boolean;
  title: string;
  message: string;
  imageUrl?: string;
  position?: 'center' | 'bottom-right' | 'bottom-left' | 'top-center';
  ctaText?: string;
  ctaLink?: string;
  version?: string;
}
export interface SiteSettings {
  socialLinks: Record<string, string>;
  headScripts: string;
  bodyScripts: string;
  announcement?: Announcement;
}

let cache: SiteSettings | null = null;

export function useSiteSettings(): SiteSettings | null {
  const [s, setS] = useState<SiteSettings | null>(cache);
  useEffect(() => {
    if (cache) { setS(cache); return; }
    api.get<SiteSettings>('/site-settings').then((r) => { cache = r; setS(r); }).catch(() => {});
  }, []);
  return s;
}
