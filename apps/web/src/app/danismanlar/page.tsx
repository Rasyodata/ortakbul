'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useI18n, countryName, taxoName } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import PagedGrid from '@/components/PagedGrid';

const CAT_LABEL: Record<string, string> = {
  LAWYER: 'cat_lawyer', ACCOUNTANT: 'cat_accountant', SECTOR_EXPERT: 'cat_sector_expert',
  FINANCE_ADVISOR: 'cat_finance', MARKETING: 'cat_marketing', MANAGEMENT: 'cat_management',
};
const CATS = Object.entries(CAT_LABEL);
const SECTORS = ['Teknoloji', 'Yazılım', 'E-ticaret', 'Sağlık', 'Tarım', 'Finans', 'Lojistik', 'Üretim', 'Turizm', 'Gıda', 'Eğitim', 'Sürdürülebilirlik'];
const COUNTRIES = [['TR', '🇹🇷 Türkiye'], ['US', '🇺🇸 ABD'], ['DE', '🇩🇪 Almanya'], ['GB', '🇬🇧 BK'], ['FR', '🇫🇷 Fransa'], ['ES', '🇪🇸 İspanya'], ['NL', '🇳🇱 Hollanda'], ['RU', '🇷🇺 Rusya'], ['SA', '🇸🇦 S.Arabistan'], ['AE', '🇦🇪 BAE'], ['QA', '🇶🇦 Katar'], ['AZ', '🇦🇿 Azerbaycan']];
const FLAG: Record<string, string> = { TR: '🇹🇷', US: '🇺🇸', DE: '🇩🇪', GB: '🇬🇧', FR: '🇫🇷', ES: '🇪🇸', NL: '🇳🇱', RU: '🇷🇺', SA: '🇸🇦', AE: '🇦🇪', QA: '🇶🇦', AZ: '🇦🇿' };

