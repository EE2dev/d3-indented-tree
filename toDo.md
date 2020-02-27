## to do

[bug] : partially collapsed tree doesn't work with myChart.linkWidth("value", d3.scaleLog(), [20, 100]), text: 'myChart.linkWidth("value, d3.scaleLog(), [20, 100]")'});
[bug] sometimes link Label moved to left
[bug] chainedTransitions -> fill nodesAPI.getNodeBarRectFill gets called to change to wrong color
--> nodeSort can be chained after linkLabel/nodeBar.tween without jump and if nodeSort is called before not after

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
[ok] test error for test_showcase_g.html
[ok] doku for nodeLabelPadding
[ok] switch maxNameLength to nodeLabelLength + readme 8switch to node section
[ok] add readme for neodeImageFile
[ok] sort readme functions
[ok] add json data from script directly
[ok] linkLabel with just string data from field
[ok] test nodeImage with URLs from data (test collapsable)
[ok] nodeImageFile: option to first fill with background color
[ok] new svg nodes with rectangles, see also https://bl.ocks.org/jfsiii/7772281
[ok] if you click very fast twice on node to expand collapse :Cannot read property 'posXCenter' of undefined
    at SVGTextElement.linksAPI.getLinkTextPositionX (hierarchyExplorer.js:327)
[ok] Linkcolor options: are with path.down
[ok] blocks with .min.js
[ok] No root -> key = space , options: rootNodeBlank: false kein node label und kein node Image
[ok] check example for linkColor - 2
[ok] load data with flat file 8for DOM and file 
    --> add root node
    --> convert string to array of objects
[ok] perfect alignment of dependent links under node
[ok] sort --> updatable, 
[ok] at myChart.js // compute the new tree: config.tree(root ....) sort there
[ok] nodeSort1 ok nodesort2 doesnt let you resort again ?
[ok] doku nodeSort in Readme
[ok] add 2 blocks
[ok] delete comments in data processing and template_reusable
[ok] for link.down change in l.getLinkD (x == nodeSorted) ? new.. : x nach index - enter vs update
[ok] sort unexpanded part of tree
[ok] check logic
  --> ascending/ descending just on last term of ||
  --> converting numbers correct?
  --> add block
  --> update readme
  --> convert Types function
[ok] umstellung bei blocks auf .min.js
[ok] nodeInfo: nodeSort3 --> different nodeExtend if no nodeLabel

* nodeInfo (=nodeBar)
  [ok] determine size based on largest node BBox
  [ok] determine size of the nodeBar based on a scale
  [ok] compute length based on scale range left and right
  [ok] connectorLength new
  [ok] For nodeBar: if number size < rect ?
  [ok] rootBar: false
  [ok] default visualization with no bar for root
  [ok] allow for negative values to have bars to the left by default.
  [ok]  (if range[a,b] then create scale for [-b, -a] for negative values)
  [ok] animation for changes from pos to negativ: 
  [deferred]  two chained transition split in half to go to 0.
  [ok] text animated accordingly
  [ok] do dashed array just to the beginning of the nodeBarLabel
  [ok] domain can be set in api 
  [ok] nodeBars: bugs
  [ok]  new field -> color white
  [ok]  new field -> bars get wider (nodeBar.html size1 -> size2 -> size1 or size1 -> size1 -> size1)
  [deferred] relational data depend on order of missing values - just for undefined data
  [ok] nodeBar connector too long
  [ok] nodeBar3 collapse[EvE] -> expand -> Expand[Enoch]
  [ok] getVerticalAlignmentRef _> if label inside is before neg bar 
  [ok] nodeBar change of fields leads to twice the range if posNeg was before
  [ok] trnasition bodeBar from null to negative --> correct color
  [ok] change if nodeBars are just neg
  [ok] Nodebar bei missing nicht anzeigen (statt 0)
  [ok] CSS also in readme change from CamelCase to hyphenated
  [ok] change html of Readme template to <html> and <meta charste="utf-8">
  [deferred] switch global newlinklabel, newlinkWidth setting to options
  [ok] (previous bug) nodeBar labels dissappeared aber collapse expand
  [ok] transitionDuration separated for collapse/expand
  [ok] transitionDuration separted for first time build up of visualization
  [ok] link labels are below vertical paths and thus visible when overlapping
  [deferred] DOM of SVG g.link elements could be reorded and grouped via g.branch (with transform) 
  [ok] linksAPI.computeLabelDimensions for each branch not just each depth
  [ok] nodeBar transition updated to correctly adjust text-anchor during transtioning over 0 
  [ok] refactored transitionDuration changes
  [ok] refactored d.linkLabel to be an object
  [ok] swapped creating links with creating nodes to compute linkLabel.width
  [ok] fixed impact of linkLabel.width on nodeBarTranslateX
  [ok] linkLabel does not overlap any more with nodeImage (with width 15)
  [ok] linkWidth neg values () use d.linkLabelAnchor
  [ok] option to turn off link labels when link width is too short: always: true/false
  [ok] add checkSign condition to nodeBarTween
  [ok] fixed nodeBar connectorStart for linkLabels, when links go to the left and don't fit on link
  [ok] linkLabels for null value fixed (--> not 0 but "")
  [ok] transition of linkWidth does not shift node labels to left/right: [ok] but connectors of nodebars not correct:
  [ok] nodeBars for value 0
  [ok] nodesAPI.computeNodeExtend: compute nodeEnd based on final destination after transition
  [ok] implement labelAlignment
  [ok] linkLabel transition jumps for 2 cust, (because of string -> change to number + unit)
  [ok] linkLabelAlignment: start, aligned, middle, end

