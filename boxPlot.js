d3.csv("BoxPlotData.csv", function(error, data) {
    if (error) throw error;
  
    var trace1 = {
        y: data.map(function(row) { return row.GreenAreaDensity; }),//[1, 2, 3, 4, 4, 4, 8, 9, 10], //here insert the data about the green areas
        type: 'box',
        name: 'Green Areas',
        marker:{
        color: 'rgb(26, 125, 76)'
        }
    };
    
    var trace2 = {
        y: data.map(function(row) { return row.VehicleDensity; }), // vedere se fare i veicoli ogni 100 persone oppure totali
        type: 'box',
        name: 'Vehicles',
        marker:{
        color: 'rgb(118, 54, 115)'
        }
    };

    var trace3 = {
        y: data.map(function(row) { return row.NoisePollution; }),
        type: 'box',
        name: 'Noise Pollution',
        marker:{
        color: 'rgb(50, 100, 207)'
        }
    };

    var trace4 = {
        y: data.map(function(row) { return row.GasBifuel; }),
        type: 'box',
        name: 'Gas and Bi-fuel',
        marker:{
        color: 'rgb(36,100,128)'
        }
    };

    var trace5 = {
        y: data.map(function(row) { return row.TotalEmission; }),
        type: 'box',
        name: 'Total Emission',
        marker:{
        color: 'rgb(36,0,128)'
        }
    };
    
    var showData = [trace1, trace2, trace3, trace4, trace5];

    var layout = {
        width: '50%',
    height: '50%'
    };
    
    Plotly.newPlot('boxPlot', showData, layout);
});