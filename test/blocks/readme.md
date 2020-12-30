### API examples for d3-indented-tree

-------
#### myChart.linkLabel() - 4

This example shows how to 
- set the link label based on the column *color* of type string
- display the label above the link
- place the link labels in the center of the link (```align: "middle"```)
- set the margins
- use a file as the node image
- set the width and height of the node image
- draw an empty rectangle before drawing the image (```setBackground: true```) (to account for transparency of the image which would show otherwise the continuation of the link in the background) 
- determine the link width based on the column weight and mapping the width based the weight values onto the intervall [150, 300]
- changing the link height to 50 pixels
- setting the padding of the node label to 20 pixels such that the label is not overlapping the node image

---------

- for documentation, go to https://github.com/EE2dev/d3-indented-tree
- for other examples, go to https://github.com/EE2dev/d3-indented-tree#examples

Acknowledgements:
- [d3.js](https://d3js.org/)
- [blockbuilder.org](https://blockbuilder.org)

d3-indented-tree API example #2