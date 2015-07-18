var PriceDescription = Fire.Class({
    extends: Fire.Component,

    properties: {
        total: {
            default: null,
            type: Fire.Text
        },
        discount: {
            default: null,
            type: Fire.Text
        },
        pay: {
            default: null,
            type: Fire.Text
        }
    },
    //
    reset: function () {
        this.total.text = '0.00C币';
        this.discount.text = '0.00C币';
        this.pay.text = '0.00C币';
        this.entity.active = false;
    },
    // 刷新
    refresh: function (total, discount, pay) {
        this.total.text = (total || 0) + 'C币';
        this.discount.text = (discount || 0) + 'C币';
        this.pay.text = (pay || 0) + 'C币';
        this.entity.active = true;
    }
});

Fire.PriceDescription = PriceDescription;
