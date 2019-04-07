var checkbox = document.querySelector('#brush');

checkbox.addEventListener('change', function() {
  if (this.checked) {
    enableBrush(); // Checkbox is checked..
  } else {
    disableBrush(); // Checkbox is not checked..
  }
});

// set the dimensions and margins of the graph
var margin = { top: 10, right: 30, bottom: 30, left: 60 },
  width = 460 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

// Set the zoom and Pan features: how much you can zoom, on which part, and what to do when there is a zoom
var zoom = d3
  .zoom()
  .scaleExtent([1, Infinity]) // This control how much you can unzoom (x0.5) and zoom (x20)
  //.translateExtent([[-100, -100], [height + 100, width + 100]])
  .on('zoom', zoomed);

// append the SVG object to the body of the page
var SVG = d3
  .select('#dataviz_axisZoom')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

enableZoom();

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

var newX = x;
var newY = y;

var brush = d3
  .brush()
  .extent([[0, 0], [width, height]])
  .on('end', brushended);
//idleTimeout,
//idleDelay = 350;

// Add X axis
var xAxis = SVG.append('g')
  .attr('class', 'x axis')
  .attr('id', 'axis--x')
  .attr('transform', 'translate(0,' + height + ')')
  .call(d3.axisBottom(x));

// Add Y axis
var yAxis = SVG.append('g')
  .attr('class', 'y axis')
  .attr('id', 'axis--y')
  .call(d3.axisLeft(y));

// Add a clipPath: everything out of this area won't be drawn.
var clip = SVG.append('defs')
  .append('SVG:clipPath')
  .attr('id', 'clip')
  .append('SVG:rect')
  .attr('width', width)
  .attr('height', height)
  .attr('x', 0)
  .attr('y', 0);

// Create the scatter variable: where both the circles and the brush take place
var scatter = SVG.append('g').attr('clip-path', 'url(#clip)');

function updateChart(X, Y) {
  var t = SVG.transition().duration(750);

  // update axes with these new boundaries
  xAxis.transition(t).call(d3.axisBottom(X));
  yAxis.transition(t).call(d3.axisLeft(Y));

  // update circle position
  scatter
    .selectAll('circle')
    .transition(t)
    .attr('cx', function(d) {
      return X(d.Sepal_Length);
    })
    .attr('cy', function(d) {
      return Y(d.Petal_Length);
    });
}

// now the user can zoom and it will trigger the function called updateChart
// A function that updates the chart when the user zoom and thus new boundaries are available
function zoomed() {
  // recover the new scale
  newX = d3.event.transform.rescaleX(x);
  newY = d3.event.transform.rescaleY(y);

  // update axes with these new boundaries
  xAxis.call(d3.axisBottom(newX));
  yAxis.call(d3.axisLeft(newY));

  // update circle position
  scatter
    .selectAll('circle')
    .attr('cx', function(d) {
      return newX(d.Sepal_Length);
    })
    .attr('cy', function(d) {
      return newY(d.Petal_Length);
    });
}
/*
function idled() {
  idleTimeout = null;
}*/

function brushended() {
  var s = d3.event.selection;
  const sourceEvent = d3.event.sourceEvent;

  if (s && sourceEvent.type === 'mouseup') {
    changeScaleExtent(
      width / Math.abs(s[1][0] - s[0][0]),
      height / Math.abs(s[0][1] - s[1][1])
    );

    newX = x.domain([s[0][0], s[1][0]].map(newX.invert));
    newY = y.domain([s[1][1], s[0][1]].map(newY.invert));

    SVG.select('.brush').call(brush.move, null);

    updateChart(newX, newY);
  }
}

function enableZoom() {
  svg = d3.select('svg');
  svg.call(zoom);
}

function disableZoom() {
  svg = d3.select('svg');
  svg.on('.zoom', null);
}

function enableBrush() {
  disableZoom();

  SVG.append('g')
    .attr('class', 'brush')
    .call(brush);
}

function disableBrush() {
  SVG.selectAll('g.brush').remove();

  enableZoom();
}

var tooltip = d3
  .select('#dataviz_axisZoom')
  .append('div')
  .attr('class', 'tooltip')
  .style('opacity', 0);

// tooltip mouseover event handler
var tipMouseover = function(d) {
  //var color = colorScale(d.manufacturer);
  var html =
    'Sepal_Length ' +
    '<b>' +
    d.Sepal_Length +
    '</b>' +
    '<br>' +
    'Petal_Length ' +
    '<b>' +
    d.Petal_Length +
    '</b>';

  tooltip
    .html(html)
    .style('left', d3.event.pageX + 15 + 'px')
    .style('top', d3.event.pageY - 28 + 'px')
    .transition()
    .duration(200) // ms
    .style('opacity', 0.9); // started as 0!
};
// tooltip mouseout event handler
var tipMouseout = function(d) {
  tooltip
    .transition()
    .duration(300) // ms
    .style('opacity', 0); // don't care about position!
};

function changeScaleExtent(widthExtent, heightExtent) {
  var extent = widthExtent > heightExtent ? widthExtent : heightExtent;
  console.log('w:' + widthExtent + ',h:' + heightExtent + ',e:' + extent);
  zoom = d3
    .zoom()
    .scaleExtent([1 / extent, Infinity]) // This control how much you can unzoom (x0.5) and zoom (x20)
    .on('zoom', zoomed);
}

function resetScaleExtent() {
  zoom = d3
    .zoom()
    .scaleExtent([1, Infinity]) // This control how much you can unzoom (x0.5) and zoom (x20)
    .on('zoom', zoomed);
}

function reset_zoom() {
  resetScaleExtent(1, 1);

  newX = x.domain(x0);
  newY = y.domain(y0);

  updateChart(newX, newY);
}

d3.csv(
  'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/iris.csv',
  function(data) {
    // Add circles
    scatter
      .selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', function(d) {
        return x(d.Sepal_Length);
      })
      .attr('cy', function(d) {
        return y(d.Petal_Length);
      })
      .attr('r', 8)
      .style('fill', '#61a3a9')
      .style('opacity', 0.5)
      .on('mouseover', tipMouseover)
      .on('mouseout', tipMouseout);
  }
);
