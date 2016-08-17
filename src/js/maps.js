
const mapsScriptUrl = "https://maps.googleapis.com/maps/api/js?key=AIzaSyBwC-BzmC2WQwxqWjqCl0ROiloWG68UUVs&callback=initMap";
const endpoint = "http://131.251.176.109:8082/Data/query?query=PREFIX%20wis%3A<http%3A%2F%2Fwww.WISDOM.org%2FWISDOMontology%23>%0APREFIX%20rdf%3A<http%3A%2F%2Fwww.w3.org%2F1999%2F02%2F22-rdf-syntax-ns%23>%0ASELECT%20%20%3FXcoord_US%20%3FYcoord_US%20%3FXcoord_DS%20%3FYcoord_DS%0AWHERE%20%7B%20%0A%3FURI%20wis%3AhasUpstreamNode%20%3FUSnode%20.%0A%3FUSnode%20wis%3AhasXcoord%20%3FXcoord_US%20.%0A%3FUSnode%20wis%3AhasYcoord%20%3FYcoord_US%20.%0A%3FURI%20wis%3AhasDownstreamNode%20%3FDSnode%20.%0A%3FDSnode%20wis%3AhasXcoord%20%3FXcoord_DS%20.%0A%3FDSnode%20wis%3AhasYcoord%20%3FYcoord_DS%20.%0A%7D";
const randomColorChannel = () => parseInt(Math.random() * 256).toString(16);
const randomColor = () => `#${randomColorChannel()}${randomColorChannel()}${randomColorChannel()}`;

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

    const data = await fetch(endpoint).then(response => response.json());

    const bindings = data.results.bindings
        .map(it =>
            [
                OsGridRef.osGridToLatLon(
                    new OsGridRef(it.Xcoord_US.value, it.Ycoord_US.value)
                ),
                OsGridRef.osGridToLatLon(
                    new OsGridRef(it.Xcoord_DS.value, it.Ycoord_DS.value)
                )
            ]
    )


    let mapBounds = new google.maps.LatLngBounds();
    const lines = [];
    bindings.map(it => {
        const pointX = new google.maps.LatLng(it[0].lat, it[0].lon);
        const pointY = new google.maps.LatLng(it[1].lat, it[1].lon);

        mapBounds.extend(pointX);
        mapBounds.extend(pointY);

        const line = new google.maps.Polyline({
            path: [pointX, pointY],
            strokeColor: randomColor()
        });
        lines.push(line);

        line.setMap(map);

    });

    // Draw the sensors

    // Sensors object
    const sensorsNameLocOS =   [{'name': 'Twywn.PenYBont_WTW'      , 'loc': 'SH 61515 03060'},
                                {'name': 'Twywn.Escuan_SRV'        , 'loc': 'SN 60903 96084'},
                                {'name': 'Twywn.Mynydd_Bychan_WPS' , 'loc': 'SN 61354 96776'},
                                {'name': 'Twywn.Gwelfor_Road_WPS ' , 'loc': 'SN 60903 96084'},
                                {'name': 'Twywn.Escuan'            , 'loc': 'SN 59572 99623'},
                                {'name': 'Cardiff.Paget_Street'    , 'loc': 'ST 17697 75215'},
                                {'name': 'Cardiff.Clive_Street.02' , 'loc': 'ST 17523 75040'},
                                {'name': 'Cardiff.Clare_Road'      , 'loc': 'ST 17663 75652'},
                                {'name': 'Cardiff.Clive_Street.01' , 'loc': 'ST 17529 75043'},
                                {'name': 'Cardiff.Court_Road'      , 'loc': 'ST 17625 75818'},
                                {'name': 'Cardiff.Corporation_Road', 'loc': 'ST 17726 75210'},
                                {'name': 'Cardiff.Cornwall_Street' , 'loc': 'ST 17644 75803'}
                            ],
        sensorsNameLatLng = [];
    for (var i = 0; i < sensorsNameLocOS.length; i++) {
        sensorsNameLatLng[i] = {};
        sensorsNameLatLng[i].loc = OsGridRef.osGridToLatLon(OsGridRef.parse(sensorsNameLocOS[i].loc));
        sensorsNameLatLng[i].name = sensorsNameLocOS[i].name;
    }

    console.log(sensorsNameLatLng);

    var infowindow = new google.maps.InfoWindow();
    for (var i = 0; i < sensorsNameLatLng.length; i++) {
        // Marker for current sensor
        var marker = new google.maps.Marker({
          position: {lat: sensorsNameLatLng[i].loc.lat, lng: sensorsNameLatLng[i].loc.lon},
          map: map,
          title: sensorsNameLatLng[i].name
        });

        google.maps.event.addListener(marker, 'click', function() {
            infowindow.setContent(this.title);
            infowindow.open(map,this);

            var thisTitle = this.title;
            var payload = '{"metrics":[{"tags":{"variable":["flow.' + thisTitle + '"]},"name":"flow","aggregators":[{"name":"sum","align_sampling":true,"sampling":{"value":"1","unit":"milliseconds"}}]}],"cache_time":0,"start_relative":{"value":"1","unit":"days"}}';
            console.log(payload);
            // const hash = btoa(':wisdom321!');
            const username = 'kairosdb';
            const password = 'wisdom321!';
            // var data2 = await fetch(`https://eventserver.doc.ic.ac.uk/api/v1/datapoints/query`, { method: 'post', headers: { 'Authorization': `Basic ${hash}`, 'Content-Type': 'application/x-www-form-urlencoded' }, 'body': payload }).then(response => response.json());
            $.ajax({
                type: 'POST',
                url: 'https://eventserver.doc.ic.ac.uk/api/v1/datapoints/query',
                dataType: 'json',
                contentType: 'application/json; charset=utf-8',
                async: false,
                data: payload,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader ('Authorization', 'Basic ' + btoa(username + ':' + password));
                },
                success: function (data){
                    console.log(data);
                    // $('.result').html(JSON.stringify(data.queries[0].results[0].values));
                    var dataset = data.queries[0].results[0].values;
                    var dataset2 = [
                        {
                            label: 'Test',
                            data: dataset,
                            color: "#FF0000",
                            points: { fillColor: "#FF0000", show: true },
                            lines: { show: true }
                        }
                    ];
                    console.log(dataset);
                    $.plot($('.result'), dataset2);
                }
            });
        });
    }

    const larg = 2;
    google.maps.event.addListener(map, "zoom_changed", () => {
        const zoom = map.getZoom() * larg / 17;
        lines.forEach(line => line.setOptions({ strokeWeight: zoom }));
    })

    map.fitBounds(mapBounds);

}

loadScriptAsync(mapsScriptUrl);
