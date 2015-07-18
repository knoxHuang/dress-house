var PayMentWindow = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        // 显示数量
        this._showCount = 3;
        // 当前总数
        this._curTotal = 0;
        // 当前页
        this._curPage = 1;
        // 最大页签
        this._maxPage = 1;
        // 商品容器
        this.merchandiseList = [];
        // 商品数据
        this.merchandiseDataList = [];
    },
    // 属性
    properties: {
        root: {
            default: null,
            type: Fire.Entity
        },
        // 删除窗口
        btn_close: {
            default: null,
            type: Fire.UIButton
        },
        // 确认支付
        btn_pay: {
            default: null,
            type: Fire.UIButton
        },
        // 用户金额
        userPrice: {
            default: null,
            type: Fire.Text
        },
        // 立即充值
        btn_Recharge: {
            default: null,
            type: Fire.UIButton
        },
        // 合计物品与有效期限文字描述
        numAndDuration: {
            default: null,
            type: Fire.Text
        },
        // 总价格与总支付
        priceDescription: {
            default: null,
            type: Fire.PriceDescription
        },
        // 控制底部物件的高度
        bottomRoot: {
            default: null,
            type: Fire.Entity
        },
        // 合计物品与有效期限文字描述
        page: {
            default: null,
            type: Fire.Text
        },
        // 上一页
        btn_Previous: {
            default: null,
            type: Fire.UIButton
        },
        // 下一页
        bnt_Next: {
            default: null,
            type: Fire.UIButton
        },
        // 没购物的图标提示
        nullTips: {
            default: null,
            type: Fire.Entity
        }
    },
    // 关闭按钮事件
    _onCloseWindowEvent: function () {
        this.dataBase.firstMenuMgr.openMenu();
        this.closeWindow();
    },
    // 充值
    _onRechargeEvent: function () {
        window.open('http://www.saike.com/n_pay/charge.php');
        this.dataBase.payMentTips.openTips();
    },
    // 确认支付
    _onPayEvent: function () {
        var self = this;
        self.dataBase.tipsWindow.openTipsWindow('您确定花费'+ this.payNum +'C币购买？', function () {
            if (self.dataBase.usercc < self.payNum) {
                self.dataBase.tipsWindow.openTipsWindow('您当前余额不足, 是否充值？', function () {
                    self._onRechargeEvent();
                });
            }
            else {
                self._pay();
            }
        });
    },
    // 支付
    _pay: function () {
        var self = this;
        self.dataBase.loadTips.openTips('支付中！请稍后...');
        self.dataBase.saveRoom(function (serverUsercc) {
            self.dataBase.usercc = serverUsercc;
            self.dataBase.curDressSuit.price = 0;
            self.dataBase.hasCanSave = false;
            self.dataBase.saveDefaultData();
            self.closeWindow();
            self.dataBase.loadTips.closeTips();
            self.dataBase.tipsWindow.openTipsWindow('支付成功，并保存装扮..');
            self.dataBase.resetScreen(function () {
                var sendData = {
                    mark: self.dataBase.mark
                };
                self.dataBase.loadTips.openTips('刷新场景，请稍后...');
                self.dataBase.intoRoom(sendData, function () {
                    self.dataBase.loadTips.closeTips();
                });
            });
        });
    },
    // 上一页
    _onPreviousEvent: function () {
        this._curPage -= 1;
        if (this._curPage < 1){
            this._curPage = 1;
        }
        this._refreshMerchandise();
    },
    // 下一页
    _onNextEvent: function () {
        this._curPage += 1;
        if (this._curPage > this._maxPage){
            this._curPage = this._maxPage;
        }
        this._refreshMerchandise();
    },
    // 重置商品列表
    _resetMerchandise: function () {
        var children = this.merchandiseList;
        for(var i = 0; i < children.length; ++i) {
            var comp = children[i];
            comp.reset();
        }
    },
    // 重置窗口
    _resetWindow: function () {
        // 重置商品列表
        this._resetMerchandise();
        // 重置合计物品与有效期限文字描述
        this.numAndDuration.text = '合计: 0件物品, 有效期:0天';
        this.numAndDuration.entity.active = false;
        // 重置总价格与总支付
        this.priceDescription.reset();
        // 重置用户余额
        this.userPrice.text = '用户余额: 0C币';
        // 重置页签
        this._curPage = 1;
        this._maxPage = 1;
        this.page.entity.active = false;
        // 刷新按钮状态
        this._refreshBtnState();
    },
    // 刷新商品数据
    _refreshMerchandiseDataList: function (callback) {
        this.merchandiseDataList = [];
        var data = {};
        // 套装
        var dressSuit = this.dataBase.curDressSuit;
        if (dressSuit.price > 0) {
            data = {
                icon: dressSuit.suit_icon,
                tName: dressSuit.suit_name,
                tNum: 1,
                price: dressSuit.price,
                discount: dressSuit.discount
            };
            this.merchandiseDataList.push(data);
        }

        var children = this.dataBase.room.getChildren();
        for (var i = 0; i < children.length; ++i) {
            var ent = children[i];
            var furniture = ent.getComponent('Furniture');
            if (parseInt(furniture.price) > 0 && furniture.suit_id === 0) {
                data = {
                    icon: furniture.smallSprite,
                    tName: furniture.props_name,
                    tNum: 1,
                    price: furniture.price,
                    discount: furniture.discount
                };
                this.merchandiseDataList.push(data);
            }
        }
        if (callback) {
            callback();
        }
    },
    // 刷新商品
    _refreshMerchandise: function () {
        // 重置商品列表
        this._resetMerchandise();
        // 获取商品数据
        var dataList = this.merchandiseDataList;
        var total = dataList.length;
        if (this._curTotal !== total) {
            this._curTotal = total;
            this._maxPage = Math.ceil(this._curTotal / this._showCount);
        }
        // 赋值数据
        var startNum = (this._curPage - 1) * this._showCount;
        var endNum = startNum + this._showCount;
        if (endNum > this._curTotal) {
            endNum = this._curTotal;
        }
        var index = 0;
        for(var i = startNum; i < endNum; ++i) {
            var menu = this.merchandiseList[index];
            var data = dataList[i];
            data.tid = i;
            menu.refresh(data, this.bindDelMerchandiseEvent, this.bindRefreshNumEvent);
            index++;
        }
        // 合计物品与有效天数
        this.numAndDuration.text = '合计: ' + total + '件物品, 有效期:90天';
        this.numAndDuration.entity.active = total > 0;
        this.nullTips.active = total === 0;
        // 总价格 与 折后价 需要支付
        this._refreshAllPrice();
        // 用户余额
        this.refreshUserCC();
        // 刷新按钮状态
        this._refreshBtnState();
    },
    // 刷新用户余额
    refreshUserCC: function () {
        this.userPrice.text = '用户余额: ' + this.dataBase.usercc + 'C币';
    },
    // 刷新所有价格
    _refreshAllPrice: function () {
        // 总价格 折后价 需要支付
        var total = 0, discount = 0, pay = 0;
        var dataList = this.merchandiseDataList;
        for (var i = 0; i < dataList.length; ++i) {
            var data = dataList[i];
            var price = data.tNum * data.price;
            total += price;
            var dicountPrice = price * data.discount;
            discount += dicountPrice;
        }
        pay = discount;
        this.payNum = pay;
        this.priceDescription.refresh(total, discount, pay);
    },
    // 刷新数量
    _onRefreshNumEvent: function (id, num) {
        if (this.merchandiseDataList.length > id) {
            var data = this.merchandiseDataList[id];
            data.tNum = num;
            this._refreshAllPrice();
        }
    },
    // 刷新按钮状态
    _refreshBtnState: function () {
        this.btn_Previous.entity.active = this._curPage > 1;
        this.bnt_Next.entity.active = this._curPage < this._maxPage;
        this.page.text = this._curPage + "/" + this._maxPage;
    },
    // 删除单个商品
    _onDelMerchandiseEvent: function (event) {
        var merchandise = event.target.parent.getComponent('Merchandise');
        if (merchandise && this.merchandiseDataList.length > merchandise.tid) {
            this.merchandiseDataList.splice(merchandise.tid, 1);
        }
        this._refreshMerchandise();
    },
    // 开启窗口
    openWindow: function () {
        this.payNum = 0;
        var self = this;
        //
        self.dataBase.firstMenuMgr.closeMenu();
        // 重置窗口数据
        self._resetWindow();
        // 显示窗口
        self.entity.active = true;
        // 刷新商品数据
        self._refreshMerchandiseDataList(function () {
            // 刷新商品
            self._refreshMerchandise();
        });
    },
    // 关闭窗口
    closeWindow: function () {
        this.entity.active = false;
        this._curPage = 1;
    },
    // 开始
    start: function () {
        // 常用的变量/数据
        var ent = Fire.Entity.find('/DataBase');
        this.dataBase = ent.getComponent('DataBase');
        //
        this.payNum = 0;
        //
        var children = this.root.getChildren();
        for(var i = 0; i < children.length; ++i) {
            ent = children[i];
            var comp = ent.getComponent('Merchandise');
            this.merchandiseList.push(comp);
        }
        this.bindRefreshNumEvent = this._onRefreshNumEvent.bind(this);
        this.bindDelMerchandiseEvent = this._onDelMerchandiseEvent.bind(this);
        this.btn_close.onClick = this._onCloseWindowEvent.bind(this);
        this.btn_pay.onClick = this._onPayEvent.bind(this);
        this.btn_Previous.onClick = this._onPreviousEvent.bind(this);
        this.bnt_Next.onClick = this._onNextEvent.bind(this);
        this.btn_Recharge.onClick = this._onRechargeEvent.bind(this);
    }
});
