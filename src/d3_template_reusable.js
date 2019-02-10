
import { readData } from "./preprocessing/processingData";
import { myChart } from "./visualization/myChart.js";
import * as d3 from "d3";

export default function (_myData) {
    
  ///////////////////////////////////////////////////
  // 1.0 ADD visualization specific variables here //
  ///////////////////////////////////////////////////
  let options = {};
  // 1. ADD all options that should be accessible to caller
  options.linkFunction = "straight"; // alternative is "curved"
  options.linkWidth = 30;
  options.linkHeight = 50;
  
  // options.linkStrengthValue = (d, i) => { return (1 + i / 10) ;};
  options.linkStrengthValue = 1;
  options.linkStrengthMaxValue = 10;
  options.linkStrength = function (d,i) {
    if (typeof (options.linkStrengthValue) === "function") {  
      return (options.linkStrengthValue(d,i) + "px");
    } else if (typeof (options.linkStrengthValue) === "number") { 
      return options.linkStrengthValue + "px";
    } else {
      return "1px";
    }
  };
  options.propagate = false; // default: no propagation
  options.propagateField = "value"; // default field for propagation

  options.linkScale = d3.scaleLinear();

  options.transitionDuration = 750;
  options.maxNameLength = 20;
  options.margin = {top: 20, right: 10, bottom: 20, left: 10};
  
  options.barPadding = 1;
  options.fillColor = "coral";
  options.debugOn = false;

  // 2. ADD getter-setter methods here
  chartAPI.debugOn = function(_) {
    if (!arguments.length) return options.debugOn;
    options.debugOn = _;
    return chartAPI;
  }; 

  chartAPI.linkFunction = function(_) {
    if (!arguments.length) return options.linkFunction;
    options.linkFunction = _;
    return chartAPI;
  }; 

  chartAPI.transitionDuration = function(_) {
    if (!arguments.length) return options.transitionDuration;
    options.transitionDuration = _;
    return chartAPI;
  }; 

  chartAPI.propagateValue = function(_) {
    if (!arguments.length) return options.propagate + ": " + options.propagateField;
    options.propagate = true;
    options.propagateField = _;
    return chartAPI;
  }; 

  chartAPI.maxNameLength = function(_) {
    if (!arguments.length) return options.maxNameLength;
    options.maxNameLength = _;
    return chartAPI;
  };

  chartAPI.margin = function(_) {
    if (!arguments.length) return options.margin;
    options.margin = _;
    return chartAPI;
  };  

  // 3. ADD getter-setter methods with updateable functions here
  chartAPI.linkWidth = function(_) {
    if (!arguments.length) return options.linkWidth;
    options.linkWidth = _;
    if (typeof options.updateLinkWidth === "function") options.updateLinkWidth();
    return chartAPI;
  };

  chartAPI.linkHeight = function(_) {
    if (!arguments.length) return options.linkHeight;
    options.linkHeight = _;
    if (typeof options.updateLinkHeight === "function") options.updateLinkHeight();
    return chartAPI;
  };

  chartAPI.linkStrength = function(_, s = options.linkScale) {
    if (!arguments.length) return options.linkStrengthValue + ", scale: " + options.linkScale;
    options.linkStrengthValue = _;
    options.linkScale = s;
    if (typeof options.updateLinkStrength === "function") options.updateLinkStrength();
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
