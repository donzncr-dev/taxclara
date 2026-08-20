import Link from "next/link";
import { Masthead } from "./_components/Masthead";
import { Icon } from "./_components/Icon";
import { PERIODS } from "@/app-data/sample";
import { BRIDGES } from "@/domain/reconciliation/bridges";
import { runAll, auditSummary } from "@/domain/reconciliation/engine";

// Giriş ekranı — dövr-mərkəzli. Hər sətir bir (Şirkət × Vergi dövrü) cütüdür.
export default function DashboardPage() {
  return (
    <>
      <Masthead subtitle="Bəyannamə hazırlama · uyğunsuzluq auditi" />

      <div className="dash-head">
        <div>
          <h1>Dövrlər</h1>
          <p>Hər bəyannamə konkret şirkət və vergi dövrünə bağlıdır. Davam etmək üçün seçin.</p>
        </div>
      </div>

      <div className="periods">
        {PERIODS.map((p) => {
          const summary = auditSummary(runAll(BRIDGES, p.ctx));
          const flagged = summary.flagged > 0;
          const c = flagged ? "var(--flag)" : "var(--ok)";
          const bg = flagged ? "var(--flagBg)" : "var(--okBg)";
          return (
            <Link key={p.id} href={`/audit/${p.id}`} className="card period">
              <div className="ic" style={{ width: 40, height: 40, borderRadius: 9, background: "var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon name="building" size={18} color="#A67C2E" />
              </div>
              <div className="co">
                <div className="nm">{p.company}</div>
                <div className="meta">
                  <span>VÖEN {p.voen}</span>
                  <span>·</span>
                  <span>{p.status}</span>
                </div>
              </div>
              <span className="yr">{p.periodLabel}</span>
              <span
                className="statuschip"
                style={{ borderColor: `${c}44`, background: bg, color: c }}
              >
                <Icon name={flagged ? "warn" : "ok"} size={14} color={c} />
                <span>{flagged ? `${summary.flagged} açıq bayraq` : "Hazır"}</span>
              </span>
            </Link>
          );
        })}
      </div>

      <footer>
        İlkin prototip · nümunə məlumatları ilə. Normalar (təmsilçilik, ezamiyyə) və maddə nömrələri
        istifadədən əvvəl cari qanunvericiliklə (e-qanun.az) təsdiqlənməlidir. Yekun peşəkar mülahizə
        mühasibə aiddir.
      </footer>
    </>
  );
}
