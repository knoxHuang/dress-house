var Comp = Fire.Class({
    extends: Fire.Component,

    properties: {
        btn_GoToSingle: {
            default: null,
            type: Fire.UIButton
        }
    },

    // use this for initialization
    start: function () {
        Fire.Engine.preloadScene('single');
        this.btn_GoToSingle.onClick = this.onGoToSingleEvent.bind(this);
    },

    onGoToSingleEvent: function () {
        Fire.Engine.loadScene('single');
    },

    // called every frame
    update: function () {

    }
});
