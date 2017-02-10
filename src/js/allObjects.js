var allObjects = function() {
	var module = {};

	module.fetchAndDraw = function(url, map) {
		var markerPosition, markerObj, markersDrawn = new Array();
		oboe(url).node('results.*', function(marker) {
			markerPosition = OsGridRef.osGridToLatLon(new OsGridRef(marker.Xcoord, marker.Ycoord)); //Xcoord, Ycoord to Google Maps Lat Lon
			markerObj = new google.maps.Marker({
              position: {lat: markerPosition.lat, lng: markerPosition.lon},
              lat: markerPosition.lat,
              lng: markerPosition.lon
            });

            markerObj.setMap(map);
            markersDrawn.push(markerObj);
		});

		return markersDrawn;
	};

	return module;
}();