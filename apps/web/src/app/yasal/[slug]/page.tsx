'use client';
import { useParams } from 'next/navigation';

const CONTENT: Record<string, [string, string]> = {
  gizlilik: ['Gizlilik Politikası & KVKK', 'ortakbul.org olarak 6698 sayılı KVKK ve GDPR kapsamında kişisel verilerinizi; üyelik, eşleştirme, ödeme ve yasal yükümlülükler amacıyla açık rızanıza dayanarak işleriz. Verileriniz güvenli sunucularda saklanır, açık rızanız olmadan üçüncü taraflarla paylaşılmaz. Erişim, düzeltme ve silme hakkına sahipsiniz. Başvuru: kvkk@ortakbul.org'],
  kosullar: ['Kullanım Koşulları', 'Platform, ortak arayan girişimciler ile yatırımcı, iş ortağı ve danışmanları buluşturan bir aracıdır. Taraflar arasındaki anlaşmaların tarafı değildir; ilan doğruluğu ilan sahibinin sorumluluğundadır. Öne çıkarma paketleri ücretlidir, sonuç garantisi vermez.'],
  cerez: ['Çerez Politikası', 'Zorunlu çerezler platformun çalışması için gereklidir. Analitik ve pazarlama çerezleri yalnızca açık onayınızla kullanılır. Tercihlerinizi istediğiniz zaman güncelleyebilirsiniz.'],
};

export default function Page() {
  const { slug } = useParams<{ slug: string }>();
  const [title, body] = CONTENT[slug] || CONTENT.gizlilik;
  return (
    <div className="form-page wrap">
      <div className="eyebrow">Yasal</div>
      <h1 style={{ fontSize: 'clamp(24px,3vw,32px)', marginBottom: 20 }}>{title}</h1>
      <div className="form-card"><p style={{ color: 'var(--text-dim)', fontSize: 14.5, lineHeight: 1.8 }}>{body}</p></div>
    </div>
  );
}
