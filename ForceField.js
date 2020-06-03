'use strict';

// класс текстового поля для ForceForm

var $ = require('jquery'),
	ForceValidable = require('./ForceValidable');

module.exports = ForceValidable.extend({
	__className: 'ForceField',
	create: function(){
		var self = this;

		this.inp = this.element[0];
		this.name = this.inp.name;
		this.label = this.element.parent();
		this.is_phone = ( this.inp.name === 'phone' || this.inp.type === 'tel' );
		this.is_file = ( this.inp.type === 'file' );
		this.value = this.is_file ? this.inp.files : this.element.val();
		this.accept = false;
		if( this.is_file ){
			var accept = this.inp.getAttribute('accept');
			if( accept ){
				this.accept = accept.replace(' ','').split(',');
			}
		}
		this.focused = false;
		this.is_valid = false;
		this.css_target = this.label;

		this.value_element = this.label.find('.value');
		this.value_element_default = this.value_element.html();

		this.is_required = this.label.hasClass('required');
		this.is_disabled = this.inp.getAttribute('disabled');

		this.placeholder = this.label.find('label, .placeholder');
		this.placeholder.click(function(e){ !self.is_disabled && self.element.trigger('focus'); });

		this.validator = this.get_validator(this.inp);

		if( this.inp.value.length > 0 ) {
			this.label.addClass('focused');
			this.label.addClass('full');
		}

		this.element.bind('change keyup keydown focus blur', function(e){ self.handle(e); });
		this.element.attr('data-evt', 1);

		this.autofocused = true;
		this.autofocus_interval = false;
		if( this.inp.name == 'login' || this.inp.type == 'password' ) {
			this.autofocused = false;
			this.autofocus_interval = setInterval(function(){
				if( self.inp.value.length > 0 ) {
					self.handle({ type : 'focus', keyCode : 0, shiftKey : false, ctrlKey : false });
					self.autofocused = true;
					clearInterval(self.autofocus_interval);
					self.autofocus_interval = null;
				}
			},1000);
		}
	},
	set_required: function(dir){
		this.is_required = dir;
		dir ? this.label.addClass('required') : this.label.removeClass('required');
	},
	set_disabled: function(dir){
		this.is_disabled = dir;
		dir ? this.label.addClass('disabled') : this.label.removeClass('disabled');
		dir ? this.inp.setAttribute('disabled',true) : this.inp.removeAttribute('disabled');
		if( dir ){
			this.set_value('');
			this.focus(false);
		}
	},
	reset: function(){
		if(this.inp.type === 'hidden'){ return; }
		if( this.is_file ){
			this.value_element.html( this.value_element_default );
		}
		this.value = this.inp.value = '';
		this.label.removeClass('full success');
		this.focus(false);
		this.validate('init');
	},
	focus: function(dir) {
		if( dir && this.is_disabled ) return;
		if (dir !== this.focused) {
			( this.focused = dir ) ? this.label.addClass('focused') : this.label.removeClass('focused');
		}
	},
	handle: function(event){
		var type = event.type,
			should_focus = ( this.inp === document.activeElement ) || ( type === 'focus' ) || ( this.inp.value.length > 0 );

		if (type === 'blur' && this.is_phone && ( this.inp.value.length < 2 ) ) {
			this.label.removeClass('focus');
			return this.reset();
		}
		if(type === 'focus'){
			this.label.addClass('focus');
		}
		if(type === 'change' || type === 'keydown' || type === 'keyup'){
			if( ( this.is_file && this.inp.files.length ) || ( this.inp.value.length > 0 ) ){
				this.label.addClass('full');
			}else{
				this.label.removeClass('full');
			}
		}
		if(type === 'blur'){
			this.label.removeClass('focus');
			if( ( this.is_file && !this.inp.files.length ) || ( this.inp.value.length < 1 ) ){
				this.label.removeClass('full');
			}
		}
		this.validate(type,event);

		var is_empty = this.is_file ? !this.inp.files.length : !this.inp.value.length;

		if(!this.focused && type !== 'focus' && is_empty) {
			should_focus = false;
		}

		this.focus(should_focus);

		if(!this.is_valid && ( type === 'keydown' || is_empty ) ) {
			this.label.removeClass('has-error');
		}

		this.value = this.is_file ? this.inp.files : this.inp.value;

		if( this.is_file ){
			this.value_element.html( this.inp.files.length ? this.inp.files[0].name : this.value_element_default );
		}

		if( typeof this.onHandle === 'function' ){
			this.onHandle(this,type);
		}
	},
	set_value: function(val) {
		if( this.is_file ) return;
		this.value = this.inp.value = val;
		this.handle({ type: 'change' });
		if( typeof this.onChange === 'function' ){
			this.onChange(this);
		}
	}
});