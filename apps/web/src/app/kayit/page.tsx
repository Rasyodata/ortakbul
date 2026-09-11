'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useI18n, countryName } from '@/lib/i18n';
import Alert from '@/components/Alert';
import { vName, vEmail, vPhone, vPassword, vChecked, vRequired, maskPhone } from '@/lib/validation';

const ROLES: [string, string][] = [
  ['ENTREPRENEUR', 'role_entrepreneur'], ['INVESTOR', 'role_investor'], ['ANGEL_INVESTOR', 'role_angel'],
  ['BUSINESS_PARTNER', 'role_partner'], ['CONSULTANT', 'role_consultant'], ['INSTITUTION', 'role_institution'],
];
const COUNTRIES = [['TR', '🇹🇷 Türkiye'], ['US', '🇺🇸 ABD'], ['DE', '🇩🇪 Almanya'], ['GB', '🇬🇧 BK'], ['AE', '🇦🇪 BAE'], ['RU', '🇷🇺 Rusya']];

export default function Page() {
  const { register } = useAuth();
  const { t, lang } = useI18n();
  const router = useRouter();
  const [role, setRole] = useState('ENTREPRENEUR');
  const [gender, setGender] = useState('');
  const [invoice, setInvoice] = useState<'INDIVIDUAL' | 'CORPORATE'>('INDIVIDUAL');
  const [phone, setPhone] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [ok, setOk] = useState(false);

  const err = (k: string) => (errors[k] ? <span className="field-err">{t(errors[k])}</span> : null);
  const cls = (k: string) => `field${errors[k] ? ' invalid' : ''}`;

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError('');
    const fd = new FormData(e.currentTarget);
    const vals = {
      fullName: String(fd.get('fullName') || ''),
      email: String(fd.get('email') || ''),
      password: String(fd.get('password') || ''),
      countryCode: String(fd.get('countryCode') || ''),
    };
    // Doğrulama — her alan için çeviri anahtarı toplanır
    const eNext: Record<string, string> = {};
    const nm = vName(vals.fullName); if (nm) eNext.fullName = nm;
    const em = vEmail(vals.email); if (em) eNext.email = em;
    const pw = vPassword(vals.password); if (pw) eNext.password = pw;
    const ph = vPhone(phone, false); if (ph) eNext.phone = ph;
    const co = vRequired(vals.countryCode); if (co) eNext.countryCode = co;
    const ac = vChecked(accepted); if (ac) eNext.accepted = ac;
    setErrors(eNext);
    if (Object.keys(eNext).length) { setFormError('v_fix_errors'); return; }

    try {
      const r = await register({
        fullName: vals.fullName, email: vals.email, password: vals.password,
        phone, memberType: role, countryCode: vals.countryCode,
        city: fd.get('city'), invoiceType: invoice,
        companyName: fd.get('companyName'), taxOffice: fd.get('taxOffice'), taxNumber: fd.get('taxNumber'),
        ...(gender ? { gender } : {}),
      });
      if (r?.pendingApproval) { setOk(true); setTimeout(() => router.push('/profil'), 1400); }
      else router.push('/profil');
    } catch (e2: any) { setFormError(e2.message || 'v_fix_errors'); }
  };

  return (
    <div className="auth-wrap" style={{ maxWidth: 520 }}>
      <div className="auth-card">
        <h2 style={{ fontSize: 22, marginBottom: 6 }}>{t('reg_title')}</h2>
        <p style={{ color: 'var(--text-faint)', fontSize: 13.5, marginBottom: 20 }}>{t('reg_sub')}</p>

        {ok && <Alert kind="success">{t('reg_pending')}</Alert>}
        {formError && <Alert kind="error">{t(formError)}</Alert>}

        <form onSubmit={submit} noValidate>
          <div className="field">
            <label>{t('f_user_type')}</label>
            <div className="role-grid">
              {ROLES.map(([k, lk]) => (
                <div key={k} className={`role-pill${role === k ? ' active' : ''}`} onClick={() => setRole(k)}>{t(lk)}</div>
              ))}
            </div>
          </div>

          <div className={cls('fullName')}>
            <label>{t('f_fullname')}</label>
            <input name="fullName" autoComplete="name" onInput={() => setErrors((s) => ({ ...s, fullName: '' }))} />
            {err('fullName')}
          </div>

          <div className="field">
            <label>{t('f_gender')}</label>
            <div className="role-grid">
              <div className={`role-pill${gender === 'FEMALE' ? ' active' : ''}`} onClick={() => setGender('FEMALE')}>👩 {t('g_female')}</div>
              <div className={`role-pill${gender === 'MALE' ? ' active' : ''}`} onClick={() => setGender('MALE')}>{t('g_male')}</div>
              <div className={`role-pill${gender === 'OTHER' ? ' active' : ''}`} onClick={() => setGender('OTHER')}>{t('g_other')}</div>
            </div>
            {gender === 'FEMALE' && (
              <span style={{ fontSize: 12, color: 'var(--pink)', marginTop: 8, display: 'block' }}>{t('reg_women_perk')}</span>
            )}
          </div>

          <div className="field-row">
            <div className={cls('countryCode')}>
              <label>{t('f_country')} *</label>
              <select name="countryCode" defaultValue="TR" onChange={() => setErrors((s) => ({ ...s, countryCode: '' }))}>
                {COUNTRIES.map(([k, l]) => <option key={k} value={k}>{l.split(' ')[0]} {countryName(k, lang)}</option>)}
              </select>
              {err('countryCode')}
            </div>
            <div className="field"><label>{t('f_city')}</label><input name="city" autoComplete="address-level2" /></div>
          </div>

          <div className="field-row">
            <div className={cls('email')}>
              <label>{t('f_email')}</label>
              <input type="email" name="email" autoComplete="email" placeholder="ornek@eposta.com" onInput={() => setErrors((s) => ({ ...s, email: '' }))} />
              {err('email')}
            </div>
            <div className={cls('phone')}>
              <label>{t('f_phone')} <span className="field-hint" style={{ display: 'inline' }}>({t('optional')})</span></label>
              <input name="phone" inputMode="tel" autoComplete="tel" placeholder="+90 5xx xxx xx xx" value={phone}
                onChange={(e) => { setPhone(maskPhone(e.target.value)); setErrors((s) => ({ ...s, phone: '' })); }} />
              {err('phone')}
            </div>
          </div>

          <div className={cls('password')}>
            <label>{t('f_password_min')}</label>
            <input type="password" name="password" autoComplete="new-password" onInput={() => setErrors((s) => ({ ...s, password: '' }))} />
            {err('password')}
          </div>

          <div className="field">
            <label>{t('f_invoice_type')}</label>
            <div className="role-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className={`role-pill${invoice === 'INDIVIDUAL' ? ' active' : ''}`} onClick={() => setInvoice('INDIVIDUAL')}>{t('inv_individual')}</div>
              <div className={`role-pill${invoice === 'CORPORATE' ? ' active' : ''}`} onClick={() => setInvoice('CORPORATE')}>{t('inv_corporate')}</div>
            </div>
          </div>
          {invoice === 'CORPORATE' && (
            <>
              <div className="field"><label>{t('f_company')}</label><input name="companyName" /></div>
              <div className="field-row">
                <div className="field"><label>{t('f_tax_office')}</label><input name="taxOffice" /></div>
                <div className="field"><label>{t('f_tax_no')}</label><input name="taxNumber" /></div>
              </div>
            </>
          )}

          <label className={`remember-row${errors.accepted ? ' invalid' : ''}`} style={{ alignItems: 'flex-start', marginBottom: 6 }}>
            <input type="checkbox" checked={accepted} onChange={(e) => { setAccepted(e.target.checked); setErrors((s) => ({ ...s, accepted: '' })); }} style={{ marginTop: 2 }} />
            <span>{t('reg_terms')}</span>
          </label>
          {err('accepted')}

          <button className="btn btn-primary btn-block" type="submit" style={{ marginTop: 14 }}>{t('reg_title')}</button>
        </form>
        <div className="auth-switch">{t('have_account')} <Link href="/giris">{t('btn_login')}</Link></div>
      </div>
    </div>
  );
}
