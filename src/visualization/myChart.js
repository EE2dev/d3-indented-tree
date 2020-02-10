import * as d3 from "d3";
import { linksAPI } from "./links.js";
import { nodesAPI } from "./nodes.js";

////////////////////////////////////////////////////
// add visualization specific processing here     //
//////////////////////////////////////////////////// 

let transCounter = 0;

export function myChart(selection, data, options){
  let config = {};
  config.width = options.svgDimensions.width - options.margin.right - options.margin.left;
  config.height = options.svgDimensions.height - options.margin.top - options.margin.bottom;
  config.i = 0; // counter for numerical IDs
  config.tree = undefined;
  config.root = undefined;
  config.svg = undefined;
  config.counter = 0;
  config.labelDimensions = [];

  config.svg = selection.append("svg")
    .attr("width", config.width + options.margin.right + options.margin.left)
    .attr("height", config.height + options.margin.top + options.margin.bottom)
    .append("g")
    .attr("transform", "translate(" + options.margin.left + "," + options.margin.top + ")");
 
  createTree(options, config, data);
  createScales(options, config);
  createUpdateFunctions(options, config, data);
  // root.children.forEach(collapse);
  update(config.root, options, config);
}

function createTree(options, config, data) {
  config.tree = options.alignLeaves ? d3.cluster() : d3.tree();
  config.tree.size([config.width, config.height]).nodeSize([0, options.linkWidthValue]);  
  config.root = config.tree(data);
  if (options.propagate) { config.root.sum(d => d[options.propagateField]);}
  
  config.root.each((d)=> {
    d.name = d.id; //transferring name to a name variable
    d.id = config.i; //Assigning numerical Ids
    config.i++;
    if (options.propagate) { d.data[options.propagateField] = d.value;}
  });
  config.root.x0 = config.root.x;
  config.root.y0 = config.root.y;
  if (options.propagate) { options.propagate = false; }

  if (options.debugOn) {
    console.log("Data:"); console.log(data);
    console.log("Tree:"); console.log(config.root);
  } 
}

function createScales(options, config) {
  let nodes = config.root.descendants();
  if (!options.linkStrengthStatic) {    
    options.linkStrengthScale
      .domain(d3.extent(nodes, d => +d.data[options.linkStrengthField]))
      .range(options.linkStrengthRange);
  }
  if (!options.linkWidthStatic) {    
    options.linkWidthScale
      .domain(d3.extent(nodes.slice(1), d => +d.data[options.linkWidthField]))
      .range(options.linkWidthRange);
  }
  if (options.nodeBarOn && options.nodeBarUpdateScale) { 
    let dom;
    if (!options.nodeBarDomain) { 
      const extent = d3.extent(nodes, d => +d.data[options.nodeBarField]);
      const maxExtent = Math.max(Math.abs(extent[0]), Math.abs(extent[1])); 
      // options.nodeBarNeg = (extent[0] * extent[1] < 0); 
      options.nodeBarNeg = (extent[0] < 0);
      if (extent[0] >= 0 && extent[1] >= 0) {
        dom = [0, maxExtent]; 
        if (options.nodeBarRangeAdjusted) {
          options.nodeBarRange = [options.nodeBarRange[0], options.nodeBarRange[1] / 2];
          options.nodeBarRangeAdjusted = false;
        } 
      } else if (extent[0] < 0 && extent[1] < 0) {
        dom = [extent[0], 0];
        if (options.nodeBarRangeAdjusted) {
          options.nodeBarRange = [options.nodeBarRange[0], options.nodeBarRange[1] / 2];
          options.nodeBarRangeAdjusted = false;
        }
      } else {
        dom = [-maxExtent, maxExtent];
        options.nodeBarRange = [options.nodeBarRange[0], options.nodeBarRangeUpperBound * 2];
        options.nodeBarRangeAdjusted = true;
      }
    }
    else { dom = options.nodeBarDomain;}
    options.nodeBarScale
      .domain(dom)
      .range(options.nodeBarRange)
      .clamp(true);
  }
}

function createUpdateFunctions(options, config, data){
  options.updateLinkWidth = function() {
    if (options.linkWidthStatic) {  
      config.tree.nodeSize([0, options.linkWidthValue]);
    } else {
      createScales(options, config);
    }
    update(config.root, options, config);
  };

  options.updateScales = function() {
    createScales(options, config);
    update(config.root, options, config);
  };

  options.updateAlignLeaves = function() {
    createTree(options, config, data);
    update(config.root, options, config);
  };

  options.updateDefault = function() {
    update(config.root, options, config);
  };
}

