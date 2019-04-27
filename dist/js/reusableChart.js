(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3')) :
  typeof define === 'function' && define.amd ? define(['exports', 'd3'], factory) :
  (factory((global.reusableChart = {}),global.d3));
}(this, (function (exports,d3) { 'use strict';

  ////////////////////////////////////////////////////
  // Processing data                                //
  //////////////////////////////////////////////////// 

  // XHR to load data   
  function readData(myData, selection, debugOn, createChart) {
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
        if (myData.flatData) {
          // CSV Format 1
          d3.dsv(myData.delimiter, myData.data).then(function (data) {
            if (debugOn) {
              console.log(data);
            }
            var hierarchy = createHierarchyFromFlatData(data, myData.hierarchyLevels, debugOn);
            if (debugOn) {
              console.log("hierarchy: ");console.log(hierarchy);
            }
            createChart(selection, hierarchy);
          });
        } else {
          // CSV Format 2
          d3.dsv(myData.delimiter, myData.data).then(function (data) {
            if (debugOn) {
              console.log(data);
            }
            var hierarchy = createHierarchy(data, myData.keyField);
            if (debugOn) {
              console.log("hierarchy: ");console.log(hierarchy);
            }
            createChart(selection, hierarchy);
          });
        }
      } else {
        console.log("File must end with .json or csv");
      }
    } else {
      // read data from DOM
      var data = readDataFromDOM(myData.delimiter);
      var hierarchy = myData.flatData ? createHierarchyFromFlatData(data, myData.hierarchyLevels, debugOn) : createHierarchy(data, myData.keyField);
      if (debugOn) {
        console.log("embedded data: ");console.log(hierarchy);
      }
      createChart(selection, hierarchy);
      /*
      if (myData.flatData) { // CSV Format 1
        const data = readDataFromDOM(myData.delimiter);
        const hierarchy = createHierarchyFromFlatData(data, myData.keyField, debugOn);
        if (debugOn) { console.log("embedded data: "); console.log(hierarchy);}
        createChart(selection, hierarchy);
      } else { // CSV Format 2
        const data = readDataFromDOM(myData.delimiter);
        const hierarchy = createHierarchy(data, myData.keyField);
        if (debugOn) { console.log("embedded data: "); console.log(hierarchy);}
        createChart(selection, hierarchy);
      } 
      */
    }
  }

  function readDataFromDOM(delimiter) {
    var selector = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "aside#data";

    var inputData = d3.select(selector).text();
    var inputData_cleaned = inputData.trim();
    // const file = d3.csvParse(inputData_cleaned);
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

  function createHierarchyFromFlatData(data, keys, debugOn) {
    var entries = d3.nest();
    keys.forEach(function (key) {
      return entries.key(function (d) {
        return d[key];
      });
    });
    entries = entries.entries(data);
    var root = d3.hierarchy(entries[0], getChildren);
    return root;

    function getChildren(d) {
      var children = d.values;
      if (typeof children === "undefined") {
        return null;
      }
      children = children.filter(function (child) {
        if (typeof child.key === "undefined") {
          return false;
        }
        if (child.key.length !== 0) {
          return true;
        } else {
          return false;
        }
      });

      if (debugOn) {
        console.log("Key: " + d.key + " Children: " + children.length);
      }
      return children.length === 0 ? null : children;
    }
  }

  var linksAPI = {};
  var options = void 0;
  var oldLabelField = void 0,
      newLabelField = void 0;

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
      path = "M 0 0" + "V" + (d.x + linkStrength / 2 - d.parent.x);
    } else if (direction === "right") {
      path = "M 0 0" + "H" + (d.y - (d.parent.y + linkStrengthParent / 2));
    }
    return path;
  };

  linksAPI.getLinkStrength = function (d) {
    if (!d.data) return 0;
    var s = options.linkStrengthStatic ? options.linkStrengthValue : options.linkStrengthScale(d.data[options.linkStrengthField]);
    return s;
    /*
      : options.linkStrengthField === "value" ? options.linkStrengthScale(d[options.linkStrengthField]) 
        : options.linkStrengthScale(d.data[options.linkStrengthField]); 
    return s ? s : 0; // 0 in case s is undefined
    */
  };

  linksAPI.getLinkStroke = function (d) {
    return options.linkColorStatic ? options.defaultColor : options.linkColorScale(d.data[options.linkColorField]);
  };

  linksAPI.getLinkStrokeWidth = function (d) {
    var sw = options.linkStrengthStatic ? options.linkStrengthValue : options.linkStrengthScale(d.data[options.linkStrengthField]);
    /*
      options.linkStrengthField === "value" ? options.linkStrengthScale(d[options.linkStrengthField]) + "px"
        : options.linkStrengthScale(d.data[options.linkStrengthField]) + "px";
        */
    return sw + "px";
  };

  linksAPI.getLinkLabel = function (d) {
    var labelField = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : options.linkLabelField;

    if (!options.linkLabelOn) return "";
    /*
    let label;
    
    //label = options.linkLabelField === "value" ? options.linkLabelFormat(d[options.linkLabelField])
    //  : options.linkLabelFormat(d.data[options.linkLabelField]);
      
    label = labelField === "value" ? d[labelField] : d.data[labelField];
    return label;
    */
    return d.data[labelField];
  };

  linksAPI.getLinkTextTween = function (d) {
    var selection = d3.select(this);
    if (!options.linkLabelOn) {
      return function () {
        selection.text("");
      };
    }
    /*
    const i = d3.interpolateNumber(
      selection.text()
        .replace(options.linkLabelUnit,"") // because repeated call can contain unit
        .replace(/[.,]/g, "")
      , linksAPI.getLinkLabel(d));
    return function(t) { 
      selection.text(options.linkLabelFormat(i(t)) + options.linkLabelUnit); 
    };
    */
    var numberStart = linksAPI.getLinkLabel(d, oldLabelField);
    var numberEnd = linksAPI.getLinkLabel(d, newLabelField);
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

  ////////////////////////////////////////////////////
  // add visualization specific processing here     //
  //////////////////////////////////////////////////// 

  function myChart(selection, data, options) {
    var config = {};
    config.width = 1400 - options.margin.right - options.margin.left;
    config.height = 800 - options.margin.top - options.margin.bottom;
    config.i = 0; // counter for numerical IDs
    config.tree = undefined;
    config.root = undefined;
    config.svg = undefined;
    config.counter = 0;

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

    // baroptions.width = options.width *.8;
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

    if (options.debugOn) {
      console.log("Data:");console.log(data);
      console.log("Tree:");console.log(config.root);
    }
  }

  function createScale(options, config) {
    var nodes = config.root.descendants();
    if (!options.linkStrengthStatic) {
      options.linkStrengthScale.domain(d3.extent(nodes.slice(1), function (d) {
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

    /*
    options.updateLinkHeight = function() {
      update(config.root, options, config);
    };
      options.updateLinkLabel = function() {
      update(config.root, options, config);
    };
      options.updateLinkColor = function() {
      update(config.root, options, config);
    };
    */

    options.updateDefault = function () {
      update(config.root, options, config);
    };
  }

  /*
  function collapse(d){
    if (d.children) {
      d._children = d.children;
      d._children.forEach(collapse);
      d.children = null;
    }
  }
  */

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
    config.width = 800;

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
    var node = config.svg.selectAll("g.node").data(nodesSort, function (d) {
      return d.id || (d.id = ++config.i);
    });

    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node.enter().append("g").attr("class", "node").attr("transform", function () {
      return "translate(" + source.y0 + "," + source.x0 + ")";
    }).on("click", function (d) {
      return click(d, options, config);
    });

    nodeEnter.append("circle").attr("r", 1e-6).style("fill", function (d) {
      return d._children ? "lightsteelblue" : "#fff";
    });

    nodeEnter.append("text").attr("x", 10).attr("dy", ".35em").attr("text-anchor", "start")
    // .attr("x", 0)
    // .attr("y", -12)
    // .attr("dy", ".35em")
    // .attr("text-anchor", "middle") 
    .text(function (d) {
      if (d.data[options.keyField].length > options.maxNameLength) {
        return d.data[options.keyField].substring(0, options.maxNameLength) + "...";
      } else {
        return d.data[options.keyField];
      }
    }).style("fill-opacity", 1e-6);

    nodeEnter.append("svg:title").text(function (d) {
      return d.data[options.keyField];
    });

    // Transition nodes to their new position.
    var nodeUpdate = node.merge(nodeEnter).transition().duration(options.transitionDuration);

    nodeUpdate.attr("transform", function (d) {
      return "translate(" + d.y + "," + d.x + ")";
    });

    nodeUpdate.select("circle").attr("r", 4.5).style("fill", function (d) {
      return d._children ? "lightsteelblue" : "#fff";
    });

    nodeUpdate.select("text").style("fill-opacity", 1);

    // Transition exiting nodes to the parent's new position (and remove the nodes)
    var nodeExit = node.exit().transition().duration(options.transitionDuration);

    nodeExit.attr("transform", function () {
      return "translate(" + source.y + "," + source.x + ")";
    }).remove();

    nodeExit.select("circle").attr("r", 1e-6);

    nodeExit.select("text").style("fill-opacity", 1e-6);

    // 2. Update the links…
    var l = linksAPI;
    l.initialize(options);

    var link = config.svg.selectAll("g.link").data(links, function (d) {
      // return d.target.id;
      var id = d.id + "->" + d.parent.id;
      return id;
    });

    // Enter any new links at the parent's previous position.
    var linkEnter = link.enter().insert("g", "g.node").attr("class", "link").attr("transform", "translate(" + source.y0 + " " + source.x0 + ")");

    var origin = { x: source.x0, y: source.y0, parent: { x: source.x0, y: source.y0 } };
    linkEnter.append("path").attr("class", "link down").attr("d", function () {
      return l.getLinkD(origin, "down");
    });

    linkEnter.append("path").attr("class", "link right").attr("d", function () {
      return l.getLinkD(origin, "right");
    });

    linkEnter.append("text").attr("dy", ".35em")
    // .attr("text-anchor", "end") 
    .attr("text-anchor", "middle").text(l.getLinkLabel).style("opacity", 1e-6).style("fill", l.getLinkLabelColor);

    // Transition links to their new position.
    var linkUpdate = link.merge(linkEnter).transition().duration(options.transitionDuration);

    linkUpdate.attr("transform", function (d) {
      return "translate(" + d.parent.y + " " + d.parent.x + ")";
    });

    linkUpdate.select("path.link.down").attr("d", function (d) {
      return l.getLinkD(d, "down");
    }).style("stroke", function (d) {
      return l.getLinkStroke(d.parent, options);
    }).style("stroke-width", function (d) {
      return l.getLinkStrokeWidth(d.parent, options);
    });

    linkUpdate.select("path.link.right").attr("d", function (d) {
      return l.getLinkD(d, "right");
    }).attr("transform", l.getLinkRTranslate).style("stroke", l.getLinkStroke).style("stroke-width", l.getLinkStrokeWidth);

    linkUpdate.select("text")
    // .attr("x", d => (d.y - d.parent.y) / 2 + l.labelMaxYPerDepth) // l.getLinkLabelX
    .attr("x", function (d) {
      return (d.y - d.parent.y) / 2;
    }).attr("y", function (d) {
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

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };

  function d3_template_reusable (_dataSpec) {

    ///////////////////////////////////////////////////
    // 1.0 ADD visualization specific variables here //
    ///////////////////////////////////////////////////
    var options = {};
    // 1. ADD all options that should be accessible to caller
    options.debugOn = false;
    options.margin = { top: 20, right: 10, bottom: 20, left: 10 };
    options.maxNameLength = 50;
    options.transitionDuration = 750;

    options.defaultColor = "grey";
    options.linkHeight = 20;

    options.linkLabelField = "value";
    options.linkLabelOn = false;
    options.linkLabelUnit = "";
    // options.linkLabelFormat = d => d;

    /*
    const localeGerman = d3.formatDefaultLocale({
      "decimal": ",",
      "thousands": ".",
      "grouping": [3],
      "currency": ["€", ""] //if you want a space between €-sign and number, add it here in the first string 
    });
    console.log(localeGerman);
    */

    options.linkLabelFormatSpecifier = ",.0f";
    options.linkLabelFormat = d3.format(options.linkLabelFormatSpecifier);
    /*
    options.linkWidth = 30;
    options.linkWidthScale = d3.scaleLinear().domain([264, 432629]).range([15,100]);
    options.linkWidthField = "value";
    */
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

    options.propagate = false; // default: no propagation
    options.propagateField = "value"; // default field for propagation

    options.alignLeaves = false; // use tree layout as default, otherwise cluster layout
    options.keyField = undefined;

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

    chartAPI.maxNameLength = function (_) {
      if (!arguments.length) return options.maxNameLength;
      options.maxNameLength = _;
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
      if (_ === "German") {
        _ = {
          "decimal": ",",
          "thousands": ".",
          "grouping": [3],
          "currency": ["€", ""]
        };
      }
      options.locale = d3.formatDefaultLocale(_);
      return chartAPI;
    };

    // 3. ADD getter-setter methods with updateable functions here
    chartAPI.linkHeight = function (_) {
      if (!arguments.length) return options.linkHeight;
      options.linkHeight = _;
      if (typeof options.updateDefault === "function") options.updateDefault();
      return chartAPI;
    };

    chartAPI.linkLabel = function () {
      var _ = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : options.linkLabelField;

      var unit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : options.linkLabelUnit;
      var format = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : options.linkLabelFormatSpecifier;

      if (!arguments.length) return options.linkLabelField;

      if (typeof _ === "string") {
        options.linkLabelField = _;
        options.linkLabelOn = true;
        options.linkLabelUnit = unit === "" ? "" : unit;
        options.linkLabelFormat = d3.format(format);
      } else if (typeof _ === "boolean") {
        options.linkLabelOn = _;
      }
      if (typeof options.updateDefault === "function") options.updateDefault();
      return chartAPI;
    };

    chartAPI.linkWidth = function () {
      var _ = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : options.linkWidthField;

      var scale = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : options.linkWidthScale;
      var range = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : options.linkWidthRange;

      if (!arguments.length) return options.linkWidthValue;
      if (typeof _ === "number") {
        options.linkWidthStatic = true;
        options.linkWidthValue = _;
      } else if (typeof _ === "string") {
        options.linkWidthStatic = false;
        options.linkWidthField = _;
        options.linkWidthScale = scale;
        options.linkWidthRange = range;
      }

      if (typeof options.updateLinkWidth === "function") options.updateLinkWidth();
      return chartAPI;
    };

    chartAPI.linkStrength = function () {
      var _ = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : options.linkStrengthField;

      var scale = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : options.linkStrengthScale;
      var range = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : options.linkStrengthRange;

      if (!arguments.length) return options.linkStrengthValue;
      if (typeof _ === "number") {
        options.linkStrengthStatic = true;
        options.linkStrengthValue = _;
      } else if (typeof _ === "string") {
        options.linkStrengthStatic = false;
        options.linkStrengthField = _;
        options.linkStrengthScale = scale;
        options.linkStrengthRange = range;
      }

      if (typeof options.updateLinkStrength === "function") options.updateLinkStrength();
      return chartAPI;
    };

    chartAPI.linkColor = function () {
      var _ = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : options.linkColorField;

      var scale = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : options.linkColorScale;

      if (!arguments.length) return options.linkColorField;
      options.linkColorStatic = false;
      options.linkColorField = _;
      options.linkColorScale = scale;
      if (typeof options.updateDefault === "function") options.updateDefault();
      return chartAPI;
    };

    chartAPI.linkLabelColor = function (_) {
      if (!arguments.length) return options.linkLabelColor;
      options.linkLabelColor = _;
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
          readData(myData, selection, options.debugOn, createChart);
        }
      });
    }

    function createDataInfo(dataSpec) {
      var myData = {};

      if ((typeof dataSpec === "undefined" ? "undefined" : _typeof(dataSpec)) === "object") {
        myData.data = dataSpec.source;
        myData.hierarchyLevels = dataSpec.hierarchyLevels;
        myData.keyField = dataSpec.key ? dataSpec.key : myData.hierarchyLevels ? "key" : "name";
        myData.delimiter = dataSpec.delimiter ? dataSpec.delimiter : ",";
      } else {
        console.log("dataspec is not an object!");
      }
      myData.fromFile = typeof myData.data === "undefined" ? false : true;
      myData.flatData = Array.isArray(myData.hierarchyLevels) ? true : false;
      options.keyField = myData.keyField;
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
