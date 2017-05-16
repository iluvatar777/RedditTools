"use strict"

const mysql = require('mysql');
const logger = require('winston');
const Promise = require('bluebird');

let pool = '';

const initConnectionPool = function() {
	if (pool !== '') {
		logger.warn('Db connection pool already initialized');
		return;
	};

	logger.info('Creating db connection pool');
	pool = mysql.createPool({
		connectionLimit : 10,
		host : 'localhost',
		user : 'root'
		//password : 'datasoft123'
	});

	pool.on('connection', function (connection) {
		connection.query('USE RedditTools')
	});
};

const closeConnectionPool = function() {					// TODO not clean
	if (pool === '') {
		logger.info('Db connection pool not initialized for closing');
		return;
	};
	logger.info('Closing db connection');
	pool.end();

	pool = '';
};

const query = function(sql, params) {
	return new Promise(function(resolve, reject) {
		if (pool === '') {
			reject('Query error - Db connection pool not initialized'); // TODO make js error?
		};


		logger.debug("Query: " + sql + " Params: " + JSON.stringify(params));
		pool.query(sql, params, function(err, rows, fields) {
				if (err) reject(err);

				resolve(rows, fields);
			});

	});
};


const postResultInsert = function(postPage){
	const sql = "CALL CommentPageInsert(?,?,?,?,?,?,?,?,?,?,?,?,?,?)";		// TODO doesn't seem to handle null... e.g. percentup=50
	//"sSincePost":97808,"time":1493757988723

	const params = [
		postPage.fullname,
		postPage.subreddit,
		postPage.author,
		postPage.title,
		postPage.domain,
		postPage.isNSFW,
		postPage.isSpoiler,

		postPage.time,
		postPage.sSincePost,

		postPage.score,
		postPage.up,
		postPage.down,
		postPage.percentUp,
		postPage.comments
	];

	return query(sql, params)
}

const test = function() {
	initConnectionPool();

	query('SELECT ? + ? AS solution', [4,5])
	.then(function(rows, fields) {
		logger.info('test succeeded. rows:' + JSON.stringify(rows));
	})
	.catch(function(err) {
		logger.error('test failed:' + err);
	})
	.finally(function() {
		closeConnectionPool();
	});

};

initConnectionPool();	// TODO move this elsewhere

exports.initConnectionPool = initConnectionPool;
exports.closeConnectionPool = closeConnectionPool;
exports.postResultInsert = postResultInsert;
exports.query = query;
exports.test = test;