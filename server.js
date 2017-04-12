var express = require('express');
var bodyParses = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcrypt');
var middleware = require('./middleware.js')(db);

var app = express();
var PORT = process.env.PORT || 4998;
var todos = [];
var todoNextId = 1;


app.use(bodyParses.json());

app.get('/', function (req, res){
    res.send('Todo API Root');
});

// GET /todos
app.get('/todos', middleware.requireAuthentication, function (req, res) {
       var query = req.query;
    var where = {};
    
    if (query.hasOwnProperty('completed') && query.completed === 'true'){
        where.completed = true;
    } else if (query.hasOwnProperty('completed') && query.completed === 'false') {
        where.completed = false;
    }
    if (query.hasOwnProperty('q') && query.q.length >0){
        where.description = {
            $like: '%' + query.q + '%'
        };
    }
    
    db.todo.findAll({where: where}).then(function(todos) {
        res.json(todos);
    }, function () {
        res.status(500).send();
    }) 
});
// GET /todos/:id
app.get('/todos/:id', middleware.requireAuthentication, function (req, res){
    var todoId = parseInt(req.params.id, 10);
    //var matchedId = _.findWhere(todos, {id: todoId});
    db.todo.findById(todoId).then(function (todo){
        if (todo){
            return res.status(200).json(todo);
        } else {
            return res.status(404).send();
        }
    }, function (e){
        res.status(500).send();
    });
    
});

// POST /todos
app.post('/todos', middleware.requireAuthentication, function (req, res){
    var body = req.body;
    
    body = _.pick(body, 'description', 'completed');
    
    db.todo.create(body).then(function (todo){
        //return res.status(200).json(body);
        req.user.addTodo(todo).then(function () {
            return todo.reload();
        }).then(function (todo){
            res.json(todo.toJSON());
        });
    }, function(e){
        res.status(400).json(e);
    });
});
    


// DELETE /todos/:id
// _.without
app.delete('/todos/:id', middleware.requireAuthentication, function (req, res) {
    var todoIdDel = parseInt(req.params.id, 10);
    var where = {};
    where.id = todoIdDel;
    db.todo.destroy({where: where}).then(function (todo){
        if (todo){
            return res.status(200).json('Task with id ' + todoIdDel +' deleted!' );
        } else {
            return res.status(404).send();
        }
    }, function (e){
        res.status(500).send();
    });
});

// PUT /todos/:id

app.put('/todos/:id', middleware.requireAuthentication, function (req, res) {
    var todoId = parseInt(req.params.id, 10);
    var body = _.pick(req.body, 'description', 'completed');
    var attributes = {};
    

    if (body.hasOwnProperty('completed')) {
        attributes.completed = body.completed;
       // console.log(validAttributes.completed);
    }
    
    if (body.hasOwnProperty('description')) {
        attributes.description = body.description;
    }
    
    db.todo.findById(todoId).then(function (todo) {
        if (todo) {
            todo.update(attributes).then(function (todo) {
                res.json(todo.toJSON());
            }, function (e) {
                res.status(400).json(e);
            });
        } else {
            res.status(404).send();
        }
    }, function() {
        res.status(500).send();
    })
    
});

// POST /users
app.post('/users', function(req, res) {
    var body = req.body;
    
    body = _.pick(body, 'email', 'password');
    
    db.user.create(body).then(function (user){
        res.json(user.toPublicJSON());
    }).catch(function (e){
        return res.status(400).json(e);
    });
});

// POST /users/login

app.post('/users/login', function(req, res) {
    var body = req.body;
    var where = {};
    
    body = _.pick(body, 'email', 'password');
    
    db.user.authenticate(body).then(function (user){
        var token = user.generateToken('authentication');
        
        if (token) {
            res.header('Auth', token).json(user.toPublicJSON());    
        } else {
            res.status(401).send();    
        }
        
    }, function (){
        res.status(401).send();
    });
    
});


db.sequelize.sync({force: true}).then(function () {
    app.listen(PORT, function (){
        console.log('Express listening on port ' + PORT + '!');
    });
});

