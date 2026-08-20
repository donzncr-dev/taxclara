// Audit log tipləri — tam əhatə. Hər peşəkar mülahizə loglanır (məsuliyyət izi).
// Bax: CLAUDE.md bölmə 2, prinsip 7.

export type AuditAction =
  | "classification.confirm"
  | "classification.override"
  | "bridge.sign"        // mühasib körpü nəticəsini qəbul edir
  | "declaration.build"
  | "declaration.review"
  | "declaration.approve"
  | "declaration.submit"
  | "period.lock"
  | "rule.update";       // yalnız ADMIN

export interface AuditEventInput {
  userId: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  detail?: Record<string, unknown>;
}
