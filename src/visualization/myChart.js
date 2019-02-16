import * as d3 from "d3";

////////////////////////////////////////////////////
// add visualization specific processing here     //
//////////////////////////////////////////////////// 

export function myChart(selection, data, options){
  let config = {};
  config.width = 1400 - options.margin.right - options.margin.left;
  config.height = 800 - options.margin.top - options.margin.bottom;
  config.i = 0; // counter for numerical IDs
  config.tree = undefined;
  config.root = undefined;
  config.svg = undefined;
  config.counter = 0;

  config.svg = selection.append("svg")
    .attr("width", config.width + options.margin.right + options.margin.left)
    .attr("height", config.height + options.margin.top + options.margin.bottom)
    .append("g")
    .attr("transform", "translate(" + options.margin.left + "," + options.margin.top + ")");
 
  createTree(options, config, data);
  createScale(options, config);
  createUpdateFunctions(options, config, data);
  // root.children.forEach(collapse);
  update(config.root, options, config);
}

function createTree(options, config, data) {
  config.tree = options.alignLeaves ? d3.cluster() : d3.tree();
  config.tree.size([config.width, config.height]).nodeSize([0, options.linkWidthValue]);  
  // config.root = options.dataEmbedded ? config.tree(data) : config.tree(d3.hierarchy(data));
  config.root = config.tree(data);
  if (options.propagate) { config.root.sum(d => d[options.propagateField]);}
  
  // baroptions.width = options.width *.8;
  config.root.each((d)=> {
    d.name = d.id; //transferring name to a name variable
    d.id = config.i; //Assigning numerical Ids
    config.i++;
  });
  config.root.x0 = config.root.x;
  config.root.y0 = config.root.y;

  if (options.debugOn) {
    console.log("Data:"); console.log(data);
    console.log("Tree:"); console.log(config.root);
  } 
}

function createScale(options, config) {
  let nodes = config.root.descendants();
  if (!options.linkStrengthStatic) {    
    options.linkStrengthScale
      .domain(d3.extent(nodes.slice(1), function(d) { return +d[options.linkStrengthField];}))
      .range(options.linkStrengthRange);
  }
  if (!options.linkWidthStatic) {    
    options.linkWidthScale
      .domain(d3.extent(nodes.slice(1), function(d) { return +d[options.linkWidthField];}))
      .range(options.linkWidthRange);
  }
}

function createUpdateFunctions(options, config, data){
  options.updateLinkWidth = function() {
    if (options.linkWidthStatic) {  
      config.tree.nodeSize([0, options.linkWidthValue]);
    } else {
      createScale(options, config);
    }
    update(config.root, options, config);
  };

  options.updateLinkHeight = function() {
    update(config.root, options, config);
  };

  options.updateLinkStrength = function() {
    createScale(options, config);
    update(config.root, options, config);
  };

  options.updateAlignLeaves = function() {
    createTree(options, config, data);
    update(config.root, options, config);
  };
}

function linkPath(d, linkFunction) {
  const path = (linkFunction === "curved")
    ? // curved
    "M" + d.y + "," + d.x +
    "C" + (d.y + d.parent.y) / 2 + "," + d.x +
    " " + (d.y + d.parent.y) / 2 + "," + d.parent.x +
    " " + d.parent.y + "," + d.parent.x
    : // straight
    "M" + d.parent.y + "," + d.parent.x
    + "V" + d.x + "H" + d.y;
  return path;
}

/*
function collapse(d){
  if (d.children) {
    d._children = d.children;
    d._children.forEach(collapse);
    d.children = null;
  }
}
*/

function click(d, options, config){
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
  update(d, options, config);
}

