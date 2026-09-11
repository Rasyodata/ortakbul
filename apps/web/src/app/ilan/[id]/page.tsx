'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useI18n, taxoName, lz } from '@/lib/i18n';

// Değerler çeviri anahtarıdır (t ile çözülür)
const TIER_LABEL: Record<string, string> = { NORMAL: 'tier_normal', FEATURED: 'tier_featured', PRIVILEGED: 'tier_privileged', SHOWCASE: 'tier_showcase' };
const TYPE_LABEL: Record<string, string> = {
  IDEA: 'lt_idea', PARTNERSHIP: 'lt_partnership', COMPANY_SALE: 'lt_company',
  FRANCHISE: 'lt_franchise', INVESTOR_CAPITAL: 'ty_investor',
};
// Değerler çeviri anahtarıdır
const STRUCT_LABEL: Record<string, string> = {
  CAPITAL: 's_capital', COLLATERAL: 's_collateral', CREDIT_LINE: 's_credit', CHEQUE_BOND: 's_cheque', EFFORT: 'pt_effort',
};
const PTYPE_LABEL: Record<string, string> = {
  PROFIT_LOSS: 'pt_profit_loss', TIMED: 'pt_timed', PROFIT: 'pt_profit', PROJECT: 'pt_project', GOODS_PURCHASE: 'pt_goods', CAPITAL: 's_capital',
};
const REPORT_REASONS: [string, string][] = [
  ['FRAUD', 'rr_fraud'], ['MISLEADING', 'rr_misleading'],
  ['INCORRECT_INFO', 'rr_incorrect'], ['SPAM', 'rr_spam'],
  ['INAPPROPRIATE', 'rr_inappropriate'], ['DUPLICATE', 'rr_duplicate'], ['OTHER', 'rr_other'],
];
// [type, çeviri-anahtarı, oran] — oran = satış tutarının yüzdesi
const REVIEW_TYPES: [string, string, number][] = [
  ['LAWYER', 'rev_lawyer', 0.004],
  ['ACCOUNTANT', 'rev_accountant', 0.004],
  ['SECTOR_REP', 'rev_sector_rep', 0.002],
  ['SECTOR_REPORT', 'rev_sector_report', 0.01],
];
const REVIEW_LABEL: Record<string, string> = {
  ACCOUNTANT: 'rev_accountant', LAWYER: 'rev_lawyer', SECTOR_REP: 'rev_sector_rep', SECTOR_REPORT: 'rev_sector_report',
};
const feeLabel = (rate: number, amountTL?: number) =>
  amountTL && amountTL > 0
    ? `${Math.round(amountTL * rate).toLocaleString('tr-TR')} ₺`
    : `%${(rate * 100).toString().replace('.', ',')}`;

