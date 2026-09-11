// Kadın girişimci ayrıcalıkları — iş kuralları tek yerde.
// (1) Yeni iş kuran kadın girişimciye İLK 4 AY mali müşavirlik ücreti platformdan (ücretsiz).
// (2) 1 YIL danışmanlık hizmeti VEYA ortaklık denetim hizmetinde %50 indirim.
// Uygunluk üyelik (createdAt) tarihine göre hesaplanır.

export const ACCOUNTING_FREE_MONTHS = 4;
export const CONSULTANCY_FREE_MONTHS = 12;
export const AUDIT_DISCOUNT_PCT = 50;

export interface WomanBenefits {
  isWoman: boolean;
  program: boolean;
  accountingFree: boolean;
  accountingFreeUntil?: string;
  accountingDaysLeft: number;
  consultancyFree: boolean;
  consultancyFreeUntil?: string;
  consultancyDaysLeft: number;
  auditDiscountPct: number;
  auditDiscountUntil?: string;
}

const MS_DAY = 86400000;

function addMonths(d: Date, m: number): Date {
  const x = new Date(d);
  x.setMonth(x.getMonth() + m);
  return x;
}
function daysLeft(until: Date): number {
  return Math.max(0, Math.ceil((until.getTime() - Date.now()) / MS_DAY));
}

export function computeWomanBenefits(
  user?: { gender?: string | null; createdAt?: Date | string | null } | null,
): WomanBenefits {
  const isWoman = user?.gender === 'FEMALE';
  const empty: WomanBenefits = {
    isWoman,
    program: isWoman,
    accountingFree: false,
    accountingDaysLeft: 0,
    consultancyFree: false,
    consultancyDaysLeft: 0,
    auditDiscountPct: 0,
  };
  if (!isWoman || !user?.createdAt) return empty;

  const created = new Date(user.createdAt);
  const acctUntil = addMonths(created, ACCOUNTING_FREE_MONTHS);
  const consUntil = addMonths(created, CONSULTANCY_FREE_MONTHS);
  const now = Date.now();

  return {
    isWoman: true,
    program: true,
    accountingFree: now < acctUntil.getTime(),
    accountingFreeUntil: acctUntil.toISOString(),
    accountingDaysLeft: daysLeft(acctUntil),
    consultancyFree: now < consUntil.getTime(),
    consultancyFreeUntil: consUntil.toISOString(),
    consultancyDaysLeft: daysLeft(consUntil),
    auditDiscountPct: now < consUntil.getTime() ? AUDIT_DISCOUNT_PCT : 0,
    auditDiscountUntil: consUntil.toISOString(),
  };
}
