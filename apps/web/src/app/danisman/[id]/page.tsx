'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useI18n, taxoName, countryName } from '@/lib/i18n';

const CAT_LABEL: Record<string, string> = {
  LAWYER: 'cat_lawyer', ACCOUNTANT: 'cat_accountant', SECTOR_EXPERT: 'cat_sector_expert',
  FINANCE_ADVISOR: 'cat_finance', MARKETING: 'cat_marketing', MANAGEMENT: 'cat_management',
};
const TIER_KEY: Record<string, string> = { NORMAL: 'tier_normal', FEATURED: 'tier_featured', PRIVILEGED: 'tier_privileged', SHOWCASE: 'tier_showcase' };
const FLAG: Record<string, string> = { TR: '🇹🇷', US: '🇺🇸', DE: '🇩🇪', GB: '🇬🇧', FR: '🇫🇷', ES: '🇪🇸', NL: '🇳🇱', RU: '🇷🇺', SA: '🇸🇦', AE: '🇦🇪', QA: '🇶🇦', AZ: '🇦🇿' };

function Row({ label, value }: { label: string; value: any }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '10px 0', borderBottom: '1px solid var(--line)', fontSize: 14 }}>
      <span style={{ color: 'var(--text-faint)' }}>{label}</span>
      <span style={{ color: 'var(--text)', fontWeight: 600, textAlign: 'right' }}>{String(value)}</span>
    </div>
  );
}

export default function Page() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { t, lang } = useI18n();
  const [c, setC] = useState<any>(null);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const catName = (cat: string) => (CAT_LABEL[cat] ? t(CAT_LABEL[cat]) : cat);

  useEffect(() => {
    api.get('/consultants')
      .then((list: any[]) => {
        const found = list.find((x) => x.id === id || x.user?.id === id);
        if (!found) setError(t('cd_not_found'));
        else setC(found);
      })
      .catch((e) => setError(e.message));
  }, [id]);

  const requestConsultancy = async () => {
    if (!user) { window.location.href = '/giris'; return; }
    const need = window.prompt(t('cons_req_prompt'));
    if (!need) return;
    try {
      await api.post(`/consultants/${c.user.id}/questions`, { question: `[${t('cons_offer')}] ${need}` });
      setMsg(t('cons_req_sent'));
    } catch (e: any) { setMsg(e.message); }
  };

  if (error) return <div className="wrap section-tight"><div className="empty-state">{error}</div></div>;
  if (!c) return <div className="wrap section-tight"><div className="spinner">{t('loading')}</div></div>;

  return (
    <div className="wrap detail-wrap">
      <div className="detail-main">
        <div className="tag-row" style={{ marginBottom: 16 }}>
          {c.tier && c.tier !== 'NORMAL' && <span className={`tier-badge tier-${c.tier}`}><span className="dot" />{t(TIER_KEY[c.tier] || 'tier_normal').toUpperCase()}</span>}
          <span className="tag">{catName(c.category)}</span>
          {c.sector && <span className="tag struct">{taxoName(c.sector, lang)}</span>}
          {c.verified && <span className="tag struct">✓ {t('cd_verified')}</span>}
        </div>
        <h1>{c.user?.fullName}</h1>
        <p style={{ marginTop: 6 }}>
          <span style={{ color: 'var(--accent-a)', fontWeight: 700 }}>{catName(c.category)}</span>
          <span style={{ color: 'var(--text-faint)' }}> · {FLAG[c.user?.countryCode] || '🌍'} {c.user?.city || '—'}</span>
        </p>

        {c.bio && <div className="block"><h3>{t('cd_about')}</h3><p>{c.bio}</p></div>}

        {Array.isArray(c.tags) && c.tags.length > 0 && (
          <div className="block">
            <h3>{t('cd_expertise')}</h3>
            <div className="tag-row" style={{ marginTop: 4 }}>
              {c.tags.map((tg: string) => <span className="tag struct" key={tg}>{tg}</span>)}
            </div>
          </div>
        )}

        <div className="block">
          <h3>{t('cd_profile')}</h3>
          <Row label={t('cd_category')} value={catName(c.category)} />
          <Row label={t('st_sector')} value={taxoName(c.sector, lang)} />
          <Row label={t('cd_experience')} value={c.experienceYears ? `${c.experienceYears} ${t('cd_years')}` : undefined} />
          <Row label={t('cd_country_city')} value={`${c.user?.countryCode ? countryName(c.user.countryCode, lang) : ''} · ${c.user?.city || '—'}`} />
          <Row label={t('cd_rating')} value={c.ratingAvg ? `★ ${c.ratingAvg.toFixed(1)} (${c.reviewsCount} ${t('cd_reviews')})` : undefined} />
          <Row label={t('cd_assigned')} value={c.user?._count?.assignments ?? 0} />
          <Row label={t('cd_verified')} value={c.verified ? t('yes') : t('no')} />
        </div>
      </div>

      <div>
        <div className="side-card side-actions">
          <button className="btn btn-primary" onClick={requestConsultancy}>{t('cd_offer')}</button>
          <Link href="/danismanlar" className="btn btn-ghost">{t('cd_all')}</Link>
          {msg && <div className="alert alert-success" style={{ marginTop: 4 }}><span className="alert-ico">✅</span><div>{msg}</div></div>}
        </div>

        <div className="side-card">
          <h4 style={{ marginBottom: 12 }}>{t('d_contact_info')}</h4>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--line)', fontSize: 13.5 }}>
            <span style={{ color: 'var(--text-faint)' }}>{t('f_phone')}</span><b style={{ letterSpacing: '.5px' }}>+90 5** *** ** **</b>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', fontSize: 13.5 }}>
            <span style={{ color: 'var(--text-faint)' }}>{t('f_email')}</span><b style={{ letterSpacing: '.5px' }}>****@****.***</b>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 10 }}>{t('d_contact_hidden')}</p>
        </div>
      </div>
    </div>
  );
}
