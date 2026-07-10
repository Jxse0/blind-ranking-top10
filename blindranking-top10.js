// Blind Ranking – Top 10
// Scriptable-Script mit Startbildschirm (Fortsetzen / Neues Ranking),
// Archiv mit Suche und automatischem Speichern.

const COLORS = [
  "#E63946", "#F3722C", "#F8961E", "#F9C74F", "#90BE6D",
  "#43AA8B", "#4D908E", "#577590", "#6A4C93", "#B5179E",
];
const FILE_NAME = "blindranking-top10.json";

// iCloud bevorzugen, sonst lokal speichern
let fm;
try { fm = FileManager.iCloud(); } catch (e) { fm = FileManager.local(); }
const filePath = fm.joinPath(fm.documentsDirectory(), FILE_NAME);

function emptyState() {
  return { current: new Array(10).fill(""), archive: [] };
}

async function loadState() {
  let state = emptyState();
  if (fm.fileExists(filePath)) {
    try {
      if (fm.isFileStoredIniCloud(filePath)) {
        await fm.downloadFileFromiCloud(filePath);
      }
      const parsed = JSON.parse(fm.readString(filePath));
      if (Array.isArray(parsed) && parsed.length === 10) {
        // Altes Format (nur ein Array) -> migrieren
        state.current = parsed;
      } else if (parsed && Array.isArray(parsed.current)) {
        state.current = parsed.current.length === 10 ? parsed.current : state.current;
        state.archive = Array.isArray(parsed.archive) ? parsed.archive : [];
      }
    } catch (e) { /* Datei kaputt oder leer – frisch starten */ }
  }
  return state;
}

function saveState(state) {
  fm.writeString(filePath, JSON.stringify(state));
}

