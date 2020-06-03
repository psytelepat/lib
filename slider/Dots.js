'use strict';

var $ = require('jquery'),
	SliderDot = require('./Dot'),
	MinimalClass = require('../MinimalClass');

module.exports = MinimalClass.extend({
	__className: 'SliderDots',
	pre: function(opt)
	{
		this.timers_enabled = false;
	},
	create: function()
	{
		var self = this;
		this.item = [];

		this.cur = false;
		this.pos = -1;

		this.create_dots();
	},
	create_dots: function(id,elm)
	{
		var self = this,
			onClick = function(e,dot,evt,from_user){
				self.switch_to(dot.id,null,true);
			};

		this.element.find('.dot').each(function(id,elm){
			var dot = self.create_dot({
				id: id,
				element: elm,
				delegate: self,
				timers_enabled: true,
				onClick: null
			});

			if( dot.active ) {
				self.cur = dot;
				self.pos = dot.id;
			}

			self.item.push( dot );
		});
	},
	create_dot: function(data)
	{
		return new SliderDot(data);
	},
	prev_pos: function(){
		var pos = this.pos - 1;
		if( pos < 0 ) { pos = this.item.length - 1; }
		return pos;
	},
	prev: function()
	{
		this.switch_to( this.prev_pos() );
	},
	next_pos: function(){
		var pos = this.pos + 1;
		if( pos >= this.item.length) { pos = 0; }
		return pos;
	},
	next: function()
	{
		this.switch_to( this.next_pos() );
	},
	switch_to_by_pos: function(pos){
		this.switch_to(pos);
	},
	switch_to: function(pos)
	{
		var cur = this.cur,
			nxt = ( typeof this.item[pos] !== 'undefined' ) ? this.item[pos] : false;

		if( cur && nxt && ( cur.id === nxt.id ) )
		{
			return;
		}

		if(cur)
		{
			cur.activate(false);
			this.pos = -1;
			this.cur = false;
		}

		if(nxt)
		{
			nxt.activate(true,{ start_timer: this.timers_enabled });
			this.pos = nxt.id;
			this.cur = nxt;
		}
	},
	start_timer: function(enable_timers,onError){
		if( enable_timers ) { this.timers_enabled = true; }
		return ( this.cur && this.cur.start_timer() );
	},
	stop_timer: function(onError){
		this.timers_enabled = false;
		return ( this.cur && this.cur.stop_timer() );
	}
});