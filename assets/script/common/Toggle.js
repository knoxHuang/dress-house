var Toggle =Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        this.hasClick = false;
        this._onButtonDownEventBind = this._onButtonDownEvent.bind(this);
        this._onButtonUpEventBind = this._onButtonUpEvent.bind(this);
        this.btnRender = null;
        this.onClick = null;
    },
    // 属性
    properties: {
        textContent: {
            default: null,
            type: Fire.Text
        },
        normalPos: new Fire.Vec2(0, 0),
        normalColor: Fire.Color.white,
        normalSprite: {
            default: null,
            type: Fire.Sprite
        },
        pressedPos: new Fire.Vec2(0, 0),
        pressedColor: Fire.Color.white,
        pressedSprite: {
            default: null,
            type: Fire.Sprite
        }
    },
    // 按下
    _onButtonDownEvent: function () {
        //if (this.pressedSprite) {
        //    this.btnRender.sprite = this.pressedSprite;
        //}
        //if (this.normalPos !== Fire.Vec2.zero) {
        //    this.setPostition(this.normalPos);
        //}
    },
    // 放开
    _onButtonUpEvent: function (event) {
        if (this.hasClick) {
            return;
        }
        if (this.onClick) {
            this.onClick(event);
        }
        if (this.pressedSprite) {
            this.btnRender.sprite = this.pressedSprite;
        }
        if (this.pressedColor !== Fire.Color.white) {
            this.btnRender.color = this.pressedColor;
        }
        if (this.pressedPos.x !== 0 && this.pressedPos.y !== 0) {
            this.setPostition(this.pressedPos);
        }
        this.hasClick = true;
    },
    //
    defaultToggle: function (callback) {
        if (this.pressedSprite) {
            this.btnRender.sprite = this.pressedSprite;
        }
        this.btnRender.color = this.pressedColor;
        if (this.pressedPos.x !== 0 && this.pressedPos.y !== 0) {
            this.setPostition(this.pressedPos);
        }
        if (callback) {
            callback();
        }
    },
    resetColor: function () {
        this.hasClick = false;
        this.btnRender.color = this.normalColor;
    },
    //
    resetToggle: function () {
        this.hasClick = false;
        if (this.normalSprite) {
            this.btnRender.sprite = this.normalSprite;
        }
        this.btnRender.color = this.normalColor;
        if (this.normalPos.x !== 0 && this.normalPos.y !== 0) {
            this.setPostition(this.normalPos);
        }
    },
    // 设置坐标
    setPostition: function (posValue) {
        this.entity.transform.position = posValue;
    },
    // 设置文字
    setText: function (value) {
        this.textContent.text = value;
    },
    // 载入时
    start: function () {
        this.entity.on('mousedown', this._onButtonDownEventBind);
        this.entity.on('mouseup', this._onButtonUpEventBind);

        if (!this.btnRender){
            this.btnRender = this.entity.getComponent(Fire.SpriteRenderer);
        }
        if (this.normalSprite) {
            this.btnRender.sprite = this.normalSprite;
        }
        if (this.normalColor !== Fire.Color.white) {
            this.btnRender.color = this.normalColor;
        }
        if (this.normalPos.x !== 0 && this.normalPos.y !== 0) {
            this.setPostition(this.normalPos);
        }
    },
    // 销毁时
    onDestroy: function () {
        this.entity.off('mousedown', this._onButtonDownEventBind);
        this.entity.off('mouseup', this._onButtonUpEventBind);
    }
});

Fire.Toggle = Toggle;
