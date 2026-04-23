# Feature: Pitta Moestie App — MVP

> SSDLC Phase: Analysis
> Feature ID: `F-002` | File: `docs/features/002-PittaMoestieApp.md`

---

## Feature Summary

| Field                  | Value                                                      |
|------------------------|------------------------------------------------------------|
| Feature ID             | `F-002`                                                    |
| Feature name           | Pitta Moestie App — MVP                                    |
| File                   | `docs/features/002-PittaMoestieApp.md`                     |
| Author / Owner         | Michiel Vandromme                                          |
| Security Champion      | TBD                                                        |
| Status                 | Draft                                                      |
| Sprint / Milestone     | MVP                                                        |

---

## Problem Statement

De huidige pitta-bestelworkflow draait op een Excel-bestand dat Mathijs handmatig bijhoudt. Dit leidt tot:

- **Foutgevoelig bestelbeheer**: bestellingen, prijzen en betalingen worden manueel bijgehouden
- **Geen real-time inzicht**: gebruikers weten niet of ze nog openstaande schuld hebben
- **Tijdrovend voor de admin**: Mathijs betaalt alle pitta's voor en moet individuele betalingen manueel opvolgen via rekeninguittreksels
- **Geen afdwinging van besteltermijnen**: iedereen kan op elk moment bestellen of wijzigen

De applicatie vervangt de Excel door een webapplicatie die het volledige bestelproces stroomlijnt: van bestellen tot betalingsopvolging.

---

## Solution

Een gecontaineriseerde webapplicatie (.NET backend + React frontend + PostgreSQL) met Microsoft SSO authenticatie. De app ondersteunt:

1. **Bestellen**: gebruikers plaatsen bestellingen op configureerbare weekdagen tot een cutoff-uur
2. **Itembeheer**: admin configureert items met types, groottes, sauzen en prijzen
3. **Ledger-model**: elke gebruiker heeft een lopend saldo — orders verhogen schuld, betalingen verlagen schuld
4. **CSV-betaalimport**: admin uploadt KBC rekeninguittreksels (CSV), het systeem herkent pittabetalingen via IBAN-match + "PIT(T)A" in de mededeling
5. **Wanbetalers-ranking**: admin ziet een overzicht van gebruikers gesorteerd op openstaand saldo

---

## User Stories

### Authenticatie & Profiel

1. As a **user**, I want to log in via Microsoft SSO, so that I don't need a separate account or password.
2. As a **user**, I want to register my IBAN (BE-formaat) at first login, so that my bank payments can be matched automatically.
3. As a **user**, I want to update my IBAN in my profile settings, so that I can correct it if needed.
4. As an **admin**, I want to override a user's IBAN, so that I can fix incorrect registrations.
5. As a **user**, I want IBAN validation (MOD-97 checksum), so that I cannot save an invalid bank account number.
6. As the **system**, I want to enforce unique IBANs across users, so that payments are never attributed to the wrong person.

### Bestellen

7. As a **user**, I want to see which days ordering is open and until what time, so that I know when I can place my order.
8. As a **user**, I want to place an order by selecting item, type, size, sauce(s), and optional remarks, so that I get exactly what I want.
9. As a **user**, I want to add multiple order lines in a single order, so that I can order a pitta and a kapsalon together.
10. As a **user**, I want to see the calculated price per order line and total before submitting, so that I know what I'll owe.
11. As a **user**, I want to modify or cancel my order before the cutoff time, so that I can change my mind.
12. As a **user**, I want my order to become read-only after the cutoff time, so that the admin can finalize the order to the pitta shop.
13. As an **admin**, I want to modify any order at any time (including after cutoff), so that I can fix mistakes.
14. As a **user**, I want to see my order history grouped by date, so that I can review past orders.

### Bestelronde-configuratie

