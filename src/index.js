let currentBestCity = "Roma";

d3.csv("StarPlotData.csv", function(data){
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
    svgStar.selectAll("*").remove();
    drawStarPlot(currentBestCity);
}