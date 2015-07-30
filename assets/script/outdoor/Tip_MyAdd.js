var Comp = Fire.Class({
    extends: Fire.Component,

    properties: {
        btn_Determine: {
            default: null,
            type: Fire.UIButton
        },
        btn_Close: {
            default: null,
            type: Fire.UIButton
        }
    },
    _onCloseWindow: function () {
        this.closeTips();
    },
    _onDetermineEvent: function () {
        this.closeTips();
    },
    openTipsWindow: function () {
        this.entity.active = true;
    },
    closeTips: function () {
        this.entity.active = false;
    },
    onLoad: function () {
        this.btn_Close.onClick = this._onCloseWindow.bind(this);
        this.btn_Determine.onClick = this._onDetermineEvent.bind(this);
    }
});
