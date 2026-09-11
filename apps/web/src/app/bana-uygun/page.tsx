'use client';
import Link from 'next/link';
import { useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useI18n, countryName, taxoName } from '@/lib/i18n';
import Alert from '@/components/Alert';
import { vName, vEmail, vPhone, vChecked, maskPhone } from '@/lib/validation';

const SECTORS = ['Teknoloji', 'Yazılım', 'E-ticaret', 'Eğitim', 'Sağlık', 'Tarım', 'Finans', 'Lojistik', 'Üretim', 'Turizm', 'Gıda', 'Perakende', 'İnşaat', 'Hizmet'];
const BUSINESS_TYPES = ['Home Ofis', 'E-Ticaret', 'Üretim', 'Perakende', 'İhracat', 'İthalat', 'Hizmet'];
const COUNTRY_CODES = ['TR', 'US', 'DE', 'GB', 'FR', 'ES', 'NL', 'RU', 'SA', 'AE', 'QA', 'AZ'];
const OPP_TYPES: [string, string, string][] = [
  ['IDEA', '💡', 'lt_idea'], ['PARTNERSHIP', '🤝', 'lt_partnership'], ['COMPANY_SALE', '🏢', 'lt_company'],
  ['FRANCHISE', '🔑', 'lt_franchise'], ['INVESTOR_CAPITAL', '😇', 'ty_investor'],
  ['MENTOR_DECIDE', '🧭', 'bf_opt_decide'],
];
const BUDGETS: [string, string][] = [['b1', '0 – 100.000 ₺'], ['b2', '100.000 – 500.000 ₺'], ['b3', '500.000 – 1.000.000 ₺'], ['b4', '1.000.000 ₺ +']];
const WORK: [string, string][] = [['fulltime', 'ws_fulltime'], ['parttime', 'ws_parttime'], ['passive', 'ws_passive']];
const RISK: [string, string][] = [['low', 'risk_low'], ['medium', 'risk_medium'], ['high', 'risk_high']];

