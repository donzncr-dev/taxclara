"use client";

import { useMemo, useState } from "react";
import { Masthead } from "../../_components/Masthead";
import { Icon } from "../../_components/Icon";
import { azn, aznSigned } from "../../_components/format";
import type { ClassifyKind, SamplePeriod } from "@/app-data/sample";
import type { BridgeResult } from "@/domain/reconciliation/types";
import type { DeclarationCell } from "@/domain/declaration/builder";

type StepId = "sources" | "classify" | "reconcile" | "declare";

const STEPS: { id: StepId; n: string; label: string }[] = [
  { id: "sources", n: "01", label: "Mənbələr" },
  { id: "classify", n: "02", label: "Təsnifat" },
  { id: "reconcile", n: "03", label: "Uyğunsuzluq" },
  { id: "declare", n: "04", label: "Bəyannamə" },
];

const CLS: Record<ClassifyKind, { l: string; c: string; bg: string }> = {
  deduct: { l: "Çıxılan", c: "var(--ok)", bg: "var(--okBg)" },
  nondeduct: { l: "Çıxılmayan", c: "var(--flag)", bg: "var(--flagBg)" },
  limit: { l: "Məhdudlaşan", c: "var(--review)", bg: "var(--reviewBg)" },
  adjust: { l: "Vergi düzəlişi", c: "var(--brass)", bg: "var(--brassBg)" },
};

function Pill({ text, c, bg }: { text: string; c: string; bg: string }) {
  return (
    <span className="pill" style={{ color: c, background: bg, borderColor: `${c}33` }}>
      {text}
    </span>
  );
}

function VHead({ n, title, desc }: { n: string; title: string; desc: string }) {
  return (
    <div className="vhead">
      <div className="r">
        <span className="n">{n}</span>
        <h2>{title}</h2>
      </div>
      <p>{desc}</p>
    </div>
  );
}

function BRow({
  label,
  value,
  strong,
  muted,
  accent,
}: {
  label: string;
  value: number;
  strong?: boolean;
  muted?: boolean;
  accent?: boolean;
}) {
  const col = accent ? "var(--brass)" : muted ? "var(--inkSoft)" : "var(--ink)";
  const weight = strong || accent ? 600 : 500;
  return (
    <div className="brow">
      <span
        className="lb"
        style={{ color: muted ? "var(--inkSoft)" : "var(--ink)", fontWeight: strong || accent ? 500 : 400 }}
      >
        {label}
      </span>
      <span className="vl" style={{ color: col, fontWeight: weight }}>
        {aznSigned(value)}
      </span>
    </div>
  );
}

export function AuditWorkspace({
  period,
  bridges,
  declaration,
}: {
  period: SamplePeriod;
  bridges: BridgeResult[];
  declaration: { cells: DeclarationCell[] };
}) {
  const [active, setActive] = useState<StepId>("reconcile");
  const [confirmed, setConfirmed] = useState<Record<number, boolean>>({});

  const flaggedCount = useMemo(() => bridges.filter((b) => b.flagged).length, [bridges]);
  const chipColor = flaggedCount ? "var(--flag)" : "var(--ok)";
  const chipBg = flaggedCount ? "var(--flagBg)" : "var(--okBg)";

  return (
    <>
      <Masthead
        subtitle={`${period.company} · ${period.periodLabel}`}
        right={
          <div
            className="statuschip hide-sm"
            style={{ borderColor: `${chipColor}44`, background: chipBg, color: chipColor }}
          >
            <Icon name={flaggedCount ? "warn" : "ok"} size={14} color={chipColor} />
            <span>{flaggedCount ? `${flaggedCount} açıq bayraq` : "Hazır"}</span>
          </div>
        }
      />

      <div className="cols">
        <nav className="steps">
          <div className="steplist">
            {STEPS.map((s) => {
              const on = active === s.id;
              const showFlag = s.id === "reconcile" && flaggedCount > 0;
              return (
                <button
                  key={s.id}
                  className={`step${on ? " on" : ""}`}
                  onClick={() => setActive(s.id)}
                >
                  <span className="num">{s.n}</span>
                  <span className="lbl">{s.label}</span>
                  {showFlag && <span className="fdot" />}
                  {on && <Icon name="chev" size={14} color="var(--brass)" />}
                </button>
              );
            })}
          </div>
        </nav>

        <main className="view">
          {active === "sources" && <SourcesView period={period} />}
          {active === "classify" && (
            <ClassifyView period={period} confirmed={confirmed} setConfirmed={setConfirmed} />
          )}
          {active === "reconcile" && <ReconcileView bridges={bridges} />}
          {active === "declare" && <DeclareView cells={declaration.cells} notice={period.declareNotice} />}
        </main>
      </div>

      <footer>
        İlkin prototip · nümunə məlumatları ilə. Normalar (təmsilçilik, ezamiyyə) və maddə nömrələri
        istifadədən əvvəl cari qanunvericiliklə (e-qanun.az) təsdiqlənməlidir. Yekun peşəkar mülahizə
        mühasibə aiddir.
      </footer>
    </>
  );
}

