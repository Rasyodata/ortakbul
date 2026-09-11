'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useI18n } from '@/lib/i18n';

type Tab =
  | 'listings' | 'reports' | 'match' | 'users' | 'consultants' | 'partners' | 'payments'
  | 'agent' | 'audit' | 'roles' | 'create' | 'settings' | 'security';

const NAV: [Tab, string][] = [
  ['listings', 'ad_nav_listings'],
  ['reports', 'ad_nav_reports'],
  ['match', 'ad_nav_match'],
  ['users', 'ad_nav_users'],
  ['consultants', 'ad_nav_consultants'],
  ['partners', 'ad_nav_partners'],
  ['payments', 'ad_nav_payments'],
  ['agent', 'ad_nav_agent'],
  ['roles', 'ad_nav_roles'],
  ['settings', 'ad_nav_settings'],
  ['security', 'ad_nav_security'],
  ['audit', 'ad_nav_audit'],
  ['create', 'ad_nav_create'],
];

const SOCIAL_FIELDS: [string, string][] = [
  ['facebook', 'Facebook URL'], ['youtube', 'YouTube URL'], ['x', 'X (Twitter) URL'],
  ['instagram', 'Instagram URL'], ['linkedin', 'LinkedIn URL'], ['tiktok', 'TikTok URL'],
];

