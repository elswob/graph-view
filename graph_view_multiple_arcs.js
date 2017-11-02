function gv_graph_view_run(jsonData,element_id,conf) {

	//for (var i = 0; i < jsonData.length; i++) {
    //    d = jsonData[i]
	var jsonObj = {}
	var IS_JSON = true;
	try{
		jsonObj=JSON.parse(jsonData)
	}catch(err){
		IS_JSON = false;
	}
	if(IS_JSON == false){
		//console.log('data is json file')
		$.getJSON(jsonData, function (data) {
			g=gv_transform_data(data)
			gv_d3_graph(g,element_id,conf)
		})
	}else{
		//console.log('data is json object')
		g=gv_transform_data(jsonObj)
		gv_d3_graph(g,element_id,conf)
	}
}

function gv_transform_data(jsonData) {
	//console.log(jsonData)
	var i, v, s, g = {nodes: [], links: []};
	var nodeCheck = []
	var relCheck = []
	var ssCheck = false
	var nCount = 0
	var sData = []
	var linkLimits = [1000000, 0]
	var nodeLimits = [1000000, 0]
	//for (var i = 0; i < jsonData.length; i++) {
	//d3.json(jsonData, function(data) {
	for (i in jsonData.node){
			d = jsonData.node[i]
			//console.log(d)
					//set node size limit
					if ('size' in d){
						nodeSize = d['size']
						if (nodeSize < nodeLimits[0]){
							nodeLimits[0] = nodeSize
						}
						if (nodeSize > nodeLimits[1]){
							nodeLimits[1] = nodeSize
						}
					}

					//add nodes
					if ('id' in d){
						nodeName = d['id']
						if (nodeCheck.indexOf(nodeName) < 0) {
							pData={}
							for (p in d){
								pData[p]=d[p]
							}
								//console.log(p,d['node'][p])
							g.nodes.push(pData)
						 nodeCheck.push(nodeName)
						 nCount++
						}
					}
				}
	for (i in jsonData.link){
		d = jsonData.link[i]
				//set link size limits
					//console.log(d)
					if ('value' in d){
						linkSize = d['value']
						if (linkSize < linkLimits[0]){
							linkLimits[0] = linkSize
						}
						if (linkSize > linkLimits[1]){
							linkLimits[1] = linkSize
						}
					}
					//add links
					if ('n1' in d && 'n2' in d){
						nodeName1 = d['n1']
						nodeName2 = d['n2']

						if (relCheck.indexOf(nodeName1 + ":" + nodeName2) < 0) {
							pData = {source: nodeCheck.indexOf(nodeName1),target: nodeCheck.indexOf(nodeName2)}
							for (p in d){
								pData[p]=d[p]
							}
							g.links.push(pData)
						 //relCheck.push(nodeName)
						 nCount++
						}
					}
				}
	//end of data parse loops

	//console.log(g)
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
	//adjust for one value
	if (linkLimits[0]==linkLimits[1]){
		linkAdjust=linkAdjust/2
	}
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
	//console.log(g)

	//})
	return g
}

