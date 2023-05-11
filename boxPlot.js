// set the dimensions and margins of the graph
var margin = {top: 20, right: 30, bottom: 40, left: 100},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svgBoxPlot = d3.select("#boxPlot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

// Read the data and compute summary statistics
// Data for multiple boxes - in this case there are 4 
var data = [
    {name: "Group 1", values: [10, 20, 30, 40, 50]},
    {name: "Group 2", values: [5, 150, 200, 350, 450]},
    {name: "Group 3", values: [40, 80, 120, 160, 200]},
    {name: "Group 4", values: [10, 30, 60, 90, 120]},
  ];
  
  // Boxplot properties
  var boxWidth = 40;
  var boxHeight = 200;
  var boxPadding = 10;

   // Show the Y scale
   var y = d3
   .scaleLinear()
   .range([height, 0])
   .domain([0,100]); //here map the data with max and min value of all datasets

 svgBoxPlot
   .append("g")
   .call(d3.axisLeft(y).tickSize(0))
   .select(".domain");

 // Show the X scale
 var x = d3.scaleBand().domain(["Green Area", "Vehicles", "Noise Pollution", "Emissions"]).range([0, width]);
 svgBoxPlot
   .append("g")
   .attr("transform", "translate(0," + height + ")")
   .call(d3.axisBottom(x).ticks(5))
   .select(".domain");
  
  // Compute boxplot properties for each group
  data.forEach(function(group, i) {
    var values = group.values;
    var min = d3.min(values);
    var max = d3.max(values);
    var q1 = d3.quantile(values, 0.25);
    var q2 = d3.quantile(values, 0.5); // median value
    var q3 = d3.quantile(values, 0.75);
    var iqr = q3 - q1; //interquartile range
    var lowerBound = Math.max(min, q1 - 1.5 * iqr);
    var upperBound = Math.min(max, q3 + 1.5 * iqr);
  
    // Vertical lines
    svgBoxPlot.selectAll(".vline" + i)
      .data([min, lowerBound, q1, q2, q3, upperBound, max])
      .enter()
      .append("line")
      .attr("class", "vline" + i)
      .attr("x1", boxWidth / 2 + boxPadding + i * (boxWidth + boxPadding * 2))
      .attr("y1", function(d) { return boxHeight - (d - min) / (max - min) * boxHeight + boxPadding; })
      .attr("x2", boxWidth / 2 + boxPadding + i * (boxWidth + boxPadding * 2))
      .attr("y2", function(d) { return boxHeight - (d - min) / (max - min) * boxHeight + boxPadding; })
      .attr("stroke", "black")
      .attr("stroke-width", 1);
  
    // Boxes
    svgBoxPlot.append("rect")
      .attr("class", "box" + i)
      .attr("x", i * (boxWidth + boxPadding * 2))
      .attr("y", boxHeight - (q3 - min) / (max - min) * boxHeight + boxPadding)
      .attr("width", boxWidth)
      .attr("height", (q3 - q1) / (max - min) * boxHeight)
      .attr("fill", "white")
      .attr("stroke", "black")
      .attr("stroke-width", 1);
  
    // Median line
    svgBoxPlot.append("line")
      .attr("class", "median" + i)
      .attr("x1", i * (boxWidth + boxPadding * 2))
      .attr("y1", boxHeight - (q2 - min) / (max - min) * boxHeight)
      .attr("x2", i * (boxWidth + boxPadding * 2) + boxWidth)
      .attr("y2", boxHeight - (q2 - min) / (max - min) * boxHeight)
      .attr("stroke", "orange")
      .attr("stroke-width", 1);


/** d3.csv(
    "BoxPlotData.csv", 
    function (data) {
      // Compute quartiles, median, inter quantile range min and max --> these info are then used to draw the box.
      var sumstat = d3
        .nest() // nest function allows to group the calculation per level of a factor
       // .key(function (d) {
       //   return d.GreenAreaDensity;
       // })
        .rollup(function (d) {
          q1 = d3.quantile(
            d
              .map(function (g) {
                return g.GreenAreaDensity;
              })
              .sort(d3.ascending),
            0.25
          );
          median = d3.quantile(
            d
              .map(function (g) {
                return g.GreenAreaDensity;
              })
              .sort(d3.ascending),
            0.5
          );
          q3 = d3.quantile(
            d
              .map(function (g) {
                return g.GreenAreaDensity;
              })
              .sort(d3.ascending),
            0.75
          );
          interQuantileRange = q3 - q1;
          min = q1 - 1.5 * interQuantileRange;
          max = q3 + 1.5 * interQuantileRange;
          return {
            q1: q1,
            median: median,
            q3: q3,
            interQuantileRange: interQuantileRange,
            min: min,
            max: max,
          };
        })
        .entries(data);

      // Show the Y scale
      var y = d3
        .scaleLinear()
        .range([height, 0])
        .domain([0,60]); //here map the data with max and min value of all datasets
    
      svgBoxPlot
        .append("g")
        .call(d3.axisLeft(y).tickSize(0))
        .select(".domain");

      // Show the X scale
      var x = d3.scaleBand().domain(["Green Area"]).range([0, width]);
      svgBoxPlot
        .append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(5))
        .select(".domain");

      // Color scale
      var myColor = d3
        .scaleSequential()
        .interpolator(d3.interpolateInferno)
        .domain([0, 60]);

      // Show the main vertical line
      svgBoxPlot
        .selectAll("vertLines")
        .data(sumstat)
        .enter()
        .append("line")
        .attr("x1", function (d) {
          return x(d.value.min);
        })
        .attr("x2", function (d) {
          return x(d.value.max);
        })
        .attr("y1", function (d) {
          return y(d.key) + y.bandwidth() / 2;
        })
        .attr("y2", function (d) {
          return y(d.key) + y.bandwidth() / 2;
        })
        .attr("stroke", "black")
        .style("width", 40);

      // rectangle for the main box
      svgBoxPlot
        .selectAll("boxes")
        .data(sumstat)
        .enter()
        .append("rect")
        .attr("x", function (d) {
          return x(d.value.q1);
        }) // console.log(x(d.value.q1)) ;
        .attr("width", function (d) {
          return x(d.value.q3) - x(d.value.q1);
        }) //console.log(x(d.value.q3)-x(d.value.q1))
        .attr("y", function (d) {
          return y(d.key);
        })
        .attr("height", y.bandwidth())
        .attr("stroke", "black")
        .style("fill", "#69b3a2")
        .style("opacity", 0.3);

      // Show the median
      svgBoxPlot
        .selectAll("medianLines")
        .data(sumstat)
        .enter()
        .append("line")
        .attr("y1", function (d) {
          return y(d.key) + y.bandwidth() / 2;
        })
        .attr("y2", function (d) {
          return y(d.key) + y.bandwidth() / 2;
        })
        .attr("x1", function (d) {
          return x(d.value.median);
        })
        .attr("x2", function (d) {
          return x(d.value.median);
        })
        .attr("stroke", "black")
        .style("width", 80);

        // create a tooltip
        var tooltip = d3
        .select("#boxPlot")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("font-size", "16px");
      // Three function that change the tooltip when user hover / move / leave a cell
      var mouseover = function (d) {
        tooltip.transition().duration(200).style("opacity", 1);
        tooltip
          .html(
            "<span style='color:grey'>Green Area Density: </span>" +
              d.GreenAreaDensity
          ) // + d.Prior_disorder + "<br>" + "HR: " +  d.HR)
          .style("left", d3.mouse(this)[0] + 30 + "px")
          .style("top", d3.mouse(this)[1] + 30 + "px");
      };
      var mousemove = function (d) {
        tooltip
          .style("left", d3.mouse(this)[0] + 30 + "px")
          .style("top", d3.mouse(this)[1] + 30 + "px");
      };
      var mouseleave = function (d) {
        tooltip.transition().duration(200).style("opacity", 0);
      };

      // Add individual points with jitter -- do not work!!
      var jitterWidth = 10;
      svgBoxPlot
        .selectAll("indPoints")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function (d) {
          return x(d.GreenAreaDensity);
        })
        .attr("cy", function (d) {
          return (
            y(d.City) +
            y.bandwidth() / 2 -
            jitterWidth / 2 +
            Math.random() * jitterWidth
          );
        })
        .attr("r", 6)
        .style("fill", function (d) {
          return myColor(+d.GreenAreaDensity);
        })
        .attr("stroke", "black")
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);
    }); **/
/** 
// Parse the Data
d3.csv("BoxPlotData.csv", function(data) {
    // Computation of the statistics of the dataset
    var q1 = d3.quantile(data, .25)
    var median = d3.quantile(data, .5)
    var q3 = d3.quantile(data, .75)
    var interQuantileRange = q3 - q1
    var min = q1 - 1.5 * interQuantileRange
    var max = q3 + 1.5 * interQuantileRange

      data = data.sort(function(a, b) { // sort in ordine crescente
          return d3.ascending(parseFloat(a['City']), parseFloat(b['City']));
      });
      //the maximum value on x axis is that of the worst city
     // XmaxValue = data[data.length-1]['City'];
    


    //setting the axis
    
    // X axis
    x = d3.scaleBand()
    .range([ 0, width ])
    .domain(data.map(function(d) { return d.City; }))
    .padding(.1);
    svgBoxPlot.append("g")
    .call(d3.axisBottom(x))
    
    // Y axis
    y = d3.scaleLinear()
    .domain([0, 30])
    .range([ 0, height]);

    svgBoxPlot.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisLeft(y))
    .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    
  });*/
});

