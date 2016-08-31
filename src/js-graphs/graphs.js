var graphs = function() {

	var module = {};

	module.init = function() {
		const sensorQueryArray = window.location.search.substr(1).split('=');
		const sensorName = sensorQueryArray[1];

		var payload = '{"metrics":[{"tags":{"variable":["flow.' + sensorName + '"]},"name":"flow","aggregators":[{"name":"sum","align_sampling":true,"sampling":{"value":"1","unit":"milliseconds"}}]}],"cache_time":0,"start_relative":{"value":"5","unit":"days"}}';
        graphs.fetchData(payload);
	};

    module.fetchData = function(payload) {
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
        var payloadObj = JSON.parse(payload);
        var dataset2 = [
            {
                label: payloadObj.metrics[0].name,
                data: dataset,
                color: '#FF0000',
                points: { fillColor: "#FF0000", show: true },
                lines: { show: true }
            }
        ];

        $.plot($('.graph-container'), dataset2, flotOptions);
        $('.graph-container').UseTooltip();

        window.onresize = function(event) {
	        $.plot($('.graph-container'), dataset2, flotOptions);
	        $('.graph-container').UseTooltip();
        }
    };

	return module;
}();

graphs.init();