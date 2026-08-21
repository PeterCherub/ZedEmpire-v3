# ZED EMPIRE — Web/JS port

A 1:1 port of the LÖVE2D/Lua prototype (Prototype 0.4) to vanilla
JavaScript + Canvas. Same game, same 15 Chapter 1 cards, same debt
mechanic, same map/menu/shop/bank screens, same synthesized sound
effects — just running natively on the web instead of through a
LÖVE-to-web translation layer.

## Why this exists

The Lua version had to go through love-android (NDK cross-compile) or
love.js (Emscripten/WASM) to reach Android or the browser. This
version *is* a web app, so both targets stop being export problems:

- **Web**: this already is the web build. Just host the folder.
- **Android**: wrap it in [Capacitor](https://capacitorjs.com/) — a
  thin native WebView shell. No NDK, no CMake, no C++ toolchain.
  Comfortably supports Android 6+ (API 23).

## File map (mirrors the Lua project 1:1)

```
index.html          -- canvas element, loads js/main.js as a module
style.css            -- fullscreen centering + letterbox scaling
js/
  theme.js            <- ui/theme.lua       (color palette)
  fonts.js            <- ui/fonts.lua       (font loading/caching)
  audio.js            <- systems/audio.lua  (synthesized SFX)
  save.js             <- love.filesystem + lib/json.lua (-> localStorage)
  button.js           <- ui/button.lua      (shared clickable rect)
  panel.js            <- ui/panel.lua       (modal chrome)
  slider.js           <- ui/slider.lua      (drag-to-decide mechanic)
  draw.js             <- ui/draw.lua        (ledger / card / banner)
  state.js            <- systems/state.lua  (stats, flags, game-over)
  engine.js           <- systems/engine.lua (card queue, delayed cards)
  cards.js            <- cards/chapter1.lua (all 15 cards)
  menu.js             <- ui/menu.lua
  settings.js         <- ui/settings.lua
  shop.js             <- ui/shop.lua
  bank.js             <- ui/bank.lua
  map.js              <- ui/map.lua
  main.js             <- main.lua           (game loop, input, screens)
assets/
  fonts/               -- same DejaVu Sans TTFs the Lua build used
  icons/                -- same six stat PNGs
```

## What changed in the port (and why)

- **Input**: Pointer Events (`pointerdown`/`pointermove`/`pointerup`)
  instead of LÖVE's `love.mousepressed` etc. This is actually simpler
  than the Lua version — the browser normalizes mouse, touch, and pen
  into one event stream for free, whereas LÖVE relied on its own
  touch-to-mouse mapping.
- **Text wrapping**: Canvas has no built-in equivalent of
  `love.graphics.printf`'s auto-wrap, so `draw.js` implements
  `wrapText()` by hand — including matching printf's per-line
  alignment behavior (wrapped text respects whatever `ctx.textAlign`
  is set when you call it).
- **Audio**: same oscillator-formula synthesis as `systems/audio.lua`,
  rebuilt on the Web Audio API. One real behavioral difference:
  browsers block audio before a user gesture, so the `AudioContext` is
  created lazily on the first tap (`audio.unlock()` in `main.js`)
  instead of at startup.
- **Save data**: `localStorage` + native `JSON`, replacing
  `love.filesystem` + the hand-rolled `lib/json.lua` (JS doesn't need
  a JSON library, it has one built in).
- **Screen scaling**: the game draws at a fixed 420×720 logical
  resolution (same as the Lua window), and `main.js` scales that box
  via CSS to fit whatever screen it's actually on, letterboxed to
  preserve the aspect ratio. This is the one thing that had no Lua
  equivalent to port from — LÖVE just opened a fixed-size window.

## Run it locally

WASM/module scripts need a real HTTP server — opening `index.html`
directly as a `file://` URL will fail silently (module imports get
blocked by CORS).

```bash
cd zedempire-web
python3 -m http.server 8080
```

Open `http://localhost:8080`.

## Next step: Android via Capacitor

Not done yet — this delivers the web app itself. Wrapping it for
Android is a separate, much shorter step than the LÖVE/NDK path:

```bash
npm install -g @capacitor/cli
cap init "ZED EMPIRE" com.yourname.zedempire
npm install @capacitor/android
cap add android
cap sync
cd android && ./gradlew assembleDebug
```

That's JDK + Gradle only — no NDK, no CMake, no submodules. Ask if
you want this set up next.


## Story and loss rules

ZedEmpire is a 10-chapter journey across Zambia's 10 provinces. Every
chapter lives in its own file (`js/content/chapterN.js`, each
exporting `cards` + `sequence`) and is pulled together by
`js/content/chapters.js`, which also holds the province/title
metadata used by the map and the chapter heading:

1. Lusaka — The Awakening (15 cards, the full story chapter)
2. Central — The Crossroads
3. Copperbelt — The Price of Progress
4. Eastern — The Turning Point
5. Luapula — Across the Water
6. Northern — The Long Road
7. North-Western — Hidden Wealth
8. Southern — Dry Season
9. Western — The Open Frontier
10. Muchinga — The Empire

Chapters 2-10 currently ship with 5 cards each, following the same
`cN_begin / cN_work / cN_community / cN_journey / cN_test` naming
pattern so new cards can be dropped in later without touching the
engine. Finishing a chapter's card queue advances the player straight
into the next province (same stats, bank, and flags carried over);
finishing chapter 10 ends the game with a "journey complete" screen
instead of pushing past chapter 10.

Loss is no longer a money-farming mechanic. Losing never transfers
money into the bank. The first loss is a setback. On the second loss,
the bank is emptied and the story explains that the player was
robbed. The player survives and restarts from chapter 1 (with
whatever's left of their bank savings) rather than treating death as
a reward or a profitable loop.
