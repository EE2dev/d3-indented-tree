# Hierarchy explorer 

Visualizing a hierarchy with an expandable/collapsable tree.

### Credits
This approach is based on [this bl.ock from Mike Bostock](https://bl.ocks.org/mbostock/1093025) and [this codepen by Brendan Dougan](https://codepen.io/brendandougan/pen/PpEzRp) and is implemented with [d3-template](https://github.com/EE2dev/d3-template) as a reusable d3 chart.

## Examples

## 1. How to use Hierarchy explorer

## 2. Data format
This approach is based on [this bl.ock from Mike Bostock](https://bl.ocks.org/mbostock/1093025) and [this codepen by Brendan Dougan](https://codepen.io/brendandougan/pen/PpEzRp) and is implemented with [d3-template](https://github.com/EE2dev/d3-template) as a reusable d3 chart.

## 3.0 API reference

### 3.1 Links
<a name="link_linkStrength" href="#link_linkStrength">#</a> <i>myChart</i>.<b>linkStrength</b>() [<>](https://github.com/ee2dev/hierarchy-explorer/blob/master/src/d3_template_reusable.js#L50 "Source")

Transitions to the new strength (thickness) of the links. The horizontal link to and the vertical link from a node is denoting its strength.
* to statically set all the links to the strength, call this function with an <i>integer</i> argument, which denotes the thickness in pixels (default is ```1```).
* to set the link strength dynamically, provide the name of a numeric field (default is ```"value"```). The field "value" references the propagated field. In addition to the field name, two optional second argument can be used to further specify the mapping. The second argument refers to a scale used to map the values to the strength (default is ```d3.scaleLinear()```). The third argument refers to the range of the scale (default is ```[1,10]```). 
* with no parameter returns the static strength of the links.

<a name="link_linkWidth" href="#link_linkWidth">#</a> <i>myChart</i>.<b>linkWidth</b>() [<>](https://github.com/ee2dev/hierarchy-explorer/blob/master/src/d3_template_reusable.js#L50 "Source")

Transitions to the new width (horizontal length) of the links. The horizontal link to a node is affected by its corresponding value. 
* to statically set all the links to the width, call this function with an <i>integer</i> argument, which denotes the width in pixels (default is ```30```).
* to set the link width dynamically, provide the name of a numeric field (default is ```"value"```). The field "value" references the propagated field. In addition to the field name, two optional second argument can be used to further specify the mapping. The second argument refers to a scale used to map the values to the width (default is ```d3.scaleLinear()```). The third argument refers to the range of the scale (default is ```[15,100]```). 
* with no parameter returns the static width of the links.

<a name="link_linkLabel" href="#link_linkLabel">#</a> <i>myChart</i>.<b>linkLabel</b>() [<>](https://github.com/ee2dev/hierarchy-explorer/blob/master/src/d3_template_reusable.js#L50 "Source")

Transitions to the new label on top of the links. 
TO DO

<a name="link_linkColor" href="#link_linkColor">#</a> <i>myChart</i>.<b>linkColor</b>() [<>](https://github.com/ee2dev/hierarchy-explorer/blob/master/src/d3_template_reusable.js#L50 "Source")

Transitions to the new color of the links. The horizontal link to and the vertical link from a node is denoted by its color.
* to set the link color statically, use instead <a href="#other_defaultColor"><i>myChart</i>.<b>defaultColor</b>()</a>
* to set the link color dynamically, provide the name of a field (default is ```"value"``` after the first call). In addition to the field name, an optional second argument can be used to further specify the mapping. The second argument refers to a scale used to map the values to the width (default is the identity function ```(value) => value``` assuming the field contains a valid color). 
* with no parameter returns the field used for the color.

<a name="link_linkHeight" href="#link_linkHeight">#</a> <i>myChart</i>.<b>linkHeight</b>() [<>](https://github.com/ee2dev/hierarchy-explorer/blob/master/src/d3_template_reusable.js#L50 "Source")

Sets the height (vertical length) of the links. 
* the first argument is an <i>integer</i> referencing link height in pixels (default is ```20```).
* with no parameter returns the height of the links.

<a name="link_alignLeaves" href="#link_alignLeaves">#</a> <i>myChart</i>.<b>alignLeaves</b>() [<>](https://github.com/ee2dev/hierarchy-explorer/blob/master/src/d3_template_reusable.js#L50 "Source")

Sets the alignment of the leaves of the hierarchy. If leaves are aligned, all leaves start at the same horizontal position (cluster layout).  
* the first argument is <i>boolean</i> referencing if all leaves are aligned at the same depth (default is ```false```).
* with no parameter returns if the leaves are aligned at the same depth.

### 3.2 Nodes

### 3.3 Other
<a name="other_debugOn" href="#other_debugOn">#</a> <i>myChart</i>.<b>debugOn</b>() [<>](https://github.com/ee2dev/hierarchy-explorer/blob/master/src/d3_template_reusable.js#L50 "Source")

Enables/disables debugging info on the console. 
* the first argument is <i>boolean</i> and references if the debug option is enabled (default is ```false```).
* with no parameter returns the boolean value indicating if the debug option is enabled.

<a name="other_defaultColor" href="#other_defaultColor">#</a> <i>myChart</i>.<b>defaultColor</b>() [<>](https://github.com/ee2dev/hierarchy-explorer/blob/master/src/d3_template_reusable.js#L50 "Source")

Sets the default color for the links and nodes. 
* the first argument is a <i>string</i> referencing the color (default is ```"grey"```).
* with no parameter returns the default color.

<a name="other_margin" href="#other_margin">#</a> <i>myChart</i>.<b>margin</b>() [<>](https://github.com/ee2dev/hierarchy-explorer/blob/master/src/d3_template_reusable.js#L50 "Source")

Sets the margins for the SVG. 
* the first argument is an <i>object</i> referencing the four dimensions of the margin (default is ```{top: 20, right: 10, bottom: 20, left: 10}```).
* with no parameter returns the default margin.

<a name="other_maxNameLength" href="#other_maxNameLength">#</a> <i>myChart</i>.<b>maxNameLength</b>() [<>](https://github.com/ee2dev/hierarchy-explorer/blob/master/src/d3_template_reusable.js#L50 "Source")

Sets the maximum number of characters displayed as node label. All remaining characters are truncated and displayed as ```...```.  
* the first argument is an <i>integer</i> referencing the maximum number of characters display as node label (default is ```50```).
* with no parameter returns the maximum number of characters displayed as node label.

<a name="other_transitionDuration" href="#other_transitionDuration">#</a> <i>myChart</i>.<b>transitionDuration</b>() [<>](https://github.com/ee2dev/hierarchy-explorer/blob/master/src/d3_template_reusable.js#L50 "Source")

Sets the transition duration for the transitions.
* the first argument is an <i>integer</i> referencing the duration of a transition in milliseconds (default is ```750```).
* with no parameter returns the transition duration for the transitions.

<a name="other_propagateValue" href="#other_propagateValue">#</a> <i>myChart</i>.<b>propagateValue</b>() [<>](https://github.com/ee2dev/hierarchy-explorer/blob/master/src/d3_template_reusable.js#L50 "Source")

Propagates a field (which may be just filled in the leaves) throughout all the nodes by summing up the values bottom up. The resulting field is named ```"value``` and is attached to all nodes. 
* the first argument is a <i>string</i> referencing a field to be propagated (default is ```"value"```).
* with no parameter returns if a field is propagated and its name.

## 4. License  
This code is released under the [BSD license](https://github.com/EE2dev/hierarchy-explorer//blob/master/LICENSE).






