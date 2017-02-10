
/**
* Functions to initialise calls to Google Maps API
*
* Authors: Andrei Hodorog <hodoroga@cardiff.ac.uk>
*
*/

var googleMaps = function(){

    var module = {};

    module.setMapOnAll = function(map, markers) {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(map);
        }
    };

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

            // Draw the static objects
            staticObj.draw(map);

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
                                '?URI wis:hasYcoord ?Ycoord .' + '\n' +
                                '?URI a ?class .',
                queryToSend,
                baseUrl = 'https://cardiff.wisdom-project.eu:8082/ontology/',
                markersDrawn = new Array();

            $('html').on('click', '#filter', function() {
                if(markersDrawn.length) {
                    googleMaps.setMapOnAll(null, markersDrawn);
                }

                queryToSend = queryTemplate + '\n' + '{?URI a wis:' + selectedItems[0] + ' . }';
                for (var i = 1; i < selectedItems.length; i++) {
                    queryToSend += ' UNION {?URI a wis:' + selectedItems[i] + ' . }';
                }

                queryToSend += '\n' + '}';

                var queryToSendCurrent = encode(queryToSend);

                markersDrawn = allObjects.fetchAndDraw(baseUrl + 'gower/select?query=' + queryToSendCurrent, map);
                var markersDrawn2 = allObjects.fetchAndDraw(baseUrl + 'tywyn/select?query=' + queryToSendCurrent, map);
                var markersDrawn3 = allObjects.fetchAndDraw(baseUrl + 'cardiff/select?query=' + queryToSendCurrent, map);

                Array.prototype.push.apply(markersDrawn, markersDrawn2);
                Array.prototype.push.apply(markersDrawn, markersDrawn3);
            });

            $('html').on('click', '#clear', function() {
                console.log(markersDrawn.length);
                if(markersDrawn.length) {
                    googleMaps.setMapOnAll(null, markersDrawn);
                }
            });

        }
        loadScriptAsync(mapsScriptUrl);

    };

    return module;
}();

googleMaps.init();