function transform_data(jsonData) {

    var i, v, s, g = {nodes: [], links: []};
    var nodeCheck = []
    var relCheck = []
    var ssCheck = false
    var nCount = 0
    var sData = []
    var linkLimits = [1000000, 0]
    var nodeLimits = [1000000, 0]
    //var insCols = {SSCM: 'black', IEU: 'blue', ICEP: 'red'}

	//for (var i = 0; i < jsonData.length; i++) {
    //    d = jsonData[i]
	d3.json(jsonData, function(data) {
		for (i in data){
			d = data[i]
				//nodes
				if ('node' in d){
					//set size limit
					if ('size' in d['node']){
						nodeSize = d['node']['size']
						if (nodeSize < nodeLimits[0]){
							nodeLimits[0] = nodeSize
						}
						if (nodeSize > nodeLimits[1]){
							nodeLimits[1] = nodeSize
						}
					}

					//add nodes
					if ('id' in d['node']){
						nodeName = d['node']['id']
				 		if (nodeCheck.indexOf(nodeName) < 0) {
							pData={}
							for (p in d['node']){
								pData[p]=d['node'][p]
							}
								//console.log(p,d['node'][p])
						 	g.nodes.push(pData)
						 nodeCheck.push(nodeName)
						 nCount++
				 		}
					}
				}

				//set link size limits
				if ('link' in d){
					//console.log(d)
					if ('value' in d['link']){
						linkSize = d['link']['value']
						if (linkSize < linkLimits[0]){
							linkLimits[0] = linkSize
						}
						if (linkSize > linkLimits[1]){
							linkLimits[1] = linkSize
						}
					}
					//add links
					if ('n1' in d['link'] && 'n2' in d['link']){
						nodeName1 = d['link']['n1']
						nodeName2 = d['link']['n2']

				 		if (relCheck.indexOf(nodeName1 + ":" + nodeName2) < 0) {
							pData = {source: nodeCheck.indexOf(nodeName1),target: nodeCheck.indexOf(nodeName2)}
							for (p in d['link']){
						 		pData[p]=d['link'][p]
						 	}
							g.links.push(pData)
						 //relCheck.push(nodeName)
						 nCount++
				 		}
					}
				}
			//end of data parse loop
			}
			console.log(g)

		if (nodeLimits == [1000000, 0]){
			nodeLimits = [1,10]
		}
		if (linkLimits == [1000000, 0]){
			linkLimits = [1,10]
		}
		console.log(nodeLimits,linkLimits)
		//return nodeLimits
		//
    //adjust link values
    maxLinkSize = 20
    console.log('linkLimits:' + linkLimits)
    //linkSpan = linkLimits[1]-linkLimits[0]
    linkSpan = linkLimits[1]
    console.log('linkSpan:' + linkSpan)
    linkAdjust = maxLinkSize / linkSpan
    console.log('linkAdjust:' + linkAdjust)
    g.links = g.links.filter(function (link) {
        link.value = link.value * linkAdjust + 0.3
        return link
    })

    //adjust node sizes
    maxNodeSize = 100
    console.log('nodeLimits:' + nodeLimits)
    nodeSpan = nodeLimits[1]
    console.log('nodeSpan:' + nodeSpan)
    nodeAdjust = maxNodeSize / Math.sqrt(nodeSpan)
    console.log('nodeAdjust:' + nodeAdjust)
    g.nodes = g.nodes.filter(function (node) {
        node.size = (Math.sqrt(node.size) * nodeAdjust) + 2
        return node
    })
		console.log(g)
})
return g
}

