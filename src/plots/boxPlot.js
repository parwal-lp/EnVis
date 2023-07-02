
// set the dimensions and margins of the graph
var margin = {top: 10, right: 30, bottom: 30, left: 40},
    width = 800 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svgBoxPlot = d3.select("#boxPlot")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

function drawBoxPlot(currentSelection){

// Read the data and compute summary statistics for each specie
d3.csv("../../data/processed/BoxPlotData.csv", function(error, data) {
  if (error) throw error;

  if (currentSelection!=null){
    data = data.filter(function(row){
        return currentSelection.includes(row['City']);
    });
}

  //filter the data to eliminate the null value

  // Compute quartiles, median, inter quantile range min and max --> these info are then used to draw the box.
  var sumstat = d3.nest() // nest function allows to group the calculation per level of a factor
    .key(function(d) { return d.Category ;}) 
    .rollup(function(d) {
      //here I extract the array of reference with the category chosen
      arrayReferenceAscending = d.map(function(g) { return g.Value;}).sort(function(a, b) { 
        return d3.ascending(parseFloat(a), parseFloat(b)); });
      arrayReferenceDescending = d.map(function(g) { return g.Value;}).sort(function(a, b) { 
        return d3.descending(parseFloat(a), parseFloat(b)); });
     
      q1 = d3.quantile(arrayReferenceAscending,.25);
      median = d3.quantile(arrayReferenceAscending,.5);
      q3 = d3.quantile(arrayReferenceAscending,.75);

      ////console.log(d.map(function(g) { return g.Value;}).sort(d3.ascending));
      ////console.log("here starts the array");
      ////console.log(arrayReference);
      ////console.log(arrayReference[0]); //here's the new way to compute the min and max of the array of reference
      
      interQuantileRange =  q3 - q1;
      sogliaOutlierMin = q1 - 1.5 * interQuantileRange;//d3.min(function(d) { return +d.Value; }); //q1 - 1.5 * interQuantileRange; //inserire qui il min value dell'array
      sogliaOutlierMax = q3 + 1.5 * interQuantileRange;//d3.max(function(d) { return +d.Value; });//q3 + 1.5 * interQuantileRange; //inserire qui il max value dell'array
      min = arrayReferenceAscending[0];
      max = arrayReferenceDescending[0];
      /*
      let datiPerCategoria = data.filter(function(row){
        return row['Category'] == row.Category;
      });
      let minDatiOrdinati = datiPerCategoria.sort(function(a, b) { // sort in ordine crescente
          return d3.ascending(parseFloat(a['Value']), parseFloat(b['Value']));
      });
      ////console.log(datiPerCategoria);
      min = minDatiOrdinati[0]['Value'];

      let maxDatiOrdinati = datiPerCategoria.sort(function(a, b) { // sort in ordine crescente
        return d3.descending(parseFloat(a['Value']), parseFloat(b['Value']));
      });
      max = maxDatiOrdinati[0]['Value'];*/

      ////console.log("----here starts the values for each category----")
      ////console.log("min:" + min);
      ////console.log("max: " + max);
      ////console.log("median: "+ median);
      ////console.log ("interQuantile range: "+ interQuantileRange);
      ////console.log("q1: "+q1+ " q3: "+ q3);
      return({q1: q1, median: median, q3: q3, interQuantileRange: interQuantileRange, min: d3.max([0, sogliaOutlierMin]), max: d3.min([100, sogliaOutlierMax])})
    })
    .entries(data) 

  // Show the X scale
  var x = d3.scaleBand()
    .range([ 0, 700])
    .domain(["GreenAreaDensity", "Fuel", "Diesel", "LowEmission", "IndustrialNoise", "CommercialNoise", "Road_Waste"]) //to add "Door_to_door_Waste"
    .paddingInner(1)
    .paddingOuter(.5)
  svgBoxPlot.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))

  // Show the Y scale
  var y = d3.scaleLinear()
    .domain([0,100]) //il dominio dovrebbe essere da 0 a maxvalue no?
    .range([height, 0])
  svgBoxPlot.append("g").call(d3.axisLeft(y))

  // Show the main vertical line
  svgBoxPlot
    .selectAll("vertLines")
    .data(sumstat)
    .enter()
    .append("line")
      .attr("x1", function(d){return(x(d.key))})
      .attr("x2", function(d){return(x(d.key))})
      .attr("y1", function(d){return(y(d.value.min))})
      .attr("y2", function(d){return(y(d.value.max))})
      .attr("stroke", "black")
      .style("width", 40)

  // rectangle for the main box
  var boxWidth = 50 //prima era 100
  svgBoxPlot
    .selectAll("boxes")
    .data(sumstat)
    .enter()
    .append("rect")
        .attr("x", function(d){ return(x(d.key)-boxWidth/2)})
        .attr("y", function(d){return(y(d.value.q3))})
        .attr("height", function(d){return(y(d.value.q1)-y(d.value.q3))}) //questa riga è un problema per i Low emission che hanno i valori scambiati
        .attr("width", boxWidth )
        .attr("stroke", "black")
        .style("fill", "#8c6bb1")

  // Show the median
  svgBoxPlot
    .selectAll("medianLines")
    .data(sumstat)
    .enter()
    .append("line")
      .attr("x1", function(d){return(x(d.key)-boxWidth/2) })
      .attr("x2", function(d){return(x(d.key)+boxWidth/2) })
      .attr("y1", function(d){return(y(d.value.median))})
      .attr("y2", function(d){return(y(d.value.median))})
      .attr("stroke", "black")
      .style("width", 80)

// Add individual points with jitter
/* var jitterWidth = 40
svgBoxPlot
  .selectAll("indPoints")
  .data(data)
  .enter()
  .append("circle")
    .attr("cx", function(d){return(x(d.Category) - jitterWidth/2 + Math.random()*jitterWidth )})
    .attr("cy", function(d){return(y(d.Value))})
    .attr("r", 4)
    .style("fill", "white")
    .attr("stroke", "black")*/


});

/**
 * //HERE THE CODE WITH PLOTLY -- not to do 
 * 
 * d3.csv("BoxPlotData.csv", function(error, data) {
    if (error) throw error;
  
    var trace1 = {
        y: data.map(function(row) { return row.GreenAreaDensity; }),//[1, 2, 3, 4, 4, 4, 8, 9, 10], //here insert the data about the green areas
        type: 'box',
        name: 'Green Areas',
        marker:{
        color: 'rgb(26, 125, 76)'
        }
    };
    
    var trace2 = {
        y: data.map(function(row) { return row.VehicleDensity; }), // vedere se fare i veicoli ogni 100 persone oppure totali
        type: 'box',
        name: 'Vehicles',
        marker:{
        color: 'rgb(118, 54, 115)'
        }
    };

    var trace3 = {
        y: data.map(function(row) { return row.NoisePollution; }),
        type: 'box',
        name: 'Noise Pollution',
        marker:{
        color: 'rgb(50, 100, 207)'
        }
    };

    var trace4 = {
        y: data.map(function(row) { return row.GasBifuel; }),
        type: 'box',
        name: 'Gas and Bi-fuel',
        marker:{
        color: 'rgb(36,100,128)'
        }
    };

    var trace5 = {
        y: data.map(function(row) { return row.TotalEmission; }),
        type: 'box',
        name: 'Total Emission',
        marker:{
        color: 'rgb(36,0,128)'
        }
    };
    
    var showData = [trace1, trace2, trace3, trace4, trace5];

    var layout = {
        width: '50%',
    height: '50%'
    };
    
    Plotly.newPlot('boxPlot', showData, layout);
});**/
}


drawBoxPlot();