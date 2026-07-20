# CallSafe - Anti-Betrugs Web App

Eine Progressive Web App (PWA) zum Schutz vor Telefonbetrug, speziell entwickelt für Senioren.

# Funktionen

### 1. **Nummernprüfung (Check)**
- Eingabe verdächtiger Telefonnummern
- Farbcodierte Risikoeinschätzung:
  - 🟡 GELB: Verdächtig gemeldet
  - 🔴 ROT: Bestätigter Betrug
- Klare Begründung und Kategorisierung
- Handlungsempfehlungen

### 2. **Lernbereich (Wissen)**
- 6 themenspezifische Module:
  - Enkeltrick
  - Falsche Polizisten
  - Schockanrufe
  - Bank / TAN-Betrug
  - Tech-Support Betrug
  - Gewinnspiele
- Einfache Sprache für Senioren
- Merksätze & Checklisten
- Offline verfügbar dank PWA

### 3. **Quiz & Simulationen**
- 3-5 praxisnahe Fragen pro Thema
- Sofort-Feedback nach jeder Antwort
- Realitätsnahe Szenarien
- Interaktive Lernkontrolle

### 4. **Meldefunktion**
• Verdächtige Telefonnummern können gemeldet werden 
• Einfacher Meldeprozess mit Kategorisierung 
• Beschreibung des Betrugsfalls möglich 
• Meldungen werden im Backend gespeichert 
• Gemeldete Nummern können im Admin-Bereich geprüft und verwaltet werden 
• Verlinkung zu offiziellen Meldestellen, beispielsweise zur Bundesnetzagentur

### 5. **Admin-Bereich**
• Anzeige von Statistiken zu Prüfungen, Meldungen und Quiz 
• Verwaltung von Whitelist und Blacklist 
• Prüfung und Bearbeitung eingegangener Meldungen 
• Verwaltung von Quizfragen 
• Verwaltung von Kontaktanfragen 
• Analyse der gespeicherten Meldungen 
• Vorbereitung unterschiedlicher Warntexte 

### 6. **PWA Features**
• Installierbar ohne App Store 
• Installation direkt über den Browser 
• Service Worker zum Zwischenspeichern wichtiger Dateien 
• Schnelle Aktualisierung 
• Responsive und barrierearme Bedienung 
• Grundlegende Nutzung bereits geladener Inhalte ohne Internetverbindung 
Funktionen wie Nummernprüfung, Anmeldung, Meldungen und dynamische Quizdaten benötigen eine Verbindung zum Backend.

## Installation & Nutzung


### PWA installieren

1. App im Browser öffnen
2. Bei Erscheinen des Install-Prompts auf "Installieren" klicken
3. Oder manuell über Browser-Menü → "App installieren"


## 🎨 Design-Prinzipien

- **Seniorenfreundlich:**
  - Große, klare Schriftarten (min. 18px)
  - Hoher Kontrast
  - Einfache Navigation
  - Keine überwältigenden Informationen

- **Barrierefreiheit:**
  - Klare Farbcodierung
  - Große Touch-Targets
  - Keine Zeitlimits
  - Einfache Sprache

- **Vertrauen:**
  - Warme, beruhigende Farben
  - Klare Statusmeldungen
  - Keine Panikmache
  - Positive Verstärkung



### Datenbank (Simulation)
Die Anwendung verwendet ein Backend mit Supabase zur Speicherung und Verwaltung der Daten.
 Verwendete Datenbereiche: 
 • reports – eingegangene Meldungen 
 • numbers – bekannte, verdächtige und sichere Telefonnummern 
 • Quizdaten 
 • Benutzerdaten 
 • Kontaktanfragen 




## Datenschutz

Im Browser können einzelne Daten lokal gespeichert werden, beispielsweise: 
• Authentifizierungs-Token 
• grundlegende Benutzerdaten 
• lokale Anwendungsdaten 
Für bestimmte Funktionen findet eine Kommunikation mit dem Backend statt, beispielsweise bei: 
• Nummernprüfung 
• Anmeldung 
• Meldefunktion 
• Quiz 
• Kontaktformular 
• Admin-Funktionen 
Die Anwendung verwendet keine Tracking-Tools und keine Werbe-Cookies.

## Zukünftige Erweiterungen

• Push-Benachrichtigungen bei neuen Betrugswellen 
• Spracherkennung und Sprachausgabe 
• Community-Funktionen 
• Mehrsprachigkeit 
• Export von Statistiken 
• Integration offizieller Schnittstellen 
• Erweiterte Offline-Funktionalität 
• Verbesserte Barrierefreiheit 

## Entwickler
Diese Anwendung wurde als Studienprojekt entwickelt.
Master IT-Studienprojekt von:
- Achraf Salem
- Saad Ahmito
- Ilyass Seghir



**Hinweis:** Diese App ersetzt keine offizielle Beratung. Bei Betrugsfällen kontaktieren Sie die Polizei (110) und die Bundesnetzagentur.
