import * as d3 from "d3";
import { linksAPI } from "./links.js";

export let nodesAPI = {};
let options;
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
    .attr("class", "node-image")
    .attr("x", -5)
    .attr("y", -5) 
    .attr("width", 10)
    .attr("height", 10);

  const sel2 = selection;
  sel2.append("line")
    .attr("class", d => d._children ? "cross node-image" : "cross invisible")
    .attr("x1", 0)
    .attr("y1", -5) 
    .attr("x2", 0)
    .attr("y2", 5);

  sel2.append("line")
    .attr("class", d => d._children ? "cross node-image" : "cross invisible")
    .attr("x1", -5)
    .attr("y1", 0) 
    .attr("x2", 5)
    .attr("y2", 0);
};

nodesAPI.updateNodeSVG = function (transition) {
  transition.selectAll("line.cross")
    .attr("class", d => d._children ? "cross node-image" : "cross invisible");
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
    .attr("class", "node-image")
    .attr("xlink:href", options.nodeImageFileAppend)
    .attr("width", options.nodeImageWidth)
    .attr("height", options.nodeImageHeight)
    .attr("x", options.nodeImageX)
    .attr("y", options.nodeImageY);
};

nodesAPI.updateNodeImage = function (transition) {
  transition
    .select(".node-image")
    .attr("xlink:href", options.nodeImageFileAppend);    
};

nodesAPI.computeNodeExtend = function(sel) {
  let alignmentAnchorArray = [];
  let anchorXPos;
  let maxLinkLabel = 0;

  const l = linksAPI;
  // l.initialize(options);

  const filteredSel = sel.filter(d => typeof(d.data[newLabelField]) !== "undefined" );
  filteredSel.each(function(d) {
    d.nodeBar = {};
    /*
    const labelBBox = d3.select(this).select(".node-label").node().getBBox();
    const imageBBox = d3.select(this).select(".node-image").node().getBBox();
    const nodeEnd = (labelBBox.width !== 0) ? labelBBox.x + labelBBox.width : imageBBox.x + imageBBox.width;
    
    d.nodeBar.connectorStart2 = (!d.parent || d.y >= d.parent.y) ? 
      nodeEnd + 5 
      : (d.parent.y - d.y) + l.getLinkStrength(d.parent, options) / 2 + 5;
      */
    d.nodeBar.connectorStart = getConnectorStart(d3.select(this), d, l);
    // console.log(d.name + ": " + (d.nodeBar.connectorStart === d.nodeBar.connectorStart2) 
    //  + " " + d.nodeBar.connectorStart + " = " + d.nodeBar.connectorStart2);

    d.nodeBar.labelWidth = getBarLabelWidth(d.data[newLabelField]);
    alignmentAnchorArray.push(getVerticalAlignmentRef(d, d.y + d.nodeBar.connectorStart));
    maxLinkLabel = (d.linkLabel && d.linkLabel.width > maxLinkLabel) ? d.linkLabel.width : maxLinkLabel;
    if (options.debugOn) { console.log("connctorStart: " + d.nodeBar.connectorStart);}
  });

  alignmentAnchorArray.anchor = Math.max(...alignmentAnchorArray);
  anchorXPos = alignmentAnchorArray.anchor + options.nodeBarTranslateX + maxLinkLabel;

  if (options.debugOn) {
    console.log("alignmentAnchorArray: " + alignmentAnchorArray);
    console.log("options.nodeBarRange[1]: " + options.nodeBarRange[1]);
    console.log("anchorXPos: " + anchorXPos);
  }

  filteredSel.each(function(d) {
    d.nodeBar.anchor = anchorXPos - d.y;
    d.nodeBar.negStart = d.nodeBar.anchor - options.nodeBarRange[1] / 2;

    if (d.data[options.nodeBarField] < 0) { 
      if (options.nodeBarLabelInside) {
        d.nodeBar.textX = d.nodeBar.anchor - 5;
        // comparison if the label is left of bar because bar is too short
        d.nodeBar.connectorLength = labelLargerThanNegBar(d) ?
          (d.nodeBar.textX - d.nodeBar.labelWidth - 5) - d.nodeBar.connectorStart
          : (d.nodeBar.negStart + options.nodeBarScale(d.data[options.nodeBarField]) - 5) 
            - d.nodeBar.connectorStart;
      } else { // labelInside === false
        d.nodeBar.textX = d.nodeBar.negStart + options.nodeBarScale(d.data[options.nodeBarField]) - 5;
        d.nodeBar.connectorLength = (d.nodeBar.textX - d.nodeBar.labelWidth - 5) - d.nodeBar.connectorStart;
      }
    } else { // d.data[options.nodeBarField] >= 0
      if (options.nodeBarLabelInside) {
        d.nodeBar.textX = d.nodeBar.anchor + 5;
        d.nodeBar.connectorLength = (d.nodeBar.anchor - 5) - d.nodeBar.connectorStart;
      }
      else { // labelInside === false
        d.nodeBar.textX = options.nodeBarNeg 
          ? d.nodeBar.negStart + options.nodeBarScale(d.data[options.nodeBarField]) + 5
          : d.nodeBar.anchor + options.nodeBarScale(d.data[options.nodeBarField]) + 5;
        d.nodeBar.connectorLength = (d.nodeBar.anchor - 5) - d.nodeBar.connectorStart;
      }
    } 

    if (options.debugOn) { 
      console.log("connector: " + d.nodeBar.connectorLength); 
      console.log("nodesAPI.getWidthNodeBarRect(d): " + nodesAPI.getWidthNodeBarRect(d));
    }
  });
};

