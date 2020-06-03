'use strict';

var $ = require('jquery'),
	MinimalClass = require('../lib/MinimalClass');

module.exports = MinimalClass.extend({
	__className: 'Loader',
	loaderSVG: '<svg class="circular" viewBox="0 0 50 50">'+
		'<circle cx="25" cy="25" r="20" stroke="#4B575C" stroke-width="1" opacity=".2" fill="none"/>'+
		'<circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="2" stroke-miterlimit="10"/>'+
		'</svg>',
	loaderSVG_big: '<svg class="circular" viewBox="0 0 70 70">'+
		'<circle cx="35" cy="35" r="30" stroke="#4B575C" stroke-width="1" opacity=".2" fill="none"/>'+
		'<circle class="path" cx="35" cy="35" r="30" fill="none" stroke-width="2" stroke-miterlimit="10"/>'+
		'</svg>',
	create: function(){
		var self = this;
		this.element = $('<div>').addClass('loader');

		if( this.css ) {
			this.element.addClass(this.css);
		}

		if( this.big ) {
			this.element.addClass('big');
		}

		this.caption = this.text ? $('<div>').addClass('caption').html( this.text ) : false;

		if( this.fixed ) {
			this.element.addClass('fixed');
		}

		if( this.target ) {
			this.appendTo(this.target);
		}
	},
	show: function(){
		this.element.addClass('show');
	},
	hide: function(){
		this.element.removeClass('show');
	},
	appendTo: function(target) {
		this.target = $(target);
		this.element.appendTo( this.target );
		this.element.html( this.big ? this.loaderSVG_big : this.loaderSVG);
		if(this.caption) this.element.append(this.caption);
	},
	remove: function(){
		this.element.remove();
	}
});