var $ = require('jquery'),
	Dots = require('./Dots'),
	MinimalClass = require('../MinimalClass');

module.exports = MinimalClass.extend({
	create: function(){
		var self = this;

		window.main_controls = this;
		this.dots = false;

		this.position_element = this.element.find('.js-pos');
		if(!this.position_element.length){ this.position_element = false; }

		this.arrl = this.element.find('.js-prev').click(function(e){ self.request_switch_to_prev(1); });
		this.arrr = this.element.find('.js-next').click(function(e){ self.request_switch_to_next(1); });

		this.map_modules({
			'.js-dots': {
				module: Dots,
				callback: function(i){ self.dots = i; }
			}
		});

		this.element.bind('dot_timer_complete',function(e, dot){
			self.request_switch_to_pos( self.dots.next_pos() );
		});

		this.element.bind('mouse_click.dot',function(event,dot,e,from_user){
			self.dots.stop_timer();
			self.request_switch_to_pos( dot.id, from_user );
		});
	},
	set_pos: function(pos){
		this.dots && this.dots.switch_to(pos);
		this.set_position(pos);
	},
	set_position: function(pos){
		if(!this.position_element) return;
		var text = pos + 1;
		if( text < 10 ) text = '0' + text;
		this.position_element.html( text );
	},
	start_timer: function(enable_timers){
		if(!this.dots) return false;
		return this.dots.start_timer(enable_timers);
	},
	stop_timer: function(){
		if(!this.dots) return false;
		return this.dots.stop_timer();
	},
	request_switch_to_pos: function( pos, from_user ){
		var self = this;
		if(this.delegate && this.delegate.switch_item(pos,null,function(){ if(!from_user) self.start_timer() })){
			this.stop_timer();
			this.set_pos(pos);
		}
	},
	request_switch_to_prev: function(from_user){
		var self = this,
			pos = this.delegate ? this.delegate.prev_pos() : ( this.dots ? this.dots.prev_pos() : 0 );
		if(this.delegate && this.delegate.prev(function(){ if(!from_user) self.start_timer() })){
			this.stop_timer();
			this.set_pos(pos);
		}
	},
	request_switch_to_next: function(from_user){
		var self = this,
			pos = this.delegate ? this.delegate.next_pos() : ( this.dots ? this.dots.next_pos() : 0 );
		if(this.delegate && this.delegate.next(function(){ if(!from_user) self.start_timer() })){
			this.stop_timer();
			this.set_pos(pos);
		}
	}
});