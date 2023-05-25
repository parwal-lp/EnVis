const scatterArea = d3.select('#scatterPlot'); //select html area for star plot
margin.right = 100;
const svgScatter = scatterArea.append('svg') //create svg for the starplot
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom) //set dimensions of starplot

function drawScatterPlot(){
    d3.csv("../../data/processed/pcaResults.csv", function(data) { //retrieve the data
      // ------------ PRENDO I DATI CHE MI SERVONO --------------- //
      // Add X axis
  var x = d3.scaleLinear()
    .domain([-3, 5])
    .range([ 0, width ]);
  svgScatter.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  // Add Y axis
  var y = d3.scaleLinear()
    .domain([-3, 5])
    .range([ height, 0]);
    svgScatter.append("g")
    .call(d3.axisLeft(y));

  // Add dots
  svgScatter.append('g')
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
      .attr("cx", function (d) { return x(d.PC1); } )
      .attr("cy", function (d) { return y(d.PC2); } )
      .attr("r", 1.5)
      .style("fill", "#69b3a2")
    });
}

drawScatterPlot();