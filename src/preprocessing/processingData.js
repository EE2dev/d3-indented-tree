import * as d3 from "d3";  

////////////////////////////////////////////////////
// Processing data                                //
//////////////////////////////////////////////////// 

// XHR to load data   
export function readData(myData, selection, debugOn, createChart) {
// export function readData(file, _hierarchyLevels, selection, debugOn, createChart) {
  if (myData.fromFile) { // read data from file 
    if (myData.data.endsWith(".json")) { // JSON Format
      d3.json(myData.data).then(function(data){
        if (debugOn) { console.log("Initial Data: ");console.log(data);}
        const hierarchy = d3.hierarchy(data);
        if (debugOn) { console.log("hierarchy: "); console.log(hierarchy);}
        createChart(selection, hierarchy);
      });
    } else if (myData.data.endsWith(".csv")) {
      if (myData.flatData){ // CSV Format 1
        // TO DO
      } else { // CSV Format 2
        d3.dsv(",", myData.data).then(function(data) {
          if (debugOn) { console.log(data);}
          const hierarchy = createHierarchy(data, myData.keyField);
          if (debugOn) { console.log("hierarchy: "); console.log(hierarchy);}
          createChart(selection, hierarchy);
        });
      }
    } else {
      console.log("File must end with .json or csv");
    }
  } 
  else { // read data from DOM
    if (myData.flatData) { // CSV Format 1
      // TO DO
    } else { // CSV Format 2
      const myData = readDataFromDOM();
      const hierarchy = createHierarchy(myData, myData.keyField);
      if (debugOn) { console.log("embedded data: "); console.log(hierarchy);}
      createChart(selection, hierarchy);
    } 
  }
}

function readDataFromDOM(selector = "aside#data") {
  const inputData = d3.select(selector).text();
  const inputData_cleaned = inputData.trim();
  const file = d3.csvParse(inputData_cleaned);
  return file; 
}

function createHierarchy(data, key) {
  var root = d3.stratify()
    .id(function(d) { return d[key]; })
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