export default function Page() {
  const { t, lang } = useI18n();
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sectorFilter, setSectorFilter] = useState('');
  const [showApply, setShowApply] = useState(false);
  const [applyMsg, setApplyMsg] = useState('');
  const [reqMsg, setReqMsg] = useState('');

  const requestConsultancy = async (c: any) => {
    if (!user) { window.location.href = '/giris'; return; }
    const need = window.prompt(t('cons_req_prompt'));
    if (!need) return;
    try {
      await api.post(`/consultants/${c.user.id}/questions`, { question: `[${t('cons_offer')}] ${need}` });
      setReqMsg(t('cons_req_sent'));
    } catch (e: any) { setReqMsg(e.message); }
  };

  const load = () => {
    setLoading(true);
    api.get('/consultants').then(setItems).catch((e) => setError(e.message)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const TIER_W: Record<string, number> = { NORMAL: 1, FEATURED: 2, PRIVILEGED: 3, SHOWCASE: 4 };
  const filtered = sectorFilter ? items.filter((c) => c.sector === sectorFilter) : items;
  // Öne çıkarmaya (pakete) göre sıralı, grup içinde puana göre
  const sorted = [...filtered].sort((a, b) => (TIER_W[b.tier] || 1) - (TIER_W[a.tier] || 1) || (b.ratingAvg || 0) - (a.ratingAvg || 0));
  const TIER_KEY: Record<string, string> = { FEATURED: 'tier_featured', PRIVILEGED: 'tier_privileged', SHOWCASE: 'tier_showcase' };

  const avgRating = items.length ? (items.reduce((s, c) => s + (c.ratingAvg || 0), 0) / items.length).toFixed(1) : '—';
  const sectorCount = new Set(items.map((c) => c.sector)).size;

  const apply = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await api.post('/consultants/apply', {
        category: fd.get('category'), sector: fd.get('sector'), city: fd.get('city'),
        experienceYears: Number(fd.get('experienceYears')) || 0, bio: fd.get('bio'),
        countryCode: fd.get('countryCode'),
        tags: String(fd.get('tags') || '').split(',').map((s) => s.trim()).filter(Boolean),
      });
      setApplyMsg(t('ca_sent'));
      setShowApply(false);
      load();
    } catch (err: any) { setApplyMsg('Hata: ' + err.message); }
  };

  const Card = ({ c }: { c: any }) => (
    <div className="person-card" style={c.tier && c.tier !== 'NORMAL' ? { borderColor: 'var(--accent-a)' } : undefined}>
      {c.tier && c.tier !== 'NORMAL' && (
        <span className={`tier-badge tier-${c.tier}`} style={{ marginBottom: 10 }}><span className="dot" />{t(TIER_KEY[c.tier] || 'tier_normal').toUpperCase()}</span>
      )}
      <Link href={`/danisman/${c.id}`} className="person-top" style={{ textDecoration: 'none' }}>
        <span className="person-avatar">{(c.user?.fullName || '?').slice(0, 2).toUpperCase()}</span>
        <div>
          <h4>{c.user?.fullName}{c.verified ? ' ✓' : ''}</h4>
          <div className="person-role">{CAT_LABEL[c.category] ? t(CAT_LABEL[c.category]) : c.category}</div>
          <div style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 2 }}>
            {taxoName(c.sector, lang)} · {FLAG[c.user?.countryCode] || '🌍'} {c.user?.city || '—'}
          </div>
        </div>
      </Link>
      {c.bio && <p style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 12 }}>{c.bio}</p>}
      {Array.isArray(c.tags) && c.tags.length > 0 && (
        <div className="tag-row" style={{ marginTop: 10 }}>
          {c.tags.slice(0, 4).map((tg: string) => <span className="tag struct" key={tg}>{tg}</span>)}
        </div>
      )}
      <div className="person-stats">
        <span className="person-stat"><b>★ {c.ratingAvg?.toFixed(1) ?? '—'}</b> ({c.reviewsCount})</span>
        <span className="person-stat"><b>{c.experienceYears}</b> {t('cons_exp')}</span>
        <span className="person-stat"><b>{c.user?._count?.assignments ?? 0}</b> {t('cons_assigned')}</span>
        <span className="person-stat"><b style={{ color: 'var(--pink)' }}>❤ {String(new Date(c.createdAt).getDate()).padStart(2, '0')}</b> {t('lc_fav')}</span>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => requestConsultancy(c)}>
          {t('cons_offer')}
        </button>
        <Link href={`/danisman/${c.id}`} className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
          {t('cons_profile')}
        </Link>
      </div>
    </div>
  );

  return (
    <div className="wrap section-tight">
      <div className="listing-head" style={{ paddingTop: 0 }}>
        <div>
          <div className="eyebrow">{t('cons_eb')}</div>
          <h1 style={{ fontSize: 'clamp(26px,3.4vw,34px)' }}>{t('cons_t')}</h1>
          <p className="kicker">{t('cons_s')}</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => { setShowApply((s) => !s); setApplyMsg(''); }}>
          {showApply ? t('cons_close') : t('cons_apply')}
        </button>
      </div>

      {/* Sağ üst: Danışman Ol formu */}
      {showApply && (
        <div className="form-card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 16, marginBottom: 14 }}>{t('ca_title')}</h3>
          {!user ? (
            <p style={{ color: 'var(--text-dim)', fontSize: 14 }}>
              <Link href="/giris" style={{ color: 'var(--accent-a)' }}>{t('btn_login')}</Link> · <Link href="/kayit" style={{ color: 'var(--accent-a)' }}>{t('create_account')}</Link> — {t('ca_login_first')}
            </p>
          ) : (
            <form onSubmit={apply}>
              <div className="field-row">
                <div className="field"><label>{t('ca_category')}</label><select name="category">{CATS.map(([k, l]) => <option key={k} value={k}>{t(l)}</option>)}</select></div>
                <div className="field"><label>{t('st_sector')}</label><select name="sector">{SECTORS.map((sec) => <option key={sec} value={sec}>{taxoName(sec, lang)}</option>)}</select></div>
              </div>
              <div className="field-row">
                <div className="field"><label>{t('f_country')}</label><select name="countryCode" defaultValue="TR">{COUNTRIES.map(([k, l]) => <option key={k} value={k}>{l.split(' ')[0]} {countryName(k, lang)}</option>)}</select></div>
                <div className="field"><label>{t('f_city')}</label><input required name="city" placeholder="İstanbul" /></div>
              </div>
              <div className="field"><label>{t('ca_exp_years')}</label><input required type="number" name="experienceYears" placeholder="8" /></div>
              <div className="field">
                <label>{t('ca_tags')}</label>
                <input name="tags" placeholder="Örn. Ceza Hukuku, Ticaret Hukuku, KVKK" />
                <span style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 6, display: 'block' }}>{t('ca_tags_hint')}</span>
              </div>
              <div className="field"><label>{t('ca_bio')}</label><textarea required name="bio" /></div>
              <button className="btn btn-primary btn-sm" type="submit">{t('ca_submit')}</button>
            </form>
          )}
        </div>
      )}
      {applyMsg && <div className="alert alert-success" style={{ marginBottom: 20 }}><span className="alert-ico">✅</span><div>{applyMsg}</div></div>}
      {reqMsg && <div className="alert alert-success" style={{ marginBottom: 20 }}><span className="alert-ico">✅</span><div>{reqMsg}</div></div>}

      {/* İstatistik / analiz şeridi */}
      <div className="stat-strip" style={{ marginTop: 8 }}>
        <div><div className="num">{items.length}</div><div className="lbl">{t('cons_stat_approved')}</div></div>
        <div><div className="num">{sectorCount}</div><div className="lbl">{t('st_sector')}</div></div>
        <div><div className="num">{CATS.length}</div><div className="lbl">{t('cons_stat_dal')}</div></div>
        <div><div className="num">★ {avgRating}</div><div className="lbl">{t('cons_stat_rating')}</div></div>
      </div>

      {/* Sektör filtresi */}
      <div className="filters" style={{ marginTop: 24 }}>
        <select value={sectorFilter} onChange={(e) => setSectorFilter(e.target.value)}>
          <option value="">{t('f_all_sectors')}</option>
          {SECTORS.map((sec) => <option key={sec} value={sec}>{taxoName(sec, lang)}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="spinner">{t('loading')}</div>
      ) : error ? (
        <div className="empty-state">{t('empty_api')}: {error}</div>
      ) : (
        <PagedGrid<any>
          items={sorted}
          gated
          gateLabel={t('gate_title')}
          searchPlaceholder={t('search_consultant_ph')}
          gridClass="idea-list-grid"
          initialSize={12}
          toText={(c) => [c.user?.fullName, c.sector, (CAT_LABEL[c.category] ? t(CAT_LABEL[c.category]) : c.category), c.user?.city, ...(c.tags || [])].filter(Boolean).join(' ')}
          render={(c) => <Card c={c} />}
        />
      )}
    </div>
  );
}
