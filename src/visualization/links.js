import * as d3 from "d3";

export let linksAPI = {};
let options;
let oldLabelField , newLabelField;

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

linksAPI.getLinkD = function (d, direction) {
  const linkStrengthParent = linksAPI.getLinkStrength(d.parent, options);
  const linkStrength = linksAPI.getLinkStrength(d, options);
  let path;
  if (direction === "down"){
    path = "M 0 0" + "V" + (d.x + linkStrength / 2 - d.parent.x);
  } else if (direction === "right"){
    path = "M 0 0" + "H" + (d.y - (d.parent.y + linkStrengthParent / 2));
  }
  return path;
};

linksAPI.getLinkStrength = function (d) {
  if (!d.data) return 0;
  const s = options.linkStrengthStatic ? options.linkStrengthValue 
    : options.linkStrengthScale(d.data[options.linkStrengthField]); 
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
  const sw = options.linkStrengthStatic ? options.linkStrengthValue
    : options.linkStrengthScale(d.data[options.linkStrengthField]); 
  /*
    options.linkStrengthField === "value" ? options.linkStrengthScale(d[options.linkStrengthField]) + "px"
      : options.linkStrengthScale(d.data[options.linkStrengthField]) + "px";
      */
  return sw + "px";
};

linksAPI.getLinkLabel = function(d, labelField = options.linkLabelField) {
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

linksAPI.getLinkTextTween = function(d) { 
  const selection = d3.select(this);
  if (!options.linkLabelOn) {
    return function() { selection.text(""); };
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
  const numberStart = linksAPI.getLinkLabel(d, oldLabelField);
  const numberEnd = linksAPI.getLinkLabel(d, newLabelField);
  const i = d3.interpolateNumber(numberStart, numberEnd);
  return function(t) { selection.text(options.linkLabelFormat(i(t)) + options.linkLabelUnit); };
};

linksAPI.getLinkRTranslate = function (d) {
  return "translate(" + (linksAPI.getLinkStrength(d.parent) / 2) + " " + (d.x - d.parent.x) + ")";
};