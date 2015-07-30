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
