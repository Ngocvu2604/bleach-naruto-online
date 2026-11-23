import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { sha256, parseSwf, gameOnlyStage } from './swf.mjs';
const root=process.cwd(),pub='apps/web/public',release='vendor/release-3.4/swf_output';
for(const file of [release+'/FighterTester.swf','tools/ffdec/ffdec.jar','tools/faces/images','node_modules/@ruffle-rs/ruffle/ruffle.js'])if(!fs.existsSync(file))throw new Error('Missing '+file+'. See README setup instructions.');
fs.mkdirSync(pub+'/game',{recursive:true});fs.mkdirSync(pub+'/art',{recursive:true});
fs.cpSync(release+'/assets',pub+'/game/assets',{recursive:true});
fs.cpSync('node_modules/@ruffle-rs/ruffle',pub+'/ruffle',{recursive:true});
const target=pub+'/game/bvn-3.4-browser.swf';
const args=['-jar','tools/ffdec/ffdec.jar','-replace',release+'/FighterTester.swf',target,'net.play5d.game.obvn.ctrler.GameLoader','packages/game-core/browser-patches/GameLoader.as','net.play5d.game.obvn.utils.air.FileStamp','packages/game-core/browser-patches/FileStamp.as','FighterTester','packages/game-core/browser-patches/FighterTester.as'];
const result=spawnSync('java',args,{stdio:'inherit',timeout:120000});
if(result.status!==0)throw new Error('JPEXS patch failed: '+(result.error?.message??result.status));
const faces=fs.readdirSync('tools/faces/images');
function face(symbol){const filename=faces.find(f=>f.replace(/^\d+_/,'').replace(/\.(jpg|png)$/,'')===symbol);if(!filename)throw new Error('Missing portrait '+symbol);const output=symbol+path.extname(filename);fs.copyFileSync('tools/faces/images/'+filename,pub+'/art/'+output);return '/art/'+output;}
face('ichigo_w');face('naruto_w');
fs.copyFileSync(pub+'/art/ichigo_w.jpg',pub+'/art/ichigo.jpg');fs.copyFileSync(pub+'/art/naruto_w.jpg',pub+'/art/naruto.jpg');
const xml=fs.readFileSync(release+'/assets/config/fighter.xml','utf8');
const attr=(s,key)=>s.match(new RegExp('(?:^|\\s)'+key+'="([^"]*)"'))?.[1];
const characters=[...xml.matchAll(/<fighter\s([^>]+)>([\s\S]*?)<\/fighter>/g)].filter(([,attrs])=>!attr(attrs,'id').startsWith('random')).map(([,attrs,body])=>({id:attr(attrs,'id'),name:attr(attrs,'name'),universe:attr(attrs,'comic_type')==='0'?'BLEACH':'NARUTO',portrait:face(attr(body.match(/<face\s([^>]+)/)?.[1]??'','big_cls'))}));
fs.writeFileSync(pub+'/game/characters.json',JSON.stringify(characters,null,2));
fs.copyFileSync('vendor/OpenBleachVsNaruto/LICENSE',pub+'/game/LICENSE-GPL-3.0.txt');
for (const [input,output] of [[release+'/FighterTester.swf','tools/original-uncompressed.swf'],[target,'tools/patched-uncompressed.swf']]) {
  const decompress=spawnSync('java',['-jar','tools/ffdec/ffdec.jar','-decompress',input,output],{stdio:'inherit',timeout:120000});
  if(decompress.status!==0)throw new Error('SWF decompression failed');
}
const displaySwf=gameOnlyStage(fs.readFileSync('tools/patched-uncompressed.swf'));
fs.writeFileSync(target,displaySwf);
fs.writeFileSync('tools/patched-uncompressed.swf',displaySwf);
const before=parseSwf(fs.readFileSync('tools/original-uncompressed.swf')),after=parseSwf(displaySwf);
const changed=before.tags.filter((t,i)=>t.hash!==after.tags[i]?.hash).map(t=>({code:t.code,name:t.name}));
const report={generatedAt:new Date().toISOString(),original:sha256(fs.readFileSync(release+'/FighterTester.swf')),patched:sha256(fs.readFileSync(target)),display:{original:[before.width,before.height],browser:[after.width,after.height]},timingUnchanged:before.timing.equals(after.timing),beforeTags:before.tags.length,afterTags:after.tags.length,changedTags:changed,characters:characters.length};
fs.writeFileSync('docs/swf-integrity.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));

