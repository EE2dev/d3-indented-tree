import * as d3 from "d3";

export let nodesAPI = {};
let options;
let nodeExtendArray;
let xEnd;
const connectorLengthMin = 50;
let oldLabelField , newLabelField;

nodesAPI.initialize = function(_options) { 
  options = _options; 
  oldLabelField = newLabelField;
  newLabelField = options.nodeBarOn ? options.nodeBarLabel : undefined;
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
    const nodeEnd = (labelBBox.width !== 0) ? 
      labelBBox.x + labelBBox.width
      : imageBBox.x + imageBBox.width;
    d.nodeBar = {};
    d.nodeBar.nodeEnd = nodeEnd;
    nodeExtendArray.push(d.y + nodeEnd  + 5);
  });
  nodeExtendArray.maxExtend = Math.max(...nodeExtendArray);
  xEnd = nodeExtendArray.maxExtend + connectorLengthMin + options.nodeBarRange[1];

  d3.selectAll(".node").each(function(d) {
    d.nodeBar.LabelWidth = getBarLabelWidth(d.data[newLabelField]);
    d.nodeBar.connectorLengthToNegStart = xEnd - d.y - options.nodeBarRange[1] - d.nodeBar.nodeEnd - 5;
    d.nodeBar.negStart = d.nodeBar.nodeEnd + 5 + d.nodeBar.connectorLengthToNegStart;
    d.nodeBar.negEnd = d.nodeBar.nodeEnd + 5 + d.nodeBar.connectorLengthToNegStart + options.nodeBarScale(0);
    d.nodeBar.posStart = d.nodeBar.negEnd;

    if (options.nodeBarLabelInside) {
      if (d.data[options.nodeBarField] < 0) { 
        d.nodeBar.textX = d.nodeBar.negEnd - 5;
        // comparison if the label is left of bar because bar is too short
        d.nodeBar.connectorLength = (d.nodeBar.LabelWidth + 5 > options.nodeBarScale(d.data[options.nodeBarField]) - options.nodeBarScale(0)) ?
          d.nodeBar.textX - (d.nodeBar.nodeEnd + 5 + d.nodeBar.LabelWidth + 5)
          : d.nodeBar.negStart + options.nodeBarScale(d.data[options.nodeBarField]) 
            - (d.nodeBar.nodeEnd + 5 + 5);
      } else {
        d.nodeBar.textX = d.nodeBar.posStart + 5;
        d.nodeBar.connectorLength = d.nodeBar.posStart - (d.nodeBar.nodeEnd + 5 + 5);
      }
    } else { // labelInside === false
      if (d.data[options.nodeBarField] < 0) {
        d.nodeBar.textX = d.nodeBar.negStart + options.nodeBarScale(d.data[options.nodeBarField]) - 5;
        d.nodeBar.connectorLength = d.nodeBar.textX - (d.nodeBar.nodeEnd + 5 + d.nodeBar.LabelWidth + 5);
      } else {
        d.nodeBar.textX = d.nodeBar.negStart + options.nodeBarScale(d.data[options.nodeBarField]) + 5;
        d.nodeBar.connectorLength = d.nodeBar.posStart - (d.nodeBar.nodeEnd + 5 + 5);
      }
    }
  });
};

const getBarLabelWidth = function(text) {
  const sel = d3.select("g.node")
    .append("text")
    .style("visibility", "hidden")
    .attr("class", "bar-label temp")
    .text(text);

  const w = sel.node().getBBox().width;
  sel.remove();
  return w;
};

// transitions the node bar label through interpolattion and adjusts the class of the node bar
//  when the sign of the node bar label changes
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
  const correspondingBar = d3.selectAll(".node-bar.box").filter((d2) => d2.id === d.id);
  return function(t) { 
    const num = i(t);
    if (numberStart * num < 0) {
      correspondingBar.attr("class", () => num >= 0 ? "node-bar box node-bar-positive" : "node-bar box node-bar-negative");
    }
    selection.text(options.nodeBarFormat(num) + options.nodeBarUnit); 
  };
};

nodesAPI.getNodeBarD = d => `M ${d.nodeBar.connectorLength + d.nodeBar.nodeEnd + 5} 0 h ${-d.nodeBar.connectorLength}`;
nodesAPI.getXNodeBarRect = d => d.nodeBar.negStart + options.nodeBarScale(Math.min(0, d.data[options.nodeBarField]));
nodesAPI.getWidthNodeBarRect = d => Math.abs(options.nodeBarScale(d.data[options.nodeBarField]) - options.nodeBarScale(0));
nodesAPI.getXNodeBarText = d => d.nodeBar.textX;

nodesAPI.getNodeBarTextFill = function(d) {
  return options.nodeBarTextFill ? options.nodeBarTextFill(d) : d3.select(this).style("fill");
};

nodesAPI.getNodeBarRectFill = function(d) {
  return options.nodeBarRectFill ? options.nodeBarRectFill(d) : d3.select(this).style("fill");
};

nodesAPI.getNodeBarRectStroke = function(d) {
  return options.nodeBarRectStroke ? options.nodeBarRectStroke(d) : d3.select(this).style("stroke");
};

nodesAPI.getNodeBarTextAnchor = function(d) {
  return d.data[options.nodeBarField] < 0 ? "end" : "start";
};

nodesAPI.setNodeBarDefaultClass = function(d) {
  return d.data[options.nodeBarField] >= 0 ? "node-bar box node-bar-positive" : "node-bar box node-bar-negative";
};

