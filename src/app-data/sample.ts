// İlkin dizayn üçün nümunə data — DB qoşulana qədər (Faza 1) UI-ı canlandırır.
// Real axında bu figures parser çıxışlarından, sətirlər isə LedgerLine-dan gələcək.
// Bax: CLAUDE.md §2 (dövr-mərkəzli) və §6 (növbəti addımlar).

import type { BridgeContext } from "@/domain/reconciliation/types";
import type { IconName } from "../../app/_components/Icon";

export type SourceStatus = "ok" | "review";
export type ClassifyKind = "deduct" | "nondeduct" | "limit" | "adjust";

export interface SourceRow {
  ic: IconName;
  name: string;
  note: string;
  status: SourceStatus;
  det: string;
}

export interface ClassifyRow {
  name: string;
  amount: number;
  kind: ClassifyKind;
  norm?: string;
}

export interface DeclareCell {
  code: string;
  label: string;
  value: number;
  src: string;
  strong?: boolean;
}

export interface SamplePeriod {
  id: string;
  company: string;
  voen: string;
  taxYear: number;
  periodLabel: string;
  status: string; // dörd göz axını statusu
  ctx: BridgeContext;
  sources: SourceRow[];
  classify: ClassifyRow[];
  // Bəyannamə xanaları sərt kodlanmır — buildProfitDeclaration() bundan hesablayır (tək mənbə).
  // taxAdjustments işarəlidir: müsbət = mənfəətə əlavə (add-back), mənfi = azaltma.
  declInput: { revenue: number; deductible: number; taxAdjustments: number; lossUsed: number };
  declareNotice: string;
}

export const PERIODS: SamplePeriod[] = [
  {
    id: "alfa-2025",
    company: "Alfa Ticarət MMC",
    voen: "1400123456",
    taxYear: 2025,
    periodLabel: "İllik · 2025",
    status: "BAXIŞ",
    ctx: {
      taxYear: 2025,
      figures: {
        "vat.turnover": 1245000,
        "vat.advances": 38000,
        "fa.saleBaseDiff": 4000,
        "profit.nonVatIncome": 0,
        "profit.revenue": 1198000, // → izahsız qalıq 5000 (bayraq)

        "payroll.bookFund": 186500,
        "payroll.exempt": 4000,
        "payroll.contractDiff": 1300,
        "dsmf.base": 181200, // → uzlaşdı

        "loss.carriedIn": 62000,
        "loss.used": 55000,
        "loss.remaining": 0, // → 7000 qalıq (bayraq)

        "eqaime.sales": 1250200,
        "eqaime.cancelled": 5000, // → uzlaşdı
      },
    },
    sources: [
      { ic: "sheet", name: "1C ixracı (Excel)", note: "Baş kitab · hesablar planı", status: "review", det: "Sxem tanındı, 3 hesab əl ilə uyğunlaşdırılmalıdır" },
      { ic: "bank", name: "Bank çıxarışı", note: "Kapital Bank · AZN hesabı", status: "ok", det: "412 əməliyyat oxundu" },
      { ic: "receipt", name: "e-Qaimələr", note: "Satış qaimələri · illik", status: "ok", det: "1 250 200 ₼ · 318 qaimə" },
      { ic: "file", name: "ƏDV bəyannaməsi", note: "Rüblük · cəmlənmiş", status: "ok", det: "Dövriyyə: 1 245 000 ₼" },
      { ic: "users", name: "Əməkhaqqı / DSMF", note: "İllik fond + baza", status: "ok", det: "Fond: 186 500 ₼" },
      { ic: "building", name: "Əsas vəsaitlər", note: "Amortizasiya cədvəli", status: "review", det: "2 obyektdə istismar tarixi çatışmır" },
      { ic: "file", name: "2024 mənfəət bəy.", note: "Əvvəlki il · zərər qalığı", status: "ok", det: "Köçürülən zərər: 62 000 ₼" },
    ],
    classify: [
      { name: "Əməkhaqqı", amount: 186500, kind: "deduct" },
      { name: "İcarə", amount: 48000, kind: "deduct" },
      { name: "Kommunal", amount: 12400, kind: "deduct" },
      { name: "Reklam", amount: 21000, kind: "deduct" },
      { name: "Təmsilçilik", amount: 9800, kind: "limit", norm: "Gəlirin 1%-i həddi (NK norması) yoxlanmalıdır" },
      { name: "Ezamiyyə", amount: 6300, kind: "limit", norm: "Gündəlik norma həddi (NK qərarı) yoxlanmalıdır" },
      { name: "Cərimə/faiz (büdcə)", amount: 3100, kind: "nondeduct" },
      { name: "Amortizasiya", amount: 27400, kind: "adjust", norm: "Mühasibat ≠ vergi amortizasiyası — düzəliş" },
    ],
    declInput: { revenue: 1198000, deductible: 862400, taxAdjustments: 4300, lossUsed: 55000 },
    declareNotice:
      "2 açıq bayraq mövcuddur (mənfəət gəliri +5 000, zərər qalığı 7 000). Bəyannamə təqdim edilməzdən əvvəl bunlar həll olunmalıdır.",
  },
];

export function getPeriod(id: string): SamplePeriod | undefined {
  return PERIODS.find((p) => p.id === id);
}
