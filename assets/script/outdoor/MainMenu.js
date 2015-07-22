var Comp = Fire.Class({
    extends: Fire.Component,

    properties: {
        background: {
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

    // use this for initialization
    start: function () {
        Fire.Engine.preloadScene('single');
        Fire.Engine.preloadScene('villa');

        this.btn_GoToSingle.onClick = this.onGoToSingleEvent.bind(this);
        this.btn_GoToVilla.onClick = this.onGoToVillaEvent.bind(this);

        this.btn_GoToMyAdd.onClick = this.onGoToMyAddEvent.bind(this);
        this.btn_GoToHouseShop.onClick = this.onGoToHouseShopEvent.bind(this);
        this.btn_GoToDressShop.onClick = this.onGoToDressShopEvent.bind(this);

        var documentElement = document.documentElement;
        var width = documentElement.clientWidth;
        var height = documentElement.clientHeight;

        Fire.Screen.on('resize', function () {
            var width = self.documentElement.clientWidth;
            var height = self.documentElement.clientHeight;
            if (width < height) {
                //TODO 横屏效果更好!
            }
            else {
                // TODO 关闭
            }
        });

        this.background.customWidth = width * (Fire.Camera.main.size / height);
        this.background.customHeight = Fire.Camera.main.size;

        this.btn_GoToSingle.defaultToggle(function () {
            this.btn_GoToSingle.textContent.color = Fire.Color.white;
            console.log("进入单身公寓外景");
        }.bind(this));
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
        //Fire.Engine.loadScene('single');
        console.log("进入单身公寓外景");
    },
    onGoToVillaEvent: function () {
        this.modifyToggle();
        this.btn_GoToVilla.textContent.color = Fire.Color.white;
        //Fire.Engine.loadScene('villa');
        console.log("进入别墅外景");
    },
    onGoToMyAddEvent: function () {
        console.log("打开我加入的");
    },
    onGoToHouseShopEvent: function () {
        console.log("打开房屋商城");
    },
    onGoToDressShopEvent: function () {
        console.log("打开扮靓商城");
    },

    // called every frame
    update: function () {

    }
});
