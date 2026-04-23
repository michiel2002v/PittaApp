
1. Doel en context
De huidige Pitta Moestie Excel fungeert als historisch bestel- en betaallogboek voor wekelijkse pita‑bestellingen. Het doel van deze applicatie is om deze Excel te vervangen door een gebruiksvriendelijke, betrouwbare en schaalbare webapplicatie met:

.NET backend (API & businesslogica)
React frontend (gebruikersinterface)
Microsoft SSO voor authenticatie
Ondersteuning voor bestellen, beheer, betalingen en notificaties
De applicatie moet het volledige bestelproces stroomlijnen: van bestellen tot levering en opvolging van betalingen.


2. Scope
Binnen scope:

Beheer van bestellingen (orders)
Item- en prijsbeheer door admin
Microsoft SSO (Azure AD)
Betalingsstatus opvolgen
Automatische detectie en ranking van wanbetalers
Gebruikersvriendelijke notificatie bij aankomst van pitta (via Microsoft Teams)
Buiten scope (voor nu):

Online betalingen (bijv. Stripe, Payconiq)
Externe bestelsystemen van pitta-zaken
Mobiele native apps (iOS/Android)


3. Gebruikersrollen
3.1 Gewone gebruiker (Besteller)

Logt in via Microsoft SSO
Kan bestellingen plaatsen
Kan eigen bestelgeschiedenis bekijken
Ziet eigen betalingsstatus (betaald / openstaand)
Ontvangt notificaties wanneer pitta geleverd is
3.2 Administrator

Alles wat een gewone gebruiker kan
Beheer van items en prijzen
Overzicht van alle bestellingen
Aanpassen van betalingsstatus
Inzien van wanbetalers-ranking
Triggeren van "pitta is gearriveerd" notificatie
Roltoekenning gebeurt via Azure AD (bv. security group).


4. Functionele vereisten
4.1 Authenticatie & Autorisatie

Gebruikers moeten aanmelden via Microsoft SSO (Azure AD)
Geen lokale accounts of wachtwoorden
Gebruikers worden uniek geïdentificeerd via hun Azure AD ID
Rol (admin / user) wordt bepaald op basis van AD-claims of configuratie


4.2 Bestellen (Orders)
Een order bevat minimaal:

Besteldatum
Besteller (gekoppeld aan SSO-account)
Item (bijv. Pitta, Dürüm, Kapsalon)
Type (bijv. mix, kip, falafel, vlees)
Grootte (klein / groot)
Saus(sen)
Optionele opmerkingen (vrije tekst)
Automatisch berekend bedrag
Betalingsstatus (betaald / niet betaald)
Functioneel:

Gebruiker kan één of meerdere items bestellen per bestelmoment
Prijs wordt dynamisch berekend op basis van itemconfiguratie
gebruiker ziet bevestiging vóór submit
Bestellingen zijn na cutoff‑tijdstip niet meer wijzigbaar (configurabel)


4.3 Item- & prijsbeheer (Admin)
Admin kan:

Items aanmaken, aanpassen en deactiveren
Prijsregels instellen: Basisprijs per item
Prijs per grootte
Optionele prijsverschillen per type
Historische prijzen behouden (prijzen op oude orders mogen niet wijzigen)
Voorbeeld:

Pitta Klein: €X
Groot: €Y


4.4 Betalingen & wanbetalers

Elke order heeft een betalingsstatus
Admin kan betalingen manueel markeren
Applicatie houdt openstaande bedragen per gebruiker bij
Wanbetalers-ranking
De applicatie genereert automatisch een ranking, gebaseerd op bijvoorbeeld:

Totaal openstaand bedrag
Aantal onbetaalde orders
Tijd sinds oudste openstaande bestelling
Ranking is:

Alleen zichtbaar voor admins
Gesorteerd van "ergste" naar "minst erge" wanbetaler
Bedoeld als transparante en licht humoristische accountability 😊


4.5 Notificaties (Pitta is gearriveerd)
Wanneer de pitta geleverd is:

Admin kan met één actie aangeven: "Pitta is er"
Alle gebruikers die die dag pitta besteld hebben ontvangen een notificatie
Kanaal

Microsoft Teams notificatie (via bot, webhook of Adaptive Card)
Inhoud notificatie

Duidelijke boodschap (bv. 🥙 Pitta is gearriveerd!)
Eventueel locatie of extra info
Link naar de app
Notificatie moet:

Onmiddellijk zijn
Niet storend (geen spam)
Alleen relevant voor betrokken gebruikers


5. Niet-functionele vereisten
5.1 Architectuur

Backend: .NET (ASP.NET Core Web API)
Frontend: React (SPA)
REST of minimal APIs
Authenticatie via Azure AD / Entra ID
5.2 Data & opslag

Relationele database (bijv. SQL Server / Azure SQL / PostgreSQL)
Entiteiten: Users
Orders
OrderLines (optioneel)
Items
PriceConfigurations
Payments (of payment status)
5.3 Security

Alle endpoints beveiligd via Azure AD
Autorisatie op backend afdwingen (niet alleen frontend)
Logging van admin-acties
5.4 Gebruiksvriendelijkheid

Mobile-friendly UI
Minimale input per bestelling
Historiek overzichtelijk gegroepeerd per datum
Snelle laadtijden


6. Migatie van bestaande Excel

Eenmalige import van historische data uit Excel
Historische orders worden read-only
Naam-normalisatie waar mogelijk, maar originele data blijft bewaard


7. Open vragen / uitbreidingsideeën (niet vereist)

Automatische betaalherinneringen via Teams
Persoonlijke statistieken ("je 2024 pita‑score")
Bestel-deadline met countdown
Export naar Excel of PDF


8. Succescriteria
Het project is succesvol wanneer:

Excel niet meer nodig is voor dagelijkse werking
Iedereen eenvoudig kan bestellen via SSO
Admin overzicht heeft over bestellingen en betalingen
Mensen effectief hun pitta niet missen dankzij notificaties 😄


Dit document is bedoeld als startpunt voor analyse, backlogcreatie en technische uitwerking.
