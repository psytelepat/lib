'use strict';

// Простой класс управления картой Yandex

var $ = require('jquery'),
	MinimalClass = require('../MinimalClass');

module.exports = MinimalClass.extend({
	__className: 'SimpleYandexMap',
	pre: function(){
		this.autocreate = false;
	},
	create: function(){
		var self = this;

		this.map = false;
		this.marker = false;
		this.markers = {};

		this.tid = this.element.data('tid');
		if( this.tid ){ window.maps_controller.yandex_maps[this.tid] = this; }

		this.autocreate = this.autocreate || parseInt(this.element.data('autocreate')||0);

		this.lat = this.lat || parseFloat(this.element.data('lat'));
		this.lng = this.lng || parseFloat(this.element.data('lng'));
		
		var zoom = parseInt(this.element.data('zoom'));
		if( zoom ){ this.zoom = zoom; }

		if( this.autocreate ){
			this.create_map();
		}
	},
	panTo: function(lat,lng){
		this.addMarker(lat,lng);
		this.map.panTo([lat,lng]);
	},
	create_map: function(){
		if(this.map) return;
		this.map = this.generate_map(this.lat,this.lng,this.zoom);
		this.addMarker(this.lat,this.lng);
	},
	generate_map: function(lat,lng,zoom){
		var map = new window.maps_controller.ymaps.Map(this.element[0], {
			center: [lat,lng],
			zoom: zoom,
			controls: []
		});

		return map;
	},
	addMarker: function(lat,lng){
		var marker_id = lat.toString() + '_' + lng.toString();
		if( typeof this.markers[marker_id] != 'undefined' ) return false;

		var marker = new window.maps_controller.ymaps.Placemark([lat,lng], {}, {
            iconLayout: 'default#image',
            iconImageHref: this.marker_icon,
            iconImageSize: this.marker_size,
            iconImageOffset: this.marker_offset
        });

        this.map.geoObjects.add(marker);

		this.markers[marker_id] = marker;
        return marker;
	}
});