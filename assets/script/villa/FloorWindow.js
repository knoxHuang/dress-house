// 楼层切换窗口
var FloorWindow = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        this._myFamilyDataSheets = [];
        this._addMyFamilyDataSheets = [];
        // 每页显示多少个
        this._showPageCount = 7;
        // 总数
        this._curTotal = 0;
        // 当前页数
        this._curPage = 1;
        // 最大页数
        this._maxPage = 1;
        // 类型 0：我的家庭成员 1：我加入的家庭
        this.floorType = 0;
        //
        this.relieveing = false;
    },
    // 属性
    properties: {
        // 我的家庭成员切换按钮
        btn_myFamily: {
            default: null,
            type: Fire.Toggle
        },
        // 我加入的家庭切换按钮
        btn_myAddFamily: {
            default: null,
            type: Fire.Toggle
        },
        // 关闭按钮
        btn_close: {
            default: null,
            type: Fire.UIButton
        },
        // 上一页
        btn_Left: {
            default: null,
            type: Fire.UIButton
        },
        // 下一页
        btn_Right: {
            default: null,
            type: Fire.UIButton
        },
        pageText: {
            default: null,
            type: Fire.Text
        },
        // 头节点
        root: {
            default: null,
            type: Fire.Entity
        },
        // 加入家庭的标题
        addFamilyTitle: {
            default: null,
            type: Fire.Entity
        },
        // 我的家庭的标题
        myFamily: {
            default: null,
            type: Fire.Entity
        }
    },
    // 关闭窗口
    closeWindow: function () {
        this.entity.active = false;
        this.resetData();
        this.modifyToggle();
    },
    // 打开窗口
    openWindow: function () {
        this.entity.active = true;
        var self = this;
        self.dataBase.loadTips.openTips('载入数据！请稍后...');
        self.dataBase.netWorkMgr.RequestFloorList(function (serverData) {
            self.dataBase.loadTips.closeTips();
            if (!Fire.Engine.isPlaying) {
                return;
            }
            self.refreshFloorData(serverData, function () {
                self._switchingData(0);
                self.btn_myFamily.defaultToggle();
            });
        });
    },
    //
    refreshFloorData: function (serverData, callback) {
        var self = this;
        if (serverData.status !== 10000) {
            self.dataBase.tipsWindow.openTipsWindow(serverData.desc);
            return;
        }
        self._myFamilyDataSheets = [];
        serverData.list.myfloor.forEach(function (data) {
            self._myFamilyDataSheets.push(data);
        });
        self._addMyFamilyDataSheets = [];
        serverData.list.mylived.forEach(function (data) {
            self._addMyFamilyDataSheets.push(data);
        });
        if (callback) {
            callback();
        }
    },
    // 关闭按钮事件
    _onCloseWindowEvent: function () {
        this.closeWindow();
    },
    // 还原
    modifyToggle: function () {
        this.btn_myFamily.resetColor();
        this.btn_myAddFamily.resetColor();
    },
    // 切换到我的家庭成员
    _onMyFamilyEvent: function () {
        this.myFamily.active = true;
        this.addFamilyTitle.active = false;
        this._switchingData(0);
    },
    // 我加入的家庭
    _onMyAddFamilyEvent: function () {
        this.myFamily.active = false;
        this.addFamilyTitle.active = true;
        this._switchingData(1);
    },
    // 重置
    resetData: function () {
        var children = this.root.getChildren();
        for (var i = 0; i < children.length; ++i) {
            children[i].destroy();
        }
    },
    // 进入房屋
    _onGoToHouseEvent: function (event) {
        this.closeWindow();
        var familyInfo = event.target.parent.getComponent('FamilyInfo');
        var sendData = {
            house_uid: 0,
            floor_id: 0,
            mark: familyInfo.mark
        };
        this.dataBase.switchRoomWin.openWindow(1, sendData);
    },
    // 解除关系
    _onRelieveEvent: function (event) {
        var self = this;
        if (self.relieveing) {
            return;
        }
        var familyInfo = event.target.parent.getComponent('FamilyInfo');
        self.dataBase.tipsWindow.openTipsWindow("是否与 " + familyInfo.lover_name + " 解除关系?", function () {
            self.relieveing = true;
            var sendData = {
                mark: familyInfo.mark
            };
            self.dataBase.netWorkMgr.RequestDisassociateList(sendData, function (serverData) {
                if (serverData.status === 10000) {
                    self.refreshFloorData(serverData, function () {
                        self._switchingData(self.floorType);
                        self.relieveing = false;
                    });
                }
                else {
                    self.tipsWindow.openTipsWindow(serverData.desc);
                }
            });
        });
    },
    // 重置页数
    _switchingData: function (type) {
        this.modifyToggle();
        this.floorType = type;
        this._curPage = 1;
        this._maxPage = 1;
        if (type === 0){
            this.btn_myFamily.defaultToggle();
        }
        else {
            this.btn_myAddFamily.defaultToggle();
        }
        this.createFamilyInfo();
    },
    //
    createFamilyInfo: function () {
        this.resetData();
        var dataSheets = null;
        if (this.floorType === 0) {
            dataSheets = this._myFamilyDataSheets;
        }
        else {
            dataSheets = this._addMyFamilyDataSheets;
        }
        var bindGotHouseEvent = this._onGoToHouseEvent.bind(this);
        var bindRelieveEvent = this._onRelieveEvent.bind(this);
        //
        this._curTotal = dataSheets.length;
        this._maxPage = Math.ceil(this._curTotal / this._showPageCount);
        if (this._maxPage === 0) {
            this._maxPage = 1;
        }
        var startCount = (this._curPage - 1) * this._showPageCount;
        var entCount = startCount + this._showPageCount;
        if (entCount > this._curTotal) {
            entCount = this._curTotal;
        }
        var index = 0;
        for (var i = startCount; i < entCount; ++i) {
            var data = dataSheets[i];
            var ent = Fire.instantiate(this.dataBase.tempFamilyInfo);
            ent.name = i.toString();
            ent.parent = this.root;
            ent.active = true;
            ent.transform.position = new Fire.Vec2(-2.5, 188 - (index * 77));
            var info = ent.getComponent('FamilyInfo');
            info.refresh(data, bindGotHouseEvent, bindRelieveEvent);
            index++;
        }
        // 刷新按钮状态
        this._refreshBtnState();
    },
    // 刷新按钮状态
    _refreshBtnState: function () {
        this.btn_Left.entity.active = this._curPage > 1;
        this.btn_Right.entity.active = this._curPage < this._maxPage;
        this.pageText.text = '页数:' + this._curPage + "/" + this._maxPage;
    },
    // 下一页
    _onNextPageEvnet: function () {
        this._curPage -= 1;
        if (this._curPage < 1){
            this._curPage = 1;
        }
        this.createFamilyInfo();
    },
    // 上一页
    _onPreviousPageEvent: function () {
        this._curPage += 1;
        if (this._curPage > this._maxPage){
            this._curPage = this._maxPage;
        }
        this.createFamilyInfo();
    },
    // 开始
    start: function () {
        // 常用的变量/数据
        var ent = Fire.Entity.find('/DataBase');
        this.dataBase = ent.getComponent('DataBase');
        //
        this.addFamilyTitle.active = false;
        this.myFamily.active = true;
        //
        this.btn_close.onClick = this._onCloseWindowEvent.bind(this);
        this.btn_myFamily.onClick = this._onMyFamilyEvent.bind(this);
        this.btn_myAddFamily.onClick = this._onMyAddFamilyEvent.bind(this);
        //
        this.btn_Left.onClick = this._onNextPageEvnet.bind(this);
        this.btn_Right.onClick = this._onPreviousPageEvent.bind(this);
        this.btn_Left.entity.active = false;
        this.btn_Right.entity.active = false;
    }
});
