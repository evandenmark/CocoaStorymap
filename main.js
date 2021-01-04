// DEFINE THE MAP
var screenWidth =  screen.width,
	screenHeight = screen.height;

function initialLoad(){
	//loads the initial files and draws the map

	USA_SCALE = 2000;
	USA_TRANSLATE = [screenWidth*0.45,screenHeight*0.5];

	projection = d3.geoAlbersUsa().scale(USA_SCALE).translate(USA_TRANSLATE);

	path = d3.geoPath().projection(projection);

	mapSvg = d3.select("#main-map").append("svg")
					    .attr("width", screenWidth)
					    .attr("height", screenHeight)

	d3.json("./countryShapeData/us.json").then(function(topology){

	// d3.json("https://github.com/evandenmark/CocoaStorymap/blob/master/countryShapeData/us.json").then(function(topology){

		var states = topojson.feature(topology, topology.objects.states);
		mapSvg.selectAll("path")
		      .data(states.features)
		      .enter().append("path")
			      .attr("d", path)
			      .attr('class', 'mappath')
			      .attr("fill", "#efefef")
			      .attr("stroke", "#fff");

		d3.csv("./data.csv").then(function(data){
			audioData = data;
			drawLocationCircles();

		});
	});
}

function drawLocationCircles(locations){
	mapSvg.selectAll(".locations")
				.data(audioData)
				.join(
			    	enter => enter.append("circle"),
			    	update => update,
			    	exit => exit.remove()
		    	)
		    	.attr("transform", function(d) {
					var p = projection([d.long, d.lat]);
					var q = p[1];
					var r = p[0] ;
					// return "translate(0,0)";
					return "translate(" + r +','+q + ")";
				})
				.attr("class", "locations")
		    	.attr("r", 10)
		    	.style("fill", 'blue');
}


///EXECUTE
initialLoad();