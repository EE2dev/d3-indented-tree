import * as d3 from "d3";

export let nodesAPI = {};
let options;

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
    } 
    else { nodesAPI.updateNodeSVG(transition); }
  }
};

nodesAPI.appendNodeSVG = function (selection) {
  selection.append("circle")
    .attr("r", 4.5) 
    .style("fill", function (d) {
      return d._children ? "lightsteelblue" : "#fff";
    });
};

nodesAPI.updateNodeSVG = function (transition) {
  transition.select("circle")
    .style("fill", function (d) {
      return d._children ? "lightsteelblue" : "#fff";
    });
};

nodesAPI.appendNodeImage = function (selection) {
  if (options.nodeImageSetBackground) {
    selection.append("rect")
      .attr("width", options.nodeImageWidth)
      .attr("height", options.nodeImageHeight)
      .attr("x", options.nodeImageX)
      .attr("y", options.nodeImageY)
      .style("fill", d3.select("div.chart").style("background-color"));
  }
  selection.append("image")
    .attr("xlink:href", options.nodeImageFileAppend)
    .attr("width", options.nodeImageWidth)
    .attr("height", options.nodeImageHeight)
    .attr("x", options.nodeImageX)
    .attr("y", options.nodeImageY);
};

nodesAPI.updateNodeImage = function (transition) {
  transition
    .select("image")
    .attr("xlink:href", options.nodeImageFileAppend);    
};

