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

linksAPI.getLinkD = function (d, direction) {
  const linkStrengthParent = linksAPI.getLinkStrength(d.parent, options);
  const linkStrength = linksAPI.getLinkStrength(d, options);
  let path;
  if (direction === "down"){
    path = "M 0 0" + "V" + (d.x + linkStrength / 2 - d.parent.x);
  } else if (direction === "right"){
    path = "M 0 0" + "H" + (d.y - (d.parent.y + linkStrengthParent / 2));
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
  /*
  const sw = options.linkStrengthStatic ? options.linkStrengthValue
    : options.linkStrengthScale(d.data[options.linkStrengthField]); 
  return sw + "px";
  */
  return linksAPI.getLinkStrength(d) + "px";
};

linksAPI.getLinkLabel = function(d, labelField = options.linkLabelField) {
  return (!options.linkLabelOn) ? "" : d.data[labelField]; 
};

linksAPI.getLinkLabelFormatted = function(d, labelField = options.linkLabelField) {
  return (!options.linkLabelOn) ? "" :
    options.linkLabelFormat(d.data[labelField]) + options.linkLabelUnit; 
};

linksAPI.getLinkTextTween = function(d) { 
  const selection = d3.select(this);
  if (!options.linkLabelOn) {
    return function() { selection.text(""); };
  }
  const numberStart = linksAPI.getLinkLabel(d, oldLabelField);
  const numberEnd = linksAPI.getLinkLabel(d, newLabelField);
  const i = d3.interpolateNumber(numberStart, numberEnd);
  return function(t) { selection.text(options.linkLabelFormat(i(t)) + options.linkLabelUnit); };
};

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
  const shiftAlign = options.linkLabelAligned ? labelDimensions[d.depth].maxX / 2 : 0;
  return (d.y - d.parent.y) / 2 + shiftAlign; 
};

linksAPI.computeLabelDimensions = function (trans) {
  // if (!options.linkLabelOn) { return;}
  let dims = [undefined];
  trans
    .each(function(d) {
      let labelDimensions = {};
      const height = d3.select(this).node().getBBox().height;
      const width = d3.select(this).node().getBBox().width;
      const text = d3.select(this).text();
      if (!dims[d.depth]) {
        labelDimensions.maxX = width;
        labelDimensions.maxY = height;
        labelDimensions.maxXText = text;
        labelDimensions.maxYText = text;
        dims.push(labelDimensions);
      } else {          
        if (dims[d.depth].maxX < width) {
          dims[d.depth].maxX = width;
          dims[d.depth].maxXText = text;
        } 
        if (dims[d.depth].maxY < height) {
          dims[d.depth].maxY = height;
          dims[d.depth].maxYText = text;
        } 
      }
    });
  labelDimensions = dims;
  if (options.debugOn) {
    console.log("dimensions:");
    console.log(dims);
  }
};