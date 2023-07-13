//let currentBestCity;

d3.csv("../data/processed/StarPlotData.csv", function(data){
    let listaCitta = [];
    data.filter(function(row){
        if (!(row.City in listaCitta) && row.City!=""){
            listaCitta.push(row.City);
        }
    });

    listaCitta.forEach(city => {
        cityOption = document.createElement("option");
        cityOption.setAttribute("value", city);
        cityOption.text = city;

        document.getElementById("tendina_scelta_city")
            .appendChild(cityOption);
    });
})


function aggiornaGraficiConCittaSelezionata(){
    //retrieve current best city
    d3.csv("data/processed/BarChartData.csv", function(data) {
        data = data.filter(function(row){
            return row['Air Pollutant'] == selectedPollutant;
        });

        data = data.filter(function(row){
            return selectedCities.includes(row['City']);
        });

        data = data.sort(function(a, b) { // sort in ordine crescente
            return d3.ascending(parseFloat(a['Air Pollution Level']), parseFloat(b['Air Pollution Level']));
        });
    
        //checking which value is setted
        if(order == "top10"){ //prendo le prime 10
            data = data.slice(0, 10);
        }
        else if(order == "worst10"){ //prendo le ultime 10
            data = data.slice(data.length-11,data.length-1);
        }
        currentBestCity = data[0].City;


        //ora aggiorno i grafici che mostrano la citta selezionata
        svgStar.selectAll("*").remove();
        drawStarPlot(currentBestCity);

        svgScatter.selectAll("*").remove();
        currentSelectedCity = document.getElementById("tendina_scelta_city").value;
        drawScatterPlot(currentBestCity, currentSelectedCity);
    });

}

// function aggiornaGraficiConCittaSelezionata(){
//     //retrieve current best city
//     d3.csv("data/processed/BarChartData.csv", function(data) {
//         /*data = data.filter(function(row){
//           return row['Air Pollutant'] == selectedPollutant;
//         });

//         data = data.sort(function(a, b) { // sort in ordine crescente
//             return d3.ascending(parseFloat(a['Air Pollution Level']), parseFloat(b['Air Pollution Level']));
//         });
    
//         //checking which value is setted
//         if(order == "top10"){ //prendo le prime 10
//             data = data.slice(0, 10);
//         }
//         else if(order == "worst10"){ //prendo le ultime 10
//             data = data.slice(data.length-11,data.length-1);
//         }
//         currentBestCity = data[0].City;*/


//         //ora aggiorno i grafici che mostrano la citta selezionata
//         svgStar.selectAll("*").remove();
//         drawStarPlot(currentBestCity);

//         //svgScatter.selectAll("*").remove();
//         currentSelectedCity = document.getElementById("tendina_scelta_city").value;
//         //drawScatterPlot(currentBestCity, currentSelectedCity);
//     });

// }