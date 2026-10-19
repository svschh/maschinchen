# AnleitungsLog auf Netlify

Mit dieser Version liegen deine Anleitungen, Fotos und Häkchen online und sind auf jedem Gerät da, auf dem du die Seite öffnest. Geschützt wird alles durch einen Zugangscode, den nur du kennst.

## Einrichten (einmalig, ca. 10 Minuten)

1. **GitHub:** Lege auf github.com ein neues, am besten privates Repository an (z. B. `anleitungslog`).
   Lade den gesamten Inhalt dieses Ordners hoch (Button "Add file" → "Upload files", die Ordner `public` und `netlify` einfach mit hineinziehen). Die Ordnerstruktur muss so bleiben:
   - `netlify.toml`
   - `package.json`
   - `public/index.html`
   - `netlify/functions/api.mjs`
2. **Netlify:** Auf app.netlify.com "Add new project" → "Import an existing project" → GitHub wählen → dein Repository auswählen. Die Einstellungen kannst du so lassen, sie stehen in `netlify.toml`. Noch nicht auf Deploy klicken, wenn du vorher den Code setzen möchtest (Schritt 3), sonst anschließend neu deployen.
3. **Zugangscode festlegen:** Im Projekt unter "Project configuration" → "Environment variables" eine Variable `ACCESS_CODE` anlegen. Der Wert ist dein Code (lang genug, kein Wort aus dem Wörterbuch).
4. **Deploy:** Unter "Deploys" auf "Trigger deploy" → "Deploy project" klicken (nötig, damit der Code aktiv wird).
5. **Öffnen:** Netlify-Adresse aufrufen, den Zugangscode eingeben. Der Code wird pro Gerät einmal gemerkt.

## Hinweise

- Die Anleitungen aus der Version bei claude.ai werden **nicht** automatisch übernommen. Importiere sie hier neu.
- Updates der App: Neue `public/index.html` im Repository ersetzen, Netlify deployt automatisch.
- Ändert sich der Code in Netlify, fragt die App auf jedem Gerät neu danach.
- Die Seite prüft alle 45 Sekunden, ob es Änderungen von einem anderen Gerät gibt, solange sie geöffnet und sichtbar ist.
- Pro Anleitung sind bis zu 12 Fotos möglich, sie werden automatisch verkleinert.
