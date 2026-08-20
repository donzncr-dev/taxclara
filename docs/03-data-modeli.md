# 03 — Data modeli

Tam sxem: `prisma/schema.prisma`.

## Onurğa: Tenant → Company → TaxPeriod
- **Tenant** — mühasib firması. İzolyasiyanın kökü. Bütün data buna zəncirlənir.
- **Company** — müştəri şirkət (VÖEN ilə).
- **TaxPeriod** — hər şeyin lövbəri. Data, hesablama, bəyannamə həmişə `(Company × TaxPeriod)` cütünə aiddir.
  `taxYear` qayda versiyasını seçir. `locked` snapshot alındıqda `true` olur.

## Data axını modeli
```
SourceFile (kind + confidence + status)
   └─> LedgerLine (normallaşmış: hesab, təsvir, məbləğ, istiqamət)
          └─> Classification (suggested + confirmed + normFlag)
```
Bütün mənbələr (1C, bank, e-qaimə, ƏDV, DSMF...) vahid `LedgerLine`-a normallaşır.

## Uyğunsuzluq
- **BridgeRun** — körpü nəticəsinin snapshot-u (start, expected, actual, residual, flagged, lines).
  Körpü *tərifləri* koddadır (`src/domain/reconciliation/bridges.ts`), *nəticələri* DB-də.

## Bəyannamə
- **Declaration** — dörd göz statusu, xanalar (JSON, mənbə izi ilə), `rulesetYear`, `snapshot`.
  `SUBMITTED` olduqda `snapshot` giriş datasını dondurur, `TaxPeriod.locked = true`.

## Audit
- **AuditEvent** — hər əməliyyat (təsnifat təsdiqi, körpü imzası, bəyannamə formalaşdırması) istifadəçi +
  zaman ilə. Peşəkar məsuliyyətin izi.

## Kritik qərarlar
1. Heç bir data dövrsüz mövcud deyil.
2. İzolyasiya query filtri + serializer səviyyəsində.
3. Snapshot: təqdim olunmuş bəyannamənin girişi dəyişməz.
