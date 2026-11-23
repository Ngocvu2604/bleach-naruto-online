import fs from 'node:fs';
import path from 'node:path';
import {readManifest, verifyWebAssets, verifyRuntime} from './web-assets.mjs';
const manifest = readManifest();
verifyWebAssets('apps/web/public',manifest);
const source='node_modules/@ruffle-rs/ruffle';
const version=JSON.parse(fs.readFileSync(path.join(source,'package.json'),'utf8')).version;
if(version!==manifest.ruffleVersion)throw new Error('Ruffle version does not match the deployment manifest.');
const target='apps/web/public/ruffle';
fs.mkdirSync(target,{recursive:true});
for(const file of fs.readdirSync(source)) {
  if(file==='ruffle.js' || file.endsWith('.wasm') || file.startsWith('LICENSE')) fs.copyFileSync(path.join(source,file),path.join(target,file));
}
verifyRuntime(target);
console.log(`Deployment assets ready: ${Object.keys(manifest.files).length} verified game/art files and Ruffle ${version}.`);
