export function getLinkD(d, direction, options) {
  const linkStrengthParent = getLinkStrength(d.parent, options);
  const linkStrength = getLinkStrength(d, options);
  let path;
  if (direction === "down"){
    path = "M 0 0" + "V" + (d.x + linkStrength / 2 - d.parent.x);
  } else if (direction === "right"){
    path = "M 0 0" + "H" + (d.y - (d.parent.y + linkStrengthParent / 2));
  }
  return path;
}

export function getLinkStrength(d, options) {
  return options.linkStrengthStatic ? options.linkStrengthValue 
    : options.linkStrengthField === "value" ? options.linkStrengthScale(d[options.linkStrengthField]) 
      : options.linkStrengthScale(d.data[options.linkStrengthField]); 
}

export function getLinkStroke(d, options) {
  return options.linkColorStatic ? options.defaultColor : options.linkColorScale(d.data[options.linkColorField]);
}

export function getLinkStrokeWidth(d, options) {
  const sw = options.linkStrengthStatic ? options.linkStrengthValue + "px" : 
    options.linkStrengthField === "value" ? options.linkStrengthScale(d[options.linkStrengthField]) + "px"
      : options.linkStrengthScale(d.data[options.linkStrengthField]) + "px";
  return sw;
}