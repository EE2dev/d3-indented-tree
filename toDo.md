## to do
[ok] convert tree to reusable
[ok] read json file
[ok] linkStrength function or number
[ok] put d3.hierarchy (in vis to data processing)
[ok] dynamic linkWidth
[ok] add csv flat embedded
[ok] fixed bug: dynamic width/strength of link
[ok] (defaultColor after linkColor is set to reset)

[bug] linkColor set with "value"
[bug] linkStrength dynamic example
* linkLabel add group transform to links
* linkLabel: group text elements and create two text elements (one 2px larger in the back)
* linkLabel: allow text to be put on top of link
* linkLabel: adjust width to minimum Width
* linkLabel: right-align text-anchor:end text after finding the largest numbers
* linkLabel: textTween replace ,(.) based on locale
* add linkLabelColor
* readme linklabel

* link.call(function (sel) {positionPath(sel, options)}) --> positionPath -> d attr and transform
* linkColor: Implementierung Gradient: 1) iterate through node and add all different parent-son color combinations to set
* linkColor: 2) create gradients for these combinations (10% offset)

* check updateable function with collapsed nodes
* selection.each() ?
* offer shape-rendering crispEdges and auto

* support csv file and inline csv file
* check is more updatable functions are necessary 

* -bug- : partially collapsed tree doesn't work with myChart.linkWidth("value", d3.scaleLog(), [20, 100]), text: 'myChart.linkWidth("value, d3.scaleLog(), [20, 100]")'});
* change global links to always reflect https
* propagate for both csv files
* all nodes with square + cross when collapsed
* -| when expanded
* readme: propagateValue -> if default -> value. data field value cannot be used!
* square when leaf
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