'use strict';

// абстрактный класс активного элемента страницы

var $ = require('jquery'),
	MinimalClass = require('../MinimalClass');

module.exports = MinimalClass.extend({
	__className: 'ActiveElement',
	pre: function(opt)
	{
		this.mo = false;
		this.timer = false;
		this.timers_enabled = false;
		this.event_namespace = 'item';
	},
	create: function()
	{
		var self = this;
		this.active = this.element.hasClass('active');
		this.element.bind('click mouseenter mouseleave', function(e){ self.mouse(e,true); });
	},
	mouse: function(e,from_user)
	{
		e.preventDefault();
		e.stopPropagation();

		switch(e.type){
			case 'mouseenter':
				this.mo = true;
				this.mouseenter(e,from_user);
				if( this.onMouseEnter === 'function' ) {
					this.onMouseEnter(this,e,from_user);
				}
				break;
			case 'mouseleave':
				this.mo = false;
				this.mouseleave(e,from_user);
				if( this.onMouseLeave === 'function' ) {
					this.onMouseLeave(this,e,from_user);
				}
				break;
			case 'click':
				this.click(e,from_user);
				if( this.onClick === 'function' ) {
					this.onClick(this,e,from_user);
				}
				break;
		}

		if( e.type === 'click' && this.delegate ) {
			var event = 'mouse_' + e.type + ( this.event_namespace ? '.' + this.event_namespace : '' );
			this.delegate.element.trigger(event,[this,e,from_user]);
		}
	},
	mouseenter: function(e,from_user)
	{

	},
	mouseleave: function(e,from_user)
	{

	},
	click: function(e,from_user)
	{

	},
	activate: function(dir,opt,from_user)
	{
		if(this.active == dir) { return; }

		if( dir ) {
			this.set_active(opt,from_user);
		}else{
			this.unset_active(opt,from_user);
		}
	},
	set_active: function(opt,from_user)
	{
		this.element.addClass('active');
		if(typeof opt.start_timer !== 'undefined' && opt.start_timer) {
			this.start_timer();
		}
		this.active = true;
	},
	unset_active: function(opt,from_user)
	{
		this.element.removeClass('active');
		this.cancel_timer();
		this.active = false;
	},
	start_timer: function()
	{
		this.timer && this.timers_enabled && this.timer.start();
	},
	cancel_timer: function()
	{
		this.stop_timer();
	},
	stop_timer: function()
	{
		this.timer && this.timer.stop();
	}
});