function gv_d3_graph(graph, gname, conf) {
	//console.log(conf)
	//need to add link labels and multiple links between nodes
	//https://bl.ocks.org/mattkohl/146d301c0fc20d89d85880df537de7b0
    console.log('d3_graph : ' + gname)
    var width = $("#"+gname).width();
    var height = $("#"+gname).height();
	console.log(width,height)
	var numNodes = graph.nodes.length
	console.log('# nodes : '+numNodes)
    //height = 500,
    radius = 6;

	// used to store the number of links between two nodes.
	// mLinkNum[data.links[i].source + "," + data.links[i].target] = data.links[i].linkindex;
	var mLinkNum = {};

	// sort links first
	sortLinks();

	// set up linkIndex and linkNumer, because it may possible multiple links share the same source and target node
	setLinkIndexAndNum();

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

	var path = svg.append("svg:g")
          .selectAll("path")
          .data(force.links())
          .enter().append("svg:path")
          .attr("class", "link")
		  .style("stroke-width", function (d) {
              return d.value;
          })
          .style("stroke", function (d) {
              return conf[d.type].linkCol;
          })

	//zoomScale = 0.16
	zoomScale = ((1/numNodes)+0.008)*(height/200)
	//zoomScale = 0.25
	console.log('zoomScale = '+zoomScale)

    zoom.translate([width/2,height/2]).scale(zoomScale);
    zoom.event(svg.transition().duration(5000))

    // var link = svg.selectAll(".link")
    //     .data(graph.links)
    //     .enter().append("line")
    //     .attr("class", "link")
    //     .style("stroke-width", function (d) {
    //         return d.value;
    //     })
    //     .style("stroke", function (d) {
    //         return conf[d.type].linkCol;
    //     })


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

	node.filter(function(d) {
		if (conf[d.type].nodeType=='circle'){
			d3.select(this).append('circle')
				.attr("r", function (d) {
	            	return d.size;
	        	})
	        	.style("fill", function (d) {
	            	return conf[d.type].nodeVal;
	        	})
	        	.style("stroke", '#000')
		}else if (conf[d.type].nodeType=='img'){
			d3.select(this).append("image")
				.attr("xlink:href", function(d){
					return conf[d.type].nodeVal
				})
				.attr("x", -100)
				.attr("y", -100)
				//.attr("width", 16)
				.attr("height", function (d) {
					return d.size*2
				})
		}else if (conf[d.type].nodeType=='gender'){
			d3.select(this).append("image")
				.attr("xlink:href", function(d){
					imgLink = 'https://png.icons8.com/person-female/color/200'
					if (d.gender == 'm'){
						imgLink='https://png.icons8.com/person/color/200'
					}
					return imgLink
				})
				.attr("x", -100)
				.attr("y", -100)
				//.attr("width", 16)
				.attr("height", function (d) {
					return d.size*2
				})
			}

		})

    node.append("svg:title")
        .text(function (d) {
            return d.name;
        });

	//text inside nodes
	var nodeTextInside=false
	if (conf['nodeText']){
		if (conf['nodeText'].location == 'inside'){
			nodeTextInside=true
			node.append("text")
				.style("font-size", function(d) {
					return d.size/3+"px"
				})

				.selectAll("tspan")
					.data(function(d) {
						var dSplit = d.name.split(/ /g,3);
						for (i in dSplit){
							//console.log(dSplit[i])
							if (dSplit[i].length < 3){
							}
							if (dSplit[i].length > 10){
								dSplit[i] = dSplit[i].substring(0,8)+'..'
							}
						}
						return dSplit
					})
					.enter().append("tspan")
						.attr("fill", "white")
						.attr("text-anchor", "middle")
						.attr("x", 0)
						.attr("dy", "-.25em")
						.attr("y", function(d, i) {
							return 2 + (i  - 0.5) * 25;
						})
						.text(function(d) {
							return d;
						});
		}
	}
	if (nodeTextInside == false){
		node.append("text")
		    //names next to nodes
		    .attr("dx", function (d) {
				if (conf[d.type][0]=='circle'){
		        	return d.size
				}else{
					return d.size*0.7
				}
		    })
		    .attr("dy", ".35em")
		    .text(function (d) {
		        return d.name
		    })
			.style("font-size",function(d){
				if (conf[d.type]['textSize']){
					var textSize = conf[d.type]['textSize']
				}else{
					var textSize="60px"
				}
				return textSize
			})
		    .style("font-family", "trebuchet")
		    .style("fill", function (d) {
		        return conf[d.type].textCol
		    })
	}

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
			if (nodeTextInside == false){
				return conf[n.type].textCol
			}
			//else{
			//	return "white"
			//}
		})
    }

    // function tick() {
    //     link.attr("x1", function (d) {
    //             return d.source.x;
    //         })
    //         .attr("y1", function (d) {
    //             return d.source.y;
    //         })
    //         .attr("x2", function (d) {
    //             return d.target.x;
    //         })
    //         .attr("y2", function (d) {
    //             return d.target.y;
    //         });
	//
    //     node.attr("cx", function (d) {
    //             return d.x;
    //         })
    //         .attr("cy", function (d) {
    //             return d.y;
    //         })
    //         .attr("transform", function (d) {
    //             return "translate(" + d.x + "," + d.y + ")";
    //         })
    // }

	function tick() {
		 path.attr("d", function(d) {
			 //console.log(d)
			 var dx = d.target.x - d.source.x,
				 dy = d.target.y - d.source.y,
				 dr = Math.sqrt(dx * dx + dy * dy);
			 // get the total link numbers between source and target node
			 var lTotalLinkNum = mLinkNum[d.source.index + "," + d.target.index] || mLinkNum[d.target.index + "," + d.source.index];
			 if(lTotalLinkNum > 1)
			 {
				 // if there are multiple links between these two nodes, we need generate different dr for each path
				 dr = dr/(1 + (1/lTotalLinkNum) * (d.linkindex - 1));
			 }
			 // generate svg path
			 //console.log(d.source.x,d.source.y,d.target.x,d.target.y,d.source.x,d.source.y)
			 return "M" + d.source.x + "," + d.source.y +
				 "A" + dr + "," + dr + " 0 0 1," + d.target.x + "," + d.target.y +
				 "A" + dr + "," + dr + " 0 0 0," + d.source.x + "," + d.source.y;
		 });

		 // Add tooltip to the connection path
		 path.append("svg:title")
			 .text(function(d, i) { return d.name; });

		 node.attr("cx", function (d) {
	                  return d.x;
	              })
	              .attr("cy", function (d) {
	                  return d.y;
	              })
	              .attr("transform", function (d) {
	                  return "translate(" + d.x + "," + d.y + ")";
	              })

		 //text.attr("transform", function(d) {
		//	 return "translate(" + d.x + "," + d.y + ")";
		 //});
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

	// sort the links by source, then target
    function sortLinks(){
        g.links.sort(function(a,b) {
            if (a.source > b.source)
            {
                return 1;
            }
            else if (a.source < b.source)
            {
                return -1;
            }
            else
            {
                if (a.target > b.target)
                {
                    return 1;
                }
                if (a.target < b.target)
                {
                    return -1;
                }
                else
                {
                    return 0;
                }
            }
        });
		console.log(g.links)

    }

    //any links with duplicate source and target get an incremented 'linknum'
    function setLinkIndexAndNum(){
        for (var i = 0; i < g.links.length; i++){
            if (i != 0 &&
                g.links[i].source == g.links[i-1].source &&
                g.links[i].target == g.links[i-1].target)
            {
                g.links[i].linkindex = g.links[i-1].linkindex + 1;
            }else{
                g.links[i].linkindex = 1;
            }
            // save the total number of links between two nodes
			//console.log(g.links[i])
            if(mLinkNum[g.links[i].target + "," + g.links[i].source] !== undefined){
                mLinkNum[g.links[i].target + "," + g.links[i].source] = g.links[i].linkindex;
            }else{
                mLinkNum[g.links[i].source + "," + g.links[i].target] = g.links[i].linkindex;
            }
        }
    }
	console.log(mLinkNum)
}

