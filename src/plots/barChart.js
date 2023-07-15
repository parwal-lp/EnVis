//global variable
var colorArray = ['#d73027','#fc8d59','#fee08b','#d9ef8b','#91cf60','#1a9850']; //da rosso a verde
var levelArray = ['extremely poor', 'very poor', 'poor', 'moderate', 'fair', 'good'];

// set the dimensions and margins of the graph
var margin = {top: 20, right: 30, bottom: 40, left:200},
    width = 610 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#barChart")
    .append("div")
    .classed("svg-container", true)
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 600 400")
    .classed("svg-content-responsive", true)
    //.attr("width", width + margin.left + margin.right)
    //.attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
    
//set the default pollutant and default order to view
var selectedPollutant = 'PM2.5';
var XmaxValue = '30';

//draw the default plot
draw(selectedPollutant, XmaxValue, order, selectedCities);
drawBarChartMenuOptions();

//-------- definition of used functions --------------//

//draw the legend with AQI color encodings
function drawAQILegend(){
    var color = d3.scaleOrdinal()
        .domain(levelArray)
        .range(colorArray);

    // Add one dot in the legend for each name.
    svg.selectAll("mydots")
    .data(levelArray)
    .enter()
    .append("circle")
        .attr("cx", -180)
        .attr("cy", function(d,i){ return margin.top + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("r", 7)
        .style("fill", function(d){ return color(d)})

    // Add one dot in the legend for each name.
    svg.selectAll("mylabels")
    .data(levelArray)
    .enter()
    .append("text")
        .attr("x", -170)
        .attr("y", function(d,i){ return margin.top + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
        .text(function(d){ return d})
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .style("font-size", "12px")
}

function drawBarChartMenuOptions(){
    //creo e aggiungo il menu a tendina per la scelta del pollutant
    d3.select(".dropDown")
        .append("option")
        .attr("value", "PM2.5")
        .text("PM2.5")
        .attr("selected", "true");
    d3.select(".dropDown")
        .append("option")
        .attr("value", "PM10")
        .text("PM10");
    d3.select(".dropDown")
        .append("option")
        .attr("value", "CO")
        .text("CO");
    d3.select(".dropDown")
        .append("option")
        .attr("value", "SO2")
        .text("SO2");
    d3.select(".dropDown")
        .append("option")
        .attr("value", "O3")
        .text("O3");
    d3.select(".dropDown")
        .append("option")
        .attr("value", "NO2")
        .text("NO2");

    //creo e aggiungo i radio per la scelta dell'ordine
}

//assigns color based on the pollution level, takes data through colorData
function assignColor(colorData, currentPollutant, currentValue){
    for (let i=0; i<colorData.length; i++){
        if (colorData[i]['pollutant']==currentPollutant){
            if (parseInt(colorData[i]['from'])<=currentValue && currentValue<=parseInt(colorData[i]['to'])){
                color = colorArray[parseInt(levelArray.indexOf(colorData[i]['level']))];
                return color;
            }
        }
    }
}

//function that returns the order selected with the radio buttons
function getOrderValue() {
    var ele = document.getElementsByName('order'); 
    for(i = 0; i < ele.length; i++) {
        if(ele[i].checked)
        return ele[i].value;
    }
};

//function invoked when changing pollutant, it triggers a new draw 
function changePollutant(pollutant){
    var element = document.getElementById("pollutant");
    selectedPollutant = element.value;
    order = getOrderValue();
    svg.selectAll("*").remove();
    draw(selectedPollutant, XmaxValue, order, selectedCities);

    //quando si cambia il pollutant, cambia anche il set di citta selezionate
    //quindi devo aggiornare tutti i grafici che riguardano la miglior citta della selezione attuale
    svgStar.selectAll("*").remove();
    d3.csv("data/processed/BarChartData.csv", function(data) {
        dataSelectedCities = data.filter(function(row){
          return row['Air Pollutant'] == selectedPollutant;
        });

        if (selectedCities != null){
            dataSelectedCities = dataSelectedCities.filter(function(row){
                return selectedCities.includes(row['City']);
            });
        }

        dataSelectedCities = dataSelectedCities.sort(function(a, b) { // sort in ordine crescente
            return d3.ascending(parseFloat(a['Air Pollution Level']), parseFloat(b['Air Pollution Level']));
        });

        if (dataSelectedCities.length>0){
            data = dataSelectedCities;
            currentBestCity = dataSelectedCities[0].City;
        } else {
            dataAllCities = data.filter(function(row){
                return row['Air Pollutant'] == selectedPollutant;
            });
            dataAllCities = dataAllCities.sort(function(a, b) { // sort in ordine crescente
                return d3.ascending(parseFloat(a['Air Pollution Level']), parseFloat(b['Air Pollution Level']));
            });

            data = dataAllCities;
            currentBestCity = dataAllCities[0].City;
        }
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
        drawStarPlot(currentBestCity);

        svgScatter.selectAll("*").remove();
        drawScatterPlot(currentBestCity, currentSelectedCity);

        svgParallel.selectAll("*").remove();
        drawParallelPlot(currentBestCity, currentSelectedCity);
    });
    
}

//function invoked when clicking on radio buttons, it invokes a new draw
function changeOrder(order){
    order = getOrderValue();
    svg.selectAll("*").remove();
    draw(selectedPollutant, XmaxValue, order, selectedCities);

    //quando si cambia il pollutant, cambia anche il set di citta selezionate
    //quindi devo aggiornare tutti i grafici che riguardano la miglior citta della selezione attuale
    svgStar.selectAll("*").remove();
    d3.csv("data/processed/BarChartData.csv", function(data) {
        dataSelectedCities = data.filter(function(row){
          return row['Air Pollutant'] == selectedPollutant;
        });

        if (selectedCities != null){
            dataSelectedCities = dataSelectedCities.filter(function(row){
                return selectedCities.includes(row['City']);
            });
        }

        dataSelectedCities = dataSelectedCities.sort(function(a, b) { // sort in ordine crescente
            return d3.ascending(parseFloat(a['Air Pollution Level']), parseFloat(b['Air Pollution Level']));
        });


        if (dataSelectedCities.length>0){
            data = dataSelectedCities;
            currentBestCity = dataSelectedCities[0].City;
        } else {
            dataAllCities = data.filter(function(row){
                return row['Air Pollutant'] == selectedPollutant;
            });
            dataAllCities = dataAllCities.sort(function(a, b) { // sort in ordine crescente
                return d3.ascending(parseFloat(a['Air Pollution Level']), parseFloat(b['Air Pollution Level']));
            });

            data = dataAllCities;
            currentBestCity = dataAllCities[0].City;
        }
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
        drawStarPlot(currentBestCity);

        svgScatter.selectAll("*").remove();
        drawScatterPlot(currentBestCity, currentSelectedCity);

        svgParallel.selectAll("*").remove();
        drawParallelPlot(currentBestCity, currentSelectedCity);
    });
}

function draw(selectedPollutant, XmaxValue, order, currentSelection){
    // Parse the Data
    d3.csv("data/processed/BarChartData.csv", function(data) {
        dataSelectedCities = data.filter(function(row){
          return row['Air Pollutant'] == selectedPollutant;
        });

        if (currentSelection!=null){
            dataSelectedCities = dataSelectedCities.filter(function(row){
                return currentSelection.includes(row['City']);
            });
        }

        dataSelectedCities = dataSelectedCities.sort(function(a, b) { // sort in ordine crescente
            return d3.ascending(parseFloat(a['Air Pollution Level']), parseFloat(b['Air Pollution Level']));
        });

        //console.log(dataSelectedCities);

        if (dataSelectedCities.length>0){
            //the maximum value on x axis is that of the worst city
            XmaxValue = dataSelectedCities[dataSelectedCities.length-1]['Air Pollution Level'];
        
            //checking which value is setted
            if(order == "top10"){ //prendo le prime 10
                dataSelectedCities = dataSelectedCities.slice(0, 10);
            }
            else if(order == "worst10"){ //prendo le ultime 10
                if (dataSelectedCities.length>10){ //se sono meno di 10 in totale non devo ricalcolare
                    dataSelectedCities = dataSelectedCities.slice(dataSelectedCities.length-11,dataSelectedCities.length-1);
                }
            }

            data = dataSelectedCities;
            currentBestCity = dataSelectedCities[0].City;
        } else {
            dataAllCities = data.filter(function(row){
                return row['Air Pollutant'] == selectedPollutant;
            });
            dataAllCities = dataAllCities.sort(function(a, b) { // sort in ordine crescente
                return d3.ascending(parseFloat(a['Air Pollution Level']), parseFloat(b['Air Pollution Level']));
            });

            XmaxValue = dataAllCities[dataAllCities.length-1]['Air Pollution Level'];
        
            //checking which value is setted
            if(order == "top10"){ //prendo le prime 10
                dataAllCities = dataAllCities.slice(0, 10);
            }
            else if(order == "worst10"){ //prendo le ultime 10
                if (dataAllCities.length>10){ //se sono meno di 10 in totale non devo ricalcolare
                    dataAllCities = dataAllCities.slice(dataAllCities.length-11,dataAllCities.length-1);
                }
            }

            data = dataAllCities;
            currentBestCity = dataAllCities[0].City;
        }

        // Add X axis
        var x = d3.scaleLinear()
            .domain([0, XmaxValue])
            .range([ 0, 400]);

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
                .attr("transform", "translate(-10,0)rotate(-45)")
                .style("text-anchor", "end");

        // Y axis
        var y = d3.scaleBand()
            .range([ 0, height ])
            .domain(data.map(function(d) { return d.City; }))
            .padding(.1);
        svg.append("g")
            .call(d3.axisLeft(y))

        //Bars
        d3.csv("data/processed/AQI_color.csv", function(colorData) {
            svg.selectAll("myRect")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", x(0) )
            .attr("y", function(d) { return y(d.City); })
            .attr("width", function(d) {return x(d['Air Pollution Level']); })
            .attr("height", y.bandwidth() )
            .attr("fill", function(d){
                return assignColor(colorData, selectedPollutant, d['Air Pollution Level']);
            })
        });
    });

    drawAQILegend();
   // drawBarChartMenuOptions();

}