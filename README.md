# Hierarchy explorer 

Visualizing a hierarchy with an expandable/collapsable tree.

## Credits
This approach is based on [this bl.ock from Mike Bostock](https://bl.ocks.org/mbostock/1093025) and [this codepen by Brendan Dougan](https://codepen.io/brendandougan/pen/PpEzRp) and is implemented with [d3-template](https://github.com/EE2dev/d3-template) as a reusable d3 chart.

## Examples

- [hierarchy explorer - showcase](https://bl.ocks.org/EE2dev/62d28e7f41a5c37cdfef99a021a42972)

More examples demonstrating specific API calls:

#### Data Format examples

- [data format - JSON file (readme example)](https://bl.ocks.org/EE2dev/2dac1c1714b456bc427bb7f5beaeca87)
- [data format - hierarchical csv file (readme example)](https://bl.ocks.org/EE2dev/eb865fd642723365272c89f94e52e48f)
- [data format - relational csv file (readme example)](https://bl.ocks.org/EE2dev/08d87f3b57e25aa8311e857b8a582575)
- [data format - JSON data from variable](https://bl.ocks.org/EE2dev/c5abbb6eb05564512ebf3b630440c0f7)
- [data format - relational csv file](https://bl.ocks.org/EE2dev/9b1959d2631892656f36d849a614e6ba)
- [data format - relational csv file - 2](https://bl.ocks.org/EE2dev/baf7343706b595ec9e49758ec4ab0437)
- [data format - relational csv data embedded](https://bl.ocks.org/EE2dev/c823a392791797a1a021e3eb268a1502)
- [data format - hierarchical csv file](https://bl.ocks.org/EE2dev/06652de4cf888e2a8bb16c76642ee05f)
- [data format - hierarchical csv file, different key](https://bl.ocks.org/EE2dev/f671f8f70ac355950572a45fa0cde022)
- [data format - hierarchical csv data embedded](https://bl.ocks.org/EE2dev/93fa64a7ad4c1d24a0be845c5c1f5f0b)
- [data format - hierarchical csv data embedded, different key](https://bl.ocks.org/EE2dev/4fadf0f3bac11206ba2185c626a508b7)

#### API examples to customize the links

- [myChart.linkColor()](https://bl.ocks.org/EE2dev/54fe30f1213b216575dcf300ee3ad4c0)
- [myChart.linkColor() - 2](https://bl.ocks.org/EE2dev/c0fd7569102e194013e68855a7bb1076)
- [myChart.linkHeight()](https://bl.ocks.org/EE2dev/d9f2fbc1487b2bf89fd9ccab183c052c)
- [myChart.linkLabel()](https://bl.ocks.org/EE2dev/423d4e8c040bed8d96e9b72e65ae8999)
- [myChart.linkLabel() - 2](https://bl.ocks.org/EE2dev/e17f3e4930eb8b35cce66cf7aa0b462f)
- [myChart.linkLabel() - 3](https://bl.ocks.org/EE2dev/10a3dba82372163a96de6632ca72c7a0)
- [myChart.linkLabel() - 4](https://bl.ocks.org/EE2dev/d9f2fbc1487b2bf89fd9ccab183c052c)
- [myChart.linkLabel() - 5](https://bl.ocks.org/EE2dev/ce4aca1b40c8d73b239909719e8bef86)
- [myChart.linkStrength()](https://bl.ocks.org/EE2dev/813d21f53643acce75c1794141746245)
- [myChart.linkStrength() - 2](https://bl.ocks.org/EE2dev/84e22c8fa7a4b5fb202f7ce6fdb93b6e)
- [myChart.linkStrength() - 3](https://bl.ocks.org/EE2dev/d2cf606e3a86bb268c5016a32f7ec9a7)
- [myChart.linkWidth()](https://bl.ocks.org/EE2dev/d9f2fbc1487b2bf89fd9ccab183c052c)
- [myChart.linkWidth() - 2](https://bl.ocks.org/EE2dev/3896ed6a6e221762355a15fbf7c49832)

#### API examples to customize the nodes

- [myChart.nodeImageFile()](https://bl.ocks.org/EE2dev/d9f2fbc1487b2bf89fd9ccab183c052c)
- [myChart.nodeImageFile() - 2](https://bl.ocks.org/EE2dev/ca01964c928a37de65bd429f8f094a1c)
- [myChart.nodeImageSelection()](https://bl.ocks.org/EE2dev/43fffd334158b6d10454e5b8c6689786)
- [myChart.nodeImageSelection() - 2](https://bl.ocks.org/EE2dev/cd5567cccdecb65d59a6cab1fd6ecab2)
- [myChart.nodeLabelPadding()](https://bl.ocks.org/EE2dev/d9f2fbc1487b2bf89fd9ccab183c052c)
- [myChart.nodeSort()](https://bl.ocks.org/EE2dev/0e65cb00f7a55f9f5944e5f7e6ded08c)
- [myChart.nodeSort() - 2](https://bl.ocks.org/EE2dev/7d866c0fd487fd42402832f9c8d3c6c3)
- [myChart.nodeSort() - 3](https://bl.ocks.org/EE2dev/bacefc18f4e714db1fa7b44f9c5cf677)

#### Other examples

- [custom convertTypes function](https://bl.ocks.org/EE2dev/bacefc18f4e714db1fa7b44f9c5cf677)
- [myChart.alignLeaves()](https://bl.ocks.org/EE2dev/6b2875538761cc8828a62275aea9456d)
- [myChart.defaultColor()](https://bl.ocks.org/EE2dev/530af345027f9bf4e63fe845d7173efa)
- [myChart.formatDefaultLocale()](https://bl.ocks.org/EE2dev/10a3dba82372163a96de6632ca72c7a0)
- [myChart.margin()](https://bl.ocks.org/EE2dev/d9f2fbc1487b2bf89fd9ccab183c052c)
- [myChart.propagateValue()](https://bl.ocks.org/EE2dev/ce4aca1b40c8d73b239909719e8bef86)


## 1. How to use Hierarchy explorer

Here is a minimal template sufficient to call hierarchy explorer. A reference to the data is assigned to the `dataSpec.source` *object property*. 

```html
<!DOCTYPE html>
  <meta charset="utf-8">
  <head>
    <script src="https://d3js.org/d3.v5.min.js"></script>
    <script src="https://cdn.jsdelivr.net/gh/EE2dev/hierarchy-explorer/dist/v10/hierarchyExplorer.min.js"></script>
    <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/gh/EE2dev/hierarchy-explorer/dist/v10/hierarchyExplorer.css">
  </head>
  
  <body>  
    <script>
      const dataSpec = {source: "path/to/data/data.json"};
      const myChart = hierarchyExplorer.chart(dataSpec);
      showChart(); 
      
      function showChart() {
        d3.select("body")
          .append("div")
          .attr("class", "chart")
          .call(myChart);
      }            
    </script>
  </body>
</html>  
```

## 2. Data format
Hierarchical data can be specified in one of the following three data formats. The examples contain the same data in the supported formats.

### 2.1. JSON format
A JSON file format, containing a key field for each node. By default, the key field for each node should have the property name ```"key"```. If the key field has a name other than ```"key"```, the *dataSpec* object has to reference it (see below for the example which has the field ```"name"```as a key). 

```js
{
  "name": "World",
  "children": [
    {
      "name": "Asia",
      "population": 4436,
      "children": [
        {
          "name": "China",
          "population": 1420
        },
        {
          "name": "India",
          "population": 1369
        }
      ]
    },
    {
      "name": "Africa",
      "population": 1216
    },
    {
      "name": "Europe",
      "population": 739
    },
    {
      "name": "North America",
      "population": 579,
      "children": [
        {
          "name": "USA",
          "population": 329
        }
      ]
    },
    {
      "name": "South America",
      "population": 423
    },
    {
      "name": "Oceania",
      "population": 38
    }
  ]
}
```
Then the javascript part would look like:
```js
...
    <script>
      const dataSpec = {
        source: "../data/data1.json",
        key: "name",
      };
      const myChart = hierarchyExplorer.chart(dataSpec);
      ...
``` 

Alternatively, the JSON source can also reference a JSON object which has been created in the javascript part instead of reading it from a file. Then the javascript part would look like:
```js
...
    <script>
      const myJSON = { // make your own JSON here };
      const dataSpec = {
        source: myJSON,
        key: "name",
      };
      const myChart = hierarchyExplorer.chart(dataSpec);
      ...
``` 
### 2.2. CSV (hierarchical) format
A csv file format consisting of one row for each node. Each row contains ```key```as the key in the first column, ```parent``` as its parent key in the second column and the remaning data for each node.  
```
key,parent,population
World,,
Asia,World,4436
China,Asia,1420
India,Asia,1369
Africa,World,1216
Europe,World,739
North America,World,579
USA,North America,329
South America,World,423
Oceania,World,38
```
Then the javascript part would look like:
```js
...
    <script>
      const dataSpec = {
        source: "../data/data3.csv",
      };
      const myChart = hierarchyExplorer.chart(dataSpec);
      ...
``` 
### 2.3. CSV (relational) format
A csv file format consisting of one row for each leaf. Each row contains the keys of each node traversed from the root down to the leaf and the corresponding data for that leaf.
The keys for each level reside in their corresponding columns. The *dataSpec* object has to reference the columns of each level in its top-down traversal order with the property ```hierarchyLevels``` (see below for the example). The first element contains a *string* that is used as the root while the other elements reference column names. It the first element is ```"$"``` then the root node will stay without a node label.

Internally, the separator ```"$"``` is used when the node key is build by concatenating the corresponding columns. If this character is contained in the data, the separator can be changed by specifying the ```separator```property of the *dataSpec* object. The column name ```"__he_name"``` is reserved internally for storing the node label.
```
continent,country,population
Asia,,4436
Asia,China,1420
Asia,India,1369
Africa,,1216
Europe,,739
North America,,579
North America,USA,329
South America,,423
Oceania,,38
```
```js
...
    <script>
      const dataSpec = {
        source: "../data/data2.csv",
        hierarchyLevels: ["World", "continent", "country"],
      };
      const myChart = hierarchyExplorer.chart(dataSpec);
      ...
``` 

### 2.4. Embedding data into a html node
In case you want to run hierarchy explorer without a server, you can put your data into a html node. The format of the data has to be either <a href="#22-csv-hierarchical-format">CSV (hierarchical)</a> or <a href="#23-csv-relational-format">CSV (relational)</a>.
The data source is then referenced in the `dataSpec` object by assigning the `source` property to a *string* denoting the selector to the node with the data.

An example for embedded hierarchical csv data:
```
...
<aside id="data">
key,parent,population
World,,
Asia,World,4436
China,Asia,1420
India,Asia,1369
Africa,World,1216
Europe,World,739
North America,World,579
USA,North America,329
South America,World,423
Oceania,World,38
</aside>
...
```
Then the javascript part would look like:
```js
...
    <script>
      const dataSpec = {
        source: "aside#data",
      };
      const myChart = hierarchyExplorer.chart(dataSpec);
      ...
``` 

An example for embedded relational csv data:
```
...
<aside id="data">
continent,country,population
Asia,,4436
Asia,China,1420
Asia,India,1369
Africa,,1216
Europe,,739
North America,,579
North America,USA,329
South America,,423
Oceania,,38
</aside>
...
```
```js
...
    <script>
      const dataSpec = {
        source: "aside#data",
        hierarchyLevels: ["World", "continent", "country"],
      };
      const myChart = hierarchyExplorer.chart(dataSpec);
      ...
``` 

## 3.0 API reference

The object (named *dataSpec* above) which is passed to the function ```hierarchyExplorer.chart()``` can have the following properties:
* `source`: <i>string</i> containing the path/URL to the data or the selector referencing the DOM element containing the data.
* `hierarchyLevels`: <i>array</i> containing columns of each level in its top-down traversal order when the refered data is in the csv relational format.
* `separator`: <i>string</i> In case the data comes in the csv relational format, the separator is used internally to concatenate columns. The default is "$". If the data contains a "$", the separator has to be changed to another string/character not contained in the data.  
* `delimiter`: <i>string</i> containing the delimiter used in the csv data.
* `convertTypes`: <i>function</i> that converts the data to appropriate types which is relevant for [`myChart.nodeSort()`](#node_nodeSort). If a conversion function is specified, the specified function is invoked for each row, being passed an object representing the current row (d), the index (i) starting at zero for the first non-header row, and the array of column names. 
[Here](https://github.com/d3/d3-dsv#dsv_parse) is more documentation about this callback function.
Alternatively, the <i>string</i> `"none"` can be assigned to `convertTypes` to prevent conversions, then all columns are stored as <i>string</i>. The default is [d3.autoType](https://github.com/d3/d3-dsv#autoType). 

### 3.1 Links

<a name="link_alignLeaves" href="#link_alignLeaves">#</a> <i>myChart</i>.<b>alignLeaves</b>() [<>](https://github.com/ee2dev/hierarchy-explorer/blob/master/src/d3_template_reusable.js#L50 "Source")

Transitions the alignment of the leaves of the hierarchy. If leaves are aligned, all leaves start at the same horizontal position (cluster layout). If ```myChart.linkWidth()``` is set dynamically (by referencing a field), this function has no effect.  
* the first argument is <i>boolean</i> referencing if all leaves are aligned at the same depth (default is ```false```).
* with no argument returns if the leaves are aligned at the same depth.

<a name="link_linkColor" href="#link_linkColor">#</a> <i>myChart</i>.<b>linkColor</b>() [<>](https://github.com/ee2dev/hierarchy-explorer/blob/master/src/d3_template_reusable.js#L50 "Source")

Transitions to the new color of the links. The horizontal link to is denoted by its color.

1. argument:
    * to set the link color dynamically, provide the name of a field as a *string* (default is ```"value"```).
    
2. argument (optional):
    * An *object* with the following properties can be used to further specify the mapping: 
        * `scale` defines the scale used to map the values to the color (default is the identity function ```(value) => value``` assuming the field contains a valid color). This scale callback function is invoked for each instance of the field provided as first argument. 
        * `inherit` refers to the color of the vertical links. In case `inherit` is set to `false` the default color will be used for the vertical links, if `true` the color of the parent is used (default is `true`). 

* with no argument returns the field used for the color.

<a name="link_linkHeight" href="#link_linkHeight">#</a> <i>myChart</i>.<b>linkHeight</b>() [<>](https://github.com/ee2dev/hierarchy-explorer/blob/master/src/d3_template_reusable.js#L50 "Source")

Transitions the height (vertical length) of the links. 
* the first argument is an <i>integer</i> referencing link height in pixels (default is ```20```).
* with no argument returns the height of the links.


<a name="link_linkStrength" href="#link_linkStrength">#</a> <i>myChart</i>.<b>linkStrength</b>() [<>](https://github.com/ee2dev/hierarchy-explorer/blob/master/src/d3_template_reusable.js#L50 "Source")

Transitions to the new strength (thickness) of the links. The horizontal link to and the vertical link from a node is denoting its strength.

1. argument:
    * to statically set all the links to the strength, call this function with an <i>integer</i> argument, which denotes the thickness in pixels (default is ```1```).
    * to set the link strength dynamically, provide the name of a numeric field as a *string*. 
    
2. argument (optional):
    * An *object* with the following properties can be used to further specify the mapping: 
        * `scale` defines the scale used to map the values to the strength (default is `d3.scaleLinear()`).
        * `range` refers to the range of the scale (default is `[1,10]`). 

* No argument:
  * with no argument the function returns the static strength of the links.

<a name="link_linkWidth" href="#link_linkWidth">#</a> <i>myChart</i>.<b>linkWidth</b>() [<>](https://github.com/ee2dev/hierarchy-explorer/blob/master/src/d3_template_reusable.js#L50 "Source")

Transitions to the new width (horizontal length) of the links. The horizontal link to a node is affected by its corresponding value. 

1. argument:
    * to statically set all the links to the width, call this function with an <i>integer</i> argument, which denotes the width in pixels (default is ```30```).
    * to set the link width dynamically, provide the name of a numeric field as a *string*. 
    
2. argument (optional):
    * An *object* with the following properties can be used to further specify the mapping: 
        * `scale` defines the scale used to map the values to the width (default is `d3.scaleLinear()`).
        * `range` refers to the range of the scale (default is `[15, 100]`). 

* No argument:
  * with no argument the function returns the static width of the links.

<a name="link_linkLabel" href="#link_linkLabel">#</a> <i>myChart</i>.<b>linkLabel</b>() [<>](https://github.com/ee2dev/hierarchy-explorer/blob/master/src/d3_template_reusable.js#L50 "Source")

Transitions to the new number label on top of the links. 

1. argument:
    * to set the label dynamically, provide the name of a field as a *string*. The values of the field can be *numeric* or *string*. 
    * to switch the label on or off provide a <i>boolean</i>. 
    
2. argument (optional):
    * An *object* with the following properties can be used to further specify the mapping: 
        * `unit` specifies a suffix *string* for the label (default is `""`).
        * `format` refers to the format *string* of the label number as [the format specifier for d3-format](https://github.com/d3/d3-format#locale_format) [(examples)](http://bl.ocks.org/zanarmstrong/05c1e95bf7aa16c4768e). (default is `",.0f"`). 
        * `locale` is an *object* overriding the default locale format with the specified locale format.
        The locale is affecting the display of the link label if the `format` property is specified. See also <a href="#other_formatDefaultLocale"><i>myChart</i>.<b>formatDefaultLocale</b>()</a>.

        * `onTop` specifies a *boolean* property denoting whether to place the label on top of (and overlaying) the link (`onTop: true`) or to place the label (horizontally) above the label. (default is `true`). If `onTop` is set to false and the label overlaps with the previous link due to increase font size, the *linkHeight* can be increased. 
        * `align` specifies a *boolean* property denoting whether to align the label horizontally, meaning for each depth the labels are right-aligned. Passing ```false``` aligns the label horizontally centered on the link, ```true``` right-aligns the labels of the same depth (centers the longest label per depth on the shortest link). Default is ```true```.
        * `color` is a *function* that sets the color of the link label. This callback function is called for each link by passing an object with its fields to it. (default is `() => "black"`). 

* No argument:
    * with no argument the function returns the name of the numeric field for the link labels.

### 3.2 Nodes

<a name="node_nodeBar" href="#node_nodeBar">#</a> <i>myChart</i>.<b>nodeBar</b>() [<>](https://github.com/ee2dev/hierarchy-explorer/blob/master/src/d3_template_reusable.js#L50 "Source")

Displays/ transitions the bar for each node to the new value. 
1. argument:
    * to set the node bar dynamically, provide the name of a field as a *string*. The values of the field must be *numeric*. 
    * to switch the node bars on or off provide a <i>boolean</i>. 
    
2. argument (optional):
    * An *object* with the following properties can be used to further specify the mapping:
        * `rootBar` specifies a *boolean* property denoting whether a node bar is displayed for the root node bar. (default is `false`). This has to be set with the initial call of <i>myChart</i>.<b>nodeBar</b>() and does not transition.
        * `label` specifies the *string* field name for the node bar label (default is the field which is specified as the first argument and used for drawing the bars).
        * `labelInside` specifies a *boolean* property denoting whether to place the label inside the bars (`labelInside: true`) or next to the bar (default is `false`). 
        * `unit` specifies a suffix *string* for the node bar label (default is `""`).
        * `format` refers to the format *string* of the node bar label number as [the format specifier for d3-format](https://github.com/d3/d3-format#locale_format) [(examples)](http://bl.ocks.org/zanarmstrong/05c1e95bf7aa16c4768e). (default is `",.0f"`). 
        * `locale` is an *object* overriding the default locale format with the specified locale format.
        The locale is affecting the display of the link label if the `format` property is specified. See also <a href="#other_formatDefaultLocale"><i>myChart</i>.<b>formatDefaultLocale</b>()</a>.
        * `textFill` is a *function* that sets the color of the node bar label. This callback function is called for each node by passing an object with its fields to it. (default is its (=`.node .nodeLabel`) static CSS property which is `black`). 
        * `rectFill` is a *function* that sets the fill color of the node bar. This callback function is called for each node by passing an object with its fields to it. (default is its ( for values >= 0: `.node .node-bar-positive`, for values <0: `.node .node-bar-negative`) static CSS property which is `steelblue`, and `darkorange`, respectively). 
        * `rectStroke` is a *function* that sets the stroke color of the node bar. This callback function is called for each node by passing an object with its fields to it. (default is its (=`.node .node-bar`) static CSS property which is `grey`). 
        * `scale` is a *function* defining the scale used to map the values to the node bar width (default is `d3.scaleLinear()`).
        * `domain` is an *array* refering to the domain of the scale (default is calculated based on the extent of the corresponding field values).
        * `range` is an *array* refering to the range of the scale (default is `[0, 200]`). In case the domain contains positive and negative values, the range is used separately but scaled correspondingly for positive and negative values to compute the width of their node bars.
        * `updateScale` specifies a *boolean* property denoting whether the current scale should be reused for a transition. (default is `true`).         

* No argument:
    * with no argument the function returns the name of the numeric field for the node bars.

<a name="node_nodeImageFile" href="#node_nodeImageFile">#</a> <i>myChart</i>.<b>nodeImageFile</b>() [<>](https://github.com/ee2dev/hierarchy-explorer/blob/master/src/d3_template_reusable.js#L50 "Source")

Sets the node images based on an image file.  
1. argument:
    * a callback *function* which returns for each selected node a *URL* to the image to be used for this node.
    The function is evaluated for each selected element, in order, being passed the current datum (d), the current index (i), and the current group (nodes), with this as the current DOM element (nodes[i]). 
    E.g. with the current datum (d) the *URL* can be read from a field attached to each node. 
    * alternatively, a *string* denoting the *URL* to an image to be used for each node. 

2. argument: (optional):
    * An *object* with the following properties can be used to further specify the mapping: 
        * `width` specifies the width of the image (default is `10`).
        * `height` specifies the height of the image (default is `10`).
        * `setBackground` determines if the background under the image should be fill with the background color first (e.g. in case the image has a transparant background) (default is `false`).

With no arguments returns the callback *function* for the node images.

<a name="node_nodeImageSelection" href="#node_nodeImageSelection">#</a> <i>myChart</i>.<b>nodeImageSelection</b>() [<>](https://github.com/ee2dev/hierarchy-explorer/blob/master/src/d3_template_reusable.js#L50 "Source")

Sets the node images based on a selection.  
1. argument:
    * a callback *function*, which is called with a selection as an argument containing all newly entered `g.node`'s. The function is evaluated for each selected element, in order, being passed the current datum (d), the current index (i), and the current group (nodes), with this as the current DOM element (nodes[i]). 
    * the callback function is expected to append to each node a graphical element as the node image. To enter a different image based on the node being expandable or not, the attached datum `d._children` can be used. 
    * if the first argument is *boolean* `false` no node image is shown.   

2. argument: (optional)
    * a callback *function*, which is called with a selection as an argument containing all newly updated `g.node`'s. 
    * the callback function is expected to update the graphical element as the node image for each node. The update function should be provided if a different node image based on the node being expandable or not is provided. 

With no arguments returns the callback *function* for all newly entered `g.node`'s.

<a name="node_nodeLabelLength" href="#node_nodeLabelLength">#</a> <i>myChart</i>.<b>nodeLabelLength</b>() [<>](https://github.com/ee2dev/hierarchy-explorer/blob/master/src/d3_template_reusable.js#L50 "Source")

Sets the maximum number of characters displayed as node label. All remaining characters are truncated and displayed as ```...```.  
* the first argument is an <i>integer</i> referencing the maximum number of characters display as node label (default is ```50```).
* with no argument returns the maximum number of characters displayed as node label.


<a name="node_nodeLabelPadding" href="#node_nodeLabelPadding">#</a> <i>myChart</i>.<b>nodeLabelPadding</b>() [<>](https://github.com/ee2dev/hierarchy-explorer/blob/master/src/d3_template_reusable.js#L50 "Source")

Adjusts the left-alignment of the node label. 
* the first argument is an <i>integer</i> referencing the number of pixels padded left to the start of the node label (default is ```10```).
* with no argument returns the number of pixels padded left to the start of the node label.

<a name="node_nodeSort" href="#node_nodeSort">#</a> <i>myChart</i>.<b>nodeSort</b>() [<>](https://github.com/ee2dev/hierarchy-explorer/blob/master/src/d3_template_reusable.js#L50 "Source")

Sorts the nodes of the tree. The type conversion specified in [`dataSpec.convertTypes`](#30-api-reference) determines how the order is applied. 
1. argument:
    *  A *string* denoting the name of a field based on which the nodes should be sorted.

2. argument: (optional):
    * An *object* with the following properties can be used to further specify the sorting: 
        * `ascending` (*boolean*) specifies whether the order should be ascending or descending (default is `false`).
        * `sortByHeight` (*boolean*) specifies whether the order should be determined by the height of the nodes first (default is `false`).

With no arguments returns the name of the field based on which the nodes are sorted.

### 3.3 Other API calls
<a name="other_debugOn" href="#other_debugOn">#</a> <i>myChart</i>.<b>debugOn</b>() [<>](https://github.com/ee2dev/hierarchy-explorer/blob/master/src/d3_template_reusable.js#L50 "Source")

Enables/disables debugging info on the console. 
* the first argument is <i>boolean</i> and references if the debug option is enabled (default is ```false```).
* with no argument returns the boolean value indicating if the debug option is enabled.

<a name="other_defaultColor" href="#other_defaultColor">#</a> <i>myChart</i>.<b>defaultColor</b>() [<>](https://github.com/ee2dev/hierarchy-explorer/blob/master/src/d3_template_reusable.js#L50 "Source")

Sets the default color for the links and nodes. 
* the first argument is a <i>string</i> referencing the color (default is ```"grey"```).
* with no argument returns the default color.

<a name="other_formatDefaultLocale" href="#other_formatDefaultLocale">#</a> <i>myChart</i>.<b>formatDefaultLocale</b>() [<>](https://github.com/ee2dev/hierarchy-explorer/blob/master/src/d3_template_reusable.js#L50 "Source")

Overrides the default locale format with the specified locale format. The locale is affecting the display of the values (e.g link label) if its `format` property is specified.
* the first argument is an <i>object</i> referencing the locale format. E.g. the object for the German Locale would be (as a shortcut you can also pass the <i>string</i>```"DE"```):
```
{
  "decimal": ",",
  "thousands": ".",
  "grouping": [3],
  "currency": ["", " €"]
}
```

<a name="other_margin" href="#other_margin">#</a> <i>myChart</i>.<b>margin</b>() [<>](https://github.com/ee2dev/hierarchy-explorer/blob/master/src/d3_template_reusable.js#L50 "Source")

Sets the margins for the SVG. 
* the first argument is an <i>object</i> referencing the four dimensions of the margin (default is ```{top: 20, right: 10, bottom: 20, left: 10}```).
* with no argument returns the default margin.

<a name="other_propagateValue" href="#other_propagateValue">#</a> <i>myChart</i>.<b>propagateValue</b>() [<>](https://github.com/ee2dev/hierarchy-explorer/blob/master/src/d3_template_reusable.js#L50 "Source")

Propagates a field (which may be just filled in the leaves) throughout all the nodes by summing up the values bottom up.
* the first argument is a <i>string</i> referencing a field to be propagated (default is ```"value"```).
* with no argument returns if a field is propagated and its name.

<a name="other_svgDimensions" href="#other_svgDimensions">#</a> <i>myChart</i>.<b>svgDimensions</b>() [<>](https://github.com/ee2dev/hierarchy-explorer/blob/master/src/d3_template_reusable.js#L50 "Source")

Sets the dimensions for the SVG. 
* the first argument is an <i>object</i> referencing the dimensions of the SVG (default is ```{width: 1400, height: 800}```).
* with no argument returns the default SVG dimensions.

<a name="other_transitionDuration" href="#other_transitionDuration">#</a> <i>myChart</i>.<b>transitionDuration</b>() [<>](https://github.com/ee2dev/hierarchy-explorer/blob/master/src/d3_template_reusable.js#L50 "Source")

Sets the transition duration for the transitions.
* the first argument is an <i>integer</i> referencing the duration of a transition in milliseconds (default is ```750```).
* with no argument returns the transition duration for the transitions.

### 3.3 CSS styling
```css
  /* changing the font size for link labels and node labels */
  div.chart {
    font-size: 14px;
  } 

  /* changing the font size for node labels */
  .node .nodeLabel {
    font: 1em sans-serif;
  }

  /* changing the color of the node labels */
  .node .nodeLabel {
    fill: black;
  }

  /* changing the color of the nodeImage (from default selection) */
  .node .nodeImage {
    stroke: green;
  }

  /* changing the size of the outline for link labels */
  .link text.label.ontop {
    stroke-width: 5px;
  }   

  /* setting the stroke of the node bar */
  .node .node-bar {
    stroke: grey;
  }

  /* setting the fill of the node bar for positive values */
  .node .node-bar-positive {
    fill: steelblue;
  }

  /* setting the style of the node bar labels */  
  .node .bar-label {
    stroke: none;
    fill: black;
    font: 0.8em sans-serif;
  }
```

## 4. License  
This code is released under the [BSD license](https://github.com/EE2dev/hierarchy-explorer//blob/master/LICENSE).




