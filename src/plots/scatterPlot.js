const scatterArea = d3.select('#scatterPlot'); //select html area for star plot
margin.left = 200;
height = 400
width = 500
const svgScatter = scatterArea.append('svg') //create svg for the starplot
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom) //set dimensions of starplot
  .append('g')
  .attr("transform", "translate(40,40)");
//assigns color based on the pollution level, takes data through colorData
function assignColorWater(currentCity, dataWater){
    let num_non_quantificabile = 0;
    let num_nei_limiti = 0;
    let num_oltre_limiti = 0;
    for (let i=0; i<dataWater.length; i++){
      if (dataWater[i]['Macrocomune']==currentCity){
        ////console.log(dataWater[i]['Macrocomune']);
        if(dataWater[i]['Livello di contaminazione'] == 'Non quantificabile'){
          num_non_quantificabile = dataWater[i]['count'];
        }
        if(dataWater[i]['Livello di contaminazione'] == 'Entro i limiti'){
          num_nei_limiti = dataWater[i]['count'];
        }
        if(dataWater[i]['Livello di contaminazione'] == 'Superiore ai limiti'){
          num_oltre_limiti = dataWater[i]['count'];
        }
      }
    }
    let value = 1*num_oltre_limiti +0*num_nei_limiti -1*num_non_quantificabile;
    let media = 0;
    if(value!=0){
      media = (1*num_oltre_limiti +0*num_nei_limiti -1*num_non_quantificabile)/(num_oltre_limiti + num_nei_limiti + num_non_quantificabile);
      if(media < 0) media = -1; //considero tutti i negativi ottimi, i positivi pessimi e gli 0 neutri. Altrimenti mi vengono tutti neutri, tutti intorno allo 0
      else if(media > 0) media = 1;
      else media = 0;
    }
    ////console.log(currentCity + " " +waterColor[media.toString()]);
    return waterColor[media.toString()];
}

var dots;

const brush = d3.brush()
  .on("start brush end", brushed);

function brushed() {
  extent = d3.event.selection;
  d3.selectAll('circle').each(function () {
    const mydot = d3.select(this);
    var isBrushed = extent[0][0] <= mydot.attr('cx') && extent[1][0] >= mydot.attr('cx') && // Check X coordinate
              extent[0][1] <= mydot.attr('cy') && extent[1][1] >= mydot.attr('cy')  // And Y coordinate

    if(isBrushed){
      console.log("hai selezionato qualche pallino");
      //capire come aggiornare il colore dei pallini
      mydot.attr('fill', '#ff0000');
    }
  })

  
  // let value = [];
  // if (selection) {
  //   const [[x0, y0], [x1, y1]] = selection;
  //   value = dot
  //     .style("stroke", "gray")
  //     .filter(d => x0 <= x(d.x) && x(d.x) < x1 && y0 <= y(d.y) && y(d.y) < y1)
  //     .style("stroke", "steelblue")
  //     .data();
  // } else {
  //   dot.style("stroke", "steelblue");
  // }
  // svg.property("value", value).dispatch("input");
}

function drawScatterPlot(){
  d3.csv("../../data/processed/pcaWaterResults.csv", function(data) { //retrieve the data
    // ------------ PRENDO I DATI CHE MI SERVONO --------------- //
    // Add X axis
    var x = d3.scaleLinear()
      .domain([-2.5, 3])
      .range([ 0, width ]);
    svgScatter.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3.scaleLinear()
      .domain([-2.5, 3])
      .range([ height, 0]);
    svgScatter.append("g")
      .call(d3.axisLeft(y));

    var div = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);


      d3.csv("../../data/processed/mergedWaterComuni.csv", function(dataWater){
        // Add dots
        dots = svgScatter.append('g')
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
          .attr("class", "mydot")
          .attr("cx", function (d) { return x(d.PC1); } )
          .attr("cy", function (d) { return y(d.PC2); } )
          .attr("r", 4)
          .style("fill", function(d){
            return '#aaa'
            let color = assignColorWater(d.City, dataWater);
            ////console.log(d.City + " " + color);
            return color;
          })
        .on('mouseover', function (d, i) {
            //ingrandisce pallino citta
            d3.select(this).transition()
                 .duration('100')
                 .attr("r", 7);
            //Makes tooltip appear
            div.transition()
                  .duration(100)
            .     style("opacity", 1);
            div.html(d.City)
                  .style("left", (d3.event.pageX + 10) + "px")
                  .style("top", (d3.event.pageY - 15) + "px");

        })
       .on('mouseout', function (d, i) {
            //pallino citta torna piccolo
            d3.select(this).transition()
                 .duration('200')
                 .attr("r", 4);
            //makes tooltip disappear
            div.transition()
                  .duration('200')
                  .style("opacity", 0);
        });


        
      })
      
    })

    svgScatter.call(brush);
  
}



drawScatterPlot();