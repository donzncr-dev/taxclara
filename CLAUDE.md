# CLAUDE.md — Bəyannamə·Audit

Bu fayl Claude Code üçün layihənin **memarlıq qərarlarını** və **iş qaydalarını** saxlayır.
Kod yazmazdan əvvəl bu faylı oxu. Hər qərarın səbəbi var — dəyişmək istəyirsənsə, əvvəlcə səbəbi nəzərə al.

---

## 1. Layihə nədir

**Mövqeləndirmə:** Mühasib üçün **vergi və mühasibat məlumatlarını bir-biri ilə uzlaşdıran, riskləri
aşkarlayan və izah edən audit platforması.** Bu, "bəyannamə doldurma" aləti deyil — audit alətidir;
bəyannamə formalaşdırma yalnız nəticədir.
İstifadəçi: vergi mütəxəssisi / mühasib (SM Consulting tipli firma konteksti).

Axın: mühasibat & vergi datası qəbul et → analiz et → Vergi Məcəlləsinə uyğun düzəlişlər tətbiq et →
mənfəət vergisini hesabla → **uyğunsuzluqları aşkar et** → mənfəət bəyannaməsini formalaşdır.

### Mərhələlər
- **Faza 1 (indi):** Mənfəət bəyannaməsi + uyğunsuzluq körpüləri. Əsas dəyər buradadır.
- **Faza 2:** Bütün əsas bəyannamələr (ƏDV, muzdlu iş, əmlak) + vergi risklərinin erkən aşkarlanması.

**Ən vacib fərqləndirici xüsusiyyət uyğunsuzluq auditidir, bəyannamə doldurmaq deyil.** Məhsulun bütün
dizaynı bu prinsipə xidmət etməlidir.

---

## 2. Dəyişməz memarlıq prinsipləri

Bunlar layihənin onurğasıdır. Pozma.

1. **Dövr-mərkəzli (period-centric).** Hər data, hesablama və bəyannamə konkret `(Company × TaxPeriod)`
   cütünə bağlıdır. "Şirkətin datası" deyə ümumi anlayış yoxdur — həmişə dövrə aiddir.

2. **Kirayəçi izolyasiyası (multi-tenancy) serializer səviyyəsində.** Hər mühasib yalnız öz müştərilərini
   görür. İzolyasiya təkcə query filtri ilə deyil, **serializer/DTO səviyyəsində** təmin olunur —
   başqa firmanın datası heç vaxt response-a düşməməlidir. (kimlazım.az-da peşəkar kontaktı gizlətdiyimiz
   məntiqin eynisi.)

3. **Vergi qaydaları vergi ilinə görə versiyalanır.** 2025 bəyannaməsi 2025 qaydaları ilə hesablanır.
   Admin qaydanı yeniləyəndə **köhnə bəyannamələr dəyişmir.** Qayda dəyəri heç vaxt koda sərt yazılmır —
   `src/domain/tax-rules/rulesets/<il>.ts` faylından gəlir.

4. **Snapshot / kilid.** Bəyannamə "təqdim olundu" statusuna keçəndə altındakı giriş datası **dondurulur**.
   Təqdim olunmuş bəyannamənin girişini geriyə dəyişmək olmaz. Dəyişiklik yeni versiya/düzəliş yaradır.

5. **İzahlı qalıq (explained residual), sadə fərq deyil.** Uyğunsuzluq yoxlaması iki rəqəmi çılpaq
   müqayisə etmir. Bir rəqəmdən başlayır → bilinən qanuni düzəliş sətirlərini tətbiq edir → gözlənilən
   dəyərə çatır → yalnız **izah olunmayan qalığı** bayraqlayır. Bu, saxta xəbərdarlıqları (false positive)
   aradan qaldırır. Bax: `src/domain/reconciliation/`.

6. **Təsnifat: təklif → təsdiq.** Sistem xərcin çıxılan/çıxılmayan/məhdudlaşan olduğunu **təklif edir**,
   heç vaxt avtomatik yekunlaşdırmır. Yekun qərar və məsuliyyət mühasibdədir. Norma ilə məhdudlaşan
   xərclər ("norma yoxlaması") ayrıca bayraqlanır.

7. **Audit logu tam əhatəli.** Yalnız admin əməliyyatları yox — hər təsnifat təsdiqi, hər körpü imzası,
   hər bəyannamə formalaşdırması **məsul istifadəçi + zaman** ilə loglanır. Bu, peşəkar məsuliyyətin
   hüquqi onurğasıdır.

8. **Dörd göz (təsdiq axını).** Bəyannamə statusu: `HAZIRLANIR → BAXIŞ → TƏSDİQ → TƏQDİM ÜÇÜN HAZIR`.
   Kiçik mühasib hazırlayır, senior təsdiqləyir.

