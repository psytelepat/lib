'use strict';

// класс радиокнопки для ForceForm

var $ = require('jquery'),
	ForceValidable = require('./ForceValidable');

module.exports = ForceValidable.extend({
	__className: 'ForceRadio',
	create: function(){
		var self = this;
		this.name = false;
		this.inp = this;
		this.value = 0;
		this.css_target = this.element;
		this.element.find('input[type=radio]').each(function(i,elm){
			if(elm.checked) {
				self.value = elm.value;
			}

			if(!self.name) {
				self.name = elm.name;
			}

			$(elm).change(function(e){
				self.value = this.value;
				self.validate('change');
			});

			$(elm).attr('data-evt', 1);
		});
	}
});