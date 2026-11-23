import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const compile=async file=>{
  const source=fs.readFileSync(file,'utf8');
  const {outputText}=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}});
  return import('data:text/javascript;base64,'+Buffer.from(outputText).toString('base64'));
};
test('Ruffle uses v1 suspend lifecycle and leaves game frame rate untouched',async()=>{
  const calls=[];let options;
  const api={load:async value=>{options=value;},suspend:()=>calls.push('suspend'),volume:1,traceObserver:null};
  const element={isConnected:true,tabIndex:-1,ruffle:()=>api,setAttribute:()=>{},focus:()=>calls.push('focus'),remove:()=>calls.push('remove')};
  globalThis.window={RufflePlayer:{newest:()=>({createPlayer:()=>element})}};
  const {RufflePlayer}=await compile('apps/web/src/game/RufflePlayer.ts');
  const player=new RufflePlayer({replaceChildren:e=>assert.equal(e,element)});
  const trace=()=>{};await player.load(trace);player.setVolume(.4);
  assert.equal(options.url,'/game/bvn-3.4-browser.swf');assert.equal(options.base,'/game/');
  assert.equal(options.frameRate,undefined);assert.equal(options.allowScriptAccess,false);
  assert.equal(api.traceObserver,trace);assert.equal(api.volume,.4);
  player.destroy();assert.deepEqual(calls,['focus','suspend','remove']);assert.equal(api.traceObserver,null);
});
test('keyboard guard prevents page scrolling only for focused game navigation',async()=>{
  let listener,removed=false;
  globalThis.window={addEventListener:(type,fn)=>{assert.equal(type,'keydown');listener=fn;},removeEventListener:(type,fn)=>{removed=type==='keydown'&&fn===listener;}};
  const {guardGameKeys}=await compile('apps/web/src/game/InputManager.ts');
  const container={};const release=guardGameKeys(container);let prevented=0;
  const event=(key,path)=>({key,composedPath:()=>path,preventDefault:()=>prevented++});
  listener(event('ArrowDown',[container]));listener(event('ArrowDown',[]));listener(event('j',[container]));
  assert.equal(prevented,1);release();assert.ok(removed);
});