function gv_searcher(search_div){
	try{
		var div = document.getElementById(search_div);
		div.innerHTML += '<h5>Graph search:</h5><div class="input-group"><input type="text" class="form-control" placeholder="Search for..."><span class="input-group-btn"><button class="btn btn-secondary" type="button">Go!</button></span></div><br>';
	}catch(err){
		console.log('no search div')
	}
}

function gv_graph_controller(controller_div){
	try{
		console.log('creating controller_div')
		var div = document.getElementById(controller_div);
		div.innerHTML += '<h5>Graph configuration:</h5><br><span style="float:left;margin-left: 10px;">Charge:</span><div style="float:right;width:70%;margin-right: 15px;" id="slider1"></div>';
		div.innerHTML += '<br><br><span style="float:left;margin-left: 10px;">Distance:</span><div style="float:right;width:70%;margin-right: 15px;" id="slider2"></div>';
		div.innerHTML += '<br><br><span style="float:left;margin-left: 10px;">Gravity:</span><div style="float:right;width:70%;margin-right: 15px;" id="slider3"></div>';

		$( function() {
		    $( "#slider1" ).slider({
		      range: "max",
		      min: 1,
		      max: 10,
		      value: 2,
		      slide: function( event, ui ) {
		        $( "#amount" ).val( ui.value );
		      }
		    });
		    $( "#amount" ).val( $( "#slider1" ).slider( "value" ) );
		  } );

		$( function() {
		    $( "#slider2" ).slider({
		      range: "max",
		      min: 1,
		      max: 10,
		      value: 7,
		      slide: function( event, ui ) {
		        $( "#amount" ).val( ui.value );
		      }
		    });
		    $( "#amount" ).val( $( "#slider2" ).slider( "value" ) );
		  } );

		$( function() {
		    $( "#slider3" ).slider({
		      range: "max",
		      min: 1,
		      max: 10,
		      value: 9,
		      slide: function( event, ui ) {
		        $( "#amount" ).val( ui.value );
		      }
		    });
		    $( "#amount" ).val( $( "#slider3" ).slider( "value" ) );
		  } );
	}catch(err){
		console.log('no controller div')
	}
}
