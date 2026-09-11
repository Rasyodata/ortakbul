import './globals.css';
import type { Metadata } from 'next';
import Providers from '@/components/Providers';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import CookieBanner from '@/components/CookieBanner';
import SiteScripts from '@/components/SiteScripts';
import AnnouncementBanner from '@/components/AnnouncementBanner';

export const metadata: Metadata = {
  title: 'ortakbul.org — Ortağını bul, fikrini büyüt',
  description: 'Ortak arayanla ortak olmak isteyeni buluşturan platform.',
  icons: { icon: '/icon.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" dir="ltr">
      <body>
        <Providers>
          <div className="bg-grid" />
          <Nav />
          <main>{children}</main>
          <Footer />
          <CookieBanner />
          <AnnouncementBanner />
          <SiteScripts />
        </Providers>
      </body>
    </html>
  );
}
