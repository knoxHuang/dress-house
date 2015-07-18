var Comp = Fire.Class({
    extends: Fire.Component,

    properties: {
        btn_GoToSingle: {
            default: null,
            type: Fire.UIButton
        },
        btn_GoToVilla: {
            default: null,
            type: Fire.UIButton
        }
    },

    // use this for initialization
    start: function () {
        Fire.Engine.preloadScene('single');
        Fire.Engine.preloadScene('villa');
        this.btn_GoToSingle.onClick = this.onGoToSingleEvent.bind(this);
        this.btn_GoToVilla.onClick = this.onGoToVillaEvent.bind(this);
    },

    onGoToSingleEvent: function () {
        Fire.Engine.loadScene('single');
    },
    onGoToVillaEvent: function () {
        Fire.Engine.loadScene('villa');
    },

    // called every frame
    update: function () {

    }
});
