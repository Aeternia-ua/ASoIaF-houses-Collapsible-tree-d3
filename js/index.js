var diameter = 1024;

var margin = {top: 20, right: 120, bottom: 20, left: 120},
    width = 960 - margin.right - margin.left,
    height = 1800 - margin.top - margin.bottom;
    
var i = 0,
    duration = 500,
    root;

var tree = d3.layout.tree()
    .size([height, width])
    .nodeSize ([32, 32]);

var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.y, d.x]; });

var svg = d3.select("body").append("svg")
//Setting canvas size
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")

//Setting position of the root node
     .attr("transform", "translate("   + margin.left  + "," + diameter / 2 + ")");

// TO-DO implement the center on node function
// Function to center node when clicked/dropped so node doesn't get lost when collapsing/moving with large amount of children.

    function centerNode(source) {
        scale = zoomListener.scale();
        x = -source.y0;
        y = -source.x0;
        x = x * scale + viewerWidth / 2;
        y = y * scale + viewerHeight / 2;
        d3.select('g').transition()
            .duration(duration)
            .attr("transform", "translate(" + x + "," + y + ")scale(" + scale + ")");
        zoomListener.scale(scale);
        zoomListener.translate([x, y]);
    }

//Retrieving JSON data
d3.json("https://raw.githubusercontent.com/Aeternia-ua/ASoIaF-houses-Collapsible-tree-d3/gh-pages/asoiaf-houses.json", function(error, houses) {
  root = houses;
  root.x0 = height / 2;
  root.y0 = 0;

   root.children.forEach(collapse);
  update(root);
   centerNode(root);
  // Implementing multiple parents function. CHECK IF WORKS
  	var couplingParent1 = tree.nodes(root).filter(function(d) {
            return d['name'] === 'Eddard Stark';
        })[0];
	var couplingChild1 = tree.nodes(root).filter(function(d) {
            return d['name'] === 'Catelyn Stark';
        })[0];

	multiParents = [{
                    parent: couplingParent1,
                    child: couplingChild1
                }];
	
	multiParents.forEach(function(multiPair) {
            svgGroup.append("path", "g")
            .attr("class", "additionalParentLink")
                .attr("d", function() {
                    var oTarget = {
                        x: multiPair.parent.x0,
                        y: multiPair.parent.y0
                    };
                    var oSource = {
                        x: multiPair.child.x0,
                        y: multiPair.child.y0
                    };
                    /*if (multiPair.child.depth === multiPair.couplingParent1.depth) {
                        return "M" + oSource.y + " " + oSource.x + " L" + (oTarget.y + ((Math.abs((oTarget.x - oSource.x))) * 0.25)) + " " + oTarget.x + " " + oTarget.y + " " + oTarget.x;
                    }*/
                    return diagonal({
                        source: oSource,
                        target: oTarget
                    });
                });
        });
});

d3.select(self.frameElement).style("height", "800px");

function update(source) {

  // Compute the new tree layout.
  var nodes = tree.nodes(root).reverse(),
      links = tree.links(nodes);

  // Normalize for fixed-depth.
  nodes.forEach(function(d) { d.y = d.depth * 180; });


  // Update the nodes…
  var node = svg.selectAll("g.node")
      .data(nodes, function(d) { return d.id || (d.id = ++i); });

  // Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
      .on("click", click);

  nodeEnter.append("circle")
      .attr("r", 1e-6)
      .style("fill", function(d) { return d._children });
  
   // Append images
var images = nodeEnter.append("image")
        .attr("xlink:href",  function(d) { return d.img;})
        .attr("x", function(d) { return -15;})
        .attr("y", function(d) { return -15;})
        .attr("height", 30)
        .attr("width", 30); 

  nodeEnter.append("text")
      .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
      .attr("dy", ".35em")
      .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
      .text(function(d) { return d.name; })
      .style("fill-opacity", 1e-6);
    
  /*Set events on node interaction*/
  var setEvents = images

  //Transition on mouse hover - zoom in - zoom out  
 .on( 'mouseenter', function() {
 d3.select( this )
              .transition()
              .attr("x", function(d) { return -25;})
              .attr("y", function(d) { return -25;})
              .attr("height", 50)
              .attr("width", 50)  
     /*TODO bring image to front on hover*/
           this.parentElement.appendChild(this);
  }) 
  
  .on( 'mouseleave', function() {
   d3.select( this )
              .transition()
              .attr("x", function(d) { return -15;})
              .attr("y", function(d) { return -15;})
              .attr("height", 30)
              .attr("width", 30)
   })

  .on( 'click', function (d) {
  });
  
  // Transition nodes to their new position.
  var nodeUpdate = node.transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

  nodeUpdate.select("circle")
      .attr("r", 4.5)
      .style("fill", function(d) { return d._children ? "#ffd6d6" : "#b20707"; });

  nodeUpdate.select("text")
      .style("fill-opacity", 1);

  // Transition exiting nodes to the parent's new position.
  var nodeExit = node.exit().transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
      .remove();

  nodeExit.select("circle")
      .attr("r", 1e-6);
  
   nodeExit.select("image")
      .attr("r", 1e-6);

  nodeExit.select("text")
      .style("fill-opacity", 1e-6);

  // Update the links…
  var link = svg.selectAll("path.link")
      .data(links, function(d) { return d.target.id; });

  // Enter any new links at the parent's previous position.
  link.enter().insert("path", "g")
      .attr("class", "link")
      .attr("d", function(d) {
        var o = {x: source.x0, y: source.y0};
        return diagonal({source: o, target: o});
      });

  // Transition links to their new position.
  link.transition()
      .duration(duration)
      .attr("d", diagonal);

  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
      .duration(duration)
      .attr("d", function(d) {
        var o = {x: source.x, y: source.y};
        return diagonal({source: o, target: o});
      })
      .remove();

  // Stash the old positions for transition.
  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}
    // Sort the tree nodes alphabetically
    function sortTree() {
        tree.sort(function(a, b) {
            return b.name.toLowerCase() < a.name.toLowerCase() ? 1 : -1;
        });
    }
    sortTree();

// Toggle children on click.
function click(d) {
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
  //If the node has children, collapse unfolded sibling nodes
    if(d.parent)
        {
            d.parent.children.forEach(function(element){             
        if(d !== element){
                 collapse(element);
                
                }
            });
        }
//TODO If the node has spouse, expand spouse branch
  
    if(d.hasOwnProperty('spouse'))
        {
 // Get spouse id. TODO - getting id by name value
//var spouse = Number(d.spouse);
       //   .attr("id", function(d) { return d.name; })
       //   expand(d.id = Number(d.spouse));
          expand(d.id = d.spouse);
        }
  
  update(d);
}

function expand(d) {
                        if (d._children) {
                            d.children = d._children;
                            d.children.forEach(expand);
                            d._children = null;
                        }
                      }

// Collapse all children of root's children before rendering
function collapse(d) {
  if (d.children) {
    d._children = d.children;
    d._children.forEach(collapse);
    d.children = null;
  }
}


	
