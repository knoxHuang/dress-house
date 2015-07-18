var TipLoad = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {

    },
    // 属性
    properties: {
        content:{
            default: null,
            type: Fire.BitmapText
        },
        loadIcon: {
            default: null,
            type: Fire.Entity
        },
        anim: {
            default: null,
            type: Fire.Animation
        }
    },
    // 加载
    onLoad: function () {
        var ent = Fire.Entity.find('/DataBase');
        this.dataBase = ent.getComponent('Database');

        var state = this.anim.play('loading');
        state.wrapMode = Fire.WrapMode.Loop;
        state.repeatCount = Infinity;
    },
    // 打开窗口
    openTips: function (text) {
        this.anim.play('loading');
        this.entity.active = true;
        if (text) {
            this.content.text = text;
        }
        else {
            this.content.text = '加载中请稍后...';
        }
        var size = this.content.getWorldSize();
        this.loadIcon.transform.worldPosition = new Fire.Vec2(size.x / 2 + 50, 0);
    },
    // 关闭窗口
    closeTips: function () {
        this.anim.stop('loading');
        this.entity.active = false;
    }
});
