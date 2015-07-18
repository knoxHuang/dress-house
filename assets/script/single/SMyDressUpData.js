var SMyDressUpData = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    contructor: function () {
        // ID
        this.suit_id = -1;
        // 名称
        this.myDressUpName = '';
    },
    // 属性
    properties: {
        // 编号
        serialNumber: {
            default: null,
            type: Fire.Text
        },
        // 名称
        roomName: {
            default: null,
            type: Fire.Text
        },
        // 类型
        roomType: 0,
        // 类型文字
        roomTypeText: {
            default: null,
            type: Fire.Text
        },
        // 打开装扮
        btn_openRoom: {
            default: null,
            type: Fire.UIButton
        },
        // 删除装扮
        btn_deleteRoom: {
            default: null,
            type: Fire.UIButton
        }
    },
    // 重置家具
    resetMenu: function () {
        this.serialNumber.text = '';
        this.roomName.text = '';
        this.roomType = 0;
        this.roomTypeText.text = '';
        this.btn_openRoom.onClick = null;
        this.btn_deleteRoom.onClick = null;
        this.entity.active = false;
    },
    // 初始化
    refresh: function (data, openRoomEvent, deleteRoomEvent) {
        this.suit_id = data.id;
        this.myDressUpName = data.name;
        this.entity.name = this.suit_id;
        this.serialNumber.text = this.suit_id;
        this.roomName.text = this.myDressUpName;
        this.roomType = data.type;
        this.roomTypeText.text = data.typeName;
        if (openRoomEvent) {
            this.btn_openRoom.onClick = openRoomEvent;
        }
        if (deleteRoomEvent) {
            this.btn_deleteRoom.onClick = deleteRoomEvent;
        }
    }
});
