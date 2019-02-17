import * as d3 from "d3";  

////////////////////////////////////////////////////
// Processing data                                //
//////////////////////////////////////////////////// 

// XHR to load data   
export function readData(myData, selection, debugOn, createChart) {
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
        d3.dsv(myData.delimiter, myData.data).then(function(data) {
          if (debugOn) { console.log(data);}
          const hierarchy = createHierarchyFromFlatData(data, myData.hierarchyLevels, debugOn);
          if (debugOn) { console.log("hierarchy: "); console.log(hierarchy);}
          createChart(selection, hierarchy);
        });
      } else { // CSV Format 2
        d3.dsv(myData.delimiter, myData.data).then(function(data) {
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
    const data = readDataFromDOM(myData.delimiter);
    const hierarchy = (myData.flatData) ? 
      createHierarchyFromFlatData(data, myData.hierarchyLevels, debugOn) : createHierarchy(data, myData.keyField);
    if (debugOn) { console.log("embedded data: "); console.log(hierarchy);}
    createChart(selection, hierarchy);
    /*
    if (myData.flatData) { // CSV Format 1
      const data = readDataFromDOM(myData.delimiter);
      const hierarchy = createHierarchyFromFlatData(data, myData.keyField, debugOn);
      if (debugOn) { console.log("embedded data: "); console.log(hierarchy);}
      createChart(selection, hierarchy);
    } else { // CSV Format 2
      const data = readDataFromDOM(myData.delimiter);
      const hierarchy = createHierarchy(data, myData.keyField);
      if (debugOn) { console.log("embedded data: "); console.log(hierarchy);}
      createChart(selection, hierarchy);
    } 
    */
  }
}

function readDataFromDOM(delimiter, selector = "aside#data") {
  const inputData = d3.select(selector).text();
  const inputData_cleaned = inputData.trim();
  // const file = d3.csvParse(inputData_cleaned);
  const parser = d3.dsvFormat(delimiter);
  const file = parser.parse(inputData_cleaned);
  return file; 
}

function createHierarchy(data, key) {
  let root = d3.stratify()
    .id(function(d) { return d[key]; })
    .parentId(function(d) { return d.parent; })(data);
  return root;
}

function createHierarchyFromFlatData(data, keys, debugOn) {
  let entries = d3.nest();
  keys.forEach(key => entries.key(d => d[key]));
  entries = entries.entries(data);
  let root = d3.hierarchy(entries[0], getChildren);
  return root;

  function getChildren(d){
    let children = d.values;
    if (typeof (children) === "undefined") {
      return null;
    }
    children = children.filter(function(child) {
      if (typeof (child.key) === "undefined") { 
        return false; 
      }
      if (child.key.length !== 0) { 
        return true;
      }
      else { 
        return false;
      }
    }); 
    
    if (debugOn) { console.log("Key: " + d.key + " Children: " + children.length);}
    return (children.length === 0) ? null : children;
  }
}
