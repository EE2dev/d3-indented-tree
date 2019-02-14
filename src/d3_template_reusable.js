
import { readData } from "./preprocessing/processingData";
import { myChart } from "./visualization/myChart.js";
import * as d3 from "d3";

export default function (_myData, _hierarchyLevels = undefined) {
    
  ///////////////////////////////////////////////////
  // 1.0 ADD visualization specific variables here //
  ///////////////////////////////////////////////////
  let options = {};
  // 1. ADD all options that should be accessible to caller
  options.debugOn = false;
  options.dataEmbedded = (typeof _myData !== "undefined") ? false : true;
  options.margin = {top: 20, right: 10, bottom: 20, left: 10};
  options.maxNameLength = 50;
  options.transitionDuration = 750;

  options.linkFunction = "straight"; // alternative is "curved"
  options.linkHeight = 20;
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

  options.propagate = false; // default: no propagation
  options.propagateField = "value"; // default field for propagation

  options.alignLeaves = false; // use tree layout as default, otherwise cluster layout

  // 2. ADD getter-setter methods here
  chartAPI.debugOn = function(_) {
    if (!arguments.length) return options.debugOn;
    options.debugOn = _;
    return chartAPI;
  }; 
  
  chartAPI.margin = function(_) {
    if (!arguments.length) return options.margin;
    options.margin = _;
    return chartAPI;
  }; 
    
  chartAPI.maxNameLength = function(_) {
    if (!arguments.length) return options.maxNameLength;
    options.maxNameLength = _;
    return chartAPI;
  };

  chartAPI.transitionDuration = function(_) {
    if (!arguments.length) return options.transitionDuration;
    options.transitionDuration = _;
    return chartAPI;
  }; 

  chartAPI.linkFunction = function(_) {
    if (!arguments.length) return options.linkFunction;
    options.linkFunction = _;
    return chartAPI;
  }; 

  chartAPI.propagateValue = function(_) {
    if (!arguments.length) return options.propagate + ": " + options.propagateField;
    options.propagate = true;
    options.propagateField = _;
    return chartAPI;
  }; 

  // 3. ADD getter-setter methods with updateable functions here
  chartAPI.linkHeight = function(_) {
    if (!arguments.length) return options.linkHeight;
    options.linkHeight = _;
    if (typeof options.updateLinkHeight === "function") options.updateLinkHeight();
    return chartAPI;
  };

  chartAPI.linkWidth = function(_, scale = options.linkWidthScale, range = options.linkWidthRange) {
    if (!arguments.length) return options.linkWidthValue + ", scale: " + options.linkWidthScale;
    if (typeof (_) === "number") { 
      options.linkWidthStatic = true;
      options.linkWidthValue = _;
    }
    else if (typeof(_) === "string") {
      options.linkWidthStatic = false;
      options.linkWidthField = _;
      options.linkWidthScale = scale;
      options.linkWidthRange = range;
    }
    
    if (typeof options.updateLinkWidth === "function") options.updateLinkWidth();
    return chartAPI;
  };

  chartAPI.linkStrength = function(_, scale = options.linkStrengthScale, range = options.linkStrengthRange) {
    if (!arguments.length) return options.linkStrengthValue + ", scale: " + options.linkStrengthScale;
    if (typeof (_) === "number") { 
      options.linkStrengthStatic = true;
      options.linkStrengthValue = _;
    }
    else if (typeof(_) === "string") {
      options.linkStrengthStatic = false;
      options.linkStrengthField = _;
      options.linkStrengthScale = scale;
      options.linkStrengthRange = range;
    }
    
    if (typeof options.updateLinkStrength === "function") options.updateLinkStrength();
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
      console.log("_myData "+ _myData);
      if (typeof d !== "undefined") { // data processing from outside
        createChart(selection, d);
      }
      else { // data processing here
        readData(_myData, _hierarchyLevels, selection, options.debugOn, createChart);
      }
    });
  }  

  // call visualization entry function
  function createChart(selection, data) {
    myChart(selection, data, options);
  }
  
  return chartAPI;
}
