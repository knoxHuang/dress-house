var TipsPayMent = Fire.Class({
    extends: Fire.Component,

    properties: {
        btn_Pay: {
            default: null,
            type: Fire.UIButton
        },
        btn_PayIssues: {
            default: null,
            type: Fire.UIButton
        },
        btn_Close: {
            default: null,
            type: Fire.UIButton
        }
    },
    // 关闭按钮事件
    _onCloseWindow: function () {
        this.closeTips();
    },
    // 已经完成付款，需要通讯服务器
    _onCheckPay: function () {
        var self = this;
        self.dataBase.loadTips.openTips('确认充值是否完毕！请稍后...');
        var sendData = {
            mark: this.dataBase.mark
        };
        self.dataBase.netWorkMgr.RequestCanDressRoom(sendData, function (serverData) {
            self.dataBase.usercc = serverData.usercc;
            self.dataBase.payMentWindow.refreshUserCC();
            self.dataBase.loadTips.closeTips();
            self.dataBase.tipsWindow.openTipsWindow('充值成功!');
            self.closeTips();
        });
    },
    // 付款遇到的问题
    _onPayIssues: function () {
        this.dataBase.tipsPayProblems.openTips();
    },
    // 开启提示窗口
    openTips: function (text) {
        this.entity.active = true;
    },
    // 关闭提示窗口
    closeTips: function () {
        this.entity.active = false;
    },
    // 加载时
    onLoad: function () {
        // 常用的变量/数据
        var ent = Fire.Entity.find('/DataBase');
        this.dataBase = ent.getComponent('DataBase');
        //
        this.btn_Pay.onClick = this._onCheckPay.bind(this);
        this.btn_PayIssues.onClick = this._onPayIssues.bind(this);
        this.btn_Close.onClick = this._onCloseWindow.bind(this);
    }
});
