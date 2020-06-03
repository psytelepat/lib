'use strict';

// класс диалоговых окон

var $ = require('jquery'),
	ForceForm = require('./ForceForm');

module.exports = ForceForm.extend({
	__className: 'OverlayForm',
	create: function(){
		this._super();

		var self = this;

		this.form_wrap = this.delegate.element.find('.form-wrap');
		this.form_success_wrap = this.delegate.element.find('.form-success-wrap');
		this.form_error_wrap = this.delegate.element.find('.form-error-wrap');

		if(!this.form_wrap.length) this.form_wrap = false;
		if(!this.form_success_wrap.length) this.form_success_wrap = false;
		if(!this.form_error_wrap.length) this.form_error_wrap = false;

		this.initialize_timer = null;

		this.delegate.element.find('.js-initialiaze-form').click(function(){
			if(self.initialize_timer){
				clearTimeout(self.initialize_timer);
				self.initialize_timer = null;
			}
		});
	},
	initialize_form: function(){
		this.delegate.element.removeClass('form-successed form-errored form-failed');
		this.delegate.resize();
	},
	on_open: function(cb){
		this.initialize_form();
	},
	on_success: function(){
		this.delegate.element.addClass('form-successed');
		this.delegate.resize();
		this.reset();

		var self = this;
		this.initialize_timer = setTimeout(function(){
			self.delegate.close();
		},5000);
	},
	on_error: function(){
		this.delegate.element.addClass('form-errored');
		this.delegate.resize();
	},
	on_fail: function(){
		this.delegate.element.addClass('form-failed');
		this.delegate.resize();
	},
	on_complete: function(){

	}
});