var Merchandise = Fire.Class({
    extends: Fire.Component,
    constructor: function () {
        // id;
        this.tid = 0;
        // 数量
        this.num = 1;
        // 打折
        this.discount = 1;
        // 单个价钱
        this.price = 0;
        // 普通价
        this.ordinaryPriceValue = 0;
        // 打折价
        this.discountPriceValue = 0;
        // 刷新总价格
        this.onrefreshPriceEvent = null;
    },
    properties: {
        icon: {
            default: null,
            type: Fire.SpriteRenderer
        },
        tName: {
            default: null,
            type: Fire.Text
        },
        tNum: {
            default: null,
            type: Fire.Text
        },
        btn_less: {
            default: null,
            type: Fire.UIButton
        },
        btn_add: {
            default: null,
            type: Fire.UIButton
        },
        ordinaryPrice: {
            default: null,
            type: Fire.Text
        },
        discountPrice: {
            default: null,
            type: Fire.Text
        },
        btn_del: {
            default: null,
            type: Fire.UIButton
        }
    },
    // 重置
    reset: function () {
        this.icon.sprite = null;
        this.tName.text = '';
        this.setNum(0);
        this.ordinaryPrice.text = 0 + "C币";
        this.discountPrice.text = 0 + "C币";
        this.entity.active = false;
    },
    // 减少数量
    _onLessEvent: function () {
        if (this.num === 1) {
            return;
        }
        this.num--;
        if (this.num < 1) {
            this.num = 1;
        }
        this.setNum(this.num);
        this.refreshOrdinaryPrice();
        if (this.onrefreshPriceEvent) {
            this.onrefreshPriceEvent(this.tid, this.num);
        }
    },
    // 增加数量
    _onAddEvent: function () {
        this.num++;
        this.setNum(this.num);
        this.refreshOrdinaryPrice();
        if (this.onrefreshPriceEvent) {
            this.onrefreshPriceEvent(this.tid, this.num);
        }
    },
    // 设置数量
    setNum: function (value) {
        this.num = value;
        this.tNum.text = value;
    },
    // 设置普通价
    refreshOrdinaryPrice: function () {
        this.ordinaryPriceValue = this.num * this.price;
        this.ordinaryPrice.text = this.ordinaryPriceValue + "C币";
        // 设置打折价
        this.refreshDiscountPrice();
    },
    // 设置打折价
    refreshDiscountPrice: function () {
        this.discountPriceValue = this.ordinaryPriceValue * this.discount;
        this.discountPrice.text = this.discountPriceValue + "C币";
    },
    // 刷新
    refresh: function (data, delEvent, refreshPriceEvent) {
        this.tid = data.tid;
        this.icon.sprite = data.icon || null;
        this.tName.text = data.tName || '';
        this.setNum(data.tNum || 0);
        this.price = data.price;
        this.discount = data.discount;
        this.refreshOrdinaryPrice();
        this.btn_del.onClick = delEvent || null;
        this.onrefreshPriceEvent = refreshPriceEvent;
        this.entity.active = true;
    },
    //
    start: function () {
        this.btn_less.onClick = this._onLessEvent.bind(this);
        this.btn_add.onClick = this._onAddEvent.bind(this);
    }
});
