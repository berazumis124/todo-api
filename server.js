var express = require('express');
var bodyParses = require('body-parser');
var app = express();
var PORT = process.env.PORT || 4998;
var todos = [];
var todoNextId = 1;

app.use(bodyParses.json());

app.get('/', function (req, res){
    res.send('Todo API Root');
});

// GET /todos
app.get('/todos', function (req, res) {
   res.json(todos); 
});
// GET /todos/:id
app.get('/todos/:id', function (req, res){
    var todoId = parseInt(req.params.id, 10);
    var matchedId;
    todos.forEach( function(id){
        if (id.id === todoId){
            matchedId = id;
        }
    });
    
    if (matchedId){
        res.json(matchedId);
    } else {
        res.status(404).send();
    }
   //res.send('What todo with id + ' + req.params.id) 
});

// POST /todos
app.post('/todos', function (req, res){
    var body = req.body;
    
    body.id = todoNextId;
    todos.push(body);
    todoNextId += 1;
    
    //console.log('description: ' + body.description);
    
    res.json(body);
});



app.listen(PORT, function (){
    console.log('Express listening on port ' + PORT + '!');
});