function click(d, options, config){
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
  options.transitionDuration = options.transitionDurationClick;
  update(d, options, config);
  options.transitionDuration = options.transitionDurationDefault;
}

function update(source, options, config){
  if (options.nodeResort) { config.root.sort(options.nodeResortFunction); }
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

  // 1. Update the links…
  const l = linksAPI;
  l.initialize(options);

  const link = config.svg.selectAll("g.link")
    .data(links, function (d) {
      var id = d.id + "->" + d.parent.id;
      return id;
    });

  // Enter any new links at the parent's previous position.
  const linkEnter = link.enter().insert("g", "g.node")
    .attr("class", "link")
  //  .attr("transform", "translate(" + source.y0 + " " + source.x0 + ") scale(0.001, 0.001)");
    .attr("transform", "translate(" + source.y0 + " " + source.x0 + ")");

  const origin = {x: source.x0, y: source.y0, parent: {x: source.x0, y: source.y0}};
  linkEnter // filter to just draw this connector link for last child of parent
    .filter(function(d) { return d.id === d.parent.children[d.parent.children.length - 1].id;})
    .lower() // with lower() vertical links are pushed to the root of the DOM,
    // so link labels on horizontal links are further down and thus are visible when overlapping
    .append("path")
    .attr("class", "link vertical")
    .attr("d", () => l.getLinkD(origin, "vertical"));
   
  linkEnter.append("path")
    .attr("class", "link horizontal")
    .attr("d", () => l.getLinkD(origin, "horizontal"));

  linkEnter
    .append("text")   
    .style("opacity", 1e-6);   
  
  // update merged selection before transition
  const linkMerge = link.merge(linkEnter);
  linkMerge.select("text")
    .attr("class", options.linkLabelOnTop ? "label ontop" : "label above")  
    //.attr("text-anchor", options.linkLabelAligned ? "end" : "middle")
    .attr("dy", l.getInitialDy)
    .attr("id", d => "link-label-" + d.id)
    .text(d => l.getLinkLabelFormatted(d)) // remove line!
    .style("fill", l.getLinkLabelColor); 

  // Transition links to their new position.
  const linkUpdate = linkMerge
    .transition()
    .duration(options.transitionDuration);
  
  l.setupLabelDimensions(d3.selectAll(".link text.label"));

  // linkUpdate.attr("transform", d => "translate(" + d.parent.y + " " + d.parent.x + ") scale(1,1)");
  linkUpdate.attr("transform", d => "translate(" + d.parent.y + " " + d.parent.x + ")");

  linkUpdate.select("path.link.vertical")
    .attr("d", (d) => l.getLinkD(d, "vertical", true))
    .style("stroke", (d) => options.linkColorInherit ? l.getLinkStroke(d.parent) : "")
    .style("stroke-width", (d) => l.getLinkStrokeWidth(d.parent));

  linkUpdate.select("path.link.horizontal")
    .attr("d", (d) => l.getLinkD(d, "horizontal"))
    .attr("transform", l.getLinkRTranslate)
    .style("stroke", l.getLinkStroke)
    .style("stroke-width", l.getLinkStrokeWidth);

  linkUpdate
    .select("text")  
    .attr("dy", l.getDy)
    //.attr("text-anchor", options.linkLabelAligned ? "end" : "middle")
    .attr("text-anchor", l.getLinkLabelAnchor) // remove and handle in tween
    .attr("x", l.getLinkTextPositionX)
    .attr("y", d => d.x - d.parent.x)
    .call(sel => sel.tween("text", l.getLinkTextTween))
    .style("opacity", d => (!options.linkLabelAlways && !d.linkLabel.always) ? 0 : 1); 

  // Transition exiting nodes to the parent's new position.
  const linkExit = link.exit().transition()
    .duration(options.transitionDuration)
    .remove();

  linkExit.attr("transform", "translate(" + source.y + " " + source.x + ")"); 

  const destination = {x: source.x, y: source.y, parent: {x: source.x, y: source.y}};
  linkExit.selectAll("path.link.vertical")
    .attr("d", () => l.getLinkD(destination, "vertical")); 

  linkExit.selectAll("path.link.horizontal")
    .attr("d", () => l.getLinkD(destination, "horizontal"))
    .attr("transform", "translate(0 0)");

  linkExit
    .select("text")
    .attr("x", 0)
    .attr("y", 0)
    .style("opacity", 1e-6);

  // 2. Update the nodes…
  const n = nodesAPI;
  n.initialize(options);

  const node = config.svg.selectAll("g.node")
    .data(nodesSort, function (d) {
      return d.id || (d.id = ++config.i);
    });

  // Enter any new nodes at the parent's previous position.
  const nodeEnter = node.enter().append("g")
    .attr("class", "node")
    .style("visibility", "hidden")
    .on("click", (d) => { return click (d, options, config); });

  nodeEnter.call(n.appendNode);

  nodeEnter.append("text")
    .attr("class", "node-label")
    .attr("x", d => (!d.parent || d.y >= d.parent.y) ? options.nodeLabelPadding : -options.nodeLabelPadding)
    .attr("dy", ".35em")
    .attr("text-anchor", d => (!d.parent || d.y >= d.parent.y) ? "start" : "end")
    .text(function (d) {
      if (d.data[options.nodeLabelField].length > options.nodeLabelLength) {
        return d.data[options.nodeLabelField].substring(0, options.nodeLabelLength) + "...";
      } else {
        return d.data[options.nodeLabelField];
      }
    });

  nodeEnter.append("svg:title").text(function (d) {
    return d.data[options.nodeLabelField];
  });

  nodeEnter.style("visibility", "hidden");

  // add nodeBar
  const nodeBarEnter = nodeEnter
    .append("g")
    .attr("class", "node-bar")
    .style("display", d => options.nodeBarOn && d.data[options.nodeBarField] !== null ? "inline" : "none");

  nodeBarEnter.append("path")
    .attr("class", "node-bar connector")
    .attr("d", "M 0 0 h 0");
  
  nodeBarEnter.append("rect")
    .attr("class", n.setNodeBarDefaultClass)
    .attr("y", -8)
    .attr("height", 16);

  nodeBarEnter.append("text")
    .attr("class", "node-bar bar-label")
    .attr("dy", ".35em") ;
  // end nodeBar

  let nodeMerge = node.merge(nodeEnter);
  
  nodeMerge.selectAll("g.node-bar").style("display", 
    d => options.nodeBarOn && d.data[options.nodeBarField] !== null ? "inline" : "none");
  if (options.nodeBarOn) { n.computeNodeExtend(nodeMerge); }

  nodeEnter.attr("transform", "translate(" + source.y0 + "," + source.x0 + ") scale(0.001, 0.001)")
    .style("visibility", "visible");

  // Transition nodes to their new position.
  let trans = "trans" + transCounter++; 
  let nodeUpdate = nodeMerge
    .transition(trans)
    .duration(options.transitionDuration);
  
  console.log("transition: " + trans);
  console.log("nodeUpdate.size: " + nodeUpdate.size());

  nodeUpdate
    .attr("transform", d => "translate(" + d.y + "," + d.x + ") scale(1,1)");

  nodeUpdate.call(n.updateNode);

  /*
  nodeUpdate.selectAll(".node-label")
    .call(sel => sel.tween("nodeLabel", n.getNodeLabelTween));
    .attr("x", d => (!d.parent || d.y >= d.parent.y) ? options.nodeLabelPadding : -options.nodeLabelPadding)
    .attr("text-anchor", d => (!d.parent || d.y >= d.parent.y) ? "start" : "end");
    */
  
  nodeUpdate.selectAll("g.node-bar")
    .attr("display", options.nodeBarOn ? "inline" : "none");

  if (options.nodeBarOn) {
    nodeUpdate.selectAll(".node-bar.box")
      .attr("class", n.setNodeBarDefaultClass)
      .style("fill", n.getNodeBarRectFill)
      .style("stroke", n.getNodeBarRectStroke)
      .attr("x", n.getXNodeBarRect)
      .attr("width", n.getWidthNodeBarRect);
    nodeUpdate.selectAll(".node-bar.bar-label")
      //.style("text-anchor", n.getNodeBarTextAnchor)
      .style("fill", n.getNodeBarTextFill)
      .call(sel => sel.tween("nodeBarLabel" + transCounter, n.getNodeBarLabelTween))
      //.call(sel => n.sameBarLabel() ? null : sel.tween("nodeBarLabel" + transCounter, n.getNodeBarLabelTween))
      .attr("x", n.getXNodeBarText);
    nodeUpdate.selectAll(".node-bar.connector")
      .attr("d", n.getNodeBarD);
  }

  // Transition exiting nodes to the parent's new position (and remove the nodes)
  var nodeExit = node.exit().transition()
    .duration(options.transitionDuration);
  
  nodeExit
    .attr("transform", function () {
      return "translate(" + source.y + "," + source.x + ") scale(0.001, 0.001)";
    })
    .remove();

  nodeExit.select(".node-label")
    .style("fill-opacity", 1e-6);
  
  // Stash the old positions for transition.
  nodesSort.forEach(function (d) {
    d.x0 = d.x;
    d.y0 = d.y;
  }); 
}
