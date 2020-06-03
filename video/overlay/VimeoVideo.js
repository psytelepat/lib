'use strict';

var $ = require('jquery'),
	VimeoPlayer = require('@vimeo/player'),
	Overlay = require('../../Overlay');

module.exports = Overlay.extend({
	__className: 'VimeoVideoOverlay',
	pre: function(){
		this.video_width = 640;
		this.video_height = 360;
		this.current_width = 0;
		this.current_height = 0;
		this.video_id = false;
	},
	create_overlay_element: function(){
		this.element = $('<div></div>').addClass('overlay overlay-vimeo').appendTo($('body'));
		this.popup = $('<div></div>').addClass('overlay-popup').appendTo(this.element);
		$('<div></div>').addClass('close js-close').html('<svg><use xlink:href="#close"></use></svg>').appendTo(this.element);
		$('<div></div>').addClass('close js-close').html('<svg><use xlink:href="#close"></use></svg>').appendTo(this.popup);
		this.content = $('<div></div>').addClass('overlay-content').appendTo(this.popup);
		this.player_element = this.content;
	},
	create: function(){
		this._super();

		var self = this;

		this.ready = false;
		this.ready_interval = false;

		this.player_options = { id: this.video_id, byline: false, portrait: false, title: false, loop: false, color: '#bda586' };

		this.player = new VimeoPlayer(this.player_element[0], this.player_options);
		this.player.on('loaded', function() {
			self.player.getVideoWidth().then(function(width){ self.video_width = width; self.resize(); }).catch(function(error){});
			self.player.getVideoHeight().then(function(height){ self.video_height = height; self.resize(); }).catch(function(error){});
			self.ready = true;
			self.resize(window.app.ww,window.app.wh);
		});

		self.resize(window.app.ww,window.app.wh);
	},
	resize: function(ww,wh){
		if(!ww){ ww = window.app.ww; }
		if(!wh){ wh = window.app.wh; }

		var max_height, top, left;

		if( window.app.ww_desktop ){

			this.current_width = Math.round( ww * .8 );
			this.current_height = Math.round(this.current_width / this.video_width * this.video_height);

			max_height = Math.round( wh * .8 );
			if( this.current_height > max_height ) {
				this.current_height = max_height;
				this.current_width = Math.round(this.current_height / this.video_height * this.video_width);
			}

			top = Math.round( ( wh - this.current_height - 40 ) / 2 );
			left = Math.round( ( ww - this.current_width - 40 ) / 2 );
		}else{

			this.current_width = Math.round( ww );
			this.current_height = Math.round(this.current_width / this.video_width * this.video_height);

			max_height = Math.round( wh );
			if( this.current_height > max_height ) {
				this.current_height = max_height;
				this.current_width = Math.round(this.current_height / this.video_height * this.video_width);
			}

			top = Math.round( ( wh - this.current_height ) / 2 );
			left = Math.round( ( ww - this.current_width ) / 2 );
		}

		this.popup.css({
			position: 'absolute',
			top: top,
			left: left,
			width: this.current_width,
			height: this.current_height
		});

		if( this.player ) {
			$(this.player.element).css({
				width: this.current_width,
				height: this.current_height
			});
			this.content.css({
				width: this.current_width,
				height: this.current_height
			});
		}
	},
	open: function(cb){
		var self = this;

		if( !this.ready ){
			this.resize();
			this.ready_interval = setInterval(function(){
				if( self.ready ) {
					clearInterval(self.ready_interval);
					self.ready_interval = null;
					self.open(cb);
				}
			});
			return;
		}else{
			this.resize();
			if(window.app.ww_desktop){
				this.player.play();
			}
		}

		this._super(cb);
	},
	close: function(cb){
		this.delegate.close();
		this.player.pause();
		this._super(cb);
	}
});