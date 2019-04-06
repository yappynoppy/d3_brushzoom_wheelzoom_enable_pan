// set the dimensions and margins of the graph
var margin = { top: 10, right: 30, bottom: 30, left: 60 },
  width = 460 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

// append the SVG object to the body of the page
var SVG = d3
  .select("#dataviz_axisZoom")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var x0 = [4, 8];
var y0 = [0, 9];

var x = d3
  .scaleLinear()
  .domain(x0)
  .range([0, width]);

var y = d3
  .scaleLinear()
  .domain(y0)
  .range([height, 0]);

var brush = d3.brush().on("end", brushended),
  idleTimeout,
  idleDelay = 350;

// Add X axis
var xAxis = SVG.append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x));

// Add Y axis
var yAxis = SVG.append("g").call(d3.axisLeft(y));

// Add a clipPath: everything out of this area won't be drawn.
var clip = SVG.append("defs")
  .append("SVG:clipPath")
  .attr("id", "clip")
  .append("SVG:rect")
  .attr("width", width)
  .attr("height", height)
  .attr("x", 0)
  .attr("y", 0);

// Create the scatter variable: where both the circles and the brush take place
var scatter = SVG.append("g").attr("clip-path", "url(#clip)");

// Set the zoom and Pan features: how much you can zoom, on which part, and what to do when there is a zoom
var zoom = d3
  .zoom()
  //.scaleExtent([0.5, 20]) // This control how much you can unzoom (x0.5) and zoom (x20)
  //.extent([[0, 0], [width, height]])
  .on("zoom", zoomed);

// This add an invisible rect on top of the chart area. This rect can recover pointer events: necessary to understand when the user zoom
SVG.append("rect")
  .attr("width", width)
  .attr("height", height)
  .style("fill", "none")
  .style("pointer-events", "all")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
  .call(zoom);

function updateChart(newX, newY){
  var t = SVG.transition().duration(750);

  // update axes with these new boundaries
  xAxis.transition(t).call(d3.axisBottom(newX));
  yAxis.transition(t).call(d3.axisLeft(newY));

  // update circle position
  scatter
    .selectAll("circle")
    .transition(t)
    .attr("cx", function(d) {
      return newX(d.Sepal_Length);
    })
    .attr("cy", function(d) {
      return newY(d.Petal_Length);
    });
}

// now the user can zoom and it will trigger the function called updateChart
// A function that updates the chart when the user zoom and thus new boundaries are available
function zoomed() {
  // recover the new scale
  var newX = d3.event.transform.rescaleX(x);
  var newY = d3.event.transform.rescaleY(y); 
  
      // update axes with these new boundaries
      xAxis.call(d3.axisBottom(newX));
      yAxis.call(d3.axisLeft(newY));
    
      // update circle position
      scatter
        .selectAll("circle")
        .attr("cx", function(d) {
          return newX(d.Sepal_Length);
        })
        .attr("cy", function(d) {
          return newY(d.Petal_Length);
        });

}

function idled() {
  idleTimeout = null;
}

function brushended() {
  var s = d3.event.selection;
  var newX = null;
  var newY = null;

  if (!s) {
    if (!idleTimeout) return (idleTimeout = setTimeout(idled, idleDelay));
    newX = x.domain(x0);
    newY = y.domain(y0);
  } else {
    newX = x.domain([s[0][0], s[1][0]].map(x.invert, x));
    newY = y.domain([s[1][1], s[0][1]].map(y.invert, y));
    SVG.select(".brush").call(brush.move, null);
  }
  updateChart(newX, newY);
}

function end_brush_tool() {
  SVG.selectAll("g.brush").remove();
}

function start_brush_tool() {
  SVG.append("g")
    .attr("class", "brush")
    .call(brush);
}

function end_brush_tool() {
  SVG.selectAll("g.brush").remove();
}

d3.csv(
  "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/iris.csv",
  function(data) {
    // Add circles
    scatter
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", function(d) {
        return x(d.Sepal_Length);
      })
      .attr("cy", function(d) {
        return y(d.Petal_Length);
      })
      .attr("r", 8)
      .style("fill", "#61a3a9")
      .style("opacity", 0.5);
  }
);

function reset_zoom(){
  newX = x.domain(x0);
  newY = y.domain(y0);
  
  updateChart(newX, newY);
  
};