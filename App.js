'use strict';

// singleton класс, обеспечивающий все остальные классы глобальными переменными и функциями

var $ = require('jquery'),
	WebFont = require('webfontloader'),
	MinimalClass = require('./MinimalClass'),
	ContentFix = require('./ContentFix'),
	ScrollActionSimple = require('./ScrollActionSimple'),
	SmoothScrollBar = require('smooth-scrollbar'),
	MobileDetect = require('mobile-detect');

// require('smoothscroll-polyfill').polyfill();

module.exports = MinimalClass.extend({
	__className: 'App',
	_resizable: [],
	_scrollable: [],
	_focusable: [],
	_instances: {},
	_video_players: [],
	pre: function(){
		var self = this;
		this.lang = $('html').attr('lang');
		this.fonts_loaded = false;
		this.inited = false;

		this.focused = true;

		this.loading_zone = document.getElementById('LZ');

		this.mobile_detect = new MobileDetect(window.navigator.userAgent);
		if( !this.mobile_detect.mobile() ){
			$(document.body).addClass('is-desktop');
		}

		this.is_mobile = false;
		this.is_desktop = false;

		if(!this.loading_zone) {
			this.loading_zone = $('<div></div>', { id: 'LZ' }).addClass('LZ').appendTo($(document.body))
		}else{
			this.loading_zone = $(this.loading_zone);
		}

		window.LZ = this.loading_zone;
	},
	create: function () {
		var self = this;

		window.app = this;
		this.element = $('body');

		this.ww = 0;
		this.wh = 0;
		this.oww = 0;
		this.owh = 0;
		this.page_height = 0;
		this.scrollTop = 0;
		this.previousScrollTop = 0;
		this.scrollDir = true;
		this.with_page_scroll = false;

		this.$window = $(window);
		this.screen = $('#screen');
		this.content = $('#content');

		this.update_window_size();

		this.cfix = new ContentFix();
		this.sas = new ScrollActionSimple();

		this.$window.focus(function(e){ self.focus(true); });
		this.$window.blur(function(e){ self.focus(false); });

		this.$window.resize(function (e) {
			self.resize(e);
		});

		this.smooth_scroll = false;
		if( this.smooth_scroll_bar ) {
			this.smooth_scroll = SmoothScrollBar.init(this.screen[0]);
			this.smooth_scroll.addListener(function(status){
				self.scroll(status.offset.y);
			});
		}else{
			this.$window.scroll(function (e) {
				self.scroll(e);
			});
		}

		$(document).ready(function (e) {
			self.resize(e);
			self.scroll(e);
		});

		this.resize();
		this.scroll();

		this.setup_loader();

		setTimeout(function(){
			self.setup();
		}, 10);
	},
	scrollTo: function(element,duration,cb,offset){
		if( typeof duration === 'undefined' ) duration = 750;

		var target = this.calc_element_top(element) + ( offset || 0 );

		duration *= Math.min( Math.max( 1, Math.abs( this.scrollTop - target ) / ( this.wh * 3 ) ), 2);

		if( this.smooth_scroll ){
			this.smooth_scroll.scrollTo(0,target,duration,{
				callback: typeof cb === 'function' ? cb : null
			});
		}else{
			$('html,body').animate({ scrollTop: target }, duration, 'swing', function(){
				typeof cb === 'function' && cb();
			});
		}
	},
	calc_element_top: function(element){
		if( element == parseInt(element) ) return element;
		var target = element.offset().top;
		if( this.smooth_scroll ){ target += this.smooth_scroll.offset.y; }
		return target;
	},
	setup_loader: function(){

	},
	setup: function () {
		var self = this;
		WebFont.load({
			custom: {
				families: ['Minion Pro']
			},
			active: function () {
				self.fonts_loaded = true;
				self.resize();
			}
		});
	},
	add_resize: function (instance) {
		for (var i = 0; i < this._resizable.length; i++) {
			if (this._resizable[i] === instance) {
				return;
			}
		}

		this._resizable.push(instance);
		if (this.ww && this.wh) {
			instance.resize(this.ww, this.wh);
		}
	},
	remove_resize: function (instance) {
		var newResizable = [], found = false;
		for (var i = 0; i < this._resizable.length; i++) {
			if (this._resizable[i] === instance) {
				found = true;
			} else {
				newResizable.push(instance);
			}
		}
		if (found) {
			this._resizable = newResizable;
		}
	},
	add_scroll: function (instance) {
		for (var i = 0; i < this._scrollable.length; i++) {
			if (this._scrollable[i] === instance) {
				return;
			}
		}

		this._scrollable.push(instance);
		instance.scroll(this.scrollTop);
	},
	remove_scroll: function (instance) {
		var newScrollable = [], found = false;
		for (var i = 0; i < this._scrollable.length; i++) {
			if (this._scrollable[i] === instance) {
				found = true;
			} else {
				newScrollable.push(instance);
			}
		}
		if (found) {
			this._scrollable = newScrollable;
		}
	},
	add_focus: function (instance) {
		for (var i = 0; i < this._focusable.length; i++) {
			if (this._focusable[i] === instance) {
				return;
			}
		}

		this._focusable.push(instance);
	},
	remove_focus: function (instance) {
		var newFocusable = [], found = false;
		for (var i = 0; i < this._focusable.length; i++) {
			if (this._focusable[i] === instance) {
				found = true;
			} else {
				newFocusable.push(instance);
			}
		}
		if (found) {
			this._focusable = newFocusable;
		}
	},
	update_window_size: function(){
		this.ww = this.oww = $(window).width();
		this.wh = this.owh = $(window).height();

		// if( this.is_desktop ){
		// 	if( ( this.ww < 1200 ) || ( this.wh < 600 ) ){
		// 		this.ww = Math.max(this.ww,1200);
		// 		this.wh = Math.max(this.wh,600);
		// 		$(document.body).addClass('with-page-scroll');
		// 		this.with_page_scroll = true;
		// 	}else if(this.with_page_scroll){
		// 		$(document.body).removeClass('with-page-scroll');
		// 		this.with_page_scroll = false;
		// 	}
		// }

		this.ww_tablet = this.ww > 480 && this.ww < 1024;
		this.ww_desktop = this.ww >= 1024;
		this.ww_mobile = !this.ww_desktop && !this.ww_tablet;

		this.screen.css({ height: this.wh });

		this.update_scaled_ww();
	},
	update_scaled_ww: function(){
		this.scaled_ww = this.ww - ( window.core_menu && window.core_menu.opened ? 346 : 0 );
	},
	resize: function () {
		this.update_window_size();

		// if (window.innerWidth < 570) {
		// 	window.location.href = '/mobile';
		// }

		for (var i = 0; i < this._resizable.length; i++) {
			this._resizable[i].resize(this.ww, this.wh);
		}

		this.update_page_height(true);
	},
	update_page_height: function(auto){
		this.page_height = this.content.outerHeight(true);
	},
	scroll: function(){
		this.scrollTop = this.smooth_scroll ? this.smooth_scroll.offset.y : this.$window.scrollTop();
		this.scrollDir = this.scrollTop > this.previousScrollTop;
		this.previousScrollTop = this.scrollTop;
		for (var i = 0; i < this._scrollable.length; i++) {
			this._scrollable[i].scroll(this.scrollTop, this.scrollDir);
		}
	},
	focus: function(dir){
		if( this.focused !== dir ) {
			this.focused = dir;
			for (var i = 0; i < this._focusable.length; i++) {
				this._focusable[i].focus(dir);
			}
		}
	},
	load_svg_sprite: function(sprite){
		var self = this,
			xhr = new XMLHttpRequest();
		xhr.open('GET',sprite,true);
		xhr.setRequestHeader('X-Requested-With','XMLHttpRequest');
		xhr.onreadystatechange = function(){
			if(xhr.readyState !== 4) return void 0;
			var d = document.createElement('DIV');
			d.innerHTML = xhr.responseText;
			self.loading_zone[0].appendChild(d);
		};
		xhr.send();
	},
	put_instance: function(instance){
		if( typeof this._instances[instance.__className] === 'undefined' ) {
			this._instances[instance.__className] = [];
		}

		for(var i=0,count=this._instances[instance.__className].length;i<count;i++) {
			if( this._instances[instance.__className][i] === instance ) {
				return false;
			}
		}

		var id = this._instances[instance.__className].length;
		this._instances[instance.__className].push(instance);

		return id;
	},
	get_instances: function(className) {
		if( typeof this.classes[className] === 'undefined' ) {
			return false;
		}
		return this._instances[className];
	},
	remove_instance: function(instance) {
		if( typeof this._instances[instance.__className] === 'undefined' ) {
			return false;
		}

		var new_instances = [], found = false;
		for(var i=0,count=this._instances[instance.__className].length;i<count;i++) {
			if( this._instances[instance.__className][i] !== instance ) {
				newInstances.push( this._instances[instance.__className][i] );
			}else{
				found = true;
			}
		}

		if( found ) {
			this._instances[instance.__className] = new_instances;
		}

		return found;
	},
	add_video_player: function(instance){
		for (var i = 0; i < this._video_players.length; i++) {
			if (this._video_players[i] === instance) {
				return;
			}
		}

		this._video_players.push(instance);
	},
	pause_other_video_players: function(instance){
		var self = this;
		this._video_players.forEach(function(player){
			if( player !== instance && player.is_playing && ( typeof player.pause === 'function' ) ) {
				player.pause();
			}
		});
	},
	remove_video_player: function(instance){
		var newVideoPlayer = [], found = false;
		for (var i = 0; i < this._video_players.length; i++) {
			if (this._video_players[i] === instance) {
				found = true;
			} else {
				newVideoPlayer.push(instance);
			}
		}
		if (found) {
			this._video_players = newVideoPlayer;
		}
	}
});