/* ── 01 Mənbələr ── */
function SourcesView({ period }: { period: SamplePeriod }) {
  return (
    <>
      <VHead
        n="01"
        title="Mənbələr"
        desc="Hər fayl oxunur və etibarlılıq səviyyəsi ilə işarələnir. Aşağı etibarlılıq — əl ilə təsdiq lazımdır."
      />
      <div className="grid2">
        {period.sources.map((s, i) => (
          <div key={i} className="card src">
            <div className="ic">
              <Icon name={s.ic} size={17} color="var(--ink)" />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="nm">
                <span>{s.name}</span>
                <Icon
                  name={s.status === "ok" ? "shieldOk" : "shieldQ"}
                  color={s.status === "ok" ? "var(--ok)" : "var(--review)"}
                />
              </div>
              <div className="note">{s.note}</div>
              <div className="det">{s.det}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ── 02 Təsnifat ── */
function ClassifyView({
  period,
  confirmed,
  setConfirmed,
}: {
  period: SamplePeriod;
  confirmed: Record<number, boolean>;
  setConfirmed: (fn: (prev: Record<number, boolean>) => Record<number, boolean>) => void;
}) {
  const done = Object.values(confirmed).filter(Boolean).length;
  return (
    <>
      <VHead
        n="02"
        title="Təsnifat — təklif → təsdiq"
        desc="Sistem hər sətir üçün təsnifat təklif edir. Yekun qərar səndədir; norma ilə məhdudlaşan xərclər ayrıca işarələnir."
      />
      <div className="cprog">
        <b className="mono">{done}</b> / {period.classify.length} sətir təsdiqləndi
      </div>
      <div className="card">
        {period.classify.map((r, i) => {
          const cl = CLS[r.kind];
          const on = !!confirmed[i];
          return (
            <div key={i} className="crow">
              <button
                className={`chk${on ? " on" : ""}`}
                onClick={() => setConfirmed((p) => ({ ...p, [i]: !p[i] }))}
                aria-label="Təsdiqlə"
              >
                {on && <Icon name="check" size={13} color="#fff" />}
              </button>
              <div className="cn">
                <div className="t">
                  {r.name}
                  {r.norm && (
                    <span className="normtag">
                      <Icon name="warn" size={11} color="var(--review)" /> norma yoxlaması
                    </span>
                  )}
                </div>
                {r.norm && <div className="norm">{r.norm}</div>}
              </div>
              <span className="amt">{azn(r.amount)}</span>
              <Pill text={cl.l} c={cl.c} bg={cl.bg} />
            </div>
          );
        })}
      </div>
      <p style={{ fontSize: "11.5px", color: "var(--inkFaint)", marginTop: 12 }}>
        Heç bir sətir avtomatik yekunlaşmır — təsdiq düyməsi ilə sən qərar verirsən.
      </p>
    </>
  );
}

/* ── 03 Uyğunsuzluq ── */
function ReconcileView({ bridges }: { bridges: BridgeResult[] }) {
  const f = bridges.filter((b) => b.flagged).length;
  return (
    <>
      <VHead
        n="03"
        title="Uyğunsuzluq auditi"
        desc="Hər körpü bir rəqəmdən başlayır, bilinən qanuni düzəlişləri tətbiq edir və yalnız izah olunmayan qalığı bayraqlayır."
      />
      <div className="stats">
        <div className="stat">
          <div className="v" style={{ color: "var(--ink)" }}>{bridges.length}</div>
          <div className="l">körpü</div>
        </div>
        <div className="stat">
          <div className="v" style={{ color: "var(--flag)" }}>{f}</div>
          <div className="l">bayraq</div>
        </div>
        <div className="stat">
          <div className="v" style={{ color: "var(--ok)" }}>{bridges.length - f}</div>
          <div className="l">uzlaşdı</div>
        </div>
      </div>
      <div className="bridges">
        {bridges.map((b) => (
          <BridgeCard key={b.key} b={b} />
        ))}
      </div>
    </>
  );
}

function BridgeCard({ b }: { b: BridgeResult }) {
  const flagged = b.flagged;
  const sc = flagged ? "var(--flag)" : "var(--ok)";
  const sbg = flagged ? "var(--flagBg)" : "var(--okBg)";
  const verdictMsg = flagged
    ? b.note ||
      "Bu məbləğ bilinən qanuni düzəlişlərlə izah olunmur — təqdimatdan əvvəl yoxlanmalıdır."
    : "";
  return (
    <div className="card">
      <div className="bhead">
        <div className="t">
          <Icon name={flagged ? "warn" : "ok"} size={17} color={sc} />
          {b.title}
        </div>
        <Pill
          text={flagged ? `İzahsız ${azn(Math.abs(b.residual))}` : "Uzlaşdı"}
          c={sc}
          bg={sbg}
        />
      </div>
      <div className="bbody">
        <BRow label={b.startLabel ?? "Başlanğıc"} value={b.start} strong />
        {b.lines.map((l, i) => (
          <div key={i} className="bline">
            <BRow label={l.label} value={l.value} muted />
            <div className="basis">{l.basis}</div>
          </div>
        ))}
        <div className="bsep">
          <BRow label={b.expectedLabel ?? "Gözlənilən"} value={b.expected} accent />
        </div>
        <div style={{ marginTop: 6 }}>
          <BRow label={b.actualLabel ?? "Faktiki"} value={b.actual} />
        </div>
        <div className="verdict" style={{ background: sbg }}>
          <div style={{ marginTop: 1 }}>
            <Icon name={flagged ? "warn" : "check"} size={16} color={sc} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <span className="vt" style={{ color: sc }}>
                {flagged ? "İzah olunmayan qalıq" : "Tam izah olundu"}
              </span>
              <span className="vn" style={{ color: sc }}>
                {azn(Math.abs(b.residual))}
              </span>
            </div>
            {verdictMsg && <p>{verdictMsg}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── 04 Bəyannamə ──
   Xanalar buildProfitDeclaration() ilə hesablanır (tək mənbə). Hər sətir operatoru ilə
   göstərilir ki, 310 = 301 − 302 ± 303 − 304 arifmetikası açıq görünsün. */
function DeclareView({ cells, notice }: { cells: DeclarationCell[]; notice: string }) {
  const c303 = cells.find((c) => c.code === "303");
  const adjOp = c303 && c303.value < 0 ? "−" : "+";
  const opFor = (code: string) =>
    code === "302" ? "−" : code === "303" ? adjOp : code === "304" ? "−" : code === "310" ? "=" : "";
  const strongCode = (code: string) => code === "310" || code === "320";
  const srcFor = (c: DeclarationCell) => (c.code === "310" ? `301 − 302 ${adjOp} 303 − 304` : c.source);
  return (
    <>
      <VHead
        n="04"
        title="Bəyannamə xanaları"
        desc="Vergi tutulan mənfəət komponentlərdən avtomatik hesablanır (301 − 302 + 303 − 304). Rəqəmlər sərt yazılmır — hər xana mənbəyə qədər izlənə bilər."
      />
      <div className="card">
        {cells.map((c) => {
          const strong = strongCode(c.code);
          const op = opFor(c.code);
          return (
            <div key={c.code} className="drow" style={strong ? { background: "var(--brassBg)" } : undefined}>
              <span className="dcode" style={strong ? { background: "#fff" } : undefined}>
                {c.code}
              </span>
              <div className="dn">
                <div className="t">{c.label}</div>
                <div className="s">
                  <Icon name="scan" size={11} color="var(--inkFaint)" /> {srcFor(c)}
                </div>
              </div>
              <span
                className="dval"
                style={{ color: strong ? "var(--brass)" : "var(--ink)", fontWeight: strong ? 700 : 500 }}
              >
                {op ? op + " " : ""}
                {azn(c.code === "303" ? Math.abs(c.value) : c.value)}
              </span>
            </div>
          );
        })}
      </div>
      <div className="noticebar">
        <Icon name="warn" size={15} color="var(--flag)" />
        <p>{notice}</p>
      </div>
    </>
  );
}