9. **AI köməkçidir, deterministik rule engine həlledicidir.** AI yalnız bu köməkçi rollarda işləyir:
   sənəd tanıma, hesab təsnifatı, anomaliya aşkarlanması, hüquqi əsasın **təklifi**, açıqlama mətninin
   generasiyası, risk prioritetləşdirməsi. **Yekun vergi hesablaması HEÇ VAXT AI ilə edilmir** —
   həmişə `src/domain/` altındakı deterministik, tipli, versiyalı qayda mühərriki (rule engine) ilə.
   AI çıxışı təklifdir; rəqəm və qərar deterministik koddan gəlir və mühasib təsdiqləyir. Bu sərhəd
   məhsulun etibarının onurğasıdır — pozma.

---

## 3. HÜQUQİ MƏLUMAT QAYDASI (ən kritik)

Bu, vergi məhsuludur. Səhv rəqəm və ya köhnəlmiş maddə real ziyandır.

- **Heç vaxt yaddaşdan qanun sitatı gətirmə.** Hər dərəcə, norma, hədd və maddə nömrəsi cari
  qanunvericiliklə (https://e-qanun.az/framework/46948 — Vergi Məcəlləsi) təsdiqlənməlidir.
- **Şübhəli maddə nömrələrini açıq bayraqla:** kodda `// VERIFY:` şərhi ilə, UI-da isə "təsdiqlənməli"
  işarəsi ilə. Nümunə: `// VERIFY: zərər köçürməsi VM 121? — e-qanun ilə təsdiqlə`.
- Ruleset fayllarında hər dəyərin yanında `source` və `verified` sahələri saxlanılır. `verified: false`
  olan dəyər production-da xəbərdarlıqla göstərilir.
- **Normaları (təmsilçilik, ezamiyyə) koda sərt yazma** — onlar Nazirlər Kabineti qərarları ilə müəyyən
  olunur və dəyişir. Placeholder + `verified: false` saxla.

---

## 4. Texnoloji stack

- **Next.js 15 (App Router) + TypeScript** — kimlazım.az və İcarent.az ilə eyni.
- **Prisma + PostgreSQL** — data modeli `prisma/schema.prisma`.
- **Zod** — bütün fayl parserləri və API girişləri üçün sxem validasiyası.
- **Plain CSS / CSS Modules** — kimlazım.az yanaşması (Tailwind yox).
- Fayl parsing: `xlsx` (1C & Excel), `papaparse` (CSV) — parserlər `src/domain/ingestion/` altında olacaq (Faza 1-də qurulacaq).

---

## 5. Dizayn dili

Prototip `reference/prototype.html` faylındadır — brauzerdə aç, vizual istiqamət oradadır.
- Rənglər: navy `#14202E` + brass `#A67C2E` (Word kimliyi ilə uyğun).
- Semantik status: yaşıl `#1E6B52` = uzlaşdı, qırmızı `#A5341F` = izahsız qalıq, sarı `#9A6A12` = norma yoxlaması.
- Rəqəmlər həmişə monospace + tabular-nums (ledger dəqiqliyi).
- Dil: **UI Azərbaycan dilində.** Kod/şərhlər Azərbaycan + ingilis texniki terminlər qarışıq ola bilər.

---

## 6. Nə hazırdır / nə növbədədir

**Hazırdır (bu skafold):**
- Data modeli — `prisma/schema.prisma`
- Domain tipləri — `src/domain/`
- Uyğunsuzluq körpü mühərriki (real, tipli) — `src/domain/reconciliation/`
- Vergi qaydaları strukturu (2025 ruleset, VERIFY-bayraqlı) — `src/domain/tax-rules/`
- Təsnifat mühərriki karkası — `src/domain/classification/`
- Sənədlər — `docs/`
- Vizual prototip — `reference/prototype.html`

**Növbədə (Claude Code-da qur):**
1. ~~Next.js app skeleton (`app/`, layout).~~ ✓ Quruldu — dashboard (dövr-mərkəzli giriş) +
   `/audit/[period]` 4-mərhələli iş sahəsi (Mənbələr · Təsnifat · Uyğunsuzluq · Bəyannamə).
   Dizayn `reference/prototype.html`-dən portlanıb, real körpü mühərrikinə bağlıdır.
   Auth hələ yoxdur. Data hələ nümunədir (`src/app-data/sample.ts`).
2. Fayl ingestion parserləri (1C Excel → normalized ledger) — ən çətin hissə, kiçik başla.
3. Prisma migration + seed (nümunə şirkət/dövr).
4. Uyğunsuzluq körpülərini real dataya bağla.
5. Bəyannamə builder → export (Word/PDF).
6. Rol/icazə middleware + audit log yazımı.

---

## 7. İş qaydaları (bu layihə üçün)

- Ares-ə "Ares" deyə müraciət et, "Cavid" yox.
- Substantiv sənəd deliverable-ları `.docx` olmalıdır (PRD, hesabatlar).
- Yeni domain qərarı verəndə bu faylı (`CLAUDE.md`) yenilə.
- Legal dəyər əlavə edəndə `// VERIFY:` qoymağı unutma.
