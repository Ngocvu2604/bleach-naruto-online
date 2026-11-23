# Browser compatibility patch

Input: official OpenBleachVsNaruto 3.4 release `RELEASE_20261031/FighterTester.swf`.
Output: `apps/web/public/game/bvn-3.4-browser.swf`.
Reproduce: `npm run setup`, or `npm run prepare:game` once tools/assets exist.

## Why an engine integration change is required

Actual Ruffle browser execution of the untouched SWF reports:

```text
VerifyError: Error #1014: Class flash.filesystem::File could not be found.
```

Ruffle Web cannot access Adobe AIR's application filesystem. Merely embedding the SWF cannot run this build.

## Exact changes

1. `net.play5d.game.obvn.ctrler.GameLoader`: browser patch source is in `packages/game-core/browser-patches/GameLoader.as`. Its fighter/map/assist wrapper functions are retained from JPEXS decompilation of the pinned release, with callbacks explicitly initialized before use. This is necessary because JPEXS's experimental compiler does not correctly hoist nested function declarations from upstream AS3 source; that initially caused `ReferenceError #1065: loadComplete is not defined`, which was fixed and retested in a real battle. The private asset loading path uses `URLLoader` with binary data instead of synchronous AIR `FileStream`; it retains `Loader.loadBytes`, a new `ApplicationDomain`, byte caching and completion/progress callbacks. AIR-only `allowCodeImport` assignment is removed. Errors include the asset URL. Cache invalidation by local disk modification time is dropped because the release assets are immutable within this session. Loading completes before the original battle initialization callback.
2. `net.play5d.game.obvn.utils.air.FileStamp`: no filesystem import; returns the URL. The patched GameLoader no longer calls it, but replacing it avoids an unresolved AIR class in the module.

3. `FighterTester`: opens the existing `_mainGame.goMenu()` instead of building the debug panel. It no longer calls `Debugger.initDebug(stage)` or registers the debug-panel callback, so FPS/mode overlays are not created. Existing diagnostic trace logging stays available. Combat configuration and all other entry functions are unchanged, allowing only equivalent compiler formatting/default expressions.

No other AS3 class is replaced. No combat system is recreated. AI, controls, damage, hitboxes, animation movies, sound assets, selection/config XML and stage timing remain original. The wrapper does not set FPS or game mode. Debug controls are no longer constructed or reachable from the browser interface.

## Evidence and limits

`scripts/verify-game.mjs` compares JPEXS decompilation of all 217 scripts: exactly the three listed classes differ; **214 scripts match exactly**. Every non-code SWF tag matches byte-for-byte, including embedded assets. Frame rate and frame count match. At the user’s request the display RECT is reduced from the 1000 × 600 debug canvas to the original 800 × 600 game area; the coordinate origin and game content are unchanged. Only the 200-pixel debug margin is removed. All **148 external asset files** match the official release SHA-256 values. Reports: `game-verification.json`, `swf-integrity.json`.

The main SWF has one shared DoABC tag. Compiling the replacement classes changes its constant pool; whole-file or whole-DoABC equality is therefore neither expected nor claimed. Identical decompilation and asset hashes are strong structural checks, not proof of emulator correctness. Full gameplay equivalence needs side-by-side reference AIR measurements of frames, input timing, hitboxes, AI, sound and all characters/maps. The available environment does not provide that reference test.

Ruffle reports stubs for `Loader.unloadAndStop()`, `Loader.load()` child timing and top-level metadata in `avmplus.describeTypeJSON()`. It also warns about duplicate labels in original movie clips and missing device fonts (including Chinese fonts). These warnings did not prevent the tested battles, but cleanup/repeated matches need additional soak testing. The AIR debug panel is removed in the current browser build. Do not change combat or remove animation frames to work around emulator defects.

## Future Remote Play gate

No signaling/backend/remote input is implemented in Phase 1. Before Phase 2, prove canvas capture, audio capture and P2-only input with this exact Ruffle build. Do not assume synthetic DOM keys or shadow-DOM canvas access are supported public APIs. Require TURN fallback, authenticated room membership, two-peer limits, stuck-key release and host-disconnect handling before offering online play.


## Fullscreen presentation revision

Requested by the user after Phase 1: remove all debug UI and make fullscreen game-only. The wrapper uses 4:3, hides the toolbar/status in fullscreen and sizes the whole game with contain behavior. It preserves the full image without stretching/cropping combat. Esc exits fullscreen. An embedded browser that rejects the native fullscreen API falls back to a fixed game-only viewport. No combat or frame timing changes accompany this presentation revision.
