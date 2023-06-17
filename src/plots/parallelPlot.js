// set the dimensions and margins of the graph
var margin = {top: 30, right: 100, bottom: 10, left: 100},
  width = 900 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

var brushParallelWidth = 50; 
var selectedLines=[]; //qui metto tutte i path della selezione 
var allLines =[]; //qui metto tutti i path
var extents; //questa variabile mi serve per vedere gli estremi del brush
var cityColor = []; //questo array associa ad ogni città un colore
var extentArray = [null, null, null, null, null]; //fixed array with 5 positions
var activeDimensions = [null, null, null, null, null]; // qui metto tutte le dimension attive con il brush

// append the svg object to the body of the page
var svgParallel = d3.select("#parallelPlot")
.append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
.append("g")
  .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

  function updateRelatedGraphsParallel(){
    //cancello il grafico che va aggiornato 
    
    //tramite d3.csv prendo i dati del Barchart e aggiorno sia il barchart, sia lo starplot

    //tramite d3.csv prendo i dati del boxplot e aggiorno il boxplot

    //Evidenzio anche le città selezionate nello scatterplot?
    
    //richiamo la funzione draw per ogni grafico
  };

function drawParallelPlot(){
    // Parse the Data
    d3.csv("../../data/processed/ParallelPlotData.csv", function(data) {

      // Here I set the list of dimension manually to control the order of axis:
      dimensions = ["GreenAreaDensity","LowEmission","AutobusStopDensity","CirculatingVehicles","ExposedNoisePollution"]

      var tooltipParallel = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

      // Build the X scale -> it find the best position for each Y axis
      var xParallel = d3.scalePoint()
        .range([0, width])
        .domain(dimensions); 

      // For each dimension, I build a linear scale. I store all in a y object
      var yParallel = {}
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
            //console.log("inside the creation of the brush, d is: "+d); 
            //console.log("inside the creation of the brush, i is: "+i); 
            brushedParallel(d,i);
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
      
      // Highlight the specie that is hovered
      var highlight = function(d){

        selected_value = d.City;

        // first every group turns grey
        d3.selectAll(".line")
          .transition().duration(200)
          .style("stroke", "#AAA")
          .style("opacity", "0.5")
        // Second the hovered specie takes its color
        d3.selectAll(".line" + selected_value)
          .transition().duration(300)
          .style("stroke","#4682B4") //blue highlight
          .style("opacity", "1")
      }

      // Unhighlight
      var doNotHighlight = function(d){

        selected_value = d.City;
        
        d3.selectAll(".line" + selected_value)
          .transition().duration(300).delay(300)
          .style("stroke", "#AAA" ) //grey : no highlight
          .style("opacity", "1")
      } 

      // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
      function path(d) {
        return d3.line()(dimensions.map(function(column) {
          return [xParallel(column), yParallel[column](d[column])]; 
          }));
      } 

      // Draw the lines
      var pathProva = svgParallel
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
          .style("stroke", "grey") //grey color
          .style("stroke-width", "2px")
          .style("opacity", 0.5)
          .on("mouseover", function(d){
            //highlight(d);
            tooltipParallel.transition()
                  .duration(100)
                  .style("opacity", 1);
            tooltipParallel.html(d.City)
                  .style("left", (d3.event.pageX + 10) + "px")
                  .style("top", (d3.event.pageY - 15) + "px");
          }
          )
          .on("mouseleave", function(d){
            //doNotHighlight(d); 
            tooltipParallel.transition()
                  .duration('200')
                  .style("opacity", 0);
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

      function removeItemOnce(arr, value) {
            var index = arr.indexOf(value);
            if (index > -1) {
              arr.splice(index, 1);
            }
            return arr;
          }
      
      function removeItemAll(arr, value) {
            var i = 0;
            while (i < arr.length) {
              if (arr[i] === value) {
                arr.splice(i, 1);
              } else {
                ++i;
              }
            }
            return arr;
          }
      
      function checkNullInIndex(arr, index){ //not working for now
            if(arr[index] === null){
              return true;
            }
            else{
              return false;
            }
          }

  
//function passed to the brush to highlight the y axis 
  function brushedParallel(d,index) { 
      console.log("Prova funzione brushed");
      //console.log("here d is: "+ d); 
      extents = d3.event.selection;
      //console.log("brush area is :"+ extents);

      extentArray[index] = extents; 
      if(extents === null){
        extentArray[index] = null;
      }
      console.log("extentArray is:" + extentArray);
      
      activeDimensions[index] = null;
     
      if (extents !== null){
        activeDimensions[index] = d;
      }

      console.log("activeDimensions: "+ activeDimensions);

      pathProva.style("stroke", function(rowdata){

        if(!allLines.includes(rowdata.City)){
          allLines.push(rowdata.City)
        }
         
        selectedLines = allLines;
        console.log("here selected lines: "+ selectedLines);
        var j;
        for (j= 0; j < extentArray.length; j++){
            //console.log("rowdata is :"+ yParallel[d](rowdata[d]));
            //console.log("the value of the city: "+rowdata.City);
            var ext = extentArray[j];
            console.log("the index is "+ j);
            console.log("extent is: "+ ext);
            if(ext){ //brush è attivo
              //qui la dimensione che sto analizzando
              var dim = activeDimensions[j]; 
              if(yParallel[dim](rowdata[dim]) < ext[0] || yParallel[dim](rowdata[dim]) > ext[1]){ //caso in cui non sto nel range
                  removeItemOnce(selectedLines, rowdata.City); //rimuovo la città
                  console.log(selectedLines);
              }
            
            }
          } 

        if(selectedLines.includes(rowdata.City)){
          return "blue";
        }
        else{
          return "grey";
        }

      });

    } 

    })
    
}

drawParallelPlot();