// Yönetici panosu izin kodları (RBAC).
// Admin panelindeki "rol izin matrisi" bu kodlar üzerinden çalışır.
export const PERMISSIONS = {
  // içerik / ilan
  LISTING_READ: 'listing.read',
  LISTING_WRITE: 'listing.write',
  LISTING_APPROVE: 'listing.approve',
  LISTING_DELETE: 'listing.delete',
  // kullanıcı & danışman
  USER_READ: 'user.read',
  USER_WRITE: 'user.write',
  USER_APPROVE: 'user.approve',
  CONSULTANT_APPROVE: 'consultant.approve',
  ASSIGNMENT_MANAGE: 'assignment.manage',
  // ödeme
  PAYMENT_READ: 'payment.read',
  PAYMENT_MANAGE: 'payment.manage',
  // sistem
  ROLE_MANAGE: 'role.manage',
  I18N_MANAGE: 'i18n.manage',
  AUDIT_READ: 'audit.read',
  AGENT_RUN: 'agent.run',
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// Genel izin grupları (rol izin matrisindeki 4 ana yetki ile uyum)
export const PERMISSION_GROUPS = {
  read: [PERMISSIONS.LISTING_READ, PERMISSIONS.USER_READ, PERMISSIONS.PAYMENT_READ, PERMISSIONS.AUDIT_READ],
  write: [PERMISSIONS.LISTING_WRITE, PERMISSIONS.USER_WRITE, PERMISSIONS.LISTING_DELETE],
  approve: [PERMISSIONS.LISTING_APPROVE, PERMISSIONS.USER_APPROVE, PERMISSIONS.CONSULTANT_APPROVE, PERMISSIONS.ASSIGNMENT_MANAGE],
  payment: [PERMISSIONS.PAYMENT_MANAGE],
};

// Tüm izinlerin etiketli listesi (seed için)
export const ALL_PERMISSIONS: { code: PermissionCode; label: string }[] = [
  { code: PERMISSIONS.LISTING_READ, label: 'İlanları görme' },
  { code: PERMISSIONS.LISTING_WRITE, label: 'İlan yazma/düzenleme' },
  { code: PERMISSIONS.LISTING_APPROVE, label: 'İlan onaylama' },
  { code: PERMISSIONS.LISTING_DELETE, label: 'İlan silme' },
  { code: PERMISSIONS.USER_READ, label: 'Kullanıcıları görme' },
  { code: PERMISSIONS.USER_WRITE, label: 'Kullanıcı oluşturma/düzenleme' },
  { code: PERMISSIONS.USER_APPROVE, label: 'Üyelik onaylama' },
  { code: PERMISSIONS.CONSULTANT_APPROVE, label: 'Danışman onaylama' },
  { code: PERMISSIONS.ASSIGNMENT_MANAGE, label: 'Danışman/denetçi atama' },
  { code: PERMISSIONS.PAYMENT_READ, label: 'Ödemeleri görme' },
  { code: PERMISSIONS.PAYMENT_MANAGE, label: 'Ödeme yönetimi' },
  { code: PERMISSIONS.ROLE_MANAGE, label: 'Rol yönetimi' },
  { code: PERMISSIONS.I18N_MANAGE, label: 'Dil/çeviri yönetimi' },
  { code: PERMISSIONS.AUDIT_READ, label: 'Denetim loglarını görme' },
  { code: PERMISSIONS.AGENT_RUN, label: 'AI ajan çalıştırma' },
];
