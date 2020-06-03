'use strict';

var lib = require('../index.js'),
	$ = require('jquery'),
	SliderDots = require('./Dots'),
	SliderItem = require('./Item'),
	Controls = require('./Controls'),
	MinimalClass = require('../MinimalClass');

module.exports = MinimalClass.extend({
	__className: 'libSlider',
	pre: function(opt) {
		this.tid = false;
		this.autoplay = false;

		this.stage_selector = '.stage';
		this.item_selector = '.slide';

		this.autoload = true;
		this.load_on_demand = false;
		this.load_in_sequence = false;

		this.item_setup_mode = false;
		this.resize_mode = false;
		this.switch_mode = false;
		this.switch_duration = null;

		this.add_slide_class = false;

		this.start_timer_on_scroll = true;
		this.timers_started_on_scroll = false;

		this.always_switch_quick = false;

		this.with_touch_events = true;

		this.touch_mode = 'static'; // static/dynamic
	},
	create: function() {
		var self = this;

		this.is_loading = false;
		this.is_loaded = false;
		this.loaded_items = 0;

		this.stage_rect = false;

		this.is_switching = true;
		this.is_user_interacted = false;

		this.autoplay_timer = false;

		this.item = [];
		this.pos = 0;

		this.controls = false;

		if(!this.tid) {
			this.tid = this.element.attr('tid') || '';

			if(this.tid.length){
				if( typeof window.sliders === 'undefined' ){
					window.sliders = {};
				}
				window.sliders[this.tid] = this;
			}
		}

		this.stage = this.element.find(this.stage_selector);
		if(!this.stage.length) return;

		if(!this.item_setup_mode) {
			this.item_setup_mode = this.element.data('setup-mode') || 'background';
		}

		if(!this.add_slide_class){
			this.add_slide_class = this.element.data('add-slide-class') || false;
		}

		if(!this.resize_mode) {
			this.resize_mode = this.element.data('resize-mode') || false;
		}

		if(!this.switch_mode) {
			this.switch_mode = this.element.data('switch-mode') || false;
		}

		if(!this.autoplay){
			this.autoplay = parseInt(this.element.data('autoplay') || 0) || false;
		}

		if(!this.stage_resize_mode) {
			this.stage_resize_mode = this.stage.data('resize-mode') || false;
		}

		if(!this.switch_duration) {
			this.switch_duration = parseInt(this.stage.data('switch-duration')||0) || false;
		}

		this.progress_bar_element = this.element.find('.js-progress-bar');
		if( !this.progress_bar_element.length ) { this.progress_bar_element = false; }

		this.with_floating_arrow = parseInt(this.element.data('with-floating-arrow'));
		this.clickable_slider = parseInt(this.element.data('clickable') || 0);
		this.clickable_stage = parseInt(this.stage.data('clickable') || 0);

		this.stage_rect = this.stage[0].getBoundingClientRect();
		this.pos_view = this.element.find('.js-pos');

		this.arrl = this.element.find('.js-prev');
		this.arrr = this.element.find('.js-next');

		this.floating_arrow = this.element.find('.js-floating-arrow');

		this.timer_element = this.element.find('.js-timer');

		this.create_items();
		this.create_dots();
		this.create_positions();

		if(this.autoload) {
			if(this.load_on_demand) {
				this.item[this.pos].load(function(item){
					self.prepare_slider();
					self.is_switching = false;
				});
			}else{
				this.load();
			}
		}

		window.app.add_resize(this);
		window.app.add_scroll(this);
	},
	resize: function(ww,wh){
		var self = this;

		this.element.css({ width: '' });
		var width = Math.floor(this.element.width());

		switch(this.resize_mode){
			case 'aspect':
				var aspect = parseFloat(this.element.data('aspect'));
				this.element.css({ width: width, height: Math.round( width * aspect ) });
				break;
			case '2x1':
				this.element.css({ width: width, height: Math.round(width / 2) });
				break;
			case '3x2':
				this.element.css({ width: width, height: Math.round(width / 3 * 2) });
				break;
			case '16x9':
				this.element.css({ width: width, height: Math.round(width / 16 * 9) });
				break;
			case '16x9max':
				this.element.css({ width: width, height: Math.min( Math.round(width / 16 * 9), window.app.wh - 110 - 96 - 100 ) });
				break;
		}

		switch(this.stage_resize_mode){
			case 'content':
				var max_width = 0, max_height = 0;
				this.item.forEach(function(elm,i){
					var rect = elm.get_content_size();
					if( rect ) {
						max_width = Math.max( max_width, rect.width );
						max_height = Math.max( max_height, rect.height );
					}
				});

				this.stage.css({ height: max_height });
				this.item.forEach(function(elm,i){
					if(elm.content) { elm.content.css({ height: max_height }); }
				});
				break;
		}

		this.stage_rect = this.stage[0].getBoundingClientRect();
		this.item.forEach(function(item,i){ item.resize(self.stage_rect.width,self.stage_rect.height); });
	},
	create_dots: function(){
		var self = this;

		if( this.tid ){
			$('.js-controls[data-slider="'+this.tid+'"]').each(function(i,elm){
				self.controls = new Controls({ element: elm, delegate: self });
			});
		}else{
			this.element.find('.js-dots').each(function(i,elm){
				self.dots = new SliderDots({ element: elm, delegate: self, onChange: function(pos,opt,from_user){
					self.switch_item(pos);
				}});
			});
		}
	},
	create_positions: function(){
		var self = this;

		this.positions = this.element.find('.js-positions');
		if(this.positions.length){
			for(var i=1,count=this.item.length;i<=count;i++){
				var li = $('<li></li>').html( i<10?'0'+i:i );
				if( this.pos === i - 1 ){ li.addClass('active'); }
				(function(li,i){
					li.bind('click',function(e){
						self.switch_item(i);
					});
				})(li,i-1);
				this.positions.append(li);
			}
		}else{
			this.positions = false;
		}
	},
	set_positions: function(pos){
		if( this.positions ){
			var li = this.positions.find('li');
			li.removeClass('active');
			$(li[pos]).addClass('active');
		}
	},
	create_items: function(){
		var self = this,
			count = 0;

		this.element.bind('item_loaded.slider',function(e,item,cb){ self.on_item_loaded(item,cb); });

		this.stage.find(this.item_selector).each(function(i,elm){
			var item = self.create_item({
				id: i,
				element: elm,
				delegate: self,
				setup_mode: self.item_setup_mode
			});

			if(item.active){
				self.pos = item.id;
			}

			self.item.push( item );
			count++;
		});

		return count;
	},
	create_item: function(data){
		return new SliderItem(data);
	},
	get_current_item: function(){
		return this.item[this.pos];
	},
	remove_items_with_errors: function()
	{
		var good = [], errors = 0, id = 0;
		for(var i=0;i<this.item.length;i++) {
			if(!this.item[i].is_error) {
				this.item[i].id = id++;
				good.push( this.item[i] );
			}else{
				this.item[i].remove();
				errors++;
			}
		}

		if(errors){
			this.item = good;
		}
	},
	set_loading: function(dir)
	{
		if(this.is_loading == dir) return;
		dir ? this.element.addClass('loading') : this.element.removeClass('loading');
		this.is_loading = dir;
	},
	load: function(cb)
	{
		if(this.is_loading) return false;
		if(this.is_loaded) return ( typeof cb === 'function' ? cb() : false );

		var self = this;
		if(this.load_in_sequence){
			this.item[0].load(cb);
		}else{
			$(this.item).each(function(i,item){ item.load(cb); });
		}

		return true;
	},
	on_item_loaded: function(item,cb)
	{
		var next = item.id + 1;

		this.loaded_items++;
		if(this.load_on_demand) {
			this.set_loading(false);
			( typeof cb === 'function' ) && cb();
		}else{
			if(this.loaded_items >= this.item.length){
				this.everything_loaded(cb);
			}else{
				if( this.load_in_sequence && ( next < this.item.length - 1 )){
					this.item[next].load(cb);
				}
			}
		}
	},
	everything_loaded: function(cb)
	{
		this.loading = false;
		this.loaded = true;

		this.set_loading(false);
		this.is_switching = false;
		this.loaded = true;

		this.remove_items_with_errors();
		this.prepare_slider();

		this.element.addClass('loaded');

		this.start_autoplay();

		( typeof cb === 'function' ) && cb();
	},
	prepare_slider: function()
	{
		this.item[this.pos].activate(true);
		this.setup_events();
	},
	setup_events: function()
	{
		var self = this;

		if(this.arrl){
			this.arrl.bind('click',function(e){
				self.set_user_interacted();
				self.prev();

				( typeof self.onClick === 'function' ) && self.onClick(self);
			});
		}

		if(this.arrr){
			this.arrr.bind('click',function(e){
				self.set_user_interacted();
				self.next();

				( typeof self.onClick === 'function' ) && self.onClick(self);
			});
		}

		if(this.stage && this.clickable_stage && this.item.length > 1){
			this.stage.bind('click',function(e){
				self.set_user_interacted();

				var rect = self.stage[0].getBoundingClientRect();
				( e.pageX > rect.left + rect.width / 2 ) ? self.next() : self.prev();

				( typeof self.onClick === 'function' ) && self.onClick(self);
			});
		}

		if( this.clickable_slider && this.item.length > 1){
			this.element.bind('click',function(e){
				self.set_user_interacted();

				var rect = self.element[0].getBoundingClientRect();
				( e.pageX > rect.left + rect.width / 2 ) ? self.next() : self.prev();

				( typeof self.onClick === 'function' ) && self.onClick(self);
			});
		}

		if( this.with_floating_arrow && typeof window.floating_arrow != 'undefined' ) {
			this.element.css({ cursor: 'none' }).bind('mouseenter mousemove mouseleave',function(e){ self.mouse_floating_arrow(e); });
		}

		if( this.with_touch_events ){
			this.setup_touch_events();
		}
	},
	mouse_floating_arrow: function(e){
		switch(e.type){
			case 'mouseleave':
				window.floating_arrow.hide();
				break;
			case 'mouseenter':
				window.floating_arrow.show(e);
			case 'mousemove':
				var rect = this.element[0].getBoundingClientRect(),
					orientation = ( e.pageX > rect.left + rect.width / 2 ) ? 'right' : 'left';
				window.floating_arrow.set_orientation(orientation);
				window.floating_arrow.set_position(e.pageX,e.pageY);
				break;
		}
	},
	prev_pos: function(){
		var pos = this.pos - 1;
		if(pos < 0) pos = this.item.length - 1;
		return pos;
	},
	next_pos: function(){
		var pos = this.pos + 1;
		if(pos >= this.item.length) pos = 0;
		return pos;
	},
	prev: function(cb,quick)
	{
		return this.switch_item(this.prev_pos(),false,cb,quick);
	},
	next: function(cb,quick)
	{
		return this.switch_item(this.next_pos(),true,cb,quick);
	},
	switch_by_slide_id: function(id){
		var slide = null;
		for(var i=0,count=this.item.length;i<count;i++){
			if( this.item[i].slide_id == id ){
				slide = this.item[i];
				break;
			}
		}

		if( slide ){
			this.switch_item( slide.id );
		}
	},
	switch_item: function(pos,dir,cb,quick,force,not_user_initiated)
	{
		if(this.is_loading || ( !force && ( ( this.pos === pos ) || this.is_switching) ) ) return false;
		if(typeof dir === 'undefined' || dir === null){ dir = pos > this.pos; }
		if(typeof quick === 'undefined'){ quick = false; }
		if(this.always_switch_quick) { quick = true; }

		this.is_switching = true;

		if(this.timer_element && this.timer_element.length){
			this.timer_element.css({ transition: '', width: '0%' });
		}

		var self = this,
			prev_pos = this.pos,
			cur = this.item[prev_pos],
			nxt = this.item[pos],
			dirExp = ( dir ? 'Next' : 'Prev' ),
			aEvt = this.animationEndEventName(),
			tEvt = this.transitionEndEventName(),
			waitingFor = 2,
			completes = 0,
			onComplete = function() {
				if(quick) {
					cur.activate(false);
				}else{
					cur.element.removeClass(['navOut'+dirExp,'flyOut'+dirExp].join(' '));
					nxt.element.removeClass(['navIn'+dirExp,'flyIn'+dirExp,'fly'+dirExp].join(' '));
				}

				nxt.activate(true);

				self.pos = pos;
				self.update_pos_viewer(pos);
				self.set_positions(pos);

				self.is_switching = false;

				self.start_autoplay();

				if( typeof self.onSwitch === 'function' ) {
					self.onSwitch(self, not_user_initiated);
				}

				self.trigger(self.element,'items_switched',[self,pos,nxt,prev_pos,cur]);

				typeof cb === 'function' && cb();
			},
			onTransitionComplete = function(e) {
				if($(this).hasClass('active')){ cur.activate(false); }
				this.removeEventListener(tEvt,onTransitionComplete,false);
				if(++completes >= waitingFor) onComplete();
			},
			onAnimationComplete = function(e) {
				if($(this).hasClass('active')){ cur.activate(false); }
				this.removeEventListener(aEvt,onAnimationComplete,false);
				if(++completes >= waitingFor) onComplete();
			};

		if( this.load_on_demand && !nxt.is_loaded ) {
			nxt.load(function(){
				self.switch_item(pos, dir, cb, quick, true);
			});
			return true;
		}

		if( this.progress_bar_element ){
			if( not_user_initiated ){
				this.progress_bar_element.css({ width: ( ( pos ) * 100 / ( this.item.length - 1 ) ) + '%' });
			}else{
				this.progress_bar_element.animate({ width: ( ( pos ) * 100 / ( this.item.length - 1 ) ) + '%' });
			}
		}

		self.trigger(self.element,'items_switching',[this,pos,nxt,prev_pos,cur]);

		if( ( typeof this.dots !== 'undefined' ) && ( typeof this.dots.switch_to === 'function' ) ) {
			this.dots.switch_to_by_pos(pos);
		}

		if(quick)
		{
			quick = true;
			onComplete();
		}
		else if( this.switch_duration )
		{
			cur.element.addClass('navOut' + dirExp);
			setTimeout(function(){
				cur.activate(false);
				nxt.element.addClass('navIn' + dirExp);
				setTimeout(onComplete,self.switch_duration);
			},this.switch_duration);
		}
		else if(aEvt)
		{
			cur.element[0].addEventListener(aEvt, onAnimationComplete, false);
			nxt.element[0].addEventListener(aEvt, onAnimationComplete, false);
			cur.element.addClass('navOut' + dirExp);
			nxt.element.addClass('navIn' + dirExp);
		}
		else if(tEvt)
		{
			cur.element[0].addEventListener(tEvt, onTransitionComplete, false);
			nxt.element[0].addEventListener(tEvt, onTransitionComplete, false);
			nxt.element.addClass('fly' + dirExp);
			setTimeout(function(){
				cur.element.addClass('flyOut' + dirExp );
				nxt.element.addClass('flyIn' + dirExp );
			},10);
		}

		return true;
	},
	update_pos_viewer: function(pos){
		if(this.pos_view.length) {

			if( typeof pos === 'undefined' ){
				pos = this.pos;
			}

			var current = pos + 1,
				total = this.item.length;

			current = current < 10 ? '0' + current : current;
			total = total < 10 ? '0' + total : total;

			var string = ( current ) + ' <span>/ ' + total + '</span>';
			this.pos_view.html(string);
		}

		if(this.controls){
			this.controls.set_pos(pos);
		}
	},
	setup_touch_events: function(){
		var cur, prv, nxt, curpos, prvpos, nxtpos, self = this;

		switch( this.touch_mode ){
			case 'dynamic':
				this.setTouchEvent({
					touchSurface: this.stage,
					preventMoveRule: function(options){
						if( Math.abs(options.distanceX) > 20 && Math.abs(options.distanceX) > Math.abs(options.distanceY) ) return true;
					},
					onStart: function(options,touchEvent){
						self.stop_autoplay();
						self.stop_timer();

						options.cancel = self.is_switching;
						if(options.cancel){ return; }
						self.is_switching = true;

						curpos = self.pos;
						prvpos = self.pos - 1;
						nxtpos = self.pos + 1;

						if( prvpos < 0 ){ prvpos = self.item.length - 1; }
						if( nxtpos > self.item.length - 1 ){ nxtpos = 0; }

						cur = self.item[curpos];
						prv = self.item[prvpos];
						nxt = self.item[nxtpos];
					},
					onMove: function(options,touchEvent){

						var distance = options.distanceX,
							negative_distance = -1 * options.distanceX;

						if( distance <= 0 ) {
							prv.element.css({ transform: 'translateX(-100%)' });
							prv.image && prv.image.css({ transform: 'translateX(100%)' });

							nxt.element.css({ transform: 'translateX(' + ( self.stage_rect.width + distance ) + 'px)' });
							nxt.image && nxt.image.css({ transform: 'translateX(' + ( negative_distance - self.stage_rect.width ) + 'px)' });
						}

						if( distance >= 0 ) {
							nxt.element.css({ transform: 'translateX(100%)' });
							nxt.image && nxt.image.css({ transform: 'translateX(-100%)' });

							prv.element.css({ transform: 'translateX(' + ( distance - self.stage_rect.width ) + 'px)' });
							prv.image && prv.image.css({ transform: 'translateX(' + ( negative_distance + self.stage_rect.width ) + 'px)' });
						}

						cur.element.css({ transform: 'translateX(' + ( distance ) + 'px)' });
						cur.image && cur.image.css({ transform: 'translateX(' + ( negative_distance ) + 'px)' });
					},
					onEnd: function(options,touchEvent){
						var distance = options.distanceX,
							negative_distance = -1 * options.distanceX;

						if( ( Math.abs(distance) > ( self.stage_rect.width / 4 ) ) ) {
							var dir, transform_duration = '.2s', transform_easing = 'ease';

							if( distance < 0 ) {
								// next
								dir = true;
								nxt.element.css({ transition: 'transform '+transform_duration+' ' + transform_easing });
								nxt.image && nxt.image.css({ transition: 'transform '+transform_duration+' ' + transform_easing });

								nxt.element.css({ transform: 'translateX(0)' });
								nxt.image && nxt.image.css({ transform: 'translateX(0)' });
							}else{
								// prev
								dir = false;
								prv.element.css({ transition: 'transform '+transform_duration+' ' + transform_easing });
								prv.image && prv.image.css({ transition: 'transform '+transform_duration+' ' + transform_easing });

								prv.element.css({ transform: 'translateX(0)' });
								prv.image && prv.image.css({ transform: 'translateX(0)' });
							}

							var switching_to = dir ? nxt : prv;

							cur.element.css({ transition: 'transform '+transform_duration+' ' + transform_easing });
							cur.image && cur.image.css({ transition: 'transform '+transform_duration+' ' + transform_easing });

							cur.element.css({ transform: 'translateX(' + ( dir ? -100 : 100 ) + '%)' });
							cur.image && cur.image.css({ transform: 'translateX(' + ( dir ? 100 : -100 ) + '%)' });

							self.trigger(self.element,'items_switching',[self,switching_to.id,switching_to,cur.id,cur]);

							setTimeout(function(){
								nxt.element.css({ transition: '', transform: '' });
								nxt.image && nxt.image.css({ transition: '', transform: '' });

								prv.element.css({ transition: '', transform: '' });
								prv.image && prv.image.css({ transition: '', transform: '' });

								cur.element.css({ transition: '', transform: '' });
								cur.image && cur.image.css({ transition: '', transform: '' });

								if( dir ) {
									nxt.element[0].className = 'slide' + ( self.add_slide_class ? ' ' + self.add_slide_class : '' ) + ' fxRollX active';
									nxt.active = true;
									if(nxt !== prv){
										prv.element[0].className = 'slide'+ ( self.add_slide_class ? ' ' + self.add_slide_class : '' ) +' fxRollX';
										prv.active = false;
									}
								}else{
									prv.element[0].className = 'slide'+ ( self.add_slide_class ? ' ' + self.add_slide_class : '' ) +' fxRollX active';
									prv.active = true;
									if(nxt !== prv){
										nxt.element[0].className = 'slide'+ ( self.add_slide_class ? ' ' + self.add_slide_class : '' ) +' fxRollX';
										nxt.active = false;
									}
								}

								cur.element[0].className = 'slide'+ ( self.add_slide_class ? ' ' + self.add_slide_class : '' ) +' fxRollX';
								cur.active = false;

								self.pos = dir ? nxtpos : prvpos;
								self.is_switching = false;

								self.trigger(self.element,'items_switched',[self,switching_to.id,switching_to,cur.id,cur]);
								self.update_pos_viewer(self.pos);
								self.set_positions(self.pos);
							},250);

						}else{
							prv.element.css({ transform: '' });
							prv.image && prv.image.css({ transform: '' });
							nxt.element.css({ transform: '' });
							nxt.image && nxt.image.css({ transform: '' });
							cur.element.css({ transform: '' });
							cur.image && cur.image.css({ transform: '' });
							self.is_switching = false;
						}
					}
				});
				break;
			case 'static':
			default:
				this.setTouchEvent({
					touchSurface: this.stage,
					preventMoveRule: function(options){
						if( Math.abs(options.distanceX) > 20 && Math.abs(options.distanceX) > Math.abs(options.distanceY) ) return true;
					},
					onEnd: function(options,touchEvent){
						switch( options.moved ){
							case 'left':
								self.stop_autoplay(true);
								self.stop_timer();
								self.next();
								break;
							case 'right':
								self.stop_autoplay(true);
								self.stop_timer();
								self.prev();
								break;
						}
					}
				});
				break;
		}
	},
	start_autoplay: function()
	{
		if( !this.autoplay ) return;
		this.stop_autoplay();

		var self = this;
		this.autoplay_timer = setTimeout(function(){ self.next(); }, this.autoplay);
		if(this.timer_element && this.timer_element.length){
			this.timer_element.css({ transition: 'width ' + (this.autoplay / 1000) + 's linear' });
			this.timer_element.css({ width: '100%' });
		}
	},
	stop_autoplay: function(stop_forever)
	{
		if( this.autoplay_timer ) {
			clearTimeout( this.autoplay_timer );
			this.autoplay_timer = false;

			if(this.timer_element && this.timer_element.length) {
				this.timer_element.css({ transition: '' });
				this.timer_element.css({ width: '0%' });
			}
		}

		if( stop_forever ){
			this.autoplay = false;
		}
	},
	scroll: function(){
		var prc;

		if( this.timers_started_on_scroll ){
			prc = this.calc_element_scroll_prc(this.stage[0]);
			if( ( prc < .3 || prc > .9 ) && !this.is_user_interacted ){
				this.stop_timer();
				this.timers_started_on_scroll = false;
				this.start_timer_on_scroll = true;
				return;
			}

		}

		if( !this.start_timer_on_scroll ) return;

		prc = this.calc_element_scroll_prc(this.stage[0]);
		if( prc >= .3 && prc <= .9 ){
			this.start_timer();
			this.timers_started_on_scroll = true;
			this.start_timer_on_scroll = false;
			return;
		}
	},
	start_timer: function(enable_timers){
		this.controls && this.controls.start_timer(true);
		this.dots && this.dots.start_timer(true);
	},
	stop_timer: function(){
		this.controls && this.controls.stop_timer();
		this.dots && this.dots.stop_timer();
	},
	set_user_interacted: function(){
		this.is_user_interacted = true;
		this.stop_autoplay(true);
		this.stop_timer();
	}
});