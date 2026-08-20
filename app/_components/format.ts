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
