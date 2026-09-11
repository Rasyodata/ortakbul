'use client';
import Link from 'next/link';
import GroupedListings from '@/components/GroupedListings';
import { useI18n } from '@/lib/i18n';

// Freelance beceri alanları (TR + EN; diğer diller EN)
const FREELANCE_TR = ['Yazılım Geliştirme', 'Web/Mobil Geliştirme', 'Grafik Tasarım', 'UI/UX Tasarım', 'İçerik Yazarlığı', 'Çeviri', 'Dijital Pazarlama', 'SEO', 'Sosyal Medya Yönetimi', 'Video Editing', 'Seslendirme', 'Sanal Asistanlık', 'Muhasebe & Finans', 'Veri Girişi & Analiz'];
const FREELANCE_EN = ['Software Development', 'Web/Mobile Dev', 'Graphic Design', 'UI/UX Design', 'Content Writing', 'Translation', 'Digital Marketing', 'SEO', 'Social Media', 'Video Editing', 'Voice-over', 'Virtual Assistance', 'Accounting & Finance', 'Data Entry & Analysis'];

const WAYS: [string, string, string][] = [
  ['🛒', 'eco_w1_t', 'eco_w1_d'], ['💻', 'eco_w2_t', 'eco_w2_d'], ['📦', 'eco_w3_t', 'eco_w3_d'],
  ['🎥', 'eco_w4_t', 'eco_w4_d'], ['🎓', 'eco_w5_t', 'eco_w5_d'], ['🎨', 'eco_w6_t', 'eco_w6_d'],
];
const MODELS: [string, string, string][] = [
  ['🛒', 'Amazon FBA/FBM', 'eco_m1_d'], ['🎨', 'Etsy', 'eco_m2_d'], ['🔁', 'Dropshipping', 'eco_m3_d'],
  ['🏷️', 'Private Label', 'eco_m4_d'], ['🏬', 'Pazaryeri', 'eco_m5_d'], ['💾', 'Dijital Ürün', 'eco_m6_d'],
];
const STEPS: [string, string][] = [['eco_st1_t', 'eco_st1_d'], ['eco_st2_t', 'eco_st2_d'], ['eco_st3_t', 'eco_st3_d'], ['eco_st4_t', 'eco_st4_d']];

export default function Page() {
  const { t, lang } = useI18n();
  const skills = lang === 'tr' ? FREELANCE_TR : FREELANCE_EN;

  return (
    <div className="wrap">
      <div className="special-hero partner">
        <div className="eyebrow">{t('ecom_hero_eb')}</div>
        <h1>{t('ecom_hero_t')}</h1>
        <p>{t('ecom_hero_s')}</p>
        <div className="hero-actions">
          <Link href="/bana-uygun" className="btn btn-primary">{t('ecom_expert_btn')}</Link>
          <Link href="/danismanlar" className="btn btn-ghost">{t('ecom_find_expert')}</Link>
        </div>
      </div>

      <div className="stat-strip" style={{ marginTop: 22 }}>
        <div><div className="num">$6,3T</div><div className="lbl">{t('eco_s1_l')}</div></div>
        <div><div className="num">$1,5T</div><div className="lbl">{t('eco_s2_l')}</div></div>
        <div><div className="num">190+</div><div className="lbl">{t('eco_s3_l')}</div></div>
        <div><div className="num">₺0*</div><div className="lbl">{t('eco_s4_l')}</div></div>
      </div>

      <div className="section-tight">
        <div className="eyebrow">{t('eco_ways_eb')}</div>
        <h2 className="sec">{t('eco_ways_t')}</h2>
        <p className="kicker">{t('eco_ways_s')}</p>
        <div className="grid3">
          {WAYS.map(([i, tk, dk]) => (
            <div className="idea-card" key={tk}><span className="icon">{i}</span><h3>{t(tk)}</h3><p>{t(dk)}</p></div>
          ))}
        </div>
      </div>

      <div className="section-tight">
        <div className="eyebrow">{t('eco_fl_eb')}</div>
        <h2 className="sec">{t('eco_fl_t')}</h2>
        <p className="kicker">{t('eco_fl_s')}</p>
        <div className="optset" style={{ marginTop: 20 }}>
          {skills.map((s) => <span className="skill-pill" key={s}>{s}</span>)}
        </div>
      </div>

      <div className="section-tight">
        <div className="eyebrow">{t('eco_models_eb')}</div>
        <h2 className="sec">{t('eco_models_t')}</h2>
        <div className="grid3">
          {MODELS.map(([i, name, dk]) => (
            <div className="audience-card" key={name}><span className="icon">{i}</span><h4>{name}</h4><p>{t(dk)}</p></div>
          ))}
        </div>
      </div>

      <div className="section-tight">
        <div className="eyebrow">{t('eco_step_eb')}</div>
        <h2 className="sec">{t('eco_step_t')}</h2>
        <div className="grid4">
          {STEPS.map(([tk, dk], idx) => (
            <div className="idea-card" key={tk} style={{ borderLeftColor: 'var(--gold)' }}>
              <div style={{ fontFamily: 'var(--disp-font),serif', fontSize: 26, fontWeight: 600, color: 'var(--green)' }}>{idx + 1}</div>
              <h3 style={{ marginTop: 4 }}>{t(tk)}</h3><p>{t(dk)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="section-tight">
        <div className="cta-band">
          <h2>{t('eco_cta_t')}</h2>
          <p>{t('eco_cta_d')}</p>
          <div className="hero-actions" style={{ justifyContent: 'center' }}>
            <Link href="/bana-uygun" className="btn btn-primary">{t('eco_cta_b1')}</Link>
            <Link href="/danismanlar" className="btn btn-ghost">{t('eco_cta_b2')}</Link>
          </div>
        </div>
      </div>

      <GroupedListings
        businessTypes={['Home Ofis', 'E-Ticaret']}
        eyebrow="ecom_list_eb"
        title="ecom_list_t"
        subtitle="ecom_list_s"
        addHref="/paylas"
        addLabel="ecom_add"
        valueLabel="val_total"
      />
    </div>
  );
}
