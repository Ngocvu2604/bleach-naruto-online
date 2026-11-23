import fs from 'node:fs';
import path from 'node:path';
import {sha256} from './swf.mjs';

export const manifestPath = new URL('./web-assets-manifest.json', import.meta.url);
export function readManifest() { return JSON.parse(fs.readFileSync(manifestPath, 'utf8')); }

/** Static game files must be in Git; the runtime is reconstructed from locked npm dependencies. */
export function verifyWebAssets(publicRoot, manifest) {
  for (const [relative, hash] of Object.entries(manifest.files)) {
    if (!/^(game|art)\//.test(relative) || relative.split('/').includes('..') || relative.includes('\\')) throw new Error('Invalid asset path: '+relative);
    const file = path.join(publicRoot, relative);
    if (!fs.existsSync(file)) throw new Error(`Missing deployment asset: ${relative}. Include apps/web/public/game and art in Git, or run npm run setup on the development machine.`);
    if (sha256(fs.readFileSync(file)) !== hash) throw new Error(`Asset checksum mismatch: ${relative}. Regenerate the manifest only after verifying the intended game change.`);
  }
}

export function verifyRuntime(root) {
  if (!fs.existsSync(path.join(root, 'ruffle.js'))) throw new Error('Ruffle JavaScript is missing from deployment.');
  const wasm = fs.readdirSync(root).filter(file => file.endsWith('.wasm'));
  if (!wasm.length) throw new Error('Ruffle WASM is missing from deployment.');
  for (const file of wasm) {
    if (!fs.readFileSync(path.join(root,file)).subarray(0,4).equals(Buffer.from([0,97,115,109]))) throw new Error('Invalid WASM file: '+file);
  }
}
