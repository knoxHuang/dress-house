// 一级菜单（单品/套装/物品柜）
var FirstMenuMgr = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        // 菜单列表
        this._menuList = [];
    },
    // 属性
    properties: {
        margin: {
            default: Fire.v2(0, 100)
        }
    },
    // 重置Toggle状态
    modifyToggle: function () {
        var child, toggle;
        for(var i = 0; i < this._menuList.length ;++i) {
            child = this._menuList[i];
            toggle = child.getComponent('Toggle');
            toggle.resetToggle();
        }
    },
    // 打开二级菜单
    _onOpenSecondMenuEvent: function (event) {
        this.modifyToggle();
        var id = parseInt(event.target.name);
        this.dataBase.secondMenuMgr.openMenu(id);
    },
    // 打开二级菜单
    _onRemoveScreenEvent: function (event) {
        var self = this;
        self.dataBase.tipsWindow.openTipsWindow('是否清空场景？', function () {
            self.dataBase.resetScreen(function () {
                self.dataBase.secondMenuMgr.closeMenu(true);
                self.dataBase.threeMenuMgr.closeMenu(true);
                self.dataBase.loadTips.openTips('初始化场景！');
                var sendData = {
                    mark: self.dataBase.mark,
                    clear: 1
                };
                self.dataBase.intoRoom(sendData, function () {
                    self.dataBase.loadTips.closeTips();
                });
            });
        });
    },
    // 获取菜单按钮并且绑定事件
    _initMenu: function () {
        var self = this;
        var children = this.entity.getChildren();
        self._menuList = [];
        for (var i = 1; i < children.length; ++i) {
            // 绑定按钮事件
            if (i === 1) {
                var btn = children[i].getComponent(Fire.UIButton);
                btn.onClick = self._onRemoveScreenEvent.bind(self);
            }
            else {
                var toggle = children[i].getComponent('Toggle');
                toggle.onClick = self._onOpenSecondMenuEvent.bind(self);
                self._menuList.push(toggle);
            }
        }
    },
    // 打开一级菜单
    openMenu: function () {
        if (this.entity.active) {
            return;
        }
        this.entity.active = true;
        this._menuList[0].defaultToggle(function () {
            this.dataBase.secondMenuMgr.openMenu(0);
        }.bind(this));
    },
    // 关闭
    closeMenu: function () {
        this.entity.active = false;
        this.dataBase.secondMenuMgr.closeMenu(true);
        this.dataBase.threeMenuMgr.closeMenu(true);
    },
    // 开始
    start: function () {
        // 常用的变量/数据
        var gameDataEnt = Fire.Entity.find('/DataBase');
        this.dataBase = gameDataEnt.getComponent('DataBase');
        // 二级菜单
        this.secondMenuMgr = this.dataBase.secondMenuMgr;
        // 获取菜单按钮并且绑定事件
        this._initMenu();
    },
    // 更新
    update: function () {
        var camera = Fire.Camera.main;
        var screenSize = Fire.Screen.size.mul(camera.size / Fire.Screen.height);
        var newPos = Fire.v2(this.margin.x, -screenSize.y / 2 + this.margin.y);
        this.entity.transform.position = newPos;
    }
});
