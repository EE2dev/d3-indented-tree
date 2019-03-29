import * as d3 from "d3";

export let linksAPI = {};
let options;

linksAPI.initialize = function(_options) { options = _options; };

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
  return options.linkStrengthStatic ? options.linkStrengthValue 
    : options.linkStrengthField === "value" ? options.linkStrengthScale(d[options.linkStrengthField]) 
      : options.linkStrengthScale(d.data[options.linkStrengthField]); 
};

linksAPI.getLinkStroke = function (d) {
  return options.linkColorStatic ? options.defaultColor : options.linkColorScale(d.data[options.linkColorField]);
};

linksAPI.getLinkStrokeWidth = function (d) {
  const sw = options.linkStrengthStatic ? options.linkStrengthValue + "px" : 
    options.linkStrengthField === "value" ? options.linkStrengthScale(d[options.linkStrengthField]) + "px"
      : options.linkStrengthScale(d.data[options.linkStrengthField]) + "px";
  return sw;
};

linksAPI.getLinkLabel = function(d) {
  if (options.linkLabelType === "none") return "";
  let label;
  if (options.linkLabelType === "field") { 
    label = options.linkLabelField === "value" ? options.linkLabelFormat(d[options.linkLabelField])
      : options.linkLabelFormat(d.data[options.linkLabelField]);
  }
  else if (options.linkLabelType === "number") {
    label = options.linkLabelFormat(options.linkLabelValue);
  }
  label = label + options.linkLabelUnit;
  return label;
};

linksAPI.getLinkTextTween = function(d) { 
  const selection = d3.select(this);
  const i = d3.interpolateNumber(selection.text().replace(/,/g, ""), linksAPI.getLinkLabel(d));
  return function(t) { 
    selection.text(options.linkLabelFormat(i(t)) + options.linkLabelUnit); 
  };
};

linksAPI.getLinkRTranslate = function (d) {
  return "translate(" + (d.parent.y + linksAPI.getLinkStrength(d.parent) / 2) + " " + d.x + ")";
};