function update(source, options, config){
  config.width = 800;

  // Compute the new tree layout.
  let nodes = config.tree(config.root);
  let nodesSort = [];
  nodes.eachBefore(function (n) {
    nodesSort.push(n);
  });
  config.height = Math.max(500, nodesSort.length * options.linkHeight + options.margin.top + options.margin.bottom);
  let links = nodesSort.slice(1);
  // Compute the "layout".
  nodesSort.forEach ((n,i)=> {
    n.x = i * options.linkHeight;
    if (!options.linkWidthStatic){
      if (i !== 0) {
        n.y = n.parent.y + options.linkWidthScale(n[options.linkWidthField]);
      } 
    }
  });

  d3.select("svg").transition()
    .duration(options.transitionDuration)
    .attr("height", config.height);

  // Update the nodes…
  let node = config.svg.selectAll("g.node")
    .data(nodesSort, function (d) {
      return d.id || (d.id = ++config.i);
    });

  // Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter().append("g")
    .attr("class", "node")
    .attr("transform", function () {
      return "translate(" + source.y0 + "," + source.x0 + ")";
    })
    .on("click", (d) => { return click (d, options, config); });

  nodeEnter.append("circle")
    .attr("r", 1e-6)
    .style("fill", function (d) {
      return d._children ? "lightsteelblue" : "#fff";
    });

  nodeEnter.append("text")
    .attr("x", 10)
    .attr("dy", ".35em")
    .attr("text-anchor", "start")
    // .attr("x", 0)
    // .attr("y", -12)
    // .attr("dy", ".35em")
    // .attr("text-anchor", "middle") 
    .text(function (d) {
      if (d.data[options.keyField].length > options.maxNameLength) {
        return d.data[options.keyField].substring(0, options.maxNameLength) + "...";
      } else {
        return d.data[options.keyField];
      }
    })
    .style("fill-opacity", 1e-6);

  nodeEnter.append("svg:title").text(function (d) {
    return d.data[options.keyField];
  });

  // Transition nodes to their new position.
  let nodeUpdate = node.merge(nodeEnter)
    .transition()
    .duration(options.transitionDuration);
  
  nodeUpdate
    .attr("transform", function (d) {
      return "translate(" + d.y + "," + d.x + ")";
    });

  nodeUpdate.select("circle")
    .attr("r", 4.5)
    .style("fill", function (d) {
      return d._children ? "lightsteelblue" : "#fff";
    });
  
  nodeUpdate.select("text")
    .style("fill-opacity", 1);

  // Transition exiting nodes to the parent's new position (and remove the nodes)
  var nodeExit = node.exit().transition()
    .duration(options.transitionDuration);
  
  nodeExit
    .attr("transform", function () {
      return "translate(" + source.y + "," + source.x + ")";
    })
    .remove();

  nodeExit.select("circle")
    .attr("r", 1e-6);

  nodeExit.select("text")
    .style("fill-opacity", 1e-6);
  
  // Update the links…
  var link = config.svg.selectAll("path.link")
    .data(links, function (d) {
    // return d.target.id;
      var id = d.id + "->" + d.parent.id;
      return id;
    }
    );

  // Enter any new links at the parent's previous position.
  let linkEnter = link.enter().insert("path", "g")
    .attr("class", "link")
    .attr("d", () => {
      var o = {x: source.x0, y: source.y0, parent: {x: source.x0, y: source.y0}};
      return linkPath(o, options.linkFunction);
    });
  
  // Transition links to their new position.
  link.merge(linkEnter).transition()
    .duration(options.transitionDuration)
    .attr("d", (d) => { return linkPath(d, options.linkFunction); })
    // .style("stroke-width", options.linkStrength) 
    .style("stroke-width", 
      d => options.linkStrengthStatic ? options.linkStrengthValue + "px" : options.linkStrengthScale(d.value) + "px");

  // // Transition exiting nodes to the parent's new position.
  link.exit().transition()
    .duration(options.transitionDuration)
    .attr("d", () => {
      var o = {x: source.x, y: source.y, parent: {x: source.x, y: source.y}};
      return linkPath(o, options.linkFunction);
    })
    .remove();

  // Stash the old positions for transition.
  nodesSort.forEach(function (d) {
    d.x0 = d.x;
    d.y0 = d.y;
  }); 
}

