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
