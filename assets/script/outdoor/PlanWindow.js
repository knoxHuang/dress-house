var PlanWindow = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {

    },
    // 属性
    properties: {
        tempPlan: {
            default: null,
            type: Fire.Entity
        },
        root: {
            default: null,
            type: Fire.Entity
        },
        roomName: {
            default: null,
            type: Fire.Text
        },
        roomLevel: {
            default: null,
            type: Fire.Text
        },
        roomNum: {
            default: null,
            type: Fire.Text
        },
        btn_close: {
            default: null,
            type: Fire.UIButton
        }
    },
    // 重置窗口
    resetWindow: function () {
        this.roomName.text = '(别墅名称)';
        this.roomLevel.text = '档次：★★★★★★';
        this.roomNum.text = '共8个房间';
    },
    // 打开窗口
    // type: 那个路口进入平面图的
    // 0, 切换房间 1：切换楼出
    openWindow: function (sendData) {
        var self = this;
        self.entity.active = true;
        self._removePlan();
        var loaclData = self.planList[sendData.mark];
        if (loaclData) {
            self.odataBase.mark = sendData.mark;
            self.createPlan(loaclData);
        }
        else {
            self.odataBase.loadTip.openTips('载入平面图数据！请稍后...');
            self.odataBase.serverNetWork.RequestPlan(sendData, function (serverData) {
                self.odataBase.loadTip.closeTips();
                self.planList[sendData.mark] = serverData;
                self.odataBase.mark = sendData.mark;
                self.createPlan(serverData);
            });
        }
    },
    // 关闭窗口
    closeWindow: function () {
        this.entity.active = false;
    },
    // 绘制星级
    getStars: function (grade) {
        var str = '档次：';
        if (grade === 12) {
            str += '至尊宝';
        }
        else {
            for (var i = 0; i < grade - 1; ++i) {
                str += '★';
            }
        }
        return str;
    },
    // 创建平面图
    createPlan: function (serverData) {
        if (! serverData.list) {
            return;
        }
        // 像服务器请求平面图数据
        this.roomName.text = serverData.floor_name;
        this.roomLevel.text = this.getStars(serverData.floor_grade);
        this.roomNum.text = '共'+ serverData.list.length + '个房间';
        this.bindGoToRoomEvent = this._onGotoRoomEvent.bind(this);
        for (var i = 0; i < serverData.list.length; ++i) {
            var data = serverData.list[i];
            var ent = Fire.instantiate(this.tempPlan);
            ent.active = true;
            ent.parent = this.root;
            var btn = ent.getComponent(Fire.UIButton);
            btn.mark = data.mark;
            this.odataBase.loadImage(data.imgurl, function (btn, error, image) {
                var sprite = new Fire.Sprite(image);
                sprite.pixelLevelHitTest = true;
                btn.setSprite(sprite);
                btn.onClick = this.bindGoToRoomEvent;
            }.bind(this, btn));
        }
    },
    // 进入房间
    _onGotoRoomEvent: function (event) {
        var btn = event.target.getComponent(Fire.UIButton);
        var sendData = {
            mark: btn.mark,
            house_uid: 0
        };
        this.odataBase.globalData.sendData = sendData;
        Fire.Engine.loadScene('villa');
    },
    // 清空房间
    _removePlan: function () {
        var children = this.root.getChildren();
        for (var i = 0;i < children.length; ++i) {
            children[i].destroy();
        }
    },
    // 关闭按钮事件
    _onCloseWindowEvent: function () {
        this.closeWindow();
        this._removePlan();
    },
    //
    start: function () {
        // 常用的变量/数据
        var ent = Fire.Entity.find('/ODataBase');
        this.odataBase = ent.getComponent('ODataBase');
        // 绑定事件
        this.btn_close.onClick = this._onCloseWindowEvent.bind(this);
        //
        this.planList = {};
    }
});
