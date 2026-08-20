// Nümunə: körpü mühərrikini real dataya bağlamadan yoxlamaq üçün.
// İşə salmaq: npx tsx src/domain/reconciliation/example.ts

import { BRIDGES } from "./bridges";
import { runAll, auditSummary } from "./engine";
import type { BridgeContext } from "./types";

const ctx: BridgeContext = {
  taxYear: 2025,
  figures: {
    "vat.turnover": 1245000,
    "vat.advances": 38000,
    "fa.saleBaseDiff": 4000,
    "profit.nonVatIncome": 0,
    "profit.revenue": 1198000,   // → izahsız qalıq 5000 (bayraq)

    "payroll.bookFund": 186500,
    "payroll.exempt": 4000,
    "payroll.contractDiff": 1300,
    "dsmf.base": 181200,          // → uzlaşdı

    "loss.carriedIn": 62000,
    "loss.used": 55000,
    "loss.remaining": 0,          // → 7000 qalıq (bayraq)

    "eqaime.sales": 1250200,
    "eqaime.cancelled": 5000,     // → uzlaşdı
  },
};

const results = runAll(BRIDGES, ctx);
for (const r of results) {
  const tag = r.flagged ? "⚠ BAYRAQ" : "✓ uzlaşdı";
  console.log(`${tag}  ${r.title}  →  izahsız qalıq: ${r.residual}`);
}
console.log("\nXülasə:", auditSummary(results));
