// 跟服务器进行对接
var ServerNetWork = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        // 当前请求数据
        this._postData = {};
        // 断线重连窗口
        this.netWorkWin = null;
        // 用于测试的token数据
        this.token = '';
    },
    // 属性
    properties: {
        noErrorWindow: {
            default: null,
            type: Fire.Entity
        },
        localTest: false
    },

    // 获取用户信息
    getToKenValue: function () {
        if (this.localTest) {
            //this.token = 'MTAwMTQ5MjY4NV8yYjEyZjY1OTZjMjQxNjBlYmIwMTY1OTA2MDk1Y2I1NF8xNDM4MDc1Mzc1X3dhcF8xMDAxNDkyNjg1';
            this.token = "MTAwMDAwMDA1N181ZDNkMjEwY2E4M2Q2ODVmOGE5ZWFkNmUwN2IwODM1OV8xNDM5NzgyMDEwX3dhcF8xMDAxNDkyNjg1";
        }
        else {
            this.token = this.getQueryString('token');
            if (!this.token) {
                this.noErrorWindow.active = true;
                //console.log("没有用户信息, ToKen is null");
                return false;
            }
        }
        return true;
    },
    // 用JS获取地址栏参数的方法
    getQueryString: function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r !== null) {
            return unescape(r[2]);
        }
        return null;
    },
    // 请求失败
    _errorCallBack: function () {
        var self = this;
        this.netWorkWin.openWindow(function () {
            self.sendData(self._postData);
        });
    },
    // 发送数据
    sendData: function (data) {
        if (!Fire.Engine.isPlaying) {
            return;
        }
        if (!this.getToKenValue()) {
            return;
        }
        //this.dataBase.loadTips.openTips('请求中，请稍后...');
        this._postData = data;
        this.jQueryAjax(data.url, data.sendData, data.cb, data.errCb);
    },
    // 发送消息
    jQueryAjax: function (strUrl, data, callBack, errorCallBack) {
        var params = "";
        if (typeof(data) !== "object") {
            params = data + "&token=" + this.token;
        }
        else {
            for (var key in data) {
                params += (key + "=" + data[key] + "&"  );
            }
            params += "&token=" + this.token;
        }
        var send = {
            type: "POST",
            url: strUrl + "?&jsoncallPP=?",
            data: params,
            dataType: 'jsonp',
            success: function (data) {
                if (!Fire.Engine.isPlaying) {
                    return;
                }
                if (callBack) {
                    callBack(data);
                }
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                if (!Fire.Engine.isPlaying) {
                    return;
                }
                if (errorCallBack) {
                    errorCallBack();
                }
                console.log(errorThrown);
                console.log(XMLHttpRequest);
                console.log(textStatus);
            }
        };
        jQuery.ajax(send);
    },
    // 初始化外景数据
    InitOutdoor: function (sendData, callback) {
        var postData = {
            url: "http://m.saike.com/suitdress/browseScene.html",
            sendData: {
                dress_type: sendData.dress_type
            },
            cb: callback,
            errCb: this._errorCallBack.bind(this)
        };
        this.sendData(postData);
    },
    RquestCheckHouse: function (callback) {
        var postData = {
            url: "http://m.saike.com/suitdress/checkHouse.html",
            sendData: {},
            cb: callback,
            errCb: this._errorCallBack.bind(this)
        };
        this.sendData(postData);
    },

    // 楼层列表
    RequestFloorList: function (callback) {
        var postData = {
            url: "http://m.saike.com/suitdress/floorList.html",
            sendData: {},
            cb: callback,
            errCb: this._errorCallBack.bind(this)
        };
        this.sendData(postData);
    },
    // 无房请求
    RequestNohouseaboutList: function (callback) {
        var postData = {
            url: "http://m.saike.com/suitdress/nohouseabout.html",
            sendData: {},
            cb: callback,
            errCb: this._errorCallBack.bind(this)
        };
        this.sendData(postData);
    },
    // 获取平面图
    RequestPlan: function (sendData, callback) {
        var postData = {
            url: "http://m.saike.com/suitdress/showCover.html",
            sendData: {
                house_uid: sendData.house_uid,
                floor_id: sendData.floor_id,
                mark: sendData.mark
            },
            cb: callback,
            errCb: this._errorCallBack.bind(this)
        };
        this.sendData(postData);
    },
    // 解除关系
    RequestDisassociateList: function (sendData, callback) {
        var postData = {
            url: "http://m.saike.com/suitdress/releaseRelation.html",
            sendData: sendData,
            cb: callback,
            errCb: this._errorCallBack.bind(this)
        };
        this.sendData(postData);
    },
    // 开始时
    start: function () {
        // 重新请求服务器窗口
        var ent = Fire.Entity.find('/Tip_NetWork');
        this.netWorkWin = ent.getComponent('NewWorkWindow');
    }
});