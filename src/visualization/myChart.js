import * as d3 from "d3";

////////////////////////////////////////////////////
// add visualization specific processing here     //
//////////////////////////////////////////////////// 

export function myChart(selection, data, options){
  let hierarchy = d3.hierarchy;
  // let select = d3.select;
  let width = 1400 - options.margin.right - options.margin.left;
  let height = 800 - options.margin.top - options.margin.bottom;
  // let baroptions.width;
  let i;
  let duration;
  let tree;
  let root;
  let svg;
  let maxNameLength = 20;
  
  function initTree(data) {
    // baroptions.width = options.width *.8;
    i = 0;
    duration = 750;
    tree = d3.tree().size([width, height]).nodeSize([0, options.connectorWidth]); 
    root = tree(hierarchy(data));
    root.each((d)=> {
      d.name = d.id; //transferring name to a name variable
      d.id = i; //Assigning numerical Ids
      i++;
    });
    root.x0 = root.x;
    root.y0 = root.y;
    svg = selection.append("svg")
      .attr("width", width + options.margin.right + options.margin.left)
      .attr("height", height + options.margin.top + options.margin.bottom)
      .append("g")
      .attr("transform", "translate(" + options.margin.left + "," + options.margin.top + ")");

    options.updateConnectorWidth = function() {
      tree.nodeSize([0, options.connectorWidth]);
      update(root);
    };

    options.updateConnectorHeight = function() {
      update(root);
    };
    // root.children.forEach(collapse);
    update(root);
  }



  function connector(d) {
    const path = (options.connector === "curved")
      ? // curved
      "M" + d.y + "," + d.x +
      "C" + (d.y + d.parent.y) / 2 + "," + d.x +
      " " + (d.y + d.parent.y) / 2 + "," + d.parent.x +
      " " + d.parent.y + "," + d.parent.x
      : // straight
      "M" + d.parent.y + "," + d.parent.x
      + "V" + d.x + "H" + d.y;
    return path;
  }

  /*
  function collapse(d){
    if (d.children) {
      d._children = d.children;
      d._children.forEach(collapse);
      d.children = null;
    }
  }
  */

  function click(d){
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
    update(d);
  }

  function update(source){
    width=800;

    // Compute the new tree layout.
    let nodes = tree(root);
    let nodesSort = [];
    nodes.eachBefore(function (n) {
      nodesSort.push(n);
    });
    height = Math.max(500, nodesSort.length * options.connectorHeight + options.margin.top + options.margin.bottom);
    let links = nodesSort.slice(1);
    // Compute the "layout".
    nodesSort.forEach ((n,i)=> {
      n.x = i *options.connectorHeight;
    });

    d3.select("svg").transition()
      .duration(duration)
      .attr("height", height);

    // Update the nodes…
    let node = svg.selectAll("g.node")
      .data(nodesSort, function (d) {
        return d.id || (d.id = ++i);
      });

    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node.enter().append("g")
      .attr("class", "node")
      .attr("transform", function () {
        return "translate(" + source.y0 + "," + source.x0 + ")";
      })
      .on("click", click);

    nodeEnter.append("circle")
      .attr("r", 1e-6)
      .style("fill", function (d) {
        return d._children ? "lightsteelblue" : "#fff";
      });

    nodeEnter.append("text")
      .attr("x", 10)
      .attr("dy", ".35em")
      .attr("text-anchor", "start")
      .text(function (d) {
        if (d.data.name.length > maxNameLength) {
          return d.data.name.substring(0, maxNameLength) + "...";
        } else {
          return d.data.name;
        }
      })
      .style("fill-opacity", 1e-6);

    nodeEnter.append("svg:title").text(function (d) {
      return d.data.name;
    });

    // Transition nodes to their new position.
    let nodeUpdate = node.merge(nodeEnter)
      .transition()
      .duration(duration);
    
    nodeUpdate
      .attr("transform", function (d) {
        return "translate(" + d.y + "," + d.x + ")";
      });

    nodeUpdate.select("circle")
      .attr("r", 4.5)
      .style("fill", function (d) {
        return d._children ? "lightsteelblue" : "#fff";
      });
    
    nodeUpdate.select("text")
      .style("fill-opacity", 1);

    // Transition exiting nodes to the parent's new position (and remove the nodes)
    var nodeExit = node.exit().transition()
      .duration(duration);
    
    nodeExit
      .attr("transform", function () {
        return "translate(" + source.y + "," + source.x + ")";
      })
      .remove();

    nodeExit.select("circle")
      .attr("r", 1e-6);

    nodeExit.select("text")
      .style("fill-opacity", 1e-6);
    
    // Update the links…
    var link = svg.selectAll("path.link")
      .data(links, function (d) {
      // return d.target.id;
        var id = d.id + "->" + d.parent.id;
        return id;
      }
      );

    // Enter any new links at the parent's previous position.
    let linkEnter = link.enter().insert("path", "g")
      .attr("class", "link")
      .attr("d", () => {
        var o = {x: source.x0, y: source.y0, parent: {x: source.x0, y: source.y0}};
        return connector(o);
      });
    
    // Transition links to their new position.
    link.merge(linkEnter).transition()
      .duration(duration)
      .attr("d", connector);


    // // Transition exiting nodes to the parent's new position.
    link.exit().transition()
      .duration(duration)
      .attr("d", () => {
        var o = {x: source.x, y: source.y, parent: {x: source.x, y: source.y}};
        return connector(o);
      })
      .remove();

    // Stash the old positions for transition.
    nodesSort.forEach(function (d) {
      d.x0 = d.x;
      d.y0 = d.y;
    }); 
  }

  initTree(data); 
}
