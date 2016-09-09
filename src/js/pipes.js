
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
		const pipesEndpointTywyn = 'http://131.251.176.109:8082/ontology/tywyn/select?query=PREFIX%20wis%3A%3Chttp%3A%2F%2Fwww.WISDOM.org%2FWISDOMontology%23%3E%0APREFIX%20rdf%3A%3Chttp%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23%3E%0ASELECT%20%20%3FXcoord_US%20%3FYcoord_US%20%3FXcoord_DS%20%3FYcoord_DS%0AWHERE%20%7B%20%0A%3FURI%20wis%3AhasUpstreamNode%20%3FUSnode%20.%0A%3FUSnode%20wis%3AhasXcoord%20%3FXcoord_US%20.%0A%3FUSnode%20wis%3AhasYcoord%20%3FYcoord_US%20.%0A%3FURI%20wis%3AhasDownstreamNode%20%3FDSnode%20.%0A%3FDSnode%20wis%3AhasXcoord%20%3FXcoord_DS%20.%0A%3FDSnode%20wis%3AhasYcoord%20%3FYcoord_DS%20.%0A%7D';
	    const pipesDataTywyn = await fetch(pipesEndpointTywyn).then(response => response.json());
	    const pipesDataObjTywyn = pipesDataTywyn.sparql.results.result;

	    const pipesEndpointGower = 'http://131.251.176.109:8082/ontology/gower/select?query=PREFIX%20wis%3A%3Chttp%3A%2F%2Fwww.WISDOM.org%2FWISDOMontology%23%3E%0APREFIX%20rdf%3A%3Chttp%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23%3E%0ASELECT%20%20%3FXcoord_US%20%3FYcoord_US%20%3FXcoord_DS%20%3FYcoord_DS%0AWHERE%20%7B%20%0A%3FURI%20wis%3AhasUpstreamNode%20%3FUSnode%20.%0A%3FUSnode%20wis%3AhasXcoord%20%3FXcoord_US%20.%0A%3FUSnode%20wis%3AhasYcoord%20%3FYcoord_US%20.%0A%3FURI%20wis%3AhasDownstreamNode%20%3FDSnode%20.%0A%3FDSnode%20wis%3AhasXcoord%20%3FXcoord_DS%20.%0A%3FDSnode%20wis%3AhasYcoord%20%3FYcoord_DS%20.%0A%7D';
	    const pipesDataGower = await fetch(pipesEndpointGower).then(response => response.json());
	    const pipesDataObjGower = pipesDataGower.sparql.results.result;

	    var pipesBindingsTywyn = pipesDataObjTywyn
	        .map(it =>
	            [
	                OsGridRef.osGridToLatLon(
	                    new OsGridRef(it.binding[0].literal.content, it.binding[1].literal.content) //Xcoord_US.value, Ycoord_US.value
	                ),
	                OsGridRef.osGridToLatLon(
	                    new OsGridRef(it.binding[2].literal.content, it.binding[3].literal.content) //Xcoord_DS.value, Ycoord_DS.value
	                )
	            ]
	    );

	    var pipesBindingsGower = pipesDataObjGower
	        .map(it =>
	            [
	                OsGridRef.osGridToLatLon(
	                    new OsGridRef(it.binding[0].literal.content, it.binding[1].literal.content) //Xcoord_US.value, Ycoord_US.value
	                ),
	                OsGridRef.osGridToLatLon(
	                    new OsGridRef(it.binding[2].literal.content, it.binding[3].literal.content) //Xcoord_DS.value, Ycoord_DS.value
	                )
	            ]
	    );

	    var pipesBindings = pipesBindingsTywyn.concat(pipesBindingsGower);

		pipes.represent(map, pipesBindingsTywyn);
		pipes.represent(map, pipesBindingsGower);
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