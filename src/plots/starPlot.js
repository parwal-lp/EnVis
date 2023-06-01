const starArea = d3.select('#starPlot'); //select html area for star plot
const svgStar = starArea.append('svg') //create svg for the starplot
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom) //set dimensions of starplot

const labels = ['PM2.5', 'PM10', 'CO', 'SO2', 'O3', 'NO2'];
const shiftStart = ['middle', 'start', 'start', 'middle', 'end', 'end']; //lo shift delle labels deve partire da inizio, centro o fine della parola
let pollutantsMaxValues = [];
const maxValue = 50;
const radius = 150;
const center = {x: svgStar.attr("width")/2, y: svgStar.attr("height")/2};
const nTicks = 5;
const scales = {};

function displayTextWidth(text, font) {
  let canvas = displayTextWidth.canvas || (displayTextWidth.canvas = document.createElement("canvas"));
  let context = canvas.getContext("2d");
  context.font = font;
  let metrics = context.measureText(text);
  return metrics.width;
}


function drawStarPlot(currentBestCity){
  d3.csv("../../data/processed/StarPlotData.csv", function(data) { //retrieve the data
    // ------------ PRENDO I DATI CHE MI SERVONO --------------- //
    labels.forEach(pollutant => {
      let i=0;
      let currentPollutantData = data.filter(function(row){
        return row['Air Pollutant'] == pollutant;
      });
      currentPollutantData = currentPollutantData.sort(function(a, b) { // sort in ordine crescente
          return d3.descending(parseFloat(a['Air Pollution Level']), parseFloat(b['Air Pollution Level']));
      });
      //leggo e salvo qual e il valore massimo di ogni pollutant (serve per le scale degli assi)
      pollutantsMaxValues.push(currentPollutantData[i]['Air Pollution Level']);
      i++;
    });

    for (let i=0; i<pollutantsMaxValues.length; i++){ //arrotondo per eccesso tutti i maxvalues, cosi da essere divisibili per 5 tickss
      pollutantsMaxValues[i] = nTicks*(Math.ceil(Math.abs(pollutantsMaxValues[i]/nTicks)));
    }

    // ------------ CREO LE SCALE CON I VALORI PER GLI ASSI --------------- //
    for (let i=0; i<labels.length; i++){ //qui genero tutte le scale di tutti gli assi
      const angle = i * 360 / labels.length; //angolo che incrementa ad ogni iterazione del for, rappresenta l'angolaizone di ogni asse (in degrees)
      scales[labels[i]] = d3.scaleLinear() //creo le scale e le salvo nel dizionario scales: scales['PM10'] sara la scala del pollutant PM10
        .domain([0, pollutantsMaxValues[i]])
        .range([radius, 0]);

      const axis = d3.axisRight() //creo le scale ticchettate
        .scale(scales[labels[i]])
        //.ticks(nTicks);
        .tickValues([0,pollutantsMaxValues[i]/nTicks,2*pollutantsMaxValues[i]/nTicks,3*pollutantsMaxValues[i]/nTicks,4*pollutantsMaxValues[i]/nTicks, pollutantsMaxValues[i]]);

      svgStar.append('g') //traslo e ruoto le scale ticchettate al posto giusto
        .attr('transform', `translate(${center.x},${center.y-radius})rotate(${angle}, 0, ${radius})`) //le scale devono essere ruotate di angoli progressivi (come le linee raggi)
        .call(axis)
        .selectAll("text")
        .style("text-anchor", "start")
        //di seguito ruoto i valori per leggerli tutti in orizzontale, e poi li traslo per simulare una rotazione intorno al loro centro
        //le formule per la traslazione sono un po empiriche, non sono ufficiali
        .attr("transform",function(d,i){ return `rotate(${-angle})`+"translate(" + -Math.sin(angle/2*Math.PI/180)*radius/6 + ", "+ Math.sin(angle*Math.PI/180)*radius/9 +") "})
    
      d3.selectAll(".tick").filter(function (d) { return d===0;  }).remove(); //rimuovo gli 0 dagli assi, perche si sovrappongono e diventano poco leggibili, tanto e intuitivo che al centro ci sia lo 0
      }

    // ------------ CREO CIRCONFERENZE CONCENTRICHE --------------- //
    const scalaCerchi = d3.scaleLinear()
      .domain([0, maxValue]) 
      .range([radius, 0]);

    let val;
    for (val = 0; val <= maxValue; val += maxValue / nTicks) { //disegno i cerchi concentrici
      const r = scalaCerchi(val);
      svgStar.append('circle')
        .attr('cx', center.x)
        .attr('cy', center.y)
        .attr('r', r)
        .style('stroke', '#aaa')
        .style('fill', 'none');
    }

    // ------------ CREO ASSI E NOMI DEGLI ASSI ------------------ //
    for (let index = 0; index < labels.length; index++) {
      const angle = index * Math.PI * 2 / labels.length; //angolo tra un asse e l'altro (2pi/n) con n num di assi
      const x = center.x + radius * Math.sin(angle);
      const y = center.y + radius * - Math.cos(angle);
      if (angle >= 0) { //scrivo le labels degli assi
        svgStar.append('line')
            .attr('x1', center.x)
            .attr('y1', center.y)
            .attr('x2', x)
            .attr('y2', y)
            .style('stroke', '#000');
      }
      const xText = radius/10 * Math.sin(angle);
      const yText = radius/10 * - Math.cos(angle) +5; //le labels devono essere shiftate di un tot per non sovrapporsi al grafico, +5 serve a centrarle, altrimenti sono leggermente spostate in alto
      svgStar.append('text')
        .text(labels[index])
        .attr('text-anchor', shiftStart[index])
        .attr('dx', xText)
        .attr('dy', yText) //shift delle labels
        .attr('x', x)
        .attr('y', y)
    }

    // ------------ DISEGNO I PERCORSI IN BASE AI DATI ------------------ //
    // dati citta selezionata dall'utente
    let currentSelectedCity = document.getElementById("tendina_scelta_city").value;
    if (currentSelectedCity != "none") {
      //il path della citta selezionata dall'utente viene mostrato
      //solamente se l'utente ha selezionato unacitta nella tendina, altrimenti salto e vado al path successivo
      let dataSelectedCity = data.filter(function(row){
        return row['City'] == document.getElementById("tendina_scelta_city").value; //qui sostituisci con la citta selezionata dall'utente nella tendina in alto
      });
      let pathSelectedCity = '';
    
      for (let i=0; i<6; i++){
        pollutantData = dataSelectedCity.filter(function(row){
          return row['Air Pollutant'] == labels[i];
        });

        let r = 0;

        if (pollutantData.length == 1){
          r = radius - scales[labels[i]](pollutantData[0]['Air Pollution Level']);
        }
        const angle = i * Math.PI * 2 / 6;
        const x = center.x + r * Math.sin(angle);
        const y = center.y + r * -Math.cos(angle);
        pathSelectedCity += `${i > 0 ? 'L' : 'M'} ${x},${y} `;
        
      }
      pathSelectedCity += 'Z';
        svgStar.append('path')
          .attr('d', pathSelectedCity)
          .style('stroke', '#888')
          .style('stroke-width', 3)
          .style('stroke-opacity', 0.6)
          .style('fill', '#888')
          .style('fill-opacity', 0.3)

    }
    

    // dati citta migliore nella selezione attuale
    let dataBestCity = data.filter(function(row){
      return row['City'] == currentBestCity; //qui sostituisci con la citta migliore della selezione attuale (capire cosa significa)
    });
    let pathBestCity = '';
  
    for (let i=0; i<6; i++){
      pollutantData = dataBestCity.filter(function(row){
        return row['Air Pollutant'] == labels[i];
      });

      let r = 0;

      if (pollutantData.length == 1){
        r = radius - scales[labels[i]](pollutantData[0]['Air Pollution Level']);
      }
      const angle = i * Math.PI * 2 / 6;
      const x = center.x + r * Math.sin(angle);
      const y = center.y + r * -Math.cos(angle);
      pathBestCity += `${i > 0 ? 'L' : 'M'} ${x},${y} `;

    }
    pathBestCity += 'Z';
      svgStar.append('path')
        .attr('d', pathBestCity)
        .style('stroke', '#91cf60')
        .style('stroke-width', 3)
        .style('stroke-opacity', 0.6)
        .style('fill', '#91cf60')
        .style('fill-opacity', 0.3)

  // ----------- CREO LA LEGENDA ---------------- //

  let legend = svgStar.append("g")
  .attr("class", 'node')

  let topCityDot;
  let topCityText
  let topCityWidth;

  if(currentBestCity!=""){
    topCityDot = legend.append("circle").attr("r", 6).style("fill", "#91cf60").attr("cy",svgStar.attr("height")-svgStar.attr("height")*0.04)
    topCityText = legend.append("text").text(currentBestCity).style("font-size", "15px").attr("y",svgStar.attr("height")-svgStar.attr("height")*0.027)
    topCityText.attr("x", '10');
  
    topCityWidth = displayTextWidth(currentBestCity, "15px sans-serif") + 10;
    
  }

  let chosenCityWidth = 0;
  if (currentSelectedCity != "none"){
    let chosenCityDot = legend.append("circle").attr("r", 6).style("fill", "#888").attr("cy",svgStar.attr("height")-svgStar.attr("height")*0.04)
    let chosenCityText = legend.append("text").text(currentSelectedCity).style("font-size", "15px").attr("y",svgStar.attr("height")-svgStar.attr("height")*0.027)
    
    chosenCityDot.attr("cx", topCityWidth + 10);
    chosenCityText.attr("x", topCityWidth + 20);

    chosenCityWidth = displayTextWidth(currentSelectedCity, "15px sans-serif") + 10;

  }

  //posiziono la legenda al centro, questo significa spostarla dinamicamente in base alla larghezza che il testo occupa
  legend.attr("transform", `translate(${230-(topCityWidth + chosenCityWidth)/2}, 0)`) 

  });

}

drawStarPlot("Roma");
