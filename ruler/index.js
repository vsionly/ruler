var ratio = 8;// 每个刻度所占位的px

var minValueS = 40;// 最小刻度值
var maxValueS = 250;// 最大刻度值
var currentValueS = 170;// 当前刻度值
const SUBS = maxValueS - minValueS;

var minValueW = 2;// 最小刻度值
var maxValueW = 250;// 最大刻度值
var currentValueW = 60;// 当前刻度值
const SUBW = maxValueW - minValueW;

Page({
    data: {
        canvasH: 80,
        padding: 30,
        bmi:22,
        statureVal:170,
        weightVal:60
    },
    onLoad: function () {
        var self = this;
        wx.getSystemInfo({
            success: function (res) {
                console.log(self.data.canvasW,6)
                self.setData({
                    canvasW: res.windowWidth
                });

                // 绘制身高标尺
                self.drawRuler(minValueS, maxValueS, currentValueS, 'stature', 'CM');
                // 1.5 画布宽度
                var canvasWidth = (maxValueS - minValueS) * ratio + self.data.canvasW - self.data.padding * 2;
                self.setData({
                    statureW: canvasWidth,
                });
                self.setData({
                    statureLeft: (currentValueS - minValueS) * ratio
                });

                // 绘制体重标尺
                self.drawRuler(minValueW, maxValueW, currentValueW, 'weight', 'KG');
                // 1.5 画布宽度
                canvasWidth = (maxValueW - minValueW) * ratio + self.data.canvasW - self.data.padding * 2;
                self.setData({
                    weightW: canvasWidth,
                });
                self.setData({
                    weightLeft: (currentValueW - minValueW) * ratio
                });

            }
        })
    },
    drawRuler: function (min, max, current, carrier, unit) {
        /**
         * min 最小刻度, max 最大刻度, current 当前刻度 , carrier 画布id, unit 显示单位
         */
        /* 1.定义变量 */
        // 1.1 定义原点与终点，x轴方向起点与终点各留半屏空白
        var origion = { x: this.data.canvasW / 2 - this.data.padding, y: 40 };

        // 1.2 定义刻度线高度
        var height = 30; //10刻度的高
        var middle = 23; //5刻度的高
        var low = 16; //其他刻度高
        var lineY_w = 1;//刻度线线宽
        var lineX_w = 3;//水平线线宽
        // 1.3 定义文本标签字体大小
        var fontSize = 12;

        /* 2.绘制 */
        // 2.1初始化context
        const ctx = wx.createCanvasContext(carrier);

        //兼容最小刻度不是整数的情况
        var minus = 0;
        if (min%10 != 0){
            minus = min%10;
        }

        //画水平粗线
        ctx.setLineWidth(lineX_w);
        ctx.setStrokeStyle('#9aaac0');
        ctx.moveTo(origion.x - minus * ratio, origion.y - lineX_w/2);
        ctx.lineTo((max - min) * ratio + origion.x, origion.y - lineX_w/2);
        ctx.stroke();

        // 遍历maxValue
        for (var i = 0; i <= max - min + minus; i++) {
            ctx.beginPath();
            ctx.setLineWidth(lineY_w)
            // 2.2 画刻度线
            ctx.moveTo(origion.x + i * ratio - minus * ratio, origion.y);
            // 画线到刻度高度，5/10的位数就加高
            if (i/2 % 5 == 0 ){
                ctx.lineTo(origion.x + i * ratio - minus * ratio, origion.y - height);
            } else if (i % 5 == 0) {
                ctx.lineTo(origion.x + i * ratio - minus * ratio, origion.y - middle);
            }else{
                ctx.lineTo(origion.x + i * ratio - minus * ratio, origion.y - low);
            }
            ctx.setStrokeStyle('#9aaac0');
            // 描线
            ctx.stroke();

            // 2.3 描绘文本标签
            ctx.setFontSize(fontSize);
            ctx.setFillStyle('#99a9bf');
            if (i == 0 && minus > 0) {
                ctx.fillText(min - minus + unit, origion.x + (i-minus) * ratio - fontSize * ((min - minus).toString().length / 2 + unit.length) / 2, fontSize + 50);
            }
            if ((i + minus) % 10 == 0) {
                // if (i == 0 && minus > 0) {
                //     minus += 10;
                // }
                ctx.fillText(i + min + unit, origion.x + i * ratio - fontSize * ((i + min).toString().length / 2 + unit.length) / 2, fontSize+50);
            }
            ctx.closePath();
        }
        // 2.4 绘制到context
        ctx.draw();
    },
    drawCursor: function () {
        /* 定义变量 */
        // 定义三角形顶点 TODO x
        var center = { x: 375 / 2, y: 5 };
        // 定义三角形边长
        var length = 20;
        // 左端点
        var left = { x: center.x - length / 2, y: center.y + length / 2 * Math.sqrt(3) };
        // 右端点
        var right = { x: center.x + length / 2, y: center.y + length / 2 * Math.sqrt(3) };
        // 初始化context
        const context = wx.createCanvasContext('canvas-cursor');
        context.moveTo(center.x, center.y);
        context.lineTo(left.x, left.y);
        context.lineTo(right.x, right.y);
        // fill()填充而不是stroke()描边，于是省去手动回归原点，context.lineTo(center.x, center.y);
        context.setFillStyle('#48c23d');
        context.fill();
        context.draw();
    },
    statureRoll: function (e) {
        // 选择的身高
        if (e.detail.scrollLeft < 0) {
            e.detail.scrollLeft = 0;
        } else if (e.detail.scrollLeft > SUBS * ratio) {
            e.detail.scrollLeft = SUBS * ratio;
        }
        this.setData({
            statureVal: Math.round(e.detail.scrollLeft / 8 + minValueS),
            bmi: (this.data.weightVal / ((this.data.statureVal / 100) * (this.data.statureVal / 100))).toFixed(1)
        });
        console.log(this.data.statureVal, this.data.weightVal,this.data.bmi)
    },
    weightRoll: function (e) {
        // 选择的体重
        if (e.detail.scrollLeft < 0) {
            e.detail.scrollLeft = 2;
        } else if (e.detail.scrollLeft > SUBW * ratio) {
            e.detail.scrollLeft = SUBW * ratio;
        }
        this.setData({
            weightVal: Math.round(e.detail.scrollLeft / 8 + minValueW),
            bmi: (this.data.weightVal / ((this.data.statureVal / 100) * (this.data.statureVal / 100))).toFixed(1)
        });
        console.log(this.data.bmi)
    }
});