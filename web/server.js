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
server.pre(restify.pre.sanitizePath());
//server.use(restify.plugins.queryParser());
//server.use(restify.plugins.bodyParser());


const postQuery = function(req, res, next) {
	const sql = '	SELECT p.fullname, p.subreddit,\
					COUNT(p.fullname) AS dataPoints\
					FROM postdata d\
					JOIN post p\
					ON d.fullname = p.fullname\
					GROUP BY p.fullname\
					HAVING dataPoints >= ?\
					ORDER BY p.subreddit, datapoints DESC;';
	logger.debug('get posts');

	return db.query(sql, [req.params.minCount], req.params.minCount)
	.then(function(data) {

		let datapoints = [];

		for (let i = 0; i < data.rows.length; i++) {
			datapoints.push({fullname : data.rows[i].fullname, subreddit : data.rows[i].subreddit, count : data.rows[i].dataPoints});
		}

		res.send(JSON.stringify(datapoints));
	})
	.catch(function(err) {
		logger.warn(err);
	})
	.finally(function() {
		logger.debug('posts retrieved from db, sending to client');
		return next();

	})
};


server.get('/echo/:name', function (req, res, next) {
	res.send(req.params);
	return next();
});

server.get('/api/postdata/:fullname', function (req, res, next) {
	const sql = 'SELECT * FROM postdata WHERE fullname = ?';
	logger.debug('get postdata for ' + req.params.fullname);

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
		logger.error(err);
	})
	.finally(function() {
		logger.debug('postdata' + req.params.fullname + 'retrieved from db, sending to client');
		return next();

	})
});

server.get('/api/posts', function (req, res, next) {
	req.params.minCount = 50;
	postQuery(req, res, next);
});
server.get('/api/posts/:minCount', postQuery);


server.get(/\/?.*/, restify.plugins.serveStatic({
	directory: __dirname + '/static',
	default: 'index.htm',
	appendRequestPath: false
}));

server.listen(config.port, function () {
	logger.info('Web Server listening at ' + server.url);
	logger.info('dir: ' + __dirname + '/static');
});