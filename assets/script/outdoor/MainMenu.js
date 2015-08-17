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
                var hostInfo = serverData.family[0];
                self.odataBase.characters.refreshCharacters(hostInfo);
            }
            // 家人数据
            if(serverData.family.length > 2) {
                self.odataBase.familys.refreshFamily(serverData.family);
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
            var hasHouse = serverData.list.type === 2;
            self.odataBase.house.onClick = function () {
                if (type === 1) {
                    self.odataBase.globalData.gotoType = 2;
                    Fire.Engine.loadScene('single');
                }
                else {
                    if(hasHouse) {
                        self.openNoHouse();
                    }
                    else {
                        self.odataBase.globalData.gotoType = 2;
                        Fire.Engine.loadScene('villa');
                    }
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
    //
    openNoHouse: function () {
        var self = this;
        self.odataBase.nohouseaboutList(function (serverData) {
            self.odataBase.relationMgr.openWindow(serverData);
        });
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
