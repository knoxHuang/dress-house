function convertCanvasToImage(canvas) {
    var image = new Image();
    image.src = canvas.toDataURL("image/png");
    //canvas.getImageData()
    return image;
}
// 用于创建缩略图
var Screenshot = Fire.Class({
    extends: Fire.Component,
    constructor: function () {
        // 用于拍照
        this.frameCount = -1;
        this.needHideEntList = [];
        this.callback = null;
    },
    // 属性
    properties: {

    },
    // 载入时
    onLoad: function() {
        var ent = Fire.Entity.find('/SDataBase');
        this.sdataBase = ent.getComponent('SDataBase');
    },
    // 创建缩略图
    createThumbnails: function (callback) {
        if (callback){
            this.callback = callback;
        }
        // 关闭已经打开界面
        this.needHideEntList = [];
        var children = Fire.Engine._scene.entities;
        for (var i = 0, len = children.length; i < len; ++i) {
            var ent = children[i];
            if (ent.active && ent.name !== 'Main Camera' &&
                ent.name !== 'Scene Camera' && ent.name !== 'Room' &&
                ent.name !== 'Screenshot') {
                ent.active = false;
                this.needHideEntList.push(ent);
            }
        }
        // 创建 Canvas
        if (!this.canvasCtxToDreawImage) {
            var canvas = document.createElement('canvas');
            canvas.width = 120;
            canvas.height = 120;
            this.canvasCtxToDreawImage = canvas.getContext('2d');
        }
        this.frameCount = Fire.Time.frameCount + 2;
    },
    // 刷新
    update: function () {
        if (this.frameCount !== -1 && this.frameCount === Fire.Time.frameCount) {
            // 绘制图片
            // 绘制图片
            this.canvasCtxToDreawImage.clearRect(0, 0, 120, 120);
            var w = Fire.Engine._renderContext.width;
            var h = Fire.Engine._renderContext.height;
            //var mainImage = convertCanvasToImage(Fire.Engine._renderContext.canvas);
            this.canvasCtxToDreawImage.drawImage(Fire.Engine._renderContext.canvas, 0, 0, w, h, 0, 0, 120, 120);
            // 打开之前关闭的界面
            for (var i = 0, len = this.needHideEntList.length; i < len; ++i) {
                this.needHideEntList[i].active = true;
            }
            this.frameCount = -1;

            this.sdataBase.sloadingTips.openTips('创建缩略图');
            var mainImage = convertCanvasToImage(this.canvasCtxToDreawImage.canvas);
            mainImage.onload = function () {
                this.sdataBase.sloadingTips.closeTips();
                if (this.callback) {
                    this.callback(mainImage);
                }
            }.bind(this);
        }
    }
});
