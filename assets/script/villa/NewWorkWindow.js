var Comp = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        this.callbackEvent = null;
    },
    // 属性
    properties: {
        btn_Reconnect: {
            default: null,
            type: Fire.UIButton
        }
    },
    // 开启窗口
    openWindow: function (callback) {
        this.entity.active = true;
        if (callback) {
            this.callbackEvent = callback;
        }
    },
    // 关闭窗口
    closeWindow: function () {
        this.entity.active = false;
    },
    // 重新连接事件
    _onReconnectionEvent: function() {
        this.closeWindow();
        if (this.callbackEvent) {
            this.callbackEvent();
            this.callbackEvent = null;
        }
    },
    // 开始
    start: function () {
        // 绑定重新连接按钮
        this.btn_Reconnect.onClick = this._onReconnectionEvent.bind(this);
    }
});
