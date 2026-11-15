# Демо-комплект 02 (вымышленные данные)

Все компании, адреса, номера и реквизиты придуманы. На каждом документе стоит пометка SAMPLE.
Отличия от demo-01: другой бланк (русско-англо-эстонский), другой маршрут, один инвойс в евро,
коды ТН ВЭД есть в инвойсе, груз на поддонах, графу перевозчика заполнит сам перевозчик.

## Файлы

| Файл | Что это |
|---|---|
| `invoice-APF-2026-118.pdf` | Инвойс: насосы, уплотнения, рабочие колёса — 35 780,00 EUR |
| `packing-list-APF-2026-118-PL.pdf` | Упаковочный лист: 3 поддона и 1 ящик |
| `cmr-demo-02.docx` / `.pdf` | Эталон: заполненная CMR в русско-англо-эстонском табличном бланке |
| `data.json` | Данные, из которых собраны инвойс и упаковочный лист |
| `cmr-fields.json` | Карта граф бланка: номер абзаца → значение |

## Участники

| Роль | Компания |
|---|---|
| Seller (продавец, отправитель) | ANATOLIA FLOW PUMPS SAN. VE TIC. A.S., Istanbul, Türkiye |
| Buyer (покупатель) = By order of | GOLDEN DUNE TRADING FZ-LLC, Dubai, UAE |
| Consignee (грузополучатель) | "ORIENT AGRO PROCESSING" LLC, Tashkent, TIN 300000001 |
| Carrier (перевозчик) | не указан — графу заполнит перевозчик |

## Ожидаемые значения граф CMR

| Графа | Значение | Откуда |
|---|---|---|
| CMR No. | DEMO-02 | пользователь |
| 1 Sender | ANATOLIA FLOW PUMPS SAN. VE TIC. A.S. + адрес + BY ORDER OF Golden Dune Trading FZ-LLC + адрес | инвойс + вопрос By order of |
| 2 Consignee | "ORIENT AGRO PROCESSING" LLC, 45 Amir Temur Street, Tashkent 100000, Republic of Uzbekistan, TIN 300000001 | упаковочный лист / справочник |
| 3 Place of delivery | склад получателя, Tashkent, Chilanzar district, 7 Demo Street, Republic of Uzbekistan | шаблон |
| 4 Taking over | Istanbul, Türkiye, 02.12.2026 | пользователь |
| 5 Documents | Commercial Invoice № APF-2026-118 dd 24.11.2026; Packing List № APF-2026-118-PL dd 25.11.2026 | инвойс + упаковочный лист |
| 7–9 Packages, goods | CENTRIFUGAL PUMPS AND SPARE PARTS; Total: 4 packages (3 pallets, 1 wooden case) | упаковочный лист + обобщение |
| 10 HS code | 841370 / 841391 | инвойс |
| 11 Gross weight | 1325,40 kg | упаковочный лист (сумма 4 мест) |
| 12 Volume | пусто (в упаковочном листе 4,20 м³) | по практике бланка |
| 13 Sender's instructions | The place of delivery for customs clearance: Temporary storage warehouse "DEMO CARGO TERMINAL" LLC, Republic of Uzbekistan, Tashkent, 10 Sample Street, customs post 00000 | шаблон |
| 14 Payment for carriage | FCA Istanbul, Türkiye | инвойс |
| 16 Carrier | пусто | заполнит перевозчик |
| 21 Established in / on | Istanbul, Türkiye, 02.12.2026 | = графа 4 |
| 25 Vehicle | 34 TST 001 / 34 TST 002 | пользователь |

## Что проверяет комплект

- Другой бланк: нумерация и расположение граф отличаются от demo-01 (условия оплаты — графа 14).
- Коды ТН ВЭД есть в инвойсе, их два: агент берёт оба и не спрашивает.
- Места разного вида (поддоны и ящик) описаны в итоговой строке.
- Перечислены и инвойс, и упаковочный лист.
- Графа перевозчика остаётся пустой и не вызывает вопроса.

## Как пересобрать

```bash
python3 tools/make_demo_docs.py samples/demo-02/data.json
python3 tools/fill_cmr.py <пустой_бланк_ru_en_et.docx> samples/demo-02/cmr-fields.json samples/demo-02/cmr-demo-02.docx
soffice --headless --convert-to pdf --outdir samples/demo-02 samples/demo-02/cmr-demo-02.docx
```

Пустой бланк в репозиторий не входит: это рабочий бланк заказчика.
