'use strict';

// класс кастомного скролла для элементов

var $ = require('jquery'),
	MinimalClass = require('./MinimalClass');

module.exports = MinimalClass.extend({
	__className: 'ForceScroll',
	pre: function(opt){
		this.maxLength = 0;
		this.autoMouse = true;
		this.minRunnerOffset = 0;
		this.vertical_padding = 0;
		this.horizontal_padding = 0;
		this.mode = $(opt.element).data('scroll-mode') || 'vertical';
	},
	create: function(){
		var self = this;

		this.scrolling = false;
		this.scrollerLength = 0;

		this.width = 0;
		this.height = 0;
		this.contentLength = 0;

		this.prc = 0;
		this.__pos = 0;
		this.maxScroll = 0;

		this.runnerLength = 0;
		this.maxRunnerOffset = 0;

		this.sy = 0;
		this.sx = 0;

		this.busy = false;

		this.isTouch = 'ontouchstart' in window || navigator.maxTouchPoints;

		this.scroll_box = this.element.find('.js-scroll-box');
		this.content = this.element.find('.js-scroll-content');

		this.runner = false;
		this.handler = false;
		this.handler_pos = 0;
		this.handler_length = 0;
		this.max_handler_pos = 0;

		var scroller = this.element.find('.js-scroller');
		this.scroller = scroller.length ? scroller : false;

		if (this.scroller) {
			var runner = this.scroller.find('div.js-runner'),
				handler = this.scroller.find('div.js-handler');

			if(runner.length) {
				this.runner = runner;
				this.runner.css({ top: this.vertical_padding, left: this.horizontal_padding });
			}

			if(handler.length) {
				this.handler = handler;
				this.handler.css({top: this.vertical_padding, left: this.horizontal_padding});
				this.handler.bind('mousedown', function(e){ self.mouse_handler(e); });
			}
		}

		this.resize();

		this.on_mouse_wheel = function (e) { self.mouse_wheel(e); };
		this.on_mouse_handler = function (e) { self.mouse_handler(e); };
		// this.scroll_box.mousewheel(this.on_mouse_wheel);

		if( this.isTouch ) {
			this.setTouchEvent({
				preventMove: true,
				preventEndIfMoved: true,
				touchSurface: this.scroll_box,
				minDistanceX: 20,
				minDistanceY: 20,
				onStart: function (options, touchEvent) {
					options.__pos = self.__pos;
				},
				onMove: function (options, touchEvent) {
					switch(self.mode){
						case 'horizontal':
							self.__pos = options.__pos + options.distanceX;
							break;
						case 'vertical':
							self.__pos = options.__pos + options.distanceY;
							break;
					}
					self.update_positions();
				},
				onEnd: function (options, touchEvent) {
					switch(self.mode){
						case 'horizontal':
							self.__pos = options.__pos + options.distanceX;
							break;
						case 'vertical':
							self.__pos = options.__pos + options.distanceY;
							break;
					}
					self.update_positions();
				}
			});
		}
	},
	set_width: function(width) {
		this.opt.width = width;
		this.resize();
	},
	set_height: function(height) {
		this.opt.height = height;
		this.resize();
	},
	resize: function () {
		var self = this;
		this.prc = this.__pos = 0;

		switch(this.mode){
			case 'horizontal':
				this.contentLength = this.content.outerWidth(true);
				this.maxLength = Math.min(this.contentLength, ( this.opt.width || this.scroll_box.outerWidth(true) ));
				this.element.css({ width: this.maxLength });
				this.content.css({ left: this.__pos });
				this.width = this.maxLength;

				this.handler_length = this.handler.outerWidth(true);
				this.max_handler_pos = this.width - this.handler_length;
				break;
			case 'vertical':
				this.contentLength = this.content.outerHeight(true);
				this.maxLength = Math.min(this.contentLength, ( this.opt.height || this.scroll_box.outerHeight(true) ));
				this.element.css({ height: this.maxLength });
				this.content.css({ top: this.__pos });
				this.height = this.maxLength;

				this.handler_length = this.handler.outerHeight(true);
				this.max_handler_pos = this.height - this.handler_length;
				break;
		}

		this.scrolling = this.contentLength > this.maxLength;

		if (this.scrolling) {
			this.element.addClass('scrolling');
			this.maxScroll = -(this.contentLength - ( this.height || this.width ));
			if( this.runner ) {
				this.runnerLength = Math.round( ( this.maxLength / this.contentLength ) * ( this.maxLength - this.minRunnerOffset * 2 ) );
				this.maxRunnerOffset = ( this.maxLength - this.runnerLength - this.minRunnerOffset );

				switch(this.mode){
					case 'horizontal':
						this.runner.css({ width: this.runnerLength });
						break;
					case 'vertical':
						this.runner.css({ height: this.runnerLength });
						break;
				}

				this.set_prc(0);
			}
		}else{
			this.element.removeClass('scrolling');
			this.maxScroll = 0;
		}
	},
	scroll_to: function(elm) {
		if( !this.scrolling ) {
			return;
		}

		var self = this,
			pos;

		switch(this.mode){
			case 'horizontal':
				pos = elm.position().left;
				this.__pos = Math.min(0,Math.max(Math.round(( this.width - elm.outerWidth(true) ) / 2) - pos,this.maxScroll));
				break;
			case 'vertical':
				pos = elm.position().top;
				this.__pos = Math.min(0,Math.max(Math.round(( this.height - elm.outerHeight(true) ) / 2) - pos,this.maxScroll));
				break;
		}

		this.busy = true;

		var css_target;
		switch(this.mode){
			case 'horizontal':
				css_target = { left: this.__pos };
				break;
			case 'vertical':
				css_target = { top: this.__pos };
				break;
		}

		this.content.animate(css_target,{
			duration: 700,
			easing: 'swing',
			step: function( offset ) {
				var prc = Math.abs(offset / self.maxScroll);
				if( self.delegate && typeof self.delegate.set_scroll_prc === 'function' ) {
					self.delegate.set_scroll_prc(prc);
				}
			},
			complete: function(){
				self.busy = false;
			}
		});
	},
	set_prc: function(prc,animated,nohandler) {
		this.prc = prc;
		this.__pos = Math.round(Math.min(0,Math.max(this.maxScroll,this.maxScroll * prc)));
		this.update_positions(animated,nohandler);
	},
	mouse_wheel: function (e) {
		if (!this.scrolling || this.busy) {
			return;
		}

		if( typeof e !== 'undefined' ) {
			e.preventDefault();
			e.stopPropagation();
		}

		this.__pos += e.deltaY * 30;
		this.update_positions();
	},
	mouse_handler: function(e){
		var self = this;
		switch(e.type){
			case 'mousedown':
				this.sx = e.pageX;
				this.sy = e.pageY;
				$(window).bind('mouseup mousemove', this.on_mouse_handler);
				document.onselectstart = function(e){
					e.stopPropagation();
					e.preventDefault();
					return false;
				};
				break;
			case 'mousemove':
			case 'mouseup':
				var diff_x = e.pageX - this.sx,
					diff_y = e.pageY - this.sy,
					pos;

				switch(this.mode){
					case 'horizontal':
						pos = Math.max(0,Math.min(this.handler_pos + diff_x,this.max_handler_pos));
						this.handler.css({ left: pos });
						break;
					case 'vertical':
						pos = Math.max(0,Math.min(this.handler_pos + diff_y,this.max_handler_pos));
						this.handler.css({ top: pos });
						break;
				}

				var prc = pos / this.max_handler_pos;
				this.set_prc(prc,false,true);

				if( e.type === 'mouseup' ){
					this.handler_pos = pos;
					document.onselectstart = null;
					$(window).unbind('mouseup mousemove', this.on_mouse_handler);
				}
				break;
		}
	},
	update_runner_pos: function(animated){
		if( this.runner ) {
			var offset = Math.max( this.minRunnerOffset, Math.min( this.maxRunnerOffset * this.prc, this.maxRunnerOffset ) );
			switch(this.mode){
				case 'horizontal':
					animated ? this.runner.stop().animate({ left: offset }) : this.runner.stop().css({ left: offset });
					break;
				case 'vertical':
					animated ? this.runner.stop().animate({ top: offset }) : this.runner.stop().css({ top: offset });
					break;
			}
		}
	},
	update_content_pos: function(animated){
		switch(this.mode){
			case 'horizontal':
				animated ? this.content.stop().animate({ left: this.__pos }) : this.content.stop().css({ left: this.__pos });
				break;
			case 'vertical':
				animated ? this.content.stop().animate({ top: this.__pos }) : this.content.stop().css({ top: this.__pos });
				break;
		}
	},
	update_handler_pos: function(animated){
		if( this.handler ){
			this.handler_pos = Math.max(0,Math.min(Math.round(this.prc * this.max_handler_pos),this.max_handler_pos));
			switch(this.mode){
				case 'horizontal':
					animated ? this.handler.stop().animate({ left: this.handler_pos }) : this.handler.stop().css({ left: this.handler_pos });
					break;
				case 'vertical':
					animated ? this.handler.stop().animate({ top: this.handler_pos }) : this.handler.stop().css({ top: this.handler_pos });
					break;
			}
		}
	},
	update_positions: function(animated,nohandler){
		this.__pos = Math.max(Math.min(0, this.__pos), this.maxScroll);
		this.prc = Math.abs( this.__pos / this.maxScroll );
		if( this.delegate && typeof this.delegate.set_scroll_prc === 'function' ) { this.delegate.set_scroll_prc(this.prc); }
		this.update_content_pos();
		this.update_runner_pos();
		if(!nohandler) { this.update_handler_pos(); }
	}
});