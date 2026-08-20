// Uyğunsuzluq körpüsü (reconciliation bridge) modeli.
// Fəlsəfə: sadə fərq DEYİL. Bir rəqəmdən başla → izahlı düzəlişlər → gözlənilən → yalnız izahsız qalığı bayraqla.
// Bax: CLAUDE.md bölmə 2, prinsip 5.

import type { Money, LegalSource } from "../types";

// Bir izahlı düzəliş sətri — nə üçün iki rəqəm qanuni olaraq fərqlənir
export interface BridgeLine {
  label: string;
  value: Money;      // müsbət artırır, mənfi azaldır
  basis: string;     // hüquqi/uçot əsası (nə üçün bu düzəliş qanunidir)
  source?: LegalSource;
}

// Körpü tərifi — hansı iki rəqəmi uzlaşdırırıq və hansı düzəlişlər gözlənilir
export interface BridgeDefinition {
  key: string;
  title: string;
  startLabel: string;
  expectedLabel: string;
  actualLabel: string;
  tolerance: Money; // bu həddən aşağı qalıq bayraqlanmır (yuvarlaqlaşdırma)
  // Girişləri dövr datasından çıxaran funksiya (Faza 1-də real dataya bağlanır)
  resolve: (ctx: BridgeContext) => BridgeInputs;
  // İzahsız qalıq üçün izah mesajı
  note?: string;
}

// Körpünün ehtiyacı olan giriş dəyərləri
export interface BridgeInputs {
  start: Money;
  lines: BridgeLine[];
  actual: Money;
}

// Körpünün işlədiyi kontekst — dövr üzrə toplanmış rəqəmlər
// (Faza 1-də LedgerLine + parser çıxışlarından doldurulur)
export interface BridgeContext {
  taxYear: number;
  figures: Record<string, Money>; // məs. figures["vat.turnover"], figures["profit.revenue"]
}

// Hesablanmış nəticə
export interface BridgeResult {
  key: string;
  title: string;
  startLabel: string;
  expectedLabel: string;
  actualLabel: string;
  start: Money;
  lines: BridgeLine[];
  expected: Money;
  actual: Money;
  residual: Money;
  flagged: boolean;
  note?: string;
}
