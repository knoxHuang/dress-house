// 保存房间数据窗口
var SaveRoomWindow = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        this.lastAnim = null;
        this.stroageDressEvent = this._onStroageDressEvent.bind(this);
        this.closeWindowEvent = this._onCloseWindowEvent.bind(this);
        this.bindCreateThumbnailsEvent = this._onCreateThumbnailsEvent.bind(this);
        this.defaultThumbnails = null;
        this.hasDownThumbnails = false;
    },
    // 属性
    properties: {
        // 缩略图
        btn_thumbnails: {
            default: null,
            type: Fire.UIButton
        },
        // 房间名称
        roomName: {
            default: null,
            type: Fire.InputField
        },
        // 房间类型
        roomTypeList: {
            default: null,
            type: Fire.UIPopupList
        },
        btn_colse: {
            default: null,
            type: Fire.UIButton
        },
        // 确认保存
        btn_confirmSave: {
            default: null,
            type: Fire.UIButton
        }
    },
    // 创建缩略图
    _onCreateThumbnailsEvent: function () {
        var self = this;
        if (self.hasDownThumbnails) {
            return;
        }
        self.hasDownThumbnails = true;
        self.btn_thumbnails.textContent.text = '保持中请稍等..';
        self.sdataBase.screenshot.createThumbnails(function (image) {
            self.hasDownThumbnails = false;
            self.btn_thumbnails.setImage(image);
            self.btn_thumbnails.textContent.entity.active = false;
            self.btn_thumbnails.textContent.text = '点击此处\n创建缩略图';
        });
    },
    // 关闭保存窗口
    _onCloseWindowEvent: function () {
        this.closeWindow();
    },
    // 添加房间数据
    _addHomeData: function (props, entity, homeData) {
        var data = {
            id: props.suit_id,
            propsName: entity.name,
            propsType: props.propType,
            pos: entity.transform.x + ":" + entity.transform.y,
            rotation: entity.transform.rotation,
            scale: entity.transform.scaleX + ":" + entity.transform.scaleY,
            imgUrl: props.bigImageUrl
        };
        homeData.dataList.push(data);
    },
    // 保存房间数据
    _savehomeData: function (name, type) {
        var homeData = {
            key: 0,
            name: name,
            type: type,
            dataList: []
        };
        var props = null;
        var childrens = this.sdataBase.room.getChildren();
        for(var i = 0, len = childrens.length; i < len; ++i) {
            var entity = childrens[i];
            props = entity.getComponent('SFurniture');
            if (!props) {
                continue;
            }
            this._addHomeData(props, entity, homeData);
        }
        return homeData;
    },
    //
    _onStroageDressEvent: function () {
        //
        if (this.roomName.text === "" || this.roomTypeList.roomType === -1 ||
            this.btn_thumbnails.btnRender.sprite === this.defaultThumbnails)  {
            //
            this.sdataBase.ssaveErrorTips.active = true;
            // tips动画
            if (this.lastAnim){
                this.lastAnim.stop();
            }
            var anim = this.sdataBase.ssaveErrorTips.animate([
                {
                    'Fire.Transform': { scale: new Fire.Vec2(0, 0) }
                },
                {
                    'Fire.Transform': { scale: new Fire.Vec2(1, 1) },
                    ratio: 0.2
                },
                {
                    'Fire.Transform': { scale: new Fire.Vec2(1, 1) }
                },
            ], {duration: 1});

            this.lastAnim = anim;
            anim.onStop = function () {
                this.sdataBase.ssaveErrorTips.active = false;
                this.sdataBase.ssaveErrorTips.transform.scale = new Fire.Vec2(0, 0);
            }.bind(this);

            return;
        }
        this.sdataBase.ssaveErrorTips.active = false;
        var name = this.roomName.text;
        var type = this.roomTypeList.roomType;
        var homeData = this._savehomeData(name, type);

        // 保存缩略图
        var self = this;
        this.sdataBase.snetWorkMgr.SendHomeData(homeData, function (data) {
            if (data.status > 10000) {
                return;
            }
            var sendData = {
                house_uid: data.house_uid,
                suit_id: data.suit_id,
                image: self.btn_thumbnails.image
            };
            self.sdataBase.snetWorkMgr.SendImageToServer(sendData, function (data) {
                self.closeWindow();
                self.sdataBase.stipsWindow.openWindow('保存成功..');
            });
        });
    },
    // 打开窗口
    openWindow: function () {
        this.entity.active = true;
    },
    // 关闭
    closeWindow: function () {
        this.sdataBase.ssaveErrorTips.active = false;
        this.entity.active = false;
        this.roomTypeList.roomType = -1;
        this.roomName.text = '';
        this.roomTypeList.btn_roomType.setText('类型名称');
        if (this.defaultThumbnails) {
            this.btn_thumbnails.setSprite(this.defaultThumbnails);
        }
        this.btn_thumbnails.textContent.entity.active = true;
    },
    // 开始时
    start: function () {
        var ent = Fire.Entity.find('/SDataBase');
        this.sdataBase = ent.getComponent('SDataBase');
        //
        this.btn_colse.onClick = this.closeWindowEvent;
        this.btn_confirmSave.onClick = this.stroageDressEvent;
        this.btn_thumbnails.onClick = this.bindCreateThumbnailsEvent;
        this.defaultThumbnails = this.btn_thumbnails.btnRender.sprite;
    }
});
