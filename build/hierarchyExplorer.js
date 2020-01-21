(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3')) :
  typeof define === 'function' && define.amd ? define(['exports', 'd3'], factory) :
  (factory((global.hierarchyExplorer = {}),global.d3));
}(this, (function (exports,d3) { 'use strict';

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };

  var slicedToArray = function () {
    function sliceIterator(arr, i) {
      var _arr = [];
      var _n = true;
      var _d = false;
      var _e = undefined;

      try {
        for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);

          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"]) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    return function (arr, i) {
      if (Array.isArray(arr)) {
        return arr;
      } else if (Symbol.iterator in Object(arr)) {
        return sliceIterator(arr, i);
      } else {
        throw new TypeError("Invalid attempt to destructure non-iterable instance");
      }
    };
  }();

  ////////////////////////////////////////////////////
  // Processing data                                //
  //////////////////////////////////////////////////// 

  // XHR to load data   
  function readData(myData, selection, options, createChart) {
    var debugOn = options.debugOn;
    if (myData.fromFile) {
      // read data from file 
      if (myData.data.endsWith(".json")) {
        // JSON Format
        d3.json(myData.data).then(function (data) {
          if (debugOn) {
            console.log("Initial Data: ");console.log(data);
          }
          var hierarchy = d3.hierarchy(data);
          if (debugOn) {
            console.log("hierarchy: ");console.log(hierarchy);
          }
          createChart(selection, hierarchy);
        });
      } else if (myData.data.endsWith(".csv")) {
        d3.dsv(myData.delimiter, myData.data, myData.autoConvert ? myData.convertTypesFunction : undefined).then(function (data) {
          if (debugOn) {
            console.log(data);
          }
          if (myData.flatData) {
            data = createLinkedData(data, myData.hierarchyLevels, myData.keyField, myData.delimiter, myData.separator, options, myData.autoConvert, myData.convertTypesFunction); // csv Format 1
          }
          var hierarchy = createHierarchy(data, myData.keyField);
          if (debugOn) {
            console.log("hierarchy: ");console.log(hierarchy);
          }
          createChart(selection, hierarchy);
        });
      } else {
        console.log("File must end with .json or .csv");
      }
    } else {
      // read data from DOM or JSON variable
      var hierarchy = void 0;
      if (myData.isJSON) {
        hierarchy = d3.hierarchy(myData.data);
      } else {
        var convert = myData.flatData ? false : myData.autoConvert; // for flat data the autoconvert is applied with createLinkedData()
        var data = readDataFromDOM(myData.delimiter, myData.data, convert, myData.convertTypesFunction);
        if (myData.flatData) {
          data = createLinkedData(data, myData.hierarchyLevels, myData.keyField, myData.delimiter, myData.separator, options, myData.autoConvert, myData.convertTypesFunction); // csv Format 1
        }
        hierarchy = createHierarchy(data, myData.keyField); // csv format 2
        if (debugOn) {
          console.log("embedded data: ");console.log(hierarchy);
        }
      }
      createChart(selection, hierarchy);
    }
  }

  function readDataFromDOM(delimiter) {
    var selector = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "aside#data";
    var autoConvert = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
    var convertTypesFunction = arguments[3];

    var inputData = d3.select(selector).text();
    var inputData_cleaned = inputData.trim();
    var parser = d3.dsvFormat(delimiter);
    var file = parser.parse(inputData_cleaned, autoConvert ? convertTypesFunction : undefined);
    return file;
  }

  function createHierarchy(data, key) {
    var root = d3.stratify().id(function (d) {
      return d[key];
    }).parentId(function (d) {
      return d.parent;
    })(data);
    return root;
  }

  function buildKey(row, keys, keyIndex, delimiter, keySeparator) {
    var parent = getParent(row, keys, keyIndex, keySeparator);
    var child = parent + keySeparator + row[keys[keyIndex]];
    var pcKey = parent + delimiter + child;
    return pcKey;
  }

  function getParent(row, keys, keyIndex, keySeparator) {
    var parent = keyIndex === 1 ? keys[0] : row[keys[keyIndex - 1]];
    for (var i = 0; i < keyIndex; i++) {
      if (i === 0) {
        parent = keys[0];
      } else {
        parent += keySeparator + row[keys[i]];
      }
    }
    return parent;
  }

  function createLinkedData(data, keys, keyField, delimiter, keySeparator, options, autoConvert, convertTypesFunction) {
    var debugOn = options.debugOn;
    var nodeLabel = options.nodeLabelFieldFlatData; //"__he_name";

    var linkedDataString = void 0;
    var linkedDataArray = void 0;
    var parentChild = new Map();
    var pcKey = void 0;
    var pcValue = void 0;
    var setAll = function setAll(obj, val) {
      return Object.keys(obj).forEach(function (k) {
        return obj[k] = val;
      });
    };
    var setNull = function setNull(obj) {
      return setAll(obj, "");
    };
    var newRow = void 0;
    var rowString = void 0;
    var proceed = true;

    data.forEach(function (row) {
      proceed = true;
      keys.forEach(function (key, j) {
        if (j > 0 && proceed) {
          pcValue = {};
          if (debugOn && row[key]) {
            console.log("row[key]: ");
            console.log(row);
            console.log("key: ");
            console.log(key);
          }
          if (j === keys.length - 1) {
            pcKey = buildKey(row, keys, j, delimiter, keySeparator);
            if (!parentChild.get(pcKey)) {
              Object.assign(pcValue, row);
              pcValue[nodeLabel] = row[key];
              parentChild.set(pcKey, pcValue);
            }
          } else {
            pcKey = buildKey(row, keys, j, delimiter, keySeparator);
            if (!row[keys[j + 1]]) {
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
    if (debugOn) {
      console.log(parentChild);
    }

    rowString = "parent" + delimiter + keyField;
    Object.keys(data[0]).forEach(function (key) {
      rowString += delimiter + key;
    });
    rowString += delimiter + nodeLabel;

    linkedDataString = rowString + "\n";

    // add root node to string
    rowString = delimiter + keys[0] + delimiter;
    rowString += delimiter.repeat(Object.keys(data[0]).length);
    if (keys[0] !== keySeparator) {
      rowString += keys[0];
    }
    linkedDataString += rowString + "\n";

    // all other nodes
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = parentChild[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var _ref = _step.value;

        var _ref2 = slicedToArray(_ref, 2);

        var key = _ref2[0];
        var value = _ref2[1];

        rowString = key;
        newRow = Object.values(value);
        newRow.forEach(function (d) {
          rowString += delimiter + d;
        });
        linkedDataString += rowString + "\n";
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    if (debugOn) {
      console.log("converted linked Data:");
      console.log(linkedDataString);
    }

    var parser = d3.dsvFormat(delimiter);
    linkedDataArray = parser.parse(linkedDataString, autoConvert ? convertTypesFunction : undefined);
    // if nodeLabel === " " it was converted to null, so here its changed to " "  
    linkedDataArray.map(function (ele) {
      ele[nodeLabel] = ele[nodeLabel] ? ele[nodeLabel] : " ";
    });

    if (debugOn) {
      console.log("converted linked Data array:");
      console.log(linkedDataArray);
    }

    return linkedDataArray;
  }

  var linksAPI = {};
  var options = void 0;
  var oldLabelField = void 0,
      newLabelField = void 0;
  var labelDimensions = void 0;

  linksAPI.initialize = function (_options) {
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
    var updatePattern = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    var linkStrengthParent = linksAPI.getLinkStrength(d.parent, options);
    var linkStrength = linksAPI.getLinkStrength(d, options);
    var path = void 0;
    if (direction === "vertical") {
      if (updatePattern) {
        // for updated links use .x of last child to support resorted nodes/links
        var xLastChild = d.parent.children[d.parent.children.length - 1].x;
        path = "M 0 " + -1 * Math.floor(linkStrengthParent / 2) + " V" + (xLastChild + linkStrength / 2 - d.parent.x);
      } else {
        path = "M 0 " + -1 * Math.floor(linkStrengthParent / 2) + " V" + (d.x + linkStrength / 2 - d.parent.x);
      }
    } else if (direction === "horizontal") {
      var m = d.y >= d.parent.y ? d.y - (d.parent.y + linkStrengthParent / 2) : d.y - (d.parent.y - linkStrengthParent / 2);
      path = "M 0 0" + "H" + m;
      if (options.debugOn) {
        console.log("Name: " + d.name + " m: " + m);
      }
      // path = "M 0 0" + "H" + (d.y - (d.parent.y + linkStrengthParent / 2));
    }
    return path;
  };

  linksAPI.getDy = function (d) {
    if (options.linkLabelOnTop) {
      return "0.35em";
    } else {
      return Math.ceil(-.5 * linksAPI.getLinkStrength(d) - 3);
    }
  };

  // initialize to support switch from labelonTop to labelabove and vice versa
  // otherwise transition throws error when trying "0.35em" --> 1 or 1 --> "0.35em" 
  linksAPI.getInitialDy = function () {
    if (!d3.select(this).attr("dy")) {
      return null;
    }
    if (options.linkLabelOnTop) {
      return d3.select(this).attr("dy").endsWith("em") ? d3.select(this).attr("dy") : "0.35em";
    } else {
      return d3.select(this).attr("dy").endsWith("em") ? 0 : d3.select(this).attr("dy");
    }
  };

  linksAPI.getLinkStrength = function (d) {
    if (!d.data) return 0;
    var s = options.linkStrengthStatic ? options.linkStrengthValue : options.linkStrengthScale(d.data[options.linkStrengthField]);
    return s;
  };

  linksAPI.getLinkStroke = function (d) {
    return options.linkColorStatic ? options.defaultColor : options.linkColorScale(d.data[options.linkColorField]);
  };

  linksAPI.getLinkStrokeWidth = function (d) {
    return linksAPI.getLinkStrength(d) + "px";
  };

  linksAPI.getLinkLabel = function (d) {
    var labelField = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : options.linkLabelField;

    return !options.linkLabelOn || typeof d.data[labelField] === "undefined" ? "" : d.data[labelField];
  };

  linksAPI.getLinkLabelFormatted = function (d) {
    var labelField = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : options.linkLabelField;

    //  if (!options.linkLabelOn || !d.data[labelField]) {
    // console.log(d.name + " " + d.data[labelField] + " " + isNaN(d.data[labelField]));
    if (!options.linkLabelOn || typeof d.data[labelField] === "undefined") {
      return "";
    } // else if (typeof d.data[labelField] === "string") {
    else if (isNaN(d.data[labelField])) {
        return d.data[labelField];
      } else {
        return options.linkLabelFormat(d.data[labelField]) + options.linkLabelUnit;
      }
  };

  linksAPI.getLinkTextTween = function (d) {
    var selection = d3.select(this);
    /*
    if (!options.linkLabelOn) {
      return function() { selection.text(""); };
    } 
    */
    var numberStart = linksAPI.getLinkLabel(d, oldLabelField);
    var numberEnd = linksAPI.getLinkLabel(d, newLabelField);

    if (!isNumber(numberStart) || !isNumber(numberEnd)) {
      return function () {
        selection.text(numberEnd);
      };
    }
    var i = d3.interpolateNumber(numberStart, numberEnd);
    return function (t) {
      selection.text(options.linkLabelFormat(i(t)) + options.linkLabelUnit);
    };
  };

  function isNumber(num) {
    return typeof num === "number";
  }

  linksAPI.getLinkRTranslate = function (d) {
    return "translate(" + linksAPI.getLinkStrength(d.parent) / 2 + " " + (d.x - d.parent.x) + ")";
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
    var shiftAlign = options.linkLabelAligned ?
    // labelDimensions[d.depth].posXCenter + labelDimensions[d.depth].maxX / 2 
    labelDimensions.get(d.depth).posXCenter + labelDimensions.get(d.depth).maxX / 2 : (d.y - d.parent.y) / 2;
    return shiftAlign;
  };

  linksAPI.computeLabelDimensions = function (sel) {
    // let dims = [];
    var dims = new Map();
    sel.each(function (d) {
      var dimProperties = {};
      var height = d3.select(this).node().getBBox().height;
      var width = d3.select(this).node().getBBox().width;
      var text = d3.select(this).text();
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

  var nodesAPI = {};
  var options$1 = void 0;
  var oldLabelField$1 = void 0,
      newLabelField$1 = void 0;

  nodesAPI.initialize = function (_options) {
    options$1 = _options;
    oldLabelField$1 = newLabelField$1;
    newLabelField$1 = options$1.nodeBarOn ? options$1.nodeBarLabel : undefined;
  };

  nodesAPI.appendNode = function (selection) {
    if (options$1.nodeImageFile) {
      nodesAPI.appendNodeImage(selection);
    } else {
      options$1.nodeImageSelectionAppend && typeof options$1.nodeImageSelectionAppend === "function" ? options$1.nodeImageSelectionAppend(selection) : nodesAPI.appendNodeSVG(selection);
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
      } else {
        nodesAPI.updateNodeSVG(transition);
      }
    }
  };

  nodesAPI.appendNodeSVG = function (selection) {
    selection.append("rect").attr("class", "node-image").attr("x", -5).attr("y", -5).attr("width", 10).attr("height", 10);

    var sel2 = selection;
    sel2.append("line").attr("class", function (d) {
      return d._children ? "cross node-image" : "cross invisible";
    }).attr("x1", 0).attr("y1", -5).attr("x2", 0).attr("y2", 5);

    sel2.append("line").attr("class", function (d) {
      return d._children ? "cross node-image" : "cross invisible";
    }).attr("x1", -5).attr("y1", 0).attr("x2", 5).attr("y2", 0);
  };

  nodesAPI.updateNodeSVG = function (transition) {
    transition.selectAll("line.cross").attr("class", function (d) {
      return d._children ? "cross node-image" : "cross invisible";
    });
  };

  nodesAPI.appendNodeImage = function (selection) {
    if (options$1.nodeImageSetBackground) {
      var col = d3.select("div.chart").style("background-color");
      selection.append("rect").attr("width", options$1.nodeImageWidth).attr("height", options$1.nodeImageHeight).attr("x", options$1.nodeImageX).attr("y", options$1.nodeImageY).style("stroke", col).style("fill", col);
    }
    selection.append("image").attr("class", "node-image").attr("xlink:href", options$1.nodeImageFileAppend).attr("width", options$1.nodeImageWidth).attr("height", options$1.nodeImageHeight).attr("x", options$1.nodeImageX).attr("y", options$1.nodeImageY);
  };

  nodesAPI.updateNodeImage = function (transition) {
    transition.select(".node-image").attr("xlink:href", options$1.nodeImageFileAppend);
  };

  nodesAPI.computeNodeExtend = function (sel) {
    var alignmentAnchorArray = [];
    var anchorXPos = void 0;

    var l = linksAPI;
    l.initialize(options$1);

    var filteredSel = sel.filter(function (d) {
      return typeof d.data[newLabelField$1] !== "undefined";
    });
    filteredSel.each(function (d) {
      var labelBBox = d3.select(this).select(".node-label").node().getBBox();
      var imageBBox = d3.select(this).select(".node-image").node().getBBox();
      var nodeEnd = labelBBox.width !== 0 ? labelBBox.x + labelBBox.width : imageBBox.x + imageBBox.width;
      d.nodeBar = {};
      d.nodeBar.connectorStart = !d.parent || d.y >= d.parent.y ? nodeEnd + 5 : d.parent.y - d.y + l.getLinkStrength(d.parent, options$1) / 2 + 5;
      d.nodeBar.labelWidth = getBarLabelWidth(d.data[newLabelField$1]);
      alignmentAnchorArray.push(getVerticalAlignmentRef(d, d.y + d.nodeBar.connectorStart));

      if (options$1.debugOn) {
        console.log("connctorStart: " + d.nodeBar.connectorStart);
      }
    });
    alignmentAnchorArray.anchor = Math.max.apply(Math, alignmentAnchorArray);
    anchorXPos = alignmentAnchorArray.anchor + options$1.nodeBarTranslateX;

    if (options$1.debugOn) {
      console.log("alignmentAnchorArray: " + alignmentAnchorArray);
      console.log("options.nodeBarRange[1]: " + options$1.nodeBarRange[1]);
      console.log("anchorXPos: " + anchorXPos);
    }

    filteredSel.each(function (d) {
      d.nodeBar.anchor = anchorXPos - d.y;
      d.nodeBar.negStart = d.nodeBar.anchor - options$1.nodeBarRange[1] / 2;

      if (d.data[options$1.nodeBarField] < 0) {
        if (options$1.nodeBarLabelInside) {
          d.nodeBar.textX = d.nodeBar.anchor - 5;
          // comparison if the label is left of bar because bar is too short
          d.nodeBar.connectorLength = labelLargerThanNegBar(d) ? d.nodeBar.textX - d.nodeBar.labelWidth - 5 - d.nodeBar.connectorStart : d.nodeBar.negStart + options$1.nodeBarScale(d.data[options$1.nodeBarField]) - 5 - d.nodeBar.connectorStart;
        } else {
          // labelInside === false
          d.nodeBar.textX = d.nodeBar.negStart + options$1.nodeBarScale(d.data[options$1.nodeBarField]) - 5;
          d.nodeBar.connectorLength = d.nodeBar.textX - d.nodeBar.labelWidth - 5 - d.nodeBar.connectorStart;
        }
      } else {
        // d.data[options.nodeBarField] >= 0
        if (options$1.nodeBarLabelInside) {
          d.nodeBar.textX = d.nodeBar.anchor + 5;
          d.nodeBar.connectorLength = d.nodeBar.anchor - 5 - d.nodeBar.connectorStart;
        } else {
          // labelInside === false
          d.nodeBar.textX = options$1.nodeBarNeg ? d.nodeBar.negStart + options$1.nodeBarScale(d.data[options$1.nodeBarField]) + 5 : d.nodeBar.anchor + options$1.nodeBarScale(d.data[options$1.nodeBarField]) + 5;
          d.nodeBar.connectorLength = d.nodeBar.anchor - 5 - d.nodeBar.connectorStart;
        }
      }
      if (options$1.debugOn) {
        console.log("connector: " + d.nodeBar.connectorLength);
        console.log("nodesAPI.getWidthNodeBarRect(d): " + nodesAPI.getWidthNodeBarRect(d));
      }
    });
  };

  var labelLargerThanNegBar = function labelLargerThanNegBar(d) {
    return d.nodeBar.labelWidth + 5 > nodesAPI.getWidthNodeBarRect(d);
  };

  // get the anchor (0) point of all node bars for alignment 
  var getVerticalAlignmentRef = function getVerticalAlignmentRef(d, pos) {
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

  var getBarLabelWidth = function getBarLabelWidth(text) {
    var sel = d3.select("g.node").append("text").style("visibility", "hidden").attr("class", "bar-label temp").text(isNaN(text) ? text : options$1.nodeBarFormat(text) + options$1.nodeBarUnit);

    var w = sel.node().getBBox().width;
    sel.remove();
    return w;
  };

  // transitions the node bar label through interpolation and adjust the class of the node bar
  // when the sign of the node bar label changes
  nodesAPI.getNodeBarLabelTween = function (d) {
    var selection = d3.select(this);
    if (!options$1.nodeBarOn) {
      return function () {
        selection.text("");
      };
    }
    var numberStart = oldLabelField$1 ? d.data[oldLabelField$1] : d.data[newLabelField$1];
    var numberEnd = d.data[newLabelField$1];
    if (isNaN(numberStart) || isNaN(numberEnd)) {
      // typeof NumberStart or numberEnd == "string"
      return function () {
        selection.text(numberEnd);
      };
    }
    if (nodesAPI.sameBarLabel()) {
      return function () {
        selection.text(options$1.nodeBarFormat(numberEnd) + options$1.nodeBarUnit);
      };
    }

    var i = d3.interpolateNumber(numberStart, numberEnd);
    var correspondingBar = d3.selectAll(".node-bar.box").filter(function (d2) {
      return d2.id === d.id;
    });
    if (!numberStart) {
      // if numberStart === null or 0
      correspondingBar.attr("class", function () {
        return numberEnd >= 0 ? "node-bar box node-bar-positive" : "node-bar box node-bar-negative";
      });
    }
    return function (t) {
      var num = i(t);
      if (numberStart * num < 0) {
        correspondingBar.attr("class", function () {
          return num >= 0 ? "node-bar box node-bar-positive" : "node-bar box node-bar-negative";
        });
      }
      selection.text(options$1.nodeBarFormat(num) + options$1.nodeBarUnit);
    };
  };

  nodesAPI.sameBarLabel = function () {
    console.log("sameBarlabel: " + (oldLabelField$1 === newLabelField$1));
    return oldLabelField$1 === newLabelField$1;
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

  nodesAPI.getNodeBarD = function (d) {
    return "M " + (d.nodeBar.connectorLength + d.nodeBar.connectorStart) + " 0 h " + -d.nodeBar.connectorLength;
  };
  nodesAPI.getXNodeBarRect = function (d) {
    return options$1.nodeBarNeg ? d.nodeBar.negStart + options$1.nodeBarScale(Math.min(0, d.data[options$1.nodeBarField])) : d.nodeBar.anchor;
  };
  nodesAPI.getWidthNodeBarRect = function (d) {
    return Math.abs(options$1.nodeBarScale(d.data[options$1.nodeBarField]) - options$1.nodeBarScale(0));
  };
  nodesAPI.getXNodeBarText = function (d) {
    return d.nodeBar.textX;
  };

  nodesAPI.getNodeBarTextFill = function (d) {
    return options$1.nodeBarTextFill ? options$1.nodeBarTextFill(d) : d3.select(this).style("fill");
  };

  nodesAPI.getNodeBarRectFill = function (d) {
    return options$1.nodeBarRectFill ? options$1.nodeBarRectFill(d) : null;
    // return options.nodeBarRectFill ? options.nodeBarRectFill(d) : d3.select(this).style("fill");
  };

  nodesAPI.getNodeBarRectStroke = function (d) {
    return options$1.nodeBarRectStroke ? options$1.nodeBarRectStroke(d) : d3.select(this).style("stroke");
  };

  nodesAPI.getNodeBarTextAnchor = function (d) {
    return d.data[options$1.nodeBarField] < 0 ? "end" : "start";
  };

  nodesAPI.setNodeBarDefaultClass = function (d) {
    if (!oldLabelField$1 || oldLabelField$1 === newLabelField$1) {
      return d.data[options$1.nodeBarField] >= 0 ? "node-bar box node-bar-positive" : "node-bar box node-bar-negative";
    } else {
      return d3.select(this).attr("class");
    }
  };

  ////////////////////////////////////////////////////
  // add visualization specific processing here     //
  //////////////////////////////////////////////////// 

  var transCounter = 0;

  function myChart(selection, data, options) {
    var config = {};
    config.width = options.svgDimensions.width - options.margin.right - options.margin.left;
    config.height = options.svgDimensions.height - options.margin.top - options.margin.bottom;
    config.i = 0; // counter for numerical IDs
    config.tree = undefined;
    config.root = undefined;
    config.svg = undefined;
    config.counter = 0;
    config.labelDimensions = [];

    config.svg = selection.append("svg").attr("width", config.width + options.margin.right + options.margin.left).attr("height", config.height + options.margin.top + options.margin.bottom).append("g").attr("transform", "translate(" + options.margin.left + "," + options.margin.top + ")");

    createTree(options, config, data);
    createScales(options, config);
    createUpdateFunctions(options, config, data);
    // root.children.forEach(collapse);
    update(config.root, options, config);
  }

  function createTree(options, config, data) {
    config.tree = options.alignLeaves ? d3.cluster() : d3.tree();
    config.tree.size([config.width, config.height]).nodeSize([0, options.linkWidthValue]);
    config.root = config.tree(data);
    if (options.propagate) {
      config.root.sum(function (d) {
        return d[options.propagateField];
      });
    }

    config.root.each(function (d) {
      d.name = d.id; //transferring name to a name variable
      d.id = config.i; //Assigning numerical Ids
      config.i++;
      if (options.propagate) {
        d.data[options.propagateField] = d.value;
      }
    });
    config.root.x0 = config.root.x;
    config.root.y0 = config.root.y;
    if (options.propagate) {
      options.propagate = false;
    }

    if (options.debugOn) {
      console.log("Data:");console.log(data);
      console.log("Tree:");console.log(config.root);
    }
  }

  function createScales(options, config) {
    var nodes = config.root.descendants();
    if (!options.linkStrengthStatic) {
      options.linkStrengthScale.domain(d3.extent(nodes, function (d) {
        return +d.data[options.linkStrengthField];
      })).range(options.linkStrengthRange);
    }
    if (!options.linkWidthStatic) {
      options.linkWidthScale.domain(d3.extent(nodes.slice(1), function (d) {
        return +d.data[options.linkWidthField];
      })).range(options.linkWidthRange);
    }
    if (options.nodeBarOn && options.nodeBarUpdateScale) {
      var dom = void 0;
      if (!options.nodeBarDomain) {
        var extent = d3.extent(nodes, function (d) {
          return +d.data[options.nodeBarField];
        });
        var maxExtent = Math.max(Math.abs(extent[0]), Math.abs(extent[1]));
        // options.nodeBarNeg = (extent[0] * extent[1] < 0); 
        options.nodeBarNeg = extent[0] < 0;
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
      } else {
        dom = options.nodeBarDomain;
      }
      options.nodeBarScale.domain(dom).range(options.nodeBarRange).clamp(true);
    }
  }

  function createUpdateFunctions(options, config, data) {
    options.updateLinkWidth = function () {
      if (options.linkWidthStatic) {
        config.tree.nodeSize([0, options.linkWidthValue]);
      } else {
        createScales(options, config);
      }
      update(config.root, options, config);
    };

    options.updateScales = function () {
      createScales(options, config);
      update(config.root, options, config);
    };

    options.updateAlignLeaves = function () {
      createTree(options, config, data);
      update(config.root, options, config);
    };

    options.updateDefault = function () {
      update(config.root, options, config);
    };
  }

  function click(d, options, config) {
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

  function update(source, options, config) {
    if (options.nodeResort) {
      config.root.sort(options.nodeResortFunction);
    }
    // Compute the new tree layout.
    var nodes = config.tree(config.root);
    var nodesSort = [];
    nodes.eachBefore(function (n) {
      nodesSort.push(n);
    });
    config.height = Math.max(500, nodesSort.length * options.linkHeight + options.margin.top + options.margin.bottom);
    var links = nodesSort.slice(1);
    // Compute the "layout".
    nodesSort.forEach(function (n, i) {
      n.x = i * options.linkHeight;
      if (!options.linkWidthStatic) {
        if (i !== 0) {
          n.y = n.parent.y + options.linkWidthScale(+n.data[options.linkWidthField]);
        }
      }
    });

    d3.select("svg").transition().duration(options.transitionDuration).attr("height", config.height);

    // 1. Update the nodes…
    var n = nodesAPI;
    n.initialize(options);

    var node = config.svg.selectAll("g.node").data(nodesSort, function (d) {
      return d.id || (d.id = ++config.i);
    });

    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node.enter().append("g").attr("class", "node").style("visibility", "hidden").on("click", function (d) {
      return click(d, options, config);
    });

    nodeEnter.call(n.appendNode);

    nodeEnter.append("text").attr("class", "node-label").attr("x", function (d) {
      return !d.parent || d.y >= d.parent.y ? options.nodeLabelPadding : -options.nodeLabelPadding;
    }).attr("dy", ".35em").attr("text-anchor", function (d) {
      return !d.parent || d.y >= d.parent.y ? "start" : "end";
    }).text(function (d) {
      if (d.data[options.nodeLabelField].length > options.nodeLabelLength) {
        return d.data[options.nodeLabelField].substring(0, options.nodeLabelLength) + "...";
      } else {
        return d.data[options.nodeLabelField];
      }
    });

    nodeEnter.append("svg:title").text(function (d) {
      return d.data[options.nodeLabelField];
    });

    nodeEnter.style("visibility", "hidden");

    // add nodeBar
    var nodeBarEnter = nodeEnter.append("g").attr("class", "node-bar").style("display", function (d) {
      return options.nodeBarOn && d.data[options.nodeBarField] !== null ? "inline" : "none";
    });

    nodeBarEnter.append("path").attr("class", "node-bar connector").attr("d", "M 0 0 h 0");

    nodeBarEnter.append("rect").attr("class", n.setNodeBarDefaultClass).attr("y", -8).attr("height", 16);

    nodeBarEnter.append("text").attr("class", "node-bar bar-label").attr("dy", ".35em");
    // end nodeBar

    var nodeMerge = node.merge(nodeEnter);

    nodeMerge.selectAll("g.node-bar").style("display", function (d) {
      return options.nodeBarOn && d.data[options.nodeBarField] !== null ? "inline" : "none";
    });
    if (options.nodeBarOn) {
      n.computeNodeExtend(nodeMerge);
    }

    nodeEnter.attr("transform", "translate(" + source.y0 + "," + source.x0 + ") scale(0.001, 0.001)").style("visibility", "visible");

    // Transition nodes to their new position.
    var trans = "trans" + transCounter++;
    var nodeUpdate = nodeMerge.transition(trans).duration(options.transitionDuration);

    console.log("transition: " + trans);
    console.log("nodeUpdate.size: " + nodeUpdate.size());

    nodeUpdate.attr("transform", function (d) {
      return "translate(" + d.y + "," + d.x + ") scale(1,1)";
    });

    nodeUpdate.call(n.updateNode);

    /*
    nodeUpdate.selectAll(".node-label")
      .call(sel => sel.tween("nodeLabel", n.getNodeLabelTween));
      .attr("x", d => (!d.parent || d.y >= d.parent.y) ? options.nodeLabelPadding : -options.nodeLabelPadding)
      .attr("text-anchor", d => (!d.parent || d.y >= d.parent.y) ? "start" : "end");
      */

    nodeUpdate.selectAll("g.node-bar").attr("display", options.nodeBarOn ? "inline" : "none");

    if (options.nodeBarOn) {
      nodeUpdate.selectAll(".node-bar.box").attr("class", n.setNodeBarDefaultClass).style("fill", n.getNodeBarRectFill).style("stroke", n.getNodeBarRectStroke).attr("x", n.getXNodeBarRect).attr("width", n.getWidthNodeBarRect);
      nodeUpdate.selectAll(".node-bar.bar-label").style("text-anchor", n.getNodeBarTextAnchor).style("fill", n.getNodeBarTextFill).call(function (sel) {
        return sel.tween("nodeBarLabel" + transCounter, n.getNodeBarLabelTween);
      })
      //.call(sel => n.sameBarLabel() ? null : sel.tween("nodeBarLabel" + transCounter, n.getNodeBarLabelTween))
      .attr("x", n.getXNodeBarText);
      nodeUpdate.selectAll(".node-bar.connector").attr("d", n.getNodeBarD);
    }

    // Transition exiting nodes to the parent's new position (and remove the nodes)
    var nodeExit = node.exit().transition().duration(options.transitionDuration);

    nodeExit.attr("transform", function () {
      return "translate(" + source.y + "," + source.x + ") scale(0.001, 0.001)";
    }).remove();

    nodeExit.select(".node-label").style("fill-opacity", 1e-6);

    // 2. Update the links…
    var l = linksAPI;
    l.initialize(options);

    var link = config.svg.selectAll("g.link").data(links, function (d) {
      var id = d.id + "->" + d.parent.id;
      return id;
    });

    // Enter any new links at the parent's previous position.
    var linkEnter = link.enter().insert("g", "g.node").attr("class", "link").attr("transform", "translate(" + source.y0 + " " + source.x0 + ") scale(0.001, 0.001)");

    var origin = { x: source.x0, y: source.y0, parent: { x: source.x0, y: source.y0 } };
    linkEnter // filter to just draw this connector link for last child of parent
    .filter(function (d) {
      return d.id === d.parent.children[d.parent.children.length - 1].id;
    }).append("path").attr("class", "link vertical").attr("d", function () {
      return l.getLinkD(origin, "vertical");
    });

    linkEnter.append("path").attr("class", "link horizontal").attr("d", function () {
      return l.getLinkD(origin, "horizontal");
    });

    linkEnter.append("text").style("opacity", 1e-6);

    // update merged selection before transition
    var linkMerge = link.merge(linkEnter);
    linkMerge.select("text").attr("class", options.linkLabelOnTop ? "label ontop" : "label above").attr("text-anchor", options.linkLabelAligned ? "end" : "middle").attr("dy", l.getInitialDy).text(function (d) {
      return l.getLinkLabelFormatted(d);
    }).style("fill", l.getLinkLabelColor);

    // Transition links to their new position.
    var linkUpdate = linkMerge.transition().duration(options.transitionDuration);

    l.computeLabelDimensions(d3.selectAll(".link text.label"));

    linkUpdate.attr("transform", function (d) {
      return "translate(" + d.parent.y + " " + d.parent.x + ") scale(1,1)";
    });

    linkUpdate.select("path.link.vertical").attr("d", function (d) {
      return l.getLinkD(d, "vertical", true);
    }).style("stroke", function (d) {
      return options.linkColorInherit ? l.getLinkStroke(d.parent) : "";
    }).style("stroke-width", function (d) {
      return l.getLinkStrokeWidth(d.parent);
    });

    linkUpdate.select("path.link.horizontal").attr("d", function (d) {
      return l.getLinkD(d, "horizontal");
    }).attr("transform", l.getLinkRTranslate).style("stroke", l.getLinkStroke).style("stroke-width", l.getLinkStrokeWidth);

    linkUpdate.select("text").attr("dy", l.getDy).attr("x", l.getLinkTextPositionX).attr("y", function (d) {
      return d.x - d.parent.x;
    }).call(function (sel) {
      return sel.tween("text", l.getLinkTextTween);
    }).style("opacity", 1);

    // Transition exiting nodes to the parent's new position.
    var linkExit = link.exit().transition().duration(options.transitionDuration).remove();

    linkExit.attr("transform", "translate(" + source.y + " " + source.x + ")");

    var destination = { x: source.x, y: source.y, parent: { x: source.x, y: source.y } };
    linkExit.selectAll("path.link.vertical").attr("d", function () {
      return l.getLinkD(destination, "vertical");
    });

    linkExit.selectAll("path.link.horizontal").attr("d", function () {
      return l.getLinkD(destination, "horizontal");
    }).attr("transform", "translate(0 0)");

    linkExit.select("text").attr("x", 0).attr("y", 0).style("opacity", 1e-6);

    // Stash the old positions for transition.
    nodesSort.forEach(function (d) {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  function d3_template_reusable (_dataSpec) {

    ///////////////////////////////////////////////////
    // 1.0 ADD visualization specific variables here //
    ///////////////////////////////////////////////////
    var options = {};
    // 1. ADD all options that should be accessible to caller
    options.debugOn = false;
    options.margin = { top: 20, right: 10, bottom: 20, left: 10 };
    options.svgDimensions = { height: 800, width: 1400 };
    options.transitionDuration = 750;
    options.transitionDurationDefault = 750; // for all transitions except expand/collapse
    options.transitionDurationClick = 750; // for expand/collapse transitions
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
    options.nodeResortFunction = function (a, b) {
      var ret = options.nodeResortByHeight ? b.height - a.height : 0;
      if (ret === 0) {
        if (typeof a.data[options.nodeResortField] === "string") {
          ret = b.data[options.nodeResortField].localeCompare(a.data[options.nodeResortField]);
        } else {
          ret = b.data[options.nodeResortField] - a.data[options.nodeResortField];
        }
      }
      if (options.nodeResortAscending) {
        ret *= -1;
      }
      return ret;
    };

    options.linkHeight = 20;

    options.linkLabelField = "value";
    options.linkLabelOn = false;
    options.linkLabelUnit = "";
    options.linkLabelOnTop = true;
    options.linkLabelAligned = true; // otherwise centered
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
    options.linkColorScale = function (value) {
      return value;
    }; // id function as default - assuming linkColorField contains colors
    options.linkColorField = "color";
    options.linkColorInherit = true; // vertical link inherits color from parent

    options.propagate = false; // default: no propagation
    options.propagateField = "value"; // default field for propagation

    options.alignLeaves = false; // use tree layout as default, otherwise cluster layout
    options.keyField = "key";

    // 2. ADD getter-setter methods here
    chartAPI.debugOn = function (_) {
      if (!arguments.length) return options.debugOn;
      options.debugOn = _;
      return chartAPI;
    };

    chartAPI.defaultColor = function (_) {
      if (!arguments.length) return options.defaultColor;
      options.defaultColor = _;
      if (typeof options.updateLinkColor === "function") options.updateLinkColor();
      return chartAPI;
    };

    chartAPI.margin = function (_) {
      if (!arguments.length) return options.margin;
      options.margin = _;
      return chartAPI;
    };

    chartAPI.svgDimensions = function (_) {
      if (!arguments.length) return options.svgDimensions;
      options.svgDimensions = _;
      return chartAPI;
    };

    chartAPI.nodeLabelLength = function (_) {
      if (!arguments.length) return options.nodeLabelLength;
      options.nodeLabelLength = _;
      return chartAPI;
    };

    chartAPI.nodeLabelPadding = function (_) {
      if (!arguments.length) return options.nodeLabelPadding;
      options.nodeLabelPadding = _;
      return chartAPI;
    };

    chartAPI.transitionDuration = function (_) {
      if (!arguments.length) return options.transitionDuration;
      options.transitionDuration = _;
      options.transitionDurationDefault = _;
      return chartAPI;
    };

    chartAPI.propagateValue = function (_) {
      if (!arguments.length) return options.propagate + ": " + options.propagateField;
      options.propagate = true;
      options.propagateField = _;
      return chartAPI;
    };

    chartAPI.formatDefaultLocale = function (_) {
      if (!arguments.length) return options.locale;
      if (_ === "DE") {
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
    chartAPI.nodeBar = function () {
      var _ = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : options.nodeBarField;

      var _options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      if (!arguments.length) return options.nodeBarField;

      if (typeof _ === "string") {
        options.nodeBarField = _;
        options.nodeBarOn = true;
      } else if (typeof _ === "boolean") {
        options.nodeBarOn = _;
      }
      if (options.nodeBarOn) {
        if (_options.locale) {
          chartAPI.formatDefaultLocale(_options.locale);
        }
        options.nodeBarLabel = _options.label || options.nodeBarField;
        options.nodeBarState.oldField = options.nodeBarState.newField;
        options.nodeBarState.newField = options.nodeBarLabel;
        options.nodeBarLabelInside = typeof _options.labelInside !== "undefined" ? _options.labelInside : options.nodeBarLabelInside;
        options.nodeBarTextFill = _options.textFill || options.nodeBarTextFill;
        options.nodeBarRectFill = _options.rectFill || options.nodeBarRectFill;
        options.nodeBarRectStroke = _options.rectStroke || options.nodeBarRectStroke;
        options.nodeBarUnit = _options.unit || options.nodeBarUnit;
        options.nodeBarFormat = _options.format ? d3.format(_options.format) : options.nodeBarFormat;
        options.nodeBarTranslateX = _options.translateX || options.nodeBarTranslateX;
        options.nodeBarScale = _options.scale || options.nodeBarScale;
        //options.nodeBarRange = _options.range || options.nodeBarRange;
        if (_options.range) {
          options.nodeBarRange = _options.range;options.nodeBarRangeAdjusted = false;
        }
        if (_options.range) {
          options.nodeBarRangeUpperBound = options.nodeBarRange[1];
        }
        options.nodeBarDomain = _options.domain || options.nodeBarDomain;
        if (typeof _options.updateScale !== "undefined") {
          options.nodeBarUpdateScale = _options.updateScale;
        }
        // options.nodeBarUpdateScale = (typeof (_options.updateScale) !== "undefined") ? _options.updateScale : options.nodeBarUpdateScale;
      }
      if (typeof options.updateScales === "function") options.updateScales();
      return chartAPI;
    };

    chartAPI.nodeImageFile = function (_callback) {
      var _options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      if (!arguments.length) return options.nodeImageFileAppend;
      options.nodeImageFile = true;
      options.nodeImageFileAppend = _callback;
      options.nodeImageWidth = _options.width || options.nodeImageWidth;
      options.nodeImageHeight = _options.height || options.nodeImageHeight;
      options.nodeImageX = _options.x || -1 * options.nodeImageWidth / 2;
      options.nodeImageY = _options.y || -1 * options.nodeImageHeight / 2;
      options.nodeImageSetBackground = _options.setBackground || options.nodeImageSetBackground;
      if (typeof options.updateDefault === "function") options.updateDefault();
      return chartAPI;
    };

    chartAPI.nodeImageSelection = function (_append, _update) {
      if (!arguments.length) return options.nodeImageSelectionAppend;
      options.nodeImageSelectionAppend = _append === false ? function () {} : _append;
      options.nodeImageSelectionUpdate = _update;
      options.nodeImageFile = false;
      if (typeof options.updateDefault === "function") options.updateDefault();
      return chartAPI;
    };

    chartAPI.nodeSort = function () {
      var _ = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : options.nodeSortField;

      var _options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      if (!arguments.length) return options.nodeSortField;
      if (typeof _ === "string") {
        options.nodeResort = true;
        options.nodeResortAscending = typeof _options.ascending !== "undefined" ? _options.ascending : options.nodeResortAscending;
        options.nodeResortByHeight = typeof _options.sortByHeight !== "undefined" ? _options.sortByHeight : options.nodeResortByHeight;
        options.nodeResortField = _;
      }
      if (typeof options.updateDefault === "function") options.updateDefault();
      return chartAPI;
    };

    chartAPI.linkHeight = function (_) {
      if (!arguments.length) return options.linkHeight;
      options.linkHeight = _;
      if (typeof options.updateDefault === "function") options.updateDefault();
      return chartAPI;
    };

    chartAPI.linkLabel = function () {
      var _ = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : options.linkLabelField;

      var _options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      if (!arguments.length) return options.linkLabelField;

      if (typeof _ === "string") {
        options.linkLabelField = _;
        options.linkLabelOn = true;
      } else if (typeof _ === "boolean") {
        options.linkLabelOn = _;
      }
      if (options.linkLabelOn) {
        if (_options.locale) {
          chartAPI.formatDefaultLocale(_options.locale);
        }
        options.linkLabelColor = _options.color || options.linkLabelColor;
        options.linkLabelUnit = _options.unit || options.linkLabelUnit;
        options.linkLabelFormat = _options.format ? d3.format(_options.format) : options.linkLabelFormat;
        options.linkLabelOnTop = typeof _options.onTop !== "undefined" ? _options.onTop : options.linkLabelOnTop;
        options.linkLabelAligned = typeof _options.align !== "undefined" ? _options.align : options.linkLabelAligned;
      }
      if (typeof options.updateDefault === "function") options.updateDefault();
      return chartAPI;
    };

    chartAPI.linkWidth = function () {
      var _ = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : options.linkWidthField;

      var _options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      if (!arguments.length) return options.linkWidthValue;
      if (typeof _ === "number") {
        options.linkWidthStatic = true;
        options.linkWidthValue = _;
      } else if (typeof _ === "string") {
        options.linkWidthStatic = false;
        options.linkWidthField = _;
        options.linkWidthScale = _options.scale || options.linkWidthScale;
        options.linkWidthRange = _options.range || options.linkWidthRange;
      }

      if (typeof options.updateLinkWidth === "function") options.updateLinkWidth();
      return chartAPI;
    };

    chartAPI.linkStrength = function () {
      var _ = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : options.linkStrengthField;

      var _options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      if (!arguments.length) return options.linkStrengthValue;
      if (typeof _ === "number") {
        options.linkStrengthStatic = true;
        options.linkStrengthValue = _;
      } else if (typeof _ === "string") {
        options.linkStrengthStatic = false;
        options.linkStrengthField = _;
        options.linkStrengthScale = _options.scale || options.linkStrengthScale;
        options.linkStrengthRange = _options.range || options.linkStrengthRange;
      }

      if (typeof options.updateScales === "function") options.updateScales();
      return chartAPI;
    };

    chartAPI.linkColor = function () {
      var _ = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : options.linkColorField;

      var _options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      if (!arguments.length) return options.linkColorField;
      options.linkColorStatic = false;
      options.linkColorField = _;
      options.linkColorScale = _options.scale || options.linkColorScale;
      options.linkColorInherit = typeof _options.inherit !== "undefined" ? _options.inherit : options.linkColorInherit;
      if (typeof options.updateDefault === "function") options.updateDefault();
      return chartAPI;
    };

    chartAPI.alignLeaves = function (_) {
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
      selection.each(function (d) {
        console.log(d);
        console.log("dataSpec: ");console.log(_dataSpec);
        if (typeof d !== "undefined") {
          // data processing from outside
          createChart(selection, d);
        } else {
          // data processing here
          var myData = createDataInfo(_dataSpec);
          readData(myData, selection, options, createChart);
        }
      });
    }

    function createDataInfo(dataSpec) {
      var myData = {};

      if ((typeof dataSpec === "undefined" ? "undefined" : _typeof(dataSpec)) === "object") {
        myData.data = dataSpec.source;
        myData.hierarchyLevels = dataSpec.hierarchyLevels;
        myData.flatData = Array.isArray(myData.hierarchyLevels) ? true : false;
        myData.keyField = dataSpec.key ? dataSpec.key : "key";
        myData.delimiter = dataSpec.delimiter ? dataSpec.delimiter : ",";
        myData.separator = dataSpec.separator ? dataSpec.separator : "$";

        myData.autoConvert = true;
        myData.convertTypesFunction = d3.autoType;
        if (dataSpec.convertTypes === "none") {
          myData.autoConvert = false;
        } else {
          if (typeof dataSpec.convertTypes === "function") {
            if (myData.flatData) {
              // add key, parent and __he_name as columns, since the conversion is applied
              // after the flat data is transformed to hierarchical data
              var functionWrapper = function functionWrapper(d) {
                var row = dataSpec.convertTypes(d);
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
      myData.isJSON = _typeof(myData.data) === "object";
      if (!myData.isJSON) {
        myData.fromFile = myData.data.endsWith(".json") || myData.data.endsWith(".csv") ? true : false;
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

  exports.chart = d3_template_reusable;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
