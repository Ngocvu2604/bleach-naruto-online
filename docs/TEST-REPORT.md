# Phase 1 validation — 23/11/2026

## Passed

- `npm run setup`: completed end-to-end using pinned, checksum-verified official archives; generated SWF, assets, portraits, roster and integrity reports.
- `npm test`: 6 tests passed (SWF parsing, stage/timing/embedded asset preservation, real roster portrait availability, all external asset bytes, Ruffle v1 lifecycle/volume/config, focus-scoped native keyboard scroll protection).
- `npm run build`: TypeScript and Vite production build passed.
- Vite dev server served the application at `http://127.0.0.1:5174/`; verified in the actual in-app Chromium browser on the user's computer.
- Dark responsive main menu rendered at desktop and narrow app-panel widths. Unsupported online/account/ranking controls are disabled/labeled unavailable.
- Character modal displayed 58 entries from official fighter XML. Searching `naruto` reduced the list to the five matching original variants.
- Settings slider changed from 70% to 65%, with local persistence. Ruffle volume and cleanup are also covered by tests.
- Play Offline opened the original 3.4 SWF. Original menu displayed Team Play, Single Play, Option, Training, Credits and submodes including Single vs People/CPU.
- Keyboard J advanced through original character selection and match loading. Real battles loaded original fighter/assist/map SWFs; observed multiple maps, original health/energy bars, score changes, AI attacks, damage/hit effects and a seven-hit sequence.
- Native A/K/U action keys were sent during a live battle; camera/fighters/effects advanced. No JavaScript combat loop or synthetic game-state manipulation exists in the wrapper.
- Browser fullscreen entered and exited. Leaving the game returned to the web menu without React/JavaScript console errors.
- Final tested session contained no `ERROR` messages from Ruffle and no browser console errors. Known Ruffle warnings/stubs remain documented, rather than suppressed as resolved.

## Integrity evidence

- 217 decompiled scripts inspected before/after: **214 identical**, three documented integration classes changed.
- FighterTester entry comparison permits the existing menu call and removal of debug initialization/callback, after normalizing equivalent compiler formatting/default expressions and the documented display width.
- All 27 non-DoABC tags unchanged; the sole DoABC tag contains the patched classes and shared constant pool.
- Frame-rate field and frame count unchanged. Current browser display RECT is 800×600, removing only the original debug margin; coordinate origin remains unchanged.
- **148/148 external release assets match SHA-256**. No game animation/art/audio was substituted.
- Evidence: `game-verification.json`, `swf-integrity.json`, `screenshots/gameplay.jpg`, `screenshots/menu.jpg`.

## Remaining verification and scope

- Full frame-by-frame parity with Adobe AIR was not measured; no reference AIR runtime test was performed. Structural preservation does not guarantee perfect Ruffle emulation.
- Not every fighter, transformation, assist, map, combo, AI level and offline submode was exhaustively tested. Single vs People exists in the original menu, but simultaneous P1/P2 operation using a physical two-player keyboard setup was not verified.
- MP3 assets were decoded and sound controls worked; audible output was not independently evaluated by a human listener. Device audio/autoplay behavior still needs user testing.
- Chinese device-font glyphs in the debug panel may be absent. The primary menu uses original bitmap lettering and remains navigable.
- Ruffle emits loader, metadata, font and duplicate-label warnings; long repeated-session stability and exact frame pacing require further testing.
- Remote Play, WebRTC media/audio capture, guest input, Workers/Durable Objects signaling, TURN fallback, accounts, profiles, match history and ranking are **not implemented**. No fabricated results or online backend are presented.
- Source build from Adobe Flash/Animate/Flex is not verified because that toolchain is absent. This integration uses the official compiled 3.4 release plus three bounded, documented integration patches.
- No public deployment; third-party anime asset rights remain unverified.

## Follow-up: game-only fullscreen

Debug panel creation, FPS/mode overlay initialization and the debug error-panel callback are disabled. The original game’s 800×600 area now uses the entire player surface. The website toolbar/status are hidden in fullscreen. Structural checks still preserve 214 untouched scripts, all non-code tags, all 148 asset files, and frame timing. Fullscreen can fall back to the browser viewport when the embedded browser denies native fullscreen.

Follow-up browser QA passed: fullscreen displayed only the original menu at 4:3, with no debug panel/FPS counter or website toolbar/status. The embedded browser denied native fullscreen on one attempt; the viewport fallback worked. Esc restored the normal player layout. No Ruffle ERROR messages appeared in the checked session. Evidence: screenshots/fullscreen-no-debug.jpg. Six tests and production build passed after these changes.
