var allObjects = function() {
	var module = {};

	module.fetch = function(url) {
		const allDataEndpoint = url;
		// const allData = await fetch(allDataEndpoint).then(response => response.json());
		jQuery.extend({
		    getValues: function(url) {
		        var result = null;
		        $.ajax({
		            url: url,
		            type: 'get',
		            dataType: 'json',
		            async: false,
		            success: function(data) {
		                result = data;
		            }
		        });
		       return result;
		    }
		});
		const allData = $.getValues(url);
		const allDataObj = allData.sparql.results.result;

		const allDataBindings = allDataObj
			.map(it =>
					OsGridRef.osGridToLatLon(
	                    new OsGridRef(it.binding[0].literal.content, it.binding[1].literal.content) //Xcoord_US.value, Ycoord_US.value
	                )
		);

		return allDataBindings;
	};

	module.represent = function(map, objData) {
		for (var i = 0; i < objData.length; i++) {
			var marker = new google.maps.Marker({
              position: {lat: objData[i].lat, lng: objData[i].lon},
              lat: objData[i].lat,
              lng: objData[i].lon,
              map: map
            });
		}
	};

	return module;
}();