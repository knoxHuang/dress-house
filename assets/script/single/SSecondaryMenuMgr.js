// 二级菜单管理类
var SSecondaryMenuMgr = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        // 一页显示多少个
        this._showTotal = 8;
        // 菜单容器列表
        this._menuSheets = [];
        // 打开三级菜单事件
        this.bindOpenThreeMenuEvent = this._onOpenThreeMenuEvent.bind(this);
        // 单品菜单回调函数
        this.bindRefreshEevnt = this._refreshSingleSecondaryMenu.bind(this);
    },
    // 属性
    properties: {
        //
        margin: new Fire.Vec2(0, 64),
        // 二级菜单的根节点
        rootNode: {
            default: null,
            type: Fire.Entity
        }
    },
    // 打开各个类型家具列表
    _onOpenThreeMenuEvent: function (event) {
        var menu = event.target.parent.getComponent('SSecondaryMenu');
        console.log('获取' + menu.tid + "类型家具列表");
        this.sdataBase.sthreeMenuMgr.openMenu(menu.tid, menu.hasDrag);
    },
    // 重置菜单列表
    _resetMenu: function () {
        if (this._menuSheets.length === 0){
            return;
        }
        for (var i = 0; i < this._showTotal; ++i) {
            var menu = this._menuSheets[i];
            menu.name = i.toString();
            menu.resetMenu();
        }
    },
    // 创建菜单容器
    _createMenuContainers: function () {
        if (this._menuSheets.length > 0) {
            return;
        }
        var tempMenu = this.sdataBase.tempSecondaryMenu;
        for (var i = 0; i < this._showTotal; ++i) {
            var ent = Fire.instantiate(tempMenu);
            ent.name = i.toString();
            ent.parent = this.rootNode;
            ent.transform.position = new Fire.Vec2(-495 + (i * 140), 0);
            var menu = ent.getComponent('SSecondaryMenu');
            menu.init();
            // 存储对象
            this._menuSheets.push(menu);
        }
    },
    // 刷新二级菜单
    _refreshSecondaryMenu: function () {
        // 创建容器
        this._createMenuContainers();
        // 重置菜单列表
        this._resetMenu();
        // 重新赋值
        var i = 0, menu = null;
        var dataList = this.sdataBase.secondaryMenuDataSheets;
        for(i = 0; i < dataList.length; ++i) {
            var data = dataList[i];
            if (! data){
                continue;
            }
            menu = this._menuSheets[i];
            menu.refresh(data, this.bindOpenThreeMenuEvent);
        }
    },
    // 刷新单个二级菜单
    _refreshSingleSecondaryMenu: function (index, data) {
        var menu = this._menuSheets[index];
        if (menu) {
            menu.refresh(data, this.bindOpenThreeMenuEvent);
        }
    },
    onLoad: function () {
        var ent = Fire.Entity.find('/SDataBase');
        this.sdataBase = ent.getComponent('SDataBase');
        // 预加载 单品
        this.sdataBase.preloadSecondaryMenuData(this.bindRefreshEevnt);
    },
    // 开始
    start: function () {
        // 刷新单品家具菜单列表
        this._refreshSecondaryMenu();
    },
    update: function () {
        // 匹配UI分辨率
        //var camera = Fire.Camera.main;
        //var bgWorldBounds = this.sdataBase.bgRender.getWorldBounds();
        //var bgLeftTopWorldPos = new Fire.Vec2(bgWorldBounds.xMin, bgWorldBounds.yMin);
        //var bgleftTop = camera.worldToScreen(bgLeftTopWorldPos);
        //var screenPos = new Fire.Vec2(bgleftTop.x, bgleftTop.y);
        //var worldPos = camera.screenToWorld(screenPos);
        //this.entity.transform.worldPosition = worldPos;
        // 匹配UI分辨率
        var camera = Fire.Camera.main;
        var screenSize = Fire.Screen.size.mul(camera.size / Fire.Screen.height);
        var newPos = Fire.v2(this.margin.x, -screenSize.y / 2 + this.margin.y);
        this.entity.transform.position = newPos;
    }
});
