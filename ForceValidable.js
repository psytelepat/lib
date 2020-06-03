'use strict';

// абстрактный класс валидации

var $ = require('jquery'),
	MinimalClass = require('./MinimalClass');

module.exports = MinimalClass.extend({
	__className: 'ForceValidable',
	pre: function(){
		this.name = false;
		this.value = false;
		this.css_target = false;
		this.validator = false;
		this.is_valid = false;
		this.skip_validation = false;
	},
	get_validator: function(elm){
		var validator = $(elm).attr('data-validator');
		if( validator && typeof this.validators[validator] !== 'undefined' ) {
			return this.validators[validator];
		}else{
			return false;
		}
	},
	validate: function(type,event) {
		if( typeof this.validator !== 'function' ) {
			this.is_valid = true;
			return this.is_valid;
		}

		if( typeof type === 'undefined' ) { type = 'check'; }

		var is_valid = this.skip_validation || this.validator.apply(this,[this.inp,type,event]);

		if( this.is_file && this.accept && this.inp.files.length && !this.in_array(this.inp.files[0].type,this.accept) ){
			is_valid = false;
		}

		if( this.css_target && type !== 'revalidate' ) {
			if (is_valid) {
				this.css_target.removeClass('has-error');
				this.css_target.addClass('success');
			}else if( type === 'change' || type === 'check' ) {
				this.css_target.removeClass('success');
				this.css_target.addClass('has-error');
			}else{
				this.css_target.removeClass('success');
			}
		}

		this.element.attr('data-valid', is_valid ? 1 : 0);

		var validity_changed = (this.is_valid !== is_valid);
		this.is_valid = is_valid;

		if(validity_changed) {
			if( typeof this.delegate !== 'undefined' && typeof this.delegate.field_validity_changed === 'function' ) {
				this.delegate.field_validity_changed(this);
			}
		}

		return this.is_valid;
	},
	validators: {
		control_key_code: function(keyCode){
			return ( keyCode >= 35 && keyCode <= 40 ) || ( keyCode >= 16 && keyCode <= 18 ) || keyCode == 13 || keyCode == 27 || keyCode == 46 || keyCode == 9 || keyCode == 8;
		},
		num_key_code: function(keyCode,with_control){
			return ( ( keyCode >= 48 && keyCode <= 57 ) || (keyCode >= 96 && keyCode <= 105) || ( with_control && this.control_key_code(keyCode) ) );
		},
		no_numbers: function(t,e){
			if( t === 'keydown' && typeof e !== 'undefined' ) {
				if( !e.shiftKey && this.num_key_code(e.keyCode,false) ) {
					e.preventDefault();
				}
			}
		},
		only_numbers: function(t,e) {
			if( t === 'keydown' && typeof e !== 'undefined' ) {
				if( e.shiftKey || ( !this.num_key_code(e.keyCode,true) && !e.ctrlKey ) ) {
					e.preventDefault();
				}
			}
		},
		phone: function(i,t,e) {
			this.validators.only_numbers(t,e);

			switch(t) {
				case 'focus':
					if( i.value.length === 0 ) {
						i.value = '+';
					}
					break;
				case 'blur':
					if( i.value.length === 1){ i.value = ''; }
					break;
				case 'keydown':
				case 'keyup':
					if( ( i.value !== '+' ) && !/^\+[0-9]*$/.test(i.value) ) {
						i.value = '+' + i.value.replace(/[^0-9]/g, '');
					}
					break;
			}

			this.value = i.value;
			return i.value.length > 7;
		},
		nums: function(i,t,e) {
			if( t === 'keydown' && typeof e !== 'undefined' ) {
				if( e.shiftKey || ( !this.num_key_code(e.keyCode,true) && !e.ctrlKey ) ) {
					e.preventDefault();
				}
			}

			switch(t) {
				case 'keydown':
				case 'keyup':
					if( ( i.value !== '+' ) && !/^[0-9]*$/.test(i.value) ) {
						i.value = i.value.replace(/[^0-9]/g, '');
					}
					break;
			}

			this.value = i.value;
			return true;
		},
		nums_empty: function(i,t,e){
			return this.validators.nums(i,t,e) && ( i.value.length > 1 );
		},
		name: function(i,t,e) {
			this.validators.no_numbers(t,e);

			switch(t) {
				case 'keydown':
				case 'keyup':
					if( ( i.value !== '+' ) && !/[0-9]*$/.test(i.value) ) {
						i.value = i.value.replace(/[0-9]/g, '');
					}
					break;
			}

			this.value = i.value;
			return ( i.value.length > 1 );
		},
		selected: function(){
			return ( this.value && this.value != 0 );
		},
		street: function(){
			this.value = i.value;
			return ( i.value.length > 3 );
		},
		title: function(i,t,e) {
			return ( i.value.length >= 5 );
		},
		empty: function(i,t,e) {
			return ( this.is_file && i.files.length ) || ( ( typeof i.value !== 'undefined' ) && i.value.length > 0 );
		},
		bik: function(i,t,e) {
			this.validators.only_numbers(t,e);
			return /^[\d]{9}$/.test(i.value);
		},
		inn: function(i,t,e) {
			this.validators.only_numbers(t,e);
			return /^[\d]{10,12}$/.test(i.value);
		},
		kpp: function(i,t,e){
			this.validators.only_numbers(t,e);
			return /^[\d]{9}$/.test(i.value);
		},
		zipcode: function(i,t,e){
			this.validators.only_numbers(t,e);
			return i.value.length === 6;
		},
		ogrn: function(i,t,e){
			this.validators.only_numbers(t,e);
			return /^[\d]{13}$/.test(i.value);
		},
		correspondent_account: function(i,t,e){
			this.validators.only_numbers(t,e);
			return /^[\d]{20}$/.test(i.value);
		},
		checking_account: function(i,t,e){
			this.validators.only_numbers(t,e);
			return /^[\d]{20}$/.test(i.value);
		},
		password: function(i,t,e) {
			return i.value.length >= 5;
		},
		message: function(i,t,e) {
			return i.value.length > 0;
		},
		login: function(i,t,e) {
			return i.value.length > 0;
		},
		email: function(i,t,e){
			var ret=/^[a-zA-Z0-9\.\-_]{1,}\@([a-zA-Z0-9\-_]{1,}\.){1,2}[a-zA-Z]{2,4}$/.test(i.value);
			return(ret ? i.value : false);
		},
		agree: function(i,t,e) {
			return i.checked;
		}
	}
});