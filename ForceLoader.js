'use strict';

// прелоадер изображений и видео

var $ = require('jquery'),
	MinimalClass = require('./MinimalClass');

module.exports = MinimalClass.extend({
	__className: 'ForceLoader',
	pre: function(){
		this.stuck_timer_time = 5;
	},
	create: function(){
		var self = this;

		this.images = [];
		this.videos = [];
		this.loaded = false;

		if( !this.source || !this.source.length ) {
			this.source = $(document.body);
		}

		this.loaded_items = 0;
		this.total_items = 0;
		this.progress = 0;

		this.stuck_timer = false;

		this.LZ = $('#LZ');
		if( !this.LZ.length ) {
			this.LZ = $('<div></div>', { id: 'LZ' }).addClass('LZ').appendTo(document.body);
		}

		this.gather_items();
	},
	add_item: function(){
		this.total_items++;
	},
	load: function(){
		this.preload_items();
	},
	gather_items: function(){
		this.gather_images();
		this.gather_videos();
	},
	gather_images: function(){
		var self = this;
		var everything = this.source.find("*:not(script,video,source)").each(function(i,elm){
			var url = "";
			
			if ($(this).css("background-image") != "none") {
				url = $(this).css("background-image");
			} else if (typeof($(this).attr("src")) != "undefined") {
				url = $(this).attr("src");
			}
			
			url = url.replace("url(\"", "");
			url = url.replace("url(", "");
			url = url.replace("\")", "");
			url = url.replace(")", "");
			
			if ( url.length > 0 && /(gif|jpeg|jpg|png)$/.test(url) ) {
				self.images.push(url);
			}
		});
	},
	gather_videos: function(){
		var self = this;
		this.source.find('video').each(function(i,elm){
			var poster = elm.getAttribute('poster') || false;
			if( poster && poster.length > 0 && /(gif|jpeg|jpg|png)$/.test(poster) ) {
				self.images.push(poster);
			}
			
			if( typeof(elm.getAttribute('preload')) != 'undefined' ) {
				self.videos.push( elm );
			}
		});
	},
	preload_items: function(){
		var self = this;
		this.total_items = this.images.length + this.videos.length;

		if(!this.total_items) {
			this.update_progress();
			return;
		}

		this.preload_videos();
		this.preload_images();
	},
	refresh_stuck_timer: function(){
		if( this.stuck_timer ) {
			clearTimeout(this.stuck_timer);
			this.stuck_timer = null;
		}

		if( this.loaded_items >= this.total_items ) {
			return;
		}

		var self = this;
		this.stuck_timer = setTimeout(function(){
			self.loaded_items++;
			self.update_progress();
		}, this.stuck_timer_time * 1000);
	},
	preload_images: function(){
		var self = this,
			count = this.images.length;

		for (var i=0;i<count;i++)
		{
			var img = $("<img></img>");
			$(img).attr("src", this.images[i]);
			$(img).unbind("load");
			$(img).bind("load error",function(){ self.image_loaded(); });
			$(img).appendTo( this.LZ );
		}
	},
	preload_videos: function(){
		var self = this;
		$(this.videos).each(function(i,elm){
			$(elm).bind('loadedmetadata',function(){ self.video_loaded(); });
		});
	},
	image_loaded: function(){
		this.loaded_items++;
		this.update_progress();
	},
	video_loaded: function(){
		this.loaded_items++;
		this.update_progress();
	},
	update_progress: function(){
		this.refresh_stuck_timer();
		if( this.loaded ) { return; }
		this.progress = this.total_items ? Math.round(( this.loaded_items / this.total_items ) * 100) : 100;
		if( this.progress >= 100 ) {
			this.loaded = true;
			this.loading_complete();
		}else{
			$(window).trigger('onLoaderProgress',[ this, this.progress ]);
		}
	},
	loading_complete: function(){
		clearTimeout(this.timeout);
		this.timeout = false;

		if( typeof this.onLoad === 'function' ) this.onLoad(this);
		this.after_loading_complete();
	},
	after_loading_complete: function(){
		this.loader_fully_complete();
	},
	loader_fully_complete: function(){
		if( typeof this.onFullyLoad === 'function' ) this.onFullyLoad(this);
		$(window).trigger('onLoaderLoaded',[ this ]);
	},
	remove: function(){
		this.element.remove();
	}
});