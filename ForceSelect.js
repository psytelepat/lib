'use strict';

// класс <select> для ForceForm

var $ = require('jquery'),
	SmoothScrollBar = require('smooth-scrollbar'),
	ForceValidable = require('./ForceValidable');

module.exports = ForceValidable.extend({
	__className: 'ForceSelect',
	create: function()
	{
		var self = this,
			input = this.element.find('input[type=hidden]');

		if(!input.length) {
			this.name = this.inp = this.input = false;
		}else{
			this.inp = input[0];
			this.input = $(this.inp);
			this.name = this.inp.name;
			this.validator = this.get_validator(this.inp);
			this.css_target = this.element;
			this.input.attr('data-evt',1);
		}

		this.selected = this.element.find('div.select-val');
		this.selected_span = this.selected.find('span');
		this.options = this.element.find('div.options');

		this.select_list = this.options.find('ul.select-list');
		this.select_list_scroll = SmoothScrollBar.default.init(this.select_list[0],{ alwaysShowTracks: true });

		this.value = this.selected.attr('data-value') || '';
		this.selected_item = false;
		this.default_item = false;
		this.mouseover = false;
		this.opened = false;

		if( this.int ) {
			this.value = parseInt(this.value);
		}

		this.items = [];

		this.options.find('li').each(function(i,elm){
			var obj = $(elm),
				item = {
					i: i,
					obj : $(elm),
					value : obj.attr('data-value') || '',
					text : obj.html(),
					active : false,
					activate: function(dir) {
						if( this.active === dir ) { return; }
						if(dir) {
							this.obj.css({ display : 'none' });
						}else{
							this.obj.css({ display : 'block' });
						}
						this.active = dir;
						return this;
					}
				};

			if( self.int ) {
				item.value = parseInt(item.value);
			}

			if( self.value === item.value ) {
				self.default_item = self.selected_item = item.activate(true);
			}

			self.items.push(item);

			item.obj.click(function(e){
				self.pick(i,true);
			});
		});

		if( this.items.length < 2 ){
			this.set_disabled(true);
		}

		this.element.bind('mouseenter mouseleave',function(e){
			self.mouseover = (e.type === 'mouseenter');
		});

		this.element.click(function(e){
			e.preventDefault();
			e.stopPropagation();
			self.toggle();
		});

		$(window).click(function(e){
			if( !self.mouseover && self.opened ) {
				self.toggle(false);
			}
		});

		if( this.select_list.outerHeight(true) > 300 ){
			this.select_list.css({ height: 300 });
		}
	},
	toggle: function(dir)
	{
		if( this.disabled ) return;

		var self = this;
		
		if( typeof dir === 'undefined' ) {
			dir = !this.opened;
		}else if(dir === this.opened){
			return;
		}

		if (dir){
			$('.js-select.open').removeClass('open').find('.options').animate({ height: 0 });

			this.element.addClass('open');
			this.options.css({ height: '' });
			var height = this.options.outerHeight(true);
			this.options.stop().css({ height: 0 }).animate({ height: height });
		} else {
			this.element.removeClass('open');
			this.options.stop().animate({ height: 0 });
			setTimeout(function(){ self.element.removeClass('open'); },300);
		}

		this.opened = dir;
	},
	pick: function(i,from_user)
	{
		var item = this.items[i];

		if( item.value === this.value ) {
			return;
		}

		var previous_value = this.value;

		this.selected_span.empty().html( item.text );
		this.selected.attr('data-value', item.value);
		if(this.input){ this.input.val( item.value ); }
		this.value = item.value;

		this.value ? this.element.addClass('valued') : this.element.removeClass('valued');

		this.validate('change');

		if(this.selected_item) { this.selected_item.activate(false); }
		this.selected_item = item.activate(true);

		if( from_user && typeof this.onChange === 'function' ) {
			this.onChange(this,previous_value);
		}
	},
	set_to_default: function(from_user){
		if( this.default_item ){
			this.pick(this.default_item.i,from_user);
			return true;
		}
		return false;
	},
	at_default: function(){
		return ( this.default_item && ( this.default_item == this.selected_item ) );
	},
	set_disabled: function(disabled){
		disabled ? this.element.addClass('disabled') : this.element.removeClass('disabled');
		this.disabled = disabled;
	},
	reset: function(){
		return this.set_to_default() || this.pick(0);
	},
	set_value: function(value)
	{
		if( this.int ) { value = parseInt(value); }
		for(var i=0;i<this.items.length;i++) {
			if(this.items[i].value === value.toString()) {
				this.pick(i);
			}
		}
	}
});