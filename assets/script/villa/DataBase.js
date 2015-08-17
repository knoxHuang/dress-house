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
        self.characters.entity.active = false;
        if (self.familyList.length > 0) {
            var hostInfo = self.familyList[0];
            self.characters.refreshCharacters(hostInfo);
        }
        // 家人数据
        if (self.familyList.length > 2) {
            self.familys.refreshFamily(self.familyList);
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
        // 屋主形象
        ent = Fire.Entity.find('/Characters');
        this.characters = ent.getComponent('Characters');
        // 家人形象
        ent = Fire.Entity.find('/Familys');
        this.familys = ent.getComponent('Family');
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
