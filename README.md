# graph-view

### Data  

#### JSON  

Needs to have nodes before links

##### Nodes  

```
{
	"node": [
			{
            		"id": "BMSP",
            		"name": "BMSP",
            		"size": 2,
            		"type": "org"
        		},
  			{
            		"id": "b4014828-88e9-4861-ae1d-5c369b6ae35a",
            		"name": "Benjamin L Elsworth",
            		"size": 2,
            		"type": "person"
			}
		],
     

```
- id (required): the ID for the node, used by link for n1/n2 
- name (required): name that will be displayed
- type (required and unique): the type of node (used in conf file)
- size (required): relative size

##### Links

```

	"link": [
			{
            		"n1": "BMSP",
            		"n2": "b4014828-88e9-4861-ae1d-5c369b6ae35a",
            		"type": "orgPerson",
            		"value": 1
        		},
		]
}
```
- n1 (required): the node ID for one end of link
- n2 (required): the node ID for other end of link
- type (required and unique): the type of link (used in conf file)
- valye (requred): the size (width) of the link 

##### HTML

```
<body>
	<section class="container">
	    <div id='graph_view_div' class="one"></div>
	</section>
<div id = 'graph_controller_div' style="height:700px;width:300px"></div-->

<script>
//config data
var axon_conf={
	'org':{'nodeType':'img','nodeVal':'https://png.icons8.com/organization/nolan/200','textCol':'#C761FB','textSize':'100px'},
	'person':{'nodeType':'img','nodeVal':'https://png.icons8.com/person-female/color/200','textCol':'#BC9E6A'},
	'type':{'nodeType':'img','nodeVal':'https://png.icons8.com/idea/office/200','textCol':'dark grey'},
	'bigram':{'nodeType':'img','nodeVal':'https://png.icons8.com/idea/office/200','textCol':'dark grey'},
	'trigram':{'nodeType':'img','nodeVal':'https://png.icons8.com/idea/office/200','textCol':'dark grey'},
	'pub':{'nodeType':'img','nodeVal':'https://png.icons8.com/news/ultraviolet/200','textCol':'dark grey'},
	'orgPerson':{'linkCol':'#C761FB'},
	'personConcept':{'linkCol':'#FFB859'},
	'personPub':{'linkCol':'orange'},
}

graph_view_run('axon_demo.json','graph_view_div',axon_conf,'graph_controller_div')
</script>
</body>
```

### Configuration parameters

##### Nodes

- object key (required) - matches node type in JSON 
- nodeType (required) - can be 'img' or 'circle'
- nodeVal (required) - if nodeType is img, either a relative path to image of URL. If node type circle, the colour of the circle
- textCol (required) - the colour for the node text 
- textSize (optional) - set the size of the node text to a specific value 

##### Links

- object key (required) - matches link type in JSON 
- linkCol (required) - colour of linking line

### Testing

To test, start up a server, e.g.

```
python -m SimpleHTTPServer 8888
```

Then visit http://localhost:8888/
