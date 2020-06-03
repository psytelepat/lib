'use strict';

// Простой класс управления картой Google

var $ = require('jquery'),
	MinimalClass = require('../MinimalClass');

module.exports = MinimalClass.extend({
	__className: 'SimpleGoogleMap',
	pre: function(){
		this.autocreate = false;
	},
	create: function(){
		var self = this;

		this.map = false;
		this.marker = false;
		this.markers = {};

		this.tid = this.element.data('tid');
		if( this.tid ){ window.maps_controller.google_maps[this.tid] = this; }

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
		var marker = this.addMarker(lat,lng);
		this.map.panTo({lat: lat, lng: lng});
	},
	create_map: function(lat,lng){
		if(this.map) return;
		this.map = this.generate_map(this.lat,this.lng,this.zoom);
		this.addMarker(this.lat,this.lng);
	},
	generate_map: function(lat,lng,zoom){
		var map = new window.maps_controller.gmaps.maps.Map(this.element[0], {
			center: { lat: lat, lng: lng },
			zoom: zoom,
			disableDefaultUI: true
		});

		return map;
	},
	offsetCenter: function(x,y){
		try {
			var center = new window.maps_controller.gmaps.maps.LatLng(this.lat,this.lng);
			this.map.setCenter( window.maps_controller.google_map_offset_coords(this.map, center, x, y ) );
		}catch(e){
			var self = this;
			setTimeout(function(){ self.offsetCenter(x,y); },50);
		}
	},
	addMarker: function(lat,lng){
		var marker_id = lat.toString() + '_' + lng.toString();
		if( typeof this.markers[marker_id] != 'undefined' ) return false;

		var marker = new window.maps_controller.gmaps.maps.Marker({
			position: { lat: lat, lng: lng },
			map: this.map,
			icon: this.marker_icon
		});

		this.markers[marker_id] = marker;
        return marker;
	}
});