var Nhi = 47.54//47.60//47.740;   // top edge latitude
var Nlo	= 47.53//47.645//47.54;   // bottom edge latitude
var Whi = -122.245; // top edge longitude
var Wlo = -122.45; // bottom edge longitude
var interv = 0.005;  // interval to iterate through grid with (in degrees)
var locations = []; // Array of locations within area
var l = null; // stores location for current search
var requestinterval = 10000 // time interval between requests
var ready = false;
var lats = [];
var lngs = [];


function getResponse(lat,lng,address) {
    l = null;
    if(address != null) {
        var g = new google.maps.Geocoder();
        g.geocode( { 'address': address}, function(results, status) {
          if (status == google.maps.GeocoderStatus.OK) {
            console.log(results);
            var la = results[0].geometry.location.A;
            var ln = results[0].geometry.location.F;

            var dispatch = getDispatch(la,ln);
            var coord = [new google.maps.LatLng(la,ln)];
            var coord2 = [new google.maps.LatLng(dispatch.lat,dispatch.lng)];
            calculateDistances(coord, coord2);

            setTimeout(function() {
                map.setCenter(results[0].geometry.location);
                smoothZoom(map, 16, map.getZoom());
                var contentString = '<div id="content">'+
                  '<h4>'+l.address+'</h4>'+
                  '<p>Response time: '+timeCalc(l.response_time)+' Seconds</p>'+
                  '</div>';
                var infowindow = new google.maps.InfoWindow({
                    content: contentString
                });
                var marker = new google.maps.Marker({
                    map: map,
                    position: results[0].geometry.location,
                    animation: google.maps.Animation.DROP
                });
                google.maps.event.addListener(marker, 'click', function() {
                    infowindow.open(map,marker);
                });
            },500);
            
          } else {
            alert("Geocode was not successful for the following reason: " + status);
          }
        });
    } else {
        var mark = new google.maps.LatLng(lat,lng);

        var dispatch = getDispatch(lat,lng);
        var coord = [mark];
        var coord2 = [dispatch];
        calculateDistances(coord, coord2);

        setTimeout(function(){ 
            map.setCenter(mark);
            smoothZoom(map, 16, map.getZoom());
            var contentString = '<div id="content">'+
              '<h4>'+l.address+'</h4>'+
              '<p>Response time: '+timeCalc(l.response_time)+'</p>'+
              '</div>';
            var infowindow = new google.maps.InfoWindow({
                content: contentString
            });
            var marker = new google.maps.Marker({
                map: map,
                position: mark,
                animation: google.maps.Animation.DROP
            });
            google.maps.event.addListener(marker, 'click', function() {
                infowindow.open(map,marker);
            });
        },500);
    }
}

// the smooth zoom function
function smoothZoom (map, max, cnt) {
    if (cnt >= max) {
            return;
        }
    else {
        z = google.maps.event.addListener(map, 'zoom_changed', function(event){
            google.maps.event.removeListener(z);
            smoothZoom(map, max, cnt + 1);
        });
        setTimeout(function(){map.setZoom(cnt)}, 80); // 80ms is what I found to work well on my system -- it might not work well on all systems
    }
}  


// calculate  number of grid intersections in given area
var count = 0;
var complete = 0;
c(Nlo,Wlo);
function c(lat,lng){
    if(lat>Nhi){
        return;
    } if(lng>Whi){
        count++;
        return c(lat+interv,Wlo);
    } else {
        count++;
        return c(lat,lng+interv);
    }
};
console.log("count = "+count);

// Recursively makes requests from google for geocode data for all geographic coordinates
// within specified area with specified interval
//getData(Nlo,Wlo);
function getData(lat,lng){
    if(lat>Nhi){
        makeRequests(lats,lngs);
        return;
    } if(lng>Whi) {
        //getReverseGeocodingData(lat,lng);
        //responseTime(lat,lng);
        lats.push(lat);
        lngs.push(lng);
        return getData(lat+interv,Wlo);
    } else {
        //getReverseGeocodingData(lat,lng);
        //responseTime(lat,lng);
        lats.push(lat);
        lngs.push(lng);
        return getData(lat,lng+interv);
    }
};
function makeRequests(lat,lng) {
    if(lat.length == 0) {
        setTimeout(function() {
            alert('done');
        }, 2000);
        //JSONToCSVConvertor(locations, "Addresses/Coordinates between latitude "+Nhi+"N to "+Nlo+"N and longitude "+Wlo+"E to "+Whi+"E by interval of "+interv+" degrees", true)
        return;
    }
    var lat_batch = [];
    var lng_batch = [];
    for (var i = 0; i < 1; i++) {
        lat_batch.push(lat[i]);
        lng_batch.push(lng[i]);
    }
    responseTime(lat_batch,lng_batch);
    lat.splice(0,1);
    lng.splice(0,1);
    waitTilReady();
    function waitTilReady() {
        if(ready==true){
            ready = false;
            makeRequests(lat,lng);
        } else {
            setTimeout( function() {
                waitTilReady();
            }, 2000 );
        }
    }
}


