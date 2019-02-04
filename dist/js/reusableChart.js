(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3')) :
  typeof define === 'function' && define.amd ? define(['exports', 'd3'], factory) :
  (factory((global.reusableChart = {}),global.d3));
}(this, (function (exports,d3) { 'use strict';

  ////////////////////////////////////////////////////
  // Processing data                                //
  //////////////////////////////////////////////////// 

  // XHR to load data   
  function readData(file, selection, debugOn, createChart) {
    if (typeof file !== "undefined") {
      if (file.endsWith(".json")) {
        d3.json(file).then(function (data) {
          console.log(data);
          createChart(selection, data);
        });
      } else if (file.endsWith(".csv")) {
        // to do
        // d3.dsv(",", csvFile, convertToNumber).then(function(data) {
        var data = [];
        console.log(data);
        createChart(selection, data);
      } else {
        console.log("File must end with .json or csv");
      }
    } else {
      var inputData = d3.select("aside#data").text();
      var _file = d3.csvParse(removeWhiteSpaces(inputData));
      _file.forEach(function (row) {
        convertToNumber(row);
      });
      if (debugOn) {
        console.log(_file);
      }
      createChart(selection, _file);
    }
  }

  // helper to delete extra white spaces 
  // from -> https://stackoverflow.com/questions/18065807/regular-expression-for-removing-whitespaces
  function removeWhiteSpaces(str) {
    return str.replace(/^\s+|\s+$|\s+(?=\s)/g, "");
  }

  // helper for XHR
  function convertToNumber(d) {
    for (var perm in d) {
      if (Object.prototype.hasOwnProperty.call(d, perm)) {
        d[perm] = +d[perm];
      }
    }
    return d;
  }

  ////////////////////////////////////////////////////
  // add visualization specific processing here     //
  //////////////////////////////////////////////////// 

  function myChart(selection, data, options) {
    var hierarchy = d3.hierarchy;
    // let select = d3.select;
    var width = 1400 - options.margin.right - options.margin.left;
    var height = 800 - options.margin.top - options.margin.bottom;
    // let baroptions.width;
    var i = void 0;
    var duration = void 0;
    var tree = void 0;
    var root = void 0;
    var svg = void 0;
    var maxNameLength = 20;

    function initTree(data) {
      // baroptions.width = options.width *.8;
      i = 0;
      duration = 750;
      tree = d3.tree().size([width, height]).nodeSize([0, options.connectorWidth]);
      root = tree(hierarchy(data));
      root.each(function (d) {
        d.name = d.id; //transferring name to a name variable
        d.id = i; //Assigning numerical Ids
        i++;
      });
      root.x0 = root.x;
      root.y0 = root.y;
      //svg = select(".hierarchy-container").append("svg")
      svg = selection.append("svg").attr("width", width + options.margin.right + options.margin.left).attr("height", height + options.margin.top + options.margin.bottom).append("g").attr("transform", "translate(" + options.margin.left + "," + options.margin.top + ")");

      options.updateConnectorWidth = function () {
        tree.nodeSize([0, options.connectorWidth]);
        update(root);
      };

      options.updateConnectorHeight = function () {
        update(root);
      };
      // root.children.forEach(collapse);
      update(root);
    }

    function connector(d) {
      var path = options.connector === "curved" ? // curved
      "M" + d.y + "," + d.x + "C" + (d.y + d.parent.y) / 2 + "," + d.x + " " + (d.y + d.parent.y) / 2 + "," + d.parent.x + " " + d.parent.y + "," + d.parent.x : // straight
      "M" + d.parent.y + "," + d.parent.x + "V" + d.x + "H" + d.y;
      return path;
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

    function click(d) {
      if (d.children) {
        d._children = d.children;
        d.children = null;
      } else {
        d.children = d._children;
        d._children = null;
      }
      update(d);
    }

    function update(source) {
      width = 800;

      // Compute the new tree layout.
      var nodes = tree(root);
      var nodesSort = [];
      nodes.eachBefore(function (n) {
        nodesSort.push(n);
      });
      height = Math.max(500, nodesSort.length * options.connectorHeight + options.margin.top + options.margin.bottom);
      var links = nodesSort.slice(1);
      // Compute the "layout".
      nodesSort.forEach(function (n, i) {
        n.x = i * options.connectorHeight;
      });

      d3.select("svg").transition().duration(duration).attr("height", height);

      // Update the nodes…
      var node = svg.selectAll("g.node").data(nodesSort, function (d) {
        return d.id || (d.id = ++i);
      });

      // Enter any new nodes at the parent's previous position.
      var nodeEnter = node.enter().append("g").attr("class", "node").attr("transform", function () {
        return "translate(" + source.y0 + "," + source.x0 + ")";
      }).on("click", click);

      nodeEnter.append("circle").attr("r", 1e-6).style("fill", function (d) {
        return d._children ? "lightsteelblue" : "#fff";
      });

      nodeEnter.append("text").attr("x", 10).attr("dy", ".35em").attr("text-anchor", "start").text(function (d) {
        if (d.data.name.length > maxNameLength) {
          return d.data.name.substring(0, maxNameLength) + "...";
        } else {
          return d.data.name;
        }
      }).style("fill-opacity", 1e-6);

      nodeEnter.append("svg:title").text(function (d) {
        return d.data.name;
      });

      // Transition nodes to their new position.
      var nodeUpdate = node.merge(nodeEnter).transition().duration(duration);

      nodeUpdate.attr("transform", function (d) {
        return "translate(" + d.y + "," + d.x + ")";
      });

      nodeUpdate.select("circle").attr("r", 4.5).style("fill", function (d) {
        return d._children ? "lightsteelblue" : "#fff";
      });

      nodeUpdate.select("text").style("fill-opacity", 1);

      // Transition exiting nodes to the parent's new position (and remove the nodes)
      var nodeExit = node.exit().transition().duration(duration);

      nodeExit.attr("transform", function () {
        return "translate(" + source.y + "," + source.x + ")";
      }).remove();

      nodeExit.select("circle").attr("r", 1e-6);

      nodeExit.select("text").style("fill-opacity", 1e-6);

      // Update the links…
      var link = svg.selectAll("path.link").data(links, function (d) {
        // return d.target.id;
        var id = d.id + "->" + d.parent.id;
        return id;
      });

      // Enter any new links at the parent's previous position.
      var linkEnter = link.enter().insert("path", "g").attr("class", "link").attr("d", function () {
        var o = { x: source.x0, y: source.y0, parent: { x: source.x0, y: source.y0 } };
        return connector(o);
      });

      // Transition links to their new position.
      link.merge(linkEnter).transition().duration(duration).attr("d", connector);

      // // Transition exiting nodes to the parent's new position.
      link.exit().transition().duration(duration).attr("d", function () {
        var o = { x: source.x, y: source.y, parent: { x: source.x, y: source.y } };
        return connector(o);
      }).remove();

      // Stash the old positions for transition.
      nodesSort.forEach(function (d) {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    }

    initTree(data);
  }

  function d3_template_reusable (_myData) {

    ///////////////////////////////////////////////////
    // 1.0 ADD visualization specific variables here //
    ///////////////////////////////////////////////////
    var options = {};
    // 1. ADD all options that should be accessible to caller
    options.connector = "straight"; // alternative is "curved"
    options.connectorWidth = 30;
    options.connectorHeight = 50;
    options.margin = { top: 20, right: 10, bottom: 20, left: 10 };

    options.barPadding = 1;
    options.fillColor = "coral";
    options.debugOn = false;

    // 2. ADD getter-setter methods here
    chartAPI.debugOn = function (_) {
      if (!arguments.length) return options.debugOn;
      options.debugOn = _;
      return chartAPI;
    };

    chartAPI.connector = function (_) {
      if (!arguments.length) return options.connector;
      options.connector = _;
      return chartAPI;
    };

    chartAPI.margin = function (_) {
      if (!arguments.length) return options.margin;
      options.margin = _;
      return chartAPI;
    };

    // 3. ADD getter-setter methods with updateable functions here
    chartAPI.connectorWidth = function (_) {
      if (!arguments.length) return options.connectorWidth;
      options.connectorWidth = _;
      if (typeof options.updateConnectorWidth === "function") options.updateConnectorWidth();
      return chartAPI;
    };

    chartAPI.connectorHeight = function (_) {
      if (!arguments.length) return options.connectorHeight;
      options.connectorHeight = _;
      if (typeof options.updateConnectorHeight === "function") options.updateConnectorHeight();
      return chartAPI;
    };

    ////////////////////////////////////////////////////
    // API for external access                        //
    //////////////////////////////////////////////////// 

    // standard API for selection.call()
    function chartAPI(selection) {
      selection.each(function (d) {
        console.log(d);
        console.log("_myData " + _myData);
        if (typeof d !== "undefined") {
          // data processing from outside
          createChart(selection, d);
        } else {
          // data processing here
          readData(_myData, selection, options.debugOn, createChart);
        }
      });
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
