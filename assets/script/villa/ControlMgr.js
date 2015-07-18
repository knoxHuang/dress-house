// 用户输入管理类
var ControlMgr = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        this.bindedMouseDownEvent = this._onMouseDownEvent.bind(this);
        this.bindedMouseMoveEvent = this._onMouseMoveEvent.bind(this);
        this.bindedMouseUpEvent = this._onMouseUpEvent.bind(this);
        this._backupSelectTarget = null;
    },
    // 属性
    properties: {
        _selectTarget: null,
        _lastSelectTarget: null,
        _selectTargetInitPos: Fire.Vec2.zero,
        _mouseDownPos: Fire.Vec2.zero,
        _hasMoveTarget: false
    },
    // 鼠标按下事件
    _onMouseDownEvent: function (event) {
        var target = event.target;
        if (!target ) {
            return;
        }
        var ent = target.parent || target;
        var furniture = ent.getComponent('Furniture');
        // 大于2 说明可以拖动
        if (furniture && furniture.props_type > 2) {
            //
            this._selectTarget = ent;
            this._backupSelectTarget = this._selectTarget;
            this._selectTargetInitPos = ent.transform.position;
            var screendPos = new Fire.Vec2(event.screenX, event.screenY);
            this._mouseDownPos = Fire.Camera.main.screenToWorld(screendPos);
            this._selectTarget.setAsLastSibling();
            this._hasMoveTarget = true;
            // 是否打开控制选项，如果是相同的对象就不需要重新打开
            if (this._selectTarget !== this._lastSelectTarget) {
                this.dataBase.options.open(this._selectTarget);
                this._lastSelectTarget = this._selectTarget;
            }
            this.dataBase.threeMenuMgr.closeMenu(true);
            this.dataBase.secondMenuMgr.closeMenu(true);
        }
        else {
            if (this.dataBase.options.hasOpen()) {
                if (this.dataBase.options.hasTouch(target)) {
                    this._selectTarget = this._backupSelectTarget;
                }
                else {
                    this._selectTarget = null;
                    this.dataBase.options.hide();
                }
            }
        }
    },
    // 鼠标移动事件
    _onMouseMoveEvent: function (event) {
        if (this._selectTarget && this._hasMoveTarget) {
            this._move(event);
        }
    },
    // 移动家具
    _move: function (event) {
        var movePos = new Fire.Vec2(event.screenX, event.screenY);
        var moveWordPos = Fire.Camera.main.screenToWorld(movePos);

        var offsetWordPos = Fire.Vec2.zero;
        offsetWordPos.x = this._mouseDownPos.x - moveWordPos.x;
        offsetWordPos.y = this._mouseDownPos.y - moveWordPos.y;

        this._selectTarget.transform.x = this._selectTargetInitPos.x - offsetWordPos.x;
        this._selectTarget.transform.y = this._selectTargetInitPos.y - offsetWordPos.y;

        this.dataBase.options.setPos(this._selectTarget.transform.worldPosition);
    },
    // 鼠标释放事件
    _onMouseUpEvent: function () {
        this._hasMoveTarget = false;
    },
    // 隐藏控制选项
    _onHideEvent: function () {
        this._selectTarget = null;
        this._backupSelectTarget = null;
        this._lastSelectTarget = null;
    },
    // 反转方向
    _onMirrorFlipEvent: function () {
        if (this._selectTarget) {
            var scaleX = this._selectTarget.transform.scaleX;
            this._selectTarget.transform.scaleX = scaleX > 1 ? -scaleX : Math.abs(scaleX);
        }
    },
    // 删除选择对象
    _onDeleteTargetEvent: function () {
        var furniture = this._selectTarget.getComponent('Furniture');
        if (furniture.suit_id > 0) {
            if (this.dataBase.curDressSuit.price > 0) {
                this.dataBase.options.hide();
                this.dataBase.tipsWindow.openTipsWindow('对不起，此物品为套装中的物品，\n 不可移除，请整套购买');
                return;
            }
            else {
                var index = this.dataBase.curDressSuit.funrnitureList.indexOf(furniture);
                if (index > -1){
                    this.dataBase.curDressSuit.funrnitureList.splice(index, 1);
                }
            }
        }
        furniture.setMarkUse(false);
        this._selectTarget.destroy();
        this._selectTarget = null;
        this._backupSelectTarget = null;
        this._lastSelectTarget = null;
        this.dataBase.options.hide();
    },
    // 重置
    reset: function () {
        this.dataBase.options.hide();
        this._selectTarget = null;
        this._backupSelectTarget = null;
        this._lastSelectTarget = null;
    },
    // 绑定事件
    start: function () {
        // 常用的变量/数据
        var ent = Fire.Entity.find('/DataBase');
        this.dataBase = ent.getComponent('DataBase');

        Fire.Input.on('mousedown', this.bindedMouseDownEvent);
        Fire.Input.on('mousemove', this.bindedMouseMoveEvent);
        Fire.Input.on('mouseup', this.bindedMouseUpEvent);
        //
        this.dataBase.options.onHideEvent = this._onHideEvent.bind(this);
        this.dataBase.options.btn_del.onMousedown = this._onDeleteTargetEvent.bind(this);
        this.dataBase.options.btn_MirrorFlip.onMousedown = this._onMirrorFlipEvent.bind(this);
    },
    // 销毁
    onDestroy: function() {
        Fire.Input.off('mousedown', this.bindedMouseDownEvent);
        Fire.Input.off('mousemove', this.bindedMouseMoveEvent);
        Fire.Input.off('mouseup', this.bindedMouseUpEvent);
    }
});
