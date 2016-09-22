
/**
* Functions to initialise calls to Google Maps API
*
* Authors: Andrei Hodorog <hodoroga@cardiff.ac.uk>
*
*/

var googleMaps = function(){

    var module = {};

    module.init = function() {
        const mapsScriptUrl = "https://maps.googleapis.com/maps/api/js?v=3&sensor=true&key=AIzaSyBwC-BzmC2WQwxqWjqCl0ROiloWG68UUVs&callback=initMap";

        window.initMap = async function() {
            const geocoder = new google.maps.Geocoder();

            // Will get the LatLng object for a string
            const stringToLatLngPlaces = function(str) {
                return new Promise((accept, reject) =>
                    geocoder.geocode({'address': str}, function(results, status) {
                        if (status === 'OK') {
                            return accept(results[0].geometry.location);
                        }
                        return reject(status);
                    })
                );
            }

            const center = await stringToLatLngPlaces("cardiff");
            const map = new google.maps.Map(document.getElementById('google-map'), {
                center: center,
                zoom: 13
            });

            // Draw the pipes
            pipes.draw(map);

            // Draw the sensors
            sensors.draw(map);

            function setMapOnAll(map, markers) {
                for (var i = 0; i < markers.length; i++) {
                    markers[i].setMap(map);
                }
            }

            // Draw all objects for Tywyn
            var tywynObj = allObjects.fetch('http://131.251.176.109:8082/ontology/tywyn/select?query=%20PREFIX%20wis%3A%3Chttp%3A%2F%2Fwww.WISDOM.org%2FWISDOMontology%23%3E%0APREFIX%20rdf%3A%3Chttp%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23%3E%0ASELECT%20%20%3FXcoord%20%3FYcoord%20%3Fclass%0AWHERE%20%7B%20%0A%3FURI%20wis%3AhasXcoord%20%3FXcoord%20.%0A%3FURI%20wis%3AhasYcoord%20%3FYcoord%20.%0A%3FURI%20a%20%3Fclass%20.%0A%7D');
            var tywynMarkers = [];
            for (var i = 0; i < tywynObj.length; i++) {
                var marker = new google.maps.Marker({
                  position: {lat: tywynObj[i].lat, lng: tywynObj[i].lon},
                  lat: tywynObj[i].lat,
                  lng: tywynObj[i].lon
                });
                tywynMarkers.push(marker);
            }
            setMapOnAll(map, tywynMarkers);

            // Draw water objects for Tywyn
            var tywynWaterObj = allObjects.fetch('http://131.251.176.109:8082/ontology/tywyn/select?query=PREFIX%20wis%3A%3Chttp%3A%2F%2Fwww.WISDOM.org%2FWISDOMontology%23%3E%0APREFIX%20rdf%3A%3Chttp%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23%3E%0ASELECT%20%20%3FXcoord%20%3FYcoord%20%3Fclass%0AWHERE%20%7B%20%0A%3FURI%20wis%3AhasXcoord%20%3FXcoord%20.%0A%3FURI%20wis%3AhasYcoord%20%3FYcoord%20.%0A%3FURI%20a%20wis%3AWaterMeter%20.%0A%7D');
            var tywynWaterMarkers = [];
            for (var i = 0; i < tywynWaterObj.length; i++) {
                var marker = new google.maps.Marker({
                  position: {lat: tywynWaterObj[i].lat, lng: tywynWaterObj[i].lon},
                  lat: tywynWaterObj[i].lat,
                  lng: tywynWaterObj[i].lon
                });
                tywynWaterMarkers.push(marker);
            }

            // Draw all objects for Gower
            var gowerObj = allObjects.fetch('http://131.251.176.109:8082/ontology/gower/select?query=%20PREFIX%20wis%3A%3Chttp%3A%2F%2Fwww.WISDOM.org%2FWISDOMontology%23%3E%0APREFIX%20rdf%3A%3Chttp%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23%3E%0ASELECT%20%20%3FXcoord%20%3FYcoord%20%3Fclass%0AWHERE%20%7B%20%0A%3FURI%20wis%3AhasXcoord%20%3FXcoord%20.%0A%3FURI%20wis%3AhasYcoord%20%3FYcoord%20.%0A%3FURI%20a%20%3Fclass%20.%0A%7D');
            var gowerMarkers = [];
            for (var i = 0; i < gowerObj.length; i++) {
                var marker = new google.maps.Marker({
                  position: {lat: gowerObj[i].lat, lng: gowerObj[i].lon},
                  lat: gowerObj[i].lat,
                  lng: gowerObj[i].lon
                });
                gowerMarkers.push(marker);
            }
            setMapOnAll(map, gowerMarkers);

            $('html').on('click', '#show-all', function() {
                setMapOnAll(null, tywynWaterMarkers);
                setMapOnAll(map, tywynMarkers);
                setMapOnAll(map, gowerMarkers);
            });

            $('html').on('click', '#water-meter', function() {
                setMapOnAll(null, tywynMarkers);
                setMapOnAll(null, gowerMarkers);
                setMapOnAll(map, tywynWaterMarkers);
            });
        }
        loadScriptAsync(mapsScriptUrl);

    };

    return module;
}();

googleMaps.init();