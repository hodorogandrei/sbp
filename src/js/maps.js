
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

            var setMapOnAll = function(map, markers) {
                for (var i = 0; i < markers.length; i++) {
                    markers[i].setMap(map);
                }
            };

            var encode = function(string) {
                return encodeURIComponent(string).replace(/'/g,"%27").replace(/"/g,"%22");
            }

            var selectedItems = [];
            $('html').on('change', '.data-filter', function() {
                selectedItems = [];
                $('.data-filter option:selected').each(function(){ selectedItems.push($(this).data('filter')); });
            });

            $('#selectpicker').multiselect({
                includeSelectAllOption: true,
                enableCaseInsensitiveFiltering: true,
                enableClickableOptGroups: true,
                enableCollapsibleOptGroups: true,
                maxHeight: 300,
                buttonWidth: '90%'
            });

            var queryTemplate = 'PREFIX wis:<http://www.WISDOM.org/WISDOMontology#>' + '\n' +
                                'PREFIX rdf:<http://www.w3.org/1999/02/22-rdf-syntax-ns#>' + '\n' +
                                'SELECT  ?Xcoord ?Ycoord ?class' + '\n' +
                                'WHERE {' + '\n' +
                                '?URI wis:hasXcoord ?Xcoord .' + '\n' +
                                '?URI wis:hasYcoord ?Ycoord .',
                queryToSend,
                rawObj,
                rawObj1 = new Array(),
                rawObj2 = new Array(),
                rawObj3 = new Array(),
                rawObj23 = new Array(),
                markers = new Array(),
                baseUrl = 'http://131.251.176.109:8082/ontology/';

            $('html').on('click', '#filter', function() {
                // console.log(selectedItems);
                queryToSend = queryTemplate + '\n' + '{?URI a wis:' + selectedItems[0] + ' . }';
                for (var i = 1; i < selectedItems.length; i++) {
                    queryToSend += ' UNION {?URI a wis:' + selectedItems[i] + ' . }';
                }

                queryToSend += '\n' + '}';
                queryToSend = encode(queryToSend);

                if(markers.length) {
                    setMapOnAll(null, markers);
                }

                rawObj = allObjects.fetch(baseUrl + 'gower/select?query=' + queryToSend);
                rawObj2 = allObjects.fetch(baseUrl + 'tywyn/select?query=' + queryToSend);
                rawObj3 = allObjects.fetch(baseUrl + 'cardiff/select?query=' + queryToSend);

                // console.log(rawObj2);
                Array.prototype.push.apply(rawObj, rawObj2);
                // console.log('rawObj', rawObj);
                Array.prototype.push.apply(rawObj, rawObj3);

                markers = new Array();
                for (var i = 0; i < rawObj.length; i++) {
                    var marker = new google.maps.Marker({
                      position: {lat: rawObj[i].lat, lng: rawObj[i].lon},
                      lat: rawObj[i].lat,
                      lng: rawObj[i].lon
                    });
                    markers.push(marker);
                }
                setMapOnAll(map, markers);
            });

        }
        loadScriptAsync(mapsScriptUrl);

    };

    return module;
}();

googleMaps.init();