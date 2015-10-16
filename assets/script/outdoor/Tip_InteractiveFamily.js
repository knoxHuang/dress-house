var Comp = Fire.Class({
    extends: Fire.Component,

    properties: {
        btn_Cancel: {
            default: null,
            type: Fire.UIButton
        }
    },

    _onCloseWindow: function () {
        this.closeTip();
    },

    closeTip: function () {
        this.entity.active = false;
    },

    openTip: function () {
        this.entity.active = true;
    },

    // use this for initialization
    start: function () {
        this.btn_Cancel.onClick = this._onCloseWindow.bind(this);
    },

    // called every frame
    update: function () {

    }
});