export default function Page() {
  const { user } = useAuth();
  const { t, lang } = useI18n();
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('TR');
  const [city, setCity] = useState('');
  const [budgetTier, setBudgetTier] = useState('');
  const [sectors, setSectors] = useState<string[]>([]);
  const [opportunityTypes, setOppTypes] = useState<string[]>([]);
  const [businessTypes, setBusinessTypes] = useState<string[]>([]);
  const [workStyle, setWorkStyle] = useState('');
  const [risk, setRisk] = useState('');
  const [experience, setExperience] = useState('');
  const [goal, setGoal] = useState('');
  const [accepted, setAccepted] = useState(false);

  const toggle = (arr: string[], set: (v: string[]) => void, v: string) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const submit = async () => {
    setErr('');
    const ne = vName(fullName);
    if (ne) return setErr(t(ne));
    if (email && vEmail(email)) return setErr(t(vEmail(email)!));
    if (phone && vPhone(phone)) return setErr(t(vPhone(phone)!));
    if (!email && !phone) return setErr(t('v_required'));
    if (!budgetTier) return setErr(`${t('bf_budget')} — ${t('v_required')}`);
    const ce = vChecked(accepted);
    if (ce) return setErr(t(ce));
    setBusy(true);
    try {
      await api.post('/match-requests', {
        fullName, email: email || undefined, phone: phone || undefined,
        countryCode, city: city || undefined, budgetTier,
        sectors, opportunityTypes, businessTypes,
        workStyle: workStyle || undefined, risk: risk || undefined,
        experience: experience || undefined, goal: goal || undefined,
      });
      setDone(true);
      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e: any) { setErr(e.message); }
    finally { setBusy(false); }
  };

  if (done) {
    return (
      <div className="wrap" style={{ maxWidth: 640, padding: '60px 20px 90px' }}>
        <div className="mentor-form" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 44, marginBottom: 10 }}>🎯</div>
          <h1 style={{ fontSize: 26, color: 'var(--green)', marginBottom: 12 }}>{t('bf_done_t')}</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: 15.5, lineHeight: 1.6, maxWidth: 460, margin: '0 auto 22px' }}>{t('bf_done_d')}</p>
          <Link href="/" className="btn btn-primary">{t('nav_home')}</Link>
        </div>
      </div>
    );
  }

  const Q = ({ n, label, hint, children }: { n: number; label: string; hint?: string; children: React.ReactNode }) => (
    <div className="q-block">
      <div className="q-head">
        <span className="q-num">{n}</span>
        <span className="q-label">{label}</span>
        {hint && <span className="q-hint">{hint}</span>}
      </div>
      <div className="q-body">{children}</div>
    </div>
  );

  return (
    <div className="wrap">
      <div className="mentor-hero">
        <div className="eyebrow">{t('bf_eb')}</div>
        <h1>{t('bf_title')}</h1>
        <p>{t('bf_sub')}</p>
        <div className="trust-row">
          <span className="trust-chip">✓ {t('free')}</span>
          <span className="trust-chip">🔒 {t('bf_trust_private')}</span>
          <span className="trust-chip">🧑‍🏫 {t('bf_trust_expert')}</span>
        </div>
      </div>

      <div className="mentor-layout">
        <aside className="mentor-aside">
          <div className="aside-card">
            <h4>{t('bf_how')}</h4>
            <div className="aside-step"><span className="n">1</span><div><div className="st-t">{t('bf_step1_t')}</div><div className="st-d">{t('bf_step1_d')}</div></div></div>
            <div className="aside-step"><span className="n">2</span><div><div className="st-t">{t('bf_step2_t')}</div><div className="st-d">{t('bf_step2_d')}</div></div></div>
            <div className="aside-step"><span className="n">3</span><div><div className="st-t">{t('bf_step3_t')}</div><div className="st-d">{t('bf_step3_d')}</div></div></div>
          </div>
          <div className="aside-card aside-note">
            <p dangerouslySetInnerHTML={{ __html: t('bf_free_note') }} />
          </div>
        </aside>

        <div className="mentor-form">
          {err && <Alert kind="error">{err}</Alert>}

          <Q n={1} label={t('bf_budget')}>
            <div className="budget-cards">
              {BUDGETS.map(([k, lbl]) => (
                <div key={k} className={`budget-card${budgetTier === k ? ' on' : ''}`} onClick={() => setBudgetTier(k)}>
                  <div className="bc-v">{lbl}</div>
                </div>
              ))}
            </div>
          </Q>

          <Q n={2} label={t('bf_optypes')} hint={`(${t('bf_multi')})`}>
            <div className="opt-cards">
              {OPP_TYPES.map(([k, emoji, lblKey]) => (
                <div key={k} className={`opt-card${opportunityTypes.includes(k) ? ' on' : ''}${k === 'MENTOR_DECIDE' ? ' opt-decide' : ''}`} onClick={() => toggle(opportunityTypes, setOppTypes, k)}>
                  <span className="oc-emoji">{emoji}</span>
                  <div className="oc-lbl">{t(lblKey)}</div>
                </div>
              ))}
            </div>
            <div className="decide-note"><span>🛡️</span><p>{t('bf_decide_note')}</p></div>
          </Q>

          <Q n={3} label={t('bf_sectors')} hint={`(${t('bf_multi')})`}>
            <div className="optset">
              {SECTORS.map((s) => (
                <button type="button" key={s} className={`chip-btn${sectors.includes(s) ? ' on' : ''}`} onClick={() => toggle(sectors, setSectors, s)}>{taxoName(s, lang)}</button>
              ))}
            </div>
          </Q>

          <Q n={4} label={t('bf_biztypes')} hint={`(${t('bf_multi')})`}>
            <div className="optset">
              {BUSINESS_TYPES.map((b) => (
                <button type="button" key={b} className={`chip-btn${businessTypes.includes(b) ? ' on' : ''}`} onClick={() => toggle(businessTypes, setBusinessTypes, b)}>{taxoName(b, lang)}</button>
              ))}
            </div>
          </Q>

          <Q n={5} label={t('bf_workstyle')}>
            <div className="optset" style={{ marginBottom: 18 }}>
              {WORK.map(([k, lblKey]) => (
                <button type="button" key={k} className={`chip-btn${workStyle === k ? ' on' : ''}`} onClick={() => setWorkStyle(k)}>{t(lblKey)}</button>
              ))}
            </div>
            <div className="q-label" style={{ fontSize: 14, marginBottom: 9 }}>{t('bf_risk')}</div>
            <div className="optset">
              {RISK.map(([k, lblKey]) => (
                <button type="button" key={k} className={`chip-btn${risk === k ? ' on' : ''}`} onClick={() => setRisk(k)}>{t(lblKey)}</button>
              ))}
            </div>
          </Q>

          <Q n={6} label={t('bf_experience')}>
            <textarea value={experience} onChange={(e) => setExperience(e.target.value)} placeholder={t('bf_exp_ph')} style={{ minHeight: 68 }} />
            <label className="field" style={{ display: 'block', marginTop: 14, marginBottom: 0 }}>{t('bf_goal')}</label>
            <textarea value={goal} onChange={(e) => setGoal(e.target.value)} placeholder={t('bf_goal_ph')} style={{ minHeight: 68, marginTop: 8 }} />
          </Q>

          <Q n={7} label={t('bf_location')}>
            <div className="field-row">
              <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)}>
                {COUNTRY_CODES.map((c) => <option key={c} value={c}>{countryName(c, lang)}</option>)}
              </select>
              <input value={city} onChange={(e) => setCity(e.target.value)} placeholder={t('bf_city_ph')} />
            </div>
          </Q>

          <Q n={8} label={t('bf_contact')}>
            <div className="field"><input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={t('f_fullname')} /></div>
            <div className="field-row">
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('f_email')} inputMode="email" />
              <input value={phone} onChange={(e) => setPhone(maskPhone(e.target.value))} placeholder={t('f_phone')} inputMode="tel" />
            </div>
            <label className="remember-row" style={{ marginTop: 6 }}>
              <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
              <span>{t('bf_kvkk')}</span>
            </label>
          </Q>

          <button className="btn btn-primary btn-block" style={{ marginTop: 20, padding: '15px 24px' }} onClick={submit} disabled={busy}>
            {busy ? t('loading') : t('bf_submit')}
          </button>
        </div>
      </div>
    </div>
  );
}
