var MyAddFamilyWindow = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        this._addMyFamilyDataSheets = [];
        // 每页显示多少个
        this._showPageCount = 7;
        // 总数
        this._curTotal = 0;
        // 当前页数
        this._curPage = 1;
        // 最大页数
        this._maxPage = 1;
        //
        this.relieveing = false;
    },
    // 属性
    properties: {
        tempAddFamily: {
            default: null,
            type: Fire.Entity
        },
        root: {
            default: null,
            type: Fire.Entity
        },
        btn_close: {
            default: null,
            type: Fire.UIButton
        },
        btn_next: {
            default: null,
            type: Fire.UIButton
        },
        btn_previous: {
            default: null,
            type: Fire.UIButton
        },
        pageText: {
            default: null,
            type: Fire.Text
        }
    },

    start: function () {
        // 常用的变量/数据
        var ent = Fire.Entity.find('/ODataBase');
        this.odataBase = ent.getComponent('ODataBase');
        //
        this.btn_close.onClick = this._onCloseWindowEvent.bind(this);
        this.btn_previous.onClick = this._onNextPageEvnet.bind(this);
        this.btn_next.onClick = this._onPreviousPageEvent.bind(this);
        this.btn_previous.entity.active = false;
        this.btn_next.entity.active = false;
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
        this.odataBase.planWin.openWindow(sendData);
    },
    // 解除关系
    _onRelieveEvent: function (event) {
        var self = this;
        if (self.relieveing) {
            return;
        }
        var familyInfo = event.target.parent.getComponent('FamilyInfo');
        self.odataBase.tipCommon.openTipsWindow("是否与 " + familyInfo.lover_name + " 解除关系?", function () {
            self.relieveing = true;
            var sendData = {
                mark: familyInfo.mark
            };
            self.odataBase.serverNetWork.RequestDisassociateList(sendData, function (serverData) {
                if (serverData.status === 10000) {
                    self.refreshFloorData(serverData, function () {
                        self.createFamilyInfo();
                        self.relieveing = false;
                    });
                }
                else {
                    self.tipCommon.openTipsWindow(serverData.desc);
                }
            });
        });
    },
    // 关闭按钮事件
    _onCloseWindowEvent: function () {
        this.closeWindow();
    },
    // 刷新按钮状态
    _refreshBtnState: function () {
        this.btn_previous.entity.active = this._curPage > 1;
        this.btn_next.entity.active = this._curPage < this._maxPage;
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
    refreshFloorData: function (serverData, callback) {
        var self = this;
        if (serverData.status !== 10000) {
            self.odataBase.tipCommon.openTipsWindow(serverData.desc);
            return;
        }
        self._addMyFamilyDataSheets = [];
        serverData.list.mylived.forEach(function (data) {
            self._addMyFamilyDataSheets.push(data);
        });
        if (callback) {
            callback();
        }
    },
    //
    createFamilyInfo: function () {
        this.resetData();
        var dataSheets = this._addMyFamilyDataSheets;
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
            var ent = Fire.instantiate(this.tempAddFamily);
            ent.name = i.toString();
            ent.parent = this.root;
            ent.active = true;
            ent.transform.position = new Fire.Vec2(-2.5, (index * 77));
            var info = ent.getComponent('FamilyInfo');
            info.refresh(data, bindGotHouseEvent, bindRelieveEvent);
            index++;
        }
        // 刷新按钮状态
        this._refreshBtnState();
    },
    // 打开窗口
    openWindow: function () {
        var self = this;
        console.log(self.odataBase.hasHouse);
        if(!self.odataBase.hasHouse) {
            self.odataBase.tipNoAddFamily2.openTipsWindow(null, function () {
                window.open("http://www.saike.com/houseshop/newhouse.php");
                self.closeWindow();
            });
            return;
        }
        self.odataBase.loadTip.openTips('载入数据！请稍后...');
        self.odataBase.serverNetWork.RequestFloorList(function (serverData) {
            self.odataBase.loadTip.closeTips();
            self.refreshFloorData(serverData, function () {
                if (self._addMyFamilyDataSheets.length === 0) {
                    self.odataBase.tipNoAddFamily1.openTipsWindow(null, function () {
                        window.open("http://www.saike.com/friend/search_city.php");
                        self.closeWindow();
                    })
                    return;
                }
                self.entity.active = true;
                self.createFamilyInfo();
            });
        });
    },
    // 关闭窗口
    closeWindow: function () {
        this.entity.active = false;
    }
});
