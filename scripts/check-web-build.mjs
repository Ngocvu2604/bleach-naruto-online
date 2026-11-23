import fs from 'node:fs';
import {readManifest, verifyWebAssets, verifyRuntime} from './web-assets.mjs';
verifyWebAssets('dist',readManifest());
verifyRuntime('dist/ruffle');
if(!fs.readFileSync('dist/index.html','utf8').includes('/ruffle/ruffle.js')) throw new Error('Build does not reference the self-hosted Ruffle entry.');
console.log('Build verified: index.html, game SWF, all assets and Ruffle WASM are present.');
