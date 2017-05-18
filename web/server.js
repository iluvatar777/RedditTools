"use strict"

const restify = require('restify');
const logger = require('winston');
const Promise = require('bluebird');

const config = require('config').get('Server');


const server = restify.createServer({
	name: 'reddit tools',
	version: '1.0.0'
});
server.use(restify.plugins.acceptParser(server.acceptable));
//server.use(restify.plugins.queryParser());
//server.use(restify.plugins.bodyParser());


server.get('/echo/:name', function (req, res, next) {
	res.send(req.params);
	return next();
});

server.get(/\/?.*/, restify.plugins.serveStatic({
  directory: __dirname + '/static',
  default: 'index.htm',
  appendRequestPath: false
}));

server.listen(config.port, function () {
	logger.info('Web Server listening at ' + server.url);
	logger.info('dir: ' + __dirname + '/static');
});