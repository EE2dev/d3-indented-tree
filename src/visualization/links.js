import * as d3 from "d3";

export let linksAPI = {};
let options;
let oldLabelField , newLabelField;
let labelDimensions;

linksAPI.initialize = function(_options) { 
  options = _options; 
  oldLabelField = newLabelField;
  newLabelField = options.linkLabelOn ? options.linkLabelField : undefined;
  if (options.debugOn) {
    console.log("oldLabel:");
    console.log(oldLabelField);
    console.log("newLabel:");
    console.log(newLabelField);
  }
};

linksAPI.getLinkD = function (d, direction, updatePattern = false) {
  const linkStrengthParent = linksAPI.getLinkStrength(d.parent, options);
  const linkStrength = linksAPI.getLinkStrength(d, options);
  let path;
  if (direction === "vertical"){
    if (updatePattern) { // for updated links use .x of last child to support resorted nodes/links
      const xLastChild = d.parent.children[d.parent.children.length - 1].x;
      path = "M 0 " + (-1 * Math.floor(linkStrengthParent / 2)) + " V" + (xLastChild + linkStrength / 2 - d.parent.x);
    } else {
      path = "M 0 " + (-1 * Math.floor(linkStrengthParent / 2)) + " V" + (d.x + linkStrength / 2 - d.parent.x);
    }
  } else if (direction === "horizontal"){
    const m = (d.y >= d.parent.y) ? 
      (d.y - (d.parent.y + linkStrengthParent / 2)) 
      : (d.y - (d.parent.y - linkStrengthParent / 2));
    path = "M 0 0" + "H" + m;
    if (options.debugOn) { 
      console.log("Name: "+ d.name + " m: " + m);
    }
    // path = "M 0 0" + "H" + (d.y - (d.parent.y + linkStrengthParent / 2));
  }
  return path;
};

linksAPI.getDy = function (d) {
  if (options.linkLabelOnTop) { return "0.35em";}
  else {
    return Math.ceil((-.5) * linksAPI.getLinkStrength(d) -3);
  }
};

// initialize to support switch from labelonTop to labelabove and vice versa
// otherwise transition throws error when trying "0.35em" --> 1 or 1 --> "0.35em" 
linksAPI.getInitialDy = function () { 
  if (!d3.select(this).attr("dy")) { return null;}
  if (options.linkLabelOnTop) { 
    return (d3.select(this).attr("dy").endsWith("em")) ? d3.select(this).attr("dy") : "0.35em";
  }
  else {
    return (d3.select(this).attr("dy").endsWith("em")) ? 0 : d3.select(this).attr("dy");
  }
};

linksAPI.getLinkStrength = function (d) {
  if (!d.data) return 0;
  const s = options.linkStrengthStatic ? options.linkStrengthValue 
    : options.linkStrengthScale(d.data[options.linkStrengthField]); 
  return s;
};

linksAPI.getLinkStroke = function (d) {
  return options.linkColorStatic ? options.defaultColor : options.linkColorScale(d.data[options.linkColorField]);
};

linksAPI.getLinkStrokeWidth = function (d) {
  return linksAPI.getLinkStrength(d) + "px";
};

linksAPI.getLinkLabel = function(d, labelField = options.linkLabelField) {
  return (!options.linkLabelOn || typeof (d.data[labelField]) === "undefined") ? "" : d.data[labelField]; 
};

linksAPI.getLinkLabelFormatted = function(d, labelField = options.linkLabelField) {
  //  if (!options.linkLabelOn || !d.data[labelField]) {
  // console.log(d.name + " " + d.data[labelField] + " " + isNaN(d.data[labelField]));
  if (!options.linkLabelOn || typeof (d.data[labelField]) === "undefined") {
    return "";
  } // else if (typeof d.data[labelField] === "string") {
  else if (isNaN(d.data[labelField])) {
    return d.data[labelField];
  } else {
    return options.linkLabelFormat(d.data[labelField]) + options.linkLabelUnit; 
  }
};

linksAPI.getLinkTextTween = function(d) { 
  const selection = d3.select(this);
  /*
  if (!options.linkLabelOn) {
    return function() { selection.text(""); };
  } 
  */
  const numberStart = linksAPI.getLinkLabel(d, oldLabelField);
  const numberEnd = linksAPI.getLinkLabel(d, newLabelField);

  if (!isNumber(numberStart) || !isNumber(numberEnd)) {
    return function() { selection.text(numberEnd); };
  }
  const i = d3.interpolateNumber(numberStart, numberEnd);
  return function(t) { selection.text(options.linkLabelFormat(i(t)) + options.linkLabelUnit); };
};

function isNumber(num) {
  return typeof(num) === "number";
}

linksAPI.getLinkRTranslate = function (d) {
  return "translate(" + (linksAPI.getLinkStrength(d.parent) / 2) + " " + (d.x - d.parent.x) + ")";
};

linksAPI.getLinkLabelColor = function (d) {
  if (!options.linkLabelColor) {
    return d3.select(this).style("fill");
  } else { 
    return options.linkLabelColor(linksAPI.getLinkLabel(d, oldLabelField));
  }
};

linksAPI.getLinkTextPositionX = function (d) {
  /* aligned: x center position of the shortest link + half the extent of the longest label */
  const shiftAlign = options.linkLabelAligned ? 
    // labelDimensions[d.depth].posXCenter + labelDimensions[d.depth].maxX / 2 
    labelDimensions.get(d.depth).posXCenter + labelDimensions.get(d.depth).maxX / 2 
    : (d.y - d.parent.y) / 2;
  return shiftAlign;
};

linksAPI.computeLabelDimensions = function (sel) {
  // let dims = [];
  const dims = new Map();
  sel
    .each(function(d) {
      let dimProperties = {};
      const height = d3.select(this).node().getBBox().height;
      const width = d3.select(this).node().getBBox().width;
      const text = d3.select(this).text();
      // if (!dims[d.depth]) {
      if (!dims.get(d.depth)) {
        dimProperties.maxX = width;
        dimProperties.minX = width;
        dimProperties.maxY = height;
        dimProperties.maxXText = text;
        dimProperties.maxYText = text;
        dimProperties.posXCenter = (d.y - d.parent.y) / 2;
        // dims.push(dimProperties);
        dims.set(d.depth, dimProperties);
      } else {  
        dimProperties = dims.get(d.depth);
        if (dimProperties.maxX < width) {   
          dimProperties.maxX = width;
          dimProperties.maxXText = text;
        } 
        if (dimProperties.posXCenter > (d.y - d.parent.y) / 2) {
          dimProperties.posXCenter = (d.y - d.parent.y) / 2;
        } 
        if (dimProperties.maxY < height) {
          dimProperties.maxY = height;
          dimProperties.maxYText = text;
        } 
        dims.set(d.depth, dimProperties);
      }
    });
  labelDimensions = dims;
  if (options.debugOn) {
    console.log("dimensions:");
    console.log(dims);
  }
};