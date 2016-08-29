
/**
* Functions to draw pipes on Google Maps
*
* Authors: Andrei Hodorog <hodoroga@cardiff.ac.uk>
*
*/

var pipes = function() {
	var module = {};

	module.draw = async function(map) {
		// Fetch pipes data
		const pipesEndpoint = 'http://131.251.176.109:8082/Data/query?query=PREFIX%20wis%3A<http%3A%2F%2Fwww.WISDOM.org%2FWISDOMontology%23>%0APREFIX%20rdf%3A<http%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23>%0ASELECT%20%20%3FXcoord_US%20%3FYcoord_US%20%3FXcoord_DS%20%3FYcoord_DS%0AWHERE%20%7B%20%0A%3FURI%20wis%3AhasUpstreamNode%20%3FUSnode%20.%0A%3FUSnode%20wis%3AhasXcoord%20%3FXcoord_US%20.%0A%3FUSnode%20wis%3AhasYcoord%20%3FYcoord_US%20.%0A%3FURI%20wis%3AhasDownstreamNode%20%3FDSnode%20.%0A%3FDSnode%20wis%3AhasXcoord%20%3FXcoord_DS%20.%0A%3FDSnode%20wis%3AhasYcoord%20%3FYcoord_DS%20.%0A%7D';
	    const pipesData = await fetch(pipesEndpoint).then(response => response.json());

	    var pipesBindings = pipesData.results.bindings
	        .map(it =>
	            [
	                OsGridRef.osGridToLatLon(
	                    new OsGridRef(it.Xcoord_US.value, it.Ycoord_US.value)
	                ),
	                OsGridRef.osGridToLatLon(
	                    new OsGridRef(it.Xcoord_DS.value, it.Ycoord_DS.value)
	                )
	            ]
	    );

		pipes.represent(map, pipesBindings);
	};

	module.represent = function(map, pipesBindings) {
		// Draw pipes
		const randomColorChannel = () => parseInt(Math.random() * 256).toString(16);
	    const randomColor = () => `#${randomColorChannel()}${randomColorChannel()}${randomColorChannel()}`;
	    let mapBounds = new google.maps.LatLngBounds();
	    const lines = [];

	    pipesBindings.map(it => {
	        const pointX = new google.maps.LatLng(it[0].lat, it[0].lon);
	        const pointY = new google.maps.LatLng(it[1].lat, it[1].lon);

	        mapBounds.extend(pointX);
	        mapBounds.extend(pointY);

	        const line = new google.maps.Polyline({
	            path: [pointX, pointY],
	            strokeColor: randomColor()
	        });
	        line.setMap(map);
	        lines.push(line);
	    });

	    const larg = 2;
	    google.maps.event.addListener(map, "zoom_changed", () => {
	        const zoom = map.getZoom() * larg / 17;
	        lines.forEach(line => line.setOptions({ strokeWeight: zoom }));
	    });

	    map.fitBounds(mapBounds);
	};

	return module;
}();