const getConnectorStart = function(sel, d, linkAPI){
  const labelBBox = sel.select(".node-label").node().getBBox();
  const imageBBox = sel.select(".node-image").node().getBBox();
  let cs = 0;
  if (!d.parent || d.y >= d.parent.y) { // 1 node to the right
    if (labelBBox.width !== 0) { // 1.1 nodeImage + nodeLabel
      cs = options.nodeLabelPadding + labelBBox.width;
    } else { // 1.2 nodeImage - no nodeLabel
      cs = imageBBox.width / 2;
    }
  } else { // 2 node to the left
    if (d.linkLabel && d.linkLabel.overlap) { // 2.1 linkLabel to the right of node
      cs = (imageBBox.width / 2) + 5 + d.linkLabel.width;
    } else {
      cs = (d.parent.y - d.y) + linkAPI.getLinkStrength(d.parent, options) / 2;
    }
  }
  return cs + 5;
};

const labelLargerThanNegBar = d => d.nodeBar.labelWidth + 5 > nodesAPI.getWidthNodeBarRect(d);

// get the anchor (0) point of all node bars for alignment 
const getVerticalAlignmentRef = function(d, pos) {
  if (!options.nodeBarLabelInside && d.data[options.nodeBarField] < 0) {
    pos += 5 + d.nodeBar.labelWidth;
  } else if (options.nodeBarLabelInside && d.data[options.nodeBarField] < 0) {
    if (labelLargerThanNegBar(d)) {
      pos += d.nodeBar.labelWidth + 5 - nodesAPI.getWidthNodeBarRect(d);
    }
  }
  pos += d.data[options.nodeBarField] < 0 ? 5 + nodesAPI.getWidthNodeBarRect(d) : 5;
  return pos;
};

const getBarLabelWidth = function(text) {
  const sel = d3.select("g.node")
    .append("text")
    .style("visibility", "hidden")
    .attr("class", "bar-label temp")
    .text(isNaN(text) ? text : options.nodeBarFormat(text) + options.nodeBarUnit);

  const w = sel.node().getBBox().width;
  sel.remove();
  return w;
};

