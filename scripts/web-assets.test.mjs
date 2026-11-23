import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {sha256} from './swf.mjs';
import {readManifest,verifyWebAssets} from './web-assets.mjs';

test('production asset check rejects a missing or corrupt SWF',()=>{
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'bvn-deploy-'));
  try {
    const bytes=Buffer.from('test fixture');
    const manifest={files:{'game/test.swf':sha256(bytes)}};
    assert.throws(()=>verifyWebAssets(root,manifest),/Missing deployment asset/);
    fs.mkdirSync(path.join(root,'game'));
    fs.writeFileSync(path.join(root,'game/test.swf'),'corrupt');
    assert.throws(()=>verifyWebAssets(root,manifest),/checksum mismatch/);
    fs.writeFileSync(path.join(root,'game/test.swf'),bytes);
    assert.doesNotThrow(()=>verifyWebAssets(root,manifest));
  } finally {fs.rmSync(root,{recursive:true,force:true});}
});
test('repository public assets satisfy the deployment manifest',()=>{
  const manifest=readManifest();
  assert.ok(manifest.files['game/bvn-3.4-browser.swf']);
  assert.ok(manifest.files['game/characters.json']);
  assert.ok(manifest.files['game/assets/effect.swf']);
  verifyWebAssets('apps/web/public',manifest);
});
