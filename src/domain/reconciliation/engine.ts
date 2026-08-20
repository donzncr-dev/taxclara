// Körpü mühərriki. Tərif + kontekst → nəticə (izahsız qalıq daxil).

import type { BridgeDefinition, BridgeContext, BridgeResult } from "./types";

const round2 = (n: number) => Math.round(n * 100) / 100;

export function runBridge(def: BridgeDefinition, ctx: BridgeContext): BridgeResult {
  const { start, lines, actual } = def.resolve(ctx);

  const adjustments = lines.reduce((s, l) => s + l.value, 0);
  const expected = round2(start + adjustments);
  const residual = round2(expected - actual);
  const flagged = Math.abs(residual) > def.tolerance;

  return {
    key: def.key,
    title: def.title,
    startLabel: def.startLabel,
    expectedLabel: def.expectedLabel,
    actualLabel: def.actualLabel,
    start,
    lines,
    expected,
    actual,
    residual,
    flagged,
    note: flagged ? def.note : undefined,
  };
}

export function runAll(defs: BridgeDefinition[], ctx: BridgeContext): BridgeResult[] {
  return defs.map((d) => runBridge(d, ctx));
}

// Yekun audit vəziyyəti
export function auditSummary(results: BridgeResult[]) {
  const flagged = results.filter((r) => r.flagged);
  return {
    total: results.length,
    flagged: flagged.length,
    reconciled: results.length - flagged.length,
    ready: flagged.length === 0,
    openFlags: flagged.map((r) => ({ key: r.key, title: r.title, residual: r.residual })),
  };
}
