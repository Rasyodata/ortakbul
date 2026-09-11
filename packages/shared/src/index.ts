// Web, mobil ve API'nin paylaştığı domain sabitleri.

export const LOCALES = [
  { code: 'tr', flag: '🇹🇷', name: 'Türkçe', dir: 'ltr' },
  { code: 'en', flag: '🇬🇧', name: 'English', dir: 'ltr' },
  { code: 'ru', flag: '🇷🇺', name: 'Русский', dir: 'ltr' },
  { code: 'ar', flag: '🇸🇦', name: 'العربية', dir: 'rtl' },
  { code: 'fa', flag: '🇮🇷', name: 'فارسی', dir: 'rtl' },
  { code: 'fr', flag: '🇫🇷', name: 'Français', dir: 'ltr' },
  { code: 'de', flag: '🇩🇪', name: 'Deutsch', dir: 'ltr' },
  { code: 'es', flag: '🇪🇸', name: 'Español', dir: 'ltr' },
  { code: 'pt', flag: '🇵🇹', name: 'Português', dir: 'ltr' },
] as const;

export const COUNTRIES = [
  { code: 'TR', flag: '🇹🇷', name: 'Türkiye', dial: '+90', tax: 'Vergi Dairesi + VKN/TCKN' },
  { code: 'US', flag: '🇺🇸', name: 'ABD', dial: '+1', tax: 'EIN / Tax ID' },
  { code: 'GB', flag: '🇬🇧', name: 'Birleşik Krallık', dial: '+44', tax: 'VAT / UTR No' },
  { code: 'DE', flag: '🇩🇪', name: 'Almanya', dial: '+49', tax: 'USt-IdNr' },
  { code: 'FR', flag: '🇫🇷', name: 'Fransa', dial: '+33', tax: 'SIRET / TVA' },
  { code: 'ES', flag: '🇪🇸', name: 'İspanya', dial: '+34', tax: 'NIF / CIF' },
  { code: 'PT', flag: '🇵🇹', name: 'Portekiz', dial: '+351', tax: 'NIF' },
  { code: 'RU', flag: '🇷🇺', name: 'Rusya', dial: '+7', tax: 'ИНН (INN)' },
  { code: 'SA', flag: '🇸🇦', name: 'Suudi Arabistan', dial: '+966', tax: 'VAT No' },
  { code: 'AE', flag: '🇦🇪', name: 'BAE', dial: '+971', tax: 'TRN' },
  { code: 'QA', flag: '🇶🇦', name: 'Katar', dial: '+974', tax: 'TIN' },
  { code: 'IR', flag: '🇮🇷', name: 'İran', dial: '+98', tax: 'کد اقتصادی' },
  { code: 'AZ', flag: '🇦🇿', name: 'Azerbaycan', dial: '+994', tax: 'VÖEN' },
  { code: 'NL', flag: '🇳🇱', name: 'Hollanda', dial: '+31', tax: 'BTW / KVK' },
  { code: 'IT', flag: '🇮🇹', name: 'İtalya', dial: '+39', tax: 'Partita IVA' },
] as const;

export const LISTING_TIERS = [
  { key: 'NORMAL', label: 'NORMAL', weight: 1, priceTL: 0 },
  { key: 'FEATURED', label: 'ÖNE ÇIKAN', weight: 2, priceTL: 249 },
  { key: 'PRIVILEGED', label: 'AYRICALIKLI', weight: 3, priceTL: 599 },
  { key: 'SHOWCASE', label: 'VİTRİN', weight: 4, priceTL: 1499 },
] as const;

export const CAPITAL_TIERS = [
  { key: 'c1', min: 0, max: 500000, label: '0 – 500.000 ₺' },
  { key: 'c2', min: 500000, max: 1000000, label: '500.000 – 1.000.000 ₺' },
  { key: 'c3', min: 1000000, max: null, label: '1.000.000 ₺ +' },
] as const;

export const PARTNERSHIP_STRUCTURES = [
  { key: 'CAPITAL', label: 'Sermaye' },
  { key: 'COLLATERAL', label: 'Teminat' },
  { key: 'CREDIT_LINE', label: 'Kredi Line' },
  { key: 'CHEQUE_BOND', label: 'Çek / Bono' },
  { key: 'EFFORT', label: 'Emek / Know-how' },
] as const;

export const PARTNERSHIP_TYPES = [
  { key: 'PROFIT_LOSS', label: 'Kâr-Zarar Ortaklığı' },
  { key: 'TIMED', label: 'Süreli Ortaklık' },
  { key: 'PROFIT', label: 'Kâr Ortaklığı' },
  { key: 'PROJECT', label: 'Proje Ortaklığı' },
  { key: 'GOODS_PURCHASE', label: 'Mal Alım Ortaklığı' },
  { key: 'CAPITAL', label: 'Sermaye Ortaklığı' },
  { key: 'FRANCHISE', label: 'Franchise' },
  { key: 'DISTRIBUTOR', label: 'Distribütörlük' },
] as const;

export const CONSULTANT_CATEGORIES = [
  { key: 'LAWYER', label: 'Avukat' },
  { key: 'ACCOUNTANT', label: 'Mali Müşavir' },
  { key: 'SECTOR_EXPERT', label: 'Sektör Uzmanı' },
  { key: 'FINANCE_ADVISOR', label: 'Finans Danışmanı' },
  { key: 'MARKETING', label: 'Pazarlama Uzmanı' },
  { key: 'MANAGEMENT', label: 'Yönetim Danışmanı' },
] as const;

export const MEMBER_TYPES = [
  { key: 'ENTREPRENEUR', label: 'Girişimci' },
  { key: 'INVESTOR', label: 'Yatırımcı' },
  { key: 'ANGEL_INVESTOR', label: 'Melek Yatırımcı' },
  { key: 'BUSINESS_PARTNER', label: 'İş ortağı' },
  { key: 'CONSULTANT', label: 'Danışman' },
  { key: 'PARTNER_FIRM', label: 'Partner Firma' },
  { key: 'INSTITUTION', label: 'Kurum' },
] as const;

export function usdFromTry(tl: number, usdTry: number): number {
  return Math.round(tl / usdTry);
}
