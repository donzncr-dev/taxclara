// Qayda versiyasının seçimi. Bəyannamə HƏMİŞƏ öz vergi ilinin ruleset-i ilə hesablanır.
// Yeni il əlavə etmək üçün: rulesets/<il>.ts yarat və bu registry-ə qeyd et.

import type { Ruleset } from "./types";
import { ruleset2025 } from "./rulesets/2025";

const REGISTRY: Record<number, Ruleset> = {
  2025: ruleset2025,
};

export function getRuleset(taxYear: number): Ruleset {
  const rs = REGISTRY[taxYear];
  if (!rs) throw new Error(`${taxYear} üçün vergi qaydaları tapılmadı — rulesets/${taxYear}.ts əlavə et`);
  return rs;
}

// Təsdiqlənməmiş qayda dəyərlərini toplayır → UI xəbərdarlığı üçün
export function unverifiedRules(taxYear: number): string[] {
  const rs = getRuleset(taxYear);
  const out: string[] = [];
  const check = (label: string, verified: boolean, note: string) => {
    if (!verified) out.push(`${label}: ${note}`);
  };
  check("Mənfəət dərəcəsi", rs.profitTaxRate.source.verified, rs.profitTaxRate.source.note);
  check("Zərər köçürməsi", rs.lossCarryforwardYears.source.verified, rs.lossCarryforwardYears.source.note);
  check("ƏDV həddi", rs.vatRegistrationThreshold.source.verified, rs.vatRegistrationThreshold.source.note);
  for (const n of rs.normLimits) {
    check(`Norma: ${n.category}`, n.limit.source.verified, n.limit.source.note);
  }
  return out;
}

export type { Ruleset } from "./types";
