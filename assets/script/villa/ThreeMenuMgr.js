// 三级菜单管理类
var ThreeMenuMgr = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        // 家具一次显示多少数量
        this._furnitureTotal = 7;
        // 菜单列表
        this._menuList = [];
        // 当前选择的类型 1 单品 2 套装 3 物品柜
        this._curType = 0;
        // 当前选择物品ID
        this._curId = 0;
        // 是否可拖拽
        this._hasDrag = false;
        // 当前最大数量
        this._curTotal = 7;
        // 当前页签
        this._curPage = 1;
        // 最大页签
        this._maxPage = 1;
        // 图片载入回调
        this.bindLoadMenuImageCB = this.loadMenuImageCB.bind(this);
        // 上一次装扮的套装按钮
        this.lastSuitMenu = null;
    },
    // 属性
    properties: {
        margin: new Fire.Vec2(-1090, 0),
        // 三级菜单的根节点
        root: {
            default: null,
            type: Fire.Entity
        },
        // 页数
        pageText: {
            default: null,
            type: Fire.Text
        }
    },
    // 创建或者是切换材质
    createOrChangeFurniture: function (target) {
        var threeMenu = target.getComponent('ThreeMenu');
        if (threeMenu.hasUse) {
            this.dataBase.tipsWindow.openTipsWindow('对不起，当前物品已在房间中使用');
            return;
        }
        var ent, entComp;
        //this.dataBase.loadTips.openTips('创建家具中，请稍后...');
        // 墙壁与地板
        if (! threeMenu.hasDrag) {
            if (threeMenu.props_type === 1) {
                entComp = this.dataBase.background;
            }
            else if (threeMenu.props_type === 2) {
                entComp = this.dataBase.ground;
            }
            var self = this;
            entComp.menuData = threeMenu;
            entComp.setFurnitureData(threeMenu, true);
            self.dataBase.loadTips.openTips('创建图片中，请稍后...');
            self.dataBase.loadImage(entComp.imageUrl, function (error, image) {
                self.dataBase.loadTips.closeTips();
                if (error) {
                    console.log(error);
                    return;
                }
                bigSprite = new Fire.Sprite(image);
                entComp.setSprite(bigSprite);
            });
        }
        else {
            // 家具
            ent = Fire.instantiate(this.dataBase.tempFurniture);
            ent.active = true;
            ent.parent = this.dataBase.room;
            var pos = target.transform.worldPosition;
            var offset = Math.round(Math.random() * 100);
            pos.x += offset;
            pos.y += 400;
            ent.transform.position = new Fire.Vec2(pos.x, pos.y);
            ent.transform.scale = new Fire.Vec2(1.8, 1.8);
            ent.name = threeMenu.props_name;
            entComp = ent.getComponent('Furniture');
            entComp.menuData = threeMenu;
            entComp.setFurnitureData(threeMenu);
        }
        // 标记已经使用
        if (this._curType === 2) {
            threeMenu.setMarkUse(true);
        }
    },
    // 创建各个类型家具
    _onCreateFurnitureEvent: function (event) {
        console.log('创建家具ID:' + event.target.parent.name);
        this.createOrChangeFurniture(event.target.parent);
    },
    // 创建套装到场景中
    _onCreateSuitItemEvent: function (event) {
        var threeMenu = event.target.parent.getComponent('ThreeMenu');
        if (this.lastSuitMenu　&& this.lastSuitMenu !== threeMenu) {
            this.lastSuitMenu.setMarkUse(false);
        }
        if (threeMenu.hasUse) {
            this.dataBase.tipsWindow.openTipsWindow('对不起，当前套装已在房间中使用');
            return;
        }
        var self = this;
        // 删除套装
        self.dataBase.removeSuit();
        // 重新赋值套装
        self.dataBase.curDressSuit = {
            // 套装ID
            suit_id: threeMenu.suit_id,
            // 背包ID
            pack_id: threeMenu.pack_id,
            // 套装小图
            suit_icon: threeMenu.smallSprite,
            // 套装名称
            suit_name: threeMenu.suit_name,
            // 套装来自哪里，1.背包 2.商城
            suit_from: 1,
            // 套装价格
            price: threeMenu.price,
            // 折扣
            discount: threeMenu.discount,
            // 套装列表
            funrnitureList: []
        };
        if (threeMenu.dressList.length === 0) {
            self.dataBase.tipsWindow.openTipsWindow('这个一个空的套装...');
            return;
        }
        self.dataBase.loadTips.openTips('创建套装，请稍后...');
        self.dataBase.createFurnitureToScreen(threeMenu.dressList, function () {
            self.dataBase.loadTips.closeTips();
            // 标记已经使用
            if (self._curType === 2) {
                threeMenu.setMarkUse(true);
                self.lastSuitMenu = threeMenu;
            }
        });
    },
    // 重置菜单列表
    _resetMenu: function () {
        for (var i = 0; i < this._menuList.length; ++i) {
            var menu = this._menuList[i];
            menu.name = i.toString();
            menu.resetMenu();
        }
    },
    // 创建菜单按钮并且绑定事件 或者刷新
    _refreshSingleItems: function () {
        // 重置
        this._resetMenu();
        // 如果总数量有更新就重新计算最大页数
        var total = this.dataBase.single_Three_Total_Sheets[this._curId];
        if (this._curTotal !== total) {
            this._curTotal = total;
            this._maxPage = Math.ceil(this._curTotal / this._furnitureTotal);
        }
        // 赋值数据
        var index = 0;
        var startNum = (this._curPage - 1) * this._furnitureTotal;
        var endNum = startNum + this._furnitureTotal;
        if (endNum > this._curTotal) {
            endNum = this._curTotal;
        }
        var bindEvent = this._onCreateFurnitureEvent.bind(this);
        var dataSheets = this.dataBase.single_Three_DataSheets[this._curId];

        for(var i = startNum; i < endNum; ++i) {
            var menu = this._menuList[index];
            menu.entity.active = true;
            var menuData = dataSheets[i];
            if (!menuData) {
                continue;
            }
            menuData.props_type = this._curId;
            menuData.hasDrag = this._hasDrag;
            menu.entity.transform.position = new Fire.Vec2(-490 + (index * 160), 55);
            menu.refresh(menuData, bindEvent);
            index++;
        }
        // 刷新按钮状态
        this._refreshBtnState();
    },
    // 设置使用标记
    setMarkUse: function (menuData, menu) {
        if (this._curId === 0) {
            var children = this.dataBase.room.getChildren();
            for (var i = 0; i < children.length; ++i) {
                var ent = children[i];
                var furniture = ent.getComponent('Furniture');
                if (menuData.props_id === furniture.props_id &&
                    furniture.pack_id === menuData.pack_id) {
                    menu.setMarkUse(true);
                }
            }
        }
        else {
            if (parseInt(menuData.suit_id) === this.dataBase.curDressSuit.suit_id) {
                menu.setMarkUse(true);
                if(! this.lastSuitMenu) {
                    this.lastSuitMenu = menu;
                }
            }
        }
    },
    // 物品柜 0: 单品 1：套装
    _refreshBackpackItems: function () {
        // 重置
        this._resetMenu();
        var showTotal = this._furnitureTotal;
        if (this._curId === 1) {
            // 套装显示的数量
            showTotal = 5;
        }
        // 如果总数量有更新就重新计算最大页数
        var total = this.dataBase.backpack_Three_Total_Sheets[this._curId];
        if (this._curTotal !== total) {
            this._curTotal = total;
            var maxPage = Math.ceil(this._curTotal / showTotal);
            this._maxPage = maxPage === 0 ? 1 : maxPage;
        }
        // 赋值数据
        var index = 0;
        var startNum = (this._curPage - 1) * showTotal;
        var endNum = startNum + showTotal;
        if (endNum > this._curTotal) {
            endNum = this._curTotal;
        }
        var bindEvent = null;
        if (this._curId === 0) {
            // 创建单品家具到场景中
            bindEvent = this._onCreateFurnitureEvent.bind(this);
        }
        else {
            // 创建套装家具到场景中
            bindEvent = this._onCreateSuitItemEvent.bind(this);
        }
        var dataSheets = this.dataBase.backpack_Three_DataSheets[this._curId];
        for(var i = startNum; i < endNum; ++i) {
            var menu = this._menuList[index];
            if (this._curId === 0) {
                menu.entity.transform.position = new Fire.Vec2(-500 + (index * 160), 55);
            }
            else {
                menu.entity.transform.position = new Fire.Vec2(-490 + (index * 250), 20);
            }
            menu.entity.active = true;
            index++;
            var menuData = dataSheets[i];
            if (!menuData) {
                continue;
            }
            // 判断物品柜菜单的显示问题
            this.setMarkUse(menuData, menu);
            menu.refresh(menuData, bindEvent);
        }
        // 刷新按钮状态
        this._refreshBtnState();
    },
    // 创建菜单容器
    _createMenuEnt: function () {
        var tempFurniture = this.dataBase.tempSubThreeMenu;
        for (var i = 0; i < this._furnitureTotal; ++i) {
            var ent = Fire.instantiate(tempFurniture);
            ent.name = i.toString();
            ent.parent = this.root;
            ent.transform.position = new Fire.Vec2(-500 + (i * 160), 55);
            var menu = ent.getComponent('ThreeMenu');
            menu.init();
            // 存储对象
            this._menuList.push(menu);
        }
    },
    // 激活菜单时触发的事件
    // id: 那个类型物品的ID
    // type: 0 单品 1 套装 2 物品柜
    openMenu: function (id, type, hasDrag) {
        this._curType = type;
        this._curId = id;
        this._hasDrag = hasDrag;
        // 获取菜单按钮并且绑定事件
        switch (type) {
            case 0:
                this._refreshSingleItems();
                break;
            case 1:
                break;
            case 2:
                this._refreshBackpackItems();
                break;
        }
        // 显示当前窗口
        this.entity.active = true;
    },
    // 上一页
    _onPreviousEvent: function () {
        this._curPage -= 1;
        if (this._curPage < 1){
            this._curPage = 1;
        }
        if (this._curType === 0) {
            this._refreshSingleItems();
        }
        else if (this._curType === 2) {
            this._refreshBackpackItems();
        }
    },
    // 下一页
    _onNextEvent: function () {
        this._curPage += 1;
        if (this._curPage > this._maxPage){
            this._curPage = this._maxPage;
        }
        if (this._curType === 0) {
            this._refreshSingleItems();
        }
        else if (this._curType === 2) {
            this._refreshBackpackItems();
        }
    },
    // 返回上一级菜单
    _onReturnEvent: function () {
        this._curId = 0;
        this._curPage = 1;
        this.entity.active = false;
        this.dataBase.secondMenuMgr.openMenu(this._curType);
    },
    // 关闭菜单
    closeMenu: function (hasModifyToggle) {
        this._curId = 0;
        this._curPage = 1;
        this.entity.active = false;
        if (hasModifyToggle) {
            this.dataBase.firstMenuMgr.modifyToggle();
        }
    },
    // 关闭当前菜单
    _onCloseMenu: function () {
        this.closeMenu(true);
    },
    // 刷新按钮状态
    _refreshBtnState: function () {
        this.btn_Left.active = this._curPage > 1;
        this.btn_Right.active = this._curPage < this._maxPage;
        this.pageText.text = '页数:' + this._curPage + "/" + this._maxPage;
    },
    // 开始
    start: function () {
        // 常用的变量/数据
        var ent = Fire.Entity.find('/DataBase');
        this.dataBase = ent.getComponent('DataBase');
        // 获取关闭按钮并绑定事件
        ent = this.entity.find('btn_close');
        var btnClose = ent.getComponent('UIButton');
        btnClose.onClick = this._onCloseMenu.bind(this);
        // 返回上一级菜单
        ent = this.entity.find('btn_return');
        var btnReturn = ent.getComponent('UIButton');
        btnReturn.onClick = this._onReturnEvent.bind(this);
        // 上一页
        this.btn_Left = this.entity.find('btn_left');
        var btnLeft = this.btn_Left.getComponent('UIButton');
        btnLeft.onClick = this._onPreviousEvent.bind(this);
        // 下一页
        this.btn_Right = this.entity.find('btn_right');
        var btnRight = this.btn_Right.getComponent('UIButton');
        btnRight.onClick = this._onNextEvent.bind(this);
        //
        this.btn_Left.active = false;
        this.btn_Right.active = false;
        //
        this._createMenuEnt();
        // 预加载 Three Sub Menu
        this.dataBase.preloadSinagleItemsData_Three(1, this._curPage, this._furnitureTotal, this.bindLoadMenuImageCB);
        this.dataBase.preloadSinagleItemsData_Three(2, this._curPage, this._furnitureTotal, this.bindLoadMenuImageCB);
        this.dataBase.preloadSinagleItemsData_Three(3, this._curPage, this._furnitureTotal, this.bindLoadMenuImageCB);
        this.dataBase.preloadSinagleItemsData_Three(4, this._curPage, this._furnitureTotal, this.bindLoadMenuImageCB);
        this.dataBase.preloadSinagleItemsData_Three(5, this._curPage, this._furnitureTotal, this.bindLoadMenuImageCB);
        this.dataBase.preloadSinagleItemsData_Three(6, this._curPage, this._furnitureTotal, this.bindLoadMenuImageCB);
        this.dataBase.preloadSinagleItemsData_Three(7, this._curPage, this._furnitureTotal, this.bindLoadMenuImageCB);
        this.dataBase.preloadSinagleItemsData_Three(8, this._curPage, this._furnitureTotal, this.bindLoadMenuImageCB);
    },
    // 图片载入完毕以后的回调
    loadMenuImageCB: function (id, index, page, menuData) {
        if (this._curId === id && this._curPage === page) {
            var menu = this._menuList[index];
            if (menu) {
                menu.refresh(menuData, this._onCreateFurnitureEvent.bind(this));
            }
        }
    },
    update: function () {
        // 匹配UI分辨率
        //var camera = Fire.Camera.main;
        //var bgWorldBounds = this.dataBase.bgRender.getWorldBounds();
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
