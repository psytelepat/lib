/*
* author Denis Verstov
* version 1.0
*/
'use strict';

var $ = require('jquery'),
	MinimalClass = require('./MinimalClass');

module.exports = MinimalClass.extend({
	__className: 'ForceScrollScreen',
	pre: function () {
		this.current_screen = '';
		this.current = '';
		this.count = '';
		this.delta = 0;
		this.lock = 0;
		this.last_active_screen = '';
		this.animation_duration = 1600;
		this.infinite = false;
		this.trigger_next = '';
		this.content = $('#content');
		this.isIpad = navigator.userAgent.match(/iPad/i) != null;
	},
	create: function () {
		var self = this;
		this.setup_params();
		this.resize();
		if(this.isIpad){
			this.setup_swipe();
		}else{
			this.setup_scroll();
		}
		$(window).on('resize', function () {
			self.resize();
		});
		this.trigger_next.click(function () {
			self.add_next_screen();
		});
		this.screen_controls.find('li').click(function () {
			var new_current = $(this).data('pos');
			window.index_map.set_menu_opened(false);
			self.move_to_position(new_current);
		});
	},
	setup_params: function () {
		this.count = $('.screen-section').length;
		this.current = $('.screen-section.active').data('screen');
		this.current_screen = $('.screen-section.active');
		this.line_x = $('.js-screen-line-x');
		this.line_y = $('.js-screen-line-y');
		this.screen_controls = $('.js-screen-controls');
	},

	setup_scroll: function () {
		var self = this;
		$(window).bind('swipe scroll wheel mousewheel', function (e) {
			e.preventDefault();
			var delta = e.originalEvent.deltaY;
			self.delta = 0;
			if (self.lock == 0 && window.busy == 0) {
				self.lock = 1;
				if (delta < 0) {
					self.move_to_up();
				} else {
					self.move_to_down();
				}
			}
		});
	},

	setup_swipe: function (e) {
		var self = this;
		this.setTouchEvent({
			touchSurface: this.content,
			onEnd: function (options, touchEvent) {
				switch (options.moved) {
					case 'up':
						if (self.lock == 0) {
							self.lock = 1;
							self.move_to_up();
						}
						break;
					case 'down':
						if (self.lock == 0) {
							self.lock = 1;
							self.move_to_down();
						}
						break;
				}
			}
		});
	},

	move_to_up: function () {
		if (!this.infinite && this.current == this.count) {
			this.lock = 0;
			return false;
		}
		if (this.current == 1 && !this.current_screen.hasClass('next-screen')) {
			this.add_next_screen();
		} else {
			this.animate_lines();
			this.move_carusel_to_up();
		}
	},

	move_to_down: function () {
		if (!this.infinite && this.current == 1 && !this.current_screen.hasClass('next-screen')) {
			this.lock = 0;
			return false;
		}
		if (this.current == 1 && this.current_screen.hasClass('next-screen')) {
			this.remove_next_screen();
		} else {
			this.animate_lines();
			this.move_carusel_to_down();
		}
	},

	move_carusel_to_down: function (new_current = undefined) {
		var self = this;
		this.last_active_screen = this.current_screen;
		this.current_screen.removeClass('active moveMiddleToDown moveUpToMiddle moveMiddleToUp moveDownToMiddle').addClass('moveMiddleToDown');
		if (new_current != undefined) {
			this.current = new_current;
		} else {
			if (this.current == 1) {
				this.current = this.count;
			} else {
				this.current = this.current - 1;
			}
		}
		this.current_screen = $('.js-screen-' + this.current);
		this.current_screen.addClass('moveUpToMiddle active');
		this.clear_animation();
	},

	move_carusel_to_up: function (new_current = undefined) {
		var self = this;
		this.last_active_screen = this.current_screen;
		this.current_screen.removeClass('active moveMiddleToDown moveUpToMiddle moveMiddleToUp moveDownToMiddle').addClass('moveMiddleToUp');
		if (new_current != undefined) {
			this.current = new_current;
		} else {
			if (this.current == this.count) {
				this.current = 1;
			} else {
				this.current = this.current + 1;
			}
		}
		this.current_screen = $('.js-screen-' + this.current);
		this.current_screen.addClass('moveDownToMiddle active');
		this.clear_animation();
	},

	animate_lines: function () {
		var self = this;
		self.line_x.addClass('animated-screen-x');
		self.line_y.addClass('animated-screen-y');
		setTimeout(function () {
			self.line_x.removeClass('animated-screen-x');
			self.line_y.removeClass('animated-screen-y');
		}, 1200);
	},

	clear_animation: function () {
		var self = this;
		setTimeout(function () {
			self.last_active_screen.removeClass('moveMiddleToDown moveUpToMiddle moveMiddleToUp moveDownToMiddle');
			self.lock = 0;
			window.busy = 0;
		}, this.animation_duration);
	},

	resize: function () {
		$('.screen-section').each(function () {
			if ($(this).hasClass('resize')) {
				$(this).css('height', $(window).height() - 98);
				$(this).css('width', $(window).width() - 346);
			} else if ($(this).hasClass('about')) {
				$(this).css({
					width: (($(window).innerWidth() * 67) / 100) + 'px',
				})
			} else {
				$(this).css('height', $(window).height());
				$(this).css('width', $(window).width());
			}
		});
	},

	move_to_position: function (new_current) {
		var self = this;
		this.lock = 1;
		window.busy = 1;
		$('.js-lock-screen').css('display', 'none');
		$('.screen-section.resize').css('height', $(window).height());
		$('.screen-section.resize').css('width', $(window).width());
		$('.screen-section.resize').removeClass('resize');
		setTimeout(function () {
			if (self.current == 1 && new_current == 1) {
				$('.screen-section.first-screen').removeClass('next-screen');
				window.index_map.set_screen(1);
			} else {
				if (new_current == 1) {
					$('.screen-section.first-screen').removeClass('next-screen');
					window.index_map.set_screen(1);
				}
				if (new_current > self.current) {
					self.animate_lines();
					self.move_carusel_to_up(new_current);
				} else if (new_current < self.current) {
					self.animate_lines();
					self.move_carusel_to_down(new_current);
				}
			}
		}, 1000);
	},

	add_next_screen: function () {
		var self = this;
		self.current_screen.addClass('next-screen');

		window.index_map.set_screen(2);

		setTimeout(function () {
			self.current_screen.find('.bg-screen,.transport-section .left-block, .map-block').addClass('above');
		}, 1000);
		setTimeout(function () {
			self.lock = 0
		}, self.animation_duration);
	},

	remove_next_screen: function () {
		var self = this;
		self.current_screen.find('.bg-screen, .transport-section .left-block, .map-block').removeClass('above');

		window.index_map.set_screen(1);

		self.current_screen.removeClass('next-screen');
		setTimeout(function () {
			self.lock = 0
		}, self.animation_duration);
	},

	move_to_second_screen: function () {
		var self = this;
		self.current_screen.addClass('next-screen');
		setTimeout(function () {
			self.current_screen.find('.bg-screen,.transport-section .left-block, .map-block').addClass('above');
		}, 1000);
		setTimeout(function () {
			self.lock = 0
		}, self.animation_duration);
	},

});