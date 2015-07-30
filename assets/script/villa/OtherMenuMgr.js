// 其他菜单管理类
var OtherMenuMgr = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        this.children = [];
    },
    // 属性
    properties: {
        margin: new Fire.Vec2()
    },
    // 切换楼层
    _onChangeFloorEvent: function () {
        this.dataBase.floorWin.openWindow();
        this.dataBase.characters.entity.active = false;
    },
    // 获取菜单按钮并且绑定事件
    _initMenu: function () {
        var self = this;
        var children = this.entity.getChildren();
        self.children = [];
        children.forEach(function (ent) {
            // 绑定按钮事件
            var btn = ent.getComponent('UIButton');
            if (ent.name === "1") {
                btn.onClick = self._onChangeFloorEvent.bind(self);
            }
            self.children.push(btn);
        });
    },
    // 载入
    onLoad: function () {
        // 常用的变量/数据
        var gameDataEnt = Fire.Entity.find('/DataBase');
        this.dataBase = gameDataEnt.getComponent('DataBase');
        // 获取菜单按钮并且绑定事件
        this._initMenu();
    },
    // 开始
    start: function () {

    },
    // 刷新
    update: function () {
        // 匹配UI分辨率
        //var camera = Fire.Camera.main;
        //var bgWorldBounds = this.dataBase.bgRender.getWorldBounds();
        //var bgRightTopWorldPos = new Fire.Vec2(bgWorldBounds.xMax, bgWorldBounds.yMax);
        //var bgRightTop = camera.worldToScreen(bgRightTopWorldPos);
        //var screenPos = new Fire.Vec2(bgRightTop.x, bgRightTop.y);
        //var worldPos = camera.screenToWorld(screenPos);
        //this.entity.transform.worldPosition = worldPos;
        // 匹配UI分辨率
        var camera = Fire.Camera.main;
        var screenSize = Fire.Screen.size.mul(camera.size / Fire.Screen.height);
        var newPos = Fire.v2(screenSize.x / 2 + this.margin.x, screenSize.y / 2 - this.margin.y);
        this.entity.transform.position = newPos;
    }
});
