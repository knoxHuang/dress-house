var RoomType = Fire.defineEnum({
    livingRoom: -1,  //客厅
    bedRoom: -1,     //卧室
    kitchen: -1,     //厨房
    bathroom: -1,    //浴室
    study: -1,       //书房
    gym: -1,         //健身房
    balcony: -1,     //阳台
    garden: -1       //花园
});

// 下拉列表
var UIPopupList = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        this.roomTypeList = [];
        this.bindShowListEvent = this.onShowListEvent.bind(this);
    },
    //
    properties: {
        // 房间类型
        roomType: -1,
        // 点击区域弹出列表
        btn_roomType: {
            default: null,
            type: Fire.UIButton
        },
        // 下拉列表
        drodownList: {
            default: null,
            type: Fire.Entity
        }
    },
    // 显示下拉列表
    onShowListEvent: function () {
        this.drodownList.active = !this.drodownList.active;
    },
    // 获取房间类型文字
    _getRoomTypeText: function (type) {
        var str = '选择类型..';
        switch(type){
            case 1:
                str = '客厅';
                break;
            case 2:
                str = '卧室';
                break;
            case 3:
                str = '厨房';
                break;
            case 4:
                str = '浴室';
                break;
            case 5:
                str = '书房';
                break;
            case 6:
                str = '健身房';
                break;
            case 7:
                str = '阳台';
                break;
            case 8:
                str = '花园';
                break;
        }
        return str;
    },
    // 选择类型
    onSelectTypeEvent: function (event) {
        this.drodownList.active = false;
        this.roomType = parseInt(event.target.name);
        this.btn_roomType.setText(this._getRoomTypeText(this.roomType));
    },
    // 鼠标按下
    onMouseDownEvent: function (event) {
        if (this.drodownList.active && this.roomTypeList.indexOf(event.target) === -1) {
            this.drodownList.active = false;
        }
    },
    // 初始化下拉列表
    _iniiDropDownList: function () {
        this.roomTypeList = [];
        var index = 1;
        for (var i in RoomType) {
            var ent = Fire.instantiate(this.sdataBase.tempRoomType);
            ent.parent = this.drodownList;
            ent.transform.position = new Fire.Vec2(0, 180 - ((index - 1) * 50));
            ent.name = index;
            var btn = ent.getComponent(Fire.UIButton);
            btn.setText(this._getRoomTypeText(index));
            btn.onClick = this.onSelectTypeEvent.bind(this);
            this.roomTypeList.push(ent);
            index++;
        }
    },
    // 开始
    start: function () {
        // 常用的变量/数据
        var ent = Fire.Entity.find('/SDataBase');
        this.sdataBase = ent.getComponent('SDataBase');
        // 打开下拉菜单
        this.btn_roomType.onClick = this.bindShowListEvent;
        //
        this._iniiDropDownList();
        //
        this.bindedMouseDownEvent = this.onMouseDownEvent.bind(this);
        Fire.Input.on('mousedown', this.bindedMouseDownEvent);
    },
    onDestroy: function() {
        Fire.Input.off('mousedown', this.bindedMouseDownEvent);
    }
});
Fire.UIPopupList = UIPopupList;
