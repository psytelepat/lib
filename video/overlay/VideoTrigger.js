'use strict';

var $ = require('jquery'),
	VimeoOverlay = require('./VimeoVideo'),
	YoutubeOverlay = require('./YoutubeVideo'),
	MinimalClass = require('../../MinimalClass');

module.exports = MinimalClass.extend({
	__className: 'VideoTriggerOverlay',
	pre: function(opt){

	},
	create: function(){
		var self = this;

		this.opened = false;
		this.overlay = false;

		this.video_id = this.element.data('video-id');
		this.video_type = this.element.data('video-type');
		this.video_width = parseInt(this.element.data('video-width'));
		this.video_height = parseInt(this.element.data('video-height'));

		this.element.click(function(e){
			self.open();
		});
	},
	open: function(cb){
		if(this.opened) { return false; }

		this.opened = true;

		if(!this.overlay){
			switch(this.video_type){
				case 'vimeo':
					this.overlay = new VimeoOverlay({ video_id: this.video_id, width: this.video_width, height: this.video_height, delegate: this });
					break;
				case 'youtube':
				default:
					this.overlay = new YoutubeOverlay({ video_id: this.video_id, width: this.video_width, height: this.video_height, delegate: this });
					break;
			}
		}

		this.overlay.open(cb);
	},
	close: function(cb){
		if( !this.opened ) { return false; }
		this.opened = false;
	}
});