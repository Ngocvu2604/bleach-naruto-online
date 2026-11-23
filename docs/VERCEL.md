# Deploy from GitHub to Vercel

The production error on 23/11/2026 was verified as HTTP 404 for `/ruffle/ruffle.js`, `/game/bvn-3.4-browser.swf` and `/game/characters.json`. Those generated folders had been excluded from Git, while the build only compiled the React application.

## Fixed deployment path

- Track the prepared `apps/web/public/game/assets`, browser SWF, character JSON, game license and `apps/web/public/art` in Git. Do not use Git LFS for these files; Vite needs actual binary assets.
- `.gitattributes` preserves those files byte-for-byte across Windows and Linux so Git newline conversion cannot invalidate their checksums.
- `prebuild` copies the official Ruffle JS/WASM/license files from the locked npm package. Ruffle's generated public folder stays ignored.
- The checked-in asset manifest verifies every required game/art file before building; `postbuild` verifies the actual `dist` output. Missing assets now fail the build instead of producing a broken website.
- `vercel.json` declares root-level `npm ci`, `npm run build`, output `dist`, framework Vite. The Vercel project Root Directory must be the repository root (`./`), not `apps/web` or `dist`. Remove dashboard build/output overrides if they conflict with this configuration.
- No Java, Adobe AIR, JPEXS or downloads from GitHub Releases are required on Vercel. Game binaries are prepared and checked locally, then included in the repository.

## Deploy this fix

From the repository root, run `npm run build`. Commit the changed configuration/scripts **and** newly included `apps/web/public/game` and `apps/web/public/art` files, then push the current branch to the GitHub branch linked to Vercel. Vercel will create a new deployment. A dashboard Redeploy of the old commit cannot recover files that were never pushed.

After deployment, verify these paths return 200 (and not HTML):

```text
/ruffle/ruffle.js
/game/characters.json
/game/bvn-3.4-browser.swf
```

Then open Play Offline and check the browser network panel for failed SWF, MP3 or WASM requests.

For a future intended game asset change, run the existing source verification, then `npm run assets:manifest`, build, and commit the changed binary assets and manifest together.

The original GPL license and source/build provenance remain under LICENSE, docs/SOURCE-AUDIT.md, docs/ENGINE-CHANGES.md and scripts/source-lock.json. Independent third-party anime asset rights remain as previously documented.
