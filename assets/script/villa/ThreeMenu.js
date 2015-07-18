var ThreeMenu = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        this._btnMenu = null;
        this._priceText = null;
        this.smallSprite = null;
        // 如果是套装的话就有家具列表
        this.dressList = [];
    },
    // 属性
    properties: {
        props_name: '',
        // 物品ID
        props_id: 0,
        // 物品UID
        props_uid: 0,
        // 套装ID
        suit_id: 0,
        // 套装名称
        suit_name: '',
        // 背包ID
        pack_id: 0,
        // 类别
        props_type: 0,
        // 价格
        price: 0,
        // 折扣
        discount: 0,
        // 大图Url
        bigImageUrl: '',
        // 是否可以拖动（例如壁纸与地面无法拖动）
        hasDrag: false,
        // 是否有使用过
        hasUse: false,
        // 载入时的图片
        defaultSprite: {
            default: null,
            type: Fire.Sprite
        },
        defaultLoadAnim: {
            default: null,
            type: Fire.Animation
        }
    },
    // 重置家具
    resetMenu: function () {
        this._btnMenu.setText('载入中');
        this._btnMenu.setSprite(this.defaultSprite);
        this._btnMenu.onClick = null;
        this.entity.name = '没赋值';
        this.props_id = 0;
        this.props_uid = 0;
        this.suit_id = 0;
        this.pack_id = 0;
        this.suit_name = '';
        this.props_type = 0;
        this.bigImageUrl = '没有得到大图URL';
        this.hasDrag = false;
        this.setMarkUse(false);
        this.setText('');
        this.setPrice(0);
        this.smallSprite = null;
        this.dressList = [];
        this.entity.active = false;
    },
    // 设置文字
    setText: function (text) {
        this._btnMenu.setText(text);
    },
    // 设置价格
    setPrice: function (value) {
        this.price = !value ? 0 : value;
        this._priceText.entity.active = this.price !== 0;
        this._priceText.text = value;
    },
    // 设置图片
    setSprite: function (smallSprite, event) {
        if (! smallSprite) {
            return;
        }
        this.smallSprite = smallSprite;

        this._btnMenu.setSprite(smallSprite);
        if (smallSprite.width > 110 || smallSprite.height > 120) {
            this._btnMenu.btnRender.useCustomSize = true;
            this._btnMenu.btnRender.customWidth = 110;
            this._btnMenu.btnRender.customHeight = 120;
        }
        if (event) {
            this._btnMenu.onClick = event;
        }
    },
    // 标记已使用
    setMarkUse: function (value) {
        this.hasUse = value;
        this._btnMenu.setDisabled(value);
    },
    // 开始时
    init: function () {
        // 常用的变量/数据
        var ent = Fire.Entity.find('/DataBase');
        this.dataBase = ent.getComponent('DataBase');
        if (! this._btnMenu) {
            ent = this.entity.find('btn_Menu');
            this._btnMenu = ent.getComponent('UIButton');
        }
        if (! this._priceText) {
            ent = this.entity.find('price');
            this._priceText = ent.getComponent(Fire.Text);
        }
        //
        var state = this.defaultLoadAnim.play('loading');
        state.wrapMode = Fire.WrapMode.Loop;
        state.repeatCount = Infinity;
        //
        this.resetMenu();
    },
    // 刷新已下载过后的数据
    refresh: function (data, bindEvent) {
        this.entity.name = data.props_id || 0;
        this.props_id = data.props_id || 0;
        this.props_uid = data.prod_uid || 0;
        this.pack_id = data.pack_id || 0;
        this.props_type = parseInt(data.props_type) || 0;
        this.discount = data.discount || 1;
        this.hasDrag = data.hasDrag || false;
        this.suit_id = parseInt(data.suit_id || 0);
        this.suit_name = data.suit_name || '';
        this.props_name = data.props_name || '';
        this.setText(data.props_name || data.suit_name);
        this.setPrice(data.price || 0);
        this.bigImageUrl = data.bigImageUrl;
        this.dressList = data.dressList || [];
        this.entity.active = true;
        this._btnMenu.entity.active = false;
        this.defaultLoadAnim.entity.active = true;
        this.defaultLoadAnim.play('loading');
        this.setMarkUse(data.status === "1" || false);
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
            self.setSprite(sprite, bindEvent);
            self._btnMenu.entity.active = true;
            self.defaultLoadAnim.entity.active = false;
        }.bind(this, data));
    }
});
