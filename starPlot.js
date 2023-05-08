const starArea = d3.select('#starPlot'); //select html area for star plot
const svgStar = starArea.append('svg') //create svg for the starplot
  .attr("width", 500 + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom) //set dimensions of starplot

const labels = ['PM2.5', 'PM10', 'CO', 'SO2', 'O3', 'NO2'];
const shiftStart = ['middle', 'start', 'start', 'middle', 'end', 'end']; //lo shift delle labels deve partire da inizio, centro o fine della parola
let pollutantsMaxValues = [];
const maxValue = 50;
const radius = 150;
const center = {x: 250, y: 200};

  // Parse the Data
  d3.csv("StarPlotData.csv", function(data) {
    labels.forEach(pollutant => {
      let i=0;
      let currentPollutantData = data.filter(function(row){
        return row['Air Pollutant'] == pollutant;
      });
      currentPollutantData = currentPollutantData.sort(function(a, b) { // sort in ordine crescente
          return d3.descending(parseFloat(a['Air Pollution Level']), parseFloat(b['Air Pollution Level']));
      });
      //the maximum value on x axis is that of the worst city
      pollutantsMaxValues.push(currentPollutantData[i]['Air Pollution Level']);
      i++;
    });
    console.log(pollutantsMaxValues);
  });

//todo crea scale diverse per ogni asse, usando pollutantMaxValues per sapere il maxValue di ogni asse

const radialScale = d3.scaleLinear()
  .domain([0, maxValue]) 
  .range([radius, 0]) 

const nTicks = 5;
  
const axis = d3.axisRight()
  .scale(radialScale)
  .ticks(nTicks);

svgStar.append('g') //asse verticale con i valori
  .attr('transform', `translate(${center.x},${center.y-radius})`)
  .call(axis);

let val, angle;
for (val = 0; val <= maxValue; val += maxValue / nTicks) { //disegno i cerchi concentrici
  const r = radialScale(val);
  svgStar.append('circle')
    .attr('cx', center.x)
    .attr('cy', center.y)
    .attr('r', r)
    .style('stroke', '#aaa')
    .style('fill', 'none');
}


for (let index = 0; index < labels.length; index++) {
  const angle = index * Math.PI * 2 / labels.length; //angolo tra un asse e l'altro (2pi/n) con n num di assi
  //console.log(angle);
  const x = center.x + radius * Math.sin(angle);
  const y = center.y + radius * - Math.cos(angle);
  if (angle >= 0) {
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

d3.csv("StarPlotData.csv", function(data) {
  data = data.filter(function(row){
    return row['City'] == 'Catanzaro';
  });
  let path = '';

  for (let i=0; i<6; i++){
    pollutantData = data.filter(function(row){
      return row['Air Pollutant'] == labels[i];
    });
    
    const r = radius - radialScale(pollutantData[0]['Air Pollution Level']);
    //console.log(r);
      const angle = i * Math.PI * 2 / 6;
      const x = center.x + r * Math.sin(angle);
      const y = center.y + r * -Math.cos(angle);
      path += `${i > 0 ? 'L' : 'M'} ${x},${y} `;
  }
  path += 'Z';
    svgStar.append('path')
      .attr('d', path)
      .style('stroke', '#000')
      .style('stroke-width', 3)
      .style('stroke-opacity', 0.6)
      .style('fill', '#000')
      .style('fill-opacity', 0.3)
});

