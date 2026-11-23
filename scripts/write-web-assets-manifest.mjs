import fs from 'node:fs';
import path from 'node:path';
import {sha256} from './swf.mjs';
import {manifestPath} from './web-assets.mjs';
const root='apps/web/public';
const entries=fs.readdirSync(root,{recursive:true,withFileTypes:true}).filter(entry=>entry.isFile()).map(entry=>path.relative(root,path.join(entry.parentPath,entry.name)).replaceAll('\\','/')).filter(relative=>relative.startsWith('art/') || relative.startsWith('game/assets/') || ['game/bvn-3.4-browser.swf','game/characters.json','game/LICENSE-GPL-3.0.txt'].includes(relative)).sort();
const manifest={ruffleVersion:JSON.parse(fs.readFileSync('node_modules/@ruffle-rs/ruffle/package.json','utf8')).version,files:Object.fromEntries(entries.map(relative=>[relative,sha256(fs.readFileSync(path.join(root,relative)))]))};
fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');
console.log('Wrote checksums for '+entries.length+' deployable assets.');
