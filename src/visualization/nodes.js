import * as d3 from "d3";

export let nodesAPI = {};
let options;
// let nodeImageColor;

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

/*
nodesAPI.appendNodeSVG = function (selection) {
  selection.append("circle")
    .attr("r", 4.5) 
    .style("fill", function (d) {
      return d._children ? "lightsteelblue" : "#fff";
    });
};

nodesAPI.updateNodeSVG = function (transition) {
  transition.select("circle")
    .style("fill", "none");
};
*/
nodesAPI.appendNodeSVG = function (selection) {
  selection.append("rect")
    .attr("class", "nodeImage")
    .attr("x", -5)
    .attr("y", -5) 
    .attr("width", 10)
    .attr("height", 10);
  
  // nodeImageColor = d3.select(".node .nodeImage").style("stroke");

  //const sel2 = selection.filter(d => d._children);
  const sel2 = selection;
  sel2.append("line")
    // .attr("class", "cross nodeImage")
    .attr("class", d => d._children ? "cross nodeImage" : "cross invisible")
    .attr("x1", 0)
    .attr("y1", -5) 
    .attr("x2", 0)
    .attr("y2", 5);
  // .style("stroke", d => d._children ? nodeImageColor : "none"); 

  sel2.append("line")
    //.attr("class", "cross nodeImage")
    .attr("class", d => d._children ? "cross nodeImage" : "cross invisible")
    .attr("x1", -5)
    .attr("y1", 0) 
    .attr("x2", 5)
    .attr("y2", 0);
  // .style("stroke", d => d._children ? nodeImageColor : "none");
  // .style("stroke", d => d._children ? "grey" : "none");
  // .style("fill", "none");
};

/*
nodeAPI.setNodePattern = function (svg) {
  svg.append("pattern")
    .attr("id", "node-pattern")
  <pattern id="pattern-checkers" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse" >
    <!-- Two instances of the same checker, only positioned apart on the `x` and `y` axis -->
    <!-- We will define the `fill` in the CSS for flexible use -->
    <rect class="checker" x="0" width="100" height="100" y="0"/>
    <rect class="checker" x="100" width="100" height="100" y="100"/>
  </pattern>
}
*/


nodesAPI.updateNodeSVG = function (transition) {
  // const trans2 = transition.select("rect").filter(d => d._children);
  transition.selectAll("line.cross")
    .attr("class", d => d._children ? "cross nodeImage" : "cross invisible");
  // .style("stroke", d => d._children ? nodeImageColor : "none");
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

