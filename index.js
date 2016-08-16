var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var User = require('./models/user');
var Message = require('./models/message');

var app = express();
var bcrypt = require('bcrypt');
var passport = require ('passport');
var jsonParser = bodyParser.json();
var BasicStrategy = require('passport-http').BasicStrategy;

var strategy = new BasicStrategy(function(username, password, callback) {
    User.findOne({
        username: username
    }, function (err, user) {
        if (err) {
            callback(err);
            return;
        }

        if (!user) {
            return callback(null, false, {
                message: 'Incorrect username.'
            });
        }

        user.validatePassword(password, function(err, isValid) {
            if (err) {
                return callback(err);
            }

            if (!isValid) {
                return callback(null, false, {
                    message: 'Incorrect password.'
                });
            }
            return callback(null, user);
        });
    });
});

passport.use(strategy);


app.use(passport.initialize());


app.get('/users', function(req, res) {
    User.find().then(function(users) {
        //console.log(users);
        res.redirect(
            'http://google.com'
        )
        //res.json(users);
    });
});
//more comments // ADD USER
app.post('/users', jsonParser, function(req, res) {
        if (!req.body) {
            return res.status(400).json({
                message: "No request body"
            });
        }

        if (!('username' in req.body)) {
            return res.status(422).json({
                message: 'Missing field: username'
            });
        }

        var username = req.body.username

        if (typeof username !== 'string') {
            return res.status(422).json({
                message: 'Incorrect field type: username'
            });
        }

        username = username.trim();

            if (username === '') {
        return res.status(422).json({
            message: 'Incorrect field length: username'
        });
    }
    if (!('password' in req.body)) {
        return res.status(422).json({
            message: 'Missing field: password'
        });
    }

    var password = req.body.password;

    if (typeof password !== 'string') {
        return res.status(422).json({
            message: 'Incorrect field type: password'
        });
    }

    password = password.trim();

    if (password === '') {
        return res.status(422).json({
            message: 'Incorrect field length: password'
        });
    }

    bcrypt.genSalt(10, function(err, salt) {
        if (err) {
            return res.status(500).json({
                message: 'Internal server error'
            });
        }

        bcrypt.hash(password, salt, function(err, hash) {
            if (err) {
                return res.status(500).json({
                    message: 'Internal server error'
                });
            }

    var user = new User({
        username: username,
        password: hash
    });

    user.save(function(err) {
        if (err) {
            return res.status(500).json({
                message: 'Internal server error'
            });
        }

        return res.status(201).json({});

app.get('/users/:userId', function(req, res) {
    User.findOneById({
        _id: req.params.userId
    }).then(function(user) {
        if (!user) {
            res.status(404).json({
                message: 'User not found'
            });
            return;
        }
        res.json(user);
    }).catch(function(err) {
        console.log(err);
        res.status(500).send({
            message: 'Internal server error'
        });
    });
});

app.put('/users/:userId', jsonParser, function(req, res) {
    if (!req.body) {
        return res.status(400).json({
            message: "No request body"
        });
    }

    if (!('username' in req.body)) {
        return res.status(422).json({
            message: 'Missing field: username'
        });
    }

    if (typeof req.body.username !== 'string') {
        return res.status(422).json({
            message: 'Incorrect field type: username'
        });
    }

    User.findOneAndUpdate({
        _id: req.params.userId
    }, {
        username: req.body.username
    }, {
        upsert: true
    }).then(function(user) {
        res.status(200).json({});
    }).catch(function(err) {
        console.log(err);
        res.status(500).send({
            message: 'Internal server error'
        });
    });
});

app.delete('/users/:userId', function(req, res) {
    User.findOneAndRemove({
        _id: req.params.userId
    }).then(function(user) {
        if (!user) {
            res.status(404).json({
                message: 'User not found'
            });
            return;
        }
        res.status(200).json({});
    }).catch(function(err) {
        console.log(err);
        res.status(500).send({
            message: 'Internal server error'
        });
    });

});

app.get('/messages', passport.authenticate('basic', {session: false}), function(req, res) {
    var filter = {};
    if ('to' in req.query == req.user) {
        filter.to = req.query.to;
    }
    if ('from' in req.query == req.user) {
        filter.from = req.query.from;
    }
    Message.find(filter)
        .populate('from')
        .populate('to')
        .then(function(messages) {
            res.json(messages);
        });
        //if(username !== Mes)
});

app.post('/messages', /*passport.authenticate('basic', {session: false}),*/ jsonParser, function(req, res) {
    if (req.body.from !== username) {
        res('Cannot send a message using a different username');
    }

    if (!req.body) {
        return res.status(400).json({
            message: "No request body"
        });
    }

    if (!('text' in req.body)) {
        return res.status(422).json({
            message: 'Missing field: text'
        });
    }

    if (typeof req.body.text !== 'string') {
        return res.status(422).json({
            message: 'Incorrect field type: text'
        });
    }

    if (!('to' in req.body)) {
        return res.status(422).json({
            message: 'Missing field: to'
        });
    }

    if (typeof req.body.to !== 'string') {
        return res.status(422).json({
            message: 'Incorrect field type: to'
        });
    }

    if (!('from' in req.body)) {
        return res.status(422).json({
            message: 'Missing field: from'
        });
    }

    if (typeof req.body.from !== 'string') {
        return res.status(422).json({
            message: 'Incorrect field type: from'
        });
    }

    var message = new Message({
        from: req.body.username,
        to: req.body.to,
        text: req.body.text
    });

    var findFrom = User.findOne({
        _id: message.from
    });
    var findTo = User.findOne({
        _id: message.to
    });

    return Promise.all([findFrom, findTo]).then(function(results) {
        if (!results[0]) {
            res.status(422).json({
                message: 'Incorrect field value: from'
            });
            return null;
        }
        else if (!results[1]) {
            res.status(422).json({
                message: 'Incorrect field value: to'
            });
            return null;
        }
        else {
            return message.save()
        }
    }).then(function(user) {
        if (!user) {
            // Incorrect field values - handled above.
            return;
        }
        res.location('/messages/' + message._id).status(201).json({});
    }).catch(function(err) {
        //console.log(err);
        res.status(500).send({
            message: 'Internal server error'
        });
    });
});

app.get('/messages/:messageId', function(req, res) {
    Message.findOne({
        _id: req.params.messageId
    })
    .populate('from')
    .populate('to')
    .then(function(message) {
        if (!message) {
            res.status(404).json({
                message: 'Message not found'
            });
            return;
        }
        res.json(message);
    }).catch(function(err) {
        console.log(err);
        res.status(500).send({
            message: 'Internal server error'
        });
    });
});
});
});
});
});

mongoose.connect('mongodb://localhost/auth').then(function() {
    app.listen(8080);
});

// var runServer = function(callback) {
//     var databaseUri = global.databaseUri || 'mongodb://localhost/sup';
//     mongoose.connect(databaseUri).then(function() {
//         var server = app.listen(8080, function() {
//             console.log('Listening on localhost:8080');
//             if (callback) {
//                 callback(server);
//             }
//         });
//     });
// };

// if (require.main === module) {
//     runServer();
// };

// exports.app = app;
// exports.runServer = runServer;
