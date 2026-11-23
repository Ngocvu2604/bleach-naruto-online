import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {parseSwf,sha256} from './swf.mjs';
test('SWF parser rejects unknown signatures',()=>assert.throws(()=>parseSwf(Buffer.from('INVALID!'))));
test('browser patch preserves movie timing, embedded assets, and tag ordering',()=>{
  const a=parseSwf(fs.readFileSync('tools/original-uncompressed.swf')),b=parseSwf(fs.readFileSync('tools/patched-uncompressed.swf'));
  assert.deepEqual(a.timing,b.timing);assert.equal(b.width,800);assert.equal(b.height,600);assert.equal(a.tags.length,b.tags.length);
  for(let i=0;i<a.tags.length;i++){assert.equal(a.tags[i].code,b.tags[i].code);if(a.tags[i].code!==82)assert.equal(a.tags[i].hash,b.tags[i].hash);}
});
test('roster contains actual upstream fighters and every portrait exists',()=>{
  const roster=JSON.parse(fs.readFileSync('apps/web/public/game/characters.json','utf8'));
  assert.ok(roster.some(f=>f.id==='ichigo'));assert.ok(roster.some(f=>f.id==='naruto'));
  assert.equal(new Set(roster.map(f=>f.id)).size,roster.length);
  for(const f of roster){assert.ok(f.name);assert.ok(fs.existsSync('apps/web/public'+f.portrait));}
});
test('all distributed external assets match official release bytes',()=>{
  const root='vendor/release-3.4/swf_output/assets';
  for(const entry of fs.readdirSync(root,{recursive:true,withFileTypes:true}).filter(e=>e.isFile())){
    const p=entry.parentPath+'/'+entry.name;const rel=p.slice(root.length+1);
    assert.equal(sha256(fs.readFileSync(p)),sha256(fs.readFileSync('apps/web/public/game/assets/'+rel)));
  }
});
