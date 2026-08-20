// 2025-ci il vergi qaydaları.
// Əsas dərəcələr web ilə yoxlanıb (2026-01 vəziyyəti); maddə nömrələri VERIFY ilə flaglanıb.
// Normalar (təmsilçilik, ezamiyyə) NK qərarları ilə müəyyən olunur — verified:false, dəyər null.

import type { Ruleset } from "../types";

export const ruleset2025: Ruleset = {
  taxYear: 2025,

  profitTaxRate: {
    value: 0.20, // standart mənfəət vergisi dərəcəsi
    // VERIFY: standart dərəcə maddəsi (VM 105?) — e-qanun ilə təsdiqlə
    source: { article: "VM 105", note: "Standart mənfəət vergisi dərəcəsi 20%", verified: true },
  },

  lossCarryforwardYears: {
    value: 5,
    // VERIFY: zərərin köçürülməsi VM 121? — e-qanun ilə təsdiqlə
    source: { article: "VM 121", note: "Zərərin 5 ilə köçürülməsi", verified: false },
  },

  vatStandardRate: {
    value: 0.18,
    source: { article: "VM XI fəsil", note: "ƏDV standart dərəcəsi 18%", verified: true },
  },

  vatRegistrationThreshold: {
    value: 200000,
    // VERIFY: 200.000 AZN həddi maddəsi (VM 155?) — e-qanun ilə təsdiqlə
    source: { article: "VM 155", note: "12 aylıq dövriyyə həddi 200.000 ₼", verified: false },
  },

  filingDeadline: {
    value: "03-31", // 2025-dən vahid tarix
    source: { note: "İllik bəyannamə müddəti 31 mart", verified: true },
  },

  normLimits: [
    {
      category: "Təmsilçilik",
      kind: "percent_of_income",
      // VERIFY: təmsilçilik norması NK qərarı — cari həddi təsdiqlə, sonra doldur
      limit: { value: null, source: { note: "NK qərarı ilə müəyyən olunan hədd — təsdiqlənməli", verified: false } },
    },
    {
      category: "Ezamiyyə",
      kind: "daily_amount",
      // VERIFY: ezamiyyə gündəlik norması NK qərarı — cari həddi təsdiqlə
      limit: { value: null, source: { note: "NK qərarı ilə müəyyən olunan gündəlik norma — təsdiqlənməli", verified: false } },
    },
  ],
};
