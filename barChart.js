//global variable
var colorArray = ['#d73027','#fc8d59','#fee08b','#d9ef8b','#91cf60','#1a9850']; //da rosso a verde
var levelArray = ['extremely poor', 'very poor', 'poor', 'moderate', 'fair', 'good'];

// set the dimensions and margins of the graph
var margin = {top: 20, right: 30, bottom: 40, left: 90},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
    
//set the default pollutant and default order to view
var selectedPollutant = 'PM2.5';
var XmaxValue = '30';
var order = 'top10';

//draw the default plot
draw(selectedPollutant, XmaxValue, order);
console.log(colorBar("PM2.5", 30.0));

//-------- definition of used functions --------------//

//function to color the bars based on the pollution level
function colorBar(pollutant, value){
    d3.csv("AQI_color.csv", function(data) {
        data = data.filter(function(row){
            if (row['pollutant'] == pollutant){
                if (value <= parseFloat(data['to'])){
                    console.log(row['level']);
                    return row['level'];
                }
            }
        });
        console.log(data);
    });
    
    /*
    for (i=0; i<6; i++){
        if (levelArray[i] == level){
            return colorArray[i];
        }
    }*/
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
    draw(selectedPollutant, XmaxValue, order);
}

//function invoked when clicking on radio buttons, it invokes a new draw
function changeOrder(order){
    order = getOrderValue();
    svg.selectAll("*").remove();
    draw(selectedPollutant, XmaxValue, order);
}

function draw(selectedPollutant, XmaxValue, order){
    //we do not redefine the margin values, so that we can update directly the diagram

    // Parse the Data
    d3.csv("BarChartData.csv", function(data) {
        data = data.filter(function(row){
          return row['Air Pollutant'] == selectedPollutant;
        });
    
        //checking which value is setted
        if(order == "top10"){
            //here I select the top ten cities
            data = data.sort(function(a, b) {
                return d3.ascending(parseFloat(a['Air Pollution Level']), parseFloat(b['Air Pollution Level']));
            }).slice(0, 10);
            //the maximum value on x axis is that of the worst city
            XmaxValue = data[9]['Air Pollution Level'];
        }
        else if(order == "worst10"){
            data = data.sort(function(a, b) {
                return d3.descending(parseFloat(a['Air Pollution Level']), parseFloat(b['Air Pollution Level']));
            }).slice(0,10);
            //the maximum value on x axis is that of the worst city
            XmaxValue = data[0]['Air Pollution Level'];
        }


        // Add X axis
        x = d3.scaleLinear()
            .domain([0, XmaxValue])
            .range([ 0, width]);

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
                .attr("transform", "translate(-10,0)rotate(-45)")
                .style("text-anchor", "end");

        // Y axis
        y = d3.scaleBand()
            .range([ 0, height ])
            .domain(data.map(function(d) { return d.City; }))
            .padding(.1);
        svg.append("g")
            .call(d3.axisLeft(y))

        //Bars
        svg.selectAll("myRect")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", x(0) )
            .attr("y", function(d) { return y(d.City); })
            .attr("width", function(d) { return x(d['Air Pollution Level']); })
            .attr("height", y.bandwidth() )
            .attr("fill", colorArray[0])       
    });
    


}