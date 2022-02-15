function MapChart(id, markers) {
    var svg = d3.select(id),
    width = +svg.attr("width"),
    height = +svg.attr("height");
    var projection = d3.geoMercator()               // GPS of location to zoom on
    .scale(150)                     // This is like the zoom
    .translate([ width/2, height/2 ]);

    d3.json("https://picbed-mainland.oss-cn-beijing.aliyuncs.com/world.geojson", function(data){

    // Filter data
    // data.features = data.features.filter( function(d){return d.properties.name=="France"} )

    // Create a color scale
    var color = d3.scaleOrdinal()
				.range(d3.schemePaired);

    // Add a scale for bubble size
    var size = d3.scaleLinear()
      .domain([1,250])  // What's in the data
      .range([ 4, 50])  // Size in pixel

    // Draw the map
    svg.append("g")
        .selectAll("path")
        .data(data.features)
        .enter()
        .append("path")
          .attr("fill", "#b8b8b8")
          .attr("d", d3.geoPath()
              .projection(projection)
          )
        .style("stroke", "black")
        .style("opacity", .3)

    // Add circles:
    svg
      .selectAll("myCircles")
      .data(markers)
      .enter()
      .append("circle")
        .attr("class" , function(d){ return d.group })
        .attr("cx", function(d){ return projection([d.long, d.lat])[0] })
        .attr("cy", function(d){ return projection([d.long, d.lat])[1] })
        .attr("r", function(d){ return size(d.size) })
        .style("fill", function(d){ return color(d.group) })
        .attr("stroke", function(d){ return color(d.group) })
        .attr("stroke-width", 3)
        .attr("fill-opacity", .4)


    // This function is gonna change the opacity and size of selected and unselected circles
    function update_map(){
		d3.selectAll(".checkbox").each(function(d){
			cb = d3.select(this);
			grp = cb.property("value")
			console.log(grp)
	
			// If the box is check, I show the group
			if(cb.property("checked")){
			  svg.selectAll("."+grp).transition().duration(400).style("opacity", 1).attr("r", function(d){ return size(d.size) })
              d3.select('#'+grp +'radarArea').transition().duration(400).style("fill-opacity", 0.8)
			  var tmp = d3.select('#'+grp +'radarArea').node().parentNode
			  d3.select(tmp).raise()
			  d3.selectAll('#'+grp +'radarCircle').transition().duration(400).style("fill-opacity", 1)
			  d3.selectAll('#'+grp +'radarStroke').transition().duration(400).style("stroke-width", "1px")

	
			// Otherwise I hide it
			}else{
				svg.selectAll("."+grp).transition().duration(400).style("opacity", 0).attr("r", 0)
                d3.select('#'+grp +'radarArea').transition().duration(400).style("fill-opacity", 0)
				d3.selectAll('#'+grp +'radarCircle').transition().duration(400).style("fill-opacity", 0)
				d3.selectAll('#'+grp +'radarStroke').transition().duration(400).style("stroke-width", "0px")
			}
		  })
	}

    // When a button change, I run the update function
    d3.selectAll(".checkbox").on("change",update_map);

    // And I initialize it at the beginning
    update_map()
})
}