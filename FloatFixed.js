'use strict';

// класс фиксации элемента при скролле внутри контейнера

var $ = require('jquery'),
	MinimalClass = require('./MinimalClass');

module.exports = MinimalClass.extend({
	__className: 'FloatFixed',
	pre: function(opt){
		this.offset = 0;
		this.fixed_class = 'fixed';
	},
	create: function(){
		var self = this;

		this.tid = this.element.data('tid');

		this.top = 0;
		this.fixed = false;

		this.stop_at = 0;
		this.stopped = false;

		if(!this.offset) {
			this.offset = parseInt( this.element.data('offset') || 0 );
		}

		window.app.add_resize(this);
		window.app.add_scroll(this);
	},
	resize: function(){
		if( this.fixed ) {
			this.set_fixed(false);
		}

		var rect = this.element[0].getBoundingClientRect();
		this.start_at = window.app.scrollTop + rect.top;

		var parent_rect = this.element[0].parentNode.getBoundingClientRect();
		this.stop_at = window.app.scrollTop + parent_rect.top + parent_rect.height - this.offset - rect.height;

		if( this.fixed ) {
			this.set_fixed(true);
		}

		this.scroll(window.app.scrollTop);
	},
	set_offset: function(offset){
		this.offset = offset;
		this.resize();
	},
	scroll: function(scrollTop){
		if( window.contentFixed ) return;

		var should_be_fixed = scrollTop >= ( this.start_at - this.offset ),
			should_be_stopped = should_be_fixed ? ( scrollTop > this.stop_at - this.offset ) : false;

		if( this.fixed !== should_be_fixed ) {
			this.set_fixed(should_be_fixed);
			this.fixed = should_be_fixed;
		}

		var stop_change = ( this.stopped !== should_be_stopped );
		if( stop_change ) { this.stopped = should_be_stopped; }

		if( should_be_stopped ) {
			this.set_stopped(scrollTop,stop_change);
		}
	},
	set_stopped: function(scrollTop,stop_change) {
		if (this.stopped) {
			scrollTop = scrollTop || window.app.scrollTop;
			this.element.css({top: this.stop_at - scrollTop});
		} else if (stop_change){
			if (this.fixed) {
				this.element.css({ top: this.offset });
			} else {
				this.element.css({ top: '' });
			}
		}
	},
	set_fixed: function(fixed) {
		if( fixed ) {
			this.element.addClass(this.fixed_class).css({ top: this.offset });
		}else{
			this.element.removeClass(this.fixed_class).css({ top: '' });
		}
	}
});