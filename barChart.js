var XmaxValue = 80;

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
    var XmaxValue = 30;


// Parse the Data
d3.csv("BarChartData.csv", function(data) {
    data = data.filter(function(row){
        //if (selectedPollutant == 'NO2'){ //special case NO2 see dataset
        //    return (row['Air Pollutant'] == selectedPollutant || row['Air Pollutant'] == 'NOX as NO2');
        //}
        return row['Air Pollutant'] == selectedPollutant;
    });
    // Add X axis
    var x = d3.scaleLinear()
    .domain([0, XmaxValue])
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
    switch(selectedPollutant){
        case 'CO':
            XmaxValue = 1;
            break;
        case 'PM2.5':
            XmaxValue = 30;
            break;
        case 'PM10':
            XmaxValue = 35;
            break;
        case 'SO2':
            XmaxValue = 10;
            break;
        case 'NO2':
            XmaxValue = 40;
            break;
        case 'O3': 
            XmaxValue = 80;
            break;
    }
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
            .attr("fill", "#69b3a2")
    });
}