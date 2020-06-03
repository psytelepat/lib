'use strict';

var $ = require('jquery'),
	CircleTimer = require('../CircleTimer'),
	ActiveElement = require('../util/ActiveElement');

module.exports = ActiveElement.extend({
	__className: 'SliderDot',
	pre: function(){
		this._super();
		this.event_namespace = 'dot';
	},
	create: function(){
		this._super();

		this.timer = false;
		this.dotpos = parseInt(this.element.data('pos')) || false;
		this.onTimerComplete = function(){ self.element.trigger('dot_timer_complete', [ self ]); };

		var self = this;
		if( this.element.find('.js-circle-timer').length ){
			this.timer = new CircleTimer({
				element: this.element,
				delegate: this,
				time : 10,
				autorestart: false,
				onComplete: this.onTimerComplete
			});
		}
	},
	start_timer: function(){
		if(!this.timer) return false;
		return this.timer.start();
	},
	stop_timer: function(){
		if(!this.timer) return false;
		return this.timer.stop();
	}
});