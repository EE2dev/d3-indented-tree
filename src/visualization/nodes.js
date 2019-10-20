import * as d3 from "d3";

export let nodesAPI = {};
let options;
let nodeExtendArray;
let xEnd = 600;
let oldLabelField , newLabelField;

nodesAPI.initialize = function(_options) { 
  options = _options; 
  oldLabelField = newLabelField;
  newLabelField = options.nodeBarOn ? options.nodeBarField : undefined;
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
    const labelBBox = d3.select(this).select(".nodeLabel").node().getBBox();
    const imageBBox = d3.select(this).select(".nodeImage").node().getBBox();
    const nodeExtend = (labelBBox.width !== 0) ? 
      labelBBox.x + labelBBox.width
      : imageBBox.x + imageBBox.width;
    d.nodeExtend = nodeExtend;
    nodeExtendArray.push(nodeExtend + d.y + 5);
  });
  nodeExtendArray.maxExtend = Math.max(...nodeExtendArray);
  xEnd = nodeExtendArray.maxExtend + 50 + options.nodeBarRange[1];
};

nodesAPI.getNodeBarLabelTween = function(d) { 
  const selection = d3.select(this);
  if (!options.nodeBarOn) {
    return function() { selection.text(""); };
  } 
  const numberStart = oldLabelField ? d.data[oldLabelField] : d.data[newLabelField];
  const numberEnd = d.data[newLabelField];
  if (isNaN(numberStart) || isNaN(numberEnd)) {
    return function() { selection.text(numberEnd); };
  }
  const i = d3.interpolateNumber(numberStart, numberEnd);
  return function(t) { selection.text(options.nodeBarFormat(i(t)) + options.nodeBarUnit); };
};

nodesAPI.getNodeBarD = d => `M ${d.nodeExtend + 5} 0 h ${xEnd - (d.y + d.nodeExtend + 5)}`;
nodesAPI.getXNodeBarRect = d => xEnd - d.y - options.nodeBarScale(d.data[options.nodeBarField]);
nodesAPI.getWidthNodeBarRect = d => options.nodeBarScale(d.data[options.nodeBarField]);
nodesAPI.getXNodeBarText = d => xEnd - d.y - 5;

nodesAPI.getNodeBarTextFill = function(d) {
  return options.nodeBarTextFill ? options.nodeBarTextFill(d) : d3.select(this).style("fill");
};

nodesAPI.getNodeBarRectFill = function(d) {
  return options.nodeBarRectFill ? options.nodeBarRectFill(d) : d3.select(this).style("fill");
};

nodesAPI.getNodeBarRectStroke = function(d) {
  return options.nodeBarRectStroke ? options.nodeBarRectStroke(d) : d3.select(this).style("stroke");
};