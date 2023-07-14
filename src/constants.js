//global variable
var colorArray = ['#d73027','#fc8d59','#fee08b','#d9ef8b','#91cf60','#1a9850']; //da rosso a verde
var levelArray = ['extremely poor', 'very poor', 'poor', 'moderate', 'fair', 'good'];
let waterColor = {'-1':'#92c5de','1':'#fc8d59','0':'#ffea00'}

// set the dimensions and margins of the graph
var margin = {top: 20, right: 30, bottom: 40, left: 100},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

let selectedDots = [];
let allDots = [];
let selectedCities = null;
let allCities = [];

let initialBestCity;
let initialPollutant='PM2.5';

let legendScatter;

let currentSelectedCity;
let currentBestCity;

let order = "top10";

  
d3.csv("data/processed/BarChartData.csv", function(data) {

    selectedCities = [];
    selectedDots.forEach(dot => {
      selectedCities.push(dot.attr('city'));
      allCities.push(dot.attr('city'));
    });

    //console.log(selectedCities);
    
    data = data.filter(function(row){
      return row['Air Pollutant'] == selectedPollutant;
    });

    data = data.filter(function(row){
        selectedCities.push(row.City);
        allCities.push(row.City);
    });

    
  });