[1] - linkLabel transition like node-bars ( and inner condition numStar * num <0 && watch)-> transition values, change text-anchor
[2] set range + domain of scale of linkWidth like nodeBar
[bug] setting range for nodebars when extent from - to +.

- nodeLabels draw like link label (background)

[3] [bug] if link label is neg and longer than link width it is display under the node bar line instead of on top (Workaround: onTop: false)
- change main call/ readme to d3.hierarchyExplorer(dataSpec)
- update blocks with linkLabel align
- update blocks with nodeImage
- update blocks+readme with d3-hierarchy-explorer
- change html of examples to <html> and <meta charset="utf-8">
- clean up old hierarchy-explorer .js .min.js .css  

- myChart.reset() to set default
- update nodeBars for neg linkWidth
- update Label placement linkLabel
- update SVG translate for neg values
- background for linkLabel (default)
- background for nodeBars (default)
- refactor nodeBars
- scale linkWidth, linkHeight, like nodeBars
- linkLabel.tween like nodeBars (color change on tween transition -> new api for setting colors with css, default no color distinction)
- update blocks/ examples
- move API example to API section
- change html of examples to <html> and <meta charset="utf-8">

[feature] link label placement
[feature] 
[feature] 
[feature] 
- update nodeBar connector + linkLabels on collapse, expand
- user can set dom of a scale

- collapse() API: () .mode: bySize/byHeight/byID .location .collapseAll === true (default)

- update on exit (if sel.exit.size() > 0) initialize new
 .domain .clamp for other (linkWidth)

- Draw background for TextLabel (nodeBars + linkWidth)
tradeoff with Animation

* allow negativ values for linkWidth range for the tree to go left 
* reimplement range linkWidth such that node starts after range
 - For LinkLabel: if number size < rect ? --> move label left/ right of link down
* style (font-variant-numeric) for animated numbers

https://stackoverflow.com/questions/46907149/svg-text-background-color-with-border-radius-and-padding-that-matches-the-text-w

https://stackoverflow.com/questions/15500894/background-color-of-text-in-svg

 - updateScale for linkWidth, linkStrength accordingly

* linkLabel background: not stroke but rectangle with background color and 20% tranparency, rounded corners /when computing rect position, initialize with label alignment
- concept for transitions of linklabel effect on linkLabelBackground

* color themes
* image referencing API
* showcase updated (nicht alignLeave doppelt (linkWidth zurück), mehr funktionen)
* load data with same keys (key, name) for flat data
* test linkLabel alignment
*


*
* applications (chess, basketball, nfl, soccer, flags, d3.js)
https://www.chess.com/article/view/how-many-chess-players-are-there-in-the-world
* observable
* save image as svg or png https://stackoverflow.com/questions/36303964/save-d3-chart-as-image

[bug] if links are in transition and collapse or expand is called, the links can get too long
* add slow expansion of tree https://stackoverflow.com/questions/35834304/d3js-collapsible-tree-entering-transition-using-depth-first-style/35838978#35838978
    
* Gradient for path.right: yes no https://observablehq.com/@d3/sankey-diagram

* scales for linkLabel and nodeBar also diverging (Domain: [min, 0, max])
* change css camelCase to hyphen
[info] antialiasing: https://stackoverflow.com/questions/23376308/avoiding-lines-between-adjecent-svg-rectangles/23376793#23376793

* when invoking nodeBar, currently path is shown much earlier then bar + label which comes from the left
* add own sort function
* linkLabel align for longest and shortest
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
https://stackoverflow.com/questions/23126590/colour-issues-when-2-svg-lines-are-overlapping
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
* option: save as png/svg in function call to add buttons
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
