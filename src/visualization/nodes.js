import * as d3 from "d3";

export let nodesAPI = {};
let options;
let nodeExtendArray;
let xEnd = 600;

nodesAPI.initialize = function(_options) { 
  options = _options; 
};

nodesAPI.appendNode = function (selection) {
  if (options.nodeImageFile) {
    nodesAPI.appendNodeImage(selection);
  } else {
    (options.nodeImageSelectionAppend && typeof options.nodeImageSelectionAppend === "function") 
      ? options.nodeImageSelectionAppend(selection) 
      : nodesAPI.appendNodeSVG(selection);
  }
};

nodesAPI.updateNode = function (transition) {
  if (options.nodeImageFile) {
    nodesAPI.updateNodeImage(transition);
  } else {
    if (options.nodeImageSelectionUpdate && typeof options.nodeImageSelectionUpdate === "function") {
      options.nodeImageSelectionUpdate(transition);
    } else if (options.nodeImageSelectionAppend && typeof options.nodeImageSelectionAppend === "function") {
      return; // do nothing - custom SVG append provided but no custom SVG update 
    } else { nodesAPI.updateNodeSVG(transition); }
  }
};

nodesAPI.appendNodeSVG = function (selection) {
  selection.append("rect")
    .attr("class", "nodeImage")
    .attr("x", -5)
    .attr("y", -5) 
    .attr("width", 10)
    .attr("height", 10);

  const sel2 = selection;
  sel2.append("line")
    .attr("class", d => d._children ? "cross nodeImage" : "cross invisible")
    .attr("x1", 0)
    .attr("y1", -5) 
    .attr("x2", 0)
    .attr("y2", 5);

  sel2.append("line")
    .attr("class", d => d._children ? "cross nodeImage" : "cross invisible")
    .attr("x1", -5)
    .attr("y1", 0) 
    .attr("x2", 5)
    .attr("y2", 0);
};

nodesAPI.updateNodeSVG = function (transition) {
  transition.selectAll("line.cross")
    .attr("class", d => d._children ? "cross nodeImage" : "cross invisible");
};

nodesAPI.appendNodeImage = function (selection) {
  if (options.nodeImageSetBackground) {
    const col = d3.select("div.chart").style("background-color");
    selection.append("rect")
      .attr("width", options.nodeImageWidth)
      .attr("height", options.nodeImageHeight)
      .attr("x", options.nodeImageX)
      .attr("y", options.nodeImageY)
      .style("stroke", col)
      .style("fill", col);
  }
  selection.append("image")
    .attr("class", "nodeImage")
    .attr("xlink:href", options.nodeImageFileAppend)
    .attr("width", options.nodeImageWidth)
    .attr("height", options.nodeImageHeight)
    .attr("x", options.nodeImageX)
    .attr("y", options.nodeImageY);
};

nodesAPI.updateNodeImage = function (transition) {
  transition
    .select(".nodeImage")
    .attr("xlink:href", options.nodeImageFileAppend);    
};

nodesAPI.computeNodeExtend = function() {
  nodeExtendArray = [];
  d3.selectAll(".node").each(function(d) {
    let labelBBox = d3.select(this).select(".nodeLabel").node().getBBox();
    let imageBBox = d3.select(this).select(".nodeImage").node().getBBox();
    let nodeExtend = (labelBBox.width !== 0) ? 
      labelBBox.x + labelBBox.width
      : imageBBox.x + imageBBox.width;
    d.nodeExtend = nodeExtend;
    nodeExtendArray.push(nodeExtend + d.y + 5);
  });
  nodeExtendArray.maxExtend = Math.max(...nodeExtendArray);
  console.log("max: " + nodeExtendArray.maxExtend);
  xEnd = nodeExtendArray.maxExtend + 200;
};

nodesAPI.getNodeBarD = d =>
  `M ${d.nodeExtend + 5} 0 h ${xEnd - (d.y + d.nodeExtend + 5)}`;

/*
nodesAPI.getEnterNodeBarD = function (d) {
  let node = d3.selectAll(".node").filter(d2 => d2.id === d.id);
  let nodeBBox = node.select(".nodeLabel").node().getBBox();
  if (nodeBBox.width === 0) {
    nodeBBox = node.select(".nodeImage").node().getBBox();
  }
  const nodeExtend = nodeBBox.x + nodeBBox.width;
  // TO DO add width of BBox of text in full size
  const len = xEnd - (d.y + nodeExtend + 5);
  // console.log("len: " + len);
  d.nodeExtend = nodeExtend;
  return `M ${nodeExtend + 5} 0 h ${len}`;
};

nodesAPI.getUpdateNodeBarD = function (d) {
  const len = xEnd - (d.y + d.nodeExtend + 5);
  console.log("len: " + len);
  return `M ${d.nodeExtend + 5} 0 h ${len}`;
};
*/

nodesAPI.getXNodeBarRect = function (d) {
  return xEnd - d.y - 40;
};

nodesAPI.getXNodeBarText = function (d) {
  return xEnd - d.y - 5;
};