# 🏆 Blind Ranking – Top 10

Ein kleines Tool, mit dem du (oder deine Community) blind eine Top-10-Liste erstellen könnt – perfekt für Blind-Ranking-Videos. Läuft direkt auf dem iPhone, keine Extra-App aus dem App Store nötig, keine Anmeldung, keine Werbung.

## Was du brauchst

- Ein iPhone
- Die kostenlose App **[Scriptable](https://apps.apple.com/app/scriptable/id1405459188)** aus dem App Store

Das war's schon. Kein Programmieren nötig, du musst nur Text kopieren und einfügen.

## Installation (2 Minuten)

1. **Scriptable** aus dem App Store herunterladen und öffnen.
2. Auf das **`+`** oben rechts tippen, um ein neues Skript zu erstellen.
3. Den kompletten Code aus [`blindranking-top10.js`](./blindranking-top10.js) kopieren (in diesem Repo) und in das leere Skript in Scriptable einfügen.
4. Das Skript umbenennen, z. B. „Blind Ranking".
5. Fertig – oben rechts auf **Play (▶)** tippen, um es zu starten.

**Tipp:** Du kannst dir das Skript auch als Icon auf den Homescreen legen (über „Zum Home-Bildschirm" in den iOS-Freigabeoptionen), dann startet es wie eine normale App.

## Wie es funktioniert

- Beim Start siehst du einen Startbildschirm. Hast du schon ein angefangenes Ranking, kannst du auf **„Fortsetzen"** tippen, sonst auf **„Neues Ranking"**.
- Du bekommst 10 nummerierte Felder (Platz 1 bis Platz 10) und trägst dort einfach ein, was du ranken willst.
- Alles wird **automatisch im Hintergrund gespeichert**, während du tippst. Du kannst die App also jederzeit einfach schließen – deine Eingaben gehen nicht verloren, beim nächsten Öffnen sind sie noch da.
- Bist du fertig, tippst du auf **„💾 Speichern & Abschließen"**, gibst dem Ranking einen Namen (z. B. den Videotitel) und es wandert ins Archiv. Danach ist Platz für ein neues Ranking.
- Über den Startbildschirm siehst du deine letzten 5 gespeicherten Rankings. Über **„🗂 Alle anzeigen"** kommst du ins komplette Archiv mit einer einfachen Suchfunktion (findet auch Begriffe innerhalb der Rankings, Groß-/Kleinschreibung ist egal).

## Wo werden die Daten gespeichert?

Alles landet in einer einzigen Datei namens `blindranking-top10.json`:

- **Mit iCloud aktiviert** (Standard): in der **Dateien-App** unter *iCloud Drive → Scriptable*. Die Daten synchronisieren dann sogar zwischen deinen Geräten und bleiben auch bei einer Neuinstallation der App erhalten.
- **Ohne iCloud**: lokal auf dem Gerät unter *Dateien-App → Auf meinem iPhone → Scriptable*.

Es ist reines JSON, du kannst die Datei bei Bedarf also auch einsehen, sichern oder von Hand bearbeiten.

## Getestet auf

- iPhone 14 Pro, iOS
- Sollte auf allen iPhones laufen, die eine aktuelle iOS-Version unterstützen (Scriptable selbst gibt die genauen Mindestanforderungen im App Store an).

## Android?

Scriptable gibt es nur für iOS, daher läuft dieses Skript **so nicht auf Android**. Die Oberfläche selbst ist aber ganz normales HTML/CSS/JavaScript – nur das Speichern und Anzeigen als Widget nutzt iOS-spezifische Scriptable-Funktionen. Wer auf Android etwas Ähnliches bauen möchte, könnte sich nach einer App umsehen, die HTML-Seiten mit lokalem Speicherzugriff ausführen kann (z. B. Automatisierungs- oder Skript-Apps für Android), und den HTML-Teil des Codes als Ausgangspunkt nehmen. Läuft aber nicht „out of the box".

## Lizenz / Nutzung

Frei zur privaten Nutzung. Gerne für eigene Videos, Streams oder Community-Aktionen verwenden – bei Weitergabe würde ich mich über einen Verweis auf dieses Repo freuen.
