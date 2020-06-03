'use strict';

var lib = require('../index.js'),
	$ = require('jquery'),
	Dots = require('./Dots'),
	MinimalClass = require('../MinimalClass');

module.exports = MinimalClass.extend({
	__className: 'SliderItem',
	pre: function(opt)
	{
		this.img = false;
		this.image_width = 0;
		this.image_height = 0;
		this.w = 0;
		this.h = 0;
		this.is_loaded = false;
		this.is_loading = false;
		this.is_error = false;
		this.repos_mode = false;
		this.setup_mode = 'background';
	},
	create: function()
	{
		var self = this;
		this.dotpos = parseInt(this.element.data('dotpos'));
		this.repos_mode = this.element.data('repos-mode') || false;

		var setup_mode = this.element.data('setup-mode') || false;
		if(setup_mode){ this.setup_mode = setup_mode; }

		this.src = this.element.data('src') || false;
		this.image = this.element.find('.image');
		this.img_background = this.element.find('img.background');
		this.content = this.element.find('.slide-content');
		this.active = this.element.hasClass('active');
	},
	load: function(cb)
	{
		if( this.src ) {
			var self = this;
			this.loading(true);
			this.img = $('<img/>');
			this.img.appendTo(window.LZ).bind('load error', function(e){ self.loaded(cb,e.type); }).attr('src',this.src);
		}else{
			this.loaded(cb);
		}
	},
	loading: function(dir)
	{
		if( this.is_loading == dir ) return;

		if(dir){
			this.element.addClass('loading');
		}else{
			this.element.removeClass('loading');
		}

		this.is_loading = dir;
	},
	loaded: function(cb,type)
	{
		this.loading(false);
		this.is_loaded = true;

		switch(type) {
			case 'load':
				this.image_width = this.img ? this.img[0].width || 0 : 0;
				this.image_height = this.img ? this.img[0].height || 0 : 0;
				this.setup();
				break;
			case 'error':
				this.is_error = true;
				break;
			default:
				this.setup();
				break;
		}

		if( this.onLoad === 'function' ){
			this.onLoad(this);
		}

		if( this.delegate ) {
			this.delegate.element.trigger('item_loaded.slider',[this]);
		}
	},
	setup: function()
	{
		switch(this.repos_mode){
			case 'cover-right':
			case 'cover-left':
				this.element.addClass(this.repos_mode);
				break;
		}

		switch(this.setup_mode){
			case 'background.image':
				if( !this.src ) return;
				this.image = $('<DIV>').addClass('image').css({ backgroundImage: 'url(' + this.src + ')'}).appendTo(this.element);
				break;
			case 'img.background':
				if( !this.src ) return;
				this.img_background = $('<IMG>').addClass('background').attr('src', this.src).appendTo(this.element);
				break;
			case 'background':
			default:
				if( !this.src ) return;
				this.element.css({ backgroundImage: 'url(' + this.src + ')' });
				break;
		}

		this.resize();
	},
	resize: function(sw,sh){

		if(!sw){ sw = this.delegate && ( typeof this.delegate.stage_rect !== 'undefined' ) ? this.delegate.stage_rect.width : this.element.outerWidth(true); }
		if(!sh){ sh = this.delegate && ( typeof this.delegate.stage_rect !== 'undefined' ) ? this.delegate.stage_rect.height : this.element.outerHeight(true); }

		switch( this.setup_mode ){
			case 'img.background':
				if(!this.img_background.length) return;

				var image_width = sw,
					image_height = Math.round(image_width / this.image_width * this.image_height);

				if( image_height < sh ){
					image_height = sh;
					image_width = Math.round(image_height / this.image_height * this.image_width);
				}

				var image_top = Math.round( ( sh - image_height ) / 2 ),
					image_left = Math.round( ( sw - image_width ) / 2 );

				switch( this.repos_mode ){
					case 'cover-right':
						image_left = 0;
						break;
					case 'cover-left':
						image_left = sw - image_width;
						break;
					case 'layout':
						sw -= 90;
						var vertical_top_padding = 130,
							vertical_bottom_padding = 60,
							bottom_offset = 130,
							max_width = sw - 100,
							max_height = sh - ( bottom_offset + vertical_top_padding + vertical_bottom_padding );

						image_width = max_width;
						image_height = Math.round(image_width / this.image_width * this.image_height);

						if( image_height > max_height ){
							image_height = max_height;
							image_width = Math.round(image_height / this.image_height * this.image_width);
						}

						image_top = vertical_top_padding + Math.round( ( ( sh - ( bottom_offset + vertical_top_padding + vertical_bottom_padding )  ) - image_height ) / 2 );
						image_left = Math.round( ( sw - image_width ) / 2 );
						break;
					case 'layout-mobile':
						var vertical_padding = 80,
							bottom_offset = 80,
							max_width = sw - 60,
							max_height = sh - bottom_offset - ( vertical_padding * 2 );

						image_height = max_height;
						image_width = Math.round(image_height / this.image_height * this.image_width);

						if( image_width > max_width ){
							image_width = max_width;
							image_height = Math.round(image_width / this.image_width * this.image_height);
						}

						image_top = ( vertical_padding / 2 ) + Math.round( ( ( sh - bottom_offset ) - image_height ) / 2 );
						image_left = Math.round( ( sw - image_width ) / 2 );
						break;
				}

				this.img_background.css({
					width: image_width,
					height: image_height,
					top: image_top,
					left: image_left
				});

				break;
		}
	},
	get_content_size: function(){
		if( !this.content ) return false;
		this.content.css({ height: '' });
		var rect = this.content[0].getBoundingClientRect();
		return rect;
	},
	activate: function(dir,from_user)
	{
		if( this.active === dir ) return;

		if( dir ){
			this.element.addClass('active');
		}else{
			this.element.removeClass('active');
		}

		this.active = dir;
	},
	remove: function()
	{
		this.element.remove();
	}
});