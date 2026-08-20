// Mənfəət bəyannaməsi builder-i — RƏSMİ MENFEET_1 formatı göstərici kodları.
// Uzlaşdırılmış rəqəmlər → bəyannamə xanaları (mənbə izi ilə).
// Kod uyğunluğu real e-bəyannamə XML-i ilə: bax docs/06-menfeet-beyannamesi-xml.md
// VERIFY: gəlir/xərc alt-göstəriciləri (1002..1072, 2001..2071) və düzəliş/zərər alt-kodları
//         rəsmi MENFEET_1.xsd ilə təsdiqlənməlidir. Aşağıda yalnız təsdiqlənmiş cəm kodları var.

import type { Money } from "../types";
import { getRuleset } from "../tax-rules";

export interface DeclarationCell {
  section: string; // "Gəlir" | "Xərclər" | "Düzəlişlər" | "Vergi hesabı"
  code: string; // MENFEET_1 göstərici kodu ("1001", "2073", "3001"...) — "—" = kod hələ təsdiqlənməyib
  label: string;
  value: Money;
  op: "" | "−" | "+" | "="; // arifmetika şəffaflığı üçün operator
  strong?: boolean;
  verify?: boolean; // kod/label rəsmi XSD ilə təsdiqlənməli
  pct?: boolean; // dəyər faizdir (məs. dərəcə), pul deyil
  source: string; // mənbə izi (hansı körpü/təsnifat)
}

export interface DeclarationInput {
  revenue: Money; // uzlaşdırılmış ümumi gəlir (1001)
  deductible: Money; // çıxılan xərclər cəmi (2073)
  taxAdjustments: Money; // vergi düzəlişləri (işarəli: + əlavə / − azaltma)
  lossUsed: Money; // istifadə edilən köçürülmüş zərər
}

export function buildProfitDeclaration(input: DeclarationInput, taxYear: number): {
  cells: DeclarationCell[];
  taxableProfit: Money;
  loss: Money;
  profitTax: Money;
  rulesetYear: number;
} {
  const rs = getRuleset(taxYear);
  const rate = rs.profitTaxRate.value;

  // Nəticə müsbətdirsə → vergi tutulan mənfəət (3001); mənfidirsə → zərər (3002), mənfəət 0.
  const base = input.revenue - input.deductible + input.taxAdjustments - input.lossUsed;
  const taxableProfit = Math.max(0, base);
  const loss = Math.max(0, -base);
  const profitTax = Math.round(taxableProfit * rate * 100) / 100;
  const adjOp: "+" | "−" = input.taxAdjustments < 0 ? "−" : "+";

  const cells: DeclarationCell[] = [
    { section: "Gəlir", code: "1001", label: "Ümumi gəlir", value: input.revenue, op: "", source: "ƏDV körpüsü + e-Qaimə" },
    { section: "Xərclər", code: "2073", label: "Gəlirdən çıxılan xərclərin cəmi", value: input.deductible, op: "−", source: "Təsnifat (çıxılan)" },
  ];

  if (input.taxAdjustments !== 0) {
    cells.push({
      section: "Düzəlişlər", code: "—", label: "Vergi düzəlişləri (amortizasiya fərqi)",
      value: Math.abs(input.taxAdjustments), op: adjOp, verify: true, source: "Mühasibat ≠ vergi amortizasiyası",
    });
  }
  if (input.lossUsed !== 0) {
    cells.push({
      section: "Düzəlişlər", code: "—", label: "Köçürülən zərərin istifadəsi",
      value: input.lossUsed, op: "−", verify: true, source: "Zərər körpüsü",
    });
  }

  if (loss > 0) {
    cells.push({ section: "Vergi hesabı", code: "3002", label: "Zərər", value: loss, op: "=", strong: true, source: "Xərclər gəliri üstələyir — vergi tutulan mənfəət yoxdur" });
    cells.push({ section: "Vergi hesabı", code: "3001", label: "Vergi tutulan mənfəət", value: 0, op: "", source: "Zərərli dövr" });
  } else {
    cells.push({ section: "Vergi hesabı", code: "3001", label: "Vergi tutulan mənfəət", value: taxableProfit, op: "=", strong: true, source: `1001 − 2073 ${adjOp} düzəlişlər` });
  }

  cells.push({ section: "Vergi hesabı", code: "3005", label: "Mənfəət vergisinin dərəcəsi", value: rate * 100, op: "", pct: true, source: `Cari qayda (${taxYear})` });
  cells.push({ section: "Vergi hesabı", code: "3004", label: "Hesablanmış mənfəət vergisi", value: profitTax, op: "", strong: true, source: `3001 × ${rate * 100}%` });

  return { cells, taxableProfit, loss, profitTax, rulesetYear: rs.taxYear };
}
