var express = require('express');
var bodyParses = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

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
    var matchedId = _.findWhere(todos, {id: todoId});

    
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
    
    body = _.pick(body, 'description', 'completed');
    
    db.todo.create(body).then(function (todo){
        return res.status(200).json(body);
    }).catch(function (e){
        return res.status(400).json(e);
    
    //if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0){
    //    return res.status(400).send();
    //}
    
    //body = _.pick(body, 'description', 'completed');
    //body.description = body.description.trim();
    
    //body.id = todoNextId;
    //todos.push(body);
    //todoNextId += 1;
    
    //console.log('description: ' + body.description);
    
    //res.json(body);
    });
});
    


// DELETE /todos/:id
// _.without
app.delete('/todos/:id', function (req, res) {
    var todoIdDel = parseInt(req.params.id, 10);
    var matchedIdDel = _.findWhere(todos, {id: todoIdDel});
    
    if (matchedIdDel){
        todos = _.without(todos, matchedIdDel);
        res.json(matchedIdDel);
    } else {
        return res.status(400).send();
    }
});

// PUT /todos/:id

app.put('/todos/:id', function (req, res) {
    var todoIdDel = parseInt(req.params.id, 10);
    var matchedIdDel = _.findWhere(todos, {id: todoIdDel});
    var body = _.pick(req.body, 'description', 'completed');
    var validAttributes = {};
    
    if (!matchedIdDel) {
        return res.status(404).send();
    }
    
    if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
        validAttributes.completed = body.completed;
       // console.log(validAttributes.completed);
    } else if (body.hasOwnProperty('completed')) {
        return res.status(400).send();
    }
    
    if (body.hasOwnProperty('description') && _.isString(body.description) && (body.description.trim().length > 0)) {
        validAttributes.description = body.description;
    } else if (body.hasOwnProperty('description')) {
        return res.status(400).send();
    }
    
    _.extend(matchedIdDel, validAttributes);
    res.json(matchedIdDel);
    
});

db.sequelize.sync().then(function () {
    app.listen(PORT, function (){
        console.log('Express listening on port ' + PORT + '!');
    });
});

