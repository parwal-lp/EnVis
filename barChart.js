//global variable
var order = document.getElementsByName("order");

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
    
    //set the default pollutant selected in the dropdown
    var selectedPollutant = 'PM2.5';
    var XmaxValue;


// Parse the Data
d3.csv("BarChartData.csv", function(data) {
    data = data.filter(function(row){
        //if (selectedPollutant == 'NO2'){ //special case NO2 see dataset
        //    return (row['Air Pollutant'] == selectedPollutant || row['Air Pollutant'] == 'NOX as NO2');
        //}
        return row['Air Pollutant'] == selectedPollutant;
    });

    //here I select the top ten cities
    data = data.sort(function(a, b) {
        return d3.ascending(a['Air Pollution Level'], b ['Air Pollution Level']);
    });
    //.slice(0, 10);
    
    //the max value is setted to te 10th city    
    XmaxValue = data[9]['Air Pollution Level'];

    // Add X axis
    var x = d3.scaleLinear()
    .domain([0, 80])
    .range([ 0, width]);
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
    svg.selectAll("myRect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", x(0) )
    .attr("y", function(d) { return y(d.City); })
    .attr("width", function(d) { return x(d['Air Pollution Level']); })
    .attr("height", y.bandwidth() )
    .attr("fill", "#69b3a2")
});

function changePollutant(pollutant){
    var element = document.getElementById("pollutant");
    selectedPollutant = element.value;
    svg.selectAll("*").remove();
    draw(selectedPollutant, XmaxValue);
}


function draw(selectedPollutant, XmaxValue){
    //we do not redefine the margin values, so that we can update directly the diagram

    // Parse the Data
    d3.csv("BarChartData.csv", function(data) {
        data = data.filter(function(row){
          return row['Air Pollutant'] == selectedPollutant;
      });
    
    //checking which value is setted    
    setOrderValue();
    if(order == "top10"){
        //here I select the top ten cities
        data = data.sort(function(a, b) {
            return d3.ascending(a['Air Pollution Level'], b['Air Pollution Level']);
        });
        //.slice(0, 10);
        //the maximum value on x axis is that of the worst city
        XmaxValue = data[9]['Air Pollution Level'];
    }
    else if(order == "worst10"){
        data = data.sort(function(a, b) {
            return d3.ascending(b['Air Pollution Level'], a['Air Pollution Level']);
        });
        //slice(0,10);
        //the maximum value on x axis is that of the worst city
        XmaxValue = data[0]['Air Pollution Level'];
    }


        // Add X axis
        x = d3.scaleLinear()
            .domain([0, 80])
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
            .attr("fill", "#69b3a2")

        
    });

    //setting the variable for order 
    function setOrderValue() {
        var ele = document.getElementsByName('order'); 
        for(i = 0; i < ele.length; i++) {
            if(ele[i].checked)
            order = ele[i].value;
        }
    };

}