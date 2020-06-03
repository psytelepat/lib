'use strict';

// класс плавающего меню

var $ = require('jquery'),
	MinimalClass = require('./MinimalClass');

module.exports = MinimalClass.extend({
	__className: 'FloatMenu',
	pre: function(opt){

	},
	create: function(){
		var self = this;

		this.tid = this.element.data('tid');

		this.top = 0;
		this.min_top = 0;
		this.max_top = 0
		this.offset = 100;

		this.start_at = 0;
		this.stop_at = 0;

		this.heightDiff = 0;
		this.scrollDir = null;
		this.diffStartedAt = 0;
		this.prevScrollTop = 0;
		this.prevHeightDiff = 0;
		this.currentHeightDiff = 0;

		window.app.add_resize(this);
		window.app.add_scroll(this);
	},
	resize: function(ww,wh){
		this.element.css({ transform: 'translateY(0)' });

		var rect = this.element[0].getBoundingClientRect(),
			parent_rect = this.element[0].parentNode.getBoundingClientRect();

		this.heightDiff = rect.height - ( wh - this.offset ) + 30;
		this.max_top = parent_rect.height - rect.height;
		this.start_at = window.app.scrollTop + rect.top - this.offset;
		this.stop_at = window.app.scrollTop + parent_rect.top + this.max_top;
	},
	scroll: function(scrollTop){
		if( window.contentFixed ) return;

		var working_area = ( scrollTop >= this.start_at ) && ( scrollTop <= this.stop_at ),
			scrollDir = scrollTop > this.prevScrollTop;

		if( scrollTop >= this.start_at )
		{
			if( scrollDir !== this.scrollDir )
			{
				this.diffStartedAt = this.prevScrollTop;
				this.scrollDir = scrollDir;
			}

			this.top = scrollTop - this.start_at;

			if(this.heightDiff > 0)
			{
				this.currentHeightDiff += this.prevScrollTop - scrollTop;
				this.currentHeightDiff = Math.min(0,Math.max(this.currentHeightDiff,-this.heightDiff));
			}

		}else if( scrollTop >= this.stop_at ){
			this.top = this.max_top;
			this.scrollDir = null;
		}else{
			this.top = this.min_top;
			this.scrollDir = null;
		}

		this.prevScrollTop = scrollTop;
		this.setTop(this.top + this.currentHeightDiff);
	},
	setTop: function(top){
		top = Math.max(Math.min(top,this.max_top),this.min_top);
		this.element.css({ transform: 'translateY('+top+'px)' });
	}
});