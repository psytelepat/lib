'use strict';

var $ = require('jquery'),
	YoutubePlayer = require('youtube-player'),
	MinimalClass = require('../MinimalClass');

module.exports = MinimalClass.extend({
	__className: 'YoutubePlayer',
	pre: function(){
		this.video_id = false;
		this.video_width = 0;
		this.video_height = 0;
		this.width = 0;
		this.height = 0;
	},
	create: function(){

		var self = this;

		this.ready = false;
		this.is_playing = false;

		if( !this.video_id ){
			this.log(this.__className + ' :: no video_id');
			return false;
		}

		this.player = new YoutubePlayer(this.element[0],{ videoId: this.video_id, playsinline: true });

		this.player.on('ready',function(e){
			self.ready = true;
			if( typeof self.onReady === 'function' ){
				self.onReady(self);
			}
		});

		this.player.on('stateChange',function(e){
			switch(e.data){
				case -1: // not started
					if( typeof self.onInit === 'function' ){
						self.onInit(self);
					}
					break;
				case 0: // stopped
					self.is_playing = false;
					if( typeof self.onStop === 'function' ){
						self.onStop(self);
					}
					break;
				case 1: // playing
					self.is_playing = true;
					if( typeof self.onPlaying === 'function' ){
						self.onPlay(self);
					}
					break;
				case 2: // paused
					self.is_playing = false;
					if( typeof self.onPause === 'function' ){
						self.onPause(self);
					}
					break;
				case 3: // buffering
					if( typeof self.onBuffer === 'function' ){
						self.onBuffer(self);
					}
					break;
				case 5: // queued
					if( typeof self.onQueue === 'function' ){
						self.onQueue(self);
					}
					break;
			}
		});
	},
	play: function(){
		this.player.playVideo();
	},
	pause: function(){
		this.player.pauseVideo();
	},
	stop: function(){
		this.player.unload();
	},
	seek: function(position){
		this.player.seekTo(position);
	},
	get_size: function(cb){
		( typeof cb === 'function' ) && cb(640, 360);
	},
	size: function(width,height){
		this.width = width;
		this.height = height;
		this.player.setSize(this.width,this.height);
		this.element.css({ width: this.width, height: this.height });
	}
});