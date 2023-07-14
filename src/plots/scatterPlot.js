const scatterArea = d3.select('#scatterPlot'); //select html area for star plot
margin.left = 200;
height = 380;
width = 350;
const svgScatter = scatterArea.append('svg') //create svg for the starplot
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom) //set dimensions of starplot
  .append('g')
  .attr("transform", "translate(40,40)")
  .attr("style", "display:block");
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
function colorCityDots(currentCity){
  if (currentBestCity!=""){
    if (currentCity == currentBestCity){
      return '#1a9850';
    }
  } else {
    if (currentCity == initialBestCity){
      return '#1a9850';
    }
  }
  if (currentCity == currentSelectedCity) {
    return '#d95f02';
  } else if (selectedCities.includes(currentCity)){
    return '#9e9ac8';
  } else {
    return '#a6cee3';
  }
}

var dots;

const brush = d3.brush()
  .extent([[0,0], [width + margin.left, height]])
  .on("start brush end", brushed)
  .on("end", updateRelatedGraphs);

function updateRelatedGraphs(){
  svgStar.selectAll("*").remove();
  svg.selectAll("*").remove();
  svgBoxPlot.selectAll("*").remove();
  svgParallel.selectAll("*").remove();
  
  d3.csv("data/processed/BarChartData.csv", function(data) {

    order = getOrderValue();
    selectedCities = [];
    selectedDots.forEach(dot => {
      selectedCities.push(dot.attr('city'));
    });

    //console.log(selectedCities);
    
    dataSelectedCities = data.filter(function(row){
      return row['Air Pollutant'] == selectedPollutant && selectedCities.includes(row['City']);
    });

    

    dataSelectedCities = dataSelectedCities.sort(function(a, b) { // sort in ordine crescente
        return d3.ascending(parseFloat(a['Air Pollution Level']), parseFloat(b['Air Pollution Level']));
    });
    if (dataSelectedCities.length>0 && dataSelectedCities[0]!=null){
      //checking which value is setted
      if(order == "top10"){ //prendo le prime 10
        dataSelectedCities = dataSelectedCities.slice(0, 10);
      }
      else if(order == "worst10"){ //prendo le ultime 10
        dataSelectedCities = dataSelectedCities.slice(dataSelectedCities.length-11,dataSelectedCities.length-1);
      }
      currentBestCity = dataSelectedCities[0].City;
    } else {
      dataAllCities = data.filter(function(row){
        return row['Air Pollutant'] == selectedPollutant;
      });
      dataAllCities = dataAllCities.sort(function(a, b) { // sort in ordine crescente
        return d3.ascending(parseFloat(a['Air Pollution Level']), parseFloat(b['Air Pollution Level']));
      });
      if(order == "top10"){ //prendo le prime 10
        dataAllCities = dataAllCities.slice(0, 10);
      }
      else if(order == "worst10"){ //prendo le ultime 10
        dataAllCities = dataAllCities.slice(dataAllCities.length-11,dataAllCities.length-1);
      }
      currentBestCity = dataAllCities[0].City;
      selectedCities = null;
    }
    if(currentBestCity == ""){
      drawStarPlot(initialBestCity);
    } else {
      drawStarPlot(currentBestCity);
    }
    draw(selectedPollutant, XmaxValue, order, selectedCities);
    drawBoxPlot(selectedCities)
    highlightImportantNodes(currentBestCity, currentSelectedCity); //ricoloro i nodi chosen e best nello scatter
    legendScatter.remove(); //aggiorno la legenda dello scatter con il nome della current best city
    drawScatterLegend(currentBestCity, currentSelectedCity);
    drawParallelPlot(currentBestCity, currentSelectedCity);
  });
  
}

function highlightImportantNodes(currentBestCity, currentSelectedCity){
  coloraChosenCity(currentSelectedCity);
  coloraCurrentBestCity(currentBestCity);
}

function coloraChosenCity(currentSelectedCity){
  d3.selectAll('.dot').each(function () {
    let currentDot = d3.select(this);
    if (currentDot.attr("city") == currentSelectedCity){
      
      currentDot.style('fill', '#d95f02'); //se non esiste una currentBest allora mostro la initialBest
      
      currentDot.raise();
    }
  })
}

