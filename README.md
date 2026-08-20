# Bəyannamə·Audit

Azərbaycan müəssisələri üçün **vergi bəyannaməsi hazırlama + uyğunsuzluq auditi** platforması.
Faza 1: mənfəət bəyannaməsi + uyğunsuzluq körpüləri.

> **Claude Code ilə davam etməzdən əvvəl `CLAUDE.md` oxu** — bütün memarlıq qərarları oradadır.

## Nə hazırdır (bu skafold)
- `prisma/schema.prisma` — tam data modeli (multi-tenant, dövr-mərkəzli, versiyalı qaydalar, snapshot, audit)
- `src/domain/` — domain məntiqi (TypeScript)
  - `tax-rules/` — vergi ilinə görə versiyalı qaydalar (2025 ruleset, VERIFY-bayraqlı)
  - `reconciliation/` — **uyğunsuzluq körpü mühərriki** (işlək, tipli)
  - `classification/` — təsnifat (təklif → təsdiq)
  - `declaration/` — bəyannamə builder
  - `audit/` — audit log tipləri
- `docs/` — vizyon, rollar, data modeli, qaydalar, körpülər
- `reference/prototype.html` — vizual prototip (brauzerdə aç)

## Cəld yoxlama
```bash
npm install
npm run check:bridges   # körpü mühərrikini nümunə data ilə işə salır
```
Gözlənilən çıxış: 4 körpüdən 2-si bayraqlı (ƏDV↔mənfəət 5 000, zərər 7 000), 2-si uzlaşır.

## Növbəti addımlar (Claude Code)
1. Next.js app skeleton (`app/`, auth, layout)
2. Fayl ingestion parserləri (1C Excel → LedgerLine) — kiçik başla
3. Prisma migration + seed
4. Körpüləri real dataya bağla
5. Bəyannamə export (Word/PDF)
6. Rol/icazə middleware + audit yazımı

## Stack
Next.js 15 (App Router) · TypeScript · Prisma + PostgreSQL · Zod · plain CSS

## Xatırlatma
Vergi məhsuludur. Hər dərəcə/norma/maddə cari qanunvericiliklə (e-qanun.az) təsdiqlənməlidir.
Yekun peşəkar mülahizə mühasibə aiddir.
