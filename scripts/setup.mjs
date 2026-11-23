import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {createExtractorFromFile} from 'node-unrar-js';
import {sha256} from './swf.mjs';
const lock=JSON.parse(fs.readFileSync(new URL('./source-lock.json',import.meta.url),'utf8'));
const run=(cmd,args)=>{const result=spawnSync(cmd,args,{stdio:'inherit',timeout:180000});if(result.status!==0)throw new Error(cmd+' failed: '+(result.error?.message??result.status));};
fs.mkdirSync('vendor',{recursive:true});fs.mkdirSync('tools',{recursive:true});
async function download(url,file,hash){if(!fs.existsSync(file)){console.log('Downloading '+url);const response=await fetch(url);if(!response.ok)throw new Error('HTTP '+response.status);fs.writeFileSync(file,Buffer.from(await response.arrayBuffer()));}if(sha256(fs.readFileSync(file))!==hash)throw new Error('Checksum mismatch: '+file);}
if(!fs.existsSync('vendor/OpenBleachVsNaruto/.git')){
  run('git',['clone','--depth','1',lock.game.repository,'vendor/OpenBleachVsNaruto']);
  run('git',['-C','vendor/OpenBleachVsNaruto','fetch','--depth','1','origin',lock.game.commit]);
  run('git',['-C','vendor/OpenBleachVsNaruto','checkout','--detach',lock.game.commit]);
}
const revision=spawnSync('git',['-C','vendor/OpenBleachVsNaruto','rev-parse','HEAD'],{encoding:'utf8'});
if(revision.stdout.trim()!==lock.game.commit)throw new Error('Upstream checkout does not match source-lock.json. Preserve your changes and use the pinned commit.');
await download(lock.game.url,'vendor/swf_output-20261031.rar',lock.game.sha256);
if(!fs.existsSync('vendor/release-3.4/swf_output/FighterTester.swf')){
  const extractor=await createExtractorFromFile({filepath:'vendor/swf_output-20261031.rar',targetPath:'vendor/release-3.4'});
  for(const entry of extractor.extract().files){ /* Consume the generator to finish extraction. */ }
}
await download(lock.ffdec.url,'tools/ffdec.zip',lock.ffdec.sha256);
if(!fs.existsSync('tools/ffdec/ffdec.jar')){
  if(process.platform==='win32')run('powershell.exe',['-NoProfile','-Command',"Expand-Archive -LiteralPath 'tools/ffdec.zip' -DestinationPath 'tools/ffdec' -Force"]);
  else run('unzip',['-o','tools/ffdec.zip','-d','tools/ffdec']);
}
const java=args=>run('java',['-jar','tools/ffdec/ffdec.jar',...args]);
if(!fs.existsSync('tools/faces/images'))java(['-export','image,symbolClass','tools/faces','vendor/release-3.4/swf_output/assets/face.swf']);
run(process.execPath,['scripts/prepare-game.mjs']);
java(['-export','script','tools/decompiled','vendor/release-3.4/swf_output/FighterTester.swf']);
java(['-export','script','tools/patched-decompiled','apps/web/public/game/bvn-3.4-browser.swf']);
run(process.execPath,['scripts/verify-game.mjs']);
console.log('Setup complete. Run npm run dev.');
