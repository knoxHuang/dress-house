var Comp = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
    },
    // 属性
    properties: {
        imageMargin: Fire.v2(1500, 800),
        host: {
            default: null,
            type: Fire.SpriteRenderer
        },
        host_name: {
            default: null,
            type: Fire.BitmapText
        },
        tempFamily: {
            default: null,
            type: Fire.Entity
        },
        familyRoot: {
            default: null,
            type: Fire.Entity
        }
    },
    // 开始
    start: function () {
        var ent = Fire.Entity.find('/DataBase');
        if(!ent) {
            ent = Fire.Entity.find('/ODataBase');
            this.dataBase = ent.getComponent('ODataBase');
        }
        else{
            this.dataBase = ent.getComponent('DataBase');
        }
    },

    setHost: function (image, name) {
        var newSprite = new Fire.Sprite(image);
        newSprite.pixelLevelHitTest = true;
        this.host_name.text = name;
        this.host.sprite = newSprite
        this.dataBase.globalData.hostSprite = newSprite;
        this.dataBase.globalData.hostName = name;
    },

    addFamily: function (image, name) {
        var ent = Fire.instantiate(this.tempFamily);
        ent.parent = this.familyRoot;
        ent.position = new Fire.Vec2(0, 0);
        var render = ent.getComponent(Fire.SpriteRenderer);
        render.sprite = new Fire.Sprite(image);
        render.sprite.pixelLevelHitTest = true;
        var family_name = ent.find('family_name').getComponent(Fire.BitmapText);
        family_name.text = name;
        return ent;
    },

    updateFamily: function (ent, image, name) {
        ent.parent = this.familyRoot;
        ent.position = new Fire.Vec2(0, 0);
        var render = ent.getComponent(Fire.SpriteRenderer);
        render.sprite = new Fire.Sprite(image);
        render.sprite.pixelLevelHitTest = true
        var family_name = ent.find('family_name').getComponent(Fire.BitmapText);
        family_name.text = name;
    },

    // 更新
    update: function () {
        var camera = Fire.Camera.main;
        var bgWorldBounds = this.dataBase.bgRender.getWorldBounds();
        var bgLeftTopWorldPos = new Fire.Vec2(bgWorldBounds.xMin + this.imageMargin.x, bgWorldBounds.yMin + this.imageMargin.y);
        var bgleftTop = camera.worldToScreen(bgLeftTopWorldPos);
        var screenPos = new Fire.Vec2(bgleftTop.x, bgleftTop.y);
        var worldPos = camera.screenToWorld(screenPos);
        this.entity.transform.worldPosition = worldPos;

    }
});
