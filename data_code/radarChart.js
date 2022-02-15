function RadarChart(id, data, options) {
	var cfg = {
	 w: 600,				//Width of the circle
	 h: 600,				//Height of the circle
	 margin: {top: 20, right: 20, bottom: 20, left: 20}, //The margins of the SVG
	 levels: 8,				//How many levels or inner circles should there be drawn
	 maxValue: 0, 			//What is the value that the biggest circle will represent
	 labelFactor: 1.25, 	//How much farther than the radius of the outer circle should the labels be placed
	 wrapWidth: 60, 		//The number of pixels after which a label needs to be given a new line
	 opacityArea: 0.35, 	//The opacity of the area of the blob
	 dotRadius: 2, 			//The size of the colored circles of each blog
	 opacityCircles: 0.1, 	//The opacity of the circles of each blob
	 strokeWidth: 1, 		//The width of the stroke around each blob
	 roundStrokes: false,	//If true the area and stroke will follow a round path (cardinal-closed)
	 color: d3.schemeCategory20	//Color function
	};
	
	//Put all of the options into a variable called cfg
	if('undefined' !== typeof options){
	  for(var i in options){
		if('undefined' !== typeof options[i]){ cfg[i] = options[i]; }
	  }//for i
	}//if
	
	//If the supplied maxValue is smaller than the actual one, replace by the max in the data
	var maxValue = Math.max(cfg.maxValue, d3.max(data, function(i){return d3.max(i.map(function(o){return o.value;}))}));
		
	var allAxis = (data[0].map(function(i, j){return i.axis})),	//Names of each axis
		total = allAxis.length,					//The number of different axes
		radius = Math.min(cfg.w/2, cfg.h/2), 	//Radius of the outermost circle
		// Format = d3.format('%'),			 	//Percentage formatting
		angleSlice = Math.PI * 2 / total;		//The width in radians of each "slice"
	
	//Scale for the radius
	var rScale = d3.scaleLinear()
		.range([0, radius])
		.domain([0, maxValue]);
		
	/////////////////////////////////////////////////////////
	//////////// Create the container SVG and g /////////////
	/////////////////////////////////////////////////////////

	//Remove whatever chart with the same id/class was present before
	d3.select(id).select("svg").remove();
	
	//Initiate the radar chart SVG
	var svg = d3.select(id).append("svg")
	.attr('x',250)
	.attr('y',250)
			.attr("width",  cfg.w + cfg.margin.left + cfg.margin.right)
			.attr("height", cfg.h + cfg.margin.top + cfg.margin.bottom)
			.attr("class", "radar"+id);
	//Append a g element		
	var g = svg.append("g")
			.attr("transform", "translate(" + (cfg.w/2 + cfg.margin.left) + "," + (cfg.h/2 + cfg.margin.top) + ")");
	
	/////////////////////////////////////////////////////////
	////////// Glow filter for some extra pizzazz ///////////
	/////////////////////////////////////////////////////////
	
	//Filter for the outside glow
	var filter = g.append('defs').append('filter').attr('id','glow'),
		feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation','2.5').attr('result','coloredBlur'),
		feMerge = filter.append('feMerge'),
		feMergeNode_1 = feMerge.append('feMergeNode').attr('in','coloredBlur'),
		feMergeNode_2 = feMerge.append('feMergeNode').attr('in','SourceGraphic');

	/////////////////////////////////////////////////////////
	/////////////// Draw the Circular grid //////////////////
	/////////////////////////////////////////////////////////
	
	//Wrapper for the grid & axes
	var axisGrid = g.append("g").attr("class", "axisWrapper");
	
	//Draw the background circles
	axisGrid.selectAll(".levels")
	   .data(d3.range(1,(cfg.levels+1)).reverse())
	   .enter()
		.append("circle")
		.attr("class", "gridCircle")
		.attr("r", function(d, i){return radius/cfg.levels*d;})
		.style("fill", "#CDCDCD")
		.style("stroke", "#CDCDCD")
		.style("fill-opacity", cfg.opacityCircles)
		.style("filter" , "url(#glow)");

	//Text indicating at what % each level is
	axisGrid.selectAll(".axisLabel")
	   .data(d3.range(1,(cfg.levels+1)).reverse())
	   .enter().append("text")
	   .attr("class", "axisLabel")
	   .attr("x", 4)
	   .attr("y", function(d){return -d*radius/cfg.levels;})
	   .attr("dy", "0.4em")
	   .style("font-size", "15px")
	   .attr("fill", "#737373")
	   .text(function(d,i) { return Math.round(Math.pow(maxValue * d/cfg.levels,2)); });

	/////////////////////////////////////////////////////////
	//////////////////// Draw the axes //////////////////////
	/////////////////////////////////////////////////////////
	
	//Create the straight lines radiating outward from the center
	var axis = axisGrid.selectAll(".axis")
		.data(allAxis)
		.enter()
		.append("g")
		.attr("class", "axis");
	//Append the lines
	axis.append("line")
		.attr("x1", 0)
		.attr("y1", 0)
		.attr("x2", function(d, i){ return rScale(maxValue*1.1) * Math.cos(angleSlice*i - Math.PI/2); })
		.attr("y2", function(d, i){ return rScale(maxValue*1.1) * Math.sin(angleSlice*i - Math.PI/2); })
		.attr("class", "line")
		.style("stroke", "white")
		.style("stroke-width", "2px");

	//Append the labels at each axis
	axis.append("text")
		.attr("class", "legend")
		.style("font-size", "18px")
		.attr("text-anchor", "middle")
		.attr("dy", "0.35em").style("font-family", "KaiTi")
		.attr("x", function(d, i){ return rScale(maxValue * cfg.labelFactor) * Math.cos(angleSlice*i - Math.PI/2); })
		.attr("y", function(d, i){ return rScale(maxValue * cfg.labelFactor) * Math.sin(angleSlice*i - Math.PI/2); })
		.text(function(d){return d})
		.call(wrap, cfg.wrapWidth).on('click',jump_chanye);

	/////////////////////////////////////////////////////////
	///////////// Draw the radar chart blobs ////////////////
	/////////////////////////////////////////////////////////
	
	//The radial line function
	var radarLine = d3.lineRadial()
		.curve(d3.curveLinearClosed)
		.radius(function(d) { return rScale(d.value); })
		.angle(function(d,i) {	return i*angleSlice; });
		
	if(cfg.roundStrokes) {
		radarLine.curve(d3.curveCardinalClosed);
	}
				
	//Create a wrapper for the blobs	
	var blobWrapper = g.selectAll(".radarWrapper")
		.data(data)
		.enter().append("g")
		.attr("class", "radarWrapper");
    var shit =['GGV纪源资本',
	'IDG资本',
	'阿里巴巴',
	'百度',
	'高瓴VC',
	'高瓴资本',
	'红杉资本',
	'经纬中国',
	'启明创投',
	'腾讯投资',
	'真格基金',
	'字节跳动']
    var tooltip_area = d3.select(id)
        .append("div")
          .style("opacity", 0)
		  .style('position','absolute')
          .property("class", "tooltip_area")
          .style("background-color", "white")
          .style("border-radius", "5px")
          .style("padding", "10px")
          .style("color", "black");
	//Append the backgrounds	
	function jump_jigou(event, d) {
		if (event.defaultPrevented) return; // dragged
		// grp = keys[d]
		window.location.href=`investor_group_circles.html`;
		}
		function jump_chanye(event, d) {
			if (event.defaultPrevented) return; // dragged
			// grp = keys[d]
			window.location.href=`detailind_group_circles.html`;
			}
	blobWrapper
		.append("path")
		.attr("class", "radarArea")
		.attr("id",function(d,i){return shit[i]+'radarArea'})
		.attr("d", function(d,i) { return radarLine(d); })
		.style("fill", function(d,i) { return cfg.color(i); })
		.style("fill-opacity", cfg.opacityArea)
		.on('mouseover', function (d,i){
			// console.log(d)
			//Dim all blobs
            // console.log(i)
			
            tooltip_area
                .transition()
                .duration(200);
            tooltip_area
                .style("opacity", 1)
                .text("机构: " + shit[i])
                .style('font-size','20px')
                .style('font-weight','bold')
                .style("right",  "10%")
                .style("top", "10%")
			// d3.selectAll(".radarArea")
			// 	.transition().duration(200)
			// 	.style("fill-opacity", 0); 
			// //Bring back the hovered over blob
			// d3.select(this)
			// 	.transition().duration(200)
			// 	.style("fill-opacity", 1);
				d3.selectAll(".checkbox").on('change',update);
				// update();
		})
        .on("mousemove", function(){tooltip_area
            .style("right", "10%")
            .style("top", "10%");})
		.on('mouseout', function(){
			//Bring back all blobs
            tooltip_area
                .transition()
                .duration(200)
                .style("opacity", 0)
			// d3.selectAll(".radarArea")
			// 	.transition().duration(200)
			// 	.style("fill-opacity", cfg.opacityArea);
				d3.selectAll(".checkbox").on('change',update);
				// update();
		}).on('click',jump_jigou);
	
	//Create the outlines	
	blobWrapper.append("path")
		.attr("class", "radarStroke")
		.attr("id",function(d,i){return shit[i]+'radarStroke'})
		.attr("d", function(d,i) { return radarLine(d); })
		.style("stroke-width", cfg.strokeWidth + "px")
		.style("stroke", function(d,i) { return cfg.color(i); })
		.style("fill", "none")
		.style("filter" , "url(#glow)");		
	
	//Append the circles
	blobWrapper.selectAll(".radarCircle")
		.data(function(d,i) { return d; })
		.enter().append("circle")
		.attr("id",function(d,i){return shit[i]+'radarCircle'})
		.attr("class", "radarCircle")
		.attr("r", cfg.dotRadius)
		.attr("cx", function(d,i){ return rScale(d.value) * Math.cos(angleSlice*i - Math.PI/2); })
		.attr("cy", function(d,i){ return rScale(d.value) * Math.sin(angleSlice*i - Math.PI/2); })
		.style("fill", function(d,i,j) { return cfg.color(j); })
		.style("fill-opacity", 0.8);

	/////////////////////////////////////////////////////////
	//////// Append invisible circles for tooltip ///////////
	/////////////////////////////////////////////////////////
	
	//Wrapper for the invisible circles on top
	var blobCircleWrapper = g.selectAll(".radarCircleWrapper")
		.data(data)
		.enter().append("g")
		.attr("class", "radarCircleWrapper");
		
	//Append a set of invisible circles on top for the mouseover pop-up
	blobCircleWrapper.selectAll(".radarInvisibleCircle")
		.data(function(d,i) { return d; })
		.enter().append("circle")
		.attr("class", "radarInvisibleCircle")
		.attr("r", cfg.dotRadius*1.5)
		.attr("cx", function(d,i){ return rScale(d.value) * Math.cos(angleSlice*i - Math.PI/2); })
		.attr("cy", function(d,i){ return rScale(d.value) * Math.sin(angleSlice*i - Math.PI/2); })
		.style("fill", "none")
		.style("pointer-events", "all")
		.on("mouseover", function(d,i) {
			newX =  parseFloat(d3.select(this).attr('cx')) - 10;
			newY =  parseFloat(d3.select(this).attr('cy')) - 10;
					
			tooltip
				.attr('x', newX)
				.attr('y', newY)
				.text(Math.pow(d.value,2))
				.transition().duration(200)
				.style('opacity', 1);
		})
		.on("mouseout", function(){
			tooltip.transition().duration(200)
				.style("opacity", 0);
		});
		
	//Set up the small tooltip for when you hover over a circle
	var tooltip = g.append("text")
		.attr("class", "tooltip")
		.style("opacity", 0);
	
	/////////////////////////////////////////////////////////
	/////////////////// Helper Function /////////////////////
	/////////////////////////////////////////////////////////

	//Taken from http://bl.ocks.org/mbostock/7555321
	//Wraps SVG text	
	function wrap(text, width) {
	  text.each(function() {
		var text = d3.select(this),
			words = text.text().split(/\s+/).reverse(),
			word,
			line = [],
			lineNumber = 0,
			lineHeight = 1.4, // ems
			y = text.attr("y"),
			x = text.attr("x"),
			dy = parseFloat(text.attr("dy")),
			tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
			
		while (word = words.pop()) {
		  line.push(word);
		  tspan.text(line.join(" "));
		  if (tspan.node().getComputedTextLength() > width) {
			line.pop();
			tspan.text(line.join(" "));
			line = [word];
			tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
		  }
		}
	  });
	}//wrap	
	d3.selection.prototype.moveToFront = function() {
		return this.each(function(){
		  this.parentNode.appendChild(this);
		});
	  };
	  var size = d3.scaleLinear()
      .domain([1,250])  // What's in the data
      .range([ 4, 50])
	  function update(){
		d3.selectAll(".checkbox").each(function(d){
			cb = d3.select(this);
			grp = cb.property("value")
			console.log(grp)
	
			// If the box is check, I show the group
			if(cb.property("checked")){
			//   d3.selectAll(".radarArea").transition().duration(200).style("fill-opacity", 0)
			//   d3.selectAll(".radarCircle").transition().duration(200).style("fill-opacity", 0)
			//   d3.selectAll(".radarStroke").transition().duration(200).style("stroke-width", "0px")
			  d3.select('#'+grp +'radarArea').transition().duration(400).style("fill-opacity", 0.8)
			  var tmp = d3.select('#'+grp +'radarArea').node().parentNode
			  d3.select(tmp).raise()
			  d3.selectAll('#'+grp +'radarCircle').transition().duration(400).style("fill-opacity", 1)
			  d3.selectAll('#'+grp +'radarStroke').transition().duration(400).style("stroke-width", cfg.strokeWidth + "px")
			 
			  d3.select('.map_shit').selectAll("."+grp).transition().duration(400).style("opacity", 1).attr("r", function(d){return size(d.size) })

	
			// Otherwise I hide it
			}else{
			//   d3.selectAll(".radarArea").transition().duration(1000).style("fill-opacity", cfg.opacityArea)
			//   d3.selectAll(".radarCircle").transition().duration(200).style("fill-opacity", 0.8)
			//   d3.selectAll('.radarStroke').transition().duration(1000).style("stroke-width", cfg.strokeWidth + "px")
				d3.select('#'+grp +'radarArea').transition().duration(400).style("fill-opacity", 0)
				d3.selectAll('#'+grp +'radarCircle').transition().duration(400).style("fill-opacity", 0)
				d3.selectAll('#'+grp +'radarStroke').transition().duration(400).style("stroke-width", "0px")
				d3.select('.map_shit').selectAll("."+grp).transition().duration(400).style("opacity", 0).attr("r", 0)
				
			}
		  })
	}

	d3.selectAll(".checkbox").on('change',update);
	update();
}//RadarChart