var Comp = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        this._onButtonDownEventBind = this._onButtonDownEvent.bind(this);
        this.onClick = null;
    },
    // 属性
    properties: {
        mark: {
            default: null,
            type: Fire.Entity
        },
        text_Content: {
            default: null,
            type: Fire.Text
        },
        iconRender: {
            default: null,
            type: Fire.SpriteRenderer
        },
        normalSprite: {
            default: null,
            type: Fire.Sprite
        },
        pressedSprite: {
            default:null,
            type: Fire.Sprite
        }
    },
    // 重置
    reset: function () {
        this.iconRender.sprite = this.normalSprite;
    },
    setContent: function (text) {
        this.text_Content.text = text;
    },
    // 按下
    _onButtonDownEvent: function (event) {
        // 触发事件
        if (this.onClick) {
            this.onClick(event);
        }
        this.iconRender.sprite = this.pressedSprite;
    },
    // 开始
    start: function () {
        this.mark.on('mousedown', this._onButtonDownEventBind);
    },
    // 销毁时
    onDestroy: function () {
        this.mark.off('mousedown', this._onButtonDownEventBind);
    }
});
