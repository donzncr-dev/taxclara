# 02 — İstifadəçilər və rollar

## Administrator
İstifadəçiləri, şirkətləri, sistem parametrlərini, **vergi qaydalarını** (versiyalı), hesablama qaydalarını
və audit loglarını idarə edir.

⚠ Qayda dəyişikliyi ən təhlükəli əməliyyatdır. Qaydalar vergi ilinə görə versiyalanır — bir qaydanı
yeniləmək köhnə bəyannamələri dəyişməməlidir. Bax: `docs/04`.

## Vergi mütəxəssisi / mühasib (ACCOUNTANT) — əsas istifadəçi
- Müştəri əlavə edir
- Məlumat yükləyir
- Bəyannamə hazırlayır
- Uyğunsuzluqları yoxlayır
- Hesabatları ixrac edir

**İzolyasiya:** yalnız öz müştərilərini görür (`CompanyAssignment`). Datası serializer səviyyəsində
digər mühasibdən qorunur.

## Reviewer (REVIEWER) — senior / təsdiq
"Dörd göz" prinsipi: kiçik mühasib hazırlayır, senior təsdiqləyir.
Bəyannamə statusu: `DRAFT → REVIEW → APPROVED → READY → SUBMITTED`.

## Müştəri (CLIENT) — sonrakı faza
Ən məhdud görünüş. Yalnız görür: öz vergi öhdəliyi (rəqəm), status, tələb olunan sənədlər.
**Görmür:** təsnifat mülahizələri, izahsız qalıqlar, körpü daxili. Nə açılacağına mühasib qərar verir
(serializer filtri).

## İcazə matrisi (xülasə)

| Əməliyyat            | ADMIN | ACCOUNTANT | REVIEWER | CLIENT |
|----------------------|:-----:|:----------:|:--------:|:------:|
| Qaydaları idarə et   |  ✓    |     –      |    –     |   –    |
| Müştəri/data         |  ✓    |     ✓      |    ✓     |   –    |
| Bəyannamə hazırla    |  –    |     ✓      |    ✓     |   –    |
| Bəyannamə təsdiqlə   |  –    |     –      |    ✓     |   –    |
| Sənəd yüklə (öz)     |  –    |     –      |    –     |   ✓    |
| Öhdəliyi gör         |  ✓    |     ✓      |    ✓     |   ✓    |
