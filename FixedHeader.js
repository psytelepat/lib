'use strict';

var $ = require('jquery'),
	MinimalClass = require('./MinimalClass');

module.exports = MinimalClass.extend({
	__className: 'FixedHeader',
	pre: function(){
		this.fixed_class = 'fixed';
	},
	create: function(){
		var self = this;
		window.app.add_scroll(this);
	},
	scroll: function(scrollTop){
		this.set_fixed( scrollTop >= window.app.wh - 72 );
	},
	set_fixed: function(fixed) {
		if( this.fixed === fixed ) return false;
		fixed ? this.element.addClass(this.fixed_class) : this.element.removeClass(this.fixed_class);
		this.fixed = fixed;
		return true;
	}
});