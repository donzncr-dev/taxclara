# 06 — Mənfəət bəyannaməsi (MENFEET_1) XML strukturu

Rəsmi e-bəyannamə formatının (ASAN / e-taxes) təhlili. Nümunə fayl: real mənfəət
bəyannaməsi (kodVer="MENFEET_1"). Bu sənəd bizim declaration builder-in çıxışını rəsmi
göstərici kodlarına bağlayır.

> **VERIFY:** Aşağıdakı cəm kodları real fayldakı dəyərlərin arifmetikası ilə təsdiqlənib.
> Alt-göstərici kodlarının (1002…1072, 2001…2071) və düzəliş/zərər kodlarının **etiketləri**
> rəsmi `MENFEET_1.xsd` ilə təsdiqlənməlidir. Kodda `verify: true` / UI-da "kod təsdiqlənməli".

## Kök struktur

```
<beyanname kodVer="MENFEET_1">
  <genel>        — başlıq: vergi orqanı, dövr, vergi ödəyicisi, fəaliyyət kodu
  <ozel>         — məzmun:
    <vergiHesab>              1001–1072  Gəlir göstəriciləri
    <bagliHarc>              2001–2073  Xərc göstəriciləri (~30 sətir)
    <hesabatDovruVergiHesab1> 3001–3003  Mənfəət/zərər
    <hesabatDovruVergiHesab2> 3004–3014  Dərəcə + vergi
    <aktivler>               4001–…     Balans — aktivlər
    <kapitalEhtiyatlar>      4023–7002  Balans — kapital və ehtiyatlar
    <umidsizBorcCemi>, <ilave4Cem>, <Elave7CemEnt> — əlavələr
```

## Başlıq (genel)

| Sahə | Nümunə | İzah |
|---|---|---|
| `mukellef/vergiNo` | 1404839171 | VÖEN |
| `mukellef/adi` | "PARLA PHARMACEUTICALS" MMC | Ad |
| `donem` | tip=2, yil=2025 | Dövr (illik) |
| `beyanname/faaliyetNovuKodu` | 21100 | Fəaliyyət (əczaçılıq istehsalı) |

## Vergi hesabı — təsdiqlənmiş cəm kodları (builder istifadə edir)

| Kod | Etiket | Nümunə dəyər |
|---|---|---|
| `1001` | Ümumi gəlir | 1 230 370.54 |
| `2073` | Gəlirdən çıxılan xərclərin cəmi | 1 850 578.12 |
| `3002` | **Zərər** | 620 207.58 |
| `3001` | Vergi tutulan mənfəət | 0 |
| `3005` | Mənfəət vergisinin dərəcəsi (%) | 20 |
| `3004` | Hesablanmış mənfəət vergisi | 0 |

## Əsas məntiq — mənfəət / zərər budaqlanması

```
base = 1001 (gəlir) − 2073 (xərclər) + düzəlişlər − köçürülən zərər
base ≥ 0  →  3001 = base (vergi tutulan mənfəət),  3002 = 0
base < 0  →  3002 = −base (zərər),  3001 = 0
3004 (vergi) = 3001 × 3005%
```

Nümunə faylda `base = 1 230 370.54 − 1 850 578.12 = −620 207.58` → **zərərli dövr**,
`3002 = 620 207.58`, `3001 = 0`, `3004 = 0`. (Zərər 5 il köçürülə bilər — VM 121?, təsdiqlənməli.)

Bu məntiq deterministik olaraq `src/domain/declaration/builder.ts`
(`buildProfitDeclaration`) və prototipdə (`Taxclara.az.html` → `buildDeclaration`) tətbiq olunur.

## Növbəti (P0/P1)

- Gəlir və xərclərin **alt-göstəriciləri** təsnifatdan (Deductibility) formalaşacaq.
- **Balans bölmələri** (aktivlər 4xxx, kapital 5xxx–7xxx) 1C / mühasibat datasından gələcək.
- XML **ixracı** (rəsmi formada) — declaration builder çıxışı → `MENFEET_1.xsd`-yə uyğun XML.
- Bütün alt-kod etiketləri rəsmi XSD ilə təsdiqlənib `verify: false` → `true` olacaq.
