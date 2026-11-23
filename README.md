# Bleach vs Naruto Online — Phase 1

React + TypeScript + Vite + Tailwind CSS + Motion + Lucide, hosting the **original Open BVN 3.4 debug game** in self-hosted Ruffle. The combat engine is not rewritten. This is a local prototype; online/account/ranking features are explicitly unavailable.

## Run on Windows

Requirements: Node.js 22.12+ (tested 22.19), npm, Git, Java 17+ (tested 25), internet for the initial setup. About 1 GB of free disk space recommended. No Flash browser plugin required.

```powershell
cd D:\CODE\bleach-naruto-online
npm ci
npm run setup
npm run dev
```

Open the Local URL printed by Vite, normally http://127.0.0.1:5173. If that port is busy: `npm run dev -- --port 5174`. The checked-in Vite config binds loopback only.

Setup downloads the pinned official 3.4 release and JPEXS from their official GitHub repositories, verifies archive SHA-256 values, extracts original assets/portraits, patches two AIR loader classes and the entry menu route and verifies all untouched scripts/assets. The full upstream source is retained under `vendor/OpenBleachVsNaruto`. Dependencies are resolved by `package-lock.json`. Setup does not run downloaded game executables. Linux additionally needs `unzip`.

On this prepared workspace, dependencies/assets/tools already exist; only `npm run dev` is needed.

## Play

1. Select **PLAY OFFLINE → MỞ GAME GỐC**. Click the Ruffle game area to enable sound/input.
2. The browser entry opens the **original game menu** after initialization. Click the game to show its menu; use W/S and J to navigate/confirm. Select **SINGLE PLAY → SINGLE VS CPU** or **SINGLE VS PEOPLE** for 1v1, or the original **TRAINNING** item for practice. Character selection and combat remain inside the SWF.
3. The browser build removes the debug panel and FPS/mode overlays. Its viewport uses the original 800 × 600 game area (4:3). Fullscreen shows only the game, with black margins when the monitor has a different aspect ratio; press Esc to exit. If an embedded browser denies native fullscreen, the game fills the browser viewport instead.
4. P1: WASD movement, J/K/L/U/I/O actions. P2: arrow keys and Numpad 1–6. The controls/settings inside the game remain authoritative. A keyboard with a numeric keypad is needed for default P2 controls.
5. The web toolbar provides volume, fullscreen and exit. Volume persists locally. No control remapping or combat input synthesis is added.

## Validation

```powershell
npm test
npm run build
npm run preview
```

To regenerate assets after modifying the **integration** patch: `npm run prepare:game`. For a complete script comparison after changes, run `npm run setup` again. See [source audit](docs/SOURCE-AUDIT.md), [patch details](docs/ENGINE-CHANGES.md), and [test report](docs/TEST-REPORT.md).

## Layout

```text
apps/web/
  index.html
  src/main.tsx            # Menu, roster, settings, game screen
  src/styles.css
  src/game/              # Ruffle lifecycle, native keyboard guard, integration metadata
  public/art/            # Generated official portraits
  public/game/           # Generated SWF, original assets, roster and license
  public/ruffle/         # Official npm self-hosted runtime + WASM + notices
packages/game-core/browser-patches/  # Three documented AS3 integration classes
scripts/                 # Pinned download/setup, patch, integrity checks and tests
docs/                    # Source audit, verification evidence and known limitations
vendor/                  # Local upstream clones/release, ignored from version control
tools/                   # Local JPEXS and inspection output, ignored
dist/                    # Production build, generated
```

No server/shared scaffolding is added for unimplemented future phases. Phase 2 will add Workers/Durable Objects signaling and a proven remote-play bridge. D1/R2, profiles, match history and leaderboards belong to subsequent phases.

## Attribution and licensing

Game: 剑jian / **5DPLAY Game Studio**. [Official source](https://github.com/5DPLAY-Game-Studio/OpenBleachVsNaruto), GPL-3.0. Wrapper: GPL-3.0-or-later; see LICENSE. Ruffle: MIT OR Apache-2.0. JPEXS: GPL-3.0. Original portraits were extracted from the official `face.swf`, not generated or taken from unknown sources.

Anime artwork, brands, voices, music and other third-party asset rights have not been independently cleared. No public deployment has been performed. See SOURCE-AUDIT before distribution.

