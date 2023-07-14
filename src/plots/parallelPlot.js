// set the dimensions and margins of the graph
var margin = {top: 30, right: 100, bottom: 10, left: 100},
  width = 800 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

var brushParallelWidth = 50; 
var selectedLines=[]; //qui metto tutte i path della selezione 
var allLines =[]; //qui metto tutti i path
var extents; //questa variabile mi serve per vedere gli estremi del brush
var cityColor = []; //questo array associa ad ogni città un colore
var extentArray = [null, null, null, null, null]; //fixed array with 5 positions
var activeDimensions = [null, null, null, null, null]; // qui metto tutte le dimension attive con il brush
var bestInitialLine = "Savona";
var bestCurrentLine = "";
//from colorBrewer
//var parColors = ['#fee8c8', '#ef6548', '#b30000']; // in substitution of grey, blue, red
var parColors = ['#fee8c8', '#9e9ac8', '#1a9850']; // in substitution of grey, blue, red
//var parLevels = ['others', 'selected', 'best city'];
var pathProva;
var yParallel;

// append the svg object to the body of the page
var svgParallel = d3.select("#parallelPlot")
.append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
.append("g")
  .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");
 

  function updateRelatedGraphsParallel(){
      svgStar.selectAll("*").remove();
      svg.selectAll("*").remove();
      svgBoxPlot.selectAll("*").remove();
      svgScatter.selectAll("*").remove();
      legendScatter.remove();
      
      //bisogna togliere il brush anche allo scatterplot? 

      d3.csv("data/processed/BarChartData.csv", function(data) {
        //qui filtro i dati dei pollutant in base alle città selezionate
        data = data.filter(function(row){
          return row['Air Pollutant'] == selectedPollutant && selectedLines.includes(row['City']);
        });

        data = data.sort(function(a, b) { // sort in ordine crescente
            return d3.ascending(parseFloat(a['Air Pollution Level']), parseFloat(b['Air Pollution Level']));
        });
        if (data.length>0 && data[0]!=null){
          //the maximum value on x axis is that of the worst city
          XmaxValue = data[data.length-1]['Air Pollution Level'];

          //checking which value is setted
          if(order == "top10"){ //prendo le prime 10
              data = data.slice(0, 10);
          }
          else if(order == "worst10"){ //prendo le ultime 10
              data = data.slice(data.length-11,data.length-1);
          }
          currentBestCity = data[0].City;
          //qua la parte aggiuntiva
          bestCurrentLine = currentBestCity;
          //console.log(bestCurrentLine);
        } else {
          currentBestCity = "";
          bestCurrentLine = currentBestCity;
          selectedLines = null;
        }
        if(currentBestCity == ""){
          drawStarPlot(initialBestCity);
        } else {
          drawStarPlot(currentBestCity);
        }
        selectedCities = selectedLines;
        draw(selectedPollutant, XmaxValue, order, selectedLines);
        drawBoxPlot(selectedLines);
        //here I modify the legend of the scatter plot
        //legendScatter.remove(); //aggiorno la legenda dello scatter con il nome della current best city
        //drawScatterLegend(currentBestCity, currentSelectedCity);
        colorSelectionParallel(bestCurrentLine);
        drawScatterPlot(currentBestCity, currentSelectedCity);
        drawScatterLegend(currentBestCity, currentSelectedCity);
    });
  };

