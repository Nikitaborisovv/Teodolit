# Демо-комплект 01 (вымышленные данные)

Все компании, адреса, номера и реквизиты придуманы. На каждом документе стоит пометка SAMPLE.
Комплект нужен для демонстрации заказчику и как тест для агента: из инвойсов и упаковочного
листа должна получиться CMR с такими же значениями, как в `cmr-demo-01.docx`.

## Файлы

| Файл | Что это |
|---|---|
| `invoice-NHM-2611-01.pdf` | Инвойс 1: ролики, приводы, ЗИП — 28 340,00 USD |
| `invoice-NHM-2611-02.pdf` | Инвойс 2: шкаф управления — 14 600,00 USD |
| `packing-list-NHM-2611-PL.pdf` | Один упаковочный лист на оба инвойса: 6 ящиков |
| `cmr-demo-01.docx` / `.pdf` | Эталон: заполненная CMR в русско-немецком табличном бланке |

## Участники

| Роль | Компания |
|---|---|
| Seller (продавец, отправитель) | NINGBO HARBORLIGHT MACHINERY CO., LTD., Ningbo, China |
| Buyer (покупатель) = By order of | GOLDEN DUNE TRADING FZ-LLC, Dubai, UAE |
| Consignee (грузополучатель) | "STEPPE INDUSTRIAL SYSTEMS" LLP, Almaty, BIN 990000000001 |
| Carrier (перевозчик) | SILK LINE LOGISTICS LLP, BIN 990000000002 |

Buyer ≠ Consignee: покупатель в Дубае, груз получает компания в Алматы.

## Ожидаемые значения граф CMR

| Графа | Значение | Откуда |
|---|---|---|
| CMR No. | DEMO-01/2026 | пользователь |
| 1 Sender | NINGBO HARBORLIGHT MACHINERY CO., LTD. + адрес + BY ORDER OF Golden Dune Trading FZ-LLC + адрес | инвойс + вопрос By order of |
| 2 Consignee | "STEPPE INDUSTRIAL SYSTEMS" LLP, 15 Abay Avenue, office 210, Almaty, Republic of Kazakhstan, BIN 990000000001 | упаковочный лист / справочник |
| 3 Place of delivery | Almaty, Republic of Kazakhstan | шаблон |
| 4 Taking over | Khorgos, China, 20.11.2026 | пользователь |
| 5 Documents | Invoices No.: NHM-2611-01 dated: 03.11.2026 and NHM-2611-02 dated: 03.11.2026 | оба инвойса |
| 7 Packages | TOTAL: 6 | упаковочный лист |
| 9 Nature of goods | PARTS OF CONVEYOR LINE | обобщение по инвойсам |
| 10 HS code | 84313900 | пользователь (в инвойсах кода нет) |
| 11 Gross weight | 2474,00 kg | упаковочный лист (сумма 6 ящиков) |
| 12 Volume | пусто (в упаковочном листе 7,10 м³) | по практике бланка |
| 13 Sender's instructions | Temporary storage warehouse "DEMO TERMINAL" LLP, 7 Sample Street, Almaty, 050000; Customs post code: 39800000 | шаблон |
| 15 Payment for carriage | EXW NINGBO, CHINA | инвойс |
| 16 Carrier | SILK LINE LOGISTICS LLP, BIN 990000000002 | справочник |
| 21 Established in / on | Khorgos, 20.11.2026 | = графа 4 |
| 25 Vehicle | 123ABC02 / 45DEF02 | пользователь |

## Что проверяет комплект

- Два инвойса в одной CMR: оба перечислены в графе 5.
- Один упаковочный лист на два инвойса: места и вес берутся из него, а не суммируются повторно.
- Buyer ≠ Consignee: покупатель не подставляется в графу 2.
- Место по Incoterms (EXW Ningbo) отличается от места погрузки (Khorgos), и это не ошибка.
- Кода ТН ВЭД в инвойсах нет: агент должен спросить его у пользователя.

## Как пересобрать

```bash
python3 tools/make_demo_docs.py samples/demo-01/data.json   # инвойсы и упаковочный лист (нужен Chromium)
python3 tools/fill_cmr.py <пустой_бланк.docx> samples/demo-01/cmr-fields.json samples/demo-01/cmr-demo-01.docx
soffice --headless --convert-to pdf --outdir samples/demo-01 samples/demo-01/cmr-demo-01.docx
```

Пустой бланк в репозиторий не входит: это рабочий бланк заказчика.
