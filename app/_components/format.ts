// Ledger formatlaması — hər yerdə eyni ₼ göstərişi (tabular-nums ilə).
// Deterministik: server (Node ICU) və brauzer eyni nəticəni verməlidir ki,
// hydration uyğunsuzluğu olmasın. Ona görə Intl.NumberFormat-a güvənmirik —
// minlikləri əl ilə boşluqla ayırırıq (dizayn dili: "1 245 000 ₼").

function groupThousands(intStr: string): string {
  return intStr.replace(/\B(?=(\d{3})+(?!\d))/g, " "); // sıx boşluq (NBSP)
}

export function azn(n: number): string {
  const rounded = Math.round(n);
  const abs = Math.abs(rounded);
  const grouped = groupThousands(String(abs));
  const sign = rounded < 0 ? "− " : "";
  return `${sign}${grouped} ₼`;
}

// Mənfi dəyəri "− 1 234 ₼" kimi göstərir (mütləq qiymət + ayrıca işarə).
export function aznSigned(n: number): string {
  return azn(n);
}

// 2 onluqlu (qəpik) — rəsmi bəyannamə dəqiqliyi ("1 230 370.54 ₼").
export function azn2(n: number): string {
  const cents = Math.round(Math.abs(n) * 100);
  const int = Math.floor(cents / 100);
  const frac = String(cents % 100).padStart(2, "0");
  const sign = n < 0 ? "− " : "";
  return `${sign}${groupThousands(String(int))}.${frac} ₼`;
}
