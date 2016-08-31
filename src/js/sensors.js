var sensors = function() {
	var module = {};

	module.process = function() {
		const sensorsNameLocOS =   [{'name': 'Twywn.PenYBont_WTW'      , 'loc': 'SH 61515 03060', 'metrics': ['pressure', 'flow']},
                                    {'name': 'Twywn.Escuan_SRV'        , 'loc': 'SN 60903 96084', 'metrics': ['pressure', 'flow']},
                                    {'name': 'Twywn.Mynydd_Bychan_WPS' , 'loc': 'SN 61354 96776', 'metrics': ['pressure', 'flow']},
                                    {'name': 'Twywn.Gwelfor_Road_WPS ' , 'loc': 'SN 60903 96084', 'metrics': ['pressure', 'flow']},
                                    {'name': 'Twywn.Escuan'            , 'loc': 'SN 59572 99623', 'metrics': ['pressure', 'flow']},
                                    {'name': 'Cardiff.Paget_Street'    , 'loc': 'ST 17697 75215', 'metrics': ['pressure', 'flow']},
                                    {'name': 'Cardiff.Clive_Street.02' , 'loc': 'ST 17523 75040', 'metrics': ['pressure', 'flow']},
                                    {'name': 'Cardiff.Clare_Road'      , 'loc': 'ST 17663 75652', 'metrics': ['pressure', 'flow']},
                                    {'name': 'Cardiff.Clive_Street.01' , 'loc': 'ST 17529 75043', 'metrics': ['pressure', 'flow']},
                                    {'name': 'Cardiff.Court_Road'      , 'loc': 'ST 17625 75818', 'metrics': ['pressure', 'flow']},
                                    {'name': 'Cardiff.Corporation_Road', 'loc': 'ST 17726 75210', 'metrics': ['pressure', 'flow']},
                                    {'name': 'Cardiff.Hillside_WPS'	   , 'loc': 'SH 59028 00907', 'metrics': ['pressure', 'flow']},
                                    {'name': 'Cardiff.Maengwyn'		   , 'loc': 'SN 61561 96330', 'metrics': ['pressure', 'flow']},
                                    {'name': 'Cardiff.Cornwall_Street' , 'loc': 'ST 17644 75803', 'metrics': ['pressure', 'flow']}
                                ],
            sensorsNameLatLng = [];

        for (var i = 0; i < sensorsNameLocOS.length; i++) {
            sensorsNameLatLng.push({
            	'loc': OsGridRef.osGridToLatLon(OsGridRef.parse(sensorsNameLocOS[i].loc)),
            	'name': sensorsNameLocOS[i].name,
            	'metrics': sensorsNameLocOS[i].metrics
            });
        }

        const sensorNameXY = [{'name': 'Gowerton.Brynymor_Road.1'   	, 'Xcoord': '258680', 'Ycoord':'196383', 'metrics': ['level']},
        					  {'name': 'Gowerton.Bach_Y_Gweiddyn'    	, 'Xcoord': '260676', 'Ycoord':'200171', 'metrics': ['level']},
        					  {'name': 'Gowerton.Benson_Road'        	, 'Xcoord': '254583', 'Ycoord':'195744', 'metrics': ['level']},
        					  {'name': 'Gowerton.Blaenymaes_Drive'   	, 'Xcoord': '263181', 'Ycoord':'196959', 'metrics': ['level']},
        					  {'name': 'Gowerton.Brithwen_Road'      	, 'Xcoord': '259876', 'Ycoord':'195606', 'metrics': ['level']},
        					  {'name': 'Gowerton.Brynymor_Road.2'    	, 'Xcoord': '258680', 'Ycoord':'196383', 'metrics': ['level']},
        					  {'name': 'Gowerton.Brynymor_Road.3'    	, 'Xcoord': '258680', 'Ycoord':'196383', 'metrics': ['level']},
        					  {'name': 'Gowerton.Brynteg_Road'       	, 'Xcoord': '258982', 'Ycoord':'199122', 'metrics': ['level']},
        					  {'name': 'Gowerton.Bwrw_Road'     	 	, 'Xcoord': '256871', 'Ycoord':'198067', 'metrics': ['level']},
        					  {'name': 'Gowerton.Cadle_Common'       	, 'Xcoord': '262705', 'Ycoord':'196940', 'metrics': ['level']},
        					  {'name': 'Gowerton.Cadle_Mill'   		 	, 'Xcoord': '262391', 'Ycoord':'197065', 'metrics': ['level']},
        					  {'name': 'Gowerton.Cadle_Wood'   	     	, 'Xcoord': '263303', 'Ycoord':'196732', 'metrics': ['level']},
        					  {'name': 'Gowerton.Carmarthen_Road'    	, 'Xcoord': '261819', 'Ycoord':'196610', 'metrics': ['level']},
        					  {'name': 'Gowerton.Cranmer_Court'   	 	, 'Xcoord': '263030', 'Ycoord':'196293', 'metrics': ['level']},
        					  {'name': 'Gowerton.Culfor_Road'   	 	, 'Xcoord': '257285', 'Ycoord':'197665', 'metrics': ['level']},
        					  {'name': 'Gowerton.Cwmbach_Road'   	 	, 'Xcoord': '262616', 'Ycoord':'195190', 'metrics': ['level']},
        					  {'name': 'Gowerton.Ddol_Road.1'   	 	, 'Xcoord': '258661', 'Ycoord':'193315', 'metrics': ['level']},
        					  {'name': 'Gowerton.Ddol_Road.2'     	 	, 'Xcoord': '258657', 'Ycoord':'193320', 'metrics': ['level']},
        					  {'name': 'Gowerton.Fford_Y_Brain'   	 	, 'Xcoord': '263187', 'Ycoord':'196162', 'metrics': ['level']},
        					  {'name': 'Gowerton.Glebe_Road'   		 	, 'Xcoord': '257279', 'Ycoord':'198199', 'metrics': ['level']},
        					  {'name': 'Gowerton.Gors_Road'    		 	, 'Xcoord': '261243', 'Ycoord':'198897', 'metrics': ['level']},
        					  {'name': 'Gowerton.Gorseinon_Factory'  	, 'Xcoord': '260420', 'Ycoord':'198490', 'metrics': ['level']},
        					  {'name': 'Gowerton.Gorseinon_Road.1'   	, 'Xcoord': '261122', 'Ycoord':'198728', 'metrics': ['level']},
        					  {'name': 'Gowerton.Gorseinon_Road.2'   	, 'Xcoord': '261122', 'Ycoord':'198728', 'metrics': ['level']},
        					  {'name': 'Gowerton.Gorseinon_Road.3'   	, 'Xcoord': '261122', 'Ycoord':'198728', 'metrics': ['level']},
        					  {'name': 'Gowerton.Gowerton_Road'   	 	, 'Xcoord': '255026', 'Ycoord':'195892', 'metrics': ['level']},
        					  {'name': 'Gowerton.Grovesend'   		 	, 'Xcoord': '260524', 'Ycoord':'200079', 'metrics': ['level']},
        					  {'name': 'Gowerton.Gwalia_Close'   	 	, 'Xcoord': '259877', 'Ycoord':'198654', 'metrics': ['level']},
        					  {'name': 'Gowerton.Hen_Parc_Lane'   	 	, 'Xcoord': '259140', 'Ycoord':'192235', 'metrics': ['level']},
        					  {'name': 'Gowerton.Home_Farm_Way'   	 	, 'Xcoord': '262853', 'Ycoord':'198494', 'metrics': ['level']},
        					  {'name': 'Gowerton.Joiners_Road'   	 	, 'Xcoord': '256807', 'Ycoord':'194369', 'metrics': ['level']},
        					  {'name': 'Gowerton.Kingsway'   		 	, 'Xcoord': '262217', 'Ycoord':'196041', 'metrics': ['level']},
        					  {'name': 'Gowerton.Libanus_Road'   		, 'Xcoord': '259117', 'Ycoord':'198253', 'metrics': ['level']},
        					  {'name': 'Gowerton.Mynyedd_Newydd_Road'   , 'Xcoord': '263757', 'Ycoord':'196137', 'metrics': ['level']},
        					  {'name': 'Gowerton.Penycwm'   			, 'Xcoord': '262758', 'Ycoord':'194564', 'metrics': ['level']},
        					  {'name': 'Gowerton.Pont_Y_Cob_Road.1'   	, 'Xcoord': '258049', 'Ycoord':'196697', 'metrics': ['level']},
        					  {'name': 'Gowerton.Pont_Y_Cob_Road.2'   	, 'Xcoord': '258049', 'Ycoord':'196697', 'metrics': ['level']},
        					  {'name': 'Gowerton.Seaview_Tce'   		, 'Xcoord': '254502', 'Ycoord':'195885', 'metrics': ['level']},
        					  {'name': 'Gowerton.Swansea_Road'   		, 'Xcoord': '261023', 'Ycoord':'201097', 'metrics': ['level']},
        					  {'name': 'Gowerton.The_Forge'   			, 'Xcoord': '254569', 'Ycoord':'195753', 'metrics': ['level']},
        					  {'name': 'Gowerton.Tirmynydd_Road'   		, 'Xcoord': '256942', 'Ycoord':'193707', 'metrics': ['level']},
        					  {'name': 'Gowerton.Waun_Road.1'   		, 'Xcoord': '258053', 'Ycoord':'197260', 'metrics': ['level']},
        					  {'name': 'Gowerton.Waun_Road.2'   		, 'Xcoord': '258053', 'Ycoord':'197260', 'metrics': ['level']},
        					  {'name': 'Gowerton.West_Street'   		, 'Xcoord': '258939', 'Ycoord':'198376', 'metrics': ['level']},
        					  {'name': 'Gowerton.Woodford_Road'   		, 'Xcoord': '262908', 'Ycoord':'197110', 'metrics': ['level']},
        					  {'name': 'Gowerton.Quay_Road.Outlet'   	, 'Xcoord': '259399', 'Ycoord':'194817', 'metrics': ['flow']},
        					  {'name': 'Gowerton.Quay_Road.Screw_Sump'  , 'Xcoord': '259399', 'Ycoord':'194817', 'metrics': ['level']},
        					  {'name': 'Gowerton.Quay_Road.Treatment'   , 'Xcoord': '259399', 'Ycoord':'194817', 'metrics': ['flow']},
        					  {'name': 'Gowerton.Cefn_Draw'   			, 'Xcoord': '256597', 'Ycoord':'194140', 'metrics': ['level']},
        					  {'name': 'Gowerton.Cefn_Stylle'   		, 'Xcoord': '257385', 'Ycoord':'196582', 'metrics': ['level']},
        					  {'name': 'Gowerton.Cefn_Stylle'   		, 'Xcoord': '257385', 'Ycoord':'196582', 'metrics': ['flow']},
        					  {'name': 'Gowerton.Cuckoo_Mill'   		, 'Xcoord': '263937', 'Ycoord':'199267', 'metrics': ['level']},
        					  {'name': 'Gowerton.Cwmlladran'   			, 'Xcoord': '260189', 'Ycoord':'197337', 'metrics': ['level']},
        					  {'name': 'Gowerton.Fairwood_Terrace'   	, 'Xcoord': '258963', 'Ycoord':'196683', 'metrics': ['level']},
        					  {'name': 'Gowerton.Garrod_Road'   		, 'Xcoord': '259399', 'Ycoord':'194817', 'metrics': ['level']},
        					  {'name': 'Gowerton.Glanymore_Park'   		, 'Xcoord': '259399', 'Ycoord':'194817', 'metrics': ['level']},
        					  {'name': 'Gowerton'   					, 'Xcoord': '259521', 'Ycoord':'196905', 'metrics': ['level']},
        					  {'name': 'Gowerton.Gowerton_Road'   		, 'Xcoord': '257437', 'Ycoord':'194586', 'metrics': ['level']},
        					  {'name': 'Gowerton.Gwynefe_Road'   		, 'Xcoord': '257186', 'Ycoord':'198703', 'metrics': ['level']},
        					  {'name': 'Gowerton.Henparc_Lane'   		, 'Xcoord': '259132', 'Ycoord':'192233', 'metrics': ['level']},
        					  {'name': 'Gowerton.Killay'   				, 'Xcoord': '259876', 'Ycoord':'192391', 'metrics': ['level']},
        					  {'name': 'Gowerton.Pencladwdd'   			, 'Xcoord': '254594', 'Ycoord':'195915', 'metrics': ['level']},
        					  {'name': 'Gowerton.Tir_Coed'   			, 'Xcoord': '261894', 'Ycoord':'199997', 'metrics': ['level']},
        					  {'name': 'Gowerton.Tircoed_Forest_Village', 'Xcoord': '261744', 'Ycoord':'200122', 'metrics': ['level']},
        					  {'name': 'Gowerton.Cefn_Stylle.Outlet'   	, 'Xcoord': '257385', 'Ycoord':'196582', 'metrics': ['flow']},
        					  {'name': 'Gowerton.Cuckoo_Mill.Outlet'   	, 'Xcoord': '263937', 'Ycoord':'199267', 'metrics': ['flow']},
        					  {'name': 'Gowerton.Elba_Site.Outlet'   	, 'Xcoord': '258538', 'Ycoord':'196886', 'metrics': ['flow']},
        					  {'name': 'Gowerton.Storm'   				, 'Xcoord': '259521', 'Ycoord':'196905', 'metrics': ['flow']},
        					  {'name': 'Gowerton.SWK.Storm_Sump'   		, 'Xcoord': '259521', 'Ycoord':'196905', 'metrics': ['level']},
        					  {'name': 'Gowerton.SWK'   				, 'Xcoord': '259521', 'Ycoord':'196905', 'metrics': ['total']},
        					  {'name': 'Gowerton.Killay'   				, 'Xcoord': '259521', 'Ycoord':'196905', 'metrics': ['spill']},
        					  {'name': 'Gowerton.Killay.Outlet'   		, 'Xcoord': '259521', 'Ycoord':'196905', 'metrics': ['flow']},
        					  {'name': 'Gowerton.Crofty'   				, 'Xcoord': '259521', 'Ycoord':'196905', 'metrics': ['flow']},
        					  {'name': 'Gowerton.Rhosog.1'   			, 'Xcoord': '257219', 'Ycoord':'197596', 'metrics': ['flow']},
        					  {'name': 'Gowerton.Rhosog.2'   			, 'Xcoord': '257219', 'Ycoord':'197596', 'metrics': ['flow']},
        					  {'name': 'Gowerton.Rhosog.3'   			, 'Xcoord': '257219', 'Ycoord':'197596', 'metrics': ['flow']},
        					  {'name': 'Gowerton.Rhosog'   				, 'Xcoord': '257219', 'Ycoord':'197596', 'metrics': ['level']}
        ];

        console.log('sensorNameXY', sensorNameXY);

        for (var i = 0; i < sensorNameXY.length; i++) {
        	sensorsNameLatLng.push({
        		'loc': OsGridRef.osGridToLatLon(
	                    new OsGridRef(sensorNameXY[i].Xcoord, sensorNameXY[i].Ycoord)
	                   ),
        		'name': sensorNameXY[i].name,
        		'metrics': sensorNameXY[i].metrics
        	});
       	};

       	console.log('sensorsNameLatLng', sensorsNameLatLng);

		return sensorsNameLatLng;
	};

	module.draw = function(map) {
        // Build the sensors object
        const sensorsNameLatLng = sensors.process();

        // Show the markers on the map
        for (var i = 0; i < sensorsNameLatLng.length; i++) {
            // Marker for current sensor
            var marker = new google.maps.Marker({
              position: {lat: sensorsNameLatLng[i].loc.lat, lng: sensorsNameLatLng[i].loc.lon},
              map: map,
              title: sensorsNameLatLng[i].name,
              metric: sensorsNameLatLng[i].metrics[0]
            });

            // Build the info windows for each sensors
            var infowindow = new google.maps.InfoWindow();
            google.maps.event.addListener(marker, 'click', function() {
                top.location.href = window.location.origin + '/graph.html?name=' + this.title + '&metric=' + this.metric;
            });
        }
    };

	return module;
}();