function drawParallelPlot(bestCurrentLine, currentSelectedLine){

    console.log("current selected line is: "+ currentSelectedLine);
    // Parse the Data
    d3.csv("data/processed/ParallelPlotData.csv", function(data) {
     
      //console.log("1. best current line is: "+ bestCurrentLine);
      // Here I set the list of dimension manually to control the order of axis:
      dimensions = ["GreenAreaDensity","LowEmission","AutobusStopDensity","CirculatingVehicles","NoiseControl"]

      var tooltipParallel = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

      // Build the X scale -> it find the best position for each Y axis
      var xParallel = d3.scalePoint()
        .range([0, width])
        .domain(dimensions); 

      // For each dimension, I build a linear scale. I store all in a y object
      yParallel = {}
      var name;
      for (i in dimensions) {
        name = dimensions[i]
        //console.log(name);
        yParallel[name] = d3.scaleLinear()
        .domain( d3.extent(data, function(d) { 
            //console.log(+d[name] + " is of type: " + typeof(+d[name])) // print the value and the type
              return +d[name];   // --> Different axis range for each group
          }) )
          .range([height, 0])

          //provare ad associare un brush in questo punto?
          yParallel[name].brush = d3.brushY()
          .extent([
            [-(brushParallelWidth / 2), 0 ],
            [ brushParallelWidth / 2, height]
          ])
          .on("end", function(d,i){ // prima era "start brush end"
            //console.log("here the best city is: "+ bestCurrentLine);
            brushedParallel(d,i, bestCurrentLine);
            updateBestLine(bestCurrentLine, selectedLines)
            //console.log("here the best line (after brushedParallel) is: "+ bestCurrentLine);
            colorSelectionParallel(bestCurrentLine);
            updateRelatedGraphsParallel();
          })
          
          //I store the brush in reference to the axis
          svgParallel.append("g")
          .selectAll("g") //select all the graph
          .data(dimensions)
          .enter().append("g")
            .attr("transform", d=>`translate(${xParallel(d)}, 0)`)
          .attr("class", "brush")
          .call(yParallel[name].brush);

      }

      // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
      function path(d) {
        return d3.line()(dimensions.map(function(column) {
          return [xParallel(column), yParallel[column](d[column])]; 
          }));
      } 

      // Draw the lines
      pathProva = svgParallel
        .selectAll("myPath")
        .data(data)
        .enter()
        .append("path")
          .attr("class", "pt") //here I call my class pt
          .attr("class", function (d) { 
            //console.log("line"+d.City); //stampa effettivamente tutte le città precedute da line
            return "line" + d.City;
          } ) // 2 class for each line: 'line' followed by the name of the city
          .attr("d", function(d){
            //console.log("here d: "+d);
            return path(d); //funziona!
          })
          .style("fill", "none" )
          .style("stroke", function(d){
            //console.log(d.City);
            if(d.City === bestCurrentLine){
              //console.log("2. best current line is: "+ bestCurrentLine);
              return parColors[2];
            } // serve per evidenziare la città migliore
            else if (d.City === currentSelectedLine){
              return '#d95f02'; //rosso
            }
            else{
              return parColors[1];
            }
          })
          .style("stroke-width", "2px")
          .style("opacity", function(d){
            if(d.City === bestCurrentLine){
              return 1;
            } // serve per evidenziare la città migliore
            else if (d.City === currentSelectedLine){
              return 1;
            }
            else{
              return 0.6;
            }
          })
          .on("mouseover", function(d){
            tooltipParallel.transition()
                  .duration(100)
                  .style("opacity", 1);
            tooltipParallel.html(d.City)
                  .style("left", (d3.event.pageX + 10) + "px")
                  .style("top", (d3.event.pageY - 15) + "px");
          }
          )
          .on("mouseleave", function(d){
            tooltipParallel.transition()
                  .duration('200')
                  .style("opacity", 0);
          }) 
        
        pathProva.sort(function(a, b) {
            if (a.City === bestCurrentLine) return 1; // Move bestCurrentLine to the end
            if (b.City === bestCurrentLine) return -1; // Move bestCurrentLine to the end
        
            if (a.City === currentSelectedCity) return 1; // Move currentSelectedLine to the end
            if (b.City === currentSelectedCity) return -1; // Move currentSelectedLine to the end
        
            if (selectedLines.includes(a.City) && !selectedLines.includes(b.City)) return 1; // Move selected lines before other lines
            if (!selectedLines.includes(a.City) && selectedLines.includes(b.City)) return -1; // Move other lines after selected lines
            return 0;
        })

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
        .style("stroke-width", "1.5px") //added to have all the axis the same width
        // Add axis title
        .append("text")
          .style("text-anchor", "middle")
          .attr("y", -9)
          .text(function(d) { return d; })
          .style("fill", "black")
        .raise();

     
 
    })
// LEGEND
      drawParallelLegend();

} // fine drawparallelPlot


function removeItemOnce(arr, value) {
            var index = arr.indexOf(value);
            if (index > -1) {
              arr.splice(index, 1);
            }
            return arr;
          }

//function passed to the brush to highlight the y axis 
function brushedParallel(d,index, bestCurrentLine) { 
  extents = d3.event.selection;

  extentArray[index] = extents; 
  if(extents === null){
    extentArray[index] = null;
  }
  //console.log("extentArray is:" + extentArray);
  
  activeDimensions[index] = null;
 
  if (extents !== null){
    activeDimensions[index] = d;
  }

  //console.log("activeDimensions: "+ activeDimensions);
  pathProva.style("fill", function(rowdata){

    if(!allLines.includes(rowdata.City)){
      allLines.push(rowdata.City)
    }
     
    selectedLines = allLines;
    //console.log("here selected lines: "+ selectedLines);
    var j;
    for (j= 0; j < extentArray.length; j++){
        
        var ext = extentArray[j];

        if(ext){ //brush è attivo
          //qui la dimensione che sto analizzando
          var dim = activeDimensions[j]; 
          if(yParallel[dim](rowdata[dim]) < ext[0] || yParallel[dim](rowdata[dim]) > ext[1]){ //caso in cui non sto nel range
              removeItemOnce(selectedLines, rowdata.City); //rimuovo la città
          }
        
        }
      } 
    //console.log("here selected lines: "+ selectedLines);
    return "none";
  })
 
  //colorSelectionParallel(bestCurrentLine);
  //console.log("here the best city: "+ bestCurrentLine);
} 

