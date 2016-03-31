'use strict';

function DopplerEffect(canvasSelector, textBoxSelector, sliderSelector){

    var self = this;

    this.$canvas = $(canvasSelector);
    this.$textBox = $(textBoxSelector);
    this.$slider = $(sliderSelector);
    this.width = 0;
    this.height = 0;
    this.image = new Image();
    this.ctx = null;
    this.lastValue = DopplerEffect.INITIAL_VALUE;
    this.timerId = null;

    if (this.$canvas.length > 0){

        this.ctx = this.$canvas[0].getContext('2d');
        this.width = this.$canvas[0].width;
        this.height = this.$canvas[0].height;

        $(this.image).on('load', function(event){
            self.ctx.drawImage(self.image, 0, 0);
        });

        this.image.src = this.$canvas.attr('data-src');

    }

    /*this.$slider.on('change', function(event){
     var v = $(this).val();
     v = DopplerEffect.sliderToText(v);
     self.$textBox.val(v);
     self.changeImage(v);
     });*/

    this.$textBox.bind('paste keyup', setupDelay);

    this.$slider.slider({
        min: 0,
        max: 7,
        value: DopplerEffect.LOG_MAX_INDEX,
        step: 0.2,
        change: onSliderChange,
        slide: onSliderSlide
    });

    self.$textBox.val(DopplerEffect.INITIAL_VALUE);
    this.changeImage(DopplerEffect.INITIAL_VALUE, true);

    function setupDelay(event){

        if (self.timerId){
            clearTimeout(self.timerId);
        }

        self.timerId = setTimeout(onPasteKeyUp, DopplerEffect.KEYBOARD_DELAY);

    }

    function onPasteKeyUp(){

        var value = self.$textBox.val();

        self.timerId = null;

        if (value.length === 0 || value === '-'){
            return;
        } else if (isNaN(value) || !DopplerEffect.isInRange(value)){
            self.changeImage(self.lastValue);
            self.$textBox.val(self.lastValue);
            return;
        }

        self.lastValue = value;
        self.$slider.slider('option', 'value', DopplerEffect.textToSlider(value));
        //self.$textBox.val(DopplerEffect.textToSlider(value));
        //self.$slider.val(DopplerEffect.textToSlider(value));
        //self.$slider[0].value = DopplerEffect.textToSlider(value);
        //document.getElementById('slider').value = DopplerEffect.VALUES.indexOf(DopplerEffect.textToSlider(value));
        self.changeImage(value);

        console.log('ela', value, /*document.getElementById('slider').value,*/ DopplerEffect.textToSlider(value));

    }

    function onSliderChange(event, ui){
        self.changeImage(DopplerEffect.sliderToText(ui.value));
    }

    function onSliderSlide(event, ui){

        var value = DopplerEffect.sliderToText(ui.value);

        self.$textBox.val(value);
        self.changeImage(value);

    }

}

