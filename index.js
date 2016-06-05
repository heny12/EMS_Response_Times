
// Array of tile colors in heatmap
var colors = ["rgb(5,48,97)", "rgb(33,102,172)", "rgb(67,147,195)", "rgb(146,197,222)", 
  "rgb(209,229,240)", "rgb(253,219,199)", "rgb(244,165,130)", "rgb(214,96,77)", "rgb(178,24,43)", "rgb(103,0,31)"]
var color_labels = ["Below Average","Average","Above Average"]  
var zoomWidth = [0,0,0,0,0,0,0,1,2,2,4,8,15,30,59,117,234,467,933,1865,3729,7458]
var zoomHeight = [0,0,0,0,0,0,0,1,2,5,6,11,22,44,87,174,346,693,1384,2765,5530,11062]
var show;
var hide;

// Create the Google Map…
var map = new google.maps.Map(d3.select("#map").node(), {
  zoom: 11,
  center: new google.maps.LatLng(47.6097, -122.3331),
  mapTypeId: google.maps.MapTypeId.TERRAIN
});

var body = d3.select("#map");
var panel = d3.select("#color-control")

var key = panel.append("svg")
    .attr("width", 150)
    .attr("height", 250)
    .attr("class", "key");
var circles = key.selectAll("circle")
    .data(colors)
    .enter()
    .append("circle")
    .attr("r", "10px")
    .attr("cy", function(d,i) { return (i * 25)+15+"px" })
    .attr("fill", function(d) { return d })
    .attr("cx", "15px");
var labels = key.selectAll("text")
    .data(color_labels)
    .enter()
    .append("text")
    .text( function(d) { return d })
    .style("font-size", "10px")
    .attr("dy", function(d,i) { return (i * 113)+18+"px" })
    .attr("dx", "30px");
$(function() {
  $( "#opacity_slider" ).slider({
    min:0,
    max:100,
    value: 40,
    slide: function(event,ui){
      $("#opacity").text(ui.value+"%");
      $(".heat-tile").css("opacity", ui.value/100)
    }
  });
});
$(function() {
  $( "#color-slider" ).slider({
    orientation: "vertical",
    range: true,
    min: 1,
    max: 10,
    values: [ 1, 10 ],
    slide: function( event, ui ) {
      var lo = 10-ui.values[1];
      var hi = 10-ui.values[0];
      console.log("hi "+hi+" lo "+lo);
      hide = $('.heat-tile').filter(function(){
        return  ($(this).attr("color-level") < lo || $(this).attr("color-level") > hi);
      })
      show = $('.heat-tile').filter(function(){
        return  ($(this).attr("color-level") >= lo && $(this).attr("color-level") <= hi);
      })
      $(hide).hide();
      $(show).show();      
    }
  });
});


$("#check_dispatch").on("change", function(){
  $('.dispatch').toggle();
})
$("#address-search").click(function() {
  var address = $("#address-input").val();
  getResponse(null,null,address);
  setTimeout(function() {
    updateList();
  },500);
})
$("#coordinate-search").click(function() {
  var lat = $("#lat-input").val();
  var lng = $("#lng-input").val()
  getResponse(lat,lng,null);
  setTimeout(function() {
    updateList();
  },500);
})
function updateList() {
  $("#results").empty();
  locations.forEach(function(entry) {
    $("#results").append("<div class='entry'><p>"+entry.address+"</p><p>"+timeCalc(entry.response_time)+" second response time</p></div>");
    console.log(entry);
  })
}



// Load the station data. When the data comes back, create an overlay.
var overlay = new google.maps.OverlayView();

