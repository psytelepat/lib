'use strict';

var $ = require('jquery'),
	YoutubePlayer = require('youtube-player'),
	Overlay = require('../../Overlay');

module.exports = Overlay.extend({
	__className: 'YoutubeVideoOverlay',
	pre: function(){
		this.video_width = 640;
		this.video_height = 360;
		this.current_width = 0;
		this.current_height = 0;
		this.video_id = false;
	},
	create_overlay_element: function(){
		this.element = $('<div></div>').addClass('overlay overlay-youtube').appendTo($(document.body));
		this.popup = $('<div></div>').addClass('overlay-popup').appendTo(this.element);
		this.content = $('<div></div>').addClass('overlay-content').appendTo(this.popup);
		this.player_element = $('<div></div>').appendTo(this.content);
	},
	create: function(){
		this._super();

		var self = this;

		this.ready = false;
		this.ready_interval = false;

		this.player = new YoutubePlayer(this.player_element[0]);
		this.player.on('ready', function(e){
			self.ready = true;
			self.resize(window.app.ww,window.app.wh);
		});
		this.player.loadVideoById(this.video_id);

		self.resize(window.app.ww,window.app.wh);
	},
	resize: function(ww,wh){

		this.current_width = Math.round(ww * .8);
		this.current_height = Math.round(this.current_width / this.video_width * this.video_height);

		var max_height = Math.round( wh * .8 );
		if( this.current_height > max_height ) {
			this.current_height = max_height;
			this.current_width = Math.round(this.current_height / this.video_height * this.video_width);
		}

		if( this.player ) {
			this.player.setSize(this.current_width,this.current_height);
		}

		this._super(ww,wh);
	},
	open: function(cb){
		var self = this;

		if( !this.ready ){
			this.ready_interval = setInterval(function(){
				if( self.ready ) {
					clearInterval(self.ready_interval);
					self.ready_interval = null;
					self.open(cb);
				}
			});
			return;
		}else{
			this.player.playVideo();
		}

		this._super(cb);
	},
	close: function(cb){
		this.delegate.close();
		this.player.pauseVideo();
		this._super(cb);
	}
});