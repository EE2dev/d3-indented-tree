import * as d3 from "d3";

export let linksAPI = {};
let options;
let oldLabelField , newLabelField;
// let labelDimensions;

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
    /*
    if (options.debugOn) { 
      console.log("Name: "+ d.name + " m: " + m);
    }
    */
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
  if (!options.linkLabelOn) {
    return function() { selection.text(""); };
  } 
  const numberStart = linksAPI.getLinkLabel(d, oldLabelField);
  const numberEnd = linksAPI.getLinkLabel(d, newLabelField);

  if (!isNumber(numberStart) || !isNumber(numberEnd)) {
    return function() { selection.text(numberEnd); };
  }
  const i = d3.interpolateNumber(numberStart, numberEnd);
  return function(t) { selection.text(options.linkLabelFormat(i(t)) + options.linkLabelUnit); };
};

function isNumber(num) {
  // return typeof(num) === "number";
  return !isNaN(num);
}

linksAPI.getLinkRTranslate = function (d) {
  const shift = (d.y >= d.parent.y) ? 
    linksAPI.getLinkStrength(d.parent) / 2
    : -1 * linksAPI.getLinkStrength(d.parent) / 2;
  return "translate(" + shift + " " + (d.x - d.parent.x) + ")";
  // return "translate(" + (linksAPI.getLinkStrength(d.parent) / 2) + " " + (d.x - d.parent.x) + ")";
};

linksAPI.getLinkLabelColor = function (d) {
  if (!options.linkLabelColor) {
    return d3.select(this).style("fill");
  } else { 
    return options.linkLabelColor(linksAPI.getLinkLabel(d, oldLabelField));
  }
};

/* aligned: x center position of the shortest link + half the extent of the longest label of siblings */
linksAPI.getLinkTextPositionX = d => (options.linkLabelAlignment === "aligned")? d.linkLabelPos : (d.y - d.parent.y) / 2;
/*
  const shiftAlign = options.linkLabelAligned ? d.linkLabelAnchor : (d.y - d.parent.y) / 2;
  return shiftAlign;
};
*/
linksAPI.getLinkLabelAnchor = function(d) {
  if (options.linkLabelAlignment === "aligned") {
    return d.linkLabelAnchor;
  } else {
    return options.linkLabelAlignment; // "start", "middle" or "end"
  }
};

linksAPI.setupLabelDimensions = function (sel) {
  const dimArray = computeLabelDimensions(sel);
  storeLinkLabelAnchor(sel, dimArray);

  if (options.debugOn) {
    console.log("dimensions:");
    console.log(dimArray);
  }
};

function computeLabelDimensions(sel) {
  const dimArray = [];
  const dimsPositive = new Map();
  const dimsNegative = new Map(); // for link labels on links going to the left
  let dims;
  sel
    .each(function(d) {
      let dimProperties = {};
      const height = d3.select(this).node().getBBox().height;
      const width = d3.select(this).node().getBBox().width;
      const text = d3.select(this).text();
      
      dims = (d.y >= d.parent.y) ? dimsPositive : dimsNegative;
      if (width <= Math.abs(d.y - d.parent.y) - 5) {
        if (!dims.get(d.parent.id)) {
          dimProperties.maxX = width;
          dimProperties.minX = width;
          dimProperties.maxY = height;
          dimProperties.maxXText = text;
          dimProperties.maxYText = text;
          dimProperties.posXCenter = (d.y - d.parent.y) / 2;
          dims.set(d.parent.id, dimProperties);
        } else {  
          dimProperties = dims.get(d.parent.id);
          if (dimProperties.maxX < width) {   
            dimProperties.maxX = width;
            dimProperties.maxXText = text;
          } 
          if ((d.y >= d.parent.y) && dimProperties.posXCenter > (d.y - d.parent.y) / 2) {
            dimProperties.posXCenter = (d.y - d.parent.y) / 2;
          } else if ((d.y < d.parent.y) && dimProperties.posXCenter < (d.y - d.parent.y) / 2) {
            dimProperties.posXCenter = (d.y - d.parent.y) / 2;
          }
          if (dimProperties.maxY < height) {
            dimProperties.maxY = height;
            dimProperties.maxYText = text;
          } 
          dims.set(d.parent.id, dimProperties);
        }
      }
    });
  dimArray.push(dimsPositive);
  dimArray.push(dimsNegative);
  return dimArray;
}

function storeLinkLabelAnchor(sel, dimArray) {
  let dims;
  sel.each(function(d) {
    const width = d3.select(this).node().getBBox().width;
    dims = (d.y >= d.parent.y) ? dimArray[0] : dimArray[1];
    d.linkLabelAnchor = "end";
    d.linkLabelAlways = true;
    if (width <= Math.abs(d.y - d.parent.y) - 5) {
      d.linkLabelPos = dims.get(d.parent.id).posXCenter + dims.get(d.parent.id).maxX / 2;
    } else { // label too short to fit on link
      d.linkLabelAlways = false;
      if (d.y >= d.parent.y) { // link to the left
        d.linkLabelPos = (d.y - d.parent.y) - 10;
      } else { // link to the right
        d.linkLabelPos =  (d.y - d.parent.y) + 10;
        d.linkLabelAnchor = "start";
        // shorted nodeBar connectors to avoid overlap
        d3.selectAll(".node-bar.connector")
          .filter(df => df.id === d.id)
          // .atttr("d", )
        ;
      }
    }
  });
}

