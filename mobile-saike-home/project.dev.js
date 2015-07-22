require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"ControlMgr":[function(require,module,exports){
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
        var sendData = {
            mark: '',
            house_uid: 0
        };
        var self = this;
        self.loadTips.openTips('初始化场景，请稍后...');
        self.intoRoom(sendData, function () {
            // 这里因为是为了保持默认的背景跟地板的图片
            self.saveDefaultData();
            self.loadTips.closeTips();
        });
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
        //this.bgRender = ent.getComponent(Fire.SpriteRenderer);
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
            type: Fire.Button
        },
        // 解除关系
        btn_del: {
            default: null,
            type: Fire.Button
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
    // 打开窗口打开窗口
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
    },
    // 房屋扮靓
    _onHouseDressEvent: function () {
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
                btn.onClick = self._onHouseDressEvent.bind(self);
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

var Comp = Fire.Class({
    extends: Fire.Component,

    properties: {
        background: {
            default: null,
            type: Fire.SpriteRenderer
        },
        btn_GoToSingle: {
            default: null,
            type: Fire.UIButton
        },
        btn_GoToVilla: {
            default: null,
            type: Fire.UIButton
        }
    },

    // use this for initialization
    start: function () {
        Fire.Engine.preloadScene('single');
        Fire.Engine.preloadScene('villa');

        //this.btn_GoToSingle.onClick = this.onGoToSingleEvent.bind(this);
        //this.btn_GoToVilla.onClick = this.onGoToVillaEvent.bind(this);

        var documentElement = document.documentElement;
        var width = documentElement.clientWidth;
        var height = documentElement.clientHeight;

        this.background.customWidth = width * (Fire.Camera.main.size / height);
        this.background.customHeight = Fire.Camera.main.size;

        console.log(width);
        console.log(height);
    },

    onGoToSingleEvent: function () {
        Fire.Engine.loadScene('single');
    },
    onGoToVillaEvent: function () {
        Fire.Engine.loadScene('villa');
    },

    // called every frame
    update: function () {

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
        // 如何有缓存用缓存的
        if (this.initScreenData.length > 0) {
            for (var i = 0; i < this.initScreenData.length; ++i){
                var data = this.initScreenData[i];
                this.refreshScreen(data);
            }
            return;
        }
        // 没有再去下载
        var self = this;
        self.snetWorkMgr.RequestInitHome(function (serverData) {
            console.log(serverData);
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
                Fire.ImageLoader(newData.imageUrl, loadImageCallBack);
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
                console.log(data);
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
                Fire.ImageLoader(data.url, loadImageCallBack);
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
                            Fire.ImageLoader(menuData.samllImageUrl, loadImageCallBack);
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
                Fire.ImageLoader(data.prod_image_url, loadImageCallBack);
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
    },
    // 保存装扮事件
    _onSaveDressEvent: function () {
        this.sdataBase.scontrolMgr.reset();
        this.sdataBase.sthreeMenuMgr.closeMenu();
        this.sdataBase.ssaveRoomWindow.openWindow();
    },
    // 我的装扮事件
    _onMyDressEvent: function () {
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
        this.sdataBase.sloadingTips.openTips();
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
                if (self.sdataBase) {
                    self.sdataBase.sloadingTips.closeTips();
                }
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
        var ent = Fire.Entity.find('/DataBase');
        this.dataBase = ent.getComponent('Database');

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
        this.content.text = value;
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
    start: function () {
        this.entity.on('mousedown', this._onButtonDownEventBind);
        this.entity.on('mouseup', this._onButtonUpEventBind);

        if (!this.btnRender){
            this.btnRender = this.entity.getComponent(Fire.SpriteRenderer);
        }
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
},{"sprite-animation-clip":"sprite-animation-clip","sprite-animation-state":"sprite-animation-state"}]},{},["sprite-animation-clip","sprite-animation-state","sprite-animation","MainMenu","Options","Toggle","Tools","UIButton","UIPopupList","SControlMgr","Screenshot","SDataBase","SErrorPromptWindow","SFurniture","SLoadingTips","SMainMenuMgr","SMyDressUpData","SMyDressUpWindow","SNetworkMgr","SSaveRoomWindow","SSecondaryMenu","SSecondaryMenuMgr","SThreeMenu","SThreeMenuMgr","STipsWindow","ControlMgr","DataBase","FamilyInfo","FirstMenuMgr","FloorWindow","Furniture","MainMenuMgr","Merchandise","NetworkMgr","NewWorkWindow","OtherMenuMgr","PayMentWindow","PriceDescription","SecondMenu","SecondMenuMgr","SwitchRoomWindow","ThreeMenu","ThreeMenuMgr","TipLoad","TipsPayMent","TipsPayProblems","TipsWindow"])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2Rldi9iaW4vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInNjcmlwdC92aWxsYS9Db250cm9sTWdyLmpzIiwic2NyaXB0L3ZpbGxhL0RhdGFCYXNlLmpzIiwic2NyaXB0L3ZpbGxhL0ZhbWlseUluZm8uanMiLCJzY3JpcHQvdmlsbGEvRmlyc3RNZW51TWdyLmpzIiwic2NyaXB0L3ZpbGxhL0Zsb29yV2luZG93LmpzIiwic2NyaXB0L3ZpbGxhL0Z1cm5pdHVyZS5qcyIsInNjcmlwdC92aWxsYS9NYWluTWVudU1nci5qcyIsInNjcmlwdC9vdXRkb29yL01haW5NZW51LmpzIiwic2NyaXB0L3ZpbGxhL01lcmNoYW5kaXNlLmpzIiwic2NyaXB0L3ZpbGxhL05ldHdvcmtNZ3IuanMiLCJzY3JpcHQvdmlsbGEvTmV3V29ya1dpbmRvdy5qcyIsInNjcmlwdC9jb21tb24vT3B0aW9ucy5qcyIsInNjcmlwdC92aWxsYS9PdGhlck1lbnVNZ3IuanMiLCJzY3JpcHQvdmlsbGEvUGF5TWVudFdpbmRvdy5qcyIsInNjcmlwdC92aWxsYS9QcmljZURlc2NyaXB0aW9uLmpzIiwic2NyaXB0L3NpbmdsZS9TQ29udHJvbE1nci5qcyIsInNjcmlwdC9zaW5nbGUvU0RhdGFCYXNlLmpzIiwic2NyaXB0L3NpbmdsZS9TRXJyb3JQcm9tcHRXaW5kb3cuanMiLCJzY3JpcHQvc2luZ2xlL1NGdXJuaXR1cmUuanMiLCJzY3JpcHQvc2luZ2xlL1NMb2FkaW5nVGlwcy5qcyIsInNjcmlwdC9zaW5nbGUvU01haW5NZW51TWdyLmpzIiwic2NyaXB0L3NpbmdsZS9TTXlEcmVzc1VwRGF0YS5qcyIsInNjcmlwdC9zaW5nbGUvU015RHJlc3NVcFdpbmRvdy5qcyIsInNjcmlwdC9zaW5nbGUvU05ldHdvcmtNZ3IuanMiLCJzY3JpcHQvc2luZ2xlL1NTYXZlUm9vbVdpbmRvdy5qcyIsInNjcmlwdC9zaW5nbGUvU1NlY29uZGFyeU1lbnVNZ3IuanMiLCJzY3JpcHQvc2luZ2xlL1NTZWNvbmRhcnlNZW51LmpzIiwic2NyaXB0L3NpbmdsZS9TVGhyZWVNZW51TWdyLmpzIiwic2NyaXB0L3NpbmdsZS9TVGhyZWVNZW51LmpzIiwic2NyaXB0L3NpbmdsZS9TVGlwc1dpbmRvdy5qcyIsInNjcmlwdC9zaW5nbGUvU2NyZWVuc2hvdC5qcyIsInNjcmlwdC92aWxsYS9TZWNvbmRNZW51TWdyLmpzIiwic2NyaXB0L3ZpbGxhL1NlY29uZE1lbnUuanMiLCJzY3JpcHQvdmlsbGEvU3dpdGNoUm9vbVdpbmRvdy5qcyIsInNjcmlwdC92aWxsYS9UaHJlZU1lbnVNZ3IuanMiLCJzY3JpcHQvdmlsbGEvVGhyZWVNZW51LmpzIiwic2NyaXB0L3ZpbGxhL1RpcExvYWQuanMiLCJzY3JpcHQvdmlsbGEvVGlwc1BheU1lbnQuanMiLCJzY3JpcHQvdmlsbGEvVGlwc1BheVByb2JsZW1zLmpzIiwic2NyaXB0L3ZpbGxhL1RpcHNXaW5kb3cuanMiLCJzY3JpcHQvY29tbW9uL1RvZ2dsZS5qcyIsInNjcmlwdC9jb21tb24vVG9vbHMuanMiLCJzY3JpcHQvY29tbW9uL1VJQnV0dG9uLmpzIiwic2NyaXB0L2NvbW1vbi9VSVBvcHVwTGlzdC5qcyIsInNwcml0ZS1hbmltYXRpb24tY2xpcC5qcyIsInNwcml0ZS1hbmltYXRpb24tc3RhdGUuanMiLCJzcHJpdGUtYW5pbWF0aW9uLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMU1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM1VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDalhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25KQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9OQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoYUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDek1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25LQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnYWIyMGY5aXNhQk5UNGFMc2djYndFQVEnLCAnQ29udHJvbE1ncicpO1xuLy8gc2NyaXB0XFx2aWxsYVxcQ29udHJvbE1nci5qc1xuXG4vLyDnlKjmiLfovpPlhaXnrqHnkIbnsbtcbnZhciBDb250cm9sTWdyID0gRmlyZS5DbGFzcyh7XG4gICAgLy8g57un5om/XG4gICAgZXh0ZW5kczogRmlyZS5Db21wb25lbnQsXG4gICAgLy8g5p6E6YCg5Ye95pWwXG4gICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5iaW5kZWRNb3VzZURvd25FdmVudCA9IHRoaXMuX29uTW91c2VEb3duRXZlbnQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5iaW5kZWRNb3VzZU1vdmVFdmVudCA9IHRoaXMuX29uTW91c2VNb3ZlRXZlbnQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5iaW5kZWRNb3VzZVVwRXZlbnQgPSB0aGlzLl9vbk1vdXNlVXBFdmVudC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLl9iYWNrdXBTZWxlY3RUYXJnZXQgPSBudWxsO1xuICAgIH0sXG4gICAgLy8g5bGe5oCnXG4gICAgcHJvcGVydGllczoge1xuICAgICAgICBfc2VsZWN0VGFyZ2V0OiBudWxsLFxuICAgICAgICBfbGFzdFNlbGVjdFRhcmdldDogbnVsbCxcbiAgICAgICAgX3NlbGVjdFRhcmdldEluaXRQb3M6IEZpcmUuVmVjMi56ZXJvLFxuICAgICAgICBfbW91c2VEb3duUG9zOiBGaXJlLlZlYzIuemVybyxcbiAgICAgICAgX2hhc01vdmVUYXJnZXQ6IGZhbHNlXG4gICAgfSxcbiAgICAvLyDpvKDmoIfmjInkuIvkuovku7ZcbiAgICBfb25Nb3VzZURvd25FdmVudDogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIHZhciB0YXJnZXQgPSBldmVudC50YXJnZXQ7XG4gICAgICAgIGlmICghdGFyZ2V0ICkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciBlbnQgPSB0YXJnZXQucGFyZW50IHx8IHRhcmdldDtcbiAgICAgICAgdmFyIGZ1cm5pdHVyZSA9IGVudC5nZXRDb21wb25lbnQoJ0Z1cm5pdHVyZScpO1xuICAgICAgICAvLyDlpKfkuo4yIOivtOaYjuWPr+S7peaLluWKqFxuICAgICAgICBpZiAoZnVybml0dXJlICYmIGZ1cm5pdHVyZS5wcm9wc190eXBlID4gMikge1xuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIHRoaXMuX3NlbGVjdFRhcmdldCA9IGVudDtcbiAgICAgICAgICAgIHRoaXMuX2JhY2t1cFNlbGVjdFRhcmdldCA9IHRoaXMuX3NlbGVjdFRhcmdldDtcbiAgICAgICAgICAgIHRoaXMuX3NlbGVjdFRhcmdldEluaXRQb3MgPSBlbnQudHJhbnNmb3JtLnBvc2l0aW9uO1xuICAgICAgICAgICAgdmFyIHNjcmVlbmRQb3MgPSBuZXcgRmlyZS5WZWMyKGV2ZW50LnNjcmVlblgsIGV2ZW50LnNjcmVlblkpO1xuICAgICAgICAgICAgdGhpcy5fbW91c2VEb3duUG9zID0gRmlyZS5DYW1lcmEubWFpbi5zY3JlZW5Ub1dvcmxkKHNjcmVlbmRQb3MpO1xuICAgICAgICAgICAgdGhpcy5fc2VsZWN0VGFyZ2V0LnNldEFzTGFzdFNpYmxpbmcoKTtcbiAgICAgICAgICAgIHRoaXMuX2hhc01vdmVUYXJnZXQgPSB0cnVlO1xuICAgICAgICAgICAgLy8g5piv5ZCm5omT5byA5o6n5Yi26YCJ6aG577yM5aaC5p6c5piv55u45ZCM55qE5a+56LGh5bCx5LiN6ZyA6KaB6YeN5paw5omT5byAXG4gICAgICAgICAgICBpZiAodGhpcy5fc2VsZWN0VGFyZ2V0ICE9PSB0aGlzLl9sYXN0U2VsZWN0VGFyZ2V0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhQmFzZS5vcHRpb25zLm9wZW4odGhpcy5fc2VsZWN0VGFyZ2V0KTtcbiAgICAgICAgICAgICAgICB0aGlzLl9sYXN0U2VsZWN0VGFyZ2V0ID0gdGhpcy5fc2VsZWN0VGFyZ2V0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5kYXRhQmFzZS50aHJlZU1lbnVNZ3IuY2xvc2VNZW51KHRydWUpO1xuICAgICAgICAgICAgdGhpcy5kYXRhQmFzZS5zZWNvbmRNZW51TWdyLmNsb3NlTWVudSh0cnVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmRhdGFCYXNlLm9wdGlvbnMuaGFzT3BlbigpKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZGF0YUJhc2Uub3B0aW9ucy5oYXNUb3VjaCh0YXJnZXQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3NlbGVjdFRhcmdldCA9IHRoaXMuX2JhY2t1cFNlbGVjdFRhcmdldDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3NlbGVjdFRhcmdldCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0YUJhc2Uub3B0aW9ucy5oaWRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyDpvKDmoIfnp7vliqjkuovku7ZcbiAgICBfb25Nb3VzZU1vdmVFdmVudDogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIGlmICh0aGlzLl9zZWxlY3RUYXJnZXQgJiYgdGhpcy5faGFzTW92ZVRhcmdldCkge1xuICAgICAgICAgICAgdGhpcy5fbW92ZShldmVudCk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIOenu+WKqOWutuWFt1xuICAgIF9tb3ZlOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgdmFyIG1vdmVQb3MgPSBuZXcgRmlyZS5WZWMyKGV2ZW50LnNjcmVlblgsIGV2ZW50LnNjcmVlblkpO1xuICAgICAgICB2YXIgbW92ZVdvcmRQb3MgPSBGaXJlLkNhbWVyYS5tYWluLnNjcmVlblRvV29ybGQobW92ZVBvcyk7XG5cbiAgICAgICAgdmFyIG9mZnNldFdvcmRQb3MgPSBGaXJlLlZlYzIuemVybztcbiAgICAgICAgb2Zmc2V0V29yZFBvcy54ID0gdGhpcy5fbW91c2VEb3duUG9zLnggLSBtb3ZlV29yZFBvcy54O1xuICAgICAgICBvZmZzZXRXb3JkUG9zLnkgPSB0aGlzLl9tb3VzZURvd25Qb3MueSAtIG1vdmVXb3JkUG9zLnk7XG5cbiAgICAgICAgdGhpcy5fc2VsZWN0VGFyZ2V0LnRyYW5zZm9ybS54ID0gdGhpcy5fc2VsZWN0VGFyZ2V0SW5pdFBvcy54IC0gb2Zmc2V0V29yZFBvcy54O1xuICAgICAgICB0aGlzLl9zZWxlY3RUYXJnZXQudHJhbnNmb3JtLnkgPSB0aGlzLl9zZWxlY3RUYXJnZXRJbml0UG9zLnkgLSBvZmZzZXRXb3JkUG9zLnk7XG5cbiAgICAgICAgdGhpcy5kYXRhQmFzZS5vcHRpb25zLnNldFBvcyh0aGlzLl9zZWxlY3RUYXJnZXQudHJhbnNmb3JtLndvcmxkUG9zaXRpb24pO1xuICAgIH0sXG4gICAgLy8g6byg5qCH6YeK5pS+5LqL5Lu2XG4gICAgX29uTW91c2VVcEV2ZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuX2hhc01vdmVUYXJnZXQgPSBmYWxzZTtcbiAgICB9LFxuICAgIC8vIOmakOiXj+aOp+WItumAiemhuVxuICAgIF9vbkhpZGVFdmVudDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLl9zZWxlY3RUYXJnZXQgPSBudWxsO1xuICAgICAgICB0aGlzLl9iYWNrdXBTZWxlY3RUYXJnZXQgPSBudWxsO1xuICAgICAgICB0aGlzLl9sYXN0U2VsZWN0VGFyZ2V0ID0gbnVsbDtcbiAgICB9LFxuICAgIC8vIOWPjei9rOaWueWQkVxuICAgIF9vbk1pcnJvckZsaXBFdmVudDogZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5fc2VsZWN0VGFyZ2V0KSB7XG4gICAgICAgICAgICB2YXIgc2NhbGVYID0gdGhpcy5fc2VsZWN0VGFyZ2V0LnRyYW5zZm9ybS5zY2FsZVg7XG4gICAgICAgICAgICB0aGlzLl9zZWxlY3RUYXJnZXQudHJhbnNmb3JtLnNjYWxlWCA9IHNjYWxlWCA+IDEgPyAtc2NhbGVYIDogTWF0aC5hYnMoc2NhbGVYKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy8g5Yig6Zmk6YCJ5oup5a+56LGhXG4gICAgX29uRGVsZXRlVGFyZ2V0RXZlbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGZ1cm5pdHVyZSA9IHRoaXMuX3NlbGVjdFRhcmdldC5nZXRDb21wb25lbnQoJ0Z1cm5pdHVyZScpO1xuICAgICAgICBpZiAoZnVybml0dXJlLnN1aXRfaWQgPiAwKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5kYXRhQmFzZS5jdXJEcmVzc1N1aXQucHJpY2UgPiAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhQmFzZS5vcHRpb25zLmhpZGUoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFCYXNlLnRpcHNXaW5kb3cub3BlblRpcHNXaW5kb3coJ+WvueS4jei1t++8jOatpOeJqeWTgeS4uuWll+ijheS4reeahOeJqeWTge+8jFxcbiDkuI3lj6/np7vpmaTvvIzor7fmlbTlpZfotK3kubAnKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YXIgaW5kZXggPSB0aGlzLmRhdGFCYXNlLmN1ckRyZXNzU3VpdC5mdW5ybml0dXJlTGlzdC5pbmRleE9mKGZ1cm5pdHVyZSk7XG4gICAgICAgICAgICAgICAgaWYgKGluZGV4ID4gLTEpe1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRhdGFCYXNlLmN1ckRyZXNzU3VpdC5mdW5ybml0dXJlTGlzdC5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmdXJuaXR1cmUuc2V0TWFya1VzZShmYWxzZSk7XG4gICAgICAgIHRoaXMuX3NlbGVjdFRhcmdldC5kZXN0cm95KCk7XG4gICAgICAgIHRoaXMuX3NlbGVjdFRhcmdldCA9IG51bGw7XG4gICAgICAgIHRoaXMuX2JhY2t1cFNlbGVjdFRhcmdldCA9IG51bGw7XG4gICAgICAgIHRoaXMuX2xhc3RTZWxlY3RUYXJnZXQgPSBudWxsO1xuICAgICAgICB0aGlzLmRhdGFCYXNlLm9wdGlvbnMuaGlkZSgpO1xuICAgIH0sXG4gICAgLy8g6YeN572uXG4gICAgcmVzZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5kYXRhQmFzZS5vcHRpb25zLmhpZGUoKTtcbiAgICAgICAgdGhpcy5fc2VsZWN0VGFyZ2V0ID0gbnVsbDtcbiAgICAgICAgdGhpcy5fYmFja3VwU2VsZWN0VGFyZ2V0ID0gbnVsbDtcbiAgICAgICAgdGhpcy5fbGFzdFNlbGVjdFRhcmdldCA9IG51bGw7XG4gICAgfSxcbiAgICAvLyDnu5Hlrprkuovku7ZcbiAgICBzdGFydDogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyDluLjnlKjnmoTlj5jph48v5pWw5o2uXG4gICAgICAgIHZhciBlbnQgPSBGaXJlLkVudGl0eS5maW5kKCcvRGF0YUJhc2UnKTtcbiAgICAgICAgdGhpcy5kYXRhQmFzZSA9IGVudC5nZXRDb21wb25lbnQoJ0RhdGFCYXNlJyk7XG5cbiAgICAgICAgRmlyZS5JbnB1dC5vbignbW91c2Vkb3duJywgdGhpcy5iaW5kZWRNb3VzZURvd25FdmVudCk7XG4gICAgICAgIEZpcmUuSW5wdXQub24oJ21vdXNlbW92ZScsIHRoaXMuYmluZGVkTW91c2VNb3ZlRXZlbnQpO1xuICAgICAgICBGaXJlLklucHV0Lm9uKCdtb3VzZXVwJywgdGhpcy5iaW5kZWRNb3VzZVVwRXZlbnQpO1xuICAgICAgICAvL1xuICAgICAgICB0aGlzLmRhdGFCYXNlLm9wdGlvbnMub25IaWRlRXZlbnQgPSB0aGlzLl9vbkhpZGVFdmVudC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmRhdGFCYXNlLm9wdGlvbnMuYnRuX2RlbC5vbk1vdXNlZG93biA9IHRoaXMuX29uRGVsZXRlVGFyZ2V0RXZlbnQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5kYXRhQmFzZS5vcHRpb25zLmJ0bl9NaXJyb3JGbGlwLm9uTW91c2Vkb3duID0gdGhpcy5fb25NaXJyb3JGbGlwRXZlbnQuYmluZCh0aGlzKTtcbiAgICB9LFxuICAgIC8vIOmUgOavgVxuICAgIG9uRGVzdHJveTogZnVuY3Rpb24oKSB7XG4gICAgICAgIEZpcmUuSW5wdXQub2ZmKCdtb3VzZWRvd24nLCB0aGlzLmJpbmRlZE1vdXNlRG93bkV2ZW50KTtcbiAgICAgICAgRmlyZS5JbnB1dC5vZmYoJ21vdXNlbW92ZScsIHRoaXMuYmluZGVkTW91c2VNb3ZlRXZlbnQpO1xuICAgICAgICBGaXJlLklucHV0Lm9mZignbW91c2V1cCcsIHRoaXMuYmluZGVkTW91c2VVcEV2ZW50KTtcbiAgICB9XG59KTtcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnNGZiMGVZQTZrRk9WSzhNby9TMnJqL0gnLCAnRGF0YUJhc2UnKTtcbi8vIHNjcmlwdFxcdmlsbGFcXERhdGFCYXNlLmpzXG5cbi8vICDlrZjmlL7pobnnm67pnIDopoHnmoTlj5jph48v5pWw5o2uL+WvueixoVxudmFyIERhdGFCYXRhID0gRmlyZS5DbGFzcyh7XG4gICAgLy8g57un5om/XG4gICAgZXh0ZW5kczogRmlyZS5Db21wb25lbnQsXG4gICAgLy8g5p6E6YCg5Ye95pWwXG4gICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8g55So5oi36ZKx5YyFXG4gICAgICAgIHRoaXMudXNlcmNjID0gMDtcbiAgICAgICAgLy8g5piv5ZCm5Y+v5Lul5L+d5a2YXG4gICAgICAgIHRoaXMuaGFzQ2FuU2F2ZSA9IGZhbHNlO1xuICAgICAgICAvLyDlvZPliY3mpbzlsYJJRFxuICAgICAgICB0aGlzLmZsb29ySWQgPSAwO1xuICAgICAgICAvLyDlvZPliY1tYXJrXG4gICAgICAgIHRoaXMubWFyayA9ICcnO1xuICAgICAgICAvLyDlvZPliY3miL/pl7RVSURcbiAgICAgICAgdGhpcy5ob3VzZV91aWQgPSAwO1xuICAgICAgICAvLyDlvZPliY3miL/pl7RJRFxuICAgICAgICB0aGlzLnJvb21faWQgPSAwO1xuICAgICAgICAvLyDlvZPliY3miL/pl7TlkI3np7BcbiAgICAgICAgdGhpcy5yb29tX25hbWUgPSAnJztcbiAgICAgICAgLy8g6buY6K6k5oi/6Ze05Zyw5p2/6LWE5rqQXG4gICAgICAgIHRoaXMuZGVmYXVsdF9kaWJhbiA9ICcnO1xuICAgICAgICAvLyDpu5jorqTmiL/pl7Tlopnlo4HotYTmupBcbiAgICAgICAgdGhpcy5kZWZhdWx0X2JlaWppbmcgPSAnJztcbiAgICAgICAgLy8g5b2T5YmN6KOF5omu55qE5aWX6KOFXG4gICAgICAgIHRoaXMuY3VyRHJlc3NTdWl0ID0ge1xuICAgICAgICAgICAgLy8g5aWX6KOFSURcbiAgICAgICAgICAgIHN1aXRfaWQ6IDAsXG4gICAgICAgICAgICAvLyDlpZfoo4XlsI/lm75cbiAgICAgICAgICAgIHN1aXRfaWNvbjogbnVsbCxcbiAgICAgICAgICAgIC8vIOiDjOWMhUlEXG4gICAgICAgICAgICBwYWNrX2lkOiAwLFxuICAgICAgICAgICAgLy8g5aWX6KOF5ZCN56ewXG4gICAgICAgICAgICBzdWl0X25hbWU6ICcnLFxuICAgICAgICAgICAgLy8g5aWX6KOF5p2l6Ieq5ZOq6YeM77yMMS7og4zljIUgMi7llYbln45cbiAgICAgICAgICAgIHN1aXRfZnJvbTogMSxcbiAgICAgICAgICAgIC8vIOWll+ijheS7t+agvFxuICAgICAgICAgICAgcHJpY2U6IDAsXG4gICAgICAgICAgICAvLyDmipjmiaNcbiAgICAgICAgICAgIGRpc2NvdW50OiAxLFxuICAgICAgICAgICAgLy8g5aWX6KOF5YiX6KGoXG4gICAgICAgICAgICBmdW5ybml0dXJlTGlzdDogW11cbiAgICAgICAgfTtcbiAgICAgICAgLy8g5b2T5YmNXG4gICAgICAgIC8vIOS6jOe6p+iPnOWNleWNleWTgeaVsOaNruWIl+ihqFxuICAgICAgICB0aGlzLnNpbmdsZV9TZWNvbmRfRGF0YVNoZWV0cyA9IFtdO1xuICAgICAgICAvLyDkuInnuqfoj5zljZXljZXlk4HmgLvmlbBcbiAgICAgICAgdGhpcy5zaW5nbGVfVGhyZWVfVG90YWxfU2hlZXRzID0ge307XG4gICAgICAgIC8vIOS4iee6p+iPnOWNleWNleWTgeaVsOaNruWIl+ihqFxuICAgICAgICB0aGlzLnNpbmdsZV9UaHJlZV9EYXRhU2hlZXRzID0ge307XG4gICAgICAgIC8vIOS4iee6p+iPnOWNleWNleWTgeWkp+Wbvui1hOa6kOWIl+ihqFxuICAgICAgICB0aGlzLnNpbmdsZV9UaHJlZV9CaWdJbWFnZSA9IHt9O1xuICAgICAgICAvLyDkuoznuqfoj5zljZXlpZfoo4XmgLvmlbBcbiAgICAgICAgdGhpcy5zdWl0SXRlbXNfVGhyZWVfVG90YWwgPSBbXTtcbiAgICAgICAgLy8g5LqM57qn6I+c5Y2V5aWX6KOF5pWw5o2u5YiX6KGoXG4gICAgICAgIHRoaXMuc3VpdEl0ZW1zX1NlY29uZF9EYXRhU2hlZXRzID0gW107XG4gICAgICAgIC8vIOeJqeWTgeafnOaVsOaNruWIl+ihqFxuICAgICAgICB0aGlzLmJhY2twYWNrX1NlY29uZF9EYXRhU2hlZXRzID0gW107XG4gICAgICAgIC8vIOeJqeWTgeafnOaVsOaNruWIl+ihqFxuICAgICAgICB0aGlzLmJhY2twYWNrX1RocmVlX1RvdGFsX1NoZWV0cyA9IFtdO1xuICAgICAgICB0aGlzLmJhY2twYWNrX1RocmVlX0RhdGFTaGVldHMgPSBbXTtcbiAgICAgICAgLy8g55So5LqO5Yib5bu657yp55Wl5Zu+XG4gICAgICAgIHRoaXMuY3R4VG9EcmF3ID0gbnVsbDtcbiAgICAgICAgLy8g55So5LqO5ouN54WnXG4gICAgICAgIHRoaXMuZnJhbWVDb3VudCA9IC0xO1xuICAgICAgICB0aGlzLm5lZWRIaWRlRW50TGlzdCA9IFtdO1xuICAgICAgICAvLyDog4zmma/kuI7lnLDpnaLnmoTpu5jorqTlm77niYdcbiAgICAgICAgdGhpcy5iYWNrZ3JvdW5kID0gbnVsbDtcbiAgICAgICAgdGhpcy5ncm91bmQgPSBudWxsO1xuICAgICAgICAvLyDliJ3lp4vljJblnLrmma/lrZDlhYPntKBcbiAgICAgICAgdGhpcy5kZWZhdWx0U2NyZWVuQ2hpbGRzID0gbnVsbDtcbiAgICAgICAgLy8g5L+d5a2Y5omA5pyJ5Zu+54mHXG4gICAgICAgIHRoaXMubG9hZEltYWdlTGlzdCA9IHt9O1xuICAgIH0sXG4gICAgLy8g6L295YWl5pe2XG4gICAgb25Mb2FkOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIOi9veWFpeaOp+S7tlxuICAgICAgICB0aGlzLmxvYWRDb250cm9scygpO1xuICAgICAgICBpZiAoIXRoaXMubmV0V29ya01nci5nZXRUb0tlblZhbHVlKCkpIHtcbiAgICAgICAgICAgIHRoaXMudG9LZW5UaXBXaW4uYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyDliJ3lp4vljJbmiL/pl7RcbiAgICAgICAgdmFyIHNlbmREYXRhID0ge1xuICAgICAgICAgICAgbWFyazogJycsXG4gICAgICAgICAgICBob3VzZV91aWQ6IDBcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBzZWxmLmxvYWRUaXBzLm9wZW5UaXBzKCfliJ3lp4vljJblnLrmma/vvIzor7fnqI3lkI4uLi4nKTtcbiAgICAgICAgc2VsZi5pbnRvUm9vbShzZW5kRGF0YSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy8g6L+Z6YeM5Zug5Li65piv5Li65LqG5L+d5oyB6buY6K6k55qE6IOM5pmv6Lef5Zyw5p2/55qE5Zu+54mHXG4gICAgICAgICAgICBzZWxmLnNhdmVEZWZhdWx0RGF0YSgpO1xuICAgICAgICAgICAgc2VsZi5sb2FkVGlwcy5jbG9zZVRpcHMoKTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICAvLyDkv53lrZjliJ3lp4vljJbmlbDmja7vvIjooajnpLrpnIDopoHov5vooYzoo4Xmia7vvIlcbiAgICBzYXZlRGVmYXVsdERhdGE6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5iYWNrZ3JvdW5kLnNhdmVEZWZhdWx0U3ByaXRlKCk7XG4gICAgICAgIHRoaXMuZ3JvdW5kLnNhdmVEZWZhdWx0U3ByaXRlKCk7XG4gICAgICAgIHRoaXMuZGVmYXVsdFNjcmVlbkNoaWxkcyA9IHRoaXMucm9vbS5nZXRDaGlsZHJlbigpO1xuICAgIH0sXG4gICAgLy8g6L295YWl5o6n5Lu2XG4gICAgbG9hZENvbnRyb2xzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIOiDjOaZr1xuICAgICAgICB2YXIgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL1Jvb20vYmFja2dyb3VuZCcpO1xuICAgICAgICAvL3RoaXMuYmdSZW5kZXIgPSBlbnQuZ2V0Q29tcG9uZW50KEZpcmUuU3ByaXRlUmVuZGVyZXIpO1xuICAgICAgICB0aGlzLmJhY2tncm91bmQgPSBlbnQuZ2V0Q29tcG9uZW50KCdGdXJuaXR1cmUnKTtcbiAgICAgICAgLy8g5Zyw5p2/XG4gICAgICAgIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9Sb29tL2dyb3VuZCcpO1xuICAgICAgICAvL3RoaXMuZ3JvdW5kUmVuZGVyID0gZW50LmdldENvbXBvbmVudChGaXJlLlNwcml0ZVJlbmRlcmVyKTtcbiAgICAgICAgdGhpcy5ncm91bmQgPSBlbnQuZ2V0Q29tcG9uZW50KCdGdXJuaXR1cmUnKTtcbiAgICAgICAgLy8g5oi/6Ze05aS06IqC54K5XG4gICAgICAgIHRoaXMucm9vbSA9IEZpcmUuRW50aXR5LmZpbmQoJy9Sb29tJyk7XG4gICAgICAgIC8vIOaOp+WItumAiemhuVxuICAgICAgICBlbnQgPSBGaXJlLkVudGl0eS5maW5kKCcvT3B0aW9ucycpO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBlbnQuZ2V0Q29tcG9uZW50KCdPcHRpb25zJyk7XG4gICAgICAgIC8vIOS6jOe6p+WtkOiPnOWNleaooeadv1xuICAgICAgICB0aGlzLnRlbXBTdWJTZWNvbmRNZW51ID0gdGhpcy5lbnRpdHkuZmluZCgnU3ViU2Vjb25kTWVudScpO1xuICAgICAgICAvLyDkuInnuqflrZDoj5zljZXmqKHmnb9cbiAgICAgICAgdGhpcy50ZW1wU3ViVGhyZWVNZW51ID0gdGhpcy5lbnRpdHkuZmluZCgnU3ViVGhyZWVNZW51Jyk7XG4gICAgICAgIC8vIOWutuWFt+aooeadv1xuICAgICAgICB0aGlzLnRlbXBGdXJuaXR1cmUgPSB0aGlzLmVudGl0eS5maW5kKCdGdXJuaXR1cmUnKTtcbiAgICAgICAgLy8g55So5oi35a625bqt5L+h5oGv5qih5p2/XG4gICAgICAgIHRoaXMudGVtcEZhbWlseUluZm8gPSB0aGlzLmVudGl0eS5maW5kKCdGYW1pbHlJbmZvJyk7XG4gICAgICAgIC8vIOW5s+mdouWbvuaooeadv1xuICAgICAgICB0aGlzLnRlbXBQbGFuID0gdGhpcy5lbnRpdHkuZmluZCgncGxhbicpO1xuICAgICAgICAvLyDnvZHnu5zov57mjqVcbiAgICAgICAgdGhpcy5uZXRXb3JrTWdyID0gdGhpcy5lbnRpdHkuZ2V0Q29tcG9uZW50KCdOZXR3b3JrTWdyJyk7XG4gICAgICAgIC8vIOS4u+iPnOWNlVxuICAgICAgICBlbnQgPSBGaXJlLkVudGl0eS5maW5kKCcvTWVudV9NYWluJyk7XG4gICAgICAgIHRoaXMubWFpbk1lbnVNZ3IgPSBlbnQuZ2V0Q29tcG9uZW50KCdNYWluTWVudU1ncicpO1xuICAgICAgICAvLyDkuIDnuqfoj5zljZVcbiAgICAgICAgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL01lbnVfRmlyc3QnKTtcbiAgICAgICAgdGhpcy5maXJzdE1lbnVNZ3IgPSBlbnQuZ2V0Q29tcG9uZW50KCdGaXJzdE1lbnVNZ3InKTtcbiAgICAgICAgLy8g5LqM57qn6I+c5Y2VXG4gICAgICAgIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9NZW51X1NlY29uZCcpO1xuICAgICAgICB0aGlzLnNlY29uZE1lbnVNZ3IgPSBlbnQuZ2V0Q29tcG9uZW50KCdTZWNvbmRNZW51TWdyJyk7XG4gICAgICAgIC8vIOS4iee6p+e6p+iPnOWNlVxuICAgICAgICBlbnQgPSBGaXJlLkVudGl0eS5maW5kKCcvTWVudV9UaHJlZScpO1xuICAgICAgICB0aGlzLnRocmVlTWVudU1nciA9IGVudC5nZXRDb21wb25lbnQoJ1RocmVlTWVudU1ncicpO1xuICAgICAgICAvLyDlhbbku5boj5zljZVcbiAgICAgICAgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL1dpbl9GbG9vcicpO1xuICAgICAgICB0aGlzLmZsb29yV2luID0gZW50LmdldENvbXBvbmVudCgnRmxvb3JXaW5kb3cnKTtcbiAgICAgICAgLy8g6YeN5paw6K+35rGC5pyN5Yqh5Zmo56qX5Y+jXG4gICAgICAgIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9XaW5fTmV0V29yaycpO1xuICAgICAgICB0aGlzLm5ldFdvcmtXaW4gPSBlbnQuZ2V0Q29tcG9uZW50KCdOZXdXb3JrV2luZG93Jyk7XG4gICAgICAgIC8vIOayoeacieeUqOaIt+S/oeaBr+eahOaPkOekuueql+WPo1xuICAgICAgICB0aGlzLnRvS2VuVGlwV2luID0gRmlyZS5FbnRpdHkuZmluZCgnL1dpbl9Ub2tlblRpcCcpO1xuICAgICAgICAvLyDlubPpnaLlm75cbiAgICAgICAgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL1dpbl9Td2l0Y2hSb29tJyk7XG4gICAgICAgIHRoaXMuc3dpdGNoUm9vbVdpbiA9IGVudC5nZXRDb21wb25lbnQoJ1N3aXRjaFJvb21XaW5kb3cnKTtcbiAgICAgICAgLy8g5Yqg6L295o+Q56S6XG4gICAgICAgIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9UaXBzX2xvYWQnKTtcbiAgICAgICAgdGhpcy5sb2FkVGlwcyA9IGVudC5nZXRDb21wb25lbnQoJ1RpcExvYWQnKTtcbiAgICAgICAgLy8g5rip6aao5o+Q56S656qX5Y+jXG4gICAgICAgIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9UaXBzX3dpbmRvdycpO1xuICAgICAgICB0aGlzLnRpcHNXaW5kb3cgPSBlbnQuZ2V0Q29tcG9uZW50KCdUaXBzV2luZG93Jyk7XG4gICAgICAgIC8vIOi0reeJqeeql+WPo1xuICAgICAgICBlbnQgPSBGaXJlLkVudGl0eS5maW5kKCcvV2luX1BheU1lbnQnKTtcbiAgICAgICAgdGhpcy5wYXlNZW50V2luZG93ID0gZW50LmdldENvbXBvbmVudCgnUGF5TWVudFdpbmRvdycpO1xuICAgICAgICAvLyDph43nva7nqpflj6NcbiAgICAgICAgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL1RpcHNfUGF5TWVudCcpO1xuICAgICAgICB0aGlzLnBheU1lbnRUaXBzID0gZW50LmdldENvbXBvbmVudCgnVGlwc1BheU1lbnQnKTtcbiAgICAgICAgLy8g5pSv5LuY6Zeu6aKY56qX5Y+jXG4gICAgICAgIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9UaXBzX1BheVByb2JsZW1zJyk7XG4gICAgICAgIHRoaXMudGlwc1BheVByb2JsZW1zID0gZW50LmdldENvbXBvbmVudCgnVGlwc1BheVByb2JsZW1zJyk7XG4gICAgfSxcbiAgICAvLyDkuIvovb3lm77niYdcbiAgICBsb2FkSW1hZ2U6IGZ1bmN0aW9uICh1cmwsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgaWYgKHNlbGYubG9hZEltYWdlTGlzdFt1cmxdKSB7XG4gICAgICAgICAgICB2YXIgaW1hZ2UgPSBzZWxmLmxvYWRJbWFnZUxpc3RbdXJsXTtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIGltYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvL3NlbGYubG9hZFRpcHMub3BlblRpcHMoJ+WKoOi9veWbvueJh+S4re+8jOivt+eojeWQji4uLicpO1xuICAgICAgICBGaXJlLkltYWdlTG9hZGVyKHVybCwgZnVuY3Rpb24gKGVycm9yLCBpbWFnZSkge1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyb3IsIGltYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vc2VsZi5sb2FkVGlwcy5jbG9zZVRpcHMoKTtcbiAgICAgICAgICAgIGlmIChpbWFnZSkge1xuICAgICAgICAgICAgICAgIHNlbGYubG9hZEltYWdlTGlzdFt1cmxdID0gaW1hZ2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLy8g5piv5ZCm6ZyA6KaB6LSt5LmwXG4gICAgaGFzUGF5OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBjaGlsZHJlbiA9IHRoaXMucm9vbS5nZXRDaGlsZHJlbigpO1xuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIHZhciBlbnQgPSBjaGlsZHJlbltpXTtcbiAgICAgICAgICAgIHZhciBmdXJuaXR1cmUgPSBlbnQuZ2V0Q29tcG9uZW50KCdGdXJuaXR1cmUnKTtcbiAgICAgICAgICAgIGlmIChmdXJuaXR1cmUucHJpY2UgPiAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGRyZXNzU3VpdCA9IHRoaXMuY3VyRHJlc3NTdWl0O1xuICAgICAgICBpZiAoZHJlc3NTdWl0LnByaWNlID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG4gICAgLy8g5piv5ZCm5pS55Y+Y5LqG6IOM5pmv5LiO5Zyw6Z2i55qE5p2Q6LSoXG4gICAgaGFzU2F2ZVJvb206IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGNoaWxkcmVuID0gdGhpcy5yb29tLmdldENoaWxkcmVuKCk7XG4gICAgICAgIGlmIChjaGlsZHJlbi5sZW5ndGggPiAyKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5iYWNrZ3JvdW5kLmltYWdlVXJsICE9PSB0aGlzLmRlZmF1bHRfYmVpamluZyB8fFxuICAgICAgICAgICAgdGhpcy5ncm91bmQuaW1hZ2VVcmwgIT09IHRoaXMuZGVmYXVsdF9kaWJhbiApIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIC8vaWYgKCEgdGhpcy5oYXNDYW5TYXZlKSB7XG4gICAgICAgIC8vICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgLy99XG4gICAgICAgIC8vdmFyIGN1clNwcml0ZSA9IHRoaXMuYmFja2dyb3VuZC5nZXRSZW5kZXJTcHJpdGUoKTtcbiAgICAgICAgLy92YXIgZGVmYXVsdFNwcml0ZSA9IHRoaXMuYmFja2dyb3VuZC5kZWZhdWx0U3ByaXRlO1xuICAgICAgICAvL2lmIChjdXJTcHJpdGUgIT09IGRlZmF1bHRTcHJpdGUpIHtcbiAgICAgICAgLy8gICAgcmV0dXJuIHRydWU7XG4gICAgICAgIC8vfVxuICAgICAgICAvL2N1clNwcml0ZSA9IHRoaXMuZ3JvdW5kLmdldFJlbmRlclNwcml0ZSgpO1xuICAgICAgICAvL2RlZmF1bHRTcHJpdGUgPSB0aGlzLmdyb3VuZC5kZWZhdWx0U3ByaXRlO1xuICAgICAgICAvL2lmIChjdXJTcHJpdGUgIT09IGRlZmF1bHRTcHJpdGUpIHtcbiAgICAgICAgLy8gICAgcmV0dXJuIHRydWU7XG4gICAgICAgIC8vfVxuICAgICAgICAvL3ZhciBoYXNTYW1lID0gZmFsc2UsIGNoaWxkcmVuID0gdGhpcy5yb29tLmdldENoaWxkcmVuKCk7XG4gICAgICAgIC8vZm9yKHZhciBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIC8vICAgIGhhc1NhbWUgPSB0aGlzLmRlZmF1bHRTY3JlZW5DaGlsZHNbaV0gPT09IGNoaWxkcmVuW2ldO1xuICAgICAgICAvLyAgICBpZiAoISBoYXNTYW1lKSB7XG4gICAgICAgIC8vICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgLy8gICAgfVxuICAgICAgICAvL31cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG4gICAgLy8g5riF56m65Zy65pmvXG4gICAgcmVzZXRTY3JlZW46IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICB2YXIgY2hpbGRyZW4gPSB0aGlzLnJvb20uZ2V0Q2hpbGRyZW4oKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDI7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY2hpbGRyZW5baV0uZGVzdHJveSgpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy8g5Yig6Zmk5aWX6KOFXG4gICAgcmVtb3ZlU3VpdDogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgZHJlc3NMaXN0ID0gdGhpcy5jdXJEcmVzc1N1aXQuZnVucm5pdHVyZUxpc3Q7XG4gICAgICAgIGlmIChkcmVzc0xpc3QpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZHJlc3NMaXN0Lmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNvbSA9IGRyZXNzTGlzdFtpXTtcbiAgICAgICAgICAgICAgICBpZiAoY29tLnByb3BzX3R5cGUgPiAyKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBlbnQgPSBjb20uZW50aXR5O1xuICAgICAgICAgICAgICAgICAgICBlbnQuZGVzdHJveSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLmN1ckRyZXNzU3VpdCA9IHtcbiAgICAgICAgICAgIC8vIOWll+ijhUlEXG4gICAgICAgICAgICBzdWl0X2lkOiAwLFxuICAgICAgICAgICAgLy8g5aWX6KOF5ZCN56ewXG4gICAgICAgICAgICBzdWl0X25hbWU6ICcnLFxuICAgICAgICAgICAgLy8g6IOM5YyFSURcbiAgICAgICAgICAgIHBhY2tfaWQ6IDAsXG4gICAgICAgICAgICAvLyDlpZfoo4XlsI/lm75cbiAgICAgICAgICAgIHN1aXRfaWNvbjogbnVsbCxcbiAgICAgICAgICAgIC8vIOWll+ijheadpeiHquWTqumHjO+8jDEu6IOM5YyFIDIu5ZWG5Z+OXG4gICAgICAgICAgICBzdWl0X2Zyb206IDEsXG4gICAgICAgICAgICAvLyDlpZfoo4Xku7fmoLxcbiAgICAgICAgICAgIHByaWNlOiAwLFxuICAgICAgICAgICAgLy8g5oqY5omjXG4gICAgICAgICAgICBkaXNjb3VudDogMSxcbiAgICAgICAgICAgIC8vIOWutuWFt+WIl+ihqFxuICAgICAgICAgICAgZnVucm5pdHVyZUxpc3Q6IFtdXG4gICAgICAgIH07XG4gICAgfSxcbiAgICAvLyDkv53lrZjoo4Xmia5cbiAgICBzYXZlUm9vbTogZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIHNlbmREYXRhID0ge1xuICAgICAgICAgICAgc3VpdF9pZDogc2VsZi5jdXJEcmVzc1N1aXQuc3VpdF9pZCxcbiAgICAgICAgICAgIHN1aXRfZnJvbTogc2VsZi5jdXJEcmVzc1N1aXQuc3VpdF9mcm9tLFxuICAgICAgICAgICAgZGF0YUxpc3Q6IFtdXG4gICAgICAgIH07XG4gICAgICAgIHZhciBkYXRhID0ge1xuICAgICAgICAgICAgcHJvZF9pZDogMCxcbiAgICAgICAgICAgIHBhY2tfaWQ6IDAsXG4gICAgICAgICAgICBwcm9kX3VpZDogMCxcbiAgICAgICAgICAgIHBvczogJycsXG4gICAgICAgICAgICByb3RhaW9uOiAwLFxuICAgICAgICAgICAgc2NhbGU6ICcnLFxuICAgICAgICAgICAgc3VpdF9pZDogMFxuICAgICAgICB9O1xuICAgICAgICB2YXIgY2hpbGRyZW4gPSB0aGlzLnJvb20uZ2V0Q2hpbGRyZW4oKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGVudCA9IGNoaWxkcmVuW2ldO1xuICAgICAgICAgICAgdmFyIGZ1cm5pdHVyZSA9IGVudC5nZXRDb21wb25lbnQoJ0Z1cm5pdHVyZScpO1xuICAgICAgICAgICAgZGF0YSA9IHtcbiAgICAgICAgICAgICAgICBwcm9kX2lkOiBmdXJuaXR1cmUucHJvcHNfaWQsXG4gICAgICAgICAgICAgICAgcGFja19pZDogZnVybml0dXJlLnBhY2tfaWQsXG4gICAgICAgICAgICAgICAgcHJvZF91aWQ6IGZ1cm5pdHVyZS5wcm9wc191aWQsXG4gICAgICAgICAgICAgICAgcG9zOiBlbnQudHJhbnNmb3JtLnggKyBcIjpcIiArIGVudC50cmFuc2Zvcm0ueSxcbiAgICAgICAgICAgICAgICByb3RhdGlvbjogZW50LnRyYW5zZm9ybS5yb3RhdGlvbixcbiAgICAgICAgICAgICAgICBzY2FsZTogZW50LnRyYW5zZm9ybS5zY2FsZVggKyBcIjpcIiArIGVudC50cmFuc2Zvcm0uc2NhbGVZLFxuICAgICAgICAgICAgICAgIHN1aXRfaWQ6IGZ1cm5pdHVyZS5zdWl0X2lkXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgc2VuZERhdGEuZGF0YUxpc3QucHVzaChkYXRhKTtcbiAgICAgICAgfVxuICAgICAgICBzZWxmLm5ldFdvcmtNZ3IuUmVxdWVzdFNhdmVSb29tKHNlbmREYXRhLCBmdW5jdGlvbiAoc2VydmVyRGF0YSkge1xuICAgICAgICAgICAgaWYgKHNlcnZlckRhdGEuc3RhdHVzID09PSAxMDAwMCkge1xuICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhzZXJ2ZXJEYXRhLnVzZXJjYyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgc2VsZi50aXBzV2luZG93Lm9wZW5UaXBzV2luZG93KHNlcnZlckRhdGEuZGVzYyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLy8g5Yib5bu65a625YW35Yiw5Zy65pmv5LitXG4gICAgY3JlYXRlRnVybml0dXJlVG9TY3JlZW46IGZ1bmN0aW9uIChkcmVzc0xpc3QsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgaWYgKGRyZXNzTGlzdC5sZW5ndGggPT09IDAgJiYgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGluZGV4ID0gMDtcbiAgICAgICAgZHJlc3NMaXN0LmZvckVhY2goZnVuY3Rpb24gKGRyZXNzKSB7XG4gICAgICAgICAgICB2YXIgZW50aXR5ID0gbnVsbCwgZnVybml0dXJlID0gbnVsbDtcbiAgICAgICAgICAgIHZhciBwcm9wc1R5cGUgPSBwYXJzZUludChkcmVzcy5wcm9wc1R5cGUpO1xuICAgICAgICAgICAgaWYgKHByb3BzVHlwZSA9PT0gMSkge1xuICAgICAgICAgICAgICAgIGVudGl0eSA9IHNlbGYucm9vbS5maW5kKCdiYWNrZ3JvdW5kJyk7XG4gICAgICAgICAgICAgICAgZnVybml0dXJlID0gZW50aXR5LmdldENvbXBvbmVudCgnRnVybml0dXJlJyk7XG4gICAgICAgICAgICAgICAgZnVybml0dXJlLnNldEZ1cm5pdHVyZURhdGEoZHJlc3MsIHRydWUpO1xuICAgICAgICAgICAgICAgIHNlbGYubG9hZFRpcHMub3BlblRpcHMoJ+WIm+W7uuWbvueJh+S4re+8jOivt+eojeWQji4uLicpO1xuICAgICAgICAgICAgICAgIHNlbGYubG9hZEltYWdlKGZ1cm5pdHVyZS5pbWFnZVVybCwgZnVuY3Rpb24gKGVycm9yLCBpbWFnZSkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmxvYWRUaXBzLmNsb3NlVGlwcygpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB2YXIgYmlnU3ByaXRlID0gbmV3IEZpcmUuU3ByaXRlKGltYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgZnVybml0dXJlLnNldFNwcml0ZShiaWdTcHJpdGUpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAocHJvcHNUeXBlID09PSAyKSB7XG4gICAgICAgICAgICAgICAgZW50aXR5ID0gc2VsZi5yb29tLmZpbmQoJ2dyb3VuZCcpO1xuICAgICAgICAgICAgICAgIGZ1cm5pdHVyZSA9IGVudGl0eS5nZXRDb21wb25lbnQoJ0Z1cm5pdHVyZScpO1xuICAgICAgICAgICAgICAgIGZ1cm5pdHVyZS5zZXRGdXJuaXR1cmVEYXRhKGRyZXNzLCB0cnVlKTtcbiAgICAgICAgICAgICAgICBzZWxmLmxvYWRUaXBzLm9wZW5UaXBzKCfliJvlu7rlm77niYfkuK3vvIzor7fnqI3lkI4uLi4nKTtcbiAgICAgICAgICAgICAgICBzZWxmLmxvYWRJbWFnZShmdXJuaXR1cmUuaW1hZ2VVcmwsIGZ1bmN0aW9uIChlcnJvciwgaW1hZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5sb2FkVGlwcy5jbG9zZVRpcHMoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdmFyIGJpZ1Nwcml0ZSA9IG5ldyBGaXJlLlNwcml0ZShpbWFnZSk7XG4gICAgICAgICAgICAgICAgICAgIGZ1cm5pdHVyZS5zZXRTcHJpdGUoYmlnU3ByaXRlKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGVudGl0eSA9IEZpcmUuaW5zdGFudGlhdGUoc2VsZi50ZW1wRnVybml0dXJlKTtcbiAgICAgICAgICAgICAgICBlbnRpdHkuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBlbnRpdHkucGFyZW50ID0gc2VsZi5yb29tO1xuICAgICAgICAgICAgICAgIGVudGl0eS5uYW1lID0gZHJlc3MucHJvcHNOYW1lO1xuICAgICAgICAgICAgICAgIC8vIOiuvue9ruWdkOagh1xuICAgICAgICAgICAgICAgIHZhciBuZXdWZWMyID0gbmV3IEZpcmUuVmVjMigpO1xuICAgICAgICAgICAgICAgIHZhciBzdHIgPSBkcmVzcy5wb3Muc3BsaXQoXCI6XCIpO1xuICAgICAgICAgICAgICAgIG5ld1ZlYzIueCA9IHBhcnNlRmxvYXQoc3RyWzBdKTtcbiAgICAgICAgICAgICAgICBuZXdWZWMyLnkgPSBwYXJzZUZsb2F0KHN0clsxXSk7XG4gICAgICAgICAgICAgICAgZW50aXR5LnRyYW5zZm9ybS5wb3NpdGlvbiA9IG5ld1ZlYzI7XG4gICAgICAgICAgICAgICAgLy8g6K6+572u6KeS5bqmXG4gICAgICAgICAgICAgICAgZW50aXR5LnRyYW5zZm9ybS5yb3RhdGlvbiA9IGRyZXNzLnJvdGF0aW9uO1xuICAgICAgICAgICAgICAgIC8vIOiuvue9ruWkp+Wwj1xuICAgICAgICAgICAgICAgIHN0ciA9IGRyZXNzLnNjYWxlLnNwbGl0KFwiOlwiKTtcbiAgICAgICAgICAgICAgICBuZXdWZWMyLnggPSBwYXJzZUZsb2F0KHN0clswXSk7XG4gICAgICAgICAgICAgICAgbmV3VmVjMi55ID0gcGFyc2VGbG9hdChzdHJbMV0pO1xuICAgICAgICAgICAgICAgIGVudGl0eS50cmFuc2Zvcm0uc2NhbGUgPSBuZXdWZWMyO1xuICAgICAgICAgICAgICAgIGZ1cm5pdHVyZSA9IGVudGl0eS5nZXRDb21wb25lbnQoJ0Z1cm5pdHVyZScpO1xuICAgICAgICAgICAgICAgIGZ1cm5pdHVyZS5zZXRGdXJuaXR1cmVEYXRhKGRyZXNzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIOWtmOWCqOWll+ijheWutuWFt1xuICAgICAgICAgICAgaWYgKGZ1cm5pdHVyZS5zdWl0X2lkID09PSBzZWxmLmN1ckRyZXNzU3VpdC5zdWl0X2lkKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5jdXJEcmVzc1N1aXQuZnVucm5pdHVyZUxpc3QucHVzaChmdXJuaXR1cmUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyDov5vlhaXmiL/pl7RcbiAgICBpbnRvUm9vbTogZnVuY3Rpb24gKHNlbmREYXRhLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHNlbGYubmV0V29ya01nci5SZXF1ZXN0SW50b0hvbWVEYXRhKHNlbmREYXRhLCBmdW5jdGlvbiAoc2VydmVyRGF0YSkge1xuICAgICAgICAgICAgaWYgKHNlcnZlckRhdGEuc3RhdHVzICE9PSAxMDAwMCkge1xuICAgICAgICAgICAgICAgIHNlbGYudGlwc1dpbmRvdy5vcGVuVGlwc1dpbmRvdyhzZXJ2ZXJEYXRhLmRlc2MpO1xuICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2VsZi5mbG9vcklkID0gc2VydmVyRGF0YS5mbG9vcklkO1xuICAgICAgICAgICAgc2VsZi5tYXJrID0gc2VydmVyRGF0YS5tYXJrO1xuICAgICAgICAgICAgc2VsZi5ob3VzZV91aWQgPSBzZXJ2ZXJEYXRhLmhvdXNlX3VpZDtcbiAgICAgICAgICAgIHNlbGYucm9vbV9pZCA9IHNlcnZlckRhdGEucm9vbV9pZDtcbiAgICAgICAgICAgIHNlbGYucm9vbV9uYW1lID0gc2VydmVyRGF0YS5yb29tX25hbWU7XG4gICAgICAgICAgICBzZWxmLmRlZmF1bHRfZGliYW4gPSBzZXJ2ZXJEYXRhLmRlZmF1bHRfZGliYW47XG4gICAgICAgICAgICBzZWxmLmRlZmF1bHRfYmVpamluZyA9IHNlcnZlckRhdGEuZGVmYXVsdF9iZWlqaW5nO1xuICAgICAgICAgICAgc2VsZi5tYWluTWVudU1nci5yZWZyZXNoQ3VySG9tZVR5cGUoc2VsZi5yb29tX25hbWUpO1xuICAgICAgICAgICAgc2VsZi5tYWluTWVudU1nci5yZWZyZXNoQ3VyVmlsbGFOYW1lKHNlcnZlckRhdGEudmlsbGFfbmFtZSk7XG4gICAgICAgICAgICAvLyDojrflj5blpZfoo4Xkv6Hmga9cbiAgICAgICAgICAgIHNlbGYuY3VyRHJlc3NTdWl0ID0ge1xuICAgICAgICAgICAgICAgIC8vIOWll+ijhUlEXG4gICAgICAgICAgICAgICAgc3VpdF9pZDogcGFyc2VJbnQoc2VydmVyRGF0YS5zdWl0X2lkKSxcbiAgICAgICAgICAgICAgICAvLyDog4zljIVJRFxuICAgICAgICAgICAgICAgIHBhY2tfaWQ6IDAsXG4gICAgICAgICAgICAgICAgLy8g5aWX6KOF5bCP5Zu+XG4gICAgICAgICAgICAgICAgc3VpdF9pY29uOiBudWxsLFxuICAgICAgICAgICAgICAgIC8vIOWll+ijheWQjeensFxuICAgICAgICAgICAgICAgIHN1aXRfbmFtZTogJycsXG4gICAgICAgICAgICAgICAgLy8g5aWX6KOF5p2l6Ieq5ZOq6YeM77yMMS7og4zljIUgMi7llYbln45cbiAgICAgICAgICAgICAgICBzdWl0X2Zyb206IDEsXG4gICAgICAgICAgICAgICAgLy8g5aWX6KOF5Lu35qC8XG4gICAgICAgICAgICAgICAgcHJpY2U6IDAsXG4gICAgICAgICAgICAgICAgLy8g5oqY5omjXG4gICAgICAgICAgICAgICAgZGlzY291bnQ6IDEsXG4gICAgICAgICAgICAgICAgLy8g5aWX6KOF5YiX6KGoXG4gICAgICAgICAgICAgICAgZnVucm5pdHVyZUxpc3Q6IFtdXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgLy8g5riF56m65Zy65pmvXG4gICAgICAgICAgICBzZWxmLnJlc2V0U2NyZWVuKCk7XG4gICAgICAgICAgICAvLyDliJvlu7rlrrblhbfliLDlnLrmma/kuK1cbiAgICAgICAgICAgIHNlbGYuY3JlYXRlRnVybml0dXJlVG9TY3JlZW4oc2VydmVyRGF0YS5kcmVzc0xpc3QsIGNhbGxiYWNrKTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICAvLyDpooTliqDovb3kuoznuqfoj5zljZUg5Y2V5ZOB5a625YW35pWw5o2uXG4gICAgcHJlbG9hZFNpbmFnbGVJdGVtc0RhdGFfU2Vjb25kOiBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBzZWxmLm5ldFdvcmtNZ3IuUmVxdWVzdFNpbmdsZUl0ZW1zTWVudShmdW5jdGlvbiAoc2VydmVyRGF0YSkge1xuICAgICAgICAgICAgaWYgKHNlcnZlckRhdGEuc3RhdHVzICE9PSAxMDAwMCkge1xuICAgICAgICAgICAgICAgIHNlbGYudGlwc1dpbmRvdy5vcGVuVGlwc1dpbmRvdyhzZXJ2ZXJEYXRhLmRlc2MpO1xuICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc2VydmVyRGF0YS5saXN0ICYmIHNlcnZlckRhdGEubGlzdC5sZW5ndGggPT09IDAgJiYgY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBpbmRleCA9IDA7XG4gICAgICAgICAgICBzZXJ2ZXJEYXRhLmxpc3QuZm9yRWFjaChmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgIHZhciBsb2FkSW1hZ2VDYWxsQmFjayA9IGZ1bmN0aW9uIChkYXRhLCBpbmRleCwgZXJyb3IsIGltYWdlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGRhdGEuc21hbGxTcHJpdGUgPSBuZXcgRmlyZS5TcHJpdGUoaW1hZ2UpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGluZGV4LCBkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzLCBkYXRhLCBpbmRleCk7XG4gICAgICAgICAgICAgICAgLy8g5L+d5a2Y5pWw5o2uXG4gICAgICAgICAgICAgICAgc2VsZi5zaW5nbGVfU2Vjb25kX0RhdGFTaGVldHMucHVzaChkYXRhKTtcbiAgICAgICAgICAgICAgICAvLyDliqDovb3lm77niYdcbiAgICAgICAgICAgICAgICAvL3NlbGYubG9hZEltYWdlKGRhdGEudXJsLCBsb2FkSW1hZ2VDYWxsQmFjayk7XG4gICAgICAgICAgICAgICAgaW5kZXgrKztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIC8vIOmihOWKoOi9veS4iee6p+iPnOWNlSDljZXlk4HlrrblhbfmlbDmja5cbiAgICBwcmVsb2FkU2luYWdsZUl0ZW1zRGF0YV9UaHJlZTogZnVuY3Rpb24gKGlkLCBwYWdlLCBlYWNoLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIGlmICghc2VsZi5zaW5nbGVfVGhyZWVfRGF0YVNoZWV0c1tpZF0pIHtcbiAgICAgICAgICAgIHNlbGYuc2luZ2xlX1RocmVlX0RhdGFTaGVldHNbaWRdID0gW107XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHNlbmREYXRhID0ge1xuICAgICAgICAgICAgdGlkOiBpZCxcbiAgICAgICAgICAgIHBhZ2U6IHBhZ2UsXG4gICAgICAgICAgICBlYWNoOiAtMVxuICAgICAgICB9O1xuICAgICAgICBzZWxmLm5ldFdvcmtNZ3IuUmVxdWVzdFNpbmdsZUl0ZW1zKHNlbmREYXRhLCBmdW5jdGlvbiAoc2VydmVyRGF0YSkge1xuICAgICAgICAgICAgaWYgKHNlcnZlckRhdGEuc3RhdHVzICE9PSAxMDAwMCkge1xuICAgICAgICAgICAgICAgIHNlbGYudGlwc1dpbmRvdy5vcGVuVGlwc1dpbmRvdyhzZXJ2ZXJEYXRhLmRlc2MpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciB0b3RhbCA9IHBhcnNlSW50KHNlcnZlckRhdGEudG90YWwpO1xuICAgICAgICAgICAgc2VsZi5zaW5nbGVfVGhyZWVfVG90YWxfU2hlZXRzW2lkXSA9IHRvdGFsO1xuICAgICAgICAgICAgaWYgKHRvdGFsID09PSAwICYmIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgZGF0YVNoZWV0cyA9IHNlbGYuc2luZ2xlX1RocmVlX0RhdGFTaGVldHNbaWRdO1xuICAgICAgICAgICAgdmFyIGluZGV4ID0gMCwgbG9hZEltYWdlQ291bnQgPSAwO1xuICAgICAgICAgICAgc2VydmVyRGF0YS5saXN0LmZvckVhY2goZnVuY3Rpb24gKGRhdGFTaGVldHMsIGRhdGEpIHtcbiAgICAgICAgICAgICAgICB2YXIgbWVudURhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3BzX2lkOiBwYXJzZUludChkYXRhLnByb2RfaWQpLFxuICAgICAgICAgICAgICAgICAgICBwcm9wc19uYW1lOiBkYXRhLnByb2RfbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgcHJvZF91aWQ6IGRhdGEucHJvZF91aWQsXG4gICAgICAgICAgICAgICAgICAgIHByaWNlOiBkYXRhLnByb2RfcHJpY2UsXG4gICAgICAgICAgICAgICAgICAgIGRpc2NvdW50OiBkYXRhLmRpc2NvdW50LFxuICAgICAgICAgICAgICAgICAgICBiaWdJbWFnZVVybDogZGF0YS5wcm9kX3NvdWNlX3VybCxcbiAgICAgICAgICAgICAgICAgICAgYmlnU3ByaXRlOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBpbWFnZVVybDogZGF0YS5wcm9kX2ltYWdlX3VybCxcbiAgICAgICAgICAgICAgICAgICAgc21hbGxTcHJpdGU6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIGV2ZW50OiBudWxsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgIHZhciBsb2FkSW1hZ2VDYWxsQmFjayA9IGZ1bmN0aW9uIChtZW51RGF0YSwgaW5kZXgsIGVycm9yLCBpbWFnZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvYWRJbWFnZUNvdW50Kys7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobG9hZEltYWdlQ291bnQgPCAyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5sb2FkSW1hZ2UobWVudURhdGEuc2FtbGxJbWFnZVVybCwgbG9hZEltYWdlQ2FsbEJhY2spO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgICAgIG1lbnVEYXRhLnNtYWxsU3ByaXRlID0gbmV3IEZpcmUuU3ByaXRlKGltYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhpZCwgaW5kZXgsIHBhZ2UsIG1lbnVEYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBsb2FkSW1hZ2VDb3VudCA9IDA7XG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMsIG1lbnVEYXRhLCBpbmRleCk7XG4gICAgICAgICAgICAgICAgLy8g5L+d5a2Y5pWw5o2uXG4gICAgICAgICAgICAgICAgZGF0YVNoZWV0cy5wdXNoKG1lbnVEYXRhKTtcbiAgICAgICAgICAgICAgICAvLyDliqDovb3lsI/lm75cbiAgICAgICAgICAgICAgICAvL3NlbGYubG9hZEltYWdlKGRhdGEucHJvZF9pbWFnZV91cmwsIGxvYWRJbWFnZUNhbGxCYWNrKTtcbiAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgIGluZGV4Kys7XG4gICAgICAgICAgICB9LmJpbmQodGhpcywgZGF0YVNoZWV0cykpO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIC8vIOmihOWKoOi9veS6jOe6p+Wll+ijheaVsOaNrlxuICAgIHByZWxvYWRTdWl0SXRlbXNEYXRhX1NlY29uZDogZnVuY3Rpb24gKGN1clBhZ2UsIGN1ckVhY2gsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBzZW5kRGF0YSA9IHtcbiAgICAgICAgICAgIHBhZ2U6IGN1clBhZ2UsXG4gICAgICAgICAgICBlYWNoOiAtMVxuICAgICAgICB9O1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHNlbGYubmV0V29ya01nci5SZXF1ZXN0U2V0SXRlbXNNZW51KHNlbmREYXRhLCBmdW5jdGlvbiAoc2VydmVyRGF0YSkge1xuICAgICAgICAgICAgaWYgKHNlcnZlckRhdGEuc3RhdHVzICE9PSAxMDAwMCkge1xuICAgICAgICAgICAgICAgIHNlbGYudGlwc1dpbmRvdy5vcGVuVGlwc1dpbmRvdyhzZXJ2ZXJEYXRhLmRlc2MpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIOWll+ijheaAu+aVsOmHj1xuICAgICAgICAgICAgc2VsZi5zdWl0SXRlbXNfVGhyZWVfVG90YWwgPSBwYXJzZUludChzZXJ2ZXJEYXRhLnRvdGFsKTtcbiAgICAgICAgICAgIGlmIChzZWxmLnN1aXRJdGVtc19UaHJlZV9Ub3RhbCA9PT0gMCAmJiBjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGluZGV4ID0gMDtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2VydmVyRGF0YS5saXN0Lmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRhdGEgPSBzZXJ2ZXJEYXRhLmxpc3RbaV07XG4gICAgICAgICAgICAgICAgdmFyIHNldERhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgIHRpZDogZGF0YS5wcm9kX3N1aXRpZCxcbiAgICAgICAgICAgICAgICAgICAgdG5hbWU6IGRhdGEucHJvZF9zdWl0bmFtZSxcbiAgICAgICAgICAgICAgICAgICAgdWlkOiBkYXRhLnByb2RfdWlkLFxuICAgICAgICAgICAgICAgICAgICBpbWFnZVVybDogZGF0YS5wcm9kX2ltZyxcbiAgICAgICAgICAgICAgICAgICAgcm9vbVR5cGU6IGRhdGEucHJvZF9yb29tdHlwZSxcbiAgICAgICAgICAgICAgICAgICAgcHJpY2U6IGRhdGEucHJvZF9wcmljZSxcbiAgICAgICAgICAgICAgICAgICAgc21hbGxTcHJpdGU6IG51bGxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHNlbGYuc3VpdEl0ZW1zX1NlY29uZF9EYXRhU2hlZXRzLnB1c2goc2V0RGF0YSk7XG4gICAgICAgICAgICAgICAgaW5kZXgrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICAvLyDliJ3lp4vljJbkuoznuqfoj5zljZXnianlk4Hmn5zmlbDmja5cbiAgICBpbml0QmFja3BhY2tEYXRhOiBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKHRoaXMuYmFja3BhY2tfU2Vjb25kX0RhdGFTaGVldHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciBkYXRhID0ge1xuICAgICAgICAgICAgdGlkOiAwLFxuICAgICAgICAgICAgdG5hbWU6ICfmiJHnmoTljZXlk4EnLFxuICAgICAgICAgICAgaXNkcmFnOiAyLFxuICAgICAgICAgICAgbG9jYWxQYXRoOiAnaXRlbXNDYWJpbmV0L3NpbmdsZS9zaW5nbGUnLFxuICAgICAgICAgICAgc21hbGxTcHJpdGU6IG51bGxcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5iYWNrcGFja19TZWNvbmRfRGF0YVNoZWV0cy5wdXNoKGRhdGEpO1xuICAgICAgICBkYXRhID0ge1xuICAgICAgICAgICAgdGlkOiAxLFxuICAgICAgICAgICAgdG5hbWU6ICfmiJHnmoTlpZfoo4UnLFxuICAgICAgICAgICAgaXNkcmFnOiAyLFxuICAgICAgICAgICAgbG9jYWxQYXRoOiAnaXRlbXNDYWJpbmV0L3NldC9zZXQnLFxuICAgICAgICAgICAgc21hbGxTcHJpdGU6IG51bGxcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5iYWNrcGFja19TZWNvbmRfRGF0YVNoZWV0cy5wdXNoKGRhdGEpO1xuICAgIH0sXG4gICAgLy8g5Yqg6L2954mp5ZOB5p+c5pWw5o2uXG4gICAgbG9hZEJhY2twYWNrRGF0YTogZnVuY3Rpb24gKGlkLCBwYWdlLCBlYWNobnVtLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHNlbGYuYmFja3BhY2tfVGhyZWVfRGF0YVNoZWV0c1tpZF0gPSBbXTtcbiAgICAgICAgLy8g5Y2V5ZOBXG4gICAgICAgIHZhciBzaW5nbGVDYWxsQmFjayA9IGZ1bmN0aW9uIChzZXJ2ZXJEYXRhKSB7XG4gICAgICAgICAgICBpZiAoc2VydmVyRGF0YS5zdGF0dXMgIT09IDEwMDAwKSB7XG4gICAgICAgICAgICAgICAgc2VsZi50aXBzV2luZG93Lm9wZW5UaXBzV2luZG93KHNlcnZlckRhdGEuZGVzYyk7XG4gICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrKXtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHRvdGFsID0gcGFyc2VJbnQoc2VydmVyRGF0YS50b3RhbCk7XG4gICAgICAgICAgICBzZWxmLmJhY2twYWNrX1RocmVlX1RvdGFsX1NoZWV0c1tpZF0gPSB0b3RhbDtcbiAgICAgICAgICAgIGlmICh0b3RhbCA9PT0gMCAmJiBjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2VydmVyRGF0YS5saXN0LmZvckVhY2goZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICB2YXIgbG9hY2xEYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICBwYWNrX2lkOiBkYXRhLnBhY2tfaWQsXG4gICAgICAgICAgICAgICAgICAgIHByb2RfdWlkOiBkYXRhLnByb2RfdWlkLFxuICAgICAgICAgICAgICAgICAgICBwcm9wc19pZDogZGF0YS5wcm9kX2lkLFxuICAgICAgICAgICAgICAgICAgICBzdGF0dXM6IGRhdGEuc3RhdHVzLFxuICAgICAgICAgICAgICAgICAgICBwcm9wc190eXBlOiBkYXRhLnByb2RfY2F0ZWdvcnksXG4gICAgICAgICAgICAgICAgICAgIGhhc0RyYWc6IGRhdGEucHJvZF9jYXRlZ29yeSA+IDIsXG4gICAgICAgICAgICAgICAgICAgIHByb3BzX25hbWU6IGRhdGEucHJvZF9uYW1lLFxuICAgICAgICAgICAgICAgICAgICBwcmljZTogZGF0YS5wcmljZSxcbiAgICAgICAgICAgICAgICAgICAgZGlzY291bnQ6IGRhdGEuZGlzY291bnQsXG4gICAgICAgICAgICAgICAgICAgIGltYWdlVXJsOiBkYXRhLnByb2RfaW1hZ2VfdXJsLFxuICAgICAgICAgICAgICAgICAgICBiaWdJbWFnZVVybDogZGF0YS5wcm9kX3NvdWNlX3VybCxcbiAgICAgICAgICAgICAgICAgICAgc21hbGxTcHJpdGU6IG51bGxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIC8vIOS/neWtmOaVsOaNrlxuICAgICAgICAgICAgICAgIHNlbGYuYmFja3BhY2tfVGhyZWVfRGF0YVNoZWV0c1tpZF0ucHVzaChsb2FjbERhdGEpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICAvLyDlpZfoo4VcbiAgICAgICAgdmFyIHN1aXRDYWxsQmFjayA9IGZ1bmN0aW9uIChzZXJ2ZXJEYXRhKSB7XG4gICAgICAgICAgICBpZiAoc2VydmVyRGF0YS5zdGF0dXMgIT09IDEwMDAwKSB7XG4gICAgICAgICAgICAgICAgc2VsZi50aXBzV2luZG93Lm9wZW5UaXBzV2luZG93KHNlcnZlckRhdGEuZGVzYyk7XG4gICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHRvdGFsID0gcGFyc2VJbnQoc2VydmVyRGF0YS50b3RhbCk7XG4gICAgICAgICAgICBzZWxmLmJhY2twYWNrX1RocmVlX1RvdGFsX1NoZWV0c1tpZF0gPSB0b3RhbDtcbiAgICAgICAgICAgIGlmICh0b3RhbCA9PT0gMCAmJiBjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2VydmVyRGF0YS5saXN0LmZvckVhY2goZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICB2YXIgbG9jYWxEYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICBzdWl0X2lkOiBkYXRhLnN1aXRfaWQsXG4gICAgICAgICAgICAgICAgICAgIHN1aXRfbmFtZTogZGF0YS5zdWl0X25hbWUsXG4gICAgICAgICAgICAgICAgICAgIHN0YXR1czogZGF0YS5zdGF0dXMsXG4gICAgICAgICAgICAgICAgICAgIGRyZXNzTGlzdDogZGF0YS5kcmVzc0xpc3QsXG4gICAgICAgICAgICAgICAgICAgIGltYWdlVXJsOiBkYXRhLnN1aXRfcGlnLFxuICAgICAgICAgICAgICAgICAgICBzbWFsbFNwcml0ZTogbnVsbFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgLy8g5L+d5a2Y5pWw5o2uXG4gICAgICAgICAgICAgICAgc2VsZi5iYWNrcGFja19UaHJlZV9EYXRhU2hlZXRzW2lkXS5wdXNoKGxvY2FsRGF0YSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHZhciBzZW5kRGF0YSA9IHtcbiAgICAgICAgICAgIHBhZ2U6IHBhZ2UsXG4gICAgICAgICAgICBlYWNobnVtOiAtMVxuICAgICAgICB9O1xuICAgICAgICBpZiAoaWQgPT09IDApIHtcbiAgICAgICAgICAgIHNlbGYubmV0V29ya01nci5SZXF1ZXN0QmFja3BhY2tTaW5nbGUoc2VuZERhdGEsIHNpbmdsZUNhbGxCYWNrKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHNlbGYubmV0V29ya01nci5SZXF1ZXN0QmFja3BhY2tTdWl0KHNlbmREYXRhLCBzdWl0Q2FsbEJhY2spO1xuICAgICAgICB9XG4gICAgfSxcbn0pO1xuXG5GaXJlLl9SRnBvcCgpOyIsIkZpcmUuX1JGcHVzaChtb2R1bGUsICcyYTNhM3B1S0pGRVpMY3F5LzF4a3NhcScsICdGYW1pbHlJbmZvJyk7XG4vLyBzY3JpcHRcXHZpbGxhXFxGYW1pbHlJbmZvLmpzXG5cbnZhciBDb21wID0gRmlyZS5DbGFzcyh7XG4gICAgLy8g57un5om/XG4gICAgZXh0ZW5kczogRmlyZS5Db21wb25lbnQsXG4gICAgLy8g5p6E6YCg5Ye95pWwXG4gICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8g5oi/6Ze05ZCN56ewXG4gICAgICAgIHRoaXMuZmxvb3JfbmFtZSA9ICcnO1xuICAgICAgICAvLyDmiL/pl7TnrYnnuqdcbiAgICAgICAgdGhpcy5ob3VzZV9ncmFkZSA9IDA7XG4gICAgICAgIC8vIOeIseS6uklEXG4gICAgICAgIHRoaXMubG92ZXJfaWQgPSAwO1xuICAgICAgICAvLyDniLHkurrlkI3np7BcbiAgICAgICAgdGhpcy5sb3Zlcl9uYW1lID0gJyc7XG4gICAgICAgIC8vIOeIseS6uuaAp+WIq1xuICAgICAgICB0aGlzLmxvdmVyX2dlbmRlciA9ICcnO1xuICAgICAgICAvLyDlhbPns7tcbiAgICAgICAgdGhpcy5yZWxhdGlvbl9uYW1lID0gJyc7XG4gICAgICAgIC8vIOagh+iusFxuICAgICAgICB0aGlzLm1hcmsgPSAnJztcbiAgICAgICAgLy8g5bGCSURcbiAgICAgICAgdGhpcy5zdG9yZXlfaWQgPSAwO1xuICAgICAgICAvL1xuICAgICAgICB0aGlzLmlzX2RlZmF1bHQgPSAnJztcbiAgICB9LFxuICAgIC8vIOWxnuaAp1xuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgLy8g5oi/5bGL562J57qnXG4gICAgICAgIGxldmVsOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5UZXh0XG4gICAgICAgIH0sXG4gICAgICAgIC8vIOaIv+S4u1xuICAgICAgICBob3VzZU93bmVyOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5UZXh0XG4gICAgICAgIH0sXG4gICAgICAgIC8vIOS4jlRB55qE5YWz57O7XG4gICAgICAgIHJlbGF0aW9uOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5UZXh0XG4gICAgICAgIH0sXG4gICAgICAgIC8vIOWKoOWFpeaIv+Wxi1xuICAgICAgICBidG5fZ29Ubzoge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuQnV0dG9uXG4gICAgICAgIH0sXG4gICAgICAgIC8vIOino+mZpOWFs+ezu1xuICAgICAgICBidG5fZGVsOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5CdXR0b25cbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy8g5pu05paw5oi/5bGL562J57qnXG4gICAgc2V0TGV2ZWw6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB0aGlzLmhvdXNlX2dyYWRlID0gdmFsdWU7XG4gICAgICAgIHRoaXMubGV2ZWwudGV4dCA9IHZhbHVlLnRvU3RyaW5nKCk7XG4gICAgfSxcbiAgICAvLyDmm7TmlrDmiL/kuLtcbiAgICBzZXRIb3VzZU93bmVyOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgdGhpcy5sb3Zlcl9uYW1lID0gdmFsdWU7XG4gICAgICAgIHRoaXMuaG91c2VPd25lci50ZXh0ID0gdmFsdWUudG9TdHJpbmcoKTtcbiAgICB9LFxuICAgIC8vIOabtOaWsOS4jlRB5YWz57O7XG4gICAgc2V0UmVsYXRpb246IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB0aGlzLnJlbGF0aW9uX25hbWUgPSB2YWx1ZTtcbiAgICAgICAgdGhpcy5yZWxhdGlvbi50ZXh0ID0gdmFsdWUudG9TdHJpbmcoKTtcbiAgICB9LFxuICAgIHJlZnJlc2g6IGZ1bmN0aW9uIChkYXRhLCBnb1RvRXZlbnQsIHJlbGlldmVFdmVudCkge1xuICAgICAgICB0aGlzLmJ0bl9nb1RvLm9uQ2xpY2sgPSBnb1RvRXZlbnQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5idG5fZ29Uby5vbkNsaWNrID0gcmVsaWV2ZUV2ZW50LmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuc2V0TGV2ZWwoZGF0YS5ob3VzZV9ncmFkZSB8fCAxKTtcbiAgICAgICAgdGhpcy5zZXRIb3VzZU93bmVyKGRhdGEubG92ZXJfbmFtZSB8fCAn5pegJyk7XG4gICAgICAgIHRoaXMuc2V0UmVsYXRpb24oZGF0YS5yZWxhdGlvbl9uYW1lIHx8ICfml6AnKTtcbiAgICAgICAgdGhpcy5tYXJrID0gZGF0YS5tYXJrIHx8IDA7XG4gICAgICAgIHRoaXMubG92ZXJfaWQgPSBkYXRhLmxvdmVyX2lkIHx8IDA7XG4gICAgICAgIHRoaXMubG92ZXJfZ2VuZGVyID0gZGF0YS5sb3Zlcl9nZW5kZXIgfHwgMDtcbiAgICAgICAgdGhpcy5zdG9yZXlfaWQgPSBkYXRhLnN0b3JleV9pZCAgfHwgMDtcbiAgICAgICAgdGhpcy5mbG9vcl9uYW1lID0gZGF0YS5mbG9vcl9uYW1lIHx8ICfml6AnO1xuICAgICAgICB0aGlzLmlzX2RlZmF1bHQgPSBkYXRhLmlzX2RlZmF1bHQgfHwgJyc7XG4gICAgICAgIHRoaXMuYnRuX2dvVG8ub25DbGljayA9IGdvVG9FdmVudDtcbiAgICAgICAgdGhpcy5idG5fZGVsLmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgaWYgKHRoaXMubG92ZXJfaWQgIT09IDApIHtcbiAgICAgICAgICAgIHRoaXMuYnRuX2RlbC5vbkNsaWNrID0gcmVsaWV2ZUV2ZW50O1xuICAgICAgICAgICAgdGhpcy5idG5fZGVsLmVudGl0eS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxufSk7XG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJzkwNGU2Z2Vmc2hNazc5SHBZYXdhSndoJywgJ0ZpcnN0TWVudU1ncicpO1xuLy8gc2NyaXB0XFx2aWxsYVxcRmlyc3RNZW51TWdyLmpzXG5cbi8vIOS4gOe6p+iPnOWNle+8iOWNleWTgS/lpZfoo4Uv54mp5ZOB5p+c77yJXG52YXIgRmlyc3RNZW51TWdyID0gRmlyZS5DbGFzcyh7XG4gICAgLy8g57un5om/XG4gICAgZXh0ZW5kczogRmlyZS5Db21wb25lbnQsXG4gICAgLy8g5p6E6YCg5Ye95pWwXG4gICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8g6I+c5Y2V5YiX6KGoXG4gICAgICAgIHRoaXMuX21lbnVMaXN0ID0gW107XG4gICAgfSxcbiAgICAvLyDlsZ7mgKdcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIG1hcmdpbjoge1xuICAgICAgICAgICAgZGVmYXVsdDogRmlyZS52MigwLCAxMDApXG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIOmHjee9rlRvZ2dsZeeKtuaAgVxuICAgIG1vZGlmeVRvZ2dsZTogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgY2hpbGQsIHRvZ2dsZTtcbiAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMuX21lbnVMaXN0Lmxlbmd0aCA7KytpKSB7XG4gICAgICAgICAgICBjaGlsZCA9IHRoaXMuX21lbnVMaXN0W2ldO1xuICAgICAgICAgICAgdG9nZ2xlID0gY2hpbGQuZ2V0Q29tcG9uZW50KCdUb2dnbGUnKTtcbiAgICAgICAgICAgIHRvZ2dsZS5yZXNldFRvZ2dsZSgpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyDmiZPlvIDkuoznuqfoj5zljZVcbiAgICBfb25PcGVuU2Vjb25kTWVudUV2ZW50OiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgdGhpcy5tb2RpZnlUb2dnbGUoKTtcbiAgICAgICAgdmFyIGlkID0gcGFyc2VJbnQoZXZlbnQudGFyZ2V0Lm5hbWUpO1xuICAgICAgICB0aGlzLmRhdGFCYXNlLnNlY29uZE1lbnVNZ3Iub3Blbk1lbnUoaWQpO1xuICAgIH0sXG4gICAgLy8g5omT5byA5LqM57qn6I+c5Y2VXG4gICAgX29uUmVtb3ZlU2NyZWVuRXZlbnQ6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHNlbGYuZGF0YUJhc2UudGlwc1dpbmRvdy5vcGVuVGlwc1dpbmRvdygn5piv5ZCm5riF56m65Zy65pmv77yfJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS5yZXNldFNjcmVlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS5zZWNvbmRNZW51TWdyLmNsb3NlTWVudSh0cnVlKTtcbiAgICAgICAgICAgICAgICBzZWxmLmRhdGFCYXNlLnRocmVlTWVudU1nci5jbG9zZU1lbnUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS5sb2FkVGlwcy5vcGVuVGlwcygn5Yid5aeL5YyW5Zy65pmv77yBJyk7XG4gICAgICAgICAgICAgICAgdmFyIHNlbmREYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICBtYXJrOiBzZWxmLmRhdGFCYXNlLm1hcmssXG4gICAgICAgICAgICAgICAgICAgIGNsZWFyOiAxXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBzZWxmLmRhdGFCYXNlLmludG9Sb29tKHNlbmREYXRhLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UubG9hZFRpcHMuY2xvc2VUaXBzKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICAvLyDojrflj5boj5zljZXmjInpkq7lubbkuJTnu5Hlrprkuovku7ZcbiAgICBfaW5pdE1lbnU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB2YXIgY2hpbGRyZW4gPSB0aGlzLmVudGl0eS5nZXRDaGlsZHJlbigpO1xuICAgICAgICBzZWxmLl9tZW51TGlzdCA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAvLyDnu5HlrprmjInpkq7kuovku7ZcbiAgICAgICAgICAgIGlmIChpID09PSAxKSB7XG4gICAgICAgICAgICAgICAgdmFyIGJ0biA9IGNoaWxkcmVuW2ldLmdldENvbXBvbmVudChGaXJlLlVJQnV0dG9uKTtcbiAgICAgICAgICAgICAgICBidG4ub25DbGljayA9IHNlbGYuX29uUmVtb3ZlU2NyZWVuRXZlbnQuYmluZChzZWxmKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciB0b2dnbGUgPSBjaGlsZHJlbltpXS5nZXRDb21wb25lbnQoJ1RvZ2dsZScpO1xuICAgICAgICAgICAgICAgIHRvZ2dsZS5vbkNsaWNrID0gc2VsZi5fb25PcGVuU2Vjb25kTWVudUV2ZW50LmJpbmQoc2VsZik7XG4gICAgICAgICAgICAgICAgc2VsZi5fbWVudUxpc3QucHVzaCh0b2dnbGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyDmiZPlvIDkuIDnuqfoj5zljZVcbiAgICBvcGVuTWVudTogZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5lbnRpdHkuYWN0aXZlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5lbnRpdHkuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5fbWVudUxpc3RbMF0uZGVmYXVsdFRvZ2dsZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLmRhdGFCYXNlLnNlY29uZE1lbnVNZ3Iub3Blbk1lbnUoMCk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfSxcbiAgICAvLyDlhbPpl61cbiAgICBjbG9zZU1lbnU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5lbnRpdHkuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuZGF0YUJhc2Uuc2Vjb25kTWVudU1nci5jbG9zZU1lbnUodHJ1ZSk7XG4gICAgICAgIHRoaXMuZGF0YUJhc2UudGhyZWVNZW51TWdyLmNsb3NlTWVudSh0cnVlKTtcbiAgICB9LFxuICAgIC8vIOW8gOWni1xuICAgIHN0YXJ0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIOW4uOeUqOeahOWPmOmHjy/mlbDmja5cbiAgICAgICAgdmFyIGdhbWVEYXRhRW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL0RhdGFCYXNlJyk7XG4gICAgICAgIHRoaXMuZGF0YUJhc2UgPSBnYW1lRGF0YUVudC5nZXRDb21wb25lbnQoJ0RhdGFCYXNlJyk7XG4gICAgICAgIC8vIOS6jOe6p+iPnOWNlVxuICAgICAgICB0aGlzLnNlY29uZE1lbnVNZ3IgPSB0aGlzLmRhdGFCYXNlLnNlY29uZE1lbnVNZ3I7XG4gICAgICAgIC8vIOiOt+WPluiPnOWNleaMiemSruW5tuS4lOe7keWumuS6i+S7tlxuICAgICAgICB0aGlzLl9pbml0TWVudSgpO1xuICAgIH0sXG4gICAgLy8g5pu05pawXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBjYW1lcmEgPSBGaXJlLkNhbWVyYS5tYWluO1xuICAgICAgICB2YXIgc2NyZWVuU2l6ZSA9IEZpcmUuU2NyZWVuLnNpemUubXVsKGNhbWVyYS5zaXplIC8gRmlyZS5TY3JlZW4uaGVpZ2h0KTtcbiAgICAgICAgdmFyIG5ld1BvcyA9IEZpcmUudjIodGhpcy5tYXJnaW4ueCwgLXNjcmVlblNpemUueSAvIDIgKyB0aGlzLm1hcmdpbi55KTtcbiAgICAgICAgdGhpcy5lbnRpdHkudHJhbnNmb3JtLnBvc2l0aW9uID0gbmV3UG9zO1xuICAgIH1cbn0pO1xuXG5GaXJlLl9SRnBvcCgpOyIsIkZpcmUuX1JGcHVzaChtb2R1bGUsICcyYzA2OURjdm9WTlM2bStCQStDZElxZycsICdGbG9vcldpbmRvdycpO1xuLy8gc2NyaXB0XFx2aWxsYVxcRmxvb3JXaW5kb3cuanNcblxuLy8g5qW85bGC5YiH5o2i56qX5Y+jXG52YXIgRmxvb3JXaW5kb3cgPSBGaXJlLkNsYXNzKHtcbiAgICAvLyDnu6fmib9cbiAgICBleHRlbmRzOiBGaXJlLkNvbXBvbmVudCxcbiAgICAvLyDmnoTpgKDlh73mlbBcbiAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLl9teUZhbWlseURhdGFTaGVldHMgPSBbXTtcbiAgICAgICAgdGhpcy5fYWRkTXlGYW1pbHlEYXRhU2hlZXRzID0gW107XG4gICAgICAgIC8vIOavj+mhteaYvuekuuWkmuWwkeS4qlxuICAgICAgICB0aGlzLl9zaG93UGFnZUNvdW50ID0gNztcbiAgICAgICAgLy8g5oC75pWwXG4gICAgICAgIHRoaXMuX2N1clRvdGFsID0gMDtcbiAgICAgICAgLy8g5b2T5YmN6aG15pWwXG4gICAgICAgIHRoaXMuX2N1clBhZ2UgPSAxO1xuICAgICAgICAvLyDmnIDlpKfpobXmlbBcbiAgICAgICAgdGhpcy5fbWF4UGFnZSA9IDE7XG4gICAgICAgIC8vIOexu+WeiyAw77ya5oiR55qE5a625bqt5oiQ5ZGYIDHvvJrmiJHliqDlhaXnmoTlrrbluq1cbiAgICAgICAgdGhpcy5mbG9vclR5cGUgPSAwO1xuICAgIH0sXG4gICAgLy8g5bGe5oCnXG4gICAgcHJvcGVydGllczoge1xuICAgICAgICAvLyDmiJHnmoTlrrbluq3miJDlkZjliIfmjaLmjInpkq5cbiAgICAgICAgYnRuX215RmFtaWx5OiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5Ub2dnbGVcbiAgICAgICAgfSxcbiAgICAgICAgLy8g5oiR5Yqg5YWl55qE5a625bqt5YiH5o2i5oyJ6ZKuXG4gICAgICAgIGJ0bl9teUFkZEZhbWlseToge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVG9nZ2xlXG4gICAgICAgIH0sXG4gICAgICAgIC8vIOWFs+mXreaMiemSrlxuICAgICAgICBidG5fY2xvc2U6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlVJQnV0dG9uXG4gICAgICAgIH0sXG4gICAgICAgIC8vIOS4iuS4gOmhtVxuICAgICAgICBidG5fTGVmdDoge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVUlCdXR0b25cbiAgICAgICAgfSxcbiAgICAgICAgLy8g5LiL5LiA6aG1XG4gICAgICAgIGJ0bl9SaWdodDoge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVUlCdXR0b25cbiAgICAgICAgfSxcbiAgICAgICAgcGFnZVRleHQ6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlRleHRcbiAgICAgICAgfSxcbiAgICAgICAgLy8g5aS06IqC54K5XG4gICAgICAgIHJvb3Q6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLkVudGl0eVxuICAgICAgICB9LFxuICAgICAgICAvLyDliqDlhaXlrrbluq3nmoTmoIfpophcbiAgICAgICAgYWRkRmFtaWx5VGl0bGU6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLkVudGl0eVxuICAgICAgICB9LFxuICAgICAgICAvLyDmiJHnmoTlrrbluq3nmoTmoIfpophcbiAgICAgICAgbXlGYW1pbHk6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLkVudGl0eVxuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyDlhbPpl63nqpflj6NcbiAgICBjbG9zZVdpbmRvdzogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5yZXNldERhdGEoKTtcbiAgICAgICAgdGhpcy5tb2RpZnlUb2dnbGUoKTtcbiAgICB9LFxuICAgIC8vIOaJk+W8gOeql+WPo+aJk+W8gOeql+WPo1xuICAgIG9wZW5XaW5kb3c6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5lbnRpdHkuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBzZWxmLmRhdGFCYXNlLmxvYWRUaXBzLm9wZW5UaXBzKCfovb3lhaXmlbDmja7vvIHor7fnqI3lkI4uLi4nKTtcbiAgICAgICAgc2VsZi5kYXRhQmFzZS5uZXRXb3JrTWdyLlJlcXVlc3RGbG9vckxpc3QoZnVuY3Rpb24gKHNlcnZlckRhdGEpIHtcbiAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UubG9hZFRpcHMuY2xvc2VUaXBzKCk7XG4gICAgICAgICAgICBpZiAoIUZpcmUuRW5naW5lLmlzUGxheWluZykge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNlbGYucmVmcmVzaEZsb29yRGF0YShzZXJ2ZXJEYXRhLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5fc3dpdGNoaW5nRGF0YSgwKTtcbiAgICAgICAgICAgICAgICBzZWxmLmJ0bl9teUZhbWlseS5kZWZhdWx0VG9nZ2xlKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICAvL1xuICAgIHJlZnJlc2hGbG9vckRhdGE6IGZ1bmN0aW9uIChzZXJ2ZXJEYXRhLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIGlmIChzZXJ2ZXJEYXRhLnN0YXR1cyAhPT0gMTAwMDApIHtcbiAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UudGlwc1dpbmRvdy5vcGVuVGlwc1dpbmRvdyhzZXJ2ZXJEYXRhLmRlc2MpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHNlbGYuX215RmFtaWx5RGF0YVNoZWV0cyA9IFtdO1xuICAgICAgICBzZXJ2ZXJEYXRhLmxpc3QubXlmbG9vci5mb3JFYWNoKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICBzZWxmLl9teUZhbWlseURhdGFTaGVldHMucHVzaChkYXRhKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHNlbGYuX2FkZE15RmFtaWx5RGF0YVNoZWV0cyA9IFtdO1xuICAgICAgICBzZXJ2ZXJEYXRhLmxpc3QubXlsaXZlZC5mb3JFYWNoKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICBzZWxmLl9hZGRNeUZhbWlseURhdGFTaGVldHMucHVzaChkYXRhKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy8g5YWz6Zet5oyJ6ZKu5LqL5Lu2XG4gICAgX29uQ2xvc2VXaW5kb3dFdmVudDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmNsb3NlV2luZG93KCk7XG4gICAgfSxcbiAgICAvLyDov5jljp9cbiAgICBtb2RpZnlUb2dnbGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5idG5fbXlGYW1pbHkucmVzZXRDb2xvcigpO1xuICAgICAgICB0aGlzLmJ0bl9teUFkZEZhbWlseS5yZXNldENvbG9yKCk7XG4gICAgfSxcbiAgICAvLyDliIfmjaLliLDmiJHnmoTlrrbluq3miJDlkZhcbiAgICBfb25NeUZhbWlseUV2ZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMubXlGYW1pbHkuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5hZGRGYW1pbHlUaXRsZS5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fc3dpdGNoaW5nRGF0YSgwKTtcbiAgICB9LFxuICAgIC8vIOaIkeWKoOWFpeeahOWutuW6rVxuICAgIF9vbk15QWRkRmFtaWx5RXZlbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5teUZhbWlseS5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5hZGRGYW1pbHlUaXRsZS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICB0aGlzLl9zd2l0Y2hpbmdEYXRhKDEpO1xuICAgIH0sXG4gICAgLy8g6YeN572uXG4gICAgcmVzZXREYXRhOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBjaGlsZHJlbiA9IHRoaXMucm9vdC5nZXRDaGlsZHJlbigpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBjaGlsZHJlbltpXS5kZXN0cm95KCk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIOi/m+WFpeaIv+Wxi1xuICAgIF9vbkdvVG9Ib3VzZUV2ZW50OiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgdGhpcy5jbG9zZVdpbmRvdygpO1xuICAgICAgICB2YXIgZmFtaWx5SW5mbyA9IGV2ZW50LnRhcmdldC5wYXJlbnQuZ2V0Q29tcG9uZW50KCdGYW1pbHlJbmZvJyk7XG4gICAgICAgIHZhciBzZW5kRGF0YSA9IHtcbiAgICAgICAgICAgIGhvdXNlX3VpZDogMCxcbiAgICAgICAgICAgIGZsb29yX2lkOiAwLFxuICAgICAgICAgICAgbWFyazogZmFtaWx5SW5mby5tYXJrXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuZGF0YUJhc2Uuc3dpdGNoUm9vbVdpbi5vcGVuV2luZG93KDEsIHNlbmREYXRhKTtcbiAgICB9LFxuICAgIC8vIOino+mZpOWFs+ezu1xuICAgIF9vblJlbGlldmVFdmVudDogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgaWYgKHNlbGYucmVsaWV2ZWluZykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciBmYW1pbHlJbmZvID0gZXZlbnQudGFyZ2V0LnBhcmVudC5nZXRDb21wb25lbnQoJ0ZhbWlseUluZm8nKTtcbiAgICAgICAgc2VsZi5kYXRhQmFzZS50aXBzV2luZG93Lm9wZW5UaXBzV2luZG93KFwi5piv5ZCm5LiOIFwiICsgZmFtaWx5SW5mby5sb3Zlcl9uYW1lICsgXCIg6Kej6Zmk5YWz57O7P1wiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzZWxmLnJlbGlldmVpbmcgPSB0cnVlO1xuICAgICAgICAgICAgdmFyIHNlbmREYXRhID0ge1xuICAgICAgICAgICAgICAgIG1hcms6IGZhbWlseUluZm8ubWFya1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UubmV0V29ya01nci5SZXF1ZXN0RGlzYXNzb2NpYXRlTGlzdChzZW5kRGF0YSwgZnVuY3Rpb24gKHNlcnZlckRhdGEpIHtcbiAgICAgICAgICAgICAgICBpZiAoc2VydmVyRGF0YS5zdGF0dXMgPT09IDEwMDAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYucmVmcmVzaEZsb29yRGF0YShzZXJ2ZXJEYXRhLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLl9zd2l0Y2hpbmdEYXRhKHNlbGYuZmxvb3JUeXBlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYucmVsaWV2ZWluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYudGlwc1dpbmRvdy5vcGVuVGlwc1dpbmRvdyhzZXJ2ZXJEYXRhLmRlc2MpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIC8vIOmHjee9rumhteaVsFxuICAgIF9zd2l0Y2hpbmdEYXRhOiBmdW5jdGlvbiAodHlwZSkge1xuICAgICAgICB0aGlzLm1vZGlmeVRvZ2dsZSgpO1xuICAgICAgICB0aGlzLmZsb29yVHlwZSA9IHR5cGU7XG4gICAgICAgIHRoaXMuX2N1clBhZ2UgPSAxO1xuICAgICAgICB0aGlzLl9tYXhQYWdlID0gMTtcbiAgICAgICAgaWYgKHR5cGUgPT09IDApe1xuICAgICAgICAgICAgdGhpcy5idG5fbXlGYW1pbHkuZGVmYXVsdFRvZ2dsZSgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5idG5fbXlBZGRGYW1pbHkuZGVmYXVsdFRvZ2dsZSgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY3JlYXRlRmFtaWx5SW5mbygpO1xuICAgIH0sXG4gICAgLy9cbiAgICBjcmVhdGVGYW1pbHlJbmZvOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMucmVzZXREYXRhKCk7XG4gICAgICAgIHZhciBkYXRhU2hlZXRzID0gbnVsbDtcbiAgICAgICAgaWYgKHRoaXMuZmxvb3JUeXBlID09PSAwKSB7XG4gICAgICAgICAgICBkYXRhU2hlZXRzID0gdGhpcy5fbXlGYW1pbHlEYXRhU2hlZXRzO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgZGF0YVNoZWV0cyA9IHRoaXMuX2FkZE15RmFtaWx5RGF0YVNoZWV0cztcbiAgICAgICAgfVxuICAgICAgICB2YXIgYmluZEdvdEhvdXNlRXZlbnQgPSB0aGlzLl9vbkdvVG9Ib3VzZUV2ZW50LmJpbmQodGhpcyk7XG4gICAgICAgIHZhciBiaW5kUmVsaWV2ZUV2ZW50ID0gdGhpcy5fb25SZWxpZXZlRXZlbnQuYmluZCh0aGlzKTtcbiAgICAgICAgLy9cbiAgICAgICAgdGhpcy5fY3VyVG90YWwgPSBkYXRhU2hlZXRzLmxlbmd0aDtcbiAgICAgICAgdGhpcy5fbWF4UGFnZSA9IE1hdGguY2VpbCh0aGlzLl9jdXJUb3RhbCAvIHRoaXMuX3Nob3dQYWdlQ291bnQpO1xuICAgICAgICBpZiAodGhpcy5fbWF4UGFnZSA9PT0gMCkge1xuICAgICAgICAgICAgdGhpcy5fbWF4UGFnZSA9IDE7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHN0YXJ0Q291bnQgPSAodGhpcy5fY3VyUGFnZSAtIDEpICogdGhpcy5fc2hvd1BhZ2VDb3VudDtcbiAgICAgICAgdmFyIGVudENvdW50ID0gc3RhcnRDb3VudCArIHRoaXMuX3Nob3dQYWdlQ291bnQ7XG4gICAgICAgIGlmIChlbnRDb3VudCA+IHRoaXMuX2N1clRvdGFsKSB7XG4gICAgICAgICAgICBlbnRDb3VudCA9IHRoaXMuX2N1clRvdGFsO1xuICAgICAgICB9XG4gICAgICAgIHZhciBpbmRleCA9IDA7XG4gICAgICAgIGZvciAodmFyIGkgPSBzdGFydENvdW50OyBpIDwgZW50Q291bnQ7ICsraSkge1xuICAgICAgICAgICAgdmFyIGRhdGEgPSBkYXRhU2hlZXRzW2ldO1xuICAgICAgICAgICAgdmFyIGVudCA9IEZpcmUuaW5zdGFudGlhdGUodGhpcy5kYXRhQmFzZS50ZW1wRmFtaWx5SW5mbyk7XG4gICAgICAgICAgICBlbnQubmFtZSA9IGkudG9TdHJpbmcoKTtcbiAgICAgICAgICAgIGVudC5wYXJlbnQgPSB0aGlzLnJvb3Q7XG4gICAgICAgICAgICBlbnQuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgICAgIGVudC50cmFuc2Zvcm0ucG9zaXRpb24gPSBuZXcgRmlyZS5WZWMyKC0yLjUsIDE4OCAtIChpbmRleCAqIDc3KSk7XG4gICAgICAgICAgICB2YXIgaW5mbyA9IGVudC5nZXRDb21wb25lbnQoJ0ZhbWlseUluZm8nKTtcbiAgICAgICAgICAgIGluZm8ucmVmcmVzaChkYXRhLCBiaW5kR290SG91c2VFdmVudCwgYmluZFJlbGlldmVFdmVudCk7XG4gICAgICAgICAgICBpbmRleCsrO1xuICAgICAgICB9XG4gICAgICAgIC8vIOWIt+aWsOaMiemSrueKtuaAgVxuICAgICAgICB0aGlzLl9yZWZyZXNoQnRuU3RhdGUoKTtcbiAgICB9LFxuICAgIC8vIOWIt+aWsOaMiemSrueKtuaAgVxuICAgIF9yZWZyZXNoQnRuU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5idG5fTGVmdC5lbnRpdHkuYWN0aXZlID0gdGhpcy5fY3VyUGFnZSA+IDE7XG4gICAgICAgIHRoaXMuYnRuX1JpZ2h0LmVudGl0eS5hY3RpdmUgPSB0aGlzLl9jdXJQYWdlIDwgdGhpcy5fbWF4UGFnZTtcbiAgICAgICAgdGhpcy5wYWdlVGV4dC50ZXh0ID0gJ+mhteaVsDonICsgdGhpcy5fY3VyUGFnZSArIFwiL1wiICsgdGhpcy5fbWF4UGFnZTtcbiAgICB9LFxuICAgIC8vIOS4i+S4gOmhtVxuICAgIF9vbk5leHRQYWdlRXZuZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5fY3VyUGFnZSAtPSAxO1xuICAgICAgICBpZiAodGhpcy5fY3VyUGFnZSA8IDEpe1xuICAgICAgICAgICAgdGhpcy5fY3VyUGFnZSA9IDE7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jcmVhdGVGYW1pbHlJbmZvKCk7XG4gICAgfSxcbiAgICAvLyDkuIrkuIDpobVcbiAgICBfb25QcmV2aW91c1BhZ2VFdmVudDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLl9jdXJQYWdlICs9IDE7XG4gICAgICAgIGlmICh0aGlzLl9jdXJQYWdlID4gdGhpcy5fbWF4UGFnZSl7XG4gICAgICAgICAgICB0aGlzLl9jdXJQYWdlID0gdGhpcy5fbWF4UGFnZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNyZWF0ZUZhbWlseUluZm8oKTtcbiAgICB9LFxuICAgIC8vIOW8gOWni1xuICAgIHN0YXJ0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIOW4uOeUqOeahOWPmOmHjy/mlbDmja5cbiAgICAgICAgdmFyIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9EYXRhQmFzZScpO1xuICAgICAgICB0aGlzLmRhdGFCYXNlID0gZW50LmdldENvbXBvbmVudCgnRGF0YUJhc2UnKTtcbiAgICAgICAgLy9cbiAgICAgICAgdGhpcy5hZGRGYW1pbHlUaXRsZS5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5teUZhbWlseS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICAvL1xuICAgICAgICB0aGlzLmJ0bl9jbG9zZS5vbkNsaWNrID0gdGhpcy5fb25DbG9zZVdpbmRvd0V2ZW50LmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuYnRuX215RmFtaWx5Lm9uQ2xpY2sgPSB0aGlzLl9vbk15RmFtaWx5RXZlbnQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5idG5fbXlBZGRGYW1pbHkub25DbGljayA9IHRoaXMuX29uTXlBZGRGYW1pbHlFdmVudC5iaW5kKHRoaXMpO1xuICAgICAgICAvL1xuICAgICAgICB0aGlzLmJ0bl9MZWZ0Lm9uQ2xpY2sgPSB0aGlzLl9vbk5leHRQYWdlRXZuZXQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5idG5fUmlnaHQub25DbGljayA9IHRoaXMuX29uUHJldmlvdXNQYWdlRXZlbnQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5idG5fTGVmdC5lbnRpdHkuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuYnRuX1JpZ2h0LmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcbiAgICB9XG59KTtcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnMGI4YzZZcWRhMUZIYnhEME9FMUJGdnYnLCAnRnVybml0dXJlJyk7XG4vLyBzY3JpcHRcXHZpbGxhXFxGdXJuaXR1cmUuanNcblxudmFyIEZ1cm5pdHVyZSA9IEZpcmUuQ2xhc3Moe1xuICAgIC8vIOe7p+aJv1xuICAgIGV4dGVuZHM6IEZpcmUuQ29tcG9uZW50LFxuICAgIC8vIOaehOmAoOWHveaVsFxuICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuX3JlbmRlcmVyID0gbnVsbDtcbiAgICAgICAgdGhpcy5zbWFsbFNwcml0ZSA9IG51bGw7XG4gICAgICAgIHRoaXMubWVudURhdGEgPSBudWxsO1xuICAgIH0sXG4gICAgLy8g5bGe5oCnXG4gICAgcHJvcGVydGllczoge1xuICAgICAgICAvLyDlkI3np7BcbiAgICAgICAgcHJvcHNfbmFtZTogJycsXG4gICAgICAgIC8vIOeJqeWTgUlEXG4gICAgICAgIHByb3BzX2lkOiAtMSxcbiAgICAgICAgLy8g54mp5ZOBVUlEXG4gICAgICAgIHByb3BzX3VpZDogLTEsXG4gICAgICAgIC8vIOiDjOWMhUlEXG4gICAgICAgIHBhY2tfaWQ6IC0xLFxuICAgICAgICAvLyDlpZfoo4VJRFxuICAgICAgICBzdWl0X2lkOiAtMSxcbiAgICAgICAgLy8g57G75Z6LXG4gICAgICAgIHByb3BzX3R5cGU6IC0xLFxuICAgICAgICAvLyDku7fmoLxcbiAgICAgICAgcHJpY2U6IC0xLFxuICAgICAgICAvLyDmipjmiaNcbiAgICAgICAgZGlzY291bnQ6IDEsXG4gICAgICAgIC8vIOWbvueJh+eahHVybFxuICAgICAgICBpbWFnZVVybDogJycsXG4gICAgICAgIC8vIOi9veWFpeaXtueahOWbvueJh1xuICAgICAgICBkZWZhdWx0U3ByaXRlOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5TcHJpdGVcbiAgICAgICAgfSxcbiAgICAgICAgZGVmYXVsdExvYWRBbmltOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5BbmltYXRpb25cbiAgICAgICAgfSxcbiAgICAgICAgcmVuZGVyZXI6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlNwcml0ZVJlbmRlcmVyXG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIOiuvue9rum7mOiupOWbvueJh1xuICAgIHNhdmVEZWZhdWx0U3ByaXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuZGVmYXVsdFNwcml0ZSA9IHRoaXMucmVuZGVyZXIuc3ByaXRlO1xuICAgIH0sXG4gICAgLy8g6I635Y+W5b2T5YmN5Zu+54mHXG4gICAgZ2V0UmVuZGVyU3ByaXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlbmRlcmVyLnNwcml0ZTtcbiAgICB9LFxuICAgIC8vIOiuvue9ruagh+iusFxuICAgIHNldE1hcmtVc2U6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICBpZiAodGhpcy5tZW51RGF0YSkge1xuICAgICAgICAgICAgdGhpcy5tZW51RGF0YS5zZXRNYXJrVXNlKHZhbHVlKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy8g6K6+572u5Zu+54mHXG4gICAgc2V0U3ByaXRlOiBmdW5jdGlvbiAobmV3U3ByaXRlKSB7XG4gICAgICAgIHRoaXMucmVuZGVyZXIuc3ByaXRlID0gbmV3U3ByaXRlO1xuICAgICAgICB0aGlzLnJlbmRlcmVyLnNwcml0ZS5waXhlbExldmVsSGl0VGVzdCA9IHRydWU7XG4gICAgfSxcbiAgICAvLyDorr7nva7lrrblhbfmlbDmja5cbiAgICBzZXRGdXJuaXR1cmVEYXRhOiBmdW5jdGlvbiAoZGF0YSwgaGFzQmdBbmRHZCkge1xuICAgICAgICBpZiAoISB0aGlzLmRhdGFCYXNlKSB7XG4gICAgICAgICAgICAvLyDluLjnlKjnmoTlj5jph48v5pWw5o2uXG4gICAgICAgICAgICB2YXIgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL0RhdGFCYXNlJyk7XG4gICAgICAgICAgICB0aGlzLmRhdGFCYXNlID0gZW50LmdldENvbXBvbmVudCgnRGF0YUJhc2UnKTtcbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICBpZiAodGhpcy5kZWZhdWx0TG9hZEFuaW0pIHtcbiAgICAgICAgICAgICAgICB2YXIgc3RhdGUgPSB0aGlzLmRlZmF1bHRMb2FkQW5pbS5wbGF5KCdsb2FkaW5nJyk7XG4gICAgICAgICAgICAgICAgc3RhdGUud3JhcE1vZGUgPSBGaXJlLldyYXBNb2RlLkxvb3A7XG4gICAgICAgICAgICAgICAgc3RhdGUucmVwZWF0Q291bnQgPSBJbmZpbml0eTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLnByb3BzX25hbWUgPSBkYXRhLnByb3BzX25hbWUgfHwgZGF0YS5wcm9wc05hbWU7XG4gICAgICAgIHRoaXMucHJvcHNfaWQgPSBkYXRhLnByb3BzX2lkIHx8IGRhdGEuaWQ7XG4gICAgICAgIHRoaXMucHJvcHNfdWlkID0gIGRhdGEucHJvcHNfdWlkIHx8IGRhdGEucHJvZF91aWQgfHwgMDtcbiAgICAgICAgdGhpcy5wcm9wc190eXBlID0gZGF0YS5wcm9wc190eXBlIHx8IGRhdGEucHJvcHNUeXBlO1xuICAgICAgICB0aGlzLnBhY2tfaWQgPSBkYXRhLnBhY2tfaWQgfHwgMDtcbiAgICAgICAgdGhpcy5zdWl0X2lkID0gZGF0YS5zdWl0X2lkO1xuICAgICAgICB0aGlzLnByaWNlID0gZGF0YS5wcmljZSB8fCAwO1xuICAgICAgICB0aGlzLmRpc2NvdW50ID0gZGF0YS5kaXNjb3VudCB8fCAxO1xuICAgICAgICB0aGlzLmltYWdlVXJsID0gZGF0YS5iaWdJbWFnZVVybCB8fCBkYXRhLmltZ1VybDtcbiAgICAgICAgdGhpcy5zbWFsbFNwcml0ZSA9IGRhdGEuc21hbGxTcHJpdGUgfHwgbnVsbDtcblxuICAgICAgICB0aGlzLmVudGl0eS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICBpZiAoISBoYXNCZ0FuZEdkKSB7XG4gICAgICAgICAgICB0aGlzLnJlbmRlcmVyLmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICAgIHRoaXMuZGVmYXVsdExvYWRBbmltLmVudGl0eS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5kZWZhdWx0TG9hZEFuaW0ucGxheSgnbG9hZGluZycpO1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS5sb2FkSW1hZ2Uoc2VsZi5pbWFnZVVybCwgZnVuY3Rpb24gKGRhdGEsIGVycm9yLCBpbWFnZSkge1xuICAgICAgICAgICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc3ByaXRlID0gbmV3IEZpcmUuU3ByaXRlKGltYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5zZXRTcHJpdGUoc3ByaXRlKTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5kZWZhdWx0TG9hZEFuaW0uZW50aXR5LmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbmRlcmVyLmVudGl0eS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0uYmluZCh0aGlzLCBkYXRhKSk7XG4gICAgICAgIH1cbiAgICB9XG59KTtcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnYzVlZDJ0alJaVktuNjJQbEMzcGQxazUnLCAnTWFpbk1lbnVNZ3InKTtcbi8vIHNjcmlwdFxcdmlsbGFcXE1haW5NZW51TWdyLmpzXG5cbnZhciBEYXRhQmFzZSA9IHJlcXVpcmUoJ0RhdGFCYXNlJyk7XG4vLyDkuLvoj5zljZXnrqHnkIbnsbtcbnZhciBNYWluTWVudU1nciA9IEZpcmUuQ2xhc3Moe1xuICAgIC8vIOe7p+aJv1xuICAgIGV4dGVuZHM6IEZpcmUuQ29tcG9uZW50LFxuICAgIC8vIOaehOmAoOWHveaVsFxuICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIOiPnOWNleWIl+ihqFxuICAgICAgICB0aGlzLl9tZW51TGlzdCA9IFtdO1xuICAgIH0sXG4gICAgLy8g5bGe5oCnXG4gICAgcHJvcGVydGllczoge1xuICAgICAgICBtYXJnaW46IG5ldyBGaXJlLlZlYzIoKSxcbiAgICAgICAgLy8g5b2T5YmN5oi/6Ze05ZCN56ewXG4gICAgICAgIGhvbWVUeXBlOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5UZXh0XG4gICAgICAgIH0sXG4gICAgICAgIC8vIOW9k+WJjeWIq+WiheWQjeensFxuICAgICAgICB2aWxsYU5hbWU6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlRleHRcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy8g5YiH5o2i5oi/6Ze0XG4gICAgX29uQ2hhbmdlUm9vbUV2ZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCfliIfmjaLmiL/pl7QnKTtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB2YXIgc2VuZERhdGEgPSB7XG4gICAgICAgICAgICBob3VzZV91aWQ6IDAsXG4gICAgICAgICAgICBmbG9vcl9pZDogMCxcbiAgICAgICAgICAgIG1hcms6IHRoaXMuZGF0YUJhc2UubWFya1xuICAgICAgICB9O1xuICAgICAgICBzZWxmLmRhdGFCYXNlLnN3aXRjaFJvb21XaW4ub3BlbldpbmRvdygwLCBzZW5kRGF0YSk7XG4gICAgfSxcbiAgICAvLyDmiL/lsYvmia7pnZNcbiAgICBfb25Ib3VzZURyZXNzRXZlbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ+aIv+Wxi+aJrumdkycpO1xuICAgICAgICB2YXIgc2VuZERhdGEgPSB7XG4gICAgICAgICAgICBtYXJrOiB0aGlzLmRhdGFCYXNlLm1hcmtcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBzZWxmLmRhdGFCYXNlLmxvYWRUaXBzLm9wZW5UaXBzKCfor7fmsYLmiL/lsYvmia7pnZPvvIzor7fnqI3lkI4uLi4nKTtcbiAgICAgICAgc2VsZi5kYXRhQmFzZS5uZXRXb3JrTWdyLlJlcXVlc3RDYW5EcmVzc1Jvb20oc2VuZERhdGEsIGZ1bmN0aW9uIChzZXJ2ZXJEYXRhKSB7XG4gICAgICAgICAgICBzZWxmLmRhdGFCYXNlLmxvYWRUaXBzLmNsb3NlVGlwcygpO1xuICAgICAgICAgICAgaWYgKHNlcnZlckRhdGEuc3RhdHVzID09PSAxMDAwMCkge1xuICAgICAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UuaGFzQ2FuU2F2ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS51c2VyY2MgPSBzZXJ2ZXJEYXRhLnVzZXJjYztcbiAgICAgICAgICAgICAgICAvLyDooajnpLrmnInmlbDmja7kuI7mnI3liqHlmajkuI3nrKblkIjpnIDopoHmm7TmlrBcbiAgICAgICAgICAgICAgICBpZiAoc2VydmVyRGF0YS5oYXN1cGRhdGUgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzZW5kRGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcms6IHNlbGYuZGF0YUJhc2UubWFya1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmRhdGFCYXNlLmludG9Sb29tKHNlbmREYXRhLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmRhdGFCYXNlLmZpcnN0TWVudU1nci5vcGVuTWVudSgpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UuZmlyc3RNZW51TWdyLm9wZW5NZW51KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS50aXBzV2luZG93Lm9wZW5UaXBzV2luZG93KHNlcnZlckRhdGEuZGVzYyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLy8g5L+d5a2Y6KOF5omuXG4gICAgX29uU2F2ZURyZXNzRXZlbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBpZiAoISBzZWxmLmRhdGFCYXNlLmhhc1NhdmVSb29tKCkpIHtcbiAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UudGlwc1dpbmRvdy5vcGVuVGlwc1dpbmRvdygn6K+35YWI6L+b6KGM5oi/5bGL5omu6Z2TLi4nKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBzZWxmLmRhdGFCYXNlLnRpcHNXaW5kb3cub3BlblRpcHNXaW5kb3coJ+aYr+WQpuehruWumuS/neWtmOijheaJru+8nycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmIChzZWxmLmRhdGFCYXNlLmhhc1BheSgpKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS5wYXlNZW50V2luZG93Lm9wZW5XaW5kb3coKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UubG9hZFRpcHMub3BlblRpcHMoJ+S/neWtmOijheaJruS4re+8geivt+eojeWQji4uLicpO1xuICAgICAgICAgICAgICAgIHNlbGYuZGF0YUJhc2Uuc2F2ZVJvb20oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmRhdGFCYXNlLmxvYWRUaXBzLmNsb3NlVGlwcygpO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmRhdGFCYXNlLnRpcHNXaW5kb3cub3BlblRpcHNXaW5kb3coJ+S/neWtmOijheaJruaIkOWKny4uJyk7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UuZmlyc3RNZW51TWdyLmNsb3NlTWVudSgpO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmRhdGFCYXNlLnNlY29uZE1lbnVNZ3IuY2xvc2VNZW51KCk7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UudGhyZWVNZW51TWdyLmNsb3NlTWVudSgpO1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmRhdGFCYXNlLnJlc2V0U2NyZWVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzZW5kRGF0YSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXJrOiBzZWxmLmRhdGFCYXNlLm1hcmtcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmRhdGFCYXNlLmxvYWRUaXBzLm9wZW5UaXBzKCfliLfmlrDlnLrmma/vvIzor7fnqI3lkI4uLi4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UuaW50b1Jvb20oc2VuZERhdGEsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmRhdGFCYXNlLmxvYWRUaXBzLmNsb3NlVGlwcygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc29sZS5sb2coJ+S/neWtmOijheaJricpO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIC8vIOaJrumdk+WVhuWculxuICAgIF9vbkdvVG9NYWxsRXZlbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ+aJrumdk+WVhuWcuicpO1xuICAgICAgICB3aW5kb3cub3BlbignaHR0cDovL3d3dy5zYWlrZS5jb20vaG91c2VkcmVzcy9zaG9wLnBocCcpO1xuICAgIH0sXG4gICAgLy8g6L+U5Zue5a6k5aSWXG4gICAgX29uR29Ub091dERvb3JFdmVudDogZnVuY3Rpb24gKCkge1xuICAgICAgICBjb25zb2xlLmxvZygn6L+U5Zue5a6k5aSWJyk7XG4gICAgICAgIC8vd2luZG93Lm9wZW4oJ2h0dHA6Ly93d3cuc2Fpa2UuY29tL2hvdXNlZHJlc3MvbWFwLnBocCcpO1xuICAgICAgICBGaXJlLkVuZ2luZS5sb2FkU2NlbmUoJ2xhdW5jaCcpO1xuICAgIH0sXG4gICAgLy8g6I635Y+W6I+c5Y2V5oyJ6ZKu5bm25LiU57uR5a6a5LqL5Lu2XG4gICAgX2luaXRNZW51OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIGNoaWxkcmVuID0gdGhpcy5lbnRpdHkuZ2V0Q2hpbGRyZW4oKTtcbiAgICAgICAgc2VsZi5fbWVudUxpc3QgPSBbXTtcbiAgICAgICAgY2hpbGRyZW4uZm9yRWFjaChmdW5jdGlvbiAoZW50KSB7XG4gICAgICAgICAgICAvLyDnu5HlrprmjInpkq7kuovku7ZcbiAgICAgICAgICAgIHZhciBidG4gPSBlbnQuZ2V0Q29tcG9uZW50KCdVSUJ1dHRvbicpO1xuICAgICAgICAgICAgaWYgKCEgYnRuKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGVudC5uYW1lID09PSBcIjFcIikge1xuICAgICAgICAgICAgICAgIGJ0bi5vbkNsaWNrID0gc2VsZi5fb25DaGFuZ2VSb29tRXZlbnQuYmluZChzZWxmKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGVudC5uYW1lID09PSBcIjJcIikge1xuICAgICAgICAgICAgICAgIGJ0bi5vbkNsaWNrID0gc2VsZi5fb25Ib3VzZURyZXNzRXZlbnQuYmluZChzZWxmKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGVudC5uYW1lID09PSBcIjNcIikge1xuICAgICAgICAgICAgICAgIGJ0bi5vbkNsaWNrID0gc2VsZi5fb25TYXZlRHJlc3NFdmVudC5iaW5kKHNlbGYpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoZW50Lm5hbWUgPT09IFwiNFwiKSB7XG4gICAgICAgICAgICAgICAgYnRuLm9uQ2xpY2sgPSBzZWxmLl9vbkdvVG9NYWxsRXZlbnQuYmluZChzZWxmKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGVudC5uYW1lID09PSBcIjVcIikge1xuICAgICAgICAgICAgICAgIGJ0bi5vbkNsaWNrID0gc2VsZi5fb25Hb1RvT3V0RG9vckV2ZW50LmJpbmQoc2VsZik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZWxmLl9tZW51TGlzdC5wdXNoKGJ0bik7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLy8g5pu05paw5b2T5YmN5oi/6Ze057G75Z6LXG4gICAgcmVmcmVzaEN1ckhvbWVUeXBlOiBmdW5jdGlvbiAoaG9tZVR5cGUpIHtcbiAgICAgICAgdGhpcy5ob21lVHlwZS50ZXh0ID0gXCLlvZPliY06XCIgKyBob21lVHlwZTtcbiAgICB9LFxuICAgIC8vIOabtOaWsOW9k+WJjeWIq+WiheWQjeensFxuICAgIHJlZnJlc2hDdXJWaWxsYU5hbWU6IGZ1bmN0aW9uICh0ZXh0KSB7XG4gICAgICAgIGlmICh0aGlzLnZpbGxhTmFtZS50ZXh0ID09PSB0ZXh0KXtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnZpbGxhTmFtZS50ZXh0ID0gdGV4dCB8fCBcIlwiO1xuICAgIH0sXG4gICAgb25Mb2FkOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIOW4uOeUqOeahOWPmOmHjy/mlbDmja5cbiAgICAgICAgdmFyIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9EYXRhQmFzZScpO1xuICAgICAgICB0aGlzLmRhdGFCYXNlID0gZW50LmdldENvbXBvbmVudCgnRGF0YUJhc2UnKTtcbiAgICAgICAgLy8g6aG16Z2i5aSn5bCP5Y+R55Sf5Y+Y5YyW55qE5pe25YCZ5Lya6LCD55So6L+Z5Liq5LqL5Lu2XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgRmlyZS5TY3JlZW4ub24oJ3Jlc2l6ZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB3aWR0aCA9IHNlbGYuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoO1xuICAgICAgICAgICAgdmFyIGhlaWdodCA9IHNlbGYuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodDtcbiAgICAgICAgICAgIGlmICh3aWR0aCA8IGhlaWdodCkge1xuICAgICAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UudGlwc1dpbmRvdy5vcGVuVGlwc1dpbmRvdygn5qiq5bGP5pWI5p6c5pu05aW9IScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS50aXBzV2luZG93LmNsb3NlVGlwcygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdmFyIGRvY3VtZW50RWxlbWVudCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcbiAgICAgICAgdmFyIHdpZHRoID0gZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoO1xuICAgICAgICB2YXIgaGVpZ2h0ID0gZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodDtcbiAgICAgICAgdGhpcy5kb2N1bWVudEVsZW1lbnQgPSBkb2N1bWVudEVsZW1lbnQ7XG4gICAgICAgIGlmICh3aWR0aCA8IGhlaWdodCkge1xuICAgICAgICAgICAgdGhpcy5kYXRhQmFzZS50aXBzV2luZG93Lm9wZW5XaW5kb3coJ+aoquWxj+aViOaenOabtOWlvSEnKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy8g5byA5aeLXG4gICAgc3RhcnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8g6I635Y+W6I+c5Y2V5oyJ6ZKu5bm25LiU57uR5a6a5LqL5Lu2XG4gICAgICAgIHRoaXMuX2luaXRNZW51KCk7XG5cbiAgICAgICAgRmlyZS5FbmdpbmUucHJlbG9hZFNjZW5lKCdsYXVuY2gnKTtcbiAgICB9LFxuICAgIC8vIOabtOaWsFxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyDljLnphY1VSeWIhui+qOeOh1xuICAgICAgICAvL3ZhciBjYW1lcmEgPSBGaXJlLkNhbWVyYS5tYWluO1xuICAgICAgICAvL3ZhciBiZ1dvcmxkQm91bmRzID0gdGhpcy5kYXRhQmFzZS5iZ1JlbmRlci5nZXRXb3JsZEJvdW5kcygpO1xuICAgICAgICAvL3ZhciBiZ0xlZnRUb3BXb3JsZFBvcyA9IG5ldyBGaXJlLlZlYzIoYmdXb3JsZEJvdW5kcy54TWluLCBiZ1dvcmxkQm91bmRzLnlNYXgpO1xuICAgICAgICAvL3ZhciBiZ2xlZnRUb3AgPSBjYW1lcmEud29ybGRUb1NjcmVlbihiZ0xlZnRUb3BXb3JsZFBvcyk7XG4gICAgICAgIC8vdmFyIHNjcmVlblBvcyA9IG5ldyBGaXJlLlZlYzIoYmdsZWZ0VG9wLngsIGJnbGVmdFRvcC55KTtcbiAgICAgICAgLy92YXIgd29ybGRQb3MgPSBjYW1lcmEuc2NyZWVuVG9Xb3JsZChzY3JlZW5Qb3MpO1xuICAgICAgICAvL3RoaXMuZW50aXR5LnRyYW5zZm9ybS53b3JsZFBvc2l0aW9uID0gd29ybGRQb3M7XG4gICAgICAgIC8vIOWMuemFjVVJ5YiG6L6o546HXG4gICAgICAgIHZhciBjYW1lcmEgPSBGaXJlLkNhbWVyYS5tYWluO1xuICAgICAgICB2YXIgc2NyZWVuU2l6ZSA9IEZpcmUuU2NyZWVuLnNpemUubXVsKGNhbWVyYS5zaXplIC8gRmlyZS5TY3JlZW4uaGVpZ2h0KTtcbiAgICAgICAgdmFyIG5ld1BvcyA9IEZpcmUudjIoLXNjcmVlblNpemUueCAvIDIgKyB0aGlzLm1hcmdpbi54LCBzY3JlZW5TaXplLnkgLyAyIC0gdGhpcy5tYXJnaW4ueSk7XG4gICAgICAgIHRoaXMuZW50aXR5LnRyYW5zZm9ybS5wb3NpdGlvbiA9IG5ld1BvcztcbiAgICB9XG59KTtcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnYTVmNGVDTTg2dEsxYXpBRFcyTEp6S2snLCAnTWFpbk1lbnUnKTtcbi8vIHNjcmlwdFxcb3V0ZG9vclxcTWFpbk1lbnUuanNcblxudmFyIENvbXAgPSBGaXJlLkNsYXNzKHtcclxuICAgIGV4dGVuZHM6IEZpcmUuQ29tcG9uZW50LFxyXG5cclxuICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICBiYWNrZ3JvdW5kOiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuU3ByaXRlUmVuZGVyZXJcclxuICAgICAgICB9LFxyXG4gICAgICAgIGJ0bl9Hb1RvU2luZ2xlOiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVUlCdXR0b25cclxuICAgICAgICB9LFxyXG4gICAgICAgIGJ0bl9Hb1RvVmlsbGE6IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5VSUJ1dHRvblxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgLy8gdXNlIHRoaXMgZm9yIGluaXRpYWxpemF0aW9uXHJcbiAgICBzdGFydDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIEZpcmUuRW5naW5lLnByZWxvYWRTY2VuZSgnc2luZ2xlJyk7XHJcbiAgICAgICAgRmlyZS5FbmdpbmUucHJlbG9hZFNjZW5lKCd2aWxsYScpO1xyXG5cclxuICAgICAgICAvL3RoaXMuYnRuX0dvVG9TaW5nbGUub25DbGljayA9IHRoaXMub25Hb1RvU2luZ2xlRXZlbnQuYmluZCh0aGlzKTtcclxuICAgICAgICAvL3RoaXMuYnRuX0dvVG9WaWxsYS5vbkNsaWNrID0gdGhpcy5vbkdvVG9WaWxsYUV2ZW50LmJpbmQodGhpcyk7XHJcblxyXG4gICAgICAgIHZhciBkb2N1bWVudEVsZW1lbnQgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XHJcbiAgICAgICAgdmFyIHdpZHRoID0gZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoO1xyXG4gICAgICAgIHZhciBoZWlnaHQgPSBkb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0O1xyXG5cclxuICAgICAgICB0aGlzLmJhY2tncm91bmQuY3VzdG9tV2lkdGggPSB3aWR0aCAqIChGaXJlLkNhbWVyYS5tYWluLnNpemUgLyBoZWlnaHQpO1xyXG4gICAgICAgIHRoaXMuYmFja2dyb3VuZC5jdXN0b21IZWlnaHQgPSBGaXJlLkNhbWVyYS5tYWluLnNpemU7XHJcblxyXG4gICAgICAgIGNvbnNvbGUubG9nKHdpZHRoKTtcclxuICAgICAgICBjb25zb2xlLmxvZyhoZWlnaHQpO1xyXG4gICAgfSxcclxuXHJcbiAgICBvbkdvVG9TaW5nbGVFdmVudDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIEZpcmUuRW5naW5lLmxvYWRTY2VuZSgnc2luZ2xlJyk7XHJcbiAgICB9LFxyXG4gICAgb25Hb1RvVmlsbGFFdmVudDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIEZpcmUuRW5naW5lLmxvYWRTY2VuZSgndmlsbGEnKTtcclxuICAgIH0sXHJcblxyXG4gICAgLy8gY2FsbGVkIGV2ZXJ5IGZyYW1lXHJcbiAgICB1cGRhdGU6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICB9XHJcbn0pO1xyXG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJzJmZmQ1dzNDTHhFTDVvdUV5dTg4ampCJywgJ01lcmNoYW5kaXNlJyk7XG4vLyBzY3JpcHRcXHZpbGxhXFxNZXJjaGFuZGlzZS5qc1xuXG52YXIgTWVyY2hhbmRpc2UgPSBGaXJlLkNsYXNzKHtcclxuICAgIGV4dGVuZHM6IEZpcmUuQ29tcG9uZW50LFxyXG4gICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAvLyBpZDtcclxuICAgICAgICB0aGlzLnRpZCA9IDA7XHJcbiAgICAgICAgLy8g5pWw6YePXHJcbiAgICAgICAgdGhpcy5udW0gPSAxO1xyXG4gICAgICAgIC8vIOaJk+aKmFxyXG4gICAgICAgIHRoaXMuZGlzY291bnQgPSAxO1xyXG4gICAgICAgIC8vIOWNleS4quS7t+mSsVxyXG4gICAgICAgIHRoaXMucHJpY2UgPSAwO1xyXG4gICAgICAgIC8vIOaZrumAmuS7t1xyXG4gICAgICAgIHRoaXMub3JkaW5hcnlQcmljZVZhbHVlID0gMDtcclxuICAgICAgICAvLyDmiZPmipjku7dcclxuICAgICAgICB0aGlzLmRpc2NvdW50UHJpY2VWYWx1ZSA9IDA7XHJcbiAgICAgICAgLy8g5Yi35paw5oC75Lu35qC8XHJcbiAgICAgICAgdGhpcy5vbnJlZnJlc2hQcmljZUV2ZW50ID0gbnVsbDtcclxuICAgIH0sXHJcbiAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgaWNvbjoge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlNwcml0ZVJlbmRlcmVyXHJcbiAgICAgICAgfSxcclxuICAgICAgICB0TmFtZToge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlRleHRcclxuICAgICAgICB9LFxyXG4gICAgICAgIHROdW06IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5UZXh0XHJcbiAgICAgICAgfSxcclxuICAgICAgICBidG5fbGVzczoge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlVJQnV0dG9uXHJcbiAgICAgICAgfSxcclxuICAgICAgICBidG5fYWRkOiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVUlCdXR0b25cclxuICAgICAgICB9LFxyXG4gICAgICAgIG9yZGluYXJ5UHJpY2U6IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5UZXh0XHJcbiAgICAgICAgfSxcclxuICAgICAgICBkaXNjb3VudFByaWNlOiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVGV4dFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYnRuX2RlbDoge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlVJQnV0dG9uXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIOmHjee9rlxyXG4gICAgcmVzZXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLmljb24uc3ByaXRlID0gbnVsbDtcclxuICAgICAgICB0aGlzLnROYW1lLnRleHQgPSAnJztcclxuICAgICAgICB0aGlzLnNldE51bSgwKTtcclxuICAgICAgICB0aGlzLm9yZGluYXJ5UHJpY2UudGV4dCA9IDAgKyBcIkPluIFcIjtcclxuICAgICAgICB0aGlzLmRpc2NvdW50UHJpY2UudGV4dCA9IDAgKyBcIkPluIFcIjtcclxuICAgICAgICB0aGlzLmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcclxuICAgIH0sXHJcbiAgICAvLyDlh4/lsJHmlbDph49cclxuICAgIF9vbkxlc3NFdmVudDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICh0aGlzLm51bSA9PT0gMSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMubnVtLS07XHJcbiAgICAgICAgaWYgKHRoaXMubnVtIDwgMSkge1xyXG4gICAgICAgICAgICB0aGlzLm51bSA9IDE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuc2V0TnVtKHRoaXMubnVtKTtcclxuICAgICAgICB0aGlzLnJlZnJlc2hPcmRpbmFyeVByaWNlKCk7XHJcbiAgICAgICAgaWYgKHRoaXMub25yZWZyZXNoUHJpY2VFdmVudCkge1xyXG4gICAgICAgICAgICB0aGlzLm9ucmVmcmVzaFByaWNlRXZlbnQodGhpcy50aWQsIHRoaXMubnVtKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8g5aKe5Yqg5pWw6YePXHJcbiAgICBfb25BZGRFdmVudDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMubnVtKys7XHJcbiAgICAgICAgdGhpcy5zZXROdW0odGhpcy5udW0pO1xyXG4gICAgICAgIHRoaXMucmVmcmVzaE9yZGluYXJ5UHJpY2UoKTtcclxuICAgICAgICBpZiAodGhpcy5vbnJlZnJlc2hQcmljZUV2ZW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMub25yZWZyZXNoUHJpY2VFdmVudCh0aGlzLnRpZCwgdGhpcy5udW0pO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvLyDorr7nva7mlbDph49cclxuICAgIHNldE51bTogZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgdGhpcy5udW0gPSB2YWx1ZTtcclxuICAgICAgICB0aGlzLnROdW0udGV4dCA9IHZhbHVlO1xyXG4gICAgfSxcclxuICAgIC8vIOiuvue9ruaZrumAmuS7t1xyXG4gICAgcmVmcmVzaE9yZGluYXJ5UHJpY2U6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLm9yZGluYXJ5UHJpY2VWYWx1ZSA9IHRoaXMubnVtICogdGhpcy5wcmljZTtcclxuICAgICAgICB0aGlzLm9yZGluYXJ5UHJpY2UudGV4dCA9IHRoaXMub3JkaW5hcnlQcmljZVZhbHVlICsgXCJD5biBXCI7XHJcbiAgICAgICAgLy8g6K6+572u5omT5oqY5Lu3XHJcbiAgICAgICAgdGhpcy5yZWZyZXNoRGlzY291bnRQcmljZSgpO1xyXG4gICAgfSxcclxuICAgIC8vIOiuvue9ruaJk+aKmOS7t1xyXG4gICAgcmVmcmVzaERpc2NvdW50UHJpY2U6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLmRpc2NvdW50UHJpY2VWYWx1ZSA9IHRoaXMub3JkaW5hcnlQcmljZVZhbHVlICogdGhpcy5kaXNjb3VudDtcclxuICAgICAgICB0aGlzLmRpc2NvdW50UHJpY2UudGV4dCA9IHRoaXMuZGlzY291bnRQcmljZVZhbHVlICsgXCJD5biBXCI7XHJcbiAgICB9LFxyXG4gICAgLy8g5Yi35pawXHJcbiAgICByZWZyZXNoOiBmdW5jdGlvbiAoZGF0YSwgZGVsRXZlbnQsIHJlZnJlc2hQcmljZUV2ZW50KSB7XHJcbiAgICAgICAgdGhpcy50aWQgPSBkYXRhLnRpZDtcclxuICAgICAgICB0aGlzLmljb24uc3ByaXRlID0gZGF0YS5pY29uIHx8IG51bGw7XHJcbiAgICAgICAgdGhpcy50TmFtZS50ZXh0ID0gZGF0YS50TmFtZSB8fCAnJztcclxuICAgICAgICB0aGlzLnNldE51bShkYXRhLnROdW0gfHwgMCk7XHJcbiAgICAgICAgdGhpcy5wcmljZSA9IGRhdGEucHJpY2U7XHJcbiAgICAgICAgdGhpcy5kaXNjb3VudCA9IGRhdGEuZGlzY291bnQ7XHJcbiAgICAgICAgdGhpcy5yZWZyZXNoT3JkaW5hcnlQcmljZSgpO1xyXG4gICAgICAgIHRoaXMuYnRuX2RlbC5vbkNsaWNrID0gZGVsRXZlbnQgfHwgbnVsbDtcclxuICAgICAgICB0aGlzLm9ucmVmcmVzaFByaWNlRXZlbnQgPSByZWZyZXNoUHJpY2VFdmVudDtcclxuICAgICAgICB0aGlzLmVudGl0eS5hY3RpdmUgPSB0cnVlO1xyXG4gICAgfSxcclxuICAgIC8vXHJcbiAgICBzdGFydDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuYnRuX2xlc3Mub25DbGljayA9IHRoaXMuX29uTGVzc0V2ZW50LmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5idG5fYWRkLm9uQ2xpY2sgPSB0aGlzLl9vbkFkZEV2ZW50LmJpbmQodGhpcyk7XHJcbiAgICB9XHJcbn0pO1xyXG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJzE2YzdkZWgzbE5HbXB5Mm10RUx1OEJXJywgJ05ldHdvcmtNZ3InKTtcbi8vIHNjcmlwdFxcdmlsbGFcXE5ldHdvcmtNZ3IuanNcblxuLy8g6Lef5pyN5Yqh5Zmo6L+b6KGM5a+55o6lXHJcbnZhciBOZXR3b3JrTWdyID0gRmlyZS5DbGFzcyh7XHJcbiAgICAvLyDnu6fmib9cclxuICAgIGV4dGVuZHM6IEZpcmUuQ29tcG9uZW50LFxyXG4gICAgLy8g5p6E6YCg5Ye95pWwXHJcbiAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIC8vIOW9k+WJjeivt+axguaVsOaNrlxyXG4gICAgICAgIHRoaXMuX3Bvc3REYXRhID0ge307XHJcbiAgICAgICAgLy8g5pat57q/6YeN6L+e56qX5Y+jXHJcbiAgICAgICAgdGhpcy5uZXRXb3JrV2luID0gbnVsbDtcclxuICAgICAgICAvLyDnlKjkuo7mtYvor5XnmoR0b2tlbuaVsOaNrlxyXG4gICAgICAgIHRoaXMudG9rZW4gPSAnJztcclxuICAgICAgICAvL1xyXG4gICAgICAgIHRoaXMuX2RhdGFCYXNlID0gbnVsbDtcclxuICAgIH0sXHJcbiAgICAvLyDlsZ7mgKdcclxuICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICBsb2NhbFRlc3Q6IGZhbHNlLFxyXG4gICAgICAgIGRhdGFCYXNlOiB7XHJcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCEgdGhpcy5fZGF0YUJhc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAvLyDluLjnlKjnmoTlj5jph48v5pWw5o2uXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9EYXRhQmFzZScpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2RhdGFCYXNlID0gZW50LmdldENvbXBvbmVudCgnRGF0YUJhc2UnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9kYXRhQmFzZTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdmlzaWJsZTogZmFsc2VcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8g6I635Y+W55So5oi35L+h5oGvXHJcbiAgICBnZXRUb0tlblZhbHVlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMubG9jYWxUZXN0KSB7XHJcbiAgICAgICAgICAgIC8vdGhpcy50b2tlbiA9ICdNVEF3TWpFeE9ETXpNRjltTVRoalptTTRPREk0TnpSaFpUQmxNVEE1TVRaalpUSmtPRGswWmpnelpsOHhORE0yTVRZM09ETXlYM2RoY0E9PSc7XHJcbiAgICAgICAgICAgIHRoaXMudG9rZW4gPSAnTVRBd01UUTVNalk0TlY4eFlXRXpZekZrTm1FMFpXSTNZemxrTm1ReFltSm1ORGM0TlRObVpqaGtNMTh4TkRNMk16STJNemMyWDNkaGNBJztcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgdGhpcy50b2tlbiA9IHRoaXMuZ2V0UXVlcnlTdHJpbmcoJ3Rva2VuJyk7XHJcbiAgICAgICAgICAgIGlmICghIHRoaXMudG9rZW4pe1xyXG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhcIuayoeacieeUqOaIt+S/oeaBrywgVG9LZW4gaXMgbnVsbFwiKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH0sXHJcbiAgICAvLyDnlKhKU+iOt+WPluWcsOWdgOagj+WPguaVsOeahOaWueazlVxyXG4gICAgZ2V0UXVlcnlTdHJpbmc6IGZ1bmN0aW9uKG5hbWUpIHtcclxuICAgICAgICB2YXIgcmVnID0gbmV3IFJlZ0V4cChcIihefCYpXCIgKyBuYW1lICsgXCI9KFteJl0qKSgmfCQpXCIpO1xyXG4gICAgICAgIHZhciByID0gd2luZG93LmxvY2F0aW9uLnNlYXJjaC5zdWJzdHIoMSkubWF0Y2gocmVnKTtcclxuICAgICAgICBpZiAociAhPT0gbnVsbCl7XHJcbiAgICAgICAgICAgIHJldHVybiB1bmVzY2FwZShyWzJdKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9LFxyXG4gICAgLy8g6K+35rGC5aSx6LSlXHJcbiAgICBfZXJyb3JDYWxsQmFjazogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICB0aGlzLm5ldFdvcmtXaW4ub3BlbldpbmRvdyhmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHNlbGYuc2VuZERhdGEoc2VsZi5fcG9zdERhdGEpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIC8vIOWPkemAgeaVsOaNrlxyXG4gICAgc2VuZERhdGE6IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgaWYgKCEgRmlyZS5FbmdpbmUuaXNQbGF5aW5nKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCEgdGhpcy5nZXRUb0tlblZhbHVlKCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvL3RoaXMuZGF0YUJhc2UubG9hZFRpcHMub3BlblRpcHMoJ+ivt+axguS4re+8jOivt+eojeWQji4uLicpO1xyXG4gICAgICAgIHRoaXMuX3Bvc3REYXRhID0gZGF0YTtcclxuICAgICAgICB0aGlzLmpRdWVyeUFqYXgoZGF0YS51cmwsIGRhdGEuc2VuZERhdGEsIGRhdGEuY2IsIGRhdGEuZXJyQ2IpO1xyXG4gICAgfSxcclxuICAgIC8vIOWPkemAgea2iOaBr1xyXG4gICAgalF1ZXJ5QWpheDogZnVuY3Rpb24gKHN0clVybCwgZGF0YSwgY2FsbEJhY2ssIGVycm9yQ2FsbEJhY2spIHtcclxuICAgICAgICB2YXIgcGFyYW1zID0gXCJcIjtcclxuICAgICAgICBpZiAodHlwZW9mKGRhdGEpICE9PSBcIm9iamVjdFwiKSB7IHBhcmFtcyA9IGRhdGEgKyBcIiZ0b2tlbj1cIiArIHRoaXMudG9rZW47IH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgZm9yICh2YXIga2V5IGluIGRhdGEpIHtcclxuICAgICAgICAgICAgICAgIHBhcmFtcyArPSAoa2V5ICsgXCI9XCIgKyBkYXRhW2tleV0gKyBcIiZcIiAgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBwYXJhbXMgKz0gXCImdG9rZW49XCIgKyB0aGlzLnRva2VuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgdmFyIHNlbmQgPSB7XHJcbiAgICAgICAgICAgIHR5cGU6IFwiUE9TVFwiLFxyXG4gICAgICAgICAgICB1cmw6IHN0clVybCArIFwiPyZqc29uY2FsbFBQPT9cIixcclxuICAgICAgICAgICAgZGF0YTogcGFyYW1zLFxyXG4gICAgICAgICAgICBkYXRhVHlwZTogJ2pzb25wJyxcclxuICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coZGF0YSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoISBGaXJlLkVuZ2luZS5pc1BsYXlpbmcpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoY2FsbEJhY2spIHtcclxuICAgICAgICAgICAgICAgICAgICBjYWxsQmFjayhkYXRhKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vc2VsZi5kYXRhQmFzZS5sb2FkVGlwcy5jbG9zZVRpcHMoKTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uIChYTUxIdHRwUmVxdWVzdCwgdGV4dFN0YXR1cywgZXJyb3JUaHJvd24pIHtcclxuICAgICAgICAgICAgICAgIGlmICghIEZpcmUuRW5naW5lLmlzUGxheWluZykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChlcnJvckNhbGxCYWNrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZXJyb3JDYWxsQmFjaygpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy9zZWxmLmRhdGFCYXNlLmxvYWRUaXBzLmNsb3NlVGlwcygpO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3JUaHJvd24pO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coWE1MSHR0cFJlcXVlc3QpO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2codGV4dFN0YXR1cyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgICAgIGpRdWVyeS5hamF4KHNlbmQpO1xyXG4gICAgfSxcclxuICAgIC8vIOS/neWtmOijheaJrlxyXG4gICAgUmVxdWVzdFNhdmVSb29tOiBmdW5jdGlvbiAoc2VuZERhdGEsIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgdmFyIHBvc3REYXRhID0ge1xyXG4gICAgICAgICAgICB1cmw6IFwiaHR0cDovL20uc2Fpa2UuY29tL3N1aXRkcmVzcy9zYXZlLmh0bWxcIixcclxuICAgICAgICAgICAgc2VuZERhdGE6IHtcclxuICAgICAgICAgICAgICAgIG1hcms6IHRoaXMuZGF0YUJhc2UubWFyayxcclxuICAgICAgICAgICAgICAgIHN1aXRfaWQ6IHNlbmREYXRhLnN1aXRfaWQsXHJcbiAgICAgICAgICAgICAgICBzdWl0X2Zyb206IHNlbmREYXRhLnN1aXRfZnJvbSxcclxuICAgICAgICAgICAgICAgIGRhdGFMaXN0OiBKU09OLnN0cmluZ2lmeShzZW5kRGF0YS5kYXRhTGlzdClcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgY2I6IGNhbGxiYWNrLFxyXG4gICAgICAgICAgICBlcnJDYjogdGhpcy5fZXJyb3JDYWxsQmFjay5iaW5kKHRoaXMpXHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLnNlbmREYXRhKHBvc3REYXRhKTtcclxuICAgIH0sXHJcbiAgICAvLyDor6Lpl67mmK/lkKblj6/ku6Xoo4Xmia5cclxuICAgIFJlcXVlc3RDYW5EcmVzc1Jvb206IGZ1bmN0aW9uIChzZW5kRGF0YSwgY2FsbGJhY2spIHtcclxuICAgICAgICB2YXIgcG9zdERhdGEgPSB7XHJcbiAgICAgICAgICAgIHVybDogXCJodHRwOi8vbS5zYWlrZS5jb20vc3VpdGRyZXNzL2JlZ2luU3VpdC5odG1sXCIsXHJcbiAgICAgICAgICAgIHNlbmREYXRhOiBzZW5kRGF0YSxcclxuICAgICAgICAgICAgY2I6IGNhbGxiYWNrLFxyXG4gICAgICAgICAgICBlcnJDYjogdGhpcy5fZXJyb3JDYWxsQmFjay5iaW5kKHRoaXMpXHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLnNlbmREYXRhKHBvc3REYXRhKTtcclxuICAgIH0sXHJcbiAgICAvLyDor7fmsYLmiL/pl7TmlbDmja5cclxuICAgIFJlcXVlc3RJbnRvSG9tZURhdGE6IGZ1bmN0aW9uIChzZW5kRGF0YSwgY2FsbGJhY2spIHtcclxuICAgICAgICB2YXIgcG9zdERhdGEgPSB7XHJcbiAgICAgICAgICAgIHVybDogXCJodHRwOi8vbS5zYWlrZS5jb20vc3VpdGRyZXNzL2ludG9Sb29tLmh0bWxcIixcclxuICAgICAgICAgICAgc2VuZERhdGE6IHtcclxuICAgICAgICAgICAgICAgIGhvdXNlX3VpZDogc2VuZERhdGEuaG91c2VfdWlkLFxyXG4gICAgICAgICAgICAgICAgbWFyazogc2VuZERhdGEubWFyayxcclxuICAgICAgICAgICAgICAgIGNsZWFyOiBzZW5kRGF0YS5jbGVhciB8fCAwXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGNiOiBjYWxsYmFjayxcclxuICAgICAgICAgICAgZXJyQ2I6IHRoaXMuX2Vycm9yQ2FsbEJhY2suYmluZCh0aGlzKVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5zZW5kRGF0YShwb3N0RGF0YSk7XHJcbiAgICB9LFxyXG4gICAgLy8g6I635Y+W5bmz6Z2i5Zu+XHJcbiAgICBSZXF1ZXN0UGxhbjogZnVuY3Rpb24gKHNlbmREYXRhLCBjYWxsYmFjaykge1xyXG4gICAgICAgIHZhciBwb3N0RGF0YSA9IHtcclxuICAgICAgICAgICAgdXJsOiBcImh0dHA6Ly9tLnNhaWtlLmNvbS9zdWl0ZHJlc3Mvc2hvd0NvdmVyLmh0bWxcIixcclxuICAgICAgICAgICAgc2VuZERhdGE6IHtcclxuICAgICAgICAgICAgICAgIGhvdXNlX3VpZDogc2VuZERhdGEuaG91c2VfdWlkLFxyXG4gICAgICAgICAgICAgICAgZmxvb3JfaWQ6IHNlbmREYXRhLmZsb29yX2lkLFxyXG4gICAgICAgICAgICAgICAgbWFyazogc2VuZERhdGEubWFya1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBjYjogY2FsbGJhY2ssXHJcbiAgICAgICAgICAgIGVyckNiOiB0aGlzLl9lcnJvckNhbGxCYWNrLmJpbmQodGhpcylcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMuc2VuZERhdGEocG9zdERhdGEpO1xyXG4gICAgfSxcclxuICAgIC8vIOalvOWxguWIl+ihqFxyXG4gICAgUmVxdWVzdEZsb29yTGlzdDogZnVuY3Rpb24gKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgdmFyIHBvc3REYXRhID0ge1xyXG4gICAgICAgICAgICB1cmw6IFwiaHR0cDovL20uc2Fpa2UuY29tL3N1aXRkcmVzcy9mbG9vckxpc3QuaHRtbFwiLFxyXG4gICAgICAgICAgICBzZW5kRGF0YToge30sXHJcbiAgICAgICAgICAgIGNiOiBjYWxsYmFjayxcclxuICAgICAgICAgICAgZXJyQ2I6IHRoaXMuX2Vycm9yQ2FsbEJhY2suYmluZCh0aGlzKVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5zZW5kRGF0YShwb3N0RGF0YSk7XHJcbiAgICB9LFxyXG4gICAgLy8g6Kej6Zmk5YWz57O7XHJcbiAgICBSZXF1ZXN0RGlzYXNzb2NpYXRlTGlzdDogZnVuY3Rpb24gKHNlbmREYXRhLCBjYWxsYmFjaykge1xyXG4gICAgICAgIHZhciBwb3N0RGF0YSA9IHtcclxuICAgICAgICAgICAgdXJsOiBcImh0dHA6Ly9tLnNhaWtlLmNvbS9zdWl0ZHJlc3MvcmVsZWFzZVJlbGF0aW9uLmh0bWxcIixcclxuICAgICAgICAgICAgc2VuZERhdGE6IHNlbmREYXRhLFxyXG4gICAgICAgICAgICBjYjogY2FsbGJhY2ssXHJcbiAgICAgICAgICAgIGVyckNiOiB0aGlzLl9lcnJvckNhbGxCYWNrLmJpbmQodGhpcylcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMuc2VuZERhdGEocG9zdERhdGEpO1xyXG4gICAgfSxcclxuICAgIC8vIOivt+axguWNleWTgeWutuWFt+iPnOWNleWIl+ihqFxyXG4gICAgUmVxdWVzdFNpbmdsZUl0ZW1zTWVudTogZnVuY3Rpb24gKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgdmFyIHBvc3REYXRhID0ge1xyXG4gICAgICAgICAgICB1cmw6ICdodHRwOi8vbS5zYWlrZS5jb20vaG91c2VkcmVzcy9nZXRTaG9wVHlwZS5odG1sJyxcclxuICAgICAgICAgICAgc2VuZERhdGE6IHt9LFxyXG4gICAgICAgICAgICBjYjogY2FsbGJhY2ssXHJcbiAgICAgICAgICAgIGVyckNiOiB0aGlzLl9lcnJvckNhbGxCYWNrLmJpbmQodGhpcylcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMuc2VuZERhdGEocG9zdERhdGEpO1xyXG4gICAgfSxcclxuICAgIC8vIOivt+axguWNleWTgeWutuWFt+WIl+ihqFxyXG4gICAgUmVxdWVzdFNpbmdsZUl0ZW1zOiBmdW5jdGlvbiAoZGF0YSwgY2FsbGJhY2spIHtcclxuICAgICAgICB2YXIgcG9zdERhdGEgPSB7XHJcbiAgICAgICAgICAgIHVybDogXCJodHRwOi8vbS5zYWlrZS5jb20vaG91c2VkcmVzcy9nZXRTaG9wTGlzdC5odG1sXCIsXHJcbiAgICAgICAgICAgIHNlbmREYXRhOiB7XHJcbiAgICAgICAgICAgICAgICB0aWQ6IGRhdGEudGlkLFxyXG4gICAgICAgICAgICAgICAgcGFnZTogZGF0YS5wYWdlLFxyXG4gICAgICAgICAgICAgICAgZWFjaDogZGF0YS5lYWNoXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGNiOiBjYWxsYmFjayxcclxuICAgICAgICAgICAgZXJyQ2I6IHRoaXMuX2Vycm9yQ2FsbEJhY2suYmluZCh0aGlzKVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5zZW5kRGF0YShwb3N0RGF0YSk7XHJcbiAgICB9LFxyXG4gICAgLy/or7fmsYLlpZfoo4XliJfooajmlbDmja5cclxuICAgIFJlcXVlc3RTZXRJdGVtc01lbnU6IGZ1bmN0aW9uIChkYXRhLCAgY2FsbGJhY2spIHtcclxuICAgICAgICB2YXIgcG9zdERhdGEgPSB7XHJcbiAgICAgICAgICAgIHVybDogXCJodHRwOi8vbS5zYWlrZS5jb20vaG91c2VkcmVzcy9zaG9wU3VpdC5odG1sXCIsXHJcbiAgICAgICAgICAgIHNlbmREYXRhOiB7XHJcbiAgICAgICAgICAgICAgICBwYWdlOiBkYXRhLnBhZ2UsXHJcbiAgICAgICAgICAgICAgICBlYWNoOiBkYXRhLmVhY2hcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgY2I6IGNhbGxiYWNrLFxyXG4gICAgICAgICAgICBlcnJDYjogdGhpcy5fZXJyb3JDYWxsQmFjay5iaW5kKHRoaXMpXHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLnNlbmREYXRhKHBvc3REYXRhKTtcclxuICAgIH0sXHJcbiAgICAvL+ivt+axguWll+ijheaVsOaNrlxyXG4gICAgUmVxdWVzdFNldEl0ZW1zRGF0YTogZnVuY3Rpb24gKGlkLCAgY2FsbGJhY2spIHtcclxuICAgICAgICB2YXIgcG9zdERhdGEgPSB7XHJcbiAgICAgICAgICAgIHVybDogXCJodHRwOi8vbS5zYWlrZS5jb20vaG91c2VkcmVzcy9zaG9wc3VpdGRldGFpbC5odG1sXCIsXHJcbiAgICAgICAgICAgIHNlbmREYXRhOiB7XHJcbiAgICAgICAgICAgICAgICBwcm9kX3N1aXRpZDogaWRcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgY2I6IGNhbGxiYWNrLFxyXG4gICAgICAgICAgICBlcnJDYjogdGhpcy5fZXJyb3JDYWxsQmFjay5iaW5kKHRoaXMpXHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLnNlbmREYXRhKHBvc3REYXRhKTtcclxuICAgIH0sXHJcbiAgICAvLyDnianlk4Hmn5wo5Y2V5ZOBKVxyXG4gICAgUmVxdWVzdEJhY2twYWNrU2luZ2xlOiBmdW5jdGlvbiAoc2VuZERhdGEsIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgdmFyIHBvc3REYXRhID0ge1xyXG4gICAgICAgICAgICB1cmw6IFwiaHR0cDovL20uc2Fpa2UuY29tL3N1aXRkcmVzcy9iYWNrcGFja1NpbmdsZS5odG1sXCIsXHJcbiAgICAgICAgICAgIHNlbmREYXRhOiBzZW5kRGF0YSxcclxuICAgICAgICAgICAgY2I6IGNhbGxiYWNrLFxyXG4gICAgICAgICAgICBlcnJDYjogdGhpcy5fZXJyb3JDYWxsQmFjay5iaW5kKHRoaXMpXHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLnNlbmREYXRhKHBvc3REYXRhKTtcclxuICAgIH0sXHJcbiAgICAvLyDnianlk4Hmn5wo5aWX6KOFKVxyXG4gICAgUmVxdWVzdEJhY2twYWNrU3VpdDogZnVuY3Rpb24gKHNlbmREYXRhLCBjYWxsYmFjaykge1xyXG4gICAgICAgIHZhciBwb3N0RGF0YSA9IHtcclxuICAgICAgICAgICAgdXJsOiBcImh0dHA6Ly9tLnNhaWtlLmNvbS9zdWl0ZHJlc3MvbXlTdWl0Lmh0bWxcIixcclxuICAgICAgICAgICAgc2VuZERhdGE6IHNlbmREYXRhLFxyXG4gICAgICAgICAgICBjYjogY2FsbGJhY2ssXHJcbiAgICAgICAgICAgIGVyckNiOiB0aGlzLl9lcnJvckNhbGxCYWNrLmJpbmQodGhpcylcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMuc2VuZERhdGEocG9zdERhdGEpO1xyXG4gICAgfSxcclxuICAgIC8vIOW8gOWni+aXtlxyXG4gICAgc3RhcnQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAvLyDluLjnlKjnmoTlj5jph48v5pWw5o2uXHJcbiAgICAgICAgdmFyIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9EYXRhQmFzZScpO1xyXG4gICAgICAgIHZhciBkYXRhQmFzZSA9IGVudC5nZXRDb21wb25lbnQoJ0RhdGFCYXNlJyk7XHJcbiAgICAgICAgdGhpcy5uZXRXb3JrV2luID0gZGF0YUJhc2UubmV0V29ya1dpbjtcclxuICAgIH1cclxufSk7XHJcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnNjcxOGZRNGRoZEZZS29Oa2JSMkUrUlcnLCAnTmV3V29ya1dpbmRvdycpO1xuLy8gc2NyaXB0XFx2aWxsYVxcTmV3V29ya1dpbmRvdy5qc1xuXG52YXIgQ29tcCA9IEZpcmUuQ2xhc3Moe1xuICAgIC8vIOe7p+aJv1xuICAgIGV4dGVuZHM6IEZpcmUuQ29tcG9uZW50LFxuICAgIC8vIOaehOmAoOWHveaVsFxuICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuY2FsbGJhY2tFdmVudCA9IG51bGw7XG4gICAgfSxcbiAgICAvLyDlsZ7mgKdcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIGJ0bl9SZWNvbm5lY3Q6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlVJQnV0dG9uXG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIOW8gOWQr+eql+WPo1xuICAgIG9wZW5XaW5kb3c6IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICB0aGlzLmVudGl0eS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHRoaXMuY2FsbGJhY2tFdmVudCA9IGNhbGxiYWNrO1xuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyDlhbPpl63nqpflj6NcbiAgICBjbG9zZVdpbmRvdzogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcbiAgICB9LFxuICAgIC8vIOmHjeaWsOi/nuaOpeS6i+S7tlxuICAgIF9vblJlY29ubmVjdGlvbkV2ZW50OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5jbG9zZVdpbmRvdygpO1xuICAgICAgICBpZiAodGhpcy5jYWxsYmFja0V2ZW50KSB7XG4gICAgICAgICAgICB0aGlzLmNhbGxiYWNrRXZlbnQoKTtcbiAgICAgICAgICAgIHRoaXMuY2FsbGJhY2tFdmVudCA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIOW8gOWni1xuICAgIHN0YXJ0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIOe7keWumumHjeaWsOi/nuaOpeaMiemSrlxuICAgICAgICB0aGlzLmJ0bl9SZWNvbm5lY3Qub25DbGljayA9IHRoaXMuX29uUmVjb25uZWN0aW9uRXZlbnQuYmluZCh0aGlzKTtcbiAgICB9XG59KTtcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnY2ZlOGJVN2xITkdYWWdyd2JGN1o3RkEnLCAnT3B0aW9ucycpO1xuLy8gc2NyaXB0XFxjb21tb25cXE9wdGlvbnMuanNcblxudmFyIE9wdGlvbnMgPSBGaXJlLkNsYXNzKHtcclxuICAgIC8vIO+/vcyz77+9XHJcbiAgICBleHRlbmRzOiBGaXJlLkNvbXBvbmVudCxcclxuICAgIC8vIO+/ve+/ve+/vey6r++/ve+/vVxyXG4gICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLmFuaW0gPSBudWxsO1xyXG4gICAgICAgIHRoaXMuYmluZEhpZGVPcHRpb25zRXZlbnQgPSB0aGlzLl9oaWRlT3B0aW9uc0V2ZW50LmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5vbkhpZGVFdmVudCA9IG51bGw7XHJcbiAgICB9LFxyXG4gICAgLy8g77+977+977+977+9XHJcbiAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgLy8g77+977+977+977+90aHvv73vv71cclxuICAgICAgICBidG5faGlkZToge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlVJQnV0dG9uXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDJvu+/ve+/ve+/ve+/ve+/ve+/vVxyXG4gICAgICAgIGJ0bl9kZWw6IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5VSUJ1dHRvblxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g77+977+977+977+977+977+916pcclxuICAgICAgICBidG5fTWlycm9yRmxpcDoge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlVJQnV0dG9uXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIO+/vce377+977+977+977+977+977+977+9XHJcbiAgICBoYXNPcGVuOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZW50aXR5LmFjdGl2ZTtcclxuICAgIH0sXHJcbiAgICAvLyDvv73Ht++/ve+/vdC077+977+977+90aHvv73vv71cclxuICAgIGhhc1RvdWNoOiBmdW5jdGlvbiAodGFyZ2V0KSB7XHJcbiAgICAgICAgcmV0dXJuIHRhcmdldCA9PT0gdGhpcy5idG5faGlkZS5lbnRpdHkgfHxcclxuICAgICAgICAgICAgICAgdGFyZ2V0ID09PSB0aGlzLmJ0bl9kZWwuZW50aXR5ICB8fFxyXG4gICAgICAgICAgICAgICB0YXJnZXQgPT09IHRoaXMuYnRuX01pcnJvckZsaXAuZW50aXR5O1xyXG4gICAgfSxcclxuICAgIC8vIO+/ve+/ve+/ve+/ve+/ve+/ve+/ve+/vVxyXG4gICAgc2V0UG9zOiBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgICAgICB0aGlzLmVudGl0eS50cmFuc2Zvcm0ucG9zaXRpb24gPSB2YWx1ZTtcclxuICAgIH0sXHJcbiAgICAvLyDvv73vv73vv73vv73Roe+/ve+/vVxyXG4gICAgb3BlbjogZnVuY3Rpb24gKHRhcmdldCkge1xyXG4gICAgICAgIC8vIO+/ve+/ve+/ve+/ve+/ve+/ve+/ve+/vVxyXG4gICAgICAgIGlmICh0YXJnZXQpIHtcclxuICAgICAgICAgICAgdGhpcy5lbnRpdHkucGFyZW50ID0gbnVsbDtcclxuICAgICAgICAgICAgdGhpcy5zZXRQb3ModGFyZ2V0LnRyYW5zZm9ybS53b3JsZFBvc2l0aW9uKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5lbnRpdHkuYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICBpZiAoISB0aGlzLmFuaW0pIHtcclxuICAgICAgICAgICAgdGhpcy5hbmltID0gdGhpcy5lbnRpdHkuZ2V0Q29tcG9uZW50KEZpcmUuQW5pbWF0aW9uKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5hbmltLnBsYXkoJ29wdGlvbnMnKTtcclxuICAgIH0sXHJcbiAgICAvLyDvv73vv73vv73vv73Roe+/ve+/vVxyXG4gICAgaGlkZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuZW50aXR5LmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMuZW50aXR5LnRyYW5zZm9ybS5zY2FsZSA9IG5ldyBGaXJlLlZlYzIoMCwgMCk7XHJcbiAgICAgICAgaWYgKHRoaXMub25IaWRlRXZlbnQpIHtcclxuICAgICAgICAgICAgdGhpcy5vbkhpZGVFdmVudCgpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvLyDvv73vv73vv73vv73Roe+/ve+/vVxyXG4gICAgX2hpZGVPcHRpb25zRXZlbnQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuaGlkZSgpO1xyXG4gICAgfSxcclxuICAgIC8vIO+/ve+/vcq8XHJcbiAgICBzdGFydDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuYnRuX2hpZGUub25Nb3VzZWRvd24gPSB0aGlzLmJpbmRIaWRlT3B0aW9uc0V2ZW50O1xyXG4gICAgfVxyXG59KTtcclxuXG5GaXJlLl9SRnBvcCgpOyIsIkZpcmUuX1JGcHVzaChtb2R1bGUsICc5NTdlNnNBL0NaT3NZUUVZVkZpU242dScsICdPdGhlck1lbnVNZ3InKTtcbi8vIHNjcmlwdFxcdmlsbGFcXE90aGVyTWVudU1nci5qc1xuXG4vLyDlhbbku5boj5zljZXnrqHnkIbnsbtcbnZhciBPdGhlck1lbnVNZ3IgPSBGaXJlLkNsYXNzKHtcbiAgICAvLyDnu6fmib9cbiAgICBleHRlbmRzOiBGaXJlLkNvbXBvbmVudCxcbiAgICAvLyDmnoTpgKDlh73mlbBcbiAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmNoaWxkcmVuID0gW107XG4gICAgfSxcbiAgICAvLyDlsZ7mgKdcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIG1hcmdpbjogbmV3IEZpcmUuVmVjMigpXG4gICAgfSxcbiAgICAvLyDliIfmjaLmpbzlsYJcbiAgICBfb25DaGFuZ2VGbG9vckV2ZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuZGF0YUJhc2UuZmxvb3JXaW4ub3BlbldpbmRvdygpO1xuICAgIH0sXG4gICAgLy8g6I635Y+W6I+c5Y2V5oyJ6ZKu5bm25LiU57uR5a6a5LqL5Lu2XG4gICAgX2luaXRNZW51OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIGNoaWxkcmVuID0gdGhpcy5lbnRpdHkuZ2V0Q2hpbGRyZW4oKTtcbiAgICAgICAgc2VsZi5jaGlsZHJlbiA9IFtdO1xuICAgICAgICBjaGlsZHJlbi5mb3JFYWNoKGZ1bmN0aW9uIChlbnQpIHtcbiAgICAgICAgICAgIC8vIOe7keWumuaMiemSruS6i+S7tlxuICAgICAgICAgICAgdmFyIGJ0biA9IGVudC5nZXRDb21wb25lbnQoJ1VJQnV0dG9uJyk7XG4gICAgICAgICAgICBpZiAoZW50Lm5hbWUgPT09IFwiMVwiKSB7XG4gICAgICAgICAgICAgICAgYnRuLm9uQ2xpY2sgPSBzZWxmLl9vbkNoYW5nZUZsb29yRXZlbnQuYmluZChzZWxmKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNlbGYuY2hpbGRyZW4ucHVzaChidG4pO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIC8vIOi9veWFpVxuICAgIG9uTG9hZDogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyDluLjnlKjnmoTlj5jph48v5pWw5o2uXG4gICAgICAgIHZhciBnYW1lRGF0YUVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9EYXRhQmFzZScpO1xuICAgICAgICB0aGlzLmRhdGFCYXNlID0gZ2FtZURhdGFFbnQuZ2V0Q29tcG9uZW50KCdEYXRhQmFzZScpO1xuICAgICAgICAvLyDojrflj5boj5zljZXmjInpkq7lubbkuJTnu5Hlrprkuovku7ZcbiAgICAgICAgdGhpcy5faW5pdE1lbnUoKTtcbiAgICB9LFxuICAgIC8vIOW8gOWni1xuICAgIHN0YXJ0OiBmdW5jdGlvbiAoKSB7XG5cbiAgICB9LFxuICAgIC8vIOWIt+aWsFxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyDljLnphY1VSeWIhui+qOeOh1xuICAgICAgICAvL3ZhciBjYW1lcmEgPSBGaXJlLkNhbWVyYS5tYWluO1xuICAgICAgICAvL3ZhciBiZ1dvcmxkQm91bmRzID0gdGhpcy5kYXRhQmFzZS5iZ1JlbmRlci5nZXRXb3JsZEJvdW5kcygpO1xuICAgICAgICAvL3ZhciBiZ1JpZ2h0VG9wV29ybGRQb3MgPSBuZXcgRmlyZS5WZWMyKGJnV29ybGRCb3VuZHMueE1heCwgYmdXb3JsZEJvdW5kcy55TWF4KTtcbiAgICAgICAgLy92YXIgYmdSaWdodFRvcCA9IGNhbWVyYS53b3JsZFRvU2NyZWVuKGJnUmlnaHRUb3BXb3JsZFBvcyk7XG4gICAgICAgIC8vdmFyIHNjcmVlblBvcyA9IG5ldyBGaXJlLlZlYzIoYmdSaWdodFRvcC54LCBiZ1JpZ2h0VG9wLnkpO1xuICAgICAgICAvL3ZhciB3b3JsZFBvcyA9IGNhbWVyYS5zY3JlZW5Ub1dvcmxkKHNjcmVlblBvcyk7XG4gICAgICAgIC8vdGhpcy5lbnRpdHkudHJhbnNmb3JtLndvcmxkUG9zaXRpb24gPSB3b3JsZFBvcztcbiAgICAgICAgLy8g5Yy56YWNVUnliIbovqjnjodcbiAgICAgICAgdmFyIGNhbWVyYSA9IEZpcmUuQ2FtZXJhLm1haW47XG4gICAgICAgIHZhciBzY3JlZW5TaXplID0gRmlyZS5TY3JlZW4uc2l6ZS5tdWwoY2FtZXJhLnNpemUgLyBGaXJlLlNjcmVlbi5oZWlnaHQpO1xuICAgICAgICB2YXIgbmV3UG9zID0gRmlyZS52MihzY3JlZW5TaXplLnggLyAyICsgdGhpcy5tYXJnaW4ueCwgc2NyZWVuU2l6ZS55IC8gMiAtIHRoaXMubWFyZ2luLnkpO1xuICAgICAgICB0aGlzLmVudGl0eS50cmFuc2Zvcm0ucG9zaXRpb24gPSBuZXdQb3M7XG4gICAgfVxufSk7XG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJ2NhN2U5dVQ4N05DMGJER2w0b3lyNlFRJywgJ1BheU1lbnRXaW5kb3cnKTtcbi8vIHNjcmlwdFxcdmlsbGFcXFBheU1lbnRXaW5kb3cuanNcblxudmFyIFBheU1lbnRXaW5kb3cgPSBGaXJlLkNsYXNzKHtcbiAgICAvLyDnu6fmib9cbiAgICBleHRlbmRzOiBGaXJlLkNvbXBvbmVudCxcbiAgICAvLyDmnoTpgKDlh73mlbBcbiAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyDmmL7npLrmlbDph49cbiAgICAgICAgdGhpcy5fc2hvd0NvdW50ID0gMztcbiAgICAgICAgLy8g5b2T5YmN5oC75pWwXG4gICAgICAgIHRoaXMuX2N1clRvdGFsID0gMDtcbiAgICAgICAgLy8g5b2T5YmN6aG1XG4gICAgICAgIHRoaXMuX2N1clBhZ2UgPSAxO1xuICAgICAgICAvLyDmnIDlpKfpobXnrb5cbiAgICAgICAgdGhpcy5fbWF4UGFnZSA9IDE7XG4gICAgICAgIC8vIOWVhuWTgeWuueWZqFxuICAgICAgICB0aGlzLm1lcmNoYW5kaXNlTGlzdCA9IFtdO1xuICAgICAgICAvLyDllYblk4HmlbDmja5cbiAgICAgICAgdGhpcy5tZXJjaGFuZGlzZURhdGFMaXN0ID0gW107XG4gICAgfSxcbiAgICAvLyDlsZ7mgKdcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIHJvb3Q6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLkVudGl0eVxuICAgICAgICB9LFxuICAgICAgICAvLyDliKDpmaTnqpflj6NcbiAgICAgICAgYnRuX2Nsb3NlOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5VSUJ1dHRvblxuICAgICAgICB9LFxuICAgICAgICAvLyDnoa7orqTmlK/ku5hcbiAgICAgICAgYnRuX3BheToge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVUlCdXR0b25cbiAgICAgICAgfSxcbiAgICAgICAgLy8g55So5oi36YeR6aKdXG4gICAgICAgIHVzZXJQcmljZToge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVGV4dFxuICAgICAgICB9LFxuICAgICAgICAvLyDnq4vljbPlhYXlgLxcbiAgICAgICAgYnRuX1JlY2hhcmdlOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5VSUJ1dHRvblxuICAgICAgICB9LFxuICAgICAgICAvLyDlkIjorqHnianlk4HkuI7mnInmlYjmnJ/pmZDmloflrZfmj4/ov7BcbiAgICAgICAgbnVtQW5kRHVyYXRpb246IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlRleHRcbiAgICAgICAgfSxcbiAgICAgICAgLy8g5oC75Lu35qC85LiO5oC75pSv5LuYXG4gICAgICAgIHByaWNlRGVzY3JpcHRpb246IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlByaWNlRGVzY3JpcHRpb25cbiAgICAgICAgfSxcbiAgICAgICAgLy8g5o6n5Yi25bqV6YOo54mp5Lu255qE6auY5bqmXG4gICAgICAgIGJvdHRvbVJvb3Q6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLkVudGl0eVxuICAgICAgICB9LFxuICAgICAgICAvLyDlkIjorqHnianlk4HkuI7mnInmlYjmnJ/pmZDmloflrZfmj4/ov7BcbiAgICAgICAgcGFnZToge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVGV4dFxuICAgICAgICB9LFxuICAgICAgICAvLyDkuIrkuIDpobVcbiAgICAgICAgYnRuX1ByZXZpb3VzOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5VSUJ1dHRvblxuICAgICAgICB9LFxuICAgICAgICAvLyDkuIvkuIDpobVcbiAgICAgICAgYm50X05leHQ6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlVJQnV0dG9uXG4gICAgICAgIH0sXG4gICAgICAgIC8vIOayoei0reeJqeeahOWbvuagh+aPkOekulxuICAgICAgICBudWxsVGlwczoge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuRW50aXR5XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIOWFs+mXreaMiemSruS6i+S7tlxuICAgIF9vbkNsb3NlV2luZG93RXZlbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5kYXRhQmFzZS5maXJzdE1lbnVNZ3Iub3Blbk1lbnUoKTtcbiAgICAgICAgdGhpcy5jbG9zZVdpbmRvdygpO1xuICAgIH0sXG4gICAgLy8g5YWF5YC8XG4gICAgX29uUmVjaGFyZ2VFdmVudDogZnVuY3Rpb24gKCkge1xuICAgICAgICB3aW5kb3cub3BlbignaHR0cDovL3d3dy5zYWlrZS5jb20vbl9wYXkvY2hhcmdlLnBocCcpO1xuICAgICAgICB0aGlzLmRhdGFCYXNlLnBheU1lbnRUaXBzLm9wZW5UaXBzKCk7XG4gICAgfSxcbiAgICAvLyDnoa7orqTmlK/ku5hcbiAgICBfb25QYXlFdmVudDogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHNlbGYuZGF0YUJhc2UudGlwc1dpbmRvdy5vcGVuVGlwc1dpbmRvdygn5oKo56Gu5a6a6Iqx6LS5JysgdGhpcy5wYXlOdW0gKydD5biB6LSt5Lmw77yfJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHNlbGYuZGF0YUJhc2UudXNlcmNjIDwgc2VsZi5wYXlOdW0pIHtcbiAgICAgICAgICAgICAgICBzZWxmLmRhdGFCYXNlLnRpcHNXaW5kb3cub3BlblRpcHNXaW5kb3coJ+aCqOW9k+WJjeS9memineS4jei2sywg5piv5ZCm5YWF5YC877yfJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLl9vblJlY2hhcmdlRXZlbnQoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHNlbGYuX3BheSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9LFxuICAgIC8vIOaUr+S7mFxuICAgIF9wYXk6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICBzZWxmLmRhdGFCYXNlLmxvYWRUaXBzLm9wZW5UaXBzKCfmlK/ku5jkuK3vvIHor7fnqI3lkI4uLi4nKTtcbiAgICAgICAgc2VsZi5kYXRhQmFzZS5zYXZlUm9vbShmdW5jdGlvbiAoc2VydmVyVXNlcmNjKSB7XG4gICAgICAgICAgICBzZWxmLmRhdGFCYXNlLnVzZXJjYyA9IHNlcnZlclVzZXJjYztcbiAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UuY3VyRHJlc3NTdWl0LnByaWNlID0gMDtcbiAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UuaGFzQ2FuU2F2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS5zYXZlRGVmYXVsdERhdGEoKTtcbiAgICAgICAgICAgIHNlbGYuY2xvc2VXaW5kb3coKTtcbiAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UubG9hZFRpcHMuY2xvc2VUaXBzKCk7XG4gICAgICAgICAgICBzZWxmLmRhdGFCYXNlLnRpcHNXaW5kb3cub3BlblRpcHNXaW5kb3coJ+aUr+S7mOaIkOWKn++8jOW5tuS/neWtmOijheaJri4uJyk7XG4gICAgICAgICAgICBzZWxmLmRhdGFCYXNlLnJlc2V0U2NyZWVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgc2VuZERhdGEgPSB7XG4gICAgICAgICAgICAgICAgICAgIG1hcms6IHNlbGYuZGF0YUJhc2UubWFya1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS5sb2FkVGlwcy5vcGVuVGlwcygn5Yi35paw5Zy65pmv77yM6K+356iN5ZCOLi4uJyk7XG4gICAgICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS5pbnRvUm9vbShzZW5kRGF0YSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmRhdGFCYXNlLmxvYWRUaXBzLmNsb3NlVGlwcygpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLy8g5LiK5LiA6aG1XG4gICAgX29uUHJldmlvdXNFdmVudDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLl9jdXJQYWdlIC09IDE7XG4gICAgICAgIGlmICh0aGlzLl9jdXJQYWdlIDwgMSl7XG4gICAgICAgICAgICB0aGlzLl9jdXJQYWdlID0gMTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9yZWZyZXNoTWVyY2hhbmRpc2UoKTtcbiAgICB9LFxuICAgIC8vIOS4i+S4gOmhtVxuICAgIF9vbk5leHRFdmVudDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLl9jdXJQYWdlICs9IDE7XG4gICAgICAgIGlmICh0aGlzLl9jdXJQYWdlID4gdGhpcy5fbWF4UGFnZSl7XG4gICAgICAgICAgICB0aGlzLl9jdXJQYWdlID0gdGhpcy5fbWF4UGFnZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9yZWZyZXNoTWVyY2hhbmRpc2UoKTtcbiAgICB9LFxuICAgIC8vIOmHjee9ruWVhuWTgeWIl+ihqFxuICAgIF9yZXNldE1lcmNoYW5kaXNlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBjaGlsZHJlbiA9IHRoaXMubWVyY2hhbmRpc2VMaXN0O1xuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIHZhciBjb21wID0gY2hpbGRyZW5baV07XG4gICAgICAgICAgICBjb21wLnJlc2V0KCk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIOmHjee9rueql+WPo1xuICAgIF9yZXNldFdpbmRvdzogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyDph43nva7llYblk4HliJfooahcbiAgICAgICAgdGhpcy5fcmVzZXRNZXJjaGFuZGlzZSgpO1xuICAgICAgICAvLyDph43nva7lkIjorqHnianlk4HkuI7mnInmlYjmnJ/pmZDmloflrZfmj4/ov7BcbiAgICAgICAgdGhpcy5udW1BbmREdXJhdGlvbi50ZXh0ID0gJ+WQiOiuoTogMOS7tueJqeWTgSwg5pyJ5pWI5pyfOjDlpKknO1xuICAgICAgICB0aGlzLm51bUFuZER1cmF0aW9uLmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgLy8g6YeN572u5oC75Lu35qC85LiO5oC75pSv5LuYXG4gICAgICAgIHRoaXMucHJpY2VEZXNjcmlwdGlvbi5yZXNldCgpO1xuICAgICAgICAvLyDph43nva7nlKjmiLfkvZnpop1cbiAgICAgICAgdGhpcy51c2VyUHJpY2UudGV4dCA9ICfnlKjmiLfkvZnpop06IDBD5biBJztcbiAgICAgICAgLy8g6YeN572u6aG1562+XG4gICAgICAgIHRoaXMuX2N1clBhZ2UgPSAxO1xuICAgICAgICB0aGlzLl9tYXhQYWdlID0gMTtcbiAgICAgICAgdGhpcy5wYWdlLmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgLy8g5Yi35paw5oyJ6ZKu54q25oCBXG4gICAgICAgIHRoaXMuX3JlZnJlc2hCdG5TdGF0ZSgpO1xuICAgIH0sXG4gICAgLy8g5Yi35paw5ZWG5ZOB5pWw5o2uXG4gICAgX3JlZnJlc2hNZXJjaGFuZGlzZURhdGFMaXN0OiBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgICAgdGhpcy5tZXJjaGFuZGlzZURhdGFMaXN0ID0gW107XG4gICAgICAgIHZhciBkYXRhID0ge307XG4gICAgICAgIC8vIOWll+ijhVxuICAgICAgICB2YXIgZHJlc3NTdWl0ID0gdGhpcy5kYXRhQmFzZS5jdXJEcmVzc1N1aXQ7XG4gICAgICAgIGlmIChkcmVzc1N1aXQucHJpY2UgPiAwKSB7XG4gICAgICAgICAgICBkYXRhID0ge1xuICAgICAgICAgICAgICAgIGljb246IGRyZXNzU3VpdC5zdWl0X2ljb24sXG4gICAgICAgICAgICAgICAgdE5hbWU6IGRyZXNzU3VpdC5zdWl0X25hbWUsXG4gICAgICAgICAgICAgICAgdE51bTogMSxcbiAgICAgICAgICAgICAgICBwcmljZTogZHJlc3NTdWl0LnByaWNlLFxuICAgICAgICAgICAgICAgIGRpc2NvdW50OiBkcmVzc1N1aXQuZGlzY291bnRcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB0aGlzLm1lcmNoYW5kaXNlRGF0YUxpc3QucHVzaChkYXRhKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBjaGlsZHJlbiA9IHRoaXMuZGF0YUJhc2Uucm9vbS5nZXRDaGlsZHJlbigpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICB2YXIgZW50ID0gY2hpbGRyZW5baV07XG4gICAgICAgICAgICB2YXIgZnVybml0dXJlID0gZW50LmdldENvbXBvbmVudCgnRnVybml0dXJlJyk7XG4gICAgICAgICAgICBpZiAocGFyc2VJbnQoZnVybml0dXJlLnByaWNlKSA+IDAgJiYgZnVybml0dXJlLnN1aXRfaWQgPT09IDApIHtcbiAgICAgICAgICAgICAgICBkYXRhID0ge1xuICAgICAgICAgICAgICAgICAgICBpY29uOiBmdXJuaXR1cmUuc21hbGxTcHJpdGUsXG4gICAgICAgICAgICAgICAgICAgIHROYW1lOiBmdXJuaXR1cmUucHJvcHNfbmFtZSxcbiAgICAgICAgICAgICAgICAgICAgdE51bTogMSxcbiAgICAgICAgICAgICAgICAgICAgcHJpY2U6IGZ1cm5pdHVyZS5wcmljZSxcbiAgICAgICAgICAgICAgICAgICAgZGlzY291bnQ6IGZ1cm5pdHVyZS5kaXNjb3VudFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdGhpcy5tZXJjaGFuZGlzZURhdGFMaXN0LnB1c2goZGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyDliLfmlrDllYblk4FcbiAgICBfcmVmcmVzaE1lcmNoYW5kaXNlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIOmHjee9ruWVhuWTgeWIl+ihqFxuICAgICAgICB0aGlzLl9yZXNldE1lcmNoYW5kaXNlKCk7XG4gICAgICAgIC8vIOiOt+WPluWVhuWTgeaVsOaNrlxuICAgICAgICB2YXIgZGF0YUxpc3QgPSB0aGlzLm1lcmNoYW5kaXNlRGF0YUxpc3Q7XG4gICAgICAgIHZhciB0b3RhbCA9IGRhdGFMaXN0Lmxlbmd0aDtcbiAgICAgICAgaWYgKHRoaXMuX2N1clRvdGFsICE9PSB0b3RhbCkge1xuICAgICAgICAgICAgdGhpcy5fY3VyVG90YWwgPSB0b3RhbDtcbiAgICAgICAgICAgIHRoaXMuX21heFBhZ2UgPSBNYXRoLmNlaWwodGhpcy5fY3VyVG90YWwgLyB0aGlzLl9zaG93Q291bnQpO1xuICAgICAgICB9XG4gICAgICAgIC8vIOi1i+WAvOaVsOaNrlxuICAgICAgICB2YXIgc3RhcnROdW0gPSAodGhpcy5fY3VyUGFnZSAtIDEpICogdGhpcy5fc2hvd0NvdW50O1xuICAgICAgICB2YXIgZW5kTnVtID0gc3RhcnROdW0gKyB0aGlzLl9zaG93Q291bnQ7XG4gICAgICAgIGlmIChlbmROdW0gPiB0aGlzLl9jdXJUb3RhbCkge1xuICAgICAgICAgICAgZW5kTnVtID0gdGhpcy5fY3VyVG90YWw7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGluZGV4ID0gMDtcbiAgICAgICAgZm9yKHZhciBpID0gc3RhcnROdW07IGkgPCBlbmROdW07ICsraSkge1xuICAgICAgICAgICAgdmFyIG1lbnUgPSB0aGlzLm1lcmNoYW5kaXNlTGlzdFtpbmRleF07XG4gICAgICAgICAgICB2YXIgZGF0YSA9IGRhdGFMaXN0W2ldO1xuICAgICAgICAgICAgZGF0YS50aWQgPSBpO1xuICAgICAgICAgICAgbWVudS5yZWZyZXNoKGRhdGEsIHRoaXMuYmluZERlbE1lcmNoYW5kaXNlRXZlbnQsIHRoaXMuYmluZFJlZnJlc2hOdW1FdmVudCk7XG4gICAgICAgICAgICBpbmRleCsrO1xuICAgICAgICB9XG4gICAgICAgIC8vIOWQiOiuoeeJqeWTgeS4juacieaViOWkqeaVsFxuICAgICAgICB0aGlzLm51bUFuZER1cmF0aW9uLnRleHQgPSAn5ZCI6K6hOiAnICsgdG90YWwgKyAn5Lu254mp5ZOBLCDmnInmlYjmnJ86OTDlpKknO1xuICAgICAgICB0aGlzLm51bUFuZER1cmF0aW9uLmVudGl0eS5hY3RpdmUgPSB0b3RhbCA+IDA7XG4gICAgICAgIHRoaXMubnVsbFRpcHMuYWN0aXZlID0gdG90YWwgPT09IDA7XG4gICAgICAgIC8vIOaAu+S7t+agvCDkuI4g5oqY5ZCO5Lu3IOmcgOimgeaUr+S7mFxuICAgICAgICB0aGlzLl9yZWZyZXNoQWxsUHJpY2UoKTtcbiAgICAgICAgLy8g55So5oi35L2Z6aKdXG4gICAgICAgIHRoaXMucmVmcmVzaFVzZXJDQygpO1xuICAgICAgICAvLyDliLfmlrDmjInpkq7nirbmgIFcbiAgICAgICAgdGhpcy5fcmVmcmVzaEJ0blN0YXRlKCk7XG4gICAgfSxcbiAgICAvLyDliLfmlrDnlKjmiLfkvZnpop1cbiAgICByZWZyZXNoVXNlckNDOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMudXNlclByaWNlLnRleHQgPSAn55So5oi35L2Z6aKdOiAnICsgdGhpcy5kYXRhQmFzZS51c2VyY2MgKyAnQ+W4gSc7XG4gICAgfSxcbiAgICAvLyDliLfmlrDmiYDmnInku7fmoLxcbiAgICBfcmVmcmVzaEFsbFByaWNlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIOaAu+S7t+agvCDmipjlkI7ku7cg6ZyA6KaB5pSv5LuYXG4gICAgICAgIHZhciB0b3RhbCA9IDAsIGRpc2NvdW50ID0gMCwgcGF5ID0gMDtcbiAgICAgICAgdmFyIGRhdGFMaXN0ID0gdGhpcy5tZXJjaGFuZGlzZURhdGFMaXN0O1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRhdGFMaXN0Lmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IGRhdGFMaXN0W2ldO1xuICAgICAgICAgICAgdmFyIHByaWNlID0gZGF0YS50TnVtICogZGF0YS5wcmljZTtcbiAgICAgICAgICAgIHRvdGFsICs9IHByaWNlO1xuICAgICAgICAgICAgdmFyIGRpY291bnRQcmljZSA9IHByaWNlICogZGF0YS5kaXNjb3VudDtcbiAgICAgICAgICAgIGRpc2NvdW50ICs9IGRpY291bnRQcmljZTtcbiAgICAgICAgfVxuICAgICAgICBwYXkgPSBkaXNjb3VudDtcbiAgICAgICAgdGhpcy5wYXlOdW0gPSBwYXk7XG4gICAgICAgIHRoaXMucHJpY2VEZXNjcmlwdGlvbi5yZWZyZXNoKHRvdGFsLCBkaXNjb3VudCwgcGF5KTtcbiAgICB9LFxuICAgIC8vIOWIt+aWsOaVsOmHj1xuICAgIF9vblJlZnJlc2hOdW1FdmVudDogZnVuY3Rpb24gKGlkLCBudW0pIHtcbiAgICAgICAgaWYgKHRoaXMubWVyY2hhbmRpc2VEYXRhTGlzdC5sZW5ndGggPiBpZCkge1xuICAgICAgICAgICAgdmFyIGRhdGEgPSB0aGlzLm1lcmNoYW5kaXNlRGF0YUxpc3RbaWRdO1xuICAgICAgICAgICAgZGF0YS50TnVtID0gbnVtO1xuICAgICAgICAgICAgdGhpcy5fcmVmcmVzaEFsbFByaWNlKCk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIOWIt+aWsOaMiemSrueKtuaAgVxuICAgIF9yZWZyZXNoQnRuU3RhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5idG5fUHJldmlvdXMuZW50aXR5LmFjdGl2ZSA9IHRoaXMuX2N1clBhZ2UgPiAxO1xuICAgICAgICB0aGlzLmJudF9OZXh0LmVudGl0eS5hY3RpdmUgPSB0aGlzLl9jdXJQYWdlIDwgdGhpcy5fbWF4UGFnZTtcbiAgICAgICAgdGhpcy5wYWdlLnRleHQgPSB0aGlzLl9jdXJQYWdlICsgXCIvXCIgKyB0aGlzLl9tYXhQYWdlO1xuICAgIH0sXG4gICAgLy8g5Yig6Zmk5Y2V5Liq5ZWG5ZOBXG4gICAgX29uRGVsTWVyY2hhbmRpc2VFdmVudDogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIHZhciBtZXJjaGFuZGlzZSA9IGV2ZW50LnRhcmdldC5wYXJlbnQuZ2V0Q29tcG9uZW50KCdNZXJjaGFuZGlzZScpO1xuICAgICAgICBpZiAobWVyY2hhbmRpc2UgJiYgdGhpcy5tZXJjaGFuZGlzZURhdGFMaXN0Lmxlbmd0aCA+IG1lcmNoYW5kaXNlLnRpZCkge1xuICAgICAgICAgICAgdGhpcy5tZXJjaGFuZGlzZURhdGFMaXN0LnNwbGljZShtZXJjaGFuZGlzZS50aWQsIDEpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3JlZnJlc2hNZXJjaGFuZGlzZSgpO1xuICAgIH0sXG4gICAgLy8g5byA5ZCv56qX5Y+jXG4gICAgb3BlbldpbmRvdzogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnBheU51bSA9IDA7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgLy9cbiAgICAgICAgc2VsZi5kYXRhQmFzZS5maXJzdE1lbnVNZ3IuY2xvc2VNZW51KCk7XG4gICAgICAgIC8vIOmHjee9rueql+WPo+aVsOaNrlxuICAgICAgICBzZWxmLl9yZXNldFdpbmRvdygpO1xuICAgICAgICAvLyDmmL7npLrnqpflj6NcbiAgICAgICAgc2VsZi5lbnRpdHkuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgLy8g5Yi35paw5ZWG5ZOB5pWw5o2uXG4gICAgICAgIHNlbGYuX3JlZnJlc2hNZXJjaGFuZGlzZURhdGFMaXN0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vIOWIt+aWsOWVhuWTgVxuICAgICAgICAgICAgc2VsZi5fcmVmcmVzaE1lcmNoYW5kaXNlKCk7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLy8g5YWz6Zet56qX5Y+jXG4gICAgY2xvc2VXaW5kb3c6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5lbnRpdHkuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX2N1clBhZ2UgPSAxO1xuICAgIH0sXG4gICAgLy8g5byA5aeLXG4gICAgc3RhcnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8g5bi455So55qE5Y+Y6YePL+aVsOaNrlxuICAgICAgICB2YXIgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL0RhdGFCYXNlJyk7XG4gICAgICAgIHRoaXMuZGF0YUJhc2UgPSBlbnQuZ2V0Q29tcG9uZW50KCdEYXRhQmFzZScpO1xuICAgICAgICAvL1xuICAgICAgICB0aGlzLnBheU51bSA9IDA7XG4gICAgICAgIC8vXG4gICAgICAgIHZhciBjaGlsZHJlbiA9IHRoaXMucm9vdC5nZXRDaGlsZHJlbigpO1xuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIGVudCA9IGNoaWxkcmVuW2ldO1xuICAgICAgICAgICAgdmFyIGNvbXAgPSBlbnQuZ2V0Q29tcG9uZW50KCdNZXJjaGFuZGlzZScpO1xuICAgICAgICAgICAgdGhpcy5tZXJjaGFuZGlzZUxpc3QucHVzaChjb21wKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmJpbmRSZWZyZXNoTnVtRXZlbnQgPSB0aGlzLl9vblJlZnJlc2hOdW1FdmVudC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmJpbmREZWxNZXJjaGFuZGlzZUV2ZW50ID0gdGhpcy5fb25EZWxNZXJjaGFuZGlzZUV2ZW50LmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuYnRuX2Nsb3NlLm9uQ2xpY2sgPSB0aGlzLl9vbkNsb3NlV2luZG93RXZlbnQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5idG5fcGF5Lm9uQ2xpY2sgPSB0aGlzLl9vblBheUV2ZW50LmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuYnRuX1ByZXZpb3VzLm9uQ2xpY2sgPSB0aGlzLl9vblByZXZpb3VzRXZlbnQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5ibnRfTmV4dC5vbkNsaWNrID0gdGhpcy5fb25OZXh0RXZlbnQuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5idG5fUmVjaGFyZ2Uub25DbGljayA9IHRoaXMuX29uUmVjaGFyZ2VFdmVudC5iaW5kKHRoaXMpO1xuICAgIH1cbn0pO1xuXG5GaXJlLl9SRnBvcCgpOyIsIkZpcmUuX1JGcHVzaChtb2R1bGUsICc5MDJlY3ViZEpwR2haaXpNUHk0bW1TaCcsICdQcmljZURlc2NyaXB0aW9uJyk7XG4vLyBzY3JpcHRcXHZpbGxhXFxQcmljZURlc2NyaXB0aW9uLmpzXG5cbnZhciBQcmljZURlc2NyaXB0aW9uID0gRmlyZS5DbGFzcyh7XG4gICAgZXh0ZW5kczogRmlyZS5Db21wb25lbnQsXG5cbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIHRvdGFsOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5UZXh0XG4gICAgICAgIH0sXG4gICAgICAgIGRpc2NvdW50OiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5UZXh0XG4gICAgICAgIH0sXG4gICAgICAgIHBheToge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVGV4dFxuICAgICAgICB9XG4gICAgfSxcbiAgICAvL1xuICAgIHJlc2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMudG90YWwudGV4dCA9ICcwLjAwQ+W4gSc7XG4gICAgICAgIHRoaXMuZGlzY291bnQudGV4dCA9ICcwLjAwQ+W4gSc7XG4gICAgICAgIHRoaXMucGF5LnRleHQgPSAnMC4wMEPluIEnO1xuICAgICAgICB0aGlzLmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcbiAgICB9LFxuICAgIC8vIOWIt+aWsFxuICAgIHJlZnJlc2g6IGZ1bmN0aW9uICh0b3RhbCwgZGlzY291bnQsIHBheSkge1xuICAgICAgICB0aGlzLnRvdGFsLnRleHQgPSAodG90YWwgfHwgMCkgKyAnQ+W4gSc7XG4gICAgICAgIHRoaXMuZGlzY291bnQudGV4dCA9IChkaXNjb3VudCB8fCAwKSArICdD5biBJztcbiAgICAgICAgdGhpcy5wYXkudGV4dCA9IChwYXkgfHwgMCkgKyAnQ+W4gSc7XG4gICAgICAgIHRoaXMuZW50aXR5LmFjdGl2ZSA9IHRydWU7XG4gICAgfVxufSk7XG5cbkZpcmUuUHJpY2VEZXNjcmlwdGlvbiA9IFByaWNlRGVzY3JpcHRpb247XG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJzUzNGIxbSs0THBIbzUzUXJtU1BMOWNEJywgJ1NDb250cm9sTWdyJyk7XG4vLyBzY3JpcHRcXHNpbmdsZVxcU0NvbnRyb2xNZ3IuanNcblxuLy8g77+9w7vvv73vv73vv73vv73vv73vv73vv73vv73vv73vv73vv71cclxudmFyIFNDb250cm9sTWdyID0gRmlyZS5DbGFzcyh7XHJcbiAgICAvLyDvv73Ms++/vVxyXG4gICAgZXh0ZW5kczogRmlyZS5Db21wb25lbnQsXHJcbiAgICAvLyDvv73vv73vv73suq/vv73vv71cclxuICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5iaW5kZWRNb3VzZURvd25FdmVudCA9IHRoaXMuX29uTW91c2VEb3duRXZlbnQuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLmJpbmRlZE1vdXNlTW92ZUV2ZW50ID0gdGhpcy5fb25Nb3VzZU1vdmVFdmVudC5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuYmluZGVkTW91c2VVcEV2ZW50ID0gdGhpcy5fb25Nb3VzZVVwRXZlbnQuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLl9iYWNrdXBTZWxlY3RUYXJnZXQgPSBudWxsO1xyXG4gICAgfSxcclxuICAgIC8vIO+/ve+/ve+/ve+/vVxyXG4gICAgcHJvcGVydGllczoge1xyXG4gICAgICAgIF9zZWxlY3RUYXJnZXQ6IG51bGwsXHJcbiAgICAgICAgX2xhc3RTZWxlY3RUYXJnZXQ6IG51bGwsXHJcbiAgICAgICAgX3NlbGVjdFRhcmdldEluaXRQb3M6IEZpcmUuVmVjMi56ZXJvLFxyXG4gICAgICAgIF9tb3VzZURvd25Qb3M6IEZpcmUuVmVjMi56ZXJvLFxyXG4gICAgICAgIF9oYXNNb3ZlVGFyZ2V0OiBmYWxzZVxyXG4gICAgfSxcclxuICAgIC8vIO+/ve+/ve+/veqwtO+/ve+/ve+/vcK877+9XHJcbiAgICBfb25Nb3VzZURvd25FdmVudDogZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgICAgdmFyIHRhcmdldCA9IGV2ZW50LnRhcmdldDtcclxuICAgICAgICBpZiAoIXRhcmdldCApIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgZnVybml0dXJlID0gdGFyZ2V0LmdldENvbXBvbmVudCgnU0Z1cm5pdHVyZScpO1xyXG4gICAgICAgIGlmIChmdXJuaXR1cmUgJiYgZnVybml0dXJlLmhhc0RyYWcpIHtcclxuICAgICAgICAgICAgLy9cclxuICAgICAgICAgICAgdGhpcy5fc2VsZWN0VGFyZ2V0ID0gdGFyZ2V0O1xyXG4gICAgICAgICAgICB0aGlzLl9iYWNrdXBTZWxlY3RUYXJnZXQgPSB0aGlzLl9zZWxlY3RUYXJnZXQ7XHJcbiAgICAgICAgICAgIHRoaXMuX3NlbGVjdFRhcmdldEluaXRQb3MgPSB0YXJnZXQudHJhbnNmb3JtLnBvc2l0aW9uO1xyXG4gICAgICAgICAgICB2YXIgc2NyZWVuZFBvcyA9IG5ldyBGaXJlLlZlYzIoZXZlbnQuc2NyZWVuWCwgZXZlbnQuc2NyZWVuWSk7XHJcbiAgICAgICAgICAgIHRoaXMuX21vdXNlRG93blBvcyA9IEZpcmUuQ2FtZXJhLm1haW4uc2NyZWVuVG9Xb3JsZChzY3JlZW5kUG9zKTtcclxuICAgICAgICAgICAgdGhpcy5fc2VsZWN0VGFyZ2V0LnNldEFzTGFzdFNpYmxpbmcoKTtcclxuICAgICAgICAgICAgdGhpcy5faGFzTW92ZVRhcmdldCA9IHRydWU7XHJcbiAgICAgICAgICAgIC8vIO+/vce377+977+98r+qv++/ve+/ve+/vdGh77+97qOs77+977+977+977+977+977+977+977+9zazvv73Etu+/ve+/ve+/ve+/vc2y77+977+977+90qrvv73vv73vv73CtO+/ve+/ve+/vVxyXG4gICAgICAgICAgICBpZiAodGhpcy5fc2VsZWN0VGFyZ2V0ICE9PSB0aGlzLl9sYXN0U2VsZWN0VGFyZ2V0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNkYXRhQmFzZS5vcHRpb25zLm9wZW4odGhpcy5fc2VsZWN0VGFyZ2V0KTtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2xhc3RTZWxlY3RUYXJnZXQgPSB0aGlzLl9zZWxlY3RUYXJnZXQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLnNkYXRhQmFzZS5vcHRpb25zLmhhc09wZW4oKSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc2RhdGFCYXNlLm9wdGlvbnMuaGFzVG91Y2godGFyZ2V0KSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3NlbGVjdFRhcmdldCA9IHRoaXMuX2JhY2t1cFNlbGVjdFRhcmdldDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3NlbGVjdFRhcmdldCA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZGF0YUJhc2Uub3B0aW9ucy5oaWRlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8g77+977+977+977+977+9xrbvv73vv73CvO+/vVxyXG4gICAgX29uTW91c2VNb3ZlRXZlbnQ6IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9zZWxlY3RUYXJnZXQgJiYgdGhpcy5faGFzTW92ZVRhcmdldCkge1xyXG4gICAgICAgICAgICB0aGlzLl9tb3ZlKGV2ZW50KTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8g77+9xrbvv73vv73Svu+/vVxyXG4gICAgX21vdmU6IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgIHZhciBtb3ZlUG9zID0gbmV3IEZpcmUuVmVjMihldmVudC5zY3JlZW5YLCBldmVudC5zY3JlZW5ZKTtcclxuICAgICAgICB2YXIgbW92ZVdvcmRQb3MgPSBGaXJlLkNhbWVyYS5tYWluLnNjcmVlblRvV29ybGQobW92ZVBvcyk7XHJcblxyXG4gICAgICAgIHZhciBvZmZzZXRXb3JkUG9zID0gRmlyZS5WZWMyLnplcm87XHJcbiAgICAgICAgb2Zmc2V0V29yZFBvcy54ID0gdGhpcy5fbW91c2VEb3duUG9zLnggLSBtb3ZlV29yZFBvcy54O1xyXG4gICAgICAgIG9mZnNldFdvcmRQb3MueSA9IHRoaXMuX21vdXNlRG93blBvcy55IC0gbW92ZVdvcmRQb3MueTtcclxuXHJcbiAgICAgICAgdGhpcy5fc2VsZWN0VGFyZ2V0LnRyYW5zZm9ybS54ID0gdGhpcy5fc2VsZWN0VGFyZ2V0SW5pdFBvcy54IC0gb2Zmc2V0V29yZFBvcy54O1xyXG4gICAgICAgIHRoaXMuX3NlbGVjdFRhcmdldC50cmFuc2Zvcm0ueSA9IHRoaXMuX3NlbGVjdFRhcmdldEluaXRQb3MueSAtIG9mZnNldFdvcmRQb3MueTtcclxuXHJcbiAgICAgICAgdGhpcy5zZGF0YUJhc2Uub3B0aW9ucy5zZXRQb3ModGhpcy5fc2VsZWN0VGFyZ2V0LnRyYW5zZm9ybS53b3JsZFBvc2l0aW9uKTtcclxuICAgIH0sXHJcbiAgICAvLyDvv73vv73vv73vv73vv73Nt++/ve+/vcK877+9XHJcbiAgICBfb25Nb3VzZVVwRXZlbnQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLl9oYXNNb3ZlVGFyZ2V0ID0gZmFsc2U7XHJcbiAgICB9LFxyXG4gICAgLy8g77+977+977+92L/vv73vv73vv73Roe+/ve+/vVxyXG4gICAgX29uSGlkZUV2ZW50OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5fc2VsZWN0VGFyZ2V0ID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9iYWNrdXBTZWxlY3RUYXJnZXQgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX2xhc3RTZWxlY3RUYXJnZXQgPSBudWxsO1xyXG4gICAgfSxcclxuICAgIC8vIO+/ve+/vdeq77+977+977+977+9XHJcbiAgICBfb25NaXJyb3JGbGlwRXZlbnQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAodGhpcy5fc2VsZWN0VGFyZ2V0KSB7XHJcbiAgICAgICAgICAgIHZhciBzY2FsZVggPSB0aGlzLl9zZWxlY3RUYXJnZXQudHJhbnNmb3JtLnNjYWxlWDtcclxuICAgICAgICAgICAgdGhpcy5fc2VsZWN0VGFyZ2V0LnRyYW5zZm9ybS5zY2FsZVggPSBzY2FsZVggPiAxID8gLXNjYWxlWCA6IE1hdGguYWJzKHNjYWxlWCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIMm+77+977+90aHvv73vv73vv73vv73vv73vv71cclxuICAgIF9vbkRlbGV0ZVRhcmdldEV2ZW50OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5fc2VsZWN0VGFyZ2V0LmRlc3Ryb3koKTtcclxuICAgICAgICB0aGlzLl9zZWxlY3RUYXJnZXQgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX2JhY2t1cFNlbGVjdFRhcmdldCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fbGFzdFNlbGVjdFRhcmdldCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5zZGF0YUJhc2Uub3B0aW9ucy5oaWRlKCk7XHJcbiAgICB9LFxyXG4gICAgLy8g77+977+977+977+9XHJcbiAgICByZXNldDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuc2RhdGFCYXNlLm9wdGlvbnMuaGlkZSgpO1xyXG4gICAgICAgIHRoaXMuX3NlbGVjdFRhcmdldCA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5fYmFja3VwU2VsZWN0VGFyZ2V0ID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9sYXN0U2VsZWN0VGFyZ2V0ID0gbnVsbDtcclxuICAgIH0sXHJcbiAgICAvLyDvv73vv73vv73vv73vv73CvO+/vVxyXG4gICAgc3RhcnQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAvLyDvv73vv73vv73DtcSx77+977+977+9L++/ve+/ve+/ve+/vVxyXG4gICAgICAgIHZhciBlbnQgPSBGaXJlLkVudGl0eS5maW5kKCcvU0RhdGFCYXNlJyk7XHJcbiAgICAgICAgdGhpcy5zZGF0YUJhc2UgPSBlbnQuZ2V0Q29tcG9uZW50KCdTRGF0YUJhc2UnKTtcclxuXHJcbiAgICAgICAgRmlyZS5JbnB1dC5vbignbW91c2Vkb3duJywgdGhpcy5iaW5kZWRNb3VzZURvd25FdmVudCk7XHJcbiAgICAgICAgRmlyZS5JbnB1dC5vbignbW91c2Vtb3ZlJywgdGhpcy5iaW5kZWRNb3VzZU1vdmVFdmVudCk7XHJcbiAgICAgICAgRmlyZS5JbnB1dC5vbignbW91c2V1cCcsIHRoaXMuYmluZGVkTW91c2VVcEV2ZW50KTtcclxuICAgICAgICAvL1xyXG4gICAgICAgIHRoaXMuc2RhdGFCYXNlLm9wdGlvbnMub25IaWRlRXZlbnQgPSB0aGlzLl9vbkhpZGVFdmVudC5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuc2RhdGFCYXNlLm9wdGlvbnMuYnRuX2RlbC5vbk1vdXNlZG93biA9IHRoaXMuX29uRGVsZXRlVGFyZ2V0RXZlbnQuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLnNkYXRhQmFzZS5vcHRpb25zLmJ0bl9NaXJyb3JGbGlwLm9uTW91c2Vkb3duID0gdGhpcy5fb25NaXJyb3JGbGlwRXZlbnQuYmluZCh0aGlzKTtcclxuICAgIH0sXHJcbiAgICAvLyDvv73vv73vv73vv71cclxuICAgIG9uRGVzdHJveTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgRmlyZS5JbnB1dC5vZmYoJ21vdXNlZG93bicsIHRoaXMuYmluZGVkTW91c2VEb3duRXZlbnQpO1xyXG4gICAgICAgIEZpcmUuSW5wdXQub2ZmKCdtb3VzZW1vdmUnLCB0aGlzLmJpbmRlZE1vdXNlTW92ZUV2ZW50KTtcclxuICAgICAgICBGaXJlLklucHV0Lm9mZignbW91c2V1cCcsIHRoaXMuYmluZGVkTW91c2VVcEV2ZW50KTtcclxuICAgIH1cclxufSk7XHJcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnNTk0ZDZDZUNFMUFWNnBEc3BSdXBxMm8nLCAnU0RhdGFCYXNlJyk7XG4vLyBzY3JpcHRcXHNpbmdsZVxcU0RhdGFCYXNlLmpzXG5cbi8vIOaVsOaNruW6k1xyXG52YXIgU0RhdGFCYXNlID0gRmlyZS5DbGFzcyh7XHJcbiAgICAvLyDnu6fmib9cclxuICAgIGV4dGVuZHM6IEZpcmUuQ29tcG9uZW50LFxyXG4gICAgLy8g5p6E6YCg5Ye95pWwXHJcbiAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIC8vIOWIneWni+WMluWcuuaZr+aVsOaNrlxyXG4gICAgICAgIHRoaXMuaW5pdFNjcmVlbkRhdGEgPSBbXTtcclxuICAgICAgICAvLyDkuoznuqfoj5zljZXmlbDmja5cclxuICAgICAgICB0aGlzLnNlY29uZGFyeU1lbnVEYXRhU2hlZXRzID0gW107XHJcbiAgICAgICAgLy8g5LiJ57qn6I+c5Y2V5oC75pWwXHJcbiAgICAgICAgdGhpcy50aHJlZU1lbnVEYXRhVG90YWxTaGVldHMgPSB7fTtcclxuICAgICAgICAvLyDkuInnuqfoj5zljZXmlbDmja5cclxuICAgICAgICB0aGlzLnRocmVlTWVudURhdGFTaGVldHMgPSB7fTtcclxuICAgICAgICAvLyDkuInnuqfoj5zljZXlpKflm77liJfooahcclxuICAgICAgICB0aGlzLnRocmVlTWVudUJpZ0ltYWdlU2hlZXRzID0gW107XHJcbiAgICAgICAgLy8g5oiR55qE6KOF5omu5pWw5o2u5oC75pWwXHJcbiAgICAgICAgdGhpcy5teURyZXNzVXBUb3RhbCA9IDA7XHJcbiAgICAgICAgLy8g5oiR55qE6KOF5omu5pWw5o2u5YiX6KGoXHJcbiAgICAgICAgdGhpcy5teURyZXNzVXBEYXRhU2hlZXRzID0gW107XHJcbiAgICB9LFxyXG4gICAgLy8g5Yqg6L296aKE5Yi2XHJcbiAgICBfbG9hZE9iamVjdDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIC8vIOaIv+mXtOWktOiKgueCuVxyXG4gICAgICAgIHRoaXMucm9vbSA9IEZpcmUuRW50aXR5LmZpbmQoJy9Sb29tJyk7XHJcbiAgICAgICAgLy8g5o6n5Yi2566h55CG57G7XHJcbiAgICAgICAgdGhpcy5zY29udHJvbE1nciA9IHRoaXMucm9vbS5nZXRDb21wb25lbnQoJ1NDb250cm9sTWdyJyk7XHJcbiAgICAgICAgLy8g5o6n5Yi26YCJ6aG5XHJcbiAgICAgICAgdmFyIGVudCA9IHRoaXMuZW50aXR5LmZpbmQoJ09wdGlvbnMnKTtcclxuICAgICAgICB0aGlzLm9wdGlvbnMgPSBlbnQuZ2V0Q29tcG9uZW50KCdPcHRpb25zJyk7XHJcbiAgICAgICAgLy8g6IOM5pmvXHJcbiAgICAgICAgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL1Jvb20vYmFja2dyb3VuZCcpO1xyXG4gICAgICAgIHRoaXMuYmdSZW5kZXIgPSBlbnQuZ2V0Q29tcG9uZW50KEZpcmUuU3ByaXRlUmVuZGVyZXIpO1xyXG4gICAgICAgIC8vIOWcsOadv1xyXG4gICAgICAgIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9Sb29tL2dyb3VuZCcpO1xyXG4gICAgICAgIHRoaXMuZ3JvdW5kUmVuZGVyID0gZW50LmdldENvbXBvbmVudChGaXJlLlNwcml0ZVJlbmRlcmVyKTtcclxuICAgICAgICAvLyDkuoznuqflrZDoj5zljZXmqKHmnb9cclxuICAgICAgICB0aGlzLnRlbXBTZWNvbmRhcnlNZW51ID0gdGhpcy5lbnRpdHkuZmluZCgnU2Vjb25kYXJ5TWVudScpO1xyXG4gICAgICAgIC8vIOS4iee6p+WtkOiPnOWNleaooeadv1xyXG4gICAgICAgIHRoaXMudGVtcFRocmVlTWVudSA9IHRoaXMuZW50aXR5LmZpbmQoJ1RocmVlTWVudScpO1xyXG4gICAgICAgIC8vIOWutuWFt+aooeadv1xyXG4gICAgICAgIHRoaXMudGVtcEZ1cm5pdHVyZSA9IHRoaXMuZW50aXR5LmZpbmQoJ0Z1cm5pdHVyZScpO1xyXG4gICAgICAgIC8vIOaIv+mXtOexu+Wei+aooeadv1xyXG4gICAgICAgIHRoaXMudGVtcFJvb21UeXBlID0gdGhpcy5lbnRpdHkuZmluZCgnUm9vbVR5cGUnKTtcclxuICAgICAgICAvLyDoo4Xmia7mlbDmja7mqKHmnb9cclxuICAgICAgICB0aGlzLnRlbXBNeURyZXNzVXBEYXRhID0gdGhpcy5lbnRpdHkuZmluZCgnTXlEcmVzc1VwRGF0YScpO1xyXG4gICAgICAgIC8vIOS4gOe6p+iPnOWNlVxyXG4gICAgICAgIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9NZW51X01haW5NZ3InKTtcclxuICAgICAgICB0aGlzLnNtYWluTWVudU1nciA9IGVudC5nZXRDb21wb25lbnQoJ1NNYWluTWVudU1ncicpO1xyXG4gICAgICAgIC8vIOS6jOe6p+iPnOWNlVxyXG4gICAgICAgIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9NZW51X1NlY29uZGFyeU1ncicpO1xyXG4gICAgICAgIHRoaXMuc3NlY29uZGFyeU1lbnVNZ3IgPSBlbnQuZ2V0Q29tcG9uZW50KCdTU2Vjb25kYXJ5TWVudU1ncicpO1xyXG4gICAgICAgIC8vIOS4iee6p+e6p+iPnOWNlVxyXG4gICAgICAgIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9NZW51X1RocmVlTWdyJyk7XHJcbiAgICAgICAgdGhpcy5zdGhyZWVNZW51TWdyID0gZW50LmdldENvbXBvbmVudCgnU1RocmVlTWVudU1ncicpO1xyXG4gICAgICAgIC8vIOe9kee7nOi/nuaOpVxyXG4gICAgICAgIHRoaXMuc25ldFdvcmtNZ3IgPSB0aGlzLmVudGl0eS5nZXRDb21wb25lbnQoJ1NOZXR3b3JrTWdyJyk7XHJcbiAgICAgICAgLy8g5ouN54Wn5Yib5bu657yp55Wl5Zu+XHJcbiAgICAgICAgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL1NjcmVlbnNob3QnKTtcclxuICAgICAgICB0aGlzLnNjcmVlbnNob3QgPSBlbnQuZ2V0Q29tcG9uZW50KCdTY3JlZW5zaG90Jyk7XHJcbiAgICAgICAgLy8g5L+d5oyB5oi/6Ze06ZSZ6K+v5o+Q56S656qX5Y+jXHJcbiAgICAgICAgdGhpcy5zc2F2ZUVycm9yVGlwcyA9IEZpcmUuRW50aXR5LmZpbmQoJy9UaXBzX1NhdmVFcnJvcicpO1xyXG4gICAgICAgIC8vIOS/neaMgeaIv+mXtOaVsOaNrueql+WPo1xyXG4gICAgICAgIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9XaW5fU2F2ZVJvb20nKTtcclxuICAgICAgICB0aGlzLnNzYXZlUm9vbVdpbmRvdyA9IGVudC5nZXRDb21wb25lbnQoJ1NTYXZlUm9vbVdpbmRvdycpO1xyXG4gICAgICAgIC8vIOaPkOekuueql+WPo1xyXG4gICAgICAgIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9XaW5fVGlwcycpO1xyXG4gICAgICAgIHRoaXMuc3RpcHNXaW5kb3cgPSBlbnQuZ2V0Q29tcG9uZW50KCdTVGlwc1dpbmRvdycpO1xyXG4gICAgICAgIC8vIOijheaJrueql+WPo1xyXG4gICAgICAgIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9XaW5fTXlEcmVzc1VwJyk7XHJcbiAgICAgICAgdGhpcy5zbXlEcmVzc1VwV2luZG93ID0gZW50LmdldENvbXBvbmVudCgnU015RHJlc3NVcFdpbmRvdycpO1xyXG4gICAgICAgIC8vIOWKoOi9veaPkOekuueql+WPo1xyXG4gICAgICAgIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9UaXBzX0xvYWRpbmcnKTtcclxuICAgICAgICB0aGlzLnNsb2FkaW5nVGlwcyA9IGVudC5nZXRDb21wb25lbnQoJ1NMb2FkaW5nVGlwcycpO1xyXG4gICAgICAgIC8vIOaPkOekuuayoeacieeUqOaIt+S/oeaBr1xyXG4gICAgICAgIHRoaXMuc3RvS2VuVGlwcyA9IEZpcmUuRW50aXR5LmZpbmQoJy9UaXBzX1RvS2VuJyk7XHJcbiAgICB9LFxyXG4gICAgLy8g6L295YWl5pe2XHJcbiAgICBvbkxvYWQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAvLyDliqDovb3pooTliLZcclxuICAgICAgICB0aGlzLl9sb2FkT2JqZWN0KCk7XHJcbiAgICAgICAgLy8g5Yik5pat5piv5ZCm5pyJVG9LZW5cclxuICAgICAgICBpZiAoIXRoaXMuc25ldFdvcmtNZ3IuZ2V0VG9LZW5WYWx1ZSgpKXtcclxuICAgICAgICAgICAgdGhpcy5zdG9LZW5UaXBzLmFjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIOWIt+aWsOWcuuaZr+aVsOaNrlxyXG4gICAgcmVmcmVzaFNjcmVlbjogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICBpZiAoIXRoaXMuYmdSZW5kZXIgJiYgIXRoaXMuZ3JvdW5kUmVuZGVyKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGNvbXAgPSBudWxsO1xyXG4gICAgICAgIGlmIChkYXRhLnByb3BUeXBlID09PSAxKSB7XHJcbiAgICAgICAgICAgIC8vIOiDjOaZr1xyXG4gICAgICAgICAgICBjb21wID0gdGhpcy5iZ1JlbmRlci5lbnRpdHkuZ2V0Q29tcG9uZW50KCdTRnVybml0dXJlJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAvLyDlnLDpnaJcclxuICAgICAgICAgICAgY29tcCA9IHRoaXMuZ3JvdW5kUmVuZGVyLmVudGl0eS5nZXRDb21wb25lbnQoJ1NGdXJuaXR1cmUnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29tcC50TmFtZSA9IGRhdGEudE5hbWU7XHJcbiAgICAgICAgY29tcC5zdWl0X2lkID0gZGF0YS5zdWl0X2lkO1xyXG4gICAgICAgIGNvbXAucHJvcFR5cGUgPSBkYXRhLnByb3BUeXBlO1xyXG4gICAgICAgIGNvbXAuaW1hZ2VVcmwgPSBkYXRhLmltYWdlVXJsO1xyXG4gICAgICAgIGNvbXAuc2V0U3ByaXRlKGRhdGEuc3ByaXRlKTtcclxuICAgICAgICBjb21wLmRlZmF1bHRTcHJpdGUgPSBkYXRhLnNwcml0ZTtcclxuICAgIH0sXHJcbiAgICAvLyDpooTliqDovb3liJ3lp4vljJblnLrmma9cclxuICAgIHByZWxvYWRJbml0U2NyZWVuRGF0YTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIC8vIOWmguS9leaciee8k+WtmOeUqOe8k+WtmOeahFxyXG4gICAgICAgIGlmICh0aGlzLmluaXRTY3JlZW5EYXRhLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmluaXRTY3JlZW5EYXRhLmxlbmd0aDsgKytpKXtcclxuICAgICAgICAgICAgICAgIHZhciBkYXRhID0gdGhpcy5pbml0U2NyZWVuRGF0YVtpXTtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVmcmVzaFNjcmVlbihkYXRhKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIOayoeacieWGjeWOu+S4i+i9vVxyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICBzZWxmLnNuZXRXb3JrTWdyLlJlcXVlc3RJbml0SG9tZShmdW5jdGlvbiAoc2VydmVyRGF0YSkge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhzZXJ2ZXJEYXRhKTtcclxuICAgICAgICAgICAgc2VydmVyRGF0YS5saXN0LmZvckVhY2goZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgIC8vXHJcbiAgICAgICAgICAgICAgICB2YXIgbmV3RGF0YSA9IHtcclxuICAgICAgICAgICAgICAgICAgICBwb3M6IGRhdGEucG9zLFxyXG4gICAgICAgICAgICAgICAgICAgIHNjYWxlOiBkYXRhLnNjYWxlLFxyXG4gICAgICAgICAgICAgICAgICAgIHROYW1lOiBkYXRhLnByb3BzTmFtZSxcclxuICAgICAgICAgICAgICAgICAgICBzdWl0X2lkOiBkYXRhLmlkLFxyXG4gICAgICAgICAgICAgICAgICAgIHJvdGF0aW9uOiBkYXRhLnJvdGF0aW9uLFxyXG4gICAgICAgICAgICAgICAgICAgIHByb3BUeXBlOiBkYXRhLnByb3BzVHlwZSxcclxuICAgICAgICAgICAgICAgICAgICBpbWFnZVVybDogZGF0YS5pbWdVcmwsXHJcbiAgICAgICAgICAgICAgICAgICAgc3ByaXRlOiBudWxsXHJcbiAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgLy9cclxuICAgICAgICAgICAgICAgIHZhciBsb2FkSW1hZ2VDYWxsQmFjayA9IGZ1bmN0aW9uIChuZXdEYXRhLCBlcnJvciwgaW1hZ2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIUZpcmUuRW5naW5lLmlzUGxheWluZykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgbmV3RGF0YS5zcHJpdGUgPSBuZXcgRmlyZS5TcHJpdGUoaW1hZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYucmVmcmVzaFNjcmVlbihuZXdEYXRhKTtcclxuICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzLCBuZXdEYXRhKTtcclxuICAgICAgICAgICAgICAgIC8vXHJcbiAgICAgICAgICAgICAgICBGaXJlLkltYWdlTG9hZGVyKG5ld0RhdGEuaW1hZ2VVcmwsIGxvYWRJbWFnZUNhbGxCYWNrKTtcclxuICAgICAgICAgICAgICAgIC8vXHJcbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5pbml0U2NyZWVuRGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuaW5pdFNjcmVlbkRhdGEucHVzaChuZXdEYXRhKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgLy8g5Yqg6L295Yig6Zmk5Y2V5Liq6KOF5omu5ZCO5Yi35paw55qE5pWw5o2uXHJcbiAgICBsb2FkUmVmcmVzaE15RHJlc3NVcERhdGE6IGZ1bmN0aW9uIChjdXJJRCwgY2FsbGJhY2spIHtcclxuICAgICAgICB2YXIgc2VuZERhdGEgPSB7XHJcbiAgICAgICAgICAgIGlkOiBjdXJJRFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIHNlbGYubXlEcmVzc1VwVG90YWwgPSAwO1xyXG4gICAgICAgIHNlbGYubXlEcmVzc1VwRGF0YVNoZWV0cyA9IFtdO1xyXG4gICAgICAgIHZhciBpbmRleCA9IDA7XHJcbiAgICAgICAgdGhpcy5zbmV0V29ya01nci5SZXF1ZXN0RGVsSG9tZShzZW5kRGF0YSwgZnVuY3Rpb24gKGFsbERhdGEpIHtcclxuICAgICAgICAgICAgaWYgKCEgRmlyZS5FbmdpbmUuaXNQbGF5aW5nKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc2VsZi5teURyZXNzVXBUb3RhbCA9IHBhcnNlSW50KGFsbERhdGEudG90YWwpO1xyXG4gICAgICAgICAgICBpZiAoc2VsZi5teURyZXNzVXBUb3RhbCA9PT0gMCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBhbGxEYXRhLmxpc3QuZm9yRWFjaChmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIG15RHJlc3NVcERhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWQ6IGRhdGEuc3VpdF9pZCxcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBkYXRhLnN1aXRfbmFtZSxcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBkYXRhLnJvb21fdHlwZSxcclxuICAgICAgICAgICAgICAgICAgICB0eXBlTmFtZTogZGF0YS5yb29tX25hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgaXNEcmVzczogZGF0YS5pc2RyZXNzID4gMFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIC8vXHJcbiAgICAgICAgICAgICAgICBzZWxmLm15RHJlc3NVcERhdGFTaGVldHMucHVzaChteURyZXNzVXBEYXRhKTtcclxuICAgICAgICAgICAgICAgIGlmIChpbmRleCA9PT0gYWxsRGF0YS5saXN0Lmxlbmd0aCAtIDEpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpbmRleCsrO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgfSxcclxuICAgIC8vIOajgOafpeacjeWKoeWZqOS4iueahOaVsOaNruaYr+WQpuS4juacrOWcsOebuOWQjFxyXG4gICAgY2hlY2tpbmdNeURyZXNzVXBEYXRhOiBmdW5jdGlvbiAoY2FsbGJhY2spIHtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgdmFyIHNlbmREYXRhID0ge1xyXG4gICAgICAgICAgICBwYWdlOiAxLFxyXG4gICAgICAgICAgICBlYWNobnVtOiA2LFxyXG4gICAgICAgICAgICByb29tX3R5cGU6IC0xXHJcbiAgICAgICAgfTtcclxuICAgICAgICBzZWxmLnNuZXRXb3JrTWdyLlJlcXVlc3RIb21lTGlzdChzZW5kRGF0YSwgZnVuY3Rpb24gKGFsbERhdGEpIHtcclxuICAgICAgICAgICAgaWYgKCEgRmlyZS5FbmdpbmUuaXNQbGF5aW5nKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc2VsZi5teURyZXNzVXBEYXRhU2hlZXRzID0gW107XHJcbiAgICAgICAgICAgIHNlbGYubXlEcmVzc1VwVG90YWwgPSBwYXJzZUludChhbGxEYXRhLnRvdGFsKTtcclxuICAgICAgICAgICAgdmFyIGluZGV4ID0gMDtcclxuICAgICAgICAgICAgYWxsRGF0YS5saXN0LmZvckVhY2goZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgdmFyIG15RHJlc3NVcERhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWQ6IGRhdGEuc3VpdF9pZCxcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBkYXRhLnN1aXRfbmFtZSxcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBkYXRhLnJvb21fdHlwZSxcclxuICAgICAgICAgICAgICAgICAgICB0eXBlTmFtZTogZGF0YS5yb29tX25hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgaXNEcmVzczogZGF0YS5pc2RyZXNzID4gMFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGluZGV4KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGluZGV4Kys7XHJcbiAgICAgICAgICAgICAgICAvL1xyXG4gICAgICAgICAgICAgICAgc2VsZi5teURyZXNzVXBEYXRhU2hlZXRzLnB1c2gobXlEcmVzc1VwRGF0YSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBpZiAoY2FsbGJhY2sgKXtcclxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICAvLyDpooTliqDovb3miJHnmoToo4Xmia7mlbDmja5cclxuICAgIHByZWxvYWRNeURyZXNzVXBEYXRhOiBmdW5jdGlvbiAocGFnZSwgZWFjaCwgY2FsbGJhY2spIHtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgdmFyIHNlbmREYXRhID0ge1xyXG4gICAgICAgICAgICBwYWdlOiBwYWdlLFxyXG4gICAgICAgICAgICBlYWNobnVtOiBlYWNoLFxyXG4gICAgICAgICAgICByb29tX3R5cGU6IC0xXHJcbiAgICAgICAgfTtcclxuICAgICAgICBzZWxmLnNuZXRXb3JrTWdyLlJlcXVlc3RIb21lTGlzdChzZW5kRGF0YSwgZnVuY3Rpb24gKGFsbERhdGEpIHtcclxuICAgICAgICAgICAgaWYgKCEgRmlyZS5FbmdpbmUuaXNQbGF5aW5nKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc2VsZi5teURyZXNzVXBUb3RhbCA9IHBhcnNlSW50KGFsbERhdGEudG90YWwpO1xyXG4gICAgICAgICAgICB2YXIgaW5kZXggPSAwO1xyXG4gICAgICAgICAgICBhbGxEYXRhLmxpc3QuZm9yRWFjaChmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIG15RHJlc3NVcERhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWQ6IGRhdGEuc3VpdF9pZCxcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBkYXRhLnN1aXRfbmFtZSxcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBkYXRhLnJvb21fdHlwZSxcclxuICAgICAgICAgICAgICAgICAgICB0eXBlTmFtZTogZGF0YS5yb29tX25hbWUsXHJcbiAgICAgICAgICAgICAgICAgICAgaXNEcmVzczogZGF0YS5pc2RyZXNzID4gMFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGluZGV4KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGluZGV4Kys7XHJcbiAgICAgICAgICAgICAgICAvL1xyXG4gICAgICAgICAgICAgICAgaWYgKHNlbGYubXlEcmVzc1VwRGF0YVNoZWV0cy5pbmRleE9mKG15RHJlc3NVcERhdGEpIDwgMCl7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5teURyZXNzVXBEYXRhU2hlZXRzLnB1c2gobXlEcmVzc1VwRGF0YSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIC8vIOmihOWKoOi9veS6jOe6p+iPnOWNleaVsOaNrlxyXG4gICAgcHJlbG9hZFNlY29uZGFyeU1lbnVEYXRhOiBmdW5jdGlvbiAoY2FsbGJhY2spIHtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgc2VsZi5zbmV0V29ya01nci5SZXF1ZXN0U2Vjb25kYXJ5TWVudURhdGEoZnVuY3Rpb24gKGFsbGRhdGEpIHtcclxuICAgICAgICAgICAgaWYgKCEgRmlyZS5FbmdpbmUuaXNQbGF5aW5nKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc2VsZi5zZWNvbmRhcnlNZW51RGF0YVNoZWV0cyA9IFtdO1xyXG4gICAgICAgICAgICB2YXIgaW5kZXggPSAwO1xyXG4gICAgICAgICAgICBhbGxkYXRhLmxpc3QuZm9yRWFjaChmdW5jdGlvbiAoc2VydmVyRGF0YSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGRhdGEgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGlkOiBzZXJ2ZXJEYXRhLnRpZCxcclxuICAgICAgICAgICAgICAgICAgICBpc2RyYWc6IHNlcnZlckRhdGEuaXNkcmFnLFxyXG4gICAgICAgICAgICAgICAgICAgIHRuYW1lOiBzZXJ2ZXJEYXRhLnRuYW1lLFxyXG4gICAgICAgICAgICAgICAgICAgIHVybDogc2VydmVyRGF0YS51cmwsXHJcbiAgICAgICAgICAgICAgICAgICAgc21hbGxTcHJpdGU6IG51bGxcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICB2YXIgbG9hZEltYWdlQ2FsbEJhY2sgPSBmdW5jdGlvbiAoZGF0YSwgaW5kZXgsIGVycm9yLCBpbWFnZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICghIEZpcmUuRW5naW5lLmlzUGxheWluZykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YS5zbWFsbFNwcml0ZSA9IG5ldyBGaXJlLlNwcml0ZShpbWFnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGluZGV4LCBkYXRhLCBpbWFnZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMsIGRhdGEsIGluZGV4KTtcclxuICAgICAgICAgICAgICAgIC8vIOS4i+i9veWbvueJh1xyXG4gICAgICAgICAgICAgICAgRmlyZS5JbWFnZUxvYWRlcihkYXRhLnVybCwgbG9hZEltYWdlQ2FsbEJhY2spO1xyXG4gICAgICAgICAgICAgICAgaW5kZXgrKztcclxuICAgICAgICAgICAgICAgIC8vIOS/neWtmOS6jOe6p+iPnOWNleaVsOaNrlxyXG4gICAgICAgICAgICAgICAgc2VsZi5zZWNvbmRhcnlNZW51RGF0YVNoZWV0cy5wdXNoKGRhdGEpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICAvLyDpooTliqDovb3kuInnuqfoj5zljZUg5Y2V5ZOB5a625YW35pWw5o2uXHJcbiAgICBwcmVsb2FkVGhyZWVNZW51RGF0YTogZnVuY3Rpb24gKGlkLCBwYWdlLCBlYWNoLCBjYWxsYmFjaykge1xyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICBpZiAoISBzZWxmLnRocmVlTWVudURhdGFTaGVldHNbaWRdKSB7XHJcbiAgICAgICAgICAgIHNlbGYudGhyZWVNZW51RGF0YVNoZWV0c1tpZF0gPSBbXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCEgc2VsZi50aHJlZU1lbnVEYXRhVG90YWxTaGVldHNbaWRdKXtcclxuICAgICAgICAgICAgc2VsZi50aHJlZU1lbnVEYXRhVG90YWxTaGVldHNbaWRdID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHNlbmREYXRhID0ge1xyXG4gICAgICAgICAgICB0aWQ6IGlkLFxyXG4gICAgICAgICAgICBwYWdlOiBwYWdlLFxyXG4gICAgICAgICAgICBlYWNoOiBlYWNoXHJcbiAgICAgICAgfTtcclxuICAgICAgICBzZWxmLnNuZXRXb3JrTWdyLlJlcXVlc3RTaW5nbGVJdGVtcyhzZW5kRGF0YSwgZnVuY3Rpb24gKGFsbERhdGEpIHtcclxuICAgICAgICAgICAgaWYgKCEgRmlyZS5FbmdpbmUuaXNQbGF5aW5nKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIHRvdGFsID0gcGFyc2VJbnQoYWxsRGF0YS50b3RhbCk7XHJcbiAgICAgICAgICAgIHNlbGYudGhyZWVNZW51RGF0YVRvdGFsU2hlZXRzW2lkXSA9IHRvdGFsO1xyXG4gICAgICAgICAgICB2YXIgZGF0YVNoZWV0cyA9IHNlbGYudGhyZWVNZW51RGF0YVNoZWV0c1tpZF07XHJcbiAgICAgICAgICAgIHZhciBpbmRleCA9IDAsIGxvYWRJbWFnZUNvdW50ID0gMDtcclxuICAgICAgICAgICAgYWxsRGF0YS5saXN0LmZvckVhY2goZnVuY3Rpb24gKGRhdGFTaGVldHMsIGRhdGEpIHtcclxuICAgICAgICAgICAgICAgIHZhciBtZW51RGF0YSA9IHtcclxuICAgICAgICAgICAgICAgICAgICBuYW1lOiBkYXRhLnByb2RfbmFtZSxcclxuICAgICAgICAgICAgICAgICAgICBzdWl0X2lkOiBkYXRhLnByb2RfaWQsXHJcbiAgICAgICAgICAgICAgICAgICAgcHJpY2U6IGRhdGEucHJvZF9wcmljZSxcclxuICAgICAgICAgICAgICAgICAgICBiaWdJbWFnZVVybDogZGF0YS5wcm9kX3NvdWNlX3VybCxcclxuICAgICAgICAgICAgICAgICAgICBzYW1sbEltYWdlVXJsOiBkYXRhLnByb2RfaW1hZ2VfdXJsLFxyXG4gICAgICAgICAgICAgICAgICAgIHNtYWxsU3ByaXRlOiBudWxsLFxyXG4gICAgICAgICAgICAgICAgICAgIGJpZ1Nwcml0ZTogbnVsbCxcclxuICAgICAgICAgICAgICAgICAgICBldmVudDogbnVsbFxyXG4gICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgIC8vXHJcbiAgICAgICAgICAgICAgICB2YXIgbG9hZEltYWdlQ2FsbEJhY2sgPSBmdW5jdGlvbiAobWVudURhdGEsIGluZGV4LCBlcnJvciwgaW1hZ2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIUZpcmUuRW5naW5lLmlzUGxheWluZykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2FkSW1hZ2VDb3VudCsrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobG9hZEltYWdlQ291bnQgPCAyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBGaXJlLkltYWdlTG9hZGVyKG1lbnVEYXRhLnNhbWxsSW1hZ2VVcmwsIGxvYWRJbWFnZUNhbGxCYWNrKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIC8vXHJcbiAgICAgICAgICAgICAgICAgICAgbWVudURhdGEuc21hbGxTcHJpdGUgPSBuZXcgRmlyZS5TcHJpdGUoaW1hZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhpZCwgaW5kZXgsIHBhZ2UsIG1lbnVEYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgbG9hZEltYWdlQ291bnQgPSAwO1xyXG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMsIG1lbnVEYXRhLCBpbmRleCk7XHJcbiAgICAgICAgICAgICAgICAvLyDliqDovb3lsI/lm75cclxuICAgICAgICAgICAgICAgIEZpcmUuSW1hZ2VMb2FkZXIoZGF0YS5wcm9kX2ltYWdlX3VybCwgbG9hZEltYWdlQ2FsbEJhY2spO1xyXG4gICAgICAgICAgICAgICAgLy9cclxuICAgICAgICAgICAgICAgIGluZGV4Kys7XHJcbiAgICAgICAgICAgICAgICAvL1xyXG4gICAgICAgICAgICAgICAgZGF0YVNoZWV0cy5wdXNoKG1lbnVEYXRhKTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMsIGRhdGFTaGVldHMpKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufSk7XHJcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnODExMzNiNlB2TkdWSzZ2U21wVVhlNysnLCAnU0Vycm9yUHJvbXB0V2luZG93Jyk7XG4vLyBzY3JpcHRcXHNpbmdsZVxcU0Vycm9yUHJvbXB0V2luZG93LmpzXG5cbnZhciBDb21wID0gRmlyZS5DbGFzcyh7XHJcbiAgICAvLyDnu6fmib9cclxuICAgIGV4dGVuZHM6IEZpcmUuQ29tcG9uZW50LFxyXG4gICAgLy8g5p6E6YCg5Ye95pWwXHJcbiAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMub25DYWxsRXZlbnQgPSBudWxsO1xyXG4gICAgfSxcclxuICAgIC8vIOWxnuaAp1xyXG4gICAgcHJvcGVydGllczoge1xyXG4gICAgICAgIGNvbnRlbnQ6e1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlRleHRcclxuICAgICAgICB9LFxyXG4gICAgICAgIGJ0bl9Db25maXJtOntcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5VSUJ1dHRvblxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g5aaC5p6cSW5wdXRmaWVsZOWtmOWcqOeahOivneWwsemcgOimgeaKiuS7luWFiOWFs+mXrVxyXG4gICAgICAgIC8vIOWboOS4uuaXoOazleaOp+WItuWug+eahOWxgue6p1xyXG4gICAgICAgIGlucHV0X1NhdmU6IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5FbnRpdHlcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8g6K6+572u6LCD55So5Ye95pWwXHJcbiAgICBzZXRDYWxsRXZlbnQ6IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgIHRoaXMub25DYWxsRXZlbnQgPSBldmVudDtcclxuICAgIH0sXHJcbiAgICAvLyDnoa7lrprkuovku7ZcclxuICAgIF9vbkNvbmZpcm1FdmVudDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuZW50aXR5LmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgICAgIGlmICh0aGlzLm9uQ2FsbEV2ZW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMub25DYWxsRXZlbnQoKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8g5YWz6Zet5pe26Kem5Y+R55qE5LqL5Lu2XHJcbiAgICBvbkRpc2FibGU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAoISB0aGlzLmlucHV0X1NhdmUuYWN0aXZlKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5wdXRfU2F2ZS5hY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvLyDmiZPlvIDop6blj5HnmoTkuovku7ZcclxuICAgIG9uRW5hYmxlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuaW5wdXRfU2F2ZS5hY3RpdmUpIHtcclxuICAgICAgICAgICAgdGhpcy5pbnB1dF9TYXZlLmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvL1xyXG4gICAgb25Mb2FkOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5idG5fQ29uZmlybS5vbkNsaWNrID0gdGhpcy5fb25Db25maXJtRXZlbnQuYmluZCh0aGlzKTtcclxuICAgIH1cclxufSk7XHJcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnYTFmOGFWSWhQaExmNlM2VmhnMFB4Z2MnLCAnU0Z1cm5pdHVyZScpO1xuLy8gc2NyaXB0XFxzaW5nbGVcXFNGdXJuaXR1cmUuanNcblxudmFyIFNGdXJuaXR1cmUgPSBGaXJlLkNsYXNzKHtcclxuICAgIC8vIOe7p+aJv1xyXG4gICAgZXh0ZW5kczogRmlyZS5Db21wb25lbnQsXHJcbiAgICAvLyDmnoTpgKDlh73mlbBcclxuICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5fcmVuZGVyZXIgPSBudWxsO1xyXG4gICAgfSxcclxuICAgIC8vIOWxnuaAp1xyXG4gICAgcHJvcGVydGllczoge1xyXG4gICAgICAgIC8vIOWQjeensFxyXG4gICAgICAgIHROYW1lOiAnJyxcclxuICAgICAgICAvLyBJRFxyXG4gICAgICAgIHN1aXRfaWQ6IDAsXHJcbiAgICAgICAgLy8g57G75Z6LXHJcbiAgICAgICAgcHJvcFR5cGU6IDAsXHJcbiAgICAgICAgLy8g5piv5ZCm5Y+v5Lul5ouW5YqoXHJcbiAgICAgICAgaGFzRHJhZzogZmFsc2UsXHJcbiAgICAgICAgLy8g5Zu+54mH55qEdXJsXHJcbiAgICAgICAgaW1hZ2VVcmw6ICcnLFxyXG4gICAgICAgIC8vIOi9veWFpeaXtueahOWbvueJh1xyXG4gICAgICAgIGRlZmF1bHRTcHJpdGU6IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5TcHJpdGVcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8g6K6+572u5Zu+54mHXHJcbiAgICBzZXRTcHJpdGU6IGZ1bmN0aW9uIChuZXdTcHJpdGUpIHtcclxuICAgICAgICBpZiAoIXRoaXMuX3JlbmRlcmVyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX3JlbmRlcmVyID0gdGhpcy5lbnRpdHkuZ2V0Q29tcG9uZW50KEZpcmUuU3ByaXRlUmVuZGVyZXIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9yZW5kZXJlci5zcHJpdGUgPSBuZXdTcHJpdGU7XHJcbiAgICAgICAgdGhpcy5fcmVuZGVyZXIuc3ByaXRlLnBpeGVsTGV2ZWxIaXRUZXN0ID0gdHJ1ZTtcclxuICAgIH1cclxufSk7XHJcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnMWM5YjFlWUpvdE80NVhLdXlzYkFma3EnLCAnU0xvYWRpbmdUaXBzJyk7XG4vLyBzY3JpcHRcXHNpbmdsZVxcU0xvYWRpbmdUaXBzLmpzXG5cbnZhciBTTG9hZGluZ1RpcHMgPSBGaXJlLkNsYXNzKHtcclxuICAgIC8vIOe7p+aJv1xyXG4gICAgZXh0ZW5kczogRmlyZS5Db21wb25lbnQsXHJcbiAgICAvLyDmnoTpgKDlh73mlbBcclxuICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgfSxcclxuICAgIC8vIOWxnuaAp1xyXG4gICAgcHJvcGVydGllczoge1xyXG4gICAgICAgIGNvbnRlbnQ6e1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiBGaXJlLkJpdG1hcFRleHRcclxuICAgICAgICB9LFxyXG4gICAgICAgIGFuaW06IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5BbmltYXRpb25cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8g5omT5byA56qX5Y+jXHJcbiAgICBvcGVuVGlwczogZnVuY3Rpb24gKHRleHQpIHtcclxuICAgICAgICB2YXIgc3RhdGUgPSB0aGlzLmFuaW0ucGxheSgnbG9hZGluZycpO1xyXG4gICAgICAgIHN0YXRlLndyYXBNb2RlID0gRmlyZS5XcmFwTW9kZS5Mb29wO1xyXG4gICAgICAgIHN0YXRlLnJlcGVhdENvdW50ID0gSW5maW5pdHk7XHJcbiAgICAgICAgdGhpcy5lbnRpdHkuYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICBpZiAodGV4dCkge1xyXG4gICAgICAgICAgICB0aGlzLmNvbnRlbnQudGV4dCA9IHRleHQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICB0aGlzLmNvbnRlbnQudGV4dCA9ICfliqDovb3kuK3or7fnqI3lkI4uLi4nO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvLyDlhbPpl63nqpflj6NcclxuICAgIGNsb3NlVGlwczogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuYW5pbS5zdG9wKCdsb2FkaW5nJyk7XHJcbiAgICAgICAgdGhpcy5lbnRpdHkuYWN0aXZlID0gZmFsc2U7XHJcbiAgICB9XHJcbn0pO1xyXG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJ2Q4NDQ1RXlFTmxENHFVdVFjM2ZVVG8yJywgJ1NNYWluTWVudU1ncicpO1xuLy8gc2NyaXB0XFxzaW5nbGVcXFNNYWluTWVudU1nci5qc1xuXG4vLyDkuLvoj5zljZUg77yI5oiR6KaB6KOF5omuIOS/neWtmOijheaJriDmiJHnmoToo4Xmia7vvIlcclxudmFyIFNNYWluTWVudU1nciA9IEZpcmUuQ2xhc3Moe1xyXG4gICAgLy8g57un5om/XHJcbiAgICBleHRlbmRzOiBGaXJlLkNvbXBvbmVudCxcclxuICAgIC8vIOaehOmAoOWHveaVsFxyXG4gICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICB9LFxyXG4gICAgLy8g5bGe5oCnXHJcbiAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgLy8gVUnkuI7lsY/luZXnmoTpl7Tot51cclxuICAgICAgICBtYXJnaW46IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogRmlyZS52Mig3MiwgMTUwKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc3BhY2luZzoge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiAxNDBcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8g5piv5ZCm6KOF5omu6L+HXHJcbiAgICBfaGFzRHJlc3NVcDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBoYXNEcmVzc1VwID0gZmFsc2U7XHJcbiAgICAgICAgdmFyIGJnQ29tcCA9IHRoaXMuc2RhdGFCYXNlLmJnUmVuZGVyLmdldENvbXBvbmVudCgnU0Z1cm5pdHVyZScpO1xyXG4gICAgICAgIGlmICh0aGlzLnNkYXRhQmFzZS5iZ1JlbmRlci5zcHJpdGUgIT09IGJnQ29tcC5kZWZhdWx0U3ByaXRlKSB7XHJcbiAgICAgICAgICAgIGhhc0RyZXNzVXAgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgR2RDb21wID0gdGhpcy5zZGF0YUJhc2UuZ3JvdW5kUmVuZGVyLmdldENvbXBvbmVudCgnU0Z1cm5pdHVyZScpO1xyXG4gICAgICAgIGlmICh0aGlzLnNkYXRhQmFzZS5ncm91bmRSZW5kZXIuc3ByaXRlICE9PSBHZENvbXAuZGVmYXVsdFNwcml0ZSkge1xyXG4gICAgICAgICAgICBoYXNEcmVzc1VwID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGNoaWxkcmVuID0gdGhpcy5zZGF0YUJhc2Uucm9vbS5nZXRDaGlsZHJlbigpO1xyXG4gICAgICAgIGlmIChjaGlsZHJlbi5sZW5ndGggPiAyKSB7XHJcbiAgICAgICAgICAgIGhhc0RyZXNzVXAgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gaGFzRHJlc3NVcDtcclxuICAgIH0sXHJcbiAgICAvLyDmuIXnqbrlnLrmma9cclxuICAgIHJlc2V0U2NyZWVuOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIGNoaWxkcmVuID0gdGhpcy5zZGF0YUJhc2Uucm9vbS5nZXRDaGlsZHJlbigpO1xyXG4gICAgICAgIGlmIChjaGlsZHJlbi5sZW5ndGggPD0gMil7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDI7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBjaGlsZHJlbltpXS5kZXN0cm95KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIOaIkeimgeijheaJruS6i+S7tlxyXG4gICAgX29uRG9EcmVzc0V2ZW50OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2hhc0RyZXNzVXAoKSkge1xyXG4gICAgICAgICAgICB0aGlzLnNkYXRhQmFzZS5zY29udHJvbE1nci5yZXNldCgpO1xyXG4gICAgICAgICAgICB0aGlzLnNkYXRhQmFzZS5zdGhyZWVNZW51TWdyLmNsb3NlTWVudSgpO1xyXG4gICAgICAgICAgICB0aGlzLnNkYXRhQmFzZS5zdGlwc1dpbmRvdy5vcGVuV2luZG93KCfmmK/lkKbmuIXnqbrlnLrmma8uLicsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2luaXRTY3JlZW4oKTtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVzZXRTY3JlZW4oKTtcclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8g5L+d5a2Y6KOF5omu5LqL5Lu2XHJcbiAgICBfb25TYXZlRHJlc3NFdmVudDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuc2RhdGFCYXNlLnNjb250cm9sTWdyLnJlc2V0KCk7XHJcbiAgICAgICAgdGhpcy5zZGF0YUJhc2Uuc3RocmVlTWVudU1nci5jbG9zZU1lbnUoKTtcclxuICAgICAgICB0aGlzLnNkYXRhQmFzZS5zc2F2ZVJvb21XaW5kb3cub3BlbldpbmRvdygpO1xyXG4gICAgfSxcclxuICAgIC8vIOaIkeeahOijheaJruS6i+S7tlxyXG4gICAgX29uTXlEcmVzc0V2ZW50OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5zZGF0YUJhc2Uuc2NvbnRyb2xNZ3IucmVzZXQoKTtcclxuICAgICAgICB0aGlzLnNkYXRhQmFzZS5zdGhyZWVNZW51TWdyLmNsb3NlTWVudSgpO1xyXG4gICAgICAgIHRoaXMuc2RhdGFCYXNlLnNteURyZXNzVXBXaW5kb3cub3BlbldpbmRvdygpO1xyXG4gICAgfSxcclxuICAgIC8vIOi/lOWbnuWupOWkllxyXG4gICAgX29uR29Ub091dERvb3JFdmVudDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIEZpcmUuRW5naW5lLmxvYWRTY2VuZSgnbGF1bmNoJyk7XHJcbiAgICB9LFxyXG4gICAgLy8g5Yid5aeL5YyW6I+c5Y2VXHJcbiAgICBfaW5pdE1lbnU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgdmFyIGNoaWxkcmVuID0gdGhpcy5lbnRpdHkuZ2V0Q2hpbGRyZW4oKTtcclxuICAgICAgICBzZWxmLl9tZW51TGlzdCA9IFtdO1xyXG4gICAgICAgIGZvcih2YXIgaSA9IDAsIGxlbiA9IGNoaWxkcmVuLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XHJcbiAgICAgICAgICAgIHZhciBlbnQgPSBjaGlsZHJlbltpXTtcclxuICAgICAgICAgICAgdmFyIGJ0biA9IGVudC5nZXRDb21wb25lbnQoRmlyZS5VSUJ1dHRvbik7XHJcbiAgICAgICAgICAgIGlmICghIGJ0bikgeyBjb250aW51ZTsgfVxyXG4gICAgICAgICAgICAvLyDnu5HlrprmjInpkq7kuovku7ZcclxuICAgICAgICAgICAgaWYgKGVudC5uYW1lID09PSBcIjFcIikge1xyXG4gICAgICAgICAgICAgICAgYnRuLm9uQ2xpY2sgPSBzZWxmLl9vbkRvRHJlc3NFdmVudC5iaW5kKHNlbGYpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2UgaWYgKGVudC5uYW1lID09PSBcIjJcIikge1xyXG4gICAgICAgICAgICAgICAgYnRuLm9uQ2xpY2sgPSBzZWxmLl9vblNhdmVEcmVzc0V2ZW50LmJpbmQoc2VsZik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoZW50Lm5hbWUgPT09IFwiM1wiKSB7XHJcbiAgICAgICAgICAgICAgICBidG4ub25DbGljayA9IHNlbGYuX29uTXlEcmVzc0V2ZW50LmJpbmQoc2VsZik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSBpZiAoZW50Lm5hbWUgPT09IFwiNFwiKSB7XHJcbiAgICAgICAgICAgICAgICBidG4ub25DbGljayA9IHNlbGYuX29uR29Ub091dERvb3JFdmVudC5iaW5kKHNlbGYpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIF9pbml0U2NyZWVuOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5zZGF0YUJhc2UucHJlbG9hZEluaXRTY3JlZW5EYXRhKCk7XHJcbiAgICB9LFxyXG4gICAgLy9cclxuICAgIG9uTG9hZDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIC8vIOmhtemdouWkp+Wwj+WPkeeUn+WPmOWMlueahOaXtuWAmeS8muiwg+eUqOi/meS4quS6i+S7tlxyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICBGaXJlLlNjcmVlbi5vbigncmVzaXplJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgd2lkdGggPSBzZWxmLmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aDtcclxuICAgICAgICAgICAgdmFyIGhlaWdodCA9IHNlbGYuZG9jdW1lbnRFbGVtZW50LmNsaWVudEhlaWdodDtcclxuICAgICAgICAgICAgaWYgKHdpZHRoIDwgaGVpZ2h0KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNkYXRhQmFzZS5zdGlwc1dpbmRvdy5vcGVuV2luZG93KCfmqKrlsY/kvZPpqozmlYjmnpzkvJrmm7Tlpb0uLicpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZGF0YUJhc2Uuc3RpcHNXaW5kb3cuY2xvc2VXaW5kb3coKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICB9LFxyXG5cclxuICAgIHN0YXJ0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9TRGF0YUJhc2UnKTtcclxuICAgICAgICB0aGlzLnNkYXRhQmFzZSA9IGVudC5nZXRDb21wb25lbnQoJ1NEYXRhQmFzZScpO1xyXG4gICAgICAgIC8vXHJcbiAgICAgICAgdmFyIGRvY3VtZW50RWxlbWVudCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcclxuICAgICAgICB2YXIgd2lkdGggPSBkb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGg7XHJcbiAgICAgICAgdmFyIGhlaWdodCA9IGRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQ7XHJcbiAgICAgICAgdGhpcy5kb2N1bWVudEVsZW1lbnQgPSBkb2N1bWVudEVsZW1lbnQ7XHJcbiAgICAgICAgaWYgKHdpZHRoIDwgaGVpZ2h0KSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2RhdGFCYXNlLnN0aXBzV2luZG93Lm9wZW5XaW5kb3coJ+aoquWxj+S9k+mqjOaViOaenOS8muabtOWlvS4uJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIOWIneWni+WMluiPnOWNlVxyXG4gICAgICAgIHRoaXMuX2luaXRNZW51KCk7XHJcbiAgICAgICAgLy8g5Yid5aeL5YyW5Zy65pmvXHJcbiAgICAgICAgdGhpcy5faW5pdFNjcmVlbigpO1xyXG5cclxuICAgICAgICBGaXJlLkVuZ2luZS5wcmVsb2FkU2NlbmUoJ2xhdW5jaCcpO1xyXG4gICAgfSxcclxuXHJcbiAgICAvLyDliLfmlrBcclxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIC8vIOWMuemFjVVJ5YiG6L6o546HXHJcbiAgICAgICAgdmFyIGNhbWVyYSA9IEZpcmUuQ2FtZXJhLm1haW47XHJcbiAgICAgICAgdmFyIHNjcmVlblNpemUgPSBGaXJlLlNjcmVlbi5zaXplLm11bChjYW1lcmEuc2l6ZSAvIEZpcmUuU2NyZWVuLmhlaWdodCk7XHJcbiAgICAgICAgdmFyIG5ld1BvcyA9IEZpcmUudjIoLXNjcmVlblNpemUueCAvIDIgKyB0aGlzLm1hcmdpbi54LCBzY3JlZW5TaXplLnkgLyAyIC0gdGhpcy5tYXJnaW4ueSk7XHJcbiAgICAgICAgdGhpcy5lbnRpdHkudHJhbnNmb3JtLnBvc2l0aW9uID0gbmV3UG9zO1xyXG4gICAgfVxyXG59KTtcclxuXG5GaXJlLl9SRnBvcCgpOyIsIkZpcmUuX1JGcHVzaChtb2R1bGUsICc5YzhjMmRKaExwQ1diVVAzSHcwa0N6bicsICdTTXlEcmVzc1VwRGF0YScpO1xuLy8gc2NyaXB0XFxzaW5nbGVcXFNNeURyZXNzVXBEYXRhLmpzXG5cbnZhciBTTXlEcmVzc1VwRGF0YSA9IEZpcmUuQ2xhc3Moe1xyXG4gICAgLy8g57un5om/XHJcbiAgICBleHRlbmRzOiBGaXJlLkNvbXBvbmVudCxcclxuICAgIC8vIOaehOmAoOWHveaVsFxyXG4gICAgY29udHJ1Y3RvcjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIC8vIElEXHJcbiAgICAgICAgdGhpcy5zdWl0X2lkID0gLTE7XHJcbiAgICAgICAgLy8g5ZCN56ewXHJcbiAgICAgICAgdGhpcy5teURyZXNzVXBOYW1lID0gJyc7XHJcbiAgICB9LFxyXG4gICAgLy8g5bGe5oCnXHJcbiAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgLy8g57yW5Y+3XHJcbiAgICAgICAgc2VyaWFsTnVtYmVyOiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVGV4dFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g5ZCN56ewXHJcbiAgICAgICAgcm9vbU5hbWU6IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5UZXh0XHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDnsbvlnotcclxuICAgICAgICByb29tVHlwZTogMCxcclxuICAgICAgICAvLyDnsbvlnovmloflrZdcclxuICAgICAgICByb29tVHlwZVRleHQ6IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5UZXh0XHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDmiZPlvIDoo4Xmia5cclxuICAgICAgICBidG5fb3BlblJvb206IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5VSUJ1dHRvblxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g5Yig6Zmk6KOF5omuXHJcbiAgICAgICAgYnRuX2RlbGV0ZVJvb206IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5VSUJ1dHRvblxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvLyDph43nva7lrrblhbdcclxuICAgIHJlc2V0TWVudTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuc2VyaWFsTnVtYmVyLnRleHQgPSAnJztcclxuICAgICAgICB0aGlzLnJvb21OYW1lLnRleHQgPSAnJztcclxuICAgICAgICB0aGlzLnJvb21UeXBlID0gMDtcclxuICAgICAgICB0aGlzLnJvb21UeXBlVGV4dC50ZXh0ID0gJyc7XHJcbiAgICAgICAgdGhpcy5idG5fb3BlblJvb20ub25DbGljayA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5idG5fZGVsZXRlUm9vbS5vbkNsaWNrID0gbnVsbDtcclxuICAgICAgICB0aGlzLmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcclxuICAgIH0sXHJcbiAgICAvLyDliJ3lp4vljJZcclxuICAgIHJlZnJlc2g6IGZ1bmN0aW9uIChkYXRhLCBvcGVuUm9vbUV2ZW50LCBkZWxldGVSb29tRXZlbnQpIHtcclxuICAgICAgICB0aGlzLnN1aXRfaWQgPSBkYXRhLmlkO1xyXG4gICAgICAgIHRoaXMubXlEcmVzc1VwTmFtZSA9IGRhdGEubmFtZTtcclxuICAgICAgICB0aGlzLmVudGl0eS5uYW1lID0gdGhpcy5zdWl0X2lkO1xyXG4gICAgICAgIHRoaXMuc2VyaWFsTnVtYmVyLnRleHQgPSB0aGlzLnN1aXRfaWQ7XHJcbiAgICAgICAgdGhpcy5yb29tTmFtZS50ZXh0ID0gdGhpcy5teURyZXNzVXBOYW1lO1xyXG4gICAgICAgIHRoaXMucm9vbVR5cGUgPSBkYXRhLnR5cGU7XHJcbiAgICAgICAgdGhpcy5yb29tVHlwZVRleHQudGV4dCA9IGRhdGEudHlwZU5hbWU7XHJcbiAgICAgICAgaWYgKG9wZW5Sb29tRXZlbnQpIHtcclxuICAgICAgICAgICAgdGhpcy5idG5fb3BlblJvb20ub25DbGljayA9IG9wZW5Sb29tRXZlbnQ7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChkZWxldGVSb29tRXZlbnQpIHtcclxuICAgICAgICAgICAgdGhpcy5idG5fZGVsZXRlUm9vbS5vbkNsaWNrID0gZGVsZXRlUm9vbUV2ZW50O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSk7XHJcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnNzVjMThzTGlUdExKWkxvNXlZM2k1YnInLCAnU015RHJlc3NVcFdpbmRvdycpO1xuLy8gc2NyaXB0XFxzaW5nbGVcXFNNeURyZXNzVXBXaW5kb3cuanNcblxuLy8g6KOF5omu5YiX6KGo56qX5Y+jXHJcbnZhciBNeURyZXNzVXBXaW5kb3cgPSBGaXJlLkNsYXNzKHtcclxuICAgIC8vIOe7p+aJv1xyXG4gICAgZXh0ZW5kczogRmlyZS5Db21wb25lbnQsXHJcbiAgICAvLyDmnoTpgKDlh73mlbBcclxuICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5fc2hvd051bSA9IDY7XHJcbiAgICAgICAgdGhpcy5fY3VyUGFnZSA9IDE7XHJcbiAgICAgICAgdGhpcy5fbWF4UGFnZSA9IDA7XHJcbiAgICAgICAgdGhpcy5fbXlEcmVzc1VwVG90YWwgPSAwO1xyXG4gICAgICAgIC8vIOijheaJruWuueWZqOWIl+ihqFxyXG4gICAgICAgIHRoaXMuZHJlc3NVcEVudGl0eVNoZWV0cyA9IFtdO1xyXG4gICAgICAgIC8vIOi/m+WFpeijheaJrlxyXG4gICAgICAgIHRoaXMuYmluZFJlYWREYXRhRXZlbnQgPSB0aGlzLl9vblJlYWREYXRhRXZlbnQuYmluZCh0aGlzKTtcclxuICAgICAgICAvLyDliKDpmaToo4Xmia5cclxuICAgICAgICB0aGlzLmJpbmREZWxEYXRhRXZlbnQgPSB0aGlzLl9vbkRlbEhvbWVEYXRhRXZlbnQuYmluZCh0aGlzKTtcclxuICAgIH0sXHJcbiAgICAvLyDlsZ7mgKdcclxuICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAvLyDmoLnoioLngrlcclxuICAgICAgICByb290Tm9kZToge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiBGaXJlLkVudGl0eVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g5YWz6Zet56qX5Y+jXHJcbiAgICAgICAgYnRuX0Nsb3NlOiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVUlCdXR0b25cclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOS4i+S4gOmhtVxyXG4gICAgICAgIGJ0bl9OZXh0OiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVUlCdXR0b25cclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOS4iuS4gOmhtVxyXG4gICAgICAgIGJ0bl9QcmV2aW91czoge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlVJQnV0dG9uXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDliKDpmaTmiYDmnInmiL/pl7TmlbDmja5cclxuICAgICAgICBidG5fcmVtb3ZlQWxsOiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVUlCdXR0b25cclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOW9k+WJjeijheaJrueahOaIv+mXtFxyXG4gICAgICAgIGN1clNlbGVjdFJvb206IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5UZXh0XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIOWFs+mXreeql+WPo1xyXG4gICAgX29uQ2xvc2VXaW5kb3dFdmVudDogZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgICAgdGhpcy5jbG9zZVdpbmRvdygpO1xyXG4gICAgfSxcclxuICAgIC8vIOabtOaWsOaMiemSrueKtuaAgVxyXG4gICAgX3VwZGF0ZUJ1dHRvblN0YXRlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5idG5fUHJldmlvdXMuZW50aXR5LmFjdGl2ZSA9IHRoaXMuX2N1clBhZ2UgPiAxO1xyXG4gICAgICAgIHRoaXMuYnRuX05leHQuZW50aXR5LmFjdGl2ZSA9IHRoaXMuX2N1clBhZ2UgPCB0aGlzLl9tYXhQYWdlO1xyXG4gICAgfSxcclxuICAgIC8vIOS4iuS4gOmhtVxyXG4gICAgX29uUHJldmlvdXNQYWdlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5fY3VyUGFnZSAtPSAxO1xyXG4gICAgICAgIGlmICh0aGlzLl9jdXJQYWdlIDwgMSl7XHJcbiAgICAgICAgICAgIHRoaXMuX2N1clBhZ2UgPSAxO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9yZWZyZXNoTXlEcmVzc0xpc3QoKTtcclxuICAgIH0sXHJcbiAgICAvLyDkuIvkuIDpobVcclxuICAgIF9vbk5leHRQYWdlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5fY3VyUGFnZSArPSAxO1xyXG4gICAgICAgIGlmICh0aGlzLl9jdXJQYWdlID4gdGhpcy5fbWF4UGFnZSl7XHJcbiAgICAgICAgICAgIHRoaXMuX2N1clBhZ2UgPSB0aGlzLl9tYXhQYWdlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9yZWZyZXNoTXlEcmVzc0xpc3QoKTtcclxuICAgIH0sXHJcbiAgICAvLyDovb3lhaXljZXkuKrmiL/pl7TmlbDmja5cclxuICAgIF9vblJlYWREYXRhRXZlbnQ6IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgIHZhciBjb21wID0gZXZlbnQudGFyZ2V0LnBhcmVudC5nZXRDb21wb25lbnQoJ1NNeURyZXNzVXBEYXRhJyk7XHJcbiAgICAgICAgdGhpcy5sb2FkSG9tZURhdGEoY29tcC5zdWl0X2lkKTtcclxuICAgICAgICB0aGlzLmN1clNlbGVjdFJvb20udGV4dCA9ICflvZPliY3oo4Xmia46ICcgKyBjb21wLm15RHJlc3NVcE5hbWU7XHJcbiAgICB9LFxyXG4gICAgLy8g5Yig6Zmk5omA5pyJ5oi/6Ze05pWw5o2uXHJcbiAgICBfb25SZW1vdmVBbGxSb29tRGF0YUV2ZW50OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5zZGF0YUJhc2UubG9hZFJlZnJlc2hNeURyZXNzVXBEYXRhKC0xLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2N1clBhZ2UgPSAxO1xyXG4gICAgICAgICAgICB0aGlzLl9yZWZyZXNoTXlEcmVzc0xpc3QoKTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgfSxcclxuICAgIC8vIOWIoOmZpOaIv+mXtOaVsOaNrlxyXG4gICAgX29uRGVsSG9tZURhdGFFdmVudDogZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgICAgdmFyIGlkID0gcGFyc2VJbnQoZXZlbnQudGFyZ2V0LnBhcmVudC5uYW1lKTtcclxuICAgICAgICB0aGlzLnNkYXRhQmFzZS5sb2FkUmVmcmVzaE15RHJlc3NVcERhdGEoaWQsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdGhpcy5fcmVmcmVzaE15RHJlc3NMaXN0KCk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgIH0sXHJcbiAgICAvLyDovb3lhaXmiL/pl7TmlbDmja5cclxuICAgIGxvYWRIb21lRGF0YTogZnVuY3Rpb24gKGlkKSB7XHJcbiAgICAgICAgdGhpcy5zZGF0YUJhc2Uuc21haW5NZW51TWdyLnJlc2V0U2NyZWVuKCk7XHJcbiAgICAgICAgdGhpcy5zZGF0YUJhc2Uuc25ldFdvcmtNZ3IuUmVxdWVzdEhvbWVEYXRhKHtzdWl0X2lkOiBpZH0sIGZ1bmN0aW9uIChob21lRGF0YSkge1xyXG4gICAgICAgICAgICBob21lRGF0YS5saXN0LmZvckVhY2goZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgIHZhciBlbnRpdHkgPSBudWxsLCBmdXJuaXR1cmUgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgdmFyIHByb3BzVHlwZSA9IHBhcnNlSW50KGRhdGEucHJvcHNUeXBlKTtcclxuICAgICAgICAgICAgICAgIGlmIChwcm9wc1R5cGUgPT09IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICBlbnRpdHkgPSB0aGlzLnNkYXRhQmFzZS5yb29tLmZpbmQoJ2JhY2tncm91bmQnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHByb3BzVHlwZSA9PT0gMikge1xyXG4gICAgICAgICAgICAgICAgICAgIGVudGl0eSA9IHRoaXMuc2RhdGFCYXNlLnJvb20uZmluZCgnZ3JvdW5kJyk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBlbnRpdHkgPSBGaXJlLmluc3RhbnRpYXRlKHRoaXMuc2RhdGFCYXNlLnRlbXBGdXJuaXR1cmUpO1xyXG4gICAgICAgICAgICAgICAgICAgIGVudGl0eS5wYXJlbnQgPSB0aGlzLnNkYXRhQmFzZS5yb29tO1xyXG4gICAgICAgICAgICAgICAgICAgIGVudGl0eS5uYW1lID0gZGF0YS5wcm9wc05hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8g6K6+572u5Z2Q5qCHXHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5ld1ZlYzIgPSBuZXcgRmlyZS5WZWMyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHN0ciA9IGRhdGEucG9zLnNwbGl0KFwiOlwiKTtcclxuICAgICAgICAgICAgICAgICAgICBuZXdWZWMyLnggPSBwYXJzZUZsb2F0KHN0clswXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgbmV3VmVjMi55ID0gcGFyc2VGbG9hdChzdHJbMV0pO1xyXG4gICAgICAgICAgICAgICAgICAgIGVudGl0eS50cmFuc2Zvcm0ucG9zaXRpb24gPSBuZXdWZWMyO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIOiuvue9ruinkuW6plxyXG4gICAgICAgICAgICAgICAgICAgIGVudGl0eS50cmFuc2Zvcm0ucm90YXRpb24gPSBkYXRhLnJvdGF0aW9uO1xyXG4gICAgICAgICAgICAgICAgICAgIC8vIOiuvue9ruWkp+Wwj1xyXG4gICAgICAgICAgICAgICAgICAgIHN0ciA9IGRhdGEuc2NhbGUuc3BsaXQoXCI6XCIpO1xyXG4gICAgICAgICAgICAgICAgICAgIG5ld1ZlYzIueCA9IHBhcnNlRmxvYXQoc3RyWzBdKTtcclxuICAgICAgICAgICAgICAgICAgICBuZXdWZWMyLnkgPSBwYXJzZUZsb2F0KHN0clsxXSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZW50aXR5LnRyYW5zZm9ybS5zY2FsZSA9IG5ld1ZlYzI7XHJcbiAgICAgICAgICAgICAgICAgICAgZnVybml0dXJlID0gZW50aXR5LmdldENvbXBvbmVudCgnU0Z1cm5pdHVyZScpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZnVybml0dXJlID0gZW50aXR5LmdldENvbXBvbmVudCgnU0Z1cm5pdHVyZScpO1xyXG4gICAgICAgICAgICAgICAgZnVybml0dXJlLnByb3BzVHlwZSA9IHByb3BzVHlwZTtcclxuICAgICAgICAgICAgICAgIGZ1cm5pdHVyZS5oYXNEcmFnID0gcHJvcHNUeXBlID4gMjtcclxuICAgICAgICAgICAgICAgIGZ1cm5pdHVyZS5zdWl0X2lkID0gZGF0YS5pZDtcclxuICAgICAgICAgICAgICAgIGZ1cm5pdHVyZS5iaWdJbWFnZVVybCA9IGRhdGEuaW1nVXJsO1xyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGEuaW1nVXJsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgRmlyZS5fSW1hZ2VMb2FkZXIoZGF0YS5pbWdVcmwsIGZ1bmN0aW9uIChmdXJuaXR1cmUsIGVycm9yLCBpbWFnZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyb3Ipe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBuZXdTcHJpdGUgPSBuZXcgRmlyZS5TcHJpdGUoaW1hZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmdXJuaXR1cmUuc2V0U3ByaXRlKG5ld1Nwcml0ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMsIGZ1cm5pdHVyZSkpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgICAgICAgICB0aGlzLmNsb3NlV2luZG93KCk7XHJcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICAgIH0sXHJcbiAgICAvLyDph43nva7oo4Xmia7lrrnlmajliJfooahcclxuICAgIF9yZXNldE15RHJlc3NFbnRpdHlTaGVldHM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5kcmVzc1VwRW50aXR5U2hlZXRzLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgIHZhciBjb21wID0gdGhpcy5kcmVzc1VwRW50aXR5U2hlZXRzW2ldO1xyXG4gICAgICAgICAgICBjb21wLnJlc2V0TWVudSgpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvLyDliLfmlrDoo4Xmia7mlbDmja7liJfooahcclxuICAgIF9yZWZyZXNoTXlEcmVzc0xpc3Q6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgLy8g6YeN572u6KOF5omu5a655Zmo5YiX6KGoXHJcbiAgICAgICAgc2VsZi5fcmVzZXRNeURyZXNzRW50aXR5U2hlZXRzKCk7XHJcbiAgICAgICAgLy8g6I635Y+W5oC75pWw5bm25LiU6K6h566X5pyA5aSn6aG15pWwXHJcbiAgICAgICAgaWYgKHNlbGYuX215RHJlc3NVcFRvdGFsICE9PSBzZWxmLnNkYXRhQmFzZS5teURyZXNzVXBUb3RhbCkge1xyXG4gICAgICAgICAgICBzZWxmLl9teURyZXNzVXBUb3RhbCA9IHNlbGYuc2RhdGFCYXNlLm15RHJlc3NVcFRvdGFsO1xyXG4gICAgICAgICAgICBzZWxmLl9tYXhQYWdlID0gTWF0aC5yb3VuZChzZWxmLl9teURyZXNzVXBUb3RhbCAvIHNlbGYuX3Nob3dOdW0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyDmm7TmlrDmjInpkq7nirbmgIFcclxuICAgICAgICBzZWxmLl91cGRhdGVCdXR0b25TdGF0ZSgpO1xyXG4gICAgICAgIC8vIOWmguaenOaAu+aVsOetieS6jjDnmoTor53lsLHkuI3pnIDopoHmmL7npLrkuoZcclxuICAgICAgICBpZiAoc2VsZi5fbXlEcmVzc1VwVG90YWwgPT09IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgc3RhcnROdW0gPSAoc2VsZi5fY3VyUGFnZSAtIDEpICogc2VsZi5fc2hvd051bTtcclxuICAgICAgICB2YXIgZW5kTnVtID0gc3RhcnROdW0gKyBzZWxmLl9zaG93TnVtO1xyXG4gICAgICAgIGlmIChlbmROdW0gPiBzZWxmLl9teURyZXNzVXBUb3RhbCkge1xyXG4gICAgICAgICAgICBlbmROdW0gPSBzZWxmLl9teURyZXNzVXBUb3RhbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGRhdGFTaGVldHMgPSBzZWxmLnNkYXRhQmFzZS5teURyZXNzVXBEYXRhU2hlZXRzO1xyXG4gICAgICAgIHZhciBpbmRleCA9IDA7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IHN0YXJ0TnVtOyBpIDwgZW5kTnVtOyArK2kpIHtcclxuICAgICAgICAgICAgdmFyIG1lbnUgPSBzZWxmLmRyZXNzVXBFbnRpdHlTaGVldHNbaW5kZXhdO1xyXG4gICAgICAgICAgICBtZW51LmVudGl0eS5hY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgICAgICBpbmRleCsrO1xyXG4gICAgICAgICAgICB2YXIgbXlEcmVzc1VwRGF0YSA9IGRhdGFTaGVldHNbaV07XHJcbiAgICAgICAgICAgIGlmICghbXlEcmVzc1VwRGF0YSkge1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbWVudS5yZWZyZXNoKG15RHJlc3NVcERhdGEsIHNlbGYuYmluZFJlYWREYXRhRXZlbnQsIHNlbGYuYmluZERlbERhdGFFdmVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIOWIpOaWreaYr+WQpumcgOimgemihOWKoOi9veS4i+S4gOmhtVxyXG4gICAgICAgIHZhciBsZW4gPSBkYXRhU2hlZXRzLmxlbmd0aDtcclxuICAgICAgICBpZiAobGVuID09PSBzZWxmLl9teURyZXNzVXBUb3RhbCkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIOmihOWKoOi9veS4i+S4gOmhtVxyXG4gICAgICAgIHZhciBuZXh0UGFnZSA9IHNlbGYuX2N1clBhZ2UgKyAxO1xyXG4gICAgICAgIHNlbGYuc2RhdGFCYXNlLnByZWxvYWRNeURyZXNzVXBEYXRhKG5leHRQYWdlLCBzZWxmLl9zaG93TnVtKTtcclxuICAgIH0sXHJcbiAgICAvLyDliJvlu7roo4Xmia7liJfooajlrrnlmahcclxuICAgIF9jcmVhdGVNeURyZXNzVXBFbnRpdHlTaGVldHM6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX3Nob3dOdW07ICsraSkge1xyXG4gICAgICAgICAgICB2YXIgZW50ID0gRmlyZS5pbnN0YW50aWF0ZSh0aGlzLnNkYXRhQmFzZS50ZW1wTXlEcmVzc1VwRGF0YSk7XHJcbiAgICAgICAgICAgIGVudC5wYXJlbnQgPSB0aGlzLnJvb3ROb2RlO1xyXG4gICAgICAgICAgICBlbnQudHJhbnNmb3JtLnBvc2l0aW9uID0gbmV3IEZpcmUuVmVjMigwLCAtaSAqIDgwKTtcclxuICAgICAgICAgICAgdmFyIG1lbnUgPSBlbnQuZ2V0Q29tcG9uZW50KCdTTXlEcmVzc1VwRGF0YScpO1xyXG4gICAgICAgICAgICB2YXIgbXlEcmVzc1VwRGF0YSA9IHtcclxuICAgICAgICAgICAgICAgIGlkOiAtMSxcclxuICAgICAgICAgICAgICAgIG5hbWU6ICfovb3lhaXkuK0uJyxcclxuICAgICAgICAgICAgICAgIHR5cGU6IC0xLFxyXG4gICAgICAgICAgICAgICAgdHlwZU5hbWU6ICfovb3lhaXkuK0uJyxcclxuICAgICAgICAgICAgICAgIGlzRHJlc3M6IC0xXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIG1lbnUucmVmcmVzaChteURyZXNzVXBEYXRhLCB0aGlzLmJpbmRSZWFkRGF0YUV2ZW50LCB0aGlzLmJpbmREZWxEYXRhRXZlbnQpO1xyXG4gICAgICAgICAgICB0aGlzLmRyZXNzVXBFbnRpdHlTaGVldHMucHVzaChtZW51KTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8g5omT5byA56qX5Y+jXHJcbiAgICBvcGVuV2luZG93OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5lbnRpdHkuYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICB0aGlzLnNkYXRhQmFzZS5jaGVja2luZ015RHJlc3NVcERhdGEoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB0aGlzLl9yZWZyZXNoTXlEcmVzc0xpc3QoKTtcclxuICAgICAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgfSxcclxuICAgIC8vIOWFs+mXreeql+WPo1xyXG4gICAgY2xvc2VXaW5kb3c6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLl9jdXJQYWdlID0gMTtcclxuICAgICAgICB0aGlzLl9tYXhQYWdlID0gMDtcclxuICAgICAgICB0aGlzLl9teURyZXNzVXBUb3RhbCA9IDA7XHJcbiAgICAgICAgdGhpcy5lbnRpdHkuYWN0aXZlID0gZmFsc2U7XHJcbiAgICB9LFxyXG4gICAgLy9cclxuICAgIHN0YXJ0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9TRGF0YUJhc2UnKTtcclxuICAgICAgICB0aGlzLnNkYXRhQmFzZSA9IGVudC5nZXRDb21wb25lbnQoJ1NEYXRhQmFzZScpO1xyXG4gICAgICAgIC8vXHJcbiAgICAgICAgdGhpcy5jdXJTZWxlY3RSb29tLnRleHQgPSAn5b2T5YmN6KOF5omuOiDml6AnO1xyXG4gICAgICAgIC8vIOe7keWumuS6i+S7tlxyXG4gICAgICAgIHRoaXMuYnRuX1ByZXZpb3VzLmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmJ0bl9OZXh0LmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmJ0bl9QcmV2aW91cy5vbkNsaWNrID0gdGhpcy5fb25QcmV2aW91c1BhZ2UuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLmJ0bl9OZXh0Lm9uQ2xpY2sgPSB0aGlzLl9vbk5leHRQYWdlLmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5idG5fQ2xvc2Uub25DbGljayA9IHRoaXMuX29uQ2xvc2VXaW5kb3dFdmVudC5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuYnRuX3JlbW92ZUFsbC5vbkNsaWNrID0gdGhpcy5fb25SZW1vdmVBbGxSb29tRGF0YUV2ZW50LmJpbmQodGhpcyk7XHJcbiAgICAgICAgLy8g6aKE5Yqg6L295oiR55qE6KOF5omu5pWw5o2uXHJcbiAgICAgICAgdGhpcy5zZGF0YUJhc2UucHJlbG9hZE15RHJlc3NVcERhdGEodGhpcy5fY3VyUGFnZSwgdGhpcy5fc2hvd051bSk7XHJcbiAgICAgICAgLy8g5Yib5bu66KOF5omu5YiX6KGo5a655ZmoXHJcbiAgICAgICAgdGhpcy5fY3JlYXRlTXlEcmVzc1VwRW50aXR5U2hlZXRzKCk7XHJcbiAgICB9XHJcbn0pO1xyXG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJ2YzYThkRTBlVUJQQXEvZ0d0dGwxdHRCJywgJ1NOZXR3b3JrTWdyJyk7XG4vLyBzY3JpcHRcXHNpbmdsZVxcU05ldHdvcmtNZ3IuanNcblxuLy8g6LSf6LSj5LiO5pyN5Yqh5Zmo6YCa5L+hXHJcbnZhciBTTmV0d29ya01nciA9IEZpcmUuQ2xhc3Moe1xyXG4gICAgLy8g57un5om/XHJcbiAgICBleHRlbmRzOiBGaXJlLkNvbXBvbmVudCxcclxuICAgIC8vIOaehOmAoOWHveaVsFxyXG4gICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAvLyDlvZPliY3or7fmsYLmlbDmja5cclxuICAgICAgICB0aGlzLl9wb3N0RGF0YSA9IHt9O1xyXG4gICAgICAgIHRoaXMud2luX0Vycm9yUHJvbXB0Q29tcCA9IG51bGw7XHJcbiAgICAgICAgLy8g55So5LqO5rWL6K+V55qEdG9rZW7mlbDmja5cclxuICAgICAgICB0aGlzLnRva2VuID0gbnVsbDtcclxuICAgIH0sXHJcbiAgICAvLyDlsZ7mgKdcclxuICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAvLyDmnKzlnLDmtYvor5VcclxuICAgICAgICBsb2NhbFRlc3Q6IGZhbHNlLFxyXG4gICAgICAgIC8vIOi/nuaOpeWksei0peaPkOekuueql+WPo1xyXG4gICAgICAgIHdpbl9FcnJvclByb21wdDoge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiBGaXJlLkVudGl0eVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvLyDlvIDlp4vml7ZcclxuICAgIG9uTG9hZDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBlbnQgPSBGaXJlLkVudGl0eS5maW5kKCcvU0RhdGFCYXNlJyk7XHJcbiAgICAgICAgdGhpcy5zZGF0YUJhc2UgPSBlbnQuZ2V0Q29tcG9uZW50KCdTRGF0YUJhc2UnKTtcclxuICAgICAgICAvLyDojrflj5bnlKjmiLfkv6Hmga9cclxuICAgICAgICB0aGlzLmdldFRvS2VuVmFsdWUoKTtcclxuICAgIH0sXHJcbiAgICAvLyDojrflj5bnlKjmiLfkv6Hmga9cclxuICAgIGdldFRvS2VuVmFsdWU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAodGhpcy5sb2NhbFRlc3QpIHtcclxuICAgICAgICAgICAgdGhpcy50b2tlbiA9ICdNVEF3TVRRNU1qWTROVjh4WVdFell6RmtObUUwWldJM1l6bGtObVF4WW1KbU5EYzROVE5tWmpoa00xOHhORE0yTXpJMk16YzJYM2RoY0EnO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNle1xyXG4gICAgICAgICAgICB0aGlzLnRva2VuID0gdGhpcy5nZXRRdWVyeVN0cmluZygndG9rZW4nKTtcclxuICAgICAgICAgICAgaWYgKCF0aGlzLnRva2VuKXtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiVG9LZW4gaXMgbnVsbFwiKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH0sXHJcbiAgICAvLyDor7fmsYLlpLHotKXlm57osINcclxuICAgIGVycm9yQ2FsbEJhY2s6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAoISB0aGlzLndpbl9FcnJvclByb21wdENvbXApIHtcclxuICAgICAgICAgICAgdmFyIGNvbXAgPSB0aGlzLndpbl9FcnJvclByb21wdC5nZXRDb21wb25lbnQoJ0Vycm9yUHJvbXB0V2luZG93Jyk7XHJcbiAgICAgICAgICAgIHRoaXMud2luX0Vycm9yUHJvbXB0Q29tcCA9IGNvbXA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICB0aGlzLndpbl9FcnJvclByb21wdENvbXAuc2V0Q2FsbEV2ZW50KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgc2VsZi5zZW5kRGF0YVRvU2VydmVyKHNlbGYuX3Bvc3REYXRhKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLndpbl9FcnJvclByb21wdC5hY3RpdmUgPSB0cnVlO1xyXG4gICAgfSxcclxuICAgIC8vIOeUqEpT6I635Y+W5Zyw5Z2A5qCP5Y+C5pWw55qE5pa55rOVXHJcbiAgICBnZXRRdWVyeVN0cmluZzogZnVuY3Rpb24obmFtZSkge1xyXG4gICAgICAgIHZhciByZWcgPSBuZXcgUmVnRXhwKFwiKF58JilcIiArIG5hbWUgKyBcIj0oW14mXSopKCZ8JClcIik7XHJcbiAgICAgICAgdmFyIHIgPSB3aW5kb3cubG9jYXRpb24uc2VhcmNoLnN1YnN0cigxKS5tYXRjaChyZWcpO1xyXG4gICAgICAgIGlmIChyICE9PSBudWxsKXtcclxuICAgICAgICAgICAgcmV0dXJuIHVuZXNjYXBlKHJbMl0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH0sXHJcbiAgICAvLyDojrflj5bmlbDmja5cclxuICAgIHNlbmREYXRhVG9TZXJ2ZXI6IGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgaWYgKCEgdGhpcy5nZXRUb0tlblZhbHVlKCkpIHtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnNkYXRhQmFzZS5zbG9hZGluZ1RpcHMub3BlblRpcHMoKTtcclxuICAgICAgICB0aGlzLl9wb3N0RGF0YSA9IGRhdGE7XHJcbiAgICAgICAgdGhpcy5qUXVlcnlBamF4KGRhdGEudXJsLCBkYXRhLnNlbmREYXRhLCBkYXRhLmNiLCBkYXRhLmVyckNiKTtcclxuICAgIH0sXHJcbiAgICAvLyDkuI7mnI3liqHlmajpgJrkv6FcclxuICAgIGpRdWVyeUFqYXg6IGZ1bmN0aW9uIChzdHJVcmwsIGRhdGEsIGNhbGxCYWNrLCBlcnJvckNhbGxCYWNrKSB7XHJcbiAgICAgICAgdmFyIHBhcmFtcyA9IFwiXCI7XHJcbiAgICAgICAgaWYgKHR5cGVvZihkYXRhKSA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgICAgICAgICBmb3IgKHZhciBrZXkgaW4gZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgcGFyYW1zICs9IChrZXkgKyBcIj1cIiArIGRhdGFba2V5XSArIFwiJlwiICApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHBhcmFtcyArPSBcIiZ0b2tlbj1cIiArIHRoaXMudG9rZW47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBwYXJhbXMgPSBkYXRhICsgXCImdG9rZW49XCIgKyB0aGlzLnRva2VuO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgdmFyIHNlbmQgPSB7XHJcbiAgICAgICAgICAgIHR5cGU6IFwiUE9TVFwiLFxyXG4gICAgICAgICAgICB1cmw6IHN0clVybCArIFwiPyZqc29uY2FsbFBQPT9cIixcclxuICAgICAgICAgICAgZGF0YTogcGFyYW1zLFxyXG4gICAgICAgICAgICBkYXRhVHlwZTogJ2pzb25wJyxcclxuICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgIGlmIChzZWxmLnNkYXRhQmFzZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlbGYuc2RhdGFCYXNlLnNsb2FkaW5nVGlwcy5jbG9zZVRpcHMoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChjYWxsQmFjaykge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhbGxCYWNrKGRhdGEpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBlcnJvcjogZnVuY3Rpb24gKFhNTEh0dHBSZXF1ZXN0LCB0ZXh0U3RhdHVzLCBlcnJvclRocm93bikge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5zZGF0YUJhc2Uuc2xvYWRpbmdUaXBzLmNsb3NlVGlwcygpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGVycm9yQ2FsbEJhY2spIHtcclxuICAgICAgICAgICAgICAgICAgICBlcnJvckNhbGxCYWNrKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvclRocm93bik7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhYTUxIdHRwUmVxdWVzdCk7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0ZXh0U3RhdHVzKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgalF1ZXJ5LmFqYXgoc2VuZCk7XHJcbiAgICB9LFxyXG4gICAgLy8g6K+35rGC5Yid5aeL5YyW5oi/6Ze05pWw5o2uXHJcbiAgICBSZXF1ZXN0SW5pdEhvbWU6IGZ1bmN0aW9uIChjYWxsYmFjaykge1xyXG4gICAgICAgIHZhciBwb3N0RGF0YSA9IHtcclxuICAgICAgICAgICAgdXJsOiAnaHR0cDovL20uc2Fpa2UuY29tL2hvdXNlZHJlc3MvZGVmYXVsdFNpbmdsZS5odG1sJyxcclxuICAgICAgICAgICAgc2VuZERhdGE6IHt9LFxyXG4gICAgICAgICAgICBjYjogY2FsbGJhY2ssXHJcbiAgICAgICAgICAgIGVyckNiOiB0aGlzLmVycm9yQ2FsbEJhY2suYmluZCh0aGlzKVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5zZW5kRGF0YVRvU2VydmVyKHBvc3REYXRhKTtcclxuICAgIH0sXHJcbiAgICAvLyDor7fmsYLkuoznuqfoj5zljZXliJfooahcclxuICAgIFJlcXVlc3RTZWNvbmRhcnlNZW51RGF0YTogZnVuY3Rpb24gKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgdmFyIHBvc3REYXRhID0ge1xyXG4gICAgICAgICAgICB1cmw6ICdodHRwOi8vbS5zYWlrZS5jb20vaG91c2VkcmVzcy9nZXRTaG9wVHlwZS5odG1sJyxcclxuICAgICAgICAgICAgc2VuZERhdGE6IHt9LFxyXG4gICAgICAgICAgICBjYjogY2FsbGJhY2ssXHJcbiAgICAgICAgICAgIGVyckNiOiB0aGlzLmVycm9yQ2FsbEJhY2suYmluZCh0aGlzKVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5zZW5kRGF0YVRvU2VydmVyKHBvc3REYXRhKTtcclxuICAgIH0sXHJcbiAgICAvLyDor7fmsYLkuInnuqfoj5zljZXmlbDmja5cclxuICAgIFJlcXVlc3RTaW5nbGVJdGVtczogZnVuY3Rpb24gKGRhdGEsIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgdmFyIHBvc3REYXRhID0ge1xyXG4gICAgICAgICAgICB1cmw6IFwiaHR0cDovL20uc2Fpa2UuY29tL2hvdXNlZHJlc3MvZ2V0U2hvcExpc3QuaHRtbFwiLFxyXG4gICAgICAgICAgICBzZW5kRGF0YToge1xyXG4gICAgICAgICAgICAgICAgdGlkOiBkYXRhLnRpZCxcclxuICAgICAgICAgICAgICAgIHBhZ2U6IGRhdGEucGFnZSxcclxuICAgICAgICAgICAgICAgIGVhY2g6IGRhdGEuZWFjaFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBjYjogY2FsbGJhY2ssXHJcbiAgICAgICAgICAgIGVyckNiOiB0aGlzLmVycm9yQ2FsbEJhY2suYmluZCh0aGlzKVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5zZW5kRGF0YVRvU2VydmVyKHBvc3REYXRhKTtcclxuICAgIH0sXHJcbiAgICAvLyDliKDpmaTljZXkuKrmiL/pl7TmlbDmja5cclxuICAgIFJlcXVlc3REZWxIb21lOiBmdW5jdGlvbiAoc2VuZERhdGEsIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgdmFyIHBvc3REYXRhID0ge1xyXG4gICAgICAgICAgICB1cmw6IFwiaHR0cDovL20uc2Fpa2UuY29tL2hvdXNlZHJlc3MvZGVsU3VpdC5odG1sXCIsXHJcbiAgICAgICAgICAgIHNlbmREYXRhOiB7XHJcbiAgICAgICAgICAgICAgICBpZDogc2VuZERhdGEuaWRcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgY2I6IGNhbGxiYWNrLFxyXG4gICAgICAgICAgICBlcnJDYjogdGhpcy5lcnJvckNhbGxCYWNrLmJpbmQodGhpcylcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMuc2VuZERhdGFUb1NlcnZlcihwb3N0RGF0YSk7XHJcbiAgICB9LFxyXG4gICAgLy8g6K+35rGC5oi/6Ze05YiX6KGoXHJcbiAgICBSZXF1ZXN0SG9tZUxpc3Q6IGZ1bmN0aW9uIChzZW5kRGF0YSwgY2FsbGJhY2spIHtcclxuICAgICAgICB2YXIgcG9zdERhdGEgPSB7XHJcbiAgICAgICAgICAgIHVybDogXCJodHRwOi8vbS5zYWlrZS5jb20vaG91c2VkcmVzcy9teVN1aXRMaXN0Lmh0bWxcIixcclxuICAgICAgICAgICAgc2VuZERhdGE6IHtcclxuICAgICAgICAgICAgICAgIHBhZ2U6IHNlbmREYXRhLnBhZ2UsXHJcbiAgICAgICAgICAgICAgICBlYWNobnVtOiBzZW5kRGF0YS5lYWNobnVtLFxyXG4gICAgICAgICAgICAgICAgcm9vbV90eXBlOiBzZW5kRGF0YS5yb29tX3R5cGVcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgY2I6IGNhbGxiYWNrLFxyXG4gICAgICAgICAgICBlcnJDYjogdGhpcy5lcnJvckNhbGxCYWNrLmJpbmQodGhpcylcclxuICAgICAgICB9O1xyXG4gICAgICAgIHRoaXMuc2VuZERhdGFUb1NlcnZlcihwb3N0RGF0YSk7XHJcbiAgICB9LFxyXG4gICAgLy8g6K+35rGC5Y2V5Liq5oi/6Ze05pWw5o2uXHJcbiAgICBSZXF1ZXN0SG9tZURhdGE6IGZ1bmN0aW9uIChzZW5kRGF0YSwgY2FsbGJhY2spIHtcclxuICAgICAgICB2YXIgcG9zdERhdGEgPSB7XHJcbiAgICAgICAgICAgIHVybDogXCJodHRwOi8vbS5zYWlrZS5jb20vaG91c2VkcmVzcy9nZXRTdWl0RGV0YWlscy5odG1sXCIsXHJcbiAgICAgICAgICAgIHNlbmREYXRhOiB7XHJcbiAgICAgICAgICAgICAgICBzdWl0X2lkOiBzZW5kRGF0YS5zdWl0X2lkXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGNiOiBjYWxsYmFjayxcclxuICAgICAgICAgICAgZXJyQ2I6IHRoaXMuZXJyb3JDYWxsQmFjay5iaW5kKHRoaXMpXHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLnNlbmREYXRhVG9TZXJ2ZXIocG9zdERhdGEpO1xyXG4gICAgfSxcclxuICAgIC8vIOWtmOWCqOaIv+mXtOaVsOaNrlxyXG4gICAgU2VuZEhvbWVEYXRhOiBmdW5jdGlvbiAoc2VuZERhdGEsIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgdmFyIHBvc3REYXRhID0ge1xyXG4gICAgICAgICAgICB1cmw6IFwiaHR0cDovL20uc2Fpa2UuY29tL2hvdXNlZHJlc3Mvc2F2ZVNpbmdsZURyZXNzLmh0bWxcIixcclxuICAgICAgICAgICAgc2VuZERhdGE6IHtcclxuICAgICAgICAgICAgICAgIHN1aXRfaWQ6IDAsXHJcbiAgICAgICAgICAgICAgICB0aHVtYm5haWxzOiBzZW5kRGF0YS50aHVtYm5haWxzLFxyXG4gICAgICAgICAgICAgICAgc3VpdF9uYW1lOiBlbmNvZGVVUklDb21wb25lbnQoc2VuZERhdGEubmFtZSksXHJcbiAgICAgICAgICAgICAgICBzdWl0X3R5cGU6IHNlbmREYXRhLnR5cGUsXHJcbiAgICAgICAgICAgICAgICBkYXRhTGlzdDogSlNPTi5zdHJpbmdpZnkoc2VuZERhdGEuZGF0YUxpc3QpXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGNiOiBjYWxsYmFjayxcclxuICAgICAgICAgICAgZXJyQ2I6IHRoaXMuZXJyb3JDYWxsQmFjay5iaW5kKHRoaXMpXHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLnNlbmREYXRhVG9TZXJ2ZXIocG9zdERhdGEpO1xyXG4gICAgfSxcclxuICAgIC8vIOWtmOWCqOaIv+mXtOe8qeeVpeWbvlxyXG4gICAgU2VuZEltYWdlVG9TZXJ2ZXI6IGZ1bmN0aW9uIChzZW5kRGF0YSwgY2FsbGJhY2spIHtcclxuICAgICAgICB2YXIgcG9zdERhdGEgPSB7XHJcbiAgICAgICAgICAgIHVybDogXCJzcHVwbG9hZC5waHBcIixcclxuICAgICAgICAgICAgc2VuZERhdGE6IHtcclxuICAgICAgICAgICAgICAgIGhvdXNlX3VpZDogc2VuZERhdGEuaG91c2VfdWlkLFxyXG4gICAgICAgICAgICAgICAgc3VpdF9pZDogc2VuZERhdGEuc3VpdF9pZCxcclxuICAgICAgICAgICAgICAgIGltZzogc2VuZERhdGEuaW1hZ2Uuc3JjLFxyXG4gICAgICAgICAgICAgICAgdG9LZW46IHRoaXMudG9LZW5cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5zZGF0YUJhc2Uuc2xvYWRpbmdUaXBzLm9wZW5UaXBzKCflrZjlgqjnvKnnlaXlm74nKTtcclxuICAgICAgICBqUXVlcnkucG9zdChwb3N0RGF0YS51cmwsIHBvc3REYXRhLCBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2RhdGFCYXNlLnNsb2FkaW5nVGlwcy5jbG9zZVRpcHMoKTtcclxuICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhkYXRhKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sJ2pzb25wJyk7XHJcbiAgICB9XHJcbn0pO1xyXG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJ2I4MjNiYkNCM2xKcVlXb0Q0SlMvZ0FyJywgJ1NTYXZlUm9vbVdpbmRvdycpO1xuLy8gc2NyaXB0XFxzaW5nbGVcXFNTYXZlUm9vbVdpbmRvdy5qc1xuXG4vLyDkv53lrZjmiL/pl7TmlbDmja7nqpflj6NcclxudmFyIFNhdmVSb29tV2luZG93ID0gRmlyZS5DbGFzcyh7XHJcbiAgICAvLyDnu6fmib9cclxuICAgIGV4dGVuZHM6IEZpcmUuQ29tcG9uZW50LFxyXG4gICAgLy8g5p6E6YCg5Ye95pWwXHJcbiAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMubGFzdEFuaW0gPSBudWxsO1xyXG4gICAgICAgIHRoaXMuc3Ryb2FnZURyZXNzRXZlbnQgPSB0aGlzLl9vblN0cm9hZ2VEcmVzc0V2ZW50LmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5jbG9zZVdpbmRvd0V2ZW50ID0gdGhpcy5fb25DbG9zZVdpbmRvd0V2ZW50LmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5iaW5kQ3JlYXRlVGh1bWJuYWlsc0V2ZW50ID0gdGhpcy5fb25DcmVhdGVUaHVtYm5haWxzRXZlbnQuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLmRlZmF1bHRUaHVtYm5haWxzID0gbnVsbDtcclxuICAgICAgICB0aGlzLmhhc0Rvd25UaHVtYm5haWxzID0gZmFsc2U7XHJcbiAgICB9LFxyXG4gICAgLy8g5bGe5oCnXHJcbiAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgLy8g57yp55Wl5Zu+XHJcbiAgICAgICAgYnRuX3RodW1ibmFpbHM6IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5VSUJ1dHRvblxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8g5oi/6Ze05ZCN56ewXHJcbiAgICAgICAgcm9vbU5hbWU6IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5JbnB1dEZpZWxkXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDmiL/pl7TnsbvlnotcclxuICAgICAgICByb29tVHlwZUxpc3Q6IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5VSVBvcHVwTGlzdFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYnRuX2NvbHNlOiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVUlCdXR0b25cclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vIOehruiupOS/neWtmFxyXG4gICAgICAgIGJ0bl9jb25maXJtU2F2ZToge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlVJQnV0dG9uXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIOWIm+W7uue8qeeVpeWbvlxyXG4gICAgX29uQ3JlYXRlVGh1bWJuYWlsc0V2ZW50OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIGlmIChzZWxmLmhhc0Rvd25UaHVtYm5haWxzKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgc2VsZi5oYXNEb3duVGh1bWJuYWlscyA9IHRydWU7XHJcbiAgICAgICAgc2VsZi5idG5fdGh1bWJuYWlscy50ZXh0Q29udGVudC50ZXh0ID0gJ+S/neaMgeS4reivt+eojeetiS4uJztcclxuICAgICAgICBzZWxmLnNkYXRhQmFzZS5zY3JlZW5zaG90LmNyZWF0ZVRodW1ibmFpbHMoZnVuY3Rpb24gKGltYWdlKSB7XHJcbiAgICAgICAgICAgIHNlbGYuaGFzRG93blRodW1ibmFpbHMgPSBmYWxzZTtcclxuICAgICAgICAgICAgc2VsZi5idG5fdGh1bWJuYWlscy5zZXRJbWFnZShpbWFnZSk7XHJcbiAgICAgICAgICAgIHNlbGYuYnRuX3RodW1ibmFpbHMudGV4dENvbnRlbnQuZW50aXR5LmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICBzZWxmLmJ0bl90aHVtYm5haWxzLnRleHRDb250ZW50LnRleHQgPSAn54K55Ye75q2k5aSEXFxu5Yib5bu657yp55Wl5Zu+JztcclxuICAgICAgICB9KTtcclxuICAgIH0sXHJcbiAgICAvLyDlhbPpl63kv53lrZjnqpflj6NcclxuICAgIF9vbkNsb3NlV2luZG93RXZlbnQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLmNsb3NlV2luZG93KCk7XHJcbiAgICB9LFxyXG4gICAgLy8g5re75Yqg5oi/6Ze05pWw5o2uXHJcbiAgICBfYWRkSG9tZURhdGE6IGZ1bmN0aW9uIChwcm9wcywgZW50aXR5LCBob21lRGF0YSkge1xyXG4gICAgICAgIHZhciBkYXRhID0ge1xyXG4gICAgICAgICAgICBpZDogcHJvcHMuc3VpdF9pZCxcclxuICAgICAgICAgICAgcHJvcHNOYW1lOiBlbnRpdHkubmFtZSxcclxuICAgICAgICAgICAgcHJvcHNUeXBlOiBwcm9wcy5wcm9wVHlwZSxcclxuICAgICAgICAgICAgcG9zOiBlbnRpdHkudHJhbnNmb3JtLnggKyBcIjpcIiArIGVudGl0eS50cmFuc2Zvcm0ueSxcclxuICAgICAgICAgICAgcm90YXRpb246IGVudGl0eS50cmFuc2Zvcm0ucm90YXRpb24sXHJcbiAgICAgICAgICAgIHNjYWxlOiBlbnRpdHkudHJhbnNmb3JtLnNjYWxlWCArIFwiOlwiICsgZW50aXR5LnRyYW5zZm9ybS5zY2FsZVksXHJcbiAgICAgICAgICAgIGltZ1VybDogcHJvcHMuYmlnSW1hZ2VVcmxcclxuICAgICAgICB9O1xyXG4gICAgICAgIGhvbWVEYXRhLmRhdGFMaXN0LnB1c2goZGF0YSk7XHJcbiAgICB9LFxyXG4gICAgLy8g5L+d5a2Y5oi/6Ze05pWw5o2uXHJcbiAgICBfc2F2ZWhvbWVEYXRhOiBmdW5jdGlvbiAobmFtZSwgdHlwZSkge1xyXG4gICAgICAgIHZhciBob21lRGF0YSA9IHtcclxuICAgICAgICAgICAga2V5OiAwLFxyXG4gICAgICAgICAgICBuYW1lOiBuYW1lLFxyXG4gICAgICAgICAgICB0eXBlOiB0eXBlLFxyXG4gICAgICAgICAgICBkYXRhTGlzdDogW11cclxuICAgICAgICB9O1xyXG4gICAgICAgIHZhciBwcm9wcyA9IG51bGw7XHJcbiAgICAgICAgdmFyIGNoaWxkcmVucyA9IHRoaXMuc2RhdGFCYXNlLnJvb20uZ2V0Q2hpbGRyZW4oKTtcclxuICAgICAgICBmb3IodmFyIGkgPSAwLCBsZW4gPSBjaGlsZHJlbnMubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcclxuICAgICAgICAgICAgdmFyIGVudGl0eSA9IGNoaWxkcmVuc1tpXTtcclxuICAgICAgICAgICAgcHJvcHMgPSBlbnRpdHkuZ2V0Q29tcG9uZW50KCdTRnVybml0dXJlJyk7XHJcbiAgICAgICAgICAgIGlmICghcHJvcHMpIHtcclxuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuX2FkZEhvbWVEYXRhKHByb3BzLCBlbnRpdHksIGhvbWVEYXRhKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGhvbWVEYXRhO1xyXG4gICAgfSxcclxuICAgIC8vXHJcbiAgICBfb25TdHJvYWdlRHJlc3NFdmVudDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIC8vXHJcbiAgICAgICAgaWYgKHRoaXMucm9vbU5hbWUudGV4dCA9PT0gXCJcIiB8fCB0aGlzLnJvb21UeXBlTGlzdC5yb29tVHlwZSA9PT0gLTEgfHxcclxuICAgICAgICAgICAgdGhpcy5idG5fdGh1bWJuYWlscy5idG5SZW5kZXIuc3ByaXRlID09PSB0aGlzLmRlZmF1bHRUaHVtYm5haWxzKSAge1xyXG4gICAgICAgICAgICAvL1xyXG4gICAgICAgICAgICB0aGlzLnNkYXRhQmFzZS5zc2F2ZUVycm9yVGlwcy5hY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgICAgICAvLyB0aXBz5Yqo55S7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmxhc3RBbmltKXtcclxuICAgICAgICAgICAgICAgIHRoaXMubGFzdEFuaW0uc3RvcCgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciBhbmltID0gdGhpcy5zZGF0YUJhc2Uuc3NhdmVFcnJvclRpcHMuYW5pbWF0ZShbXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgJ0ZpcmUuVHJhbnNmb3JtJzogeyBzY2FsZTogbmV3IEZpcmUuVmVjMigwLCAwKSB9XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICdGaXJlLlRyYW5zZm9ybSc6IHsgc2NhbGU6IG5ldyBGaXJlLlZlYzIoMSwgMSkgfSxcclxuICAgICAgICAgICAgICAgICAgICByYXRpbzogMC4yXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICdGaXJlLlRyYW5zZm9ybSc6IHsgc2NhbGU6IG5ldyBGaXJlLlZlYzIoMSwgMSkgfVxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgXSwge2R1cmF0aW9uOiAxfSk7XHJcblxyXG4gICAgICAgICAgICB0aGlzLmxhc3RBbmltID0gYW5pbTtcclxuICAgICAgICAgICAgYW5pbS5vblN0b3AgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnNkYXRhQmFzZS5zc2F2ZUVycm9yVGlwcy5hY3RpdmUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHRoaXMuc2RhdGFCYXNlLnNzYXZlRXJyb3JUaXBzLnRyYW5zZm9ybS5zY2FsZSA9IG5ldyBGaXJlLlZlYzIoMCwgMCk7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5zZGF0YUJhc2Uuc3NhdmVFcnJvclRpcHMuYWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgdmFyIG5hbWUgPSB0aGlzLnJvb21OYW1lLnRleHQ7XHJcbiAgICAgICAgdmFyIHR5cGUgPSB0aGlzLnJvb21UeXBlTGlzdC5yb29tVHlwZTtcclxuICAgICAgICB2YXIgaG9tZURhdGEgPSB0aGlzLl9zYXZlaG9tZURhdGEobmFtZSwgdHlwZSk7XHJcblxyXG4gICAgICAgIC8vIOS/neWtmOe8qeeVpeWbvlxyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICB0aGlzLnNkYXRhQmFzZS5zbmV0V29ya01nci5TZW5kSG9tZURhdGEoaG9tZURhdGEsIGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAgIGlmIChkYXRhLnN0YXR1cyA+IDEwMDAwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIHNlbmREYXRhID0ge1xyXG4gICAgICAgICAgICAgICAgaG91c2VfdWlkOiBkYXRhLmhvdXNlX3VpZCxcclxuICAgICAgICAgICAgICAgIHN1aXRfaWQ6IGRhdGEuc3VpdF9pZCxcclxuICAgICAgICAgICAgICAgIGltYWdlOiBzZWxmLmJ0bl90aHVtYm5haWxzLmltYWdlXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIHNlbGYuc2RhdGFCYXNlLnNuZXRXb3JrTWdyLlNlbmRJbWFnZVRvU2VydmVyKHNlbmREYXRhLCBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgc2VsZi5jbG9zZVdpbmRvdygpO1xyXG4gICAgICAgICAgICAgICAgc2VsZi5zZGF0YUJhc2Uuc3RpcHNXaW5kb3cub3BlbldpbmRvdygn5L+d5a2Y5oiQ5YqfLi4nKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgLy8g5omT5byA56qX5Y+jXHJcbiAgICBvcGVuV2luZG93OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5lbnRpdHkuYWN0aXZlID0gdHJ1ZTtcclxuICAgIH0sXHJcbiAgICAvLyDlhbPpl61cclxuICAgIGNsb3NlV2luZG93OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5zZGF0YUJhc2Uuc3NhdmVFcnJvclRpcHMuYWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5lbnRpdHkuYWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5yb29tVHlwZUxpc3Qucm9vbVR5cGUgPSAtMTtcclxuICAgICAgICB0aGlzLnJvb21OYW1lLnRleHQgPSAnJztcclxuICAgICAgICB0aGlzLnJvb21UeXBlTGlzdC5idG5fcm9vbVR5cGUuc2V0VGV4dCgn57G75Z6L5ZCN56ewJyk7XHJcbiAgICAgICAgaWYgKHRoaXMuZGVmYXVsdFRodW1ibmFpbHMpIHtcclxuICAgICAgICAgICAgdGhpcy5idG5fdGh1bWJuYWlscy5zZXRTcHJpdGUodGhpcy5kZWZhdWx0VGh1bWJuYWlscyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuYnRuX3RodW1ibmFpbHMudGV4dENvbnRlbnQuZW50aXR5LmFjdGl2ZSA9IHRydWU7XHJcbiAgICB9LFxyXG4gICAgLy8g5byA5aeL5pe2XHJcbiAgICBzdGFydDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBlbnQgPSBGaXJlLkVudGl0eS5maW5kKCcvU0RhdGFCYXNlJyk7XHJcbiAgICAgICAgdGhpcy5zZGF0YUJhc2UgPSBlbnQuZ2V0Q29tcG9uZW50KCdTRGF0YUJhc2UnKTtcclxuICAgICAgICAvL1xyXG4gICAgICAgIHRoaXMuYnRuX2NvbHNlLm9uQ2xpY2sgPSB0aGlzLmNsb3NlV2luZG93RXZlbnQ7XHJcbiAgICAgICAgdGhpcy5idG5fY29uZmlybVNhdmUub25DbGljayA9IHRoaXMuc3Ryb2FnZURyZXNzRXZlbnQ7XHJcbiAgICAgICAgdGhpcy5idG5fdGh1bWJuYWlscy5vbkNsaWNrID0gdGhpcy5iaW5kQ3JlYXRlVGh1bWJuYWlsc0V2ZW50O1xyXG4gICAgICAgIHRoaXMuZGVmYXVsdFRodW1ibmFpbHMgPSB0aGlzLmJ0bl90aHVtYm5haWxzLmJ0blJlbmRlci5zcHJpdGU7XHJcbiAgICB9XHJcbn0pO1xyXG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJzg4Y2M2OHltSkpFS0xnVFdDVXE2ZHNtJywgJ1NTZWNvbmRhcnlNZW51TWdyJyk7XG4vLyBzY3JpcHRcXHNpbmdsZVxcU1NlY29uZGFyeU1lbnVNZ3IuanNcblxuLy8g5LqM57qn6I+c5Y2V566h55CG57G7XHJcbnZhciBTU2Vjb25kYXJ5TWVudU1nciA9IEZpcmUuQ2xhc3Moe1xyXG4gICAgLy8g57un5om/XHJcbiAgICBleHRlbmRzOiBGaXJlLkNvbXBvbmVudCxcclxuICAgIC8vIOaehOmAoOWHveaVsFxyXG4gICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAvLyDkuIDpobXmmL7npLrlpJrlsJHkuKpcclxuICAgICAgICB0aGlzLl9zaG93VG90YWwgPSA4O1xyXG4gICAgICAgIC8vIOiPnOWNleWuueWZqOWIl+ihqFxyXG4gICAgICAgIHRoaXMuX21lbnVTaGVldHMgPSBbXTtcclxuICAgICAgICAvLyDmiZPlvIDkuInnuqfoj5zljZXkuovku7ZcclxuICAgICAgICB0aGlzLmJpbmRPcGVuVGhyZWVNZW51RXZlbnQgPSB0aGlzLl9vbk9wZW5UaHJlZU1lbnVFdmVudC5iaW5kKHRoaXMpO1xyXG4gICAgICAgIC8vIOWNleWTgeiPnOWNleWbnuiwg+WHveaVsFxyXG4gICAgICAgIHRoaXMuYmluZFJlZnJlc2hFZXZudCA9IHRoaXMuX3JlZnJlc2hTaW5nbGVTZWNvbmRhcnlNZW51LmJpbmQodGhpcyk7XHJcbiAgICB9LFxyXG4gICAgLy8g5bGe5oCnXHJcbiAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgLy9cclxuICAgICAgICBtYXJnaW46IG5ldyBGaXJlLlZlYzIoMCwgNjQpLFxyXG4gICAgICAgIC8vIOS6jOe6p+iPnOWNleeahOagueiKgueCuVxyXG4gICAgICAgIHJvb3ROb2RlOiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuRW50aXR5XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIOaJk+W8gOWQhOS4quexu+Wei+WutuWFt+WIl+ihqFxyXG4gICAgX29uT3BlblRocmVlTWVudUV2ZW50OiBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICB2YXIgbWVudSA9IGV2ZW50LnRhcmdldC5wYXJlbnQuZ2V0Q29tcG9uZW50KCdTU2Vjb25kYXJ5TWVudScpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCfojrflj5YnICsgbWVudS50aWQgKyBcIuexu+Wei+WutuWFt+WIl+ihqFwiKTtcclxuICAgICAgICB0aGlzLnNkYXRhQmFzZS5zdGhyZWVNZW51TWdyLm9wZW5NZW51KG1lbnUudGlkLCBtZW51Lmhhc0RyYWcpO1xyXG4gICAgfSxcclxuICAgIC8vIOmHjee9ruiPnOWNleWIl+ihqFxyXG4gICAgX3Jlc2V0TWVudTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICh0aGlzLl9tZW51U2hlZXRzLmxlbmd0aCA9PT0gMCl7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9zaG93VG90YWw7ICsraSkge1xyXG4gICAgICAgICAgICB2YXIgbWVudSA9IHRoaXMuX21lbnVTaGVldHNbaV07XHJcbiAgICAgICAgICAgIG1lbnUubmFtZSA9IGkudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgbWVudS5yZXNldE1lbnUoKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8g5Yib5bu66I+c5Y2V5a655ZmoXHJcbiAgICBfY3JlYXRlTWVudUNvbnRhaW5lcnM6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAodGhpcy5fbWVudVNoZWV0cy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHRlbXBNZW51ID0gdGhpcy5zZGF0YUJhc2UudGVtcFNlY29uZGFyeU1lbnU7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9zaG93VG90YWw7ICsraSkge1xyXG4gICAgICAgICAgICB2YXIgZW50ID0gRmlyZS5pbnN0YW50aWF0ZSh0ZW1wTWVudSk7XHJcbiAgICAgICAgICAgIGVudC5uYW1lID0gaS50b1N0cmluZygpO1xyXG4gICAgICAgICAgICBlbnQucGFyZW50ID0gdGhpcy5yb290Tm9kZTtcclxuICAgICAgICAgICAgZW50LnRyYW5zZm9ybS5wb3NpdGlvbiA9IG5ldyBGaXJlLlZlYzIoLTQ5NSArIChpICogMTQwKSwgMCk7XHJcbiAgICAgICAgICAgIHZhciBtZW51ID0gZW50LmdldENvbXBvbmVudCgnU1NlY29uZGFyeU1lbnUnKTtcclxuICAgICAgICAgICAgbWVudS5pbml0KCk7XHJcbiAgICAgICAgICAgIC8vIOWtmOWCqOWvueixoVxyXG4gICAgICAgICAgICB0aGlzLl9tZW51U2hlZXRzLnB1c2gobWVudSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIOWIt+aWsOS6jOe6p+iPnOWNlVxyXG4gICAgX3JlZnJlc2hTZWNvbmRhcnlNZW51OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgLy8g5Yib5bu65a655ZmoXHJcbiAgICAgICAgdGhpcy5fY3JlYXRlTWVudUNvbnRhaW5lcnMoKTtcclxuICAgICAgICAvLyDph43nva7oj5zljZXliJfooahcclxuICAgICAgICB0aGlzLl9yZXNldE1lbnUoKTtcclxuICAgICAgICAvLyDph43mlrDotYvlgLxcclxuICAgICAgICB2YXIgaSA9IDAsIG1lbnUgPSBudWxsO1xyXG4gICAgICAgIHZhciBkYXRhTGlzdCA9IHRoaXMuc2RhdGFCYXNlLnNlY29uZGFyeU1lbnVEYXRhU2hlZXRzO1xyXG4gICAgICAgIGZvcihpID0gMDsgaSA8IGRhdGFMaXN0Lmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgIHZhciBkYXRhID0gZGF0YUxpc3RbaV07XHJcbiAgICAgICAgICAgIGlmICghIGRhdGEpe1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbWVudSA9IHRoaXMuX21lbnVTaGVldHNbaV07XHJcbiAgICAgICAgICAgIG1lbnUucmVmcmVzaChkYXRhLCB0aGlzLmJpbmRPcGVuVGhyZWVNZW51RXZlbnQpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvLyDliLfmlrDljZXkuKrkuoznuqfoj5zljZVcclxuICAgIF9yZWZyZXNoU2luZ2xlU2Vjb25kYXJ5TWVudTogZnVuY3Rpb24gKGluZGV4LCBkYXRhKSB7XHJcbiAgICAgICAgaWYgKCF0aGlzLl9tZW51U2hlZXRzIHx8IHRoaXMuX21lbnVTaGVldHMubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIG1lbnUgPSB0aGlzLl9tZW51U2hlZXRzW2luZGV4XTtcclxuICAgICAgICBpZiAobWVudSkge1xyXG4gICAgICAgICAgICBtZW51LnJlZnJlc2goZGF0YSwgdGhpcy5iaW5kT3BlblRocmVlTWVudUV2ZW50KTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgb25Mb2FkOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9TRGF0YUJhc2UnKTtcclxuICAgICAgICB0aGlzLnNkYXRhQmFzZSA9IGVudC5nZXRDb21wb25lbnQoJ1NEYXRhQmFzZScpO1xyXG4gICAgICAgIC8vIOmihOWKoOi9vSDljZXlk4FcclxuICAgICAgICB0aGlzLnNkYXRhQmFzZS5wcmVsb2FkU2Vjb25kYXJ5TWVudURhdGEodGhpcy5iaW5kUmVmcmVzaEVldm50KTtcclxuICAgIH0sXHJcbiAgICAvLyDlvIDlp4tcclxuICAgIHN0YXJ0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgLy8g5Yi35paw5Y2V5ZOB5a625YW36I+c5Y2V5YiX6KGoXHJcbiAgICAgICAgdGhpcy5fcmVmcmVzaFNlY29uZGFyeU1lbnUoKTtcclxuICAgIH0sXHJcbiAgICB1cGRhdGU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAvLyDljLnphY1VSeWIhui+qOeOh1xyXG4gICAgICAgIC8vdmFyIGNhbWVyYSA9IEZpcmUuQ2FtZXJhLm1haW47XHJcbiAgICAgICAgLy92YXIgYmdXb3JsZEJvdW5kcyA9IHRoaXMuc2RhdGFCYXNlLmJnUmVuZGVyLmdldFdvcmxkQm91bmRzKCk7XHJcbiAgICAgICAgLy92YXIgYmdMZWZ0VG9wV29ybGRQb3MgPSBuZXcgRmlyZS5WZWMyKGJnV29ybGRCb3VuZHMueE1pbiwgYmdXb3JsZEJvdW5kcy55TWluKTtcclxuICAgICAgICAvL3ZhciBiZ2xlZnRUb3AgPSBjYW1lcmEud29ybGRUb1NjcmVlbihiZ0xlZnRUb3BXb3JsZFBvcyk7XHJcbiAgICAgICAgLy92YXIgc2NyZWVuUG9zID0gbmV3IEZpcmUuVmVjMihiZ2xlZnRUb3AueCwgYmdsZWZ0VG9wLnkpO1xyXG4gICAgICAgIC8vdmFyIHdvcmxkUG9zID0gY2FtZXJhLnNjcmVlblRvV29ybGQoc2NyZWVuUG9zKTtcclxuICAgICAgICAvL3RoaXMuZW50aXR5LnRyYW5zZm9ybS53b3JsZFBvc2l0aW9uID0gd29ybGRQb3M7XHJcbiAgICAgICAgLy8g5Yy56YWNVUnliIbovqjnjodcclxuICAgICAgICB2YXIgY2FtZXJhID0gRmlyZS5DYW1lcmEubWFpbjtcclxuICAgICAgICB2YXIgc2NyZWVuU2l6ZSA9IEZpcmUuU2NyZWVuLnNpemUubXVsKGNhbWVyYS5zaXplIC8gRmlyZS5TY3JlZW4uaGVpZ2h0KTtcclxuICAgICAgICB2YXIgbmV3UG9zID0gRmlyZS52Mih0aGlzLm1hcmdpbi54LCAtc2NyZWVuU2l6ZS55IC8gMiArIHRoaXMubWFyZ2luLnkpO1xyXG4gICAgICAgIHRoaXMuZW50aXR5LnRyYW5zZm9ybS5wb3NpdGlvbiA9IG5ld1BvcztcclxuICAgIH1cclxufSk7XHJcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnZTkyNjVEcFNKSkNXTHVWakcvMzBaTk8nLCAnU1NlY29uZGFyeU1lbnUnKTtcbi8vIHNjcmlwdFxcc2luZ2xlXFxTU2Vjb25kYXJ5TWVudS5qc1xuXG4vLyDkv53lrZjkuoznuqfoj5zljZXmlbDmja5cclxudmFyIFNTZWNvbmRhcnlNZW51ID0gRmlyZS5DbGFzcyh7XHJcbiAgICAvLyDnu6fmib9cclxuICAgIGV4dGVuZHM6IEZpcmUuQ29tcG9uZW50LFxyXG4gICAgLy8g5p6E6YCg5Ye95pWwXHJcbiAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuYnRuX21lbnUgPSBudWxsO1xyXG4gICAgICAgIHRoaXMudGV4dENvbnRlbnQgPSBudWxsO1xyXG4gICAgfSxcclxuICAgIC8vIOWxnuaAp1xyXG4gICAgcHJvcGVydGllczoge1xyXG4gICAgICAgIC8vIOm7mOiupOWbvueJh1xyXG4gICAgICAgIGRlZmF1bHRTcHJpdGU6IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5TcHJpdGVcclxuICAgICAgICB9LFxyXG4gICAgICAgIHRpZDogMCxcclxuICAgICAgICB0bmFtZTogJ+i9veWFpeS4rS4uJyxcclxuICAgICAgICBpc2RyYWc6IGZhbHNlLFxyXG4gICAgICAgIHVybDogJydcclxuICAgIH0sXHJcbiAgICAvLyDorr7nva7lm77niYdcclxuICAgIHNldFNwcml0ZTogZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgdGhpcy5idG5fbWVudS5zZXRTcHJpdGUodmFsdWUpO1xyXG4gICAgfSxcclxuICAgIC8vIOiuvue9ruaWh+Wtl1xyXG4gICAgc2V0VGV4dDogZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgdGhpcy5idG5fbWVudS5zZXRUZXh0KHZhbHVlKTtcclxuICAgIH0sXHJcbiAgICAvLyDph43nva7oj5zljZVcclxuICAgIHJlc2V0TWVudTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMudGlkID0gMDtcclxuICAgICAgICB0aGlzLmlzZHJhZyA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMudG5hbWUgPSAn6L295YWl5LitLi4nO1xyXG4gICAgICAgIHRoaXMudXJsID0gJyc7XHJcbiAgICAgICAgdGhpcy5zZXRTcHJpdGUodGhpcy5kZWZhdWx0U3ByaXRlKTtcclxuICAgICAgICB0aGlzLnNldFRleHQodGhpcy50bmFtZSk7XHJcbiAgICB9LFxyXG4gICAgLy8g5Yid5aeL5YyWXHJcbiAgICBpbml0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKCEgdGhpcy5idG5fbWVudSkge1xyXG4gICAgICAgICAgICB2YXIgZW50ID0gdGhpcy5lbnRpdHkuZmluZCgnYnRuX21lbnUnKTtcclxuICAgICAgICAgICAgdGhpcy5idG5fbWVudSA9IGVudC5nZXRDb21wb25lbnQoRmlyZS5VSUJ1dHRvbik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMucmVzZXRNZW51KCk7XHJcbiAgICB9LFxyXG4gICAgLy8g5Yi35pawXHJcbiAgICByZWZyZXNoOiBmdW5jdGlvbiAoZGF0YSwgZXZlbnQpIHtcclxuICAgICAgICB0aGlzLnRpZCA9IGRhdGEudGlkO1xyXG4gICAgICAgIHRoaXMuaGFzRHJhZyA9IGRhdGEuaXNkcmFnIDwgMjtcclxuICAgICAgICB0aGlzLnRuYW1lID0gZGF0YS50bmFtZTtcclxuICAgICAgICB0aGlzLnVybCA9IGRhdGEudXJsO1xyXG4gICAgICAgIHRoaXMuc2V0VGV4dChkYXRhLnRuYW1lKTtcclxuICAgICAgICBpZiAoZGF0YS5zbWFsbFNwcml0ZSkge1xyXG4gICAgICAgICAgICB0aGlzLnNldFNwcml0ZShkYXRhLnNtYWxsU3ByaXRlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5idG5fbWVudS5vbkNsaWNrID0gZXZlbnQ7XHJcbiAgICB9XHJcbn0pO1xyXG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJ2U3ZDg3WlA1TzlGbXA0ZTRnaGhFSURIJywgJ1NUaHJlZU1lbnVNZ3InKTtcbi8vIHNjcmlwdFxcc2luZ2xlXFxTVGhyZWVNZW51TWdyLmpzXG5cbi8vIOS4iee6p+iPnOWNleeuoeeQhuexu1xyXG52YXIgU1RocmVlTWVudU1nciA9IEZpcmUuQ2xhc3Moe1xyXG4gICAgLy8g57un5om/XHJcbiAgICBleHRlbmRzOiBGaXJlLkNvbXBvbmVudCxcclxuICAgIC8vIOaehOmAoOWHveaVsFxyXG4gICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAvLyDlrrblhbfkuIDmrKHmmL7npLrlpJrlsJHmlbDph49cclxuICAgICAgICB0aGlzLl9tZW51VG90YWwgPSA2O1xyXG4gICAgICAgIC8vIOa4uOaIj+aVsOaNrlxyXG4gICAgICAgIHRoaXMuc2RhdGFCYXNlID0gbnVsbDtcclxuICAgICAgICAvLyDoj5zljZXliJfooahcclxuICAgICAgICB0aGlzLl9tZW51TGlzdCA9IFtdO1xyXG4gICAgICAgIC8vIOaYr+WQpuWPr+S7peaLluWKqO+8iOS+i+WmguWjgee6uOS4juWcsOmdouaXoOazleaLluWKqO+8iVxyXG4gICAgICAgIHRoaXMuX2hhc0RyYWcgPSBmYWxzZTtcclxuICAgICAgICAvLyDlvZPliY3pgInmi6nnianlk4FJRFxyXG4gICAgICAgIHRoaXMuX2N1cklkID0gMDtcclxuICAgICAgICAvLyDlvZPliY3mnIDlpKfmlbDph49cclxuICAgICAgICB0aGlzLl9jdXJUb3RhbCA9IDA7XHJcbiAgICAgICAgLy8g5b2T5YmN6aG1562+XHJcbiAgICAgICAgdGhpcy5fY3VyUGFnZSA9IDE7XHJcbiAgICAgICAgLy8g5pyA5aSn6aG1562+XHJcbiAgICAgICAgdGhpcy5fbWF4UGFnZSA9IDE7XHJcbiAgICAgICAgLy8g5Zu+54mH6L295YWl5Zue6LCDXHJcbiAgICAgICAgdGhpcy5iaW5kQWZ0ZXJMb2FkSW1hZ2VDQiA9IG51bGw7XHJcbiAgICAgICAgLy8g5aSn5Zu+6L295YWl5LitXHJcbiAgICAgICAgdGhpcy5faGFzTG9hZEJpZ0ltYWdlaW5nID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5fbGFzdENyZWF0ZVRhcmdldCA9IG51bGw7XHJcbiAgICB9LFxyXG4gICAgLy8g5bGe5oCnXHJcbiAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgbWFyZ2luOiBuZXcgRmlyZS5WZWMyKDAsIDI0MCksXHJcbiAgICAgICAgLy8g5LiJ57qn6I+c5Y2V55qE5qC56IqC54K5XHJcbiAgICAgICAgcm9vdE5vZGU6IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5FbnRpdHlcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8g5Yib5bu65oiW6ICF5piv5YiH5o2i5p2Q6LSoXHJcbiAgICBjcmVhdGVPckNoYW5nZUZ1cm5pdHVyZTogZnVuY3Rpb24gKHRhcmdldCkge1xyXG4gICAgICAgIC8vIOS4gOW8gOWni+Wkp+WbvuacquWKoOi9veeahOaXtuWAme+8jOemgeatoueUqOaIt+WkmuasoeeCueWHu+ebuOWQjOWutuWFt1xyXG4gICAgICAgIGlmICh0aGlzLl9oYXNMb2FkQmlnSW1hZ2VpbmcgJiYgdGhpcy5fbGFzdENyZWF0ZVRhcmdldCA9PT0gdGFyZ2V0KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIHZhciBtZW51ID0gdGFyZ2V0LmdldENvbXBvbmVudCgnU1RocmVlTWVudScpO1xyXG4gICAgICAgIHZhciBlbnQsIGVudENvbXAsIGJpZ1Nwcml0ZTtcclxuICAgICAgICAvLyDlopnlo4HkuI7lnLDmnb9cclxuICAgICAgICBpZiAoISBzZWxmLl9oYXNEcmFnKSB7XHJcbiAgICAgICAgICAgIGlmIChzZWxmLl9jdXJJZCA9PT0gMSkge1xyXG4gICAgICAgICAgICAgICAgZW50ID0gc2VsZi5zZGF0YUJhc2UuYmdSZW5kZXIuZW50aXR5O1xyXG4gICAgICAgICAgICAgICAgZW50Q29tcCA9IGVudC5nZXRDb21wb25lbnQoJ1NGdXJuaXR1cmUnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIGlmIChzZWxmLl9jdXJJZCA9PT0gMikge1xyXG4gICAgICAgICAgICAgICAgZW50ID0gc2VsZi5zZGF0YUJhc2UuZ3JvdW5kUmVuZGVyLmVudGl0eTtcclxuICAgICAgICAgICAgICAgIGVudENvbXAgPSBlbnQuZ2V0Q29tcG9uZW50KCdTRnVybml0dXJlJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZW50Q29tcC50TmFtZSA9IG1lbnUudE5hbWU7XHJcbiAgICAgICAgICAgIGVudENvbXAuc3VpdF9pZCA9IG1lbnUuc3VpdF9pZDtcclxuICAgICAgICAgICAgZW50Q29tcC5oYXNEcmFnID0gc2VsZi5faGFzRHJhZztcclxuICAgICAgICAgICAgZW50Q29tcC5pbWFnZVVybCA9IG1lbnUuYmlnSW1hZ2VVcmw7XHJcbiAgICAgICAgICAgIGJpZ1Nwcml0ZSA9IHNlbGYuc2RhdGFCYXNlLnRocmVlTWVudUJpZ0ltYWdlU2hlZXRzW2VudENvbXAuc3VpdF9pZF07XHJcbiAgICAgICAgICAgIGlmIChiaWdTcHJpdGUpIHtcclxuICAgICAgICAgICAgICAgIGVudENvbXAuc2V0U3ByaXRlKGJpZ1Nwcml0ZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLl9oYXNMb2FkQmlnSW1hZ2VpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgRmlyZS5JbWFnZUxvYWRlcihlbnRDb21wLmltYWdlVXJsLCBmdW5jdGlvbiAoZXJyb3IsIGltYWdlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5faGFzTG9hZEJpZ0ltYWdlaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBiaWdTcHJpdGUgPSBuZXcgRmlyZS5TcHJpdGUoaW1hZ2UpO1xyXG4gICAgICAgICAgICAgICAgICAgIGVudENvbXAuc2V0U3ByaXRlKGJpZ1Nwcml0ZSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIOWIm+W7uuWutuWFt+WIsOWcuuaZr+S4rVxyXG4gICAgICAgIGVudCA9IEZpcmUuaW5zdGFudGlhdGUoc2VsZi5zZGF0YUJhc2UudGVtcEZ1cm5pdHVyZSk7XHJcbiAgICAgICAgZW50LnBhcmVudCA9IHNlbGYuc2RhdGFCYXNlLnJvb207XHJcbiAgICAgICAgdmFyIHBvcyA9IHRhcmdldC50cmFuc2Zvcm0ud29ybGRQb3NpdGlvbjtcclxuICAgICAgICB2YXIgb2Zmc2V0ID0gTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogMTAwKTtcclxuICAgICAgICBwb3MueCArPSBvZmZzZXQ7XHJcbiAgICAgICAgcG9zLnkgKz0gNDAwO1xyXG4gICAgICAgIGVudC50cmFuc2Zvcm0ucG9zaXRpb24gPSBuZXcgRmlyZS5WZWMyKHBvcy54LCBwb3MueSk7XHJcbiAgICAgICAgZW50LnRyYW5zZm9ybS5zY2FsZSA9IG5ldyBGaXJlLlZlYzIoMS44LCAxLjgpO1xyXG4gICAgICAgIGVudC5uYW1lID0gbWVudS5zdWl0X2lkO1xyXG4gICAgICAgIGVudENvbXAgPSBlbnQuZ2V0Q29tcG9uZW50KCdTRnVybml0dXJlJyk7XHJcbiAgICAgICAgZW50Q29tcC5zdWl0X2lkID0gbWVudS5zdWl0X2lkO1xyXG4gICAgICAgIGVudENvbXAucHJvcFR5cGUgPSB0aGlzLl9jdXJJZDtcclxuICAgICAgICBlbnRDb21wLnROYW1lID0gbWVudS50TmFtZTtcclxuICAgICAgICBlbnRDb21wLmhhc0RyYWcgPSB0aGlzLl9oYXNEcmFnO1xyXG4gICAgICAgIGVudENvbXAuaW1hZ2VVcmwgPSBtZW51LmJpZ0ltYWdlVXJsO1xyXG4gICAgICAgIGJpZ1Nwcml0ZSA9IHNlbGYuc2RhdGFCYXNlLnRocmVlTWVudUJpZ0ltYWdlU2hlZXRzW2VudENvbXAuc3VpdF9pZF07XHJcbiAgICAgICAgaWYgKGJpZ1Nwcml0ZSkge1xyXG4gICAgICAgICAgICBlbnRDb21wLnNldFNwcml0ZShiaWdTcHJpdGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgc2VsZi5faGFzTG9hZEJpZ0ltYWdlaW5nID0gdHJ1ZTtcclxuICAgICAgICAgICAgRmlyZS5JbWFnZUxvYWRlcihlbnRDb21wLmltYWdlVXJsLCBmdW5jdGlvbiAoZXJyb3IsIGltYWdlKSB7XHJcbiAgICAgICAgICAgICAgICBzZWxmLl9oYXNMb2FkQmlnSW1hZ2VpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGlmIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBiaWdTcHJpdGUgPSBuZXcgRmlyZS5TcHJpdGUoaW1hZ2UpO1xyXG4gICAgICAgICAgICAgICAgZW50Q29tcC5zZXRTcHJpdGUoYmlnU3ByaXRlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIOWIm+W7uuWQhOS4quexu+Wei+WutuWFt1xyXG4gICAgX29uQ3JlYXRlRnVybml0dXJlRXZlbnQ6IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCfliJvlu7onICsgZXZlbnQudGFyZ2V0LnBhcmVudC5uYW1lKTtcclxuICAgICAgICB0aGlzLmNyZWF0ZU9yQ2hhbmdlRnVybml0dXJlKGV2ZW50LnRhcmdldC5wYXJlbnQpO1xyXG4gICAgfSxcclxuICAgIC8vIOmHjee9ruiPnOWNleWIl+ihqFxyXG4gICAgX3Jlc2V0TWVudTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fbWVudUxpc3QubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICAgICAgdmFyIG1lbnUgPSB0aGlzLl9tZW51TGlzdFtpXTtcclxuICAgICAgICAgICAgbWVudS5uYW1lID0gaS50b1N0cmluZygpO1xyXG4gICAgICAgICAgICBtZW51LnJlc2V0TWVudSgpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvLyDliJvlu7roj5zljZXmjInpkq7lubbkuJTnu5Hlrprkuovku7Yg5oiW6ICF5Yi35pawXHJcbiAgICBfcmVmcmVzaFNpbmdsZUl0ZW1zOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIGkgPSAwLCBtZW51ID0gbnVsbDtcclxuICAgICAgICAvLyDliJvlu7rlr7nosaHlrrnlmahcclxuICAgICAgICBpZiAodGhpcy5fbWVudUxpc3QubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgIHZhciB0ZW1wRnVybml0dXJlID0gdGhpcy5zZGF0YUJhc2UudGVtcFRocmVlTWVudTtcclxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IHRoaXMuX21lbnVUb3RhbDsgKytpKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZW50ID0gRmlyZS5pbnN0YW50aWF0ZSh0ZW1wRnVybml0dXJlKTtcclxuICAgICAgICAgICAgICAgIGVudC5uYW1lID0gaS50b1N0cmluZygpO1xyXG4gICAgICAgICAgICAgICAgZW50LnBhcmVudCA9IHRoaXMucm9vdE5vZGU7XHJcbiAgICAgICAgICAgICAgICBlbnQudHJhbnNmb3JtLnBvc2l0aW9uID0gbmV3IEZpcmUuVmVjMigtNDIwICsgKGkgKiAxNzApLCA0MCk7XHJcbiAgICAgICAgICAgICAgICBtZW51ID0gZW50LmdldENvbXBvbmVudCgnU1RocmVlTWVudScpO1xyXG4gICAgICAgICAgICAgICAgbWVudS5pbml0KCk7XHJcbiAgICAgICAgICAgICAgICAvLyDlrZjlgqjlr7nosaFcclxuICAgICAgICAgICAgICAgIHRoaXMuX21lbnVMaXN0LnB1c2gobWVudSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIC8vIOmHjee9rlxyXG4gICAgICAgICAgICB0aGlzLl9yZXNldE1lbnUoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8g5aaC5p6c5oC75pWw6YeP5pyJ5pu05paw5bCx6YeN5paw6K6h566X5pyA5aSn6aG15pWwXHJcbiAgICAgICAgdmFyIHRvdGFsID0gdGhpcy5zZGF0YUJhc2UudGhyZWVNZW51RGF0YVRvdGFsU2hlZXRzW3RoaXMuX2N1cklkXTtcclxuICAgICAgICBpZiAodGhpcy5fY3VyVG90YWwgIT09IHRvdGFsKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2N1clRvdGFsID0gdG90YWw7XHJcbiAgICAgICAgICAgIHRoaXMuX21heFBhZ2UgPSBNYXRoLmNlaWwodGhpcy5fY3VyVG90YWwgLyB0aGlzLl9tZW51VG90YWwpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyDotYvlgLzmlbDmja5cclxuICAgICAgICB2YXIgaW5kZXggPSAwO1xyXG4gICAgICAgIHZhciBzdGFydE51bSA9ICh0aGlzLl9jdXJQYWdlIC0gMSkgKiB0aGlzLl9tZW51VG90YWw7XHJcbiAgICAgICAgdmFyIGVuZE51bSA9IHN0YXJ0TnVtICsgdGhpcy5fbWVudVRvdGFsO1xyXG4gICAgICAgIGlmIChlbmROdW0gPiB0aGlzLl9jdXJUb3RhbCkge1xyXG4gICAgICAgICAgICBlbmROdW0gPSB0aGlzLl9jdXJUb3RhbDtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGJpbmRFdmVudCA9IHRoaXMuX29uQ3JlYXRlRnVybml0dXJlRXZlbnQuYmluZCh0aGlzKTtcclxuICAgICAgICB2YXIgZGF0YVNoZWV0cyA9IHRoaXMuc2RhdGFCYXNlLnRocmVlTWVudURhdGFTaGVldHNbdGhpcy5fY3VySWRdO1xyXG4gICAgICAgIGZvcihpID0gc3RhcnROdW07IGkgPCBlbmROdW07ICsraSkge1xyXG4gICAgICAgICAgICBtZW51ID0gdGhpcy5fbWVudUxpc3RbaW5kZXhdO1xyXG4gICAgICAgICAgICBtZW51LmVudGl0eS5hY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgICAgICBpbmRleCsrO1xyXG4gICAgICAgICAgICB2YXIgbWVudURhdGEgPSBkYXRhU2hlZXRzW2ldO1xyXG4gICAgICAgICAgICBpZiAoIW1lbnVEYXRhKSB7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBtZW51LnJlZnJlc2gobWVudURhdGEsIGJpbmRFdmVudCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIOWIt+aWsOaMiemSrueKtuaAgVxyXG4gICAgICAgIHRoaXMuX3JlZnJlc2hCdG5TdGF0ZSgpO1xyXG4gICAgICAgIC8vIOWIpOaWreaYr+WQpumcgOimgemihOWKoOi9veS4i+S4gOmhtVxyXG4gICAgICAgIHZhciBsZW4gPSBkYXRhU2hlZXRzLmxlbmd0aDtcclxuICAgICAgICBpZihsZW4gPT09IHRoaXMuX2N1clRvdGFsKXtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyDpooTliqDovb3kuIvkuIDpobVcclxuICAgICAgICB2YXIgbmV4dFBhZ2UgPSB0aGlzLl9jdXJQYWdlICsgMTtcclxuICAgICAgICB0aGlzLnNkYXRhQmFzZS5wcmVsb2FkVGhyZWVNZW51RGF0YSh0aGlzLl9jdXJJZCwgbmV4dFBhZ2UsIHRoaXMuX21lbnVUb3RhbCwgdGhpcy5iaW5kQWZ0ZXJMb2FkSW1hZ2VDQik7XHJcbiAgICB9LFxyXG4gICAgLy8g5r+A5rS76I+c5Y2V5pe26Kem5Y+R55qE5LqL5Lu2XHJcbiAgICAvLyBpZDog54mp5ZOB55qESURcclxuICAgIC8vIGhhc0RyYWcg5piv5ZCm5ouW552AXHJcbiAgICBvcGVuTWVudTogZnVuY3Rpb24gKGlkLCBoYXNEcmFnKSB7XHJcbiAgICAgICAgdGhpcy5fY3VySWQgPSBpZDtcclxuICAgICAgICB0aGlzLl9jdXJQYWdlID0gMTtcclxuICAgICAgICB0aGlzLl9oYXNEcmFnID0gaGFzRHJhZztcclxuICAgICAgICB0aGlzLl9yZWZyZXNoU2luZ2xlSXRlbXMoKTtcclxuICAgICAgICAvLyDmmL7npLrlvZPliY3nqpflj6NcclxuICAgICAgICB0aGlzLmVudGl0eS5hY3RpdmUgPSB0cnVlO1xyXG4gICAgfSxcclxuICAgIGNsb3NlTWVudTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuX2N1cklkID0gMDtcclxuICAgICAgICB0aGlzLl9jdXJQYWdlID0gMTtcclxuICAgICAgICB0aGlzLmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcclxuICAgIH0sXHJcbiAgICAvLyDkuIrkuIDpobVcclxuICAgIF9vblByZXZpb3VzRXZlbnQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLl9jdXJQYWdlIC09IDE7XHJcbiAgICAgICAgaWYgKHRoaXMuX2N1clBhZ2UgPCAxKXtcclxuICAgICAgICAgICAgdGhpcy5fY3VyUGFnZSA9IDE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3JlZnJlc2hTaW5nbGVJdGVtcygpO1xyXG4gICAgfSxcclxuICAgIC8vIOS4i+S4gOmhtVxyXG4gICAgX29uTmV4dEV2ZW50OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5fY3VyUGFnZSArPSAxO1xyXG4gICAgICAgIGlmICh0aGlzLl9jdXJQYWdlID4gdGhpcy5fbWF4UGFnZSl7XHJcbiAgICAgICAgICAgIHRoaXMuX2N1clBhZ2UgPSB0aGlzLl9tYXhQYWdlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9yZWZyZXNoU2luZ2xlSXRlbXMoKTtcclxuICAgIH0sXHJcbiAgICAvLyDlhbPpl63lvZPliY3oj5zljZVcclxuICAgIF9vbkNsb3NlTWVudTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuY2xvc2VNZW51KCk7XHJcbiAgICB9LFxyXG4gICAgLy8g5Yi35paw5oyJ6ZKu54q25oCBXHJcbiAgICBfcmVmcmVzaEJ0blN0YXRlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5idG5fUHJldmlvdXMuYWN0aXZlID0gdGhpcy5fY3VyUGFnZSA+IDE7XHJcbiAgICAgICAgdGhpcy5idG5fTmV4dC5hY3RpdmUgPSB0aGlzLl9jdXJQYWdlIDwgdGhpcy5fbWF4UGFnZTtcclxuICAgIH0sXHJcbiAgICAvLyDlm77niYfovb3lhaXlrozmr5Xku6XlkI7nmoTlm57osINcclxuICAgIF9BZnRlckxvYWRJbWFnZUNhbGxCYWNrOiBmdW5jdGlvbiAoaWQsIGluZGV4LCBwYWdlLCBtZW51RGF0YSkge1xyXG4gICAgICAgIGlmICh0aGlzLl9jdXJJZCA9PT0gaWQgJiYgdGhpcy5fY3VyUGFnZSA9PT0gcGFnZSkge1xyXG4gICAgICAgICAgICB2YXIgbWVudSA9IHRoaXMuX21lbnVMaXN0W2luZGV4XTtcclxuICAgICAgICAgICAgaWYgKG1lbnUpIHtcclxuICAgICAgICAgICAgICAgIG1lbnUucmVmcmVzaChtZW51RGF0YSwgdGhpcy5fb25DcmVhdGVGdXJuaXR1cmVFdmVudC5iaW5kKHRoaXMpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvLyDlvIDlp4tcclxuICAgIHN0YXJ0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgLy8g5bi455So55qE5Y+Y6YePL+aVsOaNrlxyXG4gICAgICAgIHZhciBlbnQgPSBGaXJlLkVudGl0eS5maW5kKCcvU0RhdGFCYXNlJyk7XHJcbiAgICAgICAgdGhpcy5zZGF0YUJhc2UgPSBlbnQuZ2V0Q29tcG9uZW50KCdTRGF0YUJhc2UnKTtcclxuICAgICAgICAvLyDojrflj5blhbPpl63mjInpkq7lubbnu5Hlrprkuovku7ZcclxuICAgICAgICBlbnQgPSB0aGlzLmVudGl0eS5maW5kKCdidG5fQ2xvc2UnKTtcclxuICAgICAgICB2YXIgYnRuQ2xvc2UgPSBlbnQuZ2V0Q29tcG9uZW50KEZpcmUuVUlCdXR0b24pO1xyXG4gICAgICAgIGJ0bkNsb3NlLm9uQ2xpY2sgPSB0aGlzLl9vbkNsb3NlTWVudS5iaW5kKHRoaXMpO1xyXG4gICAgICAgIC8vIOS4iuS4gOmhtVxyXG4gICAgICAgIHRoaXMuYnRuX1ByZXZpb3VzID0gdGhpcy5lbnRpdHkuZmluZCgnYnRuX1ByZXZpb3VzJyk7XHJcbiAgICAgICAgdmFyIGJ0bl9QcmV2aW91cyA9IHRoaXMuYnRuX1ByZXZpb3VzLmdldENvbXBvbmVudChGaXJlLlVJQnV0dG9uKTtcclxuICAgICAgICBidG5fUHJldmlvdXMub25DbGljayA9IHRoaXMuX29uUHJldmlvdXNFdmVudC5iaW5kKHRoaXMpO1xyXG4gICAgICAgIC8vIOS4i+S4gOmhtVxyXG4gICAgICAgIHRoaXMuYnRuX05leHQgPSB0aGlzLmVudGl0eS5maW5kKCdidG5fTmV4dCcpO1xyXG4gICAgICAgIHZhciBidG5fTmV4dCA9IHRoaXMuYnRuX05leHQuZ2V0Q29tcG9uZW50KEZpcmUuVUlCdXR0b24pO1xyXG4gICAgICAgIGJ0bl9OZXh0Lm9uQ2xpY2sgPSB0aGlzLl9vbk5leHRFdmVudC5iaW5kKHRoaXMpO1xyXG4gICAgICAgIC8vXHJcbiAgICAgICAgdGhpcy5idG5fUHJldmlvdXMuYWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5idG5fTmV4dC5hY3RpdmUgPSBmYWxzZTtcclxuXHJcbiAgICAgICAgdGhpcy5iaW5kQWZ0ZXJMb2FkSW1hZ2VDQiA9IHRoaXMuX0FmdGVyTG9hZEltYWdlQ2FsbEJhY2suYmluZCh0aGlzKTtcclxuXHJcbiAgICAgICAgLy8g6aKE5Yqg6L29XHJcbiAgICAgICAgdGhpcy5zZGF0YUJhc2UucHJlbG9hZFRocmVlTWVudURhdGEoMSwgMSwgdGhpcy5fbWVudVRvdGFsLCB0aGlzLmJpbmRBZnRlckxvYWRJbWFnZUNCKTtcclxuICAgICAgICB0aGlzLnNkYXRhQmFzZS5wcmVsb2FkVGhyZWVNZW51RGF0YSgyLCAxLCB0aGlzLl9tZW51VG90YWwsIHRoaXMuYmluZEFmdGVyTG9hZEltYWdlQ0IpO1xyXG4gICAgICAgIHRoaXMuc2RhdGFCYXNlLnByZWxvYWRUaHJlZU1lbnVEYXRhKDMsIDEsIHRoaXMuX21lbnVUb3RhbCwgdGhpcy5iaW5kQWZ0ZXJMb2FkSW1hZ2VDQik7XHJcbiAgICAgICAgdGhpcy5zZGF0YUJhc2UucHJlbG9hZFRocmVlTWVudURhdGEoNCwgMSwgdGhpcy5fbWVudVRvdGFsLCB0aGlzLmJpbmRBZnRlckxvYWRJbWFnZUNCKTtcclxuICAgICAgICB0aGlzLnNkYXRhQmFzZS5wcmVsb2FkVGhyZWVNZW51RGF0YSg1LCAxLCB0aGlzLl9tZW51VG90YWwsIHRoaXMuYmluZEFmdGVyTG9hZEltYWdlQ0IpO1xyXG4gICAgICAgIHRoaXMuc2RhdGFCYXNlLnByZWxvYWRUaHJlZU1lbnVEYXRhKDYsIDEsIHRoaXMuX21lbnVUb3RhbCwgdGhpcy5iaW5kQWZ0ZXJMb2FkSW1hZ2VDQik7XHJcbiAgICAgICAgdGhpcy5zZGF0YUJhc2UucHJlbG9hZFRocmVlTWVudURhdGEoNywgMSwgdGhpcy5fbWVudVRvdGFsLCB0aGlzLmJpbmRBZnRlckxvYWRJbWFnZUNCKTtcclxuICAgICAgICB0aGlzLnNkYXRhQmFzZS5wcmVsb2FkVGhyZWVNZW51RGF0YSg4LCAxLCB0aGlzLl9tZW51VG90YWwsIHRoaXMuYmluZEFmdGVyTG9hZEltYWdlQ0IpO1xyXG4gICAgfSxcclxuXHJcbiAgICB1cGRhdGU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAvLyDljLnphY1VSeWIhui+qOeOh1xyXG4gICAgICAgIC8vdmFyIGNhbWVyYSA9IEZpcmUuQ2FtZXJhLm1haW47XHJcbiAgICAgICAgLy92YXIgYmdXb3JsZEJvdW5kcyA9IHRoaXMuc2RhdGFCYXNlLmJnUmVuZGVyLmdldFdvcmxkQm91bmRzKCk7XHJcbiAgICAgICAgLy92YXIgYmdMZWZ0VG9wV29ybGRQb3MgPSBuZXcgRmlyZS5WZWMyKGJnV29ybGRCb3VuZHMueE1pbiwgYmdXb3JsZEJvdW5kcy55TWluKTtcclxuICAgICAgICAvL3ZhciBiZ2xlZnRUb3AgPSBjYW1lcmEud29ybGRUb1NjcmVlbihiZ0xlZnRUb3BXb3JsZFBvcyk7XHJcbiAgICAgICAgLy92YXIgc2NyZWVuUG9zID0gbmV3IEZpcmUuVmVjMihiZ2xlZnRUb3AueCwgYmdsZWZ0VG9wLnkpO1xyXG4gICAgICAgIC8vdmFyIHdvcmxkUG9zID0gY2FtZXJhLnNjcmVlblRvV29ybGQoc2NyZWVuUG9zKTtcclxuICAgICAgICAvL3RoaXMuZW50aXR5LnRyYW5zZm9ybS53b3JsZFBvc2l0aW9uID0gd29ybGRQb3M7XHJcbiAgICAgICAgLy8g5Yy56YWNVUnliIbovqjnjodcclxuICAgICAgICB2YXIgY2FtZXJhID0gRmlyZS5DYW1lcmEubWFpbjtcclxuICAgICAgICB2YXIgc2NyZWVuU2l6ZSA9IEZpcmUuU2NyZWVuLnNpemUubXVsKGNhbWVyYS5zaXplIC8gRmlyZS5TY3JlZW4uaGVpZ2h0KTtcclxuICAgICAgICB2YXIgbmV3UG9zID0gRmlyZS52Mih0aGlzLm1hcmdpbi54LCAtc2NyZWVuU2l6ZS55IC8gMiArIHRoaXMubWFyZ2luLnkpO1xyXG4gICAgICAgIHRoaXMuZW50aXR5LnRyYW5zZm9ybS5wb3NpdGlvbiA9IG5ld1BvcztcclxuICAgIH1cclxufSk7XHJcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnZjI4YTdaSFdxcEdBSXZObmZQYnc3Q2InLCAnU1RocmVlTWVudScpO1xuLy8gc2NyaXB0XFxzaW5nbGVcXFNUaHJlZU1lbnUuanNcblxudmFyIFNUaHJlZU1lbnUgPSBGaXJlLkNsYXNzKHtcclxuICAgIC8vIOe7p+aJv1xyXG4gICAgZXh0ZW5kczogRmlyZS5Db21wb25lbnQsXHJcbiAgICAvLyDmnoTpgKDlh73mlbBcclxuICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgLy8g5LiL6L295qyh5pWwXHJcbiAgICAgICAgdGhpcy5fYnRuTWVudSA9IG51bGw7XHJcbiAgICB9LFxyXG4gICAgLy8g5bGe5oCnXHJcbiAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgdE5hbWU6ICcnLFxyXG4gICAgICAgIC8vIElEXHJcbiAgICAgICAgc3VpdF9pZDogMCxcclxuICAgICAgICAvLyDlpKflm75VcmxcclxuICAgICAgICBiaWdJbWFnZVVybDogJycsXHJcbiAgICAgICAgLy8g6L295YWl5pe255qE5Zu+54mHXHJcbiAgICAgICAgZGVmYXVsdFNwcml0ZToge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlNwcml0ZVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvLyDph43nva7lrrblhbdcclxuICAgIHJlc2V0TWVudTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuX2J0bk1lbnUuc2V0VGV4dCgn6L295YWl5LitJyk7XHJcbiAgICAgICAgdGhpcy5fYnRuTWVudS5zZXRTcHJpdGUodGhpcy5kZWZhdWx0U3ByaXRlKTtcclxuICAgICAgICB0aGlzLl9idG5NZW51Lm9uQ2xpY2sgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuZW50aXR5LmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgfSxcclxuICAgIC8vIOiuvue9ruaWh+Wtl1xyXG4gICAgc2V0VGV4dDogZnVuY3Rpb24gKHRleHQpIHtcclxuICAgICAgICB0aGlzLl9idG5NZW51LnNldFRleHQodGV4dCk7XHJcbiAgICB9LFxyXG4gICAgLy8g6K6+572u5Zu+54mHXHJcbiAgICBzZXRTcHJpdGU6IGZ1bmN0aW9uIChzbWFsbFNwcml0ZSwgZXZlbnQpIHtcclxuICAgICAgICB0aGlzLl9idG5NZW51LnNldFNwcml0ZShzbWFsbFNwcml0ZSk7XHJcbiAgICAgICAgaWYgKGV2ZW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2J0bk1lbnUub25DbGljayA9IGV2ZW50O1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvLyDliJ3lp4vljJZcclxuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgZW50ID0gbnVsbDtcclxuICAgICAgICBpZiAoISB0aGlzLl9idG5NZW51KSB7XHJcbiAgICAgICAgICAgIGVudCA9IHRoaXMuZW50aXR5LmZpbmQoJ2J0bl9tZW51Jyk7XHJcbiAgICAgICAgICAgIHRoaXMuX2J0bk1lbnUgPSBlbnQuZ2V0Q29tcG9uZW50KEZpcmUuVUlCdXR0b24pO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLnJlc2V0TWVudSgpO1xyXG4gICAgfSxcclxuICAgIC8vIOWIt+aWsOW3suS4i+i9vei/h+WQjueahOaVsOaNrlxyXG4gICAgcmVmcmVzaDogZnVuY3Rpb24gKGRhdGEsIGJpbmRFdmVudCkge1xyXG4gICAgICAgIHRoaXMuZW50aXR5Lm5hbWUgPSBkYXRhLnN1aXRfaWQ7XHJcbiAgICAgICAgdGhpcy5zdWl0X2lkID0gZGF0YS5zdWl0X2lkO1xyXG4gICAgICAgIHRoaXMudE5hbWUgPSBkYXRhLm5hbWU7XHJcbiAgICAgICAgdGhpcy5iaWdJbWFnZVVybCA9IGRhdGEuYmlnSW1hZ2VVcmw7XHJcbiAgICAgICAgdGhpcy5zZXRUZXh0KGRhdGEubmFtZSk7XHJcbiAgICAgICAgaWYgKGRhdGEuc21hbGxTcHJpdGUpIHtcclxuICAgICAgICAgICAgdGhpcy5zZXRTcHJpdGUoZGF0YS5zbWFsbFNwcml0ZSwgYmluZEV2ZW50KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5lbnRpdHkuYWN0aXZlID0gdHJ1ZTtcclxuICAgIH1cclxufSk7XHJcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnZTU5Mjg3a3E0QktPSUJKYmErVk9YNCsnLCAnU1RpcHNXaW5kb3cnKTtcbi8vIHNjcmlwdFxcc2luZ2xlXFxTVGlwc1dpbmRvdy5qc1xuXG52YXIgVGlwc1dpbmRvdyA9IEZpcmUuQ2xhc3Moe1xyXG4gICAgLy8g77+9zLPvv71cclxuICAgIGV4dGVuZHM6IEZpcmUuQ29tcG9uZW50LFxyXG4gICAgLy8g77+977+977+97Lqv77+977+9XHJcbiAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMub25DYWxsRXZlbnQgPSBudWxsO1xyXG4gICAgfSxcclxuICAgIC8vIO+/ve+/ve+/ve+/vVxyXG4gICAgcHJvcGVydGllczoge1xyXG4gICAgICAgIGNvbnRlbnQ6e1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiBGaXJlLkJpdG1hcFRleHRcclxuICAgICAgICB9LFxyXG4gICAgICAgIGJ0bl9Db25maXJtOntcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5VSUJ1dHRvblxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYnRuX0Nsb3NlOntcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5VSUJ1dHRvblxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvLyDvv73yv6q077+977+977+9XHJcbiAgICBvcGVuV2luZG93OiBmdW5jdGlvbiAodGV4dCwgY2FsbGJhY2spIHtcclxuICAgICAgICB0aGlzLmVudGl0eS5hY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgIGlmICh0ZXh0KSB7XHJcbiAgICAgICAgICAgIHRoaXMuc2V0Q29udGVudCh0ZXh0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5vbkNhbGxFdmVudCA9IG51bGw7XHJcbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIHRoaXMub25DYWxsRXZlbnQgPSBjYWxsYmFjaztcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8g77+92LHVtO+/ve+/ve+/vVxyXG4gICAgY2xvc2VXaW5kb3c6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcclxuICAgIH0sXHJcbiAgICAvLyDvv73vv73vv73Dte+/ve+/vcO677+977+977+9XHJcbiAgICBzZXRDb250ZW50OiBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICB0aGlzLmNvbnRlbnQudGV4dCA9IGV2ZW50O1xyXG4gICAgfSxcclxuICAgIC8vIO+/vdix1bTvv73vv73vv71cclxuICAgIF9vbkNsb3NlV2luZG93OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5jbG9zZVdpbmRvdygpO1xyXG4gICAgfSxcclxuICAgIC8vIMi377+977+977+9wrzvv71cclxuICAgIF9vbkNvbmZpcm1FdmVudDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuZW50aXR5LmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgICAgIGlmICh0aGlzLm9uQ2FsbEV2ZW50KSB7XHJcbiAgICAgICAgICAgIHRoaXMub25DYWxsRXZlbnQoKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy9cclxuICAgIG9uTG9hZDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuYnRuX0NvbmZpcm0ub25DbGljayA9IHRoaXMuX29uQ29uZmlybUV2ZW50LmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5idG5fQ2xvc2Uub25DbGljayA9IHRoaXMuX29uQ2xvc2VXaW5kb3cuYmluZCh0aGlzKTtcclxuICAgIH1cclxufSk7XHJcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnODc0OGNTSHp5TkFHWkZJR3Vqc2dUamUnLCAnU2NyZWVuc2hvdCcpO1xuLy8gc2NyaXB0XFxzaW5nbGVcXFNjcmVlbnNob3QuanNcblxuZnVuY3Rpb24gY29udmVydENhbnZhc1RvSW1hZ2UoY2FudmFzKSB7XHJcbiAgICB2YXIgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcclxuICAgIGltYWdlLnNyYyA9IGNhbnZhcy50b0RhdGFVUkwoXCJpbWFnZS9wbmdcIik7XHJcbiAgICAvL2NhbnZhcy5nZXRJbWFnZURhdGEoKVxyXG4gICAgcmV0dXJuIGltYWdlO1xyXG59XHJcbi8vIOeUqOS6juWIm+W7uue8qeeVpeWbvlxyXG52YXIgU2NyZWVuc2hvdCA9IEZpcmUuQ2xhc3Moe1xyXG4gICAgZXh0ZW5kczogRmlyZS5Db21wb25lbnQsXHJcbiAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIC8vIOeUqOS6juaLjeeFp1xyXG4gICAgICAgIHRoaXMuZnJhbWVDb3VudCA9IC0xO1xyXG4gICAgICAgIHRoaXMubmVlZEhpZGVFbnRMaXN0ID0gW107XHJcbiAgICAgICAgdGhpcy5jYWxsYmFjayA9IG51bGw7XHJcbiAgICB9LFxyXG4gICAgLy8g5bGe5oCnXHJcbiAgICBwcm9wZXJ0aWVzOiB7XHJcblxyXG4gICAgfSxcclxuICAgIC8vIOi9veWFpeaXtlxyXG4gICAgb25Mb2FkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL1NEYXRhQmFzZScpO1xyXG4gICAgICAgIHRoaXMuc2RhdGFCYXNlID0gZW50LmdldENvbXBvbmVudCgnU0RhdGFCYXNlJyk7XHJcbiAgICB9LFxyXG4gICAgLy8g5Yib5bu657yp55Wl5Zu+XHJcbiAgICBjcmVhdGVUaHVtYm5haWxzOiBmdW5jdGlvbiAoY2FsbGJhY2spIHtcclxuICAgICAgICBpZiAoY2FsbGJhY2spe1xyXG4gICAgICAgICAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIOWFs+mXreW3sue7j+aJk+W8gOeVjOmdolxyXG4gICAgICAgIHRoaXMubmVlZEhpZGVFbnRMaXN0ID0gW107XHJcbiAgICAgICAgdmFyIGNoaWxkcmVuID0gRmlyZS5FbmdpbmUuX3NjZW5lLmVudGl0aWVzO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBjaGlsZHJlbi5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xyXG4gICAgICAgICAgICB2YXIgZW50ID0gY2hpbGRyZW5baV07XHJcbiAgICAgICAgICAgIGlmIChlbnQuYWN0aXZlICYmIGVudC5uYW1lICE9PSAnTWFpbiBDYW1lcmEnICYmXHJcbiAgICAgICAgICAgICAgICBlbnQubmFtZSAhPT0gJ1NjZW5lIENhbWVyYScgJiYgZW50Lm5hbWUgIT09ICdSb29tJyAmJlxyXG4gICAgICAgICAgICAgICAgZW50Lm5hbWUgIT09ICdTY3JlZW5zaG90Jykge1xyXG4gICAgICAgICAgICAgICAgZW50LmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5uZWVkSGlkZUVudExpc3QucHVzaChlbnQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIC8vIOWIm+W7uiBDYW52YXNcclxuICAgICAgICBpZiAoIXRoaXMuY2FudmFzQ3R4VG9EcmVhd0ltYWdlKSB7XHJcbiAgICAgICAgICAgIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuICAgICAgICAgICAgY2FudmFzLndpZHRoID0gMTIwO1xyXG4gICAgICAgICAgICBjYW52YXMuaGVpZ2h0ID0gMTIwO1xyXG4gICAgICAgICAgICB0aGlzLmNhbnZhc0N0eFRvRHJlYXdJbWFnZSA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmZyYW1lQ291bnQgPSBGaXJlLlRpbWUuZnJhbWVDb3VudCArIDI7XHJcbiAgICB9LFxyXG4gICAgLy8g5Yi35pawXHJcbiAgICB1cGRhdGU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAodGhpcy5mcmFtZUNvdW50ICE9PSAtMSAmJiB0aGlzLmZyYW1lQ291bnQgPT09IEZpcmUuVGltZS5mcmFtZUNvdW50KSB7XHJcbiAgICAgICAgICAgIC8vIOe7mOWItuWbvueJh1xyXG4gICAgICAgICAgICB0aGlzLmNhbnZhc0N0eFRvRHJlYXdJbWFnZS5jbGVhclJlY3QoMCwgMCwgMTIwLCAxMjApO1xyXG4gICAgICAgICAgICB2YXIgdyA9IEZpcmUuRW5naW5lLl9yZW5kZXJDb250ZXh0LndpZHRoO1xyXG4gICAgICAgICAgICB2YXIgaCA9IEZpcmUuRW5naW5lLl9yZW5kZXJDb250ZXh0LmhlaWdodDtcclxuICAgICAgICAgICAgdmFyIG1haW5JbWFnZSA9IGNvbnZlcnRDYW52YXNUb0ltYWdlKEZpcmUuRW5naW5lLl9yZW5kZXJDb250ZXh0LmNhbnZhcyk7XHJcbiAgICAgICAgICAgIHRoaXMuc2RhdGFCYXNlLnNsb2FkaW5nVGlwcy5vcGVuVGlwcygn5Yib5bu657yp55Wl5Zu+Jyk7XHJcbiAgICAgICAgICAgIG1haW5JbWFnZS5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNhbnZhc0N0eFRvRHJlYXdJbWFnZS5kcmF3SW1hZ2UobWFpbkltYWdlLCAwLCAwLCB3LCBoLCAwLCAwLCAxMjAsIDEyMCk7XHJcbiAgICAgICAgICAgICAgICB2YXIgaW1hZ2UgPSBjb252ZXJ0Q2FudmFzVG9JbWFnZSh0aGlzLmNhbnZhc0N0eFRvRHJlYXdJbWFnZS5jYW52YXMpO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zZGF0YUJhc2Uuc2xvYWRpbmdUaXBzLmNsb3NlVGlwcygpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNhbGxiYWNrKGltYWdlKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpO1xyXG4gICAgICAgICAgICAvLyDmiZPlvIDkuYvliY3lhbPpl63nmoTnlYzpnaJcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHRoaXMubmVlZEhpZGVFbnRMaXN0Lmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm5lZWRIaWRlRW50TGlzdFtpXS5hY3RpdmUgPSB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHRoaXMuZnJhbWVDb3VudCA9IC0xO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufSk7XHJcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnYTkwZjU4YTM5NURoWXppU3dYa0R2N3MnLCAnU2Vjb25kTWVudU1ncicpO1xuLy8gc2NyaXB0XFx2aWxsYVxcU2Vjb25kTWVudU1nci5qc1xuXG4vLyDkuoznuqfoj5zljZXnrqHnkIbnsbtcbnZhciBTZWNvbmRNZW51TWdyID0gRmlyZS5DbGFzcyh7XG4gICAgLy8g57un5om/XG4gICAgZXh0ZW5kczogRmlyZS5Db21wb25lbnQsXG4gICAgLy8g5p6E6YCg5Ye95pWwXG4gICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8g5a625YW357G75Z6L5oC75pWwXG4gICAgICAgIHRoaXMuX2Z1cm5pdHVyZVR5cGVUb3RhbCA9IDg7XG4gICAgICAgIC8vIOiPnOWNleWIl+ihqFxuICAgICAgICB0aGlzLl9tZW51TGlzdCA9IFtdO1xuICAgICAgICAvLyDlvZPliY3pgInmi6l0eXBlIDEg5Y2V5ZOBIDIg5aWX6KOFIDMg54mp5ZOB5p+cXG4gICAgICAgIHRoaXMuX2N1clR5cGUgPSAxO1xuICAgICAgICAvLyDlpZfoo4XkuIDpobXmmL7npLrlpJrlsJHkuKpcbiAgICAgICAgdGhpcy5fc3V0aUl0ZW1TaG93VG90YWwgPSA1O1xuICAgICAgICAvLyDlvZPliY3mnIDlpKfmlbDph49cbiAgICAgICAgdGhpcy5fY3VyVG90YWwgPSAwO1xuICAgICAgICAvLyDlvZPliY3pobXmlbBcbiAgICAgICAgdGhpcy5fY3VyUGFnZSA9IDE7XG4gICAgICAgIC8vIOacgOWkp+mhteaVsFxuICAgICAgICB0aGlzLl9tYXhQYWdlID0gMTtcbiAgICAgICAgLy8g5Yib5bu65aWX6KOF5a625YW35Yiw5Zy65pmv5LitXG4gICAgICAgIHRoaXMuYmluZENyZWF0ZVN1aXRJdGVtRXZlbnQgPSB0aGlzLl9vbkNyZWF0ZVN1aXRJdGVtRXZlbnQuYmluZCh0aGlzKTtcbiAgICAgICAgLy8g5omT5byA5LiJ57qn6I+c5Y2V5LqL5Lu2XG4gICAgICAgIHRoaXMuYmluZE9wZW5UaHJlZU1lbnVFdmVudCA9IHRoaXMuX29uT3BlblRocmVlTWVudUV2ZW50LmJpbmQodGhpcyk7XG4gICAgICAgIC8vIOWNleWTgeiPnOWNleWbnuiwg+WHveaVsFxuICAgICAgICB0aGlzLmJpbmRSZWZyZXNoU2luZ2xlSXRlbXNNZW51ID0gdGhpcy5fcmVmcmVzaFNpbmdsZUl0ZW1zTWVudS5iaW5kKHRoaXMpO1xuICAgICAgICAvLyDlpZfoo4Xoj5zljZXlm57osIPlh73mlbBcbiAgICAgICAgdGhpcy5iaW5kUmVmcmVzaFN1aXRJdGVtc01lbnUgPSB0aGlzLl9yZWZyZXNoU3VpdEl0ZW1zTWVudS5iaW5kKHRoaXMpO1xuICAgICAgICAvLyDpooTlrZjmnI3liqHlmajmlbDmja7liJfooahcbiAgICAgICAgdGhpcy5zZXJ2ZXJTdWl0RGF0YUxpc3QgPSB7fTtcbiAgICB9LFxuICAgIC8vIOWxnuaAp1xuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgLy9cbiAgICAgICAgbWFyZ2luOiBuZXcgRmlyZS5WZWMyKC0xMDkwLCAwKSxcbiAgICAgICAgLy8g5LqM57qn6I+c5Y2V55qE5qC56IqC54K5XG4gICAgICAgIHJvb3Q6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLkVudGl0eVxuICAgICAgICB9LFxuICAgICAgICAvLyDkuIrkuIDpobVcbiAgICAgICAgYnRuX0xlZnQ6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLkVudGl0eVxuICAgICAgICB9LFxuICAgICAgICAvLyDkuIvkuIDpobVcbiAgICAgICAgYnRuX1JpZ2h0OiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5FbnRpdHlcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy8g5omT5byA5ZCE5Liq57G75Z6L5a625YW35YiX6KGoXG4gICAgX29uT3BlblRocmVlTWVudUV2ZW50OiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgdmFyIG1lbnUgPSBldmVudC50YXJnZXQucGFyZW50LmdldENvbXBvbmVudCgnU2Vjb25kTWVudScpO1xuICAgICAgICBjb25zb2xlLmxvZygn6I635Y+WJyArIG1lbnUudGlkICsgXCLnsbvlnovlrrblhbfliJfooahcIik7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgLy8g5aaC5p6c5piv54mp5ZOB55qE6K+d5bCx6ZyA6KaB5YWI6K+35rGC5pyN5Yqh5Zmo5L+h5oGvXG4gICAgICAgIGlmIChzZWxmLl9jdXJUeXBlID09PSAyKSB7XG4gICAgICAgICAgICB2YXIgdGV4dCA9ICfor7fmsYLljZXlk4HmlbDmja7vvIzor7fnqI3lkI4uLi4nLCBlYWNobnVtID0gNztcbiAgICAgICAgICAgIGlmIChtZW51LnRpZCA9PT0gMSkge1xuICAgICAgICAgICAgICAgIHRleHQgPSAn6K+35rGC5aWX6KOF5pWw5o2u77yM6K+356iN5ZCOLi4uJztcbiAgICAgICAgICAgICAgICBlYWNobnVtID0gNTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UubG9hZFRpcHMub3BlblRpcHModGV4dCk7XG4gICAgICAgICAgICBzZWxmLmRhdGFCYXNlLmxvYWRCYWNrcGFja0RhdGEobWVudS50aWQsIDEsIGVhY2hudW0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmRhdGFCYXNlLmxvYWRUaXBzLmNsb3NlVGlwcygpO1xuICAgICAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UudGhyZWVNZW51TWdyLm9wZW5NZW51KG1lbnUudGlkLCBzZWxmLl9jdXJUeXBlLCBtZW51Lmhhc0RyYWcpO1xuICAgICAgICAgICAgICAgIHNlbGYuZW50aXR5LmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmRhdGFCYXNlLnRocmVlTWVudU1nci5vcGVuTWVudShtZW51LnRpZCwgdGhpcy5fY3VyVHlwZSwgbWVudS5oYXNEcmFnKTtcbiAgICAgICAgICAgIHRoaXMuZW50aXR5LmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyDliJvlu7rlpZfoo4XliLDlnLrmma/kuK1cbiAgICBfb25DcmVhdGVTdWl0SXRlbUV2ZW50OiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgdmFyIHNlY29uZE1lbnUgPSBldmVudC50YXJnZXQucGFyZW50LmdldENvbXBvbmVudCgnU2Vjb25kTWVudScpO1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIC8vIOWIoOmZpOWll+ijhVxuICAgICAgICBzZWxmLmRhdGFCYXNlLnJlbW92ZVN1aXQoKTtcbiAgICAgICAgLy8g6YeN5paw6LWL5YC85aWX6KOFXG4gICAgICAgIHNlbGYuZGF0YUJhc2UuY3VyRHJlc3NTdWl0ID0ge1xuICAgICAgICAgICAgLy8g5aWX6KOFSURcbiAgICAgICAgICAgIHN1aXRfaWQ6IHNlY29uZE1lbnUudGlkLFxuICAgICAgICAgICAgLy8g6IOM5YyFSURcbiAgICAgICAgICAgIHBhY2tfaWQ6IDAsXG4gICAgICAgICAgICAvLyDlpZfoo4XlsI/lm75cbiAgICAgICAgICAgIHN1aXRfaWNvbjogc2Vjb25kTWVudS5zbWFsbFNwcml0ZSxcbiAgICAgICAgICAgIC8vIOWll+ijheWQjeensFxuICAgICAgICAgICAgc3VpdF9uYW1lOiBzZWNvbmRNZW51LnRuYW1lLFxuICAgICAgICAgICAgLy8g5aWX6KOF5p2l6Ieq5ZOq6YeM77yMMS7og4zljIUgMi7llYbln45cbiAgICAgICAgICAgIHN1aXRfZnJvbTogMixcbiAgICAgICAgICAgIC8vIOWll+ijheS7t+agvFxuICAgICAgICAgICAgcHJpY2U6IHNlY29uZE1lbnUucHJpY2UsXG4gICAgICAgICAgICAvLyDmipjmiaNcbiAgICAgICAgICAgIGRpc2NvdW50OiBzZWNvbmRNZW51LmRpc2NvdW50LFxuICAgICAgICAgICAgLy8g5aWX6KOF5YiX6KGoXG4gICAgICAgICAgICBmdW5ybml0dXJlTGlzdDogW11cbiAgICAgICAgfTtcbiAgICAgICAgdmFyIHNlcnZlckRhdGEgPSB0aGlzLnNlcnZlclN1aXREYXRhTGlzdFtzZWNvbmRNZW51LnRpZF07XG4gICAgICAgIGlmIChzZXJ2ZXJEYXRhKSB7XG4gICAgICAgICAgICBzZWxmLmRhdGFCYXNlLmNyZWF0ZUZ1cm5pdHVyZVRvU2NyZWVuKHNlcnZlckRhdGEubGlzdCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UubG9hZFRpcHMuY2xvc2VUaXBzKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UubG9hZFRpcHMub3BlblRpcHMoJ+WIm+W7uuWll+ijhe+8jOivt+eojeWQji4uLicpO1xuICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS5uZXRXb3JrTWdyLlJlcXVlc3RTZXRJdGVtc0RhdGEoc2Vjb25kTWVudS50aWQsIGZ1bmN0aW9uIChzZXJ2ZXJEYXRhKSB7XG4gICAgICAgICAgICAgICAgc2VsZi5zZXJ2ZXJTdWl0RGF0YUxpc3Rbc2Vjb25kTWVudS50aWRdID0gc2VydmVyRGF0YTtcbiAgICAgICAgICAgICAgICBzZWxmLmRhdGFCYXNlLmNyZWF0ZUZ1cm5pdHVyZVRvU2NyZWVuKHNlcnZlckRhdGEubGlzdCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmRhdGFCYXNlLmxvYWRUaXBzLmNsb3NlVGlwcygpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIOWFs+mXreW9k+WJjeiPnOWNlVxuICAgIGNsb3NlTWVudTogZnVuY3Rpb24gKGhhc01vZGlmeVRvZ2dsZSkge1xuICAgICAgICBpZiAoIXRoaXMuZW50aXR5LmFjdGl2ZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2N1clBhZ2UgPSAxO1xuICAgICAgICB0aGlzLmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgaWYgKGhhc01vZGlmeVRvZ2dsZSkge1xuICAgICAgICAgICAgdGhpcy5kYXRhQmFzZS5maXJzdE1lbnVNZ3IubW9kaWZ5VG9nZ2xlKCk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIOWFs+mXreW9k+WJjeiPnOWNlVxuICAgIF9vbkNsb3NlTWVudTogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmNsb3NlTWVudSh0cnVlKTtcbiAgICB9LFxuICAgIC8vIOmHjee9ruiPnOWNleWIl+ihqFxuICAgIF9yZXNldE1lbnU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMuX21lbnVMaXN0Lmxlbmd0aCA9PT0gMCl7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9mdXJuaXR1cmVUeXBlVG90YWw7ICsraSkge1xuICAgICAgICAgICAgdmFyIG1lbnUgPSB0aGlzLl9tZW51TGlzdFtpXTtcbiAgICAgICAgICAgIG1lbnUubmFtZSA9IGkudG9TdHJpbmcoKTtcbiAgICAgICAgICAgIG1lbnUucmVzZXRNZW51KCk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIOWIm+W7uuiPnOWNleaMiemSruW5tuS4lOe7keWumuS6i+S7tlxuICAgIF9pbml0TWVudTogZnVuY3Rpb24gKGlkKSB7XG4gICAgICAgIC8vIOWIm+W7uuWuueWZqFxuICAgICAgICB0aGlzLl9jcmVhdGVNZW51Q29udGFpbmVycygpO1xuICAgICAgICB0aGlzLl9yZXNldE1lbnUoKTtcbiAgICAgICAgc3dpdGNoKGlkKXtcbiAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgICB0aGlzLl9zaW5nbGVJdGVtc01lbnUoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICB0aGlzLl9zdWl0SXRlbXNNZW51KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgdGhpcy5faXRlbXNDYWJpbmV0TWVudSgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy8g5Yib5bu65a655ZmoXG4gICAgX2NyZWF0ZU1lbnVDb250YWluZXJzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLl9tZW51TGlzdC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHRlbXBNZW51ID0gdGhpcy5kYXRhQmFzZS50ZW1wU3ViU2Vjb25kTWVudTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9mdXJuaXR1cmVUeXBlVG90YWw7ICsraSkge1xuICAgICAgICAgICAgdmFyIGVudCA9IEZpcmUuaW5zdGFudGlhdGUodGVtcE1lbnUpO1xuICAgICAgICAgICAgZW50Lm5hbWUgPSBpLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICBlbnQucGFyZW50ID0gdGhpcy5yb290O1xuICAgICAgICAgICAgZW50LnRyYW5zZm9ybS5wb3NpdGlvbiA9IG5ldyBGaXJlLlZlYzIoLTU3MCArIChpICogMTYwKSwgMjUpO1xuICAgICAgICAgICAgdmFyIG1lbnUgPSBlbnQuZ2V0Q29tcG9uZW50KCdTZWNvbmRNZW51Jyk7XG4gICAgICAgICAgICBtZW51LmluaXQoKTtcbiAgICAgICAgICAgIC8vIOWtmOWCqOWvueixoVxuICAgICAgICAgICAgdGhpcy5fbWVudUxpc3QucHVzaChtZW51KTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy8g5Yi35paw5Y2V5ZOB5a625YW36I+c5Y2V5YiX6KGoXG4gICAgX3NpbmdsZUl0ZW1zTWVudTogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgZGF0YUxpc3QgPSB0aGlzLmRhdGFCYXNlLnNpbmdsZV9TZWNvbmRfRGF0YVNoZWV0cztcbiAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IGRhdGFMaXN0Lmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IGRhdGFMaXN0W2ldO1xuICAgICAgICAgICAgdmFyIG1lbnUgPSB0aGlzLl9tZW51TGlzdFtpXTtcbiAgICAgICAgICAgIG1lbnUuZW50aXR5LnRyYW5zZm9ybS5wb3NpdGlvbiA9IG5ldyBGaXJlLlZlYzIoLTU3MCArIChpICogMTYwKSwgMjUpO1xuICAgICAgICAgICAgbWVudS5yZWZyZXNoKGRhdGEsIHRoaXMuYmluZE9wZW5UaHJlZU1lbnVFdmVudCk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIOWIt+aWsOWll+ijheWutuWFt+iPnOWNleWIl+ihqFxuICAgIF9zdWl0SXRlbXNNZW51OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIOmHjee9ruaVsOaNrlxuICAgICAgICB0aGlzLl9yZXNldE1lbnUoKTtcbiAgICAgICAgLy8g5aaC5p6c5oC75pWw6YeP5pyJ5pu05paw5bCx6YeN5paw6K6h566X5pyA5aSn6aG15pWwXG4gICAgICAgIGlmICh0aGlzLl9jdXJUb3RhbCAhPT0gdGhpcy5kYXRhQmFzZS5zdWl0SXRlbXNfVGhyZWVfVG90YWwpIHtcbiAgICAgICAgICAgIHRoaXMuX2N1clRvdGFsID0gdGhpcy5kYXRhQmFzZS5zdWl0SXRlbXNfVGhyZWVfVG90YWw7XG4gICAgICAgICAgICB0aGlzLl9tYXhQYWdlID0gTWF0aC5jZWlsKHRoaXMuX2N1clRvdGFsIC8gdGhpcy5fc3V0aUl0ZW1TaG93VG90YWwpO1xuICAgICAgICB9XG4gICAgICAgIC8vIOaYvuekuuWll+ijheiPnOWNlVxuICAgICAgICB2YXIgaW5kZXggPSAwO1xuICAgICAgICB2YXIgc3RhcnROdW0gPSAodGhpcy5fY3VyUGFnZSAtIDEpICogdGhpcy5fc3V0aUl0ZW1TaG93VG90YWw7XG4gICAgICAgIHZhciBlbmROdW0gPSBzdGFydE51bSArIHRoaXMuX3N1dGlJdGVtU2hvd1RvdGFsO1xuICAgICAgICBpZiAoZW5kTnVtID4gdGhpcy5fY3VyVG90YWwpIHtcbiAgICAgICAgICAgIGVuZE51bSA9IHRoaXMuX2N1clRvdGFsO1xuICAgICAgICB9XG4gICAgICAgIHZhciBkYXRhTGlzdCA9IHRoaXMuZGF0YUJhc2Uuc3VpdEl0ZW1zX1NlY29uZF9EYXRhU2hlZXRzO1xuICAgICAgICBmb3IgKHZhciBpID0gc3RhcnROdW07IGkgPCBlbmROdW07ICsraSkge1xuICAgICAgICAgICAgdmFyIGl0ZW1zID0gZGF0YUxpc3RbaV07XG4gICAgICAgICAgICB2YXIgbWVudSA9IHRoaXMuX21lbnVMaXN0W2luZGV4XTtcbiAgICAgICAgICAgIG1lbnUuZW50aXR5LnRyYW5zZm9ybS5wb3NpdGlvbiA9IG5ldyBGaXJlLlZlYzIoLTUwMCArIChpbmRleCAqIDI1MCksIDYwKTtcbiAgICAgICAgICAgIG1lbnUucmVmcmVzaF9zdWl0SXRlbXMoaXRlbXMsIHRoaXMuYmluZENyZWF0ZVN1aXRJdGVtRXZlbnQpO1xuICAgICAgICAgICAgaW5kZXgrKztcbiAgICAgICAgfVxuICAgICAgICAvLyDliLfmlrDmjInpkq7nirbmgIFcbiAgICAgICAgdGhpcy5fcmVmcmVzaEJ0blN0YXRlKCk7XG4gICAgICAgIC8vIOWIpOaWreaYr+WQpumcgOimgemihOWKoOi9veS4i+S4gOmhtVxuICAgICAgICB2YXIgbGVuID0gdGhpcy5kYXRhQmFzZS5zdWl0SXRlbXNfU2Vjb25kX0RhdGFTaGVldHMubGVuZ3RoO1xuICAgICAgICBpZiAobGVuID09PSB0aGlzLmRhdGFCYXNlLnN1aXRJdGVtc19UaHJlZV9Ub3RhbCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIOmihOWKoOi9vVxuICAgICAgICAvL3ZhciBuZXh0UGFnZSA9IHRoaXMuX2N1clBhZ2UgKyAxO1xuICAgICAgICAvL3RoaXMuZGF0YUJhc2UucHJlbG9hZFN1aXRJdGVtc0RhdGFfU2Vjb25kKG5leHRQYWdlLCB0aGlzLl9zdXRpSXRlbVNob3dUb3RhbCwgdGhpcy5iaW5kUmVmcmVzaFN1aXRJdGVtc01lbnUpO1xuICAgIH0sXG4gICAgLy8g5Yi35paw54mp5ZOB5p+c5YiX6KGoXG4gICAgX2l0ZW1zQ2FiaW5ldE1lbnU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8g6YeN5paw5Yi35paw5LiL6L295ZCO55qE5Zu+54mH5pWw5o2uXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgdmFyIGxvYWRJbWFnZUNhbGxCYWNrID0gZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgIHZhciBtZW51ID0gc2VsZi5fbWVudUxpc3RbZGF0YS50aWRdO1xuICAgICAgICAgICAgbWVudS5yZWZyZXNoKGRhdGEsIHNlbGYuYmluZE9wZW5UaHJlZU1lbnVFdmVudCk7XG4gICAgICAgIH07XG4gICAgICAgIC8vIOWIneWni+WMlueJqeWTgeafnOaVsOaNrlxuICAgICAgICB0aGlzLmRhdGFCYXNlLmluaXRCYWNrcGFja0RhdGEobG9hZEltYWdlQ2FsbEJhY2spO1xuICAgICAgICAvL1xuICAgICAgICB2YXIgZGF0YVNoZWV0cyA9IHRoaXMuZGF0YUJhc2UuYmFja3BhY2tfU2Vjb25kX0RhdGFTaGVldHM7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YVNoZWV0cy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgdmFyIG1lbnUgPSB0aGlzLl9tZW51TGlzdFtpXTtcbiAgICAgICAgICAgIHZhciBpdGVtcyA9IGRhdGFTaGVldHNbaV07XG4gICAgICAgICAgICBtZW51LmVudGl0eS50cmFuc2Zvcm0ucG9zaXRpb24gPSBuZXcgRmlyZS5WZWMyKC01NTAgKyAoaSAqIDIwMCksIDI1KTtcbiAgICAgICAgICAgIG1lbnUucmVmcmVzaChpdGVtcywgdGhpcy5iaW5kT3BlblRocmVlTWVudUV2ZW50KTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy8g5Yi35paw5Y2V5ZOB6I+c5Y2VXG4gICAgX3JlZnJlc2hTaW5nbGVJdGVtc01lbnU6IGZ1bmN0aW9uIChpbmRleCwgbWVudURhdGEpIHtcbiAgICAgICAgaWYgKHRoaXMuX2N1clR5cGUgIT09IDApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgbWVudSA9IHRoaXMuX21lbnVMaXN0W2luZGV4XTtcbiAgICAgICAgaWYgKG1lbnUpIHtcbiAgICAgICAgICAgIG1lbnUucmVmcmVzaChtZW51RGF0YSwgdGhpcy5iaW5kT3BlblRocmVlTWVudUV2ZW50KTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy8g5Yi35paw5aWX6KOF6I+c5Y2VXG4gICAgX3JlZnJlc2hTdWl0SXRlbXNNZW51OiBmdW5jdGlvbiAocGFnZSwgaW5kZXgsIG1lbnVEYXRhKSB7XG4gICAgICAgIGlmICh0aGlzLl9jdXJUeXBlICE9PSAxIHx8IHRoaXMuX2N1clBhZ2UgIT09IHBhZ2UpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB2YXIgbWVudSA9IHRoaXMuX21lbnVMaXN0W2luZGV4XTtcbiAgICAgICAgaWYgKG1lbnUpIHtcbiAgICAgICAgICAgIG1lbnUucmVmcmVzaF9zdWl0SXRlbXMobWVudURhdGEsIHRoaXMuYmluZENyZWF0ZVN1aXRJdGVtRXZlbnQpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyDliLfmlrDmjInpkq7nirbmgIFcbiAgICBfcmVmcmVzaEJ0blN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuYnRuX0xlZnQuYWN0aXZlID0gdGhpcy5fY3VyUGFnZSA+IDE7XG4gICAgICAgIHRoaXMuYnRuX1JpZ2h0LmFjdGl2ZSA9IHRoaXMuX2N1clBhZ2UgPCB0aGlzLl9tYXhQYWdlO1xuICAgIH0sXG4gICAgLy8g5LiK5LiA6aG1XG4gICAgX29uUHJldmlvdXNFdmVudDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLl9jdXJQYWdlIC09IDE7XG4gICAgICAgIGlmICh0aGlzLl9jdXJQYWdlIDwgMSl7XG4gICAgICAgICAgICB0aGlzLl9jdXJQYWdlID0gMTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9zdWl0SXRlbXNNZW51KCk7XG4gICAgfSxcbiAgICAvLyDkuIvkuIDpobVcbiAgICBfb25OZXh0RXZlbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5fY3VyUGFnZSArPSAxO1xuICAgICAgICBpZiAodGhpcy5fY3VyUGFnZSA+IHRoaXMuX21heFBhZ2Upe1xuICAgICAgICAgICAgdGhpcy5fY3VyUGFnZSA9IHRoaXMuX21heFBhZ2U7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fc3VpdEl0ZW1zTWVudSgpO1xuICAgIH0sXG4gICAgLy8g5r+A5rS76I+c5Y2V5pe26Kem5Y+R55qE5LqL5Lu2IDA65Y2V5ZOBIDE65aWX6KOFIDI654mp5ZOB5p+cXG4gICAgb3Blbk1lbnU6IGZ1bmN0aW9uIChpZCkge1xuICAgICAgICBjb25zb2xlLmxvZygn5omT5byASUQ6JyArIGlkICsgXCIgICAoMDrljZXlk4EgMTrlpZfoo4UgMjrnianlk4Hmn5wpXCIpO1xuICAgICAgICAvL1xuICAgICAgICB0aGlzLmJ0bl9MZWZ0LmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLmJ0bl9SaWdodC5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgLy/ojrflj5boj5zljZXmjInpkq7lubbkuJTnu5Hlrprkuovku7ZcbiAgICAgICAgdGhpcy5fY3VyVHlwZSA9IGlkO1xuICAgICAgICB0aGlzLl9pbml0TWVudShpZCk7XG4gICAgICAgIHRoaXMuZGF0YUJhc2UudGhyZWVNZW51TWdyLmNsb3NlTWVudShmYWxzZSk7XG4gICAgICAgIHRoaXMuZW50aXR5LmFjdGl2ZSA9IHRydWU7XG4gICAgfSxcbiAgICAvLyDlvIDlp4tcbiAgICBzdGFydDogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyDluLjnlKjnmoTlj5jph48v5pWw5o2uXG4gICAgICAgIHZhciBlbnQgPSBGaXJlLkVudGl0eS5maW5kKCcvRGF0YUJhc2UnKTtcbiAgICAgICAgdGhpcy5kYXRhQmFzZSA9IGVudC5nZXRDb21wb25lbnQoJ0RhdGFCYXNlJyk7XG4gICAgICAgIC8vIOiOt+WPluWFs+mXreaMiemSruW5tue7keWumuS6i+S7tlxuICAgICAgICBlbnQgPSB0aGlzLmVudGl0eS5maW5kKCdidG5fY2xvc2UnKTtcbiAgICAgICAgdmFyIGJ0bkNsb3NlID0gZW50LmdldENvbXBvbmVudCgnVUlCdXR0b24nKTtcbiAgICAgICAgYnRuQ2xvc2Uub25DbGljayA9IHRoaXMuX29uQ2xvc2VNZW51LmJpbmQodGhpcyk7XG4gICAgICAgIC8vIOS4iuS4gOmhtVxuICAgICAgICB0aGlzLmJ0bl9MZWZ0ID0gdGhpcy5lbnRpdHkuZmluZCgnYnRuX2xlZnQnKTtcbiAgICAgICAgdmFyIGJ0bkxlZnQgPSB0aGlzLmJ0bl9MZWZ0LmdldENvbXBvbmVudCgnVUlCdXR0b24nKTtcbiAgICAgICAgYnRuTGVmdC5vbkNsaWNrID0gdGhpcy5fb25QcmV2aW91c0V2ZW50LmJpbmQodGhpcyk7XG4gICAgICAgIC8vIOS4i+S4gOmhtVxuICAgICAgICB0aGlzLmJ0bl9SaWdodCA9IHRoaXMuZW50aXR5LmZpbmQoJ2J0bl9yaWdodCcpO1xuICAgICAgICB2YXIgYnRuUmlnaHQgPSB0aGlzLmJ0bl9SaWdodC5nZXRDb21wb25lbnQoJ1VJQnV0dG9uJyk7XG4gICAgICAgIGJ0blJpZ2h0Lm9uQ2xpY2sgPSB0aGlzLl9vbk5leHRFdmVudC5iaW5kKHRoaXMpO1xuICAgICAgICAvL1xuICAgICAgICB0aGlzLmJ0bl9MZWZ0LmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLmJ0bl9SaWdodC5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgLy8g6aKE5Yqg6L29IOWNleWTgVxuICAgICAgICB0aGlzLmRhdGFCYXNlLnByZWxvYWRTaW5hZ2xlSXRlbXNEYXRhX1NlY29uZCh0aGlzLmJpbmRSZWZyZXNoU2luZ2xlSXRlbXNNZW51KTtcbiAgICAgICAgLy8g6aKE5Yqg6L29IOWll+ijhVxuICAgICAgICB0aGlzLmRhdGFCYXNlLnByZWxvYWRTdWl0SXRlbXNEYXRhX1NlY29uZCgxLCB0aGlzLl9zdXRpSXRlbVNob3dUb3RhbCwgdGhpcy5iaW5kUmVmcmVzaFN1aXRJdGVtc01lbnUpO1xuICAgIH0sXG4gICAgdXBkYXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIOWMuemFjVVJ5YiG6L6o546HXG4gICAgICAgIC8vdmFyIGNhbWVyYSA9IEZpcmUuQ2FtZXJhLm1haW47XG4gICAgICAgIC8vdmFyIGJnV29ybGRCb3VuZHMgPSB0aGlzLmRhdGFCYXNlLmJnUmVuZGVyLmdldFdvcmxkQm91bmRzKCk7XG4gICAgICAgIC8vdmFyIGJnTGVmdFRvcFdvcmxkUG9zID0gbmV3IEZpcmUuVmVjMihiZ1dvcmxkQm91bmRzLnhNaW4sIGJnV29ybGRCb3VuZHMueU1pbik7XG4gICAgICAgIC8vdmFyIGJnbGVmdFRvcCA9IGNhbWVyYS53b3JsZFRvU2NyZWVuKGJnTGVmdFRvcFdvcmxkUG9zKTtcbiAgICAgICAgLy92YXIgc2NyZWVuUG9zID0gbmV3IEZpcmUuVmVjMihiZ2xlZnRUb3AueCwgYmdsZWZ0VG9wLnkpO1xuICAgICAgICAvL3ZhciB3b3JsZFBvcyA9IGNhbWVyYS5zY3JlZW5Ub1dvcmxkKHNjcmVlblBvcyk7XG4gICAgICAgIC8vdGhpcy5lbnRpdHkudHJhbnNmb3JtLndvcmxkUG9zaXRpb24gPSB3b3JsZFBvcztcbiAgICAgICAgLy8g5Yy56YWNVUnliIbovqjnjodcbiAgICAgICAgdmFyIGNhbWVyYSA9IEZpcmUuQ2FtZXJhLm1haW47XG4gICAgICAgIHZhciBzY3JlZW5TaXplID0gRmlyZS5TY3JlZW4uc2l6ZS5tdWwoY2FtZXJhLnNpemUgLyBGaXJlLlNjcmVlbi5oZWlnaHQpO1xuICAgICAgICB2YXIgbmV3UG9zID0gRmlyZS52Mih0aGlzLm1hcmdpbi54LCAtc2NyZWVuU2l6ZS55IC8gMiArIHRoaXMubWFyZ2luLnkpO1xuICAgICAgICB0aGlzLmVudGl0eS50cmFuc2Zvcm0ucG9zaXRpb24gPSBuZXdQb3M7XG4gICAgfVxufSk7XG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJ2E4MGIySTZnTkZQWDVQMDBEdjRRY0N0JywgJ1NlY29uZE1lbnUnKTtcbi8vIHNjcmlwdFxcdmlsbGFcXFNlY29uZE1lbnUuanNcblxudmFyIFNlY29uZE1lbnUgPSBGaXJlLkNsYXNzKHtcbiAgICAvLyDnu6fmib9cbiAgICBleHRlbmRzOiBGaXJlLkNvbXBvbmVudCxcbiAgICAvLyDmnoTpgKDlh73mlbBcbiAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLl9idG5NZW51ID0gbnVsbDtcbiAgICAgICAgdGhpcy5fcHJpY2UgPSBudWxsO1xuICAgICAgICB0aGlzLnJvb21UeXBlID0gMDtcbiAgICAgICAgdGhpcy51aWQgPSAwO1xuICAgICAgICB0aGlzLnByaWNlID0gMDtcbiAgICAgICAgLy8g5oqY5omjXG4gICAgICAgIHRoaXMuZGlzY291bnQgPSAxO1xuICAgICAgICB0aGlzLnNtYWxsU3ByaXRlID0gbnVsbDtcbiAgICB9LFxuICAgIC8vIOWxnuaAp1xuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgLy8g5b2T5YmN57G75Z6LSUTnlKjkuo7lkJHmnI3liqHlmajor7fmsYLmlbDmja5cbiAgICAgICAgdGlkOiAwLFxuICAgICAgICB0bmFtZTogJycsXG4gICAgICAgIGhhc0RyYWc6IGZhbHNlLFxuICAgICAgICAvLyDpu5jorqTlm77niYdcbiAgICAgICAgZGVmYXVsdFNwcml0ZToge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuU3ByaXRlXG4gICAgICAgIH0sXG4gICAgICAgIGRlZmF1bHRMb2FkQW5pbToge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuQW5pbWF0aW9uXG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIOmHjee9ruiPnOWNlVxuICAgIHJlc2V0TWVudTogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLnRpZCA9IDA7XG4gICAgICAgIHRoaXMuaGFzRHJhZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLnRuYW1lID0gJ+i9veWFpeS4rSc7XG4gICAgICAgIHRoaXMuX2J0bk1lbnUuc2V0VGV4dCgn6L295YWl5LitJyk7XG4gICAgICAgIHRoaXMuX2J0bk1lbnUuc2V0U3ByaXRlKHRoaXMuZGVmYXVsdFNwcml0ZSk7XG4gICAgICAgIHRoaXMuX2J0bk1lbnUuc2V0Q3VzdG9tU2l6ZSgtMSwgLTEpO1xuICAgICAgICB0aGlzLl9idG5NZW51Lm9uQ2xpY2sgPSBudWxsO1xuICAgICAgICB0aGlzLl9wcmljZS5lbnRpdHkuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgIHRoaXMuZW50aXR5LmFjdGl2ZSA9IGZhbHNlO1xuICAgIH0sXG4gICAgLy8g6K6+572u5paH5a2XXG4gICAgc2V0VGV4dDogZnVuY3Rpb24gKHRleHQpIHtcbiAgICAgICAgdGhpcy50bmFtZSA9IHRleHQ7XG4gICAgICAgIHRoaXMuX2J0bk1lbnUuc2V0VGV4dCh0ZXh0KTtcbiAgICB9LFxuICAgIC8vIOiuvue9ruS7t+agvFxuICAgIHNldFByaWNlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgdGhpcy5wcmljZSA9IHZhbHVlO1xuICAgICAgICB0aGlzLl9wcmljZS50ZXh0ID0gdmFsdWU7XG4gICAgICAgIHRoaXMuX3ByaWNlLmVudGl0eS5hY3RpdmUgPSB0cnVlO1xuICAgIH0sXG4gICAgLy8g6K6+572u5Zu+54mHXG4gICAgc2V0U3ByaXRlOiBmdW5jdGlvbiAoc3ByaXRlLCBldmVudCkge1xuICAgICAgICBpZiAoISBzcHJpdGUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNtYWxsU3ByaXRlID0gc3ByaXRlO1xuICAgICAgICB0aGlzLl9idG5NZW51LnNldFNwcml0ZShzcHJpdGUpO1xuICAgICAgICBpZiAoc3ByaXRlLndpZHRoID4gMTMwKSB7XG4gICAgICAgICAgICB0aGlzLl9idG5NZW51LnNldEN1c3RvbVNpemUoMTIwLCAxMjApO1xuICAgICAgICB9XG4gICAgICAgIGlmIChldmVudCkge1xuICAgICAgICAgICAgdGhpcy5fYnRuTWVudS5vbkNsaWNrID0gZXZlbnQ7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIGluaXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8g5bi455So55qE5Y+Y6YePL+aVsOaNrlxuICAgICAgICB2YXIgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL0RhdGFCYXNlJyk7XG4gICAgICAgIHRoaXMuZGF0YUJhc2UgPSBlbnQuZ2V0Q29tcG9uZW50KCdEYXRhQmFzZScpO1xuICAgICAgICAvL1xuICAgICAgICBlbnQgPSB0aGlzLmVudGl0eS5maW5kKCdidG5fTWVudScpO1xuICAgICAgICB0aGlzLl9idG5NZW51ID0gZW50LmdldENvbXBvbmVudCgnVUlCdXR0b24nKTtcbiAgICAgICAgZW50ID0gdGhpcy5lbnRpdHkuZmluZCgncHJpY2UnKTtcbiAgICAgICAgdGhpcy5fcHJpY2UgPSBlbnQuZ2V0Q29tcG9uZW50KEZpcmUuVGV4dCk7XG4gICAgICAgIC8vXG4gICAgICAgIHZhciBzdGF0ZSA9IHRoaXMuZGVmYXVsdExvYWRBbmltLnBsYXkoJ2xvYWRpbmcnKTtcbiAgICAgICAgc3RhdGUud3JhcE1vZGUgPSBGaXJlLldyYXBNb2RlLkxvb3A7XG4gICAgICAgIHN0YXRlLnJlcGVhdENvdW50ID0gSW5maW5pdHk7XG4gICAgfSxcbiAgICAvLyDliLfmlrDljZXlk4EgLyDnianlk4Hmn5xcbiAgICByZWZyZXNoOiBmdW5jdGlvbiAoZGF0YSwgZXZlbnQpIHtcbiAgICAgICAgdGhpcy5yZXNldE1lbnUoKTtcblxuICAgICAgICB0aGlzLmVudGl0eS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICB0aGlzLl9idG5NZW51LmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5kZWZhdWx0TG9hZEFuaW0uZW50aXR5LmFjdGl2ZSA9IHRydWU7XG4gICAgICAgIHRoaXMuZGVmYXVsdExvYWRBbmltLnBsYXkoJ2xvYWRpbmcnKTtcbiAgICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgICAgIHRoaXMudGlkID0gZGF0YS50aWQ7XG4gICAgICAgICAgICB0aGlzLmhhc0RyYWcgPSBkYXRhLmlzZHJhZyA8IDI7XG4gICAgICAgICAgICB0aGlzLnNldFRleHQoZGF0YS50bmFtZSk7XG4gICAgICAgICAgICB0aGlzLmVudGl0eS5uYW1lID0gZGF0YS50aWQ7XG4gICAgICAgICAgICB0aGlzLmVudGl0eS5hY3RpdmUgPSB0cnVlO1xuXG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgICBpZiAoZGF0YS5sb2NhbFBhdGgpIHtcbiAgICAgICAgICAgICAgICBGaXJlLlJlc291cmNlcy5sb2FkKGRhdGEubG9jYWxQYXRoLCBmdW5jdGlvbiAoZXJyb3IsIHNwcml0ZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBzZWxmLnNldFNwcml0ZShzcHJpdGUsIGV2ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fYnRuTWVudS5lbnRpdHkuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5kZWZhdWx0TG9hZEFuaW0uZW50aXR5LmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS5sb2FkSW1hZ2UoZGF0YS51cmwgfHwgZGF0YS5pbWFnZVVybCwgZnVuY3Rpb24gKGRhdGEsIGVycm9yLCBpbWFnZSkge1xuICAgICAgICAgICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChzZWxmLnRpZCAhPT0gZGF0YS50aWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgc3ByaXRlID0gbmV3IEZpcmUuU3ByaXRlKGltYWdlKTtcbiAgICAgICAgICAgICAgICBzZWxmLnNldFNwcml0ZShzcHJpdGUsIGV2ZW50KTtcbiAgICAgICAgICAgICAgICBzZWxmLl9idG5NZW51LmVudGl0eS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHNlbGYuZGVmYXVsdExvYWRBbmltLmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzLCBkYXRhKSk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIOWIt+aWsOWll+ijhVxuICAgIHJlZnJlc2hfc3VpdEl0ZW1zOiBmdW5jdGlvbiAoZGF0YSwgZXZlbnQpIHtcbiAgICAgICAgdGhpcy5yZXNldE1lbnUoKTtcblxuICAgICAgICB0aGlzLmVudGl0eS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICB0aGlzLl9idG5NZW51LmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5kZWZhdWx0TG9hZEFuaW0uZW50aXR5LmFjdGl2ZSA9IHRydWU7XG4gICAgICAgIHRoaXMuZGVmYXVsdExvYWRBbmltLnBsYXkoJ2xvYWRpbmcnKTtcblxuICAgICAgICBpZiAoZGF0YSkge1xuICAgICAgICAgICAgdGhpcy50aWQgPSBkYXRhLnRpZDtcbiAgICAgICAgICAgIHRoaXMudWlkID0gZGF0YS51aWQ7XG4gICAgICAgICAgICB0aGlzLnNldFRleHQoZGF0YS50bmFtZSk7XG4gICAgICAgICAgICB0aGlzLnJvb21UeXBlID0gZGF0YS5yb29tVHlwZTtcbiAgICAgICAgICAgIHRoaXMuc2V0UHJpY2UoZGF0YS5wcmljZSk7XG4gICAgICAgICAgICB0aGlzLmVudGl0eS5uYW1lID0gZGF0YS50aWQ7XG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS5sb2FkSW1hZ2UoZGF0YS5pbWFnZVVybCwgZnVuY3Rpb24gKGRhdGEsIGVycm9yLCBpbWFnZSkge1xuICAgICAgICAgICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChzZWxmLnRpZCAhPT0gZGF0YS50aWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgc3ByaXRlID0gbmV3IEZpcmUuU3ByaXRlKGltYWdlKTtcbiAgICAgICAgICAgICAgICBzZWxmLnNldFNwcml0ZShzcHJpdGUsIGV2ZW50KTtcbiAgICAgICAgICAgICAgICBzZWxmLl9idG5NZW51LmVudGl0eS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHNlbGYuZGVmYXVsdExvYWRBbmltLmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzLCBkYXRhKSk7XG4gICAgICAgIH1cbiAgICB9XG59KTtcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnYzEwZjBCNmxHWktlNWRiM1BMTXVvU2snLCAnU3dpdGNoUm9vbVdpbmRvdycpO1xuLy8gc2NyaXB0XFx2aWxsYVxcU3dpdGNoUm9vbVdpbmRvdy5qc1xuXG4vL1xyXG52YXIgU3dpdGNoUm9vbVdpbmRvdyA9IEZpcmUuQ2xhc3Moe1xyXG4gICAgLy8g57un5om/XHJcbiAgICBleHRlbmRzOiBGaXJlLkNvbXBvbmVudCxcclxuICAgIC8vIOaehOmAoOWHveaVsFxyXG4gICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLmVudHJhbmNlVHlwZSA9IDA7XHJcbiAgICB9LFxyXG4gICAgLy8g5bGe5oCnXHJcbiAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgcm9vdDoge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiBGaXJlLkVudGl0eVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcm9vbU5hbWU6IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5UZXh0XHJcbiAgICAgICAgfSxcclxuICAgICAgICByb29tTGV2ZWw6IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5UZXh0XHJcbiAgICAgICAgfSxcclxuICAgICAgICByb29tTnVtOiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVGV4dFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYnRuX2Nsb3NlOiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVUlCdXR0b25cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8g6YeN572u56qX5Y+jXHJcbiAgICByZXNldFdpbmRvdzogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMucm9vbU5hbWUudGV4dCA9ICco5Yir5aKF5ZCN56ewKSc7XHJcbiAgICAgICAgdGhpcy5yb29tTGV2ZWwudGV4dCA9ICfmoaPmrKHvvJrimIXimIXimIXimIXimIXimIUnO1xyXG4gICAgICAgIHRoaXMucm9vbU51bS50ZXh0ID0gJ+WFsTjkuKrmiL/pl7QnO1xyXG4gICAgfSxcclxuICAgIC8vIOaJk+W8gOeql+WPo1xyXG4gICAgLy8gdHlwZTog6YKj5Liq6Lev5Y+j6L+b5YWl5bmz6Z2i5Zu+55qEXHJcbiAgICAvLyAwLCDliIfmjaLmiL/pl7QgMe+8muWIh+aNoualvOWHulxyXG4gICAgb3BlbldpbmRvdzogZnVuY3Rpb24gKHR5cGUsIHNlbmREYXRhKSB7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIHNlbGYuZW50aXR5LmFjdGl2ZSA9IHRydWU7XHJcbiAgICAgICAgc2VsZi5lbnRyYW5jZVR5cGUgPSB0eXBlO1xyXG4gICAgICAgIHNlbGYuX3JlbW92ZVN3aXRjaFJvb20oKTtcclxuICAgICAgICB2YXIgbG9hY2xEYXRhID0gc2VsZi5wbGFuTGlzdFtzZW5kRGF0YS5tYXJrXTtcclxuICAgICAgICBpZiAobG9hY2xEYXRhKSB7XHJcbiAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UubWFyayA9IHNlbmREYXRhLm1hcms7XHJcbiAgICAgICAgICAgIHNlbGYuY3JlYXRlUGxhbihsb2FjbERhdGEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS5sb2FkVGlwcy5vcGVuVGlwcygn6L295YWl5bmz6Z2i5Zu+5pWw5o2u77yB6K+356iN5ZCOLi4uJyk7XHJcbiAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UubmV0V29ya01nci5SZXF1ZXN0UGxhbihzZW5kRGF0YSwgZnVuY3Rpb24gKHNlcnZlckRhdGEpIHtcclxuICAgICAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UubG9hZFRpcHMuY2xvc2VUaXBzKCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoc2VydmVyRGF0YS5zdGF0dXMgPT09IDEwMDA2KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS5sb2FkVGlwcy5jbG9zZVRpcHMoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHNlbGYucGxhbkxpc3Rbc2VuZERhdGEubWFya10gPSBzZXJ2ZXJEYXRhO1xyXG4gICAgICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS5tYXJrID0gc2VuZERhdGEubWFyaztcclxuICAgICAgICAgICAgICAgIHNlbGYuY3JlYXRlUGxhbihzZXJ2ZXJEYXRhKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIOWFs+mXreeql+WPo1xyXG4gICAgY2xvc2VXaW5kb3c6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcclxuICAgIH0sXHJcbiAgICAvLyDnu5jliLbmmJ/nuqdcclxuICAgIGdldFN0YXJzOiBmdW5jdGlvbiAoZ3JhZGUpIHtcclxuICAgICAgICB2YXIgc3RyID0gJ+aho+asoe+8mic7XHJcbiAgICAgICAgaWYgKGdyYWRlID09PSAxMikge1xyXG4gICAgICAgICAgICBzdHIgKz0gJ+iHs+WwiuWunSc7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGdyYWRlIC0gMTsgKytpKSB7XHJcbiAgICAgICAgICAgICAgICBzdHIgKz0gJ+KYhSc7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHN0cjtcclxuICAgIH0sXHJcbiAgICAvLyDliJvlu7rlubPpnaLlm75cclxuICAgIGNyZWF0ZVBsYW46IGZ1bmN0aW9uIChzZXJ2ZXJEYXRhKSB7XHJcbiAgICAgICAgaWYgKCEgc2VydmVyRGF0YS5saXN0KSB7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgLy8g5YOP5pyN5Yqh5Zmo6K+35rGC5bmz6Z2i5Zu+5pWw5o2uXHJcbiAgICAgICAgdGhpcy5yb29tTmFtZS50ZXh0ID0gc2VydmVyRGF0YS5mbG9vcl9uYW1lO1xyXG4gICAgICAgIHRoaXMucm9vbUxldmVsLnRleHQgPSB0aGlzLmdldFN0YXJzKHNlcnZlckRhdGEuZmxvb3JfZ3JhZGUpO1xyXG4gICAgICAgIHRoaXMucm9vbU51bS50ZXh0ID0gJ+WFsScrIHNlcnZlckRhdGEubGlzdC5sZW5ndGggKyAn5Liq5oi/6Ze0JztcclxuICAgICAgICB0aGlzLmJpbmRHb1RvUm9vbUV2ZW50ID0gdGhpcy5fb25Hb3RvUm9vbUV2ZW50LmJpbmQodGhpcyk7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzZXJ2ZXJEYXRhLmxpc3QubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICAgICAgdmFyIGRhdGEgPSBzZXJ2ZXJEYXRhLmxpc3RbaV07XHJcbiAgICAgICAgICAgIHZhciBlbnQgPSBGaXJlLmluc3RhbnRpYXRlKHRoaXMuZGF0YUJhc2UudGVtcFBsYW4pO1xyXG4gICAgICAgICAgICBlbnQuYWN0aXZlID0gdHJ1ZTtcclxuICAgICAgICAgICAgZW50LnBhcmVudCA9IHRoaXMucm9vdDtcclxuICAgICAgICAgICAgdmFyIGJ0biA9IGVudC5nZXRDb21wb25lbnQoRmlyZS5VSUJ1dHRvbik7XHJcbiAgICAgICAgICAgIGJ0bi5tYXJrID0gZGF0YS5tYXJrO1xyXG4gICAgICAgICAgICB0aGlzLmRhdGFCYXNlLmxvYWRJbWFnZShkYXRhLmltZ3VybCwgZnVuY3Rpb24gKGJ0biwgZXJyb3IsIGltYWdlKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgc3ByaXRlID0gbmV3IEZpcmUuU3ByaXRlKGltYWdlKTtcclxuICAgICAgICAgICAgICAgIHNwcml0ZS5waXhlbExldmVsSGl0VGVzdCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBidG4uc2V0U3ByaXRlKHNwcml0ZSk7XHJcbiAgICAgICAgICAgICAgICBidG4ub25DbGljayA9IHRoaXMuYmluZEdvVG9Sb29tRXZlbnQ7XHJcbiAgICAgICAgICAgIH0uYmluZCh0aGlzLCBidG4pKTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8g6L+b5YWl5oi/6Ze0XHJcbiAgICBfb25Hb3RvUm9vbUV2ZW50OiBmdW5jdGlvbiAoZXZlbnQpIHtcclxuICAgICAgICB2YXIgYnRuID0gZXZlbnQudGFyZ2V0LmdldENvbXBvbmVudChGaXJlLlVJQnV0dG9uKTtcclxuICAgICAgICB2YXIgc2VuZERhdGEgPSB7XHJcbiAgICAgICAgICAgIG1hcms6IGJ0bi5tYXJrLFxyXG4gICAgICAgICAgICBob3VzZV91aWQ6IDBcclxuICAgICAgICB9O1xyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICBzZWxmLmRhdGFCYXNlLmxvYWRUaXBzLm9wZW5UaXBzKCfovb3lhaXmiL/pl7TmlbDmja7vvIHor7fnqI3lkI4uLi4nKTtcclxuICAgICAgICBzZWxmLmRhdGFCYXNlLmludG9Sb29tKHNlbmREYXRhLCBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UubG9hZFRpcHMuY2xvc2VUaXBzKCk7XHJcbiAgICAgICAgICAgIHNlbGYuY2xvc2VXaW5kb3coKTtcclxuICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS5maXJzdE1lbnVNZ3IuY2xvc2VNZW51KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG4gICAgLy8g5riF56m65oi/6Ze0XHJcbiAgICBfcmVtb3ZlU3dpdGNoUm9vbTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBjaGlsZHJlbiA9IHRoaXMucm9vdC5nZXRDaGlsZHJlbigpO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwO2kgPCBjaGlsZHJlbi5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgICAgICBjaGlsZHJlbltpXS5kZXN0cm95KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIOWFs+mXreaMiemSruS6i+S7tlxyXG4gICAgX29uQ2xvc2VXaW5kb3dFdmVudDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuY2xvc2VXaW5kb3coKTtcclxuICAgICAgICBpZiAodGhpcy5lbnRyYW5jZVR5cGUgPT09IDEpIHtcclxuICAgICAgICAgICAgdGhpcy5kYXRhQmFzZS5mbG9vcldpbi5vcGVuV2luZG93KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuX3JlbW92ZVN3aXRjaFJvb20oKTtcclxuICAgIH0sXHJcbiAgICAvL1xyXG4gICAgc3RhcnQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAvLyDluLjnlKjnmoTlj5jph48v5pWw5o2uXHJcbiAgICAgICAgdmFyIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9EYXRhQmFzZScpO1xyXG4gICAgICAgIHRoaXMuZGF0YUJhc2UgPSBlbnQuZ2V0Q29tcG9uZW50KCdEYXRhQmFzZScpO1xyXG4gICAgICAgIC8vIOe7keWumuS6i+S7tlxyXG4gICAgICAgIHRoaXMuYnRuX2Nsb3NlLm9uQ2xpY2sgPSB0aGlzLl9vbkNsb3NlV2luZG93RXZlbnQuYmluZCh0aGlzKTtcclxuICAgICAgICAvL1xyXG4gICAgICAgIHRoaXMucGxhbkxpc3QgPSB7fTtcclxuICAgIH1cclxufSk7XHJcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnMTdiMDNuNXppdEg3cE02OG5kQjZZNzMnLCAnVGhyZWVNZW51TWdyJyk7XG4vLyBzY3JpcHRcXHZpbGxhXFxUaHJlZU1lbnVNZ3IuanNcblxuLy8g5LiJ57qn6I+c5Y2V566h55CG57G7XG52YXIgVGhyZWVNZW51TWdyID0gRmlyZS5DbGFzcyh7XG4gICAgLy8g57un5om/XG4gICAgZXh0ZW5kczogRmlyZS5Db21wb25lbnQsXG4gICAgLy8g5p6E6YCg5Ye95pWwXG4gICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8g5a625YW35LiA5qyh5pi+56S65aSa5bCR5pWw6YePXG4gICAgICAgIHRoaXMuX2Z1cm5pdHVyZVRvdGFsID0gNztcbiAgICAgICAgLy8g6I+c5Y2V5YiX6KGoXG4gICAgICAgIHRoaXMuX21lbnVMaXN0ID0gW107XG4gICAgICAgIC8vIOW9k+WJjemAieaLqeeahOexu+WeiyAxIOWNleWTgSAyIOWll+ijhSAzIOeJqeWTgeafnFxuICAgICAgICB0aGlzLl9jdXJUeXBlID0gMDtcbiAgICAgICAgLy8g5b2T5YmN6YCJ5oup54mp5ZOBSURcbiAgICAgICAgdGhpcy5fY3VySWQgPSAwO1xuICAgICAgICAvLyDmmK/lkKblj6/mi5bmi71cbiAgICAgICAgdGhpcy5faGFzRHJhZyA9IGZhbHNlO1xuICAgICAgICAvLyDlvZPliY3mnIDlpKfmlbDph49cbiAgICAgICAgdGhpcy5fY3VyVG90YWwgPSA3O1xuICAgICAgICAvLyDlvZPliY3pobXnrb5cbiAgICAgICAgdGhpcy5fY3VyUGFnZSA9IDE7XG4gICAgICAgIC8vIOacgOWkp+mhteetvlxuICAgICAgICB0aGlzLl9tYXhQYWdlID0gMTtcbiAgICAgICAgLy8g5Zu+54mH6L295YWl5Zue6LCDXG4gICAgICAgIHRoaXMuYmluZExvYWRNZW51SW1hZ2VDQiA9IHRoaXMubG9hZE1lbnVJbWFnZUNCLmJpbmQodGhpcyk7XG4gICAgICAgIC8vIOS4iuS4gOasoeijheaJrueahOWll+ijheaMiemSrlxuICAgICAgICB0aGlzLmxhc3RTdWl0TWVudSA9IG51bGw7XG4gICAgfSxcbiAgICAvLyDlsZ7mgKdcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIG1hcmdpbjogbmV3IEZpcmUuVmVjMigtMTA5MCwgMCksXG4gICAgICAgIC8vIOS4iee6p+iPnOWNleeahOagueiKgueCuVxuICAgICAgICByb290OiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5FbnRpdHlcbiAgICAgICAgfSxcbiAgICAgICAgLy8g6aG15pWwXG4gICAgICAgIHBhZ2VUZXh0OiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5UZXh0XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIOWIm+W7uuaIluiAheaYr+WIh+aNouadkOi0qFxuICAgIGNyZWF0ZU9yQ2hhbmdlRnVybml0dXJlOiBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgICAgIHZhciB0aHJlZU1lbnUgPSB0YXJnZXQuZ2V0Q29tcG9uZW50KCdUaHJlZU1lbnUnKTtcbiAgICAgICAgaWYgKHRocmVlTWVudS5oYXNVc2UpIHtcbiAgICAgICAgICAgIHRoaXMuZGF0YUJhc2UudGlwc1dpbmRvdy5vcGVuVGlwc1dpbmRvdygn5a+55LiN6LW377yM5b2T5YmN54mp5ZOB5bey5Zyo5oi/6Ze05Lit5L2/55SoJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGVudCwgZW50Q29tcDtcbiAgICAgICAgLy90aGlzLmRhdGFCYXNlLmxvYWRUaXBzLm9wZW5UaXBzKCfliJvlu7rlrrblhbfkuK3vvIzor7fnqI3lkI4uLi4nKTtcbiAgICAgICAgLy8g5aKZ5aOB5LiO5Zyw5p2/XG4gICAgICAgIGlmICghIHRocmVlTWVudS5oYXNEcmFnKSB7XG4gICAgICAgICAgICBpZiAodGhyZWVNZW51LnByb3BzX3R5cGUgPT09IDEpIHtcbiAgICAgICAgICAgICAgICBlbnRDb21wID0gdGhpcy5kYXRhQmFzZS5iYWNrZ3JvdW5kO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAodGhyZWVNZW51LnByb3BzX3R5cGUgPT09IDIpIHtcbiAgICAgICAgICAgICAgICBlbnRDb21wID0gdGhpcy5kYXRhQmFzZS5ncm91bmQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICAgICBlbnRDb21wLm1lbnVEYXRhID0gdGhyZWVNZW51O1xuICAgICAgICAgICAgZW50Q29tcC5zZXRGdXJuaXR1cmVEYXRhKHRocmVlTWVudSwgdHJ1ZSk7XG4gICAgICAgICAgICBzZWxmLmRhdGFCYXNlLmxvYWRUaXBzLm9wZW5UaXBzKCfliJvlu7rlm77niYfkuK3vvIzor7fnqI3lkI4uLi4nKTtcbiAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UubG9hZEltYWdlKGVudENvbXAuaW1hZ2VVcmwsIGZ1bmN0aW9uIChlcnJvciwgaW1hZ2UpIHtcbiAgICAgICAgICAgICAgICBzZWxmLmRhdGFCYXNlLmxvYWRUaXBzLmNsb3NlVGlwcygpO1xuICAgICAgICAgICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYmlnU3ByaXRlID0gbmV3IEZpcmUuU3ByaXRlKGltYWdlKTtcbiAgICAgICAgICAgICAgICBlbnRDb21wLnNldFNwcml0ZShiaWdTcHJpdGUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyDlrrblhbdcbiAgICAgICAgICAgIGVudCA9IEZpcmUuaW5zdGFudGlhdGUodGhpcy5kYXRhQmFzZS50ZW1wRnVybml0dXJlKTtcbiAgICAgICAgICAgIGVudC5hY3RpdmUgPSB0cnVlO1xuICAgICAgICAgICAgZW50LnBhcmVudCA9IHRoaXMuZGF0YUJhc2Uucm9vbTtcbiAgICAgICAgICAgIHZhciBwb3MgPSB0YXJnZXQudHJhbnNmb3JtLndvcmxkUG9zaXRpb247XG4gICAgICAgICAgICB2YXIgb2Zmc2V0ID0gTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogMTAwKTtcbiAgICAgICAgICAgIHBvcy54ICs9IG9mZnNldDtcbiAgICAgICAgICAgIHBvcy55ICs9IDQwMDtcbiAgICAgICAgICAgIGVudC50cmFuc2Zvcm0ucG9zaXRpb24gPSBuZXcgRmlyZS5WZWMyKHBvcy54LCBwb3MueSk7XG4gICAgICAgICAgICBlbnQudHJhbnNmb3JtLnNjYWxlID0gbmV3IEZpcmUuVmVjMigxLjgsIDEuOCk7XG4gICAgICAgICAgICBlbnQubmFtZSA9IHRocmVlTWVudS5wcm9wc19uYW1lO1xuICAgICAgICAgICAgZW50Q29tcCA9IGVudC5nZXRDb21wb25lbnQoJ0Z1cm5pdHVyZScpO1xuICAgICAgICAgICAgZW50Q29tcC5tZW51RGF0YSA9IHRocmVlTWVudTtcbiAgICAgICAgICAgIGVudENvbXAuc2V0RnVybml0dXJlRGF0YSh0aHJlZU1lbnUpO1xuICAgICAgICB9XG4gICAgICAgIC8vIOagh+iusOW3sue7j+S9v+eUqFxuICAgICAgICBpZiAodGhpcy5fY3VyVHlwZSA9PT0gMikge1xuICAgICAgICAgICAgdGhyZWVNZW51LnNldE1hcmtVc2UodHJ1ZSk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIOWIm+W7uuWQhOS4quexu+Wei+WutuWFt1xuICAgIF9vbkNyZWF0ZUZ1cm5pdHVyZUV2ZW50OiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ+WIm+W7uuWutuWFt0lEOicgKyBldmVudC50YXJnZXQucGFyZW50Lm5hbWUpO1xuICAgICAgICB0aGlzLmNyZWF0ZU9yQ2hhbmdlRnVybml0dXJlKGV2ZW50LnRhcmdldC5wYXJlbnQpO1xuICAgIH0sXG4gICAgLy8g5Yib5bu65aWX6KOF5Yiw5Zy65pmv5LitXG4gICAgX29uQ3JlYXRlU3VpdEl0ZW1FdmVudDogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIHZhciB0aHJlZU1lbnUgPSBldmVudC50YXJnZXQucGFyZW50LmdldENvbXBvbmVudCgnVGhyZWVNZW51Jyk7XG4gICAgICAgIGlmICh0aGlzLmxhc3RTdWl0TWVudeOAgCYmIHRoaXMubGFzdFN1aXRNZW51ICE9PSB0aHJlZU1lbnUpIHtcbiAgICAgICAgICAgIHRoaXMubGFzdFN1aXRNZW51LnNldE1hcmtVc2UoZmFsc2UpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aHJlZU1lbnUuaGFzVXNlKSB7XG4gICAgICAgICAgICB0aGlzLmRhdGFCYXNlLnRpcHNXaW5kb3cub3BlblRpcHNXaW5kb3coJ+WvueS4jei1t++8jOW9k+WJjeWll+ijheW3suWcqOaIv+mXtOS4reS9v+eUqCcpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgLy8g5Yig6Zmk5aWX6KOFXG4gICAgICAgIHNlbGYuZGF0YUJhc2UucmVtb3ZlU3VpdCgpO1xuICAgICAgICAvLyDph43mlrDotYvlgLzlpZfoo4VcbiAgICAgICAgc2VsZi5kYXRhQmFzZS5jdXJEcmVzc1N1aXQgPSB7XG4gICAgICAgICAgICAvLyDlpZfoo4VJRFxuICAgICAgICAgICAgc3VpdF9pZDogdGhyZWVNZW51LnN1aXRfaWQsXG4gICAgICAgICAgICAvLyDog4zljIVJRFxuICAgICAgICAgICAgcGFja19pZDogdGhyZWVNZW51LnBhY2tfaWQsXG4gICAgICAgICAgICAvLyDlpZfoo4XlsI/lm75cbiAgICAgICAgICAgIHN1aXRfaWNvbjogdGhyZWVNZW51LnNtYWxsU3ByaXRlLFxuICAgICAgICAgICAgLy8g5aWX6KOF5ZCN56ewXG4gICAgICAgICAgICBzdWl0X25hbWU6IHRocmVlTWVudS5zdWl0X25hbWUsXG4gICAgICAgICAgICAvLyDlpZfoo4XmnaXoh6rlk6rph4zvvIwxLuiDjOWMhSAyLuWVhuWfjlxuICAgICAgICAgICAgc3VpdF9mcm9tOiAxLFxuICAgICAgICAgICAgLy8g5aWX6KOF5Lu35qC8XG4gICAgICAgICAgICBwcmljZTogdGhyZWVNZW51LnByaWNlLFxuICAgICAgICAgICAgLy8g5oqY5omjXG4gICAgICAgICAgICBkaXNjb3VudDogdGhyZWVNZW51LmRpc2NvdW50LFxuICAgICAgICAgICAgLy8g5aWX6KOF5YiX6KGoXG4gICAgICAgICAgICBmdW5ybml0dXJlTGlzdDogW11cbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHRocmVlTWVudS5kcmVzc0xpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICBzZWxmLmRhdGFCYXNlLnRpcHNXaW5kb3cub3BlblRpcHNXaW5kb3coJ+i/meS4quS4gOS4quepuueahOWll+ijhS4uLicpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHNlbGYuZGF0YUJhc2UubG9hZFRpcHMub3BlblRpcHMoJ+WIm+W7uuWll+ijhe+8jOivt+eojeWQji4uLicpO1xuICAgICAgICBzZWxmLmRhdGFCYXNlLmNyZWF0ZUZ1cm5pdHVyZVRvU2NyZWVuKHRocmVlTWVudS5kcmVzc0xpc3QsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UubG9hZFRpcHMuY2xvc2VUaXBzKCk7XG4gICAgICAgICAgICAvLyDmoIforrDlt7Lnu4/kvb/nlKhcbiAgICAgICAgICAgIGlmIChzZWxmLl9jdXJUeXBlID09PSAyKSB7XG4gICAgICAgICAgICAgICAgdGhyZWVNZW51LnNldE1hcmtVc2UodHJ1ZSk7XG4gICAgICAgICAgICAgICAgc2VsZi5sYXN0U3VpdE1lbnUgPSB0aHJlZU1lbnU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgLy8g6YeN572u6I+c5Y2V5YiX6KGoXG4gICAgX3Jlc2V0TWVudTogZnVuY3Rpb24gKCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX21lbnVMaXN0Lmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICB2YXIgbWVudSA9IHRoaXMuX21lbnVMaXN0W2ldO1xuICAgICAgICAgICAgbWVudS5uYW1lID0gaS50b1N0cmluZygpO1xuICAgICAgICAgICAgbWVudS5yZXNldE1lbnUoKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy8g5Yib5bu66I+c5Y2V5oyJ6ZKu5bm25LiU57uR5a6a5LqL5Lu2IOaIluiAheWIt+aWsFxuICAgIF9yZWZyZXNoU2luZ2xlSXRlbXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8g6YeN572uXG4gICAgICAgIHRoaXMuX3Jlc2V0TWVudSgpO1xuICAgICAgICAvLyDlpoLmnpzmgLvmlbDph4/mnInmm7TmlrDlsLHph43mlrDorqHnrpfmnIDlpKfpobXmlbBcbiAgICAgICAgdmFyIHRvdGFsID0gdGhpcy5kYXRhQmFzZS5zaW5nbGVfVGhyZWVfVG90YWxfU2hlZXRzW3RoaXMuX2N1cklkXTtcbiAgICAgICAgaWYgKHRoaXMuX2N1clRvdGFsICE9PSB0b3RhbCkge1xuICAgICAgICAgICAgdGhpcy5fY3VyVG90YWwgPSB0b3RhbDtcbiAgICAgICAgICAgIHRoaXMuX21heFBhZ2UgPSBNYXRoLmNlaWwodGhpcy5fY3VyVG90YWwgLyB0aGlzLl9mdXJuaXR1cmVUb3RhbCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8g6LWL5YC85pWw5o2uXG4gICAgICAgIHZhciBpbmRleCA9IDA7XG4gICAgICAgIHZhciBzdGFydE51bSA9ICh0aGlzLl9jdXJQYWdlIC0gMSkgKiB0aGlzLl9mdXJuaXR1cmVUb3RhbDtcbiAgICAgICAgdmFyIGVuZE51bSA9IHN0YXJ0TnVtICsgdGhpcy5fZnVybml0dXJlVG90YWw7XG4gICAgICAgIGlmIChlbmROdW0gPiB0aGlzLl9jdXJUb3RhbCkge1xuICAgICAgICAgICAgZW5kTnVtID0gdGhpcy5fY3VyVG90YWw7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGJpbmRFdmVudCA9IHRoaXMuX29uQ3JlYXRlRnVybml0dXJlRXZlbnQuYmluZCh0aGlzKTtcbiAgICAgICAgdmFyIGRhdGFTaGVldHMgPSB0aGlzLmRhdGFCYXNlLnNpbmdsZV9UaHJlZV9EYXRhU2hlZXRzW3RoaXMuX2N1cklkXTtcblxuICAgICAgICBmb3IodmFyIGkgPSBzdGFydE51bTsgaSA8IGVuZE51bTsgKytpKSB7XG4gICAgICAgICAgICB2YXIgbWVudSA9IHRoaXMuX21lbnVMaXN0W2luZGV4XTtcbiAgICAgICAgICAgIG1lbnUuZW50aXR5LmFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICB2YXIgbWVudURhdGEgPSBkYXRhU2hlZXRzW2ldO1xuICAgICAgICAgICAgaWYgKCFtZW51RGF0YSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbWVudURhdGEucHJvcHNfdHlwZSA9IHRoaXMuX2N1cklkO1xuICAgICAgICAgICAgbWVudURhdGEuaGFzRHJhZyA9IHRoaXMuX2hhc0RyYWc7XG4gICAgICAgICAgICBtZW51LmVudGl0eS50cmFuc2Zvcm0ucG9zaXRpb24gPSBuZXcgRmlyZS5WZWMyKC00OTAgKyAoaW5kZXggKiAxNjApLCA1NSk7XG4gICAgICAgICAgICBtZW51LnJlZnJlc2gobWVudURhdGEsIGJpbmRFdmVudCk7XG4gICAgICAgICAgICBpbmRleCsrO1xuICAgICAgICB9XG4gICAgICAgIC8vIOWIt+aWsOaMiemSrueKtuaAgVxuICAgICAgICB0aGlzLl9yZWZyZXNoQnRuU3RhdGUoKTtcbiAgICB9LFxuICAgIC8vIOiuvue9ruS9v+eUqOagh+iusFxuICAgIHNldE1hcmtVc2U6IGZ1bmN0aW9uIChtZW51RGF0YSwgbWVudSkge1xuICAgICAgICBpZiAodGhpcy5fY3VySWQgPT09IDApIHtcbiAgICAgICAgICAgIHZhciBjaGlsZHJlbiA9IHRoaXMuZGF0YUJhc2Uucm9vbS5nZXRDaGlsZHJlbigpO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgICAgIHZhciBlbnQgPSBjaGlsZHJlbltpXTtcbiAgICAgICAgICAgICAgICB2YXIgZnVybml0dXJlID0gZW50LmdldENvbXBvbmVudCgnRnVybml0dXJlJyk7XG4gICAgICAgICAgICAgICAgaWYgKG1lbnVEYXRhLnByb3BzX2lkID09PSBmdXJuaXR1cmUucHJvcHNfaWQgJiZcbiAgICAgICAgICAgICAgICAgICAgZnVybml0dXJlLnBhY2tfaWQgPT09IG1lbnVEYXRhLnBhY2tfaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgbWVudS5zZXRNYXJrVXNlKHRydWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmIChwYXJzZUludChtZW51RGF0YS5zdWl0X2lkKSA9PT0gdGhpcy5kYXRhQmFzZS5jdXJEcmVzc1N1aXQuc3VpdF9pZCkge1xuICAgICAgICAgICAgICAgIG1lbnUuc2V0TWFya1VzZSh0cnVlKTtcbiAgICAgICAgICAgICAgICBpZighIHRoaXMubGFzdFN1aXRNZW51KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGFzdFN1aXRNZW51ID0gbWVudTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIOeJqeWTgeafnCAwOiDljZXlk4EgMe+8muWll+ijhVxuICAgIF9yZWZyZXNoQmFja3BhY2tJdGVtczogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyDph43nva5cbiAgICAgICAgdGhpcy5fcmVzZXRNZW51KCk7XG4gICAgICAgIHZhciBzaG93VG90YWwgPSB0aGlzLl9mdXJuaXR1cmVUb3RhbDtcbiAgICAgICAgaWYgKHRoaXMuX2N1cklkID09PSAxKSB7XG4gICAgICAgICAgICAvLyDlpZfoo4XmmL7npLrnmoTmlbDph49cbiAgICAgICAgICAgIHNob3dUb3RhbCA9IDU7XG4gICAgICAgIH1cbiAgICAgICAgLy8g5aaC5p6c5oC75pWw6YeP5pyJ5pu05paw5bCx6YeN5paw6K6h566X5pyA5aSn6aG15pWwXG4gICAgICAgIHZhciB0b3RhbCA9IHRoaXMuZGF0YUJhc2UuYmFja3BhY2tfVGhyZWVfVG90YWxfU2hlZXRzW3RoaXMuX2N1cklkXTtcbiAgICAgICAgaWYgKHRoaXMuX2N1clRvdGFsICE9PSB0b3RhbCkge1xuICAgICAgICAgICAgdGhpcy5fY3VyVG90YWwgPSB0b3RhbDtcbiAgICAgICAgICAgIHZhciBtYXhQYWdlID0gTWF0aC5jZWlsKHRoaXMuX2N1clRvdGFsIC8gc2hvd1RvdGFsKTtcbiAgICAgICAgICAgIHRoaXMuX21heFBhZ2UgPSBtYXhQYWdlID09PSAwID8gMSA6IG1heFBhZ2U7XG4gICAgICAgIH1cbiAgICAgICAgLy8g6LWL5YC85pWw5o2uXG4gICAgICAgIHZhciBpbmRleCA9IDA7XG4gICAgICAgIHZhciBzdGFydE51bSA9ICh0aGlzLl9jdXJQYWdlIC0gMSkgKiBzaG93VG90YWw7XG4gICAgICAgIHZhciBlbmROdW0gPSBzdGFydE51bSArIHNob3dUb3RhbDtcbiAgICAgICAgaWYgKGVuZE51bSA+IHRoaXMuX2N1clRvdGFsKSB7XG4gICAgICAgICAgICBlbmROdW0gPSB0aGlzLl9jdXJUb3RhbDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgYmluZEV2ZW50ID0gbnVsbDtcbiAgICAgICAgaWYgKHRoaXMuX2N1cklkID09PSAwKSB7XG4gICAgICAgICAgICAvLyDliJvlu7rljZXlk4HlrrblhbfliLDlnLrmma/kuK1cbiAgICAgICAgICAgIGJpbmRFdmVudCA9IHRoaXMuX29uQ3JlYXRlRnVybml0dXJlRXZlbnQuYmluZCh0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIOWIm+W7uuWll+ijheWutuWFt+WIsOWcuuaZr+S4rVxuICAgICAgICAgICAgYmluZEV2ZW50ID0gdGhpcy5fb25DcmVhdGVTdWl0SXRlbUV2ZW50LmJpbmQodGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGRhdGFTaGVldHMgPSB0aGlzLmRhdGFCYXNlLmJhY2twYWNrX1RocmVlX0RhdGFTaGVldHNbdGhpcy5fY3VySWRdO1xuICAgICAgICBmb3IodmFyIGkgPSBzdGFydE51bTsgaSA8IGVuZE51bTsgKytpKSB7XG4gICAgICAgICAgICB2YXIgbWVudSA9IHRoaXMuX21lbnVMaXN0W2luZGV4XTtcbiAgICAgICAgICAgIGlmICh0aGlzLl9jdXJJZCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIG1lbnUuZW50aXR5LnRyYW5zZm9ybS5wb3NpdGlvbiA9IG5ldyBGaXJlLlZlYzIoLTUwMCArIChpbmRleCAqIDE2MCksIDU1KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIG1lbnUuZW50aXR5LnRyYW5zZm9ybS5wb3NpdGlvbiA9IG5ldyBGaXJlLlZlYzIoLTQ5MCArIChpbmRleCAqIDI1MCksIDIwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG1lbnUuZW50aXR5LmFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICBpbmRleCsrO1xuICAgICAgICAgICAgdmFyIG1lbnVEYXRhID0gZGF0YVNoZWV0c1tpXTtcbiAgICAgICAgICAgIGlmICghbWVudURhdGEpIHtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIOWIpOaWreeJqeWTgeafnOiPnOWNleeahOaYvuekuumXrumimFxuICAgICAgICAgICAgdGhpcy5zZXRNYXJrVXNlKG1lbnVEYXRhLCBtZW51KTtcbiAgICAgICAgICAgIG1lbnUucmVmcmVzaChtZW51RGF0YSwgYmluZEV2ZW50KTtcbiAgICAgICAgfVxuICAgICAgICAvLyDliLfmlrDmjInpkq7nirbmgIFcbiAgICAgICAgdGhpcy5fcmVmcmVzaEJ0blN0YXRlKCk7XG4gICAgfSxcbiAgICAvLyDliJvlu7roj5zljZXlrrnlmahcbiAgICBfY3JlYXRlTWVudUVudDogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgdGVtcEZ1cm5pdHVyZSA9IHRoaXMuZGF0YUJhc2UudGVtcFN1YlRocmVlTWVudTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9mdXJuaXR1cmVUb3RhbDsgKytpKSB7XG4gICAgICAgICAgICB2YXIgZW50ID0gRmlyZS5pbnN0YW50aWF0ZSh0ZW1wRnVybml0dXJlKTtcbiAgICAgICAgICAgIGVudC5uYW1lID0gaS50b1N0cmluZygpO1xuICAgICAgICAgICAgZW50LnBhcmVudCA9IHRoaXMucm9vdDtcbiAgICAgICAgICAgIGVudC50cmFuc2Zvcm0ucG9zaXRpb24gPSBuZXcgRmlyZS5WZWMyKC01MDAgKyAoaSAqIDE2MCksIDU1KTtcbiAgICAgICAgICAgIHZhciBtZW51ID0gZW50LmdldENvbXBvbmVudCgnVGhyZWVNZW51Jyk7XG4gICAgICAgICAgICBtZW51LmluaXQoKTtcbiAgICAgICAgICAgIC8vIOWtmOWCqOWvueixoVxuICAgICAgICAgICAgdGhpcy5fbWVudUxpc3QucHVzaChtZW51KTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy8g5r+A5rS76I+c5Y2V5pe26Kem5Y+R55qE5LqL5Lu2XG4gICAgLy8gaWQ6IOmCo+S4quexu+Wei+eJqeWTgeeahElEXG4gICAgLy8gdHlwZTogMCDljZXlk4EgMSDlpZfoo4UgMiDnianlk4Hmn5xcbiAgICBvcGVuTWVudTogZnVuY3Rpb24gKGlkLCB0eXBlLCBoYXNEcmFnKSB7XG4gICAgICAgIHRoaXMuX2N1clR5cGUgPSB0eXBlO1xuICAgICAgICB0aGlzLl9jdXJJZCA9IGlkO1xuICAgICAgICB0aGlzLl9oYXNEcmFnID0gaGFzRHJhZztcbiAgICAgICAgLy8g6I635Y+W6I+c5Y2V5oyJ6ZKu5bm25LiU57uR5a6a5LqL5Lu2XG4gICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgIHRoaXMuX3JlZnJlc2hTaW5nbGVJdGVtcygpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgIHRoaXMuX3JlZnJlc2hCYWNrcGFja0l0ZW1zKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgLy8g5pi+56S65b2T5YmN56qX5Y+jXG4gICAgICAgIHRoaXMuZW50aXR5LmFjdGl2ZSA9IHRydWU7XG4gICAgfSxcbiAgICAvLyDkuIrkuIDpobVcbiAgICBfb25QcmV2aW91c0V2ZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuX2N1clBhZ2UgLT0gMTtcbiAgICAgICAgaWYgKHRoaXMuX2N1clBhZ2UgPCAxKXtcbiAgICAgICAgICAgIHRoaXMuX2N1clBhZ2UgPSAxO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLl9jdXJUeXBlID09PSAwKSB7XG4gICAgICAgICAgICB0aGlzLl9yZWZyZXNoU2luZ2xlSXRlbXMoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0aGlzLl9jdXJUeXBlID09PSAyKSB7XG4gICAgICAgICAgICB0aGlzLl9yZWZyZXNoQmFja3BhY2tJdGVtcygpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyDkuIvkuIDpobVcbiAgICBfb25OZXh0RXZlbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5fY3VyUGFnZSArPSAxO1xuICAgICAgICBpZiAodGhpcy5fY3VyUGFnZSA+IHRoaXMuX21heFBhZ2Upe1xuICAgICAgICAgICAgdGhpcy5fY3VyUGFnZSA9IHRoaXMuX21heFBhZ2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuX2N1clR5cGUgPT09IDApIHtcbiAgICAgICAgICAgIHRoaXMuX3JlZnJlc2hTaW5nbGVJdGVtcygpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHRoaXMuX2N1clR5cGUgPT09IDIpIHtcbiAgICAgICAgICAgIHRoaXMuX3JlZnJlc2hCYWNrcGFja0l0ZW1zKCk7XG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIOi/lOWbnuS4iuS4gOe6p+iPnOWNlVxuICAgIF9vblJldHVybkV2ZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuX2N1cklkID0gMDtcbiAgICAgICAgdGhpcy5fY3VyUGFnZSA9IDE7XG4gICAgICAgIHRoaXMuZW50aXR5LmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLmRhdGFCYXNlLnNlY29uZE1lbnVNZ3Iub3Blbk1lbnUodGhpcy5fY3VyVHlwZSk7XG4gICAgfSxcbiAgICAvLyDlhbPpl63oj5zljZVcbiAgICBjbG9zZU1lbnU6IGZ1bmN0aW9uIChoYXNNb2RpZnlUb2dnbGUpIHtcbiAgICAgICAgdGhpcy5fY3VySWQgPSAwO1xuICAgICAgICB0aGlzLl9jdXJQYWdlID0gMTtcbiAgICAgICAgdGhpcy5lbnRpdHkuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgIGlmIChoYXNNb2RpZnlUb2dnbGUpIHtcbiAgICAgICAgICAgIHRoaXMuZGF0YUJhc2UuZmlyc3RNZW51TWdyLm1vZGlmeVRvZ2dsZSgpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyDlhbPpl63lvZPliY3oj5zljZVcbiAgICBfb25DbG9zZU1lbnU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5jbG9zZU1lbnUodHJ1ZSk7XG4gICAgfSxcbiAgICAvLyDliLfmlrDmjInpkq7nirbmgIFcbiAgICBfcmVmcmVzaEJ0blN0YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuYnRuX0xlZnQuYWN0aXZlID0gdGhpcy5fY3VyUGFnZSA+IDE7XG4gICAgICAgIHRoaXMuYnRuX1JpZ2h0LmFjdGl2ZSA9IHRoaXMuX2N1clBhZ2UgPCB0aGlzLl9tYXhQYWdlO1xuICAgICAgICB0aGlzLnBhZ2VUZXh0LnRleHQgPSAn6aG15pWwOicgKyB0aGlzLl9jdXJQYWdlICsgXCIvXCIgKyB0aGlzLl9tYXhQYWdlO1xuICAgIH0sXG4gICAgLy8g5byA5aeLXG4gICAgc3RhcnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8g5bi455So55qE5Y+Y6YePL+aVsOaNrlxuICAgICAgICB2YXIgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL0RhdGFCYXNlJyk7XG4gICAgICAgIHRoaXMuZGF0YUJhc2UgPSBlbnQuZ2V0Q29tcG9uZW50KCdEYXRhQmFzZScpO1xuICAgICAgICAvLyDojrflj5blhbPpl63mjInpkq7lubbnu5Hlrprkuovku7ZcbiAgICAgICAgZW50ID0gdGhpcy5lbnRpdHkuZmluZCgnYnRuX2Nsb3NlJyk7XG4gICAgICAgIHZhciBidG5DbG9zZSA9IGVudC5nZXRDb21wb25lbnQoJ1VJQnV0dG9uJyk7XG4gICAgICAgIGJ0bkNsb3NlLm9uQ2xpY2sgPSB0aGlzLl9vbkNsb3NlTWVudS5iaW5kKHRoaXMpO1xuICAgICAgICAvLyDov5Tlm57kuIrkuIDnuqfoj5zljZVcbiAgICAgICAgZW50ID0gdGhpcy5lbnRpdHkuZmluZCgnYnRuX3JldHVybicpO1xuICAgICAgICB2YXIgYnRuUmV0dXJuID0gZW50LmdldENvbXBvbmVudCgnVUlCdXR0b24nKTtcbiAgICAgICAgYnRuUmV0dXJuLm9uQ2xpY2sgPSB0aGlzLl9vblJldHVybkV2ZW50LmJpbmQodGhpcyk7XG4gICAgICAgIC8vIOS4iuS4gOmhtVxuICAgICAgICB0aGlzLmJ0bl9MZWZ0ID0gdGhpcy5lbnRpdHkuZmluZCgnYnRuX2xlZnQnKTtcbiAgICAgICAgdmFyIGJ0bkxlZnQgPSB0aGlzLmJ0bl9MZWZ0LmdldENvbXBvbmVudCgnVUlCdXR0b24nKTtcbiAgICAgICAgYnRuTGVmdC5vbkNsaWNrID0gdGhpcy5fb25QcmV2aW91c0V2ZW50LmJpbmQodGhpcyk7XG4gICAgICAgIC8vIOS4i+S4gOmhtVxuICAgICAgICB0aGlzLmJ0bl9SaWdodCA9IHRoaXMuZW50aXR5LmZpbmQoJ2J0bl9yaWdodCcpO1xuICAgICAgICB2YXIgYnRuUmlnaHQgPSB0aGlzLmJ0bl9SaWdodC5nZXRDb21wb25lbnQoJ1VJQnV0dG9uJyk7XG4gICAgICAgIGJ0blJpZ2h0Lm9uQ2xpY2sgPSB0aGlzLl9vbk5leHRFdmVudC5iaW5kKHRoaXMpO1xuICAgICAgICAvL1xuICAgICAgICB0aGlzLmJ0bl9MZWZ0LmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICB0aGlzLmJ0bl9SaWdodC5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgLy9cbiAgICAgICAgdGhpcy5fY3JlYXRlTWVudUVudCgpO1xuICAgICAgICAvLyDpooTliqDovb0gVGhyZWUgU3ViIE1lbnVcbiAgICAgICAgdGhpcy5kYXRhQmFzZS5wcmVsb2FkU2luYWdsZUl0ZW1zRGF0YV9UaHJlZSgxLCB0aGlzLl9jdXJQYWdlLCB0aGlzLl9mdXJuaXR1cmVUb3RhbCwgdGhpcy5iaW5kTG9hZE1lbnVJbWFnZUNCKTtcbiAgICAgICAgdGhpcy5kYXRhQmFzZS5wcmVsb2FkU2luYWdsZUl0ZW1zRGF0YV9UaHJlZSgyLCB0aGlzLl9jdXJQYWdlLCB0aGlzLl9mdXJuaXR1cmVUb3RhbCwgdGhpcy5iaW5kTG9hZE1lbnVJbWFnZUNCKTtcbiAgICAgICAgdGhpcy5kYXRhQmFzZS5wcmVsb2FkU2luYWdsZUl0ZW1zRGF0YV9UaHJlZSgzLCB0aGlzLl9jdXJQYWdlLCB0aGlzLl9mdXJuaXR1cmVUb3RhbCwgdGhpcy5iaW5kTG9hZE1lbnVJbWFnZUNCKTtcbiAgICAgICAgdGhpcy5kYXRhQmFzZS5wcmVsb2FkU2luYWdsZUl0ZW1zRGF0YV9UaHJlZSg0LCB0aGlzLl9jdXJQYWdlLCB0aGlzLl9mdXJuaXR1cmVUb3RhbCwgdGhpcy5iaW5kTG9hZE1lbnVJbWFnZUNCKTtcbiAgICAgICAgdGhpcy5kYXRhQmFzZS5wcmVsb2FkU2luYWdsZUl0ZW1zRGF0YV9UaHJlZSg1LCB0aGlzLl9jdXJQYWdlLCB0aGlzLl9mdXJuaXR1cmVUb3RhbCwgdGhpcy5iaW5kTG9hZE1lbnVJbWFnZUNCKTtcbiAgICAgICAgdGhpcy5kYXRhQmFzZS5wcmVsb2FkU2luYWdsZUl0ZW1zRGF0YV9UaHJlZSg2LCB0aGlzLl9jdXJQYWdlLCB0aGlzLl9mdXJuaXR1cmVUb3RhbCwgdGhpcy5iaW5kTG9hZE1lbnVJbWFnZUNCKTtcbiAgICAgICAgdGhpcy5kYXRhQmFzZS5wcmVsb2FkU2luYWdsZUl0ZW1zRGF0YV9UaHJlZSg3LCB0aGlzLl9jdXJQYWdlLCB0aGlzLl9mdXJuaXR1cmVUb3RhbCwgdGhpcy5iaW5kTG9hZE1lbnVJbWFnZUNCKTtcbiAgICAgICAgdGhpcy5kYXRhQmFzZS5wcmVsb2FkU2luYWdsZUl0ZW1zRGF0YV9UaHJlZSg4LCB0aGlzLl9jdXJQYWdlLCB0aGlzLl9mdXJuaXR1cmVUb3RhbCwgdGhpcy5iaW5kTG9hZE1lbnVJbWFnZUNCKTtcbiAgICB9LFxuICAgIC8vIOWbvueJh+i9veWFpeWujOavleS7peWQjueahOWbnuiwg1xuICAgIGxvYWRNZW51SW1hZ2VDQjogZnVuY3Rpb24gKGlkLCBpbmRleCwgcGFnZSwgbWVudURhdGEpIHtcbiAgICAgICAgaWYgKHRoaXMuX2N1cklkID09PSBpZCAmJiB0aGlzLl9jdXJQYWdlID09PSBwYWdlKSB7XG4gICAgICAgICAgICB2YXIgbWVudSA9IHRoaXMuX21lbnVMaXN0W2luZGV4XTtcbiAgICAgICAgICAgIGlmIChtZW51KSB7XG4gICAgICAgICAgICAgICAgbWVudS5yZWZyZXNoKG1lbnVEYXRhLCB0aGlzLl9vbkNyZWF0ZUZ1cm5pdHVyZUV2ZW50LmJpbmQodGhpcykpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICB1cGRhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8g5Yy56YWNVUnliIbovqjnjodcbiAgICAgICAgLy92YXIgY2FtZXJhID0gRmlyZS5DYW1lcmEubWFpbjtcbiAgICAgICAgLy92YXIgYmdXb3JsZEJvdW5kcyA9IHRoaXMuZGF0YUJhc2UuYmdSZW5kZXIuZ2V0V29ybGRCb3VuZHMoKTtcbiAgICAgICAgLy92YXIgYmdMZWZ0VG9wV29ybGRQb3MgPSBuZXcgRmlyZS5WZWMyKGJnV29ybGRCb3VuZHMueE1pbiwgYmdXb3JsZEJvdW5kcy55TWluKTtcbiAgICAgICAgLy92YXIgYmdsZWZ0VG9wID0gY2FtZXJhLndvcmxkVG9TY3JlZW4oYmdMZWZ0VG9wV29ybGRQb3MpO1xuICAgICAgICAvL3ZhciBzY3JlZW5Qb3MgPSBuZXcgRmlyZS5WZWMyKGJnbGVmdFRvcC54LCBiZ2xlZnRUb3AueSk7XG4gICAgICAgIC8vdmFyIHdvcmxkUG9zID0gY2FtZXJhLnNjcmVlblRvV29ybGQoc2NyZWVuUG9zKTtcbiAgICAgICAgLy90aGlzLmVudGl0eS50cmFuc2Zvcm0ud29ybGRQb3NpdGlvbiA9IHdvcmxkUG9zO1xuICAgICAgICAvLyDljLnphY1VSeWIhui+qOeOh1xuICAgICAgICB2YXIgY2FtZXJhID0gRmlyZS5DYW1lcmEubWFpbjtcbiAgICAgICAgdmFyIHNjcmVlblNpemUgPSBGaXJlLlNjcmVlbi5zaXplLm11bChjYW1lcmEuc2l6ZSAvIEZpcmUuU2NyZWVuLmhlaWdodCk7XG4gICAgICAgIHZhciBuZXdQb3MgPSBGaXJlLnYyKHRoaXMubWFyZ2luLngsIC1zY3JlZW5TaXplLnkgLyAyICsgdGhpcy5tYXJnaW4ueSk7XG4gICAgICAgIHRoaXMuZW50aXR5LnRyYW5zZm9ybS5wb3NpdGlvbiA9IG5ld1BvcztcbiAgICB9XG59KTtcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnMWYxNGV5VkwveExBYURxV2RmaHljRGUnLCAnVGhyZWVNZW51Jyk7XG4vLyBzY3JpcHRcXHZpbGxhXFxUaHJlZU1lbnUuanNcblxudmFyIFRocmVlTWVudSA9IEZpcmUuQ2xhc3Moe1xuICAgIC8vIOe7p+aJv1xuICAgIGV4dGVuZHM6IEZpcmUuQ29tcG9uZW50LFxuICAgIC8vIOaehOmAoOWHveaVsFxuICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuX2J0bk1lbnUgPSBudWxsO1xuICAgICAgICB0aGlzLl9wcmljZVRleHQgPSBudWxsO1xuICAgICAgICB0aGlzLnNtYWxsU3ByaXRlID0gbnVsbDtcbiAgICAgICAgLy8g5aaC5p6c5piv5aWX6KOF55qE6K+d5bCx5pyJ5a625YW35YiX6KGoXG4gICAgICAgIHRoaXMuZHJlc3NMaXN0ID0gW107XG4gICAgfSxcbiAgICAvLyDlsZ7mgKdcbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIHByb3BzX25hbWU6ICcnLFxuICAgICAgICAvLyDnianlk4FJRFxuICAgICAgICBwcm9wc19pZDogMCxcbiAgICAgICAgLy8g54mp5ZOBVUlEXG4gICAgICAgIHByb3BzX3VpZDogMCxcbiAgICAgICAgLy8g5aWX6KOFSURcbiAgICAgICAgc3VpdF9pZDogMCxcbiAgICAgICAgLy8g5aWX6KOF5ZCN56ewXG4gICAgICAgIHN1aXRfbmFtZTogJycsXG4gICAgICAgIC8vIOiDjOWMhUlEXG4gICAgICAgIHBhY2tfaWQ6IDAsXG4gICAgICAgIC8vIOexu+WIq1xuICAgICAgICBwcm9wc190eXBlOiAwLFxuICAgICAgICAvLyDku7fmoLxcbiAgICAgICAgcHJpY2U6IDAsXG4gICAgICAgIC8vIOaKmOaJo1xuICAgICAgICBkaXNjb3VudDogMCxcbiAgICAgICAgLy8g5aSn5Zu+VXJsXG4gICAgICAgIGJpZ0ltYWdlVXJsOiAnJyxcbiAgICAgICAgLy8g5piv5ZCm5Y+v5Lul5ouW5Yqo77yI5L6L5aaC5aOB57q45LiO5Zyw6Z2i5peg5rOV5ouW5Yqo77yJXG4gICAgICAgIGhhc0RyYWc6IGZhbHNlLFxuICAgICAgICAvLyDmmK/lkKbmnInkvb/nlKjov4dcbiAgICAgICAgaGFzVXNlOiBmYWxzZSxcbiAgICAgICAgLy8g6L295YWl5pe255qE5Zu+54mHXG4gICAgICAgIGRlZmF1bHRTcHJpdGU6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlNwcml0ZVxuICAgICAgICB9LFxuICAgICAgICBkZWZhdWx0TG9hZEFuaW06IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLkFuaW1hdGlvblxuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyDph43nva7lrrblhbdcbiAgICByZXNldE1lbnU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5fYnRuTWVudS5zZXRUZXh0KCfovb3lhaXkuK0nKTtcbiAgICAgICAgdGhpcy5fYnRuTWVudS5zZXRTcHJpdGUodGhpcy5kZWZhdWx0U3ByaXRlKTtcbiAgICAgICAgdGhpcy5fYnRuTWVudS5vbkNsaWNrID0gbnVsbDtcbiAgICAgICAgdGhpcy5lbnRpdHkubmFtZSA9ICfmsqHotYvlgLwnO1xuICAgICAgICB0aGlzLnByb3BzX2lkID0gMDtcbiAgICAgICAgdGhpcy5wcm9wc191aWQgPSAwO1xuICAgICAgICB0aGlzLnN1aXRfaWQgPSAwO1xuICAgICAgICB0aGlzLnBhY2tfaWQgPSAwO1xuICAgICAgICB0aGlzLnN1aXRfbmFtZSA9ICcnO1xuICAgICAgICB0aGlzLnByb3BzX3R5cGUgPSAwO1xuICAgICAgICB0aGlzLmJpZ0ltYWdlVXJsID0gJ+ayoeacieW+l+WIsOWkp+WbvlVSTCc7XG4gICAgICAgIHRoaXMuaGFzRHJhZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLnNldE1hcmtVc2UoZmFsc2UpO1xuICAgICAgICB0aGlzLnNldFRleHQoJycpO1xuICAgICAgICB0aGlzLnNldFByaWNlKDApO1xuICAgICAgICB0aGlzLnNtYWxsU3ByaXRlID0gbnVsbDtcbiAgICAgICAgdGhpcy5kcmVzc0xpc3QgPSBbXTtcbiAgICAgICAgdGhpcy5lbnRpdHkuYWN0aXZlID0gZmFsc2U7XG4gICAgfSxcbiAgICAvLyDorr7nva7mloflrZdcbiAgICBzZXRUZXh0OiBmdW5jdGlvbiAodGV4dCkge1xuICAgICAgICB0aGlzLl9idG5NZW51LnNldFRleHQodGV4dCk7XG4gICAgfSxcbiAgICAvLyDorr7nva7ku7fmoLxcbiAgICBzZXRQcmljZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHRoaXMucHJpY2UgPSAhdmFsdWUgPyAwIDogdmFsdWU7XG4gICAgICAgIHRoaXMuX3ByaWNlVGV4dC5lbnRpdHkuYWN0aXZlID0gdGhpcy5wcmljZSAhPT0gMDtcbiAgICAgICAgdGhpcy5fcHJpY2VUZXh0LnRleHQgPSB2YWx1ZTtcbiAgICB9LFxuICAgIC8vIOiuvue9ruWbvueJh1xuICAgIHNldFNwcml0ZTogZnVuY3Rpb24gKHNtYWxsU3ByaXRlLCBldmVudCkge1xuICAgICAgICBpZiAoISBzbWFsbFNwcml0ZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc21hbGxTcHJpdGUgPSBzbWFsbFNwcml0ZTtcblxuICAgICAgICB0aGlzLl9idG5NZW51LnNldFNwcml0ZShzbWFsbFNwcml0ZSk7XG4gICAgICAgIGlmIChzbWFsbFNwcml0ZS53aWR0aCA+IDExMCB8fCBzbWFsbFNwcml0ZS5oZWlnaHQgPiAxMjApIHtcbiAgICAgICAgICAgIHRoaXMuX2J0bk1lbnUuYnRuUmVuZGVyLnVzZUN1c3RvbVNpemUgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5fYnRuTWVudS5idG5SZW5kZXIuY3VzdG9tV2lkdGggPSAxMTA7XG4gICAgICAgICAgICB0aGlzLl9idG5NZW51LmJ0blJlbmRlci5jdXN0b21IZWlnaHQgPSAxMjA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGV2ZW50KSB7XG4gICAgICAgICAgICB0aGlzLl9idG5NZW51Lm9uQ2xpY2sgPSBldmVudDtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy8g5qCH6K6w5bey5L2/55SoXG4gICAgc2V0TWFya1VzZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuaGFzVXNlID0gdmFsdWU7XG4gICAgICAgIHRoaXMuX2J0bk1lbnUuc2V0RGlzYWJsZWQodmFsdWUpO1xuICAgIH0sXG4gICAgLy8g5byA5aeL5pe2XG4gICAgaW5pdDogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyDluLjnlKjnmoTlj5jph48v5pWw5o2uXG4gICAgICAgIHZhciBlbnQgPSBGaXJlLkVudGl0eS5maW5kKCcvRGF0YUJhc2UnKTtcbiAgICAgICAgdGhpcy5kYXRhQmFzZSA9IGVudC5nZXRDb21wb25lbnQoJ0RhdGFCYXNlJyk7XG4gICAgICAgIGlmICghIHRoaXMuX2J0bk1lbnUpIHtcbiAgICAgICAgICAgIGVudCA9IHRoaXMuZW50aXR5LmZpbmQoJ2J0bl9NZW51Jyk7XG4gICAgICAgICAgICB0aGlzLl9idG5NZW51ID0gZW50LmdldENvbXBvbmVudCgnVUlCdXR0b24nKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoISB0aGlzLl9wcmljZVRleHQpIHtcbiAgICAgICAgICAgIGVudCA9IHRoaXMuZW50aXR5LmZpbmQoJ3ByaWNlJyk7XG4gICAgICAgICAgICB0aGlzLl9wcmljZVRleHQgPSBlbnQuZ2V0Q29tcG9uZW50KEZpcmUuVGV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgLy9cbiAgICAgICAgdmFyIHN0YXRlID0gdGhpcy5kZWZhdWx0TG9hZEFuaW0ucGxheSgnbG9hZGluZycpO1xuICAgICAgICBzdGF0ZS53cmFwTW9kZSA9IEZpcmUuV3JhcE1vZGUuTG9vcDtcbiAgICAgICAgc3RhdGUucmVwZWF0Q291bnQgPSBJbmZpbml0eTtcbiAgICAgICAgLy9cbiAgICAgICAgdGhpcy5yZXNldE1lbnUoKTtcbiAgICB9LFxuICAgIC8vIOWIt+aWsOW3suS4i+i9vei/h+WQjueahOaVsOaNrlxuICAgIHJlZnJlc2g6IGZ1bmN0aW9uIChkYXRhLCBiaW5kRXZlbnQpIHtcbiAgICAgICAgdGhpcy5lbnRpdHkubmFtZSA9IGRhdGEucHJvcHNfaWQgfHwgMDtcbiAgICAgICAgdGhpcy5wcm9wc19pZCA9IGRhdGEucHJvcHNfaWQgfHwgMDtcbiAgICAgICAgdGhpcy5wcm9wc191aWQgPSBkYXRhLnByb2RfdWlkIHx8IDA7XG4gICAgICAgIHRoaXMucGFja19pZCA9IGRhdGEucGFja19pZCB8fCAwO1xuICAgICAgICB0aGlzLnByb3BzX3R5cGUgPSBwYXJzZUludChkYXRhLnByb3BzX3R5cGUpIHx8IDA7XG4gICAgICAgIHRoaXMuZGlzY291bnQgPSBkYXRhLmRpc2NvdW50IHx8IDE7XG4gICAgICAgIHRoaXMuaGFzRHJhZyA9IGRhdGEuaGFzRHJhZyB8fCBmYWxzZTtcbiAgICAgICAgdGhpcy5zdWl0X2lkID0gcGFyc2VJbnQoZGF0YS5zdWl0X2lkIHx8IDApO1xuICAgICAgICB0aGlzLnN1aXRfbmFtZSA9IGRhdGEuc3VpdF9uYW1lIHx8ICcnO1xuICAgICAgICB0aGlzLnByb3BzX25hbWUgPSBkYXRhLnByb3BzX25hbWUgfHwgJyc7XG4gICAgICAgIHRoaXMuc2V0VGV4dChkYXRhLnByb3BzX25hbWUgfHwgZGF0YS5zdWl0X25hbWUpO1xuICAgICAgICB0aGlzLnNldFByaWNlKGRhdGEucHJpY2UgfHwgMCk7XG4gICAgICAgIHRoaXMuYmlnSW1hZ2VVcmwgPSBkYXRhLmJpZ0ltYWdlVXJsO1xuICAgICAgICB0aGlzLmRyZXNzTGlzdCA9IGRhdGEuZHJlc3NMaXN0IHx8IFtdO1xuICAgICAgICB0aGlzLmVudGl0eS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICB0aGlzLl9idG5NZW51LmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5kZWZhdWx0TG9hZEFuaW0uZW50aXR5LmFjdGl2ZSA9IHRydWU7XG4gICAgICAgIHRoaXMuZGVmYXVsdExvYWRBbmltLnBsYXkoJ2xvYWRpbmcnKTtcbiAgICAgICAgdGhpcy5zZXRNYXJrVXNlKGRhdGEuc3RhdHVzID09PSBcIjFcIiB8fCBmYWxzZSk7XG4gICAgICAgIC8vXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgc2VsZi5kYXRhQmFzZS5sb2FkSW1hZ2UoZGF0YS5pbWFnZVVybCwgZnVuY3Rpb24gKGRhdGEsIGVycm9yLCBpbWFnZSkge1xuICAgICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHNlbGYudGlkICE9PSBkYXRhLnRpZCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBzcHJpdGUgPSBuZXcgRmlyZS5TcHJpdGUoaW1hZ2UpO1xuICAgICAgICAgICAgc2VsZi5zZXRTcHJpdGUoc3ByaXRlLCBiaW5kRXZlbnQpO1xuICAgICAgICAgICAgc2VsZi5fYnRuTWVudS5lbnRpdHkuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgICAgIHNlbGYuZGVmYXVsdExvYWRBbmltLmVudGl0eS5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgfS5iaW5kKHRoaXMsIGRhdGEpKTtcbiAgICB9XG59KTtcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnZWVhNjlDVVRlSkRSYjkveWRiL1ZHZFQnLCAnVGlwTG9hZCcpO1xuLy8gc2NyaXB0XFx2aWxsYVxcVGlwTG9hZC5qc1xuXG52YXIgVGlwTG9hZCA9IEZpcmUuQ2xhc3Moe1xuICAgIC8vIOe7p+aJv1xuICAgIGV4dGVuZHM6IEZpcmUuQ29tcG9uZW50LFxuICAgIC8vIOaehOmAoOWHveaVsFxuICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiAoKSB7XG5cbiAgICB9LFxuICAgIC8vIOWxnuaAp1xuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgY29udGVudDp7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5CaXRtYXBUZXh0XG4gICAgICAgIH0sXG4gICAgICAgIGxvYWRJY29uOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5FbnRpdHlcbiAgICAgICAgfSxcbiAgICAgICAgYW5pbToge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuQW5pbWF0aW9uXG4gICAgICAgIH1cbiAgICB9LFxuICAgIC8vIOWKoOi9vVxuICAgIG9uTG9hZDogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgZW50ID0gRmlyZS5FbnRpdHkuZmluZCgnL0RhdGFCYXNlJyk7XG4gICAgICAgIHRoaXMuZGF0YUJhc2UgPSBlbnQuZ2V0Q29tcG9uZW50KCdEYXRhYmFzZScpO1xuXG4gICAgICAgIHZhciBzdGF0ZSA9IHRoaXMuYW5pbS5wbGF5KCdsb2FkaW5nJyk7XG4gICAgICAgIHN0YXRlLndyYXBNb2RlID0gRmlyZS5XcmFwTW9kZS5Mb29wO1xuICAgICAgICBzdGF0ZS5yZXBlYXRDb3VudCA9IEluZmluaXR5O1xuICAgIH0sXG4gICAgLy8g5omT5byA56qX5Y+jXG4gICAgb3BlblRpcHM6IGZ1bmN0aW9uICh0ZXh0KSB7XG4gICAgICAgIHRoaXMuYW5pbS5wbGF5KCdsb2FkaW5nJyk7XG4gICAgICAgIHRoaXMuZW50aXR5LmFjdGl2ZSA9IHRydWU7XG4gICAgICAgIGlmICh0ZXh0KSB7XG4gICAgICAgICAgICB0aGlzLmNvbnRlbnQudGV4dCA9IHRleHQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmNvbnRlbnQudGV4dCA9ICfliqDovb3kuK3or7fnqI3lkI4uLi4nO1xuICAgICAgICB9XG4gICAgICAgIHZhciBzaXplID0gdGhpcy5jb250ZW50LmdldFdvcmxkU2l6ZSgpO1xuICAgICAgICB0aGlzLmxvYWRJY29uLnRyYW5zZm9ybS53b3JsZFBvc2l0aW9uID0gbmV3IEZpcmUuVmVjMihzaXplLnggLyAyICsgNTAsIDApO1xuICAgIH0sXG4gICAgLy8g5YWz6Zet56qX5Y+jXG4gICAgY2xvc2VUaXBzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuYW5pbS5zdG9wKCdsb2FkaW5nJyk7XG4gICAgICAgIHRoaXMuZW50aXR5LmFjdGl2ZSA9IGZhbHNlO1xuICAgIH1cbn0pO1xuXG5GaXJlLl9SRnBvcCgpOyIsIkZpcmUuX1JGcHVzaChtb2R1bGUsICcyMDk0NExCbXZSSU03aEd1eUp6QzRNYycsICdUaXBzUGF5TWVudCcpO1xuLy8gc2NyaXB0XFx2aWxsYVxcVGlwc1BheU1lbnQuanNcblxudmFyIFRpcHNQYXlNZW50ID0gRmlyZS5DbGFzcyh7XG4gICAgZXh0ZW5kczogRmlyZS5Db21wb25lbnQsXG5cbiAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgIGJ0bl9QYXk6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlVJQnV0dG9uXG4gICAgICAgIH0sXG4gICAgICAgIGJ0bl9QYXlJc3N1ZXM6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlVJQnV0dG9uXG4gICAgICAgIH0sXG4gICAgICAgIGJ0bl9DbG9zZToge1xuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVUlCdXR0b25cbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy8g5YWz6Zet5oyJ6ZKu5LqL5Lu2XG4gICAgX29uQ2xvc2VXaW5kb3c6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5jbG9zZVRpcHMoKTtcbiAgICB9LFxuICAgIC8vIOW3sue7j+WujOaIkOS7mOasvu+8jOmcgOimgemAmuiur+acjeWKoeWZqFxuICAgIF9vbkNoZWNrUGF5OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgc2VsZi5kYXRhQmFzZS5sb2FkVGlwcy5vcGVuVGlwcygn56Gu6K6k5YWF5YC85piv5ZCm5a6M5q+V77yB6K+356iN5ZCOLi4uJyk7XG4gICAgICAgIHZhciBzZW5kRGF0YSA9IHtcbiAgICAgICAgICAgIG1hcms6IHRoaXMuZGF0YUJhc2UubWFya1xuICAgICAgICB9O1xuICAgICAgICBzZWxmLmRhdGFCYXNlLm5ldFdvcmtNZ3IuUmVxdWVzdENhbkRyZXNzUm9vbShzZW5kRGF0YSwgZnVuY3Rpb24gKHNlcnZlckRhdGEpIHtcbiAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UudXNlcmNjID0gc2VydmVyRGF0YS51c2VyY2M7XG4gICAgICAgICAgICBzZWxmLmRhdGFCYXNlLnBheU1lbnRXaW5kb3cucmVmcmVzaFVzZXJDQygpO1xuICAgICAgICAgICAgc2VsZi5kYXRhQmFzZS5sb2FkVGlwcy5jbG9zZVRpcHMoKTtcbiAgICAgICAgICAgIHNlbGYuZGF0YUJhc2UudGlwc1dpbmRvdy5vcGVuVGlwc1dpbmRvdygn5YWF5YC85oiQ5YqfIScpO1xuICAgICAgICAgICAgc2VsZi5jbG9zZVRpcHMoKTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICAvLyDku5jmrL7pgYfliLDnmoTpl67pophcbiAgICBfb25QYXlJc3N1ZXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5kYXRhQmFzZS50aXBzUGF5UHJvYmxlbXMub3BlblRpcHMoKTtcbiAgICB9LFxuICAgIC8vIOW8gOWQr+aPkOekuueql+WPo1xuICAgIG9wZW5UaXBzOiBmdW5jdGlvbiAodGV4dCkge1xuICAgICAgICB0aGlzLmVudGl0eS5hY3RpdmUgPSB0cnVlO1xuICAgIH0sXG4gICAgLy8g5YWz6Zet5o+Q56S656qX5Y+jXG4gICAgY2xvc2VUaXBzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuZW50aXR5LmFjdGl2ZSA9IGZhbHNlO1xuICAgIH0sXG4gICAgLy8g5Yqg6L295pe2XG4gICAgb25Mb2FkOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIOW4uOeUqOeahOWPmOmHjy/mlbDmja5cbiAgICAgICAgdmFyIGVudCA9IEZpcmUuRW50aXR5LmZpbmQoJy9EYXRhQmFzZScpO1xuICAgICAgICB0aGlzLmRhdGFCYXNlID0gZW50LmdldENvbXBvbmVudCgnRGF0YUJhc2UnKTtcbiAgICAgICAgLy9cbiAgICAgICAgdGhpcy5idG5fUGF5Lm9uQ2xpY2sgPSB0aGlzLl9vbkNoZWNrUGF5LmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuYnRuX1BheUlzc3Vlcy5vbkNsaWNrID0gdGhpcy5fb25QYXlJc3N1ZXMuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5idG5fQ2xvc2Uub25DbGljayA9IHRoaXMuX29uQ2xvc2VXaW5kb3cuYmluZCh0aGlzKTtcbiAgICB9XG59KTtcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnYjNjZDlCLytEMUhQb0ZldXVnZWtBbnQnLCAnVGlwc1BheVByb2JsZW1zJyk7XG4vLyBzY3JpcHRcXHZpbGxhXFxUaXBzUGF5UHJvYmxlbXMuanNcblxudmFyIFRpcHNQYXlQcm9ibGVtcyA9IEZpcmUuQ2xhc3Moe1xuICAgIC8vIOe7p+aJv1xuICAgIGV4dGVuZHM6IEZpcmUuQ29tcG9uZW50LFxuICAgIC8vIOaehOmAoOWHveaVsFxuICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbiAoKSB7XG5cbiAgICB9LFxuICAgIC8vIOWxnuaAp1xuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgYnRuX29rOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5VSUJ1dHRvblxuICAgICAgICB9XG4gICAgfSxcblxuICAgIF9vbk9LRXZlbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5jbG9zZVRpcHMoKTtcbiAgICB9LFxuXG4gICAgY2xvc2VUaXBzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuZW50aXR5LmFjdGl2ZSA9IGZhbHNlO1xuICAgIH0sXG5cbiAgICBvcGVuVGlwczogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmVudGl0eS5hY3RpdmUgPSB0cnVlO1xuICAgIH0sXG4gICAgLy8g5byA5aeLXG4gICAgc3RhcnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5idG5fb2sub25DbGljayA9IHRoaXMuX29uT0tFdmVudC5iaW5kKHRoaXMpO1xuICAgIH1cbn0pO1xuXG5GaXJlLl9SRnBvcCgpOyIsIkZpcmUuX1JGcHVzaChtb2R1bGUsICdmOTJjM0RXM1paRllvTktjN2xWWUhjOCcsICdUaXBzV2luZG93Jyk7XG4vLyBzY3JpcHRcXHZpbGxhXFxUaXBzV2luZG93LmpzXG5cbnZhciBUaXBzV2luZG93ID0gRmlyZS5DbGFzcyh7XHJcbiAgICBleHRlbmRzOiBGaXJlLkNvbXBvbmVudCxcclxuXHJcbiAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgY29udGVudDoge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiBGaXJlLkJpdG1hcFRleHRcclxuICAgICAgICB9LFxyXG4gICAgICAgIGJ0bl9EZXRlcm1pbmU6IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5VSUJ1dHRvblxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYnRuX2Nsb3NlOiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHR5cGU6IEZpcmUuVUlCdXR0b25cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIF9vbkNsb3NlV2luZG93OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5jbG9zZVRpcHMoKTtcclxuICAgIH0sXHJcblxyXG4gICAgX29uRGV0ZXJtaW5lRXZlbnQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLmNsb3NlVGlwcygpO1xyXG4gICAgICAgIGlmICh0aGlzLm9uQ2FsbGJhY2spIHtcclxuICAgICAgICAgICAgdGhpcy5vbkNhbGxiYWNrKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBvcGVuVGlwc1dpbmRvdzogZnVuY3Rpb24gKHZhbHVlLCBjYWxsYmFjaykge1xyXG4gICAgICAgIHRoaXMub25DYWxsYmFjayA9IG51bGw7XHJcbiAgICAgICAgdGhpcy5jb250ZW50LnRleHQgPSB2YWx1ZTtcclxuICAgICAgICBpZiAoY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgdGhpcy5vbkNhbGxiYWNrID0gY2FsbGJhY2s7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuZW50aXR5LmFjdGl2ZSA9IHRydWU7XHJcbiAgICB9LFxyXG5cclxuICAgIGNsb3NlVGlwczogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuZW50aXR5LmFjdGl2ZSA9IGZhbHNlO1xyXG4gICAgfSxcclxuXHJcbiAgICBvbkxvYWQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLmJ0bl9jbG9zZS5vbkNsaWNrID0gdGhpcy5fb25DbG9zZVdpbmRvdy5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuYnRuX0RldGVybWluZS5vbkNsaWNrID0gdGhpcy5fb25EZXRlcm1pbmVFdmVudC5iaW5kKHRoaXMpO1xyXG4gICAgfVxyXG59KTtcclxuXG5GaXJlLl9SRnBvcCgpOyIsIkZpcmUuX1JGcHVzaChtb2R1bGUsICc4ZDAwNEE3L3RCUDk3MllmaUFwVVNXdScsICdUb2dnbGUnKTtcbi8vIHNjcmlwdFxcY29tbW9uXFxUb2dnbGUuanNcblxudmFyIFRvZ2dsZSA9RmlyZS5DbGFzcyh7XG4gICAgLy8g57un5om/XG4gICAgZXh0ZW5kczogRmlyZS5Db21wb25lbnQsXG4gICAgLy8g5p6E6YCg5Ye95pWwXG4gICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5oYXNDbGljayA9IGZhbHNlO1xuICAgICAgICB0aGlzLl9vbkJ1dHRvbkRvd25FdmVudEJpbmQgPSB0aGlzLl9vbkJ1dHRvbkRvd25FdmVudC5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLl9vbkJ1dHRvblVwRXZlbnRCaW5kID0gdGhpcy5fb25CdXR0b25VcEV2ZW50LmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMuYnRuUmVuZGVyID0gbnVsbDtcbiAgICAgICAgdGhpcy5vbkNsaWNrID0gbnVsbDtcbiAgICB9LFxuICAgIC8vIOWxnuaAp1xuICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgdGV4dENvbnRlbnQ6IHtcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlRleHRcbiAgICAgICAgfSxcbiAgICAgICAgbm9ybWFsUG9zOiBuZXcgRmlyZS5WZWMyKDAsIDApLFxuICAgICAgICBub3JtYWxDb2xvcjogRmlyZS5Db2xvci53aGl0ZSxcbiAgICAgICAgbm9ybWFsU3ByaXRlOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5TcHJpdGVcbiAgICAgICAgfSxcbiAgICAgICAgcHJlc3NlZFBvczogbmV3IEZpcmUuVmVjMigwLCAwKSxcbiAgICAgICAgcHJlc3NlZENvbG9yOiBGaXJlLkNvbG9yLndoaXRlLFxuICAgICAgICBwcmVzc2VkU3ByaXRlOiB7XG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxuICAgICAgICAgICAgdHlwZTogRmlyZS5TcHJpdGVcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy8g5oyJ5LiLXG4gICAgX29uQnV0dG9uRG93bkV2ZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vaWYgKHRoaXMucHJlc3NlZFNwcml0ZSkge1xuICAgICAgICAvLyAgICB0aGlzLmJ0blJlbmRlci5zcHJpdGUgPSB0aGlzLnByZXNzZWRTcHJpdGU7XG4gICAgICAgIC8vfVxuICAgICAgICAvL2lmICh0aGlzLm5vcm1hbFBvcyAhPT0gRmlyZS5WZWMyLnplcm8pIHtcbiAgICAgICAgLy8gICAgdGhpcy5zZXRQb3N0aXRpb24odGhpcy5ub3JtYWxQb3MpO1xuICAgICAgICAvL31cbiAgICB9LFxuICAgIC8vIOaUvuW8gFxuICAgIF9vbkJ1dHRvblVwRXZlbnQ6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBpZiAodGhpcy5oYXNDbGljaykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLm9uQ2xpY2spIHtcbiAgICAgICAgICAgIHRoaXMub25DbGljayhldmVudCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMucHJlc3NlZFNwcml0ZSkge1xuICAgICAgICAgICAgdGhpcy5idG5SZW5kZXIuc3ByaXRlID0gdGhpcy5wcmVzc2VkU3ByaXRlO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnByZXNzZWRDb2xvciAhPT0gRmlyZS5Db2xvci53aGl0ZSkge1xuICAgICAgICAgICAgdGhpcy5idG5SZW5kZXIuY29sb3IgPSB0aGlzLnByZXNzZWRDb2xvcjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5wcmVzc2VkUG9zLnggIT09IDAgJiYgdGhpcy5wcmVzc2VkUG9zLnkgIT09IDApIHtcbiAgICAgICAgICAgIHRoaXMuc2V0UG9zdGl0aW9uKHRoaXMucHJlc3NlZFBvcyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5oYXNDbGljayA9IHRydWU7XG4gICAgfSxcbiAgICAvL1xuICAgIGRlZmF1bHRUb2dnbGU6IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICBpZiAodGhpcy5wcmVzc2VkU3ByaXRlKSB7XG4gICAgICAgICAgICB0aGlzLmJ0blJlbmRlci5zcHJpdGUgPSB0aGlzLnByZXNzZWRTcHJpdGU7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5idG5SZW5kZXIuY29sb3IgPSB0aGlzLnByZXNzZWRDb2xvcjtcbiAgICAgICAgaWYgKHRoaXMucHJlc3NlZFBvcy54ICE9PSAwICYmIHRoaXMucHJlc3NlZFBvcy55ICE9PSAwKSB7XG4gICAgICAgICAgICB0aGlzLnNldFBvc3RpdGlvbih0aGlzLnByZXNzZWRQb3MpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgcmVzZXRDb2xvcjogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLmhhc0NsaWNrID0gZmFsc2U7XG4gICAgICAgIHRoaXMuYnRuUmVuZGVyLmNvbG9yID0gdGhpcy5ub3JtYWxDb2xvcjtcbiAgICB9LFxuICAgIC8vXG4gICAgcmVzZXRUb2dnbGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5oYXNDbGljayA9IGZhbHNlO1xuICAgICAgICBpZiAodGhpcy5ub3JtYWxTcHJpdGUpIHtcbiAgICAgICAgICAgIHRoaXMuYnRuUmVuZGVyLnNwcml0ZSA9IHRoaXMubm9ybWFsU3ByaXRlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYnRuUmVuZGVyLmNvbG9yID0gdGhpcy5ub3JtYWxDb2xvcjtcbiAgICAgICAgaWYgKHRoaXMubm9ybWFsUG9zLnggIT09IDAgJiYgdGhpcy5ub3JtYWxQb3MueSAhPT0gMCkge1xuICAgICAgICAgICAgdGhpcy5zZXRQb3N0aXRpb24odGhpcy5ub3JtYWxQb3MpO1xuICAgICAgICB9XG4gICAgfSxcbiAgICAvLyDorr7nva7lnZDmoIdcbiAgICBzZXRQb3N0aXRpb246IGZ1bmN0aW9uIChwb3NWYWx1ZSkge1xuICAgICAgICB0aGlzLmVudGl0eS50cmFuc2Zvcm0ucG9zaXRpb24gPSBwb3NWYWx1ZTtcbiAgICB9LFxuICAgIC8vIOiuvue9ruaWh+Wtl1xuICAgIHNldFRleHQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB0aGlzLnRleHRDb250ZW50LnRleHQgPSB2YWx1ZTtcbiAgICB9LFxuICAgIC8vIOi9veWFpeaXtlxuICAgIHN0YXJ0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuZW50aXR5Lm9uKCdtb3VzZWRvd24nLCB0aGlzLl9vbkJ1dHRvbkRvd25FdmVudEJpbmQpO1xuICAgICAgICB0aGlzLmVudGl0eS5vbignbW91c2V1cCcsIHRoaXMuX29uQnV0dG9uVXBFdmVudEJpbmQpO1xuXG4gICAgICAgIGlmICghdGhpcy5idG5SZW5kZXIpe1xuICAgICAgICAgICAgdGhpcy5idG5SZW5kZXIgPSB0aGlzLmVudGl0eS5nZXRDb21wb25lbnQoRmlyZS5TcHJpdGVSZW5kZXJlcik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMubm9ybWFsU3ByaXRlKSB7XG4gICAgICAgICAgICB0aGlzLmJ0blJlbmRlci5zcHJpdGUgPSB0aGlzLm5vcm1hbFNwcml0ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5ub3JtYWxDb2xvciAhPT0gRmlyZS5Db2xvci53aGl0ZSkge1xuICAgICAgICAgICAgdGhpcy5idG5SZW5kZXIuY29sb3IgPSB0aGlzLm5vcm1hbENvbG9yO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLm5vcm1hbFBvcy54ICE9PSAwICYmIHRoaXMubm9ybWFsUG9zLnkgIT09IDApIHtcbiAgICAgICAgICAgIHRoaXMuc2V0UG9zdGl0aW9uKHRoaXMubm9ybWFsUG9zKTtcbiAgICAgICAgfVxuICAgIH0sXG4gICAgLy8g6ZSA5q+B5pe2XG4gICAgb25EZXN0cm95OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuZW50aXR5Lm9mZignbW91c2Vkb3duJywgdGhpcy5fb25CdXR0b25Eb3duRXZlbnRCaW5kKTtcbiAgICAgICAgdGhpcy5lbnRpdHkub2ZmKCdtb3VzZXVwJywgdGhpcy5fb25CdXR0b25VcEV2ZW50QmluZCk7XG4gICAgfVxufSk7XG5cbkZpcmUuVG9nZ2xlID0gVG9nZ2xlO1xuXG5GaXJlLl9SRnBvcCgpOyIsIkZpcmUuX1JGcHVzaChtb2R1bGUsICdhMTYyZG9UZW5wS09hMFRRdDhNcHg0SycsICdUb29scycpO1xuLy8gc2NyaXB0XFxjb21tb25cXFRvb2xzLmpzXG5cbmZ1bmN0aW9uIEltYWdlTG9hZGVyKHVybCwgY2FsbGJhY2ssIG9uUHJvZ3Jlc3MpIHtcclxuICAgIHZhciBpbWFnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xyXG4gICAgLy9pbWFnZS5jcm9zc09yaWdpbiA9ICdBbm9ueW1vdXMnO1xyXG5cclxuICAgIHZhciBvbmxvYWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHRoaXMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpbWFnZS5yZW1vdmVFdmVudExpc3RlbmVyKCdsb2FkJywgb25sb2FkKTtcclxuICAgICAgICBpbWFnZS5yZW1vdmVFdmVudExpc3RlbmVyKCdlcnJvcicsIG9uZXJyb3IpO1xyXG4gICAgICAgIGltYWdlLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgb25Qcm9ncmVzcyk7XHJcbiAgICB9O1xyXG4gICAgdmFyIG9uZXJyb3IgPSBmdW5jdGlvbiAobXNnLCBsaW5lLCB1cmwpIHtcclxuICAgICAgICBpZiAoY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgdmFyIGVycm9yID0gJ0ZhaWxlZCB0byBsb2FkIGltYWdlOiAnICsgbXNnICsgJyBVcmw6ICcgKyB1cmw7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrKGVycm9yLCBudWxsKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaW1hZ2UucmVtb3ZlRXZlbnRMaXN0ZW5lcignbG9hZCcsIG9ubG9hZCk7XHJcbiAgICAgICAgaW1hZ2UucmVtb3ZlRXZlbnRMaXN0ZW5lcignZXJyb3InLCBvbmVycm9yKTtcclxuICAgICAgICBpbWFnZS5yZW1vdmVFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIG9uUHJvZ3Jlc3MpO1xyXG4gICAgfTtcclxuXHJcbiAgICBpbWFnZS5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgb25sb2FkKTtcclxuICAgIGltYWdlLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgb25lcnJvcik7XHJcbiAgICBpZiAob25Qcm9ncmVzcykge1xyXG4gICAgICAgIGltYWdlLmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgb25Qcm9ncmVzcyk7XHJcbiAgICB9XHJcbiAgICBpbWFnZS5zcmMgPSB1cmw7XHJcbiAgICByZXR1cm4gaW1hZ2U7XHJcbn1cclxuXHJcbkZpcmUuSW1hZ2VMb2FkZXIgPSBJbWFnZUxvYWRlcjtcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2gobW9kdWxlLCAnMTZjNWRxWlFtMUwwcjlmN1FwNXZzZTUnLCAnVUlCdXR0b24nKTtcbi8vIHNjcmlwdFxcY29tbW9uXFxVSUJ1dHRvbi5qc1xuXG52YXIgVUlCdXR0b24gPUZpcmUuQ2xhc3Moe1xyXG4gICAgLy8g57un5om/XHJcbiAgICBleHRlbmRzOiBGaXJlLkNvbXBvbmVudCxcclxuICAgIC8vIOaehOmAoOWHveaVsFxyXG4gICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLl9idG5SZW5kZXIgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX25vcm1hbENvbG9yID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9ub3JtYWxTcHJpdGUgPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX29uQnV0dG9uRG93bkV2ZW50QmluZCA9IHRoaXMuX29uQnV0dG9uRG93bkV2ZW50LmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5fb25CdXR0b25VcEV2ZW50QmluZCA9IHRoaXMuX29uQnV0dG9uVXBFdmVudC5iaW5kKHRoaXMpO1xyXG4gICAgICAgIHRoaXMuX29uQnV0dG9uRW50ZXJFdmVudEJpbmQgPSB0aGlzLl9vbkJ1dHRvbkVudGVyRXZlbnQuYmluZCh0aGlzKTtcclxuICAgICAgICB0aGlzLl9vbkJ1dHRvbkxlYXZlRXZlbnRCaW5kID0gdGhpcy5fb25CdXR0b25MZWF2ZUV2ZW50LmJpbmQodGhpcyk7XHJcbiAgICAgICAgdGhpcy5vbkNsaWNrID0gbnVsbDtcclxuICAgICAgICB0aGlzLm9uTW91c2Vkb3duID0gbnVsbDtcclxuICAgICAgICB0aGlzLmltYWdlID0gbnVsbDtcclxuICAgICAgICB0aGlzLm1hcmsgPSAwO1xyXG4gICAgICAgIHRoaXMuaGFzRGlzYWJsZWQgPSBmYWxzZTtcclxuICAgIH0sXHJcbiAgICAvLyDlsZ7mgKdcclxuICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAvLyDmjInpkq7mloflrZdcclxuICAgICAgICB0ZXh0Q29udGVudDoge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlRleHRcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8vXHJcbiAgICAgICAgaG92ZXJDb2xvcjogRmlyZS5Db2xvci53aGl0ZSxcclxuICAgICAgICBob3ZlclNwcml0ZToge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlNwcml0ZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy9cclxuICAgICAgICBwcmVzc2VkQ29sb3I6IEZpcmUuQ29sb3Iud2hpdGUsXHJcbiAgICAgICAgcHJlc3NlZFNwcml0ZToge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlNwcml0ZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy9cclxuICAgICAgICBkaXNhYmxlZENvbG9yOiBuZXcgRmlyZS5Db2xvcigwLjUsIDAuNSwgMC41LCAxKSxcclxuICAgICAgICAvLyDmjInpkq7muLLmn5NcclxuICAgICAgICBidG5SZW5kZXI6IHtcclxuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoISB0aGlzLl9idG5SZW5kZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9idG5SZW5kZXIgPSB0aGlzLmVudGl0eS5nZXRDb21wb25lbnQoRmlyZS5TcHJpdGVSZW5kZXJlcik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fYnRuUmVuZGVyO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB2aXNpYmxlOiBmYWxzZVxyXG4gICAgICAgIH1cclxuXHJcbiAgICB9LFxyXG4gICAgLy8g5oyJ5LiLXHJcbiAgICBfb25CdXR0b25Eb3duRXZlbnQ6IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgIGlmICh0aGlzLnByZXNzZWRTcHJpdGUpIHtcclxuICAgICAgICAgICAgdGhpcy5idG5SZW5kZXIuc3ByaXRlID0gdGhpcy5wcmVzc2VkU3ByaXRlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgcENvbG9yO1xyXG4gICAgICAgIGlmICghIHRoaXMuaGFzRGlzYWJsZWQpIHtcclxuICAgICAgICAgICAgcENvbG9yID0gdGhpcy5wcmVzc2VkQ29sb3I7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICBwQ29sb3IgPSB0aGlzLmRpc2FibGVkQ29sb3I7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuYnRuUmVuZGVyLmNvbG9yID0gcENvbG9yO1xyXG4gICAgICAgIGlmICh0aGlzLm9uTW91c2Vkb3duKSB7XHJcbiAgICAgICAgICAgIHRoaXMub25Nb3VzZWRvd24oZXZlbnQpO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvLyDph4rmlL5cclxuICAgIF9vbkJ1dHRvblVwRXZlbnQ6IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgIHZhciBuQ29sb3I7XHJcbiAgICAgICAgaWYgKCEgdGhpcy5oYXNEaXNhYmxlZCkge1xyXG4gICAgICAgICAgICBuQ29sb3IgPSB0aGlzLl9ub3JtYWxDb2xvcjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIG5Db2xvciA9IHRoaXMuZGlzYWJsZWRDb2xvcjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5idG5SZW5kZXIuY29sb3IgPSBuQ29sb3I7XHJcbiAgICAgICAgdGhpcy5idG5SZW5kZXIuc3ByaXRlID0gdGhpcy5fbm9ybWFsU3ByaXRlO1xyXG4gICAgICAgIC8vIOinpuWPkeS6i+S7tlxyXG4gICAgICAgIGlmICh0aGlzLm9uQ2xpY2spIHtcclxuICAgICAgICAgICAgdGhpcy5vbkNsaWNrKGV2ZW50KTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8g6L+b5YWlXHJcbiAgICBfb25CdXR0b25FbnRlckV2ZW50OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIGhDb2xvcjtcclxuICAgICAgICBpZiAoISB0aGlzLmhhc0Rpc2FibGVkKSB7XHJcbiAgICAgICAgICAgIGhDb2xvciA9IHRoaXMuaG92ZXJDb2xvcjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGhDb2xvciA9IHRoaXMuZGlzYWJsZWRDb2xvcjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5idG5SZW5kZXIuY29sb3IgPSBoQ29sb3I7XHJcbiAgICAgICAgaWYgKHRoaXMuaG92ZXJTcHJpdGUpIHtcclxuICAgICAgICAgICAgdGhpcy5idG5SZW5kZXIuc3ByaXRlID0gdGhpcy5ob3ZlclNwcml0ZTtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8g56e75byAXHJcbiAgICBfb25CdXR0b25MZWF2ZUV2ZW50OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIG5Db2xvcjtcclxuICAgICAgICBpZiAoISB0aGlzLmhhc0Rpc2FibGVkKSB7XHJcbiAgICAgICAgICAgIG5Db2xvciA9IHRoaXMuX25vcm1hbENvbG9yO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgbkNvbG9yID0gdGhpcy5kaXNhYmxlZENvbG9yO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLmJ0blJlbmRlci5jb2xvciA9IG5Db2xvcjtcclxuICAgICAgICB0aGlzLmJ0blJlbmRlci5zcHJpdGUgPSB0aGlzLl9ub3JtYWxTcHJpdGU7XHJcbiAgICB9LFxyXG4gICAgLy8g6K6+572u56aB55SoXHJcbiAgICBzZXREaXNhYmxlZDogZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgdGhpcy5oYXNEaXNhYmxlZCA9IHZhbHVlO1xyXG4gICAgICAgIHZhciBuQ29sb3I7XHJcbiAgICAgICAgaWYgKHZhbHVlKSB7XHJcbiAgICAgICAgICAgIG5Db2xvciA9IHRoaXMuZGlzYWJsZWRDb2xvcjtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIGlmICghIHRoaXMuX25vcm1hbENvbG9yKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9ub3JtYWxDb2xvciA9IHRoaXMuYnRuUmVuZGVyLmNvbG9yO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIG5Db2xvciA9IHRoaXMuX25vcm1hbENvbG9yIHx8IEZpcmUuQ29sb3Iud2hpdGU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuYnRuUmVuZGVyLmNvbG9yID0gbkNvbG9yO1xyXG4gICAgfSxcclxuICAgIC8vIOiuvue9ruaWh+Wtl1xyXG4gICAgc2V0VGV4dDogZnVuY3Rpb24gKHZhbHVlKSB7XHJcbiAgICAgICAgdGhpcy50ZXh0Q29udGVudC50ZXh0ID0gdmFsdWU7XHJcbiAgICB9LFxyXG4gICAgLy8g6K6+572u5oyJ6ZKu5Z2Q5qCHXHJcbiAgICBzZXRQb3N0aXRpb246IGZ1bmN0aW9uIChwb3NWYWx1ZSkge1xyXG4gICAgICAgIHRoaXMuZW50aXR5LnRyYW5zZm9ybS5wb3NpdGlvbiA9IHBvc1ZhbHVlO1xyXG4gICAgfSxcclxuICAgIC8vIOiuvue9ruWbvueJh+Wkp+Wwj1xyXG4gICAgc2V0Q3VzdG9tU2l6ZTogZnVuY3Rpb24gKHcsIGgpIHtcclxuICAgICAgICBpZiAodyA9PT0gLTEgfHwgaCA9PT0gLTEpIHtcclxuICAgICAgICAgICAgdGhpcy5idG5SZW5kZXIudXNlQ3VzdG9tU2l6ZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMuYnRuUmVuZGVyLnVzZUN1c3RvbVNpemUgPSB0cnVlO1xyXG4gICAgICAgIHRoaXMuYnRuUmVuZGVyLmN1c3RvbVdpZHRoID0gdztcclxuICAgICAgICB0aGlzLmJ0blJlbmRlci5jdXN0b21IZWlnaHQgPSBoO1xyXG4gICAgfSxcclxuICAgIC8vIOiuvue9ruaMiemSrue6ueeQhlxyXG4gICAgc2V0U3ByaXRlOiBmdW5jdGlvbiAobmV3U3ByaXRlKSB7XHJcbiAgICAgICAgdGhpcy5idG5SZW5kZXIuc3ByaXRlID0gbmV3U3ByaXRlO1xyXG4gICAgICAgIHRoaXMuX25vcm1hbFNwcml0ZSA9IG5ld1Nwcml0ZTtcclxuICAgICAgICB0aGlzLmhvdmVyU3ByaXRlID0gbmV3U3ByaXRlO1xyXG4gICAgICAgIHRoaXMucHJlc3NlZFNwcml0ZSA9IG5ld1Nwcml0ZTtcclxuICAgIH0sXHJcbiAgICAvLyDorr7nva7mjInpkq7nurnnkIZcclxuICAgIHNldEltYWdlOiBmdW5jdGlvbiAoaW1hZ2UpIHtcclxuICAgICAgICB0aGlzLmltYWdlID0gaW1hZ2U7XHJcbiAgICAgICAgdmFyIG5ld1Nwcml0ZSA9IG5ldyBGaXJlLlNwcml0ZShpbWFnZSk7XHJcbiAgICAgICAgdGhpcy5idG5SZW5kZXIuc3ByaXRlID0gbmV3U3ByaXRlO1xyXG4gICAgICAgIHRoaXMuX25vcm1hbFNwcml0ZSA9IG5ld1Nwcml0ZTtcclxuICAgICAgICB0aGlzLmhvdmVyU3ByaXRlID0gbmV3U3ByaXRlO1xyXG4gICAgICAgIHRoaXMucHJlc3NlZFNwcml0ZSA9IG5ld1Nwcml0ZTtcclxuICAgIH0sXHJcbiAgICAvLyDovb3lhaXml7ZcclxuICAgIG9uTG9hZDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICghIHRoaXMuX25vcm1hbENvbG9yKSB7XHJcbiAgICAgICAgICAgIHRoaXMuX25vcm1hbENvbG9yID0gdGhpcy5idG5SZW5kZXIuY29sb3I7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghIHRoaXMuX25vcm1hbFNwcml0ZSkge1xyXG4gICAgICAgICAgICB0aGlzLl9ub3JtYWxTcHJpdGUgPSB0aGlzLmJ0blJlbmRlci5zcHJpdGU7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIOW8gOWni1xyXG4gICAgc3RhcnQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLmVudGl0eS5vbignbW91c2Vkb3duJywgdGhpcy5fb25CdXR0b25Eb3duRXZlbnRCaW5kKTtcclxuICAgICAgICB0aGlzLmVudGl0eS5vbignbW91c2V1cCcsIHRoaXMuX29uQnV0dG9uVXBFdmVudEJpbmQpO1xyXG4gICAgICAgIHRoaXMuZW50aXR5Lm9uKCdtb3VzZWVudGVyJywgdGhpcy5fb25CdXR0b25FbnRlckV2ZW50QmluZCk7XHJcbiAgICAgICAgdGhpcy5lbnRpdHkub24oJ21vdXNlbGVhdmUnLCB0aGlzLl9vbkJ1dHRvbkxlYXZlRXZlbnRCaW5kKTtcclxuICAgIH0sXHJcbiAgICAvL1xyXG4gICAgb25FbmFibGU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgbkNvbG9yO1xyXG4gICAgICAgIGlmICghIHRoaXMuaGFzRGlzYWJsZWQpIHtcclxuICAgICAgICAgICAgbkNvbG9yID0gdGhpcy5fbm9ybWFsQ29sb3IgfHwgRmlyZS5Db2xvci53aGl0ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIG5Db2xvciA9IHRoaXMuZGlzYWJsZWRDb2xvcjtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhpcy5idG5SZW5kZXIuY29sb3IgPSBuQ29sb3I7XHJcbiAgICAgICAgdGhpcy5idG5SZW5kZXIuc3ByaXRlID0gdGhpcy5fbm9ybWFsU3ByaXRlO1xyXG4gICAgfSxcclxuICAgIC8vIOmUgOavgeaXtlxyXG4gICAgb25EZXN0cm95OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5lbnRpdHkub2ZmKCdtb3VzZWRvd24nLCB0aGlzLl9vbkJ1dHRvbkRvd25FdmVudEJpbmQpO1xyXG4gICAgICAgIHRoaXMuZW50aXR5Lm9mZignbW91c2V1cCcsIHRoaXMuX29uQnV0dG9uVXBFdmVudEJpbmQpO1xyXG4gICAgICAgIHRoaXMuZW50aXR5Lm9mZignbW91c2VlbnRlcicsIHRoaXMuX29uQnV0dG9uRW50ZXJFdmVudEJpbmQpO1xyXG4gICAgICAgIHRoaXMuZW50aXR5Lm9mZignbW91c2VsZWF2ZScsIHRoaXMuX29uQnV0dG9uTGVhdmVFdmVudEJpbmQpO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbkZpcmUuVUlCdXR0b24gPSBVSUJ1dHRvbjtcclxuXG5GaXJlLl9SRnBvcCgpOyIsIkZpcmUuX1JGcHVzaChtb2R1bGUsICc2ZjMzYUJEV3dGSzBaZmJCbkZ5NXpWdScsICdVSVBvcHVwTGlzdCcpO1xuLy8gc2NyaXB0XFxjb21tb25cXFVJUG9wdXBMaXN0LmpzXG5cbnZhciBSb29tVHlwZSA9IEZpcmUuZGVmaW5lRW51bSh7XHJcbiAgICBsaXZpbmdSb29tOiAtMSwgIC8v5a6i5Y6FXHJcbiAgICBiZWRSb29tOiAtMSwgICAgIC8v5Y2n5a6kXHJcbiAgICBraXRjaGVuOiAtMSwgICAgIC8v5Y6o5oi/XHJcbiAgICBiYXRocm9vbTogLTEsICAgIC8v5rW05a6kXHJcbiAgICBzdHVkeTogLTEsICAgICAgIC8v5Lmm5oi/XHJcbiAgICBneW06IC0xLCAgICAgICAgIC8v5YGl6Lqr5oi/XHJcbiAgICBiYWxjb255OiAtMSwgICAgIC8v6Ziz5Y+wXHJcbiAgICBnYXJkZW46IC0xICAgICAgIC8v6Iqx5ZutXHJcbn0pO1xyXG5cclxuLy8g5LiL5ouJ5YiX6KGoXHJcbnZhciBVSVBvcHVwTGlzdCA9IEZpcmUuQ2xhc3Moe1xyXG4gICAgLy8g57un5om/XHJcbiAgICBleHRlbmRzOiBGaXJlLkNvbXBvbmVudCxcclxuICAgIC8vIOaehOmAoOWHveaVsFxyXG4gICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLnJvb21UeXBlTGlzdCA9IFtdO1xyXG4gICAgICAgIHRoaXMuYmluZFNob3dMaXN0RXZlbnQgPSB0aGlzLm9uU2hvd0xpc3RFdmVudC5iaW5kKHRoaXMpO1xyXG4gICAgfSxcclxuICAgIC8vXHJcbiAgICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAgICAgLy8g5oi/6Ze057G75Z6LXHJcbiAgICAgICAgcm9vbVR5cGU6IC0xLFxyXG4gICAgICAgIC8vIOeCueWHu+WMuuWfn+W8ueWHuuWIl+ihqFxyXG4gICAgICAgIGJ0bl9yb29tVHlwZToge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlVJQnV0dG9uXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyDkuIvmi4nliJfooahcclxuICAgICAgICBkcm9kb3duTGlzdDoge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiBGaXJlLkVudGl0eVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvLyDmmL7npLrkuIvmi4nliJfooahcclxuICAgIG9uU2hvd0xpc3RFdmVudDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuZHJvZG93bkxpc3QuYWN0aXZlID0gIXRoaXMuZHJvZG93bkxpc3QuYWN0aXZlO1xyXG4gICAgfSxcclxuICAgIC8vIOiOt+WPluaIv+mXtOexu+Wei+aWh+Wtl1xyXG4gICAgX2dldFJvb21UeXBlVGV4dDogZnVuY3Rpb24gKHR5cGUpIHtcclxuICAgICAgICB2YXIgc3RyID0gJ+mAieaLqeexu+Weiy4uJztcclxuICAgICAgICBzd2l0Y2godHlwZSl7XHJcbiAgICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgICAgIHN0ciA9ICflrqLljoUnO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgICAgICAgIHN0ciA9ICfljaflrqQnO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgICAgICAgIHN0ciA9ICfljqjmiL8nO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgNDpcclxuICAgICAgICAgICAgICAgIHN0ciA9ICfmtbTlrqQnO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgNTpcclxuICAgICAgICAgICAgICAgIHN0ciA9ICfkuabmiL8nO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgNjpcclxuICAgICAgICAgICAgICAgIHN0ciA9ICflgaXouqvmiL8nO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgNzpcclxuICAgICAgICAgICAgICAgIHN0ciA9ICfpmLPlj7AnO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgODpcclxuICAgICAgICAgICAgICAgIHN0ciA9ICfoirHlm60nO1xyXG4gICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzdHI7XHJcbiAgICB9LFxyXG4gICAgLy8g6YCJ5oup57G75Z6LXHJcbiAgICBvblNlbGVjdFR5cGVFdmVudDogZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgICAgdGhpcy5kcm9kb3duTGlzdC5hY3RpdmUgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLnJvb21UeXBlID0gcGFyc2VJbnQoZXZlbnQudGFyZ2V0Lm5hbWUpO1xyXG4gICAgICAgIHRoaXMuYnRuX3Jvb21UeXBlLnNldFRleHQodGhpcy5fZ2V0Um9vbVR5cGVUZXh0KHRoaXMucm9vbVR5cGUpKTtcclxuICAgIH0sXHJcbiAgICAvLyDpvKDmoIfmjInkuItcclxuICAgIG9uTW91c2VEb3duRXZlbnQ6IGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgIGlmICh0aGlzLmRyb2Rvd25MaXN0LmFjdGl2ZSAmJiB0aGlzLnJvb21UeXBlTGlzdC5pbmRleE9mKGV2ZW50LnRhcmdldCkgPT09IC0xKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZHJvZG93bkxpc3QuYWN0aXZlID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIOWIneWni+WMluS4i+aLieWIl+ihqFxyXG4gICAgX2luaWlEcm9wRG93bkxpc3Q6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLnJvb21UeXBlTGlzdCA9IFtdO1xyXG4gICAgICAgIHZhciBpbmRleCA9IDE7XHJcbiAgICAgICAgZm9yICh2YXIgaSBpbiBSb29tVHlwZSkge1xyXG4gICAgICAgICAgICB2YXIgZW50ID0gRmlyZS5pbnN0YW50aWF0ZSh0aGlzLnNkYXRhQmFzZS50ZW1wUm9vbVR5cGUpO1xyXG4gICAgICAgICAgICBlbnQucGFyZW50ID0gdGhpcy5kcm9kb3duTGlzdDtcclxuICAgICAgICAgICAgZW50LnRyYW5zZm9ybS5wb3NpdGlvbiA9IG5ldyBGaXJlLlZlYzIoMCwgMTgwIC0gKChpbmRleCAtIDEpICogNTApKTtcclxuICAgICAgICAgICAgZW50Lm5hbWUgPSBpbmRleDtcclxuICAgICAgICAgICAgdmFyIGJ0biA9IGVudC5nZXRDb21wb25lbnQoRmlyZS5VSUJ1dHRvbik7XHJcbiAgICAgICAgICAgIGJ0bi5zZXRUZXh0KHRoaXMuX2dldFJvb21UeXBlVGV4dChpbmRleCkpO1xyXG4gICAgICAgICAgICBidG4ub25DbGljayA9IHRoaXMub25TZWxlY3RUeXBlRXZlbnQuYmluZCh0aGlzKTtcclxuICAgICAgICAgICAgdGhpcy5yb29tVHlwZUxpc3QucHVzaChlbnQpO1xyXG4gICAgICAgICAgICBpbmRleCsrO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICAvLyDlvIDlp4tcclxuICAgIHN0YXJ0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgLy8g5bi455So55qE5Y+Y6YePL+aVsOaNrlxyXG4gICAgICAgIHZhciBlbnQgPSBGaXJlLkVudGl0eS5maW5kKCcvU0RhdGFCYXNlJyk7XHJcbiAgICAgICAgdGhpcy5zZGF0YUJhc2UgPSBlbnQuZ2V0Q29tcG9uZW50KCdTRGF0YUJhc2UnKTtcclxuICAgICAgICAvLyDmiZPlvIDkuIvmi4noj5zljZVcclxuICAgICAgICB0aGlzLmJ0bl9yb29tVHlwZS5vbkNsaWNrID0gdGhpcy5iaW5kU2hvd0xpc3RFdmVudDtcclxuICAgICAgICAvL1xyXG4gICAgICAgIHRoaXMuX2luaWlEcm9wRG93bkxpc3QoKTtcclxuICAgICAgICAvL1xyXG4gICAgICAgIHRoaXMuYmluZGVkTW91c2VEb3duRXZlbnQgPSB0aGlzLm9uTW91c2VEb3duRXZlbnQuYmluZCh0aGlzKTtcclxuICAgICAgICBGaXJlLklucHV0Lm9uKCdtb3VzZWRvd24nLCB0aGlzLmJpbmRlZE1vdXNlRG93bkV2ZW50KTtcclxuICAgIH0sXHJcbiAgICBvbkRlc3Ryb3k6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIEZpcmUuSW5wdXQub2ZmKCdtb3VzZWRvd24nLCB0aGlzLmJpbmRlZE1vdXNlRG93bkV2ZW50KTtcclxuICAgIH1cclxufSk7XHJcbkZpcmUuVUlQb3B1cExpc3QgPSBVSVBvcHVwTGlzdDtcclxuXG5GaXJlLl9SRnBvcCgpOyIsIkZpcmUuX1JGcHVzaChtb2R1bGUsICdzcHJpdGUtYW5pbWF0aW9uLWNsaXAnKTtcbi8vIHNwcml0ZS1hbmltYXRpb24tY2xpcC5qc1xuXG4oZnVuY3Rpb24gKCkge1xuXHJcbi8qKlxyXG4gKiBAY2xhc3MgU3ByaXRlQW5pbWF0aW9uQ2xpcFxyXG4gKi9cclxuXHJcbi8qKlxyXG4gKiBAZW51bSBTcHJpdGVBbmltYXRpb25DbGlwLldyYXBNb2RlXHJcbiAqL1xyXG52YXIgV3JhcE1vZGUgPSBGaXJlLmRlZmluZUVudW0oe1xyXG4gICAgLyoqXHJcbiAgICAgKiBAcHJvcGVydHkgRGVmYXVsdFxyXG4gICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgRGVmYXVsdDogLTEsXHJcbiAgICAvKipcclxuICAgICAqIEBwcm9wZXJ0eSBPbmNlXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBPbmNlOiAtMSxcclxuICAgIC8qKlxyXG4gICAgICogQHByb3BlcnR5IExvb3BcclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIExvb3A6IC0xLFxyXG4gICAgLyoqXHJcbiAgICAgKiBAcHJvcGVydHkgUGluZ1BvbmdcclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIFBpbmdQb25nOiAtMSxcclxuICAgIC8qKlxyXG4gICAgICogQHByb3BlcnR5IENsYW1wRm9yZXZlclxyXG4gICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgQ2xhbXBGb3JldmVyOiAtMVxyXG59KTtcclxuXHJcbi8qKlxyXG4gKiBAZW51bSBTcHJpdGVBbmltYXRpb25DbGlwLlN0b3BBY3Rpb25cclxuICovXHJcbnZhciBTdG9wQWN0aW9uID0gRmlyZS5kZWZpbmVFbnVtKHtcclxuICAgIC8qKlxyXG4gICAgICogRG8gbm90aGluZ1xyXG4gICAgICogQHByb3BlcnR5IERvTm90aGluZ1xyXG4gICAgICogQHR5cGUge251bWJlcn1cclxuICAgICAqL1xyXG4gICAgRG9Ob3RoaW5nOiAtMSxcclxuICAgIC8qKlxyXG4gICAgICogU2V0IHRvIGRlZmF1bHQgc3ByaXRlIHdoZW4gdGhlIHNwcml0ZSBhbmltYXRpb24gc3RvcHBlZFxyXG4gICAgICogQHByb3BlcnR5IERlZmF1bHRTcHJpdGVcclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIERlZmF1bHRTcHJpdGU6IDEsXHJcbiAgICAvKipcclxuICAgICAqIEhpZGUgdGhlIHNwcml0ZSB3aGVuIHRoZSBzcHJpdGUgYW5pbWF0aW9uIHN0b3BwZWRcclxuICAgICAqIEBwcm9wZXJ0eSBIaWRlXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBIaWRlOiAtMSxcclxuICAgIC8qKlxyXG4gICAgICogRGVzdHJveSB0aGUgZW50aXR5IHRoZSBzcHJpdGUgYmVsb25ncyB0byB3aGVuIHRoZSBzcHJpdGUgYW5pbWF0aW9uIHN0b3BwZWRcclxuICAgICAqIEBwcm9wZXJ0eSBEZXN0cm95XHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICBEZXN0cm95OiAtMVxyXG59KTtcclxuXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4vLy8gVGhlIHN0cnVjdHVyZSB0byBkZXNjcmlwIGEgZnJhbWUgaW4gdGhlIHNwcml0ZSBhbmltYXRpb24gY2xpcFxyXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxudmFyIEZyYW1lSW5mbyA9IEZpcmUuZGVmaW5lKCdGcmFtZUluZm8nKVxyXG4gICAgLnByb3AoJ3Nwcml0ZScsIG51bGwsIEZpcmUuT2JqZWN0VHlwZShGaXJlLlNwcml0ZSkpXHJcbiAgICAucHJvcCgnZnJhbWVzJywgMCwgRmlyZS5JbnRlZ2VyX09ic29sZXRlZCk7XHJcblxyXG4vKipcclxuICogVGhlIHNwcml0ZSBhbmltYXRpb24gY2xpcC5cclxuICogQGNsYXNzIFNwcml0ZUFuaW1hdGlvbkNsaXBcclxuICogQGV4dGVuZHMgQ3VzdG9tQXNzZXRcclxuICogQGNvbnN0cnVjdG9yXHJcbiAqL1xyXG52YXIgU3ByaXRlQW5pbWF0aW9uQ2xpcCA9IEZpcmUuQ2xhc3Moe1xyXG4gICAgbmFtZTogJ0ZpcmUuU3ByaXRlQW5pbWF0aW9uQ2xpcCcsXHJcbiAgICAvL1xyXG4gICAgZXh0ZW5kczogRmlyZS5DdXN0b21Bc3NldCxcclxuICAgIC8vXHJcbiAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgLy8gdGhlIGFycmF5IG9mIHRoZSBlbmQgZnJhbWUgb2YgZWFjaCBmcmFtZSBpbmZvXHJcbiAgICAgICAgdGhpcy5fZnJhbWVJbmZvRnJhbWVzID0gbnVsbDtcclxuICAgIH0sXHJcbiAgICAvL1xyXG4gICAgcHJvcGVydGllczoge1xyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIERlZmF1bHQgd3JhcCBtb2RlLlxyXG4gICAgICAgICAqIEBwcm9wZXJ0eSB3cmFwTW9kZVxyXG4gICAgICAgICAqIEB0eXBlIHtTcHJpdGVBbmltYXRpb25DbGlwLldyYXBNb2RlfVxyXG4gICAgICAgICAqIEBkZWZhdWx0IFNwcml0ZUFuaW1hdGlvbkNsaXAuV3JhcE1vZGUuRGVmYXVsdFxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIHdyYXBNb2RlOiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IFdyYXBNb2RlLkRlZmF1bHQsXHJcbiAgICAgICAgICAgIHR5cGU6IFdyYXBNb2RlXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBUaGUgZGVmYXVsdCB0eXBlIG9mIGFjdGlvbiB1c2VkIHdoZW4gdGhlIGFuaW1hdGlvbiBzdG9wcGVkLlxyXG4gICAgICAgICAqIEBwcm9wZXJ0eSBzdG9wQWN0aW9uXHJcbiAgICAgICAgICogQHR5cGUge1Nwcml0ZUFuaW1hdGlvbkNsaXAuU3RvcEFjdGlvbn1cclxuICAgICAgICAgKiBAZGVmYXVsdCBTcHJpdGVBbmltYXRpb25DbGlwLlN0b3BBY3Rpb24uRG9Ob3RoaW5nXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgc3RvcEFjdGlvbjoge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBTdG9wQWN0aW9uLkRvTm90aGluZyxcclxuICAgICAgICAgICAgdHlwZTogU3RvcEFjdGlvblxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgKiBUaGUgZGVmYXVsdCBzcGVlZCBvZiB0aGUgYW5pbWF0aW9uIGNsaXAuXHJcbiAgICAgICAgKiBAcHJvcGVydHkgc3BlZWRcclxuICAgICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgICAgKiBAZGVmYXVsdCAxXHJcbiAgICAgICAgKi9cclxuICAgICAgICBzcGVlZDogMSxcclxuICAgICAgICAvL1xyXG4gICAgICAgIF9mcmFtZVJhdGU6IDYwLFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFRoZSBzYW1wbGUgcmF0ZSB1c2VkIGluIHRoaXMgYW5pbWF0aW9uIGNsaXAuXHJcbiAgICAgICAgICogQHByb3BlcnR5IGZyYW1lUmF0ZVxyXG4gICAgICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgICAgICogQGRlZmF1bHQgNjBcclxuICAgICAgICAgKi9cclxuICAgICAgICBmcmFtZVJhdGU6IHtcclxuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9mcmFtZVJhdGU7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgIT09IHRoaXMuX2ZyYW1lUmF0ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2ZyYW1lUmF0ZSA9IE1hdGgucm91bmQoTWF0aC5tYXgodmFsdWUsIDEpKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLyoqXHJcbiAgICAgICAgICogVGhlIGZyYW1lIGluZm9zIGluIHRoZSBzcHJpdGUgYW5pbWF0aW9uIGNsaXBzLlxyXG4gICAgICAgICAqIGFyZSBhcnJheSBvZiB7c3ByaXRlOiBTcHJpdGUsIGZyYW1lczogU3VzdGFpbmVkX2hvd19tYW55X2ZyYW1lc31cclxuICAgICAgICAgKiBAcHJvcGVydHkgZnJhbWVJbmZvc1xyXG4gICAgICAgICAqIEB0eXBlIHtvYmplY3RbXX1cclxuICAgICAgICAgKiBAZGVmYXVsdCBbXVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZyYW1lSW5mb3M6e1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBbXSxcclxuICAgICAgICAgICAgdHlwZTogRnJhbWVJbmZvXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vXHJcbiAgICBnZXRUb3RhbEZyYW1lczogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGZyYW1lcyA9IDA7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmZyYW1lSW5mb3MubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICAgICAgZnJhbWVzICs9IHRoaXMuZnJhbWVJbmZvc1tpXS5mcmFtZXM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmcmFtZXM7XHJcbiAgICB9LFxyXG4gICAgLy9cclxuICAgIGdldEZyYW1lSW5mb0ZyYW1lczogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2ZyYW1lSW5mb0ZyYW1lcyA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aGlzLl9mcmFtZUluZm9GcmFtZXMgPSBuZXcgQXJyYXkodGhpcy5mcmFtZUluZm9zLmxlbmd0aCk7XHJcbiAgICAgICAgICAgIHZhciB0b3RhbEZyYW1lcyA9IDA7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5mcmFtZUluZm9zLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgICAgICB0b3RhbEZyYW1lcyArPSB0aGlzLmZyYW1lSW5mb3NbaV0uZnJhbWVzO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fZnJhbWVJbmZvRnJhbWVzW2ldID0gdG90YWxGcmFtZXM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZyYW1lSW5mb0ZyYW1lcztcclxuICAgIH1cclxufSk7XHJcblxyXG5TcHJpdGVBbmltYXRpb25DbGlwLldyYXBNb2RlID0gV3JhcE1vZGU7XHJcblxyXG5TcHJpdGVBbmltYXRpb25DbGlwLlN0b3BBY3Rpb24gPSBTdG9wQWN0aW9uO1xyXG5cclxuRmlyZS5hZGRDdXN0b21Bc3NldE1lbnUoU3ByaXRlQW5pbWF0aW9uQ2xpcCwgXCJOZXcgU3ByaXRlIEFuaW1hdGlvblwiKTtcclxuXHJcbkZpcmUuU3ByaXRlQW5pbWF0aW9uQ2xpcCA9IFNwcml0ZUFuaW1hdGlvbkNsaXA7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNwcml0ZUFuaW1hdGlvbkNsaXA7XHJcbn0pKCk7XG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKG1vZHVsZSwgJ3Nwcml0ZS1hbmltYXRpb24tc3RhdGUnKTtcbi8vIHNwcml0ZS1hbmltYXRpb24tc3RhdGUuanNcblxuKGZ1bmN0aW9uICgpIHtcbnZhciBTcHJpdGVBbmltYXRpb25DbGlwID0gcmVxdWlyZSgnc3ByaXRlLWFuaW1hdGlvbi1jbGlwJyk7XHJcblxyXG4vKipcclxuICogVGhlIHNwcml0ZSBhbmltYXRpb24gc3RhdGUuXHJcbiAqIEBjbGFzcyBTcHJpdGVBbmltYXRpb25TdGF0ZVxyXG4gKiBAY29uc3RydWN0b3JcclxuICogQHBhcmFtIHtTcHJpdGVBbmltYXRpb25DbGlwfSBhbmltQ2xpcFxyXG4gKi9cclxudmFyIFNwcml0ZUFuaW1hdGlvblN0YXRlID0gZnVuY3Rpb24gKGFuaW1DbGlwKSB7XHJcbiAgICBpZiAoIWFuaW1DbGlwKSB7XHJcbi8vIEBpZiBERVZcclxuICAgICAgICBGaXJlLmVycm9yKCdVbnNwZWNpZmllZCBzcHJpdGUgYW5pbWF0aW9uIGNsaXAnKTtcclxuLy8gQGVuZGlmXHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgbmFtZSBvZiB0aGUgc3ByaXRlIGFuaW1hdGlvbiBzdGF0ZS5cclxuICAgICAqIEBwcm9wZXJ0eSBuYW1lXHJcbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxyXG4gICAgICovXHJcbiAgICB0aGlzLm5hbWUgPSBhbmltQ2xpcC5uYW1lO1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgcmVmZXJlbmNlZCBzcHJpdGUgYW5pbWF0aW9uIGNsaXBcclxuICAgICAqIEBwcm9wZXJ0eSBjbGlwXHJcbiAgICAgKiBAdHlwZSB7U3ByaXRlQW5pbWF0aW9uQ2xpcH1cclxuICAgICAqL1xyXG4gICAgdGhpcy5jbGlwID0gYW5pbUNsaXA7XHJcbiAgICAvKipcclxuICAgICAqIFRoZSB3cmFwIG1vZGVcclxuICAgICAqIEBwcm9wZXJ0eSB3cmFwTW9kZVxyXG4gICAgICogQHR5cGUge1Nwcml0ZUFuaW1hdGlvbkNsaXAuV3JhcE1vZGV9XHJcbiAgICAgKi9cclxuICAgIHRoaXMud3JhcE1vZGUgPSBhbmltQ2xpcC53cmFwTW9kZTtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIHN0b3AgYWN0aW9uXHJcbiAgICAgKiBAcHJvcGVydHkgc3RvcEFjdGlvblxyXG4gICAgICogQHR5cGUge1Nwcml0ZUFuaW1hdGlvbkNsaXAuU3RvcEFjdGlvbn1cclxuICAgICAqL1xyXG4gICAgdGhpcy5zdG9wQWN0aW9uID0gYW5pbUNsaXAuc3RvcEFjdGlvbjtcclxuICAgIC8qKlxyXG4gICAgICogVGhlIHNwZWVkIHRvIHBsYXkgdGhlIHNwcml0ZSBhbmltYXRpb24gY2xpcFxyXG4gICAgICogQHByb3BlcnR5IHNwZWVkXHJcbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxyXG4gICAgICovXHJcbiAgICB0aGlzLnNwZWVkID0gYW5pbUNsaXAuc3BlZWQ7XHJcbiAgICAvLyB0aGUgYXJyYXkgb2YgdGhlIGVuZCBmcmFtZSBvZiBlYWNoIGZyYW1lIGluZm8gaW4gdGhlIHNwcml0ZSBhbmltYXRpb24gY2xpcFxyXG4gICAgdGhpcy5fZnJhbWVJbmZvRnJhbWVzID0gYW5pbUNsaXAuZ2V0RnJhbWVJbmZvRnJhbWVzKCk7XHJcbiAgICAvKipcclxuICAgICAqIFRoZSB0b3RhbCBmcmFtZSBjb3VudCBvZiB0aGUgc3ByaXRlIGFuaW1hdGlvbiBjbGlwXHJcbiAgICAgKiBAcHJvcGVydHkgdG90YWxGcmFtZXNcclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIHRoaXMudG90YWxGcmFtZXMgPSB0aGlzLl9mcmFtZUluZm9GcmFtZXMubGVuZ3RoID4gMCA/IHRoaXMuX2ZyYW1lSW5mb0ZyYW1lc1t0aGlzLl9mcmFtZUluZm9GcmFtZXMubGVuZ3RoIC0gMV0gOiAwO1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgbGVuZ3RoIG9mIHRoZSBzcHJpdGUgYW5pbWF0aW9uIGluIHNlY29uZHMgd2l0aCBzcGVlZCA9IDEuMGZcclxuICAgICAqIEBwcm9wZXJ0eSBsZW5ndGhcclxuICAgICAqIEB0eXBlIHtudW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIHRoaXMubGVuZ3RoID0gdGhpcy50b3RhbEZyYW1lcyAvIGFuaW1DbGlwLmZyYW1lUmF0ZTtcclxuICAgIC8vIFRoZSBjdXJyZW50IGluZGV4IG9mIGZyYW1lLiBUaGUgdmFsdWUgY2FuIGJlIGxhcmdlciB0aGFuIHRvdGFsRnJhbWVzLlxyXG4gICAgLy8gSWYgdGhlIGZyYW1lIGlzIGxhcmdlciB0aGFuIHRvdGFsRnJhbWVzIGl0IHdpbGwgYmUgd3JhcHBlZCBhY2NvcmRpbmcgdG8gd3JhcE1vZGUuXHJcbiAgICB0aGlzLmZyYW1lID0gLTE7XHJcbiAgICAvLyB0aGUgY3VycmVudCB0aW1lIGluIHNlb25jZHNcclxuICAgIHRoaXMudGltZSA9IDA7XHJcbiAgICAvLyBjYWNoZSByZXN1bHQgb2YgR2V0Q3VycmVudEluZGV4XHJcbiAgICB0aGlzLl9jYWNoZWRJbmRleCA9IC0xO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFJlY29tcHV0ZSBhIG5ldyBzcGVlZCB0byBtYWtlIHRoZSBkdXJhdGlvbiBvZiB0aGlzIGFuaW1hdGlvbiBlcXVhbHMgdG8gc3BlY2lmaWVkIHZhbHVlLlxyXG4gKiBAbWV0aG9kIHNldER1cmF0aW9uXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBkdXJhdGlvbiAtIFRoZSBleHBlY3RlZCBkdXJhdGlvbi5cclxuICovXHJcblNwcml0ZUFuaW1hdGlvblN0YXRlLnByb3RvdHlwZS5zZXREdXJhdGlvbiA9IGZ1bmN0aW9uIChkdXJhdGlvbikge1xyXG4gICAgdGhpcy5zcGVlZCA9IGR1cmF0aW9uIC8gdGhpcy5sZW5ndGg7XHJcbn07XHJcblxyXG4vKipcclxuICogVGhlIGN1cnJlbnQgZnJhbWUgaW5mbyBpbmRleC5cclxuICogQG1ldGhvZCBnZXRDdXJyZW50SW5kZXhcclxuICogQHJldHVybiB7bnVtYmVyfVxyXG4gKi9cclxuU3ByaXRlQW5pbWF0aW9uU3RhdGUucHJvdG90eXBlLmdldEN1cnJlbnRJbmRleCA9IGZ1bmN0aW9uICgpIHtcclxuICAgIGlmICh0aGlzLnRvdGFsRnJhbWVzID4gMSkge1xyXG4gICAgICAgIC8vaW50IG9sZEZyYW1lID0gZnJhbWU7XHJcbiAgICAgICAgdGhpcy5mcmFtZSA9IE1hdGguZmxvb3IodGhpcy50aW1lICogdGhpcy5jbGlwLmZyYW1lUmF0ZSk7XHJcbiAgICAgICAgaWYgKHRoaXMuZnJhbWUgPCAwKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZnJhbWUgPSAtdGhpcy5mcmFtZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciB3cmFwcGVkSW5kZXg7XHJcbiAgICAgICAgaWYgKHRoaXMud3JhcE1vZGUgIT09IFNwcml0ZUFuaW1hdGlvbkNsaXAuV3JhcE1vZGUuUGluZ1BvbmcpIHtcclxuICAgICAgICAgICAgd3JhcHBlZEluZGV4ID0gX3dyYXAodGhpcy5mcmFtZSwgdGhpcy50b3RhbEZyYW1lcyAtIDEsIHRoaXMud3JhcE1vZGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgd3JhcHBlZEluZGV4ID0gdGhpcy5mcmFtZTtcclxuICAgICAgICAgICAgdmFyIGNudCA9IE1hdGguZmxvb3Iod3JhcHBlZEluZGV4IC8gdGhpcy50b3RhbEZyYW1lcyk7XHJcbiAgICAgICAgICAgIHdyYXBwZWRJbmRleCAlPSB0aGlzLnRvdGFsRnJhbWVzO1xyXG4gICAgICAgICAgICBpZiAoKGNudCAmIDB4MSkgPT09IDEpIHtcclxuICAgICAgICAgICAgICAgIHdyYXBwZWRJbmRleCA9IHRoaXMudG90YWxGcmFtZXMgLSAxIC0gd3JhcHBlZEluZGV4O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyB0cnkgdG8gdXNlIGNhY2hlZCBmcmFtZSBpbmZvIGluZGV4XHJcbiAgICAgICAgaWYgKHRoaXMuX2NhY2hlZEluZGV4IC0gMSA+PSAwICYmXHJcbiAgICAgICAgICAgIHdyYXBwZWRJbmRleCA+PSB0aGlzLl9mcmFtZUluZm9GcmFtZXNbdGhpcy5fY2FjaGVkSW5kZXggLSAxXSAmJlxyXG4gICAgICAgICAgICB3cmFwcGVkSW5kZXggPCB0aGlzLl9mcmFtZUluZm9GcmFtZXNbdGhpcy5fY2FjaGVkSW5kZXhdKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9jYWNoZWRJbmRleDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHNlYXJjaCBmcmFtZSBpbmZvXHJcbiAgICAgICAgdmFyIGZyYW1lSW5mb0luZGV4ID0gRmlyZS5iaW5hcnlTZWFyY2godGhpcy5fZnJhbWVJbmZvRnJhbWVzLCB3cmFwcGVkSW5kZXggKyAxKTtcclxuICAgICAgICBpZiAoZnJhbWVJbmZvSW5kZXggPCAwKSB7XHJcbiAgICAgICAgICAgIGZyYW1lSW5mb0luZGV4ID0gfmZyYW1lSW5mb0luZGV4O1xyXG4gICAgICAgIH1cclxuICAgICAgICB0aGlzLl9jYWNoZWRJbmRleCA9IGZyYW1lSW5mb0luZGV4O1xyXG4gICAgICAgIHJldHVybiBmcmFtZUluZm9JbmRleDtcclxuICAgIH1cclxuICAgIGVsc2UgaWYgKHRoaXMudG90YWxGcmFtZXMgPT09IDEpIHtcclxuICAgICAgICByZXR1cm4gMDtcclxuICAgIH1cclxuICAgIGVsc2Uge1xyXG4gICAgICAgIHJldHVybiAtMTtcclxuICAgIH1cclxufTtcclxuXHJcbmZ1bmN0aW9uIF93cmFwIChfdmFsdWUsIF9tYXhWYWx1ZSwgX3dyYXBNb2RlKSB7XHJcbiAgICBpZiAoX21heFZhbHVlID09PSAwKSB7XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICB9XHJcbiAgICBpZiAoX3ZhbHVlIDwgMCkge1xyXG4gICAgICAgIF92YWx1ZSA9IC1fdmFsdWU7XHJcbiAgICB9XHJcbiAgICBpZiAoX3dyYXBNb2RlID09PSBTcHJpdGVBbmltYXRpb25DbGlwLldyYXBNb2RlLkxvb3ApIHtcclxuICAgICAgICByZXR1cm4gX3ZhbHVlICUgKF9tYXhWYWx1ZSArIDEpO1xyXG4gICAgfVxyXG4gICAgZWxzZSBpZiAoX3dyYXBNb2RlID09PSBTcHJpdGVBbmltYXRpb25DbGlwLldyYXBNb2RlLlBpbmdQb25nKSB7XHJcbiAgICAgICAgdmFyIGNudCA9IE1hdGguZmxvb3IoX3ZhbHVlIC8gX21heFZhbHVlKTtcclxuICAgICAgICBfdmFsdWUgJT0gX21heFZhbHVlO1xyXG4gICAgICAgIGlmIChjbnQgJSAyID09PSAxKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBfbWF4VmFsdWUgLSBfdmFsdWU7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZWxzZSB7XHJcbiAgICAgICAgaWYgKF92YWx1ZSA8IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChfdmFsdWUgPiBfbWF4VmFsdWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIF9tYXhWYWx1ZTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gX3ZhbHVlO1xyXG59XHJcblxyXG5GaXJlLlNwcml0ZUFuaW1hdGlvblN0YXRlID0gU3ByaXRlQW5pbWF0aW9uU3RhdGU7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFNwcml0ZUFuaW1hdGlvblN0YXRlO1xyXG59KSgpO1xuXG5GaXJlLl9SRnBvcCgpOyIsIkZpcmUuX1JGcHVzaChtb2R1bGUsICdzcHJpdGUtYW5pbWF0aW9uJyk7XG4vLyBzcHJpdGUtYW5pbWF0aW9uLmpzXG5cbihmdW5jdGlvbiAoKSB7XG52YXIgU3ByaXRlQW5pbWF0aW9uQ2xpcCA9IHJlcXVpcmUoJ3Nwcml0ZS1hbmltYXRpb24tY2xpcCcpO1xyXG52YXIgU3ByaXRlQW5pbWF0aW9uU3RhdGUgPSByZXF1aXJlKCdzcHJpdGUtYW5pbWF0aW9uLXN0YXRlJyk7XHJcblxyXG4vKipcclxuICogVGhlIHNwcml0ZSBhbmltYXRpb24gQ29tcG9uZW50LlxyXG4gKiBAY2xhc3MgU3ByaXRlQW5pbWF0aW9uXHJcbiAqIEBleHRlbmRzIENvbXBvbmVudFxyXG4gKiBAY29uc3RydWN0b3JcclxuICovXHJcbnZhciBTcHJpdGVBbmltYXRpb24gPSBGaXJlLkNsYXNzKHtcclxuICAgIC8vXHJcbiAgICBuYW1lOiBcIkZpcmUuU3ByaXRlQW5pbWF0aW9uXCIsXHJcbiAgICAvL1xyXG4gICAgZXh0ZW5kczogRmlyZS5Db21wb25lbnQsXHJcbiAgICAvL1xyXG4gICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuX25hbWVUb1N0YXRlID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9jdXJBbmltYXRpb24gPSBudWxsO1xyXG4gICAgICAgIHRoaXMuX3Nwcml0ZVJlbmRlcmVyID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9kZWZhdWx0U3ByaXRlID0gbnVsbDtcclxuICAgICAgICB0aGlzLl9sYXN0RnJhbWVJbmRleCA9IC0xO1xyXG4gICAgICAgIHRoaXMuX2N1ckluZGV4ID0gLTE7XHJcbiAgICAgICAgdGhpcy5fcGxheVN0YXJ0RnJhbWUgPSAwOy8vIOWcqOiwg+eUqFBsYXnnmoTlvZPluKfnmoRMYXRlVXBkYXRl5LiN6L+b6KGMc3RlcFxyXG4gICAgfSxcclxuICAgIC8vXHJcbiAgICBwcm9wZXJ0aWVzOntcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBUaGUgZGVmYXVsdCBhbmltYXRpb24uXHJcbiAgICAgICAgICogQHByb3BlcnR5IGRlZmF1bHRBbmltYXRpb25cclxuICAgICAgICAgKiBAdHlwZSB7U3ByaXRlQW5pbWF0aW9uQ2xpcH1cclxuICAgICAgICAgKiBAZGVmYXVsdCBudWxsXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZGVmYXVsdEFuaW1hdGlvbjoge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICAgICAgICB0eXBlOiBGaXJlLlNwcml0ZUFuaW1hdGlvbkNsaXBcclxuICAgICAgICB9LFxyXG4gICAgICAgIC8qKlxyXG4gICAgICAgICAqIFRoZSBBbmltYXRlZCBjbGlwIGxpc3QuXHJcbiAgICAgICAgICogQHByb3BlcnR5IGFuaW1hdGlvbnNcclxuICAgICAgICAgKiBAdHlwZSB7U3ByaXRlQW5pbWF0aW9uQ2xpcFtdfVxyXG4gICAgICAgICAqIEBkZWZhdWx0IFtdXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgYW5pbWF0aW9uczoge1xyXG4gICAgICAgICAgICBkZWZhdWx0OiBbXSxcclxuICAgICAgICAgICAgdHlwZTogRmlyZS5TcHJpdGVBbmltYXRpb25DbGlwXHJcbiAgICAgICAgfSxcclxuICAgICAgICAvL1xyXG4gICAgICAgIF9wbGF5QXV0b21hdGljYWxseTogdHJ1ZSxcclxuICAgICAgICAvKipcclxuICAgICAgICAgKiBTaG91bGQgdGhlIGRlZmF1bHQgYW5pbWF0aW9uIGNsaXAgKEFuaW1hdGlvbi5jbGlwKSBhdXRvbWF0aWNhbGx5IHN0YXJ0IHBsYXlpbmcgb24gc3RhcnR1cC5cclxuICAgICAgICAgKiBAcHJvcGVydHkgcGxheUF1dG9tYXRpY2FsbHlcclxuICAgICAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cclxuICAgICAgICAgKiBAZGVmYXVsdCB0cnVlXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgcGxheUF1dG9tYXRpY2FsbHk6IHtcclxuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9wbGF5QXV0b21hdGljYWxseTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuX3BsYXlBdXRvbWF0aWNhbGx5ID0gdmFsdWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy9cclxuICAgIF9pbml0OiBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgaW5pdGlhbGl6ZWQgPSAodGhpcy5fbmFtZVRvU3RhdGUgIT09IG51bGwpO1xyXG4gICAgICAgIGlmIChpbml0aWFsaXplZCA9PT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgdGhpcy5fc3ByaXRlUmVuZGVyZXIgPSB0aGlzLmVudGl0eS5nZXRDb21wb25lbnQoRmlyZS5TcHJpdGVSZW5kZXJlcik7XHJcbiAgICAgICAgICAgIGlmICghIHRoaXMuX3Nwcml0ZVJlbmRlcmVyKSB7XHJcbiAgICAgICAgICAgICAgICBGaXJlLmVycm9yKFwiQ2FuIG5vdCBwbGF5IHNwcml0ZSBhbmltYXRpb24gYmVjYXVzZSBTcHJpdGVSZW5kZXJlciBpcyBub3QgZm91bmRcIik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZWxzZXtcclxuICAgICAgICAgICAgICAgIHRoaXMuX2RlZmF1bHRTcHJpdGUgPSB0aGlzLl9zcHJpdGVSZW5kZXJlci5zcHJpdGU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHRoaXMuX25hbWVUb1N0YXRlID0ge307XHJcbiAgICAgICAgICAgIHZhciBzdGF0ZSA9IG51bGw7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5hbmltYXRpb25zLmxlbmd0aDsgKytpKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgY2xpcCA9IHRoaXMuYW5pbWF0aW9uc1tpXTtcclxuICAgICAgICAgICAgICAgIGlmIChjbGlwICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RhdGUgPSBuZXcgU3ByaXRlQW5pbWF0aW9uU3RhdGUoY2xpcCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fbmFtZVRvU3RhdGVbc3RhdGUubmFtZV0gPSBzdGF0ZTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKHRoaXMuZGVmYXVsdEFuaW1hdGlvbiAmJiAhdGhpcy5nZXRBbmltU3RhdGUodGhpcy5kZWZhdWx0QW5pbWF0aW9uLm5hbWUpKSB7XHJcbiAgICAgICAgICAgICAgICBzdGF0ZSA9IG5ldyBTcHJpdGVBbmltYXRpb25TdGF0ZSh0aGlzLmRlZmF1bHRBbmltYXRpb24pO1xyXG4gICAgICAgICAgICAgICAgdGhpcy5fbmFtZVRvU3RhdGVbc3RhdGUubmFtZV0gPSBzdGF0ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBHZXQgQW5pbWF0aW9uIFN0YXRlLlxyXG4gICAgICogQG1ldGhvZCBnZXRBbmltU3RhdGVcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBhbmltTmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBhbmltYXRpb25cclxuICAgICAqIEByZXR1cm4ge1Nwcml0ZUFuaW1hdGlvblN0YXRlfVxyXG4gICAgICovXHJcbiAgICBnZXRBbmltU3RhdGU6IGZ1bmN0aW9uIChuYW1lKSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuX25hbWVUb1N0YXRlICYmIHRoaXMuX25hbWVUb1N0YXRlW25hbWVdO1xyXG4gICAgfSxcclxuICAgIC8qKlxyXG4gICAgICogSW5kaWNhdGVzIHdoZXRoZXIgdGhlIGFuaW1hdGlvbiBpcyBwbGF5aW5nXHJcbiAgICAgKiBAbWV0aG9kIGlzUGxheWluZ1xyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IFtuYW1lXSAtIFRoZSBuYW1lIG9mIHRoZSBhbmltYXRpb25cclxuICAgICAqIEByZXR1cm4ge2Jvb2xlYW59XHJcbiAgICAgKi9cclxuICAgIGlzUGxheWluZzogZnVuY3Rpb24obmFtZSkge1xyXG4gICAgICAgIHZhciBwbGF5aW5nQW5pbSA9IHRoaXMuZW5hYmxlZCAmJiB0aGlzLl9jdXJBbmltYXRpb247XHJcbiAgICAgICAgcmV0dXJuICEhcGxheWluZ0FuaW0gJiYgKCAhbmFtZSB8fCBwbGF5aW5nQW5pbS5uYW1lID09PSBuYW1lICk7XHJcbiAgICB9LFxyXG4gICAgLyoqXHJcbiAgICAgKiBQbGF5IEFuaW1hdGlvblxyXG4gICAgICogQG1ldGhvZCBwbGF5XHJcbiAgICAgKiBAcGFyYW0ge1Nwcml0ZUFuaW1hdGlvblN0YXRlfSBbYW5pbVN0YXRlXSAtIFRoZSBhbmltU3RhdGUgb2YgdGhlIHNwcml0ZSBBbmltYXRpb24gc3RhdGUgb3IgYW5pbWF0aW9uIG5hbWVcclxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBbdGltZV0gLSBUaGUgdGltZSBvZiB0aGUgYW5pbWF0aW9uIHRpbWVcclxuICAgICAqL1xyXG4gICAgcGxheTogZnVuY3Rpb24gKGFuaW1TdGF0ZSwgdGltZSkge1xyXG4gICAgICAgIGlmICh0eXBlb2YgYW5pbVN0YXRlID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICB0aGlzLl9jdXJBbmltYXRpb24gPSB0aGlzLmdldEFuaW1TdGF0ZShhbmltU3RhdGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgdGhpcy5fY3VyQW5pbWF0aW9uID0gYW5pbVN0YXRlIHx8IG5ldyBTcHJpdGVBbmltYXRpb25TdGF0ZSh0aGlzLmRlZmF1bHRBbmltYXRpb24pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHRoaXMuX2N1ckFuaW1hdGlvbiAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aGlzLl9jdXJJbmRleCA9IC0xO1xyXG4gICAgICAgICAgICB0aGlzLl9jdXJBbmltYXRpb24udGltZSA9IHRpbWUgfHwgMDtcclxuICAgICAgICAgICAgdGhpcy5fcGxheVN0YXJ0RnJhbWUgPSBGaXJlLlRpbWUuZnJhbWVDb3VudDtcclxuICAgICAgICAgICAgdGhpcy5fc2FtcGxlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8qKlxyXG4gICAgICogU3RvcCBBbmltYXRpb25cclxuICAgICAqIEBtZXRob2Qgc3RvcFxyXG4gICAgICogQHBhcmFtIHtTcHJpdGVBbmltYXRpb25TdGF0ZX0gW2FuaW1TdGF0ZV0gLSBUaGUgYW5pbVN0YXRlIG9mIHRoZSBzcHJpdGUgYW5pbWF0aW9uIHN0YXRlIG9yIGFuaW1hdGlvbiBuYW1lXHJcbiAgICAgKi9cclxuICAgIHN0b3A6IGZ1bmN0aW9uIChhbmltU3RhdGUpIHtcclxuICAgICAgICBpZiAodHlwZW9mIGFuaW1TdGF0ZSA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgdGhpcy5fY3VyQW5pbWF0aW9uID0gdGhpcy5nZXRBbmltU3RhdGUoYW5pbVN0YXRlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2N1ckFuaW1hdGlvbiA9IGFuaW1TdGF0ZSB8fCBuZXcgU3ByaXRlQW5pbWF0aW9uU3RhdGUodGhpcy5kZWZhdWx0QW5pbWF0aW9uKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICh0aGlzLl9jdXJBbmltYXRpb24gIT09IG51bGwpIHtcclxuXHJcbiAgICAgICAgICAgIHRoaXMuX2N1ckFuaW1hdGlvbi50aW1lID0gMDtcclxuXHJcbiAgICAgICAgICAgIHZhciBzdG9wQWN0aW9uID0gdGhpcy5fY3VyQW5pbWF0aW9uLnN0b3BBY3Rpb247XHJcblxyXG4gICAgICAgICAgICBzd2l0Y2ggKHN0b3BBY3Rpb24pIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgU3ByaXRlQW5pbWF0aW9uQ2xpcC5TdG9wQWN0aW9uLkRvTm90aGluZzpcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgU3ByaXRlQW5pbWF0aW9uQ2xpcC5TdG9wQWN0aW9uLkRlZmF1bHRTcHJpdGU6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc3ByaXRlUmVuZGVyZXIuc3ByaXRlID0gdGhpcy5fZGVmYXVsdFNwcml0ZTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGNhc2UgU3ByaXRlQW5pbWF0aW9uQ2xpcC5TdG9wQWN0aW9uLkhpZGU6XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fc3ByaXRlUmVuZGVyZXIuZW5hYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBTcHJpdGVBbmltYXRpb25DbGlwLlN0b3BBY3Rpb24uRGVzdHJveTpcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmVudGl0eS5kZXN0cm95KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB0aGlzLl9jdXJBbmltYXRpb24gPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBvbkxvYWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHRoaXMuX2luaXQoKTtcclxuICAgICAgICBpZiAodGhpcy5lbmFibGVkKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLl9wbGF5QXV0b21hdGljYWxseSAmJiB0aGlzLmRlZmF1bHRBbmltYXRpb24pIHtcclxuICAgICAgICAgICAgICAgIHZhciBhbmltU3RhdGUgPSB0aGlzLmdldEFuaW1TdGF0ZSh0aGlzLmRlZmF1bHRBbmltYXRpb24ubmFtZSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnBsYXkoYW5pbVN0YXRlLCAwKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBsYXRlVXBkYXRlOiBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAodGhpcy5fY3VyQW5pbWF0aW9uICE9PSBudWxsICYmIEZpcmUuVGltZS5mcmFtZUNvdW50ID4gdGhpcy5fcGxheVN0YXJ0RnJhbWUpIHtcclxuICAgICAgICAgICAgdmFyIGRlbHRhID0gRmlyZS5UaW1lLmRlbHRhVGltZSAqIHRoaXMuX2N1ckFuaW1hdGlvbi5zcGVlZDtcclxuICAgICAgICAgICAgdGhpcy5fc3RlcChkZWx0YSk7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIF9zdGVwOiBmdW5jdGlvbiAoZGVsdGFUaW1lKSB7XHJcbiAgICAgICAgaWYgKHRoaXMuX2N1ckFuaW1hdGlvbiAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0aGlzLl9jdXJBbmltYXRpb24udGltZSArPSBkZWx0YVRpbWU7XHJcbiAgICAgICAgICAgIHRoaXMuX3NhbXBsZSgpO1xyXG4gICAgICAgICAgICB2YXIgc3RvcCA9IGZhbHNlO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5fY3VyQW5pbWF0aW9uLndyYXBNb2RlID09PSBTcHJpdGVBbmltYXRpb25DbGlwLldyYXBNb2RlLk9uY2UgfHxcclxuICAgICAgICAgICAgICAgIHRoaXMuX2N1ckFuaW1hdGlvbi53cmFwTW9kZSA9PT0gU3ByaXRlQW5pbWF0aW9uQ2xpcC5XcmFwTW9kZS5EZWZhdWx0IHx8XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9jdXJBbmltYXRpb24ud3JhcE1vZGUgPT09IFNwcml0ZUFuaW1hdGlvbkNsaXAuV3JhcE1vZGUuQ2xhbXBGb3JldmVyKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fY3VyQW5pbWF0aW9uLnNwZWVkID4gMCAmJiB0aGlzLl9jdXJBbmltYXRpb24uZnJhbWUgPj0gdGhpcy5fY3VyQW5pbWF0aW9uLnRvdGFsRnJhbWVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX2N1ckFuaW1hdGlvbi53cmFwTW9kZSA9PT0gU3ByaXRlQW5pbWF0aW9uQ2xpcC5XcmFwTW9kZS5DbGFtcEZvcmV2ZXIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RvcCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9jdXJBbmltYXRpb24uZnJhbWUgPSB0aGlzLl9jdXJBbmltYXRpb24udG90YWxGcmFtZXM7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2N1ckFuaW1hdGlvbi50aW1lID0gdGhpcy5fY3VyQW5pbWF0aW9uLmZyYW1lIC8gdGhpcy5fY3VyQW5pbWF0aW9uLmNsaXAuZnJhbWVSYXRlO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3RvcCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2N1ckFuaW1hdGlvbi5mcmFtZSA9IHRoaXMuX2N1ckFuaW1hdGlvbi50b3RhbEZyYW1lcztcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBlbHNlIGlmICh0aGlzLl9jdXJBbmltYXRpb24uc3BlZWQgPCAwICYmIHRoaXMuX2N1ckFuaW1hdGlvbi5mcmFtZSA8IDApIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fY3VyQW5pbWF0aW9uLndyYXBNb2RlID09PSBTcHJpdGVBbmltYXRpb25DbGlwLldyYXBNb2RlLkNsYW1wRm9yZXZlcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzdG9wID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2N1ckFuaW1hdGlvbi50aW1lID0gMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fY3VyQW5pbWF0aW9uLmZyYW1lID0gMDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0b3AgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9jdXJBbmltYXRpb24uZnJhbWUgPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gZG8gc3RvcFxyXG4gICAgICAgICAgICBpZiAoc3RvcCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5zdG9wKHRoaXMuX2N1ckFuaW1hdGlvbik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2N1ckluZGV4ID0gLTE7XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIF9zYW1wbGU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAodGhpcy5fY3VyQW5pbWF0aW9uICE9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHZhciBuZXdJbmRleCA9IHRoaXMuX2N1ckFuaW1hdGlvbi5nZXRDdXJyZW50SW5kZXgoKTtcclxuICAgICAgICAgICAgaWYgKG5ld0luZGV4ID49IDAgJiYgbmV3SW5kZXggIT09IHRoaXMuX2N1ckluZGV4KSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLl9zcHJpdGVSZW5kZXJlci5zcHJpdGUgPSB0aGlzLl9jdXJBbmltYXRpb24uY2xpcC5mcmFtZUluZm9zW25ld0luZGV4XS5zcHJpdGU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy5fY3VySW5kZXggPSBuZXdJbmRleDtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgIHRoaXMuX2N1ckluZGV4ID0gLTE7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59KTtcclxuXHJcbkZpcmUuU3ByaXRlQW5pbWF0aW9uID0gU3ByaXRlQW5pbWF0aW9uO1xyXG5cclxuRmlyZS5hZGRDb21wb25lbnRNZW51KFNwcml0ZUFuaW1hdGlvbiwgJ1Nwcml0ZSBBbmltYXRpb24nKTtcclxufSkoKTtcblxuRmlyZS5fUkZwb3AoKTsiXX0=
