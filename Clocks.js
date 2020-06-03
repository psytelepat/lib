// часики

var $ = require('jquery'),
	MinimalClass = require('./MinimalClass');

module.exports = MinimalClass.extend({
	__className: 'Clocks',
	create: function(){
		var self = this;
		date = new Date(this.element.data('timestamp'));
		this.timestamp = date.getTime();
		this.lastdate = new Date();

		this.interval = false;

		this.run = {
			active: false,
			interval: false,
			timestamp: false
		};

		this.hours = this.element.find('.js-hours');
		this.minutes = this.element.find('.js-minutes');
		this.seconds = this.element.find('.js-seconds');

		this.element.bind('touchstart click',function(e){
			if( self.run.active ){ return; }
			self.start_run();
		});

		this.update();
		this.interval = setInterval(function(){ self.update(); },1000);
	},
	update: function(){
		var current_date = new Date();
		this.timestamp += ( current_date.getTime() - this.lastdate.getTime() );
		this.lastdate = current_date;

		if( this.run.active ) {
			return;
		}

		var date = new Date(this.timestamp),
			seconds = date.getSeconds(),
			minutes = date.getMinutes(),
			hours = date.getHours() % 12,
			seconds_deg = ( ( seconds / 60 * 360 ) ),
			minutes_deg = ( ( minutes / 60 * 360 ) + ( seconds / 60 * 6 ) ),
			hours_deg = ( ( hours / 12 * 360 ) + ( minutes / 60 * 30 ) );

		this.hours.css({ transform: 'rotate(' + hours_deg + 'deg) translate3d(0,0,0)' });
		this.minutes.css({ transform: 'rotate(' + minutes_deg + 'deg) translate3d(0,0,0)' });
		this.seconds.css({ transform: 'rotate(' + seconds_deg + 'deg) translate3d(0,0,0)' });
	},
	start_run: function(){
		var self = this;
		this.run.active = true;
		this.run.timestamp = this.timestamp - 12 * 60 * 60 * 1000;
		this.run.interval = setInterval(function(){ self.run_update(); },5);
	},
	run_update: function(){
		var current_date = new Date(), finish = false;
		this.run.timestamp += 60250;

		if( this.run.timestamp > this.timestamp ) {
			this.run.timestamp = this.timestamp;
			finish = true;
		}

		var date = new Date(this.run.timestamp),
			seconds = date.getSeconds(),
			minutes = date.getMinutes(),
			hours = date.getHours() % 12,
			seconds_deg = ( ( seconds / 60 * 360 ) ),
			minutes_deg = ( ( minutes / 60 * 360 ) + ( seconds / 60 * 6 ) ),
			hours_deg = ( ( hours / 12 * 360 ) + ( minutes / 60 * 30 ) );

		this.hours.css({ transform: 'rotate(' + hours_deg + 'deg) translate3d(0,0,0)' });
		this.minutes.css({ transform: 'rotate(' + minutes_deg + 'deg) translate3d(0,0,0)' });
		this.seconds.css({ transform: 'rotate(' + seconds_deg + 'deg) translate3d(0,0,0)' });

		if( finish ) {
			this.finish_run();
		}
	},
	finish_run: function(){
		clearInterval(this.run.interval);
		this.run.interval = false;
		this.run.active = false;
	}
});
