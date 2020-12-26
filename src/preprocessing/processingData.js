import * as d3 from "d3";  

////////////////////////////////////////////////////
// Processing data                                //
//////////////////////////////////////////////////// 

// XHR to load data   
export function readData(myData, selection, options, createChart) {
  const debugOn = options.debugOn;
  if (myData.fromFile) { // read data from file 
    if (myData.data.endsWith(".json")) { // JSON Format
      d3.json(myData.data).then(function(data){
        if (debugOn) { console.log("Initial Data: ");console.log(data);}
        const hierarchy = d3.hierarchy(data);
        if (debugOn) { console.log("hierarchy: "); console.log(hierarchy);}
        createChart(selection, hierarchy);
      });
    } else if (myData.data.endsWith(".csv")) {
      d3.dsv(myData.delimiter, myData.data, myData.autoConvert ? myData.convertTypesFunction : undefined)
        .then(function(data) {
          if (debugOn) { console.log(data);}
          if (myData.flatData) {
            data = createLinkedData(data, myData.hierarchyLevels, myData.keyField
              , myData.delimiter, myData.separator, options, myData.autoConvert, myData.convertTypesFunction); // csv Format 1
          }
          const hierarchy = createHierarchy(data, myData.keyField);
          if (debugOn) { console.log("hierarchy: "); console.log(hierarchy);}
          createChart(selection, hierarchy);
        });
    } else {
      console.log("File must end with .json or .csv");
    }
  } 
  else { // read data from DOM or JSON variable
    let hierarchy;
    if (myData.isJSON) {
      hierarchy = d3.hierarchy(myData.data);
    } else {
      const convert = myData.flatData ? false : myData.autoConvert; // for flat data the autoconvert is applied with createLinkedData()
      let data = readDataFromDOM(myData.delimiter, myData.data, convert, myData.convertTypesFunction);
      if (myData.flatData) {
        data = createLinkedData(data, myData.hierarchyLevels, myData.keyField
          , myData.delimiter, myData.separator, options, myData.autoConvert, myData.convertTypesFunction); // csv Format 1
      }
      hierarchy = createHierarchy(data, myData.keyField); // csv format 2
      if (debugOn) { console.log("embedded data: "); console.log(hierarchy);}
    }
    createChart(selection, hierarchy);
  }
}

function readDataFromDOM(delimiter, selector = "aside#data", autoConvert = true, convertTypesFunction) {
  const inputData = d3.select(selector).text();
  const inputData_cleaned = inputData.trim();
  const parser = d3.dsvFormat(delimiter);
  const file = parser.parse(inputData_cleaned, autoConvert ? convertTypesFunction : undefined);
  return file; 
}

function createHierarchy(data, key) {
  let root = d3.stratify()
    .id(function(d) { return d[key]; })
    .parentId(function(d) { return d.parent; })(data);
  return root;
}

function buildKey(row, keys, keyIndex, delimiter, keySeparator){
  let parent = getParent(row, keys, keyIndex, keySeparator);
  let child = parent + keySeparator + row[keys[keyIndex]];
  const pcKey = parent + delimiter + child;
  return pcKey;
} 

function getParent(row, keys, keyIndex, keySeparator){
  let parent = (keyIndex === 1) ? keys[0] : row[keys[keyIndex-1]];
  for (let i = 0; i < keyIndex; i++) {
    if (i === 0) { parent = keys[0];}
    else {
      parent += keySeparator + row[keys[i]];
    }
  }
  return parent;
}

function createLinkedData(data, keys, keyField, delimiter, keySeparator
  , options, autoConvert, convertTypesFunction) {
  const debugOn = options.debugOn;
  const nodeLabel = options.nodeLabelFieldFlatData; //"__he_name";
  
  let linkedDataString;
  let linkedDataArray;
  let parentChild = new Map();
  let pcKey;
  let pcValue;
  let setAll = (obj, val) => Object.keys(obj).forEach(k => obj[k] = val);
  let setNull = obj => setAll(obj, "");
  let newRow;
  let rowString;
  let proceed = true;

  data.forEach((row) => {
    proceed = true;
    keys.forEach( (key, j) => {
      if (j > 0 && proceed) {
        pcValue = {};      
        if (debugOn && row[key]) { 
          console.log("row[key]: "); 
          console.log(row); 
          console.log("key: ");
          console.log(key); 
        }  
        if (j === keys.length-1) { 
          pcKey = buildKey( row, keys, j, delimiter, keySeparator);
          if (!parentChild.get(pcKey)) {
            Object.assign(pcValue, row);
            pcValue[nodeLabel] = row[key];
            parentChild.set(pcKey, pcValue);
          }
        } else  {
          pcKey = buildKey( row, keys, j, delimiter, keySeparator);
          if (!row[keys[j+1]]) {
            Object.assign(pcValue, row);
            pcValue[nodeLabel] = row[key];
            parentChild.set(pcKey, pcValue);
            proceed = false;
          } else {
            if (!parentChild.get(pcKey)) {
              Object.assign(pcValue, row);
              setNull(pcValue);
              pcValue[nodeLabel] = row[key];
              parentChild.set(pcKey, pcValue);
            }
          }
        }
      } 
    });
  });

  // build the String in the linked data format
  // add column names to string
  if (debugOn) { console.log(parentChild); }
  
  rowString = "parent" + delimiter + keyField;
  Object.keys(data[0]).forEach( (key) => { rowString += delimiter + key; });
  rowString += delimiter + nodeLabel;

  linkedDataString = rowString + "\n";

  // add root node to string
  rowString = delimiter + keys[0] + delimiter;
  rowString += delimiter.repeat(Object.keys(data[0]).length);
  if (keys[0] !== keySeparator) { rowString += keys[0]; } 
  linkedDataString += rowString + "\n";

  // all other nodes
  for (var [key, value] of parentChild) {
    rowString = key;
    newRow = Object.values(value);
    newRow.forEach(d => { rowString += delimiter + d;});
    linkedDataString += rowString + "\n";
  }

  if (debugOn) {
    console.log("converted linked Data:");
    console.log(linkedDataString);
  }

  const parser = d3.dsvFormat(delimiter);
  linkedDataArray = parser.parse(linkedDataString, autoConvert ? convertTypesFunction : undefined);
  // if nodeLabel === " " it was converted to null, so here its changed to " "  
  linkedDataArray.map(ele => { ele[nodeLabel] = ele[nodeLabel] ? ele[nodeLabel] : " ";});

  if (debugOn) {
    console.log("converted linked Data array:");
    console.log(linkedDataArray);
  }

  return linkedDataArray;
}