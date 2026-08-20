// Domain əsas tipləri — bütün alt-modullar (reconciliation, classification,
// declaration, tax-rules) bunları `../types`-dən import edir.
// Bax: CLAUDE.md §2 (dövr-mərkəzli) və §3 (hüquqi məlumat qaydası).

// Pul məbləği. Manatla, tam və ya kəsrli. (Faza 2-də minor-unit tam ədədə keçmək olar.)
export type Money = number;

// Hüquqi mənbə istinadı. `verified: false` olan dəyər production-da xəbərdarlıqla göstərilir.
export interface LegalSource {
  article?: string; // məs. "VM 121" — maddə/bənd (bəzi dəyərlər NK qərarına əsaslanır, maddəsiz)
  url?: string; // e-qanun.az istinadı
  note: string; // qısa izah
  verified: boolean; // cari qanunvericiliklə təsdiqlənibmi
}

// Xərcin vergi məqsədləri üçün statusu.
// DEDUCT = çıxılan · NONDEDUCT = çıxılmayan · LIMIT = norma ilə məhdudlaşan · ADJUST = vergi düzəlişi
export type Deductibility = "DEDUCT" | "NONDEDUCT" | "LIMIT" | "ADJUST";

// Dörd göz təsdiq axını statusu (CLAUDE.md §2, prinsip 8).
export type DeclarationStatus = "HAZIRLANIR" | "BAXIŞ" | "TƏSDİQ" | "TƏQDİM_ÜÇÜN_HAZIR";

// Vergi dövrü — hər data konkret (Company × TaxPeriod) cütünə bağlıdır.
export interface TaxPeriod {
  taxYear: number;
  // İllik bəyannamə üçün rüb tələb olunmur; rüblük hesabatlar üçün 1..4.
  quarter?: 1 | 2 | 3 | 4;
}

// Normallaşdırılmış baş kitab sətri — ingestion parserlərinin çıxışı (Faza 1).
// Real 1C/Excel sətirləri bu formaya gətirilir; körpü və təsnifat bundan qidalanır.
export interface LedgerLine {
  id: string;
  date: string; // ISO tarix
  account: string; // hesab kodu (hesablar planı)
  description: string; // əməliyyatın təsviri
  debit: Money;
  credit: Money;
  counterparty?: string;
  source: string; // hansı fayldan/mənbədən gəldiyi (audit izi)
}
