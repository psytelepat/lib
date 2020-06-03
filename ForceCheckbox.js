'use strict';

// класс чекбокса для ForceForm

var $ = require('jquery'),
	ForceValidable = require('./ForceValidable');

module.exports = ForceValidable.extend({
	__className: 'ForceCheckbox',
	create: function(){
		var self = this,
			inputs = this.element.find('input[type=checkbox]');

		inputs.attr('data-evt',1);

		this.inp = inputs[0];
		this.name = this.inp.name;
		this.css_target = this.element;
		this.validator = this.get_validator(this.inp);

		this.checked = this.inp.checked;
		this.value = this.checked ? this.inp.value : '';

		$(this.inp).change(function(){
			self.checked = this.checked;
			self.value = this.checked ? this.value : '';
			self.validate('change');

			if( typeof self.onChange === 'function' ) {
				self.onChange(self,'change');
			}
		});
	},
	set_checked: function(checked){
		this.inp.checked = this.checked = checked;
		this.value = this.checked ? this.value : '';
		this.validate('change');
		if( typeof this.onChange === 'function' ) {
			this.onChange(this,'change');
		}
	},
	reset: function(){
		this.value = 0;
		this.inp.checked = false;
		this.element.removeClass('full success');
		this.validate('init');
	}
});