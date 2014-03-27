
var DopplerEffect = {

    cvs: null,
    ctx: null,
    img: null,
    $sld: null,
    $txt: null,
    width: 0,
    height: 0,
    sliderMin: -100,
    sliderMax: 100,
    sliderMin2: 0,
    sliderMax2: 400,
    sliderZero: 300,
    lastVal: 0,

    init: function(){

        var that = this;

        this.cvs = document.getElementById('cvsMain');
        this.img = document.getElementById('imgMain');
        this.$txt = $('#txtMain');
        this.$sld = $('#sldMain');
        this.width = this.cvs.width;
        this.height = this.cvs.height;

        this.img = new Image();
        this.img.src = $(this.cvs).attr('data-src');

        if (this.cvs != null){
            this.ctx = this.cvs.getContext('2d');
            this.ctx.drawImage(this.img, 0, 0);
        }

        this.$txt.bind('paste keyup',function(event){
            var val = that.$txt.val();
            if (val.length === 0 || val === '-')
                return;

            if (isNaN(val) || !that.isInRange(val)){
                that.$txt.val(that.lastVal);
                return;
            }
            var v = that.textToSlider(val);
            that.lastVal = val;
            that.$sld.slider('option', 'value', v);
            that.changeImage(val);
        });

        this.$sld.slider({

            min: that.sliderMin2,
            max: that.sliderMax2,
            value: that.sliderZero,
            step: 1,

            change: function(event, ui){
                that.changeImage(that.sliderToText(ui.value));
            },

            slide: function(event, ui){
                var v = that.sliderToText(ui.value);
                that.$txt.val(v);
                if (Math.round(ui.value) % 25 == 0)
                    that.changeImage(v);
            }

        });

        this.$txt.val(0);
        this.changeImage(0, true);

    },

    changeImage: function(val, force){

        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.drawImage(this.img, 0, 0);

        this.lastVal = val;

        if (force === undefined && val === 0)
            return;

        var pixels = this.ctx.getImageData(0, 0, this.width, this.height);

        for (var i = 0, i_ = pixels.data.length; i < i_; i += 4){
            var red = pixels.data[i];
            var green = pixels.data[i + 1];
            var blue = pixels.data[i + 2];
            var alpha = pixels.data[i + 3];
            var colour = this.swapColour(val, red, green, blue, alpha);
            pixels.data[i] = colour.red;
            pixels.data[i + 1] = colour.green;
            pixels.data[i + 2] = colour.blue;
            pixels.data[i + 3] = colour.alpha;
        }

        this.ctx.putImageData(pixels, 0, 0);

    },

    swapColour: function(val, red, green, blue, alpha){

        var colour = {red: red, green: green, blue: blue, alpha: alpha};

        if (alpha > 0){
            var temp = Math.abs(val);
            var temp2 = temp * 2.55;
            if (val < 0){
                colour.red -= ((red / 100) * temp);
                colour.green -= ((green / 100) * temp);
                colour.blue += temp2;
            } else if (val > 0){
                colour.blue -= ((blue / 100) * val);
                colour.green -= ((green / 100) * val);
                colour.red += temp2;
            }
        }

        return colour;

    },

    isInRange: function(val){

        return !(val < this.sliderMin || val > this.sliderMax);

    },

    sliderToText: function(val) {

        if (val < this.sliderZero){
            // 0 - 299
            return -100 + (val / 3.0);
        } else if (val > this.sliderZero){
            // 301 - 400
            return val - this.sliderZero;
        } else {
            return val;
        }
    },

    textToSlider: function(val) {

        var v = Number(val);

        if (val < 0){
            // -100 to -1
            return this.sliderZero + (v * 3.0);
        } else if (val > 0){
            // 1 to 100
            return this.sliderZero + v;
        } else {
            return this.sliderZero;
        }

    }

};

$(document).ready(function(){

    DopplerEffect.init();

});