function coloraCurrentBestCity(currentBestCity){
  let initialCity = null;
  let foundCity = null;
  allDots.forEach(dot => { //identifico currentBest e inizialBest
    if (dot.attr("city") == currentBestCity){
      foundCity = dot;
    }
    if (dot.attr("city") == initialBestCity){
      initialCity = dot;
    }
  });
  if (foundCity != null){ //se esiste una currentBest evidenzio quella
    foundCity.style('fill', '#1a9850');
    foundCity.raise();
  } else if (initialCity!=null){
    initialCity.style('fill', '#1a9850'); //se non esiste una currentBest allora mostro la initialBest
    initialCity.raise();
  }
}

function brushed() {
  extent = d3.event.selection;
  selectedDots = []; //qui metto tutti i punti selezionati
  allDots = []; //qui metto tutti i punti del grafico
  d3.selectAll('.dot').each(function () {
    const mydot = d3.select(this);
    
    allDots.push(mydot);

    //controllo se il punto si trova all'interno della selezione
    var isBrushed = extent[0][0] <= mydot.attr('cx') && extent[1][0] >= mydot.attr('cx') && // Check X coordinate
              extent[0][1] <= mydot.attr('cy') && extent[1][1] >= mydot.attr('cy')  // And Y coordinate

    if(isBrushed && !selectedDots.includes(mydot)){ //se il punto si trova nella selezione lo aggiungo a selectedDots
      selectedDots.push(mydot);
      //console.log(mydot);
    } else { //se il punto non si trova nella selezione lo rimuovo da selectedDots
      let indexToRemove = selectedDots.indexOf(mydot);
      if (indexToRemove != -1) selectedDots.splice(indexToRemove);

    }
  })

  allDots.forEach(dot => {
    if (selectedDots.includes(dot)){
      //console.log(dot.attr("city"));
      //console.log(dot);
      dot.style('fill', '#9e9ac8'); //tutti i selezionati si colorano
    } else if(!selectedDots.includes(dot)){
      dot.style('fill', '#a6cee3'); //tutti gli altri tornano grigi
    }

  });

  if (selectedDots.length==0){
    allDots.forEach(dot => {
      //console.log(dot);
      if (allCities.includes(dot.attr('city'))){
        dot.style('fill', '#9e9ac8');
      } else {
        dot.style('fill', '#a6cee3');
      }
    })
  }

  //colora di verde la citta migliore della selezione attuale
  
}

function drawScatterPlot(currentBestCity, currentSelectedCity){
  d3.csv("data/processed/pcaWaterResults.csv", function(data) { //retrieve the data
    // ------------ PRENDO I DATI CHE MI SERVONO --------------- //
    // Add X axis
    var xScatter = d3.scaleLinear()
      .domain([-2.5, 3])
      .range([ 0, width ]);
    svgScatter.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScatter));

      var ticksScatter = xScatter.ticks();
      //console.log(ticksScatter);
      //ticksScatter.push(0);
      //xAxisScatter.tickValues(ticksScatter);


    // Add Y axis
    var yScatter = d3.scaleLinear()
      .domain([-2.5, 3])
      .range([ height, 0]);
    svgScatter.append("g")
      .call(d3.axisLeft(yScatter));

    var div = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);


      d3.csv("data/processed/mergedWaterComuni.csv", function(dataWater){
        // Add dots
        dots = svgScatter.append('g')
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
          .attr("class", "dot")
          .attr("cx", function (d) { return xScatter(d.PC1); } )
          .attr("cy", function (d) { return yScatter(d.PC2); } )
          .attr("city", function (d) { return (d.City); })
          .attr("r", 4)
          //.style("stroke","black")
          .style("fill", function(d){
            let color = colorCityDots(d.City);
            ////console.log(d.City + " " + color);
            return color;
            //return '#aaa'
            //let color = assignColorWater(d.City, dataWater);
            ////console.log(d.City + " " + color);
            //return color;
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


      d3.selectAll('.dot').each(function () {
        let currentDot = d3.select(this);
        if (currentDot.attr("city") == currentSelectedCity){
          currentDot.raise();
        }
        let initialCity = null;
        let foundCity = null;
        if (currentDot.attr("city") == currentBestCity){
          foundCity = currentDot;
        }
        if (currentDot.attr("city") == initialBestCity){
          initialCity = currentDot;
        }
        if (foundCity != null){ //se esiste una currentBest evidenzio quella
          foundCity.raise();
        } else if (initialCity!=null){ //se non esiste una currentBest allora mostro la initialBest
          initialCity.raise();
        }

      })
        
      })
      
    })

    const gBrush = svgScatter.append('g')
      .attr('class', 'brush')
      .call(brush);

  // LEGEND
  drawScatterLegend(currentBestCity, currentSelectedCity);
}

