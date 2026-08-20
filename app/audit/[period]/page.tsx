import { notFound } from "next/navigation";
import { getPeriod } from "@/app-data/sample";
import { BRIDGES } from "@/domain/reconciliation/bridges";
import { runAll } from "@/domain/reconciliation/engine";
import { AuditWorkspace } from "./AuditWorkspace";

// Dövr iş sahəsi. Körpü mühərriki server tərəfdə işləyir; nəticə client-ə ötürülür.
export default async function AuditPage({
  params,
}: {
  params: Promise<{ period: string }>;
}) {
  const { period } = await params;
  const data = getPeriod(period);
  if (!data) notFound();

  const bridges = runAll(BRIDGES, data.ctx);

  return <AuditWorkspace period={data} bridges={bridges} />;
}
