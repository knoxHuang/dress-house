var Options = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        this.anim = null;
        this.bindHideOptionsEvent = this._hideOptionsEvent.bind(this);
        this.onHideEvent = null;
    },
    // 属性
    properties: {
        // 隐藏选项
        btn_hide: {
            default: null,
            type: Fire.UIButton
        },
        // 删除对象
        btn_del: {
            default: null,
            type: Fire.UIButton
        },
        // 镜像翻转
        btn_MirrorFlip: {
            default: null,
            type: Fire.UIButton
        }
    },
    // 是否开启中
    hasOpen: function () {
        return this.entity.active;
    },
    // 是否有触碰选项
    hasTouch: function (target) {
        return target === this.btn_hide.entity ||
               target === this.btn_del.entity  ||
               target === this.btn_MirrorFlip.entity;
    },
    // 设置坐标
    setPos: function (value) {
        this.entity.transform.position = value;
    },
    // 打开选项
    open: function (target) {
        // 设置左边
        if (target) {
            this.entity.parent = null;
            this.setPos(target.transform.worldPosition);
        }
        this.entity.active = true;
        if (! this.anim) {
            this.anim = this.entity.getComponent(Fire.Animation);
        }
        this.anim.play('options');
    },
    // 隐藏选项
    hide: function () {
        this.entity.active = false;
        this.entity.transform.scale = new Fire.Vec2(0, 0);
        if (this.onHideEvent) {
            this.onHideEvent();
        }
    },
    // 隐藏选项
    _hideOptionsEvent: function() {
        this.hide();
    },
    // 开始
    start: function () {
        this.btn_hide.onMousedown = this.bindHideOptionsEvent;
    }
});
