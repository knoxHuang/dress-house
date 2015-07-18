var Options = Fire.Class({
    // �̳�
    extends: Fire.Component,
    // ���캯��
    constructor: function () {
        this.anim = null;
        this.bindHideOptionsEvent = this._hideOptionsEvent.bind(this);
        this.onHideEvent = null;
    },
    // ����
    properties: {
        // ����ѡ��
        btn_hide: {
            default: null,
            type: Fire.UIButton
        },
        // ɾ������
        btn_del: {
            default: null,
            type: Fire.UIButton
        },
        // ����ת
        btn_MirrorFlip: {
            default: null,
            type: Fire.UIButton
        }
    },
    // �Ƿ�����
    hasOpen: function () {
        return this.entity.active;
    },
    // �Ƿ��д���ѡ��
    hasTouch: function (target) {
        return target === this.btn_hide.entity ||
               target === this.btn_del.entity  ||
               target === this.btn_MirrorFlip.entity;
    },
    // ��������
    setPos: function (value) {
        this.entity.transform.position = value;
    },
    // ��ѡ��
    open: function (target) {
        // �������
        if (target) {
            this.entity.parent = null;
            this.setPos(target.transform.worldPosition);
        }
        this.entity.active = true;
        if (! this.anim) {
            this.anim = this.entity.getComponent(Fire.Animation);
        }
        this.anim.play('options');
    },
    // ����ѡ��
    hide: function () {
        this.entity.active = false;
        this.entity.transform.scale = new Fire.Vec2(0, 0);
        if (this.onHideEvent) {
            this.onHideEvent();
        }
    },
    // ����ѡ��
    _hideOptionsEvent: function() {
        this.hide();
    },
    // ��ʼ
    start: function () {
        this.btn_hide.onMousedown = this.bindHideOptionsEvent;
    }
});
