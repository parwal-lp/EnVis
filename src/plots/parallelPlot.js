// set the dimensions and margins of the graph
var margin = {top: 30, right: 100, bottom: 10, left: 100},
  width = 900 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svgParallel = d3.select("#parallelPlot")
.append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
.append("g")
  .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// Parse the Data
d3.csv("../../data/processed/ParallelPlotData.csv", function(data) {

  // Color scale: give me a specie name, I return a color
  //mi serve?
 // var color = d3.scaleOrdinal()
 //   .domain(d.City) // come dire che il 
  //  .range(["#CCCCFF"])

  // Here I set the list of dimension manually to control the order of axis:
  dimensions = ["GreenAreaDensity","LowEmission","AutobusStopDensity","CirculatingVehicles","ExposedNoisePollution"]

  // For each dimension, I build a linear scale. I store all in a y object
  var yParallel = {}
  var name;
  for (i in dimensions) {
    name = dimensions[i]
    //console.log(name);
    yParallel[name] = d3.scaleLinear()
    // .domain( [0,150] ) // --> Same axis range for each group
     .domain( d3.extent(data, function(d) { 
        //console.log(+d[name] + " is of type: " + typeof(+d[name])) // print the value and the type
           return +d[name];   // --> Different axis range for each group
      }) )
      .range([height, 0])
  }

  // Build the X scale -> it find the best position for each Y axis
  xParallel = d3.scalePoint()
    .range([0, width])
    .domain(dimensions); 

  // Highlight the specie that is hovered
  var highlight = function(d){

    selected_city = d.City

    // first every group turns grey
    d3.selectAll(".line")
      .transition().duration(200)
      .style("stroke", "lightgrey")
      .style("opacity", "0.5")
    // Second the hovered specie takes its color
    d3.selectAll("." + selected_city)
      .transition().duration(200)
      .style("stroke",function(p){ return( "#4682B4");})
      .style("opacity", "1")
  }

  // Unhighlight
  var doNotHighlight = function(d){
    d3.selectAll(".line")
      .transition().duration(200).delay(1000)
      .style("stroke", function(p){ return( "#AAA");} )
      .style("opacity", "1")
  } 

  // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
  function path(d) {
    return d3.line()(dimensions.map(function(column) {
      //console.log(y[column](d[column]));
       return [xParallel(column), yParallel[column](d[column])]; 
      }));
  } 

  // Draw the lines
  svgParallel
    .selectAll("myPath")
    .data(data)
    .enter()
    .append("path")
      //.attr("class", function (d) { return "line" + d.City} ) // 2 class for each line: 'line' and the group name
      .attr("d",  path)
      .style("fill", "none" )
      .style("stroke", function(d){ return("#AAA")} )
      .style("opacity", 0.5)
      .on("mouseover", highlight)
      .on("mouseleave", doNotHighlight ) 

  // Draw the axis:
  svgParallel.selectAll("myAxis")
    // For each dimension of the dataset I add a 'g' element:
    .data(dimensions).enter()
    .append("g")
    .attr("class", "axis")
    // I translate this element to its right position on the x axis
    .attr("transform", function(d) { return "translate(" + xParallel(d) + ")"; })
    // And I build the axis with the call function
    .each(function(d) { d3.select(this).call(d3.axisLeft().ticks(5).scale(yParallel[d])); })
    // Add axis title
    .append("text")
      .style("text-anchor", "middle")
      .attr("y", -9)
      .text(function(d) { return d; })
      .style("fill", "black")

})