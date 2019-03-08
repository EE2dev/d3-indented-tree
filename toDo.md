## to do
[ok] convert tree to reusable
[ok] read json file
[ok] linkStrength function or number
[ok] put d3.hierarchy (in vis to data processing)
[ok] dynamic linkWidth
* check updateable function with collapsed nodes
* selection.each() ?
* support csv file and inline csv file
[ok] add csv flat embedded
* -bug- : partially collapsed tree doesn't work with myChart.linkWidth("value", d3.scaleLog(), [20, 100]), text: 'myChart.linkWidth("value, d3.scaleLog(), [20, 100]")'});
* change global links to always reflect https
* propagate for both csv files
* all nodes with square + cross when collapsed
* -| when expanded
* square when leaf
* calculate size of SVG dynamically
* API call to initiate tree with collapsed nodes [node2, node7] --> collapse
* create nodes from names as ids and from separate ids if names are ambiguuous
* updateFunction for maxNameLength
* tree with no interior nodes + text on top of nodes (not leaves)
* then: LinkWidth based on longest Text/2 per depth
* to center text on link (function (number, format, unit): https://stackoverflow.com/questions/54859521/how-can-i-center-the-text-in-a-node/54902423#54902423

* color
* thickness
* zoom
* mouseover -> tooltip (with little diagram)
* additional info (quatity) right aligned, title, colored bar on top optionally, moveover -> set opacity 0.9 for other nodes/links
* allow graphics before text for each node
* option: save as pgn/svg in function call to add buttons
* change data input to just object