var graphs = function() {

	var module = {};

	module.init = function() {
		const sensorQueryArray = window.location.search.substr(1).split('&');
		var sensor = {};
		for (var i = 0; i < sensorQueryArray.length; i++) {
			sensor[sensorQueryArray[i].split('=')[0]] = sensorQueryArray[i].split('=')[1];
		}

        // console.log(sensor);

        // Turn metrics querystring in an array
        const metricsArray = sensor['metric'].split(',');

        var metricsPayLoad = '[';

        for (var i = 0; i < metricsArray.length; i++) {
            metricsPayLoad += '{"tags":{"variable":["' + metricsArray[i] + '.' + sensor.name + '"]},"name":"' + metricsArray[i] + '","group_by":[{"name":"tag","tags":["variable"]}],"aggregators":[{"name":"sum","align_sampling":true,"sampling":{"value":"1","unit":"milliseconds"}}]}';

            // If we are not at the last element of the metrics array
            if(i + 1 != metricsArray.length) {
                metricsPayLoad += ',';
            }
        }

        metricsPayLoad += ']';
		var payload = '{"metrics":' + metricsPayLoad + ',"cache_time":0,"start_relative":{"value":"7","unit":"days"}}';
        graphs.fetchGraphData(payload);

        var changePayload = function(payload, value, unit) {
        	var payloadObj = JSON.parse(payload);
        	payloadObj.start_relative.value = value;
        	payloadObj.start_relative.unit = unit;
        	var payloadString = JSON.stringify(payloadObj);
        	return payloadString;
        };

        $('html').on('click', '.change-unit', function() {
        	var value = $(this).data('value');
        	var unit = $(this).data('unit');
        	payload = changePayload(payload, value, unit);
	        graphs.fetchGraphData(payload);
        })
	};

    module.fetchGraphData = function(payload) {
    	const username = 'kairosdb';
        const password = 'wisdom321!';

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
                graphs.drawGraph(data, payload);
            }
        });
    };

	module.drawGraph = function(data, payload) {
    	var showTooltip = function(x, y, contents) {
            $('<div id="tooltip">' + contents + '</div>').css({
                position: 'absolute',
                display: 'none',
                top: y - 40,
                left: x - 120,
                border: '2px solid',
                padding: '3px',
                'font-size': '9px',
                'border-radius': '5px',
                'background-color': '#fff',
                'font-family': 'Verdana, Arial, Helvetica, Tahoma, sans-serif',
                opacity: 0.9
            }).appendTo("body").fadeIn(200);
        };

        function getTimezone(date)
		{
			// Just rips off the timezone string from date's toString method. Probably not the best way to get the timezone.
			var dateString = date.toString();
			var index = dateString.lastIndexOf(" ");
			if (index >= 0)
			{
				return dateString.substring(index);
			}

			return "";
		}

        var previousPoint = null, previousLabel = null;
        $.fn.UseTooltip = function (flotOptions) {
            $(this).bind("plothover", function (event, pos, item) {
                if (item) {
                    if ((previousLabel != item.series.label) || (previousPoint != item.dataIndex)) {
                        previousPoint = item.dataIndex;
                        previousLabel = item.series.label;
                        $("#tooltip").remove();

                        var x = item.datapoint[0];
                        var y = item.datapoint[1].toFixed(2);
						var timestamp = new Date(x);
						var formattedDate = $.plot.formatDate(timestamp, "%b %e, %Y %H:%M:%S.millis %p");
						formattedDate = formattedDate.replace("millis", timestamp.getMilliseconds());
						formattedDate += " " + getTimezone(timestamp);
						var numberFormat = (y % 1 != 0) ? '0,0[.00]' : '0,0';
						showTooltip(item.pageX, item.pageY,
						item.series.label + "<br>" + formattedDate + "<br>" + y);
                    }
                } else {
                    $("#tooltip").remove();
                    previousPoint = null;
                }
            });
        };

        const $chartContainer = $('.graph-container');
        const flotOptions = {
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
            colors: ["#4572a7", "#aa4643", "#89a54e", "#80699b", "#db843d"],
            subtitle: '(Click and drag to zoom)'
        };

        flotOptions.yaxes = [];

        const datasetArray = data.queries;
        // console.log('datasetArray', datasetArray);

        // The dataset to plot on the graph in jqPlot format
        var datasetToPlotArray = [];
        // The dataset colours [feel free to change if appropriate]
        const datasetColours = ['#4572A7', '#AA4643'];

        for (var i = 0; i < datasetArray.length; i++) {
            var datasetCurrent = datasetArray[i].results[0].values;

            if(datasetCurrent.length > 0) {
                datasetToPlotArray.push({
                    label: datasetArray[i].results[0].name,
                    data: datasetCurrent,
                    color: datasetColours[i],
                    points: { fillColor: datasetColours[i], show: true },
                    lines: { show: true }
                });
            }
        }

        $.plot($chartContainer, datasetToPlotArray, flotOptions);
        $chartContainer.UseTooltip(flotOptions);
        $($chartContainer).bind("plotselected", function (event, ranges) {
            // console.log('here');
        	// console.log(flotOptions, ranges);

			var axes = {};
			axes.yaxes = [];

			$.each(ranges, function(key, value) {
				if (key == "xaxis")
				{
					axes.xaxis = {};
					axes.xaxis.min = value.from;
					axes.xaxis.max = value.to;
				}
				else {
					var axis = {};
					axis.min = value.from;
					axis.max = value.to;
					axes.yaxes.push(axis);
				}
			});

			$.plot($chartContainer, datasetToPlotArray, $.extend(true, {}, flotOptions, axes));
			$("#resetZoom").show();
		});

        $("#resetZoom").click(function () {
			$("#resetZoom").hide();
			$.plot($chartContainer, datasetToPlotArray, flotOptions);
		});

        window.onresize = function(event) {
	        $.plot($('.graph-container'), datasetToPlotArray, flotOptions);
	        $('.graph-container').UseTooltip(flotOptions);
        }
    };

	return module;
}();

graphs.init();