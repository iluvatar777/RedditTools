"use strict"

const restify = require('restify');
const logger = require('../logger.js');
const Promise = require('bluebird');

const config = require('config').get('Server');
const db = require("../dbhandler.js");

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

server.get('/api/postdata/:fullname', function (req, res, next) {
	const sql = 'SELECT * FROM postdata WHERE fullname = ?';
	logger.warn('get postdata for ' + req.params.fullname);

	return db.query(sql, [req.params.fullname], req.params.fullname)
	.then(function(data) {

		let datapoints = [];
		for (let i = 0; i < data.rows.length; i++) {
			datapoints.push({x : data.rows[i].sSincePost,y : data.rows[i].score});
		}

		const dataset = [{
			lable : req.params.fullname,
			data : datapoints
		}];


		res.send(JSON.stringify(dataset));
	})
	.catch(function(err) {
		logger.warn(err);
	})
	.finally(function() {
		logger.warn('finally');
		return next();

	})
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

