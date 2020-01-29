
import { readData } from "./preprocessing/processingData";
import { myChart } from "./visualization/myChart.js";
import * as d3 from "d3";

export default function (_dataSpec) {
    
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
  options.transitionDuration = options.transitionDurationClick;
  options.locale = undefined;

  options.defaultColor = "grey";
  
  options.nodeBarOn = false;
  options.nodeBarField = "value"; // for the width of the rect
  options.nodeBarLabel = options.nodeBarField; // for the text displayed
  options.nodeBarLabelInside = false; // display the label inside the bar?
  options.nodeBarTextFill; // function for setting the label color based on the value.
  options.nodeBarRectFill; // function for setting the fill color of the rectangle based on the value.
  options.nodeBarRectStroke; // function for setting the stroke color of the rectangle based on the value.
  options.nodeBarUnit = "";
  options.nodeBarFormatSpecifier = ",.0f"; 
  options.nodeBarFormat = d3.format(options.nodeBarFormatSpecifier);
  options.nodeBarScale = d3.scaleLinear();
  options.nodeBarDomain; // domain of the scale
  options.nodeBarRange = [0, 200];
  options.nodeBarRangeUpperBound = options.nodeBarRange[1];
  options.nodeBarRangeAdjusted = false; // true if range is doubled for pos + neg bars
  options.nodeBarNeg; // true if nodeBarField has at least one negative value
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

  options.linkHeight = 20;

  options.linkLabelField = "value";
  options.linkLabelOn = false;
  options.linkLabelUnit = "";
  options.linkLabelOnTop = true;
  options.linkLabelAligned = true; // otherwise centered
  options.linkLabelFormatSpecifier = ",.0f"; 
  options.linkLabelFormat = d3.format(options.linkLabelFormatSpecifier);
  options.linkLabelColor; // function for setting the label color based on the value.

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
      if (_options.range) { options.nodeBarRange = _options.range; options.nodeBarRangeAdjusted = false;}
      if (_options.range) { options.nodeBarRangeUpperBound = options.nodeBarRange[1]; }
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
    options.nodeImageSetBackground = _options.setBackground || options.nodeImageSetBackground;
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
      options.linkLabelAligned = (typeof (_options.align) !== "undefined") ? _options.align : options.linkLabelAligned;
    }
    if (typeof options.updateDefault === "function") options.updateDefault();
    return chartAPI;
  };

  chartAPI.linkWidth = function(_ = options.linkWidthField, _options = {}) {
    if (!arguments.length) return options.linkWidthValue;
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
