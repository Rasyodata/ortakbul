'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';
import { ListingCard, Listing } from '@/components/ListingGrid';
import PagedGrid from '@/components/PagedGrid';

export default function Page() {
  const { user, ready, logout } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const doLogout = async (allDevices: boolean) => { await logout(allDevices); router.push('/'); };
  const [mine, setMine] = useState<Listing[]>([]);
  const [pay, setPay] = useState('');

  useEffect(() => {
    if (user) api.get<Listing[]>('/listings/mine').then(setMine).catch(() => {});
  }, [user]);

  const upgrade = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      const r = await api.post('/payments/checkout', { listingId: fd.get('listingId'), tier: fd.get('tier') });
      setPay(`Ödeme başlatıldı (${r.checkout?.provider}). Yönlendirme: ${r.checkout?.redirectUrl || r.checkout?.token}`);
    } catch (err: any) { setPay('Hata: ' + err.message); }
  };

  if (ready && !user) {
    return <div className="wrap section-tight"><div className="empty-state">{t('gate_title')} <Link href="/giris" style={{ color: 'var(--accent-a)' }}>{t('btn_login')}</Link></div></div>;
  }
  if (!user) return <div className="wrap"><div className="spinner">...</div></div>;

  return (
    <div className="wrap">
      <div style={{ display: 'flex', gap: 22, alignItems: 'center', padding: '52px 0 20px', borderBottom: '1px solid var(--line)' }}>
        <span className="person-avatar" style={{ width: 74, height: 74, fontSize: 26 }}>{user.fullName.slice(0, 2).toUpperCase()}</span>
        <div>
          <h2 style={{ fontSize: 22 }}>{user.fullName}</h2>
          <p style={{ color: 'var(--text-faint)', fontSize: 13.5, marginTop: 4 }}>{user.memberType} · {user.email} · {user.countryCode}</p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => doLogout(false)}>{t('prof_logout')}</button>
          <button className="btn btn-ghost btn-sm" style={{ color: '#f2716a', borderColor: 'rgba(242,113,106,.3)' }} onClick={() => doLogout(true)}>{t('prof_logout_all')}</button>
        </div>
      </div>
      {user.status === 'PENDING' ? (
        <div className="alert alert-warn" style={{ marginTop: 20 }}><span className="alert-ico">⏳</span><div>{t('prof_pending')}</div></div>
      ) : (
        <div className="alert alert-success" style={{ marginTop: 20 }}><span className="alert-ico">✅</span><div>{t('prof_approved')}</div></div>
      )}

      <div style={{ marginTop: 26 }}>
        <h3 style={{ fontSize: 15.5, marginBottom: 14 }}>{t('prof_my_listings')}</h3>
        {mine.length ? (
          <PagedGrid<Listing>
            items={mine}
            toText={(l) => [l.title, l.short, l.category, l.sector, l.city].filter(Boolean).join(' ')}
            render={(l) => <ListingCard l={l} />}
          />
        ) : (
          <div className="empty-state">{t('prof_no_listings')} <Link href="/paylas" style={{ color: 'var(--accent-a)' }}>{t('nav_share')}</Link></div>
        )}
      </div>

      {mine.length > 0 && (
        <div style={{ marginTop: 26, paddingBottom: 80 }}>
          <h3 style={{ fontSize: 15.5, marginBottom: 14 }}>İlanını öne çıkar (paket satın al)</h3>
          <div className="form-card" style={{ maxWidth: 560 }}>
            <form onSubmit={upgrade}>
              <div className="field-row">
                <div className="field"><label>İlan</label>
                  <select name="listingId">{mine.map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}</select>
                </div>
                <div className="field"><label>Paket</label>
                  <select name="tier">
                    <option value="FEATURED">Öne Çıkan — ₺249</option>
                    <option value="PRIVILEGED">Ayrıcalıklı — ₺599</option>
                    <option value="SHOWCASE">Vitrin — ₺1.499</option>
                  </select>
                </div>
              </div>
              <button className="btn btn-primary btn-sm" type="submit">Ödemeye Geç</button>
            </form>
            {pay && <div className="approval-banner ok" style={{ marginTop: 14 }}>{pay}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