function d3_graph(graph, gname, conf) {
	//console.log(conf)
	//need to add link labels and multiple links between nodes
	//https://bl.ocks.org/mattkohl/146d301c0fc20d89d85880df537de7b0
    console.log('d3_graph : ' + gname)
    var width = $("#"+gname).width();
    var height = $("#"+gname).height();
	console.log(width,height)
    //height = 500,
    radius = 6;
	var force = d3.layout.force()
        .size([width, height])
        .charge(-150000)
        .linkDistance(60)
        .on("tick", tick)
        .nodes(graph.nodes)
        .links(graph.links)
        .gravity(0.99)
        .start();

    var drag = force.drag()
        .on("dragstart", dragstart);

    var zoom = d3.behavior.zoom()
        .center([width / 2, height / 2])
        .scaleExtent([0.01, 10])
        .on("zoom", zoomed);

    d3.select("#" + gname).select("svg").remove();
    var svg = d3.select("#" + gname)
        .attr("id", gname)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .call(zoom)
        .append("svg:g")

    zoom.translate([320,250]).scale(0.25);
    zoom.event(svg.transition().duration(500))

    var link = svg.selectAll(".link")
        .data(graph.links)
        .enter().append("line")
        .attr("class", "link")
        .style("stroke-width", function (d) {
            return d.value;
        })
        .style("stroke", function (d) {
            return conf[d.type].linkCol;
        })


    var node = svg.selectAll(".node")
        .data(graph.nodes)
        .enter().append("g")
        .attr("class", "node")
        //.on("dblclick", dblclick)
        .call(drag)
        //.on("click", function (d) {
			//if (conf[d.type].hasOwnProperty('url')){
            	//var url = '{% url "org" "1" %}'.replace('1', d.pid)
		//		var url = d.url
        //    	$(location).attr('href', url);
        //    	window.location = url
			//}
        //})
        .on("mouseover", function (d) {
            d3.select(this).style("cursor", "pointer")
            mouseover(d,true)
        })
        .on("mouseout", mouseout)


    node.append("circle")
        .attr("r", function (d) {
			if (conf[d.type].nodeType=='circle'){
            	return d.size;
			}
        })
        .style("fill", function (d) {
            return conf[d.type].nodeVal;
        })
        .style("stroke", '#000')

	node.append("image")
		.attr("xlink:href", function(d){
			if (conf[d.type].nodeType=='img'){
				return conf[d.type].nodeVal
			}
		})
	  	.attr("x", -50)
	  	.attr("y", -100)
	  	//.attr("width", 16)
	  	.attr("height", function (d) {
			return d.size*2
		})

    node.append("svg:title")
        .text(function (d) {
            return d.name;
        });

    node.append("text")
        //names next to nodes
        .attr("dx", function (d) {
			if (conf[d.type][0]=='circle'){
            	return d.size
			}else{
				return d.size*1.1
			}
        })
        .attr("dy", ".35em")
        .text(function (d) {
            return d.name
        })
        .style("font-size", "40px")
        .style("font-family", "trebuchet")
        .style("fill", function (d) {
            return conf[d.type].textCol
        })

    var t = d3.transition()
        .duration(0)
    //.ease(d3.easeLinear)

    function mouseover(d) {
       // console.log(d)
        var pNode_nodes = new Array()
        //link.transition(t).style('stroke', function (l) {
        //d3.selectAll(".link")
        link.each(function (l) {
            if (l.source === d || l.target === d) {
                if (pNode_nodes.indexOf(l.target) < 0) {
                    pNode_nodes.push(l.target)
                }
                if (pNode_nodes.indexOf(l.source) < 0) {
                    pNode_nodes.push(l.source)
                }
                //.transition().duration(750)
                //l.style('stroke','green')
                //console.log(l.source)
                d3.select(this)
                    .style('stroke', conf[l.type].linkCol)
                //return 'green'
            } else {
                d3.select(this)
                    .style('stroke', '')
            }
        })

        node.each(function (o) {
            //console.log(o)
            if (d == o){
                d3.select(this).select("circle").style("fill",conf[d.type].nodeVal)
                d3.select(this).select("text").style("stroke",d.colour)
            }
            if (pNode_nodes.indexOf(o) < 0) {
                d3.select(this)
                    .style("opacity", 0.1)
            }
        })
    }

    function mouseout() {
        //d3.select(this).style("cursor", "default")
        $("#pTable tbody tr").removeClass("highlight");
        link.style('stroke', function (l) {
            return conf[l.type].linkCol;
        })
        node.style("opacity", function (o) {
            return 1
        })
        node.select("circle").style("fill",function (n){
			if (conf[n.type].nodeType == 'circle'){
				return conf[n.type].nodeVal
			}
		})
        node.select("text").style("stroke",function (n){
			return conf[n.type].textCol
		})
    }

    function tick() {
        link.attr("x1", function (d) {
                return d.source.x;
            })
            .attr("y1", function (d) {
                return d.source.y;
            })
            .attr("x2", function (d) {
                return d.target.x;
            })
            .attr("y2", function (d) {
                return d.target.y;
            });

        node.attr("cx", function (d) {
                return d.x;
            })
            .attr("cy", function (d) {
                return d.y;
            })
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            })
    }

    function dblclick(d) {
        d3.select(this).classed("fixed", d.fixed = false);
    }

    function dragstart(d) {
        d3.select(this).classed("fixed", d.fixed = true);
    }

    function zoomed() {
        svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }

	//connect with datatables
    // $.fn.highlight_nodes = function(name){
    //         //console.log(name)
    //         graph.nodes.forEach(function(n) {
    //             //console.log(n)
    //             if (n.label.substring(0,30) == name.substring(0,30)){
    //                 //console.log(n)
    //                 mouseover(n,false)
    //             }
    //         })
    //     }
    // $.fn.unhighlight_nodes = function(){
    //        mouseout()
    // }
}

function graph_view_run(jsonData,element_id,conf){
	g = transform_data(jsonData)
	d3_graph(g,element_id,conf)
}
