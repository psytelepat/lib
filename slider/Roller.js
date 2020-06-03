'use strict';

var $ = require('jquery'),
	Slider = require('./Slider');

module.exports = Slider.extend({
	__className: 'Roller',
	switch_item: function(pos,dir,cb,quick,force,not_user_initiated)
	{
		if(this.is_loading || ( !force && ( ( this.pos === pos ) || this.is_switching) ) ) return false;
		if(typeof dir === 'undefined'){ dir = pos > this.pos; }
		if(typeof quick === 'undefined'){ quick = false; }
		this.is_switching = true;

		var self = this,
			prev_pos = this.pos,
			cur = this.item[prev_pos],
			nxt = this.item[pos],
			onComplete = function() {

				nxt.activate(true);

				self.pos = pos;
				self.update_pos_viewer(pos);

				self.is_switching = false;

				self.start_autoplay();

				if( typeof self.onSwitch === 'function' ) {
					self.onSwitch(self, not_user_initiated);
				}

				self.trigger(self.element,'items_switched',[self,pos,nxt,prev_pos,cur]);
			};

		if( this.load_on_demand && !nxt.is_loaded ) {
			nxt.load(function(){
				self.switch_item(pos, dir, cb, quick, true);
			});
			return true;
		}

		self.trigger(self.element,'items_switching',[this,pos,nxt,prev_pos,cur]);

		if( ( typeof this.dots !== 'undefined' ) && ( typeof this.dots.activate === 'function' ) ) {
			this.dots.activate(pos);
		}

		cur.activate(false);
		this.stage.animate({ left: -nxt.element.position().left }, 750, 'swing', function(){
			onComplete();
		});

		return true;
	}
});