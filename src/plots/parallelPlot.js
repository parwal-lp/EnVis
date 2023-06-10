// set the dimensions and margins of the graph
var margin = {top: 30, right: 100, bottom: 10, left: 100},
  width = 900 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

var brushParallelWidth = 50; 
// Here I set the list of dimension manually to control the order of axis:
dimensions = ["GreenAreaDensity","LowEmission","AutobusStopDensity","CirculatingVehicles","ExposedNoisePollution"]


//declare the axis
var xParallel = d3.scalePoint().range([0, width]).domain(dimensions),
    yParallel = {};

var line = d3.line(),
    axis = d3.axisLeft(),
    background,
    foreground;
    
// append the svg object to the body of the page
var svgParallel = d3.select("#parallelPlot")
.append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
.append("g")
  .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

//function that includes all the necessary to draw and update the plot
function drawParallelPlot(){
    // Parse the Data
    d3.csv("../../data/processed/ParallelPlotData.csv", function(data) {

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

    // Add grey background lines for context.
    background = svgParallel.append("g")
        .attr("class", "background")
        .selectAll("path")
        .data(data)
        .enter().append("path")
        .attr("d", path);

     // Add blue foreground lines for focus.
    foreground = svgParallel.append("g")
        .attr("class", "foreground")
        .selectAll("path")
        .data(data)
        .enter().append("path")
        .attr("d", path);

    // Add a group element for each dimension.
     var g = svgParallel.selectAll(".dimension")
        .data(dimensions)
        .enter().append("g")
        .attr("class", "dimension")
        .attr("transform", function(d) { return "translate(" + xParallel(d) + ")"; });

    // Add an axis and title.
    g.append("g")
        .attr("class", "axis")
        .each(function(d) { d3.select(this).call(axis.scale(yParallel[d])); })
        .append("text")
        .style("text-anchor", "middle")
        .attr("y", -9)
        .text(function(d) { return d; });

    // Add and store a brush for each axis.
    g.append("g")
        .attr("class", "brush")
        .each(function(d) { d3.select(this).call(yParallel[d].selection = d3.brushY().on("brush", brushedParallel)); })
        .selectAll("rect")
        .attr("x", -8)
        .attr("width", 50); //in case change to 50
    });

    // Returns the path for a given data point.
    function path(d) {
        return line(dimensions.map(function(p) { return [xParallel(p), yParallel[p](d[p])]; }));
    }
  
    // Handles a brush event, toggling the display of foreground lines.
    function brushedParallel() {
        var actives = dimensions.filter(function(p) { return !yParallel[p].selection === null; }),
            extents = actives.map(function(p) { return yParallel[p].selection.extent(); });
        foreground.style("display", function(d) {
        return actives.every(function(p, i) {
            return extents[i][0] <= d[p] && d[p] <= extents[i][1];
        }) ? null : "none";
        });
    }


}

drawParallelPlot();