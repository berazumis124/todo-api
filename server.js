var express = require('express');
var app = express();
var PORT = process.env.PORT || 4998;

var todos = [{
    id: 1,
    description: 'do something',
    completed: false
}, {
    id: 2,
    description: 'do something else',
    completed: false
}, {
    id: 3,
    description: 'another task',
    completed: true
}];

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
app.listen(PORT, function (){
    console.log('Express listening on port ' + PORT + '!');
});