DopplerEffect.INITIAL_VALUE = 0;
DopplerEffect.KEYBOARD_DELAY = 350; // milliseconds
DopplerEffect.LOG_MAX_INDEX = 4;
DopplerEffect.BASE_10 = 10;
DopplerEffect.COLOUR_MAX = 255;
DopplerEffect.SLIDER_MIN = -100;
DopplerEffect.SLIDER_MAX = 100;
DopplerEffect.ONE_THIRD = DopplerEffect.SLIDER_MAX / 3;
DopplerEffect.TWO_THIRDS = DopplerEffect.ONE_THIRD * 2;
DopplerEffect.VALUES = [
    DopplerEffect.SLIDER_MIN,
    //-10,
    //-1,
    //-0.1,
    DopplerEffect.SLIDER_MIN / DopplerEffect.BASE_10,
    DopplerEffect.SLIDER_MIN / Math.pow(DopplerEffect.BASE_10, 2),
    DopplerEffect.SLIDER_MIN / Math.pow(DopplerEffect.BASE_10, 3),
    DopplerEffect.INITIAL_VALUE,
    DopplerEffect.ONE_THIRD,
    DopplerEffect.TWO_THIRDS,
    DopplerEffect.SLIDER_MAX
];
DopplerEffect.swapColour = function(value, red, green, blue, alpha){

    var colour = null;

    if (!isNaN(value) && value > DopplerEffect.SLIDER_MIN - 1 &&
        value < DopplerEffect.SLIDER_MAX + 1 &&
        DopplerEffect.checkColour(red) &&
        DopplerEffect.checkColour(green) &&
        DopplerEffect.checkColour(blue) &&
        DopplerEffect.checkColour(alpha)){

        colour = {
            red: red,
            green: green,
            blue: blue,
            alpha: alpha
        };

        if (alpha > 0){

            var temp = Math.abs(value);
            var temp2 = temp * 2.55;

            if (value < 0){

                colour.red -= ((red / 100) * temp);
                colour.green -= ((green / 100) * temp);
                colour.blue += temp2;

            } else if (value > 0){

                colour.blue -= ((blue / 100) * value);
                colour.green -= ((green / 100) * value);
                colour.red += temp2;

            }

        }

    }

    return colour;

};
DopplerEffect.checkColour = function(value){
    return !isNaN(value) && value > -(DopplerEffect.COLOUR_MAX + 1) && value < DopplerEffect.COLOUR_MAX + 1;
};
DopplerEffect.isInRange = function(value){
    return !isNaN(value) && !(value < DopplerEffect.SLIDER_MIN || value > DopplerEffect.SLIDER_MAX);
};
DopplerEffect.sliderToText = function(value){

    var result = null;

    if (!isNaN(value)){

        var i = 0;
        var i_ = 0;
        var j = 0;
        var arr = (value + '').split('.');
        var whole = Number(arr[0]);
        var part = arr.length > 1 ? Number(arr[1]): 0;

        if (whole < DopplerEffect.LOG_MAX_INDEX){
            // log
            for (i = 0, i_ = DopplerEffect.LOG_MAX_INDEX, j = DopplerEffect.BASE_10; i < i_; i++, j /= DopplerEffect.BASE_10){
                if (i === whole){
                    result = DopplerEffect.VALUES[i] + (part * j);
                    break;
                }
            }
        } else if (whole < DopplerEffect.VALUES.length){
            // linear
            for (i = DopplerEffect.LOG_MAX_INDEX, i_ = DopplerEffect.VALUES.length; i < i_; i++){
                if (i === whole){
                    if (part > 0){
                        part = (part * 0.1) * DopplerEffect.ONE_THIRD;
                    }
                    result = ((i - DopplerEffect.LOG_MAX_INDEX) * DopplerEffect.ONE_THIRD) + part;
                    break;
                }
            }
        } else {
            result = DopplerEffect.INITIAL_VALUE;
        }

        //switch (whole){
        //    case 0: // -100
        //        part *= 10;
        //        result = -100 + part;
        //        break;
        //    case 1: // -10
        //        result = -10 + part;
        //        break;
        //    case 2: // -1
        //        part *= 0.1;
        //        result = -1 + part;
        //        break;
        //    case 3: // -0.1
        //        part *= 0.01;
        //        result = -0.1 + part;
        //        break;
        //    case 4: // 0
        //
        //        if (part > 0){
        //            part = (part * 0.1) * DopplerEffect.ONE_THIRD;
        //        }
        //
        //        result = /*0 + */part;
        //        break;
        //    case 5: // 33.33333333
        //
        //        if (part > 0){
        //            part = (part * 0.1) * DopplerEffect.ONE_THIRD;
        //        }
        //
        //        result = DopplerEffect.ONE_THIRD + part;
        //        break;
        //    case 6: // 66.66666666
        //
        //        if (part > 0){
        //            part = (part * 0.1) * DopplerEffect.ONE_THIRD;
        //        }
        //
        //        result = DopplerEffect.TWO_THIRDS + part;
        //        break;
        //    case 7: // 100
        //        result = 100;
        //        break;
        //    default:
        //}

    }

    //console.log('value', value, result);

    return result;
    //return DopplerEffect.VALUES[value];

};
DopplerEffect.textToSlider = function(value){

    var result = 0;

    if (!isNaN(value)){

        if (value < 0){
            // log

            //if (value > -0.1){
            //    result = 4 - (value / -0.1);
            //} else if (value > -1){
            //    result = 3 - (value / -0.9);
            //} else if (value > -10){
            //    result = 2 - (value / -9);
            //} else if (value > -100){
            //    result = 1 - (value / -90);
            //} else if (value === -100){
            //    result = 0;
            //}

            for (var i = 0, i_ = DopplerEffect.LOG_MAX_INDEX + 1; i < i_; i++){
                var index = DopplerEffect.LOG_MAX_INDEX - 1 - i;
                if (value > DopplerEffect.VALUES[index]){
                    result = (DopplerEffect.LOG_MAX_INDEX - i) - (value / (DopplerEffect.VALUES[index] - (i === DopplerEffect.LOG_MAX_INDEX ? 0 : DopplerEffect.VALUES[index + 1])));
                    break;
                }
            }

        } else if (value > 0){
            // linear
            result = DopplerEffect.LOG_MAX_INDEX + (value / DopplerEffect.ONE_THIRD);
        } else {
            result = DopplerEffect.LOG_MAX_INDEX;
        }

    }

    //console.log('value', value, result);

    return result;
    //return DopplerEffect.VALUES.indexOf(value);

};

DopplerEffect.prototype.changeImage = function(value, force){

    if (!isNaN(value)){

        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.drawImage(this.image, 0, 0);

        this.lastValue = value;

        if (typeof force === 'undefined' && value === 0){
            return;
        }

        var pixels = this.ctx.getImageData(0, 0, this.width, this.height);

        for (var i = 0, i_ = pixels.data.length; i < i_; i += 4){

            var red = pixels.data[i];
            var green = pixels.data[i + 1];
            var blue = pixels.data[i + 2];
            var alpha = pixels.data[i + 3];
            var colour = DopplerEffect.swapColour(value, red, green, blue, alpha);

            pixels.data[i] = colour.red;
            pixels.data[i + 1] = colour.green;
            pixels.data[i + 2] = colour.blue;
            pixels.data[i + 3] = colour.alpha;

        }

        this.ctx.putImageData(pixels, 0, 0);

    }

};