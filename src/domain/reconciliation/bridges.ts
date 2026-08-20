// Körpü tərifləri — hansı rəqəmlər uzlaşdırılır və hansı qanuni düzəlişlər gözlənilir.
// `resolve` funksiyaları ctx.figures-dən oxuyur; Faza 1-də bu figures parser çıxışlarından doldurulacaq.
// Yeni körpü əlavə etmək = bu massivə yeni obyekt.

import type { BridgeDefinition } from "./types";

export const BRIDGES: BridgeDefinition[] = [
  // 1) ƏDV dövriyyəsi ↔ mənfəət gəliri
  // Qanuni fərq səbəbləri: avanslar (vaxt fərqi), əsas vəsait satışı (ƏDV tam / gəlir qalıq üstü),
  // ƏDV-siz gəlirlər (faiz, dividend, məzənnə, cərimə), ƏDV-dən azad/sıfır dərəcəli əməliyyatlar.
  {
    key: "vat-profit",
    title: "ƏDV dövriyyəsi ↔ Mənfəət gəliri",
    startLabel: "ƏDV bəyannaməsi dövriyyəsi",
    expectedLabel: "Gözlənilən mənfəət gəliri",
    actualLabel: "Bəyannamədəki gəlir",
    tolerance: 500,
    note: "Bu məbləğ bilinən qanuni düzəlişlərlə izah olunmur — təqdimatdan əvvəl yoxlanmalıdır.",
    resolve: (ctx) => ({
      start: ctx.figures["vat.turnover"] ?? 0,
      lines: [
        {
          label: "(–) Cari ildə alınan, gələn ilə aid avanslar",
          value: -(ctx.figures["vat.advances"] ?? 0),
          basis: "Avans ƏDV obyektidir, gəlir hələ tanınmayıb",
          // VERIFY: avans ƏDV / gəlir tanınması maddələri (VM 164/166?) — e-qanun ilə təsdiqlə
          source: { article: "VM 164/166", note: "Avans üzrə ƏDV və gəlir tanınması vaxt fərqi", verified: false },
        },
        {
          label: "(–) Əsas vəsait satışında ƏDV bazası ilə gəlir fərqi",
          value: -(ctx.figures["fa.saleBaseDiff"] ?? 0),
          basis: "ƏDV tam dəyərdən; gəlir yalnız qalıq dəyərdən yuxarı fərqdən",
        },
        {
          label: "(+) ƏDV-siz gəlirlər (faiz, məzənnə, cərimə)",
          value: ctx.figures["profit.nonVatIncome"] ?? 0,
          basis: "Mənfəətə düşür, ƏDV dövriyyəsində yox",
        },
      ],
      actual: ctx.figures["profit.revenue"] ?? 0,
    }),
  },

  // 2) Əməkhaqqı fondu ↔ DSMF bazası
  {
    key: "payroll-dsmf",
    title: "Əməkhaqqı fondu ↔ DSMF bazası",
    startLabel: "Mühasibat əməkhaqqı fondu",
    expectedLabel: "Gözlənilən DSMF bazası",
    actualLabel: "DSMF hesabatı bazası",
    tolerance: 500,
    note: "Fond ilə DSMF bazası arasında izahsız fərq — cəlb olunan/olunmayan ödənişləri yoxla.",
    resolve: (ctx) => ({
      start: ctx.figures["payroll.bookFund"] ?? 0,
      lines: [
        {
          label: "(–) DSMF-yə cəlb olunmayan ödənişlər",
          value: -(ctx.figures["payroll.exempt"] ?? 0),
          basis: "Cəlb olunmayan ödəniş növləri (müavinətlər və s.)",
        },
        {
          label: "(–) MHM & xidmət müqavilələri fərqi",
          value: -(ctx.figures["payroll.contractDiff"] ?? 0),
          basis: "Fərqli baza tətbiqi",
        },
      ],
      actual: ctx.figures["dsmf.base"] ?? 0,
    }),
  },

  // 3) Zərərin köçürülməsi — kəsilməzlik
  {
    key: "loss",
    title: "Zərərin köçürülməsi — kəsilməzlik",
    startLabel: "Əvvəlki bəyannamədə köçürülən zərər",
    expectedLabel: "Qalmalı olan zərər qalığı",
    actualLabel: "Faktiki göstərilən qalıq",
    tolerance: 0,
    // VERIFY: zərərin 5 ilə köçürülməsi (VM 121?) — e-qanun ilə təsdiqlə
    note: "5 illik köçürmə hüququ (VM 121?) — istifadə olunmayan zərər itirilir və ya yanlış göstərilib.",
    resolve: (ctx) => ({
      start: ctx.figures["loss.carriedIn"] ?? 0,
      lines: [
        {
          label: "(–) Cari ildə istifadə edilən zərər",
          value: -(ctx.figures["loss.used"] ?? 0),
          basis: "Cari il bəyannaməsində tətbiq olunan məbləğ",
        },
      ],
      actual: ctx.figures["loss.remaining"] ?? 0,
    }),
  },

  // 4) e-Qaimələr ↔ ƏDV dövriyyəsi
  {
    key: "eqaime-vat",
    title: "e-Qaimələr ↔ ƏDV dövriyyəsi",
    startLabel: "e-Qaimələr üzrə satış",
    expectedLabel: "Gözlənilən ƏDV dövriyyəsi",
    actualLabel: "ƏDV bəyannaməsi dövriyyəsi",
    tolerance: 500,
    note: "e-Qaimə cəmi ilə ƏDV dövriyyəsi arasında izahsız fərq — ləğv/korrektə qaimələri yoxla.",
    resolve: (ctx) => ({
      start: ctx.figures["eqaime.sales"] ?? 0,
      lines: [
        {
          label: "(–) Ləğv / korrektə edilmiş qaimələr",
          value: -(ctx.figures["eqaime.cancelled"] ?? 0),
          basis: "İl ərzində ləğv olunan qaimələr",
        },
      ],
      actual: ctx.figures["vat.turnover"] ?? 0,
    }),
  },
];
