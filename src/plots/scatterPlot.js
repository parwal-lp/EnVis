const scatterArea = d3.select('#scatterPlot'); //select html area for star plot
margin.right = 100;
const svgScatter = scatterArea.append('svg') //create svg for the starplot
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom) //set dimensions of starplot

//assigns color based on the pollution level, takes data through colorData
function assignColorWater(currentCity, dataWater){
    let num_non_quantificabile = 0;
    let num_nei_limiti = 0;
    let num_oltre_limiti = 0;
    for (let i=0; i<dataWater.length; i++){
      if (dataWater[i]['Macrocomune']==currentCity){
        //console.log(dataWater[i]['Macrocomune']);
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
    //console.log(currentCity + " " +waterColor[media.toString()]);
    return waterColor[media.toString()];
}

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

      d3.csv("../../data/processed/mergedWaterComuni.csv", function(dataWater){
        // Add dots
        svgScatter.append('g')
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
          .attr("cx", function (d) { return x(d.PC1); } )
          .attr("cy", function (d) { return y(d.PC2); } )
          .attr("r", 3)
          .style("fill", function(d){
            let color = assignColorWater(d.City, dataWater);
            //console.log(d.City + " " + color);
            return color;
          })
      })
      
    })
}



drawScatterPlot();