// Təsnifat mühərriki — TƏKLİF edir, təsdiqləmir. Yekun qərar mühasibdədir.
// Bax: CLAUDE.md bölmə 2, prinsip 6.

import type { Deductibility, LedgerLine } from "../types";
import { getRuleset } from "../tax-rules";

export interface ClassificationSuggestion {
  category: string;
  suggested: Deductibility;
  confidence: number; // 0..1 — yalnız təklifin gücü, avtomatik yekun deyil
  normFlag: boolean;  // norma yoxlaması lazımdır (LIMIT növü)
  reason?: string;
}

// Kateqoriya → default təklif. Real sistem hesab kodu + təsvir + tarixçədən öyrənir.
const CATEGORY_MAP: Record<string, { d: Deductibility; conf: number; reason?: string }> = {
  "Əməkhaqqı":          { d: "DEDUCT", conf: 0.97 },
  "İcarə":              { d: "DEDUCT", conf: 0.95 },
  "Kommunal":           { d: "DEDUCT", conf: 0.94 },
  "Reklam":             { d: "DEDUCT", conf: 0.88 },
  "Nəqliyyat":          { d: "DEDUCT", conf: 0.90 },
  "Təmir":              { d: "DEDUCT", conf: 0.85 },
  "Bank xərcləri":      { d: "DEDUCT", conf: 0.92 },
  "Təmsilçilik":        { d: "LIMIT",  conf: 0.80, reason: "Norma ilə məhdudlaşır (NK qərarı)" },
  "Ezamiyyə":           { d: "LIMIT",  conf: 0.82, reason: "Gündəlik norma ilə məhdudlaşır (NK qərarı)" },
  "Cərimə/faiz (büdcə)":{ d: "NONDEDUCT", conf: 0.91, reason: "Büdcəyə cərimələr çıxılmır" },
  "Amortizasiya":       { d: "ADJUST", conf: 0.85, reason: "Mühasibat ≠ vergi amortizasiyası" },
};

export function suggest(category: string, taxYear: number): ClassificationSuggestion {
  const rs = getRuleset(taxYear);
  const hit = CATEGORY_MAP[category];
  const suggested = hit?.d ?? "NONDEDUCT";
  const isLimited = suggested === "LIMIT" || rs.normLimits.some((n) => n.category === category);
  return {
    category,
    suggested,
    confidence: hit?.conf ?? 0.5,
    normFlag: isLimited,
    reason: hit?.reason,
  };
}

// Sətir massivi üçün toplu təklif
export function suggestBatch(
  lines: Pick<LedgerLine, "description">[],
  categoryOf: (l: Pick<LedgerLine, "description">) => string,
  taxYear: number
): ClassificationSuggestion[] {
  return lines.map((l) => suggest(categoryOf(l), taxYear));
}
