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
        // 关系ID
        this.selectID = -1;
        //
        this.hasHouse = false;
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

        this.checkHouse();
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
        ent = Fire.Entity.find('/Tip_NoAddFamily1');
        this.tipNoAddFamily1 = ent.getComponent('TipsWindow');
        ent = Fire.Entity.find('/Tip_NoAddFamily2');
        this.tipNoAddFamily2 = ent.getComponent('TipsWindow');
        //
        ent = Fire.Entity.find('/Tip_RelationMgr');
        this.relationMgr = ent.getComponent('RelationMgr');
        //
        ent = Fire.Entity.find('/Win_NoHouse');
        this.noHouseWindow = ent.getComponent('NoHouseWindow');
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

    checkHouse: function () {
        var self = this;
        self.serverNetWork.RquestCheckHouse(function (serverData) {
            self.hasHouse = serverData.hadhouse == 1;
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
    },

    nohouseaboutList: function (callback) {
        var self = this;
        self.serverNetWork.RequestNohouseaboutList(function (serverData) {
            if (callback) {
                callback(serverData);
            }
        })
    }

});
