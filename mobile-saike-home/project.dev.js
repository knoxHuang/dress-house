require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"Characters":[function(require,module,exports){
Fire._RFpush(module, 'e37cdeJFCZCFqck6C36DQAw', 'Characters');
// script\common\Characters.js

var Comp = Fire.Class({
    // �̳�
    extends: Fire.Component,
    // ���캯��
    constructor: function () {
    },
    // ����
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
    // ��ʼ
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
        var family_name = ent.find('family_name').getComponent(Fire.BitmapText);
        family_name.text = name;
        return ent;
    },

    updateFamily: function (ent, image, name) {
        ent.parent = this.familyRoot;
        ent.position = new Fire.Vec2(0, 0);
        var render = ent.getComponent(Fire.SpriteRenderer);
        render.sprite = new Fire.Sprite(image);
        var family_name = ent.find('family_name').getComponent(Fire.BitmapText);
        family_name.text = name;
    },

    // ����
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
    // �̳�
    extends: Fire.Component,
    // ���캯��
    constructor: function () {
        this.hostName = "";
        this.hostSprite = null;
        this.hostName = "";
        this.sendData = null;
    },
    // ����
    properties: {
        // 1.�������ڲ���ֱ�ӽ���װ�� 2. ��������
        gotoType: -1
    },
    // ��ʼ
    start: function () {

    },
    // ����
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
    // �̳�
    extends: Fire.Component,
    // ���캯��
    constructor: function () {
        this.anim = null;
        this.bindHideOptionsEvent = this._hideOptionsEvent.bind(this);
        this.onHideEvent = null;
    },
    // ����
    properties: {
        // ����ѡ��
        btn_hide: {
            default: null,
            type: Fire.UIButton
        },
        // ɾ������
        btn_del: {
            default: null,
            type: Fire.UIButton
        },
        // ������ת
        btn_MirrorFlip: {
            default: null,
            type: Fire.UIButton
        }
    },
    // �Ƿ�������
    hasOpen: function () {
        return this.entity.active;
    },
    // �Ƿ��д���ѡ��
    hasTouch: function (target) {
        return target === this.btn_hide.entity ||
               target === this.btn_del.entity  ||
               target === this.btn_MirrorFlip.entity;
    },
    // ��������
    setPos: function (value) {
        this.entity.transform.position = value;
    },
    // ����ѡ��
    open: function (target) {
        // ��������
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
    // ����ѡ��
    hide: function () {
        this.entity.active = false;
        this.entity.transform.scale = new Fire.Vec2(0, 0);
        if (this.onHideEvent) {
            this.onHideEvent();
        }
    },
    // ����ѡ��
    _hideOptionsEvent: function() {
        this.hide();
    },
    // ��ʼ
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2Rldi9iaW4vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInNjcmlwdC9jb21tb24vQ2hhcmFjdGVycy5qcyIsInNjcmlwdC92aWxsYS9Db250cm9sTWdyLmpzIiwic2NyaXB0L3ZpbGxhL0RhdGFCYXNlLmpzIiwic2NyaXB0L3ZpbGxhL0ZhbWlseUluZm8uanMiLCJzY3JpcHQvdmlsbGEvRmlyc3RNZW51TWdyLmpzIiwic2NyaXB0L3ZpbGxhL0Zsb29yV2luZG93LmpzIiwic2NyaXB0L3ZpbGxhL0Z1cm5pdHVyZS5qcyIsInNjcmlwdC9jb21tb24vR2xvYmFsRGF0YS5qcyIsInNjcmlwdC92aWxsYS9NYWluTWVudU1nci5qcyIsInNjcmlwdC9vdXRkb29yL01haW5NZW51LmpzIiwic2NyaXB0L3ZpbGxhL01lcmNoYW5kaXNlLmpzIiwic2NyaXB0L291dGRvb3IvTXlBZGRGYW1pbHlXaW5kb3cuanMiLCJzY3JpcHQvdmlsbGEvTmV0d29ya01nci5qcyIsInNjcmlwdC92aWxsYS9OZXdXb3JrV2luZG93LmpzIiwic2NyaXB0L291dGRvb3IvT0RhdGFCYXNlLmpzIiwic2NyaXB0L2NvbW1vbi9PcHRpb25zLmpzIiwic2NyaXB0L3ZpbGxhL090aGVyTWVudU1nci5qcyIsInNjcmlwdC92aWxsYS9QYXlNZW50V2luZG93LmpzIiwic2NyaXB0L291dGRvb3IvUGxhbldpbmRvdy5qcyIsInNjcmlwdC92aWxsYS9QcmljZURlc2NyaXB0aW9uLmpzIiwic2NyaXB0L3NpbmdsZS9TQ29udHJvbE1nci5qcyIsInNjcmlwdC9zaW5nbGUvU0RhdGFCYXNlLmpzIiwic2NyaXB0L3NpbmdsZS9TRXJyb3JQcm9tcHRXaW5kb3cuanMiLCJzY3JpcHQvc2luZ2xlL1NGdXJuaXR1cmUuanMiLCJzY3JpcHQvc2luZ2xlL1NMb2FkaW5nVGlwcy5qcyIsInNjcmlwdC9zaW5nbGUvU01haW5NZW51TWdyLmpzIiwic2NyaXB0L3NpbmdsZS9TTXlEcmVzc1VwRGF0YS5qcyIsInNjcmlwdC9zaW5nbGUvU015RHJlc3NVcFdpbmRvdy5qcyIsInNjcmlwdC9zaW5nbGUvU05ldHdvcmtNZ3IuanMiLCJzY3JpcHQvc2luZ2xlL1NTYXZlUm9vbVdpbmRvdy5qcyIsInNjcmlwdC9zaW5nbGUvU1NlY29uZGFyeU1lbnVNZ3IuanMiLCJzY3JpcHQvc2luZ2xlL1NTZWNvbmRhcnlNZW51LmpzIiwic2NyaXB0L3NpbmdsZS9TVGhyZWVNZW51TWdyLmpzIiwic2NyaXB0L3NpbmdsZS9TVGhyZWVNZW51LmpzIiwic2NyaXB0L3NpbmdsZS9TVGlwc1dpbmRvdy5qcyIsInNjcmlwdC9zaW5nbGUvU2NyZWVuc2hvdC5qcyIsInNjcmlwdC92aWxsYS9TZWNvbmRNZW51TWdyLmpzIiwic2NyaXB0L3ZpbGxhL1NlY29uZE1lbnUuanMiLCJzY3JpcHQvb3V0ZG9vci9TZXJ2ZXJOZXRXb3JrLmpzIiwic2NyaXB0L291dGRvb3IvU3ViTWVudS5qcyIsInNjcmlwdC92aWxsYS9Td2l0Y2hSb29tV2luZG93LmpzIiwic2NyaXB0L3ZpbGxhL1RocmVlTWVudU1nci5qcyIsInNjcmlwdC92aWxsYS9UaHJlZU1lbnUuanMiLCJzY3JpcHQvdmlsbGEvVGlwTG9hZC5qcyIsInNjcmlwdC9vdXRkb29yL1RpcF9NeUFkZC5qcyIsInNjcmlwdC92aWxsYS9UaXBzUGF5TWVudC5qcyIsInNjcmlwdC92aWxsYS9UaXBzUGF5UHJvYmxlbXMuanMiLCJzY3JpcHQvdmlsbGEvVGlwc1dpbmRvdy5qcyIsInNjcmlwdC9jb21tb24vVG9nZ2xlLmpzIiwic2NyaXB0L2NvbW1vbi9Ub29scy5qcyIsInNjcmlwdC9jb21tb24vVUlCdXR0b24uanMiLCJzY3JpcHQvY29tbW9uL1VJUG9wdXBMaXN0LmpzIiwic3ByaXRlLWFuaW1hdGlvbi1jbGlwLmpzIiwic3ByaXRlLWFuaW1hdGlvbi1zdGF0ZS5qcyIsInNwcml0ZS1hbmltYXRpb24uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2dUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOVFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdk1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNVFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNVQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwYUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDelBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3UkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcFZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaGFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJ2UzN2NkZUpGQ1pDRnFjazZDMzZEUUF3JywgJ0NoYXJhY3RlcnMnKTtcbi8vIHNjcmlwdFxcY29tbW9uXFxDaGFyYWN0ZXJzLmpzXG5cbnZhciBDb21wID0gRmlyZS5DbGFzcyh7XHJcbiAgICAvLyDvv73Ms++/vVxyXG4gICAgZXh0ZW5kczogRmlyZS5Db21wb25lbnQsXHJcbiAgICAvLyDvv73vv73vv73suq/vv73vv71cclxuICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiAoKSB7XHJcbiAgICB9LFxyXG4gICAgLy8g77+977+977+977+9XHJcbiAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgaW1hZ2VNYXJnaW46IEZpcmUudjIoMTUwMCwgODAwKSxcclxuICAgICAgICBob3N0OiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuU3ByaXRlUmVuZGVyZXJcclxuICAgICAgICB9LFxyXG4gICAgICAgIGhvc3RfbmFtZToge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiBGaXJlLkJpdG1hcFRleHRcclxuICAgICAgICB9LFxyXG4gICAgICAgIHRlbXBGYW1pbHk6IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5FbnRpdHlcclxuICAgICAgICB9LFxyXG4gICAgICAgIGZhbWlseVJvb3Q6IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5FbnRpdHlcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8g77+977+9yrxcclxuICAgIHN0YXJ0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9EYXRhQmFzZScpO1xyXG4gICAgICAgIGlmKCFlbnQpIHtcclxuICAgICAgICAgICAgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL09EYXRhQmFzZScpO1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFCYXNlID0gZW50LmdldENvbXBvbmVudCgnT0RhdGFCYXNlJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YUJhc2UgPSBlbnQuZ2V0Q29tcG9uZW50KCdEYXRhQmFzZScpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgc2V0SG9zdDogZnVuY3Rpb24gKGltYWdlLCBuYW1lKSB7XHJcbiAgICAgICAgdmFyIG5ld1Nwcml0ZSA9IG5ldyBGaXJlLlNwcml0ZShpbWFnZSk7XHJcbiAgICAgICAgdGhpcy5ob3N0X25hbWUudGV4dCA9IG5hbWU7XHJcbiAgICAgICAgdGhpcy5ob3N0LnNwcml0ZSA9IG5ld1Nwcml0ZVxyXG4gICAgICAgIHRoaXMuZGF0YUJhc2UuZ2xvYmFsRGF0YS5ob3N0U3ByaXRlID0gbmV3U3ByaXRlO1xyXG4gICAgICAgIHRoaXMuZGF0YUJhc2UuZ2xvYmFsRGF0YS5ob3N0TmFtZSA9IG5hbWU7XHJcbiAgICB9LFxyXG5cclxuICAgIGFkZEZhbWlseTogZnVuY3Rpb24gKGltYWdlLCBuYW1lKSB7XHJcbiAgICAgICAgdmFyIGVudCA9IEZpcmUuaW5zdGFudGlhdGUodGhpcy50ZW1wRmFtaWx5KTtcclxuICAgICAgICBlbnQucGFyZW50ID0gdGhpcy5mYW1pbHlSb290O1xyXG4gICAgICAgIGVudC5wb3NpdGlvbiA9IG5ldyBGaXJlLlZlYzIoMCwgMCk7XHJcbiAgICAgICAgdmFyIHJlbmRlciA9IGVudC5nZXRDb21wb25lbnQoRmlyZS5TcHJpdGVSZW5kZXJlcik7XHJcbiAgICAgICAgcmVuZGVyLnNwcml0ZSA9IG5ldyBGaXJlLlNwcml0ZShpbWFnZSk7XHJcbiAgICAgICAgdmFyIGZhbWlseV9uYW1lID0gZW50LmZpbmQoJ2ZhbWlseV9uYW1lJykuZ2V0Q29tcG9uZW50KEZpcmUuQml0bWFwVGV4dCk7XHJcbiAgICAgICAgZmFtaWx5X25hbWUudGV4dCA9IG5hbWU7XHJcbiAgICAgICAgcmV0dXJuIGVudDtcclxuICAgIH0sXHJcblxyXG4gICAgdXBkYXRlRmFtaWx5OiBmdW5jdGlvbiAoZW50LCBpbWFnZSwgbmFtZSkge1xyXG4gICAgICAgIGVudC5wYXJlbnQgPSB0aGlzLmZhbWlseVJvb3Q7XHJcbiAgICAgICAgZW50LnBvc2l0aW9uID0gbmV3IEZpcmUuVmVjMigwLCAwKTtcclxuICAgICAgICB2YXIgcmVuZGVyID0gZW50LmdldENvbXBvbmVudChGaXJlLlNwcml0ZVJlbmRlcmVyKTtcclxuICAgICAgICByZW5kZXIuc3ByaXRlID0gbmV3IEZpcmUuU3ByaXRlKGltYWdlKTtcclxuICAgICAgICB2YXIgZmFtaWx5X25hbWUgPSBlbnQuZmluZCgnZmFtaWx5X25hbWUnKS5nZXRDb21wb25lbnQoRmlyZS5CaXRtYXBUZXh0KTtcclxuICAgICAgICBmYW1pbHlfbmFtZS50ZXh0ID0gbmFtZTtcclxuICAgIH0sXHJcblxyXG4gICAgLy8g77+977+977+977+9XHJcbiAgICB1cGRhdGU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgY2FtZXJhID0gRmlyZS5DYW1lcmEubWFpbjtcclxuICAgICAgICB2YXIgYmdXb3JsZEJvdW5kcyA9IHRoaXMuZGF0YUJhc2UuYmdSZW5kZXIuZ2V0V29ybGRCb3VuZHMoKTtcclxuICAgICAgICB2YXIgYmdMZWZ0VG9wV29ybGRQb3MgPSBuZXcgRmlyZS5WZWMyKGJnV29ybGRCb3VuZHMueE1pbiArIHRoaXMuaW1hZ2VNYXJnaW4ueCwgYmdXb3JsZEJvdW5kcy55TWluICsgdGhpcy5pbWFnZU1hcmdpbi55KTtcclxuICAgICAgICB2YXIgYmdsZWZ0VG9wID0gY2FtZXJhLndvcmxkVG9TY3JlZW4oYmdMZWZ0VG9wV29ybGRQb3MpO1xyXG4gICAgICAgIHZhciBzY3JlZW5Qb3MgPSBuZXcgRmlyZS5WZWMyKGJnbGVmdFRvcC54LCBiZ2xlZnRUb3AueSk7XHJcbiAgICAgICAgdmFyIHdvcmxkUG9zID0gY2FtZXJhLnNjcmVlblRvV29ybGQoc2NyZWVuUG9zKTtcclxuICAgICAgICB0aGlzLmVudGl0eS50cmFuc2Zvcm0ud29ybGRQb3NpdGlvbiA9IHdvcmxkUG9zO1xyXG5cclxuICAgIH1cclxufSk7XHJcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnYWIyMGY5aXNhQk5UNGFMc2djYndFQVEnLCAnQ29udHJvbE1ncicpO1xuLy8gc2NyaXB0XFx2aWxsYVxcQ29udHJvbE1nci5qc1xuXG4vLyDnlKjmiLfovpPlhaXnrqHnkIbnsbtcbnZhciBDb250cm9sTWdyID0gRmlyZS5DbGFzcyh7XG4gICAgLy8g57un5om/XG4gICAgZXh0ZW5kczogRmlyZS5Db21wb25lbnQsXG4gICAgLy8g5p6E6YCg5Ye95pWwXG4gICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5iaW5kZWRNb3VzZURvd25FdmVudCA9IHRoaXMuX29uTW91c2VEb3duRXZlbnQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5iaW5kZWRNb3VzZU1vdmVFdmVudCA9IHRoaXMuX29uTW91c2VNb3ZlRXZlbnQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5iaW5kZWRNb3VzZVVwRXZlbnQgPSB0aGlzLl9vbk1vdXNlVXBFdmVudC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLl9iYWNrdXBTZWxlY3RUYXJnZXQgPSBudWxsO1xuICAgIH0sXG4gICAgLy8g5bGe5oCnXG4gICAgcHJvcGVydGllczoge1xuICAgICAgICBfc2VsZWN0VGFyZ2V0OiBudWxsLFxuICAgICAgICBfbGFzdFNlbGVjdFRhcmdldDogbnVsbCxcbiAgICAgICAgX3NlbGVjdFRhcmdldEluaXRQb3M6IEZpcmUuVmVjMi56ZXJvLFxuICAgICAgICBfbW91c2VEb3duUG9zOiBGaXJlLlZlYzIuemVybyxcbiAgICAgICAgX2hhc01vdmVUYXJnZXQ6IGZhbHNlXG4gICAgfSxcbiAgICAvLyDpvKDmoIfmjInkuIvkuovku7ZcbiAgICBfb25Nb3VzZURvd25FdmVudDogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIHZhciB0YXJnZXQgPSBldmVudC50YXJnZXQ7XG4gICAgICAgIGlmICghdGFyZ2V0ICkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciBlbnQgPSB0YXJnZXQucGFyZW50IHx8IHRhcmdldDtcbiAgICAgICAgdmFyIGZ1cm5pdHVyZSA9IGVudC5nZXRDb21wb25lbnQoJ0Z1cm5pdHVyZScpO1xuICAgICAgICAvLyDlpKfkuo4yIOivtOaYjuWPr+S7peaLluWKqFxuICAgICAgICBpZiAoZnVybml0dXJlICYmIGZ1cm5pdHVyZS5wcm9wc190eXBlID4gMikge1xuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIHRoaXMuX3NlbGVjdFRhcmdldCA9IGVudDtcbiAgICAgICAgICAgIHRoaXMuX2JhY2t1cFNlbGVjdFRhcmdldCA9IHRoaXMuX3NlbGVjdFRhcmdldDtcbiAgICAgICAgICAgIHRoaXMuX3NlbGVjdFRhcmdldEluaXRQb3MgPSBlbnQudHJhbnNmb3JtLnBvc2l0aW9uO1xuICAgICAgICAgICAgdmFyIHNjcmVlbmRQb3MgPSBuZXcgRmlyZS5WZWMyKGV2ZW50LnNjcmVlblgsIGV2ZW50LnNjcmVlblkpO1xuICAgICAgICAgICAgdGhpcy5fbW91c2VEb3duUG9zID0gRmlyZS5DYW1lcmEubWFpbi5zY3JlZW5Ub1dvcmxkKHNjcmVlbmRQb3MpO1xuICAgICAgICAgICAgdGhpcy5fc2VsZWN0VGFyZ2V0LnNldEFzTGFzdFNpYmxpbmcoKTtcbiAgICAgICAgICAgIHRoaXMuX2hhc01vdmVUYXJnZXQgPSB0cnVlO1xuICAgICAgICAgICAgLy8g5piv5ZCm5omT5byA5o6n5Yi26YCJ6aG577yM5aaC5p6c5piv55u45ZCM55qE5a+56LGh5bCx5LiN6ZyA6KaB6YeN5paw5omT5byAXG4gICAgICAgICAgICBpZiAodGhpcy5fc2VsZWN0VGFyZ2V0ICE9PSB0aGlzLl9sYXN0U2VsZWN0VGFyZ2V0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhQmFzZS5vcHRpb25zLm9wZW4odGhpcy5fc2VsZWN0VGFyZ2V0KTtcbiAgICAgICAgICAgICAgICB0aGlzLl9sYXN0U2VsZWN0VGFyZ2V0ID0gdGhpcy5fc2VsZWN0VGFyZ2V0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5kYXRhQmFzZS50aHJlZU1lbnVNZ3IuY2xvc2VNZW51KHRydWUpO1xuICAgICAgICAgICAgdGhpcy5kYXRhQmFzZS5zZWNvbmRNZW51TWdyLmNsb3NlTWVudSh0cnVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmRhdGFCYXNlLm9wdGlvbnMuaGFzT3BlbigpKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZGF0YUJhc2Uub3B0aW9ucy5oYXNUb3VjaCh0YXJnZXQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3NlbGVjdFRhcmdldCA9IHRoaXMuX2JhY2t1cFNlbGVjdFRhcmdldDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3NlbGVjdFRhcmdldCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0YUJhc2Uub3B0aW9ucy5oaWRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyDpvKDmoIfnp7vliqjkuovku7ZcbiAgICBfb25Nb3VzZU1vdmVFdmVudDogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIGlmICh0aGlzLl9zZWxlY3RUYXJnZXQgJiYgdGhpcy5faGFzTW92ZVRhcmdldCkge1xuICAgICAgICAgICAgdGhpcy5fbW92ZShldmVudCk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIOenu+WKqOWutuWFt1xuICAgIF9tb3ZlOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgdmFyIG1vdmVQb3MgPSBuZXcgRmlyZS5WZWMyKGV2ZW50LnNjcmVlblgsIGV2ZW50LnNjcmVlblkpO1xuICAgICAgICB2YXIgbW92ZVdvcmRQb3MgPSBGaXJlLkNhbWVyYS5tYWluLnNjcmVlblRvV29ybGQobW92ZVBvcyk7XG5cbiAgICAgICAgdmFyIG9mZnNldFdvcmRQb3MgPSBGaXJlLlZlYzIuemVybztcbiAgICAgICAgb2Zmc2V0V29yZFBvcy54ID0gdGhpcy5fbW91c2VEb3duUG9zLnggLSBtb3ZlV29yZFBvcy54O1xuICAgICAgICBvZmZzZXRXb3JkUG9zLnkgPSB0aGlzLl9tb3VzZURvd25Qb3MueSAtIG1vdmVXb3JkUG9zLnk7XG5cbiAgICAgICAgdGhpcy5fc2VsZWN0VGFyZ2V0LnRyYW5zZm9ybS54ID0gdGhpcy5fc2VsZWN0VGFyZ2V0SW5pdFBvcy54IC0gb2Zmc2V0V29yZFBvcy54O1xuICAgICAgICB0aGlzLl9zZWxlY3RUYXJnZXQudHJhbnNmb3JtLnkgPSB0aGlzLl9zZWxlY3RUYXJnZXRJbml0UG9zLnkgLSBvZmZzZXRXb3JkUG9zLnk7XG5cbiAgICAgICAgdGhpcy5kYXRhQmFzZS5vcHRpb25zLnNldFBvcyh0aGlzLl9zZWxlY3RUYXJnZXQudHJhbnNmb3JtLndvcmxkUG9zaXRpb24pO1xuICAgIH0sXG4gICAgLy8g6byg5qCH6YeK5pS+5LqL5Lu2XG4gICAgX29uTW91c2VVcEV2ZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuX2hhc01vdmVUYXJnZXQgPSBmYWxzZTtcbiAgICB9LFxuICAgIC8vIOmakOiXj+aOp+WItumAiemhuVxuICAgIF9vbkhpZGVFdmVudDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLl9zZWxlY3RUYXJnZXQgPSBudWxsO1xuICAgICAgICB0aGlzLl9iYWNrdXBTZWxlY3RUYXJnZXQgPSBudWxsO1xuICAgICAgICB0aGlzLl9sYXN0U2VsZWN0VGFyZ2V0ID0gbnVsbDtcbiAgICB9LFxuICAgIC8vIOWPjei9rOaWueWQkVxuICAgIF9vbk1pcnJvckZsaXBFdmVudDogZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5fc2VsZWN0VGFyZ2V0KSB7XG4gICAgICAgICAgICB2YXIgc2NhbGVYID0gdGhpcy5fc2VsZWN0VGFyZ2V0LnRyYW5zZm9ybS5zY2FsZVg7XG4gICAgICAgICAgICB0aGlzLl9zZWxlY3RUYXJnZXQudHJhbnNmb3JtLnNjYWxlWCA9IHNjYWxlWCA+IDEgPyAtc2NhbGVYIDogTWF0aC5hYnMoc2NhbGVYKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy8g5Yig6Zmk6YCJ5oup5a+56LGhXG4gICAgX29uRGVsZXRlVGFyZ2V0RXZlbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGZ1cm5pdHVyZSA9IHRoaXMuX3NlbGVjdFRhcmdldC5nZXRDb21wb25lbnQoJ0Z1cm5pdHVyZScpO1xuICAgICAgICBpZiAoZnVybml0dXJlLnN1aXRfaWQgPiAwKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5kYXRhQmFzZS5jdXJEcmVzc1N1aXQucHJpY2UgPiAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhQmFzZS5vcHRpb25zLmhpZGUoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFCYXNlLnRpcHNXaW5kb3cub3BlblRpcHNXaW5kb3coJ+WvueS4jei1t++8jOatpOeJqeWTgeS4uuWll+ijheS4reeahOeJqeWTge+8jFxcbiDkuI3lj6/np7vpmaTvvIzor7fmlbTlpZfotK3kubAnKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSB0aGlzLmRhdGFCYXNlLmN1ckRyZXNzU3VpdC5mdW5ybml0dXJlTGlzdC5pbmRleE9mKGZ1cm5pdHVyZSk7XG4gICAgICAgICAgICAgICAgaWYgKGluZGV4ID4gLTEpe1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRhdGFCYXNlLmN1ckRyZXNzU3VpdC5mdW5ybml0dXJlTGlzdC5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmdXJuaXR1cmUuc2V0TWFya1VzZShmYWxzZSk7XG4gICAgICAgIHRoaXMuX3NlbGVjdFRhcmdldC5kZXN0cm95KCk7XG4gICAgICAgIHRoaXMuX3NlbGVjdFRhcmdldCA9IG51bGw7XG4gICAgICAgIHRoaXMuX2JhY2t1cFNlbGVjdFRhcmdldCA9IG51bGw7XG4gICAgICAgIHRoaXMuX2xhc3RTZWxlY3RUYXJnZXQgPSBudWxsO1xuICAgICAgICB0aGlzLmRhdGFCYXNlLm9wdGlvbnMuaGlkZSgpO1xuICAgIH0sXG4gICAgLy8g6YeN572uXG4gICAgcmVzZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5kYXRhQmFzZS5vcHRpb25zLmhpZGUoKTtcbiAgICAgICAgdGhpcy5fc2VsZWN0VGFyZ2V0ID0gbnVsbDtcbiAgICAgICAgdGhpcy5fYmFja3VwU2VsZWN0VGFyZ2V0ID0gbnVsbDtcbiAgICAgICAgdGhpcy5fbGFzdFNlbGVjdFRhcmdldCA9IG51bGw7XG4gICAgfSxcbiAgICAvLyDnu5Hlrprkuovku7ZcbiAgICBzdGFydDogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyDluLjnlKjnmoTlj5jph48v5pWw5o2uXG4gICAgICAgIHZhciBlbnQgPSBGaXJlLkVudGl0eS5maW5kKCcvRGF0YUJhc2UnKTtcbiAgICAgICAgdGhpcy5kYXRhQmFzZSA9IGVudC5nZXRDb21wb25lbnQoJ0RhdGFCYXNlJyk7XG5cbiAgICAgICAgRmlyZS5JbnB1dC5vbignbW91c2Vkb3duJywgdGhpcy5iaW5kZWRNb3VzZURvd25FdmVudCk7XG4gICAgICAgIEZpcmUuSW5wdXQub24oJ21vdXNlbW92ZScsIHRoaXMuYmluZGVkTW91c2VNb3ZlRXZlbnQpO1xuICAgICAgICBGaXJlLklucHV0Lm9uKCdtb3VzZXVwJywgdGhpcy5iaW5kZWRNb3VzZVVwRXZlbnQpO1xuICAgICAgICAvL1xuICAgICAgICB0aGlzLmRhdGFCYXNlLm9wdGlvbnMub25IaWRlRXZlbnQgPSB0aGlzLl9vbkhpZGVFdmVudC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmRhdGFCYXNlLm9wdGlvbnMuYnRuX2RlbC5vbk1vdXNlZG93biA9IHRoaXMuX29uRGVsZXRlVGFyZ2V0RXZlbnQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5kYXRhQmFzZS5vcHRpb25zLmJ0bl9NaXJyb3JGbGlwLm9uTW91c2Vkb3duID0gdGhpcy5fb25NaXJyb3JGbGlwRXZlbnQuYmluZCh0aGlzKTtcbiAgICB9LFxuICAgIC8vIOmUgOavgVxuICAgIG9uRGVzdHJveTogZnVuY3Rpb24oKSB7XG4gICAgICAgIEZpcmUuSW5wdXQub2ZmKCdtb3VzZWRvd24nLCB0aGlzLmJpbmRlZE1vdXNlRG93bkV2ZW50KTtcbiAgICAgICAgRmlyZS5JbnB1dC5vZmYoJ21vdXNlbW92ZScsIHRoaXMuYmluZGVkTW91c2VNb3ZlRXZlbnQpO1xuICAgICAgICBGaXJlLklucHV0Lm9mZignbW91c2V1cCcsIHRoaXMuYmluZGVkTW91c2VVcEV2ZW50KTtcbiAgICB9XG59KTtcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnNGZiMGVZQTZrRk9WSzhNby9TMnJqL0gnLCAnRGF0YUJhc2UnKTtcbi8vIHNjcmlwdFxcdmlsbGFcXERhdGFCYXNlLmpzXG5cbi8vICDlrZjmlL7pobnnm67pnIDopoHnmoTlj5jph48v5pWw5o2uL+WvueixoVxudmFyIERhdGFCYXRhID0gRmlyZS5DbGFzcyh7XG4gICAgLy8g57un5om/XG4gICAgZXh0ZW5kczogRmlyZS5Db21wb25lbnQsXG4gICAgLy8g5p6E6YCg5Ye95pWwXG4gICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8g55So5oi36ZKx5YyFXG4gICAgICAgIHRoaXMudXNlcmNjID0gMDtcbiAgICAgICAgLy8g5piv5ZCm5Y+v5Lul5L+d5a2YXG4gICAgICAgIHRoaXMuaGFzQ2FuU2F2ZSA9IGZhbHNlO1xuICAgICAgICAvLyDlvZPliY3mpbzlsYJJRFxuICAgICAgICB0aGlzLmZsb29ySWQgPSAwO1xuICAgICAgICAvLyDlvZPliY1tYXJrXG4gICAgICAgIHRoaXMubWFyayA9ICcnO1xuICAgICAgICAvLyDlvZPliY3miL/pl7RVSURcbiAgICAgICAgdGhpcy5ob3VzZV91aWQgPSAwO1xuICAgICAgICAvLyDlvZPliY3miL/pl7RJRFxuICAgICAgICB0aGlzLnJvb21faWQgPSAwO1xuICAgICAgICAvLyDlvZPliY3miL/pl7TlkI3np7BcbiAgICAgICAgdGhpcy5yb29tX25hbWUgPSAnJztcbiAgICAgICAgLy8g6buY6K6k5oi/6Ze05Zyw5p2/6LWE5rqQXG4gICAgICAgIHRoaXMuZGVmYXVsdF9kaWJhbiA9ICcnO1xuICAgICAgICAvLyDpu5jorqTmiL/pl7Tlopnlo4HotYTmupBcbiAgICAgICAgdGhpcy5kZWZhdWx0X2JlaWppbmcgPSAnJztcbiAgICAgICAgLy8g5b2T5YmN6KOF5omu55qE5aWX6KOFXG4gICAgICAgIHRoaXMuY3VyRHJlc3NTdWl0ID0ge1xuICAgICAgICAgICAgLy8g5aWX6KOFSURcbiAgICAgICAgICAgIHN1aXRfaWQ6IDAsXG4gICAgICAgICAgICAvLyDlpZfoo4XlsI/lm75cbiAgICAgICAgICAgIHN1aXRfaWNvbjogbnVsbCxcbiAgICAgICAgICAgIC8vIOiDjOWMhUlEXG4gICAgICAgICAgICBwYWNrX2lkOiAwLFxuICAgICAgICAgICAgLy8g5aWX6KOF5ZCN56ewXG4gICAgICAgICAgICBzdWl0X25hbWU6ICcnLFxuICAgICAgICAgICAgLy8g5aWX6KOF5p2l6Ieq5ZOq6YeM77yMMS7og4zljIUgMi7llYbln45cbiAgICAgICAgICAgIHN1aXRfZnJvbTogMSxcbiAgICAgICAgICAgIC8vIOWll+ijheS7t+agvFxuICAgICAgICAgICAgcHJpY2U6IDAsXG4gICAgICAgICAgICAvLyDmipjmiaNcbiAgICAgICAgICAgIGRpc2NvdW50OiAxLFxuICAgICAgICAgICAgLy8g5aWX6KOF5YiX6KGoXG4gICAgICAgICAgICBmdW5ybml0dXJlTGlzdDogW11cbiAgICAgICAgfTtcbiAgICAgICAgLy8g5b2T5YmNXG4gICAgICAgIC8vIOS6jOe6p+iPnOWNleWNleWTgeaVsOaNruWIl+ihqFxuICAgICAgICB0aGlzLnNpbmdsZV9TZWNvbmRfRGF0YVNoZWV0cyA9IFtdO1xuICAgICAgICAvLyDkuInnuqfoj5zljZXljZXlk4HmgLvmlbBcbiAgICAgICAgdGhpcy5zaW5nbGVfVGhyZWVfVG90YWxfU2hlZXRzID0ge307XG4gICAgICAgIC8vIOS4iee6p+iPnOWNleWNleWTgeaVsOaNruWIl+ihqFxuICAgICAgICB0aGlzLnNpbmdsZV9UaHJlZV9EYXRhU2hlZXRzID0ge307XG4gICAgICAgIC8vIOS4iee6p+iPnOWNleWNleWTgeWkp+Wbvui1hOa6kOWIl+ihqFxuICAgICAgICB0aGlzLnNpbmdsZV9UaHJlZV9CaWdJbWFnZSA9IHt9O1xuICAgICAgICAvLyDkuoznuqfoj5zljZXlpZfoo4XmgLvmlbBcbiAgICAgICAgdGhpcy5zdWl0SXRlbXNfVGhyZWVfVG90YWwgPSBbXTtcbiAgICAgICAgLy8g5LqM57qn6I+c5Y2V5aWX6KOF5pWw5o2u5YiX6KGoXG4gICAgICAgIHRoaXMuc3VpdEl0ZW1zX1NlY29uZF9EYXRhU2hlZXRzID0gW107XG4gICAgICAgIC8vIOeJqeWTgeafnOaVsOaNruWIl+ihqFxuICAgICAgICB0aGlzLmJhY2twYWNrX1NlY29uZF9EYXRhU2hlZXRzID0gW107XG4gICAgICAgIC8vIOeJqeWTgeafnOaVsOaNruWIl+ihqFxuICAgICAgICB0aGlzLmJhY2twYWNrX1RocmVlX1RvdGFsX1NoZWV0cyA9IFtdO1xuICAgICAgICB0aGlzLmJhY2twYWNrX1RocmVlX0RhdGFTaGVldHMgPSBbXTtcbiAgICAgICAgLy8g55So5LqO5Yib5bu657yp55Wl5Zu+XG4gICAgICAgIHRoaXMuY3R4VG9EcmF3ID0gbnVsbDtcbiAgICAgICAgLy8g55So5LqO5ouN54WnXG4gICAgICAgIHRoaXMuZnJhbWVDb3VudCA9IC0xO1xuICAgICAgICB0aGlzLm5lZWRIaWRlRW50TGlzdCA9IFtdO1xuICAgICAgICAvLyDog4zmma/kuI7lnLDpnaLnmoTpu5jorqTlm77niYdcbiAgICAgICAgdGhpcy5iYWNrZ3JvdW5kID0gbnVsbDtcbiAgICAgICAgdGhpcy5ncm91bmQgPSBudWxsO1xuICAgICAgICAvLyDliJ3lp4vljJblnLrmma/lrZDlhYPntKBcbiAgICAgICAgdGhpcy5kZWZhdWx0U2NyZWVuQ2hpbGRzID0gbnVsbDtcbiAgICAgICAgLy8g5L+d5a2Y5omA5pyJ5Zu+54mHXG4gICAgICAgIHRoaXMubG9hZEltYWdlTGlzdCA9IHt9O1xuICAgICAgICAvL1xuICAgICAgICB0aGlzLmZhbWlseUxpc3QgPSBudWxsO1xuICAgICAgICB0aGlzLmZhbWlseUdvID0gbnVsbDtcbiAgICB9LFxuICAgIC8vIOi9veWFpeaXtlxuICAgIG9uTG9hZDogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyDovb3lhaXmjqfku7ZcbiAgICAgICAgdGhpcy5sb2FkQ29udHJvbHMoKTtcbiAgICAgICAgaWYgKCF0aGlzLm5ldFdvcmtNZ3IuZ2V0VG9LZW5WYWx1ZSgpKSB7XG4gICAgICAgICAgICB0aGlzLnRvS2VuVGlwV2luLmFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8g5Yid5aeL5YyW5oi/6Ze0XG4gICAgICAgIHZhciBzZW5kRGF0YSA9IHt9O1xuICAgICAgICBpZih0aGlzLmdsb2JhbERhdGEgJiYgdGhpcy5nbG9iYWxEYXRhLnNlbmREYXRhKXtcbiAgICAgICAgICAgIHNlbmREYXRhID0gdGhpcy5nbG9iYWxEYXRhLnNlbmREYXRhO1xuICAgICAgICAgICAgdGhpcy5nbG9iYWxEYXRhLnNlbmREYXRhID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHNlbmREYXRhID0ge1xuICAgICAgICAgICAgICAgIG1hcms6ICcnLFxuICAgICAgICAgICAgICAgIGhvdXNlX3VpZDogMFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHNlbGYubG9hZFRpcHMub3BlblRpcHMoJ+WIneWni+WMluWcuuaZr++8jOivt+eojeWQji4uLicpO1xuICAgICAgICBzZWxmLmludG9Sb29tKHNlbmREYXRhLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyDov5nph4zlm6DkuLrmmK/kuLrkuobkv53mjIHpu5jorqTnmoTog4zmma/ot5/lnLDmnb/nmoTlm77niYdcbiAgICAgICAgICAgIHNlbGYuc2F2ZURlZmF1bHREYXRhKCk7XG4gICAgICAgICAgICBzZWxmLmxvYWRUaXBzLmNsb3NlVGlwcygpO1xuXG4gICAgICAgICAgICBpZiAoc2VsZi5nbG9iYWxEYXRhKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNlbGYuZ2xvYmFsRGF0YS5nb3RvVHlwZSA9PT0gMikge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLnVwZGF0ZUNoYXJhY3RlcnMoKTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5jaGFyYWN0ZXJzLmVudGl0eS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5tYWluTWVudU1nci5vbkhvdXNlRHJlc3NFdmVudCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIHVwZGF0ZUNoYXJhY3RlcnM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8g5bGL5Li75pWw5o2uXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgaWYgKHNlbGYuZmFtaWx5TGlzdC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBzZWxmLmNoYXJhY3RlcnMuZW50aXR5LmFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICB2YXIgaG9zdCA9IHNlbGYuZmFtaWx5TGlzdFswXTtcbiAgICAgICAgICAgIHZhciBob3N0X3VybCA9IGhvc3QuZmlndXJlX3VybDtcbiAgICAgICAgICAgIHZhciBob3N0X25hbWUgPSBob3N0LnVzZXJfbmFtZTtcbiAgICAgICAgICAgIHNlbGYubG9hZEltYWdlKGhvc3RfdXJsLCBmdW5jdGlvbiAoZXJyb3IsIGltYWdlKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5jaGFyYWN0ZXJzLnNldEhvc3QoaW1hZ2UsIGhvc3RfbmFtZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICAvLyDlrrbkurrmlbDmja5cbiAgICAgICAgaWYgKHNlbGYuZmFtaWx5TGlzdC5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICB2YXIgZmFtaWx5ID0gc2VsZi5mYW1pbHlMaXN0WzFdO1xuICAgICAgICAgICAgdmFyIGZhbWlseV91cmwgPSBmYW1pbHkuZmlndXJlX3VybDtcbiAgICAgICAgICAgIHZhciBmYW1pbHlfbmFtZSA9IGZhbWlseS5yZWxhdGlvbl9uYW1lICsgXCIgXCIgKyBmYW1pbHkudXNlcl9uYW1lO1xuICAgICAgICAgICAgc2VsZi5sb2FkSW1hZ2UoZmFtaWx5X3VybCwgZnVuY3Rpb24gKGVycm9yLCBpbWFnZSkge1xuICAgICAgICAgICAgICAgIGlmKHNlbGYuZmFtaWx5R28pe1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmNoYXJhY3RlcnMudXBkYXRlRmFtaWx5KHNlbGYuZmFtaWx5R28sIGltYWdlLCBmYW1pbHlfbmFtZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZmFtaWx5R28gPSBzZWxmLmNoYXJhY3RlcnMuYWRkRmFtaWx5KGltYWdlLCBmYW1pbHlfbmFtZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8g5L+d5a2Y5Yid5aeL5YyW5pWw5o2u77yI6KGo56S66ZyA6KaB6L+b6KGM6KOF5omu77yJXG4gICAgc2F2ZURlZmF1bHREYXRhOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuYmFja2dyb3VuZC5zYXZlRGVmYXVsdFNwcml0ZSgpO1xuICAgICAgICB0aGlzLmdyb3VuZC5zYXZlRGVmYXVsdFNwcml0ZSgpO1xuICAgICAgICB0aGlzLmRlZmF1bHRTY3JlZW5DaGlsZHMgPSB0aGlzLnJvb20uZ2V0Q2hpbGRyZW4oKTtcbiAgICB9LFxuICAgIC8vIOi9veWFpeaOp+S7tlxuICAgIGxvYWRDb250cm9sczogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyDog4zmma9cbiAgICAgICAgdmFyIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9Sb29tL2JhY2tncm91bmQnKTtcbiAgICAgICAgdGhpcy5iZ1JlbmRlciA9IGVudC5nZXRDb21wb25lbnQoRmlyZS5TcHJpdGVSZW5kZXJlcik7XG4gICAgICAgIHRoaXMuYmFja2dyb3VuZCA9IGVudC5nZXRDb21wb25lbnQoJ0Z1cm5pdHVyZScpO1xuICAgICAgICAvLyDlnLDmnb9cbiAgICAgICAgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL1Jvb20vZ3JvdW5kJyk7XG4gICAgICAgIC8vdGhpcy5ncm91bmRSZW5kZXIgPSBlbnQuZ2V0Q29tcG9uZW50KEZpcmUuU3ByaXRlUmVuZGVyZXIpO1xuICAgICAgICB0aGlzLmdyb3VuZCA9IGVudC5nZXRDb21wb25lbnQoJ0Z1cm5pdHVyZScpO1xuICAgICAgICAvLyDmiL/pl7TlpLToioLngrlcbiAgICAgICAgdGhpcy5yb29tID0gRmlyZS5FbnRpdHkuZmluZCgnL1Jvb20nKTtcbiAgICAgICAgLy8g5o6n5Yi26YCJ6aG5XG4gICAgICAgIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9PcHRpb25zJyk7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IGVudC5nZXRDb21wb25lbnQoJ09wdGlvbnMnKTtcbiAgICAgICAgLy8g5LqM57qn5a2Q6I+c5Y2V5qih5p2/XG4gICAgICAgIHRoaXMudGVtcFN1YlNlY29uZE1lbnUgPSB0aGlzLmVudGl0eS5maW5kKCdTdWJTZWNvbmRNZW51Jyk7XG4gICAgICAgIC8vIOS4iee6p+WtkOiPnOWNleaooeadv1xuICAgICAgICB0aGlzLnRlbXBTdWJUaHJlZU1lbnUgPSB0aGlzLmVudGl0eS5maW5kKCdTdWJUaHJlZU1lbnUnKTtcbiAgICAgICAgLy8g5a625YW35qih5p2/XG4gICAgICAgIHRoaXMudGVtcEZ1cm5pdHVyZSA9IHRoaXMuZW50aXR5LmZpbmQoJ0Z1cm5pdHVyZScpO1xuICAgICAgICAvLyDnlKjmiLflrrbluq3kv6Hmga/mqKHmnb9cbiAgICAgICAgdGhpcy50ZW1wRmFtaWx5SW5mbyA9IHRoaXMuZW50aXR5LmZpbmQoJ0ZhbWlseUluZm8nKTtcbiAgICAgICAgLy8g5bmz6Z2i5Zu+5qih5p2/XG4gICAgICAgIHRoaXMudGVtcFBsYW4gPSB0aGlzLmVudGl0eS5maW5kKCdwbGFuJyk7XG4gICAgICAgIC8vIOe9kee7nOi/nuaOpVxuICAgICAgICB0aGlzLm5ldFdvcmtNZ3IgPSB0aGlzLmVudGl0eS5nZXRDb21wb25lbnQoJ05ldHdvcmtNZ3InKTtcbiAgICAgICAgLy8g5Li76I+c5Y2VXG4gICAgICAgIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9NZW51X01haW4nKTtcbiAgICAgICAgdGhpcy5tYWluTWVudU1nciA9IGVudC5nZXRDb21wb25lbnQoJ01haW5NZW51TWdyJyk7XG4gICAgICAgIC8vIOS4gOe6p+iPnOWNlVxuICAgICAgICBlbnQgPSBGaXJlLkVudGl0eS5maW5kKCcvTWVudV9GaXJzdCcpO1xuICAgICAgICB0aGlzLmZpcnN0TWVudU1nciA9IGVudC5nZXRDb21wb25lbnQoJ0ZpcnN0TWVudU1ncicpO1xuICAgICAgICAvLyDkuoznuqfoj5zljZVcbiAgICAgICAgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL01lbnVfU2Vjb25kJyk7XG4gICAgICAgIHRoaXMuc2Vjb25kTWVudU1nciA9IGVudC5nZXRDb21wb25lbnQoJ1NlY29uZE1lbnVNZ3InKTtcbiAgICAgICAgLy8g5LiJ57qn57qn6I+c5Y2VXG4gICAgICAgIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9NZW51X1RocmVlJyk7XG4gICAgICAgIHRoaXMudGhyZWVNZW51TWdyID0gZW50LmdldENvbXBvbmVudCgnVGhyZWVNZW51TWdyJyk7XG4gICAgICAgIC8vIOWFtuS7luiPnOWNlVxuICAgICAgICBlbnQgPSBGaXJlLkVudGl0eS5maW5kKCcvV2luX0Zsb29yJyk7XG4gICAgICAgIHRoaXMuZmxvb3JXaW4gPSBlbnQuZ2V0Q29tcG9uZW50KCdGbG9vcldpbmRvdycpO1xuICAgICAgICAvLyDph43mlrDor7fmsYLmnI3liqHlmajnqpflj6NcbiAgICAgICAgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL1dpbl9OZXRXb3JrJyk7XG4gICAgICAgIHRoaXMubmV0V29ya1dpbiA9IGVudC5nZXRDb21wb25lbnQoJ05ld1dvcmtXaW5kb3cnKTtcbiAgICAgICAgLy8g5rKh5pyJ55So5oi35L+h5oGv55qE5o+Q56S656qX5Y+jXG4gICAgICAgIHRoaXMudG9LZW5UaXBXaW4gPSBGaXJlLkVudGl0eS5maW5kKCcvV2luX1Rva2VuVGlwJyk7XG4gICAgICAgIC8vIOW5s+mdouWbvlxuICAgICAgICBlbnQgPSBGaXJlLkVudGl0eS5maW5kKCcvV2luX1N3aXRjaFJvb20nKTtcbiAgICAgICAgdGhpcy5zd2l0Y2hSb29tV2luID0gZW50LmdldENvbXBvbmVudCgnU3dpdGNoUm9vbVdpbmRvdycpO1xuICAgICAgICAvLyDliqDovb3mj5DnpLpcbiAgICAgICAgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL1RpcHNfbG9hZCcpO1xuICAgICAgICB0aGlzLmxvYWRUaXBzID0gZW50LmdldENvbXBvbmVudCgnVGlwTG9hZCcpO1xuICAgICAgICAvLyDmuKnppqjmj5DnpLrnqpflj6NcbiAgICAgICAgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL1RpcHNfd2luZG93Jyk7XG4gICAgICAgIHRoaXMudGlwc1dpbmRvdyA9IGVudC5nZXRDb21wb25lbnQoJ1RpcHNXaW5kb3cnKTtcbiAgICAgICAgLy8g6LSt54mp56qX5Y+jXG4gICAgICAgIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9XaW5fUGF5TWVudCcpO1xuICAgICAgICB0aGlzLnBheU1lbnRXaW5kb3cgPSBlbnQuZ2V0Q29tcG9uZW50KCdQYXlNZW50V2luZG93Jyk7XG4gICAgICAgIC8vIOmHjee9rueql+WPo1xuICAgICAgICBlbnQgPSBGaXJlLkVudGl0eS5maW5kKCcvVGlwc19QYXlNZW50Jyk7XG4gICAgICAgIHRoaXMucGF5TWVudFRpcHMgPSBlbnQuZ2V0Q29tcG9uZW50KCdUaXBzUGF5TWVudCcpO1xuICAgICAgICAvLyDmlK/ku5jpl67popjnqpflj6NcbiAgICAgICAgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL1RpcHNfUGF5UHJvYmxlbXMnKTtcbiAgICAgICAgdGhpcy50aXBzUGF5UHJvYmxlbXMgPSBlbnQuZ2V0Q29tcG9uZW50KCdUaXBzUGF5UHJvYmxlbXMnKTtcbiAgICAgICAgLy9cbiAgICAgICAgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL0NoYXJhY3RlcnMnKTtcbiAgICAgICAgdGhpcy5jaGFyYWN0ZXJzID0gZW50LmdldENvbXBvbmVudCgnQ2hhcmFjdGVycycpO1xuICAgICAgICAvL1xuICAgICAgICBlbnQgPSBGaXJlLkVudGl0eS5maW5kKCcvR2xvYmFsRGF0YScpO1xuICAgICAgICBpZiAoZW50KSB7XG4gICAgICAgICAgICB0aGlzLmdsb2JhbERhdGEgPSBlbnQuZ2V0Q29tcG9uZW50KFwiR2xvYmFsRGF0YVwiKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy8g5LiL6L295Zu+54mHXG4gICAgbG9hZEltYWdlOiBmdW5jdGlvbiAodXJsLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIGlmIChzZWxmLmxvYWRJbWFnZUxpc3RbdXJsXSkge1xuICAgICAgICAgICAgdmFyIGltYWdlID0gc2VsZi5sb2FkSW1hZ2VMaXN0W3VybF07XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsLCBpbWFnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy9zZWxmLmxvYWRUaXBzLm9wZW5UaXBzKCfliqDovb3lm77niYfkuK3vvIzor7fnqI3lkI4uLi4nKTtcbiAgICAgICAgRmlyZS5JbWFnZUxvYWRlcih1cmwsIGZ1bmN0aW9uIChlcnJvciwgaW1hZ2UpIHtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycm9yLCBpbWFnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvL3NlbGYubG9hZFRpcHMuY2xvc2VUaXBzKCk7XG4gICAgICAgICAgICBpZiAoaW1hZ2UpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmxvYWRJbWFnZUxpc3RbdXJsXSA9IGltYWdlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9LFxuICAgIC8vIOaYr+WQpumcgOimgei0reS5sFxuICAgIGhhc1BheTogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgY2hpbGRyZW4gPSB0aGlzLnJvb20uZ2V0Q2hpbGRyZW4oKTtcbiAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICB2YXIgZW50ID0gY2hpbGRyZW5baV07XG4gICAgICAgICAgICB2YXIgZnVybml0dXJlID0gZW50LmdldENvbXBvbmVudCgnRnVybml0dXJlJyk7XG4gICAgICAgICAgICBpZiAoZnVybml0dXJlLnByaWNlID4gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHZhciBkcmVzc1N1aXQgPSB0aGlzLmN1ckRyZXNzU3VpdDtcbiAgICAgICAgaWYgKGRyZXNzU3VpdC5wcmljZSA+IDApIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9LFxuICAgIC8vIOaYr+WQpuaUueWPmOS6huiDjOaZr+S4juWcsOmdoueahOadkOi0qFxuICAgIGhhc1NhdmVSb29tOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBjaGlsZHJlbiA9IHRoaXMucm9vbS5nZXRDaGlsZHJlbigpO1xuICAgICAgICBpZiAoY2hpbGRyZW4ubGVuZ3RoID4gMikge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuYmFja2dyb3VuZC5pbWFnZVVybCAhPT0gdGhpcy5kZWZhdWx0X2JlaWppbmcgfHxcbiAgICAgICAgICAgIHRoaXMuZ3JvdW5kLmltYWdlVXJsICE9PSB0aGlzLmRlZmF1bHRfZGliYW4gKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICAvL2lmICghIHRoaXMuaGFzQ2FuU2F2ZSkge1xuICAgICAgICAvLyAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIC8vfVxuICAgICAgICAvL3ZhciBjdXJTcHJpdGUgPSB0aGlzLmJhY2tncm91bmQuZ2V0UmVuZGVyU3ByaXRlKCk7XG4gICAgICAgIC8vdmFyIGRlZmF1bHRTcHJpdGUgPSB0aGlzLmJhY2tncm91bmQuZGVmYXVsdFNwcml0ZTtcbiAgICAgICAgLy9pZiAoY3VyU3ByaXRlICE9PSBkZWZhdWx0U3ByaXRlKSB7XG4gICAgICAgIC8vICAgIHJldHVybiB0cnVlO1xuICAgICAgICAvL31cbiAgICAgICAgLy9jdXJTcHJpdGUgPSB0aGlzLmdyb3VuZC5nZXRSZW5kZXJTcHJpdGUoKTtcbiAgICAgICAgLy9kZWZhdWx0U3ByaXRlID0gdGhpcy5ncm91bmQuZGVmYXVsdFNwcml0ZTtcbiAgICAgICAgLy9pZiAoY3VyU3ByaXRlICE9PSBkZWZhdWx0U3ByaXRlKSB7XG4gICAgICAgIC8vICAgIHJldHVybiB0cnVlO1xuICAgICAgICAvL31cbiAgICAgICAgLy92YXIgaGFzU2FtZSA9IGZhbHNlLCBjaGlsZHJlbiA9IHRoaXMucm9vbS5nZXRDaGlsZHJlbigpO1xuICAgICAgICAvL2Zvcih2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7ICsraSkge1xuICAgICAgICAvLyAgICBoYXNTYW1lID0gdGhpcy5kZWZhdWx0U2NyZWVuQ2hpbGRzW2ldID09PSBjaGlsZHJlbltpXTtcbiAgICAgICAgLy8gICAgaWYgKCEgaGFzU2FtZSkge1xuICAgICAgICAvLyAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIC8vICAgIH1cbiAgICAgICAgLy99XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9LFxuICAgIC8vIOa4heepuuWcuuaZr1xuICAgIHJlc2V0U2NyZWVuOiBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGNoaWxkcmVuID0gdGhpcy5yb29tLmdldENoaWxkcmVuKCk7XG4gICAgICAgIGZvciAodmFyIGkgPSAyOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNoaWxkcmVuW2ldLmRlc3Ryb3koKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIOWIoOmZpOWll+ijhVxuICAgIHJlbW92ZVN1aXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGRyZXNzTGlzdCA9IHRoaXMuY3VyRHJlc3NTdWl0LmZ1bnJuaXR1cmVMaXN0O1xuICAgICAgICBpZiAoZHJlc3NMaXN0KSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRyZXNzTGlzdC5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgIHZhciBjb20gPSBkcmVzc0xpc3RbaV07XG4gICAgICAgICAgICAgICAgaWYgKGNvbS5wcm9wc190eXBlID4gMikge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZW50ID0gY29tLmVudGl0eTtcbiAgICAgICAgICAgICAgICAgICAgZW50LmRlc3Ryb3koKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jdXJEcmVzc1N1aXQgPSB7XG4gICAgICAgICAgICAvLyDlpZfoo4VJRFxuICAgICAgICAgICAgc3VpdF9pZDogMCxcbiAgICAgICAgICAgIC8vIOWll+ijheWQjeensFxuICAgICAgICAgICAgc3VpdF9uYW1lOiAnJyxcbiAgICAgICAgICAgIC8vIOiDjOWMhUlEXG4gICAgICAgICAgICBwYWNrX2lkOiAwLFxuICAgICAgICAgICAgLy8g5aWX6KOF5bCP5Zu+XG4gICAgICAgICAgICBzdWl0X2ljb246IG51bGwsXG4gICAgICAgICAgICAvLyDlpZfoo4XmnaXoh6rlk6rph4zvvIwxLuiDjOWMhSAyLuWVhuWfjlxuICAgICAgICAgICAgc3VpdF9mcm9tOiAxLFxuICAgICAgICAgICAgLy8g5aWX6KOF5Lu35qC8XG4gICAgICAgICAgICBwcmljZTogMCxcbiAgICAgICAgICAgIC8vIOaKmOaJo1xuICAgICAgICAgICAgZGlzY291bnQ6IDEsXG4gICAgICAgICAgICAvLyDlrrblhbfliJfooahcbiAgICAgICAgICAgIGZ1bnJuaXR1cmVMaXN0OiBbXVxuICAgICAgICB9O1xuICAgIH0sXG4gICAgLy8g5L+d5a2Y6KOF5omuXG4gICAgc2F2ZVJvb206IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciBzZW5kRGF0YSA9IHtcbiAgICAgICAgICAgIHN1aXRfaWQ6IHNlbGYuY3VyRHJlc3NTdWl0LnN1aXRfaWQsXG4gICAgICAgICAgICBzdWl0X2Zyb206IHNlbGYuY3VyRHJlc3NTdWl0LnN1aXRfZnJvbSxcbiAgICAgICAgICAgIGRhdGFMaXN0OiBbXVxuICAgICAgICB9O1xuICAgICAgICB2YXIgZGF0YSA9IHtcbiAgICAgICAgICAgIHByb2RfaWQ6IDAsXG4gICAgICAgICAgICBwYWNrX2lkOiAwLFxuICAgICAgICAgICAgcHJvZF91aWQ6IDAsXG4gICAgICAgICAgICBwb3M6ICcnLFxuICAgICAgICAgICAgcm90YWlvbjogMCxcbiAgICAgICAgICAgIHNjYWxlOiAnJyxcbiAgICAgICAgICAgIHN1aXRfaWQ6IDBcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIGNoaWxkcmVuID0gdGhpcy5yb29tLmdldENoaWxkcmVuKCk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBlbnQgPSBjaGlsZHJlbltpXTtcbiAgICAgICAgICAgIHZhciBmdXJuaXR1cmUgPSBlbnQuZ2V0Q29tcG9uZW50KCdGdXJuaXR1cmUnKTtcbiAgICAgICAgICAgIGRhdGEgPSB7XG4gICAgICAgICAgICAgICAgcHJvZF9pZDogZnVybml0dXJlLnByb3BzX2lkLFxuICAgICAgICAgICAgICAgIHBhY2tfaWQ6IGZ1cm5pdHVyZS5wYWNrX2lkLFxuICAgICAgICAgICAgICAgIHByb2RfdWlkOiBmdXJuaXR1cmUucHJvcHNfdWlkLFxuICAgICAgICAgICAgICAgIHBvczogZW50LnRyYW5zZm9ybS54ICsgXCI6XCIgKyBlbnQudHJhbnNmb3JtLnksXG4gICAgICAgICAgICAgICAgcm90YXRpb246IGVudC50cmFuc2Zvcm0ucm90YXRpb24sXG4gICAgICAgICAgICAgICAgc2NhbGU6IGVudC50cmFuc2Zvcm0uc2NhbGVYICsgXCI6XCIgKyBlbnQudHJhbnNmb3JtLnNjYWxlWSxcbiAgICAgICAgICAgICAgICBzdWl0X2lkOiBmdXJuaXR1cmUuc3VpdF9pZFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHNlbmREYXRhLmRhdGFMaXN0LnB1c2goZGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgc2VsZi5uZXRXb3JrTWdyLlJlcXVlc3RTYXZlUm9vbShzZW5kRGF0YSwgZnVuY3Rpb24gKHNlcnZlckRhdGEpIHtcbiAgICAgICAgICAgIGlmIChzZXJ2ZXJEYXRhLnN0YXR1cyA9PT0gMTAwMDApIHtcbiAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soc2VydmVyRGF0YS51c2VyY2MpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHNlbGYudGlwc1dpbmRvdy5vcGVuVGlwc1dpbmRvdyhzZXJ2ZXJEYXRhLmRlc2MpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9LFxuICAgIC8vIOWIm+W7uuWutuWFt+WIsOWcuuaZr+S4rVxuICAgIGNyZWF0ZUZ1cm5pdHVyZVRvU2NyZWVuOiBmdW5jdGlvbiAoZHJlc3NMaXN0LCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIGlmIChkcmVzc0xpc3QubGVuZ3RoID09PSAwICYmIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciBpbmRleCA9IDA7XG4gICAgICAgIGRyZXNzTGlzdC5mb3JFYWNoKGZ1bmN0aW9uIChkcmVzcykge1xuICAgICAgICAgICAgdmFyIGVudGl0eSA9IG51bGwsIGZ1cm5pdHVyZSA9IG51bGw7XG4gICAgICAgICAgICB2YXIgcHJvcHNUeXBlID0gcGFyc2VJbnQoZHJlc3MucHJvcHNUeXBlKTtcbiAgICAgICAgICAgIGlmIChwcm9wc1R5cGUgPT09IDEpIHtcbiAgICAgICAgICAgICAgICBlbnRpdHkgPSBzZWxmLnJvb20uZmluZCgnYmFja2dyb3VuZCcpO1xuICAgICAgICAgICAgICAgIGZ1cm5pdHVyZSA9IGVudGl0eS5nZXRDb21wb25lbnQoJ0Z1cm5pdHVyZScpO1xuICAgICAgICAgICAgICAgIGZ1cm5pdHVyZS5zZXRGdXJuaXR1cmVEYXRhKGRyZXNzLCB0cnVlKTtcbiAgICAgICAgICAgICAgICBzZWxmLmxvYWRUaXBzLm9wZW5UaXBzKCfliJvlu7rlm77niYfkuK3vvIzor7fnqI3lkI4uLi4nKTtcbiAgICAgICAgICAgICAgICBzZWxmLmxvYWRJbWFnZShmdXJuaXR1cmUuaW1hZ2VVcmwsIGZ1bmN0aW9uIChlcnJvciwgaW1hZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5sb2FkVGlwcy5jbG9zZVRpcHMoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdmFyIGJpZ1Nwcml0ZSA9IG5ldyBGaXJlLlNwcml0ZShpbWFnZSk7XG4gICAgICAgICAgICAgICAgICAgIGZ1cm5pdHVyZS5zZXRTcHJpdGUoYmlnU3ByaXRlKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHByb3BzVHlwZSA9PT0gMikge1xuICAgICAgICAgICAgICAgIGVudGl0eSA9IHNlbGYucm9vbS5maW5kKCdncm91bmQnKTtcbiAgICAgICAgICAgICAgICBmdXJuaXR1cmUgPSBlbnRpdHkuZ2V0Q29tcG9uZW50KCdGdXJuaXR1cmUnKTtcbiAgICAgICAgICAgICAgICBmdXJuaXR1cmUuc2V0RnVybml0dXJlRGF0YShkcmVzcywgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgc2VsZi5sb2FkVGlwcy5vcGVuVGlwcygn5Yib5bu65Zu+54mH5Lit77yM6K+356iN5ZCOLi4uJyk7XG4gICAgICAgICAgICAgICAgc2VsZi5sb2FkSW1hZ2UoZnVybml0dXJlLmltYWdlVXJsLCBmdW5jdGlvbiAoZXJyb3IsIGltYWdlKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYubG9hZFRpcHMuY2xvc2VUaXBzKCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHZhciBiaWdTcHJpdGUgPSBuZXcgRmlyZS5TcHJpdGUoaW1hZ2UpO1xuICAgICAgICAgICAgICAgICAgICBmdXJuaXR1cmUuc2V0U3ByaXRlKGJpZ1Nwcml0ZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBlbnRpdHkgPSBGaXJlLmluc3RhbnRpYXRlKHNlbGYudGVtcEZ1cm5pdHVyZSk7XG4gICAgICAgICAgICAgICAgZW50aXR5LmFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgZW50aXR5LnBhcmVudCA9IHNlbGYucm9vbTtcbiAgICAgICAgICAgICAgICBlbnRpdHkubmFtZSA9IGRyZXNzLnByb3BzTmFtZTtcbiAgICAgICAgICAgICAgICAvLyDorr7nva7lnZDmoIdcbiAgICAgICAgICAgICAgICB2YXIgbmV3VmVjMiA9IG5ldyBGaXJlLlZlYzIoKTtcbiAgICAgICAgICAgICAgICB2YXIgc3RyID0gZHJlc3MucG9zLnNwbGl0KFwiOlwiKTtcbiAgICAgICAgICAgICAgICBuZXdWZWMyLnggPSBwYXJzZUZsb2F0KHN0clswXSk7XG4gICAgICAgICAgICAgICAgbmV3VmVjMi55ID0gcGFyc2VGbG9hdChzdHJbMV0pO1xuICAgICAgICAgICAgICAgIGVudGl0eS50cmFuc2Zvcm0ucG9zaXRpb24gPSBuZXdWZWMyO1xuICAgICAgICAgICAgICAgIC8vIOiuvue9ruinkuW6plxuICAgICAgICAgICAgICAgIGVudGl0eS50cmFuc2Zvcm0ucm90YXRpb24gPSBkcmVzcy5yb3RhdGlvbjtcbiAgICAgICAgICAgICAgICAvLyDorr7nva7lpKflsI9cbiAgICAgICAgICAgICAgICBzdHIgPSBkcmVzcy5zY2FsZS5zcGxpdChcIjpcIik7XG4gICAgICAgICAgICAgICAgbmV3VmVjMi54ID0gcGFyc2VGbG9hdChzdHJbMF0pO1xuICAgICAgICAgICAgICAgIG5ld1ZlYzIueSA9IHBhcnNlRmxvYXQoc3RyWzFdKTtcbiAgICAgICAgICAgICAgICBlbnRpdHkudHJhbnNmb3JtLnNjYWxlID0gbmV3VmVjMjtcbiAgICAgICAgICAgICAgICBmdXJuaXR1cmUgPSBlbnRpdHkuZ2V0Q29tcG9uZW50KCdGdXJuaXR1cmUnKTtcbiAgICAgICAgICAgICAgICBmdXJuaXR1cmUuc2V0RnVybml0dXJlRGF0YShkcmVzcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyDlrZjlgqjlpZfoo4XlrrblhbdcbiAgICAgICAgICAgIGlmIChmdXJuaXR1cmUuc3VpdF9pZCA9PT0gc2VsZi5jdXJEcmVzc1N1aXQuc3VpdF9pZCkge1xuICAgICAgICAgICAgICAgIHNlbGYuY3VyRHJlc3NTdWl0LmZ1bnJuaXR1cmVMaXN0LnB1c2goZnVybml0dXJlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy8g6L+b5YWl5oi/6Ze0XG4gICAgaW50b1Jvb206IGZ1bmN0aW9uIChzZW5kRGF0YSwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBzZWxmLm5ldFdvcmtNZ3IuUmVxdWVzdEludG9Ib21lRGF0YShzZW5kRGF0YSwgZnVuY3Rpb24gKHNlcnZlckRhdGEpIHtcbiAgICAgICAgICAgIGlmIChzZXJ2ZXJEYXRhLnN0YXR1cyAhPT0gMTAwMDApIHtcbiAgICAgICAgICAgICAgICBzZWxmLnRpcHNXaW5kb3cub3BlblRpcHNXaW5kb3coc2VydmVyRGF0YS5kZXNjKTtcbiAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNlbGYuZmxvb3JJZCA9IHNlcnZlckRhdGEuZmxvb3JJZDtcbiAgICAgICAgICAgIHNlbGYubWFyayA9IHNlcnZlckRhdGEubWFyaztcbiAgICAgICAgICAgIHNlbGYuaG91c2VfdWlkID0gc2VydmVyRGF0YS5ob3VzZV91aWQ7XG4gICAgICAgICAgICBzZWxmLnJvb21faWQgPSBzZXJ2ZXJEYXRhLnJvb21faWQ7XG4gICAgICAgICAgICBzZWxmLnJvb21fbmFtZSA9IHNlcnZlckRhdGEucm9vbV9uYW1lO1xuICAgICAgICAgICAgc2VsZi5kZWZhdWx0X2RpYmFuID0gc2VydmVyRGF0YS5kZWZhdWx0X2RpYmFuO1xuICAgICAgICAgICAgc2VsZi5kZWZhdWx0X2JlaWppbmcgPSBzZXJ2ZXJEYXRhLmRlZmF1bHRfYmVpamluZztcbiAgICAgICAgICAgIHNlbGYubWFpbk1lbnVNZ3IucmVmcmVzaEN1ckhvbWVUeXBlKHNlbGYucm9vbV9uYW1lKTtcbiAgICAgICAgICAgIHNlbGYubWFpbk1lbnVNZ3IucmVmcmVzaEN1clZpbGxhTmFtZShzZXJ2ZXJEYXRhLnZpbGxhX25hbWUpO1xuXG4gICAgICAgICAgICBzZWxmLmNoYXJhY3RlcnMuZW50aXR5LmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgc2VsZi5mYW1pbHlMaXN0ID0gc2VydmVyRGF0YS5mYW1pbHk7XG5cbiAgICAgICAgICAgIC8vIOiOt+WPluWll+ijheS/oeaBr1xuICAgICAgICAgICAgc2VsZi5jdXJEcmVzc1N1aXQgPSB7XG4gICAgICAgICAgICAgICAgLy8g5aWX6KOFSURcbiAgICAgICAgICAgICAgICBzdWl0X2lkOiBwYXJzZUludChzZXJ2ZXJEYXRhLnN1aXRfaWQpLFxuICAgICAgICAgICAgICAgIC8vIOiDjOWMhUlEXG4gICAgICAgICAgICAgICAgcGFja19pZDogMCxcbiAgICAgICAgICAgICAgICAvLyDlpZfoo4XlsI/lm75cbiAgICAgICAgICAgICAgICBzdWl0X2ljb246IG51bGwsXG4gICAgICAgICAgICAgICAgLy8g5aWX6KOF5ZCN56ewXG4gICAgICAgICAgICAgICAgc3VpdF9uYW1lOiAnJyxcbiAgICAgICAgICAgICAgICAvLyDlpZfoo4XmnaXoh6rlk6rph4zvvIwxLuiDjOWMhSAyLuWVhuWfjlxuICAgICAgICAgICAgICAgIHN1aXRfZnJvbTogMSxcbiAgICAgICAgICAgICAgICAvLyDlpZfoo4Xku7fmoLxcbiAgICAgICAgICAgICAgICBwcmljZTogMCxcbiAgICAgICAgICAgICAgICAvLyDmipjmiaNcbiAgICAgICAgICAgICAgICBkaXNjb3VudDogMSxcbiAgICAgICAgICAgICAgICAvLyDlpZfoo4XliJfooahcbiAgICAgICAgICAgICAgICBmdW5ybml0dXJlTGlzdDogW11cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICAvLyDmuIXnqbrlnLrmma9cbiAgICAgICAgICAgIHNlbGYucmVzZXRTY3JlZW4oKTtcbiAgICAgICAgICAgIC8vIOWIm+W7uuWutuWFt+WIsOWcuuaZr+S4rVxuICAgICAgICAgICAgc2VsZi5jcmVhdGVGdXJuaXR1cmVUb1NjcmVlbihzZXJ2ZXJEYXRhLmRyZXNzTGlzdCwgY2FsbGJhY2spO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIC8vIOmihOWKoOi9veS6jOe6p+iPnOWNlSDljZXlk4HlrrblhbfmlbDmja5cbiAgICBwcmVsb2FkU2luYWdsZUl0ZW1zRGF0YV9TZWNvbmQ6IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHNlbGYubmV0V29ya01nci5SZXF1ZXN0U2luZ2xlSXRlbXNNZW51KGZ1bmN0aW9uIChzZXJ2ZXJEYXRhKSB7XG4gICAgICAgICAgICBpZiAoc2VydmVyRGF0YS5zdGF0dXMgIT09IDEwMDAwKSB7XG4gICAgICAgICAgICAgICAgc2VsZi50aXBzV2luZG93Lm9wZW5UaXBzV2luZG93KHNlcnZlckRhdGEuZGVzYyk7XG4gICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzZXJ2ZXJEYXRhLmxpc3QgJiYgc2VydmVyRGF0YS5saXN0Lmxlbmd0aCA9PT0gMCAmJiBjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGluZGV4ID0gMDtcbiAgICAgICAgICAgIHNlcnZlckRhdGEubGlzdC5mb3JFYWNoKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgdmFyIGxvYWRJbWFnZUNhbGxCYWNrID0gZnVuY3Rpb24gKGRhdGEsIGluZGV4LCBlcnJvciwgaW1hZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZGF0YS5zbWFsbFNwcml0ZSA9IG5ldyBGaXJlLlNwcml0ZShpbWFnZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soaW5kZXgsIGRhdGEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMsIGRhdGEsIGluZGV4KTtcbiAgICAgICAgICAgICAgICAvLyDkv53lrZjmlbDmja5cbiAgICAgICAgICAgICAgICBzZWxmLnNpbmdsZV9TZWNvbmRfRGF0YVNoZWV0cy5wdXNoKGRhdGEpO1xuICAgICAgICAgICAgICAgIC8vIOWKoOi9veWbvueJh1xuICAgICAgICAgICAgICAgIC8vc2VsZi5sb2FkSW1hZ2UoZGF0YS51cmwsIGxvYWRJbWFnZUNhbGxCYWNrKTtcbiAgICAgICAgICAgICAgICBpbmRleCsrO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLy8g6aKE5Yqg6L295LiJ57qn6I+c5Y2VIOWNleWTgeWutuWFt+aVsOaNrlxuICAgIHByZWxvYWRTaW5hZ2xlSXRlbXNEYXRhX1RocmVlOiBmdW5jdGlvbiAoaWQsIHBhZ2UsIGVhY2gsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgaWYgKCFzZWxmLnNpbmdsZV9UaHJlZV9EYXRhU2hlZXRzW2lkXSkge1xuICAgICAgICAgICAgc2VsZi5zaW5nbGVfVGhyZWVfRGF0YVNoZWV0c1tpZF0gPSBbXTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgc2VuZERhdGEgPSB7XG4gICAgICAgICAgICB0aWQ6IGlkLFxuICAgICAgICAgICAgcGFnZTogcGFnZSxcbiAgICAgICAgICAgIGVhY2g6IC0xXG4gICAgICAgIH07XG4gICAgICAgIHNlbGYubmV0V29ya01nci5SZXF1ZXN0U2luZ2xlSXRlbXMoc2VuZERhdGEsIGZ1bmN0aW9uIChzZXJ2ZXJEYXRhKSB7XG4gICAgICAgICAgICBpZiAoc2VydmVyRGF0YS5zdGF0dXMgIT09IDEwMDAwKSB7XG4gICAgICAgICAgICAgICAgc2VsZi50aXBzV2luZG93Lm9wZW5UaXBzV2luZG93KHNlcnZlckRhdGEuZGVzYyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHRvdGFsID0gcGFyc2VJbnQoc2VydmVyRGF0YS50b3RhbCk7XG4gICAgICAgICAgICBzZWxmLnNpbmdsZV9UaHJlZV9Ub3RhbF9TaGVldHNbaWRdID0gdG90YWw7XG4gICAgICAgICAgICBpZiAodG90YWwgPT09IDAgJiYgY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBkYXRhU2hlZXRzID0gc2VsZi5zaW5nbGVfVGhyZWVfRGF0YVNoZWV0c1tpZF07XG4gICAgICAgICAgICB2YXIgaW5kZXggPSAwLCBsb2FkSW1hZ2VDb3VudCA9IDA7XG4gICAgICAgICAgICBzZXJ2ZXJEYXRhLmxpc3QuZm9yRWFjaChmdW5jdGlvbiAoZGF0YVNoZWV0cywgZGF0YSkge1xuICAgICAgICAgICAgICAgIHZhciBtZW51RGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcHNfaWQ6IHBhcnNlSW50KGRhdGEucHJvZF9pZCksXG4gICAgICAgICAgICAgICAgICAgIHByb3BzX25hbWU6IGRhdGEucHJvZF9uYW1lLFxuICAgICAgICAgICAgICAgICAgICBwcm9kX3VpZDogZGF0YS5wcm9kX3VpZCxcbiAgICAgICAgICAgICAgICAgICAgcHJpY2U6IGRhdGEucHJvZF9wcmljZSxcbiAgICAgICAgICAgICAgICAgICAgZGlzY291bnQ6IGRhdGEuZGlzY291bnQsXG4gICAgICAgICAgICAgICAgICAgIGJpZ0ltYWdlVXJsOiBkYXRhLnByb2Rfc291Y2VfdXJsLFxuICAgICAgICAgICAgICAgICAgICBiaWdTcHJpdGU6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIGltYWdlVXJsOiBkYXRhLnByb2RfaW1hZ2VfdXJsLFxuICAgICAgICAgICAgICAgICAgICBzbWFsbFNwcml0ZTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQ6IG51bGxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgdmFyIGxvYWRJbWFnZUNhbGxCYWNrID0gZnVuY3Rpb24gKG1lbnVEYXRhLCBpbmRleCwgZXJyb3IsIGltYWdlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9hZEltYWdlQ291bnQrKztcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsb2FkSW1hZ2VDb3VudCA8IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmxvYWRJbWFnZShtZW51RGF0YS5zYW1sbEltYWdlVXJsLCBsb2FkSW1hZ2VDYWxsQmFjayk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAgICAgbWVudURhdGEuc21hbGxTcHJpdGUgPSBuZXcgRmlyZS5TcHJpdGUoaW1hZ2UpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGlkLCBpbmRleCwgcGFnZSwgbWVudURhdGEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGxvYWRJbWFnZUNvdW50ID0gMDtcbiAgICAgICAgICAgICAgICB9LmJpbmQodGhpcywgbWVudURhdGEsIGluZGV4KTtcbiAgICAgICAgICAgICAgICAvLyDkv53lrZjmlbDmja5cbiAgICAgICAgICAgICAgICBkYXRhU2hlZXRzLnB1c2gobWVudURhdGEpO1xuICAgICAgICAgICAgICAgIC8vIOWKoOi9veWwj+WbvlxuICAgICAgICAgICAgICAgIC8vc2VsZi5sb2FkSW1hZ2UoZGF0YS5wcm9kX2ltYWdlX3VybCwgbG9hZEltYWdlQ2FsbEJhY2spO1xuICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgaW5kZXgrKztcbiAgICAgICAgICAgIH0uYmluZCh0aGlzLCBkYXRhU2hlZXRzKSk7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLy8g6aKE5Yqg6L295LqM57qn5aWX6KOF5pWw5o2uXG4gICAgcHJlbG9hZFN1aXRJdGVtc0RhdGFfU2Vjb25kOiBmdW5jdGlvbiAoY3VyUGFnZSwgY3VyRWFjaCwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHNlbmREYXRhID0ge1xuICAgICAgICAgICAgcGFnZTogY3VyUGFnZSxcbiAgICAgICAgICAgIGVhY2g6IC0xXG4gICAgICAgIH07XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgc2VsZi5uZXRXb3JrTWdyLlJlcXVlc3RTZXRJdGVtc01lbnUoc2VuZERhdGEsIGZ1bmN0aW9uIChzZXJ2ZXJEYXRhKSB7XG4gICAgICAgICAgICBpZiAoc2VydmVyRGF0YS5zdGF0dXMgIT09IDEwMDAwKSB7XG4gICAgICAgICAgICAgICAgc2VsZi50aXBzV2luZG93Lm9wZW5UaXBzV2luZG93KHNlcnZlckRhdGEuZGVzYyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8g5aWX6KOF5oC75pWw6YePXG4gICAgICAgICAgICBzZWxmLnN1aXRJdGVtc19UaHJlZV9Ub3RhbCA9IHBhcnNlSW50KHNlcnZlckRhdGEudG90YWwpO1xuICAgICAgICAgICAgaWYgKHNlbGYuc3VpdEl0ZW1zX1RocmVlX1RvdGFsID09PSAwICYmIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgaW5kZXggPSAwO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzZXJ2ZXJEYXRhLmxpc3QubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IHNlcnZlckRhdGEubGlzdFtpXTtcbiAgICAgICAgICAgICAgICB2YXIgc2V0RGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgdGlkOiBkYXRhLnByb2Rfc3VpdGlkLFxuICAgICAgICAgICAgICAgICAgICB0bmFtZTogZGF0YS5wcm9kX3N1aXRuYW1lLFxuICAgICAgICAgICAgICAgICAgICB1aWQ6IGRhdGEucHJvZF91aWQsXG4gICAgICAgICAgICAgICAgICAgIGltYWdlVXJsOiBkYXRhLnByb2RfaW1nLFxuICAgICAgICAgICAgICAgICAgICByb29tVHlwZTogZGF0YS5wcm9kX3Jvb210eXBlLFxuICAgICAgICAgICAgICAgICAgICBwcmljZTogZGF0YS5wcm9kX3ByaWNlLFxuICAgICAgICAgICAgICAgICAgICBzbWFsbFNwcml0ZTogbnVsbFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgc2VsZi5zdWl0SXRlbXNfU2Vjb25kX0RhdGFTaGVldHMucHVzaChzZXREYXRhKTtcbiAgICAgICAgICAgICAgICBpbmRleCsrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9LFxuICAgIC8vIOWIneWni+WMluS6jOe6p+iPnOWNleeJqeWTgeafnOaVsOaNrlxuICAgIGluaXRCYWNrcGFja0RhdGE6IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICBpZiAodGhpcy5iYWNrcGFja19TZWNvbmRfRGF0YVNoZWV0cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGRhdGEgPSB7XG4gICAgICAgICAgICB0aWQ6IDAsXG4gICAgICAgICAgICB0bmFtZTogJ+aIkeeahOWNleWTgScsXG4gICAgICAgICAgICBpc2RyYWc6IDIsXG4gICAgICAgICAgICBsb2NhbFBhdGg6ICdpdGVtc0NhYmluZXQvc2luZ2xlL3NpbmdsZScsXG4gICAgICAgICAgICBzbWFsbFNwcml0ZTogbnVsbFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmJhY2twYWNrX1NlY29uZF9EYXRhU2hlZXRzLnB1c2goZGF0YSk7XG4gICAgICAgIGRhdGEgPSB7XG4gICAgICAgICAgICB0aWQ6IDEsXG4gICAgICAgICAgICB0bmFtZTogJ+aIkeeahOWll+ijhScsXG4gICAgICAgICAgICBpc2RyYWc6IDIsXG4gICAgICAgICAgICBsb2NhbFBhdGg6ICdpdGVtc0NhYmluZXQvc2V0L3NldCcsXG4gICAgICAgICAgICBzbWFsbFNwcml0ZTogbnVsbFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmJhY2twYWNrX1NlY29uZF9EYXRhU2hlZXRzLnB1c2goZGF0YSk7XG4gICAgfSxcbiAgICAvLyDliqDovb3nianlk4Hmn5zmlbDmja5cbiAgICBsb2FkQmFja3BhY2tEYXRhOiBmdW5jdGlvbiAoaWQsIHBhZ2UsIGVhY2hudW0sIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgc2VsZi5iYWNrcGFja19UaHJlZV9EYXRhU2hlZXRzW2lkXSA9IFtdO1xuICAgICAgICAvLyDljZXlk4FcbiAgICAgICAgdmFyIHNpbmdsZUNhbGxCYWNrID0gZnVuY3Rpb24gKHNlcnZlckRhdGEpIHtcbiAgICAgICAgICAgIGlmIChzZXJ2ZXJEYXRhLnN0YXR1cyAhPT0gMTAwMDApIHtcbiAgICAgICAgICAgICAgICBzZWxmLnRpcHNXaW5kb3cub3BlblRpcHNXaW5kb3coc2VydmVyRGF0YS5kZXNjKTtcbiAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2spe1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgdG90YWwgPSBwYXJzZUludChzZXJ2ZXJEYXRhLnRvdGFsKTtcbiAgICAgICAgICAgIHNlbGYuYmFja3BhY2tfVGhyZWVfVG90YWxfU2hlZXRzW2lkXSA9IHRvdGFsO1xuICAgICAgICAgICAgaWYgKHRvdGFsID09PSAwICYmIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZXJ2ZXJEYXRhLmxpc3QuZm9yRWFjaChmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgIHZhciBsb2FjbERhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgIHBhY2tfaWQ6IGRhdGEucGFja19pZCxcbiAgICAgICAgICAgICAgICAgICAgcHJvZF91aWQ6IGRhdGEucHJvZF91aWQsXG4gICAgICAgICAgICAgICAgICAgIHByb3BzX2lkOiBkYXRhLnByb2RfaWQsXG4gICAgICAgICAgICAgICAgICAgIHN0YXR1czogZGF0YS5zdGF0dXMsXG4gICAgICAgICAgICAgICAgICAgIHByb3BzX3R5cGU6IGRhdGEucHJvZF9jYXRlZ29yeSxcbiAgICAgICAgICAgICAgICAgICAgaGFzRHJhZzogZGF0YS5wcm9kX2NhdGVnb3J5ID4gMixcbiAgICAgICAgICAgICAgICAgICAgcHJvcHNfbmFtZTogZGF0YS5wcm9kX25hbWUsXG4gICAgICAgICAgICAgICAgICAgIHByaWNlOiBkYXRhLnByaWNlLFxuICAgICAgICAgICAgICAgICAgICBkaXNjb3VudDogZGF0YS5kaXNjb3VudCxcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VVcmw6IGRhdGEucHJvZF9pbWFnZV91cmwsXG4gICAgICAgICAgICAgICAgICAgIGJpZ0ltYWdlVXJsOiBkYXRhLnByb2Rfc291Y2VfdXJsLFxuICAgICAgICAgICAgICAgICAgICBzbWFsbFNwcml0ZTogbnVsbFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgLy8g5L+d5a2Y5pWw5o2uXG4gICAgICAgICAgICAgICAgc2VsZi5iYWNrcGFja19UaHJlZV9EYXRhU2hlZXRzW2lkXS5wdXNoKGxvYWNsRGF0YSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIC8vIOWll+ijhVxuICAgICAgICB2YXIgc3VpdENhbGxCYWNrID0gZnVuY3Rpb24gKHNlcnZlckRhdGEpIHtcbiAgICAgICAgICAgIGlmIChzZXJ2ZXJEYXRhLnN0YXR1cyAhPT0gMTAwMDApIHtcbiAgICAgICAgICAgICAgICBzZWxmLnRpcHNXaW5kb3cub3BlblRpcHNXaW5kb3coc2VydmVyRGF0YS5kZXNjKTtcbiAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgdG90YWwgPSBwYXJzZUludChzZXJ2ZXJEYXRhLnRvdGFsKTtcbiAgICAgICAgICAgIHNlbGYuYmFja3BhY2tfVGhyZWVfVG90YWxfU2hlZXRzW2lkXSA9IHRvdGFsO1xuICAgICAgICAgICAgaWYgKHRvdGFsID09PSAwICYmIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZXJ2ZXJEYXRhLmxpc3QuZm9yRWFjaChmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgIHZhciBsb2NhbERhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgIHN1aXRfaWQ6IGRhdGEuc3VpdF9pZCxcbiAgICAgICAgICAgICAgICAgICAgc3VpdF9uYW1lOiBkYXRhLnN1aXRfbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgc3RhdHVzOiBkYXRhLnN0YXR1cyxcbiAgICAgICAgICAgICAgICAgICAgZHJlc3NMaXN0OiBkYXRhLmRyZXNzTGlzdCxcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VVcmw6IGRhdGEuc3VpdF9waWcsXG4gICAgICAgICAgICAgICAgICAgIHNtYWxsU3ByaXRlOiBudWxsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAvLyDkv53lrZjmlbDmja5cbiAgICAgICAgICAgICAgICBzZWxmLmJhY2twYWNrX1RocmVlX0RhdGFTaGVldHNbaWRdLnB1c2gobG9jYWxEYXRhKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgdmFyIHNlbmREYXRhID0ge1xuICAgICAgICAgICAgcGFnZTogcGFnZSxcbiAgICAgICAgICAgIGVhY2hudW06IC0xXG4gICAgICAgIH07XG4gICAgICAgIGlmIChpZCA9PT0gMCkge1xuICAgICAgICAgICAgc2VsZi5uZXRXb3JrTWdyLlJlcXVlc3RCYWNrcGFja1NpbmdsZShzZW5kRGF0YSwgc2luZ2xlQ2FsbEJhY2spO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgc2VsZi5uZXRXb3JrTWdyLlJlcXVlc3RCYWNrcGFja1N1aXQoc2VuZERhdGEsIHN1aXRDYWxsQmFjayk7XG4gICAgICAgIH1cbiAgICB9LFxufSk7XG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJzJhM2EzcHVLSkZFWkxjcXkvMXhrc2FxJywgJ0ZhbWlseUluZm8nKTtcbi8vIHNjcmlwdFxcdmlsbGFcXEZhbWlseUluZm8uanNcblxudmFyIENvbXAgPSBGaXJlLkNsYXNzKHtcbiAgICAvLyDnu6fmib9cbiAgICBleHRlbmRzOiBGaXJlLkNvbXBvbmVudCxcbiAgICAvLyDmnoTpgKDlh73mlbBcbiAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyDmiL/pl7TlkI3np7BcbiAgICAgICAgdGhpcy5mbG9vcl9uYW1lID0gJyc7XG4gICAgICAgIC8vIOaIv+mXtOetiee6p1xuICAgICAgICB0aGlzLmhvdXNlX2dyYWRlID0gMDtcbiAgICAgICAgLy8g54ix5Lq6SURcbiAgICAgICAgdGhpcy5sb3Zlcl9pZCA9IDA7XG4gICAgICAgIC8vIOeIseS6uuWQjeensFxuICAgICAgICB0aGlzLmxvdmVyX25hbWUgPSAnJztcbiAgICAgICAgLy8g54ix5Lq65oCn5YirXG4gICAgICAgIHRoaXMubG92ZXJfZ2VuZGVyID0gJyc7XG4gICAgICAgIC8vIOWFs+ezu1xuICAgICAgICB0aGlzLnJlbGF0aW9uX25hbWUgPSAnJztcbiAgICAgICAgLy8g5qCH6K6wXG4gICAgICAgIHRoaXMubWFyayA9ICcnO1xuICAgICAgICAvLyDlsYJJRFxuICAgICAgICB0aGlzLnN0b3JleV9pZCA9IDA7XG4gICAgICAgIC8vXG4gICAgICAgIHRoaXMuaXNfZGVmYXVsdCA9ICcnO1xuICAgIH0sXG4gICAgLy8g5bGe5oCnXG4gICAgcHJvcGVydGllczoge1xuICAgICAgICAvLyDmiL/lsYvnrYnnuqdcbiAgICAgICAgbGV2ZWw6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlRleHRcbiAgICAgICAgfSxcbiAgICAgICAgLy8g5oi/5Li7XG4gICAgICAgIGhvdXNlT3duZXI6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlRleHRcbiAgICAgICAgfSxcbiAgICAgICAgLy8g5LiOVEHnmoTlhbPns7tcbiAgICAgICAgcmVsYXRpb246IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlRleHRcbiAgICAgICAgfSxcbiAgICAgICAgLy8g5Yqg5YWl5oi/5bGLXG4gICAgICAgIGJ0bl9nb1RvOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5VSUJ1dHRvblxuICAgICAgICB9LFxuICAgICAgICAvLyDop6PpmaTlhbPns7tcbiAgICAgICAgYnRuX2RlbDoge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVUlCdXR0b25cbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy8g5pu05paw5oi/5bGL562J57qnXG4gICAgc2V0TGV2ZWw6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB0aGlzLmhvdXNlX2dyYWRlID0gdmFsdWU7XG4gICAgICAgIHRoaXMubGV2ZWwudGV4dCA9IHZhbHVlLnRvU3RyaW5nKCk7XG4gICAgfSxcbiAgICAvLyDmm7TmlrDmiL/kuLtcbiAgICBzZXRIb3VzZU93bmVyOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgdGhpcy5sb3Zlcl9uYW1lID0gdmFsdWU7XG4gICAgICAgIHRoaXMuaG91c2VPd25lci50ZXh0ID0gdmFsdWUudG9TdHJpbmcoKTtcbiAgICB9LFxuICAgIC8vIOabtOaWsOS4jlRB5YWz57O7XG4gICAgc2V0UmVsYXRpb246IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB0aGlzLnJlbGF0aW9uX25hbWUgPSB2YWx1ZTtcbiAgICAgICAgdGhpcy5yZWxhdGlvbi50ZXh0ID0gdmFsdWUudG9TdHJpbmcoKTtcbiAgICB9LFxuICAgIHJlZnJlc2g6IGZ1bmN0aW9uIChkYXRhLCBnb1RvRXZlbnQsIHJlbGlldmVFdmVudCkge1xuICAgICAgICB0aGlzLmJ0bl9nb1RvLm9uQ2xpY2sgPSBnb1RvRXZlbnQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5idG5fZ29Uby5vbkNsaWNrID0gcmVsaWV2ZUV2ZW50LmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuc2V0TGV2ZWwoZGF0YS5ob3VzZV9ncmFkZSB8fCAxKTtcbiAgICAgICAgdGhpcy5zZXRIb3VzZU93bmVyKGRhdGEubG92ZXJfbmFtZSB8fCAn5pegJyk7XG4gICAgICAgIHRoaXMuc2V0UmVsYXRpb24oZGF0YS5yZWxhdGlvbl9uYW1lIHx8ICfml6AnKTtcbiAgICAgICAgdGhpcy5tYXJrID0gZGF0YS5tYXJrIHx8IDA7XG4gICAgICAgIHRoaXMubG92ZXJfaWQgPSBkYXRhLmxvdmVyX2lkIHx8IDA7XG4gICAgICAgIHRoaXMubG92ZXJfZ2VuZGVyID0gZGF0YS5sb3Zlcl9nZW5kZXIgfHwgMDtcbiAgICAgICAgdGhpcy5zdG9yZXlfaWQgPSBkYXRhLnN0b3JleV9pZCAgfHwgMDtcbiAgICAgICAgdGhpcy5mbG9vcl9uYW1lID0gZGF0YS5mbG9vcl9uYW1lIHx8ICfml6AnO1xuICAgICAgICB0aGlzLmlzX2RlZmF1bHQgPSBkYXRhLmlzX2RlZmF1bHQgfHwgJyc7XG4gICAgICAgIHRoaXMuYnRuX2dvVG8ub25DbGljayA9IGdvVG9FdmVudDtcbiAgICAgICAgdGhpcy5idG5fZGVsLmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgaWYgKHRoaXMubG92ZXJfaWQgIT09IDApIHtcbiAgICAgICAgICAgIHRoaXMuYnRuX2RlbC5vbkNsaWNrID0gcmVsaWV2ZUV2ZW50O1xuICAgICAgICAgICAgdGhpcy5idG5fZGVsLmVudGl0eS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxufSk7XG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJzkwNGU2Z2Vmc2hNazc5SHBZYXdhSndoJywgJ0ZpcnN0TWVudU1ncicpO1xuLy8gc2NyaXB0XFx2aWxsYVxcRmlyc3RNZW51TWdyLmpzXG5cbi8vIOS4gOe6p+iPnOWNle+8iOWNleWTgS/lpZfoo4Uv54mp5ZOB5p+c77yJXG52YXIgRmlyc3RNZW51TWdyID0gRmlyZS5DbGFzcyh7XG4gICAgLy8g57un5om/XG4gICAgZXh0ZW5kczogRmlyZS5Db21wb25lbnQsXG4gICAgLy8g5p6E6YCg5Ye95pWwXG4gICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8g6I+c5Y2V5YiX6KGoXG4gICAgICAgIHRoaXMuX21lbnVMaXN0ID0gW107XG4gICAgfSxcbiAgICAvLyDlsZ7mgKdcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIG1hcmdpbjoge1xuICAgICAgICAgICAgZGVmYXVsdDogRmlyZS52MigwLCAxMDApXG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIOmHjee9rlRvZ2dsZeeKtuaAgVxuICAgIG1vZGlmeVRvZ2dsZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgY2hpbGQsIHRvZ2dsZTtcbiAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMuX21lbnVMaXN0Lmxlbmd0aCA7KytpKSB7XG4gICAgICAgICAgICBjaGlsZCA9IHRoaXMuX21lbnVMaXN0W2ldO1xuICAgICAgICAgICAgdG9nZ2xlID0gY2hpbGQuZ2V0Q29tcG9uZW50KCdUb2dnbGUnKTtcbiAgICAgICAgICAgIHRvZ2dsZS5yZXNldFRvZ2dsZSgpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyDmiZPlvIDkuoznuqfoj5zljZVcbiAgICBfb25PcGVuU2Vjb25kTWVudUV2ZW50OiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgdGhpcy5tb2RpZnlUb2dnbGUoKTtcbiAgICAgICAgdmFyIGlkID0gcGFyc2VJbnQoZXZlbnQudGFyZ2V0Lm5hbWUpO1xuICAgICAgICB0aGlzLmRhdGFCYXNlLnNlY29uZE1lbnVNZ3Iub3Blbk1lbnUoaWQpO1xuICAgIH0sXG4gICAgLy8g5omT5byA5LqM57qn6I+c5Y2VXG4gICAgX29uUmVtb3ZlU2NyZWVuRXZlbnQ6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHNlbGYuZGF0YUJhc2UudGlwc1dpbmRvdy5vcGVuVGlwc1dpbmRvdygn5piv5ZCm5riF56m65Zy65pmv77yfJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS5yZXNldFNjcmVlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS5zZWNvbmRNZW51TWdyLmNsb3NlTWVudSh0cnVlKTtcbiAgICAgICAgICAgICAgICBzZWxmLmRhdGFCYXNlLnRocmVlTWVudU1nci5jbG9zZU1lbnUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS5sb2FkVGlwcy5vcGVuVGlwcygn5Yid5aeL5YyW5Zy65pmv77yBJyk7XG4gICAgICAgICAgICAgICAgdmFyIHNlbmREYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICBtYXJrOiBzZWxmLmRhdGFCYXNlLm1hcmssXG4gICAgICAgICAgICAgICAgICAgIGNsZWFyOiAxXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBzZWxmLmRhdGFCYXNlLmludG9Sb29tKHNlbmREYXRhLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UubG9hZFRpcHMuY2xvc2VUaXBzKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICAvLyDojrflj5boj5zljZXmjInpkq7lubbkuJTnu5Hlrprkuovku7ZcbiAgICBfaW5pdE1lbnU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB2YXIgY2hpbGRyZW4gPSB0aGlzLmVudGl0eS5nZXRDaGlsZHJlbigpO1xuICAgICAgICBzZWxmLl9tZW51TGlzdCA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAvLyDnu5HlrprmjInpkq7kuovku7ZcbiAgICAgICAgICAgIGlmIChpID09PSAxKSB7XG4gICAgICAgICAgICAgICAgdmFyIGJ0biA9IGNoaWxkcmVuW2ldLmdldENvbXBvbmVudChGaXJlLlVJQnV0dG9uKTtcbiAgICAgICAgICAgICAgICBidG4ub25DbGljayA9IHNlbGYuX29uUmVtb3ZlU2NyZWVuRXZlbnQuYmluZChzZWxmKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciB0b2dnbGUgPSBjaGlsZHJlbltpXS5nZXRDb21wb25lbnQoJ1RvZ2dsZScpO1xuICAgICAgICAgICAgICAgIHRvZ2dsZS5vbkNsaWNrID0gc2VsZi5fb25PcGVuU2Vjb25kTWVudUV2ZW50LmJpbmQoc2VsZik7XG4gICAgICAgICAgICAgICAgc2VsZi5fbWVudUxpc3QucHVzaCh0b2dnbGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyDmiZPlvIDkuIDnuqfoj5zljZVcbiAgICBvcGVuTWVudTogZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5lbnRpdHkuYWN0aXZlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5lbnRpdHkuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5fbWVudUxpc3RbMF0uZGVmYXVsdFRvZ2dsZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLmRhdGFCYXNlLnNlY29uZE1lbnVNZ3Iub3Blbk1lbnUoMCk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfSxcbiAgICAvLyDlhbPpl61cbiAgICBjbG9zZU1lbnU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5lbnRpdHkuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuZGF0YUJhc2Uuc2Vjb25kTWVudU1nci5jbG9zZU1lbnUodHJ1ZSk7XG4gICAgICAgIHRoaXMuZGF0YUJhc2UudGhyZWVNZW51TWdyLmNsb3NlTWVudSh0cnVlKTtcbiAgICB9LFxuICAgIC8vIOW8gOWni1xuICAgIHN0YXJ0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIOW4uOeUqOeahOWPmOmHjy/mlbDmja5cbiAgICAgICAgdmFyIGdhbWVEYXRhRW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL0RhdGFCYXNlJyk7XG4gICAgICAgIHRoaXMuZGF0YUJhc2UgPSBnYW1lRGF0YUVudC5nZXRDb21wb25lbnQoJ0RhdGFCYXNlJyk7XG4gICAgICAgIC8vIOS6jOe6p+iPnOWNlVxuICAgICAgICB0aGlzLnNlY29uZE1lbnVNZ3IgPSB0aGlzLmRhdGFCYXNlLnNlY29uZE1lbnVNZ3I7XG4gICAgICAgIC8vIOiOt+WPluiPnOWNleaMiemSruW5tuS4lOe7keWumuS6i+S7tlxuICAgICAgICB0aGlzLl9pbml0TWVudSgpO1xuICAgIH0sXG4gICAgLy8g5pu05pawXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBjYW1lcmEgPSBGaXJlLkNhbWVyYS5tYWluO1xuICAgICAgICB2YXIgc2NyZWVuU2l6ZSA9IEZpcmUuU2NyZWVuLnNpemUubXVsKGNhbWVyYS5zaXplIC8gRmlyZS5TY3JlZW4uaGVpZ2h0KTtcbiAgICAgICAgdmFyIG5ld1BvcyA9IEZpcmUudjIodGhpcy5tYXJnaW4ueCwgLXNjcmVlblNpemUueSAvIDIgKyB0aGlzLm1hcmdpbi55KTtcbiAgICAgICAgdGhpcy5lbnRpdHkudHJhbnNmb3JtLnBvc2l0aW9uID0gbmV3UG9zO1xuICAgIH1cbn0pO1xuXG5GaXJlLl9SRnBvcCgpOyIsIkZpcmUuX1JGcHVzaChtb2R1bGUsICcyYzA2OURjdm9WTlM2bStCQStDZElxZycsICdGbG9vcldpbmRvdycpO1xuLy8gc2NyaXB0XFx2aWxsYVxcRmxvb3JXaW5kb3cuanNcblxuLy8g5qW85bGC5YiH5o2i56qX5Y+jXG52YXIgRmxvb3JXaW5kb3cgPSBGaXJlLkNsYXNzKHtcbiAgICAvLyDnu6fmib9cbiAgICBleHRlbmRzOiBGaXJlLkNvbXBvbmVudCxcbiAgICAvLyDmnoTpgKDlh73mlbBcbiAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLl9teUZhbWlseURhdGFTaGVldHMgPSBbXTtcbiAgICAgICAgdGhpcy5fYWRkTXlGYW1pbHlEYXRhU2hlZXRzID0gW107XG4gICAgICAgIC8vIOavj+mhteaYvuekuuWkmuWwkeS4qlxuICAgICAgICB0aGlzLl9zaG93UGFnZUNvdW50ID0gNztcbiAgICAgICAgLy8g5oC75pWwXG4gICAgICAgIHRoaXMuX2N1clRvdGFsID0gMDtcbiAgICAgICAgLy8g5b2T5YmN6aG15pWwXG4gICAgICAgIHRoaXMuX2N1clBhZ2UgPSAxO1xuICAgICAgICAvLyDmnIDlpKfpobXmlbBcbiAgICAgICAgdGhpcy5fbWF4UGFnZSA9IDE7XG4gICAgICAgIC8vIOexu+WeiyAw77ya5oiR55qE5a625bqt5oiQ5ZGYIDHvvJrmiJHliqDlhaXnmoTlrrbluq1cbiAgICAgICAgdGhpcy5mbG9vclR5cGUgPSAwO1xuICAgICAgICAvL1xuICAgICAgICB0aGlzLnJlbGlldmVpbmcgPSBmYWxzZTtcbiAgICB9LFxuICAgIC8vIOWxnuaAp1xuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgLy8g5oiR55qE5a625bqt5oiQ5ZGY5YiH5o2i5oyJ6ZKuXG4gICAgICAgIGJ0bl9teUZhbWlseToge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVG9nZ2xlXG4gICAgICAgIH0sXG4gICAgICAgIC8vIOaIkeWKoOWFpeeahOWutuW6reWIh+aNouaMiemSrlxuICAgICAgICBidG5fbXlBZGRGYW1pbHk6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlRvZ2dsZVxuICAgICAgICB9LFxuICAgICAgICAvLyDlhbPpl63mjInpkq5cbiAgICAgICAgYnRuX2Nsb3NlOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5VSUJ1dHRvblxuICAgICAgICB9LFxuICAgICAgICAvLyDkuIrkuIDpobVcbiAgICAgICAgYnRuX0xlZnQ6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlVJQnV0dG9uXG4gICAgICAgIH0sXG4gICAgICAgIC8vIOS4i+S4gOmhtVxuICAgICAgICBidG5fUmlnaHQ6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlVJQnV0dG9uXG4gICAgICAgIH0sXG4gICAgICAgIHBhZ2VUZXh0OiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5UZXh0XG4gICAgICAgIH0sXG4gICAgICAgIC8vIOWktOiKgueCuVxuICAgICAgICByb290OiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5FbnRpdHlcbiAgICAgICAgfSxcbiAgICAgICAgLy8g5Yqg5YWl5a625bqt55qE5qCH6aKYXG4gICAgICAgIGFkZEZhbWlseVRpdGxlOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5FbnRpdHlcbiAgICAgICAgfSxcbiAgICAgICAgLy8g5oiR55qE5a625bqt55qE5qCH6aKYXG4gICAgICAgIG15RmFtaWx5OiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5FbnRpdHlcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy8g5YWz6Zet56qX5Y+jXG4gICAgY2xvc2VXaW5kb3c6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5lbnRpdHkuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgIHRoaXMucmVzZXREYXRhKCk7XG4gICAgICAgIHRoaXMubW9kaWZ5VG9nZ2xlKCk7XG4gICAgfSxcbiAgICAvLyDmiZPlvIDnqpflj6NcbiAgICBvcGVuV2luZG93OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuZW50aXR5LmFjdGl2ZSA9IHRydWU7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgc2VsZi5kYXRhQmFzZS5sb2FkVGlwcy5vcGVuVGlwcygn6L295YWl5pWw5o2u77yB6K+356iN5ZCOLi4uJyk7XG4gICAgICAgIHNlbGYuZGF0YUJhc2UubmV0V29ya01nci5SZXF1ZXN0Rmxvb3JMaXN0KGZ1bmN0aW9uIChzZXJ2ZXJEYXRhKSB7XG4gICAgICAgICAgICBzZWxmLmRhdGFCYXNlLmxvYWRUaXBzLmNsb3NlVGlwcygpO1xuICAgICAgICAgICAgaWYgKCFGaXJlLkVuZ2luZS5pc1BsYXlpbmcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZWxmLnJlZnJlc2hGbG9vckRhdGEoc2VydmVyRGF0YSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHNlbGYuX3N3aXRjaGluZ0RhdGEoMCk7XG4gICAgICAgICAgICAgICAgc2VsZi5idG5fbXlGYW1pbHkuZGVmYXVsdFRvZ2dsZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLy9cbiAgICByZWZyZXNoRmxvb3JEYXRhOiBmdW5jdGlvbiAoc2VydmVyRGF0YSwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBpZiAoc2VydmVyRGF0YS5zdGF0dXMgIT09IDEwMDAwKSB7XG4gICAgICAgICAgICBzZWxmLmRhdGFCYXNlLnRpcHNXaW5kb3cub3BlblRpcHNXaW5kb3coc2VydmVyRGF0YS5kZXNjKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBzZWxmLl9teUZhbWlseURhdGFTaGVldHMgPSBbXTtcbiAgICAgICAgc2VydmVyRGF0YS5saXN0Lm15Zmxvb3IuZm9yRWFjaChmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgc2VsZi5fbXlGYW1pbHlEYXRhU2hlZXRzLnB1c2goZGF0YSk7XG4gICAgICAgIH0pO1xuICAgICAgICBzZWxmLl9hZGRNeUZhbWlseURhdGFTaGVldHMgPSBbXTtcbiAgICAgICAgc2VydmVyRGF0YS5saXN0Lm15bGl2ZWQuZm9yRWFjaChmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgc2VsZi5fYWRkTXlGYW1pbHlEYXRhU2hlZXRzLnB1c2goZGF0YSk7XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIOWFs+mXreaMiemSruS6i+S7tlxuICAgIF9vbkNsb3NlV2luZG93RXZlbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5jbG9zZVdpbmRvdygpO1xuICAgIH0sXG4gICAgLy8g6L+Y5Y6fXG4gICAgbW9kaWZ5VG9nZ2xlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuYnRuX215RmFtaWx5LnJlc2V0Q29sb3IoKTtcbiAgICAgICAgdGhpcy5idG5fbXlBZGRGYW1pbHkucmVzZXRDb2xvcigpO1xuICAgIH0sXG4gICAgLy8g5YiH5o2i5Yiw5oiR55qE5a625bqt5oiQ5ZGYXG4gICAgX29uTXlGYW1pbHlFdmVudDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLm15RmFtaWx5LmFjdGl2ZSA9IHRydWU7XG4gICAgICAgIHRoaXMuYWRkRmFtaWx5VGl0bGUuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX3N3aXRjaGluZ0RhdGEoMCk7XG4gICAgfSxcbiAgICAvLyDmiJHliqDlhaXnmoTlrrbluq1cbiAgICBfb25NeUFkZEZhbWlseUV2ZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMubXlGYW1pbHkuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuYWRkRmFtaWx5VGl0bGUuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5fc3dpdGNoaW5nRGF0YSgxKTtcbiAgICB9LFxuICAgIC8vIOmHjee9rlxuICAgIHJlc2V0RGF0YTogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgY2hpbGRyZW4gPSB0aGlzLnJvb3QuZ2V0Q2hpbGRyZW4oKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgY2hpbGRyZW5baV0uZGVzdHJveSgpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyDov5vlhaXmiL/lsYtcbiAgICBfb25Hb1RvSG91c2VFdmVudDogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIHRoaXMuY2xvc2VXaW5kb3coKTtcbiAgICAgICAgdmFyIGZhbWlseUluZm8gPSBldmVudC50YXJnZXQucGFyZW50LmdldENvbXBvbmVudCgnRmFtaWx5SW5mbycpO1xuICAgICAgICB2YXIgc2VuZERhdGEgPSB7XG4gICAgICAgICAgICBob3VzZV91aWQ6IDAsXG4gICAgICAgICAgICBmbG9vcl9pZDogMCxcbiAgICAgICAgICAgIG1hcms6IGZhbWlseUluZm8ubWFya1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmRhdGFCYXNlLnN3aXRjaFJvb21XaW4ub3BlbldpbmRvdygxLCBzZW5kRGF0YSk7XG4gICAgfSxcbiAgICAvLyDop6PpmaTlhbPns7tcbiAgICBfb25SZWxpZXZlRXZlbnQ6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIGlmIChzZWxmLnJlbGlldmVpbmcpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgZmFtaWx5SW5mbyA9IGV2ZW50LnRhcmdldC5wYXJlbnQuZ2V0Q29tcG9uZW50KCdGYW1pbHlJbmZvJyk7XG4gICAgICAgIHNlbGYuZGF0YUJhc2UudGlwc1dpbmRvdy5vcGVuVGlwc1dpbmRvdyhcIuaYr+WQpuS4jiBcIiArIGZhbWlseUluZm8ubG92ZXJfbmFtZSArIFwiIOino+mZpOWFs+ezuz9cIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2VsZi5yZWxpZXZlaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIHZhciBzZW5kRGF0YSA9IHtcbiAgICAgICAgICAgICAgICBtYXJrOiBmYW1pbHlJbmZvLm1hcmtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBzZWxmLmRhdGFCYXNlLm5ldFdvcmtNZ3IuUmVxdWVzdERpc2Fzc29jaWF0ZUxpc3Qoc2VuZERhdGEsIGZ1bmN0aW9uIChzZXJ2ZXJEYXRhKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNlcnZlckRhdGEuc3RhdHVzID09PSAxMDAwMCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLnJlZnJlc2hGbG9vckRhdGEoc2VydmVyRGF0YSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5fc3dpdGNoaW5nRGF0YShzZWxmLmZsb29yVHlwZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnJlbGlldmVpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLnRpcHNXaW5kb3cub3BlblRpcHNXaW5kb3coc2VydmVyRGF0YS5kZXNjKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICAvLyDph43nva7pobXmlbBcbiAgICBfc3dpdGNoaW5nRGF0YTogZnVuY3Rpb24gKHR5cGUpIHtcbiAgICAgICAgdGhpcy5tb2RpZnlUb2dnbGUoKTtcbiAgICAgICAgdGhpcy5mbG9vclR5cGUgPSB0eXBlO1xuICAgICAgICB0aGlzLl9jdXJQYWdlID0gMTtcbiAgICAgICAgdGhpcy5fbWF4UGFnZSA9IDE7XG4gICAgICAgIGlmICh0eXBlID09PSAwKXtcbiAgICAgICAgICAgIHRoaXMuYnRuX215RmFtaWx5LmRlZmF1bHRUb2dnbGUoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYnRuX215QWRkRmFtaWx5LmRlZmF1bHRUb2dnbGUoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNyZWF0ZUZhbWlseUluZm8oKTtcbiAgICB9LFxuICAgIC8vXG4gICAgY3JlYXRlRmFtaWx5SW5mbzogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnJlc2V0RGF0YSgpO1xuICAgICAgICB2YXIgZGF0YVNoZWV0cyA9IG51bGw7XG4gICAgICAgIGlmICh0aGlzLmZsb29yVHlwZSA9PT0gMCkge1xuICAgICAgICAgICAgZGF0YVNoZWV0cyA9IHRoaXMuX215RmFtaWx5RGF0YVNoZWV0cztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGRhdGFTaGVldHMgPSB0aGlzLl9hZGRNeUZhbWlseURhdGFTaGVldHM7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGJpbmRHb3RIb3VzZUV2ZW50ID0gdGhpcy5fb25Hb1RvSG91c2VFdmVudC5iaW5kKHRoaXMpO1xuICAgICAgICB2YXIgYmluZFJlbGlldmVFdmVudCA9IHRoaXMuX29uUmVsaWV2ZUV2ZW50LmJpbmQodGhpcyk7XG4gICAgICAgIC8vXG4gICAgICAgIHRoaXMuX2N1clRvdGFsID0gZGF0YVNoZWV0cy5sZW5ndGg7XG4gICAgICAgIHRoaXMuX21heFBhZ2UgPSBNYXRoLmNlaWwodGhpcy5fY3VyVG90YWwgLyB0aGlzLl9zaG93UGFnZUNvdW50KTtcbiAgICAgICAgaWYgKHRoaXMuX21heFBhZ2UgPT09IDApIHtcbiAgICAgICAgICAgIHRoaXMuX21heFBhZ2UgPSAxO1xuICAgICAgICB9XG4gICAgICAgIHZhciBzdGFydENvdW50ID0gKHRoaXMuX2N1clBhZ2UgLSAxKSAqIHRoaXMuX3Nob3dQYWdlQ291bnQ7XG4gICAgICAgIHZhciBlbnRDb3VudCA9IHN0YXJ0Q291bnQgKyB0aGlzLl9zaG93UGFnZUNvdW50O1xuICAgICAgICBpZiAoZW50Q291bnQgPiB0aGlzLl9jdXJUb3RhbCkge1xuICAgICAgICAgICAgZW50Q291bnQgPSB0aGlzLl9jdXJUb3RhbDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgaW5kZXggPSAwO1xuICAgICAgICBmb3IgKHZhciBpID0gc3RhcnRDb3VudDsgaSA8IGVudENvdW50OyArK2kpIHtcbiAgICAgICAgICAgIHZhciBkYXRhID0gZGF0YVNoZWV0c1tpXTtcbiAgICAgICAgICAgIHZhciBlbnQgPSBGaXJlLmluc3RhbnRpYXRlKHRoaXMuZGF0YUJhc2UudGVtcEZhbWlseUluZm8pO1xuICAgICAgICAgICAgZW50Lm5hbWUgPSBpLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICBlbnQucGFyZW50ID0gdGhpcy5yb290O1xuICAgICAgICAgICAgZW50LmFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICBlbnQudHJhbnNmb3JtLnBvc2l0aW9uID0gbmV3IEZpcmUuVmVjMigtMi41LCAxODggLSAoaW5kZXggKiA3NykpO1xuICAgICAgICAgICAgdmFyIGluZm8gPSBlbnQuZ2V0Q29tcG9uZW50KCdGYW1pbHlJbmZvJyk7XG4gICAgICAgICAgICBpbmZvLnJlZnJlc2goZGF0YSwgYmluZEdvdEhvdXNlRXZlbnQsIGJpbmRSZWxpZXZlRXZlbnQpO1xuICAgICAgICAgICAgaW5kZXgrKztcbiAgICAgICAgfVxuICAgICAgICAvLyDliLfmlrDmjInpkq7nirbmgIFcbiAgICAgICAgdGhpcy5fcmVmcmVzaEJ0blN0YXRlKCk7XG4gICAgfSxcbiAgICAvLyDliLfmlrDmjInpkq7nirbmgIFcbiAgICBfcmVmcmVzaEJ0blN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuYnRuX0xlZnQuZW50aXR5LmFjdGl2ZSA9IHRoaXMuX2N1clBhZ2UgPiAxO1xuICAgICAgICB0aGlzLmJ0bl9SaWdodC5lbnRpdHkuYWN0aXZlID0gdGhpcy5fY3VyUGFnZSA8IHRoaXMuX21heFBhZ2U7XG4gICAgICAgIHRoaXMucGFnZVRleHQudGV4dCA9ICfpobXmlbA6JyArIHRoaXMuX2N1clBhZ2UgKyBcIi9cIiArIHRoaXMuX21heFBhZ2U7XG4gICAgfSxcbiAgICAvLyDkuIvkuIDpobVcbiAgICBfb25OZXh0UGFnZUV2bmV0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuX2N1clBhZ2UgLT0gMTtcbiAgICAgICAgaWYgKHRoaXMuX2N1clBhZ2UgPCAxKXtcbiAgICAgICAgICAgIHRoaXMuX2N1clBhZ2UgPSAxO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY3JlYXRlRmFtaWx5SW5mbygpO1xuICAgIH0sXG4gICAgLy8g5LiK5LiA6aG1XG4gICAgX29uUHJldmlvdXNQYWdlRXZlbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5fY3VyUGFnZSArPSAxO1xuICAgICAgICBpZiAodGhpcy5fY3VyUGFnZSA+IHRoaXMuX21heFBhZ2Upe1xuICAgICAgICAgICAgdGhpcy5fY3VyUGFnZSA9IHRoaXMuX21heFBhZ2U7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jcmVhdGVGYW1pbHlJbmZvKCk7XG4gICAgfSxcbiAgICAvLyDlvIDlp4tcbiAgICBzdGFydDogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyDluLjnlKjnmoTlj5jph48v5pWw5o2uXG4gICAgICAgIHZhciBlbnQgPSBGaXJlLkVudGl0eS5maW5kKCcvRGF0YUJhc2UnKTtcbiAgICAgICAgdGhpcy5kYXRhQmFzZSA9IGVudC5nZXRDb21wb25lbnQoJ0RhdGFCYXNlJyk7XG4gICAgICAgIC8vXG4gICAgICAgIHRoaXMuYWRkRmFtaWx5VGl0bGUuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgIHRoaXMubXlGYW1pbHkuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgLy9cbiAgICAgICAgdGhpcy5idG5fY2xvc2Uub25DbGljayA9IHRoaXMuX29uQ2xvc2VXaW5kb3dFdmVudC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmJ0bl9teUZhbWlseS5vbkNsaWNrID0gdGhpcy5fb25NeUZhbWlseUV2ZW50LmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuYnRuX215QWRkRmFtaWx5Lm9uQ2xpY2sgPSB0aGlzLl9vbk15QWRkRmFtaWx5RXZlbnQuYmluZCh0aGlzKTtcbiAgICAgICAgLy9cbiAgICAgICAgdGhpcy5idG5fTGVmdC5vbkNsaWNrID0gdGhpcy5fb25OZXh0UGFnZUV2bmV0LmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuYnRuX1JpZ2h0Lm9uQ2xpY2sgPSB0aGlzLl9vblByZXZpb3VzUGFnZUV2ZW50LmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuYnRuX0xlZnQuZW50aXR5LmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLmJ0bl9SaWdodC5lbnRpdHkuYWN0aXZlID0gZmFsc2U7XG4gICAgfVxufSk7XG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJzBiOGM2WXFkYTFGSGJ4RDBPRTFCRnZ2JywgJ0Z1cm5pdHVyZScpO1xuLy8gc2NyaXB0XFx2aWxsYVxcRnVybml0dXJlLmpzXG5cbnZhciBGdXJuaXR1cmUgPSBGaXJlLkNsYXNzKHtcbiAgICAvLyDnu6fmib9cbiAgICBleHRlbmRzOiBGaXJlLkNvbXBvbmVudCxcbiAgICAvLyDmnoTpgKDlh73mlbBcbiAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLl9yZW5kZXJlciA9IG51bGw7XG4gICAgICAgIHRoaXMuc21hbGxTcHJpdGUgPSBudWxsO1xuICAgICAgICB0aGlzLm1lbnVEYXRhID0gbnVsbDtcbiAgICB9LFxuICAgIC8vIOWxnuaAp1xuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgLy8g5ZCN56ewXG4gICAgICAgIHByb3BzX25hbWU6ICcnLFxuICAgICAgICAvLyDnianlk4FJRFxuICAgICAgICBwcm9wc19pZDogLTEsXG4gICAgICAgIC8vIOeJqeWTgVVJRFxuICAgICAgICBwcm9wc191aWQ6IC0xLFxuICAgICAgICAvLyDog4zljIVJRFxuICAgICAgICBwYWNrX2lkOiAtMSxcbiAgICAgICAgLy8g5aWX6KOFSURcbiAgICAgICAgc3VpdF9pZDogLTEsXG4gICAgICAgIC8vIOexu+Wei1xuICAgICAgICBwcm9wc190eXBlOiAtMSxcbiAgICAgICAgLy8g5Lu35qC8XG4gICAgICAgIHByaWNlOiAtMSxcbiAgICAgICAgLy8g5oqY5omjXG4gICAgICAgIGRpc2NvdW50OiAxLFxuICAgICAgICAvLyDlm77niYfnmoR1cmxcbiAgICAgICAgaW1hZ2VVcmw6ICcnLFxuICAgICAgICAvLyDovb3lhaXml7bnmoTlm77niYdcbiAgICAgICAgZGVmYXVsdFNwcml0ZToge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuU3ByaXRlXG4gICAgICAgIH0sXG4gICAgICAgIGRlZmF1bHRMb2FkQW5pbToge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuQW5pbWF0aW9uXG4gICAgICAgIH0sXG4gICAgICAgIHJlbmRlcmVyOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5TcHJpdGVSZW5kZXJlclxuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyDorr7nva7pu5jorqTlm77niYdcbiAgICBzYXZlRGVmYXVsdFNwcml0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmRlZmF1bHRTcHJpdGUgPSB0aGlzLnJlbmRlcmVyLnNwcml0ZTtcbiAgICB9LFxuICAgIC8vIOiOt+WPluW9k+WJjeWbvueJh1xuICAgIGdldFJlbmRlclNwcml0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5zcHJpdGU7XG4gICAgfSxcbiAgICAvLyDorr7nva7moIforrBcbiAgICBzZXRNYXJrVXNlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgaWYgKHRoaXMubWVudURhdGEpIHtcbiAgICAgICAgICAgIHRoaXMubWVudURhdGEuc2V0TWFya1VzZSh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIOiuvue9ruWbvueJh1xuICAgIHNldFNwcml0ZTogZnVuY3Rpb24gKG5ld1Nwcml0ZSkge1xuICAgICAgICB0aGlzLnJlbmRlcmVyLnNwcml0ZSA9IG5ld1Nwcml0ZTtcbiAgICAgICAgdGhpcy5yZW5kZXJlci5zcHJpdGUucGl4ZWxMZXZlbEhpdFRlc3QgPSB0cnVlO1xuICAgIH0sXG4gICAgLy8g6K6+572u5a625YW35pWw5o2uXG4gICAgc2V0RnVybml0dXJlRGF0YTogZnVuY3Rpb24gKGRhdGEsIGhhc0JnQW5kR2QpIHtcbiAgICAgICAgaWYgKCEgdGhpcy5kYXRhQmFzZSkge1xuICAgICAgICAgICAgLy8g5bi455So55qE5Y+Y6YePL+aVsOaNrlxuICAgICAgICAgICAgdmFyIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9EYXRhQmFzZScpO1xuICAgICAgICAgICAgdGhpcy5kYXRhQmFzZSA9IGVudC5nZXRDb21wb25lbnQoJ0RhdGFCYXNlJyk7XG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgaWYgKHRoaXMuZGVmYXVsdExvYWRBbmltKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN0YXRlID0gdGhpcy5kZWZhdWx0TG9hZEFuaW0ucGxheSgnbG9hZGluZycpO1xuICAgICAgICAgICAgICAgIHN0YXRlLndyYXBNb2RlID0gRmlyZS5XcmFwTW9kZS5Mb29wO1xuICAgICAgICAgICAgICAgIHN0YXRlLnJlcGVhdENvdW50ID0gSW5maW5pdHk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5wcm9wc19uYW1lID0gZGF0YS5wcm9wc19uYW1lIHx8IGRhdGEucHJvcHNOYW1lO1xuICAgICAgICB0aGlzLnByb3BzX2lkID0gZGF0YS5wcm9wc19pZCB8fCBkYXRhLmlkO1xuICAgICAgICB0aGlzLnByb3BzX3VpZCA9ICBkYXRhLnByb3BzX3VpZCB8fCBkYXRhLnByb2RfdWlkIHx8IDA7XG4gICAgICAgIHRoaXMucHJvcHNfdHlwZSA9IGRhdGEucHJvcHNfdHlwZSB8fCBkYXRhLnByb3BzVHlwZTtcbiAgICAgICAgdGhpcy5wYWNrX2lkID0gZGF0YS5wYWNrX2lkIHx8IDA7XG4gICAgICAgIHRoaXMuc3VpdF9pZCA9IGRhdGEuc3VpdF9pZDtcbiAgICAgICAgdGhpcy5wcmljZSA9IGRhdGEucHJpY2UgfHwgMDtcbiAgICAgICAgdGhpcy5kaXNjb3VudCA9IGRhdGEuZGlzY291bnQgfHwgMTtcbiAgICAgICAgdGhpcy5pbWFnZVVybCA9IGRhdGEuYmlnSW1hZ2VVcmwgfHwgZGF0YS5pbWdVcmw7XG4gICAgICAgIHRoaXMuc21hbGxTcHJpdGUgPSBkYXRhLnNtYWxsU3ByaXRlIHx8IG51bGw7XG5cbiAgICAgICAgdGhpcy5lbnRpdHkuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgaWYgKCEgaGFzQmdBbmRHZCkge1xuICAgICAgICAgICAgdGhpcy5yZW5kZXJlci5lbnRpdHkuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmRlZmF1bHRMb2FkQW5pbS5lbnRpdHkuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuZGVmYXVsdExvYWRBbmltLnBsYXkoJ2xvYWRpbmcnKTtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UubG9hZEltYWdlKHNlbGYuaW1hZ2VVcmwsIGZ1bmN0aW9uIChkYXRhLCBlcnJvciwgaW1hZ2UpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNwcml0ZSA9IG5ldyBGaXJlLlNwcml0ZShpbWFnZSk7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuc2V0U3ByaXRlKHNwcml0ZSk7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZGVmYXVsdExvYWRBbmltLmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJlci5lbnRpdHkuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LmJpbmQodGhpcywgZGF0YSkpO1xuICAgICAgICB9XG4gICAgfVxufSk7XG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJzQwOGU4T3o3WkZHTXJONmw0aDhPN0lJJywgJ0dsb2JhbERhdGEnKTtcbi8vIHNjcmlwdFxcY29tbW9uXFxHbG9iYWxEYXRhLmpzXG5cbnZhciBHbG9iYWxEYXRhID0gRmlyZS5DbGFzcyh7XHJcbiAgICAvLyDvv73Ms++/vVxyXG4gICAgZXh0ZW5kczogRmlyZS5Db21wb25lbnQsXHJcbiAgICAvLyDvv73vv73vv73suq/vv73vv71cclxuICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5ob3N0TmFtZSA9IFwiXCI7XHJcbiAgICAgICAgdGhpcy5ob3N0U3ByaXRlID0gbnVsbDtcclxuICAgICAgICB0aGlzLmhvc3ROYW1lID0gXCJcIjtcclxuICAgICAgICB0aGlzLnNlbmREYXRhID0gbnVsbDtcclxuICAgIH0sXHJcbiAgICAvLyDvv73vv73vv73vv71cclxuICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAvLyAxLu+/ve+/ve+/ve+/ve+/ve+/ve+/vdqy77+977+977+91rHvv73Tve+/ve+/ve+/vdew77+977+9IDIuIO+/ve+/ve+/ve+/ve+/ve+/ve+/ve+/vVxyXG4gICAgICAgIGdvdG9UeXBlOiAtMVxyXG4gICAgfSxcclxuICAgIC8vIO+/ve+/vcq8XHJcbiAgICBzdGFydDogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgIH0sXHJcbiAgICAvLyDvv73vv73vv73vv71cclxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgIH1cclxufSk7XHJcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnYzVlZDJ0alJaVktuNjJQbEMzcGQxazUnLCAnTWFpbk1lbnVNZ3InKTtcbi8vIHNjcmlwdFxcdmlsbGFcXE1haW5NZW51TWdyLmpzXG5cbnZhciBEYXRhQmFzZSA9IHJlcXVpcmUoJ0RhdGFCYXNlJyk7XG4vLyDkuLvoj5zljZXnrqHnkIbnsbtcbnZhciBNYWluTWVudU1nciA9IEZpcmUuQ2xhc3Moe1xuICAgIC8vIOe7p+aJv1xuICAgIGV4dGVuZHM6IEZpcmUuQ29tcG9uZW50LFxuICAgIC8vIOaehOmAoOWHveaVsFxuICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIOiPnOWNleWIl+ihqFxuICAgICAgICB0aGlzLl9tZW51TGlzdCA9IFtdO1xuICAgIH0sXG4gICAgLy8g5bGe5oCnXG4gICAgcHJvcGVydGllczoge1xuICAgICAgICBtYXJnaW46IG5ldyBGaXJlLlZlYzIoKSxcbiAgICAgICAgLy8g5b2T5YmN5oi/6Ze05ZCN56ewXG4gICAgICAgIGhvbWVUeXBlOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5UZXh0XG4gICAgICAgIH0sXG4gICAgICAgIC8vIOW9k+WJjeWIq+WiheWQjeensFxuICAgICAgICB2aWxsYU5hbWU6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlRleHRcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy8g5YiH5o2i5oi/6Ze0XG4gICAgX29uQ2hhbmdlUm9vbUV2ZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCfliIfmjaLmiL/pl7QnKTtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB2YXIgc2VuZERhdGEgPSB7XG4gICAgICAgICAgICBob3VzZV91aWQ6IDAsXG4gICAgICAgICAgICBmbG9vcl9pZDogMCxcbiAgICAgICAgICAgIG1hcms6IHRoaXMuZGF0YUJhc2UubWFya1xuICAgICAgICB9O1xuICAgICAgICBzZWxmLmRhdGFCYXNlLnN3aXRjaFJvb21XaW4ub3BlbldpbmRvdygwLCBzZW5kRGF0YSk7XG4gICAgICAgIHNlbGYuZGF0YUJhc2UuY2hhcmFjdGVycy5lbnRpdHkuYWN0aXZlID0gZmFsc2U7XG4gICAgfSxcbiAgICAvLyDmiL/lsYvmia7pnZNcbiAgICBvbkhvdXNlRHJlc3NFdmVudDogZnVuY3Rpb24gKCkge1xuICAgICAgICBjb25zb2xlLmxvZygn5oi/5bGL5omu6Z2TJyk7XG4gICAgICAgIHZhciBzZW5kRGF0YSA9IHtcbiAgICAgICAgICAgIG1hcms6IHRoaXMuZGF0YUJhc2UubWFya1xuICAgICAgICB9O1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHNlbGYuZGF0YUJhc2UubG9hZFRpcHMub3BlblRpcHMoJ+ivt+axguaIv+Wxi+aJrumdk++8jOivt+eojeWQji4uLicpO1xuICAgICAgICBzZWxmLmRhdGFCYXNlLm5ldFdvcmtNZ3IuUmVxdWVzdENhbkRyZXNzUm9vbShzZW5kRGF0YSwgZnVuY3Rpb24gKHNlcnZlckRhdGEpIHtcbiAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UubG9hZFRpcHMuY2xvc2VUaXBzKCk7XG4gICAgICAgICAgICBpZiAoc2VydmVyRGF0YS5zdGF0dXMgPT09IDEwMDAwKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS5oYXNDYW5TYXZlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBzZWxmLmRhdGFCYXNlLnVzZXJjYyA9IHNlcnZlckRhdGEudXNlcmNjO1xuICAgICAgICAgICAgICAgIC8vIOihqOekuuacieaVsOaNruS4juacjeWKoeWZqOS4jeespuWQiOmcgOimgeabtOaWsFxuICAgICAgICAgICAgICAgIGlmIChzZXJ2ZXJEYXRhLmhhc3VwZGF0ZSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNlbmREYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbWFyazogc2VsZi5kYXRhQmFzZS5tYXJrXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UuaW50b1Jvb20oc2VuZERhdGEsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UuZmlyc3RNZW51TWdyLm9wZW5NZW51KCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS5maXJzdE1lbnVNZ3Iub3Blbk1lbnUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZWxmLmRhdGFCYXNlLnRpcHNXaW5kb3cub3BlblRpcHNXaW5kb3coc2VydmVyRGF0YS5kZXNjKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHNlbGYuZGF0YUJhc2UuY2hhcmFjdGVycy5lbnRpdHkuYWN0aXZlID0gZmFsc2U7XG4gICAgfSxcbiAgICAvLyDkv53lrZjoo4Xmia5cbiAgICBfb25TYXZlRHJlc3NFdmVudDogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIGlmICghIHNlbGYuZGF0YUJhc2UuaGFzU2F2ZVJvb20oKSkge1xuICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS50aXBzV2luZG93Lm9wZW5UaXBzV2luZG93KCfor7flhYjov5vooYzmiL/lsYvmia7pnZMuLicpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHNlbGYuZGF0YUJhc2UudGlwc1dpbmRvdy5vcGVuVGlwc1dpbmRvdygn5piv5ZCm56Gu5a6a5L+d5a2Y6KOF5omu77yfJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHNlbGYuZGF0YUJhc2UuaGFzUGF5KCkpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmRhdGFCYXNlLnBheU1lbnRXaW5kb3cub3BlbldpbmRvdygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS5sb2FkVGlwcy5vcGVuVGlwcygn5L+d5a2Y6KOF5omu5Lit77yB6K+356iN5ZCOLi4uJyk7XG4gICAgICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS5zYXZlUm9vbShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UubG9hZFRpcHMuY2xvc2VUaXBzKCk7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UudGlwc1dpbmRvdy5vcGVuVGlwc1dpbmRvdygn5L+d5a2Y6KOF5omu5oiQ5YqfLi4nKTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS5maXJzdE1lbnVNZ3IuY2xvc2VNZW51KCk7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZGF0YUJhc2Uuc2Vjb25kTWVudU1nci5jbG9zZU1lbnUoKTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS50aHJlZU1lbnVNZ3IuY2xvc2VNZW51KCk7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UucmVzZXRTY3JlZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNlbmREYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcms6IHNlbGYuZGF0YUJhc2UubWFya1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UubG9hZFRpcHMub3BlblRpcHMoJ+WIt+aWsOWcuuaZr++8jOivt+eojeWQji4uLicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS5pbnRvUm9vbShzZW5kRGF0YSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UubG9hZFRpcHMuY2xvc2VUaXBzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zb2xlLmxvZygn5L+d5a2Y6KOF5omuJyk7XG4gICAgICAgIH0pO1xuICAgICAgICBzZWxmLmRhdGFCYXNlLmNoYXJhY3RlcnMuZW50aXR5LmFjdGl2ZSA9IGZhbHNlO1xuICAgIH0sXG4gICAgLy8g5omu6Z2T5ZWG5Zy6XG4gICAgX29uR29Ub01hbGxFdmVudDogZnVuY3Rpb24gKCkge1xuICAgICAgICBjb25zb2xlLmxvZygn5omu6Z2T5ZWG5Zy6Jyk7XG4gICAgICAgIHdpbmRvdy5vcGVuKCdodHRwOi8vd3d3LnNhaWtlLmNvbS9ob3VzZWRyZXNzL3Nob3AucGhwJyk7XG4gICAgfSxcbiAgICAvLyDov5Tlm57lrqTlpJZcbiAgICBfb25Hb1RvT3V0RG9vckV2ZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCfov5Tlm57lrqTlpJYnKTtcbiAgICAgICAgLy93aW5kb3cub3BlbignaHR0cDovL3d3dy5zYWlrZS5jb20vaG91c2VkcmVzcy9tYXAucGhwJyk7XG4gICAgICAgIEZpcmUuRW5naW5lLmxvYWRTY2VuZSgnbGF1bmNoJyk7XG4gICAgfSxcbiAgICAvLyDojrflj5boj5zljZXmjInpkq7lubbkuJTnu5Hlrprkuovku7ZcbiAgICBfaW5pdE1lbnU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB2YXIgY2hpbGRyZW4gPSB0aGlzLmVudGl0eS5nZXRDaGlsZHJlbigpO1xuICAgICAgICBzZWxmLl9tZW51TGlzdCA9IFtdO1xuICAgICAgICBjaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uIChlbnQpIHtcbiAgICAgICAgICAgIC8vIOe7keWumuaMiemSruS6i+S7tlxuICAgICAgICAgICAgdmFyIGJ0biA9IGVudC5nZXRDb21wb25lbnQoJ1VJQnV0dG9uJyk7XG4gICAgICAgICAgICBpZiAoISBidG4pIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZW50Lm5hbWUgPT09IFwiMVwiKSB7XG4gICAgICAgICAgICAgICAgYnRuLm9uQ2xpY2sgPSBzZWxmLl9vbkNoYW5nZVJvb21FdmVudC5iaW5kKHNlbGYpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoZW50Lm5hbWUgPT09IFwiMlwiKSB7XG4gICAgICAgICAgICAgICAgYnRuLm9uQ2xpY2sgPSBzZWxmLm9uSG91c2VEcmVzc0V2ZW50LmJpbmQoc2VsZik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChlbnQubmFtZSA9PT0gXCIzXCIpIHtcbiAgICAgICAgICAgICAgICBidG4ub25DbGljayA9IHNlbGYuX29uU2F2ZURyZXNzRXZlbnQuYmluZChzZWxmKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGVudC5uYW1lID09PSBcIjRcIikge1xuICAgICAgICAgICAgICAgIGJ0bi5vbkNsaWNrID0gc2VsZi5fb25Hb1RvTWFsbEV2ZW50LmJpbmQoc2VsZik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChlbnQubmFtZSA9PT0gXCI1XCIpIHtcbiAgICAgICAgICAgICAgICBidG4ub25DbGljayA9IHNlbGYuX29uR29Ub091dERvb3JFdmVudC5iaW5kKHNlbGYpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2VsZi5fbWVudUxpc3QucHVzaChidG4pO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIC8vIOabtOaWsOW9k+WJjeaIv+mXtOexu+Wei1xuICAgIHJlZnJlc2hDdXJIb21lVHlwZTogZnVuY3Rpb24gKGhvbWVUeXBlKSB7XG4gICAgICAgIHRoaXMuaG9tZVR5cGUudGV4dCA9IFwi5b2T5YmNOlwiICsgaG9tZVR5cGU7XG4gICAgfSxcbiAgICAvLyDmm7TmlrDlvZPliY3liKvlooXlkI3np7BcbiAgICByZWZyZXNoQ3VyVmlsbGFOYW1lOiBmdW5jdGlvbiAodGV4dCkge1xuICAgICAgICBpZiAodGhpcy52aWxsYU5hbWUudGV4dCA9PT0gdGV4dCl7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy52aWxsYU5hbWUudGV4dCA9IHRleHQgfHwgXCJcIjtcbiAgICB9LFxuICAgIG9uTG9hZDogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyDluLjnlKjnmoTlj5jph48v5pWw5o2uXG4gICAgICAgIHZhciBlbnQgPSBGaXJlLkVudGl0eS5maW5kKCcvRGF0YUJhc2UnKTtcbiAgICAgICAgdGhpcy5kYXRhQmFzZSA9IGVudC5nZXRDb21wb25lbnQoJ0RhdGFCYXNlJyk7XG4gICAgICAgIC8vIOmhtemdouWkp+Wwj+WPkeeUn+WPmOWMlueahOaXtuWAmeS8muiwg+eUqOi/meS4quS6i+S7tlxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIEZpcmUuU2NyZWVuLm9uKCdyZXNpemUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgd2lkdGggPSBzZWxmLmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aDtcbiAgICAgICAgICAgIHZhciBoZWlnaHQgPSBzZWxmLmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQ7XG4gICAgICAgICAgICBpZiAod2lkdGggPCBoZWlnaHQpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmRhdGFCYXNlLnRpcHNXaW5kb3cub3BlblRpcHNXaW5kb3coJ+aoquWxj+aViOaenOabtOWlvSEnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UudGlwc1dpbmRvdy5jbG9zZVRpcHMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHZhciBkb2N1bWVudEVsZW1lbnQgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG4gICAgICAgIHZhciB3aWR0aCA9IGRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aDtcbiAgICAgICAgdmFyIGhlaWdodCA9IGRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQ7XG4gICAgICAgIHRoaXMuZG9jdW1lbnRFbGVtZW50ID0gZG9jdW1lbnRFbGVtZW50O1xuICAgICAgICBpZiAod2lkdGggPCBoZWlnaHQpIHtcbiAgICAgICAgICAgIHRoaXMuZGF0YUJhc2UudGlwc1dpbmRvdy5vcGVuV2luZG93KCfmqKrlsY/mlYjmnpzmm7Tlpb0hJyk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIOW8gOWni1xuICAgIHN0YXJ0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIOiOt+WPluiPnOWNleaMiemSruW5tuS4lOe7keWumuS6i+S7tlxuICAgICAgICB0aGlzLl9pbml0TWVudSgpO1xuXG4gICAgICAgIEZpcmUuRW5naW5lLnByZWxvYWRTY2VuZSgnbGF1bmNoJyk7XG4gICAgfSxcbiAgICAvLyDmm7TmlrBcbiAgICB1cGRhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8g5Yy56YWNVUnliIbovqjnjodcbiAgICAgICAgLy92YXIgY2FtZXJhID0gRmlyZS5DYW1lcmEubWFpbjtcbiAgICAgICAgLy92YXIgYmdXb3JsZEJvdW5kcyA9IHRoaXMuZGF0YUJhc2UuYmdSZW5kZXIuZ2V0V29ybGRCb3VuZHMoKTtcbiAgICAgICAgLy92YXIgYmdMZWZ0VG9wV29ybGRQb3MgPSBuZXcgRmlyZS5WZWMyKGJnV29ybGRCb3VuZHMueE1pbiwgYmdXb3JsZEJvdW5kcy55TWF4KTtcbiAgICAgICAgLy92YXIgYmdsZWZ0VG9wID0gY2FtZXJhLndvcmxkVG9TY3JlZW4oYmdMZWZ0VG9wV29ybGRQb3MpO1xuICAgICAgICAvL3ZhciBzY3JlZW5Qb3MgPSBuZXcgRmlyZS5WZWMyKGJnbGVmdFRvcC54LCBiZ2xlZnRUb3AueSk7XG4gICAgICAgIC8vdmFyIHdvcmxkUG9zID0gY2FtZXJhLnNjcmVlblRvV29ybGQoc2NyZWVuUG9zKTtcbiAgICAgICAgLy90aGlzLmVudGl0eS50cmFuc2Zvcm0ud29ybGRQb3NpdGlvbiA9IHdvcmxkUG9zO1xuICAgICAgICAvLyDljLnphY1VSeWIhui+qOeOh1xuICAgICAgICB2YXIgY2FtZXJhID0gRmlyZS5DYW1lcmEubWFpbjtcbiAgICAgICAgdmFyIHNjcmVlblNpemUgPSBGaXJlLlNjcmVlbi5zaXplLm11bChjYW1lcmEuc2l6ZSAvIEZpcmUuU2NyZWVuLmhlaWdodCk7XG4gICAgICAgIHZhciBuZXdQb3MgPSBGaXJlLnYyKC1zY3JlZW5TaXplLnggLyAyICsgdGhpcy5tYXJnaW4ueCwgc2NyZWVuU2l6ZS55IC8gMiAtIHRoaXMubWFyZ2luLnkpO1xuICAgICAgICB0aGlzLmVudGl0eS50cmFuc2Zvcm0ucG9zaXRpb24gPSBuZXdQb3M7XG4gICAgfVxufSk7XG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJ2E1ZjRlQ004NnRLMWF6QURXMkxKektrJywgJ01haW5NZW51Jyk7XG4vLyBzY3JpcHRcXG91dGRvb3JcXE1haW5NZW51LmpzXG5cbnZhciBNYWluTWVudSA9IEZpcmUuQ2xhc3Moe1xuICAgIGV4dGVuZHM6IEZpcmUuQ29tcG9uZW50LFxuXG4gICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5FWFBfQkFSX01BWF9WQUxVRSA9IDE1MDtcbiAgICB9LFxuXG4gICAgcHJvcGVydGllczoge1xuICAgICAgICBvZmZzZXQ6IG5ldyBGaXJlLlZlYzIoNzUwLCAtMTIwKSxcbiAgICAgICAgLy8g5Lq654mp5aS05YOPXG4gICAgICAgIGhlYWRJY29uOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5TcHJpdGVSZW5kZXJlclxuICAgICAgICB9LFxuICAgICAgICBoZWFkTmFtZToge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuQml0bWFwVGV4dFxuICAgICAgICB9LFxuICAgICAgICAvLyDkurrnianlkI3np7BcbiAgICAgICAgdXNlcl9uYW1lOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5CaXRtYXBUZXh0XG4gICAgICAgIH0sXG4gICAgICAgIC8vIOS6uueJqeaIkOmVv+etiee6p1xuICAgICAgICB1c2VyX2xldmVsOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5UZXh0XG4gICAgICAgIH0sXG4gICAgICAgIC8vIOS6uueJqee7j+mqjOWAvFxuICAgICAgICB1c2VyX2V4cDoge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVGV4dFxuICAgICAgICB9LFxuICAgICAgICAvL1xuICAgICAgICB1c2VyX2V4cEJhcjoge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuU3ByaXRlUmVuZGVyZXJcbiAgICAgICAgfSxcbiAgICAgICAgLy8g5Li75Lq65b2i6LGhXG4gICAgICAgIHVzZXJfc3ByaXRlOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5TcHJpdGVSZW5kZXJlclxuICAgICAgICB9LFxuICAgICAgICBidG5fR29Ub1NpbmdsZToge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVG9nZ2xlXG4gICAgICAgIH0sXG4gICAgICAgIGJ0bl9Hb1RvVmlsbGE6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlRvZ2dsZVxuICAgICAgICB9LFxuICAgICAgICBidG5fR29Ub015QWRkOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5VSUJ1dHRvblxuICAgICAgICB9LFxuICAgICAgICBidG5fR29Ub0hvdXNlU2hvcDoge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVUlCdXR0b25cbiAgICAgICAgfSxcbiAgICAgICAgYnRuX0dvVG9EcmVzc1Nob3A6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlVJQnV0dG9uXG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8g5Yid5aeL5YyW5Zy65pmvXG4gICAgbG9hZFNjcmVlbjogZnVuY3Rpb24gKHR5cGUpIHtcbiAgICAgICAgdmFyIHNlbmREYXRhID0ge1xuICAgICAgICAgICAgZHJlc3NfdHlwZTogdHlwZVxuICAgICAgICB9XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIGxvYWRUaXBUZXh0ID0gXCLljZXouqvlhazlr5PlpJbmma9cIjtcbiAgICAgICAgaWYgKHR5cGUgPT09IDIpIHtcbiAgICAgICAgICAgIGxvYWRUaXBUZXh0ID0gXCLliKvlooXlpJbnlYxcIjtcbiAgICAgICAgfVxuICAgICAgICBzZWxmLm9kYXRhQmFzZS5sb2FkVGlwLm9wZW5UaXBzKFwi6L295YWlXCIgKyBsb2FkVGlwVGV4dCArXCLkuK0s6K+356iN5ZCOIVwiKTtcbiAgICAgICAgc2VsZi5vZGF0YUJhc2UuaW5pdFNjcmVlbihzZW5kRGF0YSwgZnVuY3Rpb24gKHNlcnZlckRhdGEpIHtcbiAgICAgICAgICAgIHNlbGYub2RhdGFCYXNlLmxvYWRUaXAuY2xvc2VUaXBzKCk7XG4gICAgICAgICAgICBpZighIHNlcnZlckRhdGEpIHtcbiAgICAgICAgICAgICAgICBzZWxmLm9kYXRhQmFzZS5sb2FkVGlwLmNsb3NlVGlwcygpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNlbGYub2RhdGFCYXNlLmNoYXJhY3RlcnMuZW50aXR5LmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgLy8g5bGL5Li75pWw5o2uXG4gICAgICAgICAgICBpZiAoc2VydmVyRGF0YS5mYW1pbHkubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHNlbGYub2RhdGFCYXNlLmNoYXJhY3RlcnMuZW50aXR5LmFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgdmFyIGhvc3QgPSBzZXJ2ZXJEYXRhLmZhbWlseVswXTtcbiAgICAgICAgICAgICAgICB2YXIgaG9zdF91cmwgPSBob3N0LmZpZ3VyZV91cmw7XG4gICAgICAgICAgICAgICAgdmFyIGhvc3RfbmFtZSA9IGhvc3QudXNlcl9uYW1lO1xuICAgICAgICAgICAgICAgIHNlbGYub2RhdGFCYXNlLmxvYWRJbWFnZShob3N0X3VybCwgZnVuY3Rpb24gKGVycm9yLCBpbWFnZSkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLm9kYXRhQmFzZS5jaGFyYWN0ZXJzLnNldEhvc3QoaW1hZ2UsIGhvc3RfbmFtZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyDlrrbkurrmlbDmja5cbiAgICAgICAgICAgIGlmKHNlcnZlckRhdGEuZmFtaWx5Lmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICBmb3IodmFyIGkgPSAxLCBsZW4gPSBzZXJ2ZXJEYXRhLmZhbWlseS5sZW5ndGg7IGkgPCBsZW47ICsraSApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZhbWlseSA9IHNlcnZlckRhdGEuZmFtaWx5W2ldO1xuICAgICAgICAgICAgICAgICAgICB2YXIgZmFtaWx5X3VybCA9IGZhbWlseS5maWd1cmVfdXJsO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLm9kYXRhQmFzZS5sb2FkSW1hZ2UoZmFtaWx5X3VybCwgZnVuY3Rpb24gKGZhbWlseSwgZXJyb3IsIGltYWdlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZmFtaWx5X25hbWUgPSBmYW1pbHkucmVsYXRpb25fbmFtZSArIFwiIFwiICsgZmFtaWx5LnVzZXJfbmFtZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYub2RhdGFCYXNlLmNoYXJhY3RlcnMuYWRkRmFtaWx5KGltYWdlLCBmYW1pbHlfbmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzLCBmYW1pbHkpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHNlbGYuaGVhZE5hbWUudGV4dCA9IHNlcnZlckRhdGEub3duZXJpbmZvLnVzZXJfbmFtZTtcbiAgICAgICAgICAgIHNlbGYub2RhdGFCYXNlLnVpZCA9IHNlcnZlckRhdGEub3duZXJpbmZvLnVpZDtcbiAgICAgICAgICAgIHNlbGYudXNlcl9uYW1lLnRleHQgPSBzZXJ2ZXJEYXRhLm93bmVyaW5mby51c2VyX25hbWU7XG4gICAgICAgICAgICBzZWxmLnVzZXJfbGV2ZWwudGV4dCA9IHNlcnZlckRhdGEub3duZXJpbmZvLmdyYWRlO1xuXG4gICAgICAgICAgICB2YXIgY3VyRXhwID0gc2VydmVyRGF0YS5vd25lcmluZm8uZ3VfaGF2ZTtcbiAgICAgICAgICAgIHZhciBtYXhFeHAgPSBzZXJ2ZXJEYXRhLm93bmVyaW5mby5ndV9uZWVkO1xuICAgICAgICAgICAgc2VsZi51c2VyX2V4cC50ZXh0ID0gY3VyRXhwICsgXCIvXCIgKyBtYXhFeHA7XG4gICAgICAgICAgICB2YXIgcGVyY2VudGFnZSA9IHBhcnNlRmxvYXQoY3VyRXhwIC8gbWF4RXhwKTtcbiAgICAgICAgICAgIHZhciBleHBCYXJWYWx1ZSA9IHNlbGYuRVhQX0JBUl9NQVhfVkFMVUUgKiBwZXJjZW50YWdlO1xuICAgICAgICAgICAgc2VsZi51c2VyX2V4cEJhci5jdXN0b21XaWR0aCA9IGV4cEJhclZhbHVlO1xuXG4gICAgICAgICAgICB2YXIgdXJsID0gc2VydmVyRGF0YS5vd25lcmluZm8uaW1hZ2VfdXJsO1xuICAgICAgICAgICAgc2VsZi5vZGF0YUJhc2UubG9hZEltYWdlKHVybCwgZnVuY3Rpb24gKGVycm9yLCBpbWFnZSkge1xuICAgICAgICAgICAgICAgIGlmKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc2VsZi5oZWFkSWNvbi5zcHJpdGUgPSBuZXcgRmlyZS5TcHJpdGUoaW1hZ2UpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIOmAgumFjeiDjOaZr1xuICAgICAgICAgICAgc2VsZi5vZGF0YUJhc2UuYmdSZW5kZXIuY3VzdG9tV2lkdGggPSBzZWxmLndpZHRoICogKEZpcmUuQ2FtZXJhLm1haW4uc2l6ZSAvIHNlbGYuaGVpZ2h0KTtcbiAgICAgICAgICAgIHNlbGYub2RhdGFCYXNlLmJnUmVuZGVyLmN1c3RvbUhlaWdodCA9IEZpcmUuQ2FtZXJhLm1haW4uc2l6ZTtcbiAgICAgICAgICAgIC8vIOmAgumFjeaIv+Wxi1xuICAgICAgICAgICAgc2VsZi5vZGF0YUJhc2UuaG91c2UuYnRuUmVuZGVyLmN1c3RvbVdpZHRoID0gc2VsZi53aWR0aCAqIChGaXJlLkNhbWVyYS5tYWluLnNpemUgLyBzZWxmLmhlaWdodCk7XG4gICAgICAgICAgICBzZWxmLm9kYXRhQmFzZS5ob3VzZS5idG5SZW5kZXIuY3VzdG9tSGVpZ2h0ID0gRmlyZS5DYW1lcmEubWFpbi5zaXplO1xuXG4gICAgICAgICAgICBzZWxmLm9kYXRhQmFzZS5zdWJNZW51Lm9wZW5TdWJNZW51KHR5cGUpO1xuXG4gICAgICAgICAgICBzZWxmLm9kYXRhQmFzZS5tYXNrLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICB9KVxuICAgIH0sXG5cbiAgICAvLyB1c2UgdGhpcyBmb3IgaW5pdGlhbGl6YXRpb25cbiAgICBzdGFydDogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyDluLjnlKjnmoTlj5jph48v5pWw5o2uXG4gICAgICAgIHZhciBlbnQgPSBGaXJlLkVudGl0eS5maW5kKCcvT0RhdGFCYXNlJyk7XG4gICAgICAgIHRoaXMub2RhdGFCYXNlID0gZW50LmdldENvbXBvbmVudCgnT0RhdGFCYXNlJyk7XG5cbiAgICAgICAgRmlyZS5FbmdpbmUucHJlbG9hZFNjZW5lKCdzaW5nbGUnKTtcbiAgICAgICAgRmlyZS5FbmdpbmUucHJlbG9hZFNjZW5lKCd2aWxsYScpO1xuXG4gICAgICAgIHRoaXMuYnRuX0dvVG9TaW5nbGUub25DbGljayA9IHRoaXMub25Hb1RvU2luZ2xlRXZlbnQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5idG5fR29Ub1ZpbGxhLm9uQ2xpY2sgPSB0aGlzLm9uR29Ub1ZpbGxhRXZlbnQuYmluZCh0aGlzKTtcblxuICAgICAgICB0aGlzLmJ0bl9Hb1RvTXlBZGQub25DbGljayA9IHRoaXMub25Hb1RvTXlBZGRFdmVudC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmJ0bl9Hb1RvSG91c2VTaG9wLm9uQ2xpY2sgPSB0aGlzLm9uR29Ub0hvdXNlU2hvcEV2ZW50LmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuYnRuX0dvVG9EcmVzc1Nob3Aub25DbGljayA9IHRoaXMub25Hb1RvRHJlc3NTaG9wRXZlbnQuYmluZCh0aGlzKTtcblxuICAgICAgICB0aGlzLmRvY3VtZW50RWxlbWVudCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcbiAgICAgICAgdGhpcy53aWR0aCA9IHRoaXMuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoO1xuICAgICAgICB0aGlzLmhlaWdodCA9IHRoaXMuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodDtcblxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIEZpcmUuU2NyZWVuLm9uKCdyZXNpemUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgd2lkdGggPSBzZWxmLmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aDtcbiAgICAgICAgICAgIHZhciBoZWlnaHQgPSBzZWxmLmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQ7XG4gICAgICAgICAgICBpZiAod2lkdGggPCBoZWlnaHQpIHtcbiAgICAgICAgICAgICAgICBzZWxmLm9kYXRhQmFzZS50aXBDb21tb24ub3BlblRpcHNXaW5kb3coXCLmqKrlsY/mlYjmnpzmm7Tlpb0hXCIpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBUT0RPIOWFs+mXrVxuICAgICAgICAgICAgICAgIHNlbGYub2RhdGFCYXNlLnRpcENvbW1vbi5jbG9zZVRpcHMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgc2VsZi5idG5fR29Ub1NpbmdsZS5kZWZhdWx0VG9nZ2xlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwi6L+b5YWl5Y2V6Lqr5YWs5a+T5aSW5pmvXCIpO1xuICAgICAgICAgICAgc2VsZi5idG5fR29Ub1NpbmdsZS50ZXh0Q29udGVudC5jb2xvciA9IEZpcmUuQ29sb3Iud2hpdGU7XG4gICAgICAgICAgICBzZWxmLmxvYWRTY3JlZW4oMSk7XG4gICAgICAgIH0pO1xuXG5cbiAgICB9LFxuICAgIC8vIOmHjee9rlRvZ2dsZeeKtuaAgVxuICAgIG1vZGlmeVRvZ2dsZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmJ0bl9Hb1RvU2luZ2xlLnRleHRDb250ZW50LmNvbG9yID0gRmlyZS5Db2xvci5yZWQ7XG4gICAgICAgIHRoaXMuYnRuX0dvVG9TaW5nbGUucmVzZXRUb2dnbGUoKTtcbiAgICAgICAgdGhpcy5idG5fR29Ub1ZpbGxhLnRleHRDb250ZW50LmNvbG9yID0gRmlyZS5Db2xvci5yZWQ7XG4gICAgICAgIHRoaXMuYnRuX0dvVG9WaWxsYS5yZXNldFRvZ2dsZSgpO1xuICAgIH0sXG5cbiAgICBvbkdvVG9TaW5nbGVFdmVudDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLm1vZGlmeVRvZ2dsZSgpO1xuICAgICAgICB0aGlzLmJ0bl9Hb1RvU2luZ2xlLnRleHRDb250ZW50LmNvbG9yID0gRmlyZS5Db2xvci53aGl0ZTtcbiAgICAgICAgY29uc29sZS5sb2coXCLov5vlhaXljZXouqvlhazlr5PlpJbmma9cIik7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgc2VsZi5sb2FkU2NyZWVuKDEpO1xuICAgIH0sXG4gICAgb25Hb1RvVmlsbGFFdmVudDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLm1vZGlmeVRvZ2dsZSgpO1xuICAgICAgICB0aGlzLmJ0bl9Hb1RvVmlsbGEudGV4dENvbnRlbnQuY29sb3IgPSBGaXJlLkNvbG9yLndoaXRlO1xuICAgICAgICBjb25zb2xlLmxvZyhcIui/m+WFpeWIq+WiheWkluaZr1wiKTtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBzZWxmLmxvYWRTY3JlZW4oMik7XG4gICAgfSxcbiAgICBvbkdvVG9NeUFkZEV2ZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwi5omT5byA5oiR5Yqg5YWl55qEXCIpO1xuICAgICAgICB0aGlzLm9kYXRhQmFzZS5teUFkZEZhbWlseVdpbi5vcGVuV2luZG93KCk7XG4gICAgfSxcbiAgICBvbkdvVG9Ib3VzZVNob3BFdmVudDogZnVuY3Rpb24gKCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIuaJk+W8gOaIv+Wxi+WVhuWfjlwiKTtcbiAgICAgICAgd2luZG93Lm9wZW4oXCJodHRwOi8vd3d3LnNhaWtlLmNvbS9ob3VzZXNob3AvbnNob3AucGhwXCIpO1xuICAgIH0sXG4gICAgb25Hb1RvRHJlc3NTaG9wRXZlbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCLmiZPlvIDmia7pnZPllYbln45cIik7XG4gICAgICAgIHdpbmRvdy5vcGVuKCdodHRwOi8vd3d3LnNhaWtlLmNvbS9ob3VzZWRyZXNzL3Nob3AucGhwJyk7XG4gICAgfSxcblxuICAgIC8vIGNhbGxlZCBldmVyeSBmcmFtZVxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyDljLnphY1VSeWIhui+qOeOh1xuICAgICAgICB2YXIgY2FtZXJhID0gRmlyZS5DYW1lcmEubWFpbjtcbiAgICAgICAgdmFyIGJnV29ybGRCb3VuZHMgPSB0aGlzLm9kYXRhQmFzZS5iZ1JlbmRlci5nZXRXb3JsZEJvdW5kcygpO1xuICAgICAgICB2YXIgYmdMZWZ0VG9wV29ybGRQb3MgPSBuZXcgRmlyZS5WZWMyKGJnV29ybGRCb3VuZHMueE1pbisgdGhpcy5vZmZzZXQueCwgYmdXb3JsZEJvdW5kcy55TWF4ICsgdGhpcy5vZmZzZXQueSk7XG4gICAgICAgIHZhciBiZ2xlZnRUb3AgPSBjYW1lcmEud29ybGRUb1NjcmVlbihiZ0xlZnRUb3BXb3JsZFBvcyk7XG4gICAgICAgIHZhciBzY3JlZW5Qb3MgPSBuZXcgRmlyZS5WZWMyKGJnbGVmdFRvcC54LCBiZ2xlZnRUb3AueSk7XG4gICAgICAgIHZhciB3b3JsZFBvcyA9IGNhbWVyYS5zY3JlZW5Ub1dvcmxkKHNjcmVlblBvcyk7XG4gICAgICAgIHRoaXMuZW50aXR5LnRyYW5zZm9ybS53b3JsZFBvc2l0aW9uID0gd29ybGRQb3M7XG4gICAgfVxufSk7XG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJzJmZmQ1dzNDTHhFTDVvdUV5dTg4ampCJywgJ01lcmNoYW5kaXNlJyk7XG4vLyBzY3JpcHRcXHZpbGxhXFxNZXJjaGFuZGlzZS5qc1xuXG52YXIgTWVyY2hhbmRpc2UgPSBGaXJlLkNsYXNzKHtcclxuICAgIGV4dGVuZHM6IEZpcmUuQ29tcG9uZW50LFxyXG4gICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAvLyBpZDtcclxuICAgICAgICB0aGlzLnRpZCA9IDA7XHJcbiAgICAgICAgLy8g5pWw6YePXHJcbiAgICAgICAgdGhpcy5udW0gPSAxO1xyXG4gICAgICAgIC8vIOaJk+aKmFxyXG4gICAgICAgIHRoaXMuZGlzY291bnQgPSAxO1xyXG4gICAgICAgIC8vIOWNleS4quS7t+mSsVxyXG4gICAgICAgIHRoaXMucHJpY2UgPSAwO1xyXG4gICAgICAgIC8vIOaZrumAmuS7t1xyXG4gICAgICAgIHRoaXMub3JkaW5hcnlQcmljZVZhbHVlID0gMDtcclxuICAgICAgICAvLyDmiZPmipjku7dcclxuICAgICAgICB0aGlzLmRpc2NvdW50UHJpY2VWYWx1ZSA9IDA7XHJcbiAgICAgICAgLy8g5Yi35paw5oC75Lu35qC8XHJcbiAgICAgICAgdGhpcy5vbnJlZnJlc2hQcmljZUV2ZW50ID0gbnVsbDtcclxuICAgIH0sXHJcbiAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgaWNvbjoge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlNwcml0ZVJlbmRlcmVyXHJcbiAgICAgICAgfSxcclxuICAgICAgICB0TmFtZToge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlRleHRcclxuICAgICAgICB9LFxyXG4gICAgICAgIHROdW06IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5UZXh0XHJcbiAgICAgICAgfSxcclxuICAgICAgICBidG5fbGVzczoge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlVJQnV0dG9uXHJcbiAgICAgICAgfSxcclxuICAgICAgICBidG5fYWRkOiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVUlCdXR0b25cclxuICAgICAgICB9LFxyXG4gICAgICAgIG9yZGluYXJ5UHJpY2U6IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5UZXh0XHJcbiAgICAgICAgfSxcclxuICAgICAgICBkaXNjb3VudFByaWNlOiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVGV4dFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYnRuX2RlbDoge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlVJQnV0dG9uXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIOmHjee9rlxyXG4gICAgcmVzZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLmljb24uc3ByaXRlID0gbnVsbDtcclxuICAgICAgICB0aGlzLnROYW1lLnRleHQgPSAnJztcclxuICAgICAgICB0aGlzLnNldE51bSgwKTtcclxuICAgICAgICB0aGlzLm9yZGluYXJ5UHJpY2UudGV4dCA9IDAgKyBcIkPluIFcIjtcclxuICAgICAgICB0aGlzLmRpc2NvdW50UHJpY2UudGV4dCA9IDAgKyBcIkPluIFcIjtcclxuICAgICAgICB0aGlzLmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcclxuICAgIH0sXHJcbiAgICAvLyDlh4/lsJHmlbDph49cclxuICAgIF9vbkxlc3NFdmVudDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICh0aGlzLm51bSA9PT0gMSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMubnVtLS07XHJcbiAgICAgICAgaWYgKHRoaXMubnVtIDwgMSkge1xyXG4gICAgICAgICAgICB0aGlzLm51bSA9IDE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc2V0TnVtKHRoaXMubnVtKTtcclxuICAgICAgICB0aGlzLnJlZnJlc2hPcmRpbmFyeVByaWNlKCk7XHJcbiAgICAgICAgaWYgKHRoaXMub25yZWZyZXNoUHJpY2VFdmVudCkge1xyXG4gICAgICAgICAgICB0aGlzLm9ucmVmcmVzaFByaWNlRXZlbnQodGhpcy50aWQsIHRoaXMubnVtKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8g5aKe5Yqg5pWw6YePXHJcbiAgICBfb25BZGRFdmVudDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMubnVtKys7XHJcbiAgICAgICAgdGhpcy5zZXROdW0odGhpcy5udW0pO1xyXG4gICAgICAgIHRoaXMucmVmcmVzaE9yZGluYXJ5UHJpY2UoKTtcclxuICAgICAgICBpZiAodGhpcy5vbnJlZnJlc2hQcmljZUV2ZW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMub25yZWZyZXNoUHJpY2VFdmVudCh0aGlzLnRpZCwgdGhpcy5udW0pO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvLyDorr7nva7mlbDph49cclxuICAgIHNldE51bTogZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgdGhpcy5udW0gPSB2YWx1ZTtcclxuICAgICAgICB0aGlzLnROdW0udGV4dCA9IHZhbHVlO1xyXG4gICAgfSxcclxuICAgIC8vIOiuvue9ruaZrumAmuS7t1xyXG4gICAgcmVmcmVzaE9yZGluYXJ5UHJpY2U6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLm9yZGluYXJ5UHJpY2VWYWx1ZSA9IHRoaXMubnVtICogdGhpcy5wcmljZTtcclxuICAgICAgICB0aGlzLm9yZGluYXJ5UHJpY2UudGV4dCA9IHRoaXMub3JkaW5hcnlQcmljZVZhbHVlICsgXCJD5biBXCI7XHJcbiAgICAgICAgLy8g6K6+572u5omT5oqY5Lu3XHJcbiAgICAgICAgdGhpcy5yZWZyZXNoRGlzY291bnRQcmljZSgpO1xyXG4gICAgfSxcclxuICAgIC8vIOiuvue9ruaJk+aKmOS7t1xyXG4gICAgcmVmcmVzaERpc2NvdW50UHJpY2U6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLmRpc2NvdW50UHJpY2VWYWx1ZSA9IHRoaXMub3JkaW5hcnlQcmljZVZhbHVlICogdGhpcy5kaXNjb3VudDtcclxuICAgICAgICB0aGlzLmRpc2NvdW50UHJpY2UudGV4dCA9IHRoaXMuZGlzY291bnRQcmljZVZhbHVlICsgXCJD5biBXCI7XHJcbiAgICB9LFxyXG4gICAgLy8g5Yi35pawXHJcbiAgICByZWZyZXNoOiBmdW5jdGlvbiAoZGF0YSwgZGVsRXZlbnQsIHJlZnJlc2hQcmljZUV2ZW50KSB7XHJcbiAgICAgICAgdGhpcy50aWQgPSBkYXRhLnRpZDtcclxuICAgICAgICB0aGlzLmljb24uc3ByaXRlID0gZGF0YS5pY29uIHx8IG51bGw7XHJcbiAgICAgICAgdGhpcy50TmFtZS50ZXh0ID0gZGF0YS50TmFtZSB8fCAnJztcclxuICAgICAgICB0aGlzLnNldE51bShkYXRhLnROdW0gfHwgMCk7XHJcbiAgICAgICAgdGhpcy5wcmljZSA9IGRhdGEucHJpY2U7XHJcbiAgICAgICAgdGhpcy5kaXNjb3VudCA9IGRhdGEuZGlzY291bnQ7XHJcbiAgICAgICAgdGhpcy5yZWZyZXNoT3JkaW5hcnlQcmljZSgpO1xyXG4gICAgICAgIHRoaXMuYnRuX2RlbC5vbkNsaWNrID0gZGVsRXZlbnQgfHwgbnVsbDtcclxuICAgICAgICB0aGlzLm9ucmVmcmVzaFByaWNlRXZlbnQgPSByZWZyZXNoUHJpY2VFdmVudDtcclxuICAgICAgICB0aGlzLmVudGl0eS5hY3RpdmUgPSB0cnVlO1xyXG4gICAgfSxcclxuICAgIC8vXHJcbiAgICBzdGFydDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuYnRuX2xlc3Mub25DbGljayA9IHRoaXMuX29uTGVzc0V2ZW50LmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5idG5fYWRkLm9uQ2xpY2sgPSB0aGlzLl9vbkFkZEV2ZW50LmJpbmQodGhpcyk7XHJcbiAgICB9XHJcbn0pO1xyXG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJzQ1ZGVmZ2lzaHRDMktUNXVzK2ptWE5aJywgJ015QWRkRmFtaWx5V2luZG93Jyk7XG4vLyBzY3JpcHRcXG91dGRvb3JcXE15QWRkRmFtaWx5V2luZG93LmpzXG5cbnZhciBNeUFkZEZhbWlseVdpbmRvdyA9IEZpcmUuQ2xhc3Moe1xuICAgIC8vIOe7p+aJv1xuICAgIGV4dGVuZHM6IEZpcmUuQ29tcG9uZW50LFxuICAgIC8vIOaehOmAoOWHveaVsFxuICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuX2FkZE15RmFtaWx5RGF0YVNoZWV0cyA9IFtdO1xuICAgICAgICAvLyDmr4/pobXmmL7npLrlpJrlsJHkuKpcbiAgICAgICAgdGhpcy5fc2hvd1BhZ2VDb3VudCA9IDc7XG4gICAgICAgIC8vIOaAu+aVsFxuICAgICAgICB0aGlzLl9jdXJUb3RhbCA9IDA7XG4gICAgICAgIC8vIOW9k+WJjemhteaVsFxuICAgICAgICB0aGlzLl9jdXJQYWdlID0gMTtcbiAgICAgICAgLy8g5pyA5aSn6aG15pWwXG4gICAgICAgIHRoaXMuX21heFBhZ2UgPSAxO1xuICAgICAgICAvL1xuICAgICAgICB0aGlzLnJlbGlldmVpbmcgPSBmYWxzZTtcbiAgICB9LFxuICAgIC8vIOWxnuaAp1xuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgdGVtcEFkZEZhbWlseToge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuRW50aXR5XG4gICAgICAgIH0sXG4gICAgICAgIHJvb3Q6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLkVudGl0eVxuICAgICAgICB9LFxuICAgICAgICBidG5fY2xvc2U6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlVJQnV0dG9uXG4gICAgICAgIH0sXG4gICAgICAgIGJ0bl9uZXh0OiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5VSUJ1dHRvblxuICAgICAgICB9LFxuICAgICAgICBidG5fcHJldmlvdXM6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlVJQnV0dG9uXG4gICAgICAgIH0sXG4gICAgICAgIHBhZ2VUZXh0OiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5UZXh0XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgc3RhcnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8g5bi455So55qE5Y+Y6YePL+aVsOaNrlxuICAgICAgICB2YXIgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL09EYXRhQmFzZScpO1xuICAgICAgICB0aGlzLm9kYXRhQmFzZSA9IGVudC5nZXRDb21wb25lbnQoJ09EYXRhQmFzZScpO1xuICAgICAgICAvL1xuICAgICAgICB0aGlzLmJ0bl9jbG9zZS5vbkNsaWNrID0gdGhpcy5fb25DbG9zZVdpbmRvd0V2ZW50LmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuYnRuX3ByZXZpb3VzLm9uQ2xpY2sgPSB0aGlzLl9vbk5leHRQYWdlRXZuZXQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5idG5fbmV4dC5vbkNsaWNrID0gdGhpcy5fb25QcmV2aW91c1BhZ2VFdmVudC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmJ0bl9wcmV2aW91cy5lbnRpdHkuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuYnRuX25leHQuZW50aXR5LmFjdGl2ZSA9IGZhbHNlO1xuICAgIH0sXG4gICAgLy8g6YeN572uXG4gICAgcmVzZXREYXRhOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBjaGlsZHJlbiA9IHRoaXMucm9vdC5nZXRDaGlsZHJlbigpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBjaGlsZHJlbltpXS5kZXN0cm95KCk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIOi/m+WFpeaIv+Wxi1xuICAgIF9vbkdvVG9Ib3VzZUV2ZW50OiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgdGhpcy5jbG9zZVdpbmRvdygpO1xuICAgICAgICB2YXIgZmFtaWx5SW5mbyA9IGV2ZW50LnRhcmdldC5wYXJlbnQuZ2V0Q29tcG9uZW50KCdGYW1pbHlJbmZvJyk7XG4gICAgICAgIHZhciBzZW5kRGF0YSA9IHtcbiAgICAgICAgICAgIGhvdXNlX3VpZDogMCxcbiAgICAgICAgICAgIGZsb29yX2lkOiAwLFxuICAgICAgICAgICAgbWFyazogZmFtaWx5SW5mby5tYXJrXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMub2RhdGFCYXNlLnBsYW5XaW4ub3BlbldpbmRvdyhzZW5kRGF0YSk7XG4gICAgfSxcbiAgICAvLyDop6PpmaTlhbPns7tcbiAgICBfb25SZWxpZXZlRXZlbnQ6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIGlmIChzZWxmLnJlbGlldmVpbmcpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgZmFtaWx5SW5mbyA9IGV2ZW50LnRhcmdldC5wYXJlbnQuZ2V0Q29tcG9uZW50KCdGYW1pbHlJbmZvJyk7XG4gICAgICAgIHNlbGYub2RhdGFCYXNlLnRpcENvbW1vbi5vcGVuVGlwc1dpbmRvdyhcIuaYr+WQpuS4jiBcIiArIGZhbWlseUluZm8ubG92ZXJfbmFtZSArIFwiIOino+mZpOWFs+ezuz9cIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2VsZi5yZWxpZXZlaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIHZhciBzZW5kRGF0YSA9IHtcbiAgICAgICAgICAgICAgICBtYXJrOiBmYW1pbHlJbmZvLm1hcmtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBzZWxmLm9kYXRhQmFzZS5zZXJ2ZXJOZXRXb3JrLlJlcXVlc3REaXNhc3NvY2lhdGVMaXN0KHNlbmREYXRhLCBmdW5jdGlvbiAoc2VydmVyRGF0YSkge1xuICAgICAgICAgICAgICAgIGlmIChzZXJ2ZXJEYXRhLnN0YXR1cyA9PT0gMTAwMDApIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5yZWZyZXNoRmxvb3JEYXRhKHNlcnZlckRhdGEsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuY3JlYXRlRmFtaWx5SW5mbygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5yZWxpZXZlaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi50aXBDb21tb24ub3BlblRpcHNXaW5kb3coc2VydmVyRGF0YS5kZXNjKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICAvLyDlhbPpl63mjInpkq7kuovku7ZcbiAgICBfb25DbG9zZVdpbmRvd0V2ZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuY2xvc2VXaW5kb3coKTtcbiAgICB9LFxuICAgIC8vIOWIt+aWsOaMiemSrueKtuaAgVxuICAgIF9yZWZyZXNoQnRuU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5idG5fcHJldmlvdXMuZW50aXR5LmFjdGl2ZSA9IHRoaXMuX2N1clBhZ2UgPiAxO1xuICAgICAgICB0aGlzLmJ0bl9uZXh0LmVudGl0eS5hY3RpdmUgPSB0aGlzLl9jdXJQYWdlIDwgdGhpcy5fbWF4UGFnZTtcbiAgICAgICAgdGhpcy5wYWdlVGV4dC50ZXh0ID0gJ+mhteaVsDonICsgdGhpcy5fY3VyUGFnZSArIFwiL1wiICsgdGhpcy5fbWF4UGFnZTtcbiAgICB9LFxuICAgIC8vIOS4i+S4gOmhtVxuICAgIF9vbk5leHRQYWdlRXZuZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5fY3VyUGFnZSAtPSAxO1xuICAgICAgICBpZiAodGhpcy5fY3VyUGFnZSA8IDEpe1xuICAgICAgICAgICAgdGhpcy5fY3VyUGFnZSA9IDE7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jcmVhdGVGYW1pbHlJbmZvKCk7XG4gICAgfSxcbiAgICAvLyDkuIrkuIDpobVcbiAgICBfb25QcmV2aW91c1BhZ2VFdmVudDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLl9jdXJQYWdlICs9IDE7XG4gICAgICAgIGlmICh0aGlzLl9jdXJQYWdlID4gdGhpcy5fbWF4UGFnZSl7XG4gICAgICAgICAgICB0aGlzLl9jdXJQYWdlID0gdGhpcy5fbWF4UGFnZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNyZWF0ZUZhbWlseUluZm8oKTtcbiAgICB9LFxuICAgIHJlZnJlc2hGbG9vckRhdGE6IGZ1bmN0aW9uIChzZXJ2ZXJEYXRhLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIGlmIChzZXJ2ZXJEYXRhLnN0YXR1cyAhPT0gMTAwMDApIHtcbiAgICAgICAgICAgIHNlbGYub2RhdGFCYXNlLnRpcENvbW1vbi5vcGVuVGlwc1dpbmRvdyhzZXJ2ZXJEYXRhLmRlc2MpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHNlbGYuX2FkZE15RmFtaWx5RGF0YVNoZWV0cyA9IFtdO1xuICAgICAgICBzZXJ2ZXJEYXRhLmxpc3QubXlsaXZlZC5mb3JFYWNoKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICBzZWxmLl9hZGRNeUZhbWlseURhdGFTaGVldHMucHVzaChkYXRhKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy9cbiAgICBjcmVhdGVGYW1pbHlJbmZvOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMucmVzZXREYXRhKCk7XG4gICAgICAgIHZhciBkYXRhU2hlZXRzID0gdGhpcy5fYWRkTXlGYW1pbHlEYXRhU2hlZXRzO1xuICAgICAgICB2YXIgYmluZEdvdEhvdXNlRXZlbnQgPSB0aGlzLl9vbkdvVG9Ib3VzZUV2ZW50LmJpbmQodGhpcyk7XG4gICAgICAgIHZhciBiaW5kUmVsaWV2ZUV2ZW50ID0gdGhpcy5fb25SZWxpZXZlRXZlbnQuYmluZCh0aGlzKTtcbiAgICAgICAgLy9cbiAgICAgICAgdGhpcy5fY3VyVG90YWwgPSBkYXRhU2hlZXRzLmxlbmd0aDtcbiAgICAgICAgdGhpcy5fbWF4UGFnZSA9IE1hdGguY2VpbCh0aGlzLl9jdXJUb3RhbCAvIHRoaXMuX3Nob3dQYWdlQ291bnQpO1xuICAgICAgICBpZiAodGhpcy5fbWF4UGFnZSA9PT0gMCkge1xuICAgICAgICAgICAgdGhpcy5fbWF4UGFnZSA9IDE7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHN0YXJ0Q291bnQgPSAodGhpcy5fY3VyUGFnZSAtIDEpICogdGhpcy5fc2hvd1BhZ2VDb3VudDtcbiAgICAgICAgdmFyIGVudENvdW50ID0gc3RhcnRDb3VudCArIHRoaXMuX3Nob3dQYWdlQ291bnQ7XG4gICAgICAgIGlmIChlbnRDb3VudCA+IHRoaXMuX2N1clRvdGFsKSB7XG4gICAgICAgICAgICBlbnRDb3VudCA9IHRoaXMuX2N1clRvdGFsO1xuICAgICAgICB9XG4gICAgICAgIHZhciBpbmRleCA9IDA7XG4gICAgICAgIGZvciAodmFyIGkgPSBzdGFydENvdW50OyBpIDwgZW50Q291bnQ7ICsraSkge1xuICAgICAgICAgICAgdmFyIGRhdGEgPSBkYXRhU2hlZXRzW2ldO1xuICAgICAgICAgICAgdmFyIGVudCA9IEZpcmUuaW5zdGFudGlhdGUodGhpcy50ZW1wQWRkRmFtaWx5KTtcbiAgICAgICAgICAgIGVudC5uYW1lID0gaS50b1N0cmluZygpO1xuICAgICAgICAgICAgZW50LnBhcmVudCA9IHRoaXMucm9vdDtcbiAgICAgICAgICAgIGVudC5hY3RpdmUgPSB0cnVlO1xuICAgICAgICAgICAgZW50LnRyYW5zZm9ybS5wb3NpdGlvbiA9IG5ldyBGaXJlLlZlYzIoLTIuNSwgKGluZGV4ICogNzcpKTtcbiAgICAgICAgICAgIHZhciBpbmZvID0gZW50LmdldENvbXBvbmVudCgnRmFtaWx5SW5mbycpO1xuICAgICAgICAgICAgaW5mby5yZWZyZXNoKGRhdGEsIGJpbmRHb3RIb3VzZUV2ZW50LCBiaW5kUmVsaWV2ZUV2ZW50KTtcbiAgICAgICAgICAgIGluZGV4Kys7XG4gICAgICAgIH1cbiAgICAgICAgLy8g5Yi35paw5oyJ6ZKu54q25oCBXG4gICAgICAgIHRoaXMuX3JlZnJlc2hCdG5TdGF0ZSgpO1xuICAgIH0sXG4gICAgLy8g5omT5byA56qX5Y+jXG4gICAgb3BlbldpbmRvdzogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmVudGl0eS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHNlbGYub2RhdGFCYXNlLmxvYWRUaXAub3BlblRpcHMoJ+i9veWFpeaVsOaNru+8geivt+eojeWQji4uLicpO1xuICAgICAgICBzZWxmLm9kYXRhQmFzZS5zZXJ2ZXJOZXRXb3JrLlJlcXVlc3RGbG9vckxpc3QoZnVuY3Rpb24gKHNlcnZlckRhdGEpIHtcbiAgICAgICAgICAgIHNlbGYub2RhdGFCYXNlLmxvYWRUaXAuY2xvc2VUaXBzKCk7XG4gICAgICAgICAgICBzZWxmLnJlZnJlc2hGbG9vckRhdGEoc2VydmVyRGF0YSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmIChzZWxmLl9hZGRNeUZhbWlseURhdGFTaGVldHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYub2RhdGFCYXNlLnRpcE5vQWRkRmFtaWx5Lm9wZW5UaXBzV2luZG93KG51bGwsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5vcGVuKFwiaHR0cDovL3d3dy5zYWlrZS5jb20vaG91c2VzaG9wL25ld2hvdXNlLnBocFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuY2xvc2VXaW5kb3coKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzZWxmLmNyZWF0ZUZhbWlseUluZm8oKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIC8vIOWFs+mXreeql+WPo1xuICAgIGNsb3NlV2luZG93OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuZW50aXR5LmFjdGl2ZSA9IGZhbHNlO1xuICAgIH1cbn0pO1xuXG5GaXJlLl9SRnBvcCgpOyIsIkZpcmUuX1JGcHVzaChtb2R1bGUsICcxNmM3ZGVoM2xOR21weTJtdEVMdThCVycsICdOZXR3b3JrTWdyJyk7XG4vLyBzY3JpcHRcXHZpbGxhXFxOZXR3b3JrTWdyLmpzXG5cbi8vIOi3n+acjeWKoeWZqOi/m+ihjOWvueaOpVxyXG52YXIgTmV0d29ya01nciA9IEZpcmUuQ2xhc3Moe1xyXG4gICAgLy8g57un5om/XHJcbiAgICBleHRlbmRzOiBGaXJlLkNvbXBvbmVudCxcclxuICAgIC8vIOaehOmAoOWHveaVsFxyXG4gICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAvLyDlvZPliY3or7fmsYLmlbDmja5cclxuICAgICAgICB0aGlzLl9wb3N0RGF0YSA9IHt9O1xyXG4gICAgICAgIC8vIOaWree6v+mHjei/nueql+WPo1xyXG4gICAgICAgIHRoaXMubmV0V29ya1dpbiA9IG51bGw7XHJcbiAgICAgICAgLy8g55So5LqO5rWL6K+V55qEdG9rZW7mlbDmja5cclxuICAgICAgICB0aGlzLnRva2VuID0gJyc7XHJcbiAgICAgICAgLy9cclxuICAgICAgICB0aGlzLl9kYXRhQmFzZSA9IG51bGw7XHJcbiAgICB9LFxyXG4gICAgLy8g5bGe5oCnXHJcbiAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgbG9jYWxUZXN0OiBmYWxzZSxcclxuICAgICAgICBkYXRhQmFzZToge1xyXG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGlmICghIHRoaXMuX2RhdGFCYXNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8g5bi455So55qE5Y+Y6YePL+aVsOaNrlxyXG4gICAgICAgICAgICAgICAgICAgIHZhciBlbnQgPSBGaXJlLkVudGl0eS5maW5kKCcvRGF0YUJhc2UnKTtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9kYXRhQmFzZSA9IGVudC5nZXRDb21wb25lbnQoJ0RhdGFCYXNlJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fZGF0YUJhc2U7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHZpc2libGU6IGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIOiOt+WPlueUqOaIt+S/oeaBr1xyXG4gICAgZ2V0VG9LZW5WYWx1ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmxvY2FsVGVzdCkge1xyXG4gICAgICAgICAgICAvL3RoaXMudG9rZW4gPSAnTVRBd01qRXhPRE16TUY5bU1UaGpabU00T0RJNE56UmhaVEJsTVRBNU1UWmpaVEprT0RrMFpqZ3pabDh4TkRNMk1UWTNPRE15WDNkaGNBPT0nO1xyXG4gICAgICAgICAgICB0aGlzLnRva2VuID0gJ01UQXdNVFE1TWpZNE5WOHhZV0V6WXpGa05tRTBaV0kzWXpsa05tUXhZbUptTkRjNE5UTm1aamhrTTE4eE5ETTJNekkyTXpjMlgzZGhjQSc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgIHRoaXMudG9rZW4gPSB0aGlzLmdldFF1ZXJ5U3RyaW5nKCd0b2tlbicpO1xyXG4gICAgICAgICAgICBpZiAoISB0aGlzLnRva2VuKXtcclxuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coXCLmsqHmnInnlKjmiLfkv6Hmga8sIFRvS2VuIGlzIG51bGxcIik7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9LFxyXG4gICAgLy8g55SoSlPojrflj5blnLDlnYDmoI/lj4LmlbDnmoTmlrnms5VcclxuICAgIGdldFF1ZXJ5U3RyaW5nOiBmdW5jdGlvbihuYW1lKSB7XHJcbiAgICAgICAgdmFyIHJlZyA9IG5ldyBSZWdFeHAoXCIoXnwmKVwiICsgbmFtZSArIFwiPShbXiZdKikoJnwkKVwiKTtcclxuICAgICAgICB2YXIgciA9IHdpbmRvdy5sb2NhdGlvbi5zZWFyY2guc3Vic3RyKDEpLm1hdGNoKHJlZyk7XHJcbiAgICAgICAgaWYgKHIgIT09IG51bGwpe1xyXG4gICAgICAgICAgICByZXR1cm4gdW5lc2NhcGUoclsyXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfSxcclxuICAgIC8vIOivt+axguWksei0pVxyXG4gICAgX2Vycm9yQ2FsbEJhY2s6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgdGhpcy5uZXRXb3JrV2luLm9wZW5XaW5kb3coZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICBzZWxmLnNlbmREYXRhKHNlbGYuX3Bvc3REYXRhKTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICAvLyDlj5HpgIHmlbDmja5cclxuICAgIHNlbmREYXRhOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgIGlmICghIEZpcmUuRW5naW5lLmlzUGxheWluZykge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghIHRoaXMuZ2V0VG9LZW5WYWx1ZSgpKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy90aGlzLmRhdGFCYXNlLmxvYWRUaXBzLm9wZW5UaXBzKCfor7fmsYLkuK3vvIzor7fnqI3lkI4uLi4nKTtcclxuICAgICAgICB0aGlzLl9wb3N0RGF0YSA9IGRhdGE7XHJcbiAgICAgICAgdGhpcy5qUXVlcnlBamF4KGRhdGEudXJsLCBkYXRhLnNlbmREYXRhLCBkYXRhLmNiLCBkYXRhLmVyckNiKTtcclxuICAgIH0sXHJcbiAgICAvLyDlj5HpgIHmtojmga9cclxuICAgIGpRdWVyeUFqYXg6IGZ1bmN0aW9uIChzdHJVcmwsIGRhdGEsIGNhbGxCYWNrLCBlcnJvckNhbGxCYWNrKSB7XHJcbiAgICAgICAgdmFyIHBhcmFtcyA9IFwiXCI7XHJcbiAgICAgICAgaWYgKHR5cGVvZihkYXRhKSAhPT0gXCJvYmplY3RcIikgeyBwYXJhbXMgPSBkYXRhICsgXCImdG9rZW49XCIgKyB0aGlzLnRva2VuOyB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGtleSBpbiBkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICBwYXJhbXMgKz0gKGtleSArIFwiPVwiICsgZGF0YVtrZXldICsgXCImXCIgICk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcGFyYW1zICs9IFwiJnRva2VuPVwiICsgdGhpcy50b2tlbjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIHZhciBzZW5kID0ge1xyXG4gICAgICAgICAgICB0eXBlOiBcIlBPU1RcIixcclxuICAgICAgICAgICAgdXJsOiBzdHJVcmwgKyBcIj8manNvbmNhbGxQUD0/XCIsXHJcbiAgICAgICAgICAgIGRhdGE6IHBhcmFtcyxcclxuICAgICAgICAgICAgZGF0YVR5cGU6ICdqc29ucCcsXHJcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCEgRmlyZS5FbmdpbmUuaXNQbGF5aW5nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKGNhbGxCYWNrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FsbEJhY2soZGF0YSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvL3NlbGYuZGF0YUJhc2UubG9hZFRpcHMuY2xvc2VUaXBzKCk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbiAoWE1MSHR0cFJlcXVlc3QsIHRleHRTdGF0dXMsIGVycm9yVGhyb3duKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoISBGaXJlLkVuZ2luZS5pc1BsYXlpbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3JDYWxsQmFjaykge1xyXG4gICAgICAgICAgICAgICAgICAgIGVycm9yQ2FsbEJhY2soKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vc2VsZi5kYXRhQmFzZS5sb2FkVGlwcy5jbG9zZVRpcHMoKTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yVGhyb3duKTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFhNTEh0dHBSZXF1ZXN0KTtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHRleHRTdGF0dXMpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgICAgICBqUXVlcnkuYWpheChzZW5kKTtcclxuICAgIH0sXHJcbiAgICAvLyDkv53lrZjoo4Xmia5cclxuICAgIFJlcXVlc3RTYXZlUm9vbTogZnVuY3Rpb24gKHNlbmREYXRhLCBjYWxsYmFjaykge1xyXG4gICAgICAgIHZhciBwb3N0RGF0YSA9IHtcclxuICAgICAgICAgICAgdXJsOiBcImh0dHA6Ly9tLnNhaWtlLmNvbS9zdWl0ZHJlc3Mvc2F2ZS5odG1sXCIsXHJcbiAgICAgICAgICAgIHNlbmREYXRhOiB7XHJcbiAgICAgICAgICAgICAgICBtYXJrOiB0aGlzLmRhdGFCYXNlLm1hcmssXHJcbiAgICAgICAgICAgICAgICBzdWl0X2lkOiBzZW5kRGF0YS5zdWl0X2lkLFxyXG4gICAgICAgICAgICAgICAgc3VpdF9mcm9tOiBzZW5kRGF0YS5zdWl0X2Zyb20sXHJcbiAgICAgICAgICAgICAgICBkYXRhTGlzdDogSlNPTi5zdHJpbmdpZnkoc2VuZERhdGEuZGF0YUxpc3QpXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGNiOiBjYWxsYmFjayxcclxuICAgICAgICAgICAgZXJyQ2I6IHRoaXMuX2Vycm9yQ2FsbEJhY2suYmluZCh0aGlzKVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5zZW5kRGF0YShwb3N0RGF0YSk7XHJcbiAgICB9LFxyXG4gICAgLy8g6K+i6Zeu5piv5ZCm5Y+v5Lul6KOF5omuXHJcbiAgICBSZXF1ZXN0Q2FuRHJlc3NSb29tOiBmdW5jdGlvbiAoc2VuZERhdGEsIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgdmFyIHBvc3REYXRhID0ge1xyXG4gICAgICAgICAgICB1cmw6IFwiaHR0cDovL20uc2Fpa2UuY29tL3N1aXRkcmVzcy9iZWdpblN1aXQuaHRtbFwiLFxyXG4gICAgICAgICAgICBzZW5kRGF0YTogc2VuZERhdGEsXHJcbiAgICAgICAgICAgIGNiOiBjYWxsYmFjayxcclxuICAgICAgICAgICAgZXJyQ2I6IHRoaXMuX2Vycm9yQ2FsbEJhY2suYmluZCh0aGlzKVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5zZW5kRGF0YShwb3N0RGF0YSk7XHJcbiAgICB9LFxyXG4gICAgLy8g6K+35rGC5oi/6Ze05pWw5o2uXHJcbiAgICBSZXF1ZXN0SW50b0hvbWVEYXRhOiBmdW5jdGlvbiAoc2VuZERhdGEsIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgdmFyIHBvc3REYXRhID0ge1xyXG4gICAgICAgICAgICB1cmw6IFwiaHR0cDovL20uc2Fpa2UuY29tL3N1aXRkcmVzcy9pbnRvUm9vbS5odG1sXCIsXHJcbiAgICAgICAgICAgIHNlbmREYXRhOiB7XHJcbiAgICAgICAgICAgICAgICBob3VzZV91aWQ6IHNlbmREYXRhLmhvdXNlX3VpZCxcclxuICAgICAgICAgICAgICAgIG1hcms6IHNlbmREYXRhLm1hcmssXHJcbiAgICAgICAgICAgICAgICBjbGVhcjogc2VuZERhdGEuY2xlYXIgfHwgMFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBjYjogY2FsbGJhY2ssXHJcbiAgICAgICAgICAgIGVyckNiOiB0aGlzLl9lcnJvckNhbGxCYWNrLmJpbmQodGhpcylcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMuc2VuZERhdGEocG9zdERhdGEpO1xyXG4gICAgfSxcclxuICAgIC8vIOiOt+WPluW5s+mdouWbvlxyXG4gICAgUmVxdWVzdFBsYW46IGZ1bmN0aW9uIChzZW5kRGF0YSwgY2FsbGJhY2spIHtcclxuICAgICAgICB2YXIgcG9zdERhdGEgPSB7XHJcbiAgICAgICAgICAgIHVybDogXCJodHRwOi8vbS5zYWlrZS5jb20vc3VpdGRyZXNzL3Nob3dDb3Zlci5odG1sXCIsXHJcbiAgICAgICAgICAgIHNlbmREYXRhOiB7XHJcbiAgICAgICAgICAgICAgICBob3VzZV91aWQ6IHNlbmREYXRhLmhvdXNlX3VpZCxcclxuICAgICAgICAgICAgICAgIGZsb29yX2lkOiBzZW5kRGF0YS5mbG9vcl9pZCxcclxuICAgICAgICAgICAgICAgIG1hcms6IHNlbmREYXRhLm1hcmtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgY2I6IGNhbGxiYWNrLFxyXG4gICAgICAgICAgICBlcnJDYjogdGhpcy5fZXJyb3JDYWxsQmFjay5iaW5kKHRoaXMpXHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLnNlbmREYXRhKHBvc3REYXRhKTtcclxuICAgIH0sXHJcbiAgICAvLyDmpbzlsYLliJfooahcclxuICAgIFJlcXVlc3RGbG9vckxpc3Q6IGZ1bmN0aW9uIChjYWxsYmFjaykge1xyXG4gICAgICAgIHZhciBwb3N0RGF0YSA9IHtcclxuICAgICAgICAgICAgdXJsOiBcImh0dHA6Ly9tLnNhaWtlLmNvbS9zdWl0ZHJlc3MvZmxvb3JMaXN0Lmh0bWxcIixcclxuICAgICAgICAgICAgc2VuZERhdGE6IHt9LFxyXG4gICAgICAgICAgICBjYjogY2FsbGJhY2ssXHJcbiAgICAgICAgICAgIGVyckNiOiB0aGlzLl9lcnJvckNhbGxCYWNrLmJpbmQodGhpcylcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMuc2VuZERhdGEocG9zdERhdGEpO1xyXG4gICAgfSxcclxuICAgIC8vIOino+mZpOWFs+ezu1xyXG4gICAgUmVxdWVzdERpc2Fzc29jaWF0ZUxpc3Q6IGZ1bmN0aW9uIChzZW5kRGF0YSwgY2FsbGJhY2spIHtcclxuICAgICAgICB2YXIgcG9zdERhdGEgPSB7XHJcbiAgICAgICAgICAgIHVybDogXCJodHRwOi8vbS5zYWlrZS5jb20vc3VpdGRyZXNzL3JlbGVhc2VSZWxhdGlvbi5odG1sXCIsXHJcbiAgICAgICAgICAgIHNlbmREYXRhOiBzZW5kRGF0YSxcclxuICAgICAgICAgICAgY2I6IGNhbGxiYWNrLFxyXG4gICAgICAgICAgICBlcnJDYjogdGhpcy5fZXJyb3JDYWxsQmFjay5iaW5kKHRoaXMpXHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLnNlbmREYXRhKHBvc3REYXRhKTtcclxuICAgIH0sXHJcbiAgICAvLyDor7fmsYLljZXlk4Hlrrblhbfoj5zljZXliJfooahcclxuICAgIFJlcXVlc3RTaW5nbGVJdGVtc01lbnU6IGZ1bmN0aW9uIChjYWxsYmFjaykge1xyXG4gICAgICAgIHZhciBwb3N0RGF0YSA9IHtcclxuICAgICAgICAgICAgdXJsOiAnaHR0cDovL20uc2Fpa2UuY29tL2hvdXNlZHJlc3MvZ2V0U2hvcFR5cGUuaHRtbCcsXHJcbiAgICAgICAgICAgIHNlbmREYXRhOiB7fSxcclxuICAgICAgICAgICAgY2I6IGNhbGxiYWNrLFxyXG4gICAgICAgICAgICBlcnJDYjogdGhpcy5fZXJyb3JDYWxsQmFjay5iaW5kKHRoaXMpXHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLnNlbmREYXRhKHBvc3REYXRhKTtcclxuICAgIH0sXHJcbiAgICAvLyDor7fmsYLljZXlk4HlrrblhbfliJfooahcclxuICAgIFJlcXVlc3RTaW5nbGVJdGVtczogZnVuY3Rpb24gKGRhdGEsIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgdmFyIHBvc3REYXRhID0ge1xyXG4gICAgICAgICAgICB1cmw6IFwiaHR0cDovL20uc2Fpa2UuY29tL2hvdXNlZHJlc3MvZ2V0U2hvcExpc3QuaHRtbFwiLFxyXG4gICAgICAgICAgICBzZW5kRGF0YToge1xyXG4gICAgICAgICAgICAgICAgdGlkOiBkYXRhLnRpZCxcclxuICAgICAgICAgICAgICAgIHBhZ2U6IGRhdGEucGFnZSxcclxuICAgICAgICAgICAgICAgIGVhY2g6IGRhdGEuZWFjaFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBjYjogY2FsbGJhY2ssXHJcbiAgICAgICAgICAgIGVyckNiOiB0aGlzLl9lcnJvckNhbGxCYWNrLmJpbmQodGhpcylcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMuc2VuZERhdGEocG9zdERhdGEpO1xyXG4gICAgfSxcclxuICAgIC8v6K+35rGC5aWX6KOF5YiX6KGo5pWw5o2uXHJcbiAgICBSZXF1ZXN0U2V0SXRlbXNNZW51OiBmdW5jdGlvbiAoZGF0YSwgIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgdmFyIHBvc3REYXRhID0ge1xyXG4gICAgICAgICAgICB1cmw6IFwiaHR0cDovL20uc2Fpa2UuY29tL2hvdXNlZHJlc3Mvc2hvcFN1aXQuaHRtbFwiLFxyXG4gICAgICAgICAgICBzZW5kRGF0YToge1xyXG4gICAgICAgICAgICAgICAgcGFnZTogZGF0YS5wYWdlLFxyXG4gICAgICAgICAgICAgICAgZWFjaDogZGF0YS5lYWNoXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGNiOiBjYWxsYmFjayxcclxuICAgICAgICAgICAgZXJyQ2I6IHRoaXMuX2Vycm9yQ2FsbEJhY2suYmluZCh0aGlzKVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5zZW5kRGF0YShwb3N0RGF0YSk7XHJcbiAgICB9LFxyXG4gICAgLy/or7fmsYLlpZfoo4XmlbDmja5cclxuICAgIFJlcXVlc3RTZXRJdGVtc0RhdGE6IGZ1bmN0aW9uIChpZCwgIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgdmFyIHBvc3REYXRhID0ge1xyXG4gICAgICAgICAgICB1cmw6IFwiaHR0cDovL20uc2Fpa2UuY29tL2hvdXNlZHJlc3Mvc2hvcHN1aXRkZXRhaWwuaHRtbFwiLFxyXG4gICAgICAgICAgICBzZW5kRGF0YToge1xyXG4gICAgICAgICAgICAgICAgcHJvZF9zdWl0aWQ6IGlkXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGNiOiBjYWxsYmFjayxcclxuICAgICAgICAgICAgZXJyQ2I6IHRoaXMuX2Vycm9yQ2FsbEJhY2suYmluZCh0aGlzKVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5zZW5kRGF0YShwb3N0RGF0YSk7XHJcbiAgICB9LFxyXG4gICAgLy8g54mp5ZOB5p+cKOWNleWTgSlcclxuICAgIFJlcXVlc3RCYWNrcGFja1NpbmdsZTogZnVuY3Rpb24gKHNlbmREYXRhLCBjYWxsYmFjaykge1xyXG4gICAgICAgIHZhciBwb3N0RGF0YSA9IHtcclxuICAgICAgICAgICAgdXJsOiBcImh0dHA6Ly9tLnNhaWtlLmNvbS9zdWl0ZHJlc3MvYmFja3BhY2tTaW5nbGUuaHRtbFwiLFxyXG4gICAgICAgICAgICBzZW5kRGF0YTogc2VuZERhdGEsXHJcbiAgICAgICAgICAgIGNiOiBjYWxsYmFjayxcclxuICAgICAgICAgICAgZXJyQ2I6IHRoaXMuX2Vycm9yQ2FsbEJhY2suYmluZCh0aGlzKVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5zZW5kRGF0YShwb3N0RGF0YSk7XHJcbiAgICB9LFxyXG4gICAgLy8g54mp5ZOB5p+cKOWll+ijhSlcclxuICAgIFJlcXVlc3RCYWNrcGFja1N1aXQ6IGZ1bmN0aW9uIChzZW5kRGF0YSwgY2FsbGJhY2spIHtcclxuICAgICAgICB2YXIgcG9zdERhdGEgPSB7XHJcbiAgICAgICAgICAgIHVybDogXCJodHRwOi8vbS5zYWlrZS5jb20vc3VpdGRyZXNzL215U3VpdC5odG1sXCIsXHJcbiAgICAgICAgICAgIHNlbmREYXRhOiBzZW5kRGF0YSxcclxuICAgICAgICAgICAgY2I6IGNhbGxiYWNrLFxyXG4gICAgICAgICAgICBlcnJDYjogdGhpcy5fZXJyb3JDYWxsQmFjay5iaW5kKHRoaXMpXHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLnNlbmREYXRhKHBvc3REYXRhKTtcclxuICAgIH0sXHJcbiAgICAvLyDlvIDlp4vml7ZcclxuICAgIHN0YXJ0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgLy8g5bi455So55qE5Y+Y6YePL+aVsOaNrlxyXG4gICAgICAgIHZhciBlbnQgPSBGaXJlLkVudGl0eS5maW5kKCcvRGF0YUJhc2UnKTtcclxuICAgICAgICB2YXIgZGF0YUJhc2UgPSBlbnQuZ2V0Q29tcG9uZW50KCdEYXRhQmFzZScpO1xyXG4gICAgICAgIHRoaXMubmV0V29ya1dpbiA9IGRhdGFCYXNlLm5ldFdvcmtXaW47XHJcbiAgICB9XHJcbn0pO1xyXG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJzY3MThmUTRkaGRGWUtvTmtiUjJFK1JXJywgJ05ld1dvcmtXaW5kb3cnKTtcbi8vIHNjcmlwdFxcdmlsbGFcXE5ld1dvcmtXaW5kb3cuanNcblxudmFyIENvbXAgPSBGaXJlLkNsYXNzKHtcbiAgICAvLyDnu6fmib9cbiAgICBleHRlbmRzOiBGaXJlLkNvbXBvbmVudCxcbiAgICAvLyDmnoTpgKDlh73mlbBcbiAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmNhbGxiYWNrRXZlbnQgPSBudWxsO1xuICAgIH0sXG4gICAgLy8g5bGe5oCnXG4gICAgcHJvcGVydGllczoge1xuICAgICAgICBidG5fUmVjb25uZWN0OiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5VSUJ1dHRvblxuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyDlvIDlkK/nqpflj6NcbiAgICBvcGVuV2luZG93OiBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy5lbnRpdHkuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICB0aGlzLmNhbGxiYWNrRXZlbnQgPSBjYWxsYmFjaztcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy8g5YWz6Zet56qX5Y+jXG4gICAgY2xvc2VXaW5kb3c6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5lbnRpdHkuYWN0aXZlID0gZmFsc2U7XG4gICAgfSxcbiAgICAvLyDph43mlrDov57mjqXkuovku7ZcbiAgICBfb25SZWNvbm5lY3Rpb25FdmVudDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuY2xvc2VXaW5kb3coKTtcbiAgICAgICAgaWYgKHRoaXMuY2FsbGJhY2tFdmVudCkge1xuICAgICAgICAgICAgdGhpcy5jYWxsYmFja0V2ZW50KCk7XG4gICAgICAgICAgICB0aGlzLmNhbGxiYWNrRXZlbnQgPSBudWxsO1xuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyDlvIDlp4tcbiAgICBzdGFydDogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyDnu5Hlrprph43mlrDov57mjqXmjInpkq5cbiAgICAgICAgdGhpcy5idG5fUmVjb25uZWN0Lm9uQ2xpY2sgPSB0aGlzLl9vblJlY29ubmVjdGlvbkV2ZW50LmJpbmQodGhpcyk7XG4gICAgfVxufSk7XG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJzUxMzAxQUY2Y2xFeVpMN0hMQUgyM2lMJywgJ09EYXRhQmFzZScpO1xuLy8gc2NyaXB0XFxvdXRkb29yXFxPRGF0YUJhc2UuanNcblxuLy8gIOWtmOaUvumhueebrumcgOimgeeahOWPmOmHjy/mlbDmja4v5a+56LGhXG52YXIgT0RhdGFCYXNlID0gRmlyZS5DbGFzcyh7XG4gICAgLy8g57un5om/XG4gICAgZXh0ZW5kczogRmlyZS5Db21wb25lbnQsXG4gICAgLy8g5p6E6YCg5Ye95pWwXG4gICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8g5L+d5a2Y5omA5pyJ5Zu+54mHXG4gICAgICAgIHRoaXMubG9hZEltYWdlTGlzdCA9IHt9O1xuICAgICAgICAvL1xuICAgICAgICB0aGlzLnVpZCA9IDA7XG4gICAgICAgIC8vXG4gICAgICAgIHRoaXMubWFyaztcbiAgICB9LFxuXG4gICAgcHJvcGVydGllczoge1xuICAgICAgICB0ZW1wR2xvYmFsRGF0YToge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuRW50aXR5XG4gICAgICAgIH0sXG4gICAgICAgIHRlbXBGYW1pbHk6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLkVudGl0eVxuICAgICAgICB9LFxuICAgICAgICBtYXNrOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5FbnRpdHlcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvLyDovb3lhaXml7ZcbiAgICBvbkxvYWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8g6L295YWl5o6n5Lu2XG4gICAgICAgIHRoaXMubG9hZENvbnRyb2xzKCk7XG4gICAgICAgIHRoaXMubWFzay5hY3RpdmUgPSB0cnVlO1xuICAgIH0sXG4gICAgLy8g6L295YWl5o6n5Lu2XG4gICAgbG9hZENvbnRyb2xzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIOiDjOaZr1xuICAgICAgICB2YXIgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL0JhY2tHcm91bmQnKTtcbiAgICAgICAgdGhpcy5iZ1JlbmRlciA9IGVudC5nZXRDb21wb25lbnQoRmlyZS5TcHJpdGVSZW5kZXJlcik7XG4gICAgICAgIC8vIOWcsOadv1xuICAgICAgICBlbnQgPSBGaXJlLkVudGl0eS5maW5kKCcvQmFja0dyb3VuZC9Ib3VzZScpO1xuICAgICAgICB0aGlzLmhvdXNlID0gZW50LmdldENvbXBvbmVudChGaXJlLlVJQnV0dG9uKTtcbiAgICAgICAgLy9cbiAgICAgICAgdGhpcy50aXBUb0tlbkVycm9yID0gRmlyZS5FbnRpdHkuZmluZCgnL1RpcF9Ub0tlbkVycm9yJyk7XG4gICAgICAgIC8vIOe9kee7nOi/nuaOpVxuICAgICAgICB0aGlzLnNlcnZlck5ldFdvcmsgPSB0aGlzLmVudGl0eS5nZXRDb21wb25lbnQoJ1NlcnZlck5ldFdvcmsnKTtcbiAgICAgICAgLy8g5Li76I+c5Y2VXG4gICAgICAgIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9NYWluTWVudScpO1xuICAgICAgICB0aGlzLm1haW5NZW51ID0gZW50LmdldENvbXBvbmVudCgnTWFpbk1lbnUnKTtcbiAgICAgICAgLy8g5a2Q6I+c5Y2VXG4gICAgICAgIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9TdWJNZW51Jyk7XG4gICAgICAgIHRoaXMuc3ViTWVudSA9IGVudC5nZXRDb21wb25lbnQoJ1N1Yk1lbnUnKTtcbiAgICAgICAgLy8g6YeN5paw6K+35rGC5pyN5Yqh5Zmo56qX5Y+jXG4gICAgICAgIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9UaXBfTmV0V29yaycpO1xuICAgICAgICB0aGlzLm5ldFdvcmtXaW4gPSBlbnQuZ2V0Q29tcG9uZW50KCdOZXdXb3JrV2luZG93Jyk7XG4gICAgICAgIC8vIOWKoOi9veaPkOekulxuICAgICAgICBlbnQgPSBGaXJlLkVudGl0eS5maW5kKCcvVGlwX0xvYWQnKTtcbiAgICAgICAgdGhpcy5sb2FkVGlwID0gZW50LmdldENvbXBvbmVudCgnVGlwTG9hZCcpO1xuICAgICAgICAvLyDmuKnppqjmj5DnpLrnqpflj6NcbiAgICAgICAgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL1RpcF9Db21tb24nKTtcbiAgICAgICAgdGhpcy50aXBDb21tb24gPSBlbnQuZ2V0Q29tcG9uZW50KCdUaXBzV2luZG93Jyk7XG5cbiAgICAgICAgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL0dsb2JhbERhdGEnKTtcbiAgICAgICAgaWYgKCFlbnQpIHtcbiAgICAgICAgICAgIGVudCA9IEZpcmUuaW5zdGFudGlhdGUodGhpcy50ZW1wR2xvYmFsRGF0YSk7XG4gICAgICAgICAgICBlbnQubmFtZSA9ICdHbG9iYWxEYXRhJztcbiAgICAgICAgICAgIGVudC5kb250RGVzdHJveU9uTG9hZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5nbG9iYWxEYXRhID0gZW50LmdldENvbXBvbmVudChcIkdsb2JhbERhdGFcIik7XG4gICAgICAgIC8vXG4gICAgICAgIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9DaGFyYWN0ZXJzJyk7XG4gICAgICAgIHRoaXMuY2hhcmFjdGVycyA9IGVudC5nZXRDb21wb25lbnQoJ0NoYXJhY3RlcnMnKTtcbiAgICAgICAgLy9cbiAgICAgICAgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL1dpbl9NeUFkZEZhbWlseScpO1xuICAgICAgICB0aGlzLm15QWRkRmFtaWx5V2luID0gZW50LmdldENvbXBvbmVudCgnTXlBZGRGYW1pbHlXaW5kb3cnKTtcbiAgICAgICAgLy9cbiAgICAgICAgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL1dpbl9QbGFuJyk7XG4gICAgICAgIHRoaXMucGxhbldpbiA9IGVudC5nZXRDb21wb25lbnQoJ1BsYW5XaW5kb3cnKTtcbiAgICAgICAgLy9cbiAgICAgICAgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL1RpcF9Ob0FkZEZhbWlseScpO1xuICAgICAgICB0aGlzLnRpcE5vQWRkRmFtaWx5ID0gZW50LmdldENvbXBvbmVudCgnVGlwc1dpbmRvdycpO1xuICAgIH0sXG4gICAgLy8g5LiL6L295Zu+54mHXG4gICAgbG9hZEltYWdlOiBmdW5jdGlvbiAodXJsLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIGlmIChzZWxmLmxvYWRJbWFnZUxpc3RbdXJsXSkge1xuICAgICAgICAgICAgdmFyIGltYWdlID0gc2VsZi5sb2FkSW1hZ2VMaXN0W3VybF07XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsLCBpbWFnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgRmlyZS5JbWFnZUxvYWRlcih1cmwsIGZ1bmN0aW9uIChlcnJvciwgaW1hZ2UpIHtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycm9yLCBpbWFnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaW1hZ2UpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmxvYWRJbWFnZUxpc3RbdXJsXSA9IGltYWdlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9LFxuICAgIC8vIOWIneWni+WMluWcuuaZr1xuICAgIGluaXRTY3JlZW46IGZ1bmN0aW9uIChzZW5kRGF0YSwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBzZWxmLnNlcnZlck5ldFdvcmsuSW5pdE91dGRvb3Ioc2VuZERhdGEsIGZ1bmN0aW9uIChzZXJ2ZXJEYXRhKSB7XG4gICAgICAgICAgICBpZiAoc2VydmVyRGF0YS5zdGF0dXMgIT09IDEwMDAwKSB7XG4gICAgICAgICAgICAgICAgc2VsZi50aXBDb21tb24ub3BlblRpcHNXaW5kb3coc2VydmVyRGF0YS5kZXNjKTtcbiAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBpbmRleCA9IDA7XG4gICAgICAgICAgICBzZWxmLmxvYWRJbWFnZShzZXJ2ZXJEYXRhLmxpc3QuYmdVcmwsIGZ1bmN0aW9uIChlcnJvciwgaW1hZ2UpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciBzcHJpdGUgPSBuZXcgRmlyZS5TcHJpdGUoaW1hZ2UpO1xuICAgICAgICAgICAgICAgIHNlbGYuYmdSZW5kZXIuc3ByaXRlID0gc3ByaXRlO1xuICAgICAgICAgICAgICAgIGluZGV4Kys7XG4gICAgICAgICAgICAgICAgaWYgKGluZGV4ID09IDIgJiYgY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soc2VydmVyRGF0YSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBzZWxmLmxvYWRJbWFnZShzZXJ2ZXJEYXRhLmxpc3QuaG91c2VzVXJsLCBmdW5jdGlvbiAoZXJyb3IsIGltYWdlKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzZWxmLmhvdXNlLnNldEltYWdlKGltYWdlKTtcbiAgICAgICAgICAgICAgICBpbmRleCsrO1xuICAgICAgICAgICAgICAgIGlmIChpbmRleCA9PSAyICYmIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKHNlcnZlckRhdGEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG59KTtcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnY2ZlOGJVN2xITkdYWWdyd2JGN1o3RkEnLCAnT3B0aW9ucycpO1xuLy8gc2NyaXB0XFxjb21tb25cXE9wdGlvbnMuanNcblxudmFyIE9wdGlvbnMgPSBGaXJlLkNsYXNzKHtcclxuICAgIC8vIO+/vcyz77+9XHJcbiAgICBleHRlbmRzOiBGaXJlLkNvbXBvbmVudCxcclxuICAgIC8vIO+/ve+/ve+/vey6r++/ve+/vVxyXG4gICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLmFuaW0gPSBudWxsO1xyXG4gICAgICAgIHRoaXMuYmluZEhpZGVPcHRpb25zRXZlbnQgPSB0aGlzLl9oaWRlT3B0aW9uc0V2ZW50LmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5vbkhpZGVFdmVudCA9IG51bGw7XHJcbiAgICB9LFxyXG4gICAgLy8g77+977+977+977+9XHJcbiAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgLy8g77+977+977+977+90aHvv73vv71cclxuICAgICAgICBidG5faGlkZToge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlVJQnV0dG9uXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDJvu+/ve+/ve+/ve+/ve+/ve+/vVxyXG4gICAgICAgIGJ0bl9kZWw6IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5VSUJ1dHRvblxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g77+977+977+977+977+977+916pcclxuICAgICAgICBidG5fTWlycm9yRmxpcDoge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlVJQnV0dG9uXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIO+/vce377+977+977+977+977+977+977+9XHJcbiAgICBoYXNPcGVuOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZW50aXR5LmFjdGl2ZTtcclxuICAgIH0sXHJcbiAgICAvLyDvv73Ht++/ve+/vdC077+977+977+90aHvv73vv71cclxuICAgIGhhc1RvdWNoOiBmdW5jdGlvbiAodGFyZ2V0KSB7XHJcbiAgICAgICAgcmV0dXJuIHRhcmdldCA9PT0gdGhpcy5idG5faGlkZS5lbnRpdHkgfHxcclxuICAgICAgICAgICAgICAgdGFyZ2V0ID09PSB0aGlzLmJ0bl9kZWwuZW50aXR5ICB8fFxyXG4gICAgICAgICAgICAgICB0YXJnZXQgPT09IHRoaXMuYnRuX01pcnJvckZsaXAuZW50aXR5O1xyXG4gICAgfSxcclxuICAgIC8vIO+/ve+/ve+/ve+/ve+/ve+/ve+/ve+/vVxyXG4gICAgc2V0UG9zOiBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgICAgICB0aGlzLmVudGl0eS50cmFuc2Zvcm0ucG9zaXRpb24gPSB2YWx1ZTtcclxuICAgIH0sXHJcbiAgICAvLyDvv73vv73vv73vv73Roe+/ve+/vVxyXG4gICAgb3BlbjogZnVuY3Rpb24gKHRhcmdldCkge1xyXG4gICAgICAgIC8vIO+/ve+/ve+/ve+/ve+/ve+/ve+/ve+/vVxyXG4gICAgICAgIGlmICh0YXJnZXQpIHtcclxuICAgICAgICAgICAgdGhpcy5lbnRpdHkucGFyZW50ID0gbnVsbDtcclxuICAgICAgICAgICAgdGhpcy5zZXRQb3ModGFyZ2V0LnRyYW5zZm9ybS53b3JsZFBvc2l0aW9uKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5lbnRpdHkuYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICBpZiAoISB0aGlzLmFuaW0pIHtcclxuICAgICAgICAgICAgdGhpcy5hbmltID0gdGhpcy5lbnRpdHkuZ2V0Q29tcG9uZW50KEZpcmUuQW5pbWF0aW9uKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5hbmltLnBsYXkoJ29wdGlvbnMnKTtcclxuICAgIH0sXHJcbiAgICAvLyDvv73vv73vv73vv73Roe+/ve+/vVxyXG4gICAgaGlkZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuZW50aXR5LmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuZW50aXR5LnRyYW5zZm9ybS5zY2FsZSA9IG5ldyBGaXJlLlZlYzIoMCwgMCk7XHJcbiAgICAgICAgaWYgKHRoaXMub25IaWRlRXZlbnQpIHtcclxuICAgICAgICAgICAgdGhpcy5vbkhpZGVFdmVudCgpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvLyDvv73vv73vv73vv73Roe+/ve+/vVxyXG4gICAgX2hpZGVPcHRpb25zRXZlbnQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuaGlkZSgpO1xyXG4gICAgfSxcclxuICAgIC8vIO+/ve+/vcq8XHJcbiAgICBzdGFydDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuYnRuX2hpZGUub25Nb3VzZWRvd24gPSB0aGlzLmJpbmRIaWRlT3B0aW9uc0V2ZW50O1xyXG4gICAgfVxyXG59KTtcclxuXG5GaXJlLl9SRnBvcCgpOyIsIkZpcmUuX1JGcHVzaChtb2R1bGUsICc5NTdlNnNBL0NaT3NZUUVZVkZpU242dScsICdPdGhlck1lbnVNZ3InKTtcbi8vIHNjcmlwdFxcdmlsbGFcXE90aGVyTWVudU1nci5qc1xuXG4vLyDlhbbku5boj5zljZXnrqHnkIbnsbtcbnZhciBPdGhlck1lbnVNZ3IgPSBGaXJlLkNsYXNzKHtcbiAgICAvLyDnu6fmib9cbiAgICBleHRlbmRzOiBGaXJlLkNvbXBvbmVudCxcbiAgICAvLyDmnoTpgKDlh73mlbBcbiAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmNoaWxkcmVuID0gW107XG4gICAgfSxcbiAgICAvLyDlsZ7mgKdcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIG1hcmdpbjogbmV3IEZpcmUuVmVjMigpXG4gICAgfSxcbiAgICAvLyDliIfmjaLmpbzlsYJcbiAgICBfb25DaGFuZ2VGbG9vckV2ZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuZGF0YUJhc2UuZmxvb3JXaW4ub3BlbldpbmRvdygpO1xuICAgICAgICB0aGlzLmRhdGFCYXNlLmNoYXJhY3RlcnMuZW50aXR5LmFjdGl2ZSA9IGZhbHNlO1xuICAgIH0sXG4gICAgLy8g6I635Y+W6I+c5Y2V5oyJ6ZKu5bm25LiU57uR5a6a5LqL5Lu2XG4gICAgX2luaXRNZW51OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIGNoaWxkcmVuID0gdGhpcy5lbnRpdHkuZ2V0Q2hpbGRyZW4oKTtcbiAgICAgICAgc2VsZi5jaGlsZHJlbiA9IFtdO1xuICAgICAgICBjaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uIChlbnQpIHtcbiAgICAgICAgICAgIC8vIOe7keWumuaMiemSruS6i+S7tlxuICAgICAgICAgICAgdmFyIGJ0biA9IGVudC5nZXRDb21wb25lbnQoJ1VJQnV0dG9uJyk7XG4gICAgICAgICAgICBpZiAoZW50Lm5hbWUgPT09IFwiMVwiKSB7XG4gICAgICAgICAgICAgICAgYnRuLm9uQ2xpY2sgPSBzZWxmLl9vbkNoYW5nZUZsb29yRXZlbnQuYmluZChzZWxmKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNlbGYuY2hpbGRyZW4ucHVzaChidG4pO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIC8vIOi9veWFpVxuICAgIG9uTG9hZDogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyDluLjnlKjnmoTlj5jph48v5pWw5o2uXG4gICAgICAgIHZhciBnYW1lRGF0YUVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9EYXRhQmFzZScpO1xuICAgICAgICB0aGlzLmRhdGFCYXNlID0gZ2FtZURhdGFFbnQuZ2V0Q29tcG9uZW50KCdEYXRhQmFzZScpO1xuICAgICAgICAvLyDojrflj5boj5zljZXmjInpkq7lubbkuJTnu5Hlrprkuovku7ZcbiAgICAgICAgdGhpcy5faW5pdE1lbnUoKTtcbiAgICB9LFxuICAgIC8vIOW8gOWni1xuICAgIHN0YXJ0OiBmdW5jdGlvbiAoKSB7XG5cbiAgICB9LFxuICAgIC8vIOWIt+aWsFxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyDljLnphY1VSeWIhui+qOeOh1xuICAgICAgICAvL3ZhciBjYW1lcmEgPSBGaXJlLkNhbWVyYS5tYWluO1xuICAgICAgICAvL3ZhciBiZ1dvcmxkQm91bmRzID0gdGhpcy5kYXRhQmFzZS5iZ1JlbmRlci5nZXRXb3JsZEJvdW5kcygpO1xuICAgICAgICAvL3ZhciBiZ1JpZ2h0VG9wV29ybGRQb3MgPSBuZXcgRmlyZS5WZWMyKGJnV29ybGRCb3VuZHMueE1heCwgYmdXb3JsZEJvdW5kcy55TWF4KTtcbiAgICAgICAgLy92YXIgYmdSaWdodFRvcCA9IGNhbWVyYS53b3JsZFRvU2NyZWVuKGJnUmlnaHRUb3BXb3JsZFBvcyk7XG4gICAgICAgIC8vdmFyIHNjcmVlblBvcyA9IG5ldyBGaXJlLlZlYzIoYmdSaWdodFRvcC54LCBiZ1JpZ2h0VG9wLnkpO1xuICAgICAgICAvL3ZhciB3b3JsZFBvcyA9IGNhbWVyYS5zY3JlZW5Ub1dvcmxkKHNjcmVlblBvcyk7XG4gICAgICAgIC8vdGhpcy5lbnRpdHkudHJhbnNmb3JtLndvcmxkUG9zaXRpb24gPSB3b3JsZFBvcztcbiAgICAgICAgLy8g5Yy56YWNVUnliIbovqjnjodcbiAgICAgICAgdmFyIGNhbWVyYSA9IEZpcmUuQ2FtZXJhLm1haW47XG4gICAgICAgIHZhciBzY3JlZW5TaXplID0gRmlyZS5TY3JlZW4uc2l6ZS5tdWwoY2FtZXJhLnNpemUgLyBGaXJlLlNjcmVlbi5oZWlnaHQpO1xuICAgICAgICB2YXIgbmV3UG9zID0gRmlyZS52MihzY3JlZW5TaXplLnggLyAyICsgdGhpcy5tYXJnaW4ueCwgc2NyZWVuU2l6ZS55IC8gMiAtIHRoaXMubWFyZ2luLnkpO1xuICAgICAgICB0aGlzLmVudGl0eS50cmFuc2Zvcm0ucG9zaXRpb24gPSBuZXdQb3M7XG4gICAgfVxufSk7XG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJ2NhN2U5dVQ4N05DMGJER2w0b3lyNlFRJywgJ1BheU1lbnRXaW5kb3cnKTtcbi8vIHNjcmlwdFxcdmlsbGFcXFBheU1lbnRXaW5kb3cuanNcblxudmFyIFBheU1lbnRXaW5kb3cgPSBGaXJlLkNsYXNzKHtcbiAgICAvLyDnu6fmib9cbiAgICBleHRlbmRzOiBGaXJlLkNvbXBvbmVudCxcbiAgICAvLyDmnoTpgKDlh73mlbBcbiAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyDmmL7npLrmlbDph49cbiAgICAgICAgdGhpcy5fc2hvd0NvdW50ID0gMztcbiAgICAgICAgLy8g5b2T5YmN5oC75pWwXG4gICAgICAgIHRoaXMuX2N1clRvdGFsID0gMDtcbiAgICAgICAgLy8g5b2T5YmN6aG1XG4gICAgICAgIHRoaXMuX2N1clBhZ2UgPSAxO1xuICAgICAgICAvLyDmnIDlpKfpobXnrb5cbiAgICAgICAgdGhpcy5fbWF4UGFnZSA9IDE7XG4gICAgICAgIC8vIOWVhuWTgeWuueWZqFxuICAgICAgICB0aGlzLm1lcmNoYW5kaXNlTGlzdCA9IFtdO1xuICAgICAgICAvLyDllYblk4HmlbDmja5cbiAgICAgICAgdGhpcy5tZXJjaGFuZGlzZURhdGFMaXN0ID0gW107XG4gICAgfSxcbiAgICAvLyDlsZ7mgKdcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIHJvb3Q6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLkVudGl0eVxuICAgICAgICB9LFxuICAgICAgICAvLyDliKDpmaTnqpflj6NcbiAgICAgICAgYnRuX2Nsb3NlOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5VSUJ1dHRvblxuICAgICAgICB9LFxuICAgICAgICAvLyDnoa7orqTmlK/ku5hcbiAgICAgICAgYnRuX3BheToge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVUlCdXR0b25cbiAgICAgICAgfSxcbiAgICAgICAgLy8g55So5oi36YeR6aKdXG4gICAgICAgIHVzZXJQcmljZToge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVGV4dFxuICAgICAgICB9LFxuICAgICAgICAvLyDnq4vljbPlhYXlgLxcbiAgICAgICAgYnRuX1JlY2hhcmdlOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5VSUJ1dHRvblxuICAgICAgICB9LFxuICAgICAgICAvLyDlkIjorqHnianlk4HkuI7mnInmlYjmnJ/pmZDmloflrZfmj4/ov7BcbiAgICAgICAgbnVtQW5kRHVyYXRpb246IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlRleHRcbiAgICAgICAgfSxcbiAgICAgICAgLy8g5oC75Lu35qC85LiO5oC75pSv5LuYXG4gICAgICAgIHByaWNlRGVzY3JpcHRpb246IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlByaWNlRGVzY3JpcHRpb25cbiAgICAgICAgfSxcbiAgICAgICAgLy8g5o6n5Yi25bqV6YOo54mp5Lu255qE6auY5bqmXG4gICAgICAgIGJvdHRvbVJvb3Q6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLkVudGl0eVxuICAgICAgICB9LFxuICAgICAgICAvLyDlkIjorqHnianlk4HkuI7mnInmlYjmnJ/pmZDmloflrZfmj4/ov7BcbiAgICAgICAgcGFnZToge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVGV4dFxuICAgICAgICB9LFxuICAgICAgICAvLyDkuIrkuIDpobVcbiAgICAgICAgYnRuX1ByZXZpb3VzOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5VSUJ1dHRvblxuICAgICAgICB9LFxuICAgICAgICAvLyDkuIvkuIDpobVcbiAgICAgICAgYm50X05leHQ6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlVJQnV0dG9uXG4gICAgICAgIH0sXG4gICAgICAgIC8vIOayoei0reeJqeeahOWbvuagh+aPkOekulxuICAgICAgICBudWxsVGlwczoge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuRW50aXR5XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIOWFs+mXreaMiemSruS6i+S7tlxuICAgIF9vbkNsb3NlV2luZG93RXZlbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5kYXRhQmFzZS5maXJzdE1lbnVNZ3Iub3Blbk1lbnUoKTtcbiAgICAgICAgdGhpcy5jbG9zZVdpbmRvdygpO1xuICAgIH0sXG4gICAgLy8g5YWF5YC8XG4gICAgX29uUmVjaGFyZ2VFdmVudDogZnVuY3Rpb24gKCkge1xuICAgICAgICB3aW5kb3cub3BlbignaHR0cDovL3d3dy5zYWlrZS5jb20vbl9wYXkvY2hhcmdlLnBocCcpO1xuICAgICAgICB0aGlzLmRhdGFCYXNlLnBheU1lbnRUaXBzLm9wZW5UaXBzKCk7XG4gICAgfSxcbiAgICAvLyDnoa7orqTmlK/ku5hcbiAgICBfb25QYXlFdmVudDogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHNlbGYuZGF0YUJhc2UudGlwc1dpbmRvdy5vcGVuVGlwc1dpbmRvdygn5oKo56Gu5a6a6Iqx6LS5JysgdGhpcy5wYXlOdW0gKydD5biB6LSt5Lmw77yfJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHNlbGYuZGF0YUJhc2UudXNlcmNjIDwgc2VsZi5wYXlOdW0pIHtcbiAgICAgICAgICAgICAgICBzZWxmLmRhdGFCYXNlLnRpcHNXaW5kb3cub3BlblRpcHNXaW5kb3coJ+aCqOW9k+WJjeS9memineS4jei2sywg5piv5ZCm5YWF5YC877yfJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9vblJlY2hhcmdlRXZlbnQoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHNlbGYuX3BheSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9LFxuICAgIC8vIOaUr+S7mFxuICAgIF9wYXk6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBzZWxmLmRhdGFCYXNlLmxvYWRUaXBzLm9wZW5UaXBzKCfmlK/ku5jkuK3vvIHor7fnqI3lkI4uLi4nKTtcbiAgICAgICAgc2VsZi5kYXRhQmFzZS5zYXZlUm9vbShmdW5jdGlvbiAoc2VydmVyVXNlcmNjKSB7XG4gICAgICAgICAgICBzZWxmLmRhdGFCYXNlLnVzZXJjYyA9IHNlcnZlclVzZXJjYztcbiAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UuY3VyRHJlc3NTdWl0LnByaWNlID0gMDtcbiAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UuaGFzQ2FuU2F2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS5zYXZlRGVmYXVsdERhdGEoKTtcbiAgICAgICAgICAgIHNlbGYuY2xvc2VXaW5kb3coKTtcbiAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UubG9hZFRpcHMuY2xvc2VUaXBzKCk7XG4gICAgICAgICAgICBzZWxmLmRhdGFCYXNlLnRpcHNXaW5kb3cub3BlblRpcHNXaW5kb3coJ+aUr+S7mOaIkOWKn++8jOW5tuS/neWtmOijheaJri4uJyk7XG4gICAgICAgICAgICBzZWxmLmRhdGFCYXNlLnJlc2V0U2NyZWVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgc2VuZERhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgIG1hcms6IHNlbGYuZGF0YUJhc2UubWFya1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS5sb2FkVGlwcy5vcGVuVGlwcygn5Yi35paw5Zy65pmv77yM6K+356iN5ZCOLi4uJyk7XG4gICAgICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS5pbnRvUm9vbShzZW5kRGF0YSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmRhdGFCYXNlLmxvYWRUaXBzLmNsb3NlVGlwcygpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLy8g5LiK5LiA6aG1XG4gICAgX29uUHJldmlvdXNFdmVudDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLl9jdXJQYWdlIC09IDE7XG4gICAgICAgIGlmICh0aGlzLl9jdXJQYWdlIDwgMSl7XG4gICAgICAgICAgICB0aGlzLl9jdXJQYWdlID0gMTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9yZWZyZXNoTWVyY2hhbmRpc2UoKTtcbiAgICB9LFxuICAgIC8vIOS4i+S4gOmhtVxuICAgIF9vbk5leHRFdmVudDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLl9jdXJQYWdlICs9IDE7XG4gICAgICAgIGlmICh0aGlzLl9jdXJQYWdlID4gdGhpcy5fbWF4UGFnZSl7XG4gICAgICAgICAgICB0aGlzLl9jdXJQYWdlID0gdGhpcy5fbWF4UGFnZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9yZWZyZXNoTWVyY2hhbmRpc2UoKTtcbiAgICB9LFxuICAgIC8vIOmHjee9ruWVhuWTgeWIl+ihqFxuICAgIF9yZXNldE1lcmNoYW5kaXNlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBjaGlsZHJlbiA9IHRoaXMubWVyY2hhbmRpc2VMaXN0O1xuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIHZhciBjb21wID0gY2hpbGRyZW5baV07XG4gICAgICAgICAgICBjb21wLnJlc2V0KCk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIOmHjee9rueql+WPo1xuICAgIF9yZXNldFdpbmRvdzogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyDph43nva7llYblk4HliJfooahcbiAgICAgICAgdGhpcy5fcmVzZXRNZXJjaGFuZGlzZSgpO1xuICAgICAgICAvLyDph43nva7lkIjorqHnianlk4HkuI7mnInmlYjmnJ/pmZDmloflrZfmj4/ov7BcbiAgICAgICAgdGhpcy5udW1BbmREdXJhdGlvbi50ZXh0ID0gJ+WQiOiuoTogMOS7tueJqeWTgSwg5pyJ5pWI5pyfOjDlpKknO1xuICAgICAgICB0aGlzLm51bUFuZER1cmF0aW9uLmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgLy8g6YeN572u5oC75Lu35qC85LiO5oC75pSv5LuYXG4gICAgICAgIHRoaXMucHJpY2VEZXNjcmlwdGlvbi5yZXNldCgpO1xuICAgICAgICAvLyDph43nva7nlKjmiLfkvZnpop1cbiAgICAgICAgdGhpcy51c2VyUHJpY2UudGV4dCA9ICfnlKjmiLfkvZnpop06IDBD5biBJztcbiAgICAgICAgLy8g6YeN572u6aG1562+XG4gICAgICAgIHRoaXMuX2N1clBhZ2UgPSAxO1xuICAgICAgICB0aGlzLl9tYXhQYWdlID0gMTtcbiAgICAgICAgdGhpcy5wYWdlLmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgLy8g5Yi35paw5oyJ6ZKu54q25oCBXG4gICAgICAgIHRoaXMuX3JlZnJlc2hCdG5TdGF0ZSgpO1xuICAgIH0sXG4gICAgLy8g5Yi35paw5ZWG5ZOB5pWw5o2uXG4gICAgX3JlZnJlc2hNZXJjaGFuZGlzZURhdGFMaXN0OiBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy5tZXJjaGFuZGlzZURhdGFMaXN0ID0gW107XG4gICAgICAgIHZhciBkYXRhID0ge307XG4gICAgICAgIC8vIOWll+ijhVxuICAgICAgICB2YXIgZHJlc3NTdWl0ID0gdGhpcy5kYXRhQmFzZS5jdXJEcmVzc1N1aXQ7XG4gICAgICAgIGlmIChkcmVzc1N1aXQucHJpY2UgPiAwKSB7XG4gICAgICAgICAgICBkYXRhID0ge1xuICAgICAgICAgICAgICAgIGljb246IGRyZXNzU3VpdC5zdWl0X2ljb24sXG4gICAgICAgICAgICAgICAgdE5hbWU6IGRyZXNzU3VpdC5zdWl0X25hbWUsXG4gICAgICAgICAgICAgICAgdE51bTogMSxcbiAgICAgICAgICAgICAgICBwcmljZTogZHJlc3NTdWl0LnByaWNlLFxuICAgICAgICAgICAgICAgIGRpc2NvdW50OiBkcmVzc1N1aXQuZGlzY291bnRcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB0aGlzLm1lcmNoYW5kaXNlRGF0YUxpc3QucHVzaChkYXRhKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBjaGlsZHJlbiA9IHRoaXMuZGF0YUJhc2Uucm9vbS5nZXRDaGlsZHJlbigpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICB2YXIgZW50ID0gY2hpbGRyZW5baV07XG4gICAgICAgICAgICB2YXIgZnVybml0dXJlID0gZW50LmdldENvbXBvbmVudCgnRnVybml0dXJlJyk7XG4gICAgICAgICAgICBpZiAocGFyc2VJbnQoZnVybml0dXJlLnByaWNlKSA+IDAgJiYgZnVybml0dXJlLnN1aXRfaWQgPT09IDApIHtcbiAgICAgICAgICAgICAgICBkYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICBpY29uOiBmdXJuaXR1cmUuc21hbGxTcHJpdGUsXG4gICAgICAgICAgICAgICAgICAgIHROYW1lOiBmdXJuaXR1cmUucHJvcHNfbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgdE51bTogMSxcbiAgICAgICAgICAgICAgICAgICAgcHJpY2U6IGZ1cm5pdHVyZS5wcmljZSxcbiAgICAgICAgICAgICAgICAgICAgZGlzY291bnQ6IGZ1cm5pdHVyZS5kaXNjb3VudFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdGhpcy5tZXJjaGFuZGlzZURhdGFMaXN0LnB1c2goZGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyDliLfmlrDllYblk4FcbiAgICBfcmVmcmVzaE1lcmNoYW5kaXNlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIOmHjee9ruWVhuWTgeWIl+ihqFxuICAgICAgICB0aGlzLl9yZXNldE1lcmNoYW5kaXNlKCk7XG4gICAgICAgIC8vIOiOt+WPluWVhuWTgeaVsOaNrlxuICAgICAgICB2YXIgZGF0YUxpc3QgPSB0aGlzLm1lcmNoYW5kaXNlRGF0YUxpc3Q7XG4gICAgICAgIHZhciB0b3RhbCA9IGRhdGFMaXN0Lmxlbmd0aDtcbiAgICAgICAgaWYgKHRoaXMuX2N1clRvdGFsICE9PSB0b3RhbCkge1xuICAgICAgICAgICAgdGhpcy5fY3VyVG90YWwgPSB0b3RhbDtcbiAgICAgICAgICAgIHRoaXMuX21heFBhZ2UgPSBNYXRoLmNlaWwodGhpcy5fY3VyVG90YWwgLyB0aGlzLl9zaG93Q291bnQpO1xuICAgICAgICB9XG4gICAgICAgIC8vIOi1i+WAvOaVsOaNrlxuICAgICAgICB2YXIgc3RhcnROdW0gPSAodGhpcy5fY3VyUGFnZSAtIDEpICogdGhpcy5fc2hvd0NvdW50O1xuICAgICAgICB2YXIgZW5kTnVtID0gc3RhcnROdW0gKyB0aGlzLl9zaG93Q291bnQ7XG4gICAgICAgIGlmIChlbmROdW0gPiB0aGlzLl9jdXJUb3RhbCkge1xuICAgICAgICAgICAgZW5kTnVtID0gdGhpcy5fY3VyVG90YWw7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGluZGV4ID0gMDtcbiAgICAgICAgZm9yKHZhciBpID0gc3RhcnROdW07IGkgPCBlbmROdW07ICsraSkge1xuICAgICAgICAgICAgdmFyIG1lbnUgPSB0aGlzLm1lcmNoYW5kaXNlTGlzdFtpbmRleF07XG4gICAgICAgICAgICB2YXIgZGF0YSA9IGRhdGFMaXN0W2ldO1xuICAgICAgICAgICAgZGF0YS50aWQgPSBpO1xuICAgICAgICAgICAgbWVudS5yZWZyZXNoKGRhdGEsIHRoaXMuYmluZERlbE1lcmNoYW5kaXNlRXZlbnQsIHRoaXMuYmluZFJlZnJlc2hOdW1FdmVudCk7XG4gICAgICAgICAgICBpbmRleCsrO1xuICAgICAgICB9XG4gICAgICAgIC8vIOWQiOiuoeeJqeWTgeS4juacieaViOWkqeaVsFxuICAgICAgICB0aGlzLm51bUFuZER1cmF0aW9uLnRleHQgPSAn5ZCI6K6hOiAnICsgdG90YWwgKyAn5Lu254mp5ZOBLCDmnInmlYjmnJ86OTDlpKknO1xuICAgICAgICB0aGlzLm51bUFuZER1cmF0aW9uLmVudGl0eS5hY3RpdmUgPSB0b3RhbCA+IDA7XG4gICAgICAgIHRoaXMubnVsbFRpcHMuYWN0aXZlID0gdG90YWwgPT09IDA7XG4gICAgICAgIC8vIOaAu+S7t+agvCDkuI4g5oqY5ZCO5Lu3IOmcgOimgeaUr+S7mFxuICAgICAgICB0aGlzLl9yZWZyZXNoQWxsUHJpY2UoKTtcbiAgICAgICAgLy8g55So5oi35L2Z6aKdXG4gICAgICAgIHRoaXMucmVmcmVzaFVzZXJDQygpO1xuICAgICAgICAvLyDliLfmlrDmjInpkq7nirbmgIFcbiAgICAgICAgdGhpcy5fcmVmcmVzaEJ0blN0YXRlKCk7XG4gICAgfSxcbiAgICAvLyDliLfmlrDnlKjmiLfkvZnpop1cbiAgICByZWZyZXNoVXNlckNDOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMudXNlclByaWNlLnRleHQgPSAn55So5oi35L2Z6aKdOiAnICsgdGhpcy5kYXRhQmFzZS51c2VyY2MgKyAnQ+W4gSc7XG4gICAgfSxcbiAgICAvLyDliLfmlrDmiYDmnInku7fmoLxcbiAgICBfcmVmcmVzaEFsbFByaWNlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIOaAu+S7t+agvCDmipjlkI7ku7cg6ZyA6KaB5pSv5LuYXG4gICAgICAgIHZhciB0b3RhbCA9IDAsIGRpc2NvdW50ID0gMCwgcGF5ID0gMDtcbiAgICAgICAgdmFyIGRhdGFMaXN0ID0gdGhpcy5tZXJjaGFuZGlzZURhdGFMaXN0O1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGFMaXN0Lmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IGRhdGFMaXN0W2ldO1xuICAgICAgICAgICAgdmFyIHByaWNlID0gZGF0YS50TnVtICogZGF0YS5wcmljZTtcbiAgICAgICAgICAgIHRvdGFsICs9IHByaWNlO1xuICAgICAgICAgICAgdmFyIGRpY291bnRQcmljZSA9IHByaWNlICogZGF0YS5kaXNjb3VudDtcbiAgICAgICAgICAgIGRpc2NvdW50ICs9IGRpY291bnRQcmljZTtcbiAgICAgICAgfVxuICAgICAgICBwYXkgPSBkaXNjb3VudDtcbiAgICAgICAgdGhpcy5wYXlOdW0gPSBwYXk7XG4gICAgICAgIHRoaXMucHJpY2VEZXNjcmlwdGlvbi5yZWZyZXNoKHRvdGFsLCBkaXNjb3VudCwgcGF5KTtcbiAgICB9LFxuICAgIC8vIOWIt+aWsOaVsOmHj1xuICAgIF9vblJlZnJlc2hOdW1FdmVudDogZnVuY3Rpb24gKGlkLCBudW0pIHtcbiAgICAgICAgaWYgKHRoaXMubWVyY2hhbmRpc2VEYXRhTGlzdC5sZW5ndGggPiBpZCkge1xuICAgICAgICAgICAgdmFyIGRhdGEgPSB0aGlzLm1lcmNoYW5kaXNlRGF0YUxpc3RbaWRdO1xuICAgICAgICAgICAgZGF0YS50TnVtID0gbnVtO1xuICAgICAgICAgICAgdGhpcy5fcmVmcmVzaEFsbFByaWNlKCk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIOWIt+aWsOaMiemSrueKtuaAgVxuICAgIF9yZWZyZXNoQnRuU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5idG5fUHJldmlvdXMuZW50aXR5LmFjdGl2ZSA9IHRoaXMuX2N1clBhZ2UgPiAxO1xuICAgICAgICB0aGlzLmJudF9OZXh0LmVudGl0eS5hY3RpdmUgPSB0aGlzLl9jdXJQYWdlIDwgdGhpcy5fbWF4UGFnZTtcbiAgICAgICAgdGhpcy5wYWdlLnRleHQgPSB0aGlzLl9jdXJQYWdlICsgXCIvXCIgKyB0aGlzLl9tYXhQYWdlO1xuICAgIH0sXG4gICAgLy8g5Yig6Zmk5Y2V5Liq5ZWG5ZOBXG4gICAgX29uRGVsTWVyY2hhbmRpc2VFdmVudDogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIHZhciBtZXJjaGFuZGlzZSA9IGV2ZW50LnRhcmdldC5wYXJlbnQuZ2V0Q29tcG9uZW50KCdNZXJjaGFuZGlzZScpO1xuICAgICAgICBpZiAobWVyY2hhbmRpc2UgJiYgdGhpcy5tZXJjaGFuZGlzZURhdGFMaXN0Lmxlbmd0aCA+IG1lcmNoYW5kaXNlLnRpZCkge1xuICAgICAgICAgICAgdGhpcy5tZXJjaGFuZGlzZURhdGFMaXN0LnNwbGljZShtZXJjaGFuZGlzZS50aWQsIDEpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3JlZnJlc2hNZXJjaGFuZGlzZSgpO1xuICAgIH0sXG4gICAgLy8g5byA5ZCv56qX5Y+jXG4gICAgb3BlbldpbmRvdzogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnBheU51bSA9IDA7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgLy9cbiAgICAgICAgc2VsZi5kYXRhQmFzZS5maXJzdE1lbnVNZ3IuY2xvc2VNZW51KCk7XG4gICAgICAgIC8vIOmHjee9rueql+WPo+aVsOaNrlxuICAgICAgICBzZWxmLl9yZXNldFdpbmRvdygpO1xuICAgICAgICAvLyDmmL7npLrnqpflj6NcbiAgICAgICAgc2VsZi5lbnRpdHkuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgLy8g5Yi35paw5ZWG5ZOB5pWw5o2uXG4gICAgICAgIHNlbGYuX3JlZnJlc2hNZXJjaGFuZGlzZURhdGFMaXN0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vIOWIt+aWsOWVhuWTgVxuICAgICAgICAgICAgc2VsZi5fcmVmcmVzaE1lcmNoYW5kaXNlKCk7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLy8g5YWz6Zet56qX5Y+jXG4gICAgY2xvc2VXaW5kb3c6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5lbnRpdHkuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX2N1clBhZ2UgPSAxO1xuICAgIH0sXG4gICAgLy8g5byA5aeLXG4gICAgc3RhcnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8g5bi455So55qE5Y+Y6YePL+aVsOaNrlxuICAgICAgICB2YXIgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL0RhdGFCYXNlJyk7XG4gICAgICAgIHRoaXMuZGF0YUJhc2UgPSBlbnQuZ2V0Q29tcG9uZW50KCdEYXRhQmFzZScpO1xuICAgICAgICAvL1xuICAgICAgICB0aGlzLnBheU51bSA9IDA7XG4gICAgICAgIC8vXG4gICAgICAgIHZhciBjaGlsZHJlbiA9IHRoaXMucm9vdC5nZXRDaGlsZHJlbigpO1xuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIGVudCA9IGNoaWxkcmVuW2ldO1xuICAgICAgICAgICAgdmFyIGNvbXAgPSBlbnQuZ2V0Q29tcG9uZW50KCdNZXJjaGFuZGlzZScpO1xuICAgICAgICAgICAgdGhpcy5tZXJjaGFuZGlzZUxpc3QucHVzaChjb21wKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmJpbmRSZWZyZXNoTnVtRXZlbnQgPSB0aGlzLl9vblJlZnJlc2hOdW1FdmVudC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmJpbmREZWxNZXJjaGFuZGlzZUV2ZW50ID0gdGhpcy5fb25EZWxNZXJjaGFuZGlzZUV2ZW50LmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuYnRuX2Nsb3NlLm9uQ2xpY2sgPSB0aGlzLl9vbkNsb3NlV2luZG93RXZlbnQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5idG5fcGF5Lm9uQ2xpY2sgPSB0aGlzLl9vblBheUV2ZW50LmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuYnRuX1ByZXZpb3VzLm9uQ2xpY2sgPSB0aGlzLl9vblByZXZpb3VzRXZlbnQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5ibnRfTmV4dC5vbkNsaWNrID0gdGhpcy5fb25OZXh0RXZlbnQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5idG5fUmVjaGFyZ2Uub25DbGljayA9IHRoaXMuX29uUmVjaGFyZ2VFdmVudC5iaW5kKHRoaXMpO1xuICAgIH1cbn0pO1xuXG5GaXJlLl9SRnBvcCgpOyIsIkZpcmUuX1JGcHVzaChtb2R1bGUsICc4OTQwOUFhM041TTRxTk1sa0NTbk1NQycsICdQbGFuV2luZG93Jyk7XG4vLyBzY3JpcHRcXG91dGRvb3JcXFBsYW5XaW5kb3cuanNcblxudmFyIFBsYW5XaW5kb3cgPSBGaXJlLkNsYXNzKHtcbiAgICAvLyDnu6fmib9cbiAgICBleHRlbmRzOiBGaXJlLkNvbXBvbmVudCxcbiAgICAvLyDmnoTpgKDlh73mlbBcbiAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24gKCkge1xuXG4gICAgfSxcbiAgICAvLyDlsZ7mgKdcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIHRlbXBQbGFuOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5FbnRpdHlcbiAgICAgICAgfSxcbiAgICAgICAgcm9vdDoge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuRW50aXR5XG4gICAgICAgIH0sXG4gICAgICAgIHJvb21OYW1lOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5UZXh0XG4gICAgICAgIH0sXG4gICAgICAgIHJvb21MZXZlbDoge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVGV4dFxuICAgICAgICB9LFxuICAgICAgICByb29tTnVtOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5UZXh0XG4gICAgICAgIH0sXG4gICAgICAgIGJ0bl9jbG9zZToge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVUlCdXR0b25cbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy8g6YeN572u56qX5Y+jXG4gICAgcmVzZXRXaW5kb3c6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5yb29tTmFtZS50ZXh0ID0gJyjliKvlooXlkI3np7ApJztcbiAgICAgICAgdGhpcy5yb29tTGV2ZWwudGV4dCA9ICfmoaPmrKHvvJrimIXimIXimIXimIXimIXimIUnO1xuICAgICAgICB0aGlzLnJvb21OdW0udGV4dCA9ICflhbE45Liq5oi/6Ze0JztcbiAgICB9LFxuICAgIC8vIOaJk+W8gOeql+WPo1xuICAgIC8vIHR5cGU6IOmCo+S4qui3r+WPo+i/m+WFpeW5s+mdouWbvueahFxuICAgIC8vIDAsIOWIh+aNouaIv+mXtCAx77ya5YiH5o2i5qW85Ye6XG4gICAgb3BlbldpbmRvdzogZnVuY3Rpb24gKHNlbmREYXRhKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgc2VsZi5lbnRpdHkuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgc2VsZi5fcmVtb3ZlUGxhbigpO1xuICAgICAgICB2YXIgbG9hY2xEYXRhID0gc2VsZi5wbGFuTGlzdFtzZW5kRGF0YS5tYXJrXTtcbiAgICAgICAgaWYgKGxvYWNsRGF0YSkge1xuICAgICAgICAgICAgc2VsZi5vZGF0YUJhc2UubWFyayA9IHNlbmREYXRhLm1hcms7XG4gICAgICAgICAgICBzZWxmLmNyZWF0ZVBsYW4obG9hY2xEYXRhKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHNlbGYub2RhdGFCYXNlLmxvYWRUaXAub3BlblRpcHMoJ+i9veWFpeW5s+mdouWbvuaVsOaNru+8geivt+eojeWQji4uLicpO1xuICAgICAgICAgICAgc2VsZi5vZGF0YUJhc2Uuc2VydmVyTmV0V29yay5SZXF1ZXN0UGxhbihzZW5kRGF0YSwgZnVuY3Rpb24gKHNlcnZlckRhdGEpIHtcbiAgICAgICAgICAgICAgICBzZWxmLm9kYXRhQmFzZS5sb2FkVGlwLmNsb3NlVGlwcygpO1xuICAgICAgICAgICAgICAgIHNlbGYucGxhbkxpc3Rbc2VuZERhdGEubWFya10gPSBzZXJ2ZXJEYXRhO1xuICAgICAgICAgICAgICAgIHNlbGYub2RhdGFCYXNlLm1hcmsgPSBzZW5kRGF0YS5tYXJrO1xuICAgICAgICAgICAgICAgIHNlbGYuY3JlYXRlUGxhbihzZXJ2ZXJEYXRhKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyDlhbPpl63nqpflj6NcbiAgICBjbG9zZVdpbmRvdzogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcbiAgICB9LFxuICAgIC8vIOe7mOWItuaYn+e6p1xuICAgIGdldFN0YXJzOiBmdW5jdGlvbiAoZ3JhZGUpIHtcbiAgICAgICAgdmFyIHN0ciA9ICfmoaPmrKHvvJonO1xuICAgICAgICBpZiAoZ3JhZGUgPT09IDEyKSB7XG4gICAgICAgICAgICBzdHIgKz0gJ+iHs+WwiuWunSc7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGdyYWRlIC0gMTsgKytpKSB7XG4gICAgICAgICAgICAgICAgc3RyICs9ICfimIUnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdHI7XG4gICAgfSxcbiAgICAvLyDliJvlu7rlubPpnaLlm75cbiAgICBjcmVhdGVQbGFuOiBmdW5jdGlvbiAoc2VydmVyRGF0YSkge1xuICAgICAgICBpZiAoISBzZXJ2ZXJEYXRhLmxpc3QpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyDlg4/mnI3liqHlmajor7fmsYLlubPpnaLlm77mlbDmja5cbiAgICAgICAgdGhpcy5yb29tTmFtZS50ZXh0ID0gc2VydmVyRGF0YS5mbG9vcl9uYW1lO1xuICAgICAgICB0aGlzLnJvb21MZXZlbC50ZXh0ID0gdGhpcy5nZXRTdGFycyhzZXJ2ZXJEYXRhLmZsb29yX2dyYWRlKTtcbiAgICAgICAgdGhpcy5yb29tTnVtLnRleHQgPSAn5YWxJysgc2VydmVyRGF0YS5saXN0Lmxlbmd0aCArICfkuKrmiL/pl7QnO1xuICAgICAgICB0aGlzLmJpbmRHb1RvUm9vbUV2ZW50ID0gdGhpcy5fb25Hb3RvUm9vbUV2ZW50LmJpbmQodGhpcyk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2VydmVyRGF0YS5saXN0Lmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IHNlcnZlckRhdGEubGlzdFtpXTtcbiAgICAgICAgICAgIHZhciBlbnQgPSBGaXJlLmluc3RhbnRpYXRlKHRoaXMudGVtcFBsYW4pO1xuICAgICAgICAgICAgZW50LmFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICBlbnQucGFyZW50ID0gdGhpcy5yb290O1xuICAgICAgICAgICAgdmFyIGJ0biA9IGVudC5nZXRDb21wb25lbnQoRmlyZS5VSUJ1dHRvbik7XG4gICAgICAgICAgICBidG4ubWFyayA9IGRhdGEubWFyaztcbiAgICAgICAgICAgIHRoaXMub2RhdGFCYXNlLmxvYWRJbWFnZShkYXRhLmltZ3VybCwgZnVuY3Rpb24gKGJ0biwgZXJyb3IsIGltYWdlKSB7XG4gICAgICAgICAgICAgICAgdmFyIHNwcml0ZSA9IG5ldyBGaXJlLlNwcml0ZShpbWFnZSk7XG4gICAgICAgICAgICAgICAgc3ByaXRlLnBpeGVsTGV2ZWxIaXRUZXN0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBidG4uc2V0U3ByaXRlKHNwcml0ZSk7XG4gICAgICAgICAgICAgICAgYnRuLm9uQ2xpY2sgPSB0aGlzLmJpbmRHb1RvUm9vbUV2ZW50O1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMsIGJ0bikpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyDov5vlhaXmiL/pl7RcbiAgICBfb25Hb3RvUm9vbUV2ZW50OiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgdmFyIGJ0biA9IGV2ZW50LnRhcmdldC5nZXRDb21wb25lbnQoRmlyZS5VSUJ1dHRvbik7XG4gICAgICAgIHZhciBzZW5kRGF0YSA9IHtcbiAgICAgICAgICAgIG1hcms6IGJ0bi5tYXJrLFxuICAgICAgICAgICAgaG91c2VfdWlkOiAwXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMub2RhdGFCYXNlLmdsb2JhbERhdGEuc2VuZERhdGEgPSBzZW5kRGF0YTtcbiAgICAgICAgRmlyZS5FbmdpbmUubG9hZFNjZW5lKCd2aWxsYScpO1xuICAgIH0sXG4gICAgLy8g5riF56m65oi/6Ze0XG4gICAgX3JlbW92ZVBsYW46IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGNoaWxkcmVuID0gdGhpcy5yb290LmdldENoaWxkcmVuKCk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwO2kgPCBjaGlsZHJlbi5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgY2hpbGRyZW5baV0uZGVzdHJveSgpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyDlhbPpl63mjInpkq7kuovku7ZcbiAgICBfb25DbG9zZVdpbmRvd0V2ZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuY2xvc2VXaW5kb3coKTtcbiAgICAgICAgdGhpcy5fcmVtb3ZlUGxhbigpO1xuICAgIH0sXG4gICAgLy9cbiAgICBzdGFydDogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyDluLjnlKjnmoTlj5jph48v5pWw5o2uXG4gICAgICAgIHZhciBlbnQgPSBGaXJlLkVudGl0eS5maW5kKCcvT0RhdGFCYXNlJyk7XG4gICAgICAgIHRoaXMub2RhdGFCYXNlID0gZW50LmdldENvbXBvbmVudCgnT0RhdGFCYXNlJyk7XG4gICAgICAgIC8vIOe7keWumuS6i+S7tlxuICAgICAgICB0aGlzLmJ0bl9jbG9zZS5vbkNsaWNrID0gdGhpcy5fb25DbG9zZVdpbmRvd0V2ZW50LmJpbmQodGhpcyk7XG4gICAgICAgIC8vXG4gICAgICAgIHRoaXMucGxhbkxpc3QgPSB7fTtcbiAgICB9XG59KTtcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnOTAyZWN1YmRKcEdoWml6TVB5NG1tU2gnLCAnUHJpY2VEZXNjcmlwdGlvbicpO1xuLy8gc2NyaXB0XFx2aWxsYVxcUHJpY2VEZXNjcmlwdGlvbi5qc1xuXG52YXIgUHJpY2VEZXNjcmlwdGlvbiA9IEZpcmUuQ2xhc3Moe1xuICAgIGV4dGVuZHM6IEZpcmUuQ29tcG9uZW50LFxuXG4gICAgcHJvcGVydGllczoge1xuICAgICAgICB0b3RhbDoge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVGV4dFxuICAgICAgICB9LFxuICAgICAgICBkaXNjb3VudDoge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVGV4dFxuICAgICAgICB9LFxuICAgICAgICBwYXk6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlRleHRcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy9cbiAgICByZXNldDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnRvdGFsLnRleHQgPSAnMC4wMEPluIEnO1xuICAgICAgICB0aGlzLmRpc2NvdW50LnRleHQgPSAnMC4wMEPluIEnO1xuICAgICAgICB0aGlzLnBheS50ZXh0ID0gJzAuMDBD5biBJztcbiAgICAgICAgdGhpcy5lbnRpdHkuYWN0aXZlID0gZmFsc2U7XG4gICAgfSxcbiAgICAvLyDliLfmlrBcbiAgICByZWZyZXNoOiBmdW5jdGlvbiAodG90YWwsIGRpc2NvdW50LCBwYXkpIHtcbiAgICAgICAgdGhpcy50b3RhbC50ZXh0ID0gKHRvdGFsIHx8IDApICsgJ0PluIEnO1xuICAgICAgICB0aGlzLmRpc2NvdW50LnRleHQgPSAoZGlzY291bnQgfHwgMCkgKyAnQ+W4gSc7XG4gICAgICAgIHRoaXMucGF5LnRleHQgPSAocGF5IHx8IDApICsgJ0PluIEnO1xuICAgICAgICB0aGlzLmVudGl0eS5hY3RpdmUgPSB0cnVlO1xuICAgIH1cbn0pO1xuXG5GaXJlLlByaWNlRGVzY3JpcHRpb24gPSBQcmljZURlc2NyaXB0aW9uO1xuXG5GaXJlLl9SRnBvcCgpOyIsIkZpcmUuX1JGcHVzaChtb2R1bGUsICc1MzRiMW0rNExwSG81M1FybVNQTDljRCcsICdTQ29udHJvbE1ncicpO1xuLy8gc2NyaXB0XFxzaW5nbGVcXFNDb250cm9sTWdyLmpzXG5cbi8vIO+/vcO777+977+977+977+977+977+977+977+977+977+977+9XHJcbnZhciBTQ29udHJvbE1nciA9IEZpcmUuQ2xhc3Moe1xyXG4gICAgLy8g77+9zLPvv71cclxuICAgIGV4dGVuZHM6IEZpcmUuQ29tcG9uZW50LFxyXG4gICAgLy8g77+977+977+97Lqv77+977+9XHJcbiAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuYmluZGVkTW91c2VEb3duRXZlbnQgPSB0aGlzLl9vbk1vdXNlRG93bkV2ZW50LmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5iaW5kZWRNb3VzZU1vdmVFdmVudCA9IHRoaXMuX29uTW91c2VNb3ZlRXZlbnQuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLmJpbmRlZE1vdXNlVXBFdmVudCA9IHRoaXMuX29uTW91c2VVcEV2ZW50LmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5fYmFja3VwU2VsZWN0VGFyZ2V0ID0gbnVsbDtcclxuICAgIH0sXHJcbiAgICAvLyDvv73vv73vv73vv71cclxuICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICBfc2VsZWN0VGFyZ2V0OiBudWxsLFxyXG4gICAgICAgIF9sYXN0U2VsZWN0VGFyZ2V0OiBudWxsLFxyXG4gICAgICAgIF9zZWxlY3RUYXJnZXRJbml0UG9zOiBGaXJlLlZlYzIuemVybyxcclxuICAgICAgICBfbW91c2VEb3duUG9zOiBGaXJlLlZlYzIuemVybyxcclxuICAgICAgICBfaGFzTW92ZVRhcmdldDogZmFsc2VcclxuICAgIH0sXHJcbiAgICAvLyDvv73vv73vv73qsLTvv73vv73vv73CvO+/vVxyXG4gICAgX29uTW91c2VEb3duRXZlbnQ6IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgIHZhciB0YXJnZXQgPSBldmVudC50YXJnZXQ7XHJcbiAgICAgICAgaWYgKCF0YXJnZXQgKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGZ1cm5pdHVyZSA9IHRhcmdldC5nZXRDb21wb25lbnQoJ1NGdXJuaXR1cmUnKTtcclxuICAgICAgICBpZiAoZnVybml0dXJlICYmIGZ1cm5pdHVyZS5oYXNEcmFnKSB7XHJcbiAgICAgICAgICAgIC8vXHJcbiAgICAgICAgICAgIHRoaXMuX3NlbGVjdFRhcmdldCA9IHRhcmdldDtcclxuICAgICAgICAgICAgdGhpcy5fYmFja3VwU2VsZWN0VGFyZ2V0ID0gdGhpcy5fc2VsZWN0VGFyZ2V0O1xyXG4gICAgICAgICAgICB0aGlzLl9zZWxlY3RUYXJnZXRJbml0UG9zID0gdGFyZ2V0LnRyYW5zZm9ybS5wb3NpdGlvbjtcclxuICAgICAgICAgICAgdmFyIHNjcmVlbmRQb3MgPSBuZXcgRmlyZS5WZWMyKGV2ZW50LnNjcmVlblgsIGV2ZW50LnNjcmVlblkpO1xyXG4gICAgICAgICAgICB0aGlzLl9tb3VzZURvd25Qb3MgPSBGaXJlLkNhbWVyYS5tYWluLnNjcmVlblRvV29ybGQoc2NyZWVuZFBvcyk7XHJcbiAgICAgICAgICAgIHRoaXMuX3NlbGVjdFRhcmdldC5zZXRBc0xhc3RTaWJsaW5nKCk7XHJcbiAgICAgICAgICAgIHRoaXMuX2hhc01vdmVUYXJnZXQgPSB0cnVlO1xyXG4gICAgICAgICAgICAvLyDvv73Ht++/ve+/vfK/qr/vv73vv73vv73Roe+/ve6jrO+/ve+/ve+/ve+/ve+/ve+/ve+/ve+/vc2s77+9xLbvv73vv73vv73vv73Nsu+/ve+/ve+/vdKq77+977+977+9wrTvv73vv73vv71cclxuICAgICAgICAgICAgaWYgKHRoaXMuX3NlbGVjdFRhcmdldCAhPT0gdGhpcy5fbGFzdFNlbGVjdFRhcmdldCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZGF0YUJhc2Uub3B0aW9ucy5vcGVuKHRoaXMuX3NlbGVjdFRhcmdldCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9sYXN0U2VsZWN0VGFyZ2V0ID0gdGhpcy5fc2VsZWN0VGFyZ2V0O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5zZGF0YUJhc2Uub3B0aW9ucy5oYXNPcGVuKCkpIHtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNkYXRhQmFzZS5vcHRpb25zLmhhc1RvdWNoKHRhcmdldCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zZWxlY3RUYXJnZXQgPSB0aGlzLl9iYWNrdXBTZWxlY3RUYXJnZXQ7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9zZWxlY3RUYXJnZXQgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2RhdGFCYXNlLm9wdGlvbnMuaGlkZSgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIO+/ve+/ve+/ve+/ve+/vca277+977+9wrzvv71cclxuICAgIF9vbk1vdXNlTW92ZUV2ZW50OiBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICBpZiAodGhpcy5fc2VsZWN0VGFyZ2V0ICYmIHRoaXMuX2hhc01vdmVUYXJnZXQpIHtcclxuICAgICAgICAgICAgdGhpcy5fbW92ZShldmVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIO+/vca277+977+90r7vv71cclxuICAgIF9tb3ZlOiBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICB2YXIgbW92ZVBvcyA9IG5ldyBGaXJlLlZlYzIoZXZlbnQuc2NyZWVuWCwgZXZlbnQuc2NyZWVuWSk7XHJcbiAgICAgICAgdmFyIG1vdmVXb3JkUG9zID0gRmlyZS5DYW1lcmEubWFpbi5zY3JlZW5Ub1dvcmxkKG1vdmVQb3MpO1xyXG5cclxuICAgICAgICB2YXIgb2Zmc2V0V29yZFBvcyA9IEZpcmUuVmVjMi56ZXJvO1xyXG4gICAgICAgIG9mZnNldFdvcmRQb3MueCA9IHRoaXMuX21vdXNlRG93blBvcy54IC0gbW92ZVdvcmRQb3MueDtcclxuICAgICAgICBvZmZzZXRXb3JkUG9zLnkgPSB0aGlzLl9tb3VzZURvd25Qb3MueSAtIG1vdmVXb3JkUG9zLnk7XHJcblxyXG4gICAgICAgIHRoaXMuX3NlbGVjdFRhcmdldC50cmFuc2Zvcm0ueCA9IHRoaXMuX3NlbGVjdFRhcmdldEluaXRQb3MueCAtIG9mZnNldFdvcmRQb3MueDtcclxuICAgICAgICB0aGlzLl9zZWxlY3RUYXJnZXQudHJhbnNmb3JtLnkgPSB0aGlzLl9zZWxlY3RUYXJnZXRJbml0UG9zLnkgLSBvZmZzZXRXb3JkUG9zLnk7XHJcblxyXG4gICAgICAgIHRoaXMuc2RhdGFCYXNlLm9wdGlvbnMuc2V0UG9zKHRoaXMuX3NlbGVjdFRhcmdldC50cmFuc2Zvcm0ud29ybGRQb3NpdGlvbik7XHJcbiAgICB9LFxyXG4gICAgLy8g77+977+977+977+977+9zbfvv73vv73CvO+/vVxyXG4gICAgX29uTW91c2VVcEV2ZW50OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5faGFzTW92ZVRhcmdldCA9IGZhbHNlO1xyXG4gICAgfSxcclxuICAgIC8vIO+/ve+/ve+/vdi/77+977+977+90aHvv73vv71cclxuICAgIF9vbkhpZGVFdmVudDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuX3NlbGVjdFRhcmdldCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fYmFja3VwU2VsZWN0VGFyZ2V0ID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9sYXN0U2VsZWN0VGFyZ2V0ID0gbnVsbDtcclxuICAgIH0sXHJcbiAgICAvLyDvv73vv73Xqu+/ve+/ve+/ve+/vVxyXG4gICAgX29uTWlycm9yRmxpcEV2ZW50OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX3NlbGVjdFRhcmdldCkge1xyXG4gICAgICAgICAgICB2YXIgc2NhbGVYID0gdGhpcy5fc2VsZWN0VGFyZ2V0LnRyYW5zZm9ybS5zY2FsZVg7XHJcbiAgICAgICAgICAgIHRoaXMuX3NlbGVjdFRhcmdldC50cmFuc2Zvcm0uc2NhbGVYID0gc2NhbGVYID4gMSA/IC1zY2FsZVggOiBNYXRoLmFicyhzY2FsZVgpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvLyDJvu+/ve+/vdGh77+977+977+977+977+977+9XHJcbiAgICBfb25EZWxldGVUYXJnZXRFdmVudDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuX3NlbGVjdFRhcmdldC5kZXN0cm95KCk7XHJcbiAgICAgICAgdGhpcy5fc2VsZWN0VGFyZ2V0ID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9iYWNrdXBTZWxlY3RUYXJnZXQgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX2xhc3RTZWxlY3RUYXJnZXQgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuc2RhdGFCYXNlLm9wdGlvbnMuaGlkZSgpO1xyXG4gICAgfSxcclxuICAgIC8vIO+/ve+/ve+/ve+/vVxyXG4gICAgcmVzZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLnNkYXRhQmFzZS5vcHRpb25zLmhpZGUoKTtcclxuICAgICAgICB0aGlzLl9zZWxlY3RUYXJnZXQgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX2JhY2t1cFNlbGVjdFRhcmdldCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fbGFzdFNlbGVjdFRhcmdldCA9IG51bGw7XHJcbiAgICB9LFxyXG4gICAgLy8g77+977+977+977+977+9wrzvv71cclxuICAgIHN0YXJ0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgLy8g77+977+977+9w7XEse+/ve+/ve+/vS/vv73vv73vv73vv71cclxuICAgICAgICB2YXIgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL1NEYXRhQmFzZScpO1xyXG4gICAgICAgIHRoaXMuc2RhdGFCYXNlID0gZW50LmdldENvbXBvbmVudCgnU0RhdGFCYXNlJyk7XHJcblxyXG4gICAgICAgIEZpcmUuSW5wdXQub24oJ21vdXNlZG93bicsIHRoaXMuYmluZGVkTW91c2VEb3duRXZlbnQpO1xyXG4gICAgICAgIEZpcmUuSW5wdXQub24oJ21vdXNlbW92ZScsIHRoaXMuYmluZGVkTW91c2VNb3ZlRXZlbnQpO1xyXG4gICAgICAgIEZpcmUuSW5wdXQub24oJ21vdXNldXAnLCB0aGlzLmJpbmRlZE1vdXNlVXBFdmVudCk7XHJcbiAgICAgICAgLy9cclxuICAgICAgICB0aGlzLnNkYXRhQmFzZS5vcHRpb25zLm9uSGlkZUV2ZW50ID0gdGhpcy5fb25IaWRlRXZlbnQuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLnNkYXRhQmFzZS5vcHRpb25zLmJ0bl9kZWwub25Nb3VzZWRvd24gPSB0aGlzLl9vbkRlbGV0ZVRhcmdldEV2ZW50LmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5zZGF0YUJhc2Uub3B0aW9ucy5idG5fTWlycm9yRmxpcC5vbk1vdXNlZG93biA9IHRoaXMuX29uTWlycm9yRmxpcEV2ZW50LmJpbmQodGhpcyk7XHJcbiAgICB9LFxyXG4gICAgLy8g77+977+977+977+9XHJcbiAgICBvbkRlc3Ryb3k6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIEZpcmUuSW5wdXQub2ZmKCdtb3VzZWRvd24nLCB0aGlzLmJpbmRlZE1vdXNlRG93bkV2ZW50KTtcclxuICAgICAgICBGaXJlLklucHV0Lm9mZignbW91c2Vtb3ZlJywgdGhpcy5iaW5kZWRNb3VzZU1vdmVFdmVudCk7XHJcbiAgICAgICAgRmlyZS5JbnB1dC5vZmYoJ21vdXNldXAnLCB0aGlzLmJpbmRlZE1vdXNlVXBFdmVudCk7XHJcbiAgICB9XHJcbn0pO1xyXG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJzU5NGQ2Q2VDRTFBVjZwRHNwUnVwcTJvJywgJ1NEYXRhQmFzZScpO1xuLy8gc2NyaXB0XFxzaW5nbGVcXFNEYXRhQmFzZS5qc1xuXG4vLyDmlbDmja7lupNcclxudmFyIFNEYXRhQmFzZSA9IEZpcmUuQ2xhc3Moe1xyXG4gICAgLy8g57un5om/XHJcbiAgICBleHRlbmRzOiBGaXJlLkNvbXBvbmVudCxcclxuICAgIC8vIOaehOmAoOWHveaVsFxyXG4gICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAvLyDliJ3lp4vljJblnLrmma/mlbDmja5cclxuICAgICAgICB0aGlzLmluaXRTY3JlZW5EYXRhID0gW107XHJcbiAgICAgICAgLy8g5LqM57qn6I+c5Y2V5pWw5o2uXHJcbiAgICAgICAgdGhpcy5zZWNvbmRhcnlNZW51RGF0YVNoZWV0cyA9IFtdO1xyXG4gICAgICAgIC8vIOS4iee6p+iPnOWNleaAu+aVsFxyXG4gICAgICAgIHRoaXMudGhyZWVNZW51RGF0YVRvdGFsU2hlZXRzID0ge307XHJcbiAgICAgICAgLy8g5LiJ57qn6I+c5Y2V5pWw5o2uXHJcbiAgICAgICAgdGhpcy50aHJlZU1lbnVEYXRhU2hlZXRzID0ge307XHJcbiAgICAgICAgLy8g5LiJ57qn6I+c5Y2V5aSn5Zu+5YiX6KGoXHJcbiAgICAgICAgdGhpcy50aHJlZU1lbnVCaWdJbWFnZVNoZWV0cyA9IFtdO1xyXG4gICAgICAgIC8vIOaIkeeahOijheaJruaVsOaNruaAu+aVsFxyXG4gICAgICAgIHRoaXMubXlEcmVzc1VwVG90YWwgPSAwO1xyXG4gICAgICAgIC8vIOaIkeeahOijheaJruaVsOaNruWIl+ihqFxyXG4gICAgICAgIHRoaXMubXlEcmVzc1VwRGF0YVNoZWV0cyA9IFtdO1xyXG4gICAgICAgIC8vIOS/neWtmOaJgOacieWbvueJh1xyXG4gICAgICAgIHRoaXMubG9hZEltYWdlTGlzdCA9IHt9O1xyXG4gICAgfSxcclxuICAgIC8vIOWKoOi9vemihOWItlxyXG4gICAgX2xvYWRPYmplY3Q6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAvLyDmiL/pl7TlpLToioLngrlcclxuICAgICAgICB0aGlzLnJvb20gPSBGaXJlLkVudGl0eS5maW5kKCcvUm9vbScpO1xyXG4gICAgICAgIC8vIOaOp+WItueuoeeQhuexu1xyXG4gICAgICAgIHRoaXMuc2NvbnRyb2xNZ3IgPSB0aGlzLnJvb20uZ2V0Q29tcG9uZW50KCdTQ29udHJvbE1ncicpO1xyXG4gICAgICAgIC8vIOaOp+WItumAiemhuVxyXG4gICAgICAgIHZhciBlbnQgPSB0aGlzLmVudGl0eS5maW5kKCdPcHRpb25zJyk7XHJcbiAgICAgICAgdGhpcy5vcHRpb25zID0gZW50LmdldENvbXBvbmVudCgnT3B0aW9ucycpO1xyXG4gICAgICAgIC8vIOiDjOaZr1xyXG4gICAgICAgIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9Sb29tL2JhY2tncm91bmQnKTtcclxuICAgICAgICB0aGlzLmJnUmVuZGVyID0gZW50LmdldENvbXBvbmVudChGaXJlLlNwcml0ZVJlbmRlcmVyKTtcclxuICAgICAgICAvLyDlnLDmnb9cclxuICAgICAgICBlbnQgPSBGaXJlLkVudGl0eS5maW5kKCcvUm9vbS9ncm91bmQnKTtcclxuICAgICAgICB0aGlzLmdyb3VuZFJlbmRlciA9IGVudC5nZXRDb21wb25lbnQoRmlyZS5TcHJpdGVSZW5kZXJlcik7XHJcbiAgICAgICAgLy8g5Lq654mp5b2i6LGhXHJcbiAgICAgICAgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL0NoYXJhY3RlcnMnKTtcclxuICAgICAgICB0aGlzLmNoYXJhY3RlcnMgPSBlbnQuZ2V0Q29tcG9uZW50KEZpcmUuU3ByaXRlUmVuZGVyZXIpO1xyXG4gICAgICAgIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9DaGFyYWN0ZXJzL0NoYXJhY3RlcnNOYW1lJyk7XHJcbiAgICAgICAgdGhpcy5jaGFyYWN0ZXJzTmFtZSA9IGVudC5nZXRDb21wb25lbnQoRmlyZS5CaXRtYXBUZXh0KTtcclxuICAgICAgICAvLyDkuoznuqflrZDoj5zljZXmqKHmnb9cclxuICAgICAgICB0aGlzLnRlbXBTZWNvbmRhcnlNZW51ID0gdGhpcy5lbnRpdHkuZmluZCgnU2Vjb25kYXJ5TWVudScpO1xyXG4gICAgICAgIC8vIOS4iee6p+WtkOiPnOWNleaooeadv1xyXG4gICAgICAgIHRoaXMudGVtcFRocmVlTWVudSA9IHRoaXMuZW50aXR5LmZpbmQoJ1RocmVlTWVudScpO1xyXG4gICAgICAgIC8vIOWutuWFt+aooeadv1xyXG4gICAgICAgIHRoaXMudGVtcEZ1cm5pdHVyZSA9IHRoaXMuZW50aXR5LmZpbmQoJ0Z1cm5pdHVyZScpO1xyXG4gICAgICAgIC8vIOaIv+mXtOexu+Wei+aooeadv1xyXG4gICAgICAgIHRoaXMudGVtcFJvb21UeXBlID0gdGhpcy5lbnRpdHkuZmluZCgnUm9vbVR5cGUnKTtcclxuICAgICAgICAvLyDoo4Xmia7mlbDmja7mqKHmnb9cclxuICAgICAgICB0aGlzLnRlbXBNeURyZXNzVXBEYXRhID0gdGhpcy5lbnRpdHkuZmluZCgnTXlEcmVzc1VwRGF0YScpO1xyXG4gICAgICAgIC8vIOS4gOe6p+iPnOWNlVxyXG4gICAgICAgIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9NZW51X01haW5NZ3InKTtcclxuICAgICAgICB0aGlzLnNtYWluTWVudU1nciA9IGVudC5nZXRDb21wb25lbnQoJ1NNYWluTWVudU1ncicpO1xyXG4gICAgICAgIC8vIOS6jOe6p+iPnOWNlVxyXG4gICAgICAgIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9NZW51X1NlY29uZGFyeU1ncicpO1xyXG4gICAgICAgIHRoaXMuc3NlY29uZGFyeU1lbnVNZ3IgPSBlbnQuZ2V0Q29tcG9uZW50KCdTU2Vjb25kYXJ5TWVudU1ncicpO1xyXG4gICAgICAgIC8vIOS4iee6p+e6p+iPnOWNlVxyXG4gICAgICAgIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9NZW51X1RocmVlTWdyJyk7XHJcbiAgICAgICAgdGhpcy5zdGhyZWVNZW51TWdyID0gZW50LmdldENvbXBvbmVudCgnU1RocmVlTWVudU1ncicpO1xyXG4gICAgICAgIC8vIOe9kee7nOi/nuaOpVxyXG4gICAgICAgIHRoaXMuc25ldFdvcmtNZ3IgPSB0aGlzLmVudGl0eS5nZXRDb21wb25lbnQoJ1NOZXR3b3JrTWdyJyk7XHJcbiAgICAgICAgLy8g5ouN54Wn5Yib5bu657yp55Wl5Zu+XHJcbiAgICAgICAgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL1NjcmVlbnNob3QnKTtcclxuICAgICAgICB0aGlzLnNjcmVlbnNob3QgPSBlbnQuZ2V0Q29tcG9uZW50KCdTY3JlZW5zaG90Jyk7XHJcbiAgICAgICAgLy8g5L+d5oyB5oi/6Ze06ZSZ6K+v5o+Q56S656qX5Y+jXHJcbiAgICAgICAgdGhpcy5zc2F2ZUVycm9yVGlwcyA9IEZpcmUuRW50aXR5LmZpbmQoJy9UaXBzX1NhdmVFcnJvcicpO1xyXG4gICAgICAgIC8vIOS/neaMgeaIv+mXtOaVsOaNrueql+WPo1xyXG4gICAgICAgIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9XaW5fU2F2ZVJvb20nKTtcclxuICAgICAgICB0aGlzLnNzYXZlUm9vbVdpbmRvdyA9IGVudC5nZXRDb21wb25lbnQoJ1NTYXZlUm9vbVdpbmRvdycpO1xyXG4gICAgICAgIC8vIOaPkOekuueql+WPo1xyXG4gICAgICAgIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9XaW5fVGlwcycpO1xyXG4gICAgICAgIHRoaXMuc3RpcHNXaW5kb3cgPSBlbnQuZ2V0Q29tcG9uZW50KCdTVGlwc1dpbmRvdycpO1xyXG4gICAgICAgIC8vIOijheaJrueql+WPo1xyXG4gICAgICAgIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9XaW5fTXlEcmVzc1VwJyk7XHJcbiAgICAgICAgdGhpcy5zbXlEcmVzc1VwV2luZG93ID0gZW50LmdldENvbXBvbmVudCgnU015RHJlc3NVcFdpbmRvdycpO1xyXG4gICAgICAgIC8vIOWKoOi9veaPkOekuueql+WPo1xyXG4gICAgICAgIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9UaXBzX0xvYWRpbmcnKTtcclxuICAgICAgICB0aGlzLnNsb2FkaW5nVGlwcyA9IGVudC5nZXRDb21wb25lbnQoJ1NMb2FkaW5nVGlwcycpO1xyXG4gICAgICAgIC8vIOaPkOekuuayoeacieeUqOaIt+S/oeaBr1xyXG4gICAgICAgIHRoaXMuc3RvS2VuVGlwcyA9IEZpcmUuRW50aXR5LmZpbmQoJy9UaXBzX1RvS2VuJyk7XHJcblxyXG4gICAgICAgIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9HbG9iYWxEYXRhJyk7XHJcbiAgICAgICAgaWYgKGVudCkge1xyXG4gICAgICAgICAgICB0aGlzLmdsb2JhbERhdGEgPSBlbnQuZ2V0Q29tcG9uZW50KFwiR2xvYmFsRGF0YVwiKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8g6L295YWl5pe2XHJcbiAgICBvbkxvYWQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAvLyDliqDovb3pooTliLZcclxuICAgICAgICB0aGlzLl9sb2FkT2JqZWN0KCk7XHJcbiAgICAgICAgLy8g5Yik5pat5piv5ZCm5pyJVG9LZW5cclxuICAgICAgICBpZiAoIXRoaXMuc25ldFdvcmtNZ3IuZ2V0VG9LZW5WYWx1ZSgpKXtcclxuICAgICAgICAgICAgdGhpcy5zdG9LZW5UaXBzLmFjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICAvLyDkuIvovb3lm77niYdcclxuICAgIGxvYWRJbWFnZTogZnVuY3Rpb24gKHVybCwgY2FsbGJhY2spIHtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgaWYgKHNlbGYubG9hZEltYWdlTGlzdFt1cmxdKSB7XHJcbiAgICAgICAgICAgIHZhciBpbWFnZSA9IHNlbGYubG9hZEltYWdlTGlzdFt1cmxdO1xyXG4gICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIGltYWdlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIEZpcmUuSW1hZ2VMb2FkZXIodXJsLCBmdW5jdGlvbiAoZXJyb3IsIGltYWdlKSB7XHJcbiAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xyXG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyb3IsIGltYWdlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoaW1hZ2UpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYubG9hZEltYWdlTGlzdFt1cmxdID0gaW1hZ2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcblxyXG4gICAgLy8g5Yi35paw5Zy65pmv5pWw5o2uXHJcbiAgICByZWZyZXNoU2NyZWVuOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgIGlmICghdGhpcy5iZ1JlbmRlciAmJiAhdGhpcy5ncm91bmRSZW5kZXIpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgY29tcCA9IG51bGw7XHJcbiAgICAgICAgaWYgKGRhdGEucHJvcFR5cGUgPT09IDEpIHtcclxuICAgICAgICAgICAgLy8g6IOM5pmvXHJcbiAgICAgICAgICAgIGNvbXAgPSB0aGlzLmJnUmVuZGVyLmVudGl0eS5nZXRDb21wb25lbnQoJ1NGdXJuaXR1cmUnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIOWcsOmdolxyXG4gICAgICAgICAgICBjb21wID0gdGhpcy5ncm91bmRSZW5kZXIuZW50aXR5LmdldENvbXBvbmVudCgnU0Z1cm5pdHVyZScpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb21wLnROYW1lID0gZGF0YS50TmFtZTtcclxuICAgICAgICBjb21wLnN1aXRfaWQgPSBkYXRhLnN1aXRfaWQ7XHJcbiAgICAgICAgY29tcC5wcm9wVHlwZSA9IGRhdGEucHJvcFR5cGU7XHJcbiAgICAgICAgY29tcC5pbWFnZVVybCA9IGRhdGEuaW1hZ2VVcmw7XHJcbiAgICAgICAgY29tcC5zZXRTcHJpdGUoZGF0YS5zcHJpdGUpO1xyXG4gICAgICAgIGNvbXAuZGVmYXVsdFNwcml0ZSA9IGRhdGEuc3ByaXRlO1xyXG4gICAgfSxcclxuICAgIC8vIOmihOWKoOi9veWIneWni+WMluWcuuaZr1xyXG4gICAgcHJlbG9hZEluaXRTY3JlZW5EYXRhOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgIHRoaXMuY2hhcmFjdGVycy5lbnRpdHkuYWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgaWYgKHRoaXMuZ2xvYmFsRGF0YSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5nbG9iYWxEYXRhLmdvdG9UeXBlID09PSAyKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoYXJhY3RlcnMuc3ByaXRlID0gdGhpcy5nbG9iYWxEYXRhLmhvc3RTcHJpdGU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoYXJhY3RlcnNOYW1lLnRleHQgPSB0aGlzLmdsb2JhbERhdGEuaG9zdE5hbWU7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNoYXJhY3RlcnMuZW50aXR5LmFjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNzZWNvbmRhcnlNZW51TWdyLm9wZW5TZWNvbmRhcnlNZW51KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIOWmguS9leaciee8k+WtmOeUqOe8k+WtmOeahOayoeacieWGjeWOu+S4i+i9vVxyXG4gICAgICAgIGlmICh0aGlzLmluaXRTY3JlZW5EYXRhLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmluaXRTY3JlZW5EYXRhLmxlbmd0aDsgKytpKXtcclxuICAgICAgICAgICAgICAgIHZhciBkYXRhID0gdGhpcy5pbml0U2NyZWVuRGF0YVtpXTtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVmcmVzaFNjcmVlbihkYXRhKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICBzZWxmLnNsb2FkaW5nVGlwcy5vcGVuVGlwcyhcIuWIneWni+WMluWcuuaZr+S4rS4uXCIpO1xyXG4gICAgICAgIHZhciBpbmRleCA9IDAsIG1heEluZGV4ID0gMDtcclxuICAgICAgICBzZWxmLnNuZXRXb3JrTWdyLlJlcXVlc3RJbml0SG9tZShmdW5jdGlvbiAoc2VydmVyRGF0YSkge1xyXG4gICAgICAgICAgICBtYXhJbmRleCA9IHNlcnZlckRhdGEubGlzdC5sZW5ndGg7XHJcbiAgICAgICAgICAgIHNlcnZlckRhdGEubGlzdC5mb3JFYWNoKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAvL1xyXG4gICAgICAgICAgICAgICAgdmFyIG5ld0RhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcG9zOiBkYXRhLnBvcyxcclxuICAgICAgICAgICAgICAgICAgICBzY2FsZTogZGF0YS5zY2FsZSxcclxuICAgICAgICAgICAgICAgICAgICB0TmFtZTogZGF0YS5wcm9wc05hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgc3VpdF9pZDogZGF0YS5pZCxcclxuICAgICAgICAgICAgICAgICAgICByb3RhdGlvbjogZGF0YS5yb3RhdGlvbixcclxuICAgICAgICAgICAgICAgICAgICBwcm9wVHlwZTogZGF0YS5wcm9wc1R5cGUsXHJcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VVcmw6IGRhdGEuaW1nVXJsLFxyXG4gICAgICAgICAgICAgICAgICAgIHNwcml0ZTogbnVsbFxyXG4gICAgICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgICAgICAvL1xyXG4gICAgICAgICAgICAgICAgdmFyIGxvYWRJbWFnZUNhbGxCYWNrID0gZnVuY3Rpb24gKG5ld0RhdGEsIGVycm9yLCBpbWFnZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGluZGV4Kys7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYoaW5kZXggPT09IG1heEluZGV4KXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5zbG9hZGluZ1RpcHMuY2xvc2VUaXBzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmICghRmlyZS5FbmdpbmUuaXNQbGF5aW5nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBuZXdEYXRhLnNwcml0ZSA9IG5ldyBGaXJlLlNwcml0ZShpbWFnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5yZWZyZXNoU2NyZWVuKG5ld0RhdGEpO1xyXG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMsIG5ld0RhdGEpO1xyXG4gICAgICAgICAgICAgICAgLy9cclxuICAgICAgICAgICAgICAgIHNlbGYubG9hZEltYWdlKG5ld0RhdGEuaW1hZ2VVcmwsIGxvYWRJbWFnZUNhbGxCYWNrKTtcclxuICAgICAgICAgICAgICAgIC8vXHJcbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5pbml0U2NyZWVuRGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuaW5pdFNjcmVlbkRhdGEucHVzaChuZXdEYXRhKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgLy8g5Yqg6L295Yig6Zmk5Y2V5Liq6KOF5omu5ZCO5Yi35paw55qE5pWw5o2uXHJcbiAgICBsb2FkUmVmcmVzaE15RHJlc3NVcERhdGE6IGZ1bmN0aW9uIChjdXJJRCwgY2FsbGJhY2spIHtcclxuICAgICAgICB2YXIgc2VuZERhdGEgPSB7XHJcbiAgICAgICAgICAgIGlkOiBjdXJJRFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIHNlbGYubXlEcmVzc1VwVG90YWwgPSAwO1xyXG4gICAgICAgIHNlbGYubXlEcmVzc1VwRGF0YVNoZWV0cyA9IFtdO1xyXG4gICAgICAgIHZhciBpbmRleCA9IDA7XHJcbiAgICAgICAgdGhpcy5zbmV0V29ya01nci5SZXF1ZXN0RGVsSG9tZShzZW5kRGF0YSwgZnVuY3Rpb24gKGFsbERhdGEpIHtcclxuICAgICAgICAgICAgaWYgKCEgRmlyZS5FbmdpbmUuaXNQbGF5aW5nKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc2VsZi5teURyZXNzVXBUb3RhbCA9IHBhcnNlSW50KGFsbERhdGEudG90YWwpO1xyXG4gICAgICAgICAgICBpZiAoc2VsZi5teURyZXNzVXBUb3RhbCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBhbGxEYXRhLmxpc3QuZm9yRWFjaChmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIG15RHJlc3NVcERhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWQ6IGRhdGEuc3VpdF9pZCxcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBkYXRhLnN1aXRfbmFtZSxcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBkYXRhLnJvb21fdHlwZSxcclxuICAgICAgICAgICAgICAgICAgICB0eXBlTmFtZTogZGF0YS5yb29tX25hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgaXNEcmVzczogZGF0YS5pc2RyZXNzID4gMFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIC8vXHJcbiAgICAgICAgICAgICAgICBzZWxmLm15RHJlc3NVcERhdGFTaGVldHMucHVzaChteURyZXNzVXBEYXRhKTtcclxuICAgICAgICAgICAgICAgIGlmIChpbmRleCA9PT0gYWxsRGF0YS5saXN0Lmxlbmd0aCAtIDEpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpbmRleCsrO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgfSxcclxuICAgIC8vIOajgOafpeacjeWKoeWZqOS4iueahOaVsOaNruaYr+WQpuS4juacrOWcsOebuOWQjFxyXG4gICAgY2hlY2tpbmdNeURyZXNzVXBEYXRhOiBmdW5jdGlvbiAoY2FsbGJhY2spIHtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgdmFyIHNlbmREYXRhID0ge1xyXG4gICAgICAgICAgICBwYWdlOiAxLFxyXG4gICAgICAgICAgICBlYWNobnVtOiA2LFxyXG4gICAgICAgICAgICByb29tX3R5cGU6IC0xXHJcbiAgICAgICAgfTtcclxuICAgICAgICBzZWxmLnNuZXRXb3JrTWdyLlJlcXVlc3RIb21lTGlzdChzZW5kRGF0YSwgZnVuY3Rpb24gKGFsbERhdGEpIHtcclxuICAgICAgICAgICAgaWYgKCEgRmlyZS5FbmdpbmUuaXNQbGF5aW5nKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc2VsZi5teURyZXNzVXBEYXRhU2hlZXRzID0gW107XHJcbiAgICAgICAgICAgIHNlbGYubXlEcmVzc1VwVG90YWwgPSBwYXJzZUludChhbGxEYXRhLnRvdGFsKTtcclxuICAgICAgICAgICAgdmFyIGluZGV4ID0gMDtcclxuICAgICAgICAgICAgYWxsRGF0YS5saXN0LmZvckVhY2goZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgIHZhciBteURyZXNzVXBEYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlkOiBkYXRhLnN1aXRfaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogZGF0YS5zdWl0X25hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogZGF0YS5yb29tX3R5cGUsXHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZU5hbWU6IGRhdGEucm9vbV9uYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgIGlzRHJlc3M6IGRhdGEuaXNkcmVzcyA+IDBcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhpbmRleCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpbmRleCsrO1xyXG4gICAgICAgICAgICAgICAgLy9cclxuICAgICAgICAgICAgICAgIHNlbGYubXlEcmVzc1VwRGF0YVNoZWV0cy5wdXNoKG15RHJlc3NVcERhdGEpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgaWYgKGNhbGxiYWNrICl7XHJcbiAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgLy8g6aKE5Yqg6L295oiR55qE6KOF5omu5pWw5o2uXHJcbiAgICBwcmVsb2FkTXlEcmVzc1VwRGF0YTogZnVuY3Rpb24gKHBhZ2UsIGVhY2gsIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIHZhciBzZW5kRGF0YSA9IHtcclxuICAgICAgICAgICAgcGFnZTogcGFnZSxcclxuICAgICAgICAgICAgZWFjaG51bTogZWFjaCxcclxuICAgICAgICAgICAgcm9vbV90eXBlOiAtMVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgc2VsZi5zbmV0V29ya01nci5SZXF1ZXN0SG9tZUxpc3Qoc2VuZERhdGEsIGZ1bmN0aW9uIChhbGxEYXRhKSB7XHJcbiAgICAgICAgICAgIGlmICghIEZpcmUuRW5naW5lLmlzUGxheWluZykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHNlbGYubXlEcmVzc1VwVG90YWwgPSBwYXJzZUludChhbGxEYXRhLnRvdGFsKTtcclxuICAgICAgICAgICAgdmFyIGluZGV4ID0gMDtcclxuICAgICAgICAgICAgYWxsRGF0YS5saXN0LmZvckVhY2goZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgIHZhciBteURyZXNzVXBEYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIGlkOiBkYXRhLnN1aXRfaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogZGF0YS5zdWl0X25hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogZGF0YS5yb29tX3R5cGUsXHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZU5hbWU6IGRhdGEucm9vbV9uYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgIGlzRHJlc3M6IGRhdGEuaXNkcmVzcyA+IDBcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhpbmRleCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpbmRleCsrO1xyXG4gICAgICAgICAgICAgICAgLy9cclxuICAgICAgICAgICAgICAgIGlmIChzZWxmLm15RHJlc3NVcERhdGFTaGVldHMuaW5kZXhPZihteURyZXNzVXBEYXRhKSA8IDApe1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYubXlEcmVzc1VwRGF0YVNoZWV0cy5wdXNoKG15RHJlc3NVcERhdGEpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICAvLyDpooTliqDovb3kuoznuqfoj5zljZXmlbDmja5cclxuICAgIHByZWxvYWRTZWNvbmRhcnlNZW51RGF0YTogZnVuY3Rpb24gKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIHNlbGYuc25ldFdvcmtNZ3IuUmVxdWVzdFNlY29uZGFyeU1lbnVEYXRhKGZ1bmN0aW9uIChhbGxkYXRhKSB7XHJcbiAgICAgICAgICAgIGlmICghIEZpcmUuRW5naW5lLmlzUGxheWluZykge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHNlbGYuc2Vjb25kYXJ5TWVudURhdGFTaGVldHMgPSBbXTtcclxuICAgICAgICAgICAgdmFyIGluZGV4ID0gMDtcclxuICAgICAgICAgICAgYWxsZGF0YS5saXN0LmZvckVhY2goZnVuY3Rpb24gKHNlcnZlckRhdGEpIHtcclxuICAgICAgICAgICAgICAgIHZhciBkYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIHRpZDogc2VydmVyRGF0YS50aWQsXHJcbiAgICAgICAgICAgICAgICAgICAgaXNkcmFnOiBzZXJ2ZXJEYXRhLmlzZHJhZyxcclxuICAgICAgICAgICAgICAgICAgICB0bmFtZTogc2VydmVyRGF0YS50bmFtZSxcclxuICAgICAgICAgICAgICAgICAgICB1cmw6IHNlcnZlckRhdGEudXJsLFxyXG4gICAgICAgICAgICAgICAgICAgIHNtYWxsU3ByaXRlOiBudWxsXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgdmFyIGxvYWRJbWFnZUNhbGxCYWNrID0gZnVuY3Rpb24gKGRhdGEsIGluZGV4LCBlcnJvciwgaW1hZ2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoISBGaXJlLkVuZ2luZS5pc1BsYXlpbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGRhdGEuc21hbGxTcHJpdGUgPSBuZXcgRmlyZS5TcHJpdGUoaW1hZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhpbmRleCwgZGF0YSwgaW1hZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzLCBkYXRhLCBpbmRleCk7XHJcbiAgICAgICAgICAgICAgICAvLyDkuIvovb3lm77niYdcclxuICAgICAgICAgICAgICAgIHNlbGYubG9hZEltYWdlKGRhdGEudXJsLCBsb2FkSW1hZ2VDYWxsQmFjayk7XHJcbiAgICAgICAgICAgICAgICBpbmRleCsrO1xyXG4gICAgICAgICAgICAgICAgLy8g5L+d5a2Y5LqM57qn6I+c5Y2V5pWw5o2uXHJcbiAgICAgICAgICAgICAgICBzZWxmLnNlY29uZGFyeU1lbnVEYXRhU2hlZXRzLnB1c2goZGF0YSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIC8vIOmihOWKoOi9veS4iee6p+iPnOWNlSDljZXlk4HlrrblhbfmlbDmja5cclxuICAgIHByZWxvYWRUaHJlZU1lbnVEYXRhOiBmdW5jdGlvbiAoaWQsIHBhZ2UsIGVhY2gsIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIGlmICghIHNlbGYudGhyZWVNZW51RGF0YVNoZWV0c1tpZF0pIHtcclxuICAgICAgICAgICAgc2VsZi50aHJlZU1lbnVEYXRhU2hlZXRzW2lkXSA9IFtdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoISBzZWxmLnRocmVlTWVudURhdGFUb3RhbFNoZWV0c1tpZF0pe1xyXG4gICAgICAgICAgICBzZWxmLnRocmVlTWVudURhdGFUb3RhbFNoZWV0c1tpZF0gPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgc2VuZERhdGEgPSB7XHJcbiAgICAgICAgICAgIHRpZDogaWQsXHJcbiAgICAgICAgICAgIHBhZ2U6IHBhZ2UsXHJcbiAgICAgICAgICAgIGVhY2g6IGVhY2hcclxuICAgICAgICB9O1xyXG4gICAgICAgIHNlbGYuc25ldFdvcmtNZ3IuUmVxdWVzdFNpbmdsZUl0ZW1zKHNlbmREYXRhLCBmdW5jdGlvbiAoYWxsRGF0YSkge1xyXG4gICAgICAgICAgICBpZiAoISBGaXJlLkVuZ2luZS5pc1BsYXlpbmcpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgdG90YWwgPSBwYXJzZUludChhbGxEYXRhLnRvdGFsKTtcclxuICAgICAgICAgICAgc2VsZi50aHJlZU1lbnVEYXRhVG90YWxTaGVldHNbaWRdID0gdG90YWw7XHJcbiAgICAgICAgICAgIHZhciBkYXRhU2hlZXRzID0gc2VsZi50aHJlZU1lbnVEYXRhU2hlZXRzW2lkXTtcclxuICAgICAgICAgICAgdmFyIGluZGV4ID0gMCwgbG9hZEltYWdlQ291bnQgPSAwO1xyXG4gICAgICAgICAgICBhbGxEYXRhLmxpc3QuZm9yRWFjaChmdW5jdGlvbiAoZGF0YVNoZWV0cywgZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIG1lbnVEYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgICAgIG5hbWU6IGRhdGEucHJvZF9uYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgIHN1aXRfaWQ6IGRhdGEucHJvZF9pZCxcclxuICAgICAgICAgICAgICAgICAgICBwcmljZTogZGF0YS5wcm9kX3ByaWNlLFxyXG4gICAgICAgICAgICAgICAgICAgIGJpZ0ltYWdlVXJsOiBkYXRhLnByb2Rfc291Y2VfdXJsLFxyXG4gICAgICAgICAgICAgICAgICAgIHNhbWxsSW1hZ2VVcmw6IGRhdGEucHJvZF9pbWFnZV91cmwsXHJcbiAgICAgICAgICAgICAgICAgICAgc21hbGxTcHJpdGU6IG51bGwsXHJcbiAgICAgICAgICAgICAgICAgICAgYmlnU3ByaXRlOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50OiBudWxsXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgLy9cclxuICAgICAgICAgICAgICAgIHZhciBsb2FkSW1hZ2VDYWxsQmFjayA9IGZ1bmN0aW9uIChtZW51RGF0YSwgaW5kZXgsIGVycm9yLCBpbWFnZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghRmlyZS5FbmdpbmUuaXNQbGF5aW5nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRJbWFnZUNvdW50Kys7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChsb2FkSW1hZ2VDb3VudCA8IDIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYubG9hZEltYWdlKG1lbnVEYXRhLnNhbWxsSW1hZ2VVcmwsIGxvYWRJbWFnZUNhbGxCYWNrKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIC8vXHJcbiAgICAgICAgICAgICAgICAgICAgbWVudURhdGEuc21hbGxTcHJpdGUgPSBuZXcgRmlyZS5TcHJpdGUoaW1hZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhpZCwgaW5kZXgsIHBhZ2UsIG1lbnVEYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgbG9hZEltYWdlQ291bnQgPSAwO1xyXG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMsIG1lbnVEYXRhLCBpbmRleCk7XHJcbiAgICAgICAgICAgICAgICAvLyDliqDovb3lsI/lm75cclxuICAgICAgICAgICAgICAgIHNlbGYubG9hZEltYWdlKGRhdGEucHJvZF9pbWFnZV91cmwsIGxvYWRJbWFnZUNhbGxCYWNrKTtcclxuICAgICAgICAgICAgICAgIC8vXHJcbiAgICAgICAgICAgICAgICBpbmRleCsrO1xyXG4gICAgICAgICAgICAgICAgLy9cclxuICAgICAgICAgICAgICAgIGRhdGFTaGVldHMucHVzaChtZW51RGF0YSk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzLCBkYXRhU2hlZXRzKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn0pO1xyXG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJzgxMTMzYjZQdk5HVks2dlNtcFVYZTcrJywgJ1NFcnJvclByb21wdFdpbmRvdycpO1xuLy8gc2NyaXB0XFxzaW5nbGVcXFNFcnJvclByb21wdFdpbmRvdy5qc1xuXG52YXIgQ29tcCA9IEZpcmUuQ2xhc3Moe1xyXG4gICAgLy8g57un5om/XHJcbiAgICBleHRlbmRzOiBGaXJlLkNvbXBvbmVudCxcclxuICAgIC8vIOaehOmAoOWHveaVsFxyXG4gICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLm9uQ2FsbEV2ZW50ID0gbnVsbDtcclxuICAgIH0sXHJcbiAgICAvLyDlsZ7mgKdcclxuICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICBjb250ZW50OntcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5UZXh0XHJcbiAgICAgICAgfSxcclxuICAgICAgICBidG5fQ29uZmlybTp7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVUlCdXR0b25cclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOWmguaenElucHV0ZmllbGTlrZjlnKjnmoTor53lsLHpnIDopoHmiorku5blhYjlhbPpl61cclxuICAgICAgICAvLyDlm6DkuLrml6Dms5XmjqfliLblroPnmoTlsYLnuqdcclxuICAgICAgICBpbnB1dF9TYXZlOiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuRW50aXR5XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIOiuvue9ruiwg+eUqOWHveaVsFxyXG4gICAgc2V0Q2FsbEV2ZW50OiBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICB0aGlzLm9uQ2FsbEV2ZW50ID0gZXZlbnQ7XHJcbiAgICB9LFxyXG4gICAgLy8g56Gu5a6a5LqL5Lu2XHJcbiAgICBfb25Db25maXJtRXZlbnQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcclxuICAgICAgICBpZiAodGhpcy5vbkNhbGxFdmVudCkge1xyXG4gICAgICAgICAgICB0aGlzLm9uQ2FsbEV2ZW50KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIOWFs+mXreaXtuinpuWPkeeahOS6i+S7tlxyXG4gICAgb25EaXNhYmxlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKCEgdGhpcy5pbnB1dF9TYXZlLmFjdGl2ZSkge1xyXG4gICAgICAgICAgICB0aGlzLmlucHV0X1NhdmUuYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8g5omT5byA6Kem5Y+R55qE5LqL5Lu2XHJcbiAgICBvbkVuYWJsZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmlucHV0X1NhdmUuYWN0aXZlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5wdXRfU2F2ZS5hY3RpdmUgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy9cclxuICAgIG9uTG9hZDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuYnRuX0NvbmZpcm0ub25DbGljayA9IHRoaXMuX29uQ29uZmlybUV2ZW50LmJpbmQodGhpcyk7XHJcbiAgICB9XHJcbn0pO1xyXG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJ2ExZjhhVkloUGhMZjZTNlZoZzBQeGdjJywgJ1NGdXJuaXR1cmUnKTtcbi8vIHNjcmlwdFxcc2luZ2xlXFxTRnVybml0dXJlLmpzXG5cbnZhciBTRnVybml0dXJlID0gRmlyZS5DbGFzcyh7XHJcbiAgICAvLyDnu6fmib9cclxuICAgIGV4dGVuZHM6IEZpcmUuQ29tcG9uZW50LFxyXG4gICAgLy8g5p6E6YCg5Ye95pWwXHJcbiAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuX3JlbmRlcmVyID0gbnVsbDtcclxuICAgIH0sXHJcbiAgICAvLyDlsZ7mgKdcclxuICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAvLyDlkI3np7BcclxuICAgICAgICB0TmFtZTogJycsXHJcbiAgICAgICAgLy8gSURcclxuICAgICAgICBzdWl0X2lkOiAwLFxyXG4gICAgICAgIC8vIOexu+Wei1xyXG4gICAgICAgIHByb3BUeXBlOiAwLFxyXG4gICAgICAgIC8vIOaYr+WQpuWPr+S7peaLluWKqFxyXG4gICAgICAgIGhhc0RyYWc6IGZhbHNlLFxyXG4gICAgICAgIC8vIOWbvueJh+eahHVybFxyXG4gICAgICAgIGltYWdlVXJsOiAnJyxcclxuICAgICAgICAvLyDovb3lhaXml7bnmoTlm77niYdcclxuICAgICAgICBkZWZhdWx0U3ByaXRlOiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuU3ByaXRlXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIOiuvue9ruWbvueJh1xyXG4gICAgc2V0U3ByaXRlOiBmdW5jdGlvbiAobmV3U3ByaXRlKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9yZW5kZXJlcikge1xyXG4gICAgICAgICAgICB0aGlzLl9yZW5kZXJlciA9IHRoaXMuZW50aXR5LmdldENvbXBvbmVudChGaXJlLlNwcml0ZVJlbmRlcmVyKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fcmVuZGVyZXIuc3ByaXRlID0gbmV3U3ByaXRlO1xyXG4gICAgICAgIHRoaXMuX3JlbmRlcmVyLnNwcml0ZS5waXhlbExldmVsSGl0VGVzdCA9IHRydWU7XHJcbiAgICB9XHJcbn0pO1xyXG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJzFjOWIxZVlKb3RPNDVYS3V5c2JBZmtxJywgJ1NMb2FkaW5nVGlwcycpO1xuLy8gc2NyaXB0XFxzaW5nbGVcXFNMb2FkaW5nVGlwcy5qc1xuXG52YXIgU0xvYWRpbmdUaXBzID0gRmlyZS5DbGFzcyh7XHJcbiAgICAvLyDnu6fmib9cclxuICAgIGV4dGVuZHM6IEZpcmUuQ29tcG9uZW50LFxyXG4gICAgLy8g5p6E6YCg5Ye95pWwXHJcbiAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24gKCkge1xyXG5cclxuICAgIH0sXHJcbiAgICAvLyDlsZ7mgKdcclxuICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICBjb250ZW50OntcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5CaXRtYXBUZXh0XHJcbiAgICAgICAgfSxcclxuICAgICAgICBhbmltOiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuQW5pbWF0aW9uXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIOaJk+W8gOeql+WPo1xyXG4gICAgb3BlblRpcHM6IGZ1bmN0aW9uICh0ZXh0KSB7XHJcbiAgICAgICAgdmFyIHN0YXRlID0gdGhpcy5hbmltLnBsYXkoJ2xvYWRpbmcnKTtcclxuICAgICAgICBzdGF0ZS53cmFwTW9kZSA9IEZpcmUuV3JhcE1vZGUuTG9vcDtcclxuICAgICAgICBzdGF0ZS5yZXBlYXRDb3VudCA9IEluZmluaXR5O1xyXG4gICAgICAgIHRoaXMuZW50aXR5LmFjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgaWYgKHRleHQpIHtcclxuICAgICAgICAgICAgdGhpcy5jb250ZW50LnRleHQgPSB0ZXh0O1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5jb250ZW50LnRleHQgPSAn5Yqg6L295Lit6K+356iN5ZCOLi4uJztcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHNpemUgPSB0aGlzLmNvbnRlbnQuZ2V0V29ybGRTaXplKCk7XHJcbiAgICAgICAgdGhpcy5hbmltLmVudGl0eS50cmFuc2Zvcm0ud29ybGRQb3NpdGlvbiA9IG5ldyBGaXJlLlZlYzIoc2l6ZS54IC8gMiArIDUwLCAwKTtcclxuICAgIH0sXHJcbiAgICAvLyDlhbPpl63nqpflj6NcclxuICAgIGNsb3NlVGlwczogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuYW5pbS5zdG9wKCdsb2FkaW5nJyk7XHJcbiAgICAgICAgdGhpcy5lbnRpdHkuYWN0aXZlID0gZmFsc2U7XHJcbiAgICB9XHJcbn0pO1xyXG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJ2Q4NDQ1RXlFTmxENHFVdVFjM2ZVVG8yJywgJ1NNYWluTWVudU1ncicpO1xuLy8gc2NyaXB0XFxzaW5nbGVcXFNNYWluTWVudU1nci5qc1xuXG4vLyDkuLvoj5zljZUg77yI5oiR6KaB6KOF5omuIOS/neWtmOijheaJriDmiJHnmoToo4Xmia7vvIlcclxudmFyIFNNYWluTWVudU1nciA9IEZpcmUuQ2xhc3Moe1xyXG4gICAgLy8g57un5om/XHJcbiAgICBleHRlbmRzOiBGaXJlLkNvbXBvbmVudCxcclxuICAgIC8vIOaehOmAoOWHveaVsFxyXG4gICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uICgpIHtcclxuICAgIH0sXHJcbiAgICAvLyDlsZ7mgKdcclxuICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAvLyBVSeS4juWxj+W5leeahOmXtOi3nVxyXG4gICAgICAgIG1hcmdpbjoge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBGaXJlLnYyKDcyLCAxNTApXHJcbiAgICAgICAgfSxcclxuICAgICAgICBpbWFnZU1hcmdpbjoge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBGaXJlLnYyKDEyMDAsIDkwMClcclxuICAgICAgICB9LFxyXG4gICAgICAgIHNwYWNpbmc6IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogMTQwXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIOaYr+WQpuijheaJrui/h1xyXG4gICAgX2hhc0RyZXNzVXA6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgaGFzRHJlc3NVcCA9IGZhbHNlO1xyXG4gICAgICAgIHZhciBiZ0NvbXAgPSB0aGlzLnNkYXRhQmFzZS5iZ1JlbmRlci5nZXRDb21wb25lbnQoJ1NGdXJuaXR1cmUnKTtcclxuICAgICAgICBpZiAodGhpcy5zZGF0YUJhc2UuYmdSZW5kZXIuc3ByaXRlICE9PSBiZ0NvbXAuZGVmYXVsdFNwcml0ZSkge1xyXG4gICAgICAgICAgICBoYXNEcmVzc1VwID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIEdkQ29tcCA9IHRoaXMuc2RhdGFCYXNlLmdyb3VuZFJlbmRlci5nZXRDb21wb25lbnQoJ1NGdXJuaXR1cmUnKTtcclxuICAgICAgICBpZiAodGhpcy5zZGF0YUJhc2UuZ3JvdW5kUmVuZGVyLnNwcml0ZSAhPT0gR2RDb21wLmRlZmF1bHRTcHJpdGUpIHtcclxuICAgICAgICAgICAgaGFzRHJlc3NVcCA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBjaGlsZHJlbiA9IHRoaXMuc2RhdGFCYXNlLnJvb20uZ2V0Q2hpbGRyZW4oKTtcclxuICAgICAgICBpZiAoY2hpbGRyZW4ubGVuZ3RoID4gMikge1xyXG4gICAgICAgICAgICBoYXNEcmVzc1VwID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGhhc0RyZXNzVXA7XHJcbiAgICB9LFxyXG4gICAgLy8g5riF56m65Zy65pmvXHJcbiAgICByZXNldFNjcmVlbjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBjaGlsZHJlbiA9IHRoaXMuc2RhdGFCYXNlLnJvb20uZ2V0Q2hpbGRyZW4oKTtcclxuICAgICAgICBpZiAoY2hpbGRyZW4ubGVuZ3RoIDw9IDIpe1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAodmFyIGkgPSAyOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgY2hpbGRyZW5baV0uZGVzdHJveSgpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvLyDmiJHopoHoo4Xmia7kuovku7ZcclxuICAgIF9vbkRvRHJlc3NFdmVudDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9oYXNEcmVzc1VwKCkpIHtcclxuICAgICAgICAgICAgdGhpcy5zZGF0YUJhc2Uuc2NvbnRyb2xNZ3IucmVzZXQoKTtcclxuICAgICAgICAgICAgdGhpcy5zZGF0YUJhc2Uuc3RocmVlTWVudU1nci5jbG9zZU1lbnUoKTtcclxuICAgICAgICAgICAgdGhpcy5zZGF0YUJhc2Uuc3RpcHNXaW5kb3cub3BlbldpbmRvdygn5piv5ZCm5riF56m65Zy65pmvLi4nLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9pbml0U2NyZWVuKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJlc2V0U2NyZWVuKCk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc2RhdGFCYXNlLnNzZWNvbmRhcnlNZW51TWdyLm9wZW5TZWNvbmRhcnlNZW51KCk7XHJcbiAgICAgICAgdGhpcy5zZGF0YUJhc2UuY2hhcmFjdGVycy5lbnRpdHkuYWN0aXZlID0gZmFsc2U7XHJcbiAgICB9LFxyXG4gICAgLy8g5L+d5a2Y6KOF5omu5LqL5Lu2XHJcbiAgICBfb25TYXZlRHJlc3NFdmVudDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuc2RhdGFCYXNlLmNoYXJhY3RlcnMuZW50aXR5LmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuc2RhdGFCYXNlLnNjb250cm9sTWdyLnJlc2V0KCk7XHJcbiAgICAgICAgdGhpcy5zZGF0YUJhc2Uuc3RocmVlTWVudU1nci5jbG9zZU1lbnUoKTtcclxuICAgICAgICB0aGlzLnNkYXRhQmFzZS5zc2F2ZVJvb21XaW5kb3cub3BlbldpbmRvdygpO1xyXG4gICAgfSxcclxuICAgIC8vIOaIkeeahOijheaJruS6i+S7tlxyXG4gICAgX29uTXlEcmVzc0V2ZW50OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5zZGF0YUJhc2UuY2hhcmFjdGVycy5lbnRpdHkuYWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5zZGF0YUJhc2Uuc2NvbnRyb2xNZ3IucmVzZXQoKTtcclxuICAgICAgICB0aGlzLnNkYXRhQmFzZS5zdGhyZWVNZW51TWdyLmNsb3NlTWVudSgpO1xyXG4gICAgICAgIHRoaXMuc2RhdGFCYXNlLnNteURyZXNzVXBXaW5kb3cub3BlbldpbmRvdygpO1xyXG4gICAgfSxcclxuICAgIC8vIOi/lOWbnuWupOWkllxyXG4gICAgX29uR29Ub091dERvb3JFdmVudDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIEZpcmUuRW5naW5lLmxvYWRTY2VuZSgnbGF1bmNoJyk7XHJcbiAgICB9LFxyXG4gICAgLy8g5Yid5aeL5YyW6I+c5Y2VXHJcbiAgICBfaW5pdE1lbnU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgdmFyIGNoaWxkcmVuID0gdGhpcy5lbnRpdHkuZ2V0Q2hpbGRyZW4oKTtcclxuICAgICAgICBzZWxmLl9tZW51TGlzdCA9IFtdO1xyXG4gICAgICAgIGZvcih2YXIgaSA9IDAsIGxlbiA9IGNoaWxkcmVuLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XHJcbiAgICAgICAgICAgIHZhciBlbnQgPSBjaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgdmFyIGJ0biA9IGVudC5nZXRDb21wb25lbnQoRmlyZS5VSUJ1dHRvbik7XHJcbiAgICAgICAgICAgIGlmICghIGJ0bikgeyBjb250aW51ZTsgfVxyXG4gICAgICAgICAgICAvLyDnu5HlrprmjInpkq7kuovku7ZcclxuICAgICAgICAgICAgaWYgKGVudC5uYW1lID09PSBcIjFcIikge1xyXG4gICAgICAgICAgICAgICAgYnRuLm9uQ2xpY2sgPSBzZWxmLl9vbkRvRHJlc3NFdmVudC5iaW5kKHNlbGYpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGVudC5uYW1lID09PSBcIjJcIikge1xyXG4gICAgICAgICAgICAgICAgYnRuLm9uQ2xpY2sgPSBzZWxmLl9vblNhdmVEcmVzc0V2ZW50LmJpbmQoc2VsZik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoZW50Lm5hbWUgPT09IFwiM1wiKSB7XHJcbiAgICAgICAgICAgICAgICBidG4ub25DbGljayA9IHNlbGYuX29uTXlEcmVzc0V2ZW50LmJpbmQoc2VsZik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoZW50Lm5hbWUgPT09IFwiNFwiKSB7XHJcbiAgICAgICAgICAgICAgICBidG4ub25DbGljayA9IHNlbGYuX29uR29Ub091dERvb3JFdmVudC5iaW5kKHNlbGYpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIF9pbml0U2NyZWVuOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5zZGF0YUJhc2UucHJlbG9hZEluaXRTY3JlZW5EYXRhKCk7XHJcbiAgICB9LFxyXG4gICAgLy9cclxuICAgIG9uTG9hZDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIC8vIOmhtemdouWkp+Wwj+WPkeeUn+WPmOWMlueahOaXtuWAmeS8muiwg+eUqOi/meS4quS6i+S7tlxyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICBGaXJlLlNjcmVlbi5vbigncmVzaXplJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgd2lkdGggPSBzZWxmLmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aDtcclxuICAgICAgICAgICAgdmFyIGhlaWdodCA9IHNlbGYuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodDtcclxuICAgICAgICAgICAgaWYgKHdpZHRoIDwgaGVpZ2h0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNkYXRhQmFzZS5zdGlwc1dpbmRvdy5vcGVuV2luZG93KCfmqKrlsY/kvZPpqozmlYjmnpzkvJrmm7Tlpb0uLicpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZGF0YUJhc2Uuc3RpcHNXaW5kb3cuY2xvc2VXaW5kb3coKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICB9LFxyXG5cclxuICAgIHN0YXJ0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9TRGF0YUJhc2UnKTtcclxuICAgICAgICB0aGlzLnNkYXRhQmFzZSA9IGVudC5nZXRDb21wb25lbnQoJ1NEYXRhQmFzZScpO1xyXG4gICAgICAgIC8vXHJcbiAgICAgICAgdmFyIGRvY3VtZW50RWxlbWVudCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcclxuICAgICAgICB2YXIgd2lkdGggPSBkb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGg7XHJcbiAgICAgICAgdmFyIGhlaWdodCA9IGRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQ7XHJcbiAgICAgICAgdGhpcy5kb2N1bWVudEVsZW1lbnQgPSBkb2N1bWVudEVsZW1lbnQ7XHJcbiAgICAgICAgaWYgKHdpZHRoIDwgaGVpZ2h0KSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2RhdGFCYXNlLnN0aXBzV2luZG93Lm9wZW5XaW5kb3coJ+aoquWxj+S9k+mqjOaViOaenOS8muabtOWlvS4uJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIOWIneWni+WMluiPnOWNlVxyXG4gICAgICAgIHRoaXMuX2luaXRNZW51KCk7XHJcbiAgICAgICAgLy8g5Yid5aeL5YyW5Zy65pmvXHJcbiAgICAgICAgdGhpcy5faW5pdFNjcmVlbigpO1xyXG5cclxuICAgICAgICBGaXJlLkVuZ2luZS5wcmVsb2FkU2NlbmUoJ2xhdW5jaCcpO1xyXG4gICAgfSxcclxuXHJcbiAgICAvLyDliLfmlrBcclxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIC8vIOWMuemFjVVJ5YiG6L6o546HXHJcbiAgICAgICAgdmFyIGNhbWVyYSA9IEZpcmUuQ2FtZXJhLm1haW47XHJcbiAgICAgICAgdmFyIHNjcmVlblNpemUgPSBGaXJlLlNjcmVlbi5zaXplLm11bChjYW1lcmEuc2l6ZSAvIEZpcmUuU2NyZWVuLmhlaWdodCk7XHJcbiAgICAgICAgdmFyIG5ld1BvcyA9IEZpcmUudjIoLXNjcmVlblNpemUueCAvIDIgKyB0aGlzLm1hcmdpbi54LCBzY3JlZW5TaXplLnkgLyAyIC0gdGhpcy5tYXJnaW4ueSk7XHJcbiAgICAgICAgdGhpcy5lbnRpdHkudHJhbnNmb3JtLnBvc2l0aW9uID0gbmV3UG9zO1xyXG5cclxuICAgICAgICAvL1xyXG4gICAgICAgIHZhciBjYW1lcmEgPSBGaXJlLkNhbWVyYS5tYWluO1xyXG4gICAgICAgIHZhciBiZ1dvcmxkQm91bmRzID0gdGhpcy5zZGF0YUJhc2UuYmdSZW5kZXIuZ2V0V29ybGRCb3VuZHMoKTtcclxuICAgICAgICB2YXIgYmdMZWZ0VG9wV29ybGRQb3MgPSBuZXcgRmlyZS5WZWMyKGJnV29ybGRCb3VuZHMueE1pbiArIHRoaXMuaW1hZ2VNYXJnaW4ueCwgYmdXb3JsZEJvdW5kcy55TWluICsgdGhpcy5pbWFnZU1hcmdpbi55KTtcclxuICAgICAgICB2YXIgYmdsZWZ0VG9wID0gY2FtZXJhLndvcmxkVG9TY3JlZW4oYmdMZWZ0VG9wV29ybGRQb3MpO1xyXG4gICAgICAgIHZhciBzY3JlZW5Qb3MgPSBuZXcgRmlyZS5WZWMyKGJnbGVmdFRvcC54LCBiZ2xlZnRUb3AueSk7XHJcbiAgICAgICAgdmFyIHdvcmxkUG9zID0gY2FtZXJhLnNjcmVlblRvV29ybGQoc2NyZWVuUG9zKTtcclxuICAgICAgICB0aGlzLnNkYXRhQmFzZS5jaGFyYWN0ZXJzLmVudGl0eS50cmFuc2Zvcm0ud29ybGRQb3NpdGlvbiA9IHdvcmxkUG9zO1xyXG5cclxuICAgIH1cclxufSk7XHJcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnOWM4YzJkSmhMcENXYlVQM0h3MGtDem4nLCAnU015RHJlc3NVcERhdGEnKTtcbi8vIHNjcmlwdFxcc2luZ2xlXFxTTXlEcmVzc1VwRGF0YS5qc1xuXG52YXIgU015RHJlc3NVcERhdGEgPSBGaXJlLkNsYXNzKHtcclxuICAgIC8vIOe7p+aJv1xyXG4gICAgZXh0ZW5kczogRmlyZS5Db21wb25lbnQsXHJcbiAgICAvLyDmnoTpgKDlh73mlbBcclxuICAgIGNvbnRydWN0b3I6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAvLyBJRFxyXG4gICAgICAgIHRoaXMuc3VpdF9pZCA9IC0xO1xyXG4gICAgICAgIC8vIOWQjeensFxyXG4gICAgICAgIHRoaXMubXlEcmVzc1VwTmFtZSA9ICcnO1xyXG4gICAgfSxcclxuICAgIC8vIOWxnuaAp1xyXG4gICAgcHJvcGVydGllczoge1xyXG4gICAgICAgIC8vIOe8luWPt1xyXG4gICAgICAgIHNlcmlhbE51bWJlcjoge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlRleHRcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOWQjeensFxyXG4gICAgICAgIHJvb21OYW1lOiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVGV4dFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g57G75Z6LXHJcbiAgICAgICAgcm9vbVR5cGU6IDAsXHJcbiAgICAgICAgLy8g57G75Z6L5paH5a2XXHJcbiAgICAgICAgcm9vbVR5cGVUZXh0OiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVGV4dFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g5omT5byA6KOF5omuXHJcbiAgICAgICAgYnRuX29wZW5Sb29tOiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVUlCdXR0b25cclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOWIoOmZpOijheaJrlxyXG4gICAgICAgIGJ0bl9kZWxldGVSb29tOiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVUlCdXR0b25cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8g6YeN572u5a625YW3XHJcbiAgICByZXNldE1lbnU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLnNlcmlhbE51bWJlci50ZXh0ID0gJyc7XHJcbiAgICAgICAgdGhpcy5yb29tTmFtZS50ZXh0ID0gJyc7XHJcbiAgICAgICAgdGhpcy5yb29tVHlwZSA9IDA7XHJcbiAgICAgICAgdGhpcy5yb29tVHlwZVRleHQudGV4dCA9ICcnO1xyXG4gICAgICAgIHRoaXMuYnRuX29wZW5Sb29tLm9uQ2xpY2sgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuYnRuX2RlbGV0ZVJvb20ub25DbGljayA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5lbnRpdHkuYWN0aXZlID0gZmFsc2U7XHJcbiAgICB9LFxyXG4gICAgLy8g5Yid5aeL5YyWXHJcbiAgICByZWZyZXNoOiBmdW5jdGlvbiAoZGF0YSwgb3BlblJvb21FdmVudCwgZGVsZXRlUm9vbUV2ZW50KSB7XHJcbiAgICAgICAgdGhpcy5zdWl0X2lkID0gZGF0YS5pZDtcclxuICAgICAgICB0aGlzLm15RHJlc3NVcE5hbWUgPSBkYXRhLm5hbWU7XHJcbiAgICAgICAgdGhpcy5lbnRpdHkubmFtZSA9IHRoaXMuc3VpdF9pZDtcclxuICAgICAgICB0aGlzLnNlcmlhbE51bWJlci50ZXh0ID0gdGhpcy5zdWl0X2lkO1xyXG4gICAgICAgIHRoaXMucm9vbU5hbWUudGV4dCA9IHRoaXMubXlEcmVzc1VwTmFtZTtcclxuICAgICAgICB0aGlzLnJvb21UeXBlID0gZGF0YS50eXBlO1xyXG4gICAgICAgIHRoaXMucm9vbVR5cGVUZXh0LnRleHQgPSBkYXRhLnR5cGVOYW1lO1xyXG4gICAgICAgIGlmIChvcGVuUm9vbUV2ZW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMuYnRuX29wZW5Sb29tLm9uQ2xpY2sgPSBvcGVuUm9vbUV2ZW50O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZGVsZXRlUm9vbUV2ZW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMuYnRuX2RlbGV0ZVJvb20ub25DbGljayA9IGRlbGV0ZVJvb21FdmVudDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0pO1xyXG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJzc1YzE4c0xpVHRMSlpMbzV5WTNpNWJyJywgJ1NNeURyZXNzVXBXaW5kb3cnKTtcbi8vIHNjcmlwdFxcc2luZ2xlXFxTTXlEcmVzc1VwV2luZG93LmpzXG5cbi8vIOijheaJruWIl+ihqOeql+WPo1xyXG52YXIgTXlEcmVzc1VwV2luZG93ID0gRmlyZS5DbGFzcyh7XHJcbiAgICAvLyDnu6fmib9cclxuICAgIGV4dGVuZHM6IEZpcmUuQ29tcG9uZW50LFxyXG4gICAgLy8g5p6E6YCg5Ye95pWwXHJcbiAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuX3Nob3dOdW0gPSA2O1xyXG4gICAgICAgIHRoaXMuX2N1clBhZ2UgPSAxO1xyXG4gICAgICAgIHRoaXMuX21heFBhZ2UgPSAwO1xyXG4gICAgICAgIHRoaXMuX215RHJlc3NVcFRvdGFsID0gMDtcclxuICAgICAgICAvLyDoo4Xmia7lrrnlmajliJfooahcclxuICAgICAgICB0aGlzLmRyZXNzVXBFbnRpdHlTaGVldHMgPSBbXTtcclxuICAgICAgICAvLyDov5vlhaXoo4Xmia5cclxuICAgICAgICB0aGlzLmJpbmRSZWFkRGF0YUV2ZW50ID0gdGhpcy5fb25SZWFkRGF0YUV2ZW50LmJpbmQodGhpcyk7XHJcbiAgICAgICAgLy8g5Yig6Zmk6KOF5omuXHJcbiAgICAgICAgdGhpcy5iaW5kRGVsRGF0YUV2ZW50ID0gdGhpcy5fb25EZWxIb21lRGF0YUV2ZW50LmJpbmQodGhpcyk7XHJcbiAgICB9LFxyXG4gICAgLy8g5bGe5oCnXHJcbiAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgLy8g5qC56IqC54K5XHJcbiAgICAgICAgcm9vdE5vZGU6IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5FbnRpdHlcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOWFs+mXreeql+WPo1xyXG4gICAgICAgIGJ0bl9DbG9zZToge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlVJQnV0dG9uXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDkuIvkuIDpobVcclxuICAgICAgICBidG5fTmV4dDoge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlVJQnV0dG9uXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDkuIrkuIDpobVcclxuICAgICAgICBidG5fUHJldmlvdXM6IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5VSUJ1dHRvblxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g5Yig6Zmk5omA5pyJ5oi/6Ze05pWw5o2uXHJcbiAgICAgICAgYnRuX3JlbW92ZUFsbDoge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlVJQnV0dG9uXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDlvZPliY3oo4Xmia7nmoTmiL/pl7RcclxuICAgICAgICBjdXJTZWxlY3RSb29tOiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVGV4dFxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvLyDlhbPpl63nqpflj6NcclxuICAgIF9vbkNsb3NlV2luZG93RXZlbnQ6IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgIHRoaXMuY2xvc2VXaW5kb3coKTtcclxuICAgIH0sXHJcbiAgICAvLyDmm7TmlrDmjInpkq7nirbmgIFcclxuICAgIF91cGRhdGVCdXR0b25TdGF0ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuYnRuX1ByZXZpb3VzLmVudGl0eS5hY3RpdmUgPSB0aGlzLl9jdXJQYWdlID4gMTtcclxuICAgICAgICB0aGlzLmJ0bl9OZXh0LmVudGl0eS5hY3RpdmUgPSB0aGlzLl9jdXJQYWdlIDwgdGhpcy5fbWF4UGFnZTtcclxuICAgIH0sXHJcbiAgICAvLyDkuIrkuIDpobVcclxuICAgIF9vblByZXZpb3VzUGFnZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuX2N1clBhZ2UgLT0gMTtcclxuICAgICAgICBpZiAodGhpcy5fY3VyUGFnZSA8IDEpe1xyXG4gICAgICAgICAgICB0aGlzLl9jdXJQYWdlID0gMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fcmVmcmVzaE15RHJlc3NMaXN0KCk7XHJcbiAgICB9LFxyXG4gICAgLy8g5LiL5LiA6aG1XHJcbiAgICBfb25OZXh0UGFnZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuX2N1clBhZ2UgKz0gMTtcclxuICAgICAgICBpZiAodGhpcy5fY3VyUGFnZSA+IHRoaXMuX21heFBhZ2Upe1xyXG4gICAgICAgICAgICB0aGlzLl9jdXJQYWdlID0gdGhpcy5fbWF4UGFnZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fcmVmcmVzaE15RHJlc3NMaXN0KCk7XHJcbiAgICB9LFxyXG4gICAgLy8g6L295YWl5Y2V5Liq5oi/6Ze05pWw5o2uXHJcbiAgICBfb25SZWFkRGF0YUV2ZW50OiBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICB2YXIgY29tcCA9IGV2ZW50LnRhcmdldC5wYXJlbnQuZ2V0Q29tcG9uZW50KCdTTXlEcmVzc1VwRGF0YScpO1xyXG4gICAgICAgIHRoaXMubG9hZEhvbWVEYXRhKGNvbXAuc3VpdF9pZCk7XHJcbiAgICAgICAgdGhpcy5jdXJTZWxlY3RSb29tLnRleHQgPSAn5b2T5YmN6KOF5omuOiAnICsgY29tcC5teURyZXNzVXBOYW1lO1xyXG4gICAgfSxcclxuICAgIC8vIOWIoOmZpOaJgOacieaIv+mXtOaVsOaNrlxyXG4gICAgX29uUmVtb3ZlQWxsUm9vbURhdGFFdmVudDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuc2RhdGFCYXNlLmxvYWRSZWZyZXNoTXlEcmVzc1VwRGF0YSgtMSwgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLl9jdXJQYWdlID0gMTtcclxuICAgICAgICAgICAgdGhpcy5fcmVmcmVzaE15RHJlc3NMaXN0KCk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgIH0sXHJcbiAgICAvLyDliKDpmaTmiL/pl7TmlbDmja5cclxuICAgIF9vbkRlbEhvbWVEYXRhRXZlbnQ6IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgIHZhciBpZCA9IHBhcnNlSW50KGV2ZW50LnRhcmdldC5wYXJlbnQubmFtZSk7XHJcbiAgICAgICAgdGhpcy5zZGF0YUJhc2UubG9hZFJlZnJlc2hNeURyZXNzVXBEYXRhKGlkLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlZnJlc2hNeURyZXNzTGlzdCgpO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICB9LFxyXG4gICAgLy8g6L295YWl5oi/6Ze05pWw5o2uXHJcbiAgICBsb2FkSG9tZURhdGE6IGZ1bmN0aW9uIChpZCkge1xyXG4gICAgICAgIHRoaXMuc2RhdGFCYXNlLnNtYWluTWVudU1nci5yZXNldFNjcmVlbigpO1xyXG4gICAgICAgIHRoaXMuc2RhdGFCYXNlLnNuZXRXb3JrTWdyLlJlcXVlc3RIb21lRGF0YSh7c3VpdF9pZDogaWR9LCBmdW5jdGlvbiAoaG9tZURhdGEpIHtcclxuICAgICAgICAgICAgaG9tZURhdGEubGlzdC5mb3JFYWNoKGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZW50aXR5ID0gbnVsbCwgZnVybml0dXJlID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIHZhciBwcm9wc1R5cGUgPSBwYXJzZUludChkYXRhLnByb3BzVHlwZSk7XHJcbiAgICAgICAgICAgICAgICBpZiAocHJvcHNUeXBlID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZW50aXR5ID0gdGhpcy5zZGF0YUJhc2Uucm9vbS5maW5kKCdiYWNrZ3JvdW5kJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmIChwcm9wc1R5cGUgPT09IDIpIHtcclxuICAgICAgICAgICAgICAgICAgICBlbnRpdHkgPSB0aGlzLnNkYXRhQmFzZS5yb29tLmZpbmQoJ2dyb3VuZCcpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZW50aXR5ID0gRmlyZS5pbnN0YW50aWF0ZSh0aGlzLnNkYXRhQmFzZS50ZW1wRnVybml0dXJlKTtcclxuICAgICAgICAgICAgICAgICAgICBlbnRpdHkucGFyZW50ID0gdGhpcy5zZGF0YUJhc2Uucm9vbTtcclxuICAgICAgICAgICAgICAgICAgICBlbnRpdHkubmFtZSA9IGRhdGEucHJvcHNOYW1lO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIOiuvue9ruWdkOagh1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBuZXdWZWMyID0gbmV3IEZpcmUuVmVjMigpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBzdHIgPSBkYXRhLnBvcy5zcGxpdChcIjpcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgbmV3VmVjMi54ID0gcGFyc2VGbG9hdChzdHJbMF0pO1xyXG4gICAgICAgICAgICAgICAgICAgIG5ld1ZlYzIueSA9IHBhcnNlRmxvYXQoc3RyWzFdKTtcclxuICAgICAgICAgICAgICAgICAgICBlbnRpdHkudHJhbnNmb3JtLnBvc2l0aW9uID0gbmV3VmVjMjtcclxuICAgICAgICAgICAgICAgICAgICAvLyDorr7nva7op5LluqZcclxuICAgICAgICAgICAgICAgICAgICBlbnRpdHkudHJhbnNmb3JtLnJvdGF0aW9uID0gZGF0YS5yb3RhdGlvbjtcclxuICAgICAgICAgICAgICAgICAgICAvLyDorr7nva7lpKflsI9cclxuICAgICAgICAgICAgICAgICAgICBzdHIgPSBkYXRhLnNjYWxlLnNwbGl0KFwiOlwiKTtcclxuICAgICAgICAgICAgICAgICAgICBuZXdWZWMyLnggPSBwYXJzZUZsb2F0KHN0clswXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgbmV3VmVjMi55ID0gcGFyc2VGbG9hdChzdHJbMV0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGVudGl0eS50cmFuc2Zvcm0uc2NhbGUgPSBuZXdWZWMyO1xyXG4gICAgICAgICAgICAgICAgICAgIGZ1cm5pdHVyZSA9IGVudGl0eS5nZXRDb21wb25lbnQoJ1NGdXJuaXR1cmUnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGZ1cm5pdHVyZSA9IGVudGl0eS5nZXRDb21wb25lbnQoJ1NGdXJuaXR1cmUnKTtcclxuICAgICAgICAgICAgICAgIGZ1cm5pdHVyZS5wcm9wc1R5cGUgPSBwcm9wc1R5cGU7XHJcbiAgICAgICAgICAgICAgICBmdXJuaXR1cmUuaGFzRHJhZyA9IHByb3BzVHlwZSA+IDI7XHJcbiAgICAgICAgICAgICAgICBmdXJuaXR1cmUuc3VpdF9pZCA9IGRhdGEuaWQ7XHJcbiAgICAgICAgICAgICAgICBmdXJuaXR1cmUuYmlnSW1hZ2VVcmwgPSBkYXRhLmltZ1VybDtcclxuICAgICAgICAgICAgICAgIGlmIChkYXRhLmltZ1VybCkge1xyXG4gICAgICAgICAgICAgICAgICAgIEZpcmUuX0ltYWdlTG9hZGVyKGRhdGEuaW1nVXJsLCBmdW5jdGlvbiAoZnVybml0dXJlLCBlcnJvciwgaW1hZ2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycm9yKXtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbmV3U3ByaXRlID0gbmV3IEZpcmUuU3ByaXRlKGltYWdlKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZnVybml0dXJlLnNldFNwcml0ZShuZXdTcHJpdGUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzLCBmdXJuaXR1cmUpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgICAgICAgICAgdGhpcy5jbG9zZVdpbmRvdygpO1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICB9LFxyXG4gICAgLy8g6YeN572u6KOF5omu5a655Zmo5YiX6KGoXHJcbiAgICBfcmVzZXRNeURyZXNzRW50aXR5U2hlZXRzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZHJlc3NVcEVudGl0eVNoZWV0cy5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICB2YXIgY29tcCA9IHRoaXMuZHJlc3NVcEVudGl0eVNoZWV0c1tpXTtcclxuICAgICAgICAgICAgY29tcC5yZXNldE1lbnUoKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8g5Yi35paw6KOF5omu5pWw5o2u5YiX6KGoXHJcbiAgICBfcmVmcmVzaE15RHJlc3NMaXN0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIC8vIOmHjee9ruijheaJruWuueWZqOWIl+ihqFxyXG4gICAgICAgIHNlbGYuX3Jlc2V0TXlEcmVzc0VudGl0eVNoZWV0cygpO1xyXG4gICAgICAgIC8vIOiOt+WPluaAu+aVsOW5tuS4lOiuoeeul+acgOWkp+mhteaVsFxyXG4gICAgICAgIGlmIChzZWxmLl9teURyZXNzVXBUb3RhbCAhPT0gc2VsZi5zZGF0YUJhc2UubXlEcmVzc1VwVG90YWwpIHtcclxuICAgICAgICAgICAgc2VsZi5fbXlEcmVzc1VwVG90YWwgPSBzZWxmLnNkYXRhQmFzZS5teURyZXNzVXBUb3RhbDtcclxuICAgICAgICAgICAgc2VsZi5fbWF4UGFnZSA9IE1hdGgucm91bmQoc2VsZi5fbXlEcmVzc1VwVG90YWwgLyBzZWxmLl9zaG93TnVtKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8g5pu05paw5oyJ6ZKu54q25oCBXHJcbiAgICAgICAgc2VsZi5fdXBkYXRlQnV0dG9uU3RhdGUoKTtcclxuICAgICAgICAvLyDlpoLmnpzmgLvmlbDnrYnkuo4w55qE6K+d5bCx5LiN6ZyA6KaB5pi+56S65LqGXHJcbiAgICAgICAgaWYgKHNlbGYuX215RHJlc3NVcFRvdGFsID09PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHN0YXJ0TnVtID0gKHNlbGYuX2N1clBhZ2UgLSAxKSAqIHNlbGYuX3Nob3dOdW07XHJcbiAgICAgICAgdmFyIGVuZE51bSA9IHN0YXJ0TnVtICsgc2VsZi5fc2hvd051bTtcclxuICAgICAgICBpZiAoZW5kTnVtID4gc2VsZi5fbXlEcmVzc1VwVG90YWwpIHtcclxuICAgICAgICAgICAgZW5kTnVtID0gc2VsZi5fbXlEcmVzc1VwVG90YWw7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBkYXRhU2hlZXRzID0gc2VsZi5zZGF0YUJhc2UubXlEcmVzc1VwRGF0YVNoZWV0cztcclxuICAgICAgICB2YXIgaW5kZXggPSAwO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSBzdGFydE51bTsgaSA8IGVuZE51bTsgKytpKSB7XHJcbiAgICAgICAgICAgIHZhciBtZW51ID0gc2VsZi5kcmVzc1VwRW50aXR5U2hlZXRzW2luZGV4XTtcclxuICAgICAgICAgICAgbWVudS5lbnRpdHkuYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICAgICAgaW5kZXgrKztcclxuICAgICAgICAgICAgdmFyIG15RHJlc3NVcERhdGEgPSBkYXRhU2hlZXRzW2ldO1xyXG4gICAgICAgICAgICBpZiAoIW15RHJlc3NVcERhdGEpIHtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG1lbnUucmVmcmVzaChteURyZXNzVXBEYXRhLCBzZWxmLmJpbmRSZWFkRGF0YUV2ZW50LCBzZWxmLmJpbmREZWxEYXRhRXZlbnQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyDliKTmlq3mmK/lkKbpnIDopoHpooTliqDovb3kuIvkuIDpobVcclxuICAgICAgICB2YXIgbGVuID0gZGF0YVNoZWV0cy5sZW5ndGg7XHJcbiAgICAgICAgaWYgKGxlbiA9PT0gc2VsZi5fbXlEcmVzc1VwVG90YWwpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyDpooTliqDovb3kuIvkuIDpobVcclxuICAgICAgICB2YXIgbmV4dFBhZ2UgPSBzZWxmLl9jdXJQYWdlICsgMTtcclxuICAgICAgICBzZWxmLnNkYXRhQmFzZS5wcmVsb2FkTXlEcmVzc1VwRGF0YShuZXh0UGFnZSwgc2VsZi5fc2hvd051bSk7XHJcbiAgICB9LFxyXG4gICAgLy8g5Yib5bu66KOF5omu5YiX6KGo5a655ZmoXHJcbiAgICBfY3JlYXRlTXlEcmVzc1VwRW50aXR5U2hlZXRzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9zaG93TnVtOyArK2kpIHtcclxuICAgICAgICAgICAgdmFyIGVudCA9IEZpcmUuaW5zdGFudGlhdGUodGhpcy5zZGF0YUJhc2UudGVtcE15RHJlc3NVcERhdGEpO1xyXG4gICAgICAgICAgICBlbnQucGFyZW50ID0gdGhpcy5yb290Tm9kZTtcclxuICAgICAgICAgICAgZW50LnRyYW5zZm9ybS5wb3NpdGlvbiA9IG5ldyBGaXJlLlZlYzIoMCwgLWkgKiA4MCk7XHJcbiAgICAgICAgICAgIHZhciBtZW51ID0gZW50LmdldENvbXBvbmVudCgnU015RHJlc3NVcERhdGEnKTtcclxuICAgICAgICAgICAgdmFyIG15RHJlc3NVcERhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICBpZDogLTEsXHJcbiAgICAgICAgICAgICAgICBuYW1lOiAn6L295YWl5LitLicsXHJcbiAgICAgICAgICAgICAgICB0eXBlOiAtMSxcclxuICAgICAgICAgICAgICAgIHR5cGVOYW1lOiAn6L295YWl5LitLicsXHJcbiAgICAgICAgICAgICAgICBpc0RyZXNzOiAtMVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBtZW51LnJlZnJlc2gobXlEcmVzc1VwRGF0YSwgdGhpcy5iaW5kUmVhZERhdGFFdmVudCwgdGhpcy5iaW5kRGVsRGF0YUV2ZW50KTtcclxuICAgICAgICAgICAgdGhpcy5kcmVzc1VwRW50aXR5U2hlZXRzLnB1c2gobWVudSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIOaJk+W8gOeql+WPo1xyXG4gICAgb3BlbldpbmRvdzogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuZW50aXR5LmFjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5zZGF0YUJhc2UuY2hlY2tpbmdNeURyZXNzVXBEYXRhKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5fcmVmcmVzaE15RHJlc3NMaXN0KCk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgIH0sXHJcbiAgICAvLyDlhbPpl63nqpflj6NcclxuICAgIGNsb3NlV2luZG93OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5fY3VyUGFnZSA9IDE7XHJcbiAgICAgICAgdGhpcy5fbWF4UGFnZSA9IDA7XHJcbiAgICAgICAgdGhpcy5fbXlEcmVzc1VwVG90YWwgPSAwO1xyXG4gICAgICAgIHRoaXMuZW50aXR5LmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgfSxcclxuICAgIC8vXHJcbiAgICBzdGFydDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBlbnQgPSBGaXJlLkVudGl0eS5maW5kKCcvU0RhdGFCYXNlJyk7XHJcbiAgICAgICAgdGhpcy5zZGF0YUJhc2UgPSBlbnQuZ2V0Q29tcG9uZW50KCdTRGF0YUJhc2UnKTtcclxuICAgICAgICAvL1xyXG4gICAgICAgIHRoaXMuY3VyU2VsZWN0Um9vbS50ZXh0ID0gJ+W9k+WJjeijheaJrjog5pegJztcclxuICAgICAgICAvLyDnu5Hlrprkuovku7ZcclxuICAgICAgICB0aGlzLmJ0bl9QcmV2aW91cy5lbnRpdHkuYWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5idG5fTmV4dC5lbnRpdHkuYWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5idG5fUHJldmlvdXMub25DbGljayA9IHRoaXMuX29uUHJldmlvdXNQYWdlLmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5idG5fTmV4dC5vbkNsaWNrID0gdGhpcy5fb25OZXh0UGFnZS5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuYnRuX0Nsb3NlLm9uQ2xpY2sgPSB0aGlzLl9vbkNsb3NlV2luZG93RXZlbnQuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLmJ0bl9yZW1vdmVBbGwub25DbGljayA9IHRoaXMuX29uUmVtb3ZlQWxsUm9vbURhdGFFdmVudC5iaW5kKHRoaXMpO1xyXG4gICAgICAgIC8vIOmihOWKoOi9veaIkeeahOijheaJruaVsOaNrlxyXG4gICAgICAgIHRoaXMuc2RhdGFCYXNlLnByZWxvYWRNeURyZXNzVXBEYXRhKHRoaXMuX2N1clBhZ2UsIHRoaXMuX3Nob3dOdW0pO1xyXG4gICAgICAgIC8vIOWIm+W7uuijheaJruWIl+ihqOWuueWZqFxyXG4gICAgICAgIHRoaXMuX2NyZWF0ZU15RHJlc3NVcEVudGl0eVNoZWV0cygpO1xyXG4gICAgfVxyXG59KTtcclxuXG5GaXJlLl9SRnBvcCgpOyIsIkZpcmUuX1JGcHVzaChtb2R1bGUsICdmM2E4ZEUwZVVCUEFxL2dHdHRsMXR0QicsICdTTmV0d29ya01ncicpO1xuLy8gc2NyaXB0XFxzaW5nbGVcXFNOZXR3b3JrTWdyLmpzXG5cbi8vIOi0n+i0o+S4juacjeWKoeWZqOmAmuS/oVxyXG52YXIgU05ldHdvcmtNZ3IgPSBGaXJlLkNsYXNzKHtcclxuICAgIC8vIOe7p+aJv1xyXG4gICAgZXh0ZW5kczogRmlyZS5Db21wb25lbnQsXHJcbiAgICAvLyDmnoTpgKDlh73mlbBcclxuICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgLy8g5b2T5YmN6K+35rGC5pWw5o2uXHJcbiAgICAgICAgdGhpcy5fcG9zdERhdGEgPSB7fTtcclxuICAgICAgICB0aGlzLndpbl9FcnJvclByb21wdENvbXAgPSBudWxsO1xyXG4gICAgICAgIC8vIOeUqOS6jua1i+ivleeahHRva2Vu5pWw5o2uXHJcbiAgICAgICAgdGhpcy50b2tlbiA9IG51bGw7XHJcbiAgICB9LFxyXG4gICAgLy8g5bGe5oCnXHJcbiAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgLy8g5pys5Zyw5rWL6K+VXHJcbiAgICAgICAgbG9jYWxUZXN0OiBmYWxzZSxcclxuICAgICAgICAvLyDov57mjqXlpLHotKXmj5DnpLrnqpflj6NcclxuICAgICAgICB3aW5fRXJyb3JQcm9tcHQ6IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5FbnRpdHlcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8g5byA5aeL5pe2XHJcbiAgICBvbkxvYWQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL1NEYXRhQmFzZScpO1xyXG4gICAgICAgIHRoaXMuc2RhdGFCYXNlID0gZW50LmdldENvbXBvbmVudCgnU0RhdGFCYXNlJyk7XHJcbiAgICAgICAgLy8g6I635Y+W55So5oi35L+h5oGvXHJcbiAgICAgICAgdGhpcy5nZXRUb0tlblZhbHVlKCk7XHJcbiAgICB9LFxyXG4gICAgLy8g6I635Y+W55So5oi35L+h5oGvXHJcbiAgICBnZXRUb0tlblZhbHVlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMubG9jYWxUZXN0KSB7XHJcbiAgICAgICAgICAgIHRoaXMudG9rZW4gPSAnTVRBd01UUTVNalk0TlY4eFlXRXpZekZrTm1FMFpXSTNZemxrTm1ReFltSm1ORGM0TlRObVpqaGtNMTh4TkRNMk16STJNemMyWDNkaGNBJztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgdGhpcy50b2tlbiA9IHRoaXMuZ2V0UXVlcnlTdHJpbmcoJ3Rva2VuJyk7XHJcbiAgICAgICAgICAgIGlmICghdGhpcy50b2tlbil7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIlRvS2VuIGlzIG51bGxcIik7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICB9LFxyXG4gICAgLy8g6K+35rGC5aSx6LSl5Zue6LCDXHJcbiAgICBlcnJvckNhbGxCYWNrOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKCEgdGhpcy53aW5fRXJyb3JQcm9tcHRDb21wKSB7XHJcbiAgICAgICAgICAgIHZhciBjb21wID0gdGhpcy53aW5fRXJyb3JQcm9tcHQuZ2V0Q29tcG9uZW50KCdFcnJvclByb21wdFdpbmRvdycpO1xyXG4gICAgICAgICAgICB0aGlzLndpbl9FcnJvclByb21wdENvbXAgPSBjb21wO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgdGhpcy53aW5fRXJyb3JQcm9tcHRDb21wLnNldENhbGxFdmVudChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHNlbGYuc2VuZERhdGFUb1NlcnZlcihzZWxmLl9wb3N0RGF0YSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdGhpcy53aW5fRXJyb3JQcm9tcHQuYWN0aXZlID0gdHJ1ZTtcclxuICAgIH0sXHJcbiAgICAvLyDnlKhKU+iOt+WPluWcsOWdgOagj+WPguaVsOeahOaWueazlVxyXG4gICAgZ2V0UXVlcnlTdHJpbmc6IGZ1bmN0aW9uKG5hbWUpIHtcclxuICAgICAgICB2YXIgcmVnID0gbmV3IFJlZ0V4cChcIihefCYpXCIgKyBuYW1lICsgXCI9KFteJl0qKSgmfCQpXCIpO1xyXG4gICAgICAgIHZhciByID0gd2luZG93LmxvY2F0aW9uLnNlYXJjaC5zdWJzdHIoMSkubWF0Y2gocmVnKTtcclxuICAgICAgICBpZiAociAhPT0gbnVsbCl7XHJcbiAgICAgICAgICAgIHJldHVybiB1bmVzY2FwZShyWzJdKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9LFxyXG4gICAgLy8g6I635Y+W5pWw5o2uXHJcbiAgICBzZW5kRGF0YVRvU2VydmVyOiBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgIGlmICghIHRoaXMuZ2V0VG9LZW5WYWx1ZSgpKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy90aGlzLnNkYXRhQmFzZS5zbG9hZGluZ1RpcHMub3BlblRpcHMoKTtcclxuICAgICAgICB0aGlzLl9wb3N0RGF0YSA9IGRhdGE7XHJcbiAgICAgICAgdGhpcy5qUXVlcnlBamF4KGRhdGEudXJsLCBkYXRhLnNlbmREYXRhLCBkYXRhLmNiLCBkYXRhLmVyckNiKTtcclxuICAgIH0sXHJcbiAgICAvLyDkuI7mnI3liqHlmajpgJrkv6FcclxuICAgIGpRdWVyeUFqYXg6IGZ1bmN0aW9uIChzdHJVcmwsIGRhdGEsIGNhbGxCYWNrLCBlcnJvckNhbGxCYWNrKSB7XHJcbiAgICAgICAgdmFyIHBhcmFtcyA9IFwiXCI7XHJcbiAgICAgICAgaWYgKHR5cGVvZihkYXRhKSA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgICAgICBmb3IgKHZhciBrZXkgaW4gZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgcGFyYW1zICs9IChrZXkgKyBcIj1cIiArIGRhdGFba2V5XSArIFwiJlwiICApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHBhcmFtcyArPSBcIiZ0b2tlbj1cIiArIHRoaXMudG9rZW47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBwYXJhbXMgPSBkYXRhICsgXCImdG9rZW49XCIgKyB0aGlzLnRva2VuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgdmFyIHNlbmQgPSB7XHJcbiAgICAgICAgICAgIHR5cGU6IFwiUE9TVFwiLFxyXG4gICAgICAgICAgICB1cmw6IHN0clVybCArIFwiPyZqc29uY2FsbFBQPT9cIixcclxuICAgICAgICAgICAgZGF0YTogcGFyYW1zLFxyXG4gICAgICAgICAgICBkYXRhVHlwZTogJ2pzb25wJyxcclxuICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgIC8vaWYgKHNlbGYuc2RhdGFCYXNlKSB7XHJcbiAgICAgICAgICAgICAgICAvLyAgICBzZWxmLnNkYXRhQmFzZS5zbG9hZGluZ1RpcHMuY2xvc2VUaXBzKCk7XHJcbiAgICAgICAgICAgICAgICAvL31cclxuICAgICAgICAgICAgICAgIGlmIChjYWxsQmFjaykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxCYWNrKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBlcnJvcjogZnVuY3Rpb24gKFhNTEh0dHBSZXF1ZXN0LCB0ZXh0U3RhdHVzLCBlcnJvclRocm93bikge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5zZGF0YUJhc2Uuc2xvYWRpbmdUaXBzLmNsb3NlVGlwcygpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGVycm9yQ2FsbEJhY2spIHtcclxuICAgICAgICAgICAgICAgICAgICBlcnJvckNhbGxCYWNrKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvclRocm93bik7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhYTUxIdHRwUmVxdWVzdCk7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0ZXh0U3RhdHVzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgalF1ZXJ5LmFqYXgoc2VuZCk7XHJcbiAgICB9LFxyXG4gICAgLy8g6K+35rGC5Yid5aeL5YyW5oi/6Ze05pWw5o2uXHJcbiAgICBSZXF1ZXN0SW5pdEhvbWU6IGZ1bmN0aW9uIChjYWxsYmFjaykge1xyXG4gICAgICAgIHZhciBwb3N0RGF0YSA9IHtcclxuICAgICAgICAgICAgdXJsOiAnaHR0cDovL20uc2Fpa2UuY29tL2hvdXNlZHJlc3MvZGVmYXVsdFNpbmdsZS5odG1sJyxcclxuICAgICAgICAgICAgc2VuZERhdGE6IHt9LFxyXG4gICAgICAgICAgICBjYjogY2FsbGJhY2ssXHJcbiAgICAgICAgICAgIGVyckNiOiB0aGlzLmVycm9yQ2FsbEJhY2suYmluZCh0aGlzKVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5zZW5kRGF0YVRvU2VydmVyKHBvc3REYXRhKTtcclxuICAgIH0sXHJcbiAgICAvLyDor7fmsYLkuoznuqfoj5zljZXliJfooahcclxuICAgIFJlcXVlc3RTZWNvbmRhcnlNZW51RGF0YTogZnVuY3Rpb24gKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgdmFyIHBvc3REYXRhID0ge1xyXG4gICAgICAgICAgICB1cmw6ICdodHRwOi8vbS5zYWlrZS5jb20vaG91c2VkcmVzcy9nZXRTaG9wVHlwZS5odG1sJyxcclxuICAgICAgICAgICAgc2VuZERhdGE6IHt9LFxyXG4gICAgICAgICAgICBjYjogY2FsbGJhY2ssXHJcbiAgICAgICAgICAgIGVyckNiOiB0aGlzLmVycm9yQ2FsbEJhY2suYmluZCh0aGlzKVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5zZW5kRGF0YVRvU2VydmVyKHBvc3REYXRhKTtcclxuICAgIH0sXHJcbiAgICAvLyDor7fmsYLkuInnuqfoj5zljZXmlbDmja5cclxuICAgIFJlcXVlc3RTaW5nbGVJdGVtczogZnVuY3Rpb24gKGRhdGEsIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgdmFyIHBvc3REYXRhID0ge1xyXG4gICAgICAgICAgICB1cmw6IFwiaHR0cDovL20uc2Fpa2UuY29tL2hvdXNlZHJlc3MvZ2V0U2hvcExpc3QuaHRtbFwiLFxyXG4gICAgICAgICAgICBzZW5kRGF0YToge1xyXG4gICAgICAgICAgICAgICAgdGlkOiBkYXRhLnRpZCxcclxuICAgICAgICAgICAgICAgIHBhZ2U6IGRhdGEucGFnZSxcclxuICAgICAgICAgICAgICAgIGVhY2g6IGRhdGEuZWFjaFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBjYjogY2FsbGJhY2ssXHJcbiAgICAgICAgICAgIGVyckNiOiB0aGlzLmVycm9yQ2FsbEJhY2suYmluZCh0aGlzKVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5zZW5kRGF0YVRvU2VydmVyKHBvc3REYXRhKTtcclxuICAgIH0sXHJcbiAgICAvLyDliKDpmaTljZXkuKrmiL/pl7TmlbDmja5cclxuICAgIFJlcXVlc3REZWxIb21lOiBmdW5jdGlvbiAoc2VuZERhdGEsIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgdmFyIHBvc3REYXRhID0ge1xyXG4gICAgICAgICAgICB1cmw6IFwiaHR0cDovL20uc2Fpa2UuY29tL2hvdXNlZHJlc3MvZGVsU3VpdC5odG1sXCIsXHJcbiAgICAgICAgICAgIHNlbmREYXRhOiB7XHJcbiAgICAgICAgICAgICAgICBpZDogc2VuZERhdGEuaWRcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgY2I6IGNhbGxiYWNrLFxyXG4gICAgICAgICAgICBlcnJDYjogdGhpcy5lcnJvckNhbGxCYWNrLmJpbmQodGhpcylcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMuc2VuZERhdGFUb1NlcnZlcihwb3N0RGF0YSk7XHJcbiAgICB9LFxyXG4gICAgLy8g6K+35rGC5oi/6Ze05YiX6KGoXHJcbiAgICBSZXF1ZXN0SG9tZUxpc3Q6IGZ1bmN0aW9uIChzZW5kRGF0YSwgY2FsbGJhY2spIHtcclxuICAgICAgICB2YXIgcG9zdERhdGEgPSB7XHJcbiAgICAgICAgICAgIHVybDogXCJodHRwOi8vbS5zYWlrZS5jb20vaG91c2VkcmVzcy9teVN1aXRMaXN0Lmh0bWxcIixcclxuICAgICAgICAgICAgc2VuZERhdGE6IHtcclxuICAgICAgICAgICAgICAgIHBhZ2U6IHNlbmREYXRhLnBhZ2UsXHJcbiAgICAgICAgICAgICAgICBlYWNobnVtOiBzZW5kRGF0YS5lYWNobnVtLFxyXG4gICAgICAgICAgICAgICAgcm9vbV90eXBlOiBzZW5kRGF0YS5yb29tX3R5cGVcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgY2I6IGNhbGxiYWNrLFxyXG4gICAgICAgICAgICBlcnJDYjogdGhpcy5lcnJvckNhbGxCYWNrLmJpbmQodGhpcylcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMuc2VuZERhdGFUb1NlcnZlcihwb3N0RGF0YSk7XHJcbiAgICB9LFxyXG4gICAgLy8g6K+35rGC5Y2V5Liq5oi/6Ze05pWw5o2uXHJcbiAgICBSZXF1ZXN0SG9tZURhdGE6IGZ1bmN0aW9uIChzZW5kRGF0YSwgY2FsbGJhY2spIHtcclxuICAgICAgICB2YXIgcG9zdERhdGEgPSB7XHJcbiAgICAgICAgICAgIHVybDogXCJodHRwOi8vbS5zYWlrZS5jb20vaG91c2VkcmVzcy9nZXRTdWl0RGV0YWlscy5odG1sXCIsXHJcbiAgICAgICAgICAgIHNlbmREYXRhOiB7XHJcbiAgICAgICAgICAgICAgICBzdWl0X2lkOiBzZW5kRGF0YS5zdWl0X2lkXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGNiOiBjYWxsYmFjayxcclxuICAgICAgICAgICAgZXJyQ2I6IHRoaXMuZXJyb3JDYWxsQmFjay5iaW5kKHRoaXMpXHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLnNlbmREYXRhVG9TZXJ2ZXIocG9zdERhdGEpO1xyXG4gICAgfSxcclxuICAgIC8vIOWtmOWCqOaIv+mXtOaVsOaNrlxyXG4gICAgU2VuZEhvbWVEYXRhOiBmdW5jdGlvbiAoc2VuZERhdGEsIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgdmFyIHBvc3REYXRhID0ge1xyXG4gICAgICAgICAgICB1cmw6IFwiaHR0cDovL20uc2Fpa2UuY29tL2hvdXNlZHJlc3Mvc2F2ZVNpbmdsZURyZXNzLmh0bWxcIixcclxuICAgICAgICAgICAgc2VuZERhdGE6IHtcclxuICAgICAgICAgICAgICAgIHN1aXRfaWQ6IDAsXHJcbiAgICAgICAgICAgICAgICB0aHVtYm5haWxzOiBzZW5kRGF0YS50aHVtYm5haWxzLFxyXG4gICAgICAgICAgICAgICAgc3VpdF9uYW1lOiBlbmNvZGVVUklDb21wb25lbnQoc2VuZERhdGEubmFtZSksXHJcbiAgICAgICAgICAgICAgICBzdWl0X3R5cGU6IHNlbmREYXRhLnR5cGUsXHJcbiAgICAgICAgICAgICAgICBkYXRhTGlzdDogSlNPTi5zdHJpbmdpZnkoc2VuZERhdGEuZGF0YUxpc3QpXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGNiOiBjYWxsYmFjayxcclxuICAgICAgICAgICAgZXJyQ2I6IHRoaXMuZXJyb3JDYWxsQmFjay5iaW5kKHRoaXMpXHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLnNlbmREYXRhVG9TZXJ2ZXIocG9zdERhdGEpO1xyXG4gICAgfSxcclxuICAgIC8vIOWtmOWCqOaIv+mXtOe8qeeVpeWbvlxyXG4gICAgU2VuZEltYWdlVG9TZXJ2ZXI6IGZ1bmN0aW9uIChzZW5kRGF0YSwgY2FsbGJhY2spIHtcclxuICAgICAgICB2YXIgcG9zdERhdGEgPSB7XHJcbiAgICAgICAgICAgIHVybDogXCJzcHVwbG9hZC5waHBcIixcclxuICAgICAgICAgICAgc2VuZERhdGE6IHtcclxuICAgICAgICAgICAgICAgIGhvdXNlX3VpZDogc2VuZERhdGEuaG91c2VfdWlkLFxyXG4gICAgICAgICAgICAgICAgc3VpdF9pZDogc2VuZERhdGEuc3VpdF9pZCxcclxuICAgICAgICAgICAgICAgIGltZzogc2VuZERhdGEuaW1hZ2Uuc3JjLFxyXG4gICAgICAgICAgICAgICAgdG9LZW46IHRoaXMudG9LZW5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5zZGF0YUJhc2Uuc2xvYWRpbmdUaXBzLm9wZW5UaXBzKCflrZjlgqjnvKnnlaXlm74nKTtcclxuICAgICAgICBqUXVlcnkucG9zdChwb3N0RGF0YS51cmwsIHBvc3REYXRhLCBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2RhdGFCYXNlLnNsb2FkaW5nVGlwcy5jbG9zZVRpcHMoKTtcclxuICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhkYXRhKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sJ2pzb25wJyk7XHJcbiAgICB9XHJcbn0pO1xyXG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJ2I4MjNiYkNCM2xKcVlXb0Q0SlMvZ0FyJywgJ1NTYXZlUm9vbVdpbmRvdycpO1xuLy8gc2NyaXB0XFxzaW5nbGVcXFNTYXZlUm9vbVdpbmRvdy5qc1xuXG4vLyDkv53lrZjmiL/pl7TmlbDmja7nqpflj6NcclxudmFyIFNhdmVSb29tV2luZG93ID0gRmlyZS5DbGFzcyh7XHJcbiAgICAvLyDnu6fmib9cclxuICAgIGV4dGVuZHM6IEZpcmUuQ29tcG9uZW50LFxyXG4gICAgLy8g5p6E6YCg5Ye95pWwXHJcbiAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMubGFzdEFuaW0gPSBudWxsO1xyXG4gICAgICAgIHRoaXMuc3Ryb2FnZURyZXNzRXZlbnQgPSB0aGlzLl9vblN0cm9hZ2VEcmVzc0V2ZW50LmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5jbG9zZVdpbmRvd0V2ZW50ID0gdGhpcy5fb25DbG9zZVdpbmRvd0V2ZW50LmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5iaW5kQ3JlYXRlVGh1bWJuYWlsc0V2ZW50ID0gdGhpcy5fb25DcmVhdGVUaHVtYm5haWxzRXZlbnQuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLmRlZmF1bHRUaHVtYm5haWxzID0gbnVsbDtcclxuICAgICAgICB0aGlzLmhhc0Rvd25UaHVtYm5haWxzID0gZmFsc2U7XHJcbiAgICB9LFxyXG4gICAgLy8g5bGe5oCnXHJcbiAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgLy8g57yp55Wl5Zu+XHJcbiAgICAgICAgYnRuX3RodW1ibmFpbHM6IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5VSUJ1dHRvblxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g5oi/6Ze05ZCN56ewXHJcbiAgICAgICAgcm9vbU5hbWU6IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5JbnB1dEZpZWxkXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDmiL/pl7TnsbvlnotcclxuICAgICAgICByb29tVHlwZUxpc3Q6IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5VSVBvcHVwTGlzdFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYnRuX2NvbHNlOiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVUlCdXR0b25cclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOehruiupOS/neWtmFxyXG4gICAgICAgIGJ0bl9jb25maXJtU2F2ZToge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlVJQnV0dG9uXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIOWIm+W7uue8qeeVpeWbvlxyXG4gICAgX29uQ3JlYXRlVGh1bWJuYWlsc0V2ZW50OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIGlmIChzZWxmLmhhc0Rvd25UaHVtYm5haWxzKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgc2VsZi5oYXNEb3duVGh1bWJuYWlscyA9IHRydWU7XHJcbiAgICAgICAgc2VsZi5idG5fdGh1bWJuYWlscy50ZXh0Q29udGVudC50ZXh0ID0gJ+S/neaMgeS4reivt+eojeetiS4uJztcclxuICAgICAgICBzZWxmLnNkYXRhQmFzZS5zY3JlZW5zaG90LmNyZWF0ZVRodW1ibmFpbHMoZnVuY3Rpb24gKGltYWdlKSB7XHJcbiAgICAgICAgICAgIHNlbGYuaGFzRG93blRodW1ibmFpbHMgPSBmYWxzZTtcclxuICAgICAgICAgICAgc2VsZi5idG5fdGh1bWJuYWlscy5zZXRJbWFnZShpbWFnZSk7XHJcbiAgICAgICAgICAgIHNlbGYuYnRuX3RodW1ibmFpbHMudGV4dENvbnRlbnQuZW50aXR5LmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICBzZWxmLmJ0bl90aHVtYm5haWxzLnRleHRDb250ZW50LnRleHQgPSAn54K55Ye75q2k5aSEXFxu5Yib5bu657yp55Wl5Zu+JztcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICAvLyDlhbPpl63kv53lrZjnqpflj6NcclxuICAgIF9vbkNsb3NlV2luZG93RXZlbnQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLmNsb3NlV2luZG93KCk7XHJcbiAgICB9LFxyXG4gICAgLy8g5re75Yqg5oi/6Ze05pWw5o2uXHJcbiAgICBfYWRkSG9tZURhdGE6IGZ1bmN0aW9uIChwcm9wcywgZW50aXR5LCBob21lRGF0YSkge1xyXG4gICAgICAgIHZhciBkYXRhID0ge1xyXG4gICAgICAgICAgICBpZDogcHJvcHMuc3VpdF9pZCxcclxuICAgICAgICAgICAgcHJvcHNOYW1lOiBlbnRpdHkubmFtZSxcclxuICAgICAgICAgICAgcHJvcHNUeXBlOiBwcm9wcy5wcm9wVHlwZSxcclxuICAgICAgICAgICAgcG9zOiBlbnRpdHkudHJhbnNmb3JtLnggKyBcIjpcIiArIGVudGl0eS50cmFuc2Zvcm0ueSxcclxuICAgICAgICAgICAgcm90YXRpb246IGVudGl0eS50cmFuc2Zvcm0ucm90YXRpb24sXHJcbiAgICAgICAgICAgIHNjYWxlOiBlbnRpdHkudHJhbnNmb3JtLnNjYWxlWCArIFwiOlwiICsgZW50aXR5LnRyYW5zZm9ybS5zY2FsZVksXHJcbiAgICAgICAgICAgIGltZ1VybDogcHJvcHMuYmlnSW1hZ2VVcmxcclxuICAgICAgICB9O1xyXG4gICAgICAgIGhvbWVEYXRhLmRhdGFMaXN0LnB1c2goZGF0YSk7XHJcbiAgICB9LFxyXG4gICAgLy8g5L+d5a2Y5oi/6Ze05pWw5o2uXHJcbiAgICBfc2F2ZWhvbWVEYXRhOiBmdW5jdGlvbiAobmFtZSwgdHlwZSkge1xyXG4gICAgICAgIHZhciBob21lRGF0YSA9IHtcclxuICAgICAgICAgICAga2V5OiAwLFxyXG4gICAgICAgICAgICBuYW1lOiBuYW1lLFxyXG4gICAgICAgICAgICB0eXBlOiB0eXBlLFxyXG4gICAgICAgICAgICBkYXRhTGlzdDogW11cclxuICAgICAgICB9O1xyXG4gICAgICAgIHZhciBwcm9wcyA9IG51bGw7XHJcbiAgICAgICAgdmFyIGNoaWxkcmVucyA9IHRoaXMuc2RhdGFCYXNlLnJvb20uZ2V0Q2hpbGRyZW4oKTtcclxuICAgICAgICBmb3IodmFyIGkgPSAwLCBsZW4gPSBjaGlsZHJlbnMubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcclxuICAgICAgICAgICAgdmFyIGVudGl0eSA9IGNoaWxkcmVuc1tpXTtcclxuICAgICAgICAgICAgcHJvcHMgPSBlbnRpdHkuZ2V0Q29tcG9uZW50KCdTRnVybml0dXJlJyk7XHJcbiAgICAgICAgICAgIGlmICghcHJvcHMpIHtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX2FkZEhvbWVEYXRhKHByb3BzLCBlbnRpdHksIGhvbWVEYXRhKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGhvbWVEYXRhO1xyXG4gICAgfSxcclxuICAgIC8vXHJcbiAgICBfb25TdHJvYWdlRHJlc3NFdmVudDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIC8vXHJcbiAgICAgICAgaWYgKHRoaXMucm9vbU5hbWUudGV4dCA9PT0gXCJcIiB8fCB0aGlzLnJvb21UeXBlTGlzdC5yb29tVHlwZSA9PT0gLTEgfHxcclxuICAgICAgICAgICAgdGhpcy5idG5fdGh1bWJuYWlscy5idG5SZW5kZXIuc3ByaXRlID09PSB0aGlzLmRlZmF1bHRUaHVtYm5haWxzKSAge1xyXG4gICAgICAgICAgICAvL1xyXG4gICAgICAgICAgICB0aGlzLnNkYXRhQmFzZS5zc2F2ZUVycm9yVGlwcy5hY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgICAgICAvLyB0aXBz5Yqo55S7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmxhc3RBbmltKXtcclxuICAgICAgICAgICAgICAgIHRoaXMubGFzdEFuaW0uc3RvcCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciBhbmltID0gdGhpcy5zZGF0YUJhc2Uuc3NhdmVFcnJvclRpcHMuYW5pbWF0ZShbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgJ0ZpcmUuVHJhbnNmb3JtJzogeyBzY2FsZTogbmV3IEZpcmUuVmVjMigwLCAwKSB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICdGaXJlLlRyYW5zZm9ybSc6IHsgc2NhbGU6IG5ldyBGaXJlLlZlYzIoMSwgMSkgfSxcclxuICAgICAgICAgICAgICAgICAgICByYXRpbzogMC4yXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICdGaXJlLlRyYW5zZm9ybSc6IHsgc2NhbGU6IG5ldyBGaXJlLlZlYzIoMSwgMSkgfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXSwge2R1cmF0aW9uOiAxfSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmxhc3RBbmltID0gYW5pbTtcclxuICAgICAgICAgICAgYW5pbS5vblN0b3AgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNkYXRhQmFzZS5zc2F2ZUVycm9yVGlwcy5hY3RpdmUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2RhdGFCYXNlLnNzYXZlRXJyb3JUaXBzLnRyYW5zZm9ybS5zY2FsZSA9IG5ldyBGaXJlLlZlYzIoMCwgMCk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zZGF0YUJhc2Uuc3NhdmVFcnJvclRpcHMuYWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgdmFyIG5hbWUgPSB0aGlzLnJvb21OYW1lLnRleHQ7XHJcbiAgICAgICAgdmFyIHR5cGUgPSB0aGlzLnJvb21UeXBlTGlzdC5yb29tVHlwZTtcclxuICAgICAgICB2YXIgaG9tZURhdGEgPSB0aGlzLl9zYXZlaG9tZURhdGEobmFtZSwgdHlwZSk7XHJcblxyXG4gICAgICAgIC8vIOS/neWtmOe8qeeVpeWbvlxyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICB0aGlzLnNkYXRhQmFzZS5zbmV0V29ya01nci5TZW5kSG9tZURhdGEoaG9tZURhdGEsIGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgIGlmIChkYXRhLnN0YXR1cyA+IDEwMDAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIHNlbmREYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgaG91c2VfdWlkOiBkYXRhLmhvdXNlX3VpZCxcclxuICAgICAgICAgICAgICAgIHN1aXRfaWQ6IGRhdGEuc3VpdF9pZCxcclxuICAgICAgICAgICAgICAgIGltYWdlOiBzZWxmLmJ0bl90aHVtYm5haWxzLmltYWdlXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHNlbGYuc2RhdGFCYXNlLnNuZXRXb3JrTWdyLlNlbmRJbWFnZVRvU2VydmVyKHNlbmREYXRhLCBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5jbG9zZVdpbmRvdygpO1xyXG4gICAgICAgICAgICAgICAgc2VsZi5zZGF0YUJhc2Uuc3RpcHNXaW5kb3cub3BlbldpbmRvdygn5L+d5a2Y5oiQ5YqfLi4nKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgLy8g5omT5byA56qX5Y+jXHJcbiAgICBvcGVuV2luZG93OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5lbnRpdHkuYWN0aXZlID0gdHJ1ZTtcclxuICAgIH0sXHJcbiAgICAvLyDlhbPpl61cclxuICAgIGNsb3NlV2luZG93OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5zZGF0YUJhc2Uuc3NhdmVFcnJvclRpcHMuYWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5lbnRpdHkuYWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5yb29tVHlwZUxpc3Qucm9vbVR5cGUgPSAtMTtcclxuICAgICAgICB0aGlzLnJvb21OYW1lLnRleHQgPSAnJztcclxuICAgICAgICB0aGlzLnJvb21UeXBlTGlzdC5idG5fcm9vbVR5cGUuc2V0VGV4dCgn57G75Z6L5ZCN56ewJyk7XHJcbiAgICAgICAgaWYgKHRoaXMuZGVmYXVsdFRodW1ibmFpbHMpIHtcclxuICAgICAgICAgICAgdGhpcy5idG5fdGh1bWJuYWlscy5zZXRTcHJpdGUodGhpcy5kZWZhdWx0VGh1bWJuYWlscyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuYnRuX3RodW1ibmFpbHMudGV4dENvbnRlbnQuZW50aXR5LmFjdGl2ZSA9IHRydWU7XHJcbiAgICB9LFxyXG4gICAgLy8g5byA5aeL5pe2XHJcbiAgICBzdGFydDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBlbnQgPSBGaXJlLkVudGl0eS5maW5kKCcvU0RhdGFCYXNlJyk7XHJcbiAgICAgICAgdGhpcy5zZGF0YUJhc2UgPSBlbnQuZ2V0Q29tcG9uZW50KCdTRGF0YUJhc2UnKTtcclxuICAgICAgICAvL1xyXG4gICAgICAgIHRoaXMuYnRuX2NvbHNlLm9uQ2xpY2sgPSB0aGlzLmNsb3NlV2luZG93RXZlbnQ7XHJcbiAgICAgICAgdGhpcy5idG5fY29uZmlybVNhdmUub25DbGljayA9IHRoaXMuc3Ryb2FnZURyZXNzRXZlbnQ7XHJcbiAgICAgICAgdGhpcy5idG5fdGh1bWJuYWlscy5vbkNsaWNrID0gdGhpcy5iaW5kQ3JlYXRlVGh1bWJuYWlsc0V2ZW50O1xyXG4gICAgICAgIHRoaXMuZGVmYXVsdFRodW1ibmFpbHMgPSB0aGlzLmJ0bl90aHVtYm5haWxzLmJ0blJlbmRlci5zcHJpdGU7XHJcbiAgICB9XHJcbn0pO1xyXG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJzg4Y2M2OHltSkpFS0xnVFdDVXE2ZHNtJywgJ1NTZWNvbmRhcnlNZW51TWdyJyk7XG4vLyBzY3JpcHRcXHNpbmdsZVxcU1NlY29uZGFyeU1lbnVNZ3IuanNcblxuLy8g5LqM57qn6I+c5Y2V566h55CG57G7XHJcbnZhciBTU2Vjb25kYXJ5TWVudU1nciA9IEZpcmUuQ2xhc3Moe1xyXG4gICAgLy8g57un5om/XHJcbiAgICBleHRlbmRzOiBGaXJlLkNvbXBvbmVudCxcclxuICAgIC8vIOaehOmAoOWHveaVsFxyXG4gICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAvLyDkuIDpobXmmL7npLrlpJrlsJHkuKpcclxuICAgICAgICB0aGlzLl9zaG93VG90YWwgPSA4O1xyXG4gICAgICAgIC8vIOiPnOWNleWuueWZqOWIl+ihqFxyXG4gICAgICAgIHRoaXMuX21lbnVTaGVldHMgPSBbXTtcclxuICAgICAgICAvLyDmiZPlvIDkuInnuqfoj5zljZXkuovku7ZcclxuICAgICAgICB0aGlzLmJpbmRPcGVuVGhyZWVNZW51RXZlbnQgPSB0aGlzLl9vbk9wZW5UaHJlZU1lbnVFdmVudC5iaW5kKHRoaXMpO1xyXG4gICAgICAgIC8vIOWNleWTgeiPnOWNleWbnuiwg+WHveaVsFxyXG4gICAgICAgIHRoaXMuYmluZFJlZnJlc2hFZXZudCA9IHRoaXMuX3JlZnJlc2hTaW5nbGVTZWNvbmRhcnlNZW51LmJpbmQodGhpcyk7XHJcbiAgICB9LFxyXG4gICAgLy8g5bGe5oCnXHJcbiAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgLy9cclxuICAgICAgICBtYXJnaW46IG5ldyBGaXJlLlZlYzIoMCwgNjQpLFxyXG4gICAgICAgIC8vIOS6jOe6p+iPnOWNleeahOagueiKgueCuVxyXG4gICAgICAgIHJvb3ROb2RlOiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuRW50aXR5XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIOaJk+W8gOWQhOS4quexu+Wei+WutuWFt+WIl+ihqFxyXG4gICAgX29uT3BlblRocmVlTWVudUV2ZW50OiBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICB2YXIgbWVudSA9IGV2ZW50LnRhcmdldC5wYXJlbnQuZ2V0Q29tcG9uZW50KCdTU2Vjb25kYXJ5TWVudScpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCfojrflj5YnICsgbWVudS50aWQgKyBcIuexu+Wei+WutuWFt+WIl+ihqFwiKTtcclxuICAgICAgICB0aGlzLnNkYXRhQmFzZS5zdGhyZWVNZW51TWdyLm9wZW5NZW51KG1lbnUudGlkLCBtZW51Lmhhc0RyYWcpO1xyXG4gICAgfSxcclxuICAgIC8vIOmHjee9ruiPnOWNleWIl+ihqFxyXG4gICAgX3Jlc2V0TWVudTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9tZW51U2hlZXRzLmxlbmd0aCA9PT0gMCl7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9zaG93VG90YWw7ICsraSkge1xyXG4gICAgICAgICAgICB2YXIgbWVudSA9IHRoaXMuX21lbnVTaGVldHNbaV07XHJcbiAgICAgICAgICAgIG1lbnUubmFtZSA9IGkudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgbWVudS5yZXNldE1lbnUoKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8g5Yib5bu66I+c5Y2V5a655ZmoXHJcbiAgICBfY3JlYXRlTWVudUNvbnRhaW5lcnM6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAodGhpcy5fbWVudVNoZWV0cy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHRlbXBNZW51ID0gdGhpcy5zZGF0YUJhc2UudGVtcFNlY29uZGFyeU1lbnU7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9zaG93VG90YWw7ICsraSkge1xyXG4gICAgICAgICAgICB2YXIgZW50ID0gRmlyZS5pbnN0YW50aWF0ZSh0ZW1wTWVudSk7XHJcbiAgICAgICAgICAgIGVudC5uYW1lID0gaS50b1N0cmluZygpO1xyXG4gICAgICAgICAgICBlbnQucGFyZW50ID0gdGhpcy5yb290Tm9kZTtcclxuICAgICAgICAgICAgZW50LnRyYW5zZm9ybS5wb3NpdGlvbiA9IG5ldyBGaXJlLlZlYzIoLTQ5NSArIChpICogMTQwKSwgMCk7XHJcbiAgICAgICAgICAgIHZhciBtZW51ID0gZW50LmdldENvbXBvbmVudCgnU1NlY29uZGFyeU1lbnUnKTtcclxuICAgICAgICAgICAgbWVudS5pbml0KCk7XHJcbiAgICAgICAgICAgIC8vIOWtmOWCqOWvueixoVxyXG4gICAgICAgICAgICB0aGlzLl9tZW51U2hlZXRzLnB1c2gobWVudSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIOWIt+aWsOS6jOe6p+iPnOWNlVxyXG4gICAgX3JlZnJlc2hTZWNvbmRhcnlNZW51OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgLy8g5Yib5bu65a655ZmoXHJcbiAgICAgICAgdGhpcy5fY3JlYXRlTWVudUNvbnRhaW5lcnMoKTtcclxuICAgICAgICAvLyDph43nva7oj5zljZXliJfooahcclxuICAgICAgICB0aGlzLl9yZXNldE1lbnUoKTtcclxuICAgICAgICAvLyDph43mlrDotYvlgLxcclxuICAgICAgICB2YXIgaSA9IDAsIG1lbnUgPSBudWxsO1xyXG4gICAgICAgIHZhciBkYXRhTGlzdCA9IHRoaXMuc2RhdGFCYXNlLnNlY29uZGFyeU1lbnVEYXRhU2hlZXRzO1xyXG4gICAgICAgIGZvcihpID0gMDsgaSA8IGRhdGFMaXN0Lmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgIHZhciBkYXRhID0gZGF0YUxpc3RbaV07XHJcbiAgICAgICAgICAgIGlmICghIGRhdGEpe1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbWVudSA9IHRoaXMuX21lbnVTaGVldHNbaV07XHJcbiAgICAgICAgICAgIG1lbnUucmVmcmVzaChkYXRhLCB0aGlzLmJpbmRPcGVuVGhyZWVNZW51RXZlbnQpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvLyDliLfmlrDljZXkuKrkuoznuqfoj5zljZVcclxuICAgIF9yZWZyZXNoU2luZ2xlU2Vjb25kYXJ5TWVudTogZnVuY3Rpb24gKGluZGV4LCBkYXRhKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9tZW51U2hlZXRzIHx8IHRoaXMuX21lbnVTaGVldHMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIG1lbnUgPSB0aGlzLl9tZW51U2hlZXRzW2luZGV4XTtcclxuICAgICAgICBpZiAobWVudSkge1xyXG4gICAgICAgICAgICBtZW51LnJlZnJlc2goZGF0YSwgdGhpcy5iaW5kT3BlblRocmVlTWVudUV2ZW50KTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgb25Mb2FkOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9TRGF0YUJhc2UnKTtcclxuICAgICAgICB0aGlzLnNkYXRhQmFzZSA9IGVudC5nZXRDb21wb25lbnQoJ1NEYXRhQmFzZScpO1xyXG4gICAgICAgIC8vIOmihOWKoOi9vSDljZXlk4FcclxuICAgICAgICB0aGlzLnNkYXRhQmFzZS5wcmVsb2FkU2Vjb25kYXJ5TWVudURhdGEodGhpcy5iaW5kUmVmcmVzaEVldm50KTtcclxuICAgIH0sXHJcbiAgICAvLyDmiZPlvIDkuoznuqfoj5zljZVcclxuICAgIG9wZW5TZWNvbmRhcnlNZW51OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5lbnRpdHkuYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICAvLyDliLfmlrDljZXlk4Hlrrblhbfoj5zljZXliJfooahcclxuICAgICAgICB0aGlzLl9yZWZyZXNoU2Vjb25kYXJ5TWVudSgpO1xyXG4gICAgfSxcclxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIC8vIOWMuemFjVVJ5YiG6L6o546HXHJcbiAgICAgICAgLy92YXIgY2FtZXJhID0gRmlyZS5DYW1lcmEubWFpbjtcclxuICAgICAgICAvL3ZhciBiZ1dvcmxkQm91bmRzID0gdGhpcy5zZGF0YUJhc2UuYmdSZW5kZXIuZ2V0V29ybGRCb3VuZHMoKTtcclxuICAgICAgICAvL3ZhciBiZ0xlZnRUb3BXb3JsZFBvcyA9IG5ldyBGaXJlLlZlYzIoYmdXb3JsZEJvdW5kcy54TWluLCBiZ1dvcmxkQm91bmRzLnlNaW4pO1xyXG4gICAgICAgIC8vdmFyIGJnbGVmdFRvcCA9IGNhbWVyYS53b3JsZFRvU2NyZWVuKGJnTGVmdFRvcFdvcmxkUG9zKTtcclxuICAgICAgICAvL3ZhciBzY3JlZW5Qb3MgPSBuZXcgRmlyZS5WZWMyKGJnbGVmdFRvcC54LCBiZ2xlZnRUb3AueSk7XHJcbiAgICAgICAgLy92YXIgd29ybGRQb3MgPSBjYW1lcmEuc2NyZWVuVG9Xb3JsZChzY3JlZW5Qb3MpO1xyXG4gICAgICAgIC8vdGhpcy5lbnRpdHkudHJhbnNmb3JtLndvcmxkUG9zaXRpb24gPSB3b3JsZFBvcztcclxuICAgICAgICAvLyDljLnphY1VSeWIhui+qOeOh1xyXG4gICAgICAgIHZhciBjYW1lcmEgPSBGaXJlLkNhbWVyYS5tYWluO1xyXG4gICAgICAgIHZhciBzY3JlZW5TaXplID0gRmlyZS5TY3JlZW4uc2l6ZS5tdWwoY2FtZXJhLnNpemUgLyBGaXJlLlNjcmVlbi5oZWlnaHQpO1xyXG4gICAgICAgIHZhciBuZXdQb3MgPSBGaXJlLnYyKHRoaXMubWFyZ2luLngsIC1zY3JlZW5TaXplLnkgLyAyICsgdGhpcy5tYXJnaW4ueSk7XHJcbiAgICAgICAgdGhpcy5lbnRpdHkudHJhbnNmb3JtLnBvc2l0aW9uID0gbmV3UG9zO1xyXG4gICAgfVxyXG59KTtcclxuXG5GaXJlLl9SRnBvcCgpOyIsIkZpcmUuX1JGcHVzaChtb2R1bGUsICdlOTI2NURwU0pKQ1dMdVZqRy8zMFpOTycsICdTU2Vjb25kYXJ5TWVudScpO1xuLy8gc2NyaXB0XFxzaW5nbGVcXFNTZWNvbmRhcnlNZW51LmpzXG5cbi8vIOS/neWtmOS6jOe6p+iPnOWNleaVsOaNrlxyXG52YXIgU1NlY29uZGFyeU1lbnUgPSBGaXJlLkNsYXNzKHtcclxuICAgIC8vIOe7p+aJv1xyXG4gICAgZXh0ZW5kczogRmlyZS5Db21wb25lbnQsXHJcbiAgICAvLyDmnoTpgKDlh73mlbBcclxuICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5idG5fbWVudSA9IG51bGw7XHJcbiAgICAgICAgdGhpcy50ZXh0Q29udGVudCA9IG51bGw7XHJcbiAgICB9LFxyXG4gICAgLy8g5bGe5oCnXHJcbiAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgLy8g6buY6K6k5Zu+54mHXHJcbiAgICAgICAgZGVmYXVsdFNwcml0ZToge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlNwcml0ZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdGlkOiAwLFxyXG4gICAgICAgIHRuYW1lOiAn6L295YWl5LitLi4nLFxyXG4gICAgICAgIGlzZHJhZzogZmFsc2UsXHJcbiAgICAgICAgdXJsOiAnJ1xyXG4gICAgfSxcclxuICAgIC8vIOiuvue9ruWbvueJh1xyXG4gICAgc2V0U3ByaXRlOiBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgICAgICB0aGlzLmJ0bl9tZW51LnNldFNwcml0ZSh2YWx1ZSk7XHJcbiAgICB9LFxyXG4gICAgLy8g6K6+572u5paH5a2XXHJcbiAgICBzZXRUZXh0OiBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgICAgICB0aGlzLmJ0bl9tZW51LnNldFRleHQodmFsdWUpO1xyXG4gICAgfSxcclxuICAgIC8vIOmHjee9ruiPnOWNlVxyXG4gICAgcmVzZXRNZW51OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy50aWQgPSAwO1xyXG4gICAgICAgIHRoaXMuaXNkcmFnID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy50bmFtZSA9ICfovb3lhaXkuK0uLic7XHJcbiAgICAgICAgdGhpcy51cmwgPSAnJztcclxuICAgICAgICB0aGlzLnNldFNwcml0ZSh0aGlzLmRlZmF1bHRTcHJpdGUpO1xyXG4gICAgICAgIHRoaXMuc2V0VGV4dCh0aGlzLnRuYW1lKTtcclxuICAgIH0sXHJcbiAgICAvLyDliJ3lp4vljJZcclxuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAoISB0aGlzLmJ0bl9tZW51KSB7XHJcbiAgICAgICAgICAgIHZhciBlbnQgPSB0aGlzLmVudGl0eS5maW5kKCdidG5fbWVudScpO1xyXG4gICAgICAgICAgICB0aGlzLmJ0bl9tZW51ID0gZW50LmdldENvbXBvbmVudChGaXJlLlVJQnV0dG9uKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5yZXNldE1lbnUoKTtcclxuICAgIH0sXHJcbiAgICAvLyDliLfmlrBcclxuICAgIHJlZnJlc2g6IGZ1bmN0aW9uIChkYXRhLCBldmVudCkge1xyXG4gICAgICAgIHRoaXMudGlkID0gZGF0YS50aWQ7XHJcbiAgICAgICAgdGhpcy5oYXNEcmFnID0gZGF0YS5pc2RyYWcgPCAyO1xyXG4gICAgICAgIHRoaXMudG5hbWUgPSBkYXRhLnRuYW1lO1xyXG4gICAgICAgIHRoaXMudXJsID0gZGF0YS51cmw7XHJcbiAgICAgICAgdGhpcy5zZXRUZXh0KGRhdGEudG5hbWUpO1xyXG4gICAgICAgIGlmIChkYXRhLnNtYWxsU3ByaXRlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0U3ByaXRlKGRhdGEuc21hbGxTcHJpdGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmJ0bl9tZW51Lm9uQ2xpY2sgPSBldmVudDtcclxuICAgIH1cclxufSk7XHJcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnZTdkODdaUDVPOUZtcDRlNGdoaEVJREgnLCAnU1RocmVlTWVudU1ncicpO1xuLy8gc2NyaXB0XFxzaW5nbGVcXFNUaHJlZU1lbnVNZ3IuanNcblxuLy8g5LiJ57qn6I+c5Y2V566h55CG57G7XHJcbnZhciBTVGhyZWVNZW51TWdyID0gRmlyZS5DbGFzcyh7XHJcbiAgICAvLyDnu6fmib9cclxuICAgIGV4dGVuZHM6IEZpcmUuQ29tcG9uZW50LFxyXG4gICAgLy8g5p6E6YCg5Ye95pWwXHJcbiAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIC8vIOWutuWFt+S4gOasoeaYvuekuuWkmuWwkeaVsOmHj1xyXG4gICAgICAgIHRoaXMuX21lbnVUb3RhbCA9IDY7XHJcbiAgICAgICAgLy8g5ri45oiP5pWw5o2uXHJcbiAgICAgICAgdGhpcy5zZGF0YUJhc2UgPSBudWxsO1xyXG4gICAgICAgIC8vIOiPnOWNleWIl+ihqFxyXG4gICAgICAgIHRoaXMuX21lbnVMaXN0ID0gW107XHJcbiAgICAgICAgLy8g5piv5ZCm5Y+v5Lul5ouW5Yqo77yI5L6L5aaC5aOB57q45LiO5Zyw6Z2i5peg5rOV5ouW5Yqo77yJXHJcbiAgICAgICAgdGhpcy5faGFzRHJhZyA9IGZhbHNlO1xyXG4gICAgICAgIC8vIOW9k+WJjemAieaLqeeJqeWTgUlEXHJcbiAgICAgICAgdGhpcy5fY3VySWQgPSAwO1xyXG4gICAgICAgIC8vIOW9k+WJjeacgOWkp+aVsOmHj1xyXG4gICAgICAgIHRoaXMuX2N1clRvdGFsID0gMDtcclxuICAgICAgICAvLyDlvZPliY3pobXnrb5cclxuICAgICAgICB0aGlzLl9jdXJQYWdlID0gMTtcclxuICAgICAgICAvLyDmnIDlpKfpobXnrb5cclxuICAgICAgICB0aGlzLl9tYXhQYWdlID0gMTtcclxuICAgICAgICAvLyDlm77niYfovb3lhaXlm57osINcclxuICAgICAgICB0aGlzLmJpbmRBZnRlckxvYWRJbWFnZUNCID0gbnVsbDtcclxuICAgICAgICAvLyDlpKflm77ovb3lhaXkuK1cclxuICAgICAgICB0aGlzLl9oYXNMb2FkQmlnSW1hZ2VpbmcgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLl9sYXN0Q3JlYXRlVGFyZ2V0ID0gbnVsbDtcclxuICAgIH0sXHJcbiAgICAvLyDlsZ7mgKdcclxuICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICBtYXJnaW46IG5ldyBGaXJlLlZlYzIoMCwgMjQwKSxcclxuICAgICAgICAvLyDkuInnuqfoj5zljZXnmoTmoLnoioLngrlcclxuICAgICAgICByb290Tm9kZToge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiBGaXJlLkVudGl0eVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvLyDliJvlu7rmiJbogIXmmK/liIfmjaLmnZDotKhcclxuICAgIGNyZWF0ZU9yQ2hhbmdlRnVybml0dXJlOiBmdW5jdGlvbiAodGFyZ2V0KSB7XHJcbiAgICAgICAgLy8g5LiA5byA5aeL5aSn5Zu+5pyq5Yqg6L2955qE5pe25YCZ77yM56aB5q2i55So5oi35aSa5qyh54K55Ye755u45ZCM5a625YW3XHJcbiAgICAgICAgaWYgKHRoaXMuX2hhc0xvYWRCaWdJbWFnZWluZyAmJiB0aGlzLl9sYXN0Q3JlYXRlVGFyZ2V0ID09PSB0YXJnZXQpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgdmFyIG1lbnUgPSB0YXJnZXQuZ2V0Q29tcG9uZW50KCdTVGhyZWVNZW51Jyk7XHJcbiAgICAgICAgdmFyIGVudCwgZW50Q29tcCwgYmlnU3ByaXRlO1xyXG4gICAgICAgIC8vIOWimeWjgeS4juWcsOadv1xyXG4gICAgICAgIGlmICghIHNlbGYuX2hhc0RyYWcpIHtcclxuICAgICAgICAgICAgaWYgKHNlbGYuX2N1cklkID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICBlbnQgPSBzZWxmLnNkYXRhQmFzZS5iZ1JlbmRlci5lbnRpdHk7XHJcbiAgICAgICAgICAgICAgICBlbnRDb21wID0gZW50LmdldENvbXBvbmVudCgnU0Z1cm5pdHVyZScpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKHNlbGYuX2N1cklkID09PSAyKSB7XHJcbiAgICAgICAgICAgICAgICBlbnQgPSBzZWxmLnNkYXRhQmFzZS5ncm91bmRSZW5kZXIuZW50aXR5O1xyXG4gICAgICAgICAgICAgICAgZW50Q29tcCA9IGVudC5nZXRDb21wb25lbnQoJ1NGdXJuaXR1cmUnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbnRDb21wLnROYW1lID0gbWVudS50TmFtZTtcclxuICAgICAgICAgICAgZW50Q29tcC5zdWl0X2lkID0gbWVudS5zdWl0X2lkO1xyXG4gICAgICAgICAgICBlbnRDb21wLmhhc0RyYWcgPSBzZWxmLl9oYXNEcmFnO1xyXG4gICAgICAgICAgICBlbnRDb21wLmltYWdlVXJsID0gbWVudS5iaWdJbWFnZVVybDtcclxuICAgICAgICAgICAgYmlnU3ByaXRlID0gc2VsZi5zZGF0YUJhc2UudGhyZWVNZW51QmlnSW1hZ2VTaGVldHNbZW50Q29tcC5zdWl0X2lkXTtcclxuICAgICAgICAgICAgaWYgKGJpZ1Nwcml0ZSkge1xyXG4gICAgICAgICAgICAgICAgZW50Q29tcC5zZXRTcHJpdGUoYmlnU3ByaXRlKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuX2hhc0xvYWRCaWdJbWFnZWluZyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBGaXJlLkltYWdlTG9hZGVyKGVudENvbXAuaW1hZ2VVcmwsIGZ1bmN0aW9uIChlcnJvciwgaW1hZ2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLl9oYXNMb2FkQmlnSW1hZ2VpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGJpZ1Nwcml0ZSA9IG5ldyBGaXJlLlNwcml0ZShpbWFnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZW50Q29tcC5zZXRTcHJpdGUoYmlnU3ByaXRlKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8g5Yib5bu65a625YW35Yiw5Zy65pmv5LitXHJcbiAgICAgICAgZW50ID0gRmlyZS5pbnN0YW50aWF0ZShzZWxmLnNkYXRhQmFzZS50ZW1wRnVybml0dXJlKTtcclxuICAgICAgICBlbnQucGFyZW50ID0gc2VsZi5zZGF0YUJhc2Uucm9vbTtcclxuICAgICAgICB2YXIgcG9zID0gdGFyZ2V0LnRyYW5zZm9ybS53b3JsZFBvc2l0aW9uO1xyXG4gICAgICAgIHZhciBvZmZzZXQgPSBNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiAxMDApO1xyXG4gICAgICAgIHBvcy54ICs9IG9mZnNldDtcclxuICAgICAgICBwb3MueSArPSA0MDA7XHJcbiAgICAgICAgZW50LnRyYW5zZm9ybS5wb3NpdGlvbiA9IG5ldyBGaXJlLlZlYzIocG9zLngsIHBvcy55KTtcclxuICAgICAgICBlbnQudHJhbnNmb3JtLnNjYWxlID0gbmV3IEZpcmUuVmVjMigxLjgsIDEuOCk7XHJcbiAgICAgICAgZW50Lm5hbWUgPSBtZW51LnN1aXRfaWQ7XHJcbiAgICAgICAgZW50Q29tcCA9IGVudC5nZXRDb21wb25lbnQoJ1NGdXJuaXR1cmUnKTtcclxuICAgICAgICBlbnRDb21wLnN1aXRfaWQgPSBtZW51LnN1aXRfaWQ7XHJcbiAgICAgICAgZW50Q29tcC5wcm9wVHlwZSA9IHRoaXMuX2N1cklkO1xyXG4gICAgICAgIGVudENvbXAudE5hbWUgPSBtZW51LnROYW1lO1xyXG4gICAgICAgIGVudENvbXAuaGFzRHJhZyA9IHRoaXMuX2hhc0RyYWc7XHJcbiAgICAgICAgZW50Q29tcC5pbWFnZVVybCA9IG1lbnUuYmlnSW1hZ2VVcmw7XHJcbiAgICAgICAgYmlnU3ByaXRlID0gc2VsZi5zZGF0YUJhc2UudGhyZWVNZW51QmlnSW1hZ2VTaGVldHNbZW50Q29tcC5zdWl0X2lkXTtcclxuICAgICAgICBpZiAoYmlnU3ByaXRlKSB7XHJcbiAgICAgICAgICAgIGVudENvbXAuc2V0U3ByaXRlKGJpZ1Nwcml0ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBzZWxmLl9oYXNMb2FkQmlnSW1hZ2VpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICBGaXJlLkltYWdlTG9hZGVyKGVudENvbXAuaW1hZ2VVcmwsIGZ1bmN0aW9uIChlcnJvciwgaW1hZ2UpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuX2hhc0xvYWRCaWdJbWFnZWluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgaWYgKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGJpZ1Nwcml0ZSA9IG5ldyBGaXJlLlNwcml0ZShpbWFnZSk7XHJcbiAgICAgICAgICAgICAgICBlbnRDb21wLnNldFNwcml0ZShiaWdTcHJpdGUpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8g5Yib5bu65ZCE5Liq57G75Z6L5a625YW3XHJcbiAgICBfb25DcmVhdGVGdXJuaXR1cmVFdmVudDogZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ+WIm+W7uicgKyBldmVudC50YXJnZXQucGFyZW50Lm5hbWUpO1xyXG4gICAgICAgIHRoaXMuY3JlYXRlT3JDaGFuZ2VGdXJuaXR1cmUoZXZlbnQudGFyZ2V0LnBhcmVudCk7XHJcbiAgICB9LFxyXG4gICAgLy8g6YeN572u6I+c5Y2V5YiX6KGoXHJcbiAgICBfcmVzZXRNZW51OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9tZW51TGlzdC5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICB2YXIgbWVudSA9IHRoaXMuX21lbnVMaXN0W2ldO1xyXG4gICAgICAgICAgICBtZW51Lm5hbWUgPSBpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIG1lbnUucmVzZXRNZW51KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIOWIm+W7uuiPnOWNleaMiemSruW5tuS4lOe7keWumuS6i+S7tiDmiJbogIXliLfmlrBcclxuICAgIF9yZWZyZXNoU2luZ2xlSXRlbXM6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgaSA9IDAsIG1lbnUgPSBudWxsO1xyXG4gICAgICAgIC8vIOWIm+W7uuWvueixoeWuueWZqFxyXG4gICAgICAgIGlmICh0aGlzLl9tZW51TGlzdC5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgdmFyIHRlbXBGdXJuaXR1cmUgPSB0aGlzLnNkYXRhQmFzZS50ZW1wVGhyZWVNZW51O1xyXG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy5fbWVudVRvdGFsOyArK2kpIHtcclxuICAgICAgICAgICAgICAgIHZhciBlbnQgPSBGaXJlLmluc3RhbnRpYXRlKHRlbXBGdXJuaXR1cmUpO1xyXG4gICAgICAgICAgICAgICAgZW50Lm5hbWUgPSBpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgICAgICBlbnQucGFyZW50ID0gdGhpcy5yb290Tm9kZTtcclxuICAgICAgICAgICAgICAgIGVudC50cmFuc2Zvcm0ucG9zaXRpb24gPSBuZXcgRmlyZS5WZWMyKC00MjAgKyAoaSAqIDE3MCksIDQwKTtcclxuICAgICAgICAgICAgICAgIG1lbnUgPSBlbnQuZ2V0Q29tcG9uZW50KCdTVGhyZWVNZW51Jyk7XHJcbiAgICAgICAgICAgICAgICBtZW51LmluaXQoKTtcclxuICAgICAgICAgICAgICAgIC8vIOWtmOWCqOWvueixoVxyXG4gICAgICAgICAgICAgICAgdGhpcy5fbWVudUxpc3QucHVzaChtZW51KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgLy8g6YeN572uXHJcbiAgICAgICAgICAgIHRoaXMuX3Jlc2V0TWVudSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyDlpoLmnpzmgLvmlbDph4/mnInmm7TmlrDlsLHph43mlrDorqHnrpfmnIDlpKfpobXmlbBcclxuICAgICAgICB2YXIgdG90YWwgPSB0aGlzLnNkYXRhQmFzZS50aHJlZU1lbnVEYXRhVG90YWxTaGVldHNbdGhpcy5fY3VySWRdO1xyXG4gICAgICAgIGlmICh0aGlzLl9jdXJUb3RhbCAhPT0gdG90YWwpIHtcclxuICAgICAgICAgICAgdGhpcy5fY3VyVG90YWwgPSB0b3RhbDtcclxuICAgICAgICAgICAgdGhpcy5fbWF4UGFnZSA9IE1hdGguY2VpbCh0aGlzLl9jdXJUb3RhbCAvIHRoaXMuX21lbnVUb3RhbCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIOi1i+WAvOaVsOaNrlxyXG4gICAgICAgIHZhciBpbmRleCA9IDA7XHJcbiAgICAgICAgdmFyIHN0YXJ0TnVtID0gKHRoaXMuX2N1clBhZ2UgLSAxKSAqIHRoaXMuX21lbnVUb3RhbDtcclxuICAgICAgICB2YXIgZW5kTnVtID0gc3RhcnROdW0gKyB0aGlzLl9tZW51VG90YWw7XHJcbiAgICAgICAgaWYgKGVuZE51bSA+IHRoaXMuX2N1clRvdGFsKSB7XHJcbiAgICAgICAgICAgIGVuZE51bSA9IHRoaXMuX2N1clRvdGFsO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgYmluZEV2ZW50ID0gdGhpcy5fb25DcmVhdGVGdXJuaXR1cmVFdmVudC5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHZhciBkYXRhU2hlZXRzID0gdGhpcy5zZGF0YUJhc2UudGhyZWVNZW51RGF0YVNoZWV0c1t0aGlzLl9jdXJJZF07XHJcbiAgICAgICAgZm9yKGkgPSBzdGFydE51bTsgaSA8IGVuZE51bTsgKytpKSB7XHJcbiAgICAgICAgICAgIG1lbnUgPSB0aGlzLl9tZW51TGlzdFtpbmRleF07XHJcbiAgICAgICAgICAgIG1lbnUuZW50aXR5LmFjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgICAgIGluZGV4Kys7XHJcbiAgICAgICAgICAgIHZhciBtZW51RGF0YSA9IGRhdGFTaGVldHNbaV07XHJcbiAgICAgICAgICAgIGlmICghbWVudURhdGEpIHtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG1lbnUucmVmcmVzaChtZW51RGF0YSwgYmluZEV2ZW50KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8g5Yi35paw5oyJ6ZKu54q25oCBXHJcbiAgICAgICAgdGhpcy5fcmVmcmVzaEJ0blN0YXRlKCk7XHJcbiAgICAgICAgLy8g5Yik5pat5piv5ZCm6ZyA6KaB6aKE5Yqg6L295LiL5LiA6aG1XHJcbiAgICAgICAgdmFyIGxlbiA9IGRhdGFTaGVldHMubGVuZ3RoO1xyXG4gICAgICAgIGlmKGxlbiA9PT0gdGhpcy5fY3VyVG90YWwpe1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIOmihOWKoOi9veS4i+S4gOmhtVxyXG4gICAgICAgIHZhciBuZXh0UGFnZSA9IHRoaXMuX2N1clBhZ2UgKyAxO1xyXG4gICAgICAgIHRoaXMuc2RhdGFCYXNlLnByZWxvYWRUaHJlZU1lbnVEYXRhKHRoaXMuX2N1cklkLCBuZXh0UGFnZSwgdGhpcy5fbWVudVRvdGFsLCB0aGlzLmJpbmRBZnRlckxvYWRJbWFnZUNCKTtcclxuICAgIH0sXHJcbiAgICAvLyDmv4DmtLvoj5zljZXml7bop6blj5HnmoTkuovku7ZcclxuICAgIC8vIGlkOiDnianlk4HnmoRJRFxyXG4gICAgLy8gaGFzRHJhZyDmmK/lkKbmi5bnnYBcclxuICAgIG9wZW5NZW51OiBmdW5jdGlvbiAoaWQsIGhhc0RyYWcpIHtcclxuICAgICAgICB0aGlzLl9jdXJJZCA9IGlkO1xyXG4gICAgICAgIHRoaXMuX2N1clBhZ2UgPSAxO1xyXG4gICAgICAgIHRoaXMuX2hhc0RyYWcgPSBoYXNEcmFnO1xyXG4gICAgICAgIHRoaXMuX3JlZnJlc2hTaW5nbGVJdGVtcygpO1xyXG4gICAgICAgIC8vIOaYvuekuuW9k+WJjeeql+WPo1xyXG4gICAgICAgIHRoaXMuZW50aXR5LmFjdGl2ZSA9IHRydWU7XHJcbiAgICB9LFxyXG4gICAgY2xvc2VNZW51OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5fY3VySWQgPSAwO1xyXG4gICAgICAgIHRoaXMuX2N1clBhZ2UgPSAxO1xyXG4gICAgICAgIHRoaXMuZW50aXR5LmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgfSxcclxuICAgIC8vIOS4iuS4gOmhtVxyXG4gICAgX29uUHJldmlvdXNFdmVudDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuX2N1clBhZ2UgLT0gMTtcclxuICAgICAgICBpZiAodGhpcy5fY3VyUGFnZSA8IDEpe1xyXG4gICAgICAgICAgICB0aGlzLl9jdXJQYWdlID0gMTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fcmVmcmVzaFNpbmdsZUl0ZW1zKCk7XHJcbiAgICB9LFxyXG4gICAgLy8g5LiL5LiA6aG1XHJcbiAgICBfb25OZXh0RXZlbnQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLl9jdXJQYWdlICs9IDE7XHJcbiAgICAgICAgaWYgKHRoaXMuX2N1clBhZ2UgPiB0aGlzLl9tYXhQYWdlKXtcclxuICAgICAgICAgICAgdGhpcy5fY3VyUGFnZSA9IHRoaXMuX21heFBhZ2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3JlZnJlc2hTaW5nbGVJdGVtcygpO1xyXG4gICAgfSxcclxuICAgIC8vIOWFs+mXreW9k+WJjeiPnOWNlVxyXG4gICAgX29uQ2xvc2VNZW51OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5jbG9zZU1lbnUoKTtcclxuICAgIH0sXHJcbiAgICAvLyDliLfmlrDmjInpkq7nirbmgIFcclxuICAgIF9yZWZyZXNoQnRuU3RhdGU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLmJ0bl9QcmV2aW91cy5hY3RpdmUgPSB0aGlzLl9jdXJQYWdlID4gMTtcclxuICAgICAgICB0aGlzLmJ0bl9OZXh0LmFjdGl2ZSA9IHRoaXMuX2N1clBhZ2UgPCB0aGlzLl9tYXhQYWdlO1xyXG4gICAgfSxcclxuICAgIC8vIOWbvueJh+i9veWFpeWujOavleS7peWQjueahOWbnuiwg1xyXG4gICAgX0FmdGVyTG9hZEltYWdlQ2FsbEJhY2s6IGZ1bmN0aW9uIChpZCwgaW5kZXgsIHBhZ2UsIG1lbnVEYXRhKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2N1cklkID09PSBpZCAmJiB0aGlzLl9jdXJQYWdlID09PSBwYWdlKSB7XHJcbiAgICAgICAgICAgIHZhciBtZW51ID0gdGhpcy5fbWVudUxpc3RbaW5kZXhdO1xyXG4gICAgICAgICAgICBpZiAobWVudSkge1xyXG4gICAgICAgICAgICAgICAgbWVudS5yZWZyZXNoKG1lbnVEYXRhLCB0aGlzLl9vbkNyZWF0ZUZ1cm5pdHVyZUV2ZW50LmJpbmQodGhpcykpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIOW8gOWni1xyXG4gICAgc3RhcnQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAvLyDluLjnlKjnmoTlj5jph48v5pWw5o2uXHJcbiAgICAgICAgdmFyIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9TRGF0YUJhc2UnKTtcclxuICAgICAgICB0aGlzLnNkYXRhQmFzZSA9IGVudC5nZXRDb21wb25lbnQoJ1NEYXRhQmFzZScpO1xyXG4gICAgICAgIC8vIOiOt+WPluWFs+mXreaMiemSruW5tue7keWumuS6i+S7tlxyXG4gICAgICAgIGVudCA9IHRoaXMuZW50aXR5LmZpbmQoJ2J0bl9DbG9zZScpO1xyXG4gICAgICAgIHZhciBidG5DbG9zZSA9IGVudC5nZXRDb21wb25lbnQoRmlyZS5VSUJ1dHRvbik7XHJcbiAgICAgICAgYnRuQ2xvc2Uub25DbGljayA9IHRoaXMuX29uQ2xvc2VNZW51LmJpbmQodGhpcyk7XHJcbiAgICAgICAgLy8g5LiK5LiA6aG1XHJcbiAgICAgICAgdGhpcy5idG5fUHJldmlvdXMgPSB0aGlzLmVudGl0eS5maW5kKCdidG5fUHJldmlvdXMnKTtcclxuICAgICAgICB2YXIgYnRuX1ByZXZpb3VzID0gdGhpcy5idG5fUHJldmlvdXMuZ2V0Q29tcG9uZW50KEZpcmUuVUlCdXR0b24pO1xyXG4gICAgICAgIGJ0bl9QcmV2aW91cy5vbkNsaWNrID0gdGhpcy5fb25QcmV2aW91c0V2ZW50LmJpbmQodGhpcyk7XHJcbiAgICAgICAgLy8g5LiL5LiA6aG1XHJcbiAgICAgICAgdGhpcy5idG5fTmV4dCA9IHRoaXMuZW50aXR5LmZpbmQoJ2J0bl9OZXh0Jyk7XHJcbiAgICAgICAgdmFyIGJ0bl9OZXh0ID0gdGhpcy5idG5fTmV4dC5nZXRDb21wb25lbnQoRmlyZS5VSUJ1dHRvbik7XHJcbiAgICAgICAgYnRuX05leHQub25DbGljayA9IHRoaXMuX29uTmV4dEV2ZW50LmJpbmQodGhpcyk7XHJcbiAgICAgICAgLy9cclxuICAgICAgICB0aGlzLmJ0bl9QcmV2aW91cy5hY3RpdmUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmJ0bl9OZXh0LmFjdGl2ZSA9IGZhbHNlO1xyXG5cclxuICAgICAgICB0aGlzLmJpbmRBZnRlckxvYWRJbWFnZUNCID0gdGhpcy5fQWZ0ZXJMb2FkSW1hZ2VDYWxsQmFjay5iaW5kKHRoaXMpO1xyXG5cclxuICAgICAgICAvLyDpooTliqDovb1cclxuICAgICAgICB0aGlzLnNkYXRhQmFzZS5wcmVsb2FkVGhyZWVNZW51RGF0YSgxLCAxLCB0aGlzLl9tZW51VG90YWwsIHRoaXMuYmluZEFmdGVyTG9hZEltYWdlQ0IpO1xyXG4gICAgICAgIHRoaXMuc2RhdGFCYXNlLnByZWxvYWRUaHJlZU1lbnVEYXRhKDIsIDEsIHRoaXMuX21lbnVUb3RhbCwgdGhpcy5iaW5kQWZ0ZXJMb2FkSW1hZ2VDQik7XHJcbiAgICAgICAgdGhpcy5zZGF0YUJhc2UucHJlbG9hZFRocmVlTWVudURhdGEoMywgMSwgdGhpcy5fbWVudVRvdGFsLCB0aGlzLmJpbmRBZnRlckxvYWRJbWFnZUNCKTtcclxuICAgICAgICB0aGlzLnNkYXRhQmFzZS5wcmVsb2FkVGhyZWVNZW51RGF0YSg0LCAxLCB0aGlzLl9tZW51VG90YWwsIHRoaXMuYmluZEFmdGVyTG9hZEltYWdlQ0IpO1xyXG4gICAgICAgIHRoaXMuc2RhdGFCYXNlLnByZWxvYWRUaHJlZU1lbnVEYXRhKDUsIDEsIHRoaXMuX21lbnVUb3RhbCwgdGhpcy5iaW5kQWZ0ZXJMb2FkSW1hZ2VDQik7XHJcbiAgICAgICAgdGhpcy5zZGF0YUJhc2UucHJlbG9hZFRocmVlTWVudURhdGEoNiwgMSwgdGhpcy5fbWVudVRvdGFsLCB0aGlzLmJpbmRBZnRlckxvYWRJbWFnZUNCKTtcclxuICAgICAgICB0aGlzLnNkYXRhQmFzZS5wcmVsb2FkVGhyZWVNZW51RGF0YSg3LCAxLCB0aGlzLl9tZW51VG90YWwsIHRoaXMuYmluZEFmdGVyTG9hZEltYWdlQ0IpO1xyXG4gICAgICAgIHRoaXMuc2RhdGFCYXNlLnByZWxvYWRUaHJlZU1lbnVEYXRhKDgsIDEsIHRoaXMuX21lbnVUb3RhbCwgdGhpcy5iaW5kQWZ0ZXJMb2FkSW1hZ2VDQik7XHJcbiAgICB9LFxyXG5cclxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIC8vIOWMuemFjVVJ5YiG6L6o546HXHJcbiAgICAgICAgLy92YXIgY2FtZXJhID0gRmlyZS5DYW1lcmEubWFpbjtcclxuICAgICAgICAvL3ZhciBiZ1dvcmxkQm91bmRzID0gdGhpcy5zZGF0YUJhc2UuYmdSZW5kZXIuZ2V0V29ybGRCb3VuZHMoKTtcclxuICAgICAgICAvL3ZhciBiZ0xlZnRUb3BXb3JsZFBvcyA9IG5ldyBGaXJlLlZlYzIoYmdXb3JsZEJvdW5kcy54TWluLCBiZ1dvcmxkQm91bmRzLnlNaW4pO1xyXG4gICAgICAgIC8vdmFyIGJnbGVmdFRvcCA9IGNhbWVyYS53b3JsZFRvU2NyZWVuKGJnTGVmdFRvcFdvcmxkUG9zKTtcclxuICAgICAgICAvL3ZhciBzY3JlZW5Qb3MgPSBuZXcgRmlyZS5WZWMyKGJnbGVmdFRvcC54LCBiZ2xlZnRUb3AueSk7XHJcbiAgICAgICAgLy92YXIgd29ybGRQb3MgPSBjYW1lcmEuc2NyZWVuVG9Xb3JsZChzY3JlZW5Qb3MpO1xyXG4gICAgICAgIC8vdGhpcy5lbnRpdHkudHJhbnNmb3JtLndvcmxkUG9zaXRpb24gPSB3b3JsZFBvcztcclxuICAgICAgICAvLyDljLnphY1VSeWIhui+qOeOh1xyXG4gICAgICAgIHZhciBjYW1lcmEgPSBGaXJlLkNhbWVyYS5tYWluO1xyXG4gICAgICAgIHZhciBzY3JlZW5TaXplID0gRmlyZS5TY3JlZW4uc2l6ZS5tdWwoY2FtZXJhLnNpemUgLyBGaXJlLlNjcmVlbi5oZWlnaHQpO1xyXG4gICAgICAgIHZhciBuZXdQb3MgPSBGaXJlLnYyKHRoaXMubWFyZ2luLngsIC1zY3JlZW5TaXplLnkgLyAyICsgdGhpcy5tYXJnaW4ueSk7XHJcbiAgICAgICAgdGhpcy5lbnRpdHkudHJhbnNmb3JtLnBvc2l0aW9uID0gbmV3UG9zO1xyXG4gICAgfVxyXG59KTtcclxuXG5GaXJlLl9SRnBvcCgpOyIsIkZpcmUuX1JGcHVzaChtb2R1bGUsICdmMjhhN1pIV3FwR0FJdk5uZlBidzdDYicsICdTVGhyZWVNZW51Jyk7XG4vLyBzY3JpcHRcXHNpbmdsZVxcU1RocmVlTWVudS5qc1xuXG52YXIgU1RocmVlTWVudSA9IEZpcmUuQ2xhc3Moe1xyXG4gICAgLy8g57un5om/XHJcbiAgICBleHRlbmRzOiBGaXJlLkNvbXBvbmVudCxcclxuICAgIC8vIOaehOmAoOWHveaVsFxyXG4gICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAvLyDkuIvovb3mrKHmlbBcclxuICAgICAgICB0aGlzLl9idG5NZW51ID0gbnVsbDtcclxuICAgIH0sXHJcbiAgICAvLyDlsZ7mgKdcclxuICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICB0TmFtZTogJycsXHJcbiAgICAgICAgLy8gSURcclxuICAgICAgICBzdWl0X2lkOiAwLFxyXG4gICAgICAgIC8vIOWkp+WbvlVybFxyXG4gICAgICAgIGJpZ0ltYWdlVXJsOiAnJyxcclxuICAgICAgICAvLyDovb3lhaXml7bnmoTlm77niYdcclxuICAgICAgICBkZWZhdWx0U3ByaXRlOiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuU3ByaXRlXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIOmHjee9ruWutuWFt1xyXG4gICAgcmVzZXRNZW51OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5fYnRuTWVudS5zZXRUZXh0KCfovb3lhaXkuK0nKTtcclxuICAgICAgICB0aGlzLl9idG5NZW51LnNldFNwcml0ZSh0aGlzLmRlZmF1bHRTcHJpdGUpO1xyXG4gICAgICAgIHRoaXMuX2J0bk1lbnUub25DbGljayA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5lbnRpdHkuYWN0aXZlID0gZmFsc2U7XHJcbiAgICB9LFxyXG4gICAgLy8g6K6+572u5paH5a2XXHJcbiAgICBzZXRUZXh0OiBmdW5jdGlvbiAodGV4dCkge1xyXG4gICAgICAgIHRoaXMuX2J0bk1lbnUuc2V0VGV4dCh0ZXh0KTtcclxuICAgIH0sXHJcbiAgICAvLyDorr7nva7lm77niYdcclxuICAgIHNldFNwcml0ZTogZnVuY3Rpb24gKHNtYWxsU3ByaXRlLCBldmVudCkge1xyXG4gICAgICAgIHRoaXMuX2J0bk1lbnUuc2V0U3ByaXRlKHNtYWxsU3ByaXRlKTtcclxuICAgICAgICBpZiAoZXZlbnQpIHtcclxuICAgICAgICAgICAgdGhpcy5fYnRuTWVudS5vbkNsaWNrID0gZXZlbnQ7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIOWIneWni+WMllxyXG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBlbnQgPSBudWxsO1xyXG4gICAgICAgIGlmICghIHRoaXMuX2J0bk1lbnUpIHtcclxuICAgICAgICAgICAgZW50ID0gdGhpcy5lbnRpdHkuZmluZCgnYnRuX21lbnUnKTtcclxuICAgICAgICAgICAgdGhpcy5fYnRuTWVudSA9IGVudC5nZXRDb21wb25lbnQoRmlyZS5VSUJ1dHRvbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMucmVzZXRNZW51KCk7XHJcbiAgICB9LFxyXG4gICAgLy8g5Yi35paw5bey5LiL6L296L+H5ZCO55qE5pWw5o2uXHJcbiAgICByZWZyZXNoOiBmdW5jdGlvbiAoZGF0YSwgYmluZEV2ZW50KSB7XHJcbiAgICAgICAgdGhpcy5lbnRpdHkubmFtZSA9IGRhdGEuc3VpdF9pZDtcclxuICAgICAgICB0aGlzLnN1aXRfaWQgPSBkYXRhLnN1aXRfaWQ7XHJcbiAgICAgICAgdGhpcy50TmFtZSA9IGRhdGEubmFtZTtcclxuICAgICAgICB0aGlzLmJpZ0ltYWdlVXJsID0gZGF0YS5iaWdJbWFnZVVybDtcclxuICAgICAgICB0aGlzLnNldFRleHQoZGF0YS5uYW1lKTtcclxuICAgICAgICBpZiAoZGF0YS5zbWFsbFNwcml0ZSkge1xyXG4gICAgICAgICAgICB0aGlzLnNldFNwcml0ZShkYXRhLnNtYWxsU3ByaXRlLCBiaW5kRXZlbnQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmVudGl0eS5hY3RpdmUgPSB0cnVlO1xyXG4gICAgfVxyXG59KTtcclxuXG5GaXJlLl9SRnBvcCgpOyIsIkZpcmUuX1JGcHVzaChtb2R1bGUsICdlNTkyODdrcTRCS09JQkpiYStWT1g0KycsICdTVGlwc1dpbmRvdycpO1xuLy8gc2NyaXB0XFxzaW5nbGVcXFNUaXBzV2luZG93LmpzXG5cbnZhciBUaXBzV2luZG93ID0gRmlyZS5DbGFzcyh7XHJcbiAgICAvLyDvv73Ms++/vVxyXG4gICAgZXh0ZW5kczogRmlyZS5Db21wb25lbnQsXHJcbiAgICAvLyDvv73vv73vv73suq/vv73vv71cclxuICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5vbkNhbGxFdmVudCA9IG51bGw7XHJcbiAgICB9LFxyXG4gICAgLy8g77+977+977+977+9XHJcbiAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgY29udGVudDp7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuQml0bWFwVGV4dFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYnRuX0NvbmZpcm06e1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlVJQnV0dG9uXHJcbiAgICAgICAgfSxcclxuICAgICAgICBidG5fQ2xvc2U6e1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlVJQnV0dG9uXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIO+/vfK/qrTvv73vv73vv71cclxuICAgIG9wZW5XaW5kb3c6IGZ1bmN0aW9uICh0ZXh0LCBjYWxsYmFjaykge1xyXG4gICAgICAgIHRoaXMuZW50aXR5LmFjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgaWYgKHRleHQpIHtcclxuICAgICAgICAgICAgdGhpcy5zZXRDb250ZW50KHRleHQpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLm9uQ2FsbEV2ZW50ID0gbnVsbDtcclxuICAgICAgICBpZiAoY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgdGhpcy5vbkNhbGxFdmVudCA9IGNhbGxiYWNrO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvLyDvv73YsdW077+977+977+9XHJcbiAgICBjbG9zZVdpbmRvdzogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuZW50aXR5LmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgfSxcclxuICAgIC8vIO+/ve+/ve+/vcO177+977+9w7rvv73vv73vv71cclxuICAgIHNldENvbnRlbnQ6IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgIHRoaXMuY29udGVudC50ZXh0ID0gZXZlbnQ7XHJcbiAgICB9LFxyXG4gICAgLy8g77+92LHVtO+/ve+/ve+/vVxyXG4gICAgX29uQ2xvc2VXaW5kb3c6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLmNsb3NlV2luZG93KCk7XHJcbiAgICB9LFxyXG4gICAgLy8gyLfvv73vv73vv73CvO+/vVxyXG4gICAgX29uQ29uZmlybUV2ZW50OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5lbnRpdHkuYWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgaWYgKHRoaXMub25DYWxsRXZlbnQpIHtcclxuICAgICAgICAgICAgdGhpcy5vbkNhbGxFdmVudCgpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvL1xyXG4gICAgb25Mb2FkOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5idG5fQ29uZmlybS5vbkNsaWNrID0gdGhpcy5fb25Db25maXJtRXZlbnQuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLmJ0bl9DbG9zZS5vbkNsaWNrID0gdGhpcy5fb25DbG9zZVdpbmRvdy5iaW5kKHRoaXMpO1xyXG4gICAgfVxyXG59KTtcclxuXG5GaXJlLl9SRnBvcCgpOyIsIkZpcmUuX1JGcHVzaChtb2R1bGUsICc4NzQ4Y1NIenlOQUdaRklHdWpzZ1RqZScsICdTY3JlZW5zaG90Jyk7XG4vLyBzY3JpcHRcXHNpbmdsZVxcU2NyZWVuc2hvdC5qc1xuXG5mdW5jdGlvbiBjb252ZXJ0Q2FudmFzVG9JbWFnZShjYW52YXMpIHtcclxuICAgIHZhciBpbWFnZSA9IG5ldyBJbWFnZSgpO1xyXG4gICAgaW1hZ2Uuc3JjID0gY2FudmFzLnRvRGF0YVVSTChcImltYWdlL3BuZ1wiKTtcclxuICAgIC8vY2FudmFzLmdldEltYWdlRGF0YSgpXHJcbiAgICByZXR1cm4gaW1hZ2U7XHJcbn1cclxuLy8g55So5LqO5Yib5bu657yp55Wl5Zu+XHJcbnZhciBTY3JlZW5zaG90ID0gRmlyZS5DbGFzcyh7XHJcbiAgICBleHRlbmRzOiBGaXJlLkNvbXBvbmVudCxcclxuICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgLy8g55So5LqO5ouN54WnXHJcbiAgICAgICAgdGhpcy5mcmFtZUNvdW50ID0gLTE7XHJcbiAgICAgICAgdGhpcy5uZWVkSGlkZUVudExpc3QgPSBbXTtcclxuICAgICAgICB0aGlzLmNhbGxiYWNrID0gbnVsbDtcclxuICAgIH0sXHJcbiAgICAvLyDlsZ7mgKdcclxuICAgIHByb3BlcnRpZXM6IHtcclxuXHJcbiAgICB9LFxyXG4gICAgLy8g6L295YWl5pe2XHJcbiAgICBvbkxvYWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBlbnQgPSBGaXJlLkVudGl0eS5maW5kKCcvU0RhdGFCYXNlJyk7XHJcbiAgICAgICAgdGhpcy5zZGF0YUJhc2UgPSBlbnQuZ2V0Q29tcG9uZW50KCdTRGF0YUJhc2UnKTtcclxuICAgIH0sXHJcbiAgICAvLyDliJvlu7rnvKnnlaXlm75cclxuICAgIGNyZWF0ZVRodW1ibmFpbHM6IGZ1bmN0aW9uIChjYWxsYmFjaykge1xyXG4gICAgICAgIGlmIChjYWxsYmFjayl7XHJcbiAgICAgICAgICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8g5YWz6Zet5bey57uP5omT5byA55WM6Z2iXHJcbiAgICAgICAgdGhpcy5uZWVkSGlkZUVudExpc3QgPSBbXTtcclxuICAgICAgICB2YXIgY2hpbGRyZW4gPSBGaXJlLkVuZ2luZS5fc2NlbmUuZW50aXRpZXM7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGNoaWxkcmVuLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XHJcbiAgICAgICAgICAgIHZhciBlbnQgPSBjaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgaWYgKGVudC5hY3RpdmUgJiYgZW50Lm5hbWUgIT09ICdNYWluIENhbWVyYScgJiZcclxuICAgICAgICAgICAgICAgIGVudC5uYW1lICE9PSAnU2NlbmUgQ2FtZXJhJyAmJiBlbnQubmFtZSAhPT0gJ1Jvb20nICYmXHJcbiAgICAgICAgICAgICAgICBlbnQubmFtZSAhPT0gJ1NjcmVlbnNob3QnKSB7XHJcbiAgICAgICAgICAgICAgICBlbnQuYWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm5lZWRIaWRlRW50TGlzdC5wdXNoKGVudCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgLy8g5Yib5bu6IENhbnZhc1xyXG4gICAgICAgIGlmICghdGhpcy5jYW52YXNDdHhUb0RyZWF3SW1hZ2UpIHtcclxuICAgICAgICAgICAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xyXG4gICAgICAgICAgICBjYW52YXMud2lkdGggPSAxMjA7XHJcbiAgICAgICAgICAgIGNhbnZhcy5oZWlnaHQgPSAxMjA7XHJcbiAgICAgICAgICAgIHRoaXMuY2FudmFzQ3R4VG9EcmVhd0ltYWdlID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZnJhbWVDb3VudCA9IEZpcmUuVGltZS5mcmFtZUNvdW50ICsgMjtcclxuICAgIH0sXHJcbiAgICAvLyDliLfmlrBcclxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICh0aGlzLmZyYW1lQ291bnQgIT09IC0xICYmIHRoaXMuZnJhbWVDb3VudCA9PT0gRmlyZS5UaW1lLmZyYW1lQ291bnQpIHtcclxuICAgICAgICAgICAgLy8g57uY5Yi25Zu+54mHXHJcbiAgICAgICAgICAgIHRoaXMuY2FudmFzQ3R4VG9EcmVhd0ltYWdlLmNsZWFyUmVjdCgwLCAwLCAxMjAsIDEyMCk7XHJcbiAgICAgICAgICAgIHZhciB3ID0gRmlyZS5FbmdpbmUuX3JlbmRlckNvbnRleHQud2lkdGg7XHJcbiAgICAgICAgICAgIHZhciBoID0gRmlyZS5FbmdpbmUuX3JlbmRlckNvbnRleHQuaGVpZ2h0O1xyXG4gICAgICAgICAgICB2YXIgbWFpbkltYWdlID0gY29udmVydENhbnZhc1RvSW1hZ2UoRmlyZS5FbmdpbmUuX3JlbmRlckNvbnRleHQuY2FudmFzKTtcclxuICAgICAgICAgICAgdGhpcy5zZGF0YUJhc2Uuc2xvYWRpbmdUaXBzLm9wZW5UaXBzKCfliJvlu7rnvKnnlaXlm74nKTtcclxuICAgICAgICAgICAgbWFpbkltYWdlLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuY2FudmFzQ3R4VG9EcmVhd0ltYWdlLmRyYXdJbWFnZShtYWluSW1hZ2UsIDAsIDAsIHcsIGgsIDAsIDAsIDEyMCwgMTIwKTtcclxuICAgICAgICAgICAgICAgIHZhciBpbWFnZSA9IGNvbnZlcnRDYW52YXNUb0ltYWdlKHRoaXMuY2FudmFzQ3R4VG9EcmVhd0ltYWdlLmNhbnZhcyk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNkYXRhQmFzZS5zbG9hZGluZ1RpcHMuY2xvc2VUaXBzKCk7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jYWxsYmFjaykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2FsbGJhY2soaW1hZ2UpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LmJpbmQodGhpcyk7XHJcbiAgICAgICAgICAgIC8vIOaJk+W8gOS5i+WJjeWFs+mXreeahOeVjOmdolxyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gdGhpcy5uZWVkSGlkZUVudExpc3QubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMubmVlZEhpZGVFbnRMaXN0W2ldLmFjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5mcmFtZUNvdW50ID0gLTE7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KTtcclxuXG5GaXJlLl9SRnBvcCgpOyIsIkZpcmUuX1JGcHVzaChtb2R1bGUsICdhOTBmNThhMzk1RGhZemlTd1hrRHY3cycsICdTZWNvbmRNZW51TWdyJyk7XG4vLyBzY3JpcHRcXHZpbGxhXFxTZWNvbmRNZW51TWdyLmpzXG5cbi8vIOS6jOe6p+iPnOWNleeuoeeQhuexu1xudmFyIFNlY29uZE1lbnVNZ3IgPSBGaXJlLkNsYXNzKHtcbiAgICAvLyDnu6fmib9cbiAgICBleHRlbmRzOiBGaXJlLkNvbXBvbmVudCxcbiAgICAvLyDmnoTpgKDlh73mlbBcbiAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyDlrrblhbfnsbvlnovmgLvmlbBcbiAgICAgICAgdGhpcy5fZnVybml0dXJlVHlwZVRvdGFsID0gODtcbiAgICAgICAgLy8g6I+c5Y2V5YiX6KGoXG4gICAgICAgIHRoaXMuX21lbnVMaXN0ID0gW107XG4gICAgICAgIC8vIOW9k+WJjemAieaLqXR5cGUgMSDljZXlk4EgMiDlpZfoo4UgMyDnianlk4Hmn5xcbiAgICAgICAgdGhpcy5fY3VyVHlwZSA9IDE7XG4gICAgICAgIC8vIOWll+ijheS4gOmhteaYvuekuuWkmuWwkeS4qlxuICAgICAgICB0aGlzLl9zdXRpSXRlbVNob3dUb3RhbCA9IDU7XG4gICAgICAgIC8vIOW9k+WJjeacgOWkp+aVsOmHj1xuICAgICAgICB0aGlzLl9jdXJUb3RhbCA9IDA7XG4gICAgICAgIC8vIOW9k+WJjemhteaVsFxuICAgICAgICB0aGlzLl9jdXJQYWdlID0gMTtcbiAgICAgICAgLy8g5pyA5aSn6aG15pWwXG4gICAgICAgIHRoaXMuX21heFBhZ2UgPSAxO1xuICAgICAgICAvLyDliJvlu7rlpZfoo4XlrrblhbfliLDlnLrmma/kuK1cbiAgICAgICAgdGhpcy5iaW5kQ3JlYXRlU3VpdEl0ZW1FdmVudCA9IHRoaXMuX29uQ3JlYXRlU3VpdEl0ZW1FdmVudC5iaW5kKHRoaXMpO1xuICAgICAgICAvLyDmiZPlvIDkuInnuqfoj5zljZXkuovku7ZcbiAgICAgICAgdGhpcy5iaW5kT3BlblRocmVlTWVudUV2ZW50ID0gdGhpcy5fb25PcGVuVGhyZWVNZW51RXZlbnQuYmluZCh0aGlzKTtcbiAgICAgICAgLy8g5Y2V5ZOB6I+c5Y2V5Zue6LCD5Ye95pWwXG4gICAgICAgIHRoaXMuYmluZFJlZnJlc2hTaW5nbGVJdGVtc01lbnUgPSB0aGlzLl9yZWZyZXNoU2luZ2xlSXRlbXNNZW51LmJpbmQodGhpcyk7XG4gICAgICAgIC8vIOWll+ijheiPnOWNleWbnuiwg+WHveaVsFxuICAgICAgICB0aGlzLmJpbmRSZWZyZXNoU3VpdEl0ZW1zTWVudSA9IHRoaXMuX3JlZnJlc2hTdWl0SXRlbXNNZW51LmJpbmQodGhpcyk7XG4gICAgICAgIC8vIOmihOWtmOacjeWKoeWZqOaVsOaNruWIl+ihqFxuICAgICAgICB0aGlzLnNlcnZlclN1aXREYXRhTGlzdCA9IHt9O1xuICAgIH0sXG4gICAgLy8g5bGe5oCnXG4gICAgcHJvcGVydGllczoge1xuICAgICAgICAvL1xuICAgICAgICBtYXJnaW46IG5ldyBGaXJlLlZlYzIoLTEwOTAsIDApLFxuICAgICAgICAvLyDkuoznuqfoj5zljZXnmoTmoLnoioLngrlcbiAgICAgICAgcm9vdDoge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuRW50aXR5XG4gICAgICAgIH0sXG4gICAgICAgIC8vIOS4iuS4gOmhtVxuICAgICAgICBidG5fTGVmdDoge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuRW50aXR5XG4gICAgICAgIH0sXG4gICAgICAgIC8vIOS4i+S4gOmhtVxuICAgICAgICBidG5fUmlnaHQ6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLkVudGl0eVxuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyDmiZPlvIDlkITkuKrnsbvlnovlrrblhbfliJfooahcbiAgICBfb25PcGVuVGhyZWVNZW51RXZlbnQ6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICB2YXIgbWVudSA9IGV2ZW50LnRhcmdldC5wYXJlbnQuZ2V0Q29tcG9uZW50KCdTZWNvbmRNZW51Jyk7XG4gICAgICAgIGNvbnNvbGUubG9nKCfojrflj5YnICsgbWVudS50aWQgKyBcIuexu+Wei+WutuWFt+WIl+ihqFwiKTtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAvLyDlpoLmnpzmmK/nianlk4HnmoTor53lsLHpnIDopoHlhYjor7fmsYLmnI3liqHlmajkv6Hmga9cbiAgICAgICAgaWYgKHNlbGYuX2N1clR5cGUgPT09IDIpIHtcbiAgICAgICAgICAgIHZhciB0ZXh0ID0gJ+ivt+axguWNleWTgeaVsOaNru+8jOivt+eojeWQji4uLicsIGVhY2hudW0gPSA3O1xuICAgICAgICAgICAgaWYgKG1lbnUudGlkID09PSAxKSB7XG4gICAgICAgICAgICAgICAgdGV4dCA9ICfor7fmsYLlpZfoo4XmlbDmja7vvIzor7fnqI3lkI4uLi4nO1xuICAgICAgICAgICAgICAgIGVhY2hudW0gPSA1O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS5sb2FkVGlwcy5vcGVuVGlwcyh0ZXh0KTtcbiAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UubG9hZEJhY2twYWNrRGF0YShtZW51LnRpZCwgMSwgZWFjaG51bSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UubG9hZFRpcHMuY2xvc2VUaXBzKCk7XG4gICAgICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS50aHJlZU1lbnVNZ3Iub3Blbk1lbnUobWVudS50aWQsIHNlbGYuX2N1clR5cGUsIG1lbnUuaGFzRHJhZyk7XG4gICAgICAgICAgICAgICAgc2VsZi5lbnRpdHkuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZGF0YUJhc2UudGhyZWVNZW51TWdyLm9wZW5NZW51KG1lbnUudGlkLCB0aGlzLl9jdXJUeXBlLCBtZW51Lmhhc0RyYWcpO1xuICAgICAgICAgICAgdGhpcy5lbnRpdHkuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIOWIm+W7uuWll+ijheWIsOWcuuaZr+S4rVxuICAgIF9vbkNyZWF0ZVN1aXRJdGVtRXZlbnQ6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICB2YXIgc2Vjb25kTWVudSA9IGV2ZW50LnRhcmdldC5wYXJlbnQuZ2V0Q29tcG9uZW50KCdTZWNvbmRNZW51Jyk7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgLy8g5Yig6Zmk5aWX6KOFXG4gICAgICAgIHNlbGYuZGF0YUJhc2UucmVtb3ZlU3VpdCgpO1xuICAgICAgICAvLyDph43mlrDotYvlgLzlpZfoo4VcbiAgICAgICAgc2VsZi5kYXRhQmFzZS5jdXJEcmVzc1N1aXQgPSB7XG4gICAgICAgICAgICAvLyDlpZfoo4VJRFxuICAgICAgICAgICAgc3VpdF9pZDogc2Vjb25kTWVudS50aWQsXG4gICAgICAgICAgICAvLyDog4zljIVJRFxuICAgICAgICAgICAgcGFja19pZDogMCxcbiAgICAgICAgICAgIC8vIOWll+ijheWwj+WbvlxuICAgICAgICAgICAgc3VpdF9pY29uOiBzZWNvbmRNZW51LnNtYWxsU3ByaXRlLFxuICAgICAgICAgICAgLy8g5aWX6KOF5ZCN56ewXG4gICAgICAgICAgICBzdWl0X25hbWU6IHNlY29uZE1lbnUudG5hbWUsXG4gICAgICAgICAgICAvLyDlpZfoo4XmnaXoh6rlk6rph4zvvIwxLuiDjOWMhSAyLuWVhuWfjlxuICAgICAgICAgICAgc3VpdF9mcm9tOiAyLFxuICAgICAgICAgICAgLy8g5aWX6KOF5Lu35qC8XG4gICAgICAgICAgICBwcmljZTogc2Vjb25kTWVudS5wcmljZSxcbiAgICAgICAgICAgIC8vIOaKmOaJo1xuICAgICAgICAgICAgZGlzY291bnQ6IHNlY29uZE1lbnUuZGlzY291bnQsXG4gICAgICAgICAgICAvLyDlpZfoo4XliJfooahcbiAgICAgICAgICAgIGZ1bnJuaXR1cmVMaXN0OiBbXVxuICAgICAgICB9O1xuICAgICAgICB2YXIgc2VydmVyRGF0YSA9IHRoaXMuc2VydmVyU3VpdERhdGFMaXN0W3NlY29uZE1lbnUudGlkXTtcbiAgICAgICAgaWYgKHNlcnZlckRhdGEpIHtcbiAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UuY3JlYXRlRnVybml0dXJlVG9TY3JlZW4oc2VydmVyRGF0YS5saXN0LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS5sb2FkVGlwcy5jbG9zZVRpcHMoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS5sb2FkVGlwcy5vcGVuVGlwcygn5Yib5bu65aWX6KOF77yM6K+356iN5ZCOLi4uJyk7XG4gICAgICAgICAgICBzZWxmLmRhdGFCYXNlLm5ldFdvcmtNZ3IuUmVxdWVzdFNldEl0ZW1zRGF0YShzZWNvbmRNZW51LnRpZCwgZnVuY3Rpb24gKHNlcnZlckRhdGEpIHtcbiAgICAgICAgICAgICAgICBzZWxmLnNlcnZlclN1aXREYXRhTGlzdFtzZWNvbmRNZW51LnRpZF0gPSBzZXJ2ZXJEYXRhO1xuICAgICAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UuY3JlYXRlRnVybml0dXJlVG9TY3JlZW4oc2VydmVyRGF0YS5saXN0LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UubG9hZFRpcHMuY2xvc2VUaXBzKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy8g5YWz6Zet5b2T5YmN6I+c5Y2VXG4gICAgY2xvc2VNZW51OiBmdW5jdGlvbiAoaGFzTW9kaWZ5VG9nZ2xlKSB7XG4gICAgICAgIGlmICghdGhpcy5lbnRpdHkuYWN0aXZlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fY3VyUGFnZSA9IDE7XG4gICAgICAgIHRoaXMuZW50aXR5LmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICBpZiAoaGFzTW9kaWZ5VG9nZ2xlKSB7XG4gICAgICAgICAgICB0aGlzLmRhdGFCYXNlLmZpcnN0TWVudU1nci5tb2RpZnlUb2dnbGUoKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy8g5YWz6Zet5b2T5YmN6I+c5Y2VXG4gICAgX29uQ2xvc2VNZW51OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuY2xvc2VNZW51KHRydWUpO1xuICAgIH0sXG4gICAgLy8g6YeN572u6I+c5Y2V5YiX6KGoXG4gICAgX3Jlc2V0TWVudTogZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5fbWVudUxpc3QubGVuZ3RoID09PSAwKXtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX2Z1cm5pdHVyZVR5cGVUb3RhbDsgKytpKSB7XG4gICAgICAgICAgICB2YXIgbWVudSA9IHRoaXMuX21lbnVMaXN0W2ldO1xuICAgICAgICAgICAgbWVudS5uYW1lID0gaS50b1N0cmluZygpO1xuICAgICAgICAgICAgbWVudS5yZXNldE1lbnUoKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy8g5Yib5bu66I+c5Y2V5oyJ6ZKu5bm25LiU57uR5a6a5LqL5Lu2XG4gICAgX2luaXRNZW51OiBmdW5jdGlvbiAoaWQpIHtcbiAgICAgICAgLy8g5Yib5bu65a655ZmoXG4gICAgICAgIHRoaXMuX2NyZWF0ZU1lbnVDb250YWluZXJzKCk7XG4gICAgICAgIHRoaXMuX3Jlc2V0TWVudSgpO1xuICAgICAgICBzd2l0Y2goaWQpe1xuICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgIHRoaXMuX3NpbmdsZUl0ZW1zTWVudSgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgIHRoaXMuX3N1aXRJdGVtc01lbnUoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICB0aGlzLl9pdGVtc0NhYmluZXRNZW51KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyDliJvlu7rlrrnlmahcbiAgICBfY3JlYXRlTWVudUNvbnRhaW5lcnM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMuX21lbnVMaXN0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgdGVtcE1lbnUgPSB0aGlzLmRhdGFCYXNlLnRlbXBTdWJTZWNvbmRNZW51O1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX2Z1cm5pdHVyZVR5cGVUb3RhbDsgKytpKSB7XG4gICAgICAgICAgICB2YXIgZW50ID0gRmlyZS5pbnN0YW50aWF0ZSh0ZW1wTWVudSk7XG4gICAgICAgICAgICBlbnQubmFtZSA9IGkudG9TdHJpbmcoKTtcbiAgICAgICAgICAgIGVudC5wYXJlbnQgPSB0aGlzLnJvb3Q7XG4gICAgICAgICAgICBlbnQudHJhbnNmb3JtLnBvc2l0aW9uID0gbmV3IEZpcmUuVmVjMigtNTcwICsgKGkgKiAxNjApLCAyNSk7XG4gICAgICAgICAgICB2YXIgbWVudSA9IGVudC5nZXRDb21wb25lbnQoJ1NlY29uZE1lbnUnKTtcbiAgICAgICAgICAgIG1lbnUuaW5pdCgpO1xuICAgICAgICAgICAgLy8g5a2Y5YKo5a+56LGhXG4gICAgICAgICAgICB0aGlzLl9tZW51TGlzdC5wdXNoKG1lbnUpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyDliLfmlrDljZXlk4Hlrrblhbfoj5zljZXliJfooahcbiAgICBfc2luZ2xlSXRlbXNNZW51OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBkYXRhTGlzdCA9IHRoaXMuZGF0YUJhc2Uuc2luZ2xlX1NlY29uZF9EYXRhU2hlZXRzO1xuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgZGF0YUxpc3QubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIHZhciBkYXRhID0gZGF0YUxpc3RbaV07XG4gICAgICAgICAgICB2YXIgbWVudSA9IHRoaXMuX21lbnVMaXN0W2ldO1xuICAgICAgICAgICAgbWVudS5lbnRpdHkudHJhbnNmb3JtLnBvc2l0aW9uID0gbmV3IEZpcmUuVmVjMigtNTcwICsgKGkgKiAxNjApLCAyNSk7XG4gICAgICAgICAgICBtZW51LnJlZnJlc2goZGF0YSwgdGhpcy5iaW5kT3BlblRocmVlTWVudUV2ZW50KTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy8g5Yi35paw5aWX6KOF5a625YW36I+c5Y2V5YiX6KGoXG4gICAgX3N1aXRJdGVtc01lbnU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8g6YeN572u5pWw5o2uXG4gICAgICAgIHRoaXMuX3Jlc2V0TWVudSgpO1xuICAgICAgICAvLyDlpoLmnpzmgLvmlbDph4/mnInmm7TmlrDlsLHph43mlrDorqHnrpfmnIDlpKfpobXmlbBcbiAgICAgICAgaWYgKHRoaXMuX2N1clRvdGFsICE9PSB0aGlzLmRhdGFCYXNlLnN1aXRJdGVtc19UaHJlZV9Ub3RhbCkge1xuICAgICAgICAgICAgdGhpcy5fY3VyVG90YWwgPSB0aGlzLmRhdGFCYXNlLnN1aXRJdGVtc19UaHJlZV9Ub3RhbDtcbiAgICAgICAgICAgIHRoaXMuX21heFBhZ2UgPSBNYXRoLmNlaWwodGhpcy5fY3VyVG90YWwgLyB0aGlzLl9zdXRpSXRlbVNob3dUb3RhbCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8g5pi+56S65aWX6KOF6I+c5Y2VXG4gICAgICAgIHZhciBpbmRleCA9IDA7XG4gICAgICAgIHZhciBzdGFydE51bSA9ICh0aGlzLl9jdXJQYWdlIC0gMSkgKiB0aGlzLl9zdXRpSXRlbVNob3dUb3RhbDtcbiAgICAgICAgdmFyIGVuZE51bSA9IHN0YXJ0TnVtICsgdGhpcy5fc3V0aUl0ZW1TaG93VG90YWw7XG4gICAgICAgIGlmIChlbmROdW0gPiB0aGlzLl9jdXJUb3RhbCkge1xuICAgICAgICAgICAgZW5kTnVtID0gdGhpcy5fY3VyVG90YWw7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGRhdGFMaXN0ID0gdGhpcy5kYXRhQmFzZS5zdWl0SXRlbXNfU2Vjb25kX0RhdGFTaGVldHM7XG4gICAgICAgIGZvciAodmFyIGkgPSBzdGFydE51bTsgaSA8IGVuZE51bTsgKytpKSB7XG4gICAgICAgICAgICB2YXIgaXRlbXMgPSBkYXRhTGlzdFtpXTtcbiAgICAgICAgICAgIHZhciBtZW51ID0gdGhpcy5fbWVudUxpc3RbaW5kZXhdO1xuICAgICAgICAgICAgbWVudS5lbnRpdHkudHJhbnNmb3JtLnBvc2l0aW9uID0gbmV3IEZpcmUuVmVjMigtNTAwICsgKGluZGV4ICogMjUwKSwgNjApO1xuICAgICAgICAgICAgbWVudS5yZWZyZXNoX3N1aXRJdGVtcyhpdGVtcywgdGhpcy5iaW5kQ3JlYXRlU3VpdEl0ZW1FdmVudCk7XG4gICAgICAgICAgICBpbmRleCsrO1xuICAgICAgICB9XG4gICAgICAgIC8vIOWIt+aWsOaMiemSrueKtuaAgVxuICAgICAgICB0aGlzLl9yZWZyZXNoQnRuU3RhdGUoKTtcbiAgICAgICAgLy8g5Yik5pat5piv5ZCm6ZyA6KaB6aKE5Yqg6L295LiL5LiA6aG1XG4gICAgICAgIHZhciBsZW4gPSB0aGlzLmRhdGFCYXNlLnN1aXRJdGVtc19TZWNvbmRfRGF0YVNoZWV0cy5sZW5ndGg7XG4gICAgICAgIGlmIChsZW4gPT09IHRoaXMuZGF0YUJhc2Uuc3VpdEl0ZW1zX1RocmVlX1RvdGFsKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8g6aKE5Yqg6L29XG4gICAgICAgIC8vdmFyIG5leHRQYWdlID0gdGhpcy5fY3VyUGFnZSArIDE7XG4gICAgICAgIC8vdGhpcy5kYXRhQmFzZS5wcmVsb2FkU3VpdEl0ZW1zRGF0YV9TZWNvbmQobmV4dFBhZ2UsIHRoaXMuX3N1dGlJdGVtU2hvd1RvdGFsLCB0aGlzLmJpbmRSZWZyZXNoU3VpdEl0ZW1zTWVudSk7XG4gICAgfSxcbiAgICAvLyDliLfmlrDnianlk4Hmn5zliJfooahcbiAgICBfaXRlbXNDYWJpbmV0TWVudTogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyDph43mlrDliLfmlrDkuIvovb3lkI7nmoTlm77niYfmlbDmja5cbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB2YXIgbG9hZEltYWdlQ2FsbEJhY2sgPSBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgdmFyIG1lbnUgPSBzZWxmLl9tZW51TGlzdFtkYXRhLnRpZF07XG4gICAgICAgICAgICBtZW51LnJlZnJlc2goZGF0YSwgc2VsZi5iaW5kT3BlblRocmVlTWVudUV2ZW50KTtcbiAgICAgICAgfTtcbiAgICAgICAgLy8g5Yid5aeL5YyW54mp5ZOB5p+c5pWw5o2uXG4gICAgICAgIHRoaXMuZGF0YUJhc2UuaW5pdEJhY2twYWNrRGF0YShsb2FkSW1hZ2VDYWxsQmFjayk7XG4gICAgICAgIC8vXG4gICAgICAgIHZhciBkYXRhU2hlZXRzID0gdGhpcy5kYXRhQmFzZS5iYWNrcGFja19TZWNvbmRfRGF0YVNoZWV0cztcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkYXRhU2hlZXRzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICB2YXIgbWVudSA9IHRoaXMuX21lbnVMaXN0W2ldO1xuICAgICAgICAgICAgdmFyIGl0ZW1zID0gZGF0YVNoZWV0c1tpXTtcbiAgICAgICAgICAgIG1lbnUuZW50aXR5LnRyYW5zZm9ybS5wb3NpdGlvbiA9IG5ldyBGaXJlLlZlYzIoLTU1MCArIChpICogMjAwKSwgMjUpO1xuICAgICAgICAgICAgbWVudS5yZWZyZXNoKGl0ZW1zLCB0aGlzLmJpbmRPcGVuVGhyZWVNZW51RXZlbnQpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyDliLfmlrDljZXlk4Hoj5zljZVcbiAgICBfcmVmcmVzaFNpbmdsZUl0ZW1zTWVudTogZnVuY3Rpb24gKGluZGV4LCBtZW51RGF0YSkge1xuICAgICAgICBpZiAodGhpcy5fY3VyVHlwZSAhPT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciBtZW51ID0gdGhpcy5fbWVudUxpc3RbaW5kZXhdO1xuICAgICAgICBpZiAobWVudSkge1xuICAgICAgICAgICAgbWVudS5yZWZyZXNoKG1lbnVEYXRhLCB0aGlzLmJpbmRPcGVuVGhyZWVNZW51RXZlbnQpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyDliLfmlrDlpZfoo4Xoj5zljZVcbiAgICBfcmVmcmVzaFN1aXRJdGVtc01lbnU6IGZ1bmN0aW9uIChwYWdlLCBpbmRleCwgbWVudURhdGEpIHtcbiAgICAgICAgaWYgKHRoaXMuX2N1clR5cGUgIT09IDEgfHwgdGhpcy5fY3VyUGFnZSAhPT0gcGFnZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciBtZW51ID0gdGhpcy5fbWVudUxpc3RbaW5kZXhdO1xuICAgICAgICBpZiAobWVudSkge1xuICAgICAgICAgICAgbWVudS5yZWZyZXNoX3N1aXRJdGVtcyhtZW51RGF0YSwgdGhpcy5iaW5kQ3JlYXRlU3VpdEl0ZW1FdmVudCk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIOWIt+aWsOaMiemSrueKtuaAgVxuICAgIF9yZWZyZXNoQnRuU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5idG5fTGVmdC5hY3RpdmUgPSB0aGlzLl9jdXJQYWdlID4gMTtcbiAgICAgICAgdGhpcy5idG5fUmlnaHQuYWN0aXZlID0gdGhpcy5fY3VyUGFnZSA8IHRoaXMuX21heFBhZ2U7XG4gICAgfSxcbiAgICAvLyDkuIrkuIDpobVcbiAgICBfb25QcmV2aW91c0V2ZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuX2N1clBhZ2UgLT0gMTtcbiAgICAgICAgaWYgKHRoaXMuX2N1clBhZ2UgPCAxKXtcbiAgICAgICAgICAgIHRoaXMuX2N1clBhZ2UgPSAxO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3N1aXRJdGVtc01lbnUoKTtcbiAgICB9LFxuICAgIC8vIOS4i+S4gOmhtVxuICAgIF9vbk5leHRFdmVudDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLl9jdXJQYWdlICs9IDE7XG4gICAgICAgIGlmICh0aGlzLl9jdXJQYWdlID4gdGhpcy5fbWF4UGFnZSl7XG4gICAgICAgICAgICB0aGlzLl9jdXJQYWdlID0gdGhpcy5fbWF4UGFnZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9zdWl0SXRlbXNNZW51KCk7XG4gICAgfSxcbiAgICAvLyDmv4DmtLvoj5zljZXml7bop6blj5HnmoTkuovku7YgMDrljZXlk4EgMTrlpZfoo4UgMjrnianlk4Hmn5xcbiAgICBvcGVuTWVudTogZnVuY3Rpb24gKGlkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCfmiZPlvIBJRDonICsgaWQgKyBcIiAgICgwOuWNleWTgSAxOuWll+ijhSAyOueJqeWTgeafnClcIik7XG4gICAgICAgIC8vXG4gICAgICAgIHRoaXMuYnRuX0xlZnQuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuYnRuX1JpZ2h0LmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAvL+iOt+WPluiPnOWNleaMiemSruW5tuS4lOe7keWumuS6i+S7tlxuICAgICAgICB0aGlzLl9jdXJUeXBlID0gaWQ7XG4gICAgICAgIHRoaXMuX2luaXRNZW51KGlkKTtcbiAgICAgICAgdGhpcy5kYXRhQmFzZS50aHJlZU1lbnVNZ3IuY2xvc2VNZW51KGZhbHNlKTtcbiAgICAgICAgdGhpcy5lbnRpdHkuYWN0aXZlID0gdHJ1ZTtcbiAgICB9LFxuICAgIC8vIOW8gOWni1xuICAgIHN0YXJ0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIOW4uOeUqOeahOWPmOmHjy/mlbDmja5cbiAgICAgICAgdmFyIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9EYXRhQmFzZScpO1xuICAgICAgICB0aGlzLmRhdGFCYXNlID0gZW50LmdldENvbXBvbmVudCgnRGF0YUJhc2UnKTtcbiAgICAgICAgLy8g6I635Y+W5YWz6Zet5oyJ6ZKu5bm257uR5a6a5LqL5Lu2XG4gICAgICAgIGVudCA9IHRoaXMuZW50aXR5LmZpbmQoJ2J0bl9jbG9zZScpO1xuICAgICAgICB2YXIgYnRuQ2xvc2UgPSBlbnQuZ2V0Q29tcG9uZW50KCdVSUJ1dHRvbicpO1xuICAgICAgICBidG5DbG9zZS5vbkNsaWNrID0gdGhpcy5fb25DbG9zZU1lbnUuYmluZCh0aGlzKTtcbiAgICAgICAgLy8g5LiK5LiA6aG1XG4gICAgICAgIHRoaXMuYnRuX0xlZnQgPSB0aGlzLmVudGl0eS5maW5kKCdidG5fbGVmdCcpO1xuICAgICAgICB2YXIgYnRuTGVmdCA9IHRoaXMuYnRuX0xlZnQuZ2V0Q29tcG9uZW50KCdVSUJ1dHRvbicpO1xuICAgICAgICBidG5MZWZ0Lm9uQ2xpY2sgPSB0aGlzLl9vblByZXZpb3VzRXZlbnQuYmluZCh0aGlzKTtcbiAgICAgICAgLy8g5LiL5LiA6aG1XG4gICAgICAgIHRoaXMuYnRuX1JpZ2h0ID0gdGhpcy5lbnRpdHkuZmluZCgnYnRuX3JpZ2h0Jyk7XG4gICAgICAgIHZhciBidG5SaWdodCA9IHRoaXMuYnRuX1JpZ2h0LmdldENvbXBvbmVudCgnVUlCdXR0b24nKTtcbiAgICAgICAgYnRuUmlnaHQub25DbGljayA9IHRoaXMuX29uTmV4dEV2ZW50LmJpbmQodGhpcyk7XG4gICAgICAgIC8vXG4gICAgICAgIHRoaXMuYnRuX0xlZnQuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuYnRuX1JpZ2h0LmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAvLyDpooTliqDovb0g5Y2V5ZOBXG4gICAgICAgIHRoaXMuZGF0YUJhc2UucHJlbG9hZFNpbmFnbGVJdGVtc0RhdGFfU2Vjb25kKHRoaXMuYmluZFJlZnJlc2hTaW5nbGVJdGVtc01lbnUpO1xuICAgICAgICAvLyDpooTliqDovb0g5aWX6KOFXG4gICAgICAgIHRoaXMuZGF0YUJhc2UucHJlbG9hZFN1aXRJdGVtc0RhdGFfU2Vjb25kKDEsIHRoaXMuX3N1dGlJdGVtU2hvd1RvdGFsLCB0aGlzLmJpbmRSZWZyZXNoU3VpdEl0ZW1zTWVudSk7XG4gICAgfSxcbiAgICB1cGRhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8g5Yy56YWNVUnliIbovqjnjodcbiAgICAgICAgLy92YXIgY2FtZXJhID0gRmlyZS5DYW1lcmEubWFpbjtcbiAgICAgICAgLy92YXIgYmdXb3JsZEJvdW5kcyA9IHRoaXMuZGF0YUJhc2UuYmdSZW5kZXIuZ2V0V29ybGRCb3VuZHMoKTtcbiAgICAgICAgLy92YXIgYmdMZWZ0VG9wV29ybGRQb3MgPSBuZXcgRmlyZS5WZWMyKGJnV29ybGRCb3VuZHMueE1pbiwgYmdXb3JsZEJvdW5kcy55TWluKTtcbiAgICAgICAgLy92YXIgYmdsZWZ0VG9wID0gY2FtZXJhLndvcmxkVG9TY3JlZW4oYmdMZWZ0VG9wV29ybGRQb3MpO1xuICAgICAgICAvL3ZhciBzY3JlZW5Qb3MgPSBuZXcgRmlyZS5WZWMyKGJnbGVmdFRvcC54LCBiZ2xlZnRUb3AueSk7XG4gICAgICAgIC8vdmFyIHdvcmxkUG9zID0gY2FtZXJhLnNjcmVlblRvV29ybGQoc2NyZWVuUG9zKTtcbiAgICAgICAgLy90aGlzLmVudGl0eS50cmFuc2Zvcm0ud29ybGRQb3NpdGlvbiA9IHdvcmxkUG9zO1xuICAgICAgICAvLyDljLnphY1VSeWIhui+qOeOh1xuICAgICAgICB2YXIgY2FtZXJhID0gRmlyZS5DYW1lcmEubWFpbjtcbiAgICAgICAgdmFyIHNjcmVlblNpemUgPSBGaXJlLlNjcmVlbi5zaXplLm11bChjYW1lcmEuc2l6ZSAvIEZpcmUuU2NyZWVuLmhlaWdodCk7XG4gICAgICAgIHZhciBuZXdQb3MgPSBGaXJlLnYyKHRoaXMubWFyZ2luLngsIC1zY3JlZW5TaXplLnkgLyAyICsgdGhpcy5tYXJnaW4ueSk7XG4gICAgICAgIHRoaXMuZW50aXR5LnRyYW5zZm9ybS5wb3NpdGlvbiA9IG5ld1BvcztcbiAgICB9XG59KTtcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnYTgwYjJJNmdORlBYNVAwMER2NFFjQ3QnLCAnU2Vjb25kTWVudScpO1xuLy8gc2NyaXB0XFx2aWxsYVxcU2Vjb25kTWVudS5qc1xuXG52YXIgU2Vjb25kTWVudSA9IEZpcmUuQ2xhc3Moe1xuICAgIC8vIOe7p+aJv1xuICAgIGV4dGVuZHM6IEZpcmUuQ29tcG9uZW50LFxuICAgIC8vIOaehOmAoOWHveaVsFxuICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuX2J0bk1lbnUgPSBudWxsO1xuICAgICAgICB0aGlzLl9wcmljZSA9IG51bGw7XG4gICAgICAgIHRoaXMucm9vbVR5cGUgPSAwO1xuICAgICAgICB0aGlzLnVpZCA9IDA7XG4gICAgICAgIHRoaXMucHJpY2UgPSAwO1xuICAgICAgICAvLyDmipjmiaNcbiAgICAgICAgdGhpcy5kaXNjb3VudCA9IDE7XG4gICAgICAgIHRoaXMuc21hbGxTcHJpdGUgPSBudWxsO1xuICAgIH0sXG4gICAgLy8g5bGe5oCnXG4gICAgcHJvcGVydGllczoge1xuICAgICAgICAvLyDlvZPliY3nsbvlnotJROeUqOS6juWQkeacjeWKoeWZqOivt+axguaVsOaNrlxuICAgICAgICB0aWQ6IDAsXG4gICAgICAgIHRuYW1lOiAnJyxcbiAgICAgICAgaGFzRHJhZzogZmFsc2UsXG4gICAgICAgIC8vIOm7mOiupOWbvueJh1xuICAgICAgICBkZWZhdWx0U3ByaXRlOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5TcHJpdGVcbiAgICAgICAgfSxcbiAgICAgICAgZGVmYXVsdExvYWRBbmltOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5BbmltYXRpb25cbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy8g6YeN572u6I+c5Y2VXG4gICAgcmVzZXRNZW51OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMudGlkID0gMDtcbiAgICAgICAgdGhpcy5oYXNEcmFnID0gZmFsc2U7XG4gICAgICAgIHRoaXMudG5hbWUgPSAn6L295YWl5LitJztcbiAgICAgICAgdGhpcy5fYnRuTWVudS5zZXRUZXh0KCfovb3lhaXkuK0nKTtcbiAgICAgICAgdGhpcy5fYnRuTWVudS5zZXRTcHJpdGUodGhpcy5kZWZhdWx0U3ByaXRlKTtcbiAgICAgICAgdGhpcy5fYnRuTWVudS5zZXRDdXN0b21TaXplKC0xLCAtMSk7XG4gICAgICAgIHRoaXMuX2J0bk1lbnUub25DbGljayA9IG51bGw7XG4gICAgICAgIHRoaXMuX3ByaWNlLmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5lbnRpdHkuYWN0aXZlID0gZmFsc2U7XG4gICAgfSxcbiAgICAvLyDorr7nva7mloflrZdcbiAgICBzZXRUZXh0OiBmdW5jdGlvbiAodGV4dCkge1xuICAgICAgICB0aGlzLnRuYW1lID0gdGV4dDtcbiAgICAgICAgdGhpcy5fYnRuTWVudS5zZXRUZXh0KHRleHQpO1xuICAgIH0sXG4gICAgLy8g6K6+572u5Lu35qC8XG4gICAgc2V0UHJpY2U6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB0aGlzLnByaWNlID0gdmFsdWU7XG4gICAgICAgIHRoaXMuX3ByaWNlLnRleHQgPSB2YWx1ZTtcbiAgICAgICAgdGhpcy5fcHJpY2UuZW50aXR5LmFjdGl2ZSA9IHRydWU7XG4gICAgfSxcbiAgICAvLyDorr7nva7lm77niYdcbiAgICBzZXRTcHJpdGU6IGZ1bmN0aW9uIChzcHJpdGUsIGV2ZW50KSB7XG4gICAgICAgIGlmICghIHNwcml0ZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc21hbGxTcHJpdGUgPSBzcHJpdGU7XG4gICAgICAgIHRoaXMuX2J0bk1lbnUuc2V0U3ByaXRlKHNwcml0ZSk7XG4gICAgICAgIGlmIChzcHJpdGUud2lkdGggPiAxMzApIHtcbiAgICAgICAgICAgIHRoaXMuX2J0bk1lbnUuc2V0Q3VzdG9tU2l6ZSgxMjAsIDEyMCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGV2ZW50KSB7XG4gICAgICAgICAgICB0aGlzLl9idG5NZW51Lm9uQ2xpY2sgPSBldmVudDtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyDluLjnlKjnmoTlj5jph48v5pWw5o2uXG4gICAgICAgIHZhciBlbnQgPSBGaXJlLkVudGl0eS5maW5kKCcvRGF0YUJhc2UnKTtcbiAgICAgICAgdGhpcy5kYXRhQmFzZSA9IGVudC5nZXRDb21wb25lbnQoJ0RhdGFCYXNlJyk7XG4gICAgICAgIC8vXG4gICAgICAgIGVudCA9IHRoaXMuZW50aXR5LmZpbmQoJ2J0bl9NZW51Jyk7XG4gICAgICAgIHRoaXMuX2J0bk1lbnUgPSBlbnQuZ2V0Q29tcG9uZW50KCdVSUJ1dHRvbicpO1xuICAgICAgICBlbnQgPSB0aGlzLmVudGl0eS5maW5kKCdwcmljZScpO1xuICAgICAgICB0aGlzLl9wcmljZSA9IGVudC5nZXRDb21wb25lbnQoRmlyZS5UZXh0KTtcbiAgICAgICAgLy9cbiAgICAgICAgdmFyIHN0YXRlID0gdGhpcy5kZWZhdWx0TG9hZEFuaW0ucGxheSgnbG9hZGluZycpO1xuICAgICAgICBzdGF0ZS53cmFwTW9kZSA9IEZpcmUuV3JhcE1vZGUuTG9vcDtcbiAgICAgICAgc3RhdGUucmVwZWF0Q291bnQgPSBJbmZpbml0eTtcbiAgICB9LFxuICAgIC8vIOWIt+aWsOWNleWTgSAvIOeJqeWTgeafnFxuICAgIHJlZnJlc2g6IGZ1bmN0aW9uIChkYXRhLCBldmVudCkge1xuICAgICAgICB0aGlzLnJlc2V0TWVudSgpO1xuXG4gICAgICAgIHRoaXMuZW50aXR5LmFjdGl2ZSA9IHRydWU7XG4gICAgICAgIHRoaXMuX2J0bk1lbnUuZW50aXR5LmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLmRlZmF1bHRMb2FkQW5pbS5lbnRpdHkuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5kZWZhdWx0TG9hZEFuaW0ucGxheSgnbG9hZGluZycpO1xuICAgICAgICBpZiAoZGF0YSkge1xuICAgICAgICAgICAgdGhpcy50aWQgPSBkYXRhLnRpZDtcbiAgICAgICAgICAgIHRoaXMuaGFzRHJhZyA9IGRhdGEuaXNkcmFnIDwgMjtcbiAgICAgICAgICAgIHRoaXMuc2V0VGV4dChkYXRhLnRuYW1lKTtcbiAgICAgICAgICAgIHRoaXMuZW50aXR5Lm5hbWUgPSBkYXRhLnRpZDtcbiAgICAgICAgICAgIHRoaXMuZW50aXR5LmFjdGl2ZSA9IHRydWU7XG5cbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICAgIGlmIChkYXRhLmxvY2FsUGF0aCkge1xuICAgICAgICAgICAgICAgIEZpcmUuUmVzb3VyY2VzLmxvYWQoZGF0YS5sb2NhbFBhdGgsIGZ1bmN0aW9uIChlcnJvciwgc3ByaXRlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuc2V0U3ByaXRlKHNwcml0ZSwgZXZlbnQpO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9idG5NZW51LmVudGl0eS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmRlZmF1bHRMb2FkQW5pbS5lbnRpdHkuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzZWxmLmRhdGFCYXNlLmxvYWRJbWFnZShkYXRhLnVybCB8fCBkYXRhLmltYWdlVXJsLCBmdW5jdGlvbiAoZGF0YSwgZXJyb3IsIGltYWdlKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHNlbGYudGlkICE9PSBkYXRhLnRpZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciBzcHJpdGUgPSBuZXcgRmlyZS5TcHJpdGUoaW1hZ2UpO1xuICAgICAgICAgICAgICAgIHNlbGYuc2V0U3ByaXRlKHNwcml0ZSwgZXZlbnQpO1xuICAgICAgICAgICAgICAgIHNlbGYuX2J0bk1lbnUuZW50aXR5LmFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgc2VsZi5kZWZhdWx0TG9hZEFuaW0uZW50aXR5LmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMsIGRhdGEpKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy8g5Yi35paw5aWX6KOFXG4gICAgcmVmcmVzaF9zdWl0SXRlbXM6IGZ1bmN0aW9uIChkYXRhLCBldmVudCkge1xuICAgICAgICB0aGlzLnJlc2V0TWVudSgpO1xuXG4gICAgICAgIHRoaXMuZW50aXR5LmFjdGl2ZSA9IHRydWU7XG4gICAgICAgIHRoaXMuX2J0bk1lbnUuZW50aXR5LmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLmRlZmF1bHRMb2FkQW5pbS5lbnRpdHkuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5kZWZhdWx0TG9hZEFuaW0ucGxheSgnbG9hZGluZycpO1xuXG4gICAgICAgIGlmIChkYXRhKSB7XG4gICAgICAgICAgICB0aGlzLnRpZCA9IGRhdGEudGlkO1xuICAgICAgICAgICAgdGhpcy51aWQgPSBkYXRhLnVpZDtcbiAgICAgICAgICAgIHRoaXMuc2V0VGV4dChkYXRhLnRuYW1lKTtcbiAgICAgICAgICAgIHRoaXMucm9vbVR5cGUgPSBkYXRhLnJvb21UeXBlO1xuICAgICAgICAgICAgdGhpcy5zZXRQcmljZShkYXRhLnByaWNlKTtcbiAgICAgICAgICAgIHRoaXMuZW50aXR5Lm5hbWUgPSBkYXRhLnRpZDtcbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgICBzZWxmLmRhdGFCYXNlLmxvYWRJbWFnZShkYXRhLmltYWdlVXJsLCBmdW5jdGlvbiAoZGF0YSwgZXJyb3IsIGltYWdlKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHNlbGYudGlkICE9PSBkYXRhLnRpZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciBzcHJpdGUgPSBuZXcgRmlyZS5TcHJpdGUoaW1hZ2UpO1xuICAgICAgICAgICAgICAgIHNlbGYuc2V0U3ByaXRlKHNwcml0ZSwgZXZlbnQpO1xuICAgICAgICAgICAgICAgIHNlbGYuX2J0bk1lbnUuZW50aXR5LmFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgc2VsZi5kZWZhdWx0TG9hZEFuaW0uZW50aXR5LmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMsIGRhdGEpKTtcbiAgICAgICAgfVxuICAgIH1cbn0pO1xuXG5GaXJlLl9SRnBvcCgpOyIsIkZpcmUuX1JGcHVzaChtb2R1bGUsICc0MGM2M3MzaTd4SUdwajB3blh6VnNlcycsICdTZXJ2ZXJOZXRXb3JrJyk7XG4vLyBzY3JpcHRcXG91dGRvb3JcXFNlcnZlck5ldFdvcmsuanNcblxuLy8g6Lef5pyN5Yqh5Zmo6L+b6KGM5a+55o6lXG52YXIgU2VydmVyTmV0V29yayA9IEZpcmUuQ2xhc3Moe1xuICAgIC8vIOe7p+aJv1xuICAgIGV4dGVuZHM6IEZpcmUuQ29tcG9uZW50LFxuICAgIC8vIOaehOmAoOWHveaVsFxuICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIOW9k+WJjeivt+axguaVsOaNrlxuICAgICAgICB0aGlzLl9wb3N0RGF0YSA9IHt9O1xuICAgICAgICAvLyDmlq3nur/ph43ov57nqpflj6NcbiAgICAgICAgdGhpcy5uZXRXb3JrV2luID0gbnVsbDtcbiAgICAgICAgLy8g55So5LqO5rWL6K+V55qEdG9rZW7mlbDmja5cbiAgICAgICAgdGhpcy50b2tlbiA9ICcnO1xuICAgIH0sXG4gICAgLy8g5bGe5oCnXG4gICAgcHJvcGVydGllczoge1xuICAgICAgICBsb2NhbFRlc3Q6IGZhbHNlXG4gICAgfSxcblxuICAgIC8vIOiOt+WPlueUqOaIt+S/oeaBr1xuICAgIGdldFRvS2VuVmFsdWU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMubG9jYWxUZXN0KSB7XG4gICAgICAgICAgICB0aGlzLnRva2VuID0gJ01UQXdNVFE1TWpZNE5WOHlZakV5WmpZMU9UWmpNalF4TmpCbFltSXdNVFkxT1RBMk1EazFZMkkxTkY4eE5ETTRNRGMxTXpjMVgzZGhjRjh4TURBeE5Ea3lOamcxJztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudG9rZW4gPSB0aGlzLmdldFF1ZXJ5U3RyaW5nKCd0b2tlbicpO1xuICAgICAgICAgICAgaWYgKCF0aGlzLnRva2VuKSB7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhcIuayoeacieeUqOaIt+S/oeaBrywgVG9LZW4gaXMgbnVsbFwiKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcbiAgICAvLyDnlKhKU+iOt+WPluWcsOWdgOagj+WPguaVsOeahOaWueazlVxuICAgIGdldFF1ZXJ5U3RyaW5nOiBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICB2YXIgcmVnID0gbmV3IFJlZ0V4cChcIihefCYpXCIgKyBuYW1lICsgXCI9KFteJl0qKSgmfCQpXCIpO1xuICAgICAgICB2YXIgciA9IHdpbmRvdy5sb2NhdGlvbi5zZWFyY2guc3Vic3RyKDEpLm1hdGNoKHJlZyk7XG4gICAgICAgIGlmIChyICE9PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gdW5lc2NhcGUoclsyXSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSxcbiAgICAvLyDor7fmsYLlpLHotKVcbiAgICBfZXJyb3JDYWxsQmFjazogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHRoaXMubmV0V29ya1dpbi5vcGVuV2luZG93KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNlbGYuc2VuZERhdGEoc2VsZi5fcG9zdERhdGEpO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIC8vIOWPkemAgeaVsOaNrlxuICAgIHNlbmREYXRhOiBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICBpZiAoIUZpcmUuRW5naW5lLmlzUGxheWluZykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5nZXRUb0tlblZhbHVlKCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvL3RoaXMuZGF0YUJhc2UubG9hZFRpcHMub3BlblRpcHMoJ+ivt+axguS4re+8jOivt+eojeWQji4uLicpO1xuICAgICAgICB0aGlzLl9wb3N0RGF0YSA9IGRhdGE7XG4gICAgICAgIHRoaXMualF1ZXJ5QWpheChkYXRhLnVybCwgZGF0YS5zZW5kRGF0YSwgZGF0YS5jYiwgZGF0YS5lcnJDYik7XG4gICAgfSxcbiAgICAvLyDlj5HpgIHmtojmga9cbiAgICBqUXVlcnlBamF4OiBmdW5jdGlvbiAoc3RyVXJsLCBkYXRhLCBjYWxsQmFjaywgZXJyb3JDYWxsQmFjaykge1xuICAgICAgICB2YXIgcGFyYW1zID0gXCJcIjtcbiAgICAgICAgaWYgKHR5cGVvZihkYXRhKSAhPT0gXCJvYmplY3RcIikge1xuICAgICAgICAgICAgcGFyYW1zID0gZGF0YSArIFwiJnRva2VuPVwiICsgdGhpcy50b2tlbjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGZvciAodmFyIGtleSBpbiBkYXRhKSB7XG4gICAgICAgICAgICAgICAgcGFyYW1zICs9IChrZXkgKyBcIj1cIiArIGRhdGFba2V5XSArIFwiJlwiICApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGFyYW1zICs9IFwiJnRva2VuPVwiICsgdGhpcy50b2tlbjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgc2VuZCA9IHtcbiAgICAgICAgICAgIHR5cGU6IFwiUE9TVFwiLFxuICAgICAgICAgICAgdXJsOiBzdHJVcmwgKyBcIj8manNvbmNhbGxQUD0/XCIsXG4gICAgICAgICAgICBkYXRhOiBwYXJhbXMsXG4gICAgICAgICAgICBkYXRhVHlwZTogJ2pzb25wJyxcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFGaXJlLkVuZ2luZS5pc1BsYXlpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoY2FsbEJhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbEJhY2soZGF0YSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbiAoWE1MSHR0cFJlcXVlc3QsIHRleHRTdGF0dXMsIGVycm9yVGhyb3duKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFGaXJlLkVuZ2luZS5pc1BsYXlpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoZXJyb3JDYWxsQmFjaykge1xuICAgICAgICAgICAgICAgICAgICBlcnJvckNhbGxCYWNrKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yVGhyb3duKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhYTUxIdHRwUmVxdWVzdCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2codGV4dFN0YXR1cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGpRdWVyeS5hamF4KHNlbmQpO1xuICAgIH0sXG4gICAgLy8g5Yid5aeL5YyW5aSW5pmv5pWw5o2uXG4gICAgSW5pdE91dGRvb3I6IGZ1bmN0aW9uIChzZW5kRGF0YSwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHBvc3REYXRhID0ge1xuICAgICAgICAgICAgdXJsOiBcImh0dHA6Ly9tLnNhaWtlLmNvbS9zdWl0ZHJlc3MvYnJvd3NlU2NlbmUuaHRtbFwiLFxuICAgICAgICAgICAgc2VuZERhdGE6IHtcbiAgICAgICAgICAgICAgICBkcmVzc190eXBlOiBzZW5kRGF0YS5kcmVzc190eXBlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY2I6IGNhbGxiYWNrLFxuICAgICAgICAgICAgZXJyQ2I6IHRoaXMuX2Vycm9yQ2FsbEJhY2suYmluZCh0aGlzKVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLnNlbmREYXRhKHBvc3REYXRhKTtcbiAgICB9LFxuICAgIC8vIOalvOWxguWIl+ihqFxuICAgIFJlcXVlc3RGbG9vckxpc3Q6IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICB2YXIgcG9zdERhdGEgPSB7XG4gICAgICAgICAgICB1cmw6IFwiaHR0cDovL20uc2Fpa2UuY29tL3N1aXRkcmVzcy9mbG9vckxpc3QuaHRtbFwiLFxuICAgICAgICAgICAgc2VuZERhdGE6IHt9LFxuICAgICAgICAgICAgY2I6IGNhbGxiYWNrLFxuICAgICAgICAgICAgZXJyQ2I6IHRoaXMuX2Vycm9yQ2FsbEJhY2suYmluZCh0aGlzKVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLnNlbmREYXRhKHBvc3REYXRhKTtcbiAgICB9LFxuICAgIC8vIOiOt+WPluW5s+mdouWbvlxuICAgIFJlcXVlc3RQbGFuOiBmdW5jdGlvbiAoc2VuZERhdGEsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBwb3N0RGF0YSA9IHtcbiAgICAgICAgICAgIHVybDogXCJodHRwOi8vbS5zYWlrZS5jb20vc3VpdGRyZXNzL3Nob3dDb3Zlci5odG1sXCIsXG4gICAgICAgICAgICBzZW5kRGF0YToge1xuICAgICAgICAgICAgICAgIGhvdXNlX3VpZDogc2VuZERhdGEuaG91c2VfdWlkLFxuICAgICAgICAgICAgICAgIGZsb29yX2lkOiBzZW5kRGF0YS5mbG9vcl9pZCxcbiAgICAgICAgICAgICAgICBtYXJrOiBzZW5kRGF0YS5tYXJrXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY2I6IGNhbGxiYWNrLFxuICAgICAgICAgICAgZXJyQ2I6IHRoaXMuX2Vycm9yQ2FsbEJhY2suYmluZCh0aGlzKVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLnNlbmREYXRhKHBvc3REYXRhKTtcbiAgICB9LFxuICAgIC8vIOino+mZpOWFs+ezu1xuICAgIFJlcXVlc3REaXNhc3NvY2lhdGVMaXN0OiBmdW5jdGlvbiAoc2VuZERhdGEsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBwb3N0RGF0YSA9IHtcbiAgICAgICAgICAgIHVybDogXCJodHRwOi8vbS5zYWlrZS5jb20vc3VpdGRyZXNzL3JlbGVhc2VSZWxhdGlvbi5odG1sXCIsXG4gICAgICAgICAgICBzZW5kRGF0YTogc2VuZERhdGEsXG4gICAgICAgICAgICBjYjogY2FsbGJhY2ssXG4gICAgICAgICAgICBlcnJDYjogdGhpcy5fZXJyb3JDYWxsQmFjay5iaW5kKHRoaXMpXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuc2VuZERhdGEocG9zdERhdGEpO1xuICAgIH0sXG4gICAgLy8g5byA5aeL5pe2XG4gICAgc3RhcnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8g6YeN5paw6K+35rGC5pyN5Yqh5Zmo56qX5Y+jXG4gICAgICAgIHZhciBlbnQgPSBGaXJlLkVudGl0eS5maW5kKCcvVGlwX05ldFdvcmsnKTtcbiAgICAgICAgdGhpcy5uZXRXb3JrV2luID0gZW50LmdldENvbXBvbmVudCgnTmV3V29ya1dpbmRvdycpO1xuICAgIH1cbn0pO1xuXG5GaXJlLl9SRnBvcCgpOyIsIkZpcmUuX1JGcHVzaChtb2R1bGUsICdlZjZhMUNPbFcxRWJhLytUYkpYQ1NYSicsICdTdWJNZW51Jyk7XG4vLyBzY3JpcHRcXG91dGRvb3JcXFN1Yk1lbnUuanNcblxudmFyIFN1Yk1lbnUgPSBGaXJlLkNsYXNzKHtcbiAgICAvLyDnu6fmib9cbiAgICBleHRlbmRzOiBGaXJlLkNvbXBvbmVudCxcbiAgICAvLyDmnoTpgKDlh73mlbBcbiAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmN1clR5cGUgPSAxO1xuICAgIH0sXG4gICAgLy8g5bGe5oCnXG4gICAgcHJvcGVydGllczoge1xuICAgICAgICBvZmZzZXQ6IG5ldyBGaXJlLlZlYzIoMCwgMTUwKSxcbiAgICAgICAgYnRuX0RyZXNzVXA6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlVJQnV0dG9uXG4gICAgICAgIH0sXG4gICAgICAgIGJ0bl9JbnRlcmFjdGl2ZUZhbWlseToge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVUlCdXR0b25cbiAgICAgICAgfSxcbiAgICAgICAgYnRuX0dvVG9JbmRvb3I6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlVJQnV0dG9uXG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIOW8gOWni1xuICAgIHN0YXJ0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIOW4uOeUqOeahOWPmOmHjy/mlbDmja5cbiAgICAgICAgdmFyIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9PRGF0YUJhc2UnKTtcbiAgICAgICAgdGhpcy5vZGF0YUJhc2UgPSBlbnQuZ2V0Q29tcG9uZW50KCdPRGF0YUJhc2UnKTtcblxuICAgICAgICB0aGlzLmJ0bl9EcmVzc1VwLm9uQ2xpY2sgPSB0aGlzLm9uRHJlc3NVcEV2ZW50LmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuYnRuX0ludGVyYWN0aXZlRmFtaWx5Lm9uQ2xpY2sgPSB0aGlzLm9uSW50ZXJhY3RpdmVGYW1pbHlFdmVudC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmJ0bl9Hb1RvSW5kb29yLm9uQ2xpY2sgPSB0aGlzLm9uR29Ub0luZG9vckV2ZW50LmJpbmQodGhpcyk7XG4gICAgfSxcblxuICAgIC8vIHR5cGU6IOWNlei6q+WFrOWvk1xuICAgIG9wZW5TdWJNZW51OiBmdW5jdGlvbiAodHlwZSkge1xuICAgICAgICB0aGlzLmN1clR5cGUgPSB0eXBlO1xuICAgICAgICB0aGlzLmVudGl0eS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICB0aGlzLmJ0bl9JbnRlcmFjdGl2ZUZhbWlseS5lbnRpdHkuYWN0aXZlID0gdHlwZSAhPT0gMTtcbiAgICB9LFxuXG4gICAgY2hhbmdlclNjcmVlbjogZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5jdXJUeXBlID09PSAxKSB7XG4gICAgICAgICAgICBGaXJlLkVuZ2luZS5sb2FkU2NlbmUoJ3NpbmdsZScpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2V7XG4gICAgICAgICAgICBGaXJlLkVuZ2luZS5sb2FkU2NlbmUoJ3ZpbGxhJyk7XG4gICAgICAgIH1cbiAgICB9LFxuXG4gICAgLy8g5oiR6KaB6KOF5omuXG4gICAgb25EcmVzc1VwRXZlbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5vZGF0YUJhc2UuZ2xvYmFsRGF0YS5nb3RvVHlwZSA9IDE7XG4gICAgICAgIHRoaXMuY2hhbmdlclNjcmVlbigpO1xuICAgIH0sXG4gICAgLy8g5a625Lq65LqS5YqoXG4gICAgb25JbnRlcmFjdGl2ZUZhbWlseUV2ZW50OiBmdW5jdGlvbiAoKSB7XG5cbiAgICB9LFxuICAgIC8vIOi/m+WFpeWupOWGhVxuICAgIG9uR29Ub0luZG9vckV2ZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMub2RhdGFCYXNlLmdsb2JhbERhdGEuZ290b1R5cGUgPSAyO1xuICAgICAgICB0aGlzLmNoYW5nZXJTY3JlZW4oKTtcbiAgICB9LFxuICAgIC8vIOabtOaWsFxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyDljLnphY1VSeWIhui+qOeOh1xuICAgICAgICB2YXIgY2FtZXJhID0gRmlyZS5DYW1lcmEubWFpbjtcbiAgICAgICAgdmFyIGJnV29ybGRCb3VuZHMgPSB0aGlzLm9kYXRhQmFzZS5iZ1JlbmRlci5nZXRXb3JsZEJvdW5kcygpO1xuICAgICAgICB2YXIgYmdMZWZ0VG9wV29ybGRQb3MgPSBuZXcgRmlyZS5WZWMyKDAsIGJnV29ybGRCb3VuZHMueU1pbiArIHRoaXMub2Zmc2V0LnkpO1xuICAgICAgICB2YXIgYmdsZWZ0VG9wID0gY2FtZXJhLndvcmxkVG9TY3JlZW4oYmdMZWZ0VG9wV29ybGRQb3MpO1xuICAgICAgICB2YXIgc2NyZWVuUG9zID0gbmV3IEZpcmUuVmVjMihiZ2xlZnRUb3AueCwgYmdsZWZ0VG9wLnkpO1xuICAgICAgICB2YXIgd29ybGRQb3MgPSBjYW1lcmEuc2NyZWVuVG9Xb3JsZChzY3JlZW5Qb3MpO1xuICAgICAgICB0aGlzLmVudGl0eS50cmFuc2Zvcm0ud29ybGRQb3NpdGlvbiA9IHdvcmxkUG9zO1xuICAgIH1cbn0pO1xuXG5GaXJlLl9SRnBvcCgpOyIsIkZpcmUuX1JGcHVzaChtb2R1bGUsICdjMTBmMEI2bEdaS2U1ZGIzUExNdW9TaycsICdTd2l0Y2hSb29tV2luZG93Jyk7XG4vLyBzY3JpcHRcXHZpbGxhXFxTd2l0Y2hSb29tV2luZG93LmpzXG5cbi8vXHJcbnZhciBTd2l0Y2hSb29tV2luZG93ID0gRmlyZS5DbGFzcyh7XHJcbiAgICAvLyDnu6fmib9cclxuICAgIGV4dGVuZHM6IEZpcmUuQ29tcG9uZW50LFxyXG4gICAgLy8g5p6E6YCg5Ye95pWwXHJcbiAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuZW50cmFuY2VUeXBlID0gMDtcclxuICAgIH0sXHJcbiAgICAvLyDlsZ7mgKdcclxuICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICByb290OiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuRW50aXR5XHJcbiAgICAgICAgfSxcclxuICAgICAgICByb29tTmFtZToge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlRleHRcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJvb21MZXZlbDoge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlRleHRcclxuICAgICAgICB9LFxyXG4gICAgICAgIHJvb21OdW06IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5UZXh0XHJcbiAgICAgICAgfSxcclxuICAgICAgICBidG5fY2xvc2U6IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5VSUJ1dHRvblxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvLyDph43nva7nqpflj6NcclxuICAgIHJlc2V0V2luZG93OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5yb29tTmFtZS50ZXh0ID0gJyjliKvlooXlkI3np7ApJztcclxuICAgICAgICB0aGlzLnJvb21MZXZlbC50ZXh0ID0gJ+aho+asoe+8muKYheKYheKYheKYheKYheKYhSc7XHJcbiAgICAgICAgdGhpcy5yb29tTnVtLnRleHQgPSAn5YWxOOS4quaIv+mXtCc7XHJcbiAgICB9LFxyXG4gICAgLy8g5omT5byA56qX5Y+jXHJcbiAgICAvLyB0eXBlOiDpgqPkuKrot6/lj6Pov5vlhaXlubPpnaLlm77nmoRcclxuICAgIC8vIDAsIOWIh+aNouaIv+mXtCAx77ya5YiH5o2i5qW85Ye6XHJcbiAgICBvcGVuV2luZG93OiBmdW5jdGlvbiAodHlwZSwgc2VuZERhdGEpIHtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgc2VsZi5lbnRpdHkuYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICBzZWxmLmVudHJhbmNlVHlwZSA9IHR5cGU7XHJcbiAgICAgICAgc2VsZi5fcmVtb3ZlU3dpdGNoUm9vbSgpO1xyXG4gICAgICAgIHZhciBsb2FjbERhdGEgPSBzZWxmLnBsYW5MaXN0W3NlbmREYXRhLm1hcmtdO1xyXG4gICAgICAgIGlmIChsb2FjbERhdGEpIHtcclxuICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS5tYXJrID0gc2VuZERhdGEubWFyaztcclxuICAgICAgICAgICAgc2VsZi5jcmVhdGVQbGFuKGxvYWNsRGF0YSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBzZWxmLmRhdGFCYXNlLmxvYWRUaXBzLm9wZW5UaXBzKCfovb3lhaXlubPpnaLlm77mlbDmja7vvIHor7fnqI3lkI4uLi4nKTtcclxuICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS5uZXRXb3JrTWdyLlJlcXVlc3RQbGFuKHNlbmREYXRhLCBmdW5jdGlvbiAoc2VydmVyRGF0YSkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS5sb2FkVGlwcy5jbG9zZVRpcHMoKTtcclxuICAgICAgICAgICAgICAgIGlmIChzZXJ2ZXJEYXRhLnN0YXR1cyA9PT0gMTAwMDYpIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWxmLmRhdGFCYXNlLmxvYWRUaXBzLmNsb3NlVGlwcygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgc2VsZi5wbGFuTGlzdFtzZW5kRGF0YS5tYXJrXSA9IHNlcnZlckRhdGE7XHJcbiAgICAgICAgICAgICAgICBzZWxmLmRhdGFCYXNlLm1hcmsgPSBzZW5kRGF0YS5tYXJrO1xyXG4gICAgICAgICAgICAgICAgc2VsZi5jcmVhdGVQbGFuKHNlcnZlckRhdGEpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8g5YWz6Zet56qX5Y+jXHJcbiAgICBjbG9zZVdpbmRvdzogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuZW50aXR5LmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgfSxcclxuICAgIC8vIOe7mOWItuaYn+e6p1xyXG4gICAgZ2V0U3RhcnM6IGZ1bmN0aW9uIChncmFkZSkge1xyXG4gICAgICAgIHZhciBzdHIgPSAn5qGj5qyh77yaJztcclxuICAgICAgICBpZiAoZ3JhZGUgPT09IDEyKSB7XHJcbiAgICAgICAgICAgIHN0ciArPSAn6Iez5bCK5a6dJztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZ3JhZGUgLSAxOyArK2kpIHtcclxuICAgICAgICAgICAgICAgIHN0ciArPSAn4piFJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc3RyO1xyXG4gICAgfSxcclxuICAgIC8vIOWIm+W7uuW5s+mdouWbvlxyXG4gICAgY3JlYXRlUGxhbjogZnVuY3Rpb24gKHNlcnZlckRhdGEpIHtcclxuICAgICAgICBpZiAoISBzZXJ2ZXJEYXRhLmxpc3QpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyDlg4/mnI3liqHlmajor7fmsYLlubPpnaLlm77mlbDmja5cclxuICAgICAgICB0aGlzLnJvb21OYW1lLnRleHQgPSBzZXJ2ZXJEYXRhLmZsb29yX25hbWU7XHJcbiAgICAgICAgdGhpcy5yb29tTGV2ZWwudGV4dCA9IHRoaXMuZ2V0U3RhcnMoc2VydmVyRGF0YS5mbG9vcl9ncmFkZSk7XHJcbiAgICAgICAgdGhpcy5yb29tTnVtLnRleHQgPSAn5YWxJysgc2VydmVyRGF0YS5saXN0Lmxlbmd0aCArICfkuKrmiL/pl7QnO1xyXG4gICAgICAgIHRoaXMuYmluZEdvVG9Sb29tRXZlbnQgPSB0aGlzLl9vbkdvdG9Sb29tRXZlbnQuYmluZCh0aGlzKTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNlcnZlckRhdGEubGlzdC5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICB2YXIgZGF0YSA9IHNlcnZlckRhdGEubGlzdFtpXTtcclxuICAgICAgICAgICAgdmFyIGVudCA9IEZpcmUuaW5zdGFudGlhdGUodGhpcy5kYXRhQmFzZS50ZW1wUGxhbik7XHJcbiAgICAgICAgICAgIGVudC5hY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgICAgICBlbnQucGFyZW50ID0gdGhpcy5yb290O1xyXG4gICAgICAgICAgICB2YXIgYnRuID0gZW50LmdldENvbXBvbmVudChGaXJlLlVJQnV0dG9uKTtcclxuICAgICAgICAgICAgYnRuLm1hcmsgPSBkYXRhLm1hcms7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YUJhc2UubG9hZEltYWdlKGRhdGEuaW1ndXJsLCBmdW5jdGlvbiAoYnRuLCBlcnJvciwgaW1hZ2UpIHtcclxuICAgICAgICAgICAgICAgIHZhciBzcHJpdGUgPSBuZXcgRmlyZS5TcHJpdGUoaW1hZ2UpO1xyXG4gICAgICAgICAgICAgICAgc3ByaXRlLnBpeGVsTGV2ZWxIaXRUZXN0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGJ0bi5zZXRTcHJpdGUoc3ByaXRlKTtcclxuICAgICAgICAgICAgICAgIGJ0bi5vbkNsaWNrID0gdGhpcy5iaW5kR29Ub1Jvb21FdmVudDtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMsIGJ0bikpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvLyDov5vlhaXmiL/pl7RcclxuICAgIF9vbkdvdG9Sb29tRXZlbnQ6IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgIHZhciBidG4gPSBldmVudC50YXJnZXQuZ2V0Q29tcG9uZW50KEZpcmUuVUlCdXR0b24pO1xyXG4gICAgICAgIHZhciBzZW5kRGF0YSA9IHtcclxuICAgICAgICAgICAgbWFyazogYnRuLm1hcmssXHJcbiAgICAgICAgICAgIGhvdXNlX3VpZDogMFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIHNlbGYuZGF0YUJhc2UubG9hZFRpcHMub3BlblRpcHMoJ+i9veWFpeaIv+mXtOaVsOaNru+8geivt+eojeWQji4uLicpO1xyXG4gICAgICAgIHNlbGYuZGF0YUJhc2UuaW50b1Jvb20oc2VuZERhdGEsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS5sb2FkVGlwcy5jbG9zZVRpcHMoKTtcclxuICAgICAgICAgICAgc2VsZi5jbG9zZVdpbmRvdygpO1xyXG4gICAgICAgICAgICBzZWxmLmRhdGFCYXNlLmZpcnN0TWVudU1nci5jbG9zZU1lbnUoKTtcclxuXHJcbiAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UudXBkYXRlQ2hhcmFjdGVycygpO1xyXG4gICAgICAgICAgICBzZWxmLmRhdGFCYXNlLmNoYXJhY3RlcnMuZW50aXR5LmFjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgLy8g5riF56m65oi/6Ze0XHJcbiAgICBfcmVtb3ZlU3dpdGNoUm9vbTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBjaGlsZHJlbiA9IHRoaXMucm9vdC5nZXRDaGlsZHJlbigpO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwO2kgPCBjaGlsZHJlbi5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICBjaGlsZHJlbltpXS5kZXN0cm95KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIOWFs+mXreaMiemSruS6i+S7tlxyXG4gICAgX29uQ2xvc2VXaW5kb3dFdmVudDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuY2xvc2VXaW5kb3coKTtcclxuICAgICAgICBpZiAodGhpcy5lbnRyYW5jZVR5cGUgPT09IDEpIHtcclxuICAgICAgICAgICAgdGhpcy5kYXRhQmFzZS5mbG9vcldpbi5vcGVuV2luZG93KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3JlbW92ZVN3aXRjaFJvb20oKTtcclxuICAgIH0sXHJcbiAgICAvL1xyXG4gICAgc3RhcnQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAvLyDluLjnlKjnmoTlj5jph48v5pWw5o2uXHJcbiAgICAgICAgdmFyIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9EYXRhQmFzZScpO1xyXG4gICAgICAgIHRoaXMuZGF0YUJhc2UgPSBlbnQuZ2V0Q29tcG9uZW50KCdEYXRhQmFzZScpO1xyXG4gICAgICAgIC8vIOe7keWumuS6i+S7tlxyXG4gICAgICAgIHRoaXMuYnRuX2Nsb3NlLm9uQ2xpY2sgPSB0aGlzLl9vbkNsb3NlV2luZG93RXZlbnQuYmluZCh0aGlzKTtcclxuICAgICAgICAvL1xyXG4gICAgICAgIHRoaXMucGxhbkxpc3QgPSB7fTtcclxuICAgIH1cclxufSk7XHJcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnMTdiMDNuNXppdEg3cE02OG5kQjZZNzMnLCAnVGhyZWVNZW51TWdyJyk7XG4vLyBzY3JpcHRcXHZpbGxhXFxUaHJlZU1lbnVNZ3IuanNcblxuLy8g5LiJ57qn6I+c5Y2V566h55CG57G7XG52YXIgVGhyZWVNZW51TWdyID0gRmlyZS5DbGFzcyh7XG4gICAgLy8g57un5om/XG4gICAgZXh0ZW5kczogRmlyZS5Db21wb25lbnQsXG4gICAgLy8g5p6E6YCg5Ye95pWwXG4gICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8g5a625YW35LiA5qyh5pi+56S65aSa5bCR5pWw6YePXG4gICAgICAgIHRoaXMuX2Z1cm5pdHVyZVRvdGFsID0gNztcbiAgICAgICAgLy8g6I+c5Y2V5YiX6KGoXG4gICAgICAgIHRoaXMuX21lbnVMaXN0ID0gW107XG4gICAgICAgIC8vIOW9k+WJjemAieaLqeeahOexu+WeiyAxIOWNleWTgSAyIOWll+ijhSAzIOeJqeWTgeafnFxuICAgICAgICB0aGlzLl9jdXJUeXBlID0gMDtcbiAgICAgICAgLy8g5b2T5YmN6YCJ5oup54mp5ZOBSURcbiAgICAgICAgdGhpcy5fY3VySWQgPSAwO1xuICAgICAgICAvLyDmmK/lkKblj6/mi5bmi71cbiAgICAgICAgdGhpcy5faGFzRHJhZyA9IGZhbHNlO1xuICAgICAgICAvLyDlvZPliY3mnIDlpKfmlbDph49cbiAgICAgICAgdGhpcy5fY3VyVG90YWwgPSA3O1xuICAgICAgICAvLyDlvZPliY3pobXnrb5cbiAgICAgICAgdGhpcy5fY3VyUGFnZSA9IDE7XG4gICAgICAgIC8vIOacgOWkp+mhteetvlxuICAgICAgICB0aGlzLl9tYXhQYWdlID0gMTtcbiAgICAgICAgLy8g5Zu+54mH6L295YWl5Zue6LCDXG4gICAgICAgIHRoaXMuYmluZExvYWRNZW51SW1hZ2VDQiA9IHRoaXMubG9hZE1lbnVJbWFnZUNCLmJpbmQodGhpcyk7XG4gICAgICAgIC8vIOS4iuS4gOasoeijheaJrueahOWll+ijheaMiemSrlxuICAgICAgICB0aGlzLmxhc3RTdWl0TWVudSA9IG51bGw7XG4gICAgfSxcbiAgICAvLyDlsZ7mgKdcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIG1hcmdpbjogbmV3IEZpcmUuVmVjMigtMTA5MCwgMCksXG4gICAgICAgIC8vIOS4iee6p+iPnOWNleeahOagueiKgueCuVxuICAgICAgICByb290OiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5FbnRpdHlcbiAgICAgICAgfSxcbiAgICAgICAgLy8g6aG15pWwXG4gICAgICAgIHBhZ2VUZXh0OiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5UZXh0XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIOWIm+W7uuaIluiAheaYr+WIh+aNouadkOi0qFxuICAgIGNyZWF0ZU9yQ2hhbmdlRnVybml0dXJlOiBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgICAgIHZhciB0aHJlZU1lbnUgPSB0YXJnZXQuZ2V0Q29tcG9uZW50KCdUaHJlZU1lbnUnKTtcbiAgICAgICAgaWYgKHRocmVlTWVudS5oYXNVc2UpIHtcbiAgICAgICAgICAgIHRoaXMuZGF0YUJhc2UudGlwc1dpbmRvdy5vcGVuVGlwc1dpbmRvdygn5a+55LiN6LW377yM5b2T5YmN54mp5ZOB5bey5Zyo5oi/6Ze05Lit5L2/55SoJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGVudCwgZW50Q29tcDtcbiAgICAgICAgLy90aGlzLmRhdGFCYXNlLmxvYWRUaXBzLm9wZW5UaXBzKCfliJvlu7rlrrblhbfkuK3vvIzor7fnqI3lkI4uLi4nKTtcbiAgICAgICAgLy8g5aKZ5aOB5LiO5Zyw5p2/XG4gICAgICAgIGlmICghIHRocmVlTWVudS5oYXNEcmFnKSB7XG4gICAgICAgICAgICBpZiAodGhyZWVNZW51LnByb3BzX3R5cGUgPT09IDEpIHtcbiAgICAgICAgICAgICAgICBlbnRDb21wID0gdGhpcy5kYXRhQmFzZS5iYWNrZ3JvdW5kO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodGhyZWVNZW51LnByb3BzX3R5cGUgPT09IDIpIHtcbiAgICAgICAgICAgICAgICBlbnRDb21wID0gdGhpcy5kYXRhQmFzZS5ncm91bmQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgICBlbnRDb21wLm1lbnVEYXRhID0gdGhyZWVNZW51O1xuICAgICAgICAgICAgZW50Q29tcC5zZXRGdXJuaXR1cmVEYXRhKHRocmVlTWVudSwgdHJ1ZSk7XG4gICAgICAgICAgICBzZWxmLmRhdGFCYXNlLmxvYWRUaXBzLm9wZW5UaXBzKCfliJvlu7rlm77niYfkuK3vvIzor7fnqI3lkI4uLi4nKTtcbiAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UubG9hZEltYWdlKGVudENvbXAuaW1hZ2VVcmwsIGZ1bmN0aW9uIChlcnJvciwgaW1hZ2UpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmRhdGFCYXNlLmxvYWRUaXBzLmNsb3NlVGlwcygpO1xuICAgICAgICAgICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYmlnU3ByaXRlID0gbmV3IEZpcmUuU3ByaXRlKGltYWdlKTtcbiAgICAgICAgICAgICAgICBlbnRDb21wLnNldFNwcml0ZShiaWdTcHJpdGUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyDlrrblhbdcbiAgICAgICAgICAgIGVudCA9IEZpcmUuaW5zdGFudGlhdGUodGhpcy5kYXRhQmFzZS50ZW1wRnVybml0dXJlKTtcbiAgICAgICAgICAgIGVudC5hY3RpdmUgPSB0cnVlO1xuICAgICAgICAgICAgZW50LnBhcmVudCA9IHRoaXMuZGF0YUJhc2Uucm9vbTtcbiAgICAgICAgICAgIHZhciBwb3MgPSB0YXJnZXQudHJhbnNmb3JtLndvcmxkUG9zaXRpb247XG4gICAgICAgICAgICB2YXIgb2Zmc2V0ID0gTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogMTAwKTtcbiAgICAgICAgICAgIHBvcy54ICs9IG9mZnNldDtcbiAgICAgICAgICAgIHBvcy55ICs9IDQwMDtcbiAgICAgICAgICAgIGVudC50cmFuc2Zvcm0ucG9zaXRpb24gPSBuZXcgRmlyZS5WZWMyKHBvcy54LCBwb3MueSk7XG4gICAgICAgICAgICBlbnQudHJhbnNmb3JtLnNjYWxlID0gbmV3IEZpcmUuVmVjMigxLjgsIDEuOCk7XG4gICAgICAgICAgICBlbnQubmFtZSA9IHRocmVlTWVudS5wcm9wc19uYW1lO1xuICAgICAgICAgICAgZW50Q29tcCA9IGVudC5nZXRDb21wb25lbnQoJ0Z1cm5pdHVyZScpO1xuICAgICAgICAgICAgZW50Q29tcC5tZW51RGF0YSA9IHRocmVlTWVudTtcbiAgICAgICAgICAgIGVudENvbXAuc2V0RnVybml0dXJlRGF0YSh0aHJlZU1lbnUpO1xuICAgICAgICB9XG4gICAgICAgIC8vIOagh+iusOW3sue7j+S9v+eUqFxuICAgICAgICBpZiAodGhpcy5fY3VyVHlwZSA9PT0gMikge1xuICAgICAgICAgICAgdGhyZWVNZW51LnNldE1hcmtVc2UodHJ1ZSk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIOWIm+W7uuWQhOS4quexu+Wei+WutuWFt1xuICAgIF9vbkNyZWF0ZUZ1cm5pdHVyZUV2ZW50OiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ+WIm+W7uuWutuWFt0lEOicgKyBldmVudC50YXJnZXQucGFyZW50Lm5hbWUpO1xuICAgICAgICB0aGlzLmNyZWF0ZU9yQ2hhbmdlRnVybml0dXJlKGV2ZW50LnRhcmdldC5wYXJlbnQpO1xuICAgIH0sXG4gICAgLy8g5Yib5bu65aWX6KOF5Yiw5Zy65pmv5LitXG4gICAgX29uQ3JlYXRlU3VpdEl0ZW1FdmVudDogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIHZhciB0aHJlZU1lbnUgPSBldmVudC50YXJnZXQucGFyZW50LmdldENvbXBvbmVudCgnVGhyZWVNZW51Jyk7XG4gICAgICAgIGlmICh0aGlzLmxhc3RTdWl0TWVudeOAgCYmIHRoaXMubGFzdFN1aXRNZW51ICE9PSB0aHJlZU1lbnUpIHtcbiAgICAgICAgICAgIHRoaXMubGFzdFN1aXRNZW51LnNldE1hcmtVc2UoZmFsc2UpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aHJlZU1lbnUuaGFzVXNlKSB7XG4gICAgICAgICAgICB0aGlzLmRhdGFCYXNlLnRpcHNXaW5kb3cub3BlblRpcHNXaW5kb3coJ+WvueS4jei1t++8jOW9k+WJjeWll+ijheW3suWcqOaIv+mXtOS4reS9v+eUqCcpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgLy8g5Yig6Zmk5aWX6KOFXG4gICAgICAgIHNlbGYuZGF0YUJhc2UucmVtb3ZlU3VpdCgpO1xuICAgICAgICAvLyDph43mlrDotYvlgLzlpZfoo4VcbiAgICAgICAgc2VsZi5kYXRhQmFzZS5jdXJEcmVzc1N1aXQgPSB7XG4gICAgICAgICAgICAvLyDlpZfoo4VJRFxuICAgICAgICAgICAgc3VpdF9pZDogdGhyZWVNZW51LnN1aXRfaWQsXG4gICAgICAgICAgICAvLyDog4zljIVJRFxuICAgICAgICAgICAgcGFja19pZDogdGhyZWVNZW51LnBhY2tfaWQsXG4gICAgICAgICAgICAvLyDlpZfoo4XlsI/lm75cbiAgICAgICAgICAgIHN1aXRfaWNvbjogdGhyZWVNZW51LnNtYWxsU3ByaXRlLFxuICAgICAgICAgICAgLy8g5aWX6KOF5ZCN56ewXG4gICAgICAgICAgICBzdWl0X25hbWU6IHRocmVlTWVudS5zdWl0X25hbWUsXG4gICAgICAgICAgICAvLyDlpZfoo4XmnaXoh6rlk6rph4zvvIwxLuiDjOWMhSAyLuWVhuWfjlxuICAgICAgICAgICAgc3VpdF9mcm9tOiAxLFxuICAgICAgICAgICAgLy8g5aWX6KOF5Lu35qC8XG4gICAgICAgICAgICBwcmljZTogdGhyZWVNZW51LnByaWNlLFxuICAgICAgICAgICAgLy8g5oqY5omjXG4gICAgICAgICAgICBkaXNjb3VudDogdGhyZWVNZW51LmRpc2NvdW50LFxuICAgICAgICAgICAgLy8g5aWX6KOF5YiX6KGoXG4gICAgICAgICAgICBmdW5ybml0dXJlTGlzdDogW11cbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHRocmVlTWVudS5kcmVzc0xpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICBzZWxmLmRhdGFCYXNlLnRpcHNXaW5kb3cub3BlblRpcHNXaW5kb3coJ+i/meS4quS4gOS4quepuueahOWll+ijhS4uLicpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHNlbGYuZGF0YUJhc2UubG9hZFRpcHMub3BlblRpcHMoJ+WIm+W7uuWll+ijhe+8jOivt+eojeWQji4uLicpO1xuICAgICAgICBzZWxmLmRhdGFCYXNlLmNyZWF0ZUZ1cm5pdHVyZVRvU2NyZWVuKHRocmVlTWVudS5kcmVzc0xpc3QsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UubG9hZFRpcHMuY2xvc2VUaXBzKCk7XG4gICAgICAgICAgICAvLyDmoIforrDlt7Lnu4/kvb/nlKhcbiAgICAgICAgICAgIGlmIChzZWxmLl9jdXJUeXBlID09PSAyKSB7XG4gICAgICAgICAgICAgICAgdGhyZWVNZW51LnNldE1hcmtVc2UodHJ1ZSk7XG4gICAgICAgICAgICAgICAgc2VsZi5sYXN0U3VpdE1lbnUgPSB0aHJlZU1lbnU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLy8g6YeN572u6I+c5Y2V5YiX6KGoXG4gICAgX3Jlc2V0TWVudTogZnVuY3Rpb24gKCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX21lbnVMaXN0Lmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICB2YXIgbWVudSA9IHRoaXMuX21lbnVMaXN0W2ldO1xuICAgICAgICAgICAgbWVudS5uYW1lID0gaS50b1N0cmluZygpO1xuICAgICAgICAgICAgbWVudS5yZXNldE1lbnUoKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy8g5Yib5bu66I+c5Y2V5oyJ6ZKu5bm25LiU57uR5a6a5LqL5Lu2IOaIluiAheWIt+aWsFxuICAgIF9yZWZyZXNoU2luZ2xlSXRlbXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8g6YeN572uXG4gICAgICAgIHRoaXMuX3Jlc2V0TWVudSgpO1xuICAgICAgICAvLyDlpoLmnpzmgLvmlbDph4/mnInmm7TmlrDlsLHph43mlrDorqHnrpfmnIDlpKfpobXmlbBcbiAgICAgICAgdmFyIHRvdGFsID0gdGhpcy5kYXRhQmFzZS5zaW5nbGVfVGhyZWVfVG90YWxfU2hlZXRzW3RoaXMuX2N1cklkXTtcbiAgICAgICAgaWYgKHRoaXMuX2N1clRvdGFsICE9PSB0b3RhbCkge1xuICAgICAgICAgICAgdGhpcy5fY3VyVG90YWwgPSB0b3RhbDtcbiAgICAgICAgICAgIHRoaXMuX21heFBhZ2UgPSBNYXRoLmNlaWwodGhpcy5fY3VyVG90YWwgLyB0aGlzLl9mdXJuaXR1cmVUb3RhbCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8g6LWL5YC85pWw5o2uXG4gICAgICAgIHZhciBpbmRleCA9IDA7XG4gICAgICAgIHZhciBzdGFydE51bSA9ICh0aGlzLl9jdXJQYWdlIC0gMSkgKiB0aGlzLl9mdXJuaXR1cmVUb3RhbDtcbiAgICAgICAgdmFyIGVuZE51bSA9IHN0YXJ0TnVtICsgdGhpcy5fZnVybml0dXJlVG90YWw7XG4gICAgICAgIGlmIChlbmROdW0gPiB0aGlzLl9jdXJUb3RhbCkge1xuICAgICAgICAgICAgZW5kTnVtID0gdGhpcy5fY3VyVG90YWw7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGJpbmRFdmVudCA9IHRoaXMuX29uQ3JlYXRlRnVybml0dXJlRXZlbnQuYmluZCh0aGlzKTtcbiAgICAgICAgdmFyIGRhdGFTaGVldHMgPSB0aGlzLmRhdGFCYXNlLnNpbmdsZV9UaHJlZV9EYXRhU2hlZXRzW3RoaXMuX2N1cklkXTtcblxuICAgICAgICBmb3IodmFyIGkgPSBzdGFydE51bTsgaSA8IGVuZE51bTsgKytpKSB7XG4gICAgICAgICAgICB2YXIgbWVudSA9IHRoaXMuX21lbnVMaXN0W2luZGV4XTtcbiAgICAgICAgICAgIG1lbnUuZW50aXR5LmFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICB2YXIgbWVudURhdGEgPSBkYXRhU2hlZXRzW2ldO1xuICAgICAgICAgICAgaWYgKCFtZW51RGF0YSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbWVudURhdGEucHJvcHNfdHlwZSA9IHRoaXMuX2N1cklkO1xuICAgICAgICAgICAgbWVudURhdGEuaGFzRHJhZyA9IHRoaXMuX2hhc0RyYWc7XG4gICAgICAgICAgICBtZW51LmVudGl0eS50cmFuc2Zvcm0ucG9zaXRpb24gPSBuZXcgRmlyZS5WZWMyKC00OTAgKyAoaW5kZXggKiAxNjApLCA1NSk7XG4gICAgICAgICAgICBtZW51LnJlZnJlc2gobWVudURhdGEsIGJpbmRFdmVudCk7XG4gICAgICAgICAgICBpbmRleCsrO1xuICAgICAgICB9XG4gICAgICAgIC8vIOWIt+aWsOaMiemSrueKtuaAgVxuICAgICAgICB0aGlzLl9yZWZyZXNoQnRuU3RhdGUoKTtcbiAgICB9LFxuICAgIC8vIOiuvue9ruS9v+eUqOagh+iusFxuICAgIHNldE1hcmtVc2U6IGZ1bmN0aW9uIChtZW51RGF0YSwgbWVudSkge1xuICAgICAgICBpZiAodGhpcy5fY3VySWQgPT09IDApIHtcbiAgICAgICAgICAgIHZhciBjaGlsZHJlbiA9IHRoaXMuZGF0YUJhc2Uucm9vbS5nZXRDaGlsZHJlbigpO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgIHZhciBlbnQgPSBjaGlsZHJlbltpXTtcbiAgICAgICAgICAgICAgICB2YXIgZnVybml0dXJlID0gZW50LmdldENvbXBvbmVudCgnRnVybml0dXJlJyk7XG4gICAgICAgICAgICAgICAgaWYgKG1lbnVEYXRhLnByb3BzX2lkID09PSBmdXJuaXR1cmUucHJvcHNfaWQgJiZcbiAgICAgICAgICAgICAgICAgICAgZnVybml0dXJlLnBhY2tfaWQgPT09IG1lbnVEYXRhLnBhY2tfaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgbWVudS5zZXRNYXJrVXNlKHRydWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmIChwYXJzZUludChtZW51RGF0YS5zdWl0X2lkKSA9PT0gdGhpcy5kYXRhQmFzZS5jdXJEcmVzc1N1aXQuc3VpdF9pZCkge1xuICAgICAgICAgICAgICAgIG1lbnUuc2V0TWFya1VzZSh0cnVlKTtcbiAgICAgICAgICAgICAgICBpZighIHRoaXMubGFzdFN1aXRNZW51KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGFzdFN1aXRNZW51ID0gbWVudTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIOeJqeWTgeafnCAwOiDljZXlk4EgMe+8muWll+ijhVxuICAgIF9yZWZyZXNoQmFja3BhY2tJdGVtczogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyDph43nva5cbiAgICAgICAgdGhpcy5fcmVzZXRNZW51KCk7XG4gICAgICAgIHZhciBzaG93VG90YWwgPSB0aGlzLl9mdXJuaXR1cmVUb3RhbDtcbiAgICAgICAgaWYgKHRoaXMuX2N1cklkID09PSAxKSB7XG4gICAgICAgICAgICAvLyDlpZfoo4XmmL7npLrnmoTmlbDph49cbiAgICAgICAgICAgIHNob3dUb3RhbCA9IDU7XG4gICAgICAgIH1cbiAgICAgICAgLy8g5aaC5p6c5oC75pWw6YeP5pyJ5pu05paw5bCx6YeN5paw6K6h566X5pyA5aSn6aG15pWwXG4gICAgICAgIHZhciB0b3RhbCA9IHRoaXMuZGF0YUJhc2UuYmFja3BhY2tfVGhyZWVfVG90YWxfU2hlZXRzW3RoaXMuX2N1cklkXTtcbiAgICAgICAgaWYgKHRoaXMuX2N1clRvdGFsICE9PSB0b3RhbCkge1xuICAgICAgICAgICAgdGhpcy5fY3VyVG90YWwgPSB0b3RhbDtcbiAgICAgICAgICAgIHZhciBtYXhQYWdlID0gTWF0aC5jZWlsKHRoaXMuX2N1clRvdGFsIC8gc2hvd1RvdGFsKTtcbiAgICAgICAgICAgIHRoaXMuX21heFBhZ2UgPSBtYXhQYWdlID09PSAwID8gMSA6IG1heFBhZ2U7XG4gICAgICAgIH1cbiAgICAgICAgLy8g6LWL5YC85pWw5o2uXG4gICAgICAgIHZhciBpbmRleCA9IDA7XG4gICAgICAgIHZhciBzdGFydE51bSA9ICh0aGlzLl9jdXJQYWdlIC0gMSkgKiBzaG93VG90YWw7XG4gICAgICAgIHZhciBlbmROdW0gPSBzdGFydE51bSArIHNob3dUb3RhbDtcbiAgICAgICAgaWYgKGVuZE51bSA+IHRoaXMuX2N1clRvdGFsKSB7XG4gICAgICAgICAgICBlbmROdW0gPSB0aGlzLl9jdXJUb3RhbDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgYmluZEV2ZW50ID0gbnVsbDtcbiAgICAgICAgaWYgKHRoaXMuX2N1cklkID09PSAwKSB7XG4gICAgICAgICAgICAvLyDliJvlu7rljZXlk4HlrrblhbfliLDlnLrmma/kuK1cbiAgICAgICAgICAgIGJpbmRFdmVudCA9IHRoaXMuX29uQ3JlYXRlRnVybml0dXJlRXZlbnQuYmluZCh0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIOWIm+W7uuWll+ijheWutuWFt+WIsOWcuuaZr+S4rVxuICAgICAgICAgICAgYmluZEV2ZW50ID0gdGhpcy5fb25DcmVhdGVTdWl0SXRlbUV2ZW50LmJpbmQodGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGRhdGFTaGVldHMgPSB0aGlzLmRhdGFCYXNlLmJhY2twYWNrX1RocmVlX0RhdGFTaGVldHNbdGhpcy5fY3VySWRdO1xuICAgICAgICBmb3IodmFyIGkgPSBzdGFydE51bTsgaSA8IGVuZE51bTsgKytpKSB7XG4gICAgICAgICAgICB2YXIgbWVudSA9IHRoaXMuX21lbnVMaXN0W2luZGV4XTtcbiAgICAgICAgICAgIGlmICh0aGlzLl9jdXJJZCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIG1lbnUuZW50aXR5LnRyYW5zZm9ybS5wb3NpdGlvbiA9IG5ldyBGaXJlLlZlYzIoLTUwMCArIChpbmRleCAqIDE2MCksIDU1KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIG1lbnUuZW50aXR5LnRyYW5zZm9ybS5wb3NpdGlvbiA9IG5ldyBGaXJlLlZlYzIoLTQ5MCArIChpbmRleCAqIDI1MCksIDIwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG1lbnUuZW50aXR5LmFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICBpbmRleCsrO1xuICAgICAgICAgICAgdmFyIG1lbnVEYXRhID0gZGF0YVNoZWV0c1tpXTtcbiAgICAgICAgICAgIGlmICghbWVudURhdGEpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIOWIpOaWreeJqeWTgeafnOiPnOWNleeahOaYvuekuumXrumimFxuICAgICAgICAgICAgdGhpcy5zZXRNYXJrVXNlKG1lbnVEYXRhLCBtZW51KTtcbiAgICAgICAgICAgIG1lbnUucmVmcmVzaChtZW51RGF0YSwgYmluZEV2ZW50KTtcbiAgICAgICAgfVxuICAgICAgICAvLyDliLfmlrDmjInpkq7nirbmgIFcbiAgICAgICAgdGhpcy5fcmVmcmVzaEJ0blN0YXRlKCk7XG4gICAgfSxcbiAgICAvLyDliJvlu7roj5zljZXlrrnlmahcbiAgICBfY3JlYXRlTWVudUVudDogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgdGVtcEZ1cm5pdHVyZSA9IHRoaXMuZGF0YUJhc2UudGVtcFN1YlRocmVlTWVudTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9mdXJuaXR1cmVUb3RhbDsgKytpKSB7XG4gICAgICAgICAgICB2YXIgZW50ID0gRmlyZS5pbnN0YW50aWF0ZSh0ZW1wRnVybml0dXJlKTtcbiAgICAgICAgICAgIGVudC5uYW1lID0gaS50b1N0cmluZygpO1xuICAgICAgICAgICAgZW50LnBhcmVudCA9IHRoaXMucm9vdDtcbiAgICAgICAgICAgIGVudC50cmFuc2Zvcm0ucG9zaXRpb24gPSBuZXcgRmlyZS5WZWMyKC01MDAgKyAoaSAqIDE2MCksIDU1KTtcbiAgICAgICAgICAgIHZhciBtZW51ID0gZW50LmdldENvbXBvbmVudCgnVGhyZWVNZW51Jyk7XG4gICAgICAgICAgICBtZW51LmluaXQoKTtcbiAgICAgICAgICAgIC8vIOWtmOWCqOWvueixoVxuICAgICAgICAgICAgdGhpcy5fbWVudUxpc3QucHVzaChtZW51KTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy8g5r+A5rS76I+c5Y2V5pe26Kem5Y+R55qE5LqL5Lu2XG4gICAgLy8gaWQ6IOmCo+S4quexu+Wei+eJqeWTgeeahElEXG4gICAgLy8gdHlwZTogMCDljZXlk4EgMSDlpZfoo4UgMiDnianlk4Hmn5xcbiAgICBvcGVuTWVudTogZnVuY3Rpb24gKGlkLCB0eXBlLCBoYXNEcmFnKSB7XG4gICAgICAgIHRoaXMuX2N1clR5cGUgPSB0eXBlO1xuICAgICAgICB0aGlzLl9jdXJJZCA9IGlkO1xuICAgICAgICB0aGlzLl9oYXNEcmFnID0gaGFzRHJhZztcbiAgICAgICAgLy8g6I635Y+W6I+c5Y2V5oyJ6ZKu5bm25LiU57uR5a6a5LqL5Lu2XG4gICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgIHRoaXMuX3JlZnJlc2hTaW5nbGVJdGVtcygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgIHRoaXMuX3JlZnJlc2hCYWNrcGFja0l0ZW1zKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgLy8g5pi+56S65b2T5YmN56qX5Y+jXG4gICAgICAgIHRoaXMuZW50aXR5LmFjdGl2ZSA9IHRydWU7XG4gICAgfSxcbiAgICAvLyDkuIrkuIDpobVcbiAgICBfb25QcmV2aW91c0V2ZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuX2N1clBhZ2UgLT0gMTtcbiAgICAgICAgaWYgKHRoaXMuX2N1clBhZ2UgPCAxKXtcbiAgICAgICAgICAgIHRoaXMuX2N1clBhZ2UgPSAxO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLl9jdXJUeXBlID09PSAwKSB7XG4gICAgICAgICAgICB0aGlzLl9yZWZyZXNoU2luZ2xlSXRlbXMoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0aGlzLl9jdXJUeXBlID09PSAyKSB7XG4gICAgICAgICAgICB0aGlzLl9yZWZyZXNoQmFja3BhY2tJdGVtcygpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyDkuIvkuIDpobVcbiAgICBfb25OZXh0RXZlbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5fY3VyUGFnZSArPSAxO1xuICAgICAgICBpZiAodGhpcy5fY3VyUGFnZSA+IHRoaXMuX21heFBhZ2Upe1xuICAgICAgICAgICAgdGhpcy5fY3VyUGFnZSA9IHRoaXMuX21heFBhZ2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX2N1clR5cGUgPT09IDApIHtcbiAgICAgICAgICAgIHRoaXMuX3JlZnJlc2hTaW5nbGVJdGVtcygpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHRoaXMuX2N1clR5cGUgPT09IDIpIHtcbiAgICAgICAgICAgIHRoaXMuX3JlZnJlc2hCYWNrcGFja0l0ZW1zKCk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIOi/lOWbnuS4iuS4gOe6p+iPnOWNlVxuICAgIF9vblJldHVybkV2ZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuX2N1cklkID0gMDtcbiAgICAgICAgdGhpcy5fY3VyUGFnZSA9IDE7XG4gICAgICAgIHRoaXMuZW50aXR5LmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLmRhdGFCYXNlLnNlY29uZE1lbnVNZ3Iub3Blbk1lbnUodGhpcy5fY3VyVHlwZSk7XG4gICAgfSxcbiAgICAvLyDlhbPpl63oj5zljZVcbiAgICBjbG9zZU1lbnU6IGZ1bmN0aW9uIChoYXNNb2RpZnlUb2dnbGUpIHtcbiAgICAgICAgdGhpcy5fY3VySWQgPSAwO1xuICAgICAgICB0aGlzLl9jdXJQYWdlID0gMTtcbiAgICAgICAgdGhpcy5lbnRpdHkuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgIGlmIChoYXNNb2RpZnlUb2dnbGUpIHtcbiAgICAgICAgICAgIHRoaXMuZGF0YUJhc2UuZmlyc3RNZW51TWdyLm1vZGlmeVRvZ2dsZSgpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyDlhbPpl63lvZPliY3oj5zljZVcbiAgICBfb25DbG9zZU1lbnU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5jbG9zZU1lbnUodHJ1ZSk7XG4gICAgfSxcbiAgICAvLyDliLfmlrDmjInpkq7nirbmgIFcbiAgICBfcmVmcmVzaEJ0blN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuYnRuX0xlZnQuYWN0aXZlID0gdGhpcy5fY3VyUGFnZSA+IDE7XG4gICAgICAgIHRoaXMuYnRuX1JpZ2h0LmFjdGl2ZSA9IHRoaXMuX2N1clBhZ2UgPCB0aGlzLl9tYXhQYWdlO1xuICAgICAgICB0aGlzLnBhZ2VUZXh0LnRleHQgPSAn6aG15pWwOicgKyB0aGlzLl9jdXJQYWdlICsgXCIvXCIgKyB0aGlzLl9tYXhQYWdlO1xuICAgIH0sXG4gICAgLy8g5byA5aeLXG4gICAgc3RhcnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8g5bi455So55qE5Y+Y6YePL+aVsOaNrlxuICAgICAgICB2YXIgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL0RhdGFCYXNlJyk7XG4gICAgICAgIHRoaXMuZGF0YUJhc2UgPSBlbnQuZ2V0Q29tcG9uZW50KCdEYXRhQmFzZScpO1xuICAgICAgICAvLyDojrflj5blhbPpl63mjInpkq7lubbnu5Hlrprkuovku7ZcbiAgICAgICAgZW50ID0gdGhpcy5lbnRpdHkuZmluZCgnYnRuX2Nsb3NlJyk7XG4gICAgICAgIHZhciBidG5DbG9zZSA9IGVudC5nZXRDb21wb25lbnQoJ1VJQnV0dG9uJyk7XG4gICAgICAgIGJ0bkNsb3NlLm9uQ2xpY2sgPSB0aGlzLl9vbkNsb3NlTWVudS5iaW5kKHRoaXMpO1xuICAgICAgICAvLyDov5Tlm57kuIrkuIDnuqfoj5zljZVcbiAgICAgICAgZW50ID0gdGhpcy5lbnRpdHkuZmluZCgnYnRuX3JldHVybicpO1xuICAgICAgICB2YXIgYnRuUmV0dXJuID0gZW50LmdldENvbXBvbmVudCgnVUlCdXR0b24nKTtcbiAgICAgICAgYnRuUmV0dXJuLm9uQ2xpY2sgPSB0aGlzLl9vblJldHVybkV2ZW50LmJpbmQodGhpcyk7XG4gICAgICAgIC8vIOS4iuS4gOmhtVxuICAgICAgICB0aGlzLmJ0bl9MZWZ0ID0gdGhpcy5lbnRpdHkuZmluZCgnYnRuX2xlZnQnKTtcbiAgICAgICAgdmFyIGJ0bkxlZnQgPSB0aGlzLmJ0bl9MZWZ0LmdldENvbXBvbmVudCgnVUlCdXR0b24nKTtcbiAgICAgICAgYnRuTGVmdC5vbkNsaWNrID0gdGhpcy5fb25QcmV2aW91c0V2ZW50LmJpbmQodGhpcyk7XG4gICAgICAgIC8vIOS4i+S4gOmhtVxuICAgICAgICB0aGlzLmJ0bl9SaWdodCA9IHRoaXMuZW50aXR5LmZpbmQoJ2J0bl9yaWdodCcpO1xuICAgICAgICB2YXIgYnRuUmlnaHQgPSB0aGlzLmJ0bl9SaWdodC5nZXRDb21wb25lbnQoJ1VJQnV0dG9uJyk7XG4gICAgICAgIGJ0blJpZ2h0Lm9uQ2xpY2sgPSB0aGlzLl9vbk5leHRFdmVudC5iaW5kKHRoaXMpO1xuICAgICAgICAvL1xuICAgICAgICB0aGlzLmJ0bl9MZWZ0LmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLmJ0bl9SaWdodC5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgLy9cbiAgICAgICAgdGhpcy5fY3JlYXRlTWVudUVudCgpO1xuICAgICAgICAvLyDpooTliqDovb0gVGhyZWUgU3ViIE1lbnVcbiAgICAgICAgdGhpcy5kYXRhQmFzZS5wcmVsb2FkU2luYWdsZUl0ZW1zRGF0YV9UaHJlZSgxLCB0aGlzLl9jdXJQYWdlLCB0aGlzLl9mdXJuaXR1cmVUb3RhbCwgdGhpcy5iaW5kTG9hZE1lbnVJbWFnZUNCKTtcbiAgICAgICAgdGhpcy5kYXRhQmFzZS5wcmVsb2FkU2luYWdsZUl0ZW1zRGF0YV9UaHJlZSgyLCB0aGlzLl9jdXJQYWdlLCB0aGlzLl9mdXJuaXR1cmVUb3RhbCwgdGhpcy5iaW5kTG9hZE1lbnVJbWFnZUNCKTtcbiAgICAgICAgdGhpcy5kYXRhQmFzZS5wcmVsb2FkU2luYWdsZUl0ZW1zRGF0YV9UaHJlZSgzLCB0aGlzLl9jdXJQYWdlLCB0aGlzLl9mdXJuaXR1cmVUb3RhbCwgdGhpcy5iaW5kTG9hZE1lbnVJbWFnZUNCKTtcbiAgICAgICAgdGhpcy5kYXRhQmFzZS5wcmVsb2FkU2luYWdsZUl0ZW1zRGF0YV9UaHJlZSg0LCB0aGlzLl9jdXJQYWdlLCB0aGlzLl9mdXJuaXR1cmVUb3RhbCwgdGhpcy5iaW5kTG9hZE1lbnVJbWFnZUNCKTtcbiAgICAgICAgdGhpcy5kYXRhQmFzZS5wcmVsb2FkU2luYWdsZUl0ZW1zRGF0YV9UaHJlZSg1LCB0aGlzLl9jdXJQYWdlLCB0aGlzLl9mdXJuaXR1cmVUb3RhbCwgdGhpcy5iaW5kTG9hZE1lbnVJbWFnZUNCKTtcbiAgICAgICAgdGhpcy5kYXRhQmFzZS5wcmVsb2FkU2luYWdsZUl0ZW1zRGF0YV9UaHJlZSg2LCB0aGlzLl9jdXJQYWdlLCB0aGlzLl9mdXJuaXR1cmVUb3RhbCwgdGhpcy5iaW5kTG9hZE1lbnVJbWFnZUNCKTtcbiAgICAgICAgdGhpcy5kYXRhQmFzZS5wcmVsb2FkU2luYWdsZUl0ZW1zRGF0YV9UaHJlZSg3LCB0aGlzLl9jdXJQYWdlLCB0aGlzLl9mdXJuaXR1cmVUb3RhbCwgdGhpcy5iaW5kTG9hZE1lbnVJbWFnZUNCKTtcbiAgICAgICAgdGhpcy5kYXRhQmFzZS5wcmVsb2FkU2luYWdsZUl0ZW1zRGF0YV9UaHJlZSg4LCB0aGlzLl9jdXJQYWdlLCB0aGlzLl9mdXJuaXR1cmVUb3RhbCwgdGhpcy5iaW5kTG9hZE1lbnVJbWFnZUNCKTtcbiAgICB9LFxuICAgIC8vIOWbvueJh+i9veWFpeWujOavleS7peWQjueahOWbnuiwg1xuICAgIGxvYWRNZW51SW1hZ2VDQjogZnVuY3Rpb24gKGlkLCBpbmRleCwgcGFnZSwgbWVudURhdGEpIHtcbiAgICAgICAgaWYgKHRoaXMuX2N1cklkID09PSBpZCAmJiB0aGlzLl9jdXJQYWdlID09PSBwYWdlKSB7XG4gICAgICAgICAgICB2YXIgbWVudSA9IHRoaXMuX21lbnVMaXN0W2luZGV4XTtcbiAgICAgICAgICAgIGlmIChtZW51KSB7XG4gICAgICAgICAgICAgICAgbWVudS5yZWZyZXNoKG1lbnVEYXRhLCB0aGlzLl9vbkNyZWF0ZUZ1cm5pdHVyZUV2ZW50LmJpbmQodGhpcykpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICB1cGRhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8g5Yy56YWNVUnliIbovqjnjodcbiAgICAgICAgLy92YXIgY2FtZXJhID0gRmlyZS5DYW1lcmEubWFpbjtcbiAgICAgICAgLy92YXIgYmdXb3JsZEJvdW5kcyA9IHRoaXMuZGF0YUJhc2UuYmdSZW5kZXIuZ2V0V29ybGRCb3VuZHMoKTtcbiAgICAgICAgLy92YXIgYmdMZWZ0VG9wV29ybGRQb3MgPSBuZXcgRmlyZS5WZWMyKGJnV29ybGRCb3VuZHMueE1pbiwgYmdXb3JsZEJvdW5kcy55TWluKTtcbiAgICAgICAgLy92YXIgYmdsZWZ0VG9wID0gY2FtZXJhLndvcmxkVG9TY3JlZW4oYmdMZWZ0VG9wV29ybGRQb3MpO1xuICAgICAgICAvL3ZhciBzY3JlZW5Qb3MgPSBuZXcgRmlyZS5WZWMyKGJnbGVmdFRvcC54LCBiZ2xlZnRUb3AueSk7XG4gICAgICAgIC8vdmFyIHdvcmxkUG9zID0gY2FtZXJhLnNjcmVlblRvV29ybGQoc2NyZWVuUG9zKTtcbiAgICAgICAgLy90aGlzLmVudGl0eS50cmFuc2Zvcm0ud29ybGRQb3NpdGlvbiA9IHdvcmxkUG9zO1xuICAgICAgICAvLyDljLnphY1VSeWIhui+qOeOh1xuICAgICAgICB2YXIgY2FtZXJhID0gRmlyZS5DYW1lcmEubWFpbjtcbiAgICAgICAgdmFyIHNjcmVlblNpemUgPSBGaXJlLlNjcmVlbi5zaXplLm11bChjYW1lcmEuc2l6ZSAvIEZpcmUuU2NyZWVuLmhlaWdodCk7XG4gICAgICAgIHZhciBuZXdQb3MgPSBGaXJlLnYyKHRoaXMubWFyZ2luLngsIC1zY3JlZW5TaXplLnkgLyAyICsgdGhpcy5tYXJnaW4ueSk7XG4gICAgICAgIHRoaXMuZW50aXR5LnRyYW5zZm9ybS5wb3NpdGlvbiA9IG5ld1BvcztcbiAgICB9XG59KTtcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnMWYxNGV5VkwveExBYURxV2RmaHljRGUnLCAnVGhyZWVNZW51Jyk7XG4vLyBzY3JpcHRcXHZpbGxhXFxUaHJlZU1lbnUuanNcblxudmFyIFRocmVlTWVudSA9IEZpcmUuQ2xhc3Moe1xuICAgIC8vIOe7p+aJv1xuICAgIGV4dGVuZHM6IEZpcmUuQ29tcG9uZW50LFxuICAgIC8vIOaehOmAoOWHveaVsFxuICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuX2J0bk1lbnUgPSBudWxsO1xuICAgICAgICB0aGlzLl9wcmljZVRleHQgPSBudWxsO1xuICAgICAgICB0aGlzLnNtYWxsU3ByaXRlID0gbnVsbDtcbiAgICAgICAgLy8g5aaC5p6c5piv5aWX6KOF55qE6K+d5bCx5pyJ5a625YW35YiX6KGoXG4gICAgICAgIHRoaXMuZHJlc3NMaXN0ID0gW107XG4gICAgfSxcbiAgICAvLyDlsZ7mgKdcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIHByb3BzX25hbWU6ICcnLFxuICAgICAgICAvLyDnianlk4FJRFxuICAgICAgICBwcm9wc19pZDogMCxcbiAgICAgICAgLy8g54mp5ZOBVUlEXG4gICAgICAgIHByb3BzX3VpZDogMCxcbiAgICAgICAgLy8g5aWX6KOFSURcbiAgICAgICAgc3VpdF9pZDogMCxcbiAgICAgICAgLy8g5aWX6KOF5ZCN56ewXG4gICAgICAgIHN1aXRfbmFtZTogJycsXG4gICAgICAgIC8vIOiDjOWMhUlEXG4gICAgICAgIHBhY2tfaWQ6IDAsXG4gICAgICAgIC8vIOexu+WIq1xuICAgICAgICBwcm9wc190eXBlOiAwLFxuICAgICAgICAvLyDku7fmoLxcbiAgICAgICAgcHJpY2U6IDAsXG4gICAgICAgIC8vIOaKmOaJo1xuICAgICAgICBkaXNjb3VudDogMCxcbiAgICAgICAgLy8g5aSn5Zu+VXJsXG4gICAgICAgIGJpZ0ltYWdlVXJsOiAnJyxcbiAgICAgICAgLy8g5piv5ZCm5Y+v5Lul5ouW5Yqo77yI5L6L5aaC5aOB57q45LiO5Zyw6Z2i5peg5rOV5ouW5Yqo77yJXG4gICAgICAgIGhhc0RyYWc6IGZhbHNlLFxuICAgICAgICAvLyDmmK/lkKbmnInkvb/nlKjov4dcbiAgICAgICAgaGFzVXNlOiBmYWxzZSxcbiAgICAgICAgLy8g6L295YWl5pe255qE5Zu+54mHXG4gICAgICAgIGRlZmF1bHRTcHJpdGU6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlNwcml0ZVxuICAgICAgICB9LFxuICAgICAgICBkZWZhdWx0TG9hZEFuaW06IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLkFuaW1hdGlvblxuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyDph43nva7lrrblhbdcbiAgICByZXNldE1lbnU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5fYnRuTWVudS5zZXRUZXh0KCfovb3lhaXkuK0nKTtcbiAgICAgICAgdGhpcy5fYnRuTWVudS5zZXRTcHJpdGUodGhpcy5kZWZhdWx0U3ByaXRlKTtcbiAgICAgICAgdGhpcy5fYnRuTWVudS5vbkNsaWNrID0gbnVsbDtcbiAgICAgICAgdGhpcy5lbnRpdHkubmFtZSA9ICfmsqHotYvlgLwnO1xuICAgICAgICB0aGlzLnByb3BzX2lkID0gMDtcbiAgICAgICAgdGhpcy5wcm9wc191aWQgPSAwO1xuICAgICAgICB0aGlzLnN1aXRfaWQgPSAwO1xuICAgICAgICB0aGlzLnBhY2tfaWQgPSAwO1xuICAgICAgICB0aGlzLnN1aXRfbmFtZSA9ICcnO1xuICAgICAgICB0aGlzLnByb3BzX3R5cGUgPSAwO1xuICAgICAgICB0aGlzLmJpZ0ltYWdlVXJsID0gJ+ayoeacieW+l+WIsOWkp+WbvlVSTCc7XG4gICAgICAgIHRoaXMuaGFzRHJhZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLnNldE1hcmtVc2UoZmFsc2UpO1xuICAgICAgICB0aGlzLnNldFRleHQoJycpO1xuICAgICAgICB0aGlzLnNldFByaWNlKDApO1xuICAgICAgICB0aGlzLnNtYWxsU3ByaXRlID0gbnVsbDtcbiAgICAgICAgdGhpcy5kcmVzc0xpc3QgPSBbXTtcbiAgICAgICAgdGhpcy5lbnRpdHkuYWN0aXZlID0gZmFsc2U7XG4gICAgfSxcbiAgICAvLyDorr7nva7mloflrZdcbiAgICBzZXRUZXh0OiBmdW5jdGlvbiAodGV4dCkge1xuICAgICAgICB0aGlzLl9idG5NZW51LnNldFRleHQodGV4dCk7XG4gICAgfSxcbiAgICAvLyDorr7nva7ku7fmoLxcbiAgICBzZXRQcmljZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHRoaXMucHJpY2UgPSAhdmFsdWUgPyAwIDogdmFsdWU7XG4gICAgICAgIHRoaXMuX3ByaWNlVGV4dC5lbnRpdHkuYWN0aXZlID0gdGhpcy5wcmljZSAhPT0gMDtcbiAgICAgICAgdGhpcy5fcHJpY2VUZXh0LnRleHQgPSB2YWx1ZTtcbiAgICB9LFxuICAgIC8vIOiuvue9ruWbvueJh1xuICAgIHNldFNwcml0ZTogZnVuY3Rpb24gKHNtYWxsU3ByaXRlLCBldmVudCkge1xuICAgICAgICBpZiAoISBzbWFsbFNwcml0ZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc21hbGxTcHJpdGUgPSBzbWFsbFNwcml0ZTtcblxuICAgICAgICB0aGlzLl9idG5NZW51LnNldFNwcml0ZShzbWFsbFNwcml0ZSk7XG4gICAgICAgIGlmIChzbWFsbFNwcml0ZS53aWR0aCA+IDExMCB8fCBzbWFsbFNwcml0ZS5oZWlnaHQgPiAxMjApIHtcbiAgICAgICAgICAgIHRoaXMuX2J0bk1lbnUuYnRuUmVuZGVyLnVzZUN1c3RvbVNpemUgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5fYnRuTWVudS5idG5SZW5kZXIuY3VzdG9tV2lkdGggPSAxMTA7XG4gICAgICAgICAgICB0aGlzLl9idG5NZW51LmJ0blJlbmRlci5jdXN0b21IZWlnaHQgPSAxMjA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGV2ZW50KSB7XG4gICAgICAgICAgICB0aGlzLl9idG5NZW51Lm9uQ2xpY2sgPSBldmVudDtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy8g5qCH6K6w5bey5L2/55SoXG4gICAgc2V0TWFya1VzZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuaGFzVXNlID0gdmFsdWU7XG4gICAgICAgIHRoaXMuX2J0bk1lbnUuc2V0RGlzYWJsZWQodmFsdWUpO1xuICAgIH0sXG4gICAgLy8g5byA5aeL5pe2XG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyDluLjnlKjnmoTlj5jph48v5pWw5o2uXG4gICAgICAgIHZhciBlbnQgPSBGaXJlLkVudGl0eS5maW5kKCcvRGF0YUJhc2UnKTtcbiAgICAgICAgdGhpcy5kYXRhQmFzZSA9IGVudC5nZXRDb21wb25lbnQoJ0RhdGFCYXNlJyk7XG4gICAgICAgIGlmICghIHRoaXMuX2J0bk1lbnUpIHtcbiAgICAgICAgICAgIGVudCA9IHRoaXMuZW50aXR5LmZpbmQoJ2J0bl9NZW51Jyk7XG4gICAgICAgICAgICB0aGlzLl9idG5NZW51ID0gZW50LmdldENvbXBvbmVudCgnVUlCdXR0b24nKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoISB0aGlzLl9wcmljZVRleHQpIHtcbiAgICAgICAgICAgIGVudCA9IHRoaXMuZW50aXR5LmZpbmQoJ3ByaWNlJyk7XG4gICAgICAgICAgICB0aGlzLl9wcmljZVRleHQgPSBlbnQuZ2V0Q29tcG9uZW50KEZpcmUuVGV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgLy9cbiAgICAgICAgdmFyIHN0YXRlID0gdGhpcy5kZWZhdWx0TG9hZEFuaW0ucGxheSgnbG9hZGluZycpO1xuICAgICAgICBzdGF0ZS53cmFwTW9kZSA9IEZpcmUuV3JhcE1vZGUuTG9vcDtcbiAgICAgICAgc3RhdGUucmVwZWF0Q291bnQgPSBJbmZpbml0eTtcbiAgICAgICAgLy9cbiAgICAgICAgdGhpcy5yZXNldE1lbnUoKTtcbiAgICB9LFxuICAgIC8vIOWIt+aWsOW3suS4i+i9vei/h+WQjueahOaVsOaNrlxuICAgIHJlZnJlc2g6IGZ1bmN0aW9uIChkYXRhLCBiaW5kRXZlbnQpIHtcbiAgICAgICAgdGhpcy5lbnRpdHkubmFtZSA9IGRhdGEucHJvcHNfaWQgfHwgMDtcbiAgICAgICAgdGhpcy5wcm9wc19pZCA9IGRhdGEucHJvcHNfaWQgfHwgMDtcbiAgICAgICAgdGhpcy5wcm9wc191aWQgPSBkYXRhLnByb2RfdWlkIHx8IDA7XG4gICAgICAgIHRoaXMucGFja19pZCA9IGRhdGEucGFja19pZCB8fCAwO1xuICAgICAgICB0aGlzLnByb3BzX3R5cGUgPSBwYXJzZUludChkYXRhLnByb3BzX3R5cGUpIHx8IDA7XG4gICAgICAgIHRoaXMuZGlzY291bnQgPSBkYXRhLmRpc2NvdW50IHx8IDE7XG4gICAgICAgIHRoaXMuaGFzRHJhZyA9IGRhdGEuaGFzRHJhZyB8fCBmYWxzZTtcbiAgICAgICAgdGhpcy5zdWl0X2lkID0gcGFyc2VJbnQoZGF0YS5zdWl0X2lkIHx8IDApO1xuICAgICAgICB0aGlzLnN1aXRfbmFtZSA9IGRhdGEuc3VpdF9uYW1lIHx8ICcnO1xuICAgICAgICB0aGlzLnByb3BzX25hbWUgPSBkYXRhLnByb3BzX25hbWUgfHwgJyc7XG4gICAgICAgIHRoaXMuc2V0VGV4dChkYXRhLnByb3BzX25hbWUgfHwgZGF0YS5zdWl0X25hbWUpO1xuICAgICAgICB0aGlzLnNldFByaWNlKGRhdGEucHJpY2UgfHwgMCk7XG4gICAgICAgIHRoaXMuYmlnSW1hZ2VVcmwgPSBkYXRhLmJpZ0ltYWdlVXJsO1xuICAgICAgICB0aGlzLmRyZXNzTGlzdCA9IGRhdGEuZHJlc3NMaXN0IHx8IFtdO1xuICAgICAgICB0aGlzLmVudGl0eS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICB0aGlzLl9idG5NZW51LmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5kZWZhdWx0TG9hZEFuaW0uZW50aXR5LmFjdGl2ZSA9IHRydWU7XG4gICAgICAgIHRoaXMuZGVmYXVsdExvYWRBbmltLnBsYXkoJ2xvYWRpbmcnKTtcbiAgICAgICAgdGhpcy5zZXRNYXJrVXNlKGRhdGEuc3RhdHVzID09PSBcIjFcIiB8fCBmYWxzZSk7XG4gICAgICAgIC8vXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgc2VsZi5kYXRhQmFzZS5sb2FkSW1hZ2UoZGF0YS5pbWFnZVVybCwgZnVuY3Rpb24gKGRhdGEsIGVycm9yLCBpbWFnZSkge1xuICAgICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHNlbGYudGlkICE9PSBkYXRhLnRpZCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBzcHJpdGUgPSBuZXcgRmlyZS5TcHJpdGUoaW1hZ2UpO1xuICAgICAgICAgICAgc2VsZi5zZXRTcHJpdGUoc3ByaXRlLCBiaW5kRXZlbnQpO1xuICAgICAgICAgICAgc2VsZi5fYnRuTWVudS5lbnRpdHkuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgICAgIHNlbGYuZGVmYXVsdExvYWRBbmltLmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgfS5iaW5kKHRoaXMsIGRhdGEpKTtcbiAgICB9XG59KTtcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnZWVhNjlDVVRlSkRSYjkveWRiL1ZHZFQnLCAnVGlwTG9hZCcpO1xuLy8gc2NyaXB0XFx2aWxsYVxcVGlwTG9hZC5qc1xuXG52YXIgVGlwTG9hZCA9IEZpcmUuQ2xhc3Moe1xuICAgIC8vIOe7p+aJv1xuICAgIGV4dGVuZHM6IEZpcmUuQ29tcG9uZW50LFxuICAgIC8vIOaehOmAoOWHveaVsFxuICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiAoKSB7XG5cbiAgICB9LFxuICAgIC8vIOWxnuaAp1xuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgY29udGVudDp7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5CaXRtYXBUZXh0XG4gICAgICAgIH0sXG4gICAgICAgIGxvYWRJY29uOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5FbnRpdHlcbiAgICAgICAgfSxcbiAgICAgICAgYW5pbToge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuQW5pbWF0aW9uXG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIOWKoOi9vVxuICAgIG9uTG9hZDogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgc3RhdGUgPSB0aGlzLmFuaW0ucGxheSgnbG9hZGluZycpO1xuICAgICAgICBzdGF0ZS53cmFwTW9kZSA9IEZpcmUuV3JhcE1vZGUuTG9vcDtcbiAgICAgICAgc3RhdGUucmVwZWF0Q291bnQgPSBJbmZpbml0eTtcbiAgICB9LFxuICAgIC8vIOaJk+W8gOeql+WPo1xuICAgIG9wZW5UaXBzOiBmdW5jdGlvbiAodGV4dCkge1xuICAgICAgICB0aGlzLmFuaW0ucGxheSgnbG9hZGluZycpO1xuICAgICAgICB0aGlzLmVudGl0eS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICBpZiAodGV4dCkge1xuICAgICAgICAgICAgdGhpcy5jb250ZW50LnRleHQgPSB0ZXh0O1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5jb250ZW50LnRleHQgPSAn5Yqg6L295Lit6K+356iN5ZCOLi4uJztcbiAgICAgICAgfVxuICAgICAgICB2YXIgc2l6ZSA9IHRoaXMuY29udGVudC5nZXRXb3JsZFNpemUoKTtcbiAgICAgICAgdGhpcy5sb2FkSWNvbi50cmFuc2Zvcm0ud29ybGRQb3NpdGlvbiA9IG5ldyBGaXJlLlZlYzIoc2l6ZS54IC8gMiArIDUwLCAwKTtcbiAgICB9LFxuICAgIC8vIOWFs+mXreeql+WPo1xuICAgIGNsb3NlVGlwczogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmFuaW0uc3RvcCgnbG9hZGluZycpO1xuICAgICAgICB0aGlzLmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcbiAgICB9XG59KTtcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnYTRlMzd0QmFCdE8xNUkrUjdmWXBNWmwnLCAnVGlwX015QWRkJyk7XG4vLyBzY3JpcHRcXG91dGRvb3JcXFRpcF9NeUFkZC5qc1xuXG52YXIgQ29tcCA9IEZpcmUuQ2xhc3Moe1xyXG4gICAgZXh0ZW5kczogRmlyZS5Db21wb25lbnQsXHJcblxyXG4gICAgcHJvcGVydGllczoge1xyXG4gICAgICAgIGJ0bl9EZXRlcm1pbmU6IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5VSUJ1dHRvblxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYnRuX0Nsb3NlOiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVUlCdXR0b25cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgX29uQ2xvc2VXaW5kb3c6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLmNsb3NlVGlwcygpO1xyXG4gICAgfSxcclxuICAgIF9vbkRldGVybWluZUV2ZW50OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5jbG9zZVRpcHMoKTtcclxuICAgIH0sXHJcbiAgICBvcGVuVGlwc1dpbmRvdzogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuZW50aXR5LmFjdGl2ZSA9IHRydWU7XHJcbiAgICB9LFxyXG4gICAgY2xvc2VUaXBzOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5lbnRpdHkuYWN0aXZlID0gZmFsc2U7XHJcbiAgICB9LFxyXG4gICAgb25Mb2FkOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5idG5fQ2xvc2Uub25DbGljayA9IHRoaXMuX29uQ2xvc2VXaW5kb3cuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLmJ0bl9EZXRlcm1pbmUub25DbGljayA9IHRoaXMuX29uRGV0ZXJtaW5lRXZlbnQuYmluZCh0aGlzKTtcclxuICAgIH1cclxufSk7XHJcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnMjA5NDRMQm12UklNN2hHdXlKekM0TWMnLCAnVGlwc1BheU1lbnQnKTtcbi8vIHNjcmlwdFxcdmlsbGFcXFRpcHNQYXlNZW50LmpzXG5cbnZhciBUaXBzUGF5TWVudCA9IEZpcmUuQ2xhc3Moe1xuICAgIGV4dGVuZHM6IEZpcmUuQ29tcG9uZW50LFxuXG4gICAgcHJvcGVydGllczoge1xuICAgICAgICBidG5fUGF5OiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5VSUJ1dHRvblxuICAgICAgICB9LFxuICAgICAgICBidG5fUGF5SXNzdWVzOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5VSUJ1dHRvblxuICAgICAgICB9LFxuICAgICAgICBidG5fQ2xvc2U6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlVJQnV0dG9uXG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIOWFs+mXreaMiemSruS6i+S7tlxuICAgIF9vbkNsb3NlV2luZG93OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuY2xvc2VUaXBzKCk7XG4gICAgfSxcbiAgICAvLyDlt7Lnu4/lrozmiJDku5jmrL7vvIzpnIDopoHpgJrorq/mnI3liqHlmahcbiAgICBfb25DaGVja1BheTogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHNlbGYuZGF0YUJhc2UubG9hZFRpcHMub3BlblRpcHMoJ+ehruiupOWFheWAvOaYr+WQpuWujOavle+8geivt+eojeWQji4uLicpO1xuICAgICAgICB2YXIgc2VuZERhdGEgPSB7XG4gICAgICAgICAgICBtYXJrOiB0aGlzLmRhdGFCYXNlLm1hcmtcbiAgICAgICAgfTtcbiAgICAgICAgc2VsZi5kYXRhQmFzZS5uZXRXb3JrTWdyLlJlcXVlc3RDYW5EcmVzc1Jvb20oc2VuZERhdGEsIGZ1bmN0aW9uIChzZXJ2ZXJEYXRhKSB7XG4gICAgICAgICAgICBzZWxmLmRhdGFCYXNlLnVzZXJjYyA9IHNlcnZlckRhdGEudXNlcmNjO1xuICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS5wYXlNZW50V2luZG93LnJlZnJlc2hVc2VyQ0MoKTtcbiAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UubG9hZFRpcHMuY2xvc2VUaXBzKCk7XG4gICAgICAgICAgICBzZWxmLmRhdGFCYXNlLnRpcHNXaW5kb3cub3BlblRpcHNXaW5kb3coJ+WFheWAvOaIkOWKnyEnKTtcbiAgICAgICAgICAgIHNlbGYuY2xvc2VUaXBzKCk7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLy8g5LuY5qy+6YGH5Yiw55qE6Zeu6aKYXG4gICAgX29uUGF5SXNzdWVzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuZGF0YUJhc2UudGlwc1BheVByb2JsZW1zLm9wZW5UaXBzKCk7XG4gICAgfSxcbiAgICAvLyDlvIDlkK/mj5DnpLrnqpflj6NcbiAgICBvcGVuVGlwczogZnVuY3Rpb24gKHRleHQpIHtcbiAgICAgICAgdGhpcy5lbnRpdHkuYWN0aXZlID0gdHJ1ZTtcbiAgICB9LFxuICAgIC8vIOWFs+mXreaPkOekuueql+WPo1xuICAgIGNsb3NlVGlwczogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcbiAgICB9LFxuICAgIC8vIOWKoOi9veaXtlxuICAgIG9uTG9hZDogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyDluLjnlKjnmoTlj5jph48v5pWw5o2uXG4gICAgICAgIHZhciBlbnQgPSBGaXJlLkVudGl0eS5maW5kKCcvRGF0YUJhc2UnKTtcbiAgICAgICAgdGhpcy5kYXRhQmFzZSA9IGVudC5nZXRDb21wb25lbnQoJ0RhdGFCYXNlJyk7XG4gICAgICAgIC8vXG4gICAgICAgIHRoaXMuYnRuX1BheS5vbkNsaWNrID0gdGhpcy5fb25DaGVja1BheS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmJ0bl9QYXlJc3N1ZXMub25DbGljayA9IHRoaXMuX29uUGF5SXNzdWVzLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuYnRuX0Nsb3NlLm9uQ2xpY2sgPSB0aGlzLl9vbkNsb3NlV2luZG93LmJpbmQodGhpcyk7XG4gICAgfVxufSk7XG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJ2IzY2Q5Qi8rRDFIUG9GZXV1Z2VrQW50JywgJ1RpcHNQYXlQcm9ibGVtcycpO1xuLy8gc2NyaXB0XFx2aWxsYVxcVGlwc1BheVByb2JsZW1zLmpzXG5cbnZhciBUaXBzUGF5UHJvYmxlbXMgPSBGaXJlLkNsYXNzKHtcbiAgICAvLyDnu6fmib9cbiAgICBleHRlbmRzOiBGaXJlLkNvbXBvbmVudCxcbiAgICAvLyDmnoTpgKDlh73mlbBcbiAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24gKCkge1xuXG4gICAgfSxcbiAgICAvLyDlsZ7mgKdcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIGJ0bl9vazoge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVUlCdXR0b25cbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICBfb25PS0V2ZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuY2xvc2VUaXBzKCk7XG4gICAgfSxcblxuICAgIGNsb3NlVGlwczogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcbiAgICB9LFxuXG4gICAgb3BlblRpcHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5lbnRpdHkuYWN0aXZlID0gdHJ1ZTtcbiAgICB9LFxuICAgIC8vIOW8gOWni1xuICAgIHN0YXJ0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuYnRuX29rLm9uQ2xpY2sgPSB0aGlzLl9vbk9LRXZlbnQuYmluZCh0aGlzKTtcbiAgICB9XG59KTtcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnZjkyYzNEVzNaWkZZb05LYzdsVllIYzgnLCAnVGlwc1dpbmRvdycpO1xuLy8gc2NyaXB0XFx2aWxsYVxcVGlwc1dpbmRvdy5qc1xuXG52YXIgVGlwc1dpbmRvdyA9IEZpcmUuQ2xhc3Moe1xyXG4gICAgZXh0ZW5kczogRmlyZS5Db21wb25lbnQsXHJcblxyXG4gICAgcHJvcGVydGllczoge1xyXG4gICAgICAgIGNvbnRlbnQ6IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5CaXRtYXBUZXh0XHJcbiAgICAgICAgfSxcclxuICAgICAgICBidG5fRGV0ZXJtaW5lOiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVUlCdXR0b25cclxuICAgICAgICB9LFxyXG4gICAgICAgIGJ0bl9jbG9zZToge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlVJQnV0dG9uXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBfb25DbG9zZVdpbmRvdzogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuY2xvc2VUaXBzKCk7XHJcbiAgICB9LFxyXG5cclxuICAgIF9vbkRldGVybWluZUV2ZW50OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5jbG9zZVRpcHMoKTtcclxuICAgICAgICBpZiAodGhpcy5vbkNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIHRoaXMub25DYWxsYmFjaygpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgb3BlblRpcHNXaW5kb3c6IGZ1bmN0aW9uICh2YWx1ZSwgY2FsbGJhY2spIHtcclxuICAgICAgICB0aGlzLm9uQ2FsbGJhY2sgPSBudWxsO1xyXG4gICAgICAgIGlmICh0aGlzLmNvbnRlbnQgJiYgdmFsdWUpe1xyXG4gICAgICAgICAgICB0aGlzLmNvbnRlbnQudGV4dCA9IHZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgdGhpcy5vbkNhbGxiYWNrID0gY2FsbGJhY2s7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZW50aXR5LmFjdGl2ZSA9IHRydWU7XHJcbiAgICB9LFxyXG5cclxuICAgIGNsb3NlVGlwczogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuZW50aXR5LmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgfSxcclxuXHJcbiAgICBvbkxvYWQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLmJ0bl9jbG9zZS5vbkNsaWNrID0gdGhpcy5fb25DbG9zZVdpbmRvdy5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuYnRuX0RldGVybWluZS5vbkNsaWNrID0gdGhpcy5fb25EZXRlcm1pbmVFdmVudC5iaW5kKHRoaXMpO1xyXG4gICAgfVxyXG59KTtcclxuXG5GaXJlLl9SRnBvcCgpOyIsIkZpcmUuX1JGcHVzaChtb2R1bGUsICc4ZDAwNEE3L3RCUDk3MllmaUFwVVNXdScsICdUb2dnbGUnKTtcbi8vIHNjcmlwdFxcY29tbW9uXFxUb2dnbGUuanNcblxudmFyIFRvZ2dsZSA9RmlyZS5DbGFzcyh7XG4gICAgLy8g57un5om/XG4gICAgZXh0ZW5kczogRmlyZS5Db21wb25lbnQsXG4gICAgLy8g5p6E6YCg5Ye95pWwXG4gICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5oYXNDbGljayA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9vbkJ1dHRvbkRvd25FdmVudEJpbmQgPSB0aGlzLl9vbkJ1dHRvbkRvd25FdmVudC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLl9vbkJ1dHRvblVwRXZlbnRCaW5kID0gdGhpcy5fb25CdXR0b25VcEV2ZW50LmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuYnRuUmVuZGVyID0gbnVsbDtcbiAgICAgICAgdGhpcy5vbkNsaWNrID0gbnVsbDtcbiAgICB9LFxuICAgIC8vIOWxnuaAp1xuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgdGV4dENvbnRlbnQ6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlRleHRcbiAgICAgICAgfSxcbiAgICAgICAgbm9ybWFsUG9zOiBuZXcgRmlyZS5WZWMyKDAsIDApLFxuICAgICAgICBub3JtYWxDb2xvcjogRmlyZS5Db2xvci53aGl0ZSxcbiAgICAgICAgbm9ybWFsU3ByaXRlOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5TcHJpdGVcbiAgICAgICAgfSxcbiAgICAgICAgcHJlc3NlZFBvczogbmV3IEZpcmUuVmVjMigwLCAwKSxcbiAgICAgICAgcHJlc3NlZENvbG9yOiBGaXJlLkNvbG9yLndoaXRlLFxuICAgICAgICBwcmVzc2VkU3ByaXRlOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5TcHJpdGVcbiAgICAgICAgfSxcbiAgICAgICAgLy8g5oyJ6ZKu5riy5p+TXG4gICAgICAgIGJ0blJlbmRlcjoge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKCEgdGhpcy5fYnRuUmVuZGVyKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2J0blJlbmRlciA9IHRoaXMuZW50aXR5LmdldENvbXBvbmVudChGaXJlLlNwcml0ZVJlbmRlcmVyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2J0blJlbmRlcjtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB2aXNpYmxlOiBmYWxzZVxuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyDmjInkuItcbiAgICBfb25CdXR0b25Eb3duRXZlbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy9pZiAodGhpcy5wcmVzc2VkU3ByaXRlKSB7XG4gICAgICAgIC8vICAgIHRoaXMuYnRuUmVuZGVyLnNwcml0ZSA9IHRoaXMucHJlc3NlZFNwcml0ZTtcbiAgICAgICAgLy99XG4gICAgICAgIC8vaWYgKHRoaXMubm9ybWFsUG9zICE9PSBGaXJlLlZlYzIuemVybykge1xuICAgICAgICAvLyAgICB0aGlzLnNldFBvc3RpdGlvbih0aGlzLm5vcm1hbFBvcyk7XG4gICAgICAgIC8vfVxuICAgIH0sXG4gICAgLy8g5pS+5byAXG4gICAgX29uQnV0dG9uVXBFdmVudDogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIGlmICh0aGlzLmhhc0NsaWNrKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMub25DbGljaykge1xuICAgICAgICAgICAgdGhpcy5vbkNsaWNrKGV2ZW50KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5wcmVzc2VkU3ByaXRlKSB7XG4gICAgICAgICAgICB0aGlzLmJ0blJlbmRlci5zcHJpdGUgPSB0aGlzLnByZXNzZWRTcHJpdGU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMucHJlc3NlZENvbG9yICE9PSBGaXJlLkNvbG9yLndoaXRlKSB7XG4gICAgICAgICAgICB0aGlzLmJ0blJlbmRlci5jb2xvciA9IHRoaXMucHJlc3NlZENvbG9yO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnByZXNzZWRQb3MueCAhPT0gMCAmJiB0aGlzLnByZXNzZWRQb3MueSAhPT0gMCkge1xuICAgICAgICAgICAgdGhpcy5zZXRQb3N0aXRpb24odGhpcy5wcmVzc2VkUG9zKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmhhc0NsaWNrID0gdHJ1ZTtcbiAgICB9LFxuICAgIC8vXG4gICAgZGVmYXVsdFRvZ2dsZTogZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgIGlmICh0aGlzLnByZXNzZWRTcHJpdGUpIHtcbiAgICAgICAgICAgIHRoaXMuYnRuUmVuZGVyLnNwcml0ZSA9IHRoaXMucHJlc3NlZFNwcml0ZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmJ0blJlbmRlci5jb2xvciA9IHRoaXMucHJlc3NlZENvbG9yO1xuICAgICAgICBpZiAodGhpcy5wcmVzc2VkUG9zLnggIT09IDAgJiYgdGhpcy5wcmVzc2VkUG9zLnkgIT09IDApIHtcbiAgICAgICAgICAgIHRoaXMuc2V0UG9zdGl0aW9uKHRoaXMucHJlc3NlZFBvcyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICByZXNldENvbG9yOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuaGFzQ2xpY2sgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5idG5SZW5kZXIuY29sb3IgPSB0aGlzLm5vcm1hbENvbG9yO1xuICAgIH0sXG4gICAgLy9cbiAgICByZXNldFRvZ2dsZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmhhc0NsaWNrID0gZmFsc2U7XG4gICAgICAgIGlmICh0aGlzLm5vcm1hbFNwcml0ZSkge1xuICAgICAgICAgICAgdGhpcy5idG5SZW5kZXIuc3ByaXRlID0gdGhpcy5ub3JtYWxTcHJpdGU7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5idG5SZW5kZXIuY29sb3IgPSB0aGlzLm5vcm1hbENvbG9yO1xuICAgICAgICBpZiAodGhpcy5ub3JtYWxQb3MueCAhPT0gMCAmJiB0aGlzLm5vcm1hbFBvcy55ICE9PSAwKSB7XG4gICAgICAgICAgICB0aGlzLnNldFBvc3RpdGlvbih0aGlzLm5vcm1hbFBvcyk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIOiuvue9ruWdkOagh1xuICAgIHNldFBvc3RpdGlvbjogZnVuY3Rpb24gKHBvc1ZhbHVlKSB7XG4gICAgICAgIHRoaXMuZW50aXR5LnRyYW5zZm9ybS5wb3NpdGlvbiA9IHBvc1ZhbHVlO1xuICAgIH0sXG4gICAgLy8g6K6+572u5paH5a2XXG4gICAgc2V0VGV4dDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHRoaXMudGV4dENvbnRlbnQudGV4dCA9IHZhbHVlO1xuICAgIH0sXG4gICAgLy8g6L295YWl5pe2XG4gICAgb25Mb2FkOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuZW50aXR5Lm9uKCdtb3VzZWRvd24nLCB0aGlzLl9vbkJ1dHRvbkRvd25FdmVudEJpbmQpO1xuICAgICAgICB0aGlzLmVudGl0eS5vbignbW91c2V1cCcsIHRoaXMuX29uQnV0dG9uVXBFdmVudEJpbmQpO1xuICAgICAgICBpZiAodGhpcy5ub3JtYWxTcHJpdGUpIHtcbiAgICAgICAgICAgIHRoaXMuYnRuUmVuZGVyLnNwcml0ZSA9IHRoaXMubm9ybWFsU3ByaXRlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLm5vcm1hbENvbG9yICE9PSBGaXJlLkNvbG9yLndoaXRlKSB7XG4gICAgICAgICAgICB0aGlzLmJ0blJlbmRlci5jb2xvciA9IHRoaXMubm9ybWFsQ29sb3I7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMubm9ybWFsUG9zLnggIT09IDAgJiYgdGhpcy5ub3JtYWxQb3MueSAhPT0gMCkge1xuICAgICAgICAgICAgdGhpcy5zZXRQb3N0aXRpb24odGhpcy5ub3JtYWxQb3MpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyDplIDmr4Hml7ZcbiAgICBvbkRlc3Ryb3k6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5lbnRpdHkub2ZmKCdtb3VzZWRvd24nLCB0aGlzLl9vbkJ1dHRvbkRvd25FdmVudEJpbmQpO1xuICAgICAgICB0aGlzLmVudGl0eS5vZmYoJ21vdXNldXAnLCB0aGlzLl9vbkJ1dHRvblVwRXZlbnRCaW5kKTtcbiAgICB9XG59KTtcblxuRmlyZS5Ub2dnbGUgPSBUb2dnbGU7XG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJ2ExNjJkb1RlbnBLT2EwVFF0OE1weDRLJywgJ1Rvb2xzJyk7XG4vLyBzY3JpcHRcXGNvbW1vblxcVG9vbHMuanNcblxuZnVuY3Rpb24gSW1hZ2VMb2FkZXIodXJsLCBjYWxsYmFjaywgb25Qcm9ncmVzcykge1xyXG4gICAgdmFyIGltYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XHJcbiAgICAvL2ltYWdlLmNyb3NzT3JpZ2luID0gJ0Fub255bW91cyc7XHJcblxyXG4gICAgdmFyIG9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAoY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgdGhpcyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGltYWdlLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBvbmxvYWQpO1xyXG4gICAgICAgIGltYWdlLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgb25lcnJvcik7XHJcbiAgICAgICAgaW1hZ2UucmVtb3ZlRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBvblByb2dyZXNzKTtcclxuICAgIH07XHJcbiAgICB2YXIgb25lcnJvciA9IGZ1bmN0aW9uIChtc2csIGxpbmUsIHVybCkge1xyXG4gICAgICAgIGlmIChjYWxsYmFjaykge1xyXG4gICAgICAgICAgICB2YXIgZXJyb3IgPSAnRmFpbGVkIHRvIGxvYWQgaW1hZ2U6ICcgKyBtc2cgKyAnIFVybDogJyArIHVybDtcclxuICAgICAgICAgICAgY2FsbGJhY2soZXJyb3IsIG51bGwpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpbWFnZS5yZW1vdmVFdmVudExpc3RlbmVyKCdsb2FkJywgb25sb2FkKTtcclxuICAgICAgICBpbWFnZS5yZW1vdmVFdmVudExpc3RlbmVyKCdlcnJvcicsIG9uZXJyb3IpO1xyXG4gICAgICAgIGltYWdlLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgb25Qcm9ncmVzcyk7XHJcbiAgICB9O1xyXG5cclxuICAgIGltYWdlLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBvbmxvYWQpO1xyXG4gICAgaW1hZ2UuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBvbmVycm9yKTtcclxuICAgIGlmIChvblByb2dyZXNzKSB7XHJcbiAgICAgICAgaW1hZ2UuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBvblByb2dyZXNzKTtcclxuICAgIH1cclxuICAgIGltYWdlLnNyYyA9IHVybDtcclxuICAgIHJldHVybiBpbWFnZTtcclxufVxyXG5cclxuRmlyZS5JbWFnZUxvYWRlciA9IEltYWdlTG9hZGVyO1xuXG5GaXJlLl9SRnBvcCgpOyIsIkZpcmUuX1JGcHVzaChtb2R1bGUsICcxNmM1ZHFaUW0xTDByOWY3UXA1dnNlNScsICdVSUJ1dHRvbicpO1xuLy8gc2NyaXB0XFxjb21tb25cXFVJQnV0dG9uLmpzXG5cbnZhciBVSUJ1dHRvbiA9RmlyZS5DbGFzcyh7XHJcbiAgICAvLyDnu6fmib9cclxuICAgIGV4dGVuZHM6IEZpcmUuQ29tcG9uZW50LFxyXG4gICAgLy8g5p6E6YCg5Ye95pWwXHJcbiAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuX2J0blJlbmRlciA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fbm9ybWFsQ29sb3IgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX25vcm1hbFNwcml0ZSA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fb25CdXR0b25Eb3duRXZlbnRCaW5kID0gdGhpcy5fb25CdXR0b25Eb3duRXZlbnQuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLl9vbkJ1dHRvblVwRXZlbnRCaW5kID0gdGhpcy5fb25CdXR0b25VcEV2ZW50LmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5fb25CdXR0b25FbnRlckV2ZW50QmluZCA9IHRoaXMuX29uQnV0dG9uRW50ZXJFdmVudC5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuX29uQnV0dG9uTGVhdmVFdmVudEJpbmQgPSB0aGlzLl9vbkJ1dHRvbkxlYXZlRXZlbnQuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLm9uQ2xpY2sgPSBudWxsO1xyXG4gICAgICAgIHRoaXMub25Nb3VzZWRvd24gPSBudWxsO1xyXG4gICAgICAgIHRoaXMuaW1hZ2UgPSBudWxsO1xyXG4gICAgICAgIHRoaXMubWFyayA9IDA7XHJcbiAgICAgICAgdGhpcy5oYXNEaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgfSxcclxuICAgIC8vIOWxnuaAp1xyXG4gICAgcHJvcGVydGllczoge1xyXG4gICAgICAgIC8vIOaMiemSruaWh+Wtl1xyXG4gICAgICAgIHRleHRDb250ZW50OiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVGV4dFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy9cclxuICAgICAgICBob3ZlckNvbG9yOiBGaXJlLkNvbG9yLndoaXRlLFxyXG4gICAgICAgIGhvdmVyU3ByaXRlOiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuU3ByaXRlXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvL1xyXG4gICAgICAgIHByZXNzZWRDb2xvcjogRmlyZS5Db2xvci53aGl0ZSxcclxuICAgICAgICBwcmVzc2VkU3ByaXRlOiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuU3ByaXRlXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvL1xyXG4gICAgICAgIGRpc2FibGVkQ29sb3I6IG5ldyBGaXJlLkNvbG9yKDAuNSwgMC41LCAwLjUsIDEpLFxyXG4gICAgICAgIC8vIOaMiemSrua4suafk1xyXG4gICAgICAgIGJ0blJlbmRlcjoge1xyXG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIGlmICghIHRoaXMuX2J0blJlbmRlcikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2J0blJlbmRlciA9IHRoaXMuZW50aXR5LmdldENvbXBvbmVudChGaXJlLlNwcml0ZVJlbmRlcmVyKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9idG5SZW5kZXI7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHZpc2libGU6IGZhbHNlXHJcbiAgICAgICAgfVxyXG5cclxuICAgIH0sXHJcbiAgICAvLyDmjInkuItcclxuICAgIF9vbkJ1dHRvbkRvd25FdmVudDogZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgICAgaWYgKHRoaXMucHJlc3NlZFNwcml0ZSkge1xyXG4gICAgICAgICAgICB0aGlzLmJ0blJlbmRlci5zcHJpdGUgPSB0aGlzLnByZXNzZWRTcHJpdGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBwQ29sb3I7XHJcbiAgICAgICAgaWYgKCEgdGhpcy5oYXNEaXNhYmxlZCkge1xyXG4gICAgICAgICAgICBwQ29sb3IgPSB0aGlzLnByZXNzZWRDb2xvcjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHBDb2xvciA9IHRoaXMuZGlzYWJsZWRDb2xvcjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5idG5SZW5kZXIuY29sb3IgPSBwQ29sb3I7XHJcbiAgICAgICAgaWYgKHRoaXMub25Nb3VzZWRvd24pIHtcclxuICAgICAgICAgICAgdGhpcy5vbk1vdXNlZG93bihldmVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIOmHiuaUvlxyXG4gICAgX29uQnV0dG9uVXBFdmVudDogZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgICAgdmFyIG5Db2xvcjtcclxuICAgICAgICBpZiAoISB0aGlzLmhhc0Rpc2FibGVkKSB7XHJcbiAgICAgICAgICAgIG5Db2xvciA9IHRoaXMuX25vcm1hbENvbG9yO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgbkNvbG9yID0gdGhpcy5kaXNhYmxlZENvbG9yO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmJ0blJlbmRlci5jb2xvciA9IG5Db2xvcjtcclxuICAgICAgICB0aGlzLmJ0blJlbmRlci5zcHJpdGUgPSB0aGlzLl9ub3JtYWxTcHJpdGU7XHJcbiAgICAgICAgLy8g6Kem5Y+R5LqL5Lu2XHJcbiAgICAgICAgaWYgKHRoaXMub25DbGljaykge1xyXG4gICAgICAgICAgICB0aGlzLm9uQ2xpY2soZXZlbnQpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvLyDov5vlhaVcclxuICAgIF9vbkJ1dHRvbkVudGVyRXZlbnQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgaENvbG9yO1xyXG4gICAgICAgIGlmICghIHRoaXMuaGFzRGlzYWJsZWQpIHtcclxuICAgICAgICAgICAgaENvbG9yID0gdGhpcy5ob3ZlckNvbG9yO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgaENvbG9yID0gdGhpcy5kaXNhYmxlZENvbG9yO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmJ0blJlbmRlci5jb2xvciA9IGhDb2xvcjtcclxuICAgICAgICBpZiAodGhpcy5ob3ZlclNwcml0ZSkge1xyXG4gICAgICAgICAgICB0aGlzLmJ0blJlbmRlci5zcHJpdGUgPSB0aGlzLmhvdmVyU3ByaXRlO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvLyDnp7vlvIBcclxuICAgIF9vbkJ1dHRvbkxlYXZlRXZlbnQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgbkNvbG9yO1xyXG4gICAgICAgIGlmICghIHRoaXMuaGFzRGlzYWJsZWQpIHtcclxuICAgICAgICAgICAgbkNvbG9yID0gdGhpcy5fbm9ybWFsQ29sb3I7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBuQ29sb3IgPSB0aGlzLmRpc2FibGVkQ29sb3I7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuYnRuUmVuZGVyLmNvbG9yID0gbkNvbG9yO1xyXG4gICAgICAgIHRoaXMuYnRuUmVuZGVyLnNwcml0ZSA9IHRoaXMuX25vcm1hbFNwcml0ZTtcclxuICAgIH0sXHJcbiAgICAvLyDorr7nva7npoHnlKhcclxuICAgIHNldERpc2FibGVkOiBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgICAgICB0aGlzLmhhc0Rpc2FibGVkID0gdmFsdWU7XHJcbiAgICAgICAgdmFyIG5Db2xvcjtcclxuICAgICAgICBpZiAodmFsdWUpIHtcclxuICAgICAgICAgICAgbkNvbG9yID0gdGhpcy5kaXNhYmxlZENvbG9yO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKCEgdGhpcy5fbm9ybWFsQ29sb3IpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX25vcm1hbENvbG9yID0gdGhpcy5idG5SZW5kZXIuY29sb3I7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbkNvbG9yID0gdGhpcy5fbm9ybWFsQ29sb3IgfHwgRmlyZS5Db2xvci53aGl0ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5idG5SZW5kZXIuY29sb3IgPSBuQ29sb3I7XHJcbiAgICB9LFxyXG4gICAgLy8g6K6+572u5paH5a2XXHJcbiAgICBzZXRUZXh0OiBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgICAgICB0aGlzLnRleHRDb250ZW50LnRleHQgPSB2YWx1ZTtcclxuICAgIH0sXHJcbiAgICAvLyDorr7nva7mjInpkq7lnZDmoIdcclxuICAgIHNldFBvc3RpdGlvbjogZnVuY3Rpb24gKHBvc1ZhbHVlKSB7XHJcbiAgICAgICAgdGhpcy5lbnRpdHkudHJhbnNmb3JtLnBvc2l0aW9uID0gcG9zVmFsdWU7XHJcbiAgICB9LFxyXG4gICAgLy8g6K6+572u5Zu+54mH5aSn5bCPXHJcbiAgICBzZXRDdXN0b21TaXplOiBmdW5jdGlvbiAodywgaCkge1xyXG4gICAgICAgIGlmICh3ID09PSAtMSB8fCBoID09PSAtMSkge1xyXG4gICAgICAgICAgICB0aGlzLmJ0blJlbmRlci51c2VDdXN0b21TaXplID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5idG5SZW5kZXIudXNlQ3VzdG9tU2l6ZSA9IHRydWU7XHJcbiAgICAgICAgdGhpcy5idG5SZW5kZXIuY3VzdG9tV2lkdGggPSB3O1xyXG4gICAgICAgIHRoaXMuYnRuUmVuZGVyLmN1c3RvbUhlaWdodCA9IGg7XHJcbiAgICB9LFxyXG4gICAgLy8g6K6+572u5oyJ6ZKu57q555CGXHJcbiAgICBzZXRTcHJpdGU6IGZ1bmN0aW9uIChuZXdTcHJpdGUpIHtcclxuICAgICAgICB0aGlzLmJ0blJlbmRlci5zcHJpdGUgPSBuZXdTcHJpdGU7XHJcbiAgICAgICAgdGhpcy5fbm9ybWFsU3ByaXRlID0gbmV3U3ByaXRlO1xyXG4gICAgICAgIHRoaXMuaG92ZXJTcHJpdGUgPSBuZXdTcHJpdGU7XHJcbiAgICAgICAgdGhpcy5wcmVzc2VkU3ByaXRlID0gbmV3U3ByaXRlO1xyXG4gICAgfSxcclxuICAgIC8vIOiuvue9ruaMiemSrue6ueeQhlxyXG4gICAgc2V0SW1hZ2U6IGZ1bmN0aW9uIChpbWFnZSkge1xyXG4gICAgICAgIHRoaXMuaW1hZ2UgPSBpbWFnZTtcclxuICAgICAgICB2YXIgbmV3U3ByaXRlID0gbmV3IEZpcmUuU3ByaXRlKGltYWdlKTtcclxuICAgICAgICBuZXdTcHJpdGUucGl4ZWxMZXZlbEhpdFRlc3QgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuYnRuUmVuZGVyLnNwcml0ZSA9IG5ld1Nwcml0ZTtcclxuICAgICAgICB0aGlzLl9ub3JtYWxTcHJpdGUgPSBuZXdTcHJpdGU7XHJcbiAgICAgICAgdGhpcy5ob3ZlclNwcml0ZSA9IG5ld1Nwcml0ZTtcclxuICAgICAgICB0aGlzLnByZXNzZWRTcHJpdGUgPSBuZXdTcHJpdGU7XHJcbiAgICB9LFxyXG4gICAgLy8g6L295YWl5pe2XHJcbiAgICBvbkxvYWQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAoISB0aGlzLl9ub3JtYWxDb2xvcikge1xyXG4gICAgICAgICAgICB0aGlzLl9ub3JtYWxDb2xvciA9IHRoaXMuYnRuUmVuZGVyLmNvbG9yO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoISB0aGlzLl9ub3JtYWxTcHJpdGUpIHtcclxuICAgICAgICAgICAgdGhpcy5fbm9ybWFsU3ByaXRlID0gdGhpcy5idG5SZW5kZXIuc3ByaXRlO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvLyDlvIDlp4tcclxuICAgIHN0YXJ0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5lbnRpdHkub24oJ21vdXNlZG93bicsIHRoaXMuX29uQnV0dG9uRG93bkV2ZW50QmluZCk7XHJcbiAgICAgICAgdGhpcy5lbnRpdHkub24oJ21vdXNldXAnLCB0aGlzLl9vbkJ1dHRvblVwRXZlbnRCaW5kKTtcclxuICAgICAgICB0aGlzLmVudGl0eS5vbignbW91c2VlbnRlcicsIHRoaXMuX29uQnV0dG9uRW50ZXJFdmVudEJpbmQpO1xyXG4gICAgICAgIHRoaXMuZW50aXR5Lm9uKCdtb3VzZWxlYXZlJywgdGhpcy5fb25CdXR0b25MZWF2ZUV2ZW50QmluZCk7XHJcbiAgICB9LFxyXG4gICAgLy9cclxuICAgIG9uRW5hYmxlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIG5Db2xvcjtcclxuICAgICAgICBpZiAoISB0aGlzLmhhc0Rpc2FibGVkKSB7XHJcbiAgICAgICAgICAgIG5Db2xvciA9IHRoaXMuX25vcm1hbENvbG9yIHx8IEZpcmUuQ29sb3Iud2hpdGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBuQ29sb3IgPSB0aGlzLmRpc2FibGVkQ29sb3I7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuYnRuUmVuZGVyLmNvbG9yID0gbkNvbG9yO1xyXG4gICAgICAgIHRoaXMuYnRuUmVuZGVyLnNwcml0ZSA9IHRoaXMuX25vcm1hbFNwcml0ZTtcclxuICAgIH0sXHJcbiAgICAvLyDplIDmr4Hml7ZcclxuICAgIG9uRGVzdHJveTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuZW50aXR5Lm9mZignbW91c2Vkb3duJywgdGhpcy5fb25CdXR0b25Eb3duRXZlbnRCaW5kKTtcclxuICAgICAgICB0aGlzLmVudGl0eS5vZmYoJ21vdXNldXAnLCB0aGlzLl9vbkJ1dHRvblVwRXZlbnRCaW5kKTtcclxuICAgICAgICB0aGlzLmVudGl0eS5vZmYoJ21vdXNlZW50ZXInLCB0aGlzLl9vbkJ1dHRvbkVudGVyRXZlbnRCaW5kKTtcclxuICAgICAgICB0aGlzLmVudGl0eS5vZmYoJ21vdXNlbGVhdmUnLCB0aGlzLl9vbkJ1dHRvbkxlYXZlRXZlbnRCaW5kKTtcclxuICAgIH1cclxufSk7XHJcblxyXG5GaXJlLlVJQnV0dG9uID0gVUlCdXR0b247XHJcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnNmYzM2FCRFd3RkswWmZiQm5GeTV6VnUnLCAnVUlQb3B1cExpc3QnKTtcbi8vIHNjcmlwdFxcY29tbW9uXFxVSVBvcHVwTGlzdC5qc1xuXG52YXIgUm9vbVR5cGUgPSBGaXJlLmRlZmluZUVudW0oe1xyXG4gICAgbGl2aW5nUm9vbTogLTEsICAvL+WuouWOhVxyXG4gICAgYmVkUm9vbTogLTEsICAgICAvL+WNp+WupFxyXG4gICAga2l0Y2hlbjogLTEsICAgICAvL+WOqOaIv1xyXG4gICAgYmF0aHJvb206IC0xLCAgICAvL+a1tOWupFxyXG4gICAgc3R1ZHk6IC0xLCAgICAgICAvL+S5puaIv1xyXG4gICAgZ3ltOiAtMSwgICAgICAgICAvL+WBpei6q+aIv1xyXG4gICAgYmFsY29ueTogLTEsICAgICAvL+mYs+WPsFxyXG4gICAgZ2FyZGVuOiAtMSAgICAgICAvL+iKseWbrVxyXG59KTtcclxuXHJcbi8vIOS4i+aLieWIl+ihqFxyXG52YXIgVUlQb3B1cExpc3QgPSBGaXJlLkNsYXNzKHtcclxuICAgIC8vIOe7p+aJv1xyXG4gICAgZXh0ZW5kczogRmlyZS5Db21wb25lbnQsXHJcbiAgICAvLyDmnoTpgKDlh73mlbBcclxuICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5yb29tVHlwZUxpc3QgPSBbXTtcclxuICAgICAgICB0aGlzLmJpbmRTaG93TGlzdEV2ZW50ID0gdGhpcy5vblNob3dMaXN0RXZlbnQuYmluZCh0aGlzKTtcclxuICAgIH0sXHJcbiAgICAvL1xyXG4gICAgcHJvcGVydGllczoge1xyXG4gICAgICAgIC8vIOaIv+mXtOexu+Wei1xyXG4gICAgICAgIHJvb21UeXBlOiAtMSxcclxuICAgICAgICAvLyDngrnlh7vljLrln5/lvLnlh7rliJfooahcclxuICAgICAgICBidG5fcm9vbVR5cGU6IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5VSUJ1dHRvblxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g5LiL5ouJ5YiX6KGoXHJcbiAgICAgICAgZHJvZG93bkxpc3Q6IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5FbnRpdHlcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8g5pi+56S65LiL5ouJ5YiX6KGoXHJcbiAgICBvblNob3dMaXN0RXZlbnQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLmRyb2Rvd25MaXN0LmFjdGl2ZSA9ICF0aGlzLmRyb2Rvd25MaXN0LmFjdGl2ZTtcclxuICAgIH0sXHJcbiAgICAvLyDojrflj5bmiL/pl7TnsbvlnovmloflrZdcclxuICAgIF9nZXRSb29tVHlwZVRleHQ6IGZ1bmN0aW9uICh0eXBlKSB7XHJcbiAgICAgICAgdmFyIHN0ciA9ICfpgInmi6nnsbvlnosuLic7XHJcbiAgICAgICAgc3dpdGNoKHR5cGUpe1xyXG4gICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICBzdHIgPSAn5a6i5Y6FJztcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgICAgICBzdHIgPSAn5Y2n5a6kJztcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDM6XHJcbiAgICAgICAgICAgICAgICBzdHIgPSAn5Y6o5oi/JztcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDQ6XHJcbiAgICAgICAgICAgICAgICBzdHIgPSAn5rW05a6kJztcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDU6XHJcbiAgICAgICAgICAgICAgICBzdHIgPSAn5Lmm5oi/JztcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDY6XHJcbiAgICAgICAgICAgICAgICBzdHIgPSAn5YGl6Lqr5oi/JztcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDc6XHJcbiAgICAgICAgICAgICAgICBzdHIgPSAn6Ziz5Y+wJztcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDg6XHJcbiAgICAgICAgICAgICAgICBzdHIgPSAn6Iqx5ZutJztcclxuICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc3RyO1xyXG4gICAgfSxcclxuICAgIC8vIOmAieaLqeexu+Wei1xyXG4gICAgb25TZWxlY3RUeXBlRXZlbnQ6IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgIHRoaXMuZHJvZG93bkxpc3QuYWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5yb29tVHlwZSA9IHBhcnNlSW50KGV2ZW50LnRhcmdldC5uYW1lKTtcclxuICAgICAgICB0aGlzLmJ0bl9yb29tVHlwZS5zZXRUZXh0KHRoaXMuX2dldFJvb21UeXBlVGV4dCh0aGlzLnJvb21UeXBlKSk7XHJcbiAgICB9LFxyXG4gICAgLy8g6byg5qCH5oyJ5LiLXHJcbiAgICBvbk1vdXNlRG93bkV2ZW50OiBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICBpZiAodGhpcy5kcm9kb3duTGlzdC5hY3RpdmUgJiYgdGhpcy5yb29tVHlwZUxpc3QuaW5kZXhPZihldmVudC50YXJnZXQpID09PSAtMSkge1xyXG4gICAgICAgICAgICB0aGlzLmRyb2Rvd25MaXN0LmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvLyDliJ3lp4vljJbkuIvmi4nliJfooahcclxuICAgIF9pbmlpRHJvcERvd25MaXN0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5yb29tVHlwZUxpc3QgPSBbXTtcclxuICAgICAgICB2YXIgaW5kZXggPSAxO1xyXG4gICAgICAgIGZvciAodmFyIGkgaW4gUm9vbVR5cGUpIHtcclxuICAgICAgICAgICAgdmFyIGVudCA9IEZpcmUuaW5zdGFudGlhdGUodGhpcy5zZGF0YUJhc2UudGVtcFJvb21UeXBlKTtcclxuICAgICAgICAgICAgZW50LnBhcmVudCA9IHRoaXMuZHJvZG93bkxpc3Q7XHJcbiAgICAgICAgICAgIGVudC50cmFuc2Zvcm0ucG9zaXRpb24gPSBuZXcgRmlyZS5WZWMyKDAsIDE4MCAtICgoaW5kZXggLSAxKSAqIDUwKSk7XHJcbiAgICAgICAgICAgIGVudC5uYW1lID0gaW5kZXg7XHJcbiAgICAgICAgICAgIHZhciBidG4gPSBlbnQuZ2V0Q29tcG9uZW50KEZpcmUuVUlCdXR0b24pO1xyXG4gICAgICAgICAgICBidG4uc2V0VGV4dCh0aGlzLl9nZXRSb29tVHlwZVRleHQoaW5kZXgpKTtcclxuICAgICAgICAgICAgYnRuLm9uQ2xpY2sgPSB0aGlzLm9uU2VsZWN0VHlwZUV2ZW50LmJpbmQodGhpcyk7XHJcbiAgICAgICAgICAgIHRoaXMucm9vbVR5cGVMaXN0LnB1c2goZW50KTtcclxuICAgICAgICAgICAgaW5kZXgrKztcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8g5byA5aeLXHJcbiAgICBzdGFydDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIC8vIOW4uOeUqOeahOWPmOmHjy/mlbDmja5cclxuICAgICAgICB2YXIgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL1NEYXRhQmFzZScpO1xyXG4gICAgICAgIHRoaXMuc2RhdGFCYXNlID0gZW50LmdldENvbXBvbmVudCgnU0RhdGFCYXNlJyk7XHJcbiAgICAgICAgLy8g5omT5byA5LiL5ouJ6I+c5Y2VXHJcbiAgICAgICAgdGhpcy5idG5fcm9vbVR5cGUub25DbGljayA9IHRoaXMuYmluZFNob3dMaXN0RXZlbnQ7XHJcbiAgICAgICAgLy9cclxuICAgICAgICB0aGlzLl9pbmlpRHJvcERvd25MaXN0KCk7XHJcbiAgICAgICAgLy9cclxuICAgICAgICB0aGlzLmJpbmRlZE1vdXNlRG93bkV2ZW50ID0gdGhpcy5vbk1vdXNlRG93bkV2ZW50LmJpbmQodGhpcyk7XHJcbiAgICAgICAgRmlyZS5JbnB1dC5vbignbW91c2Vkb3duJywgdGhpcy5iaW5kZWRNb3VzZURvd25FdmVudCk7XHJcbiAgICB9LFxyXG4gICAgb25EZXN0cm95OiBmdW5jdGlvbigpIHtcclxuICAgICAgICBGaXJlLklucHV0Lm9mZignbW91c2Vkb3duJywgdGhpcy5iaW5kZWRNb3VzZURvd25FdmVudCk7XHJcbiAgICB9XHJcbn0pO1xyXG5GaXJlLlVJUG9wdXBMaXN0ID0gVUlQb3B1cExpc3Q7XHJcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnc3ByaXRlLWFuaW1hdGlvbi1jbGlwJyk7XG4vLyBzcHJpdGUtYW5pbWF0aW9uLWNsaXAuanNcblxuKGZ1bmN0aW9uICgpIHtcblxyXG4vKipcclxuICogQGNsYXNzIFNwcml0ZUFuaW1hdGlvbkNsaXBcclxuICovXHJcblxyXG4vKipcclxuICogQGVudW0gU3ByaXRlQW5pbWF0aW9uQ2xpcC5XcmFwTW9kZVxyXG4gKi9cclxudmFyIFdyYXBNb2RlID0gRmlyZS5kZWZpbmVFbnVtKHtcclxuICAgIC8qKlxyXG4gICAgICogQHByb3BlcnR5IERlZmF1bHRcclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIERlZmF1bHQ6IC0xLFxyXG4gICAgLyoqXHJcbiAgICAgKiBAcHJvcGVydHkgT25jZVxyXG4gICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgT25jZTogLTEsXHJcbiAgICAvKipcclxuICAgICAqIEBwcm9wZXJ0eSBMb29wXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBMb29wOiAtMSxcclxuICAgIC8qKlxyXG4gICAgICogQHByb3BlcnR5IFBpbmdQb25nXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBQaW5nUG9uZzogLTEsXHJcbiAgICAvKipcclxuICAgICAqIEBwcm9wZXJ0eSBDbGFtcEZvcmV2ZXJcclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIENsYW1wRm9yZXZlcjogLTFcclxufSk7XHJcblxyXG4vKipcclxuICogQGVudW0gU3ByaXRlQW5pbWF0aW9uQ2xpcC5TdG9wQWN0aW9uXHJcbiAqL1xyXG52YXIgU3RvcEFjdGlvbiA9IEZpcmUuZGVmaW5lRW51bSh7XHJcbiAgICAvKipcclxuICAgICAqIERvIG5vdGhpbmdcclxuICAgICAqIEBwcm9wZXJ0eSBEb05vdGhpbmdcclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIERvTm90aGluZzogLTEsXHJcbiAgICAvKipcclxuICAgICAqIFNldCB0byBkZWZhdWx0IHNwcml0ZSB3aGVuIHRoZSBzcHJpdGUgYW5pbWF0aW9uIHN0b3BwZWRcclxuICAgICAqIEBwcm9wZXJ0eSBEZWZhdWx0U3ByaXRlXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBEZWZhdWx0U3ByaXRlOiAxLFxyXG4gICAgLyoqXHJcbiAgICAgKiBIaWRlIHRoZSBzcHJpdGUgd2hlbiB0aGUgc3ByaXRlIGFuaW1hdGlvbiBzdG9wcGVkXHJcbiAgICAgKiBAcHJvcGVydHkgSGlkZVxyXG4gICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgSGlkZTogLTEsXHJcbiAgICAvKipcclxuICAgICAqIERlc3Ryb3kgdGhlIGVudGl0eSB0aGUgc3ByaXRlIGJlbG9uZ3MgdG8gd2hlbiB0aGUgc3ByaXRlIGFuaW1hdGlvbiBzdG9wcGVkXHJcbiAgICAgKiBAcHJvcGVydHkgRGVzdHJveVxyXG4gICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgRGVzdHJveTogLTFcclxufSk7XHJcblxyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuLy8vIFRoZSBzdHJ1Y3R1cmUgdG8gZGVzY3JpcCBhIGZyYW1lIGluIHRoZSBzcHJpdGUgYW5pbWF0aW9uIGNsaXBcclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbnZhciBGcmFtZUluZm8gPSBGaXJlLmRlZmluZSgnRnJhbWVJbmZvJylcclxuICAgIC5wcm9wKCdzcHJpdGUnLCBudWxsLCBGaXJlLk9iamVjdFR5cGUoRmlyZS5TcHJpdGUpKVxyXG4gICAgLnByb3AoJ2ZyYW1lcycsIDAsIEZpcmUuSW50ZWdlcl9PYnNvbGV0ZWQpO1xyXG5cclxuLyoqXHJcbiAqIFRoZSBzcHJpdGUgYW5pbWF0aW9uIGNsaXAuXHJcbiAqIEBjbGFzcyBTcHJpdGVBbmltYXRpb25DbGlwXHJcbiAqIEBleHRlbmRzIEN1c3RvbUFzc2V0XHJcbiAqIEBjb25zdHJ1Y3RvclxyXG4gKi9cclxudmFyIFNwcml0ZUFuaW1hdGlvbkNsaXAgPSBGaXJlLkNsYXNzKHtcclxuICAgIG5hbWU6ICdGaXJlLlNwcml0ZUFuaW1hdGlvbkNsaXAnLFxyXG4gICAgLy9cclxuICAgIGV4dGVuZHM6IEZpcmUuQ3VzdG9tQXNzZXQsXHJcbiAgICAvL1xyXG4gICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIC8vIHRoZSBhcnJheSBvZiB0aGUgZW5kIGZyYW1lIG9mIGVhY2ggZnJhbWUgaW5mb1xyXG4gICAgICAgIHRoaXMuX2ZyYW1lSW5mb0ZyYW1lcyA9IG51bGw7XHJcbiAgICB9LFxyXG4gICAgLy9cclxuICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBEZWZhdWx0IHdyYXAgbW9kZS5cclxuICAgICAgICAgKiBAcHJvcGVydHkgd3JhcE1vZGVcclxuICAgICAgICAgKiBAdHlwZSB7U3ByaXRlQW5pbWF0aW9uQ2xpcC5XcmFwTW9kZX1cclxuICAgICAgICAgKiBAZGVmYXVsdCBTcHJpdGVBbmltYXRpb25DbGlwLldyYXBNb2RlLkRlZmF1bHRcclxuICAgICAgICAgKi9cclxuICAgICAgICB3cmFwTW9kZToge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBXcmFwTW9kZS5EZWZhdWx0LFxyXG4gICAgICAgICAgICB0eXBlOiBXcmFwTW9kZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVGhlIGRlZmF1bHQgdHlwZSBvZiBhY3Rpb24gdXNlZCB3aGVuIHRoZSBhbmltYXRpb24gc3RvcHBlZC5cclxuICAgICAgICAgKiBAcHJvcGVydHkgc3RvcEFjdGlvblxyXG4gICAgICAgICAqIEB0eXBlIHtTcHJpdGVBbmltYXRpb25DbGlwLlN0b3BBY3Rpb259XHJcbiAgICAgICAgICogQGRlZmF1bHQgU3ByaXRlQW5pbWF0aW9uQ2xpcC5TdG9wQWN0aW9uLkRvTm90aGluZ1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHN0b3BBY3Rpb246IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogU3RvcEFjdGlvbi5Eb05vdGhpbmcsXHJcbiAgICAgICAgICAgIHR5cGU6IFN0b3BBY3Rpb25cclxuICAgICAgICB9LFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICogVGhlIGRlZmF1bHQgc3BlZWQgb2YgdGhlIGFuaW1hdGlvbiBjbGlwLlxyXG4gICAgICAgICogQHByb3BlcnR5IHNwZWVkXHJcbiAgICAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICAgICogQGRlZmF1bHQgMVxyXG4gICAgICAgICovXHJcbiAgICAgICAgc3BlZWQ6IDEsXHJcbiAgICAgICAgLy9cclxuICAgICAgICBfZnJhbWVSYXRlOiA2MCxcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBUaGUgc2FtcGxlIHJhdGUgdXNlZCBpbiB0aGlzIGFuaW1hdGlvbiBjbGlwLlxyXG4gICAgICAgICAqIEBwcm9wZXJ0eSBmcmFtZVJhdGVcclxuICAgICAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICAgICAqIEBkZWZhdWx0IDYwXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnJhbWVSYXRlOiB7XHJcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fZnJhbWVSYXRlO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHZhbHVlICE9PSB0aGlzLl9mcmFtZVJhdGUpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9mcmFtZVJhdGUgPSBNYXRoLnJvdW5kKE1hdGgubWF4KHZhbHVlLCAxKSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFRoZSBmcmFtZSBpbmZvcyBpbiB0aGUgc3ByaXRlIGFuaW1hdGlvbiBjbGlwcy5cclxuICAgICAgICAgKiBhcmUgYXJyYXkgb2Yge3Nwcml0ZTogU3ByaXRlLCBmcmFtZXM6IFN1c3RhaW5lZF9ob3dfbWFueV9mcmFtZXN9XHJcbiAgICAgICAgICogQHByb3BlcnR5IGZyYW1lSW5mb3NcclxuICAgICAgICAgKiBAdHlwZSB7b2JqZWN0W119XHJcbiAgICAgICAgICogQGRlZmF1bHQgW11cclxuICAgICAgICAgKi9cclxuICAgICAgICBmcmFtZUluZm9zOntcclxuICAgICAgICAgICAgZGVmYXVsdDogW10sXHJcbiAgICAgICAgICAgIHR5cGU6IEZyYW1lSW5mb1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvL1xyXG4gICAgZ2V0VG90YWxGcmFtZXM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBmcmFtZXMgPSAwO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5mcmFtZUluZm9zLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgIGZyYW1lcyArPSB0aGlzLmZyYW1lSW5mb3NbaV0uZnJhbWVzO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZnJhbWVzO1xyXG4gICAgfSxcclxuICAgIC8vXHJcbiAgICBnZXRGcmFtZUluZm9GcmFtZXM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9mcmFtZUluZm9GcmFtZXMgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgdGhpcy5fZnJhbWVJbmZvRnJhbWVzID0gbmV3IEFycmF5KHRoaXMuZnJhbWVJbmZvcy5sZW5ndGgpO1xyXG4gICAgICAgICAgICB2YXIgdG90YWxGcmFtZXMgPSAwO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZnJhbWVJbmZvcy5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICAgICAgdG90YWxGcmFtZXMgKz0gdGhpcy5mcmFtZUluZm9zW2ldLmZyYW1lcztcclxuICAgICAgICAgICAgICAgIHRoaXMuX2ZyYW1lSW5mb0ZyYW1lc1tpXSA9IHRvdGFsRnJhbWVzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0aGlzLl9mcmFtZUluZm9GcmFtZXM7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxuU3ByaXRlQW5pbWF0aW9uQ2xpcC5XcmFwTW9kZSA9IFdyYXBNb2RlO1xyXG5cclxuU3ByaXRlQW5pbWF0aW9uQ2xpcC5TdG9wQWN0aW9uID0gU3RvcEFjdGlvbjtcclxuXHJcbkZpcmUuYWRkQ3VzdG9tQXNzZXRNZW51KFNwcml0ZUFuaW1hdGlvbkNsaXAsIFwiTmV3IFNwcml0ZSBBbmltYXRpb25cIik7XHJcblxyXG5GaXJlLlNwcml0ZUFuaW1hdGlvbkNsaXAgPSBTcHJpdGVBbmltYXRpb25DbGlwO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTcHJpdGVBbmltYXRpb25DbGlwO1xyXG59KSgpO1xuXG5GaXJlLl9SRnBvcCgpOyIsIkZpcmUuX1JGcHVzaChtb2R1bGUsICdzcHJpdGUtYW5pbWF0aW9uLXN0YXRlJyk7XG4vLyBzcHJpdGUtYW5pbWF0aW9uLXN0YXRlLmpzXG5cbihmdW5jdGlvbiAoKSB7XG52YXIgU3ByaXRlQW5pbWF0aW9uQ2xpcCA9IHJlcXVpcmUoJ3Nwcml0ZS1hbmltYXRpb24tY2xpcCcpO1xyXG5cclxuLyoqXHJcbiAqIFRoZSBzcHJpdGUgYW5pbWF0aW9uIHN0YXRlLlxyXG4gKiBAY2xhc3MgU3ByaXRlQW5pbWF0aW9uU3RhdGVcclxuICogQGNvbnN0cnVjdG9yXHJcbiAqIEBwYXJhbSB7U3ByaXRlQW5pbWF0aW9uQ2xpcH0gYW5pbUNsaXBcclxuICovXHJcbnZhciBTcHJpdGVBbmltYXRpb25TdGF0ZSA9IGZ1bmN0aW9uIChhbmltQ2xpcCkge1xyXG4gICAgaWYgKCFhbmltQ2xpcCkge1xyXG4vLyBAaWYgREVWXHJcbiAgICAgICAgRmlyZS5lcnJvcignVW5zcGVjaWZpZWQgc3ByaXRlIGFuaW1hdGlvbiBjbGlwJyk7XHJcbi8vIEBlbmRpZlxyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIC8qKlxyXG4gICAgICogVGhlIG5hbWUgb2YgdGhlIHNwcml0ZSBhbmltYXRpb24gc3RhdGUuXHJcbiAgICAgKiBAcHJvcGVydHkgbmFtZVxyXG4gICAgICogQHR5cGUge3N0cmluZ31cclxuICAgICAqL1xyXG4gICAgdGhpcy5uYW1lID0gYW5pbUNsaXAubmFtZTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIHJlZmVyZW5jZWQgc3ByaXRlIGFuaW1hdGlvbiBjbGlwXHJcbiAgICAgKiBAcHJvcGVydHkgY2xpcFxyXG4gICAgICogQHR5cGUge1Nwcml0ZUFuaW1hdGlvbkNsaXB9XHJcbiAgICAgKi9cclxuICAgIHRoaXMuY2xpcCA9IGFuaW1DbGlwO1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgd3JhcCBtb2RlXHJcbiAgICAgKiBAcHJvcGVydHkgd3JhcE1vZGVcclxuICAgICAqIEB0eXBlIHtTcHJpdGVBbmltYXRpb25DbGlwLldyYXBNb2RlfVxyXG4gICAgICovXHJcbiAgICB0aGlzLndyYXBNb2RlID0gYW5pbUNsaXAud3JhcE1vZGU7XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBzdG9wIGFjdGlvblxyXG4gICAgICogQHByb3BlcnR5IHN0b3BBY3Rpb25cclxuICAgICAqIEB0eXBlIHtTcHJpdGVBbmltYXRpb25DbGlwLlN0b3BBY3Rpb259XHJcbiAgICAgKi9cclxuICAgIHRoaXMuc3RvcEFjdGlvbiA9IGFuaW1DbGlwLnN0b3BBY3Rpb247XHJcbiAgICAvKipcclxuICAgICAqIFRoZSBzcGVlZCB0byBwbGF5IHRoZSBzcHJpdGUgYW5pbWF0aW9uIGNsaXBcclxuICAgICAqIEBwcm9wZXJ0eSBzcGVlZFxyXG4gICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgdGhpcy5zcGVlZCA9IGFuaW1DbGlwLnNwZWVkO1xyXG4gICAgLy8gdGhlIGFycmF5IG9mIHRoZSBlbmQgZnJhbWUgb2YgZWFjaCBmcmFtZSBpbmZvIGluIHRoZSBzcHJpdGUgYW5pbWF0aW9uIGNsaXBcclxuICAgIHRoaXMuX2ZyYW1lSW5mb0ZyYW1lcyA9IGFuaW1DbGlwLmdldEZyYW1lSW5mb0ZyYW1lcygpO1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgdG90YWwgZnJhbWUgY291bnQgb2YgdGhlIHNwcml0ZSBhbmltYXRpb24gY2xpcFxyXG4gICAgICogQHByb3BlcnR5IHRvdGFsRnJhbWVzXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICB0aGlzLnRvdGFsRnJhbWVzID0gdGhpcy5fZnJhbWVJbmZvRnJhbWVzLmxlbmd0aCA+IDAgPyB0aGlzLl9mcmFtZUluZm9GcmFtZXNbdGhpcy5fZnJhbWVJbmZvRnJhbWVzLmxlbmd0aCAtIDFdIDogMDtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIGxlbmd0aCBvZiB0aGUgc3ByaXRlIGFuaW1hdGlvbiBpbiBzZWNvbmRzIHdpdGggc3BlZWQgPSAxLjBmXHJcbiAgICAgKiBAcHJvcGVydHkgbGVuZ3RoXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICB0aGlzLmxlbmd0aCA9IHRoaXMudG90YWxGcmFtZXMgLyBhbmltQ2xpcC5mcmFtZVJhdGU7XHJcbiAgICAvLyBUaGUgY3VycmVudCBpbmRleCBvZiBmcmFtZS4gVGhlIHZhbHVlIGNhbiBiZSBsYXJnZXIgdGhhbiB0b3RhbEZyYW1lcy5cclxuICAgIC8vIElmIHRoZSBmcmFtZSBpcyBsYXJnZXIgdGhhbiB0b3RhbEZyYW1lcyBpdCB3aWxsIGJlIHdyYXBwZWQgYWNjb3JkaW5nIHRvIHdyYXBNb2RlLlxyXG4gICAgdGhpcy5mcmFtZSA9IC0xO1xyXG4gICAgLy8gdGhlIGN1cnJlbnQgdGltZSBpbiBzZW9uY2RzXHJcbiAgICB0aGlzLnRpbWUgPSAwO1xyXG4gICAgLy8gY2FjaGUgcmVzdWx0IG9mIEdldEN1cnJlbnRJbmRleFxyXG4gICAgdGhpcy5fY2FjaGVkSW5kZXggPSAtMTtcclxufTtcclxuXHJcbi8qKlxyXG4gKiBSZWNvbXB1dGUgYSBuZXcgc3BlZWQgdG8gbWFrZSB0aGUgZHVyYXRpb24gb2YgdGhpcyBhbmltYXRpb24gZXF1YWxzIHRvIHNwZWNpZmllZCB2YWx1ZS5cclxuICogQG1ldGhvZCBzZXREdXJhdGlvblxyXG4gKiBAcGFyYW0ge251bWJlcn0gZHVyYXRpb24gLSBUaGUgZXhwZWN0ZWQgZHVyYXRpb24uXHJcbiAqL1xyXG5TcHJpdGVBbmltYXRpb25TdGF0ZS5wcm90b3R5cGUuc2V0RHVyYXRpb24gPSBmdW5jdGlvbiAoZHVyYXRpb24pIHtcclxuICAgIHRoaXMuc3BlZWQgPSBkdXJhdGlvbiAvIHRoaXMubGVuZ3RoO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFRoZSBjdXJyZW50IGZyYW1lIGluZm8gaW5kZXguXHJcbiAqIEBtZXRob2QgZ2V0Q3VycmVudEluZGV4XHJcbiAqIEByZXR1cm4ge251bWJlcn1cclxuICovXHJcblNwcml0ZUFuaW1hdGlvblN0YXRlLnByb3RvdHlwZS5nZXRDdXJyZW50SW5kZXggPSBmdW5jdGlvbiAoKSB7XHJcbiAgICBpZiAodGhpcy50b3RhbEZyYW1lcyA+IDEpIHtcclxuICAgICAgICAvL2ludCBvbGRGcmFtZSA9IGZyYW1lO1xyXG4gICAgICAgIHRoaXMuZnJhbWUgPSBNYXRoLmZsb29yKHRoaXMudGltZSAqIHRoaXMuY2xpcC5mcmFtZVJhdGUpO1xyXG4gICAgICAgIGlmICh0aGlzLmZyYW1lIDwgMCkge1xyXG4gICAgICAgICAgICB0aGlzLmZyYW1lID0gLXRoaXMuZnJhbWU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgd3JhcHBlZEluZGV4O1xyXG4gICAgICAgIGlmICh0aGlzLndyYXBNb2RlICE9PSBTcHJpdGVBbmltYXRpb25DbGlwLldyYXBNb2RlLlBpbmdQb25nKSB7XHJcbiAgICAgICAgICAgIHdyYXBwZWRJbmRleCA9IF93cmFwKHRoaXMuZnJhbWUsIHRoaXMudG90YWxGcmFtZXMgLSAxLCB0aGlzLndyYXBNb2RlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHdyYXBwZWRJbmRleCA9IHRoaXMuZnJhbWU7XHJcbiAgICAgICAgICAgIHZhciBjbnQgPSBNYXRoLmZsb29yKHdyYXBwZWRJbmRleCAvIHRoaXMudG90YWxGcmFtZXMpO1xyXG4gICAgICAgICAgICB3cmFwcGVkSW5kZXggJT0gdGhpcy50b3RhbEZyYW1lcztcclxuICAgICAgICAgICAgaWYgKChjbnQgJiAweDEpID09PSAxKSB7XHJcbiAgICAgICAgICAgICAgICB3cmFwcGVkSW5kZXggPSB0aGlzLnRvdGFsRnJhbWVzIC0gMSAtIHdyYXBwZWRJbmRleDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gdHJ5IHRvIHVzZSBjYWNoZWQgZnJhbWUgaW5mbyBpbmRleFxyXG4gICAgICAgIGlmICh0aGlzLl9jYWNoZWRJbmRleCAtIDEgPj0gMCAmJlxyXG4gICAgICAgICAgICB3cmFwcGVkSW5kZXggPj0gdGhpcy5fZnJhbWVJbmZvRnJhbWVzW3RoaXMuX2NhY2hlZEluZGV4IC0gMV0gJiZcclxuICAgICAgICAgICAgd3JhcHBlZEluZGV4IDwgdGhpcy5fZnJhbWVJbmZvRnJhbWVzW3RoaXMuX2NhY2hlZEluZGV4XSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY2FjaGVkSW5kZXg7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBzZWFyY2ggZnJhbWUgaW5mb1xyXG4gICAgICAgIHZhciBmcmFtZUluZm9JbmRleCA9IEZpcmUuYmluYXJ5U2VhcmNoKHRoaXMuX2ZyYW1lSW5mb0ZyYW1lcywgd3JhcHBlZEluZGV4ICsgMSk7XHJcbiAgICAgICAgaWYgKGZyYW1lSW5mb0luZGV4IDwgMCkge1xyXG4gICAgICAgICAgICBmcmFtZUluZm9JbmRleCA9IH5mcmFtZUluZm9JbmRleDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5fY2FjaGVkSW5kZXggPSBmcmFtZUluZm9JbmRleDtcclxuICAgICAgICByZXR1cm4gZnJhbWVJbmZvSW5kZXg7XHJcbiAgICB9XHJcbiAgICBlbHNlIGlmICh0aGlzLnRvdGFsRnJhbWVzID09PSAxKSB7XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9XHJcbiAgICBlbHNlIHtcclxuICAgICAgICByZXR1cm4gLTE7XHJcbiAgICB9XHJcbn07XHJcblxyXG5mdW5jdGlvbiBfd3JhcCAoX3ZhbHVlLCBfbWF4VmFsdWUsIF93cmFwTW9kZSkge1xyXG4gICAgaWYgKF9tYXhWYWx1ZSA9PT0gMCkge1xyXG4gICAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG4gICAgaWYgKF92YWx1ZSA8IDApIHtcclxuICAgICAgICBfdmFsdWUgPSAtX3ZhbHVlO1xyXG4gICAgfVxyXG4gICAgaWYgKF93cmFwTW9kZSA9PT0gU3ByaXRlQW5pbWF0aW9uQ2xpcC5XcmFwTW9kZS5Mb29wKSB7XHJcbiAgICAgICAgcmV0dXJuIF92YWx1ZSAlIChfbWF4VmFsdWUgKyAxKTtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKF93cmFwTW9kZSA9PT0gU3ByaXRlQW5pbWF0aW9uQ2xpcC5XcmFwTW9kZS5QaW5nUG9uZykge1xyXG4gICAgICAgIHZhciBjbnQgPSBNYXRoLmZsb29yKF92YWx1ZSAvIF9tYXhWYWx1ZSk7XHJcbiAgICAgICAgX3ZhbHVlICU9IF9tYXhWYWx1ZTtcclxuICAgICAgICBpZiAoY250ICUgMiA9PT0gMSkge1xyXG4gICAgICAgICAgICByZXR1cm4gX21heFZhbHVlIC0gX3ZhbHVlO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIGlmIChfdmFsdWUgPCAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoX3ZhbHVlID4gX21heFZhbHVlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBfbWF4VmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIF92YWx1ZTtcclxufVxyXG5cclxuRmlyZS5TcHJpdGVBbmltYXRpb25TdGF0ZSA9IFNwcml0ZUFuaW1hdGlvblN0YXRlO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBTcHJpdGVBbmltYXRpb25TdGF0ZTtcclxufSkoKTtcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnc3ByaXRlLWFuaW1hdGlvbicpO1xuLy8gc3ByaXRlLWFuaW1hdGlvbi5qc1xuXG4oZnVuY3Rpb24gKCkge1xudmFyIFNwcml0ZUFuaW1hdGlvbkNsaXAgPSByZXF1aXJlKCdzcHJpdGUtYW5pbWF0aW9uLWNsaXAnKTtcclxudmFyIFNwcml0ZUFuaW1hdGlvblN0YXRlID0gcmVxdWlyZSgnc3ByaXRlLWFuaW1hdGlvbi1zdGF0ZScpO1xyXG5cclxuLyoqXHJcbiAqIFRoZSBzcHJpdGUgYW5pbWF0aW9uIENvbXBvbmVudC5cclxuICogQGNsYXNzIFNwcml0ZUFuaW1hdGlvblxyXG4gKiBAZXh0ZW5kcyBDb21wb25lbnRcclxuICogQGNvbnN0cnVjdG9yXHJcbiAqL1xyXG52YXIgU3ByaXRlQW5pbWF0aW9uID0gRmlyZS5DbGFzcyh7XHJcbiAgICAvL1xyXG4gICAgbmFtZTogXCJGaXJlLlNwcml0ZUFuaW1hdGlvblwiLFxyXG4gICAgLy9cclxuICAgIGV4dGVuZHM6IEZpcmUuQ29tcG9uZW50LFxyXG4gICAgLy9cclxuICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLl9uYW1lVG9TdGF0ZSA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fY3VyQW5pbWF0aW9uID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9zcHJpdGVSZW5kZXJlciA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fZGVmYXVsdFNwcml0ZSA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fbGFzdEZyYW1lSW5kZXggPSAtMTtcclxuICAgICAgICB0aGlzLl9jdXJJbmRleCA9IC0xO1xyXG4gICAgICAgIHRoaXMuX3BsYXlTdGFydEZyYW1lID0gMDsvLyDlnKjosIPnlKhQbGF555qE5b2T5bin55qETGF0ZVVwZGF0ZeS4jei/m+ihjHN0ZXBcclxuICAgIH0sXHJcbiAgICAvL1xyXG4gICAgcHJvcGVydGllczp7XHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVGhlIGRlZmF1bHQgYW5pbWF0aW9uLlxyXG4gICAgICAgICAqIEBwcm9wZXJ0eSBkZWZhdWx0QW5pbWF0aW9uXHJcbiAgICAgICAgICogQHR5cGUge1Nwcml0ZUFuaW1hdGlvbkNsaXB9XHJcbiAgICAgICAgICogQGRlZmF1bHQgbnVsbFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGRlZmF1bHRBbmltYXRpb246IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5TcHJpdGVBbmltYXRpb25DbGlwXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBUaGUgQW5pbWF0ZWQgY2xpcCBsaXN0LlxyXG4gICAgICAgICAqIEBwcm9wZXJ0eSBhbmltYXRpb25zXHJcbiAgICAgICAgICogQHR5cGUge1Nwcml0ZUFuaW1hdGlvbkNsaXBbXX1cclxuICAgICAgICAgKiBAZGVmYXVsdCBbXVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGFuaW1hdGlvbnM6IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogW10sXHJcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuU3ByaXRlQW5pbWF0aW9uQ2xpcFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy9cclxuICAgICAgICBfcGxheUF1dG9tYXRpY2FsbHk6IHRydWUsXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogU2hvdWxkIHRoZSBkZWZhdWx0IGFuaW1hdGlvbiBjbGlwIChBbmltYXRpb24uY2xpcCkgYXV0b21hdGljYWxseSBzdGFydCBwbGF5aW5nIG9uIHN0YXJ0dXAuXHJcbiAgICAgICAgICogQHByb3BlcnR5IHBsYXlBdXRvbWF0aWNhbGx5XHJcbiAgICAgICAgICogQHR5cGUge2Jvb2xlYW59XHJcbiAgICAgICAgICogQGRlZmF1bHQgdHJ1ZVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHBsYXlBdXRvbWF0aWNhbGx5OiB7XHJcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fcGxheUF1dG9tYXRpY2FsbHk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9wbGF5QXV0b21hdGljYWxseSA9IHZhbHVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vXHJcbiAgICBfaW5pdDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGluaXRpYWxpemVkID0gKHRoaXMuX25hbWVUb1N0YXRlICE9PSBudWxsKTtcclxuICAgICAgICBpZiAoaW5pdGlhbGl6ZWQgPT09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3Nwcml0ZVJlbmRlcmVyID0gdGhpcy5lbnRpdHkuZ2V0Q29tcG9uZW50KEZpcmUuU3ByaXRlUmVuZGVyZXIpO1xyXG4gICAgICAgICAgICBpZiAoISB0aGlzLl9zcHJpdGVSZW5kZXJlcikge1xyXG4gICAgICAgICAgICAgICAgRmlyZS5lcnJvcihcIkNhbiBub3QgcGxheSBzcHJpdGUgYW5pbWF0aW9uIGJlY2F1c2UgU3ByaXRlUmVuZGVyZXIgaXMgbm90IGZvdW5kXCIpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2V7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9kZWZhdWx0U3ByaXRlID0gdGhpcy5fc3ByaXRlUmVuZGVyZXIuc3ByaXRlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLl9uYW1lVG9TdGF0ZSA9IHt9O1xyXG4gICAgICAgICAgICB2YXIgc3RhdGUgPSBudWxsO1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuYW5pbWF0aW9ucy5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGNsaXAgPSB0aGlzLmFuaW1hdGlvbnNbaV07XHJcbiAgICAgICAgICAgICAgICBpZiAoY2xpcCAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0YXRlID0gbmV3IFNwcml0ZUFuaW1hdGlvblN0YXRlKGNsaXApO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX25hbWVUb1N0YXRlW3N0YXRlLm5hbWVdID0gc3RhdGU7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRlZmF1bHRBbmltYXRpb24gJiYgIXRoaXMuZ2V0QW5pbVN0YXRlKHRoaXMuZGVmYXVsdEFuaW1hdGlvbi5uYW1lKSkge1xyXG4gICAgICAgICAgICAgICAgc3RhdGUgPSBuZXcgU3ByaXRlQW5pbWF0aW9uU3RhdGUodGhpcy5kZWZhdWx0QW5pbWF0aW9uKTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX25hbWVUb1N0YXRlW3N0YXRlLm5hbWVdID0gc3RhdGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogR2V0IEFuaW1hdGlvbiBTdGF0ZS5cclxuICAgICAqIEBtZXRob2QgZ2V0QW5pbVN0YXRlXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gYW5pbU5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgYW5pbWF0aW9uXHJcbiAgICAgKiBAcmV0dXJuIHtTcHJpdGVBbmltYXRpb25TdGF0ZX1cclxuICAgICAqL1xyXG4gICAgZ2V0QW5pbVN0YXRlOiBmdW5jdGlvbiAobmFtZSkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLl9uYW1lVG9TdGF0ZSAmJiB0aGlzLl9uYW1lVG9TdGF0ZVtuYW1lXTtcclxuICAgIH0sXHJcbiAgICAvKipcclxuICAgICAqIEluZGljYXRlcyB3aGV0aGVyIHRoZSBhbmltYXRpb24gaXMgcGxheWluZ1xyXG4gICAgICogQG1ldGhvZCBpc1BsYXlpbmdcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBbbmFtZV0gLSBUaGUgbmFtZSBvZiB0aGUgYW5pbWF0aW9uXHJcbiAgICAgKiBAcmV0dXJuIHtib29sZWFufVxyXG4gICAgICovXHJcbiAgICBpc1BsYXlpbmc6IGZ1bmN0aW9uKG5hbWUpIHtcclxuICAgICAgICB2YXIgcGxheWluZ0FuaW0gPSB0aGlzLmVuYWJsZWQgJiYgdGhpcy5fY3VyQW5pbWF0aW9uO1xyXG4gICAgICAgIHJldHVybiAhIXBsYXlpbmdBbmltICYmICggIW5hbWUgfHwgcGxheWluZ0FuaW0ubmFtZSA9PT0gbmFtZSApO1xyXG4gICAgfSxcclxuICAgIC8qKlxyXG4gICAgICogUGxheSBBbmltYXRpb25cclxuICAgICAqIEBtZXRob2QgcGxheVxyXG4gICAgICogQHBhcmFtIHtTcHJpdGVBbmltYXRpb25TdGF0ZX0gW2FuaW1TdGF0ZV0gLSBUaGUgYW5pbVN0YXRlIG9mIHRoZSBzcHJpdGUgQW5pbWF0aW9uIHN0YXRlIG9yIGFuaW1hdGlvbiBuYW1lXHJcbiAgICAgKiBAcGFyYW0ge251bWJlcn0gW3RpbWVdIC0gVGhlIHRpbWUgb2YgdGhlIGFuaW1hdGlvbiB0aW1lXHJcbiAgICAgKi9cclxuICAgIHBsYXk6IGZ1bmN0aW9uIChhbmltU3RhdGUsIHRpbWUpIHtcclxuICAgICAgICBpZiAodHlwZW9mIGFuaW1TdGF0ZSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgdGhpcy5fY3VyQW5pbWF0aW9uID0gdGhpcy5nZXRBbmltU3RhdGUoYW5pbVN0YXRlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2N1ckFuaW1hdGlvbiA9IGFuaW1TdGF0ZSB8fCBuZXcgU3ByaXRlQW5pbWF0aW9uU3RhdGUodGhpcy5kZWZhdWx0QW5pbWF0aW9uKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLl9jdXJBbmltYXRpb24gIT09IG51bGwpIHtcclxuICAgICAgICAgICAgdGhpcy5fY3VySW5kZXggPSAtMTtcclxuICAgICAgICAgICAgdGhpcy5fY3VyQW5pbWF0aW9uLnRpbWUgPSB0aW1lIHx8IDA7XHJcbiAgICAgICAgICAgIHRoaXMuX3BsYXlTdGFydEZyYW1lID0gRmlyZS5UaW1lLmZyYW1lQ291bnQ7XHJcbiAgICAgICAgICAgIHRoaXMuX3NhbXBsZSgpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvKipcclxuICAgICAqIFN0b3AgQW5pbWF0aW9uXHJcbiAgICAgKiBAbWV0aG9kIHN0b3BcclxuICAgICAqIEBwYXJhbSB7U3ByaXRlQW5pbWF0aW9uU3RhdGV9IFthbmltU3RhdGVdIC0gVGhlIGFuaW1TdGF0ZSBvZiB0aGUgc3ByaXRlIGFuaW1hdGlvbiBzdGF0ZSBvciBhbmltYXRpb24gbmFtZVxyXG4gICAgICovXHJcbiAgICBzdG9wOiBmdW5jdGlvbiAoYW5pbVN0YXRlKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBhbmltU3RhdGUgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2N1ckFuaW1hdGlvbiA9IHRoaXMuZ2V0QW5pbVN0YXRlKGFuaW1TdGF0ZSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl9jdXJBbmltYXRpb24gPSBhbmltU3RhdGUgfHwgbmV3IFNwcml0ZUFuaW1hdGlvblN0YXRlKHRoaXMuZGVmYXVsdEFuaW1hdGlvbik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodGhpcy5fY3VyQW5pbWF0aW9uICE9PSBudWxsKSB7XHJcblxyXG4gICAgICAgICAgICB0aGlzLl9jdXJBbmltYXRpb24udGltZSA9IDA7XHJcblxyXG4gICAgICAgICAgICB2YXIgc3RvcEFjdGlvbiA9IHRoaXMuX2N1ckFuaW1hdGlvbi5zdG9wQWN0aW9uO1xyXG5cclxuICAgICAgICAgICAgc3dpdGNoIChzdG9wQWN0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIFNwcml0ZUFuaW1hdGlvbkNsaXAuU3RvcEFjdGlvbi5Eb05vdGhpbmc6XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIFNwcml0ZUFuaW1hdGlvbkNsaXAuU3RvcEFjdGlvbi5EZWZhdWx0U3ByaXRlOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3Nwcml0ZVJlbmRlcmVyLnNwcml0ZSA9IHRoaXMuX2RlZmF1bHRTcHJpdGU7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIFNwcml0ZUFuaW1hdGlvbkNsaXAuU3RvcEFjdGlvbi5IaWRlOlxyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3Nwcml0ZVJlbmRlcmVyLmVuYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgU3ByaXRlQW5pbWF0aW9uQ2xpcC5TdG9wQWN0aW9uLkRlc3Ryb3k6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbnRpdHkuZGVzdHJveSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdGhpcy5fY3VyQW5pbWF0aW9uID0gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgb25Mb2FkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB0aGlzLl9pbml0KCk7XHJcbiAgICAgICAgaWYgKHRoaXMuZW5hYmxlZCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fcGxheUF1dG9tYXRpY2FsbHkgJiYgdGhpcy5kZWZhdWx0QW5pbWF0aW9uKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgYW5pbVN0YXRlID0gdGhpcy5nZXRBbmltU3RhdGUodGhpcy5kZWZhdWx0QW5pbWF0aW9uLm5hbWUpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5wbGF5KGFuaW1TdGF0ZSwgMCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgbGF0ZVVwZGF0ZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2N1ckFuaW1hdGlvbiAhPT0gbnVsbCAmJiBGaXJlLlRpbWUuZnJhbWVDb3VudCA+IHRoaXMuX3BsYXlTdGFydEZyYW1lKSB7XHJcbiAgICAgICAgICAgIHZhciBkZWx0YSA9IEZpcmUuVGltZS5kZWx0YVRpbWUgKiB0aGlzLl9jdXJBbmltYXRpb24uc3BlZWQ7XHJcbiAgICAgICAgICAgIHRoaXMuX3N0ZXAoZGVsdGEpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBfc3RlcDogZnVuY3Rpb24gKGRlbHRhVGltZSkge1xyXG4gICAgICAgIGlmICh0aGlzLl9jdXJBbmltYXRpb24gIT09IG51bGwpIHtcclxuICAgICAgICAgICAgdGhpcy5fY3VyQW5pbWF0aW9uLnRpbWUgKz0gZGVsdGFUaW1lO1xyXG4gICAgICAgICAgICB0aGlzLl9zYW1wbGUoKTtcclxuICAgICAgICAgICAgdmFyIHN0b3AgPSBmYWxzZTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuX2N1ckFuaW1hdGlvbi53cmFwTW9kZSA9PT0gU3ByaXRlQW5pbWF0aW9uQ2xpcC5XcmFwTW9kZS5PbmNlIHx8XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9jdXJBbmltYXRpb24ud3JhcE1vZGUgPT09IFNwcml0ZUFuaW1hdGlvbkNsaXAuV3JhcE1vZGUuRGVmYXVsdCB8fFxyXG4gICAgICAgICAgICAgICAgdGhpcy5fY3VyQW5pbWF0aW9uLndyYXBNb2RlID09PSBTcHJpdGVBbmltYXRpb25DbGlwLldyYXBNb2RlLkNsYW1wRm9yZXZlcikge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX2N1ckFuaW1hdGlvbi5zcGVlZCA+IDAgJiYgdGhpcy5fY3VyQW5pbWF0aW9uLmZyYW1lID49IHRoaXMuX2N1ckFuaW1hdGlvbi50b3RhbEZyYW1lcykge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9jdXJBbmltYXRpb24ud3JhcE1vZGUgPT09IFNwcml0ZUFuaW1hdGlvbkNsaXAuV3JhcE1vZGUuQ2xhbXBGb3JldmVyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0b3AgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fY3VyQW5pbWF0aW9uLmZyYW1lID0gdGhpcy5fY3VyQW5pbWF0aW9uLnRvdGFsRnJhbWVzO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9jdXJBbmltYXRpb24udGltZSA9IHRoaXMuX2N1ckFuaW1hdGlvbi5mcmFtZSAvIHRoaXMuX2N1ckFuaW1hdGlvbi5jbGlwLmZyYW1lUmF0ZTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0b3AgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9jdXJBbmltYXRpb24uZnJhbWUgPSB0aGlzLl9jdXJBbmltYXRpb24udG90YWxGcmFtZXM7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZWxzZSBpZiAodGhpcy5fY3VyQW5pbWF0aW9uLnNwZWVkIDwgMCAmJiB0aGlzLl9jdXJBbmltYXRpb24uZnJhbWUgPCAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX2N1ckFuaW1hdGlvbi53cmFwTW9kZSA9PT0gU3ByaXRlQW5pbWF0aW9uQ2xpcC5XcmFwTW9kZS5DbGFtcEZvcmV2ZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RvcCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9jdXJBbmltYXRpb24udGltZSA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2N1ckFuaW1hdGlvbi5mcmFtZSA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdG9wID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fY3VyQW5pbWF0aW9uLmZyYW1lID0gMDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIGRvIHN0b3BcclxuICAgICAgICAgICAgaWYgKHN0b3ApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuc3RvcCh0aGlzLl9jdXJBbmltYXRpb24pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl9jdXJJbmRleCA9IC0xO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBfc2FtcGxlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2N1ckFuaW1hdGlvbiAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICB2YXIgbmV3SW5kZXggPSB0aGlzLl9jdXJBbmltYXRpb24uZ2V0Q3VycmVudEluZGV4KCk7XHJcbiAgICAgICAgICAgIGlmIChuZXdJbmRleCA+PSAwICYmIG5ld0luZGV4ICE9PSB0aGlzLl9jdXJJbmRleCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fc3ByaXRlUmVuZGVyZXIuc3ByaXRlID0gdGhpcy5fY3VyQW5pbWF0aW9uLmNsaXAuZnJhbWVJbmZvc1tuZXdJbmRleF0uc3ByaXRlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX2N1ckluZGV4ID0gbmV3SW5kZXg7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLl9jdXJJbmRleCA9IC0xO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSk7XHJcblxyXG5GaXJlLlNwcml0ZUFuaW1hdGlvbiA9IFNwcml0ZUFuaW1hdGlvbjtcclxuXHJcbkZpcmUuYWRkQ29tcG9uZW50TWVudShTcHJpdGVBbmltYXRpb24sICdTcHJpdGUgQW5pbWF0aW9uJyk7XHJcbn0pKCk7XG5cbkZpcmUuX1JGcG9wKCk7Il19
