const User = require("./user.js");
const Task = require("./task.js");
var fs = require('fs');
bodyParser = require('body-parser');
const express = require("express");
const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
const valueAuthentication = 'authentication'; 

createFileWX('./todo.json');
var jsonDatabase = JSON.parse(fs.readFileSync('./todo.json', 'utf8'));

app.get('/', function (req, res) {
    res.render('login', { errorLogin: false, errorSignup: false });
});

app.post('/register', function (req, res) {
    let authentication = req.body.authentication;
    let email = req.body.email;
    let password = req.body.password;

    for (var user of jsonDatabase['Users']) {
        if (email == user.username) {
            res.render('login', { errorLogin: false, errorSignup: true });
            return;
        }

    }
    if (authentication != valueAuthentication) {
        res.render('login', { errorLogin: false, errorSignup: true });
    }
    else {
        userAdded = new User(email, password);
        jsonDatabase['Users'].push(userAdded);
        fs.writeFileSync('./todo.json', JSON.stringify(jsonDatabase));
        res.render('todo', { email: email, taskDatabase: jsonDatabase['Tasks'] });
    }

});

app.post('/login', function (req, res) {
    var email = req.body.email;
    var password = req.body.password;
    for (var user of jsonDatabase['Users']) {
        if (email == user.username) {
            if (password == user.password) {
                res.redirect(307, "/todo");
                return;
            }
            else {
                signInError = true;
            }

        }

    }
    res.render('login', { errorLogin: true, errorSignup: false });
});

app.post('/todo', function (req, res) {
    var email = req.body.email;
    res.render('todo', { email: email, taskDatabase: jsonDatabase['Tasks'] });
});

app.post('/unfinish', function (req, res) {
    var id = req.body.postID;
    var email = req.body.email;
    for (var i = 0; i < jsonDatabase['Tasks'].length; i++) {
        if (jsonDatabase['Tasks'][i].id == id) {
            jsonDatabase['Tasks'][i].done = false;
        }
    }
    fs.writeFileSync('./todo.json', JSON.stringify(jsonDatabase));
    res.redirect(307, "/todo");

});

app.post('/abandonorcomplete', function (req, res) {
    var id = req.body.postID;
    var abandon = req.body.abandon;
    var email = req.body.email;

    for (var i = 0; i < jsonDatabase['Tasks'].length; i++) {
        if (jsonDatabase['Tasks'][i].id == id) {
            var index = i;
        }
    }
    if (abandon) {
        delete jsonDatabase['Tasks'][index].owner;

    } else {
        jsonDatabase['Tasks'][index].done = true;

    }
    fs.writeFileSync('./todo.json', JSON.stringify(jsonDatabase));
    res.redirect(307, "/todo");
});

app.post('/claim', function (req, res) {

    var id = req.body.postID;
    var email = req.body.currentUser;
    var index = findJsonIndex(jsonDatabase['Tasks'], id);
    jsonDatabase['Tasks'][index].owner = email;
    fs.writeFileSync('./todo.json', JSON.stringify(jsonDatabase));
    res.render('todo', { email: email, taskDatabase: jsonDatabase['Tasks'] });


});

app.post('/addtask', function (req, res) {
    let entry = req.body.newTodo;
    let user = req.body.currentUser;

    let jsonSize = jsonDatabase['Tasks'].length;

    let nextIndex = (jsonDatabase['Tasks'][jsonSize - 1]['id']) + 1;

    taskAdded = new Task(nextIndex, entry, user, user, false, false);
    jsonDatabase['Tasks'].push(taskAdded);
    fs.writeFileSync('./todo.json', JSON.stringify(jsonDatabase));
    res.render('todo', { email: user, taskDatabase: jsonDatabase['Tasks'] });

});

app.post('/purge', function (req, res) {
    let user = req.body.currentUser;


    for (var i = 0; i < jsonDatabase['Tasks'].length; i++) {
        if (jsonDatabase['Tasks'][i].owner == user && jsonDatabase['Tasks'][i].done == true) {
            jsonDatabase['Tasks'][i].cleared = true;
        }

    }
    fs.writeFileSync('./todo.json', JSON.stringify(jsonDatabase));
    res.render('todo', { email: user, taskDatabase: jsonDatabase['Tasks'] });

});

app.get('/logout', function (req, res) {
    res.redirect(307, "/");
});

function findJsonIndex(json, id) {
    for (var i = 0; i < json.length; i++) {
        if (json[i].id == id) {
            return i;
        }
    }
    return -1;
}

function createFileWX(filename) {
    json = createJsonString();
    try {
        fs.writeFileSync(filename, json, { flag: 'wx' });
    }
    catch (errs) {

    }

}

function createJsonString() {
    var jsonStoreOjbect = {
        Users: [],
        Tasks: []
    };
    jsonStoreOjbect.Users.push({
        username: "user1",
        password: "pass1"
    });
    jsonStoreOjbect.Users.push({
        username: "user2",
        password: "pass2"
    });
    jsonStoreOjbect.Users.push({
        username: "user3",
        password: "pass3"
    });

    jsonStoreOjbect.Users.push({
        username: "user4",
        password: "pass4"
    });
    jsonStoreOjbect.Users.push({
        username: "user5",
        password: "pass5"
    });


    jsonStoreOjbect.Tasks.push({
        id: 1,
        name: "claimed by user1 and unfinished",
        owner: null,
        creator: "user1",
        done: false,
        cleared: false
    });
    jsonStoreOjbect.Tasks.push({
        id: 2,
        name: "claimed by user2 and unfinished",
        owner: "user2",
        creator: "user2",
        done: false,
        cleared: false
    });
    jsonStoreOjbect.Tasks.push({
        id: 3,
        name: "claimed by user4 and finished",
        owner: "user4",
        creator: "user3",
        done: true,
        cleared: false
    });
    jsonStoreOjbect.Tasks.push({
        id: 4,
        name: "claimed by user3 and finished",
        owner: "user3",
        creator: "user4",
        done: true,
        cleared: false
    });
    jsonStoreOjbect.Tasks.push({
        id: 5,
        name: "claimed by user5 and finished",
        owner: "user5",
        creator: "user5",
        done: false,
        cleared: false
    });
    var jsonString = JSON.stringify(jsonStoreOjbect);
    return jsonString;
};