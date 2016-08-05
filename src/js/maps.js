var map;

$.ajax({
	type: 'GET',
	url: "http://131.251.176.109:8082/Data/query?query=PREFIX%20wis%3A<http%3A%2F%2Fwww.WISDOM.org%2FWISDOMontology%23>%0APREFIX%20rdf%3A<http%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23>%0ASELECT%20%20%3FXcoord_US%20%3FYcoord_US%20%3FXcoord_DS%20%3FYcoord_DS%0AWHERE%20%7B%20%0A%3FURI%20wis%3AhasUpstreamNode%20%3FUSnode%20.%0A%3FUSnode%20wis%3AhasXcoord%20%3FXcoord_US%20.%0A%3FUSnode%20wis%3AhasYcoord%20%3FYcoord_US%20.%0A%3FURI%20wis%3AhasDownstreamNode%20%3FDSnode%20.%0A%3FDSnode%20wis%3AhasXcoord%20%3FXcoord_DS%20.%0A%3FDSnode%20wis%3AhasYcoord%20%3FYcoord_DS%20.%0A%7D",
	crossDomain: true,
	success: function(data){
		console.log(data);
	}
});

function initMap() {
    var chicago = new google.maps.LatLng(41.850, -87.650);

    var directionsService = new google.maps.DirectionsService();
    var directionsDisplay = new google.maps.DirectionsRenderer();
    var geocoder = new google.maps.Geocoder();

    map = new google.maps.Map(document.getElementById('google-map'), {
        center: chicago,
        zoom: 18
    });

    directionsDisplay.setMap(map);

    var stringToLatLngPlaces = function(str, cb) {
        geocoder.geocode({'address': str}, function(results, status) {
            if (status === 'OK') {
                var place = results[0].geometry.location;
                cb && cb(place);
            }
        });
    }

    stringToLatLngPlaces("chicago", function(start) {
        stringToLatLngPlaces("new york", function(end) {
            var request = {
                origin: start,
                destination: end,
                travelMode: google.maps.TravelMode.DRIVING
            };

            directionsService.route(request, function(result, status) {
                console.log(status, result);
                if (status == google.maps.DirectionsStatus.OK) {
                    directionsDisplay.setDirections(result);
                }
            });

        });
    });

}
