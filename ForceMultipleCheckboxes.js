'use strict';

var $ = require('jquery'),
	ForceCheckbox = require('./ForceCheckbox'),
	ForceValidable = require('./ForceValidable');

module.exports = ForceValidable.extend({
	__className: 'ForceMultipleCheckboxes',
	create: function(){
		var self = this;

		this.is_valid = false;
		this.name = this.element.data('name');
		this.validator = this.element.data('validator');

		this.checkbox = [];
		this.element.find('.js-checkbox-multiple').each(function(i,elm){
			var obj = $(elm),
				item = new ForceCheckbox({
					element: obj,
					delegate: self,
					onChange: function(checkbox,type){
						self.value = self.get_value();
						self.validate(type);
					}
				});
			self.checkbox.push( item );
		});

		this.value = this.get_value();
	},
	validate: function(type){
		var is_valid = true;
		switch( this.validator ){
			case 'checked':
				is_valid = ( this.value ? true : false );
				break;
		}

		if( type === 'check' || type === 'change' ) {
			if( is_valid ) {
				this.element.removeClass('has-error');
			}else if( type === 'check' ){
				this.element.addClass('has-error');
			}
		}

		this.is_valid = is_valid;

		return this.is_valid;
	},
	get_value: function(){
		var value = [];
		$(this.checkbox).each(function(i,elm){
			if( elm.checked ) {
				value.push( elm.value );
			}
		});

		return value.length ? value : false;
	},
	reset: function(){
		$(this.checkbox).each(function(i,elm){
			elm.reset();
		});
	}
});