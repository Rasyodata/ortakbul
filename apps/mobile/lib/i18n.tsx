import { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

export const LANGS = [
  { code: 'tr', flag: '🇹🇷', name: 'Türkçe' },
  { code: 'en', flag: '🇬🇧', name: 'English' },
  { code: 'ru', flag: '🇷🇺', name: 'Русский' },
  { code: 'ar', flag: '🇸🇦', name: 'العربية' },
  { code: 'fa', flag: '🇮🇷', name: 'فارسی' },
  { code: 'fr', flag: '🇫🇷', name: 'Français' },
  { code: 'de', flag: '🇩🇪', name: 'Deutsch' },
  { code: 'es', flag: '🇪🇸', name: 'Español' },
  { code: 'pt', flag: '🇵🇹', name: 'Português' },
] as const;

const L = ['tr', 'en', 'ru', 'ar', 'fa', 'fr', 'de', 'es', 'pt'] as const;
// [tr,en,ru,ar,fa,fr,de,es,pt]
const T: Record<string, string[]> = {
  hero_eb: ['Ortak arayanla ortak olmak isteyeni buluşturur', 'Connecting partner-seekers with partners', 'Соединяет ищущих партнёров', 'يربط الباحثين عن شركاء', 'جویندگان شریک را پیوند می‌دهد', 'Relie les chercheurs de partenaires', 'Verbindet Partnersuchende', 'Conecta a quienes buscan socios', 'Liga quem procura sócios'],
  hero_title: ['Ortağını bul, fikrini büyüt.', 'Find your partner, grow your idea.', 'Найдите партнёра, развивайте идею.', 'اعثر على شريكك وطوّر فكرتك.', 'شریک خود را بیاب، ایده‌ات را رشد بده.', 'Trouvez votre partenaire, développez votre idée.', 'Finde deinen Partner, lass deine Idee wachsen.', 'Encuentra a tu socio, haz crecer tu idea.', 'Encontre o seu sócio, faça a ideia crescer.'],
  hero_sub: ['Sermaye, teminat, kredi ya da çek/bono ile ortaklık kur. Doğru yatırımcıyı, iş ortağını ve danışmanı tek platformda bul.', 'Partner up with capital, collateral, a credit line or a cheque/bond. Find the right investor, partner and consultant.', 'Партнёрство через капитал, залог, кредит или чек. Найдите инвестора, партнёра и консультанта.', 'اعقد شراكة برأس المال أو الضمان أو الائتمان أو الشيك. اعثر على المستثمر والشريك والمستشار.', 'با سرمایه، وثیقه، خط اعتباری یا چک شراکت کن. سرمایه‌گذار، شریک و مشاور مناسب را بیاب.', 'Associez-vous par capital, garantie, crédit ou chèque. Trouvez investisseur, partenaire et consultant.', 'Partnerschaft mit Kapital, Sicherheit, Kreditlinie oder Scheck. Finde Investor, Partner und Berater.', 'Asóciate con capital, garantía, crédito o cheque. Encuentra inversor, socio y consultor.', 'Faça parceria com capital, garantia, crédito ou cheque. Encontre investidor, sócio e consultor.'],
  explore: ['Fikirleri Keşfet →', 'Explore Ideas →', 'Смотреть идеи →', 'استكشف الأفكار ←', 'کاوش ایده‌ها →', 'Explorer les idées →', 'Ideen entdecken →', 'Explorar ideas →', 'Explorar ideias →'],
  my_profile: ['Profilim', 'My profile', 'Мой профиль', 'ملفي', 'پروفایل من', 'Mon profil', 'Mein Profil', 'Mi perfil', 'O meu perfil'],
  login: ['Giriş Yap', 'Log in', 'Войти', 'دخول', 'ورود', 'Connexion', 'Anmelden', 'Entrar', 'Entrar'],
  logout: ['Çıkış Yap', 'Log out', 'Выйти', 'خروج', 'خروج', 'Déconnexion', 'Abmelden', 'Salir', 'Sair'],
  register: ['Hesap Oluştur', 'Create account', 'Создать аккаунт', 'إنشاء حساب', 'ایجاد حساب', 'Créer un compte', 'Konto erstellen', 'Crear cuenta', 'Criar conta'],
  models: ['Ortaklık modelleri', 'Partnership models', 'Модели партнёрства', 'نماذج الشراكة', 'مدل‌های مشارکت', 'Modèles de partenariat', 'Partnerschaftsmodelle', 'Modelos de sociedad', 'Modelos de parceria'],
  target_users: ['Hedef kullanıcı', 'Target users', 'Целевые пользователи', 'المستخدمون المستهدفون', 'کاربران هدف', 'Utilisateurs cibles', 'Zielnutzer', 'Usuarios objetivo', 'Utilizadores-alvo'],
  active_listings: ['Aktif ilan', 'Active listings', 'Активные объявления', 'إعلانات نشطة', 'آگهی فعال', 'Annonces actives', 'Aktive Anzeigen', 'Anuncios activos', 'Anúncios ativos'],
  consultants: ['Onaylı danışman', 'Verified consultants', 'Проверенные консультанты', 'مستشارون معتمدون', 'مشاوران تأییدشده', 'Consultants vérifiés', 'Geprüfte Berater', 'Consultores verificados', 'Consultores verificados'],
  listings_title: ['Ortak arayan fikirler', 'Ideas seeking partners', 'Идеи в поиске партнёров', 'أفكار تبحث عن شركاء', 'ایده‌های جویای شریک', 'Idées cherchant des partenaires', 'Ideen suchen Partner', 'Ideas que buscan socios', 'Ideias à procura de sócios'],
  loading: ['Yükleniyor…', 'Loading…', 'Загрузка…', 'جارٍ التحميل…', 'در حال بارگذاری…', 'Chargement…', 'Lädt…', 'Cargando…', 'A carregar…'],
  search_ph: ['İlan, sektör veya şehir ara…', 'Search listings, sector or city…', 'Поиск объявлений…', 'ابحث عن إعلان…', 'جست‌وجوی آگهی…', 'Rechercher…', 'Suchen…', 'Buscar…', 'Pesquisar…'],
  email: ['E-posta', 'Email', 'E-mail', 'البريد', 'ایمیل', 'E-mail', 'E-Mail', 'Correo', 'E-mail'],
  password: ['Şifre', 'Password', 'Пароль', 'كلمة المرور', 'رمز عبور', 'Mot de passe', 'Passwort', 'Contraseña', 'Palavra-passe'],
  fullname: ['Ad soyad', 'Full name', 'Имя и фамилия', 'الاسم الكامل', 'نام کامل', 'Nom complet', 'Voller Name', 'Nombre completo', 'Nome completo'],
  contact_hidden: ['🔒 İletişim bilgileri gizlidir — platform üzerinden görüşülür.', '🔒 Contact details are hidden — talk via the platform.', '🔒 Контакты скрыты — общение через платформу.', '🔒 معلومات الاتصال مخفية — عبر المنصة.', '🔒 اطلاعات تماس پنهان است — از طریق پلتفرم.', '🔒 Coordonnées masquées — via la plateforme.', '🔒 Kontaktdaten verborgen — über die Plattform.', '🔒 Contactos ocultos — vía la plataforma.', '🔒 Contactos ocultos — pela plataforma.'],
  contact_go: ['İletişime Geç', 'Get in touch', 'Связаться', 'تواصل', 'تماس بگیر', 'Contacter', 'Kontakt', 'Contactar', 'Contactar'],
  no_account: ['Hesabın yok mu? Kayıt ol', 'No account? Sign up', 'Нет аккаунта? Регистрация', 'ليس لديك حساب؟ سجّل', 'حساب ندارید؟ ثبت‌نام', 'Pas de compte ? Inscription', 'Kein Konto? Registrieren', '¿Sin cuenta? Regístrate', 'Sem conta? Registe-se'],
  have_account: ['Zaten hesabın var mı? Giriş yap', 'Already have an account? Log in', 'Уже есть аккаунт? Войти', 'لديك حساب؟ دخول', 'حساب دارید؟ ورود', 'Déjà un compte ? Connexion', 'Schon ein Konto? Anmelden', '¿Ya tienes cuenta? Entrar', 'Já tem conta? Entrar'],
  pending: ['⏳ Üyeliğin yönetici onayı bekliyor.', '⏳ Your account is pending admin approval.', '⏳ Аккаунт ожидает одобрения.', '⏳ حسابك بانتظار الموافقة.', '⏳ حساب در انتظار تأیید.', '⏳ Compte en attente de validation.', '⏳ Konto wartet auf Freigabe.', '⏳ Cuenta pendiente de aprobación.', '⏳ Conta pendente de aprovação.'],
  active: ['✓ Hesabın onaylı ve aktif.', '✓ Your account is approved and active.', '✓ Аккаунт активен.', '✓ حسابك نشط.', '✓ حساب فعال است.', '✓ Compte actif.', '✓ Konto aktiv.', '✓ Cuenta activa.', '✓ Conta ativa.'],
  language: ['Dil', 'Language', 'Язык', 'اللغة', 'زبان', 'Langue', 'Sprache', 'Idioma', 'Idioma'],
  d_desc: ['Açıklama', 'Description', 'Описание', 'الوصف', 'توضیحات', 'Description', 'Beschreibung', 'Descripción', 'Descrição'],
  d_problem: ['Çözdüğü problem', 'Problem solved', 'Проблема', 'المشكلة', 'مشکل', 'Problème', 'Problem', 'Problema', 'Problema'],
  d_audience: ['Hedef kitle', 'Target audience', 'Аудитория', 'الجمهور', 'مخاطب', 'Public', 'Zielgruppe', 'Público', 'Público'],
  d_amount: ['Talep / tutar', 'Request / amount', 'Запрос / сумма', 'الطلب/المبلغ', 'مبلغ', 'Montant', 'Betrag', 'Importe', 'Valor'],
  gate_detail: ['ilanının detayı ve iletişim için giriş yap.', 'log in to see details and contact.', 'войдите, чтобы увидеть детали.', 'سجّل الدخول لرؤية التفاصيل.', 'برای جزئیات وارد شو.', 'connectez-vous pour les détails.', 'zum Anzeigen anmelden.', 'inicia sesión para ver detalles.', 'entre para ver detalhes.'],
  country_iso: ['Ülke (ISO2)', 'Country (ISO2)', 'Страна (ISO2)', 'الدولة (ISO2)', 'کشور (ISO2)', 'Pays (ISO2)', 'Land (ISO2)', 'País (ISO2)', 'País (ISO2)'],
};

// Kategori/sektör + paket adı çevirisi (TR değer → dile göre)
const TAXO: Record<string, string[]> = {
  'Teknoloji': ['Teknoloji', 'Technology', 'Технологии', 'التقنية', 'فناوری', 'Technologie', 'Technologie', 'Tecnología', 'Tecnologia'],
  'Yazılım': ['Yazılım', 'Software', 'ПО', 'برمجيات', 'نرم‌افزار', 'Logiciel', 'Software', 'Software', 'Software'],
  'E-ticaret': ['E-ticaret', 'E-commerce', 'Э-торговля', 'التجارة الإلكترونية', 'تجارت الکترونیک', 'E-commerce', 'E-Commerce', 'E-commerce', 'E-commerce'],
  'Eğitim': ['Eğitim', 'Education', 'Образование', 'التعليم', 'آموزش', 'Éducation', 'Bildung', 'Educación', 'Educação'],
  'Sağlık': ['Sağlık', 'Health', 'Здоровье', 'الصحة', 'سلامت', 'Santé', 'Gesundheit', 'Salud', 'Saúde'],
  'Tarım': ['Tarım', 'Agriculture', 'Сельхоз', 'الزراعة', 'کشاورزی', 'Agriculture', 'Landwirtschaft', 'Agricultura', 'Agricultura'],
  'Finans': ['Finans', 'Finance', 'Финансы', 'التمويل', 'مالی', 'Finance', 'Finanzen', 'Finanzas', 'Finanças'],
  'Lojistik': ['Lojistik', 'Logistics', 'Логистика', 'اللوجستيات', 'لجستیک', 'Logistique', 'Logistik', 'Logística', 'Logística'],
  'Üretim': ['Üretim', 'Manufacturing', 'Производство', 'التصنيع', 'تولید', 'Fabrication', 'Fertigung', 'Fabricación', 'Produção'],
  'Turizm': ['Turizm', 'Tourism', 'Туризм', 'السياحة', 'گردشگری', 'Tourisme', 'Tourismus', 'Turismo', 'Turismo'],
  'Gıda': ['Gıda', 'Food', 'Продукты', 'الأغذية', 'غذا', 'Alimentation', 'Lebensmittel', 'Alimentación', 'Alimentação'],
};
const TIERM: Record<string, string[]> = {
  NORMAL: ['STANDART', 'STANDARD', 'СТАНДАРТ', 'قياسي', 'استاندارد', 'STANDARD', 'STANDARD', 'ESTÁNDAR', 'PADRÃO'],
  FEATURED: ['ÖNE ÇIKAN', 'FEATURED', 'РЕКОМЕНД.', 'مميّز', 'برجسته', 'EN VEDETTE', 'HERVORGEH.', 'DESTACADO', 'DESTAQUE'],
  PRIVILEGED: ['AYRICALIKLI', 'PRIVILEGED', 'ПРИВИЛЕГ.', 'مميّز', 'ویژه', 'PRIVILÉGIÉ', 'PRIVILEGIERT', 'PRIVILEGIADO', 'PRIVILEGIADO'],
  SHOWCASE: ['VİTRİN', 'SHOWCASE', 'ВИТРИНА', 'واجهة', 'ویترین', 'VITRINE', 'SCHAUFENSTER', 'ESCAPARATE', 'VITRINE'],
};

type Ctx = { lang: string; setLang: (c: string) => void; t: (k: string) => string; isRTL: boolean; taxo: (v?: string) => string; tier: (v: string) => string };
const I18nCtx = createContext<Ctx>({ lang: 'tr', setLang: () => {}, t: (k) => k, isRTL: false, taxo: (v) => v || '', tier: (v) => v });
const LKEY = 'ortakbul_lang';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState('tr');
  useEffect(() => { SecureStore.getItemAsync(LKEY).then((v) => v && setLangState(v)); }, []);
  const setLang = (c: string) => { setLangState(c); SecureStore.setItemAsync(LKEY, c); };
  const idx = L.indexOf(lang as any);
  const i = idx >= 0 ? idx : 0;
  const t = (k: string) => { const row = T[k]; if (!row) return k; return row[i] || row[1] || row[0]; };
  const taxo = (v?: string) => { if (!v) return ''; const row = TAXO[v]; return row ? (row[i] || row[0]) : v; };
  const tier = (v: string) => { const row = TIERM[v]; return row ? (row[i] || row[0]) : v; };
  const isRTL = lang === 'ar' || lang === 'fa';
  return <I18nCtx.Provider value={{ lang, setLang, t, isRTL, taxo, tier }}>{children}</I18nCtx.Provider>;
}
export const useI18n = () => useContext(I18nCtx);
