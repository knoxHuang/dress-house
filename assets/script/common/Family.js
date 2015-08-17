var Comp = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        this.familyGos = [];
    },
    // 属性
    properties: {
        imageMargin: Fire.v2(1500, 800),
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

    // 刷新家人形象
    refreshFamily: function (familyList) {
        var self = this;
        for(var i = 2; i < familyList.length; ++i ) {
            var family = self.familyList[i];
            var familyGo = self.familyGos[family.figure_url];
            if (familyGo) {
                var ent = Fire.instantiate(familyGo);
                ent.parent = self.familyRoot;
                ent.position = new Fire.Vec2(0, 0);
            }
            else {
                self.loadImage(family.figure_url, function (family, error, image) {
                    var newSprite = new Fire.Sprite(image);
                    familyGo = self.addFamily(newSprite, family.user_name, family.relation_name);
                    self.familyGos[family.figure_url] = familyGo;
                }.bind(self, family));
            }
        }
        self.entity.active = true;
    },

    addFamily: function (newSprite, name, relation_name) {
        if (!this.tempFamily) {
            return;
        }
        var ent = Fire.instantiate(this.tempFamily);
        ent.parent = this.familyRoot;
        ent.position = new Fire.Vec2(0, 0);
        var render = ent.getComponent(Fire.SpriteRenderer);
        render.sprite = newSprite;
        render.sprite.pixelLevelHitTest = true;
        var family_name = ent.find('family_name').getComponent(Fire.BitmapText);
        family_name.text = name;
        var relation_name = ent.find('relation_name').getComponent(Fire.BitmapText);
        relation_name.text = relationName;
        return ent;
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
