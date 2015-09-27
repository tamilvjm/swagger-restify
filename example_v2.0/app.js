'use strict';

var restify = require('restify'),
    swagger = require('../index'),
    api = require('./api');

var port = process.env.NODE_PORT || 8080;

var server = restify.createServer({
    name: 'configRest'
});

server.pre(restify.pre.userAgentConnection());
server.use(restify.bodyParser({ mapParams: false }));

restify.defaultResponseHeaders = function(data) {
    this.header('Access-Control-Allow-Origin', '*');
};

server.get('/login', api.login);
server.get('/hello', api.hello);

swagger.init(server, {
    swagger: '2.0', // or swaggerVersion as backward compatible
    info: {
        version: '1.0',
        title: 'Swagger 2.0 Restify example'
    },
    host: 'localhost:' + port,
    apis: ['./api.js', './api.coffee', './api.yml'],
    produces: [
        'application/json',
        'text/xml'
    ],
    consumes: [
        'application/json',
        'text/xml'
    ],

    // swagger-restify proprietary
    swaggerURL: '/swagger',
    swaggerJSON: '/api-docs.json',
    swaggerUI: './public'
});

server.listen(port);
console.log('server is ready on port', port);