export default function AdminPage() {
  const { user, ready } = useAuth();
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>('listings');
  const [rows, setRows] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [perms, setPerms] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [bannedIps, setBannedIps] = useState<any[]>([]);
  const [secEvents, setSecEvents] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const load = useCallback(async () => {
    setError(''); setMsg('');
    try {
      if (tab === 'listings') setRows(await api.get('/admin/listings'));
      else if (tab === 'reports') setRows(await api.get('/admin/reports'));
      else if (tab === 'match') setRows(await api.get('/admin/match-requests'));
      else if (tab === 'users') setRows(await api.get('/admin/users/pending'));
      else if (tab === 'consultants') setRows(await api.get('/admin/consultants/pending'));
      else if (tab === 'partners') setRows(await api.get('/admin/partners'));
      else if (tab === 'payments') setRows(await api.get('/admin/payments'));
      else if (tab === 'agent') setRows(await api.get('/agent/reports'));
      else if (tab === 'audit') setRows(await api.get('/admin/audit'));
      else if (tab === 'roles') {
        setRoles(await api.get('/admin/roles'));
        setPerms(await api.get('/admin/permissions'));
      }
      else if (tab === 'settings') {
        setSettings(await api.get('/site-settings'));
      }
      else if (tab === 'security') {
        setBannedIps(await api.get('/admin/security/banned-ips'));
        setSecEvents(await api.get('/admin/security/events'));
      }
    } catch (e: any) { setError(e.message); setRows([]); }
  }, [tab]);

  useEffect(() => { if (user) load(); }, [user, load]);

  if (ready && !user) {
    return (
      <div className="auth-wrap"><div className="auth-card">
        <h2 style={{ fontSize: 20, marginBottom: 10 }}>{t('ad_login_title')}</h2>
        <p style={{ color: 'var(--text-faint)', fontSize: 13.5, marginBottom: 16 }}>{t('ad_login_sub')}</p>
        <Link href="/giris" className="btn btn-primary btn-block">{t('btn_login')}</Link>
      </div></div>
    );
  }

  const act = async (fn: () => Promise<any>, ok?: string) => {
    try { await fn(); if (ok) setMsg(ok); await load(); } catch (e: any) { setError(e.message); }
  };

  const togglePerm = (role: any, code: string, checked: boolean) => {
    const codes = new Set<string>(role.permissions);
    if (checked) codes.add(code); else codes.delete(code);
    act(() => api.put(`/admin/roles/${role.id}/permissions`, { permissionCodes: [...codes] }), t('ad_perm_ok'));
  };

  return (
    <div className="admin-shell">
      <div className="admin-side">
        {NAV.map(([k, l]) => (
          <a key={k} className={tab === k ? 'active' : ''} onClick={() => setTab(k)}>{t(l)}</a>
        ))}
      </div>
      <div className="admin-main">
        <div className="eyebrow">{t('ad_panel')}</div>
        <h1 style={{ fontSize: 24, marginBottom: 20 }}>{t(NAV.find((n) => n[0] === tab)?.[1] || '').replace(/^\S+\s/, '')}</h1>
        {error && <div className="alert alert-error"><span className="alert-ico">⛔</span><div>{t('ad_err')}: {error}</div></div>}
        {msg && <div className="alert alert-success"><span className="alert-ico">✅</span><div>{msg}</div></div>}

        {tab === 'listings' && (
          <Table head={[t('ad_h_title'), t('ad_h_type'), t('ad_h_owner'), t('ad_h_status'), t('ad_h_action')]}>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.title}</td><td>{r.type}</td><td>{r.owner?.fullName}</td>
                <td><Badge s={r.status} /></td>
                <td>{r.status !== 'APPROVED'
                  ? <button className="icon-btn" onClick={() => act(() => api.post(`/admin/listings/${r.id}/approve`), t('ad_approved'))}>{t('ad_approve')}</button>
                  : <button className="icon-btn" onClick={() => act(() => api.post(`/admin/listings/${r.id}/hold`), t('ad_held'))}>{t('ad_hold')}</button>}</td>
              </tr>
            ))}
          </Table>
        )}

        {tab === 'reports' && (
          <Table head={[t('ad_h_listing'), t('ad_h_reporter'), t('ad_h_reason'), t('ad_h_status'), t('ad_h_action')]}>
            {rows.map((r) => {
              const RLBL: Record<string, string> = { FRAUD: t('rr_fraud').replace(/^🚩 /, ''), MISLEADING: t('rr_misleading'), INCORRECT_INFO: t('rr_incorrect'), SPAM: t('rr_spam'), INAPPROPRIATE: t('rr_inappropriate'), DUPLICATE: t('rr_duplicate'), OTHER: t('rr_other') };
              return (
                <tr key={r.id}>
                  <td>{r.listing?.title}<br /><small style={{ color: 'var(--text-faint)' }}>{r.listing?.type}</small></td>
                  <td>{r.reporter?.fullName || t('ad_anon')}{r.note ? <><br /><small style={{ color: 'var(--text-faint)' }}>{r.note}</small></> : null}</td>
                  <td><span style={{ color: r.reason === 'FRAUD' ? '#f2716a' : 'var(--text)' }}>{RLBL[r.reason] || r.reason}</span></td>
                  <td><Badge s={r.status} /></td>
                  <td className="row-actions">
                    {r.status === 'OPEN' ? (
                      <>
                        <button className="icon-btn" onClick={() => act(() => api.post(`/admin/reports/${r.id}/resolve`, { status: 'ACTIONED' }), t('ad_actioned_ok'))}>{t('ad_actioned')}</button>
                        <button className="icon-btn" onClick={() => act(() => api.post(`/admin/reports/${r.id}/resolve`, { status: 'DISMISSED' }), t('ad_dismissed_ok'))}>{t('ad_dismiss')}</button>
                      </>
                    ) : '—'}
                  </td>
                </tr>
              );
            })}
          </Table>
        )}

        {tab === 'match' && (
          <Table head={[t('ad_h_contact'), t('ad_h_budget'), t('ad_h_interest'), t('ad_h_country'), t('ad_h_status'), t('ad_h_action')]}>
            {rows.map((r) => {
              const BLBL: Record<string, string> = { b1: '0–100K ₺', b2: '100–500K ₺', b3: '500K–1M ₺', b4: '1M+ ₺' };
              const interest = [...(r.opportunityTypes || []), ...(r.sectors || []), ...(r.businessTypes || [])].slice(0, 5).join(', ');
              return (
                <tr key={r.id}>
                  <td>{r.fullName}<br /><small style={{ color: 'var(--text-faint)' }}>{[r.email, r.phone].filter(Boolean).join(' · ') || '—'}</small></td>
                  <td><b>{BLBL[r.budgetTier] || r.budgetTier}</b></td>
                  <td><small>{interest || '—'}</small>{r.goal ? <><br /><small style={{ color: 'var(--text-faint)' }}>🎯 {r.goal}</small></> : null}</td>
                  <td>{r.countryCode || '—'}{r.city ? ` · ${r.city}` : ''}</td>
                  <td><Badge s={r.status} /></td>
                  <td className="row-actions">
                    {r.status !== 'CLOSED' ? (
                      <>
                        {r.status === 'NEW' && <button className="icon-btn" onClick={() => act(() => api.post(`/admin/match-requests/${r.id}/status`, { status: 'CONTACTED' }), t('ad_m_contacted'))}>{t('ad_m_contacted')}</button>}
                        {(r.status === 'NEW' || r.status === 'CONTACTED') && <button className="icon-btn" onClick={() => act(() => api.post(`/admin/match-requests/${r.id}/status`, { status: 'MATCHED' }), t('ad_m_matched'))}>{t('ad_m_matched')}</button>}
                        <button className="icon-btn" onClick={() => act(() => api.post(`/admin/match-requests/${r.id}/status`, { status: 'CLOSED' }), t('ad_m_closed'))}>{t('ad_m_closed')}</button>
                      </>
                    ) : '—'}
                  </td>
                </tr>
              );
            })}
          </Table>
        )}

        {tab === 'users' && (
          <Table head={[t('ad_h_name'), t('ad_h_role'), t('ad_h_country'), t('ad_h_mail'), t('ad_h_action')]}>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.fullName}<br /><small style={{ color: 'var(--text-faint)' }}>{r.email}</small></td>
                <td>{r.memberType}</td><td>{r.countryCode}</td><td>{r.emailVerified ? '✓' : '—'}</td>
                <td><button className="icon-btn" onClick={() => act(() => api.post(`/admin/users/${r.id}/approve`), t('ad_user_ok'))}>{t('ad_approve')}</button></td>
              </tr>
            ))}
          </Table>
        )}

        {tab === 'consultants' && (
          <Table head={[t('ad_h_name'), t('ad_h_category'), t('ad_h_sector'), t('ad_h_action')]}>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.user?.fullName}</td><td>{r.category}</td><td>{r.sector}</td>
                <td><button className="icon-btn" onClick={() => act(() => api.post(`/admin/consultants/${r.userId}/approve`), t('ad_cons_ok'))}>{t('ad_approve')}</button></td>
              </tr>
            ))}
          </Table>
        )}

        {tab === 'partners' && (
          <>
            <PartnerForm onDone={() => act(async () => {}, t('ad_partner_added'))} />
            <Table head={[t('ad_h_firm'), t('ad_h_type'), t('ad_h_region'), t('ad_h_sectors')]}>
              {rows.map((r) => (
                <tr key={r.id}><td>{r.name}</td><td>{r.type}</td><td>{r.region}</td><td>{(r.sectors || []).join(', ')}</td></tr>
              ))}
            </Table>
          </>
        )}

        {tab === 'payments' && (
          <Table head={[t('ad_h_user'), t('ad_h_listing'), t('ad_h_pkg'), t('ad_h_amount'), t('ad_h_provider'), t('ad_h_status')]}>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.user?.fullName}</td><td>{r.listing?.title || '—'}</td><td>{r.tier || '—'}</td>
                <td>{(r.amount / 100).toLocaleString()} {r.currency}</td><td>{r.provider}</td><td><Badge s={r.status} /></td>
              </tr>
            ))}
          </Table>
        )}

        {tab === 'agent' && (
          <>
            <button className="btn btn-primary btn-sm" style={{ marginBottom: 16 }}
              onClick={() => act(() => api.post('/admin/agent/run'), t('ad_scan_ok'))}>{t('ad_run_scan')}</button>
            {rows.map((r) => (
              <div className="idea-card" key={r.id} style={{ marginBottom: 14 }}>
                <span className="tag struct">{r.tag}</span>
                <h3 style={{ marginTop: 8 }}>{r.title}</h3><p style={{ marginTop: 6 }}>{r.body}</p>
              </div>
            ))}
          </>
        )}

        {tab === 'audit' && (
          <Table head={[t('ad_h_time'), t('ad_h_actor'), t('ad_h_action'), t('ad_h_entity')]}>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{new Date(r.createdAt).toLocaleString('tr-TR')}</td>
                <td>{r.actor?.fullName || t('ad_system')}</td><td>{r.action}</td><td>{r.entityType} {r.entityId?.slice(0, 6)}</td>
              </tr>
            ))}
          </Table>
        )}

        {tab === 'roles' && (
          <div className="table-card"><div style={{ overflowX: 'auto' }}>
            <table>
              <thead><tr><th>{t('ad_role')}</th>{perms.map((p) => <th key={p.code} style={{ fontSize: 10 }}>{p.label}</th>)}</tr></thead>
              <tbody>
                {roles.map((role) => (
                  <tr key={role.id}>
                    <td><b>{role.label}</b></td>
                    {perms.map((p) => (
                      <td key={p.code} style={{ textAlign: 'center' }}>
                        <input type="checkbox" style={{ width: 'auto' }}
                          checked={role.permissions.includes(p.code)}
                          onChange={(e) => togglePerm(role, p.code, e.target.checked)} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div></div>
        )}

        {tab === 'settings' && settings && (
          <SettingsPanel
            initial={settings}
            onSave={async (payload) => act(async () => { const r = await api.put('/admin/site-settings', payload); setSettings({ socialLinks: r.socialLinks || {}, headScripts: r.headScripts || '', bodyScripts: r.bodyScripts || '', announcement: r.announcement }); }, 'Site ayarları kaydedildi. (Değişiklikler sitede yenilemede görünür.)')}
          />
        )}

        {tab === 'security' && (
          <div style={{ display: 'grid', gap: 20 }}>
            <div className="form-card" style={{ maxWidth: 640 }}>
              <h3 style={{ fontSize: 16, marginBottom: 12 }}>🛡️ {t('ad_sec_ip_ban')}</h3>
              <div className="field-row">
                <div className="field"><label>{t('ad_sec_ip')}</label><input id="banIp" placeholder={t('ad_sec_ip_ph')} /></div>
                <div className="field"><label>{t('ad_h_reason')}</label><input id="banReason" placeholder={t('ad_sec_reason_ph')} /></div>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => {
                const ip = (document.getElementById('banIp') as HTMLInputElement)?.value?.trim();
                const reason = (document.getElementById('banReason') as HTMLInputElement)?.value || '';
                if (ip) act(() => api.post('/admin/security/ban-ip', { ip, reason }), t('ad_sec_ban_ok'));
              }}>{t('ad_sec_ban_btn')}</button>
            </div>

            <div className="table-card"><div style={{ overflowX: 'auto' }}>
              <h4 style={{ padding: '14px 16px 0', fontSize: 14 }}>{t('ad_sec_banned_ips')}</h4>
              <table><thead><tr><th>{t('ad_sec_ip')}</th><th>{t('ad_h_reason')}</th><th>{t('ad_h_action')}</th></tr></thead>
                <tbody>
                  {bannedIps.length ? bannedIps.map((b) => (
                    <tr key={b.id}><td>{b.ip}</td><td>{b.reason || '—'}</td>
                      <td><button className="icon-btn" onClick={() => act(() => api.post('/admin/security/unban-ip', { ip: b.ip }), t('ad_sec_unban_ok'))}>{t('ad_sec_unban')}</button></td></tr>
                  )) : <tr><td colSpan={3} style={{ color: 'var(--text-faint)' }}>{t('ad_sec_no_ban')}</td></tr>}
                </tbody>
              </table>
            </div></div>

            <div className="table-card"><div style={{ overflowX: 'auto' }}>
              <h4 style={{ padding: '14px 16px 0', fontSize: 14 }}>{t('ad_sec_events')}</h4>
              <table><thead><tr><th>{t('ad_sec_when')}</th><th>{t('ad_sec_type')}</th><th>{t('ad_sec_ip')}</th><th>{t('ad_h_mail')}</th></tr></thead>
                <tbody>
                  {secEvents.map((e) => (
                    <tr key={e.id}>
                      <td>{new Date(e.createdAt).toLocaleString('tr-TR')}</td>
                      <td><span className="tag struct">{e.type}</span></td>
                      <td>{e.ip || '—'}</td><td>{e.email || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div></div>
          </div>
        )}

        {tab === 'create' && <CreatePanel onMsg={setMsg} onErr={setError} />}

        {['listings', 'reports', 'match', 'users', 'consultants', 'partners', 'payments', 'audit'].includes(tab) && rows.length === 0 && !error && (
          <div className="empty-state">{t('ad_none')}</div>
        )}
      </div>
    </div>
  );
}

function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="table-card"><div style={{ overflowX: 'auto' }}>
      <table><thead><tr>{head.map((h) => <th key={h}>{h}</th>)}</tr></thead><tbody>{children}</tbody></table>
    </div></div>
  );
}
function SettingsPanel({ initial, onSave }: { initial: any; onSave: (p: any) => void }) {
  const { t } = useI18n();
  const [social, setSocial] = useState<Record<string, string>>(initial.socialLinks || {});
  const [head, setHead] = useState<string>(initial.headScripts || '');
  const [body, setBody] = useState<string>(initial.bodyScripts || '');
  const [ann, setAnn] = useState<any>(initial.announcement || { enabled: false, title: '', message: '', ctaText: '', ctaLink: '', version: '1' });
  const [reshow, setReshow] = useState(false);
  const set = (k: string, v: string) => setSocial((s) => ({ ...s, [k]: v }));
  const setA = (k: string, v: any) => setAnn((s: any) => ({ ...s, [k]: v }));

  const save = () => {
    const version = reshow ? String((Number(ann.version) || 1) + 1) : (ann.version || '1');
    onSave({ socialLinks: social, headScripts: head, bodyScripts: body, announcement: { ...ann, version } });
  };

  return (
    <div className="form-card" style={{ maxWidth: 780 }}>
      <h3 style={{ fontSize: 16, marginBottom: 4 }}>{t('ad_ann_title')}</h3>
      <p style={{ color: 'var(--text-faint)', fontSize: 13, marginBottom: 12 }}>
        Sağ altta çıkan duyuru kutusu. İstediğinde aç/kapat; kullanıcılar kapatabilir.
      </p>
      <label className="remember-row" style={{ marginBottom: 12 }}>
        <input type="checkbox" checked={!!ann.enabled} onChange={(e) => setA('enabled', e.target.checked)} />
        <span><b>{t('ad_ann_on')}</b> {ann.enabled ? t('ad_ann_showing') : t('ad_ann_off')}</span>
      </label>
      <div className="field"><label>{t('ad_ann_titlefield')}</label><input value={ann.title || ''} onChange={(e) => setA('title', e.target.value)} placeholder="📱 Mobil uygulamalarımız çok yakında!" /></div>
      <div className="field"><label>{t('ad_ann_msg')}</label><textarea value={ann.message || ''} onChange={(e) => setA('message', e.target.value)} style={{ minHeight: 70 }} placeholder="iOS ve Android uygulamalarımız çok yakında hizmetinizde." /></div>
      <div className="field-row">
        <div className="field">
          <label>{t('ad_ann_pos')}</label>
          <select value={ann.position || 'center'} onChange={(e) => setA('position', e.target.value)}>
            <option value="center">{t('ad_pos_center')}</option>
            <option value="bottom-right">{t('ad_pos_br')}</option>
            <option value="bottom-left">{t('ad_pos_bl')}</option>
            <option value="top-center">{t('ad_pos_tc')}</option>
          </select>
        </div>
        <div className="field">
          <label>{t('ad_ann_img')}</label>
          <input value={ann.imageUrl || ''} onChange={(e) => setA('imageUrl', e.target.value)} placeholder="https://... veya aşağıdan yükle" />
          <input type="file" accept="image/*" style={{ marginTop: 6 }} onChange={(e) => {
            const f = e.target.files?.[0]; if (!f) return;
            if (f.size > 800 * 1024) { alert('Görsel 800KB\'den küçük olmalı.'); return; }
            const r = new FileReader(); r.onload = () => setA('imageUrl', String(r.result)); r.readAsDataURL(f);
          }} />
        </div>
      </div>
      {ann.imageUrl && (
        <div style={{ margin: '4px 0 12px' }}>
          <img src={ann.imageUrl} alt="önizleme" style={{ maxHeight: 120, borderRadius: 10, border: '1px solid var(--line)' }} />
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: 10 }} onClick={() => setA('imageUrl', '')}>{t('ad_ann_img_rm')}</button>
        </div>
      )}
      <div className="field-row">
        <div className="field"><label>{t('ad_ann_btn_txt')}</label><input value={ann.ctaText || ''} onChange={(e) => setA('ctaText', e.target.value)} placeholder="Haber ver / Detay" /></div>
        <div className="field"><label>{t('ad_ann_btn_link')}</label><input value={ann.ctaLink || ''} onChange={(e) => setA('ctaLink', e.target.value)} placeholder="https://..." /></div>
      </div>
      <label className="remember-row" style={{ marginBottom: 4 }}>
        <input type="checkbox" checked={reshow} onChange={(e) => setReshow(e.target.checked)} />
        <span>{t('ad_ann_reshow')}</span>
      </label>

      <div style={{ height: 1, background: 'var(--line)', margin: '20px 0' }} />

      <h3 style={{ fontSize: 16, marginBottom: 4 }}>🔗 Sosyal medya linkleri</h3>
      <p style={{ color: 'var(--text-faint)', fontSize: 13, marginBottom: 14 }}>
        Nav ve footer'da ikon olarak gösterilir. Boş bırakılan kanal gizlenir.
      </p>
      <div className="field-row" style={{ flexWrap: 'wrap' }}>
        {SOCIAL_FIELDS.map(([k, l]) => (
          <div className="field" key={k} style={{ minWidth: 220, flex: 1 }}>
            <label>{l}</label>
            <input value={social[k] || ''} onChange={(e) => set(k, e.target.value)} placeholder={`https://...`} />
          </div>
        ))}
      </div>

      <div style={{ height: 1, background: 'var(--line)', margin: '20px 0' }} />

      <h3 style={{ fontSize: 16, marginBottom: 4 }}>🧩 Head script / doğrulama kodu</h3>
      <p style={{ color: 'var(--text-faint)', fontSize: 13, marginBottom: 10 }}>
        Google Search Console meta doğrulaması, Google Analytics/Ads etiketleri, özel <code>&lt;script&gt;</code>/<code>&lt;meta&gt;</code> — sayfanın <b>&lt;head&gt;</b> bölümüne eklenir. HTML olarak yapıştır.
      </p>
      <textarea value={head} onChange={(e) => setHead(e.target.value)} spellCheck={false}
        placeholder={'<meta name="google-site-verification" content="..." />\n<!-- Google tag (gtag.js) -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXX"></script>'}
        style={{ minHeight: 130, fontFamily: 'monospace', fontSize: 12.5 }} />

      <h3 style={{ fontSize: 16, margin: '18px 0 4px' }}>🧩 Body script (opsiyonel)</h3>
      <p style={{ color: 'var(--text-faint)', fontSize: 13, marginBottom: 10 }}>
        <b>&lt;body&gt;</b> sonuna eklenir (chat widget, remarketing pikseli vb.).
      </p>
      <textarea value={body} onChange={(e) => setBody(e.target.value)} spellCheck={false}
        placeholder={'<!-- Meta Pixel / chat widget kodu -->'}
        style={{ minHeight: 90, fontFamily: 'monospace', fontSize: 12.5 }} />

      <button className="btn btn-primary btn-sm" style={{ marginTop: 16 }} onClick={save}>
        Kaydet
      </button>
    </div>
  );
}

function Badge({ s }: { s: string }) {
  const cls = s === 'APPROVED' || s === 'SUCCEEDED' ? 'approved' : 'pending';
  return <span className={`badge ${cls}`}>{s}</span>;
}

function PartnerForm({ onDone }: { onDone: () => void }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await api.post('/admin/partners', {
      name: fd.get('name'), type: fd.get('type'), region: fd.get('region'),
      sectors: String(fd.get('sectors') || '').split(',').map((s) => s.trim()).filter(Boolean),
    });
    (e.currentTarget as HTMLFormElement).reset();
    setOpen(false); onDone();
  };
  if (!open) return <button className="btn btn-ghost btn-sm" style={{ marginBottom: 16 }} onClick={() => setOpen(true)}>+ Partner ekle</button>;
  return (
    <div className="table-card"><div style={{ padding: 20 }}><form onSubmit={submit}>
      <div className="field-row">
        <div className="field"><label>{t('ad_firm_name')}</label><input required name="name" /></div>
        <div className="field"><label>{t('ad_type')}</label><input required name="type" placeholder="Yatırım Ağı" /></div>
      </div>
      <div className="field-row">
        <div className="field"><label>{t('ad_region')}</label><input required name="region" /></div>
        <div className="field"><label>{t('ad_sectors_comma')}</label><input name="sectors" placeholder="Tarım, Gıda" /></div>
      </div>
      <button className="btn btn-primary btn-sm" type="submit">{t('ad_add')}</button>
    </form></div></div>
  );
}

function CreatePanel({ onMsg, onErr }: { onMsg: (s: string) => void; onErr: (s: string) => void }) {
  const { t } = useI18n();
  const handle = (body: (fd: FormData) => any, path: string, ok: string) =>
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      try {
        await api.post(path, body(new FormData(form)));
        onMsg(ok);
        form.reset();
      } catch (er: any) { onErr(er.message); }
    };

  return (
    <div className="grid3" style={{ gridTemplateColumns: '1fr 1fr' }}>
      <div className="table-card"><h3>{t('ad_create_member')}</h3><div style={{ padding: 20 }}>
        <form onSubmit={handle(
          (fd) => ({ email: fd.get('email'), fullName: fd.get('fullName'), memberType: fd.get('memberType'), countryCode: fd.get('countryCode') }),
          '/admin/users/member', t('ad_member_created'))}>
          <div className="field"><label>{t('f_fullname')}</label><input required name="fullName" /></div>
          <div className="field"><label>{t('f_email')}</label><input required type="email" name="email" /></div>
          <div className="field-row">
            <div className="field"><label>{t('ad_role')}</label><select name="memberType"><option value="ENTREPRENEUR">Girişimci</option><option value="INVESTOR">Yatırımcı</option><option value="BUSINESS_PARTNER">İş ortağı</option></select></div>
            <div className="field"><label>{t('f_country')}</label><input name="countryCode" defaultValue="TR" /></div>
          </div>
          <button className="btn btn-primary btn-sm" type="submit">{t('ad_create_btn')}</button>
        </form>
      </div></div>

      <div className="table-card"><h3>{t('ad_create_listing')}</h3><div style={{ padding: 20 }}>
        <form onSubmit={handle(
          (fd) => ({ ownerId: fd.get('ownerId'), type: fd.get('type'), title: fd.get('title'), short: fd.get('short'), detail: fd.get('detail'), tier: fd.get('tier') }),
          '/admin/listings', t('ad_listing_created'))}>
          <div className="field"><label>{t('ad_owner_id')}</label><input required name="ownerId" placeholder="user id" /></div>
          <div className="field-row">
            <div className="field"><label>{t('ad_type')}</label><select name="type"><option value="IDEA">Fikir</option><option value="PARTNERSHIP">Ortak Arayan</option></select></div>
            <div className="field"><label>{t('ad_pkg_free')}</label><select name="tier"><option value="NORMAL">Normal</option><option value="FEATURED">Öne Çıkan</option><option value="PRIVILEGED">Ayrıcalıklı</option><option value="SHOWCASE">Vitrin</option></select></div>
          </div>
          <div className="field"><label>{t('ad_ann_titlefield')}</label><input required name="title" /></div>
          <div className="field"><label>{t('ad_short')}</label><input required name="short" /></div>
          <div className="field"><label>{t('ad_detail')}</label><textarea required name="detail" /></div>
          <button className="btn btn-primary btn-sm" type="submit">{t('ad_publish')}</button>
        </form>
      </div></div>
    </div>
  );
}
