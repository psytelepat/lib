'use strict';

// упрощенный класс реагирования элемента на сролл документа

var $ = require('jquery'),
    MinimalClass = require('./MinimalClass');

module.exports = MinimalClass.extend({
    __className: 'ScrollActionSimple',
    create: function(){
        var self = this;

        this.onScrollFunctions = [];
        this.onScrollFunctionsByTid = {};
        
        window.addSimpleScrollAction = function(elm,callback,trigger_prc){
            self.addElement(elm,callback,trigger_prc);
        };

        $('.js-sa').each(function(i,elm){
            var trigger_prc = parseInt($(elm).data('sa-prc') || 0) / 100;
            self.addElement(elm,null,trigger_prc);
        });

        $(window).trigger('scroll_action_simple_ready');
        $(window).bind('init_scroll_action_simple', function(){
            window.app.add_scroll(self);
        });
    },
    addElement: function(elm,callback,trigger_prc){
        if( typeof callback !== 'function' ){ callback = false; }
        if( typeof trigger_prc === 'undefined' || !trigger_prc ){ trigger_prc = .1; }

        obj = $(elm);
        elm = obj[0];

        var obj = $(elm),
            activated = false,
            onScroll = function(force) {
                if(activated) return 0;

                var rect = elm.getBoundingClientRect();
                var prc = 0, total = window.innerHeight + rect.height;

                if( rect.top > window.innerHeight ) prc = 0;
                else if( rect.top < -rect.height ) prc = 1;
                else prc = 1 - ( ( rect.top + rect.height ) / total );

                if(force || ( prc > trigger_prc ) ) {
                    if( callback ) {
                        callback(obj);
                    }else{
                        obj.addClass('atscroll');
                        obj.removeClass('sa-remove');
                    }
                    activated = true;
                }
            };

        this.onScrollFunctions.push(onScroll);
        
        var tid = obj.attr('sa-tid');
        if( tid ){ this.onScrollFunctionsByTid[tid] = onScroll; }
    },
    scroll: function(){
        this.onScrollFunctions.forEach(function(f,i){
            f(false);
        });
    }
});