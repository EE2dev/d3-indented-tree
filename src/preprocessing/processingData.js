import * as d3 from "d3";  

////////////////////////////////////////////////////
// Processing data                                //
//////////////////////////////////////////////////// 

// XHR to load data   
export function readData(file, _hierarchyLevels, selection, debugOn, createChart) {
  if (typeof file !== "undefined" && !Array.isArray(file)) { // read data from file 
    if (file.endsWith(".json")) { // JSON Format
      d3.json(file).then(function(data){
        if (debugOn) { console.log(data);}
        const hierarchy = d3.hierarchy(data);
        if (debugOn) { console.log("hierarchy: "); console.log(hierarchy);}
        createChart(selection, hierarchy);
      });
    } else if (file.endsWith(".csv")) {
      if (typeof _hierarchyLevels === "undefined"){ // CSV Format 1
        d3.dsv(",", file).then(function(data) {
          if (debugOn) { console.log(data);}
          const hierarchy = createHierarchy(data);
          if (debugOn) { console.log("hierarchy: "); console.log(hierarchy);}
          createChart(selection, hierarchy);
        });
      } else if (Array.isArray(_hierarchyLevels)){ // CSV Format 2
        // TO DO
      }
    } else {
      console.log("File must end with .json or csv");
    }
  } 
  else { // read data from DOM
    if (typeof file === "undefined") { // CSV Format 1
      const myData = readDataFromDOM();
      const hierarchy = createHierarchy(myData);
      if (debugOn) { console.log("embedded data: "); console.log(hierarchy);}
      createChart(selection, hierarchy);
    } else if (Array.isArray(file)) { // CSV Format 2
      // TO DO
    } else {
      console.log("Data is not specified correctly");
    }
  }
}

function readDataFromDOM(selector = "aside#data") {
  const inputData = d3.select(selector).text();
  const inputData_cleaned = inputData.trim();
  const file = d3.csvParse(inputData_cleaned);
  return file; 
}

function createHierarchy(data) {
  var root = d3.stratify()
    .id(function(d) { return d.name; })
    .parentId(function(d) { return d.parent; })(data);
  return root;
}

// helper to delete extra white spaces 
// from -> https://stackoverflow.com/questions/18065807/regular-expression-for-removing-whitespaces
/*
function removeWhiteSpaces (str) {
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
*/