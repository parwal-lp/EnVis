// set the dimensions and margins of the graph
var margin = {top: 30, right: 100, bottom: 10, left: 100},
  width = 900 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

var brushParallelWidth = 50; 
var selectedLines=[]; //qui metto tutte i path della selezione 
var allLines =[]; //qui metto tutti i path
var activeDimensions = []; // qui metto tutte le dimension attive con il brush
var extents; //questa variabile mi serve per vedere gli estremi del brush
var cityColor = []; //questo array associa ad ogni città un colore

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
        // .domain( [0,150] ) // --> Same axis range for each group
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
          .on("start brush end", function(d){
            //console.log("inside the creation of the brush, d is: "+d); //prende solamente il valore effettivo del brush selezionato!!
            brushedParallel(d);
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
          .style("stroke", "lightgrey")
          .style("opacity", "0.5")
        // Second the hovered specie takes its color
        d3.selectAll(".line" + selected_value)
          .transition().duration(300)
          .style("stroke",function(p){ return( "#4682B4");}) //blue highlight
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
          //console.log("here's the y coordinate of the axes: " + yParallel[column](d[column])); // questi invece sono i valori effettivi del grafico
          //console.log("column is " + column);
          //console.log("d[column] is "+ d[column]); // d[column] sono i valori riga per riga
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
  
        //initialize the brush
    /*    const brushParallel = d3.brushY()
        .extent([
          [-(brushParallelWidth / 2), 0 ],
          [ brushParallelWidth / 2, height]
        ])
        .on("start brush end", brushedParallel)*/

      //here I append the parallel brush for every axis --- store in a variable?
      /*  svgParallel.append("g")
          .selectAll("g") //select all the graph
          .data(dimensions)
          .enter().append("g")
            .attr("transform", d=>`translate(${xParallel(d)}, 0)`)
          .attr("class", "brush")
          .call(brushParallel);*/

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

  
//function passed to the brush to highlight the y axis 
  function brushedParallel(d) { //passo in imput la colonna corrente
      console.log("Prova funzione brushed");
      //console.log("here d is: "+ d); //now i print the column
      //var actives = dimensions.filter(function(p){ return !yParallel[p].event.selection.empty(); });
      extents = d3.event.selection; //sarebbe il punto in alto e in basso della selezione brush
      console.log("brush area is :"+ extents);
      console.log("brush of y[d] "+ yParallel[d].brush[0]);
      //questi array servono per la colorazione dei path
      //selectedLines=[]; //li inizializzo a insieme vuoto
      //allLines =[]; //li inizializzo a insieme vuoto
      
    //rimuovo la dimensione d
    removeItemOnce(activeDimensions,d);
    //la riaggiungo all'array nel caso extents sia diverso da null
    if (!activeDimensions.includes(d) && extents !== null){
      activeDimensions.push(d);
    }
    //a questo punto ho tutte le dimensioni attive! Me le stampo nella console per controllarle 
    console.log("activeDimensions: "+ activeDimensions);

    pathProva.style("stroke", function(rowdata){
      if(!allLines.includes(rowdata.City)){
        allLines.push(rowdata.City)
      }
      
      console.log("rowdata is :"+ yParallel[d](rowdata[d])) //questo prende effettivamente tutti i dati di quella colonna
      console.log("the value of the city: "+rowdata.City); //effettivamente stampa tutte le città
      if(extents){ //gestione del caso: non ho più il brush su quell'asse
        if(yParallel[d](rowdata[d]) >= extents[0] && yParallel[d](rowdata[d]) <= extents[1]){ //caso in cui sto nel range
          if(!selectedLines.includes(rowdata.City)){
            selectedLines.push(rowdata.City);
          }
          return "blue";//blue
        }
        else{ //caso in cui non sto nel range
          if(selectedLines.includes(rowdata.City)){ //se era già presente ma non sta nella selezione attuale lo tolgo 
            removeItemOnce(selectedLines,rowdata.City);
          }
          return "grey"; 
        }//grey
      }
      else{ //caso extents = null, levo il brush e ripristino tutto a grey
        return "grey";
      }
    });

    console.log(selectedLines);
    console.log(allLines);

//qui devo controllare il valore y di quella colonna di tutti i path (yParallel[d](rowdata[d])) e se sono compresi negli estremi di extent li coloro

//attenzione! in questo caso d non sono i dati ma le colonne (quelle che passo in imput a brushedParallel)

//trovare il modo di importare i rowdata...modo simile a quello in cui creiamo i path?

//scorrere tutti i path del grafico 
/*svgParallel.selectAll("myPath")
      .data(data)
      .each(
        dimensions.map(function(column,i,k){ //the first one has value like GreenAreaIndex...the second numeric value from 0 to 4, k is the sstring with all column values
          //console.log("data "+ column);
          //console.log("column "+column);
          var myLine = this; //salvo la linea del path 
          //console.log(path); //per ora è undefined quando è pieno e null quando clicco per togliere il brush
          console.log("my line "+path(myLine)); //I obtain a rowof the type: M0,NaNL122.5,NaNL245,NaNL367.5,NaNL490,NaN 
          //allLines.push(myLine);
          //console.log(extents);
          console.log("dentro dimension map");
          //console.log(extent);
          console.log(yParallel[column](myLine[column])); //per ora è NaN
            if(extent[0][0] > yParallel[column](d[column]) && extent[0][1] < yParallel[column](d[column])){
              console.log(yParallel[column](this.d[column]));
              console.log("la brush funziona");
              //selectedLines.push(myLine); //qui pusho solo le linee selezionate
            } 
        // path(d); yParallel[column](d[column])
        // xParallel(column), yParallel[column](d[column])
        })); */
    } 

    })
    
}

drawParallelPlot();