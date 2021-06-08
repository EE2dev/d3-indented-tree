// https://github.com/EE2dev/d3-indented-tree v0.6.0 Copyright 2021 Mihael Ankerst
(function (global, factory) {
typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3')) :
typeof define === 'function' && define.amd ? define(['exports', 'd3'], factory) :
(factory((global.d3 = global.d3 || {}),global.d3));
}(this, (function (exports,d3) { 'use strict';

////////////////////////////////////////////////////
// Processing data                                //
//////////////////////////////////////////////////// 

// XHR to load data   
function readData(myData, selection, options, createChart) {
  const debugOn = options.debugOn;
  if (myData.fromFile) { // read data from file 
    if (myData.data.endsWith(".json")) { // JSON Format
      d3.json(myData.data).then(function(data){
        if (debugOn) { console.log("Initial Data: ");console.log(data);}
        const hierarchy = d3.hierarchy(data);
        if (debugOn) { console.log("hierarchy: "); console.log(hierarchy);}
        createChart(selection, hierarchy);
      });
    } else if (myData.data.endsWith(".csv")) {
      d3.dsv(myData.delimiter, myData.data, myData.autoConvert ? myData.convertTypesFunction : undefined)
        .then(function(data) {
          if (debugOn) { console.log(data);}
          if (myData.flatData) {
            data = createLinkedData(data, myData.hierarchyLevels, myData.keyField
              , myData.delimiter, myData.separator, options, myData.autoConvert, myData.convertTypesFunction); // csv Format 1
          }
          const hierarchy = createHierarchy(data, myData.keyField);
          if (debugOn) { console.log("hierarchy: "); console.log(hierarchy);}
          createChart(selection, hierarchy);
        });
    } else {
      console.log("File must end with .json or .csv");
    }
  } 
  else { // read data from DOM or JSON variable
    let hierarchy;
    if (myData.isJSON) {
      hierarchy = d3.hierarchy(myData.data);
    } else {
      const convert = myData.flatData ? false : myData.autoConvert; // for flat data the autoconvert is applied with createLinkedData()
      let data = readDataFromDOM(myData.delimiter, myData.data, convert, myData.convertTypesFunction);
      if (myData.flatData) {
        data = createLinkedData(data, myData.hierarchyLevels, myData.keyField
          , myData.delimiter, myData.separator, options, myData.autoConvert, myData.convertTypesFunction); // csv Format 1
      }
      hierarchy = createHierarchy(data, myData.keyField); // csv format 2
      if (debugOn) { console.log("embedded data: "); console.log(hierarchy);}
    }
    createChart(selection, hierarchy);
  }
}

function readDataFromDOM(delimiter, selector = "aside#data", autoConvert = true, convertTypesFunction) {
  const inputData = d3.select(selector).text();
  const inputData_cleaned = inputData.trim();
  const parser = d3.dsvFormat(delimiter);
  const file = parser.parse(inputData_cleaned, autoConvert ? convertTypesFunction : undefined);
  return file; 
}

function createHierarchy(data, key) {
  let root = d3.stratify()
    .id(function(d) { return d[key]; })
    .parentId(function(d) { return d.parent; })(data);
  return root;
}

function buildKey(row, keys, keyIndex, delimiter, keySeparator){
  let parent = getParent(row, keys, keyIndex, keySeparator);
  let child = parent + keySeparator + row[keys[keyIndex]];
  const pcKey = parent + delimiter + child;
  return pcKey;
} 

function getParent(row, keys, keyIndex, keySeparator){
  let parent = (keyIndex === 1) ? keys[0] : row[keys[keyIndex-1]];
  for (let i = 0; i < keyIndex; i++) {
    if (i === 0) { parent = keys[0];}
    else {
      parent += keySeparator + row[keys[i]];
    }
  }
  return parent;
}

function createLinkedData(data, keys, keyField, delimiter, keySeparator
  , options, autoConvert, convertTypesFunction) {
  const debugOn = options.debugOn;
  const nodeLabel = options.nodeLabelFieldFlatData; //"__he_name";
  
  let linkedDataString;
  let linkedDataArray;
  let parentChild = new Map();
  let pcKey;
  let pcValue;
  let setAll = (obj, val) => Object.keys(obj).forEach(k => obj[k] = val);
  let setNull = obj => setAll(obj, "");
  let newRow;
  let rowString;
  let proceed = true;

  data.forEach((row) => {
    proceed = true;
    keys.forEach( (key, j) => {
      if (j > 0 && proceed) {
        pcValue = {};      
        if (debugOn && row[key]) { 
          console.log("row[key]: "); 
          console.log(row); 
          console.log("key: ");
          console.log(key); 
        }  
        if (j === keys.length-1) { 
          pcKey = buildKey( row, keys, j, delimiter, keySeparator);
          if (!parentChild.get(pcKey)) {
            Object.assign(pcValue, row);
            pcValue[nodeLabel] = row[key];
            parentChild.set(pcKey, pcValue);
          }
        } else  {
          pcKey = buildKey( row, keys, j, delimiter, keySeparator);
          if (!row[keys[j+1]]) {
            Object.assign(pcValue, row);
            pcValue[nodeLabel] = row[key];
            parentChild.set(pcKey, pcValue);
            proceed = false;
          } else {
            if (!parentChild.get(pcKey)) {
              Object.assign(pcValue, row);
              setNull(pcValue);
              pcValue[nodeLabel] = row[key];
              parentChild.set(pcKey, pcValue);
            }
          }
        }
      } 
    });
  });

  // build the String in the linked data format
  // add column names to string
  if (debugOn) { console.log(parentChild); }
  
  rowString = "parent" + delimiter + keyField;
  Object.keys(data[0]).forEach( (key) => { rowString += delimiter + key; });
  rowString += delimiter + nodeLabel;

  linkedDataString = rowString + "\n";

  // add root node to string
  rowString = delimiter + keys[0] + delimiter;
  rowString += delimiter.repeat(Object.keys(data[0]).length);
  if (keys[0] !== keySeparator) { rowString += keys[0]; } 
  linkedDataString += rowString + "\n";

  // all other nodes
  for (var [key, value] of parentChild) {
    rowString = key;
    newRow = Object.values(value);
    newRow.forEach(d => { rowString += delimiter + d;});
    linkedDataString += rowString + "\n";
  }

  if (debugOn) {
    console.log("converted linked Data:");
    console.log(linkedDataString);
  }

  const parser = d3.dsvFormat(delimiter);
  linkedDataArray = parser.parse(linkedDataString, autoConvert ? convertTypesFunction : undefined);
  // if nodeLabel === " " it was converted to null, so here its changed to " "  
  linkedDataArray.map(ele => { ele[nodeLabel] = ele[nodeLabel] ? ele[nodeLabel] : " ";});

  if (debugOn) {
    console.log("converted linked Data array:");
    console.log(linkedDataArray);
  }

  return linkedDataArray;
}

// import { nodesAPI } from "./nodes.js";

let linksAPI = {};
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
  return (!options.linkLabelOn || typeof (d.data[labelField]) === "undefined" || d.data[labelField] === null)
    ? "" : d.data[labelField]; 
};

linksAPI.getLinkLabelFormatted = function(d, labelField = options.linkLabelField) {
  if (!options.linkLabelOn || typeof (d.data[labelField]) === "undefined") {
    return "";
  } 
  else if (isNaN(d.data[labelField]) || typeof d.data[labelField] === "string") {
    return d.data[labelField];
  } else {
    return options.linkLabelFormat(d.data[labelField]) + options.linkLabelUnit; 
  }
};

linksAPI.getLinkTextTween = function(d) { 
  const selection = d3.select(this);
  if (!options.linkLabelOn || d.data[newLabelField] === null) {
    return function() { selection.text(""); };
  } 
  const numberStart = linksAPI.getLinkLabel(d, oldLabelField);
  const numberEnd = linksAPI.getLinkLabel(d, newLabelField);

  if (!isNumber(numberStart) || !isNumber(numberEnd)) {
    return function() { selection.text(numberEnd); };
  }
  const i = d3.interpolateNumber(numberStart, numberEnd);
  return function(t) { 
    selection.text(options.linkLabelFormat(i(t)) + options.linkLabelUnit); 
  };
};

function isNumber(num) {
  // return !isNaN(num);
  return !isNaN(num) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
         !isNaN(parseFloat(num)); // ...and ensure strings of whitespace fail
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
// linksAPI.getLinkTextPositionX = d => (options.linkLabelAlignment === "aligned")? d.linkLabel.pos : (d.y - d.parent.y) / 2;
linksAPI.getLinkTextPositionX = d => {
  let ret;
  switch(options.linkLabelAlignment) {
  case "aligned":
    ret = d.linkLabel.pos;
    break;
  case "start":
    ret = (d.y >= d.parent.y) ? 10 : (d.y - d.parent.y) + 10;
    break;
  case "middle":
    ret = (d.y - d.parent.y) / 2;
    break;
  case "end":
    ret = (d.y >= d.parent.y) ? (d.y - d.parent.y) - 10 : - 10;
    break;
  }
  return ret;
};

/*
  const shiftAlign = options.linkLabelAligned ? d.linkLabelAnchor : (d.y - d.parent.y) / 2;
  return shiftAlign;
};
*/
linksAPI.getLinkLabelAnchor = function(d) {
  if (options.linkLabelAlignment === "aligned") {
    return d.linkLabel.anchor;
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
      if (width <= Math.abs(d.y - d.parent.y) - 15) {
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
    d.linkLabel = {};
    d.linkLabel.anchor = "end";
    d.linkLabel.always = true;
    if (width <= Math.abs(d.y - d.parent.y) - 15) {
      d.linkLabel.pos = dims.get(d.parent.id).posXCenter + dims.get(d.parent.id).maxX / 2;
    } else { // label too long to fit on link
      d.linkLabel.always = false;
      if (d.y >= d.parent.y) { // link to the right
        d.linkLabel.pos = (d.y - d.parent.y) - 10;
      } else { // link to the left
        d.linkLabel.pos =  (d.y - d.parent.y) + 10;
        d.linkLabel.anchor = "start";
        d.linkLabel.width = (options.linkLabelAlways && options.linkLabelOnTop && options.linkLabelAlignment === "aligned")
          ? width : 0;
        d.linkLabel.overlap = d.linkLabel.width ? d.linkLabel.pos + d.linkLabel.width : 0;
      }
    }
  });
}

let nodesAPI = {};
let options$1;
let oldLabelField$1 , newLabelField$1;

nodesAPI.initialize = function(_options) { 
  options$1 = _options; 
  oldLabelField$1 = newLabelField$1;
  newLabelField$1 = options$1.nodeBarOn ? options$1.nodeBarLabel : undefined;
};

nodesAPI.appendNode = function (selection) {
  if (options$1.nodeImageFile) {
    nodesAPI.appendNodeImage(selection);
  } else {
    (options$1.nodeImageSelectionAppend && typeof options$1.nodeImageSelectionAppend === "function") 
      ? options$1.nodeImageSelectionAppend(selection) 
      : nodesAPI.appendNodeSVG(selection);
  }
};

nodesAPI.updateNode = function (transition) {
  if (options$1.nodeImageFile) {
    nodesAPI.updateNodeImage(transition);
  } else {
    if (options$1.nodeImageSelectionUpdate && typeof options$1.nodeImageSelectionUpdate === "function") {
      options$1.nodeImageSelectionUpdate(transition);
    } else if (options$1.nodeImageSelectionAppend && typeof options$1.nodeImageSelectionAppend === "function") {
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
  let imageSelection = selection;
  let noImageSelection = selection.filter(() => false);

  if (typeof options$1.nodeImageFileAppend === "function") {
    imageSelection = selection.filter(d => options$1.nodeImageFileAppend(d));
    noImageSelection = selection.filter(d => !options$1.nodeImageFileAppend(d));
  }

  if (options$1.nodeImageSetBackground) {
    const col = d3.select("div.chart").style("background-color");
    imageSelection.append("rect")
      .attr("width", options$1.nodeImageWidth)
      .attr("height", options$1.nodeImageHeight)
      .attr("x", options$1.nodeImageX)
      .attr("y", options$1.nodeImageY)
      .style("stroke", col)
      .style("fill", col);
  }
  imageSelection.append("image")
    .attr("class", "node-image")
    .attr("xlink:href", options$1.nodeImageFileAppend)
    .attr("width", options$1.nodeImageWidth)
    .attr("height", options$1.nodeImageHeight)
    .attr("x", options$1.nodeImageX)
    .attr("y", options$1.nodeImageY);

  if (options$1.nodeImageDefault && noImageSelection.size() > 0) {
    nodesAPI.appendNodeSVG(noImageSelection);
  }

  if (options$1.debugOn) {
    console.log("imageSelection.size: " + imageSelection.size());
    console.log("noImageSelection.size: " + noImageSelection.size());
  }
};

nodesAPI.updateNodeImage = function (transition) {
  transition
    .select(".node-image")
    .attr("xlink:href", options$1.nodeImageFileAppend);   
    
  nodesAPI.updateNodeSVG(transition); // in case there are fallback/default nodes with no images
};

nodesAPI.computeNodeExtend = function(sel) {
  let alignmentAnchorArray = [];
  let anchorXPos;
  let maxLinkLabel = 0;

  const l = linksAPI;
  // l.initialize(options);

  const filteredSel = sel.filter(d => typeof(d.data[newLabelField$1]) !== "undefined" );
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

    d.nodeBar.labelWidth = getBarLabelWidth(d.data[newLabelField$1]);
    alignmentAnchorArray.push(getVerticalAlignmentRef(d, d.y + d.nodeBar.connectorStart));
    maxLinkLabel = (d.linkLabel && d.linkLabel.width > maxLinkLabel) ? d.linkLabel.width : maxLinkLabel;
    if (options$1.debugOn) { console.log("connctorStart: " + d.nodeBar.connectorStart);}
  });

  alignmentAnchorArray.anchor = Math.max(...alignmentAnchorArray);
  anchorXPos = alignmentAnchorArray.anchor + options$1.nodeBarTranslateX + maxLinkLabel;

  if (options$1.debugOn) {
    console.log("alignmentAnchorArray: " + alignmentAnchorArray);
    console.log("options.nodeBarRange[1]: " + options$1.nodeBarRange[1]);
    console.log("anchorXPos: " + anchorXPos);
  }

  filteredSel.each(function(d) {
    d.nodeBar.anchor = anchorXPos - d.y;
    d.nodeBar.negStart = d.nodeBar.anchor - options$1.nodeBarRange[1] / 2;

    if (d.data[options$1.nodeBarField] < 0) { 
      if (options$1.nodeBarLabelInside) {
        d.nodeBar.textX = d.nodeBar.anchor - 5;
        // comparison if the label is left of bar because bar is too short
        d.nodeBar.connectorLength = labelLargerThanNegBar(d) ?
          (d.nodeBar.textX - d.nodeBar.labelWidth - 5) - d.nodeBar.connectorStart
          : (d.nodeBar.negStart + options$1.nodeBarScale(d.data[options$1.nodeBarField]) - 5) 
            - d.nodeBar.connectorStart;
      } else { // labelInside === false
        d.nodeBar.textX = d.nodeBar.negStart + options$1.nodeBarScale(d.data[options$1.nodeBarField]) - 5;
        d.nodeBar.connectorLength = (d.nodeBar.textX - d.nodeBar.labelWidth - 5) - d.nodeBar.connectorStart;
      }
    } else { // d.data[options.nodeBarField] >= 0
      if (options$1.nodeBarLabelInside) {
        d.nodeBar.textX = d.nodeBar.anchor + 5;
        d.nodeBar.connectorLength = (d.nodeBar.anchor - 5) - d.nodeBar.connectorStart;
      }
      else { // labelInside === false
        d.nodeBar.textX = options$1.nodeBarNeg 
          ? d.nodeBar.negStart + options$1.nodeBarScale(d.data[options$1.nodeBarField]) + 5
          : d.nodeBar.anchor + options$1.nodeBarScale(d.data[options$1.nodeBarField]) + 5;
        d.nodeBar.connectorLength = (d.nodeBar.anchor - 5) - d.nodeBar.connectorStart;
      }
    } 

    if (options$1.debugOn) { 
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
      cs = options$1.nodeLabelPadding + labelBBox.width;
    } else { // 1.2 nodeImage - no nodeLabel
      cs = imageBBox.width / 2;
    }
  } else { // 2 node to the left
    if (d.linkLabel && d.linkLabel.overlap) { // 2.1 linkLabel to the right of node
      cs = (imageBBox.width / 2) + 5 + d.linkLabel.width;
    } else {
      cs = (d.parent.y - d.y) + linkAPI.getLinkStrength(d.parent, options$1) / 2;
    }
  }
  return cs + 5;
};

const labelLargerThanNegBar = d => d.nodeBar.labelWidth + 5 > nodesAPI.getWidthNodeBarRect(d);

// get the anchor (0) point of all node bars for alignment 
const getVerticalAlignmentRef = function(d, pos) {
  if (!options$1.nodeBarLabelInside && d.data[options$1.nodeBarField] < 0) {
    pos += 5 + d.nodeBar.labelWidth;
  } else if (options$1.nodeBarLabelInside && d.data[options$1.nodeBarField] < 0) {
    if (labelLargerThanNegBar(d)) {
      pos += d.nodeBar.labelWidth + 5 - nodesAPI.getWidthNodeBarRect(d);
    }
  }
  pos += d.data[options$1.nodeBarField] < 0 ? 5 + nodesAPI.getWidthNodeBarRect(d) : 5;
  return pos;
};

const getBarLabelWidth = function(text) {
  const sel = d3.select("g.node")
    .append("text")
    .style("visibility", "hidden")
    .attr("class", "bar-label temp")
    .text(isNaN(text) ? text : options$1.nodeBarFormat(text) + options$1.nodeBarUnit);

  const w = sel.node().getBBox().width;
  sel.remove();
  return w;
};

// transitions the node bar label through interpolation and adjust the class of the node bar, adjusts the text-anchor
// when the sign of the node bar label changes
nodesAPI.getNodeBarLabelTween = function(d) { 
  const selection = d3.select(this);
  if (!options$1.nodeBarOn) {
    return function() { selection.text(""); };
  } 
  const numberStart = oldLabelField$1 ? d.data[oldLabelField$1] : d.data[newLabelField$1];
  const numberEnd = d.data[newLabelField$1];
  
  selection.style("text-anchor", () => numberStart < 0 ? "end" : "start");
  if (isNaN(numberStart) || isNaN(numberEnd)) { // typeof NumberStart or numberEnd == "string"
    return function() { selection.text(numberEnd); };
  }
  
  if (nodesAPI.sameBarLabel()) {
    return function() { selection.text(options$1.nodeBarFormat(numberEnd) + options$1.nodeBarUnit); };
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
    selection.text(options$1.nodeBarFormat(num) + options$1.nodeBarUnit); 
  };
};

nodesAPI.sameBarLabel = () => {
  console.log("sameBarlabel: " + (oldLabelField$1 === newLabelField$1));
  return (oldLabelField$1 === newLabelField$1);
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

nodesAPI.getXNodeBarRect = d => options$1.nodeBarNeg ?
  d.nodeBar.negStart + options$1.nodeBarScale(Math.min(0, d.data[options$1.nodeBarField]))
  : d.nodeBar.anchor;
nodesAPI.getWidthNodeBarRect = d => Math.abs(options$1.nodeBarScale(d.data[options$1.nodeBarField]) - options$1.nodeBarScale(0));
nodesAPI.getXNodeBarText = d => d.nodeBar.textX;

nodesAPI.getNodeBarTextFill = function(d) {
  return options$1.nodeBarTextFill ? options$1.nodeBarTextFill(d) : d3.select(this).style("fill");
};

nodesAPI.getNodeBarRectFill = function(d) {
  return options$1.nodeBarRectFill ? options$1.nodeBarRectFill(d) : null;
  // return options.nodeBarRectFill ? options.nodeBarRectFill(d) : d3.select(this).style("fill");
};

nodesAPI.getNodeBarRectStroke = function(d) {
  return options$1.nodeBarRectStroke ? options$1.nodeBarRectStroke(d) : d3.select(this).style("stroke");
};

nodesAPI.getNodeBarTextAnchor = function(d) {
  return d.data[options$1.nodeBarField] < 0 ? "end" : "start";
};

nodesAPI.setNodeBarDefaultClass = function(d) {
  if (!oldLabelField$1 || oldLabelField$1 === newLabelField$1) { 
    return d.data[options$1.nodeBarField] >= 0 ? "node-bar box node-bar-positive" : "node-bar box node-bar-negative";
  } else {
    return d3.select(this).attr("class");
  }
};

////////////////////////////////////////////////////
// add visualization specific processing here     //
//////////////////////////////////////////////////// 

let transCounter = 0;

function myChart(selection, data, options){
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
  if (options.nodeCollapse) {
    // options.updateCollapse();
    collapseTree2(options, config, true);
  }
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

  // 1
  options.updateCollapse = function() {
    collapseTree2(options, config, false);
  };

  options.updateExpand = function() {
    expandTree2(options, config);
  };
  // end 1

  options.updateDefault = function() {
    update(config.root, options, config);
  };
}

function collapseTree2(options, config, firstTime) {
  const root = config.root;

  root.eachAfter(node => {
    if (collapseNode(node, options)) {
      if (options.nodeCollapsePropagate) {
        node.eachAfter(_node => collapse(_node));
      } else {
        collapse(node);
      }
      if (!firstTime) {
        update(node, options, config);
      }
    }
  });
  if (firstTime) {
    update(root, options, config);
  }
}

function collapse(node) {
  if (node.children) {
    node._children = node.children;
    node.children = null;
  }
}

function expandTree2(options, config) {
  const root = config.root;
  root.eachBefore(node => {
    if (expandNode(node, options)) {
      expand(node, options);
      update(node, options, config);
    }
  });
}

function expandNode(node, options) {
  const comparator = options.nodeExpandProperty === "key" ? node.data[options.keyField] : node[options.nodeExpandProperty];
  return (options.nodeExpandArray.includes(comparator));
}

function collapseNode(node, options) {
  const comparator = options.nodeCollapseProperty === "key" ? node.data[options.keyField] : node[options.nodeCollapseProperty];
  return (options.nodeCollapseArray.includes(comparator));
}

function expand(node, options) {
  if (!node.children) {
    node.children = node._children;
    node._children = null;
  }
  if (node.children && (options.nodeExpandPropagate || expandNode(node.children, options))) {
    node.children.forEach(d => expand(d, options));
  } 
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
  console.log("update");
  /** 3
  if (options.nodeCollapse) {
    collapseTree(options, config.root);
    options.nodeCollapse = false;
  } else if (options.nodeExpand) {
    expandTree(options, config.root);
    options.nodeExpand = false;
  }
  3 **/

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
    .on("click", (event, d) => { return click (d, options, config); });

  nodeEnter.call(n.appendNode);

  nodeEnter.append("text")
    .attr("class", "node-label")
    .attr("dy", ".35em")
    .attr("x", d => (!d.parent || d.y >= d.parent.y) ? options.nodeLabelPadding : -options.nodeLabelPadding)
    .attr("text-anchor", d => (!d.parent || d.y >= d.parent.y) ? "start" : "end")
    .text(function (d) {
      if (d.data[options.nodeLabelField].length > options.nodeLabelLength) {
        return d.data[options.nodeLabelField].substring(0, options.nodeLabelLength) + "...";
      } else {
        return d.data[options.nodeLabelField];
      }
    });

  if (options.nodeTitleOn)
    nodeEnter.append("svg:title").text(function (d) {
      return (options.nodeTitleField === "" || !d.data[options.nodeTitleField]) ? d.data[options.nodeLabelField] : d.data[options.nodeTitleField];
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
  
  if (options.debugOn) {
    console.log("transition: " + trans);
    console.log("nodeUpdate.size: " + nodeUpdate.size());
  }

  nodeUpdate
    .attr("transform", d => "translate(" + d.y + "," + d.x + ") scale(1,1)");

  nodeUpdate.call(n.updateNode);

  
  nodeUpdate.selectAll(".node-label")
    //.call(sel => sel.tween("nodeLabel", n.getNodeLabelTween));
    .attr("x", d => (!d.parent || d.y >= d.parent.y) ? options.nodeLabelPadding : -options.nodeLabelPadding)
    .attr("text-anchor", d => (!d.parent || d.y >= d.parent.y) ? "start" : "end");
  
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

// import * as d3 from "d3-js";

function d3_template_reusable (_dataSpec) {
    
  ///////////////////////////////////////////////////
  // 1.0 ADD visualization specific variables here //
  ///////////////////////////////////////////////////
  let options = {};
  // 1. ADD all options that should be accessible to caller
  options.debugOn = false;
  options.margin = {top: 20, right: 10, bottom: 20, left: 10};
  options.svgDimensions = {height: 800, width: 1400};
  options.transitionDurationDefault = 750; // for all transitions except expand/collapse
  options.transitionDurationClick = 750; // for expand/collapse transitions and initial transition
  options.transitionDuration = options.transitionDurationDefault;
  options.locale = undefined;

  options.defaultColor = "grey";
  
  options.nodeBarOn = false;
  options.nodeBarField = "value"; // for the width of the rect
  options.nodeBarLabel = options.nodeBarField; // for the text displayed
  options.nodeBarLabelInside = false; // display the label inside the bar?
  options.nodeBarUnit = "";
  options.nodeBarFormatSpecifier = ",.0f"; 
  options.nodeBarFormat = d3.format(options.nodeBarFormatSpecifier);
  options.nodeBarScale = d3.scaleLinear();
  options.nodeBarRange = [0, 200];
  options.nodeBarRangeUpperBound = options.nodeBarRange[1];
  options.nodeBarRangeAdjusted = false; // true if range is doubled for pos + neg bars
  options.nodeBarUpdateScale = true; // update scale or use current scale
  options.nodeBarTranslateX = 50; // distance between node lebel end and start of minimal neg bar.
  options.nodeBarState = {}; // properties oldField and newField for transitions

  options.nodeImageFile = false; // node image from file or selection
  options.nodeImageFileAppend = undefined; //callback function which returns a image URL
  options.nodeImageSetBackground = false;
  options.nodeImageDefault = true; // default selection is drawn when no image is provided
  options.nodeImageWidth = 10;
  options.nodeImageHeight = 10;
  options.nodeImageX = options.nodeImageWidth / 2;
  options.nodeImageY = options.nodeImageHeight / 2;
  options.nodeImageSelectionAppend = undefined;
  options.nodeImageSelectionUpdate = undefined; // if node changes depending on it is expandable or not

  options.nodeLabelField = undefined;
  options.nodeLabelFieldFlatData = "__he_name";
  options.nodeLabelLength = 50;
  options.nodeLabelPadding = 10;

  options.nodeResort = false;
  options.nodeResortAscending = false;
  options.nodeResortField = "value";
  options.nodeResortByHeight = false;
  options.nodeResortFunction = 
    function(a, b) { 
      let ret = options.nodeResortByHeight ? b.height - a.height : 0 ;
      if (ret === 0) {
        if (typeof (a.data[options.nodeResortField]) === "string") {
          ret = b.data[options.nodeResortField].localeCompare(a.data[options.nodeResortField]);
        } else {
          ret = b.data[options.nodeResortField] - a.data[options.nodeResortField];
        }
      }
      if (options.nodeResortAscending) { ret *= -1; }
      return ret;
    };

  options.nodeCollapse = false;
  options.nodeCollapseArray = [];
  options.nodeCollapseProperty = "key"; // "height" , "depth", "id"
  options.nodeCollapsePropagate = true;

  options.nodeExpand = false;
  options.nodeExpandArray = [];
  options.nodeExpandProperty = "key"; // "height" , "depth", "id"
  options.nodeExpandPropagate = true;

  options.nodeTitleOn = true;
  options.nodeTitleField = ""; // default: options.nodeLabelField which will be set later

  options.linkHeight = 20;

  options.linkLabelField = "value";
  options.linkLabelOn = false;
  options.linkLabelUnit = "";
  options.linkLabelOnTop = true;
  options.linkLabelAlignment = "aligned"; // "aligned", "start", "middle" or "end"
  options.linkLabelAlways = false; // always display link Label ? if false, lael is not displayed if longer than link
  options.linkLabelFormatSpecifier = ",.0f"; 
  options.linkLabelFormat = d3.format(options.linkLabelFormatSpecifier);

  // true if linkWidth is a fixed number, otherwise dynamically calculated from options.linkWidthField
  options.linkWidthStatic = true; 
  options.linkWidthValue = 30;
  options.linkWidthScale = d3.scaleLinear();
  options.linkWidthField = "value";
  options.linkWidthRange = [15, 100];

  // true if linkStrength is a fixed number, otherwise dynamically calculated from options.linkStrengthField
  options.linkStrengthStatic = true; 
  options.linkStrengthValue = 1;
  options.linkStrengthScale = d3.scaleLinear();
  options.linkStrengthField = "value";
  options.linkStrengthRange = [1, 10];

  options.linkColorStatic = true;
  options.linkColorScale = (value) => value; // id function as default - assuming linkColorField contains colors
  options.linkColorField = "color";
  options.linkColorInherit = true; // vertical link inherits color from parent

  options.propagate = false; // default: no propagation
  options.propagateField = "value"; // default field for propagation

  options.alignLeaves = false; // use tree layout as default, otherwise cluster layout
  options.keyField = "key";

  // 2. ADD getter-setter methods here
  chartAPI.debugOn = function(_) {
    if (!arguments.length) return options.debugOn;
    options.debugOn = _;
    return chartAPI;
  }; 

  chartAPI.defaultColor = function(_) {
    if (!arguments.length) return options.defaultColor;
    options.defaultColor = _;
    if (typeof options.updateLinkColor === "function") options.updateLinkColor();
    return chartAPI;
  }; 
  
  chartAPI.margin = function(_) {
    if (!arguments.length) return options.margin;
    options.margin = _;
    return chartAPI;
  }; 

  chartAPI.svgDimensions = function(_) {
    if (!arguments.length) return options.svgDimensions;
    options.svgDimensions = _;
    return chartAPI;
  }; 
    
  chartAPI.nodeLabelLength = function(_) {
    if (!arguments.length) return options.nodeLabelLength;
    options.nodeLabelLength = _;
    return chartAPI;
  };

  chartAPI.nodeLabelPadding = function(_) {
    if (!arguments.length) return options.nodeLabelPadding;
    options.nodeLabelPadding = _;
    return chartAPI;
  };

  chartAPI.transitionDuration = function(_) {
    if (!arguments.length) return options.transitionDuration;
    options.transitionDurationDefault = _;
    options.transitionDuration = _;
    return chartAPI;
  };  

  chartAPI.propagateValue = function(_) {
    if (!arguments.length) return options.propagate + ": " + options.propagateField;
    options.propagate = true;
    options.propagateField = _;
    return chartAPI;
  }; 

  chartAPI.formatDefaultLocale = function(_) {
    if (!arguments.length) return options.locale;
    if (_ === "DE"){
      _ = {
        "decimal": ",",
        "thousands": ".",
        "grouping": [3],
        "currency": ["", " €"]   
      };
    }
    options.locale = d3.formatDefaultLocale(_);
    return chartAPI;
  }; 

  // 3. ADD getter-setter methods with updateable functions here
  chartAPI.nodeBar = function(_ = options.nodeBarField, _options = {}) { 
    if (!arguments.length) return options.nodeBarField;

    if (typeof(_)  === "string")  {
      options.nodeBarField = _; 
      options.nodeBarOn = true;
    } else if (typeof(_)  === "boolean") {
      options.nodeBarOn = _;
    }
    if (options.nodeBarOn) {
      if (_options.locale) { chartAPI.formatDefaultLocale(_options.locale); }
      options.nodeBarLabel = _options.label || options.nodeBarField;
      options.nodeBarState.oldField = options.nodeBarState.newField;
      options.nodeBarState.newField = options.nodeBarLabel;
      options.nodeBarLabelInside = (typeof (_options.labelInside) !== "undefined") ? _options.labelInside : options.nodeBarLabelInside;
      options.nodeBarTextFill = _options.textFill || options.nodeBarTextFill;
      options.nodeBarRectFill = _options.rectFill || options.nodeBarRectFill;
      options.nodeBarRectStroke = _options.rectStroke || options.nodeBarRectStroke;
      options.nodeBarUnit = _options.unit || options.nodeBarUnit;
      options.nodeBarFormat = (_options.format) ? d3.format(_options.format) : options.nodeBarFormat;
      options.nodeBarTranslateX = _options.translateX || options.nodeBarTranslateX;
      options.nodeBarScale  = _options.scale || options.nodeBarScale;
      //options.nodeBarRange = _options.range || options.nodeBarRange;
      if (_options.range) { 
        options.nodeBarRange = _options.range; 
        options.nodeBarRangeAdjusted = false;
        options.nodeBarRangeUpperBound = options.nodeBarRange[1]; 
      }
      options.nodeBarDomain = _options.domain || options.nodeBarDomain;
      if (typeof (_options.updateScale) !== "undefined") {
        options.nodeBarUpdateScale = _options.updateScale;
      } 
      // options.nodeBarUpdateScale = (typeof (_options.updateScale) !== "undefined") ? _options.updateScale : options.nodeBarUpdateScale;
    }
    if (typeof options.updateScales === "function") options.updateScales();
    return chartAPI;
  };

  chartAPI.nodeImageFile = function(_callback, _options = {}) {
    if (!arguments.length) return options.nodeImageFileAppend;
    options.nodeImageFile = true;
    options.nodeImageFileAppend = _callback;
    options.nodeImageWidth = _options.width || options.nodeImageWidth;
    options.nodeImageHeight = _options.height || options.nodeImageHeight;
    options.nodeImageX = _options.x || -1 * options.nodeImageWidth / 2;
    options.nodeImageY = _options.y || -1 * options.nodeImageHeight / 2;
    // options.nodeImageSetBackground = _options.setBackground || options.nodeImageSetBackground;
    options.nodeImageSetBackground = (typeof (_options.setBackground) !== "undefined") ? _options.setBackground : options.nodeImageSetBackground;
    options.nodeImageDefault = (typeof (_options.default) !== "undefined") ? _options.default : options.nodeImageDefault;
    if (typeof options.updateDefault === "function") options.updateDefault();
    return chartAPI;
  };

  chartAPI.nodeImageSelection = function(_append, _update) {
    if (!arguments.length) return options.nodeImageSelectionAppend;
    options.nodeImageSelectionAppend = (_append === false) ? function() {} : _append;
    options.nodeImageSelectionUpdate = _update;
    options.nodeImageFile = false;
    if (typeof options.updateDefault === "function") options.updateDefault();
    return chartAPI;
  };

  chartAPI.nodeSort = function(_ = options.nodeSortField, _options = {}) {
    if (!arguments.length) return options.nodeSortField;
    if (typeof(_)  === "string")  {
      options.nodeResort = true;
      options.nodeResortAscending = (typeof (_options.ascending) !== "undefined") ? _options.ascending : options.nodeResortAscending;
      options.nodeResortByHeight = (typeof (_options.sortByHeight) !== "undefined") ? _options.sortByHeight : options.nodeResortByHeight;
      options.nodeResortField = _;
    }
    if (typeof options.updateDefault === "function") options.updateDefault();
    return chartAPI;
  };

  chartAPI.nodeCollapse = function(_ = options.nodeCollapseArray, _options = {}) {
    if (!arguments.length) return options.nodeCollapseArray;
    if (!Array.isArray(_))  { _ = [_];}
    options.nodeCollapse = true;
    options.nodeCollapseArray = _;
    options.nodeCollapseProperty = _options.property || options.nodeCollapseProperty; 
    options.nodeCollapsePropagate = (typeof (_options.propagate) !== "undefined") ? _options.propagate : options.nodeCollapsePropagate;
    // if (typeof options.updateDefault === "function") options.updateDefault();
    if (typeof options.updateCollapse === "function") options.updateCollapse();
    return chartAPI;
  };

  chartAPI.nodeExpand = function(_ = options.nodeExpandArray, _options = {}) {
    if (!arguments.length) return options.nodeExpandArray;
    if (!Array.isArray(_))  { _ = [_];}
    options.nodeExpand = true;
    options.nodeExpandArray = _;
    options.nodeExpandProperty = _options.property || options.nodeExpandProperty; 
    options.nodeExpandPropagate = (typeof (_options.propagate) !== "undefined") ? _options.propagate : options.nodeExpandPropagate;
    // if (typeof options.updateDefault === "function") options.updateDefault();
    if (typeof options.updateExpand === "function") options.updateExpand();
    return chartAPI;
  };
  
  chartAPI.nodeTitle = function(_ = options.nodeTitleOn) {
    if (!arguments.length) return options.nodeTitleOn;
    options.nodeTitleField = false;

    if (typeof(_)  === "string")  {
      options.nodeTitleField = _; 
      options.nodeTitleOn = true;
    } else if (typeof(_)  === "boolean") {
      options.nodeTitleOn = _;
    }
    if (typeof options.updateDefault === "function") options.updateDefault();
    return chartAPI;
  }; 

  chartAPI.linkHeight = function(_) {
    if (!arguments.length) return options.linkHeight;
    options.linkHeight = _;
    if (typeof options.updateDefault === "function") options.updateDefault();
    return chartAPI;
  };

  chartAPI.linkLabel = function(_ = options.linkLabelField, _options = {}) { 
    if (!arguments.length) return options.linkLabelField;

    if (typeof(_)  === "string")  {
      options.linkLabelField = _; 
      options.linkLabelOn = true;
    } else if (typeof(_)  === "boolean") {
      options.linkLabelOn = _;
    }
    if (options.linkLabelOn) {
      if (_options.locale) { chartAPI.formatDefaultLocale(_options.locale); }
      options.linkLabelColor = _options.color || options.linkLabelColor;
      options.linkLabelUnit = _options.unit || options.linkLabelUnit;
      options.linkLabelFormat = (_options.format) ? d3.format(_options.format) : options.linkLabelFormat;
      options.linkLabelOnTop = (typeof (_options.onTop) !== "undefined") ? _options.onTop : options.linkLabelOnTop;
      options.linkLabelAlways = (typeof (_options.always) !== "undefined") ? _options.always : options.linkLabelAlways;
      options.linkLabelAlignment = _options.align || options.linkLabelAlignment;
    }
    if (typeof options.updateDefault === "function") options.updateDefault();
    return chartAPI;
  };

  chartAPI.linkWidth = function(_ = options.linkWidthField, _options = {}) {
    if (!arguments.length) return options.linkWidthStatic ? options.linkWidthValue : options.linkWidthField;
    if (typeof (_) === "number") { 
      options.linkWidthStatic = true;
      options.linkWidthValue = _;
    }
    else if (typeof(_) === "string") {
      options.linkWidthStatic = false;
      options.linkWidthField = _;
      options.linkWidthScale  = _options.scale || options.linkWidthScale;
      options.linkWidthRange = _options.range || options.linkWidthRange;
    }
    
    if (typeof options.updateLinkWidth === "function") options.updateLinkWidth();
    return chartAPI;
  };

  chartAPI.linkStrength = function(_ = options.linkStrengthField, _options = {}) {
    if (!arguments.length) return options.linkStrengthValue;
    if (typeof (_) === "number") { 
      options.linkStrengthStatic = true;
      options.linkStrengthValue = _;
    }
    else if (typeof(_) === "string") {
      options.linkStrengthStatic = false;
      options.linkStrengthField = _;
      options.linkStrengthScale = _options.scale || options.linkStrengthScale;
      options.linkStrengthRange = _options.range || options.linkStrengthRange;
    }
    
    if (typeof options.updateScales === "function") options.updateScales();
    return chartAPI;
  };

  chartAPI.linkColor = function(_ = options.linkColorField, _options = {}) {
    if (!arguments.length) return options.linkColorField;
    options.linkColorStatic = false;
    options.linkColorField = _;
    options.linkColorScale = _options.scale || options.linkColorScale;
    options.linkColorInherit = (typeof (_options.inherit) !== "undefined") ? _options.inherit : options.linkColorInherit;
    if (typeof options.updateDefault === "function") options.updateDefault();
    return chartAPI;
  }; 

  chartAPI.alignLeaves = function(_) {
    if (!arguments.length) return options.alignLeaves;
    options.alignLeaves = _;
    if (typeof options.updateAlignLeaves === "function") options.updateAlignLeaves();
    return chartAPI;
  }; 
  
  ////////////////////////////////////////////////////
  // API for external access                        //
  //////////////////////////////////////////////////// 

  // standard API for selection.call()
  function chartAPI(selection) {
    selection.each( function (d) {
      console.log(d);
      console.log("dataSpec: "); console.log(_dataSpec);
      if (typeof d !== "undefined") { // data processing from outside
        createChart(selection, d);
      }
      else { // data processing here
        const myData = createDataInfo(_dataSpec);
        readData(myData, selection, options, createChart);
      }
    });
  }  

  function createDataInfo(dataSpec) {
    let myData = {};

    if (typeof dataSpec === "object"){ 
      myData.data = dataSpec.source;
      myData.hierarchyLevels = dataSpec.hierarchyLevels;
      myData.flatData = Array.isArray(myData.hierarchyLevels) ? true : false;
      myData.keyField = dataSpec.key ? dataSpec.key : "key";
      myData.delimiter = dataSpec.delimiter ? dataSpec.delimiter : ",";
      myData.separator = dataSpec.separator ?  dataSpec.separator : "$";

      myData.autoConvert = true; 
      myData.convertTypesFunction = d3.autoType;
      if (dataSpec.convertTypes === "none") {
        myData.autoConvert = false;
      } else {
        if (typeof (dataSpec.convertTypes) === "function") {
          if (myData.flatData) {
            // add key, parent and __he_name as columns, since the conversion is applied
            // after the flat data is transformed to hierarchical data
            const functionWrapper = function(d) {
              let row = dataSpec.convertTypes(d);
              row.key = d.key;
              row.parent = d.parent;
              row.__he_name = d.__he_name;
              return row;
            };
            myData.convertTypesFunction = functionWrapper;
          } else {
            myData.convertTypesFunction = dataSpec.convertTypes;
          }
        }
      }

    } else {
      console.log("dataspec is not an object!");
    }
    myData.isJSON = typeof (myData.data) === "object";
    if (!myData.isJSON){
      myData.fromFile = (myData.data.endsWith(".json") || myData.data.endsWith(".csv")) ? true : false;
    }

    options.keyField = myData.keyField;
    options.nodeLabelField = myData.flatData ? options.nodeLabelFieldFlatData : myData.keyField;
    return myData;
  }

  // call visualization entry function
  function createChart(selection, data) {
    myChart(selection, data, options);
  }
  
  return chartAPI;
}

exports.indentedTree = d3_template_reusable;

Object.defineProperty(exports, '__esModule', { value: true });

})));
