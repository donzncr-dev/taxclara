# 05 — Uyğunsuzluq körpüləri

Kod: `src/domain/reconciliation/`. İşlək nümunə: `npm run check:bridges`.

## Fəlsəfə: izahlı qalıq, sadə fərq deyil
Naiv fərq yoxlaması yüzlərlə saxta xəbərdarlıq verir və mühasib sistemə etibar etməyi dayandırır.
Doğru model:

```
başlanğıc rəqəm
  → (±) bilinən qanuni düzəliş sətirləri (hər biri hüquqi əsası ilə)
  = gözlənilən rəqəm
  − faktiki rəqəm
  = İZAHSIZ QALIQ  → yalnız bu bayraqlanır (tolerance-dən yuxarı olarsa)
```

Sistem "47 000 fərq var" demir; "42 000-i avans/ƏV ilə izah olunur, 5 000 izahsız" deyir.

## Körpülər (Faza 1)

### 1. ƏDV dövriyyəsi ↔ Mənfəət gəliri
Qanuni fərq səbəbləri: avanslar (vaxt fərqi), əsas vəsait satışı (ƏDV tam dəyərdən / gəlir qalıq üstü),
ƏDV-siz gəlirlər (faiz, dividend, məzənnə, cərimə), ƏDV-dən azad/sıfır dərəcəli əməliyyatlar.

### 2. Əməkhaqqı fondu ↔ DSMF bazası
Fərq səbəbləri: DSMF-yə cəlb olunmayan ödənişlər, MHM/xidmət müqavilələri fərqi.

### 3. Zərərin köçürülməsi — kəsilməzlik
Əvvəlki bəyannamədə köçürülən zərər − istifadə = qalmalı olan qalıq. Uyğunsuzluq = itki və ya səhv.

### 4. e-Qaimələr ↔ ƏDV dövriyyəsi
e-Qaimə cəmi − ləğv/korrektə = gözlənilən ƏDV dövriyyəsi.

## Yeni körpü əlavə etmək
`bridges.ts` massivinə yeni `BridgeDefinition` obyekti: `resolve(ctx)` funksiyası `ctx.figures`-dən
oxuyur. `figures` açarları parser çıxışlarından doldurulur (Faza 1 ingestion işi).

## Gələcək körpülər (Faza 2)
- Bank mədaxili ↔ bəyan edilmiş gəlir
- ƏDV əvəzləşdirmə ↔ alış qaimələri
- Əsas vəsait balansı ↔ amortizasiya cədvəli
