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
	  host            : 'localhost',
	  user            : 'root'
	  //password        : 'datasoft123'
	});
};

const closeConnectionPool = function() {					// TODO not clean
	if (pool === '') {
		logger.init('Db connection pool not initialized for closing');
		return;
	};
	logger.info('Closing db connection');
	pool.end();  

	pool = '';
};

const query = function(sql) {
	return new Promise(function(resolve, reject) {
		if (pool === '') {
			reject('Query error - Db connection pool not initialized'); // TODO make js error?
		};

		pool.query(sql, function(err, rows, fields) {
  			if (err) reject(err);

  			resolve(rows, fields);
  		});

	});
};

exports.initConnectionPool = initConnectionPool;
exports.closeConnectionPool = closeConnectionPool;
exports.query = query;

const test = function() {
	initConnectionPool();									// TODO use Promise.using

	query('SELECT 1 + 1 AS solution')
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

test();