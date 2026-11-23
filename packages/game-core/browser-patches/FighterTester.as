package
{
   import flash.display.Sprite;
   import flash.events.Event;
   import flash.events.KeyboardEvent;
   import flash.geom.Rectangle;
   import flash.text.TextField;
   import flash.text.TextFormat;
   import flash.utils.setTimeout;
   import net.play5d.game.obvn.Debugger;
   import net.play5d.game.obvn.MainGame;
   import net.play5d.game.obvn.ctrler.GameLogic;
   import net.play5d.game.obvn.ctrler.StateCtrler;
   import net.play5d.game.obvn.ctrler.game_ctrler.GameCtrler;
   import net.play5d.game.obvn.ctrler.game_ctrler.TrainingCtrler;
   import net.play5d.game.obvn.data.GameConfig;
   import net.play5d.game.obvn.data.GameData;
   import net.play5d.game.obvn.data.GameInterface;
   import net.play5d.game.obvn.data.GameInterfaceManager;
   import net.play5d.game.obvn.data.GameMode;
   import net.play5d.game.obvn.fighter.FighterMain;
   import net.play5d.game.obvn.fighter.ctrler.FighterCtrler;
   import net.play5d.game.obvn.fighter.ctrler.FighterEffectCtrler;
   import net.play5d.game.obvn.fighter.event.FighterEventDispatcher;
   import net.play5d.game.obvn.fighter.vo.HitVO;
   import net.play5d.game.obvn.model.MapModel;
   import net.play5d.game.obvn.stage.LoadingStage;
   import net.play5d.game.obvn.vo.GameRunDataVO;
   import net.play5d.game.obvn.vo.SelectVO;
   import net.play5d.kyo.display.ui.KyoSimpButton;
   public class FighterTester extends Sprite
   {
      
      private var _mainGame:MainGame;
      
      private var _gameSprite:Sprite;
      
      private var _testUI:Sprite;
      
      private var _p1InputId:TextField;
      
      private var _p2InputId:TextField;
      
      private var _p1FzInputId:TextField;
      
      private var _p2FzInputId:TextField;
      
      private var _autoReceiveHp:TextField;
      
      private var _mapInputId:TextField;
      
      private var _fpsInput:TextField;
      
      private var _debugText:TextField;
      
      public function FighterTester()
      {
         super();
         if(stage)
         {
            initialize();
            return;
         }
         addEventListener("addedToStage",initialize);
      }
      
      private static function loadGame() : void
      {
         var _loc1_:LoadingStage = new LoadingStage();
         MainGame.stageCtrler.goStage(_loc1_);
      }
      
      private function initialize(param1:Event = null) : void
      {
         removeEventListener("addedToStage",initialize);
         // Browser presentation: do not create FPS/mode overlays or debug callbacks.
         _gameSprite = new Sprite();
         _gameSprite.scrollRect = new Rectangle(0,0,GameConfig.GAME_SIZE.x,GameConfig.GAME_SIZE.y);
         addChild(_gameSprite);
         GameInterface.instance = new GameInterfaceManager();
         GameData.I.config.keyInputMode = 1;
         GameData.I.config.quality = "low";
         GameData.I.config.fighterHP = 2;
         GameData.I.config.AI_level = 6;
         GameData.I.config.fightTime = -1;
         _mainGame = new MainGame();
         _mainGame.initlize(_gameSprite,stage,initBackHandler,initFailHandler);
         StateCtrler.I.transEnabled = false;
      }
      
      private function initBackHandler() : void
      {
         _mainGame.goMenu();
      }
      
      private function initFailHandler(param1:String) : void
      {
      }
      
      private function buildTestUI() : void
      {
         _testUI = new Sprite();
         _testUI.x = 810;
         _testUI.graphics.beginFill(3355443,1);
         _testUI.graphics.drawRect(-10,0,200,600);
         _testUI.graphics.endFill();
         addChild(_testUI);
         var _loc1_:Number = 20;
         addLabel("玩家 1",_loc1_);
         _loc1_ += 40;
         addLabel("角色id",_loc1_);
         _p1InputId = addInput("ichigo",_loc1_,80);
         _loc1_ += 40;
         addLabel("辅助id",_loc1_);
         _p1FzInputId = addInput("kon",_loc1_,80);
         _loc1_ += 80;
         addLabel("玩家 2",_loc1_);
         _loc1_ += 40;
         addLabel("角色id",_loc1_);
         _p2InputId = addInput("naruto",_loc1_,80);
         _loc1_ += 40;
         addLabel("辅助id",_loc1_);
         _p2FzInputId = addInput("gaara",_loc1_,80);
         _loc1_ += 40;
         addLabel("地图id",_loc1_);
         _mapInputId = addInput(MapModel.I.getAllMaps()[1].id,_loc1_,80);
         _loc1_ += 60;
         addLabel("帧率",_loc1_);
         _fpsInput = addInput(GameConfig.FPS_GAME.toString(),_loc1_,80);
         _loc1_ += 40;
         addLabel("回血",_loc1_);
         _autoReceiveHp = addInput("1",_loc1_,80);
         _loc1_ += 60;
         _debugText = addLabel("错误信息提示",_loc1_,0,{
            "font":"Times New Roman",
            "size":12
         });
         _debugText.width = 190;
         _debugText.height = 200;
         _debugText.textColor = 16711680;
         _debugText.multiline = true;
         addButton("开始测试",500,25,65,35,testClickHandler);
         addButton("显示判定",500,100,65,35,renderMainClickHandler);
         addButton("秒杀 P2",550,25,65,35,killP2ClickHandler);
         addButton("Esc 键",550,100,65,35,escKeyDownClickHandler);
      }
      
      private function addLabel(param1:String, param2:Number = 0, param3:Number = 0, param4:Object = null) : TextField
      {
         if(!param4)
         {
            param4 = {};
         }
         param4.size ||= 14;
         param4.color ||= 16777215;
         param4.font ||= "SimHei";
         var _loc5_:TextFormat = new TextFormat();
         _loc5_.size = param4.size;
         _loc5_.color = param4.color;
         _loc5_.font = param4.font;
         var _loc6_:TextField = new TextField();
         _loc6_.defaultTextFormat = _loc5_;
         _loc6_.text = param1;
         _loc6_.x = param3;
         _loc6_.y = param2;
         _loc6_.mouseEnabled = false;
         _testUI.addChild(_loc6_);
         return _loc6_;
      }
      
      private function addInput(param1:String, param2:Number = 0, param3:Number = 0) : TextField
      {
         var _loc4_:TextFormat = new TextFormat();
         _loc4_.size = 14;
         _loc4_.color = 0;
         var _loc5_:TextField = new TextField();
         _loc5_.defaultTextFormat = _loc4_;
         _loc5_.text = param1;
         _loc5_.x = param3;
         _loc5_.y = param2;
         _loc5_.width = 100;
         _loc5_.height = 20;
         _loc5_.backgroundColor = 16777215;
         _loc5_.background = true;
         _loc5_.type = "input";
         _loc5_.condenseWhite = true;
         _testUI.addChild(_loc5_);
         return _loc5_;
      }
      
      private function addButton(param1:String, param2:Number = 0, param3:Number = 0, param4:Number = 100, param5:Number = 50, param6:Function = null) : Sprite
      {
         var _loc7_:KyoSimpButton = new KyoSimpButton(param1,param4,param5);
         _loc7_.x = param3;
         _loc7_.y = param2;
         if(param6 != null)
         {
            _loc7_.onClick(param6);
         }
         _testUI.addChild(_loc7_);
         return _loc7_;
      }
      
      private function onDebugLog(param1:String) : void
      {
         if(!_debugText)
         {
            return;
         }
         _debugText.text = param1;
      }
      
      private function changeFps(... rest) : void
      {
         var _loc2_:int = int(_fpsInput.text);
         GameConfig.setGameFps(_loc2_);
         stage.frameRate = _loc2_;
      }
      
      private function testClickHandler(... rest) : void
      {
         changeFps();
         GameMode.currentMode = 40;
         TrainingCtrler.RECOVER_HP = _autoReceiveHp.text != "0";
         GameData.I.p1Select = new SelectVO();
         GameData.I.p2Select = new SelectVO();
         GameData.I.p1Select.fighter1 = _p1InputId.text;
         GameData.I.p2Select.fighter1 = _p2InputId.text;
         GameData.I.p1Select.fuzhu = _p1FzInputId.text;
         GameData.I.p2Select.fuzhu = _p2FzInputId.text;
         GameData.I.selectMap = _mapInputId.text;
         loadGame();
      }
      
      private function killP2ClickHandler(... rest) : void
      {
         var _loc4_:GameRunDataVO = GameCtrler.I.gameRunData;
         if(!_loc4_)
         {
            Debugger.errorMsg("FighterTester.killP2ClickHandler :: 没有游戏数据！");
            return;
         }
         if(!GameCtrler.I.actionEnable)
         {
            Debugger.errorMsg("FighterTester.killP2ClickHandler :: 正处于系统控制中！");
            return;
         }
         if(GameCtrler.I.isPauseGame)
         {
            Debugger.errorMsg("FighterTester.killP2ClickHandler :: 正处于暂停！");
            return;
         }
         var _loc3_:FighterMain = _loc4_.p1FighterGroup.currentFighter;
         var _loc2_:FighterMain = _loc4_.p2FighterGroup.currentFighter;
         if(!_loc3_ || !_loc2_)
         {
            return;
         }
         if(GameMode.currentMode == 40)
         {
            Debugger.errorMsg("FighterTester.killP2ClickHandler :: 当前为练习模式!");
            return;
         }
         if(!_loc3_.isAlive || !_loc2_.isAlive)
         {
            return;
         }
         killP2(_loc3_,_loc2_);
      }
      
      private function killP2(param1:FighterMain, param2:FighterMain) : void
      {
         var _loc3_:HitVO = new HitVO();
         _loc3_.owner = param1;
         var _loc4_:Number = param2.hp;
         param2.hurtHit = _loc3_;
         param2.loseHp(_loc4_);
         var _loc6_:FighterCtrler = param2.getCtrler();
         _loc6_.getMcCtrl().idle();
         _loc6_.getMcCtrl().hurtFly(-5,0);
         _loc6_.getVoiceCtrl().playVoice(2);
         var _loc5_:FighterEffectCtrler = _loc6_.getEffectCtrl();
         _loc5_.endBisha();
         _loc5_.endGhostStep();
         _loc5_.endGlow();
         if(GameLogic.checkFighterDie(param2))
         {
            Debugger.errorMsg("FighterTester.killP2 :: 掉血：" + _loc4_);
            FighterEventDispatcher.dispatchEvent(param2,"DIE");
            param2.isAlive = false;
            trace("FighterTester.killP2 :: 秒杀 P2 成功！");
         }
      }
      
      private function escKeyDownClickHandler(... rest) : void
      {
         var params:Array = rest;
         var escKeyDownEvent:KeyboardEvent = new KeyboardEvent("keyDown");
         escKeyDownEvent.keyCode = 27;
         stage.dispatchEvent(escKeyDownEvent);
         setTimeout(function():void
         {
            var _loc1_:KeyboardEvent = new KeyboardEvent("keyUp");
            _loc1_.keyCode = 27;
            stage.dispatchEvent(_loc1_);
            trace("FighterTester.escKeyDownClickHandler :: 发送 ESC 按键事件完成!");
         },80);
      }
      
      private function renderMainClickHandler(param1:Event) : void
      {
         var _loc2_:KyoSimpButton = param1.target as KyoSimpButton;
         if(_loc2_.getLabel() == "显示判定")
         {
            _loc2_.setLabel("关闭判定");
         }
         else
         {
            _loc2_.setLabel("显示判定");
         }
         Debugger.showMain();
      }
   }
}



