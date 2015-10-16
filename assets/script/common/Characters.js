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
        icon: {
            default: null,
            type: Fire.Entity
        },
        offsetMaxY: 255,
        offsetMinY: 190,
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

    //
    refreshCharacters: function (infoOrName, relationName, newSprite) {
        var self = this;
        if (newSprite) {
            newSprite.pixelLevelHitTest = true;
            self.host_name.text = infoOrName;
            self.relation_name.text = relationName;
            self.host.sprite = newSprite;
            self.entity.active = true;

            var iconPos = self.icon.transform.position;
            if(relationName !== "") {
                iconPos.y = self.offsetMaxY;
            }
            else {
                iconPos.y = self.offsetMinY;
            }
            self.icon.transform.position = iconPos
        }
        else{
            self.dataBase.loadImage(infoOrName.figure_url, function (error, image) {
                var newSprite = new Fire.Sprite(image);
                    self.setHost(infoOrName.user_name, infoOrName.relation_name, newSprite);
                self.entity.active = true;
            });
        }
    },

    setHost: function (name, relationName, newSprite) {
        newSprite.pixelLevelHitTest = true;
        this.host_name.text = name;
        this.relation_name.text = relationName;
        this.host.sprite = newSprite;
        var iconPos = this.icon.transform.position;
        if(relationName !== "") {
            iconPos.y = this.offsetMaxY;
        }
        else {
            iconPos.y = this.offsetMinY;
        }
        this.icon.transform.position = iconPos
        if (this.globalData) {
            this.globalData.hostName = name;
            this.globalData.hostSprite = newSprite;
            this.globalData.hostRelationName = relationName;
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
