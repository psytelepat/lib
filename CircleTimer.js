'use strict';

// класс кругового svg-таймера

var $ = require('jquery'),
	MinimalClass = require('./MinimalClass');

module.exports = MinimalClass.extend({
	__className: 'CircleTimer',
	pre: function(){
		this.autorestart = false;
		this.dashoffset = 88;
		this.mode = 'jquery';
	},
	create: function()
	{
		var self = this;
		this.tmr = false;
		this.timer = this.element.find('svg.js-circle-timer');

		var time = parseInt(this.timer.attr('data-time'));
		if(!this.time) {
			this.time = time || 5;
		}else if( time ){
			this.time = time;
		}

		if( this.mode == 'css' ) {
			this.timer.bind( this.transitionEndEventName(), function(e){
				if(e.target !== this) return;
				e.preventDefault();
				e.stopPropagation();
				switch(e.originalEvent.propertyName) {
					case 'stroke-dashoffset':
						self.complete(e);
						break;
				}
			});
		}
	},
	start: function()
	{
		switch(this.mode){
			case 'jquery':
				var self = this;
				this.timer.css({ strokeDashoffset: this.dashoffset }).animate({ strokeDashoffset: 0 },this.time*1000,'linear',function(){
					self.complete();
				});
				break;
			case 'css':
				this.timer.addClass('timer'+this.time);
				break;
		}
		return true;
	},
	stop: function()
	{
		if( this.tmr ) {
			clearTimeout(this.tmr);
			this.tmr = null;
		}

		switch(this.mode){
			case 'jquery':
				this.timer.stop().css({ strokeDashoffset: this.dashoffset });
				break;
			case 'css':
				this.timer.removeClass('timer'+this.time);
				break;
		}

		return true;
	},
	complete: function(e)
	{
		this.stop();
		
		( typeof this.onComplete == 'function' ) && this.onComplete();

		if( this.autorestart ) {
			var self = this;
			this.tmr = setTimeout(function(){ self.start(); },0);
		}
	}
});