# graph-view

### Data  

#### JSON  

Needs to have nodes before links

##### Nodes  

```
[
    {
        "node": {
            "id": "BMSP",
            "name": "BMSP",
            "size": 2,
            "type": "org"
        }
    },
    {
        "node": {
            "id": "b4014828-88e9-4861-ae1d-5c369b6ae35a",
            "name": "Benjamin L Elsworth",
            "size": 2,
            "type": "person"
        }
    },
```

##### Links

```
    {
        "link": {
            "n1": "BMSP",
            "n2": "b4014828-88e9-4861-ae1d-5c369b6ae35a",
            "type": "orgPerson",
            "value": 1
        }
    },
```

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
	'org':{'nodeType':'img','nodeVal':'https://png.icons8.com/organization/nolan/200','textCol':'#C761FB'},
	'org':{'nodeType':'img','nodeVal':'https://png.icons8.com/organization/nolan/200','textCol':'#C761FB'},
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



### Testing

To test, start up a server, e.g.

```
python -m SimpleHTTPServer 8888
```

Then visit http://localhost:8888/
