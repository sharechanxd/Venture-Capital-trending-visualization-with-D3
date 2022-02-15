function InvestorChart(id){

    // set the dimensions and margins of the graph
var margin = {top: 10, right: 20, bottom: 0, left: 10},
width = 900 - margin.left - margin.right,
height = 230 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select(id)
.append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

// Parse the Data
d3.csv("https://picbed-mainland.oss-cn-beijing.aliyuncs.com/year_investor.csv", function(data) {

// List of groups = header of the csv files
var keys = data.columns.slice(1)
// console.log(data)
// console.log(keys)
function Dictionary(){
                this.datastore = new Object();
}
Dictionary.prototype = {
  constructor: Dictionary,
  size: function(){
      return Object.keys(this.datastore).length;
  },
  add: function(key, value){
      this.datastore[key] = value;
  },
  find: function(key){
      return this.datastore[key];
  },
  remove: function(key){
      delete this.datastore[key];
  },
  showAll: function(){
      for(var key in this.datastore){
          console.log(key + ": " + this.find(key));
      }
  }
};

let name_total_num = new Dictionary();
for (let j = 0; j < keys.length; j++){
t = d3.sum(data,function(d){return d[keys[j]]})
name_total_num.add(keys[j],t);
};
console.log(name_total_num)
// Add X axis
var x = d3.scaleLinear()
.domain(d3.extent(data, function(d) { return d.year; }))
.range([ 0, width ]);
svg.append("g")
.attr("transform", "translate(0," + height*0.95 + ")")
.call(d3.axisBottom(x).tickSize(-height*.9).tickValues(['1998','1999',2000,2001,2002,2003,2004,2005,2006,2007, 2008,2009,2010,2011,2012,2013,2014, 2015,2016,2017,2018,2019,2020,2021]))
.select(".domain").remove()
// Customization
svg.selectAll(".tick line").attr("stroke", "#b8b8b8").style("stroke-width", 2)

// Add X axis label:
svg.append("text")
  .attr("text-anchor", "end")
  .attr("x", width)
  .attr("y", height-10 )
  .text("Time (year)");
svg.append("text")
  .attr("text-anchor", "end")
  .attr("x", width)
  .attr("y", 10 )
  .text("数量幅度");
// Add Y axis
var y = d3.scaleLinear()
.domain([-600, 600])
.range([ height, 0 ]);

// color palette
var color = d3.scaleOrdinal()
.domain(keys)
.range(d3.schemePaired);

//stack the data?
var stackedData = d3.stack()
.offset(d3.stackOffsetSilhouette)
.keys(keys)
(data)

// create a tooltip
var Tooltip = svg
.append("text")
.attr("x", 10)
.attr("y", 10)
.style("opacity", 1)
.style("font-size", 25)
.text('1998-2021年机构参与融资公司数量概览')

// Three function that change the tooltip when user hover / move / leave a cell
// console.log(stackedData)
var mouseover = function(d) {
Tooltip.style("opacity", 1)
d3.selectAll(".myArea").style("opacity", .2)
d3.select(this)
  .style("stroke", "black")
  .style("opacity", 1)
}
var mousemove = function(d,i) {
// console.log(d)
// console.log(i)
grp = keys[i]
// console.log(grp)
// console.log(name_total_num)
Tooltip.text(grp + ': 总融资事件数量' + name_total_num.find(grp))
}
var mouseout = function(d) {
// Tooltip.style("opacity", 0)
Tooltip.text('1998-2021年机构参与融资公司数量概览')
d3.selectAll(".myArea").style("opacity", 1).style("stroke", "none")
}

// Area generator
var area = d3.area()
.x(function(d) { return x(d.data.year); })
.y0(function(d) { return y(d[0]); })
.y1(function(d) { return y(d[1]); })

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
          d3.selectAll('#'+grp +'radarStroke').transition().duration(400).style("stroke-width", "1px")
         
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


function jump(event, d) {
if (event.defaultPrevented) return; // dragged
grp = keys[d]
// console.log(d)
// window.location.href=`${grp}.html`;
d3.selectAll(".checkbox").property('checked', false);
d3.selectAll('.checkbox').filter(function() {
    return d3.select(this).attr("value") == grp; // filter by single attribute
  }).property('checked', true);
  d3.selectAll(".checkbox").on('change',update);
  update();
}
// Show the areas
area = svg
.selectAll("mylayers")
.data(stackedData)
.enter()
.append("path")
  .attr("class", "myArea")
  .style("fill", function(d) { return color(d.key); })
  .attr("d", area)
  .on("mouseover", mouseover)
  .on("mousemove", mousemove)
  .on("mouseout", mouseout)
  .on('click',jump)

})
}