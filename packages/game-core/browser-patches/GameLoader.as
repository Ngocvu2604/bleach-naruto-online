package net.play5d.game.obvn.ctrler
{
   import flash.display.DisplayObject;
   import flash.display.Loader;
   import flash.display.MovieClip;
   import flash.display.Sprite;
   import flash.events.Event;
   import flash.events.ProgressEvent;
   import flash.system.ApplicationDomain;
   import flash.system.LoaderContext;
   import flash.utils.ByteArray;
   import flash.net.URLLoader;
   import flash.net.URLRequest;
   import flash.net.URLLoaderDataFormat;
   import flash.events.IOErrorEvent;
   import flash.events.SecurityErrorEvent;
   import net.play5d.game.obvn.Debugger;
   import net.play5d.game.obvn.fighter.Assister;
   import net.play5d.game.obvn.fighter.FighterMain;
   import net.play5d.game.obvn.map.MapMain;
   import net.play5d.game.obvn.map.vo.MapVO;
   import net.play5d.game.obvn.model.AssisterModel;
   import net.play5d.game.obvn.model.FighterModel;
   import net.play5d.game.obvn.model.MapModel;
   import net.play5d.game.obvn.vo.FighterVO;
   
   public class GameLoader
   {
      
      private static var _loaderCache:Vector.<Loader> = new Vector.<Loader>();
      
      private static var _bytesCache:Object = {};
      
      private static var _swfStampCache:Object = {};
      
      public function GameLoader()
      {
         super();
      }
      
      public static function loadFighter(param1:String, param2:Function, param3:Function = null, param4:Function = null, param5:Object = null) : void
      {
         var fighterId:String = param1;
         var back:Function = param2;
         var fail:Function = param3;
         var process:Function = param4;
         var customBackParam:Object = param5;
         var loadComplete:* = function(param1:DisplayObject):void
         {
            var _loc2_:FighterMain = new FighterMain(param1 as MovieClip);
            _loc2_.data = fv;
            if(back != null)
            {
               if(customBackParam)
               {
                  back(_loc2_,customBackParam);
               }
               else
               {
                  back(_loc2_);
               }
               back = null;
            }
         };
         var fv:FighterVO = FighterModel.I.getFighter(fighterId,true);
         if(!fv)
         {
            trace("GameLoader.loadFighter :: 角色 ID 不存在：" + fighterId);
            if(fail != null)
            {
               fail("角色 ID 错误！");
            }
            return;
         }
         loadSWF(fv.fileUrl,loadComplete,fail,process);
      }
      
      public static function loadAssister(param1:String, param2:Function, param3:Function = null, param4:Function = null, param5:Object = null) : void
      {
         var fighterId:String = param1;
         var back:Function = param2;
         var fail:Function = param3;
         var process:Function = param4;
         var customBackParam:Object = param5;
         var loadComplete:* = function(param1:DisplayObject):void
         {
            var _loc2_:Assister = new Assister(param1 as MovieClip);
            _loc2_.data = fv;
            if(back != null)
            {
               if(customBackParam)
               {
                  back(_loc2_,customBackParam);
               }
               else
               {
                  back(_loc2_);
               }
               back = null;
            }
         };
         var fv:FighterVO = AssisterModel.I.getAssister(fighterId,true);
         if(!fv)
         {
            trace("GameLoader.loadAssister :: 辅助 ID 不存在：" + fighterId);
            if(fail != null)
            {
               fail("辅助 ID 错误！");
            }
            return;
         }
         loadSWF(fv.fileUrl,loadComplete,fail,process);
      }
      
      public static function loadMap(param1:String, param2:Function, param3:Function = null, param4:Function = null, param5:Object = null) : void
      {
         var mapId:String = param1;
         var back:Function = param2;
         var fail:Function = param3;
         var process:Function = param4;
         var customBackParam:Object = param5;
         var loadComplete:* = function(param1:DisplayObject):void
         {
            var _loc2_:MapMain = new MapMain(param1 as Sprite);
            _loc2_.data = mv;
            if(back != null)
            {
               if(customBackParam)
               {
                  back(_loc2_,customBackParam);
               }
               else
               {
                  back(_loc2_);
               }
               back = null;
            }
         };
         var mv:MapVO = MapModel.I.getMap(mapId);
         if(!mv)
         {
            trace("GameLoader.loadMap :: 地图 ID 不存在：" + mapId);
            if(fail != null)
            {
               fail("地图 ID 错误！");
            }
            return;
         }
         loadSWF(mv.fileUrl,loadComplete,fail,process);
      }
      
      public static function dispose() : void
      {
         while(_loaderCache.length > 0)
         {
            unloadLoader(_loaderCache[0]);
         }
      }
      
      // Browser integration: HTTP binary assets replace AIR filesystem IO.
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

      private static function spawnSWF(param1:ByteArray, param2:Function, param3:Function = null, param4:Function = null) : void
      {
         var loader:Loader;
         var context:LoaderContext;
         var bytes:ByteArray = param1;
         var back:Function = param2;
         var fail:Function = param3;
         var process:Function = param4;
         var loadComplete:* = function(param1:Event):void
         {
            loader.contentLoaderInfo.removeEventListener("complete",loadComplete);
            loader.contentLoaderInfo.removeEventListener("ioError",loadError);
            loader.contentLoaderInfo.removeEventListener("progress",loadProcess);
            if(back != null)
            {
               back(loader.content);
               back = null;
            }
         };
         var loadError:* = function(param1:Event):void
         {
            loader.contentLoaderInfo.removeEventListener("complete",loadComplete);
            loader.contentLoaderInfo.removeEventListener("ioError",loadError);
            loader.contentLoaderInfo.removeEventListener("progress",loadProcess);
            unloadLoader(loader);
            Debugger.log("GameLoader.spawnSWF :: " + param1);
            if(fail != null)
            {
               fail("加载 SWF 文件出错！");
            }
         };
         var loadProcess:* = function(param1:ProgressEvent):void
         {
            if(process != null && param1.bytesTotal > 0)
            {
               process(param1.bytesLoaded / param1.bytesTotal);
            }
         };
         var copy:ByteArray = new ByteArray();
         bytes.position = 0;
         copy.writeBytes(bytes);
         copy.position = 0;
         loader = new Loader();
         context = new LoaderContext(false,new ApplicationDomain());
         // AIR-only flag is unnecessary in Ruffle Web.
         loader.contentLoaderInfo.addEventListener("complete",loadComplete);
         loader.contentLoaderInfo.addEventListener("ioError",loadError);
         loader.contentLoaderInfo.addEventListener("progress",loadProcess);
         _loaderCache.push(loader);
         loader.loadBytes(copy,context);
      }
      
      private static function unloadLoader(param1:Loader) : void
      {
         var _loc2_:int = _loaderCache.indexOf(param1);
         if(_loc2_ != -1)
         {
            _loaderCache.splice(_loc2_,1);
         }
         try
         {
            param1.unloadAndStop(true);
         }
         catch(e:Error)
         {
            trace("GameLoader.unloadLoader :: " + e);
            try
            {
               param1.unload();
            }
            catch(e2:Error)
            {
               trace("GameLoader.unloadLoader :: " + e2);
            }
         }
      }
   }
}

