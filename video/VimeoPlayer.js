'use strict';

var $ = require('jquery'),
	VimeoPlayer = require('@vimeo/player'),
	MinimalClass = require('../MinimalClass');

module.exports = MinimalClass.extend({
	__className: 'VimeoPlayer',
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
        this.playPromise = null;
        this.isVisible = false;

		if( !this.video_id ){
			this.log(this.__className + ' :: no video_id');
			return false;
		}

        this.player_options = { id: this.video_id, byline: false, portrait: false, title: false, loop: false, autoplay: false };

		this.player = new VimeoPlayer.default(this.element[0], this.player_options);

		this.player.on('loaded', function() {
			self.player.getVideoWidth().then(function(width){ self.video_width = width; self.resize(); }).catch(function(error){});
			self.player.getVideoHeight().then(function(height){ self.video_height = height; self.resize(); }).catch(function(error){});
			self.seek(0);
            self.ready = true;
			if( typeof self.onReady === 'function' ) { self.onReady(self); }
		});

		this.player.on('play', function() {
            self.is_playing = true;
            self.playPromise = null;

			if( typeof self.onPlay === 'function' ) { self.onPlay(self); }
		});

		this.player.on('pause', function() {
            self.is_playing = false;
			if( typeof self.onPause === 'function' ) { self.onPause(self); }
		});

		this.player.on('ended', function() {
			self.is_playing = false;
			if( typeof self.onStop === 'function' ) { self.onStop(self); }
		});
	},
	play: function(){
        this.playPromise = this.player.play();
	},
	pause: function(){
        var self = this;

        if (this.playPromise) {
            this.playPromise.then(() => {
                self.player.pause();
            });
        } else {
            self.player.pause();
        }
	},
	stop: function(){
		this.player.pause();
	},
	seek: function(position){
		this.player.setCurrentTime(position);
	},
	get_size: function(cb){
		( typeof cb === 'function' ) && cb(this.video_width, this.video_height);
	},
	size: function(width,height){
		this.width = width;
		this.height = height;
		this.element.css({ width: this.width, height: this.height });
	}
});
