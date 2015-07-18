var Comp = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        // 房间名称
        this.floor_name = '';
        // 房间等级
        this.house_grade = 0;
        // 爱人ID
        this.lover_id = 0;
        // 爱人名称
        this.lover_name = '';
        // 爱人性别
        this.lover_gender = '';
        // 关系
        this.relation_name = '';
        // 标记
        this.mark = '';
        // 层ID
        this.storey_id = 0;
        //
        this.is_default = '';
    },
    // 属性
    properties: {
        // 房屋等级
        level: {
            default: null,
            type: Fire.Text
        },
        // 房主
        houseOwner: {
            default: null,
            type: Fire.Text
        },
        // 与TA的关系
        relation: {
            default: null,
            type: Fire.Text
        },
        // 加入房屋
        btn_goTo: {
            default: null,
            type: Fire.Button
        },
        // 解除关系
        btn_del: {
            default: null,
            type: Fire.Button
        }
    },
    // 更新房屋等级
    setLevel: function (value) {
        this.house_grade = value;
        this.level.text = value.toString();
    },
    // 更新房主
    setHouseOwner: function (value) {
        this.lover_name = value;
        this.houseOwner.text = value.toString();
    },
    // 更新与TA关系
    setRelation: function (value) {
        this.relation_name = value;
        this.relation.text = value.toString();
    },
    refresh: function (data, goToEvent, relieveEvent) {
        this.btn_goTo.onClick = goToEvent.bind(this);
        this.btn_goTo.onClick = relieveEvent.bind(this);
        this.setLevel(data.house_grade || 1);
        this.setHouseOwner(data.lover_name || '无');
        this.setRelation(data.relation_name || '无');
        this.mark = data.mark || 0;
        this.lover_id = data.lover_id || 0;
        this.lover_gender = data.lover_gender || 0;
        this.storey_id = data.storey_id  || 0;
        this.floor_name = data.floor_name || '无';
        this.is_default = data.is_default || '';
        this.btn_goTo.onClick = goToEvent;
        this.btn_del.entity.active = false;
        if (this.lover_id !== 0) {
            this.btn_del.onClick = relieveEvent;
            this.btn_del.entity.active = true;
        }
    }
});
