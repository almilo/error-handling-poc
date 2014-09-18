var express = require('express');
var _ = require('lodash');
var data = require('./data.json');

var start = 0, user, app = express();

app.use('/vendor', express.static(__dirname + '/bower_components'));
app.use('/assets', express.static(__dirname + '/assets'));
app.use(express.static(__dirname + '/src/app'));

app.get('/rest/service', function (req, res) {
    res.json(data);
});

app.get('/rest/items', function (req, res) {
    if (req.param('fail')) {
        res.status(500).send();
    } else if (user) {
        res.send(createItems(start, 10));
        start += 10;
    } else {
        res.status(401).send();
    }

    function createItems(start, number) {
        return _.map(new Array(number), function (value, index) {
            var id = start + index;
            return {
                id: id,
                name: 'Item ' + id
            };
        });
    }
});

app.post('/rest/login', function (req, res) {
    res.send(user = 'Alberto');
});

app.post('/rest/logout', function (req, res) {
    res.send(user = undefined);
});

app.get('/rest/user', function (req, res) {
    res.send(user);
});

var server = app.listen(3333, function () {
    console.log('Listening on port %d', server.address().port);
});
