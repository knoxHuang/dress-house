var Comp = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        this.relationList = [];
    },
    // 属性
    properties: {
        root: {
            default: null,
            type: Fire.Entity
        },
        btn_next: {
            default: null,
            type: Fire.UIButton
        },
        btn_close: {
            default: null,
            type: Fire.UIButton
        }
    },

    resetAllState: function () {
        for(var i = 0, len = this.relationList.length; i < len; ++i) {
            var relation = this.relationList[i];
            relation.reset();
            relation.active = false;
        }
    },

    onMouseDownEvent: function (event) {
        this.resetAllState();
        this.odataBase.selectID = parseInt(event.target.parent.name);
    },

    onNextEvent: function (event) {
        this.closeWindow();
        this.odataBase.noHouseWindow.openWindow(this.serverData);
    },

    closeWindow: function () {
        this.resetAllState();
        this.entity.active = false;
    },

    openWindow: function (_serverData) {
        this.odataBase.selectID = -1;
        this.serverData = _serverData;
        this.entity.active = true;
        for(var i = 0, len = _serverData.relation.length; i < len; ++i ){
            var text = _serverData.relation[i];
            var relation = this.relationList[i];
            if(relation) {
                relation.active = true;
                relation.setContent(text);
            }
        }
    },

    // 开始
    start: function () {
        // 常用的变量/数据
        var ent = Fire.Entity.find('/ODataBase');
        this.odataBase = ent.getComponent('ODataBase');

        var childrens = this.root.getChildren();
        for(var i = 0, len = childrens.length; i < len; ++i) {
            var obj = childrens[i];
            var relation = obj.getComponent('Relation');
            relation.onClick = this.onMouseDownEvent.bind(this);
            relation.active = false;
            this.relationList.push(relation);
        }
        this.btn_next.onClick = this.onNextEvent.bind(this);
        this.btn_close.onClick = this.closeWindow.bind(this);
    },

    update: function () {
        this.btn_next.entity.active = this.odataBase.selectID !== -1;
    }
});