15. As an **admin**, I want to configure per weekday whether ordering is allowed (checkbox), so that I control which days pitta is available.
16. As an **admin**, I want to set a cutoff time per enabled weekday, so that orders are locked after that hour.
17. As the **system**, I want to enforce the cutoff: no new orders or modifications after the cutoff time on that day, so that the admin has a stable order list.
18. As the **system**, I want to fix (snapshot) all order line prices at cutoff, so that later price changes don't affect closed rounds.

### Item- & Prijsbeheer

19. As an **admin**, I want to create menu items (e.g., Pitta, Dürüm, Kapsalon), so that users can choose from the available offerings.
20. As an **admin**, I want to add types per item (e.g., kip, falafel, vlees, mix), so that the menu reflects the pitta shop's options.
21. As an **admin**, I want to set sizes per item-type combination (e.g., klein, groot) with a specific price, so that the price hierarchy Item → Type → Size → Price is complete.
22. As an **admin**, I want to deactivate items, types, or sizes without deleting them, so that they no longer appear for new orders but historical orders are preserved.
23. As an **admin**, I want to update prices, so that the menu stays current. Price changes take effect in open order rounds; closed rounds keep their fixed prices.
24. As an **admin**, I want to manage a list of sauces (create/deactivate), so that users can select from a predefined list. Sauces are informational only — no price impact.

### Betalingen & CSV-import

25. As an **admin**, I want to upload a KBC CSV file (semicolon-separated, Belgian format), so that bank payments are imported into the system.
26. As the **system**, I want to reject a CSV upload if a file with the same filename was already imported, so that duplicate imports are impossible.
27. As the **system**, I want to parse the CSV and identify pitta payments by matching: (a) `Rekening tegenpartij` (IBAN) matches a registered user, AND (b) `vrije mededeling` contains "PITA" or "PITTA" (case-insensitive, regex `PIT{1,2}A`), so that payments are automatically recognized.
28. As the **system**, I want to extract the `Bedrag` (credit, positive amounts only) and apply it as a credit to the matched user's ledger, so that their debt decreases.
29. As an **admin**, I want to see the import result after upload: X payments matched, Y skipped (unmatched IBAN or no PITTA mededeling), so that I have transparency.
30. As the **system**, I want to show unmatched-but-PITTA-containing rows in the import result (IBAN + bedrag + datum), so that the admin knows someone needs to register their IBAN.
31. As an **admin**, I want to manually adjust a user's balance (add credit or debit with a reason), so that I can handle edge cases.

### Saldo & Wanbetalers

