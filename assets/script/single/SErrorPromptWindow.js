var Comp = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        this.onCallEvent = null;
    },
    // 属性
    properties: {
        content:{
            default: null,
            type: Fire.Text
        },
        btn_Confirm:{
            default: null,
            type: Fire.UIButton
        },
        // 如果Inputfield存在的话就需要把他先关闭
        // 因为无法控制它的层级
        input_Save: {
            default: null,
            type: Fire.Entity
        }
    },
    // 设置调用函数
    setCallEvent: function (event) {
        this.onCallEvent = event;
    },
    // 确定事件
    _onConfirmEvent: function () {
        this.entity.active = false;
        if (this.onCallEvent) {
            this.onCallEvent();
        }
    },
    // 关闭时触发的事件
    onDisable: function () {
        if (! this.input_Save.active) {
            this.input_Save.active = true;
        }
    },
    // 打开触发的事件
    onEnable: function () {
        if (this.input_Save.active) {
            this.input_Save.active = false;
        }
    },
    //
    onLoad: function () {
        this.btn_Confirm.onClick = this._onConfirmEvent.bind(this);
    }
});
