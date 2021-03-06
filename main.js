// DEFINE THE MAP
	var divWidth = document.getElementById("main-map").offsetWidth;
	var divHeight = divWidth*0.6;
	var screenWidth =  screen.width,
		screenHeight = screen.height;

	//Audio
	var currentlyPlaying = false;
	var currentSound = new Audio(); 

function initialLoad(){
	//loads the initial files and draws the map

	USA_SCALE = screen.width;
	USA_TRANSLATE = [divWidth*0.5,divHeight*0.48];

	projection = d3.geoAlbers().scale(USA_SCALE).translate(USA_TRANSLATE);

	path = d3.geoPath().projection(projection);

	mapSvg = d3.select("#main-map").append("svg")
					    .attr("width", divWidth)
					    .attr("height", divHeight)


	// d3.json("./countryShapeData/us.json").then(function(topology){
	//uncomment the below link when pushing
	// d3.json("https://raw.githubusercontent.com/evandenmark/CocoaStorymap/master/countryShapeData/us.json").then(function(topology){
	d3.json("https://raw.githubusercontent.com/evandenmark/CocoaStorymap/master/countryShapeData/us_features.json").then(function(states){

		// var states = topojson.feature(topology, topology.objects.states);
		mapSvg.selectAll("path")
		      .data(states.features)
		      .enter().append("path")
			      .attr("d", path)
			      .attr('class', 'mappath')
			      .attr("fill", "#efefef")
			      .attr("stroke", "#fff");

		d3.csv("https://raw.githubusercontent.com/evandenmark/CocoaStorymap/master/data.csv").then(function(data){
		//uncomment when final push
		// d3.csv("./data.csv").then(function(data){
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
        .style('opacity', 0);


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
		    	.attr("r", CIRCLE_RADIUS_SMALL)
		    	.style("fill", '#7FCEFF')
		    	.style("stroke", '#0674B9')
		    	.style("stroke-width", CIRCLE_RADIUS_SMALL/5)
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

		    				d3.select('#triangle')
			    			.style('opacity', 0);

				    		d3.selectAll('.pause')
				    			.style('opacity', 1);

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
		    		audioBar('0');

		    		

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
				        .attr('r', CIRCLE_RADIUS_LARGE)
				        .attr('fill', '#ff0000');

				    //move triangle
				    var [transX, transY] = d3.select(this).attr('transform').split('(')[1].split(')')[0].split(',');
				    transY = transY - screenHeight - 50;
				    transX = transX - 50;
				    
				    var transform = 'translate('+transX+','+transY+')'

			        
			        setTimeout(function(){appearSelection(transform, '#triangleWrapper')}, 75); 
					

		    		if (currentSound.src.includes(d.file)){
		    			//current song is same as hover over
		    			d3.select('#triangle')
				    		.style('opacity', 0);

			    		d3.selectAll('.pause')
			    			.style('opacity', 1);
		    		} else{
		    			//current song is different than hover over
		    			d3.select('#triangle')
				    		.style('opacity', 1);

			    		d3.selectAll('.pause')
			    			.style('opacity', 0);
		    		}
		    	})

			    .on('mouseout', function(){
			    	//remove tooltip and triangle
			    	d3.select('#tooltip').style('opacity', 0);
			    	d3.select('#triangleWrapper').style('opacity', 0);

			    	//make circle small
			    	d3.select(this)
			    		.transition()
			    		.duration(100)
			    		.attr('r', CIRCLE_RADIUS_SMALL)
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

function journalButtonClicked(button, filename,index){
	
	journalFolder = './audio/journal/';
	changeJournalButtonText();

	if (currentlyPlaying){
		//some sound is playing
		currentSound.pause();

		if (currentSound.src.includes(filename)){
			//current sound is the clicked on sound
			currentlyPlaying = false;
			currentSound = new Audio();
		}else{
			//current sound is different than clicked on sound
			currentSound = new Audio(journalFolder+filename);
			currentSound.play();
			currentlyPlaying = true;
			button.innerText = "Pause";
		}
	} else{
		//no sound is playing
		currentSound = new Audio(journalFolder+filename);
		currentSound.play();
		currentlyPlaying = true;
		button.innerText = "Pause";
	}
	audioBar(index);
	
}

function audioBar(index){
	var timer;
	var percent = 0;
	currentSound.addEventListener("playing", function(_event) {
	  var duration = _event.target.duration;
	  advance(duration, currentSound);
	});

	currentSound.addEventListener("pause", function(_event) {
	  clearTimeout(timer);
	});

	var advance = function(duration, element) {
	  var progress = document.getElementById("progressBar"+index);
	  increment = 10/duration
	  percent = Math.min(increment * element.currentTime * 10, 100);
	  progress.style.width = percent+'%'
	  startTimer(duration, element);
	}
	var startTimer = function(duration, element){ 
	  if(percent < 100) {
	    timer = setTimeout(function (){advance(duration, element)}, 100);
	  }
	}
}



function changeJournalButtonText(){
	var buttons = document.getElementsByClassName("journalButton");
	for (var i = 0; i < buttons.length; i++) { 
		buttons[i].innerText = "Play";
	}

}

///EXECUTE
setTimeout(initialLoad, 300);