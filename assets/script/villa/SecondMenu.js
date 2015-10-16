var SecondMenu = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        this._btnMenu = null;
        this._price = null;
        this.roomType = 0;
        this.uid = 0;
        this.price = 0;
        this.show_price = '';
        // 折扣
        this.discount = 1;
        this.smallSprite = null;
    },
    // 属性
    properties: {
        // 当前类型ID用于向服务器请求数据
        tid: 0,
        tname: '',
        hasDrag: false,
        // 默认图片
        defaultSprite: {
            default: null,
            type: Fire.Sprite
        },
        defaultLoadAnim: {
            default: null,
            type: Fire.Animation
        }
    },
    // 重置菜单
    resetMenu: function () {
        this.tid = 0;
        this.hasDrag = false;
        this.setText('');
        this.show_price = '';
        this._btnMenu.setSprite(this.defaultSprite);
        this._btnMenu.setCustomSize(-1, -1);
        this._btnMenu.onClick = null;
        this._price.entity.active = false;
        this.entity.active = false;
    },
    // 设置文字
    setText: function (text) {
        this.tname = text;
        this._btnMenu.setText('');
        //this._btnMenu.setText(text);
    },
    // 设置价格
    setPrice: function (value) {
        this.price = value;
    },

    setPriceText: function (value) {
        this.show_price = value;
        this._price.text =  value;
        this._price.entity.active = this.price !== 0;
    },

    // 设置图片
    setSprite: function (sprite, event) {
        if (! sprite) {
            return;
        }
        this.smallSprite = sprite;
        this._btnMenu.setSprite(sprite);
        if (sprite.width > 130) {
            this._btnMenu.setCustomSize(120, 120);
        }
        if (event) {
            this._btnMenu.onClick = event;
        }
    },
    init: function () {
        // 常用的变量/数据
        var ent = Fire.Entity.find('/DataBase');
        this.dataBase = ent.getComponent('DataBase');
        //
        ent = this.entity.find('btn_Menu');
        this._btnMenu = ent.getComponent('UIButton');
        ent = this.entity.find('price');
        this._price = ent.getComponent(Fire.Text);
        //
        var state = this.defaultLoadAnim.play('loading');
        state.wrapMode = Fire.WrapMode.Loop;
        state.repeatCount = Infinity;
    },
    // 刷新单品 / 物品柜
    refresh: function (data, event) {
        this.resetMenu();

        this.entity.active = true;
        this._btnMenu.entity.active = false;
        this.defaultLoadAnim.entity.active = true;
        this.defaultLoadAnim.play('loading');
        if (data) {
            this.tid = data.tid;
            this.hasDrag = data.isdrag < 2;
            this.setText(data.tname);
            this.entity.name = data.tid;
            this.entity.active = true;

            var self = this;
            if (data.localPath) {
                Fire.Resources.load(data.localPath, function (error, sprite) {
                    if (error) {
                        console.log(error);
                    }
                    self.setSprite(sprite, event);
                    self._btnMenu.entity.active = true;
                    self.defaultLoadAnim.entity.active = false;
                });
                return;
            }

            self.dataBase.loadImage(data.url || data.imageUrl, function (data, error, image) {
                if (error) {
                    console.log(error);
                }
                if (self.tid !== data.tid) {
                    return;
                }
                var sprite = new Fire.Sprite(image);
                self.setSprite(sprite, event);
                self._btnMenu.entity.active = true;
                self.defaultLoadAnim.entity.active = false;
            }.bind(this, data));
        }
    },
    // 刷新套装
    refresh_suitItems: function (data, event) {
        this.resetMenu();

        this.entity.active = true;
        this._btnMenu.entity.active = false;
        this.defaultLoadAnim.entity.active = true;
        this.defaultLoadAnim.play('loading');

        if (data) {
            this.tid = data.tid;
            this.uid = data.uid;
            this.setText(data.tname);
            this.roomType = data.roomType;
            this.setPrice(data.price);
            this.setPriceText(data.show_price);
            this.entity.name = data.tid;
            //
            var self = this;
            self.dataBase.loadImage(data.imageUrl, function (data, error, image) {
                if (error) {
                    console.log(error);
                }
                if (self.tid !== data.tid) {
                    return;
                }
                var sprite = new Fire.Sprite(image);
                self.setSprite(sprite, event);
                self._btnMenu.entity.active = true;
                self.defaultLoadAnim.entity.active = false;
            }.bind(this, data));
        }
    }
});
