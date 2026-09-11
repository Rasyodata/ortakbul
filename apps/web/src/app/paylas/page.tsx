'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useI18n, countryName, taxoName } from '@/lib/i18n';
import Alert from '@/components/Alert';

interface Fixture { name: string; qty: string; value: string }

const CATEGORIES = ['Teknoloji', 'Yazılım', 'E-ticaret', 'Eğitim', 'Sağlık', 'Tarım', 'Finans', 'Lojistik', 'Üretim', 'Turizm', 'Gıda', 'Diğer'];
const BUSINESS_TYPES = ['Home Ofis', 'E-Ticaret', 'Üretim', 'Perakende', 'İhracat', 'İthalat', 'Hizmet'];
const COUNTRIES = [
  ['TR', '🇹🇷 Türkiye'], ['US', '🇺🇸 ABD'], ['DE', '🇩🇪 Almanya'], ['GB', '🇬🇧 Birleşik Krallık'],
  ['FR', '🇫🇷 Fransa'], ['ES', '🇪🇸 İspanya'], ['NL', '🇳🇱 Hollanda'], ['RU', '🇷🇺 Rusya'],
  ['SA', '🇸🇦 S. Arabistan'], ['AE', '🇦🇪 BAE'], ['QA', '🇶🇦 Katar'], ['AZ', '🇦🇿 Azerbaycan'],
];
const STRUCTURES = [['CAPITAL', 's_capital'], ['COLLATERAL', 's_collateral'], ['CREDIT_LINE', 's_credit'], ['CHEQUE_BOND', 's_cheque'], ['EFFORT', 'pt_effort']];
const PTYPES = [['PROFIT_LOSS', 'pt_profit_loss'], ['TIMED', 'pt_timed'], ['PROFIT', 'pt_profit'], ['PROJECT', 'pt_project'], ['GOODS_PURCHASE', 'pt_goods'], ['CAPITAL', 's_capital']];
// [tier, etiket, normal fiyat, kadın girişimci fiyatı] — en çok ödeyen en önde gösterilir
const TIER_PKGS: [string, string, number, number, string][] = [
  ['SHOWCASE', '🟠', 4950, 2950, 'tier_showcase'],
  ['PRIVILEGED', '🟣', 1950, 950, 'tier_privileged'],
  ['FEATURED', '🔵', 950, 500, 'tier_featured'],
  ['NORMAL', '⚪', 0, 0, 'tier_normal'],
];

