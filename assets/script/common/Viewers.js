var Comp = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
    },
    // 属性
    properties: {
        imageMargin: Fire.v2(1500, 800),
        viewers: {
            default: null,
            type: Fire.SpriteRenderer
        },
        viewers_name: {
            default: null,
            type: Fire.BitmapText
        },
        relation_name:{
            default: null,
            type: Fire.BitmapText
        }
    },
    // 开始
    start: function () {
        var ent = Fire.Entity.find('/GlobalData');
        if (ent) {
            this.globalData = ent.getComponent("GlobalData");
        }

        ent = Fire.Entity.find('/DataBase');
        if(ent) {
            this.dataBase = ent.getComponent('DataBase');
            return;
        }
        ent = Fire.Entity.find('/ODataBase');
        if(ent) {
            this.dataBase = ent.getComponent('ODataBase');
            return;
        }
        ent = Fire.Entity.find('/SDataBase');
        if(ent) {
            this.dataBase = ent.getComponent('SDataBase');
        }
    },

    refreshViewers: function (infoOrName, relationName, newSprite) {
        var self = this;
        if (newSprite) {
            self.viewers_name.text = infoOrName;
            self.relation_name.text = relationName;
            self.viewers.sprite = newSprite;
            self.entity.active = true;
        }
        else{
            self.dataBase.loadImage(infoOrName.figure_url, function (error, image) {
                var newSprite = new Fire.Sprite(image);
                self.setViewers(infoOrName.user_name, infoOrName.relation_name, newSprite);
                self.entity.active = true;
            });
        }
    },

    setViewers: function (name, relationName, newSprite) {
        newSprite.pixelLevelHitTest = true;
        this.viewers_name.text = name;
        this.relation_name.text = relationName;
        this.viewers.sprite = newSprite;
        if (this.globalData) {
            this.globalData.viewersName = name;
            this.globalData.viewersSprite = newSprite;
            this.globalData.viewersRelationNname = relationName;
        }
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
