var Tip_InteractiveFamily = require('Tip_InteractiveFamily');

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
        },
        tip_InteractiveFamily: {
            default: null,
            type: Tip_InteractiveFamily
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

        this.btn_InteractiveFamily.entity.active = false;
        if(type !== 1 && !Fire.isMobile) {
            this.btn_InteractiveFamily.entity.active = true;
        }
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
        if (this.curType === 2) {
            if (!this.odataBase.hasHouse) {
                this.odataBase.tipCommon.openTipsWindow("您还未拥有自己的别墅，赶快到商城 \n 挑选属于自己的别墅吧！", function () {
                    window.open("http://www.saike.com/houseshop/newhouse.php");
                })
                return;
            }
        }
        this.odataBase.globalData.gotoType = 1;
        this.changerScreen();
    },
    // 家人互动
    onInteractiveFamilyEvent: function () {
        this.tip_InteractiveFamily.openTip();
    },
    // 进入室内
    onGoToIndoorEvent: function () {
        if (this.curType === 2) {
            if (!this.odataBase.hasHouse) {
                this.odataBase.tipCommon.openTipsWindow("您还未拥有自己的别墅，赶快到商城 \n 挑选属于自己的别墅吧！", function () {
                    window.open("http://www.saike.com/houseshop/newhouse.php");
                })
                return;
            }
        }
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
