// Form doğrulama — her fonksiyon geçerliyse null, değilse bir ÇEVİRİ ANAHTARI döndürür.
// Böylece hata mesajları dil destekli gösterilir (t(key)).

export function vRequired(v: string | undefined | null): string | null {
  return v && String(v).trim() ? null : 'v_required';
}

export function vName(v: string): string | null {
  const s = (v || '').trim();
  if (!s) return 'v_required';
  if (s.length < 3) return 'v_name_short';
  if (s.length > 60) return 'v_name_long';
  // en az iki kelime (ad + soyad), harf içermeli
  if (!/[\p{L}]{2,}/u.test(s)) return 'v_name_invalid';
  if (s.split(/\s+/).filter(Boolean).length < 2) return 'v_name_full';
  return null;
}

export function vEmail(v: string): string | null {
  const s = (v || '').trim();
  if (!s) return 'v_required';
  // RFC'ye yakın pratik kontrol
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s)) return 'v_email_invalid';
  // yaygın yazım hataları
  if (/@(gmial|gmai|gmal|hotmial|hotmai|yahooo|outlok)\./i.test(s)) return 'v_email_typo';
  return null;
}

// Ülkeye göre telefon: en az 7, en çok 15 rakam (E.164); + ve ayraçlara izin.
export function vPhone(v: string, required = false): string | null {
  const s = (v || '').trim();
  if (!s) return required ? 'v_required' : null;
  if (!/^\+?[\d\s()\-]{7,20}$/.test(s)) return 'v_phone_invalid';
  const digits = s.replace(/\D/g, '');
  if (digits.length < 7) return 'v_phone_short';
  if (digits.length > 15) return 'v_phone_long';
  return null;
}

export function vPassword(v: string): string | null {
  const s = v || '';
  if (!s) return 'v_required';
  if (s.length < 8) return 'v_pw_short';
  if (!/[A-Za-z]/.test(s) || !/\d/.test(s)) return 'v_pw_weak';
  return null;
}

export function vChecked(v: boolean): string | null {
  return v ? null : 'v_must_accept';
}

export function vNumberRange(v: string, min?: number, max?: number): string | null {
  if (!v) return null;
  const n = Number(String(v).replace(/[^\d.]/g, ''));
  if (Number.isNaN(n)) return 'v_number';
  if (min != null && n < min) return 'v_number';
  if (max != null && n > max) return 'v_number';
  return null;
}

// Telefon girişi maskesi: sadece + ve rakam, en çok 16 karakter.
export function maskPhone(v: string): string {
  const cleaned = v.replace(/[^\d+]/g, '');
  const plus = cleaned.startsWith('+') ? '+' : '';
  const digits = cleaned.replace(/\+/g, '').slice(0, 15);
  return plus + digits;
}
