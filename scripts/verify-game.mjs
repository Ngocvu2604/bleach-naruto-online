import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {parseSwf,sha256} from './swf.mjs';
const original='tools/decompiled/scripts',patched='tools/patched-decompiled/scripts';
const list=root=>fs.readdirSync(root,{recursive:true,withFileTypes:true}).filter(e=>e.isFile()&&e.name.endsWith('.as')).map(e=>path.relative(root,path.join(e.parentPath,e.name)).replaceAll('\\','/')).sort();
const files=list(original);assert.deepEqual(list(patched),files);
const changes=files.filter(p=>sha256(fs.readFileSync(original+'/'+p))!==sha256(fs.readFileSync(patched+'/'+p)));
assert.deepEqual(changes,['FighterTester.as','net/play5d/game/obvn/ctrler/GameLoader.as','net/play5d/game/obvn/utils/air/FileStamp.as']);
// JPEXS emits AS3 ||= as the equivalent explicit x = x || value expression.
const normalize=s=>s.replace(/param4\.(size|color|font)\s*=\s*param4\.\1\s*\|\|/g,'param4.$1 ||=').replace(/\s+/g,'');
const expectedEntry=normalize(fs.readFileSync(original+'/FighterTester.as','utf8')).replace('[SWF(width="1000",','[SWF(width="800",').replace('Debugger.initDebug(stage);','').replace('Debugger.onErrorMsgCall=onDebugLog;','').replace('buildTestUI();','_mainGame.goMenu();');
assert.equal(normalize(fs.readFileSync(patched+'/FighterTester.as','utf8')),expectedEntry,'Entry change must only remove debug initialization and open the existing menu');
const a=parseSwf(fs.readFileSync('tools/original-uncompressed.swf')),b=parseSwf(fs.readFileSync('tools/patched-uncompressed.swf'));
assert.ok(a.timing.equals(b.timing));assert.equal(a.width,1000);assert.equal(b.width,800);assert.equal(a.height,600);assert.equal(b.height,600);assert.equal(a.tags.length,b.tags.length);
for(let i=0;i<a.tags.length;i++) { assert.equal(a.tags[i].code,b.tags[i].code); if(a.tags[i].code!==82)assert.equal(a.tags[i].hash,b.tags[i].hash,'Non-code SWF tag changed'); }
const assets='vendor/release-3.4/swf_output/assets';
const assetFiles=fs.readdirSync(assets,{recursive:true,withFileTypes:true}).filter(e=>e.isFile());
for(const entry of assetFiles){const p=path.join(entry.parentPath,entry.name);assert.equal(sha256(fs.readFileSync(p)),sha256(fs.readFileSync('apps/web/public/game/assets/'+path.relative(assets,p))));}
const report={scriptCount:files.length,unchangedScripts:files.length-changes.length,changedScripts:changes,display:{original:[a.width,a.height],browser:[b.width,b.height]},timingUnchanged:true,nonCodeTagsUnchanged:true,assetFilesUnchanged:assetFiles.length,limitation:'Identical decompilation of untouched classes and identical non-code tags; runtime frame-by-frame equivalence still requires reference AIR comparison.'};
fs.writeFileSync('docs/game-verification.json',JSON.stringify(report,null,2));console.log(report);
