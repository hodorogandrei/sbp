
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
        }
        loadScriptAsync(mapsScriptUrl);
    };

    return module;
}();

googleMaps.init();