//Calculate response time from nearest dispatch center to given address
//takes an array latitudes and longitudes or one of each
function responseTime(lat,lng) {
    if(typeof lat == "number" || typeof lat == "string") {
        lat = lat.toString().split("   ");
        lng = lng.toString().split("   ");
    };
    if(lat.length != lng.length) {
        console.log("bad request");
    }else{
        var origs = [];
        var dests = [];
        for (var i = 0; i < lat.length; i++) {
            origs.push(new google.maps.LatLng(lat[i], lng[i]));
            var dispatch = getDispatch(lat[i],lng[i]);
            dests.push(new google.maps.LatLng(dispatch.lat, dispatch.lng));
        }
        calculateDistances(origs,dests); 
    }
}

//Calculates response time from nearest dispatch center. Takes an array of
//origins and their destinations and uses google distance matrix api to find
//the drive time between the locations
function calculateDistances(origins,destinations) {
  var service = new google.maps.DistanceMatrixService();
  service.getDistanceMatrix(
    {
      origins: origins,
      destinations: destinations,
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.METRIC,
      avoidHighways: false,
      avoidTolls: false
    }, data = function (response, status) {
      if (status != google.maps.DistanceMatrixStatus.OK) {
        setTimeout( function() {
            calculateDistances(origins,destinations);
        },15000)
      } else {
        var orig = response.originAddresses;
        var dest = response.destinationAddresses;
        var results = response.rows[0].elements;
        for (var i = 0; i < orig.length; i++) {
          var address = orig[i];
          var response = results[i].duration.value;
          var lat = origins[i].A;
          var lng = origins[i].F;
          var dispatch = getDispatch(lat,lng).name;
          addLocation(address,lat,lng,dispatch,response);
          complete++;
          ready = true;
          console.log(complete + "/" + count);
        }
      }
    })
}

// Add coordinate address info to json object
function addLocation(address, lat, lng, dispatch, response){
    var jsonData = {};
    jsonData['lat'] = Number(lat);
    jsonData['lng'] = Number(lng);
    jsonData['address'] = address;
    jsonData['dispatch'] = dispatch;
    jsonData['response_time'] = timeCalc(response);
    if (address.split(",")[1].trim().toLowerCase() == 'seattle' || address.split(",")[2].trim().toLowerCase() == 'seattle') {
       l = jsonData;
       locations.push(jsonData);
    };
}

function timeCalc(t){
    var dif = t-465.6365;
    var s = dif/188.5121;
    var k = 8.1+(3*s)
    return Math.round(k*60);
}

//This function determines the closest dispatch location to the given coordinate
function getDispatch(lat,lng) {
    var dispatch = dispatch_locations[0];
    var closest = 999;
    for (var i = 0; i < dispatch_locations.length; i++) {
        var d = dispatch_locations[i];
        var distance = calcCrow(lat,lng,d.lat,d.lng);
        if(distance < closest) {
            dispatch = d;
            closest = distance;
        }
    };
    return dispatch;
}



//This function takes in latitude and longitude of two locations and returns the distance between them as the crow flies (in km)
function calcCrow(lat1, lon1, lat2, lon2) {
  var R = 6371; // km
  var dLat = toRad(lat2-lat1);
  var dLon = toRad(lon2-lon1);
  var lat1 = toRad(lat1);
  var lat2 = toRad(lat2);

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c;
  return d;
}

// Converts numeric degrees to radians
function toRad(Value) {
    return Value * Math.PI / 180;
}


//getReverseGeocodingData(47.64,-122.35);
function getReverseGeocodingData(lat, lng) {
    var latlng = new google.maps.LatLng(lat, lng);
    // This is making the Geocode request
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'latLng': latlng }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
            setTimeout(function(){
                getReverseGeocodingData(lat,lng);
            },3000);
        }
        // This is checking to see if the Geoeode Status is OK before proceeding
        if (status == google.maps.GeocoderStatus.OK) {
            var address = (results[0].formatted_address);
            //console.log(address);
        }
    });
}

// Convert json object to csv and download to local machine
function JSONToCSVConvertor(JSONData, ReportTitle, ShowLabel) {
    //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
    var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
    var CSV = '';    
    //Set Report title in first row or line
    CSV += ReportTitle + '\r\n\n';
    //This condition will generate the Label/Header
    if (ShowLabel) {
        var row = "";
        //This loop will extract the label from 1st index of on array
        for (var index in arrData[0]) {
            //Now convert each value to string and comma-seprated
            row += index + ',';
        }
        row = row.slice(0, -1);
        //append Label row with line break
        CSV += row + '\r\n';
    }
    //1st loop is to extract each row
    for (var i = 0; i < arrData.length; i++) {
        var row = "";  
        //2nd loop will extract each column and convert it in string comma-seprated
        for (var index in arrData[i]) {
            row += '"' + arrData[i][index] + '",';
        }
        row.slice(0, row.length - 1);
        //add a line break after each row
        CSV += row + '\r\n';
    }
    if (CSV == '') {        
        alert("Invalid data");
        return;
    }   
    //Generate a file name
    var fileName = "MyReport_";
    //this will remove the blank-spaces from the title and replace it with an underscore
    fileName += ReportTitle.replace(/ /g,"_");   
    //Initialize file format you want csv or xls
    var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);
    // Now the little tricky part.
    // you can use either>> window.open(uri);
    // but this will not work in some browsers
    // or you will not get the correct file extension    
    //this trick will generate a temp <a /> tag
    var link = document.createElement("a");    
    link.href = uri;
    //set the visibility hidden so it will not effect on your web-layout
    link.style = "visibility:hidden";
    link.download = fileName + ".csv";
    //this part will append the anchor tag and remove it after automatic click
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
