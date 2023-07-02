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
var bestCurrentLine = currentBestCity;
//from colorBrewer
var parColors = ['#fee8c8', '#ef6548', '#b30000']; // in substitution of grey, blue, red
var parLevels = ['others', 'selected', 'best city'];

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
      
      //bisogna togliere il brush anche allo scatterplot? 

      d3.csv("../../data/processed/BarChartData.csv", function(data) {

        //al posto di selected city ho selected lines?
        //selectedCities = selectedLines; // da vedere bene: se metto selectedCities mi da un errore strano 

        //console.log("inside the update, the cities are: "+ selectedLines);
        
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
        } else {
          currentBestCity = "";
          bestCurrentLine = currentBestCity;
          selectedLines = null;
        }
        drawStarPlot(currentBestCity);
        draw(selectedPollutant, XmaxValue, order, selectedLines);
        drawBoxPlot(selectedLines);
    });
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
            //qua inserire l'update dei graph
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
      
      // Highlight the specie that is hovered
      var highlight = function(d){

        selected_value = d.City;

        // first every group turns grey
        d3.selectAll(".line")
          .transition().duration(200)
          .style("stroke", "grey")
          .style("opacity", "0.5")
        // Second the hovered specie takes its color
        d3.selectAll(".line" + selected_value)
          .transition().duration(300)
          .style("stroke","blue") //blue highlight
          .style("opacity", "1")
      }

      // Unhighlight
      var doNotHighlight = function(d){

        selected_value = d.City;
        
        d3.selectAll(".line" + selected_value)
          .transition().duration(300).delay(300)
          .style("stroke", "grey" ) //grey : no highlight
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
          .style("stroke", function(d){
            if(d.City ==currentBestCity){
              return parColors[2];
            } // serve per evidenziare la città migliore
            else{
              return parColors[1];
            }
          })
          .style("stroke-width", "2px")
          .style("opacity", function(d){
            if(d.City ==currentBestCity){
              return 1;
            } // serve per evidenziare la città migliore
            else{
              return 0.4;
            }
          })
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
      //console.log("Prova funzione brushed");
      //console.log("inside brushedParallel");
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

      //console.log("activeDimensions: "+ activeDimensions);

      pathProva.style("stroke", function(rowdata){

        if(!allLines.includes(rowdata.City)){
          allLines.push(rowdata.City)
        }
         
        selectedLines = allLines;
        //console.log("here selected lines: "+ selectedLines);
        var j;
        for (j= 0; j < extentArray.length; j++){
            //console.log("rowdata is :"+ yParallel[d](rowdata[d]));
            //console.log("the value of the city: "+rowdata.City);
            var ext = extentArray[j];
            //console.log("the index is "+ j);
            //console.log("extent is: "+ ext);
            if(ext){ //brush è attivo
              //qui la dimensione che sto analizzando
              var dim = activeDimensions[j]; 
              if(yParallel[dim](rowdata[dim]) < ext[0] || yParallel[dim](rowdata[dim]) > ext[1]){ //caso in cui non sto nel range
                  removeItemOnce(selectedLines, rowdata.City); //rimuovo la città
                  //console.log(selectedLines);
              }
            
            }
          } 

        if(selectedLines.includes(rowdata.City)){
          if(rowdata.City == currentBestCity){ 
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
            if(rowdata.City == currentBestCity){ return 1;}
            else {return 0.4};
          } //if I have all the cities(92), I return to the initial value
          else{
            if(rowdata.City == currentBestCity){ return 1;}
            else {return 0.8};
          } 
        }
      })
      .sort(function(a, b) {
        if (a.City === currentBestCity) return 1; // Move currentBestCity to the end
        if (b.City === currentBestCity) return -1; // Move currentBestCity to the end
        return 0;
      })
      .filter(function(rowdata) {
        return selectedLines.includes(rowdata.City);
      })
      .raise();

      svgParallel.selectAll("myAxis").raise(); //funziona solo al momento in cui lo disegno 

    } 



    })
    // LEGEND
  drawParallelLegend(currentBestCity, selectedLines);
}

//LEGEND
function drawParallelLegend(currentBestCity, selectedLines){

  
  legendParallel = svgParallel.append("g")
  .attr("class", 'node')

   // do something
  
  //posiziono la legenda al centro, questo significa spostarla dinamicamente in base alla larghezza che il testo occupa
  legendParallel.attr("transform", `translate(20, -10)`) 

  
}

drawParallelPlot();