'use strict';

var $ = require('jquery'),
	VimeoPlayer = require('./VimeoPlayer'),
	YoutubePlayer = require('./YoutubePlayer'),
	MinimalClass = require('../MinimalClass');

module.exports = MinimalClass.extend({
	__className: 'VideoPlayer',
	pre: function(opt){
		this.width = 0;
		this.height = 0;
		this.player_width = 0;
		this.player_height = 0;
	},
	create: function(){
		window.app.add_video_player(this);
		this.vp = this.element;
		this.setup();
	},
	setup: function(){
		var self = this;

		this.ready = false;
		this.is_playing = false;

		this.player = false;

		this.vp = this.element;

		this.video_id = this.video_id || this.vp.data('video-id');
		this.video_type = this.video_type || this.vp.data('video-type');
		this.video_width = parseInt(this.vp.data('video-width') || 0);
		this.video_height = parseInt(this.vp.data('video-height') || 0);
		this.sizing = this.sizing || this.vp.data('sizing');

		window.app.add_resize(this);
		window.app.add_scroll(this);
	},
	create_player: function(cb){
		if(this.player){ return this.player; }

		var self = this,
			opt = {
				element: this.element,
				video_id: this.video_id,
				onReady: function(player) {
					self.ready = true;
					if( !(self.video_width && self.video_width) ){
						player.get_size(function(width,height){
							self.video_width = width;
							self.video_height = height;
							self.resize();
						});
					}
				},
				onPlay: function(){
					self.play();
				}
			};

		if(this.video_width && this.video_height){
			opt.video_width = this.video_width;
			opt.video_height = this.video_height;
		}

		switch( this.video_type ){
			case 'youtube':
				opt.onStop = function(player){
					self.pause();
					player.seek(0);
				};
				this.player = new YoutubePlayer(opt);
				break;
			case 'vimeo':
				opt.onStop = function(player){
					self.pause();
					player.seek(0);
				};
				opt.onPause = function(player){
					self.pause();
				};
				this.player = new VimeoPlayer(opt);
				break;
		}

		this.player.pause();

		this.resize();

		if( typeof cb === 'function' ){
			cb(this);
		}

		return this.player;
	},
	play: function(){
		if( this.is_playing ){
			return;
		}

		if(!this.player){
			this.create_player();
		}

		if( window.app.mobile ){
			this.resize();
			this.overlay.addClass('open');
		}

		window.app.pause_other_video_players(this);
		this.player.play();

		this.is_playing = true;

		if( typeof this.onPlay === 'function' ){
			this.onPlay(this);
		}
	},
	pause: function(){
		if(!this.is_playing){ return; }
		if(!this.player){ return; }

		this.player.pause();

		var self = this;
		setTimeout(function(){ self.element.bind('click', self.click_to_play); },0);

		if( typeof this.onPause === 'function' ){
			self.onPause(this);
		}
	},
	stop: function(){
		this.pause();
	},
	resize: function(){
		if(this.sizing){
			switch(this.sizing){
				case '3x2-width':
					this.width = this.element.outerWidth(true);
					this.height = this.width / 3 * 2;
					this.element.css({ height: this.height });
					break;
				case 'square':
					this.width = this.element.outerWidth(true);
					this.height = this.width;
					this.element.css({ height: this.height });
					break;
			}
		}else if( !window.app.mobile && this.video_width && this.video_height ){
			this.width = this.element.outerWidth(true);
			this.height = Math.round(this.width / this.video_width * this.video_height);
			this.element.css({ height: this.height });
		}

		if( window.app.mobile && this.player && this.video_width && this.video_height ){
			this.player_width = this.overlay.outerWidth(true);
			this.player_height = Math.round(this.player_width / this.video_width * this.video_height);
			this.player.size(this.player_width, this.player_height);
		}
	},
	scroll: function(){
		if( this.is_playing ){
			var prc = this.calc_element_scroll_prc(this.element[0]);
			if( prc <= 0 || prc >= 1 ){
				this.pause();
			}
		}
	},
	remove: function(){
		this.element.remove();
		window.app.remove_video_player(this);
	}
});