32. As a **user**, I want to see my current balance (positive = debt, negative = credit), so that I know how much I owe or have in credit.
33. As a **user**, I want my balance to automatically account for credit (overpayments roll over to future orders), so that small overpayments don't require refunds.
34. As an **admin**, I want to see a "wanbetalers" ranking: all users sorted by outstanding balance descending, so that I know who owes the most.
35. As an **admin**, I want the ranking to also show the number of unpaid order rounds and the date of the oldest outstanding debt per user, so that I have context beyond just the amount.
36. As a **user**, I want the wanbetalers ranking to be visible only to admins, so that my balance is not publicly shamed (unless I'm the worst offender 😊).

### Admin Dashboard

37. As an **admin**, I want an overview of all orders for a given date/round, so that I can compile the order for the pitta shop.
38. As an **admin**, I want to see all users with their current balance, so that I have a financial overview.
39. As an **admin**, I want to see a history of all CSV imports (filename, date, results), so that I can track what was imported.

---

## Implementation Decisions

### Architecture

- **Containerized**: Docker containers for backend, frontend, and PostgreSQL (local dev via `docker-compose`)
- **Backend**: ASP.NET Core Web API (.NET), REST endpoints
- **Frontend**: React SPA
- **Database**: PostgreSQL with `timestamptz` for all timestamps
- **Auth**: Microsoft Entra ID (Azure AD) SSO — roles via security group
- **Timezone**: All times stored as UTC internally, displayed as Europe/Brussels in the UI

### Modules

| Module | Responsibility |
|---|---|
| **Auth & User Profile** | Azure AD SSO integration, IBAN registration (MOD-97 validation, unique constraint), role resolution (admin/user via AD security group) |
| **Item Catalog** | CRUD for items, types, sizes, sauces. Price hierarchy: Item → Type → Size → Price. Soft-delete (deactivate). Sauces are informational, no price impact |
| **Order Engine** | Weekday/cutoff configuration per day. Order placement with multiple order lines. Cutoff enforcement (read-only after cutoff for users, admin can always edit). Price snapshot at cutoff: `unit_price` on OrderLine is mutable while round is open, fixed at cutoff |
| **Ledger** | Per-user running balance. Orders add debits, payments add credits. Balance can go negative (credit/tegoed). Simple interface: `getBalance()`, `addDebit()`, `addCredit()` |
| **CSV Import** | Parse KBC CSV (semicolon-separated, Belgian decimal format with comma). Match rows where: IBAN in `Rekening tegenpartij` matches a registered user AND `vrije mededeling` matches regex `PIT{1,2}A` (case-insensitive). Only positive amounts (credit). Deduplicate by filename (reject if already imported). Report: matched count, skipped count, unmatched-with-PITTA rows |
| **Ranking** | Query: users ordered by outstanding balance DESC, with count of unpaid rounds and oldest debt date. Admin-only |
| **Admin Dashboard** | Composition of other modules: order overview per round, user balances, import history |

### Data Model (PostgreSQL)

**Users**
- `id` (UUID, PK)
- `azure_ad_id` (unique)
- `display_name`
- `email`
- `iban` (unique, nullable — required at first use)
- `is_admin` (boolean, derived from AD group)
- `created_at` (timestamptz)

**Items**
- `id` (UUID, PK)
- `name` (e.g., Pitta, Dürüm, Kapsalon)
- `is_active` (boolean)

**ItemTypes**
- `id` (UUID, PK)
- `item_id` (FK → Items)
- `name` (e.g., kip, falafel, vlees, mix)
- `is_active` (boolean)

**ItemSizes**
- `id` (UUID, PK)
- `item_type_id` (FK → ItemTypes)
- `name` (e.g., klein, groot)
- `price` (decimal)
- `is_active` (boolean)

**Sauces**
- `id` (UUID, PK)
- `name`
- `is_active` (boolean)

**OrderRoundConfig**
- `id` (UUID, PK)
- `day_of_week` (0–6)
- `is_enabled` (boolean)
- `cutoff_time` (time, Europe/Brussels)

**Orders**
- `id` (UUID, PK)
- `user_id` (FK → Users)
- `order_date` (date)
- `created_at` (timestamptz)
- `is_locked` (boolean — set true at cutoff)

**OrderLines**
- `id` (UUID, PK)
- `order_id` (FK → Orders)
- `item_size_id` (FK → ItemSizes)
- `unit_price` (decimal — snapshot, fixed at cutoff)
- `remarks` (text, nullable)

**OrderLineSauces**
- `order_line_id` (FK → OrderLines)
- `sauce_id` (FK → Sauces)

**LedgerEntries**
- `id` (UUID, PK)
- `user_id` (FK → Users)
- `amount` (decimal — positive = debit/schuld, negative = credit)
- `entry_type` (enum: `order`, `payment`, `manual_adjustment`)
- `description` (text)
- `reference_id` (nullable — FK to order or import)
- `created_at` (timestamptz)

**CsvImports**
- `id` (UUID, PK)
- `filename` (unique)
- `uploaded_by` (FK → Users)
- `uploaded_at` (timestamptz)
- `matched_count` (int)
- `skipped_count` (int)

**BankTransactions** (parsed rows from CSV)
- `id` (UUID, PK)
- `csv_import_id` (FK → CsvImports)
- `transaction_date` (date)
- `amount` (decimal)
- `counterparty_iban` (text)
- `counterparty_name` (text)
- `free_message` (text)
- `matched_user_id` (FK → Users, nullable)
- `is_pitta_payment` (boolean)

### KBC CSV Format

```
Rekeningnummer;Rubrieknaam;Naam;Munt;Afschriftnummer;Datum;Omschrijving;Valuta;Bedrag;Saldo;Credit;Debet;Rekening tegenpartij;BIC code tegenpartij;Naam tegenpartij;Adres tegenpartij;gestructureerde mededeling;vrije mededeling
```

- Semicolon-separated
- Belgian decimal format (comma as decimal separator)
- Relevant columns: `Datum`, `Bedrag` (or `Credit`), `Rekening tegenpartij`, `vrije mededeling`
- Only rows with positive `Credit` value are considered as incoming payments
- IBAN in CSV may contain spaces (e.g., `BE46 7360 4739 1436`) — normalize by stripping spaces before matching

### Price Fixation Logic

- While an order round is open (before cutoff): `OrderLine.unit_price` reflects the current `ItemSizes.price` and updates if the admin changes the price
- At cutoff: `Order.is_locked = true`, `OrderLine.unit_price` becomes immutable
- New orders in future rounds use the latest configured price

---

## Testing Decisions

### What makes a good test

Tests verify **external behavior through the module's public interface**, not implementation details. A good test:
- Sets up a realistic scenario
- Calls the public API of the module
- Asserts on the observable outcome (return value, database state, error response)
- Does not mock internals or assert on private method calls

### Modules to test

| Module | Test Focus |
|---|---|
| **Item Catalog** | Price hierarchy CRUD, soft-delete behavior, price retrieval for a given item-type-size combination |
| **Order Engine** | Cutoff enforcement (before/after), order modification rules, price snapshot at cutoff, multiple order lines |
| **Ledger** | Balance calculation, debit from orders, credit from payments, negative balance (tegoed), manual adjustments |
| **CSV Import** | KBC CSV parsing (semicolon, Belgian decimals, IBAN normalization), PIT(T)A regex matching (case-insensitive), filename deduplication, matched vs. unmatched reporting |

---

## Out of Scope

- **Notificaties** (Teams webhook "pitta is gearriveerd") — later feature
- **Online betalingen** (Stripe, Payconiq) — not planned
- **Externe bestelsystemen** van pitta-zaken
- **Mobiele native apps** (iOS/Android) — responsive web is sufficient
- **Historische Excel-import** — clean start, no migration of old data
- **Automatische betaalherinneringen**
- **Persoonlijke statistieken** ("je 2024 pitta-score")
- **Bestel-deadline countdown**
- **Export naar Excel of PDF**
- **Manuele toewijzing van onbekende betalingen** — admin vertelt de persoon om zijn IBAN te registreren
- **Kubernetes deployment** — Docker first, Kubernetes later

---

## Further Notes

- **Penningmeester-model**: Mathijs (admin) betaalt alle pitta's voor bij de pittazaak. Collega's betalen hem terug via overschrijving. De CSV is Mathijs' eigen rekeninguitreksel waarop inkomende betalingen van collega's verschijnen.
- **Admin overdraagbaarheid**: admin rol wordt beheerd via Azure AD security group, zodat een vervanger (bijv. bij vakantie) eenvoudig aangeduid kan worden zonder code-aanpassing.
- **Wanbetalers-ranking**: bewust licht humoristisch — het is een tool voor transparante accountability, geen shaming.
- **IBAN als koppeling**: de IBAN in het gebruikersprofiel is de single source of truth voor betaalmatching. Gebruikers vullen dit in bij eerste login (onboarding stap).
- **Belgische conventies**: alle bedragen in EUR, decimaalteken is komma in CSV maar standaard dot-notatie in de backend/database.