export default function Page() {
  const { id } = useParams<{ id: string }>();
  const { user, ready } = useAuth();
  const { t, lang } = useI18n();
  const [l, setL] = useState<any>(null);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [showReport, setShowReport] = useState(false);
  const [reason, setReason] = useState('FRAUD');

  useEffect(() => {
    api.get(`/listings/${id}`).then(setL).catch((e) => setError(e.message));
  }, [id]);

  const sendReport = async (note: string) => {
    try { await api.post(`/listings/${id}/report`, { reason, note }); setShowReport(false); setMsg(t('d_report_sent')); }
    catch (e: any) { setMsg(e.message); }
  };
  const requestReview = async (type: string) => {
    try { await api.post(`/listings/${id}/review-request`, { type }); setMsg(t('d_review_sent')); }
    catch (e: any) { setMsg(e.message); }
  };
  const offerReview = async (rrId: string) => {
    try { await api.post(`/review-requests/${rrId}/offer`, {}); setMsg(t('d_review_sent')); api.get(`/listings/${id}`).then(setL); }
    catch (e: any) { setMsg(e.message); }
  };

  if (error) return <div className="wrap section-tight"><div className="empty-state">{t('d_not_found')} <Link href="/ortak-arayanlar" style={{ color: 'var(--accent-a)' }}>{t('btn_all')}</Link></div></div>;
  if (!l) return <div className="wrap"><div className="spinner">{t('loading')}</div></div>;

  if (ready && !user) {
    return (
      <div className="form-page wrap">
        <div className="empty-state" style={{ padding: 46 }}>
          <h3 style={{ fontSize: 18, marginBottom: 10 }}>{t('gate_title')}</h3>
          <p style={{ marginBottom: 22 }}>&quot;{l.title}&quot; — {t('d_gate_login')}</p>
          <div className="hero-actions" style={{ justifyContent: 'center' }}>
            <Link href="/giris" className="btn btn-primary">{t('btn_login')}</Link>
            <Link href="/kayit" className="btn btn-ghost">{t('create_account')}</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wrap detail-wrap">
      <div className="detail-main">
        <div className="tag-row" style={{ marginBottom: 16 }}>
          <span className={`tier-badge tier-${l.tier}`}><span className="dot" />{t(TIER_LABEL[l.tier] || 'tier_normal').toUpperCase()}</span>
          {l.category && <span className="tag">{taxoName(l.category, lang)}</span>}
          {l.details?.businessType && <span className="tag">💼 {taxoName(l.details.businessType, lang)}</span>}
          {l.stage && <span className="tag stage">{l.stage}</span>}
          {l.audited && <span className="tag struct">🛡️ Denetimli</span>}
        </div>
        <h1>{lz(l, 'title', lang)} {l.identityProtected && <span title={t('identity_masked')} style={{ fontSize: '0.6em', verticalAlign: 'middle' }}>🔒</span>}</h1>
        <p style={{ marginTop: 6 }}>
          <span style={{ color: 'var(--accent-a)', fontWeight: 700 }}>{t(TYPE_LABEL[l.type] || '') || l.type}</span>
          <span style={{ color: 'var(--text-faint)' }}> · {l.owner?.fullName} · {l.city || '—'}</span>
        </p>
        {l.identityProtected && (
          <div className="alert alert-info" style={{ marginTop: 14 }}>
            <span className="alert-ico">🔒</span>
            <div><b>{t('identity_masked')}.</b> {t('d_identity_protected')}</div>
          </div>
        )}
        <div className="block"><h3>{t('d_desc')}</h3><p>{lz(l, 'detail', lang)}</p></div>
        {l.problem && <div className="block"><h3>{t('d_problem')}</h3><p>{l.problem}</p></div>}
        {l.audience && <div className="block"><h3>{t('d_audience')}</h3><p>{l.audience}</p></div>}
        {l.amountText && <div className="block"><h3>{t('d_amount')}</h3><p>{l.amountText}</p></div>}
        {l.type === 'COMPANY_SALE' && <CompanyDossier l={l} />}
        {l.type === 'PARTNERSHIP' && <PartnershipDossier l={l} />}
        {l.type === 'IDEA' && <IdeaDossier l={l} />}
        {l.type === 'FRANCHISE' && <FranchiseDossier l={l} />}
        {l.type === 'INVESTOR_CAPITAL' && <InvestorDossier l={l} />}
      </div>
      <div>
        <div className="side-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ background: 'linear-gradient(135deg,rgba(15,61,52,.12),rgba(189,154,68,.12))', padding: '16px 20px' }}>
            <div style={{ fontSize: 11, color: '#a9781f', textTransform: 'uppercase', letterSpacing: '.07em', fontWeight: 700 }}>{t('d_type')}</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginTop: 2, color: 'var(--green)', fontFamily: 'var(--disp-font),serif' }}>{t(TYPE_LABEL[l.type] || '') || l.type}</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 20px', borderTop: '1px solid var(--line)' }}>
            <span style={{ color: 'var(--text-faint)', fontSize: 13 }}>{t('st_sector')}</span>
            <span style={{ fontWeight: 600, fontSize: 13 }}>{taxoName(l.sector || l.category, lang) || '—'}</span>
          </div>
          {l.details?.businessType && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 20px', borderTop: '1px solid var(--line)' }}>
              <span style={{ color: 'var(--text-faint)', fontSize: 13 }}>{t('d_biztype')}</span>
              <span style={{ fontWeight: 600, fontSize: 13 }}>{taxoName(l.details.businessType, lang)}</span>
            </div>
          )}
          {l.countryCode && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 20px', borderTop: '1px solid var(--line)' }}>
              <span style={{ color: 'var(--text-faint)', fontSize: 13 }}>{t('d_location')}</span>
              <span style={{ fontWeight: 600, fontSize: 13 }}>{l.countryCode} · {l.city || '—'}</span>
            </div>
          )}
        </div>

        <div className="side-card side-actions">
          <button className="btn btn-primary" onClick={() => setMsg(t('d_contact_sent'))}>{t('d_contact_go')}</button>
          <button className="btn btn-ghost" onClick={() => setMsg(t('d_offer_sent'))}>{t('d_send_offer')}</button>
          <button className="btn btn-ghost" style={{ color: '#f2716a', borderColor: 'rgba(242,113,106,.3)' }} onClick={() => setShowReport((s) => !s)}>{t('d_report')}</button>
          {msg && <div className="alert alert-success" style={{ marginTop: 4 }}><span className="alert-ico">✅</span><div>{msg}</div></div>}
        </div>

        <div className="side-card">
          <h4 style={{ marginBottom: 12 }}>{t('d_contact_info')}</h4>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--line)', fontSize: 13.5 }}>
            <span style={{ color: 'var(--text-faint)' }}>{t('f_phone')}</span>
            <b style={{ letterSpacing: '.5px' }}>+90 5** *** ** **</b>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', fontSize: 13.5 }}>
            <span style={{ color: 'var(--text-faint)' }}>{t('f_email')}</span>
            <b style={{ letterSpacing: '.5px' }}>****@****.***</b>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 10 }}>{t('d_contact_hidden')}</p>
        </div>

        {showReport && (
          <div className="side-card">
            <h4>{t('d_report_reason')}</h4>
            <select value={reason} onChange={(e) => setReason(e.target.value)} style={{ marginBottom: 10 }}>
              {REPORT_REASONS.map(([k, lbl]) => <option key={k} value={k}>{t(lbl)}</option>)}
            </select>
            <textarea id="reportNote" placeholder={t('d_report_note')} style={{ minHeight: 70, marginBottom: 10 }} />
            <button className="btn btn-primary btn-block btn-sm" onClick={() => sendReport((document.getElementById('reportNote') as HTMLTextAreaElement)?.value || '')}>{t('d_report_send')}</button>
          </div>
        )}

        <div className="side-card">
          <h4 style={{ marginBottom: 12 }}>{t('d_review_box')}</h4>
          {user?.benefits?.program && (
            <div style={{ background: 'linear-gradient(160deg,#fdf1f6,#fbe9f0)', border: '1px solid #f0cddd', borderLeft: '4px solid #d6457f', borderRadius: 10, padding: '10px 12px', marginBottom: 12, fontSize: 12, color: '#7a5766', lineHeight: 1.6 }}>
              👩 <b style={{ color: '#c43f77' }}>{t('d_women_perk')}</b> {t('women_c1_t')}: {user.benefits.accountingFree ? `${user.benefits.accountingDaysLeft} ${t('women_days_left')}` : t('women_acc_expired')}{user.benefits.auditDiscountPct > 0 ? ` · ${t('d_review_box')} %${user.benefits.auditDiscountPct}` : ''}.
            </div>
          )}
          {REVIEW_TYPES.map(([k, lbl, rate]) => {
            const ben = user?.benefits;
            const base = l.amountTL && l.amountTL > 0 ? Math.round((l.amountTL as number) * (rate as number)) : 0;
            const free = ben?.accountingFree && k === 'ACCOUNTANT';
            const disc = ben && ben.auditDiscountPct > 0 && k !== 'ACCOUNTANT' && base > 0;
            return (
              <button key={k} className="btn btn-ghost btn-sm btn-block" style={{ marginBottom: 8, justifyContent: 'space-between', gap: 8 }} onClick={() => requestReview(k)}>
                <span style={{ textAlign: 'left', fontSize: 12.5 }}>{t(lbl)}</span>
                <span style={{ whiteSpace: 'nowrap', display: 'flex', gap: 6, alignItems: 'baseline' }}>
                  {free ? (
                    <b style={{ color: 'var(--pink)' }}>ÜCRETSİZ</b>
                  ) : disc ? (
                    <>
                      <s style={{ color: 'var(--text-faint)', fontSize: 11 }}>{base.toLocaleString('tr-TR')} ₺</s>
                      <b style={{ color: 'var(--pink)' }}>{Math.round(base * (1 - (ben!.auditDiscountPct / 100))).toLocaleString('tr-TR')} ₺</b>
                    </>
                  ) : (
                    <span style={{ color: 'var(--accent-a)' }}>{feeLabel(rate as number, l.amountTL)}</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {user?.isConsultant && Array.isArray(l.reviewRequests) && l.reviewRequests.filter((r: any) => r.status === 'OPEN').length > 0 && (
          <div className="side-card" style={{ borderColor: 'rgba(79,214,168,.35)' }}>
            <h4>👔 {t('d_review_box')}</h4>
            {l.reviewRequests.filter((r: any) => r.status === 'OPEN').map((r: any) => (
              <div key={r.id} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 13 }}>{t(REVIEW_LABEL[r.type] || '') || r.type} · <b style={{ color: 'var(--accent-a)' }}>{r.feeText}</b></div>
                <button className="btn btn-primary btn-sm btn-block" style={{ marginTop: 4 }} onClick={() => offerReview(r.id)}>{t('cons_offer')}</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const PAY: Record<string, string> = { CASH: 'pay_cash', INSTALLMENT: 'pay_installment', BARTER: 'pay_barter' };

function Row({ label, value }: { label: string; value: any }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '10px 0', borderBottom: '1px solid var(--line)', fontSize: 14 }}>
      <span style={{ color: 'var(--text-faint)' }}>{label}</span>
      <span style={{ color: 'var(--text)', fontWeight: 600, textAlign: 'right' }}>{String(value)}</span>
    </div>
  );
}

function CompanyDossier({ l }: { l: any }) {
  const { t } = useI18n();
  const d = l.details || {};
  const priceStr = l.price
    ? `${l.price}${d.priceUSD ? ` (≈ $${Number(d.priceUSD).toLocaleString('en-US')})` : ''}`
    : undefined;
  const fixtures: any[] = Array.isArray(d.fixtures) ? d.fixtures : [];
  const hasFix = String(d.hasFixtures || '').toLowerCase() === 'var';
  return (
    <>
      <div className="block">
        <h3>{t('dk_company')}</h3>
        <Row label={t('dk_founded')} value={l.foundedYear} />
        <Row label={t('dk_structure')} value={d.companyStructure} />
        <Row label={t('dk_partners')} value={d.partnerCount} />
        <Row label={t('dk_capital')} value={d.capital} />
        <Row label={t('dk_employees')} value={l.employees} />
        <Row label={t('dk_revenue')} value={l.revenue} />
        <Row label={t('dk_price')} value={priceStr} />
        <Row label={t('dk_paytype')} value={PAY[l.salePaymentType] ? t(PAY[l.salePaymentType]) : l.salePaymentType} />
        <Row label={t('dk_licenses')} value={d.licenses} />
        <Row label={t('dk_fixtures_incl')} value={d.hasFixtures ? (hasFix ? t('yes') : t('no')) : undefined} />
      </div>

      {hasFix && fixtures.length > 0 && (
        <div className="block">
          <h3>{t('dk_fixtures_list')}</h3>
          <div style={{ overflowX: 'auto', border: '1px solid var(--line)', borderRadius: 12 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: 'var(--bg-panel-raised)' }}>
                  <th style={{ textAlign: 'left', padding: '12px 14px', color: 'var(--text-dim)', fontSize: 12.5 }}>{t('dk_fixture')}</th>
                  <th style={{ textAlign: 'left', padding: '12px 14px', color: 'var(--text-dim)', fontSize: 12.5 }}>{t('dk_qty')}</th>
                  <th style={{ textAlign: 'right', padding: '12px 14px', color: 'var(--text-dim)', fontSize: 12.5 }}>{t('dk_est_value')}</th>
                </tr>
              </thead>
              <tbody>
                {fixtures.map((f, i) => (
                  <tr key={i} style={{ borderTop: '1px solid var(--line)' }}>
                    <td style={{ padding: '11px 14px' }}>{f.name}</td>
                    <td style={{ padding: '11px 14px', color: 'var(--text-dim)' }}>{f.qty || '—'}</td>
                    <td style={{ padding: '11px 14px', textAlign: 'right', color: 'var(--accent-a)', fontWeight: 600 }}>{f.value || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="block">
        <h3>{t('dk_finlegal')}</h3>
        {d.finLegalDisclosed === false ? (
          <p style={{ color: 'var(--text-faint)', fontSize: 14 }}>{t('dk_finlegal_hidden')}</p>
        ) : (
          <>
            <Row label={t('dk_market_debt')} value={d.marketDebt} />
            <Row label={t('dk_official_debt')} value={d.officialDebt} />
            <Row label={t('dk_personnel_debt')} value={d.personnelDebt} />
            <Row label={t('dk_enforcement')} value={d.enforcementDebt} />
            <Row label={t('dk_lawsuits')} value={d.lawsuits} />
          </>
        )}
      </div>
    </>
  );
}

function PartnershipDossier({ l }: { l: any }) {
  const { t } = useI18n();
  const d = l.details || {};
  const usdStr = d.priceUSD ? `≈ $${Number(d.priceUSD).toLocaleString('en-US')}` : undefined;
  return (
    <>
      <div className="block">
        <h3>{t('dk_partnership')}</h3>
        <Row label={t('dk_struct_model')} value={STRUCT_LABEL[l.structure] ? t(STRUCT_LABEL[l.structure]) : l.structure} />
        <Row label={t('dk_ptype')} value={PTYPE_LABEL[l.partnershipType] ? t(PTYPE_LABEL[l.partnershipType]) : l.partnershipType} />
        <Row label={t('dk_capital_sought')} value={l.amountText} />
        <Row label={t('dk_usd')} value={usdStr} />
        <Row label={t('dk_share_pct')} value={d.partnerSharePct ? `%${d.partnerSharePct}` : undefined} />
        <Row label={t('dk_duration')} value={d.partnershipDuration} />
        <Row label={t('dk_return')} value={d.expectedReturn} />
        <Row label={t('dk_status')} value={d.currentStatus} />
        <Row label={t('dk_founded')} value={d.foundedYear} />
        <Row label={t('dk_team')} value={d.teamSize} />
        <Row label={t('dk_revenue')} value={d.revenue} />
        <Row label={t('dk_sector_exp')} value={d.sectorExperience} />
        <Row label={t('dk_partner_expect')} value={d.partnerExpectation} />
        <Row label={t('dk_collateral')} value={d.collateralOffered ? (d.collateralDetail || 'Sunulacak') : undefined} />
        <Row label={t('dk_licenses')} value={d.licenses} />
        <Row label={t('dk_audited')} value={l.audited ? t('dk_yes_admin') : undefined} />
      </div>
    </>
  );
}

function IdeaDossier({ l }: { l: any }) {
  const { t } = useI18n();
  const d = l.details || {};
  return (
    <div className="block">
      <h3>{t('dk_idea')}</h3>
      <Row label={t('dk_stage')} value={l.stage} />
      <Row label={t('dk_capital_sought')} value={l.amountText} />
      <Row label={t('dk_struct_model')} value={STRUCT_LABEL[l.structure] ? t(STRUCT_LABEL[l.structure]) : l.structure} />
      <Row label={t('dk_ptype')} value={PTYPE_LABEL[l.partnershipType] ? t(PTYPE_LABEL[l.partnershipType]) : l.partnershipType} />
      <Row label={t('d_biztype')} value={d.businessType} />
      <Row label={t('dk_target_market')} value={d.targetMarket} />
      <Row label={t('dk_revenue_model')} value={d.revenueModel} />
      <Row label={t('dk_status')} value={d.currentStatus} />
      <Row label={t('dk_team_founder')} value={d.teamSize} />
      <Row label={t('dk_traction')} value={d.traction} />
      <Row label={t('dk_use_funds')} value={d.useOfFunds} />
      <Row label={t('dk_milestones')} value={d.milestones} />
      <Row label={t('dk_sector_exp')} value={d.sectorExperience} />
    </div>
  );
}

function FranchiseDossier({ l }: { l: any }) {
  const { t } = useI18n();
  const d = l.details || {};
  const usdStr = d.priceUSD ? `≈ $${Number(d.priceUSD).toLocaleString('en-US')}` : undefined;
  return (
    <div className="block">
      <h3>{t('dk_franchise')}</h3>
      <Row label={t('dk_fr_kind')} value={l.franchiseKind} />
      <Row label={t('dk_fr_invest')} value={l.amountText} />
      <Row label={t('dk_usd')} value={usdStr} />
      <Row label={t('d_biztype')} value={d.businessType} />
      <Row label={t('dk_fr_excl')} value={d.exclusivity} />
      <Row label={t('dk_fr_royalty')} value={d.royalty} />
      <Row label={t('dk_fr_exp_rev')} value={d.expectedRevenue} />
      <Row label={t('dk_fr_payback')} value={d.paybackPeriod} />
      <Row label={t('dk_fr_branches')} value={d.branches} />
      <Row label={t('dk_fr_area')} value={d.areaSqm} />
      <Row label={t('dk_fr_staff')} value={d.staffNeed} />
      <Row label={t('dk_fr_contract')} value={d.contractYears} />
      <Row label={t('dk_fr_support')} value={d.support} />
    </div>
  );
}

const CAPTIER_LABEL: Record<string, string> = {
  c1: '0 – 500.000 ₺ (tohum)', c2: '500.000 – 1.000.000 ₺ (erken)', c3: '1.000.000 ₺ + (büyüme)',
};
function InvestorDossier({ l }: { l: any }) {
  const { t } = useI18n();
  const d = l.details || {};
  const sectors = Array.isArray(l.sectors) ? l.sectors.join(', ') : undefined;
  return (
    <div className="block">
      <h3>{t('dk_investor')}</h3>
      <Row label={t('dk_inv_tier')} value={CAPTIER_LABEL[l.capitalTier] || l.capitalTier} />
      <Row label={t('dk_inv_range')} value={l.amountText} />
      <Row label={t('dk_inv_sectors')} value={sectors || d.sectors} />
      <Row label={t('dk_inv_share')} value={d.expectedShare} />
      <Row label={t('dk_inv_geo')} value={d.geoPref} />
      <Row label={t('dk_inv_value')} value={d.valueAdd} />
      <Row label={t('dk_inv_horizon')} value={d.horizon} />
    </div>
  );
}
