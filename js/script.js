$(function() {

    // Set global variables (width, height, etc.)
    var width = 1300;
    var height = 700;

    var DELAY_MULTIPLIER = 100;
    var TRANSITION_DURATION = 1000;

    var margin = {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10
    };

    // Create svg and g elements
    var svg = d3.select("#vis")
                .append('svg')
                .attr('width', width)
                .attr('height', height);

    var g = svg.append("g");

    var path = d3.geoPath();
    var lifeEx = d3.map();

    // Create initial map overlay with gray background on counties and states
    d3.json("https://d3js.org/us-10m.v1.json", function(error, us) {
        if (error) throw error;
            g.attr("class", "counties")
                .selectAll("path")
                .data(topojson.feature(us, us.objects.counties).features)
                .enter().append("path")
                .style("fill", "grey")
                .attr("d", path)

            svg.append("path")
                .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
                .attr("class", "states")
                .attr("d", path);

    });

    // Prep data to format properly
    d3.queue()
        .defer(d3.json, "https://d3js.org/us-10m.v1.json")
        .defer(d3.csv, "data/ihme-life-expectancy.csv", function(d) { 
            var rate = d['Life expectancy, 2014*'];
            rate = rate.split(" ");
            var id = d.FIPS;
            if (id.length == 4) {
                id = '0' + id;
            }
            if (id.length == 5) {
                lifeEx.set(id, +rate[0]);
            }
        })
        .await(ready);

    // color scale
    var color = d3.scaleThreshold()
        .domain([67, 71, 75, 79, 83])
        .range(d3.schemeRdBu[6]);

    // legend
    var legend = d3.legendColor()
        .labelFormat(d3.format(",d"))
        .labels(d3.legendHelpers.thresholdLabels)
        .title("Life Expectancy (years)")
        .scale(color);

    // after data is loaded, display the new colors of the counties.
    // delay based on the rate of the county
    function ready(error, us) {
        if (error) throw error;

        svg.append("g")
            .attr("class", "counties")
            .selectAll("path")
            .data(topojson.feature(us, us.objects.counties).features)
            .enter().append("path")
            .on("mouseover", function() {
                d3.select(this).style("fill", "red");
            })
            .on("mouseout", function() {
                d3.select(this).style("fill", function(d) {return color(d.rate = lifeEx.get(d.id)); })
            })
            .transition()
            .duration(TRANSITION_DURATION)
            .delay(function(d) { return (lifeEx.get(d.id) * DELAY_MULTIPLIER);})
            .style("fill", function(d) {return color(d.rate = lifeEx.get(d.id)); })
            .attr("d", path);

        svg.append("path")
            .datum(topojson.mesh(us, us.objects.states))
            .attr("class", "states")
            .attr("d", path);

        svg.append("g")
          .call(legend)
          .attr("transform", "translate(1000,100)");

    }
})
