var sensors = function() {
	var module = {};

	module.process = function() {
		const sensorsNameLocOS =   [{'name': 'Twywn.PenYBont_WTW'      , 'loc': 'SH 61515 03060', 'variables': ['pressure', 'flow']},
                                    {'name': 'Twywn.Escuan_SRV'        , 'loc': 'SN 60903 96084', 'variables': ['pressure', 'flow']},
                                    {'name': 'Twywn.Mynydd_Bychan_WPS' , 'loc': 'SN 61354 96776', 'variables': ['pressure', 'flow']},
                                    {'name': 'Twywn.Gwelfor_Road_WPS ' , 'loc': 'SN 60903 96084', 'variables': ['pressure', 'flow']},
                                    {'name': 'Twywn.Escuan'            , 'loc': 'SN 59572 99623', 'variables': ['pressure', 'flow']},
                                    {'name': 'Cardiff.Paget_Street'    , 'loc': 'ST 17697 75215', 'variables': ['pressure', 'flow']},
                                    {'name': 'Cardiff.Clive_Street.02' , 'loc': 'ST 17523 75040', 'variables': ['pressure', 'flow']},
                                    {'name': 'Cardiff.Clare_Road'      , 'loc': 'ST 17663 75652', 'variables': ['pressure', 'flow']},
                                    {'name': 'Cardiff.Clive_Street.01' , 'loc': 'ST 17529 75043', 'variables': ['pressure', 'flow']},
                                    {'name': 'Cardiff.Court_Road'      , 'loc': 'ST 17625 75818', 'variables': ['pressure', 'flow']},
                                    {'name': 'Cardiff.Corporation_Road', 'loc': 'ST 17726 75210', 'variables': ['pressure', 'flow']},
                                    {'name': 'Cardiff.Cornwall_Street' , 'loc': 'ST 17644 75803', 'variables': ['pressure', 'flow']}
                                ],
            sensorsNameLatLng = [];

        for (var i = 0; i < sensorsNameLocOS.length; i++) {
            sensorsNameLatLng[i] = {};
            sensorsNameLatLng[i].loc = OsGridRef.osGridToLatLon(OsGridRef.parse(sensorsNameLocOS[i].loc));
            sensorsNameLatLng[i].name = sensorsNameLocOS[i].name;
        }

		return sensorsNameLatLng;
	};

	module.draw = function(map) {
        // Sensors object

        const sensorsNameLatLng = sensors.process();

        for (var i = 0; i < sensorsNameLatLng.length; i++) {
            // Marker for current sensor
            var marker = new google.maps.Marker({
              position: {lat: sensorsNameLatLng[i].loc.lat, lng: sensorsNameLatLng[i].loc.lon},
              map: map,
              title: sensorsNameLatLng[i].name
            });

            var infowindow = new google.maps.InfoWindow();
            google.maps.event.addListener(marker, 'click', function() {
                infowindow.setContent(this.title);
                infowindow.open(map,this);

                var thisTitle = this.title;
                var payload = '{"metrics":[{"tags":{"variable":["flow.' + thisTitle + '"]},"name":"flow","aggregators":[{"name":"sum","align_sampling":true,"sampling":{"value":"1","unit":"milliseconds"}}]}],"cache_time":0,"start_relative":{"value":"1","unit":"days"}}';
                console.log(payload);
                const username = 'kairosdb';
                const password = 'wisdom321!';

                var showTooltip = function(x, y, color, contents) {
                    $('<div id="tooltip">' + contents + '</div>').css({
                        position: 'absolute',
                        display: 'none',
                        top: y - 40,
                        left: x - 120,
                        border: '2px solid ' + color,
                        padding: '3px',
                        'font-size': '9px',
                        'border-radius': '5px',
                        'background-color': '#fff',
                        'font-family': 'Verdana, Arial, Helvetica, Tahoma, sans-serif',
                        opacity: 0.9
                    }).appendTo("body").fadeIn(200);
                };

                var previousPoint = null, previousLabel = null;
                $.fn.UseTooltip = function () {
                    $(this).bind("plothover", function (event, pos, item) {
                        if (item) {
                            if ((previousLabel != item.series.label) || (previousPoint != item.dataIndex)) {
                                previousPoint = item.dataIndex;
                                previousLabel = item.series.label;
                                $("#tooltip").remove();

                                var x = item.datapoint[0];
                                var y = item.datapoint[1];
                                var date = new Date(x);
                                var color = item.series.color;

                                showTooltip(item.pageX, item.pageY, color,
                                            "<strong>" + item.series.label + "</strong><br>"  +
                                            (date.getMonth() + 1) + "/" + date.getDate() +
                                            " : <strong>" + y + "</strong> (USD/oz)");
                            }
                        } else {
                            $("#tooltip").remove();
                            previousPoint = null;
                        }
                    });
                };

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
                        var flotOptions = {
                            series: {
                                lines: {
                                    show: true
                                },
                                points: {
                                    show: true
                                }
                            },
                            grid: {
                                hoverable: true
                            },
                            selection: {
                                mode: "xy"
                            },
                            xaxis: {
                                mode: "time",
                                timezone: "browser"
                            },
                            colors: ["#4572a7", "#aa4643", "#89a54e", "#80699b", "#db843d"]
                        };
                        var dataset2 = [
                            {
                                label: 'Test',
                                data: dataset,
                                color: '#FF0000',
                                points: { fillColor: "#FF0000", show: true },
                                lines: { show: true }
                            }
                        ];
                        console.log(dataset);
                        $.plot($('.result'), dataset2, flotOptions);
                        $('.result').UseTooltip();
                    }
                });
            });
        }
    };

	return module;
}();