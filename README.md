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

### Testing

To test, start up a server, e.g.

```
python -m SimpleHTTPServer 8888
```

Then visit http://localhost:8888/