function PaylasForm() {
  const { user, ready } = useAuth();
  const { t, lang } = useI18n();
  const sp = useSearchParams();
  const initialType = ['IDEA', 'PARTNERSHIP', 'COMPANY_SALE', 'FRANCHISE'].includes(sp.get('type') || '') ? (sp.get('type') as string) : 'IDEA';
  const [type, setType] = useState(initialType);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [fx, setFx] = useState(41);
  const [priceTL, setPriceTL] = useState('');
  const [priceUSD, setPriceUSD] = useState('');
  const [hasFixtures, setHasFixtures] = useState('yok');
  const [fixtures, setFixtures] = useState<Fixture[]>([{ name: '', qty: '', value: '' }]);
  const [finLegal, setFinLegal] = useState('yok'); // mali & hukuki bilgi paylaşılacak mı
  const [collateral, setCollateral] = useState('yok'); // ortaklıkta teminat sunulacak mı
  const [accepted, setAccepted] = useState(false); // bilgi doğruluğu onayı
  const [tier, setTier] = useState('NORMAL');
  const isWoman = user?.gender === 'FEMALE';

  useEffect(() => { api.get('/fx').then((r) => setFx(r.usdTry || 41)).catch(() => {}); }, []);

  const onTL = (v: string) => {
    setPriceTL(v);
    const n = Number(v.replace(/[^\d]/g, ''));
    setPriceUSD(n ? String(Math.round(n / fx)) : '');
  };
  const onUSD = (v: string) => {
    setPriceUSD(v);
    const n = Number(v.replace(/[^\d]/g, ''));
    setPriceTL(n ? String(Math.round(n * fx)) : '');
  };
  const setFix = (i: number, k: keyof Fixture, v: string) =>
    setFixtures((f) => f.map((row, idx) => (idx === i ? { ...row, [k]: v } : row)));
  const addFix = () => setFixtures((f) => [...f, { name: '', qty: '', value: '' }]);
  const rmFix = (i: number) => setFixtures((f) => f.filter((_, idx) => idx !== i));

  if (ready && !user) {
    return (
      <div className="form-page wrap">
        <div className="empty-state" style={{ padding: 46 }}>
          <h3 style={{ fontSize: 18, marginBottom: 10 }}>{t('post_need_member')}</h3>
          <div className="hero-actions" style={{ justifyContent: 'center', marginTop: 16 }}>
            <Link href="/giris" className="btn btn-primary">{t('btn_login')}</Link>
            <Link href="/kayit" className="btn btn-ghost">{t('create_account')}</Link>
          </div>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="form-page wrap">
        <Alert kind="success">{t('post_done')}</Alert>
        <div className="hero-actions" style={{ marginTop: 20 }}>
          <Link href="/ortak-arayanlar" className="btn btn-ghost">{t('explore_ideas')}</Link>
        </div>
      </div>
    );
  }

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body: any = {
      type,
      title: fd.get('title'), short: fd.get('short'), detail: fd.get('detail'),
      category: fd.get('category'), city: fd.get('city'), amountText: fd.get('amountText'),
      countryCode: fd.get('countryCode') || 'TR',
      tier,
    };
    if (type !== 'COMPANY_SALE') {
      body.structure = fd.get('structure');
      body.partnershipType = fd.get('partnershipType');
    }
    if (type === 'PARTNERSHIP') {
      body.audited = fd.get('audited') === 'on';
      const tlNum = Number(String(priceTL).replace(/[^\d]/g, '')) || 0;
      const expect = (fd.get('partnerExpectation') as string) || 'katkı';
      if (tlNum) {
        body.amountTL = tlNum;
        body.amountText = `${tlNum.toLocaleString('tr-TR')} ₺ ${expect}`;
      } else {
        body.amountText = `${expect} ortaklığı`;
      }
      body.details = {
        partnerSharePct: fd.get('partnerSharePct') || undefined,
        partnershipDuration: fd.get('partnershipDuration') || undefined,
        expectedReturn: fd.get('expectedReturn') || undefined,
        currentStatus: fd.get('currentStatus') || undefined,
        foundedYear: fd.get('pFoundedYear') || undefined,
        teamSize: fd.get('teamSize') || undefined,
        revenue: fd.get('pRevenue') || undefined,
        sectorExperience: fd.get('sectorExperience') || undefined,
        partnerExpectation: expect,
        collateralOffered: collateral === 'var',
        collateralDetail: collateral === 'var' ? (fd.get('collateralDetail') || undefined) : undefined,
        licenses: fd.get('pLicenses') || undefined,
        priceUSD: Number(String(priceUSD).replace(/[^\d]/g, '')) || undefined,
      };
    }
    if (type === 'IDEA') {
      const tlNum = Number(String(priceTL).replace(/[^\d]/g, '')) || 0;
      body.stage = fd.get('stage') || undefined;
      if (tlNum) { body.amountTL = tlNum; body.amountText = `${tlNum.toLocaleString('tr-TR')} ₺ sermaye/katkı`; }
      body.details = {
        targetMarket: fd.get('targetMarket') || undefined,
        revenueModel: fd.get('revenueModel') || undefined,
        currentStatus: fd.get('stage') || undefined,
        teamSize: fd.get('teamSize') || undefined,
        traction: fd.get('traction') || undefined,
        useOfFunds: fd.get('useOfFunds') || undefined,
        milestones: fd.get('milestones') || undefined,
        sectorExperience: fd.get('sectorExperience') || undefined,
        priceUSD: Number(String(priceUSD).replace(/[^\d]/g, '')) || undefined,
      };
    }
    if (type === 'FRANCHISE') {
      const tlNum = Number(String(priceTL).replace(/[^\d]/g, '')) || 0;
      body.franchiseKind = fd.get('franchiseKind') || undefined;
      if (tlNum) { body.amountTL = tlNum; body.investTL = tlNum; body.amountText = `${tlNum.toLocaleString('tr-TR')} ₺ yatırım`; }
      body.details = {
        exclusivity: fd.get('exclusivity') || undefined,
        royalty: fd.get('royalty') || undefined,
        expectedRevenue: fd.get('expectedRevenue') || undefined,
        paybackPeriod: fd.get('paybackPeriod') || undefined,
        branches: fd.get('branches') || undefined,
        areaSqm: fd.get('areaSqm') || undefined,
        staffNeed: fd.get('staffNeed') || undefined,
        contractYears: fd.get('contractYears') || undefined,
        support: fd.get('support') || undefined,
        priceUSD: Number(String(priceUSD).replace(/[^\d]/g, '')) || undefined,
      };
    }
    if (type === 'COMPANY_SALE') {
      const tlNum = Number(String(priceTL).replace(/[^\d]/g, '')) || 0;
      body.salePaymentType = fd.get('salePaymentType');
      body.price = tlNum ? `${tlNum.toLocaleString('tr-TR')} ₺` : undefined;
      body.amountTL = tlNum || undefined;
      body.foundedYear = Number(fd.get('foundedYear')) || undefined;
      body.employees = fd.get('employees');
      body.revenue = fd.get('revenue');
      body.details = {
        companyStructure: fd.get('companyStructure'),
        partnerCount: fd.get('partnerCount'),
        capital: fd.get('capital'),
        licenses: fd.get('licenses'),
        finLegalDisclosed: finLegal === 'var',
        ...(finLegal === 'var' ? {
          marketDebt: fd.get('marketDebt'),
          officialDebt: fd.get('officialDebt'),
          personnelDebt: fd.get('personnelDebt'),
          enforcementDebt: fd.get('enforcementDebt'),
          lawsuits: fd.get('lawsuits'),
        } : {}),
        priceUSD: Number(String(priceUSD).replace(/[^\d]/g, '')) || undefined,
        hasFixtures,
        fixtures: hasFixtures === 'var' ? fixtures.filter((f) => f.name.trim()) : [],
      };
    }
    if (!accepted) { setError('v_must_accept'); return; }
    body.details = { ...(body.details || {}), confirmedAccuracy: true, businessType: fd.get('businessType') };
    try { await api.post('/listings', body); setDone(true); } catch (err: any) { setError(err.message); }
  };

  return (
    <div className="form-page wrap">
      <div className="eyebrow">{t('post_eb')}</div>
      <h1 style={{ fontSize: 'clamp(26px,3.4vw,34px)', marginBottom: 10 }}>{t('post_title')}</h1>
      {error && <Alert kind="error">{t(error)}</Alert>}
      <div className="form-card">
        <form onSubmit={submit}>
          <div className="field">
            <label>{t('post_type')}</label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="IDEA">{t('lt_idea')}</option>
              <option value="PARTNERSHIP">{t('lt_partnership')}</option>
              <option value="COMPANY_SALE">{t('lt_company')}</option>
              <option value="FRANCHISE">{t('lt_franchise')}</option>
            </select>
          </div>
          <div className="field"><label>{t('post_title_field')}</label><input required name="title" /></div>
          <div className="field-row">
            <div className="field"><label>{t('post_category')}</label><select name="category">{CATEGORIES.map((c) => <option key={c} value={c}>{taxoName(c, lang)}</option>)}</select></div>
            <div className="field"><label>{t('post_biztype')}</label><select name="businessType">{BUSINESS_TYPES.map((c) => <option key={c} value={c}>{taxoName(c, lang)}</option>)}</select></div>
          </div>
          <div className="field-row">
            <div className="field"><label>{t('f_country')}</label><select name="countryCode" defaultValue="TR">{COUNTRIES.map(([k, l]) => <option key={k} value={k}>{l.split(' ')[0]} {countryName(k, lang)}</option>)}</select></div>
            <div className="field"><label>{t('f_city')}</label><input name="city" placeholder="İstanbul" /></div>
          </div>
          {type !== 'COMPANY_SALE' && (
            <div className="field-row">
              <div className="field"><label>{t('fp_struct_model')}</label><select name="structure">{STRUCTURES.map(([k, l]) => <option key={k} value={k}>{t(l)}</option>)}</select></div>
              <div className="field">
                <label>{t('dk_ptype')}</label>
                <select name="partnershipType">{PTYPES.map(([k, l]) => <option key={k} value={k}>{t(l)}</option>)}</select>
                <span style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 6, display: 'block' }}>{t('fp_ptype_hint')}</span>
              </div>
            </div>
          )}
          {type === 'PARTNERSHIP' && (
            <>
              <div className="field-row">
                <div className="field"><label>{t('dk_capital_sought')} (₺)</label><input inputMode="numeric" value={priceTL} onChange={(e) => onTL(e.target.value)} placeholder="1.500.000" /></div>
                <div className="field"><label>{t('dk_usd')}</label><input inputMode="numeric" value={priceUSD} onChange={(e) => onUSD(e.target.value)} placeholder="36585" /></div>
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: -8, marginBottom: 14, display: 'block' }}>{t('fp_fx_note').replace('{fx}', String(fx))}</span>
              <div className="field-row">
                <div className="field"><label>{t('dk_share_pct')} (%)</label><input name="partnerSharePct" type="number" placeholder="30" /></div>
                <div className="field"><label>{t('dk_duration')}</label><input name="partnershipDuration" placeholder="Örn. 24 ay / süresiz" /></div>
              </div>
              <div className="field-row">
                <div className="field"><label>{t('dk_return')}</label><input name="expectedReturn" placeholder="Örn. yıllık %40 / net kârın %30'u" /></div>
                <div className="field">
                  <label>{t('dk_status')}</label>
                  <select name="currentStatus">
                    <option>Fikir aşaması</option>
                    <option>{t('cs_founded')}</option>
                    <option>{t('cs_revenue')}</option>
                    <option>{t('cs_project')}</option>
                  </select>
                </div>
              </div>
              <div className="field-row-3">
                <div className="field"><label>{t('dk_founded')}</label><input name="pFoundedYear" type="number" placeholder="2021" /></div>
                <div className="field"><label>{t('dk_team')}</label><input name="teamSize" placeholder="4 kişi" /></div>
                <div className="field"><label>{t('dk_revenue')}</label><input name="pRevenue" placeholder="2M ₺ / yıl" /></div>
              </div>
              <div className="field-row">
                <div className="field"><label>{t('dk_sector_exp')}</label><input name="sectorExperience" placeholder="8 yıl" /></div>
                <div className="field">
                  <label>{t('dk_partner_expect')}</label>
                  <select name="partnerExpectation">
                    <option>{t('pe_capital')}</option>
                    <option>{t('pe_effort')}</option>
                    <option>{t('pe_both')}</option>
                    <option>{t('pe_network')}</option>
                    <option>{t('pe_collateral')}</option>
                  </select>
                </div>
              </div>
              <div className="field">
                <label>{t('fp_collateral_q')}</label>
                <div className="role-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  <div className={`role-pill${collateral === 'var' ? ' active' : ''}`} onClick={() => setCollateral('var')}>{t('fp_yes_offer')}</div>
                  <div className={`role-pill${collateral === 'yok' ? ' active' : ''}`} onClick={() => setCollateral('yok')}>Hayır</div>
                </div>
              </div>
              {collateral === 'var' && (
                <div className="field"><label>{t('fp_collateral_detail')}</label><input name="collateralDetail" placeholder="Örn. gayrimenkul ipoteği, çek/senet, banka teminat mektubu" /></div>
              )}
              <div className="field"><label>{t('dk_licenses')}</label><input name="pLicenses" placeholder="İşletme ruhsatı, marka tescili, ISO" /></div>
              <div className="field" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input type="checkbox" name="audited" style={{ width: 'auto' }} /> <label style={{ margin: 0 }}>{t('fp_audited')}</label>
              </div>
            </>
          )}
          {type === 'IDEA' && (
            <>
              <div className="field-row">
                <div className="field"><label>{t('dk_capital_sought')} (₺)</label><input inputMode="numeric" value={priceTL} onChange={(e) => onTL(e.target.value)} placeholder="750.000" /></div>
                <div className="field"><label>{t('dk_usd')}</label><input inputMode="numeric" value={priceUSD} onChange={(e) => onUSD(e.target.value)} placeholder="18293" /></div>
              </div>
              <div className="field-row">
                <div className="field"><label>{t('dk_stage')}</label>
                  <select name="stage"><option>{t('st_idea')}</option><option>{t('st_proto')}</option><option>{t('st_first')}</option><option>{t('st_growing')}</option></select>
                </div>
                <div className="field"><label>{t('dk_revenue_model')}</label><input name="revenueModel" placeholder="Abonelik / komisyon / satış" /></div>
              </div>
              <div className="field-row">
                <div className="field"><label>{t('dk_target_market')}</label><input name="targetMarket" placeholder="Türkiye + MENA KOBİ'ler" /></div>
                <div className="field"><label>{t('dk_traction')}</label><input name="traction" placeholder="Örn. 1.200 kayıtlı kullanıcı" /></div>
              </div>
              <div className="field-row">
                <div className="field"><label>{t('dk_team_founder')}</label><input name="teamSize" placeholder="2 kurucu + 3 kişi" /></div>
                <div className="field"><label>{t('dk_sector_exp')}</label><input name="sectorExperience" placeholder="6 yıl" /></div>
              </div>
              <div className="field"><label>{t('dk_use_funds')}</label><input name="useOfFunds" placeholder="Örn. %50 ürün, %30 pazarlama, %20 ekip" /></div>
              <div className="field"><label>{t('dk_milestones')}</label><input name="milestones" placeholder="6 ayda 10K kullanıcı, 12 ayda başabaş" /></div>
            </>
          )}
          {type === 'FRANCHISE' && (
            <>
              <div className="field-row">
                <div className="field"><label>{t('dk_fr_kind')}</label><select name="franchiseKind"><option>{t('fk_franchise')}</option><option>{t('fk_distributor')}</option><option>{t('fk_dealer')}</option><option>{t('fk_region')}</option></select></div>
                <div className="field"><label>{t('dk_fr_excl')}</label><input name="exclusivity" placeholder="Örn. İl bazında tek yetkili" /></div>
              </div>
              <div className="field-row">
                <div className="field"><label>{t('dk_fr_invest')} (₺)</label><input inputMode="numeric" value={priceTL} onChange={(e) => onTL(e.target.value)} placeholder="1.200.000" /></div>
                <div className="field"><label>{t('dk_usd')}</label><input inputMode="numeric" value={priceUSD} onChange={(e) => onUSD(e.target.value)} placeholder="29268" /></div>
              </div>
              <div className="field-row">
                <div className="field"><label>{t('dk_fr_royalty')}</label><input name="royalty" placeholder="Örn. cironun %5'i" /></div>
                <div className="field"><label>{t('dk_fr_exp_rev')}</label><input name="expectedRevenue" placeholder="350.000 ₺ / ay" /></div>
              </div>
              <div className="field-row-3">
                <div className="field"><label>{t('dk_fr_payback')}</label><input name="paybackPeriod" placeholder="18 ay" /></div>
                <div className="field"><label>{t('dk_fr_branches')}</label><input name="branches" placeholder="12" /></div>
                <div className="field"><label>{t('dk_fr_contract')}</label><input name="contractYears" placeholder="5 yıl" /></div>
              </div>
              <div className="field-row">
                <div className="field"><label>{t('dk_fr_area')}</label><input name="areaSqm" placeholder="80 m²" /></div>
                <div className="field"><label>{t('dk_fr_staff')}</label><input name="staffNeed" placeholder="4 kişi" /></div>
              </div>
              <div className="field"><label>{t('dk_fr_support')}</label><input name="support" placeholder="Kurulum, eğitim, pazarlama ve operasyon desteği" /></div>
            </>
          )}
          {type === 'COMPANY_SALE' && (
            <>
              <div className="field-row">
                <div className="field"><label>{t('dk_paytype')}</label><select name="salePaymentType"><option value="CASH">{t('pay_cash')}</option><option value="INSTALLMENT">{t('pay_installment')}</option><option value="BARTER">{t('pay_barter')}</option></select></div>
                <div className="field"><label>{t('dk_structure')}</label><select name="companyStructure"><option>{t('cst_as')}</option><option>{t('cst_ltd')}</option><option>{t('cst_sole')}</option><option>Kollektif</option><option>Komandit</option></select></div>
              </div>
              <div className="field-row-3">
                <div className="field"><label>{t('dk_founded')}</label><input name="foundedYear" type="number" placeholder="2016" /></div>
                <div className="field"><label>{t('dk_partners')}</label><input name="partnerCount" type="number" placeholder="3" /></div>
                <div className="field"><label>{t('dk_employees')}</label><input name="employees" placeholder="12 kişi" /></div>
              </div>
              <div className="field-row">
                <div className="field"><label>{t('dk_capital')}</label><input name="capital" placeholder="5.000.000 ₺" /></div>
                <div className="field"><label>{t('dk_revenue')}</label><input name="revenue" placeholder="8M ₺ / yıl" /></div>
              </div>
              <div className="field-row">
                <div className="field"><label>{t('dk_price')} (₺)</label><input inputMode="numeric" value={priceTL} onChange={(e) => onTL(e.target.value)} placeholder="4.000.000" /></div>
                <div className="field"><label>{t('dk_price')} ($)</label><input inputMode="numeric" value={priceUSD} onChange={(e) => onUSD(e.target.value)} placeholder="97561" /></div>
              </div>
              <span style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: -8, marginBottom: 14, display: 'block' }}>{t('fp_fx_note').replace('{fx}', String(fx))}</span>
              <div className="field">
                <label>{t('fp_finlegal_q')}</label>
                <div className="role-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  <div className={`role-pill${finLegal === 'var' ? ' active' : ''}`} onClick={() => setFinLegal('var')}>{t('fp_yes_share')}</div>
                  <div className={`role-pill${finLegal === 'yok' ? ' active' : ''}`} onClick={() => setFinLegal('yok')}>{t('fp_no_ondemand')}</div>
                </div>
              </div>
              {finLegal === 'var' && (
                <>
                  <div className="field-row">
                    <div className="field"><label>{t('dk_market_debt')}</label><input name="marketDebt" placeholder="1.200.000 ₺" /></div>
                    <div className="field"><label>{t('dk_official_debt')}</label><input name="officialDebt" placeholder="350.000 ₺" /></div>
                  </div>
                  <div className="field-row">
                    <div className="field"><label>{t('dk_personnel_debt')}</label><input name="personnelDebt" placeholder="Yok / 80.000 ₺" /></div>
                    <div className="field"><label>{t('dk_enforcement')}</label><input name="enforcementDebt" placeholder="Yok" /></div>
                  </div>
                  <div className="field"><label>{t('dk_lawsuits')}</label><input name="lawsuits" placeholder="Yok / 1 ticari alacak davası" /></div>
                </>
              )}
              <div className="field"><label>{t('dk_licenses')}</label><input name="licenses" placeholder="İşletme ruhsatı, gıda üretim izni, ISO 9001" /></div>
              <div className="field">
                <label>{t('fp_fixtures_q')}</label>
                <div className="role-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  <div className={`role-pill${hasFixtures === 'var' ? ' active' : ''}`} onClick={() => setHasFixtures('var')}>{t('yes')}</div>
                  <div className={`role-pill${hasFixtures === 'yok' ? ' active' : ''}`} onClick={() => setHasFixtures('yok')}>{t('no')}</div>
                </div>
              </div>
              {hasFixtures === 'var' && (
                <div className="field">
                  <label>{t('dk_fixtures_list')}</label>
                  {fixtures.map((f, i) => (
                    <div className="field-row-3" key={i} style={{ marginBottom: 8, alignItems: 'center' }}>
                      <input placeholder="Demirbaş adı" value={f.name} onChange={(e) => setFix(i, 'name', e.target.value)} />
                      <input placeholder="Adet" value={f.qty} onChange={(e) => setFix(i, 'qty', e.target.value)} />
                      <div style={{ display: 'flex', gap: 6 }}>
                        <input placeholder="Değer (₺)" value={f.value} onChange={(e) => setFix(i, 'value', e.target.value)} />
                        <button type="button" className="icon-btn no" onClick={() => rmFix(i)} style={{ flexShrink: 0 }}>✕</button>
                      </div>
                    </div>
                  ))}
                  <button type="button" className="btn btn-ghost btn-sm" onClick={addFix}>{t('fp_add_row')}</button>
                </div>
              )}
            </>
          )}
          <div className="field"><label>{t('post_short')}</label><input required name="short" /></div>
          <div className="field"><label>{t('post_detail')}</label><textarea required name="detail" /></div>

          <div className="field">
            <label>{t('post_pkg')}</label>
            {isWoman && <span style={{ fontSize: 12, color: 'var(--pink)', display: 'block', marginBottom: 8 }}>{t('post_women_disc')}</span>}
            <div className="role-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              {TIER_PKGS.map(([k, emoji, np, wp, lblKey]) => {
                const price = isWoman ? (wp as number) : (np as number);
                return (
                  <div key={k as string} className={`role-pill${tier === k ? ' active' : ''}`} style={{ display: 'flex', flexDirection: 'column', gap: 3, padding: '12px 8px' }} onClick={() => setTier(k as string)}>
                    <span style={{ fontSize: 13 }}>{emoji} {t(lblKey as string)}</span>
                    <span style={{ color: price ? 'var(--accent-a)' : 'var(--good)', fontWeight: 700 }}>{price ? `${price.toLocaleString('tr-TR')} ₺` : t('pr_free')}</span>
                  </div>
                );
              })}
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 6, display: 'block' }}>{t('post_pkg_note')}</span>
          </div>

          <label className="remember-row" style={{ alignItems: 'flex-start', margin: '4px 0 16px' }}>
            <input type="checkbox" checked={accepted} onChange={(e) => { setAccepted(e.target.checked); if (e.target.checked && error === 'v_must_accept') setError(''); }} style={{ marginTop: 2 }} />
            <span>{t('post_accuracy')}</span>
          </label>
          <button className="btn btn-primary btn-block" type="submit" disabled={!accepted} style={{ opacity: accepted ? 1 : 0.55 }}>{t('post_submit')}</button>
        </form>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="wrap"><div className="spinner">…</div></div>}>
      <PaylasForm />
    </Suspense>
  );
}
