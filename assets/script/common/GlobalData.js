var GlobalData = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        this.sendData = null;
    },
    // 属性
    properties: {
        // 1.进入室内并且直接进行装扮 2. 进入室内
        gotoType: -1,
        hostName: "",
        hostRelationName: "",
        hostSprite: {
            default: null,
            type: Fire.Sprite
        },
        viewersName: "",
        viewersRelationNname: "",
        viewersSprite: {
            default: null,
            type: Fire.Sprite
        }
    },
    // 开始
    start: function () {

    },
    // 更新
    update: function () {

    }
});
