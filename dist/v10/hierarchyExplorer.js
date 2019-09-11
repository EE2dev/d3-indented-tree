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
        d3.dsv(myData.delimiter, myData.data).then(function (data) {
          if (debugOn) {
            console.log(data);
          }
          if (myData.flatData) {
            data = createLinkedData(data, myData.hierarchyLevels, myData.keyField, myData.delimiter, myData.separator, options); // csv Format 1
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
        var data = readDataFromDOM(myData.delimiter, myData.data);
        if (myData.flatData) {
          data = createLinkedData(data, myData.hierarchyLevels, myData.keyField, myData.delimiter, myData.separator, options); // csv Format 1
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

    var inputData = d3.select(selector).text();
    var inputData_cleaned = inputData.trim();
    var parser = d3.dsvFormat(delimiter);
    var file = parser.parse(inputData_cleaned);
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

  function createLinkedData(data, keys, keyField, delimiter, keySeparator, options) {
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

    data.forEach(function (row) {
      keys.forEach(function (key, j) {
        if (j > 0) {
          pcValue = {};
          if (!row[key] || j === keys.length - 1) {
            pcKey = buildKey(row, keys, j, delimiter, keySeparator);
            if (!parentChild.get(pcKey)) {
              Object.assign(pcValue, row);
              pcValue[nodeLabel] = row[key];
              parentChild.set(pcKey, pcValue);
            }
          } else {
            pcKey = buildKey(row, keys, j, delimiter, keySeparator);
            if (!parentChild.get(pcKey)) {
              Object.assign(pcValue, row);
              setNull(pcValue);
              pcValue[nodeLabel] = row[key];
              parentChild.set(pcKey, pcValue);
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

    linkedDataArray = d3.dsvFormat(delimiter).parse(linkedDataString);

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
    var linkStrengthParent = linksAPI.getLinkStrength(d.parent, options);
    var linkStrength = linksAPI.getLinkStrength(d, options);
    var path = void 0;
    if (direction === "down") {
      path = "M 0 " + -1 * Math.floor(linkStrengthParent / 2) + " V" + (d.x + linkStrength / 2 - d.parent.x);
    } else if (direction === "right") {
      path = "M 0 0" + "H" + (d.y - (d.parent.y + linkStrengthParent / 2));
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

    return !options.linkLabelOn ? "" : d.data[labelField];
  };

  linksAPI.getLinkLabelFormatted = function (d) {
    var labelField = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : options.linkLabelField;

    if (!options.linkLabelOn) {
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
    if (!options.linkLabelOn) {
      return function () {
        selection.text("");
      };
    }
    var numberStart = linksAPI.getLinkLabel(d, oldLabelField);
    var numberEnd = linksAPI.getLinkLabel(d, newLabelField);
    if (isNaN(numberStart) || isNaN(numberEnd)) {
      return function () {
        selection.text(numberEnd);
      };
    }
    var i = d3.interpolateNumber(numberStart, numberEnd);
    return function (t) {
      selection.text(options.linkLabelFormat(i(t)) + options.linkLabelUnit);
    };
  };

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

  nodesAPI.initialize = function (_options) {
    options$1 = _options;
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
    selection.append("rect").attr("class", "nodeImage").attr("x", -5).attr("y", -5).attr("width", 10).attr("height", 10);

    var sel2 = selection;
    sel2.append("line").attr("class", function (d) {
      return d._children ? "cross nodeImage" : "cross invisible";
    }).attr("x1", 0).attr("y1", -5).attr("x2", 0).attr("y2", 5);

    sel2.append("line").attr("class", function (d) {
      return d._children ? "cross nodeImage" : "cross invisible";
    }).attr("x1", -5).attr("y1", 0).attr("x2", 5).attr("y2", 0);
  };

  nodesAPI.updateNodeSVG = function (transition) {
    transition.selectAll("line.cross").attr("class", function (d) {
      return d._children ? "cross nodeImage" : "cross invisible";
    });
  };

  nodesAPI.appendNodeImage = function (selection) {
    if (options$1.nodeImageSetBackground) {
      var col = d3.select("div.chart").style("background-color");
      selection.append("rect").attr("width", options$1.nodeImageWidth).attr("height", options$1.nodeImageHeight).attr("x", options$1.nodeImageX).attr("y", options$1.nodeImageY).style("stroke", col).style("fill", col);
    }
    selection.append("image").attr("class", "nodeImage").attr("xlink:href", options$1.nodeImageFileAppend).attr("width", options$1.nodeImageWidth).attr("height", options$1.nodeImageHeight).attr("x", options$1.nodeImageX).attr("y", options$1.nodeImageY);
  };

  nodesAPI.updateNodeImage = function (transition) {
    transition.select(".nodeImage").attr("xlink:href", options$1.nodeImageFileAppend);
  };

  ////////////////////////////////////////////////////
  // add visualization specific processing here     //
  //////////////////////////////////////////////////// 

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
    createScale(options, config);
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

  function createScale(options, config) {
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
  }

  function createUpdateFunctions(options, config, data) {
    options.updateLinkWidth = function () {
      if (options.linkWidthStatic) {
        config.tree.nodeSize([0, options.linkWidthValue]);
      } else {
        createScale(options, config);
      }
      update(config.root, options, config);
    };

    options.updateLinkStrength = function () {
      createScale(options, config);
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
    update(d, options, config);
  }

  function update(source, options, config) {
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
    var nodeEnter = node.enter().append("g").attr("class", "node").attr("transform", function () {
      return "translate(" + source.y0 + "," + source.x0 + ") scale(0.001, 0.001)";
    }).on("click", function (d) {
      return click(d, options, config);
    });

    nodeEnter.call(n.appendNode);

    nodeEnter.append("text").attr("class", "nodeLabel").attr("x", options.nodeLabelPadding).attr("dy", ".35em").attr("text-anchor", "start").text(function (d) {
      if (d.data[options.nodeLabelField].length > options.nodeLabelLength) {
        return d.data[options.nodeLabelField].substring(0, options.nodeLabelLength) + "...";
      } else {
        return d.data[options.nodeLabelField];
      }
    }).style("fill-opacity", 1e-6);

    nodeEnter.append("svg:title").text(function (d) {
      return d.data[options.nodeLabelField];
    });

    // Transition nodes to their new position.
    var nodeUpdate = node.merge(nodeEnter).transition().duration(options.transitionDuration);

    nodeUpdate.attr("transform", function (d) {
      return "translate(" + d.y + "," + d.x + ") scale(1,1)";
    });

    nodeUpdate.call(n.updateNode);

    nodeUpdate.select(".nodeLabel").style("fill-opacity", 1);

    // Transition exiting nodes to the parent's new position (and remove the nodes)
    var nodeExit = node.exit().transition().duration(options.transitionDuration);

    nodeExit.attr("transform", function () {
      return "translate(" + source.y + "," + source.x + ") scale(0.001, 0.001)";
    }).remove();

    nodeExit.select(".nodeLabel").style("fill-opacity", 1e-6);

    // 2. Update the links…
    var l = linksAPI;
    l.initialize(options);

    var link = config.svg.selectAll("g.link").data(links, function (d) {
      var id = d.id + "->" + d.parent.id;
      return id;
    });

    // Enter any new links at the parent's previous position.
    var linkEnter = link.enter().insert("g", "g.node").attr("class", "link").attr("transform", "translate(" + source.y0 + " " + source.x0 + ")");

    var origin = { x: source.x0, y: source.y0, parent: { x: source.x0, y: source.y0 } };
    linkEnter // filter to just draw this connector link for last child of parent
    .filter(function (d) {
      return d.id === d.parent.children[d.parent.children.length - 1].id;
    }).append("path").attr("class", "link down").attr("d", function () {
      return l.getLinkD(origin, "down");
    });

    linkEnter.append("path").attr("class", "link right").attr("d", function () {
      return l.getLinkD(origin, "right");
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
      return "translate(" + d.parent.y + " " + d.parent.x + ")";
    });

    linkUpdate.select("path.link.down").attr("d", function (d) {
      return l.getLinkD(d, "down");
    }).style("stroke", function (d) {
      return options.linkColorInherit ? l.getLinkStroke(d.parent) : "";
    }).style("stroke-width", function (d) {
      return l.getLinkStrokeWidth(d.parent);
    });

    linkUpdate.select("path.link.right").attr("d", function (d) {
      return l.getLinkD(d, "right");
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
    linkExit.selectAll("path.link.down").attr("d", function () {
      return l.getLinkD(destination, "down");
    });

    linkExit.selectAll("path.link.right").attr("d", function () {
      return l.getLinkD(destination, "right");
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

    options.defaultColor = "grey";

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

    options.linkHeight = 20;

    options.linkLabelField = "value";
    options.linkLabelOn = false;
    options.linkLabelUnit = "";
    options.linkLabelOnTop = true;
    options.linkLabelAligned = true; // otherwise centered
    // options.linkLabelFormat = d => d;

    options.locale = undefined;
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
      options.nodeImageSelectionAppend = _append;
      options.nodeImageSelectionUpdate = _update;
      options.nodeImageFile = false;
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

      if (typeof options.updateLinkStrength === "function") options.updateLinkStrength();
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
    /*
    chartAPI.linkColor = function(_ = options.linkColorField, scale = options.linkColorScale) {
      if (!arguments.length) return options.linkColorField;
      options.linkColorStatic = false;
      options.linkColorField = _;
      options.linkColorScale = scale;
      if (typeof options.updateDefault === "function") options.updateDefault();
      return chartAPI;
    }; 
    */

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
        myData.keyField = dataSpec.key ? dataSpec.key : "key";
        myData.delimiter = dataSpec.delimiter ? dataSpec.delimiter : ",";
        myData.separator = dataSpec.separator ? dataSpec.separator : "$";
      } else {
        console.log("dataspec is not an object!");
      }
      myData.isJSON = _typeof(myData.data) === "object";
      if (!myData.isJSON) {
        myData.fromFile = myData.data.endsWith(".json") || myData.data.endsWith(".csv") ? true : false;
      }
      myData.flatData = Array.isArray(myData.hierarchyLevels) ? true : false;
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