function drawScatterLegend(currentBestCity, currentSelectedCity){

  legendScatter = svgScatter.append("g")
  .attr("class", 'node')

  let topCityDotScatter;
  let topCityTextScatter
  let topCityWidthScatter;
  let greenCity;

  if (currentBestCity == "") {
    greenCity = initialBestCity;
  } else {
    greenCity = currentBestCity;
  }

  topCityDotScatter = legendScatter.append("circle").attr("r", 6).style("fill", "#1a9850").attr("cy",svgScatter.attr("height")-svgScatter.attr("height")*0.04)
  topCityTextScatter = legendScatter.append("text").text(greenCity).style("font-size", "15px").attr("y",svgScatter.attr("height")-svgScatter.attr("height")*0.027)
  topCityTextScatter.attr("x", '10');
  topCityTextScatter.attr("y", '5');
  
  topCityWidthScatter = displayTextWidth(greenCity, "15px sans-serif") + 10;


  let labelSelectedCityText = "Selected cities"
  let selectedPointsCircle = legendScatter.append("circle").attr("r", 6).style("fill", "#9e9ac8").attr("cy",svgScatter.attr("height")-svgScatter.attr("height")*0.04)
  let selectedPointdLabel = legendScatter.append("text").text(labelSelectedCityText).style("font-size", "15px").attr("y",svgScatter.attr("height")-svgScatter.attr("height")*0.027)
  
  selectedPointsCircle.attr("cx", topCityWidthScatter + 10);
  selectedPointdLabel.attr("x", topCityWidthScatter + 20);
  selectedPointdLabel.attr("y", '5');

  selectedPointsWidthScatter = displayTextWidth(labelSelectedCityText, "15px sans-serif") + 10;
  let otherText = "Others"
  let otherScatterCircle = legendScatter.append("circle").attr("r", 6).style("fill", "#a6cee3").attr("cy",svgScatter.attr("height")-svgScatter.attr("height")*0.04)
  let otherScatterLabel = legendScatter.append("text").text(otherText).style("font-size", "15px").attr("y",svgScatter.attr("height")-svgScatter.attr("height")*0.027)
  
  otherScatterCircle.attr("cx", selectedPointsWidthScatter + 85);
  otherScatterLabel.attr("x", selectedPointsWidthScatter + 95);
  otherScatterLabel.attr("y", '5');

  otherPointsWidthScatter = displayTextWidth(otherText, "15px sans-serif") + 10;


  if(currentSelectedCity != "none" && currentSelectedCity!=null){
    let chosenCityScatterCircle = legendScatter.append("circle").attr("r", 6).style("fill", "#d95f02").attr("cy",svgScatter.attr("height")-svgScatter.attr("height")*0.04)
    let chosenCityScatterLabel = legendScatter.append("text").text(currentSelectedCity).style("font-size", "15px").attr("y",svgScatter.attr("height")-svgScatter.attr("height")*0.027)
    
    chosenCityScatterCircle.attr("cx", otherPointsWidthScatter + 215);
    chosenCityScatterLabel.attr("x", otherPointsWidthScatter + 225);
    chosenCityScatterLabel.attr("y", '5');
  }


  
 
  //posiziono la legenda al centro, questo significa spostarla dinamicamente in base alla larghezza che il testo occupa
  legendScatter.attr("transform", `translate(20, -10)`) 

  
}


//calcolo la best city prima dell'interazione dell'utente
//quindi sarebbe la best city tra i dati completi del barchart
d3.csv("data/processed/BarChartData.csv", function(initialData) {
  initialData = initialData.filter(function(row){
    return row['Air Pollutant'] == initialPollutant;
  });

  initialData = initialData.sort(function(a, b) { // sort in ordine crescente
      return d3.ascending(parseFloat(a['Air Pollution Level']), parseFloat(b['Air Pollution Level']));
  });
    
  initialBestCity = initialData[0].City;

  //qui dentro chiamo la renderizzazione del grafico perché d3.cs è asincrona
  drawScatterPlot(initialBestCity, "none");
});
