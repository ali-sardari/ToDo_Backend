'use strict';

var express = require('express'),
    path = require('path'),
    jsonfile = require('jsonfile'),
    bodyParser = require('body-parser'),
    uuid = require('node-uuid'),
    app = express();

global.__base_data = path.resolve('./data');

var data_json_path = global.__base_data + '/data.json';

var _getDataFromJsonFile = () => jsonfile.readFileSync(data_json_path);

app.use(bodyParser.json());

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});


var prefix_api = "/api/v1";

app.get('/', (req, res) => {
    var data = _getDataFromJsonFile();
    res.send("Hello!!")
});

app.get(prefix_api + '/todo/list', (req, res) => {
    var data = _getDataFromJsonFile();
    res.json(data)
});

app.get(prefix_api + '/todo/get/:id', (req, res) => {
    var data = _getDataFromJsonFile();

    var result = null;

    data.forEach(function (item) {
        if (item.id === req.params.id) {
            result = item
        }
    });

    if (result) {
        res.json(result)
    } else {
        res.status(404).send({ data: "Not found!" });
    }
});

app.post(prefix_api + '/todo/add', (req, res) => {
    const id = uuid.v4();

    console.log("id -> " + id);
    console.log("title -> " + req.body.title);
    console.log("priority -> " + req.body.priority);

    var data = _getDataFromJsonFile();
    data.push({
        id: id,
        title: req.body.title,
        priority: req.body.priority
    });

    jsonfile.writeFile(data_json_path, data, function (err) {
        if (err) {
            res.status(500).send({
                type: 'INTERNAL_SERVER_ERROR',
                description: 'Internal server error'
            });
        }
        else {
            res.status(200).send({
                result: id
            });
        }
    });
});

app.patch(prefix_api + '/todo/update-priority/:id', (req, res) => {
    const id = req.params.id;

    var data = _getDataFromJsonFile();

    data.forEach((item) => {
        if (item.id === id) {
            item.priority = req.body.priority;

            jsonfile.writeFile(data_json_path, data, (err) => {
                if (err) {
                    res.status(500).send({
                        type: 'INTERNAL_SERVER_ERROR',
                        description: 'Internal server error'
                    });
                }
                else {
                    res.status(200).send({ item });
                }
            });
        }
    });
});

app.delete(prefix_api + '/todo/delete/:id', (req, res) => {
    const id = req.params.id;

    var data = _getDataFromJsonFile();

    const index = data.findIndex((item) => item.id === id);
    if (index > -1) {
        data.splice(index, 1);
    }

    jsonfile.writeFile(data_json_path, data, (err) => {
        if (err) {
            res.status(500).send({
                type: 'INTERNAL_SERVER_ERROR',
                description: 'Internal server error'
            });
        }
        else {
            res.status(200).send({ data });
        }
    });
});


//---app.listen---------------------------------------------------------



var server = app.listen(process.env.PORT || 3000,function () {
    var host = server.address().address;
    var port = server.address().port;
    host = host === '::' ? 'localhost' : host;
    console.log("running at http://%s:%s", host, port);

    // res.render()
});