// Add the container when the overlay is added to the map.
overlay.onAdd = function() {
  var layer = d3.select(this.getPanes().overlayMouseTarget).append("div")
        .attr("height", "100%")
        .attr("width", "100%")
        .attr("class", "stations")
        .attr("id", "layer");
  
  layer[0][0].style.width = "1366px";
  layer[0][0].parentNode.style.width = "100%";
  layer[0][0].parentNode.style.height = "100%";
  layer[0][0].parentNode.parentNode.style.width = "100%";
  layer[0][0].parentNode.parentNode.style.height = "100%";
  layer[0][0].parentNode.parentNode.parentNode.style.width = "100%";
  layer[0][0].parentNode.parentNode.parentNode.style.height = "100%";
  layer[0][0].parentNode.parentNode.parentNode.parentNode.style.width = "100%";
  layer[0][0].parentNode.parentNode.parentNode.parentNode.style.height = "100%";
  
  // Draw each marker as a separate SVG element.
  // We could use a single SVG, but what size would it have?
  overlay.draw = function() {
    var projection = this.getProjection(),
        padding = 10;

    // Create markers for dispatch locations
    var marker = layer.selectAll("svg")
        .data( dispatch_locations )
        .each(transform) // update existing markers
      .enter().append("svg:svg")
        .each(transform)
        .attr("class", "marker dispatch")
    marker.append("svg:circle")
        .attr("r", 6.5)
        .attr("cx", padding )
        .attr("cy", padding );
    // add a label.
    marker.append("svg:text")
        .attr("x", padding + 7)
        .attr("y", padding)
        .attr("dy", ".31em")
        .attr("font-size", "11pt")
        .text( function(d) { 
          return d.name; }
        );

    function translate(data) {
      var d = []
      for( var i=0; i<data.length; i++){
        var c = [ data[i].lat, data[i].lng ]
        d.push( c )
      }
      return d
    }

    function _projection( lat, lng ) {
      e = new google.maps.LatLng( lat, lng );
      e = projection.fromLatLngToDivPixel(e);
      return [ e.x - padding, e.y - padding]
      // return [ e.x, e.y ]
    }

    function transform(d) {
      e = _projection( d.lat, d.lng )
      return d3.select(this)
          .style("left", e[0] + "px")
          .style("top", e[1] + "px");
    }
      
  };
};

// Load the station data. When the data comes back, create an overlay.
var overlay2 = new google.maps.OverlayView();

// Add the container when the overlay is added to the map.
overlay2.onAdd = function() {
  var layer = d3.select(this.getPanes().overlayMouseTarget).append("div")
        .attr("height", "100%")
        .attr("width", "100%")
        .attr("class", "stations tiles")
        .attr("id", "layer2");
  
  layer[0][0].style.width = "1366px";
  layer[0][0].parentNode.style.width = "100%";
  layer[0][0].parentNode.style.height = "100%";
  layer[0][0].parentNode.parentNode.style.width = "100%";
  layer[0][0].parentNode.parentNode.style.height = "100%";
  layer[0][0].parentNode.parentNode.parentNode.style.width = "100%";
  layer[0][0].parentNode.parentNode.parentNode.style.height = "100%";
  layer[0][0].parentNode.parentNode.parentNode.parentNode.style.width = "100%";
  layer[0][0].parentNode.parentNode.parentNode.parentNode.style.height = "100%";
  
  // Draw each marker as a separate SVG element.
  // We could use a single SVG, but what size would it have?
  overlay2.draw = function() {
    var projection = this.getProjection(),
        padding = 10;

    // Create markers for dispatch locations
    var marker = layer.selectAll("svg")
        .data( addresses )
        .each(transform) // update existing markers
      .enter().append("svg:svg")
        .each(transform)
        .attr("class", "marker")
    marker.append("svg:rect")
        .attr("class", "heat-tile")
        .attr("width", function() {
          return zoomWidth[map.getZoom()];
        })
        .attr("height", function() {
          return zoomHeight[map.getZoom()];
        })
        .attr("opacity", 0.4)
        .attr("color-level", function(d){
          return Math.round(d.calculated_response/100);
        })
        .attr("fill", function(d) {
          return colors[Math.round(d.calculated_response/100)]
        })
        .on("hover",function(d){
          console.log("dgdf");
          return d.opacity+0.5
        })
        .attr("x", padding)
        .attr("y", padding);
    // add a label.
    marker.append("svg:text")
        .attr("x", padding + 7)
        .attr("y", padding)
        .attr("dy", ".31em")
        .attr("font-size", "10pt")
        .text( function(d) { 
          return; }
        );

    function translate(data) {
      var d = []
      for( var i=0; i<data.length; i++){
        var c = [ data[i].lat+0.003, data[i].lng ]
        d.push( c )
      }
      return d
    }

    function _projection( lat, lng ) {
      lat = Number(lat)+0.002;
      lng = Number(lng)-0.003;
      e = new google.maps.LatLng( lat, lng );
      e = projection.fromLatLngToDivPixel(e);
      return [ e.x - padding, e.y - padding]
      // return [ e.x, e.y ]
    }

    function transform(d) {
      e = _projection( d.lat, d.lng )
      return d3.select(this)
          .style("left", e[0] + "px")
          .style("top", e[1] + "px")
    }
      
  };
};

// Bind our overlay to the map…
overlay2.setMap(map);
overlay.setMap(map);

  google.maps.event.addListener(map, 'zoom_changed', function() {
    var zoomLevel = map.getZoom();
    $('.heat-tile').css("width", zoomWidth[zoomLevel]);
    $('.heat-tile').css("height", zoomHeight[zoomLevel]);
  });

