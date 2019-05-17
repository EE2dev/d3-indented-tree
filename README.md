# Hierarchy explorer 

Visualizing a hierarchy with an expandable/collapsable tree.

### Credits
This approach is based on [this bl.ock from Mike Bostock](https://bl.ocks.org/mbostock/1093025) and [this codepen by Brendan Dougan](https://codepen.io/brendandougan/pen/PpEzRp) and is implemented with [d3-template](https://github.com/EE2dev/d3-template) as a reusable d3 chart.

## Examples

More examples demonstrating specific API calls:
## 1. How to use Hierarchy explorer

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
      const myChart = reusableChart.chart(dataSpec);
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
      const myChart = reusableChart.chart(dataSpec);
      ...
``` 
### 2.3. CSV (relational) format
A csv file format consisting of one row for each node. Each row contains the keys of each node traversed from the root down to the specific node and the corresponding data for that node.
The keys for each level reside in their corresponding columns. The *dataSpec* object has to reference the columns of each level in its top-down traversal order with the property ```hierarchyLevels```  (see below for the example). 

```
all,continent,country,population
World,Asia,,4436
World,Asia,China,1420
World,Asia,India,1369
World,Africa,,1216
World,Europe,,739
World,North America,,579
World,North America,USA,329
World,South America,,423
World,Oceania,,38
```
```js
...
    <script>
      const dataSpec = {
        source: "../data/data2.csv",
        hierarchyLevels: ["all", "continent", "country"],
      };
      const myChart = reusableChart.chart(dataSpec);
      ...
``` 

### 2.4. Embedding data into a html node
In case you want to run hierarchy explorer without a server, you can put your data into a html node. The format of the data hase to be either <a href="#22-csv-hierarchical-format">CSV (hierarchical)</a> or <a href="#23-csv-relational-format">CSV (relational)</a>.
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
      const myChart = reusableChart.chart(dataSpec);
      ...
``` 

An example for embedded relational csv data:
```
...
<aside id="data">
all,continent,country,population
World,Asia,,4436
World,Asia,China,1420
World,Asia,India,1369
World,Africa,,1216
World,Europe,,739
World,North America,,579
World,North America,USA,329
World,South America,,423
World,Oceania,,38
</aside>
...
```
```js
...
    <script>
      const dataSpec = {
        source: "aside#data",
        hierarchyLevels: ["all", "continent", "country"],
      };
      const myChart = reusableChart.chart(dataSpec);
      ...
``` 

## 3.0 API reference

### 3.1 Links
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
    * to set the label dynamically, provide the name of a numeric field as a *string*. 
    * to switch the label on or off provide a <i>boolean</i>. 
    
2. argument (optional):
    * An *object* with the following properties can be used to further specify the mapping: 
        * `unit` specifies a suffix *string* for the label (default is `""`).
        * `format` refers to the format *string* of the label number as [the format specifier for d3-format](https://github.com/d3/d3-format#locale_format) [(examples)](http://bl.ocks.org/zanarmstrong/05c1e95bf7aa16c4768e). (default is `",.0f"`). 
        * `locale` is an *object* overriding the default locale format with the specified locale format. See also <a href="#other_formatDefaultLocale"><i>myChart</i>.<b>formatDefaultLocale</b>()</a>.

        * `onTop` specifies a *boolean* property denoting whether to place the label on top of (and overlaying) the link (`onTop: true`) or to place the label (horizontally) above the label. (default is `true`).
        * `align` specifies a *boolean* property denoting whether to align the label horizontally, meaning for each depth the labels are right-aligned. Passing ```false``` aligns the label horizontally centered on the link, ```true``` right-aligns the labels of the same depth. Default is ```true```.
        * `color` is a *function* that sets the color of the link label. This callback function is called for each link by passing an object with its fields to it. (default is `() => "black"`). 

* No argument:
    * with no argument the function returns the name of the numeric field for the link labels.

<a name="link_linkColor" href="#link_linkColor">#</a> <i>myChart</i>.<b>linkColor</b>() [<>](https://github.com/ee2dev/hierarchy-explorer/blob/master/src/d3_template_reusable.js#L50 "Source")

Transitions to the new color of the links. The horizontal link to and the vertical link from a node is denoted by its color.
* to set the link color statically, use instead <a href="#other_defaultColor"><i>myChart</i>.<b>defaultColor</b>()</a>
* to set the link color dynamically, provide the name of a field (default is ```"value"``` after the first call). In addition to the field name, an optional second argument can be used to further specify the mapping. The second argument refers to a scale *function* used to map the values to the color (default is the identity function ```(value) => value``` assuming the field contains a valid color). This scale callback function is invoked for each instance of the field provided as first argument.  
* with no argument returns the field used for the color.

<a name="link_linkHeight" href="#link_linkHeight">#</a> <i>myChart</i>.<b>linkHeight</b>() [<>](https://github.com/ee2dev/hierarchy-explorer/blob/master/src/d3_template_reusable.js#L50 "Source")

Transitions the height (vertical length) of the links. 
* the first argument is an <i>integer</i> referencing link height in pixels (default is ```20```).
* with no argument returns the height of the links.

<a name="link_alignLeaves" href="#link_alignLeaves">#</a> <i>myChart</i>.<b>alignLeaves</b>() [<>](https://github.com/ee2dev/hierarchy-explorer/blob/master/src/d3_template_reusable.js#L50 "Source")

Transitions the alignment of the leaves of the hierarchy. If leaves are aligned, all leaves start at the same horizontal position (cluster layout). If ```myChart.linkWidth()``` is set dynamically (by referencing a field), this function has no effect.  
* the first argument is <i>boolean</i> referencing if all leaves are aligned at the same depth (default is ```false```).
* with no argument returns if the leaves are aligned at the same depth.

### 3.2 Nodes

### 3.3 Other
<a name="other_debugOn" href="#other_debugOn">#</a> <i>myChart</i>.<b>debugOn</b>() [<>](https://github.com/ee2dev/hierarchy-explorer/blob/master/src/d3_template_reusable.js#L50 "Source")

Enables/disables debugging info on the console. 
* the first argument is <i>boolean</i> and references if the debug option is enabled (default is ```false```).
* with no argument returns the boolean value indicating if the debug option is enabled.

<a name="other_defaultColor" href="#other_defaultColor">#</a> <i>myChart</i>.<b>defaultColor</b>() [<>](https://github.com/ee2dev/hierarchy-explorer/blob/master/src/d3_template_reusable.js#L50 "Source")

Sets the default color for the links and nodes. 
* the first argument is a <i>string</i> referencing the color (default is ```"grey"```).
* with no argument returns the default color.

<a name="other_margin" href="#other_margin">#</a> <i>myChart</i>.<b>margin</b>() [<>](https://github.com/ee2dev/hierarchy-explorer/blob/master/src/d3_template_reusable.js#L50 "Source")

Sets the margins for the SVG. 
* the first argument is an <i>object</i> referencing the four dimensions of the margin (default is ```{top: 20, right: 10, bottom: 20, left: 10}```).
* with no argument returns the default margin.

<a name="other_svgDimensions" href="#other_svgDimensions">#</a> <i>myChart</i>.<b>svgDimensions</b>() [<>](https://github.com/ee2dev/hierarchy-explorer/blob/master/src/d3_template_reusable.js#L50 "Source")

Sets the dimensions for the SVG. 
* the first argument is an <i>object</i> referencing the dimensions of the SVG (default is ```{width: 1400, height: 800}```).
* with no argument returns the default SVG dimensions.

<a name="other_maxNameLength" href="#other_maxNameLength">#</a> <i>myChart</i>.<b>maxNameLength</b>() [<>](https://github.com/ee2dev/hierarchy-explorer/blob/master/src/d3_template_reusable.js#L50 "Source")

Sets the maximum number of characters displayed as node label. All remaining characters are truncated and displayed as ```...```.  
* the first argument is an <i>integer</i> referencing the maximum number of characters display as node label (default is ```50```).
* with no argument returns the maximum number of characters displayed as node label.

<a name="other_transitionDuration" href="#other_transitionDuration">#</a> <i>myChart</i>.<b>transitionDuration</b>() [<>](https://github.com/ee2dev/hierarchy-explorer/blob/master/src/d3_template_reusable.js#L50 "Source")

Sets the transition duration for the transitions.
* the first argument is an <i>integer</i> referencing the duration of a transition in milliseconds (default is ```750```).
* with no argument returns the transition duration for the transitions.

<a name="other_propagateValue" href="#other_propagateValue">#</a> <i>myChart</i>.<b>propagateValue</b>() [<>](https://github.com/ee2dev/hierarchy-explorer/blob/master/src/d3_template_reusable.js#L50 "Source")

Propagates a field (which may be just filled in the leaves) throughout all the nodes by summing up the values bottom up.
* the first argument is a <i>string</i> referencing a field to be propagated (default is ```"value"```).
* with no argument returns if a field is propagated and its name.

<a name="other_formatDefaultLocale" href="#other_formatDefaultLocale">#</a> <i>myChart</i>.<b>formatDefaultLocale</b>() [<>](https://github.com/ee2dev/hierarchy-explorer/blob/master/src/d3_template_reusable.js#L50 "Source")

Overrides the default locale format with the specified locale format 
* the first argument is an <i>object</i> referencing the locale format. E.g. the object for the German Locale would be (as a shortcut you can also pass the <i>string</i>```"DE"```):
```
{
  "decimal": ",",
  "thousands": ".",
  "grouping": [3],
  "currency": ["", " €"]
}
```


## 4. License  
This code is released under the [BSD license](https://github.com/EE2dev/hierarchy-explorer//blob/master/LICENSE).






