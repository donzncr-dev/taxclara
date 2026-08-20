// Mənfəət bəyannaməsi builder-i. Uzlaşdırılmış rəqəmlər → bəyannamə xanaları (mənbə izi ilə).
// Xana kodları NÜMUNƏDİR — real bəyannamə formasının xana nömrələri ilə əvəz edilməlidir.
// VERIFY: bəyannamə xana kodları rəsmi formadan götürülməlidir.

import type { Money } from "../types";
import { getRuleset } from "../tax-rules";

export interface DeclarationCell {
  code: string;   // NÜMUNƏ kod — rəsmi forma ilə əvəz et
  label: string;
  value: Money;
  source: string; // mənbə izi (hansı körpü/təsnifat)
}

export interface DeclarationInput {
  revenue: Money;         // uzlaşdırılmış ümumi gəlir
  deductible: Money;      // çıxılan xərclər cəmi
  taxAdjustments: Money;  // vergi düzəlişləri (amortizasiya fərqi və s.)
  lossUsed: Money;        // istifadə edilən köçürülmüş zərər
}

export function buildProfitDeclaration(input: DeclarationInput, taxYear: number): {
  cells: DeclarationCell[];
  taxableProfit: Money;
  profitTax: Money;
  rulesetYear: number;
} {
  const rs = getRuleset(taxYear);
  const taxableProfit = Math.max(
    0,
    input.revenue - input.deductible + input.taxAdjustments - input.lossUsed
  );
  const profitTax = Math.round(taxableProfit * rs.profitTaxRate.value * 100) / 100;

  const cells: DeclarationCell[] = [
    { code: "301", label: "Ümumi gəlir",               value: input.revenue,       source: "ƏDV körpüsü + e-Qaimə" },
    { code: "302", label: "Gəlirdən çıxılan xərclər",   value: input.deductible,    source: "Təsnifat (çıxılan)" },
    { code: "303", label: "Vergi düzəlişləri",          value: input.taxAdjustments,source: "Amortizasiya fərqi" },
    { code: "304", label: "Köçürülən zərər (istifadə)", value: input.lossUsed,      source: "Zərər körpüsü" },
    { code: "310", label: "Vergi tutulan mənfəət",      value: taxableProfit,       source: "Hesablanmış" },
    { code: "320", label: `Mənfəət vergisi (${rs.profitTaxRate.value * 100}%)`, value: profitTax, source: "Hesablanmış" },
  ];

  return { cells, taxableProfit, profitTax, rulesetYear: rs.taxYear };
}
