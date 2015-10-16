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
        this.setText('');
        this._btnMenu.setSprite(this.defaultSprite);
        this._btnMenu.onClick = null;
        this.entity.active = false;
    },
    // 设置文字
    setText: function (text) {
        this._btnMenu.setText('');
        //this._btnMenu.setText(text);
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
        this.setText('');
        this.setText(data.name);
        if (data.smallSprite) {
            this.setSprite(data.smallSprite, bindEvent);
        }
        this.entity.active = true;
    }
});
