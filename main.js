// DEFINE THE MAP
var screenWidth =  screen.width,
	screenHeight = screen.height*0.88;

//Audio
var currentlyPlaying = false;
var currentSound = new Audio(); 

function initialLoad(){
	//loads the initial files and draws the map

	USA_SCALE = 2000;
	USA_TRANSLATE = [screenWidth*0.5,screenHeight*0.5];

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

	var tooltip = d3.select('body')
		.append('g')
		.attr('id', 'tooltip')
		.attr('style', 'position: absolute; opacity: 0; font-family: Helvetica');

	var tooltipName = tooltip.append('div')
								.attr('id', 'tooltipName')
								.attr('style', 'font-size: 16px');

	var tooltipDate = tooltip.append('div')
								.attr('id', 'tooltipDate')
								.attr('style', 'font-size: 12px');;


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
				.attr('id', function(d){return d.index})
		    	.attr("r", 10)
		    	.on("click", function(d){


		    		//handle audio
		    		if (currentlyPlaying){
		    			currentSound.pause();

		    			if (currentSound.src.includes(d.file)){
		    				//currently playing and click on same circle
		    				currentlyPlaying = false;
		    				currentSound = new Audio();
		    			} else{
		    				//currently playing and click on different circle
		    				currentSound = new Audio("./audio"+d.file);
		    				currentSound.play();
		    				currentlyPlaying = true;
		    			}

		    		} else {
		    			//no sound playing
		    			currentSound = new Audio("./audio"+d.file);
			    		currentSound.play();
			    		currentlyPlaying = true;
		    		}

		    	})
		    	// .on('mouseover', mouseover )
		    	.on('mouseover', function(d,i){
		    		//create tooltip
		    		d3.select('#tooltip')
		    			.transition()
		    			.duration(200)
		    			.style('opacity', 1)

		    		d3.select("#tooltipName")
		    			.text(d.name)

		    		d3.select("#tooltipDate")
		    			.text(d.date)

		    		//make circle big
		    		d3.select(this)
				        .transition()
				        .duration(100)
				        .attr('r', 20)
				        .attr('fill', '#ff0000');
					})

			    .on('mouseout', function(){
			    	d3.select('#tooltip').style('opacity', 0)

			    	//make circle small
			    	d3.select(this)
			    		.transition()
			    		.duration(100)
			    		.attr('r', 10)
			    	})

			    .on('mousemove', function() {
					d3.select('#tooltip')
					.style('left', d3.event.pageX+20 + 'px')
					.style('top', d3.event.pageY+1 + 'px')
					})

		    	.style("fill", '#7FCEFF')
		    	.style("stroke", '#0674B9')
		    	.style("stroke-width", 3);
}


///EXECUTE
initialLoad();