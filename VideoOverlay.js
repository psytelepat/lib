'use strict';

var $ = require('jquery'),
	VimeoPlayer = require('../lib/video/VimeoPlayer'),
	Overlay = require('./Overlay');

module.exports = Overlay.extend({
	__className: 'VideoOverlay',
	create: function(){

		this.video_type = this.element.data('video-type');
		this.video_id = this.element.data('video-id');
		this.video_width = parseInt(this.element.data('video-width'));
		this.video_height = parseInt(this.element.data('video-height'));
		this.video_aspect = this.video_width / this.video_height;

		this.video_player_container = this.element.find('.js-video-player');

		this._super();
	},
	resize: function(ww,wh){
		var player_width = 900,
			player_height = Math.round( player_width / this.video_aspect );
		this.video_player_container.css({ width: player_width, height: player_height });
		this._super();
	},
    on_open: function() {
        this._super();

        window.bgvideos && window.bgvideos.set_forced_pause(true);
        
        var self = this;
        if (this.player) {
            this.player.play();
        } else {
            this.player = new VimeoPlayer({
                element: self.video_player_container,
                video_id: self.video_id,
                onReady: function(player){
                	player.play();
                }
            });
        }
    },
    on_close: function() {
        this._super();

        this.player.pause();

        window.bgvideos && window.bgvideos.set_forced_pause(false);
    }
});