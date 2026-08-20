// Seed — nümunə tenant, istifadəçilər (admin/mühasib/reviewer), şirkət və 2025 dövrü.
// Dev üçün: hər istifadəçinin parolu SEED_PASSWORD (aşağıda çap olunur).
// İşə salmaq: npm run db:seed  (və ya prisma migrate dev avtomatik çağırır)

import { PrismaClient, Role, SourceKind, ParseStatus, Deductibility } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();
const SEED_PASSWORD = "Taxclara2025!"; // yalnız dev seed — production-da dəyişdirilməlidir

async function main() {
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);

  // ── Tenant (mühasib firması) ──
  let tenant = await db.tenant.findFirst({ where: { name: "SM Consulting" } });
  if (!tenant) tenant = await db.tenant.create({ data: { name: "SM Consulting" } });

  // ── İstifadəçilər (rollar) ──
  const admin = await db.user.upsert({
    where: { email: "admin@taxclara.az" },
    update: { passwordHash },
    create: { tenantId: tenant.id, email: "admin@taxclara.az", name: "Sistem Admin", role: Role.ADMIN, passwordHash },
  });
  const accountant = await db.user.upsert({
    where: { email: "muhasib@taxclara.az" },
    update: { passwordHash },
    create: { tenantId: tenant.id, email: "muhasib@taxclara.az", name: "Aygün Məmmədova", role: Role.ACCOUNTANT, passwordHash },
  });
  const reviewer = await db.user.upsert({
    where: { email: "reviewer@taxclara.az" },
    update: { passwordHash },
    create: { tenantId: tenant.id, email: "reviewer@taxclara.az", name: "Elçin Əliyev", role: Role.REVIEWER, passwordHash },
  });

  // ── Müştəri şirkət ──
  const company = await db.company.upsert({
    where: { tenantId_voen: { tenantId: tenant.id, voen: "1400123456" } },
    update: {},
    create: { tenantId: tenant.id, name: "Alfa Ticarət MMC", voen: "1400123456" },
  });

  // Mühasib bu şirkətə təyin (izolyasiya)
  for (const u of [accountant, reviewer]) {
    await db.companyAssignment.upsert({
      where: { userId_companyId: { userId: u.id, companyId: company.id } },
      update: {},
      create: { userId: u.id, companyId: company.id },
    });
  }

  // ── Vergi dövrü ──
  const period = await db.taxPeriod.upsert({
    where: { companyId_taxYear_label: { companyId: company.id, taxYear: 2025, label: "2025 illik" } },
    update: {},
    create: { companyId: company.id, taxYear: 2025, label: "2025 illik" },
  });

  // ── Nümunə mənbə fayl + ledger sətirləri + təsnifat ──
  const existingSources = await db.sourceFile.count({ where: { periodId: period.id } });
  if (existingSources === 0) {
    const ledger = await db.sourceFile.create({
      data: {
        periodId: period.id,
        kind: SourceKind.ONEC_EXCEL,
        fileName: "BashKitab_2025.xlsx",
        status: ParseStatus.REVIEW,
        confidence: 0.82,
        meta: { note: "Sxem tanındı, 3 hesab əl ilə uyğunlaşdırılmalı" },
      },
    });

    const lines: { desc: string; amount: number; category: string; sug: Deductibility; norm?: boolean }[] = [
      { desc: "Əməkhaqqı", amount: 186500, category: "Əməkhaqqı", sug: Deductibility.DEDUCT },
      { desc: "İcarə", amount: 48000, category: "İcarə", sug: Deductibility.DEDUCT },
      { desc: "Kommunal", amount: 12400, category: "Kommunal", sug: Deductibility.DEDUCT },
      { desc: "Reklam", amount: 21000, category: "Reklam", sug: Deductibility.DEDUCT },
      { desc: "Təmsilçilik xərci", amount: 9800, category: "Təmsilçilik", sug: Deductibility.LIMIT, norm: true },
      { desc: "Ezamiyyə xərci", amount: 6300, category: "Ezamiyyə", sug: Deductibility.LIMIT, norm: true },
      { desc: "Büdcəyə cərimə/faiz", amount: 3100, category: "Cərimə/faiz (büdcə)", sug: Deductibility.NONDEDUCT },
      { desc: "Amortizasiya", amount: 27400, category: "Amortizasiya", sug: Deductibility.ADJUST, norm: true },
    ];

    for (const l of lines) {
      const line = await db.ledgerLine.create({
        data: {
          periodId: period.id,
          sourceId: ledger.id,
          description: l.desc,
          amount: l.amount,
          direction: "expense",
        },
      });
      await db.classification.create({
        data: {
          periodId: period.id,
          ledgerLineId: line.id,
          category: l.category,
          suggested: l.sug,
          normFlag: !!l.norm,
        },
      });
    }
  }

  console.log("✓ Seed tamamlandı.");
  console.log(`  Tenant: ${tenant.name}`);
  console.log(`  İstifadəçilər: ${admin.email} (ADMIN), ${accountant.email} (ACCOUNTANT), ${reviewer.email} (REVIEWER)`);
  console.log(`  Dev parol (hamısı): ${SEED_PASSWORD}`);
  console.log(`  Şirkət: ${company.name} · dövr: ${period.label}`);
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
