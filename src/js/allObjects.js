var allObjects = function() {
	var module = {};

	module.fetch = function(url) {
		const allDataEndpoint = url;
		// console.log(url);
		// const allData = await fetch(allDataEndpoint).then(response => response.json());
		oboe(url).node('results.*', function(result) {
			console.log(result);
		});
		// jQuery.extend({
		//     getValues: function(url) {
		//         var result = null;
		//         $.ajax({
		//             url: url,
		//             type: 'get',
		//             dataType: 'json',
		//             async: false,
		//             success: function(data) {
		//                 result = data;
		//             }
		//         });
		//        return result;
		//     }
		// });
		// const allData = $.getValues(url);
		// if(allData) {
		// 	const allDataObj = allData.results;

		// 	const allDataBindings = allDataObj
		// 		.map(it =>
		// 				OsGridRef.osGridToLatLon(
		//                     new OsGridRef(it.Xcoord, it.Ycoord) //Xcoord_US.value, Ycoord_US.value
		//                 )
		// 	);

		// 	return allDataBindings;
		// }

		// const emptyArray = new Array();
		// return emptyArray;
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