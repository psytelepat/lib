'use strict';

// Класс управления картами Yandex и Google

var $ = require('jquery'),
	GoogleMapsLoader = require('google-maps'),
	YandexMaps = require('ymaps'),
	SimpleYandexMap = require('./SimpleYandexMap'),
	SimpleGoogleMap = require('./SimpleGoogleMap'),
	MinimalClass = require('../MinimalClass');

module.exports = MinimalClass.extend({
	__className: 'MapsController',
	pre: function(){
		this.map_options = {
			marker_icon: '/assets/desktop/images/map-pointer.svg',
			marker_size: [44, 58],
			marker_offset: [-22, -50],
			zoom: 16
		};
	},
	create: function(){
		var self = this;

		this.yandex_maps_buffer = [];
		this.google_maps_buffer = [];
		this.google_maps = {};
		this.yandex_maps = {};

		this.ymaps = null;
		this.gmaps = null;

		window.maps_controller = this;

		$(window).bind('yandex_maps_loaded', function(){
			self.yandex_maps_buffer.forEach(function(func){ func(); });
			self.yandex_maps_buffer = [];
		});

		$(window).bind('google_maps_loaded', function(){
			self.google_maps_buffer.forEach(function(func){ func(); });
			self.google_maps_buffer = [];
		});

		GoogleMapsLoader.KEY = 'AIzaSyAu3jFyzPWbgIPmoFUCNFhGpLuRtHBLc4I';
		GoogleMapsLoader.LANGUAGE = 'ru';
		GoogleMapsLoader.VERSION = '3.38';
		GoogleMapsLoader.load(function(gmaps){
			self.gmaps = gmaps;
			window.app.map_modules({
				'.js-simple-google-map': {
					module: SimpleGoogleMap,
					options: self.map_options
				}
			});
			$(window).trigger('google_maps_loaded');
		});

		YandexMaps.default.load().then(function(ymaps){
			self.ymaps = ymaps;
			window.app.map_modules({
				'.js-simple-yandex-map': {
					module: SimpleYandexMap,
					options: self.map_options
				}
			});
			$(window).trigger('yandex_maps_loaded');
		});

		$(window).trigger('maps_controller_ready');
	},
	createSimpleYandexMap: function(elm,options,callback){
		options = Object.assign(options || {}, this.map_options);
		options.element = elm;

		var func = function(){
			var instance = new SimpleYandexMap(options);
			( typeof callback == 'function' ) && callback(instance);
		};

		this.ymaps ? func() : this.yandex_maps_buffer.push( func );
	},
	createSimpleGoogleMap: function(elm,options,callback){
		options = Object.assign(options || {}, this.map_options);
		options.element = elm;

		var func = function(){
			var instance = new SimpleGoogleMap(options);
			( typeof callback == 'function' ) && callback(instance);
		};

		this.gmaps ? func() : this.google_maps_buffer.push( func );
	},
	google_map_offset_coords: function(map, latlng, offsetx, offsety) {
		var point1 = map.getProjection().fromLatLngToPoint(
			(latlng instanceof this.gmaps.maps.LatLng) ? latlng : map.getCenter()
		);

		var point2 = new google.maps.Point(
			( (typeof(offsetx) == 'number' ? offsetx : 0) / Math.pow(2, map.getZoom()) ) || 0,
			( (typeof(offsety) == 'number' ? offsety : 0) / Math.pow(2, map.getZoom()) ) || 0
		);

		return map.getProjection().fromPointToLatLng(new this.gmaps.maps.Point(
			point1.x - point2.x,
			point1.y + point2.y
		));
	}
});