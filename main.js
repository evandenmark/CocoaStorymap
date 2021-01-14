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
		.attr('style', 'position: absolute; opacity: 0; font-family: Helvetica;');

	var tooltipName = tooltip.append('div')
								.attr('id', 'tooltipName')
								.attr('style', 'font-size: 16px');

	var tooltipDate = tooltip.append('div')
								.attr('id', 'tooltipDate')
								.attr('style', 'font-size: 12px');

	//create triangle and pause
	var triangleWrapper = d3.select('body')
							.append('svg')
							.attr("id", 'triangleWrapper')
							.attr('pointer-events', 'none')
							.attr('width', 100)
							.attr('height', 100);

	var sym =  d3.symbol().type(d3.symbolTriangle).size(150); 

			        
    d3.select("#triangleWrapper") 
        .append("path")
        .attr("d", sym) 
        .attr("fill", "#0674B9")
        .attr('transform', 'translate(50,50) rotate(90)')
        .attr('id', 'triangle')
        .style('opacity', 1);


   	d3.select("#triangleWrapper").append('rect')
        .attr('width', 4)
        .attr('height', 15)
        .attr('x', 0)
        .attr('y', 0)
        .attr('class', 'pause')
        .attr('transform', 'translate(44,42)')
        .style('opacity', 0)
        .attr('fill', '#0674B9');

    d3.select("#triangleWrapper").append('rect')
        .attr('width', 4)
        .attr('height', 15)
        .attr('x', 0)
        .attr('y', 0)
        .attr('class', 'pause')
        .attr('fill', '#0674B9')
        .style('opacity', 0)
        .attr('transform', 'translate(52,42)');





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
		    	.style("fill", '#7FCEFF')
		    	.style("stroke", '#0674B9')
		    	.style("stroke-width", 3)
		    	.on("click", function(d){


		    		//handle audio
		    		if (currentlyPlaying){
		    			currentSound.pause();

		    			if (currentSound.src.includes(d.file)){
		    				//currently playing and click on same circle
		    				currentlyPlaying = false;
		    				currentSound = new Audio();

		    				//pause button clicked
				    		d3.select('#triangle')
				    			.style('opacity', 1);

				    		d3.selectAll('.pause')
				    			.style('opacity', 0);
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

			    		//play button clicked
			    		d3.select('#triangle')
			    			.style('opacity', 0);

			    		d3.selectAll('.pause')
			    			.style('opacity', 1);
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

				    //move triangle
				    var [transX, transY] = d3.select(this).attr('transform').split('(')[1].split(')')[0].split(',');
				    transY = transY - screenHeight - 50;
				    transX = transX - 50;
				    
				    var transform = 'translate('+transX+','+transY+')'

			        
			        setTimeout(function(){appearSelection(transform, '#triangleWrapper')}, 75); 
					})

			    .on('mouseout', function(){
			    	//remove tooltip and triangle
			    	d3.select('#tooltip').style('opacity', 0);
			    	d3.select('#triangleWrapper').style('opacity', 0);

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
					});
}

function appearSelection(transform, selectionID){
	d3.select(selectionID) 
    	.attr('transform', transform)
    	.style('opacity', 1); 
}

function disappearSelection(selectionID){
	d3.select(selectionID)
		.attr('opacity', 0);
}

///EXECUTE
initialLoad();