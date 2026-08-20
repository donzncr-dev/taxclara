// Vergi qaydaları strukturu — VERGİ İLİNƏ GÖRƏ VERSİYALI.
// Bax: CLAUDE.md bölmə 3 (hüquqi məlumat qaydası).
// Hər dəyər `source` daşıyır; `verified: false` olanlar production-da xəbərdarlıqla göstərilir.

import type { LegalSource } from "../types";

export interface RuleValue<T> {
  value: T;
  source: LegalSource;
}

// Norma ilə məhdudlaşan xərc — hədd dəyəri NK qərarından gəlir (çox vaxt verified:false)
export interface NormLimit {
  category: string;
  // hədd növü: gəlirin faizi, gündəlik məbləğ, mütləq məbləğ
  kind: "percent_of_income" | "daily_amount" | "absolute" | "unknown";
  limit: RuleValue<number | null>; // null → hələ təsdiqlənməyib
}

export interface Ruleset {
  taxYear: number;

  // Mənfəət vergisi standart dərəcəsi
  profitTaxRate: RuleValue<number>;

  // Zərərin gələcəyə köçürülmə müddəti (il)
  lossCarryforwardYears: RuleValue<number>;

  // ƏDV standart dərəcəsi (körpü hesablamalarında istifadə olunur)
  vatStandardRate: RuleValue<number>;

  // ƏDV qeydiyyat həddi
  vatRegistrationThreshold: RuleValue<number>;

  // Bəyannamə təqdim müddəti (illik)
  filingDeadline: RuleValue<string>; // "MM-DD"

  // Norma ilə məhdudlaşan xərclər
  normLimits: NormLimit[];
}
