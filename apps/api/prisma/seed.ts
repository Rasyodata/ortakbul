import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import { ALL_PERMISSIONS, PERMISSIONS, PERMISSION_GROUPS } from '../src/common/enums/permission.enum';

const prisma = new PrismaClient();

// Rol → izin eşlemesi (demo'daki izin matrisiyle aynı mantık)
const ROLE_DEFS: { name: string; label: string; perms: string[] }[] = [
  { name: 'SUPER_ADMIN', label: 'Süper Admin', perms: ALL_PERMISSIONS.map((p) => p.code) },
  { name: 'CONTENT_EDITOR', label: 'İçerik Editörü', perms: [...PERMISSION_GROUPS.read, ...PERMISSION_GROUPS.write] },
  { name: 'APPROVAL_MANAGER', label: 'Onay Yöneticisi', perms: [...PERMISSION_GROUPS.read, ...PERMISSION_GROUPS.approve] },
  { name: 'PAYMENT_MANAGER', label: 'Ödeme Yöneticisi', perms: [...PERMISSION_GROUPS.read, ...PERMISSION_GROUPS.payment] },
  { name: 'CONSULTANT_COORD', label: 'Danışman Koordinatörü', perms: [...PERMISSION_GROUPS.read, ...PERMISSION_GROUPS.write, ...PERMISSION_GROUPS.approve] },
  { name: 'SUPPORT', label: 'Destek', perms: [...PERMISSION_GROUPS.read] },
];

async function main() {
  // 1) İzinler
  for (const p of ALL_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code: p.code },
      update: { label: p.label },
      create: { code: p.code, label: p.label },
    });
  }
  const allPerms = await prisma.permission.findMany();
  const permByCode = new Map(allPerms.map((p) => [p.code, p.id]));

  // 2) Roller + izin bağları
  for (const r of ROLE_DEFS) {
    const role = await prisma.role.upsert({
      where: { name: r.name },
      update: { label: r.label, isSystem: true },
      create: { name: r.name, label: r.label, isSystem: true },
    });
    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    await prisma.rolePermission.createMany({
      data: Array.from(new Set(r.perms))
        .filter((code) => permByCode.has(code))
        .map((code) => ({ roleId: role.id, permissionId: permByCode.get(code)! })),
      skipDuplicates: true,
    });
  }

  // 3) Süper admin kullanıcı
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@ortakbul.org';
  const adminPass = process.env.SEED_ADMIN_PASSWORD || 'Admin!2026';
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: await argon2.hash(adminPass),
      fullName: 'Sistem Yöneticisi',
      memberType: 'INSTITUTION',
      countryCode: 'TR',
      status: 'APPROVED',
      emailVerified: true,
    },
  });
  const superRole = await prisma.role.findUnique({ where: { name: 'SUPER_ADMIN' } });
  if (superRole) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: admin.id, roleId: superRole.id } },
      update: {},
      create: { userId: admin.id, roleId: superRole.id },
    });
  }

  // 4) Örnek girişimci + fikir ilanı (onaylı)
  const elif = await prisma.user.upsert({
    where: { email: 'elif@ornek.com' },
    update: {},
    create: {
      email: 'elif@ornek.com',
      passwordHash: await argon2.hash('Ornek!2026'),
      fullName: 'Elif K.',
      memberType: 'ENTREPRENEUR',
      countryCode: 'TR',
      city: 'Konya',
      status: 'APPROVED',
      emailVerified: true,
    },
  });
  const ideaCount = await prisma.listing.count({ where: { title: 'AgroVeri' } });
  if (ideaCount === 0) {
    await prisma.listing.create({
      data: {
        type: 'IDEA',
        status: 'APPROVED',
        tier: 'SHOWCASE',
        ownerId: elif.id,
        approvedById: admin.id,
        approvedAt: new Date(),
        title: 'AgroVeri',
        short: 'Küçük çiftçiler için toprak verimliliğini tahmin eden sensör ağı.',
        detail: 'Düşük maliyetli IoT sensörleriyle toprak verisi toplayıp anlık öneri sunar.',
        category: 'Tarım',
        stage: 'MVP',
        structure: 'CAPITAL',
        amountText: '1.500.000 ₺ sermaye',
        amountTL: 1500000,
        countryCode: 'TR',
        city: 'Konya',
        problem: 'Küçük çiftçiler pahalı analiz hizmetine erişemiyor.',
        audience: '5-50 dekar aile çiftçileri.',
      },
    });
  }

  // 5) Örnek danışman
  const av = await prisma.user.upsert({
    where: { email: 'selin@ornek.com' },
    update: {},
    create: {
      email: 'selin@ornek.com',
      passwordHash: await argon2.hash('Ornek!2026'),
      fullName: 'Av. Selin Aksoy',
      memberType: 'CONSULTANT',
      countryCode: 'TR',
      city: 'İstanbul',
      status: 'APPROVED',
      emailVerified: true,
      consultantProfile: {
        create: {
          category: 'LAWYER',
          sector: 'Teknoloji',
          experienceYears: 11,
          bio: 'Şirketler hukuku, ortaklık sözleşmeleri, fikri mülkiyet.',
          feeText: '₺1.500 / görüşme',
          tags: ['Ortaklık Sözleşmesi', 'KVKK', 'Fikri Mülkiyet'],
          ratingAvg: 4.9,
          reviewsCount: 64,
          verified: true,
          status: 'APPROVED',
        },
      },
    },
  });

  // 6) Partner firma, döviz kuru, AI ajan raporu
  const pfCount = await prisma.partnerFirm.count();
  if (pfCount === 0) {
    await prisma.partnerFirm.create({
      data: {
        name: 'Anadolu Melek Ağı',
        type: 'Yatırım Ağı',
        region: 'İç Anadolu',
        sectors: ['Tarım', 'Gıda', 'Üretim'],
        since: 2017,
        note: 'Erken aşama tarım/gıda girişimlerine 250K-2M ₺ yatırım.',
      },
    });
  }
  await prisma.fxRate.upsert({
    where: { base_quote: { base: 'USD', quote: 'TRY' } },
    update: { rate: Number(process.env.FX_USD_TRY || 41) },
    create: { base: 'USD', quote: 'TRY', rate: Number(process.env.FX_USD_TRY || 41) },
  });
  const arCount = await prisma.agentReport.count();
  if (arCount === 0) {
    await prisma.agentReport.create({
      data: {
        tag: 'Sektör Trendi',
        title: 'Tarım teknolojilerinde IoT yatırımları %38 arttı',
        body: 'Son çeyrekte agritech erken aşama yatırımları %38 büyüdü.',
        source: 'Ajan taraması',
      },
    });
  }

  // eslint-disable-next-line no-console
  console.log(`Seed tamam. Admin: ${adminEmail} / ${adminPass}`);
  console.log(`İzin: ${allPerms.length}, Rol: ${ROLE_DEFS.length}`);
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
