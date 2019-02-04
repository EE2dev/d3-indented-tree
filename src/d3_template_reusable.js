
import { readData } from "./preprocessing/processingData";
import { myChart } from "./visualization/myChart.js";

export default function (_myData) {
    
  ///////////////////////////////////////////////////
  // 1.0 ADD visualization specific variables here //
  ///////////////////////////////////////////////////
  let options = {};
  // 1. ADD all options that should be accessible to caller
  options.connector = "straight"; // alternative is "curved"
  options.connectorWidth = 30;
  options.connectorHeight = 50;
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

  chartAPI.connector = function(_) {
    if (!arguments.length) return options.connector;
    options.connector = _;
    return chartAPI;
  }; 

  chartAPI.margin = function(_) {
    if (!arguments.length) return options.margin;
    options.margin = _;
    return chartAPI;
  };  

  // 3. ADD getter-setter methods with updateable functions here
  chartAPI.connectorWidth = function(_) {
    if (!arguments.length) return options.connectorWidth;
    options.connectorWidth = _;
    if (typeof options.updateConnectorWidth === "function") options.updateConnectorWidth();
    return chartAPI;
  };

  chartAPI.connectorHeight = function(_) {
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
