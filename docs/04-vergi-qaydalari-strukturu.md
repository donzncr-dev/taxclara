# 04 — Vergi qaydaları strukturu

Kod: `src/domain/tax-rules/`.

## Prinsip: vergi ilinə görə versiyalama
Hər `Ruleset` bir vergi ilinə aiddir. Bəyannamə həmişə öz ilinin ruleset-i ilə hesablanır.
Admin qaydanı yeniləyəndə köhnə bəyannamələr **dəyişmir** (`Declaration.rulesetYear` sabit qalır).

Yeni il əlavə etmək: `rulesets/<il>.ts` yarat → `index.ts` registry-ə qeyd et.

## Hər dəyər mənbə daşıyır
```ts
profitTaxRate: {
  value: 0.20,
  source: { article: "VM 105", note: "...", verified: true }
}
```
- `verified: false` → UI-da "təsdiqlənməli" xəbərdarlığı (`unverifiedRules()` funksiyası toplayır).
- Normalar (təmsilçilik, ezamiyyə) NK qərarları ilə müəyyən olunur → `value: null, verified: false`.
  Cari həddi e-qanun/NK ilə təsdiqləmədən doldurma.

## 2025 ruleset — hazırkı vəziyyət (2026-01)
| Qayda | Dəyər | Status |
|---|---|---|
| Mənfəət vergisi dərəcəsi | 20% | təsdiqlənib |
| ƏDV standart dərəcəsi | 18% | təsdiqlənib |
| Bəyannamə müddəti | 31 mart | təsdiqlənib |
| Zərər köçürməsi | 5 il (VM 121?) | **maddə təsdiqlənməli** |
| ƏDV qeydiyyat həddi | 200 000 ₼ (VM 155?) | **maddə təsdiqlənməli** |
| Təmsilçilik norması | — | **təsdiqlənməli (NK)** |
| Ezamiyyə norması | — | **təsdiqlənməli (NK)** |
| Dividend ödəmə mənbəyi | 5% (2025-dən, VM 126?) | əlavə ediləcək |

## Qayda: heç vaxt yaddaşdan
Hər dərəcə/norma/maddə https://e-qanun.az/framework/46948 ilə təsdiqlənir.
Şübhəli maddələr kodda `// VERIFY:` ilə flaglanır.
