'use strict';

// класс диалоговых окон

var $ = require('jquery'),
	OverlayForm = require('./OverlayForm'),
	SmoothScrollBar = require('smooth-scrollbar'),
	MinimalClass = require('./MinimalClass');

window.overlays = {};
window.current_overlay = false;
window.overlay_start_zindex = 1000;
window.overlays_stack = {
	stack: [],
	put: function(new_overlay){
		if( window.current_overlay && ( window.current_overlay !== new_overlay ) ){
			this.stack.push(window.current_overlay);
			window.current_overlay.stack(new_overlay);
		}
		window.current_overlay = new_overlay;
		var zIndex = window.overlay_start_zindex;
		if( new_overlay.customZIndex ){ zIndex = new_overlay.customZIndex; }
		zIndex += this.stack.length;
		new_overlay.element.css({ zIndex: zIndex });
	},
	pop: function(){
		var overlay = this.stack.length ? this.stack.pop() : false;
		window.current_overlay = overlay;
		if( overlay ){
			window.current_overlay.unstack();
		}
	}
};

module.exports = MinimalClass.extend({
	__className: 'Overlay',
	pre: function(){
		this.popup = false;
		this.content = false;
		this.force_absolute = false;
		this.customZIndex = 0;
	},
	create: function(){
		var self = this;

		if( !this.element ) {
			if( typeof this.create_overlay_element === 'function' ){
				this.create_overlay_element();
			}else{
				this.log('[' + this.__className + '] No element for overlay');
				return;
			}
		}

		this.absolute = true;
		this.stacked = false;

		this.opened = false;
		this.resizable = false;
		this.content_fixed_by_this_overlay = false;

		this.name = this.element.data('name');
		if(this.name){ window.overlays[this.name] = this; }

		this.customZIndex = parseInt( this.element.data('z-index') || 0 );

		this.triggerName = this.element.data('trigger');
		if( this.triggerName ) {
			$('.js-'+this.triggerName+'-trigger').each(function(i,elm){
				var trigger = $(elm);
				trigger.click(function(e){
					e.preventDefault();
					e.stopPropagation();
					self.open(null,trigger);
				});
			});
		}

		if(!this.popup) {
			this.popup = this.element.find('.js-popup');
		}

		if(!this.content) {
			this.content = this.element.find('.js-content');
		}

		this.scrolling_text = this.popup.find('.js-scrolling-text');
		if( this.scrolling_text.length ) {
			this.scroll_text = SmoothScrollBar.default.init(this.scrolling_text[0],{ alwaysShowTracks: true });
		}

		this.element.find('.js-close').click(function(e){
			self.close();
		});

		this.element.click(function(e){
			if(!self.opened) { return; }
			if( e.target === this ) {
				self.close();
			}
		});

		this.floating_close = this.element.find('.js-close-float');

		this.create_form();

		window.app.add_resize(this);
	},
	create_form: function(){
		var form = this.element.find('form');
		if( form.length ){
			this.form = new OverlayForm({ element: form, delegate: this, overlay: this });
		}
	},
	open: function(cb,trigger){
		var self = this;

		$(window).trigger('openingOverlay',[this]);

		window.overlays_stack.put(this);

		if( !window.contentFixed ) this.content_fixed_by_this_overlay = window.setFixedContent(true);

		this.element.addClass('resizable');
		this.resizable = true;
		this.resize();
		this.on_open(cb);
		this.opened = true;

		this.repos_floating_close();
	},
	repos_floating_close: function(){
		if (this.floating_close){
			this.floating_close.css('left', this.popup.offset().left + this.popup.outerWidth());

			if( window.app.ww_desktop ){
				this.floating_close.css('top', Math.max(Math.round((window.app.wh - this.popup.outerHeight(true))/2),70));
			}else{
				this.floating_close.css('top', '');
			}
		}
	},
	on_open: function(cb){
		if( this.form && ( typeof this.form.on_open === 'function' ) ) this.form.on_open();

		this.element.addClass('visible open');
		if( typeof cb === 'function' ) {
			cb(this);
		}
		if( typeof this.onOpen === 'function' ) {
			this.onOpen(this);
		}
	},
	close: function(cb){
		var self = this;

		$(window).trigger('closingOverlay',[this]);

		this.element.removeClass('open');

		setTimeout(function(){
			window.overlays_stack.pop();
			self.on_close(cb);
		}, window.app.is_mobile ? 0 : 400);
	},
	on_close: function(cb){
		this.element.removeClass('visible resizable');
		this.resizable = false;

		if( typeof this.onClose === 'function' ) {
			this.onClose(this);
		}

		if( this.content_fixed_by_this_overlay ) {
			this.content_fixed_by_this_overlay = false;
			window.setFixedContent(false);
		}

		if( typeof cb === 'function' ) {
			cb(this);
		}

		this.opened = false;
	},
	resize: function(ww,wh){
		if( !this.resizable ) return;

		if(!ww||!wh){
			ww = window.app.ww;
			wh = window.app.wh;
		}

		this.popup.css({ position: 'absolute', height: '' });

		this.width = this.popup.outerWidth(true);
		this.height = this.popup.outerHeight(true);

		var fields = window.app.ww_desktop ? 140 : 0;

		if( !window.app.ww_desktop ){
			this.height = Math.max(this.height,wh);
			this.popup.css({ height: this.height });
		}

		if( !(this.force_absolute) && this.height < ( wh - fields ) ){
			var top = Math.round( ( wh - this.height ) / 2 ),
				left = Math.round( ( ww - this.width ) / 2 );

			this.absolute = false;
			this.popup.css({ top: top, left: left });
		}else{
			this.absolute = true;
			this.popup.css({ position: '', top: '', left: '' });
		}

		this.repos_floating_close();
	},
	set_content: function(html,cb){
		this.content.empty().html(html);
		if( typeof cb === 'function' ) {
			cb(this.content);
		}
		return this
	},
	stack: function(){
		this.element.addClass('stacked');
	},
	unstack: function(){
		this.element.removeClass('stacked');
		window.scrollTo(0,0);
	}
});
