var NoHouseWindow = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        this.needhouseList = [];
    },
    // 属性
    properties: {
        root: {
            default: null,
            type: Fire.Entity
        },
        btn_Determine: {
            default: null,
            type: Fire.UIButton
        },
        btn_goToOpen: {
            default: null,
            type: Fire.UIButton
        },
        btn_Cancel: {
            default: null,
            type: Fire.UIButton
        },
        btn_Close: {
            default: null,
            type: Fire.UIButton
        }
    },

    onDetermineEvent: function () {
        window.open("http://www.saike.com/houseshop/newhouse.php");
    },

    onGoToOpenEvent: function () {
        window.open("http://www.saike.com/diamond/main.php");
    },

    onCancelEvent: function () {
        this.closeWindow();
    },

    onCloseEvent: function () {
        this.closeWindow();
    },

    openWindow: function (_serverData) {
        this.entity.active = true;
        for(var i = 0, len = _serverData.needhouse.length; i < len; ++i ){
            var text = _serverData.needhouse[i];
            var needhouse = this.needhouseList[i];
            if(needhouse) {
                needhouse.active = true;
                var content = needhouse.find('text').getComponent(Fire.Text);
                content.text = text;
            }
        }
    },

    closeWindow: function () {
        this.entity.active = false;
        for(var i = 0, len = this.needhouseList.length; i < len; ++i) {
            var obj = this.needhouseList[i];
            obj.active = false;
        }
    },

    // 开始
    start: function () {
        // 常用的变量/数据
        var ent = Fire.Entity.find('/ODataBase');
        this.odataBase = ent.getComponent('ODataBase');

        this.btn_Determine.onClick = this.onDetermineEvent.bind(this);
        this.btn_Cancel.onClick = this.onCancelEvent.bind(this);
        this.btn_Close.onClick = this.onCloseEvent.bind(this);
        this.btn_goToOpen.onClick = this.onGoToOpenEvent.bind(this);

        var childrens = this.root.getChildren();
        for(var i = 0, len = childrens.length; i < len; ++i) {
            var obj = childrens[i];
            obj.active = false;
            this.needhouseList.push(obj);
        }
    }
});
