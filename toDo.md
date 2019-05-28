## to do
[ok] convert tree to reusable
[ok] read json file
[ok] linkStrength function or number
[ok] put d3.hierarchy (in vis to data processing)
[ok] dynamic linkWidth
[ok] add csv flat embedded
[ok] fixed bug: dynamic width/strength of link
[ok] (defaultColor after linkColor is set to reset)
[ok] linkColor set with "value"
[ok] linkStrength dynamic example
[ok] linkWidth / linkStrength with "weight" in linkLabel2.html
[bug] : partially collapsed tree doesn't work with myChart.linkWidth("value", d3.scaleLog(), [20, 100]), text: 'myChart.linkWidth("value, d3.scaleLog(), [20, 100]")'});
[ok] remove .value if cases
[ok] adjust API function
[ok] update docu (default field ok - propagation)
[ok] add linkLabelColor (static or function (e.g. value < 0 red otherwise green))
[ok] readme linkLabelColor
[ok] linkLabel: API to change defaultLocale and offer shortcut to German locale replace ,(.) based on locale https://bl.ocks.org/mbostock/7004f92cac972edef365
https://gitlab.com/snippets/1703535
[ok] linkLabel: doubletext: https://stackoverflow.com/questions/442164/how-to-get-an-outline-effect-on-text-in-svg
[ok] linkLabel: right-align text-anchor:end text per depth after finding the largest numbers
[ok] linkLabel: allow text to be put on top of link (add css with different class for that)
[ok] csv files: other fileds are not copied to d.data
[ok] optional alignment of link label (horizontally)
[ok] docu data format
[ok] alignLevaes(false) in test-showcase_g.html leads to thicker links

[bug] test error for test_showcase_g.html
* test linkLabel with just text
* readme minimum code snippet
* readme paragraph for hierarchyExplorer call
* move new build (hierarchyExplorer to dist/ update block)

* html template with all option properties
* change function arguments to objects -> https://stackoverflow.com/questions/12826977/multiple-arguments-vs-options-object
* update examples
* link.js _> change dims = [undefined] to = []
* readme no webserver
* change directories to build and lib and test

* linkLabel add group transform to links
* linkLabel: group text elements and create two text elements (one 2px larger in the back)
* linkLabel: adjust width to minimum Width

[ok] readme linklabel

* link.call(function (sel) {positionPath(sel, options)})  --> positionPath -> d attr and transform
* linkColor: Implementierung Gradient: 1) iterate through node and add all different parent-son color combinations to set
* linkColor: 2) create gradients for these combinations (10% offset)

* switch to crispEdges after transition is finished. (and switch back before next transition starts)
* document CSS
* check updateable function with collapsed nodes
* selection.each() ?
* offer shape-rendering crispEdges and auto

* implement themes (dark with glow effect)


* support csv file and inline csv file
* check is more updatable functions are necessary 

* change global links to always reflect https
* propagate for both csv files
* all nodes with square + cross when collapsed
* -| when expanded
* readme: propagateValue -> if default -> value. data field value cannot be used!
* square when leaf
* nodes: load svg externally https://bl.ocks.org/HarryStevens/c2c877a7e8e6bcd33a0fc1b21b31cbdf
* nodes: load canvas externally http://bl.ocks.org/boeric/aa80b0048b7e39dd71c8fbe958d1b1d4
https://observablehq.com/@mootari/embed-canvas-into-svg
http://www.svgopen.org/2009/papers/12-Using_Canvas_in_SVG/
* calculate size of SVG dynamically
* adjust font-size dynamically and based on em
* provide API to set font size
* API call to initiate tree with collapsed nodes [node2, node7] --> collapse
* API calls to collapse and expand
* create nodes from names as ids and from separate ids if names are ambiguuous
* updateFunction for maxNameLength
* tree with no interior nodes + text on top of nodes (not leaves)
* then: LinkWidth based on longest Text/2 per depth
* to center text on link (function (number, format, unit): https://stackoverflow.com/questions/54859521/how-can-i-center-the-text-in-a-node/54902423#54902423

* color
* thickness
* zoom
* mouseover -> tooltip (with little diagram)
* tooltip based on attributes from data
* additional info (quatity) right aligned, title, colored bar on top optionally, moveover -> set opacity 0.9 for other nodes/links
* allow graphics before text for each node
* option: save as pgn/svg in function call to add buttons
* change data input to just object

[improvements]
* enforce constraints:
  - linkStrength < nodeWidth/Height
  - linkLabel < linkWidth
  - linkLabel < linkHeight
  - ...
* better sepearation of what updates and what not. -> see sections in myChart.js update vs enter
* not updatable
  - defaultLocale -> linkLabel
  - ...

[compatibility] String.endsWith
[compatibility] d3.fetch vs XHR d3v5 vs d3v4
[compatibility] linkLabel doubleText
