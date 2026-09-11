'use client';
import KadinSection from '../kadin/page';
import MelekSection from '../melek/page';

// Kadın Girişimciler + Melek Yatırımcı tek sayfada.
export default function Page() {
  return (
    <>
      <KadinSection />
      <MelekSection />
    </>
  );
}
