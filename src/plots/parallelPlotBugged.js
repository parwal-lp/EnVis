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
    foreground,
    extents;

// a map that holds any active brush per attribute
let activeBrushes = new Map();

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

    // Extract the list of dimensions and create a scale for each.
    xParallel.domain(dimensions = d3.keys(data[0]).filter(function(d) {
        return d != "City" && (yParallel[d] = d3.scaleLinear()
            .domain(d3.extent(data, function(p) { return +p[d]; }))
            .range([height, 0]));
    }));

/* //funzione precedente
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
      }*/

      //initialize the funcition extents -- is it necessary?
    //extents = dimensions.map(function(p) { return [0,0]; });

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
        .each(function(d) { 
            d3.select(this).call(axis.scale(yParallel[d])); 
        })
        // Add axis title
        .append("text")
          .style("text-anchor", "middle")
          .attr("y", -9)
          .text(function(d) { return d; })
          .style("fill", "black")

    // Add and store a brush for each axis.
    g.append("g")
        .attr("class", "brush")
        .each(function(d) { 
            d3.select(this)
            .call(yParallel[d].brush = d3.brushY()
                                            .extent([ [-brushParallelWidth/2,0], [brushParallelWidth/2,height] ])//qui definisco le dimensioni dei blocchi brush
                                            .on("start brush end", brushedParallel)); 
           // console.log("yParallel[d].brush :" + yParallel[d].brush);
        })
        .selectAll("rect")
        .attr("x", -brushParallelWidth/2)
        .attr("width", brushParallelWidth); //la zona brushabile parte da 25 prima della colonna, e si estende un totale di 50 in orizzontale
    });

    // Returns the path for a given data point.
    function path(d) {
        return line(dimensions.map(function(p) { return [xParallel(p), yParallel[p](d[p])]; }));
    }
  
    // Handles a brush event, toggling the display of foreground lines.
    function brushedParallel() {
        console.log("oh stai brushando");
        var select = d3.event.selection; //here I memorize the points extreme of the range -- is it useful?
       // console.log(select);

        var actives = dimensions.filter(function(p) { 
            console.log("here is the yParallel[p].brush : "+ yParallel[p].brush);
            console.log("here is the result : "+ (yParallel[p].brush === null));
            return !(yParallel[p].brush === null); //questa cosa qui non sta funzionando benissimo -- serve per fare l'highlight
        
        }),
            extents = actives.map(function(p) { 
            console.log("here are the extent: "+ yParallel[p].brush.extent());
            return yParallel[p].brush.extent(); 
            });

        foreground.style("display", function(d) {
            return actives.every(function(p, i) {
                console.log("here d[p]: "+ d[p]);
                return extents[i][0] <= d[p] && d[p] <= extents[i][1];
                }) ? null : "none";  
        });
    }

    //brush for ordinal cases
 /*   function brush_parallel() {

        for(var i=0;i<dimensions.length;++i){
            console.log(dimensions[i]);
            //console.log("prova print yParallel[dimensions[i]].brush "+ yParallel[dimensions[i]].brush);
            //dentro questo if ci entra ma perchè?
                if(d3.event.target==yParallel[dimensions[i]].brush) {    
                var  yScale = yParallel[dimensions[i]];

                var selected =  yScale.domain().filter(function(d){
                        //var s = d3.event.target.extent();
                        console.log("here the d:" + d); // non so cosa voglia dire questa d ... sembrano i valori estremi della scala, tranne per la colonna 4

                    var select = d3.event.selection;
                    console.log("here the select " +select);
                    console.log("here the yScale(d) "+ yScale(select)); // la scala sono sempre i valori 0,360 ... penso sia l'altezza
                    
                    return (select[0] <= yScale(d)) && (yScale(d) <= select[1])
                });
            
                var temp = selected.sort();
                extents[i] = [temp[temp.length-1], temp[0]];   
                //console.log("here is the extents"+temp);
            }
        }
            foreground.style("display", function(d) {
                    return dimensions.every(function(p, i) {
                        if(extents[i][0]==0 || extents[i][0]==360) { //perchè se uno dei due extent è zero allora ritorno true?
                            return true;
                        }
                    //console.log("the value is: "+d[p]);
                    //var p_new = (yParallel[p].ticks)?d[p]:yParallel[p](d[p]); 
                    //return extents[i][1] <= p_new && p_new <= extents[i][0];
                    return extents[i][1] <= d[p] && d[p] <= extents[i][0];
                    }) ? null : "none"; // sta sempre sul caso none--- perchè?
                });     
        } */


}

drawParallelPlot();