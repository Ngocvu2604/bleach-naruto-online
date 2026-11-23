# Source audit — 23/11/2026

All four repositories requested by the user were shallow-cloned and inspected locally. No code or game binary was taken from the multiplayer reference.

| Repository | Inspected commit | Finding |
| --- | --- | --- |
| 5DPLAY-Game-Studio/BleachVsNaruto | d51f13dc36cac8e7622328bf4a9afc94156fb79f | Current 3.7 alpha; AS3, separate KernelLogic, Components, Shared, PC/mobile AIR shells; GPL-3.0. Not selected. |
| 5DPLAY-Game-Studio/BleachVsNaruto_FlashSrc | 50a886552940334c013637c97b4b1c56521b18e3 | FLA/XFL for Flash/Animate, sprites, UI, maps, fonts and animation timelines; GPL-3.0. Not a browser-ready game. |
| 5DPLAY-Game-Studio/OpenBleachVsNaruto | e3bc6092e1f62213bcdc3c34664cb2da2d2a6b8a | Archived 3.4 debug source, GPL-3.0. Selected. |
| DuyOrbit/naruto-vs-bleach-online | ca91c3b86a730ddc228e3fb7e5c00e57ae9df417 | README identifies 2.6 with Ruffle + WebRTC remote play. No root LICENSE found; reference only. Its SWF, runtime, assets and code are not distributed here. |

## Selected game

Official release: [RELEASE_20261031](https://github.com/5DPLAY-Game-Studio/OpenBleachVsNaruto/releases/tag/RELEASE_20261031), `swf_output.rar` (58,294,993 bytes). URLs and SHA-256 checksums are pinned in `scripts/source-lock.json`.

- Entry: `swf_output/FighterTester.swf`; upstream is an AIR debug harness, not the full commercial browser menu.
- Movie: 1000 × 600 at 30 FPS in the SWF header. The game may change the stage frame rate itself; the wrapper never overrides it.
- Combat/AI: `swf_source/#FighterTester/src/net/play5d/game/obvn/{fighter,ctrler,stage,...}`.
- Fighters and assists: `swf_source/f_fighter`, `swf_source/f_assistant`; compiled SWFs under release `assets/fighter`.
- Maps: `swf_source/map`; compiled release `assets/map`.
- Effects and faces: `swf_source/assets/{effect,face}`; release `assets/{effect,face}.swf`.
- Music/SFX: release `assets/bgm`, `assets/sound`.
- Character and map data: release `assets/config/*.xml`. Browser roster has 58 actual entries, excluding random-selection pseudo-entries.
- UI: embedded movies in the main SWF; additional source in `swf_source/embed` and `#FighterTester/swfs`.

## Build findings

Node 22.19.0, npm 10.9.3, Git 2.51.0 and Java 25.0.1 available. Adobe Animate/Flash Builder and Flex SDK (`FLEX_HOME`, `FLASH_HOME`, `mxmlc`) were not available. A complete FLA/AS3 rebuild was therefore not possible with the installed toolchain.

Upstream ignores most generated `.swf` files in Git. The official release supplies the complete compiled game and 148 external assets, avoiding a rebuild of combat and animation. The original root `FighterTester_ORG.swf` also fails in Ruffle with `VerifyError #1014: Class flash.filesystem::File could not be found`.

The selected release uses AIR file access too. Two loader classes and the entry menu route are replaced using JPEXS 26.5.0; see `ENGINE-CHANGES.md`. Ruffle is the official npm package `@ruffle-rs/ruffle` 0.8.0, self-hosted with its own WASM. npm lockfile records every resolved dependency.

## Rights and distribution

The three official source repositories state GPL-3.0. The local copy retains upstream LICENSE and attribution. JPEXS is GPL-3.0; Ruffle carries MIT/Apache-2.0 notices in its copied package. New wrapper code is distributed under GPL-3.0-or-later in this workspace.

Repository licensing alone does not establish permission for all anime characters, brands, images, music, voices or fonts. Those rights have not been independently established. This work is a localhost prototype and has not been published. Any future public distribution must preserve the corresponding source, build/patch scripts and notices and independently resolve asset rights.

