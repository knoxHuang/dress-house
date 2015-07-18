var SFurniture = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        this._renderer = null;
    },
    // 属性
    properties: {
        // 名称
        tName: '',
        // ID
        suit_id: 0,
        // 类型
        propType: 0,
        // 是否可以拖动
        hasDrag: false,
        // 图片的url
        imageUrl: '',
        // 载入时的图片
        defaultSprite: {
            default: null,
            type: Fire.Sprite
        }
    },
    // 设置图片
    setSprite: function (newSprite) {
        if (!this._renderer) {
            this._renderer = this.entity.getComponent(Fire.SpriteRenderer);
        }
        this._renderer.sprite = newSprite;
        this._renderer.sprite.pixelLevelHitTest = true;
    }
});
