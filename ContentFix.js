'use strict';

// класс блокировки прокрутки основного контента сайта, для отображения диалоговых окон

var $ = require('jquery'),
	Class = require('class.extend');

module.exports = Class.extend({
	__className: 'ContentFix',
	contentFixed : false,
	contentFixedAt : 0,
	init : function(){
		var self = this;

		this.body = $(document.body);
		this.screen = $('#screen');
		this.content = this.screen.find('#content');

		window.contentFix = this;
		window.setFixedContent = function(dir,force,overflow_hidden){ return self.setFixedContent(dir,force,overflow_hidden); };

		window.app.add_resize(this);
	},
	resize: function(){
		this.screen.css({ height: this.contentFixed ? $(window).height() : '' });
	},
	setFixedContent : function(dir,force,overflow_hidden) {
		if( !force && ( this.contentFixed === dir ) ) return false;

		if(dir){
			window.contentFixedAt = this.contentFixedAt = $(window).scrollTop();
			this.body.addClass('contentFixed');
			this.content.css({ top : -this.contentFixedAt });
			window.contentFixed = this.contentFixed = true;
			window.scrollTo(0,0);
			overflow_hidden && this.body.addClass('overflow-hidden');
		}else{
			this.body.removeClass('overflow-hidden');
			this.body.removeClass('contentFixed');
			this.content.css({ top : 'auto' });
			window.scrollTo(0,this.contentFixedAt);
			window.contentFixed = this.contentFixed = false;
			window.contentFixedAt = this.contentFixedAt = 0;
		}

		this.resize();
		$(window).trigger('contentFixed', [ this.contentFixed ]);
		return true;
	}
});