// transitions the node bar label through interpolation and adjust the class of the node bar, adjusts the text-anchor
// when the sign of the node bar label changes
nodesAPI.getNodeBarLabelTween = function(d) { 
  const selection = d3.select(this);
  if (!options.nodeBarOn) {
    return function() { selection.text(""); };
  } 
  const numberStart = oldLabelField ? d.data[oldLabelField] : d.data[newLabelField];
  const numberEnd = d.data[newLabelField];
  
  selection.style("text-anchor", () => numberStart < 0 ? "end" : "start");
  if (isNaN(numberStart) || isNaN(numberEnd)) { // typeof NumberStart or numberEnd == "string"
    return function() { selection.text(numberEnd); };
  }
  
  if (nodesAPI.sameBarLabel()) {
    return function() { selection.text(options.nodeBarFormat(numberEnd) + options.nodeBarUnit); };
  }

  const i = d3.interpolateNumber(numberStart, numberEnd);
  const correspondingBar = d3.selectAll(".node-bar.box").filter((d2) => d2.id === d.id);
  let checkSign = true;
  
  if (!numberStart) { // if numberStart === null or 0
    correspondingBar.attr("class", () => numberEnd >= 0 ? "node-bar box node-bar-positive" : "node-bar box node-bar-negative");
  }
  return function(t) { 
    const num = i(t);
    if (checkSign && numberStart * num <= 0) {
      correspondingBar.attr("class", () => num >= 0 ? "node-bar box node-bar-positive" : "node-bar box node-bar-negative");
      selection.style("text-anchor", () => num < 0 ? "end" : "start");
      checkSign = false;
    }
    selection.text(options.nodeBarFormat(num) + options.nodeBarUnit); 
  };
};

nodesAPI.sameBarLabel = () => {
  console.log("sameBarlabel: " + (oldLabelField === newLabelField));
  return (oldLabelField === newLabelField);
};

/*
nodesAPI.getNodeBarLabelTween = function(d) {
  if (!d.parent) { return; }

  const numberStart = oldLabelField ? d.data[oldLabelField] : d.data[newLabelField];
  const numberEnd = d.data[newLabelField];

  .attr("x", d => (!d.parent || d.y >= d.parent.y) ? options.nodeLabelPadding : -options.nodeLabelPadding)
  .attr("text-anchor", d => (!d.parent || d.y >= d.parent.y) ? "start" : "end");

  const i = d3.interpolateNumber(numberStart, numberEnd);
}
*/

// nodesAPI.getNodeBarD = d => `M ${d.nodeBar.connectorLength + d.nodeBar.connectorStart} 0 h ${-d.nodeBar.connectorLength}`;
/*
nodesAPI.getNodeBarD = d => `M ${d.nodeBar.connectorLength + d.nodeBar.connectorStart} 0 h 
  ${(d.linkLabel && d.linkLabel.width) ? -d.nodeBar.connectorLength + d.linkLabel.width : -d.nodeBar.connectorLength}`;
  */
/*
  nodesAPI.getNodeBarD = d => `M ${d.nodeBar.connectorLength + d.nodeBar.connectorStart} 0 h 
 ${(d.linkLabel && d.linkLabel.overlap) ? -d.nodeBar.connectorLength + d.linkLabel.overlap : -d.nodeBar.connectorLength}`;
*/
nodesAPI.getNodeBarD = d => `M ${d.nodeBar.connectorLength + d.nodeBar.connectorStart} 0 h ${-d.nodeBar.connectorLength}`;

nodesAPI.getXNodeBarRect = d => options.nodeBarNeg ?
  d.nodeBar.negStart + options.nodeBarScale(Math.min(0, d.data[options.nodeBarField]))
  : d.nodeBar.anchor;
nodesAPI.getWidthNodeBarRect = d => Math.abs(options.nodeBarScale(d.data[options.nodeBarField]) - options.nodeBarScale(0));
nodesAPI.getXNodeBarText = d => d.nodeBar.textX;

nodesAPI.getNodeBarTextFill = function(d) {
  return options.nodeBarTextFill ? options.nodeBarTextFill(d) : d3.select(this).style("fill");
};

nodesAPI.getNodeBarRectFill = function(d) {
  return options.nodeBarRectFill ? options.nodeBarRectFill(d) : null;
  // return options.nodeBarRectFill ? options.nodeBarRectFill(d) : d3.select(this).style("fill");
};

nodesAPI.getNodeBarRectStroke = function(d) {
  return options.nodeBarRectStroke ? options.nodeBarRectStroke(d) : d3.select(this).style("stroke");
};

nodesAPI.getNodeBarTextAnchor = function(d) {
  return d.data[options.nodeBarField] < 0 ? "end" : "start";
};

nodesAPI.setNodeBarDefaultClass = function(d) {
  if (!oldLabelField || oldLabelField === newLabelField) { 
    return d.data[options.nodeBarField] >= 0 ? "node-bar box node-bar-positive" : "node-bar box node-bar-negative";
  } else {
    return d3.select(this).attr("class");
  }
};

