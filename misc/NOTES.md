# PA: TITANS Mod — Bomber Auto-Attack Keybind

## Goal
Build a `live_game.js` client mod for Planetary Annihilation: TITANS that adds a
keybind: when pressed, order currently-selected bombers to attack **enemy units
currently visible on screen** (not the whole map).

Already solved by the user: keybind registration, getting current selection,
filtering selection for bombers, issuing attack orders, getting enemy unit IDs
in general.

Still unsolved: getting *only the enemy units currently on screen*, without
hand-rolling camera-frustum/raytracing math in JS.

## Key findings on the API

- PA's UI is HTML/JS running in Coherent UI (a Chromium-based embedded
  browser), using Knockout.js for data binding, plus jQuery and Lodash.
- Client mods register JS per-scene via `modinfo.json`:
  ```json
  "scenes": { "live_game": ["coui://ui/mods/<id>/live_game.js"] }
  ```
- The `live_game` scene is actually split across many sub-files
  (`live_game_chat.js`, `live_game_selection.js`, etc.) all loaded together;
  `game_over` and `gamestats` are also loaded as part of `live_game`.
- Within a mod script you have two key globals: `model` (Knockout view model
  for the HUD) and `api` (exposed game API surface).
- Confirmed via real shipped mod source (aldrik's `pa-mods` repo,
  `com.pa.n30n.expanded_hotkeys/ui/mods/hotkeys/live_game.js`) that there is a
  first-class `api.select` namespace, including an "OnScreen" family:
  - `api.select.allIdleFactoriesOnScreen`
  - `api.select.allFactories`
  - `api.select.commander`
  - `api.select.idleFabbers(planetId)`
  - `api.select.idleFabber`
  - `api.select.fromSelectionWithTypeFilter(type, team, remove)`
  - `api.select.unitsById(idsArray, exclusive)`
  - `api.select.empty()`
  - `api.select.recallGroup(n)`
  - `api.Holodeck.focused.selectMatchingTypes('add', types)`
- This proves on-screen filtering already happens **inside the engine** — it's
  exposed as ready-made selectors, not something to reimplement client-side.
- **Not yet confirmed:** an enemy-scoped on-screen selector
  (e.g. `enemiesOnScreen`). All publicly-available mod source only uses
  "OnScreen" helpers scoped to the player's own units. The actual
  `api.js`/`select.js` implementation isn't published anywhere reachable —
  only fan mods that *call* the API, not the API's own source.

## Next step to find the enemy-on-screen selector

Use the Coherent Debugger against a live/skirmish game (this is the standard
community workflow for reverse-engineering undocumented PA API surface):

1. Start a skirmish, open the Coherent Debugger, attach to `live_game`, open
   Console.
2. Run `Object.keys(api.select)` (or `Object.getOwnPropertyNames(api.select)`)
   — dump every selection helper, look for `enemy`/`hostile`/`visible`/
   `onScreen` in the names.
3. Run `api.select.allIdleFactoriesOnScreen.toString()` — since these are
   plain JS functions this prints their source, likely revealing an
   `engine.call('select....', ...)` or a filter over an existing "on-screen
   units" list. Reuse that same call/list with an enemy filter instead of
   "mine + idle".
4. Also check `Object.keys(api.camera)` — PA already renders health bars
   glued to units on screen, so a world→screen projection function must
   already be exposed somewhere (cheap: one matrix multiply per unit, not
   real raytracing). Fallback if no enemy-on-screen selector exists.

## Side quest: Coherent Debugger stopped connecting (RESOLVED — root cause found)

Symptom: `http://127.0.0.1:9999/json/list` returned `ERR_CONNECTION_REFUSED`.
Worked a few days ago, stopped working, same launch options:
`--mods-url https://mods.planetaryannihilation.net/ --coherent_port=9999`

Root cause, found in the client log
(`PA-2026-07-21_154206.txt`, `[COUI]` lines):

```
[ERROR:tcp_socket_win.cc(371)] bind() returned an error: ... (0x271D)
[ERROR:devtools_http_handler_impl.cc(805)] Cannot start http server for devtools. Stop devtools.
```

- `0x271D` = `10013` decimal = Windows `WSAEACCES` ("access forbidden by
  socket's access permissions") on `bind()`.
- This is Coherent's embedded Chromium devtools HTTP server (the thing that
  backs `/json/list`) failing to bind to port 9999 at PA startup — so nothing
  is ever listening there, hence connection refused. Not a debugger-side bug.
- Most likely cause: port 9999 fell into a **Windows dynamic port exclusion
  range** (reserved by Hyper-V / WSL2 / Docker Desktop; these get
  regenerated on service restarts or Windows updates, silently claiming
  previously-fine ports).

**RESOLVED 2026-07-21.** Confirmed root cause:
`netsh interface ipv4 show excludedportrange protocol=tcp` showed port 9999
sitting inside Hyper-V/WSL2/Docker's dynamic NAT exclusion range
(`9994-10093`), which `winnat` recomputes on its own schedule (service
restarts, reboots). `netstat -ano | findstr 9999` confirmed nothing was
actually listening — the bind failure was purely the OS-level exclusion.

Fix applied (reclaimed port 9999 instead of switching ports):
1. `net stop winnat` (admin) — stops the NAT driver so its dynamic exclusion
   table gets released.
2. `netsh interface ipv4 add excludedportrange protocol=tcp startport=9999 numberofports=1 store=persistent`
   (admin) — plants a persistent reservation for 9999 *before* winnat comes
   back, so its recompute routes around it.
3. `net start winnat` (admin) — restarts the NAT driver; it recalculates its
   dynamic range and this time excludes 9994 downward, leaving 9999 free.
4. Verified: `netsh interface ipv4 show excludedportrange protocol=tcp` now
   shows `9999 9999 *` (admin-owned) instead of the old `9994-10093` Hyper-V
   range.

This exclusion is persistent (`store=persistent`), so it should survive
reboots and future winnat restarts, though it's not a hard OS guarantee —
if 9999 ever gets blocked again, rerun steps 1–3 above.

Launch options remain unchanged:
`--mods-url https://mods.planetaryannihilation.net/ --coherent_port=9999`

## Environment
- Windows, PA: TITANS via Steam, build 124665 (`build_id 20260713194519`).
- Launch options: `--mods-url https://mods.planetaryannihilation.net/ --coherent_port=9999`
- User already has a client mod dir with several installed mods (e.g.
  `com.pa.chrysaloid.more-selections`, `rfloatframe`, `keybind_extensions`,
  `fast_delete`, `com.pa.smaller-icons`).

## Open items
- [ ] Confirm whether the Coherent Debugger port fix worked.
- [ ] Once the debugger connects, run the `Object.keys(api.select)` /
      `.toString()` inspection above and find the enemy-on-screen selector
      (or confirm one doesn't exist and fall back to `api.camera` projection).
- [ ] Wire the result into the bomber-attack keybind in the user's
      `live_game.js` mod.
