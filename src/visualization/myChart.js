import * as d3 from "d3";
import { linksAPI } from "./links.js";

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
  config.root = config.tree(data);
  if (options.propagate) { config.root.sum(d => d[options.propagateField]);}
  
  // baroptions.width = options.width *.8;
  config.root.each((d)=> {
    d.name = d.id; //transferring name to a name variable
    d.id = config.i; //Assigning numerical Ids
    config.i++;
    if (options.propagate) { d.data[options.propagateField] = d.value;}
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
      .domain(d3.extent(nodes.slice(1), d => +d.data[options.linkStrengthField]))
      .range(options.linkStrengthRange);
  }
  if (!options.linkWidthStatic) {    
    options.linkWidthScale
      .domain(d3.extent(nodes.slice(1), d => +d.data[options.linkWidthField]))
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

  options.updateLinkLabel = function() {
    update(config.root, options, config);
  };

  options.updateLinkStrength = function() {
    createScale(options, config);
    update(config.root, options, config);
  };

  options.updateLinkColor = function() {
    update(config.root, options, config);
  };

  options.updateAlignLeaves = function() {
    createTree(options, config, data);
    update(config.root, options, config);
  };
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
        n.y = n.parent.y + options.linkWidthScale(+n.data[options.linkWidthField]);
      } 
    }
  });

  d3.select("svg").transition()
    .duration(options.transitionDuration)
    .attr("height", config.height);

  // 1. Update the nodes…
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
  
  // 2. Update the links…
  const l = linksAPI;
  l.initialize(options);

  const link = config.svg.selectAll("g.link")
    .data(links, function (d) {
      // return d.target.id;
      var id = d.id + "->" + d.parent.id;
      return id;
    });

  // Enter any new links at the parent's previous position.
  const linkEnter = link.enter().insert("g", "g.node")
    .attr("class", "link")
    .attr("transform", "translate(" + source.y0 + " " + source.x0 + ")");
  
  const origin = {x: source.x0, y: source.y0, parent: {x: source.x0, y: source.y0}};
  linkEnter.append("path")
    .attr("class", "link down")
    .attr("d", () => l.getLinkD(origin, "down"));
    
  linkEnter.append("path")
    .attr("class", "link right")
    .attr("d", () => l.getLinkD(origin, "right"));

  linkEnter
    .append("text")          
    .attr("dy", ".35em")
    // .attr("text-anchor", "end") 
    .attr("text-anchor", "middle") 
    .text(l.getLinkLabel)
    .style("opacity", 1e-6);        
  
  // Transition links to their new position.
  const linkUpdate = link.merge(linkEnter).transition()
    .duration(options.transitionDuration);

  linkUpdate.attr("transform", (d) => "translate(" + d.parent.y + " " + d.parent.x + ")");

  linkUpdate.select("path.link.down")
    .attr("d", (d) => l.getLinkD(d, "down"))
    .style("stroke", (d) => l.getLinkStroke(d.parent, options))
    .style("stroke-width", (d) => l.getLinkStrokeWidth(d.parent, options));

  linkUpdate.select("path.link.right")
    .attr("d", (d) => l.getLinkD(d, "right"))
    .attr("transform", l.getLinkRTranslate)
    .style("stroke", l.getLinkStroke)
    .style("stroke-width", l.getLinkStrokeWidth);

  linkUpdate
    .select("text") 
    // .attr("x", d => (d.y - d.parent.y) / 2 + l.labelMaxYPerDepth) // l.getLinkLabelX
    .attr("x", d => (d.y - d.parent.y) / 2)
    .attr("y", d => d.x - d.parent.x)
    .call(sel => sel.tween("text", l.getLinkTextTween))
    .style("opacity", 1); 

  // Transition exiting nodes to the parent's new position.
  const linkExit = link.exit().transition()
    .duration(options.transitionDuration)
    .remove();

  linkExit.attr("transform", "translate(" + source.y + " " + source.x + ")"); 

  const destination = {x: source.x, y: source.y, parent: {x: source.x, y: source.y}};
  linkExit.selectAll("path.link.down")
    .attr("d", () => l.getLinkD(destination, "down")); 

  linkExit.selectAll("path.link.right")
    .attr("d", () => l.getLinkD(destination, "right"))
    .attr("transform", "translate(0 0)");

  linkExit
    .select("text")
    .attr("x", 0)
    .attr("y", 0)
    .style("opacity", 1e-6);

  // Stash the old positions for transition.
  nodesSort.forEach(function (d) {
    d.x0 = d.x;
    d.y0 = d.y;
  }); 
}