// ---------------------------------------------------------------
// App-Ansicht (HTML im WebView)
// ---------------------------------------------------------------
async function runApp() {
  const state = await loadState();
  const initialJSON = JSON.stringify(state).replace(/</g, "\\u003c");

  const html = `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<style>
  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  body {
    margin: 0;
    background: #15151c;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    color: #f4f4f8;
    padding: 28px 16px 48px;
  }
  .wrap { max-width: 560px; margin: 0 auto; }
  .eyebrow {
    margin: 0;
    font-size: 12px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #7c7c8a;
    font-weight: 600;
  }
  h1 { margin: 6px 0 0; font-size: 30px; line-height: 1.1; font-weight: 800; }
  .status { margin: 8px 0 24px; font-size: 14px; color: #9a9aa8; }
  .row {
    display: flex;
    align-items: center;
    gap: 12px;
    background: #1f1f29;
    border: 1px solid #2c2c38;
    border-radius: 14px;
    padding: 8px;
    margin-bottom: 10px;
    transition: border-color 0.2s ease;
  }
  .badge {
    flex: 0 0 auto;
    width: 44px;
    height: 44px;
    border-radius: 11px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 18px;
    color: #fff;
  }
  input {
    flex: 1;
    min-width: 0;
    background: transparent;
    border: none;
    outline: none;
    color: #f4f4f8;
    font-size: 16px;
    padding: 10px 4px;
  }
  input::placeholder { color: #55555f; }
  .clear-one {
    flex: 0 0 auto;
    width: 34px;
    height: 34px;
    border: none;
    border-radius: 9px;
    background: #2a2a35;
    color: #9a9aa8;
    font-size: 16px;
    line-height: 1;
    display: none;
    align-items: center;
    justify-content: center;
  }
  .row.filled .clear-one { display: flex; }

  .btn {
    width: 100%;
    padding: 15px;
    border-radius: 12px;
    border: 1px solid #34343f;
    background: #26262f;
    color: #f4f4f8;
    font-size: 15px;
    font-weight: 700;
    margin-top: 10px;
  }
  .btn:active { background: #30303b; }
  .btn.primary {
    border: none;
    background: #43AA8B;
    color: #0d1512;
  }
  .btn.primary:active { background: #3a9379; }
  .btn.accent {
    border: none;
    background: #577590;
    color: #fff;
  }
  .btn.danger-text { color: #E63946; }
  .btn.small {
    width: auto;
    padding: 10px 16px;
    font-size: 14px;
    margin-top: 0;
  }
  .toolbar { display: flex; gap: 10px; margin-bottom: 20px; }

  .search-box {
    display: flex;
    align-items: center;
    gap: 10px;
    background: #1f1f29;
    border: 1px solid #2c2c38;
    border-radius: 12px;
    padding: 4px 14px;
    margin-bottom: 16px;
  }
  .search-box .icon { color: #55555f; font-size: 15px; flex: 0 0 auto; }

  .archive-item {
    display: flex;
    align-items: center;
    gap: 12px;
    background: #1f1f29;
    border: 1px solid #2c2c38;
    border-radius: 14px;
    padding: 14px;
    margin-bottom: 10px;
  }
  .archive-item .info { flex: 1; min-width: 0; }
  .archive-item .name {
    font-size: 16px;
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .archive-item .meta { font-size: 12px; color: #7c7c8a; margin-top: 2px; }
  .archive-item .del {
    flex: 0 0 auto;
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 9px;
    background: #2a2a35;
    color: #E63946;
    font-size: 16px;
  }
  .empty-note { color: #55555f; font-size: 14px; margin-top: 20px; text-align: center; }

  .view-row {
    display: flex;
    align-items: center;
    gap: 12px;
    background: #1f1f29;
    border: 1px solid #2c2c38;
    border-radius: 14px;
    padding: 10px 12px;
    margin-bottom: 8px;
  }
  .view-row .txt { font-size: 15px; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .view-row .txt.empty { color: #4a4a55; }
  .view-row .badge { width: 36px; height: 36px; font-size: 15px; border-radius: 9px; }

  /* Eigene Dialoge (native alert/confirm/prompt gehen in Scriptable nicht) */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    padding: 24px;
  }
  .modal-box {
    background: #1f1f29;
    border: 1px solid #2c2c38;
    border-radius: 16px;
    padding: 22px;
    max-width: 340px;
    width: 100%;
  }
  .modal-box p { margin: 0 0 16px; font-size: 16px; line-height: 1.35; }
  .modal-box input.modal-input {
    width: 100%;
    background: #15151c;
    border: 1px solid #34343f;
    border-radius: 10px;
    padding: 12px;
    font-size: 16px;
    color: #f4f4f8;
    margin-bottom: 16px;
  }
  .modal-btns { display: flex; gap: 10px; }
  .modal-btns button {
    flex: 1;
    padding: 12px;
    border-radius: 10px;
    font-size: 15px;
  }
  .modal-cancel {
    border: 1px solid #34343f;
    background: #26262f;
    color: #f4f4f8;
    font-weight: 600;
  }
  .modal-ok {
    border: none;
    background: #43AA8B;
    color: #0d1512;
    font-weight: 700;
  }
  .modal-ok.red { background: #E63946; color: #fff; }
</style>
</head>
<body>
<div class="wrap" id="app"></div>
<script>
  const COLORS = ${JSON.stringify(COLORS)};
  let state = ${initialJSON};
  let timer = null;
  const HOME_LIMIT = 5; // Startbildschirm zeigt max. 5 Rankings

  // ---------- Speichern via versteckten iframe ----------
  function push() {
    const data = encodeURIComponent(JSON.stringify(state));
    let iframe = document.getElementById("save-frame");
    if (!iframe) {
      iframe = document.createElement("iframe");
      iframe.id = "save-frame";
      iframe.style.display = "none";
      document.body.appendChild(iframe);
    }
    iframe.src = "scriptable://save?data=" + data;
  }

  function scheduleSave(afterSave) {
    clearTimeout(timer);
    timer = setTimeout(() => { push(); if (afterSave) afterSave(); }, 300);
  }

  // ---------- Hilfsfunktionen ----------
  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function filledCount(values) {
    return values.filter(v => v && v.trim() !== "").length;
  }

  function textColorFor(i) {
    return i === 3 ? "#1b1b22" : "#fff";
  }

  function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }) +
      ", " + d.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
  }

  function sortedArchive() {
    return state.archive.slice().sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  }

  // ---------- Eigene Dialoge ----------
  function buildModal(contentBuilder) {
    return new Promise(resolve => {
      const overlay = el("div", "modal-overlay");
      const box = el("div", "modal-box");
      const close = (result) => { overlay.remove(); resolve(result); };
      contentBuilder(box, close);
      overlay.addEventListener("click", (e) => { if (e.target === overlay) close(null); });
      overlay.appendChild(box);
      document.body.appendChild(overlay);
    });
  }

  function customConfirm(message, okLabel, red) {
    return buildModal((box, close) => {
      box.appendChild(el("p", null, message));
      const btns = el("div", "modal-btns");
      const cancel = el("button", "modal-cancel", "Abbrechen");
      const ok = el("button", "modal-ok" + (red ? " red" : ""), okLabel || "OK");
      cancel.addEventListener("click", () => close(false));
      ok.addEventListener("click", () => close(true));
      btns.appendChild(cancel);
      btns.appendChild(ok);
      box.appendChild(btns);
    });
  }

  function customPrompt(message, defaultValue) {
    return buildModal((box, close) => {
      box.appendChild(el("p", null, message));
      const input = el("input", "modal-input");
      input.type = "text";
      input.value = defaultValue || "";
      input.autocomplete = "off";
      const btns = el("div", "modal-btns");
      const cancel = el("button", "modal-cancel", "Abbrechen");
      const ok = el("button", "modal-ok", "Speichern");
      cancel.addEventListener("click", () => close(null));
      ok.addEventListener("click", () => close(input.value));
      btns.appendChild(cancel);
      btns.appendChild(ok);
      box.appendChild(input);
      box.appendChild(btns);
      setTimeout(() => { input.focus(); input.select(); }, 50);
    });
  }

  // ---------- Views ----------
  const app = document.getElementById("app");

  function render(view, arg, arg2) {
    app.innerHTML = "";
    window.scrollTo(0, 0);
    if (view === "home") renderHome();
    else if (view === "ranking") renderRanking();
    else if (view === "archive") renderArchive(arg); // arg = Suchbegriff
    else if (view === "archiveView") renderArchiveView(arg, arg2); // arg2 = Herkunft
  }

  // ---------- Archiv-Eintrag als Listenelement ----------
  function archiveItem(game, origin, searchQuery) {
    const item = el("div", "archive-item");
    const info = el("div", "info");
    info.appendChild(el("div", "name", game.title || "Ohne Titel"));
    info.appendChild(el("div", "meta",
      formatDate(game.date) + " · " + filledCount(game.values) + "/10"));
    info.addEventListener("click", () => render("archiveView", game.id, { origin, searchQuery }));

    const del = el("button", "del", "✕");
    del.addEventListener("click", async (e) => {
      e.stopPropagation();
      const ok = await customConfirm(
        '"' + (game.title || "Ohne Titel") + '" wirklich löschen?', "Löschen", true);
      if (!ok) return;
      state.archive = state.archive.filter(g => g.id !== game.id);
      push();
      render(origin, origin === "archive" ? searchQuery : undefined);
    });

    item.appendChild(info);
    item.appendChild(del);
    return item;
  }

  // --- Startbildschirm ---
  function renderHome() {
    app.appendChild(el("p", "eyebrow", "Blind Ranking"));
    app.appendChild(el("h1", null, "Top 10"));

    const hasCurrent = filledCount(state.current) > 0;
    const status = el("p", "status",
      hasCurrent
        ? "Angefangenes Ranking: " + filledCount(state.current) + " von 10 ausgefüllt"
        : "Kein angefangenes Ranking");
    app.appendChild(status);

    if (hasCurrent) {
      const cont = el("button", "btn primary", "▶  Fortsetzen");
      cont.addEventListener("click", () => render("ranking"));
      app.appendChild(cont);
    }

    const fresh = el("button", "btn" + (hasCurrent ? "" : " primary"), "＋  Neues Ranking");
    fresh.addEventListener("click", async () => {
      if (hasCurrent) {
        const ok = await customConfirm(
          "Es gibt ein angefangenes Ranking. Neues Ranking starten und das alte verwerfen?",
          "Verwerfen", true);
        if (!ok) return;
      }
      state.current = new Array(10).fill("");
      push();
      render("ranking");
    });
    app.appendChild(fresh);

    // Letzte Rankings (max. 5)
    const archTitle = el("p", "eyebrow", "Letzte Rankings");
    archTitle.style.marginTop = "32px";
    app.appendChild(archTitle);

    if (state.archive.length === 0) {
      app.appendChild(el("p", "empty-note", "Noch keine gespeicherten Rankings."));
    } else {
      const recent = sortedArchive().slice(0, HOME_LIMIT);
      recent.forEach(game => app.appendChild(archiveItem(game, "home")));

      if (state.archive.length > HOME_LIMIT) {
        const more = el("button", "btn",
          "🗂  Alle anzeigen (" + state.archive.length + ")");
        more.addEventListener("click", () => render("archive"));
        app.appendChild(more);
      }
    }
  }

  // --- Archiv mit Suche ---
  function renderArchive(searchQuery) {
    const toolbar = el("div", "toolbar");
    const back = el("button", "btn small", "‹ Zurück");
    back.addEventListener("click", () => render("home"));
    toolbar.appendChild(back);
    app.appendChild(toolbar);

    app.appendChild(el("p", "eyebrow", "Archiv"));
    app.appendChild(el("h1", null, "Alle Rankings"));

    const count = el("p", "status");
    app.appendChild(count);

    // Suchfeld
    const searchBox = el("div", "search-box");
    searchBox.appendChild(el("span", "icon", "🔍"));
    const search = document.createElement("input");
    search.type = "text";
    search.placeholder = "Suchen …";
    search.autocomplete = "off";
    search.value = searchQuery || "";
    searchBox.appendChild(search);
    app.appendChild(searchBox);

    const list = el("div");
    app.appendChild(list);

    function refresh() {
      list.innerHTML = "";
      const q = search.value.trim().toLowerCase();
      // Case-insensitive Suche in Titel und Einträgen
      const results = sortedArchive().filter(game => {
        if (!q) return true;
        if ((game.title || "").toLowerCase().includes(q)) return true;
        return game.values.some(v => (v || "").toLowerCase().includes(q));
      });

      count.textContent = q
        ? results.length + " Treffer"
        : state.archive.length + " gespeicherte Rankings";

      if (results.length === 0) {
        list.appendChild(el("p", "empty-note",
          q ? "Keine Treffer für \\"" + search.value.trim() + "\\"." : "Noch keine gespeicherten Rankings."));
        return;
      }
      results.forEach(game => list.appendChild(archiveItem(game, "archive", search.value)));
    }

    search.addEventListener("input", refresh);
    refresh();
  }

  // --- Ranking bearbeiten ---
  function renderRanking() {
    const toolbar = el("div", "toolbar");
    const back = el("button", "btn small", "‹ Zurück");
    back.addEventListener("click", () => { push(); render("home"); });
    toolbar.appendChild(back);
    app.appendChild(toolbar);

    app.appendChild(el("p", "eyebrow", "Blind Ranking"));
    app.appendChild(el("h1", null, "Deine Top 10"));
    const status = el("p", "status");
    status.id = "status";
    app.appendChild(status);

    const rowsEl = el("div");
    rowsEl.id = "rows";
    app.appendChild(rowsEl);

    function setStatus(saving) {
      status.textContent = saving
        ? "Speichert …"
        : filledCount(state.current) + " von 10 ausgefüllt · gespeichert ✓";
    }

    function refreshRow(i, value) {
      const row = document.getElementById("row" + i);
      const filled = value.trim() !== "";
      row.classList.toggle("filled", filled);
      row.style.borderColor = filled ? COLORS[i] : "#2c2c38";
    }

    for (let i = 0; i < 10; i++) {
      const row = el("div", "row");
      row.id = "row" + i;

      const badge = el("div", "badge", String(i + 1));
      badge.style.background = COLORS[i];
      badge.style.color = textColorFor(i);
      badge.style.boxShadow = "0 4px 14px " + COLORS[i] + "40";

      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = "Platz " + (i + 1);
      input.value = state.current[i] || "";
      input.autocomplete = "off";
      input.addEventListener("input", () => {
        state.current[i] = input.value;
        refreshRow(i, input.value);
        setStatus(true);
        scheduleSave(() => setStatus(false));
      });

      const clear = el("button", "clear-one", "✕");
      clear.addEventListener("click", () => {
        state.current[i] = "";
        input.value = "";
        refreshRow(i, "");
        setStatus(true);
        scheduleSave(() => setStatus(false));
      });

      row.appendChild(badge);
      row.appendChild(input);
      row.appendChild(clear);
      rowsEl.appendChild(row);
      refreshRow(i, state.current[i] || "");
    }

    // Speichern (ins Archiv)
    const save = el("button", "btn primary", "💾  Speichern & Abschließen");
    save.addEventListener("click", async () => {
      if (filledCount(state.current) === 0) {
        await customConfirm("Das Ranking ist noch leer – es gibt nichts zu speichern.", "OK");
        return;
      }
      const defaultTitle = "Ranking vom " + new Date().toLocaleDateString("de-DE");
      const title = await customPrompt("Name für dieses Ranking:", defaultTitle);
      if (title === null) return;
      state.archive.push({
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        title: title.trim() || defaultTitle,
        date: new Date().toISOString(),
        values: state.current.slice(),
      });
      state.current = new Array(10).fill("");
      push();
      render("home");
    });
    app.appendChild(save);

    // Alles leeren
    const clearAll = el("button", "btn danger-text", "Alles leeren");
    clearAll.addEventListener("click", async () => {
      const ok = await customConfirm("Wirklich alle 10 Plätze leeren?", "Leeren", true);
      if (!ok) return;
      state.current = new Array(10).fill("");
      document.querySelectorAll("#rows input").forEach(el => { el.value = ""; });
      for (let i = 0; i < 10; i++) refreshRow(i, "");
      setStatus(false);
      push();
    });
    app.appendChild(clearAll);

    setStatus(false);
  }

  // --- Gespeichertes Ranking ansehen ---
  function renderArchiveView(id, from) {
    const origin = (from && from.origin) || "home";
    const searchQuery = from && from.searchQuery;
    const goBack = () => render(origin, origin === "archive" ? searchQuery : undefined);

    const game = state.archive.find(g => g.id === id);
    if (!game) { goBack(); return; }

    const toolbar = el("div", "toolbar");
    const back = el("button", "btn small", "‹ Zurück");
    back.addEventListener("click", goBack);
    toolbar.appendChild(back);
    app.appendChild(toolbar);

    app.appendChild(el("p", "eyebrow", "Gespeichertes Ranking"));
    app.appendChild(el("h1", null, game.title || "Ohne Titel"));
    app.appendChild(el("p", "status", formatDate(game.date)));

    for (let i = 0; i < 10; i++) {
      const row = el("div", "view-row");
      const badge = el("div", "badge", String(i + 1));
      badge.style.background = COLORS[i];
      badge.style.color = textColorFor(i);
      const value = (game.values[i] || "").trim();
      const txt = el("div", "txt" + (value ? "" : " empty"), value || "—");
      row.appendChild(badge);
      row.appendChild(txt);
      app.appendChild(row);
    }

    // Wieder aufnehmen: Ranking zurück in die Bearbeitung holen
    const resume = el("button", "btn accent", "✎  Weiter bearbeiten");
    resume.addEventListener("click", async () => {
      if (filledCount(state.current) > 0) {
        const ok = await customConfirm(
          "Das angefangene Ranking wird dabei verworfen. Fortfahren?", "Fortfahren", true);
        if (!ok) return;
      }
      state.current = game.values.slice();
      state.archive = state.archive.filter(g => g.id !== game.id);
      push();
      render("ranking");
    });
    app.appendChild(resume);

    const del = el("button", "btn danger-text", "Löschen");
    del.addEventListener("click", async () => {
      const ok = await customConfirm(
        '"' + (game.title || "Ohne Titel") + '" wirklich löschen?', "Löschen", true);
      if (!ok) return;
      state.archive = state.archive.filter(g => g.id !== game.id);
      push();
      goBack();
    });
    app.appendChild(del);
  }

  render("home");
</script>
</body>
</html>`;

  const wv = new WebView();

  // Abfangen der URL vom iFrame, um im Hintergrund zu speichern
  wv.shouldAllowRequest = (req) => {
    if (req.url.startsWith("scriptable://save")) {
      try {
        const dataStr = decodeURIComponent(req.url.split("?data=")[1]);
        const parsed = JSON.parse(dataStr);
        if (parsed && Array.isArray(parsed.current)) saveState(parsed);
      } catch (e) {}
      return false; // Verhindert, dass die Seite wirklich geladen wird
    }
    return true;
  };

  await wv.loadHTML(html);
  await wv.present(true);

  // Sicherheitsspeicherung, wenn du das Fenster schließt
  try {
    const finalState = await wv.evaluateJavaScript("JSON.stringify(state)", false);
    const parsed = JSON.parse(finalState);
    if (parsed && Array.isArray(parsed.current)) saveState(parsed);
  } catch (e) {}
}

// ---------------------------------------------------------------
await runApp();
Script.complete();
