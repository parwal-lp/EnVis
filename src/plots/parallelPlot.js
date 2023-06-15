// set the dimensions and margins of the graph
var margin = {top: 30, right: 30, bottom: 10, left: 40},
  width = 560 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

var brushParallelWidth = 50; 
var selectedLines=[]; //qui metto tutte i path della selezione 
var allLines =[]; //qui metto tutti i path

// append the svg object to the body of the page
var svgParallel = d3.select("#parallelPlot")
.append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
.append("g")
  .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");


//console.log(-(brushParallelWidth / 2) , margin.top);
//console.log(brushParallelWidth / 2 , width - margin.bottom);

//initialize the brush
/* const brushParallel = d3.brushY()
  .extent([
    [-(brushParallelWidth / 2), 0 ],
    [ brushParallelWidth / 2, height]
  ])
  .on("start brush end", brushedParallel) */
  //.on("end", updateRelatedGraphsParallel); // quando ho finito la selezione chiamo la funzione di update

//function passed to the brush to highlight the y axis 
/*  function brushedParallel() {
    console.log("Prova funzione brushed");
    extent = d3.event.selection; //take as input the selection of the event brush
    selectedLines=[];
    //scorrere tutti i path del grafico 
    d3.selectAll(".pt").each(function(column){
      xParallel(column), yParallel[column](d[column])
    })
    

  }*/

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
        // .domain( [0,150] ) // --> Same axis range for each group
        .domain( d3.extent(data, function(d) { 
            //console.log(+d[name] + " is of type: " + typeof(+d[name])) // print the value and the type
              return +d[name];   // --> Different axis range for each group
          }) )
          .range([height, 0])

          //provare ad associare un brush in questo punto?
          /*yParallel[name].brush = d3.brushY()
          .extent([
            [-(brushParallelWidth / 2), 0 ],
            [ brushParallelWidth / 2, height]
          ])
          .on("start brush end", brushedParallel)*/
      }
      
      // Highlight the specie that is hovered
      var highlight = function(d){

        //selected_city = d.City

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
          //console.log("here's the y coordinate of the axes: " + yParallel[column](d[column])); // questi invece sono i valori effettivi del grafico
          //console.log("column is " + column);
          //console.log("d[column] is "+ d[column]); // d[column] sono i valori riga per riga
          return [xParallel(column), yParallel[column](d[column])]; 
          }));
      } 

      // Draw the lines
      svgParallel
        .selectAll("myPath")
        .data(data)
        .enter()
        .append("path")
          //.attr("class", "pt") //here I call my class pt
          .attr("class", function (d) { 
            //console.log("line"+d.City); //stampa effettivamente tutte le città precedute da line
            return "line" + d.City;
          } ) // 2 class for each line: 'line' and the group name
          .attr("d", function(d){
            //console.log("here d: "+d);
            return path(d); //funziona!
          })
          .style("fill", "none" )
          .style("stroke", function(d){ return("#AAA")} )
          .style("opacity", 0.5)
          //.on("mouseover", highlight)
          //.on("mouseleave", doNotHighlight ) 

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
  
        //initialize the brush
        const brushParallel = d3.brushY()
        .extent([
          [-(brushParallelWidth / 2), 0 ],
          [ brushParallelWidth / 2, height]
        ])
        .on("start brush end", brushedParallel)

      //here I append the parallel brush for every axis --- store in a variable?
        svgParallel.append("g")
          .selectAll("g") //select all the graph
          .data(dimensions)
          .enter().append("g")
            .attr("transform", d=>`translate(${xParallel(d)}, 0)`)
          .attr("class", "brush")
          .call(brushParallel);

  //function passed to the brush to highlight the y axis 
  function brushedParallel() { //to do: passare in imput la colonna corrente
      console.log("Prova funzione brushed");
      //var actives = dimensions.filter(function(p){ return !yParallel[p].event.selection.empty(); });
      extent = d3.event.selection; //sarebbe il punto in alto e in basso della selezione brush
      //questi array servono per la colorazione dei path
      selectedLines=[]; //li inizializzo a insieme vuoto
      allLines =[]; //li inizializzo a insieme vuoto

      //parte nuova prova
      var brushArea = d3.brushSelection(this); //funziona allo stesso modo di extent
      console.log("brush area is :"+ brushArea);
      
      for (var i in dimensions){
        //var coordY = yParallel[i](dimensions[i]); // column is not defined
        //console.log(coordY);


      }

//per ogni dimensione attiva

//prendo il brush della funzione

//coloro i path che sono selezionati dal brush

//scorrere tutti i path del grafico 
      svgParallel.selectAll("myPath")
      .data(data)
      .each(dimensions.map(function(d,column){
          //console.log("column "+column);
          var myLine = this; //salvo la linea del path 
          //console.log(path); //per ora è undefined quando è pieno e null quando clicco per togliere il brush
          console.log("my line "+path(myLine)); //I obtain a rowof the type: M0,NaNL122.5,NaNL245,NaNL367.5,NaNL490,NaN 
          //allLines.push(myLine);
          console.log(brushArea);
          console.log("dentro dimension map");
          //console.log(extent);
          //console.log(yParallel[column](d[column])); //per ora è NaN
          /*  if(extent[0][0] > yParallel[column](this.d[column]) && extent[0][1] < yParallel[column](this.d[column])){
              console.log(yParallel[column](this.d[column]));
              console.log("la brush funziona");
              //selectedLines.push(myLine); //qui pusho solo le linee selezionate
            } */
        // path(d); yParallel[column](d[column])
        // xParallel(column), yParallel[column](d[column])
        })); 
    } 

    })
    
}

drawParallelPlot();