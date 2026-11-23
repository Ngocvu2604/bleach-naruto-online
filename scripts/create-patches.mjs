import fs from 'node:fs';
let s=fs.readFileSync('tools/decompiled/scripts/net/play5d/game/obvn/ctrler/GameLoader.as','utf8');
s=s.replace(/\s*import flash\.filesystem\.[^;]+;/g,'').replace(/\s*import net\.play5d\.game\.obvn\.utils\.air\.FileStamp;/,'');
s=s.replace('import flash.utils.ByteArray;','import flash.utils.ByteArray;\n   import flash.net.URLLoader;\n   import flash.net.URLRequest;\n   import flash.net.URLLoaderDataFormat;\n   import flash.events.IOErrorEvent;\n   import flash.events.SecurityErrorEvent;');
let start=s.indexOf('      private static function loadSWF('),end=s.indexOf('      private static function spawnSWF(',start);
s=s.slice(0,start)+`      // Browser integration: HTTP binary assets replace AIR filesystem IO.
      private static function loadSWF(url:String, back:Function, fail:Function = null, process:Function = null):void {
         var cached:ByteArray = _bytesCache[url] as ByteArray;
         if (cached) { spawnSWF(cached, back, fail, process); return; }
         var request:URLLoader = new URLLoader();
         var complete:Function;
         var failed:Function;
         var progress:Function;
         var cleanup:Function;
         cleanup = function():void {
            request.removeEventListener(Event.COMPLETE, complete);
            request.removeEventListener(IOErrorEvent.IO_ERROR, failed);
            request.removeEventListener(SecurityErrorEvent.SECURITY_ERROR, failed);
            request.removeEventListener(ProgressEvent.PROGRESS, progress);
         };
         complete = function(e:Event):void {
            cleanup();
            var bytes:ByteArray = request.data as ByteArray;
            _bytesCache[url] = bytes;
            spawnSWF(bytes, back, fail, process);
         };
         failed = function(e:Event):void { cleanup(); if (fail != null) fail("Asset load failed: " + url); };
         progress = function(e:ProgressEvent):void { if (process != null && e.bytesTotal > 0) process(e.bytesLoaded / e.bytesTotal); };
         request.dataFormat = URLLoaderDataFormat.BINARY;
         request.addEventListener(Event.COMPLETE, complete);
         request.addEventListener(IOErrorEvent.IO_ERROR, failed);
         request.addEventListener(SecurityErrorEvent.SECURITY_ERROR, failed);
         request.addEventListener(ProgressEvent.PROGRESS, progress);
         request.load(new URLRequest(url));
      }

`+s.slice(end);
start=s.indexOf('      private static function readSWF(');end=s.indexOf('      private static function unloadLoader(',start);s=s.slice(0,start)+s.slice(end);
s=s.replace('context.allowCodeImport = true;','// AIR-only flag is unnecessary in Ruffle Web.');
fs.writeFileSync('packages/game-core/browser-patches/GameLoader.as',s);
