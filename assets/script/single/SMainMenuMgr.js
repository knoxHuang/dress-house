// 主菜单 （我要装扮 保存装扮 我的装扮）
var SMainMenuMgr = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
    },
    // 属性
    properties: {
        // UI与屏幕的间距
        margin: {
            default: Fire.v2(72, 150)
        },
        imageMargin: {
            default: Fire.v2(1200, 900)
        },
        spacing: {
            default: 140
        }
    },
    // 是否装扮过
    _hasDressUp: function () {
        var hasDressUp = false;
        var bgComp = this.sdataBase.bgRender.getComponent('SFurniture');
        if (this.sdataBase.bgRender.sprite !== bgComp.defaultSprite) {
            hasDressUp = true;
        }
        var GdComp = this.sdataBase.groundRender.getComponent('SFurniture');
        if (this.sdataBase.groundRender.sprite !== GdComp.defaultSprite) {
            hasDressUp = true;
        }
        var children = this.sdataBase.room.getChildren();
        if (children.length > 2) {
            hasDressUp = true;
        }
        return hasDressUp;
    },
    // 清空场景
    resetScreen: function () {
        var children = this.sdataBase.room.getChildren();
        if (children.length <= 2){
            return;
        }
        for (var i = 2; i < children.length; i++) {
            children[i].destroy();
        }
    },
    // 我要装扮事件
    _onDoDressEvent: function () {
        if (this._hasDressUp()) {
            this.sdataBase.scontrolMgr.reset();
            this.sdataBase.sthreeMenuMgr.closeMenu();
            this.sdataBase.stipsWindow.openWindow('是否清空场景..', function () {
                this._initScreen();
                this.resetScreen();
            }.bind(this));
        }
        this.sdataBase.ssecondaryMenuMgr.openSecondaryMenu();
        this.sdataBase.characters.entity.active = false;
    },
    // 保存装扮事件
    _onSaveDressEvent: function () {
        this.sdataBase.characters.entity.active = false;
        this.sdataBase.scontrolMgr.reset();
        this.sdataBase.sthreeMenuMgr.closeMenu();
        this.sdataBase.ssaveRoomWindow.openWindow();
    },
    // 我的装扮事件
    _onMyDressEvent: function () {
        this.sdataBase.characters.entity.active = false;
        this.sdataBase.scontrolMgr.reset();
        this.sdataBase.sthreeMenuMgr.closeMenu();
        this.sdataBase.smyDressUpWindow.openWindow();
    },
    // 返回室外
    _onGoToOutDoorEvent: function () {
        Fire.Engine.loadScene('launch');
    },
    // 初始化菜单
    _initMenu: function () {
        var self = this;
        var children = this.entity.getChildren();
        self._menuList = [];
        for(var i = 0, len = children.length; i < len; ++i) {
            var ent = children[i];
            var btn = ent.getComponent(Fire.UIButton);
            if (! btn) { continue; }
            // 绑定按钮事件
            if (ent.name === "1") {
                btn.onClick = self._onDoDressEvent.bind(self);
            }
            else if (ent.name === "2") {
                btn.onClick = self._onSaveDressEvent.bind(self);
            }
            else if (ent.name === "3") {
                btn.onClick = self._onMyDressEvent.bind(self);
            }
            else if (ent.name === "4") {
                btn.onClick = self._onGoToOutDoorEvent.bind(self);
            }
        }
    },
    _initScreen: function () {
        this.sdataBase.preloadInitScreenData();
    },
    //
    onLoad: function () {
        // 页面大小发生变化的时候会调用这个事件
        var self = this;
        Fire.Screen.on('resize', function () {
            var width = self.documentElement.clientWidth;
            var height = self.documentElement.clientHeight;
            if (width < height) {
                this.sdataBase.stipsWindow.openWindow('横屏体验效果会更好..');
            }
            else {
                this.sdataBase.stipsWindow.closeWindow();
            }
        }.bind(this));
    },

    start: function () {
        var ent = Fire.Entity.find('/SDataBase');
        this.sdataBase = ent.getComponent('SDataBase');
        //
        var documentElement = document.documentElement;
        var width = documentElement.clientWidth;
        var height = documentElement.clientHeight;
        this.documentElement = documentElement;
        if (width < height) {
            this.sdataBase.stipsWindow.openWindow('横屏体验效果会更好..');
        }
        // 初始化菜单
        this._initMenu();
        // 初始化场景
        this._initScreen();

        Fire.Engine.preloadScene('launch');
    },

    // 刷新
    update: function () {
        // 匹配UI分辨率
        var camera = Fire.Camera.main;
        var screenSize = Fire.Screen.size.mul(camera.size / Fire.Screen.height);
        var newPos = Fire.v2(-screenSize.x / 2 + this.margin.x, screenSize.y / 2 - this.margin.y);
        this.entity.transform.position = newPos;
    }
});
