"use strict"

const mysql = require('mysql');
const logger = require('winston');

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
		logger.warn('Db connection pool not initialized');
		return;
	};
	logger.info('Closing db connection');
	pool.end();  

	pool = '';
};

exports.initConnectionPool = initConnectionPool;
exports.closeConnectionPool = closeConnectionPool;