//FUNCTION TO COLOR THE SELECTION AND THE BEST CURRENT CITY
function colorSelectionParallel(bestCurrentLine){

  pathProva.style("stroke", function(rowdata){
    if (rowdata.City === currentSelectedCity) return '#d95f02';
    if(selectedLines.includes(rowdata.City)){
      if(rowdata.City === bestCurrentLine){ // ho sostituito a currentBestCity --> bestCurrentLine
        //console.log("3. best current line is: "+ bestCurrentLine); 
        return parColors[2];
      }
      else {return parColors[1]; }
    }
    else{
      return parColors[0];
    }
  })
  .style("opacity", function(rowdata){
    if(!selectedLines.includes(rowdata.City)){
        return 0.8;    
    }
    else{
      if(selectedLines.length === 92){ 
        if(rowdata.City === bestCurrentLine || rowdata.City === currentSelectedCity){ return 1;} // ho sostituito a currentBestCity --> bestCurrentLine
        else {return 0.6};
      } //if I have all the cities(92), I return to the initial value
      else{
        if(rowdata.City == bestCurrentLine){ return 1;} // ho sostituito a currentBestCity --> bestCurrentLine
        else {return 0.8};
      } 
    }
  })
  .sort(function(a, b) {
    if (a.City === bestCurrentLine) return 1; // Move bestCurrentLine to the end
    if (b.City === bestCurrentLine) return -1; // Move bestCurrentLine to the end

    if (a.City === currentSelectedCity) return 1; // Move currentSelectedLine to the end
    if (b.City === currentSelectedCity) return -1; // Move currentSelectedLine to the end

    if (selectedLines.includes(a.City) && !selectedLines.includes(b.City)) return 1; // Move selected lines before other lines
    if (!selectedLines.includes(a.City) && selectedLines.includes(b.City)) return -1; // Move other lines after selected lines
    return 0;
  });
}

//LEGEND
function drawParallelLegend() {
  const legendData = [
    { label: "Best", color: "#1a9850" },
    { label: "Selected", color: "#9e9ac8" },
    { label: "Others", color: "#fee8c8" },
    { label: "Chosen City", color: "#d95f02" },
  ];
 const graphWidth = width; // Calculate or set the width of the graph
  const graphHeight = height; // Calculate or set the height of the graph

  const legendX = 10; // Calculate or set the x position of the legend
  const legendY = 20; // Calculate or set the y position of the legend
  const legendWidth = 10; // Calculate or set the width of the legend

  const legendParallel = svgParallel
    .append("g")
    .attr("class", "legend")
    .attr("transform", "translate(" + (graphWidth + legendX) + ", " + legendY + ")"); // Adjust the x and y coordinates as needed

  const legendItems = legendParallel
    .selectAll(".legend-item")
    .data(legendData)
    .enter()
    .append("g")
    .attr("class", "legend-item")
    .attr("transform", function (d, i) {
      return "translate(0, " + i * 20 + ")"; // Adjust the y position of each legend item
    });

  legendItems
    .append("circle")
    .attr("cx", 10) // Adjust the x position of the circle
    .attr("cy", 10) // Adjust the y position of the circle
    .attr("r", 5) // Adjust the radius of the circle
    .style("fill", function (d) {
      return d.color;
    });

  legendItems
    .append("text")
    .attr("x", 20) // Adjust the x position of the label relative to the circle
    .attr("y", 12) // Adjust the y position of the label relative to the circle
    .text(function (d) {
      return d.label;
    });

  svgParallel.attr("width", width + legendWidth); // Adjust the width of the SVG container

  const graphGroup = svgParallel
    .append("g")
    .attr("class", "graph")
    .attr("transform", "translate(0, " + legendY + ")"); // Adjust the y position of the graph group

  // Add your graph elements and code here, positioning them relative to the graphGroup

  legendParallel.attr("transform", "translate(" + (width + legendX) + ", 0)"); // Adjust the x position of the legend

  svgParallel.attr("height", Math.max(graphHeight, legendY + legendItems.size() * 20)); // Adjust the height of the SVG container
}

//FUNCTION TO UPDATE THE BEST CURRENT LINE 
function updateBestLine(bestCurrentLine, selectedLines){
    d3.csv("data/processed/BarChartData.csv", function(data) {
      //qui filtro i dati dei pollutant in base alle città selezionate
      
      data = data.filter(function(row){
        return row['Air Pollutant'] == selectedPollutant && selectedLines.includes(row['City']);
      });

      data = data.sort(function(a, b) { // sort in ordine crescente
          return d3.ascending(parseFloat(a['Air Pollution Level']), parseFloat(b['Air Pollution Level']));
      });

      console.log("data is : " + data[0]);
      bestCurrentLine = data[0].City;
      
      console.log("best current line is :"+ bestCurrentLine)
    
      if(bestCurrentLine === ""){
        bestCurrentLine = bestInitialLine;
      } 

      });
    
}

if(bestCurrentLine === ""){
  drawParallelPlot(bestInitialLine, currentSelectedCity);
}
else {
  drawParallelPlot(bestCurrentLine, currentSelectedCity);
}
