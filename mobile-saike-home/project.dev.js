require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"Characters":[function(require,module,exports){
Fire._RFpush(module, 'e37cdeJFCZCFqck6C36DQAw', 'Characters');
// script\common\Characters.js

var Comp = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
    },
    // 属性
    properties: {
        imageMargin: Fire.v2(1500, 800),
        host: {
            default: null,
            type: Fire.SpriteRenderer
        },
        host_name: {
            default: null,
            type: Fire.BitmapText
        },
        tempFamily: {
            default: null,
            type: Fire.Entity
        },
        familyRoot: {
            default: null,
            type: Fire.Entity
        }
    },
    // 开始
    start: function () {
        var ent = Fire.Entity.find('/DataBase');
        if(!ent) {
            ent = Fire.Entity.find('/ODataBase');
            this.dataBase = ent.getComponent('ODataBase');
        }
        else{
            this.dataBase = ent.getComponent('DataBase');
        }
    },

    setHost: function (image, name) {
        var newSprite = new Fire.Sprite(image);
        newSprite.pixelLevelHitTest = true;
        this.host_name.text = name;
        this.host.sprite = newSprite
        this.dataBase.globalData.hostSprite = newSprite;
        this.dataBase.globalData.hostName = name;
    },

    addFamily: function (image, name) {
        var ent = Fire.instantiate(this.tempFamily);
        ent.parent = this.familyRoot;
        ent.position = new Fire.Vec2(0, 0);
        var render = ent.getComponent(Fire.SpriteRenderer);
        render.sprite = new Fire.Sprite(image);
        render.sprite.pixelLevelHitTest = true;
        var family_name = ent.find('family_name').getComponent(Fire.BitmapText);
        family_name.text = name;
        return ent;
    },

    updateFamily: function (ent, image, name) {
        ent.parent = this.familyRoot;
        ent.position = new Fire.Vec2(0, 0);
        var render = ent.getComponent(Fire.SpriteRenderer);
        render.sprite = new Fire.Sprite(image);
        render.sprite.pixelLevelHitTest = true
        var family_name = ent.find('family_name').getComponent(Fire.BitmapText);
        family_name.text = name;
    },

    // 更新
    update: function () {
        var camera = Fire.Camera.main;
        var bgWorldBounds = this.dataBase.bgRender.getWorldBounds();
        var bgLeftTopWorldPos = new Fire.Vec2(bgWorldBounds.xMin + this.imageMargin.x, bgWorldBounds.yMin + this.imageMargin.y);
        var bgleftTop = camera.worldToScreen(bgLeftTopWorldPos);
        var screenPos = new Fire.Vec2(bgleftTop.x, bgleftTop.y);
        var worldPos = camera.screenToWorld(screenPos);
        this.entity.transform.worldPosition = worldPos;

    }
});

Fire._RFpop();
},{}],"ControlMgr":[function(require,module,exports){
Fire._RFpush(module, 'ab20f9isaBNT4aLsgcbwEAQ', 'ControlMgr');
// script\villa\ControlMgr.js

// 用户输入管理类
var ControlMgr = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        this.bindedMouseDownEvent = this._onMouseDownEvent.bind(this);
        this.bindedMouseMoveEvent = this._onMouseMoveEvent.bind(this);
        this.bindedMouseUpEvent = this._onMouseUpEvent.bind(this);
        this._backupSelectTarget = null;
    },
    // 属性
    properties: {
        _selectTarget: null,
        _lastSelectTarget: null,
        _selectTargetInitPos: Fire.Vec2.zero,
        _mouseDownPos: Fire.Vec2.zero,
        _hasMoveTarget: false
    },
    // 鼠标按下事件
    _onMouseDownEvent: function (event) {
        var target = event.target;
        if (!target ) {
            return;
        }
        var ent = target.parent || target;
        var furniture = ent.getComponent('Furniture');
        // 大于2 说明可以拖动
        if (furniture && furniture.props_type > 2) {
            //
            this._selectTarget = ent;
            this._backupSelectTarget = this._selectTarget;
            this._selectTargetInitPos = ent.transform.position;
            var screendPos = new Fire.Vec2(event.screenX, event.screenY);
            this._mouseDownPos = Fire.Camera.main.screenToWorld(screendPos);
            this._selectTarget.setAsLastSibling();
            this._hasMoveTarget = true;
            // 是否打开控制选项，如果是相同的对象就不需要重新打开
            if (this._selectTarget !== this._lastSelectTarget) {
                this.dataBase.options.open(this._selectTarget);
                this._lastSelectTarget = this._selectTarget;
            }
            this.dataBase.threeMenuMgr.closeMenu(true);
            this.dataBase.secondMenuMgr.closeMenu(true);
        }
        else {
            if (this.dataBase.options.hasOpen()) {
                if (this.dataBase.options.hasTouch(target)) {
                    this._selectTarget = this._backupSelectTarget;
                }
                else {
                    this._selectTarget = null;
                    this.dataBase.options.hide();
                }
            }
        }
    },
    // 鼠标移动事件
    _onMouseMoveEvent: function (event) {
        if (this._selectTarget && this._hasMoveTarget) {
            this._move(event);
        }
    },
    // 移动家具
    _move: function (event) {
        var movePos = new Fire.Vec2(event.screenX, event.screenY);
        var moveWordPos = Fire.Camera.main.screenToWorld(movePos);

        var offsetWordPos = Fire.Vec2.zero;
        offsetWordPos.x = this._mouseDownPos.x - moveWordPos.x;
        offsetWordPos.y = this._mouseDownPos.y - moveWordPos.y;

        this._selectTarget.transform.x = this._selectTargetInitPos.x - offsetWordPos.x;
        this._selectTarget.transform.y = this._selectTargetInitPos.y - offsetWordPos.y;

        this.dataBase.options.setPos(this._selectTarget.transform.worldPosition);
    },
    // 鼠标释放事件
    _onMouseUpEvent: function () {
        this._hasMoveTarget = false;
    },
    // 隐藏控制选项
    _onHideEvent: function () {
        this._selectTarget = null;
        this._backupSelectTarget = null;
        this._lastSelectTarget = null;
    },
    // 反转方向
    _onMirrorFlipEvent: function () {
        if (this._selectTarget) {
            var scaleX = this._selectTarget.transform.scaleX;
            this._selectTarget.transform.scaleX = scaleX > 1 ? -scaleX : Math.abs(scaleX);
        }
    },
    // 删除选择对象
    _onDeleteTargetEvent: function () {
        var furniture = this._selectTarget.getComponent('Furniture');
        if (furniture.suit_id > 0) {
            if (this.dataBase.curDressSuit.price > 0) {
                this.dataBase.options.hide();
                this.dataBase.tipsWindow.openTipsWindow('对不起，此物品为套装中的物品，\n 不可移除，请整套购买');
                return;
            }
            else {
                var index = this.dataBase.curDressSuit.funrnitureList.indexOf(furniture);
                if (index > -1){
                    this.dataBase.curDressSuit.funrnitureList.splice(index, 1);
                }
            }
        }
        furniture.setMarkUse(false);
        this._selectTarget.destroy();
        this._selectTarget = null;
        this._backupSelectTarget = null;
        this._lastSelectTarget = null;
        this.dataBase.options.hide();
    },
    // 重置
    reset: function () {
        this.dataBase.options.hide();
        this._selectTarget = null;
        this._backupSelectTarget = null;
        this._lastSelectTarget = null;
    },
    // 绑定事件
    start: function () {
        // 常用的变量/数据
        var ent = Fire.Entity.find('/DataBase');
        this.dataBase = ent.getComponent('DataBase');

        Fire.Input.on('mousedown', this.bindedMouseDownEvent);
        Fire.Input.on('mousemove', this.bindedMouseMoveEvent);
        Fire.Input.on('mouseup', this.bindedMouseUpEvent);
        //
        this.dataBase.options.onHideEvent = this._onHideEvent.bind(this);
        this.dataBase.options.btn_del.onMousedown = this._onDeleteTargetEvent.bind(this);
        this.dataBase.options.btn_MirrorFlip.onMousedown = this._onMirrorFlipEvent.bind(this);
    },
    // 销毁
    onDestroy: function() {
        Fire.Input.off('mousedown', this.bindedMouseDownEvent);
        Fire.Input.off('mousemove', this.bindedMouseMoveEvent);
        Fire.Input.off('mouseup', this.bindedMouseUpEvent);
    }
});

Fire._RFpop();
},{}],"DataBase":[function(require,module,exports){
Fire._RFpush(module, '4fb0eYA6kFOVK8Mo/S2rj/H', 'DataBase');
// script\villa\DataBase.js

//  存放项目需要的变量/数据/对象
var DataBata = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        // 用户钱包
        this.usercc = 0;
        // 是否可以保存
        this.hasCanSave = false;
        // 当前楼层ID
        this.floorId = 0;
        // 当前mark
        this.mark = '';
        // 当前房间UID
        this.house_uid = 0;
        // 当前房间ID
        this.room_id = 0;
        // 当前房间名称
        this.room_name = '';
        // 默认房间地板资源
        this.default_diban = '';
        // 默认房间墙壁资源
        this.default_beijing = '';
        // 当前装扮的套装
        this.curDressSuit = {
            // 套装ID
            suit_id: 0,
            // 套装小图
            suit_icon: null,
            // 背包ID
            pack_id: 0,
            // 套装名称
            suit_name: '',
            // 套装来自哪里，1.背包 2.商城
            suit_from: 1,
            // 套装价格
            price: 0,
            // 折扣
            discount: 1,
            // 套装列表
            funrnitureList: []
        };
        // 当前
        // 二级菜单单品数据列表
        this.single_Second_DataSheets = [];
        // 三级菜单单品总数
        this.single_Three_Total_Sheets = {};
        // 三级菜单单品数据列表
        this.single_Three_DataSheets = {};
        // 三级菜单单品大图资源列表
        this.single_Three_BigImage = {};
        // 二级菜单套装总数
        this.suitItems_Three_Total = [];
        // 二级菜单套装数据列表
        this.suitItems_Second_DataSheets = [];
        // 物品柜数据列表
        this.backpack_Second_DataSheets = [];
        // 物品柜数据列表
        this.backpack_Three_Total_Sheets = [];
        this.backpack_Three_DataSheets = [];
        // 用于创建缩略图
        this.ctxToDraw = null;
        // 用于拍照
        this.frameCount = -1;
        this.needHideEntList = [];
        // 背景与地面的默认图片
        this.background = null;
        this.ground = null;
        // 初始化场景子元素
        this.defaultScreenChilds = null;
        // 保存所有图片
        this.loadImageList = {};
        //
        this.familyList = null;
        this.familyGo = null;
    },
    // 载入时
    onLoad: function () {
        // 载入控件
        this.loadControls();
        if (!this.netWorkMgr.getToKenValue()) {
            this.toKenTipWin.active = true;
            return;
        }
        // 初始化房间
        var sendData = {};
        if(this.globalData && this.globalData.sendData){
            sendData = this.globalData.sendData;
            this.globalData.sendData = null;
        }
        else {
            sendData = {
                mark: '',
                house_uid: 0
            };
        }
        var self = this;
        self.loadTips.openTips('初始化场景，请稍后...');
        self.intoRoom(sendData, function () {
            // 这里因为是为了保持默认的背景跟地板的图片
            self.saveDefaultData();
            self.loadTips.closeTips();

            if (self.globalData) {
                if (self.globalData.gotoType === 2) {
                    self.updateCharacters();
                    self.characters.entity.active = true;
                }
                else {
                    self.mainMenuMgr.onHouseDressEvent();
                }
            }
        });
    },

    updateCharacters: function () {
        // 屋主数据
        var self = this;
        if (self.familyList.length > 0) {
            self.characters.entity.active = true;
            var host = self.familyList[0];
            var host_url = host.figure_url;
            var host_name = host.user_name;
            self.loadImage(host_url, function (error, image) {
                self.characters.setHost(image, host_name);
            });
        }
        // 家人数据
        if (self.familyList.length > 1) {
            var family = self.familyList[1];
            var family_url = family.figure_url;
            var family_name = family.relation_name + " " + family.user_name;
            self.loadImage(family_url, function (error, image) {
                if(self.familyGo){
                    self.characters.updateFamily(self.familyGo, image, family_name);
                }
                else{
                    self.familyGo = self.characters.addFamily(image, family_name);
                }
            });
        }
    },

    // 保存初始化数据（表示需要进行装扮）
    saveDefaultData: function () {
        this.background.saveDefaultSprite();
        this.ground.saveDefaultSprite();
        this.defaultScreenChilds = this.room.getChildren();
    },
    // 载入控件
    loadControls: function () {
        // 背景
        var ent = Fire.Entity.find('/Room/background');
        this.bgRender = ent.getComponent(Fire.SpriteRenderer);
        this.background = ent.getComponent('Furniture');
        // 地板
        ent = Fire.Entity.find('/Room/ground');
        //this.groundRender = ent.getComponent(Fire.SpriteRenderer);
        this.ground = ent.getComponent('Furniture');
        // 房间头节点
        this.room = Fire.Entity.find('/Room');
        // 控制选项
        ent = Fire.Entity.find('/Options');
        this.options = ent.getComponent('Options');
        // 二级子菜单模板
        this.tempSubSecondMenu = this.entity.find('SubSecondMenu');
        // 三级子菜单模板
        this.tempSubThreeMenu = this.entity.find('SubThreeMenu');
        // 家具模板
        this.tempFurniture = this.entity.find('Furniture');
        // 用户家庭信息模板
        this.tempFamilyInfo = this.entity.find('FamilyInfo');
        // 平面图模板
        this.tempPlan = this.entity.find('plan');
        // 网络连接
        this.netWorkMgr = this.entity.getComponent('NetworkMgr');
        // 主菜单
        ent = Fire.Entity.find('/Menu_Main');
        this.mainMenuMgr = ent.getComponent('MainMenuMgr');
        // 一级菜单
        ent = Fire.Entity.find('/Menu_First');
        this.firstMenuMgr = ent.getComponent('FirstMenuMgr');
        // 二级菜单
        ent = Fire.Entity.find('/Menu_Second');
        this.secondMenuMgr = ent.getComponent('SecondMenuMgr');
        // 三级级菜单
        ent = Fire.Entity.find('/Menu_Three');
        this.threeMenuMgr = ent.getComponent('ThreeMenuMgr');
        // 其他菜单
        ent = Fire.Entity.find('/Win_Floor');
        this.floorWin = ent.getComponent('FloorWindow');
        // 重新请求服务器窗口
        ent = Fire.Entity.find('/Win_NetWork');
        this.netWorkWin = ent.getComponent('NewWorkWindow');
        // 没有用户信息的提示窗口
        this.toKenTipWin = Fire.Entity.find('/Win_TokenTip');
        // 平面图
        ent = Fire.Entity.find('/Win_SwitchRoom');
        this.switchRoomWin = ent.getComponent('SwitchRoomWindow');
        // 加载提示
        ent = Fire.Entity.find('/Tips_load');
        this.loadTips = ent.getComponent('TipLoad');
        // 温馨提示窗口
        ent = Fire.Entity.find('/Tips_window');
        this.tipsWindow = ent.getComponent('TipsWindow');
        // 购物窗口
        ent = Fire.Entity.find('/Win_PayMent');
        this.payMentWindow = ent.getComponent('PayMentWindow');
        // 重置窗口
        ent = Fire.Entity.find('/Tips_PayMent');
        this.payMentTips = ent.getComponent('TipsPayMent');
        // 支付问题窗口
        ent = Fire.Entity.find('/Tips_PayProblems');
        this.tipsPayProblems = ent.getComponent('TipsPayProblems');
        //
        ent = Fire.Entity.find('/Characters');
        this.characters = ent.getComponent('Characters');
        //
        ent = Fire.Entity.find('/GlobalData');
        if (ent) {
            this.globalData = ent.getComponent("GlobalData");
        }
    },
    // 下载图片
    loadImage: function (url, callback) {
        var self = this;
        if (self.loadImageList[url]) {
            var image = self.loadImageList[url];
            if (callback) {
                callback(null, image);
            }
            return;
        }
        //self.loadTips.openTips('加载图片中，请稍后...');
        Fire.ImageLoader(url, function (error, image) {
            if (callback) {
                callback(error, image);
            }
            //self.loadTips.closeTips();
            if (image) {
                self.loadImageList[url] = image;
            }
        });
    },
    // 是否需要购买
    hasPay: function () {
        var children = this.room.getChildren();
        for(var i = 0; i < children.length; ++i) {
            var ent = children[i];
            var furniture = ent.getComponent('Furniture');
            if (furniture.price > 0) {
                return true;
            }
        }
        var dressSuit = this.curDressSuit;
        if (dressSuit.price > 0) {
            return true;
        }
        return false;
    },
    // 是否改变了背景与地面的材质
    hasSaveRoom: function () {
        var children = this.room.getChildren();
        if (children.length > 2) {
            return true;
        }
        if (this.background.imageUrl !== this.default_beijing ||
            this.ground.imageUrl !== this.default_diban ) {
            return true;
        }
        //if (! this.hasCanSave) {
        //    return false;
        //}
        //var curSprite = this.background.getRenderSprite();
        //var defaultSprite = this.background.defaultSprite;
        //if (curSprite !== defaultSprite) {
        //    return true;
        //}
        //curSprite = this.ground.getRenderSprite();
        //defaultSprite = this.ground.defaultSprite;
        //if (curSprite !== defaultSprite) {
        //    return true;
        //}
        //var hasSame = false, children = this.room.getChildren();
        //for(var i = 0; i < children.length; ++i) {
        //    hasSame = this.defaultScreenChilds[i] === children[i];
        //    if (! hasSame) {
        //        return true;
        //    }
        //}
        return false;
    },
    // 清空场景
    resetScreen: function (callback) {
        var children = this.room.getChildren();
        for (var i = 2; i < children.length; i++) {
            children[i].destroy();
        }
        if (callback) {
            callback();
        }
    },
    // 删除套装
    removeSuit: function () {
        var dressList = this.curDressSuit.funrnitureList;
        if (dressList) {
            for (var i = 0; i < dressList.length; ++i) {
                var com = dressList[i];
                if (com.props_type > 2) {
                    var ent = com.entity;
                    ent.destroy();
                }
            }
        }
        this.curDressSuit = {
            // 套装ID
            suit_id: 0,
            // 套装名称
            suit_name: '',
            // 背包ID
            pack_id: 0,
            // 套装小图
            suit_icon: null,
            // 套装来自哪里，1.背包 2.商城
            suit_from: 1,
            // 套装价格
            price: 0,
            // 折扣
            discount: 1,
            // 家具列表
            funrnitureList: []
        };
    },
    // 保存装扮
    saveRoom: function (callback) {
        var self = this;
        var sendData = {
            suit_id: self.curDressSuit.suit_id,
            suit_from: self.curDressSuit.suit_from,
            dataList: []
        };
        var data = {
            prod_id: 0,
            pack_id: 0,
            prod_uid: 0,
            pos: '',
            rotaion: 0,
            scale: '',
            suit_id: 0
        };
        var children = this.room.getChildren();
        for (var i = 0; i < children.length; i++) {
            var ent = children[i];
            var furniture = ent.getComponent('Furniture');
            data = {
                prod_id: furniture.props_id,
                pack_id: furniture.pack_id,
                prod_uid: furniture.props_uid,
                pos: ent.transform.x + ":" + ent.transform.y,
                rotation: ent.transform.rotation,
                scale: ent.transform.scaleX + ":" + ent.transform.scaleY,
                suit_id: furniture.suit_id
            };
            sendData.dataList.push(data);
        }
        self.netWorkMgr.RequestSaveRoom(sendData, function (serverData) {
            if (serverData.status === 10000) {
                if (callback) {
                    callback(serverData.usercc);
                }
            }
            else {
                self.tipsWindow.openTipsWindow(serverData.desc);
            }
        });
    },
    // 创建家具到场景中
    createFurnitureToScreen: function (dressList, callback) {
        var self = this;
        if (dressList.length === 0 && callback) {
            callback();
            return;
        }
        var index = 0;
        dressList.forEach(function (dress) {
            var entity = null, furniture = null;
            var propsType = parseInt(dress.propsType);
            if (propsType === 1) {
                entity = self.room.find('background');
                furniture = entity.getComponent('Furniture');
                furniture.setFurnitureData(dress, true);
                self.loadTips.openTips('创建图片中，请稍后...');
                self.loadImage(furniture.imageUrl, function (error, image) {
                    self.loadTips.closeTips();
                    if (error) {
                        console.log(error);
                        return;
                    }
                    var bigSprite = new Fire.Sprite(image);
                    furniture.setSprite(bigSprite);
                });
            }
            else if (propsType === 2) {
                entity = self.room.find('ground');
                furniture = entity.getComponent('Furniture');
                furniture.setFurnitureData(dress, true);
                self.loadTips.openTips('创建图片中，请稍后...');
                self.loadImage(furniture.imageUrl, function (error, image) {
                    self.loadTips.closeTips();
                    if (error) {
                        console.log(error);
                        return;
                    }
                    var bigSprite = new Fire.Sprite(image);
                    furniture.setSprite(bigSprite);
                });
            }
            else {
                entity = Fire.instantiate(self.tempFurniture);
                entity.active = true;
                entity.parent = self.room;
                entity.name = dress.propsName;
                // 设置坐标
                var newVec2 = new Fire.Vec2();
                var str = dress.pos.split(":");
                newVec2.x = parseFloat(str[0]);
                newVec2.y = parseFloat(str[1]);
                entity.transform.position = newVec2;
                // 设置角度
                entity.transform.rotation = dress.rotation;
                // 设置大小
                str = dress.scale.split(":");
                newVec2.x = parseFloat(str[0]);
                newVec2.y = parseFloat(str[1]);
                entity.transform.scale = newVec2;
                furniture = entity.getComponent('Furniture');
                furniture.setFurnitureData(dress);
            }
            // 存储套装家具
            if (furniture.suit_id === self.curDressSuit.suit_id) {
                self.curDressSuit.funrnitureList.push(furniture);
            }
        });
        if (callback) {
            callback();
        }
    },
    // 进入房间
    intoRoom: function (sendData, callback) {
        var self = this;
        self.netWorkMgr.RequestIntoHomeData(sendData, function (serverData) {
            if (serverData.status !== 10000) {
                self.tipsWindow.openTipsWindow(serverData.desc);
                if (callback) {
                    callback();
                }
                return ;
            }
            self.floorId = serverData.floorId;
            self.mark = serverData.mark;
            self.house_uid = serverData.house_uid;
            self.room_id = serverData.room_id;
            self.room_name = serverData.room_name;
            self.default_diban = serverData.default_diban;
            self.default_beijing = serverData.default_beijing;
            self.mainMenuMgr.refreshCurHomeType(self.room_name);
            self.mainMenuMgr.refreshCurVillaName(serverData.villa_name);

            self.characters.entity.active = false;
            self.familyList = serverData.family;

            // 获取套装信息
            self.curDressSuit = {
                // 套装ID
                suit_id: parseInt(serverData.suit_id),
                // 背包ID
                pack_id: 0,
                // 套装小图
                suit_icon: null,
                // 套装名称
                suit_name: '',
                // 套装来自哪里，1.背包 2.商城
                suit_from: 1,
                // 套装价格
                price: 0,
                // 折扣
                discount: 1,
                // 套装列表
                funrnitureList: []
            };
            // 清空场景
            self.resetScreen();
            // 创建家具到场景中
            self.createFurnitureToScreen(serverData.dressList, callback);
        });
    },
    // 预加载二级菜单 单品家具数据
    preloadSinagleItemsData_Second: function (callback) {
        var self = this;
        self.netWorkMgr.RequestSingleItemsMenu(function (serverData) {
            if (serverData.status !== 10000) {
                self.tipsWindow.openTipsWindow(serverData.desc);
                if (callback) {
                    callback();
                }
                return;
            }
            if (serverData.list && serverData.list.length === 0 && callback) {
                callback();
                return;
            }
            var index = 0;
            serverData.list.forEach(function (data) {
                var loadImageCallBack = function (data, index, error, image) {
                    if (error) {
                        console.log(error);
                        return;
                    }
                    data.smallSprite = new Fire.Sprite(image);
                    if (callback) {
                        callback(index, data);
                    }
                }.bind(this, data, index);
                // 保存数据
                self.single_Second_DataSheets.push(data);
                // 加载图片
                //self.loadImage(data.url, loadImageCallBack);
                index++;
            });
        });
    },
    // 预加载三级菜单 单品家具数据
    preloadSinagleItemsData_Three: function (id, page, each, callback) {
        var self = this;
        if (!self.single_Three_DataSheets[id]) {
            self.single_Three_DataSheets[id] = [];
        }
        var sendData = {
            tid: id,
            page: page,
            each: -1
        };
        self.netWorkMgr.RequestSingleItems(sendData, function (serverData) {
            if (serverData.status !== 10000) {
                self.tipsWindow.openTipsWindow(serverData.desc);
                return;
            }
            var total = parseInt(serverData.total);
            self.single_Three_Total_Sheets[id] = total;
            if (total === 0 && callback) {
                callback();
                return;
            }
            var dataSheets = self.single_Three_DataSheets[id];
            var index = 0, loadImageCount = 0;
            serverData.list.forEach(function (dataSheets, data) {
                var menuData = {
                    props_id: parseInt(data.prod_id),
                    props_name: data.prod_name,
                    prod_uid: data.prod_uid,
                    price: data.prod_price,
                    discount: data.discount,
                    bigImageUrl: data.prod_souce_url,
                    bigSprite: null,
                    imageUrl: data.prod_image_url,
                    smallSprite: null,
                    event: null
                };
                //
                var loadImageCallBack = function (menuData, index, error, image) {
                    if (error) {
                        loadImageCount++;
                        if (loadImageCount < 2) {
                            self.loadImage(menuData.samllImageUrl, loadImageCallBack);
                        }
                        else {
                            console.log(error);
                        }
                        return;
                    }
                    //
                    menuData.smallSprite = new Fire.Sprite(image);
                    if (callback) {
                        callback(id, index, page, menuData);
                    }
                    loadImageCount = 0;
                }.bind(this, menuData, index);
                // 保存数据
                dataSheets.push(menuData);
                // 加载小图
                //self.loadImage(data.prod_image_url, loadImageCallBack);
                //
                index++;
            }.bind(this, dataSheets));
        });
    },
    // 预加载二级套装数据
    preloadSuitItemsData_Second: function (curPage, curEach, callback) {
        var sendData = {
            page: curPage,
            each: -1
        };
        var self = this;
        self.netWorkMgr.RequestSetItemsMenu(sendData, function (serverData) {
            if (serverData.status !== 10000) {
                self.tipsWindow.openTipsWindow(serverData.desc);
                return;
            }
            // 套装总数量
            self.suitItems_Three_Total = parseInt(serverData.total);
            if (self.suitItems_Three_Total === 0 && callback) {
                callback();
                return;
            }
            var index = 0;
            for (var i = 0; i < serverData.list.length; ++i) {
                var data = serverData.list[i];
                var setData = {
                    tid: data.prod_suitid,
                    tname: data.prod_suitname,
                    uid: data.prod_uid,
                    imageUrl: data.prod_img,
                    roomType: data.prod_roomtype,
                    price: data.prod_price,
                    smallSprite: null
                };
                self.suitItems_Second_DataSheets.push(setData);
                index++;
            }
        });
    },
    // 初始化二级菜单物品柜数据
    initBackpackData: function (callback) {
        if (this.backpack_Second_DataSheets.length > 0) {
            return;
        }
        var data = {
            tid: 0,
            tname: '我的单品',
            isdrag: 2,
            localPath: 'itemsCabinet/single/single',
            smallSprite: null
        };
        this.backpack_Second_DataSheets.push(data);
        data = {
            tid: 1,
            tname: '我的套装',
            isdrag: 2,
            localPath: 'itemsCabinet/set/set',
            smallSprite: null
        };
        this.backpack_Second_DataSheets.push(data);
    },
    // 加载物品柜数据
    loadBackpackData: function (id, page, eachnum, callback) {
        var self = this;
        self.backpack_Three_DataSheets[id] = [];
        // 单品
        var singleCallBack = function (serverData) {
            if (serverData.status !== 10000) {
                self.tipsWindow.openTipsWindow(serverData.desc);
                if (callback){
                    callback();
                }
                return;
            }
            var total = parseInt(serverData.total);
            self.backpack_Three_Total_Sheets[id] = total;
            if (total === 0 && callback) {
                callback();
                return;
            }
            serverData.list.forEach(function (data) {
                var loaclData = {
                    pack_id: data.pack_id,
                    prod_uid: data.prod_uid,
                    props_id: data.prod_id,
                    status: data.status,
                    props_type: data.prod_category,
                    hasDrag: data.prod_category > 2,
                    props_name: data.prod_name,
                    price: data.price,
                    discount: data.discount,
                    imageUrl: data.prod_image_url,
                    bigImageUrl: data.prod_souce_url,
                    smallSprite: null
                };
                // 保存数据
                self.backpack_Three_DataSheets[id].push(loaclData);
            });
            if (callback) {
                callback();
            }
        };
        // 套装
        var suitCallBack = function (serverData) {
            if (serverData.status !== 10000) {
                self.tipsWindow.openTipsWindow(serverData.desc);
                if (callback) {
                    callback();
                }
                return;
            }

            var total = parseInt(serverData.total);
            self.backpack_Three_Total_Sheets[id] = total;
            if (total === 0 && callback) {
                callback();
                return;
            }
            serverData.list.forEach(function (data) {
                var localData = {
                    suit_id: data.suit_id,
                    suit_name: data.suit_name,
                    status: data.status,
                    dressList: data.dressList,
                    imageUrl: data.suit_pig,
                    smallSprite: null
                };
                // 保存数据
                self.backpack_Three_DataSheets[id].push(localData);
            });
            if (callback) {
                callback();
            }
        };
        var sendData = {
            page: page,
            eachnum: -1
        };
        if (id === 0) {
            self.netWorkMgr.RequestBackpackSingle(sendData, singleCallBack);
        }
        else {
            self.netWorkMgr.RequestBackpackSuit(sendData, suitCallBack);
        }
    },
});

Fire._RFpop();
},{}],"FamilyInfo":[function(require,module,exports){
Fire._RFpush(module, '2a3a3puKJFEZLcqy/1xksaq', 'FamilyInfo');
// script\villa\FamilyInfo.js

var Comp = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        // 房间名称
        this.floor_name = '';
        // 房间等级
        this.house_grade = 0;
        // 爱人ID
        this.lover_id = 0;
        // 爱人名称
        this.lover_name = '';
        // 爱人性别
        this.lover_gender = '';
        // 关系
        this.relation_name = '';
        // 标记
        this.mark = '';
        // 层ID
        this.storey_id = 0;
        //
        this.is_default = '';
    },
    // 属性
    properties: {
        // 房屋等级
        level: {
            default: null,
            type: Fire.Text
        },
        // 房主
        houseOwner: {
            default: null,
            type: Fire.Text
        },
        // 与TA的关系
        relation: {
            default: null,
            type: Fire.Text
        },
        // 加入房屋
        btn_goTo: {
            default: null,
            type: Fire.UIButton
        },
        // 解除关系
        btn_del: {
            default: null,
            type: Fire.UIButton
        }
    },
    // 更新房屋等级
    setLevel: function (value) {
        this.house_grade = value;
        this.level.text = value.toString();
    },
    // 更新房主
    setHouseOwner: function (value) {
        this.lover_name = value;
        this.houseOwner.text = value.toString();
    },
    // 更新与TA关系
    setRelation: function (value) {
        this.relation_name = value;
        this.relation.text = value.toString();
    },
    refresh: function (data, goToEvent, relieveEvent) {
        this.btn_goTo.onClick = goToEvent.bind(this);
        this.btn_goTo.onClick = relieveEvent.bind(this);
        this.setLevel(data.house_grade || 1);
        this.setHouseOwner(data.lover_name || '无');
        this.setRelation(data.relation_name || '无');
        this.mark = data.mark || 0;
        this.lover_id = data.lover_id || 0;
        this.lover_gender = data.lover_gender || 0;
        this.storey_id = data.storey_id  || 0;
        this.floor_name = data.floor_name || '无';
        this.is_default = data.is_default || '';
        this.btn_goTo.onClick = goToEvent;
        this.btn_del.entity.active = false;
        if (this.lover_id !== 0) {
            this.btn_del.onClick = relieveEvent;
            this.btn_del.entity.active = true;
        }
    }
});

Fire._RFpop();
},{}],"FirstMenuMgr":[function(require,module,exports){
Fire._RFpush(module, '904e6gefshMk79HpYawaJwh', 'FirstMenuMgr');
// script\villa\FirstMenuMgr.js

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

Fire._RFpop();
},{}],"FloorWindow":[function(require,module,exports){
Fire._RFpush(module, '2c069DcvoVNS6m+BA+CdIqg', 'FloorWindow');
// script\villa\FloorWindow.js

// 楼层切换窗口
var FloorWindow = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        this._myFamilyDataSheets = [];
        this._addMyFamilyDataSheets = [];
        // 每页显示多少个
        this._showPageCount = 7;
        // 总数
        this._curTotal = 0;
        // 当前页数
        this._curPage = 1;
        // 最大页数
        this._maxPage = 1;
        // 类型 0：我的家庭成员 1：我加入的家庭
        this.floorType = 0;
        //
        this.relieveing = false;
    },
    // 属性
    properties: {
        // 我的家庭成员切换按钮
        btn_myFamily: {
            default: null,
            type: Fire.Toggle
        },
        // 我加入的家庭切换按钮
        btn_myAddFamily: {
            default: null,
            type: Fire.Toggle
        },
        // 关闭按钮
        btn_close: {
            default: null,
            type: Fire.UIButton
        },
        // 上一页
        btn_Left: {
            default: null,
            type: Fire.UIButton
        },
        // 下一页
        btn_Right: {
            default: null,
            type: Fire.UIButton
        },
        pageText: {
            default: null,
            type: Fire.Text
        },
        // 头节点
        root: {
            default: null,
            type: Fire.Entity
        },
        // 加入家庭的标题
        addFamilyTitle: {
            default: null,
            type: Fire.Entity
        },
        // 我的家庭的标题
        myFamily: {
            default: null,
            type: Fire.Entity
        }
    },
    // 关闭窗口
    closeWindow: function () {
        this.entity.active = false;
        this.resetData();
        this.modifyToggle();
    },
    // 打开窗口
    openWindow: function () {
        this.entity.active = true;
        var self = this;
        self.dataBase.loadTips.openTips('载入数据！请稍后...');
        self.dataBase.netWorkMgr.RequestFloorList(function (serverData) {
            self.dataBase.loadTips.closeTips();
            if (!Fire.Engine.isPlaying) {
                return;
            }
            self.refreshFloorData(serverData, function () {
                self._switchingData(0);
                self.btn_myFamily.defaultToggle();
            });
        });
    },
    //
    refreshFloorData: function (serverData, callback) {
        var self = this;
        if (serverData.status !== 10000) {
            self.dataBase.tipsWindow.openTipsWindow(serverData.desc);
            return;
        }
        self._myFamilyDataSheets = [];
        serverData.list.myfloor.forEach(function (data) {
            self._myFamilyDataSheets.push(data);
        });
        self._addMyFamilyDataSheets = [];
        serverData.list.mylived.forEach(function (data) {
            self._addMyFamilyDataSheets.push(data);
        });
        if (callback) {
            callback();
        }
    },
    // 关闭按钮事件
    _onCloseWindowEvent: function () {
        this.closeWindow();
    },
    // 还原
    modifyToggle: function () {
        this.btn_myFamily.resetColor();
        this.btn_myAddFamily.resetColor();
    },
    // 切换到我的家庭成员
    _onMyFamilyEvent: function () {
        this.myFamily.active = true;
        this.addFamilyTitle.active = false;
        this._switchingData(0);
    },
    // 我加入的家庭
    _onMyAddFamilyEvent: function () {
        this.myFamily.active = false;
        this.addFamilyTitle.active = true;
        this._switchingData(1);
    },
    // 重置
    resetData: function () {
        var children = this.root.getChildren();
        for (var i = 0; i < children.length; ++i) {
            children[i].destroy();
        }
    },
    // 进入房屋
    _onGoToHouseEvent: function (event) {
        this.closeWindow();
        var familyInfo = event.target.parent.getComponent('FamilyInfo');
        var sendData = {
            house_uid: 0,
            floor_id: 0,
            mark: familyInfo.mark
        };
        this.dataBase.switchRoomWin.openWindow(1, sendData);
    },
    // 解除关系
    _onRelieveEvent: function (event) {
        var self = this;
        if (self.relieveing) {
            return;
        }
        var familyInfo = event.target.parent.getComponent('FamilyInfo');
        self.dataBase.tipsWindow.openTipsWindow("是否与 " + familyInfo.lover_name + " 解除关系?", function () {
            self.relieveing = true;
            var sendData = {
                mark: familyInfo.mark
            };
            self.dataBase.netWorkMgr.RequestDisassociateList(sendData, function (serverData) {
                if (serverData.status === 10000) {
                    self.refreshFloorData(serverData, function () {
                        self._switchingData(self.floorType);
                        self.relieveing = false;
                    });
                }
                else {
                    self.tipsWindow.openTipsWindow(serverData.desc);
                }
            });
        });
    },
    // 重置页数
    _switchingData: function (type) {
        this.modifyToggle();
        this.floorType = type;
        this._curPage = 1;
        this._maxPage = 1;
        if (type === 0){
            this.btn_myFamily.defaultToggle();
        }
        else {
            this.btn_myAddFamily.defaultToggle();
        }
        this.createFamilyInfo();
    },
    //
    createFamilyInfo: function () {
        this.resetData();
        var dataSheets = null;
        if (this.floorType === 0) {
            dataSheets = this._myFamilyDataSheets;
        }
        else {
            dataSheets = this._addMyFamilyDataSheets;
        }
        var bindGotHouseEvent = this._onGoToHouseEvent.bind(this);
        var bindRelieveEvent = this._onRelieveEvent.bind(this);
        //
        this._curTotal = dataSheets.length;
        this._maxPage = Math.ceil(this._curTotal / this._showPageCount);
        if (this._maxPage === 0) {
            this._maxPage = 1;
        }
        var startCount = (this._curPage - 1) * this._showPageCount;
        var entCount = startCount + this._showPageCount;
        if (entCount > this._curTotal) {
            entCount = this._curTotal;
        }
        var index = 0;
        for (var i = startCount; i < entCount; ++i) {
            var data = dataSheets[i];
            var ent = Fire.instantiate(this.dataBase.tempFamilyInfo);
            ent.name = i.toString();
            ent.parent = this.root;
            ent.active = true;
            ent.transform.position = new Fire.Vec2(-2.5, 188 - (index * 77));
            var info = ent.getComponent('FamilyInfo');
            info.refresh(data, bindGotHouseEvent, bindRelieveEvent);
            index++;
        }
        // 刷新按钮状态
        this._refreshBtnState();
    },
    // 刷新按钮状态
    _refreshBtnState: function () {
        this.btn_Left.entity.active = this._curPage > 1;
        this.btn_Right.entity.active = this._curPage < this._maxPage;
        this.pageText.text = '页数:' + this._curPage + "/" + this._maxPage;
    },
    // 下一页
    _onNextPageEvnet: function () {
        this._curPage -= 1;
        if (this._curPage < 1){
            this._curPage = 1;
        }
        this.createFamilyInfo();
    },
    // 上一页
    _onPreviousPageEvent: function () {
        this._curPage += 1;
        if (this._curPage > this._maxPage){
            this._curPage = this._maxPage;
        }
        this.createFamilyInfo();
    },
    // 开始
    start: function () {
        // 常用的变量/数据
        var ent = Fire.Entity.find('/DataBase');
        this.dataBase = ent.getComponent('DataBase');
        //
        this.addFamilyTitle.active = false;
        this.myFamily.active = true;
        //
        this.btn_close.onClick = this._onCloseWindowEvent.bind(this);
        this.btn_myFamily.onClick = this._onMyFamilyEvent.bind(this);
        this.btn_myAddFamily.onClick = this._onMyAddFamilyEvent.bind(this);
        //
        this.btn_Left.onClick = this._onNextPageEvnet.bind(this);
        this.btn_Right.onClick = this._onPreviousPageEvent.bind(this);
        this.btn_Left.entity.active = false;
        this.btn_Right.entity.active = false;
    }
});

Fire._RFpop();
},{}],"Furniture":[function(require,module,exports){
Fire._RFpush(module, '0b8c6Yqda1FHbxD0OE1BFvv', 'Furniture');
// script\villa\Furniture.js

var Furniture = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        this._renderer = null;
        this.smallSprite = null;
        this.menuData = null;
    },
    // 属性
    properties: {
        // 名称
        props_name: '',
        // 物品ID
        props_id: -1,
        // 物品UID
        props_uid: -1,
        // 背包ID
        pack_id: -1,
        // 套装ID
        suit_id: -1,
        // 类型
        props_type: -1,
        // 价格
        price: -1,
        // 折扣
        discount: 1,
        // 图片的url
        imageUrl: '',
        // 载入时的图片
        defaultSprite: {
            default: null,
            type: Fire.Sprite
        },
        defaultLoadAnim: {
            default: null,
            type: Fire.Animation
        },
        renderer: {
            default: null,
            type: Fire.SpriteRenderer
        }
    },
    // 设置默认图片
    saveDefaultSprite: function () {
        this.defaultSprite = this.renderer.sprite;
    },
    // 获取当前图片
    getRenderSprite: function () {
        return this.renderer.sprite;
    },
    // 设置标记
    setMarkUse: function (value) {
        if (this.menuData) {
            this.menuData.setMarkUse(value);
        }
    },
    // 设置图片
    setSprite: function (newSprite) {
        this.renderer.sprite = newSprite;
        this.renderer.sprite.pixelLevelHitTest = true;
    },
    // 设置家具数据
    setFurnitureData: function (data, hasBgAndGd) {
        if (! this.dataBase) {
            // 常用的变量/数据
            var ent = Fire.Entity.find('/DataBase');
            this.dataBase = ent.getComponent('DataBase');
            //
            if (this.defaultLoadAnim) {
                var state = this.defaultLoadAnim.play('loading');
                state.wrapMode = Fire.WrapMode.Loop;
                state.repeatCount = Infinity;
            }
        }
        this.props_name = data.props_name || data.propsName;
        this.props_id = data.props_id || data.id;
        this.props_uid =  data.props_uid || data.prod_uid || 0;
        this.props_type = data.props_type || data.propsType;
        this.pack_id = data.pack_id || 0;
        this.suit_id = data.suit_id;
        this.price = data.price || 0;
        this.discount = data.discount || 1;
        this.imageUrl = data.bigImageUrl || data.imgUrl;
        this.smallSprite = data.smallSprite || null;

        this.entity.active = true;
        if (! hasBgAndGd) {
            this.renderer.entity.active = false;
            this.defaultLoadAnim.entity.active = true;
            this.defaultLoadAnim.play('loading');
            var self = this;
            self.dataBase.loadImage(self.imageUrl, function (data, error, image) {
                if (error) {
                    console.log(error);
                }
                else {
                    var sprite = new Fire.Sprite(image);
                    self.setSprite(sprite);
                    self.defaultLoadAnim.entity.active = false;
                    this.renderer.entity.active = true;
                }
            }.bind(this, data));
        }
    }
});

Fire._RFpop();
},{}],"GlobalData":[function(require,module,exports){
Fire._RFpush(module, '408e8Oz7ZFGMrN6l4h8O7II', 'GlobalData');
// script\common\GlobalData.js

var GlobalData = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        this.hostName = "";
        this.hostSprite = null;
        this.hostName = "";
        this.sendData = null;
    },
    // 属性
    properties: {
        // 1.进入室内并且直接进行装扮 2. 进入室内
        gotoType: -1
    },
    // 开始
    start: function () {

    },
    // 更新
    update: function () {

    }
});

Fire._RFpop();
},{}],"MainMenuMgr":[function(require,module,exports){
Fire._RFpush(module, 'c5ed2tjRZVKn62PlC3pd1k5', 'MainMenuMgr');
// script\villa\MainMenuMgr.js

var DataBase = require('DataBase');
// 主菜单管理类
var MainMenuMgr = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        // 菜单列表
        this._menuList = [];
    },
    // 属性
    properties: {
        margin: new Fire.Vec2(),
        // 当前房间名称
        homeType: {
            default: null,
            type: Fire.Text
        },
        // 当前别墅名称
        villaName: {
            default: null,
            type: Fire.Text
        }
    },
    // 切换房间
    _onChangeRoomEvent: function () {
        console.log('切换房间');
        var self = this;
        var sendData = {
            house_uid: 0,
            floor_id: 0,
            mark: this.dataBase.mark
        };
        self.dataBase.switchRoomWin.openWindow(0, sendData);
        self.dataBase.characters.entity.active = false;
    },
    // 房屋扮靓
    onHouseDressEvent: function () {
        console.log('房屋扮靓');
        var sendData = {
            mark: this.dataBase.mark
        };
        var self = this;
        self.dataBase.loadTips.openTips('请求房屋扮靓，请稍后...');
        self.dataBase.netWorkMgr.RequestCanDressRoom(sendData, function (serverData) {
            self.dataBase.loadTips.closeTips();
            if (serverData.status === 10000) {
                self.dataBase.hasCanSave = true;
                self.dataBase.usercc = serverData.usercc;
                // 表示有数据与服务器不符合需要更新
                if (serverData.hasupdate > 0) {
                    var sendData = {
                        mark: self.dataBase.mark
                    };
                    self.dataBase.intoRoom(sendData, function () {
                        self.dataBase.firstMenuMgr.openMenu();
                    });
                }
                else {
                    self.dataBase.firstMenuMgr.openMenu();
                }
            }
            else {
                self.dataBase.tipsWindow.openTipsWindow(serverData.desc);
            }
        });
        self.dataBase.characters.entity.active = false;
    },
    // 保存装扮
    _onSaveDressEvent: function () {
        var self = this;
        if (! self.dataBase.hasSaveRoom()) {
            self.dataBase.tipsWindow.openTipsWindow('请先进行房屋扮靓..');
            return;
        }
        self.dataBase.tipsWindow.openTipsWindow('是否确定保存装扮？', function () {
            if (self.dataBase.hasPay()) {
                self.dataBase.payMentWindow.openWindow();
            }
            else {
                self.dataBase.loadTips.openTips('保存装扮中！请稍后...');
                self.dataBase.saveRoom(function () {
                    self.dataBase.loadTips.closeTips();
                    self.dataBase.tipsWindow.openTipsWindow('保存装扮成功..');
                    self.dataBase.firstMenuMgr.closeMenu();
                    self.dataBase.secondMenuMgr.closeMenu();
                    self.dataBase.threeMenuMgr.closeMenu();
                    self.dataBase.resetScreen(function () {
                        var sendData = {
                            mark: self.dataBase.mark
                        };
                        self.dataBase.loadTips.openTips('刷新场景，请稍后...');
                        self.dataBase.intoRoom(sendData, function () {
                            self.dataBase.loadTips.closeTips();
                        });
                    });
                });
            }
            console.log('保存装扮');
        });
        self.dataBase.characters.entity.active = false;
    },
    // 扮靓商场
    _onGoToMallEvent: function () {
        console.log('扮靓商场');
        window.open('http://www.saike.com/housedress/shop.php');
    },
    // 返回室外
    _onGoToOutDoorEvent: function () {
        console.log('返回室外');
        //window.open('http://www.saike.com/housedress/map.php');
        Fire.Engine.loadScene('launch');
    },
    // 获取菜单按钮并且绑定事件
    _initMenu: function () {
        var self = this;
        var children = this.entity.getChildren();
        self._menuList = [];
        children.forEach(function (ent) {
            // 绑定按钮事件
            var btn = ent.getComponent('UIButton');
            if (! btn) {
                return;
            }
            if (ent.name === "1") {
                btn.onClick = self._onChangeRoomEvent.bind(self);
            }
            else if (ent.name === "2") {
                btn.onClick = self.onHouseDressEvent.bind(self);
            }
            else if (ent.name === "3") {
                btn.onClick = self._onSaveDressEvent.bind(self);
            }
            else if (ent.name === "4") {
                btn.onClick = self._onGoToMallEvent.bind(self);
            }
            else if (ent.name === "5") {
                btn.onClick = self._onGoToOutDoorEvent.bind(self);
            }
            self._menuList.push(btn);
        });
    },
    // 更新当前房间类型
    refreshCurHomeType: function (homeType) {
        this.homeType.text = "当前:" + homeType;
    },
    // 更新当前别墅名称
    refreshCurVillaName: function (text) {
        if (this.villaName.text === text){
            return;
        }
        this.villaName.text = text || "";
    },
    onLoad: function () {
        // 常用的变量/数据
        var ent = Fire.Entity.find('/DataBase');
        this.dataBase = ent.getComponent('DataBase');
        // 页面大小发生变化的时候会调用这个事件
        var self = this;
        Fire.Screen.on('resize', function () {
            var width = self.documentElement.clientWidth;
            var height = self.documentElement.clientHeight;
            if (width < height) {
                self.dataBase.tipsWindow.openTipsWindow('横屏效果更好!');
            }
            else {
                self.dataBase.tipsWindow.closeTips();
            }
        });
        var documentElement = document.documentElement;
        var width = documentElement.clientWidth;
        var height = documentElement.clientHeight;
        this.documentElement = documentElement;
        if (width < height) {
            this.dataBase.tipsWindow.openWindow('横屏效果更好!');
        }
    },
    // 开始
    start: function () {
        // 获取菜单按钮并且绑定事件
        this._initMenu();

        Fire.Engine.preloadScene('launch');
    },
    // 更新
    update: function () {
        // 匹配UI分辨率
        //var camera = Fire.Camera.main;
        //var bgWorldBounds = this.dataBase.bgRender.getWorldBounds();
        //var bgLeftTopWorldPos = new Fire.Vec2(bgWorldBounds.xMin, bgWorldBounds.yMax);
        //var bgleftTop = camera.worldToScreen(bgLeftTopWorldPos);
        //var screenPos = new Fire.Vec2(bgleftTop.x, bgleftTop.y);
        //var worldPos = camera.screenToWorld(screenPos);
        //this.entity.transform.worldPosition = worldPos;
        // 匹配UI分辨率
        var camera = Fire.Camera.main;
        var screenSize = Fire.Screen.size.mul(camera.size / Fire.Screen.height);
        var newPos = Fire.v2(-screenSize.x / 2 + this.margin.x, screenSize.y / 2 - this.margin.y);
        this.entity.transform.position = newPos;
    }
});

Fire._RFpop();
},{"DataBase":"DataBase"}],"MainMenu":[function(require,module,exports){
Fire._RFpush(module, 'a5f4eCM86tK1azADW2LJzKk', 'MainMenu');
// script\outdoor\MainMenu.js

var MainMenu = Fire.Class({
    extends: Fire.Component,

    constructor: function () {
        this.EXP_BAR_MAX_VALUE = 150;
        this._curType = 0;
    },

    properties: {
        offset: new Fire.Vec2(750, -120),
        // 人物头像
        headIcon: {
            default: null,
            type: Fire.SpriteRenderer
        },
        headName: {
            default: null,
            type: Fire.BitmapText
        },
        // 人物名称
        user_name: {
            default: null,
            type: Fire.BitmapText
        },
        // 人物成长等级
        user_level: {
            default: null,
            type: Fire.Text
        },
        // 人物经验值
        user_exp: {
            default: null,
            type: Fire.Text
        },
        //
        user_expBar: {
            default: null,
            type: Fire.SpriteRenderer
        },
        // 主人形象
        user_sprite: {
            default: null,
            type: Fire.SpriteRenderer
        },
        btn_GoToSingle: {
            default: null,
            type: Fire.Toggle
        },
        btn_GoToVilla: {
            default: null,
            type: Fire.Toggle
        },
        btn_GoToMyAdd: {
            default: null,
            type: Fire.UIButton
        },
        btn_GoToHouseShop: {
            default: null,
            type: Fire.UIButton
        },
        btn_GoToDressShop: {
            default: null,
            type: Fire.UIButton
        }
    },

    // 初始化场景
    loadScreen: function (type) {
        var sendData = {
            dress_type: type
        }
        var self = this;
        var loadTipText = "单身公寓外景";
        if (type === 2) {
            loadTipText = "别墅外界";
        }
        self.odataBase.loadTip.openTips("载入" + loadTipText +"中,请稍后!");
        self.odataBase.initScreen(sendData, function (serverData) {
            self.odataBase.loadTip.closeTips();
            if(! serverData) {
                self.odataBase.loadTip.closeTips();
                return;
            }
            self.odataBase.characters.entity.active = false;
            // 屋主数据
            if (serverData.family.length > 0) {
                self.odataBase.characters.entity.active = true;
                var host = serverData.family[0];
                var host_url = host.figure_url;
                var host_name = host.user_name;
                self.odataBase.loadImage(host_url, function (error, image) {
                    self.odataBase.characters.setHost(image, host_name);
                });
            }
            // 家人数据
            if(serverData.family.length > 1) {
                for(var i = 1, len = serverData.family.length; i < len; ++i ) {
                    var family = serverData.family[i];
                    var family_url = family.figure_url;
                    self.odataBase.loadImage(family_url, function (family, error, image) {
                        if (error) {
                            return;
                        }
                        var family_name = family.relation_name + " " + family.user_name;
                        self.odataBase.characters.addFamily(image, family_name);
                    }.bind(this, family));
                }
            }

            self.headName.text = serverData.ownerinfo.user_name;
            self.odataBase.uid = serverData.ownerinfo.uid;
            self.user_name.text = serverData.ownerinfo.user_name;
            self.user_level.text = serverData.ownerinfo.grade;

            var curExp = serverData.ownerinfo.gu_have;
            var maxExp = serverData.ownerinfo.gu_need;
            self.user_exp.text = curExp + "/" + maxExp;
            var percentage = parseFloat(curExp / maxExp);
            var expBarValue = self.EXP_BAR_MAX_VALUE * percentage;
            self.user_expBar.customWidth = expBarValue;

            var url = serverData.ownerinfo.image_url;
            self.odataBase.loadImage(url, function (error, image) {
                if(error) {
                    return;
                }
                self.headIcon.sprite = new Fire.Sprite(image);
            });

            self.odataBase.house.onClick = function () {
                if (this._curType === 1) {
                    Fire.Engine.loadScene('single');
                }
                else {
                    Fire.Engine.loadScene('villa');
                }
            }

            // 适配背景
            self.odataBase.bgRender.customWidth = self.width * (Fire.Camera.main.size / self.height);
            self.odataBase.bgRender.customHeight = Fire.Camera.main.size;
            // 适配房屋
            self.odataBase.house.btnRender.customWidth = self.width * (Fire.Camera.main.size / self.height);
            self.odataBase.house.btnRender.customHeight = Fire.Camera.main.size;

            self.odataBase.subMenu.openSubMenu(type);

            self.odataBase.mask.active = false;
        })
    },

    // use this for initialization
    start: function () {
        // 常用的变量/数据
        var ent = Fire.Entity.find('/ODataBase');
        this.odataBase = ent.getComponent('ODataBase');

        Fire.Engine.preloadScene('single');
        Fire.Engine.preloadScene('villa');

        this.btn_GoToSingle.onClick = this.onGoToSingleEvent.bind(this);
        this.btn_GoToVilla.onClick = this.onGoToVillaEvent.bind(this);

        this.btn_GoToMyAdd.onClick = this.onGoToMyAddEvent.bind(this);
        this.btn_GoToHouseShop.onClick = this.onGoToHouseShopEvent.bind(this);
        this.btn_GoToDressShop.onClick = this.onGoToDressShopEvent.bind(this);

        this.documentElement = document.documentElement;
        this.width = this.documentElement.clientWidth;
        this.height = this.documentElement.clientHeight;

        var self = this;
        Fire.Screen.on('resize', function () {
            var width = self.documentElement.clientWidth;
            var height = self.documentElement.clientHeight;
            if (width < height) {
                self.odataBase.tipCommon.openTipsWindow("横屏效果更好!")
            }
            else {
                // TODO 关闭
                self.odataBase.tipCommon.closeTips();
            }
        });

        self.btn_GoToSingle.defaultToggle(function () {
            console.log("进入单身公寓外景");
            self.btn_GoToSingle.textContent.color = Fire.Color.white;
            self.loadScreen(1);
        });


    },
    // 重置Toggle状态
    modifyToggle: function () {
        this.btn_GoToSingle.textContent.color = Fire.Color.red;
        this.btn_GoToSingle.resetToggle();
        this.btn_GoToVilla.textContent.color = Fire.Color.red;
        this.btn_GoToVilla.resetToggle();
    },

    onGoToSingleEvent: function () {
        this.modifyToggle();
        this.btn_GoToSingle.textContent.color = Fire.Color.white;
        console.log("进入单身公寓外景");
        var self = this;
        self.loadScreen(1);
    },
    onGoToVillaEvent: function () {
        this.modifyToggle();
        this.btn_GoToVilla.textContent.color = Fire.Color.white;
        console.log("进入别墅外景");
        var self = this;
        self.loadScreen(2);
    },
    onGoToMyAddEvent: function () {
        console.log("打开我加入的");
        this.odataBase.myAddFamilyWin.openWindow();
    },
    onGoToHouseShopEvent: function () {
        console.log("打开房屋商城");
        window.open("http://www.saike.com/houseshop/nshop.php");
    },
    onGoToDressShopEvent: function () {
        console.log("打开扮靓商城");
        window.open('http://www.saike.com/housedress/shop.php');
    },

    // called every frame
    update: function () {
        // 匹配UI分辨率
        var camera = Fire.Camera.main;
        var bgWorldBounds = this.odataBase.bgRender.getWorldBounds();
        var bgLeftTopWorldPos = new Fire.Vec2(bgWorldBounds.xMin+ this.offset.x, bgWorldBounds.yMax + this.offset.y);
        var bgleftTop = camera.worldToScreen(bgLeftTopWorldPos);
        var screenPos = new Fire.Vec2(bgleftTop.x, bgleftTop.y);
        var worldPos = camera.screenToWorld(screenPos);
        this.entity.transform.worldPosition = worldPos;
    }
});

Fire._RFpop();
},{}],"Merchandise":[function(require,module,exports){
Fire._RFpush(module, '2ffd5w3CLxEL5ouEyu88jjB', 'Merchandise');
// script\villa\Merchandise.js

var Merchandise = Fire.Class({
    extends: Fire.Component,
    constructor: function () {
        // id;
        this.tid = 0;
        // 数量
        this.num = 1;
        // 打折
        this.discount = 1;
        // 单个价钱
        this.price = 0;
        // 普通价
        this.ordinaryPriceValue = 0;
        // 打折价
        this.discountPriceValue = 0;
        // 刷新总价格
        this.onrefreshPriceEvent = null;
    },
    properties: {
        icon: {
            default: null,
            type: Fire.SpriteRenderer
        },
        tName: {
            default: null,
            type: Fire.Text
        },
        tNum: {
            default: null,
            type: Fire.Text
        },
        btn_less: {
            default: null,
            type: Fire.UIButton
        },
        btn_add: {
            default: null,
            type: Fire.UIButton
        },
        ordinaryPrice: {
            default: null,
            type: Fire.Text
        },
        discountPrice: {
            default: null,
            type: Fire.Text
        },
        btn_del: {
            default: null,
            type: Fire.UIButton
        }
    },
    // 重置
    reset: function () {
        this.icon.sprite = null;
        this.tName.text = '';
        this.setNum(0);
        this.ordinaryPrice.text = 0 + "C币";
        this.discountPrice.text = 0 + "C币";
        this.entity.active = false;
    },
    // 减少数量
    _onLessEvent: function () {
        if (this.num === 1) {
            return;
        }
        this.num--;
        if (this.num < 1) {
            this.num = 1;
        }
        this.setNum(this.num);
        this.refreshOrdinaryPrice();
        if (this.onrefreshPriceEvent) {
            this.onrefreshPriceEvent(this.tid, this.num);
        }
    },
    // 增加数量
    _onAddEvent: function () {
        this.num++;
        this.setNum(this.num);
        this.refreshOrdinaryPrice();
        if (this.onrefreshPriceEvent) {
            this.onrefreshPriceEvent(this.tid, this.num);
        }
    },
    // 设置数量
    setNum: function (value) {
        this.num = value;
        this.tNum.text = value;
    },
    // 设置普通价
    refreshOrdinaryPrice: function () {
        this.ordinaryPriceValue = this.num * this.price;
        this.ordinaryPrice.text = this.ordinaryPriceValue + "C币";
        // 设置打折价
        this.refreshDiscountPrice();
    },
    // 设置打折价
    refreshDiscountPrice: function () {
        this.discountPriceValue = this.ordinaryPriceValue * this.discount;
        this.discountPrice.text = this.discountPriceValue + "C币";
    },
    // 刷新
    refresh: function (data, delEvent, refreshPriceEvent) {
        this.tid = data.tid;
        this.icon.sprite = data.icon || null;
        this.tName.text = data.tName || '';
        this.setNum(data.tNum || 0);
        this.price = data.price;
        this.discount = data.discount;
        this.refreshOrdinaryPrice();
        this.btn_del.onClick = delEvent || null;
        this.onrefreshPriceEvent = refreshPriceEvent;
        this.entity.active = true;
    },
    //
    start: function () {
        this.btn_less.onClick = this._onLessEvent.bind(this);
        this.btn_add.onClick = this._onAddEvent.bind(this);
    }
});

Fire._RFpop();
},{}],"MyAddFamilyWindow":[function(require,module,exports){
Fire._RFpush(module, '45defgishtC2KT5us+jmXNZ', 'MyAddFamilyWindow');
// script\outdoor\MyAddFamilyWindow.js

var MyAddFamilyWindow = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        this._addMyFamilyDataSheets = [];
        // 每页显示多少个
        this._showPageCount = 7;
        // 总数
        this._curTotal = 0;
        // 当前页数
        this._curPage = 1;
        // 最大页数
        this._maxPage = 1;
        //
        this.relieveing = false;
    },
    // 属性
    properties: {
        tempAddFamily: {
            default: null,
            type: Fire.Entity
        },
        root: {
            default: null,
            type: Fire.Entity
        },
        btn_close: {
            default: null,
            type: Fire.UIButton
        },
        btn_next: {
            default: null,
            type: Fire.UIButton
        },
        btn_previous: {
            default: null,
            type: Fire.UIButton
        },
        pageText: {
            default: null,
            type: Fire.Text
        }
    },

    start: function () {
        // 常用的变量/数据
        var ent = Fire.Entity.find('/ODataBase');
        this.odataBase = ent.getComponent('ODataBase');
        //
        this.btn_close.onClick = this._onCloseWindowEvent.bind(this);
        this.btn_previous.onClick = this._onNextPageEvnet.bind(this);
        this.btn_next.onClick = this._onPreviousPageEvent.bind(this);
        this.btn_previous.entity.active = false;
        this.btn_next.entity.active = false;
    },
    // 重置
    resetData: function () {
        var children = this.root.getChildren();
        for (var i = 0; i < children.length; ++i) {
            children[i].destroy();
        }
    },
    // 进入房屋
    _onGoToHouseEvent: function (event) {
        this.closeWindow();
        var familyInfo = event.target.parent.getComponent('FamilyInfo');
        var sendData = {
            house_uid: 0,
            floor_id: 0,
            mark: familyInfo.mark
        };
        this.odataBase.planWin.openWindow(sendData);
    },
    // 解除关系
    _onRelieveEvent: function (event) {
        var self = this;
        if (self.relieveing) {
            return;
        }
        var familyInfo = event.target.parent.getComponent('FamilyInfo');
        self.odataBase.tipCommon.openTipsWindow("是否与 " + familyInfo.lover_name + " 解除关系?", function () {
            self.relieveing = true;
            var sendData = {
                mark: familyInfo.mark
            };
            self.odataBase.serverNetWork.RequestDisassociateList(sendData, function (serverData) {
                if (serverData.status === 10000) {
                    self.refreshFloorData(serverData, function () {
                        self.createFamilyInfo();
                        self.relieveing = false;
                    });
                }
                else {
                    self.tipCommon.openTipsWindow(serverData.desc);
                }
            });
        });
    },
    // 关闭按钮事件
    _onCloseWindowEvent: function () {
        this.closeWindow();
    },
    // 刷新按钮状态
    _refreshBtnState: function () {
        this.btn_previous.entity.active = this._curPage > 1;
        this.btn_next.entity.active = this._curPage < this._maxPage;
        this.pageText.text = '页数:' + this._curPage + "/" + this._maxPage;
    },
    // 下一页
    _onNextPageEvnet: function () {
        this._curPage -= 1;
        if (this._curPage < 1){
            this._curPage = 1;
        }
        this.createFamilyInfo();
    },
    // 上一页
    _onPreviousPageEvent: function () {
        this._curPage += 1;
        if (this._curPage > this._maxPage){
            this._curPage = this._maxPage;
        }
        this.createFamilyInfo();
    },
    refreshFloorData: function (serverData, callback) {
        var self = this;
        if (serverData.status !== 10000) {
            self.odataBase.tipCommon.openTipsWindow(serverData.desc);
            return;
        }
        self._addMyFamilyDataSheets = [];
        serverData.list.mylived.forEach(function (data) {
            self._addMyFamilyDataSheets.push(data);
        });
        if (callback) {
            callback();
        }
    },
    //
    createFamilyInfo: function () {
        this.resetData();
        var dataSheets = this._addMyFamilyDataSheets;
        var bindGotHouseEvent = this._onGoToHouseEvent.bind(this);
        var bindRelieveEvent = this._onRelieveEvent.bind(this);
        //
        this._curTotal = dataSheets.length;
        this._maxPage = Math.ceil(this._curTotal / this._showPageCount);
        if (this._maxPage === 0) {
            this._maxPage = 1;
        }
        var startCount = (this._curPage - 1) * this._showPageCount;
        var entCount = startCount + this._showPageCount;
        if (entCount > this._curTotal) {
            entCount = this._curTotal;
        }
        var index = 0;
        for (var i = startCount; i < entCount; ++i) {
            var data = dataSheets[i];
            var ent = Fire.instantiate(this.tempAddFamily);
            ent.name = i.toString();
            ent.parent = this.root;
            ent.active = true;
            ent.transform.position = new Fire.Vec2(-2.5, (index * 77));
            var info = ent.getComponent('FamilyInfo');
            info.refresh(data, bindGotHouseEvent, bindRelieveEvent);
            index++;
        }
        // 刷新按钮状态
        this._refreshBtnState();
    },
    // 打开窗口
    openWindow: function () {
        this.entity.active = true;
        var self = this;
        self.odataBase.loadTip.openTips('载入数据！请稍后...');
        self.odataBase.serverNetWork.RequestFloorList(function (serverData) {
            self.odataBase.loadTip.closeTips();
            self.refreshFloorData(serverData, function () {
                if (self._addMyFamilyDataSheets.length === 0) {
                    self.odataBase.tipNoAddFamily.openTipsWindow(null, function () {
                        window.open("http://www.saike.com/houseshop/newhouse.php");
                        self.closeWindow();
                    })
                    return;
                }
                self.createFamilyInfo();
            });
        });
    },
    // 关闭窗口
    closeWindow: function () {
        this.entity.active = false;
    }
});

Fire._RFpop();
},{}],"NetworkMgr":[function(require,module,exports){
Fire._RFpush(module, '16c7deh3lNGmpy2mtELu8BW', 'NetworkMgr');
// script\villa\NetworkMgr.js

// 跟服务器进行对接
var NetworkMgr = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        // 当前请求数据
        this._postData = {};
        // 断线重连窗口
        this.netWorkWin = null;
        // 用于测试的token数据
        this.token = '';
        //
        this._dataBase = null;
    },
    // 属性
    properties: {
        localTest: false,
        dataBase: {
            get: function () {
                if (! this._dataBase) {
                    // 常用的变量/数据
                    var ent = Fire.Entity.find('/DataBase');
                    this._dataBase = ent.getComponent('DataBase');
                }
                return this._dataBase;
            },
            visible: false
        }
    },
    // 获取用户信息
    getToKenValue: function () {
        if (this.localTest) {
            //this.token = 'MTAwMjExODMzMF9mMThjZmM4ODI4NzRhZTBlMTA5MTZjZTJkODk0ZjgzZl8xNDM2MTY3ODMyX3dhcA==';
            this.token = 'MTAwMTQ5MjY4NV8xYWEzYzFkNmE0ZWI3YzlkNmQxYmJmNDc4NTNmZjhkM18xNDM2MzI2Mzc2X3dhcA';
        }
        else{
            this.token = this.getQueryString('token');
            if (! this.token){
                //console.log("没有用户信息, ToKen is null");
                return false;
            }
        }
        return true;
    },
    // 用JS获取地址栏参数的方法
    getQueryString: function(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r !== null){
            return unescape(r[2]);
        }
        return null;
    },
    // 请求失败
    _errorCallBack: function () {
        var self = this;
        this.netWorkWin.openWindow(function () {
            self.sendData(self._postData);
        });
    },
    // 发送数据
    sendData: function (data) {
        if (! Fire.Engine.isPlaying) {
            return;
        }
        if (! this.getToKenValue()) {
            return;
        }
        //this.dataBase.loadTips.openTips('请求中，请稍后...');
        this._postData = data;
        this.jQueryAjax(data.url, data.sendData, data.cb, data.errCb);
    },
    // 发送消息
    jQueryAjax: function (strUrl, data, callBack, errorCallBack) {
        var params = "";
        if (typeof(data) !== "object") { params = data + "&token=" + this.token; }
        else {
            for (var key in data) {
                params += (key + "=" + data[key] + "&"  );
            }
            params += "&token=" + this.token;
        }
        var self = this;
        var send = {
            type: "POST",
            url: strUrl + "?&jsoncallPP=?",
            data: params,
            dataType: 'jsonp',
            success: function (data) {
                //console.log(data);
                if (! Fire.Engine.isPlaying) {
                    return;
                }
                if (callBack) {
                    callBack(data);
                }
                //self.dataBase.loadTips.closeTips();
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                if (! Fire.Engine.isPlaying) {
                    return;
                }
                if (errorCallBack) {
                    errorCallBack();
                }
                //self.dataBase.loadTips.closeTips();
                console.log(errorThrown);
                console.log(XMLHttpRequest);
                console.log(textStatus);
            }
        };
        jQuery.ajax(send);
    },
    // 保存装扮
    RequestSaveRoom: function (sendData, callback) {
        var postData = {
            url: "http://m.saike.com/suitdress/save.html",
            sendData: {
                mark: this.dataBase.mark,
                suit_id: sendData.suit_id,
                suit_from: sendData.suit_from,
                dataList: JSON.stringify(sendData.dataList)
            },
            cb: callback,
            errCb: this._errorCallBack.bind(this)
        };
        this.sendData(postData);
    },
    // 询问是否可以装扮
    RequestCanDressRoom: function (sendData, callback) {
        var postData = {
            url: "http://m.saike.com/suitdress/beginSuit.html",
            sendData: sendData,
            cb: callback,
            errCb: this._errorCallBack.bind(this)
        };
        this.sendData(postData);
    },
    // 请求房间数据
    RequestIntoHomeData: function (sendData, callback) {
        var postData = {
            url: "http://m.saike.com/suitdress/intoRoom.html",
            sendData: {
                house_uid: sendData.house_uid,
                mark: sendData.mark,
                clear: sendData.clear || 0
            },
            cb: callback,
            errCb: this._errorCallBack.bind(this)
        };
        this.sendData(postData);
    },
    // 获取平面图
    RequestPlan: function (sendData, callback) {
        var postData = {
            url: "http://m.saike.com/suitdress/showCover.html",
            sendData: {
                house_uid: sendData.house_uid,
                floor_id: sendData.floor_id,
                mark: sendData.mark
            },
            cb: callback,
            errCb: this._errorCallBack.bind(this)
        };
        this.sendData(postData);
    },
    // 楼层列表
    RequestFloorList: function (callback) {
        var postData = {
            url: "http://m.saike.com/suitdress/floorList.html",
            sendData: {},
            cb: callback,
            errCb: this._errorCallBack.bind(this)
        };
        this.sendData(postData);
    },
    // 解除关系
    RequestDisassociateList: function (sendData, callback) {
        var postData = {
            url: "http://m.saike.com/suitdress/releaseRelation.html",
            sendData: sendData,
            cb: callback,
            errCb: this._errorCallBack.bind(this)
        };
        this.sendData(postData);
    },
    // 请求单品家具菜单列表
    RequestSingleItemsMenu: function (callback) {
        var postData = {
            url: 'http://m.saike.com/housedress/getShopType.html',
            sendData: {},
            cb: callback,
            errCb: this._errorCallBack.bind(this)
        };
        this.sendData(postData);
    },
    // 请求单品家具列表
    RequestSingleItems: function (data, callback) {
        var postData = {
            url: "http://m.saike.com/housedress/getShopList.html",
            sendData: {
                tid: data.tid,
                page: data.page,
                each: data.each
            },
            cb: callback,
            errCb: this._errorCallBack.bind(this)
        };
        this.sendData(postData);
    },
    //请求套装列表数据
    RequestSetItemsMenu: function (data,  callback) {
        var postData = {
            url: "http://m.saike.com/housedress/shopSuit.html",
            sendData: {
                page: data.page,
                each: data.each
            },
            cb: callback,
            errCb: this._errorCallBack.bind(this)
        };
        this.sendData(postData);
    },
    //请求套装数据
    RequestSetItemsData: function (id,  callback) {
        var postData = {
            url: "http://m.saike.com/housedress/shopsuitdetail.html",
            sendData: {
                prod_suitid: id
            },
            cb: callback,
            errCb: this._errorCallBack.bind(this)
        };
        this.sendData(postData);
    },
    // 物品柜(单品)
    RequestBackpackSingle: function (sendData, callback) {
        var postData = {
            url: "http://m.saike.com/suitdress/backpackSingle.html",
            sendData: sendData,
            cb: callback,
            errCb: this._errorCallBack.bind(this)
        };
        this.sendData(postData);
    },
    // 物品柜(套装)
    RequestBackpackSuit: function (sendData, callback) {
        var postData = {
            url: "http://m.saike.com/suitdress/mySuit.html",
            sendData: sendData,
            cb: callback,
            errCb: this._errorCallBack.bind(this)
        };
        this.sendData(postData);
    },
    // 开始时
    start: function () {
        // 常用的变量/数据
        var ent = Fire.Entity.find('/DataBase');
        var dataBase = ent.getComponent('DataBase');
        this.netWorkWin = dataBase.netWorkWin;
    }
});

Fire._RFpop();
},{}],"NewWorkWindow":[function(require,module,exports){
Fire._RFpush(module, '6718fQ4dhdFYKoNkbR2E+RW', 'NewWorkWindow');
// script\villa\NewWorkWindow.js

var Comp = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        this.callbackEvent = null;
    },
    // 属性
    properties: {
        btn_Reconnect: {
            default: null,
            type: Fire.UIButton
        }
    },
    // 开启窗口
    openWindow: function (callback) {
        this.entity.active = true;
        if (callback) {
            this.callbackEvent = callback;
        }
    },
    // 关闭窗口
    closeWindow: function () {
        this.entity.active = false;
    },
    // 重新连接事件
    _onReconnectionEvent: function() {
        this.closeWindow();
        if (this.callbackEvent) {
            this.callbackEvent();
            this.callbackEvent = null;
        }
    },
    // 开始
    start: function () {
        // 绑定重新连接按钮
        this.btn_Reconnect.onClick = this._onReconnectionEvent.bind(this);
    }
});

Fire._RFpop();
},{}],"ODataBase":[function(require,module,exports){
Fire._RFpush(module, '51301AF6clEyZL7HLAH23iL', 'ODataBase');
// script\outdoor\ODataBase.js

//  存放项目需要的变量/数据/对象
var ODataBase = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        // 保存所有图片
        this.loadImageList = {};
        //
        this.uid = 0;
        //
        this.mark;
    },

    properties: {
        tempGlobalData: {
            default: null,
            type: Fire.Entity
        },
        tempFamily: {
            default: null,
            type: Fire.Entity
        },
        mask: {
            default: null,
            type: Fire.Entity
        }
    },

    // 载入时
    onLoad: function () {
        // 载入控件
        this.loadControls();
        this.mask.active = true;
    },
    // 载入控件
    loadControls: function () {
        // 背景
        var ent = Fire.Entity.find('/BackGround');
        this.bgRender = ent.getComponent(Fire.SpriteRenderer);
        // 地板
        ent = Fire.Entity.find('/BackGround/House');
        this.house = ent.getComponent(Fire.UIButton);
        //
        this.tipToKenError = Fire.Entity.find('/Tip_ToKenError');
        // 网络连接
        this.serverNetWork = this.entity.getComponent('ServerNetWork');
        // 主菜单
        ent = Fire.Entity.find('/MainMenu');
        this.mainMenu = ent.getComponent('MainMenu');
        // 子菜单
        ent = Fire.Entity.find('/SubMenu');
        this.subMenu = ent.getComponent('SubMenu');
        // 重新请求服务器窗口
        ent = Fire.Entity.find('/Tip_NetWork');
        this.netWorkWin = ent.getComponent('NewWorkWindow');
        // 加载提示
        ent = Fire.Entity.find('/Tip_Load');
        this.loadTip = ent.getComponent('TipLoad');
        // 温馨提示窗口
        ent = Fire.Entity.find('/Tip_Common');
        this.tipCommon = ent.getComponent('TipsWindow');

        ent = Fire.Entity.find('/GlobalData');
        if (!ent) {
            ent = Fire.instantiate(this.tempGlobalData);
            ent.name = 'GlobalData';
            ent.dontDestroyOnLoad = true;
        }
        this.globalData = ent.getComponent("GlobalData");
        //
        ent = Fire.Entity.find('/Characters');
        this.characters = ent.getComponent('Characters');
        //
        ent = Fire.Entity.find('/Win_MyAddFamily');
        this.myAddFamilyWin = ent.getComponent('MyAddFamilyWindow');
        //
        ent = Fire.Entity.find('/Win_Plan');
        this.planWin = ent.getComponent('PlanWindow');
        //
        ent = Fire.Entity.find('/Tip_NoAddFamily');
        this.tipNoAddFamily = ent.getComponent('TipsWindow');
    },
    // 下载图片
    loadImage: function (url, callback) {
        var self = this;
        if (self.loadImageList[url]) {
            var image = self.loadImageList[url];
            if (callback) {
                callback(null, image);
            }
            return;
        }
        Fire.ImageLoader(url, function (error, image) {
            if (callback) {
                callback(error, image);
            }
            if (image) {
                self.loadImageList[url] = image;
            }
        });
    },
    // 初始化场景
    initScreen: function (sendData, callback) {
        var self = this;
        self.serverNetWork.InitOutdoor(sendData, function (serverData) {
            if (serverData.status !== 10000) {
                self.tipCommon.openTipsWindow(serverData.desc);
                if (callback) {
                    callback(null);
                }
                return;
            }
            var index = 0;
            self.loadImage(serverData.list.bgUrl, function (error, image) {
                if (error) {
                    return
                }
                var sprite = new Fire.Sprite(image);
                self.bgRender.sprite = sprite;
                index++;
                if (index == 2 && callback) {
                    callback(serverData);
                }
            });
            self.loadImage(serverData.list.housesUrl, function (error, image) {
                if (error) {
                    return
                }
                self.house.setImage(image);
                index++;
                if (index == 2 && callback) {
                    callback(serverData);
                }
            });
        });
    }
});

Fire._RFpop();
},{}],"Options":[function(require,module,exports){
Fire._RFpush(module, 'cfe8bU7lHNGXYgrwbF7Z7FA', 'Options');
// script\common\Options.js

var Options = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        this.anim = null;
        this.bindHideOptionsEvent = this._hideOptionsEvent.bind(this);
        this.onHideEvent = null;
    },
    // 属性
    properties: {
        // 隐藏选项
        btn_hide: {
            default: null,
            type: Fire.UIButton
        },
        // 删除对象
        btn_del: {
            default: null,
            type: Fire.UIButton
        },
        // 镜像翻转
        btn_MirrorFlip: {
            default: null,
            type: Fire.UIButton
        }
    },
    // 是否开启中
    hasOpen: function () {
        return this.entity.active;
    },
    // 是否有触碰选项
    hasTouch: function (target) {
        return target === this.btn_hide.entity ||
               target === this.btn_del.entity  ||
               target === this.btn_MirrorFlip.entity;
    },
    // 设置坐标
    setPos: function (value) {
        this.entity.transform.position = value;
    },
    // 打开选项
    open: function (target) {
        // 设置左边
        if (target) {
            this.entity.parent = null;
            this.setPos(target.transform.worldPosition);
        }
        this.entity.active = true;
        if (! this.anim) {
            this.anim = this.entity.getComponent(Fire.Animation);
        }
        this.anim.play('options');
    },
    // 隐藏选项
    hide: function () {
        this.entity.active = false;
        this.entity.transform.scale = new Fire.Vec2(0, 0);
        if (this.onHideEvent) {
            this.onHideEvent();
        }
    },
    // 隐藏选项
    _hideOptionsEvent: function() {
        this.hide();
    },
    // 开始
    start: function () {
        this.btn_hide.onMousedown = this.bindHideOptionsEvent;
    }
});

Fire._RFpop();
},{}],"OtherMenuMgr":[function(require,module,exports){
Fire._RFpush(module, '957e6sA/CZOsYQEYVFiSn6u', 'OtherMenuMgr');
// script\villa\OtherMenuMgr.js

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

Fire._RFpop();
},{}],"PayMentWindow":[function(require,module,exports){
Fire._RFpush(module, 'ca7e9uT87NC0bDGl4oyr6QQ', 'PayMentWindow');
// script\villa\PayMentWindow.js

var PayMentWindow = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        // 显示数量
        this._showCount = 3;
        // 当前总数
        this._curTotal = 0;
        // 当前页
        this._curPage = 1;
        // 最大页签
        this._maxPage = 1;
        // 商品容器
        this.merchandiseList = [];
        // 商品数据
        this.merchandiseDataList = [];
    },
    // 属性
    properties: {
        root: {
            default: null,
            type: Fire.Entity
        },
        // 删除窗口
        btn_close: {
            default: null,
            type: Fire.UIButton
        },
        // 确认支付
        btn_pay: {
            default: null,
            type: Fire.UIButton
        },
        // 用户金额
        userPrice: {
            default: null,
            type: Fire.Text
        },
        // 立即充值
        btn_Recharge: {
            default: null,
            type: Fire.UIButton
        },
        // 合计物品与有效期限文字描述
        numAndDuration: {
            default: null,
            type: Fire.Text
        },
        // 总价格与总支付
        priceDescription: {
            default: null,
            type: Fire.PriceDescription
        },
        // 控制底部物件的高度
        bottomRoot: {
            default: null,
            type: Fire.Entity
        },
        // 合计物品与有效期限文字描述
        page: {
            default: null,
            type: Fire.Text
        },
        // 上一页
        btn_Previous: {
            default: null,
            type: Fire.UIButton
        },
        // 下一页
        bnt_Next: {
            default: null,
            type: Fire.UIButton
        },
        // 没购物的图标提示
        nullTips: {
            default: null,
            type: Fire.Entity
        }
    },
    // 关闭按钮事件
    _onCloseWindowEvent: function () {
        this.dataBase.firstMenuMgr.openMenu();
        this.closeWindow();
    },
    // 充值
    _onRechargeEvent: function () {
        window.open('http://www.saike.com/n_pay/charge.php');
        this.dataBase.payMentTips.openTips();
    },
    // 确认支付
    _onPayEvent: function () {
        var self = this;
        self.dataBase.tipsWindow.openTipsWindow('您确定花费'+ this.payNum +'C币购买？', function () {
            if (self.dataBase.usercc < self.payNum) {
                self.dataBase.tipsWindow.openTipsWindow('您当前余额不足, 是否充值？', function () {
                    self._onRechargeEvent();
                });
            }
            else {
                self._pay();
            }
        });
    },
    // 支付
    _pay: function () {
        var self = this;
        self.dataBase.loadTips.openTips('支付中！请稍后...');
        self.dataBase.saveRoom(function (serverUsercc) {
            self.dataBase.usercc = serverUsercc;
            self.dataBase.curDressSuit.price = 0;
            self.dataBase.hasCanSave = false;
            self.dataBase.saveDefaultData();
            self.closeWindow();
            self.dataBase.loadTips.closeTips();
            self.dataBase.tipsWindow.openTipsWindow('支付成功，并保存装扮..');
            self.dataBase.resetScreen(function () {
                var sendData = {
                    mark: self.dataBase.mark
                };
                self.dataBase.loadTips.openTips('刷新场景，请稍后...');
                self.dataBase.intoRoom(sendData, function () {
                    self.dataBase.loadTips.closeTips();
                });
            });
        });
    },
    // 上一页
    _onPreviousEvent: function () {
        this._curPage -= 1;
        if (this._curPage < 1){
            this._curPage = 1;
        }
        this._refreshMerchandise();
    },
    // 下一页
    _onNextEvent: function () {
        this._curPage += 1;
        if (this._curPage > this._maxPage){
            this._curPage = this._maxPage;
        }
        this._refreshMerchandise();
    },
    // 重置商品列表
    _resetMerchandise: function () {
        var children = this.merchandiseList;
        for(var i = 0; i < children.length; ++i) {
            var comp = children[i];
            comp.reset();
        }
    },
    // 重置窗口
    _resetWindow: function () {
        // 重置商品列表
        this._resetMerchandise();
        // 重置合计物品与有效期限文字描述
        this.numAndDuration.text = '合计: 0件物品, 有效期:0天';
        this.numAndDuration.entity.active = false;
        // 重置总价格与总支付
        this.priceDescription.reset();
        // 重置用户余额
        this.userPrice.text = '用户余额: 0C币';
        // 重置页签
        this._curPage = 1;
        this._maxPage = 1;
        this.page.entity.active = false;
        // 刷新按钮状态
        this._refreshBtnState();
    },
    // 刷新商品数据
    _refreshMerchandiseDataList: function (callback) {
        this.merchandiseDataList = [];
        var data = {};
        // 套装
        var dressSuit = this.dataBase.curDressSuit;
        if (dressSuit.price > 0) {
            data = {
                icon: dressSuit.suit_icon,
                tName: dressSuit.suit_name,
                tNum: 1,
                price: dressSuit.price,
                discount: dressSuit.discount
            };
            this.merchandiseDataList.push(data);
        }

        var children = this.dataBase.room.getChildren();
        for (var i = 0; i < children.length; ++i) {
            var ent = children[i];
            var furniture = ent.getComponent('Furniture');
            if (parseInt(furniture.price) > 0 && furniture.suit_id === 0) {
                data = {
                    icon: furniture.smallSprite,
                    tName: furniture.props_name,
                    tNum: 1,
                    price: furniture.price,
                    discount: furniture.discount
                };
                this.merchandiseDataList.push(data);
            }
        }
        if (callback) {
            callback();
        }
    },
    // 刷新商品
    _refreshMerchandise: function () {
        // 重置商品列表
        this._resetMerchandise();
        // 获取商品数据
        var dataList = this.merchandiseDataList;
        var total = dataList.length;
        if (this._curTotal !== total) {
            this._curTotal = total;
            this._maxPage = Math.ceil(this._curTotal / this._showCount);
        }
        // 赋值数据
        var startNum = (this._curPage - 1) * this._showCount;
        var endNum = startNum + this._showCount;
        if (endNum > this._curTotal) {
            endNum = this._curTotal;
        }
        var index = 0;
        for(var i = startNum; i < endNum; ++i) {
            var menu = this.merchandiseList[index];
            var data = dataList[i];
            data.tid = i;
            menu.refresh(data, this.bindDelMerchandiseEvent, this.bindRefreshNumEvent);
            index++;
        }
        // 合计物品与有效天数
        this.numAndDuration.text = '合计: ' + total + '件物品, 有效期:90天';
        this.numAndDuration.entity.active = total > 0;
        this.nullTips.active = total === 0;
        // 总价格 与 折后价 需要支付
        this._refreshAllPrice();
        // 用户余额
        this.refreshUserCC();
        // 刷新按钮状态
        this._refreshBtnState();
    },
    // 刷新用户余额
    refreshUserCC: function () {
        this.userPrice.text = '用户余额: ' + this.dataBase.usercc + 'C币';
    },
    // 刷新所有价格
    _refreshAllPrice: function () {
        // 总价格 折后价 需要支付
        var total = 0, discount = 0, pay = 0;
        var dataList = this.merchandiseDataList;
        for (var i = 0; i < dataList.length; ++i) {
            var data = dataList[i];
            var price = data.tNum * data.price;
            total += price;
            var dicountPrice = price * data.discount;
            discount += dicountPrice;
        }
        pay = discount;
        this.payNum = pay;
        this.priceDescription.refresh(total, discount, pay);
    },
    // 刷新数量
    _onRefreshNumEvent: function (id, num) {
        if (this.merchandiseDataList.length > id) {
            var data = this.merchandiseDataList[id];
            data.tNum = num;
            this._refreshAllPrice();
        }
    },
    // 刷新按钮状态
    _refreshBtnState: function () {
        this.btn_Previous.entity.active = this._curPage > 1;
        this.bnt_Next.entity.active = this._curPage < this._maxPage;
        this.page.text = this._curPage + "/" + this._maxPage;
    },
    // 删除单个商品
    _onDelMerchandiseEvent: function (event) {
        var merchandise = event.target.parent.getComponent('Merchandise');
        if (merchandise && this.merchandiseDataList.length > merchandise.tid) {
            this.merchandiseDataList.splice(merchandise.tid, 1);
        }
        this._refreshMerchandise();
    },
    // 开启窗口
    openWindow: function () {
        this.payNum = 0;
        var self = this;
        //
        self.dataBase.firstMenuMgr.closeMenu();
        // 重置窗口数据
        self._resetWindow();
        // 显示窗口
        self.entity.active = true;
        // 刷新商品数据
        self._refreshMerchandiseDataList(function () {
            // 刷新商品
            self._refreshMerchandise();
        });
    },
    // 关闭窗口
    closeWindow: function () {
        this.entity.active = false;
        this._curPage = 1;
    },
    // 开始
    start: function () {
        // 常用的变量/数据
        var ent = Fire.Entity.find('/DataBase');
        this.dataBase = ent.getComponent('DataBase');
        //
        this.payNum = 0;
        //
        var children = this.root.getChildren();
        for(var i = 0; i < children.length; ++i) {
            ent = children[i];
            var comp = ent.getComponent('Merchandise');
            this.merchandiseList.push(comp);
        }
        this.bindRefreshNumEvent = this._onRefreshNumEvent.bind(this);
        this.bindDelMerchandiseEvent = this._onDelMerchandiseEvent.bind(this);
        this.btn_close.onClick = this._onCloseWindowEvent.bind(this);
        this.btn_pay.onClick = this._onPayEvent.bind(this);
        this.btn_Previous.onClick = this._onPreviousEvent.bind(this);
        this.bnt_Next.onClick = this._onNextEvent.bind(this);
        this.btn_Recharge.onClick = this._onRechargeEvent.bind(this);
    }
});

Fire._RFpop();
},{}],"PlanWindow":[function(require,module,exports){
Fire._RFpush(module, '89409Aa3N5M4qNMlkCSnMMC', 'PlanWindow');
// script\outdoor\PlanWindow.js

var PlanWindow = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {

    },
    // 属性
    properties: {
        tempPlan: {
            default: null,
            type: Fire.Entity
        },
        root: {
            default: null,
            type: Fire.Entity
        },
        roomName: {
            default: null,
            type: Fire.Text
        },
        roomLevel: {
            default: null,
            type: Fire.Text
        },
        roomNum: {
            default: null,
            type: Fire.Text
        },
        btn_close: {
            default: null,
            type: Fire.UIButton
        }
    },
    // 重置窗口
    resetWindow: function () {
        this.roomName.text = '(别墅名称)';
        this.roomLevel.text = '档次：★★★★★★';
        this.roomNum.text = '共8个房间';
    },
    // 打开窗口
    // type: 那个路口进入平面图的
    // 0, 切换房间 1：切换楼出
    openWindow: function (sendData) {
        var self = this;
        self.entity.active = true;
        self._removePlan();
        var loaclData = self.planList[sendData.mark];
        if (loaclData) {
            self.odataBase.mark = sendData.mark;
            self.createPlan(loaclData);
        }
        else {
            self.odataBase.loadTip.openTips('载入平面图数据！请稍后...');
            self.odataBase.serverNetWork.RequestPlan(sendData, function (serverData) {
                self.odataBase.loadTip.closeTips();
                self.planList[sendData.mark] = serverData;
                self.odataBase.mark = sendData.mark;
                self.createPlan(serverData);
            });
        }
    },
    // 关闭窗口
    closeWindow: function () {
        this.entity.active = false;
    },
    // 绘制星级
    getStars: function (grade) {
        var str = '档次：';
        if (grade === 12) {
            str += '至尊宝';
        }
        else {
            for (var i = 0; i < grade - 1; ++i) {
                str += '★';
            }
        }
        return str;
    },
    // 创建平面图
    createPlan: function (serverData) {
        if (! serverData.list) {
            return;
        }
        // 像服务器请求平面图数据
        this.roomName.text = serverData.floor_name;
        this.roomLevel.text = this.getStars(serverData.floor_grade);
        this.roomNum.text = '共'+ serverData.list.length + '个房间';
        this.bindGoToRoomEvent = this._onGotoRoomEvent.bind(this);
        for (var i = 0; i < serverData.list.length; ++i) {
            var data = serverData.list[i];
            var ent = Fire.instantiate(this.tempPlan);
            ent.active = true;
            ent.parent = this.root;
            var btn = ent.getComponent(Fire.UIButton);
            btn.mark = data.mark;
            this.odataBase.loadImage(data.imgurl, function (btn, error, image) {
                var sprite = new Fire.Sprite(image);
                sprite.pixelLevelHitTest = true;
                btn.setSprite(sprite);
                btn.onClick = this.bindGoToRoomEvent;
            }.bind(this, btn));
        }
    },
    // 进入房间
    _onGotoRoomEvent: function (event) {
        var btn = event.target.getComponent(Fire.UIButton);
        var sendData = {
            mark: btn.mark,
            house_uid: 0
        };
        this.odataBase.globalData.sendData = sendData;
        Fire.Engine.loadScene('villa');
    },
    // 清空房间
    _removePlan: function () {
        var children = this.root.getChildren();
        for (var i = 0;i < children.length; ++i) {
            children[i].destroy();
        }
    },
    // 关闭按钮事件
    _onCloseWindowEvent: function () {
        this.closeWindow();
        this._removePlan();
    },
    //
    start: function () {
        // 常用的变量/数据
        var ent = Fire.Entity.find('/ODataBase');
        this.odataBase = ent.getComponent('ODataBase');
        // 绑定事件
        this.btn_close.onClick = this._onCloseWindowEvent.bind(this);
        //
        this.planList = {};
    }
});

Fire._RFpop();
},{}],"PriceDescription":[function(require,module,exports){
Fire._RFpush(module, '902ecubdJpGhZizMPy4mmSh', 'PriceDescription');
// script\villa\PriceDescription.js

var PriceDescription = Fire.Class({
    extends: Fire.Component,

    properties: {
        total: {
            default: null,
            type: Fire.Text
        },
        discount: {
            default: null,
            type: Fire.Text
        },
        pay: {
            default: null,
            type: Fire.Text
        }
    },
    //
    reset: function () {
        this.total.text = '0.00C币';
        this.discount.text = '0.00C币';
        this.pay.text = '0.00C币';
        this.entity.active = false;
    },
    // 刷新
    refresh: function (total, discount, pay) {
        this.total.text = (total || 0) + 'C币';
        this.discount.text = (discount || 0) + 'C币';
        this.pay.text = (pay || 0) + 'C币';
        this.entity.active = true;
    }
});

Fire.PriceDescription = PriceDescription;

Fire._RFpop();
},{}],"SControlMgr":[function(require,module,exports){
Fire._RFpush(module, '534b1m+4LpHo53QrmSPL9cD', 'SControlMgr');
// script\single\SControlMgr.js

// �û�����������
var SControlMgr = Fire.Class({
    // �̳�
    extends: Fire.Component,
    // ���캯��
    constructor: function () {
        this.bindedMouseDownEvent = this._onMouseDownEvent.bind(this);
        this.bindedMouseMoveEvent = this._onMouseMoveEvent.bind(this);
        this.bindedMouseUpEvent = this._onMouseUpEvent.bind(this);
        this._backupSelectTarget = null;
    },
    // ����
    properties: {
        _selectTarget: null,
        _lastSelectTarget: null,
        _selectTargetInitPos: Fire.Vec2.zero,
        _mouseDownPos: Fire.Vec2.zero,
        _hasMoveTarget: false
    },
    // ���갴���¼�
    _onMouseDownEvent: function (event) {
        var target = event.target;
        if (!target ) {
            return;
        }
        var furniture = target.getComponent('SFurniture');
        if (furniture && furniture.hasDrag) {
            //
            this._selectTarget = target;
            this._backupSelectTarget = this._selectTarget;
            this._selectTargetInitPos = target.transform.position;
            var screendPos = new Fire.Vec2(event.screenX, event.screenY);
            this._mouseDownPos = Fire.Camera.main.screenToWorld(screendPos);
            this._selectTarget.setAsLastSibling();
            this._hasMoveTarget = true;
            // �Ƿ��򿪿���ѡ���������ͬ�Ķ����Ͳ���Ҫ���´���
            if (this._selectTarget !== this._lastSelectTarget) {
                this.sdataBase.options.open(this._selectTarget);
                this._lastSelectTarget = this._selectTarget;
            }
        }
        else {
            if (this.sdataBase.options.hasOpen()) {
                if (this.sdataBase.options.hasTouch(target)) {
                    this._selectTarget = this._backupSelectTarget;
                }
                else {
                    this._selectTarget = null;
                    this.sdataBase.options.hide();
                }
            }
        }
    },
    // �����ƶ��¼�
    _onMouseMoveEvent: function (event) {
        if (this._selectTarget && this._hasMoveTarget) {
            this._move(event);
        }
    },
    // �ƶ��Ҿ�
    _move: function (event) {
        var movePos = new Fire.Vec2(event.screenX, event.screenY);
        var moveWordPos = Fire.Camera.main.screenToWorld(movePos);

        var offsetWordPos = Fire.Vec2.zero;
        offsetWordPos.x = this._mouseDownPos.x - moveWordPos.x;
        offsetWordPos.y = this._mouseDownPos.y - moveWordPos.y;

        this._selectTarget.transform.x = this._selectTargetInitPos.x - offsetWordPos.x;
        this._selectTarget.transform.y = this._selectTargetInitPos.y - offsetWordPos.y;

        this.sdataBase.options.setPos(this._selectTarget.transform.worldPosition);
    },
    // �����ͷ��¼�
    _onMouseUpEvent: function () {
        this._hasMoveTarget = false;
    },
    // ���ؿ���ѡ��
    _onHideEvent: function () {
        this._selectTarget = null;
        this._backupSelectTarget = null;
        this._lastSelectTarget = null;
    },
    // ��ת����
    _onMirrorFlipEvent: function () {
        if (this._selectTarget) {
            var scaleX = this._selectTarget.transform.scaleX;
            this._selectTarget.transform.scaleX = scaleX > 1 ? -scaleX : Math.abs(scaleX);
        }
    },
    // ɾ��ѡ������
    _onDeleteTargetEvent: function () {
        this._selectTarget.destroy();
        this._selectTarget = null;
        this._backupSelectTarget = null;
        this._lastSelectTarget = null;
        this.sdataBase.options.hide();
    },
    // ����
    reset: function () {
        this.sdataBase.options.hide();
        this._selectTarget = null;
        this._backupSelectTarget = null;
        this._lastSelectTarget = null;
    },
    // �����¼�
    start: function () {
        // ���õı���/����
        var ent = Fire.Entity.find('/SDataBase');
        this.sdataBase = ent.getComponent('SDataBase');

        Fire.Input.on('mousedown', this.bindedMouseDownEvent);
        Fire.Input.on('mousemove', this.bindedMouseMoveEvent);
        Fire.Input.on('mouseup', this.bindedMouseUpEvent);
        //
        this.sdataBase.options.onHideEvent = this._onHideEvent.bind(this);
        this.sdataBase.options.btn_del.onMousedown = this._onDeleteTargetEvent.bind(this);
        this.sdataBase.options.btn_MirrorFlip.onMousedown = this._onMirrorFlipEvent.bind(this);
    },
    // ����
    onDestroy: function() {
        Fire.Input.off('mousedown', this.bindedMouseDownEvent);
        Fire.Input.off('mousemove', this.bindedMouseMoveEvent);
        Fire.Input.off('mouseup', this.bindedMouseUpEvent);
    }
});

Fire._RFpop();
},{}],"SDataBase":[function(require,module,exports){
Fire._RFpush(module, '594d6CeCE1AV6pDspRupq2o', 'SDataBase');
// script\single\SDataBase.js

// 数据库
var SDataBase = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        // 初始化场景数据
        this.initScreenData = [];
        // 二级菜单数据
        this.secondaryMenuDataSheets = [];
        // 三级菜单总数
        this.threeMenuDataTotalSheets = {};
        // 三级菜单数据
        this.threeMenuDataSheets = {};
        // 三级菜单大图列表
        this.threeMenuBigImageSheets = [];
        // 我的装扮数据总数
        this.myDressUpTotal = 0;
        // 我的装扮数据列表
        this.myDressUpDataSheets = [];
        // 保存所有图片
        this.loadImageList = {};
    },
    // 加载预制
    _loadObject: function () {
        // 房间头节点
        this.room = Fire.Entity.find('/Room');
        // 控制管理类
        this.scontrolMgr = this.room.getComponent('SControlMgr');
        // 控制选项
        var ent = this.entity.find('Options');
        this.options = ent.getComponent('Options');
        // 背景
        ent = Fire.Entity.find('/Room/background');
        this.bgRender = ent.getComponent(Fire.SpriteRenderer);
        // 地板
        ent = Fire.Entity.find('/Room/ground');
        this.groundRender = ent.getComponent(Fire.SpriteRenderer);
        // 人物形象
        ent = Fire.Entity.find('/Characters');
        this.characters = ent.getComponent(Fire.SpriteRenderer);
        ent = Fire.Entity.find('/Characters/CharactersName');
        this.charactersName = ent.getComponent(Fire.BitmapText);
        // 二级子菜单模板
        this.tempSecondaryMenu = this.entity.find('SecondaryMenu');
        // 三级子菜单模板
        this.tempThreeMenu = this.entity.find('ThreeMenu');
        // 家具模板
        this.tempFurniture = this.entity.find('Furniture');
        // 房间类型模板
        this.tempRoomType = this.entity.find('RoomType');
        // 装扮数据模板
        this.tempMyDressUpData = this.entity.find('MyDressUpData');
        // 一级菜单
        ent = Fire.Entity.find('/Menu_MainMgr');
        this.smainMenuMgr = ent.getComponent('SMainMenuMgr');
        // 二级菜单
        ent = Fire.Entity.find('/Menu_SecondaryMgr');
        this.ssecondaryMenuMgr = ent.getComponent('SSecondaryMenuMgr');
        // 三级级菜单
        ent = Fire.Entity.find('/Menu_ThreeMgr');
        this.sthreeMenuMgr = ent.getComponent('SThreeMenuMgr');
        // 网络连接
        this.snetWorkMgr = this.entity.getComponent('SNetworkMgr');
        // 拍照创建缩略图
        ent = Fire.Entity.find('/Screenshot');
        this.screenshot = ent.getComponent('Screenshot');
        // 保持房间错误提示窗口
        this.ssaveErrorTips = Fire.Entity.find('/Tips_SaveError');
        // 保持房间数据窗口
        ent = Fire.Entity.find('/Win_SaveRoom');
        this.ssaveRoomWindow = ent.getComponent('SSaveRoomWindow');
        // 提示窗口
        ent = Fire.Entity.find('/Win_Tips');
        this.stipsWindow = ent.getComponent('STipsWindow');
        // 装扮窗口
        ent = Fire.Entity.find('/Win_MyDressUp');
        this.smyDressUpWindow = ent.getComponent('SMyDressUpWindow');
        // 加载提示窗口
        ent = Fire.Entity.find('/Tips_Loading');
        this.sloadingTips = ent.getComponent('SLoadingTips');
        // 提示没有用户信息
        this.stoKenTips = Fire.Entity.find('/Tips_ToKen');

        ent = Fire.Entity.find('/GlobalData');
        if (ent) {
            this.globalData = ent.getComponent("GlobalData");
        }
    },
    // 载入时
    onLoad: function () {
        // 加载预制
        this._loadObject();
        // 判断是否有ToKen
        if (!this.snetWorkMgr.getToKenValue()){
            this.stoKenTips.active = true;
        }
    },

    // 下载图片
    loadImage: function (url, callback) {
        var self = this;
        if (self.loadImageList[url]) {
            var image = self.loadImageList[url];
            if (callback) {
                callback(null, image);
            }
            return;
        }
        Fire.ImageLoader(url, function (error, image) {
            if (callback) {
                callback(error, image);
            }
            if (image) {
                self.loadImageList[url] = image;
            }
        });
    },

    // 刷新场景数据
    refreshScreen: function (data) {
        if (!this.bgRender && !this.groundRender) {
            return;
        }
        var comp = null;
        if (data.propType === 1) {
            // 背景
            comp = this.bgRender.entity.getComponent('SFurniture');
        }
        else {
            // 地面
            comp = this.groundRender.entity.getComponent('SFurniture');
        }
        comp.tName = data.tName;
        comp.suit_id = data.suit_id;
        comp.propType = data.propType;
        comp.imageUrl = data.imageUrl;
        comp.setSprite(data.sprite);
        comp.defaultSprite = data.sprite;
    },
    // 预加载初始化场景
    preloadInitScreenData: function () {

        this.characters.entity.active = false;
        if (this.globalData) {
            if (this.globalData.gotoType === 2) {
                this.characters.sprite = this.globalData.hostSprite;
                this.charactersName.text = this.globalData.hostName;
                this.characters.entity.active = true;
            }
            else {
                this.ssecondaryMenuMgr.openSecondaryMenu();
            }
        }

        // 如何有缓存用缓存的没有再去下载
        if (this.initScreenData.length > 0) {
            for (var i = 0; i < this.initScreenData.length; ++i){
                var data = this.initScreenData[i];
                this.refreshScreen(data);
            }
            return;
        }
        var self = this;
        self.sloadingTips.openTips("初始化场景中..");
        var index = 0, maxIndex = 0;
        self.snetWorkMgr.RequestInitHome(function (serverData) {
            maxIndex = serverData.list.length;
            serverData.list.forEach(function (data) {
                //
                var newData = {
                    pos: data.pos,
                    scale: data.scale,
                    tName: data.propsName,
                    suit_id: data.id,
                    rotation: data.rotation,
                    propType: data.propsType,
                    imageUrl: data.imgUrl,
                    sprite: null
                };

                //
                var loadImageCallBack = function (newData, error, image) {
                    index++;
                    if(index === maxIndex){
                        self.sloadingTips.closeTips();
                    }
                    if (!Fire.Engine.isPlaying) {
                        return;
                    }
                    if (error) {
                        console.log(error);
                        return;
                    }
                    newData.sprite = new Fire.Sprite(image);
                    self.refreshScreen(newData);
                }.bind(this, newData);
                //
                self.loadImage(newData.imageUrl, loadImageCallBack);
                //
                if (self.initScreenData) {
                    self.initScreenData.push(newData);
                }
            });
        });
    },
    // 加载删除单个装扮后刷新的数据
    loadRefreshMyDressUpData: function (curID, callback) {
        var sendData = {
            id: curID
        };
        var self = this;
        self.myDressUpTotal = 0;
        self.myDressUpDataSheets = [];
        var index = 0;
        this.snetWorkMgr.RequestDelHome(sendData, function (allData) {
            if (! Fire.Engine.isPlaying) {
                return;
            }
            self.myDressUpTotal = parseInt(allData.total);
            if (self.myDressUpTotal === 0) {
                if (callback) {
                    callback();
                }
                return;
            }
            allData.list.forEach(function (data) {
                var myDressUpData = {
                    id: data.suit_id,
                    name: data.suit_name,
                    type: data.room_type,
                    typeName: data.room_name,
                    isDress: data.isdress > 0
                };
                //
                self.myDressUpDataSheets.push(myDressUpData);
                if (index === allData.list.length - 1) {
                    if (callback) {
                        callback();
                    }
                }
                index++;
            });
        }.bind(this));
    },
    // 检查服务器上的数据是否与本地相同
    checkingMyDressUpData: function (callback) {
        var self = this;
        var sendData = {
            page: 1,
            eachnum: 6,
            room_type: -1
        };
        self.snetWorkMgr.RequestHomeList(sendData, function (allData) {
            if (! Fire.Engine.isPlaying) {
                return;
            }
            self.myDressUpDataSheets = [];
            self.myDressUpTotal = parseInt(allData.total);
            var index = 0;
            allData.list.forEach(function (data) {
                var myDressUpData = {
                    id: data.suit_id,
                    name: data.suit_name,
                    type: data.room_type,
                    typeName: data.room_name,
                    isDress: data.isdress > 0
                };
                if (callback) {
                    callback(index);
                }
                index++;
                //
                self.myDressUpDataSheets.push(myDressUpData);
            });
            if (callback ){
                callback();
            }
        });
    },
    // 预加载我的装扮数据
    preloadMyDressUpData: function (page, each, callback) {
        var self = this;
        var sendData = {
            page: page,
            eachnum: each,
            room_type: -1
        };
        self.snetWorkMgr.RequestHomeList(sendData, function (allData) {
            if (! Fire.Engine.isPlaying) {
                return;
            }
            self.myDressUpTotal = parseInt(allData.total);
            var index = 0;
            allData.list.forEach(function (data) {
                var myDressUpData = {
                    id: data.suit_id,
                    name: data.suit_name,
                    type: data.room_type,
                    typeName: data.room_name,
                    isDress: data.isdress > 0
                };
                if (callback) {
                    callback(index);
                }
                index++;
                //
                if (self.myDressUpDataSheets.indexOf(myDressUpData) < 0){
                    self.myDressUpDataSheets.push(myDressUpData);
                }
            });
        });
    },
    // 预加载二级菜单数据
    preloadSecondaryMenuData: function (callback) {
        var self = this;
        self.snetWorkMgr.RequestSecondaryMenuData(function (alldata) {
            if (! Fire.Engine.isPlaying) {
                return;
            }
            self.secondaryMenuDataSheets = [];
            var index = 0;
            alldata.list.forEach(function (serverData) {
                var data = {
                    tid: serverData.tid,
                    isdrag: serverData.isdrag,
                    tname: serverData.tname,
                    url: serverData.url,
                    smallSprite: null
                };
                var loadImageCallBack = function (data, index, error, image) {
                    if (! Fire.Engine.isPlaying) {
                        return;
                    }
                    if (error) {
                        console.log(error);
                        return;
                    }
                    data.smallSprite = new Fire.Sprite(image);
                    if (callback) {
                        callback(index, data, image);
                    }
                }.bind(this, data, index);
                // 下载图片
                self.loadImage(data.url, loadImageCallBack);
                index++;
                // 保存二级菜单数据
                self.secondaryMenuDataSheets.push(data);
            });
        });
    },
    // 预加载三级菜单 单品家具数据
    preloadThreeMenuData: function (id, page, each, callback) {
        var self = this;
        if (! self.threeMenuDataSheets[id]) {
            self.threeMenuDataSheets[id] = [];
        }
        if (! self.threeMenuDataTotalSheets[id]){
            self.threeMenuDataTotalSheets[id] = 0;
        }
        var sendData = {
            tid: id,
            page: page,
            each: each
        };
        self.snetWorkMgr.RequestSingleItems(sendData, function (allData) {
            if (! Fire.Engine.isPlaying) {
                return;
            }
            var total = parseInt(allData.total);
            self.threeMenuDataTotalSheets[id] = total;
            var dataSheets = self.threeMenuDataSheets[id];
            var index = 0, loadImageCount = 0;
            allData.list.forEach(function (dataSheets, data) {
                var menuData = {
                    name: data.prod_name,
                    suit_id: data.prod_id,
                    price: data.prod_price,
                    bigImageUrl: data.prod_souce_url,
                    samllImageUrl: data.prod_image_url,
                    smallSprite: null,
                    bigSprite: null,
                    event: null
                };
                //
                var loadImageCallBack = function (menuData, index, error, image) {
                    if (!Fire.Engine.isPlaying) {
                        return;
                    }
                    if (error) {
                        loadImageCount++;
                        if (loadImageCount < 2) {
                            self.loadImage(menuData.samllImageUrl, loadImageCallBack);
                        }
                        else {
                            console.log(error);
                        }
                        return;
                    }
                    //
                    menuData.smallSprite = new Fire.Sprite(image);
                    if (callback) {
                        callback(id, index, page, menuData);
                    }
                    loadImageCount = 0;
                }.bind(this, menuData, index);
                // 加载小图
                self.loadImage(data.prod_image_url, loadImageCallBack);
                //
                index++;
                //
                dataSheets.push(menuData);
            }.bind(this, dataSheets));
        });
    }
});

Fire._RFpop();
},{}],"SErrorPromptWindow":[function(require,module,exports){
Fire._RFpush(module, '81133b6PvNGVK6vSmpUXe7+', 'SErrorPromptWindow');
// script\single\SErrorPromptWindow.js

var Comp = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        this.onCallEvent = null;
    },
    // 属性
    properties: {
        content:{
            default: null,
            type: Fire.Text
        },
        btn_Confirm:{
            default: null,
            type: Fire.UIButton
        },
        // 如果Inputfield存在的话就需要把他先关闭
        // 因为无法控制它的层级
        input_Save: {
            default: null,
            type: Fire.Entity
        }
    },
    // 设置调用函数
    setCallEvent: function (event) {
        this.onCallEvent = event;
    },
    // 确定事件
    _onConfirmEvent: function () {
        this.entity.active = false;
        if (this.onCallEvent) {
            this.onCallEvent();
        }
    },
    // 关闭时触发的事件
    onDisable: function () {
        if (! this.input_Save.active) {
            this.input_Save.active = true;
        }
    },
    // 打开触发的事件
    onEnable: function () {
        if (this.input_Save.active) {
            this.input_Save.active = false;
        }
    },
    //
    onLoad: function () {
        this.btn_Confirm.onClick = this._onConfirmEvent.bind(this);
    }
});

Fire._RFpop();
},{}],"SFurniture":[function(require,module,exports){
Fire._RFpush(module, 'a1f8aVIhPhLf6S6Vhg0Pxgc', 'SFurniture');
// script\single\SFurniture.js

var SFurniture = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        this._renderer = null;
    },
    // 属性
    properties: {
        // 名称
        tName: '',
        // ID
        suit_id: 0,
        // 类型
        propType: 0,
        // 是否可以拖动
        hasDrag: false,
        // 图片的url
        imageUrl: '',
        // 载入时的图片
        defaultSprite: {
            default: null,
            type: Fire.Sprite
        }
    },
    // 设置图片
    setSprite: function (newSprite) {
        if (!this._renderer) {
            this._renderer = this.entity.getComponent(Fire.SpriteRenderer);
        }
        this._renderer.sprite = newSprite;
        this._renderer.sprite.pixelLevelHitTest = true;
    }
});

Fire._RFpop();
},{}],"SLoadingTips":[function(require,module,exports){
Fire._RFpush(module, '1c9b1eYJotO45XKuysbAfkq', 'SLoadingTips');
// script\single\SLoadingTips.js

var SLoadingTips = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {

    },
    // 属性
    properties: {
        content:{
            default: null,
            type: Fire.BitmapText
        },
        anim: {
            default: null,
            type: Fire.Animation
        }
    },
    // 打开窗口
    openTips: function (text) {
        var state = this.anim.play('loading');
        state.wrapMode = Fire.WrapMode.Loop;
        state.repeatCount = Infinity;
        this.entity.active = true;
        if (text) {
            this.content.text = text;
        }
        else {
            this.content.text = '加载中请稍后...';
        }
        var size = this.content.getWorldSize();
        this.anim.entity.transform.worldPosition = new Fire.Vec2(size.x / 2 + 50, 0);
    },
    // 关闭窗口
    closeTips: function () {
        this.anim.stop('loading');
        this.entity.active = false;
    }
});

Fire._RFpop();
},{}],"SMainMenuMgr":[function(require,module,exports){
Fire._RFpush(module, 'd8445EyENlD4qUuQc3fUTo2', 'SMainMenuMgr');
// script\single\SMainMenuMgr.js

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

        //
        var camera = Fire.Camera.main;
        var bgWorldBounds = this.sdataBase.bgRender.getWorldBounds();
        var bgLeftTopWorldPos = new Fire.Vec2(bgWorldBounds.xMin + this.imageMargin.x, bgWorldBounds.yMin + this.imageMargin.y);
        var bgleftTop = camera.worldToScreen(bgLeftTopWorldPos);
        var screenPos = new Fire.Vec2(bgleftTop.x, bgleftTop.y);
        var worldPos = camera.screenToWorld(screenPos);
        this.sdataBase.characters.entity.transform.worldPosition = worldPos;

    }
});

Fire._RFpop();
},{}],"SMyDressUpData":[function(require,module,exports){
Fire._RFpush(module, '9c8c2dJhLpCWbUP3Hw0kCzn', 'SMyDressUpData');
// script\single\SMyDressUpData.js

var SMyDressUpData = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    contructor: function () {
        // ID
        this.suit_id = -1;
        // 名称
        this.myDressUpName = '';
    },
    // 属性
    properties: {
        // 编号
        serialNumber: {
            default: null,
            type: Fire.Text
        },
        // 名称
        roomName: {
            default: null,
            type: Fire.Text
        },
        // 类型
        roomType: 0,
        // 类型文字
        roomTypeText: {
            default: null,
            type: Fire.Text
        },
        // 打开装扮
        btn_openRoom: {
            default: null,
            type: Fire.UIButton
        },
        // 删除装扮
        btn_deleteRoom: {
            default: null,
            type: Fire.UIButton
        }
    },
    // 重置家具
    resetMenu: function () {
        this.serialNumber.text = '';
        this.roomName.text = '';
        this.roomType = 0;
        this.roomTypeText.text = '';
        this.btn_openRoom.onClick = null;
        this.btn_deleteRoom.onClick = null;
        this.entity.active = false;
    },
    // 初始化
    refresh: function (data, openRoomEvent, deleteRoomEvent) {
        this.suit_id = data.id;
        this.myDressUpName = data.name;
        this.entity.name = this.suit_id;
        this.serialNumber.text = this.suit_id;
        this.roomName.text = this.myDressUpName;
        this.roomType = data.type;
        this.roomTypeText.text = data.typeName;
        if (openRoomEvent) {
            this.btn_openRoom.onClick = openRoomEvent;
        }
        if (deleteRoomEvent) {
            this.btn_deleteRoom.onClick = deleteRoomEvent;
        }
    }
});

Fire._RFpop();
},{}],"SMyDressUpWindow":[function(require,module,exports){
Fire._RFpush(module, '75c18sLiTtLJZLo5yY3i5br', 'SMyDressUpWindow');
// script\single\SMyDressUpWindow.js

// 装扮列表窗口
var MyDressUpWindow = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        this._showNum = 6;
        this._curPage = 1;
        this._maxPage = 0;
        this._myDressUpTotal = 0;
        // 装扮容器列表
        this.dressUpEntitySheets = [];
        // 进入装扮
        this.bindReadDataEvent = this._onReadDataEvent.bind(this);
        // 删除装扮
        this.bindDelDataEvent = this._onDelHomeDataEvent.bind(this);
    },
    // 属性
    properties: {
        // 根节点
        rootNode: {
            default: null,
            type: Fire.Entity
        },
        // 关闭窗口
        btn_Close: {
            default: null,
            type: Fire.UIButton
        },
        // 下一页
        btn_Next: {
            default: null,
            type: Fire.UIButton
        },
        // 上一页
        btn_Previous: {
            default: null,
            type: Fire.UIButton
        },
        // 删除所有房间数据
        btn_removeAll: {
            default: null,
            type: Fire.UIButton
        },
        // 当前装扮的房间
        curSelectRoom: {
            default: null,
            type: Fire.Text
        }
    },
    // 关闭窗口
    _onCloseWindowEvent: function (event) {
        this.closeWindow();
    },
    // 更新按钮状态
    _updateButtonState: function () {
        this.btn_Previous.entity.active = this._curPage > 1;
        this.btn_Next.entity.active = this._curPage < this._maxPage;
    },
    // 上一页
    _onPreviousPage: function () {
        this._curPage -= 1;
        if (this._curPage < 1){
            this._curPage = 1;
        }
        this._refreshMyDressList();
    },
    // 下一页
    _onNextPage: function () {
        this._curPage += 1;
        if (this._curPage > this._maxPage){
            this._curPage = this._maxPage;
        }
        this._refreshMyDressList();
    },
    // 载入单个房间数据
    _onReadDataEvent: function (event) {
        var comp = event.target.parent.getComponent('SMyDressUpData');
        this.loadHomeData(comp.suit_id);
        this.curSelectRoom.text = '当前装扮: ' + comp.myDressUpName;
    },
    // 删除所有房间数据
    _onRemoveAllRoomDataEvent: function () {
        this.sdataBase.loadRefreshMyDressUpData(-1, function () {
            this._curPage = 1;
            this._refreshMyDressList();
        }.bind(this));
    },
    // 删除房间数据
    _onDelHomeDataEvent: function (event) {
        var id = parseInt(event.target.parent.name);
        this.sdataBase.loadRefreshMyDressUpData(id, function () {
            this._refreshMyDressList();
        }.bind(this));
    },
    // 载入房间数据
    loadHomeData: function (id) {
        this.sdataBase.smainMenuMgr.resetScreen();
        this.sdataBase.snetWorkMgr.RequestHomeData({suit_id: id}, function (homeData) {
            homeData.list.forEach(function (data) {
                var entity = null, furniture = null;
                var propsType = parseInt(data.propsType);
                if (propsType === 1) {
                    entity = this.sdataBase.room.find('background');
                }
                else if (propsType === 2) {
                    entity = this.sdataBase.room.find('ground');
                }
                else {
                    entity = Fire.instantiate(this.sdataBase.tempFurniture);
                    entity.parent = this.sdataBase.room;
                    entity.name = data.propsName;
                    // 设置坐标
                    var newVec2 = new Fire.Vec2();
                    var str = data.pos.split(":");
                    newVec2.x = parseFloat(str[0]);
                    newVec2.y = parseFloat(str[1]);
                    entity.transform.position = newVec2;
                    // 设置角度
                    entity.transform.rotation = data.rotation;
                    // 设置大小
                    str = data.scale.split(":");
                    newVec2.x = parseFloat(str[0]);
                    newVec2.y = parseFloat(str[1]);
                    entity.transform.scale = newVec2;
                    furniture = entity.getComponent('SFurniture');
                }
                furniture = entity.getComponent('SFurniture');
                furniture.propsType = propsType;
                furniture.hasDrag = propsType > 2;
                furniture.suit_id = data.id;
                furniture.bigImageUrl = data.imgUrl;
                if (data.imgUrl) {
                    Fire._ImageLoader(data.imgUrl, function (furniture, error, image) {
                        if (error){
                            return;
                        }
                        var newSprite = new Fire.Sprite(image);
                        furniture.setSprite(newSprite);
                    }.bind(this, furniture));
                }
            }.bind(this));
            this.closeWindow();
        }.bind(this));
    },
    // 重置装扮容器列表
    _resetMyDressEntitySheets: function() {
        for (var i = 0; i < this.dressUpEntitySheets.length; ++i) {
            var comp = this.dressUpEntitySheets[i];
            comp.resetMenu();
        }
    },
    // 刷新装扮数据列表
    _refreshMyDressList: function () {
        var self = this;
        // 重置装扮容器列表
        self._resetMyDressEntitySheets();
        // 获取总数并且计算最大页数
        if (self._myDressUpTotal !== self.sdataBase.myDressUpTotal) {
            self._myDressUpTotal = self.sdataBase.myDressUpTotal;
            self._maxPage = Math.round(self._myDressUpTotal / self._showNum);
        }
        // 更新按钮状态
        self._updateButtonState();
        // 如果总数等于0的话就不需要显示了
        if (self._myDressUpTotal === 0) {
            return;
        }
        var startNum = (self._curPage - 1) * self._showNum;
        var endNum = startNum + self._showNum;
        if (endNum > self._myDressUpTotal) {
            endNum = self._myDressUpTotal;
        }
        var dataSheets = self.sdataBase.myDressUpDataSheets;
        var index = 0;
        for (var i = startNum; i < endNum; ++i) {
            var menu = self.dressUpEntitySheets[index];
            menu.entity.active = true;
            index++;
            var myDressUpData = dataSheets[i];
            if (!myDressUpData) {
                continue;
            }
            menu.refresh(myDressUpData, self.bindReadDataEvent, self.bindDelDataEvent);
        }
        // 判断是否需要预加载下一页
        var len = dataSheets.length;
        if (len === self._myDressUpTotal) {
            return;
        }
        // 预加载下一页
        var nextPage = self._curPage + 1;
        self.sdataBase.preloadMyDressUpData(nextPage, self._showNum);
    },
    // 创建装扮列表容器
    _createMyDressUpEntitySheets: function () {
        for (var i = 0; i < this._showNum; ++i) {
            var ent = Fire.instantiate(this.sdataBase.tempMyDressUpData);
            ent.parent = this.rootNode;
            ent.transform.position = new Fire.Vec2(0, -i * 80);
            var menu = ent.getComponent('SMyDressUpData');
            var myDressUpData = {
                id: -1,
                name: '载入中.',
                type: -1,
                typeName: '载入中.',
                isDress: -1
            };
            menu.refresh(myDressUpData, this.bindReadDataEvent, this.bindDelDataEvent);
            this.dressUpEntitySheets.push(menu);
        }
    },
    // 打开窗口
    openWindow: function () {
        this.entity.active = true;
        this.sdataBase.checkingMyDressUpData(function () {
            this._refreshMyDressList();
        }.bind(this));
    },
    // 关闭窗口
    closeWindow: function () {
        this._curPage = 1;
        this._maxPage = 0;
        this._myDressUpTotal = 0;
        this.entity.active = false;
    },
    //
    start: function () {
        var ent = Fire.Entity.find('/SDataBase');
        this.sdataBase = ent.getComponent('SDataBase');
        //
        this.curSelectRoom.text = '当前装扮: 无';
        // 绑定事件
        this.btn_Previous.entity.active = false;
        this.btn_Next.entity.active = false;
        this.btn_Previous.onClick = this._onPreviousPage.bind(this);
        this.btn_Next.onClick = this._onNextPage.bind(this);
        this.btn_Close.onClick = this._onCloseWindowEvent.bind(this);
        this.btn_removeAll.onClick = this._onRemoveAllRoomDataEvent.bind(this);
        // 预加载我的装扮数据
        this.sdataBase.preloadMyDressUpData(this._curPage, this._showNum);
        // 创建装扮列表容器
        this._createMyDressUpEntitySheets();
    }
});

Fire._RFpop();
},{}],"SNetworkMgr":[function(require,module,exports){
Fire._RFpush(module, 'f3a8dE0eUBPAq/gGttl1ttB', 'SNetworkMgr');
// script\single\SNetworkMgr.js

// 负责与服务器通信
var SNetworkMgr = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        // 当前请求数据
        this._postData = {};
        this.win_ErrorPromptComp = null;
        // 用于测试的token数据
        this.token = null;
    },
    // 属性
    properties: {
        // 本地测试
        localTest: false,
        // 连接失败提示窗口
        win_ErrorPrompt: {
            default: null,
            type: Fire.Entity
        }
    },
    // 开始时
    onLoad: function () {
        var ent = Fire.Entity.find('/SDataBase');
        this.sdataBase = ent.getComponent('SDataBase');
        // 获取用户信息
        this.getToKenValue();
    },
    // 获取用户信息
    getToKenValue: function () {
        if (this.localTest) {
            this.token = 'MTAwMTQ5MjY4NV8xYWEzYzFkNmE0ZWI3YzlkNmQxYmJmNDc4NTNmZjhkM18xNDM2MzI2Mzc2X3dhcA';
        }
        else{
            this.token = this.getQueryString('token');
            if (!this.token){
                console.log("ToKen is null");
                return false;
            }
        }
        return true;
    },
    // 请求失败回调
    errorCallBack: function () {
        if (! this.win_ErrorPromptComp) {
            var comp = this.win_ErrorPrompt.getComponent('ErrorPromptWindow');
            this.win_ErrorPromptComp = comp;
        }
        var self = this;
        this.win_ErrorPromptComp.setCallEvent(function () {
            self.sendDataToServer(self._postData);
        });
        this.win_ErrorPrompt.active = true;
    },
    // 用JS获取地址栏参数的方法
    getQueryString: function(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r !== null){
            return unescape(r[2]);
        }
        return null;
    },
    // 获取数据
    sendDataToServer: function (data) {
        if (! this.getToKenValue()) {
            return;
        }
        //this.sdataBase.sloadingTips.openTips();
        this._postData = data;
        this.jQueryAjax(data.url, data.sendData, data.cb, data.errCb);
    },
    // 与服务器通信
    jQueryAjax: function (strUrl, data, callBack, errorCallBack) {
        var params = "";
        if (typeof(data) === "object") {
            for (var key in data) {
                params += (key + "=" + data[key] + "&"  );
            }
            params += "&token=" + this.token;
        }
        else {
            params = data + "&token=" + this.token;
        }
        var self = this;
        var send = {
            type: "POST",
            url: strUrl + "?&jsoncallPP=?",
            data: params,
            dataType: 'jsonp',
            success: function (data) {
                //if (self.sdataBase) {
                //    self.sdataBase.sloadingTips.closeTips();
                //}
                if (callBack) {
                    callBack(data);
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                self.sdataBase.sloadingTips.closeTips();
                if (errorCallBack) {
                    errorCallBack();
                }
                console.log(errorThrown);
                console.log(XMLHttpRequest);
                console.log(textStatus);
            }
        };
        jQuery.ajax(send);
    },
    // 请求初始化房间数据
    RequestInitHome: function (callback) {
        var postData = {
            url: 'http://m.saike.com/housedress/defaultSingle.html',
            sendData: {},
            cb: callback,
            errCb: this.errorCallBack.bind(this)
        };
        this.sendDataToServer(postData);
    },
    // 请求二级菜单列表
    RequestSecondaryMenuData: function (callback) {
        var postData = {
            url: 'http://m.saike.com/housedress/getShopType.html',
            sendData: {},
            cb: callback,
            errCb: this.errorCallBack.bind(this)
        };
        this.sendDataToServer(postData);
    },
    // 请求三级菜单数据
    RequestSingleItems: function (data, callback) {
        var postData = {
            url: "http://m.saike.com/housedress/getShopList.html",
            sendData: {
                tid: data.tid,
                page: data.page,
                each: data.each
            },
            cb: callback,
            errCb: this.errorCallBack.bind(this)
        };
        this.sendDataToServer(postData);
    },
    // 删除单个房间数据
    RequestDelHome: function (sendData, callback) {
        var postData = {
            url: "http://m.saike.com/housedress/delSuit.html",
            sendData: {
                id: sendData.id
            },
            cb: callback,
            errCb: this.errorCallBack.bind(this)
        };
        this.sendDataToServer(postData);
    },
    // 请求房间列表
    RequestHomeList: function (sendData, callback) {
        var postData = {
            url: "http://m.saike.com/housedress/mySuitList.html",
            sendData: {
                page: sendData.page,
                eachnum: sendData.eachnum,
                room_type: sendData.room_type
            },
            cb: callback,
            errCb: this.errorCallBack.bind(this)
        };
        this.sendDataToServer(postData);
    },
    // 请求单个房间数据
    RequestHomeData: function (sendData, callback) {
        var postData = {
            url: "http://m.saike.com/housedress/getSuitDetails.html",
            sendData: {
                suit_id: sendData.suit_id
            },
            cb: callback,
            errCb: this.errorCallBack.bind(this)
        };
        this.sendDataToServer(postData);
    },
    // 存储房间数据
    SendHomeData: function (sendData, callback) {
        var postData = {
            url: "http://m.saike.com/housedress/saveSingleDress.html",
            sendData: {
                suit_id: 0,
                thumbnails: sendData.thumbnails,
                suit_name: encodeURIComponent(sendData.name),
                suit_type: sendData.type,
                dataList: JSON.stringify(sendData.dataList)
            },
            cb: callback,
            errCb: this.errorCallBack.bind(this)
        };
        this.sendDataToServer(postData);
    },
    // 存储房间缩略图
    SendImageToServer: function (sendData, callback) {
        var postData = {
            url: "spupload.php",
            sendData: {
                house_uid: sendData.house_uid,
                suit_id: sendData.suit_id,
                img: sendData.image.src,
                toKen: this.toKen
            }
        };
        this.sdataBase.sloadingTips.openTips('存储缩略图');
        jQuery.post(postData.url, postData, function(data) {
            this.sdataBase.sloadingTips.closeTips();
            if (callback) {
                callback(data);
            }
        },'jsonp');
    }
});

Fire._RFpop();
},{}],"SSaveRoomWindow":[function(require,module,exports){
Fire._RFpush(module, 'b823bbCB3lJqYWoD4JS/gAr', 'SSaveRoomWindow');
// script\single\SSaveRoomWindow.js

// 保存房间数据窗口
var SaveRoomWindow = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        this.lastAnim = null;
        this.stroageDressEvent = this._onStroageDressEvent.bind(this);
        this.closeWindowEvent = this._onCloseWindowEvent.bind(this);
        this.bindCreateThumbnailsEvent = this._onCreateThumbnailsEvent.bind(this);
        this.defaultThumbnails = null;
        this.hasDownThumbnails = false;
    },
    // 属性
    properties: {
        // 缩略图
        btn_thumbnails: {
            default: null,
            type: Fire.UIButton
        },
        // 房间名称
        roomName: {
            default: null,
            type: Fire.InputField
        },
        // 房间类型
        roomTypeList: {
            default: null,
            type: Fire.UIPopupList
        },
        btn_colse: {
            default: null,
            type: Fire.UIButton
        },
        // 确认保存
        btn_confirmSave: {
            default: null,
            type: Fire.UIButton
        }
    },
    // 创建缩略图
    _onCreateThumbnailsEvent: function () {
        var self = this;
        if (self.hasDownThumbnails) {
            return;
        }
        self.hasDownThumbnails = true;
        self.btn_thumbnails.textContent.text = '保持中请稍等..';
        self.sdataBase.screenshot.createThumbnails(function (image) {
            self.hasDownThumbnails = false;
            self.btn_thumbnails.setImage(image);
            self.btn_thumbnails.textContent.entity.active = false;
            self.btn_thumbnails.textContent.text = '点击此处\n创建缩略图';
        });
    },
    // 关闭保存窗口
    _onCloseWindowEvent: function () {
        this.closeWindow();
    },
    // 添加房间数据
    _addHomeData: function (props, entity, homeData) {
        var data = {
            id: props.suit_id,
            propsName: entity.name,
            propsType: props.propType,
            pos: entity.transform.x + ":" + entity.transform.y,
            rotation: entity.transform.rotation,
            scale: entity.transform.scaleX + ":" + entity.transform.scaleY,
            imgUrl: props.bigImageUrl
        };
        homeData.dataList.push(data);
    },
    // 保存房间数据
    _savehomeData: function (name, type) {
        var homeData = {
            key: 0,
            name: name,
            type: type,
            dataList: []
        };
        var props = null;
        var childrens = this.sdataBase.room.getChildren();
        for(var i = 0, len = childrens.length; i < len; ++i) {
            var entity = childrens[i];
            props = entity.getComponent('SFurniture');
            if (!props) {
                continue;
            }
            this._addHomeData(props, entity, homeData);
        }
        return homeData;
    },
    //
    _onStroageDressEvent: function () {
        //
        if (this.roomName.text === "" || this.roomTypeList.roomType === -1 ||
            this.btn_thumbnails.btnRender.sprite === this.defaultThumbnails)  {
            //
            this.sdataBase.ssaveErrorTips.active = true;
            // tips动画
            if (this.lastAnim){
                this.lastAnim.stop();
            }
            var anim = this.sdataBase.ssaveErrorTips.animate([
                {
                    'Fire.Transform': { scale: new Fire.Vec2(0, 0) }
                },
                {
                    'Fire.Transform': { scale: new Fire.Vec2(1, 1) },
                    ratio: 0.2
                },
                {
                    'Fire.Transform': { scale: new Fire.Vec2(1, 1) }
                },
            ], {duration: 1});

            this.lastAnim = anim;
            anim.onStop = function () {
                this.sdataBase.ssaveErrorTips.active = false;
                this.sdataBase.ssaveErrorTips.transform.scale = new Fire.Vec2(0, 0);
            }.bind(this);

            return;
        }
        this.sdataBase.ssaveErrorTips.active = false;
        var name = this.roomName.text;
        var type = this.roomTypeList.roomType;
        var homeData = this._savehomeData(name, type);

        // 保存缩略图
        var self = this;
        this.sdataBase.snetWorkMgr.SendHomeData(homeData, function (data) {
            if (data.status > 10000) {
                return;
            }
            var sendData = {
                house_uid: data.house_uid,
                suit_id: data.suit_id,
                image: self.btn_thumbnails.image
            };
            self.sdataBase.snetWorkMgr.SendImageToServer(sendData, function (data) {
                self.closeWindow();
                self.sdataBase.stipsWindow.openWindow('保存成功..');
            });
        });
    },
    // 打开窗口
    openWindow: function () {
        this.entity.active = true;
    },
    // 关闭
    closeWindow: function () {
        this.sdataBase.ssaveErrorTips.active = false;
        this.entity.active = false;
        this.roomTypeList.roomType = -1;
        this.roomName.text = '';
        this.roomTypeList.btn_roomType.setText('类型名称');
        if (this.defaultThumbnails) {
            this.btn_thumbnails.setSprite(this.defaultThumbnails);
        }
        this.btn_thumbnails.textContent.entity.active = true;
    },
    // 开始时
    start: function () {
        var ent = Fire.Entity.find('/SDataBase');
        this.sdataBase = ent.getComponent('SDataBase');
        //
        this.btn_colse.onClick = this.closeWindowEvent;
        this.btn_confirmSave.onClick = this.stroageDressEvent;
        this.btn_thumbnails.onClick = this.bindCreateThumbnailsEvent;
        this.defaultThumbnails = this.btn_thumbnails.btnRender.sprite;
    }
});

Fire._RFpop();
},{}],"SSecondaryMenuMgr":[function(require,module,exports){
Fire._RFpush(module, '88cc68ymJJEKLgTWCUq6dsm', 'SSecondaryMenuMgr');
// script\single\SSecondaryMenuMgr.js

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
        if (!this._menuSheets || this._menuSheets.length === 0) {
            return;
        }
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
    // 打开二级菜单
    openSecondaryMenu: function () {
        this.entity.active = true;
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

Fire._RFpop();
},{}],"SSecondaryMenu":[function(require,module,exports){
Fire._RFpush(module, 'e9265DpSJJCWLuVjG/30ZNO', 'SSecondaryMenu');
// script\single\SSecondaryMenu.js

// 保存二级菜单数据
var SSecondaryMenu = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        this.btn_menu = null;
        this.textContent = null;
    },
    // 属性
    properties: {
        // 默认图片
        defaultSprite: {
            default: null,
            type: Fire.Sprite
        },
        tid: 0,
        tname: '载入中..',
        isdrag: false,
        url: ''
    },
    // 设置图片
    setSprite: function (value) {
        this.btn_menu.setSprite(value);
    },
    // 设置文字
    setText: function (value) {
        this.btn_menu.setText(value);
    },
    // 重置菜单
    resetMenu: function () {
        this.tid = 0;
        this.isdrag = false;
        this.tname = '载入中..';
        this.url = '';
        this.setSprite(this.defaultSprite);
        this.setText(this.tname);
    },
    // 初始化
    init: function () {
        if (! this.btn_menu) {
            var ent = this.entity.find('btn_menu');
            this.btn_menu = ent.getComponent(Fire.UIButton);
        }
        this.resetMenu();
    },
    // 刷新
    refresh: function (data, event) {
        this.tid = data.tid;
        this.hasDrag = data.isdrag < 2;
        this.tname = data.tname;
        this.url = data.url;
        this.setText(data.tname);
        if (data.smallSprite) {
            this.setSprite(data.smallSprite);
        }
        this.btn_menu.onClick = event;
    }
});

Fire._RFpop();
},{}],"SThreeMenuMgr":[function(require,module,exports){
Fire._RFpush(module, 'e7d87ZP5O9Fmp4e4ghhEIDH', 'SThreeMenuMgr');
// script\single\SThreeMenuMgr.js

// 三级菜单管理类
var SThreeMenuMgr = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        // 家具一次显示多少数量
        this._menuTotal = 6;
        // 游戏数据
        this.sdataBase = null;
        // 菜单列表
        this._menuList = [];
        // 是否可以拖动（例如壁纸与地面无法拖动）
        this._hasDrag = false;
        // 当前选择物品ID
        this._curId = 0;
        // 当前最大数量
        this._curTotal = 0;
        // 当前页签
        this._curPage = 1;
        // 最大页签
        this._maxPage = 1;
        // 图片载入回调
        this.bindAfterLoadImageCB = null;
        // 大图载入中
        this._hasLoadBigImageing = false;
        this._lastCreateTarget = null;
    },
    // 属性
    properties: {
        margin: new Fire.Vec2(0, 240),
        // 三级菜单的根节点
        rootNode: {
            default: null,
            type: Fire.Entity
        }
    },
    // 创建或者是切换材质
    createOrChangeFurniture: function (target) {
        // 一开始大图未加载的时候，禁止用户多次点击相同家具
        if (this._hasLoadBigImageing && this._lastCreateTarget === target) {
            return;
        }
        var self = this;
        var menu = target.getComponent('SThreeMenu');
        var ent, entComp, bigSprite;
        // 墙壁与地板
        if (! self._hasDrag) {
            if (self._curId === 1) {
                ent = self.sdataBase.bgRender.entity;
                entComp = ent.getComponent('SFurniture');
            }
            else if (self._curId === 2) {
                ent = self.sdataBase.groundRender.entity;
                entComp = ent.getComponent('SFurniture');
            }
            entComp.tName = menu.tName;
            entComp.suit_id = menu.suit_id;
            entComp.hasDrag = self._hasDrag;
            entComp.imageUrl = menu.bigImageUrl;
            bigSprite = self.sdataBase.threeMenuBigImageSheets[entComp.suit_id];
            if (bigSprite) {
                entComp.setSprite(bigSprite);
            }
            else {
                self._hasLoadBigImageing = true;
                Fire.ImageLoader(entComp.imageUrl, function (error, image) {
                    self._hasLoadBigImageing = false;
                    if (error) {
                        console.log(error);
                        return;
                    }
                    bigSprite = new Fire.Sprite(image);
                    entComp.setSprite(bigSprite);
                });
            }
            return;
        }
        // 创建家具到场景中
        ent = Fire.instantiate(self.sdataBase.tempFurniture);
        ent.parent = self.sdataBase.room;
        var pos = target.transform.worldPosition;
        var offset = Math.round(Math.random() * 100);
        pos.x += offset;
        pos.y += 400;
        ent.transform.position = new Fire.Vec2(pos.x, pos.y);
        ent.transform.scale = new Fire.Vec2(1.8, 1.8);
        ent.name = menu.suit_id;
        entComp = ent.getComponent('SFurniture');
        entComp.suit_id = menu.suit_id;
        entComp.propType = this._curId;
        entComp.tName = menu.tName;
        entComp.hasDrag = this._hasDrag;
        entComp.imageUrl = menu.bigImageUrl;
        bigSprite = self.sdataBase.threeMenuBigImageSheets[entComp.suit_id];
        if (bigSprite) {
            entComp.setSprite(bigSprite);
        }
        else {
            self._hasLoadBigImageing = true;
            Fire.ImageLoader(entComp.imageUrl, function (error, image) {
                self._hasLoadBigImageing = false;
                if (error) {
                    console.log(error);
                    return;
                }
                bigSprite = new Fire.Sprite(image);
                entComp.setSprite(bigSprite);
            });
        }
    },
    // 创建各个类型家具
    _onCreateFurnitureEvent: function (event) {
        console.log('创建' + event.target.parent.name);
        this.createOrChangeFurniture(event.target.parent);
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
        var i = 0, menu = null;
        // 创建对象容器
        if (this._menuList.length === 0) {
            var tempFurniture = this.sdataBase.tempThreeMenu;
            for (i = 0; i < this._menuTotal; ++i) {
                var ent = Fire.instantiate(tempFurniture);
                ent.name = i.toString();
                ent.parent = this.rootNode;
                ent.transform.position = new Fire.Vec2(-420 + (i * 170), 40);
                menu = ent.getComponent('SThreeMenu');
                menu.init();
                // 存储对象
                this._menuList.push(menu);
            }
        }
        else {
            // 重置
            this._resetMenu();
        }
        // 如果总数量有更新就重新计算最大页数
        var total = this.sdataBase.threeMenuDataTotalSheets[this._curId];
        if (this._curTotal !== total) {
            this._curTotal = total;
            this._maxPage = Math.ceil(this._curTotal / this._menuTotal);
        }
        // 赋值数据
        var index = 0;
        var startNum = (this._curPage - 1) * this._menuTotal;
        var endNum = startNum + this._menuTotal;
        if (endNum > this._curTotal) {
            endNum = this._curTotal;
        }
        var bindEvent = this._onCreateFurnitureEvent.bind(this);
        var dataSheets = this.sdataBase.threeMenuDataSheets[this._curId];
        for(i = startNum; i < endNum; ++i) {
            menu = this._menuList[index];
            menu.entity.active = true;
            index++;
            var menuData = dataSheets[i];
            if (!menuData) {
                continue;
            }
            menu.refresh(menuData, bindEvent);
        }
        // 刷新按钮状态
        this._refreshBtnState();
        // 判断是否需要预加载下一页
        var len = dataSheets.length;
        if(len === this._curTotal){
            return;
        }
        // 预加载下一页
        var nextPage = this._curPage + 1;
        this.sdataBase.preloadThreeMenuData(this._curId, nextPage, this._menuTotal, this.bindAfterLoadImageCB);
    },
    // 激活菜单时触发的事件
    // id: 物品的ID
    // hasDrag 是否拖着
    openMenu: function (id, hasDrag) {
        this._curId = id;
        this._curPage = 1;
        this._hasDrag = hasDrag;
        this._refreshSingleItems();
        // 显示当前窗口
        this.entity.active = true;
    },
    closeMenu: function () {
        this._curId = 0;
        this._curPage = 1;
        this.entity.active = false;
    },
    // 上一页
    _onPreviousEvent: function () {
        this._curPage -= 1;
        if (this._curPage < 1){
            this._curPage = 1;
        }
        this._refreshSingleItems();
    },
    // 下一页
    _onNextEvent: function () {
        this._curPage += 1;
        if (this._curPage > this._maxPage){
            this._curPage = this._maxPage;
        }
        this._refreshSingleItems();
    },
    // 关闭当前菜单
    _onCloseMenu: function () {
        this.closeMenu();
    },
    // 刷新按钮状态
    _refreshBtnState: function () {
        this.btn_Previous.active = this._curPage > 1;
        this.btn_Next.active = this._curPage < this._maxPage;
    },
    // 图片载入完毕以后的回调
    _AfterLoadImageCallBack: function (id, index, page, menuData) {
        if (this._curId === id && this._curPage === page) {
            var menu = this._menuList[index];
            if (menu) {
                menu.refresh(menuData, this._onCreateFurnitureEvent.bind(this));
            }
        }
    },
    // 开始
    start: function () {
        // 常用的变量/数据
        var ent = Fire.Entity.find('/SDataBase');
        this.sdataBase = ent.getComponent('SDataBase');
        // 获取关闭按钮并绑定事件
        ent = this.entity.find('btn_Close');
        var btnClose = ent.getComponent(Fire.UIButton);
        btnClose.onClick = this._onCloseMenu.bind(this);
        // 上一页
        this.btn_Previous = this.entity.find('btn_Previous');
        var btn_Previous = this.btn_Previous.getComponent(Fire.UIButton);
        btn_Previous.onClick = this._onPreviousEvent.bind(this);
        // 下一页
        this.btn_Next = this.entity.find('btn_Next');
        var btn_Next = this.btn_Next.getComponent(Fire.UIButton);
        btn_Next.onClick = this._onNextEvent.bind(this);
        //
        this.btn_Previous.active = false;
        this.btn_Next.active = false;

        this.bindAfterLoadImageCB = this._AfterLoadImageCallBack.bind(this);

        // 预加载
        this.sdataBase.preloadThreeMenuData(1, 1, this._menuTotal, this.bindAfterLoadImageCB);
        this.sdataBase.preloadThreeMenuData(2, 1, this._menuTotal, this.bindAfterLoadImageCB);
        this.sdataBase.preloadThreeMenuData(3, 1, this._menuTotal, this.bindAfterLoadImageCB);
        this.sdataBase.preloadThreeMenuData(4, 1, this._menuTotal, this.bindAfterLoadImageCB);
        this.sdataBase.preloadThreeMenuData(5, 1, this._menuTotal, this.bindAfterLoadImageCB);
        this.sdataBase.preloadThreeMenuData(6, 1, this._menuTotal, this.bindAfterLoadImageCB);
        this.sdataBase.preloadThreeMenuData(7, 1, this._menuTotal, this.bindAfterLoadImageCB);
        this.sdataBase.preloadThreeMenuData(8, 1, this._menuTotal, this.bindAfterLoadImageCB);
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

Fire._RFpop();
},{}],"SThreeMenu":[function(require,module,exports){
Fire._RFpush(module, 'f28a7ZHWqpGAIvNnfPbw7Cb', 'SThreeMenu');
// script\single\SThreeMenu.js

var SThreeMenu = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        // 下载次数
        this._btnMenu = null;
    },
    // 属性
    properties: {
        tName: '',
        // ID
        suit_id: 0,
        // 大图Url
        bigImageUrl: '',
        // 载入时的图片
        defaultSprite: {
            default: null,
            type: Fire.Sprite
        }
    },
    // 重置家具
    resetMenu: function () {
        this._btnMenu.setText('载入中');
        this._btnMenu.setSprite(this.defaultSprite);
        this._btnMenu.onClick = null;
        this.entity.active = false;
    },
    // 设置文字
    setText: function (text) {
        this._btnMenu.setText(text);
    },
    // 设置图片
    setSprite: function (smallSprite, event) {
        this._btnMenu.setSprite(smallSprite);
        if (event) {
            this._btnMenu.onClick = event;
        }
    },
    // 初始化
    init: function () {
        var ent = null;
        if (! this._btnMenu) {
            ent = this.entity.find('btn_menu');
            this._btnMenu = ent.getComponent(Fire.UIButton);
        }
        this.resetMenu();
    },
    // 刷新已下载过后的数据
    refresh: function (data, bindEvent) {
        this.entity.name = data.suit_id;
        this.suit_id = data.suit_id;
        this.tName = data.name;
        this.bigImageUrl = data.bigImageUrl;
        this.setText(data.name);
        if (data.smallSprite) {
            this.setSprite(data.smallSprite, bindEvent);
        }
        this.entity.active = true;
    }
});

Fire._RFpop();
},{}],"STipsWindow":[function(require,module,exports){
Fire._RFpush(module, 'e59287kq4BKOIBJba+VOX4+', 'STipsWindow');
// script\single\STipsWindow.js

var TipsWindow = Fire.Class({
    // �̳�
    extends: Fire.Component,
    // ���캯��
    constructor: function () {
        this.onCallEvent = null;
    },
    // ����
    properties: {
        content:{
            default: null,
            type: Fire.BitmapText
        },
        btn_Confirm:{
            default: null,
            type: Fire.UIButton
        },
        btn_Close:{
            default: null,
            type: Fire.UIButton
        }
    },
    // �򿪴���
    openWindow: function (text, callback) {
        this.entity.active = true;
        if (text) {
            this.setContent(text);
        }
        this.onCallEvent = null;
        if (callback) {
            this.onCallEvent = callback;
        }
    },
    // �رմ���
    closeWindow: function () {
        this.entity.active = false;
    },
    // ���õ��ú���
    setContent: function (event) {
        this.content.text = event;
    },
    // �رմ���
    _onCloseWindow: function () {
        this.closeWindow();
    },
    // ȷ���¼�
    _onConfirmEvent: function () {
        this.entity.active = false;
        if (this.onCallEvent) {
            this.onCallEvent();
        }
    },
    //
    onLoad: function () {
        this.btn_Confirm.onClick = this._onConfirmEvent.bind(this);
        this.btn_Close.onClick = this._onCloseWindow.bind(this);
    }
});

Fire._RFpop();
},{}],"Screenshot":[function(require,module,exports){
Fire._RFpush(module, '8748cSHzyNAGZFIGujsgTje', 'Screenshot');
// script\single\Screenshot.js

function convertCanvasToImage(canvas) {
    var image = new Image();
    image.src = canvas.toDataURL("image/png");
    //canvas.getImageData()
    return image;
}
// 用于创建缩略图
var Screenshot = Fire.Class({
    extends: Fire.Component,
    constructor: function () {
        // 用于拍照
        this.frameCount = -1;
        this.needHideEntList = [];
        this.callback = null;
    },
    // 属性
    properties: {

    },
    // 载入时
    onLoad: function() {
        var ent = Fire.Entity.find('/SDataBase');
        this.sdataBase = ent.getComponent('SDataBase');
    },
    // 创建缩略图
    createThumbnails: function (callback) {
        if (callback){
            this.callback = callback;
        }
        // 关闭已经打开界面
        this.needHideEntList = [];
        var children = Fire.Engine._scene.entities;
        for (var i = 0, len = children.length; i < len; ++i) {
            var ent = children[i];
            if (ent.active && ent.name !== 'Main Camera' &&
                ent.name !== 'Scene Camera' && ent.name !== 'Room' &&
                ent.name !== 'Screenshot') {
                ent.active = false;
                this.needHideEntList.push(ent);
            }
        }
        // 创建 Canvas
        if (!this.canvasCtxToDreawImage) {
            var canvas = document.createElement('canvas');
            canvas.width = 120;
            canvas.height = 120;
            this.canvasCtxToDreawImage = canvas.getContext('2d');
        }
        this.frameCount = Fire.Time.frameCount + 2;
    },
    // 刷新
    update: function () {
        if (this.frameCount !== -1 && this.frameCount === Fire.Time.frameCount) {
            // 绘制图片
            this.canvasCtxToDreawImage.clearRect(0, 0, 120, 120);
            var w = Fire.Engine._renderContext.width;
            var h = Fire.Engine._renderContext.height;
            var mainImage = convertCanvasToImage(Fire.Engine._renderContext.canvas);
            this.sdataBase.sloadingTips.openTips('创建缩略图');
            mainImage.onload = function () {
                this.canvasCtxToDreawImage.drawImage(mainImage, 0, 0, w, h, 0, 0, 120, 120);
                var image = convertCanvasToImage(this.canvasCtxToDreawImage.canvas);
                this.sdataBase.sloadingTips.closeTips();
                if (this.callback) {
                    this.callback(image);
                }
            }.bind(this);
            // 打开之前关闭的界面
            for (var i = 0, len = this.needHideEntList.length; i < len; ++i) {
                this.needHideEntList[i].active = true;
            }
            this.frameCount = -1;
        }
    }
});

Fire._RFpop();
},{}],"SecondMenuMgr":[function(require,module,exports){
Fire._RFpush(module, 'a90f58a395DhYziSwXkDv7s', 'SecondMenuMgr');
// script\villa\SecondMenuMgr.js

// 二级菜单管理类
var SecondMenuMgr = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        // 家具类型总数
        this._furnitureTypeTotal = 8;
        // 菜单列表
        this._menuList = [];
        // 当前选择type 1 单品 2 套装 3 物品柜
        this._curType = 1;
        // 套装一页显示多少个
        this._sutiItemShowTotal = 5;
        // 当前最大数量
        this._curTotal = 0;
        // 当前页数
        this._curPage = 1;
        // 最大页数
        this._maxPage = 1;
        // 创建套装家具到场景中
        this.bindCreateSuitItemEvent = this._onCreateSuitItemEvent.bind(this);
        // 打开三级菜单事件
        this.bindOpenThreeMenuEvent = this._onOpenThreeMenuEvent.bind(this);
        // 单品菜单回调函数
        this.bindRefreshSingleItemsMenu = this._refreshSingleItemsMenu.bind(this);
        // 套装菜单回调函数
        this.bindRefreshSuitItemsMenu = this._refreshSuitItemsMenu.bind(this);
        // 预存服务器数据列表
        this.serverSuitDataList = {};
    },
    // 属性
    properties: {
        //
        margin: new Fire.Vec2(-1090, 0),
        // 二级菜单的根节点
        root: {
            default: null,
            type: Fire.Entity
        },
        // 上一页
        btn_Left: {
            default: null,
            type: Fire.Entity
        },
        // 下一页
        btn_Right: {
            default: null,
            type: Fire.Entity
        }
    },
    // 打开各个类型家具列表
    _onOpenThreeMenuEvent: function (event) {
        var menu = event.target.parent.getComponent('SecondMenu');
        console.log('获取' + menu.tid + "类型家具列表");
        var self = this;
        // 如果是物品的话就需要先请求服务器信息
        if (self._curType === 2) {
            var text = '请求单品数据，请稍后...', eachnum = 7;
            if (menu.tid === 1) {
                text = '请求套装数据，请稍后...';
                eachnum = 5;
            }
            self.dataBase.loadTips.openTips(text);
            self.dataBase.loadBackpackData(menu.tid, 1, eachnum, function () {
                self.dataBase.loadTips.closeTips();
                self.dataBase.threeMenuMgr.openMenu(menu.tid, self._curType, menu.hasDrag);
                self.entity.active = false;
            });
        }
        else {
            this.dataBase.threeMenuMgr.openMenu(menu.tid, this._curType, menu.hasDrag);
            this.entity.active = false;
        }
    },
    // 创建套装到场景中
    _onCreateSuitItemEvent: function (event) {
        var secondMenu = event.target.parent.getComponent('SecondMenu');
        var self = this;
        // 删除套装
        self.dataBase.removeSuit();
        // 重新赋值套装
        self.dataBase.curDressSuit = {
            // 套装ID
            suit_id: secondMenu.tid,
            // 背包ID
            pack_id: 0,
            // 套装小图
            suit_icon: secondMenu.smallSprite,
            // 套装名称
            suit_name: secondMenu.tname,
            // 套装来自哪里，1.背包 2.商城
            suit_from: 2,
            // 套装价格
            price: secondMenu.price,
            // 折扣
            discount: secondMenu.discount,
            // 套装列表
            funrnitureList: []
        };
        var serverData = this.serverSuitDataList[secondMenu.tid];
        if (serverData) {
            self.dataBase.createFurnitureToScreen(serverData.list, function () {
                self.dataBase.loadTips.closeTips();
            });
        }
        else {
            self.dataBase.loadTips.openTips('创建套装，请稍后...');
            self.dataBase.netWorkMgr.RequestSetItemsData(secondMenu.tid, function (serverData) {
                self.serverSuitDataList[secondMenu.tid] = serverData;
                self.dataBase.createFurnitureToScreen(serverData.list, function () {
                    self.dataBase.loadTips.closeTips();
                });
            });
        }
    },
    // 关闭当前菜单
    closeMenu: function (hasModifyToggle) {
        if (!this.entity.active) {
            return;
        }
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
    // 重置菜单列表
    _resetMenu: function () {
        if (this._menuList.length === 0){
            return;
        }
        for (var i = 0; i < this._furnitureTypeTotal; ++i) {
            var menu = this._menuList[i];
            menu.name = i.toString();
            menu.resetMenu();
        }
    },
    // 创建菜单按钮并且绑定事件
    _initMenu: function (id) {
        // 创建容器
        this._createMenuContainers();
        this._resetMenu();
        switch(id){
            case 0:
                this._singleItemsMenu();
                break;
            case 1:
                this._suitItemsMenu();
                break;
            case 2:
                this._itemsCabinetMenu();
                break;
            default:
                break;
        }
    },
    // 创建容器
    _createMenuContainers: function () {
        if (this._menuList.length > 0) {
            return;
        }
        var tempMenu = this.dataBase.tempSubSecondMenu;
        for (var i = 0; i < this._furnitureTypeTotal; ++i) {
            var ent = Fire.instantiate(tempMenu);
            ent.name = i.toString();
            ent.parent = this.root;
            ent.transform.position = new Fire.Vec2(-570 + (i * 160), 25);
            var menu = ent.getComponent('SecondMenu');
            menu.init();
            // 存储对象
            this._menuList.push(menu);
        }
    },
    // 刷新单品家具菜单列表
    _singleItemsMenu: function () {
        var dataList = this.dataBase.single_Second_DataSheets;
        for(var i = 0; i < dataList.length; ++i) {
            var data = dataList[i];
            var menu = this._menuList[i];
            menu.entity.transform.position = new Fire.Vec2(-570 + (i * 160), 25);
            menu.refresh(data, this.bindOpenThreeMenuEvent);
        }
    },
    // 刷新套装家具菜单列表
    _suitItemsMenu: function () {
        // 重置数据
        this._resetMenu();
        // 如果总数量有更新就重新计算最大页数
        if (this._curTotal !== this.dataBase.suitItems_Three_Total) {
            this._curTotal = this.dataBase.suitItems_Three_Total;
            this._maxPage = Math.ceil(this._curTotal / this._sutiItemShowTotal);
        }
        // 显示套装菜单
        var index = 0;
        var startNum = (this._curPage - 1) * this._sutiItemShowTotal;
        var endNum = startNum + this._sutiItemShowTotal;
        if (endNum > this._curTotal) {
            endNum = this._curTotal;
        }
        var dataList = this.dataBase.suitItems_Second_DataSheets;
        for (var i = startNum; i < endNum; ++i) {
            var items = dataList[i];
            var menu = this._menuList[index];
            menu.entity.transform.position = new Fire.Vec2(-500 + (index * 250), 60);
            menu.refresh_suitItems(items, this.bindCreateSuitItemEvent);
            index++;
        }
        // 刷新按钮状态
        this._refreshBtnState();
        // 判断是否需要预加载下一页
        var len = this.dataBase.suitItems_Second_DataSheets.length;
        if (len === this.dataBase.suitItems_Three_Total) {
            return;
        }
        // 预加载
        //var nextPage = this._curPage + 1;
        //this.dataBase.preloadSuitItemsData_Second(nextPage, this._sutiItemShowTotal, this.bindRefreshSuitItemsMenu);
    },
    // 刷新物品柜列表
    _itemsCabinetMenu: function () {
        // 重新刷新下载后的图片数据
        var self = this;
        var loadImageCallBack = function (data) {
            var menu = self._menuList[data.tid];
            menu.refresh(data, self.bindOpenThreeMenuEvent);
        };
        // 初始化物品柜数据
        this.dataBase.initBackpackData(loadImageCallBack);
        //
        var dataSheets = this.dataBase.backpack_Second_DataSheets;
        for (var i = 0; i < dataSheets.length; ++i) {
            var menu = this._menuList[i];
            var items = dataSheets[i];
            menu.entity.transform.position = new Fire.Vec2(-550 + (i * 200), 25);
            menu.refresh(items, this.bindOpenThreeMenuEvent);
        }
    },
    // 刷新单品菜单
    _refreshSingleItemsMenu: function (index, menuData) {
        if (this._curType !== 0) {
            return;
        }
        var menu = this._menuList[index];
        if (menu) {
            menu.refresh(menuData, this.bindOpenThreeMenuEvent);
        }
    },
    // 刷新套装菜单
    _refreshSuitItemsMenu: function (page, index, menuData) {
        if (this._curType !== 1 || this._curPage !== page) {
            return;
        }
        var menu = this._menuList[index];
        if (menu) {
            menu.refresh_suitItems(menuData, this.bindCreateSuitItemEvent);
        }
    },
    // 刷新按钮状态
    _refreshBtnState: function () {
        this.btn_Left.active = this._curPage > 1;
        this.btn_Right.active = this._curPage < this._maxPage;
    },
    // 上一页
    _onPreviousEvent: function () {
        this._curPage -= 1;
        if (this._curPage < 1){
            this._curPage = 1;
        }
        this._suitItemsMenu();
    },
    // 下一页
    _onNextEvent: function () {
        this._curPage += 1;
        if (this._curPage > this._maxPage){
            this._curPage = this._maxPage;
        }
        this._suitItemsMenu();
    },
    // 激活菜单时触发的事件 0:单品 1:套装 2:物品柜
    openMenu: function (id) {
        console.log('打开ID:' + id + "   (0:单品 1:套装 2:物品柜)");
        //
        this.btn_Left.active = false;
        this.btn_Right.active = false;
        //获取菜单按钮并且绑定事件
        this._curType = id;
        this._initMenu(id);
        this.dataBase.threeMenuMgr.closeMenu(false);
        this.entity.active = true;
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
        // 预加载 单品
        this.dataBase.preloadSinagleItemsData_Second(this.bindRefreshSingleItemsMenu);
        // 预加载 套装
        this.dataBase.preloadSuitItemsData_Second(1, this._sutiItemShowTotal, this.bindRefreshSuitItemsMenu);
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

Fire._RFpop();
},{}],"SecondMenu":[function(require,module,exports){
Fire._RFpush(module, 'a80b2I6gNFPX5P00Dv4QcCt', 'SecondMenu');
// script\villa\SecondMenu.js

var SecondMenu = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        this._btnMenu = null;
        this._price = null;
        this.roomType = 0;
        this.uid = 0;
        this.price = 0;
        // 折扣
        this.discount = 1;
        this.smallSprite = null;
    },
    // 属性
    properties: {
        // 当前类型ID用于向服务器请求数据
        tid: 0,
        tname: '',
        hasDrag: false,
        // 默认图片
        defaultSprite: {
            default: null,
            type: Fire.Sprite
        },
        defaultLoadAnim: {
            default: null,
            type: Fire.Animation
        }
    },
    // 重置菜单
    resetMenu: function () {
        this.tid = 0;
        this.hasDrag = false;
        this.tname = '载入中';
        this._btnMenu.setText('载入中');
        this._btnMenu.setSprite(this.defaultSprite);
        this._btnMenu.setCustomSize(-1, -1);
        this._btnMenu.onClick = null;
        this._price.entity.active = false;
        this.entity.active = false;
    },
    // 设置文字
    setText: function (text) {
        this.tname = text;
        this._btnMenu.setText(text);
    },
    // 设置价格
    setPrice: function (value) {
        this.price = value;
        this._price.text = value;
        this._price.entity.active = true;
    },
    // 设置图片
    setSprite: function (sprite, event) {
        if (! sprite) {
            return;
        }
        this.smallSprite = sprite;
        this._btnMenu.setSprite(sprite);
        if (sprite.width > 130) {
            this._btnMenu.setCustomSize(120, 120);
        }
        if (event) {
            this._btnMenu.onClick = event;
        }
    },
    init: function () {
        // 常用的变量/数据
        var ent = Fire.Entity.find('/DataBase');
        this.dataBase = ent.getComponent('DataBase');
        //
        ent = this.entity.find('btn_Menu');
        this._btnMenu = ent.getComponent('UIButton');
        ent = this.entity.find('price');
        this._price = ent.getComponent(Fire.Text);
        //
        var state = this.defaultLoadAnim.play('loading');
        state.wrapMode = Fire.WrapMode.Loop;
        state.repeatCount = Infinity;
    },
    // 刷新单品 / 物品柜
    refresh: function (data, event) {
        this.resetMenu();

        this.entity.active = true;
        this._btnMenu.entity.active = false;
        this.defaultLoadAnim.entity.active = true;
        this.defaultLoadAnim.play('loading');
        if (data) {
            this.tid = data.tid;
            this.hasDrag = data.isdrag < 2;
            this.setText(data.tname);
            this.entity.name = data.tid;
            this.entity.active = true;

            var self = this;
            if (data.localPath) {
                Fire.Resources.load(data.localPath, function (error, sprite) {
                    if (error) {
                        console.log(error);
                    }
                    self.setSprite(sprite, event);
                    self._btnMenu.entity.active = true;
                    self.defaultLoadAnim.entity.active = false;
                });
                return;
            }

            self.dataBase.loadImage(data.url || data.imageUrl, function (data, error, image) {
                if (error) {
                    console.log(error);
                }
                if (self.tid !== data.tid) {
                    return;
                }
                var sprite = new Fire.Sprite(image);
                self.setSprite(sprite, event);
                self._btnMenu.entity.active = true;
                self.defaultLoadAnim.entity.active = false;
            }.bind(this, data));
        }
    },
    // 刷新套装
    refresh_suitItems: function (data, event) {
        this.resetMenu();

        this.entity.active = true;
        this._btnMenu.entity.active = false;
        this.defaultLoadAnim.entity.active = true;
        this.defaultLoadAnim.play('loading');

        if (data) {
            this.tid = data.tid;
            this.uid = data.uid;
            this.setText(data.tname);
            this.roomType = data.roomType;
            this.setPrice(data.price);
            this.entity.name = data.tid;
            //
            var self = this;
            self.dataBase.loadImage(data.imageUrl, function (data, error, image) {
                if (error) {
                    console.log(error);
                }
                if (self.tid !== data.tid) {
                    return;
                }
                var sprite = new Fire.Sprite(image);
                self.setSprite(sprite, event);
                self._btnMenu.entity.active = true;
                self.defaultLoadAnim.entity.active = false;
            }.bind(this, data));
        }
    }
});

Fire._RFpop();
},{}],"ServerNetWork":[function(require,module,exports){
Fire._RFpush(module, '40c63s3i7xIGpj0wnXzVses', 'ServerNetWork');
// script\outdoor\ServerNetWork.js

// 跟服务器进行对接
var ServerNetWork = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        // 当前请求数据
        this._postData = {};
        // 断线重连窗口
        this.netWorkWin = null;
        // 用于测试的token数据
        this.token = '';
    },
    // 属性
    properties: {
        localTest: false
    },

    // 获取用户信息
    getToKenValue: function () {
        if (this.localTest) {
            this.token = 'MTAwMTQ5MjY4NV8yYjEyZjY1OTZjMjQxNjBlYmIwMTY1OTA2MDk1Y2I1NF8xNDM4MDc1Mzc1X3dhcF8xMDAxNDkyNjg1';
        }
        else {
            this.token = this.getQueryString('token');
            if (!this.token) {
                //console.log("没有用户信息, ToKen is null");
                return false;
            }
        }
        return true;
    },
    // 用JS获取地址栏参数的方法
    getQueryString: function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r !== null) {
            return unescape(r[2]);
        }
        return null;
    },
    // 请求失败
    _errorCallBack: function () {
        var self = this;
        this.netWorkWin.openWindow(function () {
            self.sendData(self._postData);
        });
    },
    // 发送数据
    sendData: function (data) {
        if (!Fire.Engine.isPlaying) {
            return;
        }
        if (!this.getToKenValue()) {
            return;
        }
        //this.dataBase.loadTips.openTips('请求中，请稍后...');
        this._postData = data;
        this.jQueryAjax(data.url, data.sendData, data.cb, data.errCb);
    },
    // 发送消息
    jQueryAjax: function (strUrl, data, callBack, errorCallBack) {
        var params = "";
        if (typeof(data) !== "object") {
            params = data + "&token=" + this.token;
        }
        else {
            for (var key in data) {
                params += (key + "=" + data[key] + "&"  );
            }
            params += "&token=" + this.token;
        }
        var send = {
            type: "POST",
            url: strUrl + "?&jsoncallPP=?",
            data: params,
            dataType: 'jsonp',
            success: function (data) {
                if (!Fire.Engine.isPlaying) {
                    return;
                }
                if (callBack) {
                    callBack(data);
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                if (!Fire.Engine.isPlaying) {
                    return;
                }
                if (errorCallBack) {
                    errorCallBack();
                }
                console.log(errorThrown);
                console.log(XMLHttpRequest);
                console.log(textStatus);
            }
        };
        jQuery.ajax(send);
    },
    // 初始化外景数据
    InitOutdoor: function (sendData, callback) {
        var postData = {
            url: "http://m.saike.com/suitdress/browseScene.html",
            sendData: {
                dress_type: sendData.dress_type
            },
            cb: callback,
            errCb: this._errorCallBack.bind(this)
        };
        this.sendData(postData);
    },
    // 楼层列表
    RequestFloorList: function (callback) {
        var postData = {
            url: "http://m.saike.com/suitdress/floorList.html",
            sendData: {},
            cb: callback,
            errCb: this._errorCallBack.bind(this)
        };
        this.sendData(postData);
    },
    // 获取平面图
    RequestPlan: function (sendData, callback) {
        var postData = {
            url: "http://m.saike.com/suitdress/showCover.html",
            sendData: {
                house_uid: sendData.house_uid,
                floor_id: sendData.floor_id,
                mark: sendData.mark
            },
            cb: callback,
            errCb: this._errorCallBack.bind(this)
        };
        this.sendData(postData);
    },
    // 解除关系
    RequestDisassociateList: function (sendData, callback) {
        var postData = {
            url: "http://m.saike.com/suitdress/releaseRelation.html",
            sendData: sendData,
            cb: callback,
            errCb: this._errorCallBack.bind(this)
        };
        this.sendData(postData);
    },
    // 开始时
    start: function () {
        // 重新请求服务器窗口
        var ent = Fire.Entity.find('/Tip_NetWork');
        this.netWorkWin = ent.getComponent('NewWorkWindow');
    }
});

Fire._RFpop();
},{}],"SubMenu":[function(require,module,exports){
Fire._RFpush(module, 'ef6a1COlW1Eba/+TbJXCSXJ', 'SubMenu');
// script\outdoor\SubMenu.js

var SubMenu = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        this.curType = 1;
    },
    // 属性
    properties: {
        offset: new Fire.Vec2(0, 150),
        btn_DressUp: {
            default: null,
            type: Fire.UIButton
        },
        btn_InteractiveFamily: {
            default: null,
            type: Fire.UIButton
        },
        btn_GoToIndoor: {
            default: null,
            type: Fire.UIButton
        }
    },
    // 开始
    start: function () {
        // 常用的变量/数据
        var ent = Fire.Entity.find('/ODataBase');
        this.odataBase = ent.getComponent('ODataBase');

        this.btn_DressUp.onClick = this.onDressUpEvent.bind(this);
        this.btn_InteractiveFamily.onClick = this.onInteractiveFamilyEvent.bind(this);
        this.btn_GoToIndoor.onClick = this.onGoToIndoorEvent.bind(this);
    },

    // type: 单身公寓
    openSubMenu: function (type) {
        this.curType = type;
        this.entity.active = true;
        this.btn_InteractiveFamily.entity.active = type !== 1;
    },

    changerScreen: function () {
        if (this.curType === 1) {
            Fire.Engine.loadScene('single');
        }
        else{
            Fire.Engine.loadScene('villa');
        }
    },

    // 我要装扮
    onDressUpEvent: function () {
        this.odataBase.globalData.gotoType = 1;
        this.changerScreen();
    },
    // 家人互动
    onInteractiveFamilyEvent: function () {

    },
    // 进入室内
    onGoToIndoorEvent: function () {
        this.odataBase.globalData.gotoType = 2;
        this.changerScreen();
    },
    // 更新
    update: function () {
        // 匹配UI分辨率
        var camera = Fire.Camera.main;
        var bgWorldBounds = this.odataBase.bgRender.getWorldBounds();
        var bgLeftTopWorldPos = new Fire.Vec2(0, bgWorldBounds.yMin + this.offset.y);
        var bgleftTop = camera.worldToScreen(bgLeftTopWorldPos);
        var screenPos = new Fire.Vec2(bgleftTop.x, bgleftTop.y);
        var worldPos = camera.screenToWorld(screenPos);
        this.entity.transform.worldPosition = worldPos;
    }
});

Fire._RFpop();
},{}],"SwitchRoomWindow":[function(require,module,exports){
Fire._RFpush(module, 'c10f0B6lGZKe5db3PLMuoSk', 'SwitchRoomWindow');
// script\villa\SwitchRoomWindow.js

//
var SwitchRoomWindow = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        this.entranceType = 0;
    },
    // 属性
    properties: {
        root: {
            default: null,
            type: Fire.Entity
        },
        roomName: {
            default: null,
            type: Fire.Text
        },
        roomLevel: {
            default: null,
            type: Fire.Text
        },
        roomNum: {
            default: null,
            type: Fire.Text
        },
        btn_close: {
            default: null,
            type: Fire.UIButton
        }
    },
    // 重置窗口
    resetWindow: function () {
        this.roomName.text = '(别墅名称)';
        this.roomLevel.text = '档次：★★★★★★';
        this.roomNum.text = '共8个房间';
    },
    // 打开窗口
    // type: 那个路口进入平面图的
    // 0, 切换房间 1：切换楼出
    openWindow: function (type, sendData) {
        var self = this;
        self.entity.active = true;
        self.entranceType = type;
        self._removeSwitchRoom();
        var loaclData = self.planList[sendData.mark];
        if (loaclData) {
            self.dataBase.mark = sendData.mark;
            self.createPlan(loaclData);
        }
        else {
            self.dataBase.loadTips.openTips('载入平面图数据！请稍后...');
            self.dataBase.netWorkMgr.RequestPlan(sendData, function (serverData) {
                self.dataBase.loadTips.closeTips();
                if (serverData.status === 10006) {
                    self.dataBase.loadTips.closeTips();
                }
                self.planList[sendData.mark] = serverData;
                self.dataBase.mark = sendData.mark;
                self.createPlan(serverData);
            });
        }
    },
    // 关闭窗口
    closeWindow: function () {
        this.entity.active = false;
    },
    // 绘制星级
    getStars: function (grade) {
        var str = '档次：';
        if (grade === 12) {
            str += '至尊宝';
        }
        else {
            for (var i = 0; i < grade - 1; ++i) {
                str += '★';
            }
        }
        return str;
    },
    // 创建平面图
    createPlan: function (serverData) {
        if (! serverData.list) {
            return;
        }
        // 像服务器请求平面图数据
        this.roomName.text = serverData.floor_name;
        this.roomLevel.text = this.getStars(serverData.floor_grade);
        this.roomNum.text = '共'+ serverData.list.length + '个房间';
        this.bindGoToRoomEvent = this._onGotoRoomEvent.bind(this);
        for (var i = 0; i < serverData.list.length; ++i) {
            var data = serverData.list[i];
            var ent = Fire.instantiate(this.dataBase.tempPlan);
            ent.active = true;
            ent.parent = this.root;
            var btn = ent.getComponent(Fire.UIButton);
            btn.mark = data.mark;
            this.dataBase.loadImage(data.imgurl, function (btn, error, image) {
                var sprite = new Fire.Sprite(image);
                sprite.pixelLevelHitTest = true;
                btn.setSprite(sprite);
                btn.onClick = this.bindGoToRoomEvent;
            }.bind(this, btn));
        }
    },
    // 进入房间
    _onGotoRoomEvent: function (event) {
        var btn = event.target.getComponent(Fire.UIButton);
        var sendData = {
            mark: btn.mark,
            house_uid: 0
        };
        var self = this;
        self.dataBase.loadTips.openTips('载入房间数据！请稍后...');
        self.dataBase.intoRoom(sendData, function () {
            self.dataBase.loadTips.closeTips();
            self.closeWindow();
            self.dataBase.firstMenuMgr.closeMenu();

            self.dataBase.updateCharacters();
            self.dataBase.characters.entity.active = true;
        });
    },
    // 清空房间
    _removeSwitchRoom: function () {
        var children = this.root.getChildren();
        for (var i = 0;i < children.length; ++i) {
            children[i].destroy();
        }
    },
    // 关闭按钮事件
    _onCloseWindowEvent: function () {
        this.closeWindow();
        if (this.entranceType === 1) {
            this.dataBase.floorWin.openWindow();
        }
        this._removeSwitchRoom();
    },
    //
    start: function () {
        // 常用的变量/数据
        var ent = Fire.Entity.find('/DataBase');
        this.dataBase = ent.getComponent('DataBase');
        // 绑定事件
        this.btn_close.onClick = this._onCloseWindowEvent.bind(this);
        //
        this.planList = {};
    }
});

Fire._RFpop();
},{}],"ThreeMenuMgr":[function(require,module,exports){
Fire._RFpush(module, '17b03n5zitH7pM68ndB6Y73', 'ThreeMenuMgr');
// script\villa\ThreeMenuMgr.js

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
                var bigSprite = new Fire.Sprite(image);
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

Fire._RFpop();
},{}],"ThreeMenu":[function(require,module,exports){
Fire._RFpush(module, '1f14eyVL/xLAaDqWdfhycDe', 'ThreeMenu');
// script\villa\ThreeMenu.js

var ThreeMenu = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        this._btnMenu = null;
        this._priceText = null;
        this.smallSprite = null;
        // 如果是套装的话就有家具列表
        this.dressList = [];
    },
    // 属性
    properties: {
        props_name: '',
        // 物品ID
        props_id: 0,
        // 物品UID
        props_uid: 0,
        // 套装ID
        suit_id: 0,
        // 套装名称
        suit_name: '',
        // 背包ID
        pack_id: 0,
        // 类别
        props_type: 0,
        // 价格
        price: 0,
        // 折扣
        discount: 0,
        // 大图Url
        bigImageUrl: '',
        // 是否可以拖动（例如壁纸与地面无法拖动）
        hasDrag: false,
        // 是否有使用过
        hasUse: false,
        // 载入时的图片
        defaultSprite: {
            default: null,
            type: Fire.Sprite
        },
        defaultLoadAnim: {
            default: null,
            type: Fire.Animation
        }
    },
    // 重置家具
    resetMenu: function () {
        this._btnMenu.setText('载入中');
        this._btnMenu.setSprite(this.defaultSprite);
        this._btnMenu.onClick = null;
        this.entity.name = '没赋值';
        this.props_id = 0;
        this.props_uid = 0;
        this.suit_id = 0;
        this.pack_id = 0;
        this.suit_name = '';
        this.props_type = 0;
        this.bigImageUrl = '没有得到大图URL';
        this.hasDrag = false;
        this.setMarkUse(false);
        this.setText('');
        this.setPrice(0);
        this.smallSprite = null;
        this.dressList = [];
        this.entity.active = false;
    },
    // 设置文字
    setText: function (text) {
        this._btnMenu.setText(text);
    },
    // 设置价格
    setPrice: function (value) {
        this.price = !value ? 0 : value;
        this._priceText.entity.active = this.price !== 0;
        this._priceText.text = value;
    },
    // 设置图片
    setSprite: function (smallSprite, event) {
        if (! smallSprite) {
            return;
        }
        this.smallSprite = smallSprite;

        this._btnMenu.setSprite(smallSprite);
        if (smallSprite.width > 110 || smallSprite.height > 120) {
            this._btnMenu.btnRender.useCustomSize = true;
            this._btnMenu.btnRender.customWidth = 110;
            this._btnMenu.btnRender.customHeight = 120;
        }
        if (event) {
            this._btnMenu.onClick = event;
        }
    },
    // 标记已使用
    setMarkUse: function (value) {
        this.hasUse = value;
        this._btnMenu.setDisabled(value);
    },
    // 开始时
    init: function () {
        // 常用的变量/数据
        var ent = Fire.Entity.find('/DataBase');
        this.dataBase = ent.getComponent('DataBase');
        if (! this._btnMenu) {
            ent = this.entity.find('btn_Menu');
            this._btnMenu = ent.getComponent('UIButton');
        }
        if (! this._priceText) {
            ent = this.entity.find('price');
            this._priceText = ent.getComponent(Fire.Text);
        }
        //
        var state = this.defaultLoadAnim.play('loading');
        state.wrapMode = Fire.WrapMode.Loop;
        state.repeatCount = Infinity;
        //
        this.resetMenu();
    },
    // 刷新已下载过后的数据
    refresh: function (data, bindEvent) {
        this.entity.name = data.props_id || 0;
        this.props_id = data.props_id || 0;
        this.props_uid = data.prod_uid || 0;
        this.pack_id = data.pack_id || 0;
        this.props_type = parseInt(data.props_type) || 0;
        this.discount = data.discount || 1;
        this.hasDrag = data.hasDrag || false;
        this.suit_id = parseInt(data.suit_id || 0);
        this.suit_name = data.suit_name || '';
        this.props_name = data.props_name || '';
        this.setText(data.props_name || data.suit_name);
        this.setPrice(data.price || 0);
        this.bigImageUrl = data.bigImageUrl;
        this.dressList = data.dressList || [];
        this.entity.active = true;
        this._btnMenu.entity.active = false;
        this.defaultLoadAnim.entity.active = true;
        this.defaultLoadAnim.play('loading');
        this.setMarkUse(data.status === "1" || false);
        //
        var self = this;
        self.dataBase.loadImage(data.imageUrl, function (data, error, image) {
            if (error) {
                console.log(error);
            }
            if (self.tid !== data.tid) {
                return;
            }
            var sprite = new Fire.Sprite(image);
            self.setSprite(sprite, bindEvent);
            self._btnMenu.entity.active = true;
            self.defaultLoadAnim.entity.active = false;
        }.bind(this, data));
    }
});

Fire._RFpop();
},{}],"TipLoad":[function(require,module,exports){
Fire._RFpush(module, 'eea69CUTeJDRb9/ydb/VGdT', 'TipLoad');
// script\villa\TipLoad.js

var TipLoad = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {

    },
    // 属性
    properties: {
        content:{
            default: null,
            type: Fire.BitmapText
        },
        loadIcon: {
            default: null,
            type: Fire.Entity
        },
        anim: {
            default: null,
            type: Fire.Animation
        }
    },
    // 加载
    onLoad: function () {
        var state = this.anim.play('loading');
        state.wrapMode = Fire.WrapMode.Loop;
        state.repeatCount = Infinity;
    },
    // 打开窗口
    openTips: function (text) {
        this.anim.play('loading');
        this.entity.active = true;
        if (text) {
            this.content.text = text;
        }
        else {
            this.content.text = '加载中请稍后...';
        }
        var size = this.content.getWorldSize();
        this.loadIcon.transform.worldPosition = new Fire.Vec2(size.x / 2 + 50, 0);
    },
    // 关闭窗口
    closeTips: function () {
        this.anim.stop('loading');
        this.entity.active = false;
    }
});

Fire._RFpop();
},{}],"Tip_MyAdd":[function(require,module,exports){
Fire._RFpush(module, 'a4e37tBaBtO15I+R7fYpMZl', 'Tip_MyAdd');
// script\outdoor\Tip_MyAdd.js

var Comp = Fire.Class({
    extends: Fire.Component,

    properties: {
        btn_Determine: {
            default: null,
            type: Fire.UIButton
        },
        btn_Close: {
            default: null,
            type: Fire.UIButton
        }
    },
    _onCloseWindow: function () {
        this.closeTips();
    },
    _onDetermineEvent: function () {
        this.closeTips();
    },
    openTipsWindow: function () {
        this.entity.active = true;
    },
    closeTips: function () {
        this.entity.active = false;
    },
    onLoad: function () {
        this.btn_Close.onClick = this._onCloseWindow.bind(this);
        this.btn_Determine.onClick = this._onDetermineEvent.bind(this);
    }
});

Fire._RFpop();
},{}],"TipsPayMent":[function(require,module,exports){
Fire._RFpush(module, '20944LBmvRIM7hGuyJzC4Mc', 'TipsPayMent');
// script\villa\TipsPayMent.js

var TipsPayMent = Fire.Class({
    extends: Fire.Component,

    properties: {
        btn_Pay: {
            default: null,
            type: Fire.UIButton
        },
        btn_PayIssues: {
            default: null,
            type: Fire.UIButton
        },
        btn_Close: {
            default: null,
            type: Fire.UIButton
        }
    },
    // 关闭按钮事件
    _onCloseWindow: function () {
        this.closeTips();
    },
    // 已经完成付款，需要通讯服务器
    _onCheckPay: function () {
        var self = this;
        self.dataBase.loadTips.openTips('确认充值是否完毕！请稍后...');
        var sendData = {
            mark: this.dataBase.mark
        };
        self.dataBase.netWorkMgr.RequestCanDressRoom(sendData, function (serverData) {
            self.dataBase.usercc = serverData.usercc;
            self.dataBase.payMentWindow.refreshUserCC();
            self.dataBase.loadTips.closeTips();
            self.dataBase.tipsWindow.openTipsWindow('充值成功!');
            self.closeTips();
        });
    },
    // 付款遇到的问题
    _onPayIssues: function () {
        this.dataBase.tipsPayProblems.openTips();
    },
    // 开启提示窗口
    openTips: function (text) {
        this.entity.active = true;
    },
    // 关闭提示窗口
    closeTips: function () {
        this.entity.active = false;
    },
    // 加载时
    onLoad: function () {
        // 常用的变量/数据
        var ent = Fire.Entity.find('/DataBase');
        this.dataBase = ent.getComponent('DataBase');
        //
        this.btn_Pay.onClick = this._onCheckPay.bind(this);
        this.btn_PayIssues.onClick = this._onPayIssues.bind(this);
        this.btn_Close.onClick = this._onCloseWindow.bind(this);
    }
});

Fire._RFpop();
},{}],"TipsPayProblems":[function(require,module,exports){
Fire._RFpush(module, 'b3cd9B/+D1HPoFeuugekAnt', 'TipsPayProblems');
// script\villa\TipsPayProblems.js

var TipsPayProblems = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {

    },
    // 属性
    properties: {
        btn_ok: {
            default: null,
            type: Fire.UIButton
        }
    },

    _onOKEvent: function () {
        this.closeTips();
    },

    closeTips: function () {
        this.entity.active = false;
    },

    openTips: function () {
        this.entity.active = true;
    },
    // 开始
    start: function () {
        this.btn_ok.onClick = this._onOKEvent.bind(this);
    }
});

Fire._RFpop();
},{}],"TipsWindow":[function(require,module,exports){
Fire._RFpush(module, 'f92c3DW3ZZFYoNKc7lVYHc8', 'TipsWindow');
// script\villa\TipsWindow.js

var TipsWindow = Fire.Class({
    extends: Fire.Component,

    properties: {
        content: {
            default: null,
            type: Fire.BitmapText
        },
        btn_Determine: {
            default: null,
            type: Fire.UIButton
        },
        btn_close: {
            default: null,
            type: Fire.UIButton
        }
    },

    _onCloseWindow: function () {
        this.closeTips();
    },

    _onDetermineEvent: function () {
        this.closeTips();
        if (this.onCallback) {
            this.onCallback();
        }
    },

    openTipsWindow: function (value, callback) {
        this.onCallback = null;
        if (this.content && value){
            this.content.text = value;
        }
        if (callback) {
            this.onCallback = callback;
        }
        this.entity.active = true;
    },

    closeTips: function () {
        this.entity.active = false;
    },

    onLoad: function () {
        this.btn_close.onClick = this._onCloseWindow.bind(this);
        this.btn_Determine.onClick = this._onDetermineEvent.bind(this);
    }
});

Fire._RFpop();
},{}],"Toggle":[function(require,module,exports){
Fire._RFpush(module, '8d004A7/tBP972YfiApUSWu', 'Toggle');
// script\common\Toggle.js

var Toggle =Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        this.hasClick = false;
        this._onButtonDownEventBind = this._onButtonDownEvent.bind(this);
        this._onButtonUpEventBind = this._onButtonUpEvent.bind(this);
        this.btnRender = null;
        this.onClick = null;
    },
    // 属性
    properties: {
        textContent: {
            default: null,
            type: Fire.Text
        },
        normalPos: new Fire.Vec2(0, 0),
        normalColor: Fire.Color.white,
        normalSprite: {
            default: null,
            type: Fire.Sprite
        },
        pressedPos: new Fire.Vec2(0, 0),
        pressedColor: Fire.Color.white,
        pressedSprite: {
            default: null,
            type: Fire.Sprite
        },
        // 按钮渲染
        btnRender: {
            get: function () {
                if (! this._btnRender) {
                    this._btnRender = this.entity.getComponent(Fire.SpriteRenderer);
                }
                return this._btnRender;
            },
            visible: false
        }
    },
    // 按下
    _onButtonDownEvent: function () {
        //if (this.pressedSprite) {
        //    this.btnRender.sprite = this.pressedSprite;
        //}
        //if (this.normalPos !== Fire.Vec2.zero) {
        //    this.setPostition(this.normalPos);
        //}
    },
    // 放开
    _onButtonUpEvent: function (event) {
        if (this.hasClick) {
            return;
        }
        if (this.onClick) {
            this.onClick(event);
        }
        if (this.pressedSprite) {
            this.btnRender.sprite = this.pressedSprite;
        }
        if (this.pressedColor !== Fire.Color.white) {
            this.btnRender.color = this.pressedColor;
        }
        if (this.pressedPos.x !== 0 && this.pressedPos.y !== 0) {
            this.setPostition(this.pressedPos);
        }
        this.hasClick = true;
    },
    //
    defaultToggle: function (callback) {
        if (this.pressedSprite) {
            this.btnRender.sprite = this.pressedSprite;
        }
        this.btnRender.color = this.pressedColor;
        if (this.pressedPos.x !== 0 && this.pressedPos.y !== 0) {
            this.setPostition(this.pressedPos);
        }
        if (callback) {
            callback();
        }
    },
    resetColor: function () {
        this.hasClick = false;
        this.btnRender.color = this.normalColor;
    },
    //
    resetToggle: function () {
        this.hasClick = false;
        if (this.normalSprite) {
            this.btnRender.sprite = this.normalSprite;
        }
        this.btnRender.color = this.normalColor;
        if (this.normalPos.x !== 0 && this.normalPos.y !== 0) {
            this.setPostition(this.normalPos);
        }
    },
    // 设置坐标
    setPostition: function (posValue) {
        this.entity.transform.position = posValue;
    },
    // 设置文字
    setText: function (value) {
        this.textContent.text = value;
    },
    // 载入时
    onLoad: function () {
        this.entity.on('mousedown', this._onButtonDownEventBind);
        this.entity.on('mouseup', this._onButtonUpEventBind);
        if (this.normalSprite) {
            this.btnRender.sprite = this.normalSprite;
        }
        if (this.normalColor !== Fire.Color.white) {
            this.btnRender.color = this.normalColor;
        }
        if (this.normalPos.x !== 0 && this.normalPos.y !== 0) {
            this.setPostition(this.normalPos);
        }
    },
    // 销毁时
    onDestroy: function () {
        this.entity.off('mousedown', this._onButtonDownEventBind);
        this.entity.off('mouseup', this._onButtonUpEventBind);
    }
});

Fire.Toggle = Toggle;

Fire._RFpop();
},{}],"Tools":[function(require,module,exports){
Fire._RFpush(module, 'a162doTenpKOa0TQt8Mpx4K', 'Tools');
// script\common\Tools.js

function ImageLoader(url, callback, onProgress) {
    var image = document.createElement('img');
    //image.crossOrigin = 'Anonymous';

    var onload = function () {
        if (callback) {
            callback(null, this);
        }
        image.removeEventListener('load', onload);
        image.removeEventListener('error', onerror);
        image.removeEventListener('progress', onProgress);
    };
    var onerror = function (msg, line, url) {
        if (callback) {
            var error = 'Failed to load image: ' + msg + ' Url: ' + url;
            callback(error, null);
        }
        image.removeEventListener('load', onload);
        image.removeEventListener('error', onerror);
        image.removeEventListener('progress', onProgress);
    };

    image.addEventListener('load', onload);
    image.addEventListener('error', onerror);
    if (onProgress) {
        image.addEventListener('progress', onProgress);
    }
    image.src = url;
    return image;
}

Fire.ImageLoader = ImageLoader;

Fire._RFpop();
},{}],"UIButton":[function(require,module,exports){
Fire._RFpush(module, '16c5dqZQm1L0r9f7Qp5vse5', 'UIButton');
// script\common\UIButton.js

var UIButton =Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        this._btnRender = null;
        this._normalColor = null;
        this._normalSprite = null;
        this._onButtonDownEventBind = this._onButtonDownEvent.bind(this);
        this._onButtonUpEventBind = this._onButtonUpEvent.bind(this);
        this._onButtonEnterEventBind = this._onButtonEnterEvent.bind(this);
        this._onButtonLeaveEventBind = this._onButtonLeaveEvent.bind(this);
        this.onClick = null;
        this.onMousedown = null;
        this.image = null;
        this.mark = 0;
        this.hasDisabled = false;
    },
    // 属性
    properties: {
        // 按钮文字
        textContent: {
            default: null,
            type: Fire.Text
        },
        //
        hoverColor: Fire.Color.white,
        hoverSprite: {
            default: null,
            type: Fire.Sprite
        },
        //
        pressedColor: Fire.Color.white,
        pressedSprite: {
            default: null,
            type: Fire.Sprite
        },
        //
        disabledColor: new Fire.Color(0.5, 0.5, 0.5, 1),
        // 按钮渲染
        btnRender: {
            get: function () {
                if (! this._btnRender) {
                    this._btnRender = this.entity.getComponent(Fire.SpriteRenderer);
                }
                return this._btnRender;
            },
            visible: false
        }

    },
    // 按下
    _onButtonDownEvent: function (event) {
        if (this.pressedSprite) {
            this.btnRender.sprite = this.pressedSprite;
        }
        var pColor;
        if (! this.hasDisabled) {
            pColor = this.pressedColor;
        }
        else {
            pColor = this.disabledColor;
        }
        this.btnRender.color = pColor;
        if (this.onMousedown) {
            this.onMousedown(event);
        }
    },
    // 释放
    _onButtonUpEvent: function (event) {
        var nColor;
        if (! this.hasDisabled) {
            nColor = this._normalColor;
        }
        else {
            nColor = this.disabledColor;
        }
        this.btnRender.color = nColor;
        this.btnRender.sprite = this._normalSprite;
        // 触发事件
        if (this.onClick) {
            this.onClick(event);
        }
    },
    // 进入
    _onButtonEnterEvent: function () {
        var hColor;
        if (! this.hasDisabled) {
            hColor = this.hoverColor;
        }
        else {
            hColor = this.disabledColor;
        }
        this.btnRender.color = hColor;
        if (this.hoverSprite) {
            this.btnRender.sprite = this.hoverSprite;
        }
    },
    // 移开
    _onButtonLeaveEvent: function () {
        var nColor;
        if (! this.hasDisabled) {
            nColor = this._normalColor;
        }
        else {
            nColor = this.disabledColor;
        }
        this.btnRender.color = nColor;
        this.btnRender.sprite = this._normalSprite;
    },
    // 设置禁用
    setDisabled: function (value) {
        this.hasDisabled = value;
        var nColor;
        if (value) {
            nColor = this.disabledColor;
        }
        else {
            if (! this._normalColor) {
                this._normalColor = this.btnRender.color;
            }
            nColor = this._normalColor || Fire.Color.white;
        }
        this.btnRender.color = nColor;
    },
    // 设置文字
    setText: function (value) {
        this.textContent.text = value;
    },
    // 设置按钮坐标
    setPostition: function (posValue) {
        this.entity.transform.position = posValue;
    },
    // 设置图片大小
    setCustomSize: function (w, h) {
        if (w === -1 || h === -1) {
            this.btnRender.useCustomSize = false;
            return;
        }
        this.btnRender.useCustomSize = true;
        this.btnRender.customWidth = w;
        this.btnRender.customHeight = h;
    },
    // 设置按钮纹理
    setSprite: function (newSprite) {
        this.btnRender.sprite = newSprite;
        this._normalSprite = newSprite;
        this.hoverSprite = newSprite;
        this.pressedSprite = newSprite;
    },
    // 设置按钮纹理
    setImage: function (image) {
        this.image = image;
        var newSprite = new Fire.Sprite(image);
        newSprite.pixelLevelHitTest = true;
        this.btnRender.sprite = newSprite;
        this._normalSprite = newSprite;
        this.hoverSprite = newSprite;
        this.pressedSprite = newSprite;
    },
    // 载入时
    onLoad: function () {
        if (! this._normalColor) {
            this._normalColor = this.btnRender.color;
        }
        if (! this._normalSprite) {
            this._normalSprite = this.btnRender.sprite;
        }
    },
    // 开始
    start: function () {
        this.entity.on('mousedown', this._onButtonDownEventBind);
        this.entity.on('mouseup', this._onButtonUpEventBind);
        this.entity.on('mouseenter', this._onButtonEnterEventBind);
        this.entity.on('mouseleave', this._onButtonLeaveEventBind);
    },
    //
    onEnable: function () {
        var nColor;
        if (! this.hasDisabled) {
            nColor = this._normalColor || Fire.Color.white;
        }
        else {
            nColor = this.disabledColor;
        }
        this.btnRender.color = nColor;
        this.btnRender.sprite = this._normalSprite;
    },
    // 销毁时
    onDestroy: function () {
        this.entity.off('mousedown', this._onButtonDownEventBind);
        this.entity.off('mouseup', this._onButtonUpEventBind);
        this.entity.off('mouseenter', this._onButtonEnterEventBind);
        this.entity.off('mouseleave', this._onButtonLeaveEventBind);
    }
});

Fire.UIButton = UIButton;

Fire._RFpop();
},{}],"UIPopupList":[function(require,module,exports){
Fire._RFpush(module, '6f33aBDWwFK0ZfbBnFy5zVu', 'UIPopupList');
// script\common\UIPopupList.js

var RoomType = Fire.defineEnum({
    livingRoom: -1,  //客厅
    bedRoom: -1,     //卧室
    kitchen: -1,     //厨房
    bathroom: -1,    //浴室
    study: -1,       //书房
    gym: -1,         //健身房
    balcony: -1,     //阳台
    garden: -1       //花园
});

// 下拉列表
var UIPopupList = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        this.roomTypeList = [];
        this.bindShowListEvent = this.onShowListEvent.bind(this);
    },
    //
    properties: {
        // 房间类型
        roomType: -1,
        // 点击区域弹出列表
        btn_roomType: {
            default: null,
            type: Fire.UIButton
        },
        // 下拉列表
        drodownList: {
            default: null,
            type: Fire.Entity
        }
    },
    // 显示下拉列表
    onShowListEvent: function () {
        this.drodownList.active = !this.drodownList.active;
    },
    // 获取房间类型文字
    _getRoomTypeText: function (type) {
        var str = '选择类型..';
        switch(type){
            case 1:
                str = '客厅';
                break;
            case 2:
                str = '卧室';
                break;
            case 3:
                str = '厨房';
                break;
            case 4:
                str = '浴室';
                break;
            case 5:
                str = '书房';
                break;
            case 6:
                str = '健身房';
                break;
            case 7:
                str = '阳台';
                break;
            case 8:
                str = '花园';
                break;
        }
        return str;
    },
    // 选择类型
    onSelectTypeEvent: function (event) {
        this.drodownList.active = false;
        this.roomType = parseInt(event.target.name);
        this.btn_roomType.setText(this._getRoomTypeText(this.roomType));
    },
    // 鼠标按下
    onMouseDownEvent: function (event) {
        if (this.drodownList.active && this.roomTypeList.indexOf(event.target) === -1) {
            this.drodownList.active = false;
        }
    },
    // 初始化下拉列表
    _iniiDropDownList: function () {
        this.roomTypeList = [];
        var index = 1;
        for (var i in RoomType) {
            var ent = Fire.instantiate(this.sdataBase.tempRoomType);
            ent.parent = this.drodownList;
            ent.transform.position = new Fire.Vec2(0, 180 - ((index - 1) * 50));
            ent.name = index;
            var btn = ent.getComponent(Fire.UIButton);
            btn.setText(this._getRoomTypeText(index));
            btn.onClick = this.onSelectTypeEvent.bind(this);
            this.roomTypeList.push(ent);
            index++;
        }
    },
    // 开始
    start: function () {
        // 常用的变量/数据
        var ent = Fire.Entity.find('/SDataBase');
        this.sdataBase = ent.getComponent('SDataBase');
        // 打开下拉菜单
        this.btn_roomType.onClick = this.bindShowListEvent;
        //
        this._iniiDropDownList();
        //
        this.bindedMouseDownEvent = this.onMouseDownEvent.bind(this);
        Fire.Input.on('mousedown', this.bindedMouseDownEvent);
    },
    onDestroy: function() {
        Fire.Input.off('mousedown', this.bindedMouseDownEvent);
    }
});
Fire.UIPopupList = UIPopupList;

Fire._RFpop();
},{}],"sprite-animation-clip":[function(require,module,exports){
Fire._RFpush(module, 'sprite-animation-clip');
// sprite-animation-clip.js

(function () {

/**
 * @class SpriteAnimationClip
 */

/**
 * @enum SpriteAnimationClip.WrapMode
 */
var WrapMode = Fire.defineEnum({
    /**
     * @property Default
     * @type {number}
     */
    Default: -1,
    /**
     * @property Once
     * @type {number}
     */
    Once: -1,
    /**
     * @property Loop
     * @type {number}
     */
    Loop: -1,
    /**
     * @property PingPong
     * @type {number}
     */
    PingPong: -1,
    /**
     * @property ClampForever
     * @type {number}
     */
    ClampForever: -1
});

/**
 * @enum SpriteAnimationClip.StopAction
 */
var StopAction = Fire.defineEnum({
    /**
     * Do nothing
     * @property DoNothing
     * @type {number}
     */
    DoNothing: -1,
    /**
     * Set to default sprite when the sprite animation stopped
     * @property DefaultSprite
     * @type {number}
     */
    DefaultSprite: 1,
    /**
     * Hide the sprite when the sprite animation stopped
     * @property Hide
     * @type {number}
     */
    Hide: -1,
    /**
     * Destroy the entity the sprite belongs to when the sprite animation stopped
     * @property Destroy
     * @type {number}
     */
    Destroy: -1
});

// ------------------------------------------------------------------
/// The structure to descrip a frame in the sprite animation clip
// ------------------------------------------------------------------
var FrameInfo = Fire.define('FrameInfo')
    .prop('sprite', null, Fire.ObjectType(Fire.Sprite))
    .prop('frames', 0, Fire.Integer_Obsoleted);

/**
 * The sprite animation clip.
 * @class SpriteAnimationClip
 * @extends CustomAsset
 * @constructor
 */
var SpriteAnimationClip = Fire.Class({
    name: 'Fire.SpriteAnimationClip',
    //
    extends: Fire.CustomAsset,
    //
    constructor: function() {
        // the array of the end frame of each frame info
        this._frameInfoFrames = null;
    },
    //
    properties: {
        /**
         * Default wrap mode.
         * @property wrapMode
         * @type {SpriteAnimationClip.WrapMode}
         * @default SpriteAnimationClip.WrapMode.Default
         */
        wrapMode: {
            default: WrapMode.Default,
            type: WrapMode
        },
        /**
         * The default type of action used when the animation stopped.
         * @property stopAction
         * @type {SpriteAnimationClip.StopAction}
         * @default SpriteAnimationClip.StopAction.DoNothing
         */
        stopAction: {
            default: StopAction.DoNothing,
            type: StopAction
        },
        /**
        * The default speed of the animation clip.
        * @property speed
        * @type {number}
        * @default 1
        */
        speed: 1,
        //
        _frameRate: 60,
        /**
         * The sample rate used in this animation clip.
         * @property frameRate
         * @type {number}
         * @default 60
         */
        frameRate: {
            get: function() {
                return this._frameRate;
            },
            set: function() {
                if (value !== this._frameRate) {
                    this._frameRate = Math.round(Math.max(value, 1));
                }
            }
        },
        /**
         * The frame infos in the sprite animation clips.
         * are array of {sprite: Sprite, frames: Sustained_how_many_frames}
         * @property frameInfos
         * @type {object[]}
         * @default []
         */
        frameInfos:{
            default: [],
            type: FrameInfo
        }
    },
    //
    getTotalFrames: function() {
        var frames = 0;
        for (var i = 0; i < this.frameInfos.length; ++i) {
            frames += this.frameInfos[i].frames;
        }
        return frames;
    },
    //
    getFrameInfoFrames: function() {
        if (this._frameInfoFrames === null) {
            this._frameInfoFrames = new Array(this.frameInfos.length);
            var totalFrames = 0;
            for (var i = 0; i < this.frameInfos.length; ++i) {
                totalFrames += this.frameInfos[i].frames;
                this._frameInfoFrames[i] = totalFrames;
            }
        }
        return this._frameInfoFrames;
    }
});

SpriteAnimationClip.WrapMode = WrapMode;

SpriteAnimationClip.StopAction = StopAction;

Fire.addCustomAssetMenu(SpriteAnimationClip, "New Sprite Animation");

Fire.SpriteAnimationClip = SpriteAnimationClip;

module.exports = SpriteAnimationClip;
})();

Fire._RFpop();
},{}],"sprite-animation-state":[function(require,module,exports){
Fire._RFpush(module, 'sprite-animation-state');
// sprite-animation-state.js

(function () {
var SpriteAnimationClip = require('sprite-animation-clip');

/**
 * The sprite animation state.
 * @class SpriteAnimationState
 * @constructor
 * @param {SpriteAnimationClip} animClip
 */
var SpriteAnimationState = function (animClip) {
    if (!animClip) {
// @if DEV
        Fire.error('Unspecified sprite animation clip');
// @endif
        return;
    }
    /**
     * The name of the sprite animation state.
     * @property name
     * @type {string}
     */
    this.name = animClip.name;
    /**
     * The referenced sprite animation clip
     * @property clip
     * @type {SpriteAnimationClip}
     */
    this.clip = animClip;
    /**
     * The wrap mode
     * @property wrapMode
     * @type {SpriteAnimationClip.WrapMode}
     */
    this.wrapMode = animClip.wrapMode;
    /**
     * The stop action
     * @property stopAction
     * @type {SpriteAnimationClip.StopAction}
     */
    this.stopAction = animClip.stopAction;
    /**
     * The speed to play the sprite animation clip
     * @property speed
     * @type {number}
     */
    this.speed = animClip.speed;
    // the array of the end frame of each frame info in the sprite animation clip
    this._frameInfoFrames = animClip.getFrameInfoFrames();
    /**
     * The total frame count of the sprite animation clip
     * @property totalFrames
     * @type {number}
     */
    this.totalFrames = this._frameInfoFrames.length > 0 ? this._frameInfoFrames[this._frameInfoFrames.length - 1] : 0;
    /**
     * The length of the sprite animation in seconds with speed = 1.0f
     * @property length
     * @type {number}
     */
    this.length = this.totalFrames / animClip.frameRate;
    // The current index of frame. The value can be larger than totalFrames.
    // If the frame is larger than totalFrames it will be wrapped according to wrapMode.
    this.frame = -1;
    // the current time in seoncds
    this.time = 0;
    // cache result of GetCurrentIndex
    this._cachedIndex = -1;
};

/**
 * Recompute a new speed to make the duration of this animation equals to specified value.
 * @method setDuration
 * @param {number} duration - The expected duration.
 */
SpriteAnimationState.prototype.setDuration = function (duration) {
    this.speed = duration / this.length;
};

/**
 * The current frame info index.
 * @method getCurrentIndex
 * @return {number}
 */
SpriteAnimationState.prototype.getCurrentIndex = function () {
    if (this.totalFrames > 1) {
        //int oldFrame = frame;
        this.frame = Math.floor(this.time * this.clip.frameRate);
        if (this.frame < 0) {
            this.frame = -this.frame;
        }

        var wrappedIndex;
        if (this.wrapMode !== SpriteAnimationClip.WrapMode.PingPong) {
            wrappedIndex = _wrap(this.frame, this.totalFrames - 1, this.wrapMode);
        }
        else {
            wrappedIndex = this.frame;
            var cnt = Math.floor(wrappedIndex / this.totalFrames);
            wrappedIndex %= this.totalFrames;
            if ((cnt & 0x1) === 1) {
                wrappedIndex = this.totalFrames - 1 - wrappedIndex;
            }
        }

        // try to use cached frame info index
        if (this._cachedIndex - 1 >= 0 &&
            wrappedIndex >= this._frameInfoFrames[this._cachedIndex - 1] &&
            wrappedIndex < this._frameInfoFrames[this._cachedIndex]) {
            return this._cachedIndex;
        }

        // search frame info
        var frameInfoIndex = Fire.binarySearch(this._frameInfoFrames, wrappedIndex + 1);
        if (frameInfoIndex < 0) {
            frameInfoIndex = ~frameInfoIndex;
        }
        this._cachedIndex = frameInfoIndex;
        return frameInfoIndex;
    }
    else if (this.totalFrames === 1) {
        return 0;
    }
    else {
        return -1;
    }
};

function _wrap (_value, _maxValue, _wrapMode) {
    if (_maxValue === 0) {
        return 0;
    }
    if (_value < 0) {
        _value = -_value;
    }
    if (_wrapMode === SpriteAnimationClip.WrapMode.Loop) {
        return _value % (_maxValue + 1);
    }
    else if (_wrapMode === SpriteAnimationClip.WrapMode.PingPong) {
        var cnt = Math.floor(_value / _maxValue);
        _value %= _maxValue;
        if (cnt % 2 === 1) {
            return _maxValue - _value;
        }
    }
    else {
        if (_value < 0) {
            return 0;
        }
        if (_value > _maxValue) {
            return _maxValue;
        }
    }
    return _value;
}

Fire.SpriteAnimationState = SpriteAnimationState;

module.exports = SpriteAnimationState;
})();

Fire._RFpop();
},{"sprite-animation-clip":"sprite-animation-clip"}],"sprite-animation":[function(require,module,exports){
Fire._RFpush(module, 'sprite-animation');
// sprite-animation.js

(function () {
var SpriteAnimationClip = require('sprite-animation-clip');
var SpriteAnimationState = require('sprite-animation-state');

/**
 * The sprite animation Component.
 * @class SpriteAnimation
 * @extends Component
 * @constructor
 */
var SpriteAnimation = Fire.Class({
    //
    name: "Fire.SpriteAnimation",
    //
    extends: Fire.Component,
    //
    constructor: function() {
        this._nameToState = null;
        this._curAnimation = null;
        this._spriteRenderer = null;
        this._defaultSprite = null;
        this._lastFrameIndex = -1;
        this._curIndex = -1;
        this._playStartFrame = 0;// 在调用Play的当帧的LateUpdate不进行step
    },
    //
    properties:{
        /**
         * The default animation.
         * @property defaultAnimation
         * @type {SpriteAnimationClip}
         * @default null
         */
        defaultAnimation: {
            default: null,
            type: Fire.SpriteAnimationClip
        },
        /**
         * The Animated clip list.
         * @property animations
         * @type {SpriteAnimationClip[]}
         * @default []
         */
        animations: {
            default: [],
            type: Fire.SpriteAnimationClip
        },
        //
        _playAutomatically: true,
        /**
         * Should the default animation clip (Animation.clip) automatically start playing on startup.
         * @property playAutomatically
         * @type {boolean}
         * @default true
         */
        playAutomatically: {
            get: function() {
                return this._playAutomatically;
            },
            set: function (value) {
                this._playAutomatically = value;
            }
        }
    },
    //
    _init: function() {
        var initialized = (this._nameToState !== null);
        if (initialized === false) {
            this._spriteRenderer = this.entity.getComponent(Fire.SpriteRenderer);
            if (! this._spriteRenderer) {
                Fire.error("Can not play sprite animation because SpriteRenderer is not found");
            }
            else{
                this._defaultSprite = this._spriteRenderer.sprite;
            }

            this._nameToState = {};
            var state = null;
            for (var i = 0; i < this.animations.length; ++i) {
                var clip = this.animations[i];
                if (clip !== null) {
                    state = new SpriteAnimationState(clip);
                    this._nameToState[state.name] = state;
                }
            }

            if (this.defaultAnimation && !this.getAnimState(this.defaultAnimation.name)) {
                state = new SpriteAnimationState(this.defaultAnimation);
                this._nameToState[state.name] = state;
            }
        }
    },

    /**
     * Get Animation State.
     * @method getAnimState
     * @param {string} animName - The name of the animation
     * @return {SpriteAnimationState}
     */
    getAnimState: function (name) {
        return this._nameToState && this._nameToState[name];
    },
    /**
     * Indicates whether the animation is playing
     * @method isPlaying
     * @param {string} [name] - The name of the animation
     * @return {boolean}
     */
    isPlaying: function(name) {
        var playingAnim = this.enabled && this._curAnimation;
        return !!playingAnim && ( !name || playingAnim.name === name );
    },
    /**
     * Play Animation
     * @method play
     * @param {SpriteAnimationState} [animState] - The animState of the sprite Animation state or animation name
     * @param {number} [time] - The time of the animation time
     */
    play: function (animState, time) {
        if (typeof animState === 'string') {
            this._curAnimation = this.getAnimState(animState);
        }
        else {
            this._curAnimation = animState || new SpriteAnimationState(this.defaultAnimation);
        }

        if (this._curAnimation !== null) {
            this._curIndex = -1;
            this._curAnimation.time = time || 0;
            this._playStartFrame = Fire.Time.frameCount;
            this._sample();
        }
    },
    /**
     * Stop Animation
     * @method stop
     * @param {SpriteAnimationState} [animState] - The animState of the sprite animation state or animation name
     */
    stop: function (animState) {
        if (typeof animState === 'string') {
            this._curAnimation = this.getAnimState(animState);
        }
        else {
            this._curAnimation = animState || new SpriteAnimationState(this.defaultAnimation);
        }

        if (this._curAnimation !== null) {

            this._curAnimation.time = 0;

            var stopAction = this._curAnimation.stopAction;

            switch (stopAction) {
                case SpriteAnimationClip.StopAction.DoNothing:
                    break;
                case SpriteAnimationClip.StopAction.DefaultSprite:
                    this._spriteRenderer.sprite = this._defaultSprite;
                    break;
                case SpriteAnimationClip.StopAction.Hide:
                    this._spriteRenderer.enabled = false;
                    break;
                case SpriteAnimationClip.StopAction.Destroy:
                    this.entity.destroy();
                    break;
                default:
                    break;
            }

            this._curAnimation = null;
        }
    },
    onLoad: function() {
        this._init();
        if (this.enabled) {
            if (this._playAutomatically && this.defaultAnimation) {
                var animState = this.getAnimState(this.defaultAnimation.name);
                this.play(animState, 0);
            }
        }
    },
    lateUpdate: function() {
        if (this._curAnimation !== null && Fire.Time.frameCount > this._playStartFrame) {
            var delta = Fire.Time.deltaTime * this._curAnimation.speed;
            this._step(delta);
        }
    },
    _step: function (deltaTime) {
        if (this._curAnimation !== null) {
            this._curAnimation.time += deltaTime;
            this._sample();
            var stop = false;
            if (this._curAnimation.wrapMode === SpriteAnimationClip.WrapMode.Once ||
                this._curAnimation.wrapMode === SpriteAnimationClip.WrapMode.Default ||
                this._curAnimation.wrapMode === SpriteAnimationClip.WrapMode.ClampForever) {
                if (this._curAnimation.speed > 0 && this._curAnimation.frame >= this._curAnimation.totalFrames) {
                    if (this._curAnimation.wrapMode === SpriteAnimationClip.WrapMode.ClampForever) {
                        stop = false;
                        this._curAnimation.frame = this._curAnimation.totalFrames;
                        this._curAnimation.time = this._curAnimation.frame / this._curAnimation.clip.frameRate;
                    }
                    else {
                        stop = true;
                        this._curAnimation.frame = this._curAnimation.totalFrames;
                    }
                }
                else if (this._curAnimation.speed < 0 && this._curAnimation.frame < 0) {
                    if (this._curAnimation.wrapMode === SpriteAnimationClip.WrapMode.ClampForever) {
                        stop = false;
                        this._curAnimation.time = 0;
                        this._curAnimation.frame = 0;
                    }
                    else {
                        stop = true;
                        this._curAnimation.frame = 0;
                    }
                }
            }

            // do stop
            if (stop) {
                this.stop(this._curAnimation);
            }
        }
        else {
            this._curIndex = -1;
        }
    },
    _sample: function () {
        if (this._curAnimation !== null) {
            var newIndex = this._curAnimation.getCurrentIndex();
            if (newIndex >= 0 && newIndex !== this._curIndex) {
                this._spriteRenderer.sprite = this._curAnimation.clip.frameInfos[newIndex].sprite;
            }
            this._curIndex = newIndex;
        }
        else {
            this._curIndex = -1;
        }
    }
});

Fire.SpriteAnimation = SpriteAnimation;

Fire.addComponentMenu(SpriteAnimation, 'Sprite Animation');
})();

Fire._RFpop();
},{"sprite-animation-clip":"sprite-animation-clip","sprite-animation-state":"sprite-animation-state"}]},{},["sprite-animation-clip","sprite-animation-state","sprite-animation","Characters","GlobalData","Options","Toggle","Tools","UIButton","UIPopupList","MainMenu","MyAddFamilyWindow","ODataBase","PlanWindow","ServerNetWork","SubMenu","Tip_MyAdd","SControlMgr","Screenshot","SDataBase","SErrorPromptWindow","SFurniture","SLoadingTips","SMainMenuMgr","SMyDressUpData","SMyDressUpWindow","SNetworkMgr","SSaveRoomWindow","SSecondaryMenu","SSecondaryMenuMgr","SThreeMenu","SThreeMenuMgr","STipsWindow","ControlMgr","DataBase","FamilyInfo","FirstMenuMgr","FloorWindow","Furniture","MainMenuMgr","Merchandise","NetworkMgr","NewWorkWindow","OtherMenuMgr","PayMentWindow","PriceDescription","SecondMenu","SecondMenuMgr","SwitchRoomWindow","ThreeMenu","ThreeMenuMgr","TipLoad","TipsPayMent","TipsPayProblems","TipsWindow"])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2Rldi9iaW4vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInNjcmlwdC9jb21tb24vQ2hhcmFjdGVycy5qcyIsInNjcmlwdC92aWxsYS9Db250cm9sTWdyLmpzIiwic2NyaXB0L3ZpbGxhL0RhdGFCYXNlLmpzIiwic2NyaXB0L3ZpbGxhL0ZhbWlseUluZm8uanMiLCJzY3JpcHQvdmlsbGEvRmlyc3RNZW51TWdyLmpzIiwic2NyaXB0L3ZpbGxhL0Zsb29yV2luZG93LmpzIiwic2NyaXB0L3ZpbGxhL0Z1cm5pdHVyZS5qcyIsInNjcmlwdC9jb21tb24vR2xvYmFsRGF0YS5qcyIsInNjcmlwdC92aWxsYS9NYWluTWVudU1nci5qcyIsInNjcmlwdC9vdXRkb29yL01haW5NZW51LmpzIiwic2NyaXB0L3ZpbGxhL01lcmNoYW5kaXNlLmpzIiwic2NyaXB0L291dGRvb3IvTXlBZGRGYW1pbHlXaW5kb3cuanMiLCJzY3JpcHQvdmlsbGEvTmV0d29ya01nci5qcyIsInNjcmlwdC92aWxsYS9OZXdXb3JrV2luZG93LmpzIiwic2NyaXB0L291dGRvb3IvT0RhdGFCYXNlLmpzIiwic2NyaXB0L2NvbW1vbi9PcHRpb25zLmpzIiwic2NyaXB0L3ZpbGxhL090aGVyTWVudU1nci5qcyIsInNjcmlwdC92aWxsYS9QYXlNZW50V2luZG93LmpzIiwic2NyaXB0L291dGRvb3IvUGxhbldpbmRvdy5qcyIsInNjcmlwdC92aWxsYS9QcmljZURlc2NyaXB0aW9uLmpzIiwic2NyaXB0L3NpbmdsZS9TQ29udHJvbE1nci5qcyIsInNjcmlwdC9zaW5nbGUvU0RhdGFCYXNlLmpzIiwic2NyaXB0L3NpbmdsZS9TRXJyb3JQcm9tcHRXaW5kb3cuanMiLCJzY3JpcHQvc2luZ2xlL1NGdXJuaXR1cmUuanMiLCJzY3JpcHQvc2luZ2xlL1NMb2FkaW5nVGlwcy5qcyIsInNjcmlwdC9zaW5nbGUvU01haW5NZW51TWdyLmpzIiwic2NyaXB0L3NpbmdsZS9TTXlEcmVzc1VwRGF0YS5qcyIsInNjcmlwdC9zaW5nbGUvU015RHJlc3NVcFdpbmRvdy5qcyIsInNjcmlwdC9zaW5nbGUvU05ldHdvcmtNZ3IuanMiLCJzY3JpcHQvc2luZ2xlL1NTYXZlUm9vbVdpbmRvdy5qcyIsInNjcmlwdC9zaW5nbGUvU1NlY29uZGFyeU1lbnVNZ3IuanMiLCJzY3JpcHQvc2luZ2xlL1NTZWNvbmRhcnlNZW51LmpzIiwic2NyaXB0L3NpbmdsZS9TVGhyZWVNZW51TWdyLmpzIiwic2NyaXB0L3NpbmdsZS9TVGhyZWVNZW51LmpzIiwic2NyaXB0L3NpbmdsZS9TVGlwc1dpbmRvdy5qcyIsInNjcmlwdC9zaW5nbGUvU2NyZWVuc2hvdC5qcyIsInNjcmlwdC92aWxsYS9TZWNvbmRNZW51TWdyLmpzIiwic2NyaXB0L3ZpbGxhL1NlY29uZE1lbnUuanMiLCJzY3JpcHQvb3V0ZG9vci9TZXJ2ZXJOZXRXb3JrLmpzIiwic2NyaXB0L291dGRvb3IvU3ViTWVudS5qcyIsInNjcmlwdC92aWxsYS9Td2l0Y2hSb29tV2luZG93LmpzIiwic2NyaXB0L3ZpbGxhL1RocmVlTWVudU1nci5qcyIsInNjcmlwdC92aWxsYS9UaHJlZU1lbnUuanMiLCJzY3JpcHQvdmlsbGEvVGlwTG9hZC5qcyIsInNjcmlwdC9vdXRkb29yL1RpcF9NeUFkZC5qcyIsInNjcmlwdC92aWxsYS9UaXBzUGF5TWVudC5qcyIsInNjcmlwdC92aWxsYS9UaXBzUGF5UHJvYmxlbXMuanMiLCJzY3JpcHQvdmlsbGEvVGlwc1dpbmRvdy5qcyIsInNjcmlwdC9jb21tb24vVG9nZ2xlLmpzIiwic2NyaXB0L2NvbW1vbi9Ub29scy5qcyIsInNjcmlwdC9jb21tb24vVUlCdXR0b24uanMiLCJzY3JpcHQvY29tbW9uL1VJUG9wdXBMaXN0LmpzIiwic3ByaXRlLWFuaW1hdGlvbi1jbGlwLmpzIiwic3ByaXRlLWFuaW1hdGlvbi1zdGF0ZS5qcyIsInNwcml0ZS1hbmltYXRpb24uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2dUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOVFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDblBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1UUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM1VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BhQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6UEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoYUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMU1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25LQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnZTM3Y2RlSkZDWkNGcWNrNkMzNkRRQXcnLCAnQ2hhcmFjdGVycycpO1xuLy8gc2NyaXB0XFxjb21tb25cXENoYXJhY3RlcnMuanNcblxudmFyIENvbXAgPSBGaXJlLkNsYXNzKHtcbiAgICAvLyDnu6fmib9cbiAgICBleHRlbmRzOiBGaXJlLkNvbXBvbmVudCxcbiAgICAvLyDmnoTpgKDlh73mlbBcbiAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24gKCkge1xuICAgIH0sXG4gICAgLy8g5bGe5oCnXG4gICAgcHJvcGVydGllczoge1xuICAgICAgICBpbWFnZU1hcmdpbjogRmlyZS52MigxNTAwLCA4MDApLFxuICAgICAgICBob3N0OiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5TcHJpdGVSZW5kZXJlclxuICAgICAgICB9LFxuICAgICAgICBob3N0X25hbWU6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLkJpdG1hcFRleHRcbiAgICAgICAgfSxcbiAgICAgICAgdGVtcEZhbWlseToge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuRW50aXR5XG4gICAgICAgIH0sXG4gICAgICAgIGZhbWlseVJvb3Q6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLkVudGl0eVxuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyDlvIDlp4tcbiAgICBzdGFydDogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL0RhdGFCYXNlJyk7XG4gICAgICAgIGlmKCFlbnQpIHtcbiAgICAgICAgICAgIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9PRGF0YUJhc2UnKTtcbiAgICAgICAgICAgIHRoaXMuZGF0YUJhc2UgPSBlbnQuZ2V0Q29tcG9uZW50KCdPRGF0YUJhc2UnKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNle1xuICAgICAgICAgICAgdGhpcy5kYXRhQmFzZSA9IGVudC5nZXRDb21wb25lbnQoJ0RhdGFCYXNlJyk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgc2V0SG9zdDogZnVuY3Rpb24gKGltYWdlLCBuYW1lKSB7XG4gICAgICAgIHZhciBuZXdTcHJpdGUgPSBuZXcgRmlyZS5TcHJpdGUoaW1hZ2UpO1xuICAgICAgICBuZXdTcHJpdGUucGl4ZWxMZXZlbEhpdFRlc3QgPSB0cnVlO1xuICAgICAgICB0aGlzLmhvc3RfbmFtZS50ZXh0ID0gbmFtZTtcbiAgICAgICAgdGhpcy5ob3N0LnNwcml0ZSA9IG5ld1Nwcml0ZVxuICAgICAgICB0aGlzLmRhdGFCYXNlLmdsb2JhbERhdGEuaG9zdFNwcml0ZSA9IG5ld1Nwcml0ZTtcbiAgICAgICAgdGhpcy5kYXRhQmFzZS5nbG9iYWxEYXRhLmhvc3ROYW1lID0gbmFtZTtcbiAgICB9LFxuXG4gICAgYWRkRmFtaWx5OiBmdW5jdGlvbiAoaW1hZ2UsIG5hbWUpIHtcbiAgICAgICAgdmFyIGVudCA9IEZpcmUuaW5zdGFudGlhdGUodGhpcy50ZW1wRmFtaWx5KTtcbiAgICAgICAgZW50LnBhcmVudCA9IHRoaXMuZmFtaWx5Um9vdDtcbiAgICAgICAgZW50LnBvc2l0aW9uID0gbmV3IEZpcmUuVmVjMigwLCAwKTtcbiAgICAgICAgdmFyIHJlbmRlciA9IGVudC5nZXRDb21wb25lbnQoRmlyZS5TcHJpdGVSZW5kZXJlcik7XG4gICAgICAgIHJlbmRlci5zcHJpdGUgPSBuZXcgRmlyZS5TcHJpdGUoaW1hZ2UpO1xuICAgICAgICByZW5kZXIuc3ByaXRlLnBpeGVsTGV2ZWxIaXRUZXN0ID0gdHJ1ZTtcbiAgICAgICAgdmFyIGZhbWlseV9uYW1lID0gZW50LmZpbmQoJ2ZhbWlseV9uYW1lJykuZ2V0Q29tcG9uZW50KEZpcmUuQml0bWFwVGV4dCk7XG4gICAgICAgIGZhbWlseV9uYW1lLnRleHQgPSBuYW1lO1xuICAgICAgICByZXR1cm4gZW50O1xuICAgIH0sXG5cbiAgICB1cGRhdGVGYW1pbHk6IGZ1bmN0aW9uIChlbnQsIGltYWdlLCBuYW1lKSB7XG4gICAgICAgIGVudC5wYXJlbnQgPSB0aGlzLmZhbWlseVJvb3Q7XG4gICAgICAgIGVudC5wb3NpdGlvbiA9IG5ldyBGaXJlLlZlYzIoMCwgMCk7XG4gICAgICAgIHZhciByZW5kZXIgPSBlbnQuZ2V0Q29tcG9uZW50KEZpcmUuU3ByaXRlUmVuZGVyZXIpO1xuICAgICAgICByZW5kZXIuc3ByaXRlID0gbmV3IEZpcmUuU3ByaXRlKGltYWdlKTtcbiAgICAgICAgcmVuZGVyLnNwcml0ZS5waXhlbExldmVsSGl0VGVzdCA9IHRydWVcbiAgICAgICAgdmFyIGZhbWlseV9uYW1lID0gZW50LmZpbmQoJ2ZhbWlseV9uYW1lJykuZ2V0Q29tcG9uZW50KEZpcmUuQml0bWFwVGV4dCk7XG4gICAgICAgIGZhbWlseV9uYW1lLnRleHQgPSBuYW1lO1xuICAgIH0sXG5cbiAgICAvLyDmm7TmlrBcbiAgICB1cGRhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGNhbWVyYSA9IEZpcmUuQ2FtZXJhLm1haW47XG4gICAgICAgIHZhciBiZ1dvcmxkQm91bmRzID0gdGhpcy5kYXRhQmFzZS5iZ1JlbmRlci5nZXRXb3JsZEJvdW5kcygpO1xuICAgICAgICB2YXIgYmdMZWZ0VG9wV29ybGRQb3MgPSBuZXcgRmlyZS5WZWMyKGJnV29ybGRCb3VuZHMueE1pbiArIHRoaXMuaW1hZ2VNYXJnaW4ueCwgYmdXb3JsZEJvdW5kcy55TWluICsgdGhpcy5pbWFnZU1hcmdpbi55KTtcbiAgICAgICAgdmFyIGJnbGVmdFRvcCA9IGNhbWVyYS53b3JsZFRvU2NyZWVuKGJnTGVmdFRvcFdvcmxkUG9zKTtcbiAgICAgICAgdmFyIHNjcmVlblBvcyA9IG5ldyBGaXJlLlZlYzIoYmdsZWZ0VG9wLngsIGJnbGVmdFRvcC55KTtcbiAgICAgICAgdmFyIHdvcmxkUG9zID0gY2FtZXJhLnNjcmVlblRvV29ybGQoc2NyZWVuUG9zKTtcbiAgICAgICAgdGhpcy5lbnRpdHkudHJhbnNmb3JtLndvcmxkUG9zaXRpb24gPSB3b3JsZFBvcztcblxuICAgIH1cbn0pO1xuXG5GaXJlLl9SRnBvcCgpOyIsIkZpcmUuX1JGcHVzaChtb2R1bGUsICdhYjIwZjlpc2FCTlQ0YUxzZ2Nid0VBUScsICdDb250cm9sTWdyJyk7XG4vLyBzY3JpcHRcXHZpbGxhXFxDb250cm9sTWdyLmpzXG5cbi8vIOeUqOaIt+i+k+WFpeeuoeeQhuexu1xudmFyIENvbnRyb2xNZ3IgPSBGaXJlLkNsYXNzKHtcbiAgICAvLyDnu6fmib9cbiAgICBleHRlbmRzOiBGaXJlLkNvbXBvbmVudCxcbiAgICAvLyDmnoTpgKDlh73mlbBcbiAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmJpbmRlZE1vdXNlRG93bkV2ZW50ID0gdGhpcy5fb25Nb3VzZURvd25FdmVudC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmJpbmRlZE1vdXNlTW92ZUV2ZW50ID0gdGhpcy5fb25Nb3VzZU1vdmVFdmVudC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmJpbmRlZE1vdXNlVXBFdmVudCA9IHRoaXMuX29uTW91c2VVcEV2ZW50LmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuX2JhY2t1cFNlbGVjdFRhcmdldCA9IG51bGw7XG4gICAgfSxcbiAgICAvLyDlsZ7mgKdcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIF9zZWxlY3RUYXJnZXQ6IG51bGwsXG4gICAgICAgIF9sYXN0U2VsZWN0VGFyZ2V0OiBudWxsLFxuICAgICAgICBfc2VsZWN0VGFyZ2V0SW5pdFBvczogRmlyZS5WZWMyLnplcm8sXG4gICAgICAgIF9tb3VzZURvd25Qb3M6IEZpcmUuVmVjMi56ZXJvLFxuICAgICAgICBfaGFzTW92ZVRhcmdldDogZmFsc2VcbiAgICB9LFxuICAgIC8vIOm8oOagh+aMieS4i+S6i+S7tlxuICAgIF9vbk1vdXNlRG93bkV2ZW50OiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgdmFyIHRhcmdldCA9IGV2ZW50LnRhcmdldDtcbiAgICAgICAgaWYgKCF0YXJnZXQgKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGVudCA9IHRhcmdldC5wYXJlbnQgfHwgdGFyZ2V0O1xuICAgICAgICB2YXIgZnVybml0dXJlID0gZW50LmdldENvbXBvbmVudCgnRnVybml0dXJlJyk7XG4gICAgICAgIC8vIOWkp+S6jjIg6K+05piO5Y+v5Lul5ouW5YqoXG4gICAgICAgIGlmIChmdXJuaXR1cmUgJiYgZnVybml0dXJlLnByb3BzX3R5cGUgPiAyKSB7XG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgdGhpcy5fc2VsZWN0VGFyZ2V0ID0gZW50O1xuICAgICAgICAgICAgdGhpcy5fYmFja3VwU2VsZWN0VGFyZ2V0ID0gdGhpcy5fc2VsZWN0VGFyZ2V0O1xuICAgICAgICAgICAgdGhpcy5fc2VsZWN0VGFyZ2V0SW5pdFBvcyA9IGVudC50cmFuc2Zvcm0ucG9zaXRpb247XG4gICAgICAgICAgICB2YXIgc2NyZWVuZFBvcyA9IG5ldyBGaXJlLlZlYzIoZXZlbnQuc2NyZWVuWCwgZXZlbnQuc2NyZWVuWSk7XG4gICAgICAgICAgICB0aGlzLl9tb3VzZURvd25Qb3MgPSBGaXJlLkNhbWVyYS5tYWluLnNjcmVlblRvV29ybGQoc2NyZWVuZFBvcyk7XG4gICAgICAgICAgICB0aGlzLl9zZWxlY3RUYXJnZXQuc2V0QXNMYXN0U2libGluZygpO1xuICAgICAgICAgICAgdGhpcy5faGFzTW92ZVRhcmdldCA9IHRydWU7XG4gICAgICAgICAgICAvLyDmmK/lkKbmiZPlvIDmjqfliLbpgInpobnvvIzlpoLmnpzmmK/nm7jlkIznmoTlr7nosaHlsLHkuI3pnIDopoHph43mlrDmiZPlvIBcbiAgICAgICAgICAgIGlmICh0aGlzLl9zZWxlY3RUYXJnZXQgIT09IHRoaXMuX2xhc3RTZWxlY3RUYXJnZXQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFCYXNlLm9wdGlvbnMub3Blbih0aGlzLl9zZWxlY3RUYXJnZXQpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2xhc3RTZWxlY3RUYXJnZXQgPSB0aGlzLl9zZWxlY3RUYXJnZXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmRhdGFCYXNlLnRocmVlTWVudU1nci5jbG9zZU1lbnUodHJ1ZSk7XG4gICAgICAgICAgICB0aGlzLmRhdGFCYXNlLnNlY29uZE1lbnVNZ3IuY2xvc2VNZW51KHRydWUpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKHRoaXMuZGF0YUJhc2Uub3B0aW9ucy5oYXNPcGVuKCkpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5kYXRhQmFzZS5vcHRpb25zLmhhc1RvdWNoKHRhcmdldCkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2VsZWN0VGFyZ2V0ID0gdGhpcy5fYmFja3VwU2VsZWN0VGFyZ2V0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc2VsZWN0VGFyZ2V0ID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRhQmFzZS5vcHRpb25zLmhpZGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIOm8oOagh+enu+WKqOS6i+S7tlxuICAgIF9vbk1vdXNlTW92ZUV2ZW50OiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgaWYgKHRoaXMuX3NlbGVjdFRhcmdldCAmJiB0aGlzLl9oYXNNb3ZlVGFyZ2V0KSB7XG4gICAgICAgICAgICB0aGlzLl9tb3ZlKGV2ZW50KTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy8g56e75Yqo5a625YW3XG4gICAgX21vdmU6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICB2YXIgbW92ZVBvcyA9IG5ldyBGaXJlLlZlYzIoZXZlbnQuc2NyZWVuWCwgZXZlbnQuc2NyZWVuWSk7XG4gICAgICAgIHZhciBtb3ZlV29yZFBvcyA9IEZpcmUuQ2FtZXJhLm1haW4uc2NyZWVuVG9Xb3JsZChtb3ZlUG9zKTtcblxuICAgICAgICB2YXIgb2Zmc2V0V29yZFBvcyA9IEZpcmUuVmVjMi56ZXJvO1xuICAgICAgICBvZmZzZXRXb3JkUG9zLnggPSB0aGlzLl9tb3VzZURvd25Qb3MueCAtIG1vdmVXb3JkUG9zLng7XG4gICAgICAgIG9mZnNldFdvcmRQb3MueSA9IHRoaXMuX21vdXNlRG93blBvcy55IC0gbW92ZVdvcmRQb3MueTtcblxuICAgICAgICB0aGlzLl9zZWxlY3RUYXJnZXQudHJhbnNmb3JtLnggPSB0aGlzLl9zZWxlY3RUYXJnZXRJbml0UG9zLnggLSBvZmZzZXRXb3JkUG9zLng7XG4gICAgICAgIHRoaXMuX3NlbGVjdFRhcmdldC50cmFuc2Zvcm0ueSA9IHRoaXMuX3NlbGVjdFRhcmdldEluaXRQb3MueSAtIG9mZnNldFdvcmRQb3MueTtcblxuICAgICAgICB0aGlzLmRhdGFCYXNlLm9wdGlvbnMuc2V0UG9zKHRoaXMuX3NlbGVjdFRhcmdldC50cmFuc2Zvcm0ud29ybGRQb3NpdGlvbik7XG4gICAgfSxcbiAgICAvLyDpvKDmoIfph4rmlL7kuovku7ZcbiAgICBfb25Nb3VzZVVwRXZlbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5faGFzTW92ZVRhcmdldCA9IGZhbHNlO1xuICAgIH0sXG4gICAgLy8g6ZqQ6JeP5o6n5Yi26YCJ6aG5XG4gICAgX29uSGlkZUV2ZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuX3NlbGVjdFRhcmdldCA9IG51bGw7XG4gICAgICAgIHRoaXMuX2JhY2t1cFNlbGVjdFRhcmdldCA9IG51bGw7XG4gICAgICAgIHRoaXMuX2xhc3RTZWxlY3RUYXJnZXQgPSBudWxsO1xuICAgIH0sXG4gICAgLy8g5Y+N6L2s5pa55ZCRXG4gICAgX29uTWlycm9yRmxpcEV2ZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLl9zZWxlY3RUYXJnZXQpIHtcbiAgICAgICAgICAgIHZhciBzY2FsZVggPSB0aGlzLl9zZWxlY3RUYXJnZXQudHJhbnNmb3JtLnNjYWxlWDtcbiAgICAgICAgICAgIHRoaXMuX3NlbGVjdFRhcmdldC50cmFuc2Zvcm0uc2NhbGVYID0gc2NhbGVYID4gMSA/IC1zY2FsZVggOiBNYXRoLmFicyhzY2FsZVgpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyDliKDpmaTpgInmi6nlr7nosaFcbiAgICBfb25EZWxldGVUYXJnZXRFdmVudDogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgZnVybml0dXJlID0gdGhpcy5fc2VsZWN0VGFyZ2V0LmdldENvbXBvbmVudCgnRnVybml0dXJlJyk7XG4gICAgICAgIGlmIChmdXJuaXR1cmUuc3VpdF9pZCA+IDApIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmRhdGFCYXNlLmN1ckRyZXNzU3VpdC5wcmljZSA+IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFCYXNlLm9wdGlvbnMuaGlkZSgpO1xuICAgICAgICAgICAgICAgIHRoaXMuZGF0YUJhc2UudGlwc1dpbmRvdy5vcGVuVGlwc1dpbmRvdygn5a+55LiN6LW377yM5q2k54mp5ZOB5Li65aWX6KOF5Lit55qE54mp5ZOB77yMXFxuIOS4jeWPr+enu+mZpO+8jOivt+aVtOWll+i0reS5sCcpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciBpbmRleCA9IHRoaXMuZGF0YUJhc2UuY3VyRHJlc3NTdWl0LmZ1bnJuaXR1cmVMaXN0LmluZGV4T2YoZnVybml0dXJlKTtcbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggPiAtMSl7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0YUJhc2UuY3VyRHJlc3NTdWl0LmZ1bnJuaXR1cmVMaXN0LnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZ1cm5pdHVyZS5zZXRNYXJrVXNlKGZhbHNlKTtcbiAgICAgICAgdGhpcy5fc2VsZWN0VGFyZ2V0LmRlc3Ryb3koKTtcbiAgICAgICAgdGhpcy5fc2VsZWN0VGFyZ2V0ID0gbnVsbDtcbiAgICAgICAgdGhpcy5fYmFja3VwU2VsZWN0VGFyZ2V0ID0gbnVsbDtcbiAgICAgICAgdGhpcy5fbGFzdFNlbGVjdFRhcmdldCA9IG51bGw7XG4gICAgICAgIHRoaXMuZGF0YUJhc2Uub3B0aW9ucy5oaWRlKCk7XG4gICAgfSxcbiAgICAvLyDph43nva5cbiAgICByZXNldDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmRhdGFCYXNlLm9wdGlvbnMuaGlkZSgpO1xuICAgICAgICB0aGlzLl9zZWxlY3RUYXJnZXQgPSBudWxsO1xuICAgICAgICB0aGlzLl9iYWNrdXBTZWxlY3RUYXJnZXQgPSBudWxsO1xuICAgICAgICB0aGlzLl9sYXN0U2VsZWN0VGFyZ2V0ID0gbnVsbDtcbiAgICB9LFxuICAgIC8vIOe7keWumuS6i+S7tlxuICAgIHN0YXJ0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIOW4uOeUqOeahOWPmOmHjy/mlbDmja5cbiAgICAgICAgdmFyIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9EYXRhQmFzZScpO1xuICAgICAgICB0aGlzLmRhdGFCYXNlID0gZW50LmdldENvbXBvbmVudCgnRGF0YUJhc2UnKTtcblxuICAgICAgICBGaXJlLklucHV0Lm9uKCdtb3VzZWRvd24nLCB0aGlzLmJpbmRlZE1vdXNlRG93bkV2ZW50KTtcbiAgICAgICAgRmlyZS5JbnB1dC5vbignbW91c2Vtb3ZlJywgdGhpcy5iaW5kZWRNb3VzZU1vdmVFdmVudCk7XG4gICAgICAgIEZpcmUuSW5wdXQub24oJ21vdXNldXAnLCB0aGlzLmJpbmRlZE1vdXNlVXBFdmVudCk7XG4gICAgICAgIC8vXG4gICAgICAgIHRoaXMuZGF0YUJhc2Uub3B0aW9ucy5vbkhpZGVFdmVudCA9IHRoaXMuX29uSGlkZUV2ZW50LmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuZGF0YUJhc2Uub3B0aW9ucy5idG5fZGVsLm9uTW91c2Vkb3duID0gdGhpcy5fb25EZWxldGVUYXJnZXRFdmVudC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmRhdGFCYXNlLm9wdGlvbnMuYnRuX01pcnJvckZsaXAub25Nb3VzZWRvd24gPSB0aGlzLl9vbk1pcnJvckZsaXBFdmVudC5iaW5kKHRoaXMpO1xuICAgIH0sXG4gICAgLy8g6ZSA5q+BXG4gICAgb25EZXN0cm95OiBmdW5jdGlvbigpIHtcbiAgICAgICAgRmlyZS5JbnB1dC5vZmYoJ21vdXNlZG93bicsIHRoaXMuYmluZGVkTW91c2VEb3duRXZlbnQpO1xuICAgICAgICBGaXJlLklucHV0Lm9mZignbW91c2Vtb3ZlJywgdGhpcy5iaW5kZWRNb3VzZU1vdmVFdmVudCk7XG4gICAgICAgIEZpcmUuSW5wdXQub2ZmKCdtb3VzZXVwJywgdGhpcy5iaW5kZWRNb3VzZVVwRXZlbnQpO1xuICAgIH1cbn0pO1xuXG5GaXJlLl9SRnBvcCgpOyIsIkZpcmUuX1JGcHVzaChtb2R1bGUsICc0ZmIwZVlBNmtGT1ZLOE1vL1MycmovSCcsICdEYXRhQmFzZScpO1xuLy8gc2NyaXB0XFx2aWxsYVxcRGF0YUJhc2UuanNcblxuLy8gIOWtmOaUvumhueebrumcgOimgeeahOWPmOmHjy/mlbDmja4v5a+56LGhXG52YXIgRGF0YUJhdGEgPSBGaXJlLkNsYXNzKHtcbiAgICAvLyDnu6fmib9cbiAgICBleHRlbmRzOiBGaXJlLkNvbXBvbmVudCxcbiAgICAvLyDmnoTpgKDlh73mlbBcbiAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyDnlKjmiLfpkrHljIVcbiAgICAgICAgdGhpcy51c2VyY2MgPSAwO1xuICAgICAgICAvLyDmmK/lkKblj6/ku6Xkv53lrZhcbiAgICAgICAgdGhpcy5oYXNDYW5TYXZlID0gZmFsc2U7XG4gICAgICAgIC8vIOW9k+WJjealvOWxgklEXG4gICAgICAgIHRoaXMuZmxvb3JJZCA9IDA7XG4gICAgICAgIC8vIOW9k+WJjW1hcmtcbiAgICAgICAgdGhpcy5tYXJrID0gJyc7XG4gICAgICAgIC8vIOW9k+WJjeaIv+mXtFVJRFxuICAgICAgICB0aGlzLmhvdXNlX3VpZCA9IDA7XG4gICAgICAgIC8vIOW9k+WJjeaIv+mXtElEXG4gICAgICAgIHRoaXMucm9vbV9pZCA9IDA7XG4gICAgICAgIC8vIOW9k+WJjeaIv+mXtOWQjeensFxuICAgICAgICB0aGlzLnJvb21fbmFtZSA9ICcnO1xuICAgICAgICAvLyDpu5jorqTmiL/pl7TlnLDmnb/otYTmupBcbiAgICAgICAgdGhpcy5kZWZhdWx0X2RpYmFuID0gJyc7XG4gICAgICAgIC8vIOm7mOiupOaIv+mXtOWimeWjgei1hOa6kFxuICAgICAgICB0aGlzLmRlZmF1bHRfYmVpamluZyA9ICcnO1xuICAgICAgICAvLyDlvZPliY3oo4Xmia7nmoTlpZfoo4VcbiAgICAgICAgdGhpcy5jdXJEcmVzc1N1aXQgPSB7XG4gICAgICAgICAgICAvLyDlpZfoo4VJRFxuICAgICAgICAgICAgc3VpdF9pZDogMCxcbiAgICAgICAgICAgIC8vIOWll+ijheWwj+WbvlxuICAgICAgICAgICAgc3VpdF9pY29uOiBudWxsLFxuICAgICAgICAgICAgLy8g6IOM5YyFSURcbiAgICAgICAgICAgIHBhY2tfaWQ6IDAsXG4gICAgICAgICAgICAvLyDlpZfoo4XlkI3np7BcbiAgICAgICAgICAgIHN1aXRfbmFtZTogJycsXG4gICAgICAgICAgICAvLyDlpZfoo4XmnaXoh6rlk6rph4zvvIwxLuiDjOWMhSAyLuWVhuWfjlxuICAgICAgICAgICAgc3VpdF9mcm9tOiAxLFxuICAgICAgICAgICAgLy8g5aWX6KOF5Lu35qC8XG4gICAgICAgICAgICBwcmljZTogMCxcbiAgICAgICAgICAgIC8vIOaKmOaJo1xuICAgICAgICAgICAgZGlzY291bnQ6IDEsXG4gICAgICAgICAgICAvLyDlpZfoo4XliJfooahcbiAgICAgICAgICAgIGZ1bnJuaXR1cmVMaXN0OiBbXVxuICAgICAgICB9O1xuICAgICAgICAvLyDlvZPliY1cbiAgICAgICAgLy8g5LqM57qn6I+c5Y2V5Y2V5ZOB5pWw5o2u5YiX6KGoXG4gICAgICAgIHRoaXMuc2luZ2xlX1NlY29uZF9EYXRhU2hlZXRzID0gW107XG4gICAgICAgIC8vIOS4iee6p+iPnOWNleWNleWTgeaAu+aVsFxuICAgICAgICB0aGlzLnNpbmdsZV9UaHJlZV9Ub3RhbF9TaGVldHMgPSB7fTtcbiAgICAgICAgLy8g5LiJ57qn6I+c5Y2V5Y2V5ZOB5pWw5o2u5YiX6KGoXG4gICAgICAgIHRoaXMuc2luZ2xlX1RocmVlX0RhdGFTaGVldHMgPSB7fTtcbiAgICAgICAgLy8g5LiJ57qn6I+c5Y2V5Y2V5ZOB5aSn5Zu+6LWE5rqQ5YiX6KGoXG4gICAgICAgIHRoaXMuc2luZ2xlX1RocmVlX0JpZ0ltYWdlID0ge307XG4gICAgICAgIC8vIOS6jOe6p+iPnOWNleWll+ijheaAu+aVsFxuICAgICAgICB0aGlzLnN1aXRJdGVtc19UaHJlZV9Ub3RhbCA9IFtdO1xuICAgICAgICAvLyDkuoznuqfoj5zljZXlpZfoo4XmlbDmja7liJfooahcbiAgICAgICAgdGhpcy5zdWl0SXRlbXNfU2Vjb25kX0RhdGFTaGVldHMgPSBbXTtcbiAgICAgICAgLy8g54mp5ZOB5p+c5pWw5o2u5YiX6KGoXG4gICAgICAgIHRoaXMuYmFja3BhY2tfU2Vjb25kX0RhdGFTaGVldHMgPSBbXTtcbiAgICAgICAgLy8g54mp5ZOB5p+c5pWw5o2u5YiX6KGoXG4gICAgICAgIHRoaXMuYmFja3BhY2tfVGhyZWVfVG90YWxfU2hlZXRzID0gW107XG4gICAgICAgIHRoaXMuYmFja3BhY2tfVGhyZWVfRGF0YVNoZWV0cyA9IFtdO1xuICAgICAgICAvLyDnlKjkuo7liJvlu7rnvKnnlaXlm75cbiAgICAgICAgdGhpcy5jdHhUb0RyYXcgPSBudWxsO1xuICAgICAgICAvLyDnlKjkuo7mi43nhadcbiAgICAgICAgdGhpcy5mcmFtZUNvdW50ID0gLTE7XG4gICAgICAgIHRoaXMubmVlZEhpZGVFbnRMaXN0ID0gW107XG4gICAgICAgIC8vIOiDjOaZr+S4juWcsOmdoueahOm7mOiupOWbvueJh1xuICAgICAgICB0aGlzLmJhY2tncm91bmQgPSBudWxsO1xuICAgICAgICB0aGlzLmdyb3VuZCA9IG51bGw7XG4gICAgICAgIC8vIOWIneWni+WMluWcuuaZr+WtkOWFg+e0oFxuICAgICAgICB0aGlzLmRlZmF1bHRTY3JlZW5DaGlsZHMgPSBudWxsO1xuICAgICAgICAvLyDkv53lrZjmiYDmnInlm77niYdcbiAgICAgICAgdGhpcy5sb2FkSW1hZ2VMaXN0ID0ge307XG4gICAgICAgIC8vXG4gICAgICAgIHRoaXMuZmFtaWx5TGlzdCA9IG51bGw7XG4gICAgICAgIHRoaXMuZmFtaWx5R28gPSBudWxsO1xuICAgIH0sXG4gICAgLy8g6L295YWl5pe2XG4gICAgb25Mb2FkOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIOi9veWFpeaOp+S7tlxuICAgICAgICB0aGlzLmxvYWRDb250cm9scygpO1xuICAgICAgICBpZiAoIXRoaXMubmV0V29ya01nci5nZXRUb0tlblZhbHVlKCkpIHtcbiAgICAgICAgICAgIHRoaXMudG9LZW5UaXBXaW4uYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyDliJ3lp4vljJbmiL/pl7RcbiAgICAgICAgdmFyIHNlbmREYXRhID0ge307XG4gICAgICAgIGlmKHRoaXMuZ2xvYmFsRGF0YSAmJiB0aGlzLmdsb2JhbERhdGEuc2VuZERhdGEpe1xuICAgICAgICAgICAgc2VuZERhdGEgPSB0aGlzLmdsb2JhbERhdGEuc2VuZERhdGE7XG4gICAgICAgICAgICB0aGlzLmdsb2JhbERhdGEuc2VuZERhdGEgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgc2VuZERhdGEgPSB7XG4gICAgICAgICAgICAgICAgbWFyazogJycsXG4gICAgICAgICAgICAgICAgaG91c2VfdWlkOiAwXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgc2VsZi5sb2FkVGlwcy5vcGVuVGlwcygn5Yid5aeL5YyW5Zy65pmv77yM6K+356iN5ZCOLi4uJyk7XG4gICAgICAgIHNlbGYuaW50b1Jvb20oc2VuZERhdGEsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vIOi/memHjOWboOS4uuaYr+S4uuS6huS/neaMgem7mOiupOeahOiDjOaZr+i3n+WcsOadv+eahOWbvueJh1xuICAgICAgICAgICAgc2VsZi5zYXZlRGVmYXVsdERhdGEoKTtcbiAgICAgICAgICAgIHNlbGYubG9hZFRpcHMuY2xvc2VUaXBzKCk7XG5cbiAgICAgICAgICAgIGlmIChzZWxmLmdsb2JhbERhdGEpIHtcbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5nbG9iYWxEYXRhLmdvdG9UeXBlID09PSAyKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYudXBkYXRlQ2hhcmFjdGVycygpO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmNoYXJhY3RlcnMuZW50aXR5LmFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLm1haW5NZW51TWdyLm9uSG91c2VEcmVzc0V2ZW50KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgdXBkYXRlQ2hhcmFjdGVyczogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyDlsYvkuLvmlbDmja5cbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBpZiAoc2VsZi5mYW1pbHlMaXN0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHNlbGYuY2hhcmFjdGVycy5lbnRpdHkuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgICAgIHZhciBob3N0ID0gc2VsZi5mYW1pbHlMaXN0WzBdO1xuICAgICAgICAgICAgdmFyIGhvc3RfdXJsID0gaG9zdC5maWd1cmVfdXJsO1xuICAgICAgICAgICAgdmFyIGhvc3RfbmFtZSA9IGhvc3QudXNlcl9uYW1lO1xuICAgICAgICAgICAgc2VsZi5sb2FkSW1hZ2UoaG9zdF91cmwsIGZ1bmN0aW9uIChlcnJvciwgaW1hZ2UpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmNoYXJhY3RlcnMuc2V0SG9zdChpbWFnZSwgaG9zdF9uYW1lKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIC8vIOWutuS6uuaVsOaNrlxuICAgICAgICBpZiAoc2VsZi5mYW1pbHlMaXN0Lmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgIHZhciBmYW1pbHkgPSBzZWxmLmZhbWlseUxpc3RbMV07XG4gICAgICAgICAgICB2YXIgZmFtaWx5X3VybCA9IGZhbWlseS5maWd1cmVfdXJsO1xuICAgICAgICAgICAgdmFyIGZhbWlseV9uYW1lID0gZmFtaWx5LnJlbGF0aW9uX25hbWUgKyBcIiBcIiArIGZhbWlseS51c2VyX25hbWU7XG4gICAgICAgICAgICBzZWxmLmxvYWRJbWFnZShmYW1pbHlfdXJsLCBmdW5jdGlvbiAoZXJyb3IsIGltYWdlKSB7XG4gICAgICAgICAgICAgICAgaWYoc2VsZi5mYW1pbHlHbyl7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuY2hhcmFjdGVycy51cGRhdGVGYW1pbHkoc2VsZi5mYW1pbHlHbywgaW1hZ2UsIGZhbWlseV9uYW1lKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZXtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5mYW1pbHlHbyA9IHNlbGYuY2hhcmFjdGVycy5hZGRGYW1pbHkoaW1hZ2UsIGZhbWlseV9uYW1lKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyDkv53lrZjliJ3lp4vljJbmlbDmja7vvIjooajnpLrpnIDopoHov5vooYzoo4Xmia7vvIlcbiAgICBzYXZlRGVmYXVsdERhdGE6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5iYWNrZ3JvdW5kLnNhdmVEZWZhdWx0U3ByaXRlKCk7XG4gICAgICAgIHRoaXMuZ3JvdW5kLnNhdmVEZWZhdWx0U3ByaXRlKCk7XG4gICAgICAgIHRoaXMuZGVmYXVsdFNjcmVlbkNoaWxkcyA9IHRoaXMucm9vbS5nZXRDaGlsZHJlbigpO1xuICAgIH0sXG4gICAgLy8g6L295YWl5o6n5Lu2XG4gICAgbG9hZENvbnRyb2xzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIOiDjOaZr1xuICAgICAgICB2YXIgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL1Jvb20vYmFja2dyb3VuZCcpO1xuICAgICAgICB0aGlzLmJnUmVuZGVyID0gZW50LmdldENvbXBvbmVudChGaXJlLlNwcml0ZVJlbmRlcmVyKTtcbiAgICAgICAgdGhpcy5iYWNrZ3JvdW5kID0gZW50LmdldENvbXBvbmVudCgnRnVybml0dXJlJyk7XG4gICAgICAgIC8vIOWcsOadv1xuICAgICAgICBlbnQgPSBGaXJlLkVudGl0eS5maW5kKCcvUm9vbS9ncm91bmQnKTtcbiAgICAgICAgLy90aGlzLmdyb3VuZFJlbmRlciA9IGVudC5nZXRDb21wb25lbnQoRmlyZS5TcHJpdGVSZW5kZXJlcik7XG4gICAgICAgIHRoaXMuZ3JvdW5kID0gZW50LmdldENvbXBvbmVudCgnRnVybml0dXJlJyk7XG4gICAgICAgIC8vIOaIv+mXtOWktOiKgueCuVxuICAgICAgICB0aGlzLnJvb20gPSBGaXJlLkVudGl0eS5maW5kKCcvUm9vbScpO1xuICAgICAgICAvLyDmjqfliLbpgInpoblcbiAgICAgICAgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL09wdGlvbnMnKTtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gZW50LmdldENvbXBvbmVudCgnT3B0aW9ucycpO1xuICAgICAgICAvLyDkuoznuqflrZDoj5zljZXmqKHmnb9cbiAgICAgICAgdGhpcy50ZW1wU3ViU2Vjb25kTWVudSA9IHRoaXMuZW50aXR5LmZpbmQoJ1N1YlNlY29uZE1lbnUnKTtcbiAgICAgICAgLy8g5LiJ57qn5a2Q6I+c5Y2V5qih5p2/XG4gICAgICAgIHRoaXMudGVtcFN1YlRocmVlTWVudSA9IHRoaXMuZW50aXR5LmZpbmQoJ1N1YlRocmVlTWVudScpO1xuICAgICAgICAvLyDlrrblhbfmqKHmnb9cbiAgICAgICAgdGhpcy50ZW1wRnVybml0dXJlID0gdGhpcy5lbnRpdHkuZmluZCgnRnVybml0dXJlJyk7XG4gICAgICAgIC8vIOeUqOaIt+WutuW6reS/oeaBr+aooeadv1xuICAgICAgICB0aGlzLnRlbXBGYW1pbHlJbmZvID0gdGhpcy5lbnRpdHkuZmluZCgnRmFtaWx5SW5mbycpO1xuICAgICAgICAvLyDlubPpnaLlm77mqKHmnb9cbiAgICAgICAgdGhpcy50ZW1wUGxhbiA9IHRoaXMuZW50aXR5LmZpbmQoJ3BsYW4nKTtcbiAgICAgICAgLy8g572R57uc6L+e5o6lXG4gICAgICAgIHRoaXMubmV0V29ya01nciA9IHRoaXMuZW50aXR5LmdldENvbXBvbmVudCgnTmV0d29ya01ncicpO1xuICAgICAgICAvLyDkuLvoj5zljZVcbiAgICAgICAgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL01lbnVfTWFpbicpO1xuICAgICAgICB0aGlzLm1haW5NZW51TWdyID0gZW50LmdldENvbXBvbmVudCgnTWFpbk1lbnVNZ3InKTtcbiAgICAgICAgLy8g5LiA57qn6I+c5Y2VXG4gICAgICAgIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9NZW51X0ZpcnN0Jyk7XG4gICAgICAgIHRoaXMuZmlyc3RNZW51TWdyID0gZW50LmdldENvbXBvbmVudCgnRmlyc3RNZW51TWdyJyk7XG4gICAgICAgIC8vIOS6jOe6p+iPnOWNlVxuICAgICAgICBlbnQgPSBGaXJlLkVudGl0eS5maW5kKCcvTWVudV9TZWNvbmQnKTtcbiAgICAgICAgdGhpcy5zZWNvbmRNZW51TWdyID0gZW50LmdldENvbXBvbmVudCgnU2Vjb25kTWVudU1ncicpO1xuICAgICAgICAvLyDkuInnuqfnuqfoj5zljZVcbiAgICAgICAgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL01lbnVfVGhyZWUnKTtcbiAgICAgICAgdGhpcy50aHJlZU1lbnVNZ3IgPSBlbnQuZ2V0Q29tcG9uZW50KCdUaHJlZU1lbnVNZ3InKTtcbiAgICAgICAgLy8g5YW25LuW6I+c5Y2VXG4gICAgICAgIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9XaW5fRmxvb3InKTtcbiAgICAgICAgdGhpcy5mbG9vcldpbiA9IGVudC5nZXRDb21wb25lbnQoJ0Zsb29yV2luZG93Jyk7XG4gICAgICAgIC8vIOmHjeaWsOivt+axguacjeWKoeWZqOeql+WPo1xuICAgICAgICBlbnQgPSBGaXJlLkVudGl0eS5maW5kKCcvV2luX05ldFdvcmsnKTtcbiAgICAgICAgdGhpcy5uZXRXb3JrV2luID0gZW50LmdldENvbXBvbmVudCgnTmV3V29ya1dpbmRvdycpO1xuICAgICAgICAvLyDmsqHmnInnlKjmiLfkv6Hmga/nmoTmj5DnpLrnqpflj6NcbiAgICAgICAgdGhpcy50b0tlblRpcFdpbiA9IEZpcmUuRW50aXR5LmZpbmQoJy9XaW5fVG9rZW5UaXAnKTtcbiAgICAgICAgLy8g5bmz6Z2i5Zu+XG4gICAgICAgIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9XaW5fU3dpdGNoUm9vbScpO1xuICAgICAgICB0aGlzLnN3aXRjaFJvb21XaW4gPSBlbnQuZ2V0Q29tcG9uZW50KCdTd2l0Y2hSb29tV2luZG93Jyk7XG4gICAgICAgIC8vIOWKoOi9veaPkOekulxuICAgICAgICBlbnQgPSBGaXJlLkVudGl0eS5maW5kKCcvVGlwc19sb2FkJyk7XG4gICAgICAgIHRoaXMubG9hZFRpcHMgPSBlbnQuZ2V0Q29tcG9uZW50KCdUaXBMb2FkJyk7XG4gICAgICAgIC8vIOa4qemmqOaPkOekuueql+WPo1xuICAgICAgICBlbnQgPSBGaXJlLkVudGl0eS5maW5kKCcvVGlwc193aW5kb3cnKTtcbiAgICAgICAgdGhpcy50aXBzV2luZG93ID0gZW50LmdldENvbXBvbmVudCgnVGlwc1dpbmRvdycpO1xuICAgICAgICAvLyDotK3niannqpflj6NcbiAgICAgICAgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL1dpbl9QYXlNZW50Jyk7XG4gICAgICAgIHRoaXMucGF5TWVudFdpbmRvdyA9IGVudC5nZXRDb21wb25lbnQoJ1BheU1lbnRXaW5kb3cnKTtcbiAgICAgICAgLy8g6YeN572u56qX5Y+jXG4gICAgICAgIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9UaXBzX1BheU1lbnQnKTtcbiAgICAgICAgdGhpcy5wYXlNZW50VGlwcyA9IGVudC5nZXRDb21wb25lbnQoJ1RpcHNQYXlNZW50Jyk7XG4gICAgICAgIC8vIOaUr+S7mOmXrumimOeql+WPo1xuICAgICAgICBlbnQgPSBGaXJlLkVudGl0eS5maW5kKCcvVGlwc19QYXlQcm9ibGVtcycpO1xuICAgICAgICB0aGlzLnRpcHNQYXlQcm9ibGVtcyA9IGVudC5nZXRDb21wb25lbnQoJ1RpcHNQYXlQcm9ibGVtcycpO1xuICAgICAgICAvL1xuICAgICAgICBlbnQgPSBGaXJlLkVudGl0eS5maW5kKCcvQ2hhcmFjdGVycycpO1xuICAgICAgICB0aGlzLmNoYXJhY3RlcnMgPSBlbnQuZ2V0Q29tcG9uZW50KCdDaGFyYWN0ZXJzJyk7XG4gICAgICAgIC8vXG4gICAgICAgIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9HbG9iYWxEYXRhJyk7XG4gICAgICAgIGlmIChlbnQpIHtcbiAgICAgICAgICAgIHRoaXMuZ2xvYmFsRGF0YSA9IGVudC5nZXRDb21wb25lbnQoXCJHbG9iYWxEYXRhXCIpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyDkuIvovb3lm77niYdcbiAgICBsb2FkSW1hZ2U6IGZ1bmN0aW9uICh1cmwsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgaWYgKHNlbGYubG9hZEltYWdlTGlzdFt1cmxdKSB7XG4gICAgICAgICAgICB2YXIgaW1hZ2UgPSBzZWxmLmxvYWRJbWFnZUxpc3RbdXJsXTtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIGltYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvL3NlbGYubG9hZFRpcHMub3BlblRpcHMoJ+WKoOi9veWbvueJh+S4re+8jOivt+eojeWQji4uLicpO1xuICAgICAgICBGaXJlLkltYWdlTG9hZGVyKHVybCwgZnVuY3Rpb24gKGVycm9yLCBpbWFnZSkge1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyb3IsIGltYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vc2VsZi5sb2FkVGlwcy5jbG9zZVRpcHMoKTtcbiAgICAgICAgICAgIGlmIChpbWFnZSkge1xuICAgICAgICAgICAgICAgIHNlbGYubG9hZEltYWdlTGlzdFt1cmxdID0gaW1hZ2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLy8g5piv5ZCm6ZyA6KaB6LSt5LmwXG4gICAgaGFzUGF5OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBjaGlsZHJlbiA9IHRoaXMucm9vbS5nZXRDaGlsZHJlbigpO1xuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIHZhciBlbnQgPSBjaGlsZHJlbltpXTtcbiAgICAgICAgICAgIHZhciBmdXJuaXR1cmUgPSBlbnQuZ2V0Q29tcG9uZW50KCdGdXJuaXR1cmUnKTtcbiAgICAgICAgICAgIGlmIChmdXJuaXR1cmUucHJpY2UgPiAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGRyZXNzU3VpdCA9IHRoaXMuY3VyRHJlc3NTdWl0O1xuICAgICAgICBpZiAoZHJlc3NTdWl0LnByaWNlID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG4gICAgLy8g5piv5ZCm5pS55Y+Y5LqG6IOM5pmv5LiO5Zyw6Z2i55qE5p2Q6LSoXG4gICAgaGFzU2F2ZVJvb206IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGNoaWxkcmVuID0gdGhpcy5yb29tLmdldENoaWxkcmVuKCk7XG4gICAgICAgIGlmIChjaGlsZHJlbi5sZW5ndGggPiAyKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5iYWNrZ3JvdW5kLmltYWdlVXJsICE9PSB0aGlzLmRlZmF1bHRfYmVpamluZyB8fFxuICAgICAgICAgICAgdGhpcy5ncm91bmQuaW1hZ2VVcmwgIT09IHRoaXMuZGVmYXVsdF9kaWJhbiApIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIC8vaWYgKCEgdGhpcy5oYXNDYW5TYXZlKSB7XG4gICAgICAgIC8vICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgLy99XG4gICAgICAgIC8vdmFyIGN1clNwcml0ZSA9IHRoaXMuYmFja2dyb3VuZC5nZXRSZW5kZXJTcHJpdGUoKTtcbiAgICAgICAgLy92YXIgZGVmYXVsdFNwcml0ZSA9IHRoaXMuYmFja2dyb3VuZC5kZWZhdWx0U3ByaXRlO1xuICAgICAgICAvL2lmIChjdXJTcHJpdGUgIT09IGRlZmF1bHRTcHJpdGUpIHtcbiAgICAgICAgLy8gICAgcmV0dXJuIHRydWU7XG4gICAgICAgIC8vfVxuICAgICAgICAvL2N1clNwcml0ZSA9IHRoaXMuZ3JvdW5kLmdldFJlbmRlclNwcml0ZSgpO1xuICAgICAgICAvL2RlZmF1bHRTcHJpdGUgPSB0aGlzLmdyb3VuZC5kZWZhdWx0U3ByaXRlO1xuICAgICAgICAvL2lmIChjdXJTcHJpdGUgIT09IGRlZmF1bHRTcHJpdGUpIHtcbiAgICAgICAgLy8gICAgcmV0dXJuIHRydWU7XG4gICAgICAgIC8vfVxuICAgICAgICAvL3ZhciBoYXNTYW1lID0gZmFsc2UsIGNoaWxkcmVuID0gdGhpcy5yb29tLmdldENoaWxkcmVuKCk7XG4gICAgICAgIC8vZm9yKHZhciBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIC8vICAgIGhhc1NhbWUgPSB0aGlzLmRlZmF1bHRTY3JlZW5DaGlsZHNbaV0gPT09IGNoaWxkcmVuW2ldO1xuICAgICAgICAvLyAgICBpZiAoISBoYXNTYW1lKSB7XG4gICAgICAgIC8vICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgLy8gICAgfVxuICAgICAgICAvL31cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG4gICAgLy8g5riF56m65Zy65pmvXG4gICAgcmVzZXRTY3JlZW46IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICB2YXIgY2hpbGRyZW4gPSB0aGlzLnJvb20uZ2V0Q2hpbGRyZW4oKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDI7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY2hpbGRyZW5baV0uZGVzdHJveSgpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy8g5Yig6Zmk5aWX6KOFXG4gICAgcmVtb3ZlU3VpdDogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgZHJlc3NMaXN0ID0gdGhpcy5jdXJEcmVzc1N1aXQuZnVucm5pdHVyZUxpc3Q7XG4gICAgICAgIGlmIChkcmVzc0xpc3QpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZHJlc3NMaXN0Lmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNvbSA9IGRyZXNzTGlzdFtpXTtcbiAgICAgICAgICAgICAgICBpZiAoY29tLnByb3BzX3R5cGUgPiAyKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBlbnQgPSBjb20uZW50aXR5O1xuICAgICAgICAgICAgICAgICAgICBlbnQuZGVzdHJveSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLmN1ckRyZXNzU3VpdCA9IHtcbiAgICAgICAgICAgIC8vIOWll+ijhUlEXG4gICAgICAgICAgICBzdWl0X2lkOiAwLFxuICAgICAgICAgICAgLy8g5aWX6KOF5ZCN56ewXG4gICAgICAgICAgICBzdWl0X25hbWU6ICcnLFxuICAgICAgICAgICAgLy8g6IOM5YyFSURcbiAgICAgICAgICAgIHBhY2tfaWQ6IDAsXG4gICAgICAgICAgICAvLyDlpZfoo4XlsI/lm75cbiAgICAgICAgICAgIHN1aXRfaWNvbjogbnVsbCxcbiAgICAgICAgICAgIC8vIOWll+ijheadpeiHquWTqumHjO+8jDEu6IOM5YyFIDIu5ZWG5Z+OXG4gICAgICAgICAgICBzdWl0X2Zyb206IDEsXG4gICAgICAgICAgICAvLyDlpZfoo4Xku7fmoLxcbiAgICAgICAgICAgIHByaWNlOiAwLFxuICAgICAgICAgICAgLy8g5oqY5omjXG4gICAgICAgICAgICBkaXNjb3VudDogMSxcbiAgICAgICAgICAgIC8vIOWutuWFt+WIl+ihqFxuICAgICAgICAgICAgZnVucm5pdHVyZUxpc3Q6IFtdXG4gICAgICAgIH07XG4gICAgfSxcbiAgICAvLyDkv53lrZjoo4Xmia5cbiAgICBzYXZlUm9vbTogZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIHNlbmREYXRhID0ge1xuICAgICAgICAgICAgc3VpdF9pZDogc2VsZi5jdXJEcmVzc1N1aXQuc3VpdF9pZCxcbiAgICAgICAgICAgIHN1aXRfZnJvbTogc2VsZi5jdXJEcmVzc1N1aXQuc3VpdF9mcm9tLFxuICAgICAgICAgICAgZGF0YUxpc3Q6IFtdXG4gICAgICAgIH07XG4gICAgICAgIHZhciBkYXRhID0ge1xuICAgICAgICAgICAgcHJvZF9pZDogMCxcbiAgICAgICAgICAgIHBhY2tfaWQ6IDAsXG4gICAgICAgICAgICBwcm9kX3VpZDogMCxcbiAgICAgICAgICAgIHBvczogJycsXG4gICAgICAgICAgICByb3RhaW9uOiAwLFxuICAgICAgICAgICAgc2NhbGU6ICcnLFxuICAgICAgICAgICAgc3VpdF9pZDogMFxuICAgICAgICB9O1xuICAgICAgICB2YXIgY2hpbGRyZW4gPSB0aGlzLnJvb20uZ2V0Q2hpbGRyZW4oKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGVudCA9IGNoaWxkcmVuW2ldO1xuICAgICAgICAgICAgdmFyIGZ1cm5pdHVyZSA9IGVudC5nZXRDb21wb25lbnQoJ0Z1cm5pdHVyZScpO1xuICAgICAgICAgICAgZGF0YSA9IHtcbiAgICAgICAgICAgICAgICBwcm9kX2lkOiBmdXJuaXR1cmUucHJvcHNfaWQsXG4gICAgICAgICAgICAgICAgcGFja19pZDogZnVybml0dXJlLnBhY2tfaWQsXG4gICAgICAgICAgICAgICAgcHJvZF91aWQ6IGZ1cm5pdHVyZS5wcm9wc191aWQsXG4gICAgICAgICAgICAgICAgcG9zOiBlbnQudHJhbnNmb3JtLnggKyBcIjpcIiArIGVudC50cmFuc2Zvcm0ueSxcbiAgICAgICAgICAgICAgICByb3RhdGlvbjogZW50LnRyYW5zZm9ybS5yb3RhdGlvbixcbiAgICAgICAgICAgICAgICBzY2FsZTogZW50LnRyYW5zZm9ybS5zY2FsZVggKyBcIjpcIiArIGVudC50cmFuc2Zvcm0uc2NhbGVZLFxuICAgICAgICAgICAgICAgIHN1aXRfaWQ6IGZ1cm5pdHVyZS5zdWl0X2lkXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgc2VuZERhdGEuZGF0YUxpc3QucHVzaChkYXRhKTtcbiAgICAgICAgfVxuICAgICAgICBzZWxmLm5ldFdvcmtNZ3IuUmVxdWVzdFNhdmVSb29tKHNlbmREYXRhLCBmdW5jdGlvbiAoc2VydmVyRGF0YSkge1xuICAgICAgICAgICAgaWYgKHNlcnZlckRhdGEuc3RhdHVzID09PSAxMDAwMCkge1xuICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhzZXJ2ZXJEYXRhLnVzZXJjYyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgc2VsZi50aXBzV2luZG93Lm9wZW5UaXBzV2luZG93KHNlcnZlckRhdGEuZGVzYyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLy8g5Yib5bu65a625YW35Yiw5Zy65pmv5LitXG4gICAgY3JlYXRlRnVybml0dXJlVG9TY3JlZW46IGZ1bmN0aW9uIChkcmVzc0xpc3QsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgaWYgKGRyZXNzTGlzdC5sZW5ndGggPT09IDAgJiYgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGluZGV4ID0gMDtcbiAgICAgICAgZHJlc3NMaXN0LmZvckVhY2goZnVuY3Rpb24gKGRyZXNzKSB7XG4gICAgICAgICAgICB2YXIgZW50aXR5ID0gbnVsbCwgZnVybml0dXJlID0gbnVsbDtcbiAgICAgICAgICAgIHZhciBwcm9wc1R5cGUgPSBwYXJzZUludChkcmVzcy5wcm9wc1R5cGUpO1xuICAgICAgICAgICAgaWYgKHByb3BzVHlwZSA9PT0gMSkge1xuICAgICAgICAgICAgICAgIGVudGl0eSA9IHNlbGYucm9vbS5maW5kKCdiYWNrZ3JvdW5kJyk7XG4gICAgICAgICAgICAgICAgZnVybml0dXJlID0gZW50aXR5LmdldENvbXBvbmVudCgnRnVybml0dXJlJyk7XG4gICAgICAgICAgICAgICAgZnVybml0dXJlLnNldEZ1cm5pdHVyZURhdGEoZHJlc3MsIHRydWUpO1xuICAgICAgICAgICAgICAgIHNlbGYubG9hZFRpcHMub3BlblRpcHMoJ+WIm+W7uuWbvueJh+S4re+8jOivt+eojeWQji4uLicpO1xuICAgICAgICAgICAgICAgIHNlbGYubG9hZEltYWdlKGZ1cm5pdHVyZS5pbWFnZVVybCwgZnVuY3Rpb24gKGVycm9yLCBpbWFnZSkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmxvYWRUaXBzLmNsb3NlVGlwcygpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB2YXIgYmlnU3ByaXRlID0gbmV3IEZpcmUuU3ByaXRlKGltYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgZnVybml0dXJlLnNldFNwcml0ZShiaWdTcHJpdGUpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAocHJvcHNUeXBlID09PSAyKSB7XG4gICAgICAgICAgICAgICAgZW50aXR5ID0gc2VsZi5yb29tLmZpbmQoJ2dyb3VuZCcpO1xuICAgICAgICAgICAgICAgIGZ1cm5pdHVyZSA9IGVudGl0eS5nZXRDb21wb25lbnQoJ0Z1cm5pdHVyZScpO1xuICAgICAgICAgICAgICAgIGZ1cm5pdHVyZS5zZXRGdXJuaXR1cmVEYXRhKGRyZXNzLCB0cnVlKTtcbiAgICAgICAgICAgICAgICBzZWxmLmxvYWRUaXBzLm9wZW5UaXBzKCfliJvlu7rlm77niYfkuK3vvIzor7fnqI3lkI4uLi4nKTtcbiAgICAgICAgICAgICAgICBzZWxmLmxvYWRJbWFnZShmdXJuaXR1cmUuaW1hZ2VVcmwsIGZ1bmN0aW9uIChlcnJvciwgaW1hZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5sb2FkVGlwcy5jbG9zZVRpcHMoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdmFyIGJpZ1Nwcml0ZSA9IG5ldyBGaXJlLlNwcml0ZShpbWFnZSk7XG4gICAgICAgICAgICAgICAgICAgIGZ1cm5pdHVyZS5zZXRTcHJpdGUoYmlnU3ByaXRlKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGVudGl0eSA9IEZpcmUuaW5zdGFudGlhdGUoc2VsZi50ZW1wRnVybml0dXJlKTtcbiAgICAgICAgICAgICAgICBlbnRpdHkuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBlbnRpdHkucGFyZW50ID0gc2VsZi5yb29tO1xuICAgICAgICAgICAgICAgIGVudGl0eS5uYW1lID0gZHJlc3MucHJvcHNOYW1lO1xuICAgICAgICAgICAgICAgIC8vIOiuvue9ruWdkOagh1xuICAgICAgICAgICAgICAgIHZhciBuZXdWZWMyID0gbmV3IEZpcmUuVmVjMigpO1xuICAgICAgICAgICAgICAgIHZhciBzdHIgPSBkcmVzcy5wb3Muc3BsaXQoXCI6XCIpO1xuICAgICAgICAgICAgICAgIG5ld1ZlYzIueCA9IHBhcnNlRmxvYXQoc3RyWzBdKTtcbiAgICAgICAgICAgICAgICBuZXdWZWMyLnkgPSBwYXJzZUZsb2F0KHN0clsxXSk7XG4gICAgICAgICAgICAgICAgZW50aXR5LnRyYW5zZm9ybS5wb3NpdGlvbiA9IG5ld1ZlYzI7XG4gICAgICAgICAgICAgICAgLy8g6K6+572u6KeS5bqmXG4gICAgICAgICAgICAgICAgZW50aXR5LnRyYW5zZm9ybS5yb3RhdGlvbiA9IGRyZXNzLnJvdGF0aW9uO1xuICAgICAgICAgICAgICAgIC8vIOiuvue9ruWkp+Wwj1xuICAgICAgICAgICAgICAgIHN0ciA9IGRyZXNzLnNjYWxlLnNwbGl0KFwiOlwiKTtcbiAgICAgICAgICAgICAgICBuZXdWZWMyLnggPSBwYXJzZUZsb2F0KHN0clswXSk7XG4gICAgICAgICAgICAgICAgbmV3VmVjMi55ID0gcGFyc2VGbG9hdChzdHJbMV0pO1xuICAgICAgICAgICAgICAgIGVudGl0eS50cmFuc2Zvcm0uc2NhbGUgPSBuZXdWZWMyO1xuICAgICAgICAgICAgICAgIGZ1cm5pdHVyZSA9IGVudGl0eS5nZXRDb21wb25lbnQoJ0Z1cm5pdHVyZScpO1xuICAgICAgICAgICAgICAgIGZ1cm5pdHVyZS5zZXRGdXJuaXR1cmVEYXRhKGRyZXNzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIOWtmOWCqOWll+ijheWutuWFt1xuICAgICAgICAgICAgaWYgKGZ1cm5pdHVyZS5zdWl0X2lkID09PSBzZWxmLmN1ckRyZXNzU3VpdC5zdWl0X2lkKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5jdXJEcmVzc1N1aXQuZnVucm5pdHVyZUxpc3QucHVzaChmdXJuaXR1cmUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyDov5vlhaXmiL/pl7RcbiAgICBpbnRvUm9vbTogZnVuY3Rpb24gKHNlbmREYXRhLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHNlbGYubmV0V29ya01nci5SZXF1ZXN0SW50b0hvbWVEYXRhKHNlbmREYXRhLCBmdW5jdGlvbiAoc2VydmVyRGF0YSkge1xuICAgICAgICAgICAgaWYgKHNlcnZlckRhdGEuc3RhdHVzICE9PSAxMDAwMCkge1xuICAgICAgICAgICAgICAgIHNlbGYudGlwc1dpbmRvdy5vcGVuVGlwc1dpbmRvdyhzZXJ2ZXJEYXRhLmRlc2MpO1xuICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2VsZi5mbG9vcklkID0gc2VydmVyRGF0YS5mbG9vcklkO1xuICAgICAgICAgICAgc2VsZi5tYXJrID0gc2VydmVyRGF0YS5tYXJrO1xuICAgICAgICAgICAgc2VsZi5ob3VzZV91aWQgPSBzZXJ2ZXJEYXRhLmhvdXNlX3VpZDtcbiAgICAgICAgICAgIHNlbGYucm9vbV9pZCA9IHNlcnZlckRhdGEucm9vbV9pZDtcbiAgICAgICAgICAgIHNlbGYucm9vbV9uYW1lID0gc2VydmVyRGF0YS5yb29tX25hbWU7XG4gICAgICAgICAgICBzZWxmLmRlZmF1bHRfZGliYW4gPSBzZXJ2ZXJEYXRhLmRlZmF1bHRfZGliYW47XG4gICAgICAgICAgICBzZWxmLmRlZmF1bHRfYmVpamluZyA9IHNlcnZlckRhdGEuZGVmYXVsdF9iZWlqaW5nO1xuICAgICAgICAgICAgc2VsZi5tYWluTWVudU1nci5yZWZyZXNoQ3VySG9tZVR5cGUoc2VsZi5yb29tX25hbWUpO1xuICAgICAgICAgICAgc2VsZi5tYWluTWVudU1nci5yZWZyZXNoQ3VyVmlsbGFOYW1lKHNlcnZlckRhdGEudmlsbGFfbmFtZSk7XG5cbiAgICAgICAgICAgIHNlbGYuY2hhcmFjdGVycy5lbnRpdHkuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgICAgICBzZWxmLmZhbWlseUxpc3QgPSBzZXJ2ZXJEYXRhLmZhbWlseTtcblxuICAgICAgICAgICAgLy8g6I635Y+W5aWX6KOF5L+h5oGvXG4gICAgICAgICAgICBzZWxmLmN1ckRyZXNzU3VpdCA9IHtcbiAgICAgICAgICAgICAgICAvLyDlpZfoo4VJRFxuICAgICAgICAgICAgICAgIHN1aXRfaWQ6IHBhcnNlSW50KHNlcnZlckRhdGEuc3VpdF9pZCksXG4gICAgICAgICAgICAgICAgLy8g6IOM5YyFSURcbiAgICAgICAgICAgICAgICBwYWNrX2lkOiAwLFxuICAgICAgICAgICAgICAgIC8vIOWll+ijheWwj+WbvlxuICAgICAgICAgICAgICAgIHN1aXRfaWNvbjogbnVsbCxcbiAgICAgICAgICAgICAgICAvLyDlpZfoo4XlkI3np7BcbiAgICAgICAgICAgICAgICBzdWl0X25hbWU6ICcnLFxuICAgICAgICAgICAgICAgIC8vIOWll+ijheadpeiHquWTqumHjO+8jDEu6IOM5YyFIDIu5ZWG5Z+OXG4gICAgICAgICAgICAgICAgc3VpdF9mcm9tOiAxLFxuICAgICAgICAgICAgICAgIC8vIOWll+ijheS7t+agvFxuICAgICAgICAgICAgICAgIHByaWNlOiAwLFxuICAgICAgICAgICAgICAgIC8vIOaKmOaJo1xuICAgICAgICAgICAgICAgIGRpc2NvdW50OiAxLFxuICAgICAgICAgICAgICAgIC8vIOWll+ijheWIl+ihqFxuICAgICAgICAgICAgICAgIGZ1bnJuaXR1cmVMaXN0OiBbXVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIC8vIOa4heepuuWcuuaZr1xuICAgICAgICAgICAgc2VsZi5yZXNldFNjcmVlbigpO1xuICAgICAgICAgICAgLy8g5Yib5bu65a625YW35Yiw5Zy65pmv5LitXG4gICAgICAgICAgICBzZWxmLmNyZWF0ZUZ1cm5pdHVyZVRvU2NyZWVuKHNlcnZlckRhdGEuZHJlc3NMaXN0LCBjYWxsYmFjayk7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLy8g6aKE5Yqg6L295LqM57qn6I+c5Y2VIOWNleWTgeWutuWFt+aVsOaNrlxuICAgIHByZWxvYWRTaW5hZ2xlSXRlbXNEYXRhX1NlY29uZDogZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgc2VsZi5uZXRXb3JrTWdyLlJlcXVlc3RTaW5nbGVJdGVtc01lbnUoZnVuY3Rpb24gKHNlcnZlckRhdGEpIHtcbiAgICAgICAgICAgIGlmIChzZXJ2ZXJEYXRhLnN0YXR1cyAhPT0gMTAwMDApIHtcbiAgICAgICAgICAgICAgICBzZWxmLnRpcHNXaW5kb3cub3BlblRpcHNXaW5kb3coc2VydmVyRGF0YS5kZXNjKTtcbiAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHNlcnZlckRhdGEubGlzdCAmJiBzZXJ2ZXJEYXRhLmxpc3QubGVuZ3RoID09PSAwICYmIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgaW5kZXggPSAwO1xuICAgICAgICAgICAgc2VydmVyRGF0YS5saXN0LmZvckVhY2goZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICB2YXIgbG9hZEltYWdlQ2FsbEJhY2sgPSBmdW5jdGlvbiAoZGF0YSwgaW5kZXgsIGVycm9yLCBpbWFnZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBkYXRhLnNtYWxsU3ByaXRlID0gbmV3IEZpcmUuU3ByaXRlKGltYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhpbmRleCwgZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LmJpbmQodGhpcywgZGF0YSwgaW5kZXgpO1xuICAgICAgICAgICAgICAgIC8vIOS/neWtmOaVsOaNrlxuICAgICAgICAgICAgICAgIHNlbGYuc2luZ2xlX1NlY29uZF9EYXRhU2hlZXRzLnB1c2goZGF0YSk7XG4gICAgICAgICAgICAgICAgLy8g5Yqg6L295Zu+54mHXG4gICAgICAgICAgICAgICAgLy9zZWxmLmxvYWRJbWFnZShkYXRhLnVybCwgbG9hZEltYWdlQ2FsbEJhY2spO1xuICAgICAgICAgICAgICAgIGluZGV4Kys7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICAvLyDpooTliqDovb3kuInnuqfoj5zljZUg5Y2V5ZOB5a625YW35pWw5o2uXG4gICAgcHJlbG9hZFNpbmFnbGVJdGVtc0RhdGFfVGhyZWU6IGZ1bmN0aW9uIChpZCwgcGFnZSwgZWFjaCwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBpZiAoIXNlbGYuc2luZ2xlX1RocmVlX0RhdGFTaGVldHNbaWRdKSB7XG4gICAgICAgICAgICBzZWxmLnNpbmdsZV9UaHJlZV9EYXRhU2hlZXRzW2lkXSA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIHZhciBzZW5kRGF0YSA9IHtcbiAgICAgICAgICAgIHRpZDogaWQsXG4gICAgICAgICAgICBwYWdlOiBwYWdlLFxuICAgICAgICAgICAgZWFjaDogLTFcbiAgICAgICAgfTtcbiAgICAgICAgc2VsZi5uZXRXb3JrTWdyLlJlcXVlc3RTaW5nbGVJdGVtcyhzZW5kRGF0YSwgZnVuY3Rpb24gKHNlcnZlckRhdGEpIHtcbiAgICAgICAgICAgIGlmIChzZXJ2ZXJEYXRhLnN0YXR1cyAhPT0gMTAwMDApIHtcbiAgICAgICAgICAgICAgICBzZWxmLnRpcHNXaW5kb3cub3BlblRpcHNXaW5kb3coc2VydmVyRGF0YS5kZXNjKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgdG90YWwgPSBwYXJzZUludChzZXJ2ZXJEYXRhLnRvdGFsKTtcbiAgICAgICAgICAgIHNlbGYuc2luZ2xlX1RocmVlX1RvdGFsX1NoZWV0c1tpZF0gPSB0b3RhbDtcbiAgICAgICAgICAgIGlmICh0b3RhbCA9PT0gMCAmJiBjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGRhdGFTaGVldHMgPSBzZWxmLnNpbmdsZV9UaHJlZV9EYXRhU2hlZXRzW2lkXTtcbiAgICAgICAgICAgIHZhciBpbmRleCA9IDAsIGxvYWRJbWFnZUNvdW50ID0gMDtcbiAgICAgICAgICAgIHNlcnZlckRhdGEubGlzdC5mb3JFYWNoKGZ1bmN0aW9uIChkYXRhU2hlZXRzLCBkYXRhKSB7XG4gICAgICAgICAgICAgICAgdmFyIG1lbnVEYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICBwcm9wc19pZDogcGFyc2VJbnQoZGF0YS5wcm9kX2lkKSxcbiAgICAgICAgICAgICAgICAgICAgcHJvcHNfbmFtZTogZGF0YS5wcm9kX25hbWUsXG4gICAgICAgICAgICAgICAgICAgIHByb2RfdWlkOiBkYXRhLnByb2RfdWlkLFxuICAgICAgICAgICAgICAgICAgICBwcmljZTogZGF0YS5wcm9kX3ByaWNlLFxuICAgICAgICAgICAgICAgICAgICBkaXNjb3VudDogZGF0YS5kaXNjb3VudCxcbiAgICAgICAgICAgICAgICAgICAgYmlnSW1hZ2VVcmw6IGRhdGEucHJvZF9zb3VjZV91cmwsXG4gICAgICAgICAgICAgICAgICAgIGJpZ1Nwcml0ZTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VVcmw6IGRhdGEucHJvZF9pbWFnZV91cmwsXG4gICAgICAgICAgICAgICAgICAgIHNtYWxsU3ByaXRlOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBldmVudDogbnVsbFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICB2YXIgbG9hZEltYWdlQ2FsbEJhY2sgPSBmdW5jdGlvbiAobWVudURhdGEsIGluZGV4LCBlcnJvciwgaW1hZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2FkSW1hZ2VDb3VudCsrO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGxvYWRJbWFnZUNvdW50IDwgMikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYubG9hZEltYWdlKG1lbnVEYXRhLnNhbWxsSW1hZ2VVcmwsIGxvYWRJbWFnZUNhbGxCYWNrKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgICAgICBtZW51RGF0YS5zbWFsbFNwcml0ZSA9IG5ldyBGaXJlLlNwcml0ZShpbWFnZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soaWQsIGluZGV4LCBwYWdlLCBtZW51RGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbG9hZEltYWdlQ291bnQgPSAwO1xuICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzLCBtZW51RGF0YSwgaW5kZXgpO1xuICAgICAgICAgICAgICAgIC8vIOS/neWtmOaVsOaNrlxuICAgICAgICAgICAgICAgIGRhdGFTaGVldHMucHVzaChtZW51RGF0YSk7XG4gICAgICAgICAgICAgICAgLy8g5Yqg6L295bCP5Zu+XG4gICAgICAgICAgICAgICAgLy9zZWxmLmxvYWRJbWFnZShkYXRhLnByb2RfaW1hZ2VfdXJsLCBsb2FkSW1hZ2VDYWxsQmFjayk7XG4gICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICBpbmRleCsrO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMsIGRhdGFTaGVldHMpKTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICAvLyDpooTliqDovb3kuoznuqflpZfoo4XmlbDmja5cbiAgICBwcmVsb2FkU3VpdEl0ZW1zRGF0YV9TZWNvbmQ6IGZ1bmN0aW9uIChjdXJQYWdlLCBjdXJFYWNoLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgc2VuZERhdGEgPSB7XG4gICAgICAgICAgICBwYWdlOiBjdXJQYWdlLFxuICAgICAgICAgICAgZWFjaDogLTFcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBzZWxmLm5ldFdvcmtNZ3IuUmVxdWVzdFNldEl0ZW1zTWVudShzZW5kRGF0YSwgZnVuY3Rpb24gKHNlcnZlckRhdGEpIHtcbiAgICAgICAgICAgIGlmIChzZXJ2ZXJEYXRhLnN0YXR1cyAhPT0gMTAwMDApIHtcbiAgICAgICAgICAgICAgICBzZWxmLnRpcHNXaW5kb3cub3BlblRpcHNXaW5kb3coc2VydmVyRGF0YS5kZXNjKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyDlpZfoo4XmgLvmlbDph49cbiAgICAgICAgICAgIHNlbGYuc3VpdEl0ZW1zX1RocmVlX1RvdGFsID0gcGFyc2VJbnQoc2VydmVyRGF0YS50b3RhbCk7XG4gICAgICAgICAgICBpZiAoc2VsZi5zdWl0SXRlbXNfVGhyZWVfVG90YWwgPT09IDAgJiYgY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBpbmRleCA9IDA7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNlcnZlckRhdGEubGlzdC5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgIHZhciBkYXRhID0gc2VydmVyRGF0YS5saXN0W2ldO1xuICAgICAgICAgICAgICAgIHZhciBzZXREYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICB0aWQ6IGRhdGEucHJvZF9zdWl0aWQsXG4gICAgICAgICAgICAgICAgICAgIHRuYW1lOiBkYXRhLnByb2Rfc3VpdG5hbWUsXG4gICAgICAgICAgICAgICAgICAgIHVpZDogZGF0YS5wcm9kX3VpZCxcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VVcmw6IGRhdGEucHJvZF9pbWcsXG4gICAgICAgICAgICAgICAgICAgIHJvb21UeXBlOiBkYXRhLnByb2Rfcm9vbXR5cGUsXG4gICAgICAgICAgICAgICAgICAgIHByaWNlOiBkYXRhLnByb2RfcHJpY2UsXG4gICAgICAgICAgICAgICAgICAgIHNtYWxsU3ByaXRlOiBudWxsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBzZWxmLnN1aXRJdGVtc19TZWNvbmRfRGF0YVNoZWV0cy5wdXNoKHNldERhdGEpO1xuICAgICAgICAgICAgICAgIGluZGV4Kys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLy8g5Yid5aeL5YyW5LqM57qn6I+c5Y2V54mp5ZOB5p+c5pWw5o2uXG4gICAgaW5pdEJhY2twYWNrRGF0YTogZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgIGlmICh0aGlzLmJhY2twYWNrX1NlY29uZF9EYXRhU2hlZXRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgZGF0YSA9IHtcbiAgICAgICAgICAgIHRpZDogMCxcbiAgICAgICAgICAgIHRuYW1lOiAn5oiR55qE5Y2V5ZOBJyxcbiAgICAgICAgICAgIGlzZHJhZzogMixcbiAgICAgICAgICAgIGxvY2FsUGF0aDogJ2l0ZW1zQ2FiaW5ldC9zaW5nbGUvc2luZ2xlJyxcbiAgICAgICAgICAgIHNtYWxsU3ByaXRlOiBudWxsXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuYmFja3BhY2tfU2Vjb25kX0RhdGFTaGVldHMucHVzaChkYXRhKTtcbiAgICAgICAgZGF0YSA9IHtcbiAgICAgICAgICAgIHRpZDogMSxcbiAgICAgICAgICAgIHRuYW1lOiAn5oiR55qE5aWX6KOFJyxcbiAgICAgICAgICAgIGlzZHJhZzogMixcbiAgICAgICAgICAgIGxvY2FsUGF0aDogJ2l0ZW1zQ2FiaW5ldC9zZXQvc2V0JyxcbiAgICAgICAgICAgIHNtYWxsU3ByaXRlOiBudWxsXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuYmFja3BhY2tfU2Vjb25kX0RhdGFTaGVldHMucHVzaChkYXRhKTtcbiAgICB9LFxuICAgIC8vIOWKoOi9veeJqeWTgeafnOaVsOaNrlxuICAgIGxvYWRCYWNrcGFja0RhdGE6IGZ1bmN0aW9uIChpZCwgcGFnZSwgZWFjaG51bSwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBzZWxmLmJhY2twYWNrX1RocmVlX0RhdGFTaGVldHNbaWRdID0gW107XG4gICAgICAgIC8vIOWNleWTgVxuICAgICAgICB2YXIgc2luZ2xlQ2FsbEJhY2sgPSBmdW5jdGlvbiAoc2VydmVyRGF0YSkge1xuICAgICAgICAgICAgaWYgKHNlcnZlckRhdGEuc3RhdHVzICE9PSAxMDAwMCkge1xuICAgICAgICAgICAgICAgIHNlbGYudGlwc1dpbmRvdy5vcGVuVGlwc1dpbmRvdyhzZXJ2ZXJEYXRhLmRlc2MpO1xuICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjayl7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciB0b3RhbCA9IHBhcnNlSW50KHNlcnZlckRhdGEudG90YWwpO1xuICAgICAgICAgICAgc2VsZi5iYWNrcGFja19UaHJlZV9Ub3RhbF9TaGVldHNbaWRdID0gdG90YWw7XG4gICAgICAgICAgICBpZiAodG90YWwgPT09IDAgJiYgY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNlcnZlckRhdGEubGlzdC5mb3JFYWNoKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgdmFyIGxvYWNsRGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgcGFja19pZDogZGF0YS5wYWNrX2lkLFxuICAgICAgICAgICAgICAgICAgICBwcm9kX3VpZDogZGF0YS5wcm9kX3VpZCxcbiAgICAgICAgICAgICAgICAgICAgcHJvcHNfaWQ6IGRhdGEucHJvZF9pZCxcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiBkYXRhLnN0YXR1cyxcbiAgICAgICAgICAgICAgICAgICAgcHJvcHNfdHlwZTogZGF0YS5wcm9kX2NhdGVnb3J5LFxuICAgICAgICAgICAgICAgICAgICBoYXNEcmFnOiBkYXRhLnByb2RfY2F0ZWdvcnkgPiAyLFxuICAgICAgICAgICAgICAgICAgICBwcm9wc19uYW1lOiBkYXRhLnByb2RfbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgcHJpY2U6IGRhdGEucHJpY2UsXG4gICAgICAgICAgICAgICAgICAgIGRpc2NvdW50OiBkYXRhLmRpc2NvdW50LFxuICAgICAgICAgICAgICAgICAgICBpbWFnZVVybDogZGF0YS5wcm9kX2ltYWdlX3VybCxcbiAgICAgICAgICAgICAgICAgICAgYmlnSW1hZ2VVcmw6IGRhdGEucHJvZF9zb3VjZV91cmwsXG4gICAgICAgICAgICAgICAgICAgIHNtYWxsU3ByaXRlOiBudWxsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAvLyDkv53lrZjmlbDmja5cbiAgICAgICAgICAgICAgICBzZWxmLmJhY2twYWNrX1RocmVlX0RhdGFTaGVldHNbaWRdLnB1c2gobG9hY2xEYXRhKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgLy8g5aWX6KOFXG4gICAgICAgIHZhciBzdWl0Q2FsbEJhY2sgPSBmdW5jdGlvbiAoc2VydmVyRGF0YSkge1xuICAgICAgICAgICAgaWYgKHNlcnZlckRhdGEuc3RhdHVzICE9PSAxMDAwMCkge1xuICAgICAgICAgICAgICAgIHNlbGYudGlwc1dpbmRvdy5vcGVuVGlwc1dpbmRvdyhzZXJ2ZXJEYXRhLmRlc2MpO1xuICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciB0b3RhbCA9IHBhcnNlSW50KHNlcnZlckRhdGEudG90YWwpO1xuICAgICAgICAgICAgc2VsZi5iYWNrcGFja19UaHJlZV9Ub3RhbF9TaGVldHNbaWRdID0gdG90YWw7XG4gICAgICAgICAgICBpZiAodG90YWwgPT09IDAgJiYgY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNlcnZlckRhdGEubGlzdC5mb3JFYWNoKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgdmFyIGxvY2FsRGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgc3VpdF9pZDogZGF0YS5zdWl0X2lkLFxuICAgICAgICAgICAgICAgICAgICBzdWl0X25hbWU6IGRhdGEuc3VpdF9uYW1lLFxuICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IGRhdGEuc3RhdHVzLFxuICAgICAgICAgICAgICAgICAgICBkcmVzc0xpc3Q6IGRhdGEuZHJlc3NMaXN0LFxuICAgICAgICAgICAgICAgICAgICBpbWFnZVVybDogZGF0YS5zdWl0X3BpZyxcbiAgICAgICAgICAgICAgICAgICAgc21hbGxTcHJpdGU6IG51bGxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIC8vIOS/neWtmOaVsOaNrlxuICAgICAgICAgICAgICAgIHNlbGYuYmFja3BhY2tfVGhyZWVfRGF0YVNoZWV0c1tpZF0ucHVzaChsb2NhbERhdGEpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB2YXIgc2VuZERhdGEgPSB7XG4gICAgICAgICAgICBwYWdlOiBwYWdlLFxuICAgICAgICAgICAgZWFjaG51bTogLTFcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKGlkID09PSAwKSB7XG4gICAgICAgICAgICBzZWxmLm5ldFdvcmtNZ3IuUmVxdWVzdEJhY2twYWNrU2luZ2xlKHNlbmREYXRhLCBzaW5nbGVDYWxsQmFjayk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBzZWxmLm5ldFdvcmtNZ3IuUmVxdWVzdEJhY2twYWNrU3VpdChzZW5kRGF0YSwgc3VpdENhbGxCYWNrKTtcbiAgICAgICAgfVxuICAgIH0sXG59KTtcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnMmEzYTNwdUtKRkVaTGNxeS8xeGtzYXEnLCAnRmFtaWx5SW5mbycpO1xuLy8gc2NyaXB0XFx2aWxsYVxcRmFtaWx5SW5mby5qc1xuXG52YXIgQ29tcCA9IEZpcmUuQ2xhc3Moe1xuICAgIC8vIOe7p+aJv1xuICAgIGV4dGVuZHM6IEZpcmUuQ29tcG9uZW50LFxuICAgIC8vIOaehOmAoOWHveaVsFxuICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIOaIv+mXtOWQjeensFxuICAgICAgICB0aGlzLmZsb29yX25hbWUgPSAnJztcbiAgICAgICAgLy8g5oi/6Ze0562J57qnXG4gICAgICAgIHRoaXMuaG91c2VfZ3JhZGUgPSAwO1xuICAgICAgICAvLyDniLHkurpJRFxuICAgICAgICB0aGlzLmxvdmVyX2lkID0gMDtcbiAgICAgICAgLy8g54ix5Lq65ZCN56ewXG4gICAgICAgIHRoaXMubG92ZXJfbmFtZSA9ICcnO1xuICAgICAgICAvLyDniLHkurrmgKfliKtcbiAgICAgICAgdGhpcy5sb3Zlcl9nZW5kZXIgPSAnJztcbiAgICAgICAgLy8g5YWz57O7XG4gICAgICAgIHRoaXMucmVsYXRpb25fbmFtZSA9ICcnO1xuICAgICAgICAvLyDmoIforrBcbiAgICAgICAgdGhpcy5tYXJrID0gJyc7XG4gICAgICAgIC8vIOWxgklEXG4gICAgICAgIHRoaXMuc3RvcmV5X2lkID0gMDtcbiAgICAgICAgLy9cbiAgICAgICAgdGhpcy5pc19kZWZhdWx0ID0gJyc7XG4gICAgfSxcbiAgICAvLyDlsZ7mgKdcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIC8vIOaIv+Wxi+etiee6p1xuICAgICAgICBsZXZlbDoge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVGV4dFxuICAgICAgICB9LFxuICAgICAgICAvLyDmiL/kuLtcbiAgICAgICAgaG91c2VPd25lcjoge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVGV4dFxuICAgICAgICB9LFxuICAgICAgICAvLyDkuI5UQeeahOWFs+ezu1xuICAgICAgICByZWxhdGlvbjoge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVGV4dFxuICAgICAgICB9LFxuICAgICAgICAvLyDliqDlhaXmiL/lsYtcbiAgICAgICAgYnRuX2dvVG86IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlVJQnV0dG9uXG4gICAgICAgIH0sXG4gICAgICAgIC8vIOino+mZpOWFs+ezu1xuICAgICAgICBidG5fZGVsOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5VSUJ1dHRvblxuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyDmm7TmlrDmiL/lsYvnrYnnuqdcbiAgICBzZXRMZXZlbDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuaG91c2VfZ3JhZGUgPSB2YWx1ZTtcbiAgICAgICAgdGhpcy5sZXZlbC50ZXh0ID0gdmFsdWUudG9TdHJpbmcoKTtcbiAgICB9LFxuICAgIC8vIOabtOaWsOaIv+S4u1xuICAgIHNldEhvdXNlT3duZXI6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB0aGlzLmxvdmVyX25hbWUgPSB2YWx1ZTtcbiAgICAgICAgdGhpcy5ob3VzZU93bmVyLnRleHQgPSB2YWx1ZS50b1N0cmluZygpO1xuICAgIH0sXG4gICAgLy8g5pu05paw5LiOVEHlhbPns7tcbiAgICBzZXRSZWxhdGlvbjogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHRoaXMucmVsYXRpb25fbmFtZSA9IHZhbHVlO1xuICAgICAgICB0aGlzLnJlbGF0aW9uLnRleHQgPSB2YWx1ZS50b1N0cmluZygpO1xuICAgIH0sXG4gICAgcmVmcmVzaDogZnVuY3Rpb24gKGRhdGEsIGdvVG9FdmVudCwgcmVsaWV2ZUV2ZW50KSB7XG4gICAgICAgIHRoaXMuYnRuX2dvVG8ub25DbGljayA9IGdvVG9FdmVudC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmJ0bl9nb1RvLm9uQ2xpY2sgPSByZWxpZXZlRXZlbnQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5zZXRMZXZlbChkYXRhLmhvdXNlX2dyYWRlIHx8IDEpO1xuICAgICAgICB0aGlzLnNldEhvdXNlT3duZXIoZGF0YS5sb3Zlcl9uYW1lIHx8ICfml6AnKTtcbiAgICAgICAgdGhpcy5zZXRSZWxhdGlvbihkYXRhLnJlbGF0aW9uX25hbWUgfHwgJ+aXoCcpO1xuICAgICAgICB0aGlzLm1hcmsgPSBkYXRhLm1hcmsgfHwgMDtcbiAgICAgICAgdGhpcy5sb3Zlcl9pZCA9IGRhdGEubG92ZXJfaWQgfHwgMDtcbiAgICAgICAgdGhpcy5sb3Zlcl9nZW5kZXIgPSBkYXRhLmxvdmVyX2dlbmRlciB8fCAwO1xuICAgICAgICB0aGlzLnN0b3JleV9pZCA9IGRhdGEuc3RvcmV5X2lkICB8fCAwO1xuICAgICAgICB0aGlzLmZsb29yX25hbWUgPSBkYXRhLmZsb29yX25hbWUgfHwgJ+aXoCc7XG4gICAgICAgIHRoaXMuaXNfZGVmYXVsdCA9IGRhdGEuaXNfZGVmYXVsdCB8fCAnJztcbiAgICAgICAgdGhpcy5idG5fZ29Uby5vbkNsaWNrID0gZ29Ub0V2ZW50O1xuICAgICAgICB0aGlzLmJ0bl9kZWwuZW50aXR5LmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICBpZiAodGhpcy5sb3Zlcl9pZCAhPT0gMCkge1xuICAgICAgICAgICAgdGhpcy5idG5fZGVsLm9uQ2xpY2sgPSByZWxpZXZlRXZlbnQ7XG4gICAgICAgICAgICB0aGlzLmJ0bl9kZWwuZW50aXR5LmFjdGl2ZSA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG59KTtcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnOTA0ZTZnZWZzaE1rNzlIcFlhd2FKd2gnLCAnRmlyc3RNZW51TWdyJyk7XG4vLyBzY3JpcHRcXHZpbGxhXFxGaXJzdE1lbnVNZ3IuanNcblxuLy8g5LiA57qn6I+c5Y2V77yI5Y2V5ZOBL+Wll+ijhS/nianlk4Hmn5zvvIlcbnZhciBGaXJzdE1lbnVNZ3IgPSBGaXJlLkNsYXNzKHtcbiAgICAvLyDnu6fmib9cbiAgICBleHRlbmRzOiBGaXJlLkNvbXBvbmVudCxcbiAgICAvLyDmnoTpgKDlh73mlbBcbiAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyDoj5zljZXliJfooahcbiAgICAgICAgdGhpcy5fbWVudUxpc3QgPSBbXTtcbiAgICB9LFxuICAgIC8vIOWxnuaAp1xuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgbWFyZ2luOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBGaXJlLnYyKDAsIDEwMClcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy8g6YeN572uVG9nZ2xl54q25oCBXG4gICAgbW9kaWZ5VG9nZ2xlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBjaGlsZCwgdG9nZ2xlO1xuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5fbWVudUxpc3QubGVuZ3RoIDsrK2kpIHtcbiAgICAgICAgICAgIGNoaWxkID0gdGhpcy5fbWVudUxpc3RbaV07XG4gICAgICAgICAgICB0b2dnbGUgPSBjaGlsZC5nZXRDb21wb25lbnQoJ1RvZ2dsZScpO1xuICAgICAgICAgICAgdG9nZ2xlLnJlc2V0VG9nZ2xlKCk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIOaJk+W8gOS6jOe6p+iPnOWNlVxuICAgIF9vbk9wZW5TZWNvbmRNZW51RXZlbnQ6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICB0aGlzLm1vZGlmeVRvZ2dsZSgpO1xuICAgICAgICB2YXIgaWQgPSBwYXJzZUludChldmVudC50YXJnZXQubmFtZSk7XG4gICAgICAgIHRoaXMuZGF0YUJhc2Uuc2Vjb25kTWVudU1nci5vcGVuTWVudShpZCk7XG4gICAgfSxcbiAgICAvLyDmiZPlvIDkuoznuqfoj5zljZVcbiAgICBfb25SZW1vdmVTY3JlZW5FdmVudDogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgc2VsZi5kYXRhQmFzZS50aXBzV2luZG93Lm9wZW5UaXBzV2luZG93KCfmmK/lkKbmuIXnqbrlnLrmma/vvJ8nLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzZWxmLmRhdGFCYXNlLnJlc2V0U2NyZWVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmRhdGFCYXNlLnNlY29uZE1lbnVNZ3IuY2xvc2VNZW51KHRydWUpO1xuICAgICAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UudGhyZWVNZW51TWdyLmNsb3NlTWVudSh0cnVlKTtcbiAgICAgICAgICAgICAgICBzZWxmLmRhdGFCYXNlLmxvYWRUaXBzLm9wZW5UaXBzKCfliJ3lp4vljJblnLrmma/vvIEnKTtcbiAgICAgICAgICAgICAgICB2YXIgc2VuZERhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgIG1hcms6IHNlbGYuZGF0YUJhc2UubWFyayxcbiAgICAgICAgICAgICAgICAgICAgY2xlYXI6IDFcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UuaW50b1Jvb20oc2VuZERhdGEsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS5sb2FkVGlwcy5jbG9zZVRpcHMoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIC8vIOiOt+WPluiPnOWNleaMiemSruW5tuS4lOe7keWumuS6i+S7tlxuICAgIF9pbml0TWVudTogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciBjaGlsZHJlbiA9IHRoaXMuZW50aXR5LmdldENoaWxkcmVuKCk7XG4gICAgICAgIHNlbGYuX21lbnVMaXN0ID0gW107XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIC8vIOe7keWumuaMiemSruS6i+S7tlxuICAgICAgICAgICAgaWYgKGkgPT09IDEpIHtcbiAgICAgICAgICAgICAgICB2YXIgYnRuID0gY2hpbGRyZW5baV0uZ2V0Q29tcG9uZW50KEZpcmUuVUlCdXR0b24pO1xuICAgICAgICAgICAgICAgIGJ0bi5vbkNsaWNrID0gc2VsZi5fb25SZW1vdmVTY3JlZW5FdmVudC5iaW5kKHNlbGYpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIHRvZ2dsZSA9IGNoaWxkcmVuW2ldLmdldENvbXBvbmVudCgnVG9nZ2xlJyk7XG4gICAgICAgICAgICAgICAgdG9nZ2xlLm9uQ2xpY2sgPSBzZWxmLl9vbk9wZW5TZWNvbmRNZW51RXZlbnQuYmluZChzZWxmKTtcbiAgICAgICAgICAgICAgICBzZWxmLl9tZW51TGlzdC5wdXNoKHRvZ2dsZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIOaJk+W8gOS4gOe6p+iPnOWNlVxuICAgIG9wZW5NZW51OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLmVudGl0eS5hY3RpdmUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmVudGl0eS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICB0aGlzLl9tZW51TGlzdFswXS5kZWZhdWx0VG9nZ2xlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuZGF0YUJhc2Uuc2Vjb25kTWVudU1nci5vcGVuTWVudSgwKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9LFxuICAgIC8vIOWFs+mXrVxuICAgIGNsb3NlTWVudTogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5kYXRhQmFzZS5zZWNvbmRNZW51TWdyLmNsb3NlTWVudSh0cnVlKTtcbiAgICAgICAgdGhpcy5kYXRhQmFzZS50aHJlZU1lbnVNZ3IuY2xvc2VNZW51KHRydWUpO1xuICAgIH0sXG4gICAgLy8g5byA5aeLXG4gICAgc3RhcnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8g5bi455So55qE5Y+Y6YePL+aVsOaNrlxuICAgICAgICB2YXIgZ2FtZURhdGFFbnQgPSBGaXJlLkVudGl0eS5maW5kKCcvRGF0YUJhc2UnKTtcbiAgICAgICAgdGhpcy5kYXRhQmFzZSA9IGdhbWVEYXRhRW50LmdldENvbXBvbmVudCgnRGF0YUJhc2UnKTtcbiAgICAgICAgLy8g5LqM57qn6I+c5Y2VXG4gICAgICAgIHRoaXMuc2Vjb25kTWVudU1nciA9IHRoaXMuZGF0YUJhc2Uuc2Vjb25kTWVudU1ncjtcbiAgICAgICAgLy8g6I635Y+W6I+c5Y2V5oyJ6ZKu5bm25LiU57uR5a6a5LqL5Lu2XG4gICAgICAgIHRoaXMuX2luaXRNZW51KCk7XG4gICAgfSxcbiAgICAvLyDmm7TmlrBcbiAgICB1cGRhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGNhbWVyYSA9IEZpcmUuQ2FtZXJhLm1haW47XG4gICAgICAgIHZhciBzY3JlZW5TaXplID0gRmlyZS5TY3JlZW4uc2l6ZS5tdWwoY2FtZXJhLnNpemUgLyBGaXJlLlNjcmVlbi5oZWlnaHQpO1xuICAgICAgICB2YXIgbmV3UG9zID0gRmlyZS52Mih0aGlzLm1hcmdpbi54LCAtc2NyZWVuU2l6ZS55IC8gMiArIHRoaXMubWFyZ2luLnkpO1xuICAgICAgICB0aGlzLmVudGl0eS50cmFuc2Zvcm0ucG9zaXRpb24gPSBuZXdQb3M7XG4gICAgfVxufSk7XG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJzJjMDY5RGN2b1ZOUzZtK0JBK0NkSXFnJywgJ0Zsb29yV2luZG93Jyk7XG4vLyBzY3JpcHRcXHZpbGxhXFxGbG9vcldpbmRvdy5qc1xuXG4vLyDmpbzlsYLliIfmjaLnqpflj6NcbnZhciBGbG9vcldpbmRvdyA9IEZpcmUuQ2xhc3Moe1xuICAgIC8vIOe7p+aJv1xuICAgIGV4dGVuZHM6IEZpcmUuQ29tcG9uZW50LFxuICAgIC8vIOaehOmAoOWHveaVsFxuICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuX215RmFtaWx5RGF0YVNoZWV0cyA9IFtdO1xuICAgICAgICB0aGlzLl9hZGRNeUZhbWlseURhdGFTaGVldHMgPSBbXTtcbiAgICAgICAgLy8g5q+P6aG15pi+56S65aSa5bCR5LiqXG4gICAgICAgIHRoaXMuX3Nob3dQYWdlQ291bnQgPSA3O1xuICAgICAgICAvLyDmgLvmlbBcbiAgICAgICAgdGhpcy5fY3VyVG90YWwgPSAwO1xuICAgICAgICAvLyDlvZPliY3pobXmlbBcbiAgICAgICAgdGhpcy5fY3VyUGFnZSA9IDE7XG4gICAgICAgIC8vIOacgOWkp+mhteaVsFxuICAgICAgICB0aGlzLl9tYXhQYWdlID0gMTtcbiAgICAgICAgLy8g57G75Z6LIDDvvJrmiJHnmoTlrrbluq3miJDlkZggMe+8muaIkeWKoOWFpeeahOWutuW6rVxuICAgICAgICB0aGlzLmZsb29yVHlwZSA9IDA7XG4gICAgICAgIC8vXG4gICAgICAgIHRoaXMucmVsaWV2ZWluZyA9IGZhbHNlO1xuICAgIH0sXG4gICAgLy8g5bGe5oCnXG4gICAgcHJvcGVydGllczoge1xuICAgICAgICAvLyDmiJHnmoTlrrbluq3miJDlkZjliIfmjaLmjInpkq5cbiAgICAgICAgYnRuX215RmFtaWx5OiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5Ub2dnbGVcbiAgICAgICAgfSxcbiAgICAgICAgLy8g5oiR5Yqg5YWl55qE5a625bqt5YiH5o2i5oyJ6ZKuXG4gICAgICAgIGJ0bl9teUFkZEZhbWlseToge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVG9nZ2xlXG4gICAgICAgIH0sXG4gICAgICAgIC8vIOWFs+mXreaMiemSrlxuICAgICAgICBidG5fY2xvc2U6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlVJQnV0dG9uXG4gICAgICAgIH0sXG4gICAgICAgIC8vIOS4iuS4gOmhtVxuICAgICAgICBidG5fTGVmdDoge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVUlCdXR0b25cbiAgICAgICAgfSxcbiAgICAgICAgLy8g5LiL5LiA6aG1XG4gICAgICAgIGJ0bl9SaWdodDoge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVUlCdXR0b25cbiAgICAgICAgfSxcbiAgICAgICAgcGFnZVRleHQ6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlRleHRcbiAgICAgICAgfSxcbiAgICAgICAgLy8g5aS06IqC54K5XG4gICAgICAgIHJvb3Q6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLkVudGl0eVxuICAgICAgICB9LFxuICAgICAgICAvLyDliqDlhaXlrrbluq3nmoTmoIfpophcbiAgICAgICAgYWRkRmFtaWx5VGl0bGU6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLkVudGl0eVxuICAgICAgICB9LFxuICAgICAgICAvLyDmiJHnmoTlrrbluq3nmoTmoIfpophcbiAgICAgICAgbXlGYW1pbHk6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLkVudGl0eVxuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyDlhbPpl63nqpflj6NcbiAgICBjbG9zZVdpbmRvdzogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5yZXNldERhdGEoKTtcbiAgICAgICAgdGhpcy5tb2RpZnlUb2dnbGUoKTtcbiAgICB9LFxuICAgIC8vIOaJk+W8gOeql+WPo1xuICAgIG9wZW5XaW5kb3c6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5lbnRpdHkuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBzZWxmLmRhdGFCYXNlLmxvYWRUaXBzLm9wZW5UaXBzKCfovb3lhaXmlbDmja7vvIHor7fnqI3lkI4uLi4nKTtcbiAgICAgICAgc2VsZi5kYXRhQmFzZS5uZXRXb3JrTWdyLlJlcXVlc3RGbG9vckxpc3QoZnVuY3Rpb24gKHNlcnZlckRhdGEpIHtcbiAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UubG9hZFRpcHMuY2xvc2VUaXBzKCk7XG4gICAgICAgICAgICBpZiAoIUZpcmUuRW5naW5lLmlzUGxheWluZykge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNlbGYucmVmcmVzaEZsb29yRGF0YShzZXJ2ZXJEYXRhLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fc3dpdGNoaW5nRGF0YSgwKTtcbiAgICAgICAgICAgICAgICBzZWxmLmJ0bl9teUZhbWlseS5kZWZhdWx0VG9nZ2xlKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICAvL1xuICAgIHJlZnJlc2hGbG9vckRhdGE6IGZ1bmN0aW9uIChzZXJ2ZXJEYXRhLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIGlmIChzZXJ2ZXJEYXRhLnN0YXR1cyAhPT0gMTAwMDApIHtcbiAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UudGlwc1dpbmRvdy5vcGVuVGlwc1dpbmRvdyhzZXJ2ZXJEYXRhLmRlc2MpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHNlbGYuX215RmFtaWx5RGF0YVNoZWV0cyA9IFtdO1xuICAgICAgICBzZXJ2ZXJEYXRhLmxpc3QubXlmbG9vci5mb3JFYWNoKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICBzZWxmLl9teUZhbWlseURhdGFTaGVldHMucHVzaChkYXRhKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHNlbGYuX2FkZE15RmFtaWx5RGF0YVNoZWV0cyA9IFtdO1xuICAgICAgICBzZXJ2ZXJEYXRhLmxpc3QubXlsaXZlZC5mb3JFYWNoKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICBzZWxmLl9hZGRNeUZhbWlseURhdGFTaGVldHMucHVzaChkYXRhKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy8g5YWz6Zet5oyJ6ZKu5LqL5Lu2XG4gICAgX29uQ2xvc2VXaW5kb3dFdmVudDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmNsb3NlV2luZG93KCk7XG4gICAgfSxcbiAgICAvLyDov5jljp9cbiAgICBtb2RpZnlUb2dnbGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5idG5fbXlGYW1pbHkucmVzZXRDb2xvcigpO1xuICAgICAgICB0aGlzLmJ0bl9teUFkZEZhbWlseS5yZXNldENvbG9yKCk7XG4gICAgfSxcbiAgICAvLyDliIfmjaLliLDmiJHnmoTlrrbluq3miJDlkZhcbiAgICBfb25NeUZhbWlseUV2ZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMubXlGYW1pbHkuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5hZGRGYW1pbHlUaXRsZS5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fc3dpdGNoaW5nRGF0YSgwKTtcbiAgICB9LFxuICAgIC8vIOaIkeWKoOWFpeeahOWutuW6rVxuICAgIF9vbk15QWRkRmFtaWx5RXZlbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5teUZhbWlseS5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5hZGRGYW1pbHlUaXRsZS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICB0aGlzLl9zd2l0Y2hpbmdEYXRhKDEpO1xuICAgIH0sXG4gICAgLy8g6YeN572uXG4gICAgcmVzZXREYXRhOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBjaGlsZHJlbiA9IHRoaXMucm9vdC5nZXRDaGlsZHJlbigpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBjaGlsZHJlbltpXS5kZXN0cm95KCk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIOi/m+WFpeaIv+Wxi1xuICAgIF9vbkdvVG9Ib3VzZUV2ZW50OiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgdGhpcy5jbG9zZVdpbmRvdygpO1xuICAgICAgICB2YXIgZmFtaWx5SW5mbyA9IGV2ZW50LnRhcmdldC5wYXJlbnQuZ2V0Q29tcG9uZW50KCdGYW1pbHlJbmZvJyk7XG4gICAgICAgIHZhciBzZW5kRGF0YSA9IHtcbiAgICAgICAgICAgIGhvdXNlX3VpZDogMCxcbiAgICAgICAgICAgIGZsb29yX2lkOiAwLFxuICAgICAgICAgICAgbWFyazogZmFtaWx5SW5mby5tYXJrXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuZGF0YUJhc2Uuc3dpdGNoUm9vbVdpbi5vcGVuV2luZG93KDEsIHNlbmREYXRhKTtcbiAgICB9LFxuICAgIC8vIOino+mZpOWFs+ezu1xuICAgIF9vblJlbGlldmVFdmVudDogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgaWYgKHNlbGYucmVsaWV2ZWluZykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciBmYW1pbHlJbmZvID0gZXZlbnQudGFyZ2V0LnBhcmVudC5nZXRDb21wb25lbnQoJ0ZhbWlseUluZm8nKTtcbiAgICAgICAgc2VsZi5kYXRhQmFzZS50aXBzV2luZG93Lm9wZW5UaXBzV2luZG93KFwi5piv5ZCm5LiOIFwiICsgZmFtaWx5SW5mby5sb3Zlcl9uYW1lICsgXCIg6Kej6Zmk5YWz57O7P1wiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzZWxmLnJlbGlldmVpbmcgPSB0cnVlO1xuICAgICAgICAgICAgdmFyIHNlbmREYXRhID0ge1xuICAgICAgICAgICAgICAgIG1hcms6IGZhbWlseUluZm8ubWFya1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UubmV0V29ya01nci5SZXF1ZXN0RGlzYXNzb2NpYXRlTGlzdChzZW5kRGF0YSwgZnVuY3Rpb24gKHNlcnZlckRhdGEpIHtcbiAgICAgICAgICAgICAgICBpZiAoc2VydmVyRGF0YS5zdGF0dXMgPT09IDEwMDAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYucmVmcmVzaEZsb29yRGF0YShzZXJ2ZXJEYXRhLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLl9zd2l0Y2hpbmdEYXRhKHNlbGYuZmxvb3JUeXBlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYucmVsaWV2ZWluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYudGlwc1dpbmRvdy5vcGVuVGlwc1dpbmRvdyhzZXJ2ZXJEYXRhLmRlc2MpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIC8vIOmHjee9rumhteaVsFxuICAgIF9zd2l0Y2hpbmdEYXRhOiBmdW5jdGlvbiAodHlwZSkge1xuICAgICAgICB0aGlzLm1vZGlmeVRvZ2dsZSgpO1xuICAgICAgICB0aGlzLmZsb29yVHlwZSA9IHR5cGU7XG4gICAgICAgIHRoaXMuX2N1clBhZ2UgPSAxO1xuICAgICAgICB0aGlzLl9tYXhQYWdlID0gMTtcbiAgICAgICAgaWYgKHR5cGUgPT09IDApe1xuICAgICAgICAgICAgdGhpcy5idG5fbXlGYW1pbHkuZGVmYXVsdFRvZ2dsZSgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5idG5fbXlBZGRGYW1pbHkuZGVmYXVsdFRvZ2dsZSgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY3JlYXRlRmFtaWx5SW5mbygpO1xuICAgIH0sXG4gICAgLy9cbiAgICBjcmVhdGVGYW1pbHlJbmZvOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMucmVzZXREYXRhKCk7XG4gICAgICAgIHZhciBkYXRhU2hlZXRzID0gbnVsbDtcbiAgICAgICAgaWYgKHRoaXMuZmxvb3JUeXBlID09PSAwKSB7XG4gICAgICAgICAgICBkYXRhU2hlZXRzID0gdGhpcy5fbXlGYW1pbHlEYXRhU2hlZXRzO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZGF0YVNoZWV0cyA9IHRoaXMuX2FkZE15RmFtaWx5RGF0YVNoZWV0cztcbiAgICAgICAgfVxuICAgICAgICB2YXIgYmluZEdvdEhvdXNlRXZlbnQgPSB0aGlzLl9vbkdvVG9Ib3VzZUV2ZW50LmJpbmQodGhpcyk7XG4gICAgICAgIHZhciBiaW5kUmVsaWV2ZUV2ZW50ID0gdGhpcy5fb25SZWxpZXZlRXZlbnQuYmluZCh0aGlzKTtcbiAgICAgICAgLy9cbiAgICAgICAgdGhpcy5fY3VyVG90YWwgPSBkYXRhU2hlZXRzLmxlbmd0aDtcbiAgICAgICAgdGhpcy5fbWF4UGFnZSA9IE1hdGguY2VpbCh0aGlzLl9jdXJUb3RhbCAvIHRoaXMuX3Nob3dQYWdlQ291bnQpO1xuICAgICAgICBpZiAodGhpcy5fbWF4UGFnZSA9PT0gMCkge1xuICAgICAgICAgICAgdGhpcy5fbWF4UGFnZSA9IDE7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHN0YXJ0Q291bnQgPSAodGhpcy5fY3VyUGFnZSAtIDEpICogdGhpcy5fc2hvd1BhZ2VDb3VudDtcbiAgICAgICAgdmFyIGVudENvdW50ID0gc3RhcnRDb3VudCArIHRoaXMuX3Nob3dQYWdlQ291bnQ7XG4gICAgICAgIGlmIChlbnRDb3VudCA+IHRoaXMuX2N1clRvdGFsKSB7XG4gICAgICAgICAgICBlbnRDb3VudCA9IHRoaXMuX2N1clRvdGFsO1xuICAgICAgICB9XG4gICAgICAgIHZhciBpbmRleCA9IDA7XG4gICAgICAgIGZvciAodmFyIGkgPSBzdGFydENvdW50OyBpIDwgZW50Q291bnQ7ICsraSkge1xuICAgICAgICAgICAgdmFyIGRhdGEgPSBkYXRhU2hlZXRzW2ldO1xuICAgICAgICAgICAgdmFyIGVudCA9IEZpcmUuaW5zdGFudGlhdGUodGhpcy5kYXRhQmFzZS50ZW1wRmFtaWx5SW5mbyk7XG4gICAgICAgICAgICBlbnQubmFtZSA9IGkudG9TdHJpbmcoKTtcbiAgICAgICAgICAgIGVudC5wYXJlbnQgPSB0aGlzLnJvb3Q7XG4gICAgICAgICAgICBlbnQuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgICAgIGVudC50cmFuc2Zvcm0ucG9zaXRpb24gPSBuZXcgRmlyZS5WZWMyKC0yLjUsIDE4OCAtIChpbmRleCAqIDc3KSk7XG4gICAgICAgICAgICB2YXIgaW5mbyA9IGVudC5nZXRDb21wb25lbnQoJ0ZhbWlseUluZm8nKTtcbiAgICAgICAgICAgIGluZm8ucmVmcmVzaChkYXRhLCBiaW5kR290SG91c2VFdmVudCwgYmluZFJlbGlldmVFdmVudCk7XG4gICAgICAgICAgICBpbmRleCsrO1xuICAgICAgICB9XG4gICAgICAgIC8vIOWIt+aWsOaMiemSrueKtuaAgVxuICAgICAgICB0aGlzLl9yZWZyZXNoQnRuU3RhdGUoKTtcbiAgICB9LFxuICAgIC8vIOWIt+aWsOaMiemSrueKtuaAgVxuICAgIF9yZWZyZXNoQnRuU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5idG5fTGVmdC5lbnRpdHkuYWN0aXZlID0gdGhpcy5fY3VyUGFnZSA+IDE7XG4gICAgICAgIHRoaXMuYnRuX1JpZ2h0LmVudGl0eS5hY3RpdmUgPSB0aGlzLl9jdXJQYWdlIDwgdGhpcy5fbWF4UGFnZTtcbiAgICAgICAgdGhpcy5wYWdlVGV4dC50ZXh0ID0gJ+mhteaVsDonICsgdGhpcy5fY3VyUGFnZSArIFwiL1wiICsgdGhpcy5fbWF4UGFnZTtcbiAgICB9LFxuICAgIC8vIOS4i+S4gOmhtVxuICAgIF9vbk5leHRQYWdlRXZuZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5fY3VyUGFnZSAtPSAxO1xuICAgICAgICBpZiAodGhpcy5fY3VyUGFnZSA8IDEpe1xuICAgICAgICAgICAgdGhpcy5fY3VyUGFnZSA9IDE7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jcmVhdGVGYW1pbHlJbmZvKCk7XG4gICAgfSxcbiAgICAvLyDkuIrkuIDpobVcbiAgICBfb25QcmV2aW91c1BhZ2VFdmVudDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLl9jdXJQYWdlICs9IDE7XG4gICAgICAgIGlmICh0aGlzLl9jdXJQYWdlID4gdGhpcy5fbWF4UGFnZSl7XG4gICAgICAgICAgICB0aGlzLl9jdXJQYWdlID0gdGhpcy5fbWF4UGFnZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNyZWF0ZUZhbWlseUluZm8oKTtcbiAgICB9LFxuICAgIC8vIOW8gOWni1xuICAgIHN0YXJ0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIOW4uOeUqOeahOWPmOmHjy/mlbDmja5cbiAgICAgICAgdmFyIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9EYXRhQmFzZScpO1xuICAgICAgICB0aGlzLmRhdGFCYXNlID0gZW50LmdldENvbXBvbmVudCgnRGF0YUJhc2UnKTtcbiAgICAgICAgLy9cbiAgICAgICAgdGhpcy5hZGRGYW1pbHlUaXRsZS5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5teUZhbWlseS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICAvL1xuICAgICAgICB0aGlzLmJ0bl9jbG9zZS5vbkNsaWNrID0gdGhpcy5fb25DbG9zZVdpbmRvd0V2ZW50LmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuYnRuX215RmFtaWx5Lm9uQ2xpY2sgPSB0aGlzLl9vbk15RmFtaWx5RXZlbnQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5idG5fbXlBZGRGYW1pbHkub25DbGljayA9IHRoaXMuX29uTXlBZGRGYW1pbHlFdmVudC5iaW5kKHRoaXMpO1xuICAgICAgICAvL1xuICAgICAgICB0aGlzLmJ0bl9MZWZ0Lm9uQ2xpY2sgPSB0aGlzLl9vbk5leHRQYWdlRXZuZXQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5idG5fUmlnaHQub25DbGljayA9IHRoaXMuX29uUHJldmlvdXNQYWdlRXZlbnQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5idG5fTGVmdC5lbnRpdHkuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuYnRuX1JpZ2h0LmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcbiAgICB9XG59KTtcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnMGI4YzZZcWRhMUZIYnhEME9FMUJGdnYnLCAnRnVybml0dXJlJyk7XG4vLyBzY3JpcHRcXHZpbGxhXFxGdXJuaXR1cmUuanNcblxudmFyIEZ1cm5pdHVyZSA9IEZpcmUuQ2xhc3Moe1xuICAgIC8vIOe7p+aJv1xuICAgIGV4dGVuZHM6IEZpcmUuQ29tcG9uZW50LFxuICAgIC8vIOaehOmAoOWHveaVsFxuICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuX3JlbmRlcmVyID0gbnVsbDtcbiAgICAgICAgdGhpcy5zbWFsbFNwcml0ZSA9IG51bGw7XG4gICAgICAgIHRoaXMubWVudURhdGEgPSBudWxsO1xuICAgIH0sXG4gICAgLy8g5bGe5oCnXG4gICAgcHJvcGVydGllczoge1xuICAgICAgICAvLyDlkI3np7BcbiAgICAgICAgcHJvcHNfbmFtZTogJycsXG4gICAgICAgIC8vIOeJqeWTgUlEXG4gICAgICAgIHByb3BzX2lkOiAtMSxcbiAgICAgICAgLy8g54mp5ZOBVUlEXG4gICAgICAgIHByb3BzX3VpZDogLTEsXG4gICAgICAgIC8vIOiDjOWMhUlEXG4gICAgICAgIHBhY2tfaWQ6IC0xLFxuICAgICAgICAvLyDlpZfoo4VJRFxuICAgICAgICBzdWl0X2lkOiAtMSxcbiAgICAgICAgLy8g57G75Z6LXG4gICAgICAgIHByb3BzX3R5cGU6IC0xLFxuICAgICAgICAvLyDku7fmoLxcbiAgICAgICAgcHJpY2U6IC0xLFxuICAgICAgICAvLyDmipjmiaNcbiAgICAgICAgZGlzY291bnQ6IDEsXG4gICAgICAgIC8vIOWbvueJh+eahHVybFxuICAgICAgICBpbWFnZVVybDogJycsXG4gICAgICAgIC8vIOi9veWFpeaXtueahOWbvueJh1xuICAgICAgICBkZWZhdWx0U3ByaXRlOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5TcHJpdGVcbiAgICAgICAgfSxcbiAgICAgICAgZGVmYXVsdExvYWRBbmltOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5BbmltYXRpb25cbiAgICAgICAgfSxcbiAgICAgICAgcmVuZGVyZXI6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlNwcml0ZVJlbmRlcmVyXG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIOiuvue9rum7mOiupOWbvueJh1xuICAgIHNhdmVEZWZhdWx0U3ByaXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuZGVmYXVsdFNwcml0ZSA9IHRoaXMucmVuZGVyZXIuc3ByaXRlO1xuICAgIH0sXG4gICAgLy8g6I635Y+W5b2T5YmN5Zu+54mHXG4gICAgZ2V0UmVuZGVyU3ByaXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLnNwcml0ZTtcbiAgICB9LFxuICAgIC8vIOiuvue9ruagh+iusFxuICAgIHNldE1hcmtVc2U6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICBpZiAodGhpcy5tZW51RGF0YSkge1xuICAgICAgICAgICAgdGhpcy5tZW51RGF0YS5zZXRNYXJrVXNlKHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy8g6K6+572u5Zu+54mHXG4gICAgc2V0U3ByaXRlOiBmdW5jdGlvbiAobmV3U3ByaXRlKSB7XG4gICAgICAgIHRoaXMucmVuZGVyZXIuc3ByaXRlID0gbmV3U3ByaXRlO1xuICAgICAgICB0aGlzLnJlbmRlcmVyLnNwcml0ZS5waXhlbExldmVsSGl0VGVzdCA9IHRydWU7XG4gICAgfSxcbiAgICAvLyDorr7nva7lrrblhbfmlbDmja5cbiAgICBzZXRGdXJuaXR1cmVEYXRhOiBmdW5jdGlvbiAoZGF0YSwgaGFzQmdBbmRHZCkge1xuICAgICAgICBpZiAoISB0aGlzLmRhdGFCYXNlKSB7XG4gICAgICAgICAgICAvLyDluLjnlKjnmoTlj5jph48v5pWw5o2uXG4gICAgICAgICAgICB2YXIgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL0RhdGFCYXNlJyk7XG4gICAgICAgICAgICB0aGlzLmRhdGFCYXNlID0gZW50LmdldENvbXBvbmVudCgnRGF0YUJhc2UnKTtcbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICBpZiAodGhpcy5kZWZhdWx0TG9hZEFuaW0pIHtcbiAgICAgICAgICAgICAgICB2YXIgc3RhdGUgPSB0aGlzLmRlZmF1bHRMb2FkQW5pbS5wbGF5KCdsb2FkaW5nJyk7XG4gICAgICAgICAgICAgICAgc3RhdGUud3JhcE1vZGUgPSBGaXJlLldyYXBNb2RlLkxvb3A7XG4gICAgICAgICAgICAgICAgc3RhdGUucmVwZWF0Q291bnQgPSBJbmZpbml0eTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLnByb3BzX25hbWUgPSBkYXRhLnByb3BzX25hbWUgfHwgZGF0YS5wcm9wc05hbWU7XG4gICAgICAgIHRoaXMucHJvcHNfaWQgPSBkYXRhLnByb3BzX2lkIHx8IGRhdGEuaWQ7XG4gICAgICAgIHRoaXMucHJvcHNfdWlkID0gIGRhdGEucHJvcHNfdWlkIHx8IGRhdGEucHJvZF91aWQgfHwgMDtcbiAgICAgICAgdGhpcy5wcm9wc190eXBlID0gZGF0YS5wcm9wc190eXBlIHx8IGRhdGEucHJvcHNUeXBlO1xuICAgICAgICB0aGlzLnBhY2tfaWQgPSBkYXRhLnBhY2tfaWQgfHwgMDtcbiAgICAgICAgdGhpcy5zdWl0X2lkID0gZGF0YS5zdWl0X2lkO1xuICAgICAgICB0aGlzLnByaWNlID0gZGF0YS5wcmljZSB8fCAwO1xuICAgICAgICB0aGlzLmRpc2NvdW50ID0gZGF0YS5kaXNjb3VudCB8fCAxO1xuICAgICAgICB0aGlzLmltYWdlVXJsID0gZGF0YS5iaWdJbWFnZVVybCB8fCBkYXRhLmltZ1VybDtcbiAgICAgICAgdGhpcy5zbWFsbFNwcml0ZSA9IGRhdGEuc21hbGxTcHJpdGUgfHwgbnVsbDtcblxuICAgICAgICB0aGlzLmVudGl0eS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICBpZiAoISBoYXNCZ0FuZEdkKSB7XG4gICAgICAgICAgICB0aGlzLnJlbmRlcmVyLmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuZGVmYXVsdExvYWRBbmltLmVudGl0eS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5kZWZhdWx0TG9hZEFuaW0ucGxheSgnbG9hZGluZycpO1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS5sb2FkSW1hZ2Uoc2VsZi5pbWFnZVVybCwgZnVuY3Rpb24gKGRhdGEsIGVycm9yLCBpbWFnZSkge1xuICAgICAgICAgICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc3ByaXRlID0gbmV3IEZpcmUuU3ByaXRlKGltYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5zZXRTcHJpdGUoc3ByaXRlKTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5kZWZhdWx0TG9hZEFuaW0uZW50aXR5LmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbmRlcmVyLmVudGl0eS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0uYmluZCh0aGlzLCBkYXRhKSk7XG4gICAgICAgIH1cbiAgICB9XG59KTtcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnNDA4ZThPejdaRkdNck42bDRoOE83SUknLCAnR2xvYmFsRGF0YScpO1xuLy8gc2NyaXB0XFxjb21tb25cXEdsb2JhbERhdGEuanNcblxudmFyIEdsb2JhbERhdGEgPSBGaXJlLkNsYXNzKHtcbiAgICAvLyDnu6fmib9cbiAgICBleHRlbmRzOiBGaXJlLkNvbXBvbmVudCxcbiAgICAvLyDmnoTpgKDlh73mlbBcbiAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmhvc3ROYW1lID0gXCJcIjtcbiAgICAgICAgdGhpcy5ob3N0U3ByaXRlID0gbnVsbDtcbiAgICAgICAgdGhpcy5ob3N0TmFtZSA9IFwiXCI7XG4gICAgICAgIHRoaXMuc2VuZERhdGEgPSBudWxsO1xuICAgIH0sXG4gICAgLy8g5bGe5oCnXG4gICAgcHJvcGVydGllczoge1xuICAgICAgICAvLyAxLui/m+WFpeWupOWGheW5tuS4lOebtOaOpei/m+ihjOijheaJriAyLiDov5vlhaXlrqTlhoVcbiAgICAgICAgZ290b1R5cGU6IC0xXG4gICAgfSxcbiAgICAvLyDlvIDlp4tcbiAgICBzdGFydDogZnVuY3Rpb24gKCkge1xuXG4gICAgfSxcbiAgICAvLyDmm7TmlrBcbiAgICB1cGRhdGU6IGZ1bmN0aW9uICgpIHtcblxuICAgIH1cbn0pO1xuXG5GaXJlLl9SRnBvcCgpOyIsIkZpcmUuX1JGcHVzaChtb2R1bGUsICdjNWVkMnRqUlpWS242MlBsQzNwZDFrNScsICdNYWluTWVudU1ncicpO1xuLy8gc2NyaXB0XFx2aWxsYVxcTWFpbk1lbnVNZ3IuanNcblxudmFyIERhdGFCYXNlID0gcmVxdWlyZSgnRGF0YUJhc2UnKTtcbi8vIOS4u+iPnOWNleeuoeeQhuexu1xudmFyIE1haW5NZW51TWdyID0gRmlyZS5DbGFzcyh7XG4gICAgLy8g57un5om/XG4gICAgZXh0ZW5kczogRmlyZS5Db21wb25lbnQsXG4gICAgLy8g5p6E6YCg5Ye95pWwXG4gICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8g6I+c5Y2V5YiX6KGoXG4gICAgICAgIHRoaXMuX21lbnVMaXN0ID0gW107XG4gICAgfSxcbiAgICAvLyDlsZ7mgKdcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIG1hcmdpbjogbmV3IEZpcmUuVmVjMigpLFxuICAgICAgICAvLyDlvZPliY3miL/pl7TlkI3np7BcbiAgICAgICAgaG9tZVR5cGU6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlRleHRcbiAgICAgICAgfSxcbiAgICAgICAgLy8g5b2T5YmN5Yir5aKF5ZCN56ewXG4gICAgICAgIHZpbGxhTmFtZToge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVGV4dFxuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyDliIfmjaLmiL/pl7RcbiAgICBfb25DaGFuZ2VSb29tRXZlbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ+WIh+aNouaIv+mXtCcpO1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciBzZW5kRGF0YSA9IHtcbiAgICAgICAgICAgIGhvdXNlX3VpZDogMCxcbiAgICAgICAgICAgIGZsb29yX2lkOiAwLFxuICAgICAgICAgICAgbWFyazogdGhpcy5kYXRhQmFzZS5tYXJrXG4gICAgICAgIH07XG4gICAgICAgIHNlbGYuZGF0YUJhc2Uuc3dpdGNoUm9vbVdpbi5vcGVuV2luZG93KDAsIHNlbmREYXRhKTtcbiAgICAgICAgc2VsZi5kYXRhQmFzZS5jaGFyYWN0ZXJzLmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcbiAgICB9LFxuICAgIC8vIOaIv+Wxi+aJrumdk1xuICAgIG9uSG91c2VEcmVzc0V2ZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCfmiL/lsYvmia7pnZMnKTtcbiAgICAgICAgdmFyIHNlbmREYXRhID0ge1xuICAgICAgICAgICAgbWFyazogdGhpcy5kYXRhQmFzZS5tYXJrXG4gICAgICAgIH07XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgc2VsZi5kYXRhQmFzZS5sb2FkVGlwcy5vcGVuVGlwcygn6K+35rGC5oi/5bGL5omu6Z2T77yM6K+356iN5ZCOLi4uJyk7XG4gICAgICAgIHNlbGYuZGF0YUJhc2UubmV0V29ya01nci5SZXF1ZXN0Q2FuRHJlc3NSb29tKHNlbmREYXRhLCBmdW5jdGlvbiAoc2VydmVyRGF0YSkge1xuICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS5sb2FkVGlwcy5jbG9zZVRpcHMoKTtcbiAgICAgICAgICAgIGlmIChzZXJ2ZXJEYXRhLnN0YXR1cyA9PT0gMTAwMDApIHtcbiAgICAgICAgICAgICAgICBzZWxmLmRhdGFCYXNlLmhhc0NhblNhdmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UudXNlcmNjID0gc2VydmVyRGF0YS51c2VyY2M7XG4gICAgICAgICAgICAgICAgLy8g6KGo56S65pyJ5pWw5o2u5LiO5pyN5Yqh5Zmo5LiN56ym5ZCI6ZyA6KaB5pu05pawXG4gICAgICAgICAgICAgICAgaWYgKHNlcnZlckRhdGEuaGFzdXBkYXRlID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc2VuZERhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtYXJrOiBzZWxmLmRhdGFCYXNlLm1hcmtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS5pbnRvUm9vbShzZW5kRGF0YSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS5maXJzdE1lbnVNZ3Iub3Blbk1lbnUoKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmRhdGFCYXNlLmZpcnN0TWVudU1nci5vcGVuTWVudSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UudGlwc1dpbmRvdy5vcGVuVGlwc1dpbmRvdyhzZXJ2ZXJEYXRhLmRlc2MpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgc2VsZi5kYXRhQmFzZS5jaGFyYWN0ZXJzLmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcbiAgICB9LFxuICAgIC8vIOS/neWtmOijheaJrlxuICAgIF9vblNhdmVEcmVzc0V2ZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgaWYgKCEgc2VsZi5kYXRhQmFzZS5oYXNTYXZlUm9vbSgpKSB7XG4gICAgICAgICAgICBzZWxmLmRhdGFCYXNlLnRpcHNXaW5kb3cub3BlblRpcHNXaW5kb3coJ+ivt+WFiOi/m+ihjOaIv+Wxi+aJrumdky4uJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgc2VsZi5kYXRhQmFzZS50aXBzV2luZG93Lm9wZW5UaXBzV2luZG93KCfmmK/lkKbnoa7lrprkv53lrZjoo4Xmia7vvJ8nLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoc2VsZi5kYXRhQmFzZS5oYXNQYXkoKSkge1xuICAgICAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UucGF5TWVudFdpbmRvdy5vcGVuV2luZG93KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZWxmLmRhdGFCYXNlLmxvYWRUaXBzLm9wZW5UaXBzKCfkv53lrZjoo4Xmia7kuK3vvIHor7fnqI3lkI4uLi4nKTtcbiAgICAgICAgICAgICAgICBzZWxmLmRhdGFCYXNlLnNhdmVSb29tKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS5sb2FkVGlwcy5jbG9zZVRpcHMoKTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS50aXBzV2luZG93Lm9wZW5UaXBzV2luZG93KCfkv53lrZjoo4Xmia7miJDlip8uLicpO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmRhdGFCYXNlLmZpcnN0TWVudU1nci5jbG9zZU1lbnUoKTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS5zZWNvbmRNZW51TWdyLmNsb3NlTWVudSgpO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmRhdGFCYXNlLnRocmVlTWVudU1nci5jbG9zZU1lbnUoKTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS5yZXNldFNjcmVlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc2VuZERhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbWFyazogc2VsZi5kYXRhQmFzZS5tYXJrXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS5sb2FkVGlwcy5vcGVuVGlwcygn5Yi35paw5Zy65pmv77yM6K+356iN5ZCOLi4uJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmRhdGFCYXNlLmludG9Sb29tKHNlbmREYXRhLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS5sb2FkVGlwcy5jbG9zZVRpcHMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCfkv53lrZjoo4Xmia4nKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHNlbGYuZGF0YUJhc2UuY2hhcmFjdGVycy5lbnRpdHkuYWN0aXZlID0gZmFsc2U7XG4gICAgfSxcbiAgICAvLyDmia7pnZPllYblnLpcbiAgICBfb25Hb1RvTWFsbEV2ZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCfmia7pnZPllYblnLonKTtcbiAgICAgICAgd2luZG93Lm9wZW4oJ2h0dHA6Ly93d3cuc2Fpa2UuY29tL2hvdXNlZHJlc3Mvc2hvcC5waHAnKTtcbiAgICB9LFxuICAgIC8vIOi/lOWbnuWupOWkllxuICAgIF9vbkdvVG9PdXREb29yRXZlbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ+i/lOWbnuWupOWklicpO1xuICAgICAgICAvL3dpbmRvdy5vcGVuKCdodHRwOi8vd3d3LnNhaWtlLmNvbS9ob3VzZWRyZXNzL21hcC5waHAnKTtcbiAgICAgICAgRmlyZS5FbmdpbmUubG9hZFNjZW5lKCdsYXVuY2gnKTtcbiAgICB9LFxuICAgIC8vIOiOt+WPluiPnOWNleaMiemSruW5tuS4lOe7keWumuS6i+S7tlxuICAgIF9pbml0TWVudTogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciBjaGlsZHJlbiA9IHRoaXMuZW50aXR5LmdldENoaWxkcmVuKCk7XG4gICAgICAgIHNlbGYuX21lbnVMaXN0ID0gW107XG4gICAgICAgIGNoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24gKGVudCkge1xuICAgICAgICAgICAgLy8g57uR5a6a5oyJ6ZKu5LqL5Lu2XG4gICAgICAgICAgICB2YXIgYnRuID0gZW50LmdldENvbXBvbmVudCgnVUlCdXR0b24nKTtcbiAgICAgICAgICAgIGlmICghIGJ0bikge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChlbnQubmFtZSA9PT0gXCIxXCIpIHtcbiAgICAgICAgICAgICAgICBidG4ub25DbGljayA9IHNlbGYuX29uQ2hhbmdlUm9vbUV2ZW50LmJpbmQoc2VsZik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChlbnQubmFtZSA9PT0gXCIyXCIpIHtcbiAgICAgICAgICAgICAgICBidG4ub25DbGljayA9IHNlbGYub25Ib3VzZURyZXNzRXZlbnQuYmluZChzZWxmKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGVudC5uYW1lID09PSBcIjNcIikge1xuICAgICAgICAgICAgICAgIGJ0bi5vbkNsaWNrID0gc2VsZi5fb25TYXZlRHJlc3NFdmVudC5iaW5kKHNlbGYpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoZW50Lm5hbWUgPT09IFwiNFwiKSB7XG4gICAgICAgICAgICAgICAgYnRuLm9uQ2xpY2sgPSBzZWxmLl9vbkdvVG9NYWxsRXZlbnQuYmluZChzZWxmKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGVudC5uYW1lID09PSBcIjVcIikge1xuICAgICAgICAgICAgICAgIGJ0bi5vbkNsaWNrID0gc2VsZi5fb25Hb1RvT3V0RG9vckV2ZW50LmJpbmQoc2VsZik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZWxmLl9tZW51TGlzdC5wdXNoKGJ0bik7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLy8g5pu05paw5b2T5YmN5oi/6Ze057G75Z6LXG4gICAgcmVmcmVzaEN1ckhvbWVUeXBlOiBmdW5jdGlvbiAoaG9tZVR5cGUpIHtcbiAgICAgICAgdGhpcy5ob21lVHlwZS50ZXh0ID0gXCLlvZPliY06XCIgKyBob21lVHlwZTtcbiAgICB9LFxuICAgIC8vIOabtOaWsOW9k+WJjeWIq+WiheWQjeensFxuICAgIHJlZnJlc2hDdXJWaWxsYU5hbWU6IGZ1bmN0aW9uICh0ZXh0KSB7XG4gICAgICAgIGlmICh0aGlzLnZpbGxhTmFtZS50ZXh0ID09PSB0ZXh0KXtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnZpbGxhTmFtZS50ZXh0ID0gdGV4dCB8fCBcIlwiO1xuICAgIH0sXG4gICAgb25Mb2FkOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIOW4uOeUqOeahOWPmOmHjy/mlbDmja5cbiAgICAgICAgdmFyIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9EYXRhQmFzZScpO1xuICAgICAgICB0aGlzLmRhdGFCYXNlID0gZW50LmdldENvbXBvbmVudCgnRGF0YUJhc2UnKTtcbiAgICAgICAgLy8g6aG16Z2i5aSn5bCP5Y+R55Sf5Y+Y5YyW55qE5pe25YCZ5Lya6LCD55So6L+Z5Liq5LqL5Lu2XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgRmlyZS5TY3JlZW4ub24oJ3Jlc2l6ZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB3aWR0aCA9IHNlbGYuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoO1xuICAgICAgICAgICAgdmFyIGhlaWdodCA9IHNlbGYuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodDtcbiAgICAgICAgICAgIGlmICh3aWR0aCA8IGhlaWdodCkge1xuICAgICAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UudGlwc1dpbmRvdy5vcGVuVGlwc1dpbmRvdygn5qiq5bGP5pWI5p6c5pu05aW9IScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS50aXBzV2luZG93LmNsb3NlVGlwcygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdmFyIGRvY3VtZW50RWxlbWVudCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcbiAgICAgICAgdmFyIHdpZHRoID0gZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoO1xuICAgICAgICB2YXIgaGVpZ2h0ID0gZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodDtcbiAgICAgICAgdGhpcy5kb2N1bWVudEVsZW1lbnQgPSBkb2N1bWVudEVsZW1lbnQ7XG4gICAgICAgIGlmICh3aWR0aCA8IGhlaWdodCkge1xuICAgICAgICAgICAgdGhpcy5kYXRhQmFzZS50aXBzV2luZG93Lm9wZW5XaW5kb3coJ+aoquWxj+aViOaenOabtOWlvSEnKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy8g5byA5aeLXG4gICAgc3RhcnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8g6I635Y+W6I+c5Y2V5oyJ6ZKu5bm25LiU57uR5a6a5LqL5Lu2XG4gICAgICAgIHRoaXMuX2luaXRNZW51KCk7XG5cbiAgICAgICAgRmlyZS5FbmdpbmUucHJlbG9hZFNjZW5lKCdsYXVuY2gnKTtcbiAgICB9LFxuICAgIC8vIOabtOaWsFxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyDljLnphY1VSeWIhui+qOeOh1xuICAgICAgICAvL3ZhciBjYW1lcmEgPSBGaXJlLkNhbWVyYS5tYWluO1xuICAgICAgICAvL3ZhciBiZ1dvcmxkQm91bmRzID0gdGhpcy5kYXRhQmFzZS5iZ1JlbmRlci5nZXRXb3JsZEJvdW5kcygpO1xuICAgICAgICAvL3ZhciBiZ0xlZnRUb3BXb3JsZFBvcyA9IG5ldyBGaXJlLlZlYzIoYmdXb3JsZEJvdW5kcy54TWluLCBiZ1dvcmxkQm91bmRzLnlNYXgpO1xuICAgICAgICAvL3ZhciBiZ2xlZnRUb3AgPSBjYW1lcmEud29ybGRUb1NjcmVlbihiZ0xlZnRUb3BXb3JsZFBvcyk7XG4gICAgICAgIC8vdmFyIHNjcmVlblBvcyA9IG5ldyBGaXJlLlZlYzIoYmdsZWZ0VG9wLngsIGJnbGVmdFRvcC55KTtcbiAgICAgICAgLy92YXIgd29ybGRQb3MgPSBjYW1lcmEuc2NyZWVuVG9Xb3JsZChzY3JlZW5Qb3MpO1xuICAgICAgICAvL3RoaXMuZW50aXR5LnRyYW5zZm9ybS53b3JsZFBvc2l0aW9uID0gd29ybGRQb3M7XG4gICAgICAgIC8vIOWMuemFjVVJ5YiG6L6o546HXG4gICAgICAgIHZhciBjYW1lcmEgPSBGaXJlLkNhbWVyYS5tYWluO1xuICAgICAgICB2YXIgc2NyZWVuU2l6ZSA9IEZpcmUuU2NyZWVuLnNpemUubXVsKGNhbWVyYS5zaXplIC8gRmlyZS5TY3JlZW4uaGVpZ2h0KTtcbiAgICAgICAgdmFyIG5ld1BvcyA9IEZpcmUudjIoLXNjcmVlblNpemUueCAvIDIgKyB0aGlzLm1hcmdpbi54LCBzY3JlZW5TaXplLnkgLyAyIC0gdGhpcy5tYXJnaW4ueSk7XG4gICAgICAgIHRoaXMuZW50aXR5LnRyYW5zZm9ybS5wb3NpdGlvbiA9IG5ld1BvcztcbiAgICB9XG59KTtcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnYTVmNGVDTTg2dEsxYXpBRFcyTEp6S2snLCAnTWFpbk1lbnUnKTtcbi8vIHNjcmlwdFxcb3V0ZG9vclxcTWFpbk1lbnUuanNcblxudmFyIE1haW5NZW51ID0gRmlyZS5DbGFzcyh7XG4gICAgZXh0ZW5kczogRmlyZS5Db21wb25lbnQsXG5cbiAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLkVYUF9CQVJfTUFYX1ZBTFVFID0gMTUwO1xuICAgICAgICB0aGlzLl9jdXJUeXBlID0gMDtcbiAgICB9LFxuXG4gICAgcHJvcGVydGllczoge1xuICAgICAgICBvZmZzZXQ6IG5ldyBGaXJlLlZlYzIoNzUwLCAtMTIwKSxcbiAgICAgICAgLy8g5Lq654mp5aS05YOPXG4gICAgICAgIGhlYWRJY29uOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5TcHJpdGVSZW5kZXJlclxuICAgICAgICB9LFxuICAgICAgICBoZWFkTmFtZToge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuQml0bWFwVGV4dFxuICAgICAgICB9LFxuICAgICAgICAvLyDkurrnianlkI3np7BcbiAgICAgICAgdXNlcl9uYW1lOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5CaXRtYXBUZXh0XG4gICAgICAgIH0sXG4gICAgICAgIC8vIOS6uueJqeaIkOmVv+etiee6p1xuICAgICAgICB1c2VyX2xldmVsOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5UZXh0XG4gICAgICAgIH0sXG4gICAgICAgIC8vIOS6uueJqee7j+mqjOWAvFxuICAgICAgICB1c2VyX2V4cDoge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVGV4dFxuICAgICAgICB9LFxuICAgICAgICAvL1xuICAgICAgICB1c2VyX2V4cEJhcjoge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuU3ByaXRlUmVuZGVyZXJcbiAgICAgICAgfSxcbiAgICAgICAgLy8g5Li75Lq65b2i6LGhXG4gICAgICAgIHVzZXJfc3ByaXRlOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5TcHJpdGVSZW5kZXJlclxuICAgICAgICB9LFxuICAgICAgICBidG5fR29Ub1NpbmdsZToge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVG9nZ2xlXG4gICAgICAgIH0sXG4gICAgICAgIGJ0bl9Hb1RvVmlsbGE6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlRvZ2dsZVxuICAgICAgICB9LFxuICAgICAgICBidG5fR29Ub015QWRkOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5VSUJ1dHRvblxuICAgICAgICB9LFxuICAgICAgICBidG5fR29Ub0hvdXNlU2hvcDoge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVUlCdXR0b25cbiAgICAgICAgfSxcbiAgICAgICAgYnRuX0dvVG9EcmVzc1Nob3A6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlVJQnV0dG9uXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8g5Yid5aeL5YyW5Zy65pmvXG4gICAgbG9hZFNjcmVlbjogZnVuY3Rpb24gKHR5cGUpIHtcbiAgICAgICAgdmFyIHNlbmREYXRhID0ge1xuICAgICAgICAgICAgZHJlc3NfdHlwZTogdHlwZVxuICAgICAgICB9XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIGxvYWRUaXBUZXh0ID0gXCLljZXouqvlhazlr5PlpJbmma9cIjtcbiAgICAgICAgaWYgKHR5cGUgPT09IDIpIHtcbiAgICAgICAgICAgIGxvYWRUaXBUZXh0ID0gXCLliKvlooXlpJbnlYxcIjtcbiAgICAgICAgfVxuICAgICAgICBzZWxmLm9kYXRhQmFzZS5sb2FkVGlwLm9wZW5UaXBzKFwi6L295YWlXCIgKyBsb2FkVGlwVGV4dCArXCLkuK0s6K+356iN5ZCOIVwiKTtcbiAgICAgICAgc2VsZi5vZGF0YUJhc2UuaW5pdFNjcmVlbihzZW5kRGF0YSwgZnVuY3Rpb24gKHNlcnZlckRhdGEpIHtcbiAgICAgICAgICAgIHNlbGYub2RhdGFCYXNlLmxvYWRUaXAuY2xvc2VUaXBzKCk7XG4gICAgICAgICAgICBpZighIHNlcnZlckRhdGEpIHtcbiAgICAgICAgICAgICAgICBzZWxmLm9kYXRhQmFzZS5sb2FkVGlwLmNsb3NlVGlwcygpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNlbGYub2RhdGFCYXNlLmNoYXJhY3RlcnMuZW50aXR5LmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgLy8g5bGL5Li75pWw5o2uXG4gICAgICAgICAgICBpZiAoc2VydmVyRGF0YS5mYW1pbHkubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHNlbGYub2RhdGFCYXNlLmNoYXJhY3RlcnMuZW50aXR5LmFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgdmFyIGhvc3QgPSBzZXJ2ZXJEYXRhLmZhbWlseVswXTtcbiAgICAgICAgICAgICAgICB2YXIgaG9zdF91cmwgPSBob3N0LmZpZ3VyZV91cmw7XG4gICAgICAgICAgICAgICAgdmFyIGhvc3RfbmFtZSA9IGhvc3QudXNlcl9uYW1lO1xuICAgICAgICAgICAgICAgIHNlbGYub2RhdGFCYXNlLmxvYWRJbWFnZShob3N0X3VybCwgZnVuY3Rpb24gKGVycm9yLCBpbWFnZSkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLm9kYXRhQmFzZS5jaGFyYWN0ZXJzLnNldEhvc3QoaW1hZ2UsIGhvc3RfbmFtZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyDlrrbkurrmlbDmja5cbiAgICAgICAgICAgIGlmKHNlcnZlckRhdGEuZmFtaWx5Lmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICBmb3IodmFyIGkgPSAxLCBsZW4gPSBzZXJ2ZXJEYXRhLmZhbWlseS5sZW5ndGg7IGkgPCBsZW47ICsraSApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZhbWlseSA9IHNlcnZlckRhdGEuZmFtaWx5W2ldO1xuICAgICAgICAgICAgICAgICAgICB2YXIgZmFtaWx5X3VybCA9IGZhbWlseS5maWd1cmVfdXJsO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLm9kYXRhQmFzZS5sb2FkSW1hZ2UoZmFtaWx5X3VybCwgZnVuY3Rpb24gKGZhbWlseSwgZXJyb3IsIGltYWdlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZmFtaWx5X25hbWUgPSBmYW1pbHkucmVsYXRpb25fbmFtZSArIFwiIFwiICsgZmFtaWx5LnVzZXJfbmFtZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYub2RhdGFCYXNlLmNoYXJhY3RlcnMuYWRkRmFtaWx5KGltYWdlLCBmYW1pbHlfbmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzLCBmYW1pbHkpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHNlbGYuaGVhZE5hbWUudGV4dCA9IHNlcnZlckRhdGEub3duZXJpbmZvLnVzZXJfbmFtZTtcbiAgICAgICAgICAgIHNlbGYub2RhdGFCYXNlLnVpZCA9IHNlcnZlckRhdGEub3duZXJpbmZvLnVpZDtcbiAgICAgICAgICAgIHNlbGYudXNlcl9uYW1lLnRleHQgPSBzZXJ2ZXJEYXRhLm93bmVyaW5mby51c2VyX25hbWU7XG4gICAgICAgICAgICBzZWxmLnVzZXJfbGV2ZWwudGV4dCA9IHNlcnZlckRhdGEub3duZXJpbmZvLmdyYWRlO1xuXG4gICAgICAgICAgICB2YXIgY3VyRXhwID0gc2VydmVyRGF0YS5vd25lcmluZm8uZ3VfaGF2ZTtcbiAgICAgICAgICAgIHZhciBtYXhFeHAgPSBzZXJ2ZXJEYXRhLm93bmVyaW5mby5ndV9uZWVkO1xuICAgICAgICAgICAgc2VsZi51c2VyX2V4cC50ZXh0ID0gY3VyRXhwICsgXCIvXCIgKyBtYXhFeHA7XG4gICAgICAgICAgICB2YXIgcGVyY2VudGFnZSA9IHBhcnNlRmxvYXQoY3VyRXhwIC8gbWF4RXhwKTtcbiAgICAgICAgICAgIHZhciBleHBCYXJWYWx1ZSA9IHNlbGYuRVhQX0JBUl9NQVhfVkFMVUUgKiBwZXJjZW50YWdlO1xuICAgICAgICAgICAgc2VsZi51c2VyX2V4cEJhci5jdXN0b21XaWR0aCA9IGV4cEJhclZhbHVlO1xuXG4gICAgICAgICAgICB2YXIgdXJsID0gc2VydmVyRGF0YS5vd25lcmluZm8uaW1hZ2VfdXJsO1xuICAgICAgICAgICAgc2VsZi5vZGF0YUJhc2UubG9hZEltYWdlKHVybCwgZnVuY3Rpb24gKGVycm9yLCBpbWFnZSkge1xuICAgICAgICAgICAgICAgIGlmKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc2VsZi5oZWFkSWNvbi5zcHJpdGUgPSBuZXcgRmlyZS5TcHJpdGUoaW1hZ2UpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHNlbGYub2RhdGFCYXNlLmhvdXNlLm9uQ2xpY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX2N1clR5cGUgPT09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgRmlyZS5FbmdpbmUubG9hZFNjZW5lKCdzaW5nbGUnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIEZpcmUuRW5naW5lLmxvYWRTY2VuZSgndmlsbGEnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIOmAgumFjeiDjOaZr1xuICAgICAgICAgICAgc2VsZi5vZGF0YUJhc2UuYmdSZW5kZXIuY3VzdG9tV2lkdGggPSBzZWxmLndpZHRoICogKEZpcmUuQ2FtZXJhLm1haW4uc2l6ZSAvIHNlbGYuaGVpZ2h0KTtcbiAgICAgICAgICAgIHNlbGYub2RhdGFCYXNlLmJnUmVuZGVyLmN1c3RvbUhlaWdodCA9IEZpcmUuQ2FtZXJhLm1haW4uc2l6ZTtcbiAgICAgICAgICAgIC8vIOmAgumFjeaIv+Wxi1xuICAgICAgICAgICAgc2VsZi5vZGF0YUJhc2UuaG91c2UuYnRuUmVuZGVyLmN1c3RvbVdpZHRoID0gc2VsZi53aWR0aCAqIChGaXJlLkNhbWVyYS5tYWluLnNpemUgLyBzZWxmLmhlaWdodCk7XG4gICAgICAgICAgICBzZWxmLm9kYXRhQmFzZS5ob3VzZS5idG5SZW5kZXIuY3VzdG9tSGVpZ2h0ID0gRmlyZS5DYW1lcmEubWFpbi5zaXplO1xuXG4gICAgICAgICAgICBzZWxmLm9kYXRhQmFzZS5zdWJNZW51Lm9wZW5TdWJNZW51KHR5cGUpO1xuXG4gICAgICAgICAgICBzZWxmLm9kYXRhQmFzZS5tYXNrLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICB9KVxuICAgIH0sXG5cbiAgICAvLyB1c2UgdGhpcyBmb3IgaW5pdGlhbGl6YXRpb25cbiAgICBzdGFydDogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyDluLjnlKjnmoTlj5jph48v5pWw5o2uXG4gICAgICAgIHZhciBlbnQgPSBGaXJlLkVudGl0eS5maW5kKCcvT0RhdGFCYXNlJyk7XG4gICAgICAgIHRoaXMub2RhdGFCYXNlID0gZW50LmdldENvbXBvbmVudCgnT0RhdGFCYXNlJyk7XG5cbiAgICAgICAgRmlyZS5FbmdpbmUucHJlbG9hZFNjZW5lKCdzaW5nbGUnKTtcbiAgICAgICAgRmlyZS5FbmdpbmUucHJlbG9hZFNjZW5lKCd2aWxsYScpO1xuXG4gICAgICAgIHRoaXMuYnRuX0dvVG9TaW5nbGUub25DbGljayA9IHRoaXMub25Hb1RvU2luZ2xlRXZlbnQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5idG5fR29Ub1ZpbGxhLm9uQ2xpY2sgPSB0aGlzLm9uR29Ub1ZpbGxhRXZlbnQuYmluZCh0aGlzKTtcblxuICAgICAgICB0aGlzLmJ0bl9Hb1RvTXlBZGQub25DbGljayA9IHRoaXMub25Hb1RvTXlBZGRFdmVudC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmJ0bl9Hb1RvSG91c2VTaG9wLm9uQ2xpY2sgPSB0aGlzLm9uR29Ub0hvdXNlU2hvcEV2ZW50LmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuYnRuX0dvVG9EcmVzc1Nob3Aub25DbGljayA9IHRoaXMub25Hb1RvRHJlc3NTaG9wRXZlbnQuYmluZCh0aGlzKTtcblxuICAgICAgICB0aGlzLmRvY3VtZW50RWxlbWVudCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcbiAgICAgICAgdGhpcy53aWR0aCA9IHRoaXMuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoO1xuICAgICAgICB0aGlzLmhlaWdodCA9IHRoaXMuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodDtcblxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIEZpcmUuU2NyZWVuLm9uKCdyZXNpemUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgd2lkdGggPSBzZWxmLmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aDtcbiAgICAgICAgICAgIHZhciBoZWlnaHQgPSBzZWxmLmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQ7XG4gICAgICAgICAgICBpZiAod2lkdGggPCBoZWlnaHQpIHtcbiAgICAgICAgICAgICAgICBzZWxmLm9kYXRhQmFzZS50aXBDb21tb24ub3BlblRpcHNXaW5kb3coXCLmqKrlsY/mlYjmnpzmm7Tlpb0hXCIpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBUT0RPIOWFs+mXrVxuICAgICAgICAgICAgICAgIHNlbGYub2RhdGFCYXNlLnRpcENvbW1vbi5jbG9zZVRpcHMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgc2VsZi5idG5fR29Ub1NpbmdsZS5kZWZhdWx0VG9nZ2xlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi6L+b5YWl5Y2V6Lqr5YWs5a+T5aSW5pmvXCIpO1xuICAgICAgICAgICAgc2VsZi5idG5fR29Ub1NpbmdsZS50ZXh0Q29udGVudC5jb2xvciA9IEZpcmUuQ29sb3Iud2hpdGU7XG4gICAgICAgICAgICBzZWxmLmxvYWRTY3JlZW4oMSk7XG4gICAgICAgIH0pO1xuXG5cbiAgICB9LFxuICAgIC8vIOmHjee9rlRvZ2dsZeeKtuaAgVxuICAgIG1vZGlmeVRvZ2dsZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmJ0bl9Hb1RvU2luZ2xlLnRleHRDb250ZW50LmNvbG9yID0gRmlyZS5Db2xvci5yZWQ7XG4gICAgICAgIHRoaXMuYnRuX0dvVG9TaW5nbGUucmVzZXRUb2dnbGUoKTtcbiAgICAgICAgdGhpcy5idG5fR29Ub1ZpbGxhLnRleHRDb250ZW50LmNvbG9yID0gRmlyZS5Db2xvci5yZWQ7XG4gICAgICAgIHRoaXMuYnRuX0dvVG9WaWxsYS5yZXNldFRvZ2dsZSgpO1xuICAgIH0sXG5cbiAgICBvbkdvVG9TaW5nbGVFdmVudDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLm1vZGlmeVRvZ2dsZSgpO1xuICAgICAgICB0aGlzLmJ0bl9Hb1RvU2luZ2xlLnRleHRDb250ZW50LmNvbG9yID0gRmlyZS5Db2xvci53aGl0ZTtcbiAgICAgICAgY29uc29sZS5sb2coXCLov5vlhaXljZXouqvlhazlr5PlpJbmma9cIik7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgc2VsZi5sb2FkU2NyZWVuKDEpO1xuICAgIH0sXG4gICAgb25Hb1RvVmlsbGFFdmVudDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLm1vZGlmeVRvZ2dsZSgpO1xuICAgICAgICB0aGlzLmJ0bl9Hb1RvVmlsbGEudGV4dENvbnRlbnQuY29sb3IgPSBGaXJlLkNvbG9yLndoaXRlO1xuICAgICAgICBjb25zb2xlLmxvZyhcIui/m+WFpeWIq+WiheWkluaZr1wiKTtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBzZWxmLmxvYWRTY3JlZW4oMik7XG4gICAgfSxcbiAgICBvbkdvVG9NeUFkZEV2ZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwi5omT5byA5oiR5Yqg5YWl55qEXCIpO1xuICAgICAgICB0aGlzLm9kYXRhQmFzZS5teUFkZEZhbWlseVdpbi5vcGVuV2luZG93KCk7XG4gICAgfSxcbiAgICBvbkdvVG9Ib3VzZVNob3BFdmVudDogZnVuY3Rpb24gKCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIuaJk+W8gOaIv+Wxi+WVhuWfjlwiKTtcbiAgICAgICAgd2luZG93Lm9wZW4oXCJodHRwOi8vd3d3LnNhaWtlLmNvbS9ob3VzZXNob3AvbnNob3AucGhwXCIpO1xuICAgIH0sXG4gICAgb25Hb1RvRHJlc3NTaG9wRXZlbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCLmiZPlvIDmia7pnZPllYbln45cIik7XG4gICAgICAgIHdpbmRvdy5vcGVuKCdodHRwOi8vd3d3LnNhaWtlLmNvbS9ob3VzZWRyZXNzL3Nob3AucGhwJyk7XG4gICAgfSxcblxuICAgIC8vIGNhbGxlZCBldmVyeSBmcmFtZVxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyDljLnphY1VSeWIhui+qOeOh1xuICAgICAgICB2YXIgY2FtZXJhID0gRmlyZS5DYW1lcmEubWFpbjtcbiAgICAgICAgdmFyIGJnV29ybGRCb3VuZHMgPSB0aGlzLm9kYXRhQmFzZS5iZ1JlbmRlci5nZXRXb3JsZEJvdW5kcygpO1xuICAgICAgICB2YXIgYmdMZWZ0VG9wV29ybGRQb3MgPSBuZXcgRmlyZS5WZWMyKGJnV29ybGRCb3VuZHMueE1pbisgdGhpcy5vZmZzZXQueCwgYmdXb3JsZEJvdW5kcy55TWF4ICsgdGhpcy5vZmZzZXQueSk7XG4gICAgICAgIHZhciBiZ2xlZnRUb3AgPSBjYW1lcmEud29ybGRUb1NjcmVlbihiZ0xlZnRUb3BXb3JsZFBvcyk7XG4gICAgICAgIHZhciBzY3JlZW5Qb3MgPSBuZXcgRmlyZS5WZWMyKGJnbGVmdFRvcC54LCBiZ2xlZnRUb3AueSk7XG4gICAgICAgIHZhciB3b3JsZFBvcyA9IGNhbWVyYS5zY3JlZW5Ub1dvcmxkKHNjcmVlblBvcyk7XG4gICAgICAgIHRoaXMuZW50aXR5LnRyYW5zZm9ybS53b3JsZFBvc2l0aW9uID0gd29ybGRQb3M7XG4gICAgfVxufSk7XG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJzJmZmQ1dzNDTHhFTDVvdUV5dTg4ampCJywgJ01lcmNoYW5kaXNlJyk7XG4vLyBzY3JpcHRcXHZpbGxhXFxNZXJjaGFuZGlzZS5qc1xuXG52YXIgTWVyY2hhbmRpc2UgPSBGaXJlLkNsYXNzKHtcclxuICAgIGV4dGVuZHM6IEZpcmUuQ29tcG9uZW50LFxyXG4gICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAvLyBpZDtcclxuICAgICAgICB0aGlzLnRpZCA9IDA7XHJcbiAgICAgICAgLy8g5pWw6YePXHJcbiAgICAgICAgdGhpcy5udW0gPSAxO1xyXG4gICAgICAgIC8vIOaJk+aKmFxyXG4gICAgICAgIHRoaXMuZGlzY291bnQgPSAxO1xyXG4gICAgICAgIC8vIOWNleS4quS7t+mSsVxyXG4gICAgICAgIHRoaXMucHJpY2UgPSAwO1xyXG4gICAgICAgIC8vIOaZrumAmuS7t1xyXG4gICAgICAgIHRoaXMub3JkaW5hcnlQcmljZVZhbHVlID0gMDtcclxuICAgICAgICAvLyDmiZPmipjku7dcclxuICAgICAgICB0aGlzLmRpc2NvdW50UHJpY2VWYWx1ZSA9IDA7XHJcbiAgICAgICAgLy8g5Yi35paw5oC75Lu35qC8XHJcbiAgICAgICAgdGhpcy5vbnJlZnJlc2hQcmljZUV2ZW50ID0gbnVsbDtcclxuICAgIH0sXHJcbiAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgaWNvbjoge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlNwcml0ZVJlbmRlcmVyXHJcbiAgICAgICAgfSxcclxuICAgICAgICB0TmFtZToge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlRleHRcclxuICAgICAgICB9LFxyXG4gICAgICAgIHROdW06IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5UZXh0XHJcbiAgICAgICAgfSxcclxuICAgICAgICBidG5fbGVzczoge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlVJQnV0dG9uXHJcbiAgICAgICAgfSxcclxuICAgICAgICBidG5fYWRkOiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVUlCdXR0b25cclxuICAgICAgICB9LFxyXG4gICAgICAgIG9yZGluYXJ5UHJpY2U6IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5UZXh0XHJcbiAgICAgICAgfSxcclxuICAgICAgICBkaXNjb3VudFByaWNlOiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVGV4dFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYnRuX2RlbDoge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlVJQnV0dG9uXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIOmHjee9rlxyXG4gICAgcmVzZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLmljb24uc3ByaXRlID0gbnVsbDtcclxuICAgICAgICB0aGlzLnROYW1lLnRleHQgPSAnJztcclxuICAgICAgICB0aGlzLnNldE51bSgwKTtcclxuICAgICAgICB0aGlzLm9yZGluYXJ5UHJpY2UudGV4dCA9IDAgKyBcIkPluIFcIjtcclxuICAgICAgICB0aGlzLmRpc2NvdW50UHJpY2UudGV4dCA9IDAgKyBcIkPluIFcIjtcclxuICAgICAgICB0aGlzLmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcclxuICAgIH0sXHJcbiAgICAvLyDlh4/lsJHmlbDph49cclxuICAgIF9vbkxlc3NFdmVudDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICh0aGlzLm51bSA9PT0gMSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMubnVtLS07XHJcbiAgICAgICAgaWYgKHRoaXMubnVtIDwgMSkge1xyXG4gICAgICAgICAgICB0aGlzLm51bSA9IDE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc2V0TnVtKHRoaXMubnVtKTtcclxuICAgICAgICB0aGlzLnJlZnJlc2hPcmRpbmFyeVByaWNlKCk7XHJcbiAgICAgICAgaWYgKHRoaXMub25yZWZyZXNoUHJpY2VFdmVudCkge1xyXG4gICAgICAgICAgICB0aGlzLm9ucmVmcmVzaFByaWNlRXZlbnQodGhpcy50aWQsIHRoaXMubnVtKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8g5aKe5Yqg5pWw6YePXHJcbiAgICBfb25BZGRFdmVudDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMubnVtKys7XHJcbiAgICAgICAgdGhpcy5zZXROdW0odGhpcy5udW0pO1xyXG4gICAgICAgIHRoaXMucmVmcmVzaE9yZGluYXJ5UHJpY2UoKTtcclxuICAgICAgICBpZiAodGhpcy5vbnJlZnJlc2hQcmljZUV2ZW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMub25yZWZyZXNoUHJpY2VFdmVudCh0aGlzLnRpZCwgdGhpcy5udW0pO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvLyDorr7nva7mlbDph49cclxuICAgIHNldE51bTogZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgdGhpcy5udW0gPSB2YWx1ZTtcclxuICAgICAgICB0aGlzLnROdW0udGV4dCA9IHZhbHVlO1xyXG4gICAgfSxcclxuICAgIC8vIOiuvue9ruaZrumAmuS7t1xyXG4gICAgcmVmcmVzaE9yZGluYXJ5UHJpY2U6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLm9yZGluYXJ5UHJpY2VWYWx1ZSA9IHRoaXMubnVtICogdGhpcy5wcmljZTtcclxuICAgICAgICB0aGlzLm9yZGluYXJ5UHJpY2UudGV4dCA9IHRoaXMub3JkaW5hcnlQcmljZVZhbHVlICsgXCJD5biBXCI7XHJcbiAgICAgICAgLy8g6K6+572u5omT5oqY5Lu3XHJcbiAgICAgICAgdGhpcy5yZWZyZXNoRGlzY291bnRQcmljZSgpO1xyXG4gICAgfSxcclxuICAgIC8vIOiuvue9ruaJk+aKmOS7t1xyXG4gICAgcmVmcmVzaERpc2NvdW50UHJpY2U6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLmRpc2NvdW50UHJpY2VWYWx1ZSA9IHRoaXMub3JkaW5hcnlQcmljZVZhbHVlICogdGhpcy5kaXNjb3VudDtcclxuICAgICAgICB0aGlzLmRpc2NvdW50UHJpY2UudGV4dCA9IHRoaXMuZGlzY291bnRQcmljZVZhbHVlICsgXCJD5biBXCI7XHJcbiAgICB9LFxyXG4gICAgLy8g5Yi35pawXHJcbiAgICByZWZyZXNoOiBmdW5jdGlvbiAoZGF0YSwgZGVsRXZlbnQsIHJlZnJlc2hQcmljZUV2ZW50KSB7XHJcbiAgICAgICAgdGhpcy50aWQgPSBkYXRhLnRpZDtcclxuICAgICAgICB0aGlzLmljb24uc3ByaXRlID0gZGF0YS5pY29uIHx8IG51bGw7XHJcbiAgICAgICAgdGhpcy50TmFtZS50ZXh0ID0gZGF0YS50TmFtZSB8fCAnJztcclxuICAgICAgICB0aGlzLnNldE51bShkYXRhLnROdW0gfHwgMCk7XHJcbiAgICAgICAgdGhpcy5wcmljZSA9IGRhdGEucHJpY2U7XHJcbiAgICAgICAgdGhpcy5kaXNjb3VudCA9IGRhdGEuZGlzY291bnQ7XHJcbiAgICAgICAgdGhpcy5yZWZyZXNoT3JkaW5hcnlQcmljZSgpO1xyXG4gICAgICAgIHRoaXMuYnRuX2RlbC5vbkNsaWNrID0gZGVsRXZlbnQgfHwgbnVsbDtcclxuICAgICAgICB0aGlzLm9ucmVmcmVzaFByaWNlRXZlbnQgPSByZWZyZXNoUHJpY2VFdmVudDtcclxuICAgICAgICB0aGlzLmVudGl0eS5hY3RpdmUgPSB0cnVlO1xyXG4gICAgfSxcclxuICAgIC8vXHJcbiAgICBzdGFydDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuYnRuX2xlc3Mub25DbGljayA9IHRoaXMuX29uTGVzc0V2ZW50LmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5idG5fYWRkLm9uQ2xpY2sgPSB0aGlzLl9vbkFkZEV2ZW50LmJpbmQodGhpcyk7XHJcbiAgICB9XHJcbn0pO1xyXG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJzQ1ZGVmZ2lzaHRDMktUNXVzK2ptWE5aJywgJ015QWRkRmFtaWx5V2luZG93Jyk7XG4vLyBzY3JpcHRcXG91dGRvb3JcXE15QWRkRmFtaWx5V2luZG93LmpzXG5cbnZhciBNeUFkZEZhbWlseVdpbmRvdyA9IEZpcmUuQ2xhc3Moe1xuICAgIC8vIOe7p+aJv1xuICAgIGV4dGVuZHM6IEZpcmUuQ29tcG9uZW50LFxuICAgIC8vIOaehOmAoOWHveaVsFxuICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuX2FkZE15RmFtaWx5RGF0YVNoZWV0cyA9IFtdO1xuICAgICAgICAvLyDmr4/pobXmmL7npLrlpJrlsJHkuKpcbiAgICAgICAgdGhpcy5fc2hvd1BhZ2VDb3VudCA9IDc7XG4gICAgICAgIC8vIOaAu+aVsFxuICAgICAgICB0aGlzLl9jdXJUb3RhbCA9IDA7XG4gICAgICAgIC8vIOW9k+WJjemhteaVsFxuICAgICAgICB0aGlzLl9jdXJQYWdlID0gMTtcbiAgICAgICAgLy8g5pyA5aSn6aG15pWwXG4gICAgICAgIHRoaXMuX21heFBhZ2UgPSAxO1xuICAgICAgICAvL1xuICAgICAgICB0aGlzLnJlbGlldmVpbmcgPSBmYWxzZTtcbiAgICB9LFxuICAgIC8vIOWxnuaAp1xuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgdGVtcEFkZEZhbWlseToge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuRW50aXR5XG4gICAgICAgIH0sXG4gICAgICAgIHJvb3Q6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLkVudGl0eVxuICAgICAgICB9LFxuICAgICAgICBidG5fY2xvc2U6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlVJQnV0dG9uXG4gICAgICAgIH0sXG4gICAgICAgIGJ0bl9uZXh0OiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5VSUJ1dHRvblxuICAgICAgICB9LFxuICAgICAgICBidG5fcHJldmlvdXM6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlVJQnV0dG9uXG4gICAgICAgIH0sXG4gICAgICAgIHBhZ2VUZXh0OiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5UZXh0XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgc3RhcnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8g5bi455So55qE5Y+Y6YePL+aVsOaNrlxuICAgICAgICB2YXIgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL09EYXRhQmFzZScpO1xuICAgICAgICB0aGlzLm9kYXRhQmFzZSA9IGVudC5nZXRDb21wb25lbnQoJ09EYXRhQmFzZScpO1xuICAgICAgICAvL1xuICAgICAgICB0aGlzLmJ0bl9jbG9zZS5vbkNsaWNrID0gdGhpcy5fb25DbG9zZVdpbmRvd0V2ZW50LmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuYnRuX3ByZXZpb3VzLm9uQ2xpY2sgPSB0aGlzLl9vbk5leHRQYWdlRXZuZXQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5idG5fbmV4dC5vbkNsaWNrID0gdGhpcy5fb25QcmV2aW91c1BhZ2VFdmVudC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmJ0bl9wcmV2aW91cy5lbnRpdHkuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuYnRuX25leHQuZW50aXR5LmFjdGl2ZSA9IGZhbHNlO1xuICAgIH0sXG4gICAgLy8g6YeN572uXG4gICAgcmVzZXREYXRhOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBjaGlsZHJlbiA9IHRoaXMucm9vdC5nZXRDaGlsZHJlbigpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBjaGlsZHJlbltpXS5kZXN0cm95KCk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIOi/m+WFpeaIv+Wxi1xuICAgIF9vbkdvVG9Ib3VzZUV2ZW50OiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgdGhpcy5jbG9zZVdpbmRvdygpO1xuICAgICAgICB2YXIgZmFtaWx5SW5mbyA9IGV2ZW50LnRhcmdldC5wYXJlbnQuZ2V0Q29tcG9uZW50KCdGYW1pbHlJbmZvJyk7XG4gICAgICAgIHZhciBzZW5kRGF0YSA9IHtcbiAgICAgICAgICAgIGhvdXNlX3VpZDogMCxcbiAgICAgICAgICAgIGZsb29yX2lkOiAwLFxuICAgICAgICAgICAgbWFyazogZmFtaWx5SW5mby5tYXJrXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMub2RhdGFCYXNlLnBsYW5XaW4ub3BlbldpbmRvdyhzZW5kRGF0YSk7XG4gICAgfSxcbiAgICAvLyDop6PpmaTlhbPns7tcbiAgICBfb25SZWxpZXZlRXZlbnQ6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIGlmIChzZWxmLnJlbGlldmVpbmcpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgZmFtaWx5SW5mbyA9IGV2ZW50LnRhcmdldC5wYXJlbnQuZ2V0Q29tcG9uZW50KCdGYW1pbHlJbmZvJyk7XG4gICAgICAgIHNlbGYub2RhdGFCYXNlLnRpcENvbW1vbi5vcGVuVGlwc1dpbmRvdyhcIuaYr+WQpuS4jiBcIiArIGZhbWlseUluZm8ubG92ZXJfbmFtZSArIFwiIOino+mZpOWFs+ezuz9cIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2VsZi5yZWxpZXZlaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIHZhciBzZW5kRGF0YSA9IHtcbiAgICAgICAgICAgICAgICBtYXJrOiBmYW1pbHlJbmZvLm1hcmtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBzZWxmLm9kYXRhQmFzZS5zZXJ2ZXJOZXRXb3JrLlJlcXVlc3REaXNhc3NvY2lhdGVMaXN0KHNlbmREYXRhLCBmdW5jdGlvbiAoc2VydmVyRGF0YSkge1xuICAgICAgICAgICAgICAgIGlmIChzZXJ2ZXJEYXRhLnN0YXR1cyA9PT0gMTAwMDApIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5yZWZyZXNoRmxvb3JEYXRhKHNlcnZlckRhdGEsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuY3JlYXRlRmFtaWx5SW5mbygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5yZWxpZXZlaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi50aXBDb21tb24ub3BlblRpcHNXaW5kb3coc2VydmVyRGF0YS5kZXNjKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICAvLyDlhbPpl63mjInpkq7kuovku7ZcbiAgICBfb25DbG9zZVdpbmRvd0V2ZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuY2xvc2VXaW5kb3coKTtcbiAgICB9LFxuICAgIC8vIOWIt+aWsOaMiemSrueKtuaAgVxuICAgIF9yZWZyZXNoQnRuU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5idG5fcHJldmlvdXMuZW50aXR5LmFjdGl2ZSA9IHRoaXMuX2N1clBhZ2UgPiAxO1xuICAgICAgICB0aGlzLmJ0bl9uZXh0LmVudGl0eS5hY3RpdmUgPSB0aGlzLl9jdXJQYWdlIDwgdGhpcy5fbWF4UGFnZTtcbiAgICAgICAgdGhpcy5wYWdlVGV4dC50ZXh0ID0gJ+mhteaVsDonICsgdGhpcy5fY3VyUGFnZSArIFwiL1wiICsgdGhpcy5fbWF4UGFnZTtcbiAgICB9LFxuICAgIC8vIOS4i+S4gOmhtVxuICAgIF9vbk5leHRQYWdlRXZuZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5fY3VyUGFnZSAtPSAxO1xuICAgICAgICBpZiAodGhpcy5fY3VyUGFnZSA8IDEpe1xuICAgICAgICAgICAgdGhpcy5fY3VyUGFnZSA9IDE7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jcmVhdGVGYW1pbHlJbmZvKCk7XG4gICAgfSxcbiAgICAvLyDkuIrkuIDpobVcbiAgICBfb25QcmV2aW91c1BhZ2VFdmVudDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLl9jdXJQYWdlICs9IDE7XG4gICAgICAgIGlmICh0aGlzLl9jdXJQYWdlID4gdGhpcy5fbWF4UGFnZSl7XG4gICAgICAgICAgICB0aGlzLl9jdXJQYWdlID0gdGhpcy5fbWF4UGFnZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNyZWF0ZUZhbWlseUluZm8oKTtcbiAgICB9LFxuICAgIHJlZnJlc2hGbG9vckRhdGE6IGZ1bmN0aW9uIChzZXJ2ZXJEYXRhLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIGlmIChzZXJ2ZXJEYXRhLnN0YXR1cyAhPT0gMTAwMDApIHtcbiAgICAgICAgICAgIHNlbGYub2RhdGFCYXNlLnRpcENvbW1vbi5vcGVuVGlwc1dpbmRvdyhzZXJ2ZXJEYXRhLmRlc2MpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHNlbGYuX2FkZE15RmFtaWx5RGF0YVNoZWV0cyA9IFtdO1xuICAgICAgICBzZXJ2ZXJEYXRhLmxpc3QubXlsaXZlZC5mb3JFYWNoKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICBzZWxmLl9hZGRNeUZhbWlseURhdGFTaGVldHMucHVzaChkYXRhKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy9cbiAgICBjcmVhdGVGYW1pbHlJbmZvOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMucmVzZXREYXRhKCk7XG4gICAgICAgIHZhciBkYXRhU2hlZXRzID0gdGhpcy5fYWRkTXlGYW1pbHlEYXRhU2hlZXRzO1xuICAgICAgICB2YXIgYmluZEdvdEhvdXNlRXZlbnQgPSB0aGlzLl9vbkdvVG9Ib3VzZUV2ZW50LmJpbmQodGhpcyk7XG4gICAgICAgIHZhciBiaW5kUmVsaWV2ZUV2ZW50ID0gdGhpcy5fb25SZWxpZXZlRXZlbnQuYmluZCh0aGlzKTtcbiAgICAgICAgLy9cbiAgICAgICAgdGhpcy5fY3VyVG90YWwgPSBkYXRhU2hlZXRzLmxlbmd0aDtcbiAgICAgICAgdGhpcy5fbWF4UGFnZSA9IE1hdGguY2VpbCh0aGlzLl9jdXJUb3RhbCAvIHRoaXMuX3Nob3dQYWdlQ291bnQpO1xuICAgICAgICBpZiAodGhpcy5fbWF4UGFnZSA9PT0gMCkge1xuICAgICAgICAgICAgdGhpcy5fbWF4UGFnZSA9IDE7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHN0YXJ0Q291bnQgPSAodGhpcy5fY3VyUGFnZSAtIDEpICogdGhpcy5fc2hvd1BhZ2VDb3VudDtcbiAgICAgICAgdmFyIGVudENvdW50ID0gc3RhcnRDb3VudCArIHRoaXMuX3Nob3dQYWdlQ291bnQ7XG4gICAgICAgIGlmIChlbnRDb3VudCA+IHRoaXMuX2N1clRvdGFsKSB7XG4gICAgICAgICAgICBlbnRDb3VudCA9IHRoaXMuX2N1clRvdGFsO1xuICAgICAgICB9XG4gICAgICAgIHZhciBpbmRleCA9IDA7XG4gICAgICAgIGZvciAodmFyIGkgPSBzdGFydENvdW50OyBpIDwgZW50Q291bnQ7ICsraSkge1xuICAgICAgICAgICAgdmFyIGRhdGEgPSBkYXRhU2hlZXRzW2ldO1xuICAgICAgICAgICAgdmFyIGVudCA9IEZpcmUuaW5zdGFudGlhdGUodGhpcy50ZW1wQWRkRmFtaWx5KTtcbiAgICAgICAgICAgIGVudC5uYW1lID0gaS50b1N0cmluZygpO1xuICAgICAgICAgICAgZW50LnBhcmVudCA9IHRoaXMucm9vdDtcbiAgICAgICAgICAgIGVudC5hY3RpdmUgPSB0cnVlO1xuICAgICAgICAgICAgZW50LnRyYW5zZm9ybS5wb3NpdGlvbiA9IG5ldyBGaXJlLlZlYzIoLTIuNSwgKGluZGV4ICogNzcpKTtcbiAgICAgICAgICAgIHZhciBpbmZvID0gZW50LmdldENvbXBvbmVudCgnRmFtaWx5SW5mbycpO1xuICAgICAgICAgICAgaW5mby5yZWZyZXNoKGRhdGEsIGJpbmRHb3RIb3VzZUV2ZW50LCBiaW5kUmVsaWV2ZUV2ZW50KTtcbiAgICAgICAgICAgIGluZGV4Kys7XG4gICAgICAgIH1cbiAgICAgICAgLy8g5Yi35paw5oyJ6ZKu54q25oCBXG4gICAgICAgIHRoaXMuX3JlZnJlc2hCdG5TdGF0ZSgpO1xuICAgIH0sXG4gICAgLy8g5omT5byA56qX5Y+jXG4gICAgb3BlbldpbmRvdzogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmVudGl0eS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHNlbGYub2RhdGFCYXNlLmxvYWRUaXAub3BlblRpcHMoJ+i9veWFpeaVsOaNru+8geivt+eojeWQji4uLicpO1xuICAgICAgICBzZWxmLm9kYXRhQmFzZS5zZXJ2ZXJOZXRXb3JrLlJlcXVlc3RGbG9vckxpc3QoZnVuY3Rpb24gKHNlcnZlckRhdGEpIHtcbiAgICAgICAgICAgIHNlbGYub2RhdGFCYXNlLmxvYWRUaXAuY2xvc2VUaXBzKCk7XG4gICAgICAgICAgICBzZWxmLnJlZnJlc2hGbG9vckRhdGEoc2VydmVyRGF0YSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmIChzZWxmLl9hZGRNeUZhbWlseURhdGFTaGVldHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYub2RhdGFCYXNlLnRpcE5vQWRkRmFtaWx5Lm9wZW5UaXBzV2luZG93KG51bGwsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5vcGVuKFwiaHR0cDovL3d3dy5zYWlrZS5jb20vaG91c2VzaG9wL25ld2hvdXNlLnBocFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuY2xvc2VXaW5kb3coKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzZWxmLmNyZWF0ZUZhbWlseUluZm8oKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIC8vIOWFs+mXreeql+WPo1xuICAgIGNsb3NlV2luZG93OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuZW50aXR5LmFjdGl2ZSA9IGZhbHNlO1xuICAgIH1cbn0pO1xuXG5GaXJlLl9SRnBvcCgpOyIsIkZpcmUuX1JGcHVzaChtb2R1bGUsICcxNmM3ZGVoM2xOR21weTJtdEVMdThCVycsICdOZXR3b3JrTWdyJyk7XG4vLyBzY3JpcHRcXHZpbGxhXFxOZXR3b3JrTWdyLmpzXG5cbi8vIOi3n+acjeWKoeWZqOi/m+ihjOWvueaOpVxyXG52YXIgTmV0d29ya01nciA9IEZpcmUuQ2xhc3Moe1xyXG4gICAgLy8g57un5om/XHJcbiAgICBleHRlbmRzOiBGaXJlLkNvbXBvbmVudCxcclxuICAgIC8vIOaehOmAoOWHveaVsFxyXG4gICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAvLyDlvZPliY3or7fmsYLmlbDmja5cclxuICAgICAgICB0aGlzLl9wb3N0RGF0YSA9IHt9O1xyXG4gICAgICAgIC8vIOaWree6v+mHjei/nueql+WPo1xyXG4gICAgICAgIHRoaXMubmV0V29ya1dpbiA9IG51bGw7XHJcbiAgICAgICAgLy8g55So5LqO5rWL6K+V55qEdG9rZW7mlbDmja5cclxuICAgICAgICB0aGlzLnRva2VuID0gJyc7XHJcbiAgICAgICAgLy9cclxuICAgICAgICB0aGlzLl9kYXRhQmFzZSA9IG51bGw7XHJcbiAgICB9LFxyXG4gICAgLy8g5bGe5oCnXHJcbiAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgbG9jYWxUZXN0OiBmYWxzZSxcclxuICAgICAgICBkYXRhQmFzZToge1xyXG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGlmICghIHRoaXMuX2RhdGFCYXNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8g5bi455So55qE5Y+Y6YePL+aVsOaNrlxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBlbnQgPSBGaXJlLkVudGl0eS5maW5kKCcvRGF0YUJhc2UnKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9kYXRhQmFzZSA9IGVudC5nZXRDb21wb25lbnQoJ0RhdGFCYXNlJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fZGF0YUJhc2U7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHZpc2libGU6IGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIOiOt+WPlueUqOaIt+S/oeaBr1xyXG4gICAgZ2V0VG9LZW5WYWx1ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmxvY2FsVGVzdCkge1xyXG4gICAgICAgICAgICAvL3RoaXMudG9rZW4gPSAnTVRBd01qRXhPRE16TUY5bU1UaGpabU00T0RJNE56UmhaVEJsTVRBNU1UWmpaVEprT0RrMFpqZ3pabDh4TkRNMk1UWTNPRE15WDNkaGNBPT0nO1xyXG4gICAgICAgICAgICB0aGlzLnRva2VuID0gJ01UQXdNVFE1TWpZNE5WOHhZV0V6WXpGa05tRTBaV0kzWXpsa05tUXhZbUptTkRjNE5UTm1aamhrTTE4eE5ETTJNekkyTXpjMlgzZGhjQSc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgIHRoaXMudG9rZW4gPSB0aGlzLmdldFF1ZXJ5U3RyaW5nKCd0b2tlbicpO1xyXG4gICAgICAgICAgICBpZiAoISB0aGlzLnRva2VuKXtcclxuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coXCLmsqHmnInnlKjmiLfkv6Hmga8sIFRvS2VuIGlzIG51bGxcIik7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9LFxyXG4gICAgLy8g55SoSlPojrflj5blnLDlnYDmoI/lj4LmlbDnmoTmlrnms5VcclxuICAgIGdldFF1ZXJ5U3RyaW5nOiBmdW5jdGlvbihuYW1lKSB7XHJcbiAgICAgICAgdmFyIHJlZyA9IG5ldyBSZWdFeHAoXCIoXnwmKVwiICsgbmFtZSArIFwiPShbXiZdKikoJnwkKVwiKTtcclxuICAgICAgICB2YXIgciA9IHdpbmRvdy5sb2NhdGlvbi5zZWFyY2guc3Vic3RyKDEpLm1hdGNoKHJlZyk7XHJcbiAgICAgICAgaWYgKHIgIT09IG51bGwpe1xyXG4gICAgICAgICAgICByZXR1cm4gdW5lc2NhcGUoclsyXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfSxcclxuICAgIC8vIOivt+axguWksei0pVxyXG4gICAgX2Vycm9yQ2FsbEJhY2s6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgdGhpcy5uZXRXb3JrV2luLm9wZW5XaW5kb3coZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBzZWxmLnNlbmREYXRhKHNlbGYuX3Bvc3REYXRhKTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICAvLyDlj5HpgIHmlbDmja5cclxuICAgIHNlbmREYXRhOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgIGlmICghIEZpcmUuRW5naW5lLmlzUGxheWluZykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghIHRoaXMuZ2V0VG9LZW5WYWx1ZSgpKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy90aGlzLmRhdGFCYXNlLmxvYWRUaXBzLm9wZW5UaXBzKCfor7fmsYLkuK3vvIzor7fnqI3lkI4uLi4nKTtcclxuICAgICAgICB0aGlzLl9wb3N0RGF0YSA9IGRhdGE7XHJcbiAgICAgICAgdGhpcy5qUXVlcnlBamF4KGRhdGEudXJsLCBkYXRhLnNlbmREYXRhLCBkYXRhLmNiLCBkYXRhLmVyckNiKTtcclxuICAgIH0sXHJcbiAgICAvLyDlj5HpgIHmtojmga9cclxuICAgIGpRdWVyeUFqYXg6IGZ1bmN0aW9uIChzdHJVcmwsIGRhdGEsIGNhbGxCYWNrLCBlcnJvckNhbGxCYWNrKSB7XHJcbiAgICAgICAgdmFyIHBhcmFtcyA9IFwiXCI7XHJcbiAgICAgICAgaWYgKHR5cGVvZihkYXRhKSAhPT0gXCJvYmplY3RcIikgeyBwYXJhbXMgPSBkYXRhICsgXCImdG9rZW49XCIgKyB0aGlzLnRva2VuOyB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGtleSBpbiBkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICBwYXJhbXMgKz0gKGtleSArIFwiPVwiICsgZGF0YVtrZXldICsgXCImXCIgICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcGFyYW1zICs9IFwiJnRva2VuPVwiICsgdGhpcy50b2tlbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIHZhciBzZW5kID0ge1xyXG4gICAgICAgICAgICB0eXBlOiBcIlBPU1RcIixcclxuICAgICAgICAgICAgdXJsOiBzdHJVcmwgKyBcIj8manNvbmNhbGxQUD0/XCIsXHJcbiAgICAgICAgICAgIGRhdGE6IHBhcmFtcyxcclxuICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29ucCcsXHJcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCEgRmlyZS5FbmdpbmUuaXNQbGF5aW5nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGNhbGxCYWNrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FsbEJhY2soZGF0YSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvL3NlbGYuZGF0YUJhc2UubG9hZFRpcHMuY2xvc2VUaXBzKCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbiAoWE1MSHR0cFJlcXVlc3QsIHRleHRTdGF0dXMsIGVycm9yVGhyb3duKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoISBGaXJlLkVuZ2luZS5pc1BsYXlpbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3JDYWxsQmFjaykge1xyXG4gICAgICAgICAgICAgICAgICAgIGVycm9yQ2FsbEJhY2soKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vc2VsZi5kYXRhQmFzZS5sb2FkVGlwcy5jbG9zZVRpcHMoKTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yVGhyb3duKTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFhNTEh0dHBSZXF1ZXN0KTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRleHRTdGF0dXMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICBqUXVlcnkuYWpheChzZW5kKTtcclxuICAgIH0sXHJcbiAgICAvLyDkv53lrZjoo4Xmia5cclxuICAgIFJlcXVlc3RTYXZlUm9vbTogZnVuY3Rpb24gKHNlbmREYXRhLCBjYWxsYmFjaykge1xyXG4gICAgICAgIHZhciBwb3N0RGF0YSA9IHtcclxuICAgICAgICAgICAgdXJsOiBcImh0dHA6Ly9tLnNhaWtlLmNvbS9zdWl0ZHJlc3Mvc2F2ZS5odG1sXCIsXHJcbiAgICAgICAgICAgIHNlbmREYXRhOiB7XHJcbiAgICAgICAgICAgICAgICBtYXJrOiB0aGlzLmRhdGFCYXNlLm1hcmssXHJcbiAgICAgICAgICAgICAgICBzdWl0X2lkOiBzZW5kRGF0YS5zdWl0X2lkLFxyXG4gICAgICAgICAgICAgICAgc3VpdF9mcm9tOiBzZW5kRGF0YS5zdWl0X2Zyb20sXHJcbiAgICAgICAgICAgICAgICBkYXRhTGlzdDogSlNPTi5zdHJpbmdpZnkoc2VuZERhdGEuZGF0YUxpc3QpXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGNiOiBjYWxsYmFjayxcclxuICAgICAgICAgICAgZXJyQ2I6IHRoaXMuX2Vycm9yQ2FsbEJhY2suYmluZCh0aGlzKVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5zZW5kRGF0YShwb3N0RGF0YSk7XHJcbiAgICB9LFxyXG4gICAgLy8g6K+i6Zeu5piv5ZCm5Y+v5Lul6KOF5omuXHJcbiAgICBSZXF1ZXN0Q2FuRHJlc3NSb29tOiBmdW5jdGlvbiAoc2VuZERhdGEsIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgdmFyIHBvc3REYXRhID0ge1xyXG4gICAgICAgICAgICB1cmw6IFwiaHR0cDovL20uc2Fpa2UuY29tL3N1aXRkcmVzcy9iZWdpblN1aXQuaHRtbFwiLFxyXG4gICAgICAgICAgICBzZW5kRGF0YTogc2VuZERhdGEsXHJcbiAgICAgICAgICAgIGNiOiBjYWxsYmFjayxcclxuICAgICAgICAgICAgZXJyQ2I6IHRoaXMuX2Vycm9yQ2FsbEJhY2suYmluZCh0aGlzKVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5zZW5kRGF0YShwb3N0RGF0YSk7XHJcbiAgICB9LFxyXG4gICAgLy8g6K+35rGC5oi/6Ze05pWw5o2uXHJcbiAgICBSZXF1ZXN0SW50b0hvbWVEYXRhOiBmdW5jdGlvbiAoc2VuZERhdGEsIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgdmFyIHBvc3REYXRhID0ge1xyXG4gICAgICAgICAgICB1cmw6IFwiaHR0cDovL20uc2Fpa2UuY29tL3N1aXRkcmVzcy9pbnRvUm9vbS5odG1sXCIsXHJcbiAgICAgICAgICAgIHNlbmREYXRhOiB7XHJcbiAgICAgICAgICAgICAgICBob3VzZV91aWQ6IHNlbmREYXRhLmhvdXNlX3VpZCxcclxuICAgICAgICAgICAgICAgIG1hcms6IHNlbmREYXRhLm1hcmssXHJcbiAgICAgICAgICAgICAgICBjbGVhcjogc2VuZERhdGEuY2xlYXIgfHwgMFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBjYjogY2FsbGJhY2ssXHJcbiAgICAgICAgICAgIGVyckNiOiB0aGlzLl9lcnJvckNhbGxCYWNrLmJpbmQodGhpcylcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMuc2VuZERhdGEocG9zdERhdGEpO1xyXG4gICAgfSxcclxuICAgIC8vIOiOt+WPluW5s+mdouWbvlxyXG4gICAgUmVxdWVzdFBsYW46IGZ1bmN0aW9uIChzZW5kRGF0YSwgY2FsbGJhY2spIHtcclxuICAgICAgICB2YXIgcG9zdERhdGEgPSB7XHJcbiAgICAgICAgICAgIHVybDogXCJodHRwOi8vbS5zYWlrZS5jb20vc3VpdGRyZXNzL3Nob3dDb3Zlci5odG1sXCIsXHJcbiAgICAgICAgICAgIHNlbmREYXRhOiB7XHJcbiAgICAgICAgICAgICAgICBob3VzZV91aWQ6IHNlbmREYXRhLmhvdXNlX3VpZCxcclxuICAgICAgICAgICAgICAgIGZsb29yX2lkOiBzZW5kRGF0YS5mbG9vcl9pZCxcclxuICAgICAgICAgICAgICAgIG1hcms6IHNlbmREYXRhLm1hcmtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgY2I6IGNhbGxiYWNrLFxyXG4gICAgICAgICAgICBlcnJDYjogdGhpcy5fZXJyb3JDYWxsQmFjay5iaW5kKHRoaXMpXHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLnNlbmREYXRhKHBvc3REYXRhKTtcclxuICAgIH0sXHJcbiAgICAvLyDmpbzlsYLliJfooahcclxuICAgIFJlcXVlc3RGbG9vckxpc3Q6IGZ1bmN0aW9uIChjYWxsYmFjaykge1xyXG4gICAgICAgIHZhciBwb3N0RGF0YSA9IHtcclxuICAgICAgICAgICAgdXJsOiBcImh0dHA6Ly9tLnNhaWtlLmNvbS9zdWl0ZHJlc3MvZmxvb3JMaXN0Lmh0bWxcIixcclxuICAgICAgICAgICAgc2VuZERhdGE6IHt9LFxyXG4gICAgICAgICAgICBjYjogY2FsbGJhY2ssXHJcbiAgICAgICAgICAgIGVyckNiOiB0aGlzLl9lcnJvckNhbGxCYWNrLmJpbmQodGhpcylcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMuc2VuZERhdGEocG9zdERhdGEpO1xyXG4gICAgfSxcclxuICAgIC8vIOino+mZpOWFs+ezu1xyXG4gICAgUmVxdWVzdERpc2Fzc29jaWF0ZUxpc3Q6IGZ1bmN0aW9uIChzZW5kRGF0YSwgY2FsbGJhY2spIHtcclxuICAgICAgICB2YXIgcG9zdERhdGEgPSB7XHJcbiAgICAgICAgICAgIHVybDogXCJodHRwOi8vbS5zYWlrZS5jb20vc3VpdGRyZXNzL3JlbGVhc2VSZWxhdGlvbi5odG1sXCIsXHJcbiAgICAgICAgICAgIHNlbmREYXRhOiBzZW5kRGF0YSxcclxuICAgICAgICAgICAgY2I6IGNhbGxiYWNrLFxyXG4gICAgICAgICAgICBlcnJDYjogdGhpcy5fZXJyb3JDYWxsQmFjay5iaW5kKHRoaXMpXHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLnNlbmREYXRhKHBvc3REYXRhKTtcclxuICAgIH0sXHJcbiAgICAvLyDor7fmsYLljZXlk4Hlrrblhbfoj5zljZXliJfooahcclxuICAgIFJlcXVlc3RTaW5nbGVJdGVtc01lbnU6IGZ1bmN0aW9uIChjYWxsYmFjaykge1xyXG4gICAgICAgIHZhciBwb3N0RGF0YSA9IHtcclxuICAgICAgICAgICAgdXJsOiAnaHR0cDovL20uc2Fpa2UuY29tL2hvdXNlZHJlc3MvZ2V0U2hvcFR5cGUuaHRtbCcsXHJcbiAgICAgICAgICAgIHNlbmREYXRhOiB7fSxcclxuICAgICAgICAgICAgY2I6IGNhbGxiYWNrLFxyXG4gICAgICAgICAgICBlcnJDYjogdGhpcy5fZXJyb3JDYWxsQmFjay5iaW5kKHRoaXMpXHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLnNlbmREYXRhKHBvc3REYXRhKTtcclxuICAgIH0sXHJcbiAgICAvLyDor7fmsYLljZXlk4HlrrblhbfliJfooahcclxuICAgIFJlcXVlc3RTaW5nbGVJdGVtczogZnVuY3Rpb24gKGRhdGEsIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgdmFyIHBvc3REYXRhID0ge1xyXG4gICAgICAgICAgICB1cmw6IFwiaHR0cDovL20uc2Fpa2UuY29tL2hvdXNlZHJlc3MvZ2V0U2hvcExpc3QuaHRtbFwiLFxyXG4gICAgICAgICAgICBzZW5kRGF0YToge1xyXG4gICAgICAgICAgICAgICAgdGlkOiBkYXRhLnRpZCxcclxuICAgICAgICAgICAgICAgIHBhZ2U6IGRhdGEucGFnZSxcclxuICAgICAgICAgICAgICAgIGVhY2g6IGRhdGEuZWFjaFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBjYjogY2FsbGJhY2ssXHJcbiAgICAgICAgICAgIGVyckNiOiB0aGlzLl9lcnJvckNhbGxCYWNrLmJpbmQodGhpcylcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMuc2VuZERhdGEocG9zdERhdGEpO1xyXG4gICAgfSxcclxuICAgIC8v6K+35rGC5aWX6KOF5YiX6KGo5pWw5o2uXHJcbiAgICBSZXF1ZXN0U2V0SXRlbXNNZW51OiBmdW5jdGlvbiAoZGF0YSwgIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgdmFyIHBvc3REYXRhID0ge1xyXG4gICAgICAgICAgICB1cmw6IFwiaHR0cDovL20uc2Fpa2UuY29tL2hvdXNlZHJlc3Mvc2hvcFN1aXQuaHRtbFwiLFxyXG4gICAgICAgICAgICBzZW5kRGF0YToge1xyXG4gICAgICAgICAgICAgICAgcGFnZTogZGF0YS5wYWdlLFxyXG4gICAgICAgICAgICAgICAgZWFjaDogZGF0YS5lYWNoXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGNiOiBjYWxsYmFjayxcclxuICAgICAgICAgICAgZXJyQ2I6IHRoaXMuX2Vycm9yQ2FsbEJhY2suYmluZCh0aGlzKVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5zZW5kRGF0YShwb3N0RGF0YSk7XHJcbiAgICB9LFxyXG4gICAgLy/or7fmsYLlpZfoo4XmlbDmja5cclxuICAgIFJlcXVlc3RTZXRJdGVtc0RhdGE6IGZ1bmN0aW9uIChpZCwgIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgdmFyIHBvc3REYXRhID0ge1xyXG4gICAgICAgICAgICB1cmw6IFwiaHR0cDovL20uc2Fpa2UuY29tL2hvdXNlZHJlc3Mvc2hvcHN1aXRkZXRhaWwuaHRtbFwiLFxyXG4gICAgICAgICAgICBzZW5kRGF0YToge1xyXG4gICAgICAgICAgICAgICAgcHJvZF9zdWl0aWQ6IGlkXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGNiOiBjYWxsYmFjayxcclxuICAgICAgICAgICAgZXJyQ2I6IHRoaXMuX2Vycm9yQ2FsbEJhY2suYmluZCh0aGlzKVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5zZW5kRGF0YShwb3N0RGF0YSk7XHJcbiAgICB9LFxyXG4gICAgLy8g54mp5ZOB5p+cKOWNleWTgSlcclxuICAgIFJlcXVlc3RCYWNrcGFja1NpbmdsZTogZnVuY3Rpb24gKHNlbmREYXRhLCBjYWxsYmFjaykge1xyXG4gICAgICAgIHZhciBwb3N0RGF0YSA9IHtcclxuICAgICAgICAgICAgdXJsOiBcImh0dHA6Ly9tLnNhaWtlLmNvbS9zdWl0ZHJlc3MvYmFja3BhY2tTaW5nbGUuaHRtbFwiLFxyXG4gICAgICAgICAgICBzZW5kRGF0YTogc2VuZERhdGEsXHJcbiAgICAgICAgICAgIGNiOiBjYWxsYmFjayxcclxuICAgICAgICAgICAgZXJyQ2I6IHRoaXMuX2Vycm9yQ2FsbEJhY2suYmluZCh0aGlzKVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5zZW5kRGF0YShwb3N0RGF0YSk7XHJcbiAgICB9LFxyXG4gICAgLy8g54mp5ZOB5p+cKOWll+ijhSlcclxuICAgIFJlcXVlc3RCYWNrcGFja1N1aXQ6IGZ1bmN0aW9uIChzZW5kRGF0YSwgY2FsbGJhY2spIHtcclxuICAgICAgICB2YXIgcG9zdERhdGEgPSB7XHJcbiAgICAgICAgICAgIHVybDogXCJodHRwOi8vbS5zYWlrZS5jb20vc3VpdGRyZXNzL215U3VpdC5odG1sXCIsXHJcbiAgICAgICAgICAgIHNlbmREYXRhOiBzZW5kRGF0YSxcclxuICAgICAgICAgICAgY2I6IGNhbGxiYWNrLFxyXG4gICAgICAgICAgICBlcnJDYjogdGhpcy5fZXJyb3JDYWxsQmFjay5iaW5kKHRoaXMpXHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLnNlbmREYXRhKHBvc3REYXRhKTtcclxuICAgIH0sXHJcbiAgICAvLyDlvIDlp4vml7ZcclxuICAgIHN0YXJ0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgLy8g5bi455So55qE5Y+Y6YePL+aVsOaNrlxyXG4gICAgICAgIHZhciBlbnQgPSBGaXJlLkVudGl0eS5maW5kKCcvRGF0YUJhc2UnKTtcclxuICAgICAgICB2YXIgZGF0YUJhc2UgPSBlbnQuZ2V0Q29tcG9uZW50KCdEYXRhQmFzZScpO1xyXG4gICAgICAgIHRoaXMubmV0V29ya1dpbiA9IGRhdGFCYXNlLm5ldFdvcmtXaW47XHJcbiAgICB9XHJcbn0pO1xyXG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJzY3MThmUTRkaGRGWUtvTmtiUjJFK1JXJywgJ05ld1dvcmtXaW5kb3cnKTtcbi8vIHNjcmlwdFxcdmlsbGFcXE5ld1dvcmtXaW5kb3cuanNcblxudmFyIENvbXAgPSBGaXJlLkNsYXNzKHtcbiAgICAvLyDnu6fmib9cbiAgICBleHRlbmRzOiBGaXJlLkNvbXBvbmVudCxcbiAgICAvLyDmnoTpgKDlh73mlbBcbiAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmNhbGxiYWNrRXZlbnQgPSBudWxsO1xuICAgIH0sXG4gICAgLy8g5bGe5oCnXG4gICAgcHJvcGVydGllczoge1xuICAgICAgICBidG5fUmVjb25uZWN0OiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5VSUJ1dHRvblxuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyDlvIDlkK/nqpflj6NcbiAgICBvcGVuV2luZG93OiBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy5lbnRpdHkuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICB0aGlzLmNhbGxiYWNrRXZlbnQgPSBjYWxsYmFjaztcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy8g5YWz6Zet56qX5Y+jXG4gICAgY2xvc2VXaW5kb3c6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5lbnRpdHkuYWN0aXZlID0gZmFsc2U7XG4gICAgfSxcbiAgICAvLyDph43mlrDov57mjqXkuovku7ZcbiAgICBfb25SZWNvbm5lY3Rpb25FdmVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuY2xvc2VXaW5kb3coKTtcbiAgICAgICAgaWYgKHRoaXMuY2FsbGJhY2tFdmVudCkge1xuICAgICAgICAgICAgdGhpcy5jYWxsYmFja0V2ZW50KCk7XG4gICAgICAgICAgICB0aGlzLmNhbGxiYWNrRXZlbnQgPSBudWxsO1xuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyDlvIDlp4tcbiAgICBzdGFydDogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyDnu5Hlrprph43mlrDov57mjqXmjInpkq5cbiAgICAgICAgdGhpcy5idG5fUmVjb25uZWN0Lm9uQ2xpY2sgPSB0aGlzLl9vblJlY29ubmVjdGlvbkV2ZW50LmJpbmQodGhpcyk7XG4gICAgfVxufSk7XG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJzUxMzAxQUY2Y2xFeVpMN0hMQUgyM2lMJywgJ09EYXRhQmFzZScpO1xuLy8gc2NyaXB0XFxvdXRkb29yXFxPRGF0YUJhc2UuanNcblxuLy8gIOWtmOaUvumhueebrumcgOimgeeahOWPmOmHjy/mlbDmja4v5a+56LGhXG52YXIgT0RhdGFCYXNlID0gRmlyZS5DbGFzcyh7XG4gICAgLy8g57un5om/XG4gICAgZXh0ZW5kczogRmlyZS5Db21wb25lbnQsXG4gICAgLy8g5p6E6YCg5Ye95pWwXG4gICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8g5L+d5a2Y5omA5pyJ5Zu+54mHXG4gICAgICAgIHRoaXMubG9hZEltYWdlTGlzdCA9IHt9O1xuICAgICAgICAvL1xuICAgICAgICB0aGlzLnVpZCA9IDA7XG4gICAgICAgIC8vXG4gICAgICAgIHRoaXMubWFyaztcbiAgICB9LFxuXG4gICAgcHJvcGVydGllczoge1xuICAgICAgICB0ZW1wR2xvYmFsRGF0YToge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuRW50aXR5XG4gICAgICAgIH0sXG4gICAgICAgIHRlbXBGYW1pbHk6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLkVudGl0eVxuICAgICAgICB9LFxuICAgICAgICBtYXNrOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5FbnRpdHlcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyDovb3lhaXml7ZcbiAgICBvbkxvYWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8g6L295YWl5o6n5Lu2XG4gICAgICAgIHRoaXMubG9hZENvbnRyb2xzKCk7XG4gICAgICAgIHRoaXMubWFzay5hY3RpdmUgPSB0cnVlO1xuICAgIH0sXG4gICAgLy8g6L295YWl5o6n5Lu2XG4gICAgbG9hZENvbnRyb2xzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIOiDjOaZr1xuICAgICAgICB2YXIgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL0JhY2tHcm91bmQnKTtcbiAgICAgICAgdGhpcy5iZ1JlbmRlciA9IGVudC5nZXRDb21wb25lbnQoRmlyZS5TcHJpdGVSZW5kZXJlcik7XG4gICAgICAgIC8vIOWcsOadv1xuICAgICAgICBlbnQgPSBGaXJlLkVudGl0eS5maW5kKCcvQmFja0dyb3VuZC9Ib3VzZScpO1xuICAgICAgICB0aGlzLmhvdXNlID0gZW50LmdldENvbXBvbmVudChGaXJlLlVJQnV0dG9uKTtcbiAgICAgICAgLy9cbiAgICAgICAgdGhpcy50aXBUb0tlbkVycm9yID0gRmlyZS5FbnRpdHkuZmluZCgnL1RpcF9Ub0tlbkVycm9yJyk7XG4gICAgICAgIC8vIOe9kee7nOi/nuaOpVxuICAgICAgICB0aGlzLnNlcnZlck5ldFdvcmsgPSB0aGlzLmVudGl0eS5nZXRDb21wb25lbnQoJ1NlcnZlck5ldFdvcmsnKTtcbiAgICAgICAgLy8g5Li76I+c5Y2VXG4gICAgICAgIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9NYWluTWVudScpO1xuICAgICAgICB0aGlzLm1haW5NZW51ID0gZW50LmdldENvbXBvbmVudCgnTWFpbk1lbnUnKTtcbiAgICAgICAgLy8g5a2Q6I+c5Y2VXG4gICAgICAgIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9TdWJNZW51Jyk7XG4gICAgICAgIHRoaXMuc3ViTWVudSA9IGVudC5nZXRDb21wb25lbnQoJ1N1Yk1lbnUnKTtcbiAgICAgICAgLy8g6YeN5paw6K+35rGC5pyN5Yqh5Zmo56qX5Y+jXG4gICAgICAgIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9UaXBfTmV0V29yaycpO1xuICAgICAgICB0aGlzLm5ldFdvcmtXaW4gPSBlbnQuZ2V0Q29tcG9uZW50KCdOZXdXb3JrV2luZG93Jyk7XG4gICAgICAgIC8vIOWKoOi9veaPkOekulxuICAgICAgICBlbnQgPSBGaXJlLkVudGl0eS5maW5kKCcvVGlwX0xvYWQnKTtcbiAgICAgICAgdGhpcy5sb2FkVGlwID0gZW50LmdldENvbXBvbmVudCgnVGlwTG9hZCcpO1xuICAgICAgICAvLyDmuKnppqjmj5DnpLrnqpflj6NcbiAgICAgICAgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL1RpcF9Db21tb24nKTtcbiAgICAgICAgdGhpcy50aXBDb21tb24gPSBlbnQuZ2V0Q29tcG9uZW50KCdUaXBzV2luZG93Jyk7XG5cbiAgICAgICAgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL0dsb2JhbERhdGEnKTtcbiAgICAgICAgaWYgKCFlbnQpIHtcbiAgICAgICAgICAgIGVudCA9IEZpcmUuaW5zdGFudGlhdGUodGhpcy50ZW1wR2xvYmFsRGF0YSk7XG4gICAgICAgICAgICBlbnQubmFtZSA9ICdHbG9iYWxEYXRhJztcbiAgICAgICAgICAgIGVudC5kb250RGVzdHJveU9uTG9hZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5nbG9iYWxEYXRhID0gZW50LmdldENvbXBvbmVudChcIkdsb2JhbERhdGFcIik7XG4gICAgICAgIC8vXG4gICAgICAgIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9DaGFyYWN0ZXJzJyk7XG4gICAgICAgIHRoaXMuY2hhcmFjdGVycyA9IGVudC5nZXRDb21wb25lbnQoJ0NoYXJhY3RlcnMnKTtcbiAgICAgICAgLy9cbiAgICAgICAgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL1dpbl9NeUFkZEZhbWlseScpO1xuICAgICAgICB0aGlzLm15QWRkRmFtaWx5V2luID0gZW50LmdldENvbXBvbmVudCgnTXlBZGRGYW1pbHlXaW5kb3cnKTtcbiAgICAgICAgLy9cbiAgICAgICAgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL1dpbl9QbGFuJyk7XG4gICAgICAgIHRoaXMucGxhbldpbiA9IGVudC5nZXRDb21wb25lbnQoJ1BsYW5XaW5kb3cnKTtcbiAgICAgICAgLy9cbiAgICAgICAgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL1RpcF9Ob0FkZEZhbWlseScpO1xuICAgICAgICB0aGlzLnRpcE5vQWRkRmFtaWx5ID0gZW50LmdldENvbXBvbmVudCgnVGlwc1dpbmRvdycpO1xuICAgIH0sXG4gICAgLy8g5LiL6L295Zu+54mHXG4gICAgbG9hZEltYWdlOiBmdW5jdGlvbiAodXJsLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIGlmIChzZWxmLmxvYWRJbWFnZUxpc3RbdXJsXSkge1xuICAgICAgICAgICAgdmFyIGltYWdlID0gc2VsZi5sb2FkSW1hZ2VMaXN0W3VybF07XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsLCBpbWFnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgRmlyZS5JbWFnZUxvYWRlcih1cmwsIGZ1bmN0aW9uIChlcnJvciwgaW1hZ2UpIHtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycm9yLCBpbWFnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaW1hZ2UpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmxvYWRJbWFnZUxpc3RbdXJsXSA9IGltYWdlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9LFxuICAgIC8vIOWIneWni+WMluWcuuaZr1xuICAgIGluaXRTY3JlZW46IGZ1bmN0aW9uIChzZW5kRGF0YSwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBzZWxmLnNlcnZlck5ldFdvcmsuSW5pdE91dGRvb3Ioc2VuZERhdGEsIGZ1bmN0aW9uIChzZXJ2ZXJEYXRhKSB7XG4gICAgICAgICAgICBpZiAoc2VydmVyRGF0YS5zdGF0dXMgIT09IDEwMDAwKSB7XG4gICAgICAgICAgICAgICAgc2VsZi50aXBDb21tb24ub3BlblRpcHNXaW5kb3coc2VydmVyRGF0YS5kZXNjKTtcbiAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBpbmRleCA9IDA7XG4gICAgICAgICAgICBzZWxmLmxvYWRJbWFnZShzZXJ2ZXJEYXRhLmxpc3QuYmdVcmwsIGZ1bmN0aW9uIChlcnJvciwgaW1hZ2UpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciBzcHJpdGUgPSBuZXcgRmlyZS5TcHJpdGUoaW1hZ2UpO1xuICAgICAgICAgICAgICAgIHNlbGYuYmdSZW5kZXIuc3ByaXRlID0gc3ByaXRlO1xuICAgICAgICAgICAgICAgIGluZGV4Kys7XG4gICAgICAgICAgICAgICAgaWYgKGluZGV4ID09IDIgJiYgY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soc2VydmVyRGF0YSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBzZWxmLmxvYWRJbWFnZShzZXJ2ZXJEYXRhLmxpc3QuaG91c2VzVXJsLCBmdW5jdGlvbiAoZXJyb3IsIGltYWdlKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzZWxmLmhvdXNlLnNldEltYWdlKGltYWdlKTtcbiAgICAgICAgICAgICAgICBpbmRleCsrO1xuICAgICAgICAgICAgICAgIGlmIChpbmRleCA9PSAyICYmIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKHNlcnZlckRhdGEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG59KTtcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnY2ZlOGJVN2xITkdYWWdyd2JGN1o3RkEnLCAnT3B0aW9ucycpO1xuLy8gc2NyaXB0XFxjb21tb25cXE9wdGlvbnMuanNcblxudmFyIE9wdGlvbnMgPSBGaXJlLkNsYXNzKHtcbiAgICAvLyDnu6fmib9cbiAgICBleHRlbmRzOiBGaXJlLkNvbXBvbmVudCxcbiAgICAvLyDmnoTpgKDlh73mlbBcbiAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmFuaW0gPSBudWxsO1xuICAgICAgICB0aGlzLmJpbmRIaWRlT3B0aW9uc0V2ZW50ID0gdGhpcy5faGlkZU9wdGlvbnNFdmVudC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLm9uSGlkZUV2ZW50ID0gbnVsbDtcbiAgICB9LFxuICAgIC8vIOWxnuaAp1xuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgLy8g6ZqQ6JeP6YCJ6aG5XG4gICAgICAgIGJ0bl9oaWRlOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5VSUJ1dHRvblxuICAgICAgICB9LFxuICAgICAgICAvLyDliKDpmaTlr7nosaFcbiAgICAgICAgYnRuX2RlbDoge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVUlCdXR0b25cbiAgICAgICAgfSxcbiAgICAgICAgLy8g6ZWc5YOP57+76L2sXG4gICAgICAgIGJ0bl9NaXJyb3JGbGlwOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5VSUJ1dHRvblxuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyDmmK/lkKblvIDlkK/kuK1cbiAgICBoYXNPcGVuOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVudGl0eS5hY3RpdmU7XG4gICAgfSxcbiAgICAvLyDmmK/lkKbmnInop6bnorDpgInpoblcbiAgICBoYXNUb3VjaDogZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgICByZXR1cm4gdGFyZ2V0ID09PSB0aGlzLmJ0bl9oaWRlLmVudGl0eSB8fFxuICAgICAgICAgICAgICAgdGFyZ2V0ID09PSB0aGlzLmJ0bl9kZWwuZW50aXR5ICB8fFxuICAgICAgICAgICAgICAgdGFyZ2V0ID09PSB0aGlzLmJ0bl9NaXJyb3JGbGlwLmVudGl0eTtcbiAgICB9LFxuICAgIC8vIOiuvue9ruWdkOagh1xuICAgIHNldFBvczogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuZW50aXR5LnRyYW5zZm9ybS5wb3NpdGlvbiA9IHZhbHVlO1xuICAgIH0sXG4gICAgLy8g5omT5byA6YCJ6aG5XG4gICAgb3BlbjogZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgICAvLyDorr7nva7lt6bovrlcbiAgICAgICAgaWYgKHRhcmdldCkge1xuICAgICAgICAgICAgdGhpcy5lbnRpdHkucGFyZW50ID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMuc2V0UG9zKHRhcmdldC50cmFuc2Zvcm0ud29ybGRQb3NpdGlvbik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5lbnRpdHkuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgaWYgKCEgdGhpcy5hbmltKSB7XG4gICAgICAgICAgICB0aGlzLmFuaW0gPSB0aGlzLmVudGl0eS5nZXRDb21wb25lbnQoRmlyZS5BbmltYXRpb24pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYW5pbS5wbGF5KCdvcHRpb25zJyk7XG4gICAgfSxcbiAgICAvLyDpmpDol4/pgInpoblcbiAgICBoaWRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuZW50aXR5LmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLmVudGl0eS50cmFuc2Zvcm0uc2NhbGUgPSBuZXcgRmlyZS5WZWMyKDAsIDApO1xuICAgICAgICBpZiAodGhpcy5vbkhpZGVFdmVudCkge1xuICAgICAgICAgICAgdGhpcy5vbkhpZGVFdmVudCgpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyDpmpDol4/pgInpoblcbiAgICBfaGlkZU9wdGlvbnNFdmVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuaGlkZSgpO1xuICAgIH0sXG4gICAgLy8g5byA5aeLXG4gICAgc3RhcnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5idG5faGlkZS5vbk1vdXNlZG93biA9IHRoaXMuYmluZEhpZGVPcHRpb25zRXZlbnQ7XG4gICAgfVxufSk7XG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJzk1N2U2c0EvQ1pPc1lRRVlWRmlTbjZ1JywgJ090aGVyTWVudU1ncicpO1xuLy8gc2NyaXB0XFx2aWxsYVxcT3RoZXJNZW51TWdyLmpzXG5cbi8vIOWFtuS7luiPnOWNleeuoeeQhuexu1xudmFyIE90aGVyTWVudU1nciA9IEZpcmUuQ2xhc3Moe1xuICAgIC8vIOe7p+aJv1xuICAgIGV4dGVuZHM6IEZpcmUuQ29tcG9uZW50LFxuICAgIC8vIOaehOmAoOWHveaVsFxuICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuY2hpbGRyZW4gPSBbXTtcbiAgICB9LFxuICAgIC8vIOWxnuaAp1xuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgbWFyZ2luOiBuZXcgRmlyZS5WZWMyKClcbiAgICB9LFxuICAgIC8vIOWIh+aNoualvOWxglxuICAgIF9vbkNoYW5nZUZsb29yRXZlbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5kYXRhQmFzZS5mbG9vcldpbi5vcGVuV2luZG93KCk7XG4gICAgICAgIHRoaXMuZGF0YUJhc2UuY2hhcmFjdGVycy5lbnRpdHkuYWN0aXZlID0gZmFsc2U7XG4gICAgfSxcbiAgICAvLyDojrflj5boj5zljZXmjInpkq7lubbkuJTnu5Hlrprkuovku7ZcbiAgICBfaW5pdE1lbnU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB2YXIgY2hpbGRyZW4gPSB0aGlzLmVudGl0eS5nZXRDaGlsZHJlbigpO1xuICAgICAgICBzZWxmLmNoaWxkcmVuID0gW107XG4gICAgICAgIGNoaWxkcmVuLmZvckVhY2goZnVuY3Rpb24gKGVudCkge1xuICAgICAgICAgICAgLy8g57uR5a6a5oyJ6ZKu5LqL5Lu2XG4gICAgICAgICAgICB2YXIgYnRuID0gZW50LmdldENvbXBvbmVudCgnVUlCdXR0b24nKTtcbiAgICAgICAgICAgIGlmIChlbnQubmFtZSA9PT0gXCIxXCIpIHtcbiAgICAgICAgICAgICAgICBidG4ub25DbGljayA9IHNlbGYuX29uQ2hhbmdlRmxvb3JFdmVudC5iaW5kKHNlbGYpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2VsZi5jaGlsZHJlbi5wdXNoKGJ0bik7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLy8g6L295YWlXG4gICAgb25Mb2FkOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIOW4uOeUqOeahOWPmOmHjy/mlbDmja5cbiAgICAgICAgdmFyIGdhbWVEYXRhRW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL0RhdGFCYXNlJyk7XG4gICAgICAgIHRoaXMuZGF0YUJhc2UgPSBnYW1lRGF0YUVudC5nZXRDb21wb25lbnQoJ0RhdGFCYXNlJyk7XG4gICAgICAgIC8vIOiOt+WPluiPnOWNleaMiemSruW5tuS4lOe7keWumuS6i+S7tlxuICAgICAgICB0aGlzLl9pbml0TWVudSgpO1xuICAgIH0sXG4gICAgLy8g5byA5aeLXG4gICAgc3RhcnQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIH0sXG4gICAgLy8g5Yi35pawXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIOWMuemFjVVJ5YiG6L6o546HXG4gICAgICAgIC8vdmFyIGNhbWVyYSA9IEZpcmUuQ2FtZXJhLm1haW47XG4gICAgICAgIC8vdmFyIGJnV29ybGRCb3VuZHMgPSB0aGlzLmRhdGFCYXNlLmJnUmVuZGVyLmdldFdvcmxkQm91bmRzKCk7XG4gICAgICAgIC8vdmFyIGJnUmlnaHRUb3BXb3JsZFBvcyA9IG5ldyBGaXJlLlZlYzIoYmdXb3JsZEJvdW5kcy54TWF4LCBiZ1dvcmxkQm91bmRzLnlNYXgpO1xuICAgICAgICAvL3ZhciBiZ1JpZ2h0VG9wID0gY2FtZXJhLndvcmxkVG9TY3JlZW4oYmdSaWdodFRvcFdvcmxkUG9zKTtcbiAgICAgICAgLy92YXIgc2NyZWVuUG9zID0gbmV3IEZpcmUuVmVjMihiZ1JpZ2h0VG9wLngsIGJnUmlnaHRUb3AueSk7XG4gICAgICAgIC8vdmFyIHdvcmxkUG9zID0gY2FtZXJhLnNjcmVlblRvV29ybGQoc2NyZWVuUG9zKTtcbiAgICAgICAgLy90aGlzLmVudGl0eS50cmFuc2Zvcm0ud29ybGRQb3NpdGlvbiA9IHdvcmxkUG9zO1xuICAgICAgICAvLyDljLnphY1VSeWIhui+qOeOh1xuICAgICAgICB2YXIgY2FtZXJhID0gRmlyZS5DYW1lcmEubWFpbjtcbiAgICAgICAgdmFyIHNjcmVlblNpemUgPSBGaXJlLlNjcmVlbi5zaXplLm11bChjYW1lcmEuc2l6ZSAvIEZpcmUuU2NyZWVuLmhlaWdodCk7XG4gICAgICAgIHZhciBuZXdQb3MgPSBGaXJlLnYyKHNjcmVlblNpemUueCAvIDIgKyB0aGlzLm1hcmdpbi54LCBzY3JlZW5TaXplLnkgLyAyIC0gdGhpcy5tYXJnaW4ueSk7XG4gICAgICAgIHRoaXMuZW50aXR5LnRyYW5zZm9ybS5wb3NpdGlvbiA9IG5ld1BvcztcbiAgICB9XG59KTtcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnY2E3ZTl1VDg3TkMwYkRHbDRveXI2UVEnLCAnUGF5TWVudFdpbmRvdycpO1xuLy8gc2NyaXB0XFx2aWxsYVxcUGF5TWVudFdpbmRvdy5qc1xuXG52YXIgUGF5TWVudFdpbmRvdyA9IEZpcmUuQ2xhc3Moe1xuICAgIC8vIOe7p+aJv1xuICAgIGV4dGVuZHM6IEZpcmUuQ29tcG9uZW50LFxuICAgIC8vIOaehOmAoOWHveaVsFxuICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIOaYvuekuuaVsOmHj1xuICAgICAgICB0aGlzLl9zaG93Q291bnQgPSAzO1xuICAgICAgICAvLyDlvZPliY3mgLvmlbBcbiAgICAgICAgdGhpcy5fY3VyVG90YWwgPSAwO1xuICAgICAgICAvLyDlvZPliY3pobVcbiAgICAgICAgdGhpcy5fY3VyUGFnZSA9IDE7XG4gICAgICAgIC8vIOacgOWkp+mhteetvlxuICAgICAgICB0aGlzLl9tYXhQYWdlID0gMTtcbiAgICAgICAgLy8g5ZWG5ZOB5a655ZmoXG4gICAgICAgIHRoaXMubWVyY2hhbmRpc2VMaXN0ID0gW107XG4gICAgICAgIC8vIOWVhuWTgeaVsOaNrlxuICAgICAgICB0aGlzLm1lcmNoYW5kaXNlRGF0YUxpc3QgPSBbXTtcbiAgICB9LFxuICAgIC8vIOWxnuaAp1xuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgcm9vdDoge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuRW50aXR5XG4gICAgICAgIH0sXG4gICAgICAgIC8vIOWIoOmZpOeql+WPo1xuICAgICAgICBidG5fY2xvc2U6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlVJQnV0dG9uXG4gICAgICAgIH0sXG4gICAgICAgIC8vIOehruiupOaUr+S7mFxuICAgICAgICBidG5fcGF5OiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5VSUJ1dHRvblxuICAgICAgICB9LFxuICAgICAgICAvLyDnlKjmiLfph5Hpop1cbiAgICAgICAgdXNlclByaWNlOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5UZXh0XG4gICAgICAgIH0sXG4gICAgICAgIC8vIOeri+WNs+WFheWAvFxuICAgICAgICBidG5fUmVjaGFyZ2U6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlVJQnV0dG9uXG4gICAgICAgIH0sXG4gICAgICAgIC8vIOWQiOiuoeeJqeWTgeS4juacieaViOacn+mZkOaWh+Wtl+aPj+i/sFxuICAgICAgICBudW1BbmREdXJhdGlvbjoge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVGV4dFxuICAgICAgICB9LFxuICAgICAgICAvLyDmgLvku7fmoLzkuI7mgLvmlK/ku5hcbiAgICAgICAgcHJpY2VEZXNjcmlwdGlvbjoge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuUHJpY2VEZXNjcmlwdGlvblxuICAgICAgICB9LFxuICAgICAgICAvLyDmjqfliLblupXpg6jnianku7bnmoTpq5jluqZcbiAgICAgICAgYm90dG9tUm9vdDoge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuRW50aXR5XG4gICAgICAgIH0sXG4gICAgICAgIC8vIOWQiOiuoeeJqeWTgeS4juacieaViOacn+mZkOaWh+Wtl+aPj+i/sFxuICAgICAgICBwYWdlOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5UZXh0XG4gICAgICAgIH0sXG4gICAgICAgIC8vIOS4iuS4gOmhtVxuICAgICAgICBidG5fUHJldmlvdXM6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlVJQnV0dG9uXG4gICAgICAgIH0sXG4gICAgICAgIC8vIOS4i+S4gOmhtVxuICAgICAgICBibnRfTmV4dDoge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVUlCdXR0b25cbiAgICAgICAgfSxcbiAgICAgICAgLy8g5rKh6LSt54mp55qE5Zu+5qCH5o+Q56S6XG4gICAgICAgIG51bGxUaXBzOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5FbnRpdHlcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy8g5YWz6Zet5oyJ6ZKu5LqL5Lu2XG4gICAgX29uQ2xvc2VXaW5kb3dFdmVudDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmRhdGFCYXNlLmZpcnN0TWVudU1nci5vcGVuTWVudSgpO1xuICAgICAgICB0aGlzLmNsb3NlV2luZG93KCk7XG4gICAgfSxcbiAgICAvLyDlhYXlgLxcbiAgICBfb25SZWNoYXJnZUV2ZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHdpbmRvdy5vcGVuKCdodHRwOi8vd3d3LnNhaWtlLmNvbS9uX3BheS9jaGFyZ2UucGhwJyk7XG4gICAgICAgIHRoaXMuZGF0YUJhc2UucGF5TWVudFRpcHMub3BlblRpcHMoKTtcbiAgICB9LFxuICAgIC8vIOehruiupOaUr+S7mFxuICAgIF9vblBheUV2ZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgc2VsZi5kYXRhQmFzZS50aXBzV2luZG93Lm9wZW5UaXBzV2luZG93KCfmgqjnoa7lrproirHotLknKyB0aGlzLnBheU51bSArJ0PluIHotK3kubDvvJ8nLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoc2VsZi5kYXRhQmFzZS51c2VyY2MgPCBzZWxmLnBheU51bSkge1xuICAgICAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UudGlwc1dpbmRvdy5vcGVuVGlwc1dpbmRvdygn5oKo5b2T5YmN5L2Z6aKd5LiN6LazLCDmmK/lkKblhYXlgLzvvJ8nLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX29uUmVjaGFyZ2VFdmVudCgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fcGF5KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLy8g5pSv5LuYXG4gICAgX3BheTogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHNlbGYuZGF0YUJhc2UubG9hZFRpcHMub3BlblRpcHMoJ+aUr+S7mOS4re+8geivt+eojeWQji4uLicpO1xuICAgICAgICBzZWxmLmRhdGFCYXNlLnNhdmVSb29tKGZ1bmN0aW9uIChzZXJ2ZXJVc2VyY2MpIHtcbiAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UudXNlcmNjID0gc2VydmVyVXNlcmNjO1xuICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS5jdXJEcmVzc1N1aXQucHJpY2UgPSAwO1xuICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS5oYXNDYW5TYXZlID0gZmFsc2U7XG4gICAgICAgICAgICBzZWxmLmRhdGFCYXNlLnNhdmVEZWZhdWx0RGF0YSgpO1xuICAgICAgICAgICAgc2VsZi5jbG9zZVdpbmRvdygpO1xuICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS5sb2FkVGlwcy5jbG9zZVRpcHMoKTtcbiAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UudGlwc1dpbmRvdy5vcGVuVGlwc1dpbmRvdygn5pSv5LuY5oiQ5Yqf77yM5bm25L+d5a2Y6KOF5omuLi4nKTtcbiAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UucmVzZXRTY3JlZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBzZW5kRGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgbWFyazogc2VsZi5kYXRhQmFzZS5tYXJrXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBzZWxmLmRhdGFCYXNlLmxvYWRUaXBzLm9wZW5UaXBzKCfliLfmlrDlnLrmma/vvIzor7fnqI3lkI4uLi4nKTtcbiAgICAgICAgICAgICAgICBzZWxmLmRhdGFCYXNlLmludG9Sb29tKHNlbmREYXRhLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UubG9hZFRpcHMuY2xvc2VUaXBzKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICAvLyDkuIrkuIDpobVcbiAgICBfb25QcmV2aW91c0V2ZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuX2N1clBhZ2UgLT0gMTtcbiAgICAgICAgaWYgKHRoaXMuX2N1clBhZ2UgPCAxKXtcbiAgICAgICAgICAgIHRoaXMuX2N1clBhZ2UgPSAxO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3JlZnJlc2hNZXJjaGFuZGlzZSgpO1xuICAgIH0sXG4gICAgLy8g5LiL5LiA6aG1XG4gICAgX29uTmV4dEV2ZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuX2N1clBhZ2UgKz0gMTtcbiAgICAgICAgaWYgKHRoaXMuX2N1clBhZ2UgPiB0aGlzLl9tYXhQYWdlKXtcbiAgICAgICAgICAgIHRoaXMuX2N1clBhZ2UgPSB0aGlzLl9tYXhQYWdlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3JlZnJlc2hNZXJjaGFuZGlzZSgpO1xuICAgIH0sXG4gICAgLy8g6YeN572u5ZWG5ZOB5YiX6KGoXG4gICAgX3Jlc2V0TWVyY2hhbmRpc2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGNoaWxkcmVuID0gdGhpcy5tZXJjaGFuZGlzZUxpc3Q7XG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgdmFyIGNvbXAgPSBjaGlsZHJlbltpXTtcbiAgICAgICAgICAgIGNvbXAucmVzZXQoKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy8g6YeN572u56qX5Y+jXG4gICAgX3Jlc2V0V2luZG93OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIOmHjee9ruWVhuWTgeWIl+ihqFxuICAgICAgICB0aGlzLl9yZXNldE1lcmNoYW5kaXNlKCk7XG4gICAgICAgIC8vIOmHjee9ruWQiOiuoeeJqeWTgeS4juacieaViOacn+mZkOaWh+Wtl+aPj+i/sFxuICAgICAgICB0aGlzLm51bUFuZER1cmF0aW9uLnRleHQgPSAn5ZCI6K6hOiAw5Lu254mp5ZOBLCDmnInmlYjmnJ86MOWkqSc7XG4gICAgICAgIHRoaXMubnVtQW5kRHVyYXRpb24uZW50aXR5LmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAvLyDph43nva7mgLvku7fmoLzkuI7mgLvmlK/ku5hcbiAgICAgICAgdGhpcy5wcmljZURlc2NyaXB0aW9uLnJlc2V0KCk7XG4gICAgICAgIC8vIOmHjee9rueUqOaIt+S9meminVxuICAgICAgICB0aGlzLnVzZXJQcmljZS50ZXh0ID0gJ+eUqOaIt+S9meminTogMEPluIEnO1xuICAgICAgICAvLyDph43nva7pobXnrb5cbiAgICAgICAgdGhpcy5fY3VyUGFnZSA9IDE7XG4gICAgICAgIHRoaXMuX21heFBhZ2UgPSAxO1xuICAgICAgICB0aGlzLnBhZ2UuZW50aXR5LmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAvLyDliLfmlrDmjInpkq7nirbmgIFcbiAgICAgICAgdGhpcy5fcmVmcmVzaEJ0blN0YXRlKCk7XG4gICAgfSxcbiAgICAvLyDliLfmlrDllYblk4HmlbDmja5cbiAgICBfcmVmcmVzaE1lcmNoYW5kaXNlRGF0YUxpc3Q6IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICB0aGlzLm1lcmNoYW5kaXNlRGF0YUxpc3QgPSBbXTtcbiAgICAgICAgdmFyIGRhdGEgPSB7fTtcbiAgICAgICAgLy8g5aWX6KOFXG4gICAgICAgIHZhciBkcmVzc1N1aXQgPSB0aGlzLmRhdGFCYXNlLmN1ckRyZXNzU3VpdDtcbiAgICAgICAgaWYgKGRyZXNzU3VpdC5wcmljZSA+IDApIHtcbiAgICAgICAgICAgIGRhdGEgPSB7XG4gICAgICAgICAgICAgICAgaWNvbjogZHJlc3NTdWl0LnN1aXRfaWNvbixcbiAgICAgICAgICAgICAgICB0TmFtZTogZHJlc3NTdWl0LnN1aXRfbmFtZSxcbiAgICAgICAgICAgICAgICB0TnVtOiAxLFxuICAgICAgICAgICAgICAgIHByaWNlOiBkcmVzc1N1aXQucHJpY2UsXG4gICAgICAgICAgICAgICAgZGlzY291bnQ6IGRyZXNzU3VpdC5kaXNjb3VudFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHRoaXMubWVyY2hhbmRpc2VEYXRhTGlzdC5wdXNoKGRhdGEpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGNoaWxkcmVuID0gdGhpcy5kYXRhQmFzZS5yb29tLmdldENoaWxkcmVuKCk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIHZhciBlbnQgPSBjaGlsZHJlbltpXTtcbiAgICAgICAgICAgIHZhciBmdXJuaXR1cmUgPSBlbnQuZ2V0Q29tcG9uZW50KCdGdXJuaXR1cmUnKTtcbiAgICAgICAgICAgIGlmIChwYXJzZUludChmdXJuaXR1cmUucHJpY2UpID4gMCAmJiBmdXJuaXR1cmUuc3VpdF9pZCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGRhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgIGljb246IGZ1cm5pdHVyZS5zbWFsbFNwcml0ZSxcbiAgICAgICAgICAgICAgICAgICAgdE5hbWU6IGZ1cm5pdHVyZS5wcm9wc19uYW1lLFxuICAgICAgICAgICAgICAgICAgICB0TnVtOiAxLFxuICAgICAgICAgICAgICAgICAgICBwcmljZTogZnVybml0dXJlLnByaWNlLFxuICAgICAgICAgICAgICAgICAgICBkaXNjb3VudDogZnVybml0dXJlLmRpc2NvdW50XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB0aGlzLm1lcmNoYW5kaXNlRGF0YUxpc3QucHVzaChkYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIOWIt+aWsOWVhuWTgVxuICAgIF9yZWZyZXNoTWVyY2hhbmRpc2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8g6YeN572u5ZWG5ZOB5YiX6KGoXG4gICAgICAgIHRoaXMuX3Jlc2V0TWVyY2hhbmRpc2UoKTtcbiAgICAgICAgLy8g6I635Y+W5ZWG5ZOB5pWw5o2uXG4gICAgICAgIHZhciBkYXRhTGlzdCA9IHRoaXMubWVyY2hhbmRpc2VEYXRhTGlzdDtcbiAgICAgICAgdmFyIHRvdGFsID0gZGF0YUxpc3QubGVuZ3RoO1xuICAgICAgICBpZiAodGhpcy5fY3VyVG90YWwgIT09IHRvdGFsKSB7XG4gICAgICAgICAgICB0aGlzLl9jdXJUb3RhbCA9IHRvdGFsO1xuICAgICAgICAgICAgdGhpcy5fbWF4UGFnZSA9IE1hdGguY2VpbCh0aGlzLl9jdXJUb3RhbCAvIHRoaXMuX3Nob3dDb3VudCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8g6LWL5YC85pWw5o2uXG4gICAgICAgIHZhciBzdGFydE51bSA9ICh0aGlzLl9jdXJQYWdlIC0gMSkgKiB0aGlzLl9zaG93Q291bnQ7XG4gICAgICAgIHZhciBlbmROdW0gPSBzdGFydE51bSArIHRoaXMuX3Nob3dDb3VudDtcbiAgICAgICAgaWYgKGVuZE51bSA+IHRoaXMuX2N1clRvdGFsKSB7XG4gICAgICAgICAgICBlbmROdW0gPSB0aGlzLl9jdXJUb3RhbDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgaW5kZXggPSAwO1xuICAgICAgICBmb3IodmFyIGkgPSBzdGFydE51bTsgaSA8IGVuZE51bTsgKytpKSB7XG4gICAgICAgICAgICB2YXIgbWVudSA9IHRoaXMubWVyY2hhbmRpc2VMaXN0W2luZGV4XTtcbiAgICAgICAgICAgIHZhciBkYXRhID0gZGF0YUxpc3RbaV07XG4gICAgICAgICAgICBkYXRhLnRpZCA9IGk7XG4gICAgICAgICAgICBtZW51LnJlZnJlc2goZGF0YSwgdGhpcy5iaW5kRGVsTWVyY2hhbmRpc2VFdmVudCwgdGhpcy5iaW5kUmVmcmVzaE51bUV2ZW50KTtcbiAgICAgICAgICAgIGluZGV4Kys7XG4gICAgICAgIH1cbiAgICAgICAgLy8g5ZCI6K6h54mp5ZOB5LiO5pyJ5pWI5aSp5pWwXG4gICAgICAgIHRoaXMubnVtQW5kRHVyYXRpb24udGV4dCA9ICflkIjorqE6ICcgKyB0b3RhbCArICfku7bnianlk4EsIOacieaViOacnzo5MOWkqSc7XG4gICAgICAgIHRoaXMubnVtQW5kRHVyYXRpb24uZW50aXR5LmFjdGl2ZSA9IHRvdGFsID4gMDtcbiAgICAgICAgdGhpcy5udWxsVGlwcy5hY3RpdmUgPSB0b3RhbCA9PT0gMDtcbiAgICAgICAgLy8g5oC75Lu35qC8IOS4jiDmipjlkI7ku7cg6ZyA6KaB5pSv5LuYXG4gICAgICAgIHRoaXMuX3JlZnJlc2hBbGxQcmljZSgpO1xuICAgICAgICAvLyDnlKjmiLfkvZnpop1cbiAgICAgICAgdGhpcy5yZWZyZXNoVXNlckNDKCk7XG4gICAgICAgIC8vIOWIt+aWsOaMiemSrueKtuaAgVxuICAgICAgICB0aGlzLl9yZWZyZXNoQnRuU3RhdGUoKTtcbiAgICB9LFxuICAgIC8vIOWIt+aWsOeUqOaIt+S9meminVxuICAgIHJlZnJlc2hVc2VyQ0M6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy51c2VyUHJpY2UudGV4dCA9ICfnlKjmiLfkvZnpop06ICcgKyB0aGlzLmRhdGFCYXNlLnVzZXJjYyArICdD5biBJztcbiAgICB9LFxuICAgIC8vIOWIt+aWsOaJgOacieS7t+agvFxuICAgIF9yZWZyZXNoQWxsUHJpY2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8g5oC75Lu35qC8IOaKmOWQjuS7tyDpnIDopoHmlK/ku5hcbiAgICAgICAgdmFyIHRvdGFsID0gMCwgZGlzY291bnQgPSAwLCBwYXkgPSAwO1xuICAgICAgICB2YXIgZGF0YUxpc3QgPSB0aGlzLm1lcmNoYW5kaXNlRGF0YUxpc3Q7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YUxpc3QubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIHZhciBkYXRhID0gZGF0YUxpc3RbaV07XG4gICAgICAgICAgICB2YXIgcHJpY2UgPSBkYXRhLnROdW0gKiBkYXRhLnByaWNlO1xuICAgICAgICAgICAgdG90YWwgKz0gcHJpY2U7XG4gICAgICAgICAgICB2YXIgZGljb3VudFByaWNlID0gcHJpY2UgKiBkYXRhLmRpc2NvdW50O1xuICAgICAgICAgICAgZGlzY291bnQgKz0gZGljb3VudFByaWNlO1xuICAgICAgICB9XG4gICAgICAgIHBheSA9IGRpc2NvdW50O1xuICAgICAgICB0aGlzLnBheU51bSA9IHBheTtcbiAgICAgICAgdGhpcy5wcmljZURlc2NyaXB0aW9uLnJlZnJlc2godG90YWwsIGRpc2NvdW50LCBwYXkpO1xuICAgIH0sXG4gICAgLy8g5Yi35paw5pWw6YePXG4gICAgX29uUmVmcmVzaE51bUV2ZW50OiBmdW5jdGlvbiAoaWQsIG51bSkge1xuICAgICAgICBpZiAodGhpcy5tZXJjaGFuZGlzZURhdGFMaXN0Lmxlbmd0aCA+IGlkKSB7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IHRoaXMubWVyY2hhbmRpc2VEYXRhTGlzdFtpZF07XG4gICAgICAgICAgICBkYXRhLnROdW0gPSBudW07XG4gICAgICAgICAgICB0aGlzLl9yZWZyZXNoQWxsUHJpY2UoKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy8g5Yi35paw5oyJ6ZKu54q25oCBXG4gICAgX3JlZnJlc2hCdG5TdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmJ0bl9QcmV2aW91cy5lbnRpdHkuYWN0aXZlID0gdGhpcy5fY3VyUGFnZSA+IDE7XG4gICAgICAgIHRoaXMuYm50X05leHQuZW50aXR5LmFjdGl2ZSA9IHRoaXMuX2N1clBhZ2UgPCB0aGlzLl9tYXhQYWdlO1xuICAgICAgICB0aGlzLnBhZ2UudGV4dCA9IHRoaXMuX2N1clBhZ2UgKyBcIi9cIiArIHRoaXMuX21heFBhZ2U7XG4gICAgfSxcbiAgICAvLyDliKDpmaTljZXkuKrllYblk4FcbiAgICBfb25EZWxNZXJjaGFuZGlzZUV2ZW50OiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgdmFyIG1lcmNoYW5kaXNlID0gZXZlbnQudGFyZ2V0LnBhcmVudC5nZXRDb21wb25lbnQoJ01lcmNoYW5kaXNlJyk7XG4gICAgICAgIGlmIChtZXJjaGFuZGlzZSAmJiB0aGlzLm1lcmNoYW5kaXNlRGF0YUxpc3QubGVuZ3RoID4gbWVyY2hhbmRpc2UudGlkKSB7XG4gICAgICAgICAgICB0aGlzLm1lcmNoYW5kaXNlRGF0YUxpc3Quc3BsaWNlKG1lcmNoYW5kaXNlLnRpZCwgMSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fcmVmcmVzaE1lcmNoYW5kaXNlKCk7XG4gICAgfSxcbiAgICAvLyDlvIDlkK/nqpflj6NcbiAgICBvcGVuV2luZG93OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMucGF5TnVtID0gMDtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAvL1xuICAgICAgICBzZWxmLmRhdGFCYXNlLmZpcnN0TWVudU1nci5jbG9zZU1lbnUoKTtcbiAgICAgICAgLy8g6YeN572u56qX5Y+j5pWw5o2uXG4gICAgICAgIHNlbGYuX3Jlc2V0V2luZG93KCk7XG4gICAgICAgIC8vIOaYvuekuueql+WPo1xuICAgICAgICBzZWxmLmVudGl0eS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICAvLyDliLfmlrDllYblk4HmlbDmja5cbiAgICAgICAgc2VsZi5fcmVmcmVzaE1lcmNoYW5kaXNlRGF0YUxpc3QoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy8g5Yi35paw5ZWG5ZOBXG4gICAgICAgICAgICBzZWxmLl9yZWZyZXNoTWVyY2hhbmRpc2UoKTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICAvLyDlhbPpl63nqpflj6NcbiAgICBjbG9zZVdpbmRvdzogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fY3VyUGFnZSA9IDE7XG4gICAgfSxcbiAgICAvLyDlvIDlp4tcbiAgICBzdGFydDogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyDluLjnlKjnmoTlj5jph48v5pWw5o2uXG4gICAgICAgIHZhciBlbnQgPSBGaXJlLkVudGl0eS5maW5kKCcvRGF0YUJhc2UnKTtcbiAgICAgICAgdGhpcy5kYXRhQmFzZSA9IGVudC5nZXRDb21wb25lbnQoJ0RhdGFCYXNlJyk7XG4gICAgICAgIC8vXG4gICAgICAgIHRoaXMucGF5TnVtID0gMDtcbiAgICAgICAgLy9cbiAgICAgICAgdmFyIGNoaWxkcmVuID0gdGhpcy5yb290LmdldENoaWxkcmVuKCk7XG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgZW50ID0gY2hpbGRyZW5baV07XG4gICAgICAgICAgICB2YXIgY29tcCA9IGVudC5nZXRDb21wb25lbnQoJ01lcmNoYW5kaXNlJyk7XG4gICAgICAgICAgICB0aGlzLm1lcmNoYW5kaXNlTGlzdC5wdXNoKGNvbXApO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYmluZFJlZnJlc2hOdW1FdmVudCA9IHRoaXMuX29uUmVmcmVzaE51bUV2ZW50LmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuYmluZERlbE1lcmNoYW5kaXNlRXZlbnQgPSB0aGlzLl9vbkRlbE1lcmNoYW5kaXNlRXZlbnQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5idG5fY2xvc2Uub25DbGljayA9IHRoaXMuX29uQ2xvc2VXaW5kb3dFdmVudC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmJ0bl9wYXkub25DbGljayA9IHRoaXMuX29uUGF5RXZlbnQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5idG5fUHJldmlvdXMub25DbGljayA9IHRoaXMuX29uUHJldmlvdXNFdmVudC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmJudF9OZXh0Lm9uQ2xpY2sgPSB0aGlzLl9vbk5leHRFdmVudC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmJ0bl9SZWNoYXJnZS5vbkNsaWNrID0gdGhpcy5fb25SZWNoYXJnZUV2ZW50LmJpbmQodGhpcyk7XG4gICAgfVxufSk7XG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJzg5NDA5QWEzTjVNNHFOTWxrQ1NuTU1DJywgJ1BsYW5XaW5kb3cnKTtcbi8vIHNjcmlwdFxcb3V0ZG9vclxcUGxhbldpbmRvdy5qc1xuXG52YXIgUGxhbldpbmRvdyA9IEZpcmUuQ2xhc3Moe1xuICAgIC8vIOe7p+aJv1xuICAgIGV4dGVuZHM6IEZpcmUuQ29tcG9uZW50LFxuICAgIC8vIOaehOmAoOWHveaVsFxuICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiAoKSB7XG5cbiAgICB9LFxuICAgIC8vIOWxnuaAp1xuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgdGVtcFBsYW46IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLkVudGl0eVxuICAgICAgICB9LFxuICAgICAgICByb290OiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5FbnRpdHlcbiAgICAgICAgfSxcbiAgICAgICAgcm9vbU5hbWU6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlRleHRcbiAgICAgICAgfSxcbiAgICAgICAgcm9vbUxldmVsOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5UZXh0XG4gICAgICAgIH0sXG4gICAgICAgIHJvb21OdW06IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlRleHRcbiAgICAgICAgfSxcbiAgICAgICAgYnRuX2Nsb3NlOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5VSUJ1dHRvblxuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyDph43nva7nqpflj6NcbiAgICByZXNldFdpbmRvdzogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnJvb21OYW1lLnRleHQgPSAnKOWIq+WiheWQjeensCknO1xuICAgICAgICB0aGlzLnJvb21MZXZlbC50ZXh0ID0gJ+aho+asoe+8muKYheKYheKYheKYheKYheKYhSc7XG4gICAgICAgIHRoaXMucm9vbU51bS50ZXh0ID0gJ+WFsTjkuKrmiL/pl7QnO1xuICAgIH0sXG4gICAgLy8g5omT5byA56qX5Y+jXG4gICAgLy8gdHlwZTog6YKj5Liq6Lev5Y+j6L+b5YWl5bmz6Z2i5Zu+55qEXG4gICAgLy8gMCwg5YiH5o2i5oi/6Ze0IDHvvJrliIfmjaLmpbzlh7pcbiAgICBvcGVuV2luZG93OiBmdW5jdGlvbiAoc2VuZERhdGEpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBzZWxmLmVudGl0eS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICBzZWxmLl9yZW1vdmVQbGFuKCk7XG4gICAgICAgIHZhciBsb2FjbERhdGEgPSBzZWxmLnBsYW5MaXN0W3NlbmREYXRhLm1hcmtdO1xuICAgICAgICBpZiAobG9hY2xEYXRhKSB7XG4gICAgICAgICAgICBzZWxmLm9kYXRhQmFzZS5tYXJrID0gc2VuZERhdGEubWFyaztcbiAgICAgICAgICAgIHNlbGYuY3JlYXRlUGxhbihsb2FjbERhdGEpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgc2VsZi5vZGF0YUJhc2UubG9hZFRpcC5vcGVuVGlwcygn6L295YWl5bmz6Z2i5Zu+5pWw5o2u77yB6K+356iN5ZCOLi4uJyk7XG4gICAgICAgICAgICBzZWxmLm9kYXRhQmFzZS5zZXJ2ZXJOZXRXb3JrLlJlcXVlc3RQbGFuKHNlbmREYXRhLCBmdW5jdGlvbiAoc2VydmVyRGF0YSkge1xuICAgICAgICAgICAgICAgIHNlbGYub2RhdGFCYXNlLmxvYWRUaXAuY2xvc2VUaXBzKCk7XG4gICAgICAgICAgICAgICAgc2VsZi5wbGFuTGlzdFtzZW5kRGF0YS5tYXJrXSA9IHNlcnZlckRhdGE7XG4gICAgICAgICAgICAgICAgc2VsZi5vZGF0YUJhc2UubWFyayA9IHNlbmREYXRhLm1hcms7XG4gICAgICAgICAgICAgICAgc2VsZi5jcmVhdGVQbGFuKHNlcnZlckRhdGEpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIOWFs+mXreeql+WPo1xuICAgIGNsb3NlV2luZG93OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuZW50aXR5LmFjdGl2ZSA9IGZhbHNlO1xuICAgIH0sXG4gICAgLy8g57uY5Yi25pif57qnXG4gICAgZ2V0U3RhcnM6IGZ1bmN0aW9uIChncmFkZSkge1xuICAgICAgICB2YXIgc3RyID0gJ+aho+asoe+8mic7XG4gICAgICAgIGlmIChncmFkZSA9PT0gMTIpIHtcbiAgICAgICAgICAgIHN0ciArPSAn6Iez5bCK5a6dJztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZ3JhZGUgLSAxOyArK2kpIHtcbiAgICAgICAgICAgICAgICBzdHIgKz0gJ+KYhSc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHN0cjtcbiAgICB9LFxuICAgIC8vIOWIm+W7uuW5s+mdouWbvlxuICAgIGNyZWF0ZVBsYW46IGZ1bmN0aW9uIChzZXJ2ZXJEYXRhKSB7XG4gICAgICAgIGlmICghIHNlcnZlckRhdGEubGlzdCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIOWDj+acjeWKoeWZqOivt+axguW5s+mdouWbvuaVsOaNrlxuICAgICAgICB0aGlzLnJvb21OYW1lLnRleHQgPSBzZXJ2ZXJEYXRhLmZsb29yX25hbWU7XG4gICAgICAgIHRoaXMucm9vbUxldmVsLnRleHQgPSB0aGlzLmdldFN0YXJzKHNlcnZlckRhdGEuZmxvb3JfZ3JhZGUpO1xuICAgICAgICB0aGlzLnJvb21OdW0udGV4dCA9ICflhbEnKyBzZXJ2ZXJEYXRhLmxpc3QubGVuZ3RoICsgJ+S4quaIv+mXtCc7XG4gICAgICAgIHRoaXMuYmluZEdvVG9Sb29tRXZlbnQgPSB0aGlzLl9vbkdvdG9Sb29tRXZlbnQuYmluZCh0aGlzKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzZXJ2ZXJEYXRhLmxpc3QubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIHZhciBkYXRhID0gc2VydmVyRGF0YS5saXN0W2ldO1xuICAgICAgICAgICAgdmFyIGVudCA9IEZpcmUuaW5zdGFudGlhdGUodGhpcy50ZW1wUGxhbik7XG4gICAgICAgICAgICBlbnQuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgICAgIGVudC5wYXJlbnQgPSB0aGlzLnJvb3Q7XG4gICAgICAgICAgICB2YXIgYnRuID0gZW50LmdldENvbXBvbmVudChGaXJlLlVJQnV0dG9uKTtcbiAgICAgICAgICAgIGJ0bi5tYXJrID0gZGF0YS5tYXJrO1xuICAgICAgICAgICAgdGhpcy5vZGF0YUJhc2UubG9hZEltYWdlKGRhdGEuaW1ndXJsLCBmdW5jdGlvbiAoYnRuLCBlcnJvciwgaW1hZ2UpIHtcbiAgICAgICAgICAgICAgICB2YXIgc3ByaXRlID0gbmV3IEZpcmUuU3ByaXRlKGltYWdlKTtcbiAgICAgICAgICAgICAgICBzcHJpdGUucGl4ZWxMZXZlbEhpdFRlc3QgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJ0bi5zZXRTcHJpdGUoc3ByaXRlKTtcbiAgICAgICAgICAgICAgICBidG4ub25DbGljayA9IHRoaXMuYmluZEdvVG9Sb29tRXZlbnQ7XG4gICAgICAgICAgICB9LmJpbmQodGhpcywgYnRuKSk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIOi/m+WFpeaIv+mXtFxuICAgIF9vbkdvdG9Sb29tRXZlbnQ6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICB2YXIgYnRuID0gZXZlbnQudGFyZ2V0LmdldENvbXBvbmVudChGaXJlLlVJQnV0dG9uKTtcbiAgICAgICAgdmFyIHNlbmREYXRhID0ge1xuICAgICAgICAgICAgbWFyazogYnRuLm1hcmssXG4gICAgICAgICAgICBob3VzZV91aWQ6IDBcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5vZGF0YUJhc2UuZ2xvYmFsRGF0YS5zZW5kRGF0YSA9IHNlbmREYXRhO1xuICAgICAgICBGaXJlLkVuZ2luZS5sb2FkU2NlbmUoJ3ZpbGxhJyk7XG4gICAgfSxcbiAgICAvLyDmuIXnqbrmiL/pl7RcbiAgICBfcmVtb3ZlUGxhbjogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgY2hpbGRyZW4gPSB0aGlzLnJvb3QuZ2V0Q2hpbGRyZW4oKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7aSA8IGNoaWxkcmVuLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBjaGlsZHJlbltpXS5kZXN0cm95KCk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIOWFs+mXreaMiemSruS6i+S7tlxuICAgIF9vbkNsb3NlV2luZG93RXZlbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5jbG9zZVdpbmRvdygpO1xuICAgICAgICB0aGlzLl9yZW1vdmVQbGFuKCk7XG4gICAgfSxcbiAgICAvL1xuICAgIHN0YXJ0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIOW4uOeUqOeahOWPmOmHjy/mlbDmja5cbiAgICAgICAgdmFyIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9PRGF0YUJhc2UnKTtcbiAgICAgICAgdGhpcy5vZGF0YUJhc2UgPSBlbnQuZ2V0Q29tcG9uZW50KCdPRGF0YUJhc2UnKTtcbiAgICAgICAgLy8g57uR5a6a5LqL5Lu2XG4gICAgICAgIHRoaXMuYnRuX2Nsb3NlLm9uQ2xpY2sgPSB0aGlzLl9vbkNsb3NlV2luZG93RXZlbnQuYmluZCh0aGlzKTtcbiAgICAgICAgLy9cbiAgICAgICAgdGhpcy5wbGFuTGlzdCA9IHt9O1xuICAgIH1cbn0pO1xuXG5GaXJlLl9SRnBvcCgpOyIsIkZpcmUuX1JGcHVzaChtb2R1bGUsICc5MDJlY3ViZEpwR2haaXpNUHk0bW1TaCcsICdQcmljZURlc2NyaXB0aW9uJyk7XG4vLyBzY3JpcHRcXHZpbGxhXFxQcmljZURlc2NyaXB0aW9uLmpzXG5cbnZhciBQcmljZURlc2NyaXB0aW9uID0gRmlyZS5DbGFzcyh7XG4gICAgZXh0ZW5kczogRmlyZS5Db21wb25lbnQsXG5cbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIHRvdGFsOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5UZXh0XG4gICAgICAgIH0sXG4gICAgICAgIGRpc2NvdW50OiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5UZXh0XG4gICAgICAgIH0sXG4gICAgICAgIHBheToge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVGV4dFxuICAgICAgICB9XG4gICAgfSxcbiAgICAvL1xuICAgIHJlc2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMudG90YWwudGV4dCA9ICcwLjAwQ+W4gSc7XG4gICAgICAgIHRoaXMuZGlzY291bnQudGV4dCA9ICcwLjAwQ+W4gSc7XG4gICAgICAgIHRoaXMucGF5LnRleHQgPSAnMC4wMEPluIEnO1xuICAgICAgICB0aGlzLmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcbiAgICB9LFxuICAgIC8vIOWIt+aWsFxuICAgIHJlZnJlc2g6IGZ1bmN0aW9uICh0b3RhbCwgZGlzY291bnQsIHBheSkge1xuICAgICAgICB0aGlzLnRvdGFsLnRleHQgPSAodG90YWwgfHwgMCkgKyAnQ+W4gSc7XG4gICAgICAgIHRoaXMuZGlzY291bnQudGV4dCA9IChkaXNjb3VudCB8fCAwKSArICdD5biBJztcbiAgICAgICAgdGhpcy5wYXkudGV4dCA9IChwYXkgfHwgMCkgKyAnQ+W4gSc7XG4gICAgICAgIHRoaXMuZW50aXR5LmFjdGl2ZSA9IHRydWU7XG4gICAgfVxufSk7XG5cbkZpcmUuUHJpY2VEZXNjcmlwdGlvbiA9IFByaWNlRGVzY3JpcHRpb247XG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJzUzNGIxbSs0THBIbzUzUXJtU1BMOWNEJywgJ1NDb250cm9sTWdyJyk7XG4vLyBzY3JpcHRcXHNpbmdsZVxcU0NvbnRyb2xNZ3IuanNcblxuLy8g77+9w7vvv73vv73vv73vv73vv73vv73vv73vv73vv73vv73vv71cclxudmFyIFNDb250cm9sTWdyID0gRmlyZS5DbGFzcyh7XHJcbiAgICAvLyDvv73Ms++/vVxyXG4gICAgZXh0ZW5kczogRmlyZS5Db21wb25lbnQsXHJcbiAgICAvLyDvv73vv73vv73suq/vv73vv71cclxuICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5iaW5kZWRNb3VzZURvd25FdmVudCA9IHRoaXMuX29uTW91c2VEb3duRXZlbnQuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLmJpbmRlZE1vdXNlTW92ZUV2ZW50ID0gdGhpcy5fb25Nb3VzZU1vdmVFdmVudC5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuYmluZGVkTW91c2VVcEV2ZW50ID0gdGhpcy5fb25Nb3VzZVVwRXZlbnQuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLl9iYWNrdXBTZWxlY3RUYXJnZXQgPSBudWxsO1xyXG4gICAgfSxcclxuICAgIC8vIO+/ve+/ve+/ve+/vVxyXG4gICAgcHJvcGVydGllczoge1xyXG4gICAgICAgIF9zZWxlY3RUYXJnZXQ6IG51bGwsXHJcbiAgICAgICAgX2xhc3RTZWxlY3RUYXJnZXQ6IG51bGwsXHJcbiAgICAgICAgX3NlbGVjdFRhcmdldEluaXRQb3M6IEZpcmUuVmVjMi56ZXJvLFxyXG4gICAgICAgIF9tb3VzZURvd25Qb3M6IEZpcmUuVmVjMi56ZXJvLFxyXG4gICAgICAgIF9oYXNNb3ZlVGFyZ2V0OiBmYWxzZVxyXG4gICAgfSxcclxuICAgIC8vIO+/ve+/ve+/veqwtO+/ve+/ve+/vcK877+9XHJcbiAgICBfb25Nb3VzZURvd25FdmVudDogZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgICAgdmFyIHRhcmdldCA9IGV2ZW50LnRhcmdldDtcclxuICAgICAgICBpZiAoIXRhcmdldCApIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgZnVybml0dXJlID0gdGFyZ2V0LmdldENvbXBvbmVudCgnU0Z1cm5pdHVyZScpO1xyXG4gICAgICAgIGlmIChmdXJuaXR1cmUgJiYgZnVybml0dXJlLmhhc0RyYWcpIHtcclxuICAgICAgICAgICAgLy9cclxuICAgICAgICAgICAgdGhpcy5fc2VsZWN0VGFyZ2V0ID0gdGFyZ2V0O1xyXG4gICAgICAgICAgICB0aGlzLl9iYWNrdXBTZWxlY3RUYXJnZXQgPSB0aGlzLl9zZWxlY3RUYXJnZXQ7XHJcbiAgICAgICAgICAgIHRoaXMuX3NlbGVjdFRhcmdldEluaXRQb3MgPSB0YXJnZXQudHJhbnNmb3JtLnBvc2l0aW9uO1xyXG4gICAgICAgICAgICB2YXIgc2NyZWVuZFBvcyA9IG5ldyBGaXJlLlZlYzIoZXZlbnQuc2NyZWVuWCwgZXZlbnQuc2NyZWVuWSk7XHJcbiAgICAgICAgICAgIHRoaXMuX21vdXNlRG93blBvcyA9IEZpcmUuQ2FtZXJhLm1haW4uc2NyZWVuVG9Xb3JsZChzY3JlZW5kUG9zKTtcclxuICAgICAgICAgICAgdGhpcy5fc2VsZWN0VGFyZ2V0LnNldEFzTGFzdFNpYmxpbmcoKTtcclxuICAgICAgICAgICAgdGhpcy5faGFzTW92ZVRhcmdldCA9IHRydWU7XHJcbiAgICAgICAgICAgIC8vIO+/vce377+977+98r+qv++/ve+/ve+/vdGh77+97qOs77+977+977+977+977+977+977+977+9zazvv73Etu+/ve+/ve+/ve+/vc2y77+977+977+90qrvv73vv73vv73CtO+/ve+/ve+/vVxyXG4gICAgICAgICAgICBpZiAodGhpcy5fc2VsZWN0VGFyZ2V0ICE9PSB0aGlzLl9sYXN0U2VsZWN0VGFyZ2V0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNkYXRhQmFzZS5vcHRpb25zLm9wZW4odGhpcy5fc2VsZWN0VGFyZ2V0KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2xhc3RTZWxlY3RUYXJnZXQgPSB0aGlzLl9zZWxlY3RUYXJnZXQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNkYXRhQmFzZS5vcHRpb25zLmhhc09wZW4oKSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc2RhdGFCYXNlLm9wdGlvbnMuaGFzVG91Y2godGFyZ2V0KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3NlbGVjdFRhcmdldCA9IHRoaXMuX2JhY2t1cFNlbGVjdFRhcmdldDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3NlbGVjdFRhcmdldCA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZGF0YUJhc2Uub3B0aW9ucy5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8g77+977+977+977+977+9xrbvv73vv73CvO+/vVxyXG4gICAgX29uTW91c2VNb3ZlRXZlbnQ6IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9zZWxlY3RUYXJnZXQgJiYgdGhpcy5faGFzTW92ZVRhcmdldCkge1xyXG4gICAgICAgICAgICB0aGlzLl9tb3ZlKGV2ZW50KTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8g77+9xrbvv73vv73Svu+/vVxyXG4gICAgX21vdmU6IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgIHZhciBtb3ZlUG9zID0gbmV3IEZpcmUuVmVjMihldmVudC5zY3JlZW5YLCBldmVudC5zY3JlZW5ZKTtcclxuICAgICAgICB2YXIgbW92ZVdvcmRQb3MgPSBGaXJlLkNhbWVyYS5tYWluLnNjcmVlblRvV29ybGQobW92ZVBvcyk7XHJcblxyXG4gICAgICAgIHZhciBvZmZzZXRXb3JkUG9zID0gRmlyZS5WZWMyLnplcm87XHJcbiAgICAgICAgb2Zmc2V0V29yZFBvcy54ID0gdGhpcy5fbW91c2VEb3duUG9zLnggLSBtb3ZlV29yZFBvcy54O1xyXG4gICAgICAgIG9mZnNldFdvcmRQb3MueSA9IHRoaXMuX21vdXNlRG93blBvcy55IC0gbW92ZVdvcmRQb3MueTtcclxuXHJcbiAgICAgICAgdGhpcy5fc2VsZWN0VGFyZ2V0LnRyYW5zZm9ybS54ID0gdGhpcy5fc2VsZWN0VGFyZ2V0SW5pdFBvcy54IC0gb2Zmc2V0V29yZFBvcy54O1xyXG4gICAgICAgIHRoaXMuX3NlbGVjdFRhcmdldC50cmFuc2Zvcm0ueSA9IHRoaXMuX3NlbGVjdFRhcmdldEluaXRQb3MueSAtIG9mZnNldFdvcmRQb3MueTtcclxuXHJcbiAgICAgICAgdGhpcy5zZGF0YUJhc2Uub3B0aW9ucy5zZXRQb3ModGhpcy5fc2VsZWN0VGFyZ2V0LnRyYW5zZm9ybS53b3JsZFBvc2l0aW9uKTtcclxuICAgIH0sXHJcbiAgICAvLyDvv73vv73vv73vv73vv73Nt++/ve+/vcK877+9XHJcbiAgICBfb25Nb3VzZVVwRXZlbnQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLl9oYXNNb3ZlVGFyZ2V0ID0gZmFsc2U7XHJcbiAgICB9LFxyXG4gICAgLy8g77+977+977+92L/vv73vv73vv73Roe+/ve+/vVxyXG4gICAgX29uSGlkZUV2ZW50OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5fc2VsZWN0VGFyZ2V0ID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9iYWNrdXBTZWxlY3RUYXJnZXQgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX2xhc3RTZWxlY3RUYXJnZXQgPSBudWxsO1xyXG4gICAgfSxcclxuICAgIC8vIO+/ve+/vdeq77+977+977+977+9XHJcbiAgICBfb25NaXJyb3JGbGlwRXZlbnQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAodGhpcy5fc2VsZWN0VGFyZ2V0KSB7XHJcbiAgICAgICAgICAgIHZhciBzY2FsZVggPSB0aGlzLl9zZWxlY3RUYXJnZXQudHJhbnNmb3JtLnNjYWxlWDtcclxuICAgICAgICAgICAgdGhpcy5fc2VsZWN0VGFyZ2V0LnRyYW5zZm9ybS5zY2FsZVggPSBzY2FsZVggPiAxID8gLXNjYWxlWCA6IE1hdGguYWJzKHNjYWxlWCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIMm+77+977+90aHvv73vv73vv73vv73vv73vv71cclxuICAgIF9vbkRlbGV0ZVRhcmdldEV2ZW50OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5fc2VsZWN0VGFyZ2V0LmRlc3Ryb3koKTtcclxuICAgICAgICB0aGlzLl9zZWxlY3RUYXJnZXQgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX2JhY2t1cFNlbGVjdFRhcmdldCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fbGFzdFNlbGVjdFRhcmdldCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5zZGF0YUJhc2Uub3B0aW9ucy5oaWRlKCk7XHJcbiAgICB9LFxyXG4gICAgLy8g77+977+977+977+9XHJcbiAgICByZXNldDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuc2RhdGFCYXNlLm9wdGlvbnMuaGlkZSgpO1xyXG4gICAgICAgIHRoaXMuX3NlbGVjdFRhcmdldCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fYmFja3VwU2VsZWN0VGFyZ2V0ID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9sYXN0U2VsZWN0VGFyZ2V0ID0gbnVsbDtcclxuICAgIH0sXHJcbiAgICAvLyDvv73vv73vv73vv73vv73CvO+/vVxyXG4gICAgc3RhcnQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAvLyDvv73vv73vv73DtcSx77+977+977+9L++/ve+/ve+/ve+/vVxyXG4gICAgICAgIHZhciBlbnQgPSBGaXJlLkVudGl0eS5maW5kKCcvU0RhdGFCYXNlJyk7XHJcbiAgICAgICAgdGhpcy5zZGF0YUJhc2UgPSBlbnQuZ2V0Q29tcG9uZW50KCdTRGF0YUJhc2UnKTtcclxuXHJcbiAgICAgICAgRmlyZS5JbnB1dC5vbignbW91c2Vkb3duJywgdGhpcy5iaW5kZWRNb3VzZURvd25FdmVudCk7XHJcbiAgICAgICAgRmlyZS5JbnB1dC5vbignbW91c2Vtb3ZlJywgdGhpcy5iaW5kZWRNb3VzZU1vdmVFdmVudCk7XHJcbiAgICAgICAgRmlyZS5JbnB1dC5vbignbW91c2V1cCcsIHRoaXMuYmluZGVkTW91c2VVcEV2ZW50KTtcclxuICAgICAgICAvL1xyXG4gICAgICAgIHRoaXMuc2RhdGFCYXNlLm9wdGlvbnMub25IaWRlRXZlbnQgPSB0aGlzLl9vbkhpZGVFdmVudC5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuc2RhdGFCYXNlLm9wdGlvbnMuYnRuX2RlbC5vbk1vdXNlZG93biA9IHRoaXMuX29uRGVsZXRlVGFyZ2V0RXZlbnQuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLnNkYXRhQmFzZS5vcHRpb25zLmJ0bl9NaXJyb3JGbGlwLm9uTW91c2Vkb3duID0gdGhpcy5fb25NaXJyb3JGbGlwRXZlbnQuYmluZCh0aGlzKTtcclxuICAgIH0sXHJcbiAgICAvLyDvv73vv73vv73vv71cclxuICAgIG9uRGVzdHJveTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgRmlyZS5JbnB1dC5vZmYoJ21vdXNlZG93bicsIHRoaXMuYmluZGVkTW91c2VEb3duRXZlbnQpO1xyXG4gICAgICAgIEZpcmUuSW5wdXQub2ZmKCdtb3VzZW1vdmUnLCB0aGlzLmJpbmRlZE1vdXNlTW92ZUV2ZW50KTtcclxuICAgICAgICBGaXJlLklucHV0Lm9mZignbW91c2V1cCcsIHRoaXMuYmluZGVkTW91c2VVcEV2ZW50KTtcclxuICAgIH1cclxufSk7XHJcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnNTk0ZDZDZUNFMUFWNnBEc3BSdXBxMm8nLCAnU0RhdGFCYXNlJyk7XG4vLyBzY3JpcHRcXHNpbmdsZVxcU0RhdGFCYXNlLmpzXG5cbi8vIOaVsOaNruW6k1xyXG52YXIgU0RhdGFCYXNlID0gRmlyZS5DbGFzcyh7XHJcbiAgICAvLyDnu6fmib9cclxuICAgIGV4dGVuZHM6IEZpcmUuQ29tcG9uZW50LFxyXG4gICAgLy8g5p6E6YCg5Ye95pWwXHJcbiAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIC8vIOWIneWni+WMluWcuuaZr+aVsOaNrlxyXG4gICAgICAgIHRoaXMuaW5pdFNjcmVlbkRhdGEgPSBbXTtcclxuICAgICAgICAvLyDkuoznuqfoj5zljZXmlbDmja5cclxuICAgICAgICB0aGlzLnNlY29uZGFyeU1lbnVEYXRhU2hlZXRzID0gW107XHJcbiAgICAgICAgLy8g5LiJ57qn6I+c5Y2V5oC75pWwXHJcbiAgICAgICAgdGhpcy50aHJlZU1lbnVEYXRhVG90YWxTaGVldHMgPSB7fTtcclxuICAgICAgICAvLyDkuInnuqfoj5zljZXmlbDmja5cclxuICAgICAgICB0aGlzLnRocmVlTWVudURhdGFTaGVldHMgPSB7fTtcclxuICAgICAgICAvLyDkuInnuqfoj5zljZXlpKflm77liJfooahcclxuICAgICAgICB0aGlzLnRocmVlTWVudUJpZ0ltYWdlU2hlZXRzID0gW107XHJcbiAgICAgICAgLy8g5oiR55qE6KOF5omu5pWw5o2u5oC75pWwXHJcbiAgICAgICAgdGhpcy5teURyZXNzVXBUb3RhbCA9IDA7XHJcbiAgICAgICAgLy8g5oiR55qE6KOF5omu5pWw5o2u5YiX6KGoXHJcbiAgICAgICAgdGhpcy5teURyZXNzVXBEYXRhU2hlZXRzID0gW107XHJcbiAgICAgICAgLy8g5L+d5a2Y5omA5pyJ5Zu+54mHXHJcbiAgICAgICAgdGhpcy5sb2FkSW1hZ2VMaXN0ID0ge307XHJcbiAgICB9LFxyXG4gICAgLy8g5Yqg6L296aKE5Yi2XHJcbiAgICBfbG9hZE9iamVjdDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIC8vIOaIv+mXtOWktOiKgueCuVxyXG4gICAgICAgIHRoaXMucm9vbSA9IEZpcmUuRW50aXR5LmZpbmQoJy9Sb29tJyk7XHJcbiAgICAgICAgLy8g5o6n5Yi2566h55CG57G7XHJcbiAgICAgICAgdGhpcy5zY29udHJvbE1nciA9IHRoaXMucm9vbS5nZXRDb21wb25lbnQoJ1NDb250cm9sTWdyJyk7XHJcbiAgICAgICAgLy8g5o6n5Yi26YCJ6aG5XHJcbiAgICAgICAgdmFyIGVudCA9IHRoaXMuZW50aXR5LmZpbmQoJ09wdGlvbnMnKTtcclxuICAgICAgICB0aGlzLm9wdGlvbnMgPSBlbnQuZ2V0Q29tcG9uZW50KCdPcHRpb25zJyk7XHJcbiAgICAgICAgLy8g6IOM5pmvXHJcbiAgICAgICAgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL1Jvb20vYmFja2dyb3VuZCcpO1xyXG4gICAgICAgIHRoaXMuYmdSZW5kZXIgPSBlbnQuZ2V0Q29tcG9uZW50KEZpcmUuU3ByaXRlUmVuZGVyZXIpO1xyXG4gICAgICAgIC8vIOWcsOadv1xyXG4gICAgICAgIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9Sb29tL2dyb3VuZCcpO1xyXG4gICAgICAgIHRoaXMuZ3JvdW5kUmVuZGVyID0gZW50LmdldENvbXBvbmVudChGaXJlLlNwcml0ZVJlbmRlcmVyKTtcclxuICAgICAgICAvLyDkurrnianlvaLosaFcclxuICAgICAgICBlbnQgPSBGaXJlLkVudGl0eS5maW5kKCcvQ2hhcmFjdGVycycpO1xyXG4gICAgICAgIHRoaXMuY2hhcmFjdGVycyA9IGVudC5nZXRDb21wb25lbnQoRmlyZS5TcHJpdGVSZW5kZXJlcik7XHJcbiAgICAgICAgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL0NoYXJhY3RlcnMvQ2hhcmFjdGVyc05hbWUnKTtcclxuICAgICAgICB0aGlzLmNoYXJhY3RlcnNOYW1lID0gZW50LmdldENvbXBvbmVudChGaXJlLkJpdG1hcFRleHQpO1xyXG4gICAgICAgIC8vIOS6jOe6p+WtkOiPnOWNleaooeadv1xyXG4gICAgICAgIHRoaXMudGVtcFNlY29uZGFyeU1lbnUgPSB0aGlzLmVudGl0eS5maW5kKCdTZWNvbmRhcnlNZW51Jyk7XHJcbiAgICAgICAgLy8g5LiJ57qn5a2Q6I+c5Y2V5qih5p2/XHJcbiAgICAgICAgdGhpcy50ZW1wVGhyZWVNZW51ID0gdGhpcy5lbnRpdHkuZmluZCgnVGhyZWVNZW51Jyk7XHJcbiAgICAgICAgLy8g5a625YW35qih5p2/XHJcbiAgICAgICAgdGhpcy50ZW1wRnVybml0dXJlID0gdGhpcy5lbnRpdHkuZmluZCgnRnVybml0dXJlJyk7XHJcbiAgICAgICAgLy8g5oi/6Ze057G75Z6L5qih5p2/XHJcbiAgICAgICAgdGhpcy50ZW1wUm9vbVR5cGUgPSB0aGlzLmVudGl0eS5maW5kKCdSb29tVHlwZScpO1xyXG4gICAgICAgIC8vIOijheaJruaVsOaNruaooeadv1xyXG4gICAgICAgIHRoaXMudGVtcE15RHJlc3NVcERhdGEgPSB0aGlzLmVudGl0eS5maW5kKCdNeURyZXNzVXBEYXRhJyk7XHJcbiAgICAgICAgLy8g5LiA57qn6I+c5Y2VXHJcbiAgICAgICAgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL01lbnVfTWFpbk1ncicpO1xyXG4gICAgICAgIHRoaXMuc21haW5NZW51TWdyID0gZW50LmdldENvbXBvbmVudCgnU01haW5NZW51TWdyJyk7XHJcbiAgICAgICAgLy8g5LqM57qn6I+c5Y2VXHJcbiAgICAgICAgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL01lbnVfU2Vjb25kYXJ5TWdyJyk7XHJcbiAgICAgICAgdGhpcy5zc2Vjb25kYXJ5TWVudU1nciA9IGVudC5nZXRDb21wb25lbnQoJ1NTZWNvbmRhcnlNZW51TWdyJyk7XHJcbiAgICAgICAgLy8g5LiJ57qn57qn6I+c5Y2VXHJcbiAgICAgICAgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL01lbnVfVGhyZWVNZ3InKTtcclxuICAgICAgICB0aGlzLnN0aHJlZU1lbnVNZ3IgPSBlbnQuZ2V0Q29tcG9uZW50KCdTVGhyZWVNZW51TWdyJyk7XHJcbiAgICAgICAgLy8g572R57uc6L+e5o6lXHJcbiAgICAgICAgdGhpcy5zbmV0V29ya01nciA9IHRoaXMuZW50aXR5LmdldENvbXBvbmVudCgnU05ldHdvcmtNZ3InKTtcclxuICAgICAgICAvLyDmi43nhafliJvlu7rnvKnnlaXlm75cclxuICAgICAgICBlbnQgPSBGaXJlLkVudGl0eS5maW5kKCcvU2NyZWVuc2hvdCcpO1xyXG4gICAgICAgIHRoaXMuc2NyZWVuc2hvdCA9IGVudC5nZXRDb21wb25lbnQoJ1NjcmVlbnNob3QnKTtcclxuICAgICAgICAvLyDkv53mjIHmiL/pl7TplJnor6/mj5DnpLrnqpflj6NcclxuICAgICAgICB0aGlzLnNzYXZlRXJyb3JUaXBzID0gRmlyZS5FbnRpdHkuZmluZCgnL1RpcHNfU2F2ZUVycm9yJyk7XHJcbiAgICAgICAgLy8g5L+d5oyB5oi/6Ze05pWw5o2u56qX5Y+jXHJcbiAgICAgICAgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL1dpbl9TYXZlUm9vbScpO1xyXG4gICAgICAgIHRoaXMuc3NhdmVSb29tV2luZG93ID0gZW50LmdldENvbXBvbmVudCgnU1NhdmVSb29tV2luZG93Jyk7XHJcbiAgICAgICAgLy8g5o+Q56S656qX5Y+jXHJcbiAgICAgICAgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL1dpbl9UaXBzJyk7XHJcbiAgICAgICAgdGhpcy5zdGlwc1dpbmRvdyA9IGVudC5nZXRDb21wb25lbnQoJ1NUaXBzV2luZG93Jyk7XHJcbiAgICAgICAgLy8g6KOF5omu56qX5Y+jXHJcbiAgICAgICAgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL1dpbl9NeURyZXNzVXAnKTtcclxuICAgICAgICB0aGlzLnNteURyZXNzVXBXaW5kb3cgPSBlbnQuZ2V0Q29tcG9uZW50KCdTTXlEcmVzc1VwV2luZG93Jyk7XHJcbiAgICAgICAgLy8g5Yqg6L295o+Q56S656qX5Y+jXHJcbiAgICAgICAgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL1RpcHNfTG9hZGluZycpO1xyXG4gICAgICAgIHRoaXMuc2xvYWRpbmdUaXBzID0gZW50LmdldENvbXBvbmVudCgnU0xvYWRpbmdUaXBzJyk7XHJcbiAgICAgICAgLy8g5o+Q56S65rKh5pyJ55So5oi35L+h5oGvXHJcbiAgICAgICAgdGhpcy5zdG9LZW5UaXBzID0gRmlyZS5FbnRpdHkuZmluZCgnL1RpcHNfVG9LZW4nKTtcclxuXHJcbiAgICAgICAgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL0dsb2JhbERhdGEnKTtcclxuICAgICAgICBpZiAoZW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2xvYmFsRGF0YSA9IGVudC5nZXRDb21wb25lbnQoXCJHbG9iYWxEYXRhXCIpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvLyDovb3lhaXml7ZcclxuICAgIG9uTG9hZDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIC8vIOWKoOi9vemihOWItlxyXG4gICAgICAgIHRoaXMuX2xvYWRPYmplY3QoKTtcclxuICAgICAgICAvLyDliKTmlq3mmK/lkKbmnIlUb0tlblxyXG4gICAgICAgIGlmICghdGhpcy5zbmV0V29ya01nci5nZXRUb0tlblZhbHVlKCkpe1xyXG4gICAgICAgICAgICB0aGlzLnN0b0tlblRpcHMuYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIC8vIOS4i+i9veWbvueJh1xyXG4gICAgbG9hZEltYWdlOiBmdW5jdGlvbiAodXJsLCBjYWxsYmFjaykge1xyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICBpZiAoc2VsZi5sb2FkSW1hZ2VMaXN0W3VybF0pIHtcclxuICAgICAgICAgICAgdmFyIGltYWdlID0gc2VsZi5sb2FkSW1hZ2VMaXN0W3VybF07XHJcbiAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xyXG4gICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgaW1hZ2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgRmlyZS5JbWFnZUxvYWRlcih1cmwsIGZ1bmN0aW9uIChlcnJvciwgaW1hZ2UpIHtcclxuICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnJvciwgaW1hZ2UpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChpbWFnZSkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5sb2FkSW1hZ2VMaXN0W3VybF0gPSBpbWFnZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuXHJcbiAgICAvLyDliLfmlrDlnLrmma/mlbDmja5cclxuICAgIHJlZnJlc2hTY3JlZW46IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmJnUmVuZGVyICYmICF0aGlzLmdyb3VuZFJlbmRlcikge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBjb21wID0gbnVsbDtcclxuICAgICAgICBpZiAoZGF0YS5wcm9wVHlwZSA9PT0gMSkge1xyXG4gICAgICAgICAgICAvLyDog4zmma9cclxuICAgICAgICAgICAgY29tcCA9IHRoaXMuYmdSZW5kZXIuZW50aXR5LmdldENvbXBvbmVudCgnU0Z1cm5pdHVyZScpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgLy8g5Zyw6Z2iXHJcbiAgICAgICAgICAgIGNvbXAgPSB0aGlzLmdyb3VuZFJlbmRlci5lbnRpdHkuZ2V0Q29tcG9uZW50KCdTRnVybml0dXJlJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbXAudE5hbWUgPSBkYXRhLnROYW1lO1xyXG4gICAgICAgIGNvbXAuc3VpdF9pZCA9IGRhdGEuc3VpdF9pZDtcclxuICAgICAgICBjb21wLnByb3BUeXBlID0gZGF0YS5wcm9wVHlwZTtcclxuICAgICAgICBjb21wLmltYWdlVXJsID0gZGF0YS5pbWFnZVVybDtcclxuICAgICAgICBjb21wLnNldFNwcml0ZShkYXRhLnNwcml0ZSk7XHJcbiAgICAgICAgY29tcC5kZWZhdWx0U3ByaXRlID0gZGF0YS5zcHJpdGU7XHJcbiAgICB9LFxyXG4gICAgLy8g6aKE5Yqg6L295Yid5aeL5YyW5Zy65pmvXHJcbiAgICBwcmVsb2FkSW5pdFNjcmVlbkRhdGE6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgICAgdGhpcy5jaGFyYWN0ZXJzLmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcclxuICAgICAgICBpZiAodGhpcy5nbG9iYWxEYXRhKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmdsb2JhbERhdGEuZ290b1R5cGUgPT09IDIpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2hhcmFjdGVycy5zcHJpdGUgPSB0aGlzLmdsb2JhbERhdGEuaG9zdFNwcml0ZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2hhcmFjdGVyc05hbWUudGV4dCA9IHRoaXMuZ2xvYmFsRGF0YS5ob3N0TmFtZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2hhcmFjdGVycy5lbnRpdHkuYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3NlY29uZGFyeU1lbnVNZ3Iub3BlblNlY29uZGFyeU1lbnUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8g5aaC5L2V5pyJ57yT5a2Y55So57yT5a2Y55qE5rKh5pyJ5YaN5Y675LiL6L29XHJcbiAgICAgICAgaWYgKHRoaXMuaW5pdFNjcmVlbkRhdGEubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuaW5pdFNjcmVlbkRhdGEubGVuZ3RoOyArK2kpe1xyXG4gICAgICAgICAgICAgICAgdmFyIGRhdGEgPSB0aGlzLmluaXRTY3JlZW5EYXRhW2ldO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5yZWZyZXNoU2NyZWVuKGRhdGEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIHNlbGYuc2xvYWRpbmdUaXBzLm9wZW5UaXBzKFwi5Yid5aeL5YyW5Zy65pmv5LitLi5cIik7XHJcbiAgICAgICAgdmFyIGluZGV4ID0gMCwgbWF4SW5kZXggPSAwO1xyXG4gICAgICAgIHNlbGYuc25ldFdvcmtNZ3IuUmVxdWVzdEluaXRIb21lKGZ1bmN0aW9uIChzZXJ2ZXJEYXRhKSB7XHJcbiAgICAgICAgICAgIG1heEluZGV4ID0gc2VydmVyRGF0YS5saXN0Lmxlbmd0aDtcclxuICAgICAgICAgICAgc2VydmVyRGF0YS5saXN0LmZvckVhY2goZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgIC8vXHJcbiAgICAgICAgICAgICAgICB2YXIgbmV3RGF0YSA9IHtcclxuICAgICAgICAgICAgICAgICAgICBwb3M6IGRhdGEucG9zLFxyXG4gICAgICAgICAgICAgICAgICAgIHNjYWxlOiBkYXRhLnNjYWxlLFxyXG4gICAgICAgICAgICAgICAgICAgIHROYW1lOiBkYXRhLnByb3BzTmFtZSxcclxuICAgICAgICAgICAgICAgICAgICBzdWl0X2lkOiBkYXRhLmlkLFxyXG4gICAgICAgICAgICAgICAgICAgIHJvdGF0aW9uOiBkYXRhLnJvdGF0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgIHByb3BUeXBlOiBkYXRhLnByb3BzVHlwZSxcclxuICAgICAgICAgICAgICAgICAgICBpbWFnZVVybDogZGF0YS5pbWdVcmwsXHJcbiAgICAgICAgICAgICAgICAgICAgc3ByaXRlOiBudWxsXHJcbiAgICAgICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgICAgIC8vXHJcbiAgICAgICAgICAgICAgICB2YXIgbG9hZEltYWdlQ2FsbEJhY2sgPSBmdW5jdGlvbiAobmV3RGF0YSwgZXJyb3IsIGltYWdlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaW5kZXgrKztcclxuICAgICAgICAgICAgICAgICAgICBpZihpbmRleCA9PT0gbWF4SW5kZXgpe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnNsb2FkaW5nVGlwcy5jbG9zZVRpcHMoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFGaXJlLkVuZ2luZS5pc1BsYXlpbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIG5ld0RhdGEuc3ByaXRlID0gbmV3IEZpcmUuU3ByaXRlKGltYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLnJlZnJlc2hTY3JlZW4obmV3RGF0YSk7XHJcbiAgICAgICAgICAgICAgICB9LmJpbmQodGhpcywgbmV3RGF0YSk7XHJcbiAgICAgICAgICAgICAgICAvL1xyXG4gICAgICAgICAgICAgICAgc2VsZi5sb2FkSW1hZ2UobmV3RGF0YS5pbWFnZVVybCwgbG9hZEltYWdlQ2FsbEJhY2spO1xyXG4gICAgICAgICAgICAgICAgLy9cclxuICAgICAgICAgICAgICAgIGlmIChzZWxmLmluaXRTY3JlZW5EYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5pbml0U2NyZWVuRGF0YS5wdXNoKG5ld0RhdGEpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICAvLyDliqDovb3liKDpmaTljZXkuKroo4Xmia7lkI7liLfmlrDnmoTmlbDmja5cclxuICAgIGxvYWRSZWZyZXNoTXlEcmVzc1VwRGF0YTogZnVuY3Rpb24gKGN1cklELCBjYWxsYmFjaykge1xyXG4gICAgICAgIHZhciBzZW5kRGF0YSA9IHtcclxuICAgICAgICAgICAgaWQ6IGN1cklEXHJcbiAgICAgICAgfTtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgc2VsZi5teURyZXNzVXBUb3RhbCA9IDA7XHJcbiAgICAgICAgc2VsZi5teURyZXNzVXBEYXRhU2hlZXRzID0gW107XHJcbiAgICAgICAgdmFyIGluZGV4ID0gMDtcclxuICAgICAgICB0aGlzLnNuZXRXb3JrTWdyLlJlcXVlc3REZWxIb21lKHNlbmREYXRhLCBmdW5jdGlvbiAoYWxsRGF0YSkge1xyXG4gICAgICAgICAgICBpZiAoISBGaXJlLkVuZ2luZS5pc1BsYXlpbmcpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzZWxmLm15RHJlc3NVcFRvdGFsID0gcGFyc2VJbnQoYWxsRGF0YS50b3RhbCk7XHJcbiAgICAgICAgICAgIGlmIChzZWxmLm15RHJlc3NVcFRvdGFsID09PSAwKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGFsbERhdGEubGlzdC5mb3JFYWNoKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbXlEcmVzc1VwRGF0YSA9IHtcclxuICAgICAgICAgICAgICAgICAgICBpZDogZGF0YS5zdWl0X2lkLFxyXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IGRhdGEuc3VpdF9uYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IGRhdGEucm9vbV90eXBlLFxyXG4gICAgICAgICAgICAgICAgICAgIHR5cGVOYW1lOiBkYXRhLnJvb21fbmFtZSxcclxuICAgICAgICAgICAgICAgICAgICBpc0RyZXNzOiBkYXRhLmlzZHJlc3MgPiAwXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgLy9cclxuICAgICAgICAgICAgICAgIHNlbGYubXlEcmVzc1VwRGF0YVNoZWV0cy5wdXNoKG15RHJlc3NVcERhdGEpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGluZGV4ID09PSBhbGxEYXRhLmxpc3QubGVuZ3RoIC0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGluZGV4Kys7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICB9LFxyXG4gICAgLy8g5qOA5p+l5pyN5Yqh5Zmo5LiK55qE5pWw5o2u5piv5ZCm5LiO5pys5Zyw55u45ZCMXHJcbiAgICBjaGVja2luZ015RHJlc3NVcERhdGE6IGZ1bmN0aW9uIChjYWxsYmFjaykge1xyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICB2YXIgc2VuZERhdGEgPSB7XHJcbiAgICAgICAgICAgIHBhZ2U6IDEsXHJcbiAgICAgICAgICAgIGVhY2hudW06IDYsXHJcbiAgICAgICAgICAgIHJvb21fdHlwZTogLTFcclxuICAgICAgICB9O1xyXG4gICAgICAgIHNlbGYuc25ldFdvcmtNZ3IuUmVxdWVzdEhvbWVMaXN0KHNlbmREYXRhLCBmdW5jdGlvbiAoYWxsRGF0YSkge1xyXG4gICAgICAgICAgICBpZiAoISBGaXJlLkVuZ2luZS5pc1BsYXlpbmcpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzZWxmLm15RHJlc3NVcERhdGFTaGVldHMgPSBbXTtcclxuICAgICAgICAgICAgc2VsZi5teURyZXNzVXBUb3RhbCA9IHBhcnNlSW50KGFsbERhdGEudG90YWwpO1xyXG4gICAgICAgICAgICB2YXIgaW5kZXggPSAwO1xyXG4gICAgICAgICAgICBhbGxEYXRhLmxpc3QuZm9yRWFjaChmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIG15RHJlc3NVcERhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWQ6IGRhdGEuc3VpdF9pZCxcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBkYXRhLnN1aXRfbmFtZSxcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBkYXRhLnJvb21fdHlwZSxcclxuICAgICAgICAgICAgICAgICAgICB0eXBlTmFtZTogZGF0YS5yb29tX25hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgaXNEcmVzczogZGF0YS5pc2RyZXNzID4gMFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGluZGV4KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGluZGV4Kys7XHJcbiAgICAgICAgICAgICAgICAvL1xyXG4gICAgICAgICAgICAgICAgc2VsZi5teURyZXNzVXBEYXRhU2hlZXRzLnB1c2gobXlEcmVzc1VwRGF0YSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBpZiAoY2FsbGJhY2sgKXtcclxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICAvLyDpooTliqDovb3miJHnmoToo4Xmia7mlbDmja5cclxuICAgIHByZWxvYWRNeURyZXNzVXBEYXRhOiBmdW5jdGlvbiAocGFnZSwgZWFjaCwgY2FsbGJhY2spIHtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgdmFyIHNlbmREYXRhID0ge1xyXG4gICAgICAgICAgICBwYWdlOiBwYWdlLFxyXG4gICAgICAgICAgICBlYWNobnVtOiBlYWNoLFxyXG4gICAgICAgICAgICByb29tX3R5cGU6IC0xXHJcbiAgICAgICAgfTtcclxuICAgICAgICBzZWxmLnNuZXRXb3JrTWdyLlJlcXVlc3RIb21lTGlzdChzZW5kRGF0YSwgZnVuY3Rpb24gKGFsbERhdGEpIHtcclxuICAgICAgICAgICAgaWYgKCEgRmlyZS5FbmdpbmUuaXNQbGF5aW5nKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc2VsZi5teURyZXNzVXBUb3RhbCA9IHBhcnNlSW50KGFsbERhdGEudG90YWwpO1xyXG4gICAgICAgICAgICB2YXIgaW5kZXggPSAwO1xyXG4gICAgICAgICAgICBhbGxEYXRhLmxpc3QuZm9yRWFjaChmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIG15RHJlc3NVcERhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWQ6IGRhdGEuc3VpdF9pZCxcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBkYXRhLnN1aXRfbmFtZSxcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBkYXRhLnJvb21fdHlwZSxcclxuICAgICAgICAgICAgICAgICAgICB0eXBlTmFtZTogZGF0YS5yb29tX25hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgaXNEcmVzczogZGF0YS5pc2RyZXNzID4gMFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGluZGV4KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGluZGV4Kys7XHJcbiAgICAgICAgICAgICAgICAvL1xyXG4gICAgICAgICAgICAgICAgaWYgKHNlbGYubXlEcmVzc1VwRGF0YVNoZWV0cy5pbmRleE9mKG15RHJlc3NVcERhdGEpIDwgMCl7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5teURyZXNzVXBEYXRhU2hlZXRzLnB1c2gobXlEcmVzc1VwRGF0YSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIC8vIOmihOWKoOi9veS6jOe6p+iPnOWNleaVsOaNrlxyXG4gICAgcHJlbG9hZFNlY29uZGFyeU1lbnVEYXRhOiBmdW5jdGlvbiAoY2FsbGJhY2spIHtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgc2VsZi5zbmV0V29ya01nci5SZXF1ZXN0U2Vjb25kYXJ5TWVudURhdGEoZnVuY3Rpb24gKGFsbGRhdGEpIHtcclxuICAgICAgICAgICAgaWYgKCEgRmlyZS5FbmdpbmUuaXNQbGF5aW5nKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc2VsZi5zZWNvbmRhcnlNZW51RGF0YVNoZWV0cyA9IFtdO1xyXG4gICAgICAgICAgICB2YXIgaW5kZXggPSAwO1xyXG4gICAgICAgICAgICBhbGxkYXRhLmxpc3QuZm9yRWFjaChmdW5jdGlvbiAoc2VydmVyRGF0YSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGlkOiBzZXJ2ZXJEYXRhLnRpZCxcclxuICAgICAgICAgICAgICAgICAgICBpc2RyYWc6IHNlcnZlckRhdGEuaXNkcmFnLFxyXG4gICAgICAgICAgICAgICAgICAgIHRuYW1lOiBzZXJ2ZXJEYXRhLnRuYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgIHVybDogc2VydmVyRGF0YS51cmwsXHJcbiAgICAgICAgICAgICAgICAgICAgc21hbGxTcHJpdGU6IG51bGxcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB2YXIgbG9hZEltYWdlQ2FsbEJhY2sgPSBmdW5jdGlvbiAoZGF0YSwgaW5kZXgsIGVycm9yLCBpbWFnZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghIEZpcmUuRW5naW5lLmlzUGxheWluZykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YS5zbWFsbFNwcml0ZSA9IG5ldyBGaXJlLlNwcml0ZShpbWFnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGluZGV4LCBkYXRhLCBpbWFnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMsIGRhdGEsIGluZGV4KTtcclxuICAgICAgICAgICAgICAgIC8vIOS4i+i9veWbvueJh1xyXG4gICAgICAgICAgICAgICAgc2VsZi5sb2FkSW1hZ2UoZGF0YS51cmwsIGxvYWRJbWFnZUNhbGxCYWNrKTtcclxuICAgICAgICAgICAgICAgIGluZGV4Kys7XHJcbiAgICAgICAgICAgICAgICAvLyDkv53lrZjkuoznuqfoj5zljZXmlbDmja5cclxuICAgICAgICAgICAgICAgIHNlbGYuc2Vjb25kYXJ5TWVudURhdGFTaGVldHMucHVzaChkYXRhKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgLy8g6aKE5Yqg6L295LiJ57qn6I+c5Y2VIOWNleWTgeWutuWFt+aVsOaNrlxyXG4gICAgcHJlbG9hZFRocmVlTWVudURhdGE6IGZ1bmN0aW9uIChpZCwgcGFnZSwgZWFjaCwgY2FsbGJhY2spIHtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgaWYgKCEgc2VsZi50aHJlZU1lbnVEYXRhU2hlZXRzW2lkXSkge1xyXG4gICAgICAgICAgICBzZWxmLnRocmVlTWVudURhdGFTaGVldHNbaWRdID0gW107XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghIHNlbGYudGhyZWVNZW51RGF0YVRvdGFsU2hlZXRzW2lkXSl7XHJcbiAgICAgICAgICAgIHNlbGYudGhyZWVNZW51RGF0YVRvdGFsU2hlZXRzW2lkXSA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBzZW5kRGF0YSA9IHtcclxuICAgICAgICAgICAgdGlkOiBpZCxcclxuICAgICAgICAgICAgcGFnZTogcGFnZSxcclxuICAgICAgICAgICAgZWFjaDogZWFjaFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgc2VsZi5zbmV0V29ya01nci5SZXF1ZXN0U2luZ2xlSXRlbXMoc2VuZERhdGEsIGZ1bmN0aW9uIChhbGxEYXRhKSB7XHJcbiAgICAgICAgICAgIGlmICghIEZpcmUuRW5naW5lLmlzUGxheWluZykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciB0b3RhbCA9IHBhcnNlSW50KGFsbERhdGEudG90YWwpO1xyXG4gICAgICAgICAgICBzZWxmLnRocmVlTWVudURhdGFUb3RhbFNoZWV0c1tpZF0gPSB0b3RhbDtcclxuICAgICAgICAgICAgdmFyIGRhdGFTaGVldHMgPSBzZWxmLnRocmVlTWVudURhdGFTaGVldHNbaWRdO1xyXG4gICAgICAgICAgICB2YXIgaW5kZXggPSAwLCBsb2FkSW1hZ2VDb3VudCA9IDA7XHJcbiAgICAgICAgICAgIGFsbERhdGEubGlzdC5mb3JFYWNoKGZ1bmN0aW9uIChkYXRhU2hlZXRzLCBkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbWVudURhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogZGF0YS5wcm9kX25hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgc3VpdF9pZDogZGF0YS5wcm9kX2lkLFxyXG4gICAgICAgICAgICAgICAgICAgIHByaWNlOiBkYXRhLnByb2RfcHJpY2UsXHJcbiAgICAgICAgICAgICAgICAgICAgYmlnSW1hZ2VVcmw6IGRhdGEucHJvZF9zb3VjZV91cmwsXHJcbiAgICAgICAgICAgICAgICAgICAgc2FtbGxJbWFnZVVybDogZGF0YS5wcm9kX2ltYWdlX3VybCxcclxuICAgICAgICAgICAgICAgICAgICBzbWFsbFNwcml0ZTogbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICBiaWdTcHJpdGU6IG51bGwsXHJcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQ6IG51bGxcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAvL1xyXG4gICAgICAgICAgICAgICAgdmFyIGxvYWRJbWFnZUNhbGxCYWNrID0gZnVuY3Rpb24gKG1lbnVEYXRhLCBpbmRleCwgZXJyb3IsIGltYWdlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFGaXJlLkVuZ2luZS5pc1BsYXlpbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbG9hZEltYWdlQ291bnQrKztcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGxvYWRJbWFnZUNvdW50IDwgMikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5sb2FkSW1hZ2UobWVudURhdGEuc2FtbGxJbWFnZVVybCwgbG9hZEltYWdlQ2FsbEJhY2spO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgLy9cclxuICAgICAgICAgICAgICAgICAgICBtZW51RGF0YS5zbWFsbFNwcml0ZSA9IG5ldyBGaXJlLlNwcml0ZShpbWFnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGlkLCBpbmRleCwgcGFnZSwgbWVudURhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBsb2FkSW1hZ2VDb3VudCA9IDA7XHJcbiAgICAgICAgICAgICAgICB9LmJpbmQodGhpcywgbWVudURhdGEsIGluZGV4KTtcclxuICAgICAgICAgICAgICAgIC8vIOWKoOi9veWwj+WbvlxyXG4gICAgICAgICAgICAgICAgc2VsZi5sb2FkSW1hZ2UoZGF0YS5wcm9kX2ltYWdlX3VybCwgbG9hZEltYWdlQ2FsbEJhY2spO1xyXG4gICAgICAgICAgICAgICAgLy9cclxuICAgICAgICAgICAgICAgIGluZGV4Kys7XHJcbiAgICAgICAgICAgICAgICAvL1xyXG4gICAgICAgICAgICAgICAgZGF0YVNoZWV0cy5wdXNoKG1lbnVEYXRhKTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMsIGRhdGFTaGVldHMpKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSk7XHJcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnODExMzNiNlB2TkdWSzZ2U21wVVhlNysnLCAnU0Vycm9yUHJvbXB0V2luZG93Jyk7XG4vLyBzY3JpcHRcXHNpbmdsZVxcU0Vycm9yUHJvbXB0V2luZG93LmpzXG5cbnZhciBDb21wID0gRmlyZS5DbGFzcyh7XHJcbiAgICAvLyDnu6fmib9cclxuICAgIGV4dGVuZHM6IEZpcmUuQ29tcG9uZW50LFxyXG4gICAgLy8g5p6E6YCg5Ye95pWwXHJcbiAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMub25DYWxsRXZlbnQgPSBudWxsO1xyXG4gICAgfSxcclxuICAgIC8vIOWxnuaAp1xyXG4gICAgcHJvcGVydGllczoge1xyXG4gICAgICAgIGNvbnRlbnQ6e1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlRleHRcclxuICAgICAgICB9LFxyXG4gICAgICAgIGJ0bl9Db25maXJtOntcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5VSUJ1dHRvblxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g5aaC5p6cSW5wdXRmaWVsZOWtmOWcqOeahOivneWwsemcgOimgeaKiuS7luWFiOWFs+mXrVxyXG4gICAgICAgIC8vIOWboOS4uuaXoOazleaOp+WItuWug+eahOWxgue6p1xyXG4gICAgICAgIGlucHV0X1NhdmU6IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5FbnRpdHlcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8g6K6+572u6LCD55So5Ye95pWwXHJcbiAgICBzZXRDYWxsRXZlbnQ6IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgIHRoaXMub25DYWxsRXZlbnQgPSBldmVudDtcclxuICAgIH0sXHJcbiAgICAvLyDnoa7lrprkuovku7ZcclxuICAgIF9vbkNvbmZpcm1FdmVudDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuZW50aXR5LmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgICAgIGlmICh0aGlzLm9uQ2FsbEV2ZW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMub25DYWxsRXZlbnQoKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8g5YWz6Zet5pe26Kem5Y+R55qE5LqL5Lu2XHJcbiAgICBvbkRpc2FibGU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAoISB0aGlzLmlucHV0X1NhdmUuYWN0aXZlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5wdXRfU2F2ZS5hY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvLyDmiZPlvIDop6blj5HnmoTkuovku7ZcclxuICAgIG9uRW5hYmxlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuaW5wdXRfU2F2ZS5hY3RpdmUpIHtcclxuICAgICAgICAgICAgdGhpcy5pbnB1dF9TYXZlLmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvL1xyXG4gICAgb25Mb2FkOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5idG5fQ29uZmlybS5vbkNsaWNrID0gdGhpcy5fb25Db25maXJtRXZlbnQuYmluZCh0aGlzKTtcclxuICAgIH1cclxufSk7XHJcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnYTFmOGFWSWhQaExmNlM2VmhnMFB4Z2MnLCAnU0Z1cm5pdHVyZScpO1xuLy8gc2NyaXB0XFxzaW5nbGVcXFNGdXJuaXR1cmUuanNcblxudmFyIFNGdXJuaXR1cmUgPSBGaXJlLkNsYXNzKHtcclxuICAgIC8vIOe7p+aJv1xyXG4gICAgZXh0ZW5kczogRmlyZS5Db21wb25lbnQsXHJcbiAgICAvLyDmnoTpgKDlh73mlbBcclxuICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5fcmVuZGVyZXIgPSBudWxsO1xyXG4gICAgfSxcclxuICAgIC8vIOWxnuaAp1xyXG4gICAgcHJvcGVydGllczoge1xyXG4gICAgICAgIC8vIOWQjeensFxyXG4gICAgICAgIHROYW1lOiAnJyxcclxuICAgICAgICAvLyBJRFxyXG4gICAgICAgIHN1aXRfaWQ6IDAsXHJcbiAgICAgICAgLy8g57G75Z6LXHJcbiAgICAgICAgcHJvcFR5cGU6IDAsXHJcbiAgICAgICAgLy8g5piv5ZCm5Y+v5Lul5ouW5YqoXHJcbiAgICAgICAgaGFzRHJhZzogZmFsc2UsXHJcbiAgICAgICAgLy8g5Zu+54mH55qEdXJsXHJcbiAgICAgICAgaW1hZ2VVcmw6ICcnLFxyXG4gICAgICAgIC8vIOi9veWFpeaXtueahOWbvueJh1xyXG4gICAgICAgIGRlZmF1bHRTcHJpdGU6IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5TcHJpdGVcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8g6K6+572u5Zu+54mHXHJcbiAgICBzZXRTcHJpdGU6IGZ1bmN0aW9uIChuZXdTcHJpdGUpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX3JlbmRlcmVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlbmRlcmVyID0gdGhpcy5lbnRpdHkuZ2V0Q29tcG9uZW50KEZpcmUuU3ByaXRlUmVuZGVyZXIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9yZW5kZXJlci5zcHJpdGUgPSBuZXdTcHJpdGU7XHJcbiAgICAgICAgdGhpcy5fcmVuZGVyZXIuc3ByaXRlLnBpeGVsTGV2ZWxIaXRUZXN0ID0gdHJ1ZTtcclxuICAgIH1cclxufSk7XHJcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnMWM5YjFlWUpvdE80NVhLdXlzYkFma3EnLCAnU0xvYWRpbmdUaXBzJyk7XG4vLyBzY3JpcHRcXHNpbmdsZVxcU0xvYWRpbmdUaXBzLmpzXG5cbnZhciBTTG9hZGluZ1RpcHMgPSBGaXJlLkNsYXNzKHtcclxuICAgIC8vIOe7p+aJv1xyXG4gICAgZXh0ZW5kczogRmlyZS5Db21wb25lbnQsXHJcbiAgICAvLyDmnoTpgKDlh73mlbBcclxuICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgfSxcclxuICAgIC8vIOWxnuaAp1xyXG4gICAgcHJvcGVydGllczoge1xyXG4gICAgICAgIGNvbnRlbnQ6e1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiBGaXJlLkJpdG1hcFRleHRcclxuICAgICAgICB9LFxyXG4gICAgICAgIGFuaW06IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5BbmltYXRpb25cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8g5omT5byA56qX5Y+jXHJcbiAgICBvcGVuVGlwczogZnVuY3Rpb24gKHRleHQpIHtcclxuICAgICAgICB2YXIgc3RhdGUgPSB0aGlzLmFuaW0ucGxheSgnbG9hZGluZycpO1xyXG4gICAgICAgIHN0YXRlLndyYXBNb2RlID0gRmlyZS5XcmFwTW9kZS5Mb29wO1xyXG4gICAgICAgIHN0YXRlLnJlcGVhdENvdW50ID0gSW5maW5pdHk7XHJcbiAgICAgICAgdGhpcy5lbnRpdHkuYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICBpZiAodGV4dCkge1xyXG4gICAgICAgICAgICB0aGlzLmNvbnRlbnQudGV4dCA9IHRleHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmNvbnRlbnQudGV4dCA9ICfliqDovb3kuK3or7fnqI3lkI4uLi4nO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgc2l6ZSA9IHRoaXMuY29udGVudC5nZXRXb3JsZFNpemUoKTtcclxuICAgICAgICB0aGlzLmFuaW0uZW50aXR5LnRyYW5zZm9ybS53b3JsZFBvc2l0aW9uID0gbmV3IEZpcmUuVmVjMihzaXplLnggLyAyICsgNTAsIDApO1xyXG4gICAgfSxcclxuICAgIC8vIOWFs+mXreeql+WPo1xyXG4gICAgY2xvc2VUaXBzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5hbmltLnN0b3AoJ2xvYWRpbmcnKTtcclxuICAgICAgICB0aGlzLmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcclxuICAgIH1cclxufSk7XHJcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnZDg0NDVFeUVObEQ0cVV1UWMzZlVUbzInLCAnU01haW5NZW51TWdyJyk7XG4vLyBzY3JpcHRcXHNpbmdsZVxcU01haW5NZW51TWdyLmpzXG5cbi8vIOS4u+iPnOWNlSDvvIjmiJHopoHoo4Xmia4g5L+d5a2Y6KOF5omuIOaIkeeahOijheaJru+8iVxyXG52YXIgU01haW5NZW51TWdyID0gRmlyZS5DbGFzcyh7XHJcbiAgICAvLyDnu6fmib9cclxuICAgIGV4dGVuZHM6IEZpcmUuQ29tcG9uZW50LFxyXG4gICAgLy8g5p6E6YCg5Ye95pWwXHJcbiAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24gKCkge1xyXG4gICAgfSxcclxuICAgIC8vIOWxnuaAp1xyXG4gICAgcHJvcGVydGllczoge1xyXG4gICAgICAgIC8vIFVJ5LiO5bGP5bmV55qE6Ze06LedXHJcbiAgICAgICAgbWFyZ2luOiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IEZpcmUudjIoNzIsIDE1MClcclxuICAgICAgICB9LFxyXG4gICAgICAgIGltYWdlTWFyZ2luOiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IEZpcmUudjIoMTIwMCwgOTAwKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc3BhY2luZzoge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiAxNDBcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8g5piv5ZCm6KOF5omu6L+HXHJcbiAgICBfaGFzRHJlc3NVcDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBoYXNEcmVzc1VwID0gZmFsc2U7XHJcbiAgICAgICAgdmFyIGJnQ29tcCA9IHRoaXMuc2RhdGFCYXNlLmJnUmVuZGVyLmdldENvbXBvbmVudCgnU0Z1cm5pdHVyZScpO1xyXG4gICAgICAgIGlmICh0aGlzLnNkYXRhQmFzZS5iZ1JlbmRlci5zcHJpdGUgIT09IGJnQ29tcC5kZWZhdWx0U3ByaXRlKSB7XHJcbiAgICAgICAgICAgIGhhc0RyZXNzVXAgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgR2RDb21wID0gdGhpcy5zZGF0YUJhc2UuZ3JvdW5kUmVuZGVyLmdldENvbXBvbmVudCgnU0Z1cm5pdHVyZScpO1xyXG4gICAgICAgIGlmICh0aGlzLnNkYXRhQmFzZS5ncm91bmRSZW5kZXIuc3ByaXRlICE9PSBHZENvbXAuZGVmYXVsdFNwcml0ZSkge1xyXG4gICAgICAgICAgICBoYXNEcmVzc1VwID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGNoaWxkcmVuID0gdGhpcy5zZGF0YUJhc2Uucm9vbS5nZXRDaGlsZHJlbigpO1xyXG4gICAgICAgIGlmIChjaGlsZHJlbi5sZW5ndGggPiAyKSB7XHJcbiAgICAgICAgICAgIGhhc0RyZXNzVXAgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gaGFzRHJlc3NVcDtcclxuICAgIH0sXHJcbiAgICAvLyDmuIXnqbrlnLrmma9cclxuICAgIHJlc2V0U2NyZWVuOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIGNoaWxkcmVuID0gdGhpcy5zZGF0YUJhc2Uucm9vbS5nZXRDaGlsZHJlbigpO1xyXG4gICAgICAgIGlmIChjaGlsZHJlbi5sZW5ndGggPD0gMil7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDI7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBjaGlsZHJlbltpXS5kZXN0cm95KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIOaIkeimgeijheaJruS6i+S7tlxyXG4gICAgX29uRG9EcmVzc0V2ZW50OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2hhc0RyZXNzVXAoKSkge1xyXG4gICAgICAgICAgICB0aGlzLnNkYXRhQmFzZS5zY29udHJvbE1nci5yZXNldCgpO1xyXG4gICAgICAgICAgICB0aGlzLnNkYXRhQmFzZS5zdGhyZWVNZW51TWdyLmNsb3NlTWVudSgpO1xyXG4gICAgICAgICAgICB0aGlzLnNkYXRhQmFzZS5zdGlwc1dpbmRvdy5vcGVuV2luZG93KCfmmK/lkKbmuIXnqbrlnLrmma8uLicsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXRTY3JlZW4oKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVzZXRTY3JlZW4oKTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zZGF0YUJhc2Uuc3NlY29uZGFyeU1lbnVNZ3Iub3BlblNlY29uZGFyeU1lbnUoKTtcclxuICAgICAgICB0aGlzLnNkYXRhQmFzZS5jaGFyYWN0ZXJzLmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcclxuICAgIH0sXHJcbiAgICAvLyDkv53lrZjoo4Xmia7kuovku7ZcclxuICAgIF9vblNhdmVEcmVzc0V2ZW50OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5zZGF0YUJhc2UuY2hhcmFjdGVycy5lbnRpdHkuYWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5zZGF0YUJhc2Uuc2NvbnRyb2xNZ3IucmVzZXQoKTtcclxuICAgICAgICB0aGlzLnNkYXRhQmFzZS5zdGhyZWVNZW51TWdyLmNsb3NlTWVudSgpO1xyXG4gICAgICAgIHRoaXMuc2RhdGFCYXNlLnNzYXZlUm9vbVdpbmRvdy5vcGVuV2luZG93KCk7XHJcbiAgICB9LFxyXG4gICAgLy8g5oiR55qE6KOF5omu5LqL5Lu2XHJcbiAgICBfb25NeURyZXNzRXZlbnQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLnNkYXRhQmFzZS5jaGFyYWN0ZXJzLmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnNkYXRhQmFzZS5zY29udHJvbE1nci5yZXNldCgpO1xyXG4gICAgICAgIHRoaXMuc2RhdGFCYXNlLnN0aHJlZU1lbnVNZ3IuY2xvc2VNZW51KCk7XHJcbiAgICAgICAgdGhpcy5zZGF0YUJhc2Uuc215RHJlc3NVcFdpbmRvdy5vcGVuV2luZG93KCk7XHJcbiAgICB9LFxyXG4gICAgLy8g6L+U5Zue5a6k5aSWXHJcbiAgICBfb25Hb1RvT3V0RG9vckV2ZW50OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgRmlyZS5FbmdpbmUubG9hZFNjZW5lKCdsYXVuY2gnKTtcclxuICAgIH0sXHJcbiAgICAvLyDliJ3lp4vljJboj5zljZVcclxuICAgIF9pbml0TWVudTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICB2YXIgY2hpbGRyZW4gPSB0aGlzLmVudGl0eS5nZXRDaGlsZHJlbigpO1xyXG4gICAgICAgIHNlbGYuX21lbnVMaXN0ID0gW107XHJcbiAgICAgICAgZm9yKHZhciBpID0gMCwgbGVuID0gY2hpbGRyZW4ubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcclxuICAgICAgICAgICAgdmFyIGVudCA9IGNoaWxkcmVuW2ldO1xyXG4gICAgICAgICAgICB2YXIgYnRuID0gZW50LmdldENvbXBvbmVudChGaXJlLlVJQnV0dG9uKTtcclxuICAgICAgICAgICAgaWYgKCEgYnRuKSB7IGNvbnRpbnVlOyB9XHJcbiAgICAgICAgICAgIC8vIOe7keWumuaMiemSruS6i+S7tlxyXG4gICAgICAgICAgICBpZiAoZW50Lm5hbWUgPT09IFwiMVwiKSB7XHJcbiAgICAgICAgICAgICAgICBidG4ub25DbGljayA9IHNlbGYuX29uRG9EcmVzc0V2ZW50LmJpbmQoc2VsZik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoZW50Lm5hbWUgPT09IFwiMlwiKSB7XHJcbiAgICAgICAgICAgICAgICBidG4ub25DbGljayA9IHNlbGYuX29uU2F2ZURyZXNzRXZlbnQuYmluZChzZWxmKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChlbnQubmFtZSA9PT0gXCIzXCIpIHtcclxuICAgICAgICAgICAgICAgIGJ0bi5vbkNsaWNrID0gc2VsZi5fb25NeURyZXNzRXZlbnQuYmluZChzZWxmKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChlbnQubmFtZSA9PT0gXCI0XCIpIHtcclxuICAgICAgICAgICAgICAgIGJ0bi5vbkNsaWNrID0gc2VsZi5fb25Hb1RvT3V0RG9vckV2ZW50LmJpbmQoc2VsZik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgX2luaXRTY3JlZW46IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLnNkYXRhQmFzZS5wcmVsb2FkSW5pdFNjcmVlbkRhdGEoKTtcclxuICAgIH0sXHJcbiAgICAvL1xyXG4gICAgb25Mb2FkOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgLy8g6aG16Z2i5aSn5bCP5Y+R55Sf5Y+Y5YyW55qE5pe25YCZ5Lya6LCD55So6L+Z5Liq5LqL5Lu2XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIEZpcmUuU2NyZWVuLm9uKCdyZXNpemUnLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB3aWR0aCA9IHNlbGYuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoO1xyXG4gICAgICAgICAgICB2YXIgaGVpZ2h0ID0gc2VsZi5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0O1xyXG4gICAgICAgICAgICBpZiAod2lkdGggPCBoZWlnaHQpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2RhdGFCYXNlLnN0aXBzV2luZG93Lm9wZW5XaW5kb3coJ+aoquWxj+S9k+mqjOaViOaenOS8muabtOWlvS4uJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNkYXRhQmFzZS5zdGlwc1dpbmRvdy5jbG9zZVdpbmRvdygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgIH0sXHJcblxyXG4gICAgc3RhcnQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL1NEYXRhQmFzZScpO1xyXG4gICAgICAgIHRoaXMuc2RhdGFCYXNlID0gZW50LmdldENvbXBvbmVudCgnU0RhdGFCYXNlJyk7XHJcbiAgICAgICAgLy9cclxuICAgICAgICB2YXIgZG9jdW1lbnRFbGVtZW50ID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xyXG4gICAgICAgIHZhciB3aWR0aCA9IGRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aDtcclxuICAgICAgICB2YXIgaGVpZ2h0ID0gZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodDtcclxuICAgICAgICB0aGlzLmRvY3VtZW50RWxlbWVudCA9IGRvY3VtZW50RWxlbWVudDtcclxuICAgICAgICBpZiAod2lkdGggPCBoZWlnaHQpIHtcclxuICAgICAgICAgICAgdGhpcy5zZGF0YUJhc2Uuc3RpcHNXaW5kb3cub3BlbldpbmRvdygn5qiq5bGP5L2T6aqM5pWI5p6c5Lya5pu05aW9Li4nKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8g5Yid5aeL5YyW6I+c5Y2VXHJcbiAgICAgICAgdGhpcy5faW5pdE1lbnUoKTtcclxuICAgICAgICAvLyDliJ3lp4vljJblnLrmma9cclxuICAgICAgICB0aGlzLl9pbml0U2NyZWVuKCk7XHJcblxyXG4gICAgICAgIEZpcmUuRW5naW5lLnByZWxvYWRTY2VuZSgnbGF1bmNoJyk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8vIOWIt+aWsFxyXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgLy8g5Yy56YWNVUnliIbovqjnjodcclxuICAgICAgICB2YXIgY2FtZXJhID0gRmlyZS5DYW1lcmEubWFpbjtcclxuICAgICAgICB2YXIgc2NyZWVuU2l6ZSA9IEZpcmUuU2NyZWVuLnNpemUubXVsKGNhbWVyYS5zaXplIC8gRmlyZS5TY3JlZW4uaGVpZ2h0KTtcclxuICAgICAgICB2YXIgbmV3UG9zID0gRmlyZS52Migtc2NyZWVuU2l6ZS54IC8gMiArIHRoaXMubWFyZ2luLngsIHNjcmVlblNpemUueSAvIDIgLSB0aGlzLm1hcmdpbi55KTtcclxuICAgICAgICB0aGlzLmVudGl0eS50cmFuc2Zvcm0ucG9zaXRpb24gPSBuZXdQb3M7XHJcblxyXG4gICAgICAgIC8vXHJcbiAgICAgICAgdmFyIGNhbWVyYSA9IEZpcmUuQ2FtZXJhLm1haW47XHJcbiAgICAgICAgdmFyIGJnV29ybGRCb3VuZHMgPSB0aGlzLnNkYXRhQmFzZS5iZ1JlbmRlci5nZXRXb3JsZEJvdW5kcygpO1xyXG4gICAgICAgIHZhciBiZ0xlZnRUb3BXb3JsZFBvcyA9IG5ldyBGaXJlLlZlYzIoYmdXb3JsZEJvdW5kcy54TWluICsgdGhpcy5pbWFnZU1hcmdpbi54LCBiZ1dvcmxkQm91bmRzLnlNaW4gKyB0aGlzLmltYWdlTWFyZ2luLnkpO1xyXG4gICAgICAgIHZhciBiZ2xlZnRUb3AgPSBjYW1lcmEud29ybGRUb1NjcmVlbihiZ0xlZnRUb3BXb3JsZFBvcyk7XHJcbiAgICAgICAgdmFyIHNjcmVlblBvcyA9IG5ldyBGaXJlLlZlYzIoYmdsZWZ0VG9wLngsIGJnbGVmdFRvcC55KTtcclxuICAgICAgICB2YXIgd29ybGRQb3MgPSBjYW1lcmEuc2NyZWVuVG9Xb3JsZChzY3JlZW5Qb3MpO1xyXG4gICAgICAgIHRoaXMuc2RhdGFCYXNlLmNoYXJhY3RlcnMuZW50aXR5LnRyYW5zZm9ybS53b3JsZFBvc2l0aW9uID0gd29ybGRQb3M7XHJcblxyXG4gICAgfVxyXG59KTtcclxuXG5GaXJlLl9SRnBvcCgpOyIsIkZpcmUuX1JGcHVzaChtb2R1bGUsICc5YzhjMmRKaExwQ1diVVAzSHcwa0N6bicsICdTTXlEcmVzc1VwRGF0YScpO1xuLy8gc2NyaXB0XFxzaW5nbGVcXFNNeURyZXNzVXBEYXRhLmpzXG5cbnZhciBTTXlEcmVzc1VwRGF0YSA9IEZpcmUuQ2xhc3Moe1xyXG4gICAgLy8g57un5om/XHJcbiAgICBleHRlbmRzOiBGaXJlLkNvbXBvbmVudCxcclxuICAgIC8vIOaehOmAoOWHveaVsFxyXG4gICAgY29udHJ1Y3RvcjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIC8vIElEXHJcbiAgICAgICAgdGhpcy5zdWl0X2lkID0gLTE7XHJcbiAgICAgICAgLy8g5ZCN56ewXHJcbiAgICAgICAgdGhpcy5teURyZXNzVXBOYW1lID0gJyc7XHJcbiAgICB9LFxyXG4gICAgLy8g5bGe5oCnXHJcbiAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgLy8g57yW5Y+3XHJcbiAgICAgICAgc2VyaWFsTnVtYmVyOiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVGV4dFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g5ZCN56ewXHJcbiAgICAgICAgcm9vbU5hbWU6IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5UZXh0XHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDnsbvlnotcclxuICAgICAgICByb29tVHlwZTogMCxcclxuICAgICAgICAvLyDnsbvlnovmloflrZdcclxuICAgICAgICByb29tVHlwZVRleHQ6IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5UZXh0XHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDmiZPlvIDoo4Xmia5cclxuICAgICAgICBidG5fb3BlblJvb206IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5VSUJ1dHRvblxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g5Yig6Zmk6KOF5omuXHJcbiAgICAgICAgYnRuX2RlbGV0ZVJvb206IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5VSUJ1dHRvblxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvLyDph43nva7lrrblhbdcclxuICAgIHJlc2V0TWVudTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuc2VyaWFsTnVtYmVyLnRleHQgPSAnJztcclxuICAgICAgICB0aGlzLnJvb21OYW1lLnRleHQgPSAnJztcclxuICAgICAgICB0aGlzLnJvb21UeXBlID0gMDtcclxuICAgICAgICB0aGlzLnJvb21UeXBlVGV4dC50ZXh0ID0gJyc7XHJcbiAgICAgICAgdGhpcy5idG5fb3BlblJvb20ub25DbGljayA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5idG5fZGVsZXRlUm9vbS5vbkNsaWNrID0gbnVsbDtcclxuICAgICAgICB0aGlzLmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcclxuICAgIH0sXHJcbiAgICAvLyDliJ3lp4vljJZcclxuICAgIHJlZnJlc2g6IGZ1bmN0aW9uIChkYXRhLCBvcGVuUm9vbUV2ZW50LCBkZWxldGVSb29tRXZlbnQpIHtcclxuICAgICAgICB0aGlzLnN1aXRfaWQgPSBkYXRhLmlkO1xyXG4gICAgICAgIHRoaXMubXlEcmVzc1VwTmFtZSA9IGRhdGEubmFtZTtcclxuICAgICAgICB0aGlzLmVudGl0eS5uYW1lID0gdGhpcy5zdWl0X2lkO1xyXG4gICAgICAgIHRoaXMuc2VyaWFsTnVtYmVyLnRleHQgPSB0aGlzLnN1aXRfaWQ7XHJcbiAgICAgICAgdGhpcy5yb29tTmFtZS50ZXh0ID0gdGhpcy5teURyZXNzVXBOYW1lO1xyXG4gICAgICAgIHRoaXMucm9vbVR5cGUgPSBkYXRhLnR5cGU7XHJcbiAgICAgICAgdGhpcy5yb29tVHlwZVRleHQudGV4dCA9IGRhdGEudHlwZU5hbWU7XHJcbiAgICAgICAgaWYgKG9wZW5Sb29tRXZlbnQpIHtcclxuICAgICAgICAgICAgdGhpcy5idG5fb3BlblJvb20ub25DbGljayA9IG9wZW5Sb29tRXZlbnQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChkZWxldGVSb29tRXZlbnQpIHtcclxuICAgICAgICAgICAgdGhpcy5idG5fZGVsZXRlUm9vbS5vbkNsaWNrID0gZGVsZXRlUm9vbUV2ZW50O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSk7XHJcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnNzVjMThzTGlUdExKWkxvNXlZM2k1YnInLCAnU015RHJlc3NVcFdpbmRvdycpO1xuLy8gc2NyaXB0XFxzaW5nbGVcXFNNeURyZXNzVXBXaW5kb3cuanNcblxuLy8g6KOF5omu5YiX6KGo56qX5Y+jXHJcbnZhciBNeURyZXNzVXBXaW5kb3cgPSBGaXJlLkNsYXNzKHtcclxuICAgIC8vIOe7p+aJv1xyXG4gICAgZXh0ZW5kczogRmlyZS5Db21wb25lbnQsXHJcbiAgICAvLyDmnoTpgKDlh73mlbBcclxuICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5fc2hvd051bSA9IDY7XHJcbiAgICAgICAgdGhpcy5fY3VyUGFnZSA9IDE7XHJcbiAgICAgICAgdGhpcy5fbWF4UGFnZSA9IDA7XHJcbiAgICAgICAgdGhpcy5fbXlEcmVzc1VwVG90YWwgPSAwO1xyXG4gICAgICAgIC8vIOijheaJruWuueWZqOWIl+ihqFxyXG4gICAgICAgIHRoaXMuZHJlc3NVcEVudGl0eVNoZWV0cyA9IFtdO1xyXG4gICAgICAgIC8vIOi/m+WFpeijheaJrlxyXG4gICAgICAgIHRoaXMuYmluZFJlYWREYXRhRXZlbnQgPSB0aGlzLl9vblJlYWREYXRhRXZlbnQuYmluZCh0aGlzKTtcclxuICAgICAgICAvLyDliKDpmaToo4Xmia5cclxuICAgICAgICB0aGlzLmJpbmREZWxEYXRhRXZlbnQgPSB0aGlzLl9vbkRlbEhvbWVEYXRhRXZlbnQuYmluZCh0aGlzKTtcclxuICAgIH0sXHJcbiAgICAvLyDlsZ7mgKdcclxuICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAvLyDmoLnoioLngrlcclxuICAgICAgICByb290Tm9kZToge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiBGaXJlLkVudGl0eVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g5YWz6Zet56qX5Y+jXHJcbiAgICAgICAgYnRuX0Nsb3NlOiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVUlCdXR0b25cclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOS4i+S4gOmhtVxyXG4gICAgICAgIGJ0bl9OZXh0OiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVUlCdXR0b25cclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOS4iuS4gOmhtVxyXG4gICAgICAgIGJ0bl9QcmV2aW91czoge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlVJQnV0dG9uXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDliKDpmaTmiYDmnInmiL/pl7TmlbDmja5cclxuICAgICAgICBidG5fcmVtb3ZlQWxsOiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVUlCdXR0b25cclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOW9k+WJjeijheaJrueahOaIv+mXtFxyXG4gICAgICAgIGN1clNlbGVjdFJvb206IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5UZXh0XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIOWFs+mXreeql+WPo1xyXG4gICAgX29uQ2xvc2VXaW5kb3dFdmVudDogZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgICAgdGhpcy5jbG9zZVdpbmRvdygpO1xyXG4gICAgfSxcclxuICAgIC8vIOabtOaWsOaMiemSrueKtuaAgVxyXG4gICAgX3VwZGF0ZUJ1dHRvblN0YXRlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5idG5fUHJldmlvdXMuZW50aXR5LmFjdGl2ZSA9IHRoaXMuX2N1clBhZ2UgPiAxO1xyXG4gICAgICAgIHRoaXMuYnRuX05leHQuZW50aXR5LmFjdGl2ZSA9IHRoaXMuX2N1clBhZ2UgPCB0aGlzLl9tYXhQYWdlO1xyXG4gICAgfSxcclxuICAgIC8vIOS4iuS4gOmhtVxyXG4gICAgX29uUHJldmlvdXNQYWdlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5fY3VyUGFnZSAtPSAxO1xyXG4gICAgICAgIGlmICh0aGlzLl9jdXJQYWdlIDwgMSl7XHJcbiAgICAgICAgICAgIHRoaXMuX2N1clBhZ2UgPSAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9yZWZyZXNoTXlEcmVzc0xpc3QoKTtcclxuICAgIH0sXHJcbiAgICAvLyDkuIvkuIDpobVcclxuICAgIF9vbk5leHRQYWdlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5fY3VyUGFnZSArPSAxO1xyXG4gICAgICAgIGlmICh0aGlzLl9jdXJQYWdlID4gdGhpcy5fbWF4UGFnZSl7XHJcbiAgICAgICAgICAgIHRoaXMuX2N1clBhZ2UgPSB0aGlzLl9tYXhQYWdlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9yZWZyZXNoTXlEcmVzc0xpc3QoKTtcclxuICAgIH0sXHJcbiAgICAvLyDovb3lhaXljZXkuKrmiL/pl7TmlbDmja5cclxuICAgIF9vblJlYWREYXRhRXZlbnQ6IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgIHZhciBjb21wID0gZXZlbnQudGFyZ2V0LnBhcmVudC5nZXRDb21wb25lbnQoJ1NNeURyZXNzVXBEYXRhJyk7XHJcbiAgICAgICAgdGhpcy5sb2FkSG9tZURhdGEoY29tcC5zdWl0X2lkKTtcclxuICAgICAgICB0aGlzLmN1clNlbGVjdFJvb20udGV4dCA9ICflvZPliY3oo4Xmia46ICcgKyBjb21wLm15RHJlc3NVcE5hbWU7XHJcbiAgICB9LFxyXG4gICAgLy8g5Yig6Zmk5omA5pyJ5oi/6Ze05pWw5o2uXHJcbiAgICBfb25SZW1vdmVBbGxSb29tRGF0YUV2ZW50OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5zZGF0YUJhc2UubG9hZFJlZnJlc2hNeURyZXNzVXBEYXRhKC0xLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2N1clBhZ2UgPSAxO1xyXG4gICAgICAgICAgICB0aGlzLl9yZWZyZXNoTXlEcmVzc0xpc3QoKTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgfSxcclxuICAgIC8vIOWIoOmZpOaIv+mXtOaVsOaNrlxyXG4gICAgX29uRGVsSG9tZURhdGFFdmVudDogZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgICAgdmFyIGlkID0gcGFyc2VJbnQoZXZlbnQudGFyZ2V0LnBhcmVudC5uYW1lKTtcclxuICAgICAgICB0aGlzLnNkYXRhQmFzZS5sb2FkUmVmcmVzaE15RHJlc3NVcERhdGEoaWQsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5fcmVmcmVzaE15RHJlc3NMaXN0KCk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgIH0sXHJcbiAgICAvLyDovb3lhaXmiL/pl7TmlbDmja5cclxuICAgIGxvYWRIb21lRGF0YTogZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgdGhpcy5zZGF0YUJhc2Uuc21haW5NZW51TWdyLnJlc2V0U2NyZWVuKCk7XHJcbiAgICAgICAgdGhpcy5zZGF0YUJhc2Uuc25ldFdvcmtNZ3IuUmVxdWVzdEhvbWVEYXRhKHtzdWl0X2lkOiBpZH0sIGZ1bmN0aW9uIChob21lRGF0YSkge1xyXG4gICAgICAgICAgICBob21lRGF0YS5saXN0LmZvckVhY2goZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgIHZhciBlbnRpdHkgPSBudWxsLCBmdXJuaXR1cmUgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgdmFyIHByb3BzVHlwZSA9IHBhcnNlSW50KGRhdGEucHJvcHNUeXBlKTtcclxuICAgICAgICAgICAgICAgIGlmIChwcm9wc1R5cGUgPT09IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICBlbnRpdHkgPSB0aGlzLnNkYXRhQmFzZS5yb29tLmZpbmQoJ2JhY2tncm91bmQnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHByb3BzVHlwZSA9PT0gMikge1xyXG4gICAgICAgICAgICAgICAgICAgIGVudGl0eSA9IHRoaXMuc2RhdGFCYXNlLnJvb20uZmluZCgnZ3JvdW5kJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBlbnRpdHkgPSBGaXJlLmluc3RhbnRpYXRlKHRoaXMuc2RhdGFCYXNlLnRlbXBGdXJuaXR1cmUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGVudGl0eS5wYXJlbnQgPSB0aGlzLnNkYXRhQmFzZS5yb29tO1xyXG4gICAgICAgICAgICAgICAgICAgIGVudGl0eS5uYW1lID0gZGF0YS5wcm9wc05hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8g6K6+572u5Z2Q5qCHXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5ld1ZlYzIgPSBuZXcgRmlyZS5WZWMyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0ciA9IGRhdGEucG9zLnNwbGl0KFwiOlwiKTtcclxuICAgICAgICAgICAgICAgICAgICBuZXdWZWMyLnggPSBwYXJzZUZsb2F0KHN0clswXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgbmV3VmVjMi55ID0gcGFyc2VGbG9hdChzdHJbMV0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGVudGl0eS50cmFuc2Zvcm0ucG9zaXRpb24gPSBuZXdWZWMyO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIOiuvue9ruinkuW6plxyXG4gICAgICAgICAgICAgICAgICAgIGVudGl0eS50cmFuc2Zvcm0ucm90YXRpb24gPSBkYXRhLnJvdGF0aW9uO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIOiuvue9ruWkp+Wwj1xyXG4gICAgICAgICAgICAgICAgICAgIHN0ciA9IGRhdGEuc2NhbGUuc3BsaXQoXCI6XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIG5ld1ZlYzIueCA9IHBhcnNlRmxvYXQoc3RyWzBdKTtcclxuICAgICAgICAgICAgICAgICAgICBuZXdWZWMyLnkgPSBwYXJzZUZsb2F0KHN0clsxXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZW50aXR5LnRyYW5zZm9ybS5zY2FsZSA9IG5ld1ZlYzI7XHJcbiAgICAgICAgICAgICAgICAgICAgZnVybml0dXJlID0gZW50aXR5LmdldENvbXBvbmVudCgnU0Z1cm5pdHVyZScpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZnVybml0dXJlID0gZW50aXR5LmdldENvbXBvbmVudCgnU0Z1cm5pdHVyZScpO1xyXG4gICAgICAgICAgICAgICAgZnVybml0dXJlLnByb3BzVHlwZSA9IHByb3BzVHlwZTtcclxuICAgICAgICAgICAgICAgIGZ1cm5pdHVyZS5oYXNEcmFnID0gcHJvcHNUeXBlID4gMjtcclxuICAgICAgICAgICAgICAgIGZ1cm5pdHVyZS5zdWl0X2lkID0gZGF0YS5pZDtcclxuICAgICAgICAgICAgICAgIGZ1cm5pdHVyZS5iaWdJbWFnZVVybCA9IGRhdGEuaW1nVXJsO1xyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGEuaW1nVXJsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgRmlyZS5fSW1hZ2VMb2FkZXIoZGF0YS5pbWdVcmwsIGZ1bmN0aW9uIChmdXJuaXR1cmUsIGVycm9yLCBpbWFnZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyb3Ipe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBuZXdTcHJpdGUgPSBuZXcgRmlyZS5TcHJpdGUoaW1hZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmdXJuaXR1cmUuc2V0U3ByaXRlKG5ld1Nwcml0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMsIGZ1cm5pdHVyZSkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgICAgICAgICB0aGlzLmNsb3NlV2luZG93KCk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgIH0sXHJcbiAgICAvLyDph43nva7oo4Xmia7lrrnlmajliJfooahcclxuICAgIF9yZXNldE15RHJlc3NFbnRpdHlTaGVldHM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5kcmVzc1VwRW50aXR5U2hlZXRzLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgIHZhciBjb21wID0gdGhpcy5kcmVzc1VwRW50aXR5U2hlZXRzW2ldO1xyXG4gICAgICAgICAgICBjb21wLnJlc2V0TWVudSgpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvLyDliLfmlrDoo4Xmia7mlbDmja7liJfooahcclxuICAgIF9yZWZyZXNoTXlEcmVzc0xpc3Q6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgLy8g6YeN572u6KOF5omu5a655Zmo5YiX6KGoXHJcbiAgICAgICAgc2VsZi5fcmVzZXRNeURyZXNzRW50aXR5U2hlZXRzKCk7XHJcbiAgICAgICAgLy8g6I635Y+W5oC75pWw5bm25LiU6K6h566X5pyA5aSn6aG15pWwXHJcbiAgICAgICAgaWYgKHNlbGYuX215RHJlc3NVcFRvdGFsICE9PSBzZWxmLnNkYXRhQmFzZS5teURyZXNzVXBUb3RhbCkge1xyXG4gICAgICAgICAgICBzZWxmLl9teURyZXNzVXBUb3RhbCA9IHNlbGYuc2RhdGFCYXNlLm15RHJlc3NVcFRvdGFsO1xyXG4gICAgICAgICAgICBzZWxmLl9tYXhQYWdlID0gTWF0aC5yb3VuZChzZWxmLl9teURyZXNzVXBUb3RhbCAvIHNlbGYuX3Nob3dOdW0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyDmm7TmlrDmjInpkq7nirbmgIFcclxuICAgICAgICBzZWxmLl91cGRhdGVCdXR0b25TdGF0ZSgpO1xyXG4gICAgICAgIC8vIOWmguaenOaAu+aVsOetieS6jjDnmoTor53lsLHkuI3pnIDopoHmmL7npLrkuoZcclxuICAgICAgICBpZiAoc2VsZi5fbXlEcmVzc1VwVG90YWwgPT09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgc3RhcnROdW0gPSAoc2VsZi5fY3VyUGFnZSAtIDEpICogc2VsZi5fc2hvd051bTtcclxuICAgICAgICB2YXIgZW5kTnVtID0gc3RhcnROdW0gKyBzZWxmLl9zaG93TnVtO1xyXG4gICAgICAgIGlmIChlbmROdW0gPiBzZWxmLl9teURyZXNzVXBUb3RhbCkge1xyXG4gICAgICAgICAgICBlbmROdW0gPSBzZWxmLl9teURyZXNzVXBUb3RhbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGRhdGFTaGVldHMgPSBzZWxmLnNkYXRhQmFzZS5teURyZXNzVXBEYXRhU2hlZXRzO1xyXG4gICAgICAgIHZhciBpbmRleCA9IDA7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IHN0YXJ0TnVtOyBpIDwgZW5kTnVtOyArK2kpIHtcclxuICAgICAgICAgICAgdmFyIG1lbnUgPSBzZWxmLmRyZXNzVXBFbnRpdHlTaGVldHNbaW5kZXhdO1xyXG4gICAgICAgICAgICBtZW51LmVudGl0eS5hY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgICAgICBpbmRleCsrO1xyXG4gICAgICAgICAgICB2YXIgbXlEcmVzc1VwRGF0YSA9IGRhdGFTaGVldHNbaV07XHJcbiAgICAgICAgICAgIGlmICghbXlEcmVzc1VwRGF0YSkge1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbWVudS5yZWZyZXNoKG15RHJlc3NVcERhdGEsIHNlbGYuYmluZFJlYWREYXRhRXZlbnQsIHNlbGYuYmluZERlbERhdGFFdmVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIOWIpOaWreaYr+WQpumcgOimgemihOWKoOi9veS4i+S4gOmhtVxyXG4gICAgICAgIHZhciBsZW4gPSBkYXRhU2hlZXRzLmxlbmd0aDtcclxuICAgICAgICBpZiAobGVuID09PSBzZWxmLl9teURyZXNzVXBUb3RhbCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIOmihOWKoOi9veS4i+S4gOmhtVxyXG4gICAgICAgIHZhciBuZXh0UGFnZSA9IHNlbGYuX2N1clBhZ2UgKyAxO1xyXG4gICAgICAgIHNlbGYuc2RhdGFCYXNlLnByZWxvYWRNeURyZXNzVXBEYXRhKG5leHRQYWdlLCBzZWxmLl9zaG93TnVtKTtcclxuICAgIH0sXHJcbiAgICAvLyDliJvlu7roo4Xmia7liJfooajlrrnlmahcclxuICAgIF9jcmVhdGVNeURyZXNzVXBFbnRpdHlTaGVldHM6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX3Nob3dOdW07ICsraSkge1xyXG4gICAgICAgICAgICB2YXIgZW50ID0gRmlyZS5pbnN0YW50aWF0ZSh0aGlzLnNkYXRhQmFzZS50ZW1wTXlEcmVzc1VwRGF0YSk7XHJcbiAgICAgICAgICAgIGVudC5wYXJlbnQgPSB0aGlzLnJvb3ROb2RlO1xyXG4gICAgICAgICAgICBlbnQudHJhbnNmb3JtLnBvc2l0aW9uID0gbmV3IEZpcmUuVmVjMigwLCAtaSAqIDgwKTtcclxuICAgICAgICAgICAgdmFyIG1lbnUgPSBlbnQuZ2V0Q29tcG9uZW50KCdTTXlEcmVzc1VwRGF0YScpO1xyXG4gICAgICAgICAgICB2YXIgbXlEcmVzc1VwRGF0YSA9IHtcclxuICAgICAgICAgICAgICAgIGlkOiAtMSxcclxuICAgICAgICAgICAgICAgIG5hbWU6ICfovb3lhaXkuK0uJyxcclxuICAgICAgICAgICAgICAgIHR5cGU6IC0xLFxyXG4gICAgICAgICAgICAgICAgdHlwZU5hbWU6ICfovb3lhaXkuK0uJyxcclxuICAgICAgICAgICAgICAgIGlzRHJlc3M6IC0xXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIG1lbnUucmVmcmVzaChteURyZXNzVXBEYXRhLCB0aGlzLmJpbmRSZWFkRGF0YUV2ZW50LCB0aGlzLmJpbmREZWxEYXRhRXZlbnQpO1xyXG4gICAgICAgICAgICB0aGlzLmRyZXNzVXBFbnRpdHlTaGVldHMucHVzaChtZW51KTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8g5omT5byA56qX5Y+jXHJcbiAgICBvcGVuV2luZG93OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5lbnRpdHkuYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLnNkYXRhQmFzZS5jaGVja2luZ015RHJlc3NVcERhdGEoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLl9yZWZyZXNoTXlEcmVzc0xpc3QoKTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgfSxcclxuICAgIC8vIOWFs+mXreeql+WPo1xyXG4gICAgY2xvc2VXaW5kb3c6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLl9jdXJQYWdlID0gMTtcclxuICAgICAgICB0aGlzLl9tYXhQYWdlID0gMDtcclxuICAgICAgICB0aGlzLl9teURyZXNzVXBUb3RhbCA9IDA7XHJcbiAgICAgICAgdGhpcy5lbnRpdHkuYWN0aXZlID0gZmFsc2U7XHJcbiAgICB9LFxyXG4gICAgLy9cclxuICAgIHN0YXJ0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9TRGF0YUJhc2UnKTtcclxuICAgICAgICB0aGlzLnNkYXRhQmFzZSA9IGVudC5nZXRDb21wb25lbnQoJ1NEYXRhQmFzZScpO1xyXG4gICAgICAgIC8vXHJcbiAgICAgICAgdGhpcy5jdXJTZWxlY3RSb29tLnRleHQgPSAn5b2T5YmN6KOF5omuOiDml6AnO1xyXG4gICAgICAgIC8vIOe7keWumuS6i+S7tlxyXG4gICAgICAgIHRoaXMuYnRuX1ByZXZpb3VzLmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmJ0bl9OZXh0LmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmJ0bl9QcmV2aW91cy5vbkNsaWNrID0gdGhpcy5fb25QcmV2aW91c1BhZ2UuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLmJ0bl9OZXh0Lm9uQ2xpY2sgPSB0aGlzLl9vbk5leHRQYWdlLmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5idG5fQ2xvc2Uub25DbGljayA9IHRoaXMuX29uQ2xvc2VXaW5kb3dFdmVudC5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuYnRuX3JlbW92ZUFsbC5vbkNsaWNrID0gdGhpcy5fb25SZW1vdmVBbGxSb29tRGF0YUV2ZW50LmJpbmQodGhpcyk7XHJcbiAgICAgICAgLy8g6aKE5Yqg6L295oiR55qE6KOF5omu5pWw5o2uXHJcbiAgICAgICAgdGhpcy5zZGF0YUJhc2UucHJlbG9hZE15RHJlc3NVcERhdGEodGhpcy5fY3VyUGFnZSwgdGhpcy5fc2hvd051bSk7XHJcbiAgICAgICAgLy8g5Yib5bu66KOF5omu5YiX6KGo5a655ZmoXHJcbiAgICAgICAgdGhpcy5fY3JlYXRlTXlEcmVzc1VwRW50aXR5U2hlZXRzKCk7XHJcbiAgICB9XHJcbn0pO1xyXG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJ2YzYThkRTBlVUJQQXEvZ0d0dGwxdHRCJywgJ1NOZXR3b3JrTWdyJyk7XG4vLyBzY3JpcHRcXHNpbmdsZVxcU05ldHdvcmtNZ3IuanNcblxuLy8g6LSf6LSj5LiO5pyN5Yqh5Zmo6YCa5L+hXHJcbnZhciBTTmV0d29ya01nciA9IEZpcmUuQ2xhc3Moe1xyXG4gICAgLy8g57un5om/XHJcbiAgICBleHRlbmRzOiBGaXJlLkNvbXBvbmVudCxcclxuICAgIC8vIOaehOmAoOWHveaVsFxyXG4gICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAvLyDlvZPliY3or7fmsYLmlbDmja5cclxuICAgICAgICB0aGlzLl9wb3N0RGF0YSA9IHt9O1xyXG4gICAgICAgIHRoaXMud2luX0Vycm9yUHJvbXB0Q29tcCA9IG51bGw7XHJcbiAgICAgICAgLy8g55So5LqO5rWL6K+V55qEdG9rZW7mlbDmja5cclxuICAgICAgICB0aGlzLnRva2VuID0gbnVsbDtcclxuICAgIH0sXHJcbiAgICAvLyDlsZ7mgKdcclxuICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAvLyDmnKzlnLDmtYvor5VcclxuICAgICAgICBsb2NhbFRlc3Q6IGZhbHNlLFxyXG4gICAgICAgIC8vIOi/nuaOpeWksei0peaPkOekuueql+WPo1xyXG4gICAgICAgIHdpbl9FcnJvclByb21wdDoge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiBGaXJlLkVudGl0eVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvLyDlvIDlp4vml7ZcclxuICAgIG9uTG9hZDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBlbnQgPSBGaXJlLkVudGl0eS5maW5kKCcvU0RhdGFCYXNlJyk7XHJcbiAgICAgICAgdGhpcy5zZGF0YUJhc2UgPSBlbnQuZ2V0Q29tcG9uZW50KCdTRGF0YUJhc2UnKTtcclxuICAgICAgICAvLyDojrflj5bnlKjmiLfkv6Hmga9cclxuICAgICAgICB0aGlzLmdldFRvS2VuVmFsdWUoKTtcclxuICAgIH0sXHJcbiAgICAvLyDojrflj5bnlKjmiLfkv6Hmga9cclxuICAgIGdldFRvS2VuVmFsdWU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAodGhpcy5sb2NhbFRlc3QpIHtcclxuICAgICAgICAgICAgdGhpcy50b2tlbiA9ICdNVEF3TVRRNU1qWTROVjh4WVdFell6RmtObUUwWldJM1l6bGtObVF4WW1KbU5EYzROVE5tWmpoa00xOHhORE0yTXpJMk16YzJYM2RoY0EnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICB0aGlzLnRva2VuID0gdGhpcy5nZXRRdWVyeVN0cmluZygndG9rZW4nKTtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLnRva2VuKXtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiVG9LZW4gaXMgbnVsbFwiKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH0sXHJcbiAgICAvLyDor7fmsYLlpLHotKXlm57osINcclxuICAgIGVycm9yQ2FsbEJhY2s6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAoISB0aGlzLndpbl9FcnJvclByb21wdENvbXApIHtcclxuICAgICAgICAgICAgdmFyIGNvbXAgPSB0aGlzLndpbl9FcnJvclByb21wdC5nZXRDb21wb25lbnQoJ0Vycm9yUHJvbXB0V2luZG93Jyk7XHJcbiAgICAgICAgICAgIHRoaXMud2luX0Vycm9yUHJvbXB0Q29tcCA9IGNvbXA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICB0aGlzLndpbl9FcnJvclByb21wdENvbXAuc2V0Q2FsbEV2ZW50KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgc2VsZi5zZW5kRGF0YVRvU2VydmVyKHNlbGYuX3Bvc3REYXRhKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLndpbl9FcnJvclByb21wdC5hY3RpdmUgPSB0cnVlO1xyXG4gICAgfSxcclxuICAgIC8vIOeUqEpT6I635Y+W5Zyw5Z2A5qCP5Y+C5pWw55qE5pa55rOVXHJcbiAgICBnZXRRdWVyeVN0cmluZzogZnVuY3Rpb24obmFtZSkge1xyXG4gICAgICAgIHZhciByZWcgPSBuZXcgUmVnRXhwKFwiKF58JilcIiArIG5hbWUgKyBcIj0oW14mXSopKCZ8JClcIik7XHJcbiAgICAgICAgdmFyIHIgPSB3aW5kb3cubG9jYXRpb24uc2VhcmNoLnN1YnN0cigxKS5tYXRjaChyZWcpO1xyXG4gICAgICAgIGlmIChyICE9PSBudWxsKXtcclxuICAgICAgICAgICAgcmV0dXJuIHVuZXNjYXBlKHJbMl0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH0sXHJcbiAgICAvLyDojrflj5bmlbDmja5cclxuICAgIHNlbmREYXRhVG9TZXJ2ZXI6IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgaWYgKCEgdGhpcy5nZXRUb0tlblZhbHVlKCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvL3RoaXMuc2RhdGFCYXNlLnNsb2FkaW5nVGlwcy5vcGVuVGlwcygpO1xyXG4gICAgICAgIHRoaXMuX3Bvc3REYXRhID0gZGF0YTtcclxuICAgICAgICB0aGlzLmpRdWVyeUFqYXgoZGF0YS51cmwsIGRhdGEuc2VuZERhdGEsIGRhdGEuY2IsIGRhdGEuZXJyQ2IpO1xyXG4gICAgfSxcclxuICAgIC8vIOS4juacjeWKoeWZqOmAmuS/oVxyXG4gICAgalF1ZXJ5QWpheDogZnVuY3Rpb24gKHN0clVybCwgZGF0YSwgY2FsbEJhY2ssIGVycm9yQ2FsbEJhY2spIHtcclxuICAgICAgICB2YXIgcGFyYW1zID0gXCJcIjtcclxuICAgICAgICBpZiAodHlwZW9mKGRhdGEpID09PSBcIm9iamVjdFwiKSB7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGtleSBpbiBkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICBwYXJhbXMgKz0gKGtleSArIFwiPVwiICsgZGF0YVtrZXldICsgXCImXCIgICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcGFyYW1zICs9IFwiJnRva2VuPVwiICsgdGhpcy50b2tlbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHBhcmFtcyA9IGRhdGEgKyBcIiZ0b2tlbj1cIiArIHRoaXMudG9rZW47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICB2YXIgc2VuZCA9IHtcclxuICAgICAgICAgICAgdHlwZTogXCJQT1NUXCIsXHJcbiAgICAgICAgICAgIHVybDogc3RyVXJsICsgXCI/Jmpzb25jYWxsUFA9P1wiLFxyXG4gICAgICAgICAgICBkYXRhOiBwYXJhbXMsXHJcbiAgICAgICAgICAgIGRhdGFUeXBlOiAnanNvbnAnLFxyXG4gICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgLy9pZiAoc2VsZi5zZGF0YUJhc2UpIHtcclxuICAgICAgICAgICAgICAgIC8vICAgIHNlbGYuc2RhdGFCYXNlLnNsb2FkaW5nVGlwcy5jbG9zZVRpcHMoKTtcclxuICAgICAgICAgICAgICAgIC8vfVxyXG4gICAgICAgICAgICAgICAgaWYgKGNhbGxCYWNrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FsbEJhY2soZGF0YSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbiAoWE1MSHR0cFJlcXVlc3QsIHRleHRTdGF0dXMsIGVycm9yVGhyb3duKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLnNkYXRhQmFzZS5zbG9hZGluZ1RpcHMuY2xvc2VUaXBzKCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3JDYWxsQmFjaykge1xyXG4gICAgICAgICAgICAgICAgICAgIGVycm9yQ2FsbEJhY2soKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yVGhyb3duKTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFhNTEh0dHBSZXF1ZXN0KTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRleHRTdGF0dXMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICBqUXVlcnkuYWpheChzZW5kKTtcclxuICAgIH0sXHJcbiAgICAvLyDor7fmsYLliJ3lp4vljJbmiL/pl7TmlbDmja5cclxuICAgIFJlcXVlc3RJbml0SG9tZTogZnVuY3Rpb24gKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgdmFyIHBvc3REYXRhID0ge1xyXG4gICAgICAgICAgICB1cmw6ICdodHRwOi8vbS5zYWlrZS5jb20vaG91c2VkcmVzcy9kZWZhdWx0U2luZ2xlLmh0bWwnLFxyXG4gICAgICAgICAgICBzZW5kRGF0YToge30sXHJcbiAgICAgICAgICAgIGNiOiBjYWxsYmFjayxcclxuICAgICAgICAgICAgZXJyQ2I6IHRoaXMuZXJyb3JDYWxsQmFjay5iaW5kKHRoaXMpXHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLnNlbmREYXRhVG9TZXJ2ZXIocG9zdERhdGEpO1xyXG4gICAgfSxcclxuICAgIC8vIOivt+axguS6jOe6p+iPnOWNleWIl+ihqFxyXG4gICAgUmVxdWVzdFNlY29uZGFyeU1lbnVEYXRhOiBmdW5jdGlvbiAoY2FsbGJhY2spIHtcclxuICAgICAgICB2YXIgcG9zdERhdGEgPSB7XHJcbiAgICAgICAgICAgIHVybDogJ2h0dHA6Ly9tLnNhaWtlLmNvbS9ob3VzZWRyZXNzL2dldFNob3BUeXBlLmh0bWwnLFxyXG4gICAgICAgICAgICBzZW5kRGF0YToge30sXHJcbiAgICAgICAgICAgIGNiOiBjYWxsYmFjayxcclxuICAgICAgICAgICAgZXJyQ2I6IHRoaXMuZXJyb3JDYWxsQmFjay5iaW5kKHRoaXMpXHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLnNlbmREYXRhVG9TZXJ2ZXIocG9zdERhdGEpO1xyXG4gICAgfSxcclxuICAgIC8vIOivt+axguS4iee6p+iPnOWNleaVsOaNrlxyXG4gICAgUmVxdWVzdFNpbmdsZUl0ZW1zOiBmdW5jdGlvbiAoZGF0YSwgY2FsbGJhY2spIHtcclxuICAgICAgICB2YXIgcG9zdERhdGEgPSB7XHJcbiAgICAgICAgICAgIHVybDogXCJodHRwOi8vbS5zYWlrZS5jb20vaG91c2VkcmVzcy9nZXRTaG9wTGlzdC5odG1sXCIsXHJcbiAgICAgICAgICAgIHNlbmREYXRhOiB7XHJcbiAgICAgICAgICAgICAgICB0aWQ6IGRhdGEudGlkLFxyXG4gICAgICAgICAgICAgICAgcGFnZTogZGF0YS5wYWdlLFxyXG4gICAgICAgICAgICAgICAgZWFjaDogZGF0YS5lYWNoXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGNiOiBjYWxsYmFjayxcclxuICAgICAgICAgICAgZXJyQ2I6IHRoaXMuZXJyb3JDYWxsQmFjay5iaW5kKHRoaXMpXHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLnNlbmREYXRhVG9TZXJ2ZXIocG9zdERhdGEpO1xyXG4gICAgfSxcclxuICAgIC8vIOWIoOmZpOWNleS4quaIv+mXtOaVsOaNrlxyXG4gICAgUmVxdWVzdERlbEhvbWU6IGZ1bmN0aW9uIChzZW5kRGF0YSwgY2FsbGJhY2spIHtcclxuICAgICAgICB2YXIgcG9zdERhdGEgPSB7XHJcbiAgICAgICAgICAgIHVybDogXCJodHRwOi8vbS5zYWlrZS5jb20vaG91c2VkcmVzcy9kZWxTdWl0Lmh0bWxcIixcclxuICAgICAgICAgICAgc2VuZERhdGE6IHtcclxuICAgICAgICAgICAgICAgIGlkOiBzZW5kRGF0YS5pZFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBjYjogY2FsbGJhY2ssXHJcbiAgICAgICAgICAgIGVyckNiOiB0aGlzLmVycm9yQ2FsbEJhY2suYmluZCh0aGlzKVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5zZW5kRGF0YVRvU2VydmVyKHBvc3REYXRhKTtcclxuICAgIH0sXHJcbiAgICAvLyDor7fmsYLmiL/pl7TliJfooahcclxuICAgIFJlcXVlc3RIb21lTGlzdDogZnVuY3Rpb24gKHNlbmREYXRhLCBjYWxsYmFjaykge1xyXG4gICAgICAgIHZhciBwb3N0RGF0YSA9IHtcclxuICAgICAgICAgICAgdXJsOiBcImh0dHA6Ly9tLnNhaWtlLmNvbS9ob3VzZWRyZXNzL215U3VpdExpc3QuaHRtbFwiLFxyXG4gICAgICAgICAgICBzZW5kRGF0YToge1xyXG4gICAgICAgICAgICAgICAgcGFnZTogc2VuZERhdGEucGFnZSxcclxuICAgICAgICAgICAgICAgIGVhY2hudW06IHNlbmREYXRhLmVhY2hudW0sXHJcbiAgICAgICAgICAgICAgICByb29tX3R5cGU6IHNlbmREYXRhLnJvb21fdHlwZVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBjYjogY2FsbGJhY2ssXHJcbiAgICAgICAgICAgIGVyckNiOiB0aGlzLmVycm9yQ2FsbEJhY2suYmluZCh0aGlzKVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5zZW5kRGF0YVRvU2VydmVyKHBvc3REYXRhKTtcclxuICAgIH0sXHJcbiAgICAvLyDor7fmsYLljZXkuKrmiL/pl7TmlbDmja5cclxuICAgIFJlcXVlc3RIb21lRGF0YTogZnVuY3Rpb24gKHNlbmREYXRhLCBjYWxsYmFjaykge1xyXG4gICAgICAgIHZhciBwb3N0RGF0YSA9IHtcclxuICAgICAgICAgICAgdXJsOiBcImh0dHA6Ly9tLnNhaWtlLmNvbS9ob3VzZWRyZXNzL2dldFN1aXREZXRhaWxzLmh0bWxcIixcclxuICAgICAgICAgICAgc2VuZERhdGE6IHtcclxuICAgICAgICAgICAgICAgIHN1aXRfaWQ6IHNlbmREYXRhLnN1aXRfaWRcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgY2I6IGNhbGxiYWNrLFxyXG4gICAgICAgICAgICBlcnJDYjogdGhpcy5lcnJvckNhbGxCYWNrLmJpbmQodGhpcylcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMuc2VuZERhdGFUb1NlcnZlcihwb3N0RGF0YSk7XHJcbiAgICB9LFxyXG4gICAgLy8g5a2Y5YKo5oi/6Ze05pWw5o2uXHJcbiAgICBTZW5kSG9tZURhdGE6IGZ1bmN0aW9uIChzZW5kRGF0YSwgY2FsbGJhY2spIHtcclxuICAgICAgICB2YXIgcG9zdERhdGEgPSB7XHJcbiAgICAgICAgICAgIHVybDogXCJodHRwOi8vbS5zYWlrZS5jb20vaG91c2VkcmVzcy9zYXZlU2luZ2xlRHJlc3MuaHRtbFwiLFxyXG4gICAgICAgICAgICBzZW5kRGF0YToge1xyXG4gICAgICAgICAgICAgICAgc3VpdF9pZDogMCxcclxuICAgICAgICAgICAgICAgIHRodW1ibmFpbHM6IHNlbmREYXRhLnRodW1ibmFpbHMsXHJcbiAgICAgICAgICAgICAgICBzdWl0X25hbWU6IGVuY29kZVVSSUNvbXBvbmVudChzZW5kRGF0YS5uYW1lKSxcclxuICAgICAgICAgICAgICAgIHN1aXRfdHlwZTogc2VuZERhdGEudHlwZSxcclxuICAgICAgICAgICAgICAgIGRhdGFMaXN0OiBKU09OLnN0cmluZ2lmeShzZW5kRGF0YS5kYXRhTGlzdClcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgY2I6IGNhbGxiYWNrLFxyXG4gICAgICAgICAgICBlcnJDYjogdGhpcy5lcnJvckNhbGxCYWNrLmJpbmQodGhpcylcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMuc2VuZERhdGFUb1NlcnZlcihwb3N0RGF0YSk7XHJcbiAgICB9LFxyXG4gICAgLy8g5a2Y5YKo5oi/6Ze057yp55Wl5Zu+XHJcbiAgICBTZW5kSW1hZ2VUb1NlcnZlcjogZnVuY3Rpb24gKHNlbmREYXRhLCBjYWxsYmFjaykge1xyXG4gICAgICAgIHZhciBwb3N0RGF0YSA9IHtcclxuICAgICAgICAgICAgdXJsOiBcInNwdXBsb2FkLnBocFwiLFxyXG4gICAgICAgICAgICBzZW5kRGF0YToge1xyXG4gICAgICAgICAgICAgICAgaG91c2VfdWlkOiBzZW5kRGF0YS5ob3VzZV91aWQsXHJcbiAgICAgICAgICAgICAgICBzdWl0X2lkOiBzZW5kRGF0YS5zdWl0X2lkLFxyXG4gICAgICAgICAgICAgICAgaW1nOiBzZW5kRGF0YS5pbWFnZS5zcmMsXHJcbiAgICAgICAgICAgICAgICB0b0tlbjogdGhpcy50b0tlblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLnNkYXRhQmFzZS5zbG9hZGluZ1RpcHMub3BlblRpcHMoJ+WtmOWCqOe8qeeVpeWbvicpO1xyXG4gICAgICAgIGpRdWVyeS5wb3N0KHBvc3REYXRhLnVybCwgcG9zdERhdGEsIGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgICAgdGhpcy5zZGF0YUJhc2Uuc2xvYWRpbmdUaXBzLmNsb3NlVGlwcygpO1xyXG4gICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGRhdGEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwnanNvbnAnKTtcclxuICAgIH1cclxufSk7XHJcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnYjgyM2JiQ0IzbEpxWVdvRDRKUy9nQXInLCAnU1NhdmVSb29tV2luZG93Jyk7XG4vLyBzY3JpcHRcXHNpbmdsZVxcU1NhdmVSb29tV2luZG93LmpzXG5cbi8vIOS/neWtmOaIv+mXtOaVsOaNrueql+WPo1xyXG52YXIgU2F2ZVJvb21XaW5kb3cgPSBGaXJlLkNsYXNzKHtcclxuICAgIC8vIOe7p+aJv1xyXG4gICAgZXh0ZW5kczogRmlyZS5Db21wb25lbnQsXHJcbiAgICAvLyDmnoTpgKDlh73mlbBcclxuICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5sYXN0QW5pbSA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5zdHJvYWdlRHJlc3NFdmVudCA9IHRoaXMuX29uU3Ryb2FnZURyZXNzRXZlbnQuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLmNsb3NlV2luZG93RXZlbnQgPSB0aGlzLl9vbkNsb3NlV2luZG93RXZlbnQuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLmJpbmRDcmVhdGVUaHVtYm5haWxzRXZlbnQgPSB0aGlzLl9vbkNyZWF0ZVRodW1ibmFpbHNFdmVudC5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuZGVmYXVsdFRodW1ibmFpbHMgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuaGFzRG93blRodW1ibmFpbHMgPSBmYWxzZTtcclxuICAgIH0sXHJcbiAgICAvLyDlsZ7mgKdcclxuICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAvLyDnvKnnlaXlm75cclxuICAgICAgICBidG5fdGh1bWJuYWlsczoge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlVJQnV0dG9uXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDmiL/pl7TlkI3np7BcclxuICAgICAgICByb29tTmFtZToge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiBGaXJlLklucHV0RmllbGRcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOaIv+mXtOexu+Wei1xyXG4gICAgICAgIHJvb21UeXBlTGlzdDoge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlVJUG9wdXBMaXN0XHJcbiAgICAgICAgfSxcclxuICAgICAgICBidG5fY29sc2U6IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5VSUJ1dHRvblxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g56Gu6K6k5L+d5a2YXHJcbiAgICAgICAgYnRuX2NvbmZpcm1TYXZlOiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVUlCdXR0b25cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8g5Yib5bu657yp55Wl5Zu+XHJcbiAgICBfb25DcmVhdGVUaHVtYm5haWxzRXZlbnQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgaWYgKHNlbGYuaGFzRG93blRodW1ibmFpbHMpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBzZWxmLmhhc0Rvd25UaHVtYm5haWxzID0gdHJ1ZTtcclxuICAgICAgICBzZWxmLmJ0bl90aHVtYm5haWxzLnRleHRDb250ZW50LnRleHQgPSAn5L+d5oyB5Lit6K+356iN562JLi4nO1xyXG4gICAgICAgIHNlbGYuc2RhdGFCYXNlLnNjcmVlbnNob3QuY3JlYXRlVGh1bWJuYWlscyhmdW5jdGlvbiAoaW1hZ2UpIHtcclxuICAgICAgICAgICAgc2VsZi5oYXNEb3duVGh1bWJuYWlscyA9IGZhbHNlO1xyXG4gICAgICAgICAgICBzZWxmLmJ0bl90aHVtYm5haWxzLnNldEltYWdlKGltYWdlKTtcclxuICAgICAgICAgICAgc2VsZi5idG5fdGh1bWJuYWlscy50ZXh0Q29udGVudC5lbnRpdHkuYWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHNlbGYuYnRuX3RodW1ibmFpbHMudGV4dENvbnRlbnQudGV4dCA9ICfngrnlh7vmraTlpIRcXG7liJvlu7rnvKnnlaXlm74nO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIC8vIOWFs+mXreS/neWtmOeql+WPo1xyXG4gICAgX29uQ2xvc2VXaW5kb3dFdmVudDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuY2xvc2VXaW5kb3coKTtcclxuICAgIH0sXHJcbiAgICAvLyDmt7vliqDmiL/pl7TmlbDmja5cclxuICAgIF9hZGRIb21lRGF0YTogZnVuY3Rpb24gKHByb3BzLCBlbnRpdHksIGhvbWVEYXRhKSB7XHJcbiAgICAgICAgdmFyIGRhdGEgPSB7XHJcbiAgICAgICAgICAgIGlkOiBwcm9wcy5zdWl0X2lkLFxyXG4gICAgICAgICAgICBwcm9wc05hbWU6IGVudGl0eS5uYW1lLFxyXG4gICAgICAgICAgICBwcm9wc1R5cGU6IHByb3BzLnByb3BUeXBlLFxyXG4gICAgICAgICAgICBwb3M6IGVudGl0eS50cmFuc2Zvcm0ueCArIFwiOlwiICsgZW50aXR5LnRyYW5zZm9ybS55LFxyXG4gICAgICAgICAgICByb3RhdGlvbjogZW50aXR5LnRyYW5zZm9ybS5yb3RhdGlvbixcclxuICAgICAgICAgICAgc2NhbGU6IGVudGl0eS50cmFuc2Zvcm0uc2NhbGVYICsgXCI6XCIgKyBlbnRpdHkudHJhbnNmb3JtLnNjYWxlWSxcclxuICAgICAgICAgICAgaW1nVXJsOiBwcm9wcy5iaWdJbWFnZVVybFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgaG9tZURhdGEuZGF0YUxpc3QucHVzaChkYXRhKTtcclxuICAgIH0sXHJcbiAgICAvLyDkv53lrZjmiL/pl7TmlbDmja5cclxuICAgIF9zYXZlaG9tZURhdGE6IGZ1bmN0aW9uIChuYW1lLCB0eXBlKSB7XHJcbiAgICAgICAgdmFyIGhvbWVEYXRhID0ge1xyXG4gICAgICAgICAgICBrZXk6IDAsXHJcbiAgICAgICAgICAgIG5hbWU6IG5hbWUsXHJcbiAgICAgICAgICAgIHR5cGU6IHR5cGUsXHJcbiAgICAgICAgICAgIGRhdGFMaXN0OiBbXVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdmFyIHByb3BzID0gbnVsbDtcclxuICAgICAgICB2YXIgY2hpbGRyZW5zID0gdGhpcy5zZGF0YUJhc2Uucm9vbS5nZXRDaGlsZHJlbigpO1xyXG4gICAgICAgIGZvcih2YXIgaSA9IDAsIGxlbiA9IGNoaWxkcmVucy5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xyXG4gICAgICAgICAgICB2YXIgZW50aXR5ID0gY2hpbGRyZW5zW2ldO1xyXG4gICAgICAgICAgICBwcm9wcyA9IGVudGl0eS5nZXRDb21wb25lbnQoJ1NGdXJuaXR1cmUnKTtcclxuICAgICAgICAgICAgaWYgKCFwcm9wcykge1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5fYWRkSG9tZURhdGEocHJvcHMsIGVudGl0eSwgaG9tZURhdGEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gaG9tZURhdGE7XHJcbiAgICB9LFxyXG4gICAgLy9cclxuICAgIF9vblN0cm9hZ2VEcmVzc0V2ZW50OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgLy9cclxuICAgICAgICBpZiAodGhpcy5yb29tTmFtZS50ZXh0ID09PSBcIlwiIHx8IHRoaXMucm9vbVR5cGVMaXN0LnJvb21UeXBlID09PSAtMSB8fFxyXG4gICAgICAgICAgICB0aGlzLmJ0bl90aHVtYm5haWxzLmJ0blJlbmRlci5zcHJpdGUgPT09IHRoaXMuZGVmYXVsdFRodW1ibmFpbHMpICB7XHJcbiAgICAgICAgICAgIC8vXHJcbiAgICAgICAgICAgIHRoaXMuc2RhdGFCYXNlLnNzYXZlRXJyb3JUaXBzLmFjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgICAgIC8vIHRpcHPliqjnlLtcclxuICAgICAgICAgICAgaWYgKHRoaXMubGFzdEFuaW0pe1xyXG4gICAgICAgICAgICAgICAgdGhpcy5sYXN0QW5pbS5zdG9wKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIGFuaW0gPSB0aGlzLnNkYXRhQmFzZS5zc2F2ZUVycm9yVGlwcy5hbmltYXRlKFtcclxuICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAnRmlyZS5UcmFuc2Zvcm0nOiB7IHNjYWxlOiBuZXcgRmlyZS5WZWMyKDAsIDApIH1cclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgJ0ZpcmUuVHJhbnNmb3JtJzogeyBzY2FsZTogbmV3IEZpcmUuVmVjMigxLCAxKSB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHJhdGlvOiAwLjJcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgJ0ZpcmUuVHJhbnNmb3JtJzogeyBzY2FsZTogbmV3IEZpcmUuVmVjMigxLCAxKSB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBdLCB7ZHVyYXRpb246IDF9KTtcclxuXHJcbiAgICAgICAgICAgIHRoaXMubGFzdEFuaW0gPSBhbmltO1xyXG4gICAgICAgICAgICBhbmltLm9uU3RvcCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2RhdGFCYXNlLnNzYXZlRXJyb3JUaXBzLmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZGF0YUJhc2Uuc3NhdmVFcnJvclRpcHMudHJhbnNmb3JtLnNjYWxlID0gbmV3IEZpcmUuVmVjMigwLCAwKTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnNkYXRhQmFzZS5zc2F2ZUVycm9yVGlwcy5hY3RpdmUgPSBmYWxzZTtcclxuICAgICAgICB2YXIgbmFtZSA9IHRoaXMucm9vbU5hbWUudGV4dDtcclxuICAgICAgICB2YXIgdHlwZSA9IHRoaXMucm9vbVR5cGVMaXN0LnJvb21UeXBlO1xyXG4gICAgICAgIHZhciBob21lRGF0YSA9IHRoaXMuX3NhdmVob21lRGF0YShuYW1lLCB0eXBlKTtcclxuXHJcbiAgICAgICAgLy8g5L+d5a2Y57yp55Wl5Zu+XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMuc2RhdGFCYXNlLnNuZXRXb3JrTWdyLlNlbmRIb21lRGF0YShob21lRGF0YSwgZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgaWYgKGRhdGEuc3RhdHVzID4gMTAwMDApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgc2VuZERhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICBob3VzZV91aWQ6IGRhdGEuaG91c2VfdWlkLFxyXG4gICAgICAgICAgICAgICAgc3VpdF9pZDogZGF0YS5zdWl0X2lkLFxyXG4gICAgICAgICAgICAgICAgaW1hZ2U6IHNlbGYuYnRuX3RodW1ibmFpbHMuaW1hZ2VcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgc2VsZi5zZGF0YUJhc2Uuc25ldFdvcmtNZ3IuU2VuZEltYWdlVG9TZXJ2ZXIoc2VuZERhdGEsIGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmNsb3NlV2luZG93KCk7XHJcbiAgICAgICAgICAgICAgICBzZWxmLnNkYXRhQmFzZS5zdGlwc1dpbmRvdy5vcGVuV2luZG93KCfkv53lrZjmiJDlip8uLicpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICAvLyDmiZPlvIDnqpflj6NcclxuICAgIG9wZW5XaW5kb3c6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLmVudGl0eS5hY3RpdmUgPSB0cnVlO1xyXG4gICAgfSxcclxuICAgIC8vIOWFs+mXrVxyXG4gICAgY2xvc2VXaW5kb3c6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLnNkYXRhQmFzZS5zc2F2ZUVycm9yVGlwcy5hY3RpdmUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnJvb21UeXBlTGlzdC5yb29tVHlwZSA9IC0xO1xyXG4gICAgICAgIHRoaXMucm9vbU5hbWUudGV4dCA9ICcnO1xyXG4gICAgICAgIHRoaXMucm9vbVR5cGVMaXN0LmJ0bl9yb29tVHlwZS5zZXRUZXh0KCfnsbvlnovlkI3np7AnKTtcclxuICAgICAgICBpZiAodGhpcy5kZWZhdWx0VGh1bWJuYWlscykge1xyXG4gICAgICAgICAgICB0aGlzLmJ0bl90aHVtYm5haWxzLnNldFNwcml0ZSh0aGlzLmRlZmF1bHRUaHVtYm5haWxzKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5idG5fdGh1bWJuYWlscy50ZXh0Q29udGVudC5lbnRpdHkuYWN0aXZlID0gdHJ1ZTtcclxuICAgIH0sXHJcbiAgICAvLyDlvIDlp4vml7ZcclxuICAgIHN0YXJ0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9TRGF0YUJhc2UnKTtcclxuICAgICAgICB0aGlzLnNkYXRhQmFzZSA9IGVudC5nZXRDb21wb25lbnQoJ1NEYXRhQmFzZScpO1xyXG4gICAgICAgIC8vXHJcbiAgICAgICAgdGhpcy5idG5fY29sc2Uub25DbGljayA9IHRoaXMuY2xvc2VXaW5kb3dFdmVudDtcclxuICAgICAgICB0aGlzLmJ0bl9jb25maXJtU2F2ZS5vbkNsaWNrID0gdGhpcy5zdHJvYWdlRHJlc3NFdmVudDtcclxuICAgICAgICB0aGlzLmJ0bl90aHVtYm5haWxzLm9uQ2xpY2sgPSB0aGlzLmJpbmRDcmVhdGVUaHVtYm5haWxzRXZlbnQ7XHJcbiAgICAgICAgdGhpcy5kZWZhdWx0VGh1bWJuYWlscyA9IHRoaXMuYnRuX3RodW1ibmFpbHMuYnRuUmVuZGVyLnNwcml0ZTtcclxuICAgIH1cclxufSk7XHJcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnODhjYzY4eW1KSkVLTGdUV0NVcTZkc20nLCAnU1NlY29uZGFyeU1lbnVNZ3InKTtcbi8vIHNjcmlwdFxcc2luZ2xlXFxTU2Vjb25kYXJ5TWVudU1nci5qc1xuXG4vLyDkuoznuqfoj5zljZXnrqHnkIbnsbtcclxudmFyIFNTZWNvbmRhcnlNZW51TWdyID0gRmlyZS5DbGFzcyh7XHJcbiAgICAvLyDnu6fmib9cclxuICAgIGV4dGVuZHM6IEZpcmUuQ29tcG9uZW50LFxyXG4gICAgLy8g5p6E6YCg5Ye95pWwXHJcbiAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIC8vIOS4gOmhteaYvuekuuWkmuWwkeS4qlxyXG4gICAgICAgIHRoaXMuX3Nob3dUb3RhbCA9IDg7XHJcbiAgICAgICAgLy8g6I+c5Y2V5a655Zmo5YiX6KGoXHJcbiAgICAgICAgdGhpcy5fbWVudVNoZWV0cyA9IFtdO1xyXG4gICAgICAgIC8vIOaJk+W8gOS4iee6p+iPnOWNleS6i+S7tlxyXG4gICAgICAgIHRoaXMuYmluZE9wZW5UaHJlZU1lbnVFdmVudCA9IHRoaXMuX29uT3BlblRocmVlTWVudUV2ZW50LmJpbmQodGhpcyk7XHJcbiAgICAgICAgLy8g5Y2V5ZOB6I+c5Y2V5Zue6LCD5Ye95pWwXHJcbiAgICAgICAgdGhpcy5iaW5kUmVmcmVzaEVldm50ID0gdGhpcy5fcmVmcmVzaFNpbmdsZVNlY29uZGFyeU1lbnUuYmluZCh0aGlzKTtcclxuICAgIH0sXHJcbiAgICAvLyDlsZ7mgKdcclxuICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAvL1xyXG4gICAgICAgIG1hcmdpbjogbmV3IEZpcmUuVmVjMigwLCA2NCksXHJcbiAgICAgICAgLy8g5LqM57qn6I+c5Y2V55qE5qC56IqC54K5XHJcbiAgICAgICAgcm9vdE5vZGU6IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5FbnRpdHlcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8g5omT5byA5ZCE5Liq57G75Z6L5a625YW35YiX6KGoXHJcbiAgICBfb25PcGVuVGhyZWVNZW51RXZlbnQ6IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgIHZhciBtZW51ID0gZXZlbnQudGFyZ2V0LnBhcmVudC5nZXRDb21wb25lbnQoJ1NTZWNvbmRhcnlNZW51Jyk7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ+iOt+WPlicgKyBtZW51LnRpZCArIFwi57G75Z6L5a625YW35YiX6KGoXCIpO1xyXG4gICAgICAgIHRoaXMuc2RhdGFCYXNlLnN0aHJlZU1lbnVNZ3Iub3Blbk1lbnUobWVudS50aWQsIG1lbnUuaGFzRHJhZyk7XHJcbiAgICB9LFxyXG4gICAgLy8g6YeN572u6I+c5Y2V5YiX6KGoXHJcbiAgICBfcmVzZXRNZW51OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX21lbnVTaGVldHMubGVuZ3RoID09PSAwKXtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX3Nob3dUb3RhbDsgKytpKSB7XHJcbiAgICAgICAgICAgIHZhciBtZW51ID0gdGhpcy5fbWVudVNoZWV0c1tpXTtcclxuICAgICAgICAgICAgbWVudS5uYW1lID0gaS50b1N0cmluZygpO1xyXG4gICAgICAgICAgICBtZW51LnJlc2V0TWVudSgpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvLyDliJvlu7roj5zljZXlrrnlmahcclxuICAgIF9jcmVhdGVNZW51Q29udGFpbmVyczogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9tZW51U2hlZXRzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgdGVtcE1lbnUgPSB0aGlzLnNkYXRhQmFzZS50ZW1wU2Vjb25kYXJ5TWVudTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX3Nob3dUb3RhbDsgKytpKSB7XHJcbiAgICAgICAgICAgIHZhciBlbnQgPSBGaXJlLmluc3RhbnRpYXRlKHRlbXBNZW51KTtcclxuICAgICAgICAgICAgZW50Lm5hbWUgPSBpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIGVudC5wYXJlbnQgPSB0aGlzLnJvb3ROb2RlO1xyXG4gICAgICAgICAgICBlbnQudHJhbnNmb3JtLnBvc2l0aW9uID0gbmV3IEZpcmUuVmVjMigtNDk1ICsgKGkgKiAxNDApLCAwKTtcclxuICAgICAgICAgICAgdmFyIG1lbnUgPSBlbnQuZ2V0Q29tcG9uZW50KCdTU2Vjb25kYXJ5TWVudScpO1xyXG4gICAgICAgICAgICBtZW51LmluaXQoKTtcclxuICAgICAgICAgICAgLy8g5a2Y5YKo5a+56LGhXHJcbiAgICAgICAgICAgIHRoaXMuX21lbnVTaGVldHMucHVzaChtZW51KTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8g5Yi35paw5LqM57qn6I+c5Y2VXHJcbiAgICBfcmVmcmVzaFNlY29uZGFyeU1lbnU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAvLyDliJvlu7rlrrnlmahcclxuICAgICAgICB0aGlzLl9jcmVhdGVNZW51Q29udGFpbmVycygpO1xyXG4gICAgICAgIC8vIOmHjee9ruiPnOWNleWIl+ihqFxyXG4gICAgICAgIHRoaXMuX3Jlc2V0TWVudSgpO1xyXG4gICAgICAgIC8vIOmHjeaWsOi1i+WAvFxyXG4gICAgICAgIHZhciBpID0gMCwgbWVudSA9IG51bGw7XHJcbiAgICAgICAgdmFyIGRhdGFMaXN0ID0gdGhpcy5zZGF0YUJhc2Uuc2Vjb25kYXJ5TWVudURhdGFTaGVldHM7XHJcbiAgICAgICAgZm9yKGkgPSAwOyBpIDwgZGF0YUxpc3QubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICAgICAgdmFyIGRhdGEgPSBkYXRhTGlzdFtpXTtcclxuICAgICAgICAgICAgaWYgKCEgZGF0YSl7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBtZW51ID0gdGhpcy5fbWVudVNoZWV0c1tpXTtcclxuICAgICAgICAgICAgbWVudS5yZWZyZXNoKGRhdGEsIHRoaXMuYmluZE9wZW5UaHJlZU1lbnVFdmVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIOWIt+aWsOWNleS4quS6jOe6p+iPnOWNlVxyXG4gICAgX3JlZnJlc2hTaW5nbGVTZWNvbmRhcnlNZW51OiBmdW5jdGlvbiAoaW5kZXgsIGRhdGEpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX21lbnVTaGVldHMgfHwgdGhpcy5fbWVudVNoZWV0cy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgbWVudSA9IHRoaXMuX21lbnVTaGVldHNbaW5kZXhdO1xyXG4gICAgICAgIGlmIChtZW51KSB7XHJcbiAgICAgICAgICAgIG1lbnUucmVmcmVzaChkYXRhLCB0aGlzLmJpbmRPcGVuVGhyZWVNZW51RXZlbnQpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBvbkxvYWQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL1NEYXRhQmFzZScpO1xyXG4gICAgICAgIHRoaXMuc2RhdGFCYXNlID0gZW50LmdldENvbXBvbmVudCgnU0RhdGFCYXNlJyk7XHJcbiAgICAgICAgLy8g6aKE5Yqg6L29IOWNleWTgVxyXG4gICAgICAgIHRoaXMuc2RhdGFCYXNlLnByZWxvYWRTZWNvbmRhcnlNZW51RGF0YSh0aGlzLmJpbmRSZWZyZXNoRWV2bnQpO1xyXG4gICAgfSxcclxuICAgIC8vIOaJk+W8gOS6jOe6p+iPnOWNlVxyXG4gICAgb3BlblNlY29uZGFyeU1lbnU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLmVudGl0eS5hY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgIC8vIOWIt+aWsOWNleWTgeWutuWFt+iPnOWNleWIl+ihqFxyXG4gICAgICAgIHRoaXMuX3JlZnJlc2hTZWNvbmRhcnlNZW51KCk7XHJcbiAgICB9LFxyXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgLy8g5Yy56YWNVUnliIbovqjnjodcclxuICAgICAgICAvL3ZhciBjYW1lcmEgPSBGaXJlLkNhbWVyYS5tYWluO1xyXG4gICAgICAgIC8vdmFyIGJnV29ybGRCb3VuZHMgPSB0aGlzLnNkYXRhQmFzZS5iZ1JlbmRlci5nZXRXb3JsZEJvdW5kcygpO1xyXG4gICAgICAgIC8vdmFyIGJnTGVmdFRvcFdvcmxkUG9zID0gbmV3IEZpcmUuVmVjMihiZ1dvcmxkQm91bmRzLnhNaW4sIGJnV29ybGRCb3VuZHMueU1pbik7XHJcbiAgICAgICAgLy92YXIgYmdsZWZ0VG9wID0gY2FtZXJhLndvcmxkVG9TY3JlZW4oYmdMZWZ0VG9wV29ybGRQb3MpO1xyXG4gICAgICAgIC8vdmFyIHNjcmVlblBvcyA9IG5ldyBGaXJlLlZlYzIoYmdsZWZ0VG9wLngsIGJnbGVmdFRvcC55KTtcclxuICAgICAgICAvL3ZhciB3b3JsZFBvcyA9IGNhbWVyYS5zY3JlZW5Ub1dvcmxkKHNjcmVlblBvcyk7XHJcbiAgICAgICAgLy90aGlzLmVudGl0eS50cmFuc2Zvcm0ud29ybGRQb3NpdGlvbiA9IHdvcmxkUG9zO1xyXG4gICAgICAgIC8vIOWMuemFjVVJ5YiG6L6o546HXHJcbiAgICAgICAgdmFyIGNhbWVyYSA9IEZpcmUuQ2FtZXJhLm1haW47XHJcbiAgICAgICAgdmFyIHNjcmVlblNpemUgPSBGaXJlLlNjcmVlbi5zaXplLm11bChjYW1lcmEuc2l6ZSAvIEZpcmUuU2NyZWVuLmhlaWdodCk7XHJcbiAgICAgICAgdmFyIG5ld1BvcyA9IEZpcmUudjIodGhpcy5tYXJnaW4ueCwgLXNjcmVlblNpemUueSAvIDIgKyB0aGlzLm1hcmdpbi55KTtcclxuICAgICAgICB0aGlzLmVudGl0eS50cmFuc2Zvcm0ucG9zaXRpb24gPSBuZXdQb3M7XHJcbiAgICB9XHJcbn0pO1xyXG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJ2U5MjY1RHBTSkpDV0x1VmpHLzMwWk5PJywgJ1NTZWNvbmRhcnlNZW51Jyk7XG4vLyBzY3JpcHRcXHNpbmdsZVxcU1NlY29uZGFyeU1lbnUuanNcblxuLy8g5L+d5a2Y5LqM57qn6I+c5Y2V5pWw5o2uXHJcbnZhciBTU2Vjb25kYXJ5TWVudSA9IEZpcmUuQ2xhc3Moe1xyXG4gICAgLy8g57un5om/XHJcbiAgICBleHRlbmRzOiBGaXJlLkNvbXBvbmVudCxcclxuICAgIC8vIOaehOmAoOWHveaVsFxyXG4gICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLmJ0bl9tZW51ID0gbnVsbDtcclxuICAgICAgICB0aGlzLnRleHRDb250ZW50ID0gbnVsbDtcclxuICAgIH0sXHJcbiAgICAvLyDlsZ7mgKdcclxuICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAvLyDpu5jorqTlm77niYdcclxuICAgICAgICBkZWZhdWx0U3ByaXRlOiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuU3ByaXRlXHJcbiAgICAgICAgfSxcclxuICAgICAgICB0aWQ6IDAsXHJcbiAgICAgICAgdG5hbWU6ICfovb3lhaXkuK0uLicsXHJcbiAgICAgICAgaXNkcmFnOiBmYWxzZSxcclxuICAgICAgICB1cmw6ICcnXHJcbiAgICB9LFxyXG4gICAgLy8g6K6+572u5Zu+54mHXHJcbiAgICBzZXRTcHJpdGU6IGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICAgIHRoaXMuYnRuX21lbnUuc2V0U3ByaXRlKHZhbHVlKTtcclxuICAgIH0sXHJcbiAgICAvLyDorr7nva7mloflrZdcclxuICAgIHNldFRleHQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xyXG4gICAgICAgIHRoaXMuYnRuX21lbnUuc2V0VGV4dCh2YWx1ZSk7XHJcbiAgICB9LFxyXG4gICAgLy8g6YeN572u6I+c5Y2VXHJcbiAgICByZXNldE1lbnU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLnRpZCA9IDA7XHJcbiAgICAgICAgdGhpcy5pc2RyYWcgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnRuYW1lID0gJ+i9veWFpeS4rS4uJztcclxuICAgICAgICB0aGlzLnVybCA9ICcnO1xyXG4gICAgICAgIHRoaXMuc2V0U3ByaXRlKHRoaXMuZGVmYXVsdFNwcml0ZSk7XHJcbiAgICAgICAgdGhpcy5zZXRUZXh0KHRoaXMudG5hbWUpO1xyXG4gICAgfSxcclxuICAgIC8vIOWIneWni+WMllxyXG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICghIHRoaXMuYnRuX21lbnUpIHtcclxuICAgICAgICAgICAgdmFyIGVudCA9IHRoaXMuZW50aXR5LmZpbmQoJ2J0bl9tZW51Jyk7XHJcbiAgICAgICAgICAgIHRoaXMuYnRuX21lbnUgPSBlbnQuZ2V0Q29tcG9uZW50KEZpcmUuVUlCdXR0b24pO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnJlc2V0TWVudSgpO1xyXG4gICAgfSxcclxuICAgIC8vIOWIt+aWsFxyXG4gICAgcmVmcmVzaDogZnVuY3Rpb24gKGRhdGEsIGV2ZW50KSB7XHJcbiAgICAgICAgdGhpcy50aWQgPSBkYXRhLnRpZDtcclxuICAgICAgICB0aGlzLmhhc0RyYWcgPSBkYXRhLmlzZHJhZyA8IDI7XHJcbiAgICAgICAgdGhpcy50bmFtZSA9IGRhdGEudG5hbWU7XHJcbiAgICAgICAgdGhpcy51cmwgPSBkYXRhLnVybDtcclxuICAgICAgICB0aGlzLnNldFRleHQoZGF0YS50bmFtZSk7XHJcbiAgICAgICAgaWYgKGRhdGEuc21hbGxTcHJpdGUpIHtcclxuICAgICAgICAgICAgdGhpcy5zZXRTcHJpdGUoZGF0YS5zbWFsbFNwcml0ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuYnRuX21lbnUub25DbGljayA9IGV2ZW50O1xyXG4gICAgfVxyXG59KTtcclxuXG5GaXJlLl9SRnBvcCgpOyIsIkZpcmUuX1JGcHVzaChtb2R1bGUsICdlN2Q4N1pQNU85Rm1wNGU0Z2hoRUlESCcsICdTVGhyZWVNZW51TWdyJyk7XG4vLyBzY3JpcHRcXHNpbmdsZVxcU1RocmVlTWVudU1nci5qc1xuXG4vLyDkuInnuqfoj5zljZXnrqHnkIbnsbtcclxudmFyIFNUaHJlZU1lbnVNZ3IgPSBGaXJlLkNsYXNzKHtcclxuICAgIC8vIOe7p+aJv1xyXG4gICAgZXh0ZW5kczogRmlyZS5Db21wb25lbnQsXHJcbiAgICAvLyDmnoTpgKDlh73mlbBcclxuICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgLy8g5a625YW35LiA5qyh5pi+56S65aSa5bCR5pWw6YePXHJcbiAgICAgICAgdGhpcy5fbWVudVRvdGFsID0gNjtcclxuICAgICAgICAvLyDmuLjmiI/mlbDmja5cclxuICAgICAgICB0aGlzLnNkYXRhQmFzZSA9IG51bGw7XHJcbiAgICAgICAgLy8g6I+c5Y2V5YiX6KGoXHJcbiAgICAgICAgdGhpcy5fbWVudUxpc3QgPSBbXTtcclxuICAgICAgICAvLyDmmK/lkKblj6/ku6Xmi5bliqjvvIjkvovlpoLlo4HnurjkuI7lnLDpnaLml6Dms5Xmi5bliqjvvIlcclxuICAgICAgICB0aGlzLl9oYXNEcmFnID0gZmFsc2U7XHJcbiAgICAgICAgLy8g5b2T5YmN6YCJ5oup54mp5ZOBSURcclxuICAgICAgICB0aGlzLl9jdXJJZCA9IDA7XHJcbiAgICAgICAgLy8g5b2T5YmN5pyA5aSn5pWw6YePXHJcbiAgICAgICAgdGhpcy5fY3VyVG90YWwgPSAwO1xyXG4gICAgICAgIC8vIOW9k+WJjemhteetvlxyXG4gICAgICAgIHRoaXMuX2N1clBhZ2UgPSAxO1xyXG4gICAgICAgIC8vIOacgOWkp+mhteetvlxyXG4gICAgICAgIHRoaXMuX21heFBhZ2UgPSAxO1xyXG4gICAgICAgIC8vIOWbvueJh+i9veWFpeWbnuiwg1xyXG4gICAgICAgIHRoaXMuYmluZEFmdGVyTG9hZEltYWdlQ0IgPSBudWxsO1xyXG4gICAgICAgIC8vIOWkp+Wbvui9veWFpeS4rVxyXG4gICAgICAgIHRoaXMuX2hhc0xvYWRCaWdJbWFnZWluZyA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuX2xhc3RDcmVhdGVUYXJnZXQgPSBudWxsO1xyXG4gICAgfSxcclxuICAgIC8vIOWxnuaAp1xyXG4gICAgcHJvcGVydGllczoge1xyXG4gICAgICAgIG1hcmdpbjogbmV3IEZpcmUuVmVjMigwLCAyNDApLFxyXG4gICAgICAgIC8vIOS4iee6p+iPnOWNleeahOagueiKgueCuVxyXG4gICAgICAgIHJvb3ROb2RlOiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuRW50aXR5XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIOWIm+W7uuaIluiAheaYr+WIh+aNouadkOi0qFxyXG4gICAgY3JlYXRlT3JDaGFuZ2VGdXJuaXR1cmU6IGZ1bmN0aW9uICh0YXJnZXQpIHtcclxuICAgICAgICAvLyDkuIDlvIDlp4vlpKflm77mnKrliqDovb3nmoTml7blgJnvvIznpoHmraLnlKjmiLflpJrmrKHngrnlh7vnm7jlkIzlrrblhbdcclxuICAgICAgICBpZiAodGhpcy5faGFzTG9hZEJpZ0ltYWdlaW5nICYmIHRoaXMuX2xhc3RDcmVhdGVUYXJnZXQgPT09IHRhcmdldCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICB2YXIgbWVudSA9IHRhcmdldC5nZXRDb21wb25lbnQoJ1NUaHJlZU1lbnUnKTtcclxuICAgICAgICB2YXIgZW50LCBlbnRDb21wLCBiaWdTcHJpdGU7XHJcbiAgICAgICAgLy8g5aKZ5aOB5LiO5Zyw5p2/XHJcbiAgICAgICAgaWYgKCEgc2VsZi5faGFzRHJhZykge1xyXG4gICAgICAgICAgICBpZiAoc2VsZi5fY3VySWQgPT09IDEpIHtcclxuICAgICAgICAgICAgICAgIGVudCA9IHNlbGYuc2RhdGFCYXNlLmJnUmVuZGVyLmVudGl0eTtcclxuICAgICAgICAgICAgICAgIGVudENvbXAgPSBlbnQuZ2V0Q29tcG9uZW50KCdTRnVybml0dXJlJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoc2VsZi5fY3VySWQgPT09IDIpIHtcclxuICAgICAgICAgICAgICAgIGVudCA9IHNlbGYuc2RhdGFCYXNlLmdyb3VuZFJlbmRlci5lbnRpdHk7XHJcbiAgICAgICAgICAgICAgICBlbnRDb21wID0gZW50LmdldENvbXBvbmVudCgnU0Z1cm5pdHVyZScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVudENvbXAudE5hbWUgPSBtZW51LnROYW1lO1xyXG4gICAgICAgICAgICBlbnRDb21wLnN1aXRfaWQgPSBtZW51LnN1aXRfaWQ7XHJcbiAgICAgICAgICAgIGVudENvbXAuaGFzRHJhZyA9IHNlbGYuX2hhc0RyYWc7XHJcbiAgICAgICAgICAgIGVudENvbXAuaW1hZ2VVcmwgPSBtZW51LmJpZ0ltYWdlVXJsO1xyXG4gICAgICAgICAgICBiaWdTcHJpdGUgPSBzZWxmLnNkYXRhQmFzZS50aHJlZU1lbnVCaWdJbWFnZVNoZWV0c1tlbnRDb21wLnN1aXRfaWRdO1xyXG4gICAgICAgICAgICBpZiAoYmlnU3ByaXRlKSB7XHJcbiAgICAgICAgICAgICAgICBlbnRDb21wLnNldFNwcml0ZShiaWdTcHJpdGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5faGFzTG9hZEJpZ0ltYWdlaW5nID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIEZpcmUuSW1hZ2VMb2FkZXIoZW50Q29tcC5pbWFnZVVybCwgZnVuY3Rpb24gKGVycm9yLCBpbWFnZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX2hhc0xvYWRCaWdJbWFnZWluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgYmlnU3ByaXRlID0gbmV3IEZpcmUuU3ByaXRlKGltYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICBlbnRDb21wLnNldFNwcml0ZShiaWdTcHJpdGUpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyDliJvlu7rlrrblhbfliLDlnLrmma/kuK1cclxuICAgICAgICBlbnQgPSBGaXJlLmluc3RhbnRpYXRlKHNlbGYuc2RhdGFCYXNlLnRlbXBGdXJuaXR1cmUpO1xyXG4gICAgICAgIGVudC5wYXJlbnQgPSBzZWxmLnNkYXRhQmFzZS5yb29tO1xyXG4gICAgICAgIHZhciBwb3MgPSB0YXJnZXQudHJhbnNmb3JtLndvcmxkUG9zaXRpb247XHJcbiAgICAgICAgdmFyIG9mZnNldCA9IE1hdGgucm91bmQoTWF0aC5yYW5kb20oKSAqIDEwMCk7XHJcbiAgICAgICAgcG9zLnggKz0gb2Zmc2V0O1xyXG4gICAgICAgIHBvcy55ICs9IDQwMDtcclxuICAgICAgICBlbnQudHJhbnNmb3JtLnBvc2l0aW9uID0gbmV3IEZpcmUuVmVjMihwb3MueCwgcG9zLnkpO1xyXG4gICAgICAgIGVudC50cmFuc2Zvcm0uc2NhbGUgPSBuZXcgRmlyZS5WZWMyKDEuOCwgMS44KTtcclxuICAgICAgICBlbnQubmFtZSA9IG1lbnUuc3VpdF9pZDtcclxuICAgICAgICBlbnRDb21wID0gZW50LmdldENvbXBvbmVudCgnU0Z1cm5pdHVyZScpO1xyXG4gICAgICAgIGVudENvbXAuc3VpdF9pZCA9IG1lbnUuc3VpdF9pZDtcclxuICAgICAgICBlbnRDb21wLnByb3BUeXBlID0gdGhpcy5fY3VySWQ7XHJcbiAgICAgICAgZW50Q29tcC50TmFtZSA9IG1lbnUudE5hbWU7XHJcbiAgICAgICAgZW50Q29tcC5oYXNEcmFnID0gdGhpcy5faGFzRHJhZztcclxuICAgICAgICBlbnRDb21wLmltYWdlVXJsID0gbWVudS5iaWdJbWFnZVVybDtcclxuICAgICAgICBiaWdTcHJpdGUgPSBzZWxmLnNkYXRhQmFzZS50aHJlZU1lbnVCaWdJbWFnZVNoZWV0c1tlbnRDb21wLnN1aXRfaWRdO1xyXG4gICAgICAgIGlmIChiaWdTcHJpdGUpIHtcclxuICAgICAgICAgICAgZW50Q29tcC5zZXRTcHJpdGUoYmlnU3ByaXRlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHNlbGYuX2hhc0xvYWRCaWdJbWFnZWluZyA9IHRydWU7XHJcbiAgICAgICAgICAgIEZpcmUuSW1hZ2VMb2FkZXIoZW50Q29tcC5pbWFnZVVybCwgZnVuY3Rpb24gKGVycm9yLCBpbWFnZSkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5faGFzTG9hZEJpZ0ltYWdlaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgYmlnU3ByaXRlID0gbmV3IEZpcmUuU3ByaXRlKGltYWdlKTtcclxuICAgICAgICAgICAgICAgIGVudENvbXAuc2V0U3ByaXRlKGJpZ1Nwcml0ZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvLyDliJvlu7rlkITkuKrnsbvlnovlrrblhbdcclxuICAgIF9vbkNyZWF0ZUZ1cm5pdHVyZUV2ZW50OiBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICBjb25zb2xlLmxvZygn5Yib5bu6JyArIGV2ZW50LnRhcmdldC5wYXJlbnQubmFtZSk7XHJcbiAgICAgICAgdGhpcy5jcmVhdGVPckNoYW5nZUZ1cm5pdHVyZShldmVudC50YXJnZXQucGFyZW50KTtcclxuICAgIH0sXHJcbiAgICAvLyDph43nva7oj5zljZXliJfooahcclxuICAgIF9yZXNldE1lbnU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX21lbnVMaXN0Lmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgIHZhciBtZW51ID0gdGhpcy5fbWVudUxpc3RbaV07XHJcbiAgICAgICAgICAgIG1lbnUubmFtZSA9IGkudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgbWVudS5yZXNldE1lbnUoKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8g5Yib5bu66I+c5Y2V5oyJ6ZKu5bm25LiU57uR5a6a5LqL5Lu2IOaIluiAheWIt+aWsFxyXG4gICAgX3JlZnJlc2hTaW5nbGVJdGVtczogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBpID0gMCwgbWVudSA9IG51bGw7XHJcbiAgICAgICAgLy8g5Yib5bu65a+56LGh5a655ZmoXHJcbiAgICAgICAgaWYgKHRoaXMuX21lbnVMaXN0Lmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICB2YXIgdGVtcEZ1cm5pdHVyZSA9IHRoaXMuc2RhdGFCYXNlLnRlbXBUaHJlZU1lbnU7XHJcbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCB0aGlzLl9tZW51VG90YWw7ICsraSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGVudCA9IEZpcmUuaW5zdGFudGlhdGUodGVtcEZ1cm5pdHVyZSk7XHJcbiAgICAgICAgICAgICAgICBlbnQubmFtZSA9IGkudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgICAgIGVudC5wYXJlbnQgPSB0aGlzLnJvb3ROb2RlO1xyXG4gICAgICAgICAgICAgICAgZW50LnRyYW5zZm9ybS5wb3NpdGlvbiA9IG5ldyBGaXJlLlZlYzIoLTQyMCArIChpICogMTcwKSwgNDApO1xyXG4gICAgICAgICAgICAgICAgbWVudSA9IGVudC5nZXRDb21wb25lbnQoJ1NUaHJlZU1lbnUnKTtcclxuICAgICAgICAgICAgICAgIG1lbnUuaW5pdCgpO1xyXG4gICAgICAgICAgICAgICAgLy8g5a2Y5YKo5a+56LGhXHJcbiAgICAgICAgICAgICAgICB0aGlzLl9tZW51TGlzdC5wdXNoKG1lbnUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAvLyDph43nva5cclxuICAgICAgICAgICAgdGhpcy5fcmVzZXRNZW51KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIOWmguaenOaAu+aVsOmHj+acieabtOaWsOWwsemHjeaWsOiuoeeul+acgOWkp+mhteaVsFxyXG4gICAgICAgIHZhciB0b3RhbCA9IHRoaXMuc2RhdGFCYXNlLnRocmVlTWVudURhdGFUb3RhbFNoZWV0c1t0aGlzLl9jdXJJZF07XHJcbiAgICAgICAgaWYgKHRoaXMuX2N1clRvdGFsICE9PSB0b3RhbCkge1xyXG4gICAgICAgICAgICB0aGlzLl9jdXJUb3RhbCA9IHRvdGFsO1xyXG4gICAgICAgICAgICB0aGlzLl9tYXhQYWdlID0gTWF0aC5jZWlsKHRoaXMuX2N1clRvdGFsIC8gdGhpcy5fbWVudVRvdGFsKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8g6LWL5YC85pWw5o2uXHJcbiAgICAgICAgdmFyIGluZGV4ID0gMDtcclxuICAgICAgICB2YXIgc3RhcnROdW0gPSAodGhpcy5fY3VyUGFnZSAtIDEpICogdGhpcy5fbWVudVRvdGFsO1xyXG4gICAgICAgIHZhciBlbmROdW0gPSBzdGFydE51bSArIHRoaXMuX21lbnVUb3RhbDtcclxuICAgICAgICBpZiAoZW5kTnVtID4gdGhpcy5fY3VyVG90YWwpIHtcclxuICAgICAgICAgICAgZW5kTnVtID0gdGhpcy5fY3VyVG90YWw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBiaW5kRXZlbnQgPSB0aGlzLl9vbkNyZWF0ZUZ1cm5pdHVyZUV2ZW50LmJpbmQodGhpcyk7XHJcbiAgICAgICAgdmFyIGRhdGFTaGVldHMgPSB0aGlzLnNkYXRhQmFzZS50aHJlZU1lbnVEYXRhU2hlZXRzW3RoaXMuX2N1cklkXTtcclxuICAgICAgICBmb3IoaSA9IHN0YXJ0TnVtOyBpIDwgZW5kTnVtOyArK2kpIHtcclxuICAgICAgICAgICAgbWVudSA9IHRoaXMuX21lbnVMaXN0W2luZGV4XTtcclxuICAgICAgICAgICAgbWVudS5lbnRpdHkuYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICAgICAgaW5kZXgrKztcclxuICAgICAgICAgICAgdmFyIG1lbnVEYXRhID0gZGF0YVNoZWV0c1tpXTtcclxuICAgICAgICAgICAgaWYgKCFtZW51RGF0YSkge1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbWVudS5yZWZyZXNoKG1lbnVEYXRhLCBiaW5kRXZlbnQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyDliLfmlrDmjInpkq7nirbmgIFcclxuICAgICAgICB0aGlzLl9yZWZyZXNoQnRuU3RhdGUoKTtcclxuICAgICAgICAvLyDliKTmlq3mmK/lkKbpnIDopoHpooTliqDovb3kuIvkuIDpobVcclxuICAgICAgICB2YXIgbGVuID0gZGF0YVNoZWV0cy5sZW5ndGg7XHJcbiAgICAgICAgaWYobGVuID09PSB0aGlzLl9jdXJUb3RhbCl7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8g6aKE5Yqg6L295LiL5LiA6aG1XHJcbiAgICAgICAgdmFyIG5leHRQYWdlID0gdGhpcy5fY3VyUGFnZSArIDE7XHJcbiAgICAgICAgdGhpcy5zZGF0YUJhc2UucHJlbG9hZFRocmVlTWVudURhdGEodGhpcy5fY3VySWQsIG5leHRQYWdlLCB0aGlzLl9tZW51VG90YWwsIHRoaXMuYmluZEFmdGVyTG9hZEltYWdlQ0IpO1xyXG4gICAgfSxcclxuICAgIC8vIOa/gOa0u+iPnOWNleaXtuinpuWPkeeahOS6i+S7tlxyXG4gICAgLy8gaWQ6IOeJqeWTgeeahElEXHJcbiAgICAvLyBoYXNEcmFnIOaYr+WQpuaLluedgFxyXG4gICAgb3Blbk1lbnU6IGZ1bmN0aW9uIChpZCwgaGFzRHJhZykge1xyXG4gICAgICAgIHRoaXMuX2N1cklkID0gaWQ7XHJcbiAgICAgICAgdGhpcy5fY3VyUGFnZSA9IDE7XHJcbiAgICAgICAgdGhpcy5faGFzRHJhZyA9IGhhc0RyYWc7XHJcbiAgICAgICAgdGhpcy5fcmVmcmVzaFNpbmdsZUl0ZW1zKCk7XHJcbiAgICAgICAgLy8g5pi+56S65b2T5YmN56qX5Y+jXHJcbiAgICAgICAgdGhpcy5lbnRpdHkuYWN0aXZlID0gdHJ1ZTtcclxuICAgIH0sXHJcbiAgICBjbG9zZU1lbnU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLl9jdXJJZCA9IDA7XHJcbiAgICAgICAgdGhpcy5fY3VyUGFnZSA9IDE7XHJcbiAgICAgICAgdGhpcy5lbnRpdHkuYWN0aXZlID0gZmFsc2U7XHJcbiAgICB9LFxyXG4gICAgLy8g5LiK5LiA6aG1XHJcbiAgICBfb25QcmV2aW91c0V2ZW50OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5fY3VyUGFnZSAtPSAxO1xyXG4gICAgICAgIGlmICh0aGlzLl9jdXJQYWdlIDwgMSl7XHJcbiAgICAgICAgICAgIHRoaXMuX2N1clBhZ2UgPSAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9yZWZyZXNoU2luZ2xlSXRlbXMoKTtcclxuICAgIH0sXHJcbiAgICAvLyDkuIvkuIDpobVcclxuICAgIF9vbk5leHRFdmVudDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuX2N1clBhZ2UgKz0gMTtcclxuICAgICAgICBpZiAodGhpcy5fY3VyUGFnZSA+IHRoaXMuX21heFBhZ2Upe1xyXG4gICAgICAgICAgICB0aGlzLl9jdXJQYWdlID0gdGhpcy5fbWF4UGFnZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fcmVmcmVzaFNpbmdsZUl0ZW1zKCk7XHJcbiAgICB9LFxyXG4gICAgLy8g5YWz6Zet5b2T5YmN6I+c5Y2VXHJcbiAgICBfb25DbG9zZU1lbnU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLmNsb3NlTWVudSgpO1xyXG4gICAgfSxcclxuICAgIC8vIOWIt+aWsOaMiemSrueKtuaAgVxyXG4gICAgX3JlZnJlc2hCdG5TdGF0ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuYnRuX1ByZXZpb3VzLmFjdGl2ZSA9IHRoaXMuX2N1clBhZ2UgPiAxO1xyXG4gICAgICAgIHRoaXMuYnRuX05leHQuYWN0aXZlID0gdGhpcy5fY3VyUGFnZSA8IHRoaXMuX21heFBhZ2U7XHJcbiAgICB9LFxyXG4gICAgLy8g5Zu+54mH6L295YWl5a6M5q+V5Lul5ZCO55qE5Zue6LCDXHJcbiAgICBfQWZ0ZXJMb2FkSW1hZ2VDYWxsQmFjazogZnVuY3Rpb24gKGlkLCBpbmRleCwgcGFnZSwgbWVudURhdGEpIHtcclxuICAgICAgICBpZiAodGhpcy5fY3VySWQgPT09IGlkICYmIHRoaXMuX2N1clBhZ2UgPT09IHBhZ2UpIHtcclxuICAgICAgICAgICAgdmFyIG1lbnUgPSB0aGlzLl9tZW51TGlzdFtpbmRleF07XHJcbiAgICAgICAgICAgIGlmIChtZW51KSB7XHJcbiAgICAgICAgICAgICAgICBtZW51LnJlZnJlc2gobWVudURhdGEsIHRoaXMuX29uQ3JlYXRlRnVybml0dXJlRXZlbnQuYmluZCh0aGlzKSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8g5byA5aeLXHJcbiAgICBzdGFydDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIC8vIOW4uOeUqOeahOWPmOmHjy/mlbDmja5cclxuICAgICAgICB2YXIgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL1NEYXRhQmFzZScpO1xyXG4gICAgICAgIHRoaXMuc2RhdGFCYXNlID0gZW50LmdldENvbXBvbmVudCgnU0RhdGFCYXNlJyk7XHJcbiAgICAgICAgLy8g6I635Y+W5YWz6Zet5oyJ6ZKu5bm257uR5a6a5LqL5Lu2XHJcbiAgICAgICAgZW50ID0gdGhpcy5lbnRpdHkuZmluZCgnYnRuX0Nsb3NlJyk7XHJcbiAgICAgICAgdmFyIGJ0bkNsb3NlID0gZW50LmdldENvbXBvbmVudChGaXJlLlVJQnV0dG9uKTtcclxuICAgICAgICBidG5DbG9zZS5vbkNsaWNrID0gdGhpcy5fb25DbG9zZU1lbnUuYmluZCh0aGlzKTtcclxuICAgICAgICAvLyDkuIrkuIDpobVcclxuICAgICAgICB0aGlzLmJ0bl9QcmV2aW91cyA9IHRoaXMuZW50aXR5LmZpbmQoJ2J0bl9QcmV2aW91cycpO1xyXG4gICAgICAgIHZhciBidG5fUHJldmlvdXMgPSB0aGlzLmJ0bl9QcmV2aW91cy5nZXRDb21wb25lbnQoRmlyZS5VSUJ1dHRvbik7XHJcbiAgICAgICAgYnRuX1ByZXZpb3VzLm9uQ2xpY2sgPSB0aGlzLl9vblByZXZpb3VzRXZlbnQuYmluZCh0aGlzKTtcclxuICAgICAgICAvLyDkuIvkuIDpobVcclxuICAgICAgICB0aGlzLmJ0bl9OZXh0ID0gdGhpcy5lbnRpdHkuZmluZCgnYnRuX05leHQnKTtcclxuICAgICAgICB2YXIgYnRuX05leHQgPSB0aGlzLmJ0bl9OZXh0LmdldENvbXBvbmVudChGaXJlLlVJQnV0dG9uKTtcclxuICAgICAgICBidG5fTmV4dC5vbkNsaWNrID0gdGhpcy5fb25OZXh0RXZlbnQuYmluZCh0aGlzKTtcclxuICAgICAgICAvL1xyXG4gICAgICAgIHRoaXMuYnRuX1ByZXZpb3VzLmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuYnRuX05leHQuYWN0aXZlID0gZmFsc2U7XHJcblxyXG4gICAgICAgIHRoaXMuYmluZEFmdGVyTG9hZEltYWdlQ0IgPSB0aGlzLl9BZnRlckxvYWRJbWFnZUNhbGxCYWNrLmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAgIC8vIOmihOWKoOi9vVxyXG4gICAgICAgIHRoaXMuc2RhdGFCYXNlLnByZWxvYWRUaHJlZU1lbnVEYXRhKDEsIDEsIHRoaXMuX21lbnVUb3RhbCwgdGhpcy5iaW5kQWZ0ZXJMb2FkSW1hZ2VDQik7XHJcbiAgICAgICAgdGhpcy5zZGF0YUJhc2UucHJlbG9hZFRocmVlTWVudURhdGEoMiwgMSwgdGhpcy5fbWVudVRvdGFsLCB0aGlzLmJpbmRBZnRlckxvYWRJbWFnZUNCKTtcclxuICAgICAgICB0aGlzLnNkYXRhQmFzZS5wcmVsb2FkVGhyZWVNZW51RGF0YSgzLCAxLCB0aGlzLl9tZW51VG90YWwsIHRoaXMuYmluZEFmdGVyTG9hZEltYWdlQ0IpO1xyXG4gICAgICAgIHRoaXMuc2RhdGFCYXNlLnByZWxvYWRUaHJlZU1lbnVEYXRhKDQsIDEsIHRoaXMuX21lbnVUb3RhbCwgdGhpcy5iaW5kQWZ0ZXJMb2FkSW1hZ2VDQik7XHJcbiAgICAgICAgdGhpcy5zZGF0YUJhc2UucHJlbG9hZFRocmVlTWVudURhdGEoNSwgMSwgdGhpcy5fbWVudVRvdGFsLCB0aGlzLmJpbmRBZnRlckxvYWRJbWFnZUNCKTtcclxuICAgICAgICB0aGlzLnNkYXRhQmFzZS5wcmVsb2FkVGhyZWVNZW51RGF0YSg2LCAxLCB0aGlzLl9tZW51VG90YWwsIHRoaXMuYmluZEFmdGVyTG9hZEltYWdlQ0IpO1xyXG4gICAgICAgIHRoaXMuc2RhdGFCYXNlLnByZWxvYWRUaHJlZU1lbnVEYXRhKDcsIDEsIHRoaXMuX21lbnVUb3RhbCwgdGhpcy5iaW5kQWZ0ZXJMb2FkSW1hZ2VDQik7XHJcbiAgICAgICAgdGhpcy5zZGF0YUJhc2UucHJlbG9hZFRocmVlTWVudURhdGEoOCwgMSwgdGhpcy5fbWVudVRvdGFsLCB0aGlzLmJpbmRBZnRlckxvYWRJbWFnZUNCKTtcclxuICAgIH0sXHJcblxyXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgLy8g5Yy56YWNVUnliIbovqjnjodcclxuICAgICAgICAvL3ZhciBjYW1lcmEgPSBGaXJlLkNhbWVyYS5tYWluO1xyXG4gICAgICAgIC8vdmFyIGJnV29ybGRCb3VuZHMgPSB0aGlzLnNkYXRhQmFzZS5iZ1JlbmRlci5nZXRXb3JsZEJvdW5kcygpO1xyXG4gICAgICAgIC8vdmFyIGJnTGVmdFRvcFdvcmxkUG9zID0gbmV3IEZpcmUuVmVjMihiZ1dvcmxkQm91bmRzLnhNaW4sIGJnV29ybGRCb3VuZHMueU1pbik7XHJcbiAgICAgICAgLy92YXIgYmdsZWZ0VG9wID0gY2FtZXJhLndvcmxkVG9TY3JlZW4oYmdMZWZ0VG9wV29ybGRQb3MpO1xyXG4gICAgICAgIC8vdmFyIHNjcmVlblBvcyA9IG5ldyBGaXJlLlZlYzIoYmdsZWZ0VG9wLngsIGJnbGVmdFRvcC55KTtcclxuICAgICAgICAvL3ZhciB3b3JsZFBvcyA9IGNhbWVyYS5zY3JlZW5Ub1dvcmxkKHNjcmVlblBvcyk7XHJcbiAgICAgICAgLy90aGlzLmVudGl0eS50cmFuc2Zvcm0ud29ybGRQb3NpdGlvbiA9IHdvcmxkUG9zO1xyXG4gICAgICAgIC8vIOWMuemFjVVJ5YiG6L6o546HXHJcbiAgICAgICAgdmFyIGNhbWVyYSA9IEZpcmUuQ2FtZXJhLm1haW47XHJcbiAgICAgICAgdmFyIHNjcmVlblNpemUgPSBGaXJlLlNjcmVlbi5zaXplLm11bChjYW1lcmEuc2l6ZSAvIEZpcmUuU2NyZWVuLmhlaWdodCk7XHJcbiAgICAgICAgdmFyIG5ld1BvcyA9IEZpcmUudjIodGhpcy5tYXJnaW4ueCwgLXNjcmVlblNpemUueSAvIDIgKyB0aGlzLm1hcmdpbi55KTtcclxuICAgICAgICB0aGlzLmVudGl0eS50cmFuc2Zvcm0ucG9zaXRpb24gPSBuZXdQb3M7XHJcbiAgICB9XHJcbn0pO1xyXG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJ2YyOGE3WkhXcXBHQUl2Tm5mUGJ3N0NiJywgJ1NUaHJlZU1lbnUnKTtcbi8vIHNjcmlwdFxcc2luZ2xlXFxTVGhyZWVNZW51LmpzXG5cbnZhciBTVGhyZWVNZW51ID0gRmlyZS5DbGFzcyh7XHJcbiAgICAvLyDnu6fmib9cclxuICAgIGV4dGVuZHM6IEZpcmUuQ29tcG9uZW50LFxyXG4gICAgLy8g5p6E6YCg5Ye95pWwXHJcbiAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIC8vIOS4i+i9veasoeaVsFxyXG4gICAgICAgIHRoaXMuX2J0bk1lbnUgPSBudWxsO1xyXG4gICAgfSxcclxuICAgIC8vIOWxnuaAp1xyXG4gICAgcHJvcGVydGllczoge1xyXG4gICAgICAgIHROYW1lOiAnJyxcclxuICAgICAgICAvLyBJRFxyXG4gICAgICAgIHN1aXRfaWQ6IDAsXHJcbiAgICAgICAgLy8g5aSn5Zu+VXJsXHJcbiAgICAgICAgYmlnSW1hZ2VVcmw6ICcnLFxyXG4gICAgICAgIC8vIOi9veWFpeaXtueahOWbvueJh1xyXG4gICAgICAgIGRlZmF1bHRTcHJpdGU6IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5TcHJpdGVcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8g6YeN572u5a625YW3XHJcbiAgICByZXNldE1lbnU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLl9idG5NZW51LnNldFRleHQoJ+i9veWFpeS4rScpO1xyXG4gICAgICAgIHRoaXMuX2J0bk1lbnUuc2V0U3ByaXRlKHRoaXMuZGVmYXVsdFNwcml0ZSk7XHJcbiAgICAgICAgdGhpcy5fYnRuTWVudS5vbkNsaWNrID0gbnVsbDtcclxuICAgICAgICB0aGlzLmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcclxuICAgIH0sXHJcbiAgICAvLyDorr7nva7mloflrZdcclxuICAgIHNldFRleHQ6IGZ1bmN0aW9uICh0ZXh0KSB7XHJcbiAgICAgICAgdGhpcy5fYnRuTWVudS5zZXRUZXh0KHRleHQpO1xyXG4gICAgfSxcclxuICAgIC8vIOiuvue9ruWbvueJh1xyXG4gICAgc2V0U3ByaXRlOiBmdW5jdGlvbiAoc21hbGxTcHJpdGUsIGV2ZW50KSB7XHJcbiAgICAgICAgdGhpcy5fYnRuTWVudS5zZXRTcHJpdGUoc21hbGxTcHJpdGUpO1xyXG4gICAgICAgIGlmIChldmVudCkge1xyXG4gICAgICAgICAgICB0aGlzLl9idG5NZW51Lm9uQ2xpY2sgPSBldmVudDtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8g5Yid5aeL5YyWXHJcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIGVudCA9IG51bGw7XHJcbiAgICAgICAgaWYgKCEgdGhpcy5fYnRuTWVudSkge1xyXG4gICAgICAgICAgICBlbnQgPSB0aGlzLmVudGl0eS5maW5kKCdidG5fbWVudScpO1xyXG4gICAgICAgICAgICB0aGlzLl9idG5NZW51ID0gZW50LmdldENvbXBvbmVudChGaXJlLlVJQnV0dG9uKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5yZXNldE1lbnUoKTtcclxuICAgIH0sXHJcbiAgICAvLyDliLfmlrDlt7LkuIvovb3ov4flkI7nmoTmlbDmja5cclxuICAgIHJlZnJlc2g6IGZ1bmN0aW9uIChkYXRhLCBiaW5kRXZlbnQpIHtcclxuICAgICAgICB0aGlzLmVudGl0eS5uYW1lID0gZGF0YS5zdWl0X2lkO1xyXG4gICAgICAgIHRoaXMuc3VpdF9pZCA9IGRhdGEuc3VpdF9pZDtcclxuICAgICAgICB0aGlzLnROYW1lID0gZGF0YS5uYW1lO1xyXG4gICAgICAgIHRoaXMuYmlnSW1hZ2VVcmwgPSBkYXRhLmJpZ0ltYWdlVXJsO1xyXG4gICAgICAgIHRoaXMuc2V0VGV4dChkYXRhLm5hbWUpO1xyXG4gICAgICAgIGlmIChkYXRhLnNtYWxsU3ByaXRlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0U3ByaXRlKGRhdGEuc21hbGxTcHJpdGUsIGJpbmRFdmVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZW50aXR5LmFjdGl2ZSA9IHRydWU7XHJcbiAgICB9XHJcbn0pO1xyXG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJ2U1OTI4N2txNEJLT0lCSmJhK1ZPWDQrJywgJ1NUaXBzV2luZG93Jyk7XG4vLyBzY3JpcHRcXHNpbmdsZVxcU1RpcHNXaW5kb3cuanNcblxudmFyIFRpcHNXaW5kb3cgPSBGaXJlLkNsYXNzKHtcclxuICAgIC8vIO+/vcyz77+9XHJcbiAgICBleHRlbmRzOiBGaXJlLkNvbXBvbmVudCxcclxuICAgIC8vIO+/ve+/ve+/vey6r++/ve+/vVxyXG4gICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLm9uQ2FsbEV2ZW50ID0gbnVsbDtcclxuICAgIH0sXHJcbiAgICAvLyDvv73vv73vv73vv71cclxuICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICBjb250ZW50OntcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5CaXRtYXBUZXh0XHJcbiAgICAgICAgfSxcclxuICAgICAgICBidG5fQ29uZmlybTp7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVUlCdXR0b25cclxuICAgICAgICB9LFxyXG4gICAgICAgIGJ0bl9DbG9zZTp7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVUlCdXR0b25cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8g77+98r+qtO+/ve+/ve+/vVxyXG4gICAgb3BlbldpbmRvdzogZnVuY3Rpb24gKHRleHQsIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgdGhpcy5lbnRpdHkuYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICBpZiAodGV4dCkge1xyXG4gICAgICAgICAgICB0aGlzLnNldENvbnRlbnQodGV4dCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMub25DYWxsRXZlbnQgPSBudWxsO1xyXG4gICAgICAgIGlmIChjYWxsYmFjaykge1xyXG4gICAgICAgICAgICB0aGlzLm9uQ2FsbEV2ZW50ID0gY2FsbGJhY2s7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIO+/vdix1bTvv73vv73vv71cclxuICAgIGNsb3NlV2luZG93OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5lbnRpdHkuYWN0aXZlID0gZmFsc2U7XHJcbiAgICB9LFxyXG4gICAgLy8g77+977+977+9w7Xvv73vv73Duu+/ve+/ve+/vVxyXG4gICAgc2V0Q29udGVudDogZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgICAgdGhpcy5jb250ZW50LnRleHQgPSBldmVudDtcclxuICAgIH0sXHJcbiAgICAvLyDvv73YsdW077+977+977+9XHJcbiAgICBfb25DbG9zZVdpbmRvdzogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuY2xvc2VXaW5kb3coKTtcclxuICAgIH0sXHJcbiAgICAvLyDIt++/ve+/ve+/vcK877+9XHJcbiAgICBfb25Db25maXJtRXZlbnQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcclxuICAgICAgICBpZiAodGhpcy5vbkNhbGxFdmVudCkge1xyXG4gICAgICAgICAgICB0aGlzLm9uQ2FsbEV2ZW50KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vXHJcbiAgICBvbkxvYWQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLmJ0bl9Db25maXJtLm9uQ2xpY2sgPSB0aGlzLl9vbkNvbmZpcm1FdmVudC5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuYnRuX0Nsb3NlLm9uQ2xpY2sgPSB0aGlzLl9vbkNsb3NlV2luZG93LmJpbmQodGhpcyk7XHJcbiAgICB9XHJcbn0pO1xyXG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJzg3NDhjU0h6eU5BR1pGSUd1anNnVGplJywgJ1NjcmVlbnNob3QnKTtcbi8vIHNjcmlwdFxcc2luZ2xlXFxTY3JlZW5zaG90LmpzXG5cbmZ1bmN0aW9uIGNvbnZlcnRDYW52YXNUb0ltYWdlKGNhbnZhcykge1xyXG4gICAgdmFyIGltYWdlID0gbmV3IEltYWdlKCk7XHJcbiAgICBpbWFnZS5zcmMgPSBjYW52YXMudG9EYXRhVVJMKFwiaW1hZ2UvcG5nXCIpO1xyXG4gICAgLy9jYW52YXMuZ2V0SW1hZ2VEYXRhKClcclxuICAgIHJldHVybiBpbWFnZTtcclxufVxyXG4vLyDnlKjkuo7liJvlu7rnvKnnlaXlm75cclxudmFyIFNjcmVlbnNob3QgPSBGaXJlLkNsYXNzKHtcclxuICAgIGV4dGVuZHM6IEZpcmUuQ29tcG9uZW50LFxyXG4gICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAvLyDnlKjkuo7mi43nhadcclxuICAgICAgICB0aGlzLmZyYW1lQ291bnQgPSAtMTtcclxuICAgICAgICB0aGlzLm5lZWRIaWRlRW50TGlzdCA9IFtdO1xyXG4gICAgICAgIHRoaXMuY2FsbGJhY2sgPSBudWxsO1xyXG4gICAgfSxcclxuICAgIC8vIOWxnuaAp1xyXG4gICAgcHJvcGVydGllczoge1xyXG5cclxuICAgIH0sXHJcbiAgICAvLyDovb3lhaXml7ZcclxuICAgIG9uTG9hZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9TRGF0YUJhc2UnKTtcclxuICAgICAgICB0aGlzLnNkYXRhQmFzZSA9IGVudC5nZXRDb21wb25lbnQoJ1NEYXRhQmFzZScpO1xyXG4gICAgfSxcclxuICAgIC8vIOWIm+W7uue8qeeVpeWbvlxyXG4gICAgY3JlYXRlVGh1bWJuYWlsczogZnVuY3Rpb24gKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgaWYgKGNhbGxiYWNrKXtcclxuICAgICAgICAgICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyDlhbPpl63lt7Lnu4/miZPlvIDnlYzpnaJcclxuICAgICAgICB0aGlzLm5lZWRIaWRlRW50TGlzdCA9IFtdO1xyXG4gICAgICAgIHZhciBjaGlsZHJlbiA9IEZpcmUuRW5naW5lLl9zY2VuZS5lbnRpdGllcztcclxuICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gY2hpbGRyZW4ubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcclxuICAgICAgICAgICAgdmFyIGVudCA9IGNoaWxkcmVuW2ldO1xyXG4gICAgICAgICAgICBpZiAoZW50LmFjdGl2ZSAmJiBlbnQubmFtZSAhPT0gJ01haW4gQ2FtZXJhJyAmJlxyXG4gICAgICAgICAgICAgICAgZW50Lm5hbWUgIT09ICdTY2VuZSBDYW1lcmEnICYmIGVudC5uYW1lICE9PSAnUm9vbScgJiZcclxuICAgICAgICAgICAgICAgIGVudC5uYW1lICE9PSAnU2NyZWVuc2hvdCcpIHtcclxuICAgICAgICAgICAgICAgIGVudC5hY3RpdmUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHRoaXMubmVlZEhpZGVFbnRMaXN0LnB1c2goZW50KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyDliJvlu7ogQ2FudmFzXHJcbiAgICAgICAgaWYgKCF0aGlzLmNhbnZhc0N0eFRvRHJlYXdJbWFnZSkge1xyXG4gICAgICAgICAgICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XHJcbiAgICAgICAgICAgIGNhbnZhcy53aWR0aCA9IDEyMDtcclxuICAgICAgICAgICAgY2FudmFzLmhlaWdodCA9IDEyMDtcclxuICAgICAgICAgICAgdGhpcy5jYW52YXNDdHhUb0RyZWF3SW1hZ2UgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5mcmFtZUNvdW50ID0gRmlyZS5UaW1lLmZyYW1lQ291bnQgKyAyO1xyXG4gICAgfSxcclxuICAgIC8vIOWIt+aWsFxyXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuZnJhbWVDb3VudCAhPT0gLTEgJiYgdGhpcy5mcmFtZUNvdW50ID09PSBGaXJlLlRpbWUuZnJhbWVDb3VudCkge1xyXG4gICAgICAgICAgICAvLyDnu5jliLblm77niYdcclxuICAgICAgICAgICAgdGhpcy5jYW52YXNDdHhUb0RyZWF3SW1hZ2UuY2xlYXJSZWN0KDAsIDAsIDEyMCwgMTIwKTtcclxuICAgICAgICAgICAgdmFyIHcgPSBGaXJlLkVuZ2luZS5fcmVuZGVyQ29udGV4dC53aWR0aDtcclxuICAgICAgICAgICAgdmFyIGggPSBGaXJlLkVuZ2luZS5fcmVuZGVyQ29udGV4dC5oZWlnaHQ7XHJcbiAgICAgICAgICAgIHZhciBtYWluSW1hZ2UgPSBjb252ZXJ0Q2FudmFzVG9JbWFnZShGaXJlLkVuZ2luZS5fcmVuZGVyQ29udGV4dC5jYW52YXMpO1xyXG4gICAgICAgICAgICB0aGlzLnNkYXRhQmFzZS5zbG9hZGluZ1RpcHMub3BlblRpcHMoJ+WIm+W7uue8qeeVpeWbvicpO1xyXG4gICAgICAgICAgICBtYWluSW1hZ2Uub25sb2FkID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5jYW52YXNDdHhUb0RyZWF3SW1hZ2UuZHJhd0ltYWdlKG1haW5JbWFnZSwgMCwgMCwgdywgaCwgMCwgMCwgMTIwLCAxMjApO1xyXG4gICAgICAgICAgICAgICAgdmFyIGltYWdlID0gY29udmVydENhbnZhc1RvSW1hZ2UodGhpcy5jYW52YXNDdHhUb0RyZWF3SW1hZ2UuY2FudmFzKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2RhdGFCYXNlLnNsb2FkaW5nVGlwcy5jbG9zZVRpcHMoKTtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jYWxsYmFjayhpbWFnZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKTtcclxuICAgICAgICAgICAgLy8g5omT5byA5LmL5YmN5YWz6Zet55qE55WM6Z2iXHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSB0aGlzLm5lZWRIaWRlRW50TGlzdC5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5uZWVkSGlkZUVudExpc3RbaV0uYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0aGlzLmZyYW1lQ291bnQgPSAtMTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pO1xyXG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJ2E5MGY1OGEzOTVEaFl6aVN3WGtEdjdzJywgJ1NlY29uZE1lbnVNZ3InKTtcbi8vIHNjcmlwdFxcdmlsbGFcXFNlY29uZE1lbnVNZ3IuanNcblxuLy8g5LqM57qn6I+c5Y2V566h55CG57G7XG52YXIgU2Vjb25kTWVudU1nciA9IEZpcmUuQ2xhc3Moe1xuICAgIC8vIOe7p+aJv1xuICAgIGV4dGVuZHM6IEZpcmUuQ29tcG9uZW50LFxuICAgIC8vIOaehOmAoOWHveaVsFxuICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIOWutuWFt+exu+Wei+aAu+aVsFxuICAgICAgICB0aGlzLl9mdXJuaXR1cmVUeXBlVG90YWwgPSA4O1xuICAgICAgICAvLyDoj5zljZXliJfooahcbiAgICAgICAgdGhpcy5fbWVudUxpc3QgPSBbXTtcbiAgICAgICAgLy8g5b2T5YmN6YCJ5oupdHlwZSAxIOWNleWTgSAyIOWll+ijhSAzIOeJqeWTgeafnFxuICAgICAgICB0aGlzLl9jdXJUeXBlID0gMTtcbiAgICAgICAgLy8g5aWX6KOF5LiA6aG15pi+56S65aSa5bCR5LiqXG4gICAgICAgIHRoaXMuX3N1dGlJdGVtU2hvd1RvdGFsID0gNTtcbiAgICAgICAgLy8g5b2T5YmN5pyA5aSn5pWw6YePXG4gICAgICAgIHRoaXMuX2N1clRvdGFsID0gMDtcbiAgICAgICAgLy8g5b2T5YmN6aG15pWwXG4gICAgICAgIHRoaXMuX2N1clBhZ2UgPSAxO1xuICAgICAgICAvLyDmnIDlpKfpobXmlbBcbiAgICAgICAgdGhpcy5fbWF4UGFnZSA9IDE7XG4gICAgICAgIC8vIOWIm+W7uuWll+ijheWutuWFt+WIsOWcuuaZr+S4rVxuICAgICAgICB0aGlzLmJpbmRDcmVhdGVTdWl0SXRlbUV2ZW50ID0gdGhpcy5fb25DcmVhdGVTdWl0SXRlbUV2ZW50LmJpbmQodGhpcyk7XG4gICAgICAgIC8vIOaJk+W8gOS4iee6p+iPnOWNleS6i+S7tlxuICAgICAgICB0aGlzLmJpbmRPcGVuVGhyZWVNZW51RXZlbnQgPSB0aGlzLl9vbk9wZW5UaHJlZU1lbnVFdmVudC5iaW5kKHRoaXMpO1xuICAgICAgICAvLyDljZXlk4Hoj5zljZXlm57osIPlh73mlbBcbiAgICAgICAgdGhpcy5iaW5kUmVmcmVzaFNpbmdsZUl0ZW1zTWVudSA9IHRoaXMuX3JlZnJlc2hTaW5nbGVJdGVtc01lbnUuYmluZCh0aGlzKTtcbiAgICAgICAgLy8g5aWX6KOF6I+c5Y2V5Zue6LCD5Ye95pWwXG4gICAgICAgIHRoaXMuYmluZFJlZnJlc2hTdWl0SXRlbXNNZW51ID0gdGhpcy5fcmVmcmVzaFN1aXRJdGVtc01lbnUuYmluZCh0aGlzKTtcbiAgICAgICAgLy8g6aKE5a2Y5pyN5Yqh5Zmo5pWw5o2u5YiX6KGoXG4gICAgICAgIHRoaXMuc2VydmVyU3VpdERhdGFMaXN0ID0ge307XG4gICAgfSxcbiAgICAvLyDlsZ7mgKdcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIC8vXG4gICAgICAgIG1hcmdpbjogbmV3IEZpcmUuVmVjMigtMTA5MCwgMCksXG4gICAgICAgIC8vIOS6jOe6p+iPnOWNleeahOagueiKgueCuVxuICAgICAgICByb290OiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5FbnRpdHlcbiAgICAgICAgfSxcbiAgICAgICAgLy8g5LiK5LiA6aG1XG4gICAgICAgIGJ0bl9MZWZ0OiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5FbnRpdHlcbiAgICAgICAgfSxcbiAgICAgICAgLy8g5LiL5LiA6aG1XG4gICAgICAgIGJ0bl9SaWdodDoge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuRW50aXR5XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIOaJk+W8gOWQhOS4quexu+Wei+WutuWFt+WIl+ihqFxuICAgIF9vbk9wZW5UaHJlZU1lbnVFdmVudDogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIHZhciBtZW51ID0gZXZlbnQudGFyZ2V0LnBhcmVudC5nZXRDb21wb25lbnQoJ1NlY29uZE1lbnUnKTtcbiAgICAgICAgY29uc29sZS5sb2coJ+iOt+WPlicgKyBtZW51LnRpZCArIFwi57G75Z6L5a625YW35YiX6KGoXCIpO1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIC8vIOWmguaenOaYr+eJqeWTgeeahOivneWwsemcgOimgeWFiOivt+axguacjeWKoeWZqOS/oeaBr1xuICAgICAgICBpZiAoc2VsZi5fY3VyVHlwZSA9PT0gMikge1xuICAgICAgICAgICAgdmFyIHRleHQgPSAn6K+35rGC5Y2V5ZOB5pWw5o2u77yM6K+356iN5ZCOLi4uJywgZWFjaG51bSA9IDc7XG4gICAgICAgICAgICBpZiAobWVudS50aWQgPT09IDEpIHtcbiAgICAgICAgICAgICAgICB0ZXh0ID0gJ+ivt+axguWll+ijheaVsOaNru+8jOivt+eojeWQji4uLic7XG4gICAgICAgICAgICAgICAgZWFjaG51bSA9IDU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZWxmLmRhdGFCYXNlLmxvYWRUaXBzLm9wZW5UaXBzKHRleHQpO1xuICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS5sb2FkQmFja3BhY2tEYXRhKG1lbnUudGlkLCAxLCBlYWNobnVtLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS5sb2FkVGlwcy5jbG9zZVRpcHMoKTtcbiAgICAgICAgICAgICAgICBzZWxmLmRhdGFCYXNlLnRocmVlTWVudU1nci5vcGVuTWVudShtZW51LnRpZCwgc2VsZi5fY3VyVHlwZSwgbWVudS5oYXNEcmFnKTtcbiAgICAgICAgICAgICAgICBzZWxmLmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5kYXRhQmFzZS50aHJlZU1lbnVNZ3Iub3Blbk1lbnUobWVudS50aWQsIHRoaXMuX2N1clR5cGUsIG1lbnUuaGFzRHJhZyk7XG4gICAgICAgICAgICB0aGlzLmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy8g5Yib5bu65aWX6KOF5Yiw5Zy65pmv5LitXG4gICAgX29uQ3JlYXRlU3VpdEl0ZW1FdmVudDogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIHZhciBzZWNvbmRNZW51ID0gZXZlbnQudGFyZ2V0LnBhcmVudC5nZXRDb21wb25lbnQoJ1NlY29uZE1lbnUnKTtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAvLyDliKDpmaTlpZfoo4VcbiAgICAgICAgc2VsZi5kYXRhQmFzZS5yZW1vdmVTdWl0KCk7XG4gICAgICAgIC8vIOmHjeaWsOi1i+WAvOWll+ijhVxuICAgICAgICBzZWxmLmRhdGFCYXNlLmN1ckRyZXNzU3VpdCA9IHtcbiAgICAgICAgICAgIC8vIOWll+ijhUlEXG4gICAgICAgICAgICBzdWl0X2lkOiBzZWNvbmRNZW51LnRpZCxcbiAgICAgICAgICAgIC8vIOiDjOWMhUlEXG4gICAgICAgICAgICBwYWNrX2lkOiAwLFxuICAgICAgICAgICAgLy8g5aWX6KOF5bCP5Zu+XG4gICAgICAgICAgICBzdWl0X2ljb246IHNlY29uZE1lbnUuc21hbGxTcHJpdGUsXG4gICAgICAgICAgICAvLyDlpZfoo4XlkI3np7BcbiAgICAgICAgICAgIHN1aXRfbmFtZTogc2Vjb25kTWVudS50bmFtZSxcbiAgICAgICAgICAgIC8vIOWll+ijheadpeiHquWTqumHjO+8jDEu6IOM5YyFIDIu5ZWG5Z+OXG4gICAgICAgICAgICBzdWl0X2Zyb206IDIsXG4gICAgICAgICAgICAvLyDlpZfoo4Xku7fmoLxcbiAgICAgICAgICAgIHByaWNlOiBzZWNvbmRNZW51LnByaWNlLFxuICAgICAgICAgICAgLy8g5oqY5omjXG4gICAgICAgICAgICBkaXNjb3VudDogc2Vjb25kTWVudS5kaXNjb3VudCxcbiAgICAgICAgICAgIC8vIOWll+ijheWIl+ihqFxuICAgICAgICAgICAgZnVucm5pdHVyZUxpc3Q6IFtdXG4gICAgICAgIH07XG4gICAgICAgIHZhciBzZXJ2ZXJEYXRhID0gdGhpcy5zZXJ2ZXJTdWl0RGF0YUxpc3Rbc2Vjb25kTWVudS50aWRdO1xuICAgICAgICBpZiAoc2VydmVyRGF0YSkge1xuICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS5jcmVhdGVGdXJuaXR1cmVUb1NjcmVlbihzZXJ2ZXJEYXRhLmxpc3QsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmRhdGFCYXNlLmxvYWRUaXBzLmNsb3NlVGlwcygpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBzZWxmLmRhdGFCYXNlLmxvYWRUaXBzLm9wZW5UaXBzKCfliJvlu7rlpZfoo4XvvIzor7fnqI3lkI4uLi4nKTtcbiAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UubmV0V29ya01nci5SZXF1ZXN0U2V0SXRlbXNEYXRhKHNlY29uZE1lbnUudGlkLCBmdW5jdGlvbiAoc2VydmVyRGF0YSkge1xuICAgICAgICAgICAgICAgIHNlbGYuc2VydmVyU3VpdERhdGFMaXN0W3NlY29uZE1lbnUudGlkXSA9IHNlcnZlckRhdGE7XG4gICAgICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS5jcmVhdGVGdXJuaXR1cmVUb1NjcmVlbihzZXJ2ZXJEYXRhLmxpc3QsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS5sb2FkVGlwcy5jbG9zZVRpcHMoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyDlhbPpl63lvZPliY3oj5zljZVcbiAgICBjbG9zZU1lbnU6IGZ1bmN0aW9uIChoYXNNb2RpZnlUb2dnbGUpIHtcbiAgICAgICAgaWYgKCF0aGlzLmVudGl0eS5hY3RpdmUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9jdXJQYWdlID0gMTtcbiAgICAgICAgdGhpcy5lbnRpdHkuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgIGlmIChoYXNNb2RpZnlUb2dnbGUpIHtcbiAgICAgICAgICAgIHRoaXMuZGF0YUJhc2UuZmlyc3RNZW51TWdyLm1vZGlmeVRvZ2dsZSgpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyDlhbPpl63lvZPliY3oj5zljZVcbiAgICBfb25DbG9zZU1lbnU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5jbG9zZU1lbnUodHJ1ZSk7XG4gICAgfSxcbiAgICAvLyDph43nva7oj5zljZXliJfooahcbiAgICBfcmVzZXRNZW51OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLl9tZW51TGlzdC5sZW5ndGggPT09IDApe1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fZnVybml0dXJlVHlwZVRvdGFsOyArK2kpIHtcbiAgICAgICAgICAgIHZhciBtZW51ID0gdGhpcy5fbWVudUxpc3RbaV07XG4gICAgICAgICAgICBtZW51Lm5hbWUgPSBpLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICBtZW51LnJlc2V0TWVudSgpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyDliJvlu7roj5zljZXmjInpkq7lubbkuJTnu5Hlrprkuovku7ZcbiAgICBfaW5pdE1lbnU6IGZ1bmN0aW9uIChpZCkge1xuICAgICAgICAvLyDliJvlu7rlrrnlmahcbiAgICAgICAgdGhpcy5fY3JlYXRlTWVudUNvbnRhaW5lcnMoKTtcbiAgICAgICAgdGhpcy5fcmVzZXRNZW51KCk7XG4gICAgICAgIHN3aXRjaChpZCl7XG4gICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICAgdGhpcy5fc2luZ2xlSXRlbXNNZW51KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgdGhpcy5fc3VpdEl0ZW1zTWVudSgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgIHRoaXMuX2l0ZW1zQ2FiaW5ldE1lbnUoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIOWIm+W7uuWuueWZqFxuICAgIF9jcmVhdGVNZW51Q29udGFpbmVyczogZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5fbWVudUxpc3QubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciB0ZW1wTWVudSA9IHRoaXMuZGF0YUJhc2UudGVtcFN1YlNlY29uZE1lbnU7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fZnVybml0dXJlVHlwZVRvdGFsOyArK2kpIHtcbiAgICAgICAgICAgIHZhciBlbnQgPSBGaXJlLmluc3RhbnRpYXRlKHRlbXBNZW51KTtcbiAgICAgICAgICAgIGVudC5uYW1lID0gaS50b1N0cmluZygpO1xuICAgICAgICAgICAgZW50LnBhcmVudCA9IHRoaXMucm9vdDtcbiAgICAgICAgICAgIGVudC50cmFuc2Zvcm0ucG9zaXRpb24gPSBuZXcgRmlyZS5WZWMyKC01NzAgKyAoaSAqIDE2MCksIDI1KTtcbiAgICAgICAgICAgIHZhciBtZW51ID0gZW50LmdldENvbXBvbmVudCgnU2Vjb25kTWVudScpO1xuICAgICAgICAgICAgbWVudS5pbml0KCk7XG4gICAgICAgICAgICAvLyDlrZjlgqjlr7nosaFcbiAgICAgICAgICAgIHRoaXMuX21lbnVMaXN0LnB1c2gobWVudSk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIOWIt+aWsOWNleWTgeWutuWFt+iPnOWNleWIl+ihqFxuICAgIF9zaW5nbGVJdGVtc01lbnU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGRhdGFMaXN0ID0gdGhpcy5kYXRhQmFzZS5zaW5nbGVfU2Vjb25kX0RhdGFTaGVldHM7XG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBkYXRhTGlzdC5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgdmFyIGRhdGEgPSBkYXRhTGlzdFtpXTtcbiAgICAgICAgICAgIHZhciBtZW51ID0gdGhpcy5fbWVudUxpc3RbaV07XG4gICAgICAgICAgICBtZW51LmVudGl0eS50cmFuc2Zvcm0ucG9zaXRpb24gPSBuZXcgRmlyZS5WZWMyKC01NzAgKyAoaSAqIDE2MCksIDI1KTtcbiAgICAgICAgICAgIG1lbnUucmVmcmVzaChkYXRhLCB0aGlzLmJpbmRPcGVuVGhyZWVNZW51RXZlbnQpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyDliLfmlrDlpZfoo4Xlrrblhbfoj5zljZXliJfooahcbiAgICBfc3VpdEl0ZW1zTWVudTogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyDph43nva7mlbDmja5cbiAgICAgICAgdGhpcy5fcmVzZXRNZW51KCk7XG4gICAgICAgIC8vIOWmguaenOaAu+aVsOmHj+acieabtOaWsOWwsemHjeaWsOiuoeeul+acgOWkp+mhteaVsFxuICAgICAgICBpZiAodGhpcy5fY3VyVG90YWwgIT09IHRoaXMuZGF0YUJhc2Uuc3VpdEl0ZW1zX1RocmVlX1RvdGFsKSB7XG4gICAgICAgICAgICB0aGlzLl9jdXJUb3RhbCA9IHRoaXMuZGF0YUJhc2Uuc3VpdEl0ZW1zX1RocmVlX1RvdGFsO1xuICAgICAgICAgICAgdGhpcy5fbWF4UGFnZSA9IE1hdGguY2VpbCh0aGlzLl9jdXJUb3RhbCAvIHRoaXMuX3N1dGlJdGVtU2hvd1RvdGFsKTtcbiAgICAgICAgfVxuICAgICAgICAvLyDmmL7npLrlpZfoo4Xoj5zljZVcbiAgICAgICAgdmFyIGluZGV4ID0gMDtcbiAgICAgICAgdmFyIHN0YXJ0TnVtID0gKHRoaXMuX2N1clBhZ2UgLSAxKSAqIHRoaXMuX3N1dGlJdGVtU2hvd1RvdGFsO1xuICAgICAgICB2YXIgZW5kTnVtID0gc3RhcnROdW0gKyB0aGlzLl9zdXRpSXRlbVNob3dUb3RhbDtcbiAgICAgICAgaWYgKGVuZE51bSA+IHRoaXMuX2N1clRvdGFsKSB7XG4gICAgICAgICAgICBlbmROdW0gPSB0aGlzLl9jdXJUb3RhbDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgZGF0YUxpc3QgPSB0aGlzLmRhdGFCYXNlLnN1aXRJdGVtc19TZWNvbmRfRGF0YVNoZWV0cztcbiAgICAgICAgZm9yICh2YXIgaSA9IHN0YXJ0TnVtOyBpIDwgZW5kTnVtOyArK2kpIHtcbiAgICAgICAgICAgIHZhciBpdGVtcyA9IGRhdGFMaXN0W2ldO1xuICAgICAgICAgICAgdmFyIG1lbnUgPSB0aGlzLl9tZW51TGlzdFtpbmRleF07XG4gICAgICAgICAgICBtZW51LmVudGl0eS50cmFuc2Zvcm0ucG9zaXRpb24gPSBuZXcgRmlyZS5WZWMyKC01MDAgKyAoaW5kZXggKiAyNTApLCA2MCk7XG4gICAgICAgICAgICBtZW51LnJlZnJlc2hfc3VpdEl0ZW1zKGl0ZW1zLCB0aGlzLmJpbmRDcmVhdGVTdWl0SXRlbUV2ZW50KTtcbiAgICAgICAgICAgIGluZGV4Kys7XG4gICAgICAgIH1cbiAgICAgICAgLy8g5Yi35paw5oyJ6ZKu54q25oCBXG4gICAgICAgIHRoaXMuX3JlZnJlc2hCdG5TdGF0ZSgpO1xuICAgICAgICAvLyDliKTmlq3mmK/lkKbpnIDopoHpooTliqDovb3kuIvkuIDpobVcbiAgICAgICAgdmFyIGxlbiA9IHRoaXMuZGF0YUJhc2Uuc3VpdEl0ZW1zX1NlY29uZF9EYXRhU2hlZXRzLmxlbmd0aDtcbiAgICAgICAgaWYgKGxlbiA9PT0gdGhpcy5kYXRhQmFzZS5zdWl0SXRlbXNfVGhyZWVfVG90YWwpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyDpooTliqDovb1cbiAgICAgICAgLy92YXIgbmV4dFBhZ2UgPSB0aGlzLl9jdXJQYWdlICsgMTtcbiAgICAgICAgLy90aGlzLmRhdGFCYXNlLnByZWxvYWRTdWl0SXRlbXNEYXRhX1NlY29uZChuZXh0UGFnZSwgdGhpcy5fc3V0aUl0ZW1TaG93VG90YWwsIHRoaXMuYmluZFJlZnJlc2hTdWl0SXRlbXNNZW51KTtcbiAgICB9LFxuICAgIC8vIOWIt+aWsOeJqeWTgeafnOWIl+ihqFxuICAgIF9pdGVtc0NhYmluZXRNZW51OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIOmHjeaWsOWIt+aWsOS4i+i9veWQjueahOWbvueJh+aVsOaNrlxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciBsb2FkSW1hZ2VDYWxsQmFjayA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICB2YXIgbWVudSA9IHNlbGYuX21lbnVMaXN0W2RhdGEudGlkXTtcbiAgICAgICAgICAgIG1lbnUucmVmcmVzaChkYXRhLCBzZWxmLmJpbmRPcGVuVGhyZWVNZW51RXZlbnQpO1xuICAgICAgICB9O1xuICAgICAgICAvLyDliJ3lp4vljJbnianlk4Hmn5zmlbDmja5cbiAgICAgICAgdGhpcy5kYXRhQmFzZS5pbml0QmFja3BhY2tEYXRhKGxvYWRJbWFnZUNhbGxCYWNrKTtcbiAgICAgICAgLy9cbiAgICAgICAgdmFyIGRhdGFTaGVldHMgPSB0aGlzLmRhdGFCYXNlLmJhY2twYWNrX1NlY29uZF9EYXRhU2hlZXRzO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGFTaGVldHMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIHZhciBtZW51ID0gdGhpcy5fbWVudUxpc3RbaV07XG4gICAgICAgICAgICB2YXIgaXRlbXMgPSBkYXRhU2hlZXRzW2ldO1xuICAgICAgICAgICAgbWVudS5lbnRpdHkudHJhbnNmb3JtLnBvc2l0aW9uID0gbmV3IEZpcmUuVmVjMigtNTUwICsgKGkgKiAyMDApLCAyNSk7XG4gICAgICAgICAgICBtZW51LnJlZnJlc2goaXRlbXMsIHRoaXMuYmluZE9wZW5UaHJlZU1lbnVFdmVudCk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIOWIt+aWsOWNleWTgeiPnOWNlVxuICAgIF9yZWZyZXNoU2luZ2xlSXRlbXNNZW51OiBmdW5jdGlvbiAoaW5kZXgsIG1lbnVEYXRhKSB7XG4gICAgICAgIGlmICh0aGlzLl9jdXJUeXBlICE9PSAwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG1lbnUgPSB0aGlzLl9tZW51TGlzdFtpbmRleF07XG4gICAgICAgIGlmIChtZW51KSB7XG4gICAgICAgICAgICBtZW51LnJlZnJlc2gobWVudURhdGEsIHRoaXMuYmluZE9wZW5UaHJlZU1lbnVFdmVudCk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIOWIt+aWsOWll+ijheiPnOWNlVxuICAgIF9yZWZyZXNoU3VpdEl0ZW1zTWVudTogZnVuY3Rpb24gKHBhZ2UsIGluZGV4LCBtZW51RGF0YSkge1xuICAgICAgICBpZiAodGhpcy5fY3VyVHlwZSAhPT0gMSB8fCB0aGlzLl9jdXJQYWdlICE9PSBwYWdlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG1lbnUgPSB0aGlzLl9tZW51TGlzdFtpbmRleF07XG4gICAgICAgIGlmIChtZW51KSB7XG4gICAgICAgICAgICBtZW51LnJlZnJlc2hfc3VpdEl0ZW1zKG1lbnVEYXRhLCB0aGlzLmJpbmRDcmVhdGVTdWl0SXRlbUV2ZW50KTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy8g5Yi35paw5oyJ6ZKu54q25oCBXG4gICAgX3JlZnJlc2hCdG5TdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmJ0bl9MZWZ0LmFjdGl2ZSA9IHRoaXMuX2N1clBhZ2UgPiAxO1xuICAgICAgICB0aGlzLmJ0bl9SaWdodC5hY3RpdmUgPSB0aGlzLl9jdXJQYWdlIDwgdGhpcy5fbWF4UGFnZTtcbiAgICB9LFxuICAgIC8vIOS4iuS4gOmhtVxuICAgIF9vblByZXZpb3VzRXZlbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5fY3VyUGFnZSAtPSAxO1xuICAgICAgICBpZiAodGhpcy5fY3VyUGFnZSA8IDEpe1xuICAgICAgICAgICAgdGhpcy5fY3VyUGFnZSA9IDE7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fc3VpdEl0ZW1zTWVudSgpO1xuICAgIH0sXG4gICAgLy8g5LiL5LiA6aG1XG4gICAgX29uTmV4dEV2ZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuX2N1clBhZ2UgKz0gMTtcbiAgICAgICAgaWYgKHRoaXMuX2N1clBhZ2UgPiB0aGlzLl9tYXhQYWdlKXtcbiAgICAgICAgICAgIHRoaXMuX2N1clBhZ2UgPSB0aGlzLl9tYXhQYWdlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3N1aXRJdGVtc01lbnUoKTtcbiAgICB9LFxuICAgIC8vIOa/gOa0u+iPnOWNleaXtuinpuWPkeeahOS6i+S7tiAwOuWNleWTgSAxOuWll+ijhSAyOueJqeWTgeafnFxuICAgIG9wZW5NZW51OiBmdW5jdGlvbiAoaWQpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ+aJk+W8gElEOicgKyBpZCArIFwiICAgKDA65Y2V5ZOBIDE65aWX6KOFIDI654mp5ZOB5p+cKVwiKTtcbiAgICAgICAgLy9cbiAgICAgICAgdGhpcy5idG5fTGVmdC5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5idG5fUmlnaHQuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgIC8v6I635Y+W6I+c5Y2V5oyJ6ZKu5bm25LiU57uR5a6a5LqL5Lu2XG4gICAgICAgIHRoaXMuX2N1clR5cGUgPSBpZDtcbiAgICAgICAgdGhpcy5faW5pdE1lbnUoaWQpO1xuICAgICAgICB0aGlzLmRhdGFCYXNlLnRocmVlTWVudU1nci5jbG9zZU1lbnUoZmFsc2UpO1xuICAgICAgICB0aGlzLmVudGl0eS5hY3RpdmUgPSB0cnVlO1xuICAgIH0sXG4gICAgLy8g5byA5aeLXG4gICAgc3RhcnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8g5bi455So55qE5Y+Y6YePL+aVsOaNrlxuICAgICAgICB2YXIgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL0RhdGFCYXNlJyk7XG4gICAgICAgIHRoaXMuZGF0YUJhc2UgPSBlbnQuZ2V0Q29tcG9uZW50KCdEYXRhQmFzZScpO1xuICAgICAgICAvLyDojrflj5blhbPpl63mjInpkq7lubbnu5Hlrprkuovku7ZcbiAgICAgICAgZW50ID0gdGhpcy5lbnRpdHkuZmluZCgnYnRuX2Nsb3NlJyk7XG4gICAgICAgIHZhciBidG5DbG9zZSA9IGVudC5nZXRDb21wb25lbnQoJ1VJQnV0dG9uJyk7XG4gICAgICAgIGJ0bkNsb3NlLm9uQ2xpY2sgPSB0aGlzLl9vbkNsb3NlTWVudS5iaW5kKHRoaXMpO1xuICAgICAgICAvLyDkuIrkuIDpobVcbiAgICAgICAgdGhpcy5idG5fTGVmdCA9IHRoaXMuZW50aXR5LmZpbmQoJ2J0bl9sZWZ0Jyk7XG4gICAgICAgIHZhciBidG5MZWZ0ID0gdGhpcy5idG5fTGVmdC5nZXRDb21wb25lbnQoJ1VJQnV0dG9uJyk7XG4gICAgICAgIGJ0bkxlZnQub25DbGljayA9IHRoaXMuX29uUHJldmlvdXNFdmVudC5iaW5kKHRoaXMpO1xuICAgICAgICAvLyDkuIvkuIDpobVcbiAgICAgICAgdGhpcy5idG5fUmlnaHQgPSB0aGlzLmVudGl0eS5maW5kKCdidG5fcmlnaHQnKTtcbiAgICAgICAgdmFyIGJ0blJpZ2h0ID0gdGhpcy5idG5fUmlnaHQuZ2V0Q29tcG9uZW50KCdVSUJ1dHRvbicpO1xuICAgICAgICBidG5SaWdodC5vbkNsaWNrID0gdGhpcy5fb25OZXh0RXZlbnQuYmluZCh0aGlzKTtcbiAgICAgICAgLy9cbiAgICAgICAgdGhpcy5idG5fTGVmdC5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5idG5fUmlnaHQuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgIC8vIOmihOWKoOi9vSDljZXlk4FcbiAgICAgICAgdGhpcy5kYXRhQmFzZS5wcmVsb2FkU2luYWdsZUl0ZW1zRGF0YV9TZWNvbmQodGhpcy5iaW5kUmVmcmVzaFNpbmdsZUl0ZW1zTWVudSk7XG4gICAgICAgIC8vIOmihOWKoOi9vSDlpZfoo4VcbiAgICAgICAgdGhpcy5kYXRhQmFzZS5wcmVsb2FkU3VpdEl0ZW1zRGF0YV9TZWNvbmQoMSwgdGhpcy5fc3V0aUl0ZW1TaG93VG90YWwsIHRoaXMuYmluZFJlZnJlc2hTdWl0SXRlbXNNZW51KTtcbiAgICB9LFxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyDljLnphY1VSeWIhui+qOeOh1xuICAgICAgICAvL3ZhciBjYW1lcmEgPSBGaXJlLkNhbWVyYS5tYWluO1xuICAgICAgICAvL3ZhciBiZ1dvcmxkQm91bmRzID0gdGhpcy5kYXRhQmFzZS5iZ1JlbmRlci5nZXRXb3JsZEJvdW5kcygpO1xuICAgICAgICAvL3ZhciBiZ0xlZnRUb3BXb3JsZFBvcyA9IG5ldyBGaXJlLlZlYzIoYmdXb3JsZEJvdW5kcy54TWluLCBiZ1dvcmxkQm91bmRzLnlNaW4pO1xuICAgICAgICAvL3ZhciBiZ2xlZnRUb3AgPSBjYW1lcmEud29ybGRUb1NjcmVlbihiZ0xlZnRUb3BXb3JsZFBvcyk7XG4gICAgICAgIC8vdmFyIHNjcmVlblBvcyA9IG5ldyBGaXJlLlZlYzIoYmdsZWZ0VG9wLngsIGJnbGVmdFRvcC55KTtcbiAgICAgICAgLy92YXIgd29ybGRQb3MgPSBjYW1lcmEuc2NyZWVuVG9Xb3JsZChzY3JlZW5Qb3MpO1xuICAgICAgICAvL3RoaXMuZW50aXR5LnRyYW5zZm9ybS53b3JsZFBvc2l0aW9uID0gd29ybGRQb3M7XG4gICAgICAgIC8vIOWMuemFjVVJ5YiG6L6o546HXG4gICAgICAgIHZhciBjYW1lcmEgPSBGaXJlLkNhbWVyYS5tYWluO1xuICAgICAgICB2YXIgc2NyZWVuU2l6ZSA9IEZpcmUuU2NyZWVuLnNpemUubXVsKGNhbWVyYS5zaXplIC8gRmlyZS5TY3JlZW4uaGVpZ2h0KTtcbiAgICAgICAgdmFyIG5ld1BvcyA9IEZpcmUudjIodGhpcy5tYXJnaW4ueCwgLXNjcmVlblNpemUueSAvIDIgKyB0aGlzLm1hcmdpbi55KTtcbiAgICAgICAgdGhpcy5lbnRpdHkudHJhbnNmb3JtLnBvc2l0aW9uID0gbmV3UG9zO1xuICAgIH1cbn0pO1xuXG5GaXJlLl9SRnBvcCgpOyIsIkZpcmUuX1JGcHVzaChtb2R1bGUsICdhODBiMkk2Z05GUFg1UDAwRHY0UWNDdCcsICdTZWNvbmRNZW51Jyk7XG4vLyBzY3JpcHRcXHZpbGxhXFxTZWNvbmRNZW51LmpzXG5cbnZhciBTZWNvbmRNZW51ID0gRmlyZS5DbGFzcyh7XG4gICAgLy8g57un5om/XG4gICAgZXh0ZW5kczogRmlyZS5Db21wb25lbnQsXG4gICAgLy8g5p6E6YCg5Ye95pWwXG4gICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5fYnRuTWVudSA9IG51bGw7XG4gICAgICAgIHRoaXMuX3ByaWNlID0gbnVsbDtcbiAgICAgICAgdGhpcy5yb29tVHlwZSA9IDA7XG4gICAgICAgIHRoaXMudWlkID0gMDtcbiAgICAgICAgdGhpcy5wcmljZSA9IDA7XG4gICAgICAgIC8vIOaKmOaJo1xuICAgICAgICB0aGlzLmRpc2NvdW50ID0gMTtcbiAgICAgICAgdGhpcy5zbWFsbFNwcml0ZSA9IG51bGw7XG4gICAgfSxcbiAgICAvLyDlsZ7mgKdcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIC8vIOW9k+WJjeexu+Wei0lE55So5LqO5ZCR5pyN5Yqh5Zmo6K+35rGC5pWw5o2uXG4gICAgICAgIHRpZDogMCxcbiAgICAgICAgdG5hbWU6ICcnLFxuICAgICAgICBoYXNEcmFnOiBmYWxzZSxcbiAgICAgICAgLy8g6buY6K6k5Zu+54mHXG4gICAgICAgIGRlZmF1bHRTcHJpdGU6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlNwcml0ZVxuICAgICAgICB9LFxuICAgICAgICBkZWZhdWx0TG9hZEFuaW06IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLkFuaW1hdGlvblxuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyDph43nva7oj5zljZVcbiAgICByZXNldE1lbnU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy50aWQgPSAwO1xuICAgICAgICB0aGlzLmhhc0RyYWcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy50bmFtZSA9ICfovb3lhaXkuK0nO1xuICAgICAgICB0aGlzLl9idG5NZW51LnNldFRleHQoJ+i9veWFpeS4rScpO1xuICAgICAgICB0aGlzLl9idG5NZW51LnNldFNwcml0ZSh0aGlzLmRlZmF1bHRTcHJpdGUpO1xuICAgICAgICB0aGlzLl9idG5NZW51LnNldEN1c3RvbVNpemUoLTEsIC0xKTtcbiAgICAgICAgdGhpcy5fYnRuTWVudS5vbkNsaWNrID0gbnVsbDtcbiAgICAgICAgdGhpcy5fcHJpY2UuZW50aXR5LmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcbiAgICB9LFxuICAgIC8vIOiuvue9ruaWh+Wtl1xuICAgIHNldFRleHQ6IGZ1bmN0aW9uICh0ZXh0KSB7XG4gICAgICAgIHRoaXMudG5hbWUgPSB0ZXh0O1xuICAgICAgICB0aGlzLl9idG5NZW51LnNldFRleHQodGV4dCk7XG4gICAgfSxcbiAgICAvLyDorr7nva7ku7fmoLxcbiAgICBzZXRQcmljZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHRoaXMucHJpY2UgPSB2YWx1ZTtcbiAgICAgICAgdGhpcy5fcHJpY2UudGV4dCA9IHZhbHVlO1xuICAgICAgICB0aGlzLl9wcmljZS5lbnRpdHkuYWN0aXZlID0gdHJ1ZTtcbiAgICB9LFxuICAgIC8vIOiuvue9ruWbvueJh1xuICAgIHNldFNwcml0ZTogZnVuY3Rpb24gKHNwcml0ZSwgZXZlbnQpIHtcbiAgICAgICAgaWYgKCEgc3ByaXRlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zbWFsbFNwcml0ZSA9IHNwcml0ZTtcbiAgICAgICAgdGhpcy5fYnRuTWVudS5zZXRTcHJpdGUoc3ByaXRlKTtcbiAgICAgICAgaWYgKHNwcml0ZS53aWR0aCA+IDEzMCkge1xuICAgICAgICAgICAgdGhpcy5fYnRuTWVudS5zZXRDdXN0b21TaXplKDEyMCwgMTIwKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZXZlbnQpIHtcbiAgICAgICAgICAgIHRoaXMuX2J0bk1lbnUub25DbGljayA9IGV2ZW50O1xuICAgICAgICB9XG4gICAgfSxcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIOW4uOeUqOeahOWPmOmHjy/mlbDmja5cbiAgICAgICAgdmFyIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9EYXRhQmFzZScpO1xuICAgICAgICB0aGlzLmRhdGFCYXNlID0gZW50LmdldENvbXBvbmVudCgnRGF0YUJhc2UnKTtcbiAgICAgICAgLy9cbiAgICAgICAgZW50ID0gdGhpcy5lbnRpdHkuZmluZCgnYnRuX01lbnUnKTtcbiAgICAgICAgdGhpcy5fYnRuTWVudSA9IGVudC5nZXRDb21wb25lbnQoJ1VJQnV0dG9uJyk7XG4gICAgICAgIGVudCA9IHRoaXMuZW50aXR5LmZpbmQoJ3ByaWNlJyk7XG4gICAgICAgIHRoaXMuX3ByaWNlID0gZW50LmdldENvbXBvbmVudChGaXJlLlRleHQpO1xuICAgICAgICAvL1xuICAgICAgICB2YXIgc3RhdGUgPSB0aGlzLmRlZmF1bHRMb2FkQW5pbS5wbGF5KCdsb2FkaW5nJyk7XG4gICAgICAgIHN0YXRlLndyYXBNb2RlID0gRmlyZS5XcmFwTW9kZS5Mb29wO1xuICAgICAgICBzdGF0ZS5yZXBlYXRDb3VudCA9IEluZmluaXR5O1xuICAgIH0sXG4gICAgLy8g5Yi35paw5Y2V5ZOBIC8g54mp5ZOB5p+cXG4gICAgcmVmcmVzaDogZnVuY3Rpb24gKGRhdGEsIGV2ZW50KSB7XG4gICAgICAgIHRoaXMucmVzZXRNZW51KCk7XG5cbiAgICAgICAgdGhpcy5lbnRpdHkuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5fYnRuTWVudS5lbnRpdHkuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuZGVmYXVsdExvYWRBbmltLmVudGl0eS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICB0aGlzLmRlZmF1bHRMb2FkQW5pbS5wbGF5KCdsb2FkaW5nJyk7XG4gICAgICAgIGlmIChkYXRhKSB7XG4gICAgICAgICAgICB0aGlzLnRpZCA9IGRhdGEudGlkO1xuICAgICAgICAgICAgdGhpcy5oYXNEcmFnID0gZGF0YS5pc2RyYWcgPCAyO1xuICAgICAgICAgICAgdGhpcy5zZXRUZXh0KGRhdGEudG5hbWUpO1xuICAgICAgICAgICAgdGhpcy5lbnRpdHkubmFtZSA9IGRhdGEudGlkO1xuICAgICAgICAgICAgdGhpcy5lbnRpdHkuYWN0aXZlID0gdHJ1ZTtcblxuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAgICAgaWYgKGRhdGEubG9jYWxQYXRoKSB7XG4gICAgICAgICAgICAgICAgRmlyZS5SZXNvdXJjZXMubG9hZChkYXRhLmxvY2FsUGF0aCwgZnVuY3Rpb24gKGVycm9yLCBzcHJpdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgc2VsZi5zZXRTcHJpdGUoc3ByaXRlLCBldmVudCk7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX2J0bk1lbnUuZW50aXR5LmFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZGVmYXVsdExvYWRBbmltLmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UubG9hZEltYWdlKGRhdGEudXJsIHx8IGRhdGEuaW1hZ2VVcmwsIGZ1bmN0aW9uIChkYXRhLCBlcnJvciwgaW1hZ2UpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoc2VsZi50aWQgIT09IGRhdGEudGlkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIHNwcml0ZSA9IG5ldyBGaXJlLlNwcml0ZShpbWFnZSk7XG4gICAgICAgICAgICAgICAgc2VsZi5zZXRTcHJpdGUoc3ByaXRlLCBldmVudCk7XG4gICAgICAgICAgICAgICAgc2VsZi5fYnRuTWVudS5lbnRpdHkuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBzZWxmLmRlZmF1bHRMb2FkQW5pbS5lbnRpdHkuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgICAgICB9LmJpbmQodGhpcywgZGF0YSkpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyDliLfmlrDlpZfoo4VcbiAgICByZWZyZXNoX3N1aXRJdGVtczogZnVuY3Rpb24gKGRhdGEsIGV2ZW50KSB7XG4gICAgICAgIHRoaXMucmVzZXRNZW51KCk7XG5cbiAgICAgICAgdGhpcy5lbnRpdHkuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5fYnRuTWVudS5lbnRpdHkuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuZGVmYXVsdExvYWRBbmltLmVudGl0eS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICB0aGlzLmRlZmF1bHRMb2FkQW5pbS5wbGF5KCdsb2FkaW5nJyk7XG5cbiAgICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgICAgIHRoaXMudGlkID0gZGF0YS50aWQ7XG4gICAgICAgICAgICB0aGlzLnVpZCA9IGRhdGEudWlkO1xuICAgICAgICAgICAgdGhpcy5zZXRUZXh0KGRhdGEudG5hbWUpO1xuICAgICAgICAgICAgdGhpcy5yb29tVHlwZSA9IGRhdGEucm9vbVR5cGU7XG4gICAgICAgICAgICB0aGlzLnNldFByaWNlKGRhdGEucHJpY2UpO1xuICAgICAgICAgICAgdGhpcy5lbnRpdHkubmFtZSA9IGRhdGEudGlkO1xuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UubG9hZEltYWdlKGRhdGEuaW1hZ2VVcmwsIGZ1bmN0aW9uIChkYXRhLCBlcnJvciwgaW1hZ2UpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoc2VsZi50aWQgIT09IGRhdGEudGlkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIHNwcml0ZSA9IG5ldyBGaXJlLlNwcml0ZShpbWFnZSk7XG4gICAgICAgICAgICAgICAgc2VsZi5zZXRTcHJpdGUoc3ByaXRlLCBldmVudCk7XG4gICAgICAgICAgICAgICAgc2VsZi5fYnRuTWVudS5lbnRpdHkuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBzZWxmLmRlZmF1bHRMb2FkQW5pbS5lbnRpdHkuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgICAgICB9LmJpbmQodGhpcywgZGF0YSkpO1xuICAgICAgICB9XG4gICAgfVxufSk7XG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJzQwYzYzczNpN3hJR3BqMHduWHpWc2VzJywgJ1NlcnZlck5ldFdvcmsnKTtcbi8vIHNjcmlwdFxcb3V0ZG9vclxcU2VydmVyTmV0V29yay5qc1xuXG4vLyDot5/mnI3liqHlmajov5vooYzlr7nmjqVcbnZhciBTZXJ2ZXJOZXRXb3JrID0gRmlyZS5DbGFzcyh7XG4gICAgLy8g57un5om/XG4gICAgZXh0ZW5kczogRmlyZS5Db21wb25lbnQsXG4gICAgLy8g5p6E6YCg5Ye95pWwXG4gICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8g5b2T5YmN6K+35rGC5pWw5o2uXG4gICAgICAgIHRoaXMuX3Bvc3REYXRhID0ge307XG4gICAgICAgIC8vIOaWree6v+mHjei/nueql+WPo1xuICAgICAgICB0aGlzLm5ldFdvcmtXaW4gPSBudWxsO1xuICAgICAgICAvLyDnlKjkuo7mtYvor5XnmoR0b2tlbuaVsOaNrlxuICAgICAgICB0aGlzLnRva2VuID0gJyc7XG4gICAgfSxcbiAgICAvLyDlsZ7mgKdcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIGxvY2FsVGVzdDogZmFsc2VcbiAgICB9LFxuXG4gICAgLy8g6I635Y+W55So5oi35L+h5oGvXG4gICAgZ2V0VG9LZW5WYWx1ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5sb2NhbFRlc3QpIHtcbiAgICAgICAgICAgIHRoaXMudG9rZW4gPSAnTVRBd01UUTVNalk0TlY4eVlqRXlaalkxT1Raak1qUXhOakJsWW1Jd01UWTFPVEEyTURrMVkySTFORjh4TkRNNE1EYzFNemMxWDNkaGNGOHhNREF4TkRreU5qZzEnO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy50b2tlbiA9IHRoaXMuZ2V0UXVlcnlTdHJpbmcoJ3Rva2VuJyk7XG4gICAgICAgICAgICBpZiAoIXRoaXMudG9rZW4pIHtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKFwi5rKh5pyJ55So5oi35L+h5oGvLCBUb0tlbiBpcyBudWxsXCIpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuICAgIC8vIOeUqEpT6I635Y+W5Zyw5Z2A5qCP5Y+C5pWw55qE5pa55rOVXG4gICAgZ2V0UXVlcnlTdHJpbmc6IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgICAgIHZhciByZWcgPSBuZXcgUmVnRXhwKFwiKF58JilcIiArIG5hbWUgKyBcIj0oW14mXSopKCZ8JClcIik7XG4gICAgICAgIHZhciByID0gd2luZG93LmxvY2F0aW9uLnNlYXJjaC5zdWJzdHIoMSkubWF0Y2gocmVnKTtcbiAgICAgICAgaWYgKHIgIT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiB1bmVzY2FwZShyWzJdKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9LFxuICAgIC8vIOivt+axguWksei0pVxuICAgIF9lcnJvckNhbGxCYWNrOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdGhpcy5uZXRXb3JrV2luLm9wZW5XaW5kb3coZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2VsZi5zZW5kRGF0YShzZWxmLl9wb3N0RGF0YSk7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLy8g5Y+R6YCB5pWw5o2uXG4gICAgc2VuZERhdGE6IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIGlmICghRmlyZS5FbmdpbmUuaXNQbGF5aW5nKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLmdldFRvS2VuVmFsdWUoKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vdGhpcy5kYXRhQmFzZS5sb2FkVGlwcy5vcGVuVGlwcygn6K+35rGC5Lit77yM6K+356iN5ZCOLi4uJyk7XG4gICAgICAgIHRoaXMuX3Bvc3REYXRhID0gZGF0YTtcbiAgICAgICAgdGhpcy5qUXVlcnlBamF4KGRhdGEudXJsLCBkYXRhLnNlbmREYXRhLCBkYXRhLmNiLCBkYXRhLmVyckNiKTtcbiAgICB9LFxuICAgIC8vIOWPkemAgea2iOaBr1xuICAgIGpRdWVyeUFqYXg6IGZ1bmN0aW9uIChzdHJVcmwsIGRhdGEsIGNhbGxCYWNrLCBlcnJvckNhbGxCYWNrKSB7XG4gICAgICAgIHZhciBwYXJhbXMgPSBcIlwiO1xuICAgICAgICBpZiAodHlwZW9mKGRhdGEpICE9PSBcIm9iamVjdFwiKSB7XG4gICAgICAgICAgICBwYXJhbXMgPSBkYXRhICsgXCImdG9rZW49XCIgKyB0aGlzLnRva2VuO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZm9yICh2YXIga2V5IGluIGRhdGEpIHtcbiAgICAgICAgICAgICAgICBwYXJhbXMgKz0gKGtleSArIFwiPVwiICsgZGF0YVtrZXldICsgXCImXCIgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYXJhbXMgKz0gXCImdG9rZW49XCIgKyB0aGlzLnRva2VuO1xuICAgICAgICB9XG4gICAgICAgIHZhciBzZW5kID0ge1xuICAgICAgICAgICAgdHlwZTogXCJQT1NUXCIsXG4gICAgICAgICAgICB1cmw6IHN0clVybCArIFwiPyZqc29uY2FsbFBQPT9cIixcbiAgICAgICAgICAgIGRhdGE6IHBhcmFtcyxcbiAgICAgICAgICAgIGRhdGFUeXBlOiAnanNvbnAnLFxuICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICBpZiAoIUZpcmUuRW5naW5lLmlzUGxheWluZykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChjYWxsQmFjaykge1xuICAgICAgICAgICAgICAgICAgICBjYWxsQmFjayhkYXRhKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uIChYTUxIdHRwUmVxdWVzdCwgdGV4dFN0YXR1cywgZXJyb3JUaHJvd24pIHtcbiAgICAgICAgICAgICAgICBpZiAoIUZpcmUuRW5naW5lLmlzUGxheWluZykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChlcnJvckNhbGxCYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIGVycm9yQ2FsbEJhY2soKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JUaHJvd24pO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFhNTEh0dHBSZXF1ZXN0KTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0ZXh0U3RhdHVzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgalF1ZXJ5LmFqYXgoc2VuZCk7XG4gICAgfSxcbiAgICAvLyDliJ3lp4vljJblpJbmma/mlbDmja5cbiAgICBJbml0T3V0ZG9vcjogZnVuY3Rpb24gKHNlbmREYXRhLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgcG9zdERhdGEgPSB7XG4gICAgICAgICAgICB1cmw6IFwiaHR0cDovL20uc2Fpa2UuY29tL3N1aXRkcmVzcy9icm93c2VTY2VuZS5odG1sXCIsXG4gICAgICAgICAgICBzZW5kRGF0YToge1xuICAgICAgICAgICAgICAgIGRyZXNzX3R5cGU6IHNlbmREYXRhLmRyZXNzX3R5cGVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjYjogY2FsbGJhY2ssXG4gICAgICAgICAgICBlcnJDYjogdGhpcy5fZXJyb3JDYWxsQmFjay5iaW5kKHRoaXMpXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuc2VuZERhdGEocG9zdERhdGEpO1xuICAgIH0sXG4gICAgLy8g5qW85bGC5YiX6KGoXG4gICAgUmVxdWVzdEZsb29yTGlzdDogZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBwb3N0RGF0YSA9IHtcbiAgICAgICAgICAgIHVybDogXCJodHRwOi8vbS5zYWlrZS5jb20vc3VpdGRyZXNzL2Zsb29yTGlzdC5odG1sXCIsXG4gICAgICAgICAgICBzZW5kRGF0YToge30sXG4gICAgICAgICAgICBjYjogY2FsbGJhY2ssXG4gICAgICAgICAgICBlcnJDYjogdGhpcy5fZXJyb3JDYWxsQmFjay5iaW5kKHRoaXMpXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuc2VuZERhdGEocG9zdERhdGEpO1xuICAgIH0sXG4gICAgLy8g6I635Y+W5bmz6Z2i5Zu+XG4gICAgUmVxdWVzdFBsYW46IGZ1bmN0aW9uIChzZW5kRGF0YSwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHBvc3REYXRhID0ge1xuICAgICAgICAgICAgdXJsOiBcImh0dHA6Ly9tLnNhaWtlLmNvbS9zdWl0ZHJlc3Mvc2hvd0NvdmVyLmh0bWxcIixcbiAgICAgICAgICAgIHNlbmREYXRhOiB7XG4gICAgICAgICAgICAgICAgaG91c2VfdWlkOiBzZW5kRGF0YS5ob3VzZV91aWQsXG4gICAgICAgICAgICAgICAgZmxvb3JfaWQ6IHNlbmREYXRhLmZsb29yX2lkLFxuICAgICAgICAgICAgICAgIG1hcms6IHNlbmREYXRhLm1hcmtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjYjogY2FsbGJhY2ssXG4gICAgICAgICAgICBlcnJDYjogdGhpcy5fZXJyb3JDYWxsQmFjay5iaW5kKHRoaXMpXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuc2VuZERhdGEocG9zdERhdGEpO1xuICAgIH0sXG4gICAgLy8g6Kej6Zmk5YWz57O7XG4gICAgUmVxdWVzdERpc2Fzc29jaWF0ZUxpc3Q6IGZ1bmN0aW9uIChzZW5kRGF0YSwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHBvc3REYXRhID0ge1xuICAgICAgICAgICAgdXJsOiBcImh0dHA6Ly9tLnNhaWtlLmNvbS9zdWl0ZHJlc3MvcmVsZWFzZVJlbGF0aW9uLmh0bWxcIixcbiAgICAgICAgICAgIHNlbmREYXRhOiBzZW5kRGF0YSxcbiAgICAgICAgICAgIGNiOiBjYWxsYmFjayxcbiAgICAgICAgICAgIGVyckNiOiB0aGlzLl9lcnJvckNhbGxCYWNrLmJpbmQodGhpcylcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5zZW5kRGF0YShwb3N0RGF0YSk7XG4gICAgfSxcbiAgICAvLyDlvIDlp4vml7ZcbiAgICBzdGFydDogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyDph43mlrDor7fmsYLmnI3liqHlmajnqpflj6NcbiAgICAgICAgdmFyIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9UaXBfTmV0V29yaycpO1xuICAgICAgICB0aGlzLm5ldFdvcmtXaW4gPSBlbnQuZ2V0Q29tcG9uZW50KCdOZXdXb3JrV2luZG93Jyk7XG4gICAgfVxufSk7XG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJ2VmNmExQ09sVzFFYmEvK1RiSlhDU1hKJywgJ1N1Yk1lbnUnKTtcbi8vIHNjcmlwdFxcb3V0ZG9vclxcU3ViTWVudS5qc1xuXG52YXIgU3ViTWVudSA9IEZpcmUuQ2xhc3Moe1xuICAgIC8vIOe7p+aJv1xuICAgIGV4dGVuZHM6IEZpcmUuQ29tcG9uZW50LFxuICAgIC8vIOaehOmAoOWHveaVsFxuICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuY3VyVHlwZSA9IDE7XG4gICAgfSxcbiAgICAvLyDlsZ7mgKdcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIG9mZnNldDogbmV3IEZpcmUuVmVjMigwLCAxNTApLFxuICAgICAgICBidG5fRHJlc3NVcDoge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVUlCdXR0b25cbiAgICAgICAgfSxcbiAgICAgICAgYnRuX0ludGVyYWN0aXZlRmFtaWx5OiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5VSUJ1dHRvblxuICAgICAgICB9LFxuICAgICAgICBidG5fR29Ub0luZG9vcjoge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVUlCdXR0b25cbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy8g5byA5aeLXG4gICAgc3RhcnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8g5bi455So55qE5Y+Y6YePL+aVsOaNrlxuICAgICAgICB2YXIgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL09EYXRhQmFzZScpO1xuICAgICAgICB0aGlzLm9kYXRhQmFzZSA9IGVudC5nZXRDb21wb25lbnQoJ09EYXRhQmFzZScpO1xuXG4gICAgICAgIHRoaXMuYnRuX0RyZXNzVXAub25DbGljayA9IHRoaXMub25EcmVzc1VwRXZlbnQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5idG5fSW50ZXJhY3RpdmVGYW1pbHkub25DbGljayA9IHRoaXMub25JbnRlcmFjdGl2ZUZhbWlseUV2ZW50LmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuYnRuX0dvVG9JbmRvb3Iub25DbGljayA9IHRoaXMub25Hb1RvSW5kb29yRXZlbnQuYmluZCh0aGlzKTtcbiAgICB9LFxuXG4gICAgLy8gdHlwZTog5Y2V6Lqr5YWs5a+TXG4gICAgb3BlblN1Yk1lbnU6IGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgICAgIHRoaXMuY3VyVHlwZSA9IHR5cGU7XG4gICAgICAgIHRoaXMuZW50aXR5LmFjdGl2ZSA9IHRydWU7XG4gICAgICAgIHRoaXMuYnRuX0ludGVyYWN0aXZlRmFtaWx5LmVudGl0eS5hY3RpdmUgPSB0eXBlICE9PSAxO1xuICAgIH0sXG5cbiAgICBjaGFuZ2VyU2NyZWVuOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLmN1clR5cGUgPT09IDEpIHtcbiAgICAgICAgICAgIEZpcmUuRW5naW5lLmxvYWRTY2VuZSgnc2luZ2xlJyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZXtcbiAgICAgICAgICAgIEZpcmUuRW5naW5lLmxvYWRTY2VuZSgndmlsbGEnKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyDmiJHopoHoo4Xmia5cbiAgICBvbkRyZXNzVXBFdmVudDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLm9kYXRhQmFzZS5nbG9iYWxEYXRhLmdvdG9UeXBlID0gMTtcbiAgICAgICAgdGhpcy5jaGFuZ2VyU2NyZWVuKCk7XG4gICAgfSxcbiAgICAvLyDlrrbkurrkupLliqhcbiAgICBvbkludGVyYWN0aXZlRmFtaWx5RXZlbnQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIH0sXG4gICAgLy8g6L+b5YWl5a6k5YaFXG4gICAgb25Hb1RvSW5kb29yRXZlbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5vZGF0YUJhc2UuZ2xvYmFsRGF0YS5nb3RvVHlwZSA9IDI7XG4gICAgICAgIHRoaXMuY2hhbmdlclNjcmVlbigpO1xuICAgIH0sXG4gICAgLy8g5pu05pawXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIOWMuemFjVVJ5YiG6L6o546HXG4gICAgICAgIHZhciBjYW1lcmEgPSBGaXJlLkNhbWVyYS5tYWluO1xuICAgICAgICB2YXIgYmdXb3JsZEJvdW5kcyA9IHRoaXMub2RhdGFCYXNlLmJnUmVuZGVyLmdldFdvcmxkQm91bmRzKCk7XG4gICAgICAgIHZhciBiZ0xlZnRUb3BXb3JsZFBvcyA9IG5ldyBGaXJlLlZlYzIoMCwgYmdXb3JsZEJvdW5kcy55TWluICsgdGhpcy5vZmZzZXQueSk7XG4gICAgICAgIHZhciBiZ2xlZnRUb3AgPSBjYW1lcmEud29ybGRUb1NjcmVlbihiZ0xlZnRUb3BXb3JsZFBvcyk7XG4gICAgICAgIHZhciBzY3JlZW5Qb3MgPSBuZXcgRmlyZS5WZWMyKGJnbGVmdFRvcC54LCBiZ2xlZnRUb3AueSk7XG4gICAgICAgIHZhciB3b3JsZFBvcyA9IGNhbWVyYS5zY3JlZW5Ub1dvcmxkKHNjcmVlblBvcyk7XG4gICAgICAgIHRoaXMuZW50aXR5LnRyYW5zZm9ybS53b3JsZFBvc2l0aW9uID0gd29ybGRQb3M7XG4gICAgfVxufSk7XG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJ2MxMGYwQjZsR1pLZTVkYjNQTE11b1NrJywgJ1N3aXRjaFJvb21XaW5kb3cnKTtcbi8vIHNjcmlwdFxcdmlsbGFcXFN3aXRjaFJvb21XaW5kb3cuanNcblxuLy9cclxudmFyIFN3aXRjaFJvb21XaW5kb3cgPSBGaXJlLkNsYXNzKHtcclxuICAgIC8vIOe7p+aJv1xyXG4gICAgZXh0ZW5kczogRmlyZS5Db21wb25lbnQsXHJcbiAgICAvLyDmnoTpgKDlh73mlbBcclxuICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5lbnRyYW5jZVR5cGUgPSAwO1xyXG4gICAgfSxcclxuICAgIC8vIOWxnuaAp1xyXG4gICAgcHJvcGVydGllczoge1xyXG4gICAgICAgIHJvb3Q6IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5FbnRpdHlcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJvb21OYW1lOiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVGV4dFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcm9vbUxldmVsOiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVGV4dFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcm9vbU51bToge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlRleHRcclxuICAgICAgICB9LFxyXG4gICAgICAgIGJ0bl9jbG9zZToge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlVJQnV0dG9uXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIOmHjee9rueql+WPo1xyXG4gICAgcmVzZXRXaW5kb3c6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLnJvb21OYW1lLnRleHQgPSAnKOWIq+WiheWQjeensCknO1xyXG4gICAgICAgIHRoaXMucm9vbUxldmVsLnRleHQgPSAn5qGj5qyh77ya4piF4piF4piF4piF4piF4piFJztcclxuICAgICAgICB0aGlzLnJvb21OdW0udGV4dCA9ICflhbE45Liq5oi/6Ze0JztcclxuICAgIH0sXHJcbiAgICAvLyDmiZPlvIDnqpflj6NcclxuICAgIC8vIHR5cGU6IOmCo+S4qui3r+WPo+i/m+WFpeW5s+mdouWbvueahFxyXG4gICAgLy8gMCwg5YiH5o2i5oi/6Ze0IDHvvJrliIfmjaLmpbzlh7pcclxuICAgIG9wZW5XaW5kb3c6IGZ1bmN0aW9uICh0eXBlLCBzZW5kRGF0YSkge1xyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICBzZWxmLmVudGl0eS5hY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgIHNlbGYuZW50cmFuY2VUeXBlID0gdHlwZTtcclxuICAgICAgICBzZWxmLl9yZW1vdmVTd2l0Y2hSb29tKCk7XHJcbiAgICAgICAgdmFyIGxvYWNsRGF0YSA9IHNlbGYucGxhbkxpc3Rbc2VuZERhdGEubWFya107XHJcbiAgICAgICAgaWYgKGxvYWNsRGF0YSkge1xyXG4gICAgICAgICAgICBzZWxmLmRhdGFCYXNlLm1hcmsgPSBzZW5kRGF0YS5tYXJrO1xyXG4gICAgICAgICAgICBzZWxmLmNyZWF0ZVBsYW4obG9hY2xEYXRhKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UubG9hZFRpcHMub3BlblRpcHMoJ+i9veWFpeW5s+mdouWbvuaVsOaNru+8geivt+eojeWQji4uLicpO1xyXG4gICAgICAgICAgICBzZWxmLmRhdGFCYXNlLm5ldFdvcmtNZ3IuUmVxdWVzdFBsYW4oc2VuZERhdGEsIGZ1bmN0aW9uIChzZXJ2ZXJEYXRhKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmRhdGFCYXNlLmxvYWRUaXBzLmNsb3NlVGlwcygpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHNlcnZlckRhdGEuc3RhdHVzID09PSAxMDAwNikge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UubG9hZFRpcHMuY2xvc2VUaXBzKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBzZWxmLnBsYW5MaXN0W3NlbmREYXRhLm1hcmtdID0gc2VydmVyRGF0YTtcclxuICAgICAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UubWFyayA9IHNlbmREYXRhLm1hcms7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmNyZWF0ZVBsYW4oc2VydmVyRGF0YSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvLyDlhbPpl63nqpflj6NcclxuICAgIGNsb3NlV2luZG93OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5lbnRpdHkuYWN0aXZlID0gZmFsc2U7XHJcbiAgICB9LFxyXG4gICAgLy8g57uY5Yi25pif57qnXHJcbiAgICBnZXRTdGFyczogZnVuY3Rpb24gKGdyYWRlKSB7XHJcbiAgICAgICAgdmFyIHN0ciA9ICfmoaPmrKHvvJonO1xyXG4gICAgICAgIGlmIChncmFkZSA9PT0gMTIpIHtcclxuICAgICAgICAgICAgc3RyICs9ICfoh7PlsIrlrp0nO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBncmFkZSAtIDE7ICsraSkge1xyXG4gICAgICAgICAgICAgICAgc3RyICs9ICfimIUnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzdHI7XHJcbiAgICB9LFxyXG4gICAgLy8g5Yib5bu65bmz6Z2i5Zu+XHJcbiAgICBjcmVhdGVQbGFuOiBmdW5jdGlvbiAoc2VydmVyRGF0YSkge1xyXG4gICAgICAgIGlmICghIHNlcnZlckRhdGEubGlzdCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIOWDj+acjeWKoeWZqOivt+axguW5s+mdouWbvuaVsOaNrlxyXG4gICAgICAgIHRoaXMucm9vbU5hbWUudGV4dCA9IHNlcnZlckRhdGEuZmxvb3JfbmFtZTtcclxuICAgICAgICB0aGlzLnJvb21MZXZlbC50ZXh0ID0gdGhpcy5nZXRTdGFycyhzZXJ2ZXJEYXRhLmZsb29yX2dyYWRlKTtcclxuICAgICAgICB0aGlzLnJvb21OdW0udGV4dCA9ICflhbEnKyBzZXJ2ZXJEYXRhLmxpc3QubGVuZ3RoICsgJ+S4quaIv+mXtCc7XHJcbiAgICAgICAgdGhpcy5iaW5kR29Ub1Jvb21FdmVudCA9IHRoaXMuX29uR290b1Jvb21FdmVudC5iaW5kKHRoaXMpO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2VydmVyRGF0YS5saXN0Lmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgIHZhciBkYXRhID0gc2VydmVyRGF0YS5saXN0W2ldO1xyXG4gICAgICAgICAgICB2YXIgZW50ID0gRmlyZS5pbnN0YW50aWF0ZSh0aGlzLmRhdGFCYXNlLnRlbXBQbGFuKTtcclxuICAgICAgICAgICAgZW50LmFjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgICAgIGVudC5wYXJlbnQgPSB0aGlzLnJvb3Q7XHJcbiAgICAgICAgICAgIHZhciBidG4gPSBlbnQuZ2V0Q29tcG9uZW50KEZpcmUuVUlCdXR0b24pO1xyXG4gICAgICAgICAgICBidG4ubWFyayA9IGRhdGEubWFyaztcclxuICAgICAgICAgICAgdGhpcy5kYXRhQmFzZS5sb2FkSW1hZ2UoZGF0YS5pbWd1cmwsIGZ1bmN0aW9uIChidG4sIGVycm9yLCBpbWFnZSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHNwcml0ZSA9IG5ldyBGaXJlLlNwcml0ZShpbWFnZSk7XHJcbiAgICAgICAgICAgICAgICBzcHJpdGUucGl4ZWxMZXZlbEhpdFRlc3QgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgYnRuLnNldFNwcml0ZShzcHJpdGUpO1xyXG4gICAgICAgICAgICAgICAgYnRuLm9uQ2xpY2sgPSB0aGlzLmJpbmRHb1RvUm9vbUV2ZW50O1xyXG4gICAgICAgICAgICB9LmJpbmQodGhpcywgYnRuKSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIOi/m+WFpeaIv+mXtFxyXG4gICAgX29uR290b1Jvb21FdmVudDogZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgICAgdmFyIGJ0biA9IGV2ZW50LnRhcmdldC5nZXRDb21wb25lbnQoRmlyZS5VSUJ1dHRvbik7XHJcbiAgICAgICAgdmFyIHNlbmREYXRhID0ge1xyXG4gICAgICAgICAgICBtYXJrOiBidG4ubWFyayxcclxuICAgICAgICAgICAgaG91c2VfdWlkOiAwXHJcbiAgICAgICAgfTtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgc2VsZi5kYXRhQmFzZS5sb2FkVGlwcy5vcGVuVGlwcygn6L295YWl5oi/6Ze05pWw5o2u77yB6K+356iN5ZCOLi4uJyk7XHJcbiAgICAgICAgc2VsZi5kYXRhQmFzZS5pbnRvUm9vbShzZW5kRGF0YSwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBzZWxmLmRhdGFCYXNlLmxvYWRUaXBzLmNsb3NlVGlwcygpO1xyXG4gICAgICAgICAgICBzZWxmLmNsb3NlV2luZG93KCk7XHJcbiAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UuZmlyc3RNZW51TWdyLmNsb3NlTWVudSgpO1xyXG5cclxuICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS51cGRhdGVDaGFyYWN0ZXJzKCk7XHJcbiAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UuY2hhcmFjdGVycy5lbnRpdHkuYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICAvLyDmuIXnqbrmiL/pl7RcclxuICAgIF9yZW1vdmVTd2l0Y2hSb29tOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIGNoaWxkcmVuID0gdGhpcy5yb290LmdldENoaWxkcmVuKCk7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7aSA8IGNoaWxkcmVuLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgIGNoaWxkcmVuW2ldLmRlc3Ryb3koKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8g5YWz6Zet5oyJ6ZKu5LqL5Lu2XHJcbiAgICBfb25DbG9zZVdpbmRvd0V2ZW50OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5jbG9zZVdpbmRvdygpO1xyXG4gICAgICAgIGlmICh0aGlzLmVudHJhbmNlVHlwZSA9PT0gMSkge1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFCYXNlLmZsb29yV2luLm9wZW5XaW5kb3coKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fcmVtb3ZlU3dpdGNoUm9vbSgpO1xyXG4gICAgfSxcclxuICAgIC8vXHJcbiAgICBzdGFydDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIC8vIOW4uOeUqOeahOWPmOmHjy/mlbDmja5cclxuICAgICAgICB2YXIgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL0RhdGFCYXNlJyk7XHJcbiAgICAgICAgdGhpcy5kYXRhQmFzZSA9IGVudC5nZXRDb21wb25lbnQoJ0RhdGFCYXNlJyk7XHJcbiAgICAgICAgLy8g57uR5a6a5LqL5Lu2XHJcbiAgICAgICAgdGhpcy5idG5fY2xvc2Uub25DbGljayA9IHRoaXMuX29uQ2xvc2VXaW5kb3dFdmVudC5iaW5kKHRoaXMpO1xyXG4gICAgICAgIC8vXHJcbiAgICAgICAgdGhpcy5wbGFuTGlzdCA9IHt9O1xyXG4gICAgfVxyXG59KTtcclxuXG5GaXJlLl9SRnBvcCgpOyIsIkZpcmUuX1JGcHVzaChtb2R1bGUsICcxN2IwM241eml0SDdwTTY4bmRCNlk3MycsICdUaHJlZU1lbnVNZ3InKTtcbi8vIHNjcmlwdFxcdmlsbGFcXFRocmVlTWVudU1nci5qc1xuXG4vLyDkuInnuqfoj5zljZXnrqHnkIbnsbtcbnZhciBUaHJlZU1lbnVNZ3IgPSBGaXJlLkNsYXNzKHtcbiAgICAvLyDnu6fmib9cbiAgICBleHRlbmRzOiBGaXJlLkNvbXBvbmVudCxcbiAgICAvLyDmnoTpgKDlh73mlbBcbiAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyDlrrblhbfkuIDmrKHmmL7npLrlpJrlsJHmlbDph49cbiAgICAgICAgdGhpcy5fZnVybml0dXJlVG90YWwgPSA3O1xuICAgICAgICAvLyDoj5zljZXliJfooahcbiAgICAgICAgdGhpcy5fbWVudUxpc3QgPSBbXTtcbiAgICAgICAgLy8g5b2T5YmN6YCJ5oup55qE57G75Z6LIDEg5Y2V5ZOBIDIg5aWX6KOFIDMg54mp5ZOB5p+cXG4gICAgICAgIHRoaXMuX2N1clR5cGUgPSAwO1xuICAgICAgICAvLyDlvZPliY3pgInmi6nnianlk4FJRFxuICAgICAgICB0aGlzLl9jdXJJZCA9IDA7XG4gICAgICAgIC8vIOaYr+WQpuWPr+aLluaLvVxuICAgICAgICB0aGlzLl9oYXNEcmFnID0gZmFsc2U7XG4gICAgICAgIC8vIOW9k+WJjeacgOWkp+aVsOmHj1xuICAgICAgICB0aGlzLl9jdXJUb3RhbCA9IDc7XG4gICAgICAgIC8vIOW9k+WJjemhteetvlxuICAgICAgICB0aGlzLl9jdXJQYWdlID0gMTtcbiAgICAgICAgLy8g5pyA5aSn6aG1562+XG4gICAgICAgIHRoaXMuX21heFBhZ2UgPSAxO1xuICAgICAgICAvLyDlm77niYfovb3lhaXlm57osINcbiAgICAgICAgdGhpcy5iaW5kTG9hZE1lbnVJbWFnZUNCID0gdGhpcy5sb2FkTWVudUltYWdlQ0IuYmluZCh0aGlzKTtcbiAgICAgICAgLy8g5LiK5LiA5qyh6KOF5omu55qE5aWX6KOF5oyJ6ZKuXG4gICAgICAgIHRoaXMubGFzdFN1aXRNZW51ID0gbnVsbDtcbiAgICB9LFxuICAgIC8vIOWxnuaAp1xuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgbWFyZ2luOiBuZXcgRmlyZS5WZWMyKC0xMDkwLCAwKSxcbiAgICAgICAgLy8g5LiJ57qn6I+c5Y2V55qE5qC56IqC54K5XG4gICAgICAgIHJvb3Q6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLkVudGl0eVxuICAgICAgICB9LFxuICAgICAgICAvLyDpobXmlbBcbiAgICAgICAgcGFnZVRleHQ6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlRleHRcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy8g5Yib5bu65oiW6ICF5piv5YiH5o2i5p2Q6LSoXG4gICAgY3JlYXRlT3JDaGFuZ2VGdXJuaXR1cmU6IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgICAgdmFyIHRocmVlTWVudSA9IHRhcmdldC5nZXRDb21wb25lbnQoJ1RocmVlTWVudScpO1xuICAgICAgICBpZiAodGhyZWVNZW51Lmhhc1VzZSkge1xuICAgICAgICAgICAgdGhpcy5kYXRhQmFzZS50aXBzV2luZG93Lm9wZW5UaXBzV2luZG93KCflr7nkuI3otbfvvIzlvZPliY3nianlk4Hlt7LlnKjmiL/pl7TkuK3kvb/nlKgnKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgZW50LCBlbnRDb21wO1xuICAgICAgICAvL3RoaXMuZGF0YUJhc2UubG9hZFRpcHMub3BlblRpcHMoJ+WIm+W7uuWutuWFt+S4re+8jOivt+eojeWQji4uLicpO1xuICAgICAgICAvLyDlopnlo4HkuI7lnLDmnb9cbiAgICAgICAgaWYgKCEgdGhyZWVNZW51Lmhhc0RyYWcpIHtcbiAgICAgICAgICAgIGlmICh0aHJlZU1lbnUucHJvcHNfdHlwZSA9PT0gMSkge1xuICAgICAgICAgICAgICAgIGVudENvbXAgPSB0aGlzLmRhdGFCYXNlLmJhY2tncm91bmQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICh0aHJlZU1lbnUucHJvcHNfdHlwZSA9PT0gMikge1xuICAgICAgICAgICAgICAgIGVudENvbXAgPSB0aGlzLmRhdGFCYXNlLmdyb3VuZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICAgIGVudENvbXAubWVudURhdGEgPSB0aHJlZU1lbnU7XG4gICAgICAgICAgICBlbnRDb21wLnNldEZ1cm5pdHVyZURhdGEodGhyZWVNZW51LCB0cnVlKTtcbiAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UubG9hZFRpcHMub3BlblRpcHMoJ+WIm+W7uuWbvueJh+S4re+8jOivt+eojeWQji4uLicpO1xuICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS5sb2FkSW1hZ2UoZW50Q29tcC5pbWFnZVVybCwgZnVuY3Rpb24gKGVycm9yLCBpbWFnZSkge1xuICAgICAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UubG9hZFRpcHMuY2xvc2VUaXBzKCk7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgYmlnU3ByaXRlID0gbmV3IEZpcmUuU3ByaXRlKGltYWdlKTtcbiAgICAgICAgICAgICAgICBlbnRDb21wLnNldFNwcml0ZShiaWdTcHJpdGUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyDlrrblhbdcbiAgICAgICAgICAgIGVudCA9IEZpcmUuaW5zdGFudGlhdGUodGhpcy5kYXRhQmFzZS50ZW1wRnVybml0dXJlKTtcbiAgICAgICAgICAgIGVudC5hY3RpdmUgPSB0cnVlO1xuICAgICAgICAgICAgZW50LnBhcmVudCA9IHRoaXMuZGF0YUJhc2Uucm9vbTtcbiAgICAgICAgICAgIHZhciBwb3MgPSB0YXJnZXQudHJhbnNmb3JtLndvcmxkUG9zaXRpb247XG4gICAgICAgICAgICB2YXIgb2Zmc2V0ID0gTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogMTAwKTtcbiAgICAgICAgICAgIHBvcy54ICs9IG9mZnNldDtcbiAgICAgICAgICAgIHBvcy55ICs9IDQwMDtcbiAgICAgICAgICAgIGVudC50cmFuc2Zvcm0ucG9zaXRpb24gPSBuZXcgRmlyZS5WZWMyKHBvcy54LCBwb3MueSk7XG4gICAgICAgICAgICBlbnQudHJhbnNmb3JtLnNjYWxlID0gbmV3IEZpcmUuVmVjMigxLjgsIDEuOCk7XG4gICAgICAgICAgICBlbnQubmFtZSA9IHRocmVlTWVudS5wcm9wc19uYW1lO1xuICAgICAgICAgICAgZW50Q29tcCA9IGVudC5nZXRDb21wb25lbnQoJ0Z1cm5pdHVyZScpO1xuICAgICAgICAgICAgZW50Q29tcC5tZW51RGF0YSA9IHRocmVlTWVudTtcbiAgICAgICAgICAgIGVudENvbXAuc2V0RnVybml0dXJlRGF0YSh0aHJlZU1lbnUpO1xuICAgICAgICB9XG4gICAgICAgIC8vIOagh+iusOW3sue7j+S9v+eUqFxuICAgICAgICBpZiAodGhpcy5fY3VyVHlwZSA9PT0gMikge1xuICAgICAgICAgICAgdGhyZWVNZW51LnNldE1hcmtVc2UodHJ1ZSk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIOWIm+W7uuWQhOS4quexu+Wei+WutuWFt1xuICAgIF9vbkNyZWF0ZUZ1cm5pdHVyZUV2ZW50OiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ+WIm+W7uuWutuWFt0lEOicgKyBldmVudC50YXJnZXQucGFyZW50Lm5hbWUpO1xuICAgICAgICB0aGlzLmNyZWF0ZU9yQ2hhbmdlRnVybml0dXJlKGV2ZW50LnRhcmdldC5wYXJlbnQpO1xuICAgIH0sXG4gICAgLy8g5Yib5bu65aWX6KOF5Yiw5Zy65pmv5LitXG4gICAgX29uQ3JlYXRlU3VpdEl0ZW1FdmVudDogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIHZhciB0aHJlZU1lbnUgPSBldmVudC50YXJnZXQucGFyZW50LmdldENvbXBvbmVudCgnVGhyZWVNZW51Jyk7XG4gICAgICAgIGlmICh0aGlzLmxhc3RTdWl0TWVudeOAgCYmIHRoaXMubGFzdFN1aXRNZW51ICE9PSB0aHJlZU1lbnUpIHtcbiAgICAgICAgICAgIHRoaXMubGFzdFN1aXRNZW51LnNldE1hcmtVc2UoZmFsc2UpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aHJlZU1lbnUuaGFzVXNlKSB7XG4gICAgICAgICAgICB0aGlzLmRhdGFCYXNlLnRpcHNXaW5kb3cub3BlblRpcHNXaW5kb3coJ+WvueS4jei1t++8jOW9k+WJjeWll+ijheW3suWcqOaIv+mXtOS4reS9v+eUqCcpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgLy8g5Yig6Zmk5aWX6KOFXG4gICAgICAgIHNlbGYuZGF0YUJhc2UucmVtb3ZlU3VpdCgpO1xuICAgICAgICAvLyDph43mlrDotYvlgLzlpZfoo4VcbiAgICAgICAgc2VsZi5kYXRhQmFzZS5jdXJEcmVzc1N1aXQgPSB7XG4gICAgICAgICAgICAvLyDlpZfoo4VJRFxuICAgICAgICAgICAgc3VpdF9pZDogdGhyZWVNZW51LnN1aXRfaWQsXG4gICAgICAgICAgICAvLyDog4zljIVJRFxuICAgICAgICAgICAgcGFja19pZDogdGhyZWVNZW51LnBhY2tfaWQsXG4gICAgICAgICAgICAvLyDlpZfoo4XlsI/lm75cbiAgICAgICAgICAgIHN1aXRfaWNvbjogdGhyZWVNZW51LnNtYWxsU3ByaXRlLFxuICAgICAgICAgICAgLy8g5aWX6KOF5ZCN56ewXG4gICAgICAgICAgICBzdWl0X25hbWU6IHRocmVlTWVudS5zdWl0X25hbWUsXG4gICAgICAgICAgICAvLyDlpZfoo4XmnaXoh6rlk6rph4zvvIwxLuiDjOWMhSAyLuWVhuWfjlxuICAgICAgICAgICAgc3VpdF9mcm9tOiAxLFxuICAgICAgICAgICAgLy8g5aWX6KOF5Lu35qC8XG4gICAgICAgICAgICBwcmljZTogdGhyZWVNZW51LnByaWNlLFxuICAgICAgICAgICAgLy8g5oqY5omjXG4gICAgICAgICAgICBkaXNjb3VudDogdGhyZWVNZW51LmRpc2NvdW50LFxuICAgICAgICAgICAgLy8g5aWX6KOF5YiX6KGoXG4gICAgICAgICAgICBmdW5ybml0dXJlTGlzdDogW11cbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHRocmVlTWVudS5kcmVzc0xpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICBzZWxmLmRhdGFCYXNlLnRpcHNXaW5kb3cub3BlblRpcHNXaW5kb3coJ+i/meS4quS4gOS4quepuueahOWll+ijhS4uLicpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHNlbGYuZGF0YUJhc2UubG9hZFRpcHMub3BlblRpcHMoJ+WIm+W7uuWll+ijhe+8jOivt+eojeWQji4uLicpO1xuICAgICAgICBzZWxmLmRhdGFCYXNlLmNyZWF0ZUZ1cm5pdHVyZVRvU2NyZWVuKHRocmVlTWVudS5kcmVzc0xpc3QsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UubG9hZFRpcHMuY2xvc2VUaXBzKCk7XG4gICAgICAgICAgICAvLyDmoIforrDlt7Lnu4/kvb/nlKhcbiAgICAgICAgICAgIGlmIChzZWxmLl9jdXJUeXBlID09PSAyKSB7XG4gICAgICAgICAgICAgICAgdGhyZWVNZW51LnNldE1hcmtVc2UodHJ1ZSk7XG4gICAgICAgICAgICAgICAgc2VsZi5sYXN0U3VpdE1lbnUgPSB0aHJlZU1lbnU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLy8g6YeN572u6I+c5Y2V5YiX6KGoXG4gICAgX3Jlc2V0TWVudTogZnVuY3Rpb24gKCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX21lbnVMaXN0Lmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICB2YXIgbWVudSA9IHRoaXMuX21lbnVMaXN0W2ldO1xuICAgICAgICAgICAgbWVudS5uYW1lID0gaS50b1N0cmluZygpO1xuICAgICAgICAgICAgbWVudS5yZXNldE1lbnUoKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy8g5Yib5bu66I+c5Y2V5oyJ6ZKu5bm25LiU57uR5a6a5LqL5Lu2IOaIluiAheWIt+aWsFxuICAgIF9yZWZyZXNoU2luZ2xlSXRlbXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8g6YeN572uXG4gICAgICAgIHRoaXMuX3Jlc2V0TWVudSgpO1xuICAgICAgICAvLyDlpoLmnpzmgLvmlbDph4/mnInmm7TmlrDlsLHph43mlrDorqHnrpfmnIDlpKfpobXmlbBcbiAgICAgICAgdmFyIHRvdGFsID0gdGhpcy5kYXRhQmFzZS5zaW5nbGVfVGhyZWVfVG90YWxfU2hlZXRzW3RoaXMuX2N1cklkXTtcbiAgICAgICAgaWYgKHRoaXMuX2N1clRvdGFsICE9PSB0b3RhbCkge1xuICAgICAgICAgICAgdGhpcy5fY3VyVG90YWwgPSB0b3RhbDtcbiAgICAgICAgICAgIHRoaXMuX21heFBhZ2UgPSBNYXRoLmNlaWwodGhpcy5fY3VyVG90YWwgLyB0aGlzLl9mdXJuaXR1cmVUb3RhbCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8g6LWL5YC85pWw5o2uXG4gICAgICAgIHZhciBpbmRleCA9IDA7XG4gICAgICAgIHZhciBzdGFydE51bSA9ICh0aGlzLl9jdXJQYWdlIC0gMSkgKiB0aGlzLl9mdXJuaXR1cmVUb3RhbDtcbiAgICAgICAgdmFyIGVuZE51bSA9IHN0YXJ0TnVtICsgdGhpcy5fZnVybml0dXJlVG90YWw7XG4gICAgICAgIGlmIChlbmROdW0gPiB0aGlzLl9jdXJUb3RhbCkge1xuICAgICAgICAgICAgZW5kTnVtID0gdGhpcy5fY3VyVG90YWw7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGJpbmRFdmVudCA9IHRoaXMuX29uQ3JlYXRlRnVybml0dXJlRXZlbnQuYmluZCh0aGlzKTtcbiAgICAgICAgdmFyIGRhdGFTaGVldHMgPSB0aGlzLmRhdGFCYXNlLnNpbmdsZV9UaHJlZV9EYXRhU2hlZXRzW3RoaXMuX2N1cklkXTtcblxuICAgICAgICBmb3IodmFyIGkgPSBzdGFydE51bTsgaSA8IGVuZE51bTsgKytpKSB7XG4gICAgICAgICAgICB2YXIgbWVudSA9IHRoaXMuX21lbnVMaXN0W2luZGV4XTtcbiAgICAgICAgICAgIG1lbnUuZW50aXR5LmFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICB2YXIgbWVudURhdGEgPSBkYXRhU2hlZXRzW2ldO1xuICAgICAgICAgICAgaWYgKCFtZW51RGF0YSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbWVudURhdGEucHJvcHNfdHlwZSA9IHRoaXMuX2N1cklkO1xuICAgICAgICAgICAgbWVudURhdGEuaGFzRHJhZyA9IHRoaXMuX2hhc0RyYWc7XG4gICAgICAgICAgICBtZW51LmVudGl0eS50cmFuc2Zvcm0ucG9zaXRpb24gPSBuZXcgRmlyZS5WZWMyKC00OTAgKyAoaW5kZXggKiAxNjApLCA1NSk7XG4gICAgICAgICAgICBtZW51LnJlZnJlc2gobWVudURhdGEsIGJpbmRFdmVudCk7XG4gICAgICAgICAgICBpbmRleCsrO1xuICAgICAgICB9XG4gICAgICAgIC8vIOWIt+aWsOaMiemSrueKtuaAgVxuICAgICAgICB0aGlzLl9yZWZyZXNoQnRuU3RhdGUoKTtcbiAgICB9LFxuICAgIC8vIOiuvue9ruS9v+eUqOagh+iusFxuICAgIHNldE1hcmtVc2U6IGZ1bmN0aW9uIChtZW51RGF0YSwgbWVudSkge1xuICAgICAgICBpZiAodGhpcy5fY3VySWQgPT09IDApIHtcbiAgICAgICAgICAgIHZhciBjaGlsZHJlbiA9IHRoaXMuZGF0YUJhc2Uucm9vbS5nZXRDaGlsZHJlbigpO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgIHZhciBlbnQgPSBjaGlsZHJlbltpXTtcbiAgICAgICAgICAgICAgICB2YXIgZnVybml0dXJlID0gZW50LmdldENvbXBvbmVudCgnRnVybml0dXJlJyk7XG4gICAgICAgICAgICAgICAgaWYgKG1lbnVEYXRhLnByb3BzX2lkID09PSBmdXJuaXR1cmUucHJvcHNfaWQgJiZcbiAgICAgICAgICAgICAgICAgICAgZnVybml0dXJlLnBhY2tfaWQgPT09IG1lbnVEYXRhLnBhY2tfaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgbWVudS5zZXRNYXJrVXNlKHRydWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmIChwYXJzZUludChtZW51RGF0YS5zdWl0X2lkKSA9PT0gdGhpcy5kYXRhQmFzZS5jdXJEcmVzc1N1aXQuc3VpdF9pZCkge1xuICAgICAgICAgICAgICAgIG1lbnUuc2V0TWFya1VzZSh0cnVlKTtcbiAgICAgICAgICAgICAgICBpZighIHRoaXMubGFzdFN1aXRNZW51KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGFzdFN1aXRNZW51ID0gbWVudTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIOeJqeWTgeafnCAwOiDljZXlk4EgMe+8muWll+ijhVxuICAgIF9yZWZyZXNoQmFja3BhY2tJdGVtczogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyDph43nva5cbiAgICAgICAgdGhpcy5fcmVzZXRNZW51KCk7XG4gICAgICAgIHZhciBzaG93VG90YWwgPSB0aGlzLl9mdXJuaXR1cmVUb3RhbDtcbiAgICAgICAgaWYgKHRoaXMuX2N1cklkID09PSAxKSB7XG4gICAgICAgICAgICAvLyDlpZfoo4XmmL7npLrnmoTmlbDph49cbiAgICAgICAgICAgIHNob3dUb3RhbCA9IDU7XG4gICAgICAgIH1cbiAgICAgICAgLy8g5aaC5p6c5oC75pWw6YeP5pyJ5pu05paw5bCx6YeN5paw6K6h566X5pyA5aSn6aG15pWwXG4gICAgICAgIHZhciB0b3RhbCA9IHRoaXMuZGF0YUJhc2UuYmFja3BhY2tfVGhyZWVfVG90YWxfU2hlZXRzW3RoaXMuX2N1cklkXTtcbiAgICAgICAgaWYgKHRoaXMuX2N1clRvdGFsICE9PSB0b3RhbCkge1xuICAgICAgICAgICAgdGhpcy5fY3VyVG90YWwgPSB0b3RhbDtcbiAgICAgICAgICAgIHZhciBtYXhQYWdlID0gTWF0aC5jZWlsKHRoaXMuX2N1clRvdGFsIC8gc2hvd1RvdGFsKTtcbiAgICAgICAgICAgIHRoaXMuX21heFBhZ2UgPSBtYXhQYWdlID09PSAwID8gMSA6IG1heFBhZ2U7XG4gICAgICAgIH1cbiAgICAgICAgLy8g6LWL5YC85pWw5o2uXG4gICAgICAgIHZhciBpbmRleCA9IDA7XG4gICAgICAgIHZhciBzdGFydE51bSA9ICh0aGlzLl9jdXJQYWdlIC0gMSkgKiBzaG93VG90YWw7XG4gICAgICAgIHZhciBlbmROdW0gPSBzdGFydE51bSArIHNob3dUb3RhbDtcbiAgICAgICAgaWYgKGVuZE51bSA+IHRoaXMuX2N1clRvdGFsKSB7XG4gICAgICAgICAgICBlbmROdW0gPSB0aGlzLl9jdXJUb3RhbDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgYmluZEV2ZW50ID0gbnVsbDtcbiAgICAgICAgaWYgKHRoaXMuX2N1cklkID09PSAwKSB7XG4gICAgICAgICAgICAvLyDliJvlu7rljZXlk4HlrrblhbfliLDlnLrmma/kuK1cbiAgICAgICAgICAgIGJpbmRFdmVudCA9IHRoaXMuX29uQ3JlYXRlRnVybml0dXJlRXZlbnQuYmluZCh0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIOWIm+W7uuWll+ijheWutuWFt+WIsOWcuuaZr+S4rVxuICAgICAgICAgICAgYmluZEV2ZW50ID0gdGhpcy5fb25DcmVhdGVTdWl0SXRlbUV2ZW50LmJpbmQodGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGRhdGFTaGVldHMgPSB0aGlzLmRhdGFCYXNlLmJhY2twYWNrX1RocmVlX0RhdGFTaGVldHNbdGhpcy5fY3VySWRdO1xuICAgICAgICBmb3IodmFyIGkgPSBzdGFydE51bTsgaSA8IGVuZE51bTsgKytpKSB7XG4gICAgICAgICAgICB2YXIgbWVudSA9IHRoaXMuX21lbnVMaXN0W2luZGV4XTtcbiAgICAgICAgICAgIGlmICh0aGlzLl9jdXJJZCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIG1lbnUuZW50aXR5LnRyYW5zZm9ybS5wb3NpdGlvbiA9IG5ldyBGaXJlLlZlYzIoLTUwMCArIChpbmRleCAqIDE2MCksIDU1KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIG1lbnUuZW50aXR5LnRyYW5zZm9ybS5wb3NpdGlvbiA9IG5ldyBGaXJlLlZlYzIoLTQ5MCArIChpbmRleCAqIDI1MCksIDIwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG1lbnUuZW50aXR5LmFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICBpbmRleCsrO1xuICAgICAgICAgICAgdmFyIG1lbnVEYXRhID0gZGF0YVNoZWV0c1tpXTtcbiAgICAgICAgICAgIGlmICghbWVudURhdGEpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIOWIpOaWreeJqeWTgeafnOiPnOWNleeahOaYvuekuumXrumimFxuICAgICAgICAgICAgdGhpcy5zZXRNYXJrVXNlKG1lbnVEYXRhLCBtZW51KTtcbiAgICAgICAgICAgIG1lbnUucmVmcmVzaChtZW51RGF0YSwgYmluZEV2ZW50KTtcbiAgICAgICAgfVxuICAgICAgICAvLyDliLfmlrDmjInpkq7nirbmgIFcbiAgICAgICAgdGhpcy5fcmVmcmVzaEJ0blN0YXRlKCk7XG4gICAgfSxcbiAgICAvLyDliJvlu7roj5zljZXlrrnlmahcbiAgICBfY3JlYXRlTWVudUVudDogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgdGVtcEZ1cm5pdHVyZSA9IHRoaXMuZGF0YUJhc2UudGVtcFN1YlRocmVlTWVudTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9mdXJuaXR1cmVUb3RhbDsgKytpKSB7XG4gICAgICAgICAgICB2YXIgZW50ID0gRmlyZS5pbnN0YW50aWF0ZSh0ZW1wRnVybml0dXJlKTtcbiAgICAgICAgICAgIGVudC5uYW1lID0gaS50b1N0cmluZygpO1xuICAgICAgICAgICAgZW50LnBhcmVudCA9IHRoaXMucm9vdDtcbiAgICAgICAgICAgIGVudC50cmFuc2Zvcm0ucG9zaXRpb24gPSBuZXcgRmlyZS5WZWMyKC01MDAgKyAoaSAqIDE2MCksIDU1KTtcbiAgICAgICAgICAgIHZhciBtZW51ID0gZW50LmdldENvbXBvbmVudCgnVGhyZWVNZW51Jyk7XG4gICAgICAgICAgICBtZW51LmluaXQoKTtcbiAgICAgICAgICAgIC8vIOWtmOWCqOWvueixoVxuICAgICAgICAgICAgdGhpcy5fbWVudUxpc3QucHVzaChtZW51KTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy8g5r+A5rS76I+c5Y2V5pe26Kem5Y+R55qE5LqL5Lu2XG4gICAgLy8gaWQ6IOmCo+S4quexu+Wei+eJqeWTgeeahElEXG4gICAgLy8gdHlwZTogMCDljZXlk4EgMSDlpZfoo4UgMiDnianlk4Hmn5xcbiAgICBvcGVuTWVudTogZnVuY3Rpb24gKGlkLCB0eXBlLCBoYXNEcmFnKSB7XG4gICAgICAgIHRoaXMuX2N1clR5cGUgPSB0eXBlO1xuICAgICAgICB0aGlzLl9jdXJJZCA9IGlkO1xuICAgICAgICB0aGlzLl9oYXNEcmFnID0gaGFzRHJhZztcbiAgICAgICAgLy8g6I635Y+W6I+c5Y2V5oyJ6ZKu5bm25LiU57uR5a6a5LqL5Lu2XG4gICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgIHRoaXMuX3JlZnJlc2hTaW5nbGVJdGVtcygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgIHRoaXMuX3JlZnJlc2hCYWNrcGFja0l0ZW1zKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgLy8g5pi+56S65b2T5YmN56qX5Y+jXG4gICAgICAgIHRoaXMuZW50aXR5LmFjdGl2ZSA9IHRydWU7XG4gICAgfSxcbiAgICAvLyDkuIrkuIDpobVcbiAgICBfb25QcmV2aW91c0V2ZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuX2N1clBhZ2UgLT0gMTtcbiAgICAgICAgaWYgKHRoaXMuX2N1clBhZ2UgPCAxKXtcbiAgICAgICAgICAgIHRoaXMuX2N1clBhZ2UgPSAxO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLl9jdXJUeXBlID09PSAwKSB7XG4gICAgICAgICAgICB0aGlzLl9yZWZyZXNoU2luZ2xlSXRlbXMoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0aGlzLl9jdXJUeXBlID09PSAyKSB7XG4gICAgICAgICAgICB0aGlzLl9yZWZyZXNoQmFja3BhY2tJdGVtcygpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyDkuIvkuIDpobVcbiAgICBfb25OZXh0RXZlbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5fY3VyUGFnZSArPSAxO1xuICAgICAgICBpZiAodGhpcy5fY3VyUGFnZSA+IHRoaXMuX21heFBhZ2Upe1xuICAgICAgICAgICAgdGhpcy5fY3VyUGFnZSA9IHRoaXMuX21heFBhZ2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX2N1clR5cGUgPT09IDApIHtcbiAgICAgICAgICAgIHRoaXMuX3JlZnJlc2hTaW5nbGVJdGVtcygpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHRoaXMuX2N1clR5cGUgPT09IDIpIHtcbiAgICAgICAgICAgIHRoaXMuX3JlZnJlc2hCYWNrcGFja0l0ZW1zKCk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIOi/lOWbnuS4iuS4gOe6p+iPnOWNlVxuICAgIF9vblJldHVybkV2ZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuX2N1cklkID0gMDtcbiAgICAgICAgdGhpcy5fY3VyUGFnZSA9IDE7XG4gICAgICAgIHRoaXMuZW50aXR5LmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLmRhdGFCYXNlLnNlY29uZE1lbnVNZ3Iub3Blbk1lbnUodGhpcy5fY3VyVHlwZSk7XG4gICAgfSxcbiAgICAvLyDlhbPpl63oj5zljZVcbiAgICBjbG9zZU1lbnU6IGZ1bmN0aW9uIChoYXNNb2RpZnlUb2dnbGUpIHtcbiAgICAgICAgdGhpcy5fY3VySWQgPSAwO1xuICAgICAgICB0aGlzLl9jdXJQYWdlID0gMTtcbiAgICAgICAgdGhpcy5lbnRpdHkuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgIGlmIChoYXNNb2RpZnlUb2dnbGUpIHtcbiAgICAgICAgICAgIHRoaXMuZGF0YUJhc2UuZmlyc3RNZW51TWdyLm1vZGlmeVRvZ2dsZSgpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyDlhbPpl63lvZPliY3oj5zljZVcbiAgICBfb25DbG9zZU1lbnU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5jbG9zZU1lbnUodHJ1ZSk7XG4gICAgfSxcbiAgICAvLyDliLfmlrDmjInpkq7nirbmgIFcbiAgICBfcmVmcmVzaEJ0blN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuYnRuX0xlZnQuYWN0aXZlID0gdGhpcy5fY3VyUGFnZSA+IDE7XG4gICAgICAgIHRoaXMuYnRuX1JpZ2h0LmFjdGl2ZSA9IHRoaXMuX2N1clBhZ2UgPCB0aGlzLl9tYXhQYWdlO1xuICAgICAgICB0aGlzLnBhZ2VUZXh0LnRleHQgPSAn6aG15pWwOicgKyB0aGlzLl9jdXJQYWdlICsgXCIvXCIgKyB0aGlzLl9tYXhQYWdlO1xuICAgIH0sXG4gICAgLy8g5byA5aeLXG4gICAgc3RhcnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8g5bi455So55qE5Y+Y6YePL+aVsOaNrlxuICAgICAgICB2YXIgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL0RhdGFCYXNlJyk7XG4gICAgICAgIHRoaXMuZGF0YUJhc2UgPSBlbnQuZ2V0Q29tcG9uZW50KCdEYXRhQmFzZScpO1xuICAgICAgICAvLyDojrflj5blhbPpl63mjInpkq7lubbnu5Hlrprkuovku7ZcbiAgICAgICAgZW50ID0gdGhpcy5lbnRpdHkuZmluZCgnYnRuX2Nsb3NlJyk7XG4gICAgICAgIHZhciBidG5DbG9zZSA9IGVudC5nZXRDb21wb25lbnQoJ1VJQnV0dG9uJyk7XG4gICAgICAgIGJ0bkNsb3NlLm9uQ2xpY2sgPSB0aGlzLl9vbkNsb3NlTWVudS5iaW5kKHRoaXMpO1xuICAgICAgICAvLyDov5Tlm57kuIrkuIDnuqfoj5zljZVcbiAgICAgICAgZW50ID0gdGhpcy5lbnRpdHkuZmluZCgnYnRuX3JldHVybicpO1xuICAgICAgICB2YXIgYnRuUmV0dXJuID0gZW50LmdldENvbXBvbmVudCgnVUlCdXR0b24nKTtcbiAgICAgICAgYnRuUmV0dXJuLm9uQ2xpY2sgPSB0aGlzLl9vblJldHVybkV2ZW50LmJpbmQodGhpcyk7XG4gICAgICAgIC8vIOS4iuS4gOmhtVxuICAgICAgICB0aGlzLmJ0bl9MZWZ0ID0gdGhpcy5lbnRpdHkuZmluZCgnYnRuX2xlZnQnKTtcbiAgICAgICAgdmFyIGJ0bkxlZnQgPSB0aGlzLmJ0bl9MZWZ0LmdldENvbXBvbmVudCgnVUlCdXR0b24nKTtcbiAgICAgICAgYnRuTGVmdC5vbkNsaWNrID0gdGhpcy5fb25QcmV2aW91c0V2ZW50LmJpbmQodGhpcyk7XG4gICAgICAgIC8vIOS4i+S4gOmhtVxuICAgICAgICB0aGlzLmJ0bl9SaWdodCA9IHRoaXMuZW50aXR5LmZpbmQoJ2J0bl9yaWdodCcpO1xuICAgICAgICB2YXIgYnRuUmlnaHQgPSB0aGlzLmJ0bl9SaWdodC5nZXRDb21wb25lbnQoJ1VJQnV0dG9uJyk7XG4gICAgICAgIGJ0blJpZ2h0Lm9uQ2xpY2sgPSB0aGlzLl9vbk5leHRFdmVudC5iaW5kKHRoaXMpO1xuICAgICAgICAvL1xuICAgICAgICB0aGlzLmJ0bl9MZWZ0LmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLmJ0bl9SaWdodC5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgLy9cbiAgICAgICAgdGhpcy5fY3JlYXRlTWVudUVudCgpO1xuICAgICAgICAvLyDpooTliqDovb0gVGhyZWUgU3ViIE1lbnVcbiAgICAgICAgdGhpcy5kYXRhQmFzZS5wcmVsb2FkU2luYWdsZUl0ZW1zRGF0YV9UaHJlZSgxLCB0aGlzLl9jdXJQYWdlLCB0aGlzLl9mdXJuaXR1cmVUb3RhbCwgdGhpcy5iaW5kTG9hZE1lbnVJbWFnZUNCKTtcbiAgICAgICAgdGhpcy5kYXRhQmFzZS5wcmVsb2FkU2luYWdsZUl0ZW1zRGF0YV9UaHJlZSgyLCB0aGlzLl9jdXJQYWdlLCB0aGlzLl9mdXJuaXR1cmVUb3RhbCwgdGhpcy5iaW5kTG9hZE1lbnVJbWFnZUNCKTtcbiAgICAgICAgdGhpcy5kYXRhQmFzZS5wcmVsb2FkU2luYWdsZUl0ZW1zRGF0YV9UaHJlZSgzLCB0aGlzLl9jdXJQYWdlLCB0aGlzLl9mdXJuaXR1cmVUb3RhbCwgdGhpcy5iaW5kTG9hZE1lbnVJbWFnZUNCKTtcbiAgICAgICAgdGhpcy5kYXRhQmFzZS5wcmVsb2FkU2luYWdsZUl0ZW1zRGF0YV9UaHJlZSg0LCB0aGlzLl9jdXJQYWdlLCB0aGlzLl9mdXJuaXR1cmVUb3RhbCwgdGhpcy5iaW5kTG9hZE1lbnVJbWFnZUNCKTtcbiAgICAgICAgdGhpcy5kYXRhQmFzZS5wcmVsb2FkU2luYWdsZUl0ZW1zRGF0YV9UaHJlZSg1LCB0aGlzLl9jdXJQYWdlLCB0aGlzLl9mdXJuaXR1cmVUb3RhbCwgdGhpcy5iaW5kTG9hZE1lbnVJbWFnZUNCKTtcbiAgICAgICAgdGhpcy5kYXRhQmFzZS5wcmVsb2FkU2luYWdsZUl0ZW1zRGF0YV9UaHJlZSg2LCB0aGlzLl9jdXJQYWdlLCB0aGlzLl9mdXJuaXR1cmVUb3RhbCwgdGhpcy5iaW5kTG9hZE1lbnVJbWFnZUNCKTtcbiAgICAgICAgdGhpcy5kYXRhQmFzZS5wcmVsb2FkU2luYWdsZUl0ZW1zRGF0YV9UaHJlZSg3LCB0aGlzLl9jdXJQYWdlLCB0aGlzLl9mdXJuaXR1cmVUb3RhbCwgdGhpcy5iaW5kTG9hZE1lbnVJbWFnZUNCKTtcbiAgICAgICAgdGhpcy5kYXRhQmFzZS5wcmVsb2FkU2luYWdsZUl0ZW1zRGF0YV9UaHJlZSg4LCB0aGlzLl9jdXJQYWdlLCB0aGlzLl9mdXJuaXR1cmVUb3RhbCwgdGhpcy5iaW5kTG9hZE1lbnVJbWFnZUNCKTtcbiAgICB9LFxuICAgIC8vIOWbvueJh+i9veWFpeWujOavleS7peWQjueahOWbnuiwg1xuICAgIGxvYWRNZW51SW1hZ2VDQjogZnVuY3Rpb24gKGlkLCBpbmRleCwgcGFnZSwgbWVudURhdGEpIHtcbiAgICAgICAgaWYgKHRoaXMuX2N1cklkID09PSBpZCAmJiB0aGlzLl9jdXJQYWdlID09PSBwYWdlKSB7XG4gICAgICAgICAgICB2YXIgbWVudSA9IHRoaXMuX21lbnVMaXN0W2luZGV4XTtcbiAgICAgICAgICAgIGlmIChtZW51KSB7XG4gICAgICAgICAgICAgICAgbWVudS5yZWZyZXNoKG1lbnVEYXRhLCB0aGlzLl9vbkNyZWF0ZUZ1cm5pdHVyZUV2ZW50LmJpbmQodGhpcykpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICB1cGRhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8g5Yy56YWNVUnliIbovqjnjodcbiAgICAgICAgLy92YXIgY2FtZXJhID0gRmlyZS5DYW1lcmEubWFpbjtcbiAgICAgICAgLy92YXIgYmdXb3JsZEJvdW5kcyA9IHRoaXMuZGF0YUJhc2UuYmdSZW5kZXIuZ2V0V29ybGRCb3VuZHMoKTtcbiAgICAgICAgLy92YXIgYmdMZWZ0VG9wV29ybGRQb3MgPSBuZXcgRmlyZS5WZWMyKGJnV29ybGRCb3VuZHMueE1pbiwgYmdXb3JsZEJvdW5kcy55TWluKTtcbiAgICAgICAgLy92YXIgYmdsZWZ0VG9wID0gY2FtZXJhLndvcmxkVG9TY3JlZW4oYmdMZWZ0VG9wV29ybGRQb3MpO1xuICAgICAgICAvL3ZhciBzY3JlZW5Qb3MgPSBuZXcgRmlyZS5WZWMyKGJnbGVmdFRvcC54LCBiZ2xlZnRUb3AueSk7XG4gICAgICAgIC8vdmFyIHdvcmxkUG9zID0gY2FtZXJhLnNjcmVlblRvV29ybGQoc2NyZWVuUG9zKTtcbiAgICAgICAgLy90aGlzLmVudGl0eS50cmFuc2Zvcm0ud29ybGRQb3NpdGlvbiA9IHdvcmxkUG9zO1xuICAgICAgICAvLyDljLnphY1VSeWIhui+qOeOh1xuICAgICAgICB2YXIgY2FtZXJhID0gRmlyZS5DYW1lcmEubWFpbjtcbiAgICAgICAgdmFyIHNjcmVlblNpemUgPSBGaXJlLlNjcmVlbi5zaXplLm11bChjYW1lcmEuc2l6ZSAvIEZpcmUuU2NyZWVuLmhlaWdodCk7XG4gICAgICAgIHZhciBuZXdQb3MgPSBGaXJlLnYyKHRoaXMubWFyZ2luLngsIC1zY3JlZW5TaXplLnkgLyAyICsgdGhpcy5tYXJnaW4ueSk7XG4gICAgICAgIHRoaXMuZW50aXR5LnRyYW5zZm9ybS5wb3NpdGlvbiA9IG5ld1BvcztcbiAgICB9XG59KTtcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnMWYxNGV5VkwveExBYURxV2RmaHljRGUnLCAnVGhyZWVNZW51Jyk7XG4vLyBzY3JpcHRcXHZpbGxhXFxUaHJlZU1lbnUuanNcblxudmFyIFRocmVlTWVudSA9IEZpcmUuQ2xhc3Moe1xuICAgIC8vIOe7p+aJv1xuICAgIGV4dGVuZHM6IEZpcmUuQ29tcG9uZW50LFxuICAgIC8vIOaehOmAoOWHveaVsFxuICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuX2J0bk1lbnUgPSBudWxsO1xuICAgICAgICB0aGlzLl9wcmljZVRleHQgPSBudWxsO1xuICAgICAgICB0aGlzLnNtYWxsU3ByaXRlID0gbnVsbDtcbiAgICAgICAgLy8g5aaC5p6c5piv5aWX6KOF55qE6K+d5bCx5pyJ5a625YW35YiX6KGoXG4gICAgICAgIHRoaXMuZHJlc3NMaXN0ID0gW107XG4gICAgfSxcbiAgICAvLyDlsZ7mgKdcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIHByb3BzX25hbWU6ICcnLFxuICAgICAgICAvLyDnianlk4FJRFxuICAgICAgICBwcm9wc19pZDogMCxcbiAgICAgICAgLy8g54mp5ZOBVUlEXG4gICAgICAgIHByb3BzX3VpZDogMCxcbiAgICAgICAgLy8g5aWX6KOFSURcbiAgICAgICAgc3VpdF9pZDogMCxcbiAgICAgICAgLy8g5aWX6KOF5ZCN56ewXG4gICAgICAgIHN1aXRfbmFtZTogJycsXG4gICAgICAgIC8vIOiDjOWMhUlEXG4gICAgICAgIHBhY2tfaWQ6IDAsXG4gICAgICAgIC8vIOexu+WIq1xuICAgICAgICBwcm9wc190eXBlOiAwLFxuICAgICAgICAvLyDku7fmoLxcbiAgICAgICAgcHJpY2U6IDAsXG4gICAgICAgIC8vIOaKmOaJo1xuICAgICAgICBkaXNjb3VudDogMCxcbiAgICAgICAgLy8g5aSn5Zu+VXJsXG4gICAgICAgIGJpZ0ltYWdlVXJsOiAnJyxcbiAgICAgICAgLy8g5piv5ZCm5Y+v5Lul5ouW5Yqo77yI5L6L5aaC5aOB57q45LiO5Zyw6Z2i5peg5rOV5ouW5Yqo77yJXG4gICAgICAgIGhhc0RyYWc6IGZhbHNlLFxuICAgICAgICAvLyDmmK/lkKbmnInkvb/nlKjov4dcbiAgICAgICAgaGFzVXNlOiBmYWxzZSxcbiAgICAgICAgLy8g6L295YWl5pe255qE5Zu+54mHXG4gICAgICAgIGRlZmF1bHRTcHJpdGU6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlNwcml0ZVxuICAgICAgICB9LFxuICAgICAgICBkZWZhdWx0TG9hZEFuaW06IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLkFuaW1hdGlvblxuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyDph43nva7lrrblhbdcbiAgICByZXNldE1lbnU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5fYnRuTWVudS5zZXRUZXh0KCfovb3lhaXkuK0nKTtcbiAgICAgICAgdGhpcy5fYnRuTWVudS5zZXRTcHJpdGUodGhpcy5kZWZhdWx0U3ByaXRlKTtcbiAgICAgICAgdGhpcy5fYnRuTWVudS5vbkNsaWNrID0gbnVsbDtcbiAgICAgICAgdGhpcy5lbnRpdHkubmFtZSA9ICfmsqHotYvlgLwnO1xuICAgICAgICB0aGlzLnByb3BzX2lkID0gMDtcbiAgICAgICAgdGhpcy5wcm9wc191aWQgPSAwO1xuICAgICAgICB0aGlzLnN1aXRfaWQgPSAwO1xuICAgICAgICB0aGlzLnBhY2tfaWQgPSAwO1xuICAgICAgICB0aGlzLnN1aXRfbmFtZSA9ICcnO1xuICAgICAgICB0aGlzLnByb3BzX3R5cGUgPSAwO1xuICAgICAgICB0aGlzLmJpZ0ltYWdlVXJsID0gJ+ayoeacieW+l+WIsOWkp+WbvlVSTCc7XG4gICAgICAgIHRoaXMuaGFzRHJhZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLnNldE1hcmtVc2UoZmFsc2UpO1xuICAgICAgICB0aGlzLnNldFRleHQoJycpO1xuICAgICAgICB0aGlzLnNldFByaWNlKDApO1xuICAgICAgICB0aGlzLnNtYWxsU3ByaXRlID0gbnVsbDtcbiAgICAgICAgdGhpcy5kcmVzc0xpc3QgPSBbXTtcbiAgICAgICAgdGhpcy5lbnRpdHkuYWN0aXZlID0gZmFsc2U7XG4gICAgfSxcbiAgICAvLyDorr7nva7mloflrZdcbiAgICBzZXRUZXh0OiBmdW5jdGlvbiAodGV4dCkge1xuICAgICAgICB0aGlzLl9idG5NZW51LnNldFRleHQodGV4dCk7XG4gICAgfSxcbiAgICAvLyDorr7nva7ku7fmoLxcbiAgICBzZXRQcmljZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHRoaXMucHJpY2UgPSAhdmFsdWUgPyAwIDogdmFsdWU7XG4gICAgICAgIHRoaXMuX3ByaWNlVGV4dC5lbnRpdHkuYWN0aXZlID0gdGhpcy5wcmljZSAhPT0gMDtcbiAgICAgICAgdGhpcy5fcHJpY2VUZXh0LnRleHQgPSB2YWx1ZTtcbiAgICB9LFxuICAgIC8vIOiuvue9ruWbvueJh1xuICAgIHNldFNwcml0ZTogZnVuY3Rpb24gKHNtYWxsU3ByaXRlLCBldmVudCkge1xuICAgICAgICBpZiAoISBzbWFsbFNwcml0ZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc21hbGxTcHJpdGUgPSBzbWFsbFNwcml0ZTtcblxuICAgICAgICB0aGlzLl9idG5NZW51LnNldFNwcml0ZShzbWFsbFNwcml0ZSk7XG4gICAgICAgIGlmIChzbWFsbFNwcml0ZS53aWR0aCA+IDExMCB8fCBzbWFsbFNwcml0ZS5oZWlnaHQgPiAxMjApIHtcbiAgICAgICAgICAgIHRoaXMuX2J0bk1lbnUuYnRuUmVuZGVyLnVzZUN1c3RvbVNpemUgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5fYnRuTWVudS5idG5SZW5kZXIuY3VzdG9tV2lkdGggPSAxMTA7XG4gICAgICAgICAgICB0aGlzLl9idG5NZW51LmJ0blJlbmRlci5jdXN0b21IZWlnaHQgPSAxMjA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGV2ZW50KSB7XG4gICAgICAgICAgICB0aGlzLl9idG5NZW51Lm9uQ2xpY2sgPSBldmVudDtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy8g5qCH6K6w5bey5L2/55SoXG4gICAgc2V0TWFya1VzZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuaGFzVXNlID0gdmFsdWU7XG4gICAgICAgIHRoaXMuX2J0bk1lbnUuc2V0RGlzYWJsZWQodmFsdWUpO1xuICAgIH0sXG4gICAgLy8g5byA5aeL5pe2XG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyDluLjnlKjnmoTlj5jph48v5pWw5o2uXG4gICAgICAgIHZhciBlbnQgPSBGaXJlLkVudGl0eS5maW5kKCcvRGF0YUJhc2UnKTtcbiAgICAgICAgdGhpcy5kYXRhQmFzZSA9IGVudC5nZXRDb21wb25lbnQoJ0RhdGFCYXNlJyk7XG4gICAgICAgIGlmICghIHRoaXMuX2J0bk1lbnUpIHtcbiAgICAgICAgICAgIGVudCA9IHRoaXMuZW50aXR5LmZpbmQoJ2J0bl9NZW51Jyk7XG4gICAgICAgICAgICB0aGlzLl9idG5NZW51ID0gZW50LmdldENvbXBvbmVudCgnVUlCdXR0b24nKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoISB0aGlzLl9wcmljZVRleHQpIHtcbiAgICAgICAgICAgIGVudCA9IHRoaXMuZW50aXR5LmZpbmQoJ3ByaWNlJyk7XG4gICAgICAgICAgICB0aGlzLl9wcmljZVRleHQgPSBlbnQuZ2V0Q29tcG9uZW50KEZpcmUuVGV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgLy9cbiAgICAgICAgdmFyIHN0YXRlID0gdGhpcy5kZWZhdWx0TG9hZEFuaW0ucGxheSgnbG9hZGluZycpO1xuICAgICAgICBzdGF0ZS53cmFwTW9kZSA9IEZpcmUuV3JhcE1vZGUuTG9vcDtcbiAgICAgICAgc3RhdGUucmVwZWF0Q291bnQgPSBJbmZpbml0eTtcbiAgICAgICAgLy9cbiAgICAgICAgdGhpcy5yZXNldE1lbnUoKTtcbiAgICB9LFxuICAgIC8vIOWIt+aWsOW3suS4i+i9vei/h+WQjueahOaVsOaNrlxuICAgIHJlZnJlc2g6IGZ1bmN0aW9uIChkYXRhLCBiaW5kRXZlbnQpIHtcbiAgICAgICAgdGhpcy5lbnRpdHkubmFtZSA9IGRhdGEucHJvcHNfaWQgfHwgMDtcbiAgICAgICAgdGhpcy5wcm9wc19pZCA9IGRhdGEucHJvcHNfaWQgfHwgMDtcbiAgICAgICAgdGhpcy5wcm9wc191aWQgPSBkYXRhLnByb2RfdWlkIHx8IDA7XG4gICAgICAgIHRoaXMucGFja19pZCA9IGRhdGEucGFja19pZCB8fCAwO1xuICAgICAgICB0aGlzLnByb3BzX3R5cGUgPSBwYXJzZUludChkYXRhLnByb3BzX3R5cGUpIHx8IDA7XG4gICAgICAgIHRoaXMuZGlzY291bnQgPSBkYXRhLmRpc2NvdW50IHx8IDE7XG4gICAgICAgIHRoaXMuaGFzRHJhZyA9IGRhdGEuaGFzRHJhZyB8fCBmYWxzZTtcbiAgICAgICAgdGhpcy5zdWl0X2lkID0gcGFyc2VJbnQoZGF0YS5zdWl0X2lkIHx8IDApO1xuICAgICAgICB0aGlzLnN1aXRfbmFtZSA9IGRhdGEuc3VpdF9uYW1lIHx8ICcnO1xuICAgICAgICB0aGlzLnByb3BzX25hbWUgPSBkYXRhLnByb3BzX25hbWUgfHwgJyc7XG4gICAgICAgIHRoaXMuc2V0VGV4dChkYXRhLnByb3BzX25hbWUgfHwgZGF0YS5zdWl0X25hbWUpO1xuICAgICAgICB0aGlzLnNldFByaWNlKGRhdGEucHJpY2UgfHwgMCk7XG4gICAgICAgIHRoaXMuYmlnSW1hZ2VVcmwgPSBkYXRhLmJpZ0ltYWdlVXJsO1xuICAgICAgICB0aGlzLmRyZXNzTGlzdCA9IGRhdGEuZHJlc3NMaXN0IHx8IFtdO1xuICAgICAgICB0aGlzLmVudGl0eS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICB0aGlzLl9idG5NZW51LmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5kZWZhdWx0TG9hZEFuaW0uZW50aXR5LmFjdGl2ZSA9IHRydWU7XG4gICAgICAgIHRoaXMuZGVmYXVsdExvYWRBbmltLnBsYXkoJ2xvYWRpbmcnKTtcbiAgICAgICAgdGhpcy5zZXRNYXJrVXNlKGRhdGEuc3RhdHVzID09PSBcIjFcIiB8fCBmYWxzZSk7XG4gICAgICAgIC8vXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgc2VsZi5kYXRhQmFzZS5sb2FkSW1hZ2UoZGF0YS5pbWFnZVVybCwgZnVuY3Rpb24gKGRhdGEsIGVycm9yLCBpbWFnZSkge1xuICAgICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHNlbGYudGlkICE9PSBkYXRhLnRpZCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBzcHJpdGUgPSBuZXcgRmlyZS5TcHJpdGUoaW1hZ2UpO1xuICAgICAgICAgICAgc2VsZi5zZXRTcHJpdGUoc3ByaXRlLCBiaW5kRXZlbnQpO1xuICAgICAgICAgICAgc2VsZi5fYnRuTWVudS5lbnRpdHkuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgICAgIHNlbGYuZGVmYXVsdExvYWRBbmltLmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgfS5iaW5kKHRoaXMsIGRhdGEpKTtcbiAgICB9XG59KTtcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnZWVhNjlDVVRlSkRSYjkveWRiL1ZHZFQnLCAnVGlwTG9hZCcpO1xuLy8gc2NyaXB0XFx2aWxsYVxcVGlwTG9hZC5qc1xuXG52YXIgVGlwTG9hZCA9IEZpcmUuQ2xhc3Moe1xuICAgIC8vIOe7p+aJv1xuICAgIGV4dGVuZHM6IEZpcmUuQ29tcG9uZW50LFxuICAgIC8vIOaehOmAoOWHveaVsFxuICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiAoKSB7XG5cbiAgICB9LFxuICAgIC8vIOWxnuaAp1xuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgY29udGVudDp7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5CaXRtYXBUZXh0XG4gICAgICAgIH0sXG4gICAgICAgIGxvYWRJY29uOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5FbnRpdHlcbiAgICAgICAgfSxcbiAgICAgICAgYW5pbToge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuQW5pbWF0aW9uXG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIOWKoOi9vVxuICAgIG9uTG9hZDogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgc3RhdGUgPSB0aGlzLmFuaW0ucGxheSgnbG9hZGluZycpO1xuICAgICAgICBzdGF0ZS53cmFwTW9kZSA9IEZpcmUuV3JhcE1vZGUuTG9vcDtcbiAgICAgICAgc3RhdGUucmVwZWF0Q291bnQgPSBJbmZpbml0eTtcbiAgICB9LFxuICAgIC8vIOaJk+W8gOeql+WPo1xuICAgIG9wZW5UaXBzOiBmdW5jdGlvbiAodGV4dCkge1xuICAgICAgICB0aGlzLmFuaW0ucGxheSgnbG9hZGluZycpO1xuICAgICAgICB0aGlzLmVudGl0eS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICBpZiAodGV4dCkge1xuICAgICAgICAgICAgdGhpcy5jb250ZW50LnRleHQgPSB0ZXh0O1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5jb250ZW50LnRleHQgPSAn5Yqg6L295Lit6K+356iN5ZCOLi4uJztcbiAgICAgICAgfVxuICAgICAgICB2YXIgc2l6ZSA9IHRoaXMuY29udGVudC5nZXRXb3JsZFNpemUoKTtcbiAgICAgICAgdGhpcy5sb2FkSWNvbi50cmFuc2Zvcm0ud29ybGRQb3NpdGlvbiA9IG5ldyBGaXJlLlZlYzIoc2l6ZS54IC8gMiArIDUwLCAwKTtcbiAgICB9LFxuICAgIC8vIOWFs+mXreeql+WPo1xuICAgIGNsb3NlVGlwczogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmFuaW0uc3RvcCgnbG9hZGluZycpO1xuICAgICAgICB0aGlzLmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcbiAgICB9XG59KTtcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnYTRlMzd0QmFCdE8xNUkrUjdmWXBNWmwnLCAnVGlwX015QWRkJyk7XG4vLyBzY3JpcHRcXG91dGRvb3JcXFRpcF9NeUFkZC5qc1xuXG52YXIgQ29tcCA9IEZpcmUuQ2xhc3Moe1xyXG4gICAgZXh0ZW5kczogRmlyZS5Db21wb25lbnQsXHJcblxyXG4gICAgcHJvcGVydGllczoge1xyXG4gICAgICAgIGJ0bl9EZXRlcm1pbmU6IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5VSUJ1dHRvblxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYnRuX0Nsb3NlOiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVUlCdXR0b25cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgX29uQ2xvc2VXaW5kb3c6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLmNsb3NlVGlwcygpO1xyXG4gICAgfSxcclxuICAgIF9vbkRldGVybWluZUV2ZW50OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5jbG9zZVRpcHMoKTtcclxuICAgIH0sXHJcbiAgICBvcGVuVGlwc1dpbmRvdzogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuZW50aXR5LmFjdGl2ZSA9IHRydWU7XHJcbiAgICB9LFxyXG4gICAgY2xvc2VUaXBzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5lbnRpdHkuYWN0aXZlID0gZmFsc2U7XHJcbiAgICB9LFxyXG4gICAgb25Mb2FkOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5idG5fQ2xvc2Uub25DbGljayA9IHRoaXMuX29uQ2xvc2VXaW5kb3cuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLmJ0bl9EZXRlcm1pbmUub25DbGljayA9IHRoaXMuX29uRGV0ZXJtaW5lRXZlbnQuYmluZCh0aGlzKTtcclxuICAgIH1cclxufSk7XHJcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnMjA5NDRMQm12UklNN2hHdXlKekM0TWMnLCAnVGlwc1BheU1lbnQnKTtcbi8vIHNjcmlwdFxcdmlsbGFcXFRpcHNQYXlNZW50LmpzXG5cbnZhciBUaXBzUGF5TWVudCA9IEZpcmUuQ2xhc3Moe1xuICAgIGV4dGVuZHM6IEZpcmUuQ29tcG9uZW50LFxuXG4gICAgcHJvcGVydGllczoge1xuICAgICAgICBidG5fUGF5OiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5VSUJ1dHRvblxuICAgICAgICB9LFxuICAgICAgICBidG5fUGF5SXNzdWVzOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5VSUJ1dHRvblxuICAgICAgICB9LFxuICAgICAgICBidG5fQ2xvc2U6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlVJQnV0dG9uXG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIOWFs+mXreaMiemSruS6i+S7tlxuICAgIF9vbkNsb3NlV2luZG93OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuY2xvc2VUaXBzKCk7XG4gICAgfSxcbiAgICAvLyDlt7Lnu4/lrozmiJDku5jmrL7vvIzpnIDopoHpgJrorq/mnI3liqHlmahcbiAgICBfb25DaGVja1BheTogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHNlbGYuZGF0YUJhc2UubG9hZFRpcHMub3BlblRpcHMoJ+ehruiupOWFheWAvOaYr+WQpuWujOavle+8geivt+eojeWQji4uLicpO1xuICAgICAgICB2YXIgc2VuZERhdGEgPSB7XG4gICAgICAgICAgICBtYXJrOiB0aGlzLmRhdGFCYXNlLm1hcmtcbiAgICAgICAgfTtcbiAgICAgICAgc2VsZi5kYXRhQmFzZS5uZXRXb3JrTWdyLlJlcXVlc3RDYW5EcmVzc1Jvb20oc2VuZERhdGEsIGZ1bmN0aW9uIChzZXJ2ZXJEYXRhKSB7XG4gICAgICAgICAgICBzZWxmLmRhdGFCYXNlLnVzZXJjYyA9IHNlcnZlckRhdGEudXNlcmNjO1xuICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS5wYXlNZW50V2luZG93LnJlZnJlc2hVc2VyQ0MoKTtcbiAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UubG9hZFRpcHMuY2xvc2VUaXBzKCk7XG4gICAgICAgICAgICBzZWxmLmRhdGFCYXNlLnRpcHNXaW5kb3cub3BlblRpcHNXaW5kb3coJ+WFheWAvOaIkOWKnyEnKTtcbiAgICAgICAgICAgIHNlbGYuY2xvc2VUaXBzKCk7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLy8g5LuY5qy+6YGH5Yiw55qE6Zeu6aKYXG4gICAgX29uUGF5SXNzdWVzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuZGF0YUJhc2UudGlwc1BheVByb2JsZW1zLm9wZW5UaXBzKCk7XG4gICAgfSxcbiAgICAvLyDlvIDlkK/mj5DnpLrnqpflj6NcbiAgICBvcGVuVGlwczogZnVuY3Rpb24gKHRleHQpIHtcbiAgICAgICAgdGhpcy5lbnRpdHkuYWN0aXZlID0gdHJ1ZTtcbiAgICB9LFxuICAgIC8vIOWFs+mXreaPkOekuueql+WPo1xuICAgIGNsb3NlVGlwczogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcbiAgICB9LFxuICAgIC8vIOWKoOi9veaXtlxuICAgIG9uTG9hZDogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyDluLjnlKjnmoTlj5jph48v5pWw5o2uXG4gICAgICAgIHZhciBlbnQgPSBGaXJlLkVudGl0eS5maW5kKCcvRGF0YUJhc2UnKTtcbiAgICAgICAgdGhpcy5kYXRhQmFzZSA9IGVudC5nZXRDb21wb25lbnQoJ0RhdGFCYXNlJyk7XG4gICAgICAgIC8vXG4gICAgICAgIHRoaXMuYnRuX1BheS5vbkNsaWNrID0gdGhpcy5fb25DaGVja1BheS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmJ0bl9QYXlJc3N1ZXMub25DbGljayA9IHRoaXMuX29uUGF5SXNzdWVzLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuYnRuX0Nsb3NlLm9uQ2xpY2sgPSB0aGlzLl9vbkNsb3NlV2luZG93LmJpbmQodGhpcyk7XG4gICAgfVxufSk7XG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJ2IzY2Q5Qi8rRDFIUG9GZXV1Z2VrQW50JywgJ1RpcHNQYXlQcm9ibGVtcycpO1xuLy8gc2NyaXB0XFx2aWxsYVxcVGlwc1BheVByb2JsZW1zLmpzXG5cbnZhciBUaXBzUGF5UHJvYmxlbXMgPSBGaXJlLkNsYXNzKHtcbiAgICAvLyDnu6fmib9cbiAgICBleHRlbmRzOiBGaXJlLkNvbXBvbmVudCxcbiAgICAvLyDmnoTpgKDlh73mlbBcbiAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24gKCkge1xuXG4gICAgfSxcbiAgICAvLyDlsZ7mgKdcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIGJ0bl9vazoge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVUlCdXR0b25cbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBfb25PS0V2ZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuY2xvc2VUaXBzKCk7XG4gICAgfSxcblxuICAgIGNsb3NlVGlwczogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcbiAgICB9LFxuXG4gICAgb3BlblRpcHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5lbnRpdHkuYWN0aXZlID0gdHJ1ZTtcbiAgICB9LFxuICAgIC8vIOW8gOWni1xuICAgIHN0YXJ0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuYnRuX29rLm9uQ2xpY2sgPSB0aGlzLl9vbk9LRXZlbnQuYmluZCh0aGlzKTtcbiAgICB9XG59KTtcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnZjkyYzNEVzNaWkZZb05LYzdsVllIYzgnLCAnVGlwc1dpbmRvdycpO1xuLy8gc2NyaXB0XFx2aWxsYVxcVGlwc1dpbmRvdy5qc1xuXG52YXIgVGlwc1dpbmRvdyA9IEZpcmUuQ2xhc3Moe1xyXG4gICAgZXh0ZW5kczogRmlyZS5Db21wb25lbnQsXHJcblxyXG4gICAgcHJvcGVydGllczoge1xyXG4gICAgICAgIGNvbnRlbnQ6IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5CaXRtYXBUZXh0XHJcbiAgICAgICAgfSxcclxuICAgICAgICBidG5fRGV0ZXJtaW5lOiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVUlCdXR0b25cclxuICAgICAgICB9LFxyXG4gICAgICAgIGJ0bl9jbG9zZToge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlVJQnV0dG9uXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBfb25DbG9zZVdpbmRvdzogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuY2xvc2VUaXBzKCk7XHJcbiAgICB9LFxyXG5cclxuICAgIF9vbkRldGVybWluZUV2ZW50OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5jbG9zZVRpcHMoKTtcclxuICAgICAgICBpZiAodGhpcy5vbkNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIHRoaXMub25DYWxsYmFjaygpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgb3BlblRpcHNXaW5kb3c6IGZ1bmN0aW9uICh2YWx1ZSwgY2FsbGJhY2spIHtcclxuICAgICAgICB0aGlzLm9uQ2FsbGJhY2sgPSBudWxsO1xyXG4gICAgICAgIGlmICh0aGlzLmNvbnRlbnQgJiYgdmFsdWUpe1xyXG4gICAgICAgICAgICB0aGlzLmNvbnRlbnQudGV4dCA9IHZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgdGhpcy5vbkNhbGxiYWNrID0gY2FsbGJhY2s7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZW50aXR5LmFjdGl2ZSA9IHRydWU7XHJcbiAgICB9LFxyXG5cclxuICAgIGNsb3NlVGlwczogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuZW50aXR5LmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgfSxcclxuXHJcbiAgICBvbkxvYWQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLmJ0bl9jbG9zZS5vbkNsaWNrID0gdGhpcy5fb25DbG9zZVdpbmRvdy5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuYnRuX0RldGVybWluZS5vbkNsaWNrID0gdGhpcy5fb25EZXRlcm1pbmVFdmVudC5iaW5kKHRoaXMpO1xyXG4gICAgfVxyXG59KTtcclxuXG5GaXJlLl9SRnBvcCgpOyIsIkZpcmUuX1JGcHVzaChtb2R1bGUsICc4ZDAwNEE3L3RCUDk3MllmaUFwVVNXdScsICdUb2dnbGUnKTtcbi8vIHNjcmlwdFxcY29tbW9uXFxUb2dnbGUuanNcblxudmFyIFRvZ2dsZSA9RmlyZS5DbGFzcyh7XG4gICAgLy8g57un5om/XG4gICAgZXh0ZW5kczogRmlyZS5Db21wb25lbnQsXG4gICAgLy8g5p6E6YCg5Ye95pWwXG4gICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5oYXNDbGljayA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9vbkJ1dHRvbkRvd25FdmVudEJpbmQgPSB0aGlzLl9vbkJ1dHRvbkRvd25FdmVudC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLl9vbkJ1dHRvblVwRXZlbnRCaW5kID0gdGhpcy5fb25CdXR0b25VcEV2ZW50LmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuYnRuUmVuZGVyID0gbnVsbDtcbiAgICAgICAgdGhpcy5vbkNsaWNrID0gbnVsbDtcbiAgICB9LFxuICAgIC8vIOWxnuaAp1xuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgdGV4dENvbnRlbnQ6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlRleHRcbiAgICAgICAgfSxcbiAgICAgICAgbm9ybWFsUG9zOiBuZXcgRmlyZS5WZWMyKDAsIDApLFxuICAgICAgICBub3JtYWxDb2xvcjogRmlyZS5Db2xvci53aGl0ZSxcbiAgICAgICAgbm9ybWFsU3ByaXRlOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5TcHJpdGVcbiAgICAgICAgfSxcbiAgICAgICAgcHJlc3NlZFBvczogbmV3IEZpcmUuVmVjMigwLCAwKSxcbiAgICAgICAgcHJlc3NlZENvbG9yOiBGaXJlLkNvbG9yLndoaXRlLFxuICAgICAgICBwcmVzc2VkU3ByaXRlOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5TcHJpdGVcbiAgICAgICAgfSxcbiAgICAgICAgLy8g5oyJ6ZKu5riy5p+TXG4gICAgICAgIGJ0blJlbmRlcjoge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKCEgdGhpcy5fYnRuUmVuZGVyKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2J0blJlbmRlciA9IHRoaXMuZW50aXR5LmdldENvbXBvbmVudChGaXJlLlNwcml0ZVJlbmRlcmVyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2J0blJlbmRlcjtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB2aXNpYmxlOiBmYWxzZVxuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyDmjInkuItcbiAgICBfb25CdXR0b25Eb3duRXZlbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy9pZiAodGhpcy5wcmVzc2VkU3ByaXRlKSB7XG4gICAgICAgIC8vICAgIHRoaXMuYnRuUmVuZGVyLnNwcml0ZSA9IHRoaXMucHJlc3NlZFNwcml0ZTtcbiAgICAgICAgLy99XG4gICAgICAgIC8vaWYgKHRoaXMubm9ybWFsUG9zICE9PSBGaXJlLlZlYzIuemVybykge1xuICAgICAgICAvLyAgICB0aGlzLnNldFBvc3RpdGlvbih0aGlzLm5vcm1hbFBvcyk7XG4gICAgICAgIC8vfVxuICAgIH0sXG4gICAgLy8g5pS+5byAXG4gICAgX29uQnV0dG9uVXBFdmVudDogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIGlmICh0aGlzLmhhc0NsaWNrKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMub25DbGljaykge1xuICAgICAgICAgICAgdGhpcy5vbkNsaWNrKGV2ZW50KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5wcmVzc2VkU3ByaXRlKSB7XG4gICAgICAgICAgICB0aGlzLmJ0blJlbmRlci5zcHJpdGUgPSB0aGlzLnByZXNzZWRTcHJpdGU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMucHJlc3NlZENvbG9yICE9PSBGaXJlLkNvbG9yLndoaXRlKSB7XG4gICAgICAgICAgICB0aGlzLmJ0blJlbmRlci5jb2xvciA9IHRoaXMucHJlc3NlZENvbG9yO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnByZXNzZWRQb3MueCAhPT0gMCAmJiB0aGlzLnByZXNzZWRQb3MueSAhPT0gMCkge1xuICAgICAgICAgICAgdGhpcy5zZXRQb3N0aXRpb24odGhpcy5wcmVzc2VkUG9zKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmhhc0NsaWNrID0gdHJ1ZTtcbiAgICB9LFxuICAgIC8vXG4gICAgZGVmYXVsdFRvZ2dsZTogZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgIGlmICh0aGlzLnByZXNzZWRTcHJpdGUpIHtcbiAgICAgICAgICAgIHRoaXMuYnRuUmVuZGVyLnNwcml0ZSA9IHRoaXMucHJlc3NlZFNwcml0ZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmJ0blJlbmRlci5jb2xvciA9IHRoaXMucHJlc3NlZENvbG9yO1xuICAgICAgICBpZiAodGhpcy5wcmVzc2VkUG9zLnggIT09IDAgJiYgdGhpcy5wcmVzc2VkUG9zLnkgIT09IDApIHtcbiAgICAgICAgICAgIHRoaXMuc2V0UG9zdGl0aW9uKHRoaXMucHJlc3NlZFBvcyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICByZXNldENvbG9yOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuaGFzQ2xpY2sgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5idG5SZW5kZXIuY29sb3IgPSB0aGlzLm5vcm1hbENvbG9yO1xuICAgIH0sXG4gICAgLy9cbiAgICByZXNldFRvZ2dsZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmhhc0NsaWNrID0gZmFsc2U7XG4gICAgICAgIGlmICh0aGlzLm5vcm1hbFNwcml0ZSkge1xuICAgICAgICAgICAgdGhpcy5idG5SZW5kZXIuc3ByaXRlID0gdGhpcy5ub3JtYWxTcHJpdGU7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5idG5SZW5kZXIuY29sb3IgPSB0aGlzLm5vcm1hbENvbG9yO1xuICAgICAgICBpZiAodGhpcy5ub3JtYWxQb3MueCAhPT0gMCAmJiB0aGlzLm5vcm1hbFBvcy55ICE9PSAwKSB7XG4gICAgICAgICAgICB0aGlzLnNldFBvc3RpdGlvbih0aGlzLm5vcm1hbFBvcyk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIOiuvue9ruWdkOagh1xuICAgIHNldFBvc3RpdGlvbjogZnVuY3Rpb24gKHBvc1ZhbHVlKSB7XG4gICAgICAgIHRoaXMuZW50aXR5LnRyYW5zZm9ybS5wb3NpdGlvbiA9IHBvc1ZhbHVlO1xuICAgIH0sXG4gICAgLy8g6K6+572u5paH5a2XXG4gICAgc2V0VGV4dDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHRoaXMudGV4dENvbnRlbnQudGV4dCA9IHZhbHVlO1xuICAgIH0sXG4gICAgLy8g6L295YWl5pe2XG4gICAgb25Mb2FkOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuZW50aXR5Lm9uKCdtb3VzZWRvd24nLCB0aGlzLl9vbkJ1dHRvbkRvd25FdmVudEJpbmQpO1xuICAgICAgICB0aGlzLmVudGl0eS5vbignbW91c2V1cCcsIHRoaXMuX29uQnV0dG9uVXBFdmVudEJpbmQpO1xuICAgICAgICBpZiAodGhpcy5ub3JtYWxTcHJpdGUpIHtcbiAgICAgICAgICAgIHRoaXMuYnRuUmVuZGVyLnNwcml0ZSA9IHRoaXMubm9ybWFsU3ByaXRlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLm5vcm1hbENvbG9yICE9PSBGaXJlLkNvbG9yLndoaXRlKSB7XG4gICAgICAgICAgICB0aGlzLmJ0blJlbmRlci5jb2xvciA9IHRoaXMubm9ybWFsQ29sb3I7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMubm9ybWFsUG9zLnggIT09IDAgJiYgdGhpcy5ub3JtYWxQb3MueSAhPT0gMCkge1xuICAgICAgICAgICAgdGhpcy5zZXRQb3N0aXRpb24odGhpcy5ub3JtYWxQb3MpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyDplIDmr4Hml7ZcbiAgICBvbkRlc3Ryb3k6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5lbnRpdHkub2ZmKCdtb3VzZWRvd24nLCB0aGlzLl9vbkJ1dHRvbkRvd25FdmVudEJpbmQpO1xuICAgICAgICB0aGlzLmVudGl0eS5vZmYoJ21vdXNldXAnLCB0aGlzLl9vbkJ1dHRvblVwRXZlbnRCaW5kKTtcbiAgICB9XG59KTtcblxuRmlyZS5Ub2dnbGUgPSBUb2dnbGU7XG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJ2ExNjJkb1RlbnBLT2EwVFF0OE1weDRLJywgJ1Rvb2xzJyk7XG4vLyBzY3JpcHRcXGNvbW1vblxcVG9vbHMuanNcblxuZnVuY3Rpb24gSW1hZ2VMb2FkZXIodXJsLCBjYWxsYmFjaywgb25Qcm9ncmVzcykge1xyXG4gICAgdmFyIGltYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XHJcbiAgICAvL2ltYWdlLmNyb3NzT3JpZ2luID0gJ0Fub255bW91cyc7XHJcblxyXG4gICAgdmFyIG9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAoY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgdGhpcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGltYWdlLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBvbmxvYWQpO1xyXG4gICAgICAgIGltYWdlLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgb25lcnJvcik7XHJcbiAgICAgICAgaW1hZ2UucmVtb3ZlRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBvblByb2dyZXNzKTtcclxuICAgIH07XHJcbiAgICB2YXIgb25lcnJvciA9IGZ1bmN0aW9uIChtc2csIGxpbmUsIHVybCkge1xyXG4gICAgICAgIGlmIChjYWxsYmFjaykge1xyXG4gICAgICAgICAgICB2YXIgZXJyb3IgPSAnRmFpbGVkIHRvIGxvYWQgaW1hZ2U6ICcgKyBtc2cgKyAnIFVybDogJyArIHVybDtcclxuICAgICAgICAgICAgY2FsbGJhY2soZXJyb3IsIG51bGwpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpbWFnZS5yZW1vdmVFdmVudExpc3RlbmVyKCdsb2FkJywgb25sb2FkKTtcclxuICAgICAgICBpbWFnZS5yZW1vdmVFdmVudExpc3RlbmVyKCdlcnJvcicsIG9uZXJyb3IpO1xyXG4gICAgICAgIGltYWdlLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgb25Qcm9ncmVzcyk7XHJcbiAgICB9O1xyXG5cclxuICAgIGltYWdlLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBvbmxvYWQpO1xyXG4gICAgaW1hZ2UuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBvbmVycm9yKTtcclxuICAgIGlmIChvblByb2dyZXNzKSB7XHJcbiAgICAgICAgaW1hZ2UuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBvblByb2dyZXNzKTtcclxuICAgIH1cclxuICAgIGltYWdlLnNyYyA9IHVybDtcclxuICAgIHJldHVybiBpbWFnZTtcclxufVxyXG5cclxuRmlyZS5JbWFnZUxvYWRlciA9IEltYWdlTG9hZGVyO1xuXG5GaXJlLl9SRnBvcCgpOyIsIkZpcmUuX1JGcHVzaChtb2R1bGUsICcxNmM1ZHFaUW0xTDByOWY3UXA1dnNlNScsICdVSUJ1dHRvbicpO1xuLy8gc2NyaXB0XFxjb21tb25cXFVJQnV0dG9uLmpzXG5cbnZhciBVSUJ1dHRvbiA9RmlyZS5DbGFzcyh7XHJcbiAgICAvLyDnu6fmib9cclxuICAgIGV4dGVuZHM6IEZpcmUuQ29tcG9uZW50LFxyXG4gICAgLy8g5p6E6YCg5Ye95pWwXHJcbiAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuX2J0blJlbmRlciA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fbm9ybWFsQ29sb3IgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX25vcm1hbFNwcml0ZSA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fb25CdXR0b25Eb3duRXZlbnRCaW5kID0gdGhpcy5fb25CdXR0b25Eb3duRXZlbnQuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLl9vbkJ1dHRvblVwRXZlbnRCaW5kID0gdGhpcy5fb25CdXR0b25VcEV2ZW50LmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5fb25CdXR0b25FbnRlckV2ZW50QmluZCA9IHRoaXMuX29uQnV0dG9uRW50ZXJFdmVudC5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuX29uQnV0dG9uTGVhdmVFdmVudEJpbmQgPSB0aGlzLl9vbkJ1dHRvbkxlYXZlRXZlbnQuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLm9uQ2xpY2sgPSBudWxsO1xyXG4gICAgICAgIHRoaXMub25Nb3VzZWRvd24gPSBudWxsO1xyXG4gICAgICAgIHRoaXMuaW1hZ2UgPSBudWxsO1xyXG4gICAgICAgIHRoaXMubWFyayA9IDA7XHJcbiAgICAgICAgdGhpcy5oYXNEaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgfSxcclxuICAgIC8vIOWxnuaAp1xyXG4gICAgcHJvcGVydGllczoge1xyXG4gICAgICAgIC8vIOaMiemSruaWh+Wtl1xyXG4gICAgICAgIHRleHRDb250ZW50OiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVGV4dFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy9cclxuICAgICAgICBob3ZlckNvbG9yOiBGaXJlLkNvbG9yLndoaXRlLFxyXG4gICAgICAgIGhvdmVyU3ByaXRlOiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuU3ByaXRlXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvL1xyXG4gICAgICAgIHByZXNzZWRDb2xvcjogRmlyZS5Db2xvci53aGl0ZSxcclxuICAgICAgICBwcmVzc2VkU3ByaXRlOiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuU3ByaXRlXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvL1xyXG4gICAgICAgIGRpc2FibGVkQ29sb3I6IG5ldyBGaXJlLkNvbG9yKDAuNSwgMC41LCAwLjUsIDEpLFxyXG4gICAgICAgIC8vIOaMiemSrua4suafk1xyXG4gICAgICAgIGJ0blJlbmRlcjoge1xyXG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGlmICghIHRoaXMuX2J0blJlbmRlcikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2J0blJlbmRlciA9IHRoaXMuZW50aXR5LmdldENvbXBvbmVudChGaXJlLlNwcml0ZVJlbmRlcmVyKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9idG5SZW5kZXI7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHZpc2libGU6IGZhbHNlXHJcbiAgICAgICAgfVxyXG5cclxuICAgIH0sXHJcbiAgICAvLyDmjInkuItcclxuICAgIF9vbkJ1dHRvbkRvd25FdmVudDogZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgICAgaWYgKHRoaXMucHJlc3NlZFNwcml0ZSkge1xyXG4gICAgICAgICAgICB0aGlzLmJ0blJlbmRlci5zcHJpdGUgPSB0aGlzLnByZXNzZWRTcHJpdGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBwQ29sb3I7XHJcbiAgICAgICAgaWYgKCEgdGhpcy5oYXNEaXNhYmxlZCkge1xyXG4gICAgICAgICAgICBwQ29sb3IgPSB0aGlzLnByZXNzZWRDb2xvcjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHBDb2xvciA9IHRoaXMuZGlzYWJsZWRDb2xvcjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5idG5SZW5kZXIuY29sb3IgPSBwQ29sb3I7XHJcbiAgICAgICAgaWYgKHRoaXMub25Nb3VzZWRvd24pIHtcclxuICAgICAgICAgICAgdGhpcy5vbk1vdXNlZG93bihldmVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIOmHiuaUvlxyXG4gICAgX29uQnV0dG9uVXBFdmVudDogZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgICAgdmFyIG5Db2xvcjtcclxuICAgICAgICBpZiAoISB0aGlzLmhhc0Rpc2FibGVkKSB7XHJcbiAgICAgICAgICAgIG5Db2xvciA9IHRoaXMuX25vcm1hbENvbG9yO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgbkNvbG9yID0gdGhpcy5kaXNhYmxlZENvbG9yO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmJ0blJlbmRlci5jb2xvciA9IG5Db2xvcjtcclxuICAgICAgICB0aGlzLmJ0blJlbmRlci5zcHJpdGUgPSB0aGlzLl9ub3JtYWxTcHJpdGU7XHJcbiAgICAgICAgLy8g6Kem5Y+R5LqL5Lu2XHJcbiAgICAgICAgaWYgKHRoaXMub25DbGljaykge1xyXG4gICAgICAgICAgICB0aGlzLm9uQ2xpY2soZXZlbnQpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvLyDov5vlhaVcclxuICAgIF9vbkJ1dHRvbkVudGVyRXZlbnQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgaENvbG9yO1xyXG4gICAgICAgIGlmICghIHRoaXMuaGFzRGlzYWJsZWQpIHtcclxuICAgICAgICAgICAgaENvbG9yID0gdGhpcy5ob3ZlckNvbG9yO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgaENvbG9yID0gdGhpcy5kaXNhYmxlZENvbG9yO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmJ0blJlbmRlci5jb2xvciA9IGhDb2xvcjtcclxuICAgICAgICBpZiAodGhpcy5ob3ZlclNwcml0ZSkge1xyXG4gICAgICAgICAgICB0aGlzLmJ0blJlbmRlci5zcHJpdGUgPSB0aGlzLmhvdmVyU3ByaXRlO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvLyDnp7vlvIBcclxuICAgIF9vbkJ1dHRvbkxlYXZlRXZlbnQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgbkNvbG9yO1xyXG4gICAgICAgIGlmICghIHRoaXMuaGFzRGlzYWJsZWQpIHtcclxuICAgICAgICAgICAgbkNvbG9yID0gdGhpcy5fbm9ybWFsQ29sb3I7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBuQ29sb3IgPSB0aGlzLmRpc2FibGVkQ29sb3I7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuYnRuUmVuZGVyLmNvbG9yID0gbkNvbG9yO1xyXG4gICAgICAgIHRoaXMuYnRuUmVuZGVyLnNwcml0ZSA9IHRoaXMuX25vcm1hbFNwcml0ZTtcclxuICAgIH0sXHJcbiAgICAvLyDorr7nva7npoHnlKhcclxuICAgIHNldERpc2FibGVkOiBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgICAgICB0aGlzLmhhc0Rpc2FibGVkID0gdmFsdWU7XHJcbiAgICAgICAgdmFyIG5Db2xvcjtcclxuICAgICAgICBpZiAodmFsdWUpIHtcclxuICAgICAgICAgICAgbkNvbG9yID0gdGhpcy5kaXNhYmxlZENvbG9yO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKCEgdGhpcy5fbm9ybWFsQ29sb3IpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX25vcm1hbENvbG9yID0gdGhpcy5idG5SZW5kZXIuY29sb3I7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbkNvbG9yID0gdGhpcy5fbm9ybWFsQ29sb3IgfHwgRmlyZS5Db2xvci53aGl0ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5idG5SZW5kZXIuY29sb3IgPSBuQ29sb3I7XHJcbiAgICB9LFxyXG4gICAgLy8g6K6+572u5paH5a2XXHJcbiAgICBzZXRUZXh0OiBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgICAgICB0aGlzLnRleHRDb250ZW50LnRleHQgPSB2YWx1ZTtcclxuICAgIH0sXHJcbiAgICAvLyDorr7nva7mjInpkq7lnZDmoIdcclxuICAgIHNldFBvc3RpdGlvbjogZnVuY3Rpb24gKHBvc1ZhbHVlKSB7XHJcbiAgICAgICAgdGhpcy5lbnRpdHkudHJhbnNmb3JtLnBvc2l0aW9uID0gcG9zVmFsdWU7XHJcbiAgICB9LFxyXG4gICAgLy8g6K6+572u5Zu+54mH5aSn5bCPXHJcbiAgICBzZXRDdXN0b21TaXplOiBmdW5jdGlvbiAodywgaCkge1xyXG4gICAgICAgIGlmICh3ID09PSAtMSB8fCBoID09PSAtMSkge1xyXG4gICAgICAgICAgICB0aGlzLmJ0blJlbmRlci51c2VDdXN0b21TaXplID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5idG5SZW5kZXIudXNlQ3VzdG9tU2l6ZSA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5idG5SZW5kZXIuY3VzdG9tV2lkdGggPSB3O1xyXG4gICAgICAgIHRoaXMuYnRuUmVuZGVyLmN1c3RvbUhlaWdodCA9IGg7XHJcbiAgICB9LFxyXG4gICAgLy8g6K6+572u5oyJ6ZKu57q555CGXHJcbiAgICBzZXRTcHJpdGU6IGZ1bmN0aW9uIChuZXdTcHJpdGUpIHtcclxuICAgICAgICB0aGlzLmJ0blJlbmRlci5zcHJpdGUgPSBuZXdTcHJpdGU7XHJcbiAgICAgICAgdGhpcy5fbm9ybWFsU3ByaXRlID0gbmV3U3ByaXRlO1xyXG4gICAgICAgIHRoaXMuaG92ZXJTcHJpdGUgPSBuZXdTcHJpdGU7XHJcbiAgICAgICAgdGhpcy5wcmVzc2VkU3ByaXRlID0gbmV3U3ByaXRlO1xyXG4gICAgfSxcclxuICAgIC8vIOiuvue9ruaMiemSrue6ueeQhlxyXG4gICAgc2V0SW1hZ2U6IGZ1bmN0aW9uIChpbWFnZSkge1xyXG4gICAgICAgIHRoaXMuaW1hZ2UgPSBpbWFnZTtcclxuICAgICAgICB2YXIgbmV3U3ByaXRlID0gbmV3IEZpcmUuU3ByaXRlKGltYWdlKTtcclxuICAgICAgICBuZXdTcHJpdGUucGl4ZWxMZXZlbEhpdFRlc3QgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuYnRuUmVuZGVyLnNwcml0ZSA9IG5ld1Nwcml0ZTtcclxuICAgICAgICB0aGlzLl9ub3JtYWxTcHJpdGUgPSBuZXdTcHJpdGU7XHJcbiAgICAgICAgdGhpcy5ob3ZlclNwcml0ZSA9IG5ld1Nwcml0ZTtcclxuICAgICAgICB0aGlzLnByZXNzZWRTcHJpdGUgPSBuZXdTcHJpdGU7XHJcbiAgICB9LFxyXG4gICAgLy8g6L295YWl5pe2XHJcbiAgICBvbkxvYWQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAoISB0aGlzLl9ub3JtYWxDb2xvcikge1xyXG4gICAgICAgICAgICB0aGlzLl9ub3JtYWxDb2xvciA9IHRoaXMuYnRuUmVuZGVyLmNvbG9yO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoISB0aGlzLl9ub3JtYWxTcHJpdGUpIHtcclxuICAgICAgICAgICAgdGhpcy5fbm9ybWFsU3ByaXRlID0gdGhpcy5idG5SZW5kZXIuc3ByaXRlO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvLyDlvIDlp4tcclxuICAgIHN0YXJ0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5lbnRpdHkub24oJ21vdXNlZG93bicsIHRoaXMuX29uQnV0dG9uRG93bkV2ZW50QmluZCk7XHJcbiAgICAgICAgdGhpcy5lbnRpdHkub24oJ21vdXNldXAnLCB0aGlzLl9vbkJ1dHRvblVwRXZlbnRCaW5kKTtcclxuICAgICAgICB0aGlzLmVudGl0eS5vbignbW91c2VlbnRlcicsIHRoaXMuX29uQnV0dG9uRW50ZXJFdmVudEJpbmQpO1xyXG4gICAgICAgIHRoaXMuZW50aXR5Lm9uKCdtb3VzZWxlYXZlJywgdGhpcy5fb25CdXR0b25MZWF2ZUV2ZW50QmluZCk7XHJcbiAgICB9LFxyXG4gICAgLy9cclxuICAgIG9uRW5hYmxlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIG5Db2xvcjtcclxuICAgICAgICBpZiAoISB0aGlzLmhhc0Rpc2FibGVkKSB7XHJcbiAgICAgICAgICAgIG5Db2xvciA9IHRoaXMuX25vcm1hbENvbG9yIHx8IEZpcmUuQ29sb3Iud2hpdGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBuQ29sb3IgPSB0aGlzLmRpc2FibGVkQ29sb3I7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuYnRuUmVuZGVyLmNvbG9yID0gbkNvbG9yO1xyXG4gICAgICAgIHRoaXMuYnRuUmVuZGVyLnNwcml0ZSA9IHRoaXMuX25vcm1hbFNwcml0ZTtcclxuICAgIH0sXHJcbiAgICAvLyDplIDmr4Hml7ZcclxuICAgIG9uRGVzdHJveTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuZW50aXR5Lm9mZignbW91c2Vkb3duJywgdGhpcy5fb25CdXR0b25Eb3duRXZlbnRCaW5kKTtcclxuICAgICAgICB0aGlzLmVudGl0eS5vZmYoJ21vdXNldXAnLCB0aGlzLl9vbkJ1dHRvblVwRXZlbnRCaW5kKTtcclxuICAgICAgICB0aGlzLmVudGl0eS5vZmYoJ21vdXNlZW50ZXInLCB0aGlzLl9vbkJ1dHRvbkVudGVyRXZlbnRCaW5kKTtcclxuICAgICAgICB0aGlzLmVudGl0eS5vZmYoJ21vdXNlbGVhdmUnLCB0aGlzLl9vbkJ1dHRvbkxlYXZlRXZlbnRCaW5kKTtcclxuICAgIH1cclxufSk7XHJcblxyXG5GaXJlLlVJQnV0dG9uID0gVUlCdXR0b247XHJcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnNmYzM2FCRFd3RkswWmZiQm5GeTV6VnUnLCAnVUlQb3B1cExpc3QnKTtcbi8vIHNjcmlwdFxcY29tbW9uXFxVSVBvcHVwTGlzdC5qc1xuXG52YXIgUm9vbVR5cGUgPSBGaXJlLmRlZmluZUVudW0oe1xyXG4gICAgbGl2aW5nUm9vbTogLTEsICAvL+WuouWOhVxyXG4gICAgYmVkUm9vbTogLTEsICAgICAvL+WNp+WupFxyXG4gICAga2l0Y2hlbjogLTEsICAgICAvL+WOqOaIv1xyXG4gICAgYmF0aHJvb206IC0xLCAgICAvL+a1tOWupFxyXG4gICAgc3R1ZHk6IC0xLCAgICAgICAvL+S5puaIv1xyXG4gICAgZ3ltOiAtMSwgICAgICAgICAvL+WBpei6q+aIv1xyXG4gICAgYmFsY29ueTogLTEsICAgICAvL+mYs+WPsFxyXG4gICAgZ2FyZGVuOiAtMSAgICAgICAvL+iKseWbrVxyXG59KTtcclxuXHJcbi8vIOS4i+aLieWIl+ihqFxyXG52YXIgVUlQb3B1cExpc3QgPSBGaXJlLkNsYXNzKHtcclxuICAgIC8vIOe7p+aJv1xyXG4gICAgZXh0ZW5kczogRmlyZS5Db21wb25lbnQsXHJcbiAgICAvLyDmnoTpgKDlh73mlbBcclxuICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5yb29tVHlwZUxpc3QgPSBbXTtcclxuICAgICAgICB0aGlzLmJpbmRTaG93TGlzdEV2ZW50ID0gdGhpcy5vblNob3dMaXN0RXZlbnQuYmluZCh0aGlzKTtcclxuICAgIH0sXHJcbiAgICAvL1xyXG4gICAgcHJvcGVydGllczoge1xyXG4gICAgICAgIC8vIOaIv+mXtOexu+Wei1xyXG4gICAgICAgIHJvb21UeXBlOiAtMSxcclxuICAgICAgICAvLyDngrnlh7vljLrln5/lvLnlh7rliJfooahcclxuICAgICAgICBidG5fcm9vbVR5cGU6IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5VSUJ1dHRvblxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g5LiL5ouJ5YiX6KGoXHJcbiAgICAgICAgZHJvZG93bkxpc3Q6IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5FbnRpdHlcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8g5pi+56S65LiL5ouJ5YiX6KGoXHJcbiAgICBvblNob3dMaXN0RXZlbnQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLmRyb2Rvd25MaXN0LmFjdGl2ZSA9ICF0aGlzLmRyb2Rvd25MaXN0LmFjdGl2ZTtcclxuICAgIH0sXHJcbiAgICAvLyDojrflj5bmiL/pl7TnsbvlnovmloflrZdcclxuICAgIF9nZXRSb29tVHlwZVRleHQ6IGZ1bmN0aW9uICh0eXBlKSB7XHJcbiAgICAgICAgdmFyIHN0ciA9ICfpgInmi6nnsbvlnosuLic7XHJcbiAgICAgICAgc3dpdGNoKHR5cGUpe1xyXG4gICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICBzdHIgPSAn5a6i5Y6FJztcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgICAgICBzdHIgPSAn5Y2n5a6kJztcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgICAgICAgICBzdHIgPSAn5Y6o5oi/JztcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDQ6XHJcbiAgICAgICAgICAgICAgICBzdHIgPSAn5rW05a6kJztcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDU6XHJcbiAgICAgICAgICAgICAgICBzdHIgPSAn5Lmm5oi/JztcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDY6XHJcbiAgICAgICAgICAgICAgICBzdHIgPSAn5YGl6Lqr5oi/JztcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDc6XHJcbiAgICAgICAgICAgICAgICBzdHIgPSAn6Ziz5Y+wJztcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDg6XHJcbiAgICAgICAgICAgICAgICBzdHIgPSAn6Iqx5ZutJztcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc3RyO1xyXG4gICAgfSxcclxuICAgIC8vIOmAieaLqeexu+Wei1xyXG4gICAgb25TZWxlY3RUeXBlRXZlbnQ6IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgIHRoaXMuZHJvZG93bkxpc3QuYWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5yb29tVHlwZSA9IHBhcnNlSW50KGV2ZW50LnRhcmdldC5uYW1lKTtcclxuICAgICAgICB0aGlzLmJ0bl9yb29tVHlwZS5zZXRUZXh0KHRoaXMuX2dldFJvb21UeXBlVGV4dCh0aGlzLnJvb21UeXBlKSk7XHJcbiAgICB9LFxyXG4gICAgLy8g6byg5qCH5oyJ5LiLXHJcbiAgICBvbk1vdXNlRG93bkV2ZW50OiBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICBpZiAodGhpcy5kcm9kb3duTGlzdC5hY3RpdmUgJiYgdGhpcy5yb29tVHlwZUxpc3QuaW5kZXhPZihldmVudC50YXJnZXQpID09PSAtMSkge1xyXG4gICAgICAgICAgICB0aGlzLmRyb2Rvd25MaXN0LmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvLyDliJ3lp4vljJbkuIvmi4nliJfooahcclxuICAgIF9pbmlpRHJvcERvd25MaXN0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5yb29tVHlwZUxpc3QgPSBbXTtcclxuICAgICAgICB2YXIgaW5kZXggPSAxO1xyXG4gICAgICAgIGZvciAodmFyIGkgaW4gUm9vbVR5cGUpIHtcclxuICAgICAgICAgICAgdmFyIGVudCA9IEZpcmUuaW5zdGFudGlhdGUodGhpcy5zZGF0YUJhc2UudGVtcFJvb21UeXBlKTtcclxuICAgICAgICAgICAgZW50LnBhcmVudCA9IHRoaXMuZHJvZG93bkxpc3Q7XHJcbiAgICAgICAgICAgIGVudC50cmFuc2Zvcm0ucG9zaXRpb24gPSBuZXcgRmlyZS5WZWMyKDAsIDE4MCAtICgoaW5kZXggLSAxKSAqIDUwKSk7XHJcbiAgICAgICAgICAgIGVudC5uYW1lID0gaW5kZXg7XHJcbiAgICAgICAgICAgIHZhciBidG4gPSBlbnQuZ2V0Q29tcG9uZW50KEZpcmUuVUlCdXR0b24pO1xyXG4gICAgICAgICAgICBidG4uc2V0VGV4dCh0aGlzLl9nZXRSb29tVHlwZVRleHQoaW5kZXgpKTtcclxuICAgICAgICAgICAgYnRuLm9uQ2xpY2sgPSB0aGlzLm9uU2VsZWN0VHlwZUV2ZW50LmJpbmQodGhpcyk7XHJcbiAgICAgICAgICAgIHRoaXMucm9vbVR5cGVMaXN0LnB1c2goZW50KTtcclxuICAgICAgICAgICAgaW5kZXgrKztcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8g5byA5aeLXHJcbiAgICBzdGFydDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIC8vIOW4uOeUqOeahOWPmOmHjy/mlbDmja5cclxuICAgICAgICB2YXIgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL1NEYXRhQmFzZScpO1xyXG4gICAgICAgIHRoaXMuc2RhdGFCYXNlID0gZW50LmdldENvbXBvbmVudCgnU0RhdGFCYXNlJyk7XHJcbiAgICAgICAgLy8g5omT5byA5LiL5ouJ6I+c5Y2VXHJcbiAgICAgICAgdGhpcy5idG5fcm9vbVR5cGUub25DbGljayA9IHRoaXMuYmluZFNob3dMaXN0RXZlbnQ7XHJcbiAgICAgICAgLy9cclxuICAgICAgICB0aGlzLl9pbmlpRHJvcERvd25MaXN0KCk7XHJcbiAgICAgICAgLy9cclxuICAgICAgICB0aGlzLmJpbmRlZE1vdXNlRG93bkV2ZW50ID0gdGhpcy5vbk1vdXNlRG93bkV2ZW50LmJpbmQodGhpcyk7XHJcbiAgICAgICAgRmlyZS5JbnB1dC5vbignbW91c2Vkb3duJywgdGhpcy5iaW5kZWRNb3VzZURvd25FdmVudCk7XHJcbiAgICB9LFxyXG4gICAgb25EZXN0cm95OiBmdW5jdGlvbigpIHtcclxuICAgICAgICBGaXJlLklucHV0Lm9mZignbW91c2Vkb3duJywgdGhpcy5iaW5kZWRNb3VzZURvd25FdmVudCk7XHJcbiAgICB9XHJcbn0pO1xyXG5GaXJlLlVJUG9wdXBMaXN0ID0gVUlQb3B1cExpc3Q7XHJcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnc3ByaXRlLWFuaW1hdGlvbi1jbGlwJyk7XG4vLyBzcHJpdGUtYW5pbWF0aW9uLWNsaXAuanNcblxuKGZ1bmN0aW9uICgpIHtcblxyXG4vKipcclxuICogQGNsYXNzIFNwcml0ZUFuaW1hdGlvbkNsaXBcclxuICovXHJcblxyXG4vKipcclxuICogQGVudW0gU3ByaXRlQW5pbWF0aW9uQ2xpcC5XcmFwTW9kZVxyXG4gKi9cclxudmFyIFdyYXBNb2RlID0gRmlyZS5kZWZpbmVFbnVtKHtcclxuICAgIC8qKlxyXG4gICAgICogQHByb3BlcnR5IERlZmF1bHRcclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIERlZmF1bHQ6IC0xLFxyXG4gICAgLyoqXHJcbiAgICAgKiBAcHJvcGVydHkgT25jZVxyXG4gICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgT25jZTogLTEsXHJcbiAgICAvKipcclxuICAgICAqIEBwcm9wZXJ0eSBMb29wXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBMb29wOiAtMSxcclxuICAgIC8qKlxyXG4gICAgICogQHByb3BlcnR5IFBpbmdQb25nXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBQaW5nUG9uZzogLTEsXHJcbiAgICAvKipcclxuICAgICAqIEBwcm9wZXJ0eSBDbGFtcEZvcmV2ZXJcclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIENsYW1wRm9yZXZlcjogLTFcclxufSk7XHJcblxyXG4vKipcclxuICogQGVudW0gU3ByaXRlQW5pbWF0aW9uQ2xpcC5TdG9wQWN0aW9uXHJcbiAqL1xyXG52YXIgU3RvcEFjdGlvbiA9IEZpcmUuZGVmaW5lRW51bSh7XHJcbiAgICAvKipcclxuICAgICAqIERvIG5vdGhpbmdcclxuICAgICAqIEBwcm9wZXJ0eSBEb05vdGhpbmdcclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIERvTm90aGluZzogLTEsXHJcbiAgICAvKipcclxuICAgICAqIFNldCB0byBkZWZhdWx0IHNwcml0ZSB3aGVuIHRoZSBzcHJpdGUgYW5pbWF0aW9uIHN0b3BwZWRcclxuICAgICAqIEBwcm9wZXJ0eSBEZWZhdWx0U3ByaXRlXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBEZWZhdWx0U3ByaXRlOiAxLFxyXG4gICAgLyoqXHJcbiAgICAgKiBIaWRlIHRoZSBzcHJpdGUgd2hlbiB0aGUgc3ByaXRlIGFuaW1hdGlvbiBzdG9wcGVkXHJcbiAgICAgKiBAcHJvcGVydHkgSGlkZVxyXG4gICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgSGlkZTogLTEsXHJcbiAgICAvKipcclxuICAgICAqIERlc3Ryb3kgdGhlIGVudGl0eSB0aGUgc3ByaXRlIGJlbG9uZ3MgdG8gd2hlbiB0aGUgc3ByaXRlIGFuaW1hdGlvbiBzdG9wcGVkXHJcbiAgICAgKiBAcHJvcGVydHkgRGVzdHJveVxyXG4gICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgRGVzdHJveTogLTFcclxufSk7XHJcblxyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuLy8vIFRoZSBzdHJ1Y3R1cmUgdG8gZGVzY3JpcCBhIGZyYW1lIGluIHRoZSBzcHJpdGUgYW5pbWF0aW9uIGNsaXBcclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbnZhciBGcmFtZUluZm8gPSBGaXJlLmRlZmluZSgnRnJhbWVJbmZvJylcclxuICAgIC5wcm9wKCdzcHJpdGUnLCBudWxsLCBGaXJlLk9iamVjdFR5cGUoRmlyZS5TcHJpdGUpKVxyXG4gICAgLnByb3AoJ2ZyYW1lcycsIDAsIEZpcmUuSW50ZWdlcl9PYnNvbGV0ZWQpO1xyXG5cclxuLyoqXHJcbiAqIFRoZSBzcHJpdGUgYW5pbWF0aW9uIGNsaXAuXHJcbiAqIEBjbGFzcyBTcHJpdGVBbmltYXRpb25DbGlwXHJcbiAqIEBleHRlbmRzIEN1c3RvbUFzc2V0XHJcbiAqIEBjb25zdHJ1Y3RvclxyXG4gKi9cclxudmFyIFNwcml0ZUFuaW1hdGlvbkNsaXAgPSBGaXJlLkNsYXNzKHtcclxuICAgIG5hbWU6ICdGaXJlLlNwcml0ZUFuaW1hdGlvbkNsaXAnLFxyXG4gICAgLy9cclxuICAgIGV4dGVuZHM6IEZpcmUuQ3VzdG9tQXNzZXQsXHJcbiAgICAvL1xyXG4gICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIC8vIHRoZSBhcnJheSBvZiB0aGUgZW5kIGZyYW1lIG9mIGVhY2ggZnJhbWUgaW5mb1xyXG4gICAgICAgIHRoaXMuX2ZyYW1lSW5mb0ZyYW1lcyA9IG51bGw7XHJcbiAgICB9LFxyXG4gICAgLy9cclxuICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBEZWZhdWx0IHdyYXAgbW9kZS5cclxuICAgICAgICAgKiBAcHJvcGVydHkgd3JhcE1vZGVcclxuICAgICAgICAgKiBAdHlwZSB7U3ByaXRlQW5pbWF0aW9uQ2xpcC5XcmFwTW9kZX1cclxuICAgICAgICAgKiBAZGVmYXVsdCBTcHJpdGVBbmltYXRpb25DbGlwLldyYXBNb2RlLkRlZmF1bHRcclxuICAgICAgICAgKi9cclxuICAgICAgICB3cmFwTW9kZToge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBXcmFwTW9kZS5EZWZhdWx0LFxyXG4gICAgICAgICAgICB0eXBlOiBXcmFwTW9kZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVGhlIGRlZmF1bHQgdHlwZSBvZiBhY3Rpb24gdXNlZCB3aGVuIHRoZSBhbmltYXRpb24gc3RvcHBlZC5cclxuICAgICAgICAgKiBAcHJvcGVydHkgc3RvcEFjdGlvblxyXG4gICAgICAgICAqIEB0eXBlIHtTcHJpdGVBbmltYXRpb25DbGlwLlN0b3BBY3Rpb259XHJcbiAgICAgICAgICogQGRlZmF1bHQgU3ByaXRlQW5pbWF0aW9uQ2xpcC5TdG9wQWN0aW9uLkRvTm90aGluZ1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHN0b3BBY3Rpb246IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogU3RvcEFjdGlvbi5Eb05vdGhpbmcsXHJcbiAgICAgICAgICAgIHR5cGU6IFN0b3BBY3Rpb25cclxuICAgICAgICB9LFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICogVGhlIGRlZmF1bHQgc3BlZWQgb2YgdGhlIGFuaW1hdGlvbiBjbGlwLlxyXG4gICAgICAgICogQHByb3BlcnR5IHNwZWVkXHJcbiAgICAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICAgICogQGRlZmF1bHQgMVxyXG4gICAgICAgICovXHJcbiAgICAgICAgc3BlZWQ6IDEsXHJcbiAgICAgICAgLy9cclxuICAgICAgICBfZnJhbWVSYXRlOiA2MCxcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBUaGUgc2FtcGxlIHJhdGUgdXNlZCBpbiB0aGlzIGFuaW1hdGlvbiBjbGlwLlxyXG4gICAgICAgICAqIEBwcm9wZXJ0eSBmcmFtZVJhdGVcclxuICAgICAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICAgICAqIEBkZWZhdWx0IDYwXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnJhbWVSYXRlOiB7XHJcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fZnJhbWVSYXRlO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlICE9PSB0aGlzLl9mcmFtZVJhdGUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9mcmFtZVJhdGUgPSBNYXRoLnJvdW5kKE1hdGgubWF4KHZhbHVlLCAxKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFRoZSBmcmFtZSBpbmZvcyBpbiB0aGUgc3ByaXRlIGFuaW1hdGlvbiBjbGlwcy5cclxuICAgICAgICAgKiBhcmUgYXJyYXkgb2Yge3Nwcml0ZTogU3ByaXRlLCBmcmFtZXM6IFN1c3RhaW5lZF9ob3dfbWFueV9mcmFtZXN9XHJcbiAgICAgICAgICogQHByb3BlcnR5IGZyYW1lSW5mb3NcclxuICAgICAgICAgKiBAdHlwZSB7b2JqZWN0W119XHJcbiAgICAgICAgICogQGRlZmF1bHQgW11cclxuICAgICAgICAgKi9cclxuICAgICAgICBmcmFtZUluZm9zOntcclxuICAgICAgICAgICAgZGVmYXVsdDogW10sXHJcbiAgICAgICAgICAgIHR5cGU6IEZyYW1lSW5mb1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvL1xyXG4gICAgZ2V0VG90YWxGcmFtZXM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBmcmFtZXMgPSAwO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5mcmFtZUluZm9zLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgIGZyYW1lcyArPSB0aGlzLmZyYW1lSW5mb3NbaV0uZnJhbWVzO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZnJhbWVzO1xyXG4gICAgfSxcclxuICAgIC8vXHJcbiAgICBnZXRGcmFtZUluZm9GcmFtZXM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9mcmFtZUluZm9GcmFtZXMgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgdGhpcy5fZnJhbWVJbmZvRnJhbWVzID0gbmV3IEFycmF5KHRoaXMuZnJhbWVJbmZvcy5sZW5ndGgpO1xyXG4gICAgICAgICAgICB2YXIgdG90YWxGcmFtZXMgPSAwO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZnJhbWVJbmZvcy5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICAgICAgdG90YWxGcmFtZXMgKz0gdGhpcy5mcmFtZUluZm9zW2ldLmZyYW1lcztcclxuICAgICAgICAgICAgICAgIHRoaXMuX2ZyYW1lSW5mb0ZyYW1lc1tpXSA9IHRvdGFsRnJhbWVzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLl9mcmFtZUluZm9GcmFtZXM7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxuU3ByaXRlQW5pbWF0aW9uQ2xpcC5XcmFwTW9kZSA9IFdyYXBNb2RlO1xyXG5cclxuU3ByaXRlQW5pbWF0aW9uQ2xpcC5TdG9wQWN0aW9uID0gU3RvcEFjdGlvbjtcclxuXHJcbkZpcmUuYWRkQ3VzdG9tQXNzZXRNZW51KFNwcml0ZUFuaW1hdGlvbkNsaXAsIFwiTmV3IFNwcml0ZSBBbmltYXRpb25cIik7XHJcblxyXG5GaXJlLlNwcml0ZUFuaW1hdGlvbkNsaXAgPSBTcHJpdGVBbmltYXRpb25DbGlwO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTcHJpdGVBbmltYXRpb25DbGlwO1xyXG59KSgpO1xuXG5GaXJlLl9SRnBvcCgpOyIsIkZpcmUuX1JGcHVzaChtb2R1bGUsICdzcHJpdGUtYW5pbWF0aW9uLXN0YXRlJyk7XG4vLyBzcHJpdGUtYW5pbWF0aW9uLXN0YXRlLmpzXG5cbihmdW5jdGlvbiAoKSB7XG52YXIgU3ByaXRlQW5pbWF0aW9uQ2xpcCA9IHJlcXVpcmUoJ3Nwcml0ZS1hbmltYXRpb24tY2xpcCcpO1xyXG5cclxuLyoqXHJcbiAqIFRoZSBzcHJpdGUgYW5pbWF0aW9uIHN0YXRlLlxyXG4gKiBAY2xhc3MgU3ByaXRlQW5pbWF0aW9uU3RhdGVcclxuICogQGNvbnN0cnVjdG9yXHJcbiAqIEBwYXJhbSB7U3ByaXRlQW5pbWF0aW9uQ2xpcH0gYW5pbUNsaXBcclxuICovXHJcbnZhciBTcHJpdGVBbmltYXRpb25TdGF0ZSA9IGZ1bmN0aW9uIChhbmltQ2xpcCkge1xyXG4gICAgaWYgKCFhbmltQ2xpcCkge1xyXG4vLyBAaWYgREVWXHJcbiAgICAgICAgRmlyZS5lcnJvcignVW5zcGVjaWZpZWQgc3ByaXRlIGFuaW1hdGlvbiBjbGlwJyk7XHJcbi8vIEBlbmRpZlxyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogVGhlIG5hbWUgb2YgdGhlIHNwcml0ZSBhbmltYXRpb24gc3RhdGUuXHJcbiAgICAgKiBAcHJvcGVydHkgbmFtZVxyXG4gICAgICogQHR5cGUge3N0cmluZ31cclxuICAgICAqL1xyXG4gICAgdGhpcy5uYW1lID0gYW5pbUNsaXAubmFtZTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIHJlZmVyZW5jZWQgc3ByaXRlIGFuaW1hdGlvbiBjbGlwXHJcbiAgICAgKiBAcHJvcGVydHkgY2xpcFxyXG4gICAgICogQHR5cGUge1Nwcml0ZUFuaW1hdGlvbkNsaXB9XHJcbiAgICAgKi9cclxuICAgIHRoaXMuY2xpcCA9IGFuaW1DbGlwO1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgd3JhcCBtb2RlXHJcbiAgICAgKiBAcHJvcGVydHkgd3JhcE1vZGVcclxuICAgICAqIEB0eXBlIHtTcHJpdGVBbmltYXRpb25DbGlwLldyYXBNb2RlfVxyXG4gICAgICovXHJcbiAgICB0aGlzLndyYXBNb2RlID0gYW5pbUNsaXAud3JhcE1vZGU7XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBzdG9wIGFjdGlvblxyXG4gICAgICogQHByb3BlcnR5IHN0b3BBY3Rpb25cclxuICAgICAqIEB0eXBlIHtTcHJpdGVBbmltYXRpb25DbGlwLlN0b3BBY3Rpb259XHJcbiAgICAgKi9cclxuICAgIHRoaXMuc3RvcEFjdGlvbiA9IGFuaW1DbGlwLnN0b3BBY3Rpb247XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBzcGVlZCB0byBwbGF5IHRoZSBzcHJpdGUgYW5pbWF0aW9uIGNsaXBcclxuICAgICAqIEBwcm9wZXJ0eSBzcGVlZFxyXG4gICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgdGhpcy5zcGVlZCA9IGFuaW1DbGlwLnNwZWVkO1xyXG4gICAgLy8gdGhlIGFycmF5IG9mIHRoZSBlbmQgZnJhbWUgb2YgZWFjaCBmcmFtZSBpbmZvIGluIHRoZSBzcHJpdGUgYW5pbWF0aW9uIGNsaXBcclxuICAgIHRoaXMuX2ZyYW1lSW5mb0ZyYW1lcyA9IGFuaW1DbGlwLmdldEZyYW1lSW5mb0ZyYW1lcygpO1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgdG90YWwgZnJhbWUgY291bnQgb2YgdGhlIHNwcml0ZSBhbmltYXRpb24gY2xpcFxyXG4gICAgICogQHByb3BlcnR5IHRvdGFsRnJhbWVzXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICB0aGlzLnRvdGFsRnJhbWVzID0gdGhpcy5fZnJhbWVJbmZvRnJhbWVzLmxlbmd0aCA+IDAgPyB0aGlzLl9mcmFtZUluZm9GcmFtZXNbdGhpcy5fZnJhbWVJbmZvRnJhbWVzLmxlbmd0aCAtIDFdIDogMDtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIGxlbmd0aCBvZiB0aGUgc3ByaXRlIGFuaW1hdGlvbiBpbiBzZWNvbmRzIHdpdGggc3BlZWQgPSAxLjBmXHJcbiAgICAgKiBAcHJvcGVydHkgbGVuZ3RoXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICB0aGlzLmxlbmd0aCA9IHRoaXMudG90YWxGcmFtZXMgLyBhbmltQ2xpcC5mcmFtZVJhdGU7XHJcbiAgICAvLyBUaGUgY3VycmVudCBpbmRleCBvZiBmcmFtZS4gVGhlIHZhbHVlIGNhbiBiZSBsYXJnZXIgdGhhbiB0b3RhbEZyYW1lcy5cclxuICAgIC8vIElmIHRoZSBmcmFtZSBpcyBsYXJnZXIgdGhhbiB0b3RhbEZyYW1lcyBpdCB3aWxsIGJlIHdyYXBwZWQgYWNjb3JkaW5nIHRvIHdyYXBNb2RlLlxyXG4gICAgdGhpcy5mcmFtZSA9IC0xO1xyXG4gICAgLy8gdGhlIGN1cnJlbnQgdGltZSBpbiBzZW9uY2RzXHJcbiAgICB0aGlzLnRpbWUgPSAwO1xyXG4gICAgLy8gY2FjaGUgcmVzdWx0IG9mIEdldEN1cnJlbnRJbmRleFxyXG4gICAgdGhpcy5fY2FjaGVkSW5kZXggPSAtMTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBSZWNvbXB1dGUgYSBuZXcgc3BlZWQgdG8gbWFrZSB0aGUgZHVyYXRpb24gb2YgdGhpcyBhbmltYXRpb24gZXF1YWxzIHRvIHNwZWNpZmllZCB2YWx1ZS5cclxuICogQG1ldGhvZCBzZXREdXJhdGlvblxyXG4gKiBAcGFyYW0ge251bWJlcn0gZHVyYXRpb24gLSBUaGUgZXhwZWN0ZWQgZHVyYXRpb24uXHJcbiAqL1xyXG5TcHJpdGVBbmltYXRpb25TdGF0ZS5wcm90b3R5cGUuc2V0RHVyYXRpb24gPSBmdW5jdGlvbiAoZHVyYXRpb24pIHtcclxuICAgIHRoaXMuc3BlZWQgPSBkdXJhdGlvbiAvIHRoaXMubGVuZ3RoO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFRoZSBjdXJyZW50IGZyYW1lIGluZm8gaW5kZXguXHJcbiAqIEBtZXRob2QgZ2V0Q3VycmVudEluZGV4XHJcbiAqIEByZXR1cm4ge251bWJlcn1cclxuICovXHJcblNwcml0ZUFuaW1hdGlvblN0YXRlLnByb3RvdHlwZS5nZXRDdXJyZW50SW5kZXggPSBmdW5jdGlvbiAoKSB7XHJcbiAgICBpZiAodGhpcy50b3RhbEZyYW1lcyA+IDEpIHtcclxuICAgICAgICAvL2ludCBvbGRGcmFtZSA9IGZyYW1lO1xyXG4gICAgICAgIHRoaXMuZnJhbWUgPSBNYXRoLmZsb29yKHRoaXMudGltZSAqIHRoaXMuY2xpcC5mcmFtZVJhdGUpO1xyXG4gICAgICAgIGlmICh0aGlzLmZyYW1lIDwgMCkge1xyXG4gICAgICAgICAgICB0aGlzLmZyYW1lID0gLXRoaXMuZnJhbWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgd3JhcHBlZEluZGV4O1xyXG4gICAgICAgIGlmICh0aGlzLndyYXBNb2RlICE9PSBTcHJpdGVBbmltYXRpb25DbGlwLldyYXBNb2RlLlBpbmdQb25nKSB7XHJcbiAgICAgICAgICAgIHdyYXBwZWRJbmRleCA9IF93cmFwKHRoaXMuZnJhbWUsIHRoaXMudG90YWxGcmFtZXMgLSAxLCB0aGlzLndyYXBNb2RlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHdyYXBwZWRJbmRleCA9IHRoaXMuZnJhbWU7XHJcbiAgICAgICAgICAgIHZhciBjbnQgPSBNYXRoLmZsb29yKHdyYXBwZWRJbmRleCAvIHRoaXMudG90YWxGcmFtZXMpO1xyXG4gICAgICAgICAgICB3cmFwcGVkSW5kZXggJT0gdGhpcy50b3RhbEZyYW1lcztcclxuICAgICAgICAgICAgaWYgKChjbnQgJiAweDEpID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICB3cmFwcGVkSW5kZXggPSB0aGlzLnRvdGFsRnJhbWVzIC0gMSAtIHdyYXBwZWRJbmRleDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gdHJ5IHRvIHVzZSBjYWNoZWQgZnJhbWUgaW5mbyBpbmRleFxyXG4gICAgICAgIGlmICh0aGlzLl9jYWNoZWRJbmRleCAtIDEgPj0gMCAmJlxyXG4gICAgICAgICAgICB3cmFwcGVkSW5kZXggPj0gdGhpcy5fZnJhbWVJbmZvRnJhbWVzW3RoaXMuX2NhY2hlZEluZGV4IC0gMV0gJiZcclxuICAgICAgICAgICAgd3JhcHBlZEluZGV4IDwgdGhpcy5fZnJhbWVJbmZvRnJhbWVzW3RoaXMuX2NhY2hlZEluZGV4XSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY2FjaGVkSW5kZXg7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBzZWFyY2ggZnJhbWUgaW5mb1xyXG4gICAgICAgIHZhciBmcmFtZUluZm9JbmRleCA9IEZpcmUuYmluYXJ5U2VhcmNoKHRoaXMuX2ZyYW1lSW5mb0ZyYW1lcywgd3JhcHBlZEluZGV4ICsgMSk7XHJcbiAgICAgICAgaWYgKGZyYW1lSW5mb0luZGV4IDwgMCkge1xyXG4gICAgICAgICAgICBmcmFtZUluZm9JbmRleCA9IH5mcmFtZUluZm9JbmRleDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fY2FjaGVkSW5kZXggPSBmcmFtZUluZm9JbmRleDtcclxuICAgICAgICByZXR1cm4gZnJhbWVJbmZvSW5kZXg7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICh0aGlzLnRvdGFsRnJhbWVzID09PSAxKSB7XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gLTE7XHJcbiAgICB9XHJcbn07XHJcblxyXG5mdW5jdGlvbiBfd3JhcCAoX3ZhbHVlLCBfbWF4VmFsdWUsIF93cmFwTW9kZSkge1xyXG4gICAgaWYgKF9tYXhWYWx1ZSA9PT0gMCkge1xyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG4gICAgaWYgKF92YWx1ZSA8IDApIHtcclxuICAgICAgICBfdmFsdWUgPSAtX3ZhbHVlO1xyXG4gICAgfVxyXG4gICAgaWYgKF93cmFwTW9kZSA9PT0gU3ByaXRlQW5pbWF0aW9uQ2xpcC5XcmFwTW9kZS5Mb29wKSB7XHJcbiAgICAgICAgcmV0dXJuIF92YWx1ZSAlIChfbWF4VmFsdWUgKyAxKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKF93cmFwTW9kZSA9PT0gU3ByaXRlQW5pbWF0aW9uQ2xpcC5XcmFwTW9kZS5QaW5nUG9uZykge1xyXG4gICAgICAgIHZhciBjbnQgPSBNYXRoLmZsb29yKF92YWx1ZSAvIF9tYXhWYWx1ZSk7XHJcbiAgICAgICAgX3ZhbHVlICU9IF9tYXhWYWx1ZTtcclxuICAgICAgICBpZiAoY250ICUgMiA9PT0gMSkge1xyXG4gICAgICAgICAgICByZXR1cm4gX21heFZhbHVlIC0gX3ZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIGlmIChfdmFsdWUgPCAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoX3ZhbHVlID4gX21heFZhbHVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBfbWF4VmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIF92YWx1ZTtcclxufVxyXG5cclxuRmlyZS5TcHJpdGVBbmltYXRpb25TdGF0ZSA9IFNwcml0ZUFuaW1hdGlvblN0YXRlO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTcHJpdGVBbmltYXRpb25TdGF0ZTtcclxufSkoKTtcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnc3ByaXRlLWFuaW1hdGlvbicpO1xuLy8gc3ByaXRlLWFuaW1hdGlvbi5qc1xuXG4oZnVuY3Rpb24gKCkge1xudmFyIFNwcml0ZUFuaW1hdGlvbkNsaXAgPSByZXF1aXJlKCdzcHJpdGUtYW5pbWF0aW9uLWNsaXAnKTtcclxudmFyIFNwcml0ZUFuaW1hdGlvblN0YXRlID0gcmVxdWlyZSgnc3ByaXRlLWFuaW1hdGlvbi1zdGF0ZScpO1xyXG5cclxuLyoqXHJcbiAqIFRoZSBzcHJpdGUgYW5pbWF0aW9uIENvbXBvbmVudC5cclxuICogQGNsYXNzIFNwcml0ZUFuaW1hdGlvblxyXG4gKiBAZXh0ZW5kcyBDb21wb25lbnRcclxuICogQGNvbnN0cnVjdG9yXHJcbiAqL1xyXG52YXIgU3ByaXRlQW5pbWF0aW9uID0gRmlyZS5DbGFzcyh7XHJcbiAgICAvL1xyXG4gICAgbmFtZTogXCJGaXJlLlNwcml0ZUFuaW1hdGlvblwiLFxyXG4gICAgLy9cclxuICAgIGV4dGVuZHM6IEZpcmUuQ29tcG9uZW50LFxyXG4gICAgLy9cclxuICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLl9uYW1lVG9TdGF0ZSA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fY3VyQW5pbWF0aW9uID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9zcHJpdGVSZW5kZXJlciA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fZGVmYXVsdFNwcml0ZSA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fbGFzdEZyYW1lSW5kZXggPSAtMTtcclxuICAgICAgICB0aGlzLl9jdXJJbmRleCA9IC0xO1xyXG4gICAgICAgIHRoaXMuX3BsYXlTdGFydEZyYW1lID0gMDsvLyDlnKjosIPnlKhQbGF555qE5b2T5bin55qETGF0ZVVwZGF0ZeS4jei/m+ihjHN0ZXBcclxuICAgIH0sXHJcbiAgICAvL1xyXG4gICAgcHJvcGVydGllczp7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVGhlIGRlZmF1bHQgYW5pbWF0aW9uLlxyXG4gICAgICAgICAqIEBwcm9wZXJ0eSBkZWZhdWx0QW5pbWF0aW9uXHJcbiAgICAgICAgICogQHR5cGUge1Nwcml0ZUFuaW1hdGlvbkNsaXB9XHJcbiAgICAgICAgICogQGRlZmF1bHQgbnVsbFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGRlZmF1bHRBbmltYXRpb246IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5TcHJpdGVBbmltYXRpb25DbGlwXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBUaGUgQW5pbWF0ZWQgY2xpcCBsaXN0LlxyXG4gICAgICAgICAqIEBwcm9wZXJ0eSBhbmltYXRpb25zXHJcbiAgICAgICAgICogQHR5cGUge1Nwcml0ZUFuaW1hdGlvbkNsaXBbXX1cclxuICAgICAgICAgKiBAZGVmYXVsdCBbXVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGFuaW1hdGlvbnM6IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogW10sXHJcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuU3ByaXRlQW5pbWF0aW9uQ2xpcFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy9cclxuICAgICAgICBfcGxheUF1dG9tYXRpY2FsbHk6IHRydWUsXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU2hvdWxkIHRoZSBkZWZhdWx0IGFuaW1hdGlvbiBjbGlwIChBbmltYXRpb24uY2xpcCkgYXV0b21hdGljYWxseSBzdGFydCBwbGF5aW5nIG9uIHN0YXJ0dXAuXHJcbiAgICAgICAgICogQHByb3BlcnR5IHBsYXlBdXRvbWF0aWNhbGx5XHJcbiAgICAgICAgICogQHR5cGUge2Jvb2xlYW59XHJcbiAgICAgICAgICogQGRlZmF1bHQgdHJ1ZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHBsYXlBdXRvbWF0aWNhbGx5OiB7XHJcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fcGxheUF1dG9tYXRpY2FsbHk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9wbGF5QXV0b21hdGljYWxseSA9IHZhbHVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vXHJcbiAgICBfaW5pdDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGluaXRpYWxpemVkID0gKHRoaXMuX25hbWVUb1N0YXRlICE9PSBudWxsKTtcclxuICAgICAgICBpZiAoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3Nwcml0ZVJlbmRlcmVyID0gdGhpcy5lbnRpdHkuZ2V0Q29tcG9uZW50KEZpcmUuU3ByaXRlUmVuZGVyZXIpO1xyXG4gICAgICAgICAgICBpZiAoISB0aGlzLl9zcHJpdGVSZW5kZXJlcikge1xyXG4gICAgICAgICAgICAgICAgRmlyZS5lcnJvcihcIkNhbiBub3QgcGxheSBzcHJpdGUgYW5pbWF0aW9uIGJlY2F1c2UgU3ByaXRlUmVuZGVyZXIgaXMgbm90IGZvdW5kXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9kZWZhdWx0U3ByaXRlID0gdGhpcy5fc3ByaXRlUmVuZGVyZXIuc3ByaXRlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLl9uYW1lVG9TdGF0ZSA9IHt9O1xyXG4gICAgICAgICAgICB2YXIgc3RhdGUgPSBudWxsO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuYW5pbWF0aW9ucy5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGNsaXAgPSB0aGlzLmFuaW1hdGlvbnNbaV07XHJcbiAgICAgICAgICAgICAgICBpZiAoY2xpcCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlID0gbmV3IFNwcml0ZUFuaW1hdGlvblN0YXRlKGNsaXApO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX25hbWVUb1N0YXRlW3N0YXRlLm5hbWVdID0gc3RhdGU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRlZmF1bHRBbmltYXRpb24gJiYgIXRoaXMuZ2V0QW5pbVN0YXRlKHRoaXMuZGVmYXVsdEFuaW1hdGlvbi5uYW1lKSkge1xyXG4gICAgICAgICAgICAgICAgc3RhdGUgPSBuZXcgU3ByaXRlQW5pbWF0aW9uU3RhdGUodGhpcy5kZWZhdWx0QW5pbWF0aW9uKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX25hbWVUb1N0YXRlW3N0YXRlLm5hbWVdID0gc3RhdGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0IEFuaW1hdGlvbiBTdGF0ZS5cclxuICAgICAqIEBtZXRob2QgZ2V0QW5pbVN0YXRlXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gYW5pbU5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgYW5pbWF0aW9uXHJcbiAgICAgKiBAcmV0dXJuIHtTcHJpdGVBbmltYXRpb25TdGF0ZX1cclxuICAgICAqL1xyXG4gICAgZ2V0QW5pbVN0YXRlOiBmdW5jdGlvbiAobmFtZSkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9uYW1lVG9TdGF0ZSAmJiB0aGlzLl9uYW1lVG9TdGF0ZVtuYW1lXTtcclxuICAgIH0sXHJcbiAgICAvKipcclxuICAgICAqIEluZGljYXRlcyB3aGV0aGVyIHRoZSBhbmltYXRpb24gaXMgcGxheWluZ1xyXG4gICAgICogQG1ldGhvZCBpc1BsYXlpbmdcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbbmFtZV0gLSBUaGUgbmFtZSBvZiB0aGUgYW5pbWF0aW9uXHJcbiAgICAgKiBAcmV0dXJuIHtib29sZWFufVxyXG4gICAgICovXHJcbiAgICBpc1BsYXlpbmc6IGZ1bmN0aW9uKG5hbWUpIHtcclxuICAgICAgICB2YXIgcGxheWluZ0FuaW0gPSB0aGlzLmVuYWJsZWQgJiYgdGhpcy5fY3VyQW5pbWF0aW9uO1xyXG4gICAgICAgIHJldHVybiAhIXBsYXlpbmdBbmltICYmICggIW5hbWUgfHwgcGxheWluZ0FuaW0ubmFtZSA9PT0gbmFtZSApO1xyXG4gICAgfSxcclxuICAgIC8qKlxyXG4gICAgICogUGxheSBBbmltYXRpb25cclxuICAgICAqIEBtZXRob2QgcGxheVxyXG4gICAgICogQHBhcmFtIHtTcHJpdGVBbmltYXRpb25TdGF0ZX0gW2FuaW1TdGF0ZV0gLSBUaGUgYW5pbVN0YXRlIG9mIHRoZSBzcHJpdGUgQW5pbWF0aW9uIHN0YXRlIG9yIGFuaW1hdGlvbiBuYW1lXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3RpbWVdIC0gVGhlIHRpbWUgb2YgdGhlIGFuaW1hdGlvbiB0aW1lXHJcbiAgICAgKi9cclxuICAgIHBsYXk6IGZ1bmN0aW9uIChhbmltU3RhdGUsIHRpbWUpIHtcclxuICAgICAgICBpZiAodHlwZW9mIGFuaW1TdGF0ZSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgdGhpcy5fY3VyQW5pbWF0aW9uID0gdGhpcy5nZXRBbmltU3RhdGUoYW5pbVN0YXRlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2N1ckFuaW1hdGlvbiA9IGFuaW1TdGF0ZSB8fCBuZXcgU3ByaXRlQW5pbWF0aW9uU3RhdGUodGhpcy5kZWZhdWx0QW5pbWF0aW9uKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLl9jdXJBbmltYXRpb24gIT09IG51bGwpIHtcclxuICAgICAgICAgICAgdGhpcy5fY3VySW5kZXggPSAtMTtcclxuICAgICAgICAgICAgdGhpcy5fY3VyQW5pbWF0aW9uLnRpbWUgPSB0aW1lIHx8IDA7XHJcbiAgICAgICAgICAgIHRoaXMuX3BsYXlTdGFydEZyYW1lID0gRmlyZS5UaW1lLmZyYW1lQ291bnQ7XHJcbiAgICAgICAgICAgIHRoaXMuX3NhbXBsZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvKipcclxuICAgICAqIFN0b3AgQW5pbWF0aW9uXHJcbiAgICAgKiBAbWV0aG9kIHN0b3BcclxuICAgICAqIEBwYXJhbSB7U3ByaXRlQW5pbWF0aW9uU3RhdGV9IFthbmltU3RhdGVdIC0gVGhlIGFuaW1TdGF0ZSBvZiB0aGUgc3ByaXRlIGFuaW1hdGlvbiBzdGF0ZSBvciBhbmltYXRpb24gbmFtZVxyXG4gICAgICovXHJcbiAgICBzdG9wOiBmdW5jdGlvbiAoYW5pbVN0YXRlKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBhbmltU3RhdGUgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2N1ckFuaW1hdGlvbiA9IHRoaXMuZ2V0QW5pbVN0YXRlKGFuaW1TdGF0ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl9jdXJBbmltYXRpb24gPSBhbmltU3RhdGUgfHwgbmV3IFNwcml0ZUFuaW1hdGlvblN0YXRlKHRoaXMuZGVmYXVsdEFuaW1hdGlvbik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5fY3VyQW5pbWF0aW9uICE9PSBudWxsKSB7XHJcblxyXG4gICAgICAgICAgICB0aGlzLl9jdXJBbmltYXRpb24udGltZSA9IDA7XHJcblxyXG4gICAgICAgICAgICB2YXIgc3RvcEFjdGlvbiA9IHRoaXMuX2N1ckFuaW1hdGlvbi5zdG9wQWN0aW9uO1xyXG5cclxuICAgICAgICAgICAgc3dpdGNoIChzdG9wQWN0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIFNwcml0ZUFuaW1hdGlvbkNsaXAuU3RvcEFjdGlvbi5Eb05vdGhpbmc6XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIFNwcml0ZUFuaW1hdGlvbkNsaXAuU3RvcEFjdGlvbi5EZWZhdWx0U3ByaXRlOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3Nwcml0ZVJlbmRlcmVyLnNwcml0ZSA9IHRoaXMuX2RlZmF1bHRTcHJpdGU7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIFNwcml0ZUFuaW1hdGlvbkNsaXAuU3RvcEFjdGlvbi5IaWRlOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3Nwcml0ZVJlbmRlcmVyLmVuYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgU3ByaXRlQW5pbWF0aW9uQ2xpcC5TdG9wQWN0aW9uLkRlc3Ryb3k6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbnRpdHkuZGVzdHJveSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5fY3VyQW5pbWF0aW9uID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgb25Mb2FkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgaWYgKHRoaXMuZW5hYmxlZCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fcGxheUF1dG9tYXRpY2FsbHkgJiYgdGhpcy5kZWZhdWx0QW5pbWF0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgYW5pbVN0YXRlID0gdGhpcy5nZXRBbmltU3RhdGUodGhpcy5kZWZhdWx0QW5pbWF0aW9uLm5hbWUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbGF5KGFuaW1TdGF0ZSwgMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgbGF0ZVVwZGF0ZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2N1ckFuaW1hdGlvbiAhPT0gbnVsbCAmJiBGaXJlLlRpbWUuZnJhbWVDb3VudCA+IHRoaXMuX3BsYXlTdGFydEZyYW1lKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWx0YSA9IEZpcmUuVGltZS5kZWx0YVRpbWUgKiB0aGlzLl9jdXJBbmltYXRpb24uc3BlZWQ7XHJcbiAgICAgICAgICAgIHRoaXMuX3N0ZXAoZGVsdGEpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBfc3RlcDogZnVuY3Rpb24gKGRlbHRhVGltZSkge1xyXG4gICAgICAgIGlmICh0aGlzLl9jdXJBbmltYXRpb24gIT09IG51bGwpIHtcclxuICAgICAgICAgICAgdGhpcy5fY3VyQW5pbWF0aW9uLnRpbWUgKz0gZGVsdGFUaW1lO1xyXG4gICAgICAgICAgICB0aGlzLl9zYW1wbGUoKTtcclxuICAgICAgICAgICAgdmFyIHN0b3AgPSBmYWxzZTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2N1ckFuaW1hdGlvbi53cmFwTW9kZSA9PT0gU3ByaXRlQW5pbWF0aW9uQ2xpcC5XcmFwTW9kZS5PbmNlIHx8XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9jdXJBbmltYXRpb24ud3JhcE1vZGUgPT09IFNwcml0ZUFuaW1hdGlvbkNsaXAuV3JhcE1vZGUuRGVmYXVsdCB8fFxyXG4gICAgICAgICAgICAgICAgdGhpcy5fY3VyQW5pbWF0aW9uLndyYXBNb2RlID09PSBTcHJpdGVBbmltYXRpb25DbGlwLldyYXBNb2RlLkNsYW1wRm9yZXZlcikge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX2N1ckFuaW1hdGlvbi5zcGVlZCA+IDAgJiYgdGhpcy5fY3VyQW5pbWF0aW9uLmZyYW1lID49IHRoaXMuX2N1ckFuaW1hdGlvbi50b3RhbEZyYW1lcykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9jdXJBbmltYXRpb24ud3JhcE1vZGUgPT09IFNwcml0ZUFuaW1hdGlvbkNsaXAuV3JhcE1vZGUuQ2xhbXBGb3JldmVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0b3AgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fY3VyQW5pbWF0aW9uLmZyYW1lID0gdGhpcy5fY3VyQW5pbWF0aW9uLnRvdGFsRnJhbWVzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9jdXJBbmltYXRpb24udGltZSA9IHRoaXMuX2N1ckFuaW1hdGlvbi5mcmFtZSAvIHRoaXMuX2N1ckFuaW1hdGlvbi5jbGlwLmZyYW1lUmF0ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0b3AgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9jdXJBbmltYXRpb24uZnJhbWUgPSB0aGlzLl9jdXJBbmltYXRpb24udG90YWxGcmFtZXM7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5fY3VyQW5pbWF0aW9uLnNwZWVkIDwgMCAmJiB0aGlzLl9jdXJBbmltYXRpb24uZnJhbWUgPCAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX2N1ckFuaW1hdGlvbi53cmFwTW9kZSA9PT0gU3ByaXRlQW5pbWF0aW9uQ2xpcC5XcmFwTW9kZS5DbGFtcEZvcmV2ZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RvcCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9jdXJBbmltYXRpb24udGltZSA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2N1ckFuaW1hdGlvbi5mcmFtZSA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdG9wID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fY3VyQW5pbWF0aW9uLmZyYW1lID0gMDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIGRvIHN0b3BcclxuICAgICAgICAgICAgaWYgKHN0b3ApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3RvcCh0aGlzLl9jdXJBbmltYXRpb24pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl9jdXJJbmRleCA9IC0xO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBfc2FtcGxlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2N1ckFuaW1hdGlvbiAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICB2YXIgbmV3SW5kZXggPSB0aGlzLl9jdXJBbmltYXRpb24uZ2V0Q3VycmVudEluZGV4KCk7XHJcbiAgICAgICAgICAgIGlmIChuZXdJbmRleCA+PSAwICYmIG5ld0luZGV4ICE9PSB0aGlzLl9jdXJJbmRleCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fc3ByaXRlUmVuZGVyZXIuc3ByaXRlID0gdGhpcy5fY3VyQW5pbWF0aW9uLmNsaXAuZnJhbWVJbmZvc1tuZXdJbmRleF0uc3ByaXRlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX2N1ckluZGV4ID0gbmV3SW5kZXg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl9jdXJJbmRleCA9IC0xO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSk7XHJcblxyXG5GaXJlLlNwcml0ZUFuaW1hdGlvbiA9IFNwcml0ZUFuaW1hdGlvbjtcclxuXHJcbkZpcmUuYWRkQ29tcG9uZW50TWVudShTcHJpdGVBbmltYXRpb24sICdTcHJpdGUgQW5pbWF0aW9uJyk7XHJcbn0pKCk7XG5cbkZpcmUuX1JGcG9wKCk7Il19
