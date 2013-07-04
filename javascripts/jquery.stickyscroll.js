$.fn.stickyscroll = function(options) {
    
    var os = options;
    if(!options) {
        os = {
            t:0,
            b:window
        };
    }
    
    if(typeof os.b == 'undefined') {
        os = {
            t:(typeof os.t != 'undefined' ? os.t : undefined),
            b:window
        }
    }
    if(options == 'reset') {
        os.t = undefined
    }
    
    return this.each(function() {

        var defaults = {position: 'left', leftOffset: 0, rightOffset: 0, t: os.t, b: os.b};
        var opts = $.extend(defaults, this.os); 
        var o = $.meta ? $.extend({}, opts, $.data()) : opts;
        
        var isWindow = (typeof o.b.screen != 'undefined' ? true : false);
        
        var w = $(o.b).width();
        var sticky = $(this);
        var parent = $(sticky).parent().width();
        $(o.b).bind('scroll', scroll);
        if(!isWindow) {
            $(window).bind('scroll', scroll);
        }
        var offsets = getOffsets();
        var start = offsets.top;
        var begin = offsets.begin;
        var end = offsets.end;
        
        function getOffsets(){
            if(!isWindow) {
                var pos = $(sticky).position();
                pos.top -= $(o.b).offset().top
                pos.begin = $(o.b).offset().top
                pos.end = $(o.b).next().offset().top
                return pos;
            }
            else {
                var pos = $(sticky).offset();
                pos.begin = 0;
                pos.end = $(window).height();
                return pos;
            }
        }
        function scroll() {
            var position = $(o.b).scrollTop();
            var positionOffset = position+o.t;
            var windowPosition = $(window).scrollTop();
            
            if(!isWindow){
                chkOffsets = getOffsets();
                begin = chkOffsets.begin;
            }
            
            //figure out if moving?
            var move = false;
            if(isWindow && positionOffset > start) {
                move = true;
            }
            else if(!isWindow) {
                if(windowPosition < (end - o.t) && windowPosition > begin) {
                    move = true;
                }
                else if(positionOffset > begin) {
                    move = true;
                }
            }
            
            if(move) {
                if(!$(sticky).hasClass('scrolling')) {
                    $(sticky).addClass('scrolling');
                }
                
                if(!isWindow && windowPosition < (begin - o.t)) {
                    $(sticky).css('top', (begin - windowPosition - o.t) + 'px');
                }
                else {
                    $(sticky).css('top',(o.t + 'px'));
                }
            }
            else {
                if($(sticky).hasClass('scrolling')) {
                    $(sticky).removeClass('scrolling');
                }
                $(sticky).css('top','');
            }
        }

    });
};