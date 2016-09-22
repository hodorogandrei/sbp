
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

        var drawAll = function(map) {
            // Draw the pipes
            pipes.draw(map);

            // Draw the sensors
            sensors.draw(map);

            // Draw all objects for Tywyn
            allObjects.draw(map, 'http://131.251.176.109:8082/ontology/tywyn/select?query=%20PREFIX%20wis%3A%3Chttp%3A%2F%2Fwww.WISDOM.org%2FWISDOMontology%23%3E%0APREFIX%20rdf%3A%3Chttp%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23%3E%0ASELECT%20%20%3FXcoord%20%3FYcoord%20%3Fclass%0AWHERE%20%7B%20%0A%3FURI%20wis%3AhasXcoord%20%3FXcoord%20.%0A%3FURI%20wis%3AhasYcoord%20%3FYcoord%20.%0A%3FURI%20a%20%3Fclass%20.%0A%7D');

            // Draw all objects for Gower
            allObjects.draw(map, 'http://131.251.176.109:8082/ontology/gower/select?query=%20PREFIX%20wis%3A%3Chttp%3A%2F%2Fwww.WISDOM.org%2FWISDOMontology%23%3E%0APREFIX%20rdf%3A%3Chttp%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23%3E%0ASELECT%20%20%3FXcoord%20%3FYcoord%20%3Fclass%0AWHERE%20%7B%20%0A%3FURI%20wis%3AhasXcoord%20%3FXcoord%20.%0A%3FURI%20wis%3AhasYcoord%20%3FYcoord%20.%0A%3FURI%20a%20%3Fclass%20.%0A%7D');
        }

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

            drawAll(map);
        }
        loadScriptAsync(mapsScriptUrl);

        $('html').on('click', '#show-all', function() {
            console.log('test');
        });
    };

    return module